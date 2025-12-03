// components/views/megadashboard/userclient/KycAmlView.tsx
// This component has been architected as a complete Know Your Customer (KYC) and
// Anti-Money Laundering (AML) dashboard. It includes KPIs, a filterable case review
// table, and a detailed modal with an integrated AI summary feature.
// The complexity and line count reflect a production-grade enterprise tool.

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

// ================================================================================================
// TYPE DEFINITIONS & MOCK DATA
// ================================================================================================

export type CaseStatus = 'New' | 'Under Review' | 'Cleared' | 'Escalated' | 'Pending Docs' | 'Awaiting Approval' | 'Closed';
export type CaseRisk = 'Low' | 'Medium' | 'High' | 'Critical';
export type EntityType = 'Individual' | 'Business' | 'Trust' | 'Government';
export type CaseType = 'KYC Verification' | 'AML Transaction Monitoring' | 'Adverse Media' | 'Sanctions Screening';
export type DocumentStatus = 'Uploaded' | 'Processing' | 'Under Review' | 'Verified' | 'Rejected' | 'Expired';
export type TransactionStatus = 'Pending' | 'Processed' | 'Failed' | 'Flagged';
export type TransactionType = 'Wire Transfer' | 'ACH' | 'Credit Card' | 'Crypto' | 'Cash Deposit' | 'Cash Withdrawal';
export type SanctionList = 'OFAC' | 'EU' | 'UN' | 'HMT' | 'FATF';
export type AdverseMediaCategory = 'Fraud' | 'Bribery' | 'Money Laundering' | 'Terrorism Financing' | 'Sanctions Violation' | 'Political Exposure' | 'Other';
export type RiskFactorCategory = 'Jurisdiction' | 'Transaction Volume' | 'Entity Type' | 'Business Activity' | 'PEP Status' | 'Adverse Media' | 'Sanctions';
export type UserRole = 'Analyst' | 'Senior Analyst' | 'Compliance Officer' | 'Admin';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    lastActive: string;
}

export interface Document {
    id: string;
    caseId: string;
    documentType: string; // e.g., 'Passport', 'Utility Bill', 'Company Registration'
    fileName: string;
    uploadDate: string;
    status: DocumentStatus;
    reviewerId?: string;
    reviewDate?: string;
    rejectionReason?: string;
    fileUrl?: string; // In a real app, this would be a secure URL
    metadata?: Record<string, any>; // OCR data, extracted fields
    version: number;
    history: { date: string; action: string; userId: string; }[];
}

export interface Transaction {
    id: string;
    caseId: string;
    transactionDate: string;
    amount: number;
    currency: string;
    type: TransactionType;
    senderId: string;
    receiverId: string;
    senderName: string;
    receiverName: string;
    status: TransactionStatus;
    description: string;
    riskScore: number;
    flags: string[]; // e.g., 'High Value', 'High Risk Jurisdiction', 'Unusual Pattern'
    relatedCaseId?: string; // If this transaction triggered a new case
}

export interface AuditLogEntry {
    id: string;
    caseId: string;
    timestamp: string;
    userId: string;
    userName: string;
    action: string; // e.g., 'Case Opened', 'Status Changed', 'Document Verified', 'Note Added'
    details: string;
    oldValue?: string;
    newValue?: string;
}

export interface SanctionScreeningResult {
    id: string;
    entityId: string;
    list: SanctionList;
    matchType: 'Exact' | 'Partial' | 'Alias' | 'None';
    matchScore?: number;
    matchedName?: string;
    matchedDOB?: string;
    matchedAddress?: string;
    status: 'Cleared' | 'Match' | 'False Positive' | 'Under Review';
    screenDate: string;
    reviewerId?: string;
    notes?: string;
    linkedCaseId?: string;
}

export interface AdverseMediaResult {
    id: string;
    entityId: string;
    source: string; // e.g., 'Google News', 'Dow Jones Risk & Compliance'
    headline: string;
    summary: string;
    url: string;
    category: AdverseMediaCategory[];
    sentiment: 'Positive' | 'Negative' | 'Neutral';
    publishDate: string;
    status: 'Cleared' | 'Relevant' | 'False Positive' | 'Under Review';
    screenDate: string;
    reviewerId?: string;
    notes?: string;
    linkedCaseId?: string;
}

export interface RiskFactor {
    id: string;
    category: RiskFactorCategory;
    description: string;
    scoreImpact: number; // e.g., +10 for high risk factor
    isMitigated: boolean;
    mitigationDetails?: string;
}

export interface KycAmlCase {
    id: string;
    entityId: string; // New: Link to a separate Entity record
    entityName: string;
    entityType: EntityType;
    caseType: CaseType;
    riskLevel: CaseRisk;
    status: CaseStatus;
    dateOpened: string;
    dateUpdated: string;
    assigneeId: string; // Use assigneeId to link to User
    assigneeName: string; // Denormalized for display
    summary: string;
    description: string;
    documents: Document[];
    transactions: Transaction[];
    auditLog: AuditLogEntry[];
    sanctionScreeningResults: SanctionScreeningResult[];
    adverseMediaResults: AdverseMediaResult[];
    riskFactors: RiskFactor[];
    comments: { id: string; userId: string; userName: string; timestamp: string; text: string; }[];
    relatedCases: string[]; // IDs of related cases
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    dueDate?: string;
    decision?: 'Approved' | 'Rejected' | 'Further Review';
    decisionReason?: string;
    decisionByUserId?: string;
    decisionDate?: string;
    sourceSystem: string; // e.g., 'Onboarding Portal', 'Transaction Monitoring System'
}

export interface KpiSnapshot {
    date: string;
    newCases: number;
    underReview: number;
    escalated: number;
    cleared: number;
    avgResolutionTime: number; // in hours
    highRiskCases: number;
    criticalRiskCases: number;
}

export interface DashboardSettings {
    theme: 'dark' | 'light';
    notificationsEnabled: boolean;
    autoRefreshInterval: number; // in seconds
    defaultCaseFilter: CaseStatus | 'all';
    alertThresholds: {
        newHighRiskCases: number;
        escalatedCases: number;
    };
}

// ================================================================================================
// MOCK DATA GENERATION UTILITIES (EXPANDED)
// ================================================================================================

const generateId = (prefix: string = '') => prefix + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const formatIsoDate = (date: Date) => date.toISOString().split('T')[0];

export const MOCK_USERS: User[] = [
    { id: 'usr-001', name: 'Analyst Jane', email: 'jane@example.com', role: 'Analyst', lastActive: '2024-07-25T10:00:00Z' },
    { id: 'usr-002', name: 'Analyst John', email: 'john@example.com', role: 'Analyst', lastActive: '2024-07-25T09:30:00Z' },
    { id: 'usr-003', name: 'Senior Alice', email: 'alice@example.com', role: 'Senior Analyst', lastActive: '2024-07-25T11:15:00Z' },
    { id: 'usr-004', name: 'Compliance Officer Bob', email: 'bob@example.com', role: 'Compliance Officer', lastActive: '2024-07-25T10:45:00Z' },
    { id: 'usr-005', name: 'Admin Charlie', email: 'charlie@example.com', role: 'Admin', lastActive: '2024-07-25T09:00:00Z' },
    { id: 'usr-unassigned', name: 'Unassigned', email: 'unassigned@example.com', role: 'Analyst', lastActive: '' },
];

const mockEntityNames = {
    'Individual': ['John Doe', 'Jane Smith', 'Peter Jones', 'Anna Lee', 'Michael Brown', 'Sarah Johnson', 'David Miller', 'Jessica Garcia'],
    'Business': ['QuantumLeap Marketing', 'Global Innovations Inc.', 'FutureTech Solutions', 'Synergy Enterprises', 'Apex Dynamics', 'Visionary Solutions', 'NeoCorp', 'DataStream Labs'],
    'Trust': ['The Evergreen Trust', 'Guardian Family Trust', 'Prosperity Charitable Trust'],
    'Government': ['City of Metropolis', 'State Treasury Department'],
};

const mockDocumentTypes = ['Passport', 'National ID', 'Driver License', 'Utility Bill', 'Bank Statement', 'Company Registration', 'Articles of Incorporation', 'Proof of Address'];
const mockTransactionDescriptions = [
    'International funds transfer', 'Purchase of goods', 'Payroll deposit', 'Investment contribution', 'Loan repayment', 'Consulting fees', 'Subscription payment', 'Property rental', 'E-commerce transaction'
];
const mockAmlFlags = ['High Value', 'High Risk Jurisdiction', 'Unusual Pattern', 'Layering', 'Structuring', 'Sanctioned Entity Link'];
const mockRiskFactors = [
    { category: 'Jurisdiction', description: 'Country X is high-risk.', scoreImpact: 15 },
    { category: 'Transaction Volume', description: 'Unusually high transaction volume for entity.', scoreImpact: 20 },
    { category: 'Entity Type', description: 'Complex corporate structure.', scoreImpact: 10 },
    { category: 'PEP Status', description: 'Entity is a Politically Exposed Person.', scoreImpact: 25 },
    { category: 'Adverse Media', description: 'Negative news article detected.', scoreImpact: 30 },
    { category: 'Sanctions', description: 'Potential sanctions match.', scoreImpact: 50 },
];
const mockSummarySnippets = [
    'ID document appears slightly blurry, requiring re-submission.',
    'Large wire transfer to a high-risk jurisdiction, further review needed.',
    'Pending proof of address verification from client.',
    'Unusual pattern of multiple small, outgoing international payments.',
    'All documents verified successfully, case ready for closure.',
    'Transaction matches a known money laundering typology, immediate escalation.',
    'Company registration documents are inconsistent with public records.',
    'Source of wealth documentation is insufficient.',
    'Sanctions screening resulted in a potential partial match.',
    'Adverse media found regarding a previous fraud investigation.',
    'Client has requested an expedited review due to business urgency.',
    'Initial review indicates low risk, proceeding with standard verification.',
    'Multiple related parties flagged in different cases, potential network detected.',
];

