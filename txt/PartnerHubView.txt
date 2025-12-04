// components/views/megadashboard/ecosystem/PartnerHubView.tsx
import React, { useState, useEffect, useCallback, createContext, useContext, useReducer } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

// --- Existing Interfaces (Expanded) ---
interface Partner {
    id: string;
    name: string;
    tier: 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
    status: 'Active' | 'Pending Review' | 'Onboarding' | 'Inactive';
    revenueGenerated: number; // YTD Revenue
    onboardingStatus: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
    joinDate: string; // ISO date string
    lastActivity: string; // ISO date string
    contactInfo: PartnerContactInfo;
    description: string;
    performanceMetrics: PartnerPerformanceMetrics;
    marketingBudget: number;
    supportTickets: number;
    geography: string;
    industryFocus: string[];
    website: string;
    complianceScore: number; // 0-100
    riskAssessmentScore: number; // 0-100, calculated by AI
    notes: string;
    logoUrl?: string;
}

interface PartnerContactInfo {
    mainContactName: string;
    mainContactEmail: string;
    mainContactPhone: string;
    headquartersAddress: string;
    country: string;
}

interface PartnerPerformanceMetrics {
    dealsClosed: number;
    leadsGenerated: number;
    conversionRate: number; // percentage
    customerSatisfaction: number; // 1-5 rating
    trainingCompletion: number; // percentage of modules completed
}

interface PartnerDeal {
    id: string;
    partnerId: string;
    dealName: string;
    value: number;
    stage: 'Prospecting' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
    closeDate: string; // ISO date string
    description: string;
    expectedRevenueShare: number;
    dealOwner: string;
    lastUpdate: string; // ISO date string
    priority: 'High' | 'Medium' | 'Low';
    productsInvolved: string[];
}

interface PartnerContact {
    id: string;
    partnerId: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    lastContactDate: string; // ISO date string
    notes: string;
}

interface MarketingResource {
    id: string;
    title: string;
    type: 'Brochure' | 'Case Study' | 'Whitepaper' | 'Presentation' | 'Image Pack' | 'Video';
    category: 'Product A' | 'Product B' | 'General Marketing' | 'Brand Guidelines';
    url: string;
    uploadDate: string; // ISO date string
    version: string;
    description: string;
}

interface TrainingModule {
    id: string;
    title: string;
    category: 'Sales' | 'Technical' | 'Product' | 'Compliance';
    url: string;
    durationMinutes: number;
    completionStatus: 'Not Started' | 'In Progress' | 'Completed';
    dueDate?: string; // ISO date string
    description: string;
}

interface Notification {
    id: string;
    type: 'Alert' | 'Update' | 'Info' | 'Reminder';
    message: string;
    date: string; // ISO date string
    read: boolean;
    targetPartnerId?: string; // Optional: if notification is for a specific partner
    priority: 'High' | 'Medium' | 'Low';
    actionLink?: string;
}

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    status: 'Pending' | 'In Progress' | 'Completed' | 'Skipped';
    dueDate?: string; // ISO date string
    assignedTo: string;
    documentsRequired: string[];
}

interface AuditLogEntry {
    id: string;
    timestamp: string; // ISO date string
    userId: string;
    action: string;
    targetEntity: 'Partner' | 'Deal' | 'Contact' | 'Resource';
    targetEntityId: string;
    details: string;
}

interface RevenueForecast {
    quarter: string; // e.g., 'Q1 2024'
    expectedRevenue: number;
    actualRevenue?: number;
    variance?: number;
}

interface AIInsight {
    id: string;
    type: 'Risk' | 'Performance' | 'Recommendation' | 'Content Suggestion';
    summary: string;
    details: string;
    dateGenerated: string; // ISO date string
    relatedPartnerId?: string;
    confidenceScore?: number; // 0-1
}

// --- Utility Functions ---
export const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export const formatDate = (isoString: string, includeTime = false): string => {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...(includeTime && { hour: '2-digit', minute: '2-digit' })
    };
    return new Date(isoString).toLocaleDateString('en-US', options);
};

export const calculateDaysDifference = (date1: string, date2: string): number => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getTierColor = (tier: Partner['tier']): string => {
    switch (tier) {
        case 'Platinum': return 'text-purple-400';
        case 'Gold': return 'text-yellow-400';
        case 'Silver': return 'text-gray-400';
        case 'Bronze': return 'text-orange-400';
        default: return 'text-gray-400';
    }
};

export const getStatusColor = (status: Partner['status']): string => {
    switch (status) {
        case 'Active': return 'text-green-400';
        case 'Pending Review': return 'text-yellow-400';
        case 'Onboarding': return 'text-blue-400';
        case 'Inactive': return 'text-red-400';
        default: return 'text-gray-400';
    }
};

export const getOnboardingStatusColor = (status: OnboardingStep['status'] | TrainingModule['completionStatus']): string => {
    switch (status) {
        case 'Completed': return 'text-green-400';
        case 'In Progress': return 'text-blue-400';
        case 'Pending': return 'text-yellow-400';
        case 'Not Started': return 'text-gray-400';
        case 'Delayed': return 'text-orange-400'; // Added for partner onboarding status
        case 'Skipped': return 'text-red-400';
        default: return 'text-gray-400';
    }
};

export const getDealStageColor = (stage: PartnerDeal['stage']): string => {
    switch (stage) {
        case 'Closed Won': return 'bg-green-600';
        case 'Closed Lost': return 'bg-red-600';
        case 'Negotiation': return 'bg-yellow-600';
        case 'Proposal': return 'bg-blue-600';
        case 'Qualification': return 'bg-indigo-600';
        case 'Prospecting': return 'bg-gray-600';
        default: return 'bg-gray-600';
    }
};

// --- Mock Data (Expanded Significantly) ---
const mockPartnerGen = (id: number): Partner => {
    const tiers: Partner['tier'][] = ['Platinum', 'Gold', 'Silver', 'Bronze'];
    const statuses: Partner['status'][] = ['Active', 'Pending Review', 'Onboarding', 'Inactive'];
    const onboardingStatuses: Partner['onboardingStatus'][] = ['Not Started', 'In Progress', 'Completed', 'Delayed'];
    const countries = ['USA', 'Canada', 'UK', 'Germany', 'Australia', 'India', 'Japan'];
    const industries = ['Tech', 'Fintech', 'Healthcare', 'Manufacturing', 'Retail', 'Education', 'Logistics', 'Consulting'];

    const joinDate = new Date(Date.now() - Math.random() * 365 * 2 * 24 * 60 * 60 * 1000); // Up to 2 years ago
    const lastActivity = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Up to 30 days ago

    const name = `Partner Co. ${id}`;
    const contactName = `John Doe ${id}`;
    const email = `john.doe.${id}@partnerco.com`;
    const phone = `+1-555-${String(1000 + id).padStart(4, '0')}`;
    const address = `${id} Main St, City, State, 12345`;
    const country = countries[Math.floor(Math.random() * countries.length)];
    const primaryIndustry = industries[Math.floor(Math.random() * industries.length)];
    const secondaryIndustry = industries.filter(i => i !== primaryIndustry)[Math.floor(Math.random() * (industries.length - 1))];
    const tier = tiers[Math.floor(Math.random() * tiers.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const onboardingStatus = onboardingStatuses[Math.floor(Math.random() * onboardingStatuses.length)];

    return {
        id: `p-${id}`,
        name: name,
        tier: tier,
        status: status,
        revenueGenerated: Math.floor(Math.random() * 500000) + 50000,
        onboardingStatus: onboardingStatus,
        joinDate: joinDate.toISOString(),
        lastActivity: lastActivity.toISOString(),
        contactInfo: {
            mainContactName: contactName,
            mainContactEmail: email,
            mainContactPhone: phone,
            headquartersAddress: address,
            country: country,
        },
        description: `Leading ${primaryIndustry} solutions provider. Focuses on innovation and customer satisfaction.`,
        performanceMetrics: {
            dealsClosed: Math.floor(Math.random() * 20),
            leadsGenerated: Math.floor(Math.random() * 100),
            conversionRate: parseFloat((Math.random() * 0.3 + 0.05).toFixed(2)), // 5-35%
            customerSatisfaction: Math.floor(Math.random() * 5) + 1,
            trainingCompletion: Math.floor(Math.random() * 100),
        },
        marketingBudget: Math.floor(Math.random() * 50000) + 5000,
        supportTickets: Math.floor(Math.random() * 50),
        geography: country,
        industryFocus: [primaryIndustry, secondaryIndustry],
        website: `https://www.${name.replace(/\s/g, '').toLowerCase()}.com`,
        complianceScore: Math.floor(Math.random() * 30) + 70, // 70-100
        riskAssessmentScore: Math.floor(Math.random() * 40) + 60, // 60-100
        notes: `Initial assessment completed. Potential for growth in ${primaryIndustry} sector.`,
        logoUrl: `https://via.placeholder.com/40x40?text=P${id}`
    };
};

const mockDealGen = (partnerId: string, id: number): PartnerDeal => {
    const stages: PartnerDeal['stage'][] = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
    const products = ['Product A', 'Product B', 'Service X', 'Service Y', 'Solution Z'];
    const priorities: PartnerDeal['priority'][] = ['High', 'Medium', 'Low'];

    const closeDate = new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000); // Up to 90 days in future
    const lastUpdate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Up to 30 days ago

    return {
        id: `d-${partnerId}-${id}`,
        partnerId: partnerId,
        dealName: `Project Alpha ${id} with ${partnerId}`,
        value: Math.floor(Math.random() * 100000) + 10000,
        stage: stages[Math.floor(Math.random() * stages.length)],
        closeDate: closeDate.toISOString(),
        description: `Detailed discussion for implementing ${products[0]} for a key client.`,
        expectedRevenueShare: parseFloat((Math.random() * 0.2 + 0.05).toFixed(2)), // 5-25%
        dealOwner: `Sales Rep ${Math.floor(Math.random() * 5) + 1}`,
        lastUpdate: lastUpdate.toISOString(),
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        productsInvolved: [products[Math.floor(Math.random() * products.length)], products[Math.floor(Math.random() * products.length)]].filter((v, i, a) => a.indexOf(v) === i), // Unique products
    };
};

const mockContactGen = (partnerId: string, id: number): PartnerContact => {
    const roles = ['CEO', 'CTO', 'Sales Manager', 'Marketing Lead', 'Project Manager', 'Accountant'];
    const lastContact = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000); // Up to 60 days ago
    return {
        id: `c-${partnerId}-${id}`,
        partnerId: partnerId,
        name: `Contact Person ${id} - ${partnerId}`,
        email: `contact.${id}@${partnerId.replace('p-', 'partner').toLowerCase()}.com`,
        phone: `+1-555-${String(2000 + id).padStart(4, '0')}`,
        role: roles[Math.floor(Math.random() * roles.length)],
        lastContactDate: lastContact.toISOString(),
        notes: `Key decision maker for technical integrations.`,
    };
};

