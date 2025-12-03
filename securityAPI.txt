import {
    type LoginActivity,
    type Device,
    type DataSharingPolicy,
    type TransactionRule,
    type ThreatAlert,
    type AuditLogEntry,
    type APIKey,
    type TrustedContact,
    type SecurityAwarenessModule,
} from '../components/SecurityView';

// ================================================================================================
// MOCK BACKEND DATA (for simulating API responses)
// Duplicated from SecurityView for self-containment and to reflect "backend state"
// ================================================================================================

let MOCK_BACKEND_LOGIN_ACTIVITY: LoginActivity[] = [
    { id: '1', device: 'Chrome on macOS', location: 'New York, USA', ip: '192.168.1.1', timestamp: '2 minutes ago', isCurrent: true },
    { id: '2', device: 'DemoBank App on iOS', location: 'New York, USA', ip: '172.16.0.1', timestamp: '3 days ago', isCurrent: false },
    { id: '3', device: 'Chrome on Windows', location: 'Chicago, USA', ip: '10.0.0.1', timestamp: '1 week ago', isCurrent: false },
    { id: '4', device: 'Firefox on Linux', location: 'London, UK', ip: '88.201.54.123', timestamp: '2 weeks ago', isCurrent: false },
    { id: '5', device: 'DemoBank App on Android', location: 'Berlin, Germany', ip: '212.1.2.3', timestamp: '1 month ago', isCurrent: false },
];

let MOCK_BACKEND_DEVICES: Device[] = [
    { id: 'dev1', name: 'My MacBook Pro', type: 'Laptop', lastActivity: '2 minutes ago', location: 'New York, USA', ip: '192.168.1.1', isCurrent: true, permissions: ['Full Access'], status: 'active' },
    { id: 'dev2', name: 'iPhone 15 Pro', type: 'Mobile', lastActivity: '3 hours ago', location: 'New York, USA', ip: '172.16.0.1', isCurrent: false, permissions: ['Limited Access', 'Biometric Login'], status: 'active' },
    { id: 'dev3', name: 'iPad Air', type: 'Tablet', lastActivity: '1 day ago', location: 'Home Network', ip: '10.0.0.1', isCurrent: false, permissions: ['Read-Only'], status: 'active' },
    { id: 'dev4', name: 'Old Android Tablet', type: 'Tablet', lastActivity: '3 months ago', location: 'Boston, USA', ip: '68.12.34.56', isCurrent: false, permissions: ['Read-Only'], status: 'revoked' },
];

let MOCK_BACKEND_DATA_SHARING_POLICIES: DataSharingPolicy[] = [
    { id: 'ds1', partner: 'CreditScorePlus Inc.', dataCategories: ['Transaction History', 'Account Balances'], purpose: 'Credit Score Analysis', active: true, lastUpdated: '2023-10-26' },
    { id: 'ds2', partner: 'Financial Insights AI', dataCategories: ['Spending Habits (Anonymized)'], purpose: 'Personalized Budgeting Advice', active: true, lastUpdated: '2023-10-20' },
    { id: 'ds3', partner: 'Marketing Analytics Co.', dataCategories: ['Demographic Information'], purpose: 'Targeted Marketing', active: false, lastUpdated: '2023-09-15' },
    { id: 'ds4', partner: 'Research Institute for Economic Trends', dataCategories: ['Aggregated Spending Data (Anonymized)'], purpose: 'Economic Research', active: true, lastUpdated: '2024-01-01' },
];

let MOCK_BACKEND_TRANSACTION_RULES: TransactionRule[] = [
    { id: 'tr1', name: 'High Value Transaction Alert', type: 'large_withdrawal', threshold: 5000, currency: 'USD', active: true },
    { id: 'tr2', name: 'International Travel Alert', type: 'unusual_location', location: 'International', active: false },
    { id: 'tr3', name: 'Daily Spending Limit', type: 'spend_limit', threshold: 1000, currency: 'USD', active: true },
    { id: 'tr4', name: 'New Beneficiary Approval', type: 'new_beneficiary', active: true },
];