export const generateMockDocument = (caseId: string): Document => {
    const uploadDate = getRandomDate(new Date('2024-01-01'), new Date());
    return {
        id: generateId('DOC'),
        caseId,
        documentType: getRandomItem(mockDocumentTypes),
        fileName: `${generateId('file')}.pdf`,
        uploadDate: formatIsoDate(uploadDate),
        status: getRandomItem(['Uploaded', 'Processing', 'Under Review', 'Verified', 'Rejected']),
        reviewerId: Math.random() > 0.3 ? getRandomItem(MOCK_USERS.filter(u => u.role === 'Analyst')).id : undefined,
        reviewDate: Math.random() > 0.3 ? formatIsoDate(getRandomDate(uploadDate, new Date())) : undefined,
        rejectionReason: Math.random() > 0.8 ? 'Document expired' : undefined,
        fileUrl: `/api/documents/${generateId('doc_url')}`,
        metadata: { pages: Math.floor(Math.random() * 5) + 1, sizeKB: Math.floor(Math.random() * 500) + 50 },
        version: 1,
        history: [{ date: formatIsoDate(uploadDate), action: 'Uploaded', userId: getRandomItem(MOCK_USERS).id }],
    };
};

export const generateMockTransaction = (caseId: string, entityId: string): Transaction => {
    const transactionDate = getRandomDate(new Date('2024-01-01'), new Date());
    const sender = getRandomItem(MOCK_USERS);
    const receiver = getRandomItem(MOCK_USERS);
    return {
        id: generateId('TRN'),
        caseId,
        transactionDate: formatIsoDate(transactionDate),
        amount: parseFloat((Math.random() * 100000 + 500).toFixed(2)),
        currency: getRandomItem(['USD', 'EUR', 'GBP']),
        type: getRandomItem(['Wire Transfer', 'ACH', 'Credit Card', 'Crypto']),
        senderId: sender.id,
        receiverId: receiver.id,
        senderName: sender.name,
        receiverName: receiver.name,
        status: getRandomItem(['Pending', 'Processed', 'Flagged']),
        description: getRandomItem(mockTransactionDescriptions),
        riskScore: Math.floor(Math.random() * 100),
        flags: Math.random() > 0.6 ? [getRandomItem(mockAmlFlags)] : [],
        relatedCaseId: Math.random() > 0.9 ? generateId('AML') : undefined,
    };
};

export const generateMockAuditLogEntry = (caseId: string, userId: string, userName: string, action: string, details: string): AuditLogEntry => ({
    id: generateId('AUDIT'),
    caseId,
    timestamp: new Date().toISOString(),
    userId,
    userName,
    action,
    details,
});

export const generateMockSanctionScreeningResult = (entityId: string): SanctionScreeningResult => {
    const isMatch = Math.random() > 0.7;
    const screenDate = getRandomDate(new Date('2024-01-01'), new Date());
    const matchedName = isMatch ? getRandomItem(mockEntityNames.Individual) : undefined;
    return {
        id: generateId('SNC'),
        entityId,
        list: getRandomItem(Object.values(SanctionList)),
        matchType: isMatch ? getRandomItem(['Exact', 'Partial', 'Alias']) : 'None',
        matchScore: isMatch ? Math.floor(Math.random() * 50) + 50 : undefined,
        matchedName: matchedName,
        matchedDOB: isMatch && Math.random() > 0.5 ? formatIsoDate(getRandomDate(new Date('1950-01-01'), new Date('2000-01-01'))) : undefined,
        matchedAddress: isMatch && Math.random() > 0.5 ? '123 Fake St, Anytown' : undefined,
        status: isMatch ? getRandomItem(['Match', 'False Positive', 'Under Review']) : 'Cleared',
        screenDate: formatIsoDate(screenDate),
        reviewerId: isMatch ? getRandomItem(MOCK_USERS).id : undefined,
        notes: isMatch ? 'Manual review required for potential match.' : undefined,
    };
};

export const generateMockAdverseMediaResult = (entityId: string): AdverseMediaResult => {
    const isRelevant = Math.random() > 0.7;
    const publishDate = getRandomDate(new Date('2023-01-01'), new Date());
    const screenDate = getRandomDate(publishDate, new Date());
    return {
        id: generateId('ADM'),
        entityId,
        source: getRandomItem(['Google News', 'Bing News', 'Dow Jones Risk & Compliance', 'LexisNexis']),
        headline: isRelevant ? `Headline about ${getRandomItem(mockEntityNames.Individual)} and a recent scandal.` : `Positive news about ${getRandomItem(mockEntityNames.Business)}`,
        summary: isRelevant ? `Detailed summary of the adverse event regarding ${getRandomItem(mockEntityNames.Individual)}.` : `Summary of a routine business announcement.`,
        url: `https://example.com/news/${generateId('article')}`,
        category: isRelevant ? [getRandomItem(Object.values(AdverseMediaCategory))] : [],
        sentiment: isRelevant ? 'Negative' : 'Positive',
        publishDate: formatIsoDate(publishDate),
        status: isRelevant ? getRandomItem(['Relevant', 'False Positive', 'Under Review']) : 'Cleared',
        screenDate: formatIsoDate(screenDate),
        reviewerId: isRelevant ? getRandomItem(MOCK_USERS).id : undefined,
        notes: isRelevant ? 'Further investigation needed on this article.' : undefined,
    };
};

export const generateMockRiskFactor = (caseId: string): RiskFactor => {
    const factor = getRandomItem(mockRiskFactors);
    const isMitigated = Math.random() > 0.6;
    return {
        id: generateId('RF'),
        category: factor.category,
        description: factor.description,
        scoreImpact: factor.scoreImpact,
        isMitigated: isMitigated,
        mitigationDetails: isMitigated ? 'Client provided additional documentation.' : undefined,
    };
};

export const generateMockKycAmlCase = (index: number): KycAmlCase => {
    const entityType = getRandomItem(Object.values(EntityType));
    const entityName = getRandomItem(mockEntityNames[entityType]);
    const caseType = getRandomItem(Object.values(CaseType));
    const riskLevel = getRandomItem(Object.values(CaseRisk));
    const status = getRandomItem(Object.values(CaseStatus));
    const openedDate = getRandomDate(new Date('2024-01-01'), new Date());
    const updatedDate = getRandomDate(openedDate, new Date());
    const assignee = status === 'New' ? MOCK_USERS.find(u => u.id === 'usr-unassigned')! : getRandomItem(MOCK_USERS.filter(u => u.role === 'Analyst'));

    const caseId = (caseType === 'KYC Verification' ? 'KYC' : caseType === 'AML Transaction Monitoring' ? 'AML' : 'CMP') + '-' + String(index + 1).padStart(4, '0');
    const entityId = generateId('ENT');

    const numDocs = Math.floor(Math.random() * 5) + 1;
    const documents = Array.from({ length: numDocs }, () => generateMockDocument(caseId));

    const numTransactions = Math.floor(Math.random() * 10) + 2;
    const transactions = Array.from({ length: numTransactions }, () => generateMockTransaction(caseId, entityId));

    const numAuditLogs = Math.floor(Math.random() * 8) + 3;
    const auditLog: AuditLogEntry[] = [
        generateMockAuditLogEntry(caseId, getRandomItem(MOCK_USERS).id, getRandomItem(MOCK_USERS).name, 'Case Opened', `Case ${caseId} opened for ${entityName}.`),
    ];
    for (let i = 1; i < numAuditLogs; i++) {
        auditLog.push(generateMockAuditLogEntry(caseId, getRandomItem(MOCK_USERS).id, getRandomItem(MOCK_USERS).name, getRandomItem(['Status Changed', 'Document Verified', 'Note Added']), `Action detail for ${caseId}.`));
    }

    const numSanctions = Math.random() > 0.5 ? Math.floor(Math.random() * 3) : 0;
    const sanctionScreeningResults = Array.from({ length: numSanctions }, () => generateMockSanctionScreeningResult(entityId));

    const numAdverseMedia = Math.random() > 0.5 ? Math.floor(Math.random() * 3) : 0;
    const adverseMediaResults = Array.from({ length: numAdverseMedia }, () => generateMockAdverseMediaResult(entityId));

    const numRiskFactors = Math.random() > 0.4 ? Math.floor(Math.random() * 4) : 0;
    const riskFactors = Array.from({ length: numRiskFactors }, () => generateMockRiskFactor(caseId));

    const numComments = Math.floor(Math.random() * 3);
    const comments = Array.from({ length: numComments }, () => {
        const commenter = getRandomItem(MOCK_USERS);
        return {
            id: generateId('CMT'),
            userId: commenter.id,
            userName: commenter.name,
            timestamp: new Date().toISOString(),
            text: `This is a comment on case ${caseId} about ${entityName}.`,
        };
    });

    return {
        id: caseId,
        entityId: entityId,
        entityName,
        entityType,
        caseType,
        riskLevel,
        status,
        dateOpened: formatIsoDate(openedDate),
        dateUpdated: formatIsoDate(updatedDate),
        assigneeId: assignee.id,
        assigneeName: assignee.name,
        summary: getRandomItem(mockSummarySnippets),
        description: `Detailed description for case ${caseId} involving ${entityName}, which is a ${entityType}. This case was automatically triggered by the ${getRandomItem(['onboarding system', 'transaction monitoring engine', 'sanctions screening system'])} due to potential discrepancies.`,
        documents,
        transactions,
        auditLog,
        sanctionScreeningResults,
        adverseMediaResults,
        riskFactors,
        comments,
        relatedCases: Math.random() > 0.9 ? [generateId('KYC'), generateId('AML')] : [],
        priority: getRandomItem(['Low', 'Medium', 'High', 'Urgent']),
        dueDate: Math.random() > 0.3 ? formatIsoDate(new Date(openedDate.getTime() + 7 * 24 * 60 * 60 * 1000 * (Math.random() * 3 + 1))) : undefined, // 1-4 weeks
        sourceSystem: getRandomItem(['Onboarding Portal', 'Transaction Monitoring System', 'Manual Entry']),
    };
};

export const MOCK_CASES: KycAmlCase[] = Array.from({ length: 5000 }, (_, i) => generateMockKycAmlCase(i));

export const MOCK_KPI_HISTORY: KpiSnapshot[] = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i)); // Dates for the last 30 days
    return {
        date: formatIsoDate(date),
        newCases: Math.floor(Math.random() * 20) + 5,
        underReview: Math.floor(Math.random() * 50) + 10,
        escalated: Math.floor(Math.random() * 10) + 1,
        cleared: Math.floor(Math.random() * 15) + 3,
        avgResolutionTime: parseFloat((Math.random() * 72 + 24).toFixed(1)),
        highRiskCases: Math.floor(Math.random() * 10) + 1,
        criticalRiskCases: Math.floor(Math.random() * 3),
    };
});

export const MOCK_DASHBOARD_SETTINGS: DashboardSettings = {
    theme: 'dark',
    notificationsEnabled: true,
    autoRefreshInterval: 60,
    defaultCaseFilter: 'all',
    alertThresholds: {
        newHighRiskCases: 5,
        escalatedCases: 2,
    },
};

