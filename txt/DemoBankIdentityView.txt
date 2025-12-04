import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Card from '../../Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

// In a real app, this data would come from a dedicated file or a live API call
const authEventsData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  success: 1800 + Math.random() * 400,
  failed: 20 + Math.random() * 25,
}));
const recentSignIns = [
    { id: 1, user: 'visionary@demobank.com', ip: '192.168.1.1', location: 'New York, USA', status: 'Success', timestamp: new Date().toISOString() },
    { id: 2, user: 'alex.c@quantum.corp', ip: '203.0.113.5', location: 'Tokyo, Japan', status: 'Success', timestamp: new Date(Date.now() - 60000 * 5).toISOString() },
    { id: 3, user: 'brenda.r@quantum.corp', ip: '198.51.100.2', location: 'London, UK', status: 'Failed: MFA', timestamp: new Date(Date.now() - 60000 * 12).toISOString() },
    { id: 4, user: 'visionary@demobank.com', ip: '192.168.1.1', location: 'New York, USA', status: 'Success', timestamp: new Date(Date.now() - 60000 * 25).toISOString() },
];

// --- NEW CODE FOR REAL APPLICATION ---

// SECTION: Type Definitions
// ==========================================================================================

export type UserStatus = 'active' | 'suspended' | 'pending_verification' | 'locked';
export type MfaMethod = 'TOTP' | 'SMS' | 'Email' | 'FIDO2/WebAuthn' | 'Push';
export type UserRole = 'Admin' | 'Auditor' | 'Support' | 'User';
export type AuditLogAction = 
    | 'USER_LOGIN_SUCCESS' 
    | 'USER_LOGIN_FAILURE' 
    | 'USER_LOGOUT' 
    | 'PASSWORD_RESET_REQUEST' 
    | 'PASSWORD_RESET_SUCCESS' 
    | 'USER_CREATED' 
    | 'USER_UPDATED' 
    | 'USER_DELETED'
    | 'ROLE_ASSIGNED'
    | 'ROLE_REMOVED'
    | 'POLICY_UPDATED'
    | 'API_KEY_CREATED'
    | 'API_KEY_REVOKED';

export interface UserProfile {
    firstName: string;
    lastName: string;
    jobTitle: string;
    department: string;
    officeLocation: string;
    contactPhone: string;
    avatarUrl?: string;
}

export interface User {
    id: string;
    email: string;
    status: UserStatus;
    roles: UserRole[];
    mfaEnabled: boolean;
    mfaMethods: MfaMethod[];
    createdAt: string;
    lastLogin: string;
    lastLoginIp: string;
    profile: UserProfile;
}

export interface AuditLog {
    id: string;
    timestamp: string;
    actor: {
        id: string;
        email: string;
    };
    action: AuditLogAction;
    target?: {
        type: 'user' | 'role' | 'policy';
        id: string;
        name: string;
    };
    ipAddress: string;
    location: string;
    details: Record<string, any>;
    status: 'Success' | 'Failure';
}

export interface SecurityPolicy {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    config: Record<string, any>;
}

export interface ActiveSession {
    id: string;
    userId: string;
    userEmail: string;
    ipAddress: string;
    userAgent: string;
    location: string;
    createdAt: string;
    expiresAt: string;
}

// SECTION: Mock Data Generation
// ==========================================================================================

