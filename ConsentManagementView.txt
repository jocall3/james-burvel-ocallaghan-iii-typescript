import React, { useContext, useState, useMemo, useCallback, useEffect } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { GoogleGenAI } from "@google/genai";
// FIX: Imported Tooltip from recharts to resolve 'Cannot find name' error.
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

// --- NEW DATA MODELS / INTERFACES ---
export interface ConsentRecord { // Re-defining for clarity, assuming original DataContext uses this or similar
    id: string;
    userId: string;
    consentType: 'Marketing' | 'Data Sharing' | 'Analytics' | 'Essential';
    status: 'Granted' | 'Revoked';
    timestamp: string; // ISO string
    details: string; // e.g., "User agreed to marketing emails for product updates"
    source: string; // e.g., "Website Form", "Mobile App", "API"
    legalBasis: string; // e.g., "Consent", "Legitimate Interest"
    expirationDate?: string;
}

export interface ConsentPolicy {
    id: string;
    name: string;
    description: string;
    dataCategories: string[]; // e.g., ['Email Address', 'Name', 'Marketing Preferences']
    legalBasis: string; // e.g., 'Consent', 'Legitimate Interest', 'Contract', 'Legal Obligation'
    retentionPeriod: string; // e.g., '5 years', 'Until revoked', 'Indefinite'
    version: number;
    isActive: boolean;
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
    regions: string[]; // e.g., ['EU', 'US-CA', 'Global']
    purpose: string; // e.g., 'Personalized Advertising', 'Core Product Functionality'
    thirdPartySharing: boolean;
    thirdPartyList: string[]; // Names of third parties
    isAutomatedDecisionMaking: boolean;
    automatedDecisionDetails?: string;
    reviewCycleInDays: number; // e.g., 365 for annual review
    lastReviewedAt?: string; // ISO string
    nextReviewAt?: string; // ISO string
}

export interface DataSubjectRequest {
    id: string;
    userId: string;
    requestType: 'Access' | 'Erasure' | 'Rectification' | 'Portability' | 'Objection' | 'Restriction';
    status: 'Pending' | 'In Progress' | 'Completed' | 'Rejected' | 'On Hold';
    details: string;
    submissionDate: string; // ISO string
    completionDate?: string; // ISO string
    requestedDataCategories: string[]; // e.g., ['Marketing Data', 'Location Data', 'Transaction History']
    assignedTo?: string; // User ID of the assignee
    notes: RequestNote[];
    attachments?: string[]; // URLs or IDs to attachments (e.g., uploaded forms)
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    dueDate: string; // ISO string
}

export interface RequestNote {
    id: string;
    authorId: string;
    timestamp: string; // ISO string
    content: string;
}

export interface AuditLogEntry {
    id: string;
    timestamp: string; // ISO string
    userId: string; // User who performed the action, or 'system'
    action: string; // e.g., 'CONSENT_GRANTED', 'POLICY_UPDATED', 'DSR_STATUS_CHANGE'
    entityType: 'ConsentRecord' | 'ConsentPolicy' | 'DataSubjectRequest' | 'System';
    entityId: string; // ID of the entity affected
    details: string; // Detailed description of the action
    ipAddress?: string; // IP address of the user
    affectedFields?: string[]; // e.g., ['status', 'notes']
    oldValue?: any;
    newValue?: any;
}

export interface ConsentTrendData {
    date: string; // YYYY-MM-DD
    granted: number;
    revoked: number;
    newConsents: number; // Newly granted, not just current granted
    optOuts: number; // Revoked consents
}

export interface DataCategoryDefinition {
    id: string;
    name: string;
    description: string;
    sensitive: boolean;
    examples: string[];
}

export interface ThirdPartyIntegration {
    id: string;
    name: string;
    description: string;
    dataCategoriesShared: string[];
    regions: string[];
    contractSigned: boolean;
    dpaSigned: boolean; // Data Processing Agreement
    status: 'Active' | 'Inactive' | 'Pending Review';
    lastReviewedAt: string;
}

// --- NEW UTILITY HOOKS ---
export function usePagination<T>(data: T[], itemsPerPage: number) {
    const [currentPage, setCurrentPage] = useState(1);
    const maxPage = Math.ceil(data.length / itemsPerPage);

    const currentData = useMemo(() => {
        const begin = (currentPage - 1) * itemsPerPage;
        const end = begin + itemsPerPage;
        return data.slice(begin, end);
    }, [currentPage, data, itemsPerPage]);

    const next = useCallback(() => {
        setCurrentPage((prev) => Math.min(prev + 1, maxPage));
    }, [maxPage]);

    const prev = useCallback(() => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    }, []);

    const jump = useCallback((page: number) => {
        const pageNumber = Math.max(1, page);
        setCurrentPage(() => Math.min(pageNumber, maxPage));
    }, [maxPage]);

    return { next, prev, jump, currentData, currentPage, maxPage };
}

export function useSort<T>(data: T[], config: { key: keyof T; direction: 'ascending' | 'descending' } | null) {
    const [sortConfig, setSortConfig] = useState(config);

    const sortedData = useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue === null || aValue === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
                if (bValue === null || bValue === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
                }
                if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
                    return sortConfig.direction === 'ascending' ? (aValue === bValue ? 0 : aValue ? -1 : 1) : (aValue === bValue ? 0 : aValue ? 1 : -1);
                }
                // Fallback for other types or if comparison is not straightforward (e.g., dates)
                if (aValue instanceof Date && bValue instanceof Date) {
                    return sortConfig.direction === 'ascending' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
                }
                // For ISO string dates
                if (typeof aValue === 'string' && typeof bValue === 'string' && (new Date(aValue).toString() !== 'Invalid Date')) {
                    const dateA = new Date(aValue);
                    const dateB = new Date(bValue);
                    if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                        return sortConfig.direction === 'ascending' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
                    }
                }

                if (String(aValue) < String(bValue)) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (String(aValue) > String(bValue)) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    const requestSort = useCallback((key: keyof T) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    }, [sortConfig]);

    return { sortedData, requestSort, sortConfig };
}

export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// --- MOCK API FUNCTIONS ---
const mockDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// NOTE: In a real application, these would be separate API service calls.
// Mocks are mutable for demonstration of state changes within the UI.
export let MOCK_CONSENT_RECORDS_DATA: ConsentRecord[] = [
    // This array will be initialized/updated by DataContext but here for mock purposes.
    // Assuming context will manage this.
];

export let MOCK_CONSENT_POLICIES: ConsentPolicy[] = [
    {
        id: 'pol-001',
        name: 'Marketing Communications Policy (EU)',
        description: 'Governs the collection and use of personal data for marketing purposes within the EU, requiring explicit consent.',
        dataCategories: ['Email Address', 'Name', 'Marketing Preferences', 'Browsing History'],
        legalBasis: 'Consent',
        retentionPeriod: 'Until revoked',
        version: 2,
        isActive: true,
        createdAt: '2022-01-15T10:00:00Z',
        updatedAt: '2023-03-20T11:30:00Z',
        regions: ['EU'],
        purpose: 'Direct Marketing, Personalized Offers',
        thirdPartySharing: true,
        thirdPartyList: ['MailChimp', 'Google Ads', 'Facebook Custom Audiences'],
        isAutomatedDecisionMaking: false,
        reviewCycleInDays: 365,
        lastReviewedAt: '2023-03-15T09:00:00Z',
        nextReviewAt: '2024-03-15T09:00:00Z',
    },
    {
        id: 'pol-002',
        name: 'Essential Service Data Policy (Global)',
        description: 'Covers data necessary for core product functionality, typically under legitimate interest or contract. This policy applies globally.',
        dataCategories: ['User ID', 'IP Address', 'Device Information', 'Transaction History', 'Customer Support Interactions'],
        legalBasis: 'Legitimate Interest',
        retentionPeriod: '7 years after account closure',
        version: 1,
        isActive: true,
        createdAt: '2021-11-01T09:00:00Z',
        updatedAt: '2021-11-01T09:00:00Z',
        regions: ['Global'],
        purpose: 'Account Management, Fraud Prevention, Service Delivery, System Performance Monitoring',
        thirdPartySharing: false,
        isAutomatedDecisionMaking: true,
        automatedDecisionDetails: 'Automated fraud detection based on IP and transaction patterns. Account lockout based on suspicious login attempts.',
        reviewCycleInDays: 180,
        lastReviewedAt: '2023-09-01T10:00:00Z',
        nextReviewAt: '2024-03-01T10:00:00Z',
    },
    {
        id: 'pol-003',
        name: 'Analytics and Product Improvement Policy (US)',
        description: 'For collecting anonymized and aggregated data to improve user experience and product features in the US, with an opt-out mechanism.',
        dataCategories: ['Usage Data', 'Crash Reports', 'Feature Interaction', 'Referral Source'],
        legalBasis: 'Legitimate Interest',
        retentionPeriod: '3 years',
        version: 1,
        isActive: true,
        createdAt: '2023-05-10T14:00:00Z',
        updatedAt: '2023-05-10T14:00:00Z',
        regions: ['US'],
        purpose: 'Product Analytics, Performance Monitoring, A/B Testing',
        thirdPartySharing: true,
        thirdPartyList: ['Google Analytics', 'Mixpanel', 'Hotjar'],
        isAutomatedDecisionMaking: false,
        reviewCycleInDays: 365,
        lastReviewedAt: '2023-05-01T10:00:00Z',
        nextReviewAt: '2024-05-01T10:00:00Z',
    },
    {
        id: 'pol-004',
        name: 'Research and Development Policy (Internal)',
        description: 'Internal policy for using anonymized data for R&D purposes to innovate and develop new features, strictly within company premises.',
        dataCategories: ['Anonymized Usage Patterns', 'Feature Adoption Rates'],
        legalBasis: 'Legitimate Interest',
        retentionPeriod: 'Indefinite (anonymized)',
        version: 1,
        isActive: false, // Example of an inactive policy
        createdAt: '2023-08-01T16:00:00Z',
        updatedAt: '2023-08-01T16:00:00Z',
        regions: ['Global'],
        purpose: 'Internal R&D, Algorithm Training',
        thirdPartySharing: false,
        isAutomatedDecisionMaking: false,
        reviewCycleInDays: 90,
        lastReviewedAt: '2023-08-01T16:00:00Z',
        nextReviewAt: '2023-11-01T16:00:00Z',
    }
];

