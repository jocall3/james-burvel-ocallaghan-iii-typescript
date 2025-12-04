// components/views/megadashboard/regulation/DisclosuresView.tsx
import React, { useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { GoogleGenAI } from "@google/genai";
import classNames from 'classnames'; // Assuming classNames is available or can be added. If not, I'll inline the logic.

// --- Global Type Definitions (for a real-world application) ---
export interface RegulatoryDisclosure {
    id: string;
    title: string;
    jurisdiction: string;
    filingDate: string; // ISO date string
    status: 'Draft' | 'Pending Review' | 'Approved' | 'Filed' | 'Rejected';
    type: 'Financial' | 'Environmental' | 'Data Breach' | 'Governance' | 'Product Safety' | 'Other';
    summary: string;
    fullContent: string;
    lastEditedBy: string;
    lastEditedDate: string; // ISO date string
    version: number;
    associatedRisks: string[]; // IDs of associated risks
    documents: DocumentAttachment[];
    reviewHistory: DisclosureReview[];
    filingScheduleId?: string;
    complianceChecks: ComplianceCheckResult[];
    tags: string[];
    sentimentAnalysis?: SentimentAnalysisResult;
    keywords?: string[];
    audience: 'Public' | 'Regulators' | 'Internal';
    legalReviewStatus?: 'Not Started' | 'In Progress' | 'Approved' | 'Revisions Required';
    isConfidential: boolean;
    language: string;
}

export interface DocumentAttachment {
    id: string;
    name: string;
    url: string;
    type: 'PDF' | 'DOCX' | 'TXT' | 'JSON' | 'CSV';
    uploadedBy: string;
    uploadedDate: string; // ISO date string
    description?: string;
    version?: number;
}

export interface DisclosureReview {
    id: string;
    reviewerId: string;
    reviewerName: string;
    reviewDate: string; // ISO date string
    status: 'Approved' | 'Revisions Required' | 'Commented';
    comments: string;
}

export interface ComplianceRule {
    id: string;
    name: string;
    description: string;
    jurisdiction: string;
    effectiveDate: string; // ISO date string
    ruleText: string;
    categories: string[]; // e.g., ['Data Privacy', 'Financial Reporting']
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    referenceUrl?: string;
    lastUpdated: string;
    version: number;
}

export interface ComplianceCheckResult {
    ruleId: string;
    ruleName: string;
    status: 'Pass' | 'Fail' | 'Warning' | 'Not Applicable';
    details: string;
    checkedDate: string; // ISO date string
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    automated: boolean;
}

export interface Risk {
    id: string;
    name: string;
    description: string;
    category: 'Operational' | 'Financial' | 'Compliance' | 'Strategic' | 'Reputational';
    likelihood: 'Low' | 'Medium' | 'High';
    impact: 'Low' | 'Medium' | 'High';
    mitigationStrategy: string;
    status: 'Active' | 'Mitigated' | 'Closed';
    lastUpdated: string; // ISO date string
    relatedRegulations?: string[]; // IDs of related regulations/rules
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Legal' | 'Compliance' | 'Editor' | 'Viewer';
    department: string;
}

export interface FilingSchedule {
    id: string;
    disclosureId: string;
    title: string;
    deadline: string; // ISO date string
    jurisdiction: string;
    status: 'Upcoming' | 'Submitted' | 'Overdue';
    remindersSent: number;
    assignedTo: string; // User ID
    notes?: string;
}

export interface AuditLogEntry {
    id: string;
    timestamp: string; // ISO date string
    userId: string;
    userName: string;
    action: string; // e.g., 'CREATED', 'UPDATED', 'DELETED', 'REVIEWED', 'FILED'
    entityType: 'Disclosure' | 'ComplianceRule' | 'FilingSchedule' | 'Document';
    entityId: string;
    details: string;
    previousValue?: any;
    newValue?: any;
}

export interface AIMetadata {
    model: string;
    temperature: number;
    timestamp: string;
    promptTokens: number;
    completionTokens: number;
    responseId: string;
}

export interface SentimentAnalysisResult {
    overallSentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
    confidence: number;
    breakdown?: {
        positive: number;
        negative: number;
        neutral: number;
    };
    keywords?: { text: string; sentiment: 'Positive' | 'Negative' | 'Neutral' }[];
}

export interface TranslationResult {
    originalText: string;
    translatedText: string;
    targetLanguage: string;
    sourceLanguage: string;
    aiMetadata: AIMetadata;
}

// --- Mock Data (for demonstration purposes, in a real app these would come from an API) ---
const MOCK_USERS: UserProfile[] = [
    { id: 'usr_001', name: 'Alice Smith', email: 'alice@example.com', role: 'Admin', department: 'Executive' },
    { id: 'usr_002', name: 'Bob Johnson', email: 'bob@example.com', role: 'Legal', department: 'Legal' },
    { id: 'usr_003', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Compliance', department: 'Compliance' },
    { id: 'usr_004', name: 'Diana Prince', email: 'diana@example.com', role: 'Editor', department: 'PR' },
];

const MOCK_RISKS: Risk[] = [
    {
        id: 'risk_001', name: 'GDPR Non-Compliance', description: 'Potential fines and reputational damage from GDPR violations.',
        category: 'Compliance', likelihood: 'Medium', impact: 'High', mitigationStrategy: 'Regular audits, employee training, robust data protection measures.',
        status: 'Active', lastUpdated: '2023-10-26T10:00:00Z', relatedRegulations: ['GDPR', 'CCPA']
    },
    {
        id: 'risk_002', name: 'Supply Chain Disruption', description: 'Interruption of critical supplies due to geopolitical events or natural disasters.',
        category: 'Operational', likelihood: 'Medium', impact: 'Medium', mitigationStrategy: 'Diversify suppliers, maintain buffer inventory, contingency planning.',
        status: 'Active', lastUpdated: '2023-09-15T14:30:00Z'
    },
    {
        id: 'risk_003', name: 'Data Breach', description: 'Unauthorized access to sensitive customer data.',
        category: 'Reputational', likelihood: 'Medium', impact: 'Critical', mitigationStrategy: 'Enhanced cybersecurity, employee awareness, incident response plan.',
        status: 'Active', lastUpdated: '2023-11-01T09:00:00Z'
    }
];

const MOCK_COMPLIANCE_RULES: ComplianceRule[] = [
    {
        id: 'rule_gdpr', name: 'GDPR Article 33', description: 'Notification of a personal data breach to the supervisory authority.',
        jurisdiction: 'EU', effectiveDate: '2018-05-25', ruleText: 'In the case of a personal data breach, the controller shall without undue delay and, where feasible, not later than 72 hours after having become aware of it, notify the personal data breach to the supervisory authority competent in accordance with Article 55, unless the personal data breach is unlikely to result in a risk to the rights and freedoms of natural persons.',
        categories: ['Data Privacy', 'Data Breach'], severity: 'Critical', referenceUrl: 'https://gdpr-info.eu/art-33-gdpr/', lastUpdated: '2023-01-01T00:00:00Z', version: 1
    },
    {
        id: 'rule_sec_10b', name: 'SEC Rule 10b-5', description: 'Prohibits any act or omission resulting in fraud or deceit in connection with the purchase or sale of any security.',
        jurisdiction: 'US', effectiveDate: '1942-05-21', ruleText: 'It shall be unlawful for any person, directly or indirectly, by the use of any means or instrumentality of interstate commerce, or of the mails or of any facility of any national securities exchange...',
        categories: ['Financial', 'Securities'], severity: 'Critical', referenceUrl: 'https://www.sec.gov/rules/final/34-32304.txt', lastUpdated: '2023-01-01T00:00:00Z', version: 1
    }
];

const MOCK_DISCLOSURES: RegulatoryDisclosure[] = [
    {
        id: 'disc_001', title: 'Q3 2023 Earnings Report', jurisdiction: 'SEC (US)', filingDate: '2023-11-15', status: 'Filed',
        type: 'Financial', summary: 'Quarterly financial performance disclosure.', fullContent: 'Detailed financial statements, management discussion and analysis...',
        lastEditedBy: 'Alice Smith', lastEditedDate: '2023-11-14T18:00:00Z', version: 1, associatedRisks: [], documents: [], reviewHistory: [], complianceChecks: [], tags: ['Earnings', 'Financial'], audience: 'Public', isConfidential: false, language: 'en',
    },
    {
        id: 'disc_002', title: 'Minor Data Breach Notification', jurisdiction: 'ICO (UK)', filingDate: '2023-10-20', status: 'Approved',
        type: 'Data Breach', summary: 'Notification to ICO regarding a minor data breach affecting 500 users, no PII exposed.', fullContent: 'On October 18, 2023, we identified unauthorized access to a non-sensitive internal database...',
        lastEditedBy: 'Bob Johnson', lastEditedDate: '2023-10-19T10:30:00Z', version: 2, associatedRisks: ['risk_001', 'risk_003'], documents: [], reviewHistory: [], complianceChecks: [{
            ruleId: 'rule_gdpr', ruleName: 'GDPR Article 33', status: 'Pass', details: 'Breach reported within 72 hours. No high risk to data subjects.',
            checkedDate: '2023-10-19T11:00:00Z', severity: 'High', automated: true
        }], tags: ['Data Breach', 'GDPR'], sentimentAnalysis: { overallSentiment: 'Neutral', confidence: 0.8 }, keywords: ['data breach', 'notification', 'ICO'], audience: 'Regulators', legalReviewStatus: 'Approved', isConfidential: false, language: 'en',
    },
    {
        id: 'disc_003', title: 'Environmental Impact Statement for New Plant', jurisdiction: 'EPA (US)', filingDate: '2024-03-01', status: 'Draft',
        type: 'Environmental', summary: 'Draft statement assessing environmental impact of proposed new manufacturing plant.', fullContent: 'This document details the potential environmental effects, proposed mitigation strategies, and compliance with local and federal environmental regulations...',
        lastEditedBy: 'Charlie Brown', lastEditedDate: '2023-12-01T14:00:00Z', version: 1, associatedRisks: ['risk_002'], documents: [], reviewHistory: [], complianceChecks: [], tags: ['Environment', 'EPA'], audience: 'Public', isConfidential: false, language: 'en',
    }
];

// --- Utility Functions (many more would exist in a full application) ---
export const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
};

export const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

export const generateUniqueId = (prefix: string = 'id_') => `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const getStatusColorClass = (status: string) => {
    switch (status) {
        case 'Approved':
        case 'Filed':
        case 'Pass':
        case 'Mitigated':
        case 'Submitted':
            return 'text-green-400';
        case 'Pending Review':
        case 'Warning':
        case 'Upcoming':
            return 'text-yellow-400';
        case 'Rejected':
        case 'Fail':
        case 'Overdue':
        case 'Critical':
        case 'Revisions Required':
            return 'text-red-400';
        case 'Draft':
        case 'In Progress':
        default:
            return 'text-blue-400';
    }
};

export const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);

// --- AI Service Wrapper (expanded) ---
export class AIComplianceService {
    private genAI: GoogleGenAI;
    private apiKey: string;
    private defaultModel: string;

    constructor(apiKey: string, defaultModel: string = 'gemini-1.5-flash') {
        if (!apiKey) throw new Error("API Key for Google GenAI is not provided.");
        this.apiKey = apiKey;
        this.genAI = new GoogleGenAI({ apiKey });
        this.defaultModel = defaultModel;
    }

    private async generateContent(prompt: string, model: string = this.defaultModel): Promise<string> {
        try {
            const aiModel = this.genAI.getGenerativeModel({ model });
            const result = await aiModel.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error(`Error calling AI model ${model}:`, error);
            throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Drafts a public disclosure statement.
     * @param eventDescription - Description of the event to disclose.
     * @param tone - 'Professional', 'Urgent', 'Sympathetic', 'Formal'.
     * @param targetAudience - 'General Public', 'Regulators', 'Investors'.
     * @param guidelines - Specific legal/company guidelines to adhere to.
     */
    public async draftDisclosure(
        eventDescription: string,
        tone: string = 'Professional',
        targetAudience: string = 'General Public',
        guidelines: string = ''
    ): Promise<{ draft: string; aiMetadata: AIMetadata }> {
        const prompt = `You are a legal and public relations AI. Draft a concise, professional public disclosure statement for the following event: "${eventDescription}".
        Target audience: ${targetAudience}. Tone: ${tone}. Adhere to these additional guidelines if provided: ${guidelines}.
        The output should be the disclosure text only.`;
        const startTime = Date.now();
        const responseText = await this.generateContent(prompt);
        const endTime = Date.now();
        // Mocking token count and response ID
        const aiMetadata: AIMetadata = {
            model: this.defaultModel,
            temperature: 0.7, // Example
            timestamp: new Date().toISOString(),
            promptTokens: Math.ceil(prompt.length / 4), // Rough estimate
            completionTokens: Math.ceil(responseText.length / 4), // Rough estimate
            responseId: generateUniqueId('aires_'),
        };
        return { draft: responseText, aiMetadata };
    }

    /**
     * Analyzes the sentiment of a given text.
     */
    public async analyzeSentiment(text: string): Promise<{ result: SentimentAnalysisResult; aiMetadata: AIMetadata }> {
        const prompt = `Analyze the sentiment of the following text and provide a JSON object with overallSentiment (Positive, Negative, Neutral, Mixed), confidence (0-1), and optionally breakdown for positive/negative/neutral percentages and relevant keywords with their sentiment.
        Text: "${text}"`;
        const startTime = Date.now();
        const responseText = await this.generateContent(prompt, 'gemini-1.5-pro'); // Use a more capable model for analysis
        const endTime = Date.now();
        const aiMetadata: AIMetadata = {
            model: 'gemini-1.5-pro',
            temperature: 0.2,
            timestamp: new Date().toISOString(),
            promptTokens: Math.ceil(prompt.length / 4),
            completionTokens: Math.ceil(responseText.length / 4),
            responseId: generateUniqueId('aisent_'),
        };
        try {
            const result = JSON.parse(responseText);
            // Basic validation for sentiment result structure
            if (!result.overallSentiment || !result.confidence) {
                throw new Error("Invalid sentiment analysis response structure.");
            }
            return { result, aiMetadata };
        } catch (e) {
            console.warn("AI sentiment analysis returned non-JSON or invalid structure, returning default.", e);
            return {
                result: { overallSentiment: 'Neutral', confidence: 0.5, breakdown: { positive: 0, negative: 0, neutral: 100 } },
                aiMetadata
            };
        }
    }

    /**
     * Checks a disclosure against specific compliance rules.
     * @param disclosureContent - The full content of the disclosure.
     * @param rules - An array of ComplianceRule objects to check against.
     */
    public async performComplianceCheck(
        disclosureContent: string,
        rules: ComplianceRule[]
    ): Promise<{ checks: ComplianceCheckResult[]; aiMetadata: AIMetadata }> {
        const rulePrompts = rules.map(rule => `- Rule Name: ${rule.name}\n  Rule ID: ${rule.id}\n  Rule Text: ${rule.ruleText}\n  Severity: ${rule.severity}`).join('\n');
        const prompt = `You are an expert compliance AI. Review the following disclosure content against the provided compliance rules.
        For each rule, determine if the disclosure content 'Passes', 'Fails', or has a 'Warning'. Provide details for each check.
        Respond with a JSON array of objects, each containing ruleId, ruleName, status ('Pass'|'Fail'|'Warning'), details, and severity.
        
        Disclosure Content:
        "${disclosureContent}"
        
        Compliance Rules to check:
        ${rulePrompts}
        `;
        const startTime = Date.now();
        const responseText = await this.generateContent(prompt, 'gemini-1.5-pro');
        const endTime = Date.now();
        const aiMetadata: AIMetadata = {
            model: 'gemini-1.5-pro',
            temperature: 0.3,
            timestamp: new Date().toISOString(),
            promptTokens: Math.ceil(prompt.length / 4),
            completionTokens: Math.ceil(responseText.length / 4),
            responseId: generateUniqueId('aicompl_'),
        };
        try {
            const checks: ComplianceCheckResult[] = JSON.parse(responseText).map((check: any) => ({
                ...check,
                checkedDate: new Date().toISOString(),
                automated: true,
            }));
            // Basic validation
            if (!Array.isArray(checks) || !checks.every(c => c.ruleId && c.status)) {
                throw new Error("Invalid compliance check response structure.");
            }
            return { checks, aiMetadata };
        } catch (e) {
            console.warn("AI compliance check returned non-JSON or invalid structure, returning defaults.", e);
            return {
                checks: rules.map(r => ({
                    ruleId: r.id, ruleName: r.name, status: 'Warning', details: 'AI check failed or returned invalid data. Manual review required.',
                    checkedDate: new Date().toISOString(), severity: r.severity, automated: true,
                })),
                aiMetadata
            };
        }
    }

    /**
     * Translates disclosure content to a target language.
     */
    public async translateDisclosure(text: string, targetLanguage: string): Promise<{ result: TranslationResult; aiMetadata: AIMetadata }> {
        const prompt = `Translate the following text into ${targetLanguage}. Provide the original text, translated text, target language, and source language in a JSON object.
        Text: "${text}"`;
        const startTime = Date.now();
        const responseText = await this.generateContent(prompt, 'gemini-1.5-flash');
        const endTime = Date.now();
        const aiMetadata: AIMetadata = {
            model: 'gemini-1.5-flash',
            temperature: 0.5,
            timestamp: new Date().toISOString(),
            promptTokens: Math.ceil(prompt.length / 4),
            completionTokens: Math.ceil(responseText.length / 4),
            responseId: generateUniqueId('aitrans_'),
        };
        try {
            const result: TranslationResult = JSON.parse(responseText);
            if (!result.translatedText || !result.targetLanguage) {
                throw new Error("Invalid translation response structure.");
            }
            return { result, aiMetadata };
        } catch (e) {
            console.warn("AI translation failed or returned invalid structure, returning original text.", e);
            return {
                result: {
                    originalText: text,
                    translatedText: `[Translation to ${targetLanguage} failed or incomplete: ${text}]`,
                    targetLanguage: targetLanguage,
                    sourceLanguage: 'en', // Assuming source is English by default
                    aiMetadata: aiMetadata
                },
                aiMetadata
            };
        }
    }

    /**
     * Summarizes a long regulatory document or text.
     */
    public async summarizeDocument(documentContent: string, length: 'short' | 'medium' | 'long' = 'medium'): Promise<{ summary: string; aiMetadata: AIMetadata }> {
        const prompt = `Summarize the following document content. The summary should be ${length}.
        Document Content: "${documentContent}"`;
        const startTime = Date.now();
        const responseText = await this.generateContent(prompt, 'gemini-1.5-pro');
        const endTime = Date.now();
        const aiMetadata: AIMetadata = {
            model: 'gemini-1.5-pro',
            temperature: 0.4,
            timestamp: new Date().toISOString(),
            promptTokens: Math.ceil(prompt.length / 4),
            completionTokens: Math.ceil(responseText.length / 4),
            responseId: generateUniqueId('aisum_'),
        };
        return { summary: responseText, aiMetadata };
    }
}

// --- Custom Hooks (to manage complex state and logic) ---
export const useDisclosureManagement = (initialDisclosures: RegulatoryDisclosure[], initialUsers: UserProfile[]) => {
    const [disclosures, setDisclosures] = useState<RegulatoryDisclosure[]>(initialDisclosures);
    const [selectedDisclosure, setSelectedDisclosure] = useState<RegulatoryDisclosure | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [filterType, setFilterType] = useState<string>('All');
    const [currentPage, setCurrentPage] = useState(1);
    const disclosuresPerPage = 10;

    const allUsers = initialUsers; // Assuming users are static or fetched elsewhere

    const filteredDisclosures = useMemo(() => {
        let filtered = disclosures;
        if (searchTerm) {
            filtered = filtered.filter(d =>
                d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        if (filterStatus !== 'All') {
            filtered = filtered.filter(d => d.status === filterStatus);
        }
        if (filterType !== 'All') {
            filtered = filtered.filter(d => d.type === filterType);
        }
        return filtered;
    }, [disclosures, searchTerm, filterStatus, filterType]);

    const paginatedDisclosures = useMemo(() => {
        const startIndex = (currentPage - 1) * disclosuresPerPage;
        return filteredDisclosures.slice(startIndex, startIndex + disclosuresPerPage);
    }, [filteredDisclosures, currentPage, disclosuresPerPage]);

    const totalPages = useMemo(() => Math.ceil(filteredDisclosures.length / disclosuresPerPage), [filteredDisclosures, disclosuresPerPage]);

    const addDisclosure = useCallback((newDisclosure: RegulatoryDisclosure) => {
        setDisclosures(prev => [...prev, newDisclosure]);
        setSelectedDisclosure(newDisclosure);
        setIsAdding(false);
    }, []);

    const updateDisclosure = useCallback((updatedDisclosure: RegulatoryDisclosure) => {
        setDisclosures(prev => prev.map(d => d.id === updatedDisclosure.id ? updatedDisclosure : d));
        setSelectedDisclosure(updatedDisclosure);
        setIsEditing(false);
    }, []);

    const deleteDisclosure = useCallback((id: string) => {
        setDisclosures(prev => prev.filter(d => d.id !== id));
        setSelectedDisclosure(null);
    }, []);

    const getDisclosureById = useCallback((id: string) => {
        return disclosures.find(d => d.id === id);
    }, [disclosures]);

    return {
        disclosures,
        filteredDisclosures,
        paginatedDisclosures,
        selectedDisclosure,
        setSelectedDisclosure,
        isEditing,
        setIsEditing,
        isAdding,
        setIsAdding,
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        filterType,
        setFilterType,
        currentPage,
        setCurrentPage,
        totalPages,
        addDisclosure,
        updateDisclosure,
        deleteDisclosure,
        getDisclosureById,
        allUsers,
    };
};

export const useAuditLog = (initialLogs: AuditLogEntry[]) => {
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialLogs);

    const addLogEntry = useCallback((entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
        const newLog: AuditLogEntry = {
            id: generateUniqueId('log_'),
            timestamp: new Date().toISOString(),
            ...entry,
        };
        setAuditLogs(prev => [newLog, ...prev]);
    }, []);

    return { auditLogs, addLogEntry };
};

// --- Generic UI Components (many more would exist in a component library) ---

// Reusable Modal Component
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; className?: string }> = ({ isOpen, onClose, title, children, className }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className={classNames("bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col", className)} onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const InputField: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; type?: string; placeholder?: string; required?: boolean; rows?: number }> = ({ label, id, value, onChange, type = 'text', placeholder, required = false, rows = 3 }) => (
    <div className="flex flex-col">
        <label htmlFor={id} className="text-sm font-medium text-gray-300 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
        {type === 'textarea' ? (
            <textarea
                id={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                rows={rows}
                className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
            />
        ) : (
            <input
                type={type}
                id={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
            />
        )}
    </div>
);

export const SelectField: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: { value: string; label: string }[]; required?: boolean }> = ({ label, id, value, onChange, options, required = false }) => (
    <div className="flex flex-col">
        <label htmlFor={id} className="text-sm font-medium text-gray-300 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
        <select
            id={id}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    </div>
);

export const CheckboxField: React.FC<{ label: string; id: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, id, checked, onChange }) => (
    <div className="flex items-center space-x-2">
        <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 text-cyan-600 rounded border-gray-600 bg-gray-700/50 focus:ring-cyan-500"
        />
        <label htmlFor={id} className="text-sm text-gray-300">{label}</label>
    </div>
);

export const Button: React.FC<{ onClick: () => void; children: React.ReactNode; primary?: boolean; disabled?: boolean; className?: string }> = ({ onClick, children, primary = true, disabled = false, className }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={classNames(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
            primary ? "bg-cyan-600 hover:bg-cyan-700 text-white" : "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600",
            disabled ? "opacity-50 cursor-not-allowed" : "",
            className
        )}
    >
        {children}
    </button>
);

export const Tabs: React.FC<{ tabs: { id: string; label: string; content: React.ReactNode }[]; activeTab: string; onChange: (tabId: string) => void }> = ({ tabs, activeTab, onChange }) => (
    <div>
        <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={classNames(
                            activeTab === tab.id
                                ? 'border-cyan-500 text-cyan-400'
                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300',
                            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200'
                        )}
                        aria-current={activeTab === tab.id ? 'page' : undefined}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
        <div className="pt-4">
            {tabs.find(tab => tab.id === activeTab)?.content}
        </div>
    </div>
);

// --- Disclosure Sub-Components ---

export const DisclosureForm: React.FC<{
    disclosure: RegulatoryDisclosure;
    onChange: (field: keyof RegulatoryDisclosure, value: any) => void;
    onSave: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    isNew?: boolean;
    users: UserProfile[];
    risks: Risk[];
    auditLoggers: {
        addLogEntry: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
    };
}> = ({ disclosure, onChange, onSave, onCancel, isLoading = false, isNew = false, users, risks, auditLoggers }) => {
    const { addLogEntry } = auditLoggers;

    const handleSave = () => {
        onSave();
        addLogEntry({
            userId: 'usr_001', // Mock current user
            userName: 'Alice Smith',
            action: isNew ? 'CREATED' : 'UPDATED',
            entityType: 'Disclosure',
            entityId: disclosure.id,
            details: isNew ? `Created new disclosure: ${disclosure.title}` : `Updated disclosure: ${disclosure.title}`,
            newValue: disclosure
        });
    };

    const statusOptions = ['Draft', 'Pending Review', 'Approved', 'Filed', 'Rejected'].map(s => ({ value: s, label: s }));
    const typeOptions = ['Financial', 'Environmental', 'Data Breach', 'Governance', 'Product Safety', 'Other'].map(t => ({ value: t, label: t }));
    const audienceOptions = ['Public', 'Regulators', 'Internal'].map(a => ({ value: a, label: a }));
    const legalReviewOptions = ['Not Started', 'In Progress', 'Approved', 'Revisions Required'].map(s => ({ value: s, label: s }));
    const languageOptions = [{ value: 'en', label: 'English' }, { value: 'es', label: 'Spanish' }, { value: 'fr', label: 'French' }];

    const selectedRiskIds = disclosure.associatedRisks || [];
    const handleRiskChange = (riskId: string, isChecked: boolean) => {
        let newRisks = new Set(selectedRiskIds);
        if (isChecked) {
            newRisks.add(riskId);
        } else {
            newRisks.delete(riskId);
        }
        onChange('associatedRisks', Array.from(newRisks));
    };

    return (
        <div className="space-y-4">
            <InputField label="Title" id="title" value={disclosure.title} onChange={e => onChange('title', e.target.value)} required />
            <InputField label="Jurisdiction" id="jurisdiction" value={disclosure.jurisdiction} onChange={e => onChange('jurisdiction', e.target.value)} required />
            <InputField label="Filing Date" id="filingDate" type="date" value={disclosure.filingDate ? disclosure.filingDate.split('T')[0] : ''} onChange={e => onChange('filingDate', e.target.value)} />
            <SelectField label="Status" id="status" value={disclosure.status} onChange={e => onChange('status', e.target.value)} options={statusOptions} />
            <SelectField label="Type" id="type" value={disclosure.type} onChange={e => onChange('type', e.target.value)} options={typeOptions} />
            <SelectField label="Audience" id="audience" value={disclosure.audience} onChange={e => onChange('audience', e.target.value)} options={audienceOptions} />
            <SelectField label="Legal Review Status" id="legalReviewStatus" value={disclosure.legalReviewStatus || 'Not Started'} onChange={e => onChange('legalReviewStatus', e.target.value)} options={legalReviewOptions} />
            <SelectField label="Language" id="language" value={disclosure.language} onChange={e => onChange('language', e.target.value)} options={languageOptions} />
            <InputField label="Summary" id="summary" type="textarea" value={disclosure.summary} onChange={e => onChange('summary', e.target.value)} rows={4} />
            <InputField label="Full Content" id="fullContent" type="textarea" value={disclosure.fullContent} onChange={e => onChange('fullContent', e.target.value)} rows={10} required />
            <InputField label="Tags (comma-separated)" id="tags" value={disclosure.tags.join(', ')} onChange={e => onChange('tags', e.target.value.split(',').map(tag => tag.trim()))} placeholder="e.g., Financial, ESG, Data Breach" />
            <CheckboxField label="Confidential" id="isConfidential" checked={disclosure.isConfidential} onChange={e => onChange('isConfidential', e.target.checked)} />

            <div>
                <h4 className="text-md font-semibold text-gray-300 mb-2">Associated Risks</h4>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                    {risks.map(risk => (
                        <CheckboxField
                            key={risk.id}
                            id={`risk-${risk.id}`}
                            label={risk.name}
                            checked={selectedRiskIds.includes(risk.id)}
                            onChange={(e) => handleRiskChange(risk.id, e.target.checked)}
                        />
                    ))}
                </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
                <Button onClick={onCancel} primary={false}>Cancel</Button>
                <Button onClick={handleSave} disabled={isLoading || !disclosure.title || !disclosure.fullContent}>
                    {isLoading ? (isNew ? 'Adding...' : 'Saving...') : (isNew ? 'Add Disclosure' : 'Save Changes')}
                </Button>
            </div>
        </div>
    );
};


export const DisclosureDetails: React.FC<{
    disclosure: RegulatoryDisclosure;
    onEdit: () => void;
    onDelete: (id: string) => void;
    onUpdateStatus: (id: string, newStatus: RegulatoryDisclosure['status']) => void;
    aiService: AIComplianceService;
    onUpdateDisclosure: (updatedDisc: RegulatoryDisclosure) => void;
    complianceRules: ComplianceRule[];
    auditLoggers: {
        addLogEntry: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
    };
}> = ({ disclosure, onEdit, onDelete, onUpdateStatus, aiService, onUpdateDisclosure, complianceRules, auditLoggers }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [isTranslating, setIsTranslating] = useState(false);
    const [translatedContent, setTranslatedContent] = useState('');
    const [targetLanguage, setTargetLanguage] = useState('es');
    const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);
    const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState(false);
    const { addLogEntry } = auditLoggers;

    const handleUpdateStatus = (newStatus: RegulatoryDisclosure['status']) => {
        onUpdateStatus(disclosure.id, newStatus);
        addLogEntry({
            userId: 'usr_001',
            userName: 'Alice Smith',
            action: 'STATUS_UPDATE',
            entityType: 'Disclosure',
            entityId: disclosure.id,
            details: `Updated status of disclosure '${disclosure.title}' to ${newStatus}`,
            previousValue: disclosure.status,
            newValue: newStatus
        });
    };

    const handleTranslate = async () => {
        setIsTranslating(true);
        setTranslatedContent('');
        try {
            const { result, aiMetadata } = await aiService.translateDisclosure(disclosure.fullContent, targetLanguage);
            setTranslatedContent(result.translatedText);
            addLogEntry({
                userId: 'usr_001',
                userName: 'Alice Smith',
                action: 'AI_TRANSLATION',
                entityType: 'Disclosure',
                entityId: disclosure.id,
                details: `Translated disclosure '${disclosure.title}' to ${targetLanguage} using AI.`,
                newValue: { translatedText: result.translatedText, aiMetadata }
            });
        } catch (error) {
            console.error("Translation failed:", error);
            setTranslatedContent("Translation failed. Please try again.");
        } finally {
            setIsTranslating(false);
        }
    };

    const handlePerformComplianceCheck = async () => {
        setIsCheckingCompliance(true);
        try {
            const rulesToCheck = complianceRules.filter(rule => disclosure.tags.some(tag => rule.categories.includes(tag)));
            if (rulesToCheck.length === 0) {
                alert('No relevant compliance rules found for this disclosure based on its tags.');
                return;
            }
            const { checks, aiMetadata } = await aiService.performComplianceCheck(disclosure.fullContent, rulesToCheck);
            const updatedDisclosure = { ...disclosure, complianceChecks: checks };
            onUpdateDisclosure(updatedDisclosure);
            addLogEntry({
                userId: 'usr_001',
                userName: 'Alice Smith',
                action: 'AI_COMPLIANCE_CHECK',
                entityType: 'Disclosure',
                entityId: disclosure.id,
                details: `Performed AI compliance check on disclosure '${disclosure.title}'.`,
                newValue: { complianceChecks: checks, aiMetadata }
            });
        } catch (error) {
            console.error("Compliance check failed:", error);
            alert("Failed to perform compliance check. See console for details.");
        } finally {
            setIsCheckingCompliance(false);
        }
    };

    const handleAnalyzeSentiment = async () => {
        setIsAnalyzingSentiment(true);
        try {
            const { result, aiMetadata } = await aiService.analyzeSentiment(disclosure.fullContent);
            const updatedDisclosure = { ...disclosure, sentimentAnalysis: result };
            onUpdateDisclosure(updatedDisclosure);
            addLogEntry({
                userId: 'usr_001',
                userName: 'Alice Smith',
                action: 'AI_SENTIMENT_ANALYSIS',
                entityType: 'Disclosure',
                entityId: disclosure.id,
                details: `Performed AI sentiment analysis on disclosure '${disclosure.title}'.`,
                newValue: { sentimentAnalysis: result, aiMetadata }
            });
        } catch (error) {
            console.error("Sentiment analysis failed:", error);
            alert("Failed to perform sentiment analysis. See console for details.");
        } finally {
            setIsAnalyzingSentiment(false);
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', content: (
            <div className="space-y-3 text-gray-300 text-sm">
                <p><strong>Type:</strong> {disclosure.type}</p>
                <p><strong>Jurisdiction:</strong> {disclosure.jurisdiction}</p>
                <p><strong>Filing Date:</strong> {formatDate(disclosure.filingDate)}</p>
                <p><strong>Status:</strong> <span className={getStatusColorClass(disclosure.status)}>{disclosure.status}</span></p>
                <p><strong>Audience:</strong> {disclosure.audience}</p>
                <p><strong>Language:</strong> {disclosure.language}</p>
                <p><strong>Confidential:</strong> {disclosure.isConfidential ? 'Yes' : 'No'}</p>
                <p><strong>Last Edited By:</strong> {disclosure.lastEditedBy} on {formatDateTime(disclosure.lastEditedDate)} (v{disclosure.version})</p>
                <p><strong>Tags:</strong> {disclosure.tags.join(', ')}</p>
                <div className="mt-4 p-3 bg-gray-700/50 rounded-md">
                    <h4 className="font-semibold text-white mb-2">Summary</h4>
                    <p>{disclosure.summary}</p>
                </div>
                <div className="mt-4 p-3 bg-gray-700/50 rounded-md">
                    <h4 className="font-semibold text-white mb-2">Full Content</h4>
                    <pre className="whitespace-pre-wrap font-sans text-gray-200">{disclosure.fullContent}</pre>
                </div>
            </div>
        )},
        { id: 'compliance', label: 'Compliance Checks', content: (
            <div className="space-y-4">
                <Button onClick={handlePerformComplianceCheck} disabled={isCheckingCompliance}>
                    {isCheckingCompliance ? 'Checking...' : 'Run AI Compliance Check'}
                </Button>
                {disclosure.complianceChecks && disclosure.complianceChecks.length > 0 ? (
                    <div className="space-y-2">
                        {disclosure.complianceChecks.map((check, idx) => (
                            <div key={idx} className="p-3 bg-gray-700/50 rounded-md">
                                <p className="text-white text-md font-semibold">{check.ruleName} (<span className={getStatusColorClass(check.status)}>{check.status}</span>)</p>
                                <p className="text-gray-400 text-sm">Severity: {check.severity} | Checked: {formatDateTime(check.checkedDate)}</p>
                                <p className="text-gray-300 text-sm mt-1">{check.details}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">No compliance checks performed yet.</p>
                )}
            </div>
        )},
        { id: 'sentiment', label: 'Sentiment Analysis', content: (
            <div className="space-y-4">
                <Button onClick={handleAnalyzeSentiment} disabled={isAnalyzingSentiment}>
                    {isAnalyzingSentiment ? 'Analyzing...' : 'Run AI Sentiment Analysis'}
                </Button>
                {disclosure.sentimentAnalysis ? (
                    <div className="p-3 bg-gray-700/50 rounded-md text-gray-300">
                        <p><strong>Overall Sentiment:</strong> <span className={getStatusColorClass(disclosure.sentimentAnalysis.overallSentiment === 'Positive' ? 'Approved' : disclosure.sentimentAnalysis.overallSentiment === 'Negative' ? 'Rejected' : 'Draft')}>{disclosure.sentimentAnalysis.overallSentiment}</span> (Confidence: {(disclosure.sentimentAnalysis.confidence * 100).toFixed(0)}%)</p>
                        {disclosure.sentimentAnalysis.breakdown && (
                            <div className="mt-2 text-sm">
                                <p>Positive: {disclosure.sentimentAnalysis.breakdown.positive}%</p>
                                <p>Negative: {disclosure.sentimentAnalysis.breakdown.negative}%</p>
                                <p>Neutral: {disclosure.sentimentAnalysis.breakdown.neutral}%</p>
                            </div>
                        )}
                        {disclosure.sentimentAnalysis.keywords && disclosure.sentimentAnalysis.keywords.length > 0 && (
                            <div className="mt-2">
                                <h5 className="font-semibold text-white">Keywords:</h5>
                                <ul className="list-disc list-inside text-sm">
                                    {disclosure.sentimentAnalysis.keywords.map((kw, idx) => (
                                        <li key={idx}><span className={getStatusColorClass(kw.sentiment === 'Positive' ? 'Approved' : kw.sentiment === 'Negative' ? 'Rejected' : 'Draft')}>{kw.text}</span> ({kw.sentiment})</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-400">No sentiment analysis performed yet.</p>
                )}
            </div>
        )},
        { id: 'translation', label: 'Translation', content: (
            <div className="space-y-4">
                <div className="flex items-end space-x-2">
                    <SelectField
                        label="Target Language"
                        id="targetLanguage"
                        value={targetLanguage}
                        onChange={e => setTargetLanguage(e.target.value)}
                        options={[{ value: 'es', label: 'Spanish' }, { value: 'fr', label: 'French' }, { value: 'de', label: 'German' }, { value: 'zh', label: 'Chinese' }]}
                    />
                    <Button onClick={handleTranslate} disabled={isTranslating}>
                        {isTranslating ? 'Translating...' : 'Translate Content'}
                    </Button>
                </div>
                {translatedContent && (
                    <Card title={`Translated Content (${targetLanguage})`}>
                        <div className="min-h-[10rem] max-h-60 overflow-y-auto text-sm text-gray-300 whitespace-pre-line">{translatedContent}</div>
                    </Card>
                )}
            </div>
        )},
        { id: 'reviews', label: 'Review History', content: (
            <div className="space-y-3">
                {disclosure.reviewHistory && disclosure.reviewHistory.length > 0 ? (
                    disclosure.reviewHistory.map(review => (
                        <div key={review.id} className="p-3 bg-gray-700/50 rounded-md text-gray-300">
                            <p className="font-semibold text-white">{review.reviewerName} - <span className={getStatusColorClass(review.status)}>{review.status}</span></p>
                            <p className="text-xs text-gray-400">{formatDateTime(review.reviewDate)}</p>
                            <p className="mt-1 text-sm">{review.comments}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400">No review history available.</p>
                )}
            </div>
        )},
        { id: 'documents', label: 'Documents', content: (
            <div className="space-y-3">
                {disclosure.documents && disclosure.documents.length > 0 ? (
                    <ul className="list-disc list-inside text-gray-300">
                        {disclosure.documents.map(doc => (
                            <li key={doc.id}>
                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                                    {doc.name}
                                </a> ({doc.type}) - {formatDate(doc.uploadedDate)} by {doc.uploadedBy}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400">No documents attached.</p>
                )}
                {/* Add document upload functionality here */}
            </div>
        )},
        { id: 'audit', label: 'Audit Log', content: (
            <AuditLogTable filterEntityId={disclosure.id} filterEntityType="Disclosure" />
        )},
    ];

    return (
        <Card title={disclosure.title} className="p-0">
            <div className="p-4 flex justify-between items-center border-b border-gray-700">
                <div className="flex space-x-2">
                    <Button onClick={onEdit}>Edit</Button>
                    <Button onClick={() => onDelete(disclosure.id)} primary={false} className="bg-red-700 hover:bg-red-800 border-red-700">Delete</Button>
                </div>
                <div className="flex space-x-2">
                    <SelectField
                        label=""
                        id="status-update"
                        value={disclosure.status}
                        onChange={e => handleUpdateStatus(e.target.value as RegulatoryDisclosure['status'])}
                        options={[
                            { value: 'Draft', label: 'Draft' },
                            { value: 'Pending Review', label: 'Pending Review' },
                            { value: 'Approved', label: 'Approved' },
                            { value: 'Filed', label: 'Filed' },
                            { value: 'Rejected', label: 'Rejected' },
                        ]}
                    />
                </div>
            </div>
            <div className="p-4">
                <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            </div>
        </Card>
    );
};

export const AuditLogTable: React.FC<{ filterEntityId?: string; filterEntityType?: AuditLogEntry['entityType'] }> = ({ filterEntityId, filterEntityType }) => {
    const { auditLogs } = useContext(DataContext); // Assuming DataContext also holds auditLogs now
    if (!auditLogs) return <p className="text-gray-400">Audit logs not available.</p>;

    const filteredLogs = useMemo(() => {
        let logs = auditLogs;
        if (filterEntityId) {
            logs = logs.filter(log => log.entityId === filterEntityId && log.entityType === filterEntityType);
        }
        return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [auditLogs, filterEntityId, filterEntityType]);

    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 10;
    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * logsPerPage;
        return filteredLogs.slice(startIndex, startIndex + logsPerPage);
    }, [filteredLogs, currentPage, logsPerPage]);

    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Audit Log</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Timestamp</th>
                            <th scope="col" className="px-6 py-3">User</th>
                            <th scope="col" className="px-6 py-3">Action</th>
                            <th scope="col" className="px-6 py-3">Entity Type</th>
                            <th scope="col" className="px-6 py-3">Entity ID</th>
                            <th scope="col" className="px-6 py-3">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedLogs.length > 0 ? (
                            paginatedLogs.map(log => (
                                <tr key={log.id} className="bg-gray-800/50 border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                                    <td className="px-6 py-4">{log.userName}</td>
                                    <td className="px-6 py-4"><span className={getStatusColorClass(log.action === 'DELETED' ? 'Rejected' : log.action === 'CREATED' ? 'Approved' : 'Draft')}>{capitalizeFirstLetter(log.action.replace('_', ' '))}</span></td>
                                    <td className="px-6 py-4">{log.entityType}</td>
                                    <td className="px-6 py-4">{log.entityId}</td>
                                    <td className="px-6 py-4 max-w-xs overflow-hidden text-ellipsis">{log.details}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No audit log entries found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
        </div>
    );
};

export const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void }> = ({ currentPage, totalPages, onPageChange }) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <nav className="flex items-center justify-between border-t border-gray-700 px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <Button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
                <Button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-400">
                        Page <span className="font-medium">{currentPage}</span> of{' '}
                        <span className="font-medium">{totalPages}</span>
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-700 hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Previous</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                            </svg>
                        </button>
                        {pages.map(page => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                aria-current={page === currentPage ? 'page' : undefined}
                                className={classNames(
                                    'relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20',
                                    page === currentPage
                                        ? 'z-10 bg-cyan-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600'
                                        : 'text-gray-400 ring-1 ring-inset ring-gray-700 hover:bg-gray-700 focus:outline-offset-0'
                                )}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-700 hover:bg-gray-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Next</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </nav>
                </div>
            </div>
        </nav>
    );
};

export const FilingScheduleComponent: React.FC<{
    schedules: FilingSchedule[];
    onAdd: (schedule: FilingSchedule) => void;
    onUpdate: (schedule: FilingSchedule) => void;
    onDelete: (id: string) => void;
    disclosures: RegulatoryDisclosure[];
    users: UserProfile[];
    auditLoggers: {
        addLogEntry: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
    };
}> = ({ schedules, onAdd, onUpdate, onDelete, disclosures, users, auditLoggers }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSchedule, setCurrentSchedule] = useState<FilingSchedule | null>(null);
    const { addLogEntry } = auditLoggers;

    const handleAddClick = () => {
        setCurrentSchedule({
            id: generateUniqueId('sched_'),
            disclosureId: '',
            title: '',
            deadline: '',
            jurisdiction: '',
            status: 'Upcoming',
            remindersSent: 0,
            assignedTo: users[0]?.id || '', // Default to first user
            notes: '',
        });
        setIsModalOpen(true);
    };

    const handleEditClick = (schedule: FilingSchedule) => {
        setCurrentSchedule(schedule);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (currentSchedule) {
            if (schedules.find(s => s.id === currentSchedule.id)) {
                onUpdate(currentSchedule);
                addLogEntry({
                    userId: 'usr_001',
                    userName: 'Alice Smith',
                    action: 'UPDATED',
                    entityType: 'FilingSchedule',
                    entityId: currentSchedule.id,
                    details: `Updated filing schedule: ${currentSchedule.title}`,
                    newValue: currentSchedule
                });
            } else {
                onAdd(currentSchedule);
                addLogEntry({
                    userId: 'usr_001',
                    userName: 'Alice Smith',
                    action: 'CREATED',
                    entityType: 'FilingSchedule',
                    entityId: currentSchedule.id,
                    details: `Created filing schedule: ${currentSchedule.title}`,
                    newValue: currentSchedule
                });
            }
            setIsModalOpen(false);
            setCurrentSchedule(null);
        }
    };

    const handleChange = (field: keyof FilingSchedule, value: any) => {
        setCurrentSchedule(prev => prev ? { ...prev, [field]: value } : null);
    };

    const disclosureOptions = disclosures.map(d => ({ value: d.id, label: d.title }));
    const userOptions = users.map(u => ({ value: u.id, label: u.name }));
    const statusOptions = ['Upcoming', 'Submitted', 'Overdue'].map(s => ({ value: s, label: s }));

    return (
        <Card title="Filing Schedules">
            <div className="flex justify-end mb-4">
                <Button onClick={handleAddClick}>Add New Schedule</Button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Title</th>
                            <th scope="col" className="px-6 py-3">Disclosure</th>
                            <th scope="col" className="px-6 py-3">Deadline</th>
                            <th scope="col" className="px-6 py-3">Jurisdiction</th>
                            <th scope="col" className="px-6 py-3">Assigned To</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.length > 0 ? (
                            schedules.map(schedule => (
                                <tr key={schedule.id} className="bg-gray-800/50 border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="px-6 py-4 text-white">{schedule.title}</td>
                                    <td className="px-6 py-4">{disclosures.find(d => d.id === schedule.disclosureId)?.title || 'N/A'}</td>
                                    <td className="px-6 py-4">{formatDate(schedule.deadline)}</td>
                                    <td className="px-6 py-4">{schedule.jurisdiction}</td>
                                    <td className="px-6 py-4">{users.find(u => u.id === schedule.assignedTo)?.name || 'N/A'}</td>
                                    <td className="px-6 py-4"><span className={getStatusColorClass(schedule.status)}>{schedule.status}</span></td>
                                    <td className="px-6 py-4 flex space-x-2">
                                        <Button onClick={() => handleEditClick(schedule)} primary={false} className="py-1 px-3">Edit</Button>
                                        <Button onClick={() => {
                                            onDelete(schedule.id);
                                            addLogEntry({
                                                userId: 'usr_001',
                                                userName: 'Alice Smith',
                                                action: 'DELETED',
                                                entityType: 'FilingSchedule',
                                                entityId: schedule.id,
                                                details: `Deleted filing schedule: ${schedule.title}`,
                                                previousValue: schedule
                                            });
                                        }} primary={false} className="py-1 px-3 bg-red-700 hover:bg-red-800 border-red-700">Delete</Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">No filing schedules found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentSchedule?.id ? "Edit Filing Schedule" : "Add New Filing Schedule"}>
                {currentSchedule && (
                    <div className="space-y-4">
                        <InputField label="Schedule Title" id="scheduleTitle" value={currentSchedule.title} onChange={e => handleChange('title', e.target.value)} required />
                        <SelectField label="Associated Disclosure" id="disclosureId" value={currentSchedule.disclosureId} onChange={e => handleChange('disclosureId', e.target.value)} options={disclosureOptions} required />
                        <InputField label="Deadline" id="deadline" type="date" value={currentSchedule.deadline ? currentSchedule.deadline.split('T')[0] : ''} onChange={e => handleChange('deadline', e.target.value)} required />
                        <InputField label="Jurisdiction" id="scheduleJurisdiction" value={currentSchedule.jurisdiction} onChange={e => handleChange('jurisdiction', e.target.value)} required />
                        <SelectField label="Assigned To" id="assignedTo" value={currentSchedule.assignedTo} onChange={e => handleChange('assignedTo', e.target.value)} options={userOptions} required />
                        <SelectField label="Status" id="scheduleStatus" value={currentSchedule.status} onChange={e => handleChange('status', e.target.value)} options={statusOptions} />
                        <InputField label="Notes" id="scheduleNotes" type="textarea" value={currentSchedule.notes || ''} onChange={e => handleChange('notes', e.target.value)} rows={3} />
                        <div className="flex justify-end space-x-4 mt-6">
                            <Button onClick={() => setIsModalOpen(false)} primary={false}>Cancel</Button>
                            <Button onClick={handleSave} disabled={!currentSchedule.title || !currentSchedule.disclosureId || !currentSchedule.deadline}>Save Schedule</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </Card>
    );
};

export const RegulatoryFeedComponent: React.FC<{
    regulatoryUpdates: ComplianceRule[];
    aiService: AIComplianceService;
    auditLoggers: {
        addLogEntry: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
    };
}> = ({ regulatoryUpdates, aiService, auditLoggers }) => {
    const [activeRule, setActiveRule] = useState<ComplianceRule | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summary, setSummary] = useState('');
    const { addLogEntry } = auditLoggers;

    const handleSummarize = async (rule: ComplianceRule) => {
        setIsSummarizing(true);
        setSummary('');
        try {
            const { summary: aiSummary, aiMetadata } = await aiService.summarizeDocument(rule.ruleText, 'medium');
            setSummary(aiSummary);
            addLogEntry({
                userId: 'usr_001',
                userName: 'Alice Smith',
                action: 'AI_SUMMARY',
                entityType: 'ComplianceRule',
                entityId: rule.id,
                details: `Summarized regulatory rule: ${rule.name}`,
                newValue: { summary: aiSummary, aiMetadata }
            });
        } catch (error) {
            console.error("Failed to summarize rule:", error);
            setSummary("Failed to generate summary.");
        } finally {
            setIsSummarizing(false);
        }
    };

    return (
        <Card title="Regulatory Updates & Feed">
            <div className="space-y-4">
                <p className="text-gray-400 text-sm">Monitor recent changes and new regulations.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        {regulatoryUpdates.map(rule => (
                            <div key={rule.id} className="p-3 bg-gray-700/50 rounded-md cursor-pointer hover:bg-gray-600/50" onClick={() => setActiveRule(rule)}>
                                <h4 className="font-semibold text-white">{rule.name} - {rule.jurisdiction}</h4>
                                <p className="text-sm text-gray-400">Effective: {formatDate(rule.effectiveDate)} | Severity: {rule.severity}</p>
                                <p className="text-xs text-gray-500">Categories: {rule.categories.join(', ')}</p>
                            </div>
                        ))}
                    </div>
                    {activeRule && (
                        <div className="p-4 bg-gray-700 rounded-md shadow-lg space-y-3">
                            <h3 className="text-lg font-bold text-white">{activeRule.name}</h3>
                            <p className="text-gray-400 text-sm"><strong>Jurisdiction:</strong> {activeRule.jurisdiction}</p>
                            <p className="text-gray-400 text-sm"><strong>Effective Date:</strong> {formatDate(activeRule.effectiveDate)}</p>
                            <p className="text-gray-400 text-sm"><strong>Severity:</strong> <span className={getStatusColorClass(activeRule.severity === 'Critical' ? 'Rejected' : activeRule.severity === 'High' ? 'Warning' : 'Draft')}>{activeRule.severity}</span></p>
                            <p className="text-gray-400 text-sm"><strong>Categories:</strong> {activeRule.categories.join(', ')}</p>
                            <p className="text-gray-300 text-sm mt-2">{activeRule.description}</p>
                            <div className="bg-gray-800 p-3 rounded-md max-h-40 overflow-y-auto">
                                <h4 className="font-semibold text-white mb-1">Full Rule Text:</h4>
                                <pre className="whitespace-pre-wrap font-sans text-xs text-gray-200">{activeRule.ruleText}</pre>
                            </div>
                            <Button onClick={() => handleSummarize(activeRule)} disabled={isSummarizing}>
                                {isSummarizing ? 'Summarizing...' : 'AI Summarize Rule'}
                            </Button>
                            {summary && (
                                <Card title="AI Summary">
                                    <p className="text-sm text-gray-300 whitespace-pre-line">{summary}</p>
                                </Card>
                            )}
                            {activeRule.referenceUrl && (
                                <p className="text-sm text-gray-400">
                                    <a href={activeRule.referenceUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Read Full Document</a>
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export const ComplianceDashboard: React.FC<{
    disclosures: RegulatoryDisclosure[];
    complianceRules: ComplianceRule[];
}> = ({ disclosures, complianceRules }) => {
    // This would ideally fetch structured data for charts.
    // For now, we'll simulate some aggregate stats.

    const complianceSummary = useMemo(() => {
        const statusCounts = { Pass: 0, Fail: 0, Warning: 0, 'Not Applicable': 0, 'Not Checked': 0 };
        const ruleStatus: { [ruleId: string]: { passes: number; fails: number; warnings: number; total: number; ruleName: string } } = {};

        disclosures.forEach(d => {
            if (d.complianceChecks && d.complianceChecks.length > 0) {
                d.complianceChecks.forEach(check => {
                    statusCounts[check.status]++;
                    if (!ruleStatus[check.ruleId]) {
                        ruleStatus[check.ruleId] = { passes: 0, fails: 0, warnings: 0, total: 0, ruleName: check.ruleName };
                    }
                    ruleStatus[check.ruleId].total++;
                    if (check.status === 'Pass') ruleStatus[check.ruleId].passes++;
                    else if (check.status === 'Fail') ruleStatus[check.ruleId].fails++;
                    else if (check.status === 'Warning') ruleStatus[check.ruleId].warnings++;
                });
            } else {
                statusCounts['Not Checked']++;
            }
        });

        const disclosuresByStatus = disclosures.reduce((acc, d) => {
            acc[d.status] = (acc[d.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const rulesAtRisk = Object.values(ruleStatus).filter(r => r.fails > 0 || r.warnings > 0);

        return { statusCounts, disclosuresByStatus, rulesAtRisk };
    }, [disclosures]);

    return (
        <Card title="Compliance Overview Dashboard">
            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Overall Compliance Check Status</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {Object.entries(complianceSummary.statusCounts).map(([status, count]) => (
                            <div key={status} className="p-4 bg-gray-700/50 rounded-lg text-center">
                                <p className="text-xs text-gray-400">{status}</p>
                                <p className={classNames("text-2xl font-bold mt-1", getStatusColorClass(status))}>{count}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Disclosures by Status</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {Object.entries(complianceSummary.disclosuresByStatus).map(([status, count]) => (
                            <div key={status} className="p-4 bg-gray-700/50 rounded-lg text-center">
                                <p className="text-xs text-gray-400">{status}</p>
                                <p className={classNames("text-2xl font-bold mt-1", getStatusColorClass(status))}>{count}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {complianceSummary.rulesAtRisk.length > 0 && (
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-3">Compliance Rules with Issues</h3>
                        <div className="space-y-3">
                            {complianceSummary.rulesAtRisk.map(rule => (
                                <div key={rule.ruleName} className="p-3 bg-gray-700/50 rounded-md">
                                    <p className="font-semibold text-white">{rule.ruleName}</p>
                                    <p className="text-sm text-gray-400">
                                        Fails: <span className="text-red-400">{rule.fails}</span> | Warnings: <span className="text-yellow-400">{rule.warnings}</span> (out of {rule.total} checks)
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {complianceSummary.rulesAtRisk.length === 0 && (
                    <p className="text-gray-400">All compliance checks are currently passing.</p>
                )}
            </div>
        </Card>
    );
};


// --- Main DisclosuresView Component ---
const DisclosuresView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("DisclosuresView must be within DataProvider");

    const { disclosures: initialDisclosuresData, auditLogs: initialAuditLogsData } = context;

    // Use a ref for the AI service to prevent re-instantiation on every render
    const aiServiceRef = useRef<AIComplianceService | null>(null);
    useEffect(() => {
        if (!aiServiceRef.current && process.env.NEXT_PUBLIC_API_KEY) { // Use NEXT_PUBLIC for client-side API keys
            aiServiceRef.current = new AIComplianceService(process.env.NEXT_PUBLIC_API_KEY);
        }
    }, []);

    const aiService = aiServiceRef.current;
    if (!aiService) {
        // Fallback or error state if AI service cannot be initialized
        console.error("AI Compliance Service could not be initialized. Check API Key.");
        // This is a placeholder for a more robust error handling in a real app
        // We can render a disabled AI drafter or a warning.
    }


    const {
        disclosures,
        filteredDisclosures,
        paginatedDisclosures,
        selectedDisclosure,
        setSelectedDisclosure,
        isEditing,
        setIsEditing,
        isAdding,
        setIsAdding,
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        filterType,
        setFilterType,
        currentPage,
        setCurrentPage,
        totalPages,
        addDisclosure,
        updateDisclosure,
        deleteDisclosure,
        allUsers,
    } = useDisclosureManagement(initialDisclosuresData, MOCK_USERS); // Using mock users for now

    const { auditLogs, addLogEntry } = useAuditLog(initialAuditLogsData || []); // Assuming initialAuditLogsData from context

    const auditLoggers = useMemo(() => ({ addLogEntry }), [addLogEntry]);

    const [isDrafterOpen, setDrafterOpen] = useState(false);
    const [prompt, setPrompt] = useState("A minor data breach affecting 500 users, no PII exposed. Ensure GDPR compliance considerations are met and advise on necessary internal actions.");
    const [drafterTone, setDrafterTone] = useState<string>('Professional');
    const [drafterAudience, setDrafterAudience] = useState<string>('Regulators');
    const [drafterGuidelines, setDrafterGuidelines] = useState<string>('Mention incident response process.');
    const [draft, setDraft] = useState('');
    const [isLoadingAI, setIsLoadingAI] = useState(false);

    const [filingSchedules, setFilingSchedules] = useState<FilingSchedule[]>([]); // New state for schedules

    // Load mock data for risks and compliance rules
    const [risks, setRisks] = useState<Risk[]>(MOCK_RISKS);
    const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>(MOCK_COMPLIANCE_RULES);

    const handleDraft = async () => {
        if (!aiService) {
            alert("AI service not available. Please check API key configuration.");
            return;
        }
        setIsLoadingAI(true);
        setDraft('');
        try {
            const { draft: generatedDraft, aiMetadata } = await aiService.draftDisclosure(prompt, drafterTone, drafterAudience, drafterGuidelines);
            setDraft(generatedDraft);
            addLogEntry({
                userId: 'usr_001',
                userName: 'Alice Smith',
                action: 'AI_DRAFTED',
                entityType: 'Disclosure',
                entityId: 'N/A', // No specific disclosure yet
                details: `AI drafted a disclosure for prompt: "${prompt.substring(0, 50)}..."`,
                newValue: { prompt, drafterTone, drafterAudience, drafterGuidelines, generatedDraft, aiMetadata }
            });
        } catch (err) {
            console.error("AI drafting error:", err);
            setDraft(`Error drafting disclosure: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
            setIsLoadingAI(false);
        }
    };

    const handleAddNewDisclosure = () => {
        const newId = generateUniqueId('disc_');
        const defaultDisclosure: RegulatoryDisclosure = {
            id: newId,
            title: `New Disclosure ${formatDate(new Date().toISOString())}`,
            jurisdiction: '',
            filingDate: new Date().toISOString(),
            status: 'Draft',
            type: 'Other',
            summary: '',
            fullContent: draft || '', // Pre-fill with AI draft if available
            lastEditedBy: 'CurrentUser', // Replace with actual user
            lastEditedDate: new Date().toISOString(),
            version: 1,
            associatedRisks: [],
            documents: [],
            reviewHistory: [],
            complianceChecks: [],
            tags: [],
            audience: 'Public',
            isConfidential: false,
            language: 'en',
        };
        setSelectedDisclosure(defaultDisclosure);
        setIsAdding(true);
        setIsDrafterOpen(false); // Close drafter if creating from draft
        setDraft(''); // Clear draft after use
    };

    const handleSaveNewDisclosure = () => {
        if (selectedDisclosure) {
            addDisclosure(selectedDisclosure);
            setSelectedDisclosure(null);
            setIsAdding(false);
        }
    };

    const handleSaveUpdatedDisclosure = () => {
        if (selectedDisclosure) {
            updateDisclosure({
                ...selectedDisclosure,
                lastEditedBy: 'CurrentUser', // Replace with actual user
                lastEditedDate: new Date().toISOString(),
                version: selectedDisclosure.version + 1,
            });
            setSelectedDisclosure(null);
            setIsEditing(false);
        }
    };

    const handleCancelEditOrAdd = () => {
        setSelectedDisclosure(null);
        setIsEditing(false);
        setIsAdding(false);
    };

    // Filing schedule handlers
    const addFilingSchedule = useCallback((newSchedule: FilingSchedule) => {
        setFilingSchedules(prev => [...prev, newSchedule]);
    }, []);

    const updateFilingSchedule = useCallback((updatedSchedule: FilingSchedule) => {
        setFilingSchedules(prev => prev.map(s => s.id === updatedSchedule.id ? updatedSchedule : s));
    }, []);

    const deleteFilingSchedule = useCallback((id: string) => {
        setFilingSchedules(prev => prev.filter(s => s.id !== id));
    }, []);

    const disclosureStatusOptions = useMemo(() => [
        { value: 'All', label: 'All Statuses' },
        ...Array.from(new Set(disclosures.map(d => d.status))).map(s => ({ value: s, label: s }))
    ], [disclosures]);

    const disclosureTypeOptions = useMemo(() => [
        { value: 'All', label: 'All Types' },
        ...Array.from(new Set(disclosures.map(d => d.type))).map(s => ({ value: s, label: s }))
    ], [disclosures]);

    const mainTabs = useMemo(() => [
        { id: 'disclosures', label: 'All Disclosures', content: (
            <>
            <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                    <InputField
                        label="Search"
                        id="disclosureSearch"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search disclosures..."
                        className="!p-2"
                    />
                    <SelectField
                        label="Status"
                        id="filterStatus"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        options={disclosureStatusOptions}
                    />
                    <SelectField
                        label="Type"
                        id="filterType"
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        options={disclosureTypeOptions}
                    />
                </div>
                <Button onClick={() => {
                    const newId = generateUniqueId('disc_');
                    setSelectedDisclosure({
                        id: newId,
                        title: `New Disclosure ${formatDate(new Date().toISOString())}`,
                        jurisdiction: '',
                        filingDate: new Date().toISOString(),
                        status: 'Draft',
                        type: 'Other',
                        summary: '',
                        fullContent: '',
                        lastEditedBy: 'CurrentUser',
                        lastEditedDate: new Date().toISOString(),
                        version: 1,
                        associatedRisks: [],
                        documents: [],
                        reviewHistory: [],
                        complianceChecks: [],
                        tags: [],
                        audience: 'Public',
                        isConfidential: false,
                        language: 'en',
                    });
                    setIsAdding(true);
                }}>Add New Disclosure</Button>
            </div>
            <Card title="Regulatory Filings">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th className="px-6 py-3">Title</th>
                            <th className="px-6 py-3">Jurisdiction</th>
                            <th className="px-6 py-3">Filing Date</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedDisclosures.length > 0 ? (
                            paginatedDisclosures.map(d => (
                                <tr key={d.id} className="bg-gray-800/50 border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="px-6 py-4 text-white hover:text-cyan-400 cursor-pointer" onClick={() => setSelectedDisclosure(d)}>{d.title}</td>
                                    <td className="px-6 py-4">{d.jurisdiction}</td>
                                    <td className="px-6 py-4">{formatDate(d.filingDate)}</td>
                                    <td className="px-6 py-4"><span className={getStatusColorClass(d.status)}>{d.status}</span></td>
                                    <td className="px-6 py-4">{d.type}</td>
                                    <td className="px-6 py-4">
                                        <Button onClick={() => setSelectedDisclosure(d)} primary={false} className="py-1 px-3 mr-2">View</Button>
                                        <Button onClick={() => { setSelectedDisclosure(d); setIsEditing(true); }} primary={false} className="py-1 px-3">Edit</Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No disclosures found.</td></tr>
                        )}
                    </tbody>
                </table>
                {totalPages > 1 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                )}
            </Card>
            </>
        )},
        { id: 'filing_schedules', label: 'Filing Schedules', content: (
            <FilingScheduleComponent
                schedules={filingSchedules}
                onAdd={addFilingSchedule}
                onUpdate={updateFilingSchedule}
                onDelete={deleteFilingSchedule}
                disclosures={disclosures}
                users={allUsers}
                auditLoggers={auditLoggers}
            />
        )},
        { id: 'compliance_dashboard', label: 'Compliance Dashboard', content: (
            <ComplianceDashboard disclosures={disclosures} complianceRules={complianceRules} />
        )},
        { id: 'regulatory_feed', label: 'Regulatory Feed', content: (
            <RegulatoryFeedComponent regulatoryUpdates={complianceRules} aiService={aiService as AIComplianceService} auditLoggers={auditLoggers} />
        )},
        { id: 'full_audit_log', label: 'Full Audit Log', content: <AuditLogTable /> },
    ], [
        searchTerm, setSearchTerm, filterStatus, setFilterStatus, filterType, setFilterType,
        disclosureStatusOptions, disclosureTypeOptions, paginatedDisclosures, totalPages, currentPage, setCurrentPage,
        setSelectedDisclosure, setIsEditing, disclosures, allUsers, filingSchedules, addFilingSchedule, updateFilingSchedule, deleteFilingSchedule,
        complianceRules, aiService, auditLoggers, addDisclosure, setIsAdding
    ]);

    const [activeMainTab, setActiveMainTab] = useState('disclosures');

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Disclosures & Compliance</h2>
                    <button onClick={() => setDrafterOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Disclosure Drafter</button>
                </div>

                <Tabs tabs={mainTabs} activeTab={activeMainTab} onChange={setActiveMainTab} />
            </div>

            {/* AI Disclosure Drafter Modal */}
            <Modal isOpen={isDrafterOpen} onClose={() => setDrafterOpen(false)} title="AI Disclosure Drafter" className="max-w-4xl">
                <div className="p-6 space-y-4">
                    <InputField
                        label="Event Description / Core Information"
                        id="prompt"
                        type="textarea"
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="e.g., A minor data breach affecting 500 users, no PII exposed."
                        rows={5}
                        required
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectField
                            label="Tone"
                            id="drafterTone"
                            value={drafterTone}
                            onChange={e => setDrafterTone(e.target.value)}
                            options={[
                                { value: 'Professional', label: 'Professional' },
                                { value: 'Urgent', label: 'Urgent' },
                                { value: 'Sympathetic', label: 'Sympathetic' },
                                { value: 'Formal', label: 'Formal' },
                                { value: 'Concise', label: 'Concise' },
                            ]}
                        />
                        <SelectField
                            label="Target Audience"
                            id="drafterAudience"
                            value={drafterAudience}
                            onChange={e => setDrafterAudience(e.target.value)}
                            options={[
                                { value: 'General Public', label: 'General Public' },
                                { value: 'Regulators', label: 'Regulators' },
                                { value: 'Investors', label: 'Investors' },
                                { value: 'Internal Stakeholders', label: 'Internal Stakeholders' },
                            ]}
                        />
                    </div>
                    <InputField
                        label="Additional Guidelines / Legal Requirements"
                        id="drafterGuidelines"
                        type="textarea"
                        value={drafterGuidelines}
                        onChange={e => setDrafterGuidelines(e.target.value)}
                        placeholder="e.g., Highlight commitment to data security. Ensure compliance with GDPR Article 33."
                        rows={3}
                    />
                    <Button onClick={handleDraft} disabled={isLoadingAI || !prompt}>
                        {isLoadingAI ? 'Drafting...' : 'Draft Disclosure'}
                    </Button>
                    {draft && (
                        <Card title="Generated Draft">
                            <div className="min-h-[10rem] max-h-60 overflow-y-auto text-sm text-gray-300 whitespace-pre-line border border-gray-700 rounded p-3 bg-gray-900/30">{draft}</div>
                            <div className="mt-4 flex justify-end space-x-2">
                                <Button onClick={() => navigator.clipboard.writeText(draft)} primary={false}>Copy Draft</Button>
                                <Button onClick={handleAddNewDisclosure}>Use Draft for New Disclosure</Button>
                            </div>
                        </Card>
                    )}
                </div>
            </Modal>

            {/* Disclosure Details/Edit Modal */}
            {(selectedDisclosure && (isEditing || isAdding)) && (
                <Modal
                    isOpen={true} // Always open when a disclosure is selected for editing/adding
                    onClose={handleCancelEditOrAdd}
                    title={isAdding ? "Add New Regulatory Disclosure" : `Edit Disclosure: ${selectedDisclosure.title}`}
                    className="max-w-4xl"
                >
                    <DisclosureForm
                        disclosure={selectedDisclosure}
                        onChange={(field, value) => setSelectedDisclosure(prev => prev ? { ...prev, [field]: value } : null)}
                        onSave={isAdding ? handleSaveNewDisclosure : handleSaveUpdatedDisclosure}
                        onCancel={handleCancelEditOrAdd}
                        isNew={isAdding}
                        users={allUsers}
                        risks={risks}
                        auditLoggers={auditLoggers}
                    />
                </Modal>
            )}

            {/* Disclosure Details View Modal */}
            {(selectedDisclosure && !isEditing && !isAdding) && (
                <Modal
                    isOpen={true}
                    onClose={() => setSelectedDisclosure(null)}
                    title={`Disclosure Details: ${selectedDisclosure.title}`}
                    className="max-w-5xl"
                >
                    <DisclosureDetails
                        disclosure={selectedDisclosure}
                        onEdit={() => setIsEditing(true)}
                        onDelete={(id) => {
                            if (window.confirm('Are you sure you want to delete this disclosure?')) {
                                deleteDisclosure(id);
                                auditLoggers.addLogEntry({
                                    userId: 'usr_001',
                                    userName: 'Alice Smith',
                                    action: 'DELETED',
                                    entityType: 'Disclosure',
                                    entityId: id,
                                    details: `Deleted disclosure: ${selectedDisclosure.title}`,
                                    previousValue: selectedDisclosure
                                });
                            }
                        }}
                        onUpdateStatus={(id, newStatus) => {
                            const updatedDisc = { ...selectedDisclosure, status: newStatus };
                            updateDisclosure(updatedDisc);
                        }}
                        aiService={aiService as AIComplianceService} // Type assertion as it's checked above
                        onUpdateDisclosure={updateDisclosure}
                        complianceRules={complianceRules}
                        auditLoggers={auditLoggers}
                    />
                </Modal>
            )}
        </>
    );
};

export default DisclosuresView;