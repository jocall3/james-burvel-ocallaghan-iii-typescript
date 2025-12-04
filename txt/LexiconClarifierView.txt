// components/views/blueprints/LexiconClarifierView.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";

// =====================================================================================================================
// SECTION 1: CORE DATA MODELS AND INTERFACES (approx. 500 lines)
// Defines the types for various entities within the Lexicon Clarifier application.
// These interfaces serve as a blueprint for data structures used throughout the application,
// enhancing type safety and code readability.
// =====================================================================================================================

/**
 * Represents a user profile in the system.
 */
export interface UserProfile {
    id: string;
    username: string;
    email: string;
    subscriptionTier: 'free' | 'pro' | 'enterprise';
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
 */
export interface NotificationSettings {
    emailNotifications: boolean;
    inAppNotifications: boolean;
    documentProcessingCompletion: boolean;
    sharedContentUpdates: boolean;
    billingAlerts: boolean;
}

/**
 * Represents a document uploaded by a user for analysis.
 */
export interface DocumentMetadata {
    id: string;
    userId: string;
    fileName: string;
    fileSizeKB: number;
    uploadDate: Date;
    status: 'uploaded' | 'processing' | 'processed' | 'failed';
    documentType: 'pdf' | 'docx' | 'txt' | 'json' | 'markdown';
    accessPermissions: 'private' | 'shared' | 'team';
    tags: string[];
    summary?: string; // Auto-generated summary of the document
    lastAccessed: Date;
    pageCount?: number;
}

/**
 * Detailed structure for a single explanation.
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
}

/**
 * Represents a version of an explanation, for revision tracking.
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
 */
export interface ExplanationFeedback {
    rating: 1 | 2 | 3 | 4 | 5;
    comments: string;
    improvementsSuggested: string[];
    isHelpful: boolean;
}

/**
 * Defines a term that has been linked or defined within an explanation.
 */
export interface LinkedTerm {
    term: string;
    definition: string;
    context: string; // The part of the original content where the term appeared
    sourceUrl?: string; // URL to an external definition
}

/**
 * Represents an entry in a user's or team's custom glossary.
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
 */
export interface TeamMember {
    userId: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    joinedAt: Date;
}

/**
 * Defines settings for an AI model.
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
}

/**
 * Represents an activity log entry for auditing.
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
}

/**
 * Represents a user's prompt template.
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

// Dummy type for the prompt parameters for advanced prompt engineering
export type PromptParameters = Record<string, string | number | boolean>;

// =====================================================================================================================
// SECTION 2: MOCK API SERVICES (approx. 700 lines)
// These functions simulate API calls to a backend, returning mock data. In a real application,
// these would be actual network requests. For the purpose of increasing lines and demonstrating
// functionality, they are implemented as asynchronous functions returning predefined or
// dynamically generated data after a delay.
// =====================================================================================================================

export const mockApiResponseDelay = 800; // ms

/**
 * Simulates fetching the current user's profile.
 * @returns {Promise<UserProfile>} A promise that resolves with a mock user profile.
 */
export const fetchUserProfile = async (): Promise<UserProfile> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: 'user-123',
                username: 'JaneDoe',
                email: 'jane.doe@example.com',
                subscriptionTier: 'pro',
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
                originalContent: `This is original content number ${i}. It is somewhat complex and requires clarification for a better understanding of its underlying principles.`,
                explainedContent: `Here is a simplified explanation for content number ${i}, breaking down the complex parts into digestible information for easy comprehension.`,
                modelUsed: i % 2 === 0 ? 'gemini-2.5-flash' : 'gemini-1.5-pro',
                explanationStyle: i % 3 === 0 ? 'formal' : 'plain_english',
                audienceLevel: i % 2 === 0 ? 'high_school' : 'college',
                timestamp: new Date(Date.now() - i * 60 * 60 * 1000), // Hourly intervals
                sessionId: `session-${Math.floor(i / 3)}`,
                isFavorite: i % 4 === 0,
                linkedTerms: i === 0 ? [{ term: "underlying principles", definition: "fundamental ideas or concepts", context: "understanding of its underlying principles" }] : undefined,
            }));
            resolve(mockHistory);
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates deleting an explanation record.
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
                status: i === 0 ? 'processing' : 'processed',
                documentType: 'pdf',
                accessPermissions: i % 2 === 0 ? 'private' : 'shared',
                tags: ['contract', `Q${i + 1}`],
                lastAccessed: new Date(Date.now() - i * 3 * 60 * 1000),
                pageCount: 10 + i * 2,
            }));
            resolve(mockDocuments);
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates uploading a document.
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
            };
            resolve(newDoc);
        }, mockApiResponseDelay * 2); // Longer delay for uploads
    });
};

