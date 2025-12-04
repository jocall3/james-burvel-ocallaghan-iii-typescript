/**
 * @file services/securityAPI.ts
 * @description This module provides a robust, commercial-grade API simulation for the Digital Identity and Security components
 * crucial to a modern financial platform. It delivers core services including cryptographic identity management,
 * role-based access control (RBAC), advanced authentication (FIDO2), comprehensive audit logging with tamper-evident properties,
 * dynamic security policy enforcement, and proactive threat intelligence.
 *
 * Business value: This foundational security layer safeguards customer assets and data, ensures regulatory compliance,
 * and enables rapid innovation by providing secure, programmable interfaces for agentic AI systems and token rail integrations.
 * Its robust controls minimize fraud, accelerate incident response, and establish unparalleled trust, directly contributing
 * to brand reputation and billions in protected and enabled transaction flows. It serves as a single pane of glass
 * for managing all security postures, enhancing operational efficiency and reducing potential financial liabilities.
 */

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

// --- New Local Interfaces for Digital Identity and RBAC ---
/**
 * @interface KeyStoreEntry
 * @description Represents a securely stored key within the simulated local keystore.
 * This is a simplification; in a real system, keys would be managed by a robust KMS.
 * Exported to allow type checking in consuming modules for extended security features.
 */
export interface KeyStoreEntry {
    id: string; // Unique identifier for the key
    alias: string; // Human-readable name for the key
    publicKey: string; // The public key component (e.g., PEM format)
    privateKeyEncrypted: string; // Encrypted private key (simulated encryption using a simple placeholder)
    created: string; // ISO date string
    lastUsed: string; // ISO date string
    ownerId: string; // ID of the user or agent who owns this key
    keyType: 'signing' | 'encryption' | 'identity';
}

/**
 * @interface UserIdentity
 * @description Represents a user's digital identity within the system, potentially linking to keypairs.
 * This extends basic user information with security-specific attributes for robust identity management.
 * Exported to allow type checking in consuming modules for extended security features.
 */
export interface UserIdentity {
    id: string;
    username: string;
    email: string;
    isActive: boolean;
    roles: string[]; // List of role IDs
    publicKeyIds: string[]; // List of IDs of associated public keys
    lastLogin: string;
}

/**
 * @interface Role
 * @description Defines a role with specific permissions.
 * Exported to allow type checking in consuming modules for extended security features.
 */
export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[]; // e.g., ['can_read_transactions', 'can_initiate_transfer', 'can_manage_roles']
}

/**
 * @interface AccessControlPolicy
 * @description Defines a policy for resource access, mapping roles/users to actions on resources.
 * This enables fine-grained authorization logic for all system operations.
 * Exported to allow type checking in consuming modules for extended security features.
 */
export interface AccessControlPolicy {
    id: string;
    name: string;
    description: string;
    resource: string; // e.g., 'transaction_service', 'user_data', 'agent_orchestration'
    action: string; // e.g., 'read', 'write', 'execute', 'approve'
    requiredRoles: string[]; // Roles required to perform this action on this resource
    active: boolean;
}

/**
 * @interface SecurityEvent
 * @description Represents a granular security event, potentially an input for threat detection agents.
 * This structured event data feeds directly into monitoring and AI-driven anomaly detection systems.
 * Exported to allow type checking in consuming modules for extended security features.
 */
export interface SecurityEvent {
    id: string;
    timestamp: string;
    type: string; // e.g., 'login_attempt', 'transaction_initiation', 'api_call', 'data_access'
    source: string; // e.g., 'auth_service', 'payments_engine', 'data_privacy_module'
    userId?: string;
    agentId?: string;
    details: Record<string, any>; // Arbitrary details about the event
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
}

/**
 * @interface HashedAuditLogEntry
 * @description An audit log entry augmented with cryptographic hashes for tamper evidence.
 * This ensures the integrity and non-repudiation of all recorded system activities.
 * Exported to allow type checking in consuming modules for extended security features.
 */
export interface HashedAuditLogEntry extends AuditLogEntry {
    hash: string;
    previousHash: string; // Hash of the previous entry in the chain
}


// ================================================================================================
// MOCK BACKEND DATA (for simulating API responses)
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

// Raw audit logs for initial processing into HashedAuditLogEntry
const RAW_MOCK_BACKEND_AUDIT_LOGS_INITIAL: AuditLogEntry[] = [
    { id: 'al1', timestamp: '2024-03-01T10:35:00Z', action: 'Login Success', user: 'self', details: 'Successful login from current device.', ipAddress: '192.168.1.1', level: 'info' },
    { id: 'al2', timestamp: '2024-03-01T10:30:00Z', action: 'Login Attempt Failed', user: 'unknown', details: 'Incorrect password entered.', ipAddress: '41.203.X.X', level: 'warning' },
    { id: 'al3', timestamp: '2024-02-29T11:00:00Z', action: 'Data Sharing Policy Updated', user: 'self', details: 'Disabled sharing with Marketing Analytics Co.', ipAddress: '192.168.1.1', level: 'info' },
    { id: 'al4', timestamp: '2024-02-28T15:05:00Z', action: 'Transaction Rule Created', user: 'self', details: 'Added high value transaction alert ($5000).', ipAddress: '172.16.0.1', level: 'info' },
    { id: 'al5', timestamp: '2024-02-27T10:00:00Z', action: 'Device Access Revoked', user: 'self', details: 'Revoked access for Old Android Tablet.', ipAddress: '192.168.1.1', level: 'warning' },
];

