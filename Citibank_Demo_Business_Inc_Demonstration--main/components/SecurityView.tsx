// components/SecurityView.tsx
// RE-ENACTED & EXPANDED: This component has been resurrected from its deprecated state.
// It is now the "AegisVault," the full-featured security and access control center
// for the user's financial kingdom. It provides transparent controls for data sharing,
// account security, and activity monitoring. It has evolved into a comprehensive
// security operations platform, incorporating advanced threat intelligence, privacy controls,
// device management, emergency protocols, and developer security features after
// a decade of expert upgrades and feature expansion, aiming to be the world's most robust personal
// financial security application.

import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import PlaidLinkButton from './PlaidLinkButton';

// ================================================================================================
// TYPE DEFINITIONS & MOCK DATA (EXPANDED)
// ================================================================================================

interface LoginActivity {
    id: string;
    device: string;
    location: string;
    ip: string;
    timestamp: string;
    isCurrent: boolean;
}

const MOCK_LOGIN_ACTIVITY: LoginActivity[] = [
    { id: '1', device: 'Chrome on macOS', location: 'New York, USA', ip: '192.168.1.1', timestamp: '2 minutes ago', isCurrent: true },
    { id: '2', device: 'DemoBank App on iOS', location: 'New York, USA', ip: '172.16.0.1', timestamp: '3 days ago', isCurrent: false },
    { id: '3', device: 'Chrome on Windows', location: 'Chicago, USA', ip: '10.0.0.1', timestamp: '1 week ago', isCurrent: false },
    { id: '4', device: 'Firefox on Linux', location: 'London, UK', ip: '88.201.54.123', timestamp: '2 weeks ago', isCurrent: false },
    { id: '5', device: 'DemoBank App on Android', location: 'Berlin, Germany', ip: '212.1.2.3', timestamp: '1 month ago', isCurrent: false },
];

// New Type Definitions
export interface Device {
    id: string;
    name: string;
    type: string;
    lastActivity: string;
    location: string;
    ip: string;
    isCurrent: boolean;
    permissions: string[];
    status: 'active' | 'locked' | 'revoked';
}

export interface DataSharingPolicy {
    id: string;
    partner: string;
    dataCategories: string[];
    purpose: string;
    active: boolean;
    lastUpdated: string;
}

export interface TransactionRule {
    id: string;
    name: string;
    type: 'spend_limit' | 'unusual_location' | 'large_withdrawal' | 'new_beneficiary';
    threshold?: number;
    currency?: string;
    location?: string;
    active: boolean;
}

export interface ThreatAlert {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    description: string;
    timestamp: string;
    status: 'new' | 'investigating' | 'resolved';
    actionableItems?: string[];
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    action: string;
    user: string;
    details: string;
    ipAddress: string;
    level: 'info' | 'warning' | 'error';
}

export interface APIKey {
    id: string;
    name: string;
    keyPrefix: string;
    created: string;
    expires?: string;
    status: 'active' | 'revoked' | 'expired';
    permissions: string[];
}

export interface TrustedContact {
    id: string;
    name: string;
    email: string;
    phone?: string;
    relation: string;
    accessLevel: 'view_only' | 'limited_action' | 'full_control'; // for inheritance, not direct access
}

export interface SecurityAwarenessModule {
    id: string;
    title: string;
    description: string;
    completionStatus: 'not_started' | 'in_progress' | 'completed';
    lastAccessed: string;
    url: string;
}

// New Mock Data
const MOCK_DEVICES: Device[] = [
    { id: 'dev1', name: 'My MacBook Pro', type: 'Laptop', lastActivity: '2 minutes ago', location: 'New York, USA', ip: '192.168.1.1', isCurrent: true, permissions: ['Full Access'], status: 'active' },
    { id: 'dev2', name: 'iPhone 15 Pro', type: 'Mobile', lastActivity: '3 hours ago', location: 'New York, USA', ip: '172.16.0.1', isCurrent: false, permissions: ['Limited Access', 'Biometric Login'], status: 'active' },
    { id: 'dev3', name: 'iPad Air', type: 'Tablet', lastActivity: '1 day ago', location: 'Home Network', ip: '10.0.0.1', isCurrent: false, permissions: ['Read-Only'], status: 'active' },
    { id: 'dev4', name: 'Old Android Tablet', type: 'Tablet', lastActivity: '3 months ago', location: 'Boston, USA', ip: '68.12.34.56', isCurrent: false, permissions: ['Read-Only'], status: 'revoked' },
];

const MOCK_DATA_SHARING_POLICIES: DataSharingPolicy[] = [
    { id: 'ds1', partner: 'CreditScorePlus Inc.', dataCategories: ['Transaction History', 'Account Balances'], purpose: 'Credit Score Analysis', active: true, lastUpdated: '2023-10-26' },
    { id: 'ds2', partner: 'Financial Insights AI', dataCategories: ['Spending Habits (Anonymized)'], purpose: 'Personalized Budgeting Advice', active: true, lastUpdated: '2023-10-20' },
    { id: 'ds3', partner: 'Marketing Analytics Co.', dataCategories: ['Demographic Information'], purpose: 'Targeted Marketing', active: false, lastUpdated: '2023-09-15' },
    { id: 'ds4', partner: 'Research Institute for Economic Trends', dataCategories: ['Aggregated Spending Data (Anonymized)'], purpose: 'Economic Research', active: true, lastUpdated: '2024-01-01' },
];

const MOCK_TRANSACTION_RULES: TransactionRule[] = [
    { id: 'tr1', name: 'High Value Transaction Alert', type: 'large_withdrawal', threshold: 5000, currency: 'USD', active: true },
    { id: 'tr2', name: 'International Travel Alert', type: 'unusual_location', location: 'International', active: false },
    { id: 'tr3', name: 'Daily Spending Limit', type: 'spend_limit', threshold: 1000, currency: 'USD', active: true },
    { id: 'tr4', name: 'New Beneficiary Approval', type: 'new_beneficiary', active: true },
];

const MOCK_THREAT_ALERTS: ThreatAlert[] = [
    { id: 'ta1', severity: 'critical', category: 'Phishing Attempt', description: 'Suspicious login attempt from Nigeria detected.', timestamp: '2024-03-01T10:30:00Z', status: 'new', actionableItems: ['Change password', 'Review login activity', 'Contact support'] },
    { id: 'ta2', severity: 'high', category: 'Unusual Activity', description: 'Large transfer initiated to new beneficiary account.', timestamp: '2024-02-28T15:00:00Z', status: 'investigating', actionableItems: ['Verify transfer', 'Contact recipient', 'Lock account temporarily'] },
    { id: 'ta3', severity: 'medium', category: 'Software Vulnerability', description: 'Outdated browser detected on a linked device.', timestamp: '2024-02-27T08:00:00Z', status: 'resolved' },
    { id: 'ta4', severity: 'low', category: 'Security Recommendation', description: 'Consider enabling FIDO2 security key for primary login.', timestamp: '2024-02-25T09:00:00Z', status: 'new', actionableItems: ['Explore FIDO2 options'] },
];

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
    { id: 'al1', timestamp: '2024-03-01T10:35:00Z', action: 'Login Success', user: 'self', details: 'Successful login from current device.', ipAddress: '192.168.1.1', level: 'info' },
    { id: 'al2', timestamp: '2024-03-01T10:30:00Z', action: 'Login Attempt Failed', user: 'unknown', details: 'Incorrect password entered.', ipAddress: '41.203.X.X', level: 'warning' },
    { id: 'al3', timestamp: '2024-02-29T11:00:00Z', action: 'Data Sharing Policy Updated', user: 'self', details: 'Disabled sharing with Marketing Analytics Co.', ipAddress: '192.168.1.1', level: 'info' },
    { id: 'al4', timestamp: '2024-02-28T15:05:00Z', action: 'Transaction Rule Created', user: 'self', details: 'Added high value transaction alert ($5000).', ipAddress: '172.16.0.1', level: 'info' },
    { id: 'al5', timestamp: '2024-02-27T10:00:00Z', action: 'Device Access Revoked', user: 'self', details: 'Revoked access for Old Android Tablet.', ipAddress: '192.168.1.1', level: 'warning' },
];

