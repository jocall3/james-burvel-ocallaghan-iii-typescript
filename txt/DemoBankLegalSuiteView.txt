// components/views/platform/DemoBankLegalSuiteView.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";

// =================================================================================================
// TYPE DEFINITIONS FOR A REAL-WORLD LEGAL SUITE APPLICATION
// =================================================================================================

export type ContractStatus = 'Active' | 'Drafting' | 'Under Review' | 'Expired' | 'Terminated' | 'Pending Signature';
export type ContractType = 'MSA' | 'NDA' | 'SOW' | 'SaaS' | 'Vendor' | 'Lease' | 'Employment';
export type ComplianceStatus = 'Compliant' | 'At Risk' | 'Non-Compliant' | 'Pending Audit';
export type ClauseCategory = 'Liability' | 'Confidentiality' | 'Termination' | 'Indemnification' | 'Governing Law';
export type DocumentFormat = 'PDF' | 'DOCX' | 'Signed PDF';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type AiAnalysisAspect = 'Risk Assessment' | 'Key Term Extraction' | 'Obligation Summary' | 'Clause Comparison';

export interface Counterparty {
    id: string;
    name: string;
    address: string;
    contactPerson: string;
    contactEmail: string;
    riskScore: number; // 0-100
}

export interface ContractDocument {
    id: string;
    fileName: string;
    format: DocumentFormat;
    version: number;
    uploadDate: string;
    url: string; // link to cloud storage
}

export interface Contract {
    id: string;
    name: string;
    type: ContractType;
    status: ContractStatus;
    counterpartyId: string;
    startDate: string;
    endDate: string | null;
    renewalDate: string | null;
    value: number; // Annual Contract Value (ACV)
    currency: 'USD' | 'EUR' | 'GBP';
    assignedLawyerId: string;
    description: string;
    documents: ContractDocument[];
    versionHistory: string[];
    keyTerms: Record<string, string>;
}

export interface LegalTeamMember {
    id: string;
    name: string;
    role: 'General Counsel' | 'Associate Counsel' | 'Paralegal' | 'Contract Manager';
    email: string;
}

export interface ComplianceTask {
    id: string;
    name: string;
    relatedContractId: string | null;
    dueDate: string;
    status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
    ownerId: string;
    description: string;
}

export interface StandardClause {
    id: string;
    title: string;
    category: ClauseCategory;
    content: string;
    version: number;
    usageGuidelines: string;
    approvedBy: string;
}

export interface AiAnalysisRequest {
    documentText: string;
    aspects: AiAnalysisAspect[];
}

export interface AiAnalysisResult {
    summary: string;
    riskAssessment: { level: RiskLevel; details: string[] };
    extractedTerms: Record<string, string>;
    obligations: { party: 'Our Company' | 'Counterparty'; obligation: string }[];
    clauseComparison?: { clause: string; similarityScore: number; recommendation: string }[];
}


// =================================================================================================
// MOCK DATA & API SERVICE SIMULATION
// In a real app, this would be in a separate /data or /services directory and call a real backend.
// =================================================================================================

export const mockLegalTeam: LegalTeamMember[] = [
    { id: 'LT-01', name: 'Eleanor Vance', role: 'General Counsel', email: 'e.vance@demobank.com' },
    { id: 'LT-02', name: 'Ben Carter', role: 'Associate Counsel', email: 'b.carter@demobank.com' },
    { id: 'LT-03', name: 'Olivia Martinez', role: 'Paralegal', email: 'o.martinez@demobank.com' },
    { id: 'LT-04', name: 'Kenji Tanaka', role: 'Contract Manager', email: 'k.tanaka@demobank.com' },
];

