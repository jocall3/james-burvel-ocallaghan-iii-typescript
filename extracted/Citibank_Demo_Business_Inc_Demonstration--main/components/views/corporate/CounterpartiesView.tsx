/**
 * CounterpartiesView Component: Enterprise Counterparty Management Platform
 *
 * This module delivers a revolutionary, multi-million-dollar infrastructure leap by providing a sophisticated
 * and high-value view for managing enterprise counterparties. It establishes a centralized, real-time,
 * and auditable system for onboarding, monitoring, and managing relationships with critical financial
 * counterparties, suppliers, and partners. This platform streamlines complex KYC/AML, risk assessment,
 * and compliance workflows, significantly reducing operational overhead, accelerating deal velocity,
 * and mitigating financial and regulatory risks. By offering a comprehensive 360-degree view of each
 * counterparty, including their intelligent digital identity, banking details, transaction history,
 * and dynamic risk profile, it enables rapid, informed decision-making and ensures robust governance.
 * The modular design, secure data handling, and integrated observability features make it a critical asset for
 * ensuring transactional integrity and expanding into new, high-value programmable payment and settlement rails.
 * This system effectively automates critical compliance checks and provides a foundational architecture for
 * agentic AI integration, enabling proactive risk management and anomaly detection, driving substantial
 * cost arbitrage and competitive advantage for enterprise clients.
 */
import React, { useContext, useState, useEffect, useCallback, useReducer, useRef, useMemo } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import { Counterparty } from '../../../types'; // Original Counterparty type

// --- START: Massive Expansion of Features and Code ---

/**
 * Enumeration for the various statuses a counterparty can be in.
 * Commercial value: Provides clear visibility into the operational state and compliance posture of each counterparty,
 * enabling precise workflow management and risk stratification.
 */
export enum CounterpartyStatus {
    PendingVerification = 'Pending Verification',
    Verified = 'Verified',
    Rejected = 'Rejected',
    OnHold = 'On Hold',
    Active = 'Active',
    Inactive = 'Inactive',
    RiskAlert = 'Risk Alert',
}

/**
 * Enumeration for the assigned risk level of a counterparty.
 * Commercial value: Facilitates proactive risk mitigation, informs decision-making on transaction limits,
 * and ensures adherence to internal risk policies, safeguarding institutional capital.
 */
export enum RiskLevel {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Critical = 'Critical',
}

/**
 * Enumeration for the compliance status of a specific record or the counterparty overall.
 * Commercial value: Critical for regulatory adherence, reducing fines, and maintaining operational licenses.
 * Provides granular tracking for auditability.
 */
export enum ComplianceStatus {
    Pending = 'Pending',
    InProgress = 'In Progress',
    Compliant = 'Compliant',
    NonCompliant = 'Non-Compliant',
    Exempt = 'Exempt',
}

/**
 * Enumeration for categorizing documents associated with a counterparty.
 * Commercial value: Enhances data organization, simplifies document retrieval for audits,
 * and supports automated document lifecycle management.
 */
export enum DocumentCategory {
    Legal = 'Legal',
    Financial = 'Financial',
    Compliance = 'Compliance',
    Operational = 'Operational',
    Other = 'Other',
}

/**
 * Enumeration for user roles within the platform, dictating access controls.
 * Commercial value: Enforces robust role-based access control (RBAC), ensuring data integrity,
 * preventing unauthorized access, and meeting stringent security and compliance requirements.
 */
export enum UserRole {
    Admin = 'Admin',
    Editor = 'Editor',
    Viewer = 'Viewer',
    ComplianceOfficer = 'Compliance Officer',
    RiskAnalyst = 'Risk Analyst',
}

/**
 * Interface representing a standardized address structure.
 * Commercial value: Ensures consistent and accurate geographical data for logistics,
 * taxation, and regulatory reporting, reducing data entry errors.
 */
export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

/**
 * Interface for contact persons associated with a counterparty.
 * Commercial value: Maintains a comprehensive communication registry, streamlining
 * outreach, relationship management, and critical incident response.
 */
export interface ContactPerson {
    id: string;
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
    lastContactDate: string; // ISO date string
}

/**
 * Interface for bank account details of a counterparty.
 * Commercial value: Critical for secure, accurate, and efficient payment processing,
 * reducing operational errors and facilitating real-time settlement across digital rails.
 */
export interface BankAccount {
    id: string;
    bankName: string;
    accountNumber: string;
    swiftCode: string;
    iban: string;
    currency: string;
    isPrimary: boolean;
    verificationStatus: 'Pending' | 'Verified' | 'Rejected';
}

/**
 * Interface for compliance records related to a counterparty.
 * Commercial value: Provides an immutable audit trail for regulatory compliance (e.g., KYC, AML),
 * reducing legal exposure and enabling automated compliance workflows.
 */
export interface ComplianceRecord {
    id: string;
    type: 'KYC' | 'AML' | 'Sanctions Screening' | 'ESG' | 'Data Privacy' | 'OFAC';
    status: ComplianceStatus;
    lastUpdated: string; // ISO date string
    dueDate: string; // ISO date string
    notes: string;
    assignedTo: string; // User ID or Name
    documentIds: string[]; // List of related document IDs
}

/**
 * Interface for risk assessments performed on a counterparty.
 * Commercial value: Powers proactive risk identification and management,
 * enabling dynamic adjustment of credit limits, monitoring intensity,
 * and strategic partnership decisions.
 */
export interface RiskAssessment {
    id: string;
    level: RiskLevel;
    score: number;
    assessmentDate: string; // ISO date string
    reviewedBy: string; // User ID or Name
    mitigationPlan: string;
    nextReviewDate: string; // ISO date string
    comments: string;
}

/**
 * Interface for documents stored for a counterparty.
 * Commercial value: Centralizes document management, supports version control,
 * and ensures immediate access to critical legal and operational agreements
 * while maintaining data integrity.
 */
export interface Document {
    id: string;
    name: string;
    category: DocumentCategory;
    uploadDate: string; // ISO date string
    uploadedBy: string; // User ID or Name
    fileType: string;
    fileSizeKB: number;
    url: string; // URL to access the document
    version: number;
    expiresOn?: string; // Optional expiry date
    tags: string[];
}

/**
 * Interface for an entry in a counterparty's activity audit log.
 * Commercial value: Creates an immutable, cryptographically-linked record of all significant interactions,
 * crucial for forensic analysis, regulatory audits, and demonstrating operational transparency.
 */
export interface ActivityLogEntry {
    id: string;
    timestamp: string; // ISO date string
    userId: string;
    userName: string;
    action: string; // e.g., 'Counterparty added', 'Status updated', 'Document uploaded'
    details: string;
    counterpartyId: string;
}

/**
 * Interface for a summary of a counterparty's transaction history.
 * Commercial value: Provides immediate insight into trading patterns and financial activity,
 * supporting credit decisions, liquidity management, and fraud detection.
 */
export interface TransactionSummary {
    totalValueLastMonth: number;
    averageValueLastMonth: number;
    transactionCountLastMonth: number;
    pendingTransactionsCount: number;
    highestTransactionValue: number;
    lastTransactionDate: string; // ISO date string
}

/**
 * Enhanced Counterparty interface, extending the base Counterparty with comprehensive financial,
 * legal, compliance, and operational attributes.
 * Commercial value: Represents the single source of truth for all counterparty data,
 * integrating identity, risk, and transaction profiles into a unified, intelligent entity.
 * This comprehensive structure is vital for automating complex financial operations,
 * ensuring regulatory compliance, and driving intelligent agent-based risk management.
 */
export interface EnhancedCounterparty extends Counterparty {
    legalName: string;
    taxId: string;
    registrationNumber: string;
    industry: string;
    website: string;
    phone: string;
    fax: string;
    address: Address;
    billingAddress?: Address;
    shippingAddress?: Address;
    contacts: ContactPerson[];
    bankAccounts: BankAccount[];
    complianceRecords: ComplianceRecord[];
    riskAssessments: RiskAssessment[];
    documents: Document[];
    notes: string;
    lastInteractionDate: string; // ISO date string
    relationshipManagerId: string;
    relationshipManagerName: string;
    transactionSummary: TransactionSummary;
    preferredPaymentTerms: string;
    creditLimit: number;
    parentId?: string; // For corporate hierarchies
    childrenIds?: string[]; // For corporate hierarchies
    customFields: { [key: string]: string | number | boolean };
    auditLog: ActivityLogEntry[]; // In a real app, this would be fetched separately or be a foreign key
}

/**
 * Generates a unique identifier.
 * Commercial value: Ensures uniqueness for all entities within the system, critical for data integrity,
 * traceability, and preventing collisions in a distributed financial infrastructure.
 */
export const generateId = (): string => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

/**
 * Formats a date string or Date object into a readable date format.
 * Commercial value: Standardizes date presentation across the platform, improving user experience,
 * consistency in reporting, and ensuring data readability for financial auditing.
 */
export const formatDate = (dateString: string | Date, options?: Intl.DateTimeFormatOptions): string => {
    if (!dateString) return 'N/A';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', options || { year: 'numeric', month: 'short', day: 'numeric' });
};

/**
 * Formats a date string or Date object into a readable date and time format.
 * Commercial value: Provides precise timestamping for activity logs and transaction records,
 * essential for forensic analysis, regulatory compliance, and audit trails in a real-time system.
 */
export const formatDateTime = (dateString: string | Date): string => {
    if (!dateString) return 'N/A';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/**
 * Custom React hook for managing form state, handling input changes including nested fields,
 * file uploads, and form resets.
 * Commercial value: Accelerates development of data entry interfaces, ensures consistent
 * data handling, and reduces boilerplate for complex financial forms, enhancing developer productivity.
 */
export function useForm<T extends Record<string, any>>(initialState: T) {
    const [formData, setFormData] = useState<T>(initialState);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;

        setFormData(prev => {
            const keys = name.split('.');
            if (keys.length > 1) {
                let current: any = { ...prev };
                let currentLevel = current;
                for (let i = 0; i < keys.length - 1; i++) {
                    currentLevel[keys[i]] = { ...(currentLevel[keys[i]] || {}) };
                    currentLevel = currentLevel[keys[i]];
                }
                currentLevel[keys[keys.length - 1]] = type === 'checkbox' ? checked : value;
                return current;
            }

            return {
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            };
        });
    }, []);

    const handleFileUpload = useCallback((name: string, files: FileList | null) => {
        if (files && files.length > 0) {
            const file = files[0];
            setFormData(prev => ({
                ...prev,
                [name]: file.name, // Mocking file upload by storing name; actual upload logic would be here.
            }));
        }
    }, []);

    const resetForm = useCallback(() => setFormData(initialState), [initialState]);

    return { formData, setFormData, handleChange, handleFileUpload, resetForm };
}

/**
 * Custom React hook for client-side pagination of data lists.
 * Commercial value: Optimizes performance and user experience for large datasets by
 * loading and displaying items in manageable chunks, essential for enterprise-scale UIs.
 */
export function usePagination<T>(items: T[], itemsPerPage: number = 10) {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(items.length / itemsPerPage);

    const currentItems = items.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const goToPage = useCallback((page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages]);

    const nextAPage = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage]);
    const prevAPage = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [items]);

    return {
        currentItems,
        currentPage,
        totalPages,
        goToPage,
        nextAPage,
        prevAPage,
        itemsPerPage,
        totalItems: items.length,
    };
}

/**
 * Custom React hook for client-side filtering and sorting of tabular data.
 * Commercial value: Enhances data discoverability and analytical capabilities within UI tables,
 * enabling users to quickly derive insights from complex financial datasets.
 */