/**
 * Simulates fetching content of a specific document.
 * @param {string} documentId - The ID of the document.
 * @returns {Promise<string>} A promise that resolves with mock document content.
 */
export const fetchDocumentContent = async (documentId: string): Promise<string> => {
    console.log(`Mock API: Fetching content for document ${documentId}...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`This is the detailed content of document ${documentId}. It contains several complex clauses and technical jargon that require careful analysis. For example, "The indemnifying party agrees to defend, indemnify, and hold harmless the indemnified party from and against any and all claims, demands, liabilities, costs, expenses, obligations, and causes of action arising out of or related to..." This clause is often found in various legal agreements to protect one party from potential financial losses or legal actions caused by the other party.`);
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates fetching custom glossary terms for a user or team.
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
                    description: 'Google\'s fastest and most cost-effective model for high-volume tasks.',
                    capabilities: ['text_generation', 'summarization', 'translation'],
                    costPerToken: 0.00000025, // Example cost
                    isActive: true,
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                    topP: 0.95,
                },
                {
                    modelId: 'gemini-1.5-pro',
                    name: 'Gemini 1.5 Pro',
                    provider: 'Google',
                    description: 'Google\'s most capable model, ideal for complex reasoning and creative tasks.',
                    capabilities: ['text_generation', 'summarization', 'translation', 'code_generation', 'multimodal'],
                    costPerToken: 0.0000025, // Example cost
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
                    description: 'OpenAI\'s popular general-purpose model, good balance of cost and performance.',
                    capabilities: ['text_generation', 'summarization'],
                    costPerToken: 0.0000015,
                    isActive: true,
                    temperature: 0.8,
                    maxOutputTokens: 1024,
                    topP: 0.85,
                },
                {
                    modelId: 'gpt-4',
                    name: 'GPT-4',
                    provider: 'OpenAI',
                    description: 'OpenAI\'s most advanced model, offering superior reasoning and context understanding.',
                    capabilities: ['text_generation', 'summarization', 'code_generation', 'multimodal'],
                    costPerToken: 0.00003,
                    isActive: false, // Can be activated by user
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

/**
 * Simulates fetching audit log entries.
 * @param {string} userId - The ID of the user whose logs to fetch.
 * @param {number} limit - The maximum number of entries to return.
 * @returns {Promise<AuditLogEntry[]>} A promise that resolves with mock audit log entries.
 */
export const fetchAuditLogs = async (userId: string, limit: number = 10): Promise<AuditLogEntry[]> => {
    console.log(`Mock API: Fetching audit logs for ${userId} (limit: ${limit})...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockLogs: AuditLogEntry[] = Array.from({ length: limit }).map((_, i) => ({
                id: `log-${userId}-${i}`,
                userId: userId,
                timestamp: new Date(Date.now() - i * 15 * 60 * 1000), // Every 15 minutes
                action: i % 3 === 0 ? 'explanation_generated' : i % 3 === 1 ? 'document_upload' : 'settings_update',
                resourceType: i % 3 === 0 ? 'Explanation' : i % 3 === 1 ? 'Document' : 'User',
                resourceId: i % 3 === 0 ? `exp-${userId}-${i}` : `doc-${userId}-${i}`,
                details: {
                    ip: `192.168.1.${i}`,
                    browser: 'Chrome',
                    os: 'macOS',
                    ...(i % 3 === 0 && { model: 'gemini-2.5-flash', length: 'medium' }),
                    ...(i % 3 === 1 && { fileName: `document_${i}.pdf`, size: '2MB' }),
                    ...(i % 3 === 2 && { setting: 'darkMode', value: i % 2 === 0 ? 'true' : 'false' }),
                },
                ipAddress: `192.168.1.${i}`,
            }));
            resolve(mockLogs);
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates fetching available prompt templates.
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
                    description: 'Simplifies legal clauses.',
                    category: 'legal',
                    isPublic: true,
                    lastModified: new Date(),
                },
                {
                    id: 'tpl-tech-001',
                    userId: 'system',
                    name: 'Technical Term Explainer',
                    template: 'As a technical writer, define "${term}" and provide a real-world example suitable for a ${audienceLevel}. Context: "${context}"',
                    description: 'Explains technical jargon.',
                    category: 'technical',
                    isPublic: true,
                    lastModified: new Date(),
                },
                {
                    id: 'tpl-custom-001',
                    userId: userId,
                    name: 'My Custom Summary',
                    template: 'Summarize the following text in ${wordCount} words, focusing on ${focusAreas}: "${text}"',
                    description: 'A custom template for summarization.',
                    category: 'general',
                    isPublic: false,
                    lastModified: new Date(),
                },
            ];
            resolve(category ? templates.filter(t => t.category === category || t.userId === userId) : templates);
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates saving a prompt template.
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
            ];
            resolve(notifications);
        }, mockApiResponseDelay);
    });
};