const mockResourceGen = (id: number): MarketingResource => {
    const types: MarketingResource['type'][] = ['Brochure', 'Case Study', 'Whitepaper', 'Presentation', 'Image Pack', 'Video'];
    const categories: MarketingResource['category'][] = ['Product A', 'Product B', 'General Marketing', 'Brand Guidelines'];
    const uploadDate = new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000); // Up to 6 months ago

    return {
        id: `res-${id}`,
        title: `Marketing Guide: ${types[id % types.length]} for ${categories[id % categories.length]}`,
        type: types[id % types.length],
        category: categories[id % categories.length],
        url: `https://example.com/resources/resource-${id}.pdf`,
        uploadDate: uploadDate.toISOString(),
        version: `1.${Math.floor(Math.random() * 5)}`,
        description: `Comprehensive guide for partners on leveraging ${categories[id % categories.length]} assets.`,
    };
};

const mockTrainingGen = (id: number): TrainingModule => {
    const categories: TrainingModule['category'][] = ['Sales', 'Technical', 'Product', 'Compliance'];
    const statuses: TrainingModule['completionStatus'][] = ['Not Started', 'In Progress', 'Completed'];
    const dueDate = Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined;

    return {
        id: `train-${id}`,
        title: `Partner Training: ${categories[id % categories.length]} Fundamentals ${id}`,
        category: categories[id % categories.length],
        url: `https://example.com/training/module-${id}`,
        durationMinutes: Math.floor(Math.random() * 90) + 30,
        completionStatus: statuses[Math.floor(Math.random() * statuses.length)],
        dueDate: dueDate,
        description: `Essential training module for new partners covering ${categories[id % categories.length]} basics.`,
    };
};

const mockNotificationGen = (id: number, partnerId?: string): Notification => {
    const types: Notification['type'][] = ['Alert', 'Update', 'Info', 'Reminder'];
    const priorities: Notification['priority'][] = ['High', 'Medium', 'Low'];
    const messageTemplates = [
        "New deal registered for review with {partnerName}.",
        "Partner {partnerName} has completed onboarding step: Document Submission.",
        "System update: New AI features available in Partner Hub.",
        "Reminder: Q3 performance review for {partnerName} is due soon.",
        "Compliance alert for {partnerName}: Missing updated privacy policy.",
        "Marketing resource library updated with new product brochures.",
    ];
    const date = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days

    let msg = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
    if (partnerId) {
        const partner = MOCK_PARTNERS.find(p => p.id === partnerId);
        if (partner) msg = msg.replace(/{partnerName}/g, partner.name);
    } else {
        msg = msg.replace(/{partnerName}/g, 'a partner'); // Generic placeholder if no partnerId
    }


    return {
        id: `notif-${id}`,
        type: types[Math.floor(Math.random() * types.length)],
        message: msg,
        date: date.toISOString(),
        read: Math.random() > 0.5,
        targetPartnerId: partnerId,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        actionLink: Math.random() > 0.7 ? `/partner-hub/${partnerId}/deals` : undefined,
    };
};

const mockOnboardingStepGen = (id: number): OnboardingStep => {
    const titles = ['Contract Signing', 'Document Submission', 'System Access Setup', 'Initial Training', 'Marketing Kit Review', 'First Deal Registration'];
    const descriptions = [
        'Review and sign the partner agreement.',
        'Upload all required legal and financial documents.',
        'Set up access to partner portal and CRM systems.',
        'Complete mandatory product and sales training modules.',
        'Review and approve marketing materials and brand guidelines.',
        'Register your first potential deal through the partner portal.',
    ];
    const statuses: OnboardingStep['status'][] = ['Pending', 'In Progress', 'Completed', 'Skipped'];
    const assignedTo = ['Admin', 'Partner Contact', 'Legal Dept'];
    const documents = ['NDA', 'Reseller Agreement', 'W-9 Form', 'Bank Details'];
    const dueDate = Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined;

    return {
        id: `onboard-${id}`,
        title: titles[id % titles.length],
        description: descriptions[id % descriptions.length],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        dueDate: dueDate,
        assignedTo: assignedTo[Math.floor(Math.random() * assignedTo.length)],
        documentsRequired: [documents[Math.floor(Math.random() * documents.length)]],
    };
};

const mockAIInsightGen = (id: number, partnerId: string): AIInsight => {
    const types: AIInsight['type'][] = ['Risk', 'Performance', 'Recommendation', 'Content Suggestion'];
    const summaries = [
        `Risk analysis for ${partnerId} suggests moderate reputational risk due to recent news.`,
        `Performance of ${partnerId} shows strong growth in Product A sales.`,
        `Recommended training modules for ${partnerId}'s sales team: Advanced Product B.`,
        `Content suggestion for ${partnerId}: localized case study for the German market.`,
    ];
    const details = [
        'Recent media coverage indicates some negative customer feedback for their subsidiary. Advise close monitoring.',
        'Deals closed for Product A increased by 20% last quarter. Suggest promoting this success.',
        'AI identified gaps in technical sales knowledge. Assign specific training paths.',
        'Leverage existing templates and success stories to create a relevant market-specific piece.',
    ];
    const date = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000); // Last 90 days

    const type = types[Math.floor(Math.random() * types.length)];
    const summary = summaries[types.indexOf(type)].replace(/{partnerId}/g, partnerId);
    const detail = details[types.indexOf(type)];

    return {
        id: `ai-${id}`,
        type: type,
        summary: summary,
        details: detail,
        dateGenerated: date.toISOString(),
        relatedPartnerId: partnerId,
        confidenceScore: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2)), // 70-100%
    };
};

const mockAuditLogGen = (id: number): AuditLogEntry => {
    const users = ['admin@example.com', 'manager@example.com', 'partneradmin@example.com'];
    const actions = ['created', 'updated', 'deleted', 'reviewed', 'approved'];
    const targets: AuditLogEntry['targetEntity'][] = ['Partner', 'Deal', 'Contact', 'Resource'];
    const timestamp = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000); // Last year

    const targetType = targets[Math.floor(Math.random() * targets.length)];
    const targetId = `id-${Math.floor(Math.random() * 1000)}`;

    return {
        id: `audit-${id}`,
        timestamp: timestamp.toISOString(),
        userId: users[Math.floor(Math.random() * users.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        targetEntity: targetType,
        targetEntityId: targetId,
        details: `${targetType} ${targetId} was ${actions[Math.floor(Math.random() * actions.length)]} by ${users[Math.floor(Math.random() * users.length)]}.`,
    };
};

// Generate a large amount of mock data
const NUM_PARTNERS = 50;
const MOCK_PARTNERS: Partner[] = Array.from({ length: NUM_PARTNERS }, (_, i) => mockPartnerGen(i + 1));

const MOCK_DEALS: PartnerDeal[] = MOCK_PARTNERS.flatMap(partner =>
    Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, i) => mockDealGen(partner.id, i + 1))
);

const MOCK_CONTACTS: PartnerContact[] = MOCK_PARTNERS.flatMap(partner =>
    Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => mockContactGen(partner.id, i + 1))
);

const MOCK_RESOURCES: MarketingResource[] = Array.from({ length: 30 }, (_, i) => mockResourceGen(i + 1));

const MOCK_TRAINING_MODULES: TrainingModule[] = Array.from({ length: 20 }, (_, i) => mockTrainingGen(i + 1));

const MOCK_NOTIFICATIONS: Notification[] = Array.from({ length: 50 }, (_, i) =>
    mockNotificationGen(i + 1, Math.random() > 0.3 ? MOCK_PARTNERS[Math.floor(Math.random() * NUM_PARTNERS)].id : undefined)
);

const MOCK_ONBOARDING_STEPS: OnboardingStep[] = Array.from({ length: 10 }, (_, i) => mockOnboardingStepGen(i + 1));

const MOCK_AI_INSIGHTS: AIInsight[] = MOCK_PARTNERS.flatMap(partner =>
    Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => mockAIInsightGen(i + 1, partner.id))
);

const MOCK_AUDIT_LOGS: AuditLogEntry[] = Array.from({ length: 200 }, (_, i) => mockAuditLogGen(i + 1));

const MOCK_REVENUE_FORECASTS: RevenueForecast[] = [
    { quarter: 'Q1 2024', expectedRevenue: 1200000, actualRevenue: 1150000, variance: -50000 },
    { quarter: 'Q2 2024', expectedRevenue: 1300000, actualRevenue: 1350000, variance: 50000 },
    { quarter: 'Q3 2024', expectedRevenue: 1400000 },
    { quarter: 'Q4 2024', expectedRevenue: 1500000 },
];

// --- AI Service Wrapper ---
export const aiService = {
    generateContent: async (prompt: string, model: string = 'gemini-2.5-flash'): Promise<string> => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string }); // Changed to NEXT_PUBLIC for client-side
            const response = await ai.models.generateContent({ model, contents: prompt });
            return response.text;
        } catch (err) {
            console.error("AI Generation Error:", err);
            return "Error generating content. Please try again.";
        }
    },
    // Add more AI functions
    generateRiskAssessment: async (partnerName: string): Promise<string> => {
        const prompt = `Generate a brief business risk assessment for a potential new partner named "${partnerName}". Focus on potential reputational, financial, and integration risks. Provide a summary and bullet points.`;
        return aiService.generateContent(prompt);
    },
    generateMarketingCopy: async (productName: string, partnerName: string, targetAudience: string, tone: string): Promise<string> => {
        const prompt = `Generate engaging marketing copy for partner "${partnerName}" to promote "${productName}" to "${targetAudience}". The tone should be "${tone}". Include a catchy headline, 3-4 bullet points on benefits, and a call to action.`;
        return aiService.generateContent(prompt);
    },
    generatePerformanceSummary: async (partnerName: string, metrics: PartnerPerformanceMetrics): Promise<string> => {
        const prompt = `Based on the following metrics for partner "${partnerName}": Deals Closed: ${metrics.dealsClosed}, Leads Generated: ${metrics.leadsGenerated}, Conversion Rate: ${metrics.conversionRate * 100}%, Customer Satisfaction: ${metrics.customerSatisfaction}/5, Training Completion: ${metrics.trainingCompletion}%. Provide a concise performance summary and suggest 2-3 areas for improvement or growth.`;
        return aiService.generateContent(prompt);
    },
    recommendTraining: async (partnerName: string, currentTraining: string[]): Promise<string> => {
        const prompt = `Given that partner "${partnerName}" has completed training modules: ${currentTraining.join(', ')}. Suggest 3 new, relevant training modules they should prioritize to enhance their skills or sales performance.`;
        return aiService.generateContent(prompt);
    }
};

// --- State Management using Context and Reducers ---

// 1. Partner State
interface PartnerState {
    partners: Partner[];
    selectedPartnerId: string | null;
    filters: {
        tier: Partner['tier'] | 'All';
        status: Partner['status'] | 'All';
        search: string;
    };
    sort: {
        key: keyof Partner | null;
        direction: 'asc' | 'desc';
    };
    pagination: {
        currentPage: number;
        itemsPerPage: number;
    };
}