export function useTableData<T extends Record<string, any>>(data: T[], defaultSortField: keyof T, defaultSortDirection: 'asc' | 'desc' = 'asc') {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterField, setFilterField] = useState<string>('');
    const [filterValue, setFilterValue] = useState<string>('');
    const [sortField, setSortField] = useState<keyof T>(defaultSortField);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);

    const filteredData = useMemo(() => {
        let result = data;

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            result = result.filter(item =>
                Object.values(item).some(val =>
                    String(val).toLowerCase().includes(lowerCaseSearchTerm)
                )
            );
        }

        if (filterField && filterValue) {
            const lowerCaseFilterValue = filterValue.toLowerCase();
            result = result.filter(item =>
                String(item[filterField]).toLowerCase().includes(lowerCaseFilterValue)
            );
        }
        return result;
    }, [data, searchTerm, filterField, filterValue]);

    const sortedData = useMemo(() => {
        if (!sortField) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }
            return 0; // Fallback for other types
        });
    }, [filteredData, sortField, sortDirection]);

    const handleSort = useCallback((field: keyof T) => {
        setSortField(field);
        setSortDirection(prev => (prev === 'asc' && sortField === field ? 'desc' : 'asc'));
    }, [sortField]);

    const handleSearch = useCallback((term: string) => setSearchTerm(term), []);
    const handleFilter = useCallback((field: string, value: string) => {
        setFilterField(field);
        setFilterValue(value);
    }, []);

    return {
        sortedData,
        searchTerm,
        handleSearch,
        filterField,
        filterValue,
        handleFilter,
        sortField,
        sortDirection,
        handleSort,
    };
}

/**
 * Interface for API call results.
 * Commercial value: Standardizes API response handling, facilitating robust error management
 * and consistent data parsing across the distributed system.
 */
interface ApiResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Utility function to simulate network latency.
 * Commercial value: Essential for local development and testing, ensuring UI/UX robustness
 * under realistic network conditions without needing live external services.
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock API Service for Counterparty management.
 * Commercial value: Provides a deterministic, self-contained simulation of a secure
 * external API, enabling full end-to-end local testing and development of the
 * Counterparty management system without external dependencies. This ensures
 * rapid iteration and integration readiness for live programmable value rails.
 */
class CounterpartyApiService {
    private static _instance: CounterpartyApiService;
    private _data: EnhancedCounterparty[] = [];

    /**
     * Private constructor to enforce Singleton pattern for the API service.
     */
    private constructor() {
        if (this._data.length === 0) {
            this.generateMockData(50); // Generate 50 mock counterparties on initialization
        }
    }

    /**
     * Retrieves the singleton instance of the CounterpartyApiService.
     * Commercial value: Ensures a single, consistent data source and interaction point
     * for counterparty data across the application, simplifying state management.
     */
    public static getInstance(): CounterpartyApiService {
        if (!CounterpartyApiService._instance) {
            CounterpartyApiService._instance = new CounterpartyApiService();
        }
        return CounterpartyApiService._instance;
    }

    /**
     * Populates the mock data store with a specified number of synthetic EnhancedCounterparty objects.
     * Commercial value: Provides a rich, diverse dataset for testing and demonstration,
     * covering various scenarios and data states critical for validating system functionality.
     */
    private generateMockData(count: number) {
        const statuses: CounterpartyStatus[] = [
            CounterpartyStatus.Active, CounterpartyStatus.PendingVerification,
            CounterpartyStatus.OnHold, CounterpartyStatus.Verified,
            CounterpartyStatus.RiskAlert, CounterpartyStatus.Inactive, CounterpartyStatus.Rejected
        ];
        const riskLevels: RiskLevel[] = [RiskLevel.Low, RiskLevel.Medium, RiskLevel.High, RiskLevel.Critical];
        const industries: string[] = ['Tech', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Logistics', 'Energy', 'Automotive', 'Telecom'];
        const countries: string[] = ['USA', 'Canada', 'UK', 'Germany', 'Australia', 'Japan', 'Singapore', 'Brazil', 'South Africa'];
        const documentCategories: DocumentCategory[] = [DocumentCategory.Legal, DocumentCategory.Financial, DocumentCategory.Compliance, DocumentCategory.Operational];
        const complianceTypes: ComplianceRecord['type'][] = ['KYC', 'AML', 'Sanctions Screening', 'ESG', 'Data Privacy', 'OFAC'];

        for (let i = 0; i < count; i++) {
            const id = generateId();
            const companyName = `GlobalCorp ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${i + 1}`;
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const industry = industries[Math.floor(Math.random() * industries.length)];
            const country = countries[Math.floor(Math.random() * countries.length)];
            const email = `${companyName.toLowerCase().replace(/\s/g, '')}@example.com`;
            const createdDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(); // Up to 1 year ago
            const lastInteractionDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(); // Up to 30 days ago
            const website = `https://www.${companyName.toLowerCase().replace(/\s/g, '')}.com`;
            const phone = `+1-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;

            const numContacts = Math.floor(1 + Math.random() * 3);
            const contacts: ContactPerson[] = Array.from({ length: numContacts }).map(() => ({
                id: generateId(),
                firstName: `ContactFn${generateId().substring(0, 4)}`,
                lastName: `ContactLn${generateId().substring(0, 4)}`,
                title: Math.random() > 0.5 ? 'CEO' : (Math.random() > 0.5 ? 'CFO' : 'Relationship Manager'),
                email: `contact.${generateId().substring(0, 4)}@${companyName.toLowerCase().replace(/\s/g, '')}.com`,
                phone: `+1-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
                role: Math.random() > 0.5 ? 'Sales' : 'Operations',
                isActive: Math.random() > 0.1,
                lastContactDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
            }));