let MOCK_BACKEND_THREAT_ALERTS: ThreatAlert[] = [
    { id: 'ta1', severity: 'critical', category: 'Phishing Attempt', description: 'Suspicious login attempt from Nigeria detected.', timestamp: '2024-03-01T10:30:00Z', status: 'new', actionableItems: ['Change password', 'Review login activity', 'Contact support'] },
    { id: 'ta2', severity: 'high', category: 'Unusual Activity', description: 'Large transfer initiated to new beneficiary account.', timestamp: '2024-02-28T15:00:00Z', status: 'investigating', actionableItems: ['Verify transfer', 'Contact recipient', 'Lock account temporarily'] },
    { id: 'ta3', severity: 'medium', category: 'Software Vulnerability', description: 'Outdated browser detected on a linked device.', timestamp: '2024-02-27T08:00:00Z', status: 'resolved' },
    { id: 'ta4', severity: 'low', category: 'Security Recommendation', description: 'Consider enabling FIDO2 security key for primary login.', timestamp: '2024-02-25T09:00:00Z', status: 'new', actionableItems: ['Explore FIDO2 options'] },
];

let MOCK_BACKEND_AUDIT_LOGS: AuditLogEntry[] = [
    { id: 'al1', timestamp: '2024-03-01T10:35:00Z', action: 'Login Success', user: 'self', details: 'Successful login from current device.', ipAddress: '192.168.1.1', level: 'info' },
    { id: 'al2', timestamp: '2024-03-01T10:30:00Z', action: 'Login Attempt Failed', user: 'unknown', details: 'Incorrect password entered.', ipAddress: '41.203.X.X', level: 'warning' },
    { id: 'al3', timestamp: '2024-02-29T11:00:00Z', action: 'Data Sharing Policy Updated', user: 'self', details: 'Disabled sharing with Marketing Analytics Co.', ipAddress: '192.168.1.1', level: 'info' },
    { id: 'al4', timestamp: '2024-02-28T15:05:00Z', action: 'Transaction Rule Created', user: 'self', details: 'Added high value transaction alert ($5000).', ipAddress: '172.16.0.1', level: 'info' },
    { id: 'al5', timestamp: '2024-02-27T10:00:00Z', action: 'Device Access Revoked', user: 'self', details: 'Revoked access for Old Android Tablet.', ipAddress: '192.168.1.1', level: 'warning' },
];

let MOCK_BACKEND_API_KEYS: APIKey[] = [
    { id: 'api1', name: 'My Analytics Dashboard', keyPrefix: 'pk_live_abcd', created: '2023-08-01', status: 'active', permissions: ['Read Accounts', 'Read Transactions'] },
    { id: 'api2', name: 'Budgeting App Integration', keyPrefix: 'pk_test_efgh', created: '2023-11-10', expires: '2024-05-10', status: 'active', permissions: ['Read Accounts', 'Create Categories'] },
    { id: 'api3', name: 'Expired Test Key', keyPrefix: 'pk_test_ijkl', created: '2023-01-01', expires: '2023-02-01', status: 'expired', permissions: ['Read Accounts'] },
];

let MOCK_BACKEND_TRUSTED_CONTACTS: TrustedContact[] = [
    { id: 'tc1', name: 'Jane Doe', email: 'jane.doe@example.com', phone: '+1-555-123-4567', relation: 'Spouse', accessLevel: 'limited_action' },
    { id: 'tc2', name: 'John Smith', email: 'john.smith@example.com', phone: '+1-555-987-6543', relation: 'Family Member', accessLevel: 'view_only' },
];

let MOCK_BACKEND_SECURITY_AWARENESS_MODULES: SecurityAwarenessModule[] = [
    { id: 'sa1', title: 'Phishing & Social Engineering Protection', description: 'Learn to identify and avoid common phishing scams and social engineering tactics.', completionStatus: 'in_progress', lastAccessed: '2024-02-20', url: '/security-awareness/phishing' },
    { id: 'sa2', title: 'Strong Password Best Practices', description: 'Understand how to create and manage truly strong, unique passwords.', completionStatus: 'completed', lastAccessed: '2023-11-01', url: '/security-awareness/passwords' },
    { id: 'sa3', title: 'Understanding 2FA and MFA', description: 'A deep dive into multi-factor authentication and its importance.', completionStatus: 'not_started', lastAccessed: 'N/A', url: '/security-awareness/mfa' },
];

