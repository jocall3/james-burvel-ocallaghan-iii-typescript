import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card from '../../Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, AreaChart, Area, ComposedChart } from 'recharts';

// --- Existing Data (unmodified) ---
const controlStatusData = [
    { name: 'SOC 2', Passed: 320, Failed: 12, 'Not Applicable': 50 },
    { name: 'ISO 27001', Passed: 450, Failed: 25, 'Not Applicable': 80 },
    { name: 'PCI DSS', Passed: 280, Failed: 5, 'Not Applicable': 120 },
    { name: 'HIPAA', Passed: 150, Failed: 8, 'Not Applicable:': 250 },
];

const activeAudits = [
    { id: 1, framework: 'SOC 2 Type II', auditor: 'CyberTrust LLP', status: 'In Progress', dueDate: '2024-09-30' },
    { id: 2, framework: 'PCI DSS 4.0', auditor: 'SecurePay Auditors', status: 'Scheduled', dueDate: '2024-10-15' },
];

// --- New Data Structures (Interfaces) ---

export interface Framework {
    id: string;
    name: string;
    description: string;
    version: string;
    owner: string;
    lastReviewed: string;
    status: 'Active' | 'Under Review' | 'Retired';
    controlCount: number;
    riskImpactScore: number;
}

export interface Policy {
    id: string;
    title: string;
    category: 'Information Security' | 'Data Privacy' | 'Operational Compliance' | 'Financial Reporting';
    version: string;
    status: 'Approved' | 'Draft' | 'Under Review';
    owner: string;
    lastUpdated: string;
    effectiveDate: string;
    reviewCycleMonths: number;
    relatedFrameworks: string[];
    documentLink: string;
}

export interface ControlDetail {
    id: string;
    name: string;
    description: string;
    frameworkId: string; // Links to Framework.id
    policyId?: string; // Links to Policy.id
    controlFamily: string;
    controlType: 'Preventative' | 'Detective' | 'Corrective';
    implementationStatus: 'Implemented' | 'Partially Implemented' | 'Planned' | 'Not Applicable';
    lastTested: string;
    nextTestDue: string;
    testFrequencyMonths: number;
    complianceScore: number; // 0-100
    evidenceLink?: string;
    owner: string;
}

export interface Risk {
    id: string;
    name: string;
    description: string;
    category: 'Cybersecurity' | 'Operational' | 'Regulatory' | 'Financial';
    likelihood: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
    impact: 'Negligible' | 'Minor' | 'Moderate' | 'Significant' | 'Severe';
    severityScore: number; // Calculated: Likelihood * Impact (e.g., 1-5 scale each)
    status: 'Open' | 'Mitigated' | 'Accepted' | 'Closed';
    mitigationPlanIds: string[]; // Links to RemediationPlan.id
    owner: string;
    lastReviewed: string;
    relatedControls: string[]; // Links to ControlDetail.id
}

export interface Issue {
    id: string;
    title: string;
    description: string;
    type: 'Audit Finding' | 'Control Deficiency' | 'Compliance Violation' | 'Security Incident';
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    status: 'Open' | 'In Progress' | 'Awaiting Review' | 'Closed';
    assignedTo: string;
    dueDate: string;
    openedDate: string;
    closedDate?: string;
    relatedControlId?: string; // Links to ControlDetail.id
    relatedRiskId?: string; // Links to Risk.id
    remediationPlanId?: string; // Links to RemediationPlan.id
}

export interface RemediationPlan {
    id: string;
    title: string;
    description: string;
    status: 'Planned' | 'In Progress' | 'Completed' | 'Delayed';
    assignedTo: string;
    startDate: string;
    targetCompletionDate: string;
    actualCompletionDate?: string;
    progressPercentage: number;
    relatedIssueIds: string[]; // Links to Issue.id
    costEstimate: number;
    priority: 'High' | 'Medium' | 'Low';
}

export interface AuditFinding {
    id: string;
    auditId: number; // Links to ActiveAudit.id (mock existing)
    title: string;
    description: string;
    severity: 'Critical' | 'Major' | 'Minor' | 'Observation';
    status: 'Open' | 'Resolved' | 'Accepted Risk';
    reportedDate: string;
    dueDate: string;
    relatedControlIds: string[]; // Links to ControlDetail.id
    actionPlanId?: string; // Links to RemediationPlan.id
}

export interface Vendor {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    serviceProvided: string;
    criticality: 'High' | 'Medium' | 'Low';
    complianceStatus: 'Compliant' | 'Non-Compliant' | 'Pending Review';
    contractStartDate: string;
    contractEndDate: string;
    lastAssessmentDate: string;
    nextAssessmentDue: string;
    riskScore: number; // 0-100
    documentLinks: string[]; // e.g., SOC 2 report, privacy policy
}

export interface ComplianceTraining {
    id: string;
    title: string;
    courseModule: string;
    status: 'Mandatory' | 'Optional';
    targetAudience: string[];
    assignedDate: string;
    dueDate: string;
    completionDate?: string;
    completionStatus: 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';
    employeeId: string; // In a real app, this would link to an employee profile
}

export interface RegulatoryUpdate {
    id: string;
    title: string;
    source: string; // e.g., OCC, FDIC, SEC, GDPR
    effectiveDate: string;
    summary: string;
    impactAssessmentStatus: 'Not Assessed' | 'In Progress' | 'Assessed - No Impact' | 'Assessed - Impacted';
    applicableFrameworks: string[]; // Links to Framework.name
    documentLink: string;
}

export interface Document {
    id: string;
    name: string;
    type: 'Policy' | 'Procedure' | 'Evidence' | 'Report' | 'Contract';
    category: string;
    uploadDate: string;
    uploadedBy: string;
    version: string;
    link: string;
    tags: string[];
}

// --- Helper Functions for Mock Data Generation ---

const generateDate = (offsetDays: number = 0, future: boolean = false): string => {
    const date = new Date();
    date.setDate(date.getDate() + (future ? offsetDays : -offsetDays));
    return date.toISOString().split('T')[0];
};

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomId = () => Math.random().toString(36).substring(2, 11);

// --- Extensive Mock Data ---

const mockFrameworks: Framework[] = [
    { id: 'FW001', name: 'SOC 2', description: 'Service Organization Control 2 Report', version: 'Type II', owner: 'IS Compliance', lastReviewed: '2024-01-15', status: 'Active', controlCount: 350, riskImpactScore: 85 },
    { id: 'FW002', name: 'ISO 27001', description: 'Information security management systems', version: '2022', owner: 'Security Dept', lastReviewed: '2023-11-01', status: 'Active', controlCount: 500, riskImpactScore: 90 },
    { id: 'FW003', name: 'PCI DSS', description: 'Payment Card Industry Data Security Standard', version: '4.0', owner: 'Payments Ops', lastReviewed: '2024-03-20', status: 'Active', controlCount: 300, riskImpactScore: 95 },
    { id: 'FW004', name: 'HIPAA', description: 'Health Insurance Portability and Accountability Act', version: '1996', owner: 'Legal & Privacy', lastReviewed: '2023-09-10', status: 'Active', controlCount: 200, riskImpactScore: 88 },
    { id: 'FW005', name: 'GDPR', description: 'General Data Protection Regulation', version: '2016', owner: 'Legal & Privacy', lastReviewed: '2024-02-28', status: 'Active', controlCount: 180, riskImpactScore: 80 },
    { id: 'FW006', name: 'FFIEC', description: 'Federal Financial Institutions Examination Council', version: 'IT Handbook', owner: 'Risk Management', lastReviewed: '2023-10-05', status: 'Active', controlCount: 400, riskImpactScore: 92 },
    { id: 'FW007', name: 'NIST CSF', description: 'NIST Cybersecurity Framework', version: '1.1', owner: 'Security Dept', lastReviewed: '2024-04-01', status: 'Active', controlCount: 250, riskImpactScore: 87 },
];

const mockPolicies: Policy[] = Array.from({ length: 150 }).map((_, i) => ({
    id: `POL${i + 1001}`,
    title: `Information Security Policy ${i + 1}`,
    category: getRandomElement(['Information Security', 'Data Privacy', 'Operational Compliance', 'Financial Reporting']),
    version: `1.${getRandomInt(0, 9)}`,
    status: getRandomElement(['Approved', 'Draft', 'Under Review']),
    owner: getRandomElement(['John Doe', 'Jane Smith', 'Compliance Team', 'Legal Dept']),
    lastUpdated: generateDate(getRandomInt(30, 700)),
    effectiveDate: generateDate(getRandomInt(10, 300)),
    reviewCycleMonths: getRandomElement([6, 12, 24]),
    relatedFrameworks: Array.from({ length: getRandomInt(1, 3) }).map(() => getRandomElement(mockFrameworks).name),
    documentLink: `/docs/policy_POL${i + 1001}.pdf`,
}));

