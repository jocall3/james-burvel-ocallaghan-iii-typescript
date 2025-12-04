import React, { useContext, useMemo, useState, useCallback, useEffect, createContext } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { AccessLog } from '../../../../types';

// --- NEW TYPES FOR EXPANSION ---
/**
 * Represents a user within the system, potentially with linked roles.
 */
export interface User {
    id: string;
    username: string;
    email: string;
    status: 'Active' | 'Inactive' | 'Locked';
    lastLogin: string; // ISO string
    roles: string[]; // IDs of roles
    department: string;
    title: string;
    mfaEnabled: boolean;
    location: string; // Geographical location (e.g., "New York, USA")
    ipWhitelist: string[]; // List of allowed IP addresses for this user
    riskScore: number; // Calculated risk score for the user (0-100)
    creationDate: string; // ISO string
    lastActivity: string; // ISO string
    permissions: string[]; // Direct permissions assigned to user, not via roles
}

/**
 * Represents a role with a set of permissions.
 */
export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[]; // List of permission IDs
    users: string[]; // List of user IDs assigned to this role
    creationDate: string; // ISO string
    lastModified: string; // ISO string
    isActive: boolean;
    level: 'System' | 'Admin' | 'User' | 'Guest' | 'Custom';
}

/**
 * Represents a specific permission that can be assigned to roles or users.
 */
export interface Permission {
    id: string;
    name: string;
    description: string;
    category: string; // e.g., 'Dashboard', 'Reports', 'User Management'
    module: string; // e.g., 'Access Control', 'Data Analytics'
}

/**
 * Represents an active user session.
 */
export interface ActiveSession {
    id: string;
    userId: string;
    username: string;
    loginTime: string; // ISO string
    lastActivity: string; // ISO string
    ipAddress: string;
    location: string;
    device: string; // e.g., 'Chrome on Windows 10'
    browser: string;
    os: string;
    status: 'Active' | 'Idle' | 'Terminated';
    tokenExpiry: string; // ISO string
}

/**
 * Represents a security policy.
 */
export interface SecurityPolicy {
    id: string;
    name: string;
    type: 'Password' | 'MFA' | 'Session' | 'IP Restriction' | 'Data Access' | 'Custom';
    description: string;
    isEnabled: boolean;
    parameters: Record<string, any>; // JSON object for policy-specific parameters
    creationDate: string; // ISO string
    lastModified: string; // ISO string
    enforcementScope: 'Global' | 'Department' | 'Role' | 'User'; // Who the policy applies to
    targetIds?: string[]; // IDs of departments, roles, or users if scope is not global
}

/**
 * Represents a detected anomaly.
 */
export interface SecurityAnomaly {
    id: string;
    type: 'Unusual Login Location' | 'Brute Force Attempt' | 'Privilege Escalation' | 'Data Exfiltration' | 'Login Spike';
    timestamp: string; // ISO string
    description: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    relatedUserId?: string;
    relatedIpAddress?: string;
    status: 'New' | 'Investigating' | 'Resolved' | 'False Positive';
    triggeredRules: string[];
    resolutionNotes?: string;
    assignedTo?: string; // User ID of the analyst
}

/**
 * Represents a global threat intelligence alert.
 */
export interface ThreatIntelligenceAlert {
    id: string;
    title: string;
    description: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    source: string; // e.g., 'CyberSecurity News', 'Internal Sensor', 'Threat Feed X'
    timestamp: string; // ISO string
    relatedCVEs?: string[];
    recommendedActions: string[];
    status: 'Active' | 'Archived' | 'Mitigated';
    detectionVector: string; // How the threat might manifest or was detected
}

// --- MOCK DATA GENERATION UTILITIES ---
const generateId = () => Math.random().toString(36).substr(2, 9);
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const USERNAMES = ['alice', 'bob', 'charlie', 'diana', 'eve', 'frank', 'grace', 'heidi', 'ivan', 'judy', 'ken', 'lisa'];
const IPS = ['192.168.1.1', '10.0.0.5', '172.16.0.10', '203.0.113.45', '198.51.100.12', '203.0.113.100', '198.51.100.200'];
const LOCATIONS = ['New York, USA', 'London, UK', 'Berlin, DE', 'Tokyo, JP', 'Sydney, AU', 'Mumbai, IN', 'Paris, FR'];
const DEVICES = ['Chrome on Windows 10', 'Firefox on macOS', 'Safari on iOS', 'Edge on Android'];
const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'IT'];
const TITLES = ['Software Engineer', 'Product Manager', 'Marketing Specialist', 'Sales Manager', 'HR Generalist', 'Accountant', 'IT Support'];
const PERMISSION_CATEGORIES = ['User Management', 'Role Management', 'Policy Management', 'Audit Logging', 'Dashboard Analytics', 'System Configuration'];
const RISK_LEVELS: AccessLog['riskLevel'][] = ['Low', 'Medium', 'High'];
const ANOMALY_TYPES: SecurityAnomaly['type'][] = ['Unusual Login Location', 'Brute Force Attempt', 'Login Spike', 'Privilege Escalation'];
const THREAT_SOURCES = ['DarkWeb Monitor', 'CVE Database', 'Internal Security Team', 'Industry Report'];

const generateMockPermissions = (): Permission[] => {
    const permissions: Permission[] = [];
    let idCounter = 1;
    for (const cat of PERMISSION_CATEGORIES) {
        for (let i = 1; i <= 5; i++) {
            permissions.push({
                id: `perm-${idCounter++}`,
                name: `Can ${cat.replace(' ', '')}Action${i}`,
                description: `Allows specific action ${i} within the ${cat} category.`,
                category: cat,
                module: 'Access Control',
            });
        }
    }
    return permissions;
};

export const MOCK_PERMISSIONS = generateMockPermissions();

const generateMockRoles = (permissions: Permission[]): Role[] => {
    const allPermIds = permissions.map(p => p.id);
    return [
        {
            id: 'role-admin',
            name: 'Administrator',
            description: 'Full system access with all management capabilities.',
            permissions: allPermIds,
            users: [],
            creationDate: new Date(Date.now() - getRandomInt(365, 730) * 24 * 60 * 60 * 1000).toISOString(),
            lastModified: new Date().toISOString(),
            isActive: true,
            level: 'Admin',
        },
        {
            id: 'role-user',
            name: 'Standard User',
            description: 'Basic access to dashboards and personal settings.',
            permissions: allPermIds.filter(p => p.includes('Action1') || p.includes('Dashboard')),
            users: [],
            creationDate: new Date(Date.now() - getRandomInt(180, 500) * 24 * 60 * 60 * 1000).toISOString(),
            lastModified: new Date().toISOString(),
            isActive: true,
            level: 'User',
        },
        {
            id: 'role-auditor',
            name: 'Security Auditor',
            description: 'Read-only access to all logs and security configurations.',
            permissions: allPermIds.filter(p => p.includes('Audit') || p.includes('Analytics')),
            users: [],
            creationDate: new Date(Date.now() - getRandomInt(90, 300) * 24 * 60 * 60 * 1000).toISOString(),
            lastModified: new Date().toISOString(),
            isActive: true,
            level: 'System',
        },
    ];
};

export const MOCK_ROLES = generateMockRoles(MOCK_PERMISSIONS);

const generateMockUsers = (roles: Role[], count: number): User[] => {
    const users: User[] = [];
    const roleIds = roles.map(r => r.id);
    for (let i = 0; i < count; i++) {
        const userId = generateId();
        const userRoles = [getRandomElement(roleIds)];
        if (Math.random() > 0.7) userRoles.push(getRandomElement(roleIds)); // Assign a second role sometimes

        const creationDate = new Date(Date.now() - getRandomInt(30, 730) * 24 * 60 * 60 * 1000);
        const lastLoginDate = new Date(creationDate.getTime() + getRandomInt(1, 30) * 24 * 60 * 60 * 1000);
        const lastActivityDate = new Date(Date.now() - getRandomInt(1, 7) * 24 * 60 * 60 * 1000);

        users.push({
            id: userId,
            username: `${getRandomElement(USERNAMES)}${i}`,
            email: `${getRandomElement(USERNAMES)}${i}@example.com`,
            status: getRandomElement(['Active', 'Active', 'Inactive', 'Locked']),
            lastLogin: lastLoginDate.toISOString(),
            roles: userRoles,
            department: getRandomElement(DEPARTMENTS),
            title: getRandomElement(TITLES),
            mfaEnabled: Math.random() > 0.3,
            location: getRandomElement(LOCATIONS),
            ipWhitelist: Math.random() > 0.8 ? [getRandomElement(IPS)] : [],
            riskScore: getRandomInt(10, 90),
            creationDate: creationDate.toISOString(),
            lastActivity: lastActivityDate.toISOString(),
            permissions: Math.random() > 0.9 ? [getRandomElement(MOCK_PERMISSIONS).id] : [], // Direct permissions
        });

        // Update roles with user IDs
        userRoles.forEach(roleId => {
            const role = roles.find(r => r.id === roleId);
            if (role && !role.users.includes(userId)) {
                role.users.push(userId);
            }
        });
    }
    return users;
};

export const MOCK_USERS = generateMockUsers(MOCK_ROLES, 150); // 150 mock users

const generateMockAccessLogs = (users: User[], count: number): AccessLog[] => {
    const logs: AccessLog[] = [];
    for (let i = 0; i < count; i++) {
        const user = getRandomElement(users);
        const status = Math.random() > 0.2 ? 'Success' : 'Failed'; // 80% success
        const timestamp = new Date(Date.now() - getRandomInt(0, 24 * 60 * 60 * 1000)).toISOString();
        const riskLevel = status === 'Failed' && Math.random() > 0.5 ? getRandomElement(['Medium', 'High']) : 'Low';

        logs.push({
            id: generateId(),
            user: user.username,
            ip: getRandomElement(IPS),
            location: getRandomElement(LOCATIONS),
            timestamp: timestamp,
            status: status,
            riskLevel: riskLevel,
            action: getRandomElement(['Login', 'Dashboard Access', 'Report Generation', 'User Update', 'Policy Change']),
            device: getRandomElement(DEVICES),
        });
    }
    return logs;
};

