/**
 * This module delivers the Code Archeologist View, a sophisticated interface for an Agentic AI system
 * designed to autonomously monitor, plan, and execute code refactoring and remediation tasks within a
 * secure, enterprise-grade financial infrastructure. It integrates advanced digital identity,
 * an internal secure messaging layer, and robust governance mechanisms to ensure auditable,
 * policy-compliant, and high-performance operations.
 *
 * Business Impact: This view provides unparalleled operational efficiency by automating complex,
 * time-consuming development operations. It critically reduces technical debt, improves code quality,
 * and accelerates feature delivery, directly translating to substantial cost savings, enhanced
 * developer productivity, and a more resilient, maintainable codebase capable of rapid evolution.
 * The autonomous management of codebase health minimizes human error, ensures continuous alignment
 * with architectural best practices, and secures competitive advantage through agile adaptation
 * within a demanding financial technology landscape. This system represents a revolutionary,
 * multi-million-dollar infrastructure leap by providing continuous codebase integrity and security.
 */
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";

// --- Global Constants for Simulation ---
export const SYSTEM_AGENT_ID = 'system-orchestrator-001';
export const CODE_ARCHEOLOGIST_AGENT_ID = 'agent-code-arch-001';
export const GOVERNANCE_AGENT_ID = 'agent-governance-002';

// --- Digital Identity and Trust Layer ---

/**
 * Represents a digital identity within the system, encapsulating cryptographic keys
 * for secure authentication and authorization. This is foundational for all secure
 * communications and role-based access controls across the platform.
 */
export interface DigitalIdentity {
    id: string;
    publicKey: string; // Simulated public key
    privateKey: string; // Simulated private key (NEVER expose in real world)
    role: string;
    sign(data: string): string; // Simulates cryptographic signing
    verify(data: string, signature: string, publicKey: string): boolean; // Simulates cryptographic verification
}

/**
 * The DigitalIdentityService manages the lifecycle and operations of digital identities.
 * It provides core functionalities for generating, authenticating, and authorizing
 * entities (agents, users, services) within the platform, establishing a root of trust.
 * Commercial Value: Enables secure, verifiable interactions critical for financial compliance,
 * fraud prevention, and maintaining data integrity in high-stakes environments.
 */
export class DigitalIdentityService {
    private identities = new Map<string, DigitalIdentity>();

    /**
     * Creates a new simulated digital identity with unique keys and assigns a role.
     * @param id The unique identifier for the identity.
     * @param role The role assigned to this identity (e.g., 'admin', 'agent', 'service').
     * @returns The newly created DigitalIdentity instance.
     */
    public createIdentity(id: string, role: string): DigitalIdentity {
        // In a real system, these would be strong asymmetric keys (e.g., ECDSA).
        // For simulation, we use simple string representations.
        const privateKey = `PK_${id}_${Math.random().toString(36).substring(2, 15)}`;
        const publicKey = `PUBK_${id}_${Math.random().toString(36).substring(2, 15)}`;

        const identity: DigitalIdentity = {
            id,
            publicKey,
            privateKey,
            role,
            sign: (data: string) => {
                // Simulate signing: simple hash of data + private key
                return btoa(`${data}:${privateKey}`).substring(0, 64);
            },
            verify: (data: string, signature: string, targetPublicKey: string) => {
                // Simulate verification: check if signature matches expected (based on public key)
                // In reality, this involves cryptographic operations.
                return targetPublicKey === publicKey && signature === btoa(`${data}:${privateKey}`).substring(0, 64);
            }
        };
        this.identities.set(id, identity);
        return identity;
    }

    /**
     * Retrieves an existing digital identity by its ID.
     * @param id The unique identifier of the identity.
     * @returns The DigitalIdentity instance or undefined if not found.
     */
    public getIdentity(id: string): DigitalIdentity | undefined {
        return this.identities.get(id);
    }

    /**
     * Authenticates a message using a signature and sender's public key.
     * @param senderId The ID of the sender.
     * @param data The original message data.
     * @param signature The cryptographic signature.
     * @returns True if the signature is valid for the given data and sender, false otherwise.
     */
    public authenticate(senderId: string, data: string, signature: string): boolean {
        const identity = this.getIdentity(senderId);
        if (!identity) return false;
        return identity.verify(data, signature, identity.publicKey);
    }

    /**
     * Authorizes an action based on an entity's role and required permissions.
     * This method represents a critical control point for access management.
     * @param identityId The ID of the entity requesting authorization.
     * @param requiredRole The minimum role required for the action.
     * @param action The specific action being authorized (for logging purposes).
     * @returns True if the identity has the required role, false otherwise.
     */
    public authorize(identityId: string, requiredRole: string, action: string): boolean {
        const identity = this.getIdentity(identityId);
        if (!identity) {
            console.warn(`Authorization failed: Identity ${identityId} not found for action ${action}.`);
            return false;
        }
        // Simple role check; in production, this would involve a granular permission matrix.
        const authorized = identity.role === requiredRole || identity.role === 'admin';
        if (!authorized) {
            console.warn(`Authorization failed for ${identityId} (role: ${identity.role}) attempting ${action}. Required role: ${requiredRole}`);
        }
        return authorized;
    }
}

// --- Agentic Intelligence Layer - Core Components ---

/**
 * Defines the structure of a message exchanged between autonomous agents.
 * Messages are cryptographically signed and include a nonce for replay protection,
 * ensuring secure and reliable inter-agent communication.
 */
export interface AgentMessage {
    senderId: string;
    recipientId: string;
    type: string; // e.g., 'REQUEST_PLAN', 'PLAN_GENERATED', 'ACTION_COMPLETE', 'ALERT'
    payload: any;
    timestamp: string;
    nonce: string; // Unique, single-use value for replay protection
    signature: string; // Cryptographic signature of the sender
}