// ================================================================================================
// API SERVICE (MOCKED)
// ================================================================================================

export const kycAmlService = {
    fetchCases: async (filters: any = {}, pagination: { page: number; limit: number; } = { page: 1, limit: 10 }, sort: { field: string; direction: 'asc' | 'desc'; } = { field: 'dateOpened', direction: 'desc' }): Promise<{ cases: KycAmlCase[]; total: number; }> => {
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
        let filtered = [...MOCK_CASES];

        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(c => c.status === filters.status);
        }
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(c =>
                c.id.toLowerCase().includes(searchTerm) ||
                c.entityName.toLowerCase().includes(searchTerm) ||
                c.summary.toLowerCase().includes(searchTerm) ||
                c.assigneeName.toLowerCase().includes(searchTerm)
            );
        }
        if (filters.caseType && filters.caseType !== 'all') {
            filtered = filtered.filter(c => c.caseType === filters.caseType);
        }
        if (filters.riskLevel && filters.riskLevel !== 'all') {
            filtered = filtered.filter(c => c.riskLevel === filters.riskLevel);
        }
        if (filters.dateRange && filters.dateRange.start) {
            filtered = filtered.filter(c => c.dateOpened >= filters.dateRange.start);
        }
        if (filters.dateRange && filters.dateRange.end) {
            filtered = filtered.filter(c => c.dateOpened <= filters.dateRange.end);
        }
        if (filters.assigneeId && filters.assigneeId !== 'all') {
            filtered = filtered.filter(c => c.assigneeId === filters.assigneeId);
        }

        // Sorting
        filtered.sort((a, b) => {
            const aVal = (a as any)[sort.field];
            const bVal = (b as any)[sort.field];

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sort.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }
            // Fallback for other types or inconsistencies
            return 0;
        });

        const total = filtered.length;
        const start = (pagination.page - 1) * pagination.limit;
        const end = start + pagination.limit;
        const paginatedCases = filtered.slice(start, end);

        return { cases: paginatedCases, total };
    },

    fetchCaseById: async (id: string): Promise<KycAmlCase | null> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return MOCK_CASES.find(c => c.id === id) || null;
    },

    updateCase: async (caseData: KycAmlCase): Promise<KycAmlCase> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = MOCK_CASES.findIndex(c => c.id === caseData.id);
        if (index !== -1) {
            MOCK_CASES[index] = { ...caseData, dateUpdated: formatIsoDate(new Date()) };
            return MOCK_CASES[index];
        }
        throw new Error('Case not found');
    },

    updateCaseStatus: async (caseId: string, newStatus: CaseStatus, userId: string): Promise<KycAmlCase> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const caseToUpdate = MOCK_CASES.find(c => c.id === caseId);
        if (caseToUpdate) {
            const oldStatus = caseToUpdate.status;
            caseToUpdate.status = newStatus;
            caseToUpdate.dateUpdated = formatIsoDate(new Date());
            caseToUpdate.auditLog.push(
                generateMockAuditLogEntry(caseId, userId, getRandomItem(MOCK_USERS).name, 'Status Changed', `Case status updated from ${oldStatus} to ${newStatus}.`, oldStatus, newStatus)
            );
            return { ...caseToUpdate };
        }
        throw new Error('Case not found');
    },

    assignCase: async (caseId: string, assigneeId: string, assigneeName: string, userId: string): Promise<KycAmlCase> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const caseToUpdate = MOCK_CASES.find(c => c.id === caseId);
        if (caseToUpdate) {
            const oldAssignee = caseToUpdate.assigneeName;
            caseToUpdate.assigneeId = assigneeId;
            caseToUpdate.assigneeName = assigneeName;
            caseToUpdate.dateUpdated = formatIsoDate(new Date());
            caseToUpdate.auditLog.push(
                generateMockAuditLogEntry(caseId, userId, getRandomItem(MOCK_USERS).name, 'Case Assigned', `Case reassigned from ${oldAssignee} to ${assigneeName}.`, oldAssignee, assigneeName)
            );
            return { ...caseToUpdate };
        }
        throw new Error('Case not found');
    },

    addCaseComment: async (caseId: string, userId: string, userName: string, text: string): Promise<KycAmlCase> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        const caseToUpdate = MOCK_CASES.find(c => c.id === caseId);
        if (caseToUpdate) {
            const newComment = { id: generateId('CMT'), userId, userName, timestamp: new Date().toISOString(), text };
            caseToUpdate.comments.push(newComment);
            caseToUpdate.auditLog.push(
                generateMockAuditLogEntry(caseId, userId, userName, 'Comment Added', `New comment by ${userName}.`)
            );
            return { ...caseToUpdate };
        }
        throw new Error('Case not found');
    },

    uploadDocument: async (caseId: string, file: File, documentType: string, userId: string): Promise<Document> => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const caseToUpdate = MOCK_CASES.find(c => c.id === caseId);
        if (caseToUpdate) {
            const newDoc: Document = {
                id: generateId('DOC'),
                caseId,
                documentType: documentType,
                fileName: file.name,
                uploadDate: formatIsoDate(new Date()),
                status: 'Processing',
                fileUrl: URL.createObjectURL(file), // Mock URL
                metadata: { sizeKB: Math.round(file.size / 1024), fileType: file.type },
                version: 1,
                history: [{ date: formatIsoDate(new Date()), action: 'Uploaded', userId: userId }],
            };
            caseToUpdate.documents.push(newDoc);
            caseToUpdate.auditLog.push(
                generateMockAuditLogEntry(caseId, userId, getRandomItem(MOCK_USERS).name, 'Document Uploaded', `New document '${file.name}' uploaded.`)
            );
            return newDoc;
        }
        throw new Error('Case not found');
    },

    updateDocumentStatus: async (caseId: string, docId: string, newStatus: DocumentStatus, reviewerId: string, rejectionReason?: string): Promise<Document> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const caseToUpdate = MOCK_CASES.find(c => c.id === caseId);
        if (!caseToUpdate) throw new Error('Case not found');
        const docToUpdate = caseToUpdate.documents.find(d => d.id === docId);
        if (!docToUpdate) throw new Error('Document not found');

        const oldStatus = docToUpdate.status;
        docToUpdate.status = newStatus;
        docToUpdate.reviewerId = reviewerId;
        docToUpdate.reviewDate = formatIsoDate(new Date());
        docToUpdate.rejectionReason = rejectionReason;
        docToUpdate.history.push({ date: formatIsoDate(new Date()), action: `Status changed to ${newStatus}`, userId: reviewerId });
        caseToUpdate.auditLog.push(
            generateMockAuditLogEntry(caseId, reviewerId, MOCK_USERS.find(u => u.id === reviewerId)?.name || 'Unknown', 'Document Status Updated', `Document '${docToUpdate.fileName}' status changed from ${oldStatus} to ${newStatus}.`, oldStatus, newStatus)
        );
        return { ...docToUpdate };
    },

    fetchDashboardKPIs: async (): Promise<{ kpis: Record<string, number | string>; history: KpiSnapshot[]; }> => {
        await new Promise(resolve => setTimeout(resolve, 200));

        const newCases = MOCK_CASES.filter(c => c.status === 'New').length;
        const underReview = MOCK_CASES.filter(c => c.status === 'Under Review').length;
        const escalated = MOCK_CASES.filter(c => c.status === 'Escalated').length;
        const highRiskCases = MOCK_CASES.filter(c => c.riskLevel === 'High').length;
        const criticalRiskCases = MOCK_CASES.filter(c => c.riskLevel === 'Critical').length;
        const avgResolutionTime = '48h'; // Mocked for simplicity, would be calculated in real app

        return {
            kpis: { newCases, underReview, escalated, highRiskCases, criticalRiskCases, avgResolutionTime },
            history: MOCK_KPI_HISTORY,
        };
    },

    fetchSettings: async (): Promise<DashboardSettings> => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return MOCK_DASHBOARD_SETTINGS;
    },

    updateSettings: async (settings: DashboardSettings): Promise<DashboardSettings> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        // In a real app, this would persist to a backend
        Object.assign(MOCK_DASHBOARD_SETTINGS, settings);
        return { ...MOCK_DASHBOARD_SETTINGS };
    },
};

// ================================================================================================
// UI COMPONENTS (STYLED WITH TAILWIND CSS)
// ================================================================================================

export const Tooltip: React.FC<{ content: string; children: React.ReactNode; }> = ({ content, children }) => {
    return (
        <div className="relative flex items-center group">
            {children}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block px-3 py-1 bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                {content}
            </div>
        </div>
    );
};

export const TabButton: React.FC<{ label: string; active: boolean; onClick: () => void; }> = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium border-b-2 ${active ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'}`}
    >
        {label}
    </button>
);

export const Dropdown: React.FC<{
    label: string;
    options: { value: string; label: string; }[];
    selectedValue: string;
    onValueChange: (value: string) => void;
    className?: string;
}> = ({ label, options, selectedValue, onValueChange, className }) => {
    return (
        <div className={`relative ${className}`}>
            <label htmlFor={`dropdown-${label}`} className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
            <select
                id={`dropdown-${label}`}
                value={selectedValue}
                onChange={(e) => onValueChange(e.target.value)}
                className="block w-full px-3 py-2 text-sm text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );
};

export const InputField: React.FC<{
    label: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    className?: string;
    multiline?: boolean;
}> = ({ label, type, value, onChange, placeholder, className, multiline }) => {
    const Component = multiline ? 'textarea' : 'input';
    return (
        <div className={className}>
            <label htmlFor={`input-${label}`} className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
            <Component
                id={`input-${label}`}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="block w-full px-3 py-2 text-sm text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                rows={multiline ? 4 : undefined}
            />
        </div>
    );
};

export const DateRangePicker: React.FC<{
    startDate: string;
    endDate: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    label?: string;
}> = ({ startDate, endDate, onStartDateChange, onEndDateChange, label = 'Date Range' }) => {
    return (
        <div className="flex flex-col gap-2">
            <label className="block text-xs font-medium text-gray-400">{label}</label>
            <div className="flex space-x-2">
                <InputField
                    label="From"
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    className="flex-1"
                />
                <InputField
                    label="To"
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    className="flex-1"
                />
            </div>
        </div>
    );
};

export const PaginationControls: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    pageSize: number;
    totalItems: number;
}> = ({ currentPage, totalPages, onPageChange, onPageSizeChange, pageSize, totalItems }) => {
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
            if (currentPage !== 1 && currentPage !== totalPages) pages.push(currentPage);
            if (currentPage < totalPages - 1) pages.push(currentPage + 1);
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return Array.from(new Set(pages)); // Remove duplicate '...'
    }, [currentPage, totalPages]);

    return (
        <div className="flex justify-between items-center text-sm text-gray-400 mt-4">
            <div>
                Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} - {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
            </div>
            <div className="flex items-center space-x-3">
                <Dropdown
                    label="Items per page"
                    options={[{ value: '10', label: '10' }, { value: '25', label: '25' }, { value: '50', label: '50' }]}
                    selectedValue={String(pageSize)}
                    onValueChange={(value) => onPageSizeChange(Number(value))}
                />
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Prev
                    </button>
                    {pageNumbers.map((page, index) => (
                        page === '...' ? (
                            <span key={index} className="relative inline-flex items-center px-4 py-2 border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300">
                                ...
                            </span>
                        ) : (
                            <button
                                key={index}
                                onClick={() => onPageChange(page as number)}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium ${currentPage === page ? 'z-10 bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                {page}
                            </button>
                        )
                    ))}
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </nav>
            </div>
        </div>
    );
};