export const MOCK_ACCESS_LOGS = generateMockAccessLogs(MOCK_USERS, 2000); // 2000 access logs

const generateMockActiveSessions = (users: User[], count: number): ActiveSession[] => {
    const sessions: ActiveSession[] = [];
    for (let i = 0; i < count; i++) {
        const user = getRandomElement(users);
        const loginTime = new Date(Date.now() - getRandomInt(1, 24) * 60 * 60 * 1000).toISOString();
        const lastActivity = new Date(Date.parse(loginTime) + getRandomInt(5, 60) * 60 * 1000).toISOString();
        const tokenExpiry = new Date(Date.parse(loginTime) + getRandomInt(2, 8) * 60 * 60 * 1000).toISOString();

        sessions.push({
            id: generateId(),
            userId: user.id,
            username: user.username,
            loginTime: loginTime,
            lastActivity: lastActivity,
            ipAddress: getRandomElement(IPS),
            location: getRandomElement(LOCATIONS),
            device: getRandomElement(DEVICES),
            browser: getRandomElement(['Chrome', 'Firefox', 'Safari', 'Edge']),
            os: getRandomElement(['Windows 10', 'macOS', 'iOS', 'Android', 'Linux']),
            status: getRandomElement(['Active', 'Idle']),
            tokenExpiry: tokenExpiry,
        });
    }
    return sessions;
};

export const MOCK_ACTIVE_SESSIONS = generateMockActiveSessions(MOCK_USERS, 50);

const generateMockSecurityPolicies = (roles: Role[]): SecurityPolicy[] => {
    const policies: SecurityPolicy[] = [
        {
            id: generateId(),
            name: 'Strong Password Policy',
            type: 'Password',
            description: 'Requires passwords to be at least 12 characters, with uppercase, lowercase, numbers, and symbols. Expires every 90 days.',
            isEnabled: true,
            parameters: { minLength: 12, requireUpper: true, requireLower: true, requireNumber: true, requireSymbol: true, expiryDays: 90, historyCount: 5 },
            creationDate: new Date(Date.now() - getRandomInt(180, 365) * 24 * 60 * 60 * 1000).toISOString(),
            lastModified: new Date().toISOString(),
            enforcementScope: 'Global',
        },
        {
            id: generateId(),
            name: 'MFA Enforcement',
            type: 'MFA',
            description: 'Multi-factor authentication required for all login attempts.',
            isEnabled: true,
            parameters: { required: true, methods: ['TOTP', 'SMS', 'Email'], gracePeriodDays: 7 },
            creationDate: new Date(Date.now() - getRandomInt(90, 200) * 24 * 60 * 60 * 1000).toISOString(),
            lastModified: new Date().toISOString(),
            enforcementScope: 'Global',
        },
        {
            id: generateId(),
            name: 'Session Inactivity Timeout',
            type: 'Session',
            description: 'Automatically logs out users after 30 minutes of inactivity.',
            isEnabled: true,
            parameters: { inactivityTimeoutMinutes: 30, maxSessionDurationHours: 8 },
            creationDate: new Date(Date.now() - getRandomInt(60, 150) * 24 * 60 * 60 * 1000).toISOString(),
            lastModified: new Date().toISOString(),
            enforcementScope: 'Global',
        },
        {
            id: generateId(),
            name: 'Admin Role IP Restriction',
            type: 'IP Restriction',
            description: 'Limits login for Administrator role to corporate network IPs.',
            isEnabled: false, // Currently disabled for flexibility
            parameters: { allowedIPs: ['192.168.1.0/24', '10.0.0.0/8'], action: 'Deny_Others' },
            creationDate: new Date(Date.now() - getRandomInt(30, 90) * 24 * 60 * 60 * 1000).toISOString(),
            lastModified: new Date().toISOString(),
            enforcementScope: 'Role',
            targetIds: [roles.find(r => r.name === 'Administrator')?.id || ''],
        },
        {
            id: generateId(),
            name: 'Data Access for Finance',
            type: 'Data Access',
            description: 'Specific data access rules for Finance department users.',
            isEnabled: true,
            parameters: { accessLevel: 'Restricted', sensitiveDataTags: ['Financial', 'PII'], readOnly: true },
            creationDate: new Date(Date.now() - getRandomInt(10, 40) * 24 * 60 * 60 * 1000).toISOString(),
            lastModified: new Date().toISOString(),
            enforcementScope: 'Department',
            targetIds: ['Finance'], // Assuming departments are identified by name/ID
        },
    ];
    return policies;
};

export const MOCK_SECURITY_POLICIES = generateMockSecurityPolicies(MOCK_ROLES);

const generateMockAnomalies = (users: User[], count: number): SecurityAnomaly[] => {
    const anomalies: SecurityAnomaly[] = [];
    for (let i = 0; i < count; i++) {
        const user = getRandomElement(users);
        const type = getRandomElement(ANOMALY_TYPES);
        const timestamp = new Date(Date.now() - getRandomInt(0, 7) * 24 * 60 * 60 * 1000 - getRandomInt(0, 60) * 60 * 1000).toISOString();
        const severity = getRandomElement(['Low', 'Medium', 'High', 'Critical']);

        anomalies.push({
            id: generateId(),
            type: type,
            timestamp: timestamp,
            description: `Detected ${type.toLowerCase()} involving user ${user.username} from ${getRandomElement(IPS)}.`,
            severity: severity,
            relatedUserId: user.id,
            relatedIpAddress: getRandomElement(IPS),
            status: getRandomElement(['New', 'Investigating', 'Resolved', 'False Positive']),
            triggeredRules: [`Rule-${getRandomInt(100, 999)}`, `Rule-${getRandomInt(100, 999)}`],
            assignedTo: Math.random() > 0.5 ? getRandomElement(users).id : undefined,
        });
    }
    return anomalies;
};

export const MOCK_SECURITY_ANOMALIES = generateMockAnomalies(MOCK_USERS, 80);

const generateMockThreatAlerts = (count: number): ThreatIntelligenceAlert[] => {
    const alerts: ThreatIntelligenceAlert[] = [];
    for (let i = 0; i < count; i++) {
        const timestamp = new Date(Date.now() - getRandomInt(0, 14) * 24 * 60 * 60 * 1000 - getRandomInt(0, 60) * 60 * 1000).toISOString();
        const severity = getRandomElement(['Low', 'Medium', 'High', 'Critical']);
        const title = getRandomElement(['New Ransomware Variant', 'Zero-Day Exploit Detected', 'Phishing Campaign Active', 'DDoS Attack Imminent']);
        alerts.push({
            id: generateId(),
            title: title,
            description: `A new ${severity.toLowerCase()} threat, "${title}", reported by ${getRandomElement(THREAT_SOURCES)}. Immediate action advised.`,
            severity: severity,
            source: getRandomElement(THREAT_SOURCES),
            timestamp: timestamp,
            relatedCVEs: Math.random() > 0.5 ? [`CVE-${getRandomInt(2020, 2023)}-${getRandomInt(1000, 9999)}`] : [],
            recommendedActions: [`Patch systems`, `Educate users`, `Block IPs`],
            status: getRandomElement(['Active', 'Active', 'Archived']),
            detectionVector: getRandomElement(['Email', 'Network Intrusion', 'Software Vulnerability', 'Endpoint Detection']),
        });
    }
    return alerts;
};

export const MOCK_THREAT_ALERTS = generateMockThreatAlerts(30);

// --- HELPER COMPONENTS (for reuse in new sections) ---

/**
 * Renders a customizable badge for status or risk levels.
 */
