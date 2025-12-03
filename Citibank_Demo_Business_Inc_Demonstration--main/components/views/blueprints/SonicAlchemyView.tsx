```typescript
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";
import { v4 as uuidv4 } from 'uuid'; // For cryptographically secure unique IDs

/**
 * This module defines the core data models, simulation services, and UI components for the Sonic Alchemy platform.
 * Business impact: Provides the foundational structure for programmable value, digital identity,
 * and intelligent automation within a high-performance, real-time financial ecosystem,
 * enabling rapid development and deployment of digital financial products.
 * It generates long-term business value by acting as the blueprint for scalable, secure, and auditable
 * digital asset creation and management, forming the backbone for future financial innovation.
 */

// Define comprehensive interfaces for the application's data models

export interface AgentAction {
    id: string;
    agentId: string;
    actionType: 'observe' | 'decide' | 'communicate' | 'remediate' | 'enforce';
    targetId?: string; // e.g., Composition ID, Transaction ID
    payload: Record<string, any>;
    timestamp: string;
    signature: string; // Cryptographic signature of the action
    status: 'pending' | 'completed' | 'failed' | 'reverted';
    traceId?: string; // For linking actions in an orchestration
}

export interface AgentMessage {
    id: string;
    senderId: string;
    receiverId: string;
    topic: string; // e.g., 'system.event', 'transaction.status', 'policy.violation'
    payload: Record<string, any>;
    timestamp: string;
    signature: string; // Cryptographic signature of the message
    isEncrypted: boolean;
}

export interface DigitalIdentity {
    id: string; // User ID, Agent ID, Service ID
    type: 'user' | 'agent' | 'service';
    publicKey: string; // Public key for cryptographic operations
    privateKeyEncrypted?: string; // Encrypted private key (stored securely)
    roles: string[]; // e.g., 'admin', 'composer', 'auditor', 'agent.monitoring'
    verificationLevel: 'L1' | 'L2' | 'L3'; // Levels of identity verification
    lastAuthAt: string;
    status: 'active' | 'suspended' | 'deactivated';
    accessLog: string[]; // Hash-linked log of access events
}

export interface TokenMetadata {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: number;
    ownerId: string; // DigitalIdentity ID of the token owner
    issuanceDate: string;
    policyHash: string; // Hash of the governing policy for this token
}

export interface TokenBalance {
    accountId: string; // User ID or Agent ID
    tokenId: string; // Unique ID for the token type
    amount: number;
}

export interface LedgerEntry {
    id: string;
    transactionId: string; // Links to a Transaction record
    accountId: string; // Source/Destination account
    tokenId: string;
    amount: number; // Positive for credit, negative for debit
    timestamp: string;
    entryType: 'debit' | 'credit' | 'fee';
    balanceBefore: number;
    balanceAfter: number;
    hash: string; // Hash of the entry data
    prevHash: string; // Hash of the previous entry for chaining
}

export interface Transaction {
    id: string;
    type: 'transfer' | 'mint' | 'burn' | 'settlement' | 'fee';
    initiatorId: string; // DigitalIdentity ID of the entity initiating
    sourceAccountId?: string;
    destinationAccountId?: string;
    tokenId: string;
    amount: number;
    timestamp: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'reverted';
    signature: string; // Cryptographic signature of the transaction
    metadata?: Record<string, any>; // Additional programmable data
    ledgerEntryIds: string[]; // List of linked ledger entries
    routingPath?: string[]; // E.g., ['fast_rail', 'secure_rail']
    policyViolations?: string[];
    riskScore?: number;
}

export interface ProgrammableRail {
    id: string;
    name: string;
    latencyMs: number;
    costPerTx: number; // e.g., in USD cents
    securityLevel: 'low' | 'medium' | 'high' | 'cryptographic';
    throughputTxPerSec: number;
    isActive: boolean;
    policies: string[]; // List of policy IDs applicable to this rail
}

export interface SettlementPolicy {
    id: string;
    name: string;
    description: string;
    rules: {
        condition: string; // e.g., "transaction.amount > 1000"
        action: string; // e.g., "require_L3_identity", "route_to_secure_rail"
    }[];
    isActive: boolean;
}

export interface Alert {
    id: string;
    type: 'security' | 'performance' | 'compliance' | 'operational';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: string;
    source: string; // e.g., 'Agent.Monitoring', 'SettlementEngine'
    isResolved: boolean;
    resolvedBy?: string; // Agent ID or User ID
    relatedTransactionId?: string;
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    entityId: string; // User/Agent/Service ID
    eventType: string; // 'login', 'transaction.init', 'policy.update', 'agent.action'
    details: Record<string, any>;
    hash: string; // Hash of this entry
    prevHash: string; // Hash of previous entry for immutability
    signature: string; // Signature of the entity generating the log
}

export interface UserProfile {
    id: string;
    username: string;
    email: string;
    avatarUrl: string;
    bio: string;
    memberSince: string;
    preferredGenre: string;
    preferredInstruments: string[];
    allowPublicGenerations: boolean;
    storageUsedGB: number;
    maxStorageGB: number;
    subscriptionLevel: 'Free' | 'Pro' | 'Enterprise';
    lastLogin: string;
    digitalIdentityId: string; // Link to DigitalIdentity
}

export interface Composition {
    id: string;
    userId: string;
    title: string;
    description: string;
    instrumentation: string[];
    genre: string;
    mood: string;
    tempo: number; // BPM
    keySignature: string; // e.g., "C Major", "A Minor"
    durationSeconds: number; // Simulated duration
    audioUrl: string; // Simulated audio URL (local path or external URL)
    waveformJson: string; // Simulated waveform data (JSON string for peaks)
    midiData?: string; // Simulated MIDI data (Base64 or URL)
    createdAt: string;
    lastModifiedAt: string;
    isPublic: boolean;
    tags: string[];
    versionHistory: CompositionVersion[];
    remixSourceId?: string; // If this composition is a remix of another
    likes: number;
    comments: Comment[];
    playCount: number;
    downloadCount: number;
    modelUsed: string; // Which AI model generated this
    originalPrompt: string; // The exact prompt used for generation
    generationParameters: GenerationParameters; // Detailed parameters used
}

export interface CompositionVersion {
    versionId: string;
    promptUsed: string;
    parameters: GenerationParameters;
    generatedAt: string;
    audioUrl: string; // Specific audio for this version
    midiUrl?: string;
    notes?: string; // e.g., "Adjusted tempo, added reverb"
}

export interface Comment {
    id: string;
    userId: string;
    username: string;
    text: string;
    createdAt: string;
    avatarUrl: string;
}

export interface GenerationParameters {
    genre: string;
    mood: string;
    tempoRange: [number, number]; // min, max BPM
    instrumentationPreference: string[];
    durationPreference: [number, number]; // min, max seconds
    keySignaturePreference: string;
    creativityTemperature: number; // 0.1 to 1.0, higher means more adventurous
    diversityPenalty: number; // 0.0 to 2.0, higher means less repetitive
    model: string;
    outputFormat: 'audio' | 'midi' | 'description'; // New: control output type
    styleReferenceId?: string; // ID of a composition to use as a style reference
}

export interface Project {
    id: string;
    userId: string;
    name: string;
    description: string;
    compositionIds: string[];
    createdAt: string;
    lastModifiedAt: string;
    isShared: boolean; // Can this project be shared?
    sharedWithUserIds?: string[];
}

export interface AppSettings {
    theme: 'dark' | 'light';
    defaultGenre: string;
    defaultInstrumentation: string[];
    autoSave: boolean;
    notificationsEnabled: boolean;
    audioQuality: 'low' | 'medium' | 'high';
    defaultOutputFormat: 'audio' | 'midi' | 'description';
    onboardingComplete: boolean;
    defaultCurrencyTokenId: string; // For programmable finance integration
}

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning' | 'new_like' | 'new_comment' | 'system' | 'update_available' | 'transaction_alert' | 'agent_action';
    message: string;
    timestamp: string;
    isRead: boolean;
    link?: string;
    icon?: string; // e.g., SVG path or emoji
}

export interface PlaybackState {
    currentCompositionId: string | null;
    isPlaying: boolean;
    currentTime: number; // in seconds
    duration: number; // in seconds
    volume: number; // 0.0 to 1.0
    isMuted: boolean;
    loop: boolean;
    shuffle: boolean;
    playbackSpeed: number; // 0.5x, 1x, 1.5x, 2x
    reverbAmount: number; // Simulated effect
    delayAmount: number; // Simulated effect
}

export interface UserStats {
    totalCompositions: number;
    publicCompositions: number;
    totalPlaybacks: number;
    totalLikesReceived: number;
    last7DaysGenerations: number[]; // Array of daily counts
    mostUsedGenre: string;
    mostUsedInstrument: string;
    totalTokensOwned: number; // Financial metric
    totalTransactions: number; // Financial metric
}

/**
 * Provides globally unique identifiers for entities.
 * Business impact: Essential for auditability, traceability, and cryptographic integrity across the platform,
 * ensuring every data point can be uniquely referenced and tracked within the financial ecosystem.
 */
export const generateUniqueId = (): string => uuidv4();
/**
 * Formats a given number of seconds into a human-readable "MM:SS" string.
 * Business impact: Enhances user experience and data clarity for time-based metrics,
 * supporting efficient content management and reporting.
 */
export const formatDuration = (seconds: number): string => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};
/**
 * Asynchronously delays execution for a specified number of milliseconds.
 * Business impact: Facilitates the simulation of asynchronous network operations and backend processing,
 * crucial for developing and testing real-time financial services without live dependencies.
 */
export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
/**
 * Capitalizes the first letter of a given string.
 * Business impact: Ensures consistent and professional presentation of textual data across the platform,
 * supporting high-quality user interfaces and reports.
 */
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);


// --- CORE SYSTEM SIMULATORS ---

/**
 * Simulates a cryptographic key pair generation.
 * Business impact: Underpins the Digital Identity and Trust Layer, providing the foundation for secure
 * authentication, authorization, and cryptographic integrity across all financial transactions and agent actions.
 */
export const simulateGenerateKeyPair = (): { publicKey: string; privateKey: string } => {
    // In a real system, this would use a robust crypto library like WebCrypto API
    const privateKey = `privkey-${generateUniqueId()}`;
    const publicKey = `pubkey-${generateUniqueId()}`;
    return { publicKey, privateKey };
};

/**
 * Simulates cryptographic signing of data.
 * Business impact: Ensures non-repudiation and integrity for all critical operations,
 * from financial transactions to agent instructions, maintaining a verifiable audit trail.
 */
export const simulateSignData = (data: string, privateKey: string): string => {
    // A simplified HMAC-like signature for simulation
    return `SIG-${btoa(data)}-${privateKey.substring(0, 8)}`;
};

/**
 * Simulates cryptographic verification of a signature.
 * Business impact: Verifies the authenticity and integrity of all signed instructions and transactions,
 * preventing tampering and unauthorized actions, critical for security and compliance.
 */
export const simulateVerifySignature = (data: string, signature: string, publicKey: string): boolean => {
    // In a real system, this would be actual cryptographic verification
    const expectedSignaturePrefix = `SIG-${btoa(data)}`;
    return signature.startsWith(expectedSignaturePrefix) && signature.includes(publicKey.substring(0, 8));
};

let currentAuditLog: AuditLogEntry[] = [];
let lastAuditHash = 'genesis_hash';

/**
 * Simulates an immutable, hash-linked audit log.
 * Business impact: Provides tamper-evident traceability for every event, transaction, and agent action,
 * fulfilling stringent regulatory compliance requirements and enabling forensic analysis for dispute resolution.
 */
export const addAuditLogEntry = (entityId: string, eventType: string, details: Record<string, any>, privateKey: string): AuditLogEntry => {
    const timestamp = new Date().toISOString();
    const dataToHash = JSON.stringify({ timestamp, entityId, eventType, details, prevHash: lastAuditHash });
    const currentHash = btoa(dataToHash); // Simple base64 hash for simulation
    const signature = simulateSignData(currentHash, privateKey);

    const newEntry: AuditLogEntry = {
        id: generateUniqueId(),
        timestamp,
        entityId,
        eventType,
        details,
        hash: currentHash,
        prevHash: lastAuditHash,
        signature,
    };
    currentAuditLog.push(newEntry);
    lastAuditHash = currentHash;
    return newEntry;
};

/**
 * Simulates the retrieval of the audit log.
 * Business impact: Enables real-time and historical review of all system activities,
 * vital for operational transparency, regulatory reporting, and forensic investigations.
 */
export const getAuditLog = () => [...currentAuditLog]; // Return a copy


/**
 * @class DigitalIdentityService
 * @description Manages digital identities, key pairs, authentication, and authorization.
 * Business impact: This service is the bedrock of security and compliance, ensuring every user, agent,
 * and service operates with verifiable identity and appropriate permissions. It prevents unauthorized access,
 * reduces fraud, and enables robust auditability, creating a trusted environment for financial transactions.
 */
export class DigitalIdentityService {
    private identities: Map<string, DigitalIdentity> = new Map();
    private encryptedPrivateKeys: Map<string, string> = new Map(); // Simulates secure storage

    /**
     * Initializes a new DigitalIdentityService instance.
     */
    constructor() {
        // Seed with a mock user identity
        const { publicKey, privateKey } = simulateGenerateKeyPair();
        const mockUserIdentity: DigitalIdentity = {
            id: MOCK_USER.id,
            type: 'user',
            publicKey: publicKey,
            privateKeyEncrypted: btoa(privateKey), // Simulate encryption
            roles: ['composer', 'investor', 'admin'],
            verificationLevel: 'L3',
            lastAuthAt: new Date().toISOString(),
            status: 'active',
            accessLog: [],
        };
        this.identities.set(MOCK_USER.id, mockUserIdentity);
        this.encryptedPrivateKeys.set(MOCK_USER.id, btoa(privateKey)); // Store encrypted private key
        addAuditLogEntry('system', 'identity.created', { id: MOCK_USER.id, type: 'user' }, 'system_key'); // Placeholder for system key

        // Seed with a mock agent identity
        const { publicKey: agentPubKey, privateKey: agentPrivKey } = simulateGenerateKeyPair();
        const mockAgentIdentity: DigitalIdentity = {
            id: 'agent-monitoring-001',
            type: 'agent',
            publicKey: agentPubKey,
            privateKeyEncrypted: btoa(agentPrivKey),
            roles: ['agent.monitoring', 'agent.remediation'],
            verificationLevel: 'L3',
            lastAuthAt: new Date().toISOString(),
            status: 'active',
            accessLog: [],
        };
        this.identities.set(mockAgentIdentity.id, mockAgentIdentity);
        this.encryptedPrivateKeys.set(mockAgentIdentity.id, btoa(agentPrivKey));
        addAuditLogEntry('system', 'identity.created', { id: mockAgentIdentity.id, type: 'agent' }, 'system_key');

        // Seed with a mock orchestrator identity
        const { publicKey: orchPubKey, privateKey: orchPrivKey } = simulateGenerateKeyPair();
        const mockOrchestratorIdentity: DigitalIdentity = {
            id: 'agent-orchestrator-001',
            type: 'agent',
            publicKey: orchPubKey,
            privateKeyEncrypted: btoa(orchPrivKey),
            roles: ['agent.orchestration', 'admin'],
            verificationLevel: 'L3',
            lastAuthAt: new Date().toISOString(),
            status: 'active',
            accessLog: [],
        };
        this.identities.set(mockOrchestratorIdentity.id, mockOrchestratorIdentity);
        this.encryptedPrivateKeys.set(mockOrchestratorIdentity.id, btoa(orchPrivKey));
        addAuditLogEntry('system', 'identity.created', { id: mockOrchestratorIdentity.id, type: 'agent' }, 'system_key');
    }

    /**
     * Registers a new digital identity for a user, agent, or service.
     * @param id Unique identifier for the entity.
     * @param type Type of the entity ('user' | 'agent' | 'service').
     * @param roles Array of roles assigned to the entity.
     * @param verificationLevel Level of identity verification.
     * @returns The newly created DigitalIdentity.
     */
    public registerIdentity(id: string, type: DigitalIdentity['type'], roles: string[], verificationLevel: DigitalIdentity['verificationLevel']): DigitalIdentity {
        if (this.identities.has(id)) {
            throw new Error(`Identity with ID ${id} already exists.`);
        }
        const { publicKey, privateKey } = simulateGenerateKeyPair();
        const newIdentity: DigitalIdentity = {
            id,
            type,
            publicKey,
            privateKeyEncrypted: btoa(privateKey), // Simulate encryption
            roles,
            verificationLevel,
            lastAuthAt: new Date().toISOString(),
            status: 'active',
            accessLog: [],
        };
        this.identities.set(id, newIdentity);
        this.encryptedPrivateKeys.set(id, btoa(privateKey));
        addAuditLogEntry('system', 'identity.registered', { id, type, roles, verificationLevel }, this.getPrivateKey('agent-orchestrator-001'));
        return newIdentity;
    }

    /**
     * Retrieves a digital identity by its ID.
     * @param id The ID of the identity to retrieve.
     * @returns The DigitalIdentity object or undefined if not found.
     */
    public getIdentity(id: string): DigitalIdentity | undefined {
        return this.identities.get(id);
    }

    /**
     * Simulates retrieving the (decrypted) private key for an identity.
     * @param id The ID of the identity.
     * @returns The private key string.
     * @throws Error if identity or key not found, or if decryption fails.
     */
    public getPrivateKey(id: string): string {
        const encryptedKey = this.encryptedPrivateKeys.get(id);
        if (!encryptedKey) {
            throw new Error(`Private key not found for identity ${id}.`);
        }
        // Simulate decryption: just decode from base64
        return atob(encryptedKey);
    }

    /**
     * Authenticates an entity by verifying a signed message.
     * Business impact: Crucial for securing all API endpoints and internal communications,
     * verifying the sender's identity before processing any request or instruction.
     * @param entityId The ID of the entity attempting to authenticate.
     * @param message The original message that was signed.
     * @param signature The cryptographic signature of the message.
     * @returns True if authentication is successful, false otherwise.
     */
    public authenticate(entityId: string, message: string, signature: string): boolean {
        const identity = this.getIdentity(entityId);
        if (!identity || identity.status !== 'active') {
            addAuditLogEntry('system', 'auth.failed', { entityId, reason: 'Identity not found or inactive' }, this.getPrivateKey('agent-orchestrator-001'));
            return false;
        }
        const isAuthenticated = simulateVerifySignature(message, signature, identity.publicKey);
        if (isAuthenticated) {
            identity.lastAuthAt = new Date().toISOString();
            identity.accessLog.push(addAuditLogEntry(entityId, 'auth.success', { messageHash: btoa(message) }, this.getPrivateKey(entityId)).id);
        } else {
            identity.accessLog.push(addAuditLogEntry(entityId, 'auth.failed', { messageHash: btoa(message) }, this.getPrivateKey(entityId)).id);
        }
        return isAuthenticated;
    }

    /**
     * Authorizes an action for an entity based on its roles and verification level.
     * Business impact: Enforces granular access control policies across the entire platform,
     * preventing unauthorized operations and protecting sensitive data and financial assets.
     * @param entityId The ID of the entity requesting authorization.
     * @param requiredRoles Array of roles required for the action.
     * @param minVerificationLevel Minimum verification level required.
     * @returns True if authorized, false otherwise.
     */
    public authorize(entityId: string, requiredRoles: string[] = [], minVerificationLevel: DigitalIdentity['verificationLevel'] = 'L1'): boolean {
        const identity = this.getIdentity(entityId);
        if (!identity || identity.status !== 'active') {
            addAuditLogEntry('system', 'authz.failed', { entityId, reason: 'Identity not found or inactive' }, this.getPrivateKey('agent-orchestrator-001'));
            return false;
        }

        const hasRequiredRoles = requiredRoles.every(role => identity.roles.includes(role));
        const verificationLevelOrder = { 'L1': 1, 'L2': 2, 'L3': 3 };
        const meetsVerificationLevel = verificationLevelOrder[identity.verificationLevel] >= verificationLevelOrder[minVerificationLevel];

        if (hasRequiredRoles && meetsVerificationLevel) {
            identity.accessLog.push(addAuditLogEntry(entityId, 'authz.success', { requiredRoles, minVerificationLevel }, this.getPrivateKey(entityId)).id);
            return true;
        } else {
            identity.accessLog.push(addAuditLogEntry(entityId, 'authz.failed', { requiredRoles, minVerificationLevel, reason: 'Insufficient roles or verification level' }, this.getPrivateKey(entityId)).id);
            return false;
        }
    }
}

export const digitalIdentityService = new DigitalIdentityService();


/**
 * @class ProgrammableTokenRailService
 * @description Implements a programmable ledger system for token issuance, transfer, and settlement.
 * Business impact: This service simulates the core programmable value rails, enabling the creation and
 * management of digital assets. It provides atomic, auditable, and policy-driven value transfer,
 * forming the bedrock for a new era of digital finance and economic models.
 */
export class ProgrammableTokenRailService {
    private tokenLedger: Map<string, TokenBalance[]> = new Map(); // accountId -> TokenBalance[]
    private tokenMetadata: Map<string, TokenMetadata> = new Map(); // tokenId -> TokenMetadata
    private currentLedgerEntries: LedgerEntry[] = [];
    private lastLedgerHash: string = 'genesis_ledger_hash';
    private policies: Map<string, SettlementPolicy> = new Map();
    private rails: Map<string, ProgrammableRail> = new Map();

    constructor() {
        // Seed with a default token
        this.issueToken('SA-Credit', 'SAC', 2, 1_000_000_000, 'system');
        // Seed default programmable rails
        this.addRail({
            id: 'fast_rail', name: 'Fast Rail', latencyMs: 50, costPerTx: 0.01,
            securityLevel: 'medium', throughputTxPerSec: 1000, isActive: true, policies: []
        });
        this.addRail({
            id: 'secure_rail', name: 'Secure Rail', latencyMs: 500, costPerTx: 0.1,
            securityLevel: 'cryptographic', throughputTxPerSec: 100, isActive: true, policies: ['L3_identity_required']
        });
        // Seed default policies
        this.addPolicy({
            id: 'L3_identity_required', name: 'L3 Identity Required',
            description: 'Requires L3 identity verification for transactions over 1000 SAC.',
            rules: [
                { condition: "transaction.amount > 1000 && transaction.tokenId === 'SA-Credit'", action: "require_L3_identity" },
                { condition: "transaction.securityLevel === 'cryptographic'", action: "require_L3_identity" }
            ],
            isActive: true
        });
    }

    /**
     * Adds a programmable rail to the system.
     * @param rail The ProgrammableRail object.
     * Business impact: Enables flexible and optimized routing of value transfers,
     * allowing the platform to adapt to different cost, speed, and security requirements.
     */
    public addRail(rail: ProgrammableRail) {
        this.rails.set(rail.id, rail);
        addAuditLogEntry('system', 'rail.added', { railId: rail.id, name: rail.name }, digitalIdentityService.getPrivateKey('agent-orchestrator-001'));
    }

    /**
     * Gets a programmable rail by ID.
     * @param id The ID of the rail.
     * @returns The ProgrammableRail object or undefined.
     */
    public getRail(id: string): ProgrammableRail | undefined {
        return this.rails.get(id);
    }

    /**
     * Gets all active programmable rails.
     * @returns An array of active ProgrammableRail objects.
     */
    public getActiveRails(): ProgrammableRail[] {
        return Array.from(this.rails.values()).filter(rail => rail.isActive);
    }

    /**
     * Adds a settlement policy to the system.
     * @param policy The SettlementPolicy object.
     * Business impact: Automates compliance and business logic for value transfers,
     * allowing complex financial rules to be enforced programmatically, enhancing governance and reducing manual oversight.
     */
    public addPolicy(policy: SettlementPolicy) {
        this.policies.set(policy.id, policy);
        addAuditLogEntry('system', 'policy.added', { policyId: policy.id, name: policy.name }, digitalIdentityService.getPrivateKey('agent-orchestrator-001'));
    }

    /**
     * Retrieves a settlement policy by ID.
     * @param id The ID of the policy.
     * @returns The SettlementPolicy object or undefined.
     */
    public getPolicy(id: string): SettlementPolicy | undefined {
        return this.policies.get(id);
    }

    /**
     * Issues a new token type.
     * Business impact: Enables the creation of diverse digital assets and programmable currencies
     * within the platform, opening new revenue streams and financial product possibilities.
     * @param name Name of the token (e.g., 'GoldBack').
     * @param symbol Symbol of the token (e.g., 'GBK').
     * @param decimals Number of decimal places.
     * @param totalSupply Total supply of the token.
     * @param ownerId DigitalIdentity ID of the token owner.
     * @returns The ID of the newly issued token.
     */
    public issueToken(name: string, symbol: string, decimals: number, totalSupply: number, ownerId: string): string {
        const tokenId = generateUniqueId();
        const policyHash = btoa(JSON.stringify({ name, symbol, decimals })); // Simplified policy hash
        this.tokenMetadata.set(tokenId, { name, symbol, decimals, totalSupply, ownerId, issuanceDate: new Date().toISOString(), policyHash });
        addAuditLogEntry(ownerId, 'token.issued', { tokenId, name, symbol, totalSupply }, digitalIdentityService.getPrivateKey(ownerId));
        return tokenId;
    }

    /**
     * Gets metadata for a token.
     * @param tokenId The ID of the token.
     * @returns TokenMetadata or undefined.
     */
    public getTokenMetadata(tokenId: string): TokenMetadata | undefined {
        return this.tokenMetadata.get(tokenId);
    }

    /**
     * Gets the balance of a specific token for an account.
     * @param accountId The ID of the account.
     * @param tokenId The ID of the token.
     * @returns The balance amount, or 0 if not found.
     */
    public getBalance(accountId: string, tokenId: string): number {
        const balances = this.tokenLedger.get(accountId) || [];
        return balances.find(b => b.tokenId === tokenId)?.amount || 0;
    }

    /**
     * Mints new tokens and adds them to an account.
     * Business impact: Controls the supply of digital assets, enabling dynamic economic policies
     * and flexible asset management within the platform.
     * @param minterId The DigitalIdentity ID of the minter.
     * @param tokenId The ID of the token to mint.
     * @param amount The amount to mint.
     * @param destinationAccountId The account to credit.
     * @returns True if successful, false otherwise.
     */
    public mintTokens(minterId: string, tokenId: string, amount: number, destinationAccountId: string): boolean {
        if (!digitalIdentityService.authorize(minterId, ['token.minter'])) {
            addAuditLogEntry(minterId, 'mint.failed', { tokenId, amount, destinationAccountId, reason: 'Unauthorized' }, digitalIdentityService.getPrivateKey(minterId));
            return false;
        }
        if (!this.tokenMetadata.has(tokenId)) {
            addAuditLogEntry(minterId, 'mint.failed', { tokenId, amount, destinationAccountId, reason: 'Token not found' }, digitalIdentityService.getPrivateKey(minterId));
            return false;
        }

        this.updateBalance(destinationAccountId, tokenId, amount);
        const transactionId = generateUniqueId();
        const minterPrivateKey = digitalIdentityService.getPrivateKey(minterId);
        const transaction: Transaction = {
            id: transactionId,
            type: 'mint',
            initiatorId: minterId,
            destinationAccountId,
            tokenId,
            amount,
            timestamp: new Date().toISOString(),
            status: 'completed',
            signature: simulateSignData(JSON.stringify({ transactionId, minterId, tokenId, amount, destinationAccountId }), minterPrivateKey),
            ledgerEntryIds: []
        };
        this.recordTransactionAndLedgerEntries(transaction);
        addAuditLogEntry(minterId, 'token.minted', { tokenId, amount, destinationAccountId }, minterPrivateKey);
        return true;
    }

    /**
     * Burns tokens from an account.
     * Business impact: Provides mechanisms for supply control and regulatory compliance,
     * allowing for reduction of digital asset circulation when necessary.
     * @param burnerId The DigitalIdentity ID of the burner.
     * @param tokenId The ID of the token to burn.
     * @param amount The amount to burn.
     * @param sourceAccountId The account to debit.
     * @returns True if successful, false otherwise.
     */
    public burnTokens(burnerId: string, tokenId: string, amount: number, sourceAccountId: string): boolean {
        if (!digitalIdentityService.authorize(burnerId, ['token.burner'])) {
            addAuditLogEntry(burnerId, 'burn.failed', { tokenId, amount, sourceAccountId, reason: 'Unauthorized' }, digitalIdentityService.getPrivateKey(burnerId));
            return false;
        }
        if (this.getBalance(sourceAccountId, tokenId) < amount) {
            addAuditLogEntry(burnerId, 'burn.failed', { tokenId, amount, sourceAccountId, reason: 'Insufficient balance' }, digitalIdentityService.getPrivateKey(burnerId));
            return false;
        }

        this.updateBalance(sourceAccountId, tokenId, -amount);
        const transactionId = generateUniqueId();
        const burnerPrivateKey = digitalIdentityService.getPrivateKey(burnerId);
        const transaction: Transaction = {
            id: transactionId,
            type: 'burn',
            initiatorId: burnerId,
            sourceAccountId,
            tokenId,
            amount,
            timestamp: new Date().toISOString(),
            status: 'completed',
            signature: simulateSignData(JSON.stringify({ transactionId, burnerId, tokenId, amount, sourceAccountId }), burnerPrivateKey),
            ledgerEntryIds: []
        };
        this.recordTransactionAndLedgerEntries(transaction);
        addAuditLogEntry(burnerId, 'token.burned', { tokenId, amount, sourceAccountId }, burnerPrivateKey);
        return true;
    }

    /**
     * Transfers tokens between accounts.
     * Business impact: Facilitates peer-to-peer and inter-account value transfer,
     * which is fundamental for any financial platform, with integrated policy enforcement and auditability.
     * @param senderId The DigitalIdentity ID of the sender.
     * @param sourceAccountId The account to debit.
     * @param destinationAccountId The account to credit.
     * @param tokenId The ID of the token.
     * @param amount The amount to transfer.
     * @param memo Optional memo for the transaction.
     * @returns The completed Transaction object or null if failed.
     */
    public transferTokens(senderId: string, sourceAccountId: string, destinationAccountId: string, tokenId: string, amount: number, memo?: string): Transaction | null {
        if (!digitalIdentityService.authorize(senderId, ['user.transfer', 'agent.transfer'])) {
            addAuditLogEntry(senderId, 'transfer.failed', { tokenId, amount, sourceAccountId, destinationAccountId, reason: 'Unauthorized' }, digitalIdentityService.getPrivateKey(senderId));
            return null;
        }
        if (this.getBalance(sourceAccountId, tokenId) < amount) {
            addAuditLogEntry(senderId, 'transfer.failed', { tokenId, amount, sourceAccountId, destinationAccountId, reason: 'Insufficient balance' }, digitalIdentityService.getPrivateKey(senderId));
            return null;
        }

        const transactionId = generateUniqueId();
        const senderPrivateKey = digitalIdentityService.getPrivateKey(senderId);

        let transaction: Transaction = {
            id: transactionId,
            type: 'transfer',
            initiatorId: senderId,
            sourceAccountId,
            destinationAccountId,
            tokenId,
            amount,
            timestamp: new Date().toISOString(),
            status: 'pending',
            signature: simulateSignData(JSON.stringify({ transactionId, senderId, sourceAccountId, destinationAccountId, tokenId, amount, memo }), senderPrivateKey),
            metadata: memo ? { memo } : undefined,
            ledgerEntryIds: [],
        };

        // Apply policies and route
        transaction = this.applyPoliciesAndRoute(transaction);

        if (transaction.status === 'failed') {
            addAuditLogEntry(senderId, 'transfer.failed', { ...transaction, reason: 'Policy violation' }, senderPrivateKey);
            return null;
        }

        // Simulate atomic update
        this.updateBalance(sourceAccountId, tokenId, -amount);
        this.updateBalance(destinationAccountId, tokenId, amount);
        transaction.status = 'completed';
        this.recordTransactionAndLedgerEntries(transaction);
        addAuditLogEntry(senderId, 'token.transferred', { tokenId, amount, sourceAccountId, destinationAccountId }, senderPrivateKey);
        return transaction;
    }

    /**
     * Atomically records a transaction and its associated ledger entries.
     * Business impact: Guarantees the integrity and atomicity of all value movements,
     * preventing inconsistencies and ensuring reliable financial record-keeping.
     * @param transaction The transaction to record.
     */
    private recordTransactionAndLedgerEntries(transaction: Transaction) {
        const sourceBalanceBefore = transaction.sourceAccountId ? this.getBalance(transaction.sourceAccountId, transaction.tokenId) + transaction.amount : undefined; // Balance before debit
        const destBalanceBefore = transaction.destinationAccountId ? this.getBalance(transaction.destinationAccountId, transaction.tokenId) - transaction.amount : undefined; // Balance before credit

        const entries: LedgerEntry[] = [];
        let currentHash = this.lastLedgerHash;

        if (transaction.sourceAccountId) {
            const debitEntryData = {
                transactionId: transaction.id,
                accountId: transaction.sourceAccountId,
                tokenId: transaction.tokenId,
                amount: transaction.amount,
                timestamp: transaction.timestamp,
                entryType: 'debit',
                balanceBefore: sourceBalanceBefore,
                balanceAfter: this.getBalance(transaction.sourceAccountId, transaction.tokenId),
                prevHash: currentHash
            };
            const debitHash = btoa(JSON.stringify(debitEntryData));
            const debitEntry: LedgerEntry = { ...debitEntryData, id: generateUniqueId(), hash: debitHash };
            entries.push(debitEntry);
            currentHash = debitHash;
        }

        if (transaction.destinationAccountId) {
            const creditEntryData = {
                transactionId: transaction.id,
                accountId: transaction.destinationAccountId,
                tokenId: transaction.tokenId,
                amount: transaction.amount,
                timestamp: transaction.timestamp,
                entryType: 'credit',
                balanceBefore: destBalanceBefore,
                balanceAfter: this.getBalance(transaction.destinationAccountId, transaction.tokenId),
                prevHash: currentHash
            };
            const creditHash = btoa(JSON.stringify(creditEntryData));
            const creditEntry: LedgerEntry = { ...creditEntryData, id: generateUniqueId(), hash: creditHash };
            entries.push(creditEntry);
            currentHash = creditHash;
        }

        this.currentLedgerEntries.push(...entries);
        this.lastLedgerHash = currentHash;
        transaction.ledgerEntryIds = entries.map(e => e.id);
        // In a real system, transactions would also be stored in a separate table/collection.
        // For simulation, we're assuming they are logged immediately.
    }

    /**
     * Updates an account's token balance.
     * @param accountId The account to update.
     * @param tokenId The token ID.
     * @param amount The amount to add (positive) or subtract (negative).
     */
    private updateBalance(accountId: string, tokenId: string, amount: number) {
        let balances = this.tokenLedger.get(accountId);
        if (!balances) {
            balances = [];
            this.tokenLedger.set(accountId, balances);
        }
        let tokenBalance = balances.find(b => b.tokenId === tokenId);
        if (tokenBalance) {
            tokenBalance.amount += amount;
        } else {
            balances.push({ accountId, tokenId, amount });
        }
    }

    /**
     * Applies programmable settlement policies and determines the routing path for a transaction.
     * Business impact: Automates intelligent routing and compliance checks for financial transactions,
     * ensuring that each value transfer adheres to predefined rules and is routed optimally based on
     * factors like cost, speed, and security.
     * @param transaction The transaction to process.
     * @returns The updated Transaction object with status, policy violations, and routing path.
     */
    private applyPoliciesAndRoute(transaction: Transaction): Transaction {
        let riskScore = 0;
        const violations: string[] = [];
        let recommendedRails: ProgrammableRail[] = this.getActiveRails(); // Start with all active

        // Evaluate policies
        for (const policy of this.policies.values()) {
            if (!policy.isActive) continue;

            for (const rule of policy.rules) {
                // Simplified rule engine execution
                try {
                    // Example: "transaction.amount > 1000 && transaction.tokenId === 'SA-Credit'"
                    const conditionResult = eval(rule.condition.replace(/transaction\./g, 'transaction.')); // DANGEROUS IN PRODUCTION, USE AST PARSER
                    if (conditionResult) {
                        if (rule.action === 'require_L3_identity') {
                            const initiatorIdentity = digitalIdentityService.getIdentity(transaction.initiatorId);
                            if (!initiatorIdentity || initiatorIdentity.verificationLevel !== 'L3') {
                                violations.push(`Policy "${policy.name}" violated: ${rule.action} - L3 identity required.`);
                                riskScore += 50; // High risk
                            }
                        }
                        // Add more rule actions: block, flag, route_to_secure_rail, etc.
                        if (rule.action === 'route_to_secure_rail') {
                            const secureRail = this.getRail('secure_rail');
                            if (secureRail) {
                                recommendedRails = [secureRail]; // Force to secure rail
                            }
                        }
                    }
                } catch (e) {
                    console.error(`Error evaluating policy rule for transaction ${transaction.id}:`, e);
                }
            }
        }

        transaction.policyViolations = violations.length > 0 ? violations : undefined;
        transaction.riskScore = riskScore;

        if (violations.length > 0 && riskScore >= 50) { // Example: block if high risk
            transaction.status = 'failed';
            addAuditLogEntry('system', 'transaction.blocked', { transactionId: transaction.id, reason: 'High risk / Policy violation' }, digitalIdentityService.getPrivateKey('agent-orchestrator-001'));
            return transaction;
        }

        // Predictive Routing (simplified heuristic for now)
        // Choose rail based on security preference, then cost, then latency
        const sortedRails = recommendedRails.sort((a, b) => {
            const securityLevels = { 'low': 1, 'medium': 2, 'high': 3, 'cryptographic': 4 };
            if (securityLevels[a.securityLevel] !== securityLevels[b.securityLevel]) {
                return securityLevels[b.securityLevel] - securityLevels[a.securityLevel]; // Higher security first
            }
            if (a.costPerTx !== b.costPerTx) {
                return a.costPerTx - b.costPerTx; // Lower cost first
            }
            return a.latencyMs - b.latencyMs; // Lower latency first
        });

        const chosenRail = sortedRails[0];
        if (chosenRail) {
            transaction.routingPath = [chosenRail.id];
            addAuditLogEntry('system', 'transaction.routed', { transactionId: transaction.id, rail: chosenRail.id }, digitalIdentityService.getPrivateKey('agent-orchestrator-001'));
        } else {
            transaction.status = 'failed';
            addAuditLogEntry('system', 'transaction.failed', { transactionId: transaction.id, reason: 'No suitable rail found' }, digitalIdentityService.getPrivateKey('agent-orchestrator-001'));
        }

        return transaction;
    }
}

export const programmableTokenRailService = new ProgrammableTokenRailService();


/**
 * @class AgentMessagingLayer
 * @description Provides a secure, internal messaging system for inter-agent communication.
 * Business impact: Enables autonomous agents to collaborate and share information securely
 * and efficiently, supporting decentralized decision-making and real-time operational
 * intelligence across the financial infrastructure.
 */
export class AgentMessagingLayer {
    private messageQueue: AgentMessage[] = [];
    private messageHistory: AgentMessage[] = []; // For auditability

    /**
     * Sends a message between agents.
     * Business impact: Facilitates automated workflows and rapid response to system events,
     * allowing agents to coordinate complex financial operations without human intervention.
     * @param senderId The ID of the sending agent.
     * @param receiverId The ID of the receiving agent.
     * @param topic The message topic.
     * @param payload The message payload.
     * @param isEncrypted Whether the message should be encrypted (simulated).
     * @returns The sent AgentMessage.
     */
    public sendMessage(senderId: string, receiverId: string, topic: string, payload: Record<string, any>, isEncrypted: boolean = false): AgentMessage {
        const senderPrivateKey = digitalIdentityService.getPrivateKey(senderId);
        const dataToSign = JSON.stringify({ senderId, receiverId, topic, payload, isEncrypted, timestamp: new Date().toISOString() });
        const signature = simulateSignData(dataToSign, senderPrivateKey);

        const message: AgentMessage = {
            id: generateUniqueId(),
            senderId,
            receiverId,
            topic,
            payload,
            timestamp: new Date().toISOString(),
            signature,
            isEncrypted,
        };

        // Simulate encryption by simply marking it
        if (isEncrypted) {
            // In a real system, payload would be encrypted here
            message.payload = { encryptedData: btoa(JSON.stringify(payload)) };
        }

        this.messageQueue.push(message);
        this.messageHistory.push(message); // Log all messages
        addAuditLogEntry(senderId, 'agent.message.sent', { messageId: message.id, receiverId, topic }, senderPrivateKey);
        return message;
    }

    /**
     * Retrieves messages for a specific agent.
     * @param agentId The ID of the agent.
     * @returns An array of AgentMessage objects.
     */
    public getMessagesForAgent(agentId: string): AgentMessage[] {
        const messages = this.messageQueue.filter(m => m.receiverId === agentId);
        this.messageQueue = this.messageQueue.filter(m => m.receiverId !== agentId); // Clear queue
        return messages.map(m => {
            if (m.isEncrypted && m.payload.encryptedData) {
                // Simulate decryption
                try {
                    m.payload = JSON.parse(atob(m.payload.encryptedData));
                } catch (e) {
                    console.error('Failed to decrypt message:', e);
                }
            }
            return m;
        });
    }

    /**
     * Retrieves all messages from history.
     * @returns An array of all AgentMessage objects.
     */
    public getMessageHistory(): AgentMessage[] {
        return [...this.messageHistory];
    }
}

export const agentMessagingLayer = new AgentMessagingLayer();


/**
 * @class Agent
 * @description Base class for intelligent agents with monitoring, remediation, and governance skills.
 * Business impact: Drives intelligent automation across the platform, enabling proactive anomaly detection,
 * self-correction, and policy enforcement, significantly reducing operational overhead and improving system resilience.
 */
export abstract class Agent {
    public readonly id: string;
    public readonly name: string;
    public readonly roles: string[];
    protected privateKey: string;

    /**
     * Initializes a new Agent instance.
     * @param id Unique ID for the agent.
     * @param name Name of the agent.
     * @param roles Roles assigned to the agent.
     */
    constructor(id: string, name: string, roles: string[]) {
        this.id = id;
        this.name = name;
        this.roles = roles;
        const identity = digitalIdentityService.getIdentity(id);
        if (!identity) {
            digitalIdentityService.registerIdentity(id, 'agent', roles, 'L3');
        }
        this.privateKey = digitalIdentityService.getPrivateKey(id);
        addAuditLogEntry(this.id, 'agent.initialized', { agentId: this.id, name: this.name, roles: this.roles }, this.privateKey);
    }

    /**
     * Observes system events and signals.
     * Business impact: Provides real-time situational awareness, allowing agents to detect critical events,
     * from transaction anomalies to performance bottlenecks, enabling rapid response.
     * @param event The event data to observe.
     */
    public abstract observe(event: Record<string, any>): Promise<void>;

    /**
     * Decides on actions based on observations and embedded logic.
     * Business impact: Automates decision-making processes, reducing latency and human error in operational responses,
     * leading to more efficient and resilient system management.
     * @returns An array of AgentAction objects.
     */
    public abstract decide(): Promise<AgentAction[]>;

    /**
     * Communicates securely with other agents.
     * Business impact: Enables collaborative intelligence and orchestrated responses,
     * ensuring that agents can work together to resolve complex issues or execute multi-step workflows.
     * @param receiverId The ID of the receiving agent.
     * @param topic The message topic.
     * @param payload The message payload.
     * @param isEncrypted Whether the message should be encrypted.
     */
    public communicate(receiverId: string, topic: string, payload: Record<string, any>, isEncrypted: boolean = true) {
        agentMessagingLayer.sendMessage(this.id, receiverId, topic, payload, isEncrypted);
    }

    /**
     * Remediation skill: Corrects detected anomalies or issues.
     * Business impact: Enables self-healing capabilities, minimizing downtime and human intervention
     * in routine operational failures, enhancing system reliability and reducing costs.
     * @param anomalyDetails Details of the anomaly.
     * @returns Promise indicating completion.
     */
    public abstract remediate(anomalyDetails: Record<string, any>): Promise<void>;

    /**
     * Governance context: Enforces policy compliance and operational integrity.
     * Business impact: Embeds regulatory and internal policies directly into autonomous operations,
     * ensuring continuous compliance and maintaining the integrity of financial processes.
     * @param context Operational context for policy enforcement.
     * @returns Promise indicating compliance status.
     */
    public abstract enforceGovernance(context: Record<string, any>): Promise<boolean>;

    /**
     * Retrieves messages targeted at this agent.
     * @returns An array of AgentMessage objects.
     */
    public receiveMessages(): AgentMessage[] {
        return agentMessagingLayer.getMessagesForAgent(this.id);
    }

    /**
     * Records an agent action.
     * @param actionType Type of action.
     * @param payload Payload details.
     * @param targetId Optional target ID.
     * @param status Status of the action.
     * @returns The recorded AgentAction.
     */
    protected recordAction(actionType: AgentAction['actionType'], payload: Record<string, any>, targetId?: string, status: AgentAction['status'] = 'completed'): AgentAction {
        const timestamp = new Date().toISOString();
        const dataToSign = JSON.stringify({ actionType, targetId, payload, timestamp, status });
        const signature = simulateSignData(dataToSign, this.privateKey);

        const action: AgentAction = {
            id: generateUniqueId(),
            agentId: this.id,
            actionType,
            targetId,
            payload,
            timestamp,
            signature,
            status,
        };
        addAuditLogEntry(this.id, `agent.action.${actionType}`, { actionId: action.id, targetId, status }, this.privateKey);
        return action;
    }
}

/**
 * @class MonitoringAgent
 * @description An agent responsible for observing system metrics and identifying anomalies.
 * Business impact: Proactively monitors the financial infrastructure for deviations,
 * preventing potential issues from escalating and ensuring continuous operational health.
 */
export class MonitoringAgent extends Agent {
    private observedEvents: Record<string, any>[] = [];
    private alerts: Alert[] = [];

    constructor(id: string, name: string) {
        super(id, name, ['agent.monitoring']);
    }

    /**
     * Observes system events, transactions, and operational signals.
     * @param event The event data to observe.
     */
    public async observe(event: Record<string, any>): Promise<void> {
        this.observedEvents.push(event);
        addAuditLogEntry(this.id, 'agent.monitor.event_observed', { eventType: event.type || 'unknown' }, this.privateKey);

        // Simple anomaly detection logic for simulation
        if (event.type === 'transaction_anomaly' && event.riskScore > 70) {
            const alert: Alert = {
                id: generateUniqueId(),
                type: 'security',
                severity: 'high',
                message: `High-risk transaction detected: ${event.transactionId}`,
                timestamp: new Date().toISOString(),
                source: this.name,
                isResolved: false,
                relatedTransactionId: event.transactionId,
            };
            this.alerts.push(alert);
            this.communicate('agent-orchestrator-001', 'alert.new', alert, true); // Notify orchestrator
            this.recordAction('observe', { alertId: alert.id, eventType: 'high_risk_transaction' }, event.transactionId);
        } else if (event.type === 'performance_issue' && event.latencyMs > 1000) {
            const alert: Alert = {
                id: generateUniqueId(),
                type: 'performance',
                severity: 'medium',
                message: `High latency detected on component: ${event.component}`,
                timestamp: new Date().toISOString(),
                source: this.name,
                isResolved: false,
                relatedTransactionId: event.transactionId,
            };
            this.alerts.push(alert);
            this.communicate('agent-orchestrator-001', 'alert.new', alert, true);
            this.recordAction('observe', { alertId: alert.id, eventType: 'high_latency' }, event.component);
        }
    }

    /**
     * Decides actions based on detected alerts.
     * @returns An array of AgentAction objects.
     */
    public async decide(): Promise<AgentAction[]> {
        const actions: AgentAction[] = [];
        this.alerts.filter(a => !a.isResolved).forEach(alert => {
            // Decision logic: if critical security alert, escalate immediately
            if (alert.severity === 'high' || alert.severity === 'critical') {
                actions.push(this.recordAction('decide', { decision: 'escalate_to_remediation', alertId: alert.id }, alert.id));
                this.communicate('agent-orchestrator-001', 'command.remediate', { alertId: alert.id, type: alert.type, relatedTransactionId: alert.relatedTransactionId }, true);
            }
            // Other decisions can be made for lower severity alerts, e.g., self-healing, logging
        });
        return actions;
    }

    /**
     * Monitoring agents don't typically remediate directly but rather escalate.
     * @param anomalyDetails Details of the anomaly.
     */
    public async remediate(anomalyDetails: Record<string, any>): Promise<void> {
        addAuditLogEntry(this.id, 'agent.monitor.remediate_attempt', { details: anomalyDetails, result: 'escalated' }, this.privateKey);
        this.communicate('agent-orchestrator-001', 'command.remediate', anomalyDetails, true);
    }

    /**
     * Enforces governance policies related to monitoring.
     * @param context Operational context for policy enforcement.
     * @returns Promise indicating compliance status.
     */
    public async enforceGovernance(context: Record<string, any>): Promise<boolean> {
        // Example: Ensure all transactions are logged (already handled by addAuditLogEntry)
        const isCompliant = true; // In simulation, assume compliance for now
        this.recordAction('enforce', { policyCheck: 'all_transactions_logged', compliant: isCompliant }, undefined, isCompliant ? 'completed' : 'failed');
        return isCompliant;
    }

    /**
     * Retrieves current alerts.
     * @returns An array of Alert objects.
     */
    public getAlerts(): Alert[] {
        return [...this.alerts];
    }
}

/**
 * @class RemediationAgent
 * @description An agent responsible for taking corrective actions based on alerts.
 * Business impact: Ensures rapid and automated recovery from system failures and security incidents,
 * minimizing financial losses and maintaining business continuity.
 */
export class RemediationAgent extends Agent {
    constructor(id: string, name: string) {
        super(id, name, ['agent.remediation']);
    }

    /**
     * Remediation agents typically act on commands from the orchestrator.
     * @param event The event data to observe.
     */
    public async observe(event: Record<string, any>): Promise<void> {
        // Remediation agent primarily acts on specific commands, but can observe for context
        addAuditLogEntry(this.id, 'agent.remediation.event_observed', { eventType: event.type || 'unknown' }, this.privateKey);
    }

    /**
     * Decides remediation strategies.
     * @returns An array of AgentAction objects.
     */
    public async decide(): Promise<AgentAction[]> {
        // Decision logic can be complex, e.g., rollback transaction, isolate component, retry operation
        return []; // No self-initiated decisions without specific command in this simplified model
    }

    /**
     * Executes remediation steps.
     * Business impact: Provides automated incident response, drastically reducing recovery times
     * and human effort during critical system events.
     * @param anomalyDetails Details of the anomaly requiring remediation.
     */
    public async remediate(anomalyDetails: Record<string, any>): Promise<void> {
        addAuditLogEntry(this.id, 'agent.remediation.remediation_started', { details: anomalyDetails }, this.privateKey);
        // Simulate remediation based on anomaly type
        if (anomalyDetails.type === 'security' && anomalyDetails.relatedTransactionId) {
            // Example: "Rollback" a simulated transaction
            console.warn(`Simulating rollback for transaction: ${anomalyDetails.relatedTransactionId}`);
            // In a real system, this would interact with the ledger service to revert transactions
            this.recordAction('remediate', { action: 'transaction_rollback_simulated', transactionId: anomalyDetails.relatedTransactionId }, anomalyDetails.relatedTransactionId);
            this.communicate('agent-orchestrator-001', 'remediation.status', { alertId: anomalyDetails.alertId, status: 'completed', message: 'Transaction rollback simulated.' }, true);
        } else if (anomalyDetails.type === 'performance' && anomalyDetails.component) {
            console.warn(`Simulating performance optimization for component: ${anomalyDetails.component}`);
            // In a real system, this might trigger scaling, resource reallocation, etc.
            this.recordAction('remediate', { action: 'performance_tune_simulated', component: anomalyDetails.component }, anomalyDetails.component);
            this.communicate('agent-orchestrator-001', 'remediation.status', { alertId: anomalyDetails.alertId, status: 'completed', message: 'Performance optimization simulated.' }, true);
        } else {
            console.log('No specific remediation action defined for anomaly:', anomalyDetails);
            this.recordAction('remediate', { action: 'no_specific_remediation', details: anomalyDetails }, undefined, 'failed');
            this.communicate('agent-orchestrator-001', 'remediation.status', { alertId: anomalyDetails.alertId, status: 'failed', message: 'No specific remediation defined.' }, true);
        }
        addAuditLogEntry(this.id, 'agent.remediation.remediation_completed', { details: anomalyDetails }, this.privateKey);
    }

    /**
     * Enforces governance policies related to remediation.
     * @param context Operational context for policy enforcement.
     * @returns Promise indicating compliance status.
     */
    public async enforceGovernance(context: Record<string, any>): Promise<boolean> {
        // Example: Ensure remediation actions are within policy limits
        const isCompliant = true; // In simulation, assume compliance
        this.recordAction('enforce', { policyCheck: 'remediation_limits', compliant: isCompliant }, undefined, isCompliant ? 'completed' : 'failed');
        return isCompliant;
    }
}

/**
 * @class OrchestrationAgent
 * @description Coordinates multiple agents, ensures message ordering, and maintains auditable logs.
 * Business impact: Provides centralized intelligence for managing autonomous agent ecosystems,
 * ensuring seamless collaboration, ordered execution of complex workflows, and comprehensive auditability
 * of all automated actions.
 */
export class OrchestrationAgent extends Agent {
    private registeredAgents: Map<string, Agent> = new Map();
    private activeAlerts: Map<string, Alert> = new Map();
    private actionLogs: AgentAction[] = [];

    constructor(id: string, name: string) {
        super(id, name, ['agent.orchestration', 'admin']);
    }

    /**
     * Registers an agent with the orchestrator.
     * @param agent The agent instance to register.
     * Business impact: Enables the orchestrator to manage and coordinate all autonomous components,
     * building a unified and intelligent operational fabric.
     */
    public registerAgent(agent: Agent) {
        this.registeredAgents.set(agent.id, agent);
        addAuditLogEntry(this.id, 'orchestrator.agent_registered', { agentId: agent.id, agentName: agent.name }, this.privateKey);
    }

    /**
     * Observes incoming messages and routes them.
     * @param event The event data to observe (typically an AgentMessage).
     */
    public async observe(event: Record<string, any>): Promise<void> {
        addAuditLogEntry(this.id, 'orchestrator.message_observed', { sender: event.senderId, topic: event.topic }, this.privateKey);
        if (event.topic === 'alert.new') {
            const alert = event.payload as Alert;
            this.activeAlerts.set(alert.id, alert);
            this.recordAction('observe', { type: 'new_alert', alertId: alert.id }, alert.id);
            this.communicate('agent-monitoring-001', 'command.acknowledge_alert', { alertId: alert.id }, false); // Example ack
        } else if (event.topic === 'command.remediate') {
            const remediationDetails = event.payload;
            const remediationAgent = this.registeredAgents.get('agent-remediation-001'); // Assuming a single remediation agent
            if (remediationAgent) {
                // Forward the command to the remediation agent
                remediationAgent.remediate(remediationDetails);
                this.recordAction('decide', { decision: 'forward_remediation_command', alertId: remediationDetails.alertId }, remediationDetails.alertId);
            } else {
                console.error('Remediation agent not found!');
                this.recordAction('decide', { decision: 'remediation_failed_no_agent', alertId: remediationDetails.alertId }, remediationDetails.alertId, 'failed');
            }
        } else if (event.topic === 'remediation.status') {
            const statusUpdate = event.payload;
            const alert = this.activeAlerts.get(statusUpdate.alertId);
            if (alert) {
                alert.isResolved = statusUpdate.status === 'completed';
                alert.resolvedBy = statusUpdate.status === 'completed' ? event.senderId : undefined;
                this.recordAction('remediate', { status: statusUpdate.status, message: statusUpdate.message }, alert.id);
                if (alert.isResolved) {
                    this.activeAlerts.delete(alert.id);
                }
            }
        }
        // Additional routing and coordination logic
    }

    /**
     * Decides on orchestration flows and agent commands.
     * @returns An array of AgentAction objects.
     */
    public async decide(): Promise<AgentAction[]> {
        const actions: AgentAction[] = [];
        // Orchestrator decides based on active alerts or scheduled tasks
        for (const alert of this.activeAlerts.values()) {
            if (!alert.isResolved && alert.severity === 'high') {
                actions.push(this.recordAction('decide', { decision: 'trigger_remediation', alertId: alert.id }, alert.id));
                this.communicate('agent-remediation-001', 'command.remediate', alert, true); // Direct command to remediation
            }
        }
        return actions;
    }

    /**
     * Orchestrator's remediation might involve re-provisioning or system-level actions.
     * @param anomalyDetails Details of the anomaly.
     */
    public async remediate(anomalyDetails: Record<string, any>): Promise<void> {
        addAuditLogEntry(this.id, 'orchestrator.remediate_attempt', { details: anomalyDetails }, this.privateKey);
        // Example: If an agent fails, orchestrator might restart it (simulated)
        console.warn(`Orchestrator simulating system-level remediation: ${anomalyDetails.message}`);
        this.recordAction('remediate', { action: 'system_level_fix_simulated', details: anomalyDetails }, undefined, 'completed');
    }

    /**
     * Enforces governance policies across the agent network.
     * @param context Operational context for policy enforcement.
     * @returns Promise indicating compliance status.
     */
    public async enforceGovernance(context: Record<string, any>): Promise<boolean> {
        // Example: Check if all agents report regularly, if message ordering is maintained
        const allAgentsReporting = Array.from(this.registeredAgents.keys()).every(agentId => {
            // Simulate checking agent heartbeat or last communication
            return true; // For simulation
        });
        const compliance = allAgentsReporting; // Simplified compliance check
        this.recordAction('enforce', { policyCheck: 'agent_health_check', compliant: compliance }, undefined, compliance ? 'completed' : 'failed');
        return compliance;
    }

    /**
     * Retrieves all recorded agent actions.
     * Business impact: Provides a comprehensive, auditable record of all autonomous actions
     * taken by agents, essential for regulatory compliance, post-incident analysis, and
     * understanding system behavior.
     * @returns An array of AgentAction objects.
     */
    public getActionLogs(): AgentAction[] {
        return [...this.actionLogs];
    }
}

export const monitoringAgent = new MonitoringAgent('agent-monitoring-001', 'PerformanceMonitor');
export const remediationAgent = new RemediationAgent('agent-remediation-001', 'AutomatedFixer');
export const orchestrationAgent = new OrchestrationAgent('agent-orchestrator-001', 'AgentCommander');

// Register agents with the orchestrator
orchestrationAgent.registerAgent(monitoringAgent);
orchestrationAgent.registerAgent(remediationAgent);

// Simulators for real-time settlement and payments

/**
 * @class RealTimeSettlementEngine
 * @description Processes value movement, routes transactions, and performs real-time balance validation.
 * Business impact: This engine is the heart of real-time finance, enabling instant value settlement,
 * reducing counterparty risk, and dramatically increasing transaction speed and efficiency.
 * It's critical for high-volume, low-latency financial operations.
 */
export class RealTimeSettlementEngine {
    private transactions: Map<string, Transaction> = new Map();
    private riskScores: Map<string, number> = new Map(); // TransactionId -> RiskScore

    /**
     * Initializes a new RealTimeSettlementEngine instance.
     */
    constructor() {
        // Seed with a system identity to perform internal actions if needed
        if (!digitalIdentityService.getIdentity('system')) {
            digitalIdentityService.registerIdentity('system', 'service', ['admin', 'settlement.engine'], 'L3');
        }
    }

    /**
     * Processes a payment request from an authenticated entity.
     * Business impact: Provides a robust and secure entry point for initiating all financial transfers,
     * validating identities and ensuring compliance before any value movement occurs.
     * @param initiatorId The ID of the entity initiating the payment.
     * @param sourceAccountId The account to debit.
     * @param destinationAccountId The account to credit.
     * @param tokenId The ID of the token.
     * @param amount The amount to transfer.
     * @param memo Optional memo for the transaction.
     * @returns The completed Transaction object or null if failed.
     */
    public async processPayment(initiatorId: string, sourceAccountId: string, destinationAccountId: string, tokenId: string, amount: number, memo?: string): Promise<Transaction | null> {
        const initiatorIdentity = digitalIdentityService.getIdentity(initiatorId);
        if (!initiatorIdentity || initiatorIdentity.status !== 'active') {
            addAuditLogEntry('system', 'payment.failed', { initiatorId, reason: 'Initiator identity inactive or not found' }, digitalIdentityService.getPrivateKey('system'));
            return null;
        }

        const transactionId = generateUniqueId();
        const initiatorPrivateKey = digitalIdentityService.getPrivateKey(initiatorId); // Assume initiator's private key is available for signing

        let transaction: Transaction = {
            id: transactionId,
            type: 'settlement', // Or 'transfer' depending on context
            initiatorId,
            sourceAccountId,
            destinationAccountId,
            tokenId,
            amount,
            timestamp: new Date().toISOString(),
            status: 'pending',
            signature: simulateSignData(JSON.stringify({ transactionId, initiatorId, sourceAccountId, destinationAccountId, tokenId, amount, memo }), initiatorPrivateKey),
            metadata: memo ? { memo } : undefined,
            ledgerEntryIds: [],
        };

        // Real-time balance validation
        if (programmableTokenRailService.getBalance(sourceAccountId, tokenId) < amount) {
            transaction.status = 'failed';
            addAuditLogEntry('system', 'payment.failed', { transactionId, reason: 'Insufficient funds' }, digitalIdentityService.getPrivateKey('system'));
            return transaction;
        }

        this.transactions.set(transactionId, transaction);
        addAuditLogEntry(initiatorId, 'payment.initiated', { transactionId, tokenId, amount }, initiatorPrivateKey);

        // Simulate predictive routing and policy application
        await delay(50); // Simulate network latency
        transaction = programmableTokenRailService.transferTokens(initiatorId, sourceAccountId, destinationAccountId, tokenId, amount, memo) as Transaction;
        if (transaction && transaction.status === 'completed') {
            this.transactions.set(transactionId, transaction);
            this.riskScores.set(transactionId, transaction.riskScore || 0); // Update risk score
            addAuditLogEntry('system', 'payment.completed', { transactionId, routingPath: transaction.routingPath }, digitalIdentityService.getPrivateKey('system'));
            // Notify monitoring agent of successful transaction
            monitoringAgent.observe({ type: 'transaction_completed', transactionId, amount, tokenId, riskScore: transaction.riskScore });
            return transaction;
        } else {
            if (transaction) {
                this.transactions.set(transactionId, { ...transaction, status: 'failed' });
                this.riskScores.set(transactionId, transaction.riskScore || 100); // Assign high risk on failure
                addAuditLogEntry('system', 'payment.failed', { transactionId, reason: transaction.policyViolations || 'unknown' }, digitalIdentityService.getPrivateKey('system'));
                // Notify monitoring agent of failed transaction
                monitoringAgent.observe({ type: 'transaction_anomaly', transactionId, amount, tokenId, riskScore: transaction.riskScore, policyViolations: transaction.policyViolations });
            }
            return null;
        }
    }

    /**
     * Retrieves the status of a transaction.
     * @param transactionId The ID of the transaction.
     * @returns The Transaction object or undefined.
     */
    public getTransactionStatus(transactionId: string): Transaction | undefined {
        return this.transactions.get(transactionId);
    }

    /**
     * Performs real-time balance reconciliation (simulated).
     * Business impact: Ensures ledger consistency and prevents discrepancies,
     * critical for financial accuracy and dispute resolution.
     * @param accountId The account to reconcile.
     * @param tokenId The token to reconcile.
     * @returns True if reconciled, false if discrepancy found.
     */
    public async reconcileBalance(accountId: string, tokenId: string): Promise<boolean> {
        addAuditLogEntry('system', 'reconciliation.started', { accountId, tokenId }, digitalIdentityService.getPrivateKey('system'));
        await delay(100); // Simulate reconciliation process
        const ledgerBalance = programmableTokenRailService.getBalance(accountId, tokenId);
        // In a real system, this would compare against an external source or a separate audit trail
        // For simulation, we assume internal ledger is canonical
        addAuditLogEntry('system', 'reconciliation.completed', { accountId, tokenId, ledgerBalance }, digitalIdentityService.getPrivateKey('system'));
        return true; // Always true in this simple simulation
    }

    /**
     * Blocks or flags high-risk transfers through risk scoring logic.
     * Business impact: Prevents fraudulent activities and ensures regulatory compliance
     * by automatically identifying and interdicting suspicious transactions in real-time.
     * @param transactionId The ID of the transaction to evaluate.
     * @returns 'blocked' | 'flagged' | 'approved'
     */
    public async evaluateRisk(transactionId: string): Promise<'blocked' | 'flagged' | 'approved'> {
        const transaction = this.transactions.get(transactionId);
        if (!transaction) return 'approved';

        const riskScore = this.riskScores.get(transactionId) || 0;

        if (riskScore > 80) { // Example threshold for blocking
            transaction.status = 'failed'; // Block
            addAuditLogEntry('system', 'transaction.risk_blocked', { transactionId, riskScore }, digitalIdentityService.getPrivateKey('system'));
            monitoringAgent.observe({ type: 'transaction_blocked_by_risk', transactionId, riskScore });
            return 'blocked';
        } else if (riskScore > 50) { // Example threshold for flagging
            addAuditLogEntry('system', 'transaction.risk_flagged', { transactionId, riskScore }, digitalIdentityService.getPrivateKey('system'));
            monitoringAgent.observe({ type: 'transaction_flagged_by_risk', transactionId, riskScore });
            return 'flagged';
        }
        addAuditLogEntry('system', 'transaction.risk_approved', { transactionId, riskScore }, digitalIdentityService.getPrivateKey('system'));
        return 'approved';
    }
}

export const realTimeSettlementEngine = new RealTimeSettlementEngine();


// Mock Data (to simulate a backend)

const { publicKey: mockUserPubKey, privateKey: mockUserPrivKey } = simulateGenerateKeyPair();
export const MOCK_USER: UserProfile = {
    id: 'user-123',
    username: 'SonicAlchemist',
    email: 'user@example.com',
    avatarUrl: 'https://i.pravatar.cc/150?img=68',
    bio: 'Explorer of soundscapes and AI-driven melodies. Passionate about ambient and electronic music.',
    memberSince: '2023-01-15T10:00:00Z',
    preferredGenre: 'Ambient',
    preferredInstruments: ['Synthesizer', 'Pad', 'Drums'],
    allowPublicGenerations: true,
    storageUsedGB: 1.2,
    maxStorageGB: 10,
    subscriptionLevel: 'Pro',
    lastLogin: new Date().toISOString(),
    digitalIdentityId: 'user-123', // Link to its DigitalIdentity
};

// Ensure MOCK_USER's identity is registered with the service
const existingIdentity = digitalIdentityService.getIdentity(MOCK_USER.id);
if (!existingIdentity) {
    digitalIdentityService.registerIdentity(MOCK_USER.id, 'user', ['composer', 'investor'], 'L3');
} else {
    // Update existing mock user's identity to ensure it's L3
    existingIdentity.verificationLevel = 'L3';
}

export const MOCK_COMPOSITIONS_DATA: Composition[] = [
    {
        id: 'comp-001',
        userId: MOCK_USER.id,
        title: 'Echoes of a Forgotten Star',
        description: 'A deep space ambient piece with shimmering synthesizers, a slow, evolving bassline, and subtle percussive textures.',
        instrumentation: ['Synthesizer', 'Pad', 'Drums (light percussion)', 'Bass'],
        genre: 'Ambient',
        mood: 'Ethereal',
        tempo: 80,
        keySignature: 'C Minor',
        durationSeconds: 180,
        audioUrl: '/audio/echoes.mp3', // Placeholder, in real app this would be a URL to actual generated audio
        waveformJson: '{"peaks": [0.1, 0.3, 0.5, 0.4, 0.2, 0.1, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.4, 0.3, 0.2, 0.1], "sampleRate": 44100}',
        midiData: 'data:audio/midi;base64,TVRoZAAAA... (truncated)',
        createdAt: '2023-03-10T14:30:00Z',
        lastModifiedAt: '2023-03-10T14:30:00Z',
        isPublic: true,
        tags: ['ambient', 'space', 'cinematic', 'meditative'],
        versionHistory: [],
        remixSourceId: undefined,
        likes: 15,
        comments: [
            { id: generateUniqueId(), userId: 'user-other-1', username: 'SoundExplorer', text: 'Absolutely love the pads on this one! So atmospheric.', createdAt: '2023-03-11T10:00:00Z', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
            { id: generateUniqueId(), userId: MOCK_USER.id, username: MOCK_USER.username, text: 'Thanks! Tried to capture the vastness of space.', createdAt: '2023-03-11T10:30:00Z', avatarUrl: MOCK_USER.avatarUrl },
        ],
        playCount: 120,
        downloadCount: 5,
        modelUsed: 'music-model-beta',
        originalPrompt: 'A deep space ambient piece with shimmering synthesizers and a slow, evolving bassline.',
        generationParameters: {
            genre: 'Ambient', mood: 'Ethereal', tempoRange: [70, 90], instrumentationPreference: ['Synthesizer', 'Pad', 'Drums', 'Bass'],
            durationPreference: [150, 210], keySignaturePreference: 'C Minor', creativityTemperature: 0.7, diversityPenalty: 0.5,
            model: 'music-model-beta', outputFormat: 'audio'
        }
    },
    {
        id: 'comp-002',
        userId: MOCK_USER.id,
        title: 'Rainy Day Reverie',
        description: 'A melancholic but hopeful piano piece for a rainy day, with subtle string accompaniment. Perfect for introspection.',
        instrumentation: ['Piano', 'Violin', 'Cello'],
        genre: 'Classical Crossover',
        mood: 'Melancholic, Hopeful',
        tempo: 65,
        keySignature: 'G Minor',
        durationSeconds: 120,
        audioUrl: '/audio/rainy_reverie.mp3', // Placeholder
        waveformJson: '{"peaks": [0.2, 0.4, 0.6, 0.5, 0.3, 0.2, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.5, 0.4, 0.3, 0.2], "sampleRate": 44100}',
        midiData: 'data:audio/midi;base64,TVRoZAAAA... (truncated)',
        createdAt: '2023-03-12T09:15:00Z',
        lastModifiedAt: '2023-03-12T09:15:00Z',
        isPublic: false,
        tags: ['piano', 'sad', 'hopeful', 'emotional'],
        versionHistory: [],
        remixSourceId: undefined,
        likes: 8,
        comments: [],
        playCount: 80,
        downloadCount: 2,
        modelUsed: 'music-model-beta',
        originalPrompt: 'A melancholic but hopeful piano piece for a rainy day.',
        generationParameters: {
            genre: 'Classical Crossover', mood: 'Melancholic', tempoRange: [60, 70], instrumentationPreference: ['Piano', 'Violin', 'Cello'],
            durationPreference: [90, 150], keySignaturePreference: 'G Minor', creativityTemperature: 0.6, diversityPenalty: 0.7,
            model: 'music-model-beta', outputFormat: 'audio'
        }
    },
    {
        id: 'comp-003',
        userId: MOCK_USER.id,
        title: 'Cyberpunk Alley Groove',
        description: 'A gritty, futuristic electronic track with heavy synth bass, driving beats, and atmospheric textures. Evokes neon-lit streets.',
        instrumentation: ['Synthesizer (Lead)', 'Synthesizer (Bass)', 'Drum Machine', 'Sampler'],
        genre: 'Electronic',
        mood: 'Gritty, Energetic',
        tempo: 128,
        keySignature: 'E Minor',
        durationSeconds: 210,
        audioUrl: '/audio/cyberpunk.mp3', // Placeholder
        waveformJson: '{"peaks": [0.3, 0.6, 0.8, 0.7, 0.5, 0.4, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.7, 0.6, 0.5, 0.4], "sampleRate": 44100}',
        midiData: 'data:audio/midi;base64,TVRoZAAAA... (truncated)',
        createdAt: '2023-03-15T18:00:00Z',
        lastModifiedAt: '2023-03-15T18:00:00Z',
        isPublic: true,
        tags: ['electronic', 'synthwave', 'cyberpunk', 'dance', 'futuristic'],
        versionHistory: [
            {
                versionId: generateUniqueId(),
                promptUsed: 'Original prompt for Cyberpunk Alley Groove.',
                parameters: {
                    genre: 'Electronic', mood: 'Gritty', tempoRange: [120, 130], instrumentationPreference: ['Synthesizer (Lead)', 'Synthesizer (Bass)', 'Drum Machine'],
                    durationPreference: [180, 240], keySignaturePreference: 'E Minor', creativityTemperature: 0.8, diversityPenalty: 0.4,
                    model: 'music-model-beta', outputFormat: 'audio'
                },
                generatedAt: '2023-03-15T18:00:00Z',
                audioUrl: '/audio/cyberpunk_v1.mp3',
                notes: 'Initial generation, slightly too chaotic.'
            },
            {
                versionId: generateUniqueId(),
                promptUsed: 'Remix Cyberpunk Alley Groove, add more atmospheric sampler textures and refine the bassline.',
                parameters: {
                    genre: 'Electronic', mood: 'Gritty', tempoRange: [125, 130], instrumentationPreference: ['Synthesizer (Lead)', 'Synthesizer (Bass)', 'Drum Machine', 'Sampler'],
                    durationPreference: [180, 240], keySignaturePreference: 'E Minor', creativityTemperature: 0.75, diversityPenalty: 0.5,
                    model: 'music-model-beta', outputFormat: 'audio'
                },
                generatedAt: '2023-03-16T10:00:00Z',
                audioUrl: '/audio/cyberpunk.mp3',
                notes: 'Second version, improved texture and bass clarity.'
            }
        ],
        remixSourceId: undefined,
        likes: 25,
        comments: [
            { id: generateUniqueId(), userId: 'user-other-2', username: 'BeatMaster', text: 'This slaps! Instant playlist add.', createdAt: '2023-03-16T12:00:00Z', avatarUrl: 'https://i.pravatar.cc/150?img=2' },
            { id: generateUniqueId(), userId: 'user-other-3', username: 'NightRider', text: 'Perfect for driving through a neon city.', createdAt: '2023-03-16T14:30:00Z', avatarUrl: 'https://i.pravatar.cc/150?img=3' },
        ],
        playCount: 250,
        downloadCount: 12,
        modelUsed: 'music-model-beta',
        originalPrompt: 'A gritty, futuristic electronic track with heavy synth bass, driving beats, and atmospheric textures.',
        generationParameters: {
            genre: 'Electronic', mood: 'Gritty, Energetic', tempoRange: [120, 130], instrumentationPreference: ['Synthesizer (Lead)', 'Synthesizer (Bass)', 'Drum Machine', 'Sampler'],
            durationPreference: [180, 240], keySignaturePreference: 'E Minor', creativityTemperature: 0.8, diversityPenalty: 0.4,
            model: 'music-model-beta', outputFormat: 'audio'
        }
    },
    // Add more mock compositions for variety and line count
    {
        id: 'comp-004',
        userId: MOCK_USER.id,
        title: 'Forest Whispers',
        description: 'A tranquil acoustic guitar piece, evoking images of a peaceful forest at dawn with subtle bird sounds.',
        instrumentation: ['Acoustic Guitar', 'Flute (light)', 'Field Recordings (birds, wind)'],
        genre: 'Folk Ambient',
        mood: 'Peaceful, Natural',
        tempo: 70,
        keySignature: 'D Major',
        durationSeconds: 150,
        audioUrl: '/audio/forest.mp3',
        waveformJson: '{"peaks": [0.1, 0.2, 0.3, 0.2, 0.1, 0.05, 0.1, 0.2, 0.3, 0.2, 0.1, 0.05, 0.1, 0.2, 0.1, 0.05], "sampleRate": 44100}',
        createdAt: '2023-03-20T11:00:00Z',
        lastModifiedAt: '2023-03-20T11:00:00Z',
        isPublic: true,
        tags: ['acoustic', 'nature', 'meditative', 'folk'],
        versionHistory: [],
        remixSourceId: undefined,
        likes: 10,
        comments: [],
        playCount: 90,
        downloadCount: 3,
        modelUsed: 'music-model-beta',
        originalPrompt: 'A tranquil acoustic guitar piece, evoking images of a peaceful forest at dawn.',
        generationParameters: {
            genre: 'Folk Ambient', mood: 'Peaceful', tempoRange: [65, 75], instrumentationPreference: ['Acoustic Guitar', 'Flute', 'Field Recordings'],
            durationPreference: [120, 180], keySignaturePreference: 'D Major', creativityTemperature: 0.6, diversityPenalty: 0.8,
            model: 'music-model-beta', outputFormat: 'audio'
        }
    },
    {
        id: 'comp-005',
        userId: MOCK_USER.id,
        title: 'Urban Sunset',
        description: 'A chill-hop track with laid-back drums, warm Rhodes chords, and a soulful bassline, perfect for unwinding after a long day.',
        instrumentation: ['Drums (Hip-Hop)', 'Rhodes Piano', 'Electric Bass', 'Synthesizer (Pad)'],
        genre: 'Lo-Fi Hip-Hop',
        mood: 'Relaxed, Groovy',
        tempo: 90,
        keySignature: 'F Minor',
        durationSeconds: 165,
        audioUrl: '/audio/sunset.mp3',
        waveformJson: '{"peaks": [0.2, 0.4, 0.5, 0.4, 0.3, 0.2, 0.1, 0.2, 0.3, 0.4, 0.5, 0.4, 0.3, 0.2, 0.1, 0.05], "sampleRate": 44100}',
        createdAt: '2023-03-25T17:45:00Z',
        lastModifiedAt: '2023-03-25T17:45:00Z',
        isPublic: false,
        tags: ['lofi', 'chillhop', 'hiphop', 'jazzy', 'relaxing'],
        versionHistory: [],
        remixSourceId: undefined,
        likes: 18,
        comments: [],
        playCount: 150,
        downloadCount: 7,
        modelUsed: 'music-model-beta',
        originalPrompt: 'A chill-hop track with laid-back drums, warm Rhodes chords, and a soulful bassline, perfect for unwinding.',
        generationParameters: {
            genre: 'Lo-Fi Hip-Hop', mood: 'Relaxed', tempoRange: [85, 95], instrumentationPreference: ['Drums', 'Rhodes Piano', 'Electric Bass', 'Synthesizer'],
            durationPreference: [150, 180], keySignaturePreference: 'F Minor', creativityTemperature: 0.7, diversityPenalty: 0.6,
            model: 'music-model-beta', outputFormat: 'audio'
        }
    },
    {
        id: 'comp-006',
        userId: MOCK_USER.id,
        title: 'Ancient Echoes',
        description: 'A powerful cinematic orchestral piece, featuring epic strings, brass, and percussion, building to a dramatic climax.',
        instrumentation: ['Orchestral Strings', 'Brass Ensemble', 'Percussion (Timpani, Taiko)', 'Choir (Subtle)'],
        genre: 'Cinematic',
        mood: 'Epic, Dramatic',
        tempo: 100,
        keySignature: 'D Minor',
        durationSeconds: 300,
        audioUrl: '/audio/ancient.mp3',
        waveformJson: '{"peaks": [0.1, 0.3, 0.6, 0.8, 0.9, 0.7, 0.5, 0.3, 0.2, 0.4, 0.6, 0.8, 0.9, 0.7, 0.5, 0.3], "sampleRate": 44100}',
        createdAt: '2023-03-28T08:00:00Z',
        lastModifiedAt: '2023-03-28T08:00:00Z',
        isPublic: true,
        tags: ['orchestral', 'film score', 'epic', 'soundtrack', 'fantasy'],
        versionHistory: [],
        remixSourceId: undefined,
        likes: 30,
        comments: [
            { id: generateUniqueId(), userId: 'user-other-4', username: 'FilmScorer', text: 'This would be perfect for a fantasy movie trailer!', createdAt: '2023-03-29T10:00:00Z', avatarUrl: 'https://i.pravatar.cc/150?img=4' },
        ],
        playCount: 300,
        downloadCount: 20,
        modelUsed: 'music-model-beta',
        originalPrompt: 'A powerful cinematic orchestral piece, featuring epic strings, brass, and percussion, building to a dramatic climax.',
        generationParameters: {
            genre: 'Cinematic', mood: 'Epic, Dramatic', tempoRange: [90, 110], instrumentationPreference: ['Orchestral Strings', 'Brass Ensemble', 'Percussion', 'Choir'],
            durationPreference: [270, 330], keySignaturePreference: 'D Minor', creativityTemperature: 0.9, diversityPenalty: 0.3,
            model: 'music-model-beta', outputFormat: 'audio'
        }
    },
    // Adding more public compositions from other users for community feed simulation
    {
        id: 'comp-007',
        userId: 'user-other-1',
        title: 'Sunset Drive',
        description: 'Retro synthwave track, perfect for an evening cruise down a virtual highway.',
        instrumentation: ['Analog Synth', 'Drum Machine (80s)', 'Synth Bass'],
        genre: 'Electronic',
        mood: 'Retro, Energetic',
        tempo: 120,
        keySignature: 'C Major',
        durationSeconds: 240,
        audioUrl: '/audio/sunset_drive.mp3', // Placeholder
        waveformJson: '{"peaks": [0.4, 0.6, 0.7, 0.6, 0.5, 0.4, 0.3, 0.4, 0.5, 0.6, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2], "sampleRate": 44100}',
        createdAt: '2023-04-01T10:00:00Z',
        lastModifiedAt: '2023-04-01T10:00:00Z',
        isPublic: true,
        tags: ['synthwave', '80s', 'electronic', 'driving'],
        versionHistory: [],
        remixSourceId: undefined,
        likes: 45,
        comments: [],
        playCount: 400,
        downloadCount: 15,
        modelUsed: 'music-model-beta',
        originalPrompt: 'Retro synthwave track, perfect for an evening cruise down a virtual highway.',
        generationParameters: {
            genre: 'Electronic', mood: 'Retro, Energetic', tempoRange: [115, 125], instrumentationPreference: ['Analog Synth', 'Drum Machine', 'Synth Bass'],
            durationPreference: [200, 280], keySignaturePreference: 'C Major', creativityTemperature: 0.8, diversityPenalty: 0.4,
            model: 'music-model-beta', outputFormat: 'audio'
        }
    },
    {
        id: 'comp-008',
        userId: 'user-other-2',
        title: 'Morning Dew Drops',
        description: 'A delicate and serene piano solo, reminiscent of a calm morning with dew drops on leaves.',
        instrumentation: ['Piano'],
        genre: 'Classical',
        mood: 'Serene, Delicate',
        tempo: 55,
        keySignature: 'F Major',
        durationSeconds: 90,
        audioUrl: '/audio/morning_dew.mp3', // Placeholder
        waveformJson: '{"peaks": [0.05, 0.1, 0.15, 0.1, 0.08, 0.05, 0.02, 0.05, 0.08, 0.1, 0.15, 0.1, 0.08, 0.05, 0.02, 0.01], "sampleRate": 44100}',
        createdAt: '2023-04-05T14:30:00Z',
        lastModifiedAt: '2023-04-05T14:30:00Z',
        isPublic: true,
        tags: ['piano', 'solo', 'calm', 'meditative'],
        versionHistory: [],
        remixSourceId: undefined,
        likes: 20,
        comments: [],
        playCount: 180,
        downloadCount: 8,
        modelUsed: 'music-model-beta',
        originalPrompt: 'A delicate and serene piano solo, reminiscent of a calm morning with dew drops on leaves.',
        generationParameters: {
            genre: 'Classical', mood: 'Serene', tempoRange: [50, 60], instrumentationPreference: ['Piano'],
            durationPreference: [80, 100], keySignaturePreference: 'F Major', creativityTemperature: 0.5, diversityPenalty: 0.9,
            model: 'music-model-beta', outputFormat: 'audio'
        }
    },
    {
        id: 'comp-009',
        userId: 'user-other-3',
        title: 'The Great Journey',
        description: 'An uplifting orchestral piece with powerful swells and soaring melodies, ideal for adventure themes.',
        instrumentation: ['Strings', 'Brass', 'Woodwinds', 'Percussion', 'Choir'],
        genre: 'Cinematic',
        mood: 'Uplifting, Adventurous',
        tempo: 110,
        keySignature: 'A Major',
        durationSeconds: 270,
        audioUrl: '/audio/journey.mp3', // Placeholder
        waveformJson: '{"peaks": [0.2, 0.4, 0.6, 0.8, 0.9, 0.8, 0.7, 0.5, 0.3, 0.5, 0.7, 0.9, 0.8, 0.6, 0.4, 0.2], "sampleRate": 44100}',
        createdAt: '2023-04-10T11:00:00Z',
        lastModifiedAt: '2023-04-10T11:00:00Z',
        isPublic: true,
        tags: ['orchestral', 'adventure', 'epic', 'soundtrack'],
        versionHistory: [],
        remixSourceId: undefined,
        likes: 55,
        comments: [],
        playCount: 500,
        downloadCount: 25,
        modelUsed: 'music-model-beta',
        originalPrompt: 'An uplifting orchestral piece with powerful swells and soaring melodies, ideal for adventure themes.',
        generationParameters: {
            genre: 'Cinematic', mood: 'Uplifting', tempoRange: [100, 120], instrumentationPreference: ['Strings', 'Brass', 'Woodwinds', 'Percussion', 'Choir'],
            durationPreference: [240, 300], keySignaturePreference: 'A Major', creativityTemperature: 0.85, diversityPenalty: 0.35,
            model: 'music-model-beta', outputFormat: 'audio'
        }
    },
];

export const MOCK_PROJECTS_DATA: Project[] = [
    {
        id: 'proj-001',
        userId: MOCK_USER.id,
        name: 'Ambient Explorations',
        description: 'A collection of ambient and atmospheric soundscapes, focusing on pads and evolving textures.',
        compositionIds: ['comp-001', 'comp-004'],
        createdAt: '2023-03-01T10:00:00Z',
        lastModifiedAt: '2023-03-20T11:00:00Z',
        isShared: false,
    },
    {
        id: 'proj-002',
        userId: MOCK_USER.id,
        name: 'Daily Compositions',
        description: 'Quick ideas and daily musical sketches. Experimental and varied genres.',
        compositionIds: ['comp-002', 'comp-005'],
        createdAt: '2023-03-05T14:00:00Z',
        lastModifiedAt: '2023-03-25T17:45:00Z',
        isShared: true,
        sharedWithUserIds: ['user-other-1'],
    },
    {
        id: 'proj-003',
        userId: MOCK_USER.id,
        name: 'Game Soundtrack Ideas',
        description: 'Working on themes for a sci-fi game. Focus on electronic and cinematic tracks.',
        compositionIds: ['comp-003', 'comp-006'],
        createdAt: '2023-03-10T09:00:00Z',
        lastModifiedAt: '2023-03-28T08:00:00Z',
        isShared: false,
    },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
    { id: generateUniqueId(), type: 'success', message: 'Composition "Rainy Day Reverie" saved successfully!', timestamp: '2023-04-01T10:00:00Z', isRead: false },
    { id: generateUniqueId(), type: 'new_like', message: 'Someone liked "Echoes of a Forgotten Star".', timestamp: '2023-04-01T11:30:00Z', isRead: false, link: '/composition/comp-001', icon: `<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>` },
    { id: generateUniqueId(), type: 'system', message: 'New update available: improved music generation models!', timestamp: '2023-04-01T12:00:00Z', isRead: true, icon: `<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>` },
    { id: generateUniqueId(), type: 'error', message: 'Failed to generate music: API rate limit exceeded.', timestamp: '2023-04-01T12:05:00Z', isRead: false },
    { id: generateUniqueId(), type: 'new_comment', message: 'New comment on "Cyberpunk Alley Groove".', timestamp: '2023-04-01T13:00:00Z', isRead: false, link: '/composition/comp-003', icon: `<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"></path></svg>` },
    { id: generateUniqueId(), type: 'update_available', message: 'Sonic Alchemy v2.0 is live! Check out new features!', timestamp: '2023-04-02T09:00:00Z', isRead: false, icon: `<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9H9V7h2v2z"></path></svg>` },
];