const mockControlDetails: ControlDetail[] = Array.from({ length: 1200 }).map((_, i) => {
    const framework = getRandomElement(mockFrameworks);
    const policy = getRandomElement(mockPolicies);
    return {
        id: `CTL${i + 10001}`,
        name: `Control ${i + 1}: ${framework.name} - ${getRandomElement(['Access Mgmt', 'Data Encryption', 'Vendor Due Diligence', 'Incident Response', 'Backup & Recovery'])}`,
        description: `Description for control CTL${i + 10001} related to ${framework.name}.`,
        frameworkId: framework.id,
        policyId: Math.random() > 0.3 ? policy.id : undefined,
        controlFamily: getRandomElement(['AC', 'AU', 'CM', 'CP', 'IA', 'IR', 'MA', 'MP', 'PE', 'PL', 'RA', 'SC', 'SI', 'SA']),
        controlType: getRandomElement(['Preventative', 'Detective', 'Corrective']),
        implementationStatus: getRandomElement(['Implemented', 'Partially Implemented', 'Planned', 'Not Applicable']),
        lastTested: generateDate(getRandomInt(0, 365)),
        nextTestDue: generateDate(getRandomInt(30, 180), true),
        testFrequencyMonths: getRandomElement([3, 6, 12]),
        complianceScore: getRandomInt(60, 100),
        evidenceLink: Math.random() > 0.5 ? `/evidence/CTL${i + 10001}_report.pdf` : undefined,
        owner: getRandomElement(['Auditor A', 'Auditor B', 'Security Team', 'IT Ops']),
    };
});

const mockRisks: Risk[] = Array.from({ length: 300 }).map((_, i) => {
    const likelihood = getRandomElement(['Very Low', 'Low', 'Medium', 'High', 'Very High']);
    const impact = getRandomElement(['Negligible', 'Minor', 'Moderate', 'Significant', 'Severe']);
    const severityMap = {
        'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Very High': 5,
        'Negligible': 1, 'Minor': 2, 'Moderate': 3, 'Significant': 4, 'Severe': 5,
    };
    return {
        id: `RISK${i + 1001}`,
        name: `Risk ID ${i + 1}: ${getRandomElement(['Data Breach', 'System Downtime', 'Regulatory Fines', 'Fraud', 'Vendor Failure'])}`,
        description: `Detailed description for risk RISK${i + 1001}.`,
        category: getRandomElement(['Cybersecurity', 'Operational', 'Regulatory', 'Financial']),
        likelihood: likelihood,
        impact: impact,
        severityScore: severityMap[likelihood] * severityMap[impact],
        status: getRandomElement(['Open', 'Mitigated', 'Accepted', 'Closed']),
        mitigationPlanIds: [], // Will link later
        owner: getRandomElement(['Risk Manager', 'CISO', 'Legal Counsel', 'Operations Head']),
        lastReviewed: generateDate(getRandomInt(0, 180)),
        relatedControls: Array.from({ length: getRandomInt(1, 3) }).map(() => getRandomElement(mockControlDetails).id),
    };
});

const mockRemediationPlans: RemediationPlan[] = Array.from({ length: 200 }).map((_, i) => ({
    id: `REMPLAN${i + 101}`,
    title: `Remediation Plan ${i + 1}`,
    description: `Plan to address identified issues/risks ${i + 1}.`,
    status: getRandomElement(['Planned', 'In Progress', 'Completed', 'Delayed']),
    assignedTo: getRandomElement(['Alice Johnson', 'Bob Williams', 'Charlie Brown']),
    startDate: generateDate(getRandomInt(60, 180)),
    targetCompletionDate: generateDate(getRandomInt(10, 90), true),
    actualCompletionDate: Math.random() > 0.3 ? generateDate(getRandomInt(10, 30)) : undefined,
    progressPercentage: getRandomInt(0, 100),
    relatedIssueIds: [], // Will link later
    costEstimate: getRandomInt(1000, 50000),
    priority: getRandomElement(['High', 'Medium', 'Low']),
}));

const mockIssues: Issue[] = Array.from({ length: 400 }).map((_, i) => {
    const relatedControl = Math.random() > 0.2 ? getRandomElement(mockControlDetails) : undefined;
    const relatedRisk = Math.random() > 0.2 ? getRandomElement(mockRisks) : undefined;
    const remediationPlan = Math.random() > 0.4 ? getRandomElement(mockRemediationPlans) : undefined;

    const issue: Issue = {
        id: `ISSUE${i + 1001}`,
        title: `Issue ${i + 1}: ${getRandomElement(['Control Failure', 'Policy Violation', 'Non-Compliance', 'Security Vulnerability'])}`,
        description: `Details of issue ISSUE${i + 1001}.`,
        type: getRandomElement(['Audit Finding', 'Control Deficiency', 'Compliance Violation', 'Security Incident']),
        severity: getRandomElement(['Critical', 'High', 'Medium', 'Low']),
        status: getRandomElement(['Open', 'In Progress', 'Awaiting Review', 'Closed']),
        assignedTo: getRandomElement(['Compliance Officer', 'Security Engineer', 'IT Manager', 'Legal Dept']),
        dueDate: generateDate(getRandomInt(1, 60), true),
        openedDate: generateDate(getRandomInt(1, 180)),
        closedDate: Math.random() > 0.5 ? generateDate(getRandomInt(1, 30)) : undefined,
        relatedControlId: relatedControl?.id,
        relatedRiskId: relatedRisk?.id,
        remediationPlanId: remediationPlan?.id,
    };

    if (remediationPlan) {
        remediationPlan.relatedIssueIds.push(issue.id);
    }
    if (relatedRisk && remediationPlan) {
        relatedRisk.mitigationPlanIds.push(remediationPlan.id);
    }
    return issue;
});

const mockAuditFindings: AuditFinding[] = Array.from({ length: 100 }).map((_, i) => ({
    id: `AUDITF${i + 101}`,
    auditId: getRandomElement(activeAudits).id,
    title: `Finding ${i + 1}: ${getRandomElement(['Weak Access Control', 'Inadequate Data Encryption', 'Missing Policy Review', 'Lack of Vendor Assessment'])}`,
    description: `Detailed description of audit finding AUDITF${i + 101}.`,
    severity: getRandomElement(['Critical', 'Major', 'Minor', 'Observation']),
    status: getRandomElement(['Open', 'Resolved', 'Accepted Risk']),
    reportedDate: generateDate(getRandomInt(30, 180)),
    dueDate: generateDate(getRandomInt(10, 90), true),
    relatedControlIds: Array.from({ length: getRandomInt(1, 2) }).map(() => getRandomElement(mockControlDetails).id),
    actionPlanId: Math.random() > 0.5 ? getRandomElement(mockRemediationPlans).id : undefined,
}));

const mockVendors: Vendor[] = Array.from({ length: 80 }).map((_, i) => ({
    id: `VENDOR${i + 101}`,
    name: `Vendor ${i + 1} Inc.`,
    contactPerson: getRandomElement(['Emily White', 'David Green', 'Sophia Lee']),
    email: `vendor${i + 1}@example.com`,
    serviceProvided: getRandomElement(['Cloud Hosting', 'Payment Processing', 'Data Analytics', 'IT Support', 'HR Platform']),
    criticality: getRandomElement(['High', 'Medium', 'Low']),
    complianceStatus: getRandomElement(['Compliant', 'Non-Compliant', 'Pending Review']),
    contractStartDate: generateDate(getRandomInt(365, 1000)),
    contractEndDate: generateDate(getRandomInt(30, 365), true),
    lastAssessmentDate: generateDate(getRandomInt(0, 300)),
    nextAssessmentDue: generateDate(getRandomInt(30, 180), true),
    riskScore: getRandomInt(20, 95),
    documentLinks: [`/vendor_docs/VENDOR${i + 1}_SOC2.pdf`, `/vendor_docs/VENDOR${i + 1}_contract.pdf`],
}));

const mockComplianceTraining: ComplianceTraining[] = Array.from({ length: 500 }).map((_, i) => ({
    id: `TRAIN${i + 1001}`,
    title: getRandomElement(['Annual Security Awareness', 'HIPAA Privacy Training', 'GDPR Compliance', 'Anti-Money Laundering']),
    courseModule: getRandomElement(['Module A', 'Module B', 'Module C']),
    status: getRandomElement(['Mandatory', 'Optional']),
    targetAudience: getRandomElement([['All Employees'], ['IT Dept'], ['Legal & Compliance'], ['Sales Team']]),
    assignedDate: generateDate(getRandomInt(30, 365)),
    dueDate: generateDate(getRandomInt(10, 60), true),
    completionDate: Math.random() > 0.4 ? generateDate(getRandomInt(1, 20)) : undefined,
    completionStatus: getRandomElement(['Not Started', 'In Progress', 'Completed', 'Overdue']),
    employeeId: `EMP${getRandomInt(1000, 9999)}`,
}));

const mockRegulatoryUpdates: RegulatoryUpdate[] = Array.from({ length: 70 }).map((_, i) => ({
    id: `REG${i + 101}`,
    title: `Regulatory Update ${i + 1}: ${getRandomElement(['New Data Privacy Rule', 'Enhanced Cybersecurity Guidelines', 'AML Reporting Changes', 'Cloud Security Mandate'])}`,
    source: getRandomElement(['OCC', 'FDIC', 'SEC', 'GDPR', 'NIST', 'State Dept of Fin. Services']),
    effectiveDate: generateDate(getRandomInt(30, 180), true),
    summary: `Summary for regulatory update REG${i + 101}. This update brings changes to various compliance aspects.`,
    impactAssessmentStatus: getRandomElement(['Not Assessed', 'In Progress', 'Assessed - No Impact', 'Assessed - Impacted']),
    applicableFrameworks: Array.from({ length: getRandomInt(1, 3) }).map(() => getRandomElement(mockFrameworks).name),
    documentLink: `/reg_docs/REG${i + 101}_guidance.pdf`,
}));

