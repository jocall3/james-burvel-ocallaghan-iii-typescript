import React, { useContext, useMemo, useState, useEffect, useCallback, createContext } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { FunnelChart, Funnel, Tooltip, ResponsiveContainer, LabelList, PieChart, Pie, Cell, BarChart, XAxis, YAxis, Bar, Legend, CartesianGrid, LineChart, Line } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import type { SalesDeal } from '../../../../types';

// New Imports for richer UI and functionality
import { ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon, PlusIcon, TrashIcon, PencilSquareIcon, ChartBarIcon, ListBulletIcon, DocumentTextIcon, Cog8ToothIcon, ClockIcon, UserIcon, CalendarDaysIcon, TagIcon, CurrencyDollarIcon, FunnelIcon, PuzzlePieceIcon, RocketLaunchIcon, TrophyIcon, XMarkIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Modal from '../../../Modal'; // Assuming a generic Modal component exists
import Input from '../../../Input'; // Assuming a generic Input component exists
import Select from '../../../Select'; // Assuming a generic Select component exists
import Button from '../../../Button'; // Assuming a generic Button component exists
import DatePicker from 'react-datepicker'; // Assuming a date picker library, e.g., react-datepicker
import 'react-datepicker/dist/react-datepicker.css';
import { format, parseISO, isBefore, subDays, addDays } from 'date-fns';

// --- Start of New Type Definitions (for extended functionality) ---

/**
 * @typedef {Object} SalesContact
 * @property {string} id - Unique identifier for the contact.
 * @property {string} name - Full name of the contact.
 * @property {string} email - Email address of the contact.
 * @property {string} phone - Phone number of the contact.
 * @property {string} title - Job title of the contact.
 * @property {string} company - Company the contact belongs to (could be different from deal company).
 */
export type SalesContact = {
    id: string;
    name: string;
    email: string;
    phone: string;
    title: string;
    company: string;
};

/**
 * @typedef {Object} ActivityLogEntry
 * @property {string} id - Unique identifier for the activity.
 * @property {'call' | 'email' | 'meeting' | 'note' | 'task' | 'stage_change'} type - Type of activity.
 * @property {string} description - Detailed description of the activity.
 * @property {Date} timestamp - When the activity occurred.
 * @property {string} createdBy - User who logged the activity.
 * @property {Date} [dueDate] - Optional due date for tasks.
 * @property {boolean} [isCompleted] - Optional completion status for tasks.
 */
export type ActivityLogEntry = {
    id: string;
    type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'stage_change';
    description: string;
    timestamp: Date;
    createdBy: string;
    dueDate?: Date;
    isCompleted?: boolean;
};

/**
 * @typedef {Object} SalesDealExtended - An extended SalesDeal type with more details.
 * @property {string} id - Unique identifier for the deal.
 * @property {string} name - Name of the deal.
 * @property {number} value - Monetary value of the deal.
 * @property {string} stage - Current stage of the deal (e.g., 'Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost').
 * @property {string} status - Overall status of the deal ('Open', 'Closed Won', 'Closed Lost').
 * @property {string} company - Company associated with the deal.
 * @property {string} industry - Industry of the client company.
 * @property {string} ownerId - ID of the sales rep owning the deal.
 * @property {Date} createdAt - Timestamp when the deal was created.
 * @property {Date} expectedCloseDate - Expected date for the deal to close.
 * @property {string} leadSource - How the lead was acquired (e.g., 'Website', 'Referral', 'Cold Call', 'Event').
 * @property {string[]} productsServices - List of products/services involved in the deal.
 * @property {SalesContact[]} contacts - Key contacts for this deal.
 * @property {ActivityLogEntry[]} activityLog - A chronological log of all interactions and updates for this deal.
 * @property {string} [lossReason] - Reason if the deal was 'Closed Lost'.
 * @property {number} [probability] - Manual probability estimate for closing.
 * @property {string} [nextSteps] - Short description of the immediate next steps.
 * @property {number} aiProbability - AI-predicted probability to close.
 * @property {string} aiRiskAssessment - AI-predicted risk level ('Low', 'Medium', 'High').
 * @property {string[]} aiSuggestedActions - AI-suggested actions to improve close probability.
 * @property {number} [forecastCategory] - A numeric representation of forecast category (e.g., 1-5).
 */
export type SalesDealExtended = SalesDeal & {
    company: string;
    industry: string;
    ownerId: string;
    createdAt: Date;
    expectedCloseDate: Date;
    leadSource: string;
    productsServices: string[];
    contacts: SalesContact[];
    activityLog: ActivityLogEntry[];
    lossReason?: string;
    probability?: number;
    nextSteps?: string;
    aiProbability?: number | null; // AI-predicted probability
    aiRiskAssessment?: string; // AI-predicted risk level
    aiSuggestedActions?: string[]; // AI-suggested actions
    forecastCategory?: number; // e.g., 1-5 for Commit, Best Case, Pipeline
};

/**
 * @typedef {Object} SalesTeamMember
 * @property {string} id - Unique ID of the team member.
 * @property {string} name - Full name of the team member.
 * @property {string} email - Email of the team member.
 * @property {string} role - Role within the sales team (e.g., 'Account Executive', 'Sales Manager').
 * @property {string} avatarUrl - URL to their avatar image.
 */
export type SalesTeamMember = {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl: string;
};

/**
 * @typedef {Object} DashboardSettings
 * @property {boolean} showAiInsights - Whether to show AI insights by default.
 * @property {string} defaultView - Default view for deals ('table' | 'cards').
 * @property {number} itemsPerPage - Number of deals to show per page.
 * @property {string[]} visibleColumns - Which columns are visible in the table view.
 */
export type DashboardSettings = {
    showAiInsights: boolean;
    defaultView: 'table' | 'cards';
    itemsPerPage: number;
    visibleColumns: string[];
};

// --- End of New Type Definitions ---

// --- Start of Mock Data Generation (for demonstration) ---

const MOCK_SALES_TEAM: SalesTeamMember[] = [
    { id: 'usr-001', name: 'Alice Johnson', email: 'alice@example.com', role: 'Account Executive', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
    { id: 'usr-002', name: 'Bob Smith', email: 'bob@example.com', role: 'Account Executive', avatarUrl: 'https://i.pravatar.cc/150?img=2' },
    { id: 'usr-003', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Sales Manager', avatarUrl: 'https://i.pravatar.cc/150?img=3' },
    { id: 'usr-004', name: 'Diana Prince', email: 'diana@example.com', role: 'Account Executive', avatarUrl: 'https://i.pravatar.cc/150?img=4' },
];

const MOCK_COMPANIES = [
    'Tech Innovators Inc.', 'Global Solutions Co.', 'Pioneer Analytics', 'Quantum Leap Ltd.', 'Nexus Systems',
    'Apex Technologies', 'Bright Future Corp.', 'Dynamic Ventures', 'Elite Innovations', 'Fusion Dynamics',
    'Grand Scale Enterprises', 'Horizon Group', 'Infinite Edge', 'Junction Point', 'Keystone Labs',
    'Luminous Logic', 'Momentum Labs', 'Nova Solutions', 'Optimal Outcomes', 'Prime Innovations'
];

const MOCK_INDUSTRIES = [
    'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 'Logistics', 'Energy', 'Automotive'
];

const MOCK_PRODUCTS_SERVICES = [
    'Cloud Hosting', 'Custom Software Development', 'Data Analytics Platform', 'Cybersecurity Suite',
    'IT Consulting', 'Managed Services', 'Enterprise AI', 'Digital Marketing Package', 'Hardware Integration'
];

const MOCK_LEAD_SOURCES = [
    'Website', 'Referral', 'Cold Call', 'Event', 'Partner', 'Social Media', 'Webinar', 'Advertisement'
];

const MOCK_LOSS_REASONS = [
    'Budget Constraints', 'Competitor Won', 'No Decision', 'Lack of Features', 'Poor Fit', 'Timing Issues'
];

const generateRandomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateMockActivity = (dealId: string, createdBy: string, createdAt: Date): ActivityLogEntry[] => {
    const activities: ActivityLogEntry[] = [];
    const numActivities = Math.floor(Math.random() * 5) + 1; // 1 to 5 activities

    for (let i = 0; i < numActivities; i++) {
        const typeOptions: ActivityLogEntry['type'][] = ['call', 'email', 'meeting', 'note', 'task'];
        const type = typeOptions[Math.floor(Math.random() * typeOptions.length)];
        const timestamp = generateRandomDate(createdAt, addDays(createdAt, 30 * i)); // Spaced out activities

        let description = '';
        switch (type) {
            case 'call': description = `Called client to discuss next steps.`; break;
            case 'email': description = `Sent follow-up email with proposal summary.`; break;
            case 'meeting': description = `Had a discovery meeting with key stakeholders.`; break;
            case 'note': description = `Client expressed interest in feature X.`; break;
            case 'task': description = `Prepare revised proposal for review.`; break;
        }

        activities.push({
            id: `act-${dealId}-${i}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            description,
            timestamp,
            createdBy,
            dueDate: type === 'task' ? addDays(timestamp, Math.floor(Math.random() * 7)) : undefined,
            isCompleted: type === 'task' ? Math.random() > 0.5 : undefined,
        });
    }
    return activities.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

/**
 * Generates a realistic mock SalesDealExtended object.
 * @param {number} index - Index to help generate unique IDs.
 * @returns {SalesDealExtended} A mock sales deal.
 */
export const generateMockSalesDeal = (index: number): SalesDealExtended => {
    const id = `deal-${index + 1}-${Math.random().toString(36).substr(2, 9)}`;
    const name = `Project ${MOCK_COMPANIES[index % MOCK_COMPANIES.length]} - ${MOCK_PRODUCTS_SERVICES[Math.floor(Math.random() * MOCK_PRODUCTS_SERVICES.length)]}`;
    const value = Math.floor(Math.random() * (250000 - 5000) + 5000); // $5k - $250k
    const stages: SalesDeal['stage'][] = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
    const statusOptions: SalesDeal['status'][] = ['Open', 'Closed Won', 'Closed Lost'];

    const owner = MOCK_SALES_TEAM[Math.floor(Math.random() * MOCK_SALES_TEAM.length)];
    const createdAt = generateRandomDate(subDays(new Date(), 365), subDays(new Date(), 30));
    const expectedCloseDate = generateRandomDate(addDays(createdAt, 30), addDays(createdAt, 180));

    let stage: SalesDeal['stage'] = stages[Math.floor(Math.random() * stages.length)];
    let status: SalesDeal['status'] = 'Open';
    let lossReason: string | undefined;

    if (stage === 'Closed Won') {
        status = 'Closed Won';
    } else if (stage === 'Closed Lost') {
        status = 'Closed Lost';
        lossReason = MOCK_LOSS_REASONS[Math.floor(Math.random() * MOCK_LOSS_REASONS.length)];
    } else {
        // For open deals, adjust stage distribution
        const openStages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation'];
        stage = openStages[Math.floor(Math.random() * openStages.length)];
    }

    const productsServices = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () =>
        MOCK_PRODUCTS_SERVICES[Math.floor(Math.random() * MOCK_PRODUCTS_SERVICES.length)]
    );

    const contacts: SalesContact[] = [
        {
            id: `con-${id}-1`,
            name: `${owner.name.split(' ')[0]} Contact`,
            email: `contact${index}@${MOCK_COMPANIES[index % MOCK_COMPANIES.length].toLowerCase().replace(/\s/g, '')}.com`,
            phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
            title: Math.random() > 0.5 ? 'CTO' : 'Head of Procurement',
            company: MOCK_COMPANIES[index % MOCK_COMPANIES.length]
        }
    ];

    const activityLog = generateMockActivity(id, owner.name, createdAt);

    return {
        id,
        name,
        value,
        stage,
        status,
        company: MOCK_COMPANIES[index % MOCK_COMPANIES.length],
        industry: MOCK_INDUSTRIES[Math.floor(Math.random() * MOCK_INDUSTRIES.length)],
        ownerId: owner.id,
        createdAt,
        expectedCloseDate,
        leadSource: MOCK_LEAD_SOURCES[Math.floor(Math.random() * MOCK_LEAD_SOURCES.length)],
        productsServices,
        contacts,
        activityLog,
        lossReason,
        probability: stage === 'Closed Won' ? 100 : (stage === 'Closed Lost' ? 0 : Math.floor(Math.random() * 90) + 10), // Manual probability
        nextSteps: Math.random() > 0.3 ? `Follow up on proposal by ${format(addDays(new Date(), Math.floor(Math.random() * 7)), 'MMM dd')}` : undefined,
        aiProbability: Math.random() > 0.5 ? Math.floor(Math.random() * 95) + 5 : undefined,
        aiRiskAssessment: Math.random() > 0.6 ? (Math.random() > 0.5 ? 'High' : 'Medium') : 'Low',
        aiSuggestedActions: Math.random() > 0.4 ? ['Schedule demo of new feature', 'Send case study relevant to industry'] : undefined,
        forecastCategory: Math.floor(Math.random() * 5) + 1, // 1 to 5
    };
};

/**
 * Generates a specified number of mock sales deals.
 * @param {number} count - The number of deals to generate.
 * @returns {SalesDealExtended[]} An array of mock sales deals.
 */
export const generateMockSalesDeals = (count: number): SalesDealExtended[] => {
    return Array.from({ length: count }, (_, i) => generateMockSalesDeal(i));
};

// --- End of Mock Data Generation ---

// --- Start of Utility Functions ---

/**
 * Formats a number to a currency string.
 * @param {number} value - The number to format.
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

/**
 * Formats a date object into a human-readable string.
 * @param {Date | string} dateInput - The date object or string to format.
 * @param {string} formatStr - The format string (e.g., 'MMM dd, yyyy').
 * @returns {string} The formatted date string.
 */
export const formatDate = (dateInput: Date | string | null | undefined, formatStr: string = 'MMM dd, yyyy'): string => {
    if (!dateInput) return 'N/A';
    try {
        const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
        return format(date, formatStr);
    } catch (e) {
        console.error("Error formatting date:", e);
        return 'Invalid Date';
    }
};

/**
 * Calculates the number of days between two dates.
 * @param {Date | string} date1 - The first date.
 * @param {Date | string} date2 - The second date.
 * @returns {number} The number of days.
 */
export const getDaysBetween = (date1: Date | string, date2: Date | string): number => {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * A debounce function to limit the rate at which a function can fire.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
export const debounce = <T extends (...args: any[]) => any>(func: T, delay: number) => {
    let timeout: NodeJS.Timeout;
    return function (this: any, ...args: Parameters<T>) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    } as T;
};

/**
 * Provides a simplified Toast notification system.
 */
export const useToast = () => {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; id: string } | null>(null);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Date.now().toString();
        setToast({ message, type, id });
        setTimeout(() => {
            setToast(prev => (prev?.id === id ? null : prev));
        }, 3000); // Hide after 3 seconds
    }, []);

    const ToastComponent: React.FC = () => {
        if (!toast) return null;

        const baseClasses = "fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white flex items-center gap-2 z-50 transition-all duration-300 ease-out transform";
        let typeClasses = "";
        let IconComponent = InformationCircleIcon;

        switch (toast.type) {
            case 'success':
                typeClasses = "bg-green-600";
                IconComponent = CheckCircleIcon;
                break;
            case 'error':
                typeClasses = "bg-red-600";
                IconComponent = XMarkIcon;
                break;
            case 'info':
            default:
                typeClasses = "bg-blue-600";
                IconComponent = InformationCircleIcon;
                break;
        }

        return (
            <div className={`${baseClasses} ${typeClasses}`}>
                <IconComponent className="h-6 w-6" />
                <span>{toast.message}</span>
                <button onClick={() => setToast(null)} className="ml-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors">
                    <XMarkIcon className="h-4 w-4" />
                </button>
            </div>
        );
    };

    return { showToast, ToastComponent };
};

// --- End of Utility Functions ---

// --- Start of New Component Definitions ---

/**
 * Props for the SalesFilterBar component.
 * @typedef {Object} SalesFilterBarProps
 * @property {string} searchTerm - The current search term.
 * @property {(term: string) => void} onSearchChange - Callback for search term changes.
 * @property {string} selectedStage - The currently selected stage filter.
 * @property {(stage: string) => void} onStageChange - Callback for stage filter changes.
 * @property {string} selectedOwnerId - The currently selected owner filter ID.
 * @property {(ownerId: string) => void} onOwnerChange - Callback for owner filter changes.
 * @property {Date | null} startDate - The selected start date for filtering.
 * @property {(date: Date | null) => void} onStartDateChange - Callback for start date changes.
 * @property {Date | null} endDate - The selected end date for filtering.
 * @property {(date: Date | null) => void} onEndDateChange - Callback for end date changes.
 * @property {SalesTeamMember[]} teamMembers - List of available sales team members.
 * @property {string} currentView - The currently active view ('pipeline', 'list', 'analytics', 'settings').
 * @property {(view: string) => void} onViewChange - Callback to change the active view.
 * @property {string} sortBy - Current sorting key.
 * @property {(key: string) => void} onSortChange - Callback for sort key changes.
 * @property {'asc' | 'desc'} sortOrder - Current sort order.
 * @property {(order: 'asc' | 'desc') => void} onSortOrderChange - Callback for sort order changes.
 */
export type SalesFilterBarProps = {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    selectedStage: string;
    onStageChange: (stage: string) => void;
    selectedOwnerId: string;
    onOwnerChange: (ownerId: string) => void;
    startDate: Date | null;
    onStartDateChange: (date: Date | null) => void;
    endDate: Date | null;
    onEndDateChange: (date: Date | null) => void;
    teamMembers: SalesTeamMember[];
    currentView: string;
    onViewChange: (view: string) => void;
    sortBy: string;
    onSortChange: (key: string) => void;
    sortOrder: 'asc' | 'desc';
    onSortOrderChange: (order: 'asc' | 'desc') => void;
};

/**
 * SalesFilterBar component provides UI for filtering, searching, and sorting sales deals.
 * It also includes a view switcher for different dashboard layouts.
 * @param {SalesFilterBarProps} props - The properties for the component.
 * @returns {React.FC} The SalesFilterBar component.
 */
export const SalesFilterBar: React.FC<SalesFilterBarProps> = React.memo(({
    searchTerm, onSearchChange, selectedStage, onStageChange, selectedOwnerId, onOwnerChange,
    startDate, onStartDateChange, endDate, onEndDateChange, teamMembers,
    currentView, onViewChange, sortBy, onSortChange, sortOrder, onSortOrderChange
}) => {
    const stageOptions = [{ value: '', label: 'All Stages' }, ...['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'].map(s => ({ value: s, label: s }))];
    const ownerOptions = [{ value: '', label: 'All Owners' }, ...teamMembers.map(t => ({ value: t.id, label: t.name }))];
    const sortOptions = [
        { value: 'name', label: 'Deal Name' },
        { value: 'value', label: 'Value' },
        { value: 'stage', label: 'Stage' },
        { value: 'expectedCloseDate', label: 'Close Date' },
        { value: 'createdAt', label: 'Created At' },
    ];

    const debouncedSearch = useMemo(() => debounce(onSearchChange, 300), [onSearchChange]);

    return (
        <Card className="p-4 bg-gray-800/70 rounded-lg shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Search Input */}
                <div className="relative flex-grow min-w-0 lg:w-1/4">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search deals..."
                        value={searchTerm}
                        onChange={(e) => debouncedSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 lg:w-3/4 justify-end">
                    <Select
                        label="Stage"
                        value={selectedStage}
                        onChange={(e) => onStageChange(e.target.value)}
                        options={stageOptions}
                        className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Select
                        label="Owner"
                        value={selectedOwnerId}
                        onChange={(e) => onOwnerChange(e.target.value)}
                        options={ownerOptions}
                        className="bg-gray-700 border-gray-600 text-white"
                    />
                    <div className="flex items-center gap-2">
                        <label className="text-gray-400 text-sm whitespace-nowrap hidden sm:block">Close Date:</label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date: Date | null) => onStartDateChange(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            placeholderText="Start Date"
                            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white w-32 focus:ring-cyan-500 focus:border-cyan-500"
                            dateFormat="MMM dd, yyyy"
                            isClearable
                        />
                        <span className="text-gray-400">-</span>
                        <DatePicker
                            selected={endDate}
                            onChange={(date: Date | null) => onEndDateChange(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            placeholderText="End Date"
                            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white w-32 focus:ring-cyan-500 focus:border-cyan-500"
                            dateFormat="MMM dd, yyyy"
                            isClearable
                        />
                    </div>
                </div>
            </div>

            {/* Sort and View Switcher */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2">
                    <Select
                        label="Sort By"
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value)}
                        options={sortOptions}
                        className="bg-gray-700 border-gray-600 text-white w-36"
                    />
                    <Button onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')} className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg">
                        {sortOrder === 'asc' ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                    </Button>
                </div>

                {/* View Switcher */}
                <div className="flex bg-gray-700 rounded-lg p-1">
                    <Button
                        onClick={() => onViewChange('pipeline')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'pipeline' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                        title="Pipeline View"
                    >
                        <FunnelIcon className="h-5 w-5 inline-block mr-1" /> Pipeline
                    </Button>
                    <Button
                        onClick={() => onViewChange('list')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'list' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                        title="List View"
                    >
                        <ListBulletIcon className="h-5 w-5 inline-block mr-1" /> List
                    </Button>
                    <Button
                        onClick={() => onViewChange('analytics')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'analytics' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                        title="Analytics Dashboard"
                    >
                        <ChartBarIcon className="h-5 w-5 inline-block mr-1" /> Analytics
                    </Button>
                    <Button
                        onClick={() => onViewChange('settings')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentView === 'settings' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
                        title="Dashboard Settings"
                    >
                        <Cog8ToothIcon className="h-5 w-5 inline-block mr-1" /> Settings
                    </Button>
                </div>
            </div>
        </Card>
    );
});

/**
 * Props for the SalesDealTable component.
 * @typedef {Object} SalesDealTableProps
 * @property {SalesDealExtended[]} deals - Array of sales deals to display.
 * @property {(deal: SalesDealExtended) => void} onDealClick - Callback when a deal row is clicked.
 * @property {string[]} visibleColumns - Array of column keys to show.
 * @property {(dealId: string) => void} onDeleteDeal - Callback to delete a deal.
 * @property {SalesTeamMember[]} teamMembers - List of sales team members for displaying owner names.
 */
export type SalesDealTableProps = {
    deals: SalesDealExtended[];
    onDealClick: (deal: SalesDealExtended) => void;
    visibleColumns: string[];
    onDeleteDeal: (dealId: string) => void;
    teamMembers: SalesTeamMember[];
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    totalDeals: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSortChange: (key: string) => void;
    onSortOrderChange: (order: 'asc' | 'desc') => void;
};

/**
 * SalesDealTable component displays a paginated and sortable table of sales deals.
 * @param {SalesDealTableProps} props - The properties for the component.
 * @returns {React.FC} The SalesDealTable component.
 */
export const SalesDealTable: React.FC<SalesDealTableProps> = React.memo(({
    deals, onDealClick, visibleColumns, onDeleteDeal, teamMembers,
    currentPage, itemsPerPage, onPageChange, totalDeals,
    sortBy, sortOrder, onSortChange, onSortOrderChange
}) => {
    const totalPages = Math.ceil(totalDeals / itemsPerPage);

    const getOwnerName = (ownerId: string) => teamMembers.find(m => m.id === ownerId)?.name || 'N/A';

    const renderColumn = (deal: SalesDealExtended, column: string) => {
        switch (column) {
            case 'name': return <span className="font-semibold text-white">{deal.name}</span>;
            case 'company': return <span className="text-gray-300">{deal.company}</span>;
            case 'value': return <span className="text-cyan-300">{formatCurrency(deal.value)}</span>;
            case 'stage':
                let stageColor = '';
                switch (deal.stage) {
                    case 'Prospecting': stageColor = 'bg-blue-600'; break;
                    case 'Qualification': stageColor = 'bg-indigo-600'; break;
                    case 'Proposal': stageColor = 'bg-purple-600'; break;
                    case 'Negotiation': stageColor = 'bg-yellow-600'; break;
                    case 'Closed Won': stageColor = 'bg-green-600'; break;
                    case 'Closed Lost': stageColor = 'bg-red-600'; break;
                    default: stageColor = 'bg-gray-600'; break;
                }
                return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageColor} text-white`}>{deal.stage}</span>;
            case 'owner': return <span className="text-gray-400">{getOwnerName(deal.ownerId)}</span>;
            case 'expectedCloseDate': return <span className="text-gray-400">{formatDate(deal.expectedCloseDate)}</span>;
            case 'createdAt': return <span className="text-gray-500 text-xs">{formatDate(deal.createdAt, 'MM/dd/yy')}</span>;
            case 'leadSource': return <span className="text-gray-400">{deal.leadSource}</span>;
            case 'status':
                let statusColor = '';
                switch (deal.status) {
                    case 'Open': statusColor = 'text-blue-400'; break;
                    case 'Closed Won': statusColor = 'text-green-400'; break;
                    case 'Closed Lost': statusColor = 'text-red-400'; break;
                    default: statusColor = 'text-gray-400'; break;
                }
                return <span className={`font-medium ${statusColor}`}>{deal.status}</span>;
            default: return <span className="text-gray-400">{String((deal as any)[column])}</span>; // Fallback
        }
    };

    const headers: { key: string; label: string; width: string; sortable: boolean }[] = [
        { key: 'name', label: 'Deal Name', width: 'w-2/6', sortable: true },
        { key: 'company', label: 'Company', width: 'w-1/6', sortable: false },
        { key: 'value', label: 'Value', width: 'w-1/6', sortable: true },
        { key: 'stage', label: 'Stage', width: 'w-1/6', sortable: true },
        { key: 'owner', label: 'Owner', width: 'w-1/6', sortable: false },
        { key: 'expectedCloseDate', label: 'Close Date', width: 'w-1/6', sortable: true },
        { key: 'createdAt', label: 'Created At', width: 'w-1/6', sortable: true },
        { key: 'leadSource', label: 'Lead Source', width: 'w-1/6', sortable: false },
        { key: 'status', label: 'Status', width: 'w-1/6', sortable: false },
    ];

    const visibleHeaders = headers.filter(h => visibleColumns.includes(h.key));

    const handleSortClick = (key: string) => {
        if (!key) return; // Ignore non-sortable columns
        if (sortBy === key) {
            onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            onSortChange(key);
            onSortOrderChange('asc');
        }
    };

    return (
        <Card title="All Sales Deals" className="overflow-hidden bg-gray-800/70">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            {visibleHeaders.map(header => (
                                <th
                                    key={header.key}
                                    scope="col"
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider ${header.sortable ? 'cursor-pointer hover:text-white transition-colors' : ''}`}
                                    onClick={() => header.sortable && handleSortClick(header.key)}
                                >
                                    <div className="flex items-center">
                                        {header.label}
                                        {sortBy === header.key && (
                                            sortOrder === 'asc' ? <ChevronUpIcon className="ml-1 h-4 w-4" /> : <ChevronDownIcon className="ml-1 h-4 w-4" />
                                        )}
                                    </div>
                                </th>
                            ))}
                            <th scope="col" className="relative px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {deals.length === 0 ? (
                            <tr>
                                <td colSpan={visibleHeaders.length + 1} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                    No deals found matching your criteria.
                                </td>
                            </tr>
                        ) : (
                            deals.map((deal) => (
                                <tr key={deal.id} className="hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => onDealClick(deal)}>
                                    {visibleHeaders.map(header => (
                                        <td key={`${deal.id}-${header.key}`} className="px-6 py-4 whitespace-nowrap text-sm">
                                            {renderColumn(deal, header.key)}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                onClick={(e) => { e.stopPropagation(); onDealClick(deal); }}
                                                className="text-cyan-400 hover:text-cyan-300 p-1 rounded-md hover:bg-gray-700"
                                                title="View/Edit Deal"
                                            >
                                                <PencilSquareIcon className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                onClick={(e) => { e.stopPropagation(); onDeleteDeal(deal.id); }}
                                                className="text-red-400 hover:text-red-300 p-1 rounded-md hover:bg-gray-700"
                                                title="Delete Deal"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center px-4 py-3 bg-gray-700/50 rounded-b-lg border-t border-gray-700">
                    <div className="text-sm text-gray-400">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalDeals)} of {totalDeals} deals
                    </div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <Button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-400 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <Button
                                key={page}
                                onClick={() => onPageChange(page)}
                                aria-current={currentPage === page ? 'page' : undefined}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-600 bg-gray-700 text-sm font-medium ${currentPage === page ? 'z-10 bg-cyan-600 text-white' : 'text-gray-400 hover:bg-gray-600'}`}
                            >
                                {page}
                            </Button>
                        ))}
                        <Button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-400 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </Button>
                    </nav>
                </div>
            )}
        </Card>
    );
});