export const mockCounterparties: Counterparty[] = [
    { id: 'CP-01', name: 'Quantum Corp', address: '123 Quantum Way, Silicon Valley, CA', contactPerson: 'Dr. Evelyn Reed', contactEmail: 'evelyn.r@quantum.com', riskScore: 25 },
    { id: 'CP-02', name: 'Cyberdyne Systems', address: '456 Skynet Blvd, Sunnyvale, CA', contactPerson: 'Miles Dyson', contactEmail: 'm.dyson@cyberdyne.com', riskScore: 65 },
    { id: 'CP-03', name: 'Office Supplies Co.', address: '789 Paper St, Scranton, PA', contactPerson: 'Pamela Beesly', contactEmail: 'pbeesly@officesupplies.com', riskScore: 10 },
    { id: 'CP-04', name: 'NeuroLink Inc.', address: '1 Neural Plaza, Austin, TX', contactPerson: 'Elon Musk', contactEmail: 'elon@neurolink.io', riskScore: 40 },
    { id: 'CP-05', name: 'Stark Industries', address: '1 Stark Tower, New York, NY', contactPerson: 'Pepper Potts', contactEmail: 'ppotts@stark.com', riskScore: 30 },
];

export const mockContracts: Contract[] = [
    { id: 'CTR-001', name: 'Master Services Agreement - Quantum Corp', type: 'MSA', status: 'Active', counterpartyId: 'CP-01', startDate: '2023-01-15', endDate: '2026-01-14', renewalDate: '2025-11-15', value: 5000000, currency: 'USD', assignedLawyerId: 'LT-02', description: 'Comprehensive MSA for quantum computing research services.', documents: [{id: 'DOC-001', fileName: 'MSA_Quantum_Signed.pdf', format: 'Signed PDF', version: 2, uploadDate: '2023-01-14', url: '#'}], versionHistory: ['v1 Draft', 'v2 Signed'], keyTerms: { 'Payment Terms': 'Net 60', 'Liability Cap': '$5,000,000' } },
    { id: 'CTR-002', name: 'SaaS Subscription - Cyberdyne Systems', type: 'SaaS', status: 'Active', counterpartyId: 'CP-02', startDate: '2022-11-30', endDate: null, renewalDate: '2024-11-30', value: 750000, currency: 'USD', assignedLawyerId: 'LT-04', description: 'Annual subscription for Cyberdyne\'s AI-driven security platform.', documents: [{id: 'DOC-002', fileName: 'SaaS_Cyberdyne_v3.pdf', format: 'Signed PDF', version: 3, uploadDate: '2022-11-28', url: '#'}], versionHistory: ['v1 Initial', 'v2 Redlined', 'v3 Signed'], keyTerms: { 'SLA': '99.99% Uptime', 'Data Privacy': 'GDPR & CCPA Compliant' } },
    { id: 'CTR-003', name: 'Vendor Agreement - Office Supplies Co.', type: 'Vendor', status: 'Expired', counterpartyId: 'CP-03', startDate: '2023-06-30', endDate: '2024-06-30', renewalDate: null, value: 50000, currency: 'USD', assignedLawyerId: 'LT-03', description: 'Annual contract for office supply procurement.', documents: [{id: 'DOC-003', fileName: 'Office_Supplies_Vendor.pdf', format: 'Signed PDF', version: 1, uploadDate: '2023-06-25', url: '#'}], versionHistory: ['v1 Signed'], keyTerms: { 'Delivery': 'Within 2 business days' } },
    { id: 'CTR-004', name: 'NDA - NeuroLink Inc.', type: 'NDA', status: 'Active', counterpartyId: 'CP-04', startDate: '2024-02-01', endDate: '2029-02-01', renewalDate: null, value: 0, currency: 'USD', assignedLawyerId: 'LT-02', description: 'Mutual non-disclosure agreement for collaborative brain-computer interface research.', documents: [{id: 'DOC-004', fileName: 'NDA_NeuroLink_Mutual.pdf', format: 'Signed PDF', version: 1, uploadDate: '2024-01-30', url: '#'}], versionHistory: ['v1 Signed'], keyTerms: { 'Term': '5 years', 'Residuals Clause': 'Included' } },
    { id: 'CTR-005', name: 'Statement of Work - Stark Industries', type: 'SOW', status: 'Under Review', counterpartyId: 'CP-05', startDate: '2024-09-01', endDate: '2025-03-01', renewalDate: null, value: 1200000, currency: 'USD', assignedLawyerId: 'LT-01', description: 'SOW for developing a new arc reactor power management system.', documents: [{id: 'DOC-005', fileName: 'SOW_Stark_ArcReactor_DRAFT.docx', format: 'DOCX', version: 1, uploadDate: '2024-07-20', url: '#'}], versionHistory: ['v1 Draft'], keyTerms: { 'Milestone 1': 'System Architecture Design', 'Acceptance Criteria': 'Defined in Appendix A' } },
    { id: 'CTR-006', name: 'Project Phoenix MSA - Internal Draft', type: 'MSA', status: 'Drafting', counterpartyId: 'CP-01', startDate: '2025-01-01', endDate: '2028-01-01', renewalDate: null, value: 8000000, currency: 'USD', assignedLawyerId: 'LT-02', description: 'New master services agreement for Project Phoenix.', documents: [], versionHistory: [], keyTerms: {} },
];

