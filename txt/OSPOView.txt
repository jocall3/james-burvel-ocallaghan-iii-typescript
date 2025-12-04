import React from 'react';
import Card from '../../Card';

// #region TYPES AND INTERFACES
// This section defines all the data structures for the OSPO Dashboard.

export type UUID = string;

export type ContributionType = 'COMMIT' | 'PULL_REQUEST' | 'ISSUE' | 'COMMENT';
export type LicenseType = 'Permissive' | 'Copyleft' | 'Weakly Protective' | 'Network Protective' | 'Proprietary' | 'Unlicensed';
export type VulnerabilitySeverity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'INFO';
export type PolicyStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
export type ComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING' | 'UNKNOWN';
export type ProjectType = 'INTERNAL' | 'EXTERNAL_DEPENDENCY' | 'CONTRIBUTED_TO';

export interface Contributor {
    id: UUID;
    username: string;
    avatarUrl: string;
    githubUrl: string;
    company: string;
    contributionsCount: number;
    lastContributionDate: string;
}

export interface Contribution {
    id: UUID;
    type: ContributionType;
    repository: string;
    repositoryUrl: string;
    contributor: Contributor;
    title: string;
    url: string;
    createdAt: string;
    mergedAt?: string;
    closedAt?: string;
    linesAdded: number;
    linesRemoved: number;
    commentsCount: number;
}

export interface License {
    spdxId: string;
    name: string;
    type: LicenseType;
    isOsiApproved: boolean;
    permissions: string[];
    conditions: string[];
    limitations: string[];
}

export interface Dependency {
    id: UUID;
    name: string;
    version: string;
    license: License;
    manager: 'npm' | 'maven' | 'pip' | 'go' | 'cargo';
    isDevDependency: boolean;
    path: string;
    complianceStatus: ComplianceStatus;
    vulnerabilityCount: number;
}

export interface Vulnerability {
    id: UUID;
    cveId: string;
    packageName: string;
    packageVersion: string;
    severity: VulnerabilitySeverity;
    summary: string;
    url: string;
    publishedDate: string;
    remediation?: {
        fixedInVersion: string;
        recommendation: string;
    };
    cwes: string[];
}

export interface Repository {
    id: UUID;
    name: string;
    url: string;
    owner: string;
    description: string;
    language: string;
    stars: number;
    forks: number;
    license: License;
    isArchived: boolean;
    lastCommitDate: string;
}

export interface Project {
    id: UUID;
    name: string;
    type: ProjectType;
    repositories: Repository[];
    description: string;
    lead: string;
    team: string;
    complianceStatus: ComplianceStatus;
    securityRiskScore: number;
    dependencies: Dependency[];
    vulnerabilities: Vulnerability[];
    lastScanDate: string;
}

export interface PolicyRule {
    id: UUID;
    type: 'ALLOW_LICENSE' | 'DENY_LICENSE' | 'REQUIRE_CLA' | 'MAX_CRITICAL_VULNERABILITIES';
    value: string | number;
    description: string;
}

export interface Policy {
    id: UUID;
    name: string;
    description: string;
    status: PolicyStatus;
    rules: PolicyRule[];
    createdAt: string;
    updatedAt: string;
}

export interface CommunityHealthMetric {
    date: string;
    newContributors: number;
    issueResponseTimeHours: number;
    prMergeTimeHours: number;
    closedIssues: number;
    openedIssues: number;
}

export interface ReportTemplate {
    id: UUID;
    name: string;
    description: string;
    format: 'PDF' | 'CSV' | 'JSON';
    sections: ('SUMMARY' | 'LICENSES' | 'VULNERABILITIES' | 'CONTRIBUTIONS')[];
}