/**
 * Props for the DealDetailModal component.
 * @typedef {Object} DealDetailModalProps
 * @property {SalesDealExtended | null} deal - The deal to display/edit, or null if modal is closed.
 * @property {(deal: SalesDealExtended) => void} onSave - Callback to save changes to the deal.
 * @property {() => void} onClose - Callback to close the modal.
 * @property {SalesTeamMember[]} teamMembers - List of sales team members.
 * @property {(deal: SalesDealExtended) => Promise<void>} getAiProbabilityForDeal - Function to fetch AI probability for a deal.
 * @property {boolean} isLoadingAi - Loading state for AI probability.
 * @property {number | null} aiProbability - The AI-predicted probability.
 * @property {(message: string, type?: 'success' | 'error' | 'info') => void} showToast - Function to display a toast notification.
 */
export type DealDetailModalProps = {
    deal: SalesDealExtended | null;
    onSave: (deal: SalesDealExtended) => void;
    onClose: () => void;
    teamMembers: SalesTeamMember[];
    getAiProbabilityForDeal: (deal: SalesDealExtended) => Promise<void>;
    isLoadingAi: boolean;
    aiProbability: number | null;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
};

/**
 * DealDetailModal component displays and allows editing of a sales deal's details.
 * It includes tabs for overview, activity log, notes, and contacts, and AI insights.
 * @param {DealDetailModalProps} props - The properties for the component.
 * @returns {React.FC} The DealDetailModal component.
 */