/**
 * The AgentMessageBus facilitates secure, auditable communication between autonomous agents.
 * It ensures message integrity, authenticity, and provides a central hub for agent interactions,
 * critical for coordinated intelligent automation across the financial platform.
 * Commercial Value: Enables robust, distributed decision-making and execution without compromising
 * security or auditability, enhancing the platform's resilience and responsiveness to complex events.
 */
export class AgentMessageBus {
    private listeners = new Map<string, ((message: AgentMessage) => void)[]>();
    private digitalIdentityService: DigitalIdentityService;
    private processedNonces = new Set<string>(); // For replay protection

    constructor(digitalIdentityService: DigitalIdentityService) {
        this.digitalIdentityService = digitalIdentityService;
    }

    /**
     * Publishes a cryptographically signed message to the message bus for a specific recipient.
     * This method ensures messages are authenticated and protected against tampering and replay attacks.
     * @param senderIdentity The digital identity of the sending agent.
     * @param recipientId The ID of the intended recipient agent.
     * @param type The type of message (e.g., 'COMMAND', 'REPORT').
     * @param payload The content of the message.
     * @returns True if the message was sent successfully, false otherwise.
     */
    public sendMessage(senderIdentity: DigitalIdentity, recipientId: string, type: string, payload: any): boolean {
        const timestamp = new Date().toISOString();
        const nonce = Math.random().toString(36).substring(2, 15) + timestamp; // Simple nonce for simulation

        const messageData = JSON.stringify({ senderId: senderIdentity.id, recipientId, type, payload, timestamp, nonce });
        const signature = senderIdentity.sign(messageData);

        const message: AgentMessage = {
            senderId: senderIdentity.id,
            recipientId,
            type,
            payload,
            timestamp,
            nonce,
            signature,
        };

        // Simulate secure channel validation
        if (!this.digitalIdentityService.authenticate(message.senderId, messageData, message.signature)) {
            console.error(`Message from ${message.senderId} failed authentication.`);
            return false;
        }
        if (this.processedNonces.has(nonce)) {
            console.error(`Replay attack detected: Nonce ${nonce} already processed.`);
            return false;
        }

        this.processedNonces.add(nonce); // Mark nonce as used (for simulation)

        // Deliver message
        const recipientListeners = this.listeners.get(recipientId);
        if (recipientListeners) {
            recipientListeners.forEach(listener => listener(message));
        } else {
            console.warn(`No listeners for agent ${recipientId}. Message sent but not consumed.`);
        }
        return true;
    }

    /**
     * Subscribes an agent to receive messages intended for it.
     * @param agentId The ID of the agent subscribing.
     * @param listener The callback function to execute when a message is received.
     */
    public subscribe(agentId: string, listener: (message: AgentMessage) => void): void {
        if (!this.listeners.has(agentId)) {
            this.listeners.set(agentId, []);
        }
        this.listeners.get(agentId)?.push(listener);
    }

    /**
     * Unsubscribes an agent listener.
     * @param agentId The ID of the agent.
     * @param listener The specific listener function to remove.
     */
    public unsubscribe(agentId: string, listener: (message: AgentMessage) => void): void {
        const currentListeners = this.listeners.get(agentId);
        if (currentListeners) {
            this.listeners.set(agentId, currentListeners.filter(l => l !== listener));
        }
    }
}

/**
 * Defines the core structure for any autonomous agent within the system.
 * Agents execute intelligent automation workflows, observe system events, decide actions
 * based on embedded logic, and communicate securely. Each agent integrates digital identity
 * for secure operations and contributes to a tamper-evident audit trail.
 */
export interface Agent {
    id: string;
    name: string;
    role: string; // e.g., 'CodeArcheologist', 'FraudDetectionAgent', 'SettlementAgent'
    digitalIdentity: DigitalIdentity;
    skills: Map<string, AgentSkill>;
    status: 'idle' | 'running' | 'paused' | 'error';
    auditLog: AgentLogEntry[];
    messageBus: AgentMessageBus; // For secure inter-agent communication

    addSkill(skill: AgentSkill): void;
    execute(goal: string, context?: any): Promise<void>;
    logAction(action: string, details?: any): Promise<void>;
    sendMessage(recipientId: string, type: string, payload: any): boolean;
    handleMessage(message: AgentMessage): Promise<void>;
}

/**
 * Represents an entry in an agent's audit log, crucial for governance and traceability.
 * Includes a timestamp, action performed, and any relevant details, alongside a simulated hash
 * for tamper-evidence. This provides an immutable record of all agent activities.
 */
export interface AgentLogEntry {
    timestamp: string;
    action: string;
    details?: any;
    agentId: string;
    hash?: string; // Simulated cryptographic hash for tamper-evidence
}

/**
 * Defines the interface for a pluggable skill that an agent can possess and execute.
 * Skills encapsulate specific capabilities like monitoring, planning, or code modification,
 * enabling modular and extensible agent functionality.
 */
export interface AgentSkill {
    name: string;
    description: string;
    execute(context: any, agentIdentity: DigitalIdentity, messageBus: AgentMessageBus, auditLogger: SecureAuditLogger): Promise<string>;
    // Skills now have access to agent's identity and message bus for more complex operations
}

/**
 * Simulates a secure, tamper-evident audit log system for agents and the orchestrator.
 * This logger creates an immutable, hash-linked chain of events, critical for regulatory
 * compliance, forensic analysis, and proving operational integrity in a financial system.
 * Commercial Value: Provides an indisputable record of all system activities, enabling
 * stringent compliance, facilitating rapid incident response, and building trust through
 * transparent, verifiable operations.
 */
export class SecureAuditLogger {
    private logs: AgentLogEntry[] = [];
    private lastHash: string = ''; // Simulate chaining