export interface ApiError {
    message: string;
    statusCode: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

// #endregion

// #region MOCK DATA AND API SIMULATION
// This section simulates a backend API for fetching OSPO data.

const MOCK_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Evan', 'Fiona', 'George', 'Hannah'];
const MOCK_PROJECTS = ['Nexus', 'Orion', 'Pegasus', 'Andromeda', 'Cygnus', 'Vela', 'Draco'];
const MOCK_REPOS = ['frontend', 'backend', 'docs', 'infra', 'mobile', 'sdk', 'cli'];
const MOCK_COMPANIES = ['Innovate Inc.', 'Future Systems', 'DataCorp', 'Cloudify', 'Quantum Leap'];
const MOCK_LANGUAGES = ['TypeScript', 'Python', 'Go', 'Java', 'Rust', 'JavaScript', 'C#'];
const MOCK_LICENSES: License[] = [
    { spdxId: 'MIT', name: 'MIT License', type: 'Permissive', isOsiApproved: true, permissions: ['commercial-use', 'modifications', 'distribution', 'private-use'], conditions: ['include-copyright'], limitations: ['liability', 'warranty'] },
    { spdxId: 'GPL-3.0-only', name: 'GNU General Public License v3.0 only', type: 'Copyleft', isOsiApproved: true, permissions: ['commercial-use', 'modifications', 'distribution', 'private-use'], conditions: ['disclose-source', 'same-license', 'state-changes'], limitations: ['liability', 'warranty'] },
    { spdxId: 'Apache-2.0', name: 'Apache License 2.0', type: 'Permissive', isOsiApproved: true, permissions: ['commercial-use', 'modifications', 'distribution', 'private-use', 'patent-grant'], conditions: ['include-copyright', 'state-changes'], limitations: ['liability', 'warranty', 'trademark-use'] },
    { spdxId: 'BSD-3-Clause', name: 'BSD 3-Clause "New" or "Revised" License', type: 'Permissive', isOsiApproved: true, permissions: ['commercial-use', 'modifications', 'distribution', 'private-use'], conditions: ['include-copyright'], limitations: ['liability', 'warranty', 'no-endorsement'] },
    { spdxId: 'Unlicense', name: 'The Unlicense', type: 'Permissive', isOsiApproved: true, permissions: [], conditions: [], limitations: [] },
    { spdxId: 'AGPL-3.0-only', name: 'GNU Affero General Public License v3.0 only', type: 'Network Protective', isOsiApproved: true, permissions: ['commercial-use', 'modifications', 'distribution', 'private-use'], conditions: ['disclose-source', 'same-license', 'network-use-disclose', 'state-changes'], limitations: ['liability', 'warranty'] },
];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date): Date => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const generateUUID = (): UUID => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

export const generateMockContributor = (id: number): Contributor => ({
    id: generateUUID(),
    username: `${getRandomElement(MOCK_NAMES)}${id}`,
    avatarUrl: `https://i.pravatar.cc/40?u=${id}`,
    githubUrl: `https://github.com/${getRandomElement(MOCK_NAMES)}${id}`,
    company: getRandomElement(MOCK_COMPANIES),
    contributionsCount: Math.floor(Math.random() * 200) + 1,
    lastContributionDate: getRandomDate(new Date(2022, 0, 1), new Date()).toISOString(),
});

export const generateMockContribution = (id: number, contributors: Contributor[]): Contribution => ({
    id: generateUUID(),
    type: getRandomElement(['COMMIT', 'PULL_REQUEST', 'ISSUE', 'COMMENT']),
    repository: `${getRandomElement(MOCK_PROJECTS)}/${getRandomElement(MOCK_REPOS)}`,
    repositoryUrl: 'https://github.com/example/repo',
    contributor: getRandomElement(contributors),
    title: `Fix: ${Math.random().toString(36).substring(7)}`,
    url: 'https://github.com/example/repo/pull/123',
    createdAt: getRandomDate(new Date(2022, 0, 1), new Date()).toISOString(),
    linesAdded: Math.floor(Math.random() * 500),
    linesRemoved: Math.floor(Math.random() * 200),
    commentsCount: Math.floor(Math.random() * 20),
});

export const generateMockDependency = (id: number): Dependency => ({
    id: generateUUID(),
    name: `package-${id}-${Math.random().toString(36).substring(2, 7)}`,
    version: `${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 20)}`,
    license: getRandomElement(MOCK_LICENSES),
    manager: getRandomElement(['npm', 'maven', 'pip', 'go', 'cargo']),
    isDevDependency: Math.random() > 0.5,
    path: `/src/node_modules/package-${id}`,
    complianceStatus: getRandomElement(['COMPLIANT', 'NON_COMPLIANT', 'PENDING']),
    vulnerabilityCount: Math.floor(Math.random() * 5),
});