export const mockComplianceTasks: ComplianceTask[] = [
    { id: 'CT-001', name: 'GDPR Data Processing Audit', relatedContractId: 'CTR-002', dueDate: '2024-10-15', status: 'In Progress', ownerId: 'LT-03', description: 'Annual audit of data processing clauses and practices with Cyberdyne Systems.' },
    { id: 'CT-002', name: 'Export Control Check for Quantum Corp', relatedContractId: 'CTR-001', dueDate: '2024-08-30', status: 'Pending', ownerId: 'LT-02', description: 'Verify compliance with international export control regulations for quantum technology.' },
    { id: 'CT-003', name: 'Renew Business License', relatedContractId: null, dueDate: '2024-12-31', status: 'Completed', ownerId: 'LT-03', description: 'File for annual renewal of the primary business operating license.' },
    { id: 'CT-004', name: 'Review Stark SOW Liability Clause', relatedContractId: 'CTR-005', dueDate: '2024-07-30', status: 'Overdue', ownerId: 'LT-01', description: 'Liability clause proposed by Stark Industries exceeds standard risk tolerance.' },
];

export const mockClauseLibrary: StandardClause[] = [
    { id: 'CL-LIAB-001', title: 'Standard Mutual Limitation of Liability', category: 'Liability', content: 'EXCEPT FOR OBLIGATIONS UNDER SECTION [CONFIDENTIALITY] AND [INDEMNIFICATION], EACH PARTY\'S AGGREGATE LIABILITY SHALL NOT EXCEED THE TOTAL FEES PAID OR PAYABLE TO THE OTHER PARTY IN THE PRECEDING TWELVE (12) MONTHS.', version: 3, usageGuidelines: 'Use for standard risk SaaS and service agreements. Do not use for high-risk data processing agreements.', approvedBy: 'LT-01' },
    { id: 'CL-CONF-001', title: 'Standard Unilateral Confidentiality', category: 'Confidentiality', content: 'The Receiving Party shall hold in strict confidence and shall not disclose any Confidential Information of the Disclosing Party. "Confidential Information" means...', version: 5, usageGuidelines: 'Use when Demo Bank is the primary disclosing party. For mutual disclosures, use CL-CONF-002.', approvedBy: 'LT-01' },
    { id: 'CL-TERM-002', title: 'Termination for Convenience', category: 'Termination', content: 'Either party may terminate this Agreement for any reason or no reason upon ninety (90) days prior written notice to the other party.', version: 2, usageGuidelines: 'Preferable in all vendor agreements. May be negotiated out by strategic partners.', approvedBy: 'LT-01' },
];

export const LegalSuiteApiService = {
    fetchContracts: async (): Promise<Contract[]> => {
        console.log("API: Fetching contracts...");
        return new Promise(resolve => setTimeout(() => resolve(mockContracts), 500));
    },
    fetchContractById: async (id: string): Promise<Contract | undefined> => {
        console.log(`API: Fetching contract ${id}...`);
        return new Promise(resolve => setTimeout(() => resolve(mockContracts.find(c => c.id === id)), 300));
    },
    fetchComplianceTasks: async (): Promise<ComplianceTask[]> => {
        console.log("API: Fetching compliance tasks...");
        return new Promise(resolve => setTimeout(() => resolve(mockComplianceTasks), 400));
    },
    fetchClauseLibrary: async (): Promise<StandardClause[]> => {
        console.log("API: Fetching clause library...");
        return new Promise(resolve => setTimeout(() => resolve(mockClauseLibrary), 200));
    },
    getCounterpartyById: (id: string): Counterparty | undefined => mockCounterparties.find(cp => cp.id === id),
    getLawyerById: (id: string): LegalTeamMember | undefined => mockLegalTeam.find(lt => lt.id === id),
};