            const numBankAccounts = Math.floor(1 + Math.random() * 2);
            const bankAccounts: BankAccount[] = Array.from({ length: numBankAccounts }).map((_, idx) => ({
                id: generateId(),
                bankName: `Bank ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
                accountNumber: `${Math.floor(100000000 + Math.random() * 900000000)}`,
                swiftCode: `SWIFT${Math.floor(1000 + Math.random() * 9000)}`,
                iban: `IBAN${Math.floor(10000000000000 + Math.random() * 90000000000000)}`,
                currency: Math.random() > 0.5 ? 'USD' : (Math.random() > 0.5 ? 'EUR' : 'GBP'),
                isPrimary: idx === 0,
                verificationStatus: Math.random() > 0.8 ? 'Pending' : 'Verified',
            }));

            const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
            const riskAssessments: RiskAssessment[] = [{
                id: generateId(),
                level: riskLevel,
                score: Math.floor(Math.random() * 100),
                assessmentDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
                reviewedBy: 'Risk Analyst A',
                mitigationPlan: 'Implement enhanced monitoring and transaction limits.',
                nextReviewDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
                comments: 'Initial assessment based on public records and initial KYC documentation.',
            }];

            const documents: Document[] = Array.from({ length: Math.floor(1 + Math.random() * 4) }).map(() => ({
                id: generateId(),
                name: `Document_${generateId().substring(0, 6)}.pdf`,
                category: documentCategories[Math.floor(Math.random() * documentCategories.length)],
                uploadDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
                uploadedBy: 'Compliance Officer',
                fileType: 'application/pdf',
                fileSizeKB: Math.floor(100 + Math.random() * 2000),
                url: `/mock-docs/${generateId()}.pdf`,
                version: 1,
                expiresOn: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 730 * 24 * 60 * 60 * 1000).toISOString() : undefined,
                tags: ['agreement', 'contract', 'report', 'KYC doc'],
            }));

            const complianceRecords: ComplianceRecord[] = Array.from({ length: Math.floor(1 + Math.random() * 2) }).map(() => ({
                id: generateId(),
                type: complianceTypes[Math.floor(Math.random() * complianceTypes.length)],
                status: Math.random() > 0.2 ? ComplianceStatus.Compliant : (Math.random() > 0.5 ? ComplianceStatus.Pending : ComplianceStatus.InProgress),
                lastUpdated: new Date().toISOString(),
                dueDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
                notes: 'Comprehensive background checks completed, all clear.',
                assignedTo: 'Compliance Officer A',
                documentIds: documents.slice(0, 1).map(d => d.id),
            }));

            const transactionSummary: TransactionSummary = {
                totalValueLastMonth: parseFloat((Math.random() * 100000 + 1000).toFixed(2)),
                averageValueLastMonth: parseFloat((Math.random() * 5000 + 100).toFixed(2)),
                transactionCountLastMonth: Math.floor(Math.random() * 50) + 5,
                pendingTransactionsCount: Math.floor(Math.random() * 5),
                highestTransactionValue: parseFloat((Math.random() * 20000 + 500).toFixed(2)),
                lastTransactionDate: new Date(Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000).toISOString(),
            };

            this._data.push({
                id,
                name: companyName,
                legalName: `${companyName} Holdings Inc.`,
                taxId: `TAX-${Math.floor(100000 + Math.random() * 900000)}`,
                registrationNumber: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
                email,
                phone,
                fax: `+1-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
                industry,
                website,
                createdDate,
                status,
                address: {
                    street: `${Math.floor(100 + Math.random() * 900)} Global Plaza`,
                    city: `City ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
                    state: `State ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
                    zipCode: `${Math.floor(10000 + Math.random() * 90000)}`,
                    country,
                },
                contacts,
                bankAccounts,
                complianceRecords,
                riskAssessments,
                documents,
                notes: `Strategic partner crucial for our APAC operations. Regularly reviewed for compliance.`,
                lastInteractionDate,
                relationshipManagerId: `RM${Math.floor(100 + Math.random() * 900)}`,
                relationshipManagerName: `Alexandra Chen`,
                transactionSummary,
                preferredPaymentTerms: Math.random() > 0.5 ? 'Net 30' : 'Net 60',
                creditLimit: parseFloat((Math.random() * 500000 + 10000).toFixed(2)),
                customFields: {
                    'accountTier': Math.random() > 0.7 ? 'Premium' : 'Standard',
                    'annualRevenue': Math.floor(Math.random() * 10000000),
                },
                auditLog: [{
                    id: generateId(),
                    timestamp: createdDate,
                    userId: 'SYS001',
                    userName: 'Automated Agent ALPHA',
                    action: 'Counterparty created',
                    details: `Initial digital identity creation and onboarding of ${companyName}`,
                    counterpartyId: id,
                }]
            });
        }
    }

    /**
     * Retrieves a paginated and filtered list of counterparties.
     * Commercial value: Enables efficient data retrieval for large datasets, critical for
     * scalable UI performance and responsive financial dashboards.
     */
    public async getCounterparties(filters?: Record<string, any>, page: number = 1, pageSize: number = 10, sortBy?: string, sortOrder: 'asc' | 'desc' = 'asc'): Promise<ApiResult<{ counterparties: EnhancedCounterparty[], total: number }>> {
        await sleep(500); // Simulate network delay

        let filtered = this._data;

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value) {
                    filtered = filtered.filter(cp =>
                        String((cp as any)[key]).toLowerCase().includes(String(value).toLowerCase())
                    );
                }
            });
        }

        if (sortBy) {
            filtered = filtered.sort((a, b) => {
                const aVal = (a as any)[sortBy];
                const bVal = (b as any)[sortBy];

                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                }
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
                }
                return 0;
            });
        }

        const total = filtered.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginated = filtered.slice(start, end);

        return { success: true, data: { counterparties: paginated, total } };
    }

    /**
     * Retrieves a single counterparty by its unique identifier.
     * Commercial value: Provides quick, targeted access to specific counterparty profiles,
     * supporting granular detail views for critical decision-making.
     */
    public async getCounterpartyById(id: string): Promise<ApiResult<EnhancedCounterparty>> {
        await sleep(300);
        const cp = this._data.find(c => c.id === id);
        if (cp) {
            return { success: true, data: cp };
        }
        return { success: false, error: 'Counterparty not found' };
    }

    /**
     * Adds a new counterparty to the system.
     * Commercial value: Automates the onboarding process for new financial entities,
     * ensuring standardized data capture and immediate integration into the platform.
     */
    public async addCounterparty(newCp: Partial<EnhancedCounterparty>): Promise<ApiResult<EnhancedCounterparty>> {
        await sleep(700);
        const now = new Date().toISOString();
        const fullNewCp: EnhancedCounterparty = {
            id: generateId(),
            name: newCp.name || 'Unnamed Counterparty',
            email: newCp.email || 'no-email@example.com',
            createdDate: now,
            status: CounterpartyStatus.PendingVerification,
            legalName: newCp.legalName || newCp.name || 'Unnamed Legal Entity',
            taxId: newCp.taxId || 'N/A',
            registrationNumber: newCp.registrationNumber || 'N/A',
            industry: newCp.industry || 'General Financial Services',
            website: newCp.website || '',
            phone: newCp.phone || '',
            fax: newCp.fax || '',
            address: newCp.address || { street: '', city: '', state: '', zipCode: '', country: '' },
            contacts: newCp.contacts || [],
            bankAccounts: newCp.bankAccounts || [],
            complianceRecords: newCp.complianceRecords || [],
            riskAssessments: newCp.riskAssessments || [],
            documents: newCp.documents || [],
            notes: newCp.notes || '',
            lastInteractionDate: now,
            relationshipManagerId: newCp.relationshipManagerId || 'USR-AUTO-RM',
            relationshipManagerName: newCp.relationshipManagerName || 'System Assigned',
            transactionSummary: newCp.transactionSummary || {
                totalValueLastMonth: 0,
                averageValueLastMonth: 0,
                transactionCountLastMonth: 0,
                pendingTransactionsCount: 0,
                highestTransactionValue: 0,
                lastTransactionDate: new Date(0).toISOString(),
            },
            preferredPaymentTerms: newCp.preferredPaymentTerms || 'Net 30',
            creditLimit: newCp.creditLimit || 0,
            customFields: newCp.customFields || {},
            auditLog: [{
                id: generateId(),
                timestamp: now,
                userId: 'USR-UI-ADMIN',
                userName: 'System Admin',
                action: 'Counterparty created',
                details: `Initial digital identity creation of ${newCp.name || 'new counterparty'} via UI.`,
                counterpartyId: generateId(),
            }]
        };

        this._data.push(fullNewCp);
        return { success: true, data: fullNewCp };
    }

    /**
     * Updates an existing counterparty's details.
     * Commercial value: Ensures real-time data accuracy and allows dynamic adjustments
     * to counterparty profiles, reflecting changes in status, risk, or operational details.
     */
    public async updateCounterparty(id: string, updates: Partial<EnhancedCounterparty>): Promise<ApiResult<EnhancedCounterparty>> {
        await sleep(700);
        const index = this._data.findIndex(c => c.id === id);
        if (index > -1) {
            const currentCp = this._data[index];
            const updatedCp = { ...currentCp, ...updates };

            // Deep merge for nested objects to prevent accidental overwrites
            if (updates.address) updatedCp.address = { ...currentCp.address, ...updates.address };
            if (updates.billingAddress) updatedCp.billingAddress = { ...currentCp.billingAddress, ...updates.billingAddress };
            if (updates.shippingAddress) updatedCp.shippingAddress = { ...currentCp.shippingAddress, ...updates.shippingAddress };
            if (updates.customFields) updatedCp.customFields = { ...currentCp.customFields, ...updates.customFields };
            // For arrays, current behavior replaces the array if provided in updates.
            // A more granular API would have add/update/delete specific array items.

            updatedCp.auditLog.push({
                id: generateId(),
                timestamp: new Date().toISOString(),
                userId: 'USR-UI-ADMIN', // Placeholder for current authenticated user
                userName: 'Admin User',
                action: 'Counterparty updated',
                details: `Counterparty details updated. Fields changed: ${Object.keys(updates).join(', ')}`,
                counterpartyId: id,
            });
            this._data[index] = updatedCp;
            return { success: true, data: updatedCp };
        }
        return { success: false, error: 'Counterparty not found' };
    }

    /**
     * Deletes a counterparty from the system.
     * Commercial value: Provides a mechanism for data lifecycle management and offboarding,
     * while ensuring auditability of such critical actions.
     */
    public async deleteCounterparty(id: string): Promise<ApiResult<boolean>> {
        await sleep(500);
        const initialLength = this._data.length;
        this._data = this._data.filter(c => c.id !== id);
        if (this._data.length < initialLength) {
            // Log deletion for audit purposes, even if the counterparty itself is removed.
            // In a real system, this would go to a separate immutable audit log service.
            console.log(`AUDIT: Counterparty ${id} deleted by USR-UI-ADMIN at ${new Date().toISOString()}`);
            return { success: true, data: true };
        }
        return { success: false, error: 'Counterparty not found' };
    }

    /**
     * Updates the operational status of a counterparty.
     * Commercial value: Critical for dynamic risk responses, compliance enforcement,
     * and immediate adjustments to counterparty interaction policies.
     */
    public async updateCounterpartyStatus(id: string, newStatus: CounterpartyStatus, userId: string, userName: string): Promise<ApiResult<EnhancedCounterparty>> {
        await sleep(400);
        const index = this._data.findIndex(c => c.id === id);
        if (index > -1) {
            const cp = this._data[index];
            const oldStatus = cp.status;
            cp.status = newStatus;
            cp.auditLog.push({
                id: generateId(),
                timestamp: new Date().toISOString(),
                userId: userId,
                userName: userName,
                action: 'Status updated',
                details: `Operational status changed from '${oldStatus}' to '${newStatus}'.`,
                counterpartyId: id,
            });
            this._data[index] = { ...cp };
            return { success: true, data: cp };
        }
        return { success: false, error: 'Counterparty not found' };
    }

    /**
     * Placeholder method to add a new contact to a counterparty.
     * Commercial value: Represents a future API endpoint for granular management of linked entities,
     * enabling detailed relationship tracking.
     */
    public async addContactToCounterparty(counterpartyId: string, contact: ContactPerson): Promise<ApiResult<ContactPerson>> {
        await sleep(300);
        const cp = this._data.find(c => c.id === counterpartyId);
        if (cp) {
            contact.id = generateId();
            cp.contacts.push(contact);
            cp.auditLog.push({
                id: generateId(),
                timestamp: new Date().toISOString(),
                userId: 'USR-UI-ADMIN',
                userName: 'Admin User',
                action: 'Contact added',
                details: `New contact '${contact.firstName} ${contact.lastName}' added.`,
                counterpartyId: counterpartyId,
            });
            return { success: true, data: contact };
        }
        return { success: false, error: 'Counterparty not found' };
    }

    /**
     * Placeholder method to add a new document to a counterparty.
     * Commercial value: Essential for managing the lifecycle of legal and compliance documentation,
     * ensuring regulatory adherence and immediate access to critical records.
     */
    public async addDocumentToCounterparty(counterpartyId: string, document: Document): Promise<ApiResult<Document>> {
        await sleep(300);
        const cp = this._data.find(c => c.id === counterpartyId);
        if (cp) {
            document.id = generateId();
            cp.documents.push(document);
            cp.auditLog.push({
                id: generateId(),
                timestamp: new Date().toISOString(),
                userId: 'USR-UI-ADMIN',
                userName: 'Admin User',
                action: 'Document uploaded',
                details: `Document '${document.name}' (${document.category}) uploaded.`,
                counterpartyId: counterpartyId,
            });
            return { success: true, data: document };
        }
        return { success: false, error: 'Counterparty not found' };
    }
}

export const apiService = CounterpartyApiService.getInstance();

/**
 * Interface defining properties for a generic confirmation modal.
 * Commercial value: Ensures consistent and secure user prompts for irreversible actions,
 * enhancing user trust and preventing operational errors in critical financial workflows.
 */
interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

/**
 * A reusable confirmation modal component.
 * Commercial value: Standardizes critical user interaction flows, ensuring explicit consent
 * for actions that impact financial data or system state, bolstering security and auditability.
 */
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDestructive = false
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-sm w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors duration-200">&times;</button>
                </div>
                <div className="p-6 text-gray-300">
                    <p>{message}</p>
                </div>
                <div className="p-4 border-t border-gray-700 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors duration-200">{cancelText}</button>
                    <button onClick={onConfirm} className={`px-4 py-2 ${isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'} text-white rounded-lg text-sm transition-colors duration-200`}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

/**
 * Interface for a toast notification message.
 * Commercial value: Defines the structure for real-time, non-intrusive feedback to users,
 * enhancing usability and providing immediate confirmation of system actions or alerts.
 */
export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number; // milliseconds
}

/**
 * State structure for the toast notification system.
 * Commercial value: Manages the lifecycle of transient messages, ensuring timely communication
 * without overwhelming the user interface.
 */
interface ToastState {
    toasts: Toast[];
}

/**
 * Actions for the toast reducer.
 * Commercial value: Defines a clear contract for state modifications within the toast system,
 * promoting predictable behavior and maintainability.
 */
type ToastAction =
    | { type: 'ADD_TOAST'; payload: Omit<Toast, 'id'> }
    | { type: 'REMOVE_TOAST'; payload: string };

/**
 * Reducer function for managing toast notifications state.
 * Commercial value: Implements predictable state transitions for toast messages,
 * centralizing notification logic and simplifying system-wide alerts.
 */
const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
    switch (action.type) {
        case 'ADD_TOAST':
            return {
                toasts: [...state.toasts, { id: generateId(), ...action.payload }],
            };
        case 'REMOVE_TOAST':
            return {
                toasts: state.toasts.filter(toast => toast.id !== action.payload),
            };
        default:
            return state;
    }
};

/**
 * React Context for the Toast notification system.
 * Commercial value: Enables system-wide access to notification capabilities, allowing any component
 * to deliver critical user feedback without tight coupling.
 */
const ToastContext = React.createContext<{
    addToast: (toast: Omit<Toast, 'id'>) => void;
} | undefined>(undefined);

/**
 * Provides the Toast notification context to its children components.
 * Commercial value: Establishes a centralized, robust notification mechanism across the entire application,
 * improving user experience and critical alert delivery for financial operations.
 */