let MOCK_BACKEND_FIDO_KEYS: { id: string; name: string; added: string }[] = [
    { id: 'key1', name: 'My YubiKey 5C NFC', added: '2023-01-15' },
];

// MOCK SECURITY POSTURE STATE
let MOCK_BACKEND_SECURITY_SCORE = 85;
let MOCK_BACKEND_SECURITY_RECOMMENDATIONS = [
    "Enable Biometric Login on all devices for quicker access.",
    "Review Data Sharing Policies and disable unnecessary ones.",
    "Set up a high-value transaction alert for transfers over $10,000.",
    "Consider using a FIDO2 security key for advanced 2FA to prevent phishing.",
    "Complete the 'Phishing & Social Engineering Protection' awareness module.",
    "Regularly review your linked accounts and unlink any inactive ones.",
];

// MOCK SECURITY TOGGLE STATES (for SecurityViewToggle-like settings)
let MOCK_BACKEND_SETTINGS = {
    twoFactorAuthentication: true,
    biometricLogin: false,
    emailSecurityAlerts: true,
    smsSecurityAlerts: true,
    automaticLogoutOnInactivity: true,
    adaptiveAuthentication: true,
    geoFencing: false,
    loginIPWhitelisting: false,
    totp: true,
    anonymizeSpendingData: true,
    deadManSwitchInactivityPeriod: 90, // days
};


// ================================================================================================
// API CLIENT IMPLEMENTATION
// Uses Promises and setTimeout to simulate asynchronous network requests.
// ================================================================================================

const API_BASE_URL = '/api/v1/security'; // Mock base URL