// =================================================================================================
// CUSTOM HOOKS
// =================================================================================================

export const useLegalData = () => {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [tasks, setTasks] = useState<ComplianceTask[]>([]);
    const [clauses, setClauses] = useState<StandardClause[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAllData = async () => {
            setIsLoading(true);
            const [contractData, taskData, clauseData] = await Promise.all([
                LegalSuiteApiService.fetchContracts(),
                LegalSuiteApiService.fetchComplianceTasks(),
                LegalSuiteApiService.fetchClauseLibrary(),
            ]);
            setContracts(contractData);
            setTasks(taskData);
            setClauses(clauseData);
            setIsLoading(false);
        };
        loadAllData();
    }, []);

    return { contracts, tasks, clauses, isLoading, counterparties: mockCounterparties, legalTeam: mockLegalTeam };
};

// =================================================================================================
// HELPER FUNCTIONS & UTILITIES
// =================================================================================================

export const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const getStatusColor = (status: ContractStatus | ComplianceTask['status']) => {
    switch (status) {
        case 'Active': return 'bg-green-500/20 text-green-300';
        case 'Under Review': return 'bg-yellow-500/20 text-yellow-300';
        case 'Drafting': return 'bg-blue-500/20 text-blue-300';
        case 'Expired': return 'bg-gray-500/20 text-gray-300';
        case 'Terminated': return 'bg-red-500/20 text-red-300';
        case 'Pending Signature': return 'bg-purple-500/20 text-purple-300';
        case 'In Progress': return 'bg-cyan-500/20 text-cyan-300';
        case 'Completed': return 'bg-green-500/20 text-green-300';
        case 'Pending': return 'bg-gray-500/20 text-gray-300';
        case 'Overdue': return 'bg-red-600/30 text-red-400 font-bold';
        default: return 'bg-gray-600/20 text-gray-400';
    }
};

export const getRiskColor = (level: RiskLevel) => {
    switch (level) {
        case 'Low': return 'text-green-400';
        case 'Medium': return 'text-yellow-400';
        case 'High': return 'text-orange-400';
        case 'Critical': return 'text-red-500';
    }
}

// =================================================================================================
// SUB-COMPONENTS
// =================================================================================================

export const TabNavigation: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void; tabs: string[] }> = ({ activeTab, setActiveTab, tabs }) => (
    <div className="border-b border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {tabs.map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`${
                        activeTab === tab
                            ? 'border-cyan-500 text-cyan-400'
                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                    {tab}
                </button>
            ))}
        </nav>
    </div>
);