export const MOCK_USER_STATS: UserStats = {
    totalCompositions: 6,
    publicCompositions: 4,
    totalPlaybacks: 840,
    totalLikesReceived: 88,
    last7DaysGenerations: [2, 1, 3, 0, 2, 1, 4], // Example: Mon-Sun
    mostUsedGenre: 'Electronic',
    mostUsedInstrument: 'Synthesizer',
    totalTokensOwned: 50000, // Initial mock financial value
    totalTransactions: 10,
};

// Seed initial balances for MOCK_USER
programmableTokenRailService.mintTokens('system', programmableTokenRailService.getTokenMetadata('SA-Credit')?.id || '', MOCK_USER_STATS.totalTokensOwned, MOCK_USER.id);


// Reusable UI components (exported for potential external use)
// These will be simple wrapper components to avoid creating new files but add structure.

/**
 * Renders a stylized section header for UI components.
 * Business impact: Improves user experience by providing clear navigational cues and organizational structure,
 * making complex financial data and functionalities easily digestible and accessible.
 */
export const ExportedSectionHeader: React.FC<{ title: string; subtitle?: string; className?: string }> = React.memo(({ title, subtitle, className }) => (
    <div className={`mb-4 ${className}`}>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
    </div>
));

/**
 * Renders a styled input field or textarea.
 * Business impact: Provides a consistent and user-friendly interface for data entry,
 * critical for accurate input of financial parameters, transaction details, or policy configurations.
 */