type PartnerAction =
    | { type: 'ADD_PARTNER'; payload: Partner }
    | { type: 'UPDATE_PARTNER'; payload: Partner }
    | { type: 'DELETE_PARTNER'; payload: string }
    | { type: 'SELECT_PARTNER'; payload: string | null }
    | { type: 'SET_FILTER'; payload: { key: keyof PartnerState['filters']; value: any } }
    | { type: 'SET_SORT'; payload: { key: keyof Partner | null; direction: 'asc' | 'desc' } }
    | { type: 'SET_PAGE'; payload: number }
    | { type: 'SET_PARTNERS'; payload: Partner[] };

const initialPartnerState: PartnerState = {
    partners: MOCK_PARTNERS,
    selectedPartnerId: null,
    filters: { tier: 'All', status: 'All', search: '' },
    sort: { key: null, direction: 'asc' },
    pagination: { currentPage: 1, itemsPerPage: 10 },
};

export const partnerReducer = (state: PartnerState, action: PartnerAction): PartnerState => {
    switch (action.type) {
        case 'ADD_PARTNER':
            return { ...state, partners: [...state.partners, action.payload] };
        case 'UPDATE_PARTNER':
            return {
                ...state,
                partners: state.partners.map(p =>
                    p.id === action.payload.id ? action.payload : p
                ),
                selectedPartnerId: state.selectedPartnerId === action.payload.id ? action.payload.id : state.selectedPartnerId // Ensure selected partner is updated if it's the one
            };
        case 'DELETE_PARTNER':
            return {
                ...state,
                partners: state.partners.filter(p => p.id !== action.payload),
                selectedPartnerId: state.selectedPartnerId === action.payload ? null : state.selectedPartnerId,
            };
        case 'SELECT_PARTNER':
            return { ...state, selectedPartnerId: action.payload };
        case 'SET_FILTER':
            return { ...state, filters: { ...state.filters, [action.payload.key]: action.payload.value }, pagination: { ...state.pagination, currentPage: 1 } };
        case 'SET_SORT':
            return { ...state, sort: action.payload, pagination: { ...state.pagination, currentPage: 1 } };
        case 'SET_PAGE':
            return { ...state, pagination: { ...state.pagination, currentPage: action.payload } };
        case 'SET_PARTNERS':
            return { ...state, partners: action.payload }; // For initial load or data refresh
        default:
            return state;
    }
};

export const PartnerContext = createContext<{
    state: PartnerState;
    dispatch: React.Dispatch<PartnerAction>;
    filteredAndSortedPartners: Partner[];
    paginatedPartners: Partner[];
    currentPartner: Partner | undefined;
    totalPages: number;
} | undefined>(undefined);

export const PartnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(partnerReducer, initialPartnerState);

    const filteredPartners = state.partners.filter(p => {
        const matchesTier = state.filters.tier === 'All' || p.tier === state.filters.tier;
        const matchesStatus = state.filters.status === 'All' || p.status === state.filters.status;
        const matchesSearch = p.name.toLowerCase().includes(state.filters.search.toLowerCase()) ||
            p.description.toLowerCase().includes(state.filters.search.toLowerCase()) ||
            p.contactInfo.mainContactEmail.toLowerCase().includes(state.filters.search.toLowerCase());
        return matchesTier && matchesStatus && matchesSearch;
    });

    const sortedPartners = [...filteredPartners].sort((a, b) => {
        if (!state.sort.key) return 0;
        const aValue = a[state.sort.key];
        const bValue = b[state.sort.key];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return state.sort.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return state.sort.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        // Fallback for other types or if comparison fails
        return 0;
    });

    const totalPages = Math.ceil(sortedPartners.length / state.pagination.itemsPerPage);
    const startIndex = (state.pagination.currentPage - 1) * state.pagination.itemsPerPage;
    const paginatedPartners = sortedPartners.slice(startIndex, startIndex + state.pagination.itemsPerPage);

    const currentPartner = state.selectedPartnerId ? state.partners.find(p => p.id === state.selectedPartnerId) : undefined;

    const value = { state, dispatch, filteredAndSortedPartners: sortedPartners, paginatedPartners, currentPartner, totalPages };

    return <PartnerContext.Provider value={value}>{children}</PartnerContext.Provider>;
};

export const usePartners = () => {
    const context = useContext(PartnerContext);
    if (context === undefined) {
        throw new Error('usePartners must be used within a PartnerProvider');
    }
    return context;
};

// 2. Deal State
interface DealState {
    deals: PartnerDeal[];
    selectedDealId: string | null;
}

type DealAction =
    | { type: 'ADD_DEAL'; payload: PartnerDeal }
    | { type: 'UPDATE_DEAL'; payload: PartnerDeal }
    | { type: 'DELETE_DEAL'; payload: string }
    | { type: 'SELECT_DEAL'; payload: string | null }
    | { type: 'SET_DEALS'; payload: PartnerDeal[] };

const initialDealState: DealState = {
    deals: MOCK_DEALS,
    selectedDealId: null,
};

export const dealReducer = (state: DealState, action: DealAction): DealState => {
    switch (action.type) {
        case 'ADD_DEAL':
            return { ...state, deals: [...state.deals, action.payload] };
        case 'UPDATE_DEAL':
            return { ...state, deals: state.deals.map(d => d.id === action.payload.id ? action.payload : d) };
        case 'DELETE_DEAL':
            return { ...state, deals: state.deals.filter(d => d.id !== action.payload) };
        case 'SELECT_DEAL':
            return { ...state, selectedDealId: action.payload };
        case 'SET_DEALS':
            return { ...state, deals: action.payload };
        default:
            return state;
    }
};

export const DealContext = createContext<{
    state: DealState;
    dispatch: React.Dispatch<DealAction>;
    getDealsForPartner: (partnerId: string) => PartnerDeal[];
    currentDeal: PartnerDeal | undefined;
} | undefined>(undefined);

export const DealProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(dealReducer, initialDealState);
    const getDealsForPartner = useCallback((partnerId: string) => state.deals.filter(d => d.partnerId === partnerId), [state.deals]);
    const currentDeal = state.selectedDealId ? state.deals.find(d => d.id === state.selectedDealId) : undefined;

    const value = { state, dispatch, getDealsForPartner, currentDeal };
    return <DealContext.Provider value={value}>{children}</DealContext.Provider>;
};

export const useDeals = () => {
    const context = useContext(DealContext);
    if (context === undefined) {
        throw new Error('useDeals must be used within a DealProvider');
    }
    return context;
};

// 3. Notification State
interface NotificationState {
    notifications: Notification[];
}

type NotificationAction =
    | { type: 'ADD_NOTIFICATION'; payload: Notification }
    | { type: 'MARK_AS_READ'; payload: string }
    | { type: 'DELETE_NOTIFICATION'; payload: string }
    | { type: 'SET_NOTIFICATIONS'; payload: Notification[] };

const initialNotificationState: NotificationState = {
    notifications: MOCK_NOTIFICATIONS,
};

export const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
    switch (action.type) {
        case 'ADD_NOTIFICATION':
            return { ...state, notifications: [action.payload, ...state.notifications] };
        case 'MARK_AS_READ':
            return {
                ...state,
                notifications: state.notifications.map(n =>
                    n.id === action.payload ? { ...n, read: true } : n
                ),
            };
        case 'DELETE_NOTIFICATION':
            return {
                ...state,
                notifications: state.notifications.filter(n => n.id !== action.payload),
            };
        case 'SET_NOTIFICATIONS':
            return { ...state, notifications: action.payload };
        default:
            return state;
    }
};

export const NotificationContext = createContext<{
    state: NotificationState;
    dispatch: React.Dispatch<NotificationAction>;
    unreadCount: number;
} | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(notificationReducer, initialNotificationState);
    const unreadCount = state.notifications.filter(n => !n.read).length;

    const value = { state, dispatch, unreadCount };
    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