export const ContractTable: React.FC<{ contracts: Contract[], onContractClick: (contract: Contract) => void }> = ({ contracts, onContractClick }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                <tr>
                    <th className="px-6 py-3">Contract Name</th>
                    <th className="px-6 py-3">Counterparty</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Value (USD)</th>
                    <th className="px-6 py-3">Renewal Date</th>
                </tr>
            </thead>
            <tbody>
                {contracts.map(c => (
                    <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer" onClick={() => onContractClick(c)}>
                        <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                        <td className="px-6 py-4">{LegalSuiteApiService.getCounterpartyById(c.counterpartyId)?.name || 'N/A'}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(c.status)}`}>{c.status}</span></td>
                        <td className="px-6 py-4">{c.type}</td>
                        <td className="px-6 py-4 text-white font-mono">{c.value.toLocaleString()}</td>
                        <td className="px-6 py-4">{formatDate(c.renewalDate)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export const ComplianceTracker: React.FC<{ tasks: ComplianceTask[] }> = ({ tasks }) => (
    <Card title="Compliance Dashboard">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                    <tr>
                        <th className="px-6 py-3">Task</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Due Date</th>
                        <th className="px-6 py-3">Owner</th>
                        <th className="px-6 py-3">Related Contract</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map(task => (
                        <tr key={task.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                            <td className="px-6 py-4 font-medium text-white">{task.name}</td>
                            <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>{task.status}</span></td>
                            <td className="px-6 py-4">{formatDate(task.dueDate)}</td>
                            <td className="px-6 py-4">{LegalSuiteApiService.getLawyerById(task.ownerId)?.name || 'N/A'}</td>
                            <td className="px-6 py-4">{mockContracts.find(c => c.id === task.relatedContractId)?.name || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </Card>
);

export const ClauseLibrary: React.FC<{ clauses: StandardClause[] }> = ({ clauses }) => (
    <Card title="Standard Clause Library">
        <div className="space-y-4">
            {clauses.map(clause => (
                <div key={clause.id} className="bg-gray-900/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-white">{clause.title} <span className="ml-2 text-xs font-normal text-gray-400">({clause.category} / v{clause.version})</span></h4>
                    <p className="text-xs text-gray-500 mt-1 mb-2">Guidelines: {clause.usageGuidelines}</p>
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans bg-gray-800 p-3 rounded">{clause.content}</pre>
                </div>
            ))}
        </div>
    </Card>
);

export const ContractDetailModal: React.FC<{ contract: Contract; onClose: () => void }> = ({ contract, onClose }) => {
    const counterparty = LegalSuiteApiService.getCounterpartyById(contract.counterpartyId);
    const lawyer = LegalSuiteApiService.getLawyerById(contract.assignedLawyerId);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full border border-gray-700 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">{contract.name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Key Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="bg-gray-900/50 p-3 rounded">
                            <p className="text-gray-400 text-xs">Status</p>
                            <p className={`font-bold ${getStatusColor(contract.status).split(' ')[1]}`}>{contract.status}</p>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded">
                            <p className="text-gray-400 text-xs">Contract Value (ACV)</p>
                            <p className="text-white font-mono">{contract.value.toLocaleString()} {contract.currency}</p>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded">
                            <p className="text-gray-400 text-xs">Effective Date</p>
                            <p className="text-white">{formatDate(contract.startDate)}</p>
                        </div>
                        <div className="bg-gray-900/50 p-3 rounded">
                            <p className="text-gray-400 text-xs">Renewal Date</p>
                            <p className="text-white">{formatDate(contract.renewalDate)}</p>
                        </div>
                    </div>

                    {/* Parties Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Counterparty Details">
                            <p className="text-white font-semibold">{counterparty?.name}</p>
                            <p className="text-gray-400">{counterparty?.address}</p>
                            <p className="text-gray-400 mt-2">Contact: {counterparty?.contactPerson} ({counterparty?.contactEmail})</p>
                        </Card>
                         <Card title="Internal Details">
                            <p className="text-white font-semibold">Demo Bank</p>
                            <p className="text-gray-400">Assigned: {lawyer?.name} ({lawyer?.role})</p>
                            <p className="text-gray-400 mt-2">Email: {lawyer?.email}</p>
                        </Card>
                    </div>

                    {/* Documents */}
                    <Card title="Attached Documents">
                        <ul>
                            {contract.documents.map(doc => (
                                <li key={doc.id} className="flex justify-between items-center p-2 hover:bg-gray-700/50 rounded">
                                    <span className="text-cyan-400">{doc.fileName} (v{doc.version})</span>
                                    <span className="text-gray-500 text-xs">Uploaded: {formatDate(doc.uploadDate)}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export const AiContractAnalysisTool: React.FC = () => {
    const [contractText, setContractText] = useState('');
    const [analysisResult, setAnalysisResult] = useState<AiAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!contractText.trim()) return;
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `
                You are a sophisticated legal AI assistant. Analyze the following contract text.
                Provide the output in a structured JSON format with the following keys: "summary", "riskAssessment", "extractedTerms", "obligations".
                
                - "summary": A concise, one-paragraph summary of the agreement's purpose.
                - "riskAssessment": An object with "level" ('Low', 'Medium', 'High', 'Critical') and "details" (an array of strings explaining the risks).
                - "extractedTerms": An object of key-value pairs for critical terms like "Term Length", "Governing Law", "Liability Cap".
                - "obligations": An array of objects, each with "party" ('Our Company' or 'Counterparty') and "obligation" (a string describing a key obligation).
                
                Contract Text:
                ---
                ${contractText}
                ---
            `;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            // In a real app, robust parsing and validation is critical
            const jsonResponse = JSON.parse(response.text.replace(/```json|```/g, '').trim());
            setAnalysisResult(jsonResponse);

        } catch (e) {
            console.error("AI Analysis Error:", e);
            setError("Failed to analyze the contract. The AI model may be unavailable or the response was invalid.");
            setAnalysisResult(null);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Card title="AI Contract Analyzer">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h4 className="text-white font-semibold">Paste Contract Text</h4>
                    <textarea 
                        className="w-full h-80 bg-gray-900/50 p-3 rounded text-white text-sm font-mono resize-none"
                        placeholder="Paste the full text of a contract here for analysis..."
                        value={contractText}
                        onChange={e => setContractText(e.target.value)}
                    />
                    <button onClick={handleAnalyze} disabled={isLoading || !contractText} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">
                        {isLoading ? 'Analyzing...' : 'Run AI Analysis'}
                    </button>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg overflow-y-auto h-[444px]">
                    <h4 className="text-white font-semibold mb-4">Analysis Results</h4>
                    {isLoading && <p className="text-cyan-400">AI is analyzing the document...</p>}
                    {error && <p className="text-red-400">{error}</p>}
                    {analysisResult && (
                        <div className="space-y-4 text-sm">
                            <div>
                                <h5 className="font-bold text-gray-300">Summary</h5>
                                <p className="text-gray-400">{analysisResult.summary}</p>
                            </div>
                            <div>
                                <h5 className="font-bold text-gray-300">Risk Assessment</h5>
                                <p className={`font-bold ${getRiskColor(analysisResult.riskAssessment.level)}`}>
                                    Level: {analysisResult.riskAssessment.level}
                                </p>
                                <ul className="list-disc list-inside text-gray-400">
                                    {analysisResult.riskAssessment.details.map((d, i) => <li key={i}>{d}</li>)}
                                </ul>
                            </div>
                             <div>
                                <h5 className="font-bold text-gray-300">Key Terms</h5>
                                <ul className="text-gray-400">
                                    {Object.entries(analysisResult.extractedTerms).map(([key, value]) => (
                                        <li key={key}><strong>{key}:</strong> {value}</li>
                                    ))}
                                </ul>
                            </div>
                             <div>
                                <h5 className="font-bold text-gray-300">Key Obligations</h5>
                                <ul className="list-disc list-inside text-gray-400">
                                    {analysisResult.obligations.map((o, i) => (
                                        <li key={i}><strong>{o.party}:</strong> {o.obligation}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};


// =================================================================================================
// MAIN VIEW COMPONENT
// =================================================================================================

const DemoBankLegalSuiteView: React.FC = () => {
    // State Management
    const [isNdaModalOpen, setIsNdaModalOpen] = useState(false);
    const [ndaParams, setNdaParams] = useState({ partyA: 'Demo Bank', partyB: 'FutureTech Solutions', topic: 'Project Phoenix' });
    const [generatedNda, setGeneratedNda] = useState('');
    const [isNdaLoading, setIsNdaLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

    // Data Fetching Hook
    const { contracts, tasks, clauses, isLoading: isDataLoading } = useLegalData();

    // Memoized calculations for dashboard metrics
    const dashboardMetrics = useMemo(() => {
        if (!contracts) return { active: 0, pending: 0, renewals: 0 };
        const now = new Date();
        const nextQuarter = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
        return {
            active: contracts.filter(c => c.status === 'Active').length,
            pending: contracts.filter(c => c.status === 'Under Review' || c.status === 'Pending Signature').length,
            renewals: contracts.filter(c => c.renewalDate && new Date(c.renewalDate) > now && new Date(c.renewalDate) <= nextQuarter).length,
        };
    }, [contracts]);

    // Handlers
    const handleGenerateNda = async () => {
        if (!ndaParams.partyB || !ndaParams.topic) return;
        setIsNdaLoading(true);
        setGeneratedNda('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Generate a simple, standard, one-way Non-Disclosure Agreement (NDA). The Disclosing Party is "${ndaParams.partyA}". The Receiving Party is "${ndaParams.partyB}". The confidential topic is "${ndaParams.topic}". The agreement should be governed by the laws of the State of Delaware. Include sections for Definition of Confidential Information, Obligations of Receiving Party, Exclusions, Term, and Governing Law. Keep it concise and professional.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setGeneratedNda(response.text);
        } catch (error) {
            setGeneratedNda("Error: Could not generate the NDA at this time.");
        } finally {
            setIsNdaLoading(false);
        }
    };

    const handleContractClick = (contract: Contract) => {
        setSelectedContract(contract);
    };

    const handleCloseModal = () => {
        setSelectedContract(null);
    };
    
    const tabs = ['Dashboard', 'Compliance', 'Clause Library', 'AI Tools'];

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Legal Suite</h2>
                    <button onClick={() => setIsNdaModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">Generate NDA with AI</button>
                </div>
                
                <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />

                {isDataLoading ? (
                    <div className="text-center p-10 text-gray-400">Loading Legal Data...</div>
                ) : (
                    <>
                        {activeTab === 'Dashboard' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Card className="text-center"><p className="text-3xl font-bold text-white">{dashboardMetrics.active}</p><p className="text-sm text-gray-400 mt-1">Active Contracts</p></Card>
                                    <Card className="text-center"><p className="text-3xl font-bold text-white">{dashboardMetrics.pending}</p><p className="text-sm text-gray-400 mt-1">Pending Review</p></Card>
                                    <Card className="text-center"><p className="text-3xl font-bold text-white">{dashboardMetrics.renewals}</p><p className="text-sm text-gray-400 mt-1">Renewals this Quarter</p></Card>
                                </div>
                                <Card title="Contract Repository">
                                    <ContractTable contracts={contracts} onContractClick={handleContractClick} />
                                </Card>
                            </div>
                        )}

                        {activeTab === 'Compliance' && <ComplianceTracker tasks={tasks} />}
                        
                        {activeTab === 'Clause Library' && <ClauseLibrary clauses={clauses} />}

                        {activeTab === 'AI Tools' && <AiContractAnalysisTool />}
                    </>
                )}
            </div>

            {isNdaModalOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setIsNdaModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI NDA Generator</h3></div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh]">
                            <div className="space-y-4">
                                <p className="text-sm text-gray-400">Enter the details for the NDA.</p>
                                <input type="text" value={ndaParams.partyB} onChange={e => setNdaParams(p => ({...p, partyB: e.target.value}))} placeholder="Receiving Party Name" className="w-full bg-gray-700/50 p-2 rounded text-white" />
                                <input type="text" value={ndaParams.topic} onChange={e => setNdaParams(p => ({...p, topic: e.target.value}))} placeholder="Confidential Topic (e.g., Project X)" className="w-full bg-gray-700/50 p-2 rounded text-white" />
                                <button onClick={handleGenerateNda} disabled={isNdaLoading} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">{isNdaLoading ? 'Generating...' : 'Generate Document'}</button>
                            </div>
                            <div className="bg-gray-900/50 p-4 rounded-lg overflow-y-auto">
                                {isNdaLoading && <p className="text-cyan-400">Generating NDA...</p>}
                                <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans">{generatedNda}</pre>
                            </div>
                        </div>
                    </div>
                 </div>
            )}

            {selectedContract && <ContractDetailModal contract={selectedContract} onClose={handleCloseModal} />}
        </>
    );
};

export default DemoBankLegalSuiteView;