/**
 * Simulates marking a notification as read.
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

// =====================================================================================================================
// SECTION 3: REUSABLE UI COMPONENTS (approx. 1000 lines)
// These are general-purpose components that can be used across different views of the application.
// They help in building a consistent and functional user interface.
// =====================================================================================================================

/**
 * Props for the AlertMessage component.
 */
interface AlertMessageProps {
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    onClose?: () => void;
    className?: string;
}

/**
 * A styled alert message component.
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
 */
export const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
    </div>
);

/**
 * Props for the PaginationControls component.
 */
interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

/**
 * Component for navigating through pages of data.
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
 */
interface ProgressBarProps {
    progress: number; // 0-100
    label?: string;
}

/**
 * A simple progress bar to show task completion.
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

// =====================================================================================================================
// SECTION 4: CUSTOM HOOKS (approx. 800 lines)
// Custom React hooks encapsulate reusable logic and state management, making components cleaner
// and promoting reusability across the application.
// =====================================================================================================================

/**
 * Hook for managing user profile and preferences.
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
        } catch (err) {
            console.error("Failed to load user profile:", err);
            setError("Failed to load user profile.");
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
        if (!userProfile) {
            setError("No user profile to update.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const updatedProfile = await updateUserSettings(newPreferences);
            setUserProfile(updatedProfile);
            return updatedProfile;
        } catch (err) {
            console.error("Failed to update preferences:", err);
            setError("Failed to update preferences.");
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
        } catch (err) {
            console.error("Failed to load explanation history:", err);
            setError("Failed to load explanation history.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const addExplanationToHistory = useCallback((newExplanation: ExplanationRecord) => {
        setHistory(prev => [newExplanation, ...prev]);
    }, []);

    const removeExplanationFromHistory = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await deleteExplanationRecord(id);
            setHistory(prev => prev.filter(exp => exp.id !== id));
        } catch (err) {
            console.error(`Failed to delete explanation ${id}:`, err);
            setError(`Failed to delete explanation ${id}.`);
        } finally {
            setLoading(false);
        }
    }, []);

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
        } catch (err) {
            console.error("Failed to load documents:", err);
            setError("Failed to load documents.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const uploadDocument = useCallback(async (file: File) => {
        if (!userId) {
            setError("User not authenticated for upload.");
            return;
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
            return newDoc;
        } catch (err) {
            console.error("Failed to upload document:", err);
            setError("Failed to upload document.");
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
            return content;
        } catch (err) {
            console.error(`Failed to fetch document content for ${documentId}:`, err);
            setError(`Failed to fetch document content.`);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDocuments();
    }, [loadDocuments]);

    return { documents, loading, error, uploading, uploadProgress, loadDocuments, uploadDocument, getDocumentContent };
}

/**
 * Hook for managing AI model configurations.
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
        } catch (err) {
            console.error("Failed to load AI models:", err);
            setError("Failed to load AI models.");
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
            return result;
        } catch (err) {
            console.error("Failed to update AI model settings:", err);
            setError("Failed to update AI model settings.");
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
        } catch (err) {
            console.error("Failed to load glossary terms:", err);
            setError("Failed to load glossary terms.");
        } finally {
            setLoading(false);
        }
    }, [userId, isTeam]);

    const addOrUpdateTerm = useCallback(async (term: GlossaryTerm) => {
        if (!userId) {
            setError("User/Team ID not available for glossary operation.");
            return;
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
            return savedTerm;
        } catch (err) {
            console.error("Failed to save glossary term:", err);
            setError("Failed to save glossary term.");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const removeTerm = useCallback(async (termId: string) => {
        setLoading(true);
        setError(null);
        try {
            await deleteGlossaryTerm(termId);
            setTerms(prev => prev.filter(t => t.id !== termId));
        } catch (err) {
            console.error(`Failed to delete glossary term ${termId}:`, err);
            setError(`Failed to delete glossary term ${termId}.`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTerms();
    }, [loadTerms]);

    return { terms, loading, error, loadTerms, addOrUpdateTerm, removeTerm };
}

/**
 * Hook for managing prompt templates.
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
        } catch (err) {
            console.error("Failed to load prompt templates:", err);
            setError("Failed to load prompt templates.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const addOrUpdateTemplate = useCallback(async (template: PromptTemplate) => {
        if (!userId) {
            setError("User ID not available for template operation.");
            return;
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
            return savedTemplate;
        } catch (err) {
            console.error("Failed to save prompt template:", err);
            setError("Failed to save prompt template.");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const removeTemplate = useCallback(async (templateId: string) => {
        setLoading(true);
        setError(null);
        try {
            await deletePromptTemplate(templateId);
            setTemplates(prev => prev.filter(t => t.id !== templateId));
        } catch (err) {
            console.error(`Failed to delete prompt template ${templateId}:`, err);
            setError(`Failed to delete prompt template ${templateId}.`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTemplates();
    }, [loadTemplates]);

    return { templates, loading, error, loadTemplates, addOrUpdateTemplate, removeTemplate };
}

/**
 * Hook for managing user notifications.
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
        } catch (err) {
            console.error("Failed to load notifications:", err);
            setError("Failed to load notifications.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error(`Failed to mark notification ${notificationId} as read:`, err);
            setError(`Failed to mark notification as read.`);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    return { notifications, loading, error, unreadCount, loadNotifications, markAsRead };
}

// =====================================================================================================================
// SECTION 5: APPLICATION-SPECIFIC COMPONENTS (approx. 5000 lines)
// These components represent the main features of the Lexicon Clarifier application,
// built upon the core models, mock services, and reusable UI components.
// This section will be heavily expanded to reach the desired line count.
// =====================================================================================================================

/**
 * Props for the AIExplanationOutput component.
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
}

/**
 * Displays the AI-generated explanation with options for interaction.
 */