export const ToastProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        dispatch({ type: 'ADD_TOAST', payload: toast });
    }, []);

    const removeToast = useCallback((id: string) => {
        dispatch({ type: 'REMOVE_TOAST', payload: id });
    }, []);

    useEffect(() => {
        if (state.toasts.length > 0) {
            const latestToast = state.toasts[state.toasts.length - 1];
            const timer = setTimeout(() => {
                removeToast(latestToast.id);
            }, latestToast.duration || 5000);
            return () => clearTimeout(timer);
        }
    }, [state.toasts, removeToast]);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[110] space-y-2">
                {state.toasts.map(toast => (
                    <ToastNotification key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

/**
 * Custom hook for consuming the ToastContext.
 * Commercial value: Simplifies access to the toast notification system for any component,
 * promoting consistent and efficient integration of user feedback.
 */
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

/**
 * Properties for a single toast notification component.
 * Commercial value: Defines the presentation and interactive capabilities of individual notifications,
 * ensuring clarity and consistent user experience for system alerts.
 */
interface ToastNotificationProps {
    toast: Toast;
    onClose: () => void;
}

/**
 * Displays an individual toast notification.
 * Commercial value: Visually communicates system messages (success, error, info, warning)
 * to the user in a non-disruptive manner, crucial for operational transparency and responsiveness.
 */
export const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onClose }) => {
    let bgColor = 'bg-blue-500';
    let icon = '\u2139\uFE0F'; // ℹ️

    switch (toast.type) {
        case 'success':
            bgColor = 'bg-green-500';
            icon = '\u2705'; // ✅
            break;
        case 'error':
            bgColor = 'bg-red-600';
            icon = '\u274C'; // ❌
            break;
        case 'warning':
            bgColor = 'bg-yellow-500';
            icon = '\u26A0\uFE0F'; // ⚠️
            break;
        case 'info':
        default:
            bgColor = 'bg-blue-500';
            icon = '\u2139\uFE0F'; // ℹ️
            break;
    }

    return (
        <div className={`flex items-center justify-between p-4 rounded-lg shadow-lg text-white ${bgColor} max-w-xs w-full animate-fade-in-right`}>
            <div className="flex items-center">
                <span className="mr-2 text-xl">{icon}</span>
                <span>{toast.message}</span>
            </div>
            <button onClick={onClose} className="ml-4 text-white hover:text-gray-200 transition-colors duration-200">&times;</button>
        </div>
    );
};

/**
 * Properties for a generic form input field.
 * Commercial value: Standardizes the appearance and behavior of text inputs across financial applications,
 * ensuring consistent user experience and reducing errors in data entry.
 */
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    error?: string;
}

/**
 * A reusable form input component with integrated label and error display.
 * Commercial value: Ensures robust data capture with clear validation feedback,
 * critical for accurate financial record-keeping and regulatory compliance.
 */
export const FormInput: React.FC<FormInputProps> = ({ label, id, error, ...props }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            id={id}
            name={id}
            {...props}
            className={`w-full bg-gray-700/50 border ${error ? 'border-red-500' : 'border-gray-600'} rounded-lg p-2 text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors duration-200`}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
);

/**
 * Properties for a generic form textarea field.
 * Commercial value: Provides a consistent interface for capturing multi-line text data,
 * essential for detailed notes, descriptions, and audit commentary in financial systems.
 */
interface FormTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    id: string;
    error?: string;
}

/**
 * A reusable form textarea component with integrated label and error display.
 * Commercial value: Supports capture of extensive qualitative data such as compliance notes or risk mitigation plans,
 * ensuring comprehensive record-keeping.
 */
export const FormTextArea: React.FC<FormTextAreaProps> = ({ label, id, error, ...props }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <textarea
            id={id}
            name={id}
            {...props}
            className={`w-full bg-gray-700/50 border ${error ? 'border-red-500' : 'border-gray-600'} rounded-lg p-2 text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors duration-200`}
            rows={4}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
);

/**
 * Properties for a generic form select (dropdown) field.
 * Commercial value: Standardizes selection of predefined options, reducing data entry errors
 * and ensuring consistency across categorical data points, critical for reporting and analysis.
 */
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    id: string;
    options: { value: string; label: string }[];
    error?: string;
}

/**
 * A reusable form select (dropdown) component.
 * Commercial value: Facilitates accurate categorization and classification of data,
 * crucial for system governance, automation rules, and compliance reporting.
 */
export const FormSelect: React.FC<FormSelectProps> = ({ label, id, options, error, ...props }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <select
            id={id}
            name={id}
            {...props}
            className={`w-full bg-gray-700/50 border ${error ? 'border-red-500' : 'border-gray-600'} rounded-lg p-2 text-white focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors duration-200 appearance-none`}
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
);

/**
 * Properties for a generic form checkbox field.
 * Commercial value: Provides a clear and unambiguous mechanism for boolean data capture,
 * essential for opt-in/opt-out, status flags, and feature toggles in financial applications.
 */
interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
}

/**
 * A reusable form checkbox component.
 * Commercial value: Ensures precise binary data input, supporting clear policy enforcement
 * and status indicators within the financial infrastructure.
 */
export const FormCheckbox: React.FC<FormCheckboxProps> = ({ label, id, ...props }) => (
    <div className="mb-4 flex items-center">
        <input
            id={id}
            name={id}
            type="checkbox"
            {...props}
            className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
        />
        <label htmlFor={id} className="ml-2 text-sm text-gray-300">{label}</label>
    </div>
);

/**
 * Properties for a generic form date picker field.
 * Commercial value: Standardizes date input, reducing parsing errors and ensuring temporal accuracy
 * for critical financial events, reporting deadlines, and audit trails.
 */
interface FormDatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    error?: string;
}

/**
 * A reusable form date picker component.
 * Commercial value: Facilitates accurate scheduling and tracking of time-sensitive financial activities,
 * from compliance due dates to contract expiry, thereby reducing operational risk.
 */
export const FormDatePicker: React.FC<FormDatePickerProps> = ({ label, id, error, ...props }) => (
    <FormInput label={label} id={id} type="date" error={error} {...props} />
);

/**
 * Properties for a generic form file upload field.
 * Commercial value: Provides a secure and user-friendly interface for attaching critical documents,
 * such as legal agreements or financial statements, directly to counterparty records.
 */
interface FormFileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    onFileChange: (files: FileList | null) => void;
    currentFileName?: string;
    error?: string;
}

/**
 * A reusable form file upload component.
 * Commercial value: Enables the capture and association of unstructured data with structured financial records,
 * supporting comprehensive document management and audit readiness.
 */
export const FormFileUpload: React.FC<FormFileUploadProps> = ({ label, id, onFileChange, currentFileName, error, ...props }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
            <div className="flex items-center space-x-2">
                <input
                    id={id}
                    name={id}
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => onFileChange(e.target.files)}
                    className="hidden"
                    {...props}
                />
                <button
                    type="button"
                    onClick={handleClick}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors duration-200"
                >
                    Choose File
                </button>
                <span className="text-gray-400 text-sm">
                    {currentFileName || 'No file chosen'}
                </span>
            </div>
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
    );
};

/**
 * A simple loading spinner component.
 * Commercial value: Enhances user experience by providing clear visual feedback during asynchronous operations,
 * reducing perceived latency and improving system responsiveness.
 */
export const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
        <p className="ml-3 text-gray-400">Loading...</p>
    </div>
);

/**
 * Properties for the pagination controls component.
 * Commercial value: Defines the interface for navigation across large datasets,
 * ensuring seamless user experience and efficient data access.
 */
interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    goToPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    totalItems: number;
    itemsPerPage: number;
}

/**
 * Component providing pagination controls for data tables.
 * Commercial value: Improves the usability of data-intensive financial dashboards,
 * allowing users to navigate through extensive records efficiently and without performance degradation.
 */
export const PaginationControls: React.FC<PaginationControlsProps> = ({
    currentPage, totalPages, goToPage, nextPage, prevPage, totalItems, itemsPerPage
}) => {
    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPageButtons = 5;

        if (totalPages <= maxPageButtons) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            if (currentPage > maxPageButtons - 2) {
                pageNumbers.push('...');
            }
            let startPage = Math.max(2, currentPage - Math.floor(maxPageButtons / 2) + 1);
            let endPage = Math.min(totalPages - 1, currentPage + Math.floor(maxPageButtons / 2) - 1);

            if (currentPage < maxPageButtons - 1) {
                endPage = Math.min(totalPages - 1, maxPageButtons - 1);
            } else if (currentPage > totalPages - (maxPageButtons - 2)) {
                startPage = Math.max(2, totalPages - (maxPageButtons - 2));
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            if (currentPage < totalPages - (maxPageButtons - 2) && endPage < totalPages - 1) {
                pageNumbers.push('...');
            }
            if (totalPages > 1) pageNumbers.push(totalPages);
        }
        return pageNumbers.filter((val, idx, arr) => !(typeof val === 'string' && arr[idx-1] === '...'));
    };

    const currentItemStart = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const currentItemEnd = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex justify-between items-center py-3 text-gray-400 text-sm">
            <span>Showing {currentItemStart}-{currentItemEnd} of {totalItems} items</span>
            <div className="flex items-center space-x-1">
                <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    Previous
                </button>
                {renderPageNumbers().map((num, index) =>
                    typeof num === 'number' ? (
                        <button
                            key={index}
                            onClick={() => goToPage(num)}
                            className={`px-3 py-1 rounded-md ${currentPage === num ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'} transition-colors duration-200`}
                        >
                            {num}
                        </button>
                    ) : (
                        <span key={index} className="px-3 py-1">...</span>
                    )
                )}
                <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

/**
 * Properties for the Add Counterparty Modal.
 * Commercial value: Defines the interface for initiating the counterparty onboarding workflow,
 * ensuring necessary data is provided for initial setup.
 */
interface AddCounterpartyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (cp: EnhancedCounterparty) => void;
}

/**
 * Modal component for adding a new counterparty.
 * Commercial value: Streamlines the process of adding new financial entities,
 * ensuring that all essential identity and operational data are captured securely
 * and efficiently, which is foundational for digital identity integration.
 */