export const ExportedInput: React.FC<{ label: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; type?: string; placeholder?: string; rows?: number; name?: string; disabled?: boolean; className?: string; }> = React.memo(({ label, value, onChange, type = 'text', placeholder, rows, name, disabled, className }) => (
    <div className="mb-4">
        {label && <label htmlFor={name} className="block text-gray-300 text-sm font-bold mb-2">{label}</label>}
        {rows ? (
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                rows={rows}
                placeholder={placeholder}
                disabled={disabled}
                className={`shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700/50 text-white leading-tight focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
            />
        ) : (
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700/50 text-white leading-tight focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
            />
        )}
    </div>
));

/**
 * Renders a styled select dropdown.
 * Business impact: Offers intuitive selection of predefined options, crucial for configuring
 * financial parameters, selecting programmable rails, or setting governance policies, reducing input errors.
 */
export const ExportedSelect: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: { value: string; label: string }[]; name?: string; disabled?: boolean; tooltip?: string; }> = React.memo(({ label, value, onChange, options, name, disabled, tooltip }) => (
    <div className="mb-4" title={tooltip}>
        {label && <label htmlFor={name} className="block text-gray-300 text-sm font-bold mb-2">{label}</label>}
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700/50 text-white leading-tight focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    </div>
));

/**
 * Renders a styled slider input.
 * Business impact: Provides an interactive way to adjust continuous parameters,
 * such as risk thresholds or processing fees, enabling fine-grained control over financial operations.
 */
export const ExportedSlider: React.FC<{ label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min: number; max: number; step: number; displayValue?: string | number; name?: string; disabled?: boolean; tooltip?: string; }> = React.memo(({ label, value, onChange, min, max, step, displayValue, name, disabled, tooltip }) => (
    <div className="mb-4" title={tooltip}>
        {label && <label htmlFor={name} className="block text-gray-300 text-sm font-bold mb-2">{label}: <span className="text-cyan-300">{displayValue ?? value}</span></label>}
        <input
            id={name}
            name={name}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        />
    </div>
));

/**
 * Renders a styled checkbox input.
 * Business impact: Enables toggling of boolean settings and preferences,
 * such as auto-save or notification preferences, enhancing user control over platform behavior.
 */
export const ExportedCheckbox: React.FC<{ label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; name?: string; disabled?: boolean; }> = React.memo(({ label, checked, onChange, name, disabled }) => (
    <div className="flex items-center mb-4">
        <input
            id={name}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={`form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        />
        {label && <label htmlFor={name} className="ml-2 text-gray-300 text-sm cursor-pointer">{label}</label>}
    </div>
));

/**
 * Renders a styled button.
 * Business impact: Provides primary action triggers across the UI,
 * enabling users to initiate critical financial operations or configuration changes confidently.
 */
export const ExportedButton: React.FC<{ onClick: () => void; disabled?: boolean; children: React.ReactNode; className?: string; type?: 'button' | 'submit' | 'reset'; }> = React.memo(({ onClick, disabled, children, className, type = 'button' }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`py-2 px-4 rounded transition-colors duration-200 flex items-center justify-center whitespace-nowrap ${disabled ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-700 text-white'} ${className}`}
    >
        {children}
    </button>
));

/**
 * Renders a styled icon button, often with a tooltip.
 * Business impact: Provides compact and visually appealing controls for common actions,
 * enhancing usability without cluttering the interface, especially for navigation or quick settings.
 */
export const ExportedIconButton: React.FC<{ onClick: () => void; disabled?: boolean; icon: React.ReactNode; label?: string; className?: string; tooltip?: string; }> = React.memo(({ onClick, disabled, icon, label, className, tooltip }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`p-2 rounded-full transition-colors duration-200 flex items-center justify-center ${disabled ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed' : 'bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300'} ${className}`}
        title={tooltip || label}
    >
        {icon}
        {label && <span className="ml-2 text-sm hidden sm:inline">{label}</span>}
    </button>
));

/**
 * Renders a styled modal dialog.
 * Business impact: Centralizes user focus for critical interactions, such as confirming transactions,
 * updating settings, or viewing detailed reports, ensuring user attention to important information.
 */
export const ExportedModal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; }> = React.memo(({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <ExportedIconButton
                        onClick={onClose}
                        icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>}
                        className="!bg-transparent hover:!bg-gray-700 !text-gray-400"
                        tooltip="Close"
                    />
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
});

