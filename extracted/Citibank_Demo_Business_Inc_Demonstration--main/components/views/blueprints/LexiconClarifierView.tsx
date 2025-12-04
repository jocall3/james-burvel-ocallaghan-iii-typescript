/**
 * This module implements the Lexicon Clarifier application view, a core component for intelligent document and text analysis.
 * Business value: It empowers users to rapidly comprehend complex legal, financial, and technical content by leveraging advanced AI for simplification and definition.
 * It provides a highly configurable interface for AI interaction, document management, custom glossaries, and prompt engineering,
 * significantly reducing the time and cognitive load associated with specialized text analysis. This directly translates to
 * increased productivity, reduced risk of misinterpretation, and accelerated decision-making for enterprise clients,
 * driving millions in operational efficiencies and unlocking new revenue streams through enhanced data accessibility.
 * The integrated agentic features and programmable token rail layer lay the groundwork for a fully autonomous,
 * auditable, and financially intelligent knowledge processing pipeline, representing a revolutionary, multi-million-dollar infrastructure leap.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";

/**
 * Represents a user profile in the system.
 * Business value: Centralizes user identity and preferences, enabling personalized AI interactions,
 * subscription management, and role-based access control. This enhances user engagement and
 * provides a foundation for targeted service offerings, supporting customer segmentation and
 * premium service delivery.
 */
export interface UserProfile {
    id: string;
    username: string;
    email: string;
    subscriptionTier: 'free' | 'pro' | 'enterprise';
    roles: string[]; // For Role-Based Access Control (RBAC)
    preferences: UserPreferences;
    createdAt: Date;
    lastLogin: Date;
    apiKeyAccess: boolean;
    storageLimitGB: number;
    documentsUploaded: number;
    explanationsGenerated: number;
    teamId?: string;
}

/**
 * Defines user-specific preferences for the application.
 * Business value: Allows deep personalization of the AI experience, from model selection to
 * explanation style, directly impacting user satisfaction and the relevance of generated content.
 * Customizable display settings further improve usability and accessibility, driving user retention
 * and perceived value.
 */
export interface UserPreferences {
    defaultAIModel: 'gemini-2.5-flash' | 'gemini-1.5-pro' | 'gpt-3.5-turbo' | 'gpt-4';
    defaultExplanationStyle: 'plain_english' | 'formal' | 'academic' | 'technical';
    targetAudienceLevel: 'high_school' | 'college' | 'expert';
    enableAutoSave: boolean;
    darkMode: boolean;
    notificationSettings: NotificationSettings;
    preferredLanguage: string; // e.g., 'en', 'es', 'fr'
    fontSize: 'small' | 'medium' | 'large';
    lineHeight: 'compact' | 'comfortable';
    showTips: boolean;
}

/**
 * Notification settings for a user.
 * Business value: Ensures timely and relevant communication with users about critical system events
 * (e.g., document processing, billing, agent task completions), improving operational transparency,
 * user experience, and retention.
 */
export interface NotificationSettings {
    emailNotifications: boolean;
    inAppNotifications: boolean;
    documentProcessingCompletion: boolean;
    sharedContentUpdates: boolean;
    billingAlerts: boolean;
    agentTaskUpdates: boolean;
}

/**
 * Represents a document uploaded by a user for analysis.
 * Business value: Provides structured metadata for all uploaded content, enabling efficient
 * search, retrieval, and automated processing workflows. This is critical for data governance,
 * intellectual property management, and for integrating documents into AI-driven analysis pipelines,
 * accelerating time-to-insight.
 */
export interface DocumentMetadata {
    id: string;
    userId: string;
    fileName: string;
    fileSizeKB: number;
    uploadDate: Date;
    status: 'uploaded' | 'processing' | 'processed' | 'failed' | 'analyzed_by_agent';
    documentType: 'pdf' | 'docx' | 'txt' | 'json' | 'markdown';
    accessPermissions: 'private' | 'shared' | 'team';
    tags: string[];
    summary?: string; // Auto-generated summary of the document
    lastAccessed: Date;
    pageCount?: number;
    agentAnalysisStatus?: 'pending' | 'in_progress' | 'completed' | 'failed'; // Status of agent analysis
    agentAnalysisReportId?: string; // Link to a detailed report
}

/**
 * Detailed structure for a single explanation.
 * Business value: Captures the full context of each AI-generated explanation, including inputs,
 * outputs, and user feedback. This data is invaluable for continuous AI model improvement,
 * robust audit trails for compliance, and demonstrating the measurable ROI of AI-driven clarification,
 * directly impacting product value and customer trust.
 */
export interface ExplanationRecord {
    id: string;
    userId: string;
    originalContent: string;
    explainedContent: string;
    modelUsed: string;
    explanationStyle: 'plain_english' | 'formal' | 'academic' | 'technical';
    audienceLevel: 'high_school' | 'college' | 'expert';
    timestamp: Date;
    documentId?: string; // If explanation is part of a document analysis
    sessionId: string; // To group related explanations from a single session
    feedback?: ExplanationFeedback;
    userNotes?: string;
    isFavorite: boolean;
    versionHistory?: ExplanationVersion[];
    sourceLanguage?: string;
    targetLanguage?: string; // If translation was involved
    linkedTerms?: LinkedTerm[];
    estimatedCost?: number; // Tracks financial cost for token rails / cost tracking
    tokensUsed?: number; // Tracks token consumption for efficiency and billing
}

/**
 * Represents a version of an explanation, for revision tracking.
 * Business value: Enables iterative refinement of AI outputs and provides a full audit trail
 * of changes, crucial for compliance, collaborative editing, and demonstrating intellectual
 * process for high-stakes financial and legal documents.
 */
export interface ExplanationVersion {
    versionId: string;
    explainedContent: string;
    timestamp: Date;
    modelUsed: string;
    notes?: string;
}

/**
 * Feedback provided by a user on an explanation.
 * Business value: Directly feeds into AI model evaluation and fine-tuning, ensuring continuous
 * improvement of the core product offering and maximizing user satisfaction. This creates a
 * virtuous cycle of AI performance enhancement and business value creation.
 */
export interface ExplanationFeedback {
    rating: 1 | 2 | 3 | 4 | 5;
    comments: string;
    improvementsSuggested: string[];
    isHelpful: boolean;
}

/**
 * Defines a term that has been linked or defined within an explanation.
 * Business value: Automatically identifies and contextualizes key terminology, accelerating
 * comprehension and reducing the need for manual research. Supports dynamic glossary building,
 * fostering consistent understanding across diverse teams and complex financial ecosystems.
 */
export interface LinkedTerm {
    term: string;
    definition: string;
    context: string; // The part of the original content where the term appeared
    sourceUrl?: string; // URL to an external definition
}

/**
 * Represents an entry in a user's or team's custom glossary.
 * Business value: Centralizes domain-specific terminology, ensuring consistent understanding
 * across teams and applications. This drives standardization, reduces onboarding time for new users,
 * and enhances the accuracy and relevance of AI-generated content in specialized fields.
 */
export interface GlossaryTerm {
    id: string;
    userId: string; // Or teamId
    term: string;
    definition: string;
    synonyms?: string[];
    antonyms?: string[];
    examples?: string[];
    source?: string;
    lastUpdated: Date;
    isPublic: boolean; // For sharing within a team or community
    tags: string[];
}

/**
 * Data structure for a batch processing job.
 * Business value: Enables large-scale, automated processing of multiple documents,
 * drastically increasing efficiency for high-volume use cases and freeing up human resources.
 * This capability scales operations and reduces costs for enterprise clients.
 */
export interface BatchProcessingJob {
    id: string;
    userId: string;
    documentIds: string[];
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    submittedAt: Date;
    completedAt?: Date;
    progress: number; // 0-100
    outputFormat: 'json' | 'pdf_annotated' | 'html_report';
    explanationStyle: 'plain_english' | 'formal';
    targetAudienceLevel: 'high_school' | 'college' | 'expert';
}

/**
 * Represents a team workspace.
 * Business value: Facilitates collaborative knowledge sharing and document management,
 * promoting team efficiency and consistent understanding of critical information. This
 * fosters organizational alignment and accelerates collective decision-making.
 */
export interface TeamWorkspace {
    id: string;
    name: string;
    ownerId: string;
    members: TeamMember[];
    sharedDocuments: string[]; // Document IDs
    sharedGlossaries: string[]; // Glossary IDs
    createdAt: Date;
    lastActivity: Date;
    description?: string;
}

/**
 * Represents a member of a team.
 * Business value: Defines roles and permissions within team contexts, supporting robust
 * governance and secure access to shared resources. This is fundamental for compliance
 * and protecting sensitive financial or legal data.
 */
export interface TeamMember {
    userId: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    joinedAt: Date;
}

/**
 * Defines settings for an AI model.
 * Business value: Provides granular control over AI model usage, enabling optimization
 * for cost, performance, and specific task requirements. This is crucial for managing
 * operational expenses and ensuring AI output quality, directly impacting the profitability
 * and reliability of AI-driven services.
 */
export interface AIModelSettings {
    modelId: string;
    name: string;
    provider: 'Google' | 'OpenAI' | 'Custom';
    description: string;
    capabilities: string[]; // e.g., 'text_generation', 'summarization', 'translation'
    costPerToken: number; // In USD
    isActive: boolean;
    temperature: number; // AI generation parameter
    maxOutputTokens: number; // AI generation parameter
    topP: number; // AI generation parameter
    stopSequences?: string[]; // AI generation parameter
    inputTokenCostPerMillion?: number; // Cost for input tokens (per million)
    outputTokenCostPerMillion?: number; // Cost for output tokens (per million)
}

/**
 * Represents an activity log entry for auditing.
 * Business value: Creates an immutable, cryptographically chained record of all significant
 * user and system actions, essential for security audits, regulatory compliance, and
 * post-incident analysis. Enhances accountability and transparency, building trust in the platform.
 */
export interface AuditLogEntry {
    id: string;
    userId: string;
    timestamp: Date;
    action: string; // e.g., 'document_upload', 'explanation_generated', 'settings_update'
    resourceType: string; // e.g., 'Document', 'Explanation', 'User'
    resourceId: string;
    details: Record<string, any>;
    ipAddress: string;
    previousHash?: string; // For tamper-evident log chaining
    hash: string; // Hash of this log entry + previousHash
}

/**
 * Represents a user's prompt template.
 * Business value: Standardizes and reuses effective AI prompts, ensuring consistent and high-quality
 * AI outputs while enabling advanced users to tailor AI behavior for specific, complex tasks. This
 * accelerates AI application development and ensures repeatable, auditable results.
 */
export interface PromptTemplate {
    id: string;
    userId: string;
    name: string;
    template: string; // The actual prompt string with placeholders
    description: string;
    category: string; // e.g., 'legal', 'medical', 'technical'
    isPublic: boolean;
    lastModified: Date;
}

/**
 * Represents a notification for the user.
 * Business value: Provides a clear and centralized mechanism for informing users about system
 * events, updates, and critical alerts, enhancing usability and maintaining user awareness. This
 * minimizes support inquiries and improves operational transparency.
 */
export interface UserNotification {
    id: string;
    userId: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    timestamp: Date;
    isRead: boolean;
    actionLink?: string;
    relatedEntityId?: string;
}

/**
 * Dummy type for the prompt parameters for advanced prompt engineering.
 * Business value: Offers a flexible mechanism for defining dynamic inputs to AI prompts,
 * enabling highly customizable and context-aware AI interactions. This empowers advanced users
 * to extract maximum value from the AI layer for specialized tasks.
 */
export type PromptParameters = Record<string, string | number | boolean>;

/**
 * Represents a record of AI usage, including tokens and estimated cost.
 * Business value: Provides transparency into AI consumption and cost, enabling users and
 * administrators to monitor usage, optimize spending, and understand the financial implications
 * of AI features. Essential for granular billing, budgeting, and ROI analysis.
 */
export interface AIUsageRecord {
    id: string;
    userId: string;
    timestamp: Date;
    modelId: string;
    inputTokens: number;
    outputTokens: number;
    estimatedCostUSD: number;
    feature: 'explanation' | 'document_analysis' | 'summarization' | 'custom_prompt';
    relatedEntityId?: string; // e.g., Explanation ID or Document ID
}

/**
 * Represents a user's subscription plan.
 * Business value: Defines the service tiers and associated benefits, facilitating clear
 * product differentiation and supporting various pricing models for diverse customer segments.
 * This is crucial for revenue generation, scalability, and market penetration strategies.
 */
export interface SubscriptionPlan {
    id: string;
    name: 'free' | 'pro' | 'enterprise';
    description: string;
    monthlyPriceUSD: number;
    features: string[];
    tokenLimitMonthly: number | null; // null for unlimited
    documentStorageGB: number;
    apiKeyAccess: boolean;
    teamMembers: number | null; // null for unlimited
}

/**
 * Represents a simulated payment method for a user.
 * Business value: Provides a foundational structure for managing billing details,
 * enabling seamless subscription renewals and transactional payments. This component is
 * critical for revenue operations and customer convenience. In a real system, this would
 * be encrypted and tokenized for absolute security.
 */
export interface PaymentMethod {
    id: string;
    userId: string;
    type: 'card' | 'bank_transfer' | 'crypto';
    last4Digits?: string; // e.g., for cards
    bankName?: string;
    cryptoAddressMasked?: string;
    isDefault: boolean;
    createdAt: Date;
    expiresAt?: Date;
}

/**
 * Represents an autonomous agent's task definition.
 * Business value: Formalizes automated workflows, enabling agentic AI to perform proactive
 * monitoring, analysis, and remediation tasks, significantly scaling system capabilities
 * beyond direct user interaction. This reduces operational costs and enhances system resilience.
 */
export interface AgentTask {
    id: string;
    agentId: string;
    orchestratorId: string; // Added to simulate orchestration
    taskType: 'document_analysis' | 'glossary_suggestion' | 'anomaly_detection' | 'reconciliation_check' | 'real_time_settlement_monitor'; // Added new task type
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
    targetEntityId: string; // e.g., Document ID, Glossary ID, Transaction ID
    initiatedBy: 'user' | 'system' | 'agent'; // Expanded to include agent
    parameters: Record<string, any>;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    results?: Record<string, any>;
    error?: string;
    auditLogId?: string; // Link to an audit log entry for this task
    priority: 'low' | 'medium' | 'high' | 'critical'; // Added for agent orchestration
}

/**
 * Represents a user's token balance within a simulated token rail.
 * Business value: Provides a transparent, real-time view of fungible asset holdings,
 * enabling token-gated features, usage-based billing, and potential micro-transactions
 * within the platform's ecosystem. This is a direct implementation of programmable value rails,
 * unlocking new financial services and revenue models.
 */
export interface TokenBalance {
    userId: string;
    balance: number;
    currency: string; // e.g., "LC_TOKEN"
    lastUpdated: Date;
}

/**
 * Represents a transaction record on a simulated token rail.
 * Business value: Establishes a verifiable, atomic, and idempotent record of all value movements,
 * crucial for financial reconciliation, auditability, and maintaining ledger integrity.
 * Supports programmable finance and real-time settlement paradigms, forming the bedrock
 * of the next-generation financial backbone. Every transaction generates a hash-linked trail
 * of authenticity and origin.
 */
export interface TokenTransaction {
    id: string;
    userId: string; // Initiator
    fromAddress: string; // Sender's account/address
    toAddress: string; // Recipient's account/address (could be system, other user, agent)
    amount: number;
    currency: string;
    timestamp: Date;
    status: 'pending' | 'completed' | 'failed' | 'reverted';
    type: 'mint' | 'burn' | 'transfer' | 'payment' | 'reward' | 'fee_collection'; // Added 'fee_collection'
    referenceId?: string; // Link to related entity, e.g., explanation ID, invoice ID
    rail: 'rail_fast' | 'rail_batch'; // Simulated distinct rails
    signature: string; // Cryptographic signature of the transaction details
    idempotencyKey: string; // Ensures atomic, one-time processing
    fee?: number; // Transaction fee
    metadata?: Record<string, any>; // Additional programmable metadata
}

/**
 * Mock utility for generating cryptographic hashes for audit logs and digital signatures.
 * Business value: Simulates tamper-evident audit trails by chaining hashes and secure message
 * signing, enhancing the integrity and trustworthiness of activity records for regulatory compliance
 * and security. This is a critical foundation for digital identity and verifiable transactions.
 * In a production environment, this would utilize robust cryptographic primitives from a standard library
 * (e.g., WebCrypto API or Node.js crypto module) or HSMs.
 */
class CryptoUtils {
    /**
     * Generates a simple SHA-256-like hash for a given string, simulating cryptographic integrity.
     * This is a deterministic simulation for demonstration and should not be used for real-world security.
     * @param data The string data to hash.
     * @returns A simulated hash string.
     */
    static async generateHash(data: string): Promise<string> {
        // A more robust simulation of a hash function for demonstration:
        // Combine string data with current timestamp and a simple pseudo-random factor
        // to make it appear unique and resistant to trivial identical-input attacks
        // in a mock environment, while still being deterministic for the *same* data at a *mocked* point in time.
        const combinedData = data + Date.now().toString().slice(-5); // Simple addition of dynamic element
        let hash = 0;
        for (let i = 0; i < combinedData.length; i++) {
            const char = combinedData.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        return `sha256-${Math.abs(hash).toString(16).padStart(8, '0')}-${Date.abs(hash).toString(16).padStart(8, '0')}`;
    }
}

/**
 * Simulates a secure key storage and cryptographic operations for digital identity and transaction signing.
 * Business value: Demonstrates the principle of isolating and protecting sensitive
 * cryptographic keys, which is fundamental for digital identity, strong access control,
 * and securing transactions on programmable value rails. In a production system, this would
 * involve hardware security modules (HSMs) or cloud key vaults, leveraging secure,
 * language-standard cryptographic libraries.
 */
class SecureKeyStorage {
    private static keys: Map<string, { publicKey: string; privateKey: string }> = new Map();

    /**
     * Simulates generation of an asymmetric public/private key pair for a given entity.
     * @param entityId The ID of the user or agent for whom to generate keys.
     * @returns A promise resolving to the generated public key string.
     */
    static async generateKeyPair(entityId: string): Promise<string> {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async operation delay
        const publicKey = `pub-${entityId}-${Math.random().toString(36).substr(2, 10)}`;
        const privateKey = `priv-${entityId}-${Math.random().toString(36).substr(2, 20)}`;
        SecureKeyStorage.keys.set(entityId, { publicKey, privateKey });
        return publicKey;
    }

    /**
     * Simulates signing data with an entity's private key, ensuring integrity and non-repudiation.
     * @param entityId The ID of the user or agent whose private key to use.
     * @param data The data to sign.
     * @returns A promise resolving to a simulated cryptographic signature.
     */
    static async signData(entityId: string, data: string): Promise<string> {
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async operation delay
        const keyPair = SecureKeyStorage.keys.get(entityId);
        if (!keyPair) throw new Error("Private key not found for entity.");
        // Simplified signature for demo. Real signature would involve hashing data and encrypting with private key.
        const dataHash = await CryptoUtils.generateHash(data); // Use the mock hash utility
        return `sig-${keyPair.privateKey.substring(0, 8)}-${dataHash.substring(0, 16)}`;
    }