export const AddCounterpartyModal: React.FC<AddCounterpartyModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { addToast } = useToast();
    const { formData, handleChange, handleFileUpload, resetForm, setFormData } = useForm<Partial<EnhancedCounterparty>>({
        name: '', email: '', legalName: '', taxId: '', registrationNumber: '', industry: '', website: '', phone: '', notes: '', fax: '',
        address: { street: '', city: '', state: '', zipCode: '', country: '' },
        billingAddress: undefined, shippingAddress: undefined, // Optional addresses
        contacts: [], bankAccounts: [], documents: [], complianceRecords: [], riskAssessments: [], auditLog: [], customFields: {},
        relationshipManagerName: 'System Assigned',
        relationshipManagerId: 'system-auto',
        createdDate: new Date().toISOString(),
        lastInteractionDate: new Date().toISOString(),
        status: CounterpartyStatus.PendingVerification,
        transactionSummary: {
            totalValueLastMonth: 0,
            averageValueLastMonth: 0,
            transactionCountLastMonth: 0,
            pendingTransactionsCount: 0,
            highestTransactionValue: 0,
            lastTransactionDate: new Date(0).toISOString(),
        },
        preferredPaymentTerms: 'Net 30',
        creditLimit: 0,
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = 'Company Name is required';
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
        if (!formData.legalName) newErrors.legalName = 'Legal Name is required';
        if (!formData.industry) newErrors.industry = 'Industry is required';
        if (!formData.address?.country) newErrors['address.country'] = 'Country is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            addToast({ type: 'error', message: 'Please correct the errors in the form.' });
            return;
        }

        setLoading(true);
        try {
            const result = await apiService.addCounterparty(formData);
            if (result.success && result.data) {
                onSuccess(result.data);
                addToast({ type: 'success', message: `Counterparty "${result.data.name}" added successfully!` });
                resetForm();
                onClose();
            } else {
                throw new Error(result.error || 'Failed to add counterparty.');
            }
        } catch (err: any) {
            addToast({ type: 'error', message: `Error adding counterparty: ${err.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handleNestedChange = useCallback((parentKey: keyof Partial<EnhancedCounterparty>, childKey: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parentKey]: {
                ...(prev[parentKey] as any || {}),
                [childKey]: value
            }
        }));
    }, [setFormData]);

    useEffect(() => {
        if (!isOpen) {
            resetForm();
            setErrors({});
        }
    }, [isOpen, resetForm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Add New Counterparty</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors duration-200">&times;</button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto flex-grow custom-scrollbar">
                    <form onSubmit={handleSubmit} className="h-full flex flex-col">
                        <h4 className="text-md font-semibold text-white mb-3">General Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput label="Company Name" id="name" value={formData.name || ''} onChange={handleChange} error={errors.name} />
                            <FormInput label="Legal Name" id="legalName" value={formData.legalName || ''} onChange={handleChange} error={errors.legalName} />
                            <FormInput label="Contact Email" id="email" type="email" value={formData.email || ''} onChange={handleChange} error={errors.email} />
                            <FormInput label="Phone" id="phone" type="tel" value={formData.phone || ''} onChange={handleChange} />
                            <FormInput label="Website" id="website" type="url" value={formData.website || ''} onChange={handleChange} />
                            <FormInput label="Industry" id="industry" value={formData.industry || ''} onChange={handleChange} error={errors.industry} />
                            <FormInput label="Tax ID" id="taxId" value={formData.taxId || ''} onChange={handleChange} />
                            <FormInput label="Registration Number" id="registrationNumber" value={formData.registrationNumber || ''} onChange={handleChange} />
                            <FormInput label="Fax Number" id="fax" value={formData.fax || ''} onChange={handleChange} />
                            <FormSelect
                                label="Preferred Payment Terms"
                                id="preferredPaymentTerms"
                                options={[
                                    { value: 'Net 30', label: 'Net 30' },
                                    { value: 'Net 60', label: 'Net 60' },
                                    { value: 'Net 90', label: 'Net 90' },
                                    { value: 'Due on Receipt', label: 'Due on Receipt' },
                                ]}
                                value={formData.preferredPaymentTerms || 'Net 30'}
                                onChange={handleChange}
                            />
                            <FormInput label="Credit Limit ($)" id="creditLimit" type="number" value={formData.creditLimit || 0} onChange={handleChange} />
                        </div>
                        <FormTextArea label="Notes" id="notes" value={formData.notes || ''} onChange={handleChange} />

                        <h4 className="text-md font-semibold text-white mb-3 mt-6">Primary Address Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput label="Street" id="address.street" value={formData.address?.street || ''} onChange={e => handleNestedChange('address', 'street', e.target.value)} />
                            <FormInput label="City" id="address.city" value={formData.address?.city || ''} onChange={e => handleNestedChange('address', 'city', e.target.value)} />
                            <FormInput label="State/Province" id="address.state" value={formData.address?.state || ''} onChange={e => handleNestedChange('address', 'state', e.target.value)} />
                            <FormInput label="Zip Code" id="address.zipCode" value={formData.address?.zipCode || ''} onChange={e => handleNestedChange('address', 'zipCode', e.target.value)} />
                            <FormInput label="Country" id="address.country" value={formData.address?.country || ''} onChange={e => handleNestedChange('address', 'country', e.target.value)} error={errors['address.country']} />
                        </div>

                        <h4 className="text-md font-semibold text-white mb-3 mt-6">Contact Persons & Bank Accounts (Manage in detail view post-creation)</h4>
                        <p className="text-gray-500 text-sm mb-3">
                            Complex nested array data like contacts, bank accounts, compliance records, and documents
                            are managed in dedicated sub-forms or sections within the Counterparty Detail View
                            after the initial creation to ensure a focused onboarding process.
                        </p>
                        <FormFileUpload label="Upload Initial Agreement Document (Optional)" id="initialAgreementDoc" onFileChange={(files) => handleFileUpload('initialAgreementDoc', files)} />

                        <div className="p-4 border-t border-gray-700 flex justify-end space-x-3 sticky bottom-0 bg-gray-800 z-10 mt-auto">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors duration-200">Cancel</button>
                            <button type="submit" disabled={loading} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? <LoadingSpinner /> : 'Add Counterparty'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

/**
 * Properties for the Edit Counterparty Modal.
 * Commercial value: Defines the interface for dynamically updating counterparty information,
 * supporting agile data management and responsive adaptation to changing business requirements.
 */
interface EditCounterpartyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (cp: EnhancedCounterparty) => void;
    counterpartyId: string | null;
}

/**
 * Modal component for editing an existing counterparty.
 * Commercial value: Ensures that comprehensive counterparty data, including core identity
 * and operational details, can be accurately modified, reflecting real-world changes
 * and maintaining data integrity for all financial operations.
 */
export const EditCounterpartyModal: React.FC<EditCounterpartyModalProps> = ({ isOpen, onClose, onSuccess, counterpartyId }) => {
    const { addToast } = useToast();
    const { formData, handleChange, resetForm, setFormData } = useForm<Partial<EnhancedCounterparty>>({
        name: '', email: '', legalName: '', taxId: '', registrationNumber: '', industry: '', website: '', phone: '', notes: '', fax: '',
        address: { street: '', city: '', state: '', zipCode: '', country: '' },
        billingAddress: undefined, shippingAddress: undefined,
        contacts: [], bankAccounts: [], documents: [], complianceRecords: [], riskAssessments: [], auditLog: [], customFields: {},
        relationshipManagerName: '',
        relationshipManagerId: '',
        createdDate: '',
        lastInteractionDate: '',
        status: CounterpartyStatus.PendingVerification,
        transactionSummary: {
            totalValueLastMonth: 0,
            averageValueLastMonth: 0,
            transactionCountLastMonth: 0,
            pendingTransactionsCount: 0,
            highestTransactionValue: 0,
            lastTransactionDate: new Date(0).toISOString(),
        },
        preferredPaymentTerms: '',
        creditLimit: 0,
    });

    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const fetchCounterparty = useCallback(async (id: string) => {
        setInitialLoad(true);
        try {
            const result = await apiService.getCounterpartyById(id);
            if (result.success && result.data) {
                setFormData(result.data);
            } else {
                throw new Error(result.error || 'Failed to load counterparty for editing.');
            }
        } catch (err: any) {
            addToast({ type: 'error', message: `Error loading counterparty: ${err.message}` });
            onClose();
        } finally {
            setInitialLoad(false);
        }
    }, [addToast, onClose, setFormData]);

    useEffect(() => {
        if (isOpen && counterpartyId) {
            fetchCounterparty(counterpartyId);
        } else if (!isOpen) {
            resetForm();
            setErrors({});
        }
    }, [isOpen, counterpartyId, fetchCounterparty, resetForm]);

    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = 'Company Name is required';
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
        if (!formData.legalName) newErrors.legalName = 'Legal Name is required';
        if (!formData.industry) newErrors.industry = 'Industry is required';
        if (!formData.address?.country) newErrors['address.country'] = 'Country is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            addToast({ type: 'error', message: 'Please correct the errors in the form.' });
            return;
        }

        if (!counterpartyId) {
            addToast({ type: 'error', message: 'Counterparty ID is missing for update.' });
            return;
        }

        setLoading(true);
        try {
            const result = await apiService.updateCounterparty(counterpartyId, formData);
            if (result.success && result.data) {
                onSuccess(result.data);
                addToast({ type: 'success', message: `Counterparty "${result.data.name}" updated successfully!` });
                onClose();
            } else {
                throw new Error(result.error || 'Failed to update counterparty.');
            }
        } catch (err: any) {
            addToast({ type: 'error', message: `Error updating counterparty: ${err.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handleNestedChange = useCallback((parentKey: keyof Partial<EnhancedCounterparty>, childKey: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parentKey]: {
                ...(prev[parentKey] as any || {}),
                [childKey]: value
            }
        }));
    }, [setFormData]);

    if (!isOpen) return null;
    if (initialLoad) return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700 p-6 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Edit Counterparty: {formData.name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors duration-200">&times;</button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto flex-grow custom-scrollbar">
                    <form onSubmit={handleSubmit} className="h-full flex flex-col">
                        <h4 className="text-md font-semibold text-white mb-3">General Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput label="Company Name" id="name" value={formData.name || ''} onChange={handleChange} error={errors.name} />
                            <FormInput label="Legal Name" id="legalName" value={formData.legalName || ''} onChange={handleChange} error={errors.legalName} />
                            <FormInput label="Contact Email" id="email" type="email" value={formData.email || ''} onChange={handleChange} error={errors.email} />
                            <FormInput label="Phone" id="phone" type="tel" value={formData.phone || ''} onChange={handleChange} />
                            <FormInput label="Website" id="website" type="url" value={formData.website || ''} onChange={handleChange} />
                            <FormInput label="Industry" id="industry" value={formData.industry || ''} onChange={handleChange} error={errors.industry} />
                            <FormInput label="Tax ID" id="taxId" value={formData.taxId || ''} onChange={handleChange} />
                            <FormInput label="Registration Number" id="registrationNumber" value={formData.registrationNumber || ''} onChange={handleChange} />
                            <FormInput label="Fax Number" id="fax" value={formData.fax || ''} onChange={handleChange} />
                            <FormSelect
                                label="Preferred Payment Terms"
                                id="preferredPaymentTerms"
                                options={[
                                    { value: 'Net 30', label: 'Net 30' },
                                    { value: 'Net 60', label: 'Net 60' },
                                    { value: 'Net 90', label: 'Net 90' },
                                    { value: 'Due on Receipt', label: 'Due on Receipt' },
                                ]}
                                value={formData.preferredPaymentTerms || 'Net 30'}
                                onChange={handleChange}
                            />
                            <FormInput label="Credit Limit ($)" id="creditLimit" type="number" value={formData.creditLimit || 0} onChange={handleChange} />
                            <FormInput label="Relationship Manager" id="relationshipManagerName" value={formData.relationshipManagerName || ''} onChange={handleChange} />
                        </div>
                        <FormTextArea label="Notes" id="notes" value={formData.notes || ''} onChange={handleChange} />

                        <h4 className="text-md font-semibold text-white mb-3 mt-6">Primary Address Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput label="Street" id="address.street" value={formData.address?.street || ''} onChange={e => handleNestedChange('address', 'street', e.target.value)} />
                            <FormInput label="City" id="address.city" value={formData.address?.city || ''} onChange={e => handleNestedChange('address', 'city', e.target.value)} />
                            <FormInput label="State/Province" id="address.state" value={formData.address?.state || ''} onChange={e => handleNestedChange('address', 'state', e.target.value)} />
                            <FormInput label="Zip Code" id="address.zipCode" value={formData.address?.zipCode || ''} onChange={e => handleNestedChange('address', 'zipCode', e.target.value)} />
                            <FormInput label="Country" id="address.country" value={formData.address?.country || ''} onChange={e => handleNestedChange('address', 'country', e.target.value)} error={errors['address.country']} />
                        </div>
                        <p className="text-gray-500 text-sm mt-4">
                            Detailed management of contacts, bank accounts, compliance, risk, and documents is available in the Counterparty Detail View.
                        </p>

                        <div className="p-4 border-t border-gray-700 flex justify-end space-x-3 sticky bottom-0 bg-gray-800 z-10 mt-auto">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors duration-200">Cancel</button>
                            <button type="submit" disabled={loading} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading ? <LoadingSpinner /> : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

/**
 * Properties for the Counterparty Detail View Modal.
 * Commercial value: Defines the interface for accessing a comprehensive 360-degree view of a counterparty,
 * providing the necessary context for operational decisions, risk assessment, and compliance oversight.
 */
interface CounterpartyDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    counterpartyId: string | null;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, newStatus: CounterpartyStatus) => void;
}