    /**
     * Adds a log entry to the audit trail, ensuring its cryptographic linkage to previous entries.
     * @param entry The log entry to add.
     * @returns The newly added log entry with a simulated hash.
     */
    public async addEntry(entry: AgentLogEntry): Promise<AgentLogEntry> {
        const newEntry = {
            ...entry,
            timestamp: new Date().toISOString(),
        };
        newEntry.hash = this.generateSimulatedHash(newEntry, this.lastHash);
        this.logs.push(newEntry);
        this.lastHash = newEntry.hash;
        return newEntry;
    }

    /**
     * Generates a simulated hash for a log entry based on its content and the previous hash.
     * This method demonstrates the principle of tamper-evidence, where each log entry's integrity
     * is linked to the prior entry, creating an immutable chain crucial for auditing.
     * @param entry The current log entry.
     * @param prevHash The hash of the previous log entry.
     * @returns A simulated cryptographic hash string.
     */
    private generateSimulatedHash(entry: AgentLogEntry, prevHash: string): string {
        const data = JSON.stringify({ timestamp: entry.timestamp, action: entry.action, details: entry.details, agentId: entry.agentId, prevHash });
        // In a production system, `crypto.subtle.digest('SHA-256', ...)` would be used.
        return btoa(data).substring(0, 32);
    }

    /**
     * Retrieves all audit logs, providing a complete, ordered history of system activities.
     * @returns An array of all agent log entries.
     */
    public getLogs(): AgentLogEntry[] {
        return [...this.logs];
    }
}

// --- Governance Context Layer ---

/**
 * Defines a policy for governance, specifying rules and enforcement criteria.
 * These policies guide agent behavior and ensure operational integrity.
 */
export interface GovernancePolicy {
    id: string;
    name: string;
    description: string;
    rules: string[]; // e.g., "deny_code_modification_on_production", "require_test_coverage_gt_90%"
    enforce(context: any): boolean; // Method to check if policy is met
}

/**
 * The GovernancePolicyService manages and enforces governance policies across the platform.
 * It ensures that all agent actions comply with predefined rules, critical for regulatory
 * adherence and risk management in financial operations.
 * Commercial Value: Minimizes operational risk, ensures regulatory compliance, and provides
 * auditable policy enforcement, preventing unauthorized or non-compliant actions.
 */
export class GovernancePolicyService {
    private policies = new Map<string, GovernancePolicy>();

    constructor() {
        // Initialize with default policies
        this.addPolicy({
            id: 'REF_001',
            name: 'RefactoringApprovalPolicy',
            description: 'Requires human approval for code modifications in critical modules.',
            rules: ['code_modification_requires_human_review'],
            enforce: (context: { filePath: string; isAutomated: boolean }) => {
                if (context.isAutomated && context.filePath.includes('payment_processor')) {
                    console.warn(`Policy REF_001 triggered: Automated modification of ${context.filePath} requires human review.`);
                    // In a real system, this would trigger an approval workflow.
                    return false; // For simulation, fail if auto-modifying critical path
                }
                return true;
            }
        });
        this.addPolicy({
            id: 'TEST_001',
            name: 'AutomatedTestingPolicy',
            description: 'Requires successful automated tests after any code modification.',
            rules: ['all_tests_must_pass_after_modification'],
            enforce: (context: { testResult: 'pass' | 'fail' }) => context.testResult === 'pass'
        });
    }

    /**
     * Adds a new governance policy to the system.
     * @param policy The policy to add.
     */
    public addPolicy(policy: GovernancePolicy): void {
        this.policies.set(policy.id, policy);
    }

    /**
     * Checks if a given action complies with all relevant governance policies.
     * @param context The context of the action being performed.
     * @returns True if all policies are met, false otherwise.
     */
    public enforcePolicies(actionContext: any): boolean {
        let allPoliciesMet = true;
        for (const policy of Array.from(this.policies.values())) {
            if (!policy.enforce(actionContext)) {
                console.error(`Governance Policy ${policy.name} failed for action context:`, actionContext);
                allPoliciesMet = false;
            }
        }
        return allPoliciesMet;
    }
}


// --- Agentic AI System - Skills ---

/**
 * A concrete skill for monitoring a simulated codebase or repository.
 * This skill embodies the "observe" phase of the agent's workflow by assessing the current state
 * of code assets, identifying potential refactoring opportunities, and ensuring architectural
 * adherence. Business value: Proactive identification of technical debt and compliance issues
 * before they escalate, reducing remediation costs and ensuring continuous code quality,
 * thereby maintaining the integrity of critical financial systems.
 */
export class CodeMonitoringSkill implements AgentSkill {
    name = 'CodeMonitoringSkill';
    description = 'Monitors codebase health, identifies files, and detects potential refactoring opportunities or issues.';

    async execute(context: { filePath: string }, agentIdentity: DigitalIdentity, messageBus: AgentMessageBus, auditLogger: SecureAuditLogger): Promise<string> {
        await new Promise(r => setTimeout(r, 1000));
        // Simulate a message to a governance agent for policy check if needed
        messageBus.sendMessage(agentIdentity, GOVERNANCE_AGENT_ID, 'MONITORING_REPORT', { filePath: context.filePath, status: 'ok' });

        if (context.filePath.includes('payment_processor.py')) {
            const issue = `Identified opportunities for class-based refactoring in ${context.filePath} due to procedural design, improving modularity and testability.`;
            await auditLogger.addEntry({ action: `Monitoring detected issue`, details: { filePath: context.filePath, issue }, agentId: agentIdentity.id, timestamp: '' });
            return issue;
        }
        return `Successfully monitored ${context.filePath}. No immediate refactoring needs detected. Code health is good.`;
    }
}