// --- Modals ---
interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<BaseModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    let maxWidthClass = '';
    switch (size) {
        case 'sm': maxWidthClass = 'max-w-sm'; break;
        case 'md': maxWidthClass = 'max-w-md'; break;
        case 'lg': maxWidthClass = 'max-w-2xl'; break;
        case 'xl': maxWidthClass = 'max-w-4xl'; break;
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className={`bg-gray-800 rounded-lg shadow-2xl ${maxWidthClass} w-full border border-gray-700 m-4`} onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- Reusable Form Input Components ---
interface FormFieldProps {
    label: string;
    id: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    type?: string;
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
    rows?: number;
    step?: string; // For number inputs, e.g., "0.01"
    min?: string | number; // For number inputs
    max?: string | number; // For number inputs
    className?: string; // For custom styling on input component
}

export const FormInput: React.FC<FormFieldProps> = ({ label, id, value, onChange, type = 'text', placeholder, required = false, step, min, max, className }) => (
    <div className={className}>
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500 focus:ring-cyan-500"
            step={step}
            min={min}
            max={max}
        />
    </div>
);

export const FormSelect: React.FC<FormFieldProps> = ({ label, id, value, onChange, options = [], required = false, className }) => (
    <div className={className}>
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <select
            id={id}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500 focus:ring-cyan-500"
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    </div>
);

export const FormTextArea: React.FC<FormFieldProps> = ({ label, id, value, onChange, placeholder, required = false, rows = 3, className }) => (
    <div className={className}>
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <textarea
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            rows={rows}
            className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500 focus:ring-cyan-500"
        />
    </div>
);


// --- Partner Forms ---
interface PartnerFormProps {
    partner?: Partner;
    onSave: (partner: Partner) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export const PartnerForm: React.FC<PartnerFormProps> = ({ partner, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState<Partner>(
        partner || {
            id: generateUUID(),
            name: '',
            tier: 'Bronze',
            status: 'Pending Review',
            revenueGenerated: 0,
            onboardingStatus: 'Not Started',
            joinDate: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            contactInfo: {
                mainContactName: '',
                mainContactEmail: '',
                mainContactPhone: '',
                headquartersAddress: '',
                country: '',
            },
            description: '',
            performanceMetrics: {
                dealsClosed: 0,
                leadsGenerated: 0,
                conversionRate: 0,
                customerSatisfaction: 0,
                trainingCompletion: 0,
            },
            marketingBudget: 0,
            supportTickets: 0,
            geography: '',
            industryFocus: [],
            website: '',
            complianceScore: 0,
            riskAssessmentScore: 0,
            notes: '',
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        if (id.startsWith('contactInfo.')) {
            const contactKey = id.split('.')[1] as keyof PartnerContactInfo;
            setFormData(prev => ({
                ...prev,
                contactInfo: { ...prev.contactInfo, [contactKey]: value },
            }));
        } else if (id.startsWith('performanceMetrics.')) {
            const metricKey = id.split('.')[1] as keyof PartnerPerformanceMetrics;
            setFormData(prev => ({
                ...prev,
                performanceMetrics: { ...prev.performanceMetrics, [metricKey]: parseFloat(value) || 0 },
            }));
        } else if (id === 'revenueGenerated' || id === 'marketingBudget' || id === 'supportTickets' || id === 'complianceScore' || id === 'riskAssessmentScore') {
            setFormData(prev => ({ ...prev, [id]: parseFloat(value) || 0 }));
        }
        else if (id === 'industryFocus') {
            setFormData(prev => ({ ...prev, industryFocus: value.split(',').map(s => s.trim()) }));
        }
        else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h4 className="text-xl font-bold text-white mb-4">{partner ? 'Edit Partner' : 'Add New Partner'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Partner Name" id="name" value={formData.name} onChange={handleChange} required />
                <FormSelect
                    label="Tier" id="tier" value={formData.tier} onChange={handleChange} required
                    options={['Bronze', 'Silver', 'Gold', 'Platinum'].map(t => ({ value: t, label: t }))}
                />
                <FormSelect
                    label="Status" id="status" value={formData.status} onChange={handleChange} required
                    options={['Pending Review', 'Onboarding', 'Active', 'Inactive'].map(s => ({ value: s, label: s }))}
                />
                <FormSelect
                    label="Onboarding Status" id="onboardingStatus" value={formData.onboardingStatus} onChange={handleChange} required
                    options={['Not Started', 'In Progress', 'Completed', 'Delayed'].map(s => ({ value: s, label: s }))}
                />
                <FormInput label="Revenue Generated (YTD)" id="revenueGenerated" type="number" step="1000" value={formData.revenueGenerated} onChange={handleChange} />
                <FormInput label="Join Date" id="joinDate" type="date" value={formData.joinDate.split('T')[0]} onChange={e => setFormData(prev => ({ ...prev, joinDate: new Date(e.target.value).toISOString() }))} />
                <FormInput label="Website" id="website" type="url" value={formData.website} onChange={handleChange} placeholder="https://www.example.com" />
                <FormInput label="Marketing Budget" id="marketingBudget" type="number" step="1000" value={formData.marketingBudget} onChange={handleChange} />
                <FormInput label="Support Tickets" id="supportTickets" type="number" value={formData.supportTickets} onChange={handleChange} />
                <FormInput label="Geography (Country)" id="geography" value={formData.geography} onChange={handleChange} />
                <FormInput label="Industry Focus (comma-separated)" id="industryFocus" value={formData.industryFocus.join(', ')} onChange={handleChange} />
            </div>

            <h5 className="text-lg font-bold text-white mt-6 mb-2">Contact Information</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Main Contact Name" id="contactInfo.mainContactName" value={formData.contactInfo.mainContactName} onChange={handleChange} required />
                <FormInput label="Main Contact Email" id="contactInfo.mainContactEmail" type="email" value={formData.contactInfo.mainContactEmail} onChange={handleChange} required />
                <FormInput label="Main Contact Phone" id="contactInfo.mainContactPhone" type="tel" value={formData.contactInfo.mainContactPhone} onChange={handleChange} />
                <FormInput label="Headquarters Address" id="contactInfo.headquartersAddress" value={formData.contactInfo.headquartersAddress} onChange={handleChange} />
                <FormInput label="Country" id="contactInfo.country" value={formData.contactInfo.country} onChange={handleChange} />
            </div>

            <h5 className="text-lg font-bold text-white mt-6 mb-2">Performance Metrics</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Deals Closed" id="performanceMetrics.dealsClosed" type="number" value={formData.performanceMetrics.dealsClosed} onChange={handleChange} />
                <FormInput label="Leads Generated" id="performanceMetrics.leadsGenerated" type="number" value={formData.performanceMetrics.leadsGenerated} onChange={handleChange} />
                <FormInput label="Conversion Rate (%)" id="performanceMetrics.conversionRate" type="number" step="0.01" value={(formData.performanceMetrics.conversionRate * 100).toFixed(2)} onChange={e => {
                    const val = parseFloat(e.target.value) / 100 || 0;
                    setFormData(prev => ({ ...prev, performanceMetrics: { ...prev.performanceMetrics, conversionRate: val } }));
                }} />
                <FormInput label="Customer Satisfaction (1-5)" id="performanceMetrics.customerSatisfaction" type="number" value={formData.performanceMetrics.customerSatisfaction} onChange={handleChange} min="1" max="5" />
                <FormInput label="Training Completion (%)" id="performanceMetrics.trainingCompletion" type="number" value={formData.performanceMetrics.trainingCompletion} onChange={handleChange} min="0" max="100" />
            </div>

            <FormTextArea label="Description" id="description" value={formData.description} onChange={handleChange} rows={4} />
            <FormTextArea label="Internal Notes" id="notes" value={formData.notes} onChange={handleChange} rows={4} />

            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                    {isSubmitting ? 'Saving...' : 'Save Partner'}
                </button>
            </div>
        </form>
    );
};

export const AddPartnerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { dispatch } = usePartners();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = (newPartner: Partner) => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            dispatch({ type: 'ADD_PARTNER', payload: newPartner });
            setIsSubmitting(false);
            onClose();
        }, 500);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Partner" size="xl">
            <PartnerForm onSave={handleSave} onCancel={onClose} isSubmitting={isSubmitting} />
        </Modal>
    );
};

export const EditPartnerModal: React.FC<{ isOpen: boolean; onClose: () => void; partner: Partner }> = ({ isOpen, onClose, partner }) => {
    const { dispatch } = usePartners();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = (updatedPartner: Partner) => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            dispatch({ type: 'UPDATE_PARTNER', payload: updatedPartner });
            setIsSubmitting(false);
            onClose();
        }, 500);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Partner: ${partner.name}`} size="xl">
            <PartnerForm partner={partner} onSave={handleSave} onCancel={onClose} isSubmitting={isSubmitting} />
        </Modal>
    );
};

// --- Deal Forms ---
interface DealFormProps {
    deal?: PartnerDeal;
    partnerId: string;
    onSave: (deal: PartnerDeal) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export const DealForm: React.FC<DealFormProps> = ({ deal, partnerId, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState<PartnerDeal>(
        deal || {
            id: generateUUID(),
            partnerId: partnerId,
            dealName: '',
            value: 0,
            stage: 'Prospecting',
            closeDate: new Date().toISOString(),
            description: '',
            expectedRevenueShare: 0,
            dealOwner: '',
            lastUpdate: new Date().toISOString(),
            priority: 'Medium',
            productsInvolved: [],
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        if (id === 'value' || id === 'expectedRevenueShare') {
            setFormData(prev => ({ ...prev, [id]: parseFloat(value) || 0 }));
        } else if (id === 'productsInvolved') {
            setFormData(prev => ({ ...prev, productsInvolved: value.split(',').map(s => s.trim()) }));
        } else if (id === 'closeDate') {
            setFormData(prev => ({ ...prev, closeDate: new Date(value).toISOString() }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h4 className="text-xl font-bold text-white mb-4">{deal ? 'Edit Deal' : 'Add New Deal'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Deal Name" id="dealName" value={formData.dealName} onChange={handleChange} required />
                <FormInput label="Value" id="value" type="number" step="1000" value={formData.value} onChange={handleChange} required />
                <FormSelect
                    label="Stage" id="stage" value={formData.stage} onChange={handleChange} required
                    options={['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'].map(s => ({ value: s, label: s }))}
                />
                <FormInput label="Close Date" id="closeDate" type="date" value={formData.closeDate.split('T')[0]} onChange={handleChange} />
                <FormInput label="Expected Revenue Share (%)" id="expectedRevenueShare" type="number" step="0.01" value={(formData.expectedRevenueShare * 100).toFixed(2)} onChange={e => {
                    const val = parseFloat(e.target.value) / 100 || 0;
                    setFormData(prev => ({ ...prev, expectedRevenueShare: val }));
                }} />
                <FormInput label="Deal Owner" id="dealOwner" value={formData.dealOwner} onChange={handleChange} />
                <FormSelect
                    label="Priority" id="priority" value={formData.priority} onChange={handleChange}
                    options={['Low', 'Medium', 'High'].map(p => ({ value: p, label: p }))}
                />
                <FormInput label="Products Involved (comma-separated)" id="productsInvolved" value={formData.productsInvolved.join(', ')} onChange={handleChange} />
            </div>
            <FormTextArea label="Description" id="description" value={formData.description} onChange={handleChange} rows={4} />

            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                    {isSubmitting ? 'Saving...' : 'Save Deal'}
                </button>
            </div>
        </form>
    );
};

export const AddDealModal: React.FC<{ isOpen: boolean; onClose: () => void; partnerId: string }> = ({ isOpen, onClose, partnerId }) => {
    const { dispatch } = useDeals();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = (newDeal: PartnerDeal) => {
        setIsSubmitting(true);
        setTimeout(() => {
            dispatch({ type: 'ADD_DEAL', payload: newDeal });
            setIsSubmitting(false);
            onClose();
        }, 500);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Deal" size="lg">
            <DealForm onSave={handleSave} onCancel={onClose} partnerId={partnerId} isSubmitting={isSubmitting} />
        </Modal>
    );
};

export const EditDealModal: React.FC<{ isOpen: boolean; onClose: () => void; deal: PartnerDeal }> = ({ isOpen, onClose, deal }) => {
    const { dispatch } = useDeals();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = (updatedDeal: PartnerDeal) => {
        setIsSubmitting(true);
        setTimeout(() => {
            dispatch({ type: 'UPDATE_DEAL', payload: updatedDeal });
            setIsSubmitting(false);
            onClose();
        }, 500);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Deal: ${deal.dealName}`} size="lg">
            <DealForm deal={deal} onSave={handleSave} onCancel={onClose} partnerId={deal.partnerId} isSubmitting={isSubmitting} />
        </Modal>
    );
};