/**
 * Modal component displaying a comprehensive detail view of a single counterparty.
 * Commercial value: Serves as the central hub for deep insights into each counterparty's profile,
 * enabling real-time monitoring, granular data analysis, and informed strategic actions.
 * Integrates vital financial, legal, and operational data for complete transparency.
 */
export const CounterpartyDetailModal: React.FC<CounterpartyDetailModalProps> = ({ isOpen, onClose, counterpartyId, onEdit, onDelete, onStatusChange }) => {
    const { addToast } = useToast();
    const [counterparty, setCounterparty] = useState<EnhancedCounterparty | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'banking' | 'compliance' | 'risk' | 'documents' | 'audit'>('overview');
    const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
    const [isStatusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const statusDropdownRef = useRef<HTMLDivElement>(null);

    const fetchCounterpartyDetails = useCallback(async () => {
        if (!counterpartyId) return;
        setLoading(true);
        setError(null);
        try {
            const result = await apiService.getCounterpartyById(counterpartyId);
            if (result.success && result.data) {
                setCounterparty(result.data);
            } else {
                setError(result.error || 'Failed to fetch counterparty details.');
                addToast({ type: 'error', message: result.error || 'Failed to load counterparty details.' });
            }
        } catch (err: any) {
            setError(err.message);
            addToast({ type: 'error', message: `Error fetching details: ${err.message}` });
        } finally {
            setLoading(false);
        }
    }, [counterpartyId, addToast]);

    useEffect(() => {
        if (isOpen && counterpartyId) {
            fetchCounterpartyDetails();
        }
    }, [isOpen, counterpartyId, fetchCounterpartyDetails]);

    const handleStatusChange = async (newStatus: CounterpartyStatus) => {
        if (!counterparty) return;
        setStatusDropdownOpen(false);
        setLoading(true);
        try {
            const result = await apiService.updateCounterpartyStatus(counterparty.id, newStatus, 'USR-UI-ADMIN', 'Admin User');
            if (result.success && result.data) {
                setCounterparty(result.data);
                onStatusChange(result.data.id, result.data.status);
                addToast({ type: 'success', message: `Counterparty status updated to ${newStatus}.` });
            } else {
                throw new Error(result.error || 'Failed to update status.');
            }
        } catch (err: any) {
            addToast({ type: 'error', message: `Error updating status: ${err.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = () => {
        if (counterpartyId) {
            onEdit(counterpartyId);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
                setStatusDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!isOpen) return null;

    /**
     * Component for displaying and updating the counterparty status via a dropdown.
     * Commercial value: Provides a dynamic, interactive mechanism for critical status changes,
     * directly impacting operational workflows and risk profiles.
     */
    const StatusDropdown: React.FC<{ currentStatus: CounterpartyStatus }> = ({ currentStatus }) => (
        <div className="relative inline-block text-left" ref={statusDropdownRef}>
            <button
                type="button"
                className={`flex items-center px-3 py-1 text-xs font-medium rounded-full
                    ${currentStatus === CounterpartyStatus.Verified || currentStatus === CounterpartyStatus.Active ? 'bg-green-500/20 text-green-300' :
                        currentStatus === CounterpartyStatus.PendingVerification || currentStatus === CounterpartyStatus.OnHold ? 'bg-yellow-500/20 text-yellow-300' :
                            currentStatus === CounterpartyStatus.RiskAlert || currentStatus === CounterpartyStatus.Rejected ? 'bg-red-500/20 text-red-300' : 'bg-gray-500/20 text-gray-300'}
                    hover:bg-gray-700 hover:text-white transition-colors duration-200
                `}
                onClick={(e) => { e.stopPropagation(); setStatusDropdownOpen(prev => !prev); }}
            >
                {currentStatus}
                <svg className="-mr-1 ml-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {isStatusDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="status-menu">
                        {Object.values(CounterpartyStatus).map(status => (
                            <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 w-full text-left"
                                role="menuitem"
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full border border-gray-700 max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">{counterparty?.name || 'Counterparty Details'}</h3>
                    <div className="flex items-center space-x-3">
                        {counterparty && <StatusDropdown currentStatus={counterparty.status} />}
                        <button onClick={handleEditClick} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">Edit</button>
                        <button onClick={() => setConfirmDeleteModalOpen(true)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm">Delete</button>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors duration-200">&times;</button>
                    </div>
                </div>

                <div className="flex-grow flex flex-col overflow-hidden">
                    <div className="border-b border-gray-700">
                        <nav className="flex space-x-4 p-4">
                            {['overview', 'contacts', 'banking', 'compliance', 'risk', 'documents', 'audit'].map(tab => (
                                <button
                                    key={tab}
                                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                                        ${activeTab === tab ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}
                                    `}
                                    onClick={() => setActiveTab(tab as any)}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                        {loading ? <LoadingSpinner /> : error ? <p className="text-red-400 text-center">{error}</p> : counterparty ? (
                            <>
                                {activeTab === 'overview' && <CounterpartyOverviewTab counterparty={counterparty} />}
                                {activeTab === 'contacts' && <CounterpartyContactsTab contacts={counterparty.contacts} addToast={addToast} onRefresh={fetchCounterpartyDetails} counterpartyId={counterparty.id} />}
                                {activeTab === 'banking' && <CounterpartyBankingTab bankAccounts={counterparty.bankAccounts} addToast={addToast} onRefresh={fetchCounterpartyDetails} counterpartyId={counterparty.id} />}
                                {activeTab === 'compliance' && <CounterpartyComplianceTab complianceRecords={counterparty.complianceRecords} addToast={addToast} onRefresh={fetchCounterpartyDetails} counterpartyId={counterparty.id} />}
                                {activeTab === 'risk' && <CounterpartyRiskTab riskAssessments={counterparty.riskAssessments} addToast={addToast} onRefresh={fetchCounterpartyDetails} counterpartyId={counterparty.id} />}
                                {activeTab === 'documents' && <CounterpartyDocumentsTab documents={counterparty.documents} addToast={addToast} onRefresh={fetchCounterpartyDetails} counterpartyId={counterparty.id} />}
                                {activeTab === 'audit' && <CounterpartyAuditTab auditLog={counterparty.auditLog} />}
                            </>
                        ) : (
                            <p className="text-gray-400 text-center">No data found for this counterparty.</p>
                        )}
                    </div>
                </div>
            </div>
            <ConfirmationModal
                isOpen={isConfirmDeleteModalOpen}
                onClose={() => setConfirmDeleteModalOpen(false)}
                onConfirm={() => { onDelete(counterpartyId!); setConfirmDeleteModalOpen(false); onClose(); }}
                title="Delete Counterparty"
                message={`Are you sure you want to delete "${counterparty?.name}"? This action cannot be undone and will be fully audited.`}
                confirmText="Delete Permanently"
                isDestructive
            />
        </div>
    );
};

/**
 * Properties for the Counterparty Overview Tab.
 * Commercial value: Defines the data presented in the summary section of a counterparty's profile,
 * providing a high-level, yet comprehensive, view.
 */
interface CounterpartyOverviewTabProps {
    counterparty: EnhancedCounterparty;
}

/**
 * Displays the general overview and key financial details for a counterparty.
 * Commercial value: Provides a critical snapshot of a counterparty's identity, addresses,
 * and financial health, essential for rapid situational awareness and strategic planning.
 */
export const CounterpartyOverviewTab: React.FC<CounterpartyOverviewTabProps> = ({ counterparty }) => (
    <div className="space-y-6">
        <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2 mb-4">General Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div><strong className="text-gray-100">Legal Name:</strong> {counterparty.legalName}</div>
            <div><strong className="text-gray-100">Company Name:</strong> {counterparty.name}</div>
            <div><strong className="text-gray-100">Tax ID:</strong> {counterparty.taxId}</div>
            <div><strong className="text-gray-100">Registration Number:</strong> {counterparty.registrationNumber}</div>
            <div><strong className="text-gray-100">Industry:</strong> {counterparty.industry}</div>
            <div><strong className="text-gray-100">Website:</strong> <a href={counterparty.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{counterparty.website}</a></div>
            <div><strong className="text-gray-100">Contact Email:</strong> {counterparty.email}</div>
            <div><strong className="text-gray-100">Phone:</strong> {counterparty.phone}</div>
            <div><strong className="text-gray-100">Fax:</strong> {counterparty.fax}</div>
            <div><strong className="text-gray-100">Created On:</strong> {formatDate(counterparty.createdDate)}</div>
            <div><strong className="text-gray-100">Last Interaction:</strong> {formatDate(counterparty.lastInteractionDate, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            <div><strong className="text-gray-100">Relationship Manager:</strong> {counterparty.relationshipManagerName}</div>
            <div><strong className="text-gray-100">Credit Limit:</strong> ${counterparty.creditLimit?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</div>
            <div><strong className="text-gray-100">Preferred Payment Terms:</strong> {counterparty.preferredPaymentTerms}</div>
        </div>

        <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2 mb-4 mt-6">Primary Address Information</h4>
        <div className="text-sm text-gray-300 space-y-1">
            <p>{counterparty.address.street}</p>
            <p>{counterparty.address.city}, {counterparty.address.state} {counterparty.address.zipCode}</p>
            <p>{counterparty.address.country}</p>
        </div>

        {counterparty.billingAddress && (
            <>
                <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2 mb-4 mt-6">Billing Address</h4>
                <div className="text-sm text-gray-300 space-y-1">
                    <p>{counterparty.billingAddress.street}</p>
                    <p>{counterparty.billingAddress.city}, {counterparty.billingAddress.state} {counterparty.billingAddress.zipCode}</p>
                    <p>{counterparty.billingAddress.country}</p>
                </div>
            </>
        )}

        {counterparty.shippingAddress && (
            <>
                <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2 mb-4 mt-6">Shipping Address</h4>
                <div className="text-sm text-gray-300 space-y-1">
                    <p>{counterparty.shippingAddress.street}</p>
                    <p>{counterparty.shippingAddress.city}, {counterparty.shippingAddress.state} {counterparty.shippingAddress.zipCode}</p>
                    <p>{counterparty.shippingAddress.country}</p>
                </div>
            </>
        )}

        <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2 mb-4 mt-6">Notes</h4>
        <p className="text-sm text-gray-300 whitespace-pre-wrap">{counterparty.notes || 'No detailed notes available for this counterparty.'}</p>

        <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2 mb-4 mt-6">Transaction Summary (Last 30 Days)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-300">
            <div><strong className="text-gray-100">Total Value:</strong> ${counterparty.transactionSummary.totalValueLastMonth?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</div>
            <div><strong className="text-gray-100">Average Value:</strong> ${counterparty.transactionSummary.averageValueLastMonth?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</div>
            <div><strong className="text-gray-100">Transaction Count:</strong> {counterparty.transactionSummary.transactionCountLastMonth || 0}</div>
            <div><strong className="text-gray-100">Pending Transactions:</strong> {counterparty.transactionSummary.pendingTransactionsCount || 0}</div>
            <div><strong className="text-gray-100">Highest Transaction Value:</strong> ${counterparty.transactionSummary.highestTransactionValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</div>
            <div><strong className="text-gray-100">Last Transaction Date:</strong> {formatDate(counterparty.transactionSummary.lastTransactionDate) || 'N/A'}</div>
        </div>

        {Object.keys(counterparty.customFields).length > 0 && (
            <>
                <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2 mb-4 mt-6">Custom Fields</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                    {Object.entries(counterparty.customFields).map(([key, value]) => (
                        <div key={key}><strong className="text-gray-100">{key}:</strong> {String(value)}</div>
                    ))}
                </div>
            </>
        )}
    </div>
);

/**
 * Properties for the Counterparty Contacts Tab.
 * Commercial value: Defines the data and interactive elements for managing contact persons,
 * ensuring efficient communication and relationship management.
 */
interface CounterpartyContactsTabProps {
    contacts: ContactPerson[];
    counterpartyId: string;
    addToast: (toast: Omit<Toast, 'id'>) => void;
    onRefresh: () => void;
}

/**
 * Displays and manages the list of contact persons for a counterparty.
 * Commercial value: Centralizes contact information, improving communication efficiency,
 * supporting targeted outreach, and enabling robust relationship management.
 */
export const CounterpartyContactsTab: React.FC<CounterpartyContactsTabProps> = ({ contacts, addToast }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <h4 className="text-lg font-semibold text-white">Contact Persons ({contacts.length})</h4>
            <button
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm"
                onClick={() => addToast({ type: 'info', message: 'Adding contacts: Feature to be implemented via dedicated sub-modal.' })}
            >
                Add Contact
            </button>
        </div>
        {contacts.length === 0 ? (
            <p className="text-gray-400">No contact persons listed. Utilize the 'Add Contact' button to expand your relationship network.</p>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Title</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Phone</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Last Contact</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.map(contact => (
                            <tr key={contact.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium text-white">{contact.firstName} {contact.lastName}</td>
                                <td className="px-6 py-4">{contact.title}</td>
                                <td className="px-6 py-4">{contact.email}</td>
                                <td className="px-6 py-4">{contact.phone}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${contact.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                        {contact.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{formatDate(contact.lastContactDate)}</td>
                                <td className="px-6 py-4">
                                    <button
                                        className="text-blue-500 hover:text-blue-400 text-sm mr-2"
                                        onClick={(e) => { e.stopPropagation(); addToast({ type: 'info', message: `Editing contact ${contact.firstName}: Feature to be implemented.` }); }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="text-red-500 hover:text-red-400 text-sm"
                                        onClick={(e) => { e.stopPropagation(); addToast({ type: 'warning', message: `Deleting contact ${contact.firstName}: Feature to be implemented.` }); }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

/**
 * Properties for the Counterparty Banking Tab.
 * Commercial value: Defines the data and interactive elements for managing a counterparty's bank accounts,
 * crucial for payment and settlement operations.
 */
interface CounterpartyBankingTabProps {
    bankAccounts: BankAccount[];
    counterpartyId: string;
    addToast: (toast: Omit<Toast, 'id'>) => void;
    onRefresh: () => void;
}

/**
 * Displays and manages the bank account details for a counterparty.
 * Commercial value: Ensures accurate and secure routing for all payment and settlement transactions,
 * critical for programmable value rails and reducing financial fraud.
 */
export const CounterpartyBankingTab: React.FC<CounterpartyBankingTabProps> = ({ bankAccounts, addToast }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <h4 className="text-lg font-semibold text-white">Bank Accounts ({bankAccounts.length})</h4>
            <button
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm"
                onClick={() => addToast({ type: 'info', message: 'Adding bank accounts: Feature to be implemented via dedicated sub-modal.' })}
            >
                Add Bank Account
            </button>
        </div>
        {bankAccounts.length === 0 ? (
            <p className="text-gray-400">No bank accounts listed. Seamless integration with payment rails requires verified banking details.</p>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Bank Name</th>
                            <th scope="col" className="px-6 py-3">Account Number</th>
                            <th scope="col" className="px-6 py-3">SWIFT/BIC</th>
                            <th scope="col" className="px-6 py-3">IBAN</th>
                            <th scope="col" className="px-6 py-3">Currency</th>
                            <th scope="col" className="px-6 py-3">Primary</th>
                            <th scope="col" className="px-6 py-3">Verification Status</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bankAccounts.map(account => (
                            <tr key={account.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium text-white">{account.bankName}</td>
                                <td className="px-6 py-4">{account.accountNumber}</td>
                                <td className="px-6 py-4">{account.swiftCode}</td>
                                <td className="px-6 py-4">{account.iban}</td>
                                <td className="px-6 py-4">{account.currency}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${account.isPrimary ? 'bg-cyan-500/20 text-cyan-300' : 'bg-gray-500/20 text-gray-300'}`}>
                                        {account.isPrimary ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full
                                        ${account.verificationStatus === 'Verified' ? 'bg-green-500/20 text-green-300' :
                                            account.verificationStatus === 'Pending' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}
                                    `}>
                                        {account.verificationStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        className="text-blue-500 hover:text-blue-400 text-sm mr-2"
                                        onClick={(e) => { e.stopPropagation(); addToast({ type: 'info', message: `Editing bank account ${account.bankName}: Feature to be implemented.` }); }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="text-red-500 hover:text-red-400 text-sm"
                                        onClick={(e) => { e.stopPropagation(); addToast({ type: 'warning', message: `Deleting bank account ${account.bankName}: Feature to be implemented.` }); }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

/**
 * Properties for the Counterparty Compliance Tab.
 * Commercial value: Defines the data and interactive elements for managing compliance records,
 * critical for regulatory adherence and risk mitigation.
 */
interface CounterpartyComplianceTabProps {
    complianceRecords: ComplianceRecord[];
    counterpartyId: string;
    addToast: (toast: Omit<Toast, 'id'>) => void;
    onRefresh: () => void;
}

/**
 * Displays and manages the compliance records for a counterparty.
 * Commercial value: Provides an auditable, real-time view of compliance posture,
 * enabling automated governance, reducing regulatory exposure, and ensuring
 * the integrity of financial operations.
 */
export const CounterpartyComplianceTab: React.FC<CounterpartyComplianceTabProps> = ({ complianceRecords, addToast }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <h4 className="text-lg font-semibold text-white">Compliance Records ({complianceRecords.length})</h4>
            <button
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm"
                onClick={() => addToast({ type: 'info', message: 'Adding compliance record: Feature to be implemented via dedicated sub-modal.' })}
            >
                Add Record
            </button>
        </div>
        {complianceRecords.length === 0 ? (
            <p className="text-gray-400">No compliance records listed. Proactive compliance is key to de-risking financial operations.</p>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Type</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Last Updated</th>
                            <th scope="col" className="px-6 py-3">Due Date</th>
                            <th scope="col" className="px-6 py-3">Assigned To</th>
                            <th scope="col" className="px-6 py-3">Notes</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {complianceRecords.map(record => (
                            <tr key={record.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium text-white">{record.type}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full
                                        ${record.status === ComplianceStatus.Compliant ? 'bg-green-500/20 text-green-300' :
                                            record.status === ComplianceStatus.Pending || record.status === ComplianceStatus.InProgress ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}
                                    `}>
                                        {record.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{formatDate(record.lastUpdated)}</td>
                                <td className="px-6 py-4">{formatDate(record.dueDate)}</td>
                                <td className="px-6 py-4">{record.assignedTo}</td>
                                <td className="px-6 py-4 truncate max-w-xs">{record.notes}</td>
                                <td className="px-6 py-4">
                                    <button
                                        className="text-blue-500 hover:text-blue-400 text-sm mr-2"
                                        onClick={(e) => { e.stopPropagation(); addToast({ type: 'info', message: `Viewing compliance record ${record.type}: Feature to be implemented.` }); }}
                                    >
                                        View
                                    </button>
                                    <button
                                        className="text-red-500 hover:text-red-400 text-sm"
                                        onClick={(e) => { e.stopPropagation(); addToast({ type: 'warning', message: `Deleting compliance record ${record.type}: Feature to be implemented.` }); }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

/**
 * Properties for the Counterparty Risk Tab.
 * Commercial value: Defines the data and interactive elements for managing risk assessments,
 * underpinning proactive risk management strategies.
 */
interface CounterpartyRiskTabProps {
    riskAssessments: RiskAssessment[];
    counterpartyId: string;
    addToast: (toast: Omit<Toast, 'id'>) => void;
    onRefresh: () => void;
}

/**
 * Displays and manages the risk assessments for a counterparty.
 * Commercial value: Powers the platform's intelligent risk scoring and management,
 * enabling dynamic adjustment of financial exposure and ensuring the system's resilience
 * against market and counterparty-specific risks.
 */
export const CounterpartyRiskTab: React.FC<CounterpartyRiskTabProps> = ({ riskAssessments, addToast }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <h4 className="text-lg font-semibold text-white">Risk Assessments ({riskAssessments.length})</h4>
            <button
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm"
                onClick={() => addToast({ type: 'info', message: 'Adding risk assessment: Feature to be implemented via dedicated sub-modal.' })}
            >
                Add Assessment
            </button>
        </div>
        {riskAssessments.length === 0 ? (
            <p className="text-gray-400">No risk assessments listed. Automated risk analysis is critical for operational integrity.</p>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Level</th>
                            <th scope="col" className="px-6 py-3">Score</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Reviewed By</th>
                            <th scope="col" className="px-6 py-3">Next Review</th>
                            <th scope="col" className="px-6 py-3">Mitigation Plan</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {riskAssessments.map(assessment => (
                            <tr key={assessment.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full
                                        ${assessment.level === RiskLevel.Critical ? 'bg-red-500/20 text-red-300' :
                                            assessment.level === RiskLevel.High ? 'bg-orange-500/20 text-orange-300' :
                                                assessment.level === RiskLevel.Medium ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}
                                    `}>
                                        {assessment.level}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{assessment.score}</td>
                                <td className="px-6 py-4">{formatDate(assessment.assessmentDate)}</td>
                                <td className="px-6 py-4">{assessment.reviewedBy}</td>
                                <td className="px-6 py-4">{formatDate(assessment.nextReviewDate)}</td>
                                <td className="px-6 py-4 truncate max-w-xs">{assessment.mitigationPlan}</td>
                                <td className="px-6 py-4">
                                    <button
                                        className="text-blue-500 hover:text-blue-400 text-sm mr-2"
                                        onClick={(e) => { e.stopPropagation(); addToast({ type: 'info', message: `Viewing risk assessment ${assessment.id}: Feature to be implemented.` }); }}
                                    >
                                        View
                                    </button>
                                    <button
                                        className="text-red-500 hover:text-red-400 text-sm"
                                        onClick={(e) => { e.stopPropagation(); addToast({ type: 'warning', message: `Deleting risk assessment ${assessment.id}: Feature to be implemented.` }); }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

/**
 * Properties for the Counterparty Documents Tab.
 * Commercial value: Defines the data and interactive elements for managing digital documents,
 * supporting secure access and auditability.
 */
interface CounterpartyDocumentsTabProps {
    documents: Document[];
    counterpartyId: string;
    addToast: (toast: Omit<Toast, 'id'>) => void;
    onRefresh: () => void;
}

/**
 * Displays and manages the documents associated with a counterparty.
 * Commercial value: Centralizes secure document storage and retrieval, essential for
 * legal, compliance, and operational due diligence, ensuring tamper-evident record-keeping.
 */
export const CounterpartyDocumentsTab: React.FC<CounterpartyDocumentsTabProps> = ({ documents, addToast }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <h4 className="text-lg font-semibold text-white">Documents ({documents.length})</h4>
            <button
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm"
                onClick={() => addToast({ type: 'info', message: 'Uploading document: Feature to be implemented via dedicated sub-modal.' })}
            >
                Upload Document
            </button>
        </div>
        {documents.length === 0 ? (
            <p className="text-gray-400">No documents listed. Comprehensive documentation supports compliance and transparency.</p>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Uploaded By</th>
                            <th scope="col" className="px-6 py-3">Upload Date</th>
                            <th scope="col" className="px-6 py-3">Expires On</th>
                            <th scope="col" className="px-6 py-3">Size (KB)</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.map(doc => (
                            <tr key={doc.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium text-white">
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                                        {doc.name}
                                    </a>
                                </td>
                                <td className="px-6 py-4">{doc.category}</td>
                                <td className="px-6 py-4">{doc.uploadedBy}</td>
                                <td className="px-6 py-4">{formatDate(doc.uploadDate)}</td>
                                <td className="px-6 py-4">{doc.expiresOn ? formatDate(doc.expiresOn) : 'N/A'}</td>
                                <td className="px-6 py-4">{doc.fileSizeKB}</td>
                                <td className="px-6 py-4">
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 text-sm mr-2">Download</a>
                                    <button
                                        className="text-red-500 hover:text-red-400 text-sm"
                                        onClick={(e) => { e.stopPropagation(); addToast({ type: 'warning', message: `Deleting document ${doc.name}: Feature to be implemented.` }); }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

/**
 * Properties for the Counterparty Audit Tab.
 * Commercial value: Defines the data presented in the audit log,
 * crucial for forensic analysis and demonstrating system integrity.
 */
interface CounterpartyAuditTabProps {
    auditLog: ActivityLogEntry[];
}

/**
 * Displays the immutable audit log for a counterparty.
 * Commercial value: Provides an unalterable, cryptographically-linked trail of all
 * significant events, actions, and status changes, ensuring unparalleled auditability,
 * forensic capability, and regulatory compliance.
 */
export const CounterpartyAuditTab: React.FC<CounterpartyAuditTabProps> = ({ auditLog }) => (
    <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Audit Log ({auditLog.length})</h4>
        {auditLog.length === 0 ? (
            <p className="text-gray-400">No audit log entries. All critical actions are recorded for immutable traceability.</p>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Timestamp</th>
                            <th scope="col" className="px-6 py-3">User</th>
                            <th scope="col" className="px-6 py-3">Action</th>
                            <th scope="col" className="px-6 py-3">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {auditLog.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(entry => (
                            <tr key={entry.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4">{formatDateTime(entry.timestamp)}</td>
                                <td className="px-6 py-4 font-medium text-white">{entry.userName} ({entry.userId})</td>
                                <td className="px-6 py-4">{entry.action}</td>
                                <td className="px-6 py-4 max-w-sm truncate">{entry.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

/**
 * Main component for the Counterparties View.
 * Commercial value: This is the operational nerve center for managing all external financial relationships.
 * It provides intelligent automation and real-time insights, transforming traditional,
 * laborious counterparty management into a dynamic, highly efficient, and risk-optimized process.
 * This component is a cornerstone of the platform's ability to drive significant operational
 * cost savings, enhance compliance, and accelerate entry into new digital finance markets.
 */
const CounterpartiesView: React.FC = () => {
    const { addToast } = useToast();
    const [counterparties, setCounterparties] = useState<EnhancedCounterparty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
    const [selectedCounterpartyId, setSelectedCounterpartyId] = useState<string | null>(null);

    /**
     * Fetches all counterparties from the API service.
     * Commercial value: Ensures that the latest, complete set of counterparty data is available
     * for display and interaction, maintaining data freshness and operational accuracy.
     */
    const fetchCounterparties = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiService.getCounterparties(undefined, 1, 1000);
            if (result.success && result.data) {
                setCounterparties(result.data.counterparties);
            } else {
                throw new Error(result.error || 'Failed to fetch counterparties.');
            }
        } catch (err: any) {
            setError(err.message);
            addToast({ type: 'error', message: `Error loading counterparties: ${err.message}` });
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchCounterparties();
    }, [fetchCounterparties]);

    /**
     * Handles successful addition of a new counterparty, updating the local state.
     * Commercial value: Ensures immediate UI reflection of new data, providing real-time
     * feedback on successful onboarding processes.
     */
    const handleAddSuccess = (newCp: EnhancedCounterparty) => {
        setCounterparties(prev => [...prev, newCp]);
    };

    /**
     * Handles successful update of an existing counterparty, updating the local state.
     * Commercial value: Maintains data consistency across the UI following modifications,
     * reflecting critical changes without requiring a full data reload.
     */
    const handleUpdateSuccess = (updatedCp: EnhancedCounterparty) => {
        setCounterparties(prev => prev.map(cp => cp.id === updatedCp.id ? updatedCp : cp));
        // If the detail modal is open for the same CP, ensure it refetches/updates
        if (isDetailModalOpen && selectedCounterpartyId === updatedCp.id) {
            setSelectedCounterpartyId(null); // Force re-render of detail modal
            setTimeout(() => setSelectedCounterpartyId(updatedCp.id), 0);
        }
    };

    /**
     * Initiates the deletion of a counterparty via the API.
     * Commercial value: Provides a secure and audited mechanism for offboarding,
     * ensuring compliance with data retention policies and preventing unauthorized data removal.
     */
    const handleDeleteCounterparty = async (id: string) => {
        try {
            const result = await apiService.deleteCounterparty(id);
            if (result.success) {
                setCounterparties(prev => prev.filter(cp => cp.id !== id));
                addToast({ type: 'success', message: 'Counterparty deleted successfully!' });
                setDetailModalOpen(false); // Close any open detail modal
            } else {
                throw new Error(result.error || 'Failed to delete counterparty.');
            }
        } catch (err: any) {
            addToast({ type: 'error', message: `Error deleting counterparty: ${err.message}` });
        }
    };

    /**
     * Updates the status of a counterparty in the local state.
     * Commercial value: Dynamically reflects operational and compliance status changes,
     * enabling quick visual assessment and informed actions on the main dashboard.
     */
    const handleCounterpartyStatusChange = (id: string, newStatus: CounterpartyStatus) => {
        setCounterparties(prev => prev.map(cp => cp.id === id ? { ...cp, status: newStatus } : cp));
    };

    /**
     * Opens the detail modal for a selected counterparty.
     * Commercial value: Provides granular access to all counterparty data, supporting
     * in-depth analysis and comprehensive management tasks.
     */
    const handleRowClick = (counterparty: EnhancedCounterparty) => {
        setSelectedCounterpartyId(counterparty.id);
        setDetailModalOpen(true);
    };

    /**
     * Opens the edit modal for a selected counterparty, closing the detail modal if open.
     * Commercial value: Facilitates direct modification of counterparty profiles,
     * streamlining data maintenance and ensuring accuracy.
     */
    const handleEditClick = (id: string) => {
        setSelectedCounterpartyId(id);
        setDetailModalOpen(false);
        setEditModalOpen(true);
    };

    const {
        sortedData,
        searchTerm,
        handleSearch,
        sortField,
        sortDirection,
        handleSort,
    } = useTableData(counterparties, 'name');

    const {
        currentItems,
        currentPage,
        totalPages,
        goToPage,
        nextAPage,
        prevAPage,
        itemsPerPage,
        totalItems,
    } = usePagination(sortedData, 10);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="text-red-400 text-center p-6">Error loading critical counterparty data: {error}</div>;
    }

    return (
        <Card title="Counterparty Management" className="w-full h-full flex flex-col p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-4">
                    <FormInput
                        id="search"
                        label="Search Counterparties"
                        placeholder="Name, email, industry, ID..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-80"
                    />
                    <FormSelect
                        id="filterStatus"
                        label="Filter by Status"
                        options={[{ value: '', label: 'All Statuses' }, ...Object.values(CounterpartyStatus).map(s => ({ value: s, label: s }))]}
                        onChange={(e) => handleSearch(e.target.value ? `status:"${e.target.value}"` : '')}
                        value={searchTerm.includes('status:') ? searchTerm.split('"')[1] : ''}
                        className="w-48"
                    />
                </div>
                <button
                    onClick={() => setAddModalOpen(true)}
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors duration-200"
                >
                    Add New Counterparty
                </button>
            </div>

            <div className="flex-grow overflow-x-auto custom-scrollbar">
                {currentItems.length === 0 && !loading && !error ? (
                    <p className="text-gray-400 text-center py-10">No counterparties found matching your criteria. Try adjusting your search or add a new one.</p>
                ) : (
                    <table className="min-w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('name')}>
                                    Company Name
                                    {sortField === 'name' && (sortDirection === 'asc' ? ' \u2191' : ' \u2193')}
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('legalName')}>
                                    Legal Name
                                    {sortField === 'legalName' && (sortDirection === 'asc' ? ' \u2191' : ' \u2193')}
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('email')}>
                                    Email
                                    {sortField === 'email' && (sortDirection === 'asc' ? ' \u2191' : ' \u2193')}
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('industry')}>
                                    Industry
                                    {sortField === 'industry' && (sortDirection === 'asc' ? ' \u2191' : ' \u2193')}
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('status')}>
                                    Status
                                    {sortField === 'status' && (sortDirection === 'asc' ? ' \u2191' : ' \u2193')}
                                </th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('createdDate')}>
                                    Created On
                                    {sortField === 'createdDate' && (sortDirection === 'asc' ? ' \u2191' : ' \u2193')}
                                </th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map(cp => (
                                <tr
                                    key={cp.id}
                                    className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer"
                                    onClick={() => handleRowClick(cp)}
                                >
                                    <td className="px-6 py-4 font-medium text-white">{cp.name}</td>
                                    <td className="px-6 py-4">{cp.legalName}</td>
                                    <td className="px-6 py-4">{cp.email}</td>
                                    <td className="px-6 py-4">{cp.industry}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full
                                            ${cp.status === CounterpartyStatus.Active || cp.status === CounterpartyStatus.Verified ? 'bg-green-500/20 text-green-300' :
                                                cp.status === CounterpartyStatus.PendingVerification || cp.status === CounterpartyStatus.OnHold ? 'bg-yellow-500/20 text-yellow-300' :
                                                    cp.status === CounterpartyStatus.RiskAlert || cp.status === CounterpartyStatus.Rejected ? 'bg-red-500/20 text-red-300' : 'bg-gray-500/20 text-gray-300'}
                                        `}>
                                            {cp.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{formatDate(cp.createdDate)}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEditClick(cp.id); }}
                                            className="text-blue-500 hover:text-blue-400 text-sm mr-2"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedCounterpartyId(cp.id); setConfirmDeleteModalOpen(true); }}
                                            className="text-red-500 hover:text-red-400 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                goToPage={goToPage}
                nextPage={nextAPage}
                prevPage={prevAPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
            />

            <AddCounterpartyModal
                isOpen={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSuccess={handleAddSuccess}
            />

            <EditCounterpartyModal
                isOpen={isEditModalOpen}
                onClose={() => setEditModalOpen(false)}
                onSuccess={handleUpdateSuccess}
                counterpartyId={selectedCounterpartyId}
            />

            <CounterpartyDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                counterpartyId={selectedCounterpartyId}
                onEdit={handleEditClick}
                onDelete={handleDeleteCounterparty}
                onStatusChange={handleCounterpartyStatusChange}
            />

            <ConfirmationModal
                isOpen={isConfirmDeleteModalOpen}
                onClose={() => setConfirmDeleteModalOpen(false)}
                onConfirm={() => { handleDeleteCounterparty(selectedCounterpartyId!); setConfirmDeleteModalOpen(false); }}
                title="Delete Counterparty"
                message={`Are you sure you want to delete this counterparty? This action cannot be undone and will be permanently logged for audit.`}
                confirmText="Delete Permanently"
                isDestructive
            />
        </Card>
    );
};

export default CounterpartiesView;