export const generateMockVulnerability = (): Vulnerability => ({
    id: generateUUID(),
    cveId: `CVE-2023-${Math.floor(Math.random() * 90000) + 10000}`,
    packageName: `vulnerable-lib-${Math.random().toString(36).substring(7)}`,
    packageVersion: '1.2.3',
    severity: getRandomElement(['CRITICAL', 'HIGH', 'MODERATE', 'LOW']),
    summary: 'A remote code execution vulnerability exists in this package.',
    url: 'https://nvd.nist.gov/vuln/detail/CVE-2023-12345',
    publishedDate: getRandomDate(new Date(2020, 0, 1), new Date()).toISOString(),
    remediation: {
        fixedInVersion: '1.2.4',
        recommendation: 'Upgrade to version 1.2.4 or later.',
    },
    cwes: [`CWE-${Math.floor(Math.random() * 1000)}`],
});

export const generateMockRepository = (): Repository => ({
    id: generateUUID(),
    name: getRandomElement(MOCK_REPOS),
    url: 'https://github.com/example/repo',
    owner: getRandomElement(MOCK_COMPANIES),
    description: 'A repository for doing amazing things.',
    language: getRandomElement(MOCK_LANGUAGES),
    stars: Math.floor(Math.random() * 10000),
    forks: Math.floor(Math.random() * 1000),
    license: getRandomElement(MOCK_LICENSES),
    isArchived: Math.random() > 0.9,
    lastCommitDate: getRandomDate(new Date(2023, 0, 1), new Date()).toISOString(),
});

export const generateMockProject = (id: number): Project => {
    const deps = Array.from({ length: Math.floor(Math.random() * 50) + 10 }, (_, i) => generateMockDependency(i));
    const vulns = Array.from({ length: Math.floor(Math.random() * 10) }, () => generateMockVulnerability());
    return {
        id: generateUUID(),
        name: `${getRandomElement(MOCK_PROJECTS)}-${id}`,
        type: getRandomElement(['INTERNAL', 'EXTERNAL_DEPENDENCY', 'CONTRIBUTED_TO']),
        repositories: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, generateMockRepository),
        description: 'This project serves a critical business function by leveraging open source.',
        lead: getRandomElement(MOCK_NAMES),
        team: 'Platform Engineering',
        complianceStatus: getRandomElement(['COMPLIANT', 'NON_COMPLIANT', 'PENDING']),
        securityRiskScore: Math.floor(Math.random() * 100),
        dependencies: deps,
        vulnerabilities: vulns,
        lastScanDate: getRandomDate(new Date(2023, 5, 1), new Date()).toISOString(),
    };
};

export const generateMockPolicies = (): Policy[] => [
    { id: generateUUID(), name: 'Default Company Policy', status: 'ACTIVE', description: 'Base policy for all new projects.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), rules: [
        { id: generateUUID(), type: 'ALLOW_LICENSE', value: 'MIT', description: 'Allow MIT license' },
        { id: generateUUID(), type: 'ALLOW_LICENSE', value: 'Apache-2.0', description: 'Allow Apache 2.0 license' },
        { id: generateUUID(), type: 'DENY_LICENSE', value: 'AGPL-3.0-only', description: 'Deny AGPL 3.0 without review' },
        { id: generateUUID(), type: 'MAX_CRITICAL_VULNERABILITIES', value: 0, description: 'No critical vulnerabilities allowed in production' },
    ]},
    { id: generateUUID(), name: 'Internal Tools Policy', status: 'DRAFT', description: 'More relaxed policy for internal tooling.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), rules: [] },
    { id: generateUUID(), name: 'Legacy Services Policy', status: 'ARCHIVED', description: 'Old policy for EOL services.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), rules: [] },
];

const MOCK_DB = {
    contributors: Array.from({ length: 50 }, (_, i) => generateMockContributor(i)),
    contributions: [] as Contribution[],
    projects: Array.from({ length: 20 }, (_, i) => generateMockProject(i)),
    policies: generateMockPolicies(),
};
MOCK_DB.contributions = Array.from({ length: 500 }, (_, i) => generateMockContribution(i, MOCK_DB.contributors));


export class MockOspoApiService {
    private simulateLatency(ms: number = 500): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 300));
    }

    async getDashboardStats() {
        await this.simulateLatency();
        return {
            totalProjects: MOCK_DB.projects.length,
            compliantProjects: MOCK_DB.projects.filter(p => p.complianceStatus === 'COMPLIANT').length,
            totalVulnerabilities: MOCK_DB.projects.reduce((acc, p) => acc + p.vulnerabilities.length, 0),
            criticalVulnerabilities: MOCK_DB.projects.reduce((acc, p) => acc + p.vulnerabilities.filter(v => v.severity === 'CRITICAL').length, 0),
            totalContributions: MOCK_DB.contributions.length,
            activeContributors: new Set(MOCK_DB.contributions.map(c => c.contributor.id)).size,
        };
    }

    async getProjects(page: number = 1, limit: number = 10, filter: string = '', sortBy: string = 'name'): Promise<PaginatedResponse<Project>> {
        await this.simulateLatency();
        let filtered = MOCK_DB.projects.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
        
        filtered.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'risk') return b.securityRiskScore - a.securityRiskScore;
            return 0;
        });

        const start = (page - 1) * limit;
        const end = start + limit;
        return {
            data: filtered.slice(start, end),
            total: filtered.length,
            page,
            limit
        };
    }

    async getProjectById(id: UUID): Promise<Project | null> {
        await this.simulateLatency(300);
        return MOCK_DB.projects.find(p => p.id === id) || null;
    }
    
    async getContributions(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Contribution>> {
        await this.simulateLatency(800);
        const start = (page - 1) * limit;
        const end = start + limit;
        return {
            data: MOCK_DB.contributions.slice(start, end),
            total: MOCK_DB.contributions.length,
            page,
            limit
        };
    }

    async getVulnerabilities(page: number = 1, limit: number = 10, severity?: VulnerabilitySeverity): Promise<PaginatedResponse<Vulnerability>> {
        await this.simulateLatency();
        const allVulnerabilities = MOCK_DB.projects.flatMap(p => p.vulnerabilities);
        const filtered = severity ? allVulnerabilities.filter(v => v.severity === severity) : allVulnerabilities;
        const start = (page - 1) * limit;
        const end = start + limit;
        return {
            data: filtered.slice(start, end),
            total: filtered.length,
            page,
            limit
        };
    }
    
    async getPolicies(): Promise<Policy[]> {
        await this.simulateLatency(200);
        return MOCK_DB.policies;
    }
}