export const DealDetailModal: React.FC<DealDetailModalProps> = ({
    deal, onSave, onClose, teamMembers, getAiProbabilityForDeal, isLoadingAi, aiProbability, showToast
}) => {
    const [editedDeal, setEditedDeal] = useState<SalesDealExtended | null>(deal);
    const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'notes' | 'contacts' | 'ai'>('overview');
    const [newActivityDescription, setNewActivityDescription] = useState<string>('');
    const [newActivityType, setNewActivityType] = useState<ActivityLogEntry['type']>('note');

    useEffect(() => {
        setEditedDeal(deal);
        if (deal) {
            setActiveTab('overview'); // Reset to overview when a new deal is selected
        }
    }, [deal]);

    if (!deal || !editedDeal) return null; // Only render if a deal is provided

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedDeal(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleDateChange = (date: Date | null, field: keyof SalesDealExtended) => {
        setEditedDeal(prev => prev ? { ...prev, [field]: date } : null);
    };

    const handleSave = () => {
        if (editedDeal) {
            onSave(editedDeal);
            showToast('Deal updated successfully!', 'success');
        }
    };

    const handleAddActivity = () => {
        if (newActivityDescription.trim() === '') {
            showToast('Activity description cannot be empty.', 'error');
            return;
        }

        const newActivity: ActivityLogEntry = {
            id: `act-${editedDeal.id}-${Date.now()}`,
            type: newActivityType,
            description: newActivityDescription,
            timestamp: new Date(),
            createdBy: 'Current User (Mock)', // In a real app, this would be the logged-in user
        };

        setEditedDeal(prev => prev ? {
            ...prev,
            activityLog: [...prev.activityLog, newActivity].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        } : null);
        setNewActivityDescription('');
        setNewActivityType('note');
        showToast('Activity added!', 'success');
    };

    const getOwnerName = (ownerId: string) => teamMembers.find(m => m.id === ownerId)?.name || 'Unknown';

    const stageOptions = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
    const statusOptions = ['Open', 'Closed Won', 'Closed Lost'];
    const leadSourceOptions = MOCK_LEAD_SOURCES;
    const activityTypeOptions: { value: ActivityLogEntry['type'], label: string }[] = [
        { value: 'note', label: 'Note' },
        { value: 'call', label: 'Call' },
        { value: 'email', label: 'Email' },
        { value: 'meeting', label: 'Meeting' },
        { value: 'task', label: 'Task' },
        { value: 'stage_change', label: 'Stage Change' }, // Usually system-generated
    ];

    const aiRiskColor = (risk: string | undefined) => {
        switch (risk) {
            case 'Low': return 'text-green-400';
            case 'Medium': return 'text-yellow-400';
            case 'High': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <Modal isOpen={!!deal} onClose={onClose} title={`Deal Details: ${deal.name}`} size="lg">
            <div className="flex flex-col md:flex-row border-b border-gray-700">
                <div className="flex-none p-4 bg-gray-800/50 rounded-tl-lg md:rounded-bl-lg md:rounded-tr-none md:rounded-tl-lg overflow-x-auto">
                    <nav className="flex md:flex-col space-x-4 md:space-x-0 md:space-y-2">
                        <Button
                            onClick={() => setActiveTab('overview')}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'overview' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                        >
                            <DocumentTextIcon className="h-5 w-5 mr-2" /> Overview
                        </Button>
                        <Button
                            onClick={() => setActiveTab('activity')}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'activity' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                        >
                            <ClockIcon className="h-5 w-5 mr-2" /> Activity Log
                        </Button>
                        <Button
                            onClick={() => setActiveTab('notes')}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'notes' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                        >
                            <ListBulletIcon className="h-5 w-5 mr-2" /> Notes
                        </Button>
                        <Button
                            onClick={() => setActiveTab('contacts')}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'contacts' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                        >
                            <UserIcon className="h-5 w-5 mr-2" /> Contacts
                        </Button>
                        <Button
                            onClick={() => setActiveTab('ai')}
                            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'ai' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                        >
                            <PuzzlePieceIcon className="h-5 w-5 mr-2" /> AI Insights
                        </Button>
                    </nav>
                </div>

                <div className="flex-grow p-6 bg-gray-900 overflow-y-auto max-h-[70vh]">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-white mb-4">Deal Overview</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Deal Name" name="name" value={editedDeal.name} onChange={handleInputChange} />
                                <Input label="Company" name="company" value={editedDeal.company} onChange={handleInputChange} />
                                <Input label="Industry" name="industry" value={editedDeal.industry} onChange={handleInputChange} />
                                <Input label="Value" name="value" type="number" value={editedDeal.value} onChange={handleInputChange} prefix="$" />
                                <Select label="Stage" name="stage" value={editedDeal.stage} onChange={handleInputChange} options={stageOptions.map(s => ({ value: s, label: s }))} />
                                <Select label="Status" name="status" value={editedDeal.status} onChange={handleInputChange} options={statusOptions.map(s => ({ value: s, label: s }))} />
                                <Select label="Owner" name="ownerId" value={editedDeal.ownerId} onChange={handleInputChange} options={teamMembers.map(m => ({ value: m.id, label: m.name }))} />
                                <Select label="Lead Source" name="leadSource" value={editedDeal.leadSource} onChange={handleInputChange} options={leadSourceOptions.map(s => ({ value: s, label: s }))} />
                                <div>
                                    <label htmlFor="expectedCloseDate" className="block text-sm font-medium text-gray-300 mb-1">Expected Close Date</label>
                                    <DatePicker
                                        selected={editedDeal.expectedCloseDate}
                                        onChange={(date: Date | null) => handleDateChange(date, 'expectedCloseDate')}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                                        dateFormat="MMM dd, yyyy"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="createdAt" className="block text-sm font-medium text-gray-300 mb-1">Created At</label>
                                    <Input name="createdAt" value={formatDate(editedDeal.createdAt, 'MMM dd, yyyy HH:mm')} disabled />
                                </div>
                                <Input label="Probability (%)" name="probability" type="number" value={editedDeal.probability || ''} onChange={handleInputChange} min="0" max="100" />
                                <Input label="Next Steps" name="nextSteps" value={editedDeal.nextSteps || ''} onChange={handleInputChange} />
                            </div>
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-300 mb-1">Products/Services</label>
                                <div className="flex flex-wrap gap-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
                                    {editedDeal.productsServices.length > 0 ? (
                                        editedDeal.productsServices.map((product, index) => (
                                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-800 text-cyan-100">
                                                {product}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-500 text-sm">No products/services listed.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Activity Log Tab */}
                    {activeTab === 'activity' && (
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">Activity Log</h3>
                            <div className="space-y-4">
                                <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                                    <h4 className="text-lg font-medium text-white mb-2">Add New Activity</h4>
                                    <Select
                                        label="Activity Type"
                                        value={newActivityType}
                                        onChange={(e) => setNewActivityType(e.target.value as ActivityLogEntry['type'])}
                                        options={activityTypeOptions}
                                        className="mb-3 bg-gray-700 border-gray-600 text-white"
                                    />
                                    <textarea
                                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 resize-y min-h-[80px]"
                                        placeholder="Enter activity description..."
                                        value={newActivityDescription}
                                        onChange={(e) => setNewActivityDescription(e.target.value)}
                                    ></textarea>
                                    <Button onClick={handleAddActivity} className="mt-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                                        <PlusIcon className="h-5 w-5 mr-2" /> Add Activity
                                    </Button>
                                </div>

                                {editedDeal.activityLog.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">No activities logged for this deal.</div>
                                ) : (
                                    <ul className="space-y-4">
                                        {editedDeal.activityLog.map(activity => (
                                            <li key={activity.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700 flex flex-col sm:flex-row justify-between">
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-white flex items-center gap-2">
                                                        {activity.type === 'call' && <ClockIcon className="h-4 w-4 text-blue-400" />}
                                                        {activity.type === 'email' && <EnvelopeIcon className="h-4 w-4 text-purple-400" />}
                                                        {activity.type === 'meeting' && <CalendarDaysIcon className="h-4 w-4 text-green-400" />}
                                                        {activity.type === 'task' && <ClipboardDocumentCheckIcon className="h-4 w-4 text-yellow-400" />}
                                                        {activity.type === 'note' && <TagIcon className="h-4 w-4 text-gray-400" />}
                                                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                                                        <span className="text-sm text-gray-400 font-normal ml-2">by {activity.createdBy}</span>
                                                    </p>
                                                    <p className="text-gray-300 mt-1">{activity.description}</p>
                                                    {activity.dueDate && <p className="text-xs text-gray-500 mt-1">Due: {formatDate(activity.dueDate)}</p>}
                                                </div>
                                                <div className="flex-none text-right text-sm text-gray-500 mt-2 sm:mt-0">
                                                    {formatDate(activity.timestamp, 'MMM dd, yyyy hh:mm a')}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Notes Tab (could be a subset of activity log, or separate free-form notes) */}
                    {activeTab === 'notes' && (
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">Deal Notes</h3>
                            <div className="space-y-4">
                                <p className="text-gray-400">
                                    This section could be for general notes about the deal, distinct from chronological activities.
                                    For simplicity, we'll display 'note' type activities here.
                                </p>
                                {editedDeal.activityLog.filter(a => a.type === 'note').length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">No general notes for this deal.</div>
                                ) : (
                                    <ul className="space-y-3">
                                        {editedDeal.activityLog.filter(a => a.type === 'note').map(note => (
                                            <li key={note.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                                                <p className="font-semibold text-white">{note.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">Added by {note.createdBy} on {formatDate(note.timestamp, 'MMM dd, yyyy')}</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {/* A separate input for general notes, if desired */}
                                <div className="mt-4 border border-gray-700 rounded-lg p-4 bg-gray-800">
                                    <h4 className="text-lg font-medium text-white mb-2">Add General Note</h4>
                                    <textarea
                                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500 resize-y min-h-[80px]"
                                        placeholder="Enter a general note..."
                                        value={newActivityType === 'note' ? newActivityDescription : ''}
                                        onChange={(e) => { setNewActivityType('note'); setNewActivityDescription(e.target.value); }}
                                    ></textarea>
                                    <Button onClick={handleAddActivity} className="mt-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                                        <PlusIcon className="h-5 w-5 mr-2" /> Add Note
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contacts Tab */}
                    {activeTab === 'contacts' && (
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">Deal Contacts</h3>
                            {editedDeal.contacts.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No contacts associated with this deal.</div>
                            ) : (
                                <ul className="space-y-4">
                                    {editedDeal.contacts.map(contact => (
                                        <li key={contact.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                            <p className="font-semibold text-white">{contact.name}</p>
                                            <p className="text-sm text-gray-400">{contact.title} at {contact.company}</p>
                                            <p className="text-sm text-gray-400">Email: <a href={`mailto:${contact.email}`} className="text-cyan-400 hover:underline">{contact.email}</a></p>
                                            <p className="text-sm text-gray-400">Phone: {contact.phone}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                                <PlusIcon className="h-5 w-5 mr-2" /> Add Contact
                            </Button>
                        </div>
                    )}

                    {/* AI Insights Tab */}
                    {activeTab === 'ai' && (
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">AI-Powered Deal Insights</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-lg font-medium text-white">Probability to Close (AI)</p>
                                        <Button
                                            onClick={() => getAiProbabilityForDeal(editedDeal)}
                                            disabled={isLoadingAi}
                                            className="bg-cyan-700 hover:bg-cyan-800 text-white py-1 px-3 rounded-lg text-sm flex items-center"
                                        >
                                            {isLoadingAi ? (
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <RocketLaunchIcon className="h-4 w-4 mr-2" />
                                            )}
                                            {isLoadingAi ? 'Recalculating...' : 'Recalculate'}
                                        </Button>
                                    </div>
                                    <p className="text-4xl font-bold text-cyan-300">
                                        {isLoadingAi ? '...' : (aiProbability !== null ? `${aiProbability.toFixed(1)}%` : 'N/A')}
                                    </p>
                                </div>

                                <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                    <p className="text-lg font-medium text-white mb-2">AI Risk Assessment</p>
                                    <p className={`text-2xl font-bold ${aiRiskColor(editedDeal.aiRiskAssessment)}`}>
                                        {editedDeal.aiRiskAssessment || 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        The AI assesses potential risks based on deal stage, value, activity, and historical data.
                                    </p>
                                </div>

                                <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                    <p className="text-lg font-medium text-white mb-2">AI Suggested Next Actions</p>
                                    {editedDeal.aiSuggestedActions && editedDeal.aiSuggestedActions.length > 0 ? (
                                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                                            {editedDeal.aiSuggestedActions.map((action, index) => (
                                                <li key={index}>{action}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500">No specific actions suggested by AI at this moment.</p>
                                    )}
                                    <Button className="mt-4 bg-indigo-700 hover:bg-indigo-800 text-white py-1 px-3 rounded-lg text-sm flex items-center">
                                        <PlusIcon className="h-4 w-4 mr-2" /> Add to Tasks
                                    </Button>
                                </div>

                                <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                    <p className="text-lg font-medium text-white mb-2">AI-Generated Proposal Outline (Mock)</p>
                                    <p className="text-gray-300 text-sm italic">
                                        "Based on deal value and products: 'Project Scope: Comprehensive solution including Cloud Hosting and Custom Software Development. Key benefits for {editedDeal.company} include 30% cost reduction and 15% efficiency gain. Proposal includes 3-phase implementation, dedicated support, and 24/7 monitoring.'"
                                    </p>
                                    <Button className="mt-4 bg-green-700 hover:bg-green-800 text-white py-1 px-3 rounded-lg text-sm flex items-center">
                                        <DocumentTextIcon className="h-4 w-4 mr-2" /> Generate Full Proposal
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-end p-4 bg-gray-800/50 rounded-b-lg border-t border-gray-700">
                <Button onClick={onClose} className="mr-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold">Cancel</Button>
                <Button onClick={handleSave} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold">Save Changes</Button>
            </div>
        </Modal>
    );
};

/**
 * Props for the AddDealModal component.
 * @typedef {Object} AddDealModalProps
 * @property {boolean} isOpen - Whether the modal is open.
 * @property {() => void} onClose - Callback to close the modal.
 * @property {(deal: SalesDealExtended) => void} onAddDeal - Callback to add a new deal.
 * @property {SalesTeamMember[]} teamMembers - List of sales team members for owner selection.
 * @property {(message: string, type?: 'success' | 'error' | 'info') => void} showToast - Function to display a toast notification.
 */
export type AddDealModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onAddDeal: (deal: SalesDealExtended) => void;
    teamMembers: SalesTeamMember[];
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
};

/**
 * AddDealModal component provides a form for creating a new sales deal.
 * @param {AddDealModalProps} props - The properties for the component.
 * @returns {React.FC} The AddDealModal component.
 */
export const AddDealModal: React.FC<AddDealModalProps> = ({ isOpen, onClose, onAddDeal, teamMembers, showToast }) => {
    const [newDealData, setNewDealData] = useState<Partial<SalesDealExtended>>({
        name: '',
        value: 0,
        stage: 'Prospecting',
        status: 'Open',
        company: '',
        industry: '',
        ownerId: teamMembers.length > 0 ? teamMembers[0].id : '',
        expectedCloseDate: addDays(new Date(), 30),
        leadSource: 'Website',
        productsServices: [],
        contacts: [],
        activityLog: [],
        probability: 10,
        nextSteps: '',
    });

    useEffect(() => {
        if (isOpen) {
            // Reset form data when opening the modal
            setNewDealData({
                name: '',
                value: 0,
                stage: 'Prospecting',
                status: 'Open',
                company: '',
                industry: '',
                ownerId: teamMembers.length > 0 ? teamMembers[0].id : '',
                expectedCloseDate: addDays(new Date(), 30),
                leadSource: 'Website',
                productsServices: [],
                contacts: [],
                activityLog: [],
                probability: 10,
                nextSteps: '',
            });
        }
    }, [isOpen, teamMembers]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewDealData(prev => ({ ...prev, [name]: name === 'value' ? parseFloat(value) : value }));
    };

    const handleDateChange = (date: Date | null, field: keyof SalesDealExtended) => {
        setNewDealData(prev => ({ ...prev, [field]: date }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDealData.name || !newDealData.company || !newDealData.value || !newDealData.expectedCloseDate) {
            showToast('Please fill in all required fields (Name, Company, Value, Expected Close Date).', 'error');
            return;
        }

        const dealToSave: SalesDealExtended = {
            id: `deal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            ...newDealData,
            productsServices: newDealData.productsServices || [],
            contacts: newDealData.contacts || [],
            activityLog: newDealData.activityLog || [],
            value: newDealData.value || 0,
            stage: newDealData.stage || 'Prospecting',
            status: newDealData.status || 'Open',
            company: newDealData.company || 'N/A',
            industry: newDealData.industry || 'N/A',
            ownerId: newDealData.ownerId || (teamMembers.length > 0 ? teamMembers[0].id : 'N/A'),
            expectedCloseDate: newDealData.expectedCloseDate || addDays(new Date(), 30),
            leadSource: newDealData.leadSource || 'Website',
            name: newDealData.name,
        };

        onAddDeal(dealToSave);
        showToast('New deal added successfully!', 'success');
        onClose();
    };

    const stageOptions = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
    const statusOptions = ['Open', 'Closed Won', 'Closed Lost'];
    const leadSourceOptions = MOCK_LEAD_SOURCES;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Sales Deal" size="md">
            <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-gray-900 overflow-y-auto max-h-[70vh]">
                <Input label="Deal Name" name="name" value={newDealData.name || ''} onChange={handleInputChange} required />
                <Input label="Company" name="company" value={newDealData.company || ''} onChange={handleInputChange} required />
                <Input label="Industry" name="industry" value={newDealData.industry || ''} onChange={handleInputChange} />
                <Input label="Value" name="value" type="number" value={newDealData.value || 0} onChange={handleInputChange} prefix="$" required />
                <Select label="Stage" name="stage" value={newDealData.stage || 'Prospecting'} onChange={handleInputChange} options={stageOptions.map(s => ({ value: s, label: s }))} />
                <Select label="Status" name="status" value={newDealData.status || 'Open'} onChange={handleInputChange} options={statusOptions.map(s => ({ value: s, label: s }))} />
                <Select label="Owner" name="ownerId" value={newDealData.ownerId || (teamMembers.length > 0 ? teamMembers[0].id : '')} onChange={handleInputChange} options={teamMembers.map(m => ({ value: m.id, label: m.name }))} />
                <Select label="Lead Source" name="leadSource" value={newDealData.leadSource || 'Website'} onChange={handleInputChange} options={leadSourceOptions.map(s => ({ value: s, label: s }))} />
                <div>
                    <label htmlFor="expectedCloseDate" className="block text-sm font-medium text-gray-300 mb-1">Expected Close Date</label>
                    <DatePicker
                        selected={newDealData.expectedCloseDate}
                        onChange={(date: Date | null) => handleDateChange(date, 'expectedCloseDate')}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                        dateFormat="MMM dd, yyyy"
                        required
                    />
                </div>
                <Input label="Probability (%)" name="probability" type="number" value={newDealData.probability || ''} onChange={handleInputChange} min="0" max="100" />
                <Input label="Next Steps" name="nextSteps" value={newDealData.nextSteps || ''} onChange={handleInputChange} />

                <div className="flex justify-end pt-4 border-t border-gray-700">
                    <Button type="button" onClick={onClose} className="mr-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold">Cancel</Button>
                    <Button type="submit" className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold flex items-center">
                        <PlusIcon className="h-5 w-5 mr-2" /> Create Deal
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

/**
 * Props for the AnalyticsDashboard component.
 * @typedef {Object} AnalyticsDashboardProps
 * @property {SalesDealExtended[]} salesDeals - The array of all sales deals.
 * @property {SalesTeamMember[]} teamMembers - List of sales team members.
 */
export type AnalyticsDashboardProps = {
    salesDeals: SalesDealExtended[];
    teamMembers: SalesTeamMember[];
};

/**
 * AnalyticsDashboard component displays various charts and KPIs for sales performance.
 * @param {AnalyticsDashboardProps} props - The properties for the component.
 * @returns {React.FC} The AnalyticsDashboard component.
 */
export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ salesDeals, teamMembers }) => {
    // Sales Velocity Data
    const salesVelocityData = useMemo(() => {
        const dataMap = new Map<string, { won: number; created: number }>(); // month-year -> {won, created}

        salesDeals.forEach(deal => {
            const createdMonth = format(deal.createdAt, 'yyyy-MM');
            if (!dataMap.has(createdMonth)) dataMap.set(createdMonth, { won: 0, created: 0 });
            dataMap.get(createdMonth)!.created++;

            if (deal.status === 'Closed Won' && deal.activityLog.length > 0) {
                const closedActivity = deal.activityLog.find(a => a.type === 'stage_change' && a.description.includes('Closed Won'));
                if (closedActivity) {
                    const closedMonth = format(closedActivity.timestamp, 'yyyy-MM');
                    if (!dataMap.has(closedMonth)) dataMap.set(closedMonth, { won: 0, created: 0 });
                    dataMap.get(closedMonth)!.won++;
                } else {
                    // Fallback if no specific stage_change activity for 'Closed Won'
                    const closeDate = deal.expectedCloseDate || deal.createdAt; // Use expected close or creation date as a fallback
                    const closedMonth = format(closeDate, 'yyyy-MM');
                    if (!dataMap.has(closedMonth)) dataMap.set(closedMonth, { won: 0, created: 0 });
                    dataMap.get(closedMonth)!.won++;
                }
            }
        });

        return Array.from(dataMap.entries())
            .map(([month, { won, created }]) => ({ month: format(parseISO(`${month}-01`), 'MMM yy'), won, created }))
            .sort((a, b) => parseISO(`20${a.month.slice(4)}-${a.month.slice(0, 3)}`).getTime() - parseISO(`20${b.month.slice(4)}-${b.month.slice(0, 3)}`).getTime());
    }, [salesDeals]);

    // Win/Loss Reason Data
    const winLossReasonData = useMemo(() => {
        const lossReasons: { [key: string]: number } = {};
        salesDeals.filter(d => d.status === 'Closed Lost' && d.lossReason).forEach(deal => {
            lossReasons[deal.lossReason!] = (lossReasons[deal.lossReason!] || 0) + 1;
        });
        const totalLost = Object.values(lossReasons).reduce((sum, count) => sum + count, 0);
        return Object.entries(lossReasons).map(([name, value]) => ({
            name,
            value,
            percentage: totalLost > 0 ? (value / totalLost) * 100 : 0,
        }));
    }, [salesDeals]);

    // Sales Cycle Length Data
    const salesCycleLengthData = useMemo(() => {
        const cycleLengths: number[] = []; // in days
        salesDeals.filter(d => d.status === 'Closed Won').forEach(deal => {
            const createdAt = deal.createdAt;
            // Find the actual close date from activity log, or fallback to expectedCloseDate/now
            const closedActivity = deal.activityLog.find(a => a.type === 'stage_change' && a.description.includes('Closed Won'));
            const closeDate = closedActivity ? closedActivity.timestamp : deal.expectedCloseDate || new Date(); // Fallback if no specific closing activity

            const days = getDaysBetween(createdAt, closeDate);
            if (days >= 0) cycleLengths.push(days);
        });

        // Group into bins
        const bins = Array(5).fill(0); // e.g., <30, 30-60, 61-90, 91-180, >180 days
        cycleLengths.forEach(days => {
            if (days < 30) bins[0]++;
            else if (days <= 60) bins[1]++;
            else if (days <= 90) bins[2]++;
            else if (days <= 180) bins[3]++;
            else bins[4]++;
        });

        return [
            { name: '< 30 days', count: bins[0] },
            { name: '30-60 days', count: bins[1] },
            { name: '61-90 days', count: bins[2] },
            { name: '91-180 days', count: bins[3] },
            { name: '> 180 days', count: bins[4] },
        ];
    }, [salesDeals]);

    // Lead Source Analysis
    const leadSourceData = useMemo(() => {
        const sources: { [key: string]: number } = {};
        salesDeals.forEach(deal => {
            sources[deal.leadSource] = (sources[deal.leadSource] || 0) + 1;
        });
        return Object.entries(sources).map(([name, value]) => ({ name, value }));
    }, [salesDeals]);

    // Team Performance
    const teamPerformanceData = useMemo(() => {
        const performance: { [ownerId: string]: { wonValue: number; openValue: number; totalDeals: number } } = {};
        teamMembers.forEach(member => {
            performance[member.id] = { wonValue: 0, openValue: 0, totalDeals: 0 };
        });

        salesDeals.forEach(deal => {
            if (performance[deal.ownerId]) {
                performance[deal.ownerId].totalDeals++;
                if (deal.status === 'Closed Won') {
                    performance[deal.ownerId].wonValue += deal.value;
                } else if (deal.status === 'Open') {
                    performance[deal.ownerId].openValue += deal.value;
                }
            }
        });

        return teamMembers.map(member => ({
            name: member.name,
            'Won Value': performance[member.id]?.wonValue || 0,
            'Open Pipeline': performance[member.id]?.openValue || 0,
            'Total Deals': performance[member.id]?.totalDeals || 0,
        }));
    }, [salesDeals, teamMembers]);

    // KPI data (re-used from main view, potentially expanded)
    const totalPipelineValue = salesDeals.reduce((sum, d) => d.status !== 'Closed Won' ? sum + d.value : sum, 0);
    const closedWonDeals = salesDeals.filter(d => d.status === 'Closed Won');
    const totalClosedDeals = salesDeals.filter(d => d.status === 'Closed Won' || d.status === 'Closed Lost');
    const winRate = totalClosedDeals.length > 0 ? (closedWonDeals.length / totalClosedDeals.length) * 100 : 0;
    const avgDealSize = salesDeals.length > 0 ? salesDeals.reduce((sum, d) => sum + d.value, 0) / salesDeals.length : 0;
    const avgSalesCycleLength = salesDeals.filter(d => d.status === 'Closed Won').map(d => getDaysBetween(d.createdAt, d.expectedCloseDate || new Date())).reduce((sum, days) => sum + days, 0) / closedWonDeals.length;


    // Pie chart colors
    const PIE_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f97316', '#ef4444', '#a855f7', '#6366f1'];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Sales Analytics Dashboard</h2>

            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center p-5 bg-gray-800/70">
                    <p className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                        <CurrencyDollarIcon className="h-8 w-8 text-cyan-400" />
                        {formatCurrency(totalPipelineValue)}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Total Pipeline Value</p>
                </Card>
                <Card className="text-center p-5 bg-gray-800/70">
                    <p className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                        <TrophyIcon className="h-8 w-8 text-green-400" />
                        {winRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Overall Win Rate</p>
                </Card>
                <Card className="text-center p-5 bg-gray-800/70">
                    <p className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                        <CurrencyDollarIcon className="h-8 w-8 text-indigo-400" />
                        {formatCurrency(avgDealSize)}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Average Deal Size</p>
                </Card>
                <Card className="text-center p-5 bg-gray-800/70">
                    <p className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                        <CalendarDaysIcon className="h-8 w-8 text-yellow-400" />
                        {closedWonDeals.length > 0 ? avgSalesCycleLength.toFixed(0) : 'N/A'} days
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Avg. Sales Cycle Length</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Velocity Chart */}
                <Card title="Sales Velocity (Deals Created vs. Won Over Time)">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={salesVelocityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                            <XAxis dataKey="month" stroke="#cbd5e0" />
                            <YAxis stroke="#cbd5e0" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: '#a0aec0' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="created" stroke="#8884d8" name="Deals Created" strokeWidth={2} />
                            <Line type="monotone" dataKey="won" stroke="#82ca9d" name="Deals Won" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                {/* Win/Loss Reasons */}
                <Card title="Closed Lost Reasons Breakdown">
                    {winLossReasonData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={winLossReasonData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                                >
                                    {winLossReasonData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, name, props) => [`${props.payload.percentage.toFixed(1)}%`, name]}
                                    contentStyle={{ backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#a0aec0' }}
                                />
                                <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ color: '#a0aec0' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[250px] text-gray-500">
                            No 'Closed Lost' deals with specified reasons.
                        </div>
                    )}
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Cycle Length */}
                <Card title="Average Sales Cycle Length Distribution">
                    {salesCycleLengthData.length > 0 && salesCycleLengthData.some(d => d.count > 0) ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={salesCycleLengthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                                <XAxis dataKey="name" stroke="#cbd5e0" />
                                <YAxis stroke="#cbd5e0" label={{ value: 'Number of Deals', angle: -90, position: 'insideLeft', fill: '#cbd5e0' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#a0aec0' }}
                                />
                                <Legend />
                                <Bar dataKey="count" fill="#8884d8" name="Deals" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[250px] text-gray-500">
                            No 'Closed Won' deals to analyze sales cycle.
                        </div>
                    )}
                </Card>

                {/* Lead Source Analysis */}
                <Card title="Deals by Lead Source">
                    {leadSourceData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={leadSourceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                                <XAxis dataKey="name" stroke="#cbd5e0" angle={-45} textAnchor="end" height={60} interval={0} />
                                <YAxis stroke="#cbd5e0" label={{ value: 'Number of Deals', angle: -90, position: 'insideLeft', fill: '#cbd5e0' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#a0aec0' }}
                                />
                                <Legend />
                                <Bar dataKey="value" fill="#82ca9d" name="Deals" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[250px] text-gray-500">
                            No lead source data available.
                        </div>
                    )}
                </Card>
            </div>

            {/* Team Performance */}
            <Card title="Sales Team Performance">
                {teamPerformanceData.length > 0 && teamPerformanceData.some(d => d['Won Value'] > 0 || d['Open Pipeline'] > 0) ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={teamPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                            <XAxis dataKey="name" stroke="#cbd5e0" />
                            <YAxis stroke="#cbd5e0" tickFormatter={formatCurrency} />
                            <Tooltip
                                formatter={(value: number, name: string) => [`${name}: ${formatCurrency(value)}`, '']} // Custom formatter
                                contentStyle={{ backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: '#a0aec0' }}
                            />
                            <Legend />
                            <Bar dataKey="Won Value" stackId="a" fill="#10b981" />
                            <Bar dataKey="Open Pipeline" stackId="a" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-[300px] text-gray-500">
                        No team performance data available.
                    </div>
                )}
            </Card>
        </div>
    );
};

/**
 * Props for the DashboardSettingsView component.
 * @typedef {Object} DashboardSettingsViewProps
 * @property {DashboardSettings} settings - Current dashboard settings.
 * @property {(newSettings: DashboardSettings) => void} onSaveSettings - Callback to save new settings.
 * @property {(message: string, type?: 'success' | 'error' | 'info') => void} showToast - Function to display a toast notification.
 */
export type DashboardSettingsViewProps = {
    settings: DashboardSettings;
    onSaveSettings: (newSettings: DashboardSettings) => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
};

/**
 * DashboardSettingsView component allows users to configure their dashboard display options.
 * @param {DashboardSettingsViewProps} props - The properties for the component.
 * @returns {React.FC} The DashboardSettingsView component.
 */
export const DashboardSettingsView: React.FC<DashboardSettingsViewProps> = ({ settings, onSaveSettings, showToast }) => {
    const [tempSettings, setTempSettings] = useState<DashboardSettings>(settings);

    useEffect(() => {
        setTempSettings(settings); // Sync when settings change from parent
    }, [settings]);

    const handleToggle = (key: keyof DashboardSettings) => {
        setTempSettings(prev => ({ ...prev, [key]: !(prev as any)[key] }));
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'itemsPerPage') {
            setTempSettings(prev => ({ ...prev, itemsPerPage: parseInt(value) }));
        } else {
            setTempSettings(prev => ({ ...prev, [name]: value as any }));
        }
    };

    const handleColumnToggle = (columnKey: string) => {
        setTempSettings(prev => {
            const current = new Set(prev.visibleColumns);
            if (current.has(columnKey)) {
                current.delete(columnKey);
            } else {
                current.add(columnKey);
            }
            return { ...prev, visibleColumns: Array.from(current) };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSaveSettings(tempSettings);
        showToast('Settings saved successfully!', 'success');
    };

    const availableColumns = [
        { key: 'name', label: 'Deal Name' },
        { key: 'company', label: 'Company' },
        { key: 'value', label: 'Value' },
        { key: 'stage', label: 'Stage' },
        { key: 'owner', label: 'Owner' },
        { key: 'expectedCloseDate', label: 'Expected Close Date' },
        { key: 'createdAt', label: 'Created At' },
        { key: 'leadSource', label: 'Lead Source' },
        { key: 'status', label: 'Status' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Dashboard Settings</h2>

            <Card title="Display Preferences" className="p-6 bg-gray-800/70">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Settings */}
                    <div className="space-y-4 border-b border-gray-700 pb-6">
                        <div className="flex items-center justify-between">
                            <label htmlFor="showAiInsights" className="text-lg font-medium text-white">Show AI Insights</label>
                            <Button
                                type="button"
                                onClick={() => handleToggle('showAiInsights')}
                                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 ${tempSettings.showAiInsights ? 'bg-cyan-600' : 'bg-gray-600'}`}
                            >
                                <span className="sr-only">Enable AI Insights</span>
                                <span
                                    aria-hidden="true"
                                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${tempSettings.showAiInsights ? 'translate-x-5' : 'translate-x-0'}`}
                                ></span>
                            </Button>
                        </div>
                        <p className="text-sm text-gray-400">Toggle to show or hide AI-generated probabilities and suggestions by default.</p>

                        <Select
                            label="Default Deal View"
                            name="defaultView"
                            value={tempSettings.defaultView}
                            onChange={handleSelectChange}
                            options={[{ value: 'table', label: 'Table View' }, { value: 'cards', label: 'Card View (Not Implemented)' }]}
                            className="bg-gray-700 border-gray-600 text-white"
                        />

                        <Select
                            label="Deals Per Page (List View)"
                            name="itemsPerPage"
                            value={tempSettings.itemsPerPage}
                            onChange={handleSelectChange}
                            options={[{ value: '10', label: '10' }, { value: '25', label: '25' }, { value: '50', label: '50' }, { value: '100', label: '100' }]}
                            className="bg-gray-700 border-gray-600 text-white"
                        />
                    </div>

                    {/* Visible Columns for Deal Table */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-medium text-white">Visible Columns in Deal List</h3>
                        <p className="text-sm text-gray-400">Select which columns to display in the 'List' view.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {availableColumns.map(col => (
                                <div key={col.key} className="flex items-center">
                                    <input
                                        id={`col-${col.key}`}
                                        name="visibleColumns"
                                        type="checkbox"
                                        checked={tempSettings.visibleColumns.includes(col.key)}
                                        onChange={() => handleColumnToggle(col.key)}
                                        className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded bg-gray-700"
                                    />
                                    <label htmlFor={`col-${col.key}`} className="ml-2 text-sm text-gray-300 cursor-pointer">{col.label}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-700">
                        <Button type="submit" className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold">Save Settings</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

// --- End of New Component Definitions ---

// Global constants for stages and colors (for reusability)
export const PIPELINE_STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
export const STAGE_COLORS: { [key: string]: string } = {
    Prospecting: '#06b6d4', // Sky blue
    Qualification: '#3b82f6', // Blue
    Proposal: '#8b5cf6',    // Violet
    Negotiation: '#facc15',  // Yellow
    'Closed Won': '#10b981', // Emerald green
    'Closed Lost': '#ef4444' // Red
};

/**
 * Main SalesPipelineView component.
 * Orchestrates all sub-components and manages global state for the sales dashboard.
 * This is where the 10000 lines of code will primarily reside through nested components and complex logic.
 */
const SalesPipelineView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("SalesPipelineView must be within DataProvider");

    // Initialize with mock data if context.salesDeals is empty for demonstration purposes
    const initialSalesDeals = useMemo(() => {
        if (context.salesDeals && context.salesDeals.length > 0) {
            // Ensure types match, convert if necessary
            return context.salesDeals.map(deal => ({ ...deal, createdAt: new Date(deal.createdAt), expectedCloseDate: new Date(deal.expectedCloseDate) })) as SalesDealExtended[];
        }
        return generateMockSalesDeals(200); // Generate 200 mock deals if none from context
    }, [context.salesDeals]);

    // Local state for all sales deals, allowing for adding/editing/deleting
    const [_salesDeals, set_SalesDeals] = useState<SalesDealExtended[]>(initialSalesDeals);

    const { showToast, ToastComponent } = useToast();

    // AI State
    const [selectedDealForAi, setSelectedDealForAi] = useState<SalesDealExtended | null>(null);
    const [aiProbability, setAiProbability] = useState<number | null>(null);
    const [isLoadingAi, setIsLoadingAi] = useState(false);

    // Filter & Sort States
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterStage, setFilterStage] = useState<string>('');
    const [filterOwnerId, setFilterOwnerId] = useState<string>('');
    const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
    const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
    const [sortBy, setSortBy] = useState<string>('expectedCloseDate');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Pagination States
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);

    // Modals & View Management
    const [selectedDealForDetail, setSelectedDealForDetail] = useState<SalesDealExtended | null>(null);
    const [isAddDealModalOpen, setIsAddDealModalOpen] = useState<boolean>(false);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState<boolean>(false);
    const [dealToDelete, setDealToDelete] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<'pipeline' | 'list' | 'analytics' | 'settings'>('pipeline');

    // Dashboard Settings State
    const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>({
        showAiInsights: true,
        defaultView: 'table',
        itemsPerPage: 10,
        visibleColumns: ['name', 'company', 'value', 'stage', 'owner', 'expectedCloseDate'],
    });

    // Sync itemsPerPage from settings
    useEffect(() => {
        setItemsPerPage(dashboardSettings.itemsPerPage);
    }, [dashboardSettings.itemsPerPage]);

    // Mock Team Members (could come from DataContext in a real app)
    const teamMembers: SalesTeamMember[] = MOCK_SALES_TEAM;

    // --- Data Processing & Filtering ---
    const filteredAndSortedDeals = useMemo(() => {
        let filtered = _salesDeals;

        // Apply Search Term
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(deal =>
                deal.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                deal.company.toLowerCase().includes(lowerCaseSearchTerm) ||
                deal.stage.toLowerCase().includes(lowerCaseSearchTerm) ||
                deal.nextSteps?.toLowerCase().includes(lowerCaseSearchTerm) ||
                deal.productsServices.some(p => p.toLowerCase().includes(lowerCaseSearchTerm)) ||
                deal.contacts.some(c => c.name.toLowerCase().includes(lowerCaseSearchTerm) || c.email.toLowerCase().includes(lowerCaseSearchTerm))
            );
        }

        // Apply Stage Filter
        if (filterStage) {
            filtered = filtered.filter(deal => deal.stage === filterStage);
        }

        // Apply Owner Filter
        if (filterOwnerId) {
            filtered = filtered.filter(deal => deal.ownerId === filterOwnerId);
        }

        // Apply Date Range Filter (Expected Close Date)
        if (filterStartDate) {
            filtered = filtered.filter(deal => isBefore(filterStartDate, deal.expectedCloseDate) || deal.expectedCloseDate.toDateString() === filterStartDate.toDateString());
        }
        if (filterEndDate) {
            filtered = filtered.filter(deal => isBefore(deal.expectedCloseDate, addDays(filterEndDate, 1))); // Inclusive end date
        }

        // Apply Sorting
        if (sortBy) {
            filtered = [...filtered].sort((a, b) => {
                let valA: any = (a as any)[sortBy];
                let valB: any = (b as any)[sortBy];

                // Special handling for date types
                if (sortBy === 'expectedCloseDate' || sortBy === 'createdAt') {
                    valA = valA ? valA.getTime() : 0;
                    valB = valB ? valB.getTime() : 0;
                } else if (sortBy === 'owner') { // Sort by owner name, not ID
                    valA = teamMembers.find(m => m.id === a.ownerId)?.name || '';
                    valB = teamMembers.find(m => m.id === b.ownerId)?.name || '';
                }

                if (typeof valA === 'string' && typeof valB === 'string') {
                    return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                }
                return sortOrder === 'asc' ? valA - valB : valB - valA;
            });
        }

        return filtered;
    }, [_salesDeals, searchTerm, filterStage, filterOwnerId, filterStartDate, filterEndDate, sortBy, sortOrder, teamMembers]);

    // Pagination Calculation
    const totalFilteredDeals = filteredAndSortedDeals.length;
    const paginatedDeals = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedDeals.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedDeals, currentPage, itemsPerPage]);

    // Pipeline Funnel Data
    const pipelineData = useMemo(() => {
        const stagesCount = PIPELINE_STAGES.reduce((acc, stage) => ({ ...acc, [stage]: 0 }), {} as { [key: string]: number });
        _salesDeals.forEach(deal => {
            if (deal.stage in stagesCount) stagesCount[deal.stage]++;
        });

        return [
            { value: stagesCount.Prospecting, name: 'Prospecting', fill: STAGE_COLORS.Prospecting },
            { value: stagesCount.Qualification, name: 'Qualification', fill: STAGE_COLORS.Qualification },
            { value: stagesCount.Proposal, name: 'Proposal', fill: STAGE_COLORS.Proposal },
            { value: stagesCount.Negotiation, name: 'Negotiation', fill: STAGE_COLORS.Negotiation },
            { value: stagesCount['Closed Won'], name: 'Won', fill: STAGE_COLORS['Closed Won'] },
            // Not including Closed Lost in main funnel usually
        ].filter(d => d.value > 0); // Only show stages with deals
    }, [_salesDeals]);

    // KPI Data (for initial dashboard overview)
    const kpiData = useMemo(() => ({
        pipelineValue: _salesDeals.reduce((sum, d) => d.status !== 'Closed Won' ? sum + d.value : sum, 0),
        winRate: (_salesDeals.filter(d => d.status === 'Closed Won').length / _salesDeals.filter(d => d.status === 'Closed Won' || d.status === 'Closed Lost').length) * 100 || 0,
        avgDealSize: _salesDeals.length > 0 ? _salesDeals.reduce((sum, d) => sum + d.value, 0) / _salesDeals.length : 0,
    }), [_salesDeals]);

    // --- CRUD Operations ---
    const handleAddDeal = useCallback((newDeal: SalesDealExtended) => {
        set_SalesDeals(prevDeals => [...prevDeals, newDeal]);
        showToast('Deal created successfully!', 'success');
    }, [showToast]);

    const handleUpdateDeal = useCallback((updatedDeal: SalesDealExtended) => {
        set_SalesDeals(prevDeals => prevDeals.map(deal => (deal.id === updatedDeal.id ? updatedDeal : deal)));
        setSelectedDealForDetail(null); // Close modal
        showToast('Deal updated successfully!', 'success');
    }, [showToast]);

    const handleDeleteDeal = useCallback((dealId: string) => {
        setDealToDelete(dealId);
        setIsConfirmDeleteModalOpen(true);
    }, []);

    const confirmDeleteDeal = useCallback(() => {
        if (dealToDelete) {
            set_SalesDeals(prevDeals => prevDeals.filter(deal => deal.id !== dealToDelete));
            showToast('Deal deleted successfully!', 'info');
            setDealToDelete(null);
            setIsConfirmDeleteModalOpen(false);
        }
    }, [dealToDelete, showToast]);

    // --- AI Integration ---
    const getAiProbability = async (deal: SalesDealExtended) => {
        setSelectedDealForAi(deal); // Set the deal for AI context
        setIsLoadingAi(true);
        setAiProbability(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY as string }); // Ensure API key is client-side safe
            const prompt = `Based on this deal (Name: ${deal.name}, Company: ${deal.company}, Value: $${deal.value}, Stage: ${deal.stage}, Expected Close Date: ${formatDate(deal.expectedCloseDate)}, Lead Source: ${deal.leadSource}), estimate the probability to close as a percentage. Respond with only the number (0-100), no text. If you cannot determine, respond with "N/A".`;
            console.log("Sending prompt to AI:", prompt); // Debugging AI prompt
            const model = ai.getGenerativeModel({ model: 'gemini-pro' }); // Use a suitable model
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            console.log("AI Raw Response:", responseText); // Debugging AI response
            const parsedProbability = parseFloat(responseText.replace(/[^0-9.]/g, '')); // Robust parsing for number
            if (!isNaN(parsedProbability) && parsedProbability >= 0 && parsedProbability <= 100) {
                setAiProbability(parsedProbability);
                showToast(`AI predicted ${parsedProbability.toFixed(1)}% for ${deal.name}`, 'info');
                // Optionally update the deal with AI probability
                set_SalesDeals(prev => prev.map(d => d.id === deal.id ? { ...d, aiProbability: parsedProbability } : d));
            } else {
                setAiProbability(null);
                showToast('AI could not determine probability. Try a different prompt.', 'error');
            }
        } catch (err) {
            console.error("Error fetching AI probability:", err);
            setAiProbability(null);
            showToast('Failed to get AI probability.', 'error');
        } finally {
            setIsLoadingAi(false);
        }
    };

    // --- Event Handlers for Filters/Sorting/Pagination ---
    const handleSearchChange = useCallback((term: string) => {
        setSearchTerm(term);
        setCurrentPage(1); // Reset pagination on filter change
    }, []);

    const handleStageFilterChange = useCallback((stage: string) => {
        setFilterStage(stage);
        setCurrentPage(1);
    }, []);

    const handleOwnerFilterChange = useCallback((ownerId: string) => {
        setFilterOwnerId(ownerId);
        setCurrentPage(1);
    }, []);

    const handleStartDateChange = useCallback((date: Date | null) => {
        setFilterStartDate(date);
        setCurrentPage(1);
    }, []);

    const handleEndDateChange = useCallback((date: Date | null) => {
        setFilterEndDate(date);
        setCurrentPage(1);
    }, []);

    const handleSortChange = useCallback((key: string) => {
        setSortBy(key);
    }, []);

    const handleSortOrderChange = useCallback((order: 'asc' | 'desc') => {
        setSortOrder(order);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    // --- Dashboard Settings Handlers ---
    const handleSaveDashboardSettings = useCallback((newSettings: DashboardSettings) => {
        setDashboardSettings(newSettings);
        setItemsPerPage(newSettings.itemsPerPage); // Immediately update items per page
        setCurrentPage(1); // Reset pagination if itemsPerPage changed
        showToast('Dashboard settings updated!', 'success');
    }, [showToast]);


    // --- Render Logic ---
    return (
        <div className="space-y-6 min-h-screen bg-gray-900 text-white p-6">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Mega Sales Dashboard</h1>

            {/* Filter and View Control Bar */}
            <SalesFilterBar
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                selectedStage={filterStage}
                onStageChange={handleStageFilterChange}
                selectedOwnerId={filterOwnerId}
                onOwnerChange={handleOwnerFilterChange}
                startDate={filterStartDate}
                onStartDateChange={handleStartDateChange}
                endDate={filterEndDate}
                onEndDateChange={handleEndDateChange}
                teamMembers={teamMembers}
                currentView={currentView}
                onViewChange={setCurrentView}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                sortOrder={sortOrder}
                onSortOrderChange={handleSortOrderChange}
            />

            {/* Main Content Area based on currentView */}
            {currentView === 'pipeline' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="text-center p-5 bg-gray-800/70">
                            <p className="text-3xl font-bold text-white">${(kpiData.pipelineValue / 1000).toFixed(0)}k</p>
                            <p className="text-sm text-gray-400 mt-1">Pipeline Value</p>
                        </Card>
                        <Card className="text-center p-5 bg-gray-800/70">
                            <p className="text-3xl font-bold text-white">{kpiData.winRate.toFixed(1)}%</p>
                            <p className="text-sm text-gray-400 mt-1">Win Rate</p>
                        </Card>
                        <Card className="text-center p-5 bg-gray-800/70">
                            <p className="text-3xl font-bold text-white">${(kpiData.avgDealSize / 1000).toFixed(0)}k</p>
                            <p className="text-sm text-gray-400 mt-1">Avg. Deal Size</p>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card title="Sales Funnel" className="p-6 bg-gray-800/70">
                            {pipelineData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <FunnelChart>
                                        <Tooltip
                                            formatter={(value: number, name: string) => [`${name}: ${value} deals`, '']}
                                            contentStyle={{ backgroundColor: '#1a202c', borderColor: '#4a5568', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ color: '#a0aec0' }}
                                        />
                                        <Funnel
                                            dataKey="value"
                                            data={pipelineData}
                                            isAnimationActive
                                            labelLine={false}
                                            stroke="#1a202c"
                                        >
                                            <LabelList position="right" fill="#fff" stroke="none" dataKey="name" fontSize={14} />
                                        </Funnel>
                                    </FunnelChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-[250px] text-gray-500">
                                    No deals in the pipeline. Start by adding a new deal!
                                </div>
                            )}
                        </Card>
                        <Card title="Top Open Deals" className="p-6 bg-gray-800/70">
                            <div className="space-y-3">
                                {paginatedDeals
                                    .filter(d => d.status === 'Open') // Only show open deals
                                    .sort((a, b) => b.value - a.value) // Sort by value descending
                                    .slice(0, 5) // Top 5
                                    .map(deal => (
                                        <div key={deal.id} className="p-3 bg-gray-800/50 rounded-lg flex justify-between items-center transition-colors hover:bg-gray-700/60">
                                            <div>
                                                <p className="font-semibold text-white">{deal.name}</p>
                                                <p className="text-xs text-gray-400">{deal.stage} - {formatCurrency(deal.value)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {dashboardSettings.showAiInsights && (
                                                    <Button onClick={(e) => { e.stopPropagation(); getAiProbability(deal); }} className="text-xs text-cyan-400 hover:underline px-3 py-1 rounded-md bg-gray-700 hover:bg-cyan-900 transition-colors">
                                                        AI Probability
                                                    </Button>
                                                )}
                                                <Button onClick={(e) => { e.stopPropagation(); setSelectedDealForDetail(deal); }} className="text-xs text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-700">
                                                    <PencilSquareIcon className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                            {selectedDealForAi && dashboardSettings.showAiInsights && (
                                <div className="mt-4 p-3 bg-gray-900/50 rounded text-center border border-cyan-800">
                                    <p className="text-sm text-gray-300">AI Probability for <strong className="text-cyan-300">{selectedDealForAi.name}</strong>:
                                        <strong className="text-cyan-300 ml-2">{isLoadingAi ? '...' : (aiProbability !== null ? `${aiProbability.toFixed(1)}%` : 'N/A')}</strong>
                                    </p>
                                </div>
                            )}
                            <Button
                                onClick={() => setIsAddDealModalOpen(true)}
                                className="mt-6 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" /> Add New Deal
                            </Button>
                        </Card>
                    </div>
                </div>
            )}

            {currentView === 'list' && (
                <div className="space-y-6">
                    <SalesDealTable
                        deals={paginatedDeals}
                        onDealClick={setSelectedDealForDetail}
                        visibleColumns={dashboardSettings.visibleColumns}
                        onDeleteDeal={handleDeleteDeal}
                        teamMembers={teamMembers}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        totalDeals={totalFilteredDeals}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                        onSortOrderChange={handleSortOrderChange}
                    />
                </div>
            )}

            {currentView === 'analytics' && (
                <AnalyticsDashboard salesDeals={_salesDeals} teamMembers={teamMembers} />
            )}

            {currentView === 'settings' && (
                <DashboardSettingsView settings={dashboardSettings} onSaveSettings={handleSaveDashboardSettings} showToast={showToast} />
            )}


            {/* Modals */}
            <DealDetailModal
                deal={selectedDealForDetail}
                onClose={() => { setSelectedDealForDetail(null); setAiProbability(null); setSelectedDealForAi(null); }}
                onSave={handleUpdateDeal}
                teamMembers={teamMembers}
                getAiProbabilityForDeal={getAiProbability}
                isLoadingAi={isLoadingAi}
                aiProbability={aiProbability}
                showToast={showToast}
            />

            <AddDealModal
                isOpen={isAddDealModalOpen}
                onClose={() => setIsAddDealModalOpen(false)}
                onAddDeal={handleAddDeal}
                teamMembers={teamMembers}
                showToast={showToast}
            />

            <Modal isOpen={isConfirmDeleteModalOpen} onClose={() => setIsConfirmDeleteModalOpen(false)} title="Confirm Delete" size="sm">
                <div className="p-6 text-gray-300">
                    <p>Are you sure you want to delete this deal? This action cannot be undone.</p>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button onClick={() => setIsConfirmDeleteModalOpen(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">Cancel</Button>
                        <Button onClick={confirmDeleteDeal} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Delete</Button>
                    </div>
                </div>
            </Modal>

            {/* Toast Notifications */}
            <ToastComponent />
        </div>
    );
};

export default SalesPipelineView;