// --- Partner Detail View Components ---
interface SectionCardProps {
    title: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, children, actions, className }) => (
    <div className={`bg-gray-800 rounded-lg shadow-md border border-gray-700 p-6 space-y-4 ${className}`}>
        <div className="flex justify-between items-center pb-4 border-b border-gray-700">
            <h4 className="text-xl font-semibold text-white">{title}</h4>
            {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
        {children}
    </div>
);

interface DataDisplayProps {
    label: string;
    value: string | number | JSX.Element;
    className?: string;
}

export const DataDisplay: React.FC<DataDisplayProps> = ({ label, value, className }) => (
    <div className={`flex flex-col ${className}`}>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
        <span className="text-sm text-white mt-1">{value}</span>
    </div>
);

export const PartnerOverviewTab: React.FC<{ partner: Partner }> = ({ partner }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="General Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataDisplay label="Name" value={partner.name} />
                <DataDisplay label="Tier" value={<span className={getTierColor(partner.tier)}>{partner.tier}</span>} />
                <DataDisplay label="Status" value={<span className={getStatusColor(partner.status)}>{partner.status}</span>} />
                <DataDisplay label="Onboarding Status" value={<span className={getOnboardingStatusColor(partner.onboardingStatus)}>{partner.onboardingStatus}</span>} />
                <DataDisplay label="Revenue Generated (YTD)" value={formatCurrency(partner.revenueGenerated)} />
                <DataDisplay label="Join Date" value={formatDate(partner.joinDate)} />
                <DataDisplay label="Last Activity" value={formatDate(partner.lastActivity, true)} />
                <DataDisplay label="Website" value={<a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{partner.website}</a>} />
                <DataDisplay label="Geography" value={partner.geography} />
                <DataDisplay label="Industry Focus" value={partner.industryFocus.join(', ')} />
            </div>
        </SectionCard>

        <SectionCard title="Contact Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataDisplay label="Main Contact" value={partner.contactInfo.mainContactName} />
                <DataDisplay label="Contact Email" value={<a href={`mailto:${partner.contactInfo.mainContactEmail}`} className="text-cyan-400 hover:underline">{partner.contactInfo.mainContactEmail}</a>} />
                <DataDisplay label="Contact Phone" value={partner.contactInfo.mainContactPhone} />
                <DataDisplay label="Headquarters" value={partner.contactInfo.headquartersAddress} />
                <DataDisplay label="Country" value={partner.contactInfo.country} />
            </div>
        </SectionCard>

        <SectionCard title="Performance Overview" className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <DataDisplay label="Deals Closed" value={partner.performanceMetrics.dealsClosed} />
                <DataDisplay label="Leads Generated" value={partner.performanceMetrics.leadsGenerated} />
                <DataDisplay label="Conversion Rate" value={`${(partner.performanceMetrics.conversionRate * 100).toFixed(2)}%`} />
                <DataDisplay label="Customer Satisfaction" value={`${partner.performanceMetrics.customerSatisfaction}/5`} />
                <DataDisplay label="Training Completion" value={`${partner.performanceMetrics.trainingCompletion}%`} />
            </div>
        </SectionCard>

        <SectionCard title="AI Risk & Compliance" className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataDisplay label="Compliance Score" value={`${partner.complianceScore}/100`} />
                <DataDisplay label="AI Risk Assessment Score" value={`${partner.riskAssessmentScore}/100`} />
            </div>
            <DataDisplay label="Internal Notes" value={partner.notes || 'No notes.'} />
            <p className="text-sm text-gray-400 mt-2">
                This score is derived from automated checks and AI-driven risk assessments.
                Regular manual review is recommended for high-risk partners.
            </p>
        </SectionCard>
    </div>
);

export const PartnerDealsTab: React.FC<{ partnerId: string }> = ({ partnerId }) => {
    const { getDealsForPartner, dispatch: dealDispatch } = useDeals();
    const deals = getDealsForPartner(partnerId);
    const [isAddDealModalOpen, setAddDealModalOpen] = useState(false);
    const [isEditDealModalOpen, setEditDealModalOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<PartnerDeal | null>(null);

    const handleEditDeal = (deal: PartnerDeal) => {
        setSelectedDeal(deal);
        setEditDealModalOpen(true);
    };

    const handleDeleteDeal = (dealId: string) => {
        if (window.confirm("Are you sure you want to delete this deal?")) {
            dealDispatch({ type: 'DELETE_DEAL', payload: dealId });
        }
    };

    return (
        <SectionCard
            title="Deals"
            actions={
                <button onClick={() => setAddDealModalOpen(true)} className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md text-xs font-medium">
                    + Add Deal
                </button>
            }
        >
            {deals.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No deals found for this partner.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th className="px-4 py-2 text-left">Deal Name</th>
                                <th className="px-4 py-2 text-left">Value</th>
                                <th className="px-4 py-2 text-left">Stage</th>
                                <th className="px-4 py-2 text-left">Close Date</th>
                                <th className="px-4 py-2 text-left">Owner</th>
                                <th className="px-4 py-2 text-left">Priority</th>
                                <th className="px-4 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deals.map(deal => (
                                <tr key={deal.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="px-4 py-2 text-white">{deal.dealName}</td>
                                    <td className="px-4 py-2">{formatCurrency(deal.value)}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getDealStageColor(deal.stage)}`}>
                                            {deal.stage}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">{formatDate(deal.closeDate)}</td>
                                    <td className="px-4 py-2">{deal.dealOwner}</td>
                                    <td className="px-4 py-2">{deal.priority}</td>
                                    <td className="px-4 py-2 text-right">
                                        <button onClick={() => handleEditDeal(deal)} className="text-blue-400 hover:text-blue-500 mr-2">Edit</button>
                                        <button onClick={() => handleDeleteDeal(deal.id)} className="text-red-400 hover:text-red-500">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <AddDealModal isOpen={isAddDealModalOpen} onClose={() => setAddDealModalOpen(false)} partnerId={partnerId} />
            {selectedDeal && (
                <EditDealModal isOpen={isEditDealModalOpen} onClose={() => setEditDealModalOpen(false)} deal={selectedDeal} />
            )}
        </SectionCard>
    );
};

export const PartnerContactsTab: React.FC<{ partnerId: string }> = ({ partnerId }) => {
    const [contacts, setContacts] = useState<PartnerContact[]>(MOCK_CONTACTS.filter(c => c.partnerId === partnerId));
    const [isAddContactModalOpen, setAddContactModalOpen] = useState(false);
    const [isEditContactModalOpen, setEditContactModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<PartnerContact | null>(null);

    const handleAddContact = (newContact: PartnerContact) => {
        setContacts(prev => [...prev, newContact]);
        setAddContactModalOpen(false);
    };

    const handleUpdateContact = (updatedContact: PartnerContact) => {
        setContacts(prev => prev.map(c => (c.id === updatedContact.id ? updatedContact : c)));
        setEditContactModalOpen(false);
        setSelectedContact(null);
    };

    const handleDeleteContact = (contactId: string) => {
        if (window.confirm("Are you sure you want to delete this contact?")) {
            setContacts(prev => prev.filter(c => c.id !== contactId));
        }
    };

    return (
        <SectionCard
            title="Contacts"
            actions={
                <button onClick={() => setAddContactModalOpen(true)} className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md text-xs font-medium">
                    + Add Contact
                </button>
            }
        >
            {contacts.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No contacts found for this partner.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th className="px-4 py-2 text-left">Name</th>
                                <th className="px-4 py-2 text-left">Role</th>
                                <th className="px-4 py-2 text-left">Email</th>
                                <th className="px-4 py-2 text-left">Phone</th>
                                <th className="px-4 py-2 text-left">Last Contact</th>
                                <th className="px-4 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map(contact => (
                                <tr key={contact.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="px-4 py-2 text-white">{contact.name}</td>
                                    <td className="px-4 py-2">{contact.role}</td>
                                    <td className="px-4 py-2"><a href={`mailto:${contact.email}`} className="text-cyan-400 hover:underline">{contact.email}</a></td>
                                    <td className="px-4 py-2">{contact.phone}</td>
                                    <td className="px-4 py-2">{formatDate(contact.lastContactDate)}</td>
                                    <td className="px-4 py-2 text-right">
                                        <button onClick={() => { setSelectedContact(contact); setEditContactModalOpen(true); }} className="text-blue-400 hover:text-blue-500 mr-2">Edit</button>
                                        <button onClick={() => handleDeleteContact(contact.id)} className="text-red-400 hover:text-red-500">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <AddContactModal isOpen={isAddContactModalOpen} onClose={() => setAddContactModalOpen(false)} partnerId={partnerId} onSave={handleAddContact} />
            {selectedContact && (
                <EditContactModal isOpen={isEditContactModalOpen} onClose={() => { setEditContactModalOpen(false); setSelectedContact(null); }} contact={selectedContact} onSave={handleUpdateContact} />
            )}
        </SectionCard>
    );
};

// --- Contact Forms ---
interface ContactFormProps {
    contact?: PartnerContact;
    partnerId: string;
    onSave: (contact: PartnerContact) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export const ContactForm: React.FC<ContactFormProps> = ({ contact, partnerId, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState<PartnerContact>(
        contact || {
            id: generateUUID(),
            partnerId: partnerId,
            name: '',
            email: '',
            phone: '',
            role: '',
            lastContactDate: new Date().toISOString(),
            notes: '',
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        if (id === 'lastContactDate') {
            setFormData(prev => ({ ...prev, lastContactDate: new Date(value).toISOString() }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h4 className="text-xl font-bold text-white mb-4">{contact ? 'Edit Contact' : 'Add New Contact'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Name" id="name" value={formData.name} onChange={handleChange} required />
                <FormInput label="Role" id="role" value={formData.role} onChange={handleChange} />
                <FormInput label="Email" id="email" type="email" value={formData.email} onChange={handleChange} required />
                <FormInput label="Phone" id="phone" type="tel" value={formData.phone} onChange={handleChange} />
                <FormInput label="Last Contact Date" id="lastContactDate" type="date" value={formData.lastContactDate.split('T')[0]} onChange={handleChange} />
            </div>
            <FormTextArea label="Notes" id="notes" value={formData.notes} onChange={handleChange} rows={3} />

            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                    {isSubmitting ? 'Saving...' : 'Save Contact'}
                </button>
            </div>
        </form>
    );
};

export const AddContactModal: React.FC<{ isOpen: boolean; onClose: () => void; partnerId: string; onSave: (contact: PartnerContact) => void }> = ({ isOpen, onClose, partnerId, onSave }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = (newContact: PartnerContact) => {
        setIsSubmitting(true);
        setTimeout(() => {
            onSave(newContact);
            setIsSubmitting(false);
            onClose();
        }, 300);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Contact" size="md">
            <ContactForm onSave={handleSave} onCancel={onClose} partnerId={partnerId} isSubmitting={isSubmitting} />
        </Modal>
    );
};

export const EditContactModal: React.FC<{ isOpen: boolean; onClose: () => void; contact: PartnerContact; onSave: (contact: PartnerContact) => void }> = ({ isOpen, onClose, contact, onSave }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = (updatedContact: PartnerContact) => {
        setIsSubmitting(true);
        setTimeout(() => {
            onSave(updatedContact);
            setIsSubmitting(false);
            onClose();
        }, 300);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Edit Contact: ${contact.name}`} size="md">
            <ContactForm contact={contact} onSave={handleSave} onCancel={onClose} partnerId={contact.partnerId} isSubmitting={isSubmitting} />
        </Modal>
    );
};

export const PartnerResourcesTab: React.FC<{ partnerId: string }> = ({ partnerId }) => {
    // For simplicity, resources are global, but partners could have assigned resources too.
    // Here we'll show global resources
    const [resources, setResources] = useState<MarketingResource[]>(MOCK_RESOURCES);

    const handleDownload = (url: string, title: string) => {
        alert(`Downloading: ${title} from ${url}`);
        // In a real app, this would trigger an actual download
        window.open(url, '_blank');
    };

    return (
        <SectionCard title="Available Marketing Resources">
            {resources.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No marketing resources available.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resources.map(res => (
                        <div key={res.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex flex-col justify-between">
                            <div>
                                <h5 className="text-white font-semibold text-base mb-1">{res.title}</h5>
                                <p className="text-gray-400 text-sm mb-2">{res.description}</p>
                                <div className="text-xs text-gray-500 space-y-1">
                                    <p><strong>Type:</strong> <span className="text-gray-300">{res.type}</span></p>
                                    <p><strong>Category:</strong> <span className="text-gray-300">{res.category}</span></p>
                                    <p><strong>Version:</strong> <span className="text-gray-300">{res.version}</span></p>
                                    <p><strong>Uploaded:</strong> <span className="text-gray-300">{formatDate(res.uploadDate)}</span></p>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => handleDownload(res.url, res.title)}
                                    className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md text-sm font-medium"
                                >
                                    Download
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </SectionCard>
    );
};

export const PartnerTrainingTab: React.FC<{ partner: Partner }> = ({ partner }) => {
    const [trainingModules, setTrainingModules] = useState<TrainingModule[]>(MOCK_TRAINING_MODULES);
    const [aiRecommendations, setAiRecommendations] = useState<string>('Click "Get AI Recommendations" to generate suggestions.');
    const [isLoadingAI, setIsLoadingAI] = useState(false);

    const handleCompleteTraining = (moduleId: string) => {
        setTrainingModules(prev => prev.map(m =>
            m.id === moduleId ? { ...m, completionStatus: 'Completed' } : m
        ));
        // Also update partner's training completion metric here for a real app
    };

    const handleGetAIRecommendations = async () => {
        setIsLoadingAI(true);
        const completedTrainingTitles = trainingModules
            .filter(m => m.completionStatus === 'Completed')
            .map(m => m.title);

        const response = await aiService.recommendTraining(partner.name, completedTrainingTitles);
        setAiRecommendations(response);
        setIsLoadingAI(false);
    };

    return (
        <div className="space-y-6">
            <SectionCard title="Assigned Training Modules">
                {trainingModules.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No training modules assigned.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    <th className="px-4 py-2 text-left">Title</th>
                                    <th className="px-4 py-2 text-left">Category</th>
                                    <th className="px-4 py-2 text-left">Duration</th>
                                    <th className="px-4 py-2 text-left">Due Date</th>
                                    <th className="px-4 py-2 text-left">Status</th>
                                    <th className="px-4 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trainingModules.map(module => (
                                    <tr key={module.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        <td className="px-4 py-2 text-white">{module.title}</td>
                                        <td className="px-4 py-2">{module.category}</td>
                                        <td className="px-4 py-2">{module.durationMinutes} min</td>
                                        <td className="px-4 py-2">{module.dueDate ? formatDate(module.dueDate) : 'N/A'}</td>
                                        <td className="px-4 py-2">
                                            <span className={getOnboardingStatusColor(module.completionStatus)}>
                                                {module.completionStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {module.completionStatus !== 'Completed' && (
                                                <button onClick={() => handleCompleteTraining(module.id)} className="text-green-400 hover:text-green-500 mr-2">Complete</button>
                                            )}
                                            <a href={module.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-500">View</a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>
            <SectionCard
                title="AI Training Recommendations"
                actions={
                    <button onClick={handleGetAIRecommendations} disabled={isLoadingAI} className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-medium disabled:opacity-50">
                        {isLoadingAI ? 'Generating...' : 'Get AI Recommendations'}
                    </button>
                }
            >
                <div className="min-h-[6rem] text-sm text-gray-300 whitespace-pre-line">
                    {isLoadingAI ? 'AI is analyzing training needs...' : aiRecommendations}
                </div>
            </SectionCard>
        </div>
    );
};

export const PartnerOnboardingTab: React.FC<{ partner: Partner; onUpdatePartner: (partner: Partner) => void }> = ({ partner, onUpdatePartner }) => {
    const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>(MOCK_ONBOARDING_STEPS); // Global steps for simplicity

    const handleStepStatusChange = (stepId: string, newStatus: OnboardingStep['status']) => {
        const updatedSteps = onboardingSteps.map(step =>
            step.id === stepId ? { ...step, status: newStatus } : step
        );
        setOnboardingSteps(updatedSteps);

        // In a real app, update the partner's onboardingStatus based on progress
        const completedSteps = updatedSteps.filter(s => s.status === 'Completed').length;
        const totalSteps = updatedSteps.length;
        let newPartnerOnboardingStatus: Partner['onboardingStatus'] = partner.onboardingStatus;
        if (completedSteps === totalSteps) {
            newPartnerOnboardingStatus = 'Completed';
        } else if (completedSteps > 0 && completedSteps < totalSteps) {
            newPartnerOnboardingStatus = 'In Progress';
        } else if (completedSteps === 0) {
            newPartnerOnboardingStatus = 'Not Started';
        }
        if (partner.onboardingStatus !== newPartnerOnboardingStatus) {
            onUpdatePartner({ ...partner, onboardingStatus: newPartnerOnboardingStatus });
        }
    };

    return (
        <SectionCard title="Onboarding Workflow">
            {onboardingSteps.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No onboarding steps defined.</p>
            ) : (
                <ul className="space-y-4">
                    {onboardingSteps.map((step, index) => (
                        <li key={step.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div className="flex-1 mb-2 md:mb-0">
                                <h5 className="text-white font-semibold text-base">{index + 1}. {step.title}</h5>
                                <p className="text-gray-400 text-sm">{step.description}</p>
                                <div className="text-xs text-gray-500 mt-1">
                                    <p><strong>Assigned To:</strong> {step.assignedTo}</p>
                                    {step.dueDate && <p><strong>Due Date:</strong> {formatDate(step.dueDate)}</p>}
                                    {step.documentsRequired.length > 0 && <p><strong>Docs:</strong> {step.documentsRequired.join(', ')}</p>}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getOnboardingStatusColor(step.status).replace('text-', 'bg-')} text-white`}>
                                    {step.status}
                                </span>
                                <FormSelect
                                    label=""
                                    id={`status-${step.id}`}
                                    value={step.status}
                                    onChange={(e) => handleStepStatusChange(step.id, e.target.value as OnboardingStep['status'])}
                                    options={[
                                        { value: 'Pending', label: 'Pending' },
                                        { value: 'In Progress', label: 'In Progress' },
                                        { value: 'Completed', label: 'Completed' },
                                        { value: 'Skipped', label: 'Skipped' },
                                    ]}
                                    className="w-32" // Adjust width as needed
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </SectionCard>
    );
};

export const PartnerAIInsightsTab: React.FC<{ partnerId: string; partnerName: string }> = ({ partnerId, partnerName }) => {
    const [aiInsights, setAiInsights] = useState<AIInsight[]>(MOCK_AI_INSIGHTS.filter(i => i.relatedPartnerId === partnerId));
    const [riskReport, setRiskReport] = useState<string>('');
    const [isGeneratingRisk, setIsGeneratingRisk] = useState(false);
    const [marketingCopy, setMarketingCopy] = useState<string>('');
    const [isGeneratingMarketingCopy, setIsGeneratingMarketingCopy] = useState(false);
    const [productForCopy, setProductForCopy] = useState<string>('');
    const [audienceForCopy, setAudienceForCopy] = useState<string>('');
    const [toneForCopy, setToneForCopy] = useState<string>('Professional');

    const handleGenerateRiskReport = async () => {
        setIsGeneratingRisk(true);
        setRiskReport('');
        const report = await aiService.generateRiskAssessment(partnerName);
        setRiskReport(report);
        setAiInsights(prev => [
            {
                id: generateUUID(),
                type: 'Risk',
                summary: `New risk assessment for ${partnerName}`,
                details: report,
                dateGenerated: new Date().toISOString(),
                relatedPartnerId: partnerId,
                confidenceScore: 0.85,
            },
            ...prev,
        ]);
        setIsGeneratingRisk(false);
    };

    const handleGenerateMarketingCopy = async () => {
        if (!productForCopy || !audienceForCopy) {
            alert("Please provide product name and target audience for marketing copy.");
            return;
        }
        setIsGeneratingMarketingCopy(true);
        const copy = await aiService.generateMarketingCopy(productForCopy, partnerName, audienceForCopy, toneForCopy);
        setMarketingCopy(copy);
        setAiInsights(prev => [
            {
                id: generateUUID(),
                type: 'Content Suggestion',
                summary: `New marketing copy for ${productForCopy} for ${partnerName}`,
                details: copy,
                dateGenerated: new Date().toISOString(),
                relatedPartnerId: partnerId,
                confidenceScore: 0.9,
            },
            ...prev,
        ]);
        setIsGeneratingMarketingCopy(false);
    };

    return (
        <div className="space-y-6">
            <SectionCard title="AI Generated Insights">
                {aiInsights.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No AI insights generated for this partner yet.</p>
                ) : (
                    <div className="space-y-4">
                        {aiInsights.map(insight => (
                            <div key={insight.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                <div className="flex justify-between items-center mb-2">
                                    <h5 className="text-white font-semibold text-base">{insight.type} Insight</h5>
                                    <span className="text-xs text-gray-500">{formatDate(insight.dateGenerated)}</span>
                                </div>
                                <p className="text-gray-300 text-sm mb-2">{insight.summary}</p>
                                <details className="text-gray-400 text-sm cursor-pointer">
                                    <summary className="text-cyan-400 hover:text-cyan-300">View Details</summary>
                                    <p className="mt-2 whitespace-pre-line">{insight.details}</p>
                                    {insight.confidenceScore && <p className="mt-2 text-xs">Confidence: {(insight.confidenceScore * 100).toFixed(0)}%</p>}
                                </details>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>

            <SectionCard
                title="Generate New Risk Report"
                actions={
                    <button onClick={handleGenerateRiskReport} disabled={isGeneratingRisk} className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-medium disabled:opacity-50">
                        {isGeneratingRisk ? 'Generating...' : 'Generate Risk Report'}
                    </button>
                }
            >
                <div className="min-h-[6rem] text-sm text-gray-300 whitespace-pre-line">
                    {isGeneratingRisk ? 'AI is performing a new risk assessment...' : riskReport || 'No risk report generated yet. Click the button to start.'}
                </div>
            </SectionCard>

            <SectionCard
                title="Generate Marketing Copy"
                actions={
                    <button onClick={handleGenerateMarketingCopy} disabled={isGeneratingMarketingCopy || !productForCopy || !audienceForCopy} className="px-3 py-1 bg-lime-600 hover:bg-lime-700 text-white rounded-md text-xs font-medium disabled:opacity-50">
                        {isGeneratingMarketingCopy ? 'Generating...' : 'Generate Copy'}
                    </button>
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormInput label="Product Name" id="productForCopy" value={productForCopy} onChange={e => setProductForCopy(e.target.value)} required />
                    <FormInput label="Target Audience" id="audienceForCopy" value={audienceForCopy} onChange={e => setAudienceForCopy(e.target.value)} required />
                    <FormSelect label="Tone" id="toneForCopy" value={toneForCopy} onChange={e => setToneForCopy(e.target.value)} options={['Professional', 'Enthusiastic', 'Concise', 'Friendly'].map(t => ({ value: t, label: t }))} />
                </div>
                <FormTextArea label="Generated Marketing Copy" id="generatedMarketingCopy" value={marketingCopy || 'Enter product and audience, then click generate.'} onChange={() => {}} rows={6} readOnly />
            </SectionCard>
        </div>
    );
};


// --- PartnerDetailView Component ---
export const PartnerDetailView: React.FC = () => {
    const { currentPartner, dispatch: partnerDispatch } = usePartners();
    const [activeTab, setActiveTab] = useState<'overview' | 'deals' | 'contacts' | 'resources' | 'training' | 'onboarding' | 'ai-insights'>('overview');
    const [isEditPartnerModalOpen, setEditPartnerModalOpen] = useState(false);

    if (!currentPartner) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400">
                <p>Select a partner from the directory to view details.</p>
            </div>
        );
    }

    const handleUpdatePartner = (updatedPartner: Partner) => {
        partnerDispatch({ type: 'UPDATE_PARTNER', payload: updatedPartner });
    };


    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'deals', label: 'Deals' },
        { id: 'contacts', label: 'Contacts' },
        { id: 'resources', label: 'Resources' },
        { id: 'training', label: 'Training' },
        { id: 'onboarding', label: 'Onboarding' },
        { id: 'ai-insights', label: 'AI Insights' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    {currentPartner.logoUrl && <img src={currentPartner.logoUrl} alt={`${currentPartner.name} logo`} className="w-12 h-12 rounded-full object-cover border border-gray-700" />}
                    <h3 className="text-3xl font-bold text-white tracking-wider">{currentPartner.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTierColor(currentPartner.tier).replace('text-', 'bg-')} text-white`}>
                        {currentPartner.tier} Partner
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(currentPartner.status).replace('text-', 'bg-')} text-white`}>
                        {currentPartner.status}
                    </span>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => setEditPartnerModalOpen(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">Edit Partner</button>
                    <button onClick={() => partnerDispatch({ type: 'SELECT_PARTNER', payload: null })} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium">Back to Directory</button>
                </div>
            </div>

            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`${
                                activeTab === tab.id
                                    ? 'border-cyan-500 text-cyan-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'overview' && <PartnerOverviewTab partner={currentPartner} />}
                {activeTab === 'deals' && <PartnerDealsTab partnerId={currentPartner.id} />}
                {activeTab === 'contacts' && <PartnerContactsTab partnerId={currentPartner.id} />}
                {activeTab === 'resources' && <PartnerResourcesTab partnerId={currentPartner.id} />}
                {activeTab === 'training' && <PartnerTrainingTab partner={currentPartner} />}
                {activeTab === 'onboarding' && <PartnerOnboardingTab partner={currentPartner} onUpdatePartner={handleUpdatePartner} />}
                {activeTab === 'ai-insights' && <PartnerAIInsightsTab partnerId={currentPartner.id} partnerName={currentPartner.name} />}
            </div>
            {isEditPartnerModalOpen && (
                <EditPartnerModal isOpen={isEditPartnerModalOpen} onClose={() => setEditPartnerModalOpen(false)} partner={currentPartner} />
            )}
        </div>
    );
};

// --- Notifications Center Component ---
export const NotificationsCenter: React.FC = () => {
    const { state, dispatch } = useNotifications();
    const { currentPartner } = usePartners();
    const [filterPartner, setFilterPartner] = useState<string>('All');
    const [filterReadStatus, setFilterReadStatus] = useState<'All' | 'Read' | 'Unread'>('All');
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    const sortedNotifications = [...state.notifications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const filteredNotifications = sortedNotifications.filter(n => {
        const matchesPartner = filterPartner === 'All' || (n.targetPartnerId && n.targetPartnerId === filterPartner);
        const matchesReadStatus = filterReadStatus === 'All' || (filterReadStatus === 'Read' ? n.read : !n.read);
        return matchesPartner && matchesReadStatus;
    });

    const handleMarkAsRead = (id: string) => {
        dispatch({ type: 'MARK_AS_READ', payload: id });
    };

    const handleDeleteNotification = (id: string) => {
        if (window.confirm("Are you sure you want to delete this notification?")) {
            dispatch({ type: 'DELETE_NOTIFICATION', payload: id });
        }
    };

    const handleViewDetails = (notification: Notification) => {
        setSelectedNotification(notification);
        setDetailModalOpen(true);
        if (!notification.read) {
            handleMarkAsRead(notification.id);
        }
    };

    return (
        <SectionCard title="Notifications Center">
            <div className="flex flex-wrap items-center gap-4 mb-4">
                <FormSelect
                    label="Filter by Partner" id="filterPartner" value={filterPartner}
                    onChange={e => setFilterPartner(e.target.value)}
                    options={[{ value: 'All', label: 'All Partners' }, ...MOCK_PARTNERS.map(p => ({ value: p.id, label: p.name }))]}
                    className="w-48"
                />
                <FormSelect
                    label="Filter by Read Status" id="filterReadStatus" value={filterReadStatus}
                    onChange={e => setFilterReadStatus(e.target.value as 'All' | 'Read' | 'Unread')}
                    options={[{ value: 'All', label: 'All' }, { value: 'Read', label: 'Read' }, { value: 'Unread', label: 'Unread' }]}
                    className="w-48"
                />
            </div>
            {filteredNotifications.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No notifications to display.</p>
            ) : (
                <ul className="space-y-3">
                    {filteredNotifications.map(notification => (
                        <li key={notification.id} className={`bg-gray-900/50 p-4 rounded-lg border ${notification.read ? 'border-gray-700' : 'border-cyan-500'} flex items-start space-x-3 transition-colors`}>
                            <div className={`w-2 h-2 rounded-full mt-1 ${notification.read ? 'bg-gray-500' : 'bg-cyan-500'}`}></div>
                            <div className="flex-1">
                                <p className={`text-sm ${notification.read ? 'text-gray-400' : 'text-white font-medium'}`}>
                                    {notification.message}
                                </p>
                                <div className="flex flex-wrap items-center text-xs text-gray-500 mt-1 gap-x-2">
                                    <span>{formatDate(notification.date, true)}</span>
                                    {notification.targetPartnerId && (
                                        <span className="px-2 py-0.5 bg-gray-700 rounded-md">
                                            {MOCK_PARTNERS.find(p => p.id === notification.targetPartnerId)?.name || 'Unknown Partner'}
                                        </span>
                                    )}
                                    <span className={`px-2 py-0.5 rounded-md text-white text-xs ${notification.priority === 'High' ? 'bg-red-600' : notification.priority === 'Medium' ? 'bg-yellow-600' : 'bg-blue-600'}`}>
                                        {notification.priority}
                                    </span>
                                </div>
                            </div>
                            <div className="flex space-x-2 items-center text-sm flex-shrink-0">
                                <button onClick={() => handleViewDetails(notification)} className="text-blue-400 hover:text-blue-500">View</button>
                                {!notification.read && (
                                    <button onClick={() => handleMarkAsRead(notification.id)} className="text-green-400 hover:text-green-500">Mark Read</button>
                                )}
                                <button onClick={() => handleDeleteNotification(notification.id)} className="text-red-400 hover:text-red-500">Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {selectedNotification && (
                <Modal isOpen={isDetailModalOpen} onClose={() => setDetailModalOpen(false)} title="Notification Details" size="md">
                    <DataDisplay label="Type" value={selectedNotification.type} />
                    <DataDisplay label="Date" value={formatDate(selectedNotification.date, true)} />
                    {selectedNotification.targetPartnerId && (
                        <DataDisplay label="Related Partner" value={MOCK_PARTNERS.find(p => p.id === selectedNotification.targetPartnerId)?.name || 'N/A'} />
                    )}
                    <DataDisplay label="Priority" value={selectedNotification.priority} />
                    <DataDisplay label="Message" value={<p className="whitespace-pre-line">{selectedNotification.message}</p>} />
                    {selectedNotification.actionLink && (
                        <DataDisplay label="Action Link" value={<a href={selectedNotification.actionLink} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Go to relevant section</a>} />
                    )}
                </Modal>
            )}
        </SectionCard>
    );
};

// --- Main Partner Directory Component ---
export const PartnerDirectory: React.FC = () => {
    const { state, dispatch, paginatedPartners, totalPages } = usePartners();
    const [isAddPartnerModalOpen, setAddPartnerModalOpen] = useState(false);

    const handleSort = (key: keyof Partner) => {
        const direction = state.sort.key === key && state.sort.direction === 'asc' ? 'desc' : 'asc';
        dispatch({ type: 'SET_SORT', payload: { key, direction } });
    };

    const getSortIndicator = (key: keyof Partner) => {
        if (state.sort.key === key) {
            return state.sort.direction === 'asc' ? ' ▲' : ' ▼';
        }
        return '';
    };

    return (
        <Card title="Partner Directory" actions={<button onClick={() => setAddPartnerModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">+ Add New Partner</button>}>
            <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                <FormInput
                    label="Search" id="search" value={state.filters.search}
                    onChange={e => dispatch({ type: 'SET_FILTER', payload: { key: 'search', value: e.target.value } })}
                    placeholder="Search by name, email, description..."
                    className="flex-grow max-w-sm"
                />
                <FormSelect
                    label="Filter by Tier" id="tierFilter" value={state.filters.tier}
                    onChange={e => dispatch({ type: 'SET_FILTER', payload: { key: 'tier', value: e.target.value as Partner['tier'] | 'All' } })}
                    options={[{ value: 'All', label: 'All Tiers' }, 'Bronze', 'Silver', 'Gold', 'Platinum'].map(t => ({ value: t, label: t }))}
                    className="w-40"
                />
                <FormSelect
                    label="Filter by Status" id="statusFilter" value={state.filters.status}
                    onChange={e => dispatch({ type: 'SET_FILTER', payload: { key: 'status', value: e.target.value as Partner['status'] | 'All' } })}
                    options={[{ value: 'All', label: 'All Statuses' }, 'Pending Review', 'Onboarding', 'Active', 'Inactive'].map(s => ({ value: s, label: s }))}
                    className="w-40"
                />
            </div>
            {paginatedPartners.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No partners match your criteria.</p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    <th className="px-6 py-3 text-left cursor-pointer" onClick={() => handleSort('name')}>Name {getSortIndicator('name')}</th>
                                    <th className="px-6 py-3 text-left cursor-pointer" onClick={() => handleSort('tier')}>Tier {getSortIndicator('tier')}</th>
                                    <th className="px-6 py-3 text-left cursor-pointer" onClick={() => handleSort('status')}>Status {getSortIndicator('status')}</th>
                                    <th className="px-6 py-3 text-left cursor-pointer" onClick={() => handleSort('revenueGenerated')}>Revenue (YTD) {getSortIndicator('revenueGenerated')}</th>
                                    <th className="px-6 py-3 text-left cursor-pointer" onClick={() => handleSort('onboardingStatus')}>Onboarding {getSortIndicator('onboardingStatus')}</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedPartners.map(p => (
                                    <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        <td className="px-6 py-4 text-white flex items-center">
                                            {p.logoUrl && <img src={p.logoUrl} alt={`${p.name} logo`} className="w-8 h-8 rounded-full mr-2 object-cover" />}
                                            {p.name}
                                        </td>
                                        <td className="px-6 py-4"><span className={getTierColor(p.tier)}>{p.tier}</span></td>
                                        <td className="px-6 py-4"><span className={getStatusColor(p.status)}>{p.status}</span></td>
                                        <td className="px-6 py-4 font-mono text-white">{formatCurrency(p.revenueGenerated)}</td>
                                        <td className="px-6 py-4"><span className={getOnboardingStatusColor(p.onboardingStatus)}>{p.onboardingStatus}</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => dispatch({ type: 'SELECT_PARTNER', payload: p.id })} className="text-cyan-400 hover:text-cyan-500 mr-2">View Details</button>
                                            <button onClick={() => { /* Implement delete confirmation */ }} className="text-red-400 hover:text-red-500">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    <div className="flex justify-between items-center mt-4">
                        <button
                            onClick={() => dispatch({ type: 'SET_PAGE', payload: state.pagination.currentPage - 1 })}
                            disabled={state.pagination.currentPage === 1}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-300">
                            Page {state.pagination.currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => dispatch({ type: 'SET_PAGE', payload: state.pagination.currentPage + 1 })}
                            disabled={state.pagination.currentPage === totalPages}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
            <AddPartnerModal isOpen={isAddPartnerModalOpen} onClose={() => setAddPartnerModalOpen(false)} />
        </Card>
    );
};

// --- Dashboard Overview ---
export const PartnerDashboard: React.FC = () => {
    const { state: partnerState } = usePartners();
    const { state: dealState } = useDeals();
    const { unreadCount } = useNotifications();

    const activePartners = partnerState.partners.filter(p => p.status === 'Active').length;
    const pendingOnboarding = partnerState.partners.filter(p => p.onboardingStatus !== 'Completed').length;
    const totalRevenue = partnerState.partners.reduce((sum, p) => sum + p.revenueGenerated, 0);
    const totalDeals = dealState.deals.length;
    const wonDealsValue = dealState.deals.filter(d => d.stage === 'Closed Won').reduce((sum, d) => sum + d.value, 0);

    const keyMetrics = [
        { label: "Total Partners", value: partnerState.partners.length },
        { label: "Active Partners", value: activePartners },
        { label: "Pending Onboarding", value: pendingOnboarding },
        { label: "Total Revenue (YTD)", value: formatCurrency(totalRevenue) },
        { label: "Total Deals", value: totalDeals },
        { label: "Won Deals Value", value: formatCurrency(wonDealsValue) },
        { label: "Unread Notifications", value: unreadCount },
    ];

    // Simple pseudo-charts (for line count)
    const generateBarChart = (title: string, data: { label: string, value: number, color: string }[]) => (
        <SectionCard title={title}>
            <div className="grid grid-cols-1 gap-4">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center">
                        <span className="text-sm text-gray-300 w-24">{item.label}</span>
                        <div className="flex-1 h-6 rounded-md overflow-hidden bg-gray-700">
                            <div
                                className={`${item.color} h-full transition-all duration-500 ease-out`}
                                style={{ width: `${Math.min(100, item.value)}%` }} // Clamp value to 100 for display
                            ></div>
                        </div>
                        <span className="ml-2 text-sm text-white">{item.value.toFixed(0)}%</span>
                    </div>
                ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Visualization represents relative proportions.</p>
        </SectionCard>
    );

    const tierDistribution = MOCK_PARTNERS.reduce((acc, p) => {
        acc[p.tier] = (acc[p.tier] || 0) + 1;
        return acc;
    }, {} as Record<Partner['tier'], number>);

    const totalPartners = MOCK_PARTNERS.length;
    const tierChartData = Object.entries(tierDistribution).map(([tier, count]) => ({
        label: tier,
        value: (count / totalPartners) * 100,
        color: getTierColor(tier as Partner['tier']).replace('text-', 'bg-')
    }));

    const dealStageDistribution = MOCK_DEALS.reduce((acc, d) => {
        acc[d.stage] = (acc[d.stage] || 0) + 1;
        return acc;
    }, {} as Record<PartnerDeal['stage'], number>);

    const totalDealsForChart = MOCK_DEALS.length;
    const dealStageChartData = Object.entries(dealStageDistribution).map(([stage, count]) => ({
        label: stage,
        value: (count / totalDealsForChart) * 100,
        color: getDealStageColor(stage as PartnerDeal['stage'])
    }));

    return (
        <div className="space-y-6">
            <h3 className="text-3xl font-bold text-white tracking-wider">Dashboard Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {keyMetrics.map((metric, index) => (
                    <Card key={index} title={metric.label}>
                        <p className="text-3xl font-bold text-white">{metric.value}</p>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard title="Revenue Forecast (Current Year)">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    <th className="px-4 py-2 text-left">Quarter</th>
                                    <th className="px-4 py-2 text-right">Expected</th>
                                    <th className="px-4 py-2 text-right">Actual</th>
                                    <th className="px-4 py-2 text-right">Variance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_REVENUE_FORECASTS.map((forecast, index) => (
                                    <tr key={index} className="border-b border-gray-700 last:border-b-0">
                                        <td className="px-4 py-2 text-white">{forecast.quarter}</td>
                                        <td className="px-4 py-2 text-right">{formatCurrency(forecast.expectedRevenue)}</td>
                                        <td className="px-4 py-2 text-right">{forecast.actualRevenue ? formatCurrency(forecast.actualRevenue) : 'N/A'}</td>
                                        <td className="px-4 py-2 text-right">
                                            {forecast.variance !== undefined ? (
                                                <span className={forecast.variance >= 0 ? 'text-green-400' : 'text-red-400'}>
                                                    {formatCurrency(forecast.variance)}
                                                </span>
                                            ) : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>

                <SectionCard title="Recent Audit Logs">
                    <ul className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                        {MOCK_AUDIT_LOGS.slice(0, 10).map(log => (
                            <li key={log.id} className="text-xs text-gray-400 flex justify-between">
                                <span className="flex-1 truncate">
                                    <span className="text-cyan-400">{log.userId.split('@')[0]}</span> {log.action} <span className="text-white">{log.targetEntity} {log.targetEntityId}</span>
                                </span>
                                <span className="ml-2 flex-shrink-0">{formatDate(log.timestamp, true)}</span>
                            </li>
                        ))}
                    </ul>
                </SectionCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {generateBarChart("Partner Tier Distribution", tierChartData)}
                {generateBarChart("Deal Stage Distribution", dealStageChartData)}
            </div>
        </div>
    );
};

// --- Main Partner Hub View Component ---
const PartnerHubView: React.FC = () => {
    const [activeSection, setActiveSection] = useState<'dashboard' | 'directory' | 'notifications' | 'ai-vetting' | 'partner-detail'>('dashboard');
    const { state: partnerState, dispatch: partnerDispatch, currentPartner } = usePartners();
    const { unreadCount } = useNotifications();

    // The original AI risk modal logic, adapted to new structure
    const [isRiskModalOpen, setRiskModalOpen] = useState(false);
    const [partnerNameForVetting, setPartnerNameForVetting] = useState("Future Integrators");
    const [riskReport, setRiskReport] = useState('');
    const [isLoadingRiskReport, setIsLoadingRiskReport] = useState(false);

    const handleGenerateVettingReport = async () => {
        setIsLoadingRiskReport(true);
        setRiskReport('');
        const report = await aiService.generateRiskAssessment(partnerNameForVetting);
        setRiskReport(report);
        setIsLoadingRiskReport(false);
    };

    useEffect(() => {
        if (currentPartner) {
            setActiveSection('partner-detail');
        } else if (activeSection === 'partner-detail') {
            setActiveSection('directory'); // Go back to directory if partner is deselected
        }
    }, [currentPartner, activeSection]);

    // Override active section if a partner is selected
    const displaySection = currentPartner ? 'partner-detail' : activeSection;

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white tracking-wider">Partner Hub</h2>
                <div className="flex space-x-3">
                    <button onClick={() => setRiskModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Partner Vetting</button>
                    {/* The "AI Tools" section is now integrated into PartnerDetailView's AI Insights tab. This button could lead to a general AI dashboard/tools page if needed. */}
                    {/* For now, removing it to reduce redundancy, as specific AI features are in PartnerAIInsightsTab */}
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {/* Navigation Tabs for main sections */}
                <div className="border-b border-gray-700 mb-6">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => { setActiveSection('dashboard'); partnerDispatch({ type: 'SELECT_PARTNER', payload: null }); }}
                            className={`${displaySection === 'dashboard' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => { setActiveSection('directory'); partnerDispatch({ type: 'SELECT_PARTNER', payload: null }); }}
                            className={`${displaySection === 'directory' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            Partner Directory
                        </button>
                        <button
                            onClick={() => { setActiveSection('notifications'); partnerDispatch({ type: 'SELECT_PARTNER', payload: null }); }}
                            className={`${displaySection === 'notifications' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors relative`}
                        >
                            Notifications
                            {unreadCount > 0 && (
                                <span className="absolute top-3 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        {displaySection === 'partner-detail' && (
                            <button
                                onClick={() => setActiveSection('partner-detail')}
                                className={`${displaySection === 'partner-detail' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                Partner Details: {currentPartner?.name}
                            </button>
                        )}
                    </nav>
                </div>

                <div className="py-4">
                    {displaySection === 'dashboard' && <PartnerDashboard />}
                    {displaySection === 'directory' && <PartnerDirectory />}
                    {displaySection === 'notifications' && <NotificationsCenter />}
                    {displaySection === 'partner-detail' && <PartnerDetailView />}
                </div>
            </div>

            {/* Original AI Risk Modal */}
            <Modal isOpen={isRiskModalOpen} onClose={() => setRiskModalOpen(false)} title="AI Partner Risk Assessment">
                <FormInput label="Partner Name" id="partnerNameForVetting" value={partnerNameForVetting} onChange={e => setPartnerNameForVetting(e.target.value)} />
                <button onClick={handleGenerateVettingReport} disabled={isLoadingRiskReport} className="w-full py-2 bg-cyan-600 rounded disabled:opacity-50">{isLoadingRiskReport ? 'Assessing...' : 'Assess Risk'}</button>
                <Card title="AI Report"><div className="min-h-[10rem] text-sm text-gray-300 whitespace-pre-line">{isLoadingRiskReport ? '...' : riskReport}</div></Card>
            </Modal>
        </div>
    );
};

// --- Top-level Export Wrapper for Providers ---
// This is the actual component that gets exported from the file.
// It wraps the main PartnerHubView with its necessary Context Providers.
const PartnerHubViewWithProviders: React.FC = () => {
    return (
        <PartnerProvider>
            <DealProvider>
                <NotificationProvider>
                    <PartnerHubView />
                </NotificationProvider>
            </DealProvider>
        </PartnerProvider>
    );
};

export default PartnerHubViewWithProviders;