let MOCK_BACKEND_AUDIT_LOGS: HashedAuditLogEntry[] = []; // This will be dynamically populated with hashed entries

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

// --- New MOCK BACKEND DATA for Digital Identity and RBAC ---
let MOCK_BACKEND_USERS: UserIdentity[] = [
    { id: 'user1', username: 'alice', email: 'alice@example.com', isActive: true, roles: ['admin', 'user'], publicKeyIds: ['pk_alice_1'], lastLogin: '2024-03-01T10:35:00Z' },
    { id: 'user2', username: 'bob', email: 'bob@example.com', isActive: true, roles: ['user'], publicKeyIds: ['pk_bob_1'], lastLogin: '2024-02-28T15:05:00Z' },
    { id: 'agent_payment', username: 'payment_orchestrator_agent', email: 'agent@example.com', isActive: true, roles: ['agent', 'payments_executor'], publicKeyIds: ['pk_agent_payment_1'], lastLogin: '2024-03-01T11:00:00Z' },
];

let MOCK_BACKEND_ROLES: Role[] = [
    { id: 'admin', name: 'Administrator', description: 'Full access to manage the system.', permissions: ['system:admin', 'users:manage', 'roles:manage', 'payments:full_access', 'security:full_access'] },
    { id: 'user', name: 'Standard User', description: 'Basic user access with personal account management.', permissions: ['account:read', 'transactions:read_write', 'identity:manage_self'] },
    { id: 'payments_executor', name: 'Payments Executor Agent', description: 'Authorized to initiate and settle payments.', permissions: ['payments:initiate', 'payments:settle', 'payments:route'] },
    { id: 'auditor', name: 'Security Auditor', description: 'Read-only access to audit logs and security policies.', permissions: ['audit_logs:read', 'policies:read', 'threats:read'] },
    { id: 'agent', name: 'Generic AI Agent', description: 'Base role for AI agents.', permissions: ['events:report', 'data:read_anonymized'] },
];

let MOCK_BACKEND_DIGITAL_IDENTITIES: KeyStoreEntry[] = [
    {
        id: 'pk_alice_1', alias: 'Alice_Main_Key', publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsR7d...', // Example PEM-like string
        privateKeyEncrypted: 'simulated-encrypted-private-key-for-alice', // Simulated encryption
        created: '2023-10-01T00:00:00Z', lastUsed: '2024-03-01T10:35:00Z', ownerId: 'user1', keyType: 'identity'
    },
    {
        id: 'pk_bob_1', alias: 'Bob_Transfer_Key', publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsQ7k...',
        privateKeyEncrypted: 'simulated-encrypted-private-key-for-bob',
        created: '2023-11-15T00:00:00Z', lastUsed: '2024-02-28T15:05:00Z', ownerId: 'user2', keyType: 'signing'
    },
    {
        id: 'pk_agent_payment_1', alias: 'Payment_Agent_Signature_Key', publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtR8j...',
        privateKeyEncrypted: 'simulated-encrypted-private-key-for-agentpayment',
        created: '2024-01-20T00:00:00Z', lastUsed: '2024-03-01T11:00:00Z', ownerId: 'agent_payment', keyType: 'signing'
    }
];

let MOCK_BACKEND_ACCESS_POLICIES: AccessControlPolicy[] = [
    { id: 'policy1', name: 'Admin Full Access', description: 'Admins can manage all system settings.', resource: '*', action: '*', requiredRoles: ['admin'], active: true },
    { id: 'policy2', name: 'User Transaction Access', description: 'Users can read and write their own transactions.', resource: 'transactions', action: 'read_write', requiredRoles: ['user'], active: true },
    { id: 'policy3', name: 'Payments Agent Execution', description: 'Payments executor agents can initiate and settle payments.', resource: 'payments', action: 'initiate_settle', requiredRoles: ['payments_executor'], active: true },
];

let MOCK_BACKEND_SECURITY_EVENTS: SecurityEvent[] = [];

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
// CRYPTOGRAPHIC UTILITIES (MOCKED)
// These functions simulate cryptographic operations using standard Web Crypto API where possible.
// This ensures consistency across browser and Node.js environments.
// ================================================================================================

/**
 * @function generateHash
 * @description Generates a SHA-256 hash for the given string data using Web Crypto API.
 * This is fundamental for creating tamper-evident audit logs and digital signatures.
 * @param data The string to hash.
 * @returns A Promise that resolves with the hexadecimal string representation of the hash.
 */
async function generateHash(data: string): Promise<string> {
    const textEncoder = new TextEncoder();
    const dataBuffer = textEncoder.encode(data);
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hexHash;
}

/**
 * @function addHashedAuditLogEntry
 * @description Adds a new entry to the audit log, ensuring it is cryptographically chained.
 * Business value: This function is critical for maintaining a tamper-evident audit trail,
 * providing irrefutable proof of all system actions. This is essential for regulatory compliance,
 * forensic investigations, and establishing a high degree of trust in system operations.
 * It directly contributes to the platform's security posture and auditability, which is paramount
 * for financial services.
 * @param entry The audit log entry to add (without hash/previousHash).
 * @returns A Promise that resolves with the newly added HashedAuditLogEntry.
 */