export const StatusBadge: React.FC<{ status: string; type?: 'status' | 'risk' | 'severity' }> = ({ status, type = 'status' }) => {
    let colors = '';
    switch (type) {
        case 'status':
            switch (status) {
                case 'Active': colors = 'bg-green-500/20 text-green-300'; break;
                case 'Success': colors = 'bg-green-500/20 text-green-300'; break;
                case 'Inactive': colors = 'bg-gray-500/20 text-gray-300'; break;
                case 'Locked': colors = 'bg-red-500/20 text-red-300'; break;
                case 'Failed': colors = 'bg-red-500/20 text-red-300'; break;
                case 'Idle': colors = 'bg-yellow-500/20 text-yellow-300'; break;
                case 'New': colors = 'bg-blue-500/20 text-blue-300'; break;
                case 'Investigating': colors = 'bg-orange-500/20 text-orange-300'; break;
                case 'Resolved': colors = 'bg-green-600/20 text-green-400'; break;
                case 'False Positive': colors = 'bg-gray-600/20 text-gray-400'; break;
                case 'Terminated': colors = 'bg-red-600/20 text-red-400'; break;
                case 'Mitigated': colors = 'bg-green-700/20 text-green-500'; break;
                default: colors = 'bg-gray-500/20 text-gray-300'; break;
            }
            break;
        case 'risk':
        case 'severity':
            switch (status) {
                case 'Low': colors = 'bg-green-500/20 text-green-300'; break;
                case 'Medium': colors = 'bg-yellow-500/20 text-yellow-300'; break;
                case 'High': colors = 'bg-red-500/20 text-red-300'; break;
                case 'Critical': colors = 'bg-purple-500/20 text-purple-300'; break;
                default: colors = 'bg-gray-500/20 text-gray-300'; break;
            }
            break;
    }
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors}`}>{status}</span>;
};

/**
 * A generic pagination component.
 */
export const Pagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = useMemo(() => {
        const pages: (number | '...')[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (currentPage > 4) pages.push('...');
            for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
                pages.push(i);
            }
            if (currentPage < totalPages - 3) pages.push('...');
            pages.push(totalPages);
        }
        return Array.from(new Set(pages)); // Remove duplicates from '...'
    }, [currentPage, totalPages]);

    return (
        <div className="flex items-center justify-center space-x-2 mt-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm rounded-md bg-gray-900/50 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            {pageNumbers.map((page, index) => (
                <button
                    key={index}
                    onClick={() => typeof page === 'number' && onPageChange(page)}
                    className={`px-3 py-1 text-sm rounded-md ${
                        page === currentPage ? 'bg-cyan-600' : typeof page === 'number' ? 'bg-gray-900/50 hover:bg-cyan-700' : 'bg-transparent'
                    } ${typeof page !== 'number' ? 'cursor-default' : ''}`}
                    disabled={typeof page !== 'number'}
                >
                    {page}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm rounded-md bg-gray-900/50 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>
    );
};

/**
 * Generic modal component for forms/details.
 */
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({
    isOpen,
    onClose,
    title,
    children,
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">
                        &times;
                    </button>
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
};

// --- DATA CONTEXT & API SIMULATION ---
interface AccessControlContextType {
    users: User[];
    roles: Role[];
    permissions: Permission[];
    policies: SecurityPolicy[];
    activeSessions: ActiveSession[];
    anomalies: SecurityAnomaly[];
    threatAlerts: ThreatIntelligenceAlert[];
    updateUser: (user: User) => Promise<void>;
    createUser: (user: Omit<User, 'id' | 'creationDate' | 'lastActivity' | 'riskScore'>) => Promise<User>;
    deleteUser: (userId: string) => Promise<void>;
    updateRole: (role: Role) => Promise<void>;
    createRole: (role: Omit<Role, 'id' | 'creationDate' | 'lastModified' | 'users'>) => Promise<Role>;
    deleteRole: (roleId: string) => Promise<void>;
    updatePolicy: (policy: SecurityPolicy) => Promise<void>;
    createPolicy: (policy: Omit<SecurityPolicy, 'id' | 'creationDate' | 'lastModified'>) => Promise<SecurityPolicy>;
    deletePolicy: (policyId: string) => Promise<void>;
    terminateSession: (sessionId: string) => Promise<void>;
    updateAnomalyStatus: (anomalyId: string, status: SecurityAnomaly['status'], notes?: string, assignedTo?: string) => Promise<void>;
    archiveThreatAlert: (alertId: string) => Promise<void>;
}

export const AccessControlContext = createContext<AccessControlContextType | undefined>(undefined);

export const AccessControlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
    const [permissions] = useState<Permission[]>(MOCK_PERMISSIONS);
    const [policies, setPolicies] = useState<SecurityPolicy[]>(MOCK_SECURITY_POLICIES);
    const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(MOCK_ACTIVE_SESSIONS);
    const [anomalies, setAnomalies] = useState<SecurityAnomaly[]>(MOCK_SECURITY_ANOMALIES);
    const [threatAlerts, setThreatAlerts] = useState<ThreatIntelligenceAlert[]>(MOCK_THREAT_ALERTS);

    const simulateApiCall = useCallback(<T>(data: T, delay = 500): Promise<T> => {
        return new Promise(resolve => setTimeout(() => resolve(data), delay));
    }, []);

    const updateUser = useCallback(async (updatedUser: User) => {
        const result = await simulateApiCall(updatedUser);
        setUsers(prev => prev.map(u => (u.id === result.id ? result : u)));
        console.log('User updated:', result.username);
    }, [simulateApiCall]);

    const createUser = useCallback(async (newUser: Omit<User, 'id' | 'creationDate' | 'lastActivity' | 'riskScore'>) => {
        const userWithDefaults: User = {
            ...newUser,
            id: generateId(),
            creationDate: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            riskScore: getRandomInt(20, 70),
        };
        const result = await simulateApiCall(userWithDefaults);
        setUsers(prev => [...prev, result]);
        console.log('User created:', result.username);
        return result;
    }, [simulateApiCall]);

    const deleteUser = useCallback(async (userId: string) => {
        await simulateApiCall(userId); // Simulate deletion
        setUsers(prev => prev.filter(u => u.id !== userId));
        // Also remove user from any roles
        setRoles(prev => prev.map(r => ({ ...r, users: r.users.filter(id => id !== userId) })));
        console.log('User deleted:', userId);
    }, [simulateApiCall]);

    const updateRole = useCallback(async (updatedRole: Role) => {
        const result = await simulateApiCall(updatedRole);
        setRoles(prev => prev.map(r => (r.id === result.id ? result : r)));
        console.log('Role updated:', result.name);
    }, [simulateApiCall]);

    const createRole = useCallback(async (newRole: Omit<Role, 'id' | 'creationDate' | 'lastModified' | 'users'>) => {
        const roleWithDefaults: Role = {
            ...newRole,
            id: generateId(),
            creationDate: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            users: [],
        };
        const result = await simulateApiCall(roleWithDefaults);
        setRoles(prev => [...prev, result]);
        console.log('Role created:', result.name);
        return result;
    }, [simulateApiCall]);

    const deleteRole = useCallback(async (roleId: string) => {
        await simulateApiCall(roleId);
        setRoles(prev => prev.filter(r => r.id !== roleId));
        // Remove role from any users
        setUsers(prev => prev.map(u => ({ ...u, roles: u.roles.filter(id => id !== roleId) })));
        console.log('Role deleted:', roleId);
    }, [simulateApiCall]);

    const updatePolicy = useCallback(async (updatedPolicy: SecurityPolicy) => {
        const result = await simulateApiCall(updatedPolicy);
        setPolicies(prev => prev.map(p => (p.id === result.id ? result : result)));
        console.log('Policy updated:', result.name);
    }, [simulateApiCall]);

    const createPolicy = useCallback(async (newPolicy: Omit<SecurityPolicy, 'id' | 'creationDate' | 'lastModified'>) => {
        const policyWithDefaults: SecurityPolicy = {
            ...newPolicy,
            id: generateId(),
            creationDate: new Date().toISOString(),
            lastModified: new Date().toISOString(),
        };
        const result = await simulateApiCall(policyWithDefaults);
        setPolicies(prev => [...prev, result]);
        console.log('Policy created:', result.name);
        return result;
    }, [simulateApiCall]);

    const deletePolicy = useCallback(async (policyId: string) => {
        await simulateApiCall(policyId);
        setPolicies(prev => prev.filter(p => p.id !== policyId));
        console.log('Policy deleted:', policyId);
    }, [simulateApiCall]);

    const terminateSession = useCallback(async (sessionId: string) => {
        await simulateApiCall(sessionId);
        setActiveSessions(prev => prev.map(s => (s.id === sessionId ? { ...s, status: 'Terminated', lastActivity: new Date().toISOString() } : s)));
        console.log('Session terminated:', sessionId);
    }, [simulateApiCall]);

    const updateAnomalyStatus = useCallback(async (anomalyId: string, status: SecurityAnomaly['status'], notes?: string, assignedTo?: string) => {
        const updatedAnomaly = { status, resolutionNotes: notes, assignedTo };
        const result = await simulateApiCall(updatedAnomaly);
        setAnomalies(prev => prev.map(a => (a.id === anomalyId ? { ...a, ...result } : a)));
        console.log('Anomaly status updated:', anomalyId, status);
    }, [simulateApiCall]);

    const archiveThreatAlert = useCallback(async (alertId: string) => {
        await simulateApiCall(alertId);
        setThreatAlerts(prev => prev.map(a => (a.id === alertId ? { ...a, status: 'Archived' } : a)));
        console.log('Threat alert archived:', alertId);
    }, [simulateApiCall]);

    const value = useMemo(() => ({
        users, roles, permissions, policies, activeSessions, anomalies, threatAlerts,
        updateUser, createUser, deleteUser,
        updateRole, createRole, deleteRole,
        updatePolicy, createPolicy, deletePolicy,
        terminateSession, updateAnomalyStatus, archiveThreatAlert,
    }), [
        users, roles, permissions, policies, activeSessions, anomalies, threatAlerts,
        updateUser, createUser, deleteUser,
        updateRole, createRole, deleteRole,
        updatePolicy, createPolicy, deletePolicy,
        terminateSession, updateAnomalyStatus, archiveThreatAlert,
    ]);

    return <AccessControlContext.Provider value={value}>{children}</AccessControlContext.Provider>;
};

export const useAccessControl = () => {
    const context = useContext(AccessControlContext);
    if (!context) {
        throw new Error('useAccessControl must be used within an AccessControlProvider');
    }
    return context;
};

// --- NEW COMPONENT SECTIONS ---

/**
 * User Management Section Component.
 */
export const UserManagement: React.FC = () => {
    const { users, roles, updateUser, createUser, deleteUser } = useAccessControl();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | User['status']>('all');
    const [sortBy, setSortBy] = useState<keyof User | null>('username');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredAndSortedUsers = useMemo(() => {
        let filtered = users.filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.department.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filterStatus !== 'all') {
            filtered = filtered.filter(user => user.status === filterStatus);
        }

        if (sortBy) {
            filtered.sort((a, b) => {
                const aValue = a[sortBy];
                const bValue = b[sortBy];

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
                }
                // Fallback for other types or null
                return 0;
            });
        }
        return filtered;
    }, [users, searchTerm, filterStatus, sortBy, sortOrder]);

    const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedUsers, currentPage, itemsPerPage]);

    const handleSort = (key: keyof User) => {
        if (sortBy === key) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(key);
            setSortOrder('asc');
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsUserModalOpen(true);
    };

    const handleCreateUser = () => {
        setEditingUser(null);
        setIsUserModalOpen(true);
    };

    const handleSaveUser = async (formData: Omit<User, 'id' | 'creationDate' | 'lastActivity' | 'riskScore'> | User) => {
        if ('id' in formData) { // Existing user
            await updateUser(formData as User);
        } else { // New user
            await createUser(formData);
        }
        setIsUserModalOpen(false);
        setEditingUser(null);
    };

    return (
        <Card title="User Management">
            <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 min-w-[200px] p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | User['status'])}
                    className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Locked">Locked</option>
                </select>
                <button
                    onClick={handleCreateUser}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-sm"
                >
                    Add New User
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('username')}>
                                Username {sortBy === 'username' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('email')}>
                                Email {sortBy === 'email' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </th>
                            <th scope="col" className="px-6 py-3">Roles</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('status')}>
                                Status {sortBy === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </th>
                            <th scope="col" className="px-6 py-3">Last Login</th>
                            <th scope="col" className="px-6 py-3">MFA</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUsers.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center">No users found.</td>
                            </tr>
                        ) : (
                            paginatedUsers.map(user => (
                                <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white">{user.username}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        {user.roles.map(roleId => roles.find(r => r.id === roleId)?.name).join(', ') || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4"><StatusBadge status={user.status} type="status" /></td>
                                    <td className="px-6 py-4">{new Date(user.lastLogin).toLocaleString()}</td>
                                    <td className="px-6 py-4">{user.mfaEnabled ? 'Enabled' : 'Disabled'}</td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button onClick={() => handleEditUser(user)} className="text-blue-400 hover:text-blue-300">Edit</button>
                                        <button onClick={() => deleteUser(user.id)} className="text-red-400 hover:text-red-300">Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

            <UserFormModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                user={editingUser}
                onSave={handleSaveUser}
                allRoles={roles}
                allPermissions={permissions}
            />
        </Card>
    );
};

/**
 * User Form Modal for creating/editing users.
 */
export const UserFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSave: (user: Omit<User, 'id' | 'creationDate' | 'lastActivity' | 'riskScore'> | User) => Promise<void>;
    allRoles: Role[];
    allPermissions: Permission[];
}> = ({ isOpen, onClose, user, onSave, allRoles, allPermissions }) => {
    const [formData, setFormData] = useState<Partial<User>>({});
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData(user);
            setSelectedRoles(user.roles);
            setSelectedPermissions(user.permissions || []);
        } else {
            setFormData({});
            setSelectedRoles([]);
            setSelectedPermissions([]);
        }
        setError('');
    }, [user, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
        setSelectedRoles(options);
    };

    const handlePermissionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
        setSelectedPermissions(options);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const payload: Omit<User, 'id' | 'creationDate' | 'lastActivity' | 'riskScore'> | User = {
            ...formData,
            roles: selectedRoles,
            permissions: selectedPermissions,
        } as User;

        if (!payload.username || !payload.email || !payload.department) {
            setError('Username, Email, and Department are required.');
            setLoading(false);
            return;
        }
        if (user) { // Existing user
            payload.id = user.id;
            payload.creationDate = user.creationDate;
            payload.lastActivity = user.lastActivity;
            payload.riskScore = user.riskScore;
            // Ensure MFA is boolean
            payload.mfaEnabled = formData.mfaEnabled ?? user.mfaEnabled;
        } else { // New user, ensure essential properties
            payload.status = payload.status || 'Active';
            payload.lastLogin = payload.lastLogin || new Date().toISOString();
            payload.mfaEnabled = formData.mfaEnabled ?? false;
            payload.ipWhitelist = payload.ipWhitelist || [];
            payload.location = payload.location || getRandomElement(LOCATIONS);
        }

        try {
            await onSave(payload);
            onClose();
        } catch (err) {
            setError('Failed to save user.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Edit User' : 'Add New User'}>
            <form onSubmit={handleSubmit} className="space-y-4 text-gray-300">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div>
                    <label htmlFor="username" className="block text-sm font-medium">Username:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username || ''}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="department" className="block text-sm font-medium">Department:</label>
                    <input
                        type="text"
                        id="department"
                        name="department"
                        value={formData.department || ''}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="title" className="block text-sm font-medium">Title:</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title || ''}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium">Status:</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status || 'Active'}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Locked">Locked</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="roles" className="block text-sm font-medium">Roles:</label>
                    <select
                        multiple
                        id="roles"
                        name="roles"
                        value={selectedRoles}
                        onChange={handleRoleChange}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 h-24 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                        {allRoles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple roles.</p>
                </div>
                <div>
                    <label htmlFor="permissions" className="block text-sm font-medium">Direct Permissions:</label>
                    <select
                        multiple
                        id="permissions"
                        name="permissions"
                        value={selectedPermissions}
                        onChange={handlePermissionChange}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 h-24 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                        {allPermissions.map(perm => (
                            <option key={perm.id} value={perm.id}>{perm.name} ({perm.category})</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">These permissions are assigned directly, bypassing roles. Hold Ctrl/Cmd to select multiple.</p>
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="mfaEnabled"
                        name="mfaEnabled"
                        checked={formData.mfaEnabled || false}
                        onChange={handleChange}
                        className="mr-2 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                    />
                    <label htmlFor="mfaEnabled" className="text-sm font-medium">MFA Enabled</label>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-sm disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save User'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

/**
 * Role Management Section Component.
 */
export const RoleManagement: React.FC = () => {
    const { roles, permissions, users, updateRole, createRole, deleteRole } = useAccessControl();
    const [searchTerm, setSearchTerm] = useState('');
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const filteredRoles = useMemo(() => {
        return roles.filter(role =>
            role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            role.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [roles, searchTerm]);

    const handleEditRole = (role: Role) => {
        setEditingRole(role);
        setIsRoleModalOpen(true);
    };

    const handleCreateRole = () => {
        setEditingRole(null);
        setIsRoleModalOpen(true);
    };

    const handleSaveRole = async (formData: Omit<Role, 'id' | 'creationDate' | 'lastModified' | 'users'> | Role) => {
        if ('id' in formData) { // Existing role
            await updateRole(formData as Role);
        } else { // New role
            await createRole(formData);
        }
        setIsRoleModalOpen(false);
        setEditingRole(null);
    };

    return (
        <Card title="Role Management">
            <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 min-w-[200px] p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <button
                    onClick={handleCreateRole}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-sm"
                >
                    Add New Role
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Role Name</th>
                            <th scope="col" className="px-6 py-3">Description</th>
                            <th scope="col" className="px-6 py-3">Permissions Count</th>
                            <th scope="col" className="px-6 py-3">Users Count</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRoles.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center">No roles found.</td>
                            </tr>
                        ) : (
                            filteredRoles.map(role => (
                                <tr key={role.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white">{role.name}</td>
                                    <td className="px-6 py-4">{role.description}</td>
                                    <td className="px-6 py-4">{role.permissions.length}</td>
                                    <td className="px-6 py-4">{role.users.length}</td>
                                    <td className="px-6 py-4"><StatusBadge status={role.isActive ? 'Active' : 'Inactive'} type="status" /></td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button onClick={() => handleEditRole(role)} className="text-blue-400 hover:text-blue-300">Edit</button>
                                        <button onClick={() => deleteRole(role.id)} className="text-red-400 hover:text-red-300">Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <RoleFormModal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                role={editingRole}
                onSave={handleSaveRole}
                allPermissions={permissions}
            />
        </Card>
    );
};

/**
 * Role Form Modal for creating/editing roles.
 */
export const RoleFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    role: Role | null;
    onSave: (role: Omit<Role, 'id' | 'creationDate' | 'lastModified' | 'users'> | Role) => Promise<void>;
    allPermissions: Permission[];
}> = ({ isOpen, onClose, role, onSave, allPermissions }) => {
    const [formData, setFormData] = useState<Partial<Role>>({});
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (role) {
            setFormData(role);
            setSelectedPermissions(role.permissions);
        } else {
            setFormData({});
            setSelectedPermissions([]);
        }
        setError('');
    }, [role, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handlePermissionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
        setSelectedPermissions(options);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const payload: Omit<Role, 'id' | 'creationDate' | 'lastModified' | 'users'> | Role = {
            ...formData,
            permissions: selectedPermissions,
        } as Role;

        if (!payload.name || !payload.description) {
            setError('Role Name and Description are required.');
            setLoading(false);
            return;
        }

        if (role) { // Existing role
            payload.id = role.id;
            payload.creationDate = role.creationDate;
            payload.lastModified = role.lastModified;
            payload.users = role.users;
            payload.isActive = formData.isActive ?? role.isActive;
        } else { // New role
            payload.users = [];
            payload.isActive = formData.isActive ?? true;
            payload.level = payload.level || 'Custom';
        }

        try {
            await onSave(payload);
            onClose();
        } catch (err) {
            setError('Failed to save role.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={role ? 'Edit Role' : 'Add New Role'}>
            <form onSubmit={handleSubmit} className="space-y-4 text-gray-300">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium">Role Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="level" className="block text-sm font-medium">Role Level:</label>
                    <select
                        id="level"
                        name="level"
                        value={formData.level || 'Custom'}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                        <option value="System">System</option>
                        <option value="Admin">Admin</option>
                        <option value="User">User</option>
                        <option value="Guest">Guest</option>
                        <option value="Custom">Custom</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="permissions" className="block text-sm font-medium">Permissions:</label>
                    <select
                        multiple
                        id="permissions"
                        name="permissions"
                        value={selectedPermissions}
                        onChange={handlePermissionChange}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 h-48 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                        {allPermissions.map(perm => (
                            <option key={perm.id} value={perm.id}>{perm.name} ({perm.category})</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple permissions.</p>
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive ?? true}
                        onChange={handleChange}
                        className="mr-2 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium">Is Active</label>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-sm disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Role'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

/**
 * Security Policy Management Component.
 */
export const PolicyManagement: React.FC = () => {
    const { policies, updatePolicy, createPolicy, deletePolicy, roles, users } = useAccessControl();
    const [searchTerm, setSearchTerm] = useState('');
    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<SecurityPolicy | null>(null);

    const filteredPolicies = useMemo(() => {
        return policies.filter(policy =>
            policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            policy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            policy.type.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [policies, searchTerm]);

    const handleEditPolicy = (policy: SecurityPolicy) => {
        setEditingPolicy(policy);
        setIsPolicyModalOpen(true);
    };

    const handleCreatePolicy = () => {
        setEditingPolicy(null);
        setIsPolicyModalOpen(true);
    };

    const handleSavePolicy = async (formData: Omit<SecurityPolicy, 'id' | 'creationDate' | 'lastModified'> | SecurityPolicy) => {
        if ('id' in formData) { // Existing policy
            await updatePolicy(formData as SecurityPolicy);
        } else { // New policy
            await createPolicy(formData);
        }
        setIsPolicyModalOpen(false);
        setEditingPolicy(null);
    };

    const getTargetName = useCallback((scope: SecurityPolicy['enforcementScope'], targetId?: string) => {
        if (!targetId) return 'N/A';
        switch (scope) {
            case 'Role': return roles.find(r => r.id === targetId)?.name || targetId;
            case 'User': return users.find(u => u.id === targetId)?.username || targetId;
            case 'Department': return targetId; // Assuming department name is the ID
            default: return 'N/A';
        }
    }, [roles, users]);

    return (
        <Card title="Security Policy Management">
            <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Search policies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 min-w-[200px] p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <button
                    onClick={handleCreatePolicy}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-sm"
                >
                    Add New Policy
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Policy Name</th>
                            <th scope="col" className="px-6 py-3">Type</th>
                            <th scope="col" className="px-6 py-3">Scope</th>
                            <th scope="col" className="px-6 py-3">Targets</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPolicies.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center">No policies found.</td>
                            </tr>
                        ) : (
                            filteredPolicies.map(policy => (
                                <tr key={policy.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white">{policy.name}</td>
                                    <td className="px-6 py-4">{policy.type}</td>
                                    <td className="px-6 py-4">{policy.enforcementScope}</td>
                                    <td className="px-6 py-4">
                                        {policy.enforcementScope !== 'Global' && policy.targetIds && policy.targetIds.length > 0
                                            ? policy.targetIds.map(id => getTargetName(policy.enforcementScope, id)).join(', ')
                                            : 'Global'}
                                    </td>
                                    <td className="px-6 py-4"><StatusBadge status={policy.isEnabled ? 'Enabled' : 'Disabled'} type="status" /></td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button onClick={() => handleEditPolicy(policy)} className="text-blue-400 hover:text-blue-300">Edit</button>
                                        <button onClick={() => deletePolicy(policy.id)} className="text-red-400 hover:text-red-300">Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <PolicyFormModal
                isOpen={isPolicyModalOpen}
                onClose={() => setIsPolicyModalOpen(false)}
                policy={editingPolicy}
                onSave={handleSavePolicy}
                allRoles={roles}
                allUsers={users}
                allDepartments={DEPARTMENTS} // Using mock departments
            />
        </Card>
    );
};

/**
 * Policy Form Modal for creating/editing policies.
 */
export const PolicyFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    policy: SecurityPolicy | null;
    onSave: (policy: Omit<SecurityPolicy, 'id' | 'creationDate' | 'lastModified'> | SecurityPolicy) => Promise<void>;
    allRoles: Role[];
    allUsers: User[];
    allDepartments: string[];
}> = ({ isOpen, onClose, policy, onSave, allRoles, allUsers, allDepartments }) => {
    const [formData, setFormData] = useState<Partial<SecurityPolicy>>({});
    const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (policy) {
            setFormData(policy);
            setSelectedTargets(policy.targetIds || []);
        } else {
            setFormData({
                type: 'Password',
                enforcementScope: 'Global',
                isEnabled: true,
                parameters: {},
            });
            setSelectedTargets([]);
        }
        setError('');
    }, [policy, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData(prev => {
            const newFormData = { ...prev, [name]: type === 'checkbox' ? checked : value };
            // Reset targets if scope changes to Global
            if (name === 'enforcementScope' && value === 'Global') {
                setSelectedTargets([]);
                newFormData.targetIds = [];
            }
            // Clear parameters if type changes
            if (name === 'type' && value !== prev.type) {
                newFormData.parameters = {};
            }
            return newFormData;
        });
    };

    const handleParameterChange = (key: string, value: string | boolean | number) => {
        setFormData(prev => ({
            ...prev,
            parameters: {
                ...prev.parameters,
                [key]: value,
            },
        }));
    };

    const handleTargetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
        setSelectedTargets(options);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const payload: Omit<SecurityPolicy, 'id' | 'creationDate' | 'lastModified'> | SecurityPolicy = {
            ...formData,
            targetIds: formData.enforcementScope === 'Global' ? undefined : selectedTargets,
        } as SecurityPolicy;

        if (!payload.name || !payload.type || !payload.enforcementScope) {
            setError('Policy Name, Type, and Enforcement Scope are required.');
            setLoading(false);
            return;
        }

        if (payload.enforcementScope !== 'Global' && (!payload.targetIds || payload.targetIds.length === 0)) {
            setError('Please select at least one target for non-global policies.');
            setLoading(false);
            return;
        }

        if (policy) { // Existing policy
            payload.id = policy.id;
            payload.creationDate = policy.creationDate;
            payload.lastModified = policy.lastModified;
            payload.isEnabled = formData.isEnabled ?? policy.isEnabled;
        } else { // New policy
            payload.isEnabled = formData.isEnabled ?? true;
        }

        try {
            await onSave(payload);
            onClose();
        } catch (err) {
            setError('Failed to save policy.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const renderParameterFields = () => {
        const currentParams = formData.parameters || {};
        switch (formData.type) {
            case 'Password':
                return (
                    <>
                        <label className="block text-sm font-medium mt-2">Password Policy Parameters:</label>
                        <input type="number" placeholder="Min Length" value={currentParams.minLength || ''} onChange={(e) => handleParameterChange('minLength', parseInt(e.target.value) || 0)} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 mt-1" />
                        <label className="flex items-center mt-1"><input type="checkbox" checked={currentParams.requireUpper || false} onChange={(e) => handleParameterChange('requireUpper', e.target.checked)} className="mr-2 text-cyan-600 bg-gray-700 border-gray-600 rounded" /> Require Uppercase</label>
                        <label className="flex items-center mt-1"><input type="checkbox" checked={currentParams.requireLower || false} onChange={(e) => handleParameterChange('requireLower', e.target.checked)} className="mr-2 text-cyan-600 bg-gray-700 border-gray-600 rounded" /> Require Lowercase</label>
                        <label className="flex items-center mt-1"><input type="checkbox" checked={currentParams.requireNumber || false} onChange={(e) => handleParameterChange('requireNumber', e.target.checked)} className="mr-2 text-cyan-600 bg-gray-700 border-gray-600 rounded" /> Require Number</label>
                        <label className="flex items-center mt-1"><input type="checkbox" checked={currentParams.requireSymbol || false} onChange={(e) => handleParameterChange('requireSymbol', e.target.checked)} className="mr-2 text-cyan-600 bg-gray-700 border-gray-600 rounded" /> Require Symbol</label>
                        <input type="number" placeholder="Expiry Days (0 for never)" value={currentParams.expiryDays || ''} onChange={(e) => handleParameterChange('expiryDays', parseInt(e.target.value) || 0)} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 mt-1" />
                        <input type="number" placeholder="History Count" value={currentParams.historyCount || ''} onChange={(e) => handleParameterChange('historyCount', parseInt(e.target.value) || 0)} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 mt-1" />
                    </>
                );
            case 'MFA':
                return (
                    <>
                        <label className="block text-sm font-medium mt-2">MFA Policy Parameters:</label>
                        <label className="flex items-center mt-1"><input type="checkbox" checked={currentParams.required || false} onChange={(e) => handleParameterChange('required', e.target.checked)} className="mr-2 text-cyan-600 bg-gray-700 border-gray-600 rounded" /> MFA Required</label>
                        <input type="text" placeholder="Allowed Methods (comma separated: TOTP,SMS,Email)" value={currentParams.methods?.join(',') || ''} onChange={(e) => handleParameterChange('methods', e.target.value.split(',').map(s => s.trim()))} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 mt-1" />
                        <input type="number" placeholder="Grace Period Days" value={currentParams.gracePeriodDays || ''} onChange={(e) => handleParameterChange('gracePeriodDays', parseInt(e.target.value) || 0)} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 mt-1" />
                    </>
                );
            case 'Session':
                return (
                    <>
                        <label className="block text-sm font-medium mt-2">Session Policy Parameters:</label>
                        <input type="number" placeholder="Inactivity Timeout (minutes)" value={currentParams.inactivityTimeoutMinutes || ''} onChange={(e) => handleParameterChange('inactivityTimeoutMinutes', parseInt(e.target.value) || 0)} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 mt-1" />
                        <input type="number" placeholder="Max Session Duration (hours)" value={currentParams.maxSessionDurationHours || ''} onChange={(e) => handleParameterChange('maxSessionDurationHours', parseInt(e.target.value) || 0)} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 mt-1" />
                    </>
                );
            case 'IP Restriction':
                return (
                    <>
                        <label className="block text-sm font-medium mt-2">IP Restriction Parameters:</label>
                        <textarea placeholder="Allowed IPs (one per line, CIDR notation supported)" value={currentParams.allowedIPs?.join('\n') || ''} onChange={(e) => handleParameterChange('allowedIPs', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} rows={3} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 mt-1" />
                        <select value={currentParams.action || 'Deny_Others'} onChange={(e) => handleParameterChange('action', e.target.value)} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 mt-1">
                            <option value="Deny_Others">Deny Others</option>
                            <option value="Allow_Others">Allow Others (Blacklist)</option>
                        </select>
                    </>
                );
            case 'Data Access':
                return (
                    <>
                        <label className="block text-sm font-medium mt-2">Data Access Parameters:</label>
                        <select value={currentParams.accessLevel || 'Restricted'} onChange={(e) => handleParameterChange('accessLevel', e.target.value)} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 mt-1">
                            <option value="Full">Full</option>
                            <option value="Restricted">Restricted</option>
                            <option value="Read_Only">Read-Only</option>
                            <option value="No_Access">No Access</option>
                        </select>
                        <input type="text" placeholder="Sensitive Data Tags (comma separated)" value={currentParams.sensitiveDataTags?.join(',') || ''} onChange={(e) => handleParameterChange('sensitiveDataTags', e.target.value.split(',').map(s => s.trim()))} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 mt-1" />
                        <label className="flex items-center mt-1"><input type="checkbox" checked={currentParams.readOnly || false} onChange={(e) => handleParameterChange('readOnly', e.target.checked)} className="mr-2 text-cyan-600 bg-gray-700 border-gray-600 rounded" /> Read Only Access</label>
                    </>
                );
            default:
                return (
                    <div className="text-gray-500 text-sm italic mt-2">No specific parameters for this policy type or Custom policy.</div>
                );
        }
    };

    const targetOptions = useMemo(() => {
        switch (formData.enforcementScope) {
            case 'Role': return allRoles.map(r => ({ value: r.id, label: r.name }));
            case 'User': return allUsers.map(u => ({ value: u.id, label: u.username }));
            case 'Department': return allDepartments.map(d => ({ value: d, label: d }));
            default: return [];
        }
    }, [formData.enforcementScope, allRoles, allUsers, allDepartments]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={policy ? 'Edit Security Policy' : 'Add New Security Policy'}>
            <form onSubmit={handleSubmit} className="space-y-4 text-gray-300">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium">Policy Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="type" className="block text-sm font-medium">Policy Type:</label>
                    <select
                        id="type"
                        name="type"
                        value={formData.type || 'Password'}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                        <option value="Password">Password</option>
                        <option value="MFA">MFA</option>
                        <option value="Session">Session</option>
                        <option value="IP Restriction">IP Restriction</option>
                        <option value="Data Access">Data Access</option>
                        <option value="Custom">Custom</option>
                    </select>
                </div>

                {renderParameterFields()}

                <div>
                    <label htmlFor="enforcementScope" className="block text-sm font-medium">Enforcement Scope:</label>
                    <select
                        id="enforcementScope"
                        name="enforcementScope"
                        value={formData.enforcementScope || 'Global'}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                        <option value="Global">Global</option>
                        <option value="Department">Department</option>
                        <option value="Role">Role</option>
                        <option value="User">User</option>
                    </select>
                </div>
                {formData.enforcementScope !== 'Global' && (
                    <div>
                        <label htmlFor="targetIds" className="block text-sm font-medium">Policy Targets ({formData.enforcementScope}):</label>
                        <select
                            multiple
                            id="targetIds"
                            name="targetIds"
                            value={selectedTargets}
                            onChange={handleTargetChange}
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 h-24 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                            {targetOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple targets.</p>
                    </div>
                )}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="isEnabled"
                        name="isEnabled"
                        checked={formData.isEnabled ?? true}
                        onChange={handleChange}
                        className="mr-2 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                    />
                    <label htmlFor="isEnabled" className="text-sm font-medium">Is Enabled</label>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-sm disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Policy'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

/**
 * Active Sessions Section Component.
 */
export const ActiveSessionsView: React.FC = () => {
    const { activeSessions, terminateSession, users } = useAccessControl();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | ActiveSession['status']>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredSessions = useMemo(() => {
        let filtered = activeSessions.filter(session =>
            session.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.device.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filterStatus !== 'all') {
            filtered = filtered.filter(session => session.status === filterStatus);
        }
        return filtered;
    }, [activeSessions, searchTerm, filterStatus]);

    const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
    const paginatedSessions = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredSessions.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredSessions, currentPage, itemsPerPage]);

    return (
        <Card title="Active User Sessions">
            <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Search sessions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 min-w-[200px] p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | ActiveSession['status'])}
                    className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Idle">Idle</option>
                    <option value="Terminated">Terminated</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">User</th>
                            <th scope="col" className="px-6 py-3">IP Address</th>
                            <th scope="col" className="px-6 py-3">Location</th>
                            <th scope="col" className="px-6 py-3">Device</th>
                            <th scope="col" className="px-6 py-3">Login Time</th>
                            <th scope="col" className="px-6 py-3">Last Activity</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedSessions.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-center">No active sessions found.</td>
                            </tr>
                        ) : (
                            paginatedSessions.map(session => (
                                <tr key={session.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white">{session.username}</td>
                                    <td className="px-6 py-4 font-mono">{session.ipAddress}</td>
                                    <td className="px-6 py-4">{session.location}</td>
                                    <td className="px-6 py-4">{session.device}</td>
                                    <td className="px-6 py-4">{new Date(session.loginTime).toLocaleString()}</td>
                                    <td className="px-6 py-4">{new Date(session.lastActivity).toLocaleString()}</td>
                                    <td className="px-6 py-4"><StatusBadge status={session.status} type="status" /></td>
                                    <td className="px-6 py-4">
                                        {session.status !== 'Terminated' ? (
                                            <button
                                                onClick={() => terminateSession(session.id)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                Terminate
                                            </button>
                                        ) : (
                                            <span className="text-gray-500">N/A</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </Card>
    );
};

/**
 * Anomaly Detection Section Component.
 */
export const AnomalyDetectionView: React.FC = () => {
    const { anomalies, updateAnomalyStatus, users } = useAccessControl();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSeverity, setFilterSeverity] = useState<'all' | SecurityAnomaly['severity']>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | SecurityAnomaly['status']>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [isAnomalyModalOpen, setIsAnomalyModalOpen] = useState(false);
    const [selectedAnomaly, setSelectedAnomaly] = useState<SecurityAnomaly | null>(null);

    const filteredAnomalies = useMemo(() => {
        let filtered = anomalies.filter(anomaly =>
            anomaly.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            anomaly.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (anomaly.relatedIpAddress?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (users.find(u => u.id === anomaly.relatedUserId)?.username.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (filterSeverity !== 'all') {
            filtered = filtered.filter(anomaly => anomaly.severity === filterSeverity);
        }
        if (filterStatus !== 'all') {
            filtered = filtered.filter(anomaly => anomaly.status === filterStatus);
        }
        return filtered;
    }, [anomalies, searchTerm, filterSeverity, filterStatus, users]);

    const totalPages = Math.ceil(filteredAnomalies.length / itemsPerPage);
    const paginatedAnomalies = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAnomalies.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAnomalies, currentPage, itemsPerPage]);

    const handleViewAnomaly = (anomaly: SecurityAnomaly) => {
        setSelectedAnomaly(anomaly);
        setIsAnomalyModalOpen(true);
    };

    const handleUpdateAnomaly = async (anomalyId: string, status: SecurityAnomaly['status'], notes?: string, assignedTo?: string) => {
        await updateAnomalyStatus(anomalyId, status, notes, assignedTo);
        setIsAnomalyModalOpen(false); // Close after update
    };

    return (
        <Card title="Anomaly Detection">
            <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Search anomalies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 min-w-[200px] p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value as 'all' | SecurityAnomaly['severity'])}
                    className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                    <option value="all">All Severities</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | SecurityAnomaly['status'])}
                    className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                    <option value="all">All Statuses</option>
                    <option value="New">New</option>
                    <option value="Investigating">Investigating</option>
                    <option value="Resolved">Resolved</option>
                    <option value="False Positive">False Positive</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Timestamp</th>
                            <th scope="col" className="px-6 py-3">Type</th>
                            <th scope="col" className="px-6 py-3">Description</th>
                            <th scope="col" className="px-6 py-3">Severity</th>
                            <th scope="col" className="px-6 py-3">User/IP</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedAnomalies.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center">No anomalies found.</td>
                            </tr>
                        ) : (
                            paginatedAnomalies.map(anomaly => (
                                <tr key={anomaly.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4">{new Date(anomaly.timestamp).toLocaleString()}</td>
                                    <td className="px-6 py-4">{anomaly.type}</td>
                                    <td className="px-6 py-4 max-w-xs truncate">{anomaly.description}</td>
                                    <td className="px-6 py-4"><StatusBadge status={anomaly.severity} type="severity" /></td>
                                    <td className="px-6 py-4">
                                        {anomaly.relatedUserId ? users.find(u => u.id === anomaly.relatedUserId)?.username : anomaly.relatedIpAddress || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4"><StatusBadge status={anomaly.status} type="status" /></td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleViewAnomaly(anomaly)}
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

            {selectedAnomaly && (
                <AnomalyDetailModal
                    isOpen={isAnomalyModalOpen}
                    onClose={() => setIsAnomalyModalOpen(false)}
                    anomaly={selectedAnomaly}
                    onUpdate={handleUpdateAnomaly}
                    allUsers={users}
                />
            )}
        </Card>
    );
};

/**
 * Anomaly Detail Modal.
 */
export const AnomalyDetailModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    anomaly: SecurityAnomaly;
    onUpdate: (anomalyId: string, status: SecurityAnomaly['status'], notes?: string, assignedTo?: string) => Promise<void>;
    allUsers: User[];
}> = ({ isOpen, onClose, anomaly, onUpdate, allUsers }) => {
    const [currentStatus, setCurrentStatus] = useState<SecurityAnomaly['status']>(anomaly.status);
    const [resolutionNotes, setResolutionNotes] = useState(anomaly.resolutionNotes || '');
    const [assignedToUser, setAssignedToUser] = useState(anomaly.assignedTo || '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setCurrentStatus(anomaly.status);
        setResolutionNotes(anomaly.resolutionNotes || '');
        setAssignedToUser(anomaly.assignedTo || '');
    }, [anomaly]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await onUpdate(anomaly.id, currentStatus, resolutionNotes, assignedToUser || undefined);
            onClose();
        } catch (error) {
            console.error('Failed to update anomaly:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Anomaly Details: ${anomaly.type}`}>
            <div className="space-y-4 text-gray-300">
                <p><strong>Timestamp:</strong> {new Date(anomaly.timestamp).toLocaleString()}</p>
                <p><strong>Severity:</strong> <StatusBadge status={anomaly.severity} type="severity" /></p>
                <p><strong>Description:</strong> {anomaly.description}</p>
                {anomaly.relatedUserId && <p><strong>Related User:</strong> {allUsers.find(u => u.id === anomaly.relatedUserId)?.username || anomaly.relatedUserId}</p>}
                {anomaly.relatedIpAddress && <p><strong>Related IP:</strong> {anomaly.relatedIpAddress}</p>}
                <p><strong>Triggered Rules:</strong> {anomaly.triggeredRules.join(', ')}</p>

                <div>
                    <label htmlFor="status" className="block text-sm font-medium">Status:</label>
                    <select
                        id="status"
                        value={currentStatus}
                        onChange={(e) => setCurrentStatus(e.target.value as SecurityAnomaly['status'])}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                        <option value="New">New</option>
                        <option value="Investigating">Investigating</option>
                        <option value="Resolved">Resolved</option>
                        <option value="False Positive">False Positive</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="assignedTo" className="block text-sm font-medium">Assigned To:</label>
                    <select
                        id="assignedTo"
                        value={assignedToUser}
                        onChange={(e) => setAssignedToUser(e.target.value)}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                        <option value="">Unassigned</option>
                        {allUsers.map(user => (
                            <option key={user.id} value={user.id}>{user.username}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="resolutionNotes" className="block text-sm font-medium">Resolution Notes:</label>
                    <textarea
                        id="resolutionNotes"
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        rows={4}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        placeholder="Add notes about investigation and resolution..."
                    />
                </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-sm disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </Modal>
    );
};

/**
 * Threat Intelligence Feed Component.
 */
export const ThreatIntelligenceFeed: React.FC = () => {
    const { threatAlerts, archiveThreatAlert } = useAccessControl();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSeverity, setFilterSeverity] = useState<'all' | ThreatIntelligenceAlert['severity']>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | ThreatIntelligenceAlert['status']>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const filteredAlerts = useMemo(() => {
        let filtered = threatAlerts.filter(alert =>
            alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.relatedCVEs?.some(cve => cve.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (filterSeverity !== 'all') {
            filtered = filtered.filter(alert => alert.severity === filterSeverity);
        }
        if (filterStatus !== 'all') {
            filtered = filtered.filter(alert => alert.status === filterStatus);
        }
        return filtered;
    }, [threatAlerts, searchTerm, filterSeverity, filterStatus]);

    const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);
    const paginatedAlerts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAlerts.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAlerts, currentPage, itemsPerPage]);

    return (
        <Card title="Threat Intelligence Feed">
            <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Search threats..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 min-w-[200px] p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value as 'all' | ThreatIntelligenceAlert['severity'])}
                    className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                    <option value="all">All Severities</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | ThreatIntelligenceAlert['status'])}
                    className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                    <option value="Mitigated">Mitigated</option>
                </select>
            </div>

            <div className="space-y-4">
                {paginatedAlerts.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">No threat alerts found matching criteria.</p>
                ) : (
                    paginatedAlerts.map(alert => (
                        <div key={alert.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-cyan-600 transition-colors duration-200">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-lg font-semibold text-white">{alert.title}</h4>
                                <div className="flex space-x-2">
                                    <StatusBadge status={alert.severity} type="severity" />
                                    <StatusBadge status={alert.status} type="status" />
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm mb-2">{alert.description}</p>
                            <div className="flex flex-wrap items-center text-xs text-gray-500 gap-x-4 gap-y-2">
                                <span>Source: <span className="text-white">{alert.source}</span></span>
                                <span>Detected: <span className="text-white">{new Date(alert.timestamp).toLocaleString()}</span></span>
                                {alert.relatedCVEs && alert.relatedCVEs.length > 0 && (
                                    <span>CVEs: <span className="text-white">{alert.relatedCVEs.join(', ')}</span></span>
                                )}
                                <span>Vector: <span className="text-white">{alert.detectionVector}</span></span>
                            </div>
                            <div className="mt-3 flex justify-end">
                                {alert.status !== 'Archived' && (
                                    <button
                                        onClick={() => archiveThreatAlert(alert.id)}
                                        className="px-3 py-1 bg-red-600/30 text-red-300 hover:bg-red-700/50 rounded text-xs"
                                    >
                                        Archive Alert
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </Card>
    );
};

// --- GLOBAL SECURITY OVERVIEW KPIs ---
export const SecurityOverviewKPIs: React.FC = () => {
    const { users, roles, policies, activeSessions, anomalies, threatAlerts } = useAccessControl();

    const currentKPIData = useMemo(() => ({
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'Active').length,
        totalRoles: roles.length,
        enabledPolicies: policies.filter(p => p.isEnabled).length,
        activeSessionsCount: activeSessions.filter(s => s.status === 'Active').length,
        newAnomalies: anomalies.filter(a => a.status === 'New').length,
        activeThreatAlerts: threatAlerts.filter(t => t.status === 'Active').length,
        usersWithoutMFA: users.filter(u => !u.mfaEnabled && u.status === 'Active').length,
        highRiskUsers: users.filter(u => u.riskScore >= 70 && u.status === 'Active').length,
    }), [users, roles, policies, activeSessions, anomalies, threatAlerts]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
            <Card className="text-center">
                <p className="text-4xl font-bold text-white">{currentKPIData.totalUsers}</p>
                <p className="text-sm text-gray-400 mt-1">Total Users</p>
                <p className="text-xs text-green-400">{currentKPIData.activeUsers} Active</p>
            </Card>
            <Card className="text-center">
                <p className="text-4xl font-bold text-white">{currentKPIData.totalRoles}</p>
                <p className="text-sm text-gray-400 mt-1">Defined Roles</p>
                <p className="text-xs text-gray-400">{roles.filter(r => r.isActive).length} Active Roles</p>
            </Card>
            <Card className="text-center">
                <p className="text-4xl font-bold text-green-400">{currentKPIData.enabledPolicies}</p>
                <p className="text-sm text-gray-400 mt-1">Enabled Security Policies</p>
                <p className="text-xs text-gray-400">{policies.length} Total Policies</p>
            </Card>
            <Card className="text-center">
                <p className="text-4xl font-bold text-cyan-400">{currentKPIData.activeSessionsCount}</p>
                <p className="text-sm text-gray-400 mt-1">Active Sessions</p>
                <p className="text-xs text-gray-400">{activeSessions.length - currentKPIData.activeSessionsCount} Idle</p>
            </Card>
            <Card className="text-center">
                <p className="text-4xl font-bold text-orange-400">{currentKPIData.newAnomalies}</p>
                <p className="text-sm text-gray-400 mt-1">New Anomalies</p>
                <p className="text-xs text-red-400">{anomalies.filter(a => a.status === 'Investigating').length} Investigating</p>
            </Card>
            <Card className="text-center">
                <p className="text-4xl font-bold text-red-400">{currentKPIData.activeThreatAlerts}</p>
                <p className="text-sm text-gray-400 mt-1">Active Threat Alerts</p>
                <p className="text-xs text-gray-400">{threatAlerts.filter(t => t.status === 'Archived').length} Archived</p>
            </Card>
            <Card className="text-center">
                <p className="text-4xl font-bold text-yellow-400">{currentKPIData.usersWithoutMFA}</p>
                <p className="text-sm text-gray-400 mt-1">Users w/o MFA</p>
                <p className="text-xs text-gray-400">{users.filter(u => u.mfaEnabled).length} MFA Enabled</p>
            </Card>
            <Card className="text-center">
                <p className="text-4xl font-bold text-red-500">{currentKPIData.highRiskUsers}</p>
                <p className="text-sm text-gray-400 mt-1">High-Risk Users</p>
                <p className="text-xs text-gray-400">Review Required</p>
            </Card>
        </div>
    );
};

// --- ADDITIONAL CHARTS AND VISUALIZATIONS ---

export const AccessStatusPieChart: React.FC<{ logs: AccessLog[] }> = ({ logs }) => {
    const data = useMemo(() => {
        const success = logs.filter(log => log.status === 'Success').length;
        const failed = logs.filter(log => log.status === 'Failed').length;
        return [
            { name: 'Successful', value: success, color: '#10b981' },
            { name: 'Failed', value: failed, color: '#ef4444' },
        ];
    }, [logs]);

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <Card title="Access Status Breakdown">
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );
};

export const AnomalySeverityBarChart: React.FC = () => {
    const { anomalies } = useAccessControl();
    const data = useMemo(() => {
        const counts: { [key: string]: number } = {
            Critical: 0, High: 0, Medium: 0, Low: 0
        };
        anomalies.filter(a => a.status !== 'Resolved' && a.status !== 'False Positive').forEach(anomaly => {
            counts[anomaly.severity]++;
        });
        return Object.entries(counts).map(([severity, count]) => ({ severity, count }));
    }, [anomalies]);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Critical': return '#9a2e2e'; // Darker red
            case 'High': return '#ef4444'; // Red
            case 'Medium': return '#f59e0b'; // Orange
            case 'Low': return '#22c55e'; // Green
            default: return '#6b7280'; // Gray
        }
    };

    return (
        <Card title="Anomalies by Severity (Open)">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <XAxis dataKey="severity" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                    <Legend />
                    <Bar dataKey="count" name="Count" fill="#8884d8">
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getSeverityColor(entry.severity)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};

// --- MAIN ACCESS CONTROLS VIEW COMPONENT ---

/**
 * The primary Access Controls Dashboard view component.
 * This component orchestrates various security and access management features.
 */
const AccessControlsView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("AccessControlsView must be within a DataProvider");

    const { accessLogs } = context;
    const [filter, setFilter] = useState<'all' | 'Success' | 'Failed'>('all');
    const [activeTab, setActiveTab] = useState<string>('Overview'); // For tabbed navigation

    const filteredLogs = useMemo(() => {
        return accessLogs.filter(log => filter === 'all' || log.status === filter);
    }, [accessLogs, filter]);

    const kpiData = useMemo(() => ({
        totalUsers: new Set(accessLogs.map(log => log.user)).size,
        failedLogins24h: accessLogs.filter(log => log.status === 'Failed' && (Date.now() - new Date(log.timestamp).getTime() < 24 * 60 * 60 * 1000)).length,
        highRiskEvents: accessLogs.filter(log => log.riskLevel === 'High' && (Date.now() - new Date(log.timestamp).getTime() < 24 * 60 * 60 * 1000)).length,
    }), [accessLogs]);

    const chartData = useMemo(() => {
        const dataByHour: { [key: string]: { success: number, failed: number } } = {};
        const now = new Date();
        const startOf24hAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Initialize data for the last 24 hours
        for (let i = 0; i <= 24; i++) {
            const date = new Date(startOf24hAgo.getTime() + i * 60 * 60 * 1000);
            const hourKey = `${String(date.getHours()).padStart(2, '0')}:00`;
            dataByHour[hourKey] = { success: 0, failed: 0 };
        }

        accessLogs.forEach(log => {
            const logDate = new Date(log.timestamp);
            if (logDate.getTime() >= startOf24hAgo.getTime()) {
                const hourKey = `${String(logDate.getHours()).padStart(2, '0')}:00`;
                if (!dataByHour[hourKey]) dataByHour[hourKey] = { success: 0, failed: 0 }; // Fallback, though initialized
                if (log.status === 'Success') dataByHour[hourKey].success++;
                else dataByHour[hourKey].failed++;
            }
        });

        // Ensure sorted by hour
        return Object.entries(dataByHour)
            .map(([hour, counts]) => ({ hour, ...counts }))
            .sort((a, b) => {
                const hourA = parseInt(a.hour.split(':')[0]);
                const hourB = parseInt(b.hour.split(':')[0]);
                return (hourA < (new Date().getHours()) ? hourA + 24 : hourA) - (hourB < (new Date().getHours()) ? hourB + 24 : hourB);
            });
    }, [accessLogs]);

    // This is the original RiskBadge, renamed to avoid conflict and used directly.
    const RiskBadge: React.FC<{ level: AccessLog['riskLevel'] }> = ({ level }) => {
        const colors = {
            'Low': 'bg-green-500/20 text-green-300',
            'Medium': 'bg-yellow-500/20 text-yellow-300',
            'High': 'bg-red-500/20 text-red-300',
        };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[level]}`}>{level}</span>;
    };

    const tabs = [
        'Overview', 'User Management', 'Role Management', 'Policies',
        'Active Sessions', 'Anomaly Detection', 'Threat Intelligence', 'Audit Logs'
    ];

    const [auditLogSearchTerm, setAuditLogSearchTerm] = useState('');
    const [auditLogFilterUser, setAuditLogFilterUser] = useState('all');
    const [auditLogFilterAction, setAuditLogFilterAction] = useState('all');
    const [auditLogCurrentPage, setAuditLogCurrentPage] = useState(1);
    const auditLogItemsPerPage = 15;

    const auditLogData = useMemo(() => {
        // We'll use accessLogs as a stand-in for detailed audit logs
        const mockAuditLogs: AccessLog[] = MOCK_ACCESS_LOGS.map(log => ({
            ...log,
            action: log.action || 'Unknown Action', // Ensure action property
            details: `Accessed ${log.action} from ${log.ip} using ${log.device}. Status: ${log.status}.`
        })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Newest first

        let filtered = mockAuditLogs.filter(log =>
            (log.user.toLowerCase().includes(auditLogSearchTerm.toLowerCase()) ||
            log.ip.toLowerCase().includes(auditLogSearchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(auditLogSearchTerm.toLowerCase()) ||
            log.details?.toLowerCase().includes(auditLogSearchTerm.toLowerCase()))
        );

        if (auditLogFilterUser !== 'all') {
            filtered = filtered.filter(log => log.user === auditLogFilterUser);
        }
        if (auditLogFilterAction !== 'all') {
            filtered = filtered.filter(log => log.action === auditLogFilterAction);
        }
        return filtered;
    }, [MOCK_ACCESS_LOGS, auditLogSearchTerm, auditLogFilterUser, auditLogFilterAction]);

    const auditLogTotalPages = Math.ceil(auditLogData.length / auditLogItemsPerPage);
    const paginatedAuditLogs = useMemo(() => {
        const startIndex = (auditLogCurrentPage - 1) * auditLogItemsPerPage;
        return auditLogData.slice(startIndex, startIndex + auditLogItemsPerPage);
    }, [auditLogData, auditLogCurrentPage, auditLogItemsPerPage]);

    // Unique users and actions for filters
    const uniqueAuditUsers = useMemo(() => ['all', ...new Set(MOCK_ACCESS_LOGS.map(log => log.user))].sort(), []);
    const uniqueAuditActions = useMemo(() => ['all', ...new Set(MOCK_ACCESS_LOGS.map(log => log.action))].sort(), []);


    return (
        <AccessControlProvider>
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white tracking-wider">Access Controls Dashboard</h2>

                <nav className="flex space-x-2 border-b border-gray-700 mb-6 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200
                                ${activeTab === tab ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>

                {activeTab === 'Overview' && (
                    <>
                        <SecurityOverviewKPIs />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card className="text-center"><p className="text-3xl font-bold text-white">{kpiData.totalUsers}</p><p className="text-sm text-gray-400 mt-1">Total Users (Access Logs)</p></Card>
                            <Card className="text-center"><p className="text-3xl font-bold text-red-400">{kpiData.failedLogins24h}</p><p className="text-sm text-gray-400 mt-1">Failed Logins (24h)</p></Card>
                            <Card className="text-center"><p className="text-3xl font-bold text-orange-400">{kpiData.highRiskEvents}</p><p className="text-sm text-gray-400 mt-1">High-Risk Events (24h)</p></Card>
                            <Card className="text-center"><p className="text-3xl font-bold text-yellow-400">{(MOCK_SECURITY_POLICIES.filter(p => !p.isEnabled).length)}</p><p className="text-sm text-gray-400 mt-1">Disabled Policies</p></Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card title="Login Attempts (Last 24 hours)">
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData}>
                                        <XAxis dataKey="hour" stroke="#9ca3af" fontSize={12} />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="success" name="Successful" stroke="#10b981" dot={false} />
                                        <Line type="monotone" dataKey="failed" name="Failed" stroke="#ef4444" dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Card>
                            <AccessStatusPieChart logs={accessLogs} />
                            <AnomalySeverityBarChart />
                            <Card title="Recent Access Events">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold text-white"></h3>
                                    <div className="flex space-x-1 p-1 bg-gray-900/50 rounded-lg">
                                        {(['all', 'Success', 'Failed'] as const).map(status => (
                                            <button key={status} onClick={() => setFilter(status)} className={`px-3 py-1 text-sm rounded-md ${filter === status ? 'bg-cyan-600' : ''}`}>{status}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-400">
                                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                            <tr>
                                                <th scope="col" className="px-6 py-3">User</th>
                                                <th scope="col" className="px-6 py-3">IP Address</th>
                                                <th scope="col" className="px-6 py-3">Location</th>
                                                <th scope="col" className="px-6 py-3">Time</th>
                                                <th scope="col" className="px-6 py-3">Status</th>
                                                <th scope="col" className="px-6 py-3">Risk Level</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredLogs.slice(0, 5).map(log => ( // Show only top 5 for overview
                                                <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                                    <td className="px-6 py-4 font-medium text-white">{log.user}</td>
                                                    <td className="px-6 py-4 font-mono">{log.ip}</td>
                                                    <td className="px-6 py-4">{log.location}</td>
                                                    <td className="px-6 py-4">{log.timestamp}</td>
                                                    <td className="px-6 py-4"><span className={log.status === 'Success' ? 'text-green-400' : 'text-red-400'}>{log.status}</span></td>
                                                    <td className="px-6 py-4"><RiskBadge level={log.riskLevel} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    </>
                )}

                {activeTab === 'User Management' && <UserManagement />}
                {activeTab === 'Role Management' && <RoleManagement />}
                {activeTab === 'Policies' && <PolicyManagement />}
                {activeTab === 'Active Sessions' && <ActiveSessionsView />}
                {activeTab === 'Anomaly Detection' && <AnomalyDetectionView />}
                {activeTab === 'Threat Intelligence' && <ThreatIntelligenceFeed />}

                {activeTab === 'Audit Logs' && (
                    <Card title="Comprehensive Audit Logs">
                        <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                            <input
                                type="text"
                                placeholder="Search logs (user, IP, action, details)..."
                                value={auditLogSearchTerm}
                                onChange={(e) => setAuditLogSearchTerm(e.target.value)}
                                className="flex-1 min-w-[200px] p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            />
                            <select
                                value={auditLogFilterUser}
                                onChange={(e) => setAuditLogFilterUser(e.target.value)}
                                className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                                {uniqueAuditUsers.map(user => (
                                    <option key={user} value={user}>{user === 'all' ? 'All Users' : user}</option>
                                ))}
                            </select>
                            <select
                                value={auditLogFilterAction}
                                onChange={(e) => setAuditLogFilterAction(e.target.value)}
                                className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                                {uniqueAuditActions.map(action => (
                                    <option key={action} value={action}>{action === 'all' ? 'All Actions' : action}</option>
                                ))}
                            </select>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Timestamp</th>
                                        <th scope="col" className="px-6 py-3">User</th>
                                        <th scope="col" className="px-6 py-3">Action</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                        <th scope="col" className="px-6 py-3">IP Address</th>
                                        <th scope="col" className="px-6 py-3">Location</th>
                                        <th scope="col" className="px-6 py-3">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedAuditLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-4 text-center">No audit logs found matching criteria.</td>
                                        </tr>
                                    ) : (
                                        paginatedAuditLogs.map(log => (
                                            <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                                <td className="px-6 py-4">{new Date(log.timestamp).toLocaleString()}</td>
                                                <td className="px-6 py-4 font-medium text-white">{log.user}</td>
                                                <td className="px-6 py-4">{log.action}</td>
                                                <td className="px-6 py-4"><span className={log.status === 'Success' ? 'text-green-400' : 'text-red-400'}>{log.status}</span></td>
                                                <td className="px-6 py-4 font-mono">{log.ip}</td>
                                                <td className="px-6 py-4">{log.location}</td>
                                                <td className="px-6 py-4 max-w-xs truncate">{log.details || 'N/A'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination currentPage={auditLogCurrentPage} totalPages={auditLogTotalPages} onPageChange={setAuditLogCurrentPage} />
                    </Card>
                )}
            </div>
        </AccessControlProvider>
    );
};

export default AccessControlsView;