/**
 * A concrete skill for planning refactoring tasks using a Large Language Model (LLM).
 * This skill represents the "decide" phase, leveraging advanced AI to transform high-level
 * goals into actionable, step-by-step plans. Business value: Dramatically accelerates
 * the planning phase of complex refactoring, enabling faster project turnaround and
 * ensuring best-practice alignment without extensive human oversight, directly impacting
 * time-to-market for new financial products.
 */
export class RefactoringPlanningSkill implements AgentSkill {
    name = 'RefactoringPlanningSkill';
    description = 'Generates a detailed step-by-step refactoring plan based on a given goal and codebase context using an AI.';
    private ai: GoogleGenAI;

    constructor(apiKey: string) {
        if (!apiKey) {
            console.error('API_KEY is missing for GoogleGenAI. Using a mock AI for planning.');
            this.ai = {
                models: {
                    generateContent: async ({ contents, model }) => {
                        console.warn(`Mocking AI response for model ${model} with contents: ${JSON.stringify(contents)}`);
                        return { candidates: [{ content: { parts: [{ text: 'Mock Plan:\n1. Create `PaymentProcessor` class.\n2. Move `process_payment` into class as a method.\n3. Update calling code.' }] } }] };
                    }
                }
            } as GoogleGenAI;
        } else {
            this.ai = new GoogleGenAI({ apiKey });
        }
    }

    async execute(context: { goal: string; fileContent?: string }, agentIdentity: DigitalIdentity, messageBus: AgentMessageBus, auditLogger: SecureAuditLogger): Promise<string> {
        const prompt = `Given the goal: "${context.goal}", generate a step-by-step refactoring plan for a Python file. Focus on converting procedural functions into a class-based structure. Provide the plan concisely, numbered, and with clear actions for each step.`;
        await new Promise(r => setTimeout(r, 2000));
        try {
            const response = await this.ai.models.generateContent({ model: 'gemini-pro', contents: [{ text: prompt }] });
            const plan = response.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate plan.';
            messageBus.sendMessage(agentIdentity, GOVERNANCE_AGENT_ID, 'PLANNING_REPORT', { goal: context.goal, planSummary: plan.substring(0, 100) });
            return `Plan generated:\n${plan}`;
        } catch (error) {
            const errorMessage = `Error generating refactoring plan: ${error instanceof Error ? error.message : String(error)}.`;
            console.error('Error generating refactoring plan with Google GenAI:', error);
            messageBus.sendMessage(agentIdentity, GOVERNANCE_AGENT_ID, 'PLANNING_ERROR', { goal: context.goal, error: errorMessage });
            return `${errorMessage} Providing a fallback plan. Fallback Plan: 1. Create a new class. 2. Move existing functions into methods. 3. Update calls.`;
        }
    }
}

/**
 * A concrete skill for simulating the modification of code files based on a refactoring plan.
 * This skill represents the "act" phase, applying concrete changes to the codebase.
 * Business value: Enables autonomous code transformation, eliminating manual intervention,
 * reducing human error, and ensuring consistency across large codebases, which is vital
 * for maintaining the integrity and scalability of financial software.
 */
export class CodeModificationSkill implements AgentSkill {
    name = 'CodeModificationSkill';
    description = 'Applies code changes based on a given refactoring step, ensuring idempotent operations.';

    async execute(context: { step: string; filePath: string; attempt: number }, agentIdentity: DigitalIdentity, messageBus: AgentMessageBus, auditLogger: SecureAuditLogger): Promise<string> {
        await new Promise(r => setTimeout(r, 1500));
        // Simulate idempotent action: if already applied, do nothing
        if (context.attempt > 1) {
            return `Modification for step: "${context.step}" to ${context.filePath} was already applied or is idempotent. No further action needed.`;
        }
        messageBus.sendMessage(agentIdentity, GOVERNANCE_AGENT_ID, 'CODE_MODIFICATION_EVENT', { filePath: context.filePath, step: context.step });
        return `Applied modification for step: "${context.step}" to ${context.filePath}. Successfully integrated changes.`;
    }
}

/**
 * A concrete skill for simulating the execution of unit and integration tests.
 * This skill is critical for the "act" phase, providing immediate feedback on the impact of
 * code changes, ensuring transactional guarantees for code integrity. Business value: Guarantees
 * that automated refactoring maintains or improves system stability and functionality,
 * preventing regressions and maintaining high-quality software delivery in a risk-averse financial domain.
 */
export class TestingSkill implements AgentSkill {
    name = 'TestingSkill';
    description = 'Executes tests to verify code changes and ensure functionality is preserved.';

    async execute(context: { filePath: string; testCommand?: string }, agentIdentity: DigitalIdentity, messageBus: AgentMessageBus, auditLogger: SecureAuditLogger): Promise<string> {
        await new Promise(r => setTimeout(r, 1500));
        const testPass = Math.random() > 0.1; // 10% chance of failure
        messageBus.sendMessage(agentIdentity, GOVERNANCE_AGENT_ID, 'TEST_RESULT', { filePath: context.filePath, result: testPass ? 'pass' : 'fail' });

        if (testPass) {
            return `Successfully ran tests for ${context.filePath}. All tests pass, ensuring functionality.`;
        } else {
            // Simulate sending a remediation request to another agent or flagging for human review.
            messageBus.sendMessage(agentIdentity, GOVERNANCE_AGENT_ID, 'TEST_FAILURE_ALERT', { filePath: context.filePath, error: 'Tests failed.' });
            throw new Error(`Tests failed for ${context.filePath} during step execution. Review and remediation required.`);
        }
    }
}

/**
 * A concrete skill for enforcing governance policies. This skill is critical for maintaining
 * compliance and operational integrity within the financial infrastructure, ensuring that
 * all automated actions align with predefined rules and regulations.
 * Commercial Value: Mitigates regulatory risk, prevents non-compliant operations, and
 * provides an auditable trail of policy adherence, essential for a trustworthy financial platform.
 */