const securityAPI = {
    /**
     * @description Simulates user authentication related backend calls.
     */
    auth: {
        changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
            console.log(`[API] Attempting to change password for user...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    // In a real scenario, this would validate currentPassword and hash newPassword.
                    if (currentPassword === 'oldpass' && newPassword.length >= 8) { // Basic mock validation
                        console.log(`[API] Password changed successfully.`);
                        MOCK_BACKEND_AUDIT_LOGS.unshift({
                            id: `al${MOCK_BACKEND_AUDIT_LOGS.length + 1}`,
                            timestamp: new Date().toISOString(),
                            action: 'Password Changed',
                            user: 'self',
                            details: 'User initiated password change.',
                            ipAddress: '192.168.1.1',
                            level: 'info'
                        });
                        resolve();
                    } else {
                        throw new Error("Failed to change password: Invalid current password or new password too short.");
                    }
                }, 1000);
            });
        },
        fetchAccountSecuritySettings: async (): Promise<typeof MOCK_BACKEND_SETTINGS> => {
            console.log(`[API] Fetching account security settings...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ ...MOCK_BACKEND_SETTINGS });
                }, 500);
            });
        },
        toggleSecuritySetting: async (settingName: keyof typeof MOCK_BACKEND_SETTINGS, active: boolean): Promise<void> => {
            console.log(`[API] Toggling security setting '${settingName}' to ${active}...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    // @ts-ignore dynamic update
                    MOCK_BACKEND_SETTINGS[settingName] = active;
                    MOCK_BACKEND_AUDIT_LOGS.unshift({
                        id: `al${MOCK_BACKEND_AUDIT_LOGS.length + 1}`,
                        timestamp: new Date().toISOString(),
                        action: `Setting Toggled: ${settingName}`,
                        user: 'self',
                        details: `Set ${settingName} to ${active ? 'enabled' : 'disabled'}.`,
                        ipAddress: '192.168.1.1',
                        level: 'info'
                    });
                    resolve();
                }, 500);
            });
        },
    },

    /**
     * @description Simulates device management related backend calls.
     */
    devices: {
        fetchDevices: async (): Promise<Device[]> => {
            console.log(`[API] Fetching authorized devices...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve([...MOCK_BACKEND_DEVICES]);
                }, 500);
            });
        },
        revokeDevice: async (deviceId: string): Promise<void> => {
            console.log(`[API] Revoking access for device: ${deviceId}...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    MOCK_BACKEND_DEVICES = MOCK_BACKEND_DEVICES.map(d => d.id === deviceId ? { ...d, status: 'revoked' } : d);
                    MOCK_BACKEND_AUDIT_LOGS.unshift({
                        id: `al${MOCK_BACKEND_AUDIT_LOGS.length + 1}`,
                        timestamp: new Date().toISOString(),
                        action: 'Device Access Revoked',
                        user: 'self',
                        details: `Access revoked for device ID: ${deviceId}.`,
                        ipAddress: '192.168.1.1',
                        level: 'warning'
                    });
                    resolve();
                }, 1000);
            });
        },
        lockDevice: async (deviceId: string): Promise<void> => {
            console.log(`[API] Remotely locking device: ${deviceId}...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    MOCK_BACKEND_DEVICES = MOCK_BACKEND_DEVICES.map(d => d.id === deviceId ? { ...d, status: 'locked' } : d);
                     MOCK_BACKEND_AUDIT_LOGS.unshift({
                        id: `al${MOCK_BACKEND_AUDIT_LOGS.length + 1}`,
                        timestamp: new Date().toISOString(),
                        action: 'Device Remotely Locked',
                        user: 'self',
                        details: `Device ID: ${deviceId} remotely locked.`,
                        ipAddress: '192.168.1.1',
                        level: 'warning'
                    });
                    resolve();
                }, 1000);
            });
        },
        fetchLoginHistory: async (): Promise<LoginActivity[]> => {
            console.log(`[API] Fetching login history...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve([...MOCK_BACKEND_LOGIN_ACTIVITY]);
                }, 500);
            });
        },
    },

    /**
     * @description Simulates data privacy and sharing related backend calls.
     */
    dataPrivacy: {
        fetchDataSharingPolicies: async (): Promise<DataSharingPolicy[]> => {
            console.log(`[API] Fetching data sharing policies...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve([...MOCK_BACKEND_DATA_SHARING_POLICIES]);
                }, 500);
            });
        },
        toggleDataSharingPolicy: async (policyId: string, active: boolean): Promise<void> => {
            console.log(`[API] Toggling data sharing policy ${policyId} to ${active}...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    MOCK_BACKEND_DATA_SHARING_POLICIES = MOCK_BACKEND_DATA_SHARING_POLICIES.map(p =>
                        p.id === policyId ? { ...p, active: active, lastUpdated: new Date().toISOString().slice(0, 10) } : p
                    );
                    MOCK_BACKEND_AUDIT_LOGS.unshift({
                        id: `al${MOCK_BACKEND_AUDIT_LOGS.length + 1}`,
                        timestamp: new Date().toISOString(),
                        action: 'Data Sharing Policy Updated',
                        user: 'self',
                        details: `Policy ${policyId} set to ${active ? 'active' : 'inactive'}.`,
                        ipAddress: '192.168.1.1',
                        level: 'info'
                    });
                    resolve();
                }, 1000);
            });
        },
        requestDataPortability: async (): Promise<void> => {
            console.log(`[API] Submitting data portability request...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    MOCK_BACKEND_AUDIT_LOGS.unshift({
                        id: `al${MOCK_BACKEND_AUDIT_LOGS.length + 1}`,
                        timestamp: new Date().toISOString(),
                        action: 'Data Portability Request',
                        user: 'self',
                        details: 'User requested a copy of all personal data.',
                        ipAddress: '192.168.1.1',
                        level: 'info'
                    });
                    resolve();
                }, 3000); // Simulate longer processing time
            });
        },
        toggleAnonymizeSpendingData: async (active: boolean): Promise<void> => {
            console.log(`[API] Toggling anonymize spending data to ${active}...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    MOCK_BACKEND_SETTINGS.anonymizeSpendingData = active;
                    MOCK_BACKEND_AUDIT_LOGS.unshift({
                        id: `al${MOCK_BACKEND_AUDIT_LOGS.length + 1}`,
                        timestamp: new Date().toISOString(),
                        action: 'Anonymize Spending Data',
                        user: 'self',
                        details: `Anonymize spending data set to ${active ? 'enabled' : 'disabled'}.`,
                        ipAddress: '192.168.1.1',
                        level: 'info'
                    });
                    resolve();
                }, 500);
            });
        },
    },

    /**
     * @description Simulates transaction monitoring and rules related backend calls.
     */
    transactions: {
        fetchTransactionRules: async (): Promise<TransactionRule[]> => {
            console.log(`[API] Fetching transaction rules...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve([...MOCK_BACKEND_TRANSACTION_RULES]);
                }, 500);
            });
        },
        addTransactionRule: async (rule: Omit<TransactionRule, 'id'>): Promise<TransactionRule> => {
            console.log(`[API] Adding new transaction rule:`, rule);
            return new Promise((resolve) => {
                setTimeout(() => {
                    const newId = `tr${MOCK_BACKEND_TRANSACTION_RULES.length + 1}`;
                    const newRule = { id: newId, ...rule, active: true };
                    MOCK_BACKEND_TRANSACTION_RULES.push(newRule);
                    MOCK_BACKEND_AUDIT_LOGS.unshift({
                        id: `al${MOCK_BACKEND_AUDIT_LOGS.length + 1}`,
                        timestamp: new Date().toISOString(),
                        action: 'Transaction Rule Created',
                        user: 'self',
                        details: `Created rule: "${rule.name}" of type "${rule.type}".`,
                        ipAddress: '192.168.1.1',
                        level: 'info'
                    });
                    resolve(newRule);
                }, 1000);
            });
        },
        toggleTransactionRule: async (ruleId: string, active: boolean): Promise<void> => {
            console.log(`[API] Toggling transaction rule ${ruleId} to ${active}...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    MOCK_BACKEND_TRANSACTION_RULES = MOCK_BACKEND_TRANSACTION_RULES.map(r => r.id === ruleId ? { ...r, active: active } : r);
                    MOCK_BACKEND_AUDIT_LOGS.unshift({
                        id: `al${MOCK_BACKEND_AUDIT_LOGS.length + 1}`,
                        timestamp: new Date().toISOString(),
                        action: 'Transaction Rule Updated',
                        user: 'self',
                        details: `Rule ${ruleId} set to ${active ? 'active' : 'inactive'}.`,
                        ipAddress: '192.168.1.1',
                        level: 'info'
                    });
                    resolve();
                }, 500);
            });
        },
        deleteTransactionRule: async (ruleId: string): Promise<void> => {
            console.log(`[API] Deleting transaction rule: ${ruleId}...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    MOCK_BACKEND_TRANSACTION_RULES = MOCK_BACKEND_TRANSACTION_RULES.filter(r => r.id !== ruleId);
                    MOCK_BACKEND_AUDIT_LOGS.unshift({
                        id: `al${MOCK_BACKEND_AUDIT_LOGS.length + 1}`,
                        timestamp: new Date().toISOString(),
                        action: 'Transaction Rule Deleted',
                        user: 'self',
                        details: `Rule ${ruleId} deleted.`,
                        ipAddress: '192.168.1.1',
                        level: 'warning'
                    });
                    resolve();
                }, 500);
            });
        },
    },

    /**
     * @description Simulates threat intelligence and alert management backend calls.
     */
    threats: {
        fetchThreatAlerts: async (): Promise<ThreatAlert[]> => {
            console.log(`[API] Fetching threat alerts...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve([...MOCK_BACKEND_THREAT_ALERTS]);
                }, 500);
            });
        },
        markThreatAlertResolved: async (alertId: string): Promise<void> => {
            console.log(`[API] Marking threat alert ${alertId} as resolved...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    MOCK_BACKEND_THREAT_ALERTS = MOCK_BACKEND_THREAT_ALERTS.map(a => a.id === alertId ? { ...a, status: 'resolved' } : a);
                    MOCK_BACKEND_AUDIT_LOGS.unshift({
                        id: `al${MOCK_BACKEND_AUDIT_LOGS.length + 1}`,
                        timestamp: new Date().toISOString(),
                        action: 'Threat Alert Resolved',
                        user: 'self',
                        details: `Alert ${alertId} marked as resolved.`,
                        ipAddress: '192.168.1.1',
                        level: 'info'
                    });
                    resolve();
                }, 1000);
            });
        },
    },

    /**
     * @description Simulates audit log fetching and management.
     */
    auditLogs: {
        fetchAuditLogs: async (filters?: { level?: 'info' | 'warning' | 'error' | 'all', keyword?: string }): Promise<AuditLogEntry[]> => {
            console.log(`[API] Fetching audit logs with filters:`, filters);
            return new Promise((resolve) => {
                setTimeout(() => {
                    let filteredLogs = [...MOCK_BACKEND_AUDIT_LOGS];
                    if (filters?.level && filters.level !== 'all') {
                        filteredLogs = filteredLogs.filter(log => log.level === filters.level);
                    }
                    if (filters?.keyword) {
                        const keywordLower = filters.keyword.toLowerCase();
                        filteredLogs = filteredLogs.filter(log =>
                            log.action.toLowerCase().includes(keywordLower) ||
                            log.details.toLowerCase().includes(keywordLower) ||
                            log.ipAddress.toLowerCase().includes(keywordLower) ||
                            log.user.toLowerCase().includes(keywordLower)
                        );
                    }
                    resolve(filteredLogs);
                }, 700);
            });
        },
        exportAuditLogs: async (format: 'csv' | 'json'): Promise<Blob> => {
            console.log(`[API] Exporting audit logs in ${format} format...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    const data = format === 'json' ? JSON.stringify(MOCK_BACKEND_AUDIT_LOGS, null, 2) :
                                 MOCK_BACKEND_AUDIT_LOGS.map(log => Object.values(log).join(',')).join('\n');
                    const mimeType = format === 'json' ? 'application/json' : 'text/csv';
                    const blob = new Blob([data], { type: mimeType });
                    MOCK_BACKEND_AUDIT_LOGS.unshift({
                        id: `al${MOCK_BACKEND_AUDIT_LOGS.length + 1}`,
                        timestamp: new Date().toISOString(),
                        action: 'Audit Logs Exported',
                        user: 'self',
                        details: `Exported logs in ${format.toUpperCase()} format.`,
                        ipAddress: '192.168.1.1',
                        level: 'info'
                    });
                    resolve(blob);
                }, 1500);
            });
        },
    },

    /**
     * @description Simulates emergency protocols and recovery features.
     */
    emergency: {
        activateEmergencyLock: async (): Promise<void> => {
            console.log(`[API] Activating emergency account lock...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Simulate freezing transactions, logging out all sessions, etc.
                    MOCK_BACKEND_AUDIT_LOGS.unshift({
                        id: `al${MOCK_BACKEND_AUDIT_LOGS.length + 1}`,
                        timestamp: new Date().toISOString(),
                        action: 'Emergency Account Lock Activated',
                        user: 'self',
                        details: 'All account activity frozen due to emergency.',
                        ipAddress: '192.168.1.1',
                        level: 'critical'
                    });
                    resolve();
                }, 2000);
            });
        },
        fetchDeadManSwitchBeneficiaries: async (): Promise<TrustedContact[]> => {
            console.log(`[API] Fetching Dead Man's Switch beneficiaries...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve([...MOCK_BACKEND_TRUSTED_CONTACTS]);
                }, 500);
            });
        },
        updateDeadManSwitchInactivityPeriod: async (days: number): Promise<void> => {
            console.log(`[API] Updating Dead Man's Switch inactivity period to ${days} days...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    MOCK_BACKEND_SETTINGS.deadManSwitchInactivityPeriod = days;
                     MOCK_BACKEND_AUDIT_LOGS.unshift({
                        id: `al${MOCK_BACKEND_AUDIT_LOGS.length + 1}`,
                        timestamp: new Date().toISOString(),
                        action: 'Dead Man\'s Switch Updated',
                        user: 'self',
                        details: `Inactivity period set to ${days} days.`,
                        ipAddress: '192.168.1.1',
                        level: 'info'
                    });
                    resolve();
                }, 500);
            });
        },
        addDeadManSwitchBeneficiary: async (contact: Omit<TrustedContact, 'id'>): Promise<TrustedContact> => {
            console.log(`[API] Adding new Dead Man's Switch beneficiary:`, contact);
            return new Promise((resolve) => {
                setTimeout(() => {
                    const newId = `tc${MOCK_BACKEND_TRUSTED_CONTACTS.length + 1}`;
                    const newBeneficiary = { id: newId, ...contact };
                    MOCK_BACKEND_TRUSTED_CONTACTS.push(newBeneficiary);
                    MOCK_BACKEND_AUDIT_LOGS.unshift({
                        id: `al${MOCK_BACKEND_AUDIT_LOGS.length + 1}`,
                        timestamp: new Date().toISOString(),
                        action: 'Dead Man\'s Switch Beneficiary Added',
                        user: 'self',
                        details: `Added beneficiary: ${contact.name}.`,
                        ipAddress: '192.168.1.1',
                        level: 'info'
                    });
                    resolve(newBeneficiary);
                }, 1000);
            });
        },
        removeDeadManSwitchBeneficiary: async (contactId: string): Promise<void> => {
            console.log(`[API] Removing Dead Man's Switch beneficiary: ${contactId}...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    MOCK_BACKEND_TRUSTED_CONTACTS = MOCK_BACKEND_TRUSTED_CONTACTS.filter(b => b.id !== contactId);
                    MOCK_BACKEND_AUDIT_LOGS.unshift({
                        id: `al${MOCK_BACKEND_AUDIT_LOGS.length + 1}`,
                        timestamp: new Date().toISOString(),
                        action: 'Dead Man\'s Switch Beneficiary Removed',
                        user: 'self',
                        details: `Removed beneficiary ID: ${contactId}.`,
                        ipAddress: '192.168.1.1',
                        level: 'warning'
                    });
                    resolve();
                }, 500);
            });
        },
    },

    /**
     * @description Simulates API key management backend calls.
     */
    apiKey: {
        fetchAPIKeys: async (): Promise<APIKey[]> => {
            console.log(`[API] Fetching API keys...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve([...MOCK_BACKEND_API_KEYS]);
                }, 500);
            });
        },
        createAPIKey: async (keyData: Omit<APIKey, 'id' | 'keyPrefix' | 'created' | 'status'>): Promise<APIKey> => {
            console.log(`[API] Creating new API key:`, keyData);
            return new Promise((resolve) => {
                setTimeout(() => {
                    const newId = `api${MOCK_BACKEND_API_KEYS.length + 1}`;
                    const newKeyPrefix = `pk_${Math.random().toString(36).substring(2, 6)}`; // Simulate unique prefix
                    const created = new Date().toISOString().slice(0, 10);
                    const newKey: APIKey = {
                        id: newId,
                        keyPrefix: newKeyPrefix,
                        created,
                        status: 'active',
                        ...keyData,
                    };
                    MOCK_BACKEND_API_KEYS.push(newKey);
                    MOCK_BACKEND_AUDIT_LOGS.unshift({
                        id: `al${MOCK_BACKEND_AUDIT_LOGS.length + 1}`,
                        timestamp: new Date().toISOString(),
                        action: 'API Key Generated',
                        user: 'self',
                        details: `Generated new API key: "${keyData.name}".`,
                        ipAddress: '192.168.1.1',
                        level: 'warning'
                    });
                    resolve(newKey);
                }, 1500);
            });
        },
        revokeAPIKey: async (keyId: string): Promise<void> => {
            console.log(`[API] Revoking API key: ${keyId}...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    MOCK_BACKEND_API_KEYS = MOCK_BACKEND_API_KEYS.map(key => key.id === keyId ? { ...key, status: 'revoked' } : key);
                    MOCK_BACKEND_AUDIT_LOGS.unshift({
                        id: `al${MOCK_BACKEND_AUDIT_LOGS.length + 1}`,
                        timestamp: new Date().toISOString(),
                        action: 'API Key Revoked',
                        user: 'self',
                        details: `API key ${keyId} revoked.`,
                        ipAddress: '192.168.1.1',
                        level: 'error'
                    });
                    resolve();
                }, 1000);
            });
        },
        manageWebhooks: async (action: 'fetch' | 'add' | 'remove', webhookData?: any): Promise<any> => {
            console.log(`[API] Managing webhooks: ${action}`, webhookData);
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Simulate webhook management logic
                    resolve({ status: 'success', message: `Webhook action ${action} simulated.` });
                }, 1000);
            });
        }
    },

    /**
     * @description Simulates security awareness training backend calls.
     */
    securityAwareness: {
        fetchSecurityAwarenessModules: async (): Promise<SecurityAwarenessModule[]> => {
            console.log(`[API] Fetching security awareness modules...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve([...MOCK_BACKEND_SECURITY_AWARENESS_MODULES]);
                }, 500);
            });
        },
        markSecurityModuleCompleted: async (moduleId: string): Promise<void> => {
            console.log(`[API] Marking security module ${moduleId} as completed...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    MOCK_BACKEND_SECURITY_AWARENESS_MODULES = MOCK_BACKEND_SECURITY_AWARENESS_MODULES.map(mod =>
                        mod.id === moduleId ? { ...mod, completionStatus: 'completed', lastAccessed: new Date().toISOString().slice(0, 10) } : mod
                    );
                    MOCK_BACKEND_AUDIT_LOGS.unshift({
                        id: `al${MOCK_BACKEND_AUDIT_LOGS.length + 1}`,
                        timestamp: new Date().toISOString(),
                        action: 'Security Module Completed',
                        user: 'self',
                        details: `Completed module: ${moduleId}.`,
                        ipAddress: '192.168.1.1',
                        level: 'info'
                    });
                    resolve();
                }, 1000);
            });
        },
    },

    /**
     * @description Simulates advanced authentication backend calls.
     */
    advancedAuth: {
        fetchFidoSecurityKeys: async (): Promise<{ id: string; name: string; added: string }[]> => {
            console.log(`[API] Fetching FIDO security keys...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve([...MOCK_BACKEND_FIDO_KEYS]);
                }, 500);
            });
        },
        registerFidoSecurityKey: async (name: string): Promise<{ id: string; name: string; added: string }> => {
            console.log(`[API] Registering new FIDO security key: ${name}...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    const newId = `key${MOCK_BACKEND_FIDO_KEYS.length + 1}`;
                    const newKey = { id: newId, name, added: new Date().toISOString().slice(0, 10) };
                    MOCK_BACKEND_FIDO_KEYS.push(newKey);
                    MOCK_BACKEND_AUDIT_LOGS.unshift({
                        id: `al${MOCK_BACKEND_AUDIT_LOGS.length + 1}`,
                        timestamp: new Date().toISOString(),
                        action: 'FIDO Security Key Registered',
                        user: 'self',
                        details: `Registered new FIDO key: "${name}".`,
                        ipAddress: '192.168.1.1',
                        level: 'info'
                    });
                    resolve(newKey);
                }, 2000);
            });
        },
        removeFidoSecurityKey: async (keyId: string): Promise<void> => {
            console.log(`[API] Removing FIDO security key: ${keyId}...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    MOCK_BACKEND_FIDO_KEYS = MOCK_BACKEND_FIDO_KEYS.filter(k => k.id !== keyId);
                    MOCK_BACKEND_AUDIT_LOGS.unshift({
                        id: `al${MOCK_BACKEND_AUDIT_LOGS.length + 1}`,
                        timestamp: new Date().toISOString(),
                        action: 'FIDO Security Key Removed',
                        user: 'self',
                        details: `Removed FIDO key ID: ${keyId}.`,
                        ipAddress: '192.168.1.1',
                        level: 'warning'
                    });
                    resolve();
                }, 1000);
            });
        },
    },

    /**
     * @description Simulates fetching security posture and recommendations.
     */
    securityPosture: {
        fetchSecurityPosture: async (): Promise<{ score: number; recommendations: string[] }> => {
            console.log(`[API] Fetching security posture...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        score: MOCK_BACKEND_SECURITY_SCORE,
                        recommendations: [...MOCK_BACKEND_SECURITY_RECOMMENDATIONS],
                    });
                }, 500);
            });
        },
    },
};

export default securityAPI;