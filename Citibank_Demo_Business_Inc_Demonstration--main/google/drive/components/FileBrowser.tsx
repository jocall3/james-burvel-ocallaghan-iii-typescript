```typescript
// google/drive/components/FileBrowser.tsx
// The Great Library. An interface to the sovereign's digital memory, organized and instantly accessible.

import React, { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext, useReducer } from 'react';
import { DriveAPI } from '../services/DriveAPI';
import FileItem from './FileItem';

// --- Type Definitions for the "Universe" ---
// These types would typically reside in a shared types file (e.g., ../types.ts).
// For this exercise, they are defined here to make the file self-contained and illustrate the expanded scope.

export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
}

export interface Permission {
    userId: string;
    role: 'owner' | 'editor' | 'viewer' | 'commenter';
    grantedBy: string; // userId
    grantedAt: number; // timestamp
}

export interface DriveFile {
    id: string;
    name: string;
    type: string; // e.g., 'pdf', 'docx', 'folder', 'gdoc'
    size: string; // e.g., '2.5 MB'
    lastModified: number; // timestamp
    owner: string; // User ID or Name
    sharedWith?: User[];
    permissions: Permission[];
    tags?: string[];
    isSensitive?: boolean; // For DLP flagging
    isDeleted?: boolean; // For trash
    parentFolderId?: string; // For hierarchical navigation
}

export interface ShareLink {
    id: string;
    url: string;
    accessType: 'viewer' | 'commenter';
    expiresAt?: number;
}

export interface ActivityEvent {
    id: string;
    type: string; // e.g., 'file_opened', 'file_modified', 'shared', 'comment_added', 'workflow_initiated'
    timestamp: number;
    userId: string;
    fileId?: string;
    details: string;
}

export interface AIInsight {
    id: string;
    type: 'summary' | 'tags' | 'sentiment' | 'security_scan' | 'data_lineage_suggestion' | 'content_warning';
    content: string | string[];
    timestamp: number;
}

export interface WorkflowStep {
    name: string;
    status: 'pending' | 'completed' | 'skipped' | 'failed';
    assigneeId?: string;
    completedBy?: string;
    completedAt?: number;
    comments?: string;
}

export interface Workflow {
    id: string;
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
    steps: WorkflowStep[];
    fileId: string;
    initiatorId: string;
    createdAt: number;
    updatedAt: number;
    dueDate?: number;
}

export interface Workspace {
    id: string;
    name: string;
    description: string;
    files: string[]; // array of file IDs
    members?: User[];
    sharedWithGroups?: string[];
}

export interface Collection {
    id: string;
    name: string;
    description: string;
    files: string[]; // array of file IDs
    ownerId?: string;
    createdAt?: number;
}

export interface Tag {
    id: string;
    name: string;
    color?: string;
}

export interface Comment {
    id: string;
    fileId: string;
    userId: string;
    content: string;
    timestamp: number;
    replies: Comment[];
    isResolved: boolean;
    replyToId?: string;
}

export interface Version {
    id: string;
    name: string; // e.g., "v1.0", "Final Draft"
    timestamp: number;
    modifier: string; // user ID or name
    size: string;
    // contentHash: string; // for integrity check
}

export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: number;
    sticky?: boolean; // if true, won't auto-dismiss
    duration?: number; // milliseconds for auto-dismiss
    action?: { label: string; handler: () => void };
}

export interface DataVisualizationConfig {
    id: string;
    name: string;
    type: 'chart' | 'graph' | 'map';
    dataSourceId: string;
    query: string;
    settings: Record<string, any>;
}

export interface SpatialContext {
    id: string;
    name: string;
    description: string;
    coordinates?: { x: number; y: number; z: number }; // 3D coordinates if applicable
    environmentSettings?: Record<string, any>; // e.g., 'lighting', 'gravity', 'background'
}

export interface AuditLogEntry {
    id: string;
    timestamp: number;
    userId: string;
    eventType: string; // e.g., 'file_opened', 'file_modified', 'permission_changed'
    fileId?: string;
    details: string;
    ipAddress?: string;
    userAgent?: string;
}

export interface RetentionPolicy {
    id: string;
    name: string;
    description: string;
    criteria: Record<string, any>; // e.g., { tags: ['finance'], parentFolder: 'archive' }
    durationDays: number; // e.g., 2555 for 7 years
    action: 'archive' | 'delete'; // What happens after duration
    isLegalHold?: boolean;
}

export interface DLPPolicy {
    id: string;
    name: string;
    description: string;
    patterns: string[]; // Regex patterns for sensitive data
    severity: 'low' | 'medium' | 'high';
    action: 'warn' | 'block' | 'encrypt';
    appliesTo: 'all' | 'shared_external' | 'internal';
}

export interface DataSource {
    id: string;
    name: string;
    type: string; // e.g., 'CRM', 'Database', 'ProjectManagement'
    status: 'connected' | 'disconnected' | 'error';
    connectionDetails?: Record<string, any>; // Opaque connection info
}

export interface APIKey {
    id: string;
    name: string;
    key: string; // Masked
    createdAt: number;
    expiresAt?: number;
    permissions: string[]; // 'read_files', 'write_files', 'manage_webhooks'
}

export interface WebhookSubscription {
    id: string;
    eventType: string; // e.g., 'file.created', 'file.modified', 'comment.added'
    callbackUrl: string;
    fileId?: string; // Optional: specific file or all files
    isActive: boolean;
    createdAt: number;
    lastTriggeredAt?: number;
}

export interface IntegrationManifest {
    id: string;
    name: string;
    description: string;
    provider: string;
    version: string;
    capabilities: string[]; // 'file_sync', 'external_editing', 'data_import'
    status?: 'connected' | 'not_connected' | 'pending_auth';
}

// --- Global Contexts & Reducers (to manage the universe-like scope) ---
export type DriveAppState = {
    currentUser: User | null;
    currentPath: string;
    selectedFiles: DriveFile[];
    viewMode: 'list' | 'grid' | 'kanban' | 'spatial';
    filters: Record<string, any>;
    sortOrder: { field: string; direction: 'asc' | 'desc' };
    searchQuery: string;
    searchResults: DriveFile[];
    isLoading: boolean;
    notifications: Notification[];
    aiInsights: AIInsight[];
    activityLog: ActivityEvent[];
    workspaces: Workspace[];
    collections: Collection[];
    recentFiles: DriveFile[];
    starredFiles: DriveFile[];
    trashFiles: DriveFile[];
    userPreferences: Record<string, any>;
    modal: { type: string; props: any } | null;
    detailPanelFile: DriveFile | null;
    activeWorkflows: Workflow[];
    pendingApprovals: { id: string; file: DriveFile; assignee: User }[];
    realtimeUsers: { fileId: string; users: User[] }[]; // Users actively viewing/editing a file
    systemHealth: { status: 'ok' | 'degraded' | 'critical'; message: string };
    dataSources: DataSource[];
    apiKeys: APIKey[];
    webhookSubscriptions: WebhookSubscription[];
    integrationManifests: IntegrationManifest[];
    knowledgeGraphNodes: any[]; // Nodes for semantic search/relations
};

export type DriveAction =
    | { type: 'SET_CURRENT_USER'; payload: User }
    | { type: 'SET_PATH'; payload: string }
    | { type: 'TOGGLE_FILE_SELECTION'; payload: DriveFile }
    | { type: 'SET_SELECTED_FILES'; payload: DriveFile[] }
    | { type: 'SET_VIEW_MODE'; payload: 'list' | 'grid' | 'kanban' | 'spatial' }
    | { type: 'SET_FILTERS'; payload: Record<string, any> }
    | { type: 'SET_SORT_ORDER'; payload: { field: string; direction: 'asc' | 'desc' } }
    | { type: 'SET_SEARCH_QUERY'; payload: string }
    | { type: 'SET_SEARCH_RESULTS'; payload: DriveFile[] }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'ADD_NOTIFICATION'; payload: Notification }
    | { type: 'REMOVE_NOTIFICATION'; payload: string }
    | { type: 'UPDATE_AI_INSIGHTS'; payload: AIInsight[] }
    | { type: 'ADD_ACTIVITY_EVENT'; payload: ActivityEvent }
    | { type: 'SET_WORKSPACES'; payload: Workspace[] }
    | { type: 'SET_COLLECTIONS'; payload: Collection[] }
    | { type: 'SET_RECENT_FILES'; payload: DriveFile[] }
    | { type: 'SET_STARRED_FILES'; payload: DriveFile[] }
    | { type: 'SET_TRASH_FILES'; payload: DriveFile[] }
    | { type: 'UPDATE_USER_PREFERENCE'; payload: { key: string; value: any } }
    | { type: 'OPEN_MODAL'; payload: { type: string; props: any } }
    | { type: 'CLOSE_MODAL' }
    | { type: 'SET_DETAIL_PANEL_FILE'; payload: DriveFile | null }
    | { type: 'UPDATE_ACTIVE_WORKFLOWS'; payload: Workflow[] }
    | { type: 'UPDATE_PENDING_APPROVALS'; payload: { id: string; file: DriveFile; assignee: User }[] }
    | { type: 'UPDATE_REALTIME_USERS'; payload: { fileId: string; users: User[] }[] }
    | { type: 'SET_SYSTEM_HEALTH'; payload: { status: 'ok' | 'degraded' | 'critical'; message: string } }
    | { type: 'SET_DATA_SOURCES'; payload: DataSource[] }
    | { type: 'SET_API_KEYS'; payload: APIKey[] }
    | { type: 'SET_WEBHOOK_SUBSCRIPTIONS'; payload: WebhookSubscription[] }
    | { type: 'SET_INTEGRATION_MANIFESTS'; payload: IntegrationManifest[] }
    | { type: 'SET_KNOWLEDGE_GRAPH_NODES'; payload: any[] }
    | { type: 'REFRESH_FILES'; payload: DriveFile[] }; // To refresh the main file list

const initialState: DriveAppState = {
    currentUser: null,
    currentPath: 'root',
    selectedFiles: [],
    viewMode: 'list',
    filters: {},
    sortOrder: { field: 'name', direction: 'asc' },
    searchQuery: '',
    searchResults: [],
    isLoading: true,
    notifications: [],
    aiInsights: [],
    activityLog: [],
    workspaces: [],
    collections: [],
    recentFiles: [],
    starredFiles: [],
    trashFiles: [],
    userPreferences: {
        theme: 'dark',
        language: 'en',
        smartSuggestions: true,
        offlineMode: false,
        spatialEnabled: false,
    },
    modal: null,
    detailPanelFile: null,
    activeWorkflows: [],
    pendingApprovals: [],
    realtimeUsers: [],
    systemHealth: { status: 'ok', message: 'All systems operational.' },
    dataSources: [],
    apiKeys: [],
    webhookSubscriptions: [],
    integrationManifests: [],
    knowledgeGraphNodes: [],
};

function driveReducer(state: DriveAppState, action: DriveAction): DriveAppState {
    switch (action.type) {
        case 'SET_CURRENT_USER': return { ...state, currentUser: action.payload };
        case 'SET_PATH': return { ...state, currentPath: action.payload, selectedFiles: [], detailPanelFile: null };
        case 'TOGGLE_FILE_SELECTION':
            const isSelected = state.selectedFiles.some(f => f.id === action.payload.id);
            return {
                ...state,
                selectedFiles: isSelected
                    ? state.selectedFiles.filter(f => f.id !== action.payload.id)
                    : [...state.selectedFiles, action.payload],
                detailPanelFile: isSelected && state.selectedFiles.length === 1 ? null : (state.detailPanelFile?.id === action.payload.id ? null : action.payload), // Auto-open/close detail panel
            };
        case 'SET_SELECTED_FILES': return { ...state, selectedFiles: action.payload, detailPanelFile: action.payload.length === 1 ? action.payload[0] : null };
        case 'SET_VIEW_MODE': return { ...state, viewMode: action.payload };
        case 'SET_FILTERS': return { ...state, filters: { ...state.filters, ...action.payload } };
        case 'SET_SORT_ORDER': return { ...state, sortOrder: action.payload };
        case 'SET_SEARCH_QUERY': return { ...state, searchQuery: action.payload };
        case 'SET_SEARCH_RESULTS': return { ...state, searchResults: action.payload };
        case 'SET_LOADING': return { ...state, isLoading: action.payload };
        case 'ADD_NOTIFICATION': return { ...state, notifications: [...state.notifications, action.payload] };
        case 'REMOVE_NOTIFICATION': return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
        case 'UPDATE_AI_INSIGHTS': return { ...state, aiInsights: action.payload };
        case 'ADD_ACTIVITY_EVENT': return { ...state, activityLog: [action.payload, ...state.activityLog].slice(0, 100) }; // Keep log to 100 entries
        case 'SET_WORKSPACES': return { ...state, workspaces: action.payload };
        case 'SET_COLLECTIONS': return { ...state, collections: action.payload };
        case 'SET_RECENT_FILES': return { ...state, recentFiles: action.payload };
        case 'SET_STARRED_FILES': return { ...state, starredFiles: action.payload };
        case 'SET_TRASH_FILES': return { ...state, trashFiles: action.payload };
        case 'UPDATE_USER_PREFERENCE': return { ...state, userPreferences: { ...state.userPreferences, [action.payload.key]: action.payload.value } };
        case 'OPEN_MODAL': return { ...state, modal: action.payload };
        case 'CLOSE_MODAL': return { ...state, modal: null };
        case 'SET_DETAIL_PANEL_FILE': return { ...state, detailPanelFile: action.payload };
        case 'UPDATE_ACTIVE_WORKFLOWS': return { ...state, activeWorkflows: action.payload };
        case 'UPDATE_PENDING_APPROVALS': return { ...state, pendingApprovals: action.payload };
        case 'UPDATE_REALTIME_USERS': return { ...state, realtimeUsers: action.payload };
        case 'SET_SYSTEM_HEALTH': return { ...state, systemHealth: action.payload };
        case 'SET_DATA_SOURCES': return { ...state, dataSources: action.payload };
        case 'SET_API_KEYS': return { ...state, apiKeys: action.payload };
        case 'SET_WEBHOOK_SUBSCRIPTIONS': return { ...state, webhookSubscriptions: action.payload };
        case 'SET_INTEGRATION_MANIFESTS': return { ...state, integrationManifests: action.payload };
        case 'SET_KNOWLEDGE_GRAPH_NODES': return { ...state, knowledgeGraphNodes: action.payload };
        case 'REFRESH_FILES': return { ...state, searchResults: action.payload }; // Assuming searchResults is the main display list
        default: return state;
    }
}

export const DriveContext = createContext<{ state: DriveAppState; dispatch: React.Dispatch<DriveAction> } | undefined>(undefined);

export const useDrive = () => {
    const context = useContext(DriveContext);
    if (context === undefined) {
        throw new Error('useDrive must be used within a DriveProvider');
    }
    return context;
};

// --- Service Integrations (mocked) ---
// These services would typically be separate files, but for the "universe in one file" directive, they are here.
class AIService {
    static async analyzeContent(file: DriveFile): Promise<AIInsight[]> {
        console.log(`AI analyzing content for ${file.name}`);
        // Simulate advanced AI processing
        return new Promise(resolve =>
            setTimeout(() => {
                const insights: AIInsight[] = [
                    { id: `ai-${file.id}-1`, type: 'summary', content: `AI-generated summary of ${file.name}: This document focuses on ${file.name.split('.')[0].toLowerCase()} and its implications for the global digital economy.`, timestamp: Date.now() },
                    { id: `ai-${file.id}-2`, type: 'tags', content: ['finance', 'technology', 'report', file.name.split('.')[0].toLowerCase()].join(','), timestamp: Date.now() },
                    { id: `ai-${file.id}-3`, type: 'sentiment', content: 'Overall positive sentiment, with a focus on growth and innovation.', timestamp: Date.now() },
                    { id: `ai-${file.id}-4`, type: 'security_scan', content: 'No critical vulnerabilities or sensitive data exposure detected.', timestamp: Date.now() },
                    { id: `ai-${file.id}-5`, type: 'data_lineage_suggestion', content: `Potential upstream sources: 'Project Alpha Data', 'Q4 Market Research'. Downstream consumers: 'Executive Dashboard'.`, timestamp: Date.now() },
                ];
                resolve(insights);
            }, 1500)
        );
    }

    static async generateDraft(context: string): Promise<string> {
        console.log(`AI generating draft based on context: ${context}`);
        return new Promise(resolve => setTimeout(() => resolve(`AI-generated draft: ${context} - This is a highly advanced, context-aware draft generated by the sovereign AI. It incorporates data from myriad sources and predicts optimal phrasing and structure.`), 2000));
    }

    static async smartOrganize(files: DriveFile[]): Promise<{ files: DriveFile[]; suggestedCollections: Collection[] }> {
        console.log(`AI intelligently organizing ${files.length} files.`);
        // In a real scenario, this would apply complex clustering, semantic analysis, and user behavior prediction.
        return new Promise(resolve =>
            setTimeout(() => {
                const updatedFiles = files.map(f => ({ ...f, tags: [...(f.tags || []), 'AI-SmartOrganized'] }));
                const suggested: Collection[] = [{ id: 'ai-suggested-1', name: 'AI-Generated Project Q', description: 'Collection created by AI based on file content and usage patterns.', files: files.map(f => f.id) }];
                resolve({ files: updatedFiles, suggestedCollections: suggested });
            }, 3000)
        );
    }

    static async identifyDLPViolations(file: DriveFile): Promise<string[]> {
        console.log(`AI performing DLP scan for ${file.name}`);
        // Mock identifying sensitive data patterns
        const violations: string[] = [];
        if (file.name.includes('social_security') || file.name.includes('credit_card') || file.isSensitive) {
            violations.push('Potential PII/Sensitive data detected.');
        }
        if (file.name.includes('confidential') && !file.permissions.some(p => p.role === 'owner')) {
            violations.push('Confidential document shared inappropriately or lacking proper access controls.');
        }
        return new Promise(resolve => setTimeout(() => resolve(violations), 800));
    }

    static async getKnowledgeGraphNodes(query: string): Promise<any[]> {
        console.log(`AI querying knowledge graph for: ${query}`);
        // Simulate fetching nodes from a vast knowledge graph
        return new Promise(resolve => setTimeout(() => {
            resolve([
                { id: 'kg-node-1', name: 'Project Andromeda', type: 'Project', description: 'A highly classified strategic initiative.' },
                { id: 'kg-node-2', name: 'Quantum Computing', type: 'Technology', description: 'The next frontier of computational power.' },
            ]);
        }, 1000));
    }
}

class WorkflowService {
    static async initiateApproval(fileId: string, approverId: string, description: string): Promise<Workflow> {
        console.log(`Initiating approval for ${fileId} by ${approverId}`);
        const workflow: Workflow = {
            id: `wf-${Date.now()}`,
            name: `Approval for file ${fileId}`,
            status: 'pending',
            steps: [{ name: 'Request Approval', status: 'completed' }, { name: 'Approve by X', status: 'pending', assigneeId: approverId }],
            fileId,
            initiatorId: 'current_user',
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        return new Promise(resolve => setTimeout(() => resolve(workflow), 1000));
    }

    static async getWorkflowsForFile(fileId: string): Promise<Workflow[]> {
        console.log(`Fetching workflows for ${fileId}`);
        return new Promise(resolve => setTimeout(() => resolve([]), 500)); // Mock empty
    }

    static async completeWorkflowStep(workflowId: string, stepIndex: number, comments: string): Promise<Workflow> {
        console.log(`Completing step ${stepIndex} for workflow ${workflowId}`);
        return new Promise(resolve => setTimeout(() => resolve({ /* updated workflow */ } as Workflow), 800));
    }
}

class CollaborationService {
    // This would typically be WebSocket-based
    private static activeListeners: Record<string, (users: User[]) => void> = {};

    static subscribeToRealtimeUsers(fileId: string, callback: (users: User[]) => void) {
        console.log(`Subscribing to realtime users for ${fileId}`);
        CollaborationService.activeListeners[fileId] = callback;
        // Simulate initial users
        setTimeout(() => callback([{ id: 'user-123', name: 'Alice' }, { id: 'user-456', name: 'Bob' }]), 500);
    }

    static unsubscribeFromRealtimeUsers(fileId: string) {
        console.log(`Unsubscribing from realtime users for ${fileId}`);
        delete CollaborationService.activeListeners[fileId];
    }

    static async postComment(fileId: string, userId: string, content: string, replyToCommentId?: string): Promise<Comment> {
        console.log(`User ${userId} commenting on ${fileId}: ${content}`);
        const newComment: Comment = {
            id: `cmt-${Date.now()}`,
            fileId,
            userId,
            content,
            timestamp: Date.now(),
            replies: [],
            isResolved: false,
            replyToId: replyToCommentId,
        };
        return new Promise(resolve => setTimeout(() => resolve(newComment), 500));
    }

    static async getComments(fileId: string): Promise<Comment[]> {
        console.log(`Fetching comments for ${fileId}`);
        return new Promise(resolve => setTimeout(() => ([
            { id: 'cmt-1', fileId, userId: 'user-123', content: 'Great work on this draft!', timestamp: Date.now() - 3600000, replies: [], isResolved: false },
            { id: 'cmt-2', fileId, userId: 'user-456', content: 'I have a question about paragraph 3.', timestamp: Date.now() - 1800000, replies: [], isResolved: false },
        ]), 800));
    }
}

class TelemetryService {
    static logEvent(eventName: string, properties: Record<string, any>) {
        console.log(`Telemetry Event: ${eventName}`, properties);
        // In a real system, this would send data to an analytics platform
    }

    static trackUserActivity(userId: string, activity: string, context: Record<string, any>) {
        console.log(`User Activity Tracked: ${userId} - ${activity}`, context);
    }

    static reportSystemHealth(component: string, status: 'ok' | 'degraded' | 'critical', message: string) {
        console.warn(`System Health Update: ${component} is ${status}. Message: ${message}`);
    }
}

class DataGovernanceService {
    static async getRetentionPolicies(fileId?: string): Promise<RetentionPolicy[]> {
        console.log(`Fetching retention policies for ${fileId || 'all'}`);
        return new Promise(resolve => setTimeout(() => [
            { id: 'rp-1', name: 'Financial Records - 7 Years', description: 'Mandatory retention for financial documents.', criteria: { tags: ['finance'] }, durationDays: 2555, action: 'archive' },
            { id: 'rp-2', name: 'Project Archives - 3 Years', description: 'Project data archiving policy.', criteria: { parentFolder: 'archive' }, durationDays: 1095, action: 'archive' },
        ], 800));
    }

    static async applyRetentionPolicy(fileId: string, policyId: string): Promise<void> {
        console.log(`Applying retention policy ${policyId} to file ${fileId}`);
        return new Promise(resolve => setTimeout(resolve, 500));
    }

    static async getDLPPolicies(): Promise<DLPPolicy[]> {
        console.log('Fetching DLP Policies');
        return new Promise(resolve => setTimeout(() => [
            { id: 'dlp-1', name: 'PCI Compliance', description: 'Detects credit card numbers.', patterns: ['\\d{4}[ -]?\\d{4}[ -]?\\d{4}[ -]?\\d{4}'], severity: 'high', action: 'block', appliesTo: 'shared_external' },
            { id: 'dlp-2', name: 'GDPR PII', description: 'Detects common PII for GDPR compliance.', patterns: ['email:.*@', 'phone:\\+?\\d{10,12}'], severity: 'medium', action: 'warn', appliesTo: 'all' },
        ], 800));
    }

    static async getAuditLog(fileId?: string, userId?: string, eventType?: string): Promise<AuditLogEntry[]> {
        console.log(`Fetching audit log for file: ${fileId || 'all'}`);
        return new Promise(resolve => setTimeout(() => [
            { id: 'al-1', timestamp: Date.now() - 3600000, userId: 'user-123', eventType: 'file_opened', fileId: fileId || 'test-file-id', details: 'User viewed document.' },
            { id: 'al-2', timestamp: Date.now() - 1800000, userId: 'user-456', eventType: 'file_shared', fileId: fileId || 'test-file-id', details: 'Shared with external user.' },
        ], 1200));
    }
}

class IntegrationService {
    static async listDataSources(): Promise<DataSource[]> {
        console.log('Listing data sources');
        return new Promise(resolve => setTimeout(() => [
            { id: 'ds-salesforce', name: 'Salesforce CRM', type: 'CRM', status: 'connected' },
            { id: 'ds-jira', name: 'Jira Software', type: 'ProjectManagement', status: 'connected' },
        ], 700));
    }

    static async fetchDataFromSource(sourceId: string, query: string): Promise<any[]> {
        console.log(`Fetching data from ${sourceId} with query: ${query}`);
        return new Promise(resolve => setTimeout(() => [
            { id: 'ext-doc-1', name: 'CRM Lead Report.pdf', source: 'Salesforce', externalId: 'sfdc-123' },
            { id: 'ext-doc-2', name: 'Jira Project Status.docx', source: 'Jira', externalId: 'jira-456' },
        ], 1500));
    }

    static async registerWebhook(fileId: string, eventType: string, callbackUrl: string): Promise<WebhookSubscription> {
        console.log(`Registering webhook for ${fileId} on ${eventType} to ${callbackUrl}`);
        return new Promise(resolve => setTimeout(() => ({
            id: `wh-${Date.now()}`,
            fileId, eventType, callbackUrl, isActive: true, createdAt: Date.now()
        }), 1000));
    }

    static async listIntegrations(): Promise<IntegrationManifest[]> {
        console.log('Listing available integrations');
        return new Promise(resolve => setTimeout(() => [
            { id: 'integ-ms-office', name: 'Microsoft Office 365', description: 'Integrate with Word, Excel, PowerPoint online.', provider: 'Microsoft', version: '1.0', capabilities: ['file_sync', 'external_editing'] },
            { id: 'integ-adobe-cc', name: 'Adobe Creative Cloud', description: 'Direct editing and syncing with Photoshop, Illustrator.', provider: 'Adobe', version: '2.1', capabilities: ['file_sync', 'external_editing'] },
        ], 900));
    }
}

// --- Utility Components & Hooks ---

export const useNotifications = () => {
    const { state, dispatch } = useDrive();

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
        const id = `notif-${Date.now()}`;
        dispatch({ type: 'ADD_NOTIFICATION', payload: { ...notification, id, timestamp: Date.now() } });
        // Auto-remove after some time, unless it's sticky
        if (!notification.sticky) {
            setTimeout(() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }), notification.duration || 5000);
        }
        TelemetryService.logEvent('notification_displayed', { type: notification.type, message: notification.message });
    }, [dispatch]);

    const removeNotification = useCallback((id: string) => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
        TelemetryService.logEvent('notification_dismissed', { notificationId: id });
    }, [dispatch]);

    return { notifications: state.notifications, addNotification, removeNotification };
};

export const NotificationCenter: React.FC = () => {
    const { notifications, removeNotification } = useNotifications();

    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
            {notifications.map(notif => (
                <div
                    key={notif.id}
                    className={`p-3 rounded-lg shadow-lg flex items-center justify-between transition-all duration-300 transform
                                ${notif.type === 'info' ? 'bg-blue-600' : ''}
                                ${notif.type === 'success' ? 'bg-green-600' : ''}
                                ${notif.type === 'warning' ? 'bg-yellow-600 text-gray-900' : ''}
                                ${notif.type === 'error' ? 'bg-red-700' : ''}`}
                >
                    <span className="mr-4">{notif.message}</span>
                    <button onClick={() => removeNotification(notif.id)} className="text-white opacity-70 hover:opacity-100 focus:outline-none">
                        &times;
                    </button>
                </div>
            ))}
        </div>
    );
};

export const GlobalModal: React.FC = () => {
    const { state, dispatch } = useDrive();
    const { modal } = state;

    if (!modal) return null;

    const ModalContent = ({ type, props }: { type: string; props: any }) => {
        switch (type) {
            case 'ShareFile': return <ShareFileModal {...props} onClose={() => dispatch({ type: 'CLOSE_MODAL' })} />;
            case 'VersionHistory': return <VersionHistoryModal {...props} onClose={() => dispatch({ type: 'CLOSE_MODAL' })} />;
            case 'WorkflowSetup': return <WorkflowSetupModal {...props} onClose={() => dispatch({ type: 'CLOSE_MODAL' })} />;
            case 'PermissionsManager': return <PermissionsManagerModal {...props} onClose={() => dispatch({ type: 'CLOSE_MODAL' })} />;
            case 'SmartOrganizationReview': return <SmartOrganizationReviewModal {...props} onClose={() => dispatch({ type: 'CLOSE_MODAL' })} />;
            case 'IntegrationsManager': return <IntegrationsManagerModal {...props} onClose={() => dispatch({ type: 'CLOSE_MODAL' })} />;
            case 'DataGovernanceSettings': return <DataGovernanceSettingsModal {...props} onClose={() => dispatch({ type: 'CLOSE_MODAL' })} />;
            case 'UserFeedback': return <UserFeedbackModal {...props} onClose={() => dispatch({ type: 'CLOSE_MODAL' })} />;
            case 'SystemHealthDashboard': return <SystemHealthDashboard {...props} onClose={() => dispatch({ type: 'CLOSE_MODAL' })} />;
            default: return (
                <div className="p-8">
                    <h2 className="text-xl font-bold">Unknown Modal Type: {type}</h2>
                    <button onClick={() => dispatch({ type: 'CLOSE_MODAL' })} className="mt-4 px-4 py-2 bg-gray-700 rounded">Close</button>
                </div>
            );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
                <ModalContent type={modal.type} props={modal.props} />
            </div>
        </div>
    );
};


// --- Core UI Components (Expanded) ---

export const SearchBar: React.FC = () => {
    const { state, dispatch } = useDrive();
    const [localSearchQuery, setLocalSearchQuery] = useState(state.searchQuery);

    const handleSearch = useCallback(async (query: string) => {
        dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
        dispatch({ type: 'SET_LOADING', payload: true });
        TelemetryService.logEvent('search_initiated', { query });
        try {
            // Simulate advanced content and metadata search
            const results = await DriveAPI.searchFiles(query, state.filters); // DriveAPI.searchFiles needs to be expanded
            const aiResults = await AIService.getKnowledgeGraphNodes(query); // Integrate AI knowledge graph
            console.log("AI Knowledge Graph Search Results:", aiResults);
            dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
            dispatch({ type: 'SET_KNOWLEDGE_GRAPH_NODES', payload: aiResults });
        } catch (error) {
            console.error('Search failed:', error);
            dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Search failed. Please try again.' } });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [dispatch, state.filters]);

    const debouncedSearch = useRef(
        // Simple debounce
        (q: string) => {
            if (q === state.searchQuery) return; // Prevent unnecessary search on initial render
            if (q.length > 2 || q.length === 0) { // Only search for non-empty queries (or clear on empty)
                const timeoutId = setTimeout(() => handleSearch(q), 300);
                return () => clearTimeout(timeoutId);
            }
        }
    );

    useEffect(() => {
        return debouncedSearch.current(localSearchQuery);
    }, [localSearchQuery]);


    return (
        <div className="flex items-center space-x-2 w-full max-w-lg mx-auto bg-gray-700 rounded-lg p-2 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
                type="text"
                placeholder="Search across files, content, metadata, and connected systems..."
                className="flex-grow bg-transparent text-white placeholder-gray-400 focus:outline-none"
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(localSearchQuery); }}
            />
            {localSearchQuery && (
                <button onClick={() => setLocalSearchQuery('')} className="text-gray-400 hover:text-white">
                    &times;
                </button>
            )}
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm" onClick={() => handleSearch(localSearchQuery)}>
                Search
            </button>
        </div>
    );
};

export const Sidebar: React.FC = () => {
    const { state, dispatch } = useDrive();
    const { currentUser, currentPath, workspaces, collections, userPreferences, systemHealth } = state;
    const { addNotification } = useNotifications();

    const navigate = useCallback((path: string) => {
        dispatch({ type: 'SET_PATH', payload: path });
        TelemetryService.logEvent('navigation_event', { path });
        dispatch({ type: 'SET_LOADING', payload: true });
        setTimeout(async () => {
            try {
                const files = await DriveAPI.listFiles(path);
                dispatch({ type: 'REFRESH_FILES', payload: files });
            } catch (error) {
                addNotification({ type: 'error', message: `Failed to load path: ${path}` });
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        }, 500);
    }, [dispatch, addNotification]);

    const toggleOfflineMode = useCallback(() => {
        const newMode = !userPreferences.offlineMode;
        dispatch({ type: 'UPDATE_USER_PREFERENCE', payload: { key: 'offlineMode', value: newMode } });
        addNotification({ type: 'info', message: `Offline Mode ${newMode ? 'Enabled' : 'Disabled'}. Certain features may be limited.`, duration: 7000 });
        TelemetryService.logEvent('offline_mode_toggle', { enabled: newMode });
    }, [dispatch, userPreferences.offlineMode, addNotification]);

    const openSystemHealthModal = useCallback(() => {
        dispatch({ type: 'OPEN_MODAL', payload: { type: 'SystemHealthDashboard', props: { healthData: systemHealth } } });
        TelemetryService.logEvent('system_health_dashboard_opened', {});
    }, [dispatch, systemHealth]);


    return (
        <aside className="w-64 bg-gray-800 p-4 border-r border-gray-700 flex flex-col">
            <div className="flex items-center mb-6">
                <img src="/logo.svg" alt="Drive Logo" className="h-8 w-8 mr-2" />
                <span className="text-2xl font-bold text-blue-400">The Great Library</span>
            </div>

            <nav className="space-y-4 flex-grow">
                <div>
                    <h3 className="text-gray-400 text-xs uppercase mb-2">Navigation</h3>
                    <ul className="space-y-1">
                        <li>
                            <button className={`flex items-center w-full p-2 rounded-md ${currentPath === 'root' ? 'bg-blue-700' : 'hover:bg-gray-700'}`} onClick={() => navigate('root')}>
                                <i className="ri-home-fill mr-2"></i> My Drive
                            </button>
                        </li>
                        <li>
                            <button className={`flex items-center w-full p-2 rounded-md ${currentPath === 'recent' ? 'bg-blue-700' : 'hover:bg-gray-700'}`} onClick={() => navigate('recent')}>
                                <i className="ri-history-line mr-2"></i> Recent
                            </button>
                        </li>
                        <li>
                            <button className={`flex items-center w-full p-2 rounded-md ${currentPath === 'starred' ? 'bg-blue-700' : 'hover:bg-gray-700'}`} onClick={() => navigate('starred')}>
                                <i className="ri-star-fill mr-2"></i> Starred
                            </button>
                        </li>
                        <li>
                            <button className={`flex items-center w-full p-2 rounded-md ${currentPath === 'shared-with-me' ? 'bg-blue-700' : 'hover:bg-gray-700'}`} onClick={() => navigate('shared-with-me')}>
                                <i className="ri-share-fill mr-2"></i> Shared with me
                            </button>
                        </li>
                        <li>
                            <button className={`flex items-center w-full p-2 rounded-md ${currentPath === 'trash' ? 'bg-blue-700' : 'hover:bg-gray-700'}`} onClick={() => navigate('trash')}>
                                <i className="ri-delete-bin-fill mr-2"></i> Trash
                            </button>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-gray-400 text-xs uppercase mb-2">Workspaces</h3>
                    <ul className="space-y-1">
                        {workspaces.map(ws => (
                            <li key={ws.id}>
                                <button className={`flex items-center w-full p-2 rounded-md ${currentPath === `workspace-${ws.id}` ? 'bg-blue-700' : 'hover:bg-gray-700'}`} onClick={() => navigate(`workspace-${ws.id}`)}>
                                    <i className="ri-briefcase-fill mr-2"></i> {ws.name}
                                </button>
                            </li>
                        ))}
                        <li>
                            <button className="flex items-center w-full p-2 rounded-md hover:bg-gray-700">
                                <i className="ri-add-circle-line mr-2"></i> New Workspace
                            </button>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-gray-400 text-xs uppercase mb-2">Collections</h3>
                    <ul className="space-y-1">
                        {collections.map(col => (
                            <li key={col.id}>
                                <button className={`flex items-center w-full p-2 rounded-md ${currentPath === `collection-${col.id}` ? 'bg-blue-700' : 'hover:bg-gray-700'}`} onClick={() => navigate(`collection-${col.id}`)}>
                                    <i className="ri-bookmark-fill mr-2"></i> {col.name}
                                </button>
                            </li>
                        ))}
                        <li>
                            <button className="flex items-center w-full p-2 rounded-md hover:bg-gray-700">
                                <i className="ri-add-circle-line mr-2"></i> New Collection
                            </button>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-gray-400 text-xs uppercase mb-2">AI Insights</h3>
                    <ul className="space-y-1">
                        <li>
                            <button className="flex items-center w-full p-2 rounded-md hover:bg-gray-700">
                                <i className="ri-lightbulb-flash-fill mr-2"></i> Smart Suggestions
                                <span className="ml-auto text-blue-400 text-xs">AI</span>
                            </button>
                        </li>
                        <li>
                            <button className="flex items-center w-full p-2 rounded-md hover:bg-gray-700" onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'SmartOrganizationReview', props: {} } })}>
                                <i className="ri-organization-chart mr-2"></i> AI Organizer
                                <span className="ml-auto text-blue-400 text-xs">Beta</span>
                            </button>
                        </li>
                        <li>
                            <button className="flex items-center w-full p-2 rounded-md hover:bg-gray-700">
                                <i className="ri-robot-fill mr-2"></i> Semantic Search
                            </button>
                        </li>
                    </ul>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-700 space-y-2">
                    <h3 className="text-gray-400 text-xs uppercase mb-2">System</h3>
                    <div className="flex items-center justify-between">
                        <span>Offline Mode</span>
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={userPreferences.offlineMode}
                            onChange={toggleOfflineMode}
                        />
                    </div>
                    <button className="flex items-center w-full p-2 rounded-md hover:bg-gray-700" onClick={openSystemHealthModal}>
                        <i className={`mr-2 ${systemHealth.status === 'ok' ? 'ri-heart-pulse-fill text-green-500' : 'ri-alert-fill text-red-500'}`}></i>
                        System Health
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${systemHealth.status === 'ok' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            {systemHealth.status.toUpperCase()}
                        </span>
                    </button>
                    <button className="flex items-center w-full p-2 rounded-md hover:bg-gray-700" onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'UserFeedback', props: {} } })}>
                        <i className="ri-feedback-fill mr-2"></i> Send Feedback
                    </button>
                    <button className="flex items-center w-full p-2 rounded-md hover:bg-gray-700" onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'DataGovernanceSettings', props: {} } })}>
                        <i className="ri-shield-check-fill mr-2"></i> Data Governance
                    </button>
                    <button className="flex items-center w-full p-2 rounded-md hover:bg-gray-700" onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'IntegrationsManager', props: {} } })}>
                        <i className="ri-plug-fill mr-2"></i> Integrations
                    </button>
                    <button className="flex items-center w-full p-2 rounded-md hover:bg-gray-700">
                        <i className="ri-settings-3-fill mr-2"></i> Settings
                    </button>
                </div>
            </nav>

            {currentUser && (
                <div className="mt-4 p-2 border-t border-gray-700 flex items-center">
                    <img src={currentUser.avatarUrl || 'https://via.placeholder.com/30'} alt="User Avatar" className="w-8 h-8 rounded-full mr-2" />
                    <div>
                        <div className="font-semibold">{currentUser.name}</div>
                        <div className="text-gray-400 text-sm">{currentUser.email}</div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export const MainContentHeader: React.FC<{ currentPath: string }> = ({ currentPath }) => {
    const { state, dispatch } = useDrive();
    const { selectedFiles } = state;
    const { addNotification } = useNotifications();

    const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'info', message: `Uploading ${file.name}...` } });
            TelemetryService.logEvent('file_upload_started', { filename: file.name, size: file.size });
            try {
                const uploadedFile = await DriveAPI.uploadFile(file, currentPath);
                dispatch({ type: 'REFRESH_FILES', payload: await DriveAPI.listFiles(currentPath) });
                dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: `${uploadedFile.name} uploaded successfully.` } });
                TelemetryService.logEvent('file_upload_completed', { filename: uploadedFile.name, fileId: uploadedFile.id });
                const insights = await AIService.analyzeContent(uploadedFile);
                dispatch({ type: 'ADD_ACTIVITY_EVENT', payload: { id: `act-${Date.now()}`, type: 'file_analyzed_ai', timestamp: Date.now(), userId: state.currentUser?.id || 'system', fileId: uploadedFile.id, details: 'AI content analysis completed.' } });
                dispatch({ type: 'UPDATE_AI_INSIGHTS', payload: insights });
            } catch (error) {
                console.error('File upload failed:', error);
                dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: `Failed to upload ${file.name}.` } });
                TelemetryService.logEvent('file_upload_failed', { filename: file.name, error: (error as Error).message });
            }
        }
    }, [currentPath, dispatch, state.currentUser?.id, addNotification]);

    const handleCreateNew = useCallback(async (type: 'document' | 'spreadsheet' | 'presentation' | 'folder' | 'drawing') => {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'info', message: `Creating new ${type}...` } });
        TelemetryService.logEvent('create_new_item', { type });
        try {
            const newFile = await DriveAPI.createFile(type, currentPath);
            dispatch({ type: 'REFRESH_FILES', payload: await DriveAPI.listFiles(currentPath) });
            dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: `${newFile.name} created.` } });
            TelemetryService.logEvent('create_new_item_success', { type, fileId: newFile.id });
        } catch (error) {
            console.error(`Failed to create ${type}:`, error);
            dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: `Failed to create new ${type}.` } });
            TelemetryService.logEvent('create_new_item_failed', { type, error: (error as Error).message });
        }
    }, [currentPath, dispatch, addNotification]);

    const handleBulkAction = useCallback((actionType: string) => {
        if (selectedFiles.length === 0) {
            dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'warning', message: 'No files selected for this action.' } });
            return;
        }
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'info', message: `Performing ${actionType} on ${selectedFiles.length} files...` } });
        TelemetryService.logEvent('bulk_action_initiated', { actionType, fileCount: selectedFiles.length });
        setTimeout(() => {
            dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: `${actionType} completed for ${selectedFiles.length} files.` } });
            dispatch({ type: 'SET_SELECTED_FILES', payload: [] });
            dispatch({ type: 'SET_DETAIL_PANEL_FILE', payload: null });
            dispatch({ type: 'REFRESH_FILES', payload: [] });
        }, 1500);
    }, [selectedFiles, dispatch, addNotification]);

    return (
        <header className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
            <h1 className="text-xl font-bold flex items-center">
                <i className="ri-folder-fill text-blue-400 mr-2"></i>
                <span className="text-gray-300">Drive /</span> <span className="ml-2 capitalize">{currentPath.replace(/-/g, ' ')}</span>
            </h1>

            <div className="flex items-center space-x-4">
                {selectedFiles.length > 0 && (
                    <div className="flex items-center space-x-2 bg-gray-700 p-2 rounded-md">
                        <span className="text-blue-300 text-sm">{selectedFiles.length} selected</span>
                        <button className="flex items-center text-sm px-3 py-1 bg-gray-600 rounded-md hover:bg-gray-500" onClick={() => handleBulkAction('share')}>
                            <i className="ri-share-line mr-1"></i> Share
                        </button>
                        <button className="flex items-center text-sm px-3 py-1 bg-gray-600 rounded-md hover:bg-gray-500" onClick={() => handleBulkAction('move')}>
                            <i className="ri-folder-transfer-line mr-1"></i> Move
                        </button>
                        <button className="flex items-center text-sm px-3 py-1 bg-red-600 rounded-md hover:bg-red-700" onClick={() => handleBulkAction('delete')}>
                            <i className="ri-delete-bin-line mr-1"></i> Delete
                        </button>
                        <button className="flex items-center text-sm px-3 py-1 bg-gray-600 rounded-md hover:bg-gray-500" onClick={() => dispatch({ type: 'SET_SELECTED_FILES', payload: [] })}>
                            <i className="ri-close-line mr-1"></i> Clear Selection
                        </button>
                    </div>
                )}

                <div className="relative group">
                    <button className="flex items-center px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200">
                        <i className="ri-add-line mr-2"></i> New
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-10 hidden group-hover:block">
                        <a href="#" className="block px-4 py-2 text-sm text-white hover:bg-gray-600" onClick={() => handleCreateNew('folder')}>
                            <i className="ri-folder-add-line mr-2"></i> Folder
                        </a>
                        <label className="block px-4 py-2 text-sm text-white hover:bg-gray-600 cursor-pointer">
                            <input type="file" className="hidden" onChange={handleFileUpload} />
                            <i className="ri-upload-line mr-2"></i> File Upload
                        </label>
                        <a href="#" className="block px-4 py-2 text-sm text-white hover:bg-gray-600" onClick={() => handleCreateNew('document')}>
                            <i className="ri-file-word-2-line mr-2"></i> Document
                        </a>
                        <a href="#" className="block px-4 py-2 text-sm text-white hover:bg-gray-600" onClick={() => handleCreateNew('spreadsheet')}>
                            <i className="ri-file-excel-line mr-2"></i> Spreadsheet
                        </a>
                        <a href="#" className="block px-4 py-2 text-sm text-white hover:bg-gray-600" onClick={() => handleCreateNew('presentation')}>
                            <i className="ri-file-ppt-line mr-2"></i> Presentation
                        </a>
                        <div className="border-t border-gray-600 my-1"></div>
                        <a href="#" className="block px-4 py-2 text-sm text-white hover:bg-gray-600" onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'UserFeedback', props: { message: 'What new file type would you like?' } } })}>
                            <i className="ri-question-line mr-2"></i> Request New Type
                        </a>
                    </div>
                </div>

                <div className="flex space-x-2">
                    <button
                        className={`p-2 rounded-md ${state.viewMode === 'list' ? 'bg-blue-700' : 'hover:bg-gray-700'}`}
                        onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'list' })}
                    >
                        <i className="ri-list-check"></i>
                    </button>
                    <button
                        className={`p-2 rounded-md ${state.viewMode === 'grid' ? 'bg-blue-700' : 'hover:bg-gray-700'}`}
                        onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'grid' })}
                    >
                        <i className="ri-grid-fill"></i>
                    </button>
                    <button
                        className={`p-2 rounded-md ${state.viewMode === 'kanban' ? 'bg-blue-700' : 'hover:bg-gray-700'}`}
                        onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'kanban' })}
                    >
                        <i className="ri-layout-masonry-fill"></i>
                    </button>
                    {state.userPreferences.spatialEnabled && (
                        <button
                            className={`p-2 rounded-md ${state.viewMode === 'spatial' ? 'bg-blue-700' : 'hover:bg-gray-700'}`}
                            onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'spatial' })}
                        >
                            <i className="ri-vr-ar-fill"></i>
                        </button>
                    )}
                </div>

                <div className="relative group">
                    <button className="flex items-center px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600">
                        <i className="ri-filter-3-line mr-2"></i> Filter
                    </button>
                    {/* Filter dropdown content here */}
                </div>
                <div className="relative group">
                    <button className="flex items-center px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600">
                        <i className="ri-sort-asc mr-2"></i> Sort
                    </button>
                    {/* Sort dropdown content here */}
                </div>
            </div>
        </header>
    );
};

export const FileList: React.FC = () => {
    const { state, dispatch } = useDrive();
    const { isLoading, searchResults: files, viewMode, selectedFiles, knowledgeGraphNodes } = state;

    const handleFileClick = useCallback((file: DriveFile) => {
        dispatch({ type: 'TOGGLE_FILE_SELECTION', payload: file });
        TelemetryService.logEvent('file_clicked', { fileId: file.id, fileName: file.name });
    }, [dispatch]);

    const isFileSelected = useCallback((fileId: string) => {
        return selectedFiles.some(f => f.id === fileId);
    }, [selectedFiles]);

    const displayFiles = useMemo(() => {
        let currentFiles = files;
        if (state.sortOrder.field && currentFiles.length > 0) {
            currentFiles = [...currentFiles].sort((a, b) => {
                const aVal = (a as any)[state.sortOrder.field];
                const bVal = (b as any)[state.sortOrder.field];
                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return state.sortOrder.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                }
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return state.sortOrder.direction === 'asc' ? aVal - bVal : bVal - aVal;
                }
                return 0;
            });
        }
        return currentFiles;
    }, [files, state.sortOrder]);


    if (isLoading) {
        return <p className="p-6 text-center text-gray-400">Loading files from the vast digital archives...</p>;
    }

    if (displayFiles.length === 0 && knowledgeGraphNodes.length === 0 && !isLoading) {
        return (
            <div className="p-6 text-center text-gray-400">
                <p className="text-lg mb-2">No files found matching your criteria.</p>
                <p>Try adjusting your search or filters, or upload new content to The Great Library.</p>
            </div>
        );
    }

    return (
        <div className={`flex-grow overflow-y-auto p-6 ${viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-2'}`}>
            {knowledgeGraphNodes.length > 0 && (
                <div className="col-span-full mb-4">
                    <h2 className="text-lg font-semibold text-blue-300 mb-2">Knowledge Graph Insights:</h2>
                    <div className="bg-gray-700 p-4 rounded-md shadow-inner grid grid-cols-1 md:grid-cols-2 gap-4">
                        {knowledgeGraphNodes.map((node, index) => (
                            <div key={node.id} className="bg-gray-600 p-3 rounded-md">
                                <h3 className="text-md font-bold text-white">{node.name} <span className="text-gray-400 text-sm">({node.type})</span></h3>
                                <p className="text-sm text-gray-300 mt-1">{node.description}</p>
                                <button className="mt-2 text-blue-400 hover:text-blue-300 text-sm">Explore Relations</button>
                            </div>
                        ))}
                    </div>
                    <div className="border-b border-gray-700 my-6"></div>
                </div>
            )}
            {viewMode === 'list' && (
                <div className="space-y-2">
                    {displayFiles.map(file => (
                        <FileItem key={file.id} file={file} isSelected={isFileSelected(file.id)} onSelect={handleFileClick} />
                    ))}
                </div>
            )}
            {viewMode === 'grid' && (
                <>
                    {displayFiles.map(file => (
                        <FileGridItem key={file.id} file={file} isSelected={isFileSelected(file.id)} onSelect={handleFileClick} />
                    ))}
                </>
            )}
            {viewMode === 'kanban' && (
                <KanbanView files={displayFiles} onSelect={handleFileClick} isFileSelected={isFileSelected} />
            )}
            {viewMode === 'spatial' && (
                <SpatialView files={displayFiles} onSelect={handleFileClick} isFileSelected={isFileSelected} spatialContext={state.userPreferences.spatialContext} />
            )}
        </div>
    );
};