export class PolicyEnforcementSkill implements AgentSkill {
    name = 'PolicyEnforcementSkill';
    description = 'Enforces governance policies for agent actions.';
    private governancePolicyService: GovernancePolicyService;

    constructor(governancePolicyService: GovernancePolicyService) {
        this.governancePolicyService = governancePolicyService;
    }

    async execute(context: any, agentIdentity: DigitalIdentity, messageBus: AgentMessageBus, auditLogger: SecureAuditLogger): Promise<string> {
        const policyContext = { ...context, agentId: agentIdentity.id, agentRole: agentIdentity.role };
        const policiesMet = this.governancePolicyService.enforcePolicies(policyContext);

        if (policiesMet) {
            return `Policies checked for action '${context.actionType || "unknown"}' by ${agentIdentity.id}. All policies met.`;
        } else {
            throw new Error(`Policy violation detected for action '${context.actionType || "unknown"}' by ${agentIdentity.id}.`);
        }
    }
}


/**
 * The CodeArcheologistAgent is a specialized autonomous agent focused on improving code quality
 * and maintaining architectural standards. It integrates various skills to perform autonomous
 * refactoring and remediation, embodying a secure, auditable monitor-decide-act loop.
 * This agent is a cornerstone of automated software development operations, enabling continuous
 * code health and accelerated innovation in a high-stakes financial environment.
 */
export class CodeArcheologistAgent implements Agent {
    id: string;
    name: string;
    role: string;
    digitalIdentity: DigitalIdentity;
    skills: Map<string, AgentSkill>;
    status: 'idle' | 'running' | 'paused' | 'error';
    auditLog: AgentLogEntry[] = [];
    private auditLogger: SecureAuditLogger;
    private logCallback: (entry: AgentLogEntry) => void;
    messageBus: AgentMessageBus;
    private governancePolicyService: GovernancePolicyService;

    constructor(
        id: string,
        name: string,
        role: string,
        digitalIdentity: DigitalIdentity,
        auditLogger: SecureAuditLogger,
        logCallback: (entry: AgentLogEntry) => void,
        messageBus: AgentMessageBus,
        governancePolicyService: GovernancePolicyService,
        apiKey: string
    ) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.digitalIdentity = digitalIdentity;
        this.skills = new Map();
        this.status = 'idle';
        this.auditLogger = auditLogger;
        this.logCallback = logCallback;
        this.messageBus = messageBus;
        this.governancePolicyService = governancePolicyService;

        this.addSkill(new CodeMonitoringSkill());
        this.addSkill(new RefactoringPlanningSkill(apiKey));
        this.addSkill(new CodeModificationSkill());
        this.addSkill(new TestingSkill());
        this.addSkill(new PolicyEnforcementSkill(this.governancePolicyService)); // New governance skill