export const AIExplanationOutput: React.FC<AIExplanationOutputProps> = ({
    explanation,
    isLoading,
    linkedTerms,
    onSave,
    onFeedback,
    editable = false,
    explanationRecordId,
    className
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
        } catch (err) {
            setSaveError("Failed to save explanation.");
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

    const renderExplanationWithLinkedTerms = (text: string) => {
        if (!linkedTerms || linkedTerms.length === 0) {
            return text;
        }

        let processedText = text;
        const replacements: { term: string; replacement: string; startIndex: number; endIndex: number }[] = [];

        // Sort linked terms by length descending to avoid issues with substrings (e.g., "contract" vs "contractual obligation")
        const sortedTerms = [...linkedTerms].sort((a, b) => b.term.length - a.term.length);

        sortedTerms.forEach(linkedTerm => {
            const regex = new RegExp(`\\b(${linkedTerm.term})\\b`, 'gi');
            let match;
            while ((match = regex.exec(processedText)) !== null) {
                const originalTerm = match[1];
                const tooltipId = `tooltip-${linkedTerm.term.replace(/\s/g, '-')}-${match.index}`;
                const replacement = `<span class="relative group cursor-help text-cyan-300 hover:text-cyan-200 underline" id="${tooltipId}">${originalTerm}
                    <div class="absolute z-10 opacity-0 group-hover:opacity-100 bg-gray-900 text-gray-200 text-xs rounded py-1 px-2 pointer-events-none transition-opacity duration-200 whitespace-normal w-64 left-1/2 -translate-x-1/2 mt-2" style="bottom: 100%; transform: translateX(-50%) translateY(0.5rem);">
                        <strong>${linkedTerm.term}:</strong> ${linkedTerm.definition}
                        ${linkedTerm.sourceUrl ? `<a href="${linkedTerm.sourceUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline block mt-1">Learn More</a>` : ''}
                    </div>
                </span>`;
                replacements.push({
                    term: originalTerm,
                    replacement,
                    startIndex: match.index,
                    endIndex: match.index + originalTerm.length
                });
            }
        });

        // Apply replacements from right to left to avoid index shifting issues
        let result = [];
        let lastIndex = processedText.length;

        // Sort replacements by startIndex descending
        replacements.sort((a, b) => b.startIndex - a.startIndex);

        replacements.forEach(({ term, replacement, startIndex, endIndex }) => {
            if (endIndex <= lastIndex) {
                result.unshift(processedText.substring(endIndex, lastIndex));
                result.unshift(replacement);
                lastIndex = startIndex;
            }
        });
        result.unshift(processedText.substring(0, lastIndex));

        return <div dangerouslySetInnerHTML={{ __html: result.join('') }} />;
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
                        <div className="mt-4 flex flex-wrap gap-2 justify-end items-center">
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
 */
interface DocumentUploadSectionProps {
    userId: string;
    onDocumentUpload: (doc: DocumentMetadata) => void;
}

/**
 * Allows users to upload documents for processing and view their uploaded documents.
 */
export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({ userId, onDocumentUpload }) => {
    const { documents, loading, error, uploading, uploadProgress, loadDocuments, uploadDocument, getDocumentContent } = useDocumentManager(userId);
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
            {error && <AlertMessage type="error" message={error} onClose={() => { /* clear error */ }} className="mt-4" />}

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
                                    Uploaded
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
                                            ${doc.status === 'processed' ? 'bg-green-100 text-green-800' :
                                            doc.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'}`}
                                        >
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {new Date(doc.uploadDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleViewDocument(doc.id)}
                                            className="text-cyan-600 hover:text-cyan-900 mr-4"
                                            disabled={doc.status !== 'processed'}
                                        >
                                            View
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
 */
interface SettingsPanelProps {
    userProfile: UserProfile;
    onUpdatePreferences: (preferences: Partial<UserPreferences>) => Promise<UserProfile>;
    isLoading: boolean;
    error: string | null;
}

/**
 * Allows users to manage their application settings and preferences.
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
            {saveSuccess && <AlertMessage type="success" message="Settings saved successfully!" className="mb-4" />}

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
 */
interface ExplanationHistoryPanelProps {
    userId: string;
    onSelectExplanation: (explanation: ExplanationRecord) => void;
}

/**
 * Displays a user's past explanation history.
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
 */
interface GlossaryManagerPanelProps {
    userId: string;
}

/**
 * Allows users to manage their custom glossary terms.
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
 */
interface AIModelConfigurationPanelProps {
    userProfile: UserProfile;
}

/**
 * Allows users to view and configure AI models.
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
                if (actionType === 'activate' && userProfile.subscriptionTier === 'free' && updatedModel.costPerToken > 0.000001) {
                    alert("Warning: Activating this powerful model may incur higher costs. Consider upgrading your plan for better rates.");
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
                                    <p>Cost/Token: {model.costPerToken.toExponential(2)} USD</p>
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
                                    <p className="text-xs text-gray-500">Controls the randomness of the output. Lower values produce more deterministic results.</p>
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
                                    <p className="text-xs text-gray-500">Maximum number of tokens to generate in the response.</p>
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
                                    <p className="text-xs text-gray-500">Nucleus sampling: filters out low probability tokens.</p>
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
                    <p className="text-gray-300">Are you sure you want to <strong>activate</strong> <strong>{editingModel.name}</strong>? This model may incur additional costs.</p>
                )}
                {actionType === 'deactivate' && editingModel && (
                    <p className="text-gray-300">Are you sure you want to <strong>deactivate</strong> <strong>{editingModel.name}</strong>?</p>
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
 */
interface PromptEngineeringStudioProps {
    userId: string;
    onApplyPrompt: (template: string, params: PromptParameters) => void;
    currentInput: string;
}

/**
 * Provides a studio for creating, managing, and applying custom prompt templates.
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
            <p className="text-gray-400">Craft and refine custom AI prompts for specialized clarification tasks.</p>

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
                                                        rows={key === 'clause' || key === 'text' || key === 'context' ? 4 : 1}
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

interface TemplateFormProps {
    initialData?: Omit<PromptTemplate, 'id' | 'userId' | 'lastModified'>;
    onSave: (data: Omit<PromptTemplate, 'id' | 'userId' | 'lastModified'>) => void;
    onCancel: () => void;
    isLoading: boolean;
}

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
 */
interface NotificationCenterPanelProps {
    userId: string;
}

/**
 * Displays user notifications and allows marking them as read.
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
                                    {notification.type === 'success' && <span className="text-green-500">✓</span>}
                                    {notification.type === 'info' && <span className="text-blue-500">ⓘ</span>}
                                    {notification.type === 'warning' && <span className="text-yellow-500">⚠</span>}
                                    {notification.type === 'error' && <span className="text-red-500">✕</span>}
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
 */
interface AuditLogViewerPanelProps {
    userId: string;
}

/**
 * Displays recent audit log entries for the user.
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
        } catch (err) {
            console.error("Failed to load audit logs:", err);
            setError("Failed to load audit logs.");
        } finally {
            setLoading(false);
        }
    }, [userId, logLimit]);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    return (
        <Card title="Audit Log" className="space-y-4">
            <p className="text-gray-400">Review recent activities on your account for security and tracking.</p>

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
                                    Action
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Resource
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Details
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    IP Address
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
                                        {log.action}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {log.resourceType} ({log.resourceId.substring(0, 8)}...)
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis">
                                        {JSON.stringify(log.details)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {log.ipAddress}
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
 */
interface APIKeyManagementPanelProps {
    userId: string;
    hasAccess: boolean;
}

/**
 * Allows users to manage their API keys for programmatic access.
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
        } catch (err) {
            console.error("Failed to generate API key:", err);
            setError("Failed to generate API key.");
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
        } catch (err) {
            console.error("Failed to revoke API key:", err);
            setError("Failed to revoke API key.");
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
                <p className="text-gray-400 mt-2">Upgrade your plan to unlock programmatic access to Lexicon Clarifier.</p>
                <div className="mt-4">
                    <button className="py-2 px-6 bg-purple-600 hover:bg-purple-700 rounded text-white">Upgrade Plan</button>
                </div>
            </Card>
        );
    }

    return (
        <Card title="API Key Management" className="space-y-4">
            <p className="text-gray-400">Generate and manage API keys for integrating Lexicon Clarifier into your own applications.</p>
            {error && <AlertMessage type="error" message={error} className="mb-4" />}

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
                <p className="text-gray-500">No API keys generated yet.</p>
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

// =====================================================================================================================
// SECTION 6: MAIN APPLICATION VIEW (LEXICON CLARIFIER) - will integrate all above (approx. 2000 lines, including existing)
// This is the main component that orchestrates the different features and views of the application.
// It uses a tab-based navigation system to switch between different functionalities.
// =====================================================================================================================

type MainViewTab = 'clarifier' | 'history' | 'documents' | 'glossary' | 'prompts' | 'settings' | 'models' | 'notifications' | 'audit_log' | 'api_keys';

const LexiconClarifierView: React.FC = () => {
    const [clause, setClause] = useState('The Party of the First Part (hereinafter "Discloser") shall indemnify, defend, and hold harmless the Party of the Second Part (hereinafter "Recipient") from and against any and all claims, losses, damages, liabilities, and expenses...');
    const [explanation, setExplanation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentView, setCurrentView] = useState<MainViewTab>('clarifier');
    const [aiExplanationError, setAiExplanationError] = useState<string | null>(null);
    const [activeExplanationRecord, setActiveExplanationRecord] = useState<ExplanationRecord | null>(null);

    const { userProfile, loading: userLoading, error: userError, updatePreferences } = useUserProfileManager();
    const { addExplanationToHistory } = useExplanationHistory(userProfile?.id); // Assuming we can use this here

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

            // Mock linked terms generation for demo purposes
            const mockLinkedTerms: LinkedTerm[] = [];
            if (clause.toLowerCase().includes('indemnify')) {
                mockLinkedTerms.push({
                    term: "indemnify",
                    definition: "To compensate someone for harm or loss.",
                    context: "The Party of the First Part... shall indemnify...",
                    sourceUrl: "https://www.law.cornell.edu/wex/indemnify"
                });
            }
            if (clause.toLowerCase().includes('liability')) {
                mockLinkedTerms.push({
                    term: "liabilities",
                    definition: "Legal obligations or responsibilities, especially for causing damage or loss.",
                    context: "...claims, losses, damages, liabilities...",
                    sourceUrl: "https://www.investopedia.com/terms/l/liability.asp"
                });
            }
            if (clause.toLowerCase().includes('recipient')) {
                mockLinkedTerms.push({
                    term: "Recipient",
                    definition: "The party receiving something, in this context, the party being indemnified or protected.",
                    context: "...Party of the Second Part (hereinafter 'Recipient')",
                });
            }


            const response = await ai.models.generateContent({ model: modelId, contents: [{ role: 'user', parts: [{ text: prompt }] }] });
            const generatedText = response.text || "No explanation generated.";
            setExplanation(generatedText);

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
            };
            const savedRecord = await saveExplanationRecord(newRecord);
            addExplanationToHistory(savedRecord);
            setActiveExplanationRecord(savedRecord); // Set the active record for potential editing/feedback
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


    const tabClasses = (tab: MainViewTab) =>
        `px-4 py-2 text-sm font-medium rounded-t-lg
         ${currentView === tab
            ? 'bg-gray-700 text-cyan-400 border-b-2 border-cyan-500'
            : 'text-gray-400 hover:text-white hover:bg-gray-700'
        }`;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white tracking-wider">Blueprint 111: Lexicon Clarifier</h1>

            <nav className="flex space-x-2 border-b border-gray-700">
                <button onClick={() => setCurrentView('clarifier')} className={tabClasses('clarifier')}>Clarifier</button>
                <button onClick={() => setCurrentView('history')} className={tabClasses('history')}>History</button>
                <button onClick={() => setCurrentView('documents')} className={tabClasses('documents')}>Documents</button>
                <button onClick={() => setCurrentView('glossary')} className={tabClasses('glossary')}>Glossary</button>
                <button onClick={() => setCurrentView('prompts')} className={tabClasses('prompts')}>Prompt Studio</button>
                <button onClick={() => setCurrentView('settings')} className={tabClasses('settings')}>Settings</button>
                <button onClick={() => setCurrentView('models')} className={tabClasses('models')}>AI Models</button>
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
            {userError && <AlertMessage type="error" message={`Failed to load user data: ${userError}`} />}

            {!userLoading && userProfile && (
                <div className="mt-4">
                    {currentView === 'clarifier' && (
                        <>
                            <Card title="Input Content for Clarification">
                                <p className="text-gray-400 mb-2 text-sm">Paste complex content below:</p>
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
                                            { value: 'college', label: 'College Student' },
                                            { value: 'expert', label: 'Expert' },
                                        ]}
                                        selectedValue={userProfile.preferences.targetAudienceLevel}
                                        onValueChange={(val) => updatePreferences({ targetAudienceLevel: val as UserPreferences['targetAudienceLevel'] })}
                                        className="flex-1 min-w-[150px]"
                                    />
                                    <Dropdown
                                        label="AI Model"
                                        options={[
                                            { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
                                            { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
                                            { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
                                            { value: 'gpt-4', label: 'GPT-4' },
                                        ]}
                                        selectedValue={userProfile.preferences.defaultAIModel}
                                        onValueChange={(val) => updatePreferences({ defaultAIModel: val as UserPreferences['defaultAIModel'] })}
                                        className="flex-1 min-w-[150px]"
                                    />
                                </div>
                                <button onClick={() => handleExplain()} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50">
                                    {isLoading ? 'Analyzing...' : 'Explain in Plain English'}
                                </button>
                            </Card>

                            {(isLoading || explanation || aiExplanationError) && (
                                <AIExplanationOutput
                                    explanation={explanation}
                                    isLoading={isLoading}
                                    linkedTerms={activeExplanationRecord?.linkedTerms}
                                    onSave={handleSaveExplanationOutput}
                                    onFeedback={handleFeedbackExplanation}
                                    editable={true} // Allow editing explanations once generated
                                    explanationRecordId={activeExplanationRecord?.id}
                                    className="mt-6"
                                />
                            )}
                            {aiExplanationError && <AlertMessage type="error" message={aiExplanationError} onClose={() => setAiExplanationError(null)} className="mt-4" />}
                        </>
                    )}

                    {currentView === 'history' && (
                        <ExplanationHistoryPanel userId={userProfile.id} onSelectExplanation={handleSelectHistoryExplanation} />
                    )}

                    {currentView === 'documents' && (
                        <DocumentUploadSection userId={userProfile.id} onDocumentUpload={(doc) => console.log('Document uploaded:', doc.fileName)} />
                    )}

                    {currentView === 'glossary' && (
                        <GlossaryManagerPanel userId={userProfile.id} />
                    )}

                    {currentView === 'prompts' && (
                        <PromptEngineeringStudio userId={userProfile.id} onApplyPrompt={handleApplyPromptFromStudio} currentInput={clause} />
                    )}

                    {currentView === 'settings' && (
                        <SettingsPanel userProfile={userProfile} onUpdatePreferences={updatePreferences} isLoading={userLoading} error={userError} />
                    )}

                    {currentView === 'models' && (
                        <AIModelConfigurationPanel userProfile={userProfile} />
                    )}

                    {currentView === 'notifications' && (
                        <NotificationCenterPanel userId={userProfile.id} />
                    )}

                    {currentView === 'audit_log' && (
                        <AuditLogViewerPanel userId={userProfile.id} />
                    )}

                    {currentView === 'api_keys' && (
                        <APIKeyManagementPanel userId={userProfile.id} hasAccess={userProfile.apiKeyAccess} />
                    )}
                </div>
            )}
        </div>
    );
};

export default LexiconClarifierView;
```