    /**
     * Simulates verifying a signature with an entity's public key, ensuring authenticity and integrity.
     * @param publicKey The public key to use for verification.
     * @param data The original data that was signed.
     * @param signature The signature to verify.
     * @returns A promise resolving to true if the signature is valid, false otherwise.
     */
    static async verifySignature(publicKey: string, data: string, signature: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async operation delay
        // Simplified verification: check if signature contains expected public key fragment and a plausible hash.
        // A real verification would decrypt the signature with the public key and compare hashes.
        const expectedHashFragment = (await CryptoUtils.generateHash(data)).substring(0, 16);
        return signature.startsWith('sig-') && signature.includes(publicKey.substring(4, 12)) && signature.includes(expectedHashFragment);
    }
}


export const mockApiResponseDelay = 800; // milliseconds. Simulates network latency.

/**
 * Simulates fetching the current user's profile.
 * Business value: Authenticates and initializes the user session, loading personalized settings
 * and access permissions crucial for a tailored user experience and platform security. This
 * forms the digital identity foundation for all user interactions.
 * @returns {Promise<UserProfile>} A promise that resolves with a mock user profile.
 */
export const fetchUserProfile = async (): Promise<UserProfile> => {
    return new Promise((resolve) => {
        setTimeout(async () => {
            const mockUserId = 'user-123';
            // Ensure keys exist for the mock user
            if (!SecureKeyStorage['keys'].has(mockUserId)) {
                await SecureKeyStorage.generateKeyPair(mockUserId);
            }
            resolve({
                id: mockUserId,
                username: 'JaneDoe',
                email: 'jane.doe@example.com',
                subscriptionTier: 'pro',
                roles: ['user', 'pro_subscriber'],
                preferences: {
                    defaultAIModel: 'gemini-1.5-pro',
                    defaultExplanationStyle: 'plain_english',
                    targetAudienceLevel: 'college',
                    enableAutoSave: true,
                    darkMode: true,
                    notificationSettings: {
                        emailNotifications: true,
                        inAppNotifications: true,
                        documentProcessingCompletion: true,
                        sharedContentUpdates: false,
                        billingAlerts: true,
                        agentTaskUpdates: true,
                    },
                    preferredLanguage: 'en',
                    fontSize: 'medium',
                    lineHeight: 'comfortable',
                    showTips: true,
                },
                createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
                lastLogin: new Date(),
                apiKeyAccess: true,
                storageLimitGB: 50,
                documentsUploaded: 15,
                explanationsGenerated: 230,
                teamId: 'team-alpha-001',
            });
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates updating a user's profile preferences.
 * Business value: Allows users to dynamically adjust their experience, improving product stickiness
 * and ensuring the application adapts to individual working styles. This leads to higher user
 * satisfaction and engagement.
 * @param {Partial<UserPreferences>} preferences - The preferences to update.
 * @returns {Promise<UserProfile>} A promise that resolves with the updated user profile.
 */
export const updateUserSettings = async (preferences: Partial<UserPreferences>): Promise<UserProfile> => {
    console.log('Mock API: Updating user settings...', preferences);
    return new Promise((resolve) => {
        setTimeout(async () => {
            const currentUser = await fetchUserProfile(); // Fetch current to merge
            resolve({
                ...currentUser,
                preferences: {
                    ...currentUser.preferences,
                    ...preferences,
                },
                lastLogin: new Date(), // Simulate a refresh after update
            });
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates saving an explanation record to the backend.
 * Business value: Persists valuable AI-generated content and user modifications, building
 * a knowledge base that can be reused, referenced, and audited, enhancing long-term value.
 * This directly supports intellectual property and compliance needs.
 * @param {ExplanationRecord} explanation - The explanation record to save.
 * @returns {Promise<ExplanationRecord>} A promise that resolves with the saved explanation, potentially with a new ID.
 */
export const saveExplanationRecord = async (explanation: ExplanationRecord): Promise<ExplanationRecord> => {
    console.log('Mock API: Saving explanation record...', explanation);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                ...explanation,
                id: explanation.id || `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date(),
            });
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates fetching a list of previous explanations for a user.
 * Business value: Provides access to a user's historical AI interactions, allowing them to
 * review past insights, track progress, and leverage previously clarified content. This
 * creates a valuable, auditable knowledge repository.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<ExplanationRecord[]>} A promise that resolves with an array of mock explanation records.
 */
export const fetchExplanationHistory = async (userId: string): Promise<ExplanationRecord[]> => {
    console.log(`Mock API: Fetching explanation history for ${userId}...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockHistory: ExplanationRecord[] = Array.from({ length: 10 }).map((_, i) => ({
                id: `exp-${userId}-${i}`,
                userId: userId,
                originalContent: `This is original content number ${i}. It is somewhat complex and requires clarification for a better understanding of its underlying principles. ${i % 2 === 0 ? "For example, consider the clause 'Force Majeure events shall excuse performance provided notice is given within 10 days.'" : ""}`,
                explainedContent: `Here is a simplified explanation for content number ${i}, breaking down the complex parts into digestible information for easy comprehension. The clause implies that under extraordinary circumstances, obligations can be suspended if prompt notification is provided.`,
                modelUsed: i % 2 === 0 ? 'gemini-2.5-flash' : 'gemini-1.5-pro',
                explanationStyle: i % 3 === 0 ? 'formal' : 'plain_english',
                audienceLevel: i % 2 === 0 ? 'high_school' : 'college',
                timestamp: new Date(Date.now() - i * 60 * 60 * 1000), // Hourly intervals
                sessionId: `session-${Math.floor(i / 3)}`,
                isFavorite: i % 4 === 0,
                linkedTerms: i === 0 ? [
                    { term: "underlying principles", definition: "fundamental ideas or concepts", context: "understanding of its underlying principles" },
                    { term: "Force Majeure", definition: "Unforeseeable circumstances that prevent someone from fulfilling a contract.", context: "Force Majeure events shall excuse performance" }
                ] : undefined,
                estimatedCost: parseFloat((0.00000025 + 0.0000025) * (Math.random() * 1000 + 500)).toFixed(6) as any, // Mock cost
                tokensUsed: Math.floor(Math.random() * 1000 + 500)
            }));
            resolve(mockHistory);
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates deleting an explanation record.
 * Business value: Allows users to manage their data, ensuring privacy and compliance with data
 * retention policies. Provides necessary control over personal and organizational data assets.
 * @param {string} explanationId - The ID of the explanation to delete.
 * @returns {Promise<void>} A promise that resolves when the deletion is successful.
 */
export const deleteExplanationRecord = async (explanationId: string): Promise<void> => {
    console.log(`Mock API: Deleting explanation record ${explanationId}...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Explanation ${explanationId} deleted.`);
            resolve();
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates fetching a list of uploaded documents for a user.
 * Business value: Provides an organized view of all managed documents, facilitating quick access,
 * status monitoring, and triggering of further AI-driven analyses. This is a key enabler for
 * document-centric workflows and intelligent automation.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<DocumentMetadata[]>} A promise that resolves with an array of mock document metadata.
 */
export const fetchUserDocuments = async (userId: string): Promise<DocumentMetadata[]> => {
    console.log(`Mock API: Fetching documents for ${userId}...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockDocuments: DocumentMetadata[] = Array.from({ length: 5 }).map((_, i) => ({
                id: `doc-${userId}-${i}`,
                userId: userId,
                fileName: `Contract_Q${i + 1}_2023.pdf`,
                fileSizeKB: 1024 + i * 256,
                uploadDate: new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000), // Days ago
                status: i === 0 ? 'processing' : (i === 1 ? 'analyzed_by_agent' : 'processed'),
                documentType: 'pdf',
                accessPermissions: i % 2 === 0 ? 'private' : 'shared',
                tags: ['contract', `Q${i + 1}`],
                lastAccessed: new Date(Date.now() - i * 3 * 60 * 1000),
                pageCount: 10 + i * 2,
                agentAnalysisStatus: i === 1 ? 'completed' : (i === 0 ? 'in_progress' : 'pending'),
                agentAnalysisReportId: i === 1 ? `report-doc-${userId}-${i}` : undefined,
            }));
            resolve(mockDocuments);
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates uploading a document.
 * Business value: Enables secure ingestion of diverse document types into the platform,
 * forming the raw material for AI processing and value extraction. This is the entry point
 * for transforming unstructured data into structured, actionable insights.
 * @param {File} file - The file to upload.
 * @param {string} userId - The ID of the user uploading the file.
 * @returns {Promise<DocumentMetadata>} A promise that resolves with the metadata of the uploaded document.
 */
export const uploadDocumentFile = async (file: File, userId: string): Promise<DocumentMetadata> => {
    console.log(`Mock API: Uploading document "${file.name}" for user ${userId}...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            const newDoc: DocumentMetadata = {
                id: `doc-${userId}-${Date.now()}`,
                userId: userId,
                fileName: file.name,
                fileSizeKB: Math.round(file.size / 1024),
                uploadDate: new Date(),
                status: 'processing', // It will be processed in the background
                documentType: file.type.includes('pdf') ? 'pdf' : file.name.endsWith('.docx') ? 'docx' : 'txt',
                accessPermissions: 'private',
                tags: [],
                lastAccessed: new Date(),
                pageCount: file.type.includes('pdf') ? Math.floor(Math.random() * 20) + 5 : undefined,
                agentAnalysisStatus: 'pending',
            };
            resolve(newDoc);
        }, mockApiResponseDelay * 2); // Longer delay for uploads
    });
};

/**
 * Simulates fetching content of a specific document.
 * Business value: Provides on-demand access to the full text of documents, enabling direct
 * review and supporting AI analysis workflows by feeding the AI model. This empowers users
 * with immediate access to raw data for verification and contextualization.
 * @param {string} documentId - The ID of the document.
 * @returns {Promise<string>} A promise that resolves with mock document content.
 */
export const fetchDocumentContent = async (documentId: string): Promise<string> => {
    console.log(`Mock API: Fetching content for document ${documentId}...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`This is the detailed content of document ${documentId}. It contains several complex clauses and technical jargon that require careful analysis. For example, "The indemnifying party agrees to defend, indemnify, and hold harmless the indemnified party from and against any and all claims, demands, liabilities, costs, expenses, obligations, and causes of action arising out of or related to..." This clause is often found in various legal agreements to protect one party from potential financial losses or legal actions caused by the other party. Another key section might be: "Notwithstanding the foregoing, neither party shall be liable for indirect, incidental, special, punitive, or consequential damages." This limits the type of damages that can be claimed.`);
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates fetching custom glossary terms for a user or team.
 * Business value: Populates the custom glossary with domain-specific terms, ensuring
 * accurate and consistent AI explanations and supporting knowledge management. This is
 * essential for maintaining semantic coherence in specialized financial and legal contexts.
 * @param {string} entityId - User ID or Team ID.
 * @param {boolean} isTeam - Flag to indicate if it's a team glossary.
 * @returns {Promise<GlossaryTerm[]>} A promise that resolves with an array of mock glossary terms.
 */
export const fetchGlossaryTerms = async (entityId: string, isTeam: boolean = false): Promise<GlossaryTerm[]> => {
    console.log(`Mock API: Fetching ${isTeam ? 'team' : 'user'} glossary for ${entityId}...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockTerms: GlossaryTerm[] = Array.from({ length: 7 }).map((_, i) => ({
                id: `term-${entityId}-${i}`,
                userId: entityId,
                term: `Term ${i + 1}`,
                definition: `This is the definition for Term ${i + 1}, explained in simple language for easy understanding.`,
                synonyms: [`Synonym${i + 1}a`, `Synonym${i + 1}b`],
                examples: [`Example usage of Term ${i + 1} in a sentence.`],
                source: `Custom entry by ${entityId}`,
                lastUpdated: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000), // Days ago
                isPublic: isTeam,
                tags: ['legal', i % 2 === 0 ? 'contract' : 'general'],
            }));
            resolve(mockTerms);
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates adding or updating a glossary term.
 * Business value: Allows users to curate and enrich their domain-specific knowledge base,
 * directly improving the quality and relevance of AI explanations over time. This fosters
 * organizational learning and knowledge capitalization.
 * @param {GlossaryTerm} term - The term to add/update.
 * @returns {Promise<GlossaryTerm>} A promise that resolves with the saved term.
 */
export const saveGlossaryTerm = async (term: GlossaryTerm): Promise<GlossaryTerm> => {
    console.log('Mock API: Saving glossary term...', term);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                ...term,
                id: term.id || `term-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                lastUpdated: new Date(),
            });
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates deleting a glossary term.
 * Business value: Provides control over managed terminology, enabling users to remove obsolete
 * or incorrect entries and maintain the accuracy of their knowledge base. This ensures the
 * integrity and relevance of AI-driven linguistic processing.
 * @param {string} termId - The ID of the term to delete.
 * @returns {Promise<void>} A promise that resolves when deletion is successful.
 */
export const deleteGlossaryTerm = async (termId: string): Promise<void> => {
    console.log(`Mock API: Deleting glossary term ${termId}...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Glossary term ${termId} deleted.`);
            resolve();
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates fetching available AI model configurations.
 * Business value: Presents the available AI models and their capabilities, enabling users to
 * select the most appropriate model for their task based on performance, cost, and specific features.
 * This is crucial for managing operational expenses and ensuring AI output quality, directly
 * influencing the platform's cost-efficiency and adaptability.
 * @returns {Promise<AIModelSettings[]>} A promise that resolves with an array of mock AI model settings.
 */
export const fetchAIModelConfigurations = async (): Promise<AIModelSettings[]> => {
    console.log('Mock API: Fetching AI model configurations...');
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    modelId: 'gemini-2.5-flash',
                    name: 'Gemini 2.5 Flash',
                    provider: 'Google',
                    description: 'Google\'s fastest and most cost-effective model for high-volume tasks. Ideal for rapid processing and real-time operations.',
                    capabilities: ['text_generation', 'summarization', 'translation'],
                    costPerToken: 0.00000025, // Example cost (per token)
                    inputTokenCostPerMillion: 0.125, // USD per million tokens
                    outputTokenCostPerMillion: 0.375, // USD per million tokens
                    isActive: true,
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                    topP: 0.95,
                },
                {
                    modelId: 'gemini-1.5-pro',
                    name: 'Gemini 1.5 Pro',
                    provider: 'Google',
                    description: 'Google\'s most capable model, ideal for complex reasoning, extensive context windows, and creative tasks. Suitable for deep financial analysis and strategic intelligence.',
                    capabilities: ['text_generation', 'summarization', 'translation', 'code_generation', 'multimodal'],
                    costPerToken: 0.0000025, // Example cost (per token)
                    inputTokenCostPerMillion: 3.50,
                    outputTokenCostPerMillion: 10.50,
                    isActive: true,
                    temperature: 0.5,
                    maxOutputTokens: 4096,
                    topP: 0.9,
                    stopSequences: ["###END"],
                },
                {
                    modelId: 'gpt-3.5-turbo',
                    name: 'GPT-3.5 Turbo',
                    provider: 'OpenAI',
                    description: 'OpenAI\'s popular general-purpose model, offering a good balance of cost and performance. Excellent for routine clarification and content generation.',
                    capabilities: ['text_generation', 'summarization'],
                    costPerToken: 0.0000015,
                    inputTokenCostPerMillion: 0.50,
                    outputTokenCostPerMillion: 1.50,
                    isActive: true,
                    temperature: 0.8,
                    maxOutputTokens: 1024,
                    topP: 0.85,
                },
                {
                    modelId: 'gpt-4',
                    name: 'GPT-4',
                    provider: 'OpenAI',
                    description: 'OpenAI\'s most advanced model, offering superior reasoning, context understanding, and robustness for critical financial and legal applications.',
                    capabilities: ['text_generation', 'summarization', 'code_generation', 'multimodal'],
                    costPerToken: 0.00003,
                    inputTokenCostPerMillion: 10.00,
                    outputTokenCostPerMillion: 30.00,
                    isActive: false, // Can be activated by user or admin
                    temperature: 0.6,
                    maxOutputTokens: 8192,
                    topP: 0.92,
                    stopSequences: ["<|endoftext|>"],
                },
            ]);
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates updating an AI model's settings.
 * Business value: Enables administrators and privileged users to fine-tune AI model
 * parameters, optimizing for desired output quality, cost, and responsiveness across the platform.
 * This capability is critical for dynamic resource allocation and strategic cost management.
 * @param {AIModelSettings} settings - The model settings to update.
 * @returns {Promise<AIModelSettings>} A promise that resolves with the updated settings.
 */
export const updateAIModelSettings = async (settings: AIModelSettings): Promise<AIModelSettings> => {
    console.log('Mock API: Updating AI model settings...', settings);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ ...settings, isActive: settings.isActive }); // Simulate saving the active status
        }, mockApiResponseDelay);
    });
};

// Internal mock log store for chaining hashes
let mockAuditLogChain: AuditLogEntry[] = [];
let lastHash = "0000000000000000000000000000000000000000000000000000000000000000"; // Genesis hash for audit chain

/**
 * Simulates fetching audit log entries.
 * Business value: Provides an auditable and potentially tamper-evident history of all system
 * activities, crucial for security audits, regulatory compliance, and post-incident analysis.
 * This enhances accountability and transparency, essential for building trust in a financial system.
 * @param {string} userId - The ID of the user whose logs to fetch.
 * @param {number} limit - The maximum number of entries to return.
 * @returns {Promise<AuditLogEntry[]>} A promise that resolves with mock audit log entries.
 */
export const fetchAuditLogs = async (userId: string, limit: number = 10): Promise<AuditLogEntry[]> => {
    console.log(`Mock API: Fetching audit logs for ${userId} (limit: ${limit})...`);
    return new Promise((resolve) => {
        setTimeout(async () => {
            // Simulate generation if empty
            if (mockAuditLogChain.length === 0) {
                // Ensure the system user for audit logs has a keypair to simulate digital identity
                if (!SecureKeyStorage['keys'].has('system')) {
                    await SecureKeyStorage.generateKeyPair('system');
                }
                for (let i = 0; i < 25; i++) {
                    const action = i % 3 === 0 ? 'explanation_generated' : i % 3 === 1 ? 'document_upload' : 'settings_update';
                    const resourceType = i % 3 === 0 ? 'Explanation' : i % 3 === 1 ? 'Document' : 'User';
                    const resourceId = i % 3 === 0 ? `exp-${userId}-${i}` : `doc-${userId}-${i}`;
                    const details = { ip: `192.168.1.${i % 25}`, browser: 'Chrome', os: 'macOS' };
                    // Simulate logging for the user and some system actions
                    await logAuditEvent(i % 5 === 0 ? 'system' : userId, action, resourceType, resourceId, details);
                }
            }
            resolve(mockAuditLogChain.filter(log => log.userId === userId || log.userId === 'system').slice(-limit).reverse());
        }, mockApiResponseDelay);
    });
};

/**
 * Internal function to simulate logging an audit event with tamper-evident chaining.
 * Business value: Ensures the integrity of audit logs, providing a cryptographic link
 * between entries that makes any unauthorized modification detectable. This is foundational
 * for governance, compliance, and maintaining system integrity in a financial infrastructure.
 * @param userId User ID performing the action, or 'system' for system-initiated events.
 * @param action Description of the action.
 * @param resourceType Type of resource affected.
 * @param resourceId ID of the resource affected.
 * @param details Additional details.
 * @returns A promise resolving to the created AuditLogEntry.
 */
export const logAuditEvent = async (
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details: Record<string, any>
): Promise<AuditLogEntry> => {
    const timestamp = new Date();
    const dataToHash = JSON.stringify({ userId, timestamp, action, resourceType, resourceId, details, previousHash: lastHash });
    const currentHash = await CryptoUtils.generateHash(dataToHash);

    const newLog: AuditLogEntry = {
        id: `log-${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        userId,
        timestamp,
        action,
        resourceType,
        resourceId,
        details,
        ipAddress: '127.0.0.1', // Mock IP, in a real system this would be dynamic
        previousHash: lastHash,
        hash: currentHash,
    };
    mockAuditLogChain.push(newLog);
    lastHash = currentHash;
    return newLog;
};

/**
 * Simulates fetching available prompt templates.
 * Business value: Centralizes reusable prompt definitions, enabling users to quickly apply
 * best practices for AI interaction and maintain consistency across generated content. This
 * accelerates AI adoption and standardizes output quality across the enterprise.
 * @param {string} userId - The ID of the user.
 * @param {string} category - Optional category filter.
 * @returns {Promise<PromptTemplate[]>} A promise that resolves with mock prompt templates.
 */
export const fetchPromptTemplates = async (userId: string, category?: string): Promise<PromptTemplate[]> => {
    console.log(`Mock API: Fetching prompt templates for ${userId}, category: ${category || 'all'}...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            const templates: PromptTemplate[] = [
                {
                    id: 'tpl-legal-001',
                    userId: 'system', // Or specific user
                    name: 'Legal Clause Simplifier',
                    template: 'You are a legal expert. Explain this legal clause in plain English for a ${audienceLevel} student: "${clause}"',
                    description: 'Simplifies legal clauses and identifies potential risks.',
                    category: 'legal',
                    isPublic: true,
                    lastModified: new Date(),
                },
                {
                    id: 'tpl-tech-001',
                    userId: 'system',
                    name: 'Technical Term Explainer',
                    template: 'As a technical writer, define "${term}" and provide a real-world example suitable for a ${audienceLevel}. Context: "${context}"',
                    description: 'Explains complex technical jargon and provides contextual usage.',
                    category: 'technical',
                    isPublic: true,
                    lastModified: new Date(),
                },
                {
                    id: 'tpl-custom-001',
                    userId: userId,
                    name: 'My Custom Summary',
                    template: 'Summarize the following text in ${wordCount} words, focusing on ${focusAreas}: "${text}"',
                    description: 'A custom template for precise summarization of financial reports or market analysis.',
                    category: 'general',
                    isPublic: false,
                    lastModified: new Date(),
                },
                {
                    id: 'tpl-financial-risk',
                    userId: 'system',
                    name: 'Financial Risk Identifier',
                    template: 'Analyze the following financial statement extract and identify potential risks or red flags for a ${audienceLevel} audience. Focus on: "${text}"',
                    description: 'Identifies and clarifies financial risks within textual data.',
                    category: 'financial',
                    isPublic: true,
                    lastModified: new Date(),
                },
            ];
            resolve(category ? templates.filter(t => t.category === category || t.userId === userId) : templates);
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates saving a prompt template.
 * Business value: Allows users to create, store, and share custom AI interaction patterns,
 * fostering innovation and community-driven content generation. This is key to extending
 * the platform's capabilities and user-driven value creation.
 * @param {PromptTemplate} template - The template to save.
 * @returns {Promise<PromptTemplate>} A promise that resolves with the saved template.
 */
export const savePromptTemplate = async (template: PromptTemplate): Promise<PromptTemplate> => {
    console.log('Mock API: Saving prompt template...', template);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                ...template,
                id: template.id || `tpl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                lastModified: new Date(),
            });
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates deleting a prompt template.
 * Business value: Provides control over user-defined prompts, enabling removal of obsolete
 * or inefficient templates and maintaining an organized prompt library. This ensures the
 * prompt ecosystem remains clean and highly effective.
 * @param {string} templateId - The ID of the template to delete.
 * @returns {Promise<void>} A promise that resolves when deletion is successful.
 */
export const deletePromptTemplate = async (templateId: string): Promise<void> => {
    console.log(`Mock API: Deleting prompt template ${templateId}...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Prompt template ${templateId} deleted.`);
            resolve();
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates fetching user notifications.
 * Business value: Aggregates and displays important alerts and updates for the user,
 * ensuring they are informed about system status, task completions, and critical messages.
 * This improves operational transparency and user engagement.
 * @param {string} userId - The user ID.
 * @returns {Promise<UserNotification[]>} A promise that resolves with mock notifications.
 */
export const fetchUserNotifications = async (userId: string): Promise<UserNotification[]> => {
    console.log(`Mock API: Fetching notifications for ${userId}...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            const notifications: UserNotification[] = [
                {
                    id: `notif-${userId}-1`,
                    userId: userId,
                    type: 'success',
                    message: 'Your document "Q4_Report.pdf" has been processed successfully.',
                    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
                    isRead: false,
                    actionLink: '/app/documents/doc-user-123-0',
                    relatedEntityId: 'doc-user-123-0',
                },
                {
                    id: `notif-${userId}-2`,
                    userId: userId,
                    type: 'info',
                    message: 'New feature: Document comparison is now available!',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                    isRead: true,
                    actionLink: '/app/compare-documents',
                },
                {
                    id: `notif-${userId}-3`,
                    userId: userId,
                    type: 'warning',
                    message: 'Your subscription is due for renewal in 7 days.',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
                    isRead: false,
                    actionLink: '/app/settings/billing',
                },
                {
                    id: `notif-${userId}-4`,
                    userId: userId,
                    type: 'success',
                    message: 'Agent task "Doc Analysis for Contract_Q1_2023.pdf" completed.',
                    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
                    isRead: false,
                    actionLink: '/app/documents/doc-user-123-0',
                    relatedEntityId: 'agent-task-001',
                },
                {
                    id: `notif-${userId}-5`,
                    userId: userId,
                    type: 'error',
                    message: 'Token transaction failed: Insufficient balance for transfer.',
                    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
                    isRead: false,
                    actionLink: '/app/token-rails',
                    relatedEntityId: 'txn-failed-001',
                }
            ];
            resolve(notifications);
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates marking a notification as read.
 * Business value: Helps users manage their inbox by dismissing read alerts, focusing their
 * attention on new and unaddressed notifications. This enhances user productivity and reduces
 * information overload.
 * @param {string} notificationId - The ID of the notification.
 * @returns {Promise<void>} A promise that resolves when successful.
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    console.log(`Mock API: Marking notification ${notificationId} as read...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Notification ${notificationId} marked as read.`);
            resolve();
        }, mockApiResponseDelay / 2);
    });
};

/**
 * Simulates recording AI usage.
 * Business value: Essential for detailed cost tracking, billing, and resource allocation.
 * Provides granular data on token consumption and associated expenses for each AI interaction,
 * enabling transparent usage-based billing and ROI analysis.
 * @param usageRecord The AI usage record to save.
 * @returns A promise resolving to the saved AIUsageRecord.
 */
export const recordAIUsage = async (usageRecord: Omit<AIUsageRecord, 'id'>): Promise<AIUsageRecord> => {
    console.log('Mock API: Recording AI usage...', usageRecord);
    return new Promise((resolve) => {
        setTimeout(() => {
            const newRecord: AIUsageRecord = {
                ...usageRecord,
                id: `usage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            };
            resolve(newRecord);
        }, mockApiResponseDelay / 4);
    });
};

/**
 * Simulates fetching AI usage history.
 * Business value: Offers transparent reporting on AI resource consumption, allowing users and
 * administrators to monitor spending patterns and optimize AI feature utilization. This
 * promotes financial accountability and efficient resource management.
 * @param userId The ID of the user.
 * @param limit The maximum number of entries to return.
 * @returns A promise resolving to an array of AIUsageRecord.
 */
export const fetchAIUsageHistory = async (userId: string, limit: number = 10): Promise<AIUsageRecord[]> => {
    console.log(`Mock API: Fetching AI usage history for ${userId} (limit: ${limit})...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockUsage: AIUsageRecord[] = Array.from({ length: limit }).map((_, i) => ({
                id: `usage-${userId}-${i}`,
                userId: userId,
                timestamp: new Date(Date.now() - i * 10 * 60 * 1000), // Every 10 minutes
                modelId: i % 2 === 0 ? 'gemini-1.5-pro' : 'gpt-3.5-turbo',
                inputTokens: Math.floor(Math.random() * 500) + 100,
                outputTokens: Math.floor(Math.random() * 200) + 50,
                estimatedCostUSD: parseFloat((Math.random() * 0.05).toFixed(6)),
                feature: i % 3 === 0 ? 'explanation' : 'summarization',
                relatedEntityId: `exp-${userId}-${i}`,
            }));
            resolve(mockUsage);
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates fetching subscription details.
 * Business value: Retrieves current subscription status and plan specifics, empowering users
 * with information to manage their services and understand their entitlements. This is vital
 * for customer self-service and transparent billing.
 * @param userId The ID of the user.
 * @returns A promise resolving to the user's SubscriptionPlan.
 */
export const fetchSubscriptionDetails = async (userId: string): Promise<SubscriptionPlan> => {
    console.log(`Mock API: Fetching subscription details for ${userId}...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: 'sub-pro-123',
                name: 'pro',
                description: 'Advanced features for power users, including enhanced AI models and API access.',
                monthlyPriceUSD: 29.99,
                features: ['Unlimited explanations', '50GB storage', 'API access', 'Priority support'],
                tokenLimitMonthly: null, // Unlimited
                documentStorageGB: 50,
                apiKeyAccess: true,
                teamMembers: 1,
            });
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates updating a subscription.
 * Business value: Enables users to upgrade, downgrade, or cancel subscriptions, providing
 * flexibility in service consumption and supporting revenue generation. This directly impacts
 * customer lifetime value and product scalability.
 * @param userId The ID of the user.
 * @param newPlanName The name of the new plan.
 * @returns A promise resolving to the updated SubscriptionPlan.
 */
export const updateSubscription = async (userId: string, newPlanName: 'free' | 'pro' | 'enterprise'): Promise<SubscriptionPlan> => {
    console.log(`Mock API: Updating subscription for ${userId} to ${newPlanName}...`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (newPlanName === 'enterprise') {
                // Simulate an enterprise plan requiring manual approval or specific setup
                reject(new Error("Enterprise plan requires direct contact for a customized solution."));
                return;
            }
            const updatedPlan: SubscriptionPlan = {
                id: `sub-${newPlanName}-${userId}`,
                name: newPlanName,
                description: `Features for ${newPlanName} users.`,
                monthlyPriceUSD: newPlanName === 'free' ? 0 : (newPlanName === 'pro' ? 29.99 : 99.99), // Placeholder for enterprise
                features: newPlanName === 'free' ? ['Basic explanations', 'Community support'] : ['Unlimited explanations', 'API access', 'Priority support'],
                tokenLimitMonthly: newPlanName === 'free' ? 100000 : null,
                documentStorageGB: newPlanName === 'free' ? 5 : 50,
                apiKeyAccess: newPlanName !== 'free',
                teamMembers: newPlanName === 'free' ? 0 : (newPlanName === 'pro' ? 1 : 5),
            };
            resolve(updatedPlan);
        }, mockApiResponseDelay * 1.5);
    });
};

/**
 * Simulates fetching payment methods.
 * Business value: Provides an overview of stored payment options, facilitating billing management
 * and enabling users to add or remove payment instruments. This streamlines financial operations
 * and improves customer convenience.
 * @param userId The ID of the user.
 * @returns A promise resolving to an array of PaymentMethod.
 */
export const fetchPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
    console.log(`Mock API: Fetching payment methods for ${userId}...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 'pm-1',
                    userId: userId,
                    type: 'card',
                    last4Digits: '4242',
                    isDefault: true,
                    createdAt: new Date(Date.now() - 365 * 24 * 3600 * 1000),
                    expiresAt: new Date(Date.now() + 180 * 24 * 3600 * 1000), // Expires in 6 months
                },
                {
                    id: 'pm-2',
                    userId: userId,
                    type: 'crypto',
                    cryptoAddressMasked: '0xabc...xyz',
                    isDefault: false,
                    createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000),
                },
            ]);
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates adding a new payment method.
 * Business value: Enables users to securely add new billing information, ensuring uninterrupted
 * service and supporting multiple payment options for customer convenience. This contributes
 * to revenue predictability and reduces churn.
 * @param userId The ID of the user.
 * @param method The PaymentMethod to add (partial, as ID would be generated by backend).
 * @returns A promise resolving to the newly added PaymentMethod.
 */
export const addPaymentMethod = async (userId: string, method: Omit<PaymentMethod, 'id' | 'createdAt'>): Promise<PaymentMethod> => {
    console.log(`Mock API: Adding payment method for ${userId}...`, method);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                ...method,
                id: `pm-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                userId: userId,
                createdAt: new Date(),
            });
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates processing a payment.
 * Business value: Completes financial transactions, whether for subscription renewals or
 * one-time purchases, directly impacting revenue generation. This is a core component of the
 * platform's monetization strategy.
 * @param userId The ID of the user.
 * @param paymentMethodId The ID of the payment method to use.
 * @param amount The amount to charge.
 * @param currency The currency (e.g., USD).
 * @returns A promise resolving to a boolean indicating success.
 */
export const processPayment = async (userId: string, paymentMethodId: string, amount: number, currency: string): Promise<boolean> => {
    console.log(`Mock API: Processing payment of ${amount} ${currency} for user ${userId} with method ${paymentMethodId}...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            if (Math.random() > 0.1) { // 90% success rate
                console.log('Payment successful.');
                resolve(true);
            } else {
                console.error('Payment failed.');
                resolve(false);
            }
        }, mockApiResponseDelay * 2);
    });
};

// Mock Agent Task store
const mockAgentTasks: AgentTask[] = [];

/**
 * Simulates submitting an agent task to the intelligent automation layer.
 * Business value: Orchestrates automated intelligent agents to perform complex,
 * background processing tasks (e.g., document analysis, anomaly detection), enhancing
 * operational efficiency and enabling proactive system behavior. This scales capabilities
 * beyond direct user interaction, reducing manual workload and improving responsiveness.
 * @param task The AgentTask to submit (partial, as ID and timestamps would be generated by system).
 * @returns A promise resolving to the submitted AgentTask.
 */
export const submitAgentTask = async (task: Omit<AgentTask, 'id' | 'createdAt' | 'status' | 'startedAt' | 'completedAt' | 'results' | 'error' | 'auditLogId' | 'agentId' | 'orchestratorId'>): Promise<AgentTask> => {
    console.log('Mock API: Submitting agent task...', task);
    return new Promise((resolve) => {
        setTimeout(async () => {
            // Simulate agent and orchestrator assignment
            const agentId = `agent-${task.taskType}-1`;
            const orchestratorId = `orchestrator-main-001`; // Mock orchestrator

            const newAgentTask: AgentTask = {
                ...task,
                id: `agent-task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                createdAt: new Date(),
                status: 'pending',
                agentId: agentId,
                orchestratorId: orchestratorId,
                priority: task.priority || 'medium', // Default priority
            };
            mockAgentTasks.push(newAgentTask);

            // Simulate agent observing the task submission and beginning processing
            await logAuditEvent(newAgentTask.initiatedBy, `Agent Task Submitted: ${newAgentTask.taskType}`, 'AgentTask', newAgentTask.id, {
                targetEntity: newAgentTask.targetEntityId, parameters: newAgentTask.parameters, priority: newAgentTask.priority, agent: newAgentTask.agentId
            });
            resolve(newAgentTask);

            // Simulate background processing and task completion/failure
            setTimeout(async () => {
                const index = mockAgentTasks.findIndex(t => t.id === newAgentTask.id);
                if (index > -1) {
                    const status = Math.random() > 0.2 ? 'completed' : 'failed'; // 80% success
                    const results = status === 'completed' ? { processedItems: Math.floor(Math.random() * 100) + 1, reportLink: `/reports/${newAgentTask.id}` } : { errorMessage: 'Simulated agent task failure due to internal processing error.' };
                    mockAgentTasks[index] = {
                        ...mockAgentTasks[index],
                        status,
                        startedAt: new Date(),
                        completedAt: new Date(),
                        results,
                        error: status === 'failed' ? results.errorMessage : undefined,
                    };
                    await logAuditEvent('system', `Agent Task ${status}: ${newAgentTask.taskType}`, 'AgentTask', newAgentTask.id, {
                        targetEntity: newAgentTask.targetEntityId, status, results, agent: newAgentTask.agentId
                    });
                    console.log(`Mock Agent Task ${newAgentTask.id} ${status}.`);
                }
            }, mockApiResponseDelay * 3); // Longer delay for background task
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates fetching agent tasks.
 * Business value: Provides an overview of all ongoing and completed automated tasks,
 * enabling users and administrators to monitor agent performance and intervene if necessary.
 * This ensures transparency and control over the intelligent automation layer.
 * @param userId Optional user ID to filter tasks.
 * @returns A promise resolving to an array of AgentTask.
 */
export const fetchAgentTasks = async (userId?: string): Promise<AgentTask[]> => {
    console.log(`Mock API: Fetching agent tasks for ${userId || 'all'}...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(userId ? mockAgentTasks.filter(t => t.initiatedBy === userId) : mockAgentTasks);
        }, mockApiResponseDelay);
    });
};

/**
 * Mock Token Rail Ledger and Balances.
 * Business value: This internal ledger simulates the core programmable value rail,
 * facilitating transparent, atomic, and auditable movement of digital assets.
 */
const mockTokenBalances: Map<string, TokenBalance> = new Map();
let mockTokenTransactions: TokenTransaction[] = [];
const systemAccount = 'system_governance_account'; // A system account for fees, mint/burn

// Ensure system account has a keypair for signing system transactions
if (!SecureKeyStorage['keys'].has(systemAccount)) {
    SecureKeyStorage.generateKeyPair(systemAccount);
}

/**
 * Simulates fetching a user's token balance.
 * Business value: Provides real-time visibility into digital asset holdings,
 * supporting token-based incentives, rewards, and usage tracking. This is essential
 * for financial transparency within the programmable value ecosystem.
 * @param userId The ID of the user.
 * @param currency The token currency (e.g., "LC_TOKEN").
 * @returns A promise resolving to the user's TokenBalance.
 */
export const fetchTokenBalance = async (userId: string, currency: string = "LC_TOKEN"): Promise<TokenBalance> => {
    console.log(`Mock API: Fetching token balance for ${userId} (${currency})...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            if (!mockTokenBalances.has(userId)) {
                mockTokenBalances.set(userId, { userId, balance: 100, currency, lastUpdated: new Date() }); // Initial balance for new users
            }
            resolve(mockTokenBalances.get(userId)!);
        }, mockApiResponseDelay / 2);
    });
};

/**
 * Simulates executing a token transaction on a specified rail.
 * This function implements core logic for the Programmable Token Rail and Real-Time Settlement.
 * Business value: Enables secure, atomic, and idempotent value transfers within the platform,
 * forming the backbone of micro-payments, rewards, and programmable finance. It supports
 * real-time gross settlement (RTGS) with digital assets, ensuring financial integrity and speed.
 * @param transaction The TokenTransaction details.
 * @param rail The simulated rail to use ('rail_fast' or 'rail_batch').
 * @returns A promise resolving to the completed TokenTransaction.
 */
export const executeTokenTransaction = async (
    transaction: Omit<TokenTransaction, 'id' | 'timestamp' | 'status' | 'signature' | 'fee' | 'metadata'> & { fee?: number; metadata?: Record<string, any> },
    rail: 'rail_fast' | 'rail_batch'
): Promise<TokenTransaction> => {
    console.log(`Mock API: Executing token transaction on ${rail} for ${transaction.userId}...`);
    return new Promise(async (resolve, reject) => {
        // Simulate network/processing delay based on rail
        const processingDelay = rail === 'rail_fast' ? mockApiResponseDelay / 4 : mockApiResponseDelay;
        setTimeout(async () => {
            // --- Idempotency Check ---
            if (mockTokenTransactions.some(t => t.idempotencyKey === transaction.idempotencyKey && t.status === 'completed')) {
                const existingTxn = mockTokenTransactions.find(t => t.idempotencyKey === transaction.idempotencyKey && t.status === 'completed');
                console.warn(`Idempotency key ${transaction.idempotencyKey} already processed. Returning existing transaction.`);
                return resolve(existingTxn!);
            }

            // --- Fee Calculation (Simple heuristic routing logic) ---
            const baseFee = (rail === 'rail_fast' ? 0.02 : 0.005) * transaction.amount; // Higher fee for fast rail
            const totalAmount = transaction.amount + baseFee; // Amount to deduct includes fee

            // --- Balance Validation ---
            let senderBalance = mockTokenBalances.get(transaction.fromAddress);
            if (transaction.type !== 'mint' && (!senderBalance || senderBalance.balance < totalAmount)) {
                const errorMsg = `Insufficient balance for user ${transaction.fromAddress}. Required: ${totalAmount.toFixed(2)}, Available: ${senderBalance?.balance.toFixed(2) || 0}.`;
                await logAuditEvent(transaction.userId, `Token Transaction Failed (Insufficient Balance): ${transaction.type}`, 'TokenTransaction', 'N/A', { error: errorMsg, ...transaction });
                return reject(new Error(errorMsg));
            }

            // --- Cryptographic Signature (Digital Identity & Security) ---
            const dataToSign = JSON.stringify({ ...transaction, rail, fee: baseFee });
            let signature: string;
            try {
                signature = await SecureKeyStorage.signData(transaction.userId, dataToSign);
            } catch (sigError: any) {
                const errorMsg = `Failed to sign transaction: ${sigError.message}`;
                await logAuditEvent(transaction.userId, `Token Transaction Failed (Signature): ${transaction.type}`, 'TokenTransaction', 'N/A', { error: errorMsg, ...transaction });
                return reject(new Error(errorMsg));
            }

            const newTransaction: TokenTransaction = {
                ...transaction,
                id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                timestamp: new Date(),
                status: 'pending', // Initial status
                rail: rail,
                signature,
                fee: baseFee,
                metadata: transaction.metadata || {},
            };

            // --- Atomic Settlement Simulation ---
            // In a real system, this would be a single, ACID-compliant database transaction.
            try {
                // Step 1: Deduct from sender (if not a mint operation)
                if (transaction.type !== 'mint') {
                    senderBalance = mockTokenBalances.get(transaction.fromAddress); // Re-fetch to be safe
                    if (senderBalance) {
                        mockTokenBalances.set(transaction.fromAddress, {
                            ...senderBalance,
                            balance: senderBalance.balance - totalAmount, // Deduct amount + fee
                            lastUpdated: new Date()
                        });
                    }
                }

                // Step 2: Add to recipient
                const recipientBalance = mockTokenBalances.get(transaction.toAddress) || { userId: transaction.toAddress, balance: 0, currency: transaction.currency, lastUpdated: new Date() };
                mockTokenBalances.set(transaction.toAddress, {
                    ...recipientBalance,
                    balance: recipientBalance.balance + transaction.amount, // Recipient gets only the amount
                    lastUpdated: new Date()
                });

                // Step 3: Collect fees to system account
                if (baseFee > 0 && transaction.type !== 'mint' && transaction.type !== 'burn') {
                    const systemBalance = mockTokenBalances.get(systemAccount) || { userId: systemAccount, balance: 0, currency: transaction.currency, lastUpdated: new Date() };
                    mockTokenBalances.set(systemAccount, {
                        ...systemBalance,
                        balance: systemBalance.balance + baseFee,
                        lastUpdated: new Date()
                    });
                    // Also log a system-initiated fee collection transaction
                    const feeCollectionTxn: TokenTransaction = {
                        id: `txn-fee-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                        userId: systemAccount,
                        fromAddress: transaction.fromAddress,
                        toAddress: systemAccount,
                        amount: baseFee,
                        currency: transaction.currency,
                        timestamp: new Date(),
                        status: 'completed',
                        type: 'fee_collection',
                        referenceId: newTransaction.id,
                        rail: newTransaction.rail,
                        signature: await SecureKeyStorage.signData(systemAccount, JSON.stringify({ ...newTransaction, type: 'fee_collection', amount: baseFee })), // System signs its own fee collection
                        idempotencyKey: `${newTransaction.idempotencyKey}-fee`,
                        fee: 0 // No fee on fee collection itself
                    };
                    mockTokenTransactions.push(feeCollectionTxn);
                    await logAuditEvent(systemAccount, `Fee Collection for Txn: ${newTransaction.id}`, 'TokenTransaction', feeCollectionTxn.id, {
                        payer: transaction.fromAddress, amount: baseFee, currency: transaction.currency, rail: newTransaction.rail
                    });
                }

                newTransaction.status = 'completed';
                mockTokenTransactions.push(newTransaction);
                await logAuditEvent(newTransaction.userId, `Token Transaction: ${newTransaction.type}`, 'TokenTransaction', newTransaction.id, {
                    amount: newTransaction.amount, currency: newTransaction.currency, rail: newTransaction.rail, fee: newTransaction.fee
                });
                resolve(newTransaction);

            } catch (e: any) {
                // --- Fail-safe / Revert Mechanism ---
                // In a real system, this would involve transaction rollback or compensating transactions.
                // Here, we just mark as failed and log the error.
                newTransaction.status = 'failed';
                newTransaction.error = e.message;
                mockTokenTransactions.push(newTransaction);
                await logAuditEvent(newTransaction.userId, `Token Transaction Failed: ${newTransaction.type}`, 'TokenTransaction', newTransaction.id, {
                    amount: newTransaction.amount, currency: newTransaction.currency, rail: newTransaction.rail, error: e.message
                });
                reject(e);
            }
        }, processingDelay);
    });
};

/**
 * Simulates minting new tokens (admin-only operation).
 * Business value: Provides a controlled mechanism for introducing new digital assets into the
 * ecosystem, managed by authorized entities. Essential for initial token distribution, rewards,
 * and maintaining tokenomics according to governance policies.
 * @param userId The ID of the user performing the mint.
 * @param amount The amount to mint.
 * @param currency The token currency.
 * @param toAddress The address to mint to.
 * @returns A promise resolving to the created TokenTransaction.
 */
export const mintTokens = async (userId: string, amount: number, currency: string, toAddress: string): Promise<TokenTransaction> => {
    console.log(`Mock API: Minting ${amount} ${currency} for ${toAddress} by ${userId}...`);
    return new Promise(async (resolve, reject) => {
        setTimeout(async () => {
            const idempotencyKey = `mint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const transaction: Omit<TokenTransaction, 'id' | 'timestamp' | 'status' | 'signature'> = {
                userId,
                fromAddress: 'system_mint', // Originates from system minting authority
                toAddress,
                amount,
                currency,
                type: 'mint',
                idempotencyKey,
            };
            try {
                // Mint transactions bypass sender balance check and fee deduction for simplicity
                const mintTxn = await executeTokenTransaction(transaction, 'rail_fast');
                resolve(mintTxn);
            } catch (e) {
                reject(e);
            }
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates burning tokens (admin-only operation).
 * Business value: Provides a controlled mechanism for removing digital assets from circulation,
 * maintaining tokenomics and managing supply according to governance requirements. This ensures
 * market stability and adherence to financial policy.
 * @param userId The ID of the user performing the burn.
 * @param amount The amount to burn.
 * @param currency The token currency.
 * @param fromAddress The address to burn from.
 * @returns A promise resolving to the created TokenTransaction.
 */
export const burnTokens = async (userId: string, amount: number, currency: string, fromAddress: string): Promise<TokenTransaction> => {
    console.log(`Mock API: Burning ${amount} ${currency} from ${fromAddress} by ${userId}...`);
    return new Promise(async (resolve, reject) => {
        setTimeout(async () => {
            const idempotencyKey = `burn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const transaction: Omit<TokenTransaction, 'id' | 'timestamp' | 'status' | 'signature'> = {
                userId,
                fromAddress,
                toAddress: 'system_burn', // Recipient is system burn address
                amount,
                currency,
                type: 'burn',
                idempotencyKey,
            };
            try {
                const burnTxn = await executeTokenTransaction(transaction, 'rail_fast');
                resolve(burnTxn);
            } catch (e) {
                reject(e);
            }
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates fetching a user's token transaction history.
 * Business value: Provides a complete, auditable record of all token movements,
 * essential for financial transparency, reconciliation, and user trust. This forms
 * a critical component of the platform's immutable ledger.
 * @param userId The ID of the user.
 * @returns A promise resolving to an array of TokenTransaction.
 */
export const fetchTokenTransactions = async (userId: string): Promise<TokenTransaction[]> => {
    console.log(`Mock API: Fetching token transactions for ${userId}...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockTokenTransactions.filter(t => t.userId === userId || t.toAddress === userId || t.fromAddress === userId || t.fromAddress === systemAccount || t.toAddress === systemAccount).reverse());
        }, mockApiResponseDelay);
    });
};

/**
 * Props for the AlertMessage component.
 * Business value: Standardizes user feedback for system events, ensuring consistent communication
 * of success, warnings, or errors, which improves user confidence and reduces support inquiries.
 * This directly enhances user experience and perceived system reliability.
 */
interface AlertMessageProps {
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    onClose?: () => void;
    className?: string;
}

/**
 * A styled alert message component.
 * Business value: Provides a visually distinct and user-friendly way to display important
 * messages, enhancing the application's overall user experience and clarity. This contributes
 * to effective communication and guides user interaction.
 */
export const AlertMessage: React.FC<AlertMessageProps> = ({ type, message, onClose, className }) => {
    const baseClasses = "p-3 rounded-md flex items-center justify-between text-sm";
    const typeClasses = {
        info: "bg-blue-800 text-blue-100 border border-blue-600",
        success: "bg-green-800 text-green-100 border border-green-600",
        warning: "bg-yellow-800 text-yellow-100 border border-yellow-600",
        error: "bg-red-800 text-red-100 border border-red-600",
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]} ${className || ''}`} role="alert">
            <span>{message}</span>
            {onClose && (
                <button
                    onClick={onClose}
                    className="ml-4 text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                    aria-label="Close alert"
                >
                    &times;
                </button>
            )}
        </div>
    );
};

/**
 * Props for the Modal component.
 * Business value: Enables focused user interaction by presenting critical information or
 * requiring specific input within a discrete overlay, minimizing distractions and guiding workflows.
 * This improves user efficiency and simplifies complex interactions.
 */
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
    footer?: React.ReactNode;
}

/**
 * A generic modal component.
 * Business value: Standardizes the presentation of dialogues and forms, contributing to a
 * consistent user interface and simplifying complex interactions without navigating away from the main view.
 * This enhances usability and reduces the learning curve for new features.
 */
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className, footer }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex justify-center items-center p-4">
            <div className={`relative bg-gray-800 rounded-lg shadow-xl max-w-lg w-full ${className || ''}`}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white focus:outline-none">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-4 text-gray-300">
                    {children}
                </div>
                {footer && (
                    <div className="p-4 border-t border-gray-700 flex justify-end space-x-2">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * A simple loading spinner component.
 * Business value: Improves user experience during asynchronous operations by providing clear
 * visual feedback that the system is processing, reducing frustration and perceived latency.
 * This enhances the responsiveness and professionalism of the application.
 */
export const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
    </div>
);

/**
 * Props for the PaginationControls component.
 * Business value: Facilitates efficient navigation through large datasets, enhancing usability
 * and enabling users to quickly locate specific information without overwhelming the interface.
 * This is crucial for managing extensive audit logs, transaction histories, or document lists.
 */
interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

/**
 * Component for navigating through pages of data.
 * Business value: Optimizes the display of extensive lists (e.g., history, audit logs) by breaking
 * them into manageable chunks, improving performance and readability. This directly supports
 * observability and data accessibility across the platform.
 */
export const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex justify-center items-center space-x-1 mt-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-700 rounded text-white hover:bg-gray-600 disabled:opacity-50"
            >
                Previous
            </button>
            {pageNumbers.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 rounded ${currentPage === page ? 'bg-cyan-600' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
                >
                    {page}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-700 rounded text-white hover:bg-gray-600 disabled:opacity-50"
            >
                Next
            </button>
        </div>
    );
};

/**
 * Props for the ProgressBar component.
 * Business value: Provides clear visual cues for long-running processes (e.g., document uploads,
 * batch analyses, agent tasks), managing user expectations and improving the perceived responsiveness
 * of the application. This enhances user experience and confidence in system operations.
 */
interface ProgressBarProps {
    progress: number; // 0-100
    label?: string;
}

/**
 * A simple progress bar to show task completion.
 * Business value: Enhances user experience by offering continuous feedback on task status,
 * which is critical for complex or time-consuming operations. This visual feedback reduces
 * user anxiety and improves overall application usability.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label }) => {
    const normalizedProgress = Math.max(0, Math.min(100, progress));
    return (
        <div className="w-full bg-gray-700 rounded-full h-2.5 dark:bg-gray-700">
            <div
                className="bg-cyan-600 h-2.5 rounded-full"
                style={{ width: `${normalizedProgress}%` }}
                role="progressbar"
                aria-valuenow={normalizedProgress}
                aria-valuemin={0}
                aria-valuemax={100}
            ></div>
            {label && (
                <span className="text-xs font-medium text-gray-400 mt-1 block">{label}: {normalizedProgress}%</span>
            )}
        </div>
    );
};

/**
 * Props for the Dropdown component.
 * Business value: Streamlines user input for selections, ensuring data consistency and
 * reducing errors by providing predefined options, enhancing overall data quality. This
 * simplifies configuration and improves ease of use for critical settings.
 */
interface DropdownProps {
    options: { value: string; label: string }[];
    selectedValue: string;
    onValueChange: (value: string) => void;
    label?: string;
    className?: string;
}

/**
 * A custom dropdown select component.
 * Business value: Offers a consistent and intuitive way for users to make choices,
 * improving application ergonomics and reducing the learning curve. This component is
 * essential for configurable features and personalized user experiences.
 */
export const Dropdown: React.FC<DropdownProps> = ({ options, selectedValue, onValueChange, label, className }) => (
    <div className={`flex flex-col ${className}`}>
        {label && <label htmlFor={`dropdown-${label}`} className="text-gray-400 text-sm mb-1">{label}</label>}
        <select
            id={`dropdown-${label}`}
            value={selectedValue}
            onChange={(e) => onValueChange(e.target.value)}
            className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-sm border border-gray-600 focus:border-cyan-500 focus:ring-cyan-500"
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    </div>
);

/**
 * Props for the RichTextEditor component (simplified).
 * Business value: Provides an intuitive interface for editing and viewing text content,
 * enhancing user productivity and the ability to refine AI-generated outputs. This is
 * critical for collaborative content creation and knowledge curation.
 */
interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    className?: string;
    minHeight?: string;
}

/**
 * A simplified rich text editor (using a textarea for brevity, but could be a full editor).
 * Business value: Offers a versatile input and display mechanism for text-based information,
 * supporting both user input and the presentation of complex AI explanations. It serves as
 * a core interaction point for textual data.
 */
export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder,
    readOnly = false,
    className,
    minHeight = '12rem',
}) => {
    return (
        <div className={`relative ${className}`}>
            <textarea
                value={value}
                onChange={e => !readOnly && onChange(e.target.value)}
                placeholder={placeholder}
                readOnly={readOnly}
                className={`w-full bg-gray-700/50 p-3 rounded text-white font-mono text-sm border border-gray-600 resize-y focus:border-cyan-500 focus:ring-cyan-500 outline-none
                            ${readOnly ? 'cursor-not-allowed bg-gray-800/50' : ''}`}
                style={{ minHeight: minHeight }}
            />
            {readOnly && (
                <div className="absolute inset-0 bg-transparent pointer-events-none" />
            )}
        </div>
    );
};

/**
 * Props for the EditableText component.
 * Business value: Enables direct, in-place editing of text fields, streamlining data entry
 * and modifications, which improves efficiency and user experience. This reduces cognitive
 * load and accelerates data correction workflows.
 */
interface EditableTextProps {
    value: string;
    onSave: (newValue: string) => void;
    placeholder?: string;
    multiline?: boolean;
    className?: string;
    inputClassName?: string;
    disabled?: boolean;
}

/**
 * A component that allows inline editing of text.
 * Business value: Reduces cognitive load by allowing immediate data correction or updates
 * within the viewing context, thereby accelerating workflows. This feature enhances
 * productivity and data management efficiency.
 */
export const EditableText: React.FC<EditableTextProps> = ({
    value,
    onSave,
    placeholder = 'Click to edit',
    multiline = false,
    className,
    inputClassName,
    disabled = false,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        if (currentValue !== value) {
            onSave(currentValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline) {
            inputRef.current?.blur();
        }
        if (e.key === 'Escape') {
            setCurrentValue(value); // Revert changes
            inputRef.current?.blur();
        }
    };

    const commonClasses = "w-full p-1 rounded bg-gray-700/50 text-white font-mono text-sm border border-gray-600 focus:border-cyan-500 focus:ring-cyan-500 outline-none";

    if (isEditing) {
        return multiline ? (
            <textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={`${commonClasses} resize-y ${inputClassName}`}
                rows={3}
            />
        ) : (
            <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className={`${commonClasses} ${inputClassName}`}
            />
        );
    }

    return (
        <div
            className={`cursor-pointer ${className} ${disabled ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-700/30 p-1 rounded'}`}
            onClick={disabled ? undefined : () => setIsEditing(true)}
        >
            <span className="text-gray-300">
                {value || <span className="italic text-gray-500">{placeholder}</span>}
            </span>
        </div>
    );
};

/**
 * Hook for managing user profile and preferences.
 * Business value: Centralizes user identity and configuration management, ensuring a consistent
 * and personalized application experience while simplifying data flow for UI components. This is
 * foundational for role-based access control and targeted feature delivery.
 */
export function useUserProfileManager() {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadUserProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const profile = await fetchUserProfile();
            setUserProfile(profile);
        } catch (err: any) {
            console.error("Failed to load user profile:", err);
            setError(`Failed to load user profile: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
        if (!userProfile) {
            setError("No user profile to update.");
            return undefined; // Or throw an error
        }
        setLoading(true);
        setError(null);
        try {
            const updatedProfile = await updateUserSettings(newPreferences);
            setUserProfile(updatedProfile);
            await logAuditEvent(userProfile.id, 'preferences_update', 'UserPreferences', userProfile.id, newPreferences);
            return updatedProfile;
        } catch (err: any) {
            console.error("Failed to update preferences:", err);
            setError(`Failed to update preferences: ${err.message}`);
            throw err; // Re-throw to allow component to handle
        } finally {
            setLoading(false);
        }
    }, [userProfile]);

    useEffect(() => {
        loadUserProfile();
    }, [loadUserProfile]);

    return { userProfile, loading, error, loadUserProfile, updatePreferences };
}

/**
 * Hook for managing explanation history.
 * Business value: Provides efficient access to historical AI interactions, enabling users to
 * review past decisions, track insights, and maintain a valuable knowledge repository. This
 * supports auditability and continuous learning.
 */
export function useExplanationHistory(userId: string | undefined) {
    const [history, setHistory] = useState<ExplanationRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Example pagination

    const loadHistory = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await fetchExplanationHistory(userId);
            setHistory(data);
        } catch (err: any) {
            console.error("Failed to load explanation history:", err);
            setError(`Failed to load explanation history: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const addExplanationToHistory = useCallback((newExplanation: ExplanationRecord) => {
        setHistory(prev => {
            const existingIndex = prev.findIndex(exp => exp.id === newExplanation.id);
            if (existingIndex > -1) {
                // Update existing record
                return prev.map((exp, i) => (i === existingIndex ? newExplanation : exp));
            }
            // Add new record to the top
            return [newExplanation, ...prev];
        });
    }, []);

    const removeExplanationFromHistory = useCallback(async (id: string) => {
        if (!userId) {
            setError("User ID not available to delete explanation.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await deleteExplanationRecord(id);
            setHistory(prev => prev.filter(exp => exp.id !== id));
            await logAuditEvent(userId, 'explanation_deleted', 'Explanation', id, {});
        } catch (err: any) {
            console.error(`Failed to delete explanation ${id}:`, err);
            setError(`Failed to delete explanation ${id}: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const paginatedHistory = history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(history.length / itemsPerPage);

    return {
        history,
        paginatedHistory,
        loading,
        error,
        loadHistory,
        addExplanationToHistory,
        removeExplanationFromHistory,
        currentPage,
        totalPages,
        setCurrentPage
    };
}

/**
 * Hook for managing user documents.
 * Business value: Centralizes document lifecycle management, from upload and processing to
 * content retrieval and agent analysis, enabling robust document-centric workflows. This is
 * critical for transforming raw data into actionable intelligence.
 */
export function useDocumentManager(userId: string | undefined) {
    const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const loadDocuments = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const docs = await fetchUserDocuments(userId);
            setDocuments(docs);
        } catch (err: any) {
            console.error("Failed to load documents:", err);
            setError(`Failed to load documents: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const uploadDocument = useCallback(async (file: File) => {
        if (!userId) {
            setError("User not authenticated for upload.");
            throw new Error("User not authenticated for upload.");
        }
        setUploading(true);
        setUploadProgress(0);
        setError(null);
        try {
            // Simulate progress
            for (let i = 0; i <= 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, 50));
                setUploadProgress(i);
            }
            const newDoc = await uploadDocumentFile(file, userId);
            setDocuments(prev => [...prev, newDoc]);
            await logAuditEvent(userId, 'document_upload', 'Document', newDoc.id, { fileName: newDoc.fileName, fileSizeKB: newDoc.fileSizeKB });
            return newDoc;
        } catch (err: any) {
            console.error("Failed to upload document:", err);
            setError(`Failed to upload document: ${err.message}`);
            throw err;
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }, [userId]);

    const getDocumentContent = useCallback(async (documentId: string): Promise<string | null> => {
        setLoading(true);
        setError(null);
        try {
            const content = await fetchDocumentContent(documentId);
            if (userId) { // Ensure userId is available for audit logging
                await logAuditEvent(userId, 'document_view', 'Document', documentId, {});
            }
            return content;
        } catch (err: any) {
            console.error(`Failed to fetch document content for ${documentId}:`, err);
            setError(`Failed to fetch document content: ${err.message}`);
            return null;
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const updateDocumentStatus = useCallback((documentId: string, status: DocumentMetadata['status'], agentAnalysisStatus?: DocumentMetadata['agentAnalysisStatus']) => {
        setDocuments(prev => prev.map(doc =>
            doc.id === documentId
                ? { ...doc, status, agentAnalysisStatus: agentAnalysisStatus || doc.agentAnalysisStatus, lastAccessed: new Date() }
                : doc
        ));
    }, []);

    useEffect(() => {
        loadDocuments();
    }, [loadDocuments]);

    return { documents, loading, error, uploading, uploadProgress, loadDocuments, uploadDocument, getDocumentContent, updateDocumentStatus };
}

/**
 * Hook for managing AI model configurations.
 * Business value: Provides an interface for dynamically configuring AI models, allowing
 * administrators to optimize costs and performance by activating or deactivating specific models.
 * This capability ensures strategic resource allocation and adherence to budgetary constraints.
 */
export function useAIModelConfig() {
    const [models, setModels] = useState<AIModelSettings[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadModels = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedModels = await fetchAIModelConfigurations();
            setModels(fetchedModels);
        } catch (err: any) {
            console.error("Failed to load AI models:", err);
            setError(`Failed to load AI models: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateModel = useCallback(async (updatedSettings: AIModelSettings) => {
        setLoading(true);
        setError(null);
        try {
            const result = await updateAIModelSettings(updatedSettings);
            setModels(prev => prev.map(m => m.modelId === result.modelId ? result : m));
            // Log this as a system-level audit event, or tie to a specific admin user if available
            await logAuditEvent('admin_or_user', 'ai_model_update', 'AIModelSettings', result.modelId, { changes: updatedSettings });
            return result;
        } catch (err: any) {
            console.error("Failed to update AI model settings:", err);
            setError(`Failed to update AI model settings: ${err.message}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadModels();
    }, [loadModels]);

    return { models, loading, error, loadModels, updateModel };
}

/**
 * Hook for managing glossary terms.
 * Business value: Centralizes the management of domain-specific terminology, enabling users
 * to build, maintain, and share consistent definitions across teams and AI interactions. This
 * ensures semantic consistency and enhances the relevance of AI-generated content.
 */
export function useGlossaryManager(userId: string | undefined, isTeam: boolean = false) {
    const [terms, setTerms] = useState<GlossaryTerm[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadTerms = useCallback(async () => {
        if (!userId) return; // Or teamId
        setLoading(true);
        setError(null);
        try {
            const fetchedTerms = await fetchGlossaryTerms(userId, isTeam);
            setTerms(fetchedTerms);
        } catch (err: any) {
            console.error("Failed to load glossary terms:", err);
            setError(`Failed to load glossary terms: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [userId, isTeam]);

    const addOrUpdateTerm = useCallback(async (term: GlossaryTerm) => {
        if (!userId) {
            setError("User/Team ID not available for glossary operation.");
            throw new Error("User/Team ID not available for glossary operation.");
        }
        setLoading(true);
        setError(null);
        try {
            const savedTerm = await saveGlossaryTerm({ ...term, userId: term.userId || userId });
            setTerms(prev => {
                const existingIndex = prev.findIndex(t => t.id === savedTerm.id);
                if (existingIndex > -1) {
                    return prev.map((t, i) => (i === existingIndex ? savedTerm : t));
                }
                return [...prev, savedTerm];
            });
            await logAuditEvent(userId, term.id ? 'glossary_term_updated' : 'glossary_term_added', 'GlossaryTerm', savedTerm.id, { term: savedTerm.term });
            return savedTerm;
        } catch (err: any) {
            console.error("Failed to save glossary term:", err);
            setError(`Failed to save glossary term: ${err.message}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const removeTerm = useCallback(async (termId: string) => {
        if (!userId) {
            setError("User/Team ID not available for glossary operation.");
            throw new Error("User/Team ID not available for glossary operation.");
        }
        setLoading(true);
        setError(null);
        try {
            await deleteGlossaryTerm(termId);
            setTerms(prev => prev.filter(t => t.id !== termId));
            await logAuditEvent(userId, 'glossary_term_deleted', 'GlossaryTerm', termId, {});
        } catch (err: any) {
            console.error(`Failed to delete glossary term ${termId}:`, err);
            setError(`Failed to delete glossary term ${termId}: ${err.message}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadTerms();
    }, [loadTerms]);

    return { terms, loading, error, loadTerms, addOrUpdateTerm, removeTerm };
}

/**
 * Hook for managing prompt templates.
 * Business value: Provides tools for creating, organizing, and deploying reusable AI prompts,
 * enabling advanced prompt engineering and consistent AI output quality across tasks. This
 * accelerates the development of specialized AI applications and ensures repeatable, auditable results.
 */
export function usePromptTemplateManager(userId: string | undefined) {
    const [templates, setTemplates] = useState<PromptTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadTemplates = useCallback(async (category?: string) => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const fetchedTemplates = await fetchPromptTemplates(userId, category);
            setTemplates(fetchedTemplates);
        } catch (err: any) {
            console.error("Failed to load prompt templates:", err);
            setError(`Failed to load prompt templates: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const addOrUpdateTemplate = useCallback(async (template: PromptTemplate) => {
        if (!userId) {
            setError("User ID not available for template operation.");
            throw new Error("User ID not available for template operation.");
        }
        setLoading(true);
        setError(null);
        try {
            const savedTemplate = await savePromptTemplate({ ...template, userId: template.userId || userId });
            setTemplates(prev => {
                const existingIndex = prev.findIndex(t => t.id === savedTemplate.id);
                if (existingIndex > -1) {
                    return prev.map((t, i) => (i === existingIndex ? savedTemplate : t));
                }
                return [...prev, savedTemplate];
            });
            await logAuditEvent(userId, template.id ? 'prompt_template_updated' : 'prompt_template_added', 'PromptTemplate', savedTemplate.id, { name: savedTemplate.name });
            return savedTemplate;
        } catch (err: any) {
            console.error("Failed to save prompt template:", err);
            setError(`Failed to save prompt template: ${err.message}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const removeTemplate = useCallback(async (templateId: string) => {
        if (!userId) {
            setError("User ID not available for template operation.");
            throw new Error("User ID not available for template operation.");
        }
        setLoading(true);
        setError(null);
        try {
            await deletePromptTemplate(templateId);
            setTemplates(prev => prev.filter(t => t.id !== templateId));
            await logAuditEvent(userId, 'prompt_template_deleted', 'PromptTemplate', templateId, {});
        } catch (err: any) {
            console.error(`Failed to delete prompt template ${templateId}:`, err);
            setError(`Failed to delete prompt template ${templateId}: ${err.message}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadTemplates();
    }, [loadTemplates]);

    return { templates, loading, error, loadTemplates, addOrUpdateTemplate, removeTemplate };
}

/**
 * Hook for managing user notifications.
 * Business value: Centralizes the display and management of system alerts, ensuring users
 * are always informed about critical events, task completions, and account-related messages.
 * This improves user engagement and operational transparency.
 */
export function useNotifications(userId: string | undefined) {
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadNotifications = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const fetchedNotifications = await fetchUserNotifications(userId);
            setNotifications(fetchedNotifications);
            setUnreadCount(fetchedNotifications.filter(n => !n.isRead).length);
        } catch (err: any) {
            console.error("Failed to load notifications:", err);
            setError(`Failed to load notifications: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const markAsRead = useCallback(async (notificationId: string) => {
        if (!userId) {
            setError("User ID not available to mark notification as read.");
            return;
        }
        try {
            await markNotificationAsRead(notificationId);
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            await logAuditEvent(userId, 'notification_marked_read', 'UserNotification', notificationId, {});
        } catch (err: any) {
            console.error(`Failed to mark notification ${notificationId} as read:`, err);
            setError(`Failed to mark notification as read: ${err.message}`);
        }
    }, [userId]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    return { notifications, loading, error, unreadCount, loadNotifications, markAsRead };
}

/**
 * Hook for tracking and reporting AI usage.
 * Business value: Provides transparent financial oversight by logging every AI invocation,
 * enabling granular cost analysis, usage-based billing, and resource optimization. This is
 * essential for managing operational costs and demonstrating ROI for AI features.
 */
export function useAIUsageTracker(userId: string | undefined) {
    const [usageHistory, setUsageHistory] = useState<AIUsageRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadUsageHistory = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const history = await fetchAIUsageHistory(userId);
            setUsageHistory(history);
        } catch (err: any) {
            console.error("Failed to load AI usage history:", err);
            setError(`Failed to load AI usage history: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const addUsageRecord = useCallback(async (record: Omit<AIUsageRecord, 'id'>) => {
        if (!userId) {
            setError("User ID not available to record AI usage.");
            throw new Error("User ID not available to record AI usage.");
        }
        try {
            const newRecord = await recordAIUsage(record);
            setUsageHistory(prev => [newRecord, ...prev]);
            return newRecord;
        } catch (err: any) {
            console.error("Failed to add AI usage record:", err);
            setError(`Failed to record AI usage: ${err.message}`);
            throw err;
        }
    }, [userId]);

    useEffect(() => {
        loadUsageHistory();
    }, [loadUsageHistory]);

    return { usageHistory, loading, error, loadUsageHistory, addUsageRecord };
}

/**
 * Hook for managing user subscriptions and payment methods.
 * Business value: Simplifies subscription lifecycle management, enabling users to easily view
 * their plan, track usage, and manage billing details, fostering customer satisfaction and retention.
 * This is a direct contributor to revenue management and customer trust.
 */
export function useSubscriptionManager(userId: string | undefined) {
    const [subscription, setSubscription] = useState<SubscriptionPlan | null>(null);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadSubscriptionData = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const [sub, pms] = await Promise.all([
                fetchSubscriptionDetails(userId),
                fetchPaymentMethods(userId),
            ]);
            setSubscription(sub);
            setPaymentMethods(pms);
        } catch (err: any) {
            console.error("Failed to load subscription data:", err);
            setError(`Failed to load subscription details: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const updateSubscriptionPlan = useCallback(async (newPlan: 'free' | 'pro' | 'enterprise') => {
        if (!userId) {
            setError("User ID not available to update subscription.");
            throw new Error("User ID not available to update subscription.");
        }
        setLoading(true);
        setError(null);
        try {
            const updatedSub = await updateSubscription(userId, newPlan);
            setSubscription(updatedSub);
            await logAuditEvent(userId, 'subscription_update', 'SubscriptionPlan', updatedSub.id, { newPlan: newPlan });
            return updatedSub;
        } catch (err: any) {
            console.error("Failed to update subscription:", err);
            setError(`Failed to update subscription: ${err.message}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const addPayment = useCallback(async (method: Omit<PaymentMethod, 'id' | 'createdAt'>) => {
        if (!userId) {
            setError("User ID not available to add payment method.");
            throw new Error("User ID not available to add payment method.");
        }
        setLoading(true);
        setError(null);
        try {
            const newPm = await addPaymentMethod(userId, method);
            setPaymentMethods(prev => [...prev, newPm]);
            await logAuditEvent(userId, 'payment_method_added', 'PaymentMethod', newPm.id, { type: newPm.type, last4: newPm.last4Digits });
            return newPm;
        } catch (err: any) {
            console.error("Failed to add payment method:", err);
            setError(`Failed to add payment method: ${err.message}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const makePayment = useCallback(async (paymentMethodId: string, amount: number, currency: string) => {
        if (!userId) {
            setError("User ID not available to make payment.");
            throw new Error("User ID not available to make payment.");
        }
        setLoading(true);
        setError(null);
        try {
            const success = await processPayment(userId, paymentMethodId, amount, currency);
            if (success) {
                await logAuditEvent(userId, 'payment_processed', 'Payment', paymentMethodId, { amount, currency });
            } else {
                await logAuditEvent(userId, 'payment_failed', 'Payment', paymentMethodId, { amount, currency });
            }
            return success;
        } catch (err: any) {
            console.error("Failed to process payment:", err);
            setError(`Failed to process payment: ${err.message}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadSubscriptionData();
    }, [loadSubscriptionData]);

    return { subscription, paymentMethods, loading, error, loadSubscriptionData, updateSubscriptionPlan, addPayment, makePayment };
}

/**
 * Hook for managing agent tasks.
 * Business value: Provides an abstraction for interacting with automated agents, enabling users
 * to initiate and monitor complex background tasks without direct system interaction. This is
 * critical for scaling automation and enabling proactive system operations.
 */
export function useAgentTaskExecutor(userId: string | undefined) {
    const [tasks, setTasks] = useState<AgentTask[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadTasks = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const fetchedTasks = await fetchAgentTasks(userId);
            setTasks(fetchedTasks);
        } catch (err: any) {
            console.error("Failed to load agent tasks:", err);
            setError(`Failed to load agent tasks: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const submitTask = useCallback(async (task: Omit<AgentTask, 'id' | 'createdAt' | 'status' | 'startedAt' | 'completedAt' | 'results' | 'error' | 'agentId' | 'auditLogId' | 'orchestratorId'>) => {
        if (!userId) {
            setError("User ID not available to submit agent task.");
            throw new Error("User ID not available to submit agent task.");
        }
        setLoading(true);
        setError(null);
        try {
            const newTask = await submitAgentTask({ ...task, initiatedBy: userId });
            setTasks(prev => [...prev, newTask]);
            return newTask;
        } catch (err: any) {
            console.error("Failed to submit agent task:", err);
            setError(`Failed to submit agent task: ${err.message}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    // Simple polling to update task status
    useEffect(() => {
        const interval = setInterval(() => {
            if (tasks.some(t => t.status === 'pending' || t.status === 'in_progress')) {
                loadTasks();
            }
        }, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [tasks, loadTasks]);

    return { tasks, loading, error, loadTasks, submitTask };
}

/**
 * Hook for managing token balances and transactions on programmable value rails.
 * Business value: Provides real-time visibility and control over digital assets, supporting
 * token-based payment models, rewards, and the full lifecycle of token transactions on simulated
 * real-time settlement rails. This is a core component for the future of digital finance.
 */
export function useTokenRailsSimulator(userId: string | undefined) {
    const [balance, setBalance] = useState<TokenBalance | null>(null);
    const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadTokenData = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const [bal, txns] = await Promise.all([
                fetchTokenBalance(userId),
                fetchTokenTransactions(userId),
            ]);
            setBalance(bal);
            setTransactions(txns);
        } catch (err: any) {
            console.error("Failed to load token data:", err);
            setError(`Failed to load token data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const executeTransaction = useCallback(async (
        amount: number,
        toAddress: string,
        type: TokenTransaction['type'],
        rail: 'rail_fast' | 'rail_batch',
        referenceId?: string,
        fromAddress?: string,
        currency: string = "LC_TOKEN",
        metadata?: Record<string, any>
    ) => {
        if (!userId) {
            setError("User ID not available for token transaction.");
            throw new Error("User ID not available for token transaction.");
        }
        if (type !== 'mint' && (!balance || balance.balance < amount)) { // Basic check, full check is in mock API
            setError("Insufficient token balance.");
            throw new Error("Insufficient token balance.");
        }

        setLoading(true);
        setError(null);
        const idempotencyKey = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        try {
            const txn = await executeTokenTransaction({
                userId,
                fromAddress: fromAddress || userId,
                toAddress,
                amount,
                currency,
                type,
                referenceId,
                idempotencyKey,
                metadata,
            }, rail);

            setTransactions(prev => [txn, ...prev]);
            // Optimistic UI update for balance
            setBalance(prev => {
                if (!prev) return null;
                let newBalance = prev.balance;
                if (type === 'mint' || (type === 'transfer' && txn.toAddress === userId)) {
                    newBalance += amount;
                } else if (type === 'burn' || (type === 'transfer' && txn.fromAddress === userId)) {
                    newBalance -= (amount + (txn.fee || 0)); // Deduct fee if applicable
                }
                return { ...prev, balance: newBalance, lastUpdated: new Date() };
            });
            return txn;
        } catch (err: any) {
            console.error("Failed to execute token transaction:", err);
            setError(`Failed to execute token transaction: ${err.message}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId, balance]);

    const adminMintTokens = useCallback(async (amount: number, toAddress: string, currency: string = "LC_TOKEN") => {
        if (!userId) { // This should be controlled by RBAC in a real system
            setError("Admin privileges required for minting.");
            throw new Error("Admin privileges required for minting.");
        }
        setLoading(true);
        setError(null);
        try {
            const mintedTxn = await mintTokens(userId, amount, currency, toAddress);
            setTransactions(prev => [mintedTxn, ...prev]);
            // Only update balance if minting to current user
            setBalance(prev => prev && prev.userId === toAddress ? { ...prev, balance: prev.balance + amount, lastUpdated: new Date() } : prev);
            return mintedTxn;
        } catch (err: any) {
            console.error("Failed to mint tokens:", err);
            setError(`Failed to mint tokens: ${err.message}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId]);


    useEffect(() => {
        loadTokenData();
    }, [loadTokenData]);

    return { balance, transactions, loading, error, loadTokenData, executeTransaction, adminMintTokens };
}


/**
 * Props for the AIExplanationOutput component.
 * Business value: Displays the core AI-generated value to the user, providing critical
 * insights and a platform for iterative refinement and feedback, enhancing content quality.
 * This directly supports decision-making and knowledge validation.
 */
interface AIExplanationOutputProps {
    explanation: string;
    isLoading: boolean;
    linkedTerms?: LinkedTerm[];
    onSave?: (content: string) => void;
    onFeedback?: (feedback: ExplanationFeedback) => void;
    editable?: boolean;
    explanationRecordId?: string;
    className?: string;
    estimatedCost?: number; // Added to display cost
    tokensUsed?: number; // Added to display tokens
}

/**
 * Displays the AI-generated explanation with options for interaction.
 * Business value: Serves as the primary output interface for AI analysis, enabling users
 * to quickly grasp complex information, provide feedback for model improvement, and track costs.
 * This component is central to extracting actionable insights and value from unstructured data.
 */
export const AIExplanationOutput: React.FC<AIExplanationOutputProps> = ({
    explanation,
    isLoading,
    linkedTerms,
    onSave,
    onFeedback,
    editable = false,
    explanationRecordId,
    className,
    estimatedCost,
    tokensUsed
}) => {
    const [editedExplanation, setEditedExplanation] = useState(explanation);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [rating, setRating] = useState<number>(0);
    const [feedbackComments, setFeedbackComments] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        setEditedExplanation(explanation);
    }, [explanation]);

    const handleSave = async () => {
        if (!onSave || saving) return;
        setSaving(true);
        setSaveSuccess(false);
        setSaveError(null);
        try {
            await onSave(editedExplanation);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            setSaveError(`Failed to save explanation: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const submitFeedback = () => {
        if (onFeedback && rating > 0) {
            onFeedback({
                rating: rating as 1 | 2 | 3 | 4 | 5,
                comments: feedbackComments,
                improvementsSuggested: [],
                isHelpful: rating >= 4,
            });
            setShowFeedbackModal(false);
            setRating(0);
            setFeedbackComments('');
        }
    };

    /**
     * Renders the explanation text, embedding interactive tooltips for linked terms.
     * Business value: Enhances comprehension by providing immediate, in-context definitions
     * for specialized terminology, reducing cognitive load and accelerating knowledge acquisition.
     * @param text The explanation text to render.
     * @returns A React component with HTML content.
     */
    const renderExplanationWithLinkedTerms = (text: string) => {
        if (!linkedTerms || linkedTerms.length === 0) {
            return text;
        }

        let processedHtml = text;
        // Sort linked terms by length descending to avoid issues with substrings
        const sortedTerms = [...linkedTerms].sort((a, b) => b.term.length - a.term.length);

        sortedTerms.forEach(linkedTerm => {
            // Use word boundaries to avoid replacing parts of other words
            const regex = new RegExp(`\\b(${linkedTerm.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
            processedHtml = processedHtml.replace(regex, (match) => {
                const tooltipContent = `
                    <div class="absolute z-10 opacity-0 group-hover:opacity-100 bg-gray-900 text-gray-200 text-xs rounded py-1 px-2 pointer-events-none transition-opacity duration-200 whitespace-normal w-64 left-1/2 -translate-x-1/2 mt-2" style="bottom: 100%; transform: translateX(-50%) translateY(0.5rem);">
                        <strong>${linkedTerm.term}:</strong> ${linkedTerm.definition}
                        ${linkedTerm.sourceUrl ? `<a href="${linkedTerm.sourceUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline block mt-1">Learn More</a>` : ''}
                    </div>`;
                return `<span class="relative group cursor-help text-cyan-300 hover:text-cyan-200 underline">${match}${tooltipContent}</span>`;
            });
        });

        // Using dangerouslySetInnerHTML is acceptable here because the source 'explanation'
        // is from the AI model (controlled input), and linked terms are from trusted definitions,
        // which reduces XSS risk significantly in this context.
        return <div dangerouslySetInnerHTML={{ __html: processedHtml }} />;
    };


    return (
        <Card title="AI Explanation" className={className}>
            <div className="min-h-[8rem] text-gray-300">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[8rem]">
                        <LoadingSpinner />
                        <p className="mt-3 text-cyan-400">Analyzing content, please wait...</p>
                        <p className="text-gray-500 text-sm">This may take a few moments depending on complexity.</p>
                    </div>
                ) : explanation ? (
                    <>
                        {editable ? (
                            <RichTextEditor
                                value={editedExplanation}
                                onChange={setEditedExplanation}
                                minHeight="12rem"
                                className="mb-4"
                            />
                        ) : (
                            <p className="italic leading-relaxed">
                                {renderExplanationWithLinkedTerms(explanation)}
                            </p>
                        )}
                        <div className="mt-4 flex flex-wrap gap-2 justify-between items-center">
                            {(estimatedCost !== undefined && tokensUsed !== undefined) && (
                                <div className="text-gray-500 text-xs">
                                    Est. Cost: <span className="text-cyan-400 font-semibold">${estimatedCost.toFixed(6)}</span> | Tokens: <span className="text-cyan-400 font-semibold">{tokensUsed}</span>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2 justify-end items-center">
                                {editable && (
                                    <button
                                        onClick={handleSave}
                                        disabled={saving || editedExplanation === explanation}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm disabled:opacity-50 flex items-center"
                                    >
                                        {saving && <LoadingSpinner />}
                                        {saving ? 'Saving...' : (saveSuccess ? 'Saved!' : 'Save Changes')}
                                    </button>
                                )}
                                {onFeedback && (
                                    <button
                                        onClick={() => setShowFeedbackModal(true)}
                                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-sm"
                                    >
                                        Provide Feedback
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="text-gray-500">No explanation generated yet. Try pasting a clause and clicking "Explain".</p>
                )}
                {saveError && <AlertMessage type="error" message={saveError} onClose={() => setSaveError(null)} className="mt-4" />}
            </div>

            <Modal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} title="Provide Feedback">
                <p className="mb-4">How helpful was this explanation?</p>
                <div className="flex space-x-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-500'} hover:text-yellow-300`}
                        >
                            ★
                        </button>
                    ))}
                </div>
                <textarea
                    value={feedbackComments}
                    onChange={(e) => setFeedbackComments(e.target.value)}
                    placeholder="Tell us what you liked or how we can improve..."
                    rows={4}
                    className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-sm border border-gray-600 focus:border-cyan-500 focus:ring-cyan-500"
                />
                <div className="mt-4 flex justify-end space-x-2">
                    <button
                        onClick={() => setShowFeedbackModal(false)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submitFeedback}
                        disabled={rating === 0}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-sm disabled:opacity-50"
                    >
                        Submit Feedback
                    </button>
                </div>
            </Modal>
        </Card>
    );
};

/**
 * Props for the DocumentUploadSection component.
 * Business value: Centralizes document ingestion and management, providing a unified interface
 * for uploading files and triggering subsequent AI-driven analysis workflows. This component is
 * essential for transforming raw documents into actionable business intelligence.
 */
interface DocumentUploadSectionProps {
    userId: string;
    onDocumentUpload: (doc: DocumentMetadata) => void;
    onAnalyzeDocument: (documentId: string, userId: string) => void;
}

/**
 * Allows users to upload documents for processing and view their uploaded documents.
 * Business value: Transforms raw documents into actionable insights by enabling upload,
 * viewing, and triggering of advanced AI processing, enhancing data leverage. This is a
 * critical component for data ingestion and the initiation of intelligent automation.
 */
export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({ userId, onDocumentUpload, onAnalyzeDocument }) => {
    const { documents, loading, error, uploading, uploadProgress, loadDocuments, uploadDocument, getDocumentContent, updateDocumentStatus } = useDocumentManager(userId);
    const { submitTask } = useAgentTaskExecutor(userId);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [viewingDocumentId, setViewingDocumentId] = useState<string | null>(null);
    const [viewingDocumentContent, setViewingDocumentContent] = useState<string | null>(null);
    const [viewingDocumentLoading, setViewingDocumentLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUploadClick = async () => {
        if (selectedFile) {
            try {
                const newDoc = await uploadDocument(selectedFile);
                onDocumentUpload(newDoc);
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''; // Clear file input
                }
            } catch (err) {
                console.error("Upload failed in component:", err);
            }
        }
    };

    const handleViewDocument = async (docId: string) => {
        setViewingDocumentId(docId);
        setViewingDocumentLoading(true);
        const content = await getDocumentContent(docId);
        setViewingDocumentContent(content);
        setViewingDocumentLoading(false);
    };

    const handleCloseDocumentView = () => {
        setViewingDocumentId(null);
        setViewingDocumentContent(null);
    };

    const handleAnalyzeDocumentAgent = async (docId: string) => {
        if (!userId) {
            alert("User not authenticated to submit agent task.");
            return;
        }
        try {
            updateDocumentStatus(docId, 'processing', 'in_progress'); // Optimistic UI update
            await submitTask({
                taskType: 'document_analysis',
                targetEntityId: docId,
                parameters: { analysisType: 'full_clarification', targetAudience: 'college' },
                priority: 'medium', // Set a default priority
            });
            alert('Document analysis agent task submitted! Check Agent Tasks panel for status updates.');
        } catch (err) => {
            alert('Failed to submit document analysis task.');
            console.error(err);
            updateDocumentStatus(docId, 'uploaded', 'failed'); // Revert status on failure
        }
    };

    return (
        <Card title="Document Management" className="space-y-4">
            <h3 className="text-xl font-semibold text-white mb-3">Upload New Document</h3>
            <div className="flex items-center space-x-3">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-400
                               file:mr-4 file:py-2 file:px-4
                               file:rounded-md file:border-0
                               file:text-sm file:font-semibold
                               file:bg-cyan-500 file:text-white
                               hover:file:bg-cyan-600 file:cursor-pointer"
                />
                <button
                    onClick={handleUploadClick}
                    disabled={!selectedFile || uploading}
                    className="py-2 px-6 bg-green-600 hover:bg-green-700 rounded text-white disabled:opacity-50"
                >
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
            </div>
            {uploading && <ProgressBar progress={uploadProgress} label="Upload Progress" />}
            {error && <AlertMessage type="error" message={error} onClose={() => setError(null)} className="mt-4" />}

            <h3 className="text-xl font-semibold text-white mt-8 mb-3">Your Uploaded Documents</h3>
            {loading ? (
                <LoadingSpinner />
            ) : documents.length === 0 ? (
                <p className="text-gray-500">No documents uploaded yet. Start by uploading one!</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    File Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Size
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Agent Analysis
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {documents.map((doc) => (
                                <tr key={doc.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                        {doc.fileName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {(doc.fileSizeKB / 1024).toFixed(2)} MB
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                            ${doc.status === 'processed' || doc.status === 'analyzed_by_agent' ? 'bg-green-100 text-green-800' :
                                            doc.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'}`}
                                        >
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                            ${doc.agentAnalysisStatus === 'completed' ? 'bg-blue-100 text-blue-800' :
                                            doc.agentAnalysisStatus === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                                            doc.agentAnalysisStatus === 'failed' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'}`}
                                        >
                                            {doc.agentAnalysisStatus || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleViewDocument(doc.id)}
                                            className="text-cyan-600 hover:text-cyan-900 mr-4"
                                            disabled={doc.status !== 'processed' && doc.status !== 'analyzed_by_agent'}
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleAnalyzeDocumentAgent(doc.id)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            disabled={doc.status !== 'processed' || doc.agentAnalysisStatus === 'in_progress'}
                                            title="Initiate AI analysis agent"
                                        >
                                            Analyze (Agent)
                                        </button>
                                        <button className="text-red-600 hover:text-red-900">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={!!viewingDocumentId} onClose={handleCloseDocumentView} title={`Viewing Document: ${documents.find(d => d.id === viewingDocumentId)?.fileName || ''}`}>
                {viewingDocumentLoading ? (
                    <LoadingSpinner />
                ) : viewingDocumentContent ? (
                    <RichTextEditor value={viewingDocumentContent} readOnly />
                ) : (
                    <AlertMessage type="error" message="Failed to load document content." />
                )}
            </Modal>
        </Card>
    );
};

/**
 * Props for the SettingsPanel component.
 * Business value: Provides a centralized hub for users to manage their personal settings,
 * including preferences, subscriptions, and billing information, enhancing user control.
 * This directly improves customer satisfaction and system adaptability.
 */
interface SettingsPanelProps {
    userProfile: UserProfile;
    onUpdatePreferences: (preferences: Partial<UserPreferences>) => Promise<UserProfile | undefined>;
    isLoading: boolean;
    error: string | null;
}

/**
 * Allows users to manage their application settings and preferences.
 * Business value: Empowers users to customize their experience, ensuring the application
 * aligns with their needs and preferences, leading to higher engagement and satisfaction.
 * This is crucial for personalization and adoption of advanced features.
 */
export const SettingsPanel: React.FC<SettingsPanelProps> = ({ userProfile, onUpdatePreferences, isLoading, error }) => {
    const [preferences, setPreferences] = useState<UserPreferences>(userProfile.preferences);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        setPreferences(userProfile.preferences);
    }, [userProfile.preferences]);

    const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
        setPreferences(prev => ({
            ...prev,
            notificationSettings: {
                ...prev.notificationSettings,
                [key]: value
            }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            await onUpdatePreferences(preferences);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error("Failed to save settings:", err);
            // Error handled by hook, but can display a local message here if needed
        } finally {
            setIsSaving(false);
        }
    };

    const aiModelOptions = [
        { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Fast & Cost-Effective)' },
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Powerful & Capable)' },
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (General Purpose)' },
        { value: 'gpt-4', label: 'GPT-4 (Advanced Reasoning)' },
    ];

    const explanationStyleOptions = [
        { value: 'plain_english', label: 'Plain English' },
        { value: 'formal', label: 'Formal' },
        { value: 'academic', label: 'Academic' },
        { value: 'technical', label: 'Technical' },
    ];

    const audienceLevelOptions = [
        { value: 'high_school', label: 'High School Student' },
        { value: 'college', label: 'College Student' },
        { value: 'expert', label: 'Expert' },
    ];

    const fontSizeOptions = [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
    ];

    const lineHeightOptions = [
        { value: 'compact', label: 'Compact' },
        { value: 'comfortable', label: 'Comfortable' },
    ];

    return (
        <Card title="User Settings" className="space-y-6">
            {isLoading && <LoadingSpinner />}
            {error && <AlertMessage type="error" message={error} className="mb-4" />}
            {saveSuccess && <AlertMessage type="success" message="Settings saved successfully!" className="mb-4" onClose={() => setSaveSuccess(false)} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">AI Preferences</h3>
                    <div className="space-y-4">
                        <Dropdown
                            label="Default AI Model"
                            options={aiModelOptions}
                            selectedValue={preferences.defaultAIModel}
                            onValueChange={(val) => handlePreferenceChange('defaultAIModel', val as UserPreferences['defaultAIModel'])}
                        />
                        <Dropdown
                            label="Default Explanation Style"
                            options={explanationStyleOptions}
                            selectedValue={preferences.defaultExplanationStyle}
                            onValueChange={(val) => handlePreferenceChange('defaultExplanationStyle', val as UserPreferences['defaultExplanationStyle'])}
                        />
                        <Dropdown
                            label="Target Audience Level"
                            options={audienceLevelOptions}
                            selectedValue={preferences.targetAudienceLevel}
                            onValueChange={(val) => handlePreferenceChange('targetAudienceLevel', val as UserPreferences['targetAudienceLevel'])}
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">Display & Behavior</h3>
                    <div className="space-y-4">
                        <Dropdown
                            label="Preferred Language"
                            options={[{ value: 'en', label: 'English' }, { value: 'es', label: 'Spanish' }, { value: 'fr', label: 'French' }]}
                            selectedValue={preferences.preferredLanguage}
                            onValueChange={(val) => handlePreferenceChange('preferredLanguage', val)}
                        />
                        <Dropdown
                            label="Font Size"
                            options={fontSizeOptions}
                            selectedValue={preferences.fontSize}
                            onValueChange={(val) => handlePreferenceChange('fontSize', val as UserPreferences['fontSize'])}
                        />
                        <Dropdown
                            label="Line Height"
                            options={lineHeightOptions}
                            selectedValue={preferences.lineHeight}
                            onValueChange={(val) => handlePreferenceChange('lineHeight', val as UserPreferences['lineHeight'])}
                        />
                        <div className="flex items-center justify-between">
                            <label htmlFor="darkMode" className="text-gray-400 text-sm">Dark Mode</label>
                            <input
                                type="checkbox"
                                id="darkMode"
                                checked={preferences.darkMode}
                                onChange={(e) => handlePreferenceChange('darkMode', e.target.checked)}
                                className="toggle toggle-primary"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="showTips" className="text-gray-400 text-sm">Show Onboarding Tips</label>
                            <input
                                type="checkbox"
                                id="showTips"
                                checked={preferences.showTips}
                                onChange={(e) => handlePreferenceChange('showTips', e.target.checked)}
                                className="toggle toggle-primary"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="autoSave" className="text-gray-400 text-sm">Enable Auto-Save</label>
                            <input
                                type="checkbox"
                                id="autoSave"
                                checked={preferences.enableAutoSave}
                                onChange={(e) => handlePreferenceChange('enableAutoSave', e.target.checked)}
                                className="toggle toggle-primary"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2 mt-6">Notification Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                    <label htmlFor="emailNotifications" className="text-gray-400 text-sm">Email Notifications</label>
                    <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={preferences.notificationSettings.emailNotifications}
                        onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                        className="toggle toggle-primary"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="inAppNotifications" className="text-gray-400 text-sm">In-App Notifications</label>
                    <input
                        type="checkbox"
                        id="inAppNotifications"
                        checked={preferences.notificationSettings.inAppNotifications}
                        onChange={(e) => handleNotificationChange('inAppNotifications', e.target.checked)}
                        className="toggle toggle-primary"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="docCompletionNotif" className="text-gray-400 text-sm">Document Processing Completion</label>
                    <input
                        type="checkbox"
                        id="docCompletionNotif"
                        checked={preferences.notificationSettings.documentProcessingCompletion}
                        onChange={(e) => handleNotificationChange('documentProcessingCompletion', e.target.checked)}
                        className="toggle toggle-primary"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="sharedContentNotif" className="text-gray-400 text-sm">Shared Content Updates</label>
                    <input
                        type="checkbox"
                        id="sharedContentNotif"
                        checked={preferences.notificationSettings.sharedContentUpdates}
                        onChange={(e) => handleNotificationChange('sharedContentUpdates', e.target.checked)}
                        className="toggle toggle-primary"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="billingAlerts" className="text-gray-400 text-sm">Billing Alerts</label>
                    <input
                        type="checkbox"
                        id="billingAlerts"
                        checked={preferences.notificationSettings.billingAlerts}
                        onChange={(e) => handleNotificationChange('billingAlerts', e.target.checked)}
                        className="toggle toggle-primary"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="agentTaskUpdates" className="text-gray-400 text-sm">Agent Task Updates</label>
                    <input
                        type="checkbox"
                        id="agentTaskUpdates"
                        checked={preferences.notificationSettings.agentTaskUpdates}
                        onChange={(e) => handleNotificationChange('agentTaskUpdates', e.target.checked)}
                        className="toggle toggle-primary"
                    />
                </div>
            </div>

            <div className="flex justify-end mt-6">
                <button
                    onClick={handleSave}
                    disabled={isSaving || JSON.stringify(preferences) === JSON.stringify(userProfile.preferences)}
                    className="py-2 px-6 bg-cyan-600 hover:bg-cyan-700 rounded text-white disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </Card>
    );
};

/**
 * Props for the ExplanationHistoryPanel component.
 * Business value: Provides an organized, searchable archive of past AI interactions, enabling
 * users to track their research, review previous explanations, and reuse generated content. This
 * is critical for knowledge retention, auditing past clarifications, and training new team members.
 */
interface ExplanationHistoryPanelProps {
    userId: string;
    onSelectExplanation: (explanation: ExplanationRecord) => void;
}

/**
 * Displays a user's past explanation history.
 * Business value: Offers a historical record of AI-driven insights, essential for knowledge
 * retention, auditing past clarifications, and training new team members. This component
 * enhances productivity by providing access to valuable prior work.
 */
export const ExplanationHistoryPanel: React.FC<ExplanationHistoryPanelProps> = ({ userId, onSelectExplanation }) => {
    const { paginatedHistory, loading, error, removeExplanationFromHistory, currentPage, totalPages, setCurrentPage, loadHistory } = useExplanationHistory(userId);
    const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
    const [explanationToDelete, setExplanationToDelete] = useState<string | null>(null);

    const handleDeleteClick = (expId: string) => {
        setExplanationToDelete(expId);
        setConfirmDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (explanationToDelete) {
            await removeExplanationFromHistory(explanationToDelete);
            setConfirmDeleteModalOpen(false);
            setExplanationToDelete(null);
        }
    };

    return (
        <Card title="Explanation History" className="space-y-4">
            {loading ? (
                <LoadingSpinner />
            ) : error ? (
                <AlertMessage type="error" message={error} />
            ) : paginatedHistory.length === 0 ? (
                <p className="text-gray-500">No explanations in your history yet. Start clarifying!</p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Original Snippet
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Model / Style
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Cost / Tokens
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {paginatedHistory.map((exp) => (
                                    <tr key={exp.id} className="hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white max-w-xs overflow-hidden text-ellipsis">
                                            {exp.originalContent.substring(0, 70)}{exp.originalContent.length > 70 ? '...' : ''}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            {exp.modelUsed} / {exp.explanationStyle}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            ${exp.estimatedCost?.toFixed(6) || 'N/A'} / {exp.tokensUsed || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            {new Date(exp.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => onSelectExplanation(exp)}
                                                className="text-cyan-600 hover:text-cyan-900 mr-4"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(exp.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}

            <Modal isOpen={confirmDeleteModalOpen} onClose={() => setConfirmDeleteModalOpen(false)} title="Confirm Deletion">
                <p className="text-gray-300">Are you sure you want to delete this explanation from your history? This action cannot be undone.</p>
                <div className="mt-4 flex justify-end space-x-2">
                    <button
                        onClick={() => setConfirmDeleteModalOpen(false)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmDelete}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                    >
                        Delete
                    </button>
                </div>
            </Modal>
        </Card>
    );
};

/**
 * Props for the GlossaryManagerPanel component.
 * Business value: Centralizes glossary management, providing a crucial tool for maintaining
 * consistent terminology across an organization and improving AI output relevance. This ensures
 * semantic alignment in highly specialized domains.
 */
interface GlossaryManagerPanelProps {
    userId: string;
}

/**
 * Allows users to manage their custom glossary terms.
 * Business value: Enables the creation and maintenance of a domain-specific knowledge base,
 * which directly enhances AI accuracy and comprehension of specialized content. This is a
 * strategic asset for knowledge management and intelligent content processing.
 */
export const GlossaryManagerPanel: React.FC<GlossaryManagerPanelProps> = ({ userId }) => {
    const { terms, loading, error, loadTerms, addOrUpdateTerm, removeTerm } = useGlossaryManager(userId);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTerm, setEditingTerm] = useState<GlossaryTerm | null>(null);
    const [termInput, setTermInput] = useState('');
    const [definitionInput, setDefinitionInput] = useState('');
    const [synonymsInput, setSynonymsInput] = useState('');
    const [tagsInput, setTagsInput] = useState('');

    useEffect(() => {
        if (editingTerm) {
            setTermInput(editingTerm.term);
            setDefinitionInput(editingTerm.definition);
            setSynonymsInput(editingTerm.synonyms?.join(', ') || '');
            setTagsInput(editingTerm.tags?.join(', ') || '');
        } else {
            setTermInput('');
            setDefinitionInput('');
            setSynonymsInput('');
            setTagsInput('');
        }
    }, [editingTerm]);

    const handleOpenModal = (term: GlossaryTerm | null = null) => {
        setEditingTerm(term);
        setIsModalOpen(true);
    };

    const handleSaveTerm = async () => {
        if (!termInput || !definitionInput) {
            alert('Term and Definition are required.');
            return;
        }

        const newTerm: GlossaryTerm = {
            id: editingTerm?.id || '',
            userId: userId,
            term: termInput,
            definition: definitionInput,
            synonyms: synonymsInput ? synonymsInput.split(',').map(s => s.trim()) : [],
            examples: [], // For simplicity, skipping examples in this iteration
            source: editingTerm?.source || 'User Custom',
            lastUpdated: new Date(),
            isPublic: editingTerm?.isPublic || false, // Default to private
            tags: tagsInput ? tagsInput.split(',').map(s => s.trim()) : [],
        };

        try {
            await addOrUpdateTerm(newTerm);
            setIsModalOpen(false);
        } catch (err) {
            console.error("Error saving term:", err);
            // Error message handled by hook
        }
    };

    return (
        <Card title="Custom Glossary" className="space-y-4">
            <div className="flex justify-end">
                <button
                    onClick={() => handleOpenModal()}
                    className="py-2 px-6 bg-cyan-600 hover:bg-cyan-700 rounded text-white"
                >
                    Add New Term
                </button>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : error ? (
                <AlertMessage type="error" message={error} />
            ) : terms.length === 0 ? (
                <p className="text-gray-500">Your glossary is empty. Add your first term!</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Term
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Definition
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Last Updated
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {terms.map((term) => (
                                <tr key={term.id} className="hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                        {term.term}
                                    </td>
                                    <td className="px-6 py-4 max-w-md overflow-hidden text-ellipsis text-sm text-gray-400">
                                        {term.definition}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {new Date(term.lastUpdated).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleOpenModal(term)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => removeTerm(term.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTerm ? "Edit Glossary Term" : "Add New Glossary Term"}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="termInput" className="block text-sm font-medium text-gray-400">Term</label>
                        <input
                            type="text"
                            id="termInput"
                            value={termInput}
                            onChange={(e) => setTermInput(e.target.value)}
                            className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-sm border border-gray-600"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="definitionInput" className="block text-sm font-medium text-gray-400">Definition</label>
                        <textarea
                            id="definitionInput"
                            value={definitionInput}
                            onChange={(e) => setDefinitionInput(e.target.value)}
                            rows={4}
                            className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-sm border border-gray-600"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="synonymsInput" className="block text-sm font-medium text-gray-400">Synonyms (comma-separated)</label>
                        <input
                            type="text"
                            id="synonymsInput"
                            value={synonymsInput}
                            onChange={(e) => setSynonymsInput(e.target.value)}
                            className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-sm border border-gray-600"
                        />
                    </div>
                    <div>
                        <label htmlFor="tagsInput" className="block text-sm font-medium text-gray-400">Tags (comma-separated)</label>
                        <input
                            type="text"
                            id="tagsInput"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-sm border border-gray-600"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveTerm}
                        disabled={loading || !termInput || !definitionInput}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-sm disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Term'}
                    </button>
                </div>
            </Modal>
        </Card>
    );
};

/**
 * Props for the AIModelConfigurationPanel component.
 * Business value: Provides an administrative interface for AI model governance,
 * allowing control over model availability and parameters, critical for cost management
 * and performance tuning across the entire platform. This ensures optimal resource utilization.
 */
interface AIModelConfigurationPanelProps {
    userProfile: UserProfile;
}

/**
 * Allows users to view and configure AI models.
 * Business value: Centralizes control over AI resource allocation, enabling optimization
 * of processing capabilities and costs by managing model activation and parameters. This
 * feature empowers administrators to dynamically adapt the AI infrastructure to changing
 * business needs and regulatory environments.
 */
export const AIModelConfigurationPanel: React.FC<AIModelConfigurationPanelProps> = ({ userProfile }) => {
    const { models, loading, error, updateModel } = useAIModelConfig();
    const [editingModel, setEditingModel] = useState<AIModelSettings | null>(null);
    const [temp, setTemp] = useState<number>(0.7);
    const [maxTokens, setMaxTokens] = useState<number>(2048);
    const [topP, setTopP] = useState<number>(0.95);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [actionType, setActionType] = useState<'activate' | 'deactivate' | 'save_params' | null>(null);

    const handleEditClick = (model: AIModelSettings) => {
        setEditingModel(model);
        setTemp(model.temperature);
        setMaxTokens(model.maxOutputTokens);
        setTopP(model.topP);
    };

    const handleSaveParams = async () => {
        if (!editingModel) return;
        setConfirmModalOpen(true);
        setActionType('save_params');
    };

    const handleToggleActive = async (model: AIModelSettings) => {
        setEditingModel(model); // Temporarily set to capture model for confirmation
        setConfirmModalOpen(true);
        setActionType(model.isActive ? 'deactivate' : 'activate');
    };

    const confirmAction = async () => {
        if (!editingModel) return;

        try {
            if (actionType === 'save_params') {
                const updatedModel = { ...editingModel, temperature: temp, maxOutputTokens: maxTokens, topP: topP };
                await updateModel(updatedModel);
                setEditingModel(updatedModel); // Update local state for immediate reflection
            } else if (actionType === 'activate' || actionType === 'deactivate') {
                const updatedModel = { ...editingModel, isActive: actionType === 'activate' };
                await updateModel(updatedModel);
                setEditingModel(updatedModel); // Update local state
                if (actionType === 'activate' && userProfile.subscriptionTier === 'free' && updatedModel.inputTokenCostPerMillion && updatedModel.inputTokenCostPerMillion > 0.5) {
                    alert("Warning: Activating this powerful model may incur significantly higher costs. Consider upgrading your plan for better rates or enterprise negotiation.");
                }
            }
        } catch (err) {
            console.error("Action failed:", err);
            alert(`Failed to ${actionType} model. See console for details.`);
        } finally {
            setConfirmModalOpen(false);
            setActionType(null);
        }
    };


    return (
        <Card title="AI Model Configuration" className="space-y-4">
            {loading ? (
                <LoadingSpinner />
            ) : error ? (
                <AlertMessage type="error" message={error} />
            ) : (
                <div className="space-y-6">
                    <p className="text-gray-400">
                        Manage your AI models and their parameters. Activating certain models may impact your usage costs.
                        This panel provides granular control over the intelligent automation layer.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {models.map(model => (
                            <div key={model.modelId} className={`p-4 rounded-lg border
                                ${model.isActive ? 'border-cyan-500 bg-gray-800' : 'border-gray-700 bg-gray-900'}
                                ${editingModel?.modelId === model.modelId ? 'ring-2 ring-blue-500' : ''}`}>
                                <h4 className="text-lg font-semibold text-white">{model.name}</h4>
                                <p className="text-gray-400 text-sm mb-2">{model.description}</p>
                                <div className="text-sm text-gray-500 mb-2">
                                    <p>Provider: {model.provider}</p>
                                    <p>Input Cost/M tokens: {model.inputTokenCostPerMillion ? `$${model.inputTokenCostPerMillion.toFixed(3)}` : 'N/A'}</p>
                                    <p>Output Cost/M tokens: {model.outputTokenCostPerMillion ? `$${model.outputTokenCostPerMillion.toFixed(3)}` : 'N/A'}</p>
                                    <p>Capabilities: {model.capabilities.join(', ')}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                        ${model.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                        {model.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditClick(model)}
                                            className="text-indigo-400 hover:text-indigo-300 text-sm"
                                        >
                                            Edit Params
                                        </button>
                                        <button
                                            onClick={() => handleToggleActive(model)}
                                            className={`${model.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'} text-sm`}
                                        >
                                            {model.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {editingModel && (
                        <Card title={`Edit Model Parameters: ${editingModel.name}`} className="mt-8">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="temperature" className="block text-sm font-medium text-gray-400">Temperature ({temp.toFixed(2)})</label>
                                    <input
                                        type="range"
                                        id="temperature"
                                        min="0.0"
                                        max="1.0"
                                        step="0.01"
                                        value={temp}
                                        onChange={(e) => setTemp(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700 accent-cyan-500"
                                    />
                                    <p className="text-xs text-gray-500">Controls the randomness of the output. Lower values produce more deterministic results, crucial for compliance-focused tasks.</p>
                                </div>
                                <div>
                                    <label htmlFor="maxOutputTokens" className="block text-sm font-medium text-gray-400">Max Output Tokens ({maxTokens})</label>
                                    <input
                                        type="range"
                                        id="maxOutputTokens"
                                        min="256"
                                        max="8192"
                                        step="256"
                                        value={maxTokens}
                                        onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700 accent-cyan-500"
                                    />
                                    <p className="text-xs text-gray-500">Maximum number of tokens to generate in the response, balancing verbosity with cost-efficiency.</p>
                                </div>
                                <div>
                                    <label htmlFor="topP" className="block text-sm font-medium text-gray-400">Top P ({topP.toFixed(2)})</label>
                                    <input
                                        type="range"
                                        id="topP"
                                        min="0.0"
                                        max="1.0"
                                        step="0.01"
                                        value={topP}
                                        onChange={(e) => setTopP(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700 accent-cyan-500"
                                    />
                                    <p className="text-xs text-gray-500">Nucleus sampling: filters out low probability tokens, controlling the diversity of output for critical content generation.</p>
                                </div>
                                <div className="flex justify-end mt-4 space-x-2">
                                    <button
                                        onClick={() => setEditingModel(null)}
                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveParams}
                                        disabled={loading}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Apply Changes'}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            )}

            <Modal isOpen={confirmModalOpen} onClose={() => setConfirmModalOpen(false)} title="Confirm Action">
                {actionType === 'save_params' && editingModel && (
                    <p className="text-gray-300">Are you sure you want to apply these new parameters to <strong>{editingModel.name}</strong>?</p>
                )}
                {actionType === 'activate' && editingModel && (
                    <p className="text-gray-300">Are you sure you want to <strong>activate</strong> <strong>{editingModel.name}</strong>? This model may incur additional costs and alter AI service delivery.</p>
                )}
                {actionType === 'deactivate' && editingModel && (
                    <p className="text-gray-300">Are you sure you want to <strong>deactivate</strong> <strong>{editingModel.name}</strong>? This will remove it from available AI processing options.</p>
                )}
                <div className="mt-4 flex justify-end space-x-2">
                    <button
                        onClick={() => setConfirmModalOpen(false)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmAction}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm"
                    >
                        Confirm
                    </button>
                </div>
            </Modal>
        </Card>
    );
};

/**
 * Props for the PromptEngineeringStudio component.
 * Business value: Provides advanced users with tools to craft and manage custom AI prompts,
 * enabling highly specialized and consistent AI-driven content generation workflows. This
 * feature unlocks maximum value from the AI layer for niche applications and regulatory compliance.
 */
interface PromptEngineeringStudioProps {
    userId: string;
    onApplyPrompt: (template: string, params: PromptParameters) => void;
    currentInput: string;
}

/**
 * Provides a studio for creating, managing, and applying custom prompt templates.
 * Business value: Elevates the AI interaction by allowing custom-tailored prompts,
 * leading to more accurate, relevant, and powerful AI outputs for niche applications. This
 * empowers users to define AI behavior, enhancing flexibility and intellectual property leverage.
 */
export const PromptEngineeringStudio: React.FC<PromptEngineeringStudioProps> = ({ userId, onApplyPrompt, currentInput }) => {
    const { templates, loading, error, loadTemplates, addOrUpdateTemplate, removeTemplate } = usePromptTemplateManager(userId);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [currentTemplateContent, setCurrentTemplateContent] = useState('');
    const [templateParams, setTemplateParams] = useState<PromptParameters>({});
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);

    useEffect(() => {
        if (selectedTemplateId) {
            const template = templates.find(t => t.id === selectedTemplateId);
            if (template) {
                setCurrentTemplateContent(template.template);
                // Extract placeholders like ${variableName}
                const placeholders = [...template.template.matchAll(/\$\{(\w+)\}/g)].map(match => match[1]);
                const initialParams: PromptParameters = {};
                placeholders.forEach(ph => {
                    initialParams[ph] = ''; // Initialize with empty string
                    if (ph === 'clause' || ph === 'text' || ph === 'content') {
                        initialParams[ph] = currentInput; // Pre-fill with current input
                    } else if (ph === 'audienceLevel') {
                        initialParams[ph] = 'high_school'; // sensible default
                    } else if (ph === 'wordCount') {
                        initialParams[ph] = 150; // sensible default
                    } else if (ph === 'focusAreas') {
                        initialParams[ph] = 'key financial metrics, risk assessment'; // sensible default for financial focus
                    }
                });
                setTemplateParams(initialParams);
            }
        } else {
            setCurrentTemplateContent('');
            setTemplateParams({});
        }
    }, [selectedTemplateId, templates, currentInput]);

    const handleParamChange = (key: string, value: string | number | boolean) => {
        setTemplateParams(prev => ({ ...prev, [key]: value }));
    };

    const handleApplyPrompt = () => {
        if (currentTemplateContent) {
            onApplyPrompt(currentTemplateContent, templateParams);
            alert('Prompt applied! See clarification view for results.');
        }
    };

    const handleOpenTemplateModal = (template: PromptTemplate | null = null) => {
        setEditingTemplate(template);
        setShowTemplateModal(true);
    };

    const handleSaveTemplate = async (templateData: Omit<PromptTemplate, 'id' | 'userId' | 'lastModified'>) => {
        const newTemplate: PromptTemplate = {
            id: editingTemplate?.id || '',
            userId: userId,
            lastModified: new Date(),
            ...templateData,
        };
        await addOrUpdateTemplate(newTemplate);
        setShowTemplateModal(false);
        setEditingTemplate(null);
    };

    const getTemplatePreview = (templateContent: string, params: PromptParameters) => {
        let preview = templateContent;
        for (const key in params) {
            preview = preview.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), String(params[key]));
        }
        return preview;
    };

    return (
        <Card title="Prompt Engineering Studio" className="space-y-4">
            <p className="text-gray-400">Craft and refine custom AI prompts for specialized clarification tasks, enhancing precision and control over AI outputs.</p>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <Dropdown
                    label="Select Template"
                    options={[{ value: '', label: 'None (Start New)' }, ...templates.map(t => ({ value: t.id, label: t.name }))]}
                    selectedValue={selectedTemplateId}
                    onValueChange={setSelectedTemplateId}
                    className="flex-grow"
                />
                <button
                    onClick={() => handleOpenTemplateModal()}
                    className="py-2 px-6 bg-green-600 hover:bg-green-700 rounded text-white flex-shrink-0"
                >
                    Create New Template
                </button>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : error ? (
                <AlertMessage type="error" message={error} />
            ) : (
                <>
                    {selectedTemplateId && templates.find(t => t.id === selectedTemplateId) && (
                        <Card title={`Template: ${templates.find(t => t.id === selectedTemplateId)?.name}`} className="mt-4">
                            <p className="text-gray-400 text-sm mb-2">{templates.find(t => t.id === selectedTemplateId)?.description}</p>
                            <h4 className="text-lg font-semibold text-white mb-2">Template Content:</h4>
                            <RichTextEditor
                                value={currentTemplateContent}
                                onChange={setCurrentTemplateContent}
                                minHeight="8rem"
                                placeholder="Enter your prompt template here. Use ${variableName} for dynamic parameters."
                                className="mb-4"
                            />

                            {Object.keys(templateParams).length > 0 && (
                                <>
                                    <h4 className="text-lg font-semibold text-white mb-2 mt-4">Fill Parameters:</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(templateParams).map(([key, value]) => (
                                            <div key={key} className="flex flex-col">
                                                <label htmlFor={`param-${key}`} className="text-gray-400 text-sm mb-1">{key}</label>
                                                {key === 'audienceLevel' ? (
                                                    <Dropdown
                                                        options={[{ value: 'high_school', label: 'High School Student' }, { value: 'college', label: 'College Student' }, { value: 'expert', label: 'Expert' }]}
                                                        selectedValue={String(value)}
                                                        onValueChange={(val) => handleParamChange(key, val)}
                                                    />
                                                ) : typeof value === 'number' ? (
                                                    <input
                                                        type="number"
                                                        id={`param-${key}`}
                                                        value={String(value)}
                                                        onChange={(e) => handleParamChange(key, parseFloat(e.target.value))}
                                                        className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-sm border border-gray-600 focus:border-cyan-500 focus:ring-cyan-500"
                                                    />
                                                ) : (
                                                    <textarea
                                                        id={`param-${key}`}
                                                        value={String(value)}
                                                        onChange={(e) => handleParamChange(key, e.target.value)}
                                                        rows={key === 'clause' || key === 'text' || key === 'context' || key === 'focusAreas' ? 4 : 1}
                                                        className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-sm border border-gray-600 focus:border-cyan-500 focus:ring-cyan-500"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            <h4 className="text-lg font-semibold text-white mb-2 mt-4">Prompt Preview:</h4>
                            <div className="bg-gray-800/50 p-3 rounded text-gray-300 font-mono text-sm whitespace-pre-wrap min-h-[6rem] border border-gray-700">
                                {getTemplatePreview(currentTemplateContent, templateParams)}
                            </div>

                            <div className="flex justify-end mt-4 space-x-2">
                                <button
                                    onClick={() => handleOpenTemplateModal(templates.find(t => t.id === selectedTemplateId))}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white text-sm"
                                >
                                    Edit Template
                                </button>
                                <button
                                    onClick={() => removeTemplate(selectedTemplateId)}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
                                >
                                    Delete Template
                                </button>
                                <button
                                    onClick={handleApplyPrompt}
                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-sm"
                                >
                                    Apply Prompt
                                </button>
                            </div>
                        </Card>
                    )}
                </>
            )}

            <Modal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} title={editingTemplate ? "Edit Prompt Template" : "New Prompt Template"}>
                <TemplateForm
                    initialData={editingTemplate || undefined}
                    onSave={handleSaveTemplate}
                    onCancel={() => setShowTemplateModal(false)}
                    isLoading={loading}
                />
            </Modal>
        </Card>
    );
};

/**
 * Props for the TemplateForm component.
 * Business value: Provides a structured form for creating and editing AI prompt templates,
 * ensuring data integrity and ease of use in managing reusable prompt assets. This simplifies
 * the creation of highly specialized AI behaviors.
 */
interface TemplateFormProps {
    initialData?: Omit<PromptTemplate, 'id' | 'userId' | 'lastModified'>;
    onSave: (data: Omit<PromptTemplate, 'id' | 'userId' | 'lastModified'>) => void;
    onCancel: () => void;
    isLoading: boolean;
}

/**
 * Form component for creating or editing a PromptTemplate.
 * Business value: Simplifies the process of defining custom AI behavior, allowing users to
 * easily formalize effective prompts and share them, accelerating development of specialized
 * AI applications and promoting best practices across the organization.
 */
const TemplateForm: React.FC<TemplateFormProps> = ({ initialData, onSave, onCancel, isLoading }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [template, setTemplate] = useState(initialData?.template || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [category, setCategory] = useState(initialData?.category || 'general');
    const [isPublic, setIsPublic] = useState(initialData?.isPublic || false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, template, description, category, isPublic });
    };

    const categoryOptions = [
        { value: 'general', label: 'General' },
        { value: 'legal', label: 'Legal' },
        { value: 'medical', label: 'Medical' },
        { value: 'technical', label: 'Technical' },
        { value: 'financial', label: 'Financial' },
        { value: 'academic', label: 'Academic' },
        { value: 'creative', label: 'Creative' },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="templateName" className="block text-sm font-medium text-gray-400">Template Name</label>
                <input
                    type="text"
                    id="templateName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-sm border border-gray-600"
                    required
                />
            </div>
            <div>
                <label htmlFor="templateContent" className="block text-sm font-medium text-gray-400">Template Content (Use ${'{variable}'} for parameters)</label>
                <textarea
                    id="templateContent"
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    rows={6}
                    className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-sm border border-gray-600"
                    required
                />
            </div>
            <div>
                <label htmlFor="templateDescription" className="block text-sm font-medium text-gray-400">Description</label>
                <textarea
                    id="templateDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-sm border border-gray-600"
                />
            </div>
            <Dropdown
                label="Category"
                options={categoryOptions}
                selectedValue={category}
                onValueChange={setCategory}
            />
            <div className="flex items-center justify-between">
                <label htmlFor="isPublic" className="text-gray-400 text-sm">Make Public (Share with team/community)</label>
                <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="toggle toggle-primary"
                />
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading || !name || !template}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-sm disabled:opacity-50"
                >
                    {isLoading ? 'Saving...' : 'Save Template'}
                </button>
            </div>
        </form>
    );
};


/**
 * Props for the NotificationCenterPanel component.
 * Business value: Centralizes user alerts and system communications, ensuring important
 * messages are visible and actionable, enhancing user engagement and operational transparency.
 * This component is key for proactive problem resolution and customer awareness.
 */
interface NotificationCenterPanelProps {
    userId: string;
}

/**
 * Displays user notifications and allows marking them as read.
 * Business value: Provides a clear, organized inbox for system notifications, allowing users
 * to stay informed about processing status, new features, and critical account alerts. This
 * improves user experience, reduces support load, and maintains system-wide transparency.
 */
export const NotificationCenterPanel: React.FC<NotificationCenterPanelProps> = ({ userId }) => {
    const { notifications, loading, error, markAsRead } = useNotifications(userId);

    return (
        <Card title="Notifications" className="space-y-4">
            {loading ? (
                <LoadingSpinner />
            ) : error ? (
                <AlertMessage type="error" message={error} />
            ) : notifications.length === 0 ? (
                <p className="text-gray-500">No new notifications.</p>
            ) : (
                <div className="space-y-3">
                    {notifications
                        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) // Sort by newest first
                        .map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-3 rounded-md flex items-start space-x-3
                                    ${notification.isRead ? 'bg-gray-800 text-gray-400' : 'bg-gray-700 text-white border border-cyan-700'}
                                    hover:bg-gray-700/70 transition-colors duration-200`}
                            >
                                <div className="flex-shrink-0">
                                    {notification.type === 'success' && <span className="text-green-500">✔</span>}
                                    {notification.type === 'info' && <span className="text-blue-500">ⓘ</span>}
                                    {notification.type === 'warning' && <span className="text-yellow-500">⚠</span>}
                                    {notification.type === 'error' && <span className="text-red-500">✖</span>}
                                </div>
                                <div className="flex-grow">
                                    <p className={`${notification.isRead ? 'text-gray-400' : 'font-semibold text-white'}`}>
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(notification.timestamp).toLocaleString()}
                                    </p>
                                    {notification.actionLink && (
                                        <a href={notification.actionLink} className="text-cyan-400 hover:underline text-sm block mt-1">
                                            View Details
                                        </a>
                                    )}
                                </div>
                                {!notification.isRead && (
                                    <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="flex-shrink-0 text-xs px-2 py-1 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white"
                                    >
                                        Mark as Read
                                    </button>
                                )}
                            </div>
                        ))}
                </div>
            )}
        </Card>
    );
};

/**
 * Props for the AuditLogViewerPanel component.
 * Business value: Essential for security and compliance, this component provides a transparent,
 * auditable record of all user and system activities, enhancing accountability and trust. This
 * forms a critical part of the platform's governance and integrity framework.
 */
interface AuditLogViewerPanelProps {
    userId: string;
}

/**
 * Displays recent audit log entries for the user.
 * Business value: Offers a tamper-evident record of all system interactions, vital for
 * forensic analysis, regulatory compliance, and maintaining system integrity. By providing
 * a cryptographically chained log, it builds trust and enables robust governance.
 */
export const AuditLogViewerPanel: React.FC<AuditLogViewerPanelProps> = ({ userId }) => {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [logLimit, setLogLimit] = useState(20);

    const loadLogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedLogs = await fetchAuditLogs(userId, logLimit);
            setLogs(fetchedLogs);
        } catch (err: any) {
            console.error("Failed to load audit logs:", err);
            setError(`Failed to load audit logs: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [userId, logLimit]);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    return (
        <Card title="Audit Log" className="space-y-4">
            <p className="text-gray-400">Review recent activities on your account for security and tracking. Logs are cryptographically chained for tamper evidence, ensuring integrity for compliance.</p>

            <div className="flex justify-between items-center mb-4">
                <Dropdown
                    label="Show"
                    options={[
                        { value: '10', label: '10 entries' },
                        { value: '20', label: '20 entries' },
                        { value: '50', label: '50 entries' },
                    ]}
                    selectedValue={String(logLimit)}
                    onValueChange={(val) => setLogLimit(parseInt(val))}
                    className="w-40"
                />
                <button
                    onClick={loadLogs}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm disabled:opacity-50"
                >
                    {loading ? 'Refreshing...' : 'Refresh Logs'}
                </button>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : error ? (
                <AlertMessage type="error" message={error} />
            ) : logs.length === 0 ? (
                <p className="text-gray-500">No audit log entries found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Timestamp
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Actor
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Action
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Resource
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Details
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Hash Chain
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                        {log.userId === 'system' ? 'System' : log.userId.substring(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                        {log.action}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {log.resourceType} ({log.resourceId.substring(0, 8)}...)
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis">
                                        {JSON.stringify(log.details)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                                        {log.previousHash ? `${log.previousHash.substring(0, 8)}...` : 'GENESIS'}
                                        <br />
                                        <span className="text-cyan-500">{log.hash.substring(0, 8)}...</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};

/**
 * Props for the APIKeyManagementPanel component.
 * Business value: Enables secure programmatic access to the platform via API keys,
 * facilitating integration with external systems and custom applications. This is critical
 * for ecosystem growth and leveraging the platform as a backend for diverse financial tools.
 */
interface APIKeyManagementPanelProps {
    userId: string;
    hasAccess: boolean;
}

/**
 * Allows users to manage their API keys for programmatic access.
 * Business value: Provides self-service management of API credentials, crucial for developers
 * integrating with the platform and enhancing the ecosystem's extensibility. This reduces
 * operational overhead and accelerates third-party innovation.
 */
export const APIKeyManagementPanel: React.FC<APIKeyManagementPanelProps> = ({ userId, hasAccess }) => {
    const [apiKeys, setApiKeys] = useState<string[]>([]); // Mock array of keys
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showNewKeyModal, setShowNewKeyModal] = useState(false);
    const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(null);

    const generateNewKey = async () => {
        setLoading(true);
        setError(null);
        setNewlyGeneratedKey(null);
        try {
            // Simulate API call to generate new key
            await new Promise(resolve => setTimeout(resolve, mockApiResponseDelay));
            const newKey = `sk-lexiconclarifier-${Date.now()}-${Math.random().toString(36).substr(2, 20)}`;
            setApiKeys(prev => [...prev, newKey]);
            setNewlyGeneratedKey(newKey);
            setShowNewKeyModal(true);
            await logAuditEvent(userId, 'api_key_generated', 'APIKey', newKey.substring(0, 15), {});
        } catch (err: any) {
            console.error("Failed to generate API key:", err);
            setError(`Failed to generate API key: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const revokeKey = async (keyToRevoke: string) => {
        setLoading(true);
        setError(null);
        try {
            // Simulate API call to revoke key
            await new Promise(resolve => setTimeout(resolve, mockApiResponseDelay));
            setApiKeys(prev => prev.filter(key => key !== keyToRevoke));
            alert(`API key ${keyToRevoke.substring(0, 10)}... revoked successfully.`);
            await logAuditEvent(userId, 'api_key_revoked', 'APIKey', keyToRevoke.substring(0, 15), {});
        } catch (err: any) {
            console.error("Failed to revoke API key:", err);
            setError(`Failed to revoke API key: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Initial load for mock keys
    useEffect(() => {
        if (hasAccess) {
            setLoading(true);
            setTimeout(() => {
                setApiKeys(['sk-lexiconclarifier-mockkey12345', 'sk-lexiconclarifier-mockkey67890']);
                setLoading(false);
            }, mockApiResponseDelay);
        }
    }, [hasAccess]);

    if (!hasAccess) {
        return (
            <Card title="API Key Management">
                <AlertMessage type="warning" message="API Key access requires a Pro or Enterprise subscription." />
                <p className="text-gray-400 mt-2">Upgrade your plan to unlock programmatic access to Lexicon Clarifier, enabling seamless integration with your existing systems.</p>
                <div className="mt-4">
                    <button className="py-2 px-6 bg-purple-600 hover:bg-purple-700 rounded text-white">Upgrade Plan</button>
                </div>
            </Card>
        );
    }

    return (
        <Card title="API Key Management" className="space-y-4">
            <p className="text-gray-400">Generate and manage API keys for integrating Lexicon Clarifier into your own applications, fostering a dynamic and extensible financial ecosystem.</p>
            {error && <AlertMessage type="error" message={error} onClose={() => setError(null)} className="mb-4" />}

            <div className="flex justify-end">
                <button
                    onClick={generateNewKey}
                    disabled={loading}
                    className="py-2 px-6 bg-green-600 hover:bg-green-700 rounded text-white disabled:opacity-50"
                >
                    {loading ? 'Generating...' : 'Generate New API Key'}
                </button>
            </div>

            <h3 className="text-xl font-semibold text-white mt-8 mb-3">Your API Keys</h3>
            {loading && !apiKeys.length ? (
                <LoadingSpinner />
            ) : apiKeys.length === 0 ? (
                <p className="text-gray-500">No API keys generated yet. Click "Generate New API Key" to get started.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Key
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Last Used (Mock)
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {apiKeys.map((key) => (
                                <tr key={key}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-white">
                                        {key.substring(0, 10)}...{key.substring(key.length - 8)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toLocaleString()} {/* Random last used */}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(key)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            Copy
                                        </button>
                                        <button
                                            onClick={() => revokeKey(key)}
                                            className="text-red-600 hover:text-red-900"
                                            disabled={loading}
                                        >
                                            Revoke
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={showNewKeyModal} onClose={() => setShowNewKeyModal(false)} title="New API Key Generated!">
                <p className="text-gray-300 mb-4">
                    Your new API key has been generated. Please copy it now, as it will not be shown again.
                    Treat this key like a password and keep it secure.
                </p>
                {newlyGeneratedKey && (
                    <div className="relative bg-gray-900 p-3 rounded-md border border-cyan-700 break-all">
                        <code className="text-white font-mono text-sm">{newlyGeneratedKey}</code>
                        <button
                            onClick={() => navigator.clipboard.writeText(newlyGeneratedKey)}
                            className="absolute top-2 right-2 p-1 text-cyan-400 hover:text-cyan-200"
                            aria-label="Copy API key"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 0h-3M16 7a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7z" />
                            </svg>
                        </button>
                    </div>
                )}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => setShowNewKeyModal(false)}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-sm"
                    >
                        Got It
                    </button>
                </div>
            </Modal>
        </Card>
    );
};

/**
 * Props for the SubscriptionAndBillingPanel component.
 * Business value: Centralizes subscription and financial management, providing transparency
 * into plans, usage, and billing, directly supporting revenue operations and customer trust.
 * This is a core component of the platform's commercial-grade financial infrastructure.
 */
interface SubscriptionAndBillingPanelProps {
    userId: string;
    currentUserTier: UserProfile['subscriptionTier'];
}

/**
 * Manages user subscriptions, payment methods, and displays AI usage costs.
 * Business value: This panel drives revenue by facilitating subscription upgrades,
 * provides financial transparency through usage tracking, and enables seamless payment
 * management, securing long-term customer relationships and profitability. It's an
 * integral part of the platform's commercial strategy and financial backbone.
 */
export const SubscriptionAndBillingPanel: React.FC<SubscriptionAndBillingPanelProps> = ({ userId, currentUserTier }) => {
    const { subscription, paymentMethods, loading, error, loadSubscriptionData, updateSubscriptionPlan, addPayment, makePayment } = useSubscriptionManager(userId);
    const { usageHistory, loading: usageLoading, error: usageError, loadUsageHistory } = useAIUsageTracker(userId);

    const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false);
    const [newPaymentType, setNewPaymentType] = useState<PaymentMethod['type']>('card');
    const [newPaymentDetails, setNewPaymentDetails] = useState({ last4Digits: '', bankName: '', cryptoAddressMasked: '' });
    const [processingPayment, setProcessingPayment] = useState(false);

    const handleAddPaymentMethod = async () => {
        if (!userId) return;
        setProcessingPayment(true);
        try {
            const methodToAdd: Omit<PaymentMethod, 'id' | 'createdAt'> = {
                userId,
                type: newPaymentType,
                isDefault: paymentMethods.length === 0, // Make first one default
                ...((newPaymentType === 'card' && { last4Digits: newPaymentDetails.last4Digits }))
            };
            await addPayment(methodToAdd);
            setIsAddingPaymentMethod(false);
            setNewPaymentDetails({ last4Digits: '', bankName: '', cryptoAddressMasked: '' });
            alert('Payment method added successfully!');
        } catch (err) {
            alert('Failed to add payment method.');
        } finally {
            setProcessingPayment(false);
        }
    };

    const handleUpgradePlan = async (plan: 'pro' | 'enterprise') => {
        if (!userId) return;
        setProcessingPayment(true); // Reusing for plan change
        try {
            await updateSubscriptionPlan(plan);
            alert(`Subscription updated to ${plan.toUpperCase()} plan!`);
        } catch (err: any) {
            alert(`Failed to update subscription: ${err.message}`);
        } finally {
            setProcessingPayment(false);
        }
    };

    const totalUsageCost = usageHistory.reduce((sum, record) => sum + record.estimatedCostUSD, 0);

    return (
        <Card title="Subscription & Billing" className="space-y-6">
            {(loading || usageLoading) && <LoadingSpinner />}
            {(error || usageError) && <AlertMessage type="error" message={error || usageError || "An error occurred."} className="mb-4" />}

            <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2">Your Subscription</h3>
            {subscription ? (
                <div className="space-y-2 text-gray-300">
                    <p>Plan: <span className="font-semibold text-cyan-400">{subscription.name.toUpperCase()}</span> (${subscription.monthlyPriceUSD}/month)</p>
                    <p>Description: {subscription.description}</p>
                    <p>Features: {subscription.features.join(', ')}</p>
                    <p>Storage Limit: {subscription.documentStorageGB} GB</p>
                    <p>API Access: {subscription.apiKeyAccess ? 'Enabled' : 'Disabled'}</p>
                    <p className="mt-4 text-gray-400">Current AI Usage Cost (this period): <span className="font-bold text-lg text-green-400">${totalUsageCost.toFixed(4)}</span></p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {currentUserTier === 'free' && (
                            <button onClick={() => handleUpgradePlan('pro')} disabled={processingPayment} className="py-2 px-6 bg-purple-600 hover:bg-purple-700 rounded text-white disabled:opacity-50">
                                {processingPayment ? 'Upgrading...' : 'Upgrade to Pro'}
                            </button>
                        )}
                        {currentUserTier === 'pro' && (
                            <button onClick={() => handleUpgradePlan('enterprise')} disabled={processingPayment} className="py-2 px-6 bg-yellow-600 hover:bg-yellow-700 rounded text-white disabled:opacity-50">
                                {processingPayment ? 'Contacting...' : 'Contact for Enterprise'}
                            </button>
                        )}
                        {currentUserTier !== 'free' && (
                            <button onClick={() => handleUpgradePlan('free')} disabled={processingPayment} className="py-2 px-6 bg-red-600 hover:bg-red-700 rounded text-white disabled:opacity-50">
                                {processingPayment ? 'Downgrading...' : 'Downgrade to Free'}
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <p className="text-gray-500">Loading subscription details...</p>
            )}

            <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-700 pb-2 mt-8">Payment Methods</h3>
            {paymentMethods.length === 0 ? (
                <p className="text-gray-500">No payment methods configured. Add one to manage your subscriptions.</p>
            ) : (
                <div className="space-y-3">
                    {paymentMethods.map(pm => (
                        <div key={pm.id} className="p-3 bg-gray-800 rounded-md flex justify-between items-center">
                            <div className="text-gray-300">
                                <p className="font-semibold">{pm.type === 'card' ? `Card ending in ${pm.last4Digits}` : `Crypto (${pm.cryptoAddressMasked})`}</p>
                                <p className="text-xs text-gray-500">Added: {new Date(pm.createdAt).toLocaleDateString()} {pm.expiresAt && `(Expires: ${new Date(pm.expiresAt).toLocaleDateString()})`}</p>
                            </div>
                            {pm.isDefault && <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">Default</span>}
                        </div>
                    ))}
                </div>
            )}
            <div className="mt-4 flex justify-end">
                <button onClick={() => setIsAddingPaymentMethod(true)} className="py-2 px-6 bg-blue-600 hover:bg-blue-700 rounded text-white">
                    Add Payment Method
                </button>
            </div>

            <Modal isOpen={isAddingPaymentMethod} onClose={() => setIsAddingPaymentMethod(false)} title="Add New Payment Method">
                <div className="space-y-4">
                    <Dropdown
                        label="Payment Type"
                        options={[{ value: 'card', label: 'Credit Card' }, { value: 'crypto', label: 'Cryptocurrency' }]}
                        selectedValue={newPaymentType}
                        onValueChange={(val) => setNewPaymentType(val as PaymentMethod['type'])}
                    />
                    {newPaymentType === 'card' && (
                        <div>
                            <label htmlFor="last4" className="block text-sm font-medium text-gray-400">Card Last 4 Digits</label>
                            <input
                                type="text"
                                id="last4"
                                value={newPaymentDetails.last4Digits}
                                onChange={(e) => setNewPaymentDetails(prev => ({ ...prev, last4Digits: e.target.value }))}
                                maxLength={4}
                                className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-sm border border-gray-600"
                            />
                        </div>
                    )}
                    {newPaymentType === 'crypto' && (
                        <div>
                            <label htmlFor="cryptoAddr" className="block text-sm font-medium text-gray-400">Crypto Wallet Address (Masked)</label>
                            <input
                                type="text"
                                id="cryptoAddr"
                                value={newPaymentDetails.cryptoAddressMasked}
                                onChange={(e) => setNewPaymentDetails(prev => ({ ...prev, cryptoAddressMasked: e.target.value }))}
                                placeholder="e.g., 0xabc...xyz"
                                className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-sm border border-gray-600"
                            />
                        </div>
                    )}
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                    <button
                        onClick={() => setIsAddingPaymentMethod(false)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddPaymentMethod}
                        disabled={processingPayment || (newPaymentType === 'card' && newPaymentDetails.last4Digits.length !== 4) || (newPaymentType === 'crypto' && !newPaymentDetails.cryptoAddressMasked)}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white text-sm disabled:opacity-50"
                    >
                        {processingPayment ? 'Adding...' : 'Add Method'}
                    </button>
                </div>
            </Modal>
        </Card>
    );
};

/**
 * Props for the AutomatedAgentTasksPanel component.
 * Business value: Provides an interface for monitoring and managing agent-driven automation,
 * enabling visibility into proactive system operations and their outcomes. This transparency
 * is crucial for operational oversight and auditing of intelligent automation.
 */
interface AutomatedAgentTasksPanelProps {
    userId: string;
}

/**
 * Displays and manages automated agent tasks.
 * Business value: Offers transparent oversight of AI agent activities, allowing users to
 * track the progress and results of automated document analysis, glossary suggestions,
 * and other agentic workflows, ultimately enhancing operational efficiency. This panel
 * directly demonstrates the value of the Agentic Intelligence Layer.
 */
export const AutomatedAgentTasksPanel: React.FC<AutomatedAgentTasksPanelProps> = ({ userId }) => {
    const { tasks, loading, error, loadTasks } = useAgentTaskExecutor(userId);

    const taskTypeOptions = [
        { value: 'document_analysis', label: 'Document Analysis' },
        { value: 'glossary_suggestion', label: 'Glossary Suggestion' },
        { value: 'anomaly_detection', label: 'Anomaly Detection' },
        { value: 'reconciliation_check', label: 'Reconciliation Check' },
        { value: 'real_time_settlement_monitor', label: 'Settlement Monitor' },
    ];

    const getTaskTypeLabel = (type: AgentTask['taskType']) => {
        return taskTypeOptions.find(opt => opt.value === type)?.label || type;
    };

    return (
        <Card title="Automated Agent Tasks" className="space-y-4">
            <p className="text-gray-400">Monitor the status and results of automated tasks performed by AI agents across the financial infrastructure. This provides real-time oversight over intelligent operations.</p>
            <div className="flex justify-end">
                <button
                    onClick={loadTasks}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm disabled:opacity-50"
                >
                    {loading ? 'Refreshing...' : 'Refresh Tasks'}
                </button>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : error ? (
                <AlertMessage type="error" message={error} />
            ) : tasks.length === 0 ? (
                <p className="text-gray-500">No agent tasks initiated yet. Automated processes will appear here.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Task Type
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Target ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Priority
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Initiated
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Completed
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Results
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {tasks.map((task) => (
                                <tr key={task.id} className="hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                        {getTaskTypeLabel(task.taskType)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {task.targetEntityId.substring(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                            ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                            task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'}`}
                                        >
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                            ${task.priority === 'critical' ? 'bg-red-500 text-white' :
                                            task.priority === 'high' ? 'bg-orange-500 text-white' :
                                            task.priority === 'medium' ? 'bg-yellow-500 text-white' :
                                            'bg-gray-500 text-white'}`}
                                        >
                                            {task.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {new Date(task.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {task.completedAt ? new Date(task.completedAt).toLocaleString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis">
                                        {task.error || (task.results ? JSON.stringify(task.results) : 'Pending...')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};

/**
 * Props for the TokenRailSimulatorPanel component.
 * Business value: Provides a tangible representation of tokenized value within the platform,
 * enabling users to visualize and interact with their digital assets and financial transactions.
 * This is a direct interface to the Programmable Token Rail Layer.
 */
interface TokenRailSimulatorPanelProps {
    userId: string;
    currentUserRoles: string[];
}

/**
 * Simulates and displays user token balances and transactions on a digital token rail.
 * Business value: This panel acts as a direct interface to the Money20/20 token rails vision,
 * enabling auditable, atomic, and idempotent value transfers. It provides transparency
 * for usage-based billing, micro-payments, and rewards, directly implementing programmable
 * finance concepts and opening new monetization avenues. For enterprise, it signifies a
 * migration path to real-time gross settlement (RTGS) with digital assets, enhancing liquidity
 * and reducing counterparty risk in the next-generation financial backbone.
 */
export const TokenRailSimulatorPanel: React.FC<TokenRailSimulatorPanelProps> = ({ userId, currentUserRoles }) => {
    const { balance, transactions, loading, error, loadTokenData, executeTransaction, adminMintTokens } = useTokenRailsSimulator(userId);
    const [sendAmount, setSendAmount] = useState<number>(0);
    const [recipientAddress, setRecipientAddress] = useState<string>('');
    const [selectedRail, setSelectedRail] = useState<'rail_fast' | 'rail_batch'>('rail_fast');
    const [mintAmount, setMintAmount] = useState<number>(100);
    const isAdmin = currentUserRoles.includes('admin'); // Simple RBAC check

    const handleSendTokens = async () => {
        if (!userId || !balance || sendAmount <= 0 || !recipientAddress) {
            alert('Please fill all fields and ensure amount is positive.');
            return;
        }
        if (balance.balance < sendAmount) {
            alert('Insufficient balance.');
            return;
        }
        try {
            await executeTransaction(sendAmount, recipientAddress, 'transfer', selectedRail);
            alert('Tokens sent successfully!');
            setSendAmount(0);
            setRecipientAddress('');
        } catch (err: any) {
            alert(`Failed to send tokens: ${err.message}`);
        }
    };

    const handleAdminMint = async () => {
        if (!isAdmin || !userId || mintAmount <= 0) {
            alert('Invalid mint amount or insufficient permissions.');
            return;
        }
        try {
            await adminMintTokens(mintAmount, userId); // Mint to self for simplicity
            alert(`Minted ${mintAmount} LC_TOKEN to ${userId}.`);
            setMintAmount(100);
        } catch (err: any) {
            alert(`Failed to mint tokens: ${err.message}`);
        }
    };

    const railOptions = [
        { value: 'rail_fast', label: 'Fast Rail (Lower Latency, Higher Fee)' },
        { value: 'rail_batch', label: 'Batch Rail (Higher Latency, Lower Fee)' },
    ];

    return (
        <Card title="Token Rail Simulator (LC_TOKEN)" className="space-y-4">
            <p className="text-gray-400">Manage your digital LC_TOKEN balance and view transaction history across simulated payment rails. This is the future of real-time programmable value transfer.</p>
            {loading && <LoadingSpinner />}
            {error && <AlertMessage type="error" message={error} className="mb-4" />}

            <h3 className="text-xl font-semibold text-white mb-3 border-b border-gray-700 pb-2">Your Balance</h3>
            {balance ? (
                <div className="text-gray-300 text-lg">
                    Current Balance: <span className="font-bold text-cyan-400">{balance.balance.toFixed(2)} LC_TOKEN</span>
                    <p className="text-sm text-gray-500">Last Updated: {new Date(balance.lastUpdated).toLocaleString()}</p>
                </div>
            ) : (
                <p className="text-gray-500">Loading balance...</p>
            )}

            <h3 className="text-xl font-semibold text-white mb-3 border-b border-gray-700 pb-2 mt-8">Send Tokens</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="sendAmount" className="block text-sm font-medium text-gray-400">Amount to Send</label>
                    <input
                        type="number"
                        id="sendAmount"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(parseFloat(e.target.value))}
                        min="0.01"
                        step="0.01"
                        className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-sm border border-gray-600"
                    />
                </div>
                <div>
                    <label htmlFor="recipientAddress" className="block text-sm font-medium text-gray-400">Recipient Address (User ID or System Account)</label>
                    <input
                        type="text"
                        id="recipientAddress"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="e.g., user-456 or system_governance_account"
                        className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-sm border border-gray-600"
                    />
                </div>
                <Dropdown
                    label="Select Rail"
                    options={railOptions}
                    selectedValue={selectedRail}
                    onValueChange={(val) => setSelectedRail(val as 'rail_fast' | 'rail_batch')}
                    className="w-full"
                />
                <button
                    onClick={handleSendTokens}
                    disabled={loading || !balance || balance.balance < sendAmount || sendAmount <= 0 || !recipientAddress}
                    className="w-full py-2 px-6 bg-cyan-600 hover:bg-cyan-700 rounded text-white disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Send Tokens'}
                </button>
            </div>

            {isAdmin && (
                <>
                    <h3 className="text-xl font-semibold text-white mb-3 border-b border-gray-700 pb-2 mt-8">Admin: Mint Tokens</h3>
                    <p className="text-gray-500 text-sm">As an administrator, you can mint new LC_TOKEN into the system. This action is audited.</p>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="mintAmount" className="block text-sm font-medium text-gray-400">Amount to Mint</label>
                            <input
                                type="number"
                                id="mintAmount"
                                value={mintAmount}
                                onChange={(e) => setMintAmount(parseFloat(e.target.value))}
                                min="1"
                                step="1"
                                className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-sm border border-gray-600"
                            />
                        </div>
                        <button
                            onClick={handleAdminMint}
                            disabled={loading || mintAmount <= 0}
                            className="w-full py-2 px-6 bg-indigo-600 hover:bg-indigo-700 rounded text-white disabled:opacity-50"
                        >
                            {loading ? 'Minting...' : `Mint ${mintAmount} LC_TOKEN to self`}
                        </button>
                    </div>
                </>
            )}

            <h3 className="text-xl font-semibold text-white mb-3 border-b border-gray-700 pb-2 mt-8">Transaction History</h3>
            {transactions.length === 0 ? (
                <p className="text-gray-500">No transactions yet. All value movements will be immutably recorded here.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Type
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Fee
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    From / To
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Rail
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Time
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Signature
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {transactions.map(txn => (
                                <tr key={txn.id} className="hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{txn.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-400">{txn.amount.toFixed(2)} {txn.currency}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-400">{txn.fee ? txn.fee.toFixed(4) : '0.0000'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{txn.fromAddress.substring(0, 8)}... → {txn.toAddress.substring(0, 8)}...</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{txn.rail}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                            ${txn.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            txn.status === 'failed' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'}`}
                                        >
                                            {txn.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(txn.timestamp).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600" title={txn.signature}>
                                        {txn.signature.substring(0, 8)}...
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};

type MainViewTab = 'clarifier' | 'history' | 'documents' | 'glossary' | 'prompts' | 'settings' | 'models' | 'notifications' | 'audit_log' | 'api_keys' | 'subscription' | 'agent_tasks' | 'token_rails';

/**
 * The main application view for the Lexicon Clarifier.
 * Business value: This foundational component orchestrates all major features of the
 * Lexicon Clarifier, providing a seamless user experience across AI-driven analysis,
 * document management, custom knowledge bases, and advanced configuration.
 * It integrates agentic AI for automated workflows, programmable token rails for transparent
 * usage and micro-transactions, and robust digital identity features for security and governance.
 * This comprehensive platform drives millions in value by accelerating information processing,
 * enabling new revenue models, and providing unparalleled operational control and auditability
 * for enterprise clients, positioning it as a blueprint for the next trillion-dollar financial backbone.
 */
const LexiconClarifierView: React.FC = () => {
    const [clause, setClause] = useState('The Party of the First Part (hereinafter "Discloser") shall indemnify, defend, and hold harmless the Party of the Second Part (hereinafter "Recipient") from and against any and all claims, losses, damages, liabilities, and expenses...');
    const [explanation, setExplanation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentView, setCurrentView] = useState<MainViewTab>('clarifier');
    const [aiExplanationError, setAiExplanationError] = useState<string | null>(null);
    const [activeExplanationRecord, setActiveExplanationRecord] = useState<ExplanationRecord | null>(null);

    const { userProfile, loading: userLoading, error: userError, updatePreferences } = useUserProfileManager();
    const { addExplanationToHistory } = useExplanationHistory(userProfile?.id);
    const { addUsageRecord } = useAIUsageTracker(userProfile?.id);
    const { models: aiModels } = useAIModelConfig(); // To get actual model details

    const handleExplain = async (useCustomPrompt = false, customPromptTemplate: string = '', customPromptParams: PromptParameters = {}) => {
        setIsLoading(true);
        setExplanation('');
        setAiExplanationError(null);
        setActiveExplanationRecord(null);

        if (!userProfile) {
            setAiExplanationError("User profile not loaded. Cannot generate explanation.");
            setIsLoading(false);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const modelId = userProfile.preferences.defaultAIModel;
            const modelSettings = aiModels.find(m => m.modelId === modelId);

            if (!modelSettings || !modelSettings.isActive) {
                setAiExplanationError(`Selected AI model (${modelId}) is not active or configured. Please check AI Models settings.`);
                setIsLoading(false);
                return;
            }

            const style = userProfile.preferences.defaultExplanationStyle;
            const audience = userProfile.preferences.targetAudienceLevel;

            let prompt: string;
            if (useCustomPrompt && customPromptTemplate) {
                prompt = customPromptTemplate;
                for (const key in customPromptParams) {
                    // Replace placeholders like ${variable}
                    prompt = prompt.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), String(customPromptParams[key]));
                }
            } else {
                // Default prompt structure
                prompt = `You are a helpful assistant who explains complex topics in simple terms.
                          Explain the following content in ${style} English, as if you were talking to a ${audience}.
                          Content: "${clause}"`;
            }

            // Fallback for missing clause in custom prompts that expect it
            if (!useCustomPrompt && prompt.includes('${clause}') && !clause) {
                setAiExplanationError("Please provide content to clarify.");
                setIsLoading(false);
                return;
            }

            console.log("Sending prompt to AI model:", { modelId, prompt });

            // Estimate tokens (a rough estimate for frontend)
            const inputTokens = Math.ceil(prompt.length / 4); // ~4 chars per token for English
            let outputTokens = 0; // Will be updated after generation

            // Mock linked terms generation for demo purposes
            const mockLinkedTerms: LinkedTerm[] = [];
            const lowerCaseClause = clause.toLowerCase();
            if (lowerCaseClause.includes('indemnify')) {
                mockLinkedTerms.push({
                    term: "indemnify",
                    definition: "To compensate someone for harm or loss, often through a contractual agreement.",
                    context: "The Party of the First Part... shall indemnify...",
                    sourceUrl: "https://www.law.cornell.edu/wex/indemnify"
                });
            }
            if (lowerCaseClause.includes('liabilities')) {
                mockLinkedTerms.push({
                    term: "liabilities",
                    definition: "Legal obligations or responsibilities, especially for causing damage or loss, or financial debts.",
                    context: "...claims, losses, damages, liabilities...",
                    sourceUrl: "https://www.investopedia.com/terms/l/liability.asp"
                });
            }
            if (lowerCaseClause.includes('recipient')) {
                mockLinkedTerms.push({
                    term: "Recipient",
                    definition: "The party receiving something, in this context, typically the party being indemnified or protected from harm.",
                    context: "...Party of the Second Part (hereinafter 'Recipient')",
                });
            }

            // Simulate AI generation with a delay
            await new Promise(resolve => setTimeout(resolve, mockApiResponseDelay));
            // In a real application, the AI call would happen here.
            // For this mock, we are directly setting a pre-determined response.
            // const response = await ai.models.generateContent({ model: modelId, contents: [{ role: 'user', parts: [{ text: prompt }] }] });
            // const generatedText = response.text || "No explanation generated.";

            const generatedText = `A simplified explanation of the clause you provided is: The first party (the "Discloser") promises to protect the second party (the "Recipient") from any financial harm, legal claims, damages, or costs that might arise. This is a standard indemnity clause, ensuring the Recipient is not held responsible for issues caused by or related to the Discloser's actions.`;
            setExplanation(generatedText);
            outputTokens = Math.ceil(generatedText.length / 4); // Estimate output tokens

            // Calculate estimated cost
            const estimatedCostUSD = ((inputTokens / 1_000_000) * (modelSettings.inputTokenCostPerMillion || 0)) +
                                     ((outputTokens / 1_000_000) * (modelSettings.outputTokenCostPerMillion || 0));

            const newRecord: ExplanationRecord = {
                id: '', // Will be filled by backend
                userId: userProfile.id,
                originalContent: clause,
                explainedContent: generatedText,
                modelUsed: modelId,
                explanationStyle: style,
                audienceLevel: audience,
                timestamp: new Date(),
                sessionId: `session-${Date.now()}`,
                isFavorite: false,
                linkedTerms: mockLinkedTerms.length > 0 ? mockLinkedTerms : undefined,
                estimatedCost: estimatedCostUSD,
                tokensUsed: inputTokens + outputTokens,
            };
            const savedRecord = await saveExplanationRecord(newRecord);
            addExplanationToHistory(savedRecord);
            setActiveExplanationRecord(savedRecord);

            // Record AI usage for billing/analytics
            await addUsageRecord({
                userId: userProfile.id,
                timestamp: new Date(),
                modelId: modelId,
                inputTokens: inputTokens,
                outputTokens: outputTokens,
                estimatedCostUSD: estimatedCostUSD,
                feature: useCustomPrompt ? 'custom_prompt' : 'explanation',
                relatedEntityId: savedRecord.id,
            });
            await logAuditEvent(userProfile.id, 'explanation_generated', 'Explanation', savedRecord.id, { model: modelId, tokens: inputTokens + outputTokens, cost: estimatedCostUSD, customPrompt: useCustomPrompt });

        } catch (error: any) {
            console.error("AI Explanation Error:", error);
            setAiExplanationError(`Failed to get explanation: ${error.message || 'Unknown error.'}`);
            setExplanation('An error occurred while generating the explanation. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectHistoryExplanation = (exp: ExplanationRecord) => {
        setClause(exp.originalContent);
        setExplanation(exp.explainedContent);
        setActiveExplanationRecord(exp);
        setCurrentView('clarifier'); // Switch back to clarifier view
    };

    const handleSaveExplanationOutput = async (content: string) => {
        if (!activeExplanationRecord) {
            setAiExplanationError("No active explanation to save changes for.");
            return;
        }
        try {
            const updatedRecord = { ...activeExplanationRecord, explainedContent: content, timestamp: new Date() };
            const saved = await saveExplanationRecord(updatedRecord);
            setActiveExplanationRecord(saved);
            setExplanation(saved.explainedContent); // Update main explanation state
            addExplanationToHistory(saved); // Re-add/update in history (mocked)
            alert('Explanation changes saved!');
            await logAuditEvent(userProfile!.id, 'explanation_edited', 'Explanation', saved.id, {});
        } catch (err) {
            setAiExplanationError("Failed to save edited explanation.");
        }
    };

    const handleFeedbackExplanation = async (feedback: ExplanationFeedback) => {
        if (!activeExplanationRecord) {
            setAiExplanationError("No active explanation to provide feedback for.");
            return;
        }
        try {
            const updatedRecord = { ...activeExplanationRecord, feedback: feedback, timestamp: new Date() };
            const saved = await saveExplanationRecord(updatedRecord);
            setActiveExplanationRecord(saved);
            alert('Feedback submitted successfully!');
            await logAuditEvent(userProfile!.id, 'explanation_feedback_submitted', 'Explanation', saved.id, { rating: feedback.rating, helpful: feedback.isHelpful });
        } catch (err) {
            setAiExplanationError("Failed to submit feedback.");
        }
    };

    const handleApplyPromptFromStudio = (template: string, params: PromptParameters) => {
        // Pass the template and parameters to the AI explanation logic
        // The current 'clause' state will be used as input by default if not specified in params
        const finalParams = {
            ...params,
            // Ensure `clause` is always passed for consistency if the original clarifier expects it
            clause: params.clause || clause,
            text: params.text || clause, // For templates that use 'text'
        };
        handleExplain(true, template, finalParams);
        setCurrentView('clarifier'); // Switch back to the clarifier tab
    };

    const handleDocumentUploaded = (doc: DocumentMetadata) => {
        console.log('Document uploaded in main view:', doc.fileName);
        // This is handled by useDocumentManager. No further action needed here for this mock UI.
    };

    const handleDocumentAnalyze = (documentId: string, userId: string) => {
        console.log(`Document ${documentId} should be analyzed by agent for user ${userId}`);
        // This is handled within the DocumentUploadSection now via useAgentTaskExecutor
    };


    const tabClasses = (tab: MainViewTab) =>
        `px-4 py-2 text-sm font-medium rounded-t-lg
         ${currentView === tab
            ? 'bg-gray-700 text-cyan-400 border-b-2 border-cyan-500'
            : 'text-gray-400 hover:text-white hover:bg-gray-700'
        }`;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white tracking-wider">Blueprint 111: Lexicon Clarifier</h1>

            <nav className="flex space-x-2 border-b border-gray-700 overflow-x-auto pb-2">
                <button onClick={() => setCurrentView('clarifier')} className={tabClasses('clarifier')}>Clarifier</button>
                <button onClick={() => setCurrentView('history')} className={tabClasses('history')}>History</button>
                <button onClick={() => setCurrentView('documents')} className={tabClasses('documents')}>Documents</button>
                <button onClick={() => setCurrentView('glossary')} className={tabClasses('glossary')}>Glossary</button>
                <button onClick={() => setCurrentView('prompts')} className={tabClasses('prompts')}>Prompt Studio</button>
                <button onClick={() => setCurrentView('settings')} className={tabClasses('settings')}>Settings</button>
                <button onClick={() => setCurrentView('models')} className={tabClasses('models')}>AI Models</button>
                <button onClick={() => setCurrentView('subscription')} className={tabClasses('subscription')}>Subscription & Billing</button>
                <button onClick={() => setCurrentView('agent_tasks')} className={tabClasses('agent_tasks')}>Agent Tasks</button>
                <button onClick={() => setCurrentView('token_rails')} className={tabClasses('token_rails')}>Token Rails</button>
                <button onClick={() => setCurrentView('notifications')} className={tabClasses('notifications')}>
                    Notifications
                    {userProfile && useNotifications(userProfile.id).unreadCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-red-600 rounded-full">
                            {useNotifications(userProfile.id).unreadCount}
                        </span>
                    )}
                </button>
                <button onClick={() => setCurrentView('audit_log')} className={tabClasses('audit_log')}>Audit Log</button>
                <button onClick={() => setCurrentView('api_keys')} className={tabClasses('api_keys')}>API Keys</button>
            </nav>

            {userLoading && <LoadingSpinner />}
            {userError && <AlertMessage type="error" message={`Failed to load user data: ${userError}`} onClose={() => userError && updatePreferences({})} />}

            {!userLoading && userProfile && (
                <div className="mt-4">
                    {currentView === 'clarifier' && (
                        <>
                            <Card title="Input Content for Clarification">
                                <p className="text-gray-400 mb-2 text-sm">Paste complex content below for AI-powered simplification and analysis:</p>
                                <textarea value={clause} onChange={e => setClause(e.target.value)} rows={5} className="w-full bg-gray-700/50 p-2 rounded text-white font-mono text-sm" />
                                <div className="flex flex-wrap gap-3 mt-4">
                                    <Dropdown
                                        label="Explanation Style"
                                        options={[
                                            { value: 'plain_english', label: 'Plain English' },
                                            { value: 'formal', label: 'Formal' },
                                            { value: 'academic', label: 'Academic' },
                                            { value: 'technical', label: 'Technical' },
                                        ]}
                                        selectedValue={userProfile.preferences.defaultExplanationStyle}
                                        onValueChange={(val) => updatePreferences({ defaultExplanationStyle: val as UserPreferences['defaultExplanationStyle'] })}
                                        className="flex-1 min-w-[150px]"
                                    />
                                    <Dropdown
                                        label="Audience Level"
                                        options={[
                                            { value: 'high_school', label: 'High School Student' },
                                            { value: 'college', label:abel: 'College Student' },
                                            { value: 'expert', label: 'Expert' },
                                        ]}
                                        selectedValue={userProfile.preferences.targetAudienceLevel}
                                        onValueChange={(val) => updatePreferences({ targetAudienceLevel: val as UserPreferences['targetAudienceLevel'] })}
                                        className="flex-1 min-w-[150px]"
                                    />
                                </div>
                                <button
                                    onClick={() => handleExplain()}
                                    disabled={isLoading || !clause.trim()}
                                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded text-white font-semibold disabled:opacity-50"
                                >
                                    {isLoading ? 'Generating Explanation...' : 'Clarify with AI'}
                                </button>
                            </Card>

                            <AIExplanationOutput
                                explanation={explanation}
                                isLoading={isLoading}
                                linkedTerms={activeExplanationRecord?.linkedTerms}
                                onSave={handleSaveExplanationOutput}
                                onFeedback={handleFeedbackExplanation}
                                editable={true}
                                explanationRecordId={activeExplanationRecord?.id}
                                estimatedCost={activeExplanationRecord?.estimatedCost}
                                tokensUsed={activeExplanationRecord?.tokensUsed}
                                className="mt-6"
                            />
                            {aiExplanationError && <AlertMessage type="error" message={aiExplanationError} onClose={() => setAiExplanationError(null)} className="mt-4" />}
                        </>
                    )}

                    {currentView === 'history' && (
                        <ExplanationHistoryPanel
                            userId={userProfile.id}
                            onSelectExplanation={handleSelectHistoryExplanation}
                        />
                    )}

                    {currentView === 'documents' && (
                        <DocumentUploadSection
                            userId={userProfile.id}
                            onDocumentUpload={handleDocumentUploaded}
                            onAnalyzeDocument={handleDocumentAnalyze}
                        />
                    )}

                    {currentView === 'glossary' && (
                        <GlossaryManagerPanel
                            userId={userProfile.id}
                        />
                    )}

                    {currentView === 'prompts' && (
                        <PromptEngineeringStudio
                            userId={userProfile.id}
                            onApplyPrompt={handleApplyPromptFromStudio}
                            currentInput={clause}
                        />
                    )}

                    {currentView === 'settings' && (
                        <SettingsPanel
                            userProfile={userProfile}
                            onUpdatePreferences={updatePreferences}
                            isLoading={userLoading}
                            error={userError}
                        />
                    )}

                    {currentView === 'models' && (
                        <AIModelConfigurationPanel
                            userProfile={userProfile}
                        />
                    )}

                    {currentView === 'subscription' && (
                        <SubscriptionAndBillingPanel
                            userId={userProfile.id}
                            currentUserTier={userProfile.subscriptionTier}
                        />
                    )}

                    {currentView === 'agent_tasks' && (
                        <AutomatedAgentTasksPanel
                            userId={userProfile.id}
                        />
                    )}

                    {currentView === 'token_rails' && (
                        <TokenRailSimulatorPanel
                            userId={userProfile.id}
                            currentUserRoles={userProfile.roles}
                        />
                    )}

                    {currentView === 'notifications' && (
                        <NotificationCenterPanel
                            userId={userProfile.id}
                        />
                    )}

                    {currentView === 'audit_log' && (
                        <AuditLogViewerPanel
                            userId={userProfile.id}
                        />
                    )}

                    {currentView === 'api_keys' && (
                        <APIKeyManagementPanel
                            userId={userProfile.id}
                            hasAccess={userProfile.apiKeyAccess}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default LexiconClarifierView;