export const ospoApi = new MockOspoApiService();
// #endregion

// #region UTILITY FUNCTIONS AND HOOKS

export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const getSeverityColor = (severity: VulnerabilitySeverity): string => {
    switch (severity) {
        case 'CRITICAL': return 'bg-red-500 text-white';
        case 'HIGH': return 'bg-orange-500 text-white';
        case 'MODERATE': return 'bg-yellow-500 text-black';
        case 'LOW': return 'bg-blue-500 text-white';
        case 'INFO': return 'bg-gray-500 text-white';
        default: return 'bg-gray-200 text-black';
    }
};

export const getComplianceColor = (status: ComplianceStatus): string => {
    switch (status) {
        case 'COMPLIANT': return 'bg-green-500 text-white';
        case 'NON_COMPLIANT': return 'bg-red-500 text-white';
        case 'PENDING': return 'bg-yellow-500 text-black';
        default: return 'bg-gray-400 text-white';
    }
};

export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export interface ApiDataState<T> {
    data: T | null;
    loading: boolean;
    error: ApiError | null;
}

export function useApiData<T>(apiCall: () => Promise<T>, deps: React.DependencyList = []) {
    const [state, setState] = React.useState<ApiDataState<T>>({
        data: null,
        loading: true,
        error: null,
    });

    React.useEffect(() => {
        let isMounted = true;
        setState({ data: null, loading: true, error: null });
        apiCall()
            .then(data => {
                if (isMounted) {
                    setState({ data, loading: false, error: null });
                }
            })
            .catch(error => {
                if (isMounted) {
                    setState({ data: null, loading: false, error: { message: error.message, statusCode: 500 } });
                }
            });

        return () => {
            isMounted = false;
        };
    }, deps);

    return state;
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = React.useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
}
// #endregion

// #region GENERIC UI COMPONENTS

export interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}
export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', text }) => {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-4',
        lg: 'w-16 h-16 border-4',
    };
    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className={`animate-spin rounded-full border-gray-300 border-t-blue-500 ${sizeClasses[size]}`}></div>
            {text && <p className="mt-2 text-gray-400">{text}</p>}
        </div>
    );
};

export interface AlertProps {
    type: 'error' | 'success' | 'warning' | 'info';
    title: string;
    message: string;
}
export const Alert: React.FC<AlertProps> = ({ type, title, message }) => {
    const colors = {
        error: 'bg-red-900 border-red-500 text-red-100',
        success: 'bg-green-900 border-green-500 text-green-100',
        warning: 'bg-yellow-900 border-yellow-500 text-yellow-100',
        info: 'bg-blue-900 border-blue-500 text-blue-100',
    };
    return (
        <div className={`border-l-4 p-4 ${colors[type]}`} role="alert">
            <p className="font-bold">{title}</p>
            <p>{message}</p>
        </div>
    );
};