/**
 * Renders a loading spinner with an optional message.
 * Business impact: Provides clear visual feedback during asynchronous operations like AI generation or transaction processing,
 * improving user experience by indicating system activity and managing expectations.
 */
export const ExportedLoadingSpinner: React.FC<{ className?: string; message?: string }> = React.memo(({ className, message }) => (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        {message && <p className="mt-4 text-gray-400">{message}</p>}
    </div>
));

/**
 * Interface for the notification context.
 */
interface NotificationContextType {
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
    removeNotification: (id: string) => void;
    markNotificationAsRead: (id: string) => void;
    notifications: Notification[];
}

/**
 * React context for managing global notifications.
 * Business impact: Centralizes communication of system events, alerts, and critical updates
 * to users, ensuring timely awareness of financial transaction statuses, agent activities,
 * and security concerns, leading to better decision-making and operational control.
 */
export const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

/**
 * Provides a global notification system for the application.
 * Business impact: Enhances operational transparency by delivering real-time alerts and status updates,
 * enabling users to monitor key financial events and agent actions, improving responsiveness and trust.
 */
export const ExportedNotificationProvider: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
        const newNotification: Notification = {
            ...notification,
            id: generateUniqueId(),
            timestamp: new Date().toISOString(),
            isRead: false,
        };
        setNotifications(prev => [...prev, newNotification]);
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const markNotificationAsRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, markNotificationAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
});

/**
 * Custom hook to access the notification context.
 * Business impact: Simplifies integration of the notification system into various UI components,
 * promoting consistent and efficient display of critical information throughout the application.
 */
export const useNotifications = () => {
    const context = React.useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within an ExportedNotificationProvider');
    }
    return context;
};

/**
 * Renders an individual notification toast.
 * Business impact: Delivers transient, actionable information to users without interrupting workflow,
 * facilitating quick responses to system events or transaction updates.
 */
