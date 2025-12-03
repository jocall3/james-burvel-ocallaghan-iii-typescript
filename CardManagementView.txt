import React, { useContext, useState, useMemo, useEffect, useCallback, createContext } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import { CorporateCard, CorporateCardControls, Transaction, UserRole, CorporateCardStatus } from '../../../../types'; // Assuming UserRole and CorporateCardStatus are in types.ts

// --- START: NEW UTILITY FUNCTIONS (EXPORTED) ---
// These functions provide common helpers for data manipulation, formatting, and UI interactions.

/**
 * Formats a number as currency.
 * @param amount The number to format.
 * @param currency The currency code (e.g., 'USD', 'EUR').
 * @param locale The locale for formatting (e.g., 'en-US').
 * @returns Formatted currency string.
 */
export const formatCurrency = (amount: number, currency: string = 'USD', locale: string = 'en-US'): string => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(amount);
};

/**
 * Formats a Date object into a readable string.
 * @param date The date object.
 * @param options Intl.DateTimeFormatOptions.
 * @returns Formatted date string.
 */
export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
    const defaultOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Intl.DateTimeFormat('en-US', options || defaultOptions).format(date);
};

/**
 * Generates a simple unique ID.
 * @returns A unique string.
 */
export const generateUniqueId = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Debounces a function call.
 * @param func The function to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns A debounced function.
 */
export const debounce = <T extends (...args: any[]) => void>(func: T, delay: number): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>): void => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

/**
 * Calculates budget utilization as a percentage.
 * @param spent Amount spent.
 * @param limit Total limit.
 * @returns Utilization percentage.
 */
export const calculateBudgetUtilization = (spent: number, limit: number): number => {
    if (limit === 0) return 0;
    return (spent / limit) * 100;
};

/**
 * Simple email validation.
 * @param email The email string to validate.
 * @returns True if valid, false otherwise.
 */
export const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Generates a random number within a range.
 * @param min Minimum value.
 * @param max Maximum value.
 * @returns Random number.
 */
export const getRandomNumber = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
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
 * Clones a deep object.
 * @param obj The object to clone.
 * @returns A deep copy of the object.
 */
export const deepClone = <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Represents a generic form validation state.
 */
interface FormValidationState {
    [key: string]: string | undefined;
}

/**
 * Custom hook for form validation.
 * @param initialValues Initial form values.
 * @param validateFn A function that takes form values and returns validation errors.
 */
export function useFormValidation<T extends Record<string, any>>(
    initialValues: T,
    validateFn: (values: T) => FormValidationState
) {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<FormValidationState>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const targetValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setValues({
            ...values,
            [name]: targetValue,
        });
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name } = e.target;
        const currentErrors = validateFn(values);
        setErrors(prev => ({ ...prev, [name]: currentErrors[name] }));
    };

    const handleSubmit = (callback: (values: T) => void) => (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const currentErrors = validateFn(values);
        setErrors(currentErrors);

        if (Object.keys(currentErrors).length === 0) {
            callback(values);
        } else {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (isSubmitting && Object.keys(errors).length === 0) {
            setIsSubmitting(false);
        }
    }, [errors, isSubmitting]);

    return {
        values,
        setValues,
        errors,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
    };
}

/**
 * Custom hook for pagination logic.
 * @param data The array of items to paginate.
 * @param itemsPerPage Number of items per page.
 */
export function usePagination<T>(data: T[], itemsPerPage: number = 10) {
    const [currentPage, setCurrentPage] = useState(1);
    const maxPage = Math.ceil(data.length / itemsPerPage);

    const currentData = useMemo(() => {
        const begin = (currentPage - 1) * itemsPerPage;
        const end = begin + itemsPerPage;
        return data.slice(begin, end);
    }, [data, currentPage, itemsPerPage]);

    const next = () => setCurrentPage((prev) => Math.min(prev + 1, maxPage));
    const prev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const jump = (page: number) => {
        const pageNumber = Math.max(1, page);
        setCurrentPage(() => Math.min(pageNumber, maxPage));
    };

    return { next, prev, jump, currentData, currentPage, maxPage };
}

/**
 * Custom hook for search and filter logic on a data array.
 * @param data The array of items to search/filter.
 * @param searchKeys An array of keys to search within each item.
 * @param defaultFilters Initial filter values.
 */
export function useSearchAndFilter<T extends Record<string, any>>(
    data: T[],
    searchKeys: (keyof T)[],
    defaultFilters: Record<string, any> = {}
) {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filters, setFilters] = useState<Record<string, any>>(defaultFilters);

    const filteredData = useMemo(() => {
        let result = data;

        // Apply search
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            result = result.filter(item =>
                searchKeys.some(key =>
                    String(item[key]).toLowerCase().includes(lowerCaseSearchTerm)
                )
            );
        }

        // Apply filters
        result = result.filter(item => {
            for (const key in filters) {
                const filterValue = filters[key];
                if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
                    if (Array.isArray(filterValue)) {
                        if (!filterValue.includes(item[key])) {
                            return false;
                        }
                    } else if (typeof filterValue === 'object' && filterValue !== null && 'min' in filterValue && 'max' in filterValue) {
                        const itemValue = parseFloat(item[key]);
                        if (isNaN(itemValue) || itemValue < filterValue.min || itemValue > filterValue.max) {
                            return false;
                        }
                    }
                    else if (item[key] !== filterValue) {
                        return false;
                    }
                }
            }
            return true;
        });

        return result;
    }, [data, searchTerm, filters, searchKeys]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setFilters(defaultFilters);
        setSearchTerm('');
    };

    return {
        filteredData,
        searchTerm,
        setSearchTerm,
        filters,
        setFilters,
        handleSearchChange,
        handleFilterChange,
        resetFilters,
    };
}

// --- END: NEW UTILITY FUNCTIONS (EXPORTED) ---

// --- START: NEW INTERFACES (DEFINED WITHIN FILE FOR BREVITY, BUT WOULD BE IN TYPES.TS IN REAL APP) ---

/**
 * Represents a single merchant category.
 */
export interface MerchantCategory {
    id: string;
    name: string;
    code: string;
    description: string;
    blockedByDefault: boolean;
}

/**
 * Represents a spending policy rule.
 */
export interface PolicyRule {
    id: string;
    name: string;
    description: string;
    type: 'limit' | 'category_block' | 'time_restriction' | 'geo_restriction' | 'transaction_approval';
    isActive: boolean;
    priority: number;
    configuration: any; // e.g., { monthlyLimit: 5000 }, { blockedMcc: ['5812', '7995'] }
    appliesTo: 'all_cards' | 'specific_cards' | 'specific_holders';
    targetIds?: string[]; // Card IDs or user IDs
}

/**
 * Represents a request for a new card or a change to an existing one.
 */
export interface CardRequest {
    id: string;
    requestorId: string; // User ID of who made the request
    requestType: 'new_card' | 'limit_increase' | 'freeze_unfreeze' | 'card_replacement' | 'close_card';
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    requestedDate: Date;
    approvedBy?: string; // User ID of approver
    approvalDate?: Date;
    details: {
        cardHolderName?: string;
        cardType?: 'physical' | 'virtual';
        limit?: number;
        reason: string;
        currency?: string;
        expirationDate?: Date;
        existingCardId?: string; // For requests related to existing cards
    };
    notes?: string;
}

/**
 * Represents a virtual card.
 * Extends CorporateCard but with specific virtual card properties.
 */
export interface VirtualCard extends CorporateCard {
    parentCardId?: string; // If this virtual card is tied to a physical one
    isSingleUse: boolean;
    expiration: Date;
    associatedProject?: string;
    purpose: string;
    generationDate: Date;
    autoTerminateDate?: Date;
}

/**
 * Represents an entry in the audit log.
 */
export interface AuditLogEntry {
    id: string;
    timestamp: Date;
    actorId: string; // User ID who performed the action
    action: string; // e.g., 'UPDATE_CARD_CONTROLS', 'APPROVE_CARD_REQUEST'
    targetType: 'card' | 'card_request' | 'policy' | 'user' | 'virtual_card';
    targetId: string;
    oldValue?: any;
    newValue?: any;
    description: string;
}

/**
 * Represents a user's permission profile or role.
 */
export interface UserPermissionProfile {
    id: string;
    name: string; // e.g., 'Admin', 'Finance Manager', 'Employee'
    description: string;
    permissions: {
        canViewAllCards: boolean;
        canManageOwnCards: boolean;
        canManageTeamCards: boolean;
        canManageAllCards: boolean;
        canCreateCards: boolean;
        canApproveRequests: boolean;
        canManagePolicies: boolean;
        canViewAuditLogs: boolean;
        canManageUserPermissions: boolean;
        canAccessReporting: boolean;
        canManageIntegrations: boolean;
    };
}

/**
 * Represents a configured alert.
 */
export interface AlertConfiguration {
    id: string;
    name: string;
    description: string;
    type: 'spending_threshold' | 'unusual_transaction' | 'policy_violation' | 'card_status_change' | 'low_balance';
    threshold?: number;
    period?: 'daily' | 'weekly' | 'monthly' | 'transaction';
    targetCards?: string[]; // Card IDs
    targetUsers?: string[]; // User IDs to notify
    channels: ('email' | 'slack' | 'sms')[];
    isActive: boolean;
}

/**
 * Represents a recurring subscription tracked on a card.
 */
export interface Subscription {
    id: string;
    cardId: string;
    merchantName: string;
    amount: number;
    currency: string;
    billingCycle: 'monthly' | 'annually' | 'quarterly';
    nextBillingDate: Date;
    status: 'active' | 'cancelled' | 'paused';
    category: string;
    startDate: Date;
    notes?: string;
}

/**
 * Represents a budget allocation for a department or project.
 */
export interface Budget {
    id: string;
    name: string;
    period: 'monthly' | 'quarterly' | 'annually';
    totalAmount: number;
    allocatedAmount: number;
    spentAmount: number;
    departmentId?: string;
    projectId?: string;
    startDate: Date;
    endDate: Date;
    cardsLinked: string[]; // Card IDs linked to this budget
}

/**
 * Represents API integration settings.
 */
export interface APISetting {
    id: string;
    name: string;
    description: string;
    apiKey: string;
    apiSecret?: string;
    endpoint: string;
    isActive: boolean;
    lastAccessed: Date;
    allowedIPs?: string[];
    webhookUrl?: string;
    eventsSubscribed?: string[];
}

/**
 * Represents a compliance report.
 */
export interface ComplianceReport {
    id: string;
    name: string;
    description: string;
    reportType: 'spending_policy_adherence' | 'transaction_audits' | 'user_activity' | 'financial_reconciliation';
    generatedBy: string; // User ID
    generatedDate: Date;
    startDate: Date;
    endDate: Date;
    status: 'pending' | 'completed' | 'failed';
    downloadUrl?: string;
    parameters: any; // e.g., { department: 'Sales', policyId: 'xyz' }
}

/**
 * Represents a generated statement (e.g., monthly).
 */
export interface Statement {
    id: string;
    cardId: string;
    statementDate: Date;
    startDate: Date;
    endDate: Date;
    totalSpent: number;
    totalRefunds: number;
    closingBalance: number;
    status: 'generated' | 'reviewed' | 'approved';
    downloadUrl: string;
}

// Global configuration for the application, stored here for simplicity.
export interface AppConfig {
    defaultCurrency: string;
    auditLogRetentionDays: number;
    cardRequestApprovalWorkflow: 'single_approver' | 'multi_approver' | 'auto_approve';
    maxVirtualCardsPerUser: number;
    enableMultiFactorAuthentication: boolean;
}

// --- END: NEW INTERFACES ---

// --- START: MOCK DATA GENERATION FUNCTIONS (EXPORTED) ---

// Mock data for cardholders to tie into requests and permissions
const MOCK_CARDHOLDERS = [
    { id: 'usr-1', name: 'Alice Johnson', email: 'alice.j@example.com', role: 'Finance Manager' },
    { id: 'usr-2', name: 'Bob Smith', email: 'bob.s@example.com', role: 'Employee' },
    { id: 'usr-3', name: 'Charlie Brown', email: 'charlie.b@example.com', role: 'Admin' },
    { id: 'usr-4', name: 'Diana Prince', email: 'diana.p@example.com', role: 'Employee' },
    { id: 'usr-5', name: 'Eve Adams', email: 'eve.a@example.com', role: 'Finance Manager' },
    { id: 'usr-6', name: 'Frank White', email: 'frank.w@example.com', role: 'Employee' },
];

export const generateMockMerchantCategories = (count: number): MerchantCategory[] => {
    const categories: MerchantCategory[] = [];
    const baseCategories = [
        { name: 'Restaurants', code: '5812', desc: 'Eating places, restaurants' },
        { name: 'Online Retail', code: '5310', desc: 'Online shopping and e-commerce' },
        { name: 'Travel Agencies', code: '4722', desc: 'Travel agencies, tour operators' },
        { name: 'Software', code: '7372', desc: 'Computer programming, data processing' },
        { name: 'Advertising', code: '7311', desc: 'Advertising services' },
        { name: 'Utilities', code: '4900', desc: 'Electric, gas, water, sanitary' },
        { name: 'Healthcare', code: '8099', desc: 'Medical services' },
        { name: 'Entertainment', code: '7994', desc: 'Video games, amusement parks' },
        { name: 'Transportation', code: '4111', desc: 'Local and suburban commuter passenger transportation' },
        { name: 'Groceries', code: '5411', desc: 'Grocery stores, supermarkets' },
        { name: 'Office Supplies', code: '5111', desc: 'Stationery, office supplies' },
        { name: 'Professional Services', code: '7392', desc: 'Management, consulting, public relations services' },
    ];

    for (let i = 0; i < count; i++) {
        const base = baseCategories[i % baseCategories.length];
        categories.push({
            id: generateUniqueId(),
            name: base.name,
            code: base.code,
            description: base.desc,
            blockedByDefault: Math.random() > 0.8, // 20% blocked by default
        });
    }
    return categories;
};

export const generateMockPolicyRules = (count: number): PolicyRule[] => {
    const rules: PolicyRule[] = [];
    const policyTypes = ['limit', 'category_block', 'time_restriction', 'geo_restriction', 'transaction_approval'];
    const appliesToOptions = ['all_cards', 'specific_cards', 'specific_holders'];
    const cardIds = Array.from({ length: 20 }, (_, i) => `card-${i + 1}`); // Assuming some card IDs exist
    const userIds = MOCK_CARDHOLDERS.map(h => h.id);

    for (let i = 0; i < count; i++) {
        const type = policyTypes[Math.floor(Math.random() * policyTypes.length)] as PolicyRule['type'];
        const appliesTo = appliesToOptions[Math.floor(Math.random() * appliesToOptions.length)] as PolicyRule['appliesTo'];
        let configuration: any = {};
        let description = '';
        let targetIds: string[] | undefined;

        if (appliesTo !== 'all_cards') {
            targetIds = Math.random() > 0.5 ? cardIds.slice(0, Math.floor(Math.random() * 5) + 1) : userIds.slice(0, Math.floor(Math.random() * 3) + 1);
        }

        switch (type) {
            case 'limit':
                configuration = { monthlyLimit: Math.floor(getRandomNumber(500, 10000) / 100) * 100 };
                description = `Limit spending to ${formatCurrency(configuration.monthlyLimit)} per month.`;
                break;
            case 'category_block':
                const mockCategories = generateMockMerchantCategories(3);
                configuration = { blockedMcc: mockCategories.map(c => c.code) };
                description = `Block transactions from categories: ${mockCategories.map(c => c.name).join(', ')}.`;
                break;
            case 'time_restriction':
                configuration = { startTime: '09:00', endTime: '18:00', daysOfWeek: [1, 2, 3, 4, 5] };
                description = `Allow transactions only during business hours (Mon-Fri 9 AM - 6 PM).`;
                break;
            case 'geo_restriction':
                configuration = { allowedCountries: ['US', 'CA', 'GB'], blockedCountries: ['RU'] };
                description = `Restrict transactions to specific countries.`;
                break;
            case 'transaction_approval':
                configuration = { minAmount: Math.floor(getRandomNumber(100, 1000) / 50) * 50, approverRole: 'Finance Manager' };
                description = `Require approval for transactions over ${formatCurrency(configuration.minAmount)}.`;
                break;
        }

        rules.push({
            id: generateUniqueId(),
            name: `Policy Rule ${i + 1}`,
            description: description,
            type,
            isActive: Math.random() > 0.1,
            priority: i + 1,
            configuration,
            appliesTo,
            targetIds,
        });
    }
    return rules;
};

export const generateMockCardRequests = (count: number): CardRequest[] => {
    const requests: CardRequest[] = [];
    const requestTypes = ['new_card', 'limit_increase', 'freeze_unfreeze', 'card_replacement', 'close_card'];
    const statuses = ['pending', 'approved', 'rejected', 'completed'];
    const cardholders = MOCK_CARDHOLDERS;
    const existingCardIds = Array.from({ length: 10 }, (_, i) => `card-existing-${i + 1}`);

    for (let i = 0; i < count; i++) {
        const requestor = cardholders[Math.floor(Math.random() * cardholders.length)];
        const requestType = requestTypes[Math.floor(Math.random() * requestTypes.length)] as CardRequest['requestType'];
        const status = statuses[Math.floor(Math.random() * statuses.length)] as CardRequest['status'];
        const requestedDate = new Date(Date.now() - getRandomNumber(0, 30 * 24 * 60 * 60 * 1000)); // Last 30 days

        let details: CardRequest['details'] = { reason: `Reason for ${requestType} request.`, currency: 'USD' };
        if (requestType === 'new_card') {
            details.cardHolderName = `${requestor.name}`;
            details.cardType = Math.random() > 0.5 ? 'physical' : 'virtual';
            details.limit = Math.floor(getRandomNumber(1000, 15000) / 100) * 100;
        } else {
            details.existingCardId = existingCardIds[Math.floor(Math.random() * existingCardIds.length)];
            if (requestType === 'limit_increase') {
                details.limit = Math.floor(getRandomNumber(500, 5000) / 100) * 100;
            }
        }

        let approvedBy, approvalDate;
        if (status === 'approved' || status === 'completed') {
            approvedBy = cardholders.find(h => h.role === 'Finance Manager')?.id || cardholders[0].id;
            approvalDate = new Date(requestedDate.getTime() + getRandomNumber(0, 7 * 24 * 60 * 60 * 1000));
        }

        requests.push({
            id: generateUniqueId(),
            requestorId: requestor.id,
            requestType,
            status,
            requestedDate,
            approvedBy,
            approvalDate,
            details,
            notes: Math.random() > 0.7 ? `Additional notes for request ${i + 1}.` : undefined,
        });
    }
    return requests;
};

export const generateMockVirtualCards = (count: number, corporateCards: CorporateCard[]): VirtualCard[] => {
    const virtualCards: VirtualCard[] = [];
    const cardholders = MOCK_CARDHOLDERS;

    for (let i = 0; i < count; i++) {
        const holder = cardholders[Math.floor(Math.random() * cardholders.length)];
        const associatedCorpCard = corporateCards[Math.floor(Math.random() * corporateCards.length)];
        const isSingleUse = Math.random() > 0.7;
        const generationDate = new Date(Date.now() - getRandomNumber(0, 90 * 24 * 60 * 60 * 1000));
        const expiration = new Date(generationDate.getTime() + getRandomNumber(30, 365) * 24 * 60 * 60 * 1000);
        const autoTerminateDate = isSingleUse ? new Date(expiration.getTime() - getRandomNumber(1, 15) * 24 * 60 * 60 * 1000) : undefined;
        const purposeOptions = ['Software Subscription', 'Ad Campaign', 'Travel Booking', 'Project Expense', 'Vendor Payment'];

        virtualCards.push({
            ...associatedCorpCard, // Inherit base properties for simplicity
            id: `vcard-${generateUniqueId()}`, // Unique ID for virtual card
            cardNumberMask: `V-${(Math.floor(getRandomNumber(1000, 9999))).toString()}`,
            holderName: `${holder.name} (Virtual)`,
            limit: Math.floor(getRandomNumber(50, 2000) / 10) * 10,
            balance: Math.floor(getRandomNumber(0, 1500) / 10) * 10,
            status: expiration.getTime() < Date.now() ? 'Expired' : Math.random() > 0.9 ? 'Frozen' : 'Active',
            frozen: expiration.getTime() < Date.now() || Math.random() > 0.9,
            parentCardId: associatedCorpCard?.id || undefined,
            isSingleUse,
            expiration,
            associatedProject: Math.random() > 0.5 ? `Project ${Math.floor(getRandomNumber(1, 5))}` : undefined,
            purpose: purposeOptions[Math.floor(Math.random() * purposeOptions.length)],
            generationDate,
            autoTerminateDate,
            transactions: associatedCorpCard.transactions.slice(0, Math.floor(getRandomNumber(0, 5))), // Fewer transactions for virtual cards
        });
    }
    return virtualCards;
};


export const generateMockAuditLogs = (count: number): AuditLogEntry[] => {
    const logs: AuditLogEntry[] = [];
    const cardIds = Array.from({ length: 20 }, (_, i) => `card-${i + 1}`);
    const policyIds = Array.from({ length: 10 }, (_, i) => `policy-${i + 1}`);
    const requestIds = Array.from({ length: 10 }, (_, i) => `req-${i + 1}`);
    const virtualCardIds = Array.from({ length: 10 }, (_, i) => `vcard-${i + 1}`);
    const targetTypes = ['card', 'card_request', 'policy', 'user', 'virtual_card'];
    const actions = [
        'CREATE_CARD', 'UPDATE_CARD_LIMIT', 'FREEZE_CARD', 'UNFREEZE_CARD', 'DELETE_CARD',
        'APPROVE_CARD_REQUEST', 'REJECT_CARD_REQUEST', 'CREATE_POLICY', 'UPDATE_POLICY', 'DEACTIVATE_POLICY',
        'ASSIGN_ROLE', 'UPDATE_USER_PERMISSIONS', 'CREATE_VIRTUAL_CARD', 'TERMINATE_VIRTUAL_CARD',
        'GENERATE_REPORT', 'UPDATE_API_SETTINGS'
    ];
    const cardholders = MOCK_CARDHOLDERS;

    for (let i = 0; i < count; i++) {
        const actor = cardholders[Math.floor(Math.random() * cardholders.length)];
        const targetType = targetTypes[Math.floor(Math.random() * targetTypes.length)] as AuditLogEntry['targetType'];
        const action = actions[Math.floor(Math.random() * actions.length)];
        let targetId = '';
        let description = '';

        switch (targetType) {
            case 'card':
                targetId = cardIds[Math.floor(Math.random() * cardIds.length)];
                description = `Card ${action.replace('_', ' ').toLowerCase()} for ${targetId}.`;
                break;
            case 'card_request':
                targetId = requestIds[Math.floor(Math.random() * requestIds.length)];
                description = `Card request ${action.replace('_', ' ').toLowerCase()} for ${targetId}.`;
                break;
            case 'policy':
                targetId = policyIds[Math.floor(Math.random() * policyIds.length)];
                description = `Policy ${action.replace('_', ' ').toLowerCase()} for ${targetId}.`;
                break;
            case 'user':
                targetId = cardholders[Math.floor(Math.random() * cardholders.length)].id;
                description = `User ${action.replace('_', ' ').toLowerCase()} for ${targetId}.`;
                break;
            case 'virtual_card':
                targetId = virtualCardIds[Math.floor(Math.random() * virtualCardIds.length)];
                description = `Virtual Card ${action.replace('_', ' ').toLowerCase()} for ${targetId}.`;
                break;
        }

        logs.push({
            id: generateUniqueId(),
            timestamp: new Date(Date.now() - getRandomNumber(0, 180 * 24 * 60 * 60 * 1000)), // Last 6 months
            actorId: actor.id,
            action,
            targetType,
            targetId,
            oldValue: Math.random() > 0.7 ? { status: 'Active' } : undefined,
            newValue: Math.random() > 0.7 ? { status: 'Frozen' } : undefined,
            description,
        });
    }
    return logs;
};