const mockDocuments: Document[] = Array.from({ length: 300 }).map((_, i) => ({
    id: `DOC${i + 1001}`,
    name: `Document ${i + 1}: ${getRandomElement(['Security Policy', 'Incident Response Plan', 'SOC 2 Report', 'Vendor Contract', 'Audit Trail'])}`,
    type: getRandomElement(['Policy', 'Procedure', 'Evidence', 'Report', 'Contract']),
    category: getRandomElement(['Security', 'Operations', 'Legal', 'Finance', 'HR']),
    uploadDate: generateDate(getRandomInt(1, 500)),
    uploadedBy: getRandomElement(['Admin User', 'Compliance Team', 'IT Security']),
    version: `${getRandomInt(1, 5)}.0`,
    link: `/document_repo/DOC${i + 1001}.pdf`,
    tags: Array.from({ length: getRandomInt(1, 3) }).map(() => getRandomElement(['confidential', 'internal', 'public', 'archived'])),
}));

// --- Common UI Components/Hooks ---

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="flex justify-between items-center mt-4 text-gray-400">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700/50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
                Previous
            </button>
            <span>
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-700/50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
                Next
            </button>
        </div>
    );
};

interface SearchFilterProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    placeholder?: string;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ searchTerm, onSearchChange, placeholder = "Search..." }) => {
    return (
        <input
            type="text"
            placeholder={placeholder}
            className="p-2 border border-gray-700 bg-gray-900/50 text-white rounded-md w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
        />
    );
};

interface DropdownFilterProps {
    label: string;
    options: string[];
    selectedValue: string;
    onValueChange: (value: string) => void;
    className?: string;
}