export let MOCK_DATA_SUBJECT_REQUESTS: DataSubjectRequest[] = [
    {
        id: 'dsr-001',
        userId: 'user-001',
        requestType: 'Erasure',
        status: 'Pending',
        details: 'I would like all my personal data to be deleted from your systems as per GDPR Article 17. My account ID is 12345.',
        submissionDate: '2023-10-26T09:00:00Z',
        requestedDataCategories: ['All Personal Data', 'Account Information'],
        notes: [{ id: 'note1', authorId: 'system', timestamp: '2023-10-26T09:00:00Z', content: 'Request received and logged.' }],
        priority: 'High',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    },
    {
        id: 'dsr-002',
        userId: 'user-005',
        requestType: 'Access',
        status: 'In Progress',
        details: 'Please provide a copy of all personal data you hold about me. I need it for a legal proceeding.',
        submissionDate: '2023-10-20T14:30:00Z',
        requestedDataCategories: ['All Personal Data', 'Transaction History', 'Communications'],
        assignedTo: 'privacy_officer_A',
        notes: [{ id: 'note2', authorId: 'privacy_officer_A', timestamp: '2023-10-21T10:00:00Z', content: 'Acknowledged and data collection initiated. Contacted legal team.' }],
        priority: 'Urgent',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'dsr-003',
        userId: 'user-010',
        requestType: 'Rectification',
        status: 'Completed',
        details: 'My address is incorrect in your records. It should be 123 Main St, Anytown, USA. Current is 456 Old Rd.',
        submissionDate: '2023-09-15T11:00:00Z',
        completionDate: '2023-09-17T15:00:00Z',
        requestedDataCategories: ['Address', 'Contact Information'],
        notes: [{ id: 'note3', authorId: 'privacy_officer_B', timestamp: '2023-09-16T09:00:00Z', content: 'Address updated in CRM and billing systems.' }],
        priority: 'Medium',
        dueDate: new Date(new Date('2023-09-15T11:00:00Z').getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'dsr-004',
        userId: 'user-015',
        requestType: 'Portability',
        status: 'Pending',
        details: 'I request my data in a machine-readable format.',
        submissionDate: '2023-11-01T10:00:00Z',
        requestedDataCategories: ['Account Data', 'Purchase History'],
        priority: 'Medium',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

export let MOCK_AUDIT_LOG: AuditLogEntry[] = [
    {
        id: 'aud-001',
        timestamp: '2023-10-27T10:00:00Z',
        userId: 'user-001',
        action: 'CONSENT_GRANTED',
        entityType: 'ConsentRecord',
        entityId: 'rec-123',
        details: 'Granted Marketing consent.',
        ipAddress: '192.168.1.1',
        affectedFields: ['status'], oldValue: 'Revoked', newValue: 'Granted',
    },
    {
        id: 'aud-002',
        timestamp: '2023-10-27T10:05:00Z',
        userId: 'user-002',
        action: 'CONSENT_REVOKED',
        entityType: 'ConsentRecord',
        entityId: 'rec-124',
        details: 'Revoked Data Sharing consent.',
        ipAddress: '10.0.0.5',
        affectedFields: ['status'], oldValue: 'Granted', newValue: 'Revoked',
    },
    {
        id: 'aud-003',
        timestamp: '2023-10-26T09:00:00Z',
        userId: 'system',
        action: 'DSR_RECEIVED',
        entityType: 'DataSubjectRequest',
        entityId: 'dsr-001',
        details: 'New Erasure request received for user-001.',
    },
    {
        id: 'aud-004',
        timestamp: '2023-03-20T11:30:00Z',
        userId: 'admin_user',
        action: 'POLICY_UPDATED',
        entityType: 'ConsentPolicy',
        entityId: 'pol-001',
        details: 'Consent Policy "Marketing Communications Policy (EU)" updated to version 2. Changed retention period.',
        affectedFields: ['version', 'retentionPeriod'], oldValue: { version: 1, retentionPeriod: '3 years' }, newValue: { version: 2, retentionPeriod: 'Until revoked' },
    },
    {
        id: 'aud-005',
        timestamp: '2023-11-02T10:00:00Z',
        userId: 'admin_user',
        action: 'DSR_STATUS_CHANGE',
        entityType: 'DataSubjectRequest',
        entityId: 'dsr-002',
        details: 'DSR dsr-002 status changed from Pending to In Progress. Note: Initiated data collection.',
        affectedFields: ['status', 'notes'], oldValue: 'Pending', newValue: 'In Progress',
    },
    {
        id: 'aud-006',
        timestamp: '2023-11-02T10:15:00Z',
        userId: 'admin_user',
        action: 'POLICY_CREATED',
        entityType: 'ConsentPolicy',
        entityId: 'pol-004',
        details: 'New policy "Research and Development Policy (Internal)" created.',
    },
];

export let MOCK_DATA_CATEGORY_DEFINITIONS: DataCategoryDefinition[] = [
    { id: 'dc-001', name: 'Email Address', description: 'User provided email address for communication.', sensitive: false, examples: ['john.doe@example.com'] },
    { id: 'dc-002', name: 'Name', description: 'First and last name of the user.', sensitive: false, examples: ['John Doe'] },
    { id: 'dc-003', name: 'Marketing Preferences', description: 'User choices regarding marketing communications.', sensitive: false, examples: ['Opt-in for newsletters', 'Opt-out of personalized ads'] },
    { id: 'dc-004', name: 'Browsing History', description: 'Record of websites or pages visited by the user.', sensitive: false, examples: ['homepage.com', 'product/xyz'] },
    { id: 'dc-005', name: 'User ID', description: 'Unique identifier assigned to a user in the system.', sensitive: false, examples: ['uuid-12345', 'cust-67890'] },
    { id: 'dc-006', name: 'IP Address', description: 'Internet Protocol address of the user device.', sensitive: true, examples: ['192.168.1.1', '203.0.113.45'] },
    { id: 'dc-007', name: 'Device Information', description: 'Details about the device used by the user (OS, model, etc.).', sensitive: false, examples: ['iOS 17, iPhone 14', 'Android 13, Samsung Galaxy'] },
    { id: 'dc-008', name: 'Transaction History', description: 'Record of purchases or financial transactions.', sensitive: true, examples: ['Order #12345, $50.00', 'Subscription renewal'] },
    { id: 'dc-009', name: 'Usage Data', description: 'Aggregated or anonymized data on how a product/service is used.', sensitive: false, examples: ['Login frequency', 'Feature X usage count'] },
    { id: 'dc-010', name: 'Crash Reports', description: 'Technical logs generated when an application crashes.', sensitive: false, examples: ['Stack trace, app version'] },
    { id: 'dc-011', name: 'Location Data', description: 'Geographical position data of the user or device.', sensitive: true, examples: ['Latitude 34.0, Longitude -118.2'] },
];

export let MOCK_THIRD_PARTY_INTEGRATIONS: ThirdPartyIntegration[] = [
    {
        id: 'tp-001',
        name: 'MailChimp',
        description: 'Email marketing automation platform.',
        dataCategoriesShared: ['Email Address', 'Name', 'Marketing Preferences'],
        regions: ['Global'],
        contractSigned: true,
        dpaSigned: true,
        status: 'Active',
        lastReviewedAt: '2023-01-01T00:00:00Z',
    },
    {
        id: 'tp-002',
        name: 'Google Analytics',
        description: 'Web analytics service for tracking website traffic.',
        dataCategoriesShared: ['Usage Data', 'IP Address', 'Browsing History'],
        regions: ['Global'],
        contractSigned: true,
        dpaSigned: true,
        status: 'Active',
        lastReviewedAt: '2023-01-01T00:00:00Z',
    },
    {
        id: 'tp-003',
        name: 'Stripe',
        description: 'Payment processing platform.',
        dataCategoriesShared: ['Transaction History', 'Partial Payment Info'],
        regions: ['Global'],
        contractSigned: true,
        dpaSigned: true,
        status: 'Active',
        lastReviewedAt: '2023-01-01T00:00:00Z',
    },
];


export const mockApi = {
    // --- Consent Records ---
    // Note: ConsentRecords are assumed to be managed primarily through DataContext,
    // so `fetchConsentRecords` here is more for demonstrating how a remote API
    // might interact with the local context data.
    fetchConsentRecords: async (currentConsentRecords: ConsentRecord[], filters: any = {}) => {
        await mockDelay(500);
        let records = [...currentConsentRecords]; // Work with a copy of the current context records

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            records = records.filter(r =>
                r.userId.toLowerCase().includes(searchTerm) ||
                r.consentType.toLowerCase().includes(searchTerm) ||
                r.status.toLowerCase().includes(searchTerm) ||
                r.details.toLowerCase().includes(searchTerm)
            );
        }
        if (filters.type && filters.type !== 'All') {
            records = records.filter(r => r.consentType === filters.type);
        }
        if (filters.status && filters.status !== 'All') {
            records = records.filter(r => r.status === filters.status);
        }
        return { data: records, total: records.length };
    },
    updateConsentRecordStatus: async (id: string, newStatus: 'Granted' | 'Revoked') => {
        await mockDelay(300);
        // In a real app, this would call backend, then backend updates its state.
        // Here, we simulate by finding and modifying the record in the context (via the parent component).
        console.log(`Simulating update of consent record ${id} to ${newStatus}`);
        return { id, status: newStatus, message: 'Consent status updated successfully.' };
    },

    // --- Consent Policies ---
    fetchConsentPolicies: async (filters: any = {}) => {
        await mockDelay(600);
        let policies: ConsentPolicy[] = [...MOCK_CONSENT_POLICIES];
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            policies = policies.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm) ||
                p.legalBasis.toLowerCase().includes(searchTerm) ||
                p.purpose.toLowerCase().includes(searchTerm) ||
                p.regions.some(r => r.toLowerCase().includes(searchTerm))
            );
        }
        if (filters.isActive !== undefined && filters.isActive !== 'All') {
            policies = policies.filter(p => p.isActive === filters.isActive);
        }
        return { data: policies, total: policies.length };
    },
    getConsentPolicyById: async (id: string) => {
        await mockDelay(300);
        const policy = MOCK_CONSENT_POLICIES.find(p => p.id === id);
        if (!policy) throw new Error('Policy not found');
        return policy;
    },
    createConsentPolicy: async (policyData: Omit<ConsentPolicy, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'lastReviewedAt' | 'nextReviewAt'>) => {
        await mockDelay(400);
        const newPolicy: ConsentPolicy = {
            ...policyData,
            id: `pol-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            version: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastReviewedAt: new Date().toISOString(),
            nextReviewAt: new Date(Date.now() + policyData.reviewCycleInDays * 24 * 60 * 60 * 1000).toISOString(),
        };
        MOCK_CONSENT_POLICIES.push(newPolicy);
        return newPolicy;
    },
    updateConsentPolicy: async (id: string, updates: Partial<ConsentPolicy>) => {
        await mockDelay(400);
        const index = MOCK_CONSENT_POLICIES.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Policy not found');
        const oldPolicy = MOCK_CONSENT_POLICIES[index];
        const updatedPolicy = {
            ...oldPolicy,
            ...updates,
            updatedAt: new Date().toISOString(),
            version: oldPolicy.version + 1,
            nextReviewAt: updates.reviewCycleInDays ? new Date(Date.now() + (updates.reviewCycleInDays || oldPolicy.reviewCycleInDays) * 24 * 60 * 60 * 1000).toISOString() : oldPolicy.nextReviewAt,
        };
        MOCK_CONSENT_POLICIES[index] = updatedPolicy;
        return updatedPolicy;
    },
    deleteConsentPolicy: async (id: string) => {
        await mockDelay(300);
        const initialLength = MOCK_CONSENT_POLICIES.length;
        MOCK_CONSENT_POLICIES = MOCK_CONSENT_POLICIES.filter(p => p.id !== id);
        if (MOCK_CONSENT_POLICIES.length === initialLength) throw new Error('Policy not found for deletion.');
        return { success: true, message: 'Policy deleted.' };
    },

    // --- Data Subject Requests ---
    fetchDataSubjectRequests: async (filters: any = {}) => {
        await mockDelay(700);
        let dsrs: DataSubjectRequest[] = [...MOCK_DATA_SUBJECT_REQUESTS];
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            dsrs = dsrs.filter(d =>
                d.userId.toLowerCase().includes(searchTerm) ||
                d.requestType.toLowerCase().includes(searchTerm) ||
                d.status.toLowerCase().includes(searchTerm) ||
                d.details.toLowerCase().includes(searchTerm)
            );
        }
        if (filters.status && filters.status !== 'All') {
            dsrs = dsrs.filter(d => d.status === filters.status);
        }
        if (filters.type && filters.type !== 'All') {
            dsrs = dsrs.filter(d => d.requestType === filters.type);
        }
        if (filters.priority && filters.priority !== 'All') {
            dsrs = dsrs.filter(d => d.priority === filters.priority);
        }
        return { data: dsrs, total: dsrs.length };
    },
    getDataSubjectRequestById: async (id: string) => {
        await mockDelay(300);
        const dsr = MOCK_DATA_SUBJECT_REQUESTS.find(d => d.id === id);
        if (!dsr) throw new Error('DSR not found');
        return dsr;
    },
    updateDataSubjectRequest: async (id: string, updates: Partial<DataSubjectRequest>, noteContent?: string) => {
        await mockDelay(400);
        const index = MOCK_DATA_SUBJECT_REQUESTS.findIndex(d => d.id === id);
        if (index === -1) throw new Error('DSR not found');
        const oldDSR = MOCK_DATA_SUBJECT_REQUESTS[index];
        const updatedDSR = { ...oldDSR, ...updates };

        if (updates.status && (updates.status === 'Completed' || updates.status === 'Rejected')) {
            updatedDSR.completionDate = new Date().toISOString();
        }

        if (noteContent) {
            const newNote: RequestNote = {
                id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                authorId: 'admin_user', // Mock admin user
                timestamp: new Date().toISOString(),
                content: noteContent,
            };
            updatedDSR.notes = [...updatedDSR.notes, newNote];
        }

        MOCK_DATA_SUBJECT_REQUESTS[index] = updatedDSR;

        MOCK_AUDIT_LOG.push({
            id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            timestamp: new Date().toISOString(),
            userId: 'admin_user',
            action: updates.status ? 'DSR_STATUS_CHANGE' : 'DSR_UPDATED',
            entityType: 'DataSubjectRequest',
            entityId: id,
            details: updates.status ? `DSR status changed to ${updates.status}` : `DSR updated.`,
            affectedFields: Object.keys(updates), oldValue: oldDSR, newValue: updatedDSR,
        });
        return updatedDSR;
    },
    addDSRNote: async (dsrId: string, noteContent: string, authorId: string) => {
        await mockDelay(200);
        const index = MOCK_DATA_SUBJECT_REQUESTS.findIndex(d => d.id === dsrId);
        if (index === -1) throw new Error('DSR not found');
        const newNote: RequestNote = {
            id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            authorId,
            timestamp: new Date().toISOString(),
            content: noteContent,
        };
        MOCK_DATA_SUBJECT_REQUESTS[index].notes.push(newNote);
        MOCK_AUDIT_LOG.push({
            id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            timestamp: new Date().toISOString(),
            userId: authorId,
            action: 'DSR_NOTE_ADDED',
            entityType: 'DataSubjectRequest',
            entityId: dsrId,
            details: `Note added to DSR by ${authorId}`,
        });
        return newNote;
    },

    // --- Audit Logs ---
    fetchAuditLogs: async (filters: any = {}) => {
        await mockDelay(500);
        let logs: AuditLogEntry[] = [...MOCK_AUDIT_LOG];
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            logs = logs.filter(l =>
                l.userId.toLowerCase().includes(searchTerm) ||
                l.action.toLowerCase().includes(searchTerm) ||
                l.details.toLowerCase().includes(searchTerm) ||
                l.entityId.toLowerCase().includes(searchTerm)
            );
        }
        if (filters.entityType && filters.entityType !== 'All') {
            logs = logs.filter(l => l.entityType === filters.entityType);
        }
        if (filters.action && filters.action !== 'All') {
            logs = logs.filter(l => l.action === filters.action);
        }
        return { data: logs, total: logs.length };
    },

    // --- Reporting ---
    fetchConsentTrendData: async (timeframe: 'week' | 'month' | 'quarter' | 'year') => {
        await mockDelay(800);
        const endDate = new Date();
        const startDate = new Date();
        if (timeframe === 'week') startDate.setDate(endDate.getDate() - 7);
        else if (timeframe === 'month') startDate.setMonth(endDate.getMonth() - 1);
        else if (timeframe === 'quarter') startDate.setMonth(endDate.getMonth() - 3);
        else if (timeframe === 'year') startDate.setFullYear(endDate.getFullYear() - 1);

        const data: ConsentTrendData[] = [];
        let current = new Date(startDate);
        while (current <= endDate) {
            const granted = Math.floor(Math.random() * 50) + 100;
            const revoked = Math.floor(Math.random() * 20) + 10;
            data.push({
                date: current.toISOString().split('T')[0],
                granted: granted,
                revoked: revoked,
                newConsents: Math.floor(granted * 0.7), // Simulate new consents being a portion of granted
                optOuts: revoked,
            });
            current.setDate(current.getDate() + 1);
        }
        return data;
    },

    // --- Data Categories ---
    fetchDataCategoryDefinitions: async (filters: any = {}) => {
        await mockDelay(300);
        let categories = [...MOCK_DATA_CATEGORY_DEFINITIONS];
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            categories = categories.filter(c =>
                c.name.toLowerCase().includes(searchTerm) ||
                c.description.toLowerCase().includes(searchTerm)
            );
        }
        if (filters.sensitive !== undefined && filters.sensitive !== 'All') {
            categories = categories.filter(c => c.sensitive === (filters.sensitive === 'true'));
        }
        return { data: categories, total: categories.length };
    },
    createDataCategoryDefinition: async (categoryData: Omit<DataCategoryDefinition, 'id'>) => {
        await mockDelay(400);
        const newCategory: DataCategoryDefinition = {
            ...categoryData,
            id: `dc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        };
        MOCK_DATA_CATEGORY_DEFINITIONS.push(newCategory);
        return newCategory;
    },
    updateDataCategoryDefinition: async (id: string, updates: Partial<DataCategoryDefinition>) => {
        await mockDelay(400);
        const index = MOCK_DATA_CATEGORY_DEFINITIONS.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Data Category not found');
        MOCK_DATA_CATEGORY_DEFINITIONS[index] = { ...MOCK_DATA_CATEGORY_DEFINITIONS[index], ...updates };
        return MOCK_DATA_CATEGORY_DEFINITIONS[index];
    },
    deleteDataCategoryDefinition: async (id: string) => {
        await mockDelay(300);
        const initialLength = MOCK_DATA_CATEGORY_DEFINITIONS.length;
        MOCK_DATA_CATEGORY_DEFINITIONS = MOCK_DATA_CATEGORY_DEFINITIONS.filter(c => c.id !== id);
        if (MOCK_DATA_CATEGORY_DEFINITIONS.length === initialLength) throw new Error('Data Category not found for deletion.');
        return { success: true, message: 'Data category deleted.' };
    },

    // --- Third Party Integrations ---
    fetchThirdPartyIntegrations: async (filters: any = {}) => {
        await mockDelay(500);
        let integrations = [...MOCK_THIRD_PARTY_INTEGRATIONS];
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            integrations = integrations.filter(i =>
                i.name.toLowerCase().includes(searchTerm) ||
                i.description.toLowerCase().includes(searchTerm) ||
                i.regions.some(r => r.toLowerCase().includes(searchTerm))
            );
        }
        if (filters.status && filters.status !== 'All') {
            integrations = integrations.filter(i => i.status === filters.status);
        }
        return { data: integrations, total: integrations.length };
    },
    updateThirdPartyIntegration: async (id: string, updates: Partial<ThirdPartyIntegration>) => {
        await mockDelay(400);
        const index = MOCK_THIRD_PARTY_INTEGRATIONS.findIndex(i => i.id === id);
        if (index === -1) throw new Error('Integration not found');
        MOCK_THIRD_PARTY_INTEGRATIONS[index] = { ...MOCK_THIRD_PARTY_INTEGRATIONS[index], ...updates };
        MOCK_THIRD_PARTY_INTEGRATIONS[index].lastReviewedAt = new Date().toISOString();
        return MOCK_THIRD_PARTY_INTEGRATIONS[index];
    },
};