export interface TabsProps {
    tabs: { name: string; content: React.ReactNode }[];
    defaultTab?: number;
}
export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab = 0 }) => {
    const [activeTab, setActiveTab] = React.useState(defaultTab);
    return (
        <div>
            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab, index) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(index)}
                            className={`${
                                index === activeTab
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="pt-4">{tabs[activeTab]?.content}</div>
        </div>
    );
};

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};


export interface StatCardProps {
    title: string;
    value: string | number;
    change?: number;
    changeType?: 'increase' | 'decrease';
    icon: React.ReactNode;
}
export const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon }) => {
    const isIncrease = changeType === 'increase';
    const changeColor = changeType ? (isIncrease ? 'text-green-400' : 'text-red-400') : 'text-gray-400';

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center">
            <div className="bg-gray-700 p-3 rounded-full mr-4">{icon}</div>
            <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
                {change !== undefined && (
                    <p className={`text-xs ${changeColor}`}>
                        {isIncrease ? '▲' : '▼'} {Math.abs(change)}% from last month
                    </p>
                )}
            </div>
        </div>
    );
};


export interface Column<T> {
    accessor: keyof T;
    header: string;
    cell?: (item: T) => React.ReactNode;
    sortable?: boolean;
}

export type SortConfig<T> = {
    key: keyof T;
    direction: 'ascending' | 'descending';
} | null;

export interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    onRowClick?: (item: T) => void;
}

export const DataTable = <T extends { id: UUID }>({ data, columns, loading, onRowClick }: DataTableProps<T>) => {
    const [sortConfig, setSortConfig] = React.useState<SortConfig<T>>(null);
    const [filterText, setFilterText] = React.useState('');
    const debouncedFilter = useDebounce(filterText, 300);

    const filteredData = React.useMemo(() => {
        if (!debouncedFilter) return data;
        return data.filter(item => {
            return columns.some(column => {
                const value = item[column.accessor];
                return String(value).toLowerCase().includes(debouncedFilter.toLowerCase());
            });
        });
    }, [data, columns, debouncedFilter]);

    const sortedData = React.useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredData, sortConfig]);

    const requestSort = (key: keyof T) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: keyof T) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    };

    if (loading) {
        return <Spinner text="Loading data..." />;
    }

    return (
        <div className="bg-gray-800 rounded-lg p-4">
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Filter table..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="w-full md:w-1/3 p-2 bg-gray-700 text-white rounded-md"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900">
                        <tr>
                            {columns.map(column => (
                                <th
                                    key={String(column.accessor)}
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                                >
                                    {column.sortable ? (
                                        <button onClick={() => requestSort(column.accessor)} className="w-full text-left">
                                            {column.header}
                                            {getSortIndicator(column.accessor)}
                                        </button>
                                    ) : (
                                        column.header
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {sortedData.map((item) => (
                            <tr 
                                key={item.id} 
                                className={`hover:bg-gray-700 ${onRowClick ? 'cursor-pointer' : ''}`}
                                onClick={() => onRowClick && onRowClick(item)}
                            >
                                {columns.map(column => (
                                    <td key={String(column.accessor)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {column.cell ? column.cell(item) : String(item[column.accessor])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {sortedData.length === 0 && <p className="text-center py-4 text-gray-400">No data available.</p>}
        </div>
    );
};
// #endregion

// #region DASHBOARD SUB-VIEWS

/**
 * OverviewDashboard: Provides a high-level summary of OSPO metrics.
 */
export const OverviewDashboard: React.FC = () => {
    const { data: stats, loading, error } = useApiData(() => ospoApi.getDashboardStats());

    if (loading) return <Spinner text="Loading overview..."/>;
    if (error) return <Alert type="error" title="Failed to load stats" message={error.message} />;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Total Projects" value={stats?.totalProjects || 0} icon={<span>📁</span>} />
            <StatCard title="Compliant Projects" value={`${Math.round(((stats?.compliantProjects || 0) / (stats?.totalProjects || 1)) * 100)}%`} icon={<span>✅</span>} />
            <StatCard title="Critical Vulnerabilities" value={stats?.criticalVulnerabilities || 0} change={5} changeType="increase" icon={<span>🔥</span>} />
            <StatCard title="Total Contributions" value={stats?.totalContributions || 0} icon={<span>🚀</span>} />
            <StatCard title="Active Contributors" value={stats?.activeContributors || 0} change={2} changeType="decrease" icon={<span>🧑‍💻</span>} />
            <StatCard title="License Scan Coverage" value="98%" icon={<span>📜</span>} />
        </div>
    );
};

/**
 * ProjectsView: A detailed view for browsing and managing projects.
 */
export const ProjectsView: React.FC = () => {
    const [page, setPage] = React.useState(1);
    const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
    const { data: projectsResponse, loading, error } = useApiData(() => ospoApi.getProjects(page, 10), [page]);
    
    const columns: Column<Project>[] = [
        { accessor: 'name', header: 'Project Name', sortable: true },
        { accessor: 'type', header: 'Type', sortable: true },
        { accessor: 'lead', header: 'Lead', sortable: true },
        { accessor: 'complianceStatus', header: 'Compliance', cell: (p) => <span className={`px-2 py-1 rounded-full text-xs ${getComplianceColor(p.complianceStatus)}`}>{p.complianceStatus}</span> },
        { accessor: 'securityRiskScore', header: 'Risk Score', sortable: true },
        { accessor: 'lastScanDate', header: 'Last Scan', cell: (p) => <span>{formatDate(p.lastScanDate)}</span> },
    ];
    
    return (
        <div>
            <h2 className="text-xl font-semibold text-white mb-4">Project Inventory</h2>
            {error && <Alert type="error" title="Failed to load projects" message={error.message} />}
            <DataTable
                columns={columns}
                data={projectsResponse?.data || []}
                loading={loading}
                onRowClick={(project) => setSelectedProject(project)}
            />
             <Modal isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} title={selectedProject?.name || ''}>
                {selectedProject && <ProjectDetailView project={selectedProject} />}
            </Modal>
        </div>
    );
};

export interface ProjectDetailViewProps {
    project: Project;
}
export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project }) => {
    // In a real app, you might fetch more details here.
    return (
        <div className="text-gray-300 space-y-4">
            <p><strong>Lead:</strong> {project.lead}</p>
            <p><strong>Team:</strong> {project.team}</p>
            <p><strong>Description:</strong> {project.description}</p>
            <h4 className="font-semibold mt-4">Dependencies ({project.dependencies.length})</h4>
            <div className="max-h-60 overflow-y-auto bg-gray-900 p-2 rounded">
                {project.dependencies.map(dep => (
                    <div key={dep.id} className="flex justify-between items-center p-1 text-sm">
                        <span>{dep.name}@{dep.version}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getComplianceColor(dep.complianceStatus)}`}>{dep.license.spdxId}</span>
                    </div>
                ))}
            </div>
            <h4 className="font-semibold mt-4">Vulnerabilities ({project.vulnerabilities.length})</h4>
            <div className="max-h-60 overflow-y-auto bg-gray-900 p-2 rounded">
                {project.vulnerabilities.map(vuln => (
                    <div key={vuln.id} className="flex justify-between items-center p-1 text-sm">
                        <span>{vuln.cveId} ({vuln.packageName})</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getSeverityColor(vuln.severity)}`}>{vuln.severity}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


/**
 * SecurityView: Dashboard for monitoring security vulnerabilities.
 */
export const SecurityView: React.FC = () => {
    const [page, setPage] = React.useState(1);
    const { data, loading, error } = useApiData(() => ospoApi.getVulnerabilities(page, 15), [page]);
    
    const columns: Column<Vulnerability>[] = [
        { accessor: 'cveId', header: 'CVE ID', sortable: true },
        { accessor: 'packageName', header: 'Package', sortable: true },
        { accessor: 'severity', header: 'Severity', sortable: true, cell: (v) => <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(v.severity)}`}>{v.severity}</span> },
        { accessor: 'summary', header: 'Summary' },
        { accessor: 'publishedDate', header: 'Published', cell: (v) => <span>{formatDate(v.publishedDate)}</span> },
    ];
    
    return (
        <div>
            <h2 className="text-xl font-semibold text-white mb-4">Security Vulnerabilities</h2>
            {error && <Alert type="error" title="Failed to load vulnerabilities" message={error.message} />}
            <DataTable
                columns={columns}
                data={data?.data || []}
                loading={loading}
            />
        </div>
    );
};

