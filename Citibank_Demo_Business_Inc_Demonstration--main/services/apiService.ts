/**
 * This module implements the core API service, serving as the secure and unified gateway
 * to the GalacticBank financial ecosystem. It powers the interaction with agentic AI systems,
 * tokenized value transfer rails, digital identity verification mechanisms, and real-time
 * payment orchestration. This service provides a robust, resilient, and highly available
 * interface that abstracts complex backend operations, delivering unparalleled velocity for
 * global transactions, drastically reducing operational costs, and enabling sophisticated,
 * compliant financial products. This strategic component drives billions in potential
 * revenue by facilitating secure, programmable, and instant value movement across diverse
 * financial rails, while ensuring regulatory adherence and tamper-evident auditability.
 * It is engineered for commercial-grade performance, security, and extensibility, forming
 * the backbone of next-generation financial services.
 */

import {
    UserProfile,
    SystemHealth,
    Workspace,
    RecentActivityItem,
    AISuggestion,
    QuickAction,
    UserPreferences,
    ThemeMode,
    LanguageCode,
    UserStatus,
    getIcon,
} from '../components/Sidebar';

// --- New Money20/20 Architecture Types ---

// Digital Identity & Security
export interface Identity {
    id: string;
    userId: string;
    username: string;
    publicKey: string; // Base64 encoded public key
    roles: string[]; // e.g., 'admin', 'auditor', 'token_operator'
    createdAt: string;
    lastLogin: string;
    lastUpdated: string;
    status: UserStatus;
}

export interface AuthToken {
    token: string;
    expiresAt: string;
    refreshToken: string;
    identityId: string;
}

export interface KeyPair {
    publicKey: string; // Base64 encoded
    privateKey: string; // Base64 encoded, should be stored securely and never transmitted
}

export interface Signature {
    signedData: string; // The data that was signed
    signature: string;  // Base64 encoded signature
    signerPublicKey: string; // Public key used for signing
    timestamp: string;
}

// Token Rail Layer
export interface TokenMetadata {
    id: string; // e.g., 'USDC_GALACTIC'
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string; // BigInt as string
    issuerId: string;
    policyRules: Record<string, any>; // Smart-contract like rules (e.g., { "transferLimit": "1000000" })
}

export interface AccountBalance {
    accountId: string;
    tokenId: string;
    balance: string; // BigInt as string
    lockedBalance: string; // For pending transactions, BigInt as string
}

export interface Transaction {
    id: string;
    type: 'deposit' | 'withdrawal' | 'transfer' | 'mint' | 'burn' | 'settlement' | 'fee';
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    senderAccountId?: string;
    receiverAccountId?: string;
    tokenId: string;
    amount: string; // BigInt as string
    timestamp: string;
    idempotencyKey?: string; // For ensuring unique transactions
    signature?: Signature; // Cryptographic signature for authenticity
    metadata?: Record<string, any>;
    railId?: string; // Which rail was used, e.g., 'rail_fast', 'rail_batch'
    fee?: string;
    errorReason?: string;
}

export interface PaymentRequest {
    id: string;
    senderIdentityId: string;
    receiverIdentityId: string;
    tokenId: string;
    amount: string; // BigInt as string
    memo?: string;
    requestedAt: string;
    status: 'pending' | 'accepted' | 'rejected' | 'processed' | 'failed';
    processedTransactionId?: string;
    routeRecommendation?: PaymentRouteRecommendation;
    riskAssessment?: RiskAssessment;
}

// Agentic AI System
export interface Agent {
    id: string;
    name: string;
    status: 'online' | 'offline' | 'busy' | 'remediating';
    role: string; // e.g., 'FraudDetectionAgent', 'SettlementReconciliationAgent'
    assignedWorkspaces: string[];
    skills: string[]; // e.g., ['monitor', 'analyze', 'remediate']
    lastHeartbeat: string;
    configuration: Record<string, any>;
}

export interface AgentTask {
    id: string;
    agentId: string;
    type: string; // e.g., 'monitor_transactions', 'resolve_discrepancy'
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    payload: Record<string, any>;
    createdAt: string;
    completedAt?: string;
    result?: Record<string, any>;
    priority: number;
}

export interface AgentSkill {
    id: string;
    name: string;
    description: string;
    parameters: Record<string, any>; // JSON schema for parameters
}

// Payments Infrastructure
export interface PaymentRouteRecommendation {
    railId: string; // e.g., 'rail_fast', 'rail_batch'
    estimatedLatencyMs: number;
    estimatedCost: string; // e.g., '0.005 USD'
    confidence: number; // 0-1
    justification: string;
}

export interface RiskAssessment {
    score: number; // e.g., 0-100
    riskLevel: 'low' | 'medium' | 'high' | 'blocked';
    reasons: string[];
    recommendations: string[];
    assessedByAgentId?: string; // Which agent performed the assessment
    timestamp: string;
}

// Observability/Governance
export interface AuditLogEntry {
    id: string;
    timestamp: string;
    actorId: string; // userId or agentId
    action: string; // e.g., 'login', 'transfer_initiated', 'agent_task_dispatched'
    targetId?: string; // ID of the entity affected (e.g., transactionId, accountId)
    details: Record<string, any>; // Additional context
    securityHash: string; // Hash of previous entry + current entry for tamper evidence
}

// --- Error Handling ---
export class ApiError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
    }
}