export const generateMockUserPermissionProfiles = (count: number): UserPermissionProfile[] => {
    const profiles: UserPermissionProfile[] = [];
    const baseRoles = ['Admin', 'Finance Manager', 'Team Lead', 'Employee', 'Auditor', 'Executive'];

    for (let i = 0; i < count; i++) {
        const roleName = baseRoles[i % baseRoles.length];
        profiles.push({
            id: `role-${generateUniqueId()}`,
            name: roleName,
            description: `Permissions for ${roleName} role.`,
            permissions: {
                canViewAllCards: roleName === 'Admin' || roleName === 'Finance Manager' || roleName === 'Auditor' || roleName === 'Executive',
                canManageOwnCards: roleName === 'Employee' || roleName === 'Team Lead',
                canManageTeamCards: roleName === 'Team Lead',
                canManageAllCards: roleName === 'Admin' || roleName === 'Finance Manager',
                canCreateCards: roleName === 'Admin' || roleName === 'Finance Manager',
                canApproveRequests: roleName === 'Admin' || roleName === 'Finance Manager',
                canManagePolicies: roleName === 'Admin' || roleName === 'Finance Manager',
                canViewAuditLogs: roleName === 'Admin' || roleName === 'Finance Manager' || roleName === 'Auditor',
                canManageUserPermissions: roleName === 'Admin',
                canAccessReporting: roleName === 'Admin' || roleName === 'Finance Manager' || roleName === 'Executive',
                canManageIntegrations: roleName === 'Admin',
            },
        });
    }
    return profiles;
};

export const generateMockAlertConfigurations = (count: number, cardIds: string[]): AlertConfiguration[] => {
    const configs: AlertConfiguration[] = [];
    const alertTypes = ['spending_threshold', 'unusual_transaction', 'policy_violation', 'card_status_change', 'low_balance'];
    const periods = ['daily', 'weekly', 'monthly', 'transaction'];
    const channels = [['email'], ['email', 'slack'], ['sms']];
    const userIds = MOCK_CARDHOLDERS.map(h => h.id);

    for (let i = 0; i < count; i++) {
        const type = alertTypes[Math.floor(Math.random() * alertTypes.length)] as AlertConfiguration['type'];
        const period = periods[Math.floor(Math.random() * periods.length)] as AlertConfiguration['period'];
        const targetCards = Math.random() > 0.6 ? cardIds.slice(0, Math.floor(getRandomNumber(1, 5))) : undefined;
        const targetUsers = userIds.slice(0, Math.floor(getRandomNumber(1, 3)));
        let threshold: number | undefined;

        if (type === 'spending_threshold' || type === 'low_balance') {
            threshold = Math.floor(getRandomNumber(50, 1000) / 10) * 10;
        }

        configs.push({
            id: generateUniqueId(),
            name: `${capitalizeFirstLetter(type.replace(/_/g, ' '))} Alert ${i + 1}`,
            description: `Config for ${type} alert.`,
            type,
            threshold,
            period: type === 'spending_threshold' || type === 'low_balance' ? period : undefined,
            targetCards,
            targetUsers,
            channels: channels[Math.floor(Math.random() * channels.length)] as ('email' | 'slack' | 'sms')[],
            isActive: Math.random() > 0.1,
        });
    }
    return configs;
};

export const generateMockSubscriptions = (count: number, cardIds: string[]): Subscription[] => {
    const subscriptions: Subscription[] = [];
    const merchantNames = ['Adobe Creative Cloud', 'Zoom Pro', 'Slack Business+', 'Microsoft 365', 'AWS Services', 'Salesforce CRM', 'Google Workspace', 'Netflix Business'];
    const billingCycles = ['monthly', 'annually', 'quarterly'];
    const categories = ['Software', 'Cloud Services', 'Productivity', 'Entertainment'];
    const statuses = ['active', 'cancelled', 'paused'];

    for (let i = 0; i < count; i++) {
        const cardId = cardIds[Math.floor(Math.random() * cardIds.length)];
        const billingCycle = billingCycles[Math.floor(Math.random() * billingCycles.length)];
        const startDate = new Date(Date.now() - getRandomNumber(30, 730) * 24 * 60 * 60 * 1000); // Last 2 years
        let nextBillingDate: Date;
        if (billingCycle === 'monthly') nextBillingDate = new Date(startDate.getFullYear(), startDate.getMonth() + Math.floor(getRandomNumber(1, 12)), startDate.getDate());
        else if (billingCycle === 'annually') nextBillingDate = new Date(startDate.getFullYear() + Math.floor(getRandomNumber(1, 2)), startDate.getMonth(), startDate.getDate());
        else nextBillingDate = new Date(startDate.getFullYear(), startDate.getMonth() + Math.floor(getRandomNumber(1, 8)) * 3, startDate.getDate()); // quarterly

        subscriptions.push({
            id: generateUniqueId(),
            cardId,
            merchantName: merchantNames[Math.floor(Math.random() * merchantNames.length)],
            amount: Math.floor(getRandomNumber(10, 500) / 5) * 5,
            currency: 'USD',
            billingCycle,
            nextBillingDate: nextBillingDate,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            category: categories[Math.floor(Math.random() * categories.length)],
            startDate,
            notes: Math.random() > 0.7 ? `Notes for ${merchantNames[i % merchantNames.length]} subscription.` : undefined,
        });
    }
    return subscriptions;
};

export const generateMockBudgets = (count: number, cardIds: string[]): Budget[] => {
    const budgets: Budget[] = [];
    const periods = ['monthly', 'quarterly', 'annually'];
    const departmentNames = ['Sales', 'Marketing', 'Engineering', 'HR', 'Finance', 'Operations'];

    for (let i = 0; i < count; i++) {
        const period = periods[Math.floor(Math.random() * periods.length)];
        const totalAmount = Math.floor(getRandomNumber(5000, 100000) / 100) * 100;
        const allocatedAmount = Math.floor(totalAmount * getRandomNumber(0.8, 1));
        const spentAmount = Math.floor(allocatedAmount * getRandomNumber(0.1, 0.9));
        const startDate = new Date(Date.now() - getRandomNumber(0, 365) * 24 * 60 * 60 * 1000);
        const endDate = new Date(startDate.getFullYear() + (period === 'annually' ? 1 : 0), startDate.getMonth() + (period === 'monthly' ? 1 : period === 'quarterly' ? 3 : 0), startDate.getDate());
        const linkedCards = cardIds.slice(0, Math.floor(getRandomNumber(1, 5)));

        budgets.push({
            id: generateUniqueId(),
            name: `${departmentNames[i % departmentNames.length]} Budget ${i % 2 === 0 ? 'Q' + Math.floor(getRandomNumber(1, 4)) : 'FY' + (new Date().getFullYear())}`,
            period,
            totalAmount,
            allocatedAmount,
            spentAmount,
            departmentId: `dept-${i % departmentNames.length}`,
            startDate,
            endDate,
            cardsLinked: linkedCards,
        });
    }
    return budgets;
};

export const generateMockAPISettings = (count: number): APISetting[] => {
    const settings: APISetting[] = [];
    const integrationNames = ['Expenseify ERP', 'TravelBuddy Booking', 'AnalyticsSuite', 'HRConnect', 'FraudDetect AI'];
    const endpoints = ['/api/expenses', '/api/bookings', '/api/data', '/api/employees', '/api/fraud'];

    for (let i = 0; i < count; i++) {
        const name = integrationNames[i % integrationNames.length];
        settings.push({
            id: generateUniqueId(),
            name,
            description: `Integration settings for ${name}.`,
            apiKey: `pk_live_${generateUniqueId()}`,
            apiSecret: Math.random() > 0.5 ? `sk_live_${generateUniqueId()}` : undefined,
            endpoint: `https://api.external.com${endpoints[i % endpoints.length]}`,
            isActive: Math.random() > 0.1,
            lastAccessed: new Date(Date.now() - getRandomNumber(0, 30 * 24 * 60 * 60 * 1000)),
            allowedIPs: Math.random() > 0.6 ? [`192.168.1.${Math.floor(getRandomNumber(1, 254))}`, `10.0.0.${Math.floor(getRandomNumber(1, 254))}`] : undefined,
            webhookUrl: Math.random() > 0.5 ? `https://your-app.com/webhooks/${name.toLowerCase().replace(/\s/g, '-')}` : undefined,
            eventsSubscribed: Math.random() > 0.5 ? ['transaction.created', 'card.frozen', 'request.approved'] : undefined,
        });
    }
    return settings;
};

export const generateMockComplianceReports = (count: number): ComplianceReport[] => {
    const reports: ComplianceReport[] = [];
    const reportTypes = ['spending_policy_adherence', 'transaction_audits', 'user_activity', 'financial_reconciliation'];
    const userIds = MOCK_CARDHOLDERS.map(h => h.id);
    const statuses = ['pending', 'completed', 'failed'];

    for (let i = 0; i < count; i++) {
        const reportType = reportTypes[Math.floor(Math.random() * reportTypes.length)] as ComplianceReport['reportType'];
        const generatedBy = userIds[Math.floor(Math.random() * userIds.length)];
        const generatedDate = new Date(Date.now() - getRandomNumber(0, 90 * 24 * 60 * 60 * 1000));
        const startDate = new Date(generatedDate.getFullYear(), generatedDate.getMonth() - Math.floor(getRandomNumber(1, 6)), 1);
        const endDate = new Date(generatedDate.getFullYear(), generatedDate.getMonth(), 0);
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        reports.push({
            id: generateUniqueId(),
            name: `${capitalizeFirstLetter(reportType.replace(/_/g, ' '))} Report ${i + 1}`,
            description: `Detailed report on ${reportType}.`,
            reportType,
            generatedBy,
            generatedDate,
            startDate,
            endDate,
            status,
            downloadUrl: status === 'completed' ? `/reports/download/${generateUniqueId()}.pdf` : undefined,
            parameters: { period: 'monthly', department: 'All' },
        });
    }
    return reports;
};

export const generateMockStatements = (count: number, cardIds: string[]): Statement[] => {
    const statements: Statement[] = [];
    const statuses = ['generated', 'reviewed', 'approved'];

    for (let i = 0; i < count; i++) {
        const cardId = cardIds[Math.floor(Math.random() * cardIds.length)];
        const statementDate = new Date(Date.now() - getRandomNumber(0, 365) * 24 * 60 * 60 * 1000);
        const startDate = new Date(statementDate.getFullYear(), statementDate.getMonth() - 1, 1);
        const endDate = new Date(statementDate.getFullYear(), statementDate.getMonth(), 0);
        const totalSpent = Math.floor(getRandomNumber(100, 5000) / 10) * 10;
        const totalRefunds = Math.floor(getRandomNumber(0, 200) / 10) * 10;
        const closingBalance = totalSpent - totalRefunds;

        statements.push({
            id: generateUniqueId(),
            cardId,
            statementDate,
            startDate,
            endDate,
            totalSpent,
            totalRefunds,
            closingBalance,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            downloadUrl: `/statements/download/${generateUniqueId()}.pdf`,
        });
    }
    return statements;
};

export const generateMockAppConfig = (): AppConfig => ({
    defaultCurrency: 'USD',
    auditLogRetentionDays: 365,
    cardRequestApprovalWorkflow: 'single_approver',
    maxVirtualCardsPerUser: 5,
    enableMultiFactorAuthentication: true,
});

// --- END: MOCK DATA GENERATION FUNCTIONS ---

// --- START: CONTEXT FOR SHARED DATA AND ACTIONS (FOR NEW FEATURES) ---
// In a real application, this would be part of a larger, more structured global state management.
// For this exercise, we define it here to allow new components to interact.

interface AdvancedCardData {
    merchantCategories: MerchantCategory[];
    policyRules: PolicyRule[];
    cardRequests: CardRequest[];
    virtualCards: VirtualCard[];
    auditLogs: AuditLogEntry[];
    userPermissionProfiles: UserPermissionProfile[];
    alertConfigurations: AlertConfiguration[];
    subscriptions: Subscription[];
    budgets: Budget[];
    apiSettings: APISetting[];
    complianceReports: ComplianceReport[];
    statements: Statement[];
    appConfig: AppConfig;
}

interface AdvancedCardActions {
    updateMerchantCategory: (id: string, updates: Partial<MerchantCategory>) => void;
    addPolicyRule: (rule: PolicyRule) => void;
    updatePolicyRule: (id: string, updates: Partial<PolicyRule>) => void;
    deletePolicyRule: (id: string) => void;
    createCardRequest: (request: Omit<CardRequest, 'id' | 'status' | 'requestedDate'>) => void;
    updateCardRequestStatus: (id: string, status: CardRequest['status'], approverId: string) => void;
    createVirtualCard: (card: Omit<VirtualCard, 'id' | 'cardNumberMask' | 'generationDate'>) => void;
    updateVirtualCard: (id: string, updates: Partial<VirtualCard>) => void;
    deleteVirtualCard: (id: string) => void;
    addAuditLog: (log: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
    addUserPermissionProfile: (profile: UserPermissionProfile) => void;
    updateUserPermissionProfile: (id: string, updates: Partial<UserPermissionProfile>) => void;
    deleteUserPermissionProfile: (id: string) => void;
    addAlertConfiguration: (config: AlertConfiguration) => void;
    updateAlertConfiguration: (id: string, updates: Partial<AlertConfiguration>) => void;
    deleteAlertConfiguration: (id: string) => void;
    addSubscription: (sub: Omit<Subscription, 'id'>) => void;
    updateSubscription: (id: string, updates: Partial<Subscription>) => void;
    deleteSubscription: (id: string) => void;
    addBudget: (budget: Omit<Budget, 'id'>) => void;
    updateBudget: (id: string, updates: Partial<Budget>) => void;
    deleteBudget: (id: string) => void;
    updateAPISetting: (id: string, updates: Partial<APISetting>) => void;
    generateComplianceReport: (params: any) => Promise<ComplianceReport>;
    generateStatement: (cardId: string, month: number, year: number) => Promise<Statement>;
    updateAppConfig: (config: Partial<AppConfig>) => void;
}

export const AdvancedCardContext = createContext<({ data: AdvancedCardData; actions: AdvancedCardActions } | null)>(null);

/**
 * Provider for advanced card management data and actions.
 * This component wraps the main CardManagementView to provide global state for new features.
 * In a real app, this would be its own file and manage actual API calls, not just mock data.
 */
export const AdvancedCardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { corporateCards, toggleCorporateCardFreeze, updateCorporateCardControls } = useContext(DataContext)!;

    // Initialize all extended data with mocks
    const [merchantCategories, setMerchantCategories] = useState<MerchantCategory[]>(() => generateMockMerchantCategories(15));
    const [policyRules, setPolicyRules] = useState<PolicyRule[]>(() => generateMockPolicyRules(10));
    const [cardRequests, setCardRequests] = useState<CardRequest[]>(() => generateMockCardRequests(20));
    const [virtualCards, setVirtualCards] = useState<VirtualCard[]>(() => generateMockVirtualCards(25, corporateCards));
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => generateMockAuditLogs(50));
    const [userPermissionProfiles, setUserPermissionProfiles] = useState<UserPermissionProfile[]>(() => generateMockUserPermissionProfiles(6));
    const [alertConfigurations, setAlertConfigurations] = useState<AlertConfiguration[]>(() => generateMockAlertConfigurations(12, corporateCards.map(c => c.id)));
    const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => generateMockSubscriptions(30, corporateCards.map(c => c.id)));
    const [budgets, setBudgets] = useState<Budget[]>(() => generateMockBudgets(10, corporateCards.map(c => c.id)));
    const [apiSettings, setApiSettings] = useState<APISetting[]>(() => generateMockAPISettings(5));
    const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>(() => generateMockComplianceReports(8));
    const [statements, setStatements] = useState<Statement[]>(() => generateMockStatements(30, corporateCards.map(c => c.id)));
    const [appConfig, setAppConfig] = useState<AppConfig>(() => generateMockAppConfig());

    // --- Action Implementations ---
    const updateMerchantCategory = useCallback((id: string, updates: Partial<MerchantCategory>) => {
        setMerchantCategories(prev => prev.map(mc => mc.id === id ? { ...mc, ...updates } : mc));
        addAuditLog({ actorId: 'system', action: 'UPDATE_MERCHANT_CATEGORY', targetType: 'policy', targetId: id, description: `Updated merchant category ${id}` });
    }, []);

    const addPolicyRule = useCallback((rule: PolicyRule) => {
        setPolicyRules(prev => [...prev, { ...rule, id: generateUniqueId() }]);
        addAuditLog({ actorId: 'system', action: 'CREATE_POLICY_RULE', targetType: 'policy', targetId: rule.id, description: `Created policy rule ${rule.name}` });
    }, []);

    const updatePolicyRule = useCallback((id: string, updates: Partial<PolicyRule>) => {
        setPolicyRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
        addAuditLog({ actorId: 'system', action: 'UPDATE_POLICY_RULE', targetType: 'policy', targetId: id, description: `Updated policy rule ${id}` });
    }, []);

    const deletePolicyRule = useCallback((id: string) => {
        setPolicyRules(prev => prev.filter(r => r.id !== id));
        addAuditLog({ actorId: 'system', action: 'DELETE_POLICY_RULE', targetType: 'policy', targetId: id, description: `Deleted policy rule ${id}` });
    }, []);

    const createCardRequest = useCallback((request: Omit<CardRequest, 'id' | 'status' | 'requestedDate'>) => {
        const newRequest: CardRequest = {
            id: generateUniqueId(),
            status: 'pending',
            requestedDate: new Date(),
            ...request,
        };
        setCardRequests(prev => [...prev, newRequest]);
        addAuditLog({ actorId: newRequest.requestorId, action: 'CREATE_CARD_REQUEST', targetType: 'card_request', targetId: newRequest.id, description: `User ${newRequest.requestorId} created a card request.` });
    }, []);

    const updateCardRequestStatus = useCallback((id: string, status: CardRequest['status'], approverId: string) => {
        setCardRequests(prev => prev.map(req =>
            req.id === id ? { ...req, status, approvedBy: approverId, approvalDate: new Date() } : req
        ));
        addAuditLog({ actorId: approverId, action: `UPDATE_CARD_REQUEST_STATUS_${status.toUpperCase()}`, targetType: 'card_request', targetId: id, description: `Card request ${id} ${status} by ${approverId}.` });
    }, []);

    const createVirtualCard = useCallback((card: Omit<VirtualCard, 'id' | 'cardNumberMask' | 'generationDate'>) => {
        const newVirtualCard: VirtualCard = {
            ...card,
            id: `vcard-${generateUniqueId()}`,
            cardNumberMask: `V-${(Math.floor(getRandomNumber(1000, 9999))).toString()}`,
            generationDate: new Date(),
            // Ensure necessary fields are present or default if omitted
            holderName: card.holderName || MOCK_CARDHOLDERS.find(h => h.id === card.id)?.name || 'Unknown',
            balance: card.balance || 0,
            limit: card.limit || 1000,
            status: card.status || 'Active',
            frozen: card.frozen || false,
            transactions: card.transactions || [],
            controls: card.controls || { monthlyLimit: card.limit || 1000, atm: false, online: true, contactless: true },
        };
        setVirtualCards(prev => [...prev, newVirtualCard]);
        addAuditLog({ actorId: 'system', action: 'CREATE_VIRTUAL_CARD', targetType: 'virtual_card', targetId: newVirtualCard.id, description: `Created new virtual card for ${newVirtualCard.holderName}.` });
    }, []);

    const updateVirtualCard = useCallback((id: string, updates: Partial<VirtualCard>) => {
        setVirtualCards(prev => prev.map(vc => vc.id === id ? { ...vc, ...updates } : vc));
        addAuditLog({ actorId: 'system', action: 'UPDATE_VIRTUAL_CARD', targetType: 'virtual_card', targetId: id, description: `Updated virtual card ${id}` });
    }, []);

    const deleteVirtualCard = useCallback((id: string) => {
        setVirtualCards(prev => prev.filter(vc => vc.id !== id));
        addAuditLog({ actorId: 'system', action: 'TERMINATE_VIRTUAL_CARD', targetType: 'virtual_card', targetId: id, description: `Terminated virtual card ${id}` });
    }, []);

    const addAuditLog = useCallback((log: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
        setAuditLogs(prev => [...prev, { ...log, id: generateUniqueId(), timestamp: new Date() }]);
    }, []);

    const addUserPermissionProfile = useCallback((profile: UserPermissionProfile) => {
        setUserPermissionProfiles(prev => [...prev, { ...profile, id: `role-${generateUniqueId()}` }]);
        addAuditLog({ actorId: 'system', action: 'CREATE_PERMISSION_PROFILE', targetType: 'user', targetId: profile.id, description: `Created user permission profile ${profile.name}` });
    }, []);

    const updateUserPermissionProfile = useCallback((id: string, updates: Partial<UserPermissionProfile>) => {
        setUserPermissionProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        addAuditLog({ actorId: 'system', action: 'UPDATE_PERMISSION_PROFILE', targetType: 'user', targetId: id, description: `Updated user permission profile ${id}` });
    }, []);

    const deleteUserPermissionProfile = useCallback((id: string) => {
        setUserPermissionProfiles(prev => prev.filter(p => p.id !== id));
        addAuditLog({ actorId: 'system', action: 'DELETE_PERMISSION_PROFILE', targetType: 'user', targetId: id, description: `Deleted user permission profile ${id}` });
    }, []);

    const addAlertConfiguration = useCallback((config: AlertConfiguration) => {
        setAlertConfigurations(prev => [...prev, { ...config, id: generateUniqueId() }]);
        addAuditLog({ actorId: 'system', action: 'CREATE_ALERT_CONFIG', targetType: 'policy', targetId: config.id, description: `Created alert configuration ${config.name}` });
    }, []);

    const updateAlertConfiguration = useCallback((id: string, updates: Partial<AlertConfiguration>) => {
        setAlertConfigurations(prev => prev.map(ac => ac.id === id ? { ...ac, ...updates } : ac));
        addAuditLog({ actorId: 'system', action: 'UPDATE_ALERT_CONFIG', targetType: 'policy', targetId: id, description: `Updated alert configuration ${id}` });
    }, []);

    const deleteAlertConfiguration = useCallback((id: string) => {
        setAlertConfigurations(prev => prev.filter(ac => ac.id !== id));
        addAuditLog({ actorId: 'system', action: 'DELETE_ALERT_CONFIG', targetType: 'policy', targetId: id, description: `Deleted alert configuration ${id}` });
    }, []);

    const addSubscription = useCallback((sub: Omit<Subscription, 'id'>) => {
        setSubscriptions(prev => [...prev, { ...sub, id: generateUniqueId() }]);
        addAuditLog({ actorId: 'system', action: 'ADD_SUBSCRIPTION', targetType: 'card', targetId: sub.cardId, description: `Added subscription for ${sub.merchantName} to card ${sub.cardId}` });
    }, []);

    const updateSubscription = useCallback((id: string, updates: Partial<Subscription>) => {
        setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
        addAuditLog({ actorId: 'system', action: 'UPDATE_SUBSCRIPTION', targetType: 'card', targetId: id, description: `Updated subscription ${id}` });
    }, []);

    const deleteSubscription = useCallback((id: string) => {
        setSubscriptions(prev => prev.filter(s => s.id !== id));
        addAuditLog({ actorId: 'system', action: 'DELETE_SUBSCRIPTION', targetType: 'card', targetId: id, description: `Deleted subscription ${id}` });
    }, []);

    const addBudget = useCallback((budget: Omit<Budget, 'id'>) => {
        setBudgets(prev => [...prev, { ...budget, id: generateUniqueId() }]);
        addAuditLog({ actorId: 'system', action: 'CREATE_BUDGET', targetType: 'policy', targetId: budget.id, description: `Created new budget ${budget.name}` });
    }, []);

    const updateBudget = useCallback((id: string, updates: Partial<Budget>) => {
        setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
        addAuditLog({ actorId: 'system', action: 'UPDATE_BUDGET', targetType: 'policy', targetId: id, description: `Updated budget ${id}` });
    }, []);

    const deleteBudget = useCallback((id: string) => {
        setBudgets(prev => prev.filter(b => b.id !== id));
        addAuditLog({ actorId: 'system', action: 'DELETE_BUDGET', targetType: 'policy', targetId: id, description: `Deleted budget ${id}` });
    }, []);

    const updateAPISetting = useCallback((id: string, updates: Partial<APISetting>) => {
        setApiSettings(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
        addAuditLog({ actorId: 'system', action: 'UPDATE_API_SETTING', targetType: 'policy', targetId: id, description: `Updated API setting ${id}` });
    }, []);

    const generateComplianceReport = useCallback(async (params: any) => {
        // Simulate API call
        return new Promise<ComplianceReport>(resolve => {
            setTimeout(() => {
                const newReport: ComplianceReport = {
                    ...generateMockComplianceReports(1)[0], // Generate a single mock report
                    id: generateUniqueId(),
                    generatedDate: new Date(),
                    status: 'completed',
                    downloadUrl: `/reports/download/${generateUniqueId()}.pdf`,
                    parameters: params,
                    name: `Custom Report ${formatDate(new Date(), { month: 'short', day: 'numeric' })}`
                };
                setComplianceReports(prev => [...prev, newReport]);
                addAuditLog({ actorId: 'system', action: 'GENERATE_COMPLIANCE_REPORT', targetType: 'policy', targetId: newReport.id, description: `Generated compliance report ${newReport.name}` });
                resolve(newReport);
            }, 1500); // Simulate network delay
        });
    }, []);

    const generateStatement = useCallback(async (cardId: string, month: number, year: number) => {
        return new Promise<Statement>(resolve => {
            setTimeout(() => {
                const newStatement: Statement = {
                    ...generateMockStatements(1, [cardId])[0],
                    id: generateUniqueId(),
                    cardId,
                    statementDate: new Date(year, month - 1, new Date().getDate()), // Last day of the month
                    startDate: new Date(year, month - 2, 1),
                    endDate: new Date(year, month - 1, 0),
                    status: 'generated',
                    downloadUrl: `/statements/download/card-${cardId}-${year}-${month}.pdf`
                };
                setStatements(prev => [...prev, newStatement]);
                addAuditLog({ actorId: 'system', action: 'GENERATE_STATEMENT', targetType: 'card', targetId: cardId, description: `Generated statement for card ${cardId} for ${month}/${year}` });
                resolve(newStatement);
            }, 1500);
        });
    }, []);

    const updateAppConfig = useCallback((updates: Partial<AppConfig>) => {
        setAppConfig(prev => ({ ...prev, ...updates }));
        addAuditLog({ actorId: 'system', action: 'UPDATE_APP_CONFIG', targetType: 'policy', targetId: 'global', description: `Updated application configuration` });
    }, []);

    const advancedData: AdvancedCardData = useMemo(() => ({
        merchantCategories,
        policyRules,
        cardRequests,
        virtualCards,
        auditLogs,
        userPermissionProfiles,
        alertConfigurations,
        subscriptions,
        budgets,
        apiSettings,
        complianceReports,
        statements,
        appConfig,
    }), [
        merchantCategories, policyRules, cardRequests, virtualCards, auditLogs,
        userPermissionProfiles, alertConfigurations, subscriptions, budgets,
        apiSettings, complianceReports, statements, appConfig
    ]);

    const advancedActions: AdvancedCardActions = useMemo(() => ({
        updateMerchantCategory, addPolicyRule, updatePolicyRule, deletePolicyRule,
        createCardRequest, updateCardRequestStatus, createVirtualCard, updateVirtualCard, deleteVirtualCard,
        addAuditLog, addUserPermissionProfile, updateUserPermissionProfile, deleteUserPermissionProfile,
        addAlertConfiguration, updateAlertConfiguration, deleteAlertConfiguration,
        addSubscription, updateSubscription, deleteSubscription,
        addBudget, updateBudget, deleteBudget,
        updateAPISetting, generateComplianceReport, generateStatement, updateAppConfig
    }), [
        updateMerchantCategory, addPolicyRule, updatePolicyRule, deletePolicyRule,
        createCardRequest, updateCardRequestStatus, createVirtualCard, updateVirtualCard, deleteVirtualCard,
        addAuditLog, addUserPermissionProfile, updateUserPermissionProfile, deleteUserPermissionProfile,
        addAlertConfiguration, updateAlertConfiguration, deleteAlertConfiguration,
        addSubscription, updateSubscription, deleteSubscription,
        addBudget, updateBudget, deleteBudget,
        updateAPISetting, generateComplianceReport, generateStatement, updateAppConfig
    ]);

    return (
        <AdvancedCardContext.Provider value={{ data: advancedData, actions: advancedActions }}>
            {children}
        </AdvancedCardContext.Provider>
    );
};