export const FileGridItem: React.FC<{ file: DriveFile; isSelected: boolean; onSelect: (file: DriveFile) => void }> = ({ file, isSelected, onSelect }) => {
    return (
        <div
            className={`flex flex-col items-center p-4 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-200 cursor-pointer
                        ${isSelected ? 'border-2 border-blue-500' : 'border border-gray-700'}`}
            onClick={() => onSelect(file)}
        >
            <div className="text-4xl mb-2">
                {file.type === 'folder' ? <i className="ri-folder-fill text-yellow-400"></i> : <i className="ri-file-text-fill text-blue-400"></i>}
            </div>
            <div className="text-sm text-center font-medium truncate w-full px-1">{file.name}</div>
            <div className="text-xs text-gray-400">{file.size} - {new Date(file.lastModified).toLocaleDateString()}</div>
            {isSelected && <span className="mt-2 text-blue-300 text-xs">Selected</span>}
        </div>
    );
};

export const KanbanView: React.FC<{ files: DriveFile[]; onSelect: (file: DriveFile) => void; isFileSelected: (fileId: string) => boolean }> = ({ files, onSelect, isFileSelected }) => {
    const columns = {
        'Draft': files.filter(f => f.name.toLowerCase().includes('draft')),
        'In Review': files.filter(f => f.name.toLowerCase().includes('review')),
        'Approved': files.filter(f => f.name.toLowerCase().includes('approved')),
        'Completed': files.filter(f => !f.name.toLowerCase().includes('draft') && !f.name.toLowerCase().includes('review') && !f.name.toLowerCase().includes('approved'))
    };

    return (
        <div className="flex space-x-4 overflow-x-auto h-full pb-4">
            {Object.entries(columns).map(([columnName, columnFiles]) => (
                <div key={columnName} className="flex-none w-80 bg-gray-700 rounded-lg shadow-md p-4">
                    <h3 className="text-lg font-bold text-white mb-3 border-b border-gray-600 pb-2">{columnName} ({columnFiles.length})</h3>
                    <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
                        {columnFiles.length === 0 && <p className="text-gray-400 text-sm">No files in this stage.</p>}
                        {columnFiles.map(file => (
                            <FileGridItem key={file.id} file={file} isSelected={isFileSelected(file.id)} onSelect={onSelect} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export const SpatialView: React.FC<{ files: DriveFile[]; onSelect: (file: DriveFile) => void; isFileSelected: (fileId: string) => boolean; spatialContext?: SpatialContext }> = ({ files, onSelect, isFileSelected, spatialContext }) => {
    return (
        <div className="relative w-full h-[calc(100vh-180px)] bg-gradient-to-br from-gray-900 to-indigo-900 rounded-lg flex items-center justify-center text-center text-gray-300 overflow-hidden border border-blue-600">
            <div className="absolute inset-0 opacity-10 bg-grid-pattern z-0"></div>
            <div className="relative z-10 p-8 max-w-2xl">
                <i className="ri-vr-ar-fill text-8xl text-blue-500 mb-4 animate-pulse"></i>
                <h2 className="text-3xl font-bold mb-2">Spatial Data Environment</h2>
                <p className="text-lg mb-4">
                    Immerse yourself in your data. Navigate files in a 3D, interactive space, leveraging augmented and virtual reality.
                    Future iterations will enable true holographic projection and intuitive gesture controls.
                </p>
                <p className="text-sm text-gray-400">
                    Currently displaying a conceptual preview. {files.length} files available in this spatial dimension.
                </p>
                <button
                    className="mt-6 px-6 py-3 bg-blue-600 rounded-full text-white font-semibold hover:bg-blue-700 transition-colors duration-200"
                    onClick={() => alert("Engaging Spatial Data Overlay... (requires AR/VR hardware and advanced rendering)")}
                >
                    Launch Spatial Overlay
                </button>
            </div>
            {files.slice(0, 5).map((file, index) => (
                <div
                    key={file.id}
                    className="absolute p-2 bg-blue-800 bg-opacity-30 backdrop-blur-sm rounded-md border border-blue-500 text-xs shadow-xl"
                    style={{
                        top: `${20 + index * 10}%`,
                        left: `${10 + index * 15}%`,
                        transform: `rotate(${index * 5}deg) scale(${1 - index * 0.05})`,
                        zIndex: 20 + index,
                    }}
                >
                    <i className={`${file.type === 'folder' ? 'ri-folder-fill' : 'ri-file-text-fill'} mr-1`}></i> {file.name.slice(0, 15)}...
                </div>
            ))}
        </div>
    );
};


export const DetailPanel: React.FC = () => {
    const { state, dispatch } = useDrive();
    const { detailPanelFile: file, aiInsights, currentUser, realtimeUsers } = state;
    const { addNotification } = useNotifications();

    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [versions, setVersions] = useState<Version[]>([]);
    const [auditHistory, setAuditHistory] = useState<AuditLogEntry[]>([]);
    const [fileWorkflows, setFileWorkflows] = useState<Workflow[]>([]);
    const [dlpViolations, setDlpViolations] = useState<string[]>([]);
    const [suggestedTags, setSuggestedTags] = useState<Tag[]>([]);


    const fetchDetails = useCallback(async (fileId: string) => {
        try {
            const [fetchedComments, fetchedVersions, fetchedAudit, fetchedWorkflows] = await Promise.all([
                CollaborationService.getComments(fileId),
                DriveAPI.getFileVersions(fileId),
                DataGovernanceService.getAuditLog(fileId),
                WorkflowService.getWorkflowsForFile(fileId),
            ]);
            setComments(fetchedComments);
            setVersions(fetchedVersions);
            setAuditHistory(fetchedAudit);
            setFileWorkflows(fetchedWorkflows);

            const aiInsights = await AIService.analyzeContent(file!);
            dispatch({ type: 'UPDATE_AI_INSIGHTS', payload: aiInsights });
            const violations = await AIService.identifyDLPViolations(file!);
            setDlpViolations(violations);

            setSuggestedTags([{ id: 'tag-ai-1', name: 'AI-Suggested' }, { id: 'tag-ai-2', name: 'Compliance' }]);

            TelemetryService.logEvent('detail_panel_viewed', { fileId });
        } catch (error) {
            console.error('Failed to fetch detail panel data:', error);
            addNotification({ type: 'error', message: `Failed to load details for ${file?.name}.` });
        }
    }, [dispatch, file, addNotification]);

    useEffect(() => {
        if (file) {
            fetchDetails(file.id);
            CollaborationService.subscribeToRealtimeUsers(file.id, (users) => {
                dispatch({ type: 'UPDATE_REALTIME_USERS', payload: [{ fileId: file.id, users }] });
            });
            return () => CollaborationService.unsubscribeFromRealtimeUsers(file.id);
        }
    }, [file, fetchDetails, dispatch]);

    const handleAddComment = useCallback(async () => {
        if (!file || !currentUser || !newComment.trim()) return;
        try {
            const addedComment = await CollaborationService.postComment(file.id, currentUser.id, newComment);
            setComments(prev => [...prev, addedComment]);
            setNewComment('');
            dispatch({ type: 'ADD_ACTIVITY_EVENT', payload: { id: `act-${Date.now()}`, type: 'comment_added', timestamp: Date.now(), userId: currentUser.id, fileId: file.id, details: `Added comment: ${newComment}` } });
            addNotification({ type: 'success', message: 'Comment added successfully.' });
        } catch (error) {
            console.error('Failed to add comment:', error);
            addNotification({ type: 'error', message: 'Failed to add comment.' });
        }
    }, [file, currentUser, newComment, dispatch, addNotification]);

    const handleRestoreVersion = useCallback(async (versionId: string) => {
        if (!file) return;
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'info', message: `Restoring version ${versionId} of ${file.name}...` } });
        try {
            await DriveAPI.restoreFileVersion(file.id, versionId);
            addNotification({ type: 'success', message: `${file.name} restored to version ${versionId}.` });
            dispatch({ type: 'ADD_ACTIVITY_EVENT', payload: { id: `act-${Date.now()}`, type: 'file_version_restored', timestamp: Date.now(), userId: currentUser?.id || 'system', fileId: file.id, details: `Restored to version ${versionId}.` } });
            fetchDetails(file.id);
        } catch (error) {
            console.error('Failed to restore version:', error);
            addNotification({ type: 'error', message: `Failed to restore version ${versionId}.` });
        }
    }, [file, dispatch, currentUser?.id, addNotification, fetchDetails]);

    if (!file) {
        return (
            <div className="w-80 bg-gray-800 p-4 border-l border-gray-700 flex-shrink-0 text-center text-gray-400 flex flex-col items-center justify-center">
                <i className="ri-information-line text-5xl mb-3"></i>
                <p>Select a file to view its comprehensive details and AI-powered insights.</p>
                <button
                    className="mt-4 px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 text-sm"
                    onClick={() => dispatch({ type: 'UPDATE_USER_PREFERENCE', payload: { key: 'spatialEnabled', value: !state.userPreferences.spatialEnabled } })}
                >
                    Toggle Spatial View {state.userPreferences.spatialEnabled ? 'Off' : 'On'}
                </button>
            </div>
        );
    }

    const currentRealtimeUsers = realtimeUsers.find(r => r.fileId === file.id)?.users || [];

    return (
        <div className="w-96 bg-gray-800 p-4 border-l border-gray-700 flex-shrink-0 flex flex-col h-full overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{file.name}</h2>
                <button onClick={() => dispatch({ type: 'SET_DETAIL_PANEL_FILE', payload: null })} className="text-gray-400 hover:text-white text-2xl">
                    &times;
                </button>
            </div>

            <div className="flex items-center space-x-2 mb-4">
                <button className="flex-1 px-3 py-2 bg-blue-600 rounded-md hover:bg-blue-700 text-sm" onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'ShareFile', props: { file } } })}>
                    <i className="ri-share-line mr-1"></i> Share
                </button>
                <button className="flex-1 px-3 py-2 bg-gray-700 rounded-md hover:bg-gray-600 text-sm" onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'VersionHistory', props: { fileId: file.id, versions } } })}>
                    <i className="ri-history-line mr-1"></i> Versions
                </button>
                <button className="flex-1 px-3 py-2 bg-gray-700 rounded-md hover:bg-gray-600 text-sm" onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'PermissionsManager', props: { file } } })}>
                    <i className="ri-key-2-line mr-1"></i> Permissions
                </button>
            </div>

            <div className="mb-6 space-y-2 text-sm text-gray-300">
                <p><strong>Type:</strong> {file.type}</p>
                <p><strong>Size:</strong> {file.size}</p>
                <p><strong>Last Modified:</strong> {new Date(file.lastModified).toLocaleString()}</p>
                <p><strong>Owner:</strong> {file.owner}</p>
                {file.sharedWith && file.sharedWith.length > 0 && <p><strong>Shared with:</strong> {file.sharedWith.map(u => u.name).join(', ')}</p>}
                {currentRealtimeUsers.length > 0 && (
                    <p className="flex items-center text-blue-400">
                        <i className="ri-user-2-fill mr-1 animate-pulse"></i>
                        <strong>Live:</strong> {currentRealtimeUsers.map(u => u.name).join(', ')} currently viewing.
                    </p>
                )}
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Metadata & Tags</h3>
                <div className="flex flex-wrap gap-2">
                    {(file.tags || []).concat(suggestedTags.map(t => t.name)).map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-800 rounded-full text-xs text-blue-100">{tag}</span>
                    ))}
                    <button className="px-3 py-1 bg-gray-700 rounded-full text-xs text-gray-300 hover:bg-gray-600"><i className="ri-add-line mr-1"></i> Add Tag</button>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-bold mb-2 flex items-center">
                    AI Insights
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs">AI</span>
                </h3>
                {aiInsights.length === 0 ? (
                    <p className="text-gray-400 text-sm">No AI insights available yet. <button className="text-blue-400 hover:underline" onClick={() => AIService.analyzeContent(file).then(insights => dispatch({ type: 'UPDATE_AI_INSIGHTS', payload: insights }))}>Analyze now</button></p>
                ) : (
                    <div className="space-y-2">
                        {aiInsights.map(insight => (
                            <div key={insight.id} className="bg-gray-700 p-3 rounded-md text-sm">
                                <strong className="capitalize text-blue-300">{insight.type.replace(/_/g, ' ')}:</strong> {Array.isArray(insight.content) ? insight.content.join(', ') : insight.content}
                            </div>
                        ))}
                    </div>
                )}
                {dlpViolations.length > 0 && (
                    <div className="mt-4 p-3 bg-red-800/30 border border-red-700 rounded-md text-sm text-red-300">
                        <h4 className="font-bold mb-1 flex items-center"><i className="ri-alert-fill mr-2"></i> DLP Violations Detected:</h4>
                        <ul className="list-disc pl-5">
                            {dlpViolations.map((violation, idx) => <li key={idx}>{violation}</li>)}
                        </ul>
                        <button className="mt-2 text-blue-400 hover:underline" onClick={() => addNotification({type:'info', message:'Initiating compliance review...'})}>Review Compliance</button>
                    </div>
                )}
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Workflow Status</h3>
                {fileWorkflows.length === 0 ? (
                    <p className="text-gray-400 text-sm">No active workflows. <button className="text-blue-400 hover:underline" onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'WorkflowSetup', props: { file } } })}>Start Workflow</button></p>
                ) : (
                    <div className="space-y-2">
                        {fileWorkflows.map(wf => (
                            <div key={wf.id} className="bg-gray-700 p-3 rounded-md text-sm">
                                <p><strong className="text-blue-300">{wf.name}</strong> - <span className="capitalize">{wf.status}</span></p>
                                <div className="flex items-center text-xs text-gray-400 mt-1">
                                    {wf.steps.map((step, idx) => (
                                        <span key={idx} className={`flex items-center ${step.status === 'completed' ? 'text-green-400' : step.status === 'pending' ? 'text-yellow-400' : ''}`}>
                                            {step.name} <i className={`mx-1 ${idx < wf.steps.length - 1 ? 'ri-arrow-right-line' : ''}`}></i>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Activity Log</h3>
                {auditHistory.length === 0 ? (
                    <p className="text-gray-400 text-sm">No recent activity for this file.</p>
                ) : (
                    <ul className="space-y-2 text-sm max-h-48 overflow-y-auto custom-scrollbar">
                        {auditHistory.map(entry => (
                            <li key={entry.id} className="bg-gray-700 p-2 rounded-md">
                                <span className="font-semibold text-blue-300">{new Date(entry.timestamp).toLocaleString()}:</span> {entry.details}
                                <span className="text-gray-500 ml-2"> (by {entry.userId})</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-700">
                <h3 className="text-lg font-bold mb-2">Comments</h3>
                <div className="max-h-48 overflow-y-auto space-y-3 custom-scrollbar mb-4">
                    {comments.length === 0 && <p className="text-gray-400 text-sm">No comments yet. Be the first!</p>}
                    {comments.map(comment => (
                        <div key={comment.id} className="bg-gray-700 p-3 rounded-md">
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                <span className="font-semibold">{comment.userId}</span>
                                <span>{new Date(comment.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                            <div className="flex justify-end mt-2">
                                <button className="text-blue-400 hover:underline text-xs">Reply</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center">
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        className="flex-grow bg-gray-700 text-white rounded-md p-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter') handleAddComment(); }}
                    />
                    <button
                        onClick={handleAddComment}
                        className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Modals for Complex Features (Minimal Implementations) ---

export const ShareFileModal: React.FC<{ file: DriveFile; onClose: () => void }> = ({ file, onClose }) => {
    const { dispatch, state } = useDrive();
    const { addNotification } = useNotifications();
    const [recipient, setRecipient] = useState('');
    const [permission, setPermission] = useState<'view' | 'edit' | 'comment'>('view');
    const [linkAccess, setLinkAccess] = useState<'off' | 'viewer' | 'commenter'>('off');
    const [expiration, setExpiration] = useState<string>('');
    const [requireApproval, setRequireApproval] = useState(false);
    const [currentShares, setCurrentShares] = useState(file.permissions || []);

    const handleShare = useCallback(async () => {
        if (!file) return;
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'info', message: `Sharing ${file.name}...` } });
        try {
            const newPermissions: Permission[] = recipient ? [...currentShares, { userId: recipient, role: permission, grantedBy: state.currentUser?.id || 'system', grantedAt: Date.now() }] : currentShares;
            await DriveAPI.updateFilePermissions(file.id, newPermissions, { linkAccess, expiration });
            if (requireApproval) {
                const workflow = await WorkflowService.initiateApproval(file.id, recipient || 'admin', `Request to share ${file.name}`);
                dispatch({ type: 'UPDATE_ACTIVE_WORKFLOWS', payload: [...state.activeWorkflows, workflow] });
            }
            addNotification({ type: 'success', message: `${file.name} shared successfully!` });
            TelemetryService.logEvent('file_shared', { fileId: file.id, recipient, permission, linkAccess, requireApproval });
            onClose();
        } catch (error) {
            console.error('Share failed:', error);
            addNotification({ type: 'error', message: 'Failed to share file.' });
        }
    }, [file, recipient, permission, linkAccess, expiration, requireApproval, currentShares, dispatch, state.currentUser?.id, state.activeWorkflows, addNotification, onClose]);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Share '{file.name}'</h2>

            <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">People & Groups</h3>
                <div className="flex space-x-2 mb-2">
                    <input
                        type="email"
                        placeholder="Add emails or group names"
                        className="flex-grow bg-gray-700 rounded-md p-2"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                    />
                    <select
                        className="bg-gray-700 rounded-md p-2"
                        value={permission}
                        onChange={(e) => setPermission(e.target.value as 'view' | 'edit' | 'comment')}
                    >
                        <option value="view">Can view</option>
                        <option value="comment">Can comment</option>
                        <option value="edit">Can edit</option>
                    </select>
                    <button className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700" onClick={() => { /* Add logic to actually add to list */ }}>Add</button>
                </div>
                <div className="space-y-1">
                    {currentShares.map((p, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                            <span>{p.userId} ({p.role})</span>
                            <button className="text-red-400 hover:text-red-300">&times;</button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">General Access (Link Sharing)</h3>
                <select
                    className="w-full bg-gray-700 rounded-md p-2 mb-2"
                    value={linkAccess}
                    onChange={(e) => setLinkAccess(e.target.value as 'off' | 'viewer' | 'commenter')}
                >
                    <option value="off">Restricted - Only people added can open</option>
                    <option value="viewer">Anyone with the link can view</option>
                    <option value="commenter">Anyone with the link can comment</option>
                </select>
                {linkAccess !== 'off' && (
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            readOnly
                            value={`https://greatlibrary.com/share/${file.id}?access=${linkAccess}`}
                            className="flex-grow bg-gray-700 rounded-md p-2 text-sm text-gray-400"
                        />
                        <button className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500" onClick={() => navigator.clipboard.writeText(`https://greatlibrary.com/share/${file.id}?access=${linkAccess}`).then(() => addNotification({ type: 'success', message: 'Link copied!' }))}>
                            Copy Link
                        </button>
                    </div>
                )}
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Advanced Options</h3>
                <div className="flex items-center justify-between mb-2">
                    <span>Require Approval for Sharing</span>
                    <input type="checkbox" className="toggle toggle-primary" checked={requireApproval} onChange={(e) => setRequireApproval(e.target.checked)} />
                </div>
                <div className="flex items-center justify-between mb-2">
                    <span>Link Expiration Date</span>
                    <input type="date" className="bg-gray-700 rounded-md p-2" value={expiration} onChange={(e) => setExpiration(e.target.value)} />
                </div>
                <div className="flex items-center justify-between">
                    <span>Prevent Downloads, prints, and copies for viewers</span>
                    <input type="checkbox" className="toggle toggle-primary" />
                </div>
            </div>

            <div className="flex justify-end space-x-4">
                <button className="px-5 py-2 bg-gray-600 rounded-md hover:bg-gray-500" onClick={onClose}>Cancel</button>
                <button className="px-5 py-2 bg-blue-600 rounded-md hover:bg-blue-700" onClick={handleShare}>Share</button>
            </div>
        </div>
    );
};

export const VersionHistoryModal: React.FC<{ fileId: string; versions: Version[]; onClose: () => void }> = ({ fileId, versions, onClose }) => {
    const { dispatch, currentUser } = useDrive();
    const { addNotification } = useNotifications();

    const handleRestore = useCallback(async (versionId: string) => {
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'info', message: `Restoring version ${versionId}...` } });
        try {
            await DriveAPI.restoreFileVersion(fileId, versionId);
            addNotification({ type: 'success', message: `File restored to version ${versionId}.` });
            dispatch({ type: 'ADD_ACTIVITY_EVENT', payload: { id: `act-${Date.now()}`, type: 'file_version_restored', timestamp: Date.now(), userId: currentUser?.id || 'system', fileId: fileId, details: `Restored to version ${versionId}.` } });
            onClose();
        } catch (error) {
            console.error('Restore failed:', error);
            addNotification({ type: 'error', message: 'Failed to restore version.' });
        }
    }, [fileId, dispatch, currentUser?.id, addNotification, onClose]);

    const handleCompare = useCallback((version1Id: string, version2Id: string) => {
        addNotification({ type: 'info', message: `Comparing versions ${version1Id} and ${version2Id}. (Feature under development)` });
        TelemetryService.logEvent('version_compare_initiated', { fileId, version1Id, version2Id });
    }, [addNotification]);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Version History for File ID: {fileId}</h2>
            {versions.length === 0 ? (
                <p className="text-gray-400">No previous versions available.</p>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar mb-4">
                    {versions.map(version => (
                        <div key={version.id} className="bg-gray-700 p-3 rounded-md flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{version.name || `Version ${version.id.substring(0, 8)}`}</p>
                                <p className="text-sm text-gray-400">Modified: {new Date(version.timestamp).toLocaleString()} by {version.modifier}</p>
                                <p className="text-xs text-gray-500">Size: {version.size}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button className="px-3 py-1 bg-blue-600 rounded-md text-sm hover:bg-blue-700" onClick={() => handleRestore(version.id)}>Restore</button>
                                <button className="px-3 py-1 bg-gray-600 rounded-md text-sm hover:bg-gray-500" onClick={() => handleCompare(fileId, version.id)}>Compare</button>
                                <button className="px-3 py-1 bg-red-600 rounded-md text-sm hover:bg-red-700">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex justify-end mt-4">
                <button className="px-5 py-2 bg-gray-600 rounded-md hover:bg-gray-500" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export const WorkflowSetupModal: React.FC<{ file: DriveFile; onClose: () => void }> = ({ file, onClose }) => {
    const { dispatch, state } = useDrive();
    const { addNotification } = useNotifications();
    const [workflowName, setWorkflowName] = useState(`Review for ${file.name}`);
    const [approverEmail, setApproverEmail] = useState('');
    const [description, setDescription] = useState('');
    const [workflowType, setWorkflowType] = useState<'approval' | 'review' | 'custom'>('approval');

    const handleInitiateWorkflow = useCallback(async () => {
        if (!file || !approverEmail) {
            addNotification({ type: 'warning', message: 'Please provide approver email.' });
            return;
        }
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'info', message: `Initiating ${workflowType} workflow for ${file.name}...` } });
        try {
            const mockApproverId = `user-${approverEmail.split('@')[0]}`;
            const workflow = await WorkflowService.initiateApproval(file.id, mockApproverId, description);
            dispatch({ type: 'UPDATE_ACTIVE_WORKFLOWS', payload: [...state.activeWorkflows, workflow] });
            dispatch({ type: 'ADD_ACTIVITY_EVENT', payload: { id: `act-${Date.now()}`, type: 'workflow_initiated', timestamp: Date.now(), userId: state.currentUser?.id || 'system', fileId: file.id, details: `Workflow '${workflow.name}' initiated.` } });
            addNotification({ type: 'success', message: 'Workflow initiated successfully!' });
            TelemetryService.logEvent('workflow_initiated', { fileId: file.id, workflowType, approver: approverEmail });
            onClose();
        } catch (error) {
            console.error('Failed to initiate workflow:', error);
            addNotification({ type: 'error', message: 'Failed to initiate workflow.' });
        }
    }, [file, approverEmail, description, workflowName, workflowType, dispatch, state.activeWorkflows, state.currentUser?.id, addNotification, onClose]);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Setup Workflow for '{file.name}'</h2>

            <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="workflowName">Workflow Name</label>
                <input
                    type="text"
                    id="workflowName"
                    className="w-full bg-gray-700 rounded-md p-2"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="workflowType">Workflow Type</label>
                <select
                    id="workflowType"
                    className="w-full bg-gray-700 rounded-md p-2"
                    value={workflowType}
                    onChange={(e) => setWorkflowType(e.target.value as 'approval' | 'review' | 'custom')}
                >
                    <option value="approval">Approval Workflow</option>
                    <option value="review">Review Cycle</option>
                    <option value="custom">Custom Process (Advanced)</option>
                </select>
            </div>

            <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="approverEmail">Assign Approver(s) / Reviewer(s)</label>
                <input
                    type="email"
                    id="approverEmail"
                    placeholder="e.g., jane.doe@example.com"
                    className="w-full bg-gray-700 rounded-md p-2"
                    value={approverEmail}
                    onChange={(e) => setApproverEmail(e.target.value)}
                />
            </div>

            <div className="mb-6">
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="description">Description / Instructions</label>
                <textarea
                    id="description"
                    rows={3}
                    className="w-full bg-gray-700 rounded-md p-2"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                ></textarea>
            </div>

            <div className="flex justify-end space-x-4">
                <button className="px-5 py-2 bg-gray-600 rounded-md hover:bg-gray-500" onClick={onClose}>Cancel</button>
                <button className="px-5 py-2 bg-blue-600 rounded-md hover:bg-blue-700" onClick={handleInitiateWorkflow}>Initiate Workflow</button>
            </div>
        </div>
    );
};

export const PermissionsManagerModal: React.FC<{ file: DriveFile; onClose: () => void }> = ({ file, onClose }) => {
    const { addNotification } = useNotifications();
    const [permissions, setPermissions] = useState<Permission[]>(file.permissions || []);
    const [newPermissionUser, setNewPermissionUser] = useState('');
    const [newPermissionRole, setNewPermissionRole] = useState<'owner' | 'editor' | 'viewer' | 'commenter'>('viewer');

    const handleAddPermission = useCallback(() => {
        if (newPermissionUser.trim() && !permissions.some(p => p.userId === newPermissionUser)) {
            setPermissions(prev => [...prev, { userId: newPermissionUser, role: newPermissionRole, grantedBy: 'self', grantedAt: Date.now() }]);
            setNewPermissionUser('');
            setNewPermissionRole('viewer');
            addNotification({ type: 'info', message: `Added ${newPermissionUser} to permissions. Click Save to apply.` });
        }
    }, [newPermissionUser, newPermissionRole, permissions, addNotification]);

    const handleRemovePermission = useCallback((userId: string) => {
        setPermissions(prev => prev.filter(p => p.userId !== userId));
        addNotification({ type: 'info', message: `Removed ${userId} from permissions. Click Save to apply.` });
    }, [addNotification]);

    const handleRoleChange = useCallback((userId: string, newRole: 'owner' | 'editor' | 'viewer' | 'commenter') => {
        setPermissions(prev => prev.map(p => p.userId === userId ? { ...p, role: newRole } : p));
        addNotification({ type: 'info', message: `Changed role for ${userId}. Click Save to apply.` });
    }, [addNotification]);

    const handleSavePermissions = useCallback(async () => {
        addNotification({ type: 'info', message: `Saving permissions for ${file.name}...` });
        try {
            await DriveAPI.updateFilePermissions(file.id, permissions, { linkAccess: 'off', expiration: '' });
            addNotification({ type: 'success', message: 'Permissions updated successfully!' });
            TelemetryService.logEvent('permissions_updated', { fileId: file.id, permissions });
            onClose();
        } catch (error) {
            console.error('Failed to update permissions:', error);
            addNotification({ type: 'error', message: 'Failed to update permissions.' });
        }
    }, [file.id, permissions, addNotification, onClose]);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Manage Permissions for '{file.name}'</h2>

            <div className="mb-4 border-b border-gray-700 pb-4">
                <h3 className="text-lg font-semibold mb-2">Current Permissions</h3>
                <div className="space-y-2">
                    {permissions.length === 0 && <p className="text-gray-400 text-sm">No specific permissions set.</p>}
                    {permissions.map((p, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                            <span className="font-semibold">{p.userId}</span>
                            <div className="flex items-center space-x-2">
                                <select
                                    className="bg-gray-800 rounded-md p-1 text-sm"
                                    value={p.role}
                                    onChange={(e) => handleRoleChange(p.userId, e.target.value as 'owner' | 'editor' | 'viewer' | 'commenter')}
                                >
                                    <option value="owner">Owner</option>
                                    <option value="editor">Editor</option>
                                    <option value="commenter">Commenter</option>
                                    <option value="viewer">Viewer</option>
                                </select>
                                <button onClick={() => handleRemovePermission(p.userId)} className="text-red-400 hover:text-red-300">
                                    <i className="ri-delete-bin-line"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Add New Permission</h3>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="User ID or Email"
                        className="flex-grow bg-gray-700 rounded-md p-2"
                        value={newPermissionUser}
                        onChange={(e) => setNewPermissionUser(e.target.value)}
                    />
                    <select
                        className="bg-gray-700 rounded-md p-2"
                        value={newPermissionRole}
                        onChange={(e) => setNewPermissionRole(e.target.value as 'owner' | 'editor' | 'viewer' | 'commenter')}
                    >
                        <option value="viewer">Viewer</option>
                        <option value="commenter">Commenter</option>
                        <option value="editor">Editor</option>
                        <option value="owner">Owner</option>
                    </select>
                    <button className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700" onClick={handleAddPermission}>Add</button>
                </div>
            </div>

            <div className="flex justify-end space-x-4">
                <button className="px-5 py-2 bg-gray-600 rounded-md hover:bg-gray-500" onClick={onClose}>Cancel</button>
                <button className="px-5 py-2 bg-blue-600 rounded-md hover:bg-blue-700" onClick={handleSavePermissions}>Save Permissions</button>
            </div>
        </div>
    );
};

export const SmartOrganizationReviewModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { state, dispatch } = useDrive();
    const { addNotification } = useNotifications();
    const [suggestedCollections, setSuggestedCollections] = useState<Collection[]>([]);
    const [isLoadingAI, setIsLoadingAI] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            setIsLoadingAI(true);
            try {
                const { suggestedCollections: aiCollections } = await AIService.smartOrganize(state.searchResults.slice(0, 10)); // Limit to first 10 for demo
                setSuggestedCollections(aiCollections);
                addNotification({ type: 'info', message: 'AI organization suggestions generated.' });
            } catch (error) {
                console.error('Failed to get AI suggestions:', error);
                addNotification({ type: 'error', message: 'Failed to get AI organization suggestions.' });
            } finally {
                setIsLoadingAI(false);
            }
        };
        fetchSuggestions();
    }, [state.searchResults, addNotification]);

    const handleApplySuggestion = useCallback(async (collection: Collection) => {
        addNotification({ type: 'info', message: `Applying AI suggestion: ${collection.name}...` });
        try {
            dispatch({ type: 'SET_COLLECTIONS', payload: [...state.collections, collection] });
            addNotification({ type: 'success', message: `Collection '${collection.name}' created and files organized.` });
            TelemetryService.logEvent('ai_organize_applied', { collectionId: collection.id, fileCount: collection.files.length });
            setSuggestedCollections(prev => prev.filter(c => c.id !== collection.id));
            onClose();
        } catch (error) {
            console.error('Failed to apply AI suggestion:', error);
            addNotification({ type: 'error', message: 'Failed to apply AI suggestion.' });
        }
    }, [dispatch, state.collections, addNotification, onClose]);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
                <i className="ri-robot-fill mr-2 text-blue-400"></i> AI Smart Organization Review
            </h2>
            <p className="text-gray-300 mb-6">
                The Sovereign AI has analyzed your drive content and usage patterns to suggest optimized organization strategies.
            </p>

            {isLoadingAI ? (
                <p className="text-center text-gray-400 py-8"><i className="ri-loader-4-line animate-spin mr-2"></i> Generating smart suggestions...</p>
            ) : suggestedCollections.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No new organization suggestions at this time. Your drive is already impeccably organized!</p>
            ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar mb-6">
                    {suggestedCollections.map(collection => (
                        <div key={collection.id} className="bg-gray-700 p-4 rounded-md shadow-inner flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold text-blue-300">{collection.name}</h3>
                                <p className="text-sm text-gray-400">{collection.description}</p>
                                <p className="text-xs text-gray-500 mt-1">Suggested files: {collection.files.length} items</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 text-sm"
                                    onClick={() => handleApplySuggestion(collection)}
                                >
                                    Apply
                                </button>
                                <button className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500 text-sm">Dismiss</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-end space-x-4 mt-4">
                <button className="px-5 py-2 bg-gray-600 rounded-md hover:bg-gray-500" onClick={onClose}>Close</button>
                {suggestedCollections.length > 0 && <button className="px-5 py-2 bg-green-600 rounded-md hover:bg-green-700" onClick={() => addNotification({type: 'info', message: 'Applying all suggestions is a future feature!'})}>Apply All</button>}
            </div>
        </div>
    );
};

export const IntegrationsManagerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addNotification } = useNotifications();
    const [dataSources, setDataSources] = useState<DataSource[]>([]);
    const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
    const [webhooks, setWebhooks] = useState<WebhookSubscription[]>([]);
    const [integrations, setIntegrations] = useState<IntegrationManifest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIntegrations = async () => {
            setLoading(true);
            try {
                const [ds, ak, ws, im] = await Promise.all([
                    IntegrationService.listDataSources(),
                    Promise.resolve([]),
                    Promise.resolve([]),
                    IntegrationService.listIntegrations(),
                ]);
                setDataSources(ds);
                setApiKeys(ak);
                setWebhooks(ws);
                setIntegrations(im);
            } catch (error) {
                console.error('Failed to fetch integrations:', error);
                addNotification({ type: 'error', message: 'Failed to load integration data.' });
            } finally {
                setLoading(false);
            }
        };
        fetchIntegrations();
    }, [addNotification]);

    const handleConnectIntegration = useCallback(async (integrationId: string) => {
        addNotification({ type: 'info', message: `Connecting to integration ${integrationId}...` });
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            addNotification({ type: 'success', message: `Successfully connected to ${integrationId}!` });
            TelemetryService.logEvent('integration_connected', { integrationId });
            const updatedIntegrations = await IntegrationService.listIntegrations();
            setIntegrations(updatedIntegrations);
        } catch (error) {
            console.error('Connection failed:', error);
            addNotification({ type: 'error', message: 'Failed to connect integration.' });
        }
    }, [addNotification]);

    return (
        <div className="p-6 max-w-4xl w-full">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
                <i className="ri-plug-fill mr-2 text-blue-400"></i> Integrations & Connectors
            </h2>
            <p className="text-gray-300 mb-6">
                Connect The Great Library to your essential services, external data sources, and custom workflows.
            </p>

            {loading ? (
                <p className="text-center text-gray-400 py-8"><i className="ri-loader-4-line animate-spin mr-2"></i> Loading integrations...</p>
            ) : (
                <div className="space-y-8">
                    {/* Available Integrations */}
                    <div>
                        <h3 className="text-xl font-semibold mb-3">Available Marketplace Integrations</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {integrations.map(integration => (
                                <div key={integration.id} className="bg-gray-700 p-4 rounded-md shadow-inner flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-lg font-bold text-white">{integration.name}</h4>
                                        <p className="text-sm text-gray-400">{integration.description}</p>
                                        <p className="text-xs text-gray-500 mt-2">Provider: {integration.provider} | Version: {integration.version}</p>
                                    </div>
                                    <button
                                        className="mt-3 px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 text-sm self-start"
                                        onClick={() => handleConnectIntegration(integration.id)}
                                    >
                                        <i className="ri-link mr-1"></i> Connect
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Connected Data Sources */}
                    <div>
                        <h3 className="text-xl font-semibold mb-3">Connected Data Sources</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dataSources.map(ds => (
                                <div key={ds.id} className="bg-gray-700 p-4 rounded-md shadow-inner flex justify-between items-center">
                                    <div>
                                        <h4 className="text-lg font-bold text-white">{ds.name}</h4>
                                        <p className="text-sm text-gray-400">Type: {ds.type}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ds.status === 'connected' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                        {ds.status.toUpperCase()}
                                    </span>
                                </div>
                            ))}
                            <button className="flex items-center justify-center p-4 border border-dashed border-gray-600 rounded-md hover:bg-gray-700 transition-colors duration-200 text-gray-400"
                                onClick={() => addNotification({ type: 'info', message: 'Add New Data Source feature coming soon!' })}
                            >
                                <i className="ri-add-line mr-2"></i> Add New Data Source
                            </button>
                        </div>
                    </div>

                    {/* API Keys */}
                    <div>
                        <h3 className="text-xl font-semibold mb-3">API Keys</h3>
                        {apiKeys.length === 0 ? (
                            <p className="text-gray-400">No API keys configured. <button className="text-blue-400 hover:underline" onClick={() => addNotification({type: 'info', message: 'API Key management coming soon!'})}>Generate New Key</button></p>
                        ) : (
                            <div className="space-y-2">
                            </div>
                        )}
                    </div>

                    {/* Webhooks */}
                    <div>
                        <h3 className="text-xl font-semibold mb-3">Webhook Subscriptions</h3>
                        {webhooks.length === 0 ? (
                            <p className="text-gray-400">No web