async function addHashedAuditLogEntry(entry: Omit<AuditLogEntry, 'id'>): Promise<HashedAuditLogEntry> {
    const newId = `al${MOCK_BACKEND_AUDIT_LOGS.length + 1}`;
    // Get the hash of the most recent log entry to chain them
    const previousEntry = MOCK_BACKEND_AUDIT_LOGS.length > 0 ? MOCK_BACKEND_AUDIT_LOGS[0] : null;
    const previousHash = previousEntry ? previousEntry.hash : '0'; // '0' for the genesis block

    const entryToHash = { ...entry, id: newId, timestamp: entry.timestamp, previousHash };
    const currentHash = await generateHash(JSON.stringify(entryToHash));

    const newLogEntry: HashedAuditLogEntry = {
        ...entry,
        id: newId,
        hash: currentHash,
        previousHash: previousHash
    };
    MOCK_BACKEND_AUDIT_LOGS.unshift(newLogEntry); // Add to the beginning for chronological display
    return newLogEntry;
}

/**
 * @function initializeHashedAuditLogs
 * @description Initializes the MOCK_BACKEND_AUDIT_LOGS by processing the initial raw log entries
 * and generating cryptographic hashes, ensuring the entire chain is valid from startup.
 */
async function initializeHashedAuditLogs() {
    let currentPreviousHash = '0';
    // Process oldest logs first to build the chain correctly
    const reversedLogs = [...RAW_MOCK_BACKEND_AUDIT_LOGS_INITIAL].reverse();
    const hashedLogs: HashedAuditLogEntry[] = [];

    for (const entry of reversedLogs) {
        const entryData = JSON.stringify({ ...entry, previousHash: currentPreviousHash });
        const currentHash = await generateHash(entryData);
        const newLogEntry: HashedAuditLogEntry = {
            ...entry,
            hash: currentHash,
            previousHash: currentPreviousHash
        };
        hashedLogs.push(newLogEntry);
        currentPreviousHash = currentHash;
    }
    // Reverse again to put in newest-first order
    MOCK_BACKEND_AUDIT_LOGS = hashedLogs.reverse();
    console.log('[SECURITY-API] Initialized Hashed Audit Logs with tamper-evident chain.');
}

// Immediately initialize audit logs when the module loads
initializeHashedAuditLogs();


// ================================================================================================
// API CLIENT IMPLEMENTATION
// Uses Promises and setTimeout to simulate asynchronous network requests.
// This structure simulates a production-grade API gateway.
// ================================================================================================

const API_BASE_URL = '/api/v1/security'; // Mock base URL