// --- END: CONTEXT FOR SHARED DATA AND ACTIONS ---

// --- START: SHARED UI COMPONENTS ---

interface TabProps {
    label: string;
    active: boolean;
    onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ label, active, onClick }) => (
    <button
        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
            active ? 'bg-cyan-700 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
        onClick={onClick}
    >
        {label}
    </button>
);

interface TabbedContentProps {
    tabs: { label: string; content: React.ReactNode; key: string }[];
    defaultActiveTab?: string;
    containerClassName?: string;
    headerClassName?: string;
    contentClassName?: string;
}

export const TabbedContent: React.FC<TabbedContentProps> = ({
    tabs,
    defaultActiveTab,
    containerClassName = "bg-gray-800 rounded-lg shadow-xl",
    headerClassName = "flex border-b border-gray-700 p-2 overflow-x-auto",
    contentClassName = "p-6",
}) => {
    const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0]?.key);

    const activeTabContent = useMemo(() => {
        return tabs.find(tab => tab.key === activeTab)?.content || null;
    }, [activeTab, tabs]);

    return (
        <div className={containerClassName}>
            <div className={headerClassName}>
                {tabs.map(tab => (
                    <Tab
                        key={tab.key}
                        label={tab.label}
                        active={tab.key === activeTab}
                        onClick={() => setActiveTab(tab.key)}
                    />
                ))}
            </div>
            <div className={contentClassName}>
                {activeTabContent}
            </div>
        </div>
    );
};

interface PaginatedTableProps<T> {
    data: T[];
    columns: { header: string; accessor: keyof T | ((item: T) => React.ReactNode); className?: string }[];
    itemsPerPage?: number;
    title?: string;
    searchableKeys?: (keyof T)[];
    filterOptions?: Record<string, { label: string; options: { value: any; label: string }[] }>;
    actions?: (item: T) => React.ReactNode;
    emptyMessage?: string;
    rowKeyExtractor: (item: T) => string;
}