export const ExportedNotificationToast: React.FC<{ notification: Notification }> = React.memo(({ notification }) => {
    const { removeNotification, markNotificationAsRead } = useNotifications();
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => removeNotification(notification.id), 500); // Fade out then remove
        }, 8000); // Notifications disappear after 8 seconds
        return () => clearTimeout(timer);
    }, [notification.id, removeNotification]);

    const getColors = (type: Notification['type']) => {
        switch (type) {
            case 'success': return 'bg-green-600 border-green-700';
            case 'error': return 'bg-red-600 border-red-700';
            case 'info': return 'bg-blue-600 border-blue-700';
            case 'warning': return 'bg-orange-600 border-orange-700';
            case 'new_like':
            case 'new_comment':
            case 'system':
            case 'update_available':
            case 'transaction_alert':
            case 'agent_action':
            default: return 'bg-cyan-600 border-cyan-700';
        }
    };

    if (!isVisible) return null;

    return (
        <div
            className={`relative p-4 mb-2 rounded shadow-lg text-white transition-all duration-300 ease-out ${getColors(notification.type)} ${notification.isRead ? 'opacity-60' : 'opacity-100'} ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
            role="alert"
        >
            <div className="flex items-center">
                {notification.icon && <span className="mr-2" dangerouslySetInnerHTML={{ __html: notification.icon }}></span>}
                <p className="font-semibold">{notification.message}</p>
            </div>
            <p className="text-xs text-gray-200 mt-1">{new Date(notification.timestamp).toLocaleTimeString()}</p>
            {!notification.isRead && (
                <ExportedButton
                    onClick={() => markNotificationAsRead(notification.id)}
                    className="mt-2 text-xs bg-white/20 hover:bg-white/30 !py-1 !px-2"
                >
                    Mark as Read
                </ExportedButton>
            )}
            <ExportedIconButton
                onClick={() => removeNotification(notification.id)}
                icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>}
                className="absolute top-2 right-2 !bg-transparent hover:!bg-white/20 !text-white !p-1"
                tooltip="Dismiss"
            />
        </div>
    );
});

/**
 * Renders a tray for displaying recent notifications.
 * Business impact: Aggregates and displays critical system events in a non-intrusive manner,
 * ensuring users are always informed about the state of their financial operations and agent activities.
 */
export const ExportedNotificationTray: React.FC = React.memo(() => {
    const { notifications } = useNotifications();
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="fixed bottom-20 right-4 z-50 w-full max-w-xs"> {/* Adjusted bottom for player */}
            {notifications.slice(-3).reverse().map(n => ( // Show last 3 notifications
                <ExportedNotificationToast key={n.id} notification={n} />
            ))}
            {unreadCount > 0 && (
                <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                </div>
            )}
        </div>
    );
});


/**
 * The main `SonicAlchemyView` component, serving as the central hub for the digital finance platform.
 * Business impact: This component represents the user-facing gateway to the entire financial infrastructure,
 * integrating AI-driven content generation with advanced financial controls. It provides a unified experience
 * for creating, managing, and monetizing digital assets, driving user engagement and generating new revenue streams.
 */
const SonicAlchemyView: React.FC = () => {
    // Core application states
    const [prompt, setPrompt] = useState('a melancholic but hopeful piano piece for a rainy day');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<Composition | null>(null);
    const [isPlaying, setIsPlaying] = useState(false); // Global playback state

    // Advanced Prompt Parameters
    const [currentGenre, setCurrentGenre] = useState<string>('Ambient');
    const [currentMood, setCurrentMood] = useState<string>('Ethereal');
    const [currentTempo, setCurrentTempo] = useState<number>(100); // BPM
    const [currentDuration, setCurrentDuration] = useState<number>(180); // seconds
    const [currentKey, setCurrentKey] = useState<string>('C Major');
    const [currentInstruments, setCurrentInstruments] = useState<string[]>(['Synthesizer', 'Pad']);
    const [creativityTemperature, setCreativityTemperature] = useState<number>(0.7);
    const [diversityPenalty, setDiversityPenalty] = useState<number>(0.5);
    const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash'); // Placeholder for multiple models
    const [selectedOutputFormat, setSelectedOutputFormat] = useState<GenerationParameters['outputFormat']>('description');
    const [styleReferenceId, setStyleReferenceId] = useState<string | undefined>(undefined);

    // User and data management states
    const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USER);
    const [compositions, setCompositions] = useState<Composition[]>(MOCK_COMPOSITIONS_DATA);
    const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS_DATA);
    const [appSettings, setAppSettings] = useState<AppSettings>({
        theme: 'dark',
        defaultGenre: 'Ambient',
        defaultInstrumentation: ['Piano'],
        autoSave: true,
        notificationsEnabled: true,
        audioQuality: 'medium',
        defaultOutputFormat: 'audio',
        onboardingComplete: false,
        defaultCurrencyTokenId: programmableTokenRailService.getTokenMetadata('SA-Credit')?.id || '', // Link default currency
    });
    const [playbackState, setPlaybackState] = useState<PlaybackState>({
        currentCompositionId: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 0.8,
        isMuted: false,
        loop: false,
        shuffle: false,
        playbackSpeed: 1.0,
        reverbAmount: 0.0,
        delayAmount: 0.0,
    });
    const [userStats, setUserStats] = useState<UserStats>(MOCK_USER_STATS);

    // Financial Transaction States
    const [showFinancialModal, setShowFinancialModal] = useState(false);
    const [transactionRecipientId, setTransactionRecipientId] = useState('');
    const [transactionAmount, setTransactionAmount] = useState(0);
    const [transactionTokenId, setTransactionTokenId] = useState(appSettings.defaultCurrencyTokenId);
    const [transactionMemo, setTransactionMemo] = useState('');
    const [transactionStatus, setTransactionStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);


    // UI State for modals/panels
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showProjectsModal, setShowProjectsModal] = useState(false); // Not used currently, using activeTab 'projects'
    const [showUserProfileModal, setShowUserProfileModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [compositionToShare, setCompositionToShare] = useState<Composition | null>(null);
    const [activeTab, setActiveTab] = useState<'generate' | 'my_compositions' | 'community_feed' | 'projects' | 'finance' | 'agents' | 'audit'>('generate');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGenre, setFilterGenre] = useState('All');
    const [filterMood, setFilterMood] = useState('All');
    const [projectFilterId, setProjectFilterId] = useState<string | null>(null); // For filtering compositions by project

    // Generation progress states
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [generateProgress, setGenerateProgress] = useState(0); // 0-100
    const [generationStatusMessage, setGenerationStatusMessage] = useState('');

    // Notification hook
    const { addNotification } = useNotifications();

    // Available options for dropdowns/sliders (exported for potential external use)
    export const GENRES = ['Ambient', 'Electronic', 'Classical Crossover', 'Lo-Fi Hip-Hop', 'Cinematic', 'Jazz', 'Rock', 'Pop', 'Folk Ambient', 'Experimental'];
    export const MOODS = ['Ethereal', 'Melancholic', 'Hopeful', 'Gritty', 'Energetic', 'Peaceful', 'Relaxed', 'Dramatic', 'Uplifting', 'Calm', 'Mysterious', 'Tense'];
    export const INSTRUMENTS = ['Piano', 'Synthesizer', 'Pad', 'Drums', 'Bass', 'Violin', 'Cello', 'Acoustic Guitar', 'Electric Guitar', 'Flute', 'Brass Ensemble', 'Percussion', 'Rhodes Piano', 'Drum Machine', 'Sampler', 'Choir', 'Woodwinds'];
    export const KEY_SIGNATURES = ['C Major', 'G Major', 'D Major', 'A Major', 'E Major', 'B Major', 'F# Major', 'Db Major', 'Ab Major', 'Eb Major', 'Bb Major', 'F Major', 'A Minor', 'E Minor', 'B Minor', 'F# Minor', 'C# Minor', 'G# Minor', 'D# Minor', 'Bb Minor', 'F Minor', 'C Minor', 'G Minor', 'D Minor'];
    export const GENERATION_MODELS = [
        { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Text Description)' },
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Advanced Text Description)' },
        { value: 'sonic-synth-v1', label: 'SonicSynth v1 (Audio Gen - Beta)' }, // Simulated audio generation model
        { value: 'midi-composer-alpha', label: 'MIDI Composer Alpha (MIDI Output)' }, // Simulated MIDI generation model
    ];
    export const OUTPUT_FORMATS = [
        { value: 'description', label: 'Text Description Only' },
        { value: 'audio', label: 'Audio File (MP3/WAV)' },
        { value: 'midi', label: 'MIDI File' },
    ];
    export const PLAYBACK_SPEED_OPTIONS = [
        { value: 0.5, label: '0.5x' },
        { value: 0.75, label: '0.75x' },
        { value: 1.0, label: '1.0x (Normal)' },
        { value: 1.25, label: '1.25x' },
        { value: 1.5, label: '1.5x' },
    ];


    // --- Data Management Functions (CRUD for Compositions and Projects) ---

    /**
     * Handles saving a composition, either creating a new one or updating an existing one.
     * Business impact: Manages the persistence of creative assets, ensuring user work is secured
     * and accessible, which directly contributes to user retention and platform value.
     * @param composition The composition data to save.
     * @param isNew Flag indicating if it's a new composition.
     * @returns Promise resolving to true if successful, false otherwise.
     */
    export const handleSaveComposition = useCallback(async (composition: Composition, isNew: boolean = false) => {
        setIsLoading(true);
        try {
            await delay(1000); // Simulate API call
            setCompositions(prev => {
                const existingIndex = prev.findIndex(c => c.id === composition.id);
                if (existingIndex > -1) {
                    const updated = [...prev];
                    updated[existingIndex] = { ...composition, lastModifiedAt: new Date().toISOString() };
                    addNotification({ type: 'success', message: `Composition "${composition.title}" updated.` });
                    addAuditLogEntry(currentUser.id, 'composition.updated', { compositionId: composition.id, title: composition.title }, digitalIdentityService.getPrivateKey(currentUser.id));
                    return updated;
                } else {
                    addNotification({ type: 'success', message: `Composition "${composition.title}" saved to your library.` });
                    const newComposition = { ...composition, id: generateUniqueId(), userId: currentUser.id, createdAt: new Date().toISOString(), lastModifiedAt: new Date().toISOString() };
                    addAuditLogEntry(currentUser.id, 'composition.created', { compositionId: newComposition.id, title: newComposition.title }, digitalIdentityService.getPrivateKey(currentUser.id));
                    return [...prev, newComposition];
                }
            });
            setUserStats(prev => ({ ...prev, totalCompositions: prev.totalCompositions + (isNew ? 1 : 0) }));
            return true;
        } catch (error) {
            console.error('Failed to save composition:', error);
            addNotification({ type: 'error', message: `Failed to save "${composition.title}".` });
            addAuditLogEntry(currentUser.id, 'composition.save_failed', { compositionId: composition.id, title: composition.title, error: (error as Error).message }, digitalIdentityService.getPrivateKey(currentUser.id));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [addNotification, currentUser.id]);

    /**
     * Handles deleting a composition.
     * Business impact: Provides users with control over their digital assets,
     * ensuring proper data hygiene and compliance with data retention policies.
     * @param id The ID of the composition to delete.
     * @returns Promise resolving to true if successful, false otherwise.
     */
    export const handleDeleteComposition = useCallback(async (id: string) => {
        setIsLoading(true);
        try {
            await delay(500); // Simulate API call
            setCompositions(prev => prev.filter(c => c.id !== id));
            setProjects(prevProjects => prevProjects.map(p => ({
                ...p,
                compositionIds: p.compositionIds.filter(comp_id => comp_id !== id)
            })));
            if (playbackState.currentCompositionId === id) {
                setPlaybackState(prev => ({ ...prev, currentCompositionId: null, isPlaying: false, currentTime: 0, duration: 0 }));
            }
            addNotification({ type: 'info', message: 'Composition deleted.' });
            addAuditLogEntry(currentUser.id, 'composition.deleted', { compositionId: id }, digitalIdentityService.getPrivateKey(currentUser.id));
            setUserStats(prev => ({ ...prev, totalCompositions: prev.totalCompositions - 1 }));
            return true;
        } catch (error) {
            console.error('Failed to delete composition:', error);
            addNotification({ type: 'error', message: 'Failed to delete composition.' });
            addAuditLogEntry(currentUser.id, 'composition.delete_failed', { compositionId: id, error: (error as Error).message }, digitalIdentityService.getPrivateKey(currentUser.id));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [addNotification, playbackState.currentCompositionId, currentUser.id]);

    /**
     * Handles creating a new project.
     * Business impact: Facilitates organization and collaboration around digital asset collections,
     * enhancing productivity and enabling team-based financial product development.
     * @param name Name of the new project.
     * @param description Description of the new project.
     * @returns Promise resolving to true if successful, false otherwise.
     */
    export const handleCreateProject = useCallback(async (name: string, description: string) => {
        setIsLoading(true);
        try {
            await delay(800);
            const newProject: Project = {
                id: generateUniqueId(),
                userId: currentUser.id,
                name,
                description,
                compositionIds: [],
                createdAt: new Date().toISOString(),
                lastModifiedAt: new Date().toISOString(),
                isShared: false,
            };
            setProjects(prev => [...prev, newProject]);
            addNotification({ type: 'success', message: `Project "${name}" created.` });
            addAuditLogEntry(currentUser.id, 'project.created', { projectId: newProject.id, name: newProject.name }, digitalIdentityService.getPrivateKey(currentUser.id));
            return true;
        } catch (error) {
            console.error('Failed to create project:', error);
            addNotification({ type: 'error', message: `Failed to create project "${name}".` });
            addAuditLogEntry(currentUser.id, 'project.create_failed', { name, error: (error as Error).message }, digitalIdentityService.getPrivateKey(currentUser.id));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [addNotification, currentUser.id]);

    /**
     * Handles updating an existing project.
     * Business impact: Ensures project details and organizational structures remain current,
     * supporting dynamic project management and continuous collaboration.
     * @param updatedProject The updated project data.
     * @returns Promise resolving to true if successful, false otherwise.
     */
    export const handleUpdateProject = useCallback(async (updatedProject: Project) => {
        setIsLoading(true);
        try {
            await delay(800);
            setProjects(prev => prev.map(p => p.id === updatedProject.id ? { ...updatedProject, lastModifiedAt: new Date().toISOString() } : p));
            addNotification({ type: 'success', message: `Project "${updatedProject.name}" updated.` });
            addAuditLogEntry(currentUser.id, 'project.updated', { projectId: updatedProject.id, name: updatedProject.name }, digitalIdentityService.getPrivateKey(currentUser.id));
            return true;
        } catch (error) {
            console.error('Failed to update project:', error);
            addNotification({ type: 'error', message: `Failed to update project "${updatedProject.name}".` });
            addAuditLogEntry(currentUser.id, 'project.update_failed', { projectId: updatedProject.id, name: updatedProject.name, error: (error as Error).message }, digitalIdentityService.getPrivateKey(currentUser.id));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [addNotification, currentUser.id]);

    /**
     * Handles deleting a project.
     * Business impact: Provides comprehensive project lifecycle management,
     * allowing for the retirement of projects and associated assets.
     * @param id The ID of the project to delete.
     * @returns Promise resolving to true if successful, false otherwise.
     */
    export const handleDeleteProject = useCallback(async (id: string) => {
        setIsLoading(true);
        try {
            await delay(500);
            setProjects(prev => prev.filter(p => p.id !== id));
            addNotification({ type: 'info', message: 'Project deleted.' });
            addAuditLogEntry(currentUser.id, 'project.deleted', { projectId: id }, digitalIdentityService.getPrivateKey(currentUser.id));
            return true;
        } catch (error) {
            console.error('Failed to delete project:', error);
            addNotification({ type: 'error', message: 'Failed to delete project.' });
            addAuditLogEntry(currentUser.id, 'project.delete_failed', { projectId: id, error: (error as Error).message }, digitalIdentityService.getPrivateKey(currentUser.id));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [addNotification, currentUser.id]);

    /**
     * Handles adding or removing a composition from a project.
     * Business impact: Allows dynamic organization of digital assets within projects,
     * supporting flexible project management and content curation.
     * @param projectId The ID of the project.
     * @param compId The ID of the composition.
     * @param add True to add, false to remove.
     * @returns Promise resolving to true if successful, false otherwise.
     */
    export const handleAddRemoveCompToProject = useCallback(async (projectId: string, compId: string, add: boolean) => {
        setIsLoading(true);
        try {
            await delay(300);
            setProjects(prev => prev.map(p => {
                if (p.id === projectId) {
                    const newCompIds = add
                        ? [...new Set([...p.compositionIds, compId])] // Add unique
                        : p.compositionIds.filter(id => id !== compId); // Remove
                    return { ...p, compositionIds: newCompIds, lastModifiedAt: new Date().toISOString() };
                }
                return p;
            }));
            addNotification({ type: 'success', message: `Composition ${add ? 'added to' : 'removed from'} project.` });
            addAuditLogEntry(currentUser.id, `project.composition.${add ? 'added' : 'removed'}`, { projectId, compositionId: compId }, digitalIdentityService.getPrivateKey(currentUser.id));
            return true;
        } catch (error) {
            console.error('Failed to update project compositions:', error);
            addNotification({ type: 'error', message: `Failed to ${add ? 'add' : 'remove'} composition.` });
            addAuditLogEntry(currentUser.id, `project.composition.update_failed`, { projectId, compositionId: compId, action: add ? 'add' : 'remove', error: (error as Error).message }, digitalIdentityService.getPrivateKey(currentUser.id));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [addNotification, currentUser.id]);

    // --- AI Generation Logic ---

    /**
     * Initiates the AI music generation process based on user prompt and parameters.
     * Business impact: This is a core value driver, enabling users to rapidly create new digital assets.
     * It showcases the platform's AI capabilities, generating unique and commercially valuable content.
     */
    export const handleGenerate = async () => {
        if (prompt.trim().length === 0) {
            addNotification({ type: 'warning', message: 'Please enter a prompt to generate music.' });
            return;
        }

        setIsLoading(true);
        setGenerateProgress(0);
        setGenerationStatusMessage('Initializing AI composer...');
        setResult(null); // Clear previous result

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const generationParameters: GenerationParameters = {
                genre: currentGenre,
                mood: currentMood,
                tempoRange: [currentTempo - 20, currentTempo + 20], // Example range
                instrumentationPreference: currentInstruments,
                durationPreference: [currentDuration - 30, currentDuration + 30],
                keySignaturePreference: currentKey,
                creativityTemperature: creativityTemperature,
                diversityPenalty: diversityPenalty,
                model: selectedModel,
                outputFormat: selectedOutputFormat,
                styleReferenceId: styleReferenceId,
            };

            const fullPrompt = `You are a music composer AI named Sonic Alchemy. A user wants a piece of music. Based on their prompt, and the following detailed parameters, generate a title, a short description of the piece, and list the primary instrumentation. Also suggest a specific tempo, key, and duration.
            User Prompt: "${prompt}"
            Desired Genre: "${generationParameters.genre}"
            Desired Mood: "${generationParameters.mood}"
            Preferred Instruments: "${generationParameters.instrumentationPreference.join(', ')}"
            Target Tempo: Around ${generationParameters.tempoRange[0]}-${generationParameters.tempoRange[1]} BPM
            Target Duration: Around ${formatDuration(generationParameters.durationPreference[0])}-${formatDuration(generationParameters.durationPreference[1])}
            Key Preference: "${generationParameters.keySignaturePreference}"
            Creativity Level: ${generationParameters.creativityTemperature.toFixed(2)} (higher means more adventurous, range 0.1-1.0)
            Diversity Penalty: ${generationParameters.diversityPenalty.toFixed(2)} (higher means less repetitive, range 0.0-2.0)
            Output Type: ${capitalize(generationParameters.outputFormat)}
            ${generationParameters.styleReferenceId ? `Style Reference Composition ID: ${generationParameters.styleReferenceId}` : ''}
            
            Format your response as a JSON object with properties: 'title' (string), 'description' (string), 'instrumentation' (array of strings), 'suggestedTempo' (number), 'suggestedKey' (string), 'suggestedDurationSeconds' (number). Ensure instrumentation includes actual instruments. If the output type is 'audio' or 'midi', also include 'simulatedAudioUrl' (string) and/or 'simulatedMidiData' (string, base64 encoded dummy).`;

            // Simulate text generation progress
            const textGenerationDuration = selectedModel.includes('gemini') ? 2000 : 1000;
            const textGenerationInterval = setInterval(() => {
                setGenerateProgress(prev => Math.min(prev + (100 / (textGenerationDuration / 100)), 30));
                setGenerationStatusMessage('Analyzing prompt and parameters...');
            }, 100);
            await delay(textGenerationDuration);
            clearInterval(textGenerationInterval);
            setGenerateProgress(30);
            setGenerationStatusMessage('Drafting musical ideas...');

            const response = await ai.models.generateContent({
                model: selectedModel.includes('gemini') ? selectedModel : 'gemini-2.5-flash', // Use text model for description, regardless of selected model
                contents: fullPrompt,
                config: { responseMimeType: "application/json" }
            });

            const parsedResponse = JSON.parse(response.text);

            let newComposition: Composition;
            const baseAudioUrl = `/api/generate-audio?id=${generateUniqueId()}`;
            const baseMidiData = `data:audio/midi;base64,TVRoZAAAA${generateUniqueId()}...`; // Dummy Base64 MIDI

            // Update progress and status based on output format
            if (generationParameters.outputFormat === 'audio' && selectedModel.includes('sonic-synth')) {
                setIsGeneratingAudio(true);
                setGenerateProgress(30); // Start audio generation from 30%
                setGenerationStatusMessage('Synthesizing high-fidelity audio...');
                const audioGenerationDuration = 10000; // 10 seconds for audio
                const audioGenerationInterval = setInterval(() => {
                    setGenerateProgress(prev => Math.min(prev + (70 / (audioGenerationDuration / 100)), 100)); // Remaining 70% for audio
                }, 100);
                await delay(audioGenerationDuration);
                clearInterval(audioGenerationInterval);
                setGenerateProgress(100);
                setIsGeneratingAudio(false);
                setGenerationStatusMessage('Audio synthesis complete!');

                newComposition = {
                    id: generateUniqueId(),
                    userId: currentUser.id,
                    title: parsedResponse.title || 'Untitled Composition',
                    description: parsedResponse.description || 'A new soundscape.',
                    instrumentation: parsedResponse.instrumentation || [],
                    genre: currentGenre,
                    mood: currentMood,
                    tempo: parsedResponse.suggestedTempo || currentTempo,
                    keySignature: parsedResponse.suggestedKey || currentKey,
                    durationSeconds: parsedResponse.suggestedDurationSeconds || currentDuration,
                    audioUrl: baseAudioUrl,
                    waveformJson: JSON.stringify({ peaks: Array.from({ length: 32 }, () => Math.random() * 0.8 + 0.1), sampleRate: 44100 }), // More detailed random waveform
                    midiData: baseMidiData, // Simulate MIDI also generated
                    createdAt: new Date().toISOString(),
                    lastModifiedAt: new Date().toISOString(),
                    isPublic: currentUser.allowPublicGenerations,
                    tags: [],
                    versionHistory: [{
                        versionId: generateUniqueId(),
                        promptUsed: fullPrompt,
                        parameters: generationParameters,
                        generatedAt: new Date().toISOString(),
                        audioUrl: baseAudioUrl,
                        midiUrl: `/api/midi?id=${generateUniqueId()}`, // Simulated MIDI URL
                        notes: 'Initial audio generation from prompt.'
                    }],
                    likes: 0,
                    comments: [],
                    playCount: 0,
                    downloadCount: 0,
                    modelUsed: selectedModel,
                    originalPrompt: prompt,
                    generationParameters: generationParameters,
                };
            } else if (generationParameters.outputFormat === 'midi' && selectedModel.includes('midi-composer')) {
                setIsGeneratingAudio(true); // Re-using for general generation
                setGenerateProgress(30);
                setGenerationStatusMessage('Composing MIDI sequences...');
                await delay(5000); // 5 seconds for MIDI generation
                setGenerateProgress(100);
                setIsGeneratingAudio(false);
                setGenerationStatusMessage('MIDI composition complete!');

                newComposition = {
                    id: generateUniqueId(),
                    userId: currentUser.id,
                    title: parsedResponse.title || 'Untitled MIDI Composition',
                    description: parsedResponse.description || 'A new MIDI sequence.',
                    instrumentation: parsedResponse.instrumentation || [],
                    genre: currentGenre,
                    mood: currentMood,
                    tempo: parsedResponse.suggestedTempo || currentTempo,
                    keySignature: parsedResponse.suggestedKey || currentKey,
                    durationSeconds: parsedResponse.suggestedDurationSeconds || currentDuration,
                    audioUrl: '', // No direct audio, could synthesize later
                    waveformJson: '{"peaks": [], "sampleRate": 0}',
                    midiData: baseMidiData,
                    createdAt: new Date().toISOString(),
                    lastModifiedAt: new Date().toISOString(),
                    isPublic: currentUser.allowPublicGenerations,
                    tags: ['midi', 'experimental'],
                    versionHistory: [{
                        versionId: generateUniqueId(),
                        promptUsed: fullPrompt,
                        parameters: generationParameters,
                        generatedAt: new Date().toISOString(),
                        audioUrl: '',
                        midiUrl: `/api/midi?id=${generateUniqueId()}`,
                        notes: 'Initial MIDI generation from prompt.'
                    }],
                    likes: 0,
                    comments: [],
                    playCount: 0,
                    downloadCount: 0,
                    modelUsed: selectedModel,
                    originalPrompt: prompt,
                    generationParameters: generationParameters,
                };
            }
            else {
                // For text-only or unsupported audio/midi models
                setGenerateProgress(100);
                setGenerationStatusMessage('Music description generated.');
                newComposition = {
                    id: generateUniqueId(),
                    userId: currentUser.id,
                    title: parsedResponse.title || 'Untitled Description',
                    description: parsedResponse.description || 'A new soundscape description.',
                    instrumentation: parsedResponse.instrumentation || [],
                    genre: currentGenre,
                    mood: currentMood,
                    tempo: parsedResponse.suggestedTempo || currentTempo,
                    keySignature: parsedResponse.suggestedKey || currentKey,
                    durationSeconds: parsedResponse.suggestedDurationSeconds || currentDuration,
                    audioUrl: '',
                    waveformJson: '{"peaks": [], "sampleRate": 0}',
                    midiData: '',
                    createdAt: new Date().toISOString(),
                    lastModifiedAt: new Date().toISOString(),
                    isPublic: false,
                    tags: ['description'],
                    versionHistory: [{
                        versionId: generateUniqueId(),
                        promptUsed: fullPrompt,
                        parameters: generationParameters,
                        generatedAt: new Date().toISOString(),
                        audioUrl: '',
                        notes: 'Text description only.'
                    }],
                    likes: 0,
                    comments: [],
                    playCount: 0,
                    downloadCount: 0,
                    modelUsed: selectedModel,
                    originalPrompt: prompt,
                    generationParameters: generationParameters,
                };
                addNotification({ type: 'info', message: 'Music description generated. Select an audio/MIDI model to generate sound/MIDI output.' });
            }

            setResult(newComposition);
            if (appSettings.autoSave && (newComposition.audioUrl || newComposition.midiData)) {
                await handleSaveComposition(newComposition, true); // Auto-save if it's an audio/MIDI composition
            }
            setUserStats(prev => ({ ...prev, last7DaysGenerations: [...prev.last7DaysGenerations.slice(0, 6), prev.last7DaysGenerations[6] + 1] }));
            addAuditLogEntry(currentUser.id, 'music.generated', { compositionId: newComposition.id, model: selectedModel, outputFormat: selectedOutputFormat }, digitalIdentityService.getPrivateKey(currentUser.id));

        } catch (error: any) {
            console.error('Generation Error:', error);
            addNotification({ type: 'error', message: `Generation failed: ${error.message || 'Unknown error'}` });
            setGenerationStatusMessage('Generation failed.');
            addAuditLogEntry(currentUser.id, 'music.generation_failed', { prompt, model: selectedModel, error: error.message }, digitalIdentityService.getPrivateKey(currentUser.id));
        } finally {
            setIsLoading(false);
            setIsGeneratingAudio(false);
            setGenerateProgress(0);
        }
    };

    // --- Playback Controls ---

    /**
     * Handles initiating playback of a composition.
     * Business impact: Provides immediate gratification for content creators and consumers,
     * enhancing engagement with digital assets and enabling quick review of generated music.
     * @param comp The composition to play.
     */
    export const handlePlayComposition = useCallback((comp: Composition) => {
        setPlaybackState(prev => ({
            ...prev,
            currentCompositionId: comp.id,
            isPlaying: true,
            duration: comp.durationSeconds,
            currentTime: 0,
            loop: false, // Reset loop on new play
            volume: prev.volume, // Keep current volume
        }));
        setIsPlaying(true); // Control for the main player UI
        setCompositions(prev => prev.map(c => c.id === comp.id ? { ...c, playCount: c.playCount + 1 } : c));
        setUserStats(prev => ({ ...prev, totalPlaybacks: prev.totalPlaybacks + 1 }));
        addNotification({ type: 'info', message: `Now playing: "${comp.title}"` });
        addAuditLogEntry(currentUser.id, 'composition.played', { compositionId: comp.id, title: comp.title }, digitalIdentityService.getPrivateKey(currentUser.id));
    }, [addNotification, currentUser.id]);

    /**
     * Handles pausing the current composition.
     * Business impact: Offers essential control over media consumption,
     * contributing to a smooth and user-friendly experience.
     */
    export const handlePauseComposition = useCallback(() => {
        setPlaybackState(prev => ({ ...prev, isPlaying: false }));
        setIsPlaying(false);
        if (playbackState.currentCompositionId) {
            addAuditLogEntry(currentUser.id, 'composition.paused', { compositionId: playbackState.currentCompositionId }, digitalIdentityService.getPrivateKey(currentUser.id));
        }
    }, [playbackState.currentCompositionId, currentUser.id]);

    /**
     * Handles stopping the current composition.
     * Business impact: Provides clear termination of playback, ensuring resources are released
     * and user focus can shift efficiently.
     */
    export const handleStopComposition = useCallback(() => {
        setPlaybackState(prev => ({ ...prev, currentCompositionId: null, isPlaying: false, currentTime: 0, duration: 0 }));
        setIsPlaying(false);
        if (playbackState.currentCompositionId) {
            addAuditLogEntry(currentUser.id, 'composition.stopped', { compositionId: playbackState.currentCompositionId }, digitalIdentityService.getPrivateKey(currentUser.id));
        }
    }, [playbackState.currentCompositionId, currentUser.id]);

    /**
     * Toggles play/pause for the current composition or plays a generated result.
     * Business impact: Simplifies media control, enhancing the interactive experience
     * with digital assets generated by the platform.
     */
    export const handleTogglePlayPause = useCallback(() => {
        if (playbackState.currentCompositionId) {
            setPlaybackState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
            setIsPlaying(prev => !prev);
            addAuditLogEntry(currentUser.id, `composition.${playbackState.isPlaying ? 'paused' : 'resumed'}`, { compositionId: playbackState.currentCompositionId }, digitalIdentityService.getPrivateKey(currentUser.id));
        } else if (result && result.audioUrl) {
            // If no current composition, but a result is available and has audio, play that
            handlePlayComposition(result as Composition);
        }
    }, [playbackState.currentCompositionId, playbackState.isPlaying, result, handlePlayComposition, currentUser.id]);

    /**
     * Seeks to a specific time in the current composition.
     * Business impact: Enables precise navigation within long-form audio content,
     * crucial for detailed review or editing of generated music.
     * @param time The time in seconds to seek to.
     */
    export const handleSeek = useCallback((time: number) => {
        setPlaybackState(prev => ({ ...prev, currentTime: Math.min(Math.max(0, time), prev.duration) }));
        if (playbackState.currentCompositionId) {
            addAuditLogEntry(currentUser.id, 'composition.seeked', { compositionId: playbackState.currentCompositionId, time }, digitalIdentityService.getPrivateKey(currentUser.id));
        }
        // Simulate audio element seek
    }, [playbackState.currentCompositionId, currentUser.id]);

    /**
     * Sets the playback volume.
     * Business impact: Provides ergonomic control over audio output,
     * allowing users to tailor their listening experience.
     * @param volume The new volume level (0.0 to 1.0).
     */
    export const handleSetVolume = useCallback((volume: number) => {
        setPlaybackState(prev => ({ ...prev, volume: Math.min(Math.max(0, volume), 1.0), isMuted: volume === 0 ? true : prev.isMuted }));
        if (playbackState.currentCompositionId) {
            addAuditLogEntry(currentUser.id, 'playback.volume_set', { compositionId: playbackState.currentCompositionId, volume }, digitalIdentityService.getPrivateKey(currentUser.id));
        }
    }, [playbackState.currentCompositionId, currentUser.id]);

    /**
     * Toggles mute for playback.
     * Business impact: Offers quick control for audio output, improving user convenience.
     */
    export const handleToggleMute = useCallback(() => {
        setPlaybackState(prev => ({ ...prev, isMuted: !prev.isMuted }));
        if (playbackState.currentCompositionId) {
            addAuditLogEntry(currentUser.id, `playback.${playbackState.isMuted ? 'unmuted' : 'muted'}`, { compositionId: playbackState.currentCompositionId }, digitalIdentityService.getPrivateKey(currentUser.id));
        }
    }, [playbackState.currentCompositionId, playbackState.isMuted, currentUser.id]);

    /**
     * Toggles looping the current composition.
     * Business impact: Enhances utility for repetitive listening, useful for creators evaluating loops or specific sections.
     */
    export const handleToggleLoop = useCallback(() => {
        setPlaybackState(prev => ({ ...prev, loop: !prev.loop }));
        if (playbackState.currentCompositionId) {
            addAuditLogEntry(currentUser.id, `playback.loop_${playbackState.loop ? 'disabled' : 'enabled'}`, { compositionId: playbackState.currentCompositionId }, digitalIdentityService.getPrivateKey(currentUser.id));
        }
    }, [playbackState.currentCompositionId, playbackState.loop, currentUser.id]);

    /**
     * Sets the playback speed.
     * Business impact: Provides flexible content consumption, allowing users to speed up or slow down
     * audio for analysis or preference.
     * @param speed The new playback speed.
     */
    export const handleSetPlaybackSpeed = useCallback((speed: number) => {
        setPlaybackState(prev => ({ ...prev, playbackSpeed: speed }));
        if (playbackState.currentCompositionId) {
            addAuditLogEntry(currentUser.id, 'playback.speed_set', { compositionId: playbackState.currentCompositionId, speed }, digitalIdentityService.getPrivateKey(currentUser.id));
        }
    }, [playbackState.currentCompositionId, currentUser.id]);

    /**
     * Sets the reverb amount for simulated audio effects.
     * Business impact: Offers creative control over sound, enhancing the perceived quality and
     * customization options for generated music.
     * @param amount The reverb amount.
     */
    export const handleSetReverb = useCallback((amount: number) => {
        setPlaybackState(prev => ({ ...prev, reverbAmount: amount }));
        addNotification({ type: 'info', message: `Reverb set to ${amount.toFixed(2)} (Simulated).` });
        if (playbackState.currentCompositionId) {
            addAuditLogEntry(currentUser.id, 'playback.reverb_set', { compositionId: playbackState.currentCompositionId, amount }, digitalIdentityService.getPrivateKey(currentUser.id));
        }
    }, [addNotification, playbackState.currentCompositionId, currentUser.id]);

    /**
     * Sets the delay amount for simulated audio effects.
     * Business impact: Provides creative control over sound, expanding the sonic possibilities
     * and customization for digital assets.
     * @param amount The delay amount.
     */
    export const handleSetDelay = useCallback((amount: number) => {
        setPlaybackState(prev => ({ ...prev, delayAmount: amount }));
        addNotification({ type: 'info', message: `Delay set to ${amount.toFixed(2)} (Simulated).` });
        if (playbackState.currentCompositionId) {
            addAuditLogEntry(currentUser.id, 'playback.delay_set', { compositionId: playbackState.currentCompositionId, amount }, digitalIdentityService.getPrivateKey(currentUser.id));
        }
    }, [addNotification, playbackState.currentCompositionId, currentUser.id]);

    // Simulate playback progress
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (playbackState.isPlaying && playbackState.currentCompositionId && playbackState.duration > 0) {
            interval = setInterval(() => {
                setPlaybackState(prev => {
                    let newTime = prev.currentTime + (1 * prev.playbackSpeed); // Adjust time by speed
                    if (newTime >= prev.duration) {
                        if (prev.loop) {
                            newTime = 0; // Loop back
                        } else {
                            // Stop playback if not looping and reached end
                            clearInterval(interval!);
                            addAuditLogEntry(currentUser.id, 'composition.playback_ended', { compositionId: prev.currentCompositionId }, digitalIdentityService.getPrivateKey(currentUser.id));
                            return { ...prev, isPlaying: false, currentTime: 0, currentCompositionId: null };
                        }
                    }
                    return { ...prev, currentTime: newTime };
                });
            }, 1000 / playbackState.playbackSpeed); // Update interval based on speed
        } else if (interval) {
            clearInterval(interval);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [playbackState.isPlaying, playbackState.currentCompositionId, playbackState.duration, playbackState.loop, playbackState.playbackSpeed, currentUser.id]);


    // --- Financial Transaction Logic ---

    /**
     * Handles initiating a financial transaction.
     * Business impact: Drives the core financial functionality of the platform, enabling users
     * to send and receive digital assets. It leverages the underlying programmable value rails
     * and real-time settlement engine for secure and efficient transfers.
     */
    export const handleInitiateTransaction = useCallback(async () => {
        if (!transactionRecipientId || !transactionAmount || transactionAmount <= 0) {
            addNotification({ type: 'error', message: 'Please enter a valid recipient and amount.' });
            return;
        }
        if (!programmableTokenRailService.getTokenMetadata(transactionTokenId)) {
            addNotification({ type: 'error', message: 'Invalid token selected.' });
            return;
        }

        setTransactionStatus('pending');
        setIsLoading(true);
        addAuditLogEntry(currentUser.id, 'transaction.init_request', { recipient: transactionRecipientId, amount: transactionAmount, tokenId: transactionTokenId, memo: transactionMemo }, digitalIdentityService.getPrivateKey(currentUser.id));

        try {
            const resultTx = await realTimeSettlementEngine.processPayment(
                currentUser.id,
                currentUser.id, // For this example, sender is also the user's main account
                transactionRecipientId,
                transactionTokenId,
                transactionAmount,
                transactionMemo
            );

            if (resultTx && resultTx.status === 'completed') {
                setTransactionStatus('success');
                addNotification({ type: 'success', message: `Transaction of ${transactionAmount} ${programmableTokenRailService.getTokenMetadata(transactionTokenId)?.symbol} to ${transactionRecipientId} completed!` });
                setRecentTransactions(prev => [...prev, resultTx]);
                setUserStats(prev => ({
                    ...prev,
                    totalTransactions: prev.totalTransactions + 1,
                    totalTokensOwned: programmableTokenRailService.getBalance(currentUser.id, transactionTokenId) // Update balance
                }));
                // Reset form
                setTransactionRecipientId('');
                setTransactionAmount(0);
                setTransactionMemo('');
                addAuditLogEntry(currentUser.id, 'transaction.completed_success', { txId: resultTx.id, amount: resultTx.amount, recipient: resultTx.destinationAccountId }, digitalIdentityService.getPrivateKey(currentUser.id));
                // Notify monitoring agent of the transaction
                monitoringAgent.observe({
                    type: 'financial_transaction',
                    transactionId: resultTx.id,
                    senderId: resultTx.initiatorId,
                    receiverId: resultTx.destinationAccountId,
                    amount: resultTx.amount,
                    tokenId: resultTx.tokenId,
                    riskScore: resultTx.riskScore,
                });
            } else {
                setTransactionStatus('failed');
                addNotification({ type: 'error', message: resultTx?.policyViolations ? `Transaction failed: Policy violation (${resultTx.policyViolations.join(', ')})` : 'Transaction failed. Please check details.' });
                addAuditLogEntry(currentUser.id, 'transaction.completed_failed', { reason: resultTx?.policyViolations || 'unknown_failure' }, digitalIdentityService.getPrivateKey(currentUser.id));
                // Notify monitoring agent of the failed transaction
                monitoringAgent.observe({
                    type: 'transaction_anomaly',
                    transactionId: resultTx?.id || 'N/A',
                    senderId: currentUser.id,
                    receiverId: transactionRecipientId,
                    amount: transactionAmount,
                    tokenId: transactionTokenId,
                    riskScore: resultTx?.riskScore || 100, // High risk on failure
                    policyViolations: resultTx?.policyViolations,
                });
            }
        } catch (error: any) {
            console.error('Transaction Error:', error);
            setTransactionStatus('failed');
            addNotification({ type: 'error', message: `Transaction failed: ${error.message}` });
            addAuditLogEntry(currentUser.id, 'transaction.error', { error: error.message }, digitalIdentityService.getPrivateKey(currentUser.id));
        } finally {
            setIsLoading(false);
        }
    }, [transactionRecipientId, transactionAmount, transactionTokenId, transactionMemo, addNotification, currentUser.id]);

    // --- Agent Simulation/Interaction Effects ---
    useEffect(() => {
        const agentSimulationInterval = setInterval(async () => {
            // Orchestrator observes and decides
            const orchestratorMessages = orchestrationAgent.receiveMessages();
            for (const msg of orchestratorMessages) {
                await orchestrationAgent.observe(msg);
            }
            const orchestratorActions = await orchestrationAgent.decide();
            if (orchestratorActions.length > 0) {
                orchestratorActions.forEach(action => {
                    addNotification({
                        type: 'agent_action',
                        message: `Orchestrator action: ${action.actionType} (Target: ${action.targetId || 'N/A'})`,
                        timestamp: action.timestamp,
                    });
                });
            }

            // Monitoring agent observes (simulated events for now)
            const simulatedEvent = Math.random() < 0.1 ? {
                type: 'performance_issue',
                component: 'Frontend UI',
                latencyMs: Math.random() * 2000 + 500, // 500ms to 2500ms
                timestamp: new Date().toISOString()
            } : undefined;

            if (simulatedEvent) {
                await monitoringAgent.observe(simulatedEvent);
            }

            const monitorMessages = monitoringAgent.receiveMessages();
            for (const msg of monitorMessages) {
                await monitoringAgent.observe(msg); // Agents can also observe messages
                if (msg.topic === 'command.acknowledge_alert') {
                    // Monitoring agent acknowledges receipt of alert command
                    addNotification({ type: 'info', message: `Monitoring Agent acknowledged alert ${msg.payload.alertId}` });
                }
            }
            const monitorActions = await monitoringAgent.decide();
            if (monitorActions.length > 0) {
                monitorActions.forEach(action => {
                    addNotification({
                        type: 'agent_action',
                        message: `Monitor Agent action: ${action.actionType} (Target: ${action.targetId || 'N/A'})`,
                        timestamp: action.timestamp,
                    });
                });
            }

            // Remediation agent receives commands
            const remediationMessages = remediationAgent.receiveMessages();
            for (const msg of remediationMessages) {
                await remediationAgent.observe(msg); // Observe message for context
                if (msg.topic === 'command.remediate') {
                    await remediationAgent.remediate(msg.payload);
                }
            }
            const remediationActions = await remediationAgent.decide(); // Might have internal decisions
            if (remediationActions.length > 0) {
                remediationActions.forEach(action => {
                    addNotification({
                        type: 'agent_action',
                        message: `Remediation Agent action: ${action.actionType} (Target: ${action.targetId || 'N/A'})`,
                        timestamp: action.timestamp,
                    });
                });
            }

            // Update local state with latest audit log and financial balances
            setUserStats(prev => ({
                ...prev,
                totalTokensOwned: programmableTokenRailService.getBalance(currentUser.id, appSettings.defaultCurrencyTokenId)
            }));
            setRecentTransactions(Array.from(realTimeSettlementEngine['transactions'].values())); // Access private for demo
        }, 3000); // Run agent simulation every 3 seconds

        return () => clearInterval(agentSimulationInterval);
    }, [addNotification, appSettings.defaultCurrencyTokenId, currentUser.id]);


    // --- UI Component Definitions (exported for clarity, but defined within this file) ---

    /**
     * Renders a dropdown for selecting music genre.
     * Business impact: Streamlines the content creation process by offering structured choices,
     * guiding AI generation towards desired artistic outcomes.
     */
    export const ExportedGenreSelector: React.FC<{
        selectedGenre: string;
        onChange: (genre: string) => void;
        genres: string[];
        disabled?: boolean;
    }> = React.memo(({ selectedGenre, onChange, genres, disabled }) => (
        <ExportedSelect
            label="Genre"
            value={selectedGenre}
            onChange={e => onChange(e.target.value)}
            options={[{ value: 'Any', label: 'Any' }, ...genres.map(g => ({ value: g, label: g }))]}
            disabled={disabled}
        />
    ));

    /**
     * Renders a dropdown for selecting music mood.
     * Business impact: Empowers users to define the emotional tone of AI-generated content,
     * ensuring creative outputs align with specific commercial or artistic requirements.
     */
    export const ExportedMoodSelector: React.FC<{
        selectedMood: string;
        onChange: (mood: string) => void;
        moods: string[];
        disabled?: boolean;
    }> = React.memo(({ selectedMood, onChange, moods, disabled }) => (
        <ExportedSelect
            label="Mood"
            value={selectedMood}
            onChange={e => onChange(e.target.value)}
            options={[{ value: 'Any', label: 'Any' }, ...moods.map(m => ({ value: m, label: m }))]}
            disabled={disabled}
        />
    ));

    /**
     * Renders a multi-select interface for choosing musical instruments.
     * Business impact: Provides granular control over the sonic palette of AI-generated music,
     * allowing for highly customized and production-ready compositions.
     */
    export const ExportedInstrumentationSelector: React.FC<{
        selectedInstruments: string[];
        onChange: (instruments: string[]) => void;
        availableInstruments: string[];
        disabled?: boolean;
    }> = React.memo(({ selectedInstruments, onChange, availableInstruments, disabled }) => {
        const handleInstrumentChange = (instrument: string) => {
            if (disabled) return;
            if (selectedInstruments.includes(instrument)) {
                onChange(selectedInstruments.filter(i => i !== instrument));
            } else {
                onChange([...selectedInstruments, instrument]);
            }
        };

        return (
            <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2">Instruments ({selectedInstruments.length} selected)</label>
                <div className={`flex flex-wrap gap-2 p-2 bg-gray-700/50 rounded max-h-48 overflow-y-auto ${disabled ? 'opacity-60' : ''}`}>
                    {availableInstruments.map(instrument => (
                        <span
                            key={instrument}
                            onClick={() => handleInstrumentChange(instrument)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${selectedInstruments.includes(instrument) ? 'bg-cyan-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            {instrument}
                        </span>
                    ))}
                </div>
                {selectedInstruments.length === 0 && !disabled && (
                    <p className="text-red-400 text-xs mt-1">Select at least one instrument for better generation.</p>
                )}
            </div>
        );
    });

    /**
     * Renders a form for configuring AI music generation parameters.
     * Business impact: Centralizes the creative control panel for digital asset generation,
     * enabling users to precisely steer the AI towards specific commercial or artistic goals,
     * maximizing the value of generated content.
     */
    export const ExportedGenerationParametersForm: React.FC<{
        prompt: string;
        setPrompt: (p: string) => void;
        currentGenre: string;
        setCurrentGenre: (g: string) => void;
        currentMood: string;
        setCurrentMood: (m: string) => void;
        currentTempo: number;
        setCurrentTempo: (t: number) => void;
        currentDuration: number;
        setCurrentDuration: (d: number) => void;
        currentKey: string;
        setCurrentKey: (k: string) => void;
        currentInstruments: string[];
        setCurrentInstruments: (i: string[]) => void;
        creativityTemperature: number;
        setCreativityTemperature: (t: number) => void;
        diversityPenalty: number;
        setDiversityPenalty: (d: number) => void;
        selectedModel: string;
        setSelectedModel: (m: string) => void;
        selectedOutputFormat: GenerationParameters['outputFormat'];
        setSelectedOutputFormat: (f: GenerationParameters['outputFormat']) => void;
        styleReferenceId: string | undefined;
        setStyleReferenceId: (id: string | undefined) => void;
        compositions: Composition[]; // To select style reference
        isLoading: boolean;
        handleGenerate: () => void;
        generateProgress: number;
        isGeneratingAudio: boolean;
        generationStatusMessage: string;
    }> = React.memo(({
        prompt, setPrompt, currentGenre, setCurrentGenre, currentMood, setCurrentMood,
        currentTempo, setCurrentTempo, currentDuration, setCurrentDuration, currentKey, setCurrentKey,
        currentInstruments, setCurrentInstruments, creativityTemperature, setCreativityTemperature,
        diversityPenalty, setDiversityPenalty, selectedModel, setSelectedModel,
        selectedOutputFormat, setSelectedOutputFormat, styleReferenceId, setStyleReferenceId, compositions,
        isLoading, handleGenerate, generateProgress, isGeneratingAudio, generationStatusMessage
    }) => {
        const isAdvancedModel = selectedModel.includes('sonic-synth') || selectedModel.includes('midi-composer');
        const isGenerating = isLoading || isGeneratingAudio;

        const availableStyleReferences = compositions.filter(c => c.audioUrl || c.midiData);

        return (
            <div className="space-y-4">
                <ExportedInput label="Prompt" value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} placeholder="Describe the music you want..." disabled={isGenerating} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ExportedGenreSelector selectedGenre={currentGenre} onChange={setCurrentGenre} genres={GENRES} disabled={isGenerating} />
                    <ExportedMoodSelector selectedMood={currentMood} onChange={setCurrentMood} moods={MOODS} disabled={isGenerating} />
                </div>

                <ExportedInstrumentationSelector selectedInstruments={currentInstruments} onChange={setCurrentInstruments} availableInstruments={INSTRUMENTS} disabled={isGenerating} />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ExportedSlider label="Tempo (BPM)" value={currentTempo} onChange={e => setCurrentTempo(Number(e.target.value))} min={40} max={200} step={1} disabled={isGenerating} />
                    <ExportedSlider label="Duration (seconds)" value={currentDuration} onChange={e => setCurrentDuration(Number(e.target.value))} min={30} max={600} step={10} displayValue={formatDuration(currentDuration)} disabled={isGenerating} />
                    <ExportedSelect label="Key Signature" value={currentKey} onChange={e => setCurrentKey(e.target.value)} options={KEY_SIGNATURES.map(k => ({ value: k, label: k }))} disabled={isGenerating} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ExportedSlider label="Creativity (Temperature)" value={creativityTemperature} onChange={e => setCreativityTemperature(Number(e.target.value))} min={0.1} max={1.0} step={0.05} disabled={isGenerating} tooltip="Higher values lead to more varied and surprising outputs." />
                    <ExportedSlider label="Diversity (Penalty)" value={diversityPenalty} onChange={e => setDiversityPenalty(Number(e.target.value))} min={0.0} max={2.0} step={0.1} disabled={isGenerating} tooltip="Controls the repetition of musical elements. Higher values reduce repetition." />
                </div>

                <ExportedSelect label="Generation Model" value={selectedModel} onChange={e => { setSelectedModel(e.target.value); setSelectedOutputFormat(e.target.value.includes('midi') ? 'midi' : (e.target.value.includes('sonic-synth') ? 'audio' : 'description')); }} options={GENERATION_MODELS} disabled={isGenerating} />
                <ExportedSelect label="Output Format" value={selectedOutputFormat} onChange={e => setSelectedOutputFormat(e.target.value as GenerationParameters['outputFormat'])} options={OUTPUT_FORMATS} disabled={isGenerating || selectedModel.includes('midi') || selectedModel.includes('sonic-synth')} tooltip="Output format is locked for certain models." />

                {availableStyleReferences.length > 0 && (
                    <ExportedSelect
                        label="Style Reference (Optional)"
                        value={styleReferenceId || ''}
                        onChange={e => setStyleReferenceId(e.target.value || undefined)}
                        options={[{ value: '', label: 'None' }, ...availableStyleReferences.map(c => ({ value: c.id, label: c.title }))]}
                        disabled={isGenerating}
                        tooltip="Select an existing composition to influence the style of the new generation."
                    />
                )}
                {styleReferenceId && (
                    <p className="text-sm text-gray-500">
                        Using "<span className="text-cyan-400 font-medium">{compositions.find(c => c.id === styleReferenceId)?.title}</span>" as style reference.
                    </p>
                )}


                <ExportedButton onClick={handleGenerate} disabled={isGenerating || prompt.trim().length === 0 || currentInstruments.length === 0} className="w-full mt-4 py-3 text-lg font-semibold">
                    {isGenerating ? (isGeneratingAudio ? `Synthesizing Audio (${Math.round(generateProgress)}%)` : `Composing (${Math.round(generateProgress)}%)`) : 'Generate New Composition'}
                </ExportedButton>
                {(isGenerating) && (
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2 flex items-center">
                        <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${generateProgress}%`, transition: 'width 0.1s linear' }}></div>
                        <span className="ml-3 text-xs text-gray-400">{generationStatusMessage}</span>
                    </div>
                )}
            </div>
        );
    });

    /**
     * Renders a detailed card view for a single composition.
     * Business impact: Showcases the platform's AI-generated content, enabling detailed review,
     * management, and sharing of digital assets. It integrates playback, saving, and interaction features,
     * enhancing content discoverability and user engagement.
     */
    export const ExportedCompositionDetailCard: React.FC<{
        composition: Composition;
        onPlay: (comp: Composition) => void;
        onSave: (comp: Composition, isNew?: boolean) => Promise<boolean>;
        onDelete: (id: string) => Promise<boolean>;
        onRemix: (comp: Composition) => void;
        onShare: (comp: Composition) => void;
        playbackState: PlaybackState;
        isPlayingGlobally: boolean;
        handleTogglePlayPauseGlobally: () => void;
        currentUser: UserProfile;
        projects: Project[];
        onAddRemoveCompToProject: (projectId: string, compId: string, add: boolean) => Promise<boolean>;
        isFinancialView?: boolean; // New prop for financial context
    }> = React.memo(({
        composition, onPlay, onSave, onDelete, onRemix, onShare,
        playbackState, isPlayingGlobally, handleTogglePlayPauseGlobally, currentUser, projects, onAddRemoveCompToProject,
        isFinancialView = false
    }) => {
        const isCurrentPlaying = playbackState.currentCompositionId === composition.id;
        const [isSaving, setIsSaving] = useState(false);
        const [showComments, setShowComments] = useState(false);
        const [newCommentText, setNewCommentText] = useState('');
        const [showProjectPicker, setShowProjectPicker] = useState(false);
        const { addNotification } = useNotifications();

        const handleSave = async () => {
            setIsSaving(true);
            await onSave(composition, false); // Not a new composition
            setIsSaving(false);
        };

        const handleLike = async () => {
            // Simulate like toggle
            const isLiked = composition.likes > 0; // Simple check, in real app, track user likes
            const updatedComposition = { ...composition, likes: isLiked ? composition.likes - 1 : composition.likes + 1 };
            await onSave(updatedComposition);
            addNotification({ type: 'info', message: isLiked ? `Unliked "${composition.title}".` : `Liked "${composition.title}"!` });
            setUserStats(prev => ({ ...prev, totalLikesReceived: isLiked ? prev.totalLikesReceived - 1 : prev.totalLikesReceived + 1 }));
            addAuditLogEntry(currentUser.id, `composition.${isLiked ? 'unliked' : 'liked'}`, { compositionId: composition.id, title: composition.title }, digitalIdentityService.getPrivateKey(currentUser.id));
        };

        const handleAddComment = async () => {
            if (newCommentText.trim()) {
                const newComment: Comment = {
                    id: generateUniqueId(),
                    userId: currentUser.id,
                    username: currentUser.username,
                    text: newCommentText,
                    createdAt: new Date().toISOString(),
                    avatarUrl: currentUser.avatarUrl,
                };
                const updatedComposition = { ...composition, comments: [...composition.comments, newComment] };
                const success = await onSave(updatedComposition);
                if (success) {
                    setNewCommentText('');
                    addNotification({ type: 'success', message: 'Comment added!' });
                    addAuditLogEntry(currentUser.id, 'composition.comment_added', { compositionId: composition.id, commentId: newComment.id }, digitalIdentityService.getPrivateKey(currentUser.id));
                } else {
                    addNotification({ type: 'error', message: 'Failed to add comment.' });
                }
            }
        };

        const projectsContainingComp = useMemo(() => {
            return projects.filter(p => p.compositionIds.includes(composition.id));
        }, [projects, composition.id]);

        return (
            <Card className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">{composition.title}</h3>
                    {composition.userId === currentUser.id && !isFinancialView && (
                        <div className="flex space-x-2">
                            <ExportedIconButton
                                onClick={() => onRemix(composition)}
                                icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 0020 13a8 8 0 00-8 8H6v5H4V4h-.582m19.356-2A8.001 8.001 0 0024 13a8 8 0 00-8 8h-6v5h-4V4H2v5h-.582m19.356-2A8.001 8.001 0 0020 13a8 8 0 00-8 8H6v5H4V4h-.582m19.356-2A8.001 8.001 0 0024 13a8 8 0 00-8 8h-6v5h-4V4H2"></path></svg>}
                                tooltip="Remix"
                            />
                            <ExportedIconButton
                                onClick={handleSave}
                                icon={isSaving ? <ExportedLoadingSpinner className="!p-0 !h-5 !w-5" /> : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-4 0V4a2 2 0 012-2h4a2 2 0 012 2v3m-4 0h-4"></path></svg>}
                                tooltip="Save Changes"
                                disabled={isSaving}
                            />
                            <ExportedIconButton
                                onClick={() => onDelete(composition.id)}
                                icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1H9a1 1 0 00-1 1v3m-3 0h14"></path></svg>}
                                tooltip="Delete"
                            />
                        </div>
                    )}
                </div>

                <p className="text-gray-300 text-sm mb-4 flex-grow">{composition.description}</p>

                <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-4">
                    <span><strong>Genre:</strong> <span className="text-white">{composition.genre}</span></span>
                    <span><strong>Mood:</strong> <span className="text-white">{composition.mood}</span></span>
                    <span><strong>Tempo:</strong> <span className="text-white">{composition.tempo} BPM</span></span>
                    <span><strong>Key:</strong> <span className="text-white">{composition.keySignature}</span></span>
                    <span><strong>Duration:</strong> <span className="text-white">{formatDuration(composition.durationSeconds)}</span></span>
                    <span><strong>Model:</strong> <span className="text-white">{composition.modelUsed}</span></span>
                </div>

                <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-1">Instrumentation:</h4>
                    <div className="flex flex-wrap gap-2">
                        {composition.instrumentation.map(inst => (
                            <span key={inst} className="px-2 py-1 bg-gray-700 rounded-full text-xs text-cyan-300">{inst}</span>
                        ))}
                    </div>
                </div>

                {composition.audioUrl && (
                    <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-300 mb-1">Audio Controls:</h4>
                        <div className="flex items-center space-x-2">
                            <ExportedIconButton
                                onClick={() => onPlay(composition)}
                                icon={isCurrentPlaying && isPlayingGlobally ? <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg> : <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>}
                                tooltip={isCurrentPlaying && isPlayingGlobally ? "Pause" : "Play"}
                                className="!bg-cyan-600 hover:!bg-cyan-700 !text-white !p-2 rounded-lg"
                            />
                        </div>
                    </div>
                )}

                {!isFinancialView && ( // Don't show social features in financial view
                    <>
                        <div className="flex items-center justify-between text-gray-400 text-sm mb-4">
                            <div className="flex items-center space-x-4">
                                <ExportedIconButton
                                    onClick={handleLike}
                                    icon={<svg className={`h-5 w-5 ${composition.likes > 0 ? 'text-red-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>}
                                    label={composition.likes.toString()}
                                    className="!bg-transparent hover:!bg-gray-700 !p-1"
                                    tooltip="Like"
                                />
                                <ExportedIconButton
                                    onClick={() => setShowComments(!showComments)}
                                    icon={<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"></path></svg>}
                                    label={composition.comments.length.toString()}
                                    className="!bg-transparent hover:!bg-gray-700 !p-1"
                                    tooltip="Comments"
                                />
                                <ExportedIconButton
                                    onClick={() => onShare(composition)}
                                    icon={<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.52.47 1.2.77 1.96.77 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L7.14 9.17c-.52-.47-1.2-.77-1.96-.77-1.66 0-3 1.34-3 3s1.34 3 3 3c.76 0 1.44-.3 1.96-.77l7.05 4.11c-.05.23-.09.46-.09.7 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z"></path></svg>}
                                    tooltip="Share"
                                    className="!bg-transparent hover:!bg-gray-700 !p-1"
                                />
                            </div>
                            <span className="text-xs">Plays: {composition.playCount} | Downloads: {composition.downloadCount}</span>
                        </div>

                        {showComments && (
                            <div className="mb-4 p-3 bg-gray-700/30 rounded">
                                <h5 className="text-md font-semibold text-white mb-2">Comments</h5>
                                <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                                    {composition.comments.length === 0 && <p className="text-gray-400 text-sm">No comments yet. Be the first!</p>}
                                    {composition.comments.map(comment => (
                                        <div key={comment.id} className="flex items-start">
                                            <img src={comment.avatarUrl} alt={comment.username} className="w-8 h-8 rounded-full mr-2" />
                                            <div>
                                                <p className="text-sm text-white font-medium">{comment.username} <span className="text-gray-500 text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span></p>
                                                <p className="text-gray-300 text-sm">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-3 flex">
                                    <ExportedInput
                                        value={newCommentText}
                                        onChange={e => setNewCommentText(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="flex-grow mr-2"
                                        label="" // No label needed for inline input
                                    />
                                    <ExportedButton onClick={handleAddComment} disabled={!newCommentText.trim()}>Post</ExportedButton>
                                </div>
                            </div>
                        )}

                        <div className="mt-auto"> {/* Push to bottom */}
                            <ExportedButton
                                onClick={() => setShowProjectPicker(true)}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 !py-2 text-sm"
                            >
                                {projectsContainingComp.length > 0 ? `In ${projectsContainingComp.length} projects` : 'Add to Project'}
                            </ExportedButton>
                        </div>

                        <ExportedModal isOpen={showProjectPicker} onClose={() => setShowProjectPicker(false)} title="Add/Remove from Projects">
                            {projects.length === 0 ? (
                                <p className="text-gray-400">You have no projects. Create one first!</p>
                            ) : (
                                <div className="space-y-2">
                                    {projects.map(project => (
                                        <div key={project.id} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                                            <span className="text-white">{project.name}</span>
                                            <ExportedCheckbox
                                                label=""
                                                checked={project.compositionIds.includes(composition.id)}
                                                onChange={(e) => onAddRemoveCompToProject(project.id, composition.id, e.target.checked)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ExportedModal>
                    </>
                )}
            </Card>
        );
    });


    /**
     * Renders the financial management view for the platform.
     * Business impact: Provides a clear, intuitive interface for users to manage their digital assets,
     * initiate transactions, and view their financial history. This module is essential for driving
     * the adoption and utility of the programmable value rails.
     */
    export const ExportedFinancialView: React.FC<{
        currentUser: UserProfile;
        userStats: UserStats;
        defaultTokenId: string;
        onInitiateTransaction: () => void;
        transactionRecipientId: string;
        setTransactionRecipientId: (id: string) => void;
        transactionAmount: number;
        setTransactionAmount: (amount: number) => void;
        transactionTokenId: string;
        setTransactionTokenId: (id: string) => void;
        transactionMemo: string;
        setTransactionMemo: (memo: string) => void;
        transactionStatus: 'idle' | 'pending' | 'success' | 'failed';
        isLoading: boolean;
        recentTransactions: Transaction[];
    }> = React.memo(({
        currentUser, userStats, defaultTokenId, onInitiateTransaction,
        transactionRecipientId, setTransactionRecipientId, transactionAmount,
        setTransactionAmount, transactionTokenId, setTransactionTokenId,
        transactionMemo, setTransactionMemo, transactionStatus, isLoading, recentTransactions
    }) => {
        const defaultTokenMetadata = programmableTokenRailService.getTokenMetadata(defaultTokenId);
        const allTokenMetadata = Array.from(programmableTokenRailService['tokenMetadata'].values());
        const allRails = programmableTokenRailService.getActiveRails();

        return (
            <div className="space-y-6">
                <ExportedSectionHeader title="Financial Overview" subtitle="Manage your digital assets and transactions." />

                <Card>
                    <h3 className="text-xl font-semibold text-white mb-3">Your Wallet</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-400">Total Tokens ({defaultTokenMetadata?.symbol}):</p>
                            <p className="text-white text-2xl font-bold">
                                {programmableTokenRailService.getBalance(currentUser.id, defaultTokenId).toFixed(defaultTokenMetadata?.decimals || 2)} {defaultTokenMetadata?.symbol}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-400">Total Transactions:</p>
                            <p className="text-white text-2xl font-bold">{userStats.totalTransactions}</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h3 className="text-xl font-semibold text-white mb-3">Send Funds</h3>
                    <div className="space-y-4">
                        <ExportedInput
                            label="Recipient ID"
                            placeholder="Enter recipient's Digital Identity ID"
                            value={transactionRecipientId}
                            onChange={(e) => setTransactionRecipientId(e.target.value)}
                            disabled={isLoading}
                        />
                        <ExportedInput
                            label="Amount"
                            type="number"
                            placeholder="Amount to send"
                            value={transactionAmount}
                            onChange={(e) => setTransactionAmount(Number(e.target.value))}
                            disabled={isLoading}
                        />
                        <ExportedSelect
                            label="Token"
                            value={transactionTokenId}
                            onChange={(e) => setTransactionTokenId(e.target.value)}
                            options={allTokenMetadata.map(t => ({ value: t.id, label: `${t.name} (${t.symbol})` }))}
                            disabled={isLoading}
                            tooltip="Select the digital asset to transfer."
                        />
                        <ExportedInput
                            label="Memo (Optional)"
                            placeholder="Transaction description"
                            value={transactionMemo}
                            onChange={(e) => setTransactionMemo(e.target.value)}
                            disabled={isLoading}
                            rows={2}
                        />
                        <ExportedButton onClick={onInitiateTransaction} disabled={isLoading || transactionAmount <= 0 || !transactionRecipientId} className="w-full">
                            {isLoading ? <ExportedLoadingSpinner className="!p-0 !h-5 !w-5 mr-2" /> : null}
                            {isLoading ? 'Processing Transaction...' : 'Send Funds'}
                        </ExportedButton>
                        {transactionStatus === 'pending' && <p className="text-cyan-400 text-sm mt-2">Transaction is being processed...</p>}
                        {transactionStatus === 'success' && <p className="text-green-400 text-sm mt-2">Transaction successful!</p>}
                        {transactionStatus === 'failed' && <p className="text-red-400 text-sm mt-2">Transaction failed. Please try again.</p>}
                    </div>
                </Card>

                <Card>
                    <h3 className="text-xl font-semibold text-white mb-3">Recent Transactions</h3>
                    {recentTransactions.length === 0 ? (
                        <p className="text-gray-400">No recent transactions.</p>
                    ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {recentTransactions.slice().reverse().map(tx => {
                                const token = programmableTokenRailService.getTokenMetadata(tx.tokenId);
                                const isOutgoing = tx.initiatorId === currentUser.id;
                                const statusColor = tx.status === 'completed' ? 'text-green-400' : 'text-red-400';
                                return (
                                    <div key={tx.id} className="bg-gray-700/50 p-3 rounded-md">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className={`font-semibold ${isOutgoing ? 'text-red-300' : 'text-green-300'}`}>
                                                {isOutgoing ? 'Sent' : 'Received'} {tx.amount.toFixed(token?.decimals || 2)} {token?.symbol}
                                            </span>
                                            <span className="text-gray-400">{new Date(tx.timestamp).toLocaleString()}</span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            From: {tx.sourceAccountId || 'N/A'} &rarr; To: {tx.destinationAccountId || 'N/A'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Tx ID: {tx.id.substring(0, 8)}...
                                        </p>
                                        <p className={`text-xs font-medium ${statusColor}`}>
                                            Status: {capitalize(tx.status)}
                                            {tx.policyViolations && tx.policyViolations.length > 0 && ` (Violations: ${tx.policyViolations.join(', ')})`}
                                            {tx.riskScore && ` (Risk: ${tx.riskScore})`}
                                        </p>
                                        {tx.routingPath && <p className="text-xs text-gray-500">Rail: {tx.routingPath.join(' -> ')}</p>}
                                        {tx.metadata?.memo && <p className="text-xs text-gray-500">Memo: {tx.metadata.memo}</p>}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>

                <Card>
                    <h3 className="text-xl font-semibold text-white mb-3">Programmable Rails</h3>
                    {allRails.length === 0 ? (
                        <p className="text-gray-400">No active programmable rails.</p>
                    ) : (
                        <div className="space-y-3">
                            {allRails.map(rail => (
                                <div key={rail.id} className="bg-gray-700/50 p-3 rounded-md">
                                    <h4 className="font-semibold text-white">{rail.name} ({capitalize(rail.securityLevel)} Security)</h4>
                                    <p className="text-xs text-gray-400">Latency: {rail.latencyMs}ms | Cost: {rail.costPerTx} per tx</p>
                                    <p className="text-xs text-gray-400">Throughput: {rail.throughputTxPerSec} tx/sec</p>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        );
    });

    /**
     * Renders the Agent Intelligence Layer management view.
     * Business impact: Provides visibility and control over the autonomous agents that
     * underpin the platform's intelligent automation. This module is key for monitoring
     * agent health, reviewing their actions, and ensuring their compliance with operational
     * and governance policies.
     */
    export const ExportedAgentIntelligenceView: React.FC<{
        monitoringAgent: MonitoringAgent;
        remediationAgent: RemediationAgent;
        orchestrationAgent: OrchestrationAgent;
        addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
    }> = React.memo(({ monitoringAgent, remediationAgent, orchestrationAgent, addNotification }) => {
        const [showAgentMessagesModal, setShowAgentMessagesModal] = useState(false);
        const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
        const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
        const [activeAlerts, setActiveAlerts] = useState<Alert[]>(monitoringAgent.getAlerts());
        const [agentActionLogs, setAgentActionLogs] = useState<AgentAction[]>(orchestrationAgent.getActionLogs());

        const agents = useMemo(() => [monitoringAgent, remediationAgent, orchestrationAgent], [monitoringAgent, remediationAgent, orchestrationAgent]);

        const fetchAgentMessages = useCallback(() => {
            if (selectedAgentId) {
                // In a real scenario, agents would pull their own messages.
                // For this UI, we simulate fetching from a central layer or directly from agent instances.
                const allMessages = agentMessagingLayer.getMessageHistory();
                setAgentMessages(allMessages.filter(m => m.senderId === selectedAgentId || m.receiverId === selectedAgentId));
            }
        }, [selectedAgentId]);

        useEffect(() => {
            fetchAgentMessages();
            setActiveAlerts(monitoringAgent.getAlerts());
            setAgentActionLogs(orchestrationAgent.getActionLogs());
            const interval = setInterval(() => {
                fetchAgentMessages();
                setActiveAlerts(monitoringAgent.getAlerts());
                setAgentActionLogs(orchestrationAgent.getActionLogs());
            }, 1000); // Refresh agent data periodically
            return () => clearInterval(interval);
        }, [fetchAgentMessages, monitoringAgent, orchestrationAgent]);

        const handleViewAgentMessages = (agentId: string) => {
            setSelectedAgentId(agentId);
            setShowAgentMessagesModal(true);
        };

        const handleSimulateAlert = async () => {
            addNotification({type: 'info', message: 'Simulating a critical security alert...'});
            const mockTxId = generateUniqueId();
            await monitoringAgent.observe({
                type: 'transaction_anomaly',
                transactionId: mockTxId,
                riskScore: 90,
                details: 'Unauthorized access attempt detected during transfer.',
                source: 'Simulated Security System',
                timestamp: new Date().toISOString()
            });
        };

        return (
            <div className="space-y-6">
                <ExportedSectionHeader title="Agent Intelligence Layer" subtitle="Monitor and manage autonomous agents ensuring system integrity and performance." />

                <Card>
                    <h3 className="text-xl font-semibold text-white mb-3">Registered Agents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {agents.map(agent => (
                            <div key={agent.id} className="bg-gray-700/50 p-4 rounded-md">
                                <h4 className="font-semibold text-white">{agent.name} <span className="text-gray-500 text-sm">({agent.id})</span></h4>
                                <p className="text-sm text-gray-400">Roles: {agent.roles.join(', ')}</p>
                                <p className="text-sm text-gray-400">Status: <span className="text-green-400">Active</span></p>
                                <ExportedButton onClick={() => handleViewAgentMessages(agent.id)} className="mt-3 text-xs !py-1 !px-2 bg-gray-600 hover:bg-gray-500">
                                    View Messages
                                </ExportedButton>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <h3 className="text-xl font-semibold text-white mb-3">Active Alerts (<span className="text-red-400">{activeAlerts.length}</span>)</h3>
                    {activeAlerts.length === 0 ? (
                        <p className="text-gray-400">No active alerts. System operating normally.</p>
                    ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {activeAlerts.map(alert => (
                                <div key={alert.id} className="bg-red-700/30 p-3 rounded-md border border-red-600">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-semibold text-red-300">{alert.type} Alert ({capitalize(alert.severity)})</span>
                                        <span className="text-gray-400">{new Date(alert.timestamp).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-white mt-1">{alert.message}</p>
                                    <p className="text-xs text-gray-500">Source: {alert.source} {alert.relatedTransactionId && ` (Tx: ${alert.relatedTransactionId.substring(0, 8)}...)`}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    <ExportedButton onClick={handleSimulateAlert} className="mt-4 bg-red-600 hover:bg-red-700">Simulate Critical Alert</ExportedButton>
                </Card>

                <Card>
                    <h3 className="text-xl font-semibold text-white mb-3">Agent Action Log</h3>
                    {agentActionLogs.length === 0 ? (
                        <p className="text-gray-400">No agent actions recorded yet.</p>
                    ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {agentActionLogs.slice().reverse().map(action => (
                                <div key={action.id} className="bg-gray-700/50 p-3 rounded-md">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-semibold text-cyan-300">{action.agentId.split('-')[1]} Agent: {capitalize(action.actionType)}</span>
                                        <span className="text-gray-400">{new Date(action.timestamp).toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">Status: {capitalize(action.status)}</p>
                                    {action.targetId && <p className="text-xs text-gray-500">Target ID: {action.targetId.substring(0, 8)}...</p>}
                                    {action.payload && <p className="text-xs text-gray-500">Details: {JSON.stringify(action.payload, null, 2).substring(0, 100)}...</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <ExportedModal isOpen={showAgentMessagesModal} onClose={() => setShowAgentMessagesModal(false)} title={`Messages for ${selectedAgentId}`}>
                    {agentMessages.length === 0 ? (
                        <p className="text-gray-400">No messages for this agent.</p>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {agentMessages.slice().reverse().map(msg => (
                                <div key={msg.id} className={`p-3 rounded-md ${msg.senderId === selectedAgentId ? 'bg-cyan-900/40' : 'bg-gray-700/50'}`}>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-semibold text-white">{msg.senderId} &rarr; {msg.receiverId}</span>
                                        <span className="text-gray-400 text-xs">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-xs text-gray-300">Topic: {msg.topic}</p>
                                    <pre className="text-xs text-gray-400 whitespace-pre-wrap break-all mt-1">{JSON.stringify(msg.payload, null, 2)}</pre>
                                    <p className="text-xs text-gray-500">Encrypted: {msg.isEncrypted ? 'Yes' : 'No'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </ExportedModal>
            </div>
        );
    });

    /**
     * Renders the Audit Log viewer.
     * Business impact: Provides transparent, immutable, and cryptographically verified records
     * of all system activities. This module is essential for regulatory compliance,
     * forensic investigations, and establishing trust in the integrity of all financial operations
     * and autonomous agent actions.
     */
    export const ExportedAuditLogView: React.FC<{
        getAuditLog: () => AuditLogEntry[];
    }> = React.memo(({ getAuditLog }) => {
        const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

        useEffect(() => {
            setAuditLogs(getAuditLog());
            const interval = setInterval(() => {
                setAuditLogs(getAuditLog());
            }, 2000); // Refresh audit log periodically
            return () => clearInterval(interval);
        }, [getAuditLog]);

        const verifyLogIntegrity = useMemo(() => {
            if (auditLogs.length === 0) return true;
            let currentPrevHash = 'genesis_hash';
            for (const entry of auditLogs) {
                if (entry.prevHash !== currentPrevHash) {
                    console.error('Integrity check failed: prevHash mismatch', { expected: currentPrevHash, got: entry.prevHash, entry });
                    return false;
                }
                const dataToHash = JSON.stringify({
                    timestamp: entry.timestamp,
                    entityId: entry.entityId,
                    eventType: entry.eventType,
                    details: entry.details,
                    prevHash: entry.prevHash
                });
                if (btoa(dataToHash) !== entry.hash) { // Re-calculate hash
                    console.error('Integrity check failed: hash mismatch', { entry, calculatedHash: btoa(dataToHash) });
                    return false;
                }
                currentPrevHash = entry.hash;
            }
            return true;
        }, [auditLogs]);

        return (
            <div className="space-y-6">
                <ExportedSectionHeader
                    title="Immutable Audit Log"
                    subtitle="Cryptographically verifiable record of all system events and agent actions."
                />

                <Card>
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                        Log Integrity Status:
                        {verifyLogIntegrity ? (
                            <span className="ml-2 text-green-400 flex items-center">
                                <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                Verified
                            </span>
                        ) : (
                            <span className="ml-2 text-red-400 flex items-center">
                                <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                                Tampered!
                            </span>
                        )}
                    </h3>
                    <p className="text-gray-400 text-sm">Every event is cryptographically chained for immutable auditability.</p>
                </Card>

                <Card>
                    <h3 className="text-xl font-semibold text-white mb-3">All Log Entries ({auditLogs.length})</h3>
                    {auditLogs.length === 0 ? (
                        <p className="text-gray-400">No audit log entries yet.</p>
                    ) : (
                        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                            {auditLogs.slice().reverse().map(entry => (
                                <div key={entry.id} className="bg-gray-700/50 p-3 rounded-md">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-semibold text-white">{entry.eventType}</span>
                                        <span className="text-gray-400 text-xs">{new Date(entry.timestamp).toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-gray-300">Entity: {entry.entityId}</p>
                                    <pre className="text-xs text-gray-500 whitespace-pre-wrap break-all mt-1">{JSON.stringify(entry.details, null, 2)}</pre>
                                    <p className="text-xs text-gray-600 mt-1">Hash: {entry.hash.substring(0, 16)}...</p>
                                    <p className="text-xs text-gray-600">Prev Hash: {entry.prevHash.substring(0, 16)}...</p>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        );
    });


    return (
        <div className="min-h-screen bg-gray-900 text-white flex">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-gray-800 p-6 flex flex-col shadow-lg">
                <h1 className="text-3xl font-bold text-cyan-400 mb-8">Sonic Alchemy</h1>
                <nav className="flex-grow">
                    <ul>
                        <li className="mb-4">
                            <a href="#" onClick={() => setActiveTab('generate')} className={`flex items-center p-3 rounded-lg text-lg transition-colors duration-200 ${activeTab === 'generate' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                                <svg className="h-6 w-6 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"></path></svg>
                                Generate Music
                            </a>
                        </li>
                        <li className="mb-4">
                            <a href="#" onClick={() => setActiveTab('my_compositions')} className={`flex items-center p-3 rounded-lg text-lg transition-colors duration-200 ${activeTab === 'my_compositions' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                                <svg className="h-6 w-6 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path></svg>
                                My Compositions
                            </a>
                        </li>
                        <li className="mb-4">
                            <a href="#" onClick={() => setActiveTab('community_feed')} className={`flex items-center p-3 rounded-lg text-lg transition-colors duration-200 ${activeTab === 'community_feed' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                                <svg className="h-6 w-6 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-4 0c1.66 0 2.99-1.34 2.99-3S13.66 5 12 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zM8 13c-2.21 0-4 1.79-4 4v3h16v-3c0-2.21-1.79-4-4-4H8z"></path></svg>
                                Community Feed
                            </a>
                        </li>
                        <li className="mb-4">
                            <a href="#" onClick={() => setActiveTab('projects')} className={`flex items-center p-3 rounded-lg text-lg transition-colors duration-200 ${activeTab === 'projects' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                                <svg className="h-6 w-6 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M9 13H7v-2h2v2zm0 4H7v-2h2v2zm4-4h-2v-2h2v2zm0 4h-2v-2h2v2zm4-4h-2v-2h2v2zm0 4h-2v-2h2v2zM5 21h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2zm14-16v14H5V5h14z"></path></svg>
                                Projects
                            </a>
                        </li>
                        <li className="mb-4">
                            <a href="#" onClick={() => setActiveTab('finance')} className={`flex items-center p-3 rounded-lg text-lg transition-colors duration-200 ${activeTab === 'finance' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                                <svg className="h-6 w-6 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.5 13H11v-4h-1v4H8.5V9H11c.55 0 1 .45 1 1v2h.5c.55 0 1 .45 1 1v2zm-2.5-9h-1v2H11V6zm0 4h-1v2H11v-2z"></path></svg>
                                Financial Hub
                            </a>
                        </li>
                        <li className="mb-4">
                            <a href="#" onClick={() => setActiveTab('agents')} className={`flex items-center p-3 rounded-lg text-lg transition-colors duration-200 ${activeTab === 'agents' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                                <svg className="h-6 w-6 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
                                Agents
                            </a>
                        </li>
                        <li className="mb-4">
                            <a href="#" onClick={() => setActiveTab('audit')} className={`flex items-center p-3 rounded-lg text-lg transition-colors duration-200 ${activeTab === 'audit' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                                <svg className="h-6 w-6 mr-3" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"></path></svg>
                                Audit Log
                            </a>
                        </li>
                    </ul>
                </nav>

                {/* User Profile and Settings */}
                <div className="mt-auto pt-6 border-t border-gray-700">
                    <div className="flex items-center mb-4">
                        <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-10 h-10 rounded-full mr-3" />
                        <div>
                            <p className="font-semibold text-white">{currentUser.username}</p>
                            <p className="text-sm text-gray-400">{currentUser.subscriptionLevel} Member</p>
                        </div>
                    </div>
                    <ExportedButton onClick={() => setShowUserProfileModal(true)} className="w-full mb-2 bg-gray-700 hover:bg-gray-600">
                        View Profile
                    </ExportedButton>
                    <ExportedButton onClick={() => setShowSettingsModal(true)} className="w-full bg-gray-700 hover:bg-gray-600">
                        Settings
                    </ExportedButton>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-8 overflow-y-auto">
                {activeTab === 'generate' && (
                    <>
                        <ExportedSectionHeader title="Generate New Music" subtitle="Craft unique soundscapes with AI intelligence." />
                        <ExportedGenerationParametersForm
                            prompt={prompt} setPrompt={setPrompt}
                            currentGenre={currentGenre} setCurrentGenre={setCurrentGenre}
                            currentMood={currentMood} setCurrentMood={setCurrentMood}
                            currentTempo={currentTempo} setCurrentTempo={setCurrentTempo}
                            currentDuration={currentDuration} setCurrentDuration={setCurrentDuration}
                            currentKey={currentKey} setCurrentKey={setCurrentKey}
                            currentInstruments={currentInstruments} setCurrentInstruments={setCurrentInstruments}
                            creativityTemperature={creativityTemperature} setCreativityTemperature={setCreativityTemperature}
                            diversityPenalty={diversityPenalty} setDiversityPenalty={setDiversityPenalty}
                            selectedModel={selectedModel} setSelectedModel={setSelectedModel}
                            selectedOutputFormat={selectedOutputFormat} setSelectedOutputFormat={setSelectedOutputFormat}
                            styleReferenceId={styleReferenceId} setStyleReferenceId={setStyleReferenceId}
                            compositions={compositions}
                            isLoading={isLoading} handleGenerate={handleGenerate}
                            generateProgress={generateProgress} isGeneratingAudio={isGeneratingAudio}
                            generationStatusMessage={generationStatusMessage}
                        />
                        {result && (
                            <Card className="mt-8">
                                <ExportedSectionHeader title="Last Generated Composition" subtitle="Review your latest AI creation." className="!mb-4" />
                                <ExportedCompositionDetailCard
                                    composition={result}
                                    onPlay={handlePlayComposition}
                                    onSave={handleSaveComposition}
                                    onDelete={handleDeleteComposition}
                                    onRemix={(comp) => {
                                        setPrompt(comp.originalPrompt); // Use original prompt for remix base
                                        setCurrentGenre(comp.genre);
                                        setCurrentMood(comp.mood);
                                        setCurrentTempo(comp.tempo);
                                        setCurrentDuration(comp.durationSeconds);
                                        setCurrentKey(comp.keySignature);
                                        setCurrentInstruments(comp.instrumentation);
                                        setCreativityTemperature(comp.generationParameters.creativityTemperature);
                                        setDiversityPenalty(comp.generationParameters.diversityPenalty);
                                        setStyleReferenceId(comp.id); // Set the current comp as style reference
                                        setSelectedModel(comp.modelUsed);
                                        setSelectedOutputFormat(comp.generationParameters.outputFormat);
                                        addNotification({ type: 'info', message: `Remixed "${comp.title}". Parameters loaded into generator.` });
                                        setActiveTab('generate');
                                    }}
                                    onShare={(comp) => { setCompositionToShare(comp); setShowShareModal(true); }}
                                    playbackState={playbackState}
                                    isPlayingGlobally={isPlaying}
                                    handleTogglePlayPauseGlobally={handleTogglePlayPause}
                                    currentUser={currentUser}
                                    projects={projects}
                                    onAddRemoveCompToProject={handleAddRemoveCompToProject}
                                />
                            </Card>
                        )}
                    </>
                )}

                {activeTab === 'my_compositions' && (
                    <>
                        <ExportedSectionHeader title="My Compositions" subtitle="All your creative works, organized and ready." />
                        <div className="mb-6 flex space-x-4">
                            <ExportedInput
                                label="Search"
                                placeholder="Search by title or tags..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1"
                                label=""
                            />
                            <ExportedSelect
                                label="Filter by Genre"
                                value={filterGenre}
                                onChange={(e) => setFilterGenre(e.target.value)}
                                options={[{ value: 'All', label: 'All Genres' }, ...GENRES.map(g => ({ value: g, label: g }))]}
                            />
                            <ExportedSelect
                                label="Filter by Mood"
                                value={filterMood}
                                onChange={(e) => setFilterMood(e.target.value)}
                                options={[{ value: 'All', label: 'All Moods' }, ...MOODS.map(m => ({ value: m, label: m }))]}
                            />
                            <ExportedSelect
                                label="Filter by Project"
                                value={projectFilterId || 'All'}
                                onChange={(e) => setProjectFilterId(e.target.value === 'All' ? null : e.target.value)}
                                options={[{ value: 'All', label: 'All Projects' }, ...projects.map(p => ({ value: p.id, label: p.name }))]}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {compositions
                                .filter(comp => comp.userId === currentUser.id)
                                .filter(comp => searchTerm === '' || comp.title.toLowerCase().includes(searchTerm.toLowerCase()) || comp.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
                                .filter(comp => filterGenre === 'All' || comp.genre === filterGenre)
                                .filter(comp => filterMood === 'All' || comp.mood.includes(filterMood))
                                .filter(comp => projectFilterId === null || (projects.find(p => p.id === projectFilterId)?.compositionIds.includes(comp.id)))
                                .map(comp => (
                                    <ExportedCompositionDetailCard
                                        key={comp.id}
                                        composition={comp}
                                        onPlay={handlePlayComposition}
                                        onSave={handleSaveComposition}
                                        onDelete={handleDeleteComposition}
                                        onRemix={(comp) => {
                                            setPrompt(comp.originalPrompt);
                                            setCurrentGenre(comp.genre);
                                            setCurrentMood(comp.mood);
                                            setCurrentTempo(comp.tempo);
                                            setCurrentDuration(comp.durationSeconds);
                                            setCurrentKey(comp.keySignature);
                                            setCurrentInstruments(comp.instrumentation);
                                            setCreativityTemperature(comp.generationParameters.creativityTemperature);
                                            setDiversityPenalty(comp.generationParameters.diversityPenalty);
                                            setStyleReferenceId(comp.id);
                                            setSelectedModel(comp.modelUsed);
                                            setSelectedOutputFormat(comp.generationParameters.outputFormat);
                                            addNotification({ type: 'info', message: `Remixed "${comp.title}". Parameters loaded into generator.` });
                                            setActiveTab('generate');
                                        }}
                                        onShare={(comp) => { setCompositionToShare(comp); setShowShareModal(true); }}
                                        playbackState={playbackState}
                                        isPlayingGlobally={isPlaying}
                                        handleTogglePlayPauseGlobally={handleTogglePlayPause}
                                        currentUser={currentUser}
                                        projects={projects}
                                        onAddRemoveCompToProject={handleAddRemoveCompToProject}
                                    />
                                ))}
                        </div>
                        {compositions.filter(comp => comp.userId === currentUser.id).length === 0 && (
                            <p className="text-gray-400 text-center mt-8">You haven't created any compositions yet. Start generating!</p>
                        )}
                    </>
                )}

                {activeTab === 'community_feed' && (
                    <>
                        <ExportedSectionHeader title="Community Feed" subtitle="Discover and explore public compositions from other creators." />
                        <div className="mb-6 flex space-x-4">
                            <ExportedInput
                                label="Search"
                                placeholder="Search all public compositions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1"
                                label=""
                            />
                            <ExportedSelect
                                label="Filter by Genre"
                                value={filterGenre}
                                onChange={(e) => setFilterGenre(e.target.value)}
                                options={[{ value: 'All', label: 'All Genres' }, ...GENRES.map(g => ({ value: g, label: g }))]}
                            />
                            <ExportedSelect
                                label="Filter by Mood"
                                value={filterMood}
                                onChange={(e) => setFilterMood(e.target.value)}
                                options={[{ value: 'All', label: 'All Moods' }, ...MOODS.map(m => ({ value: m, label: m }))]}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {compositions
                                .filter(comp => comp.isPublic && comp.userId !== currentUser.id) // Only public compositions not by current user
                                .filter(comp => searchTerm === '' || comp.title.toLowerCase().includes(searchTerm.toLowerCase()) || comp.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
                                .filter(comp => filterGenre === 'All' || comp.genre === filterGenre)
                                .filter(comp => filterMood === 'All' || comp.mood.includes(filterMood))
                                .map(comp => (
                                    <ExportedCompositionDetailCard
                                        key={comp.id}
                                        composition={comp}
                                        onPlay={handlePlayComposition}
                                        onSave={handleSaveComposition} // Community compositions can be liked/commented, triggering a save
                                        onDelete={() => Promise.resolve(false)} // Cannot delete community compositions
                                        onRemix={(comp) => {
                                            setPrompt(comp.originalPrompt);
                                            setCurrentGenre(comp.genre);
                                            setCurrentMood(comp.mood);
                                            setCurrentTempo(comp.tempo);
                                            setCurrentDuration(comp.durationSeconds);
                                            setCurrentKey(comp.keySignature);
                                            setCurrentInstruments(comp.instrumentation);
                                            setCreativityTemperature(comp.generationParameters.creativityTemperature);
                                            setDiversityPenalty(comp.generationParameters.diversityPenalty);
                                            setStyleReferenceId(comp.id);
                                            setSelectedModel(comp.modelUsed);
                                            setSelectedOutputFormat(comp.generationParameters.outputFormat);
                                            addNotification({ type: 'info', message: `Remixed "${comp.title}". Parameters loaded into generator.` });
                                            setActiveTab('generate');
                                        }}
                                        onShare={(comp) => { setCompositionToShare(comp); setShowShareModal(true); }}
                                        playbackState={playbackState}
                                        isPlayingGlobally={isPlaying}
                                        handleTogglePlayPauseGlobally={handleTogglePlayPause}
                                        currentUser={currentUser}
                                        projects={[]} // No project interaction for community items
                                        onAddRemoveCompToProject={() => Promise.resolve(false)}
                                    />
                                ))}
                        </div>
                        {compositions.filter(comp => comp.isPublic && comp.userId !== currentUser.id).length === 0 && (
                            <p className="text-gray-400 text-center mt-8">No public compositions in the community feed yet.</p>
                        )}
                    </>
                )}

                {activeTab === 'projects' && (
                    <>
                        <ExportedSectionHeader title="My Projects" subtitle="Organize your compositions into collaborative projects." />
                        <Card className="mb-6">
                            <h3 className="text-xl font-semibold text-white mb-3">Create New Project</h3>
                            <ExportedInput label="Project Name" value="" onChange={() => {}} placeholder="e.g., Sci-Fi Soundtrack" name="newProjectName" />
                            <ExportedInput label="Description" value="" onChange={() => {}} rows={3} placeholder="A collection of themes for my upcoming game." name="newProjectDescription" />
                            <ExportedButton onClick={() => handleCreateProject("New Project", "A project description.")} className="w-full">
                                Create Project
                            </ExportedButton>
                        </Card>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map(project => (
                                <Card key={project.id} className="flex flex-col">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                                        <div className="flex space-x-2">
                                            <ExportedIconButton
                                                onClick={() => handleUpdateProject({ ...project, name: project.name + ' (Edited)' })} // Example update
                                                icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>}
                                                tooltip="Edit Project"
                                            />
                                            <ExportedIconButton
                                                onClick={() => handleDeleteProject(project.id)}
                                                icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1H9a1 1 0 00-1 1v3m-3 0h14"></path></svg>}
                                                tooltip="Delete Project"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-gray-300 text-sm mb-4 flex-grow">{project.description}</p>
                                    <p className="text-gray-400 text-xs mb-2">Compositions: {project.compositionIds.length}</p>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Shared: {project.isShared ? 'Yes' : 'No'}</span>
                                        <ExportedButton
                                            onClick={() => setShowProjectsModal(true)} // Example, could be a dedicated modal to manage project comps
                                            className="!py-1 !px-3 text-xs bg-gray-600 hover:bg-gray-500"
                                        >
                                            View Compositions
                                        </ExportedButton>
                                    </div>
                                </Card>
                            ))}
                        </div>
                        {projects.length === 0 && (
                            <p className="text-gray-400 text-center mt-8">You haven't created any projects yet.</p>
                        )}
                    </>
                )}

                {activeTab === 'finance' && (
                    <ExportedFinancialView
                        currentUser={currentUser}
                        userStats={userStats}
                        defaultTokenId={appSettings.defaultCurrencyTokenId}
                        onInitiateTransaction={handleInitiateTransaction}
                        transactionRecipientId={transactionRecipientId}
                        setTransactionRecipientId={setTransactionRecipientId}
                        transactionAmount={transactionAmount}
                        setTransactionAmount={setTransactionAmount}
                        transactionTokenId={transactionTokenId}
                        setTransactionTokenId={setTransactionTokenId}
                        transactionMemo={transactionMemo}
                        setTransactionMemo={setTransactionMemo}
                        transactionStatus={transactionStatus}
                        isLoading={isLoading}
                        recentTransactions={recentTransactions}
                    />
                )}

                {activeTab === 'agents' && (
                    <ExportedAgentIntelligenceView
                        monitoringAgent={monitoringAgent}
                        remediationAgent={remediationAgent}
                        orchestrationAgent={orchestrationAgent}
                        addNotification={addNotification}
                    />
                )}

                {activeTab === 'audit' && (
                    <ExportedAuditLogView getAuditLog={getAuditLog} />
                )}
            </main>

            {/* Global Music Player Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 flex items-center justify-between z-40">
                {playbackState.currentCompositionId ? (
                    <>
                        <div className="flex items-center">
                            <ExportedIconButton
                                onClick={handleTogglePlayPause}
                                icon={playbackState.isPlaying ? <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg> : <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>}
                                tooltip={playbackState.isPlaying ? "Pause" : "Play"}
                                className="mr-3 !bg-cyan-600 hover:!bg-cyan-700 !text-white !p-2 rounded-lg"
                            />
                            <div className="mr-4">
                                <p className="text-white font-semibold">{compositions.find(c => c.id === playbackState.currentCompositionId)?.title || 'Unknown'}</p>
                                <p className="text-gray-400 text-sm">{formatDuration(playbackState.currentTime)} / {formatDuration(playbackState.duration)}</p>
                            </div>
                        </div>

                        <div className="flex-1 mx-4">
                            <input
                                type="range"
                                min="0"
                                max={playbackState.duration}
                                value={playbackState.currentTime}
                                onChange={(e) => handleSeek(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                        </div>

                        <div className="flex items-center space-x-4">
                            <ExportedSelect
                                label=""
                                value={playbackState.playbackSpeed.toString()}
                                onChange={e => handleSetPlaybackSpeed(Number(e.target.value))}
                                options={PLAYBACK_SPEED_OPTIONS.map(opt => ({ value: opt.value.toString(), label: opt.label }))}
                                className="w-20"
                            />
                            <ExportedIconButton
                                onClick={handleToggleMute}
                                icon={playbackState.isMuted ? <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .9-.2 1.75-.56 2.55l1.45 1.45A10.01 10.01 0 0021 12c0-4.24-3.07-7.72-7-8.48v2.05c2.97.7 5.16 3.23 5.16 6.43zM4.27 3L3 4.27 7.73 9H3v6h4l5 5V9L8.73 4.73 4.27 3zM10 15.17L7.83 13H5v-2h2.83l.88-.88L10 11.4V15.17z"></path></svg> : <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg>}
                                tooltip={playbackState.isMuted ? "Unmute" : "Mute"}
                                className="!bg-transparent hover:!bg-gray-700 !text-gray-300"
                            />
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={playbackState.volume}
                                onChange={(e) => handleSetVolume(Number(e.target.value))}
                                className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                            <ExportedIconButton
                                onClick={handleToggleLoop}
                                icon={<svg className={`h-6 w-6 ${playbackState.loop ? 'text-cyan-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8L17.65 16c.16-.4.35-.78.35-1.18 0-2.76-2.24-5-5-5H12zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L6.35 8c-.16.4-.35.78-.35 1.18 0 2.76 2.24 5 5 5h.01L16 19l-4 4v-3z"></path></svg>}
                                tooltip={playbackState.loop ? "Looping On" : "Looping Off"}
                                className="!bg-transparent hover:!bg-gray-700"
                            />
                            <ExportedIconButton
                                onClick={handleStopComposition}
                                icon={<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"></path></svg>}
                                tooltip="Stop Playback"
                                className="!bg-transparent hover:!bg-gray-700 !text-red-400"
                            />
                        </div>
                    </>
                ) : (
                    <p className="text-gray-400">No composition currently playing. Generate or select one to start.</p>
                )}
            </div>

            {/* Modals */}
            <ExportedModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} title="Application Settings">
                <ExportedSelect
                    label="Theme"
                    value={appSettings.theme}
                    onChange={e => setAppSettings(prev => ({ ...prev, theme: e.target.value as 'dark' | 'light' }))}
                    options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]}
                />
                <ExportedInput
                    label="Default Genre"
                    value={appSettings.defaultGenre}
                    onChange={e => setAppSettings(prev => ({ ...prev, defaultGenre: e.target.value }))}
                />
                <ExportedCheckbox
                    label="Auto-Save Generations"
                    checked={appSettings.autoSave}
                    onChange={e => setAppSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                />
                <ExportedCheckbox
                    label="Enable Notifications"
                    checked={appSettings.notificationsEnabled}
                    onChange={e => setAppSettings(prev => ({ ...prev, notificationsEnabled: e.target.checked }))}
                />
                <ExportedSelect
                    label="Audio Quality"
                    value={appSettings.audioQuality}
                    onChange={e => setAppSettings(prev => ({ ...prev, audioQuality: e.target.value as 'low' | 'medium' | 'high' }))}
                    options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }]}
                />
                <ExportedSelect
                    label="Default Output Format"
                    value={appSettings.defaultOutputFormat}
                    onChange={e => setAppSettings(prev => ({ ...prev, defaultOutputFormat: e.target.value as GenerationParameters['outputFormat'] }))}
                    options={OUTPUT_FORMATS}
                />
                <ExportedButton onClick={() => { setShowSettingsModal(false); addNotification({ type: 'success', message: 'Settings saved!' }); }} className="w-full mt-4">
                    Save Settings
                </ExportedButton>
            </ExportedModal>

            <ExportedModal isOpen={showUserProfileModal} onClose={() => setShowUserProfileModal(false)} title="User Profile">
                <div className="flex flex-col items-center">
                    <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-24 h-24 rounded-full mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">{currentUser.username}</h3>
                    <p className="text-gray-300 mb-4 text-center">{currentUser.bio}</p>
                    <div className="text-gray-400 text-sm w-full space-y-2">
                        <p><strong>Email:</strong> <span className="text-white">{currentUser.email}</span></p>
                        <p><strong>Member Since:</strong> <span className="text-white">{new Date(currentUser.memberSince).toLocaleDateString()}</span></p>
                        <p><strong>Subscription:</strong> <span className="text-cyan-300">{currentUser.subscriptionLevel}</span></p>
                        <p><strong>Storage:</strong> <span className="text-white">{currentUser.storageUsedGB.toFixed(2)} GB / {currentUser.maxStorageGB} GB</span></p>
                        <p><strong>Preferred Genre:</strong> <span className="text-white">{currentUser.preferredGenre}</span></p>
                        <p><strong>Preferred Instruments:</strong> <span className="text-white">{currentUser.preferredInstruments.join(', ')}</span></p>
                        <p><strong>Digital Identity ID:</strong> <span className="text-white text-xs">{currentUser.digitalIdentityId}</span></p>
                        <p><strong>Tokens Owned:</strong> <span className="text-white">{userStats.totalTokensOwned.toFixed(programmableTokenRailService.getTokenMetadata(appSettings.defaultCurrencyTokenId)?.decimals || 2)} {programmableTokenRailService.getTokenMetadata(appSettings.defaultCurrencyTokenId)?.symbol}</span></p>
                    </div>
                    <h4 className="text-xl font-semibold text-white mt-6 mb-3">Your Stats</h4>
                    <div className="grid grid-cols-2 gap-4 w-full text-sm text-gray-400">
                        <p><strong>Total Compositions:</strong> <span className="text-white">{userStats.totalCompositions}</span></p>
                        <p><strong>Public Compositions:</strong> <span className="text-white">{userStats.publicCompositions}</span></p>
                        <p><strong>Total Playbacks:</strong> <span className="text-white">{userStats.totalPlaybacks}</span></p>
                        <p><strong>Total Likes Received:</strong> <span className="text-white">{userStats.totalLikesReceived}</span></p>
                        <p><strong>Most Used Genre:</strong> <span className="text-white">{userStats.mostUsedGenre}</span></p>
                        <p><strong>Most Used Instrument:</strong> <span className="text-white">{userStats.mostUsedInstrument}</span></p>
                    </div>
                </div>
            </ExportedModal>

            <ExportedModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title={`Share "${compositionToShare?.title || 'Composition'}"`}>
                <p className="text-gray-300 mb-4">Sharing will generate a public link and can be embedded elsewhere.</p>
                {compositionToShare && (
                    <div className="space-y-4">
                        <ExportedInput
                            label="Shareable Link"
                            value={`https://sonicalchemy.app/share/${compositionToShare.id}`}
                            disabled
                        />
                        <ExportedCheckbox
                            label="Make Public"
                            checked={compositionToShare.isPublic}
                            onChange={async (e) => {
                                const updatedComp = { ...compositionToShare, isPublic: e.target.checked };
                                await handleSaveComposition(updatedComp);
                                setCompositionToShare(updatedComp);
                                addNotification({ type: 'info', message: `Composition is now ${e.target.checked ? 'public' : 'private'}.` });
                            }}
                        />
                        <p className="text-gray-500 text-sm">Anyone with the link can view and play this composition if it's public.</p>
                        <ExportedButton onClick={() => {
                            navigator.clipboard.writeText(`https://sonicalchemy.app/share/${compositionToShare.id}`);
                            addNotification({ type: 'success', message: 'Share link copied to clipboard!' });
                            setShowShareModal(false);
                        }} className="w-full">
                            Copy Link
                        </ExportedButton>
                    </div>
                )}
            </ExportedModal>

            {/* Notification Tray */}
            {appSettings.notificationsEnabled && <ExportedNotificationTray />}
        </div>
    );
};

export default SonicAlchemyView;
```