// --- REUSABLE UI COMPONENTS ---
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' }> = ({ isOpen, onClose, title, children, size = 'xl' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl', '3xl': 'max-w-3xl', '4xl': 'max-w-4xl'
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className={`bg-gray-800 rounded-lg shadow-2xl w-full ${sizeClasses[size]} mx-auto`} onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const Table: React.FC<{
    headers: { key: string; label: string; sortable?: boolean; className?: string }[];
    data: any[];
    renderRow: (item: any) => React.ReactNode;
    onSort?: (key: string) => void;
    sortConfig?: { key: string; direction: 'ascending' | 'descending' } | null;
    rowKeyExtractor?: (item: any) => string | number;
}> = ({ headers, data, renderRow, onSort, sortConfig, rowKeyExtractor = (item) => item.id || Math.random() }) => {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                    <tr>
                        {headers.map((header) => (
                            <th
                                key={header.key}
                                scope="col"
                                className={`px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${header.sortable ? 'cursor-pointer hover:bg-gray-600' : ''} ${header.className || ''}`}
                                onClick={() => header.sortable && onSort && onSort(header.key)}
                            >
                                {header.label}
                                {header.sortable && sortConfig?.key === header.key && (
                                    <span className="ml-1">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={headers.length} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                No data available.
                            </td>
                        </tr>
                    ) : (
                        data.map((item) => (
                            <tr key={rowKeyExtractor(item)} className="hover:bg-gray-700">
                                {renderRow(item)}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export const Pagination: React.FC<{
    currentPage: number;
    maxPage: number;
    next: () => void;
    prev: () => void;
    jump: (page: number) => void;
}> = ({ currentPage, maxPage, next, prev, jump }) => {
    const pageNumbers = useMemo(() => {
        const pages: (number | string)[] = [];
        if (maxPage <= 5) {
            for (let i = 1; i <= maxPage; i++) pages.push(i);
        } else {
            const start = Math.max(1, currentPage - 1);
            const end = Math.min(maxPage, currentPage + 1);

            if (start > 1) {
                pages.push(1);
                if (start > 2) pages.push('...');
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < maxPage) {
                if (end < maxPage - 1) pages.push('...');
                pages.push(maxPage);
            }
        }
        return Array.from(new Set(pages)); // Remove duplicates
    }, [currentPage, maxPage]);

    return (
        <nav className="mt-4 flex items-center justify-between text-white">
            <button onClick={prev} disabled={currentPage === 1} className="px-3 py-1 bg-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-600 transition-colors duration-200">Previous</button>
            <ul className="flex space-x-2">
                {pageNumbers.map((page, index) => (
                    <li key={index}>
                        {typeof page === 'number' ? (
                            <button
                                onClick={() => jump(page)}
                                className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-cyan-600' : 'bg-gray-700 hover:bg-gray-600'} transition-colors duration-200`}
                            >
                                {page}
                            </button>
                        ) : (
                            <span className="px-3 py-1 text-gray-400">...</span>
                        )}
                    </li>
                ))}
            </ul>
            <button onClick={next} disabled={currentPage === maxPage} className="px-3 py-1 bg-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-600 transition-colors duration-200">Next</button>
        </nav>
    );
};

export const FilterDropdown: React.FC<{
    label: string;
    options: { value: string; label: string }[];
    selectedValue: string;
    onChange: (value: string) => void;
    className?: string;
    includeAllOption?: boolean;
    allOptionLabel?: string;
}> = ({ label, options, selectedValue, onChange, className, includeAllOption = true, allOptionLabel = 'All' }) => {
    const allOptions = includeAllOption ? [{ value: 'All', label: allOptionLabel }, ...options] : options;
    return (
        <div className={`flex flex-col ${className}`}>
            <label htmlFor={`filter-${label.replace(/\s/g, '-')}`} className="text-sm font-medium text-gray-300 mb-1">{label}</label>
            <select
                id={`filter-${label.replace(/\s/g, '-')}`}
                value={selectedValue}
                onChange={(e) => onChange(e.target.value)}
                className="bg-gray-700/50 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-cyan-500 appearance-none bg-no-repeat bg-right-center pr-8"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='%239CA3AF' d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z'/%3E%3C/svg%3E")`, backgroundSize: '1.5em 1.5em' }}
            >
                {allOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );
};

// --- NEW MAIN SECTIONS/COMPONENTS ---

export const ConsentRecordsManagement: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("ConsentRecordsManagement must be within DataProvider");
    const { consentRecords, updateConsentRecordInContext } = context;

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedRecord, setSelectedRecord] = useState<ConsentRecord | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isLoadingRecordUpdate, setIsLoadingRecordUpdate] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const filteredRecords = useMemo(() => {
        let currentRecords = [...consentRecords];

        if (debouncedSearchTerm) {
            const lowerCaseSearchTerm = debouncedSearchTerm.toLowerCase();
            currentRecords = currentRecords.filter(r =>
                r.userId.toLowerCase().includes(lowerCaseSearchTerm) ||
                r.consentType.toLowerCase().includes(lowerCaseSearchTerm) ||
                r.status.toLowerCase().includes(lowerCaseSearchTerm) ||
                r.details.toLowerCase().includes(lowerCaseSearchTerm) ||
                r.source.toLowerCase().includes(lowerCaseSearchTerm) ||
                r.legalBasis.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }
        if (filterType !== 'All') {
            currentRecords = currentRecords.filter(r => r.consentType === filterType);
        }
        if (filterStatus !== 'All') {
            currentRecords = currentRecords.filter(r => r.status === filterStatus);
        }
        return currentRecords;
    }, [consentRecords, debouncedSearchTerm, filterType, filterStatus]);

    const { sortedData, requestSort, sortConfig } = useSort(filteredRecords, { key: 'timestamp', direction: 'descending' });
    const { currentData, currentPage, maxPage, next, prev, jump } = usePagination(sortedData, 10);

    const handleViewDetails = (record: ConsentRecord) => {
        setSelectedRecord(record);
        setIsDetailModalOpen(true);
    };

    const handleUpdateRecordStatus = async (recordId: string, newStatus: 'Granted' | 'Revoked') => {
        setIsLoadingRecordUpdate(true);
        setError(null);
        try {
            const updatedRecordData = { ...selectedRecord!, status: newStatus, timestamp: new Date().toISOString() };
            // Optimistically update UI
            setSelectedRecord(updatedRecordData);
            updateConsentRecordInContext(updatedRecordData); // Update context immediately

            await mockApi.updateConsentRecordStatus(recordId, newStatus);
            // After successful mock API call, the context update should be authoritative.

            MOCK_AUDIT_LOG.push({
                id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                timestamp: new Date().toISOString(),
                userId: 'admin_user',
                action: newStatus === 'Granted' ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED',
                entityType: 'ConsentRecord',
                entityId: recordId,
                details: `Consent for ${selectedRecord?.consentType} ${newStatus} for user ${selectedRecord?.userId}.`,
                affectedFields: ['status'], oldValue: selectedRecord?.status, newValue: newStatus,
            });

            setIsDetailModalOpen(false);
        } catch (err: any) {
            setError('Failed to update consent status: ' + err.message);
            // In a real app, you would revert the optimistic update here.
            const originalRecord = consentRecords.find(r => r.id === recordId);
            if (originalRecord) {
                setSelectedRecord(originalRecord);
                updateConsentRecordInContext(originalRecord);
            }
        } finally {
            setIsLoadingRecordUpdate(false);
        }
    };

    return (
        <Card title="All Consent Records" className="col-span-full">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by User ID, Type, Status, Details..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow bg-gray-700/50 p-2 rounded border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <FilterDropdown
                    label="Consent Type"
                    options={[{ value: 'Marketing', label: 'Marketing' }, { value: 'Data Sharing', label: 'Data Sharing' }, { value: 'Analytics', label: 'Analytics' }, { value: 'Essential', label: 'Essential' }]}
                    selectedValue={filterType}
                    onChange={setFilterType}
                />
                <FilterDropdown
                    label="Status"
                    options={[{ value: 'Granted', label: 'Granted' }, { value: 'Revoked', label: 'Revoked' }]}
                    selectedValue={filterStatus}
                    onChange={setFilterStatus}
                />
            </div>
            {error && <div className="p-3 bg-red-800 text-white rounded mb-4">{error}</div>}
            <Table
                headers={[
                    { key: 'userId', label: 'User ID', sortable: true },
                    { key: 'consentType', label: 'Type', sortable: true },
                    { key: 'status', label: 'Status', sortable: true },
                    { key: 'legalBasis', label: 'Legal Basis', sortable: true },
                    { key: 'source', label: 'Source', sortable: true },
                    { key: 'timestamp', label: 'Last Updated', sortable: true },
                    { key: 'actions', label: 'Actions', className: 'w-24 text-center' },
                ]}
                data={currentData}
                renderRow={(record: ConsentRecord) => (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.userId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.consentType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'Granted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {record.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.legalBasis}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{record.source}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(record.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                            <button onClick={() => handleViewDetails(record)} className="text-cyan-500 hover:text-cyan-700 transition-colors duration-200">View</button>
                        </td>
                    </>
                )}
                onSort={(key) => requestSort(key as keyof ConsentRecord)}
                sortConfig={sortConfig}
            />
            <Pagination currentPage={currentPage} maxPage={maxPage} next={next} prev={prev} jump={jump} />

            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Consent Record Details" size="md">
                {selectedRecord && (
                    <div className="space-y-4 text-white">
                        <p><strong>User ID:</strong> {selectedRecord.userId}</p>
                        <p><strong>Consent Type:</strong> {selectedRecord.consentType}</p>
                        <p><strong>Status:</strong> <span className={`font-semibold ${selectedRecord.status === 'Granted' ? 'text-green-400' : 'text-red-400'}`}>{selectedRecord.status}</span></p>
                        <p><strong>Legal Basis:</strong> {selectedRecord.legalBasis}</p>
                        <p><strong>Source:</strong> {selectedRecord.source}</p>
                        <p><strong>Timestamp:</strong> {new Date(selectedRecord.timestamp).toLocaleString()}</p>
                        {selectedRecord.expirationDate && <p><strong>Expiration:</strong> {new Date(selectedRecord.expirationDate).toLocaleString()}</p>}
                        <p><strong>Details:</strong> {selectedRecord.details}</p>

                        <div className="pt-4 border-t border-gray-700 flex space-x-4">
                            <button
                                onClick={() => handleUpdateRecordStatus(selectedRecord.id, selectedRecord.status === 'Granted' ? 'Revoked' : 'Granted')}
                                disabled={isLoadingRecordUpdate}
                                className={`px-4 py-2 rounded-lg text-white font-medium ${selectedRecord.status === 'Granted' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-50 transition-colors duration-200`}
                            >
                                {isLoadingRecordUpdate ? 'Updating...' : (selectedRecord.status === 'Granted' ? 'Revoke Consent' : 'Grant Consent')}
                            </button>
                            <button onClick={() => setIsDetailModalOpen(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors duration-200">Close</button>
                        </div>
                    </div>
                )}
            </Modal>
        </Card>
    );
};

export const ConsentPoliciesManagement: React.FC = () => {
    const [policies, setPolicies] = useState<ConsentPolicy[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [filterActive, setFilterActive] = useState('All'); // 'All', 'true', 'false'

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<ConsentPolicy | null>(null);

    const fetchPolicies = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const filters: any = { search: debouncedSearchTerm };
            if (filterActive !== 'All') {
                filters.isActive = filterActive === 'true';
            }
            const response = await mockApi.fetchConsentPolicies(filters);
            setPolicies(response.data);
        } catch (err: any) {
            setError('Failed to fetch policies: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearchTerm, filterActive]);

    useEffect(() => {
        fetchPolicies();
    }, [fetchPolicies]);

    const handleCreatePolicy = () => {
        setEditingPolicy(null);
        setIsFormModalOpen(true);
    };

    const handleEditPolicy = (policy: ConsentPolicy) => {
        setEditingPolicy(policy);
        setIsFormModalOpen(true);
    };

    const handleDeletePolicy = async (policyId: string) => {
        if (!confirm('Are you sure you want to delete this policy? This action cannot be undone.')) return;
        setIsLoading(true);
        setError(null);
        try {
            await mockApi.deleteConsentPolicy(policyId);
            await fetchPolicies();
            MOCK_AUDIT_LOG.push({
                id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                timestamp: new Date().toISOString(),
                userId: 'admin_user',
                action: 'POLICY_DELETED',
                entityType: 'ConsentPolicy',
                entityId: policyId,
                details: `Consent policy ${policyId} deleted.`,
            });
        } catch (err: any) {
            setError('Failed to delete policy: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePolicyFormSubmit = async (policyData: ConsentPolicy) => {
        setIsLoading(true);
        setError(null);
        try {
            let resultPolicy: ConsentPolicy;
            if (editingPolicy) {
                resultPolicy = await mockApi.updateConsentPolicy(policyData.id, policyData);
                MOCK_AUDIT_LOG.push({
                    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    timestamp: new Date().toISOString(),
                    userId: 'admin_user',
                    action: 'POLICY_UPDATED',
                    entityType: 'ConsentPolicy',
                    entityId: policyData.id,
                    details: `Consent policy "${policyData.name}" updated to version ${resultPolicy.version}.`,
                });
            } else {
                const { id, createdAt, updatedAt, version, lastReviewedAt, nextReviewAt, ...rest } = policyData; // Exclude generated fields
                resultPolicy = await mockApi.createConsentPolicy(rest);
                MOCK_AUDIT_LOG.push({
                    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    timestamp: new Date().toISOString(),
                    userId: 'admin_user',
                    action: 'POLICY_CREATED',
                    entityType: 'ConsentPolicy',
                    entityId: resultPolicy.id,
                    details: `New consent policy "${resultPolicy.name}" created.`,
                });
            }
            setIsFormModalOpen(false);
            setEditingPolicy(null);
            await fetchPolicies();
        } catch (err: any) {
            setError('Failed to save policy: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const { sortedData, requestSort, sortConfig } = useSort(policies, { key: 'updatedAt', direction: 'descending' });
    const { currentData, currentPage, maxPage, next, prev, jump } = usePagination(sortedData, 8);

    return (
        <Card title="Consent Policies" className="col-span-full">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
                <input
                    type="text"
                    placeholder="Search policies by name, description, legal basis..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow bg-gray-700/50 p-2 rounded border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <FilterDropdown
                    label="Status"
                    options={[{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]}
                    selectedValue={filterActive}
                    onChange={setFilterActive}
                    className="w-full md:w-auto"
                    allOptionLabel="All Statuses"
                />
                <button onClick={handleCreatePolicy} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium w-full md:w-auto transition-colors duration-200">
                    + New Policy
                </button>
            </div>
            {isLoading && <p className="text-white text-center py-4">Loading policies...</p>}
            {error && <div className="p-3 bg-red-800 text-white rounded mb-4">{error}</div>}
            <Table
                headers={[
                    { key: 'name', label: 'Policy Name', sortable: true },
                    { key: 'legalBasis', label: 'Legal Basis', sortable: true },
                    { key: 'regions', label: 'Regions' },
                    { key: 'version', label: 'Version', sortable: true },
                    { key: 'isActive', label: 'Active', sortable: true },
                    { key: 'lastReviewedAt', label: 'Last Reviewed', sortable: true },
                    { key: 'nextReviewAt', label: 'Next Review', sortable: true },
                    { key: 'actions', label: 'Actions', className: 'w-32 text-center' },
                ]}
                data={currentData}
                renderRow={(policy: ConsentPolicy) => (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{policy.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{policy.legalBasis}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{policy.regions.join(', ')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{policy.version}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${policy.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {policy.isActive ? 'Yes' : 'No'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(policy.lastReviewedAt || policy.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{policy.nextReviewAt ? new Date(policy.nextReviewAt).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                            <button onClick={() => handleEditPolicy(policy)} className="text-indigo-500 hover:text-indigo-700 mr-3 transition-colors duration-200">Edit</button>
                            <button onClick={() => handleDeletePolicy(policy.id)} className="text-red-500 hover:text-red-700 transition-colors duration-200">Delete</button>
                        </td>
                    </>
                )}
                onSort={(key) => requestSort(key as keyof ConsentPolicy)}
                sortConfig={sortConfig}
            />
            <Pagination currentPage={currentPage} maxPage={maxPage} next={next} prev={prev} jump={jump} />

            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={editingPolicy ? "Edit Consent Policy" : "Create New Consent Policy"} size="3xl">
                <ConsentPolicyForm
                    policy={editingPolicy}
                    onSubmit={handlePolicyFormSubmit}
                    onCancel={() => setIsFormModalOpen(false)}
                    isLoading={isLoading}
                />
            </Modal>
        </Card>
    );
};

export const ConsentPolicyForm: React.FC<{
    policy: ConsentPolicy | null;
    onSubmit: (policyData: ConsentPolicy) => void;
    onCancel: () => void;
    isLoading: boolean;
}> = ({ policy, onSubmit, onCancel, isLoading }) => {
    const [formData, setFormData] = useState<ConsentPolicy>(policy || {
        id: '',
        name: '',
        description: '',
        dataCategories: [],
        legalBasis: 'Consent',
        retentionPeriod: '',
        version: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        regions: [],
        purpose: '',
        thirdPartySharing: false,
        thirdPartyList: [],
        isAutomatedDecisionMaking: false,
        automatedDecisionDetails: '',
        reviewCycleInDays: 365,
        lastReviewedAt: undefined,
        nextReviewAt: undefined,
    });

    useEffect(() => {
        setFormData(policy || {
            id: '', name: '', description: '', dataCategories: [], legalBasis: 'Consent', retentionPeriod: '',
            version: 1, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
            regions: [], purpose: '', thirdPartySharing: false, thirdPartyList: [],
            isAutomatedDecisionMaking: false, automatedDecisionDetails: '', reviewCycleInDays: 365,
            lastReviewedAt: undefined, nextReviewAt: undefined,
        });
    }, [policy]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleArrayChange = (name: keyof ConsentPolicy, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value.split(',').map(s => s.trim()).filter(s => s.length > 0)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">Policy Name</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
                           className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                <div>
                    <label htmlFor="purpose" className="block text-sm font-medium text-gray-300">Purpose</label>
                    <input type="text" id="purpose" name="purpose" value={formData.purpose} onChange={handleChange} required
                           className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} required
                              className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                </div>
                <div>
                    <label htmlFor="dataCategories" className="block text-sm font-medium text-gray-300">Data Categories (comma-separated)</label>
                    <input type="text" id="dataCategories" name="dataCategories" value={formData.dataCategories.join(', ')} onChange={(e) => handleArrayChange('dataCategories', e.target.value)}
                           className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                <div>
                    <label htmlFor="legalBasis" className="block text-sm font-medium text-gray-300">Legal Basis</label>
                    <select id="legalBasis" name="legalBasis" value={formData.legalBasis} onChange={handleChange} required
                            className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-cyan-500 focus:border-cyan-500 appearance-none bg-no-repeat bg-right-center pr-8"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='%239CA3AF' d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z'/%3E%3C/svg%3E")`, backgroundSize: '1.5em 1.5em' }}>
                        <option value="Consent">Consent</option>
                        <option value="Contract">Contract</option>
                        <option value="Legitimate Interest">Legitimate Interest</option>
                        <option value="Legal Obligation">Legal Obligation</option>
                        <option value="Public Task">Public Task</option>
                        <option value="Vital Interests">Vital Interests</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="retentionPeriod" className="block text-sm font-medium text-gray-300">Retention Period</label>
                    <input type="text" id="retentionPeriod" name="retentionPeriod" value={formData.retentionPeriod} onChange={handleChange} required
                           className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                <div>
                    <label htmlFor="regions" className="block text-sm font-medium text-gray-300">Regions (comma-separated, e.g., EU, US, Global)</label>
                    <input type="text" id="regions" name="regions" value={formData.regions.join(', ')} onChange={(e) => handleArrayChange('regions', e.target.value)}
                           className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                <div>
                    <label htmlFor="reviewCycleInDays" className="block text-sm font-medium text-gray-300">Review Cycle (Days)</label>
                    <input type="number" id="reviewCycleInDays" name="reviewCycleInDays" value={formData.reviewCycleInDays} onChange={handleChange} required min="1"
                           className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
            </div>

            <div className="pt-4 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                    <input type="checkbox" id="thirdPartySharing" name="thirdPartySharing" checked={formData.thirdPartySharing} onChange={handleChange}
                           className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded bg-gray-700/50" />
                    <label htmlFor="thirdPartySharing" className="text-sm font-medium text-gray-300">Third-Party Sharing</label>
                </div>
                <div className="flex items-center space-x-2">
                    <input type="checkbox" id="isAutomatedDecisionMaking" name="isAutomatedDecisionMaking" checked={formData.isAutomatedDecisionMaking} onChange={handleChange}
                           className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded bg-gray-700/50" />
                    <label htmlFor="isAutomatedDecisionMaking" className="text-sm font-medium text-gray-300">Automated Decision Making</label>
                </div>
                {formData.thirdPartySharing && (
                    <div className="md:col-span-2">
                        <label htmlFor="thirdPartyList" className="block text-sm font-medium text-gray-300">Third Parties (comma-separated)</label>
                        <input type="text" id="thirdPartyList" name="thirdPartyList" value={formData.thirdPartyList.join(', ')} onChange={(e) => handleArrayChange('thirdPartyList', e.target.value)}
                               className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-cyan-500 focus:border-cyan-500" />
                    </div>
                )}
                {formData.isAutomatedDecisionMaking && (
                    <div className="md:col-span-2">
                        <label htmlFor="automatedDecisionDetails" className="block text-sm font-medium text-gray-300">Automated Decision Details</label>
                        <textarea id="automatedDecisionDetails" name="automatedDecisionDetails" value={formData.automatedDecisionDetails} onChange={handleChange} rows={2}
                                  className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                    </div>
                )}
                <div className="flex items-center space-x-2 md:col-span-2">
                    <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange}
                           className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded bg-gray-700/50" />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-300">Active Policy</label>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-700 flex justify-end space-x-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors duration-200">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-medium disabled:opacity-50 transition-colors duration-200">
                    {isLoading ? 'Saving...' : (policy ? 'Update Policy' : 'Create Policy')}
                </button>
            </div>
        </form>
    );
};

export const DataSubjectRequestsManagement: React.FC = () => {
    const [dsrs, setDsrs] = useState<DataSubjectRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [filterType, setFilterType] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPriority, setFilterPriority] = useState('All');

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedDSR, setSelectedDSR] = useState<DataSubjectRequest | null>(null);

    const fetchDSRs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const filters: any = { search: debouncedSearchTerm };
            if (filterType !== 'All') filters.type = filterType;
            if (filterStatus !== 'All') filters.status = filterStatus;
            if (filterPriority !== 'All') filters.priority = filterPriority;
            const response = await mockApi.fetchDataSubjectRequests(filters);
            setDsrs(response.data);
        } catch (err: any) {
            setError('Failed to fetch DSRs: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearchTerm, filterType, filterStatus, filterPriority]);

    useEffect(() => {
        fetchDSRs();
    }, [fetchDSRs]);

    const handleViewDetails = (dsr: DataSubjectRequest) => {
        setSelectedDSR(dsr);
        setIsDetailModalOpen(true);
    };

    const handleUpdateDSR = async (dsrId: string, updates: Partial<DataSubjectRequest>, noteContent?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const updatedDSR = await mockApi.updateDataSubjectRequest(dsrId, updates, noteContent);
            setDsrs(prev => prev.map(d => d.id === dsrId ? updatedDSR : d));
            setSelectedDSR(updatedDSR); // Update selected DSR in modal
        } catch (err: any) {
            setError('Failed to update DSR: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNote = async (dsrId: string, noteContent: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const newNote = await mockApi.addDSRNote(dsrId, noteContent, 'admin_user');
            setDsrs(prev => prev.map(d => d.id === dsrId ? { ...d, notes: [...d.notes, newNote] } : d));
            if (selectedDSR && selectedDSR.id === dsrId) {
                setSelectedDSR(prev => prev ? { ...prev, notes: [...prev.notes, newNote] } : null);
            }
        } catch (err: any) {
            setError('Failed to add note: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const { sortedData, requestSort, sortConfig } = useSort(dsrs, { key: 'submissionDate', direction: 'descending' });
    const { currentData, currentPage, maxPage, next, prev, jump } = usePagination(sortedData, 10);

    return (
        <Card title="Data Subject Requests" className="col-span-full">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by User ID, Request Type, Status, Details..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow bg-gray-700/50 p-2 rounded border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <FilterDropdown
                    label="Request Type"
                    options={[{ value: 'Access', label: 'Access' }, { value: 'Erasure', label: 'Erasure' }, { value: 'Rectification', label: 'Rectification' }, { value: 'Portability', label: 'Portability' }, { value: 'Objection', label: 'Objection' }, { value: 'Restriction', label: 'Restriction' }]}
                    selectedValue={filterType}
                    onChange={setFilterType}
                />
                <FilterDropdown
                    label="Status"
                    options={[{ value: 'Pending', label: 'Pending' }, { value: 'In Progress', label: 'In Progress' }, { value: 'Completed', label: 'Completed' }, { value: 'Rejected', label: 'Rejected' }, { value: 'On Hold', label: 'On Hold' }]}
                    selectedValue={filterStatus}
                    onChange={setFilterStatus}
                />
                <FilterDropdown
                    label="Priority"
                    options={[{ value: 'Low', label: 'Low' }, { value: 'Medium', label: 'Medium' }, { value: 'High', label: 'High' }, { value: 'Urgent', label: 'Urgent' }]}
                    selectedValue={filterPriority}
                    onChange={setFilterPriority}
                />
            </div>
            {isLoading && <p className="text-white text-center py-4">Loading DSRs...</p>}
            {error && <div className="p-3 bg-red-800 text-white rounded mb-4">{error}</div>}
            <Table
                headers={[
                    { key: 'userId', label: 'User ID', sortable: true },
                    { key: 'requestType', label: 'Type', sortable: true },
                    { key: 'status', label: 'Status', sortable: true },
                    { key: 'priority', label: 'Priority', sortable: true },
                    { key: 'submissionDate', label: 'Submitted', sortable: true },
                    { key: 'dueDate', label: 'Due Date', sortable: true },
                    { key: 'actions', label: 'Actions', className: 'w-28 text-center' },
                ]}
                data={currentData}
                renderRow={(dsr: DataSubjectRequest) => (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dsr.userId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{dsr.requestType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                ${dsr.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                dsr.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                                dsr.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                                dsr.status === 'On Hold' ? 'bg-purple-100 text-purple-800' :
                                'bg-red-100 text-red-800'}`
                            }>
                                {dsr.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                ${dsr.priority === 'Urgent' ? 'bg-red-700 text-white' :
                                dsr.priority === 'High' ? 'bg-orange-600 text-white' :
                                dsr.priority === 'Medium' ? 'bg-yellow-500 text-gray-900' :
                                'bg-gray-500 text-white'}`
                            }>
                                {dsr.priority}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(dsr.submissionDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {new Date(dsr.dueDate).toLocaleDateString()}
                            {new Date(dsr.dueDate) < new Date() && dsr.status !== 'Completed' && dsr.status !== 'Rejected' && <span className="ml-2 text-red-500 font-bold">(OVERDUE)</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                            <button onClick={() => handleViewDetails(dsr)} className="text-cyan-500 hover:text-cyan-700 transition-colors duration-200">View Details</button>
                        </td>
                    </>
                )}
                onSort={(key) => requestSort(key as keyof DataSubjectRequest)}
                sortConfig={sortConfig}
            />
            <Pagination currentPage={currentPage} maxPage={maxPage} next={next} prev={prev} jump={jump} />

            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Data Subject Request Details" size="3xl">
                {selectedDSR && (
                    <DSRDetailView
                        dsr={selectedDSR}
                        onUpdateDSR={handleUpdateDSR}
                        onAddNote={handleAddNote}
                        isLoading={isLoading}
                        error={error}
                    />
                )}
            </Modal>
        </Card>
    );
};

export const DSRDetailView: React.FC<{
    dsr: DataSubjectRequest;
    onUpdateDSR: (id: string, updates: Partial<DataSubjectRequest>, noteContent?: string) => Promise<void>;
    onAddNote: (id: string, noteContent: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}> = ({ dsr, onUpdateDSR, onAddNote, isLoading, error }) => {
    const [newNoteContent, setNewNoteContent] = useState('');
    const [statusChangeNote, setStatusChangeNote] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<DataSubjectRequest['status']>(dsr.status);
    const [selectedPriority, setSelectedPriority] = useState<DataSubjectRequest['priority']>(dsr.priority);
    const [assignedTo, setAssignedTo] = useState<string>(dsr.assignedTo || '');
    const [dueDate, setDueDate] = useState<string>(new Date(dsr.dueDate).toISOString().split('T')[0]);

    useEffect(() => {
        setSelectedStatus(dsr.status);
        setSelectedPriority(dsr.priority);
        setAssignedTo(dsr.assignedTo || '');
        setDueDate(new Date(dsr.dueDate).toISOString().split('T')[0]);
    }, [dsr]);

    const handleUpdateDetails = async () => {
        const updates: Partial<DataSubjectRequest> = {};
        let note = '';
        if (selectedStatus !== dsr.status) {
            updates.status = selectedStatus;
            note += `Status changed from ${dsr.status} to ${selectedStatus}. `;
        }
        if (selectedPriority !== dsr.priority) {
            updates.priority = selectedPriority;
            note += `Priority changed from ${dsr.priority} to ${selectedPriority}. `;
        }
        if (assignedTo !== dsr.assignedTo) {
            updates.assignedTo = assignedTo;
            note += `Assigned to ${assignedTo || 'Unassigned'}. `;
        }
        if (dueDate !== new Date(dsr.dueDate).toISOString().split('T')[0]) {
            updates.dueDate = new Date(dueDate).toISOString();
            note += `Due date changed to ${new Date(dueDate).toLocaleDateString()}. `;
        }

        if (Object.keys(updates).length > 0) {
            await onUpdateDSR(dsr.id, updates, statusChangeNote ? note + statusChangeNote : note.trim());
            setStatusChangeNote('');
        }
    };

    const handleNoteSubmit = async () => {
        if (newNoteContent.trim()) {
            await onAddNote(dsr.id, newNoteContent);
            setNewNoteContent('');
        }
    };

    const getStatusColor = (status: DataSubjectRequest['status']) => {
        switch (status) {
            case 'Completed': return 'text-green-400';
            case 'In Progress': return 'text-yellow-400';
            case 'Pending': return 'text-blue-400';
            case 'On Hold': return 'text-purple-400';
            case 'Rejected': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getPriorityColor = (priority: DataSubjectRequest['priority']) => {
        switch (priority) {
            case 'Urgent': return 'bg-red-700 text-white';
            case 'High': return 'bg-orange-600 text-white';
            case 'Medium': return 'bg-yellow-500 text-gray-900';
            case 'Low': return 'bg-gray-500 text-white';
            default: return 'bg-gray-700 text-white';
        }
    };

    return (
        <div className="space-y-6 text-white">
            {error && <div className="p-3 bg-red-800 text-white rounded mb-4">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p><strong>User ID:</strong> {dsr.userId}</p>
                <p><strong>Request Type:</strong> {dsr.requestType}</p>
                <p><strong>Status:</strong> <span className={`font-semibold ${getStatusColor(dsr.status)}`}>{dsr.status}</span></p>
                <p><strong>Priority:</strong> <span className={`font-semibold px-2 py-1 rounded-full text-xs ${getPriorityColor(dsr.priority)}`}>{dsr.priority}</span></p>
                <p><strong>Submission Date:</strong> {new Date(dsr.submissionDate).toLocaleString()}</p>
                <p><strong>Due Date:</strong> {new Date(dsr.dueDate).toLocaleDateString()} {new Date(dsr.dueDate) < new Date() && dsr.status !== 'Completed' && dsr.status !== 'Rejected' && <span className="ml-2 text-red-500">(OVERDUE)</span>}</p>
                <p className="md:col-span-2"><strong>Completion Date:</strong> {dsr.completionDate ? new Date(dsr.completionDate).toLocaleString() : 'N/A'}</p>
            </div>
            <div>
                <p className="font-semibold mb-2">Details:</p>
                <p className="p-3 bg-gray-700/50 rounded text-sm whitespace-pre-line">{dsr.details}</p>
            </div>
            <div>
                <p className="font-semibold mb-2">Requested Data Categories:</p>
                <div className="flex flex-wrap gap-2">
                    {dsr.requestedDataCategories.map(cat => (
                        <span key={cat} className="px-3 py-1 bg-gray-700 rounded-full text-xs">{cat}</span>
                    ))}
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-700">
                <h4 className="text-lg font-semibold">Update Request Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FilterDropdown
                        label="Status"
                        options={[{ value: 'Pending', label: 'Pending' }, { value: 'In Progress', label: 'In Progress' }, { value: 'Completed', label: 'Completed' }, { value: 'Rejected', label: 'Rejected' }, { value: 'On Hold', label: 'On Hold' }]}
                        selectedValue={selectedStatus}
                        onChange={setSelectedStatus}
                        includeAllOption={false}
                    />
                    <FilterDropdown
                        label="Priority"
                        options={[{ value: 'Low', label: 'Low' }, { value: 'Medium', label: 'Medium' }, { value: 'High', label: 'High' }, { value: 'Urgent', label: 'Urgent' }]}
                        selectedValue={selectedPriority}
                        onChange={setSelectedPriority}
                        includeAllOption={false}
                    />
                    <div>
                        <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-300 mb-1">Assigned To</label>
                        <input
                            type="text"
                            id="assignedTo"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            placeholder="Assignee ID or Name"
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
                        <input
                            type="date"
                            id="dueDate"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>
                </div>
                <div className="col-span-full">
                    <label htmlFor="statusNote" className="block text-sm font-medium text-gray-300 mb-1">Add Note for Update (Optional)</label>
                    <textarea
                        id="statusNote"
                        value={statusChangeNote}
                        onChange={(e) => setStatusChangeNote(e.target.value)}
                        placeholder="Explain changes or additional details..."
                        rows={2}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                    ></textarea>
                </div>
                <button onClick={handleUpdateDetails} disabled={isLoading}
                        className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-medium disabled:opacity-50 transition-colors duration-200">
                    {isLoading ? 'Updating...' : 'Save Changes'}
                </button>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-700">
                <h4 className="text-lg font-semibold">Notes & Audit Trail</h4>
                <div className="max-h-60 overflow-y-auto bg-gray-700/30 p-4 rounded-md space-y-3">
                    {dsr.notes.length === 0 ? (
                        <p className="text-gray-400">No notes for this request yet.</p>
                    ) : (
                        dsr.notes.map(note => (
                            <div key={note.id} className="border-b border-gray-600 pb-3 last:border-b-0 last:pb-0">
                                <p className="text-xs text-gray-400"><strong>{note.authorId}</strong> on {new Date(note.timestamp).toLocaleString()}</p>
                                <p className="text-sm">{note.content}</p>
                            </div>
                        ))
                    )}
                </div>
                <div className="flex space-x-3">
                    <input
                        type="text"
                        placeholder="Add a new note..."
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        className="flex-grow bg-gray-700/50 p-2 rounded border border-gray-600 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                    <button onClick={handleNoteSubmit} disabled={isLoading || !newNoteContent.trim()}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium disabled:opacity-50 transition-colors duration-200">
                        Add Note
                    </button>
                </div>
            </div>
            {dsr.attachments && dsr.attachments.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-gray-700">
                    <h4 className="text-lg font-semibold">Attachments</h4>
                    <div className="flex flex-wrap gap-2">
                        {dsr.attachments.map((url, index) => (
                            <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm">
                                Attachment {index + 1}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const AuditLogViewer: React.FC = () => {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [filterEntityType, setFilterEntityType] = useState('All');
    const [filterAction, setFilterAction] = useState('All');

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const filters: any = { search: debouncedSearchTerm };
            if (filterEntityType !== 'All') filters.entityType = filterEntityType;
            if (filterAction !== 'All') filters.action = filterAction;
            const response = await mockApi.fetchAuditLogs(filters);
            setLogs(response.data);
        } catch (err: any) {
            setError('Failed to fetch audit logs: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearchTerm, filterEntityType, filterAction]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const { sortedData, requestSort, sortConfig } = useSort(logs, { key: 'timestamp', direction: 'descending' });
    const { currentData, currentPage, maxPage, next, prev, jump } = usePagination(sortedData, 15);

    return (
        <Card title="Audit Logs" className="col-span-full">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by User ID, Action, Details, Entity ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow bg-gray-700/50 p-2 rounded border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <FilterDropdown
                    label="Entity Type"
                    options={[{ value: 'ConsentRecord', label: 'Consent Record' }, { value: 'ConsentPolicy', label: 'Consent Policy' }, { value: 'DataSubjectRequest', label: 'DSR' }, { value: 'System', label: 'System' }]}
                    selectedValue={filterEntityType}
                    onChange={setFilterEntityType}
                />
                <FilterDropdown
                    label="Action Type"
                    options={[
                        { value: 'CONSENT_GRANTED', label: 'Consent Granted' },
                        { value: 'CONSENT_REVOKED', label: 'Consent Revoked' },
                        { value: 'POLICY_CREATED', label: 'Policy Created' },
                        { value: 'POLICY_UPDATED', label: 'Policy Updated' },
                        { value: 'POLICY_DELETED', label: 'Policy Deleted' },
                        { value: 'DSR_RECEIVED', label: 'DSR Received' },
                        { value: 'DSR_STATUS_CHANGE', label: 'DSR Status Change' },
                        { value: 'DSR_NOTE_ADDED', label: 'DSR Note Added' },
                        { value: 'DSR_UPDATED', label: 'DSR Updated' },
                    ]}
                    selectedValue={filterAction}
                    onChange={setFilterAction}
                />
            </div>
            {isLoading && <p className="text-white text-center py-4">Loading audit logs...</p>}
            {error && <div className="p-3 bg-red-800 text-white rounded mb-4">{error}</div>}
            <Table
                headers={[
                    { key: 'timestamp', label: 'Timestamp', sortable: true, className: 'w-1/6' },
                    { key: 'userId', label: 'User ID', sortable: true, className: 'w-1/12' },
                    { key: 'action', label: 'Action', sortable: true, className: 'w-1/6' },
                    { key: 'entityType', label: 'Entity Type', sortable: true, className: 'w-1/12' },
                    { key: 'entityId', label: 'Entity ID', className: 'w-1/12' },
                    { key: 'details', label: 'Details', className: 'w-auto' },
                ]}
                data={currentData}
                renderRow={(log: AuditLogEntry) => (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{log.userId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{log.action}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{log.entityType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{log.entityId}</td>
                        <td className="px-6 py-4 text-sm text-gray-300 max-w-md break-words">{log.details}</td>
                    </>
                )}
                onSort={(key) => requestSort(key as keyof AuditLogEntry)}
                sortConfig={sortConfig}
            />
            <Pagination currentPage={currentPage} maxPage={maxPage} next={next} prev={prev} jump={jump} />
        </Card>
    );
};

export const ComplianceReporting: React.FC = () => {
    const [trendData, setTrendData] = useState<ConsentTrendData[]>([]);
    const [isLoadingTrends, setIsLoadingTrends] = useState(false);
    const [trendError, setTrendError] = useState<string | null>(null);
    const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

    const fetchTrendData = useCallback(async () => {
        setIsLoadingTrends(true);
        setTrendError(null);
        try {
            const data = await mockApi.fetchConsentTrendData(timeframe);
            setTrendData(data);
        } catch (err: any) {
            setTrendError('Failed to fetch trend data: ' + err.message);
        } finally {
            setIsLoadingTrends(false);
        }
    }, [timeframe]);

    useEffect(() => {
        fetchTrendData();
    }, [fetchTrendData]);

    const [complianceReport, setComplianceReport] = useState<string>('');
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [reportError, setReportError] = useState<string | null>(null);

    const generateComplianceReport = async () => {
        setIsGeneratingReport(true);
        setReportError(null);
        try {
            await mockDelay(1500); // Simulate report generation time

            const totalActiveConsents = MOCK_CONSENT_RECORDS_DATA.filter(r => r.status === 'Granted').length;
            const totalRevokedConsents = MOCK_CONSENT_RECORDS_DATA.filter(r => r.status === 'Revoked').length;
            const totalDSRsReceivedLast30Days = MOCK_DATA_SUBJECT_REQUESTS.filter(d => (new Date().getTime() - new Date(d.submissionDate).getTime()) < 30 * 24 * 60 * 60 * 1000).length;
            const dsrsCompletedLast30Days = MOCK_DATA_SUBJECT_REQUESTS.filter(d => d.status === 'Completed' && d.completionDate && (new Date().getTime() - new Date(d.completionDate).getTime()) < 30 * 24 * 60 * 60 * 1000).length;
            const outstandingErasureDSRs = MOCK_DATA_SUBJECT_REQUESTS.filter(d => d.requestType === 'Erasure' && d.status !== 'Completed' && d.status !== 'Rejected').length;
            const outstandingAccessDSRs = MOCK_DATA_SUBJECT_REQUESTS.filter(d => d.requestType === 'Access' && d.status !== 'Completed' && d.status !== 'Rejected').length;

            const reportContent = `
## GDPR / CCPA Compliance Report - ${new Date().toLocaleDateString()}

### I. Overall Consent Status
*   Total Active Consents: ${totalActiveConsents}
*   Total Revoked Consents: ${totalRevokedConsents}
*   Consent Rate: ${totalActiveConsents + totalRevokedConsents > 0 ? ((totalActiveConsents / (totalActiveConsents + totalRevokedConsents)) * 100).toFixed(2) : 0}%

### II. Data Subject Request (DSR) Summary
*   Total DSRs Received (Last 30 days): ${totalDSRsReceivedLast30Days}
*   DSRs Completed (Last 30 days): ${dsrsCompletedLast30Days}
*   Average Resolution Time (Completed DSRs, Last 30 days): ${
                MOCK_DATA_SUBJECT_REQUESTS.filter(d => d.status === 'Completed' && d.completionDate && (new Date().getTime() - new Date(d.completionDate).getTime()) < 30 * 24 * 60 * 60 * 1000)
                    .map(d => (new Date(d.completionDate!).getTime() - new Date(d.submissionDate).getTime()) / (1000 * 60 * 60 * 24))
                    .reduce((sum, days, _, arr) => sum + days / arr.length, 0)
                    .toFixed(1)
            } days

#### Outstanding DSRs
*   Erasure Requests: ${outstandingErasureDSRs}
*   Access Requests: ${outstandingAccessDSRs}
*   Overdue DSRs: ${MOCK_DATA_SUBJECT_REQUESTS.filter(d => new Date(d.dueDate) < new Date() && d.status !== 'Completed' && d.status !== 'Rejected').length}

### III. Policy Adherence Overview
*   Number of Active Consent Policies: ${MOCK_CONSENT_POLICIES.filter(p => p.isActive).length}
*   Policies with Third-Party Sharing: ${MOCK_CONSENT_POLICIES.filter(p => p.thirdPartySharing).length}
*   Policies with Automated Decision-Making: ${MOCK_CONSENT_POLICIES.filter(p => p.isAutomatedDecisionMaking).length}
*   Policies Due for Review (Next 30 days): ${MOCK_CONSENT_POLICIES.filter(p => p.nextReviewAt && (new Date(p.nextReviewAt).getTime() - new Date().getTime()) < 30 * 24 * 60 * 60 * 1000 && new Date(p.nextReviewAt) > new Date()).length}

### IV. Potential Risks & Recommendations (AI-Assisted)
*   **Risk:** Manual DSR processing is becoming a bottleneck.
    *   **Recommendation:** Investigate automation tools for DSR intake and data retrieval. Implement DSR workflow management software.
*   **Risk:** High volume of data sharing for 'Marketing' consent type without clear, granular user choices.
    *   **Recommendation:** Review 'Marketing' consent flows to ensure transparency and opt-in specificity. Consider separate consent for different marketing channels.
*   **Risk:** Data retention periods in 'Essential Service Data Policy' are long, consider anonymization strategies.
    *   **Recommendation:** Implement anonymization or pseudonymization for historical service data where direct identification is no longer necessary, or explore tiered retention based on data sensitivity.
*   **Risk:** Policies not regularly reviewed could lead to outdated compliance.
    *   **Recommendation:** Ensure policy review cycles are strictly adhered to and integrate automated reminders for policy owners.

### V. Audit Trail Summary
*   Last Major Policy Change: ${MOCK_CONSENT_POLICIES.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]?.name || 'N/A'} on ${new Date(MOCK_CONSENT_POLICIES.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]?.updatedAt || '').toLocaleDateString()}
*   Total Audit Log Entries (Last 90 days): ${MOCK_AUDIT_LOG.filter(l => (new Date().getTime() - new Date(l.timestamp).getTime()) < 90 * 24 * 60 * 60 * 1000).length}
*   No critical security audit findings related to consent management.

This report is a snapshot of current compliance posture. Regular reviews and updates are recommended.
            `;
            setComplianceReport(reportContent.trim());
        } catch (err: any) {
            setReportError('Failed to generate report: ' + err.message);
        } finally {
            setIsGeneratingReport(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 col-span-full">
            <Card title="Consent & Opt-Out Trends">
                <div className="flex justify-end space-x-2 mb-4">
                    {(['week', 'month', 'quarter', 'year'] as const).map(tf => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-3 py-1 text-sm rounded-md ${timeframe === tf ? 'bg-cyan-600' : 'bg-gray-700 hover:bg-gray-600'} text-white transition-colors duration-200`}
                        >
                            {tf.charAt(0).toUpperCase() + tf.slice(1)}
                        </button>
                    ))}
                </div>
                {isLoadingTrends && <p className="text-white text-center py-4">Loading trends...</p>}
                {trendError && <div className="p-3 bg-red-800 text-white rounded mb-4">{trendError}</div>}
                {!isLoadingTrends && !trendError && trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                            <XAxis dataKey="date" tickFormatter={(dateStr) => new Date(dateStr).toLocaleDateString()} stroke="#cbd5e0" />
                            <YAxis stroke="#cbd5e0" />
                            <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '4px' }} itemStyle={{ color: '#cbd5e0' }} labelStyle={{ color: '#fff' }} />
                            <Legend />
                            <Line type="monotone" dataKey="newConsents" stroke="#06b6d4" name="New Consents" strokeWidth={2} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="optOuts" stroke="#ef4444" name="Opt-Outs/Revocations" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    !isLoadingTrends && !trendError && <p className="text-gray-400 text-center py-4">No trend data available for this period.</p>
                )}
            </Card>

            <Card title="Compliance Report Generator">
                <p className="text-gray-300 mb-4">Generate a comprehensive report on current consent and DSR compliance status.</p>
                <button
                    onClick={generateComplianceReport}
                    disabled={isGeneratingReport}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors duration-200"
                >
                    {isGeneratingReport ? 'Generating Report...' : 'Generate Compliance Report'}
                </button>
                {reportError && <div className="p-3 bg-red-800 text-white rounded mt-4">{reportError}</div>}
                {complianceReport && (
                    <div className="mt-6 space-y-3">
                        <h3 className="text-lg font-semibold text-white">Latest Compliance Report</h3>
                        <div className="bg-gray-700/50 p-4 rounded max-h-96 overflow-y-auto text-sm text-gray-300 whitespace-pre-line">
                            {complianceReport}
                        </div>
                        <button onClick={() => alert('Download functionality not implemented in mock.')} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200">Download Report (Mock)</button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export const DataCategoryManagement: React.FC = () => {
    const [categories, setCategories] = useState<DataCategoryDefinition[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [filterSensitive, setFilterSensitive] = useState('All');

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<DataCategoryDefinition | null>(null);

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const filters: any = { search: debouncedSearchTerm };
            if (filterSensitive !== 'All') {
                filters.sensitive = filterSensitive;
            }
            const response = await mockApi.fetchDataCategoryDefinitions(filters);
            setCategories(response.data);
        } catch (err: any) {
            setError('Failed to fetch data categories: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearchTerm, filterSensitive]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleCreateCategory = () => {
        setEditingCategory(null);
        setIsFormModalOpen(true);
    };

    const handleEditCategory = (category: DataCategoryDefinition) => {
        setEditingCategory(category);
        setIsFormModalOpen(true);
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Are you sure you want to delete this data category?')) return;
        setIsLoading(true);
        setError(null);
        try {
            await mockApi.deleteDataCategoryDefinition(id);
            await fetchCategories();
            MOCK_AUDIT_LOG.push({
                id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                timestamp: new Date().toISOString(),
                userId: 'admin_user',
                action: 'DATA_CATEGORY_DELETED',
                entityType: 'System',
                entityId: id,
                details: `Data category ${id} deleted.`,
            });
        } catch (err: any) {
            setError('Failed to delete data category: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoryFormSubmit = async (categoryData: DataCategoryDefinition) => {
        setIsLoading(true);
        setError(null);
        try {
            if (editingCategory) {
                await mockApi.updateDataCategoryDefinition(categoryData.id, categoryData);
                MOCK_AUDIT_LOG.push({
                    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    timestamp: new Date().toISOString(),
                    userId: 'admin_user',
                    action: 'DATA_CATEGORY_UPDATED',
                    entityType: 'System',
                    entityId: categoryData.id,
                    details: `Data category "${categoryData.name}" updated.`,
                });
            } else {
                await mockApi.createDataCategoryDefinition(categoryData);
                MOCK_AUDIT_LOG.push({
                    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    timestamp: new Date().toISOString(),
                    userId: 'admin_user',
                    action: 'DATA_CATEGORY_CREATED',
                    entityType: 'System',
                    entityId: categoryData.id, // This would be the new ID from the API
                    details: `New data category "${categoryData.name}" created.`,
                });
            }
            setIsFormModalOpen(false);
            setEditingCategory(null);
            await fetchCategories();
        } catch (err: any) {
            setError('Failed to save data category: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const { sortedData, requestSort, sortConfig } = useSort(categories, { key: 'name', direction: 'ascending' });
    const { currentData, currentPage, maxPage, next, prev, jump } = usePagination(sortedData, 10);

    return (
        <Card title="Data Category Definitions" className="col-span-full">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
                <input
                    type="text"
                    placeholder="Search categories by name, description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow bg-gray-700/50 p-2 rounded border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <FilterDropdown
                    label="Sensitive Data"
                    options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]}
                    selectedValue={filterSensitive}
                    onChange={setFilterSensitive}
                    className="w-full md:w-auto"
                    allOptionLabel="All Sensitivity"
                />
                <button onClick={handleCreateCategory} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium w-full md:w-auto transition-colors duration-200">
                    + New Category
                </button>
            </div>
            {isLoading && <p className="text-white text-center py-4">Loading data categories...</p>}
            {error && <div className="p-3 bg-red-800 text-white rounded mb-4">{error}</div>}
            <Table
                headers={[
                    { key: 'name', label: 'Name', sortable: true },
                    { key: 'description', label: 'Description' },
                    { key: 'sensitive', label: 'Sensitive', sortable: true },
                    { key: 'examples', label: 'Examples' },
                    { key: 'actions', label: 'Actions', className: 'w-28 text-center' },
                ]}
                data={currentData}
                renderRow={(category: DataCategoryDefinition) => (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{category.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-300 max-w-sm truncate">{category.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${category.sensitive ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                                {category.sensitive ? 'Yes' : 'No'}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300 max-w-sm truncate">{category.examples.join(', ')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                            <button onClick={() => handleEditCategory(category)} className="text-indigo-500 hover:text-indigo-700 mr-3 transition-colors duration-200">Edit</button>
                            <button onClick={() => handleDeleteCategory(category.id)} className="text-red-500 hover:text-red-700 transition-colors duration-200">Delete</button>
                        </td>
                    </>
                )}
                onSort={(key) => requestSort(key as keyof DataCategoryDefinition)}
                sortConfig={sortConfig}
            />
            <Pagination currentPage={currentPage} maxPage={maxPage} next={next} prev={prev} jump={jump} />

            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={editingCategory ? "Edit Data Category" : "Create New Data Category"} size="md">
                <DataCategoryForm
                    category={editingCategory}
                    onSubmit={handleCategoryFormSubmit}
                    onCancel={() => setIsFormModalOpen(false)}
                    isLoading={isLoading}
                />
            </Modal>
        </Card>
    );
};

export const DataCategoryForm: React.FC<{
    category: DataCategoryDefinition | null;
    onSubmit: (categoryData: DataCategoryDefinition) => void;
    onCancel: () => void;
    isLoading: boolean;
}> = ({ category, onSubmit, onCancel, isLoading }) => {
    const [formData, setFormData] = useState<DataCategoryDefinition>(category || {
        id: '', name: '', description: '', sensitive: false, examples: [],
    });

    useEffect(() => {
        setFormData(category || {
            id: '', name: '', description: '', sensitive: false, examples: [],
        });
    }, [category]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleExamplesChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            examples: value.split(',').map(s => s.trim()).filter(s => s.length > 0)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-white">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">Category Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
                       className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} required
                          className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"></textarea>
            </div>
            <div>
                <label htmlFor="examples" className="block text-sm font-medium text-gray-300">Examples (comma-separated)</label>
                <input type="text" id="examples" name="examples" value={formData.examples.join(', ')} onChange={(e) => handleExamplesChange(e.target.value)}
                       className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div className="flex items-center space-x-2">
                <input type="checkbox" id="sensitive" name="sensitive" checked={formData.sensitive} onChange={handleChange}
                       className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded bg-gray-700/50" />
                <label htmlFor="sensitive" className="text-sm font-medium text-gray-300">Is Sensitive Data</label>
            </div>

            <div className="pt-4 border-t border-gray-700 flex justify-end space-x-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors duration-200">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-medium disabled:opacity-50 transition-colors duration-200">
                    {isLoading ? 'Saving...' : (category ? 'Update Category' : 'Create Category')}
                </button>
            </div>
        </form>
    );
};

export const ThirdPartyIntegrationManagement: React.FC = () => {
    const [integrations, setIntegrations] = useState<ThirdPartyIntegration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [filterStatus, setFilterStatus] = useState('All');

    const fetchIntegrations = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const filters: any = { search: debouncedSearchTerm };
            if (filterStatus !== 'All') {
                filters.status = filterStatus;
            }
            const response = await mockApi.fetchThirdPartyIntegrations(filters);
            setIntegrations(response.data);
        } catch (err: any) {
            setError('Failed to fetch integrations: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearchTerm, filterStatus]);

    useEffect(() => {
        fetchIntegrations();
    }, [fetchIntegrations]);

    const handleUpdateIntegration = async (integrationId: string, updates: Partial<ThirdPartyIntegration>) => {
        setIsLoading(true);
        setError(null);
        try {
            const updated = await mockApi.updateThirdPartyIntegration(integrationId, updates);
            setIntegrations(prev => prev.map(i => i.id === integrationId ? updated : i));
            MOCK_AUDIT_LOG.push({
                id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                timestamp: new Date().toISOString(),
                userId: 'admin_user',
                action: 'THIRD_PARTY_UPDATED',
                entityType: 'System',
                entityId: integrationId,
                details: `Third-party integration "${updated.name}" updated.`,
            });
        } catch (err: any) {
            setError('Failed to update integration: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const { sortedData, requestSort, sortConfig } = useSort(integrations, { key: 'name', direction: 'ascending' });
    const { currentData, currentPage, maxPage, next, prev, jump } = usePagination(sortedData, 10);

    return (
        <Card title="Third-Party Integrations" className="col-span-full">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
                <input
                    type="text"
                    placeholder="Search integrations by name, description, regions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow bg-gray-700/50 p-2 rounded border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <FilterDropdown
                    label="Status"
                    options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }, { value: 'Pending Review', label: 'Pending Review' }]}
                    selectedValue={filterStatus}
                    onChange={setFilterStatus}
                    className="w-full md:w-auto"
                />
            </div>
            {isLoading && <p className="text-white text-center py-4">Loading integrations...</p>}
            {error && <div className="p-3 bg-red-800 text-white rounded mb-4">{error}</div>}
            <Table
                headers={[
                    { key: 'name', label: 'Name', sortable: true },
                    { key: 'description', label: 'Description' },
                    { key: 'dataCategoriesShared', label: 'Data Shared' },
                    { key: 'regions', label: 'Regions' },
                    { key: 'contractSigned', label: 'Contract', sortable: true },
                    { key: 'dpaSigned', label: 'DPA', sortable: true },
                    { key: 'status', label: 'Status', sortable: true },
                    { key: 'lastReviewedAt', label: 'Last Reviewed', sortable: true },
                    { key: 'actions', label: 'Actions', className: 'w-24 text-center' },
                ]}
                data={currentData}
                renderRow={(integration: ThirdPartyIntegration) => (
                    <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{integration.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">{integration.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">{integration.dataCategoriesShared.join(', ')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{integration.regions.join(', ')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${integration.contractSigned ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {integration.contractSigned ? 'Yes' : 'No'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${integration.dpaSigned ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {integration.dpaSigned ? 'Yes' : 'No'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${integration.status === 'Active' ? 'bg-green-100 text-green-800' : integration.status === 'Inactive' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {integration.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(integration.lastReviewedAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                            <button onClick={() => handleUpdateIntegration(integration.id, { status: integration.status === 'Active' ? 'Inactive' : 'Active' })} className="text-indigo-500 hover:text-indigo-700 transition-colors duration-200">
                                {integration.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                        </td>
                    </>
                )}
                onSort={(key) => requestSort(key as keyof ThirdPartyIntegration)}
                sortConfig={sortConfig}
            />
            <Pagination currentPage={currentPage} maxPage={maxPage} next={next} prev={prev} jump={jump} />
        </Card>
    );
};


export const AIComplianceAssistant: React.FC<{
    onAssess: (prompt: string) => Promise<string>;
    isLoading: boolean;
    assessment: string;
    onClear: () => void;
}> = ({ onAssess, isLoading, assessment, onClear }) => {
    const [prompt, setPrompt] = useState("Collecting user location data for fraud prevention.");
    const [aiPurpose, setAiPurpose] = useState<'general' | 'policy_check'>('general');
    const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');
    const [policies, setPolicies] = useState<ConsentPolicy[]>([]);
    const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);
    const [policiesError, setPoliciesError] = useState<string | null>(null);

    const fetchPoliciesForSelect = useCallback(async () => {
        setIsLoadingPolicies(true);
        setPoliciesError(null);
        try {
            const response = await mockApi.fetchConsentPolicies({ isActive: true });
            setPolicies(response.data);
            if (response.data.length > 0 && !selectedPolicyId) {
                setSelectedPolicyId(response.data[0].id); // Auto-select first active policy
            }
        } catch (err: any) {
            setPoliciesError('Failed to load policies: ' + err.message);
        } finally {
            setIsLoadingPolicies(false);
        }
    }, [selectedPolicyId]);

    useEffect(() => {
        fetchPoliciesForSelect();
    }, [fetchPoliciesForSelect]);

    const currentPolicy = useMemo(() => policies.find(p => p.id === selectedPolicyId), [policies, selectedPolicyId]);

    const handleAssessClick = async () => {
        if (aiPurpose === 'policy_check' && !currentPolicy) {
            alert('Please select a policy to perform a policy compliance check.');
            return;
        }
        let fullPrompt = "";
        if (aiPurpose === 'general') {
            fullPrompt = `As a privacy expert AI, conduct a brief, high-level privacy impact assessment for this data collection activity: "${prompt}". Highlight potential risks and suggest mitigations. Focus on general privacy principles.`;
        } else { // policy_check
            fullPrompt = `As a privacy expert AI, evaluate the following data collection activity: "${prompt}" against the provided consent policy details for ${currentPolicy?.name || 'an unspecified policy'}:\n\n`;
            if (currentPolicy) {
                fullPrompt += `Policy Name: ${currentPolicy.name}\nDescription: ${currentPolicy.description}\nData Categories: ${currentPolicy.dataCategories.join(', ')}\nLegal Basis: ${currentPolicy.legalBasis}\nRetention Period: ${currentPolicy.retentionPeriod}\nRegions: ${currentPolicy.regions.join(', ')}\nPurpose: ${currentPolicy.purpose}\nThird-Party Sharing: ${currentPolicy.thirdPartySharing ? 'Yes' + (currentPolicy.thirdPartyList.length > 0 ? ` (${currentPolicy.thirdPartyList.join(', ')})` : '') : 'No'}\nAutomated Decision Making: ${currentPolicy.isAutomatedDecisionMaking ? 'Yes' + (currentPolicy.automatedDecisionDetails ? ` (${currentPolicy.automatedDecisionDetails})` : '') : 'No'}\n\n`;
            }
            fullPrompt += `Specifically, identify any potential compliance gaps, risks, or areas of non-adherence for the data collection activity against this policy. Suggest concrete improvements to align the activity with the policy.`;
        }
        await onAssess(fullPrompt);
    };

    return (
        <Card title="AI Privacy & Compliance Assistant">
            <p className="text-gray-300 mb-4">Leverage AI to perform privacy impact assessments or check data activities against specific consent policies.</p>
            <div className="flex mb-4 space-x-4">
                <label className="inline-flex items-center cursor-pointer">
                    <input
                        type="radio"
                        className="form-radio h-4 w-4 text-cyan-600 border-gray-600 bg-gray-700/50"
                        name="aiPurpose"
                        value="general"
                        checked={aiPurpose === 'general'}
                        onChange={() => { setAiPurpose('general'); onClear(); }}
                    />
                    <span className="ml-2 text-white text-sm">General PIA (Privacy Impact Assessment)</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                    <input
                        type="radio"
                        className="form-radio h-4 w-4 text-cyan-600 border-gray-600 bg-gray-700/50"
                        name="aiPurpose"
                        value="policy_check"
                        checked={aiPurpose === 'policy_check'}
                        onChange={() => { setAiPurpose('policy_check'); onClear(); }}
                    />
                    <span className="ml-2 text-white text-sm">Policy Compliance Check</span>
                </label>
            </div>

            {aiPurpose === 'policy_check' && (
                <div className="mb-4">
                    <label htmlFor="policy-select" className="block text-sm font-medium text-gray-300 mb-1">Select Policy to Check Against (Active policies only):</label>
                    {isLoadingPolicies ? (
                        <p className="text-gray-400">Loading policies...</p>
                    ) : policiesError ? (
                        <p className="text-red-400">{policiesError}</p>
                    ) : (
                        <select
                            id="policy-select"
                            value={selectedPolicyId}
                            onChange={(e) => setSelectedPolicyId(e.target.value)}
                            className="w-full bg-gray-700/50 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-cyan-500 appearance-none bg-no-repeat bg-right-center pr-8"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath fill='%239CA3AF' d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z'/%3E%3C/svg%3E")`, backgroundSize: '1.5em 1.5em' }}
                        >
                            <option value="">-- Select an Active Policy --</option>
                            {policies.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (v{p.version})</option>
                            ))}
                        </select>
                    )}
                    {selectedPolicyId && currentPolicy && <p className="text-xs text-gray-400 mt-1">Selected: {currentPolicy.name} ({currentPolicy.legalBasis})</p>}
                    {aiPurpose === 'policy_check' && !selectedPolicyId && !isLoadingPolicies && (
                        <p className="text-red-400 text-sm mt-1">Please select an active policy for compliance checking.</p>
                    )}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-300 mb-1">Describe Data Collection Activity:</label>
                    <textarea
                        id="ai-prompt"
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        className="w-full h-24 bg-gray-700/50 p-2 rounded border border-gray-600 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="e.g., Collecting user location data for fraud prevention. Note: this data is collected via GPS on mobile app, updated every 5 minutes, stored for 6 months."
                    />
                </div>
                <button
                    onClick={handleAssessClick}
                    disabled={isLoading || (aiPurpose === 'policy_check' && !selectedPolicyId)}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors duration-200"
                >
                    {isLoading ? 'Assessing...' : 'Initiate Assessment'}
                </button>
                {assessment && (
                    <div className="mt-6 space-y-3">
                        <h3 className="text-lg font-semibold text-white">AI Assessment Report</h3>
                        <div className="min-h-[10rem] max-h-60 overflow-y-auto bg-gray-700/50 p-4 rounded text-sm text-gray-300 whitespace-pre-line">
                            {assessment}
                        </div>
                        <button onClick={onClear} className="w-full py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200">Clear Assessment</button>
                    </div>
                )}
            </div>
        </Card>
    );
};

// --- Main ConsentManagementView Integration ---
const TABS = {
    DASHBOARD: 'Dashboard',
    RECORDS: 'Consent Records',
    POLICIES: 'Consent Policies',
    DSRS: 'DSR Requests',
    AUDIT: 'Audit Log',
    REPORTS: 'Reports',
    DATA_CATEGORIES: 'Data Categories',
    THIRD_PARTIES: 'Third-Parties',
} as const;

type TabKey = typeof TABS[keyof typeof TABS];

const ConsentManagementView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("ConsentManagementView must be within DataProvider");

    const { consentRecords } = context;
    const [activeTab, setActiveTab] = useState<TabKey>(TABS.DASHBOARD);
    const [isAssessorOpen, setAssessorOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("Collecting user location data for fraud prevention."); // Renamed to avoid conflict
    const [aiAssessment, setAiAssessment] = useState(''); // Renamed to avoid conflict
    const [isLoadingAI, setIsLoadingAI] = useState(false);

    // Update MOCK_CONSENT_RECORDS_DATA with the actual context records
    useEffect(() => {
        MOCK_CONSENT_RECORDS_DATA = consentRecords;
    }, [consentRecords]);

    const chartData = useMemo(() => ([
        { name: 'Marketing', value: consentRecords.filter(r => r.consentType === 'Marketing' && r.status === 'Granted').length },
        { name: 'Data Sharing', value: consentRecords.filter(r => r.consentType === 'Data Sharing' && r.status === 'Granted').length },
        { name: 'Analytics', value: consentRecords.filter(r => r.consentType === 'Analytics' && r.status === 'Granted').length },
        { name: 'Essential', value: consentRecords.filter(r => r.consentType === 'Essential' && r.status === 'Granted').length },
    ].filter(item => item.value > 0)), [consentRecords]);

    const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b']; // Cyan, Purple, Green, Amber

    const handleAssess = async (promptText: string) => {
        setIsLoadingAI(true); setAiAssessment('');
        try {
            const ai = new GoogleGenAI({apiKey: process.env.NEXT_PUBLIC_API_KEY as string}); // Using NEXT_PUBLIC_API_KEY for client-side
            const model = ai.getGenerativeModel({ model: 'gemini-pro' }); // gemini-2.5-flash not available via getGenerativeModel directly, using gemini-pro for wider availability
            const result = await model.generateContent(promptText);
            const response = await result.response;
            setAiAssessment(response.text);
        } catch(err) {
            console.error("AI assessment error:", err);
            setAiAssessment("Error performing AI assessment. Please check API key and try again. " + (err as Error).message);
        } finally { setIsLoadingAI(false); }
    };

    const handleClearAIAssessment = useCallback(() => {
        setAiAssessment('');
        setAiPrompt("Collecting user location data for fraud prevention.");
    }, []);

    return (
        <>
            <div className="space-y-6">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h2 className="text-3xl font-bold text-white tracking-wider mb-4 sm:mb-0">Consent Management Dashboard</h2>
                    <button onClick={() => setAssessorOpen(true)} className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors duration-200">
                        AI Privacy Impact Assessment
                    </button>
                </div>
                <nav className="flex space-x-1 sm:space-x-2 border-b border-gray-700 text-sm overflow-x-auto pb-2 -mb-2">
                    {Object.values(TABS).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-t-lg font-medium ${activeTab === tab ? 'bg-gray-700 text-white border-b-2 border-cyan-500' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>

                <div className="pt-4">
                    {activeTab === TABS.DASHBOARD && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card title="Current Consent Rates">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                                                {chartData.map((e,i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '20px', color: '#fff' }} />
                                            <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: 'none', borderRadius: '4px' }} itemStyle={{ color: '#cbd5e0' }} labelStyle={{ color: '#fff' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-gray-400 text-center py-4">No consent data available.</p>
                                )}
                            </Card>
                            <Card title="Recent Consent Changes">
                                {consentRecords.length > 0 ? (
                                    <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                                        {consentRecords.slice(0, 10).map(r => ( // Show top 10 recent changes
                                            <p key={r.id} className="text-sm text-gray-300">
                                                <span className="font-semibold">{r.userId}</span> {r.status} <span className="font-semibold">{r.consentType}</span> consent. <span className="text-gray-500 text-xs">({new Date(r.timestamp).toLocaleString()})</span>
                                            </p>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-center py-4">No recent consent changes.</p>
                                )}
                            </Card>
                            {/* Additional dashboard cards can be added here, e.g., DSR status summary, Policy status overview */}
                            <Card title="Data Subject Request Summary" className="col-span-1">
                                <div className="space-y-3 text-gray-300">
                                    <p><strong>Total DSRs:</strong> {MOCK_DATA_SUBJECT_REQUESTS.length}</p>
                                    <p><strong>Pending:</strong> {MOCK_DATA_SUBJECT_REQUESTS.filter(d => d.status === 'Pending').length}</p>
                                    <p><strong>In Progress:</strong> {MOCK_DATA_SUBJECT_REQUESTS.filter(d => d.status === 'In Progress').length}</p>
                                    <p><strong>Completed:</strong> {MOCK_DATA_SUBJECT_REQUESTS.filter(d => d.status === 'Completed').length}</p>
                                    <p><strong>Overdue:</strong> {MOCK_DATA_SUBJECT_REQUESTS.filter(d => new Date(d.dueDate) < new Date() && d.status !== 'Completed' && d.status !== 'Rejected').length}</p>
                                </div>
                                <div className="mt-4">
                                    <button onClick={() => setActiveTab(TABS.DSRS)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium w-full transition-colors duration-200">
                                        View All DSRs
                                    </button>
                                </div>
                            </Card>
                            <Card title="Policy Overview" className="col-span-1">
                                <div className="space-y-3 text-gray-300">
                                    <p><strong>Total Policies:</strong> {MOCK_CONSENT_POLICIES.length}</p>
                                    <p><strong>Active Policies:</strong> {MOCK_CONSENT_POLICIES.filter(p => p.isActive).length}</p>
                                    <p><strong>Policies with Third-Party Sharing:</strong> {MOCK_CONSENT_POLICIES.filter(p => p.thirdPartySharing).length}</p>
                                    <p><strong>Policies Due for Review:</strong> {MOCK_CONSENT_POLICIES.filter(p => p.nextReviewAt && (new Date(p.nextReviewAt).getTime() - new Date().getTime()) < 30 * 24 * 60 * 60 * 1000 && new Date(p.nextReviewAt) > new Date()).length}</p>
                                </div>
                                <div className="mt-4">
                                    <button onClick={() => setActiveTab(TABS.POLICIES)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium w-full transition-colors duration-200">
                                        Manage Policies
                                    </button>
                                </div>
                            </Card>
                        </div>
                    )}
                    {activeTab === TABS.RECORDS && <ConsentRecordsManagement />}
                    {activeTab === TABS.POLICIES && <ConsentPoliciesManagement />}
                    {activeTab === TABS.DSRS && <DataSubjectRequestsManagement />}
                    {activeTab === TABS.AUDIT && <AuditLogViewer />}
                    {activeTab === TABS.REPORTS && <ComplianceReporting />}
                    {activeTab === TABS.DATA_CATEGORIES && <DataCategoryManagement />}
                    {activeTab === TABS.THIRD_PARTIES && <ThirdPartyIntegrationManagement />}
                </div>
            </div>

            <Modal isOpen={isAssessorOpen} onClose={() => setAssessorOpen(false)} title="AI Privacy Impact Assessment" size="2xl">
                <AIComplianceAssistant
                    onAssess={handleAssess}
                    isLoading={isLoadingAI}
                    assessment={aiAssessment}
                    onClear={handleClearAIAssessment}
                />
            </Modal>
        </>
    );
};

export default ConsentManagementView;