export const PaginatedTable = <T extends Record<string, any>>({
    data,
    columns,
    itemsPerPage = 10,
    title,
    searchableKeys = [],
    filterOptions = {},
    actions,
    emptyMessage = "No data available.",
    rowKeyExtractor,
}: PaginatedTableProps<T>) => {
    const {
        filteredData,
        searchTerm,
        handleSearchChange,
        filters,
        handleFilterChange,
        resetFilters
    } = useSearchAndFilter(data, searchableKeys);

    const { currentData, currentPage, maxPage, next, prev, jump } = usePagination(filteredData, itemsPerPage);

    return (
        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-4">
            {title && <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>}

            <div className="flex flex-wrap items-center gap-4 mb-4">
                {searchableKeys.length > 0 && (
                    <input
                        type="text"
                        placeholder="Search..."
                        className="input input-bordered w-full md:w-auto bg-gray-700 text-white border-gray-600 focus:border-cyan-500"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                )}
                {Object.entries(filterOptions).map(([key, { label, options }]) => (
                    <select
                        key={key}
                        className="select select-bordered bg-gray-700 text-white border-gray-600 focus:border-cyan-500"
                        value={filters[key] || ''}
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                    >
                        <option value="">{`Filter by ${label}`}</option>
                        {options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                ))}
                {(searchTerm || Object.keys(filters).length > 0) && (
                    <button onClick={resetFilters} className="btn btn-ghost text-gray-400 hover:text-white">Reset Filters</button>
                )}
            </div>

            {currentData.length === 0 ? (
                <div className="text-center text-gray-400 py-8">{emptyMessage}</div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="table w-full text-white">
                            <thead className="bg-gray-700 text-gray-300">
                                <tr>
                                    {columns.map((col, index) => (
                                        <th key={index} className={`px-4 py-2 text-left text-sm font-semibold ${col.className || ''}`}>{col.header}</th>
                                    ))}
                                    {actions && <th className="px-4 py-2 text-left text-sm font-semibold">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((item) => (
                                    <tr key={rowKeyExtractor(item)} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        {columns.map((col, index) => (
                                            <td key={index} className={`px-4 py-2 text-sm ${col.className || ''}`}>
                                                {typeof col.accessor === 'function' ? col.accessor(item) : String(item[col.accessor])}
                                            </td>
                                        ))}
                                        {actions && <td className="px-4 py-2 text-sm">{actions(item)}</td>}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {maxPage > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-4">
                            <button onClick={prev} disabled={currentPage === 1} className="btn btn-sm btn-ghost text-gray-400 hover:text-white">Previous</button>
                            {Array.from({ length: maxPage }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => jump(page)}
                                    className={`btn btn-sm ${currentPage === page ? 'btn-active btn-cyan' : 'btn-ghost text-gray-400 hover:text-white'}`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button onClick={next} disabled={currentPage === maxPage} className="btn btn-sm btn-ghost text-gray-400 hover:text-white">Next</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// --- END: SHARED UI COMPONENTS ---

// --- START: EXPANDED CardDetailModal SUB-COMPONENTS ---

interface CardControlsTabProps {
    selectedCard: CorporateCard;
    controls: CorporateCardControls;
    setControls: React.Dispatch<React.SetStateAction<CorporateCardControls>>;
    updateControls: (updates: Partial<CorporateCardControls>) => void;
    merchantCategories: MerchantCategory[]; // From AdvancedCardContext
}

const CardControlsTab: React.FC<CardControlsTabProps> = ({ selectedCard, controls, setControls, updateControls, merchantCategories }) => {
    const [spendingCategories, setSpendingCategories] = useState<string[]>(controls.allowedSpendingCategories || []);
    const [recurringTxnLimit, setRecurringTxnLimit] = useState<number>(controls.recurringTransactionLimit || 0);

    const availableCategories = useMemo(() => {
        return merchantCategories.map(mc => ({ value: mc.code, label: mc.name }));
    }, [merchantCategories]);

    const handleCategoryToggle = (code: string) => {
        setSpendingCategories(prev => {
            const newCategories = prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code];
            updateControls({ allowedSpendingCategories: newCategories });
            return newCategories;
        });
    };

    const handleRecurringTxnLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = +e.target.value;
        setRecurringTxnLimit(value);
        updateControls({ recurringTransactionLimit: value });
    };

    return (
        <div className="space-y-6">
            <h4 className="font-semibold text-cyan-300 mb-4">Core Controls</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col"><span className="text-sm text-gray-300 mb-1">Monthly Limit: {formatCurrency(controls.monthlyLimit)}</span>
                    <input type="range" min="1000" max="50000" step="1000" value={controls.monthlyLimit} onChange={e => setControls(c => ({ ...c, monthlyLimit: +e.target.value }))} className="range range-xs range-cyan" /></label>
                <label className="flex items-center justify-between"><span className="text-sm text-gray-300">ATM Withdrawals</span><input type="checkbox" className="toggle toggle-cyan" checked={controls.atm} onChange={e => setControls(c => ({ ...c, atm: e.target.checked }))} /></label>
                <label className="flex items-center justify-between"><span className="text-sm text-gray-300">Online Purchases</span><input type="checkbox" className="toggle toggle-cyan" checked={controls.online} onChange={e => setControls(c => ({ ...c, online: e.target.checked }))} /></label>
                <label className="flex items-center justify-between"><span className="text-sm text-gray-300">Contactless Payments</span><input type="checkbox" className="toggle toggle-cyan" checked={controls.contactless} onChange={e => setControls(c => ({ ...c, contactless: e.target.checked }))} /></label>
                <label className="flex items-center justify-between"><span className="text-sm text-gray-300">International Transactions</span><input type="checkbox" className="toggle toggle-cyan" checked={controls.international || false} onChange={e => setControls(c => ({ ...c, international: e.target.checked }))} /></label>
                <label className="flex items-center justify-between"><span className="text-sm text-gray-300">Daily Transaction Count Limit</span>
                    <input type="number" min="0" max="50" step="1" value={controls.dailyTransactionLimit || 0} onChange={e => setControls(c => ({ ...c, dailyTransactionLimit: +e.target.value }))} className="input input-sm w-20 bg-gray-700 border-gray-600 text-white" /></label>
            </div>

            <div className="divider"></div>

            <h4 className="font-semibold text-cyan-300 mb-4">Advanced Spending Controls</h4>
            <div className="space-y-4">
                <div>
                    <label className="flex flex-col mb-2"><span className="text-sm text-gray-300">Recurring Transaction Limit: {formatCurrency(recurringTxnLimit)}</span>
                        <input type="range" min="0" max="5000" step="50" value={recurringTxnLimit} onChange={handleRecurringTxnLimitChange} className="range range-xs range-cyan" />
                        <p className="text-xs text-gray-500 mt-1">Maximum amount for a single recurring transaction (e.g., subscriptions).</p>
                    </label>
                </div>

                <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Allowed Spending Categories</h5>
                    <div className="flex flex-wrap gap-2">
                        {availableCategories.map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => handleCategoryToggle(cat.value)}
                                className={`px-3 py-1 text-xs rounded-full transition-all duration-200 ${
                                    spendingCategories.includes(cat.value)
                                        ? 'bg-cyan-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Only transactions in selected categories will be allowed.</p>
                </div>

                <label className="flex flex-col"><span className="text-sm text-gray-300 mb-1">Single Transaction Max: {formatCurrency(controls.singleTransactionLimit || 0)}</span>
                    <input type="range" min="0" max="10000" step="100" value={controls.singleTransactionLimit || 0} onChange={e => setControls(c => ({ ...c, singleTransactionLimit: +e.target.value }))} className="range range-xs range-cyan" />
                    <p className="text-xs text-gray-500 mt-1">Maximum amount for any single transaction.</p>
                </label>

                <label className="flex items-center justify-between"><span className="text-sm text-gray-300">Block Gambling Transactions</span><input type="checkbox" className="toggle toggle-cyan" checked={controls.blockGambling || false} onChange={e => setControls(c => ({ ...c, blockGambling: e.target.checked }))} /></label>
                <label className="flex items-center justify-between"><span className="text-sm text-gray-300">Block Adult Content Purchases</span><input type="checkbox" className="toggle toggle-cyan" checked={controls.blockAdultContent || false} onChange={e => setControls(c => ({ ...c, blockAdultContent: e.target.checked }))} /></label>
            </div>
        </div>
    );
};

interface CardTransactionsTabProps {
    transactions: Transaction[];
}

const CardTransactionsTab: React.FC<CardTransactionsTabProps> = ({ transactions }) => {
    const columns = useMemo(() => [
        { header: 'Date', accessor: (tx: Transaction) => formatDate(new Date(tx.date), { year: 'numeric', month: 'short', day: 'numeric' }) },
        { header: 'Description', accessor: 'description' },
        { header: 'Merchant', accessor: 'merchant' },
        { header: 'Category', accessor: 'category' },
        { header: 'Amount', accessor: (tx: Transaction) => formatCurrency(tx.amount) },
        { header: 'Status', accessor: 'status' },
    ], []);

    const searchableKeys: (keyof Transaction)[] = ['description', 'merchant', 'category', 'status'];
    const filterOptions = {
        status: {
            label: 'Status',
            options: [
                { value: 'Completed', label: 'Completed' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Declined', label: 'Declined' },
            ]
        },
        category: {
            label: 'Category',
            options: Array.from(new Set(transactions.map(tx => tx.category))).map(cat => ({ value: cat, label: cat }))
        }
    };

    return (
        <div>
            <h4 className="font-semibold text-cyan-300 mb-4">All Transactions</h4>
            <PaginatedTable
                data={transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
                columns={columns}
                itemsPerPage={7}
                rowKeyExtractor={(tx) => tx.id}
                searchableKeys={searchableKeys}
                filterOptions={filterOptions}
                emptyMessage="No transactions found for this card."
            />
        </div>
    );
};

interface CardSpendingAnalysisTabProps {
    transactions: Transaction[];
    limit: number;
}

const COLORS = ['#06b6d4', '#67e8f9', '#22d3ee', '#0891b2', '#0e7490', '#155e75', '#0f766e', '#14b8a6', '#2dd4bf'];

const CardSpendingAnalysisTab: React.FC<CardSpendingAnalysisTabProps> = ({ transactions, limit }) => {
    const spendingByCategory = useMemo(() => {
        const categories: { [key: string]: number } = {};
        transactions.forEach(tx => {
            categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
        });
        return Object.entries(categories).map(([name, value]) => ({ name, value }));
    }, [transactions]);

    const monthlySpendingTrend = useMemo(() => {
        const monthlyData: { [key: string]: number } = {};
        transactions.forEach(tx => {
            const date = new Date(tx.date);
            const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
            monthlyData[monthYear] = (monthlyData[monthYear] || 0) + tx.amount;
        });

        // Sort by month/year for charting
        return Object.entries(monthlyData)
            .map(([monthYear, spent]) => {
                const [year, month] = monthYear.split('-').map(Number);
                return { date: new Date(year, month - 1), spent };
            })
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map(item => ({ name: formatDate(item.date, { month: 'short', year: 'numeric' }), spent: item.spent }));
    }, [transactions]);

    const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const utilization = calculateBudgetUtilization(totalSpent, limit);

    return (
        <div className="space-y-8">
            <h4 className="font-semibold text-cyan-300 mb-4">Spending Overview</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="text-center">
                    <p className="text-gray-300 text-sm">Total Spent</p>
                    <p className="text-white text-3xl font-bold mt-2">{formatCurrency(totalSpent)}</p>
                </Card>
                <Card className="text-center">
                    <p className="text-gray-300 text-sm">Monthly Limit</p>
                    <p className="text-white text-3xl font-bold mt-2">{formatCurrency(limit)}</p>
                </Card>
                <Card className="text-center">
                    <p className="text-gray-300 text-sm">Utilization</p>
                    <p className={`text-3xl font-bold mt-2 ${utilization > 80 ? 'text-red-400' : utilization > 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {utilization.toFixed(2)}%
                    </p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Spending by Category" className="flex flex-col items-center">
                    {spendingByCategory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={spendingByCategory}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    label
                                >
                                    {spendingByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-gray-400 text-center py-4">No spending data to categorize.</div>
                    )}
                </Card>

                <Card title="Monthly Spending Trend">
                    {monthlySpendingTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={monthlySpendingTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                                <YAxis stroke="#9ca3af" tickFormatter={(value) => formatCurrency(value, 'USD', 'en-US')} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(value: number) => formatCurrency(value, 'USD', 'en-US')} />
                                <Area type="monotone" dataKey="spent" stroke="#06b6d4" fillOpacity={1} fill="url(#colorSpending)" />
                                <defs>
                                    <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-gray-400 text-center py-4">Not enough historical data for trend analysis.</div>
                    )}
                </Card>
            </div>
        </div>
    );
};

interface CardSecurityTabProps {
    cardId: string;
    onUpdateSecurity: (cardId: string, updates: { cvvLock?: boolean; pinBlock?: boolean; threeDSecureEnabled?: boolean; tokenizationStatus?: 'enabled' | 'disabled' }) => void;
}

const CardSecurityTab: React.FC<CardSecurityTabProps> = ({ cardId, onUpdateSecurity }) => {
    // In a real app, these would come from card state. Using local state for mock UI.
    const [cvvLock, setCvvLock] = useState(Math.random() > 0.5);
    const [pinBlock, setPinBlock] = useState(Math.random() > 0.5);
    const [threeDSecureEnabled, setThreeDSecureEnabled] = useState(Math.random() > 0.5);
    const [tokenizationStatus, setTokenizationStatus] = useState<'enabled' | 'disabled'>(Math.random() > 0.5 ? 'enabled' : 'disabled');
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveSecuritySettings = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        onUpdateSecurity(cardId, { cvvLock, pinBlock, threeDSecureEnabled, tokenizationStatus });
        setIsSaving(false);
        alert('Security settings updated!');
    };

    return (
        <div className="space-y-6">
            <h4 className="font-semibold text-cyan-300 mb-4">Security Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                    <span className="text-sm text-gray-300">CVV Lock (Online)</span>
                    <input type="checkbox" className="toggle toggle-cyan" checked={cvvLock} onChange={e => setCvvLock(e.target.checked)} />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                    <span className="text-sm text-gray-300">PIN Block (ATM/POS)</span>
                    <input type="checkbox" className="toggle toggle-cyan" checked={pinBlock} onChange={e => setPinBlock(e.target.checked)} />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                    <span className="text-sm text-gray-300">3D Secure for Online</span>
                    <input type="checkbox" className="toggle toggle-cyan" checked={threeDSecureEnabled} onChange={e => setThreeDSecureEnabled(e.target.checked)} />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                    <span className="text-sm text-gray-300">Card Tokenization</span>
                    <select
                        className="select select-sm bg-gray-800 border-gray-600 text-white"
                        value={tokenizationStatus}
                        onChange={e => setTokenizationStatus(e.target.value as 'enabled' | 'disabled')}
                    >
                        <option value="enabled">Enabled</option>
                        <option value="disabled">Disabled</option>
                    </select>
                </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
                CVV Lock prevents transactions without a valid CVV. PIN Block prevents transactions requiring a PIN.
                3D Secure adds an extra layer of authentication for online purchases. Card Tokenization replaces sensitive card data with a unique identifier.
            </p>

            <div className="divider"></div>

            <h4 className="font-semibold text-cyan-300 mb-4">Risk Management</h4>
            <div className="space-y-4">
                <label className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                    <span className="text-sm text-gray-300">Geolocation Restrictions</span>
                    <button className="btn btn-sm btn-outline btn-info">Configure Regions</button>
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                    <span className="text-sm text-gray-300">Fraud Monitoring Level</span>
                    <select className="select select-sm bg-gray-800 border-gray-600 text-white">
                        <option>Standard</option>
                        <option>Enhanced</option>
                        <option>Aggressive</option>
                    </select>
                </label>
            </div>
            <button
                onClick={handleSaveSecuritySettings}
                className={`mt-6 w-full py-2 rounded transition-colors duration-200 ${isSaving ? 'bg-cyan-700/50 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700'}`}
                disabled={isSaving}
            >
                {isSaving ? 'Saving...' : 'Save Security Settings'}
            </button>
        </div>
    );
};

interface CardDetailsOverviewTabProps {
    card: CorporateCard;
}

const CardDetailsOverviewTab: React.FC<CardDetailsOverviewTabProps> = ({ card }) => {
    const cardholder = MOCK_CARDHOLDERS.find(h => h.id === card.id); // Assuming card ID maps to holder ID for simplicity
    return (
        <div className="space-y-6">
            <h4 className="font-semibold text-cyan-300 mb-4">Card Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-700 rounded-md">
                    <p className="text-xs text-gray-400">Card Holder</p>
                    <p className="text-white text-sm font-medium">{card.holderName}</p>
                </div>
                <div className="p-3 bg-gray-700 rounded-md">
                    <p className="text-xs text-gray-400">Card Number (Masked)</p>
                    <p className="text-white text-sm font-mono">**** **** **** {card.cardNumberMask}</p>
                </div>
                <div className="p-3 bg-gray-700 rounded-md">
                    <p className="text-xs text-gray-400">Current Balance</p>
                    <p className="text-white text-sm font-medium">{formatCurrency(card.balance)}</p>
                </div>
                <div className="p-3 bg-gray-700 rounded-md">
                    <p className="text-xs text-gray-400">Total Limit</p>
                    <p className="text-white text-sm font-medium">{formatCurrency(card.limit)}</p>
                </div>
                <div className="p-3 bg-gray-700 rounded-md">
                    <p className="text-xs text-gray-400">Status</p>
                    <p className={`text-sm font-medium ${card.status === 'Active' ? 'text-green-300' : card.status === 'Frozen' ? 'text-blue-300' : 'text-yellow-300'}`}>{card.status}</p>
                </div>
                <div className="p-3 bg-gray-700 rounded-md">
                    <p className="text-xs text-gray-400">Card Type</p>
                    <p className="text-white text-sm font-medium">{card.type || 'Physical'}</p>
                </div>
                <div className="p-3 bg-gray-700 rounded-md">
                    <p className="text-xs text-gray-400">Issue Date</p>
                    <p className="text-white text-sm font-medium">{formatDate(new Date(card.issueDate || '2023-01-01'), { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
                <div className="p-3 bg-gray-700 rounded-md">
                    <p className="text-xs text-gray-400">Expiration Date</p>
                    <p className="text-white text-sm font-medium">{formatDate(new Date(card.expirationDate || '2025-12-31'), { year: 'numeric', month: 'short' })}</p>
                </div>
                <div className="p-3 bg-gray-700 rounded-md col-span-1 md:col-span-2">
                    <p className="text-xs text-gray-400">Associated Department/Project</p>
                    <p className="text-white text-sm font-medium">{card.associatedProject || 'Not Assigned'}</p>
                </div>
            </div>

            <div className="divider"></div>

            <h4 className="font-semibold text-cyan-300 mb-4">Cardholder Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-700 rounded-md">
                    <p className="text-xs text-gray-400">Cardholder Email</p>
                    <p className="text-white text-sm">{cardholder?.email || 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-700 rounded-md">
                    <p className="text-xs text-gray-400">Cardholder Role</p>
                    <p className="text-white text-sm">{cardholder?.role || 'N/A'}</p>
                </div>
            </div>

            <div className="divider"></div>

            <h4 className="font-semibold text-cyan-300 mb-4">Card Actions</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="btn btn-warning btn-outline">Replace Card</button>
                <button className="btn btn-error btn-outline">Report Lost/Stolen</button>
                <button className="btn btn-secondary btn-outline">Close Card Account</button>
            </div>
        </div>
    );
};


interface CardLimitAllocationTabProps {
    card: CorporateCard;
    onUpdateLimit: (cardId: string, newLimit: number) => void;
    budgets: Budget[]; // From AdvancedCardContext
    onLinkToBudget: (cardId: string, budgetId: string) => void;
    onUnlinkFromBudget: (cardId: string, budgetId: string) => void;
    onUpdateBudgetAllocation: (budgetId: string, cardId: string, amount: number) => void;
}

const CardLimitAllocationTab: React.FC<CardLimitAllocationTabProps> = ({
    card,
    onUpdateLimit,
    budgets,
    onLinkToBudget,
    onUnlinkFromBudget,
    onUpdateBudgetAllocation
}) => {
    const [newCardLimit, setNewCardLimit] = useState(card.limit);
    const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
    const [allocationAmount, setAllocationAmount] = useState<number>(0);
    const [isSavingLimit, setIsSavingLimit] = useState(false);
    const [isAllocatingBudget, setIsAllocatingBudget] = useState(false);

    useEffect(() => {
        setNewCardLimit(card.limit);
    }, [card.limit]);

    const handleUpdateCardLimit = async () => {
        setIsSavingLimit(true);
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
        onUpdateLimit(card.id, newCardLimit);
        setIsSavingLimit(false);
    };

    const availableBudgets = useMemo(() => {
        // Filter out budgets already linked to this card
        return budgets.filter(b => !b.cardsLinked.includes(card.id));
    }, [budgets, card.id]);

    const linkedBudgets = useMemo(() => {
        return budgets.filter(b => b.cardsLinked.includes(card.id));
    }, [budgets, card.id]);

    const handleLinkBudget = async () => {
        if (!selectedBudgetId) return;
        setIsAllocatingBudget(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        onLinkToBudget(card.id, selectedBudgetId);
        setSelectedBudgetId('');
        setIsAllocatingBudget(false);
    };

    const handleUnlinkBudget = async (budgetId: string) => {
        setIsAllocatingBudget(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        onUnlinkFromBudget(card.id, budgetId);
        setIsAllocatingBudget(false);
    };

    const handleUpdateBudgetAllocation = async (budgetId: string) => {
        setIsAllocatingBudget(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        onUpdateBudgetAllocation(budgetId, card.id, allocationAmount);
        setIsAllocatingBudget(false);
    };

    return (
        <div className="space-y-8">
            <h4 className="font-semibold text-cyan-300 mb-4">Card Limit Adjustment</h4>
            <div className="bg-gray-700 p-4 rounded-md space-y-4">
                <label className="flex flex-col">
                    <span className="text-sm text-gray-300 mb-1">Current Limit: {formatCurrency(card.limit)}</span>
                    <span className="text-sm text-gray-300 mb-1">New Limit: {formatCurrency(newCardLimit)}</span>
                    <input
                        type="range"
                        min="1000"
                        max="100000"
                        step="1000"
                        value={newCardLimit}
                        onChange={e => setNewCardLimit(+e.target.value)}
                        className="range range-xs range-cyan"
                    />
                </label>
                <button
                    onClick={handleUpdateCardLimit}
                    className={`w-full py-2 rounded transition-colors duration-200 ${isSavingLimit ? 'bg-cyan-700/50 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700'}`}
                    disabled={isSavingLimit}
                >
                    {isSavingLimit ? 'Updating Limit...' : 'Update Card Limit'}
                </button>
            </div>

            <div className="divider"></div>

            <h4 className="font-semibold text-cyan-300 mb-4">Budget Linkage</h4>
            <div className="bg-gray-700 p-4 rounded-md space-y-4">
                <p className="text-sm text-gray-300 mb-2">Link this card to an existing budget for tracking and enforcement.</p>
                <div className="flex flex-col md:flex-row gap-2">
                    <select
                        className="select select-bordered flex-grow bg-gray-800 border-gray-600 text-white"
                        value={selectedBudgetId}
                        onChange={e => setSelectedBudgetId(e.target.value)}
                        disabled={isAllocatingBudget}
                    >
                        <option value="">Select a Budget to Link</option>
                        {availableBudgets.map(budget => (
                            <option key={budget.id} value={budget.id}>
                                {budget.name} ({formatCurrency(budget.totalAmount)} remaining)
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleLinkBudget}
                        className={`btn btn-primary ${isAllocatingBudget ? 'btn-disabled' : ''}`}
                        disabled={!selectedBudgetId || isAllocatingBudget}
                    >
                        {isAllocatingBudget ? 'Linking...' : 'Link Budget'}
                    </button>
                </div>

                {linkedBudgets.length > 0 && (
                    <div className="mt-6">
                        <h5 className="text-md font-medium text-gray-300 mb-2">Linked Budgets:</h5>
                        <ul className="space-y-3">
                            {linkedBudgets.map(budget => (
                                <li key={budget.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 bg-gray-800 rounded-md border border-gray-600">
                                    <div>
                                        <p className="font-medium text-white">{budget.name}</p>
                                        <p className="text-xs text-gray-400">
                                            Period: {capitalizeFirstLetter(budget.period)} | Total: {formatCurrency(budget.totalAmount)} | Spent: {formatCurrency(budget.spentAmount)}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 mt-2 md:mt-0">
                                        <input
                                            type="number"
                                            placeholder="Allocate amount"
                                            className="input input-sm w-32 bg-gray-700 border-gray-600 text-white"
                                            value={allocationAmount}
                                            onChange={e => setAllocationAmount(+e.target.value)}
                                            disabled={isAllocatingBudget}
                                        />
                                        <button
                                            onClick={() => handleUpdateBudgetAllocation(budget.id)}
                                            className={`btn btn-sm btn-info ${isAllocatingBudget ? 'btn-disabled' : ''}`}
                                            disabled={isAllocatingBudget || allocationAmount <= 0}
                                        >
                                            Allocate
                                        </button>
                                        <button
                                            onClick={() => handleUnlinkBudget(budget.id)}
                                            className={`btn btn-sm btn-error btn-outline ${isAllocatingBudget ? 'btn-disabled' : ''}`}
                                            disabled={isAllocatingBudget}
                                        >
                                            Unlink
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

interface CardCompliancePolicyTabProps {
    cardId: string;
    policyRules: PolicyRule[];
}

const CardCompliancePolicyTab: React.FC<CardCompliancePolicyTabProps> = ({ cardId, policyRules }) => {
    // Filter policies relevant to this card, or all_cards policies
    const relevantPolicies = useMemo(() => {
        return policyRules.filter(p =>
            p.isActive && (p.appliesTo === 'all_cards' || (p.targetIds && p.targetIds.includes(cardId)))
        );
    }, [cardId, policyRules]);

    const columns = useMemo(() => [
        { header: 'Rule Name', accessor: 'name' },
        { header: 'Description', accessor: 'description' },
        { header: 'Type', accessor: (p: PolicyRule) => capitalizeFirstLetter(p.type.replace(/_/g, ' ')) },
        { header: 'Status', accessor: (p: PolicyRule) => (
            <span className={`badge ${p.isActive ? 'badge-success' : 'badge-warning'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
        ) },
    ], []);

    return (
        <div className="space-y-6">
            <h4 className="font-semibold text-cyan-300 mb-4">Applied Spending Policies</h4>
            <p className="text-sm text-gray-300">
                Below are the spending policies currently applied to this card, either globally or specifically targeting this card/cardholder.
            </p>
            {relevantPolicies.length > 0 ? (
                <PaginatedTable
                    data={relevantPolicies}
                    columns={columns}
                    itemsPerPage={5}
                    rowKeyExtractor={(item) => item.id}
                    emptyMessage="No specific policies apply to this card currently."
                />
            ) : (
                <div className="text-gray-400 text-center py-4 bg-gray-700 rounded-md">
                    No custom policies found for this card. Global policies may still apply.
                </div>
            )}

            <div className="divider"></div>

            <h4 className="font-semibold text-cyan-300 mb-4">Policy Adherence History (Mock)</h4>
            <div className="bg-gray-700 p-4 rounded-md text-gray-400">
                <p>This section would display a history of compliance checks, showing if any transactions violated a policy and the details of that violation.</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li><span className="text-green-400">Aug 15, 2024:</span> All transactions adhered to monthly limit policy.</li>
                    <li><span className="text-yellow-400">Jul 20, 2024:</span> <span className="text-red-400">Warning:</span> Transaction for {formatCurrency(550)} at "Online Casino" flagged by 'Gambling Block' policy. Transaction declined.</li>
                    <li><span className="text-green-400">Jun 01, 2024:</span> Policy 'International Transaction Block' successfully enforced.</li>
                </ul>
                <p className="text-xs italic mt-3">Detailed policy violation reports can be generated in the Compliance Reports section.</p>
            </div>
        </div>
    );
};


// --- END: EXPANDED CardDetailModal SUB-COMPONENTS ---

const CardDetailModal: React.FC = () => {
    const context = useContext(DataContext);
    const advancedContext = useContext(AdvancedCardContext);

    if (!context || !advancedContext) throw new Error("CardDetailModal must be within a DataProvider and AdvancedCardProvider");

    const { corporateCards, updateCorporateCardControls } = context;
    const { data: advancedData, actions: advancedActions } = advancedContext;

    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [localCardControls, setLocalCardControls] = useState<CorporateCardControls | null>(null);

    // Get the currently selected card from the context's corporateCards list
    const selectedCard = useMemo(() => {
        return corporateCards.find(card => card.id === selectedCardId) || null;
    }, [selectedCardId, corporateCards]);

    // Initialize local controls when a card is selected or its controls change in context
    useEffect(() => {
        if (selectedCard) {
            setLocalCardControls(deepClone(selectedCard.controls));
        } else {
            setLocalCardControls(null);
        }
    }, [selectedCard]);

    const handleSaveControls = () => {
        if (selectedCard && localCardControls) {
            updateCorporateCardControls(selectedCard.id, localCardControls);
            // Optionally close modal or give feedback
            alert('Card controls updated successfully!');
            // Log this action
            advancedActions.addAuditLog({
                actorId: 'current_user_id', // Placeholder
                action: 'UPDATE_CARD_CONTROLS',
                targetType: 'card',
                targetId: selectedCard.id,
                description: `Updated controls for card ${selectedCard.cardNumberMask}.`
            });
        }
    };

    const handleUpdateCardLimit = useCallback((cardId: string, newLimit: number) => {
        // This is a direct update to the card's limit, usually done through `updateCorporateCardControls`
        if (selectedCard && selectedCard.id === cardId) {
            setLocalCardControls(prev => (prev ? { ...prev, monthlyLimit: newLimit } : null));
            updateCorporateCardControls(cardId, { ...selectedCard.controls, monthlyLimit: newLimit });
            advancedActions.addAuditLog({
                actorId: 'current_user_id',
                action: 'UPDATE_CARD_LIMIT',
                targetType: 'card',
                targetId: cardId,
                description: `Updated limit for card ${selectedCard.cardNumberMask} to ${formatCurrency(newLimit)}.`
            });
        }
    }, [selectedCard, updateCorporateCardControls, advancedActions]);

    const handleUpdateCardSecurity = useCallback((cardId: string, updates: { cvvLock?: boolean; pinBlock?: boolean; threeDSecureEnabled?: boolean; tokenizationStatus?: 'enabled' | 'disabled' }) => {
        // This would interact with the backend to update security settings
        console.log(`Updating security for card ${cardId}:`, updates);
        alert(`Security settings for card ${cardId} updated! (Mock)`);
        advancedActions.addAuditLog({
            actorId: 'current_user_id',
            action: 'UPDATE_CARD_SECURITY',
            targetType: 'card',
            targetId: cardId,
            description: `Updated security settings for card ${selectedCard?.cardNumberMask}.`
        });
    }, [advancedActions, selectedCard]);

    const handleLinkToBudget = useCallback((cardId: string, budgetId: string) => {
        advancedActions.updateBudget(budgetId, { cardsLinked: [...(advancedData.budgets.find(b => b.id === budgetId)?.cardsLinked || []), cardId] });
        alert(`Card ${cardId} linked to budget ${budgetId}. (Mock)`);
    }, [advancedActions, advancedData.budgets]);

    const handleUnlinkFromBudget = useCallback((cardId: string, budgetId: string) => {
        advancedActions.updateBudget(budgetId, { cardsLinked: (advancedData.budgets.find(b => b.id === budgetId)?.cardsLinked || []).filter(id => id !== cardId) });
        alert(`Card ${cardId} unlinked from budget ${budgetId}. (Mock)`);
    }, [advancedActions, advancedData.budgets]);

    const handleUpdateBudgetAllocation = useCallback((budgetId: string, cardId: string, amount: number) => {
        // This would involve a more complex logic, potentially updating specific allocation within a budget for a card
        // For now, we'll just log it.
        console.log(`Allocating ${formatCurrency(amount)} from budget ${budgetId} to card ${cardId}.`);
        alert(`Budget allocation updated for card ${cardId} from budget ${budgetId}. (Mock)`);
        advancedActions.addAuditLog({
            actorId: 'current_user_id',
            action: 'UPDATE_BUDGET_ALLOCATION',
            targetType: 'card',
            targetId: cardId,
            description: `Allocated ${formatCurrency(amount)} from budget ${budgetId} to card ${selectedCard?.cardNumberMask}.`
        });
    }, [advancedActions, selectedCard]);

    // Use a local state for modal visibility and the ID of the card being managed
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = useCallback((card: CorporateCard) => {
        setSelectedCardId(card.id);
        setIsModalOpen(true);
    }, []);
    const closeModal = useCallback(() => {
        setSelectedCardId(null);
        setIsModalOpen(false);
    }, []);

    // Provide the openModal function to the parent component
    const contextValue = useMemo(() => ({ openCardDetailModal: openModal }), [openModal]);
    // In a real app, this would be part of a larger UI context or prop drilling.
    // For this exercise, we can extend the DataContext implicitly or make a new context.
    // For now, I'll assume the CardManagementView can directly call `openModal`.

    if (!isModalOpen || !selectedCard || !localCardControls) return null;

    const tabs = [
        { label: 'Controls', key: 'controls', content: (
            <CardControlsTab
                selectedCard={selectedCard}
                controls={localCardControls}
                setControls={setLocalCardControls}
                updateControls={(updates) => setLocalCardControls(prev => prev ? { ...prev, ...updates } : null)}
                merchantCategories={advancedData.merchantCategories}
            />
        ) },
        { label: 'Transactions', key: 'transactions', content: <CardTransactionsTab transactions={selectedCard.transactions} /> },
        { label: 'Spending Analysis', key: 'spending_analysis', content: <CardSpendingAnalysisTab transactions={selectedCard.transactions} limit={selectedCard.limit} /> },
        { label: 'Security', key: 'security', content: <CardSecurityTab cardId={selectedCard.id} onUpdateSecurity={handleUpdateCardSecurity} /> },
        { label: 'Details', key: 'details', content: <CardDetailsOverviewTab card={selectedCard} /> },
        { label: 'Limits & Budgets', key: 'limits_budgets', content: (
            <CardLimitAllocationTab
                card={selectedCard}
                onUpdateLimit={handleUpdateCardLimit}
                budgets={advancedData.budgets}
                onLinkToBudget={handleLinkToBudget}
                onUnlinkFromBudget={handleUnlinkFromBudget}
                onUpdateBudgetAllocation={handleUpdateBudgetAllocation}
            />
        ) },
        { label: 'Compliance & Policies', key: 'compliance_policies', content: <CardCompliancePolicyTab cardId={selectedCard.id} policyRules={advancedData.policyRules} /> },
    ];

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={closeModal}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full border border-gray-700 h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">Manage Card: {selectedCard.holderName} (...{selectedCard.cardNumberMask})</h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-white">✕</button>
                </div>
                <div className="flex-grow overflow-hidden flex flex-col">
                    <TabbedContent
                        tabs={tabs}
                        containerClassName="flex-grow flex flex-col"
                        headerClassName="flex border-b border-gray-700 p-2 overflow-x-auto flex-shrink-0"
                        contentClassName="p-6 overflow-y-auto flex-grow"
                    />
                </div>
                <div className="p-4 border-t border-gray-700 flex justify-end">
                    <button onClick={handleSaveControls} className="btn btn-cyan">Save All Changes</button>
                </div>
            </div>
        </div>
    );
};

// --- START: NEW EXPORTED COMPONENTS (MAIN DASHBOARD SECTIONS) ---

export const CardRequestPanel: React.FC = () => {
    const advancedContext = useContext(AdvancedCardContext);
    const dataContext = useContext(DataContext);
    if (!advancedContext || !dataContext) throw new Error("CardRequestPanel must be within AdvancedCardProvider and DataProvider");

    const { data: advancedData, actions: advancedActions } = advancedContext;
    const { corporateCards } = dataContext;

    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const initialRequestFormState: Omit<CardRequest, 'id' | 'status' | 'requestedDate' | 'requestorId'> = {
        requestType: 'new_card',
        details: {
            reason: '',
            cardHolderName: '',
            cardType: 'physical',
            limit: 5000,
            currency: 'USD',
        }
    };

    const {
        values,
        setValues,
        errors,
        handleChange,
        handleSubmit,
        isSubmitting
    } = useFormValidation(initialRequestFormState, (vals) => {
        const newErrors: FormValidationState = {};
        if (!vals.details.reason) newErrors.reason = 'Reason is required.';
        if (vals.requestType === 'new_card' && !vals.details.cardHolderName) newErrors.cardHolderName = 'Cardholder name is required.';
        if (vals.requestType === 'new_card' && !vals.details.limit) newErrors.limit = 'Limit is required.';
        return newErrors;
    });

    const onSubmitNewRequest = async (formValues: typeof initialRequestFormState) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Using a mock requestorId for now
        advancedActions.createCardRequest({ ...formValues, requestorId: MOCK_CARDHOLDERS[0].id });
        setIsLoading(false);
        setIsRequestModalOpen(false);
        setValues(initialRequestFormState); // Reset form
        alert('Card request submitted successfully!');
    };

    const handleApproveReject = async (requestId: string, status: 'approved' | 'rejected') => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        // Mock approver ID
        advancedActions.updateCardRequestStatus(requestId, status, MOCK_CARDHOLDERS.find(u => u.role === 'Finance Manager')?.id || 'admin-id');
        setIsLoading(false);
        alert(`Request ${requestId} ${status}!`);
    };

    const requestColumns = useMemo(() => [
        { header: 'Request ID', accessor: 'id', className: 'font-mono' },
        { header: 'Type', accessor: (req: CardRequest) => capitalizeFirstLetter(req.requestType.replace(/_/g, ' ')) },
        { header: 'Requested By', accessor: (req: CardRequest) => MOCK_CARDHOLDERS.find(h => h.id === req.requestorId)?.name || req.requestorId },
        { header: 'Details', accessor: (req: CardRequest) => req.details.cardHolderName || req.details.existingCardId || 'N/A' },
        { header: 'Amount/Limit', accessor: (req: CardRequest) => req.details.limit ? formatCurrency(req.details.limit) : 'N/A' },
        { header: 'Date', accessor: (req: CardRequest) => formatDate(req.requestedDate, { year: 'numeric', month: 'short', day: 'numeric' }) },
        { header: 'Status', accessor: (req: CardRequest) => (
            <span className={`badge ${
                req.status === 'pending' ? 'badge-info' :
                req.status === 'approved' ? 'badge-success' :
                req.status === 'rejected' ? 'badge-error' : 'badge-neutral'
            }`}>
                {capitalizeFirstLetter(req.status)}
            </span>
        )},
    ], []);

    const filterOptions = {
        requestType: {
            label: 'Request Type',
            options: [
                { value: 'new_card', label: 'New Card' },
                { value: 'limit_increase', label: 'Limit Increase' },
                { value: 'freeze_unfreeze', label: 'Freeze/Unfreeze' },
                { value: 'card_replacement', label: 'Card Replacement' },
                { value: 'close_card', label: 'Close Card' },
            ]
        },
        status: {
            label: 'Status',
            options: [
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'completed', label: 'Completed' },
            ]
        },
    };

    return (
        <Card title="Card Requests & Approvals">
            <div className="flex justify-end mb-6">
                <button onClick={() => setIsRequestModalOpen(true)} className="btn btn-cyan">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    New Card Request
                </button>
            </div>

            <PaginatedTable
                title="All Card Requests"
                data={advancedData.cardRequests.sort((a,b) => b.requestedDate.getTime() - a.requestedDate.getTime())}
                columns={requestColumns}
                rowKeyExtractor={(req) => req.id}
                searchableKeys={['id', 'requestType', 'details.cardHolderName', 'details.reason']}
                filterOptions={filterOptions}
                emptyMessage="No card requests found."
                actions={(item) => (
                    item.status === 'pending' && (
                        <div className="flex gap-2">
                            <button onClick={() => handleApproveReject(item.id, 'approved')} className="btn btn-xs btn-success" disabled={isLoading}>Approve</button>
                            <button onClick={() => handleApproveReject(item.id, 'rejected')} className="btn btn-xs btn-error" disabled={isLoading}>Reject</button>
                        </div>
                    )
                )}
            />

            {isRequestModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setIsRequestModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-xl w-full border border-gray-700 p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold text-white mb-4">Submit New Card Request</h3>
                        <form onSubmit={handleSubmit(onSubmitNewRequest)} className="space-y-4">
                            <label className="form-control">
                                <span className="label-text text-gray-300">Request Type</span>
                                <select name="requestType" value={values.requestType} onChange={handleChange} className="select select-bordered bg-gray-700 text-white border-gray-600">
                                    <option value="new_card">New Card</option>
                                    <option value="limit_increase">Limit Increase</option>
                                    <option value="freeze_unfreeze">Freeze/Unfreeze</option>
                                    <option value="card_replacement">Card Replacement</option>
                                    <option value="close_card">Close Card</option>
                                </select>
                            </label>

                            {values.requestType === 'new_card' && (
                                <>
                                    <label className="form-control">
                                        <span className="label-text text-gray-300">Card Holder Name</span>
                                        <input type="text" name="details.cardHolderName" value={values.details.cardHolderName} onChange={e => setValues(prev => ({ ...prev, details: { ...prev.details, cardHolderName: e.target.value } }))} placeholder="John Doe" className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                        {errors.cardHolderName && <p className="text-error text-sm mt-1">{errors.cardHolderName}</p>}
                                    </label>
                                    <label className="form-control">
                                        <span className="label-text text-gray-300">Card Type</span>
                                        <select name="details.cardType" value={values.details.cardType} onChange={e => setValues(prev => ({ ...prev, details: { ...prev.details, cardType: e.target.value as 'physical' | 'virtual' } }))} className="select select-bordered bg-gray-700 text-white border-gray-600">
                                            <option value="physical">Physical Card</option>
                                            <option value="virtual">Virtual Card</option>
                                        </select>
                                    </label>
                                    <label className="form-control">
                                        <span className="label-text text-gray-300">Requested Limit ({formatCurrency(values.details.limit || 0)})</span>
                                        <input type="range" min="100" max="20000" step="100" name="details.limit" value={values.details.limit} onChange={e => setValues(prev => ({ ...prev, details: { ...prev.details, limit: +e.target.value } }))} className="range range-cyan range-xs" />
                                        {errors.limit && <p className="text-error text-sm mt-1">{errors.limit}</p>}
                                    </label>
                                </>
                            )}

                            {values.requestType !== 'new_card' && (
                                <label className="form-control">
                                    <span className="label-text text-gray-300">Select Existing Card</span>
                                    <select name="details.existingCardId" value={values.details.existingCardId} onChange={e => setValues(prev => ({ ...prev, details: { ...prev.details, existingCardId: e.target.value } }))} className="select select-bordered bg-gray-700 text-white border-gray-600">
                                        <option value="">Select a card</option>
                                        {corporateCards.map(card => (
                                            <option key={card.id} value={card.id}>{card.holderName} (...{card.cardNumberMask})</option>
                                        ))}
                                    </select>
                                </label>
                            )}

                            {values.requestType === 'limit_increase' && (
                                <label className="form-control">
                                    <span className="label-text text-gray-300">New Requested Limit ({formatCurrency(values.details.limit || 0)})</span>
                                    <input type="range" min="100" max="20000" step="100" name="details.limit" value={values.details.limit} onChange={e => setValues(prev => ({ ...prev, details: { ...prev.details, limit: +e.target.value } }))} className="range range-cyan range-xs" />
                                </label>
                            )}


                            <label className="form-control">
                                <span className="label-text text-gray-300">Reason for Request</span>
                                <textarea name="details.reason" value={values.details.reason} onChange={e => setValues(prev => ({ ...prev, details: { ...prev.details, reason: e.target.value } }))} placeholder="Provide a detailed reason..." className="textarea textarea-bordered bg-gray-700 text-white border-gray-600"></textarea>
                                {errors.reason && <p className="text-error text-sm mt-1">{errors.reason}</p>}
                            </label>

                            <div className="modal-action">
                                <button type="button" className="btn btn-ghost" onClick={() => setIsRequestModalOpen(false)} disabled={isSubmitting || isLoading}>Cancel</button>
                                <button type="submit" className="btn btn-cyan" disabled={isSubmitting || isLoading}>
                                    {(isSubmitting || isLoading) && <span className="loading loading-spinner"></span>}
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Card>
    );
};

export const SpendingAnalyticsPanel: React.FC = () => {
    const advancedContext = useContext(AdvancedCardContext);
    const dataContext = useContext(DataContext);
    if (!advancedContext || !dataContext) throw new Error("SpendingAnalyticsPanel must be within AdvancedCardProvider and DataProvider");

    const { corporateCards } = dataContext;
    const { data: advancedData, actions: advancedActions } = advancedContext;

    const allTransactions = useMemo(() => corporateCards.flatMap(card => card.transactions), [corporateCards]);

    // Aggregate data for different charts
    const spendingByCategory = useMemo(() => {
        const categories: { [key: string]: number } = {};
        allTransactions.forEach(tx => {
            categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
        });
        return Object.entries(categories).map(([name, value]) => ({ name, value }));
    }, [allTransactions]);

    const spendingByCardholder = useMemo(() => {
        const cardholders: { [key: string]: number } = {};
        corporateCards.forEach(card => {
            cardholders[card.holderName] = card.transactions.reduce((sum, tx) => sum + tx.amount, 0);
        });
        return Object.entries(cardholders).map(([name, value]) => ({ name, value }));
    }, [corporateCards]);

    const monthlySpendingTrends = useMemo(() => {
        const monthlyData: { [key: string]: number } = {};
        allTransactions.forEach(tx => {
            const date = new Date(tx.date);
            const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            monthlyData[monthYear] = (monthlyData[monthYear] || 0) + tx.amount;
        });

        return Object.entries(monthlyData)
            .map(([monthYear, spent]) => {
                const [year, month] = monthYear.split('-').map(Number);
                return { date: new Date(year, month - 1), spent };
            })
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map(item => ({ name: formatDate(item.date, { month: 'short', year: 'numeric' }), spent: item.spent }));
    }, [allTransactions]);

    const spendingBreakdownByBudget = useMemo(() => {
        const budgetSpent: { [key: string]: number } = {};
        advancedData.budgets.forEach(budget => {
            budgetSpent[budget.name] = budget.spentAmount; // Using mock spent amount from budget
        });
        return Object.entries(budgetSpent).map(([name, value]) => ({ name, value }));
    }, [advancedData.budgets]);


    const [reportParams, setReportParams] = useState({
        reportType: 'Spending Overview',
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        cardId: '',
        category: '',
    });
    const [generatingReport, setGeneratingReport] = useState(false);
    const [generatedReport, setGeneratedReport] = useState<ComplianceReport | null>(null);

    const handleGenerateCustomReport = async () => {
        setGeneratingReport(true);
        setGeneratedReport(null);
        // In a real app, this would involve complex filtering and data aggregation server-side
        const report = await advancedActions.generateComplianceReport(reportParams);
        setGeneratedReport(report);
        setGeneratingReport(false);
        alert('Custom report generated!');
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider mb-6">Spending Analytics & Reports</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Spending by Category">
                    {spendingByCategory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={spendingByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {spendingByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-gray-400 text-center py-4">No spending data to categorize.</div>
                    )}
                </Card>

                <Card title="Spending by Cardholder">
                    {spendingByCardholder.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={spendingByCardholder} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                                <YAxis stroke="#9ca3af" tickFormatter={(value) => formatCurrency(value, 'USD', 'en-US')} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(value: number) => formatCurrency(value, 'USD', 'en-US')} />
                                <Bar dataKey="value" fill="#67e8f9" name="Amount Spent" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-gray-400 text-center py-4">No cardholder spending data.</div>
                    )}
                </Card>

                <Card title="Monthly Spending Trend (All Cards)">
                    {monthlySpendingTrends.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlySpendingTrends} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                                <YAxis stroke="#9ca3af" tickFormatter={(value) => formatCurrency(value, 'USD', 'en-US')} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(value: number) => formatCurrency(value, 'USD', 'en-US')} />
                                <Legend />
                                <Line type="monotone" dataKey="spent" stroke="#06b6d4" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-gray-400 text-center py-4">Not enough historical data for trend analysis.</div>
                    )}
                </Card>

                <Card title="Spending vs. Budget Allocation">
                    {spendingBreakdownByBudget.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={spendingBreakdownByBudget} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                                <YAxis stroke="#9ca3af" tickFormatter={(value) => formatCurrency(value, 'USD', 'en-US')} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(value: number) => formatCurrency(value, 'USD', 'en-US')} />
                                <Bar dataKey="value" fill="#8b5cf6" name="Budget Spent" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-gray-400 text-center py-4">No budget data available.</div>
                    )}
                </Card>
            </div>

            <Card title="Custom Report Generator">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <label className="form-control">
                            <span className="label-text text-gray-300">Report Type</span>
                            <select
                                className="select select-bordered bg-gray-700 text-white border-gray-600"
                                value={reportParams.reportType}
                                onChange={(e) => setReportParams(prev => ({ ...prev, reportType: e.target.value }))}
                            >
                                <option>Spending Overview</option>
                                <option>Transaction Details</option>
                                <option>Category Breakdown</option>
                                <option>Cardholder Performance</option>
                                <option>Policy Compliance</option>
                            </select>
                        </label>
                        <label className="form-control">
                            <span className="label-text text-gray-300">Start Date</span>
                            <input
                                type="date"
                                className="input input-bordered bg-gray-700 text-white border-gray-600"
                                value={reportParams.startDate}
                                onChange={(e) => setReportParams(prev => ({ ...prev, startDate: e.target.value }))}
                            />
                        </label>
                        <label className="form-control">
                            <span className="label-text text-gray-300">End Date</span>
                            <input
                                type="date"
                                className="input input-bordered bg-gray-700 text-white border-gray-600"
                                value={reportParams.endDate}
                                onChange={(e) => setReportParams(prev => ({ ...prev, endDate: e.target.value }))}
                            />
                        </label>
                        <label className="form-control">
                            <span className="label-text text-gray-300">Specific Card (Optional)</span>
                            <select
                                className="select select-bordered bg-gray-700 text-white border-gray-600"
                                value={reportParams.cardId}
                                onChange={(e) => setReportParams(prev => ({ ...prev, cardId: e.target.value }))}
                            >
                                <option value="">All Cards</option>
                                {corporateCards.map(card => (
                                    <option key={card.id} value={card.id}>{card.holderName} (...{card.cardNumberMask})</option>
                                ))}
                            </select>
                        </label>
                        <label className="form-control">
                            <span className="label-text text-gray-300">Category (Optional)</span>
                            <select
                                className="select select-bordered bg-gray-700 text-white border-gray-600"
                                value={reportParams.category}
                                onChange={(e) => setReportParams(prev => ({ ...prev, category: e.target.value }))}
                            >
                                <option value="">All Categories</option>
                                {Array.from(new Set(allTransactions.map(tx => tx.category))).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <div className="mt-6">
                        <button
                            onClick={handleGenerateCustomReport}
                            className={`btn btn-cyan w-full ${generatingReport ? 'btn-disabled' : ''}`}
                            disabled={generatingReport}
                        >
                            {generatingReport && <span className="loading loading-spinner"></span>}
                            Generate Report
                        </button>
                    </div>
                    {generatedReport && (
                        <div className="mt-4 p-4 bg-gray-700 rounded-md">
                            <p className="text-white">Report Generated: <span className="font-semibold">{generatedReport.name}</span></p>
                            <p className="text-gray-400 text-sm">Status: <span className="text-green-400">{capitalizeFirstLetter(generatedReport.status)}</span></p>
                            {generatedReport.downloadUrl && (
                                <a href={generatedReport.downloadUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline btn-info mt-2">
                                    Download Report
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export const PolicyEnforcementPanel: React.FC = () => {
    const advancedContext = useContext(AdvancedCardContext);
    if (!advancedContext) throw new Error("PolicyEnforcementPanel must be within AdvancedCardProvider");

    const { data: advancedData, actions: advancedActions } = advancedContext;
    const { corporateCards } = useContext(DataContext)!;

    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<PolicyRule | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const initialPolicyFormState: PolicyRule = {
        id: '',
        name: '',
        description: '',
        type: 'limit',
        isActive: true,
        priority: 1,
        configuration: {},
        appliesTo: 'all_cards',
        targetIds: [],
    };

    const {
        values,
        setValues,
        errors,
        handleChange,
        handleSubmit,
        isSubmitting
    } = useFormValidation(editingPolicy || initialPolicyFormState, (vals) => {
        const newErrors: FormValidationState = {};
        if (!vals.name) newErrors.name = 'Policy name is required.';
        if (!vals.description) newErrors.description = 'Description is required.';
        if (vals.appliesTo !== 'all_cards' && (vals.targetIds === undefined || vals.targetIds.length === 0)) newErrors.targetIds = 'Please select at least one target for this policy.';

        // Specific validation for each policy type
        if (vals.type === 'limit' && (!vals.configuration.monthlyLimit || vals.configuration.monthlyLimit <= 0)) newErrors.monthlyLimit = 'Monthly limit must be positive.';
        if (vals.type === 'category_block' && (!vals.configuration.blockedMcc || vals.configuration.blockedMcc.length === 0)) newErrors.blockedMcc = 'At least one category must be blocked.';

        return newErrors;
    });

    useEffect(() => {
        setValues(editingPolicy || initialPolicyFormState);
    }, [editingPolicy]);

    const onSubmitPolicy = async (formValues: PolicyRule) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        if (formValues.id) {
            advancedActions.updatePolicyRule(formValues.id, formValues);
        } else {
            advancedActions.addPolicyRule(formValues);
        }
        setIsLoading(false);
        setIsPolicyModalOpen(false);
        setEditingPolicy(null);
        setValues(initialPolicyFormState); // Reset form
        alert(`Policy ${formValues.id ? 'updated' : 'created'} successfully!`);
    };

    const handleEditPolicy = (policy: PolicyRule) => {
        setEditingPolicy(policy);
        setIsPolicyModalOpen(true);
    };

    const handleDeletePolicy = async (id: string) => {
        if (!confirm('Are you sure you want to delete this policy?')) return;
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        advancedActions.deletePolicyRule(id);
        setIsLoading(false);
        alert('Policy deleted.');
    };

    const policyColumns = useMemo(() => [
        { header: 'Name', accessor: 'name' },
        { header: 'Description', accessor: 'description' },
        { header: 'Type', accessor: (p: PolicyRule) => capitalizeFirstLetter(p.type.replace(/_/g, ' ')) },
        { header: 'Applies To', accessor: (p: PolicyRule) => capitalizeFirstLetter(p.appliesTo.replace(/_/g, ' ')) },
        { header: 'Status', accessor: (p: PolicyRule) => (
            <span className={`badge ${p.isActive ? 'badge-success' : 'badge-warning'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>
        )},
    ], []);

    const filterOptions = {
        type: {
            label: 'Type',
            options: [
                { value: 'limit', label: 'Limit' },
                { value: 'category_block', label: 'Category Block' },
                { value: 'time_restriction', label: 'Time Restriction' },
                { value: 'geo_restriction', label: 'Geo Restriction' },
                { value: 'transaction_approval', label: 'Transaction Approval' },
            ]
        },
        appliesTo: {
            label: 'Applies To',
            options: [
                { value: 'all_cards', label: 'All Cards' },
                { value: 'specific_cards', label: 'Specific Cards' },
                { value: 'specific_holders', label: 'Specific Holders' },
            ]
        },
        isActive: {
            label: 'Status',
            options: [
                { value: true, label: 'Active' },
                { value: false, label: 'Inactive' },
            ]
        }
    };

    return (
        <Card title="Policy Enforcement & Management">
            <div className="flex justify-end mb-6">
                <button onClick={() => { setEditingPolicy(null); setIsPolicyModalOpen(true); }} className="btn btn-cyan">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    New Policy Rule
                </button>
            </div>

            <PaginatedTable
                title="All Policy Rules"
                data={advancedData.policyRules}
                columns={policyColumns}
                rowKeyExtractor={(item) => item.id}
                searchableKeys={['name', 'description', 'type', 'appliesTo']}
                filterOptions={filterOptions}
                emptyMessage="No policy rules configured."
                actions={(item) => (
                    <div className="flex gap-2">
                        <button onClick={() => handleEditPolicy(item)} className="btn btn-xs btn-info">Edit</button>
                        <button onClick={() => handleDeletePolicy(item.id)} className="btn btn-xs btn-error">Delete</button>
                    </div>
                )}
            />

            {isPolicyModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setIsPolicyModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700 p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold text-white mb-4">{editingPolicy ? 'Edit Policy Rule' : 'Create New Policy Rule'}</h3>
                        <form onSubmit={handleSubmit(onSubmitPolicy)} className="space-y-4">
                            <label className="form-control">
                                <span className="label-text text-gray-300">Policy Name</span>
                                <input type="text" name="name" value={values.name} onChange={handleChange} placeholder="e.g., Block Weekend Spending" className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                {errors.name && <p className="text-error text-sm mt-1">{errors.name}</p>}
                            </label>
                            <label className="form-control">
                                <span className="label-text text-gray-300">Description</span>
                                <textarea name="description" value={values.description} onChange={handleChange} placeholder="Briefly describe the policy." className="textarea textarea-bordered bg-gray-700 text-white border-gray-600"></textarea>
                                {errors.description && <p className="text-error text-sm mt-1">{errors.description}</p>}
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="form-control">
                                    <span className="label-text text-gray-300">Policy Type</span>
                                    <select name="type" value={values.type} onChange={handleChange} className="select select-bordered bg-gray-700 text-white border-gray-600">
                                        <option value="limit">Spending Limit</option>
                                        <option value="category_block">Category Block</option>
                                        <option value="time_restriction">Time Restriction</option>
                                        <option value="geo_restriction">Geolocation Restriction</option>
                                        <option value="transaction_approval">Transaction Approval</option>
                                    </select>
                                </label>
                                <label className="form-control flex items-center justify-between flex-row pt-8">
                                    <span className="label-text text-gray-300">Is Active</span>
                                    <input type="checkbox" name="isActive" checked={values.isActive} onChange={handleChange} className="toggle toggle-cyan" />
                                </label>
                            </div>

                            {/* Configuration based on policy type */}
                            <div className="p-4 border border-gray-700 rounded-md bg-gray-700/50 space-y-3">
                                <h4 className="text-md font-semibold text-gray-300">Policy Configuration</h4>
                                {values.type === 'limit' && (
                                    <label className="form-control">
                                        <span className="label-text text-gray-300">Monthly Limit ({formatCurrency(values.configuration.monthlyLimit || 0)})</span>
                                        <input type="range" min="100" max="100000" step="100" name="configuration.monthlyLimit" value={values.configuration.monthlyLimit || 0}
                                            onChange={e => setValues(prev => ({ ...prev, configuration: { ...prev.configuration, monthlyLimit: +e.target.value } }))}
                                            className="range range-cyan range-xs" />
                                        {errors.monthlyLimit && <p className="text-error text-sm mt-1">{errors.monthlyLimit}</p>}
                                    </label>
                                )}
                                {values.type === 'category_block' && (
                                    <label className="form-control">
                                        <span className="label-text text-gray-300">Blocked Categories</span>
                                        <select multiple name="configuration.blockedMcc" value={values.configuration.blockedMcc || []}
                                            onChange={e => {
                                                const options = Array.from(e.target.options);
                                                const value = options.filter(option => option.selected).map(option => option.value);
                                                setValues(prev => ({ ...prev, configuration: { ...prev.configuration, blockedMcc: value } }));
                                            }}
                                            className="select select-bordered bg-gray-700 text-white border-gray-600 h-32"
                                        >
                                            {advancedData.merchantCategories.map(mc => (
                                                <option key={mc.id} value={mc.code}>{mc.name} ({mc.code})</option>
                                            ))}
                                        </select>
                                        {errors.blockedMcc && <p className="text-error text-sm mt-1">{errors.blockedMcc}</p>}
                                        <p className="text-xs text-gray-500 mt-1">Select categories to block for this policy.</p>
                                    </label>
                                )}
                                {values.type === 'time_restriction' && (
                                    <>
                                        <label className="form-control">
                                            <span className="label-text text-gray-300">Start Time</span>
                                            <input type="time" name="configuration.startTime" value={values.configuration.startTime || '09:00'} onChange={e => setValues(prev => ({ ...prev, configuration: { ...prev.configuration, startTime: e.target.value } }))} className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                        </label>
                                        <label className="form-control">
                                            <span className="label-text text-gray-300">End Time</span>
                                            <input type="time" name="configuration.endTime" value={values.configuration.endTime || '17:00'} onChange={e => setValues(prev => ({ ...prev, configuration: { ...prev.configuration, endTime: e.target.value } }))} className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                        </label>
                                        <label className="form-control">
                                            <span className="label-text text-gray-300">Days of Week (0=Sun, 6=Sat)</span>
                                            <input type="text" name="configuration.daysOfWeek" value={values.configuration.daysOfWeek?.join(',') || ''} onChange={e => setValues(prev => ({ ...prev, configuration: { ...prev.configuration, daysOfWeek: e.target.value.split(',').map(Number) } }))} placeholder="e.g., 1,2,3,4,5 for Mon-Fri" className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                        </label>
                                    </>
                                )}
                                {values.type === 'geo_restriction' && (
                                    <>
                                        <label className="form-control">
                                            <span className="label-text text-gray-300">Allowed Countries (comma-separated ISO codes)</span>
                                            <input type="text" name="configuration.allowedCountries" value={values.configuration.allowedCountries?.join(',') || ''} onChange={e => setValues(prev => ({ ...prev, configuration: { ...prev.configuration, allowedCountries: e.target.value.split(',') } }))} placeholder="e.g., US,CA,GB" className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                        </label>
                                        <label className="form-control">
                                            <span className="label-text text-gray-300">Blocked Countries (comma-separated ISO codes)</span>
                                            <input type="text" name="configuration.blockedCountries" value={values.configuration.blockedCountries?.join(',') || ''} onChange={e => setValues(prev => ({ ...prev, configuration: { ...prev.configuration, blockedCountries: e.target.value.split(',') } }))} placeholder="e.g., RU,IR" className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                        </label>
                                    </>
                                )}
                                {values.type === 'transaction_approval' && (
                                    <>
                                        <label className="form-control">
                                            <span className="label-text text-gray-300">Minimum Amount for Approval ({formatCurrency(values.configuration.minAmount || 0)})</span>
                                            <input type="range" min="10" max="5000" step="10" name="configuration.minAmount" value={values.configuration.minAmount || 0}
                                                onChange={e => setValues(prev => ({ ...prev, configuration: { ...prev.configuration, minAmount: +e.target.value } }))}
                                                className="range range-cyan range-xs" />
                                        </label>
                                        <label className="form-control">
                                            <span className="label-text text-gray-300">Approver Role</span>
                                            <select name="configuration.approverRole" value={values.configuration.approverRole || ''}
                                                onChange={e => setValues(prev => ({ ...prev, configuration: { ...prev.configuration, approverRole: e.target.value } }))}
                                                className="select select-bordered bg-gray-700 text-white border-gray-600"
                                            >
                                                <option value="">Select Role</option>
                                                {advancedData.userPermissionProfiles.map(profile => (
                                                    <option key={profile.id} value={profile.name}>{profile.name}</option>
                                                ))}
                                            </select>
                                        </label>
                                    </>
                                )}
                            </div>


                            <label className="form-control">
                                <span className="label-text text-gray-300">Applies To</span>
                                <select name="appliesTo" value={values.appliesTo} onChange={handleChange} className="select select-bordered bg-gray-700 text-white border-gray-600">
                                    <option value="all_cards">All Corporate Cards</option>
                                    <option value="specific_cards">Specific Cards</option>
                                    <option value="specific_holders">Specific Cardholders</option>
                                </select>
                            </label>

                            {values.appliesTo !== 'all_cards' && (
                                <label className="form-control">
                                    <span className="label-text text-gray-300">{values.appliesTo === 'specific_cards' ? 'Select Cards' : 'Select Cardholders'}</span>
                                    <select multiple name="targetIds" value={values.targetIds || []}
                                        onChange={e => {
                                            const options = Array.from(e.target.options);
                                            const value = options.filter(option => option.selected).map(option => option.value);
                                            setValues(prev => ({ ...prev, targetIds: value }));
                                        }}
                                        className="select select-bordered bg-gray-700 text-white border-gray-600 h-32"
                                    >
                                        {values.appliesTo === 'specific_cards' ? (
                                            corporateCards.map(card => (
                                                <option key={card.id} value={card.id}>{card.holderName} (...{card.cardNumberMask})</option>
                                            ))
                                        ) : (
                                            MOCK_CARDHOLDERS.map(holder => (
                                                <option key={holder.id} value={holder.id}>{holder.name} ({holder.role})</option>
                                            ))
                                        )}
                                    </select>
                                    {errors.targetIds && <p className="text-error text-sm mt-1">{errors.targetIds}</p>}
                                </label>
                            )}

                            <div className="modal-action">
                                <button type="button" className="btn btn-ghost" onClick={() => setIsPolicyModalOpen(false)} disabled={isSubmitting || isLoading}>Cancel</button>
                                <button type="submit" className="btn btn-cyan" disabled={isSubmitting || isLoading}>
                                    {(isSubmitting || isLoading) && <span className="loading loading-spinner"></span>}
                                    {editingPolicy ? 'Update Policy' : 'Create Policy'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Card>
    );
};

export const AuditTrailPanel: React.FC = () => {
    const advancedContext = useContext(AdvancedCardContext);
    if (!advancedContext) throw new Error("AuditTrailPanel must be within AdvancedCardProvider");

    const { data: advancedData } = advancedContext;

    const auditLogColumns = useMemo(() => [
        { header: 'Timestamp', accessor: (log: AuditLogEntry) => formatDate(log.timestamp) },
        { header: 'Actor', accessor: (log: AuditLogEntry) => MOCK_CARDHOLDERS.find(h => h.id === log.actorId)?.name || 'System' },
        { header: 'Action', accessor: 'action' },
        { header: 'Target Type', accessor: 'targetType' },
        { header: 'Target ID', accessor: 'targetId', className: 'font-mono' },
        { header: 'Description', accessor: 'description' },
    ], []);

    const filterOptions = {
        targetType: {
            label: 'Target Type',
            options: [
                { value: 'card', label: 'Card' },
                { value: 'card_request', label: 'Card Request' },
                { value: 'policy', label: 'Policy' },
                { value: 'user', label: 'User' },
                { value: 'virtual_card', label: 'Virtual Card' },
            ]
        },
        action: {
            label: 'Action',
            options: Array.from(new Set(advancedData.auditLogs.map(log => log.action))).map(action => ({ value: action, label: action.replace(/_/g, ' ') }))
        },
    };

    return (
        <Card title="Audit Trail">
            <p className="text-gray-300 mb-4">A comprehensive log of all actions performed within the card management system, including who did what and when.</p>
            <PaginatedTable
                data={advancedData.auditLogs.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime())}
                columns={auditLogColumns}
                rowKeyExtractor={(log) => log.id}
                searchableKeys={['action', 'description', 'targetId']}
                filterOptions={filterOptions}
                itemsPerPage={10}
                emptyMessage="No audit log entries found."
            />
        </Card>
    );
};

export const VirtualCardCreator: React.FC = () => {
    const advancedContext = useContext(AdvancedCardContext);
    const dataContext = useContext(DataContext);
    if (!advancedContext || !dataContext) throw new Error("VirtualCardCreator must be within AdvancedCardProvider and DataProvider");

    const { data: advancedData, actions: advancedActions } = advancedContext;
    const { corporateCards } = dataContext;

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingVirtualCard, setEditingVirtualCard] = useState<VirtualCard | null>(null);

    const initialVirtualCardForm: Omit<VirtualCard, 'id' | 'cardNumberMask' | 'generationDate' | 'transactions'> = {
        holderName: MOCK_CARDHOLDERS[0].name, // Default to first mock holder
        purpose: 'Software Subscription',
        limit: 100,
        balance: 0,
        currency: 'USD',
        status: 'Active',
        frozen: false,
        isSingleUse: false,
        expiration: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year from now
        controls: { monthlyLimit: 100, atm: false, online: true, contactless: false },
        issueDate: new Date(),
        expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Redundant with 'expiration', keep for interface consistency
        type: 'Virtual',
    };

    const {
        values,
        setValues,
        errors,
        handleChange,
        handleSubmit,
        isSubmitting
    } = useFormValidation(editingVirtualCard || initialVirtualCardForm, (vals) => {
        const newErrors: FormValidationState = {};
        if (!vals.holderName) newErrors.holderName = 'Holder name is required.';
        if (!vals.purpose) newErrors.purpose = 'Purpose is required.';
        if (!vals.limit || vals.limit <= 0) newErrors.limit = 'Limit must be positive.';
        if (new Date(vals.expiration).getTime() < Date.now()) newErrors.expiration = 'Expiration date must be in the future.';
        return newErrors;
    });

    useEffect(() => {
        setValues(editingVirtualCard || initialVirtualCardForm);
    }, [editingVirtualCard]);

    const onSubmitVirtualCard = async (formValues: typeof initialVirtualCardForm) => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const finalValues = {
            ...formValues,
            // Ensure dates are correctly formatted or handled for API
            expiration: new Date(formValues.expiration),
            issueDate: new Date(), // Always current date for new virtual cards
            expirationDate: new Date(formValues.expiration), // Match expiration
            status: formValues.frozen ? 'Frozen' : 'Active',
        };

        if (editingVirtualCard) {
            advancedActions.updateVirtualCard(editingVirtualCard.id, finalValues);
        } else {
            advancedActions.createVirtualCard(finalValues);
        }

        setIsSaving(false);
        setIsCreateModalOpen(false);
        setEditingVirtualCard(null);
        setValues(initialVirtualCardForm); // Reset form
        alert(`Virtual card ${editingVirtualCard ? 'updated' : 'created'} successfully!`);
    };

    const handleEditVirtualCard = (card: VirtualCard) => {
        setEditingVirtualCard(card);
        setIsCreateModalOpen(true);
    };

    const handleDeleteVirtualCard = async (id: string) => {
        if (!confirm('Are you sure you want to terminate this virtual card?')) return;
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        advancedActions.deleteVirtualCard(id);
        setIsSaving(false);
        alert('Virtual card terminated.');
    };

    const handleToggleFreeze = async (cardId: string, currentFrozenStatus: boolean) => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        advancedActions.updateVirtualCard(cardId, { frozen: !currentFrozenStatus, status: !currentFrozenStatus ? 'Frozen' : 'Active' });
        setIsSaving(false);
    };

    const virtualCardColumns = useMemo(() => [
        { header: 'Holder', accessor: 'holderName' },
        { header: 'Purpose', accessor: 'purpose' },
        { header: 'Number', accessor: 'cardNumberMask', className: 'font-mono' },
        { header: 'Limit', accessor: (vc: VirtualCard) => formatCurrency(vc.limit) },
        { header: 'Balance', accessor: (vc: VirtualCard) => formatCurrency(vc.balance) },
        { header: 'Expires', accessor: (vc: VirtualCard) => formatDate(new Date(vc.expiration), { year: 'numeric', month: 'short', day: 'numeric' }) },
        { header: 'Status', accessor: (vc: VirtualCard) => (
            <span className={`badge ${
                vc.status === 'Active' ? 'badge-success' :
                vc.status === 'Frozen' ? 'badge-info' :
                vc.status === 'Expired' ? 'badge-warning' : 'badge-neutral'
            }`}>
                {vc.status}
            </span>
        )},
    ], []);

    const filterOptions = {
        status: {
            label: 'Status',
            options: [
                { value: 'Active', label: 'Active' },
                { value: 'Frozen', label: 'Frozen' },
                { value: 'Expired', label: 'Expired' },
            ]
        },
        isSingleUse: {
            label: 'Type',
            options: [
                { value: true, label: 'Single-Use' },
                { value: false, label: 'Multi-Use' },
            ]
        }
    };

    return (
        <Card title="Virtual Card Management">
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-300">Generate and manage virtual cards for secure, specific spending needs.</p>
                <button onClick={() => { setEditingVirtualCard(null); setIsCreateModalOpen(true); }} className="btn btn-cyan">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Create Virtual Card
                </button>
            </div>

            <PaginatedTable
                title="Active Virtual Cards"
                data={advancedData.virtualCards.sort((a,b) => b.generationDate.getTime() - a.generationDate.getTime())}
                columns={virtualCardColumns}
                rowKeyExtractor={(vc) => vc.id}
                searchableKeys={['holderName', 'purpose', 'cardNumberMask']}
                filterOptions={filterOptions}
                emptyMessage="No virtual cards created yet."
                actions={(item) => (
                    <div className="flex gap-2">
                        <button onClick={() => handleToggleFreeze(item.id, item.frozen)} className={`btn btn-xs ${item.frozen ? 'btn-info' : 'btn-warning'}`}>
                            {item.frozen ? 'Unfreeze' : 'Freeze'}
                        </button>
                        <button onClick={() => handleEditVirtualCard(item)} className="btn btn-xs btn-outline btn-primary">Edit</button>
                        <button onClick={() => handleDeleteVirtualCard(item.id)} className="btn btn-xs btn-error">Terminate</button>
                    </div>
                )}
            />

            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700 p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold text-white mb-4">{editingVirtualCard ? 'Edit Virtual Card' : 'Create New Virtual Card'}</h3>
                        <form onSubmit={handleSubmit(onSubmitVirtualCard)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="form-control">
                                    <span className="label-text text-gray-300">Card Holder Name</span>
                                    <input type="text" name="holderName" value={values.holderName} onChange={handleChange} placeholder="Virtual Card User" className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                    {errors.holderName && <p className="text-error text-sm mt-1">{errors.holderName}</p>}
                                </label>
                                <label className="form-control">
                                    <span className="label-text text-gray-300">Purpose / Project</span>
                                    <input type="text" name="purpose" value={values.purpose} onChange={handleChange} placeholder="e.g., Q3 Marketing Campaign" className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                    {errors.purpose && <p className="text-error text-sm mt-1">{errors.purpose}</p>}
                                </label>
                                <label className="form-control">
                                    <span className="label-text text-gray-300">Limit ({formatCurrency(values.limit)})</span>
                                    <input type="range" min="10" max="10000" step="10" name="limit" value={values.limit} onChange={handleChange} className="range range-cyan range-xs" />
                                    {errors.limit && <p className="text-error text-sm mt-1">{errors.limit}</p>}
                                </label>
                                <label className="form-control">
                                    <span className="label-text text-gray-300">Expiration Date</span>
                                    <input type="date" name="expiration" value={new Date(values.expiration).toISOString().split('T')[0]} onChange={handleChange} className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                    {errors.expiration && <p className="text-error text-sm mt-1">{errors.expiration}</p>}
                                </label>
                                <label className="form-control flex items-center justify-between flex-row pt-8">
                                    <span className="label-text text-gray-300">Single Use Card</span>
                                    <input type="checkbox" name="isSingleUse" checked={values.isSingleUse} onChange={handleChange} className="toggle toggle-cyan" />
                                </label>
                                <label className="form-control flex items-center justify-between flex-row pt-8">
                                    <span className="label-text text-gray-300">Frozen on Creation</span>
                                    <input type="checkbox" name="frozen" checked={values.frozen} onChange={handleChange} className="toggle toggle-cyan" />
                                </label>
                            </div>

                            <label className="form-control">
                                <span className="label-text text-gray-300">Link to Physical Card (Optional)</span>
                                <select name="parentCardId" value={values.parentCardId || ''} onChange={handleChange} className="select select-bordered bg-gray-700 text-white border-gray-600">
                                    <option value="">No parent card</option>
                                    {corporateCards.map(card => (
                                        <option key={card.id} value={card.id}>{card.holderName} (...{card.cardNumberMask})</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">If linked, funds might be drawn from the parent card's budget/limit, or inherit some controls.</p>
                            </label>

                            <div className="modal-action">
                                <button type="button" className="btn btn-ghost" onClick={() => setIsCreateModalOpen(false)} disabled={isSubmitting || isSaving}>Cancel</button>
                                <button type="submit" className="btn btn-cyan" disabled={isSubmitting || isSaving}>
                                    {(isSubmitting || isSaving) && <span className="loading loading-spinner"></span>}
                                    {editingVirtualCard ? 'Update Virtual Card' : 'Create Virtual Card'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Card>
    );
};

export const UserPermissionsPanel: React.FC = () => {
    const advancedContext = useContext(AdvancedCardContext);
    if (!advancedContext) throw new Error("UserPermissionsPanel must be within AdvancedCardProvider");

    const { data: advancedData, actions: advancedActions } = advancedContext;

    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<UserPermissionProfile | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const initialRoleFormState: UserPermissionProfile = {
        id: '', name: '', description: '',
        permissions: {
            canViewAllCards: false, canManageOwnCards: false, canManageTeamCards: false,
            canManageAllCards: false, canCreateCards: false, canApproveRequests: false,
            canManagePolicies: false, canViewAuditLogs: false, canManageUserPermissions: false,
            canAccessReporting: false, canManageIntegrations: false,
        }
    };

    const {
        values,
        setValues,
        errors,
        handleChange,
        handleSubmit,
        isSubmitting
    } = useFormValidation(editingRole || initialRoleFormState, (vals) => {
        const newErrors: FormValidationState = {};
        if (!vals.name) newErrors.name = 'Role name is required.';
        if (!vals.description) newErrors.description = 'Description is required.';
        return newErrors;
    });

    useEffect(() => {
        setValues(editingRole || initialRoleFormState);
    }, [editingRole]);

    const onSubmitRole = async (formValues: UserPermissionProfile) => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        if (formValues.id) {
            advancedActions.updateUserPermissionProfile(formValues.id, formValues);
        } else {
            advancedActions.addUserPermissionProfile(formValues);
        }
        setIsSaving(false);
        setIsRoleModalOpen(false);
        setEditingRole(null);
        setValues(initialRoleFormState);
        alert(`Role ${formValues.id ? 'updated' : 'created'} successfully!`);
    };

    const handleEditRole = (role: UserPermissionProfile) => {
        setEditingRole(role);
        setIsRoleModalOpen(true);
    };

    const handleDeleteRole = async (id: string) => {
        if (!confirm('Are you sure you want to delete this role? This cannot be undone.')) return;
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        advancedActions.deleteUserPermissionProfile(id);
        setIsSaving(false);
        alert('Role deleted.');
    };

    const permissionNames: Array<{ key: keyof UserPermissionProfile['permissions']; label: string }> = [
        { key: 'canViewAllCards', label: 'View All Cards' },
        { key: 'canManageOwnCards', label: 'Manage Own Cards' },
        { key: 'canManageTeamCards', label: 'Manage Team Cards' },
        { key: 'canManageAllCards', label: 'Manage All Cards' },
        { key: 'canCreateCards', label: 'Create New Cards' },
        { key: 'canApproveRequests', label: 'Approve Card Requests' },
        { key: 'canManagePolicies', label: 'Manage Policies' },
        { key: 'canViewAuditLogs', label: 'View Audit Logs' },
        { key: 'canManageUserPermissions', label: 'Manage User Permissions' },
        { key: 'canAccessReporting', label: 'Access Advanced Reporting' },
        { key: 'canManageIntegrations', label: 'Manage Integrations' },
    ];

    const roleColumns = useMemo(() => [
        { header: 'Role Name', accessor: 'name' },
        { header: 'Description', accessor: 'description' },
        { header: 'Permissions', accessor: (role: UserPermissionProfile) => (
            <div className="flex flex-wrap gap-1">
                {permissionNames.filter(p => role.permissions[p.key]).map(p => (
                    <span key={p.key} className="badge badge-outline badge-info badge-xs">{p.label.replace('Can ', '')}</span>
                ))}
            </div>
        ) },
    ], [permissionNames]);

    return (
        <Card title="User Roles & Permissions">
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-300">Define and manage user roles and their associated permissions for card management features.</p>
                <button onClick={() => { setEditingRole(null); setIsRoleModalOpen(true); }} className="btn btn-cyan">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    New Role
                </button>
            </div>

            <PaginatedTable
                title="Configured User Roles"
                data={advancedData.userPermissionProfiles}
                columns={roleColumns}
                rowKeyExtractor={(item) => item.id}
                searchableKeys={['name', 'description']}
                emptyMessage="No user roles configured yet."
                actions={(item) => (
                    <div className="flex gap-2">
                        <button onClick={() => handleEditRole(item)} className="btn btn-xs btn-info">Edit</button>
                        <button onClick={() => handleDeleteRole(item.id)} className="btn btn-xs btn-error">Delete</button>
                    </div>
                )}
            />

            {isRoleModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setIsRoleModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700 p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold text-white mb-4">{editingRole ? 'Edit User Role' : 'Create New User Role'}</h3>
                        <form onSubmit={handleSubmit(onSubmitRole)} className="space-y-4">
                            <label className="form-control">
                                <span className="label-text text-gray-300">Role Name</span>
                                <input type="text" name="name" value={values.name} onChange={handleChange} placeholder="e.g., Finance Manager" className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                {errors.name && <p className="text-error text-sm mt-1">{errors.name}</p>}
                            </label>
                            <label className="form-control">
                                <span className="label-text text-gray-300">Description</span>
                                <textarea name="description" value={values.description} onChange={handleChange} placeholder="Describe the responsibilities of this role." className="textarea textarea-bordered bg-gray-700 text-white border-gray-600"></textarea>
                                {errors.description && <p className="text-error text-sm mt-1">{errors.description}</p>}
                            </label>

                            <div className="divider"></div>
                            <h4 className="text-lg font-semibold text-cyan-300">Permissions</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                {permissionNames.map(p => (
                                    <label key={p.key} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-300">{p.label}</span>
                                        <input
                                            type="checkbox"
                                            name={`permissions.${p.key}`}
                                            checked={values.permissions[p.key]}
                                            onChange={e => setValues(prev => ({ ...prev, permissions: { ...prev.permissions, [p.key]: e.target.checked } }))}
                                            className="toggle toggle-cyan"
                                        />
                                    </label>
                                ))}
                            </div>

                            <div className="modal-action">
                                <button type="button" className="btn btn-ghost" onClick={() => setIsRoleModalOpen(false)} disabled={isSubmitting || isSaving}>Cancel</button>
                                <button type="submit" className="btn btn-cyan" disabled={isSubmitting || isSaving}>
                                    {(isSubmitting || isSaving) && <span className="loading loading-spinner"></span>}
                                    {editingRole ? 'Update Role' : 'Create Role'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Card>
    );
};

export const AlertSettingsPanel: React.FC = () => {
    const advancedContext = useContext(AdvancedCardContext);
    const dataContext = useContext(DataContext);
    if (!advancedContext || !dataContext) throw new Error("AlertSettingsPanel must be within AdvancedCardProvider and DataProvider");

    const { data: advancedData, actions: advancedActions } = advancedContext;
    const { corporateCards } = dataContext;

    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [editingAlert, setEditingAlert] = useState<AlertConfiguration | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const initialAlertFormState: AlertConfiguration = {
        id: '', name: '', description: '', type: 'spending_threshold', isActive: true, channels: ['email'],
        threshold: 100, period: 'monthly', targetCards: [], targetUsers: [MOCK_CARDHOLDERS[0].id]
    };

    const {
        values,
        setValues,
        errors,
        handleChange,
        handleSubmit,
        isSubmitting
    } = useFormValidation(editingAlert || initialAlertFormState, (vals) => {
        const newErrors: FormValidationState = {};
        if (!vals.name) newErrors.name = 'Alert name is required.';
        if (!vals.description) newErrors.description = 'Description is required.';
        if (vals.channels.length === 0) newErrors.channels = 'At least one notification channel is required.';
        if ((vals.type === 'spending_threshold' || vals.type === 'low_balance') && (!vals.threshold || vals.threshold <= 0)) newErrors.threshold = 'Threshold must be positive.';
        return newErrors;
    });

    useEffect(() => {
        setValues(editingAlert || initialAlertFormState);
    }, [editingAlert]);

    const onSubmitAlert = async (formValues: AlertConfiguration) => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        if (formValues.id) {
            advancedActions.updateAlertConfiguration(formValues.id, formValues);
        } else {
            advancedActions.addAlertConfiguration(formValues);
        }
        setIsSaving(false);
        setIsAlertModalOpen(false);
        setEditingAlert(null);
        setValues(initialAlertFormState);
        alert(`Alert ${formValues.id ? 'updated' : 'created'} successfully!`);
    };

    const handleEditAlert = (alert: AlertConfiguration) => {
        setEditingAlert(alert);
        setIsAlertModalOpen(true);
    };

    const handleDeleteAlert = async (id: string) => {
        if (!confirm('Are you sure you want to delete this alert?')) return;
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        advancedActions.deleteAlertConfiguration(id);
        setIsSaving(false);
        alert('Alert deleted.');
    };

    const handleChannelToggle = (channel: 'email' | 'slack' | 'sms') => {
        setValues(prev => {
            const currentChannels = prev.channels || [];
            const newChannels = currentChannels.includes(channel)
                ? currentChannels.filter(c => c !== channel)
                : [...currentChannels, channel];
            return { ...prev, channels: newChannels };
        });
    };

    const alertColumns = useMemo(() => [
        { header: 'Name', accessor: 'name' },
        { header: 'Type', accessor: (a: AlertConfiguration) => capitalizeFirstLetter(a.type.replace(/_/g, ' ')) },
        { header: 'Description', accessor: 'description' },
        { header: 'Threshold', accessor: (a: AlertConfiguration) => a.threshold ? formatCurrency(a.threshold) : 'N/A' },
        { header: 'Channels', accessor: (a: AlertConfiguration) => (
            <div className="flex flex-wrap gap-1">
                {a.channels.map(channel => (
                    <span key={channel} className="badge badge-outline badge-primary badge-xs">{capitalizeFirstLetter(channel)}</span>
                ))}
            </div>
        )},
        { header: 'Status', accessor: (a: AlertConfiguration) => (
            <span className={`badge ${a.isActive ? 'badge-success' : 'badge-warning'}`}>{a.isActive ? 'Active' : 'Inactive'}</span>
        )},
    ], []);

    const filterOptions = {
        type: {
            label: 'Type',
            options: [
                { value: 'spending_threshold', label: 'Spending Threshold' },
                { value: 'unusual_transaction', label: 'Unusual Transaction' },
                { value: 'policy_violation', label: 'Policy Violation' },
                { value: 'card_status_change', label: 'Card Status Change' },
                { value: 'low_balance', label: 'Low Balance' },
            ]
        },
        isActive: {
            label: 'Status',
            options: [
                { value: true, label: 'Active' },
                { value: false, label: 'Inactive' },
            ]
        }
    };

    return (
        <Card title="Alerts & Notifications">
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-300">Configure real-time alerts for critical card activities and spending patterns.</p>
                <button onClick={() => { setEditingAlert(null); setIsAlertModalOpen(true); }} className="btn btn-cyan">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    New Alert
                </button>
            </div>

            <PaginatedTable
                title="Configured Alerts"
                data={advancedData.alertConfigurations}
                columns={alertColumns}
                rowKeyExtractor={(item) => item.id}
                searchableKeys={['name', 'description', 'type']}
                filterOptions={filterOptions}
                emptyMessage="No alerts configured yet."
                actions={(item) => (
                    <div className="flex gap-2">
                        <button onClick={() => handleEditAlert(item)} className="btn btn-xs btn-info">Edit</button>
                        <button onClick={() => handleDeleteAlert(item.id)} className="btn btn-xs btn-error">Delete</button>
                    </div>
                )}
            />

            {isAlertModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setIsAlertModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700 p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold text-white mb-4">{editingAlert ? 'Edit Alert Configuration' : 'Create New Alert'}</h3>
                        <form onSubmit={handleSubmit(onSubmitAlert)} className="space-y-4">
                            <label className="form-control">
                                <span className="label-text text-gray-300">Alert Name</span>
                                <input type="text" name="name" value={values.name} onChange={handleChange} placeholder="e.g., High Spending Alert" className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                {errors.name && <p className="text-error text-sm mt-1">{errors.name}</p>}
                            </label>
                            <label className="form-control">
                                <span className="label-text text-gray-300">Description</span>
                                <textarea name="description" value={values.description} onChange={handleChange} placeholder="What should this alert notify about?" className="textarea textarea-bordered bg-gray-700 text-white border-gray-600"></textarea>
                                {errors.description && <p className="text-error text-sm mt-1">{errors.description}</p>}
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="form-control">
                                    <span className="label-text text-gray-300">Alert Type</span>
                                    <select name="type" value={values.type} onChange={handleChange} className="select select-bordered bg-gray-700 text-white border-gray-600">
                                        <option value="spending_threshold">Spending Threshold Exceeded</option>
                                        <option value="unusual_transaction">Unusual Transaction Detected</option>
                                        <option value="policy_violation">Policy Violation</option>
                                        <option value="card_status_change">Card Status Change (e.g., Freeze)</option>
                                        <option value="low_balance">Low Card Balance</option>
                                    </select>
                                </label>
                                <label className="form-control flex items-center justify-between flex-row pt-8">
                                    <span className="label-text text-gray-300">Is Active</span>
                                    <input type="checkbox" name="isActive" checked={values.isActive} onChange={handleChange} className="toggle toggle-cyan" />
                                </label>
                            </div>

                            {(values.type === 'spending_threshold' || values.type === 'low_balance') && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label className="form-control">
                                        <span className="label-text text-gray-300">Threshold Amount ({formatCurrency(values.threshold || 0)})</span>
                                        <input type="range" min="10" max="5000" step="10" name="threshold" value={values.threshold || 0} onChange={handleChange} className="range range-cyan range-xs" />
                                        {errors.threshold && <p className="text-error text-sm mt-1">{errors.threshold}</p>}
                                    </label>
                                    <label className="form-control">
                                        <span className="label-text text-gray-300">Monitoring Period</span>
                                        <select name="period" value={values.period} onChange={handleChange} className="select select-bordered bg-gray-700 text-white border-gray-600">
                                            <option value="transaction">Per Transaction</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </label>
                                </div>
                            )}

                            <label className="form-control">
                                <span className="label-text text-gray-300">Target Cards (Optional)</span>
                                <select multiple name="targetCards" value={values.targetCards || []}
                                    onChange={e => {
                                        const options = Array.from(e.target.options);
                                        const value = options.filter(option => option.selected).map(option => option.value);
                                        setValues(prev => ({ ...prev, targetCards: value }));
                                    }}
                                    className="select select-bordered bg-gray-700 text-white border-gray-600 h-24"
                                >
                                    {corporateCards.map(card => (
                                        <option key={card.id} value={card.id}>{card.holderName} (...{card.cardNumberMask})</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">If no cards selected, alert applies to all cards.</p>
                            </label>

                            <label className="form-control">
                                <span className="label-text text-gray-300">Notify Users</span>
                                <select multiple name="targetUsers" value={values.targetUsers || []}
                                    onChange={e => {
                                        const options = Array.from(e.target.options);
                                        const value = options.filter(option => option.selected).map(option => option.value);
                                        setValues(prev => ({ ...prev, targetUsers: value }));
                                    }}
                                    className="select select-bordered bg-gray-700 text-white border-gray-600 h-24"
                                >
                                    {MOCK_CARDHOLDERS.map(user => (
                                        <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Select users to receive this notification.</p>
                            </label>

                            <label className="form-control">
                                <span className="label-text text-gray-300">Notification Channels</span>
                                <div className="flex flex-wrap gap-4 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={values.channels.includes('email')} onChange={() => handleChannelToggle('email')} className="checkbox checkbox-cyan" />
                                        <span className="text-white">Email</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={values.channels.includes('slack')} onChange={() => handleChannelToggle('slack')} className="checkbox checkbox-cyan" />
                                        <span className="text-white">Slack</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={values.channels.includes('sms')} onChange={() => handleChannelToggle('sms')} className="checkbox checkbox-cyan" />
                                        <span className="text-white">SMS</span>
                                    </label>
                                </div>
                                {errors.channels && <p className="text-error text-sm mt-1">{errors.channels}</p>}
                            </label>

                            <div className="modal-action">
                                <button type="button" className="btn btn-ghost" onClick={() => setIsAlertModalOpen(false)} disabled={isSubmitting || isSaving}>Cancel</button>
                                <button type="submit" className="btn btn-cyan" disabled={isSubmitting || isSaving}>
                                    {(isSubmitting || isSaving) && <span className="loading loading-spinner"></span>}
                                    {editingAlert ? 'Update Alert' : 'Create Alert'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Card>
    );
};

export const MerchantCategoryControlPanel: React.FC = () => {
    const advancedContext = useContext(AdvancedCardContext);
    if (!advancedContext) throw new Error("MerchantCategoryControlPanel must be within AdvancedCardProvider");

    const { data: advancedData, actions: advancedActions } = advancedContext;

    const [isSaving, setIsSaving] = useState(false);
    const [localCategories, setLocalCategories] = useState<MerchantCategory[]>(advancedData.merchantCategories);

    useEffect(() => {
        setLocalCategories(advancedData.merchantCategories);
    }, [advancedData.merchantCategories]);

    const handleToggleBlockedByDefault = (id: string) => {
        setLocalCategories(prev =>
            prev.map(cat =>
                cat.id === id ? { ...cat, blockedByDefault: !cat.blockedByDefault } : cat
            )
        );
    };

    const handleSaveAllChanges = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
        localCategories.forEach(cat => {
            const original = advancedData.merchantCategories.find(oc => oc.id === cat.id);
            if (original && original.blockedByDefault !== cat.blockedByDefault) {
                advancedActions.updateMerchantCategory(cat.id, { blockedByDefault: cat.blockedByDefault });
            }
        });
        setIsSaving(false);
        alert('Merchant Category settings updated globally.');
    };

    const categoryColumns = useMemo(() => [
        { header: 'Category Name', accessor: 'name' },
        { header: 'MCC Code', accessor: 'code', className: 'font-mono' },
        { header: 'Description', accessor: 'description' },
        { header: 'Blocked by Default', accessor: (cat: MerchantCategory) => (
            <input
                type="checkbox"
                className="toggle toggle-cyan"
                checked={cat.blockedByDefault}
                onChange={() => handleToggleBlockedByDefault(cat.id)}
            />
        )},
    ], []);

    return (
        <Card title="Merchant Category Controls">
            <p className="text-gray-300 mb-6">
                Manage global settings for Merchant Category Codes (MCCs). Mark categories to be blocked by default for all new cards,
                or as a default suggestion for existing cards, improving compliance and reducing unwanted spending.
            </p>

            <PaginatedTable
                title="Configured Merchant Categories"
                data={localCategories}
                columns={categoryColumns}
                rowKeyExtractor={(item) => item.id}
                searchableKeys={['name', 'code', 'description']}
                emptyMessage="No merchant categories defined."
                itemsPerPage={10}
            />

            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleSaveAllChanges}
                    className={`btn btn-cyan ${isSaving ? 'btn-disabled' : ''}`}
                    disabled={isSaving}
                >
                    {isSaving && <span className="loading loading-spinner"></span>}
                    Save Global Category Settings
                </button>
            </div>
        </Card>
    );
};

export const RecurringSubscriptionView: React.FC = () => {
    const advancedContext = useContext(AdvancedCardContext);
    const dataContext = useContext(DataContext);
    if (!advancedContext || !dataContext) throw new Error("RecurringSubscriptionView must be within AdvancedCardProvider and DataProvider");

    const { data: advancedData, actions: advancedActions } = advancedContext;
    const { corporateCards } = dataContext;

    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const initialSubscriptionFormState: Omit<Subscription, 'id'> = {
        cardId: corporateCards[0]?.id || '', // Default to first card if available
        merchantName: '',
        amount: 50,
        currency: 'USD',
        billingCycle: 'monthly',
        nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        status: 'active',
        category: 'Software',
        startDate: new Date(),
        notes: '',
    };

    const {
        values,
        setValues,
        errors,
        handleChange,
        handleSubmit,
        isSubmitting
    } = useFormValidation(editingSubscription || initialSubscriptionFormState, (vals) => {
        const newErrors: FormValidationState = {};
        if (!vals.cardId) newErrors.cardId = 'Card is required.';
        if (!vals.merchantName) newErrors.merchantName = 'Merchant name is required.';
        if (!vals.amount || vals.amount <= 0) newErrors.amount = 'Amount must be positive.';
        if (new Date(vals.nextBillingDate).getTime() < Date.now()) newErrors.nextBillingDate = 'Next billing date must be in the future.';
        return newErrors;
    });

    useEffect(() => {
        setValues(editingSubscription || initialSubscriptionFormState);
    }, [editingSubscription]);

    const onSubmitSubscription = async (formValues: Omit<Subscription, 'id'>) => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        const finalValues = {
            ...formValues,
            nextBillingDate: new Date(formValues.nextBillingDate),
            startDate: new Date(formValues.startDate || new Date()),
        };
        if (editingSubscription) {
            advancedActions.updateSubscription(editingSubscription.id, finalValues);
        } else {
            advancedActions.addSubscription(finalValues);
        }
        setIsSaving(false);
        setIsSubscriptionModalOpen(false);
        setEditingSubscription(null);
        setValues(initialSubscriptionFormState);
        alert(`Subscription ${editingSubscription ? 'updated' : 'added'} successfully!`);
    };

    const handleEditSubscription = (sub: Subscription) => {
        setEditingSubscription(sub);
        setIsSubscriptionModalOpen(true);
    };

    const handleDeleteSubscription = async (id: string) => {
        if (!confirm('Are you sure you want to delete this subscription record?')) return;
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        advancedActions.deleteSubscription(id);
        setIsSaving(false);
        alert('Subscription record deleted.');
    };

    const subscriptionColumns = useMemo(() => [
        { header: 'Merchant', accessor: 'merchantName' },
        { header: 'Card', accessor: (sub: Subscription) => corporateCards.find(c => c.id === sub.cardId)?.holderName || 'N/A' },
        { header: 'Amount', accessor: (sub: Subscription) => formatCurrency(sub.amount, sub.currency) },
        { header: 'Billing Cycle', accessor: 'billingCycle' },
        { header: 'Next Billing', accessor: (sub: Subscription) => formatDate(new Date(sub.nextBillingDate), { year: 'numeric', month: 'short', day: 'numeric' }) },
        { header: 'Status', accessor: (sub: Subscription) => (
            <span className={`badge ${
                sub.status === 'active' ? 'badge-success' :
                sub.status === 'cancelled' ? 'badge-error' : 'badge-warning'
            }`}>
                {capitalizeFirstLetter(sub.status)}
            </span>
        )},
    ], [corporateCards]);

    const filterOptions = {
        status: {
            label: 'Status',
            options: [
                { value: 'active', label: 'Active' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'paused', label: 'Paused' },
            ]
        },
        billingCycle: {
            label: 'Billing Cycle',
            options: [
                { value: 'monthly', label: 'Monthly' },
                { value: 'annually', label: 'Annually' },
                { value: 'quarterly', label: 'Quarterly' },
            ]
        },
    };

    return (
        <Card title="Recurring Subscriptions & Bills">
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-300">Track and manage all recurring charges on corporate cards.</p>
                <button onClick={() => { setEditingSubscription(null); setIsSubscriptionModalOpen(true); }} className="btn btn-cyan">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Add Subscription
                </button>
            </div>

            <PaginatedTable
                title="All Tracked Subscriptions"
                data={advancedData.subscriptions.sort((a,b) => b.nextBillingDate.getTime() - a.nextBillingDate.getTime())}
                columns={subscriptionColumns}
                rowKeyExtractor={(item) => item.id}
                searchableKeys={['merchantName', 'category', 'notes']}
                filterOptions={filterOptions}
                emptyMessage="No recurring subscriptions tracked."
                actions={(item) => (
                    <div className="flex gap-2">
                        <button onClick={() => handleEditSubscription(item)} className="btn btn-xs btn-info">Edit</button>
                        <button onClick={() => handleDeleteSubscription(item.id)} className="btn btn-xs btn-error">Delete</button>
                    </div>
                )}
            />

            {isSubscriptionModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setIsSubscriptionModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700 p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold text-white mb-4">{editingSubscription ? 'Edit Subscription' : 'Add New Subscription'}</h3>
                        <form onSubmit={handleSubmit(onSubmitSubscription)} className="space-y-4">
                            <label className="form-control">
                                <span className="label-text text-gray-300">Linked Card</span>
                                <select name="cardId" value={values.cardId} onChange={handleChange} className="select select-bordered bg-gray-700 text-white border-gray-600">
                                    <option value="">Select a Card</option>
                                    {corporateCards.map(card => (
                                        <option key={card.id} value={card.id}>{card.holderName} (...{card.cardNumberMask})</option>
                                    ))}
                                </select>
                                {errors.cardId && <p className="text-error text-sm mt-1">{errors.cardId}</p>}
                            </label>
                            <label className="form-control">
                                <span className="label-text text-gray-300">Merchant Name</span>
                                <input type="text" name="merchantName" value={values.merchantName} onChange={handleChange} placeholder="e.g., Zoom Inc." className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                {errors.merchantName && <p className="text-error text-sm mt-1">{errors.merchantName}</p>}
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="form-control">
                                    <span className="label-text text-gray-300">Amount ({formatCurrency(values.amount, values.currency)})</span>
                                    <input type="number" min="1" step="0.01" name="amount" value={values.amount} onChange={handleChange} className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                    {errors.amount && <p className="text-error text-sm mt-1">{errors.amount}</p>}
                                </label>
                                <label className="form-control">
                                    <span className="label-text text-gray-300">Billing Cycle</span>
                                    <select name="billingCycle" value={values.billingCycle} onChange={handleChange} className="select select-bordered bg-gray-700 text-white border-gray-600">
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="annually">Annually</option>
                                    </select>
                                </label>
                                <label className="form-control">
                                    <span className="label-text text-gray-300">Next Billing Date</span>
                                    <input type="date" name="nextBillingDate" value={new Date(values.nextBillingDate).toISOString().split('T')[0]} onChange={handleChange} className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                    {errors.nextBillingDate && <p className="text-error text-sm mt-1">{errors.nextBillingDate}</p>}
                                </label>
                                <label className="form-control">
                                    <span className="label-text text-gray-300">Status</span>
                                    <select name="status" value={values.status} onChange={handleChange} className="select select-bordered bg-gray-700 text-white border-gray-600">
                                        <option value="active">Active</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="paused">Paused</option>
                                    </select>
                                </label>
                            </div>
                            <label className="form-control">
                                <span className="label-text text-gray-300">Category</span>
                                <input type="text" name="category" value={values.category} onChange={handleChange} placeholder="e.g., Software, Marketing" className="input input-bordered bg-gray-700 text-white border-gray-600" />
                            </label>
                            <label className="form-control">
                                <span className="label-text text-gray-300">Notes (Optional)</span>
                                <textarea name="notes" value={values.notes} onChange={handleChange} placeholder="Any specific details about this subscription." className="textarea textarea-bordered bg-gray-700 text-white border-gray-600"></textarea>
                            </label>

                            <div className="modal-action">
                                <button type="button" className="btn btn-ghost" onClick={() => setIsSubscriptionModalOpen(false)} disabled={isSubmitting || isSaving}>Cancel</button>
                                <button type="submit" className="btn btn-cyan" disabled={isSubmitting || isSaving}>
                                    {(isSubmitting || isSaving) && <span className="loading loading-spinner"></span>}
                                    {editingSubscription ? 'Update Subscription' : 'Add Subscription'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Card>
    );
};


export const BudgetAllocationView: React.FC = () => {
    const advancedContext = useContext(AdvancedCardContext);
    const dataContext = useContext(DataContext);
    if (!advancedContext || !dataContext) throw new Error("BudgetAllocationView must be within AdvancedCardProvider and DataProvider");

    const { data: advancedData, actions: advancedActions } = advancedContext;
    const { corporateCards } = dataContext;

    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const initialBudgetFormState: Omit<Budget, 'id' | 'allocatedAmount' | 'spentAmount'> = {
        name: '',
        period: 'monthly',
        totalAmount: 5000,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Default to 1 month ahead
        cardsLinked: [],
        departmentId: 'dept-1', // Default
        projectId: '',
    };

    const {
        values,
        setValues,
        errors,
        handleChange,
        handleSubmit,
        isSubmitting
    } = useFormValidation(editingBudget ? { ...editingBudget, startDate: new Date(editingBudget.startDate), endDate: new Date(editingBudget.endDate) } : initialBudgetFormState, (vals) => {
        const newErrors: FormValidationState = {};
        if (!vals.name) newErrors.name = 'Budget name is required.';
        if (!vals.totalAmount || vals.totalAmount <= 0) newErrors.totalAmount = 'Total amount must be positive.';
        if (new Date(vals.endDate).getTime() <= new Date(vals.startDate).getTime()) newErrors.endDate = 'End date must be after start date.';
        return newErrors;
    });

    useEffect(() => {
        if (editingBudget) {
            setValues({ ...editingBudget, startDate: new Date(editingBudget.startDate), endDate: new Date(editingBudget.endDate) });
        } else {
            setValues(initialBudgetFormState);
        }
    }, [editingBudget]);

    const onSubmitBudget = async (formValues: Omit<Budget, 'id' | 'allocatedAmount' | 'spentAmount'> & { allocatedAmount?: number; spentAmount?: number }) => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        const finalValues = {
            ...formValues,
            startDate: new Date(formValues.startDate),
            endDate: new Date(formValues.endDate),
            allocatedAmount: editingBudget?.allocatedAmount ?? 0, // Preserve or initialize
            spentAmount: editingBudget?.spentAmount ?? 0, // Preserve or initialize
        };
        if (editingBudget) {
            advancedActions.updateBudget(editingBudget.id, finalValues);
        } else {
            advancedActions.addBudget(finalValues);
        }
        setIsSaving(false);
        setIsBudgetModalOpen(false);
        setEditingBudget(null);
        setValues(initialBudgetFormState);
        alert(`Budget ${editingBudget ? 'updated' : 'created'} successfully!`);
    };

    const handleEditBudget = (budget: Budget) => {
        setEditingBudget(budget);
        setIsBudgetModalOpen(true);
    };

    const handleDeleteBudget = async (id: string) => {
        if (!confirm('Are you sure you want to delete this budget? All linked cards will be unlinked.')) return;
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        advancedActions.deleteBudget(id);
        setIsSaving(false);
        alert('Budget deleted.');
    };

    const budgetColumns = useMemo(() => [
        { header: 'Name', accessor: 'name' },
        { header: 'Period', accessor: (b: Budget) => capitalizeFirstLetter(b.period) },
        { header: 'Total Amount', accessor: (b: Budget) => formatCurrency(b.totalAmount) },
        { header: 'Allocated', accessor: (b: Budget) => formatCurrency(b.allocatedAmount) },
        { header: 'Spent', accessor: (b: Budget) => formatCurrency(b.spentAmount) },
        { header: 'Remaining', accessor: (b: Budget) => formatCurrency(b.allocatedAmount - b.spentAmount) },
        { header: 'Cards Linked', accessor: (b: Budget) => (
            <span className="badge badge-outline badge-info">{b.cardsLinked.length}</span>
        ) },
        { header: 'End Date', accessor: (b: Budget) => formatDate(new Date(b.endDate), { year: 'numeric', month: 'short', day: 'numeric' }) },
    ], []);

    const filterOptions = {
        period: {
            label: 'Period',
            options: [
                { value: 'monthly', label: 'Monthly' },
                { value: 'quarterly', label: 'Quarterly' },
                { value: 'annually', label: 'Annually' },
            ]
        },
        departmentId: {
            label: 'Department',
            options: Array.from(new Set(MOCK_CARDHOLDERS.map(h => h.role))).map(role => ({ value: `dept-${role.toLowerCase().replace(' ', '-')}`, label: role }))
        }
    };

    return (
        <Card title="Budget Allocation">
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-300">Create and manage budgets, allocate funds to cards, and track spending against targets.</p>
                <button onClick={() => { setEditingBudget(null); setIsBudgetModalOpen(true); }} className="btn btn-cyan">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    New Budget
                </button>
            </div>

            <PaginatedTable
                title="All Configured Budgets"
                data={advancedData.budgets.sort((a,b) => b.endDate.getTime() - a.endDate.getTime())}
                columns={budgetColumns}
                rowKeyExtractor={(item) => item.id}
                searchableKeys={['name', 'departmentId', 'projectId']}
                filterOptions={filterOptions}
                emptyMessage="No budgets configured."
                actions={(item) => (
                    <div className="flex gap-2">
                        <button onClick={() => handleEditBudget(item)} className="btn btn-xs btn-info">Edit</button>
                        <button onClick={() => handleDeleteBudget(item.id)} className="btn btn-xs btn-error">Delete</button>
                    </div>
                )}
            />

            {isBudgetModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setIsBudgetModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700 p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold text-white mb-4">{editingBudget ? 'Edit Budget' : 'Create New Budget'}</h3>
                        <form onSubmit={handleSubmit(onSubmitBudget)} className="space-y-4">
                            <label className="form-control">
                                <span className="label-text text-gray-300">Budget Name</span>
                                <input type="text" name="name" value={values.name} onChange={handleChange} placeholder="e.g., Marketing Q4 2024 Budget" className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                {errors.name && <p className="text-error text-sm mt-1">{errors.name}</p>}
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="form-control">
                                    <span className="label-text text-gray-300">Total Amount ({formatCurrency(values.totalAmount)})</span>
                                    <input type="number" min="100" step="100" name="totalAmount" value={values.totalAmount} onChange={handleChange} className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                    {errors.totalAmount && <p className="text-error text-sm mt-1">{errors.totalAmount}</p>}
                                </label>
                                <label className="form-control">
                                    <span className="label-text text-gray-300">Budget Period</span>
                                    <select name="period" value={values.period} onChange={handleChange} className="select select-bordered bg-gray-700 text-white border-gray-600">
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="annually">Annually</option>
                                    </select>
                                </label>
                                <label className="form-control">
                                    <span className="label-text text-gray-300">Start Date</span>
                                    <input type="date" name="startDate" value={new Date(values.startDate).toISOString().split('T')[0]} onChange={e => setValues(prev => ({ ...prev, startDate: new Date(e.target.value) }))} className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                </label>
                                <label className="form-control">
                                    <span className="label-text text-gray-300">End Date</span>
                                    <input type="date" name="endDate" value={new Date(values.endDate).toISOString().split('T')[0]} onChange={e => setValues(prev => ({ ...prev, endDate: new Date(e.target.value) }))} className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                    {errors.endDate && <p className="text-error text-sm mt-1">{errors.endDate}</p>}
                                </label>
                            </div>
                            <label className="form-control">
                                <span className="label-text text-gray-300">Department (Optional)</span>
                                <select name="departmentId" value={values.departmentId} onChange={handleChange} className="select select-bordered bg-gray-700 text-white border-gray-600">
                                    <option value="">None</option>
                                    {Array.from(new Set(MOCK_CARDHOLDERS.map(h => h.role))).map(role => (
                                        <option key={`dept-${role.toLowerCase().replace(' ', '-')}`} value={`dept-${role.toLowerCase().replace(' ', '-')}`}>{role}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="form-control">
                                <span className="label-text text-gray-300">Project (Optional)</span>
                                <input type="text" name="projectId" value={values.projectId || ''} onChange={handleChange} placeholder="e.g., Project Falcon" className="input input-bordered bg-gray-700 text-white border-gray-600" />
                            </label>

                            <label className="form-control">
                                <span className="label-text text-gray-300">Link Cards to this Budget (Optional)</span>
                                <select multiple name="cardsLinked" value={values.cardsLinked || []}
                                    onChange={e => {
                                        const options = Array.from(e.target.options);
                                        const value = options.filter(option => option.selected).map(option => option.value);
                                        setValues(prev => ({ ...prev, cardsLinked: value }));
                                    }}
                                    className="select select-bordered bg-gray-700 text-white border-gray-600 h-24"
                                >
                                    {corporateCards.map(card => (
                                        <option key={card.id} value={card.id}>{card.holderName} (...{card.cardNumberMask})</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Cards linked here will draw from and track against this budget.</p>
                            </label>

                            <div className="modal-action">
                                <button type="button" className="btn btn-ghost" onClick={() => setIsBudgetModalOpen(false)} disabled={isSubmitting || isSaving}>Cancel</button>
                                <button type="submit" className="btn btn-cyan" disabled={isSubmitting || isSaving}>
                                    {(isSubmitting || isSaving) && <span className="loading loading-spinner"></span>}
                                    {editingBudget ? 'Update Budget' : 'Create Budget'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Card>
    );
};

export const APISettingsPanel: React.FC = () => {
    const advancedContext = useContext(AdvancedCardContext);
    if (!advancedContext) throw new Error("APISettingsPanel must be within AdvancedCardProvider");

    const { data: advancedData, actions: advancedActions } = advancedContext;

    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [editingSetting, setEditingSetting] = useState<APISetting | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const initialAPISettingFormState: APISetting = {
        id: '', name: '', description: '', apiKey: '', endpoint: '', isActive: true, lastAccessed: new Date(),
        apiSecret: '', allowedIPs: [], webhookUrl: '', eventsSubscribed: [],
    };

    const {
        values,
        setValues,
        errors,
        handleChange,
        handleSubmit,
        isSubmitting
    } = useFormValidation(editingSetting || initialAPISettingFormState, (vals) => {
        const newErrors: FormValidationState = {};
        if (!vals.name) newErrors.name = 'Integration name is required.';
        if (!vals.apiKey) newErrors.apiKey = 'API Key is required.';
        if (!vals.endpoint) newErrors.endpoint = 'API Endpoint is required.';
        return newErrors;
    });

    useEffect(() => {
        setValues(editingSetting || initialAPISettingFormState);
    }, [editingSetting]);

    const onSubmitAPISetting = async (formValues: APISetting) => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        // In a real app, API secret would be handled securely and likely not re-sent from frontend
        advancedActions.updateAPISetting(formValues.id, formValues);
        setIsSaving(false);
        setIsSettingsModalOpen(false);
        setEditingSetting(null);
        setValues(initialAPISettingFormState);
        alert(`API Setting for ${formValues.name} updated successfully!`);
    };

    const handleEditSetting = (setting: APISetting) => {
        setEditingSetting(setting);
        setIsSettingsModalOpen(true);
    };

    const apiSettingsColumns = useMemo(() => [
        { header: 'Integration Name', accessor: 'name' },
        { header: 'Endpoint', accessor: 'endpoint' },
        { header: 'API Key (Masked)', accessor: (s: APISetting) => `****${s.apiKey.slice(-4)}` },
        { header: 'Status', accessor: (s: APISetting) => (
            <span className={`badge ${s.isActive ? 'badge-success' : 'badge-warning'}`}>{s.isActive ? 'Active' : 'Inactive'}</span>
        )},
        { header: 'Last Accessed', accessor: (s: APISetting) => formatDate(new Date(s.lastAccessed)) },
    ], []);

    return (
        <Card title="API & Webhook Settings">
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-300">Configure and manage third-party integrations, API keys, and webhooks.</p>
                {/* For this mock, we only allow editing existing ones, not creating new from scratch to simplify form values */}
                <button className="btn btn-neutral btn-outline" disabled>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Add New Integration
                </button>
            </div>

            <PaginatedTable
                title="Configured Integrations"
                data={advancedData.apiSettings}
                columns={apiSettingsColumns}
                rowKeyExtractor={(item) => item.id}
                searchableKeys={['name', 'endpoint']}
                emptyMessage="No API integrations configured."
                actions={(item) => (
                    <div className="flex gap-2">
                        <button onClick={() => handleEditSetting(item)} className="btn btn-xs btn-info">Edit</button>
                    </div>
                )}
            />

            {isSettingsModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setIsSettingsModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700 p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold text-white mb-4">Edit API Setting: {editingSetting?.name}</h3>
                        <form onSubmit={handleSubmit(onSubmitAPISetting)} className="space-y-4">
                            <label className="form-control">
                                <span className="label-text text-gray-300">Integration Name</span>
                                <input type="text" name="name" value={values.name} onChange={handleChange} placeholder="e.g., Expenseify ERP" className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                {errors.name && <p className="text-error text-sm mt-1">{errors.name}</p>}
                            </label>
                            <label className="form-control">
                                <span className="label-text text-gray-300">Description</span>
                                <textarea name="description" value={values.description} onChange={handleChange} placeholder="Details about this integration." className="textarea textarea-bordered bg-gray-700 text-white border-gray-600"></textarea>
                            </label>
                            <label className="form-control">
                                <span className="label-text text-gray-300">API Endpoint</span>
                                <input type="url" name="endpoint" value={values.endpoint} onChange={handleChange} placeholder="https://api.external.com/v1" className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                {errors.endpoint && <p className="text-error text-sm mt-1">{errors.endpoint}</p>}
                            </label>
                            <label className="form-control">
                                <span className="label-text text-gray-300">API Key</span>
                                <input type="text" name="apiKey" value={values.apiKey} onChange={handleChange} placeholder="Your API Key" className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                {errors.apiKey && <p className="text-error text-sm mt-1">{errors.apiKey}</p>}
                            </label>
                            <label className="form-control">
                                <span className="label-text text-gray-300">API Secret (optional, usually kept server-side)</span>
                                <input type="password" name="apiSecret" value={values.apiSecret || ''} onChange={handleChange} placeholder="Hidden" className="input input-bordered bg-gray-700 text-white border-gray-600" />
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="form-control flex items-center justify-between flex-row pt-8">
                                    <span className="label-text text-gray-300">Is Active</span>
                                    <input type="checkbox" name="isActive" checked={values.isActive} onChange={handleChange} className="toggle toggle-cyan" />
                                </label>
                                <label className="form-control">
                                    <span className="label-text text-gray-300">Webhook URL (Optional)</span>
                                    <input type="url" name="webhookUrl" value={values.webhookUrl || ''} onChange={handleChange} placeholder="https://your-app.com/webhook" className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                </label>
                            </div>

                            <label className="form-control">
                                <span className="label-text text-gray-300">Allowed IP Addresses (comma-separated)</span>
                                <input type="text" name="allowedIPs" value={values.allowedIPs?.join(',') || ''} onChange={e => setValues(prev => ({ ...prev, allowedIPs: e.target.value.split(',').map(ip => ip.trim()).filter(Boolean) }))} placeholder="e.g., 192.168.1.1, 10.0.0.5" className="input input-bordered bg-gray-700 text-white border-gray-600" />
                            </label>
                            <label className="form-control">
                                <span className="label-text text-gray-300">Events Subscribed (comma-separated)</span>
                                <input type="text" name="eventsSubscribed" value={values.eventsSubscribed?.join(',') || ''} onChange={e => setValues(prev => ({ ...prev, eventsSubscribed: e.target.value.split(',').map(event => event.trim()).filter(Boolean) }))} placeholder="e.g., transaction.created, card.frozen" className="input input-bordered bg-gray-700 text-white border-gray-600" />
                            </label>

                            <div className="modal-action">
                                <button type="button" className="btn btn-ghost" onClick={() => setIsSettingsModalOpen(false)} disabled={isSubmitting || isSaving}>Cancel</button>
                                <button type="submit" className="btn btn-cyan" disabled={isSubmitting || isSaving}>
                                    {(isSubmitting || isSaving) && <span className="loading loading-spinner"></span>}
                                    Update Settings
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Card>
    );
};


export const ComplianceReportsView: React.FC = () => {
    const advancedContext = useContext(AdvancedCardContext);
    if (!advancedContext) throw new Error("ComplianceReportsView must be within AdvancedCardProvider");

    const { data: advancedData, actions: advancedActions } = advancedContext;

    const [isReportGeneratorOpen, setIsReportGeneratorOpen] = useState(false);
    const [generatingReport, setGeneratingReport] = useState(false);
    const [reportGenParams, setReportGenParams] = useState({
        reportType: 'spending_policy_adherence',
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        policyId: '',
        department: '',
    });

    const handleGenerateReport = async () => {
        setGeneratingReport(true);
        const newReport = await advancedActions.generateComplianceReport(reportGenParams);
        setGeneratingReport(false);
        setIsReportGeneratorOpen(false);
        alert(`Report '${newReport.name}' generated successfully!`);
    };

    const reportColumns = useMemo(() => [
        { header: 'Report Name', accessor: 'name' },
        { header: 'Type', accessor: (r: ComplianceReport) => capitalizeFirstLetter(r.reportType.replace(/_/g, ' ')) },
        { header: 'Generated By', accessor: (r: ComplianceReport) => MOCK_CARDHOLDERS.find(u => u.id === r.generatedBy)?.name || 'System' },
        { header: 'Period', accessor: (r: ComplianceReport) => `${formatDate(new Date(r.startDate), { month: 'short', day: 'numeric' })} - ${formatDate(new Date(r.endDate), { month: 'short', day: 'numeric' })}` },
        { header: 'Generated Date', accessor: (r: ComplianceReport) => formatDate(new Date(r.generatedDate)) },
        { header: 'Status', accessor: (r: ComplianceReport) => (
            <span className={`badge ${
                r.status === 'completed' ? 'badge-success' :
                r.status === 'pending' ? 'badge-info' : 'badge-error'
            }`}>
                {capitalizeFirstLetter(r.status)}
            </span>
        )},
    ], []);

    const filterOptions = {
        reportType: {
            label: 'Report Type',
            options: [
                { value: 'spending_policy_adherence', label: 'Spending Policy Adherence' },
                { value: 'transaction_audits', label: 'Transaction Audits' },
                { value: 'user_activity', label: 'User Activity' },
                { value: 'financial_reconciliation', label: 'Financial Reconciliation' },
            ]
        },
        status: {
            label: 'Status',
            options: [
                { value: 'completed', label: 'Completed' },
                { value: 'pending', label: 'Pending' },
                { value: 'failed', label: 'Failed' },
            ]
        }
    };

    return (
        <Card title="Compliance & Audit Reports">
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-300">Generate detailed reports to ensure compliance with internal policies and external regulations.</p>
                <button onClick={() => setIsReportGeneratorOpen(true)} className="btn btn-cyan">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Generate New Report
                </button>
            </div>

            <PaginatedTable
                title="Historical Reports"
                data={advancedData.complianceReports.sort((a,b) => b.generatedDate.getTime() - a.generatedDate.getTime())}
                columns={reportColumns}
                rowKeyExtractor={(item) => item.id}
                searchableKeys={['name', 'reportType', 'generatedBy']}
                filterOptions={filterOptions}
                emptyMessage="No compliance reports have been generated yet."
                actions={(item) => (
                    item.downloadUrl ? (
                        <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-outline btn-info">Download</a>
                    ) : (
                        <span className="text-gray-500 text-xs">N/A</span>
                    )
                )}
            />

            {isReportGeneratorOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setIsReportGeneratorOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-xl w-full border border-gray-700 p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold text-white mb-4">Generate New Compliance Report</h3>
                        <form onSubmit={(e) => { e.preventDefault(); handleGenerateReport(); }} className="space-y-4">
                            <label className="form-control">
                                <span className="label-text text-gray-300">Report Type</span>
                                <select name="reportType" value={reportGenParams.reportType} onChange={e => setReportGenParams(prev => ({ ...prev, reportType: e.target.value as ComplianceReport['reportType'] }))} className="select select-bordered bg-gray-700 text-white border-gray-600">
                                    <option value="spending_policy_adherence">Spending Policy Adherence</option>
                                    <option value="transaction_audits">Transaction Audits</option>
                                    <option value="user_activity">User Activity</option>
                                    <option value="financial_reconciliation">Financial Reconciliation</option>
                                </select>
                            </label>
                            <label className="form-control">
                                <span className="label-text text-gray-300">Start Date</span>
                                <input type="date" name="startDate" value={reportGenParams.startDate} onChange={e => setReportGenParams(prev => ({ ...prev, startDate: e.target.value }))} className="input input-bordered bg-gray-700 text-white border-gray-600" />
                            </label>
                            <label className="form-control">
                                <span className="label-text text-gray-300">End Date</span>
                                <input type="date" name="endDate" value={reportGenParams.endDate} onChange={e => setReportGenParams(prev => ({ ...prev, endDate: e.target.value }))} className="input input-bordered bg-gray-700 text-white border-gray-600" />
                            </label>

                            {reportGenParams.reportType === 'spending_policy_adherence' && (
                                <label className="form-control">
                                    <span className="label-text text-gray-300">Specific Policy (Optional)</span>
                                    <select name="policyId" value={reportGenParams.policyId} onChange={e => setReportGenParams(prev => ({ ...prev, policyId: e.target.value }))} className="select select-bordered bg-gray-700 text-white border-gray-600">
                                        <option value="">All Policies</option>
                                        {advancedData.policyRules.map(policy => (
                                            <option key={policy.id} value={policy.id}>{policy.name}</option>
                                        ))}
                                    </select>
                                </label>
                            )}
                            {reportGenParams.reportType === 'transaction_audits' && (
                                <label className="form-control">
                                    <span className="label-text text-gray-300">Department (Optional)</span>
                                    <input type="text" name="department" value={reportGenParams.department} onChange={e => setReportGenParams(prev => ({ ...prev, department: e.target.value }))} placeholder="e.g., Sales" className="input input-bordered bg-gray-700 text-white border-gray-600" />
                                </label>
                            )}

                            <div className="modal-action">
                                <button type="button" className="btn btn-ghost" onClick={() => setIsReportGeneratorOpen(false)} disabled={generatingReport}>Cancel</button>
                                <button type="submit" className="btn btn-cyan" disabled={generatingReport}>
                                    {generatingReport && <span className="loading loading-spinner"></span>}
                                    Generate Report
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Card>
    );
};

export const StatementGenerationView: React.FC = () => {
    const advancedContext = useContext(AdvancedCardContext);
    const dataContext = useContext(DataContext);
    if (!advancedContext || !dataContext) throw new Error("StatementGenerationView must be within AdvancedCardProvider and DataProvider");

    const { data: advancedData, actions: advancedActions } = advancedContext;
    const { corporateCards } = dataContext;

    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [generatingStatement, setGeneratingStatement] = useState(false);
    const [statementGenParams, setStatementGenParams] = useState({
        cardId: corporateCards[0]?.id || '',
        month: new Date().getMonth() + 1, // Current month
        year: new Date().getFullYear(),
    });

    const handleGenerateStatement = async () => {
        setGeneratingStatement(true);
        const newStatement = await advancedActions.generateStatement(statementGenParams.cardId, statementGenParams.month, statementGenParams.year);
        setGeneratingStatement(false);
        setIsGenerateModalOpen(false);
        alert(`Statement for card ${newStatement.cardId} (${newStatement.statementDate.getMonth()+1}/${newStatement.statementDate.getFullYear()}) generated successfully!`);
    };

    const statementColumns = useMemo(() => [
        { header: 'Card Holder', accessor: (s: Statement) => corporateCards.find(c => c.id === s.cardId)?.holderName || 'N/A' },
        { header: 'Card Number', accessor: (s: Statement) => corporateCards.find(c => c.id === s.cardId)?.cardNumberMask || 'N/A' },
        { header: 'Statement Date', accessor: (s: Statement) => formatDate(new Date(s.statementDate), { year: 'numeric', month: 'short', day: 'numeric' }) },
        { header: 'Period', accessor: (s: Statement) => `${formatDate(new Date(s.startDate), { month: 'short', day: 'numeric' })} - ${formatDate(new Date(s.endDate), { month: 'short', day: 'numeric' })}` },
        { header: 'Total Spent', accessor: (s: Statement) => formatCurrency(s.totalSpent) },
        { header: 'Closing Balance', accessor: (s: Statement) => formatCurrency(s.closingBalance) },
        { header: 'Status', accessor: (s: Statement) => (
            <span className={`badge ${
                s.status === 'generated' ? 'badge-info' :
                s.status === 'reviewed' ? 'badge-primary' : 'badge-success'
            }`}>
                {capitalizeFirstLetter(s.status)}
            </span>
        )},
    ], [corporateCards]);

    const filterOptions = {
        status: {
            label: 'Status',
            options: [
                { value: 'generated', label: 'Generated' },
                { value: 'reviewed', label: 'Reviewed' },
                { value: 'approved', label: 'Approved' },
            ]
        },
        cardId: {
            label: 'Card Holder',
            options: corporateCards.map(card => ({ value: card.id, label: card.holderName }))
        }
    };

    const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(0, i).toLocaleString('en-US', { month: 'long' }) }));
    const years = Array.from({ length: 3 }, (_, i) => ({ value: new Date().getFullYear() - i, label: String(new Date().getFullYear() - i) }));

    return (
        <Card title="Statement Generation">
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-300">Generate monthly statements for individual corporate cards.</p>
                <button onClick={() => setIsGenerateModalOpen(true)} className="btn btn-cyan">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Generate New Statement
                </button>
            </div>

            <PaginatedTable
                title="Historical Statements"
                data={advancedData.statements.sort((a,b) => b.statementDate.getTime() - a.statementDate.getTime())}
                columns={statementColumns}
                rowKeyExtractor={(item) => item.id}
                searchableKeys={['id']} // Can improve by searching holderName but need to map
                filterOptions={filterOptions}
                emptyMessage="No statements have been generated yet."
                actions={(item) => (
                    <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-outline btn-info">Download</a>
                )}
            />

            {isGenerateModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setIsGenerateModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-xl w-full border border-gray-700 p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-semibold text-white mb-4">Generate Card Statement</h3>
                        <form onSubmit={(e) => { e.preventDefault(); handleGenerateStatement(); }} className="space-y-4">
                            <label className="form-control">
                                <span className="label-text text-gray-300">Select Card</span>
                                <select name="cardId" value={statementGenParams.cardId} onChange={e => setStatementGenParams(prev => ({ ...prev, cardId: e.target.value }))} className="select select-bordered bg-gray-700 text-white border-gray-600">
                                    <option value="">Select a card</option>
                                    {corporateCards.map(card => (
                                        <option key={card.id} value={card.id}>{card.holderName} (...{card.cardNumberMask})</option>
                                    ))}
                                </select>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="form-control">
                                    <span className="label-text text-gray-300">Month</span>
                                    <select name="month" value={statementGenParams.month} onChange={e => setStatementGenParams(prev => ({ ...prev, month: +e.target.value }))} className="select select-bordered bg-gray-700 text-white border-gray-600">
                                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                    </select>
                                </label>
                                <label className="form-control">
                                    <span className="label-text text-gray-300">Year</span>
                                    <select name="year" value={statementGenParams.year} onChange={e => setStatementGenParams(prev => ({ ...prev, year: +e.target.value }))} className="select select-bordered bg-gray-700 text-white border-gray-600">
                                        {years.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                                    </select>
                                </label>
                            </div>
                            <div className="modal-action">
                                <button type="button" className="btn btn-ghost" onClick={() => setIsGenerateModalOpen(false)} disabled={generatingStatement}>Cancel</button>
                                <button type="submit" className="btn btn-cyan" disabled={generatingStatement || !statementGenParams.cardId}>
                                    {generatingStatement && <span className="loading loading-spinner"></span>}
                                    Generate Statement
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Card>
    );
};

export const AppGeneralSettingsPanel: React.FC = () => {
    const advancedContext = useContext(AdvancedCardContext);
    if (!advancedContext) throw new Error("AppGeneralSettingsPanel must be within AdvancedCardProvider");

    const { data: advancedData, actions: advancedActions } = advancedContext;
    const [isSaving, setIsSaving] = useState(false);

    const initialConfigState: AppConfig = advancedData.appConfig;

    const {
        values,
        setValues,
        errors,
        handleChange,
        handleSubmit,
        isSubmitting
    } = useFormValidation(initialConfigState, (vals) => {
        const newErrors: FormValidationState = {};
        if (!vals.defaultCurrency) newErrors.defaultCurrency = 'Default currency is required.';
        if (vals.auditLogRetentionDays <= 0) newErrors.auditLogRetentionDays = 'Retention days must be positive.';
        return newErrors;
    });

    useEffect(() => {
        setValues(advancedData.appConfig);
    }, [advancedData.appConfig]);

    const onSubmitConfig = async (formValues: AppConfig) => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        advancedActions.updateAppConfig(formValues);
        setIsSaving(false);
        alert('Application settings updated successfully!');
    };

    return (
        <Card title="Application General Settings">
            <p className="text-gray-300 mb-6">Configure global settings for the corporate card management application.</p>
            <form onSubmit={handleSubmit(onSubmitConfig)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="form-control">
                        <span className="label-text text-gray-300">Default Currency</span>
                        <select name="defaultCurrency" value={values.defaultCurrency} onChange={handleChange} className="select select-bordered bg-gray-700 text-white border-gray-600">
                            <option value="USD">USD - United States Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="CAD">CAD - Canadian Dollar</option>
                            <option value="AUD">AUD - Australian Dollar</option>
                        </select>
                        {errors.defaultCurrency && <p className="text-error text-sm mt-1">{errors.defaultCurrency}</p>}
                    </label>
                    <label className="form-control">
                        <span className="label-text text-gray-300">Audit Log Retention (Days)</span>
                        <input type="number" name="auditLogRetentionDays" min="30" max="730" step="30" value={values.auditLogRetentionDays} onChange={handleChange} className="input input-bordered bg-gray-700 text-white border-gray-600" />
                        {errors.auditLogRetentionDays && <p className="text-error text-sm mt-1">{errors.auditLogRetentionDays}</p>}
                    </label>
                    <label className="form-control">
                        <span className="label-text text-gray-300">Card Request Approval Workflow</span>
                        <select name="cardRequestApprovalWorkflow" value={values.cardRequestApprovalWorkflow} onChange={handleChange} className="select select-bordered bg-gray-700 text-white border-gray-600">
                            <option value="single_approver">Single Approver</option>
                            <option value="multi_approver">Multi-level Approval</option>
                            <option value="auto_approve">Auto-Approve (for low-value)</option>
                        </select>
                    </label>
                    <label className="form-control">
                        <span className="label-text text-gray-300">Max Virtual Cards Per User</span>
                        <input type="number" name="maxVirtualCardsPerUser" min="1" max="100" step="1" value={values.maxVirtualCardsPerUser} onChange={handleChange} className="input input-bordered bg-gray-700 text-white border-gray-600" />
                    </label>
                    <label className="flex items-center justify-between col-span-1 md:col-span-2 p-3 bg-gray-700 rounded-md">
                        <span className="text-sm text-gray-300">Enable Multi-Factor Authentication (MFA)</span>
                        <input type="checkbox" name="enableMultiFactorAuthentication" checked={values.enableMultiFactorAuthentication} onChange={handleChange} className="toggle toggle-cyan" />
                    </label>
                </div>
                <div className="mt-8">
                    <button
                        type="submit"
                        className={`btn btn-cyan w-full ${isSaving ? 'btn-disabled' : ''}`}
                        disabled={isSaving || isSubmitting}
                    >
                        {isSaving && <span className="loading loading-spinner"></span>}
                        Save Global Settings
                    </button>
                </div>
            </form>
        </Card>
    );
};

// --- END: NEW EXPORTED COMPONENTS ---

// Main CardManagementView component
const CardManagementView: React.FC = () => {
    const context = useContext(DataContext);
    const advancedContext = useContext(AdvancedCardContext);

    if (!context || !advancedContext) throw new Error("CardManagementView must be within a DataProvider and AdvancedCardProvider");

    const { corporateCards, toggleCorporateCardFreeze, updateCorporateCardControls } = context;
    const { data: advancedData, actions: advancedActions } = advancedContext;

    const [selectedCardIdForModal, setSelectedCardIdForModal] = useState<string | null>(null);

    // This state and function are lifted to here to control the visibility of the modal
    // It's called from within the JSX loop for each card
    const openCardDetailModal = useCallback((card: CorporateCard) => {
        setSelectedCardIdForModal(card.id);
    }, []);

    const closeCardDetailModal = useCallback(() => {
        setSelectedCardIdForModal(null);
    }, []);

    // Memoize chart data to avoid recalculations on every render
    const chartData = useMemo(() => {
        return corporateCards.map(card => ({
            name: card.holderName.split(' ')[0],
            spent: card.balance, // Assuming balance is spent amount for simplicity in this chart
            limit: card.limit,
        }));
    }, [corporateCards]);

    // This is the card detail modal, now controlled by the parent view.
    const CardDetailModalComponent: React.FC = () => {
        const selected = useMemo(() => {
            return corporateCards.find(card => card.id === selectedCardIdForModal) || null;
        }, [selectedCardIdForModal, corporateCards]);

        if (!selected || !selectedCardIdForModal) return null;

        const [controls, setControls] = useState<CorporateCardControls>(selected.controls);

        const handleSave = () => {
            updateCorporateCardControls(selected.id, controls);