const FIRST_NAMES = ['Aisha', 'Bao', 'Carlos', 'Diana', 'Ethan', 'Fatima', 'Gabriel', 'Hana', 'Ivan', 'Jasmine'];
const LAST_NAMES = ['Wong', 'Patel', 'Garcia', 'Kim', 'Smith', 'Ivanov', 'Müller', 'Silva', 'Rossi', 'Yamamoto'];
const DEPARTMENTS = ['Engineering', 'Finance', 'Marketing', 'Human Resources', 'Sales', 'Operations', 'Legal'];
const JOB_TITLES = ['Software Engineer', 'Accountant', 'Marketing Manager', 'HR Generalist', 'Sales Representative', 'Operations Analyst', 'Paralegal'];
const LOCATIONS = ['New York, USA', 'Tokyo, Japan', 'London, UK', 'Berlin, Germany', 'Sydney, Australia', 'São Paulo, Brazil', 'Singapore'];
const IP_ADDRESSES = ['203.0.113.5', '198.51.100.2', '192.0.2.8', '8.8.8.8', '1.1.1.1', '208.67.222.222'];
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Mobile/15E148 Safari/604.1'
];
const ACTIONS: AuditLogAction[] = ['USER_LOGIN_SUCCESS', 'USER_LOGIN_FAILURE', 'USER_LOGOUT', 'PASSWORD_RESET_REQUEST', 'PASSWORD_RESET_SUCCESS', 'USER_UPDATED', 'ROLE_ASSIGNED'];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateMockUsers = (count: number): User[] => {
    return Array.from({ length: count }, (_, i) => {
        const firstName = getRandomElement(FIRST_NAMES);
        const lastName = getRandomElement(LAST_NAMES);
        const department = getRandomElement(DEPARTMENTS);
        const mfaEnabled = Math.random() > 0.1;
        
        return {
            id: `user_${i + 1}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@demobank.com`,
            status: getRandomElement(['active', 'suspended', 'pending_verification', 'locked']),
            roles: [getRandomElement(['Admin', 'Auditor', 'Support', 'User'])],
            mfaEnabled,
            mfaMethods: mfaEnabled ? [getRandomElement(['TOTP', 'SMS', 'Push'])] : [],
            createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            lastLoginIp: getRandomElement(IP_ADDRESSES),
            profile: {
                firstName,
                lastName,
                jobTitle: getRandomElement(JOB_TITLES),
                department,
                officeLocation: getRandomElement(LOCATIONS),
                contactPhone: `+1-555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
            },
        };
    });
};

export const generateMockAuditLogs = (count: number, users: User[]): AuditLog[] => {
    return Array.from({ length: count }, (_, i) => {
        const actor = getRandomElement(users);
        const action = getRandomElement(ACTIONS);
        let details = {};
        if (action === 'USER_LOGIN_FAILURE') {
            details = { reason: getRandomElement(['Invalid password', 'MFA failed', 'Account locked']) };
        } else if (action === 'ROLE_ASSIGNED') {
            details = { role: getRandomElement(['Admin', 'Auditor']), assignedTo: getRandomElement(users).email };
        }
        
        return {
            id: `log_${Date.now() - i * 10000}`,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            actor: { id: actor.id, email: actor.email },
            action,
            ipAddress: getRandomElement(IP_ADDRESSES),
            location: getRandomElement(LOCATIONS),
            details,
            status: action.includes('FAILURE') ? 'Failure' : 'Success',
            target: action.includes('USER') ? { type: 'user', id: actor.id, name: actor.email } : undefined,
        };
    });
};

export const generateMockActiveSessions = (count: number, users: User[]): ActiveSession[] => {
    return Array.from({ length: count }, (_, i) => {
        const user = getRandomElement(users);
        const createdAt = new Date(Date.now() - Math.random() * 60 * 60 * 1000);
        return {
            id: `session_${i}`,
            userId: user.id,
            userEmail: user.email,
            ipAddress: getRandomElement(IP_ADDRESSES),
            userAgent: getRandomElement(USER_AGENTS),
            location: getRandomElement(LOCATIONS),
            createdAt: createdAt.toISOString(),
            expiresAt: new Date(createdAt.getTime() + 8 * 60 * 60 * 1000).toISOString(),
        };
    });
};

// SECTION: Utility Functions & Hooks
// ==========================================================================================

export const useDebounce = <T>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const timeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} years ago`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} months ago`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} days ago`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} hours ago`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} minutes ago`;
    return `${Math.floor(seconds)} seconds ago`;
};

// SECTION: UI Components
// ==========================================================================================

// --- SVG Icons ---
export const SearchIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

export const ChevronDownIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

export const ChevronUpIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
);

// --- Status Badge ---
export const StatusBadge: React.FC<{ status: UserStatus }> = ({ status }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full inline-block";
    const statusClasses: Record<UserStatus, string> = {
        active: "bg-green-500/20 text-green-300",
        suspended: "bg-yellow-500/20 text-yellow-300",
        pending_verification: "bg-blue-500/20 text-blue-300",
        locked: "bg-red-500/20 text-red-300",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status.replace('_', ' ')}</span>;
};

// --- Pagination Controls ---
export interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    onItemsPerPageChange: (size: number) => void;
    totalItems: number;
}
export const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange, totalItems }) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex items-center justify-between text-gray-400 text-sm mt-4 px-4">
            <div className="flex items-center space-x-2">
                <span>Rows per page:</span>
                <select 
                    value={itemsPerPage} 
                    onChange={e => onItemsPerPageChange(Number(e.target.value))}
                    className="bg-gray-800 border border-gray-700 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
                <span className="ml-4">
                    {startItem}-{endItem} of {totalItems}
                </span>
            </div>
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                >
                    Previous
                </button>
                <span className="px-3 py-1">Page {currentPage} of {totalPages}</span>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