const MOCK_API_KEYS: APIKey[] = [
    { id: 'api1', name: 'My Analytics Dashboard', keyPrefix: 'pk_live_abcd', created: '2023-08-01', status: 'active', permissions: ['Read Accounts', 'Read Transactions'] },
    { id: 'api2', name: 'Budgeting App Integration', keyPrefix: 'pk_test_efgh', created: '2023-11-10', expires: '2024-05-10', status: 'active', permissions: ['Read Accounts', 'Create Categories'] },
    { id: 'api3', name: 'Expired Test Key', keyPrefix: 'pk_test_ijkl', created: '2023-01-01', expires: '2023-02-01', status: 'expired', permissions: ['Read Accounts'] },
];

const MOCK_TRUSTED_CONTACTS: TrustedContact[] = [
    { id: 'tc1', name: 'Jane Doe', email: 'jane.doe@example.com', phone: '+1-555-123-4567', relation: 'Spouse', accessLevel: 'limited_action' },
    { id: 'tc2', name: 'John Smith', email: 'john.smith@example.com', phone: '+1-555-987-6543', relation: 'Family Member', accessLevel: 'view_only' },
];

const MOCK_SECURITY_AWARENESS_MODULES: SecurityAwarenessModule[] = [
    { id: 'sa1', title: 'Phishing & Social Engineering Protection', description: 'Learn to identify and avoid common phishing scams and social engineering tactics.', completionStatus: 'in_progress', lastAccessed: '2024-02-20', url: '/security-awareness/phishing' },
    { id: 'sa2', title: 'Strong Password Best Practices', description: 'Understand how to create and manage truly strong, unique passwords.', completionStatus: 'completed', lastAccessed: '2023-11-01', url: '/security-awareness/passwords' },
    { id: 'sa3', title: 'Understanding 2FA and MFA', description: 'A deep dive into multi-factor authentication and its importance.', completionStatus: 'not_started', lastAccessed: 'N/A', url: '/security-awareness/mfa' },
];

// ================================================================================================
// SUB-COMPONENTS (EXPANDED & NEW)
// ================================================================================================

/**
 * @description A reusable component for displaying a single security setting with a toggle.
 */
export const SecuritySettingToggle: React.FC<{
    title: string;
    description: string;
    defaultChecked: boolean;
    onToggle?: (checked: boolean) => void;
    disabled?: boolean;
}> = ({ title, description, defaultChecked, onToggle, disabled }) => (
    <li className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
            <h4 className="font-semibold text-white">{title}</h4>
            <p className="text-sm text-gray-400 max-w-md mt-1">{description}</p>
        </div>
        <input
            type="checkbox"
            className="toggle toggle-cyan mt-2 sm:mt-0"
            defaultChecked={defaultChecked}
            onChange={(e) => onToggle && onToggle(e.target.checked)}
            disabled={disabled}
            aria-label={`Toggle for ${title}`}
        />
    </li>
);

/**
 * @description A modal for simulating a password change flow.
 */
export const ChangePasswordModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const handleSubmit = () => {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            alert('All fields are required.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            alert('New password and confirmation do not match.');
            return;
        }
        if (newPassword.length < 8) {
            alert('New password must be at least 8 characters long.');
            return;
        }
        // Simulate API call
        alert('Password changed successfully. Please log in with your new password.');
        onClose();
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">Change Password</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Current Password</label>
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Confirm New Password</label>
                        <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white" />
                    </div>
                    <button onClick={handleSubmit} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg mt-2">
                        Update Password
                    </button>
                </div>
            </div>
        </div>
    );
};

// New Sub-Components (Exported)
/**
 * @description Card for managing authorized devices.
 */