        this.messageBus.subscribe(this.id, this.handleMessage.bind(this));
    }

    addSkill(skill: AgentSkill): void {
        this.skills.set(skill.name, skill);
        this.logAction(`Skill Added: ${skill.name}`);
    }

    async logAction(action: string, details?: any): Promise<void> {
        const entry: AgentLogEntry = {
            timestamp: '',
            action,
            details,
            agentId: this.id,
        };
        const loggedEntry = await this.auditLogger.addEntry(entry);
        this.auditLog.push(loggedEntry);
        this.logCallback(loggedEntry);
    }

    sendMessage(recipientId: string, type: string, payload: any): boolean {
        return this.messageBus.sendMessage(this.digitalIdentity, recipientId, type, payload);
    }

    async handleMessage(message: AgentMessage): Promise<void> {
        await this.logAction(`Received message from ${message.senderId} (Type: ${message.type})`, { payload: message.payload });
        // Agent logic to react to messages can be added here.
        // E.g., if type is 'START_REFACTORING', initiate execute workflow.
    }

    async execute(goal: string, context?: any): Promise<void> {
        this.status = 'running';
        await this.logAction(`Initiating Refactoring Goal: ${goal}`, { agentStatus: this.status });
        let currentFilePath = 'payment_processor.py'; // Simulate the target file for refactoring

        try {
            // Governance Check before starting any major operation
            await this.logAction('Enforcing policies before execution...', { skill: 'PolicyEnforcementSkill' });
            const policyCheck = await this.skills.get('PolicyEnforcementSkill')?.execute(
                { actionType: 'initiate_refactoring', filePath: currentFilePath, isAutomated: true },
                this.digitalIdentity, this.messageBus, this.auditLogger
            );
            await this.logAction(policyCheck || 'Policy check failed unexpectedly.');

            // Monitor phase: Assess the current state and identify opportunities.
            await this.logAction(`Monitoring target file: ${currentFilePath}`, { skill: 'CodeMonitoringSkill' });
            const monitoringResult = await this.skills.get('CodeMonitoringSkill')?.execute(
                { filePath: currentFilePath }, this.digitalIdentity, this.messageBus, this.auditLogger
            );
            await this.logAction(`Monitoring complete: ${monitoringResult}`);

            // Decide/Plan phase: Generate a detailed, actionable plan using AI.
            await this.logAction('Generating refactoring plan...', { skill: 'RefactoringPlanningSkill' });
            const planResult = await this.skills.get('RefactoringPlanningSkill')?.execute(
                { goal, fileContent: '...' }, this.digitalIdentity, this.messageBus, this.auditLogger
            );
            await this.logAction(planResult || 'Plan generation failed.');

            const planSteps = planResult?.split('\n').filter(line => line.match(/^\d+\./)) || [];
            if (planSteps.length === 0) {
                throw new Error('No valid refactoring plan could be generated by the AI. Aborting.');
            }

            // Act phase: Execute each step of the plan, with integrated testing and retry logic.
            for (let i = 0; i < planSteps.length; i++) {
                const step = planSteps[i];
                let attempt = 0;
                let stepSuccess = false;
                while (!stepSuccess && attempt < 3) { // Retry up to 3 times
                    attempt++;
                    try {
                        // Governance Check before code modification
                        await this.logAction(`Enforcing policies before step ${i + 1} modification (Attempt ${attempt})...`, { skill: 'PolicyEnforcementSkill' });
                        const modPolicyCheck = await this.skills.get('PolicyEnforcementSkill')?.execute(
                            { actionType: 'code_modification', filePath: currentFilePath, isAutomated: true, step },
                            this.digitalIdentity, this.messageBus, this.auditLogger
                        );
                        await this.logAction(modPolicyCheck || 'Policy check failed unexpectedly for modification.');

                        await this.logAction(`Executing Step ${i + 1} of ${planSteps.length}: ${step} (Attempt ${attempt})`, { skill: 'CodeModificationSkill' });
                        const modificationResult = await this.skills.get('CodeModificationSkill')?.execute(
                            { step, filePath: currentFilePath, attempt }, this.digitalIdentity, this.messageBus, this.auditLogger
                        );
                        await this.logAction(modificationResult || 'Code modification failed for this step.');

                        await this.logAction(`Running tests after Step ${i + 1} (Attempt ${attempt})...`, { skill: 'TestingSkill' });
                        const testResult = await this.skills.get('TestingSkill')?.execute(
                            { filePath: currentFilePath }, this.digitalIdentity, this.messageBus, this.auditLogger
                        );
                        await this.logAction(testResult || 'Tests failed after modification.');

                        // Governance Check after successful tests
                        await this.logAction(`Enforcing policies after step ${i + 1} tests...`, { skill: 'PolicyEnforcementSkill' });
                        const testPolicyCheck = await this.skills.get('PolicyEnforcementSkill')?.execute(
                            { actionType: 'post_modification_test', filePath: currentFilePath, testResult: 'pass' },
                            this.digitalIdentity, this.messageBus, this.auditLogger
                        );
                        await this.logAction(testPolicyCheck || 'Policy check failed unexpectedly after tests.');

                        stepSuccess = true; // Mark step as successful
                    } catch (stepError) {
                        await this.logAction(
                            `Error during Step ${i + 1} (Attempt ${attempt}): ${stepError instanceof Error ? stepError.message : String(stepError)}.`,
                            { error: stepError instanceof Error ? stepError.stack : String(stepError), agentStatus: 'error' }
                        );
                        if (attempt < 3) {
                            await this.logAction(`Retrying Step ${i + 1} after 2 seconds...`, { delay: '2s' });
                            await new Promise(r => setTimeout(r, 2000)); // Exponential backoff simulation
                        } else {
                            throw new Error(`Step ${i + 1} failed after multiple attempts. Aborting refactoring.`);
                        }
                    }
                }
            }

            await this.logAction('Refactoring complete. Initiating human review and final approval workflow.', { result: 'success', agentStatus: 'idle' });
            this.status = 'idle';

        } catch (error) {
            this.status = 'error';
            await this.logAction(
                `A critical error occurred during the refactoring cycle: ${error instanceof Error ? error.message : String(error)}. Escalating for human review.`,
                { error: error instanceof Error ? error.stack : String(error), agentStatus: 'error' }
            );
            // In a real system, this would trigger rollback, alert, or another remediation agent.
            console.error('CodeArcheologistAgent encountered a critical error:', error);
        } finally {
            this.status = 'idle';
        }
    }
}

/**
 * The AgentOrchestrator manages the lifecycle, coordination, and secure communication
 * of multiple autonomous agents within the financial infrastructure. It ensures message ordering,
 * maintains auditable logs of all interactions, and can coordinate complex multi-agent workflows.
 * Commercial Value: Provides a robust and scalable framework for intelligent automation,
 * maximizing operational efficiency, enabling adaptive system responses, and ensuring
 * cryptographic integrity across all automated processes. This is the central nervous system
 * for advanced financial automation.
 */
export class AgentOrchestrator {
    private agents = new Map<string, Agent>();
    private auditLogger: SecureAuditLogger;
    private messageBus: AgentMessageBus;
    private digitalIdentityService: DigitalIdentityService;
    private governancePolicyService: GovernancePolicyService;
    private logCallback: (entry: AgentLogEntry) => void;
    public status: 'idle' | 'running' | 'error' = 'idle';