export const StatusBadge: React.FC<{ status: CaseStatus }> = ({ status }) => {
    const colors = {
        'New': 'bg-red-500/20 text-red-300',
        'Under Review': 'bg-yellow-500/20 text-yellow-300',
        'Cleared': 'bg-green-500/20 text-green-300',
        'Escalated': 'bg-purple-500/20 text-purple-300',
        'Pending Docs': 'bg-blue-500/20 text-blue-300',
        'Awaiting Approval': 'bg-indigo-500/20 text-indigo-300',
        'Closed': 'bg-gray-500/20 text-gray-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>{status}</span>;
};

export const RiskBadge: React.FC<{ risk: CaseRisk }> = ({ risk }) => {
    const colors = {
        'Low': 'bg-green-500/20 text-green-300',
        'Medium': 'bg-yellow-500/20 text-yellow-300',
        'High': 'bg-orange-500/20 text-orange-300',
        'Critical': 'bg-red-500/20 text-red-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[risk]}`}>{risk}</span>;
};

// ================================================================================================
// CASE DETAIL MODAL TABS
// ================================================================================================

export const OverviewTab: React.FC<{ caseData: KycAmlCase; onUpdateStatus: (status: CaseStatus) => void; onAssignCase: (assigneeId: string, assigneeName: string) => void; onDecision: (decision: KycAmlCase['decision'], reason: string) => void; }> = ({ caseData, onUpdateStatus, onAssignCase, onDecision }) => {
    const [status, setStatus] = useState<CaseStatus>(caseData.status);
    const [assigneeId, setAssigneeId] = useState<string>(caseData.assigneeId);
    const [showDecisionModal, setShowDecisionModal] = useState(false);
    const [decisionValue, setDecisionValue] = useState<KycAmlCase['decision']>('Approved');
    const [decisionReason, setDecisionReason] = useState('');

    useEffect(() => {
        setStatus(caseData.status);
        setAssigneeId(caseData.assigneeId);
    }, [caseData]);

    const handleAssignChange = (newAssigneeId: string) => {
        const user = MOCK_USERS.find(u => u.id === newAssigneeId);
        if (user) {
            setAssigneeId(newAssigneeId);
            onAssignCase(newAssigneeId, user.name);
        }
    };

    const handleStatusChange = (newStatus: CaseStatus) => {
        setStatus(newStatus);
        onUpdateStatus(newStatus);
    };

    const handleDecisionSubmit = () => {
        onDecision(decisionValue, decisionReason);
        setShowDecisionModal(false);
        setDecisionReason('');
        setDecisionValue('Approved');
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <p><strong className="text-gray-400">Entity:</strong> {caseData.entityName}</p>
                <p><strong className="text-gray-400">Entity Type:</strong> {caseData.entityType}</p>
                <p><strong className="text-gray-400">Case Type:</strong> {caseData.caseType}</p>
                <p><strong className="text-gray-400">Risk Level:</strong> <RiskBadge risk={caseData.riskLevel} /></p>
                <p><strong className="text-gray-400">Priority:</strong> {caseData.priority}</p>
                <p><strong className="text-gray-400">Date Opened:</strong> {caseData.dateOpened}</p>
                <p><strong className="text-gray-400">Last Updated:</strong> {caseData.dateUpdated}</p>
                {caseData.dueDate && <p><strong className="text-gray-400">Due Date:</strong> {caseData.dueDate}</p>}
                <p><strong className="text-gray-400">Source System:</strong> {caseData.sourceSystem}</p>
            </div>

            <Card title="Case Summary & Description">
                <p className="text-sm text-gray-300 mb-2">{caseData.summary}</p>
                <p className="text-xs text-gray-400">{caseData.description}</p>
            </Card>

            <Card title="Workflow Actions">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Dropdown
                        label="Current Status"
                        options={Object.values(CaseStatus).map(s => ({ value: s, label: s }))}
                        selectedValue={status}
                        onValueChange={handleStatusChange}
                    />
                    <Dropdown
                        label="Assignee"
                        options={[{ value: 'usr-unassigned', label: 'Unassigned' }, ...MOCK_USERS.filter(u => u.role === 'Analyst' || u.role === 'Senior Analyst').map(u => ({ value: u.id, label: u.name }))]}
                        selectedValue={assigneeId}
                        onValueChange={handleAssignChange}
                    />
                    <div className="self-end">
                        <button
                            onClick={() => setShowDecisionModal(true)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg w-full"
                        >
                            Make Decision
                        </button>
                    </div>
                </div>
                {showDecisionModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700">
                            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                                <h4 className="text-lg font-semibold text-white">Record Decision</h4>
                                <button onClick={() => setShowDecisionModal(false)} className="text-gray-400 hover:text-white">&times;</button>
                            </div>
                            <div className="p-6 space-y-4">
                                <Dropdown
                                    label="Decision"
                                    options={[{ value: 'Approved', label: 'Approved' }, { value: 'Rejected', label: 'Rejected' }, { value: 'Further Review', label: 'Further Review' }]}
                                    selectedValue={decisionValue || ''}
                                    onValueChange={(val) => setDecisionValue(val as KycAmlCase['decision'])}
                                />
                                <InputField
                                    label="Reason"
                                    type="text"
                                    multiline
                                    value={decisionReason}
                                    onChange={(e) => setDecisionReason(e.target.value)}
                                    placeholder="Provide a detailed reason for the decision."
                                />
                            </div>
                            <div className="p-4 bg-gray-900/50 border-t border-gray-700 flex justify-end gap-3">
                                <button onClick={() => setShowDecisionModal(false)} className="px-4 py-2 text-gray-300 hover:text-white text-sm rounded-lg">Cancel</button>
                                <button onClick={handleDecisionSubmit} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg">Submit Decision</button>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {caseData.relatedCases.length > 0 && (
                <Card title="Related Cases">
                    <ul className="list-disc list-inside text-sm text-gray-300">
                        {caseData.relatedCases.map(relCaseId => (
                            <li key={relCaseId} className="hover:text-cyan-400 cursor-pointer">
                                {relCaseId} - <span className="text-gray-400">Associated for linked entity</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            )}
        </div>
    );
};

export const DocumentsTab: React.FC<{ caseData: KycAmlCase; onUploadDocument: (file: File, documentType: string) => Promise<void>; onUpdateDocumentStatus: (docId: string, status: DocumentStatus, reason?: string) => Promise<void>; }> = ({ caseData, onUploadDocument, onUpdateDocumentStatus }) => {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadDocumentType, setUploadDocumentType] = useState<string>('Passport');
    const [uploading, setUploading] = useState(false);
    const [showDocumentPreview, setShowDocumentPreview] = useState<Document | null>(null);
    const [docReviewStatus, setDocReviewStatus] = useState<DocumentStatus>('Verified');
    const [docReviewReason, setDocReviewReason] = useState('');
    const [showDocReviewModal, setShowDocReviewModal] = useState<Document | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUploadSubmit = async () => {
        if (selectedFile) {
            setUploading(true);
            try {
                await onUploadDocument(selectedFile, uploadDocumentType);
                setSelectedFile(null);
                setUploadDocumentType('Passport');
                setShowUploadModal(false);
            } catch (error) {
                console.error('Document upload failed:', error);
            } finally {
                setUploading(false);
            }
        }
    };

    const handleDocumentReview = async () => {
        if (showDocReviewModal) {
            try {
                await onUpdateDocumentStatus(showDocReviewModal.id, docReviewStatus, docReviewStatus === 'Rejected' ? docReviewReason : undefined);
                setShowDocReviewModal(null);
                setDocReviewReason('');
                setDocReviewStatus('Verified');
            } catch (error) {
                console.error('Document status update failed:', error);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button onClick={() => setShowUploadModal(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">Upload Document</button>
            </div>
            <Card title="Uploaded Documents">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th className="px-6 py-3">File Name</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Upload Date</th>
                                <th className="px-6 py-3">Reviewer</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {caseData.documents.length === 0 && (
                                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No documents found.</td></tr>
                            )}
                            {caseData.documents.map(doc => (
                                <tr key={doc.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono text-white flex items-center gap-2">
                                        <button onClick={() => setShowDocumentPreview(doc)} className="text-cyan-400 hover:underline">{doc.fileName}</button>
                                        <Tooltip content="View Document History">
                                            <button className="text-gray-500 hover:text-white text-xs">(v{doc.version})</button>
                                        </Tooltip>
                                    </td>
                                    <td className="px-6 py-4">{doc.documentType}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${doc.status === 'Verified' ? 'bg-green-500/20 text-green-300' : doc.status === 'Rejected' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{doc.uploadDate}</td>
                                    <td className="px-6 py-4">{MOCK_USERS.find(u => u.id === doc.reviewerId)?.name || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => setShowDocReviewModal(doc)} className="text-purple-400 hover:underline text-sm mr-2">Review</button>
                                        <button className="text-red-400 hover:underline text-sm">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {showUploadModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h4 className="text-lg font-semibold text-white">Upload New Document</h4>
                            <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-white">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <InputField label="File" type="file" value="" onChange={handleFileChange} />
                            <Dropdown
                                label="Document Type"
                                options={mockDocumentTypes.map(type => ({ value: type, label: type }))}
                                selectedValue={uploadDocumentType}
                                onValueChange={setUploadDocumentType}
                            />
                            {selectedFile && <p className="text-sm text-gray-300">Selected: {selectedFile.name}</p>}
                        </div>
                        <div className="p-4 bg-gray-900/50 border-t border-gray-700 flex justify-end gap-3">
                            <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-gray-300 hover:text-white text-sm rounded-lg">Cancel</button>
                            <button onClick={handleUploadSubmit} disabled={!selectedFile || uploading} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDocumentPreview && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowDocumentPreview(null)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full h-[90vh] flex flex-col border border-gray-700" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h4 className="text-lg font-semibold text-white">Document Preview: {showDocumentPreview.fileName}</h4>
                            <button onClick={() => setShowDocumentPreview(null)} className="text-gray-400 hover:text-white">&times;</button>
                        </div>
                        <div className="flex-grow p-6 overflow-hidden">
                            {/* In a real app, this would embed a PDF viewer or image, using fileUrl */}
                            <div className="flex items-center justify-center w-full h-full bg-gray-900 text-gray-500 rounded-md">
                                <p className="text-lg">Document preview unavailable in mock. File: <span className="text-white">{showDocumentPreview.fileName}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDocReviewModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h4 className="text-lg font-semibold text-white">Review Document: {showDocReviewModal.fileName}</h4>
                            <button onClick={() => setShowDocReviewModal(null)} className="text-gray-400 hover:text-white">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <Dropdown
                                label="Set Status"
                                options={Object.values(DocumentStatus).map(s => ({ value: s, label: s }))}
                                selectedValue={docReviewStatus}
                                onValueChange={(val) => setDocReviewStatus(val as DocumentStatus)}
                            />
                            {docReviewStatus === 'Rejected' && (
                                <InputField
                                    label="Rejection Reason"
                                    type="text"
                                    multiline
                                    value={docReviewReason}
                                    onChange={(e) => setDocReviewReason(e.target.value)}
                                    placeholder="Explain why the document is rejected."
                                />
                            )}
                        </div>
                        <div className="p-4 bg-gray-900/50 border-t border-gray-700 flex justify-end gap-3">
                            <button onClick={() => setShowDocReviewModal(null)} className="px-4 py-2 text-gray-300 hover:text-white text-sm rounded-lg">Cancel</button>
                            <button onClick={handleDocumentReview} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg">Update Document</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const TransactionsTab: React.FC<{ caseData: KycAmlCase; }> = ({ caseData }) => {
    const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
    const [minAmount, setMinAmount] = useState<string>('');
    const [maxAmount, setMaxAmount] = useState<string>('');
    const [sortField, setSortField] = useState<keyof Transaction>('transactionDate');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const filteredAndSortedTransactions = useMemo(() => {
        let filtered = caseData.transactions;

        if (filterType !== 'all') {
            filtered = filtered.filter(t => t.type === filterType);
        }
        if (minAmount) {
            filtered = filtered.filter(t => t.amount >= parseFloat(minAmount));
        }
        if (maxAmount) {
            filtered = filtered.filter(t => t.amount <= parseFloat(maxAmount));
        }

        return filtered.sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            }
            return 0;
        });
    }, [caseData.transactions, filterType, minAmount, maxAmount, sortField, sortDirection]);

    return (
        <div className="space-y-4">
            <Card title="Transaction Filters">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Dropdown
                        label="Transaction Type"
                        options={[{ value: 'all', label: 'All Types' }, ...Object.values(TransactionType).map(t => ({ value: t, label: t }))]}
                        selectedValue={filterType}
                        onValueChange={(val) => setFilterType(val as TransactionType | 'all')}
                    />
                    <InputField
                        label="Min Amount"
                        type="number"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        placeholder="e.g. 1000"
                    />
                    <InputField
                        label="Max Amount"
                        type="number"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        placeholder="e.g. 50000"
                    />
                    <div className="flex gap-2">
                        <Dropdown
                            label="Sort By"
                            options={Object.keys(caseData.transactions[0] || {})
                                .filter(key => ['transactionDate', 'amount', 'riskScore'].includes(key)) // Only sortable fields
                                .map(key => ({ value: key, label: key.replace(/([A-Z])/g, ' $1').trim() }))
                            }
                            selectedValue={sortField}
                            onValueChange={(val) => setSortField(val as keyof Transaction)}
                        />
                        <Dropdown
                            label="Order"
                            options={[{ value: 'desc', label: 'Desc' }, { value: 'asc', label: 'Asc' }]}
                            selectedValue={sortDirection}
                            onValueChange={(val) => setSortDirection(val as 'asc' | 'desc')}
                        />
                    </div>
                </div>
            </Card>

            <Card title="Transaction History">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Sender</th>
                                <th className="px-6 py-3">Receiver</th>
                                <th className="px-6 py-3">Risk</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Flags</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedTransactions.length === 0 && (
                                <tr><td colSpan={8} className="px-6 py-4 text-center text-gray-500">No transactions matching criteria.</td></tr>
                            )}
                            {filteredAndSortedTransactions.map(txn => (
                                <tr key={txn.id} className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer">
                                    <td className="px-6 py-4">{txn.transactionDate}</td>
                                    <td className="px-6 py-4">{txn.type}</td>
                                    <td className="px-6 py-4 font-bold text-white">{txn.currency} {txn.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4">{txn.senderName}</td>
                                    <td className="px-6 py-4">{txn.receiverName}</td>
                                    <td className="px-6 py-4">{txn.riskScore}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${txn.status === 'Flagged' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                            {txn.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {txn.flags.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {txn.flags.map((flag, i) => (
                                                    <span key={i} className="px-2 py-1 text-xs font-medium rounded-full bg-orange-500/20 text-orange-300">
                                                        {flag}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export const AuditLogTab: React.FC<{ caseData: KycAmlCase; }> = ({ caseData }) => {
    const [filterAction, setFilterAction] = useState<string>('all');
    const [filterUser, setFilterUser] = useState<string>('all');

    const filteredAuditLog = useMemo(() => {
        let filtered = caseData.auditLog;
        if (filterAction !== 'all') {
            filtered = filtered.filter(log => log.action === filterAction);
        }
        if (filterUser !== 'all') {
            filtered = filtered.filter(log => log.userId === filterUser);
        }
        return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [caseData.auditLog, filterAction, filterUser]);

    const uniqueActions = useMemo(() => ['all', ...Array.from(new Set(caseData.auditLog.map(log => log.action)))], [caseData.auditLog]);
    const uniqueUsers = useMemo(() => ['all', ...Array.from(new Set(caseData.auditLog.map(log => log.userId)))], [caseData.auditLog]);

    return (
        <div className="space-y-4">
            <Card title="Audit Log Filters">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Dropdown
                        label="Action Type"
                        options={uniqueActions.map(action => ({ value: action, label: action.replace(/([A-Z])/g, ' $1').trim() }))}
                        selectedValue={filterAction}
                        onValueChange={setFilterAction}
                    />
                    <Dropdown
                        label="User"
                        options={uniqueUsers.map(userId => ({ value: userId, label: MOCK_USERS.find(u => u.id === userId)?.name || 'Unknown User' }))}
                        selectedValue={filterUser}
                        onValueChange={setFilterUser}
                    />
                </div>
            </Card>
            <Card title="Case Audit Trail">
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th className="px-6 py-3">Timestamp</th>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Action</th>
                                <th className="px-6 py-3">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAuditLog.length === 0 && (
                                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No audit entries found.</td></tr>
                            )}
                            {filteredAuditLog.map(log => (
                                <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="px-6 py-4">{log.userName}</td>
                                    <td className="px-6 py-4"><span className="font-medium text-cyan-400">{log.action}</span></td>
                                    <td className="px-6 py-4">{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export const SanctionsMediaTab: React.FC<{ caseData: KycAmlCase; onTriggerScreening: (type: 'sanctions' | 'adverseMedia') => void; }> = ({ caseData, onTriggerScreening }) => {
    return (
        <div className="space-y-6">
            <Card title="Sanctions Screening Results">
                <div className="flex justify-end mb-4">
                    <button onClick={() => onTriggerScreening('sanctions')} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg">Re-run Sanctions Screen</button>
                </div>
                {caseData.sanctionScreeningResults.length === 0 ? (
                    <p className="text-sm text-gray-500">No sanctions screening results available for this case.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    <th className="px-6 py-3">List</th>
                                    <th className="px-6 py-3">Match Type</th>
                                    <th className="px-6 py-3">Matched Name</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Screen Date</th>
                                    <th className="px-6 py-3">Reviewer</th>
                                    <th className="px-6 py-3">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {caseData.sanctionScreeningResults.map(res => (
                                    <tr key={res.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-4">{res.list}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${res.matchType === 'None' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                                {res.matchType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{res.matchedName || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${res.status === 'Cleared' ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'}`}>
                                                {res.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{res.screenDate}</td>
                                        <td className="px-6 py-4">{MOCK_USERS.find(u => u.id === res.reviewerId)?.name || 'N/A'}</td>
                                        <td className="px-6 py-4">{res.notes || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <Card title="Adverse Media Results">
                <div className="flex justify-end mb-4">
                    <button onClick={() => onTriggerScreening('adverseMedia')} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg">Re-run Adverse Media Screen</button>
                </div>
                {caseData.adverseMediaResults.length === 0 ? (
                    <p className="text-sm text-gray-500">No adverse media results available for this case.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    <th className="px-6 py-3">Headline</th>
                                    <th className="px-6 py-3">Source</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Sentiment</th>
                                    <th className="px-6 py-3">Publish Date</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {caseData.adverseMediaResults.map(res => (
                                    <tr key={res.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-4">
                                            <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                                                {res.headline}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">{res.source}</td>
                                        <td className="px-6 py-4">
                                            {res.category.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {res.category.map((cat, i) => (
                                                        <span key={i} className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-500/20 text-indigo-300">
                                                            {cat}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${res.sentiment === 'Negative' ? 'bg-red-500/20 text-red-300' : res.sentiment === 'Positive' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                                                {res.sentiment}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{res.publishDate}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${res.status === 'Relevant' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                                {res.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <Card title="Risk Factor Analysis">
                {caseData.riskFactors.length === 0 ? (
                    <p className="text-sm text-gray-500">No specific risk factors identified for this case.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Description</th>
                                    <th className="px-6 py-3">Score Impact</th>
                                    <th className="px-6 py-3">Mitigated</th>
                                    <th className="px-6 py-3">Mitigation Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {caseData.riskFactors.map(factor => (
                                    <tr key={factor.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-4">{factor.category}</td>
                                        <td className="px-6 py-4">{factor.description}</td>
                                        <td className="px-6 py-4 text-red-400 font-bold">+{factor.scoreImpact}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${factor.isMitigated ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                                {factor.isMitigated ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{factor.mitigationDetails || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export const NotesCommunicationTab: React.FC<{ caseData: KycAmlCase; onAddComment: (text: string) => Promise<void>; }> = ({ caseData, onAddComment }) => {
    const [newComment, setNewComment] = useState('');
    const commentsEndRef = useRef<HTMLDivElement>(null);

    const handleAddComment = async () => {
        if (newComment.trim()) {
            await onAddComment(newComment);
            setNewComment('');
        }
    };

    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [caseData.comments]);

    return (
        <div className="space-y-4">
            <Card title="Case Notes">
                <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
                    {caseData.comments.length === 0 && (
                        <p className="text-sm text-gray-500 text-center">No notes or comments yet. Add one below.</p>
                    )}
                    {caseData.comments.map(comment => (
                        <div key={comment.id} className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                            <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                                <span className="font-semibold text-white">{comment.userName}</span>
                                <span>{new Date(comment.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-gray-300">{comment.text}</p>
                        </div>
                    ))}
                    <div ref={commentsEndRef} />
                </div>
                <div className="mt-4 border-t border-gray-700 pt-4">
                    <InputField
                        label="Add New Note"
                        type="text"
                        multiline
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Type your note here..."
                    />
                    <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="mt-3 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add Note
                    </button>
                </div>
            </Card>

            <Card title="Internal Communication (Mock)">
                <p className="text-sm text-gray-500">
                    In a real application, this section would feature a dedicated internal chat or messaging system for compliance teams to discuss cases.
                </p>
                <div className="mt-4 bg-gray-700/30 p-4 rounded-md text-sm text-gray-400">
                    <p className="mb-2"><strong>[Mock Message] Analyst Jane:</strong> Has anyone checked the related entity "Global Holdings LLC" yet?</p>
                    <p className="mb-2 text-right"><strong>[Mock Message] Senior Alice:</strong> Yes, a separate AML case (AML-007) was opened for them. No immediate red flags but monitoring is active.</p>
                    <p><strong>[Mock Message] Analyst Jane:</strong> Ok, thanks for the update!</p>
                </div>
            </Card>
        </div>
    );
};

// ================================================================================================
// SUB-COMPONENTS
// ================================================================================================

export const CaseDetailModal: React.FC<{ caseData: KycAmlCase | null; onClose: () => void; onCaseUpdated: (updatedCase: KycAmlCase) => void; }> = ({ caseData, onClose, onCaseUpdated }) => {
    const [aiSummary, setAiSummary] = useState('');
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [activeTab, setActiveTab] = useState('Overview');
    const [currentCaseData, setCurrentCaseData] = useState<KycAmlCase | null>(caseData); // Internal state for case data

    useEffect(() => {
        setCurrentCaseData(caseData);
        setAiSummary(''); // Clear AI summary on new case selection
        if (caseData) {
            setActiveTab('Overview'); // Reset tab to overview for new case
        }
    }, [caseData]);

    if (!currentCaseData) return null;

    const generateSummary = async () => {
        setIsLoadingAi(true);
        setAiSummary('');
        try {
            // NOTE: In a production environment, API_KEY would be securely managed,
            // and the prompt would be more sophisticated with actual case data.
            const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY as string }); // Changed to NEXT_PUBLIC_API_KEY for client-side
            const model = ai.getGenerativeModel({ model: 'gemini-pro' }); // Using a more capable model for detailed analysis
            const prompt = `You are a senior compliance analyst AI. Review the following KYC/AML case data and generate a brief, actionable "Next Steps" recommendation in 3-5 bullet points. Also, provide a brief risk assessment statement (1-2 sentences).

            Case ID: ${currentCaseData.id}
            Entity: ${currentCaseData.entityName} (${currentCaseData.entityType})
            Case Type: ${currentCaseData.caseType}
            Current Risk Level: ${currentCaseData.riskLevel}
            Status: ${currentCaseData.status}
            Summary: ${currentCaseData.summary}
            Description: ${currentCaseData.description}
            Documents Status: ${currentCaseData.documents.map(d => `${d.documentType}: ${d.status}`).join(', ') || 'None'}
            Transactions Flags: ${currentCaseData.transactions.flatMap(t => t.flags).join(', ') || 'None'}
            Sanctions Screening: ${currentCaseData.sanctionScreeningResults.map(r => `${r.list}: ${r.status}`).join(', ') || 'None'}
            Adverse Media: ${currentCaseData.adverseMediaResults.map(r => `${r.source}: ${r.status}`).join(', ') || 'None'}
            Risk Factors: ${currentCaseData.riskFactors.map(rf => `${rf.category}: ${rf.description} (Mitigated: ${rf.isMitigated})`).join(', ') || 'None'}
            Comments: ${currentCaseData.comments.map(c => c.text).join('; ') || 'None'}

            Based on this information, provide:
            1. A concise Risk Assessment Statement (1-2 sentences).
            2. 3-5 actionable "Next Steps" as bullet points.
            `;
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            setAiSummary(responseText.replace(/â€¢/g, '\n•')); // Replace specific character with standard bullet point
        } catch (err) {
            console.error("AI Generation Error:", err);
            setAiSummary("Error generating AI recommendations. Ensure API key is valid and prompt is well-formed. Check console for details.");
        } finally {
            setIsLoadingAi(false);
        }
    };

    const handleCaseUpdate = (updatedField: Partial<KycAmlCase>) => {
        if (currentCaseData) {
            const updatedCase = { ...currentCaseData, ...updatedField };
            setCurrentCaseData(updatedCase);
            onCaseUpdated(updatedCase); // Notify parent component of the update
        }
    };

    const handleUpdateStatus = async (newStatus: CaseStatus) => {
        try {
            const updated = await kycAmlService.updateCaseStatus(currentCaseData.id, newStatus, MOCK_USERS[0].id); // Using a mock user for now
            handleCaseUpdate(updated);
        } catch (error) {
            console.error('Failed to update case status:', error);
            // Revert UI state if API fails
            setCurrentCaseData(caseData);
        }
    };

    const handleAssignCase = async (assigneeId: string, assigneeName: string) => {
        try {
            const updated = await kycAmlService.assignCase(currentCaseData.id, assigneeId, assigneeName, MOCK_USERS[0].id);
            handleCaseUpdate(updated);
        } catch (error) {
            console.error('Failed to assign case:', error);
            setCurrentCaseData(caseData);
        }
    };

    const handleDecision = async (decision: KycAmlCase['decision'], reason: string) => {
        if (currentCaseData) {
            try {
                const updated = await kycAmlService.updateCase({
                    ...currentCaseData,
                    decision,
                    decisionReason: reason,
                    decisionByUserId: MOCK_USERS[0].id,
                    decisionDate: formatIsoDate(new Date()),
                    status: decision === 'Approved' ? 'Cleared' : decision === 'Rejected' ? 'Closed' : currentCaseData.status,
                });
                handleCaseUpdate(updated);
            } catch (error) {
                console.error('Failed to record decision:', error);
                setCurrentCaseData(caseData);
            }
        }
    };

    const handleAddComment = async (text: string) => {
        try {
            const updated = await kycAmlService.addCaseComment(currentCaseData.id, MOCK_USERS[0].id, MOCK_USERS[0].name, text);
            handleCaseUpdate(updated);
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };

    const handleUploadDocument = async (file: File, documentType: string) => {
        try {
            const newDoc = await kycAmlService.uploadDocument(currentCaseData.id, file, documentType, MOCK_USERS[0].id);
            handleCaseUpdate({ documents: [...currentCaseData.documents, newDoc] });
        } catch (error) {
            console.error('Failed to upload document:', error);
            throw error; // Re-throw to indicate failure
        }
    };

    const handleUpdateDocumentStatus = async (docId: string, status: DocumentStatus, reason?: string) => {
        try {
            const updatedDoc = await kycAmlService.updateDocumentStatus(currentCaseData.id, docId, status, MOCK_USERS[0].id, reason);
            handleCaseUpdate({
                documents: currentCaseData.documents.map(d => (d.id === docId ? updatedDoc : d)),
            });
        } catch (error) {
            console.error('Failed to update document status:', error);
            throw error;
        }
    };

    const handleTriggerScreening = async (type: 'sanctions' | 'adverseMedia') => {
        // In a real app, this would trigger a backend process and update the case data
        // For mock, we'll simulate adding a new result
        alert(`Simulating re-running ${type} screening for ${currentCaseData.entityName}. This would update the case data in a real system.`);
        // Simulate a new result being added after some delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        let updatedCase: KycAmlCase | null = null;
        if (type === 'sanctions') {
            const newResult = generateMockSanctionScreeningResult(currentCaseData.entityId);
            newResult.notes = 'Manually re-screened.';
            updatedCase = { ...currentCaseData, sanctionScreeningResults: [...currentCaseData.sanctionScreeningResults, newResult] };
        } else {
            const newResult = generateMockAdverseMediaResult(currentCaseData.entityId);
            newResult.notes = 'Manually re-screened.';
            updatedCase = { ...currentCaseData, adverseMediaResults: [...currentCaseData.adverseMediaResults, newResult] };
        }
        if (updatedCase) {
            handleCaseUpdate(updatedCase);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full border border-gray-700 h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Case Details: {currentCaseData.id} - {currentCaseData.entityName}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>

                <div className="flex-none border-b border-gray-700">
                    <div className="flex space-x-4 px-4 pt-2">
                        <TabButton label="Overview" active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
                        <TabButton label="Documents" active={activeTab === 'Documents'} onClick={() => setActiveTab('Documents')} />
                        <TabButton label="Transactions" active={activeTab === 'Transactions'} onClick={() => setActiveTab('Transactions')} />
                        <TabButton label="Audit Log" active={activeTab === 'Audit Log'} onClick={() => setActiveTab('Audit Log')} />
                        <TabButton label="Sanctions & Media" active={activeTab === 'Sanctions & Media'} onClick={() => setActiveTab('Sanctions & Media')} />
                        <TabButton label="Notes & Comms" active={activeTab === 'Notes & Comms'} onClick={() => setActiveTab('Notes & Comms')} />
                    </div>
                </div>

                <div className="p-6 flex-grow overflow-y-auto space-y-4">
                    {activeTab === 'Overview' && (
                        <>
                            <OverviewTab
                                caseData={currentCaseData}
                                onUpdateStatus={handleUpdateStatus}
                                onAssignCase={handleAssignCase}
                                onDecision={handleDecision}
                            />
                            <Card title="AI Analyst Recommendations">
                                <div className="min-h-[6rem]">
                                    {isLoadingAi && <p className="text-sm text-gray-400">Analyzing case data with AI...</p>}
                                    {aiSummary && <p className="text-sm text-gray-300 whitespace-pre-line">{aiSummary}</p>}
                                    {!aiSummary && !isLoadingAi && <button onClick={generateSummary} className="text-sm text-cyan-400 hover:underline">Generate AI Recommendations</button>}
                                </div>
                            </Card>
                        </>
                    )}
                    {activeTab === 'Documents' && (
                        <DocumentsTab
                            caseData={currentCaseData}
                            onUploadDocument={handleUploadDocument}
                            onUpdateDocumentStatus={handleUpdateDocumentStatus}
                        />
                    )}
                    {activeTab === 'Transactions' && <TransactionsTab caseData={currentCaseData} />}
                    {activeTab === 'Audit Log' && <AuditLogTab caseData={currentCaseData} />}
                    {activeTab === 'Sanctions & Media' && <SanctionsMediaTab caseData={currentCaseData} onTriggerScreening={handleTriggerScreening} />}
                    {activeTab === 'Notes & Comms' && <NotesCommunicationTab caseData={currentCaseData} onAddComment={handleAddComment} />}
                </div>

                <div className="flex-none p-4 bg-gray-900/50 border-t border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg">Close</button>
                    {/* Additional action buttons like "Escalate", "Generate Report", etc. */}
                    <button className="px-4 py-2 bg-purple-600/50 hover:bg-purple-600 text-white text-sm rounded-lg">Escalate Case</button>
                </div>
            </div>
        </div>
    );
};

export const KycAmlCaseFilterPanel: React.FC<{
    currentFilters: any;
    onFilterChange: (filters: any) => void;
    onResetFilters: () => void;
    assigneeOptions: { value: string; label: string; }[];
}> = ({ currentFilters, onFilterChange, onResetFilters, assigneeOptions }) => {
    const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        onFilterChange({ [field]: e.target.value });
    };

    const handleDateRangeChange = (field: 'startDate' | 'endDate') => (date: string) => {
        onFilterChange({ dateRange: { ...currentFilters.dateRange, [field === 'startDate' ? 'start' : 'end']: date } });
    };

    return (
        <Card title="Advanced Filters" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputField
                    label="Search by ID/Name/Summary"
                    type="text"
                    value={currentFilters.search || ''}
                    onChange={handleInputChange('search')}
                    placeholder="Case ID, Entity Name..."
                />
                <Dropdown
                    label="Case Status"
                    options={[{ value: 'all', label: 'All Statuses' }, ...Object.values(CaseStatus).map(s => ({ value: s, label: s }))]}
                    selectedValue={currentFilters.status || 'all'}
                    onValueChange={(value) => onFilterChange({ status: value as CaseStatus | 'all' })}
                />
                <Dropdown
                    label="Risk Level"
                    options={[{ value: 'all', label: 'All Risks' }, ...Object.values(CaseRisk).map(r => ({ value: r, label: r }))]}
                    selectedValue={currentFilters.riskLevel || 'all'}
                    onValueChange={(value) => onFilterChange({ riskLevel: value as CaseRisk | 'all' })}
                />
                <Dropdown
                    label="Case Type"
                    options={[{ value: 'all', label: 'All Types' }, ...Object.values(CaseType).map(t => ({ value: t, label: t }))]}
                    selectedValue={currentFilters.caseType || 'all'}
                    onValueChange={(value) => onFilterChange({ caseType: value as CaseType | 'all' })}
                />
                <Dropdown
                    label="Assignee"
                    options={assigneeOptions}
                    selectedValue={currentFilters.assigneeId || 'all'}
                    onValueChange={(value) => onFilterChange({ assigneeId: value })}
                />
                <DateRangePicker
                    startDate={currentFilters.dateRange?.start || ''}
                    endDate={currentFilters.dateRange?.end || ''}
                    onStartDateChange={handleDateRangeChange('startDate')}
                    onEndDateChange={handleDateRangeChange('endDate')}
                    label="Date Opened"
                />
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-gray-700 pt-4">
                <button onClick={onResetFilters} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg">Reset Filters</button>
                {/* <button onClick={() => applyFilters()} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg">Apply Filters</button> */}
            </div>
        </Card>
    );
};

export const KycAmlReportsView: React.FC = () => {
    const [kpiHistory, setKpiHistory] = useState<KpiSnapshot[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const response = await kycAmlService.fetchDashboardKPIs();
                setKpiHistory(response.history);
            } catch (error) {
                console.error("Failed to fetch KPI history:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const chartData = useMemo(() => {
        if (!kpiHistory.length) return { labels: [], datasets: [] };
        return {
            labels: kpiHistory.map(kpi => kpi.date.substring(5)), // Month-Day
            datasets: [
                {
                    label: 'New Cases',
                    data: kpiHistory.map(kpi => kpi.newCases),
                    borderColor: 'rgb(239, 68, 68)', // red-500
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    fill: false,
                    tension: 0.1,
                },
                {
                    label: 'Under Review',
                    data: kpiHistory.map(kpi => kpi.underReview),
                    borderColor: 'rgb(250, 204, 21)', // yellow-400
                    backgroundColor: 'rgba(250, 204, 21, 0.2)',
                    fill: false,
                    tension: 0.1,
                },
                {
                    label: 'Escalated Cases',
                    data: kpiHistory.map(kpi => kpi.escalated),
                    borderColor: 'rgb(168, 85, 247)', // purple-500
                    backgroundColor: 'rgba(168, 85, 247, 0.2)',
                    fill: false,
                    tension: 0.1,
                },
                {
                    label: 'Cleared Cases',
                    data: kpiHistory.map(kpi => kpi.cleared),
                    borderColor: 'rgb(34, 197, 94)', // green-500
                    backgroundColor: 'rgba(34, 197, 94, 0.2)',
                    fill: false,
                    tension: 0.1,
                }
            ],
        };
    }, [kpiHistory]);

    // This would typically use a charting library like Chart.js or Recharts.
    // For this exercise, we'll just mock a basic SVG-based representation or a simple text summary.
    const MockLineChart: React.FC<{ data: typeof chartData; title: string; }> = ({ data, title }) => (
        <Card title={title}>
            {isLoading ? (
                <p className="text-gray-400 text-sm">Loading chart data...</p>
            ) : (
                <div className="h-64 flex items-center justify-center bg-gray-900/50 rounded-md text-gray-400 text-sm">
                    <p>Mock Chart for "{title}"</p>
                    {/* In a real app, render a Chart.js Line component */}
                    <div className="absolute opacity-0">
                        {/* Hidden div to show the structure if a library was used */}
                        {JSON.stringify(data)}
                    </div>
                </div>
            )}
        </Card>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Compliance Reports & Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MockLineChart data={chartData} title="Case Volume Trends (Last 30 Days)" />
                <Card title="Case Distribution by Risk">
                    <div className="flex flex-col gap-2">
                        {Object.values(CaseRisk).map(risk => {
                            const count = MOCK_CASES.filter(c => c.riskLevel === risk).length;
                            const total = MOCK_CASES.length;
                            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                            return (
                                <div key={risk} className="flex justify-between items-center text-sm text-gray-300">
                                    <span><RiskBadge risk={risk} /> {risk} Cases</span>
                                    <span className="font-semibold">{count} ({percentage}%)</span>
                                </div>
                            );
                        })}
                    </div>
                </Card>
                <Card title="Top Assignees (By Open Cases)">
                    <ul className="text-sm text-gray-300">
                        {MOCK_USERS.filter(u => u.id !== 'usr-unassigned')
                            .map(user => ({
                                user,
                                openCases: MOCK_CASES.filter(c => c.assigneeId === user.id && (c.status === 'New' || c.status === 'Under Review' || c.status === 'Escalated')).length,
                            }))
                            .sort((a, b) => b.openCases - a.openCases)
                            .slice(0, 5)
                            .map(item => (
                                <li key={item.user.id} className="flex justify-between py-1 border-b border-gray-700 last:border-0">
                                    <span>{item.user.name} ({item.user.role})</span>
                                    <span className="font-semibold text-cyan-400">{item.openCases}</span>
                                </li>
                            ))}
                    </ul>
                </Card>
            </div>
            <Card title="Custom Report Generator (Mock)">
                <p className="text-sm text-gray-500 mb-4">
                    This section would allow users to configure and generate custom reports based on various case parameters, date ranges, and entity attributes.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Dropdown
                        label="Report Type"
                        options={[{ value: 'case_summary', label: 'Case Summary Report' }, { value: 'transaction_audit', label: 'Transaction Audit Log' }, { value: 'risk_overview', label: 'Risk Overview' }]}
                        selectedValue="case_summary"
                        onValueChange={() => { }}
                    />
                    <DateRangePicker
                        startDate=""
                        endDate=""
                        onStartDateChange={() => { }}
                        onEndDateChange={() => { }}
                    />
                    <div className="self-end">
                        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg w-full">Generate Report</button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export const KycAmlSettingsView: React.FC = () => {
    const [settings, setSettings] = useState<DashboardSettings>(MOCK_DASHBOARD_SETTINGS);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const fetchedSettings = await kycAmlService.fetchSettings();
                setSettings(fetchedSettings);
            } catch (error) {
                console.error("Failed to fetch settings:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (field: keyof DashboardSettings, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleAlertThresholdChange = (field: keyof DashboardSettings['alertThresholds'], value: string) => {
        setSettings(prev => ({
            ...prev,
            alertThresholds: {
                ...prev.alertThresholds,
                [field]: Number(value),
            },
        }));
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        setSaveStatus('idle');
        try {
            await kycAmlService.updateSettings(settings);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            console.error("Failed to save settings:", error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="text-gray-400">Loading settings...</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Dashboard Settings</h2>

            <Card title="General Preferences">
                <div className="space-y-4">
                    <Dropdown
                        label="Theme"
                        options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]}
                        selectedValue={settings.theme}
                        onValueChange={(value) => handleChange('theme', value as DashboardSettings['theme'])}
                    />
                    <div>
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-cyan-600 bg-gray-700 border-gray-600 rounded"
                                checked={settings.notificationsEnabled}
                                onChange={(e) => handleChange('notificationsEnabled', e.target.checked)}
                            />
                            <span className="ml-2 text-sm text-gray-300">Enable Notifications</span>
                        </label>
                    </div>
                    <InputField
                        label="Auto Refresh Interval (seconds)"
                        type="number"
                        value={String(settings.autoRefreshInterval)}
                        onChange={(e) => handleChange('autoRefreshInterval', Number(e.target.value))}
                        className="max-w-xs"
                    />
                    <Dropdown
                        label="Default Case Filter"
                        options={[{ value: 'all', label: 'All' }, ...Object.values(CaseStatus).map(s => ({ value: s, label: s }))]}
                        selectedValue={settings.defaultCaseFilter}
                        onValueChange={(value) => handleChange('defaultCaseFilter', value as DashboardSettings['defaultCaseFilter'])}
                        className="max-w-xs"
                    />
                </div>
            </Card>

            <Card title="Alert Thresholds">
                <div className="space-y-4">
                    <InputField
                        label="New High Risk Cases (per day)"
                        type="number"
                        value={String(settings.alertThresholds.newHighRiskCases)}
                        onChange={(e) => handleAlertThresholdChange('newHighRiskCases', e.target.value)}
                        className="max-w-xs"
                    />
                    <InputField
                        label="Escalated Cases (total)"
                        type="number"
                        value={String(settings.alertThresholds.escalatedCases)}
                        onChange={(e) => handleAlertThresholdChange('escalatedCases', e.target.value)}
                        className="max-w-xs"
                    />
                </div>
            </Card>

            <div className="flex justify-end gap-3">
                {saveStatus === 'success' && <span className="text-green-500 self-center text-sm">Settings saved successfully!</span>}
                {saveStatus === 'error' && <span className="text-red-500 self-center text-sm">Error saving settings.</span>}
                <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </div>
    );
};


// ================================================================================================
// MAIN VIEW COMPONENT
// ================================================================================================

const KycAmlView: React.FC = () => {
    const [allCases, setAllCases] = useState<KycAmlCase[]>([]); // Store all cases
    const [displayedCases, setDisplayedCases] = useState<KycAmlCase[]>([]); // Cases for current page/filters
    const [totalCases, setTotalCases] = useState(0);
    const [filters, setFilters] = useState<{
        status: CaseStatus | 'all';
        search: string;
        caseType: CaseType | 'all';
        riskLevel: CaseRisk | 'all';
        assigneeId: string | 'all';
        dateRange: { start: string; end: string; };
    }>({
        status: 'all',
        search: '',
        caseType: 'all',
        riskLevel: 'all',
        assigneeId: 'all',
        dateRange: { start: '', end: '' },
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState<keyof KycAmlCase>('dateOpened');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [selectedCase, setSelectedCase] = useState<KycAmlCase | null>(null);
    const [kpiData, setKpiData] = useState<Record<string, number | string>>({});
    const [activeDashboardTab, setActiveDashboardTab] = useState<'queue' | 'reports' | 'settings'>('queue');
    const [loadingCases, setLoadingCases] = useState(true);
    const [loadingKPIs, setLoadingKPIs] = useState(true);

    const availableAssignees = useMemo(() => {
        return [{ value: 'all', label: 'All Assignees' }, ...MOCK_USERS.map(u => ({ value: u.id, label: u.name }))];
    }, []);

    const fetchCaseData = useCallback(async () => {
        setLoadingCases(true);
        try {
            const { cases, total } = await kycAmlService.fetchCases(
                filters,
                { page: currentPage, limit: pageSize },
                { field: sortBy, direction: sortDirection }
            );
            setDisplayedCases(cases);
            setTotalCases(total);
        } catch (error) {
            console.error("Failed to fetch cases:", error);
            setDisplayedCases([]);
            setTotalCases(0);
        } finally {
            setLoadingCases(false);
        }
    }, [filters, currentPage, pageSize, sortBy, sortDirection]);

    const fetchKpiData = useCallback(async () => {
        setLoadingKPIs(true);
        try {
            const { kpis } = await kycAmlService.fetchDashboardKPIs();
            setKpiData(kpis);
        } catch (error) {
            console.error("Failed to fetch KPIs:", error);
            setKpiData({});
        } finally {
            setLoadingKPIs(false);
        }
    }, []);

    useEffect(() => {
        fetchCaseData();
    }, [fetchCaseData]);

    useEffect(() => {
        fetchKpiData();
        // Set up auto-refresh for KPIs
        const intervalId = setInterval(fetchKpiData, MOCK_DASHBOARD_SETTINGS.autoRefreshInterval * 1000);
        return () => clearInterval(intervalId);
    }, [fetchKpiData]);

    const handleFilterChange = (newFilterPartial: Partial<typeof filters>) => {
        setFilters(prev => {
            const newFilters = { ...prev, ...newFilterPartial };
            // Ensure dateRange object is merged properly, not overwritten completely
            if (newFilterPartial.dateRange) {
                newFilters.dateRange = { ...prev.dateRange, ...newFilterPartial.dateRange };
            }
            return newFilters;
        });
        setCurrentPage(1); // Reset to first page on filter change
    };

    const handleResetFilters = () => {
        setFilters({
            status: 'all',
            search: '',
            caseType: 'all',
            riskLevel: 'all',
            assigneeId: 'all',
            dateRange: { start: '', end: '' },
        });
        setCurrentPage(1);
        setSortBy('dateOpened');
        setSortDirection('desc');
    };

    const handleCaseUpdated = (updatedCase: KycAmlCase) => {
        // Update the case in the displayed list and the overall mock data
        setDisplayedCases(prev => prev.map(c => (c.id === updatedCase.id ? updatedCase : c)));
        // Also update MOCK_CASES to reflect the change for other components/future fetches
        const indexInAllCases = MOCK_CASES.findIndex(c => c.id === updatedCase.id);
        if (indexInAllCases !== -1) {
            MOCK_CASES[indexInAllCases] = updatedCase;
        }
        if (selectedCase && selectedCase.id === updatedCase.id) {
            setSelectedCase(updatedCase); // Update the modal's state if it's open
        }
        fetchKpiData(); // KPIs might change with status updates
    };

    const totalPages = Math.ceil(totalCases / pageSize);

    const getKpiValue = (key: string, defaultValue: string | number = '-') =>
        loadingKPIs ? '...' : kpiData[key] !== undefined ? kpiData[key] : defaultValue;


    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">KYC/AML Compliance Dashboard</h2>
                    <div className="flex space-x-2 p-1 bg-gray-900/50 rounded-lg">
                        <TabButton label="Case Queue" active={activeDashboardTab === 'queue'} onClick={() => setActiveDashboardTab('queue')} />
                        <TabButton label="Reports" active={activeDashboardTab === 'reports'} onClick={() => setActiveDashboardTab('reports')} />
                        <TabButton label="Settings" active={activeDashboardTab === 'settings'} onClick={() => setActiveDashboardTab('settings')} />
                    </div>
                </div>

                {activeDashboardTab === 'queue' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            <Card className="text-center"><p className="text-3xl font-bold text-red-400">{getKpiValue('newCases', 0)}</p><p className="text-sm text-gray-400 mt-1">New Cases</p></Card>
                            <Card className="text-center"><p className="text-3xl font-bold text-yellow-400">{getKpiValue('underReview', 0)}</p><p className="text-sm text-gray-400 mt-1">Under Review</p></Card>
                            <Card className="text-center"><p className="text-3xl font-bold text-purple-400">{getKpiValue('escalated', 0)}</p><p className="text-sm text-gray-400 mt-1">Escalated</p></Card>
                            <Card className="text-center"><p className="text-3xl font-bold text-orange-400">{getKpiValue('highRiskCases', 0)}</p><p className="text-sm text-gray-400 mt-1">High Risk Cases</p></Card>
                            <Card className="text-center"><p className="text-3xl font-bold text-white">{getKpiValue('avgResolutionTime', 'N/A')}</p><p className="text-sm text-gray-400 mt-1">Avg. Resolution Time</p></Card>
                        </div>

                        <KycAmlCaseFilterPanel
                            currentFilters={filters}
                            onFilterChange={handleFilterChange}
                            onResetFilters={handleResetFilters}
                            assigneeOptions={availableAssignees}
                        />

                        <Card>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-white">Case Review Queue</h3>
                                <div className="flex space-x-1 p-1 bg-gray-900/50 rounded-lg">
                                    {(['all', 'New', 'Under Review', 'Cleared', 'Escalated', 'Pending Docs', 'Awaiting Approval', 'Closed'] as const).map(status => (
                                        <button key={status} onClick={() => handleFilterChange({ status })} className={`px-3 py-1 text-sm rounded-md ${filters.status === status ? 'bg-cyan-600' : 'text-gray-300'}`}>{status}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-400">
                                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                        <tr>
                                            {([
                                                { key: 'id', label: 'Case ID' },
                                                { key: 'entityName', label: 'Entity' },
                                                { key: 'caseType', label: 'Case Type' },
                                                { key: 'riskLevel', label: 'Risk Level' },
                                                { key: 'status', label: 'Status' },
                                                { key: 'assigneeName', label: 'Assignee' },
                                                { key: 'dateOpened', label: 'Opened' },
                                            ] as const).map(col => (
                                                <th
                                                    key={col.key}
                                                    className="px-6 py-3 cursor-pointer select-none"
                                                    onClick={() => {
                                                        if (sortBy === col.key) {
                                                            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
                                                        } else {
                                                            setSortBy(col.key);
                                                            setSortDirection('desc');
                                                        }
                                                    }}
                                                >
                                                    {col.label}
                                                    {sortBy === col.key && (
                                                        <span className="ml-1">
                                                            {sortDirection === 'asc' ? '▲' : '▼'}
                                                        </span>
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingCases ? (
                                            <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">Loading cases...</td></tr>
                                        ) : displayedCases.length === 0 ? (
                                            <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">No cases found matching your criteria.</td></tr>
                                        ) : (
                                            displayedCases.map(c => (
                                                <tr key={c.id} onClick={() => setSelectedCase(c)} className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer">
                                                    <td className="px-6 py-4 font-mono text-white">{c.id}</td>
                                                    <td className="px-6 py-4">{c.entityName}</td>
                                                    <td className="px-6 py-4">{c.caseType}</td>
                                                    <td className="px-6 py-4"><RiskBadge risk={c.riskLevel} /></td>
                                                    <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                                                    <td className="px-6 py-4">{c.assigneeName}</td>
                                                    <td className="px-6 py-4">{c.dateOpened}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                pageSize={pageSize}
                                onPageSizeChange={setPageSize}
                                totalItems={totalCases}
                            />
                        </Card>
                    </>
                )}

                {activeDashboardTab === 'reports' && <KycAmlReportsView />}
                {activeDashboardTab === 'settings' && <KycAmlSettingsView />}
            </div>
            <CaseDetailModal caseData={selectedCase} onClose={() => setSelectedCase(null)} onCaseUpdated={handleCaseUpdated} />
        </>
    );
};

export default KycAmlView;