export const DeviceManagementCard: React.FC = () => {
    const [devices, setDevices] = useState<Device[]>(MOCK_DEVICES);

    const handleRevokeDevice = (id: string) => {
        alert(`Device ${id} access revoked.`);
        setDevices(devices.map(d => d.id === id ? { ...d, status: 'revoked' } : d));
    };

    const handleRemoteLock = (id: string) => {
        alert(`Device ${id} remotely locked.`);
        setDevices(devices.map(d => d.id === id ? { ...d, status: 'locked' } : d));
    };

    return (
        <Card title="Authorized Devices & Sessions" titleTooltip="Manage all devices that have access to your account. Revoke access or initiate remote actions.">
            <p className="text-sm text-gray-400 mb-4">
                These devices have been used to access your account. Regularly review this list and revoke access for any unfamiliar, lost, or compromised devices.
            </p>
            <div className="space-y-3">
                {devices.length > 0 ? devices.map(device => (
                    <div key={device.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-lg border ${device.isCurrent ? 'bg-cyan-900/10 border-cyan-700/60' : device.status === 'revoked' ? 'bg-red-900/10 border-red-800/60' : 'bg-gray-800/50 border-gray-700/60'}`}>
                        <div>
                            <h4 className="font-semibold text-white">{device.name} {device.isCurrent && <span className="text-xs text-cyan-300">(Current Session)</span>}</h4>
                            <p className="text-sm text-gray-400">{device.type} - {device.location} ({device.ip})</p>
                            <p className="text-xs text-gray-500">Last Active: {device.lastActivity} | Status: {device.status.charAt(0).toUpperCase() + device.status.slice(1)}</p>
                            <p className="text-xs text-gray-500">Permissions: {device.permissions.join(', ')}</p>
                        </div>
                        <div className="flex gap-2 mt-2 sm:mt-0">
                            {device.status === 'active' && !device.isCurrent && (
                                <button onClick={() => handleRemoteLock(device.id)} className="px-3 py-1 bg-yellow-600/50 hover:bg-yellow-600 text-white rounded-lg text-xs font-medium">
                                    Lock Device
                                </button>
                            )}
                            {device.status === 'active' && (
                                <button onClick={() => handleRevokeDevice(device.id)} className="px-3 py-1 bg-red-600/50 hover:bg-red-600 text-white rounded-lg text-xs font-medium">
                                    Revoke Access
                                </button>
                            )}
                            {device.status === 'revoked' && (
                                <span className="px-3 py-1 bg-gray-600/50 text-gray-300 rounded-lg text-xs font-medium">Access Revoked</span>
                            )}
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-gray-500 py-4">No authorized devices found.</p>
                )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/60 text-sm text-gray-400">
                <p>Don't recognize a device or session? Revoke its access immediately and consider changing your password.</p>
            </div>
        </Card>
    );
};

/**
 * @description Modal for requesting data portability.
 */
export const DataPortabilityModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const [status, setStatus] = useState<'idle' | 'processing' | 'completed'>('idle');

    const handleSubmitRequest = () => {
        setStatus('processing');
        setTimeout(() => {
            setStatus('completed');
            alert('Your data portability request has been submitted. You will receive an email with instructions shortly.');
            onClose();
            setStatus('idle'); // Reset for next time
        }, 3000);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">Request Your Data</h3>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-gray-300 text-sm">
                        Confirm below to request a complete copy of your personal data, including transaction history,
                        account details, and profile information, in a structured, commonly used, and machine-readable format (e.g., JSON, CSV).
                        This data will be securely delivered to your registered email address within 30 days.
                    </p>
                    {status === 'processing' ? (
                        <p className="text-center text-cyan-400">Processing your request... Please wait.</p>
                    ) : (
                        <button onClick={handleSubmitRequest} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg mt-2">
                            Confirm Data Request
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * @description Card for managing data privacy and sharing policies.
 */
export const DataPrivacyControlsCard: React.FC = () => {
    const [policies, setPolicies] = useState<DataSharingPolicy[]>(MOCK_DATA_SHARING_POLICIES);
    const [isDataPortabilityModalOpen, setIsDataPortabilityModalOpen] = useState(false);

    const handleTogglePolicy = (id: string) => {
        setPolicies(policies.map(p =>
            p.id === id ? { ...p, active: !p.active, lastUpdated: new Date().toISOString().slice(0, 10) } : p
        ));
    };

    return (
        <Card title="Data Privacy & Sharing" titleTooltip="Granular controls over how your data is shared with third-party partners and services.">
            <p className="text-sm text-gray-400 mb-4">
                You have full control over what data is shared with integrated services. Review and adjust your preferences below.
                We adhere to strict data protection regulations (e.g., GDPR, CCPA, CCPA, etc.).
            </p>
            <ul className="divide-y divide-gray-700/60 mb-6">
                {policies.map(policy => (
                    <li key={policy.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <h4 className="font-semibold text-white">{policy.partner}</h4>
                            <p className="text-sm text-gray-400 max-w-md mt-1">
                                Sharing: <span className="font-medium text-cyan-400">{policy.dataCategories.join(', ')}</span> for <span className="italic">{policy.purpose}</span>.
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Last updated: {policy.lastUpdated}</p>
                        </div>
                        <input
                            type="checkbox"
                            className="toggle toggle-cyan mt-2 sm:mt-0"
                            checked={policy.active}
                            onChange={() => handleTogglePolicy(policy.id)}
                            aria-label={`Toggle data sharing for ${policy.partner}`}
                        />
                    </li>
                ))}
                <li className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <h4 className="font-semibold text-white">Data Portability</h4>
                        <p className="text-sm text-gray-400 max-w-md mt-1">Request a copy of all your personal data in a machine-readable format.</p>
                    </div>
                    <button onClick={() => setIsDataPortabilityModalOpen(true)} className="mt-2 sm:mt-0 px-4 py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-xs font-medium">
                        Request Data
                    </button>
                </li>
                 <SecuritySettingToggle
                    title="Anonymize Spending Data"
                    description="Automatically anonymize your spending habits before they are used for any internal or third-party analytical purposes."
                    defaultChecked={true}
                />
            </ul>
            <DataPortabilityModal isOpen={isDataPortabilityModalOpen} onClose={() => setIsDataPortabilityModalOpen(false)} />
        </Card>
    );
};

/**
 * @description Modal for adding a new transaction rule.
 */
export const AddTransactionRuleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddRule: (rule: Omit<TransactionRule, 'id'>) => void;
}> = ({ isOpen, onClose, onAddRule }) => {
    if (!isOpen) return null;

    const [name, setName] = useState('');
    const [type, setType] = useState<'spend_limit' | 'unusual_location' | 'large_withdrawal' | 'new_beneficiary'>('spend_limit');
    const [threshold, setThreshold] = useState('');
    const [location, setLocation] = useState('');

    const handleSubmit = () => {
        if (!name) {
            alert('Please provide a rule name.');
            return;
        }
        const newRule: Omit<TransactionRule, 'id'> = { name, type, active: true };
        if (type === 'spend_limit' || type === 'large_withdrawal') {
            newRule.threshold = parseFloat(threshold);
            newRule.currency = 'USD'; // Assuming USD for simplicity
        }
        if (type === 'unusual_location') {
            newRule.location = location;
        }
        onAddRule(newRule);
        onClose();
        // Reset form
        setName('');
        setType('spend_limit');
        setThreshold('');
        setLocation('');
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">Add New Transaction Rule</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Rule Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Rule Type</label>
                        <select value={type} onChange={(e) => setType(e.target.value as any)} className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white">
                            <option value="spend_limit">Daily/Weekly Spending Limit</option>
                            <option value="large_withdrawal">Large Withdrawal Alert</option>
                            <option value="unusual_location">Unusual Location Activity</option>
                            <option value="new_beneficiary">Require Approval for New Beneficiary</option>
                        </select>
                    </div>
                    {(type === 'spend_limit' || type === 'large_withdrawal') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Threshold Amount (USD)</label>
                            <input type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white" />
                        </div>
                    )}
                    {type === 'unusual_location' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Specific Location (e.g., 'International')</label>
                            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white" />
                        </div>
                    )}
                    <button onClick={handleSubmit} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg mt-2">
                        Create Rule
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * @description Card for managing transaction monitoring rules.
 */
export const TransactionMonitoringCard: React.FC = () => {
    const [rules, setRules] = useState<TransactionRule[]>(MOCK_TRANSACTION_RULES);
    const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false);

    const handleToggleRule = (id: string) => {
        setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
    };

    const handleAddRule = (newRule: Omit<TransactionRule, 'id'>) => {
        const id = `tr${rules.length + 1}`;
        setRules([...rules, { id, ...newRule }]);
        setIsAddRuleModalOpen(false);
    };

    const handleDeleteRule = (id: string) => {
        if (window.confirm("Are you sure you want to delete this rule?")) {
            setRules(rules.filter(r => r.id !== id));
        }
    };

    return (
        <Card title="Transaction Monitoring & Alerts" titleTooltip="Set up custom rules to monitor your transactions and receive alerts for suspicious or high-value activities.">
            <p className="text-sm text-gray-400 mb-4">
                Proactively secure your finances by defining rules for transactions. Get notified about unusual spending, large withdrawals, or activity in specific locations.
            </p>
            <ul className="divide-y divide-gray-700/60 mb-6">
                {rules.length > 0 ? rules.map(rule => (
                    <li key={rule.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <h4 className="font-semibold text-white">{rule.name}</h4>
                            <p className="text-sm text-gray-400 max-w-md mt-1">
                                Type: {rule.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                {rule.threshold && ` | Threshold: ${rule.currency || '$'}{rule.threshold.toLocaleString()}`}
                                {rule.location && ` | Location: ${rule.location}`}
                            </p>
                        </div>
                        <div className="flex gap-2 mt-2 sm:mt-0 items-center">
                            <input
                                type="checkbox"
                                className="toggle toggle-cyan"
                                checked={rule.active}
                                onChange={() => handleToggleRule(rule.id)}
                                aria-label={`Toggle rule for ${rule.name}`}
                            />
                            <button onClick={() => handleDeleteRule(rule.id)} className="px-3 py-1 bg-red-600/50 hover:bg-red-600 text-white rounded-lg text-xs font-medium">
                                Delete
                            </button>
                        </div>
                    </li>
                )) : (
                    <p className="text-center text-gray-500 py-4">No custom transaction rules defined yet.</p>
                )}
            </ul>
            <button onClick={() => setIsAddRuleModalOpen(true)} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">
                Add New Transaction Rule
            </button>
            <AddTransactionRuleModal isOpen={isAddRuleModalOpen} onClose={() => setIsAddRuleModalOpen(false)} onAddRule={handleAddRule} />
        </Card>
    );
};

/**
 * @description Card for displaying threat intelligence and alerts.
 */
export const ThreatAlertsCard: React.FC = () => {
    const [alerts, setAlerts] = useState<ThreatAlert[]>(MOCK_THREAT_ALERTS);

    const handleResolveAlert = (id: string) => {
        setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
        alert(`Alert ${id} marked as resolved.`);
    };

    const getSeverityClass = (severity: 'critical' | 'high' | 'medium' | 'low') => {
        switch (severity) {
            case 'critical': return 'text-red-500 bg-red-900/20 border-red-800';
            case 'high': return 'text-orange-500 bg-orange-900/20 border-orange-800';
            case 'medium': return 'text-yellow-500 bg-yellow-900/20 border-yellow-800';
            case 'low': return 'text-gray-500 bg-gray-900/20 border-gray-800';
            default: return 'text-gray-400 bg-gray-800/20 border-gray-700';
        }
    };

    return (
        <Card title="Threat Intelligence & Alerts" titleTooltip="View real-time security alerts and recommendations from our advanced threat detection systems.">
            <p className="text-sm text-gray-400 mb-4">
                Our advanced Aegis AI continuously monitors for potential threats to your account, including phishing attempts, unusual login patterns, and detected vulnerabilities.
            </p>
            <div className="space-y-4">
                {alerts.length > 0 ? alerts.map(alert => (
                    <div key={alert.id} className={`p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center ${getSeverityClass(alert.severity)}`}>
                        <div>
                            <h4 className="font-semibold text-white flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${getSeverityClass(alert.severity)} bg-opacity-50`}>
                                    {alert.severity}
                                </span>
                                {alert.category}
                            </h4>
                            <p className="text-sm text-gray-300 mt-1 max-w-md">{alert.description}</p>
                            <p className="text-xs text-gray-400 mt-1">Detected: {new Date(alert.timestamp).toLocaleString()}</p>
                            {alert.actionableItems && alert.actionableItems.length > 0 && (
                                <p className="text-xs text-gray-300 mt-2">
                                    <span className="font-semibold">Suggested Actions:</span> {alert.actionableItems.join(', ')}.
                                </p>
                            )}
                        </div>
                        <div className="mt-2 sm:mt-0 flex gap-2">
                            {alert.status !== 'resolved' ? (
                                <button onClick={() => handleResolveAlert(alert.id)} className="px-3 py-1 bg-green-600/50 hover:bg-green-600 text-white rounded-lg text-xs font-medium">
                                    Mark as Resolved
                                </button>
                            ) : (
                                <span className="px-3 py-1 bg-gray-600/50 text-gray-300 rounded-lg text-xs font-medium">Resolved</span>
                            )}
                            <button className="px-3 py-1 bg-blue-600/50 hover:bg-blue-600 text-white rounded-lg text-xs font-medium">
                                View Details
                            </button>
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-gray-500 py-4">No active threat alerts at this time. Stay vigilant!</p>
                )}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-700/60 text-sm text-gray-400">
                <p>For critical alerts, immediate action is recommended. Contact support if you need assistance.</p>
            </div>
        </Card>
    );
};

/**
 * @description Card for viewing comprehensive audit logs.
 */
export const AuditLogViewerCard: React.FC = () => {
    const [logs, setLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
    const [filter, setFilter] = useState('');
    const [levelFilter, setLevelFilter] = useState<'all' | 'info' | 'warning' | 'error'>('all');

    const filteredLogs = logs.filter(log =>
        (levelFilter === 'all' || log.level === levelFilter) &&
        (log.action.toLowerCase().includes(filter.toLowerCase()) ||
        log.details.toLowerCase().includes(filter.toLowerCase()) ||
        log.ipAddress.toLowerCase().includes(filter.toLowerCase()) ||
        log.user.toLowerCase().includes(filter.toLowerCase()))
    );

    const getLevelClass = (level: 'info' | 'warning' | 'error') => {
        switch (level) {
            case 'info': return 'text-blue-400';
            case 'warning': return 'text-yellow-400';
            case 'error': return 'text-red-400';
        }
    };

    return (
        <Card title="Comprehensive Audit Logs" titleTooltip="Detailed record of all security-related activities on your account.">
            <p className="text-sm text-gray-400 mb-4">
                A complete history of logins, setting changes, data access, and other sensitive actions, providing full transparency and accountability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Filter logs by keyword"
                    className="flex-grow bg-gray-700/50 border-gray-600 rounded-md p-2 text-white text-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value as any)}
                    className="w-full sm:w-auto bg-gray-700/50 border-gray-600 rounded-md p-2 text-white text-sm"
                >
                    <option value="all">All Levels</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            <th className="px-4 py-2">Timestamp</th>
                            <th className="px-4 py-2">Level</th>
                            <th className="px-4 py-2">Action</th>
                            <th className="px-4 py-2">User</th>
                            <th className="px-4 py-2">Details</th>
                            <th className="px-4 py-2">IP Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.length > 0 ? filteredLogs.map(log => (
                            <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="px-4 py-3 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className={`px-4 py-3 ${getLevelClass(log.level)}`}>{log.level.toUpperCase()}</td>
                                <td className="px-4 py-3 font-medium text-white">{log.action}</td>
                                <td className="px-4 py-3">{log.user}</td>
                                <td className="px-4 py-3">{log.details}</td>
                                <td className="px-4 py-3">{log.ipAddress}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="text-center text-gray-500 py-4">No audit logs matching your filter.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-700/60 text-sm text-gray-400 flex justify-between items-center">
                <button className="px-4 py-2 bg-blue-600/50 hover:bg-blue-600 text-white rounded-lg text-xs font-medium">
                    Export Logs (CSV)
                </button>
                <span className="text-gray-500">Logs retained for 7 years as per compliance policies.</span>
            </div>
        </Card>
    );
};

/**
 * @description Card for displaying security posture and recommendations.
 */
export const SecurityPostureCard: React.FC = () => {
    const securityScore = 85; // Example score, dynamically calculated in real app
    const recommendations = [
        "Enable Biometric Login on all devices for quicker access.",
        "Review Data Sharing Policies and disable unnecessary ones.",
        "Set up a high-value transaction alert for transfers over $10,000.",
        "Consider using a FIDO2 security key for advanced 2FA to prevent phishing.",
        "Complete the 'Phishing & Social Engineering Protection' awareness module.",
        "Regularly review your linked accounts and unlink any inactive ones.",
    ];

    return (
        <Card title="Security Posture & Recommendations" titleTooltip="An intelligent assessment of your current security configuration with personalized recommendations.">
            <p className="text-sm text-gray-400 mb-4">
                Our Aegis AI continuously analyzes your security settings and behavior to provide a personalized security score and actionable recommendations to enhance your protection.
            </p>
            <div className="flex items-center gap-4 mb-6">
                <div className="radial-progress text-cyan-500" style={{ "--value": securityScore, "--size": "5rem", "--thickness": "5px" } as React.CSSProperties} role="progressbar" aria-valuenow={securityScore} aria-label="Security Score">
                    <span className="text-xl font-bold text-white">{securityScore}%</span>
                </div>
                <div>
                    <h4 className="font-semibold text-white text-lg">Your Current Security Score: <span className="text-cyan-400">{securityScore}%</span></h4>
                    <p className="text-sm text-gray-400">Excellent! You have strong security practices. Keep it up!</p>
                </div>
            </div>
            <h4 className="font-semibold text-white mb-2">Personalized Recommendations:</h4>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
                {recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                        <span className="mr-2 text-cyan-400 text-lg">▪</span> {rec}
                    </li>
                ))}
            </ul>
            <div className="mt-6 pt-4 border-t border-gray-700/60 text-sm text-gray-400">
                <p>Implement these recommendations to achieve the highest level of security.</p>
            </div>
        </Card>
    );
};

/**
 * @description Modal for managing FIDO2 security keys.
 */
export const FidoSecurityKeyModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const [keys, setKeys] = useState<{ id: string; name: string; added: string }[]>([
        { id: 'key1', name: 'My YubiKey 5C NFC', added: '2023-01-15' },
    ]);
    const [newKeyName, setNewKeyName] = useState('');

    const handleRegisterKey = () => {
        if (!newKeyName) {
            alert('Please enter a name for the security key.');
            return;
        }
        alert(`Simulating registration for key: "${newKeyName}". Please connect and touch your security key.`);
        setTimeout(() => {
            const newId = `key${keys.length + 1}`;
            setKeys([...keys, { id: newId, name: newKeyName, added: new Date().toISOString().slice(0, 10) }]);
            setNewKeyName('');
            alert('Security key registered successfully!');
        }, 2000);
    };

    const handleRemoveKey = (id: string) => {
        if (window.confirm('Are you sure you want to remove this security key? You will no longer be able to use it for login.')) {
            setKeys(keys.filter(k => k.id !== id));
            alert('Security key removed.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">Manage FIDO2 Security Keys</h3>
                </div>
                <div className="p-6 space-y-6">
                    <p className="text-gray-300 text-sm">
                        Physical security keys offer the highest level of protection against phishing and account takeover.
                        Register your FIDO2/WebAuthn compatible keys here for unphishable multi-factor authentication.
                    </p>

                    <div>
                        <h4 className="font-semibold text-white mb-2">Registered Keys:</h4>
                        {keys.length > 0 ? (
                            <ul className="space-y-2">
                                {keys.map(key => (
                                    <li key={key.id} className="flex justify-between items-center p-2 bg-gray-700/50 rounded-md">
                                        <span className="text-gray-200">{key.name} <span className="text-xs text-gray-400"> (Added: {key.added})</span></span>
                                        <button onClick={() => handleRemoveKey(key.id)} className="px-3 py-1 bg-red-600/50 hover:bg-red-600 text-white rounded-lg text-xs font-medium">
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-center">No security keys registered yet.</p>
                        )}
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                        <h4 className="font-semibold text-white mb-2">Register New Key:</h4>
                        <label className="block text-sm font-medium text-gray-300">Key Name (e.g., "Work YubiKey")</label>
                        <input type="text" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white" />
                        <button onClick={handleRegisterKey} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg mt-4">
                            Start Registration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * @description Card for advanced authentication options.
 */
export const AdvancedAuthenticationCard: React.FC = () => {
    const [isFidoModalOpen, setIsFidoModalOpen] = useState(false);
    return (
        <Card title="Advanced Authentication Options" titleTooltip="Explore next-generation authentication methods for superior security and convenience.">
            <ul className="divide-y divide-gray-700/60">
                <SecuritySettingToggle
                    title="Adaptive Authentication"
                    description="Our system intelligently assesses login attempts based on location, device, and behavior. Unusual activity may trigger additional verification steps."
                    defaultChecked={true}
                />
                <SecuritySettingToggle
                    title="Geo-fencing for Transactions"
                    description="Restrict transactions to specific geographical regions or block international transactions to prevent fraud. Set your trusted zones."
                    defaultChecked={false}
                />
                <li className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <h4 className="font-semibold text-white">FIDO2 / WebAuthn Security Keys</h4>
                        <p className="text-sm text-gray-400 max-w-md mt-1">
                            Use a physical security key (like YubiKey) for unphishable, hardware-backed two-factor authentication.
                        </p>
                    </div>
                    <button onClick={() => setIsFidoModalOpen(true)} className="mt-2 sm:mt-0 px-4 py-2 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded-lg text-xs font-medium">
                        Manage Keys
                    </button>
                </li>
                <SecuritySettingToggle
                    title="Login IP Whitelisting"
                    description="Restrict account access to a predefined list of trusted IP addresses for maximum control (advanced users). Requires careful configuration."
                    defaultChecked={false}
                />
                 <SecuritySettingToggle
                    title="Time-Based One-Time Passwords (TOTP)"
                    description="Generate 6-digit codes using an authenticator app (e.g., Google Authenticator, Authy) as an alternative to SMS 2FA."
                    defaultChecked={true} // Assuming most users would have this
                />
            </ul>
            <FidoSecurityKeyModal isOpen={isFidoModalOpen} onClose={() => setIsFidoModalOpen(false)} />
        </Card>
    );
};

/**
 * @description Modal for emergency account lock.
 */
export const LockAccountModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const handleConfirmLock = () => {
        alert('Emergency account locked successfully! You will be logged out and require re-verification to regain access. Contact support for assistance.');
        onClose();
        // Simulate actual logout and account state change
        // window.location.href = '/logout';
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 bg-red-900/20">
                    <h3 className="text-lg font-semibold text-red-400">Emergency Account Lock Confirmation</h3>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-red-300 text-sm">
                        Activating the emergency account lock will immediately:
                        <ul className="list-disc list-inside mt-2 ml-4">
                            <li>Freeze all outgoing transactions and payments.</li>
                            <li>Log out all active sessions on all devices.</li>
                            <li>Require advanced identity verification to unlock your account.</li>
                            <li>Notify your trusted emergency contacts (if configured).</li>
                        </ul>
                    </p>
                    <p className="text-red-300 font-bold mt-4">
                        Only proceed if you strongly suspect your account is compromised or unauthorized activity is occurring.
                    </p>
                    <button onClick={handleConfirmLock} className="w-full py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg mt-2">
                        Confirm & Lock Account
                    </button>
                    <button onClick={onClose} className="w-full py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg mt-2">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * @description Modal for configuring Dead Man's Switch (Inheritance Planning).
 */
export const DeadManSwitchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const [beneficiaries, setBeneficiaries] = useState<TrustedContact[]>(MOCK_TRUSTED_CONTACTS);
    const [inactivityPeriod, setInactivityPeriod] = useState('90'); // days
    const [newBeneficiary, setNewBeneficiary] = useState<Omit<TrustedContact, 'id'>>({ name: '', email: '', relation: '', accessLevel: 'view_only' });

    const handleAddBeneficiary = () => {
        if (!newBeneficiary.name || !newBeneficiary.email) {
            alert('Name and email are required for a beneficiary.');
            return;
        }
        setBeneficiaries([...beneficiaries, { id: `ben${beneficiaries.length + 1}`, ...newBeneficiary }]);
        setNewBeneficiary({ name: '', email: '', relation: '', accessLevel: 'view_only' });
    };

    const handleRemoveBeneficiary = (id: string) => {
        setBeneficiaries(beneficiaries.filter(b => b.id !== id));
    };

    const handleSaveSettings = () => {
        alert('Dead Man\'s Switch settings saved successfully!');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">Dead Man's Switch (Inheritance)</h3>
                </div>
                <div className="p-6 space-y-6">
                    <p className="text-gray-300 text-sm">
                        This feature allows you to designate trusted individuals who will be granted limited access
                        or instructions to your financial assets if your account remains inactive for a specified period.
                        This ensures your legacy is protected and managed according to your wishes.
                    </p>

                    <div>
                        <h4 className="font-semibold text-white mb-2">Inactivity Period:</h4>
                        <p className="text-sm text-gray-300 mb-2">After how many days of no login or activity should the protocol activate?</p>
                        <select value={inactivityPeriod} onChange={(e) => setInactivityPeriod(e.target.value)} className="w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white">
                            <option value="30">30 Days</option>
                            <option value="60">60 Days</option>
                            <option value="90">90 Days (Recommended)</option>
                            <option value="180">180 Days</option>
                            <option value="365">365 Days</option>
                        </select>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-2">Designated Beneficiaries:</h4>
                        {beneficiaries.length > 0 ? (
                            <ul className="space-y-2 mb-4">
                                {beneficiaries.map(ben => (
                                    <li key={ben.id} className="flex justify-between items-center p-2 bg-gray-700/50 rounded-md">
                                        <div>
                                            <span className="text-gray-200 font-medium">{ben.name}</span>
                                            <p className="text-xs text-gray-400">{ben.email} ({ben.relation}, Access: {ben.accessLevel.replace('_', ' ')})</p>
                                        </div>
                                        <button onClick={() => handleRemoveBeneficiary(ben.id)} className="px-3 py-1 bg-red-600/50 hover:bg-red-600 text-white rounded-lg text-xs font-medium">
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-center mb-4">No beneficiaries added yet.</p>
                        )}

                        <div className="bg-gray-700/30 p-4 rounded-md space-y-3">
                            <h5 className="font-semibold text-white">Add New Beneficiary:</h5>
                            <div>
                                <label className="block text-xs font-medium text-gray-300">Name</label>
                                <input type="text" value={newBeneficiary.name} onChange={(e) => setNewBeneficiary({ ...newBeneficiary, name: e.target.value })} className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-300">Email</label>
                                <input type="email" value={newBeneficiary.email} onChange={(e) => setNewBeneficiary({ ...newBeneficiary, email: e.target.value })} className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-300">Relation (Optional)</label>
                                <input type="text" value={newBeneficiary.relation} onChange={(e) => setNewBeneficiary({ ...newBeneficiary, relation: e.target.value })} className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-300">Access Level</label>
                                <select value={newBeneficiary.accessLevel} onChange={(e) => setNewBeneficiary({ ...newBeneficiary, accessLevel: e.target.value as TrustedContact['accessLevel'] })} className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white text-sm">
                                    <option value="view_only">View Only (Recommended)</option>
                                    <option value="limited_action">Limited Actions (e.g., Pay Bills)</option>
                                    <option value="full_control">Full Control (Use with extreme caution)</option>
                                </select>
                            </div>
                            <button onClick={handleAddBeneficiary} className="w-full py-2 bg-blue-600/50 hover:bg-blue-600 text-white rounded-lg text-sm font-medium">
                                Add Beneficiary
                            </button>
                        </div>
                    </div>

                    <button onClick={handleSaveSettings} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg mt-4">
                        Save Dead Man's Switch Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * @description Card for emergency protocols and recovery.
 */
export const EmergencyActionsCard: React.FC = () => {
    const [isLockAccountModalOpen, setIsLockAccountModalOpen] = useState(false);
    const [isDeadManSwitchModalOpen, setIsDeadManSwitchModalOpen] = useState(false);

    return (
        <Card title="Emergency Protocols & Recovery" titleTooltip="Critical tools for protecting your assets in emergencies or for planning future access.">
            <p className="text-sm text-gray-400 mb-4">
                Prepare for the unexpected. These features allow you to quickly respond to security incidents or securely plan for asset transfer and recovery.
            </p>
            <ul className="divide-y divide-gray-700/60">
                <li className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <h4 className="font-semibold text-white">Emergency Account Lock</h4>
                        <p className="text-sm text-red-400 max-w-md mt-1">
                            Immediately freeze all account activity, block transactions, and restrict logins if you suspect a breach or unauthorized access. This requires re-verification to unlock.
                        </p>
                    </div>
                    <button onClick={() => setIsLockAccountModalOpen(true)} className="mt-2 sm:mt-0 px-4 py-2 bg-red-700/50 hover:bg-red-700 text-white rounded-lg text-xs font-medium">
                        Activate Lock
                    </button>
                </li>
                <li className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <h4 className="font-semibold text-white">Dead Man's Switch (Inheritance Planning)</h4>
                        <p className="text-sm text-gray-400 max-w-md mt-1">
                            Automate the secure transfer of your financial assets and account access to trusted beneficiaries if your account becomes inactive for a prolonged period.
                        </p>
                    </div>
                    <button onClick={() => setIsDeadManSwitchModalOpen(true)} className="mt-2 sm:mt-0 px-4 py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-xs font-medium">
                        Configure
                    </button>
                </li>
                <li className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <h4 className="font-semibold text-white">Secure Encrypted Backups</h4>
                        <p className="text-sm text-gray-400 max-w-md mt-1">
                            Manage and download encrypted backups of your essential account data, recovery keys, and personalized security settings.
                        </p>
                    </div>
                    <button className="mt-2 sm:mt-0 px-4 py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-xs font-medium">
                        Manage Backups
                    </button>
                </li>
                <li className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <h4 className="font-semibold text-white">Identity Theft Protection Resources</h4>
                        <p className="text-sm text-gray-400 max-w-md mt-1">
                            Access guides and resources on what to do if you suspect identity theft or a data breach involving your personal information.
                        </p>
                    </div>
                    <a href="/identity-theft-resources" target="_blank" rel="noopener noreferrer" className="mt-2 sm:mt-0 px-4 py-2 bg-blue-600/50 hover:bg-blue-600 text-white rounded-lg text-xs font-medium">
                        View Resources
                    </a>
                </li>
            </ul>
            <LockAccountModal isOpen={isLockAccountModalOpen} onClose={() => setIsLockAccountModalOpen(false)} />
            <DeadManSwitchModal isOpen={isDeadManSwitchModalOpen} onClose={() => setIsDeadManSwitchModalOpen(false)} />
        </Card>
    );
};

/**
 * @description Modal for creating a new API key.
 */
export const CreateAPIKeyModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onCreateKey: (newKeyData: Omit<APIKey, 'id' | 'keyPrefix' | 'created' | 'status'>) => void;
}> = ({ isOpen, onClose, onCreateKey }) => {
    if (!isOpen) return null;

    const [name, setName] = useState('');
    const [permissions, setPermissions] = useState<string[]>([]);
    const [expires, setExpires] = useState('');

    const availablePermissions = ['Read Accounts', 'Read Transactions', 'Create Categories', 'Manage Webhooks', 'Full Access', 'Manage Beneficiaries'];

    const handleTogglePermission = (permission: string) => {
        setPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const handleSubmit = () => {
        if (!name || permissions.length === 0) {
            alert('Please provide a name and select at least one permission.');
            return;
        }
        onCreateKey({
            name,
            permissions,
            expires: expires || undefined,
        });
        // Reset form
        setName('');
        setPermissions([]);
        setExpires('');
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">Generate New API Key</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Key Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Permissions</label>
                        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {availablePermissions.map(perm => (
                                <div key={perm} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`perm-${perm}`}
                                        checked={permissions.includes(perm)}
                                        onChange={() => handleTogglePermission(perm)}
                                        className="checkbox checkbox-cyan"
                                    />
                                    <label htmlFor={`perm-${perm}`} className="ml-2 text-sm text-gray-300">{perm}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Expiration Date (Optional)</label>
                        <input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-md p-2 text-white" />
                    </div>
                    <button onClick={handleSubmit} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg mt-2">
                        Generate Key
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * @description Card for managing API keys.
 */
export const APIKeyManagementCard: React.FC = () => {
    const [apiKeys, setApiKeys] = useState<APIKey[]>(MOCK_API_KEYS);
    const [isCreateAPIKeyModalOpen, setIsCreateAPIKeyModalOpen] = useState(false);

    const handleRevokeKey = (id: string) => {
        if (window.confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
            setApiKeys(apiKeys.map(key => key.id === id ? { ...key, status: 'revoked' } : key));
            alert('API Key revoked.');
        }
    };

    const handleCreateKey = (newKeyData: Omit<APIKey, 'id' | 'keyPrefix' | 'created' | 'status'>) => {
        const newId = `api${apiKeys.length + 1}`;
        const newKeyPrefix = `pk_${Math.random().toString(36).substring(2, 6)}`;
        const created = new Date().toISOString().slice(0, 10);
        const newKey: APIKey = {
            id: newId,
            keyPrefix: newKeyPrefix,
            created,
            status: 'active',
            ...newKeyData,
        };
        setApiKeys([...apiKeys, newKey]);
        alert(`New API Key generated: ${newKeyPrefix}**************** Please copy it now, it will not be shown again.`);
        setIsCreateAPIKeyModalOpen(false);
    };

    return (
        <Card title="API Key Management & Webhooks" titleTooltip="Generate and manage API keys for integrating with custom applications and developer tools.">
            <p className="text-sm text-gray-400 mb-4">
                For developers and advanced users, manage API keys to programmatically access your account data (with explicit permissions).
                Handle these keys with extreme care, as they grant powerful access to your financial information. You can also configure secure webhook endpoints.
            </p>
            <div className="space-y-3 mb-6">
                {apiKeys.length > 0 ? apiKeys.map(key => (
                    <div key={key.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-lg border ${key.status === 'active' ? 'bg-gray-800/50 border-gray-700/60' : 'bg-red-900/10 border-red-800/60 opacity-70'}`}>
                        <div>
                            <h4 className="font-semibold text-white">{key.name}</h4>
                            <p className="text-sm text-gray-400">Key: {key.keyPrefix}**************** ({key.status})</p>
                            <p className="text-xs text-gray-500">Created: {key.created} {key.expires && `| Expires: ${key.expires}`}</p>
                            <p className="text-xs text-gray-500">Permissions: {key.permissions.join(', ')}</p>
                        </div>
                        <div className="flex gap-2 mt-2 sm:mt-0">
                            {key.status === 'active' && (
                                <button onClick={() => handleRevokeKey(key.id)} className="px-3 py-1 bg-red-600/50 hover:bg-red-600 text-white rounded-lg text-xs font-medium">
                                    Revoke
                                </button>
                            )}
                            <button className="px-3 py-1 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-xs font-medium">
                                View Logs
                            </button>
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-gray-500 py-4">No API keys generated yet.</p>
                )}
            </div>
            <button onClick={() => setIsCreateAPIKeyModalOpen(true)} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">
                Generate New API Key
            </button>
            <div className="mt-6 pt-4 border-t border-gray-700/60 text-sm text-gray-400">
                <h4 className="font-semibold text-white mb-2">Webhook Management:</h4>
                <p>Configure secure webhook endpoints to receive real-time notifications about account activities directly to your applications.</p>
                <button className="mt-3 px-4 py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-xs font-medium">
                    Manage Webhooks
                </button>
            </div>
            <CreateAPIKeyModal isOpen={isCreateAPIKeyModalOpen} onClose={() => setIsCreateAPIKeyModalOpen(false)} onCreateKey={handleCreateKey} />
        </Card>
    );
};

/**
 * @description Card for security awareness training and resources.
 */
export const SecurityAwarenessTrainingCard: React.FC = () => {
    const [modules, setModules] = useState<SecurityAwarenessModule[]>(MOCK_SECURITY_AWARENESS_MODULES);

    const handleMarkCompleted = (id: string) => {
        setModules(modules.map(mod => mod.id === id ? { ...mod, completionStatus: 'completed', lastAccessed: new Date().toISOString().slice(0, 10) } : mod));
        alert('Module marked as completed!');
    };

    const getStatusClass = (status: 'not_started' | 'in_progress' | 'completed') => {
        switch (status) {
            case 'completed': return 'text-green-400 bg-green-900/20';
            case 'in_progress': return 'text-yellow-400 bg-yellow-900/20';
            case 'not_started': return 'text-gray-400 bg-gray-700/20';
        }
    };

    return (
        <Card title="Security Awareness & Training" titleTooltip="Access a library of educational modules to enhance your personal cybersecurity knowledge.">
            <p className="text-sm text-gray-400 mb-4">
                Empower yourself with knowledge. Our interactive security awareness modules are designed to help you recognize threats and adopt best practices for financial security.
            </p>
            <ul className="divide-y divide-gray-700/60">
                {modules.map(module => (
                    <li key={module.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <h4 className="font-semibold text-white">{module.title}</h4>
                            <p className="text-sm text-gray-400 max-w-md mt-1">{module.description}</p>
                            <p className="text-xs text-gray-500 mt-1">Status: <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusClass(module.completionStatus)}`}>{module.completionStatus.replace('_', ' ')}</span></p>
                            {module.lastAccessed !== 'N/A' && <p className="text-xs text-gray-500">Last Accessed: {module.lastAccessed}</p>}
                        </div>
                        <div className="flex gap-2 mt-2 sm:mt-0">
                            {module.completionStatus !== 'completed' && (
                                <button onClick={() => handleMarkCompleted(module.id)} className="px-3 py-1 bg-green-600/50 hover:bg-green-600 text-white rounded-lg text-xs font-medium">
                                    Mark Complete
                                </button>
                            )}
                            <a href={module.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-blue-600/50 hover:bg-blue-600 text-white rounded-lg text-xs font-medium">
                                {module.completionStatus === 'not_started' ? 'Start Module' : 'Continue Module'}
                            </a>
                        </div>
                    </li>
                ))}
            </ul>
            <div className="mt-6 pt-4 border-t border-gray-700/60 text-sm text-gray-400">
                <p>Completing these modules can significantly reduce your risk exposure. New modules are added quarterly.</p>
            </div>
        </Card>
    );
};


// ================================================================================================
// MAIN VIEW COMPONENT: SecurityView (AegisVault) (EXPANDED)
// ================================================================================================

const SecurityView: React.FC = () => {
    const context = useContext(DataContext);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    
    if (!context) {
        throw new Error("SecurityView must be within a DataProvider.");
    }
    
    const { linkedAccounts, unlinkAccount, handlePlaidSuccess } = context;

    return (
        <>
            <div className="space-y-8"> {/* Increased spacing */}
                <h2 className="text-4xl font-extrabold text-white tracking-wider mb-6 leading-tight">AegisVault: Your Security Command Center</h2>
                <p className="text-lg text-gray-300 max-w-2xl">
                    Welcome to the AegisVault, your ultimate control center for securing your financial life.
                    Here, you wield the power of advanced security protocols, granular privacy controls,
                    and proactive threat intelligence, all designed to make your financial kingdom impenetrable.
                    Our AI-driven systems, honed by a decade of expert upgrades, provide you with the most
                    comprehensive and intuitive security experience available.
                </p>
                
                {/* Linked Accounts & Data Sources Card */}
                <Card title="Linked Accounts & Data Sources" titleTooltip="Manage connections to external financial institutions. You have full control to link or unlink accounts at any time.">
                    <p className="text-sm text-gray-400 mb-4">
                        These are the external accounts you've securely connected via Plaid. This allows Demo Bank to provide a holistic view of your finances. Your credentials are never stored by us. We use bank-level encryption and tokenization.
                    </p>
                    <div className="space-y-3 mb-6">
                        {linkedAccounts.length > 0 ? linkedAccounts.map(account => (
                            <div key={account.id} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/60">
                                <div>
                                    <h4 className="font-semibold text-white">{account.name}</h4>
                                    <p className="text-sm text-gray-400">Account ending in **** {account.mask}</p>
                                    <p className="text-xs text-gray-500">Last synced: {new Date().toLocaleDateString()}</p>
                                </div>
                                <button onClick={() => unlinkAccount(account.id)} className="px-3 py-1 bg-red-600/50 hover:bg-red-600 text-white rounded-lg text-xs font-medium">
                                    Unlink
                                </button>
                            </div>
                        )) : (
                            <p className="text-center text-gray-500 py-4">No accounts linked yet. Link an account to get a unified financial view.</p>
                        )}
                    </div>
                    <PlaidLinkButton onSuccess={handlePlaidSuccess} />
                </Card>

                {/* Security Settings Card (Expanded) */}
                <Card title="Account Security Essentials">
                    <ul className="divide-y divide-gray-700/60">
                        <SecuritySettingToggle
                            title="Two-Factor Authentication (2FA)"
                            description="Requires a code from your authenticator app or SMS in addition to your password for enhanced security against unauthorized access. Always recommended."
                            defaultChecked={true}
                        />
                        <SecuritySettingToggle
                            title="Biometric Login"
                            description="Enable passwordless login using your device's Face ID, Touch ID, or fingerprint for a faster and more secure experience. Device specific."
                            defaultChecked={false}
                        />
                        <li className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div>
                                <h4 className="font-semibold text-white">Change Password</h4>
                                <p className="text-sm text-gray-400 max-w-md mt-1">It's a good practice to update your password regularly, especially after any suspicious activity.</p>
                            </div>
                            <button onClick={() => setIsPasswordModalOpen(true)} className="mt-2 sm:mt-0 px-4 py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-xs font-medium">
                                Change
                            </button>
                        </li>
                        <SecuritySettingToggle
                            title="Email Security Alerts"
                            description="Receive instant email notifications for all critical account activities (e.g., logins, password changes, large transactions)."
                            defaultChecked={true}
                        />
                         <SecuritySettingToggle
                            title="SMS Security Alerts"
                            description="Receive instant SMS notifications for all critical account activities. (Requires verified phone number)."
                            defaultChecked={true}
                        />
                        <SecuritySettingToggle
                            title="Automatic Logout on Inactivity"
                            description="Automatically log out of your session after a period of inactivity to prevent unauthorized access if you step away from your device."
                            defaultChecked={true}
                        />
                        <SecuritySettingToggle
                            title="Session Timeout (30 minutes)"
                            description="Your session will automatically expire after 30 minutes of inactivity, requiring you to re-authenticate."
                            defaultChecked={true}
                            disabled={true} // Non-configurable for security
                        />
                    </ul>
                </Card>

                {/* Login Activity Card */}
                <Card title="Recent Login Activity">
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    <th className="px-6 py-3">Device</th>
                                    <th className="px-6 py-3">Location</th>
                                    <th className="px-6 py-3">IP Address</th>
                                    <th className="px-6 py-3">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_LOGIN_ACTIVITY.map(activity => (
                                    <tr key={activity.id} className={`border-b border-gray-800 ${activity.isCurrent ? 'bg-cyan-500/10' : 'hover:bg-gray-800/50'}`}>
                                        <td className="px-6 py-4 font-medium text-white">{activity.device} {activity.isCurrent && <span className="text-xs text-cyan-300">(Current)</span>}</td>
                                        <td className="px-6 py-4">{activity.location}</td>
                                        <td className="px-6 py-4">{activity.ip}</td>
                                        <td className="px-6 py-4">{activity.timestamp}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* NEW CARDS - Ordered logically */}
                <SecurityPostureCard />
                <AdvancedAuthenticationCard />
                <DeviceManagementCard />
                <DataPrivacyControlsCard />
                <TransactionMonitoringCard />
                <ThreatAlertsCard />
                <AuditLogViewerCard />
                <EmergencyActionsCard />
                <APIKeyManagementCard />
                <SecurityAwarenessTrainingCard /> {/* New Card for training */}

            </div>
            {/* All modals */}
            <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
            {/* Modals from sub-components are handled within their respective components for encapsulation. */}
        </>
    );
};

export default SecurityView;