    constructor(
        auditLogger: SecureAuditLogger,
        messageBus: AgentMessageBus,
        digitalIdentityService: DigitalIdentityService,
        governancePolicyService: GovernancePolicyService,
        logCallback: (entry: AgentLogEntry) => void,
        apiKey: string
    ) {
        this.auditLogger = auditLogger;
        this.messageBus = messageBus;
        this.digitalIdentityService = digitalIdentityService;
        this.governancePolicyService = governancePolicyService;
        this.logCallback = logCallback;

        // Create identities for core agents
        const archeologistIdentity = this.digitalIdentityService.createIdentity(CODE_ARCHEOLOGIST_AGENT_ID, 'CodeRefactorAgent');
        const governanceIdentity = this.digitalIdentityService.createIdentity(GOVERNANCE_AGENT_ID, 'GovernanceAgent');

        // Initialize agents
        this.addAgent(new CodeArcheologistAgent(
            CODE_ARCHEOLOGIST_AGENT_ID,
            'CodeArcheologistBot',
            'CodeRefactorAgent',
            archeologistIdentity,
            this.auditLogger,
            this.logCallback,
            this.messageBus,
            this.governancePolicyService,
            apiKey
        ));
        // Add a mock Governance Agent to listen for messages and enforce policies
        this.addAgent({
            id: GOVERNANCE_AGENT_ID,
            name: 'PolicyEnforcerBot',
            role: 'GovernanceAgent',
            digitalIdentity: governanceIdentity,
            skills: new Map(),
            status: 'idle',
            auditLog: [],
            messageBus: this.messageBus,
            addSkill: () => {},
            execute: async () => await this.logAction(`Governance Agent started.`, { status: 'idle' }),
            logAction: this.logAction.bind(this),
            sendMessage: (recipientId, type, payload) => this.messageBus.sendMessage(governanceIdentity, recipientId, type, payload),
            handleMessage: async (message) => {
                await this.logAction(`Governance Agent received message from ${message.senderId} (Type: ${message.type})`, { payload: message.payload });
                // Example: Governance Agent processes 'TEST_FAILURE_ALERT'
                if (message.type === 'TEST_FAILURE_ALERT') {
                    await this.logAction(`Governance Agent initiating remediation strategy for test failure in ${message.payload.filePath}.`, { type: 'alert', filePath: message.payload.filePath });
                    // In a real system, would trigger another agent for remediation or human approval workflow.
                }
                // Example: Enforce policy on Code Modification
                if (message.type === 'CODE_MODIFICATION_EVENT') {
                    const policyCheck = this.governancePolicyService.enforcePolicies({
                        actionType: 'code_modification',
                        filePath: message.payload.filePath,
                        isAutomated: true,
                        agentId: message.senderId,
                        agentRole: this.digitalIdentityService.getIdentity(message.senderId)?.role
                    });
                    if (!policyCheck) {
                        await this.logAction(`Governance Alert: Policy violation for ${message.senderId} on ${message.payload.filePath}`, { severity: 'critical' });
                    }
                }
                // Example: Enforce policy on Test Result
                if (message.type === 'TEST_RESULT') {
                    const policyCheck = this.governancePolicyService.enforcePolicies({
                        actionType: 'post_modification_test',
                        filePath: message.payload.filePath,
                        testResult: message.payload.result,
                        agentId: message.senderId,
                        agentRole: this.digitalIdentityService.getIdentity(message.senderId)?.role
                    });
                    if (!policyCheck) {
                        await this.logAction(`Governance Alert: Policy violation on test results for ${message.senderId} on ${message.payload.filePath}`, { severity: 'high' });
                    }
                }
            }
        });
    }

    /**
     * Adds an agent to the orchestrator's management.
     * @param agent The agent instance to add.
     */
    public addAgent(agent: Agent): void {
        this.agents.set(agent.id, agent);
        this.logAction(`Orchestrator added agent: ${agent.name} (${agent.id})`);
    }

    /**
     * Retrieves an agent by its ID.
     * @param id The ID of the agent.
     * @returns The agent instance or undefined.
     */
    public getAgent(id: string): Agent | undefined {
        return this.agents.get(id);
    }

    /**
     * Logs an action specific to the orchestrator, contributing to the central audit trail.
     * @param action The description of the action.
     * @param details Any additional details for the log entry.
     */
    public async logAction(action: string, details?: any): Promise<void> {
        const entry: AgentLogEntry = {
            timestamp: '',
            action,
            details,
            agentId: SYSTEM_AGENT_ID, // Orchestrator's own ID
        };
        const loggedEntry = await this.auditLogger.addEntry(entry);
        this.logCallback(loggedEntry);
    }

    /**
     * Initiates a complex workflow, coordinating multiple agents as needed.
     * This method acts as the entry point for high-level tasks.
     * @param workflowGoal The overarching goal of the workflow.
     */
    public async startWorkflow(workflowGoal: string): Promise<void> {
        this.status = 'running';
        await this.logAction(`Orchestrator initiating workflow: ${workflowGoal}`, { status: this.status });

        const archeologistAgent = this.getAgent(CODE_ARCHEOLOGIST_AGENT_ID);
        if (!archeologistAgent) {
            await this.logAction('Code Archeologist Agent not found.', { severity: 'critical' });
            this.status = 'error';
            return;
        }

        try {
            // Orchestrator delegates the primary task to the CodeArcheologistAgent
            await this.logAction(`Delegating refactoring task to ${archeologistAgent.name}...`);
            await archeologistAgent.execute(workflowGoal);
            await this.logAction(`Workflow '${workflowGoal}' completed by Code Archeologist Agent.`, { status: archeologistAgent.status });
        } catch (error) {
            this.status = 'error';
            await this.logAction(
                `Orchestrator detected a critical error during workflow '${workflowGoal}': ${error instanceof Error ? error.message : String(error)}.`,
                { error: error instanceof Error ? error.stack : String(error), status: this.status }
            );
        } finally {
            this.status = 'idle';
            await this.logAction(`Orchestrator workflow '${workflowGoal}' finished. Final status: ${this.status}`);
        }
    }
}