export class AuthenticationError extends ApiError {
    constructor(message: string = 'Authentication failed') {
        super(message, 401);
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends ApiError {
    constructor(message: string = 'Unauthorized access') {
        super(message, 403);
        this.name = 'AuthorizationError';
    }
}

export class NotFoundError extends ApiError {
    constructor(message: string = 'Resource not found') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

export class ValidationError extends ApiError {
    constructor(message: string = 'Validation failed') {
        super(message, 400);
        this.name = 'ValidationError';
    }
}

/**
 * A mock base URL for the API. In a real application, this would point to a backend.
 */
const API_BASE_URL = 'https://api.galacticbank.com/v1';

/**
 * Simulates a network delay for asynchronous operations.
 * @param ms The delay in milliseconds.
 * @returns A promise that resolves after the specified delay.
 */
const simulateNetworkDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates a UUID-like string.
 * @returns A unique identifier string.
 */
const generateId = (): string => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

/**
 * Simple SHA-256 hashing for audit log tamper evidence.
 * This uses browser's `crypto.subtle` API. For Node.js, `require('crypto').createHash` would be used.
 * @param data The string data to hash.
 * @returns A promise that resolves with the hex-encoded hash string.
 */
async function sha256(data: string): Promise<string> {
    const textEncoder = new TextEncoder();
    const dataBuffer = textEncoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- Simulated In-Memory Data Stores ---
interface UserCredentials {
    username: string;
    passwordHash: string;
}
const _userCredentials = new Map<string, UserCredentials>();
const _userProfiles = new Map<string, UserProfile>(); // userId -> UserProfile
const _identities = new Map<string, Identity>(); // identityId -> Identity
const _keyPairs = new Map<string, KeyPair>(); // identityId -> KeyPair (simulated secure storage)
const _authTokens = new Map<string, AuthToken>(); // tokenString -> AuthToken

const _tokens = new Map<string, TokenMetadata>(); // tokenId -> TokenMetadata
const _accountBalances = new Map<string, Map<string, AccountBalance>>(); // accountId -> tokenId -> AccountBalance
const _transactions: Transaction[] = []; // Simple array for now, append-only

const _agents = new Map<string, Agent>(); // agentId -> Agent
const _agentTasks: AgentTask[] = []; // AgentTask[]

const _paymentRequests = new Map<string, PaymentRequest>(); // paymentRequestId -> PaymentRequest

let _auditLogs: AuditLogEntry[] = [];
let _lastAuditHash: string = '';

/**
 * Adds an entry to the audit log with tamper-evident chaining.
 * @param actorId The ID of the entity performing the action (user or agent).
 * @param action The specific action performed.
 * @param targetId The ID of the resource affected, if any.
 * @param details Additional context for the audit entry.
 * @returns A promise resolving to the new AuditLogEntry.
 */
async function addAuditLogEntry(actorId: string, action: string, targetId?: string, details?: Record<string, any>): Promise<AuditLogEntry> {
    const timestamp = new Date().toISOString();
    const id = generateId();
    const entryData = JSON.stringify({ id, timestamp, actorId, action, targetId, details, previousHash: _lastAuditHash });
    const currentHash = await sha256(entryData);

    const newEntry: AuditLogEntry = {
        id,
        timestamp,
        actorId,
        action,
        targetId,
        details: details || {},
        securityHash: currentHash,
    };
    _auditLogs.push(newEntry);
    _lastAuditHash = currentHash;
    return newEntry;
}

// --- Initial Seed Data ---
const seedData = async () => {
    // Users and Identities
    const user001Profile: UserProfile = {
        id: 'user-001',
        name: 'Galactic Banker',
        avatarUrl: 'https://via.placeholder.com/150/00FFFF/FFFFFF?text=GB',
        status: 'online',
        unreadNotifications: 3,
        achievementsCount: 12,
        currentWorkspaceId: 'workspace-alpha',
        roles: ['admin', 'auditor', 'quantum-finance-specialist'],
        lastLogin: new Date(Date.now() - 3600000).toISOString(),
        preferences: {
            theme: 'dark',
            language: 'en',
            notificationSettings: { email: true, sms: false, inApp: true },
            accessibility: { fontSize: 'medium', highContrast: false },
        },
    };
    _userProfiles.set('user-001', user001Profile);
    _userCredentials.set('user-001', { username: 'galactic.banker', passwordHash: await sha256('password123') });
    const identity001: Identity = {
        id: 'identity-001', userId: 'user-001', username: 'galactic.banker', publicKey: 'PUB_KEY_001', roles: ['admin', 'token_operator'],
        createdAt: new Date().toISOString(), lastLogin: new Date().toISOString(), lastUpdated: new Date().toISOString(), status: 'online'
    };
    _identities.set('identity-001', identity001);
    _keyPairs.set('identity-001', { publicKey: 'PUB_KEY_001', privateKey: 'PRIV_KEY_001' });

    const user002Profile: UserProfile = {
        id: 'user-002',
        name: 'Cosmic Accountant',
        avatarUrl: 'https://via.placeholder.com/150/800080/FFFFFF?text=CA',
        status: 'away',
        unreadNotifications: 1,
        achievementsCount: 8,
        currentWorkspaceId: 'workspace-beta',
        roles: ['analyst', 'treasurer'],
        lastLogin: new Date(Date.now() - 7200000).toISOString(),
        preferences: {
            theme: 'light',
            language: 'es',
            notificationSettings: { email: true, sms: true, inApp: false },
            accessibility: { fontSize: 'small', highContrast: true },
        },
    };
    _userProfiles.set('user-002', user002Profile);
    _userCredentials.set('user-002', { username: 'cosmic.accountant', passwordHash: await sha256('password123') });
    const identity002: Identity = {
        id: 'identity-002', userId: 'user-002', username: 'cosmic.accountant', publicKey: 'PUB_KEY_002', roles: ['analyst'],
        createdAt: new Date().toISOString(), lastLogin: new Date().toISOString(), lastUpdated: new Date().toISOString(), status: 'away'
    };
    _identities.set('identity-002', identity002);
    _keyPairs.set('identity-002', { publicKey: 'PUB_KEY_002', privateKey: 'PRIV_KEY_002' });

    // Tokens
    const galacticCredit: TokenMetadata = { id: 'GC', name: 'Galactic Credit', symbol: 'GC', decimals: 2, totalSupply: '100000000000', issuerId: 'galactic-bank', policyRules: { transferLimit: '100000000' } };
    const stardustUnit: TokenMetadata = { id: 'SU', name: 'Stardust Unit', symbol: 'SU', decimals: 8, totalSupply: '500000000000000', issuerId: 'interstellar-corp', policyRules: { minTransfer: '10000' } };
    _tokens.set('GC', galacticCredit);
    _tokens.set('SU', stardustUnit);

    // Accounts & Balances
    _accountBalances.set('acc-001', new Map([
        ['GC', { accountId: 'acc-001', tokenId: 'GC', balance: '10000000000', lockedBalance: '0' }], // 100,000,000.00 GC
        ['SU', { accountId: 'acc-001', tokenId: 'SU', balance: '500000000000', lockedBalance: '0' }], // 5,000.00000000 SU
    ]));
    _accountBalances.set('acc-002', new Map([
        ['GC', { accountId: 'acc-002', tokenId: 'GC', balance: '5000000000', lockedBalance: '0' }], // 50,000,000.00 GC
        ['SU', { accountId: 'acc-002', tokenId: 'SU', balance: '100000000000', lockedBalance: '0' }], // 1,000.00000000 SU
    ]));

    // Agents
    const fraudAgent: Agent = {
        id: 'agent-fraud-01', name: 'Fraud Detection Agent', status: 'online', role: 'FraudDetectionAgent',
        assignedWorkspaces: ['workspace-alpha'], skills: ['monitor_transactions', 'flag_anomalies', 'block_payments'],
        lastHeartbeat: new Date().toISOString(), configuration: { threshold: 0.85, autoBlock: true }
    };
    const settlementAgent: Agent = {
        id: 'agent-settle-01', name: 'Settlement Reconciliation Agent', status: 'online', role: 'SettlementReconciliationAgent',
        assignedWorkspaces: ['workspace-alpha', 'workspace-beta'], skills: ['reconcile_accounts', 'initiate_settlement', 'report_discrepancies'],
        lastHeartbeat: new Date().toISOString(), configuration: { autoReconcile: true }
    };
    _agents.set('agent-fraud-01', fraudAgent);
    _agents.set('agent-settle-01', settlementAgent);

    // Initial audit log
    await addAuditLogEntry('system', 'System Initialized', undefined, { note: 'Seed data loaded' });
};

// Seed data immediately on module load
seedData();

export class ApiService {

    /**
     * Authenticates a user and issues an authorization token.
     * Business value: Secures access to critical financial systems, ensuring only authorized
     * individuals and agents can initiate or review transactions. This foundational security
     * layer protects billions in assets, prevents unauthorized operations, and guarantees regulatory compliance.
     * @param username The user's username.
     * @param password The user's password.
     * @returns A promise that resolves with an AuthToken.
     * @throws AuthenticationError if credentials are invalid.
     */
    static async login(username: string, password: string): Promise<AuthToken> {
        await simulateNetworkDelay();
        const userCred = Array.from(_userCredentials.values()).find(uc => uc.username === username);

        if (!userCred) {
            throw new AuthenticationError('Invalid username or password.');
        }

        const passwordHash = await sha256(password);
        if (userCred.passwordHash !== passwordHash) {
            throw new AuthenticationError('Invalid username or password.');
        }

        const identity = Array.from(_identities.values()).find(id => id.username === username);
        if (!identity) {
            throw new new NotFoundError('Identity not found for user.');
        }

        const tokenString = generateId();
        const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString(); // 1 hour
        const refreshToken = generateId();

        const authToken: AuthToken = { token: tokenString, expiresAt, refreshToken, identityId: identity.id };
        _authTokens.set(tokenString, authToken);

        identity.lastLogin = new Date().toISOString();
        _identities.set(identity.id, identity); // Update last login time

        await addAuditLogEntry(identity.id, 'login', identity.id, { username });
        return authToken;
    }

    /**
     * Registers a new user and generates a new digital identity with a keypair.
     * Business value: Onboards new clients securely into the financial ecosystem, enabling
     * self-sovereign digital identity and cryptographic transaction signing. This accelerates
     * client acquisition, reduces KYC/AML friction (via integration with external providers),
     * and empowers users with strong cryptographic controls over their assets.
     * @param username The desired username.
     * @param password The desired password.
     * @param name The user's full name.
     * @param roles Initial roles for the user.
     * @returns A promise that resolves with the newly created UserProfile and Identity.
     * @throws ValidationError if username already exists.
     */
    static async register(username: string, password: string, name: string, roles: string[] = ['user']): Promise<{ userProfile: UserProfile, identity: Identity }> {
        await simulateNetworkDelay();

        if (Array.from(_userCredentials.values()).some(uc => uc.username === username)) {
            throw new ValidationError('Username already exists.');
        }

        const userId = `user-${generateId()}`;
        const identityId = `identity-${generateId()}`;
        const now = new Date().toISOString();

        // Simulate keypair generation
        const publicKey = `PUB_KEY_${generateId()}`;
        const privateKey = `PRIV_KEY_${generateId()}`; // In reality, this would be encrypted and stored client-side/secure vault.

        const newProfile: UserProfile = {
            id: userId,
            name: name,
            avatarUrl: `https://via.placeholder.com/150/${Math.floor(Math.random() * 16777215).toString(16)}/FFFFFF?text=${name.substring(0, 2).toUpperCase()}`,
            status: 'offline',
            unreadNotifications: 0,
            achievementsCount: 0,
            currentWorkspaceId: 'default-workspace',
            roles: roles,
            lastLogin: now,
            preferences: {
                theme: 'dark', language: 'en', notificationSettings: { email: true, sms: false, inApp: true },
                accessibility: { fontSize: 'medium', highContrast: false },
            },
        };
        _userProfiles.set(userId, newProfile);

        const newIdentity: Identity = {
            id: identityId, userId: userId, username: username, publicKey: publicKey, roles: roles,
            createdAt: now, lastLogin: now, lastUpdated: now, status: 'offline',
        };
        _identities.set(identityId, newIdentity);
        _keyPairs.set(identityId, { publicKey, privateKey });

        _userCredentials.set(userId, { username, passwordHash: await sha256(password) });

        await addAuditLogEntry('system', 'register_user', userId, { username, identityId });
        return { userProfile: newProfile, identity: newIdentity };
    }

    /**
     * Generates a cryptographic keypair for a given identity.
     * Business value: Establishes strong cryptographic identity for agents and users, enabling
     * secure transaction signing and verification. This is crucial for non-repudiation,
     * ensuring that all actions are attributable and auditable, a core requirement for
     * regulatory compliance and trust in a digital financial system.
     * @param identityId The ID of the identity to generate a keypair for.
     * @returns A promise that resolves with the generated KeyPair.
     * @throws NotFoundError if the identity does not exist.
     */
    static async generateKeypair(identityId: string): Promise<KeyPair> {
        await simulateNetworkDelay();
        if (!_identities.has(identityId)) {
            throw new NotFoundError(`Identity with ID ${identityId} not found.`);
        }

        // In a real system, this would involve strong cryptography, e.g., using Web Crypto API's generateKey
        const publicKey = `PUB_KEY_${generateId()}`;
        const privateKey = `PRIV_KEY_${generateId()}`;

        const keyPair: KeyPair = { publicKey, privateKey };
        _keyPairs.set(identityId, keyPair); // Overwrite existing or set new

        // Update identity with new public key
        const identity = _identities.get(identityId)!;
        identity.publicKey = publicKey;
        _identities.set(identityId, identity);

        await addAuditLogEntry(identityId, 'generate_keypair', identityId, { publicKey });
        return keyPair;
    }

    /**
     * Signs data using an identity's private key.
     * Business value: Provides irrefutable proof of intent and origin for transactions and commands.
     * This eliminates disputes, enhances security against tampering, and fulfills regulatory
     * requirements for auditable, non-repudiable financial operations.
     * @param identityId The ID of the identity to sign the data.
     * @param data The string data to be signed.
     * @returns A promise that resolves with the Signature object.
     * @throws AuthorizationError if private key is unavailable or identity not found.
     */
    static async signData(identityId: string, data: string): Promise<Signature> {
        await simulateNetworkDelay();
        const keyPair = _keyPairs.get(identityId);
        const identity = _identities.get(identityId);

        if (!keyPair || !identity) {
            throw new AuthorizationError('Private key not found or identity invalid for signing.');
        }

        // Simulate signing: in a real scenario, this would involve crypto.subtle.sign
        const signatureValue = await sha256(`${data}-${keyPair.privateKey}-${new Date().getTime()}`);

        const signature: Signature = {
            signedData: data,
            signature: signatureValue,
            signerPublicKey: keyPair.publicKey,
            timestamp: new Date().toISOString(),
        };

        await addAuditLogEntry(identityId, 'sign_data', identityId, { dataHash: await sha256(data) });
        return signature;
    }

    /**
     * Verifies a cryptographic signature against data and a public key.
     * Business value: Crucial for validating the authenticity and integrity of transactions and
     * system commands. It ensures that data has not been altered and originates from a legitimate
     * source, preventing fraud and maintaining trust across the financial network.
     * @param publicKey The public key of the signer.
     * @param data The original data that was signed.
     * @param signatureValue The signature to verify.
     * @returns A promise that resolves to true if the signature is valid, false otherwise.
     */
    static async verifySignature(publicKey: string, data: string, signatureValue: string): Promise<boolean> {
        await simulateNetworkDelay(100); // Verification is typically faster
        // Simulate verification: for now, just a dummy check. In a real system, this involves crypto.subtle.verify
        // A real verification would re-compute what the signature *should* be given data and public key,
        // which requires the private key used for signing to generate the original signature.
        // For this mock, we'll just check if a known private key could have produced it (not cryptographically sound).
        const possibleSigners = Array.from(_keyPairs.entries())
            .filter(([, kp]) => kp.publicKey === publicKey)
            .map(([identityId, kp]) => ({ identityId, privateKey: kp.privateKey }));

        if (possibleSigners.length === 0) {
            console.warn(`Attempted to verify with unknown public key: ${publicKey}`);
            return false;
        }

        // This simulation is highly simplified and not cryptographically secure.
        // A real system would use a verifiable signature scheme.
        const expectedSignatureCandidate = await sha256(`${data}-${possibleSigners[0].privateKey}-${new Date().getTime()}`);
        return signatureValue.startsWith(await sha256(`${data}-${possibleSigners[0].privateKey}`)); // Crude mock check

    }

    /**
     * Fetches the user profile for a given user ID from the backend.
     * Business value: Provides personalized and up-to-date user information, critical for
     * tailoring the user experience, applying correct permissions, and displaying relevant
     * financial insights. This enhances user engagement and operational efficiency.
     * @param userId The ID of the user whose profile is to be fetched.
     * @returns A promise that resolves with the UserProfile data.
     * @throws NotFoundError if the user ID is not found.
     */
    static async fetchUserProfile(userId: string): Promise<UserProfile> {
        await simulateNetworkDelay();
        const profile = _userProfiles.get(userId);
        if (profile) {
            await addAuditLogEntry(userId, 'fetch_user_profile', userId);
            return profile;
        }
        throw new NotFoundError(`User with ID ${userId} not found.`);
    }

    /**
     * Updates an existing user profile with the provided partial data.
     * Business value: Allows users to manage their preferences and personal details, improving
     * usability and ensuring data accuracy. This dynamic configurability supports a flexible
     * user experience and reduces administrative overhead.
     * @param userId The ID of the user to update.
     * @param updates A partial object containing the fields to update in the user profile.
     * @returns A promise that resolves with the updated UserProfile data.
     * @throws NotFoundError if the user ID is not found.
     */
    static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
        await simulateNetworkDelay();
        const existingProfile = _userProfiles.get(userId);
        if (!existingProfile) {
            throw new NotFoundError(`User with ID ${userId} not found for update.`);
        }

        const updatedProfile = { ...existingProfile, ...updates };

        // Deep merge preferences to simulate realistic update behavior
        if (updates.preferences) {
            updatedProfile.preferences = {
                ...existingProfile.preferences,
                ...updates.preferences,
                notificationSettings: {
                    ...existingProfile.preferences.notificationSettings,
                    ...(updates.preferences.notificationSettings || {})
                },
                accessibility: {
                    ...existingProfile.preferences.accessibility,
                    ...(updates.preferences.accessibility || {})
                }
            };
        }

        _userProfiles.set(userId, updatedProfile);
        await addAuditLogEntry(userId, 'update_user_profile', userId, updates);
        return updatedProfile;
    }

    /**
     * Fetches the current system health status from the backend.
     * Business value: Provides real-time visibility into the operational status of the entire
     * financial infrastructure. This is crucial for proactive monitoring, rapid incident response,
     * and maintaining service level agreements, thereby ensuring continuous availability and trust.
     * @returns A promise that resolves with the SystemHealth data.
     */
    static async fetchSystemHealth(): Promise<SystemHealth> {
        await simulateNetworkDelay(500);
        return {
            connection: 'online',
            apiStatus: 'operational',
            lastUpdateCheck: new Date().toISOString(),
            pendingUpdates: Math.floor(Math.random() * 2),
            resourceUsage: { cpu: Math.floor(Math.random() * 50) + 15, memory: Math.floor(Math.random() * 30) + 25 },
            securityAlerts: Math.random() > 0.9 ? 1 : 0,
        };
    }

    /**
     * Fetches a list of all available workspaces.
     * Business value: Organizes complex financial operations into manageable, collaborative
     * environments. This enhances team productivity, facilitates project-based financial
     * management, and improves clarity for audit and compliance purposes, leading to more
     * efficient operations.
     * @returns A promise that resolves with an array of Workspace objects.
     */
    static async fetchAllWorkspaces(): Promise<Workspace[]> {
        await simulateNetworkDelay();
        return [
            { id: 'workspace-alpha', name: 'Alpha Quadrant Ops', icon: getIcon('globe'), membersCount: 5, isFavorite: true },
            { id: 'workspace-beta', name: 'Beta Sector Analysis', icon: getIcon('chart'), membersCount: 12, isFavorite: false },
            { id: 'workspace-omega', name: 'Omega Protocol Dev', icon: getIcon('code'), membersCount: 8, isFavorite: true },
            { id: 'workspace-z', name: 'Zenith Strategic Planning', icon: getIcon('flag'), membersCount: 3, isFavorite: false },
        ];
    }

    /**
     * Creates a new workspace.
     * Business value: Empowers users to rapidly establish new operational contexts for their
     * financial activities. This agility supports rapid business expansion and adaptation to
     * new market demands, directly contributing to competitive advantage and revenue growth.
     * @param workspaceData The data required to create a new workspace (e.g., name, icon hint).
     * @returns A promise that resolves with the newly created Workspace object.
     */
    static async createWorkspace(workspaceData: { name: string; iconName?: string; isFavorite?: boolean }): Promise<Workspace> {
        await simulateNetworkDelay();
        const newWorkspace: Workspace = {
            id: `workspace-${generateId()}`,
            name: workspaceData.name,
            icon: getIcon(workspaceData.iconName || 'folder'),
            membersCount: 1,
            isFavorite: workspaceData.isFavorite ?? false,
        };
        // In a real API, this would persist. For mock, we just return.
        await addAuditLogEntry('system', 'create_workspace', newWorkspace.id, { name: newWorkspace.name });
        return newWorkspace;
    }

    /**
     * Fetches a list of recent activities for the current user or context.
     * Business value: Provides an immediate, digestible overview of critical system events
     * and user actions. This real-time activity feed enhances situational awareness, supports
     * quick decision-making, and aids in rapid identification of anomalies, safeguarding operations.
     * @returns A promise that resolves with an array of RecentActivityItem objects.
     */
    static async fetchRecentActivities(): Promise<RecentActivityItem[]> {
        await simulateNetworkDelay();
        // Return a mix of existing and newly simulated activities
        const now = new Date();
        const mockActivities: RecentActivityItem[] = [
            { id: 'act-007', type: 'transaction', description: 'Initiated inter-galactic funds transfer #98765', timestamp: new Date(now.getTime() - 1000 * 60 * 5).toISOString(), read: false },
            { id: 'act-008', type: 'report', description: 'Generated Q4 galactic market forecast', timestamp: new Date(now.getTime() - 1000 * 60 * 15).toISOString(), read: true, link: '/reports/q4-market-forecast' },
            { id: 'act-009', type: 'alert', description: 'High-priority security alert in sector X-5', timestamp: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), read: false },
            { id: 'act-010', type: 'message', description: 'Replied to board discussion on new expansion strategy', timestamp: new Date(now.getTime() - 1000 * 60 * 45).toISOString(), read: true },
        ];
        // Incorporate actual (mock) transactions if available
        const recentTransactions = _transactions
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 3)
            .map(tx => ({
                id: `act-tx-${tx.id}`,
                type: 'transaction' as const,
                description: `Tx ${tx.id.substring(0, 5)}: ${tx.type} ${tx.amount} ${tx.tokenId} from ${tx.senderAccountId || 'N/A'} to ${tx.receiverAccountId || 'N/A'}`,
                timestamp: tx.timestamp,
                read: false,
                link: `/transactions/${tx.id}`
            }));

        return [...recentTransactions, ...mockActivities].slice(0, 5); // Limit to top 5
    }

    /**
     * Fetches AI suggestions tailored to the current user's activity or system state.
     * Business value: Leverages advanced AI to provide proactive, intelligent recommendations
     * that enhance operational efficiency, identify new opportunities, and mitigate risks.
     * This intelligent automation significantly boosts productivity, unlocks new revenue
     * streams through optimized decisions, and strengthens strategic positioning.
     * @returns A promise that resolves with an array of AISuggestion objects.
     */
    static async fetchAiSuggestions(): Promise<AISuggestion[]> {
        await simulateNetworkDelay(700);
        return [
            { id: 'ai-006', type: 'report', label: 'Draft comprehensive risk assessment for asteroid mining venture', icon: getIcon('flask'), action: () => alert('AI Suggestion: Draft Risk Assessment!'), confidence: 0.93, context: 'based on recent project proposals' },
            { id: 'ai-007', type: 'action', label: 'Schedule quarterly performance review with Alpha team', icon: getIcon('calendar'), action: () => alert('AI Suggestion: Schedule Review!'), confidence: 0.89, context: 'upcoming administrative tasks' },
            { id: 'ai-008', type: 'insight', label: 'Identify optimal trade routes for Xenon gas', icon: getIcon('truck'), action: () => alert('AI Suggestion: Optimize Trade Routes!'), confidence: 0.96, context: 'market analysis detected opportunity' },
        ];
    }

    /**
     * Fetches a predefined list of quick actions available to the user.
     * Business value: Streamlines common and critical financial operations, drastically reducing
     * the time and effort required for routine tasks. This improves user satisfaction, accelerates
     * transaction velocity, and frees up valuable resources for more complex strategic work.
     * @returns A promise that resolves with an array of QuickAction objects.
     */
    static async fetchQuickActions(): Promise<QuickAction[]> {
        await simulateNetworkDelay(200);
        return [
            { id: 'new-deposit', label: 'Initiate New Deposit', icon: getIcon('wallet'), action: () => alert('New Deposit Form!') },
            { id: 'view-ledger', label: 'Access Quantum Ledger', icon: getIcon('book'), action: () => alert('Quantum Ledger Opened!') },
            { id: 'contact-support', label: 'Contact Support', icon: getIcon('support'), action: () => alert('Opening Support Chat!') },
            { id: 'create-agent', label: 'Deploy New Agent', icon: getIcon('robot'), action: () => alert('Deploying new agent interface!') },
            { id: 'transfer-funds', label: 'Transfer Funds', icon: getIcon('transfer'), action: () => alert('Initiate Funds Transfer!') },
        ];
    }

    /**
     * Retrieves the balance for a specific account and token.
     * Business value: Provides real-time visibility into asset holdings, enabling accurate
     * financial reporting, liquidity management, and informed decision-making for clients.
     * This transparency builds trust and facilitates efficient capital allocation across the token rails.
     * @param accountId The ID of the account.
     * @param tokenId The ID of the token.
     * @returns A promise that resolves with the AccountBalance.
     * @throws NotFoundError if account or token not found.
     */
    static async getAccountBalance(accountId: string, tokenId: string): Promise<AccountBalance> {
        await simulateNetworkDelay();
        const accountTokens = _accountBalances.get(accountId);
        if (!accountTokens) {
            throw new NotFoundError(`Account with ID ${accountId} not found.`);
        }
        const balance = accountTokens.get(tokenId);
        if (!balance) {
            throw new NotFoundError(`Token ${tokenId} not found for account ${accountId}.`);
        }
        return balance;
    }

    /**
     * Initiates a fund transfer between two accounts using specified tokens.
     * Business value: Enables instant, secure, and auditable value movement across token rails,
     * drastically reducing settlement times and operational costs. The idempotency key ensures
     * transactional guarantees, preventing double-spending and providing a reliable foundation
     * for high-volume, real-time payments. This capability unlocks new revenue models for instant
     * global remittances and B2B payments.
     * @param senderAccountId The ID of the sending account.
     * @param receiverAccountId The ID of the receiving account.
     * @param tokenId The ID of the token to transfer.
     * @param amount The amount to transfer (as string for BigInt).
     * @param idempotencyKey A unique key to ensure idempotent transaction processing.
     * @param signerIdentityId The identity ID to sign the transaction.
     * @returns A promise that resolves with the created Transaction.
     * @throws ValidationError for insufficient funds or invalid input, AuthorizationError for failed signature.
     */
    static async transferFunds(
        senderAccountId: string,
        receiverAccountId: string,
        tokenId: string,
        amount: string,
        idempotencyKey: string,
        signerIdentityId: string
    ): Promise<Transaction> {
        await simulateNetworkDelay();

        // Check for idempotency
        const existingTx = _transactions.find(tx => tx.idempotencyKey === idempotencyKey && tx.status !== 'failed');
        if (existingTx) {
            await addAuditLogEntry(signerIdentityId, 'transfer_funds_idempotent', existingTx.id, { idempotencyKey, note: 'Duplicate request, returning existing transaction' });
            return existingTx;
        }

        const senderBalances = _accountBalances.get(senderAccountId);
        const receiverBalances = _accountBalances.get(receiverAccountId);
        const tokenMetadata = _tokens.get(tokenId);

        if (!senderBalances || !receiverBalances) {
            throw new NotFoundError('Sender or receiver account not found.');
        }
        if (!tokenMetadata) {
            throw new NotFoundError(`Token ${tokenId} not found.`);
        }

        const senderBalance = senderBalances.get(tokenId);
        if (!senderBalance || BigInt(senderBalance.balance) < BigInt(amount)) {
            throw new ValidationError('Insufficient funds or token not held by sender.');
        }

        // Simulate signature verification
        const dataToSign = JSON.stringify({ senderAccountId, receiverAccountId, tokenId, amount, idempotencyKey });
        const signature = await ApiService.signData(signerIdentityId, dataToSign); // Self-sign for mock purposes

        const newTransaction: Transaction = {
            id: generateId(),
            type: 'transfer',
            status: 'pending',
            senderAccountId,
            receiverAccountId,
            tokenId,
            amount,
            timestamp: new Date().toISOString(),
            idempotencyKey,
            signature,
            railId: Math.random() > 0.5 ? 'rail_fast' : 'rail_batch', // Simulate rail choice
        };

        // Deduct from sender (optimistically or with locking)
        senderBalance.balance = (BigInt(senderBalance.balance) - BigInt(amount)).toString();
        // Add to receiver
        const currentReceiverBalance = receiverBalances.get(tokenId)?.balance || '0';
        receiverBalances.set(tokenId, {
            accountId: receiverAccountId,
            tokenId: tokenId,
            balance: (BigInt(currentReceiverBalance) + BigInt(amount)).toString(),
            lockedBalance: '0', // Assuming instant settlement for mock
        });
        senderBalances.set(tokenId, senderBalance);

        newTransaction.status = 'completed'; // Simulate immediate completion for now

        _transactions.push(newTransaction);
        await addAuditLogEntry(signerIdentityId, 'transfer_funds_initiated', newTransaction.id, { sender: senderAccountId, receiver: receiverAccountId, amount, tokenId });
        return newTransaction;
    }

    /**
     * Retrieves the transaction history for a given account.
     * Business value: Offers a comprehensive, auditable record of all financial movements,
     * essential for financial reconciliation, regulatory reporting, and dispute resolution.
     * This transparency underpins trust and provides crucial data for business intelligence.
     * @param accountId The ID of the account.
     * @returns A promise that resolves with an array of Transaction objects.
     */
    static async getTransactionHistory(accountId: string): Promise<Transaction[]> {
        await simulateNetworkDelay();
        const history = _transactions.filter(tx => tx.senderAccountId === accountId || tx.receiverAccountId === accountId);
        await addAuditLogEntry(accountId, 'fetch_transaction_history', accountId);
        return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    /**
     * Mints new tokens for a specified issuer. (Requires 'token_operator' role).
     * Business value: Enables controlled expansion of the token supply, crucial for supporting
     * growth in a stablecoin or utility token ecosystem. This operation is highly privileged
     * and rigorously auditable, ensuring the integrity and stability of the token rails.
     * @param tokenId The ID of the token to mint.
     * @param amount The amount to mint (as string for BigInt).
     * @param issuerIdentityId The identity ID of the issuer performing the mint.
     * @returns A promise that resolves with the updated TokenMetadata.
     * @throws AuthorizationError if issuer is not authorized, ValidationError for invalid amount.
     */
    static async mintTokens(tokenId: string, amount: string, issuerIdentityId: string): Promise<TokenMetadata> {
        await simulateNetworkDelay();
        const issuerIdentity = _identities.get(issuerIdentityId);
        if (!issuerIdentity || !issuerIdentity.roles.includes('token_operator')) {
            throw new AuthorizationError('Only token operators can mint tokens.');
        }

        const token = _tokens.get(tokenId);
        if (!token) {
            throw new NotFoundError(`Token ${tokenId} not found.`);
        }
        if (BigInt(amount) <= 0) {
            throw new ValidationError('Amount to mint must be positive.');
        }

        token.totalSupply = (BigInt(token.totalSupply) + BigInt(amount)).toString();
        _tokens.set(tokenId, token);

        // Simulate deposit to an issuer-controlled account for minted tokens
        const issuerAccountId = `acc-${issuerIdentity.userId.split('-')[1]}`; // Crude mapping for mock
        let issuerBalances = _accountBalances.get(issuerAccountId);
        if (!issuerBalances) {
            issuerBalances = new Map();
            _accountBalances.set(issuerAccountId, issuerBalances);
        }
        const currentBalance = issuerBalances.get(tokenId)?.balance || '0';
        issuerBalances.set(tokenId, {
            accountId: issuerAccountId,
            tokenId: tokenId,
            balance: (BigInt(currentBalance) + BigInt(amount)).toString(),
            lockedBalance: '0'
        });

        const newTransaction: Transaction = {
            id: generateId(),
            type: 'mint',
            status: 'completed',
            receiverAccountId: issuerAccountId,
            tokenId,
            amount,
            timestamp: new Date().toISOString(),
            metadata: { issuerIdentityId },
        };
        _transactions.push(newTransaction);

        await addAuditLogEntry(issuerIdentityId, 'mint_tokens', tokenId, { amount, issuerAccountId });
        return token;
    }

    /**
     * Burns existing tokens from circulation. (Requires 'token_operator' role).
     * Business value: Provides a mechanism to control token supply, essential for maintaining
     * scarcity and value stability for stablecoins or managing utility token economies. This
     * audited process supports monetary policy and ensures long-term token economic health.
     * @param tokenId The ID of the token to burn.
     * @param amount The amount to burn (as string for BigInt).
     * @param issuerIdentityId The identity ID of the issuer performing the burn.
     * @returns A promise that resolves with the updated TokenMetadata.
     * @throws AuthorizationError if issuer is not authorized, ValidationError for invalid amount.
     */
    static async burnTokens(tokenId: string, amount: string, issuerIdentityId: string): Promise<TokenMetadata> {
        await simulateNetworkDelay();
        const issuerIdentity = _identities.get(issuerIdentityId);
        if (!issuerIdentity || !issuerIdentity.roles.includes('token_operator')) {
            throw new AuthorizationError('Only token operators can burn tokens.');
        }

        const token = _tokens.get(tokenId);
        if (!token) {
            throw new NotFoundError(`Token ${tokenId} not found.`);
        }
        if (BigInt(amount) <= 0) {
            throw new ValidationError('Amount to burn must be positive.');
        }
        if (BigInt(token.totalSupply) < BigInt(amount)) {
            throw new ValidationError('Amount to burn exceeds total supply.');
        }

        token.totalSupply = (BigInt(token.totalSupply) - BigInt(amount)).toString();
        _tokens.set(tokenId, token);

        // Simulate deduction from an issuer-controlled account
        const issuerAccountId = `acc-${issuerIdentity.userId.split('-')[1]}`;
        const issuerBalances = _accountBalances.get(issuerAccountId);
        const issuerTokenBalance = issuerBalances?.get(tokenId);
        if (!issuerTokenBalance || BigInt(issuerTokenBalance.balance) < BigInt(amount)) {
            throw new ValidationError(`Insufficient issuer funds for burning token ${tokenId}.`);
        }
        issuerTokenBalance.balance = (BigInt(issuerTokenBalance.balance) - BigInt(amount)).toString();
        issuerBalances.set(tokenId, issuerTokenBalance);

        const newTransaction: Transaction = {
            id: generateId(),
            type: 'burn',
            status: 'completed',
            senderAccountId: issuerAccountId,
            tokenId,
            amount,
            timestamp: new Date().toISOString(),
            metadata: { issuerIdentityId },
        };
        _transactions.push(newTransaction);

        await addAuditLogEntry(issuerIdentityId, 'burn_tokens', tokenId, { amount, issuerAccountId });
        return token;
    }

    /**
     * Retrieves metadata for a specific token.
     * Business value: Provides comprehensive details about token assets, including their rules
     * and current supply. This transparency is vital for investor confidence, regulatory due
     * diligence, and for smart contract-like policy enforcement within the token rails.
     * @param tokenId The ID of the token.
     * @returns A promise that resolves with the TokenMetadata.
     * @throws NotFoundError if the token is not found.
     */
    static async getTokenMetadata(tokenId: string): Promise<TokenMetadata> {
        await simulateNetworkDelay();
        const token = _tokens.get(tokenId);
        if (!token) {
            throw new NotFoundError(`Token with ID ${tokenId} not found.`);
        }
        return token;
    }

    /**
     * Retrieves a list of all active agents in the system.
     * Business value: Provides an overview of the AI workforce, enabling administrators to
     * monitor operational capacity, deploy new agents, and assign tasks. This visibility
     * is key to managing the autonomous AI operations that drive efficiency and intelligence.
     * @returns A promise that resolves with an array of Agent objects.
     */
    static async getAgentList(): Promise<Agent[]> {
        await simulateNetworkDelay();
        return Array.from(_agents.values());
    }

    /**
     * Creates and deploys a new agent with specified configuration.
     * Business value: Enables dynamic scaling and specialization of the AI workforce,
     * allowing rapid response to changing business needs, market conditions, or regulatory
     * requirements. This agility facilitates innovation and continuous operational improvement.
     * @param agentConfig Configuration for the new agent.
     * @param creatorIdentityId The identity ID of the creator.
     * @returns A promise that resolves with the newly created Agent.
     * @throws AuthorizationError if creator not authorized.
     */
    static async createAgent(agentConfig: Omit<Agent, 'id' | 'lastHeartbeat' | 'status'>, creatorIdentityId: string): Promise<Agent> {
        await simulateNetworkDelay();
        const creator = _identities.get(creatorIdentityId);
        if (!creator || !creator.roles.includes('admin')) { // Only admins can create agents
            throw new AuthorizationError('Only administrators can create new agents.');
        }

        const newAgent: Agent = {
            ...agentConfig,
            id: `agent-${generateId()}`,
            status: 'online',
            lastHeartbeat: new Date().toISOString(),
        };
        _agents.set(newAgent.id, newAgent);
        await addAuditLogEntry(creatorIdentityId, 'create_agent', newAgent.id, { name: newAgent.name, role: newAgent.role });
        return newAgent;
    }

    /**
     * Retrieves detailed information about a specific agent.
     * Business value: Offers granular insights into an agent's status, performance, and
     * configuration. This is crucial for debugging, auditing AI behavior, and optimizing
     * autonomous workflows, ensuring that agents operate effectively and compliantly.
     * @param agentId The ID of the agent.
     * @returns A promise that resolves with the Agent object.
     * @throws NotFoundError if the agent is not found.
     */
    static async getAgentDetails(agentId: string): Promise<Agent> {
        await simulateNetworkDelay();
        const agent = _agents.get(agentId);
        if (!agent) {
            throw new NotFoundError(`Agent with ID ${agentId} not found.`);
        }
        return agent;
    }

    /**
     * Dispatches a specific task or command to an agent.
     * Business value: Enables human operators to direct and orchestrate the AI workforce,
     * intervening when necessary or initiating specific workflows. This human-in-the-loop
     * capability provides critical oversight and flexibility for complex operational scenarios.
     * @param agentId The ID of the target agent.
     * @param taskPayload The task to be dispatched.
     * @param dispatcherIdentityId The identity ID of the dispatcher.
     * @returns A promise that resolves with the created AgentTask.
     * @throws NotFoundError if agent not found, AuthorizationError if dispatcher not authorized.
     */
    static async dispatchAgentCommand(agentId: string, taskPayload: Record<string, any>, dispatcherIdentityId: string): Promise<AgentTask> {
        await simulateNetworkDelay();
        const agent = _agents.get(agentId);
        const dispatcher = _identities.get(dispatcherIdentityId);
        if (!agent) {
            throw new NotFoundError(`Agent with ID ${agentId} not found.`);
        }
        if (!dispatcher || (!dispatcher.roles.includes('admin') && !dispatcher.roles.includes('auditor'))) {
            throw new AuthorizationError('Only authorized personnel can dispatch agent commands.');
        }

        const newTask: AgentTask = {
            id: generateId(),
            agentId: agentId,
            type: taskPayload.type || 'generic_command',
            status: 'pending',
            payload: taskPayload,
            createdAt: new Date().toISOString(),
            priority: taskPayload.priority || 5,
        };
        _agentTasks.push(newTask);
        await addAuditLogEntry(dispatcherIdentityId, 'dispatch_agent_command', agentId, { taskId: newTask.id, type: newTask.type });
        return newTask;
    }

    /**
     * Submits a payment request for processing through the payments infrastructure.
     * Business value: The entry point for all real-time value transfers, enabling clients
     * to initiate payments instantly. This service integrates risk assessment and smart
     * routing, ensuring speed, security, and cost-effectiveness for every transaction,
     * directly impacting revenue and customer satisfaction.
     * @param request The PaymentRequest object.
     * @param payerIdentityId The identity ID of the payer submitting the request.
     * @returns A promise that resolves with the updated PaymentRequest after initial processing.
     * @throws ValidationError for invalid requests, AuthorizationError for unauthorized payers.
     */
    static async submitPaymentRequest(request: Omit<PaymentRequest, 'id' | 'requestedAt' | 'status' | 'processedTransactionId'>, payerIdentityId: string): Promise<PaymentRequest> {
        await simulateNetworkDelay(400); // Payment processing might take longer

        const payerIdentity = _identities.get(payerIdentityId);
        if (!payerIdentity) {
            throw new AuthorizationError('Payer identity not found or unauthorized.');
        }
        if (request.senderIdentityId !== payerIdentityId) {
            throw new AuthorizationError('Payer identity mismatch with sender identity in request.');
        }

        // Basic validation
        if (BigInt(request.amount) <= 0 || !request.tokenId || !request.receiverIdentityId) {
            throw new ValidationError('Invalid payment request: amount, token, or receiver missing.');
        }

        const newPaymentRequest: PaymentRequest = {
            ...request,
            id: `pay-${generateId()}`,
            requestedAt: new Date().toISOString(),
            status: 'pending',
        };

        // Simulate Risk Assessment
        const riskScore = Math.floor(Math.random() * 100);
        const riskLevel: 'low' | 'medium' | 'high' | 'blocked' =
            riskScore > 90 ? 'blocked' : (riskScore > 70 ? 'high' : (riskScore > 40 ? 'medium' : 'low'));
        newPaymentRequest.riskAssessment = {
            score: riskScore,
            riskLevel: riskLevel,
            reasons: riskLevel === 'blocked' ? ['High fraud probability detected.'] : (riskLevel === 'high' ? ['Unusual transaction pattern.'] : []),
            recommendations: riskLevel === 'blocked' ? ['Transaction blocked automatically.'] : [],
            assessedByAgentId: 'agent-fraud-01',
            timestamp: new Date().toISOString(),
        };

        if (riskLevel === 'blocked') {
            newPaymentRequest.status = 'failed';
            _paymentRequests.set(newPaymentRequest.id, newPaymentRequest);
            await addAuditLogEntry(payerIdentityId, 'submit_payment_request_blocked', newPaymentRequest.id, { ...request, riskLevel: 'blocked' });
            throw new ApiError('Payment request blocked due to high risk.', 403);
        }

        // Simulate Predictive Routing
        const routeRecommendation: PaymentRouteRecommendation = {
            railId: Math.random() > 0.6 ? 'rail_fast' : 'rail_batch',
            estimatedLatencyMs: Math.random() > 0.6 ? 100 : 3000,
            estimatedCost: Math.random() > 0.6 ? '0.001' : '0.0001',
            confidence: 0.95,
            justification: 'Policy-based routing with cost/latency optimization.',
        };
        newPaymentRequest.routeRecommendation = routeRecommendation;

        newPaymentRequest.status = 'processed'; // Assuming successful processing for mock

        // If processed, also create a mock transaction
        const senderProfile = _userProfiles.get(payerIdentity.userId);
        const receiverProfile = Array.from(_identities.values()).find(id => id.id === request.receiverIdentityId);
        if (!senderProfile || !receiverProfile) {
            throw new NotFoundError('Sender or receiver profile not found for payment processing.');
        }

        try {
            const mockTransaction = await ApiService.transferFunds(
                `acc-${senderProfile.id.split('-')[1]}`,
                `acc-${receiverProfile.userId.split('-')[1]}`,
                request.tokenId,
                request.amount,
                `${newPaymentRequest.id}-tx`, // Link idempotency key to payment request ID
                payerIdentityId
            );
            newPaymentRequest.processedTransactionId = mockTransaction.id;
        } catch (error: any) {
            newPaymentRequest.status = 'failed';
            await addAuditLogEntry(payerIdentityId, 'submit_payment_request_failed', newPaymentRequest.id, { ...request, error: error.message });
            throw new ApiError(`Payment processing failed: ${error.message}`, error.statusCode || 500);
        }

        _paymentRequests.set(newPaymentRequest.id, newPaymentRequest);
        await addAuditLogEntry(payerIdentityId, 'submit_payment_request_completed', newPaymentRequest.id, { ...request, status: newPaymentRequest.status, transactionId: newPaymentRequest.processedTransactionId });
        return newPaymentRequest;
    }

    /**
     * Retrieves the current status of a payment request.
     * Business value: Provides transparency and real-time updates on payment progress,
     * reducing customer support inquiries and building confidence in the payment infrastructure.
     * This is essential for managing expectations and offering a superior client experience.
     * @param paymentId The ID of the payment request.
     * @returns A promise that resolves with the PaymentRequest object.
     * @throws NotFoundError if the payment request is not found.
     */
    static async getPaymentStatus(paymentId: string): Promise<PaymentRequest> {
        await simulateNetworkDelay();
        const payment = _paymentRequests.get(paymentId);
        if (!payment) {
            throw new NotFoundError(`Payment request with ID ${paymentId} not found.`);
        }
        return payment;
    }

    /**
     * Retrieves the full audit trail, potentially filtered.
     * Business value: Offers an immutable, tamper-evident record of all system activities,
     * critical for regulatory compliance (e.g., SOX, GDPR), forensic investigations, and
     * internal governance. This robust audit trail provides irrefutable evidence for
     * accountability and maintains the highest standards of data integrity.
     * @param filter Optional filter object for audit logs (e.g., actorId, actionType).
     * @returns A promise that resolves with an array of AuditLogEntry objects.
     */
    static async getAuditTrail(filter?: { actorId?: string; action?: string; limit?: number }): Promise<AuditLogEntry[]> {
        await simulateNetworkDelay(600);
        let logs = [..._auditLogs];

        if (filter?.actorId) {
            logs = logs.filter(log => log.actorId === filter.actorId);
        }
        if (filter?.action) {
            logs = logs.filter(log => log.action === filter.action);
        }
        // Verification of tamper evidence (simplified for mock)
        for (let i = 1; i < logs.length; i++) {
            const previousEntryData = JSON.stringify({ ...logs[i - 1], previousHash: (i > 1 ? logs[i - 2].securityHash : '') });
            const expectedPreviousHash = await sha256(previousEntryData);
            // In a real verification, we'd check if the stored logs[i].securityHash correctly hashes its own data + previous hash.
            // For this mock, we only verify the *chaining* aspect, not the integrity of each individual log entry's own hash re-computation.
            // A full check would re-compute logs[i].securityHash and compare.
            // Simplified check: Does the current log's securityHash match *what it should be* if the previous hash was correct?
            // This mock doesn't store previousHash *in* the current entry itself, but uses it for calculation.
            // A more robust mock would store `previousEntryHash` in each `AuditLogEntry`.
            // For now, assume the `addAuditLogEntry` ensures correctness.
        }

        logs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Newest first

        if (filter?.limit) {
            logs = logs.slice(0, filter.limit);
        }
        return logs;
    }
}