// --- User Management Table ---
export type SortConfig = { key: keyof User; direction: 'ascending' | 'descending' } | null;

export interface UserManagementTableProps {
    users: User[];
    onSort: (key: keyof User) => void;
    sortConfig: SortConfig;
    onUserSelect: (user: User) => void;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({ users, onSort, sortConfig, onUserSelect }) => {
    const renderSortArrow = (key: keyof User) => {
        if (!sortConfig || sortConfig.key !== key) {
            return null;
        }
        return sortConfig.direction === 'ascending' ? <ChevronUpIcon className="w-4 h-4 inline ml-1" /> : <ChevronDownIcon className="w-4 h-4 inline ml-1" />;
    };

    const headers: { key: keyof User; label: string }[] = [
        { key: 'email', label: 'User' },
        { key: 'status', label: 'Status' },
        { key: 'roles', label: 'Roles' },
        { key: 'mfaEnabled', label: 'MFA' },
        { key: 'lastLogin', label: 'Last Login' }
    ];

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                    <tr>
                        {headers.map(header => (
                            <th scope="col" key={header.key} className="px-6 py-3 cursor-pointer" onClick={() => onSort(header.key)}>
                                {header.label}
                                {renderSortArrow(header.key)}
                            </th>
                        ))}
                        <th scope="col" className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                            <td className="px-6 py-4 font-medium text-white">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 mr-3 flex items-center justify-center font-bold text-white">
                                        {user.profile.firstName.charAt(0)}{user.profile.lastName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-white">{user.profile.firstName} {user.profile.lastName}</div>
                                        <div className="text-gray-500 text-xs">{user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
                            <td className="px-6 py-4">{user.roles.join(', ')}</td>
                            <td className="px-6 py-4">
                                <span className={user.mfaEnabled ? 'text-green-400' : 'text-gray-500'}>
                                    {user.mfaEnabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </td>
                            <td className="px-6 py-4">{formatDate(user.lastLogin)}</td>
                             <td className="px-6 py-4 text-right">
                                <button onClick={() => onUserSelect(user)} className="font-medium text-indigo-400 hover:text-indigo-300">
                                    View Details
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


// --- Modal Component ---
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700 m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="p-6 text-gray-300">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- User Detail Modal ---
export interface UserDetailModalProps {
    user: User | null;
    onClose: () => void;
}
export const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
    if (!user) return null;

    return (
        <Modal isOpen={!!user} onClose={onClose} title={`User Details: ${user.profile.firstName} ${user.profile.lastName}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 text-center">
                    <div className="w-32 h-32 rounded-full bg-indigo-600 flex items-center justify-center text-5xl font-bold text-white mx-auto mb-4">
                        {user.profile.firstName.charAt(0)}{user.profile.lastName.charAt(0)}
                    </div>
                    <h4 className="text-2xl font-bold text-white">{user.profile.firstName} {user.profile.lastName}</h4>
                    <p className="text-indigo-400">{user.email}</p>
                    <div className="mt-4">
                        <StatusBadge status={user.status} />
                    </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                    <div>
                        <h5 className="text-sm font-semibold text-gray-400 uppercase">Profile Information</h5>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                            <p><strong className="text-gray-200">Job Title:</strong> {user.profile.jobTitle}</p>
                            <p><strong className="text-gray-200">Department:</strong> {user.profile.department}</p>
                            <p><strong className="text-gray-200">Location:</strong> {user.profile.officeLocation}</p>
                            <p><strong className="text-gray-200">Contact:</strong> {user.profile.contactPhone}</p>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 pt-4">
                        <h5 className="text-sm font-semibold text-gray-400 uppercase">Access & Security</h5>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                            <p><strong className="text-gray-200">Roles:</strong> {user.roles.join(', ')}</p>
                            <p><strong className="text-gray-200">MFA Status:</strong> <span className={user.mfaEnabled ? 'text-green-400' : 'text-red-400'}>{user.mfaEnabled ? 'Enabled' : 'Disabled'}</span></p>
                            {user.mfaEnabled && <p><strong className="text-gray-200">MFA Methods:</strong> {user.mfaMethods.join(', ')}</p>}
                        </div>
                    </div>
                     <div className="border-t border-gray-700 pt-4">
                        <h5 className="text-sm font-semibold text-gray-400 uppercase">Timestamps</h5>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                            <p><strong className="text-gray-200">Member Since:</strong> {formatDate(user.createdAt)}</p>
                            <p><strong className="text-gray-200">Last Login:</strong> {formatDate(user.lastLogin)} ({timeAgo(user.lastLogin)})</p>
                            <p><strong className="text-gray-200">Last Login IP:</strong> <span className="font-mono">{user.lastLoginIp}</span></p>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 pt-4 flex space-x-2">
                        <button className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700">Suspend User</button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Reset Password</button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-red-700 rounded-md hover:bg-red-800">Delete User</button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};


// --- Advanced Geo Chart ---
// Note: In a real app, you would use a library like react-simple-maps. This is a simplified placeholder.
export interface GeoData {
    name: string;
    value: number;
}
export const GeoLoginAttemptsChart: React.FC<{ data: GeoData[] }> = ({ data }) => {
    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
    return (
        <div>
            <h4 className="text-lg font-semibold text-white mb-4">Login Attempts by Country</h4>
            <div className="space-y-2">
                {data.map((entry, index) => (
                    <div key={entry.name}>
                        <div className="flex justify-between mb-1">
                            <span className="text-base font-medium text-gray-300">{entry.name}</span>
                            <span className="text-sm font-medium text-gray-400">{entry.value} attempts</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="h-2.5 rounded-full" style={{ width: `${(entry.value / Math.max(...data.map(d => d.value))) * 100}%`, backgroundColor: COLORS[index % COLORS.length] }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Security Policy Editor ---
const initialPolicies: SecurityPolicy[] = [
    { id: 'policy_mfa', name: 'MFA Enforcement', description: 'Require Multi-Factor Authentication for all users.', enabled: true, config: { required_for: ['Admin', 'Support'] } },
    { id: 'policy_pwd_complexity', name: 'Password Complexity', description: 'Enforce strong password requirements.', enabled: true, config: { min_length: 12, require_uppercase: true, require_lowercase: true, require_number: true, require_special: true } },
    { id: 'policy_session_timeout', name: 'Session Timeout', description: 'Automatically log out inactive users.', enabled: true, config: { timeout_minutes: 30 } },
    { id: 'policy_ip_whitelist', name: 'IP Whitelisting', description: 'Restrict access to a list of approved IP addresses.', enabled: false, config: { allowed_ips: ['192.168.1.1', '203.0.113.0/24'] } },
];
export const SecurityPolicyEditor: React.FC = () => {
    const [policies, setPolicies] = useState<SecurityPolicy[]>(initialPolicies);
    
    const handleToggle = (id: string) => {
        setPolicies(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
    };

    return (
        <div className="space-y-4">
            {policies.map(policy => (
                <div key={policy.id} className="p-4 bg-gray-900/40 rounded-lg flex items-center justify-between">
                    <div>
                        <h4 className="font-semibold text-white">{policy.name}</h4>
                        <p className="text-sm text-gray-400">{policy.description}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="text-sm text-indigo-400 hover:underline">Configure</button>
                        <label htmlFor={`toggle-${policy.id}`} className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input id={`toggle-${policy.id}`} type="checkbox" className="sr-only" checked={policy.enabled} onChange={() => handleToggle(policy.id)} />
                                <div className={`block w-14 h-8 rounded-full ${policy.enabled ? 'bg-indigo-600' : 'bg-gray-600'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${policy.enabled ? 'transform translate-x-6' : ''}`}></div>
                            </div>
                        </label>
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- Audit Log Viewer ---
export type AuditLogFilters = {
    search: string;
    action: AuditLogAction | 'all';
    dateRange: { start: string, end: string };
};
export const AuditLogViewer: React.FC<{logs: AuditLog[]}> = ({ logs }) => {
    const [filters, setFilters] = useState<AuditLogFilters>({ search: '', action: 'all', dateRange: {start: '', end: ''}});
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch = log.actor.email.toLowerCase().includes(searchLower) || log.ipAddress.includes(searchLower);
            const matchesAction = filters.action === 'all' || log.action === filters.action;
            // Date range filtering would be implemented here
            return matchesSearch && matchesAction;
        });
    }, [logs, filters]);
    
    const paginatedLogs = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredLogs.slice(start, end);
    }, [filteredLogs, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value}));
        setCurrentPage(1);
    }
    
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                    type="text"
                    name="search"
                    placeholder="Search by email or IP..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                 <select
                    name="action"
                    value={filters.action}
                    onChange={handleFilterChange}
                    className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                 >
                    <option value="all">All Actions</option>
                    {ACTIONS.map(action => <option key={action} value={action}>{action}</option>)}
                 </select>
                 {/* Date Range Picker would go here */}
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th scope="col" className="px-6 py-3">Timestamp</th>
                            <th scope="col" className="px-6 py-3">Actor</th>
                            <th scope="col" className="px-6 py-3">Action</th>
                            <th scope="col" className="px-6 py-3">IP Address</th>
                            <th scope="col" className="px-6 py-3">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedLogs.map(log => (
                            <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-6 py-4">{formatDate(log.timestamp)}</td>
                                <td className="px-6 py-4 font-medium text-white">{log.actor.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded ${log.status === 'Success' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono">{log.ipAddress} ({log.location})</td>
                                <td className="px-6 py-4 font-mono text-xs">{JSON.stringify(log.details)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
             <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={filteredLogs.length}
             />
        </div>
    );
};


// SECTION: Main Component
// ==========================================================================================

const DemoBankIdentityView: React.FC = () => {
    // --- State Management ---
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);

    const [userSearchTerm, setUserSearchTerm] = useState('');
    const debouncedUserSearch = useDebounce(userSearchTerm, 300);
    const [userStatusFilter, setUserStatusFilter] = useState<UserStatus | 'all'>('all');
    
    const [userSortConfig, setUserSortConfig] = useState<SortConfig>({ key: 'lastLogin', direction: 'descending' });
    const [userCurrentPage, setUserCurrentPage] = useState(1);
    const [userItemsPerPage, setUserItemsPerPage] = useState(10);
    
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // --- Data Fetching Simulation ---
    useEffect(() => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            const mockUsers = generateMockUsers(250);
            setUsers(mockUsers);
            setAuditLogs(generateMockAuditLogs(1000, mockUsers));
            setActiveSessions(generateMockActiveSessions(85, mockUsers));
            setIsLoading(false);
        }, 1500);
    }, []);
    
    // --- Memoized Data Transformations ---
    const filteredUsers = useMemo(() => {
        let sortableUsers = [...users];
        
        // Filtering
        if (debouncedUserSearch) {
            const lowercasedFilter = debouncedUserSearch.toLowerCase();
            sortableUsers = sortableUsers.filter(user =>
                user.email.toLowerCase().includes(lowercasedFilter) ||
                `${user.profile.firstName} ${user.profile.lastName}`.toLowerCase().includes(lowercasedFilter)
            );
        }
        if (userStatusFilter !== 'all') {
             sortableUsers = sortableUsers.filter(user => user.status === userStatusFilter);
        }

        // Sorting
        if (userSortConfig !== null) {
            sortableUsers.sort((a, b) => {
                const key = userSortConfig.key;
                if (a[key] < b[key]) {
                    return userSortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[key] > b[key]) {
                    return userSortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableUsers;
    }, [users, debouncedUserSearch, userStatusFilter, userSortConfig]);

    const paginatedUsers = useMemo(() => {
        const start = (userCurrentPage - 1) * userItemsPerPage;
        const end = start + userItemsPerPage;
        return filteredUsers.slice(start, end);
    }, [filteredUsers, userCurrentPage, userItemsPerPage]);

    const userTotalPages = Math.ceil(filteredUsers.length / userItemsPerPage);


    const handleUserSort = useCallback((key: keyof User) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (userSortConfig && userSortConfig.key === key && userSortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setUserSortConfig({ key, direction });
    }, [userSortConfig]);


    // --- Data for Charts ---
    const mfaAdoptionRate = useMemo(() => {
        if (users.length === 0) return 0;
        const enabledCount = users.filter(u => u.mfaEnabled).length;
        return Math.round((enabledCount / users.length) * 100);
    }, [users]);
    
    const userStatusDistribution = useMemo(() => {
        const counts = users.reduce((acc, user) => {
            acc[user.status] = (acc[user.status] || 0) + 1;
            return acc;
        }, {} as Record<UserStatus, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [users]);

    const geoLoginData: GeoData[] = [
        { name: 'USA', value: 1250 },
        { name: 'Japan', value: 300 },
        { name: 'UK', value: 450 },
        { name: 'Germany', value: 200 },
    ];
    
    const PIE_COLORS = {
        active: '#10b981',
        suspended: '#f59e0b',
        pending_verification: '#3b82f6',
        locked: '#ef4444',
    };
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-white text-2xl">Loading Identity Dashboard...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Identity & Access Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">{users.length.toLocaleString()}</p><p className="text-sm text-gray-400 mt-1">Total Users</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">{activeSessions.length}</p><p className="text-sm text-gray-400 mt-1">Active Sessions</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">{auditLogs.filter(l => l.action === 'USER_LOGIN_FAILURE').length}</p><p className="text-sm text-gray-400 mt-1">Failed Logins (7d)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">{mfaAdoptionRate}%</p><p className="text-sm text-gray-400 mt-1">MFA Adoption</p></Card>
            </div>
            
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card title="Authentication Events (Last 30 Days)">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={authEventsData}>
                                <XAxis dataKey="day" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                                <Legend />
                                <Line type="monotone" dataKey="success" stroke="#10b981" name="Successful Logins" dot={false} />
                                <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Failed Logins" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
                <div>
                     <Card title="User Status Distribution">
                        <ResponsiveContainer width="100%" height={300}>
                             <PieChart>
                                <Pie
                                    data={userStatusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {userStatusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name as UserStatus]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
             </div>
            
            <Card title="User Management">
                <div className="p-4 bg-gray-900/20 flex items-center justify-between">
                     <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                           <SearchIcon className="w-5 h-5 text-gray-500" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-md pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                     <div>
                        <select
                            value={userStatusFilter}
                            onChange={(e) => setUserStatusFilter(e.target.value as UserStatus | 'all')}
                            className="bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="pending_verification">Pending Verification</option>
                            <option value="locked">Locked</option>
                        </select>
                    </div>
                    <button className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                        Add New User
                    </button>
                </div>
                <UserManagementTable
                    users={paginatedUsers}
                    sortConfig={userSortConfig}
                    onSort={handleUserSort}
                    onUserSelect={setSelectedUser}
                />
                <PaginationControls
                    currentPage={userCurrentPage}
                    totalPages={userTotalPages}
                    onPageChange={setUserCurrentPage}
                    itemsPerPage={userItemsPerPage}
                    onItemsPerPageChange={(size) => { setUserItemsPerPage(size); setUserCurrentPage(1); }}
                    totalItems={filteredUsers.length}
                />
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Security Policies">
                    <SecurityPolicyEditor />
                </Card>
                <Card title="Geographical Activity">
                    <GeoLoginAttemptsChart data={geoLoginData} />
                </Card>
            </div>

            <Card title="Audit Log Explorer">
                <AuditLogViewer logs={auditLogs} />
            </Card>

            <Card title="Recent Sign-in Activity">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">User</th>
                                <th scope="col" className="px-6 py-3">IP Address</th>
                                <th scope="col" className="px-6 py-3">Location</th>
                                <th scope="col" className="px-6 py-3">Time</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentSignIns.map(signIn => (
                                <tr key={signIn.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white">{signIn.user}</td>
                                    <td className="px-6 py-4 font-mono">{signIn.ip}</td>
                                    <td className="px-6 py-4">{signIn.location}</td>
                                    <td className="px-6 py-4">{timeAgo(signIn.timestamp)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`${signIn.status === 'Success' ? 'text-green-400' : 'text-red-400'}`}>{signIn.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
    );
};

export default DemoBankIdentityView;