const CodeArcheologistView: React.FC = () => {
    const [goal, setGoal] = useState('Refactor the Python `payment_processor` service to use a class-based structure instead of standalone functions.');
    const [logEntries, setLogEntries] = useState<AgentLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [orchestratorStatus, setOrchestratorStatus] = useState<AgentOrchestrator['status']>('idle');

    // Memoized instances for core services, ensuring singletons across renders.
    const digitalIdentityService = useMemo(() => new DigitalIdentityService(), []);
    const auditLogger = useMemo(() => new SecureAuditLogger(), []);
    const messageBus = useMemo(() => new AgentMessageBus(digitalIdentityService), [digitalIdentityService]);
    const governancePolicyService = useMemo(() => new GovernancePolicyService(), []);

    const orchestrator = useMemo(() => {
        const apiKey = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY;
        return new AgentOrchestrator(
            auditLogger,
            messageBus,
            digitalIdentityService,
            governancePolicyService,
            (entry) => {
                setLogEntries(prev => [...prev, entry]); // Update UI log with new audit entry from any source
                // Update orchestrator status based on its internal state, if applicable.
                if (entry.agentId === SYSTEM_AGENT_ID) {
                    setOrchestratorStatus(orchestrator.status);
                }
            },
            apiKey as string
        );
    }, [auditLogger, messageBus, digitalIdentityService, governancePolicyService]);


    const runSimulation = useCallback(async () => {
        setIsLoading(true);
        setLogEntries([]);
        setOrchestratorStatus('running');

        try {
            await orchestrator.startWorkflow(goal);
        } catch (error) {
            const errorMessage = `View-level error during orchestrator workflow: ${error instanceof Error ? error.message : String(error)}`;
            console.error(errorMessage);
            setLogEntries(prev => [...prev, {
                timestamp: new Date().toISOString(),
                action: 'Orchestrator Workflow Error',
                details: errorMessage,
                agentId: SYSTEM_AGENT_ID,
                hash: ''
            }]);
            setOrchestratorStatus('error');
        } finally {
            setIsLoading(false);
            setOrchestratorStatus(orchestrator.status); // Ensure UI reflects final orchestrator status
        }
    }, [goal, orchestrator]);

    // Effect to ensure orchestrator status is correctly reflected in UI on initial load or orchestrator changes
    useEffect(() => {
        setOrchestratorStatus(orchestrator.status);
    }, [orchestrator.status]);


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white tracking-wider">Blueprint 112: Code Archeologist Agent Workflow (Orchestrated)</h1>
            <Card title="Agentic Refactoring Goal & Orchestration">
                <textarea
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-700/50 p-3 rounded text-white text-lg focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="Enter the refactoring goal for the agent..."
                    aria-label="Refactoring Goal Input"
                />
                <button
                    onClick={runSimulation}
                    disabled={isLoading || orchestratorStatus === 'running'}
                    className={`w-full mt-4 py-2 rounded transition-colors ${isLoading || orchestratorStatus === 'running'
                        ? 'bg-gray-600 cursor-not-allowed opacity-70'
                        : 'bg-cyan-600 hover:bg-cyan-700'
                    }`}
                >
                    {isLoading ? 'Orchestrator Working...' : `Start Autonomous Refactor Workflow (Status: ${orchestratorStatus.charAt(0).toUpperCase() + orchestratorStatus.slice(1)})`}
                </button>
            </Card>

            {(isLoading || logEntries.length > 0) && (
                <Card title="Agent Orchestration Audit Log">
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto p-2 font-mono text-xs text-gray-300 whitespace-pre-line bg-gray-800 rounded">
                        {logEntries.map((entry, i) => (
                            <div key={i} className="flex items-start">
                                <span className="text-gray-500 mr-2 min-w-[100px]">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                                <span className={
                                    entry.action.includes('Error') || entry.action.includes('failed') || entry.action.includes('Aborting') || entry.action.includes('Alert') || entry.action.includes('violation')
                                        ? 'text-red-400'
                                        : entry.agentId === SYSTEM_AGENT_ID
                                            ? 'text-purple-400' // Orchestrator actions
                                            : entry.agentId === GOVERNANCE_AGENT_ID
                                                ? 'text-yellow-400' // Governance Agent actions
                                                : 'text-green-400' // Code Archeologist actions
                                }>
                                    <span className="font-bold mr-1">[{entry.agentId === SYSTEM_AGENT_ID ? 'ORCH' : entry.agentId === GOVERNANCE_AGENT_ID ? 'GOV' : 'ARCH'}]</span>
                                    {entry.action}
                                    {entry.details && typeof entry.details === 'string' && entry.details.length < 100 && ` (${entry.details})`}
                                    {entry.details && typeof entry.details === 'object' && !Array.isArray(entry.details) && JSON.stringify(entry.details, null, 2).length < 200 && (
                                        <pre className="text-gray-500 text-xs mt-1 ml-2 overflow-x-auto">{JSON.stringify(entry.details, null, 2)}</pre>
                                    )}
                                    {entry.hash && <span className="text-gray-600 ml-2">Hash: {entry.hash.substring(0, 8)}...</span>}
                                </span>
                            </div>
                        ))}
                        {isLoading && <p className="text-cyan-400 animate-pulse mt-2">Orchestrator is actively managing agents...</p>}
                    </div>
                </Card>
            )}
            <Card title="Overall System Governance & Monitoring (Simulated)">
                <div className="text-sm text-gray-400 space-y-2">
                    <p><span className="font-semibold text-white">Orchestrator ID:</span> {SYSTEM_AGENT_ID}</p>
                    <p><span className="font-semibold text-white">Current Orchestrator Status:</span> <span className={`font-bold ${orchestratorStatus === 'running' ? 'text-cyan-400' : orchestratorStatus === 'error' ? 'text-red-400' : 'text-green-400'}`}>{orchestratorStatus.toUpperCase()}</span></p>
                    <p className="pt-2 text-cyan-200">
                        This orchestrator manages a multi-agent system, operating under strict governance policies,
                        with every action and inter-agent communication logged to a tamper-evident audit trail (simulated).
                        Digital identities and role-based access control ensure agents perform only permitted operations,
                        reducing operational risk, enhancing compliance, and providing full transparency for all automated
                        code transformations within this next-generation financial infrastructure.
                    </p>
                    <p className="pt-2 text-purple-200">
                        <span className="font-semibold text-white">Managed Agents:</span>
                        <ul>
                            <li>- Code Archeologist Agent ({CODE_ARCHEOLOGIST_AGENT_ID}): Focuses on code quality and refactoring.</li>
                            <li>- Governance Agent ({GOVERNANCE_AGENT_ID}): Monitors policy compliance and responds to alerts.</li>
                        </ul>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default CodeArcheologistView;