export const DropdownFilter: React.FC<DropdownFilterProps> = ({ label, options, selectedValue, onValueChange, className }) => {
    return (
        <div className={`flex flex-col ${className}`}>
            <label className="text-sm text-gray-400 mb-1">{label}</label>
            <select
                className="p-2 border border-gray-700 bg-gray-900/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={selectedValue}
                onChange={(e) => onValueChange(e.target.value)}
            >
                <option value="">All</option>
                {options.map(option => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>
        </div>
    );
};

export const StatusBadge: React.FC<{ status: string; type?: 'success' | 'warning' | 'error' | 'info' | 'default' }> = ({ status, type = 'default' }) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full inline-flex items-center justify-center";
    let colorClasses = "";

    switch (type) {
        case 'success':
            colorClasses = 'bg-green-500/20 text-green-300';
            break;
        case 'warning':
            colorClasses = 'bg-yellow-500/20 text-yellow-300';
            break;
        case 'error':
            colorClasses = 'bg-red-500/20 text-red-300';
            break;
        case 'info':
            colorClasses = 'bg-blue-500/20 text-blue-300';
            break;
        case 'default':
        default:
            colorClasses = 'bg-gray-500/20 text-gray-300';
            break;
    }
    return <span className={`${baseClasses} ${colorClasses}`}>{status}</span>;
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 m-4 relative">
                <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="text-gray-300 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- New Exported Feature Components ---

interface FrameworksOverviewProps {
    frameworks: Framework[];
}

export const FrameworksOverview: React.FC<FrameworksOverviewProps> = ({ frameworks: initialFrameworks }) => {
    const [frameworks, setFrameworks] = useState<Framework[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sortKey, setSortKey] = useState<keyof Framework>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setFrameworks(initialFrameworks);
            setLoading(false);
        }, 500);
    }, [initialFrameworks]);

    const filteredFrameworks = useMemo(() => {
        let filtered = frameworks.filter(f =>
            f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.owner.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filterStatus) {
            filtered = filtered.filter(f => f.status === filterStatus);
        }
        return filtered;
    }, [frameworks, searchTerm, filterStatus]);

    const sortedFrameworks = useMemo(() => {
        return [...filteredFrameworks].sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }
            // Fallback for other types or nullish values
            return 0;
        });
    }, [filteredFrameworks, sortKey, sortDirection]);

    const totalPages = Math.ceil(sortedFrameworks.length / itemsPerPage);
    const paginatedFrameworks = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedFrameworks.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedFrameworks, currentPage, itemsPerPage]);

    const handleSort = (key: keyof Framework) => {
        if (sortKey === key) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const getSortIndicator = (key: keyof Framework) => {
        if (sortKey === key) {
            return sortDirection === 'asc' ? ' ▲' : ' ▼';
        }
        return '';
    };

    const statusOptions = useMemo(() => Array.from(new Set(frameworks.map(f => f.status))), [frameworks]);

    if (loading) return <div className="text-gray-400 p-4">Loading frameworks...</div>;

    return (
        <Card title="Frameworks Overview">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <SearchFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Search frameworks..." />
                <DropdownFilter
                    label="Status"
                    options={statusOptions}
                    selectedValue={filterStatus}
                    onValueChange={setFilterStatus}
                    className="flex-grow md:flex-grow-0"
                />
            </div>
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('name')}>Framework{getSortIndicator('name')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('version')}>Version{getSortIndicator('version')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('owner')}>Owner{getSortIndicator('owner')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('status')}>Status{getSortIndicator('status')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('controlCount')}>Controls{getSortIndicator('controlCount')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('riskImpactScore')}>Risk Impact{getSortIndicator('riskImpactScore')}</th>
                            <th scope="col" className="px-6 py-3">Last Reviewed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedFrameworks.map(fw => (
                            <tr key={fw.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium text-white">{fw.name}</td>
                                <td className="px-6 py-4">{fw.version}</td>
                                <td className="px-6 py-4">{fw.owner}</td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={fw.status} type={fw.status === 'Active' ? 'success' : fw.status === 'Under Review' ? 'warning' : 'default'} />
                                </td>
                                <td className="px-6 py-4">{fw.controlCount}</td>
                                <td className="px-6 py-4">{fw.riskImpactScore}</td>
                                <td className="px-6 py-4">{fw.lastReviewed}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </Card>
    );
};

interface PoliciesManagerProps {
    policies: Policy[];
}

export const PoliciesManager: React.FC<PoliciesManagerProps> = ({ policies: initialPolicies }) => {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setPolicies(initialPolicies);
            setLoading(false);
        }, 600);
    }, [initialPolicies]);

    const filteredPolicies = useMemo(() => {
        let filtered = policies.filter(p =>
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.relatedFrameworks.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (filterCategory) {
            filtered = filtered.filter(p => p.category === filterCategory);
        }
        if (filterStatus) {
            filtered = filtered.filter(p => p.status === filterStatus);
        }
        return filtered;
    }, [policies, searchTerm, filterCategory, filterStatus]);

    const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);
    const paginatedPolicies = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredPolicies.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredPolicies, currentPage, itemsPerPage]);

    const categoryOptions = useMemo(() => Array.from(new Set(policies.map(p => p.category))), [policies]);
    const statusOptions = useMemo(() => Array.from(new Set(policies.map(p => p.status))), [policies]);

    if (loading) return <div className="text-gray-400 p-4">Loading policies...</div>;

    return (
        <Card title="Policy Management">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <SearchFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Search policies..." />
                <DropdownFilter label="Category" options={categoryOptions} selectedValue={filterCategory} onValueChange={setFilterCategory} />
                <DropdownFilter label="Status" options={statusOptions} selectedValue={filterStatus} onValueChange={setFilterStatus} />
            </div>
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Title</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Version</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Owner</th>
                            <th scope="col" className="px-6 py-3">Last Updated</th>
                            <th scope="col" className="px-6 py-3">Frameworks</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedPolicies.map(policy => (
                            <tr key={policy.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium text-white">{policy.title}</td>
                                <td className="px-6 py-4">{policy.category}</td>
                                <td className="px-6 py-4">{policy.version}</td>
                                <td className="px-6 py-4">
                                    <StatusBadge
                                        status={policy.status}
                                        type={policy.status === 'Approved' ? 'success' : policy.status === 'Under Review' ? 'warning' : 'default'}
                                    />
                                </td>
                                <td className="px-6 py-4">{policy.owner}</td>
                                <td className="px-6 py-4">{policy.lastUpdated}</td>
                                <td className="px-6 py-4 text-xs">{policy.relatedFrameworks.join(', ')}</td>
                                <td className="px-6 py-4">
                                    <a href={policy.documentLink} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">View</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </Card>
    );
};


interface ControlsDetailsViewProps {
    controls: ControlDetail[];
}

export const ControlsDetailsView: React.FC<ControlsDetailsViewProps> = ({ controls: initialControls }) => {
    const [controls, setControls] = useState<ControlDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterFramework, setFilterFramework] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterComplianceScore, setFilterComplianceScore] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setControls(initialControls);
            setLoading(false);
        }, 700);
    }, [initialControls]);

    const filteredControls = useMemo(() => {
        let filtered = controls.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.frameworkId.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filterFramework) {
            filtered = filtered.filter(c => c.frameworkId === filterFramework);
        }
        if (filterStatus) {
            filtered = filtered.filter(c => c.implementationStatus === filterStatus);
        }
        if (filterComplianceScore) {
            const scoreThreshold = parseInt(filterComplianceScore, 10);
            if (!isNaN(scoreThreshold)) {
                filtered = filtered.filter(c => c.complianceScore >= scoreThreshold);
            }
        }
        return filtered;
    }, [controls, searchTerm, filterFramework, filterStatus, filterComplianceScore]);

    const totalPages = Math.ceil(filteredControls.length / itemsPerPage);
    const paginatedControls = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredControls.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredControls, currentPage, itemsPerPage]);

    const frameworkOptions = useMemo(() => Array.from(new Set(controls.map(c => c.frameworkId))), [controls]);
    const statusOptions = useMemo(() => Array.from(new Set(controls.map(c => c.implementationStatus))), [controls]);
    const complianceScoreOptions = ['60', '70', '80', '90']; // Example thresholds

    const getComplianceScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-400';
        if (score >= 75) return 'text-yellow-400';
        return 'text-red-400';
    };

    if (loading) return <div className="text-gray-400 p-4">Loading control details...</div>;

    return (
        <Card title="Control Details & Testing">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <SearchFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Search controls..." />
                <DropdownFilter label="Framework" options={frameworkOptions} selectedValue={filterFramework} onValueChange={setFilterFramework} />
                <DropdownFilter label="Status" options={statusOptions} selectedValue={filterStatus} onValueChange={setFilterStatus} />
                <DropdownFilter label="Min. Comp. Score" options={complianceScoreOptions} selectedValue={filterComplianceScore} onValueChange={setFilterComplianceScore} />
            </div>
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Control Name</th>
                            <th scope="col" className="px-6 py-3">Framework</th>
                            <th scope="col" className="px-6 py-3">Family</th>
                            <th scope="col" className="px-6 py-3">Type</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Compliance Score</th>
                            <th scope="col" className="px-6 py-3">Last Tested</th>
                            <th scope="col" className="px-6 py-3">Next Due</th>
                            <th scope="col" className="px-6 py-3">Owner</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedControls.map(control => (
                            <tr key={control.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium text-white">{control.name}</td>
                                <td className="px-6 py-4">{control.frameworkId}</td>
                                <td className="px-6 py-4">{control.controlFamily}</td>
                                <td className="px-6 py-4">{control.controlType}</td>
                                <td className="px-6 py-4">
                                    <StatusBadge
                                        status={control.implementationStatus}
                                        type={control.implementationStatus === 'Implemented' ? 'success' : control.implementationStatus === 'Partially Implemented' ? 'warning' : 'default'}
                                    />
                                </td>
                                <td className={`px-6 py-4 font-bold ${getComplianceScoreColor(control.complianceScore)}`}>{control.complianceScore}%</td>
                                <td className="px-6 py-4">{control.lastTested}</td>
                                <td className="px-6 py-4">{control.nextTestDue}</td>
                                <td className="px-6 py-4">{control.owner}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </Card>
    );
};

interface RiskRegisterDashboardProps {
    risks: Risk[];
}

export const RiskRegisterDashboard: React.FC<RiskRegisterDashboardProps> = ({ risks: initialRisks }) => {
    const [risks, setRisks] = useState<Risk[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setRisks(initialRisks);
            setLoading(false);
        }, 800);
    }, [initialRisks]);

    const filteredRisks = useMemo(() => {
        let filtered = risks.filter(r =>
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.owner.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filterCategory) {
            filtered = filtered.filter(r => r.category === filterCategory);
        }
        if (filterStatus) {
            filtered = filtered.filter(r => r.status === filterStatus);
        }
        return filtered;
    }, [risks, searchTerm, filterCategory, filterStatus]);

    const sortedRisks = useMemo(() => {
        return [...filteredRisks].sort((a, b) => b.severityScore - a.severityScore); // Sort by severity descending
    }, [filteredRisks]);

    const totalPages = Math.ceil(sortedRisks.length / itemsPerPage);
    const paginatedRisks = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedRisks.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedRisks, currentPage, itemsPerPage]);

    const categoryOptions = useMemo(() => Array.from(new Set(risks.map(r => r.category))), [risks]);
    const statusOptions = useMemo(() => Array.from(new Set(risks.map(r => r.status))), [risks]);

    const getSeverityColor = (score: number) => {
        if (score >= 15) return 'bg-red-500/20 text-red-300'; // High severity (e.g., 3*5, 4*4)
        if (score >= 9) return 'bg-orange-500/20 text-orange-300'; // Medium-high (e.g., 3*3, 3*4)
        if (score >= 4) return 'bg-yellow-500/20 text-yellow-300'; // Medium (e.g., 2*2, 2*3)
        return 'bg-green-500/20 text-green-300'; // Low
    };

    const riskSeverityData = useMemo(() => {
        const counts: { [key: string]: number } = {
            'High': 0, 'Medium': 0, 'Low': 0, 'Very Low': 0
        };
        risks.forEach(risk => {
            if (risk.severityScore >= 15) counts['High']++;
            else if (risk.severityScore >= 9) counts['Medium']++;
            else if (risk.severityScore >= 4) counts['Low']++;
            else counts['Very Low']++;
        });
        return Object.keys(counts).map(key => ({
            name: key,
            value: counts[key],
        }));
    }, [risks]);

    const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e']; // Red, Orange, Yellow, Green for severity

    if (loading) return <div className="text-gray-400 p-4">Loading risk register...</div>;

    return (
        <Card title="Risk Register Dashboard">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card title="Risk Severity Distribution" className="lg:col-span-1">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={riskSeverityData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {riskSeverityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Risk Status Overview" className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                            data={Object.entries(risks.reduce((acc, risk) => {
                                acc[risk.status] = (acc[risk.status] || 0) + 1;
                                return acc;
                            }, {} as Record<string, number>)).map(([name, count]) => ({ name, count }))}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                            <Legend />
                            <Bar dataKey="count" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <SearchFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Search risks..." />
                <DropdownFilter label="Category" options={categoryOptions} selectedValue={filterCategory} onValueChange={setFilterCategory} />
                <DropdownFilter label="Status" options={statusOptions} selectedValue={filterStatus} onValueChange={setFilterStatus} />
            </div>
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Risk Name</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Likelihood</th>
                            <th scope="col" className="px-6 py-3">Impact</th>
                            <th scope="col" className="px-6 py-3">Severity</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Owner</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRisks.map(risk => (
                            <tr key={risk.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium text-white">{risk.name}</td>
                                <td className="px-6 py-4">{risk.category}</td>
                                <td className="px-6 py-4">{risk.likelihood}</td>
                                <td className="px-6 py-4">{risk.impact}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(risk.severityScore)}`}>
                                        {risk.severityScore}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge
                                        status={risk.status}
                                        type={risk.status === 'Mitigated' ? 'success' : risk.status === 'Open' ? 'error' : risk.status === 'Accepted' ? 'info' : 'default'}
                                    />
                                </td>
                                <td className="px-6 py-4">{risk.owner}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </Card>
    );
};


interface IssueTrackingSystemProps {
    issues: Issue[];
    remediationPlans: RemediationPlan[];
}

export const IssueTrackingSystem: React.FC<IssueTrackingSystemProps> = ({ issues: initialIssues, remediationPlans: initialRemediationPlans }) => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [remediationPlans, setRemediationPlans] = useState<RemediationPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setIssues(initialIssues);
            setRemediationPlans(initialRemediationPlans);
            setLoading(false);
        }, 900);
    }, [initialIssues, initialRemediationPlans]);

    const filteredIssues = useMemo(() => {
        let filtered = issues.filter(issue =>
            issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filterType) {
            filtered = filtered.filter(issue => issue.type === filterType);
        }
        if (filterSeverity) {
            filtered = filtered.filter(issue => issue.severity === filterSeverity);
        }
        if (filterStatus) {
            filtered = filtered.filter(issue => issue.status === filterStatus);
        }
        return filtered;
    }, [issues, searchTerm, filterType, filterSeverity, filterStatus]);

    const sortedIssues = useMemo(() => {
        return [...filteredIssues].sort((a, b) => {
            const severityOrder: Record<Issue['severity'], number> = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        });
    }, [filteredIssues]);

    const totalPages = Math.ceil(sortedIssues.length / itemsPerPage);
    const paginatedIssues = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedIssues.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedIssues, currentPage, itemsPerPage]);

    const typeOptions = useMemo(() => Array.from(new Set(issues.map(i => i.type))), [issues]);
    const severityOptions = useMemo(() => Array.from(new Set(issues.map(i => i.severity))), [issues]);
    const statusOptions = useMemo(() => Array.from(new Set(issues.map(i => i.status))), [issues]);

    const getIssueSeverityBadge = (severity: Issue['severity']) => {
        switch (severity) {
            case 'Critical': return <StatusBadge status={severity} type="error" />;
            case 'High': return <StatusBadge status={severity} type="warning" />;
            case 'Medium': return <StatusBadge status={severity} type="info" />;
            case 'Low': return <StatusBadge status={severity} type="success" />;
            default: return <StatusBadge status={severity} type="default" />;
        }
    };

    const getIssueStatusBadge = (status: Issue['status']) => {
        switch (status) {
            case 'Open': return <StatusBadge status={status} type="error" />;
            case 'In Progress': return <StatusBadge status={status} type="warning" />;
            case 'Awaiting Review': return <StatusBadge status={status} type="info" />;
            case 'Closed': return <StatusBadge status={status} type="success" />;
            default: return <StatusBadge status={status} type="default" />;
        }
    };

    const issueStatusChartData = useMemo(() => {
        const statusCounts = issues.reduce((acc, issue) => {
            acc[issue.status] = (acc[issue.status] || 0) + 1;
            return acc;
        }, {} as Record<Issue['status'], number>);
        return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    }, [issues]);

    const issueTypeChartData = useMemo(() => {
        const typeCounts = issues.reduce((acc, issue) => {
            acc[issue.type] = (acc[issue.type] || 0) + 1;
            return acc;
        }, {} as Record<Issue['type'], number>);
        return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
    }, [issues]);

    const issueSeverityChartData = useMemo(() => {
        const severityCounts = issues.reduce((acc, issue) => {
            acc[issue.severity] = (acc[issue.severity] || 0) + 1;
            return acc;
        }, {} as Record<Issue['severity'], number>);
        const order: Issue['severity'][] = ['Critical', 'High', 'Medium', 'Low'];
        return order.map(sev => ({ name: sev, count: severityCounts[sev] || 0 }));
    }, [issues]);

    const PIE_COLORS_STATUS = ['#ef4444', '#f97316', '#3b82f6', '#10b981']; // Red (Open), Orange (In Progress), Blue (Awaiting), Green (Closed)
    const BAR_COLORS_SEVERITY = ['#ef4444', '#f97316', '#eab308', '#22c55e']; // Critical, High, Medium, Low

    const openIssueModal = (issue: Issue) => {
        setSelectedIssue(issue);
        setIsModalOpen(true);
    };

    const closeIssueModal = () => {
        setIsModalOpen(false);
        setSelectedIssue(null);
    };

    if (loading) return <div className="text-gray-400 p-4">Loading issues...</div>;

    return (
        <Card title="Issue Tracking System">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card title="Issues by Status">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={issueStatusChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {issueStatusChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS_STATUS[index % PIE_COLORS_STATUS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Issues by Severity">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                            data={issueSeverityChartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                            <Legend />
                            <Bar dataKey="count">
                                {issueSeverityChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={BAR_COLORS_SEVERITY[index % BAR_COLORS_SEVERITY.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <SearchFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Search issues..." />
                <DropdownFilter label="Type" options={typeOptions} selectedValue={filterType} onValueChange={setFilterType} />
                <DropdownFilter label="Severity" options={severityOptions} selectedValue={filterSeverity} onValueChange={setFilterSeverity} />
                <DropdownFilter label="Status" options={statusOptions} selectedValue={filterStatus} onValueChange={setFilterStatus} />
            </div>
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Title</th>
                            <th scope="col" className="px-6 py-3">Type</th>
                            <th scope="col" className="px-6 py-3">Severity</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Assigned To</th>
                            <th scope="col" className="px-6 py-3">Due Date</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedIssues.map(issue => (
                            <tr key={issue.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium text-white">{issue.title}</td>
                                <td className="px-6 py-4">{issue.type}</td>
                                <td className="px-6 py-4">{getIssueSeverityBadge(issue.severity)}</td>
                                <td className="px-6 py-4">{getIssueStatusBadge(issue.status)}</td>
                                <td className="px-6 py-4">{issue.assignedTo}</td>
                                <td className="px-6 py-4">{issue.dueDate}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => openIssueModal(issue)} className="text-cyan-400 hover:underline text-sm">View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

            <Modal isOpen={isModalOpen} onClose={closeIssueModal} title={selectedIssue ? `Issue: ${selectedIssue.title}` : "Issue Details"}>
                {selectedIssue && (
                    <div className="space-y-4">
                        <p><strong>ID:</strong> {selectedIssue.id}</p>
                        <p><strong>Description:</strong> {selectedIssue.description}</p>
                        <p><strong>Type:</strong> {selectedIssue.type}</p>
                        <p><strong>Severity:</strong> {getIssueSeverityBadge(selectedIssue.severity)}</p>
                        <p><strong>Status:</strong> {getIssueStatusBadge(selectedIssue.status)}</p>
                        <p><strong>Assigned To:</strong> {selectedIssue.assignedTo}</p>
                        <p><strong>Opened Date:</strong> {selectedIssue.openedDate}</p>
                        <p><strong>Due Date:</strong> {selectedIssue.dueDate}</p>
                        {selectedIssue.closedDate && <p><strong>Closed Date:</strong> {selectedIssue.closedDate}</p>}
                        {selectedIssue.relatedControlId && <p><strong>Related Control:</strong> {selectedIssue.relatedControlId}</p>}
                        {selectedIssue.relatedRiskId && <p><strong>Related Risk:</strong> {selectedIssue.relatedRiskId}</p>}
                        {selectedIssue.remediationPlanId && (
                            <p>
                                <strong>Remediation Plan:</strong> {selectedIssue.remediationPlanId} (
                                <span className="text-cyan-400 hover:underline cursor-pointer" onClick={() => alert(`Showing details for remediation plan ${selectedIssue.remediationPlanId}`)}>
                                    View Plan
                                </span>)
                            </p>
                        )}
                        <div className="pt-4 border-t border-gray-700 mt-4">
                            <h4 className="text-lg font-semibold text-white mb-2">Progress & Updates</h4>
                            <ul className="list-disc list-inside text-gray-400 space-y-2">
                                <li>{generateDate(getRandomInt(1, 10), false)}: Initial assessment completed.</li>
                                <li>{generateDate(getRandomInt(11, 20), false)}: Remediation action started.</li>
                                {selectedIssue.status === 'Closed' && <li>{selectedIssue.closedDate}: Issue successfully resolved and verified.</li>}
                            </ul>
                            <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">Add Update</button>
                        </div>
                    </div>
                )}
            </Modal>
        </Card>
    );
};

interface RemediationPlansManagerProps {
    remediationPlans: RemediationPlan[];
}

export const RemediationPlansManager: React.FC<RemediationPlansManagerProps> = ({ remediationPlans: initialRemediationPlans }) => {
    const [remediationPlans, setRemediationPlans] = useState<RemediationPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setRemediationPlans(initialRemediationPlans);
            setLoading(false);
        }, 600);
    }, [initialRemediationPlans]);

    const filteredPlans = useMemo(() => {
        let filtered = remediationPlans.filter(plan =>
            plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            plan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            plan.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filterStatus) {
            filtered = filtered.filter(plan => plan.status === filterStatus);
        }
        if (filterPriority) {
            filtered = filtered.filter(plan => plan.priority === filterPriority);
        }
        return filtered;
    }, [remediationPlans, searchTerm, filterStatus, filterPriority]);

    const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
    const paginatedPlans = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredPlans.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredPlans, currentPage, itemsPerPage]);

    const statusOptions = useMemo(() => Array.from(new Set(remediationPlans.map(p => p.status))), [remediationPlans]);
    const priorityOptions = useMemo(() => Array.from(new Set(remediationPlans.map(p => p.priority))), [remediationPlans]);

    const getPlanStatusBadge = (status: RemediationPlan['status']) => {
        switch (status) {
            case 'Planned': return <StatusBadge status={status} type="info" />;
            case 'In Progress': return <StatusBadge status={status} type="warning" />;
            case 'Completed': return <StatusBadge status={status} type="success" />;
            case 'Delayed': return <StatusBadge status={status} type="error" />;
            default: return <StatusBadge status={status} type="default" />;
        }
    };

    if (loading) return <div className="text-gray-400 p-4">Loading remediation plans...</div>;

    return (
        <Card title="Remediation Plans Manager">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <SearchFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Search plans..." />
                <DropdownFilter label="Status" options={statusOptions} selectedValue={filterStatus} onValueChange={setFilterStatus} />
                <DropdownFilter label="Priority" options={priorityOptions} selectedValue={filterPriority} onValueChange={setFilterPriority} />
            </div>
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Title</th>
                            <th scope="col" className="px-6 py-3">Assigned To</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Priority</th>
                            <th scope="col" className="px-6 py-3">Target Completion</th>
                            <th scope="col" className="px-6 py-3">Progress</th>
                            <th scope="col" className="px-6 py-3">Cost Est.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedPlans.map(plan => (
                            <tr key={plan.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium text-white">{plan.title}</td>
                                <td className="px-6 py-4">{plan.assignedTo}</td>
                                <td className="px-6 py-4">{getPlanStatusBadge(plan.status)}</td>
                                <td className="px-6 py-4">{plan.priority}</td>
                                <td className="px-6 py-4">{plan.targetCompletionDate}</td>
                                <td className="px-6 py-4">
                                    <div className="w-24 bg-gray-700 rounded-full h-2.5">
                                        <div
                                            className="bg-cyan-600 h-2.5 rounded-full"
                                            style={{ width: `${plan.progressPercentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="ml-2 text-xs text-gray-400">{plan.progressPercentage}%</span>
                                </td>
                                <td className="px-6 py-4">${plan.costEstimate.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </Card>
    );
};

interface AuditFindingsReporterProps {
    auditFindings: AuditFinding[];
}

export const AuditFindingsReporter: React.FC<AuditFindingsReporterProps> = ({ auditFindings: initialAuditFindings }) => {
    const [auditFindings, setAuditFindings] = useState<AuditFinding[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setAuditFindings(initialAuditFindings);
            setLoading(false);
        }, 700);
    }, [initialAuditFindings]);

    const filteredFindings = useMemo(() => {
        let filtered = auditFindings.filter(finding =>
            finding.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            finding.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filterSeverity) {
            filtered = filtered.filter(finding => finding.severity === filterSeverity);
        }
        if (filterStatus) {
            filtered = filtered.filter(finding => finding.status === filterStatus);
        }
        return filtered;
    }, [auditFindings, searchTerm, filterSeverity, filterStatus]);

    const totalPages = Math.ceil(filteredFindings.length / itemsPerPage);
    const paginatedFindings = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredFindings.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredFindings, currentPage, itemsPerPage]);

    const severityOptions = useMemo(() => Array.from(new Set(auditFindings.map(f => f.severity))), [auditFindings]);
    const statusOptions = useMemo(() => Array.from(new Set(auditFindings.map(f => f.status))), [auditFindings]);

    const getFindingSeverityBadge = (severity: AuditFinding['severity']) => {
        switch (severity) {
            case 'Critical': return <StatusBadge status={severity} type="error" />;
            case 'Major': return <StatusBadge status={severity} type="warning" />;
            case 'Minor': return <StatusBadge status={severity} type="info" />;
            case 'Observation': return <StatusBadge status={severity} type="default" />;
            default: return <StatusBadge status={severity} type="default" />;
        }
    };

    if (loading) return <div className="text-gray-400 p-4">Loading audit findings...</div>;

    return (
        <Card title="Audit Findings Report">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <SearchFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Search findings..." />
                <DropdownFilter label="Severity" options={severityOptions} selectedValue={filterSeverity} onValueChange={setFilterSeverity} />
                <DropdownFilter label="Status" options={statusOptions} selectedValue={filterStatus} onValueChange={setFilterStatus} />
            </div>
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Finding Title</th>
                            <th scope="col" className="px-6 py-3">Audit ID</th>
                            <th scope="col" className="px-6 py-3">Severity</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Reported Date</th>
                            <th scope="col" className="px-6 py-3">Due Date</th>
                            <th scope="col" className="px-6 py-3">Related Controls</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedFindings.map(finding => (
                            <tr key={finding.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium text-white">{finding.title}</td>
                                <td className="px-6 py-4">{finding.auditId}</td>
                                <td className="px-6 py-4">{getFindingSeverityBadge(finding.severity)}</td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={finding.status} type={finding.status === 'Resolved' ? 'success' : finding.status === 'Open' ? 'error' : 'default'} />
                                </td>
                                <td className="px-6 py-4">{finding.reportedDate}</td>
                                <td className="px-6 py-4">{finding.dueDate}</td>
                                <td className="px-6 py-4 text-xs">{finding.relatedControlIds.join(', ')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </Card>
    );
};

interface VendorComplianceMonitorProps {
    vendors: Vendor[];
}

export const VendorComplianceMonitor: React.FC<VendorComplianceMonitorProps> = ({ vendors: initialVendors }) => {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCriticality, setFilterCriticality] = useState('');
    const [filterComplianceStatus, setFilterComplianceStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setVendors(initialVendors);
            setLoading(false);
        }, 800);
    }, [initialVendors]);

    const filteredVendors = useMemo(() => {
        let filtered = vendors.filter(vendor =>
            vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.serviceProvided.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filterCriticality) {
            filtered = filtered.filter(vendor => vendor.criticality === filterCriticality);
        }
        if (filterComplianceStatus) {
            filtered = filtered.filter(vendor => vendor.complianceStatus === filterComplianceStatus);
        }
        return filtered;
    }, [vendors, searchTerm, filterCriticality, filterComplianceStatus]);

    const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
    const paginatedVendors = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredVendors.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredVendors, currentPage, itemsPerPage]);

    const criticalityOptions = useMemo(() => Array.from(new Set(vendors.map(v => v.criticality))), [vendors]);
    const complianceStatusOptions = useMemo(() => Array.from(new Set(vendors.map(v => v.complianceStatus))), [vendors]);

    const getComplianceStatusBadge = (status: Vendor['complianceStatus']) => {
        switch (status) {
            case 'Compliant': return <StatusBadge status={status} type="success" />;
            case 'Non-Compliant': return <StatusBadge status={status} type="error" />;
            case 'Pending Review': return <StatusBadge status={status} type="warning" />;
            default: return <StatusBadge status={status} type="default" />;
        }
    };

    const getRiskScoreColor = (score: number) => {
        if (score > 75) return 'text-red-400';
        if (score > 50) return 'text-yellow-400';
        return 'text-green-400';
    };

    if (loading) return <div className="text-gray-400 p-4">Loading vendor compliance...</div>;

    return (
        <Card title="Vendor Compliance Monitor">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <SearchFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Search vendors..." />
                <DropdownFilter label="Criticality" options={criticalityOptions} selectedValue={filterCriticality} onValueChange={setFilterCriticality} />
                <DropdownFilter label="Compliance Status" options={complianceStatusOptions} selectedValue={filterComplianceStatus} onValueChange={setFilterComplianceStatus} />
            </div>
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Vendor Name</th>
                            <th scope="col" className="px-6 py-3">Service Provided</th>
                            <th scope="col" className="px-6 py-3">Criticality</th>
                            <th scope="col" className="px-6 py-3">Compliance Status</th>
                            <th scope="col" className="px-6 py-3">Risk Score</th>
                            <th scope="col" className="px-6 py-3">Next Assessment Due</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedVendors.map(vendor => (
                            <tr key={vendor.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium text-white">{vendor.name}</td>
                                <td className="px-6 py-4">{vendor.serviceProvided}</td>
                                <td className="px-6 py-4">{vendor.criticality}</td>
                                <td className="px-6 py-4">{getComplianceStatusBadge(vendor.complianceStatus)}</td>
                                <td className="px-6 py-4">
                                    <span className={`font-bold ${getRiskScoreColor(vendor.riskScore)}`}>{vendor.riskScore}</span>
                                </td>
                                <td className="px-6 py-4">{vendor.nextAssessmentDue}</td>
                                <td className="px-6 py-4">
                                    <a href={vendor.documentLinks[0]} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-sm">View Docs</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </Card>
    );
};


interface ComplianceTrainingTrackerProps {
    trainings: ComplianceTraining[];
}

export const ComplianceTrainingTracker: React.FC<ComplianceTrainingTrackerProps> = ({ trainings: initialTrainings }) => {
    const [trainings, setTrainings] = useState<ComplianceTraining[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterModule, setFilterModule] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setTrainings(initialTrainings);
            setLoading(false);
        }, 600);
    }, [initialTrainings]);

    const filteredTrainings = useMemo(() => {
        let filtered = trainings.filter(t =>
            t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.courseModule.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filterStatus) {
            filtered = filtered.filter(t => t.completionStatus === filterStatus);
        }
        if (filterModule) {
            filtered = filtered.filter(t => t.courseModule === filterModule);
        }
        return filtered;
    }, [trainings, searchTerm, filterStatus, filterModule]);

    const totalPages = Math.ceil(filteredTrainings.length / itemsPerPage);
    const paginatedTrainings = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredTrainings.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredTrainings, currentPage, itemsPerPage]);

    const statusOptions = useMemo(() => Array.from(new Set(trainings.map(t => t.completionStatus))), [trainings]);
    const moduleOptions = useMemo(() => Array.from(new Set(trainings.map(t => t.courseModule))), [trainings]);

    const getCompletionStatusBadge = (status: ComplianceTraining['completionStatus']) => {
        switch (status) {
            case 'Completed': return <StatusBadge status={status} type="success" />;
            case 'In Progress': return <StatusBadge status={status} type="info" />;
            case 'Not Started': return <StatusBadge status={status} type="default" />;
            case 'Overdue': return <StatusBadge status={status} type="error" />;
            default: return <StatusBadge status={status} type="default" />;
        }
    };

    if (loading) return <div className="text-gray-400 p-4">Loading training records...</div>;

    return (
        <Card title="Compliance Training Tracker">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <SearchFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Search trainings by title/employee..." />
                <DropdownFilter label="Completion Status" options={statusOptions} selectedValue={filterStatus} onValueChange={setFilterStatus} />
                <DropdownFilter label="Course Module" options={moduleOptions} selectedValue={filterModule} onValueChange={setFilterModule} />
            </div>
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Training Title</th>
                            <th scope="col" className="px-6 py-3">Employee ID</th>
                            <th scope="col" className="px-6 py-3">Course Module</th>
                            <th scope="col" className="px-6 py-3">Assignment Status</th>
                            <th scope="col" className="px-6 py-3">Completion Status</th>
                            <th scope="col" className="px-6 py-3">Due Date</th>
                            <th scope="col" className="px-6 py-3">Completion Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedTrainings.map(training => (
                            <tr key={training.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium text-white">{training.title}</td>
                                <td className="px-6 py-4">{training.employeeId}</td>
                                <td className="px-6 py-4">{training.courseModule}</td>
                                <td className="px-6 py-4"><StatusBadge status={training.status} type={training.status === 'Mandatory' ? 'error' : 'default'} /></td>
                                <td className="px-6 py-4">{getCompletionStatusBadge(training.completionStatus)}</td>
                                <td className="px-6 py-4">{training.dueDate}</td>
                                <td className="px-6 py-4">{training.completionDate || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </Card>
    );
};

interface RegulatoryUpdateFeedProps {
    updates: RegulatoryUpdate[];
}

export const RegulatoryUpdateFeed: React.FC<RegulatoryUpdateFeedProps> = ({ updates: initialUpdates }) => {
    const [updates, setUpdates] = useState<RegulatoryUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSource, setFilterSource] = useState('');
    const [filterImpactStatus, setFilterImpactStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            // Sort by effective date descending for a feed
            const sorted = [...initialUpdates].sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
            setUpdates(sorted);
            setLoading(false);
        }, 500);
    }, [initialUpdates]);

    const filteredUpdates = useMemo(() => {
        let filtered = updates.filter(update =>
            update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            update.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
            update.source.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filterSource) {
            filtered = filtered.filter(update => update.source === filterSource);
        }
        if (filterImpactStatus) {
            filtered = filtered.filter(update => update.impactAssessmentStatus === filterImpactStatus);
        }
        return filtered;
    }, [updates, searchTerm, filterSource, filterImpactStatus]);

    const totalPages = Math.ceil(filteredUpdates.length / itemsPerPage);
    const paginatedUpdates = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredUpdates.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredUpdates, currentPage, itemsPerPage]);

    const sourceOptions = useMemo(() => Array.from(new Set(updates.map(u => u.source))), [updates]);
    const impactStatusOptions = useMemo(() => Array.from(new Set(updates.map(u => u.impactAssessmentStatus))), [updates]);

    const getImpactStatusBadge = (status: RegulatoryUpdate['impactAssessmentStatus']) => {
        switch (status) {
            case 'Assessed - Impacted': return <StatusBadge status={status} type="error" />;
            case 'In Progress': return <StatusBadge status={status} type="warning" />;
            case 'Assessed - No Impact': return <StatusBadge status={status} type="success" />;
            default: return <StatusBadge status={status} type="default" />;
        }
    };

    if (loading) return <div className="text-gray-400 p-4">Loading regulatory updates...</div>;

    return (
        <Card title="Regulatory Updates Feed">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <SearchFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Search updates..." />
                <DropdownFilter label="Source" options={sourceOptions} selectedValue={filterSource} onValueChange={setFilterSource} />
                <DropdownFilter label="Impact Status" options={impactStatusOptions} selectedValue={filterImpactStatus} onValueChange={setFilterImpactStatus} />
            </div>
            <div className="space-y-4">
                {paginatedUpdates.map(update => (
                    <div key={update.id} className="p-4 bg-gray-800/50 rounded-md border border-gray-700 hover:border-cyan-500 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-white">{update.title}</h3>
                            <span className="text-sm text-gray-400">{update.effectiveDate}</span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{update.summary}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-medium text-cyan-300">{update.source}</span>
                            {getImpactStatusBadge(update.impactAssessmentStatus)}
                            {update.applicableFrameworks.map(fw => (
                                <span key={fw} className="px-2 py-0.5 bg-gray-700 rounded-full text-gray-400">{fw}</span>
                            ))}
                            {update.documentLink && (
                                <a href={update.documentLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-auto">View Document</a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </Card>
    );
};

interface DocumentRepositoryProps {
    documents: Document[];
}

export const DocumentRepository: React.FC<DocumentRepositoryProps> = ({ documents: initialDocuments }) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setDocuments(initialDocuments);
            setLoading(false);
        }, 600);
    }, [initialDocuments]);

    const filteredDocuments = useMemo(() => {
        let filtered = documents.filter(doc =>
            doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
            doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filterType) {
            filtered = filtered.filter(doc => doc.type === filterType);
        }
        if (filterCategory) {
            filtered = filtered.filter(doc => doc.category === filterCategory);
        }
        return filtered;
    }, [documents, searchTerm, filterType, filterCategory]);

    const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
    const paginatedDocuments = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredDocuments.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredDocuments, currentPage, itemsPerPage]);

    const typeOptions = useMemo(() => Array.from(new Set(documents.map(d => d.type))), [documents]);
    const categoryOptions = useMemo(() => Array.from(new Set(documents.map(d => d.category))), [documents]);

    if (loading) return <div className="text-gray-400 p-4">Loading documents...</div>;

    return (
        <Card title="Document Repository">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <SearchFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Search documents..." />
                <DropdownFilter label="Type" options={typeOptions} selectedValue={filterType} onValueChange={setFilterType} />
                <DropdownFilter label="Category" options={categoryOptions} selectedValue={filterCategory} onValueChange={setFilterCategory} />
            </div>
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Document Name</th>
                            <th scope="col" className="px-6 py-3">Type</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Version</th>
                            <th scope="col" className="px-6 py-3">Upload Date</th>
                            <th scope="col" className="px-6 py-3">Uploaded By</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedDocuments.map(doc => (
                            <tr key={doc.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4 font-medium text-white">{doc.name}</td>
                                <td className="px-6 py-4">{doc.type}</td>
                                <td className="px-6 py-4">{doc.category}</td>
                                <td className="px-6 py-4">{doc.version}</td>
                                <td className="px-6 py-4">{doc.uploadDate}</td>
                                <td className="px-6 py-4">{doc.uploadedBy}</td>
                                <td className="px-6 py-4">
                                    <a href={doc.link} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-sm">Download</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </Card>
    );
};


interface ComplianceCalendarEvent {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    type: 'Audit' | 'Review' | 'Deadline' | 'Training';
    status: 'Upcoming' | 'Completed' | 'Overdue';
    link?: string;
}

export const ComplianceCalendar: React.FC = () => {
    const [events, setEvents] = useState<ComplianceCalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    // Combine data from various sources to create calendar events
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            const generatedEvents: ComplianceCalendarEvent[] = [];

            // From active audits
            activeAudits.forEach(audit => generatedEvents.push({
                id: `AUDIT-${audit.id}`,
                title: `${audit.framework} Audit`,
                date: audit.dueDate,
                type: 'Audit',
                status: audit.status === 'Scheduled' ? 'Upcoming' : 'Overdue', // Simplified
                link: `/audits/${audit.id}`
            }));

            // From control details (next test due)
            mockControlDetails.slice(0, 50).forEach(control => generatedEvents.push({ // Limit for demo
                id: `CTLTEST-${control.id}`,
                title: `Control Test: ${control.name}`,
                date: control.nextTestDue,
                type: 'Review',
                status: new Date(control.nextTestDue) > new Date() ? 'Upcoming' : 'Overdue',
                link: `/controls/${control.id}`
            }));

            // From issues (due date)
            mockIssues.slice(0, 50).forEach(issue => generatedEvents.push({ // Limit for demo
                id: `ISSUE-${issue.id}`,
                title: `Issue Resolution: ${issue.title}`,
                date: issue.dueDate,
                type: 'Deadline',
                status: new Date(issue.dueDate) > new Date() && issue.status !== 'Closed' ? 'Upcoming' : (issue.status === 'Closed' ? 'Completed' : 'Overdue'),
                link: `/issues/${issue.id}`
            }));

            // From remediation plans (target completion)
            mockRemediationPlans.slice(0, 30).forEach(plan => generatedEvents.push({ // Limit for demo
                id: `REMPLAN-${plan.id}`,
                title: `Remediation Plan: ${plan.title}`,
                date: plan.targetCompletionDate,
                type: 'Deadline',
                status: new Date(plan.targetCompletionDate) > new Date() && plan.status !== 'Completed' ? 'Upcoming' : (plan.status === 'Completed' ? 'Completed' : 'Overdue'),
                link: `/remediation/${plan.id}`
            }));

            // From compliance training (due date)
            mockComplianceTraining.slice(0, 50).forEach(training => generatedEvents.push({ // Limit for demo
                id: `TRAIN-${training.id}`,
                title: `Complete Training: ${training.title} (${training.employeeId})`,
                date: training.dueDate,
                type: 'Training',
                status: new Date(training.dueDate) > new Date() && training.completionStatus !== 'Completed' ? 'Upcoming' : (training.completionStatus === 'Completed' ? 'Completed' : 'Overdue'),
                link: `/training/${training.id}`
            }));

            // Sort events by date
            generatedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setEvents(generatedEvents);
            setLoading(false);
        }, 800);
    }, []);

    const getEventTypeColor = (type: ComplianceCalendarEvent['type']) => {
        switch (type) {
            case 'Audit': return 'bg-purple-500/20 text-purple-300';
            case 'Review': return 'bg-blue-500/20 text-blue-300';
            case 'Deadline': return 'bg-red-500/20 text-red-300';
            case 'Training': return 'bg-green-500/20 text-green-300';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };

    const getEventStatusBadge = (status: ComplianceCalendarEvent['status']) => {
        switch (status) {
            case 'Upcoming': return <StatusBadge status={status} type="info" />;
            case 'Completed': return <StatusBadge status={status} type="success" />;
            case 'Overdue': return <StatusBadge status={status} type="error" />;
            default: return <StatusBadge status={status} type="default" />;
        }
    };

    if (loading) return <div className="text-gray-400 p-4">Loading compliance calendar...</div>;

    return (
        <Card title="Compliance Calendar">
            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                {events.length === 0 && <p className="text-gray-400">No upcoming compliance events.</p>}
                {events.map(event => (
                    <div key={event.id} className="p-3 bg-gray-800/50 rounded-md border border-gray-700 flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold ${getEventTypeColor(event.type)}`}>
                                {event.date.substring(5, 10).replace('-', '/')}
                            </span>
                        </div>
                        <div className="flex-grow">
                            <p className="text-white font-medium">{event.title}</p>
                            <div className="flex items-center text-xs text-gray-400 mt-1 space-x-2">
                                <span className={`px-2 py-0.5 rounded-full ${getEventTypeColor(event.type)}`}>{event.type}</span>
                                {getEventStatusBadge(event.status)}
                                <span className="ml-2">Due: {event.date}</span>
                            </div>
                        </div>
                        {event.link && (
                            <a href={event.link} className="flex-shrink-0 text-cyan-400 hover:underline text-sm self-center">View</a>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
};

export const ComplianceAnalyticsDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>({});

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            // Aggregate data for various charts
            const issuesByMonth = mockIssues.reduce((acc, issue) => {
                const month = issue.openedDate.substring(0, 7);
                acc[month] = (acc[month] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const sortedIssuesByMonth = Object.entries(issuesByMonth)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([name, value]) => ({ name, value }));

            const controlComplianceTrend = Array.from({ length: 12 }).map((_, i) => {
                const month = new Date(2024, i, 1).toISOString().substring(0, 7);
                const avgScore = getRandomInt(70, 99);
                return { name: month, 'Avg Score': avgScore };
            });

            const topFailingControls = [...mockControlDetails]
                .filter(c => c.complianceScore < 80)
                .sort((a, b) => a.complianceScore - b.complianceScore)
                .slice(0, 10)
                .map(c => ({ name: c.id, 'Failed Score': 100 - c.complianceScore }));

            const riskCategoryDistribution = mockRisks.reduce((acc, risk) => {
                acc[risk.category] = (acc[risk.category] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            const riskCategoryChartData = Object.entries(riskCategoryDistribution).map(([name, value]) => ({ name, value }));

            setData({
                issuesByMonth: sortedIssuesByMonth,
                controlComplianceTrend,
                topFailingControls,
                riskCategoryChartData,
            });
            setLoading(false);
        }, 1000);
    }, []);

    const PIE_COLORS_RISK_CATEGORY = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

    if (loading) return <div className="text-gray-400 p-4">Loading analytics dashboard...</div>;

    return (
        <Card title="Compliance Analytics Dashboard">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <Card title="Monthly Issues Opened">
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={data.issuesByMonth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                            <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f680" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="Average Control Compliance Score Trend">
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={data.controlComplianceTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" domain={[60, 100]} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                            <Legend />
                            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                            <Line type="monotone" dataKey="Avg Score" stroke="#10b981" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="Top 10 Failing Controls">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={data.topFailingControls} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis type="number" stroke="#9ca3af" />
                            <YAxis type="category" dataKey="name" stroke="#9ca3af" width={120} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                            <Legend />
                            <Bar dataKey="Failed Score" fill="#ef4444" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="Risk Category Distribution" className="lg:col-span-1">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={data.riskCategoryChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {data.riskCategoryChartData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS_RISK_CATEGORY[index % PIE_COLORS_RISK_CATEGORY.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="Compliance Score by Framework" className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={250}>
                        <ComposedChart
                            width={500}
                            height={400}
                            data={controlStatusData.map(d => ({
                                name: d.name,
                                Passed: d.Passed,
                                Failed: d.Failed,
                                Total: d.Passed + d.Failed + (d['Not Applicable'] || 0),
                                Compliance: (d.Passed / (d.Passed + d.Failed)) * 100 || 0
                            }))}
                            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                        >
                            <CartesianGrid stroke="#4b5563" strokeDasharray="3 3" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis yAxisId="left" orientation="left" stroke="#9ca3af" />
                            <YAxis yAxisId="right" orientation="right" stroke="#10b981" label={{ value: 'Compliance %', angle: -90, position: 'insideRight', fill: '#10b981' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                            <Legend />
                            <Area yAxisId="left" type="monotone" dataKey="Total" fill="#6b7280" stroke="#6b7280" />
                            <Bar yAxisId="left" dataKey="Failed" fill="#ef4444" />
                            <Bar yAxisId="left" dataKey="Passed" fill="#10b981" />
                            <Line yAxisId="right" type="monotone" dataKey="Compliance" stroke="#22d3ee" strokeWidth={2} dot={{ r: 4 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </Card>
    );
};

// Main Compliance Hub View
const DemoBankComplianceHubView: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderContent = useCallback(() => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="text-center"><p className="text-3xl font-bold text-white">{mockFrameworks.length}</p><p className="text-sm text-gray-400 mt-1">Frameworks Covered</p></Card>
                            <Card className="text-center"><p className="text-3xl font-bold text-white">{(mockControlDetails.filter(c => c.complianceScore >= 90).length / mockControlDetails.length * 100).toFixed(1)}%</p><p className="text-sm text-gray-400 mt-1">Controls Passing</p></Card>
                            <Card className="text-center"><p className="text-3xl font-bold text-white">{mockControlDetails.filter(c => c.complianceScore < 70).length}</p><p className="text-sm text-gray-400 mt-1">Failing Controls</p></Card>
                            <Card className="text-center"><p className="text-3xl font-bold text-white">{mockIssues.filter(i => i.status !== 'Closed').length}</p><p className="text-sm text-gray-400 mt-1">Open Issues</p></Card>
                        </div>
                        <Card title="Controls Status by Framework">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={controlStatusData} layout="vertical" stackOffset="expand">
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" stroke="#9ca3af" width={80} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                    <Legend />
                                    <Bar dataKey="Passed" stackId="a" fill="#10b981" />
                                    <Bar dataKey="Failed" stackId="a" fill="#ef4444" />
                                    <Bar dataKey="Not Applicable" stackId="a" fill="#6b7280" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                        <Card title="Active Audits">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-sm text-left text-gray-400">
                                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Framework</th>
                                            <th scope="col" className="px-6 py-3">Auditor</th>
                                            <th scope="col" className="px-6 py-3">Status</th>
                                            <th scope="col" className="px-6 py-3">Due Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeAudits.map(audit => (
                                            <tr key={audit.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                                <td className="px-6 py-4 font-medium text-white">{audit.framework}</td>
                                                <td className="px-6 py-4">{audit.auditor}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${audit.status === 'In Progress' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-blue-500/20 text-blue-300'}`}>
                                                        {audit.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">{audit.dueDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                        <ComplianceCalendar />
                    </div>
                );
            case 'frameworks':
                return <FrameworksOverview frameworks={mockFrameworks} />;
            case 'policies':
                return <PoliciesManager policies={mockPolicies} />;
            case 'controls':
                return <ControlsDetailsView controls={mockControlDetails} />;
            case 'risks':
                return <RiskRegisterDashboard risks={mockRisks} />;
            case 'issues':
                return <IssueTrackingSystem issues={mockIssues} remediationPlans={mockRemediationPlans} />;
            case 'remediation':
                return <RemediationPlansManager remediationPlans={mockRemediationPlans} />;
            case 'audit-findings':
                return <AuditFindingsReporter auditFindings={mockAuditFindings} />;
            case 'vendors':
                return <VendorComplianceMonitor vendors={mockVendors} />;
            case 'training':
                return <ComplianceTrainingTracker trainings={mockComplianceTraining} />;
            case 'regulatory-updates':
                return <RegulatoryUpdateFeed updates={mockRegulatoryUpdates} />;
            case 'documents':
                return <DocumentRepository documents={mockDocuments} />;
            case 'analytics':
                return <ComplianceAnalyticsDashboard />;
            default:
                return <div className="text-gray-400">Select a tab.</div>;
        }
    }, [activeTab]);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Compliance Hub</h2>

            <div className="flex flex-wrap border-b border-gray-700">
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'overview' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'} transition-colors`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'frameworks' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'} transition-colors`}
                    onClick={() => setActiveTab('frameworks')}
                >
                    Frameworks
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'policies' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'} transition-colors`}
                    onClick={() => setActiveTab('policies')}
                >
                    Policies
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'controls' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'} transition-colors`}
                    onClick={() => setActiveTab('controls')}
                >
                    Controls
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'risks' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'} transition-colors`}
                    onClick={() => setActiveTab('risks')}
                >
                    Risk Register
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'issues' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'} transition-colors`}
                    onClick={() => setActiveTab('issues')}
                >
                    Issue Tracker
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'remediation' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'} transition-colors`}
                    onClick={() => setActiveTab('remediation')}
                >
                    Remediation
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'audit-findings' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'} transition-colors`}
                    onClick={() => setActiveTab('audit-findings')}
                >
                    Audit Findings
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'vendors' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'} transition-colors`}
                    onClick={() => setActiveTab('vendors')}
                >
                    Vendors
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'training' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'} transition-colors`}
                    onClick={() => setActiveTab('training')}
                >
                    Training
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'regulatory-updates' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'} transition-colors`}
                    onClick={() => setActiveTab('regulatory-updates')}
                >
                    Reg. Updates
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'documents' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'} transition-colors`}
                    onClick={() => setActiveTab('documents')}
                >
                    Documents
                </button>
                <button
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'analytics' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'} transition-colors`}
                    onClick={() => setActiveTab('analytics')}
                >
                    Analytics
                </button>
            </div>

            <div className="pt-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default DemoBankComplianceHubView;