/**
 * ComplianceView: Dashboard for license compliance.
 */
export const ComplianceView: React.FC = () => {
    // This is a simplified view. A real one would have more complex data.
    const { data: projects, loading } = useApiData(() => ospoApi.getProjects(1, 100));

    const licenseUsage = React.useMemo(() => {
        if (!projects) return {};
        const usage: Record<string, number> = {};
        projects.data.forEach(p => {
            p.dependencies.forEach(d => {
                usage[d.license.name] = (usage[d.license.name] || 0) + 1;
            });
        });
        return usage;
    }, [projects]);
    
    if (loading) return <Spinner />;

    return (
        <div>
            <h2 className="text-xl font-semibold text-white mb-4">License Compliance Overview</h2>
            <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-white">License Distribution</h3>
                <div className="space-y-2">
                    {Object.entries(licenseUsage).sort(([,a],[,b]) => b-a).map(([name, count]) => (
                        <div key={name} className="flex items-center">
                            <span className="w-1/3 text-gray-300">{name}</span>
                            <div className="w-2/3 bg-gray-700 rounded-full h-4">
                                <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${(count / Math.max(...Object.values(licenseUsage)))*100}%` }}></div>
                            </div>
                            <span className="ml-2 text-white">{count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


/**
 * ContributionsView: Tracks contributions to and from the organization.
 */
export const ContributionsView: React.FC = () => {
    const [page, setPage] = React.useState(1);
    const { data, loading, error } = useApiData(() => ospoApi.getContributions(page, 15), [page]);
    
    const columns: Column<Contribution>[] = [
        { accessor: 'contributor', header: 'Contributor', cell: (c) => (
            <div className="flex items-center">
                <img src={c.contributor.avatarUrl} alt={c.contributor.username} className="w-8 h-8 rounded-full mr-2" />
                <span>{c.contributor.username}</span>
            </div>
        )},
        { accessor: 'type', header: 'Type' },
        { accessor: 'repository', header: 'Repository' },
        { accessor: 'title', header: 'Title' },
        { accessor: 'createdAt', header: 'Date', cell: (c) => <span>{formatDate(c.createdAt)}</span> },
    ];
    
    return (
        <div>
            <h2 className="text-xl font-semibold text-white mb-4">Contribution Log</h2>
            {error && <Alert type="error" title="Failed to load contributions" message={error.message} />}
            <DataTable
                columns={columns}
                data={data?.data || []}
                loading={loading}
            />
        </div>
    );
};


/**
 * PoliciesView: Manages OSPO policies.
 */
export const PoliciesView: React.FC = () => {
    const { data: policies, loading, error } = useApiData(() => ospoApi.getPolicies());

    if (loading) return <Spinner />;
    if (error) return <Alert type="error" title="Failed to load policies" message={error.message} />;

    return (
        <div>
            <h2 className="text-xl font-semibold text-white mb-4">OSPO Policies</h2>
            <div className="space-y-4">
                {policies?.map(policy => (
                    <div key={policy.id} className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-lg text-white">{policy.name}</h3>
                            <span className={`px-3 py-1 text-sm rounded-full ${policy.status === 'ACTIVE' ? 'bg-green-600' : 'bg-gray-600'}`}>{policy.status}</span>
                        </div>
                        <p className="text-gray-400 mt-1">{policy.description}</p>
                        <div className="mt-4 border-t border-gray-700 pt-3">
                            <h4 className="font-semibold text-gray-200">Rules ({policy.rules.length})</h4>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300">
                                {policy.rules.map(rule => (
                                    <li key={rule.id}><strong>{rule.type}:</strong> {rule.value.toString()} - <em>{rule.description}</em></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// #endregion


const OSPOView: React.FC = () => {
    const TABS = [
        { name: 'Dashboard', content: <OverviewDashboard /> },
        { name: 'Projects', content: <ProjectsView /> },
        { name: 'Security', content: <SecurityView /> },
        { name: 'License Compliance', content: <ComplianceView /> },
        { name: 'Contributions', content: <ContributionsView /> },
        { name: 'Policies', content: <PoliciesView /> },
    ];

    return (
        <Card title="Open Source Program Office">
            <p className="text-gray-400 mb-6">A dashboard for managing open source contributions, license compliance, and community engagement.</p>
            <Tabs tabs={TABS} />
        </Card>
    );
};

export default OSPOView;