export const securityAPI = {
    /**
     * @description Simulates user authentication related backend calls.
     * This section manages user login, password policies, and core authentication settings.
     * Business value: Establishes the primary layer of defense for user accounts, preventing
     * unauthorized access and providing configurable security controls that reduce operational risk
     * and enhance user trust.
     */
    auth: {
        changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
            console.log(`[API] Attempting to change password for user...`);
            return new Promise((resolve, reject) => {
                setTimeout(async () => { // Ensure async for audit log
                    if (currentPassword === 'oldpass' && newPassword.length >= 8) {
                        console.log(`[API] Password changed successfully.`);
                        await addHashedAuditLogEntry({
                            timestamp: new Date().toISOString(),
                            action: 'Password Changed',
                            user: 'self',
                            details: 'User initiated password change.',
                            ipAddress: '192.168.1.1',
                            level: 'info'
                        });
                        resolve();
                    } else {
                        const errorMsg = "Failed to change password: Invalid current password or new password too short.";
                        await addHashedAuditLogEntry({
                            timestamp: new Date().toISOString(),
                            action: 'Password Change Failed',
                            user: 'self',
                            details: errorMsg,
                            ipAddress: '192.168.1.1',
                            level: 'error'
                        });
                        reject(new Error(errorMsg));
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
                setTimeout(async () => { // Ensure async for audit log
                    // @ts-ignore dynamic update
                    MOCK_BACKEND_SETTINGS[settingName] = active;
                    await addHashedAuditLogEntry({
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
     * @description Simulates digital identity management, including user profiles, keypair generation,
     * and secure identity verification processes.
     * Business value: This module underpins the entire digital identity framework, enabling secure,
     * cryptographically-backed user and agent identities. This is paramount for verifiable interactions,
     * non-repudiation of transactions on token rails, and establishing trust in an agentic ecosystem,
     * unlocking new levels of automation and compliance.
     */
    identity: {
        createUserIdentity: async (username: string, email: string, initialRoles: string[]): Promise<UserIdentity> => {
            console.log(`[API] Creating new user identity for ${username}...`);
            return new Promise((resolve) => {
                setTimeout(async () => {
                    const newId = `user${MOCK_BACKEND_USERS.length + 1}`;
                    const newUser: UserIdentity = {
                        id: newId,
                        username,
                        email,
                        isActive: true,
                        roles: initialRoles,
                        publicKeyIds: [],
                        lastLogin: new Date().toISOString()
                    };
                    MOCK_BACKEND_USERS.push(newUser);
                    await addHashedAuditLogEntry({
                        timestamp: new Date().toISOString(),
                        action: 'User Identity Created',
                        user: 'system',
                        details: `New user identity created for ${username} (ID: ${newId}).`,
                        ipAddress: '127.0.0.1', // System action
                        level: 'info'
                    });
                    resolve(newUser);
                }, 1000);
            });
        },
        fetchUserIdentity: async (userId: string): Promise<UserIdentity | undefined> => {
            console.log(`[API] Fetching user identity for ID: ${userId}...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(MOCK_BACKEND_USERS.find(u => u.id === userId));
                }, 500);
            });
        },
        generateAndStoreKeyPair: async (ownerId: string, alias: string, keyType: KeyStoreEntry['keyType'] = 'identity'): Promise<KeyStoreEntry> => {
            console.log(`[API] Generating and storing key pair for owner ${ownerId} (Alias: ${alias})...`);
            return new Promise((resolve, reject) => {
                setTimeout(async () => {
                    // Simulate key generation - real keys would be complex crypto objects
                    const newKeyId = `pk_${ownerId}_${MOCK_BACKEND_DIGITAL_IDENTITIES.length + 1}`;
                    const publicKeySim = `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs${Math.random().toString(36).substring(2, 15)}...`; // Mock PEM format
                    const privateKeyEncryptedSim = `simulated-encrypted-private-key-for-${ownerId}-${newKeyId}`; // Mock encryption

                    const newKeyEntry: KeyStoreEntry = {
                        id: newKeyId,
                        alias,
                        publicKey: publicKeySim,
                        privateKeyEncrypted: privateKeyEncryptedSim,
                        created: new Date().toISOString(),
                        lastUsed: new Date().toISOString(),
                        ownerId,
                        keyType
                    };
                    MOCK_BACKEND_DIGITAL_IDENTITIES.push(newKeyEntry);

                    const user = MOCK_BACKEND_USERS.find(u => u.id === ownerId);
                    if (user) {
                        user.publicKeyIds.push(newKeyId);
                    } else {
                        console.warn(`[API] Owner ${ownerId} not found for key pair.`);
                    }

                    await addHashedAuditLogEntry({
                        timestamp: new Date().toISOString(),
                        action: 'Key Pair Generated',
                        user: ownerId,
                        details: `Generated new ${keyType} key pair for ${ownerId} (Key ID: ${newKeyId}).`,
                        ipAddress: '127.0.0.1', // Internal system generation
                        level: 'info'
                    });
                    resolve(newKeyEntry);
                }, 2000);
            });
        },
        fetchPublicKeysByOwner: async (ownerId: string): Promise<KeyStoreEntry[]> => {
            console.log(`[API] Fetching public keys for owner ${ownerId}...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(MOCK_BACKEND_DIGITAL_IDENTITIES.filter(k => k.ownerId === ownerId));
                }, 500);
            });
        },
        signData: async (keyId: string, data: string): Promise<string> => {
            console.log(`[API] Signing data with key ${keyId}...`);
            return new Promise((resolve, reject) => {
                setTimeout(async () => {
                    const keyEntry = MOCK_BACKEND_DIGITAL_IDENTITIES.find(k => k.id === keyId);
                    if (!keyEntry) {
                        const errorMsg = `Signing failed: Key ${keyId} not found.`;
                        await addHashedAuditLogEntry({
                            timestamp: new Date().toISOString(),
                            action: 'Data Signing Failed',
                            user: 'system/user', // Placeholder, real system would track caller
                            details: errorMsg,
                            ipAddress: 'N/A',
                            level: 'error'
                        });
                        return reject(new Error(errorMsg));
                    }
                    // In a real system, this would use the private key (decrypted) to create a cryptographic signature.
                    // Here, we simulate by hashing the data with a "private" component (encrypted key content).
                    const simulatedSignature = await generateHash(`${data}-${keyEntry.privateKeyEncrypted}`);
                    await addHashedAuditLogEntry({
                        timestamp: new Date().toISOString(),
                        action: 'Data Signed',
                        user: keyEntry.ownerId,
                        details: `Data signed using key ${keyId}.`,
                        ipAddress: 'N/A',
                        level: 'info'
                    });
                    resolve(simulatedSignature);
                }, 1500);
            });
        },
        verifySignature: async (keyId: string, data: string, signature: string): Promise<boolean> => {
            console.log(`[API] Verifying signature for key ${keyId}...`);
            return new Promise((resolve, reject) => {
                setTimeout(async () => {
                    const keyEntry = MOCK_BACKEND_DIGITAL_IDENTITIES.find(k => k.id === keyId);
                    if (!keyEntry) {
                        const errorMsg = `Verification failed: Key ${keyId} not found.`;
                        await addHashedAuditLogEntry({
                            timestamp: new Date().toISOString(),
                            action: 'Signature Verification Failed',
                            user: 'system',
                            details: errorMsg,
                            ipAddress: 'N/A',
                            level: 'error'
                        });
                        return reject(new Error(errorMsg));
                    }
                    // Simulate verification: re-hash with the "private" component and compare.
                    // A real verification would use the public key against the signature and original data.
                    const expectedSignature = await generateHash(`${data}-${keyEntry.privateKeyEncrypted}`); // Simplified mock logic
                    const isValid = expectedSignature === signature;
                    await addHashedAuditLogEntry({
                        timestamp: new Date().toISOString(),
                        action: 'Signature Verified',
                        user: 'system',
                        details: `Signature for key ${keyId} on data verified: ${isValid}.`,
                        ipAddress: 'N/A',
                        level: isValid ? 'info' : 'warning'
                    });
                    resolve(isValid);
                }, 1500);
            });
        },
    },

    /**
     * @description Simulates device management related backend calls.
     * Business value: Provides granular control over connected devices, allowing users to quickly
     * revoke access or lock devices in case of loss or theft, minimizing the attack surface and
     * securing user accounts from unauthorized physical or remote access.
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
                setTimeout(async () => {
                    MOCK_BACKEND_DEVICES = MOCK_BACKEND_DEVICES.map(d => d.id === deviceId ? { ...d, status: 'revoked' } : d);
                    await addHashedAuditLogEntry({
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
                setTimeout(async () => {
                    MOCK_BACKEND_DEVICES = MOCK_BACKEND_DEVICES.map(d => d.id === deviceId ? { ...d, status: 'locked' } : d);
                    await addHashedAuditLogEntry({
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
     * @description Simulates Role-Based Access Control (RBAC) management, defining roles, permissions,
     * and access policies for users and agents across the system.
     * Business value: Critical for enforcing granular security, ensuring that users and AI agents
     * only have access to resources and actions they are explicitly authorized for. This minimizes
     * the blast radius of any potential compromise, facilitates compliance with internal and external
     * policies, and supports complex multi-party interactions in a controlled manner.
     */
    rbac: {
        fetchRoles: async (): Promise<Role[]> => {
            console.log(`[API] Fetching all defined roles...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve([...MOCK_BACKEND_ROLES]);
                }, 500);
            });
        },
        createRole: async (name: string, description: string, permissions: string[]): Promise<Role> => {
            console.log(`[API] Creating new role: ${name}...`);
            return new Promise((resolve) => {
                setTimeout(async () => {
                    const newId = `role${MOCK_BACKEND_ROLES.length + 1}`;
                    const newRole: Role = { id: newId, name, description, permissions };
                    MOCK_BACKEND_ROLES.push(newRole);
                    await addHashedAuditLogEntry({
                        timestamp: new Date().toISOString(),
                        action: 'Role Created',
                        user: 'self', // Assuming an admin user
                        details: `New role '${name}' created with ID: ${newId}.`,
                        ipAddress: '192.168.1.1',
                        level: 'info'
                    });
                    resolve(newRole);
                }, 1000);
            });
        },
        assignRoleToUser: async (userId: string, roleId: string): Promise<void> => {
            console.log(`[API] Assigning role '${roleId}' to user '${userId}'...`);
            return new Promise((resolve, reject) => {
                setTimeout(async () => {
                    const user = MOCK_BACKEND_USERS.find(u => u.id === userId);
                    const role = MOCK_BACKEND_ROLES.find(r => r.id === roleId);
                    if (user && role) {
                        if (!user.roles.includes(roleId)) {
                            user.roles.push(roleId);
                        }
                        await addHashedAuditLogEntry({
                            timestamp: new Date().toISOString(),
                            action: 'Role Assigned',
                            user: 'self',
                            details: `Role '${roleId}' assigned to user '${userId}'.`,
                            ipAddress: '192.168.1.1',
                            level: 'info'
                        });
                        resolve();
                    } else {
                        const errorMsg = `Failed to assign role: User ${userId} or Role ${roleId} not found.`;
                        await addHashedAuditLogEntry({
                            timestamp: new Date().toISOString(),
                            action: 'Role Assignment Failed',
                            user: 'self',
                            details: errorMsg,
                            ipAddress: '192.168.1.1',
                            level: 'error'
                        });
                        reject(new Error(errorMsg));
                    }
                }, 1000);
            });
        },
        removeRoleFromUser: async (userId: string, roleId: string): Promise<void> => {
            console.log(`[API] Removing role '${roleId}' from user '${userId}'...`);
            return new Promise((resolve, reject) => {
                setTimeout(async () => {
                    const user = MOCK_BACKEND_USERS.find(u => u.id === userId);
                    if (user) {
                        user.roles = user.roles.filter(r => r !== roleId);
                        await addHashedAuditLogEntry({
                            timestamp: new Date().toISOString(),
                            action: 'Role Removed',
                            user: 'self',
                            details: `Role '${roleId}' removed from user '${userId}'.`,
                            ipAddress: '192.168.1.1',
                            level: 'warning'
                        });
                        resolve();
                    } else {
                        const errorMsg = `Failed to remove role: User ${userId} not found.`;
                        await addHashedAuditLogEntry({
                            timestamp: new Date().toISOString(),
                            action: 'Role Removal Failed',
                            user: 'self',
                            details: errorMsg,
                            ipAddress: '192.168.1.1',
                            level: 'error'
                        });
                        reject(new Error(errorMsg));
                    }
                }, 1000);
            });
        },
        fetchAccessControlPolicies: async (): Promise<AccessControlPolicy[]> => {
            console.log(`[API] Fetching all access control policies...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve([...MOCK_BACKEND_ACCESS_POLICIES]);
                }, 500);
            });
        },
        evaluateAccess: async (userId: string, resource: string, action: string): Promise<boolean> => {
            console.log(`[API] Evaluating access for user ${userId} on resource ${resource} with action ${action}...`);
            return new Promise((resolve) => {
                setTimeout(async () => {
                    const user = MOCK_BACKEND_USERS.find(u => u.id === userId);
                    if (!user) {
                        console.warn(`[RBAC] User ${userId} not found for access evaluation.`);
                        return resolve(false);
                    }

                    const userRoles = user.roles;
                    let hasAccess = false;

                    for (const policy of MOCK_BACKEND_ACCESS_POLICIES.filter(p => p.active)) {
                        const resourceMatch = policy.resource === '*' || policy.resource === resource;
                        const actionMatch = policy.action === '*' || policy.action === action;
                        const roleMatch = policy.requiredRoles.some(requiredRole => userRoles.includes(requiredRole));

                        if (resourceMatch && actionMatch && roleMatch) {
                            hasAccess = true;
                            break;
                        }
                    }
                    await addHashedAuditLogEntry({
                        timestamp: new Date().toISOString(),
                        action: 'Access Evaluation',
                        user: userId,
                        details: `User ${userId} attempted ${action} on ${resource}. Access granted: ${hasAccess}.`,
                        ipAddress: '127.0.0.1',
                        level: hasAccess ? 'info' : 'warning'
                    });
                    resolve(hasAccess);
                }, 750);
            });
        },
    },

    /**
     * @description Simulates data privacy and sharing related backend calls.
     * Business value: Ensures compliance with data protection regulations (e.g., GDPR, CCPA) by
     * providing robust tools for managing data sharing consents, enabling privacy-by-design,
     * and offering data portability features. This builds customer trust and mitigates regulatory fines.
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
                setTimeout(async () => {
                    MOCK_BACKEND_DATA_SHARING_POLICIES = MOCK_BACKEND_DATA_SHARING_POLICIES.map(p =>
                        p.id === policyId ? { ...p, active: active, lastUpdated: new Date().toISOString().slice(0, 10) } : p
                    );
                    await addHashedAuditLogEntry({
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
                setTimeout(async () => {
                    await addHashedAuditLogEntry({
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
                setTimeout(async () => {
                    MOCK_BACKEND_SETTINGS.anonymizeSpendingData = active;
                    await addHashedAuditLogEntry({
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
     * Business value: Provides a flexible and powerful mechanism for real-time fraud detection
     * and compliance, allowing institutions to define and enforce custom rules that flag or block
     * suspicious transactions, protecting both the platform and its users from financial losses.
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
                setTimeout(async () => {
                    const newId = `tr${MOCK_BACKEND_TRANSACTION_RULES.length + 1}`;
                    const newRule = { id: newId, ...rule, active: true };
                    MOCK_BACKEND_TRANSACTION_RULES.push(newRule);
                    await addHashedAuditLogEntry({
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
                setTimeout(async () => {
                    MOCK_BACKEND_TRANSACTION_RULES = MOCK_BACKEND_TRANSACTION_RULES.map(r => r.id === ruleId ? { ...r, active: active } : r);
                    await addHashedAuditLogEntry({
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
                setTimeout(async () => {
                    MOCK_BACKEND_TRANSACTION_RULES = MOCK_BACKEND_TRANSACTION_RULES.filter(r => r.id !== ruleId);
                    await addHashedAuditLogEntry({
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
     * @description Simulates threat intelligence and alert management backend calls,
     * including reporting and resolving security events.
     * Business value: Provides an early warning system for potential security breaches,
     * allowing for rapid identification and remediation of threats. This minimizes financial and
     * reputational damage by enabling proactive security responses and feeding critical data
     * into agentic AI systems for autonomous threat analysis.
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
                setTimeout(async () => {
                    MOCK_BACKEND_THREAT_ALERTS = MOCK_BACKEND_THREAT_ALERTS.map(a => a.id === alertId ? { ...a, status: 'resolved' } : a);
                    await addHashedAuditLogEntry({
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
        reportSecurityEvent: async (event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<SecurityEvent> => {
            console.log(`[API] Reporting new security event:`, event.type, event.severity);
            return new Promise((resolve) => {
                setTimeout(async () => {
                    const newId = `se${MOCK_BACKEND_SECURITY_EVENTS.length + 1}`;
                    const newEvent: SecurityEvent = {
                        id: newId,
                        timestamp: new Date().toISOString(),
                        ...event
                    };
                    MOCK_BACKEND_SECURITY_EVENTS.unshift(newEvent); // Add to the beginning
                    await addHashedAuditLogEntry({
                        timestamp: newEvent.timestamp,
                        action: `Security Event Reported: ${newEvent.type}`,
                        user: newEvent.userId || newEvent.agentId || 'system',
                        details: `Severity: ${newEvent.severity}, Source: ${newEvent.source}. Details: ${JSON.stringify(newEvent.details)}.`,
                        ipAddress: 'N/A', // Source IP may be in details
                        level: newEvent.severity
                    });
                    resolve(newEvent);
                }, 700);
            });
        },
        fetchRealtimeThreatFeed: async (): Promise<SecurityEvent[]> => {
            console.log(`[API] Fetching real-time threat feed...`);
            return new Promise((resolve) => {
                setTimeout(() => {
                    // In a real system, this would be a WebSocket or long-polling feed.
                    // Here, we return recent events.
                    resolve([...MOCK_BACKEND_SECURITY_EVENTS.slice(0, 10)]); // Return 10 most recent
                }, 500);
            });
        },
    },

    /**
     * @description Simulates audit log fetching and management, now with tamper-evident properties.
     * Business value: Provides an unimpeachable record of all critical system activities,
     * ensuring transparency, accountability, and compliance with stringent financial regulations.
     * The cryptographic chaining guarantees log integrity, making it invaluable for forensic analysis
     * and proving non-repudiation of transactions.
     */
    auditLogs: {
        fetchAuditLogs: async (filters?: { level?: 'info' | 'warning' | 'error' | 'critical' | 'all', keyword?: string }): Promise<HashedAuditLogEntry[]> => {
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
                setTimeout(async () => {
                    const data = format === 'json' ? JSON.stringify(MOCK_BACKEND_AUDIT_LOGS, null, 2) :
                        MOCK_BACKEND_AUDIT_LOGS.map(log => Object.values(log).join(',')).join('\n');
                    const mimeType = format === 'json' ? 'application/json' : 'text/csv';
                    const blob = new Blob([data], { type: mimeType });
                    await addHashedAuditLogEntry({
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
        verifyAuditLogIntegrity: async (): Promise<{ isValid: boolean; firstBrokenEntryId?: string }> => {
            console.log(`[API] Verifying audit log integrity...`);
            return new Promise((resolve) => {
                setTimeout(async () => {
                    if (MOCK_BACKEND_AUDIT_LOGS.length === 0) {
                        return resolve({ isValid: true });
                    }

                    for (let i = 0; i < MOCK_BACKEND_AUDIT_LOGS.length; i++) {
                        const currentEntry = MOCK_BACKEND_AUDIT_LOGS[i];
                        const previousEntry = (i + 1) < MOCK_BACKEND_AUDIT_LOGS.length ? MOCK_BACKEND_AUDIT_LOGS[i + 1] : null;

                        const expectedPreviousHash = previousEntry ? previousEntry.hash : '0';
                        if (currentEntry.previousHash !== expectedPreviousHash) {
                            await addHashedAuditLogEntry({
                                timestamp: new Date().toISOString(),
                                action: 'Audit Log Tamper Detected',
                                user: 'system',
                                details: `Log chain broken at entry ID: ${currentEntry.id}. Expected previous hash: ${expectedPreviousHash}, found: ${currentEntry.previousHash}.`,
                                ipAddress: 'N/A',
                                level: 'critical'
                            });
                            return resolve({ isValid: false, firstBrokenEntryId: currentEntry.id });
                        }

                        // Re-calculate hash for the current entry and compare
                        const entryDataForHash = JSON.stringify({
                            id: currentEntry.id,
                            timestamp: currentEntry.timestamp,
                            action: currentEntry.action,
                            user: currentEntry.user,
                            details: currentEntry.details,
                            ipAddress: currentEntry.ipAddress,
                            level: currentEntry.level,
                            previousHash: currentEntry.previousHash
                        });
                        const recalculatedHash = await generateHash(entryDataForHash);

                        if (recalculatedHash !== currentEntry.hash) {
                            await addHashedAuditLogEntry({
                                timestamp: new Date().toISOString(),
                                action: 'Audit Log Tamper Detected',
                                user: 'system',
                                details: `Log entry ${currentEntry.id} content altered. Recalculated hash differs.`,
                                ipAddress: 'N/A',
                                level: 'critical'
                            });
                            return resolve({ isValid: false, firstBrokenEntryId: currentEntry.id });
                        }
                    }
                    await addHashedAuditLogEntry({
                        timestamp: new Date().toISOString(),
                        action: 'Audit Log Integrity Check',
                        user: 'system',
                        details: 'All audit logs verified for integrity. No tampering detected.',
                        ipAddress: 'N/A',
                        level: 'info'
                    });
                    resolve({ isValid: true });
                }, 2000); // Simulate longer processing for integrity check
            });
        },
    },

    /**
     * @description Simulates emergency protocols and recovery features.
     * Business value: Provides critical fail-safe mechanisms for disaster recovery and extreme security incidents,
     * allowing administrators to quickly lockdown accounts or initiate pre-defined recovery workflows.
     * Features like Dead Man's Switch ensure continuity and secure asset transfer in unforeseen circumstances.
     */
    emergency: {
        activateEmergencyLock: async (): Promise<void> => {
            console.log(`[API] Activating emergency account lock...`);
            return new Promise((resolve) => {
                setTimeout(async () => {
                    // Simulate freezing transactions, logging out all sessions, etc.
                    await addHashedAuditLogEntry({
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
                setTimeout(async () => {
                    MOCK_BACKEND_SETTINGS.deadManSwitchInactivityPeriod = days;
                    await addHashedAuditLogEntry({
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
                setTimeout(async () => {
                    const newId = `tc${MOCK_BACKEND_TRUSTED_CONTACTS.length + 1}`;
                    const newBeneficiary = { id: newId, ...contact };
                    MOCK_BACKEND_TRUSTED_CONTACTS.push(newBeneficiary);
                    await addHashedAuditLogEntry({
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
                setTimeout(async () => {
                    MOCK_BACKEND_TRUSTED_CONTACTS = MOCK_BACKEND_TRUSTED_CONTACTS.filter(b => b.id !== contactId);
                    await addHashedAuditLogEntry({
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
     * @description Simulates API key management backend calls and related webhook configurations.
     * Business value: Enables secure and controlled programmatic access to the platform for third-party
     * integrations and internal services. Robust API key lifecycle management (creation, revocation, permissions)
     * minimizes external attack vectors, while webhook capabilities support real-time event notifications,
     * enhancing system interoperability and responsiveness.
     */
    keys: { // Renamed from 'apiKey' for broader scope to include all KeyStoreEntry types
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
                setTimeout(async () => {
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
                    await addHashedAuditLogEntry({
                        timestamp: new Date().toISOString(),
                        action: 'API Key Generated',
                        user: 'self',
                        details: `Generated new API key: "${keyData.name}". Prefix: ${newKeyPrefix}.`,
                        ipAddress: '192.168.1.1',
                        level: 'warning' // Considered warning level due to security implications of new key
                    });
                    resolve(newKey);
                }, 1500);
            });
        },
        revokeAPIKey: async (keyId: string): Promise<void> => {
            console.log(`[API] Revoking API key: ${keyId}...`);
            return new Promise((resolve) => {
                setTimeout(async () => {
                    MOCK_BACKEND_API_KEYS = MOCK_BACKEND_API_KEYS.map(key => key.id === keyId ? { ...key, status: 'revoked' } : key);
                    await addHashedAuditLogEntry({
                        timestamp: new Date().toISOString(),
                        action: 'API Key Revoked',
                        user: 'self',
                        details: `API key ${keyId} revoked.`,
                        ipAddress: '192.168.1.1',
                        level: 'error' // Important security event
                    });
                    resolve();
                }, 1000);
            });
        },
        manageWebhooks: async (action: 'fetch' | 'add' | 'remove', webhookData?: any): Promise<any> => {
            console.log(`[API] Managing webhooks: ${action}`, webhookData);
            return new Promise((resolve) => {
                setTimeout(async () => {
                    // Simulate webhook management logic
                    await addHashedAuditLogEntry({
                        timestamp: new Date().toISOString(),
                        action: `Webhook Management: ${action}`,
                        user: 'self',
                        details: `Webhook action ${action} simulated.`,
                        ipAddress: '192.168.1.1',
                        level: 'info'
                    });
                    resolve({ status: 'success', message: `Webhook action ${action} simulated.` });
                }, 1000);
            });
        }
    },

    /**
     * @description Simulates security awareness training backend calls.
     * Business value: Cultivates a security-conscious user base, significantly reducing the risk
     * of human-factor vulnerabilities like phishing or weak passwords. Investing in user education
     * is a cost-effective strategy to enhance overall security posture and protect against social engineering.
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
                setTimeout(async () => {
                    MOCK_BACKEND_SECURITY_AWARENESS_MODULES = MOCK_BACKEND_SECURITY_AWARENESS_MODULES.map(mod =>
                        mod.id === moduleId ? { ...mod, completionStatus: 'completed', lastAccessed: new Date().toISOString().slice(0, 10) } : mod
                    );
                    await addHashedAuditLogEntry({
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
     * @description Simulates advanced authentication backend calls, particularly FIDO2 security keys.
     * Business value: Implements strong, phishing-resistant multi-factor authentication, elevating
     * account security beyond traditional methods. FIDO2 adoption significantly reduces account
     * takeover risk, providing a premium security experience for users and meeting stringent
     * compliance requirements.
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
                setTimeout(async () => {
                    const newId = `key${MOCK_BACKEND_FIDO_KEYS.length + 1}`;
                    const newKey = { id: newId, name, added: new Date().toISOString().slice(0, 10) };
                    MOCK_BACKEND_FIDO_KEYS.push(newKey);
                    await addHashedAuditLogEntry({
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
                setTimeout(async () => {
                    MOCK_BACKEND_FIDO_KEYS = MOCK_BACKEND_FIDO_KEYS.filter(k => k.id !== keyId);
                    await addHashedAuditLogEntry({
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
     * Business value: Provides an aggregated view of the user's security health,
     * offering actionable insights and recommendations. This proactive guidance empowers users
     * to improve their security, reducing support costs and increasing overall system resilience
     * against emerging threats.
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
        updateSecurityPosture: async (score: number, recommendations: string[]): Promise<void> => {
            console.log(`[API] Updating security posture...`);
            return new Promise((resolve) => {
                setTimeout(async () => {
                    MOCK_BACKEND_SECURITY_SCORE = score;
                    MOCK_BACKEND_SECURITY_RECOMMENDATIONS = recommendations;
                    await addHashedAuditLogEntry({
                        timestamp: new Date().toISOString(),
                        action: 'Security Posture Updated',
                        user: 'system',
                        details: `Security score updated to ${score}.`,
                        ipAddress: 'N/A',
                        level: 'info'
                    });
                    resolve();
                }, 500);
            });
        },
    },
};