// google/docs/index.tsx
// The Scribe's Invocation. This summons the Editor, the canvas for inscribing thought.
// Expanded to become the ultimate multi-modal document creation and collaboration universe.

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import Editor from './components/Editor'; // Assuming Editor is now hyper-modular and accepts extensive props/context

// --- GLOBAL TYPE DEFINITIONS & INTERFACES (Simulating google/docs/models/*.ts & google/docs/types/*.ts) ---

export type UserRole = 'owner' | 'editor' | 'viewer' | 'commenter' | 'admin';
export type DocumentStatus = 'draft' | 'published' | 'archived' | 'pending-review';
export type DocumentVisibility = 'private' | 'public' | 'shared';
export type ThemeMode = 'light' | 'dark' | 'sepia' | 'high-contrast';
export type LanguageCode = string; // e.g., 'en-US', 'es-ES', 'fr-FR'
export type NotificationType = 'info' | 'warning' | 'error' | 'success' | 'task';
export type AITaskType = 'summarize' | 'rewrite' | 'generate' | 'proofread' | 'translate' | 'qa';
export type ContentBlockType = 'paragraph' | 'heading' | 'list' | 'image' | 'video' | 'table' | 'code' | 'embed' | 'chart' | 'interactive';
export type BlockId = string;
export type ChangeOperation = 'insert' | 'delete' | 'update';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    preferences: UserPreferences;
    permissions: Record<string, UserRole>; // DocId -> Role
    isAuthenticated: boolean;
}

export interface UserPreferences {
    theme: ThemeMode;
    language: LanguageCode;
    defaultFont: string;
    textSize: 'small' | 'medium' | 'large';
    toolbarLayout: 'compact' | 'extended' | 'custom';
    notificationSettings: Record<NotificationType, boolean>;
    aiAssistantOnByDefault: boolean;
    autoSaveInterval: number; // seconds
}

export interface Comment {
    id: string;
    authorId: string;
    content: string;
    timestamp: string;
    resolved: boolean;
    replies: Comment[];
    targetBlockId?: BlockId;
    selectionRange?: { start: number; end: number }; // Within block text
}

export interface DocumentPermission {
    userId: string;
    role: UserRole;
}

export interface VersionHistoryEntry {
    id: string;
    timestamp: string;
    userId: string;
    description: string;
    snapshotId: string; // Reference to a stored document state
    major: boolean; // Major vs. minor revision
}

export interface ContentBlock {
    id: BlockId;
    type: ContentBlockType;
    content: any; // Could be string, object for image, array for table rows, etc.
    metadata?: Record<string, any>; // e.g., image alt text, code language, heading level
    styles?: Record<string, string>; // Inline styles or class references
    annotations?: Annotation[];
}

export interface Annotation {
    id: string;
    type: 'highlight' | 'strike' | 'commentRef' | 'aiSuggestion';
    start: number;
    end: number;
    data?: Record<string, any>; // e.g., color for highlight, comment ID
    authorId?: string;
    timestamp?: string;
}

export interface RealtimeCursor {
    userId: string;
    userName: string;
    color: string;
    blockId: BlockId;
    position: number;
    selection?: { start: number; end: number };
}

export interface Document {
    id: string;
    title: string;
    ownerId: string;
    createdAt: string;
    lastModified: string;
    status: DocumentStatus;
    visibility: DocumentVisibility;
    content: ContentBlock[];
    permissions: DocumentPermission[];
    tags: string[];
    metadata: Record<string, any>; // Custom metadata, e.g., keywords, abstract, cover image URL
    versionHistory: VersionHistoryEntry[];
    comments: Comment[];
    wordCount: number;
    pageCount: number;
    readTimeMinutes: number;
}

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    timestamp: string;
    read: boolean;
    actionUrl?: string;
    relatedDocId?: string;
}

export interface PluginManifest {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    entryPoint: string; // URL or path to plugin bundle
    permissions: string[]; // e.g., 'read_document', 'write_document', 'access_ai_services'
    configSchema: Record<string, any>;
    enabled: boolean;
}

export interface PluginInstance {
    id: string;
    manifest: PluginManifest;
    settings: Record<string, any>;
    isActive: boolean;
}

export interface AIServiceConfig {
    model: string; // e.g., 'gemini-pro', 'gpt-4'
    temperature: number;
    maxTokens: number;
    customInstructions?: string;
}

export interface ExportOption {
    format: 'pdf' | 'docx' | 'html' | 'markdown' | 'json' | 'epub' | 'latex';
    settings: Record<string, any>; // e.g., 'includeComments', 'watermark'
}

export interface AnalyticsEvent {
    id: string;
    eventType: string; // e.g., 'document_open', 'feature_used', 'export_complete'
    userId: string;
    documentId?: string;
    timestamp: string;
    payload?: Record<string, any>;
}

// --- CORE SERVICE ABSTRACTIONS (Simulating google/docs/services/*.ts & google/docs/api/*.ts) ---

export class AuthService {
    static async getCurrentUser(): Promise<UserProfile | null> {
        // Simulates fetching user data from an API
        console.log('AuthService: Fetching current user...');
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API call
        return {
            id: 'user-123',
            name: 'Alice Developer',
            email: 'alice@example.com',
            avatarUrl: 'https://lh3.googleusercontent.com/a/AGNmyxZ1Q2R3S4T5U6V7W8X9Y0Z',
            preferences: {
                theme: 'dark',
                language: 'en-US',
                defaultFont: 'Roboto',
                textSize: 'medium',
                toolbarLayout: 'extended',
                notificationSettings: { info: true, warning: true, error: true, success: true, task: true },
                aiAssistantOnByDefault: true,
                autoSaveInterval: 60,
            },
            permissions: { 'doc-456': 'owner' },
            isAuthenticated: true,
        };
    }

    static async login(credentials: any): Promise<UserProfile> { console.log('AuthService: Login'); return (await this.getCurrentUser())!; }
    static async logout(): Promise<void> { console.log('AuthService: Logout'); }
    static async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> { console.log('AuthService: Update Profile'); return (await this.getCurrentUser())!; }
}

export class DocumentService {
    static async fetchDocument(id: string): Promise<Document> {
        console.log(`DocumentService: Fetching document ${id}...`);
        await new Promise(resolve => setTimeout(resolve, 200));
        return {
            id,
            title: 'An Epic Saga of Infinite Features',
            ownerId: 'user-123',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            status: 'draft',
            visibility: 'private',
            content: [
                { id: 'block-1', type: 'heading', content: { level: 1, text: 'The Ultimate Document Experience' } },
                { id: 'block-2', type: 'paragraph', content: 'Welcome to the future of content creation, collaboration, and intelligence. This platform is designed to be the single source of truth for all your knowledge work, evolving constantly with AI, user feedback, and an expansive plugin ecosystem.' },
                { id: 'block-3', type: 'image', content: { url: 'https://picsum.photos/800/400', alt: 'Abstract conceptual art' }, metadata: { caption: 'A visual representation of infinite possibilities.' } },
                { id: 'block-4', type: 'paragraph', content: 'Our modular architecture ensures unprecedented extensibility, allowing for seamless integration of new capabilities from AI-driven insights to immersive spatial computing interfaces.' },
                { id: 'block-5', type: 'list', content: { items: ['Real-time co-authoring', 'AI-powered content generation', 'Version history with blockchain notarization', 'Adaptive UI for all devices', 'Integrated multimedia assets', 'Customizable workflows', 'Advanced analytics and insights'] } },
            ],
            permissions: [{ userId: 'user-123', role: 'owner' }],
            tags: ['futuristic', 'ai', 'collaboration', 'docs'],
            metadata: { category: 'Productivity', project: 'Genesis' },
            versionHistory: [],
            comments: [],
            wordCount: 150,
            pageCount: 1,
            readTimeMinutes: 1,
        };
    }

    static async saveDocument(doc: Document): Promise<Document> { console.log('DocumentService: Saving document'); return doc; }
    static async createDocument(title: string, templateId?: string): Promise<Document> { console.log('DocumentService: Creating document'); return (await this.fetchDocument('new-doc-id'))!; }
    static async deleteDocument(id: string): Promise<void> { console.log('DocumentService: Deleting document'); }
    static async updatePermissions(docId: string, permissions: DocumentPermission[]): Promise<void> { console.log('DocumentService: Updating permissions'); }
    static async getVersionHistory(docId: string): Promise<VersionHistoryEntry[]> { console.log('DocumentService: Getting version history'); return []; }
    static async restoreVersion(docId: string, versionId: string): Promise<Document> { console.log('DocumentService: Restoring version'); return (await this.fetchDocument(docId))!; }
    static async exportDocument(docId: string, options: ExportOption): Promise<Blob> { console.log('DocumentService: Exporting document'); return new Blob(); }
    static async importDocument(file: File, format: string): Promise<Document> { console.log('DocumentService: Importing document'); return (await this.fetchDocument('imported-doc-id'))!; }
}

export class CollaborationService {
    private websocket: WebSocket | null = null;
    private documentId: string | null = null;
    private onConnectCallback: () => void = () => {};
    private onDisconnectCallback: () => void = () => {};
    private onCursorUpdateCallback: (cursor: RealtimeCursor) => void = () => {};
    private onChangeCallback: (changes: { blockId: BlockId; operations: ChangeOperation[]; data: any }[]) => void = () => {};

    constructor() {
        // Initialize with default callbacks
    }

    public setCallbacks(
        onConnect: () => void,
        onDisconnect: () => void,
        onCursorUpdate: (cursor: RealtimeCursor) => void,
        onChange: (changes: { blockId: BlockId; operations: ChangeOperation[]; data: any }[]) => void
    ) {
        this.onConnectCallback = onConnect;
        this.onDisconnectCallback = onDisconnect;
        this.onCursorUpdateCallback = onCursorUpdate;
        this.onChangeCallback = onChange;
    }

    public connect(documentId: string, userId: string): void {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.disconnect();
        }
        this.documentId = documentId;
        const wsUrl = `wss://api.docs.google.com/collab?docId=${documentId}&userId=${userId}`;
        this.websocket = new WebSocket(wsUrl);

        this.websocket.onopen = () => {
            console.log('CollaborationService: WebSocket connected.');
            this.onConnectCallback();
        };
        this.websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'cursorUpdate') {
                this.onCursorUpdateCallback(data.payload as RealtimeCursor);
            } else if (data.type === 'documentChange') {
                this.onChangeCallback(data.payload);
            } else if (data.type === 'commentAdded' || data.type === 'commentResolved') {
                // Trigger document context refresh or specific comment update
            }
        };
        this.websocket.onclose = () => {
            console.log('CollaborationService: WebSocket disconnected.');
            this.onDisconnectCallback();
            // Implement reconnect logic
        };
        this.websocket.onerror = (error) => {
            console.error('CollaborationService: WebSocket error:', error);
        };
    }

    public disconnect(): void {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
            this.documentId = null;
        }
    }

    public sendCursorUpdate(cursor: Omit<RealtimeCursor, 'userId' | 'userName' | 'color'>): void {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({ type: 'cursorUpdate', payload: cursor }));
        }
    }

    public sendDocumentChanges(changes: { blockId: BlockId; operations: ChangeOperation[]; data: any }[]): void {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({ type: 'documentChange', payload: changes }));
        }
    }

    static async addComment(docId: string, comment: Omit<Comment, 'id' | 'timestamp' | 'replies'>): Promise<Comment> { console.log('CollaborationService: Adding comment'); return { ...comment, id: 'c-1', timestamp: new Date().toISOString(), replies: [] }; }
    static async resolveComment(docId: string, commentId: string): Promise<void> { console.log('CollaborationService: Resolving comment'); }
    static async getRealtimeUsers(docId: string): Promise<UserProfile[]> { console.log('CollaborationService: Getting realtime users'); return []; }
}
export const collaborationServiceInstance = new CollaborationService(); // Singleton instance

export class AIService {
    static async processDocument(docId: string, task: AITaskType, config: AIServiceConfig, context?: any): Promise<any> {
        console.log(`AIService: Processing document ${docId} with task ${task}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        switch (task) {
            case 'summarize': return { summary: 'This document presents a groundbreaking vision for an advanced, AI-powered document editor, emphasizing modularity, collaboration, and a vast feature set.' };
            case 'rewrite': return { rewrittenContent: 'The platform is engineered to offer an unparalleled document editing experience, leveraging artificial intelligence for content generation and refinement.' };
            case 'generate': return { generatedContent: { id: 'ai-block-1', type: 'paragraph', content: 'In the vast expanse of digital creation, a new paradigm emerges, transforming raw thought into structured brilliance.' } };
            case 'proofread': return { suggestions: [{ type: 'grammar', text: 'This platform is designed...', suggestion: 'This platform has been designed...', blockId: 'block-2' }] };
            case 'translate': return { translatedContent: '¡Bienvenido al futuro de la creación de contenido!' };
            case 'qa': return { answer: 'The core vision is to build the world\'s largest and best document application.' };
            default: return { error: 'Unknown AI task' };
        }
    }

    static async generateContentBlock(prompt: string, type: ContentBlockType, config: AIServiceConfig): Promise<ContentBlock> {
        console.log(`AIService: Generating content block for prompt: "${prompt}"`);
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
            id: `ai-gen-${Date.now()}`,
            type,
            content: `AI-generated content based on "${prompt}".`,
            metadata: { aiModel: config.model, generatedAt: new Date().toISOString() }
        };
    }

    static async contextualAutocomplete(blockId: BlockId, partialText: string, contextBlocks: ContentBlock[]): Promise<string[]> {
        console.log(`AIService: Contextual autocomplete for "${partialText}"`);
        await new Promise(resolve => setTimeout(resolve, 100));
        return [`${partialText} experience`, `${partialText} workflow`, `${partialText} integration`];
    }
}

export class PluginManagerService {
    private installedPlugins: PluginInstance[] = [];

    constructor() {
        // Load initial plugins, perhaps from local storage or API
        this.installedPlugins = [{
            id: 'plugin-spellcheck',
            manifest: { id: 'plugin-spellcheck', name: 'Advanced Spell & Grammar Check', version: '1.0.0', description: 'Real-time spell checking and grammar suggestions.', author: 'Google', entryPoint: '/plugins/spellcheck.js', permissions: ['read_document'], configSchema: {} },
            settings: {},
            isActive: true,
        }];
    }

    async getAvailablePlugins(): Promise<PluginManifest[]> {
        console.log('PluginManagerService: Fetching available plugins...');
        await new Promise(resolve => setTimeout(resolve, 150));
        return [
            { id: 'plugin-seo', name: 'SEO Optimizer', version: '1.1.0', description: 'Analyze and optimize document for search engines.', author: 'Google', entryPoint: '/plugins/seo.js', permissions: ['read_document', 'access_ai_services'], configSchema: {} },
            { id: 'plugin-diagrams', name: 'Diagramming Tool', version: '2.0.0', description: 'Embed interactive diagrams and flowcharts.', author: 'Diagrams Inc.', entryPoint: '/plugins/diagrams.js', permissions: ['write_document'], configSchema: {} },
            ...this.installedPlugins.map(p => p.manifest) // Include installed ones
        ];
    }

    async installPlugin(manifest: PluginManifest): Promise<PluginInstance> {
        console.log(`PluginManagerService: Installing plugin ${manifest.name}`);
        const newInstance: PluginInstance = { id: `inst-${manifest.id}-${Date.now()}`, manifest, settings: {}, isActive: true };
        this.installedPlugins.push(newInstance);
        // Simulate loading plugin script
        return newInstance;
    }

    async uninstallPlugin(instanceId: string): Promise<void> {
        console.log(`PluginManagerService: Uninstalling plugin ${instanceId}`);
        this.installedPlugins = this.installedPlugins.filter(p => p.id !== instanceId);
    }

    async updatePluginSettings(instanceId: string, settings: Record<string, any>): Promise<void> {
        console.log(`PluginManagerService: Updating settings for plugin ${instanceId}`);
        const plugin = this.installedPlugins.find(p => p.id === instanceId);
        if (plugin) { plugin.settings = { ...plugin.settings, ...settings }; }
    }

    getEnabledPlugins(): PluginInstance[] {
        return this.installedPlugins.filter(p => p.isActive);
    }

    // This would likely involve dynamic script loading and sandboxing in a real app
    executePluginAction(pluginId: string, actionName: string, payload: any): Promise<any> {
        console.log(`PluginManagerService: Executing action "${actionName}" for plugin "${pluginId}"`);
        // Placeholder for actual plugin execution logic
        return Promise.resolve({ success: true, result: `Action ${actionName} from ${pluginId} processed.` });
    }
}
export const pluginManagerServiceInstance = new PluginManagerService(); // Singleton instance

export class NotificationService {
    private listeners: ((notification: Notification) => void)[] = [];
    private notifications: Notification[] = [];

    public subscribe(listener: (notification: Notification) => void): () => void {
        this.listeners.push(listener);
        return () => { this.listeners = this.listeners.filter(l => l !== listener); };
    }

    public publish(notification: Notification): void {
        this.notifications.push(notification);
        this.listeners.forEach(listener => listener(notification));
        console.log('NotificationService: Published', notification);
    }

    public getNotifications(): Notification[] { return this.notifications; }
    public markAsRead(id: string): void {
        const notif = this.notifications.find(n => n.id === id);
        if (notif) notif.read = true;
    }
}
export const notificationServiceInstance = new NotificationService(); // Singleton instance

export class AnalyticsService {
    static async trackEvent(event: AnalyticsEvent): Promise<void> {
        console.log('AnalyticsService: Tracking event', event.eventType, event.payload);
        // Simulate sending to analytics backend
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    static async getDocumentInsights(docId: string): Promise<any> {
        console.log('AnalyticsService: Getting document insights');
        await new Promise(resolve => setTimeout(resolve, 200));
        return {
            engagementScore: 0.85,
            topContributors: [{ userId: 'user-123', contributions: 120 }],
            readabilityScore: 72,
            sentiment: 'positive',
            popularSections: ['block-1', 'block-5'],
        };
    }

    static async getUserActivity(userId: string): Promise<any[]> {
        console.log('AnalyticsService: Getting user activity');
        await new Promise(resolve => setTimeout(resolve, 200));
        return [{ eventType: 'document_created', timestamp: new Date().toISOString() }];
    }
}

export class BlockchainService {
    static async notarizeDocumentVersion(docId: string, versionId: string, hash: string): Promise<{ transactionId: string; timestamp: string }> {
        console.log(`BlockchainService: Notarizing document version ${versionId} with hash ${hash}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { transactionId: `tx-${Date.now()}`, timestamp: new Date().toISOString() };
    }

    static async verifyDocumentIntegrity(docId: string, versionId: string, transactionId: string): Promise<boolean> {
        console.log(`BlockchainService: Verifying document integrity for ${docId}/${versionId} via ${transactionId}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        // In a real scenario, this would query the blockchain
        return true;
    }
}

export class AssetManagementService {
    static async uploadAsset(file: File, docId: string): Promise<{ url: string; id: string }> {
        console.log(`AssetManagementService: Uploading asset ${file.name} for document ${docId}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return { url: `https://cdn.docs.google.com/assets/${docId}/${Date.now()}/${file.name}`, id: `asset-${Date.now()}` };
    }

    static async listDocumentAssets(docId: string): Promise<{ url: string; id: string; filename: string; type: string }[]> {
        console.log(`AssetManagementService: Listing assets for document ${docId}`);
        await new Promise(resolve => setTimeout(resolve, 200));
        return [{ url: 'https://picsum.photos/800/400', id: 'asset-1', filename: 'placeholder.jpg', type: 'image' }];
    }
}

// --- REACT CONTEXTS FOR GLOBAL STATE & SERVICES ---

export const AuthContext = createContext<{
    user: UserProfile | null;
    isLoading: boolean;
    login: (credentials: any) => Promise<void>;
    logout: () => Promise<void>;
    updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
}>({
    user: null,
    isLoading: true,
    login: async () => {},
    logout: async () => {},
    updatePreferences: async () => {},
});

export const ThemeContext = createContext<{
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    applyTheme: (mode: ThemeMode) => void;
}>({
    themeMode: 'light',
    setThemeMode: () => {},
    applyTheme: () => {},
});

export const DocumentContext = createContext<{
    document: Document | null;
    isLoading: boolean;
    error: string | null;
    saveDocument: (doc: Document) => Promise<void>;
    updateContentBlock: (blockId: BlockId, newContent: Partial<ContentBlock>) => void;
    addContentBlock: (block: ContentBlock, afterBlockId?: BlockId) => void;
    deleteContentBlock: (blockId: BlockId) => void;
    addComment: (comment: Omit<Comment, 'id' | 'timestamp' | 'replies'>) => Promise<void>;
    realtimeCursors: RealtimeCursor[];
    sendCursorUpdate: (cursor: Omit<RealtimeCursor, 'userId' | 'userName' | 'color'>) => void;
    collabStatus: 'connecting' | 'connected' | 'disconnected';
    getDocumentPermissions: () => DocumentPermission[];
    hasPermission: (permission: UserRole) => boolean;
}>({
    document: null,
    isLoading: true,
    error: null,
    saveDocument: async () => {},
    updateContentBlock: () => {},
    addContentBlock: () => {},
    deleteContentBlock: () => {},
    addComment: async () => {},
    realtimeCursors: [],
    sendCursorUpdate: () => {},
    collabStatus: 'disconnected',
    getDocumentPermissions: () => [],
    hasPermission: () => false,
});

export const AIServiceContext = createContext<{
    aiService: typeof AIService;
    defaultConfig: AIServiceConfig;
    availableModels: string[];
    updateDefaultConfig: (config: Partial<AIServiceConfig>) => void;
}>({
    aiService: AIService,
    defaultConfig: { model: 'gemini-pro', temperature: 0.7, maxTokens: 500 },
    availableModels: ['gemini-pro', 'gpt-4', 'claude-3'],
    updateDefaultConfig: () => {},
});

export const PluginContext = createContext<{
    pluginManager: typeof pluginManagerServiceInstance;
    installedPlugins: PluginInstance[];
    availablePlugins: PluginManifest[];
    installPlugin: (manifest: PluginManifest) => Promise<void>;
    uninstallPlugin: (instanceId: string) => Promise<void>;
    updatePluginSettings: (instanceId: string, settings: Record<string, any>) => Promise<void>;
    executePluginAction: (pluginId: string, actionName: string, payload: any) => Promise<any>;
}>({
    pluginManager: pluginManagerServiceInstance,
    installedPlugins: [],
    availablePlugins: [],
    installPlugin: async () => {},
    uninstallPlugin: async () => {},
    updatePluginSettings: async () => {},
    executePluginAction: async () => {},
});

export const NotificationContext = createContext<{
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markNotificationAsRead: (id: string) => void;
    unreadCount: number;
}>({
    notifications: [],
    addNotification: () => {},
    markNotificationAsRead: () => {},
    unreadCount: 0,
});

// --- PROVIDER COMPONENTS ---

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await AuthService.getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.error('Failed to fetch user:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    const login = useCallback(async (credentials: any) => {
        setIsLoading(true);
        try {
            const loggedInUser = await AuthService.login(credentials);
            setUser(loggedInUser);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await AuthService.logout();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updatePreferences = useCallback(async (prefs: Partial<UserPreferences>) => {
        if (!user) return;
        const updatedUser = { ...user, preferences: { ...user.preferences, ...prefs } };
        setUser(updatedUser);
        await AuthService.updateProfile(updatedUser); // Update on backend
    }, [user]);

    const value = useMemo(() => ({ user, isLoading, login, logout, updatePreferences }), [user, isLoading, login, logout, updatePreferences]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [themeMode, setThemeMode] = useState<ThemeMode>(user?.preferences.theme || 'light');

    useEffect(() => {
        if (user) {
            setThemeMode(user.preferences.theme);
        }
    }, [user]);

    const applyTheme = useCallback((mode: ThemeMode) => {
        document.documentElement.setAttribute('data-theme', mode); // Apply CSS variable theme
        // Additional theme logic, e.g., dynamically load stylesheets
    }, []);

    useEffect(() => {
        applyTheme(themeMode);
    }, [themeMode, applyTheme]);

    const value = useMemo(() => ({ themeMode, setThemeMode, applyTheme }), [themeMode, setThemeMode, applyTheme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const DocumentProvider: React.FC<{ docId: string; children: React.ReactNode }> = ({ docId, children }) => {
    const { user } = useContext(AuthContext);
    const [document, setDocument] = useState<Document | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [realtimeCursors, setRealtimeCursors] = useState<RealtimeCursor[]>([]);
    const [collabStatus, setCollabStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
    const notificationContext = useContext(NotificationContext);

    const docRef = useRef(document); // For use in `onChange` callback
    useEffect(() => { docRef.current = document; }, [document]);

    const handleCollabConnect = useCallback(() => {
        setCollabStatus('connected');
        notificationContext.addNotification({ type: 'success', message: 'Real-time collaboration enabled!' });
    }, [notificationContext]);

    const handleCollabDisconnect = useCallback(() => {
        setCollabStatus('disconnected');
        setRealtimeCursors([]); // Clear cursors on disconnect
        notificationContext.addNotification({ type: 'warning', message: 'Collaboration disconnected. Reconnecting...' });
    }, [notificationContext]);

    const handleCursorUpdate = useCallback((cursor: RealtimeCursor) => {
        setRealtimeCursors(prev => {
            const existing = prev.filter(c => c.userId !== cursor.userId);
            return [...existing, cursor];
        });
    }, []);

    const handleDocumentChange = useCallback((changes: { blockId: BlockId; operations: ChangeOperation[]; data: any }[]) => {
        setDocument(prevDoc => {
            if (!prevDoc) return null;
            let newContent = [...prevDoc.content];
            // In a real app, apply changes more granularly
            console.log('Applying real-time changes:', changes);
            return { ...prevDoc, content: newContent }; // Simplified: for demo, assume editor handles
        });
    }, []);

    useEffect(() => {
        if (user && docId) {
            collaborationServiceInstance.setCallbacks(handleCollabConnect, handleCollabDisconnect, handleCursorUpdate, handleDocumentChange);
            collaborationServiceInstance.connect(docId, user.id);
        }

        return () => {
            collaborationServiceInstance.disconnect();
        };
    }, [docId, user, handleCollabConnect, handleCollabDisconnect, handleCursorUpdate, handleDocumentChange]);

    const fetchDocument = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedDoc = await DocumentService.fetchDocument(docId);
            setDocument(fetchedDoc);
        } catch (err: any) {
            setError(err.message || 'Failed to load document');
            notificationContext.addNotification({ type: 'error', message: `Failed to load document: ${err.message}` });
        } finally {
            setIsLoading(false);
        }
    }, [docId, notificationContext]);

    useEffect(() => {
        fetchDocument();
    }, [fetchDocument]);

    const saveDocument = useCallback(async (doc: Document) => {
        if (!user) {
            notificationContext.addNotification({ type: 'warning', message: 'You must be logged in to save.' });
            return;
        }
        if (!hasPermission('editor') && !hasPermission('owner')) {
            notificationContext.addNotification({ type: 'warning', message: 'You do not have permission to save this document.' });
            return;
        }
        try {
            const savedDoc = await DocumentService.saveDocument(doc);
            setDocument(savedDoc);
            notificationContext.addNotification({ type: 'success', message: 'Document saved successfully!' });
        } catch (err: any) {
            setError(err.message || 'Failed to save document');
            notificationContext.addNotification({ type: 'error', message: `Failed to save document: ${err.message}` });
        }
    }, [user, notificationContext]);

    const updateContentBlock = useCallback((blockId: BlockId, newContent: Partial<ContentBlock>) => {
        setDocument(prevDoc => {
            if (!prevDoc) return prevDoc;
            const updatedContent = prevDoc.content.map(block =>
                block.id === blockId ? { ...block, ...newContent } : block
            );
            // Simulate sending changes to collaboration service
            collaborationServiceInstance.sendDocumentChanges([{ blockId, operations: ['update'], data: newContent }]);
            return { ...prevDoc, content: updatedContent, lastModified: new Date().toISOString() };
        });
    }, []);

    const addContentBlock = useCallback((block: ContentBlock, afterBlockId?: BlockId) => {
        setDocument(prevDoc => {
            if (!prevDoc) return prevDoc;
            const newContent = [...prevDoc.content];
            const insertIndex = afterBlockId ? newContent.findIndex(b => b.id === afterBlockId) + 1 : newContent.length;
            newContent.splice(insertIndex, 0, block);
            collaborationServiceInstance.sendDocumentChanges([{ blockId: block.id, operations: ['insert'], data: block }]);
            return { ...prevDoc, content: newContent, lastModified: new Date().toISOString() };
        });
    }, []);

    const deleteContentBlock = useCallback((blockId: BlockId) => {
        setDocument(prevDoc => {
            if (!prevDoc) return prevDoc;
            const newContent = prevDoc.content.filter(block => block.id !== blockId);
            collaborationServiceInstance.sendDocumentChanges([{ blockId, operations: ['delete'], data: null }]);
            return { ...prevDoc, content: newContent, lastModified: new Date().toISOString() };
        });
    }, []);

    const addComment = useCallback(async (comment: Omit<Comment, 'id' | 'timestamp' | 'replies'>) => {
        if (!document) return;
        const newComment = await CollaborationService.addComment(document.id, comment);
        setDocument(prevDoc => {
            if (!prevDoc) return prevDoc;
            return { ...prevDoc, comments: [...prevDoc.comments, newComment] };
        });
        notificationContext.addNotification({ type: 'info', message: 'Comment added!' });
    }, [document, notificationContext]);

    const getDocumentPermissions = useCallback((): DocumentPermission[] => {
        return document?.permissions || [];
    }, [document]);

    const hasPermission = useCallback((role: UserRole): boolean => {
        if (!user || !document) return false;
        const userPermission = document.permissions.find(p => p.userId === user.id);
        if (!userPermission) return false;

        const roleOrder: UserRole[] = ['viewer', 'commenter', 'editor', 'owner', 'admin'];
        const requiredIndex = roleOrder.indexOf(role);
        const userIndex = roleOrder.indexOf(userPermission.role);
        return userIndex >= requiredIndex;
    }, [user, document]);

    const sendCursorUpdate = useCallback((cursor: Omit<RealtimeCursor, 'userId' | 'userName' | 'color'>) => {
        if (user) {
            const userCursor: RealtimeCursor = { ...cursor, userId: user.id, userName: user.name, color: user.preferences.theme === 'dark' ? '#8be9fd' : '#bd93f9' }; // Example color
            collaborationServiceInstance.sendCursorUpdate(userCursor);
        }
    }, [user]);

    const value = useMemo(() => ({
        document, isLoading, error, saveDocument,
        updateContentBlock, addContentBlock, deleteContentBlock, addComment,
        realtimeCursors, sendCursorUpdate, collabStatus,
        getDocumentPermissions, hasPermission,
    }), [
        document, isLoading, error, saveDocument,
        updateContentBlock, addContentBlock, deleteContentBlock, addComment,
        realtimeCursors, sendCursorUpdate, collabStatus,
        getDocumentPermissions, hasPermission,
    ]);

    return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>;
};

export const AIServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [defaultConfig, setDefaultConfig] = useState<AIServiceConfig>({ model: 'gemini-pro', temperature: 0.7, maxTokens: 500 });
    const availableModels = ['gemini-pro', 'gpt-4', 'claude-3', 'llama-3'];

    const updateDefaultConfig = useCallback((config: Partial<AIServiceConfig>) => {
        setDefaultConfig(prev => ({ ...prev, ...config }));
    }, []);

    const value = useMemo(() => ({
        aiService: AIService,
        defaultConfig,
        availableModels,
        updateDefaultConfig,
    }), [defaultConfig]);

    return <AIServiceContext.Provider value={value}>{children}</AIServiceContext.Provider>;
};

export const PluginProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [installedPlugins, setInstalledPlugins] = useState<PluginInstance[]>([]);
    const [availablePlugins, setAvailablePlugins] = useState<PluginManifest[]>([]);
    const notificationContext = useContext(NotificationContext);

    useEffect(() => {
        const fetchPlugins = async () => {
            const installed = pluginManagerServiceInstance.getEnabledPlugins();
            setInstalledPlugins(installed);
            const available = await pluginManagerServiceInstance.getAvailablePlugins();
            setAvailablePlugins(available);
        };
        fetchPlugins();
    }, []);

    const installPlugin = useCallback(async (manifest: PluginManifest) => {
        try {
            const newInstance = await pluginManagerServiceInstance.installPlugin(manifest);
            setInstalledPlugins(prev => [...prev, newInstance]);
            notificationContext.addNotification({ type: 'success', message: `${manifest.name} installed!` });
        } catch (error: any) {
            notificationContext.addNotification({ type: 'error', message: `Failed to install ${manifest.name}: ${error.message}` });
        }
    }, [notificationContext]);

    const uninstallPlugin = useCallback(async (instanceId: string) => {
        try {
            await pluginManagerServiceInstance.uninstallPlugin(instanceId);
            setInstalledPlugins(prev => prev.filter(p => p.id !== instanceId));
            notificationContext.addNotification({ type: 'info', message: 'Plugin uninstalled.' });
        } catch (error: any) {
            notificationContext.addNotification({ type: 'error', message: `Failed to uninstall plugin: ${error.message}` });
        }
    }, [notificationContext]);

    const updatePluginSettings = useCallback(async (instanceId: string, settings: Record<string, any>) => {
        try {
            await pluginManagerServiceInstance.updatePluginSettings(instanceId, settings);
            setInstalledPlugins(prev => prev.map(p => p.id === instanceId ? { ...p, settings: { ...p.settings, ...settings } } : p));
            notificationContext.addNotification({ type: 'success', message: 'Plugin settings updated.' });
        } catch (error: any) {
            notificationContext.addNotification({ type: 'error', message: `Failed to update plugin settings: ${error.message}` });
        }
    }, [notificationContext]);

    const executePluginAction = useCallback(async (pluginId: string, actionName: string, payload: any) => {
        try {
            const result = await pluginManagerServiceInstance.executePluginAction(pluginId, actionName, payload);
            notificationContext.addNotification({ type: 'info', message: `Plugin action "${actionName}" completed.` });
            return result;
        } catch (error: any) {
            notificationContext.addNotification({ type: 'error', message: `Plugin action "${actionName}" failed: ${error.message}` });
            throw error;
        }
    }, [notificationContext]);

    const value = useMemo(() => ({
        pluginManager: pluginManagerServiceInstance,
        installedPlugins,
        availablePlugins,
        installPlugin,
        uninstallPlugin,
        updatePluginSettings,
        executePluginAction,
    }), [installedPlugins, availablePlugins, installPlugin, uninstallPlugin, updatePluginSettings, executePluginAction]);

    return <PluginContext.Provider value={value}>{children}</PluginContext.Provider>;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    useEffect(() => {
        const unsubscribe = notificationServiceInstance.subscribe(newNotification => {
            setNotifications(prev => [...prev, { ...newNotification, id: `notif-${Date.now()}`, timestamp: new Date().toISOString(), read: false }]);
        });
        return () => unsubscribe();
    }, []);

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        notificationServiceInstance.publish(notification as Notification); // Delegate to service
    }, []);

    const markNotificationAsRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        notificationServiceInstance.markAsRead(id);
    }, []);

    const value = useMemo(() => ({ notifications, addNotification, markNotificationAsRead, unreadCount }), [notifications, addNotification, markNotificationAsRead, unreadCount]);

    return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};


// --- ADVANCED UI COMPONENTS (Conceptual, would be in google/docs/components/* in a real app) ---

// Exported for potential external consumption, representing core UI concepts
export const GlobalCommandPalette: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const { document, saveDocument } = useContext(DocumentContext);
    const { aiService, defaultConfig } = useContext(AIServiceContext);
    const { pluginManager, executePluginAction } = useContext(PluginContext);
    const { addNotification } = useContext(NotificationContext);

    const commands = useMemo(() => [
        { id: 'save', name: 'Save Document', icon: '💾', action: () => document && saveDocument(document) },
        { id: 'ai-summarize', name: 'AI: Summarize Document', icon: '✨', action: async () => document && addNotification({ type: 'info', message: (await aiService.processDocument(document.id, 'summarize', defaultConfig)).summary }) },
        { id: 'ai-generate-block', name: 'AI: Generate New Block', icon: '📝', action: () => { /* prompt for content */ } },
        { id: 'version-history', name: 'Open Version History', icon: '🕰️', action: () => console.log('Opening Version History...') },
        { id: 'plugin-manager', name: 'Open Plugin Manager', icon: '🧩', action: () => console.log('Opening Plugin Manager...') },
        { id: 'export-pdf', name: 'Export as PDF', icon: '📄', action: async () => document && await DocumentService.exportDocument(document.id, { format: 'pdf' }) },
        ...pluginManager.getEnabledPlugins().flatMap(p => ([
            { id: `plugin-${p.id}-action1`, name: `${p.manifest.name}: Action 1`, icon: '⚙️', action: () => executePluginAction(p.id, 'action1', { docId: document?.id }) },
        ]))
    ], [document, saveDocument, aiService, defaultConfig, pluginManager, executePluginAction, addNotification]);

    const filteredCommands = useMemo(() =>
        commands.filter(cmd => cmd.name.toLowerCase().includes(query.toLowerCase())),
        [commands, query]
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
                if (!isOpen) setQuery('');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh' }}>
            <div style={{ background: 'var(--background-color)', color: 'var(--text-color)', borderRadius: '8px', width: '600px', maxHeight: '70vh', overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                <input
                    type="text"
                    placeholder="Search commands..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                    style={{ width: '100%', padding: '15px', border: 'none', borderBottom: '1px solid var(--border-color)', outline: 'none', background: 'var(--background-color)', color: 'var(--text-color)', fontSize: '1.1em' }}
                />
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {filteredCommands.length > 0 ? filteredCommands.map(cmd => (
                        <li key={cmd.id} onClick={() => { cmd.action(); setIsOpen(false); }} style={{ padding: '12px 15px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.2em' }}>{cmd.icon}</span>
                            <span>{cmd.name}</span>
                        </li>
                    )) : (
                        <li style={{ padding: '15px', textAlign: 'center', color: 'var(--text-secondary-color)' }}>No commands found.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};
export const CollaborationPanel: React.FC = () => {
    const { document, realtimeCursors, collabStatus } = useContext(DocumentContext);
    const { user } = useContext(AuthContext);

    if (!document) return null;

    const currentUsers = useMemo(() => {
        const uniqueUserIds = new Set(realtimeCursors.map(c => c.userId));
        // In a real app, fetch full user profiles for these IDs
        return Array.from(uniqueUserIds).map(userId => ({
            id: userId,
            name: realtimeCursors.find(c => c.userId === userId)?.userName || `User ${userId.substring(0, 4)}`,
            color: realtimeCursors.find(c => c.userId === userId)?.color || 'grey',
            isSelf: userId === user?.id
        }));
    }, [realtimeCursors, user?.id]);

    return (
        <div style={{ width: '250px', borderLeft: '1px solid var(--border-color)', padding: '15px', overflowY: 'auto', background: 'var(--background-secondary-color)', color: 'var(--text-color)' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2em' }}>Collaborators ({currentUsers.length})</h3>
            <p style={{ fontSize: '0.9em', color: 'var(--text-secondary-color)' }}>Status: <span style={{ color: collabStatus === 'connected' ? 'green' : 'orange' }}>{collabStatus}</span></p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '15px 0' }}>
                {currentUsers.map(u => (
                    <li key={u.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontWeight: u.isSelf ? 'bold' : 'normal' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: u.color, marginRight: '8px' }}></span>
                        {u.name} {u.isSelf && '(You)'}
                    </li>
                ))}
            </ul>

            <h3 style={{ margin: '20px 0 15px 0', fontSize: '1.2em' }}>Comments ({document.comments.length})</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {document.comments.length === 0 ? (
                    <p style={{ fontSize: '0.9em', color: 'var(--text-secondary-color)' }}>No comments yet.</p>
                ) : (
                    document.comments.map(comment => (
                        <div key={comment.id} style={{ border: '1px solid var(--border-color)', borderRadius: '5px', padding: '10px', marginBottom: '10px', background: 'var(--background-color)', opacity: comment.resolved ? 0.6 : 1 }}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.9em', fontWeight: 'bold' }}>{comment.authorId}</p>
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.9em' }}>{comment.content}</p>
                            <span style={{ fontSize: '0.7em', color: 'var(--text-secondary-color)' }}>{new Date(comment.timestamp).toLocaleDateString()}</span>
                            {comment.resolved && <span style={{ marginLeft: '10px', fontSize: '0.7em', color: 'green' }}>Resolved</span>}
                            {/* Add reply and resolve actions */}
                        </div>
                    ))
                )}
            </div>
            {/* Add comment input area */}
        </div>
    );
};
export const AISidebar: React.FC = () => {
    const { document, updateContentBlock, addContentBlock } = useContext(DocumentContext);
    const { aiService, defaultConfig, updateDefaultConfig, availableModels } = useContext(AIServiceContext);
    const [aiTask, setAiTask] = useState<AITaskType>('summarize');
    const [aiPrompt, setAiPrompt] = useState<string>('');
    const [aiOutput, setAiOutput] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const { addNotification } = useContext(NotificationContext);

    const handleAITask = useCallback(async () => {
        if (!document) return;
        setIsGenerating(true);
        setAiOutput('');
        try {
            switch (aiTask) {
                case 'summarize': {
                    const result = await aiService.processDocument(document.id, 'summarize', defaultConfig);
                    setAiOutput(result.summary);
                    break;
                }
                case 'rewrite': {
                    const result = await aiService.processDocument(document.id, 'rewrite', defaultConfig, { selection: 'current block' }); // Assume selection context
                    setAiOutput(result.rewrittenContent);
                    break;
                }
                case 'generate': {
                    const generatedBlock = await aiService.generateContentBlock(aiPrompt, 'paragraph', defaultConfig);
                    addContentBlock(generatedBlock);
                    setAiOutput(`Generated block added to document: "${generatedBlock.content}"`);
                    break;
                }
                case 'proofread': {
                    const result = await aiService.processDocument(document.id, 'proofread', defaultConfig);
                    setAiOutput(JSON.stringify(result.suggestions, null, 2));
                    addNotification({type: 'info', message: `Found ${result.suggestions.length} suggestions.`})
                    break;
                }
                default:
                    setAiOutput('Selected AI task not implemented for demo.');
            }
        } catch (error: any) {
            setAiOutput(`Error: ${error.message}`);
            addNotification({type: 'error', message: `AI task failed: ${error.message}`})
        } finally {
            setIsGenerating(false);
        }
    }, [aiTask, aiPrompt, document, aiService, defaultConfig, addContentBlock, addNotification]);

    return (
        <div style={{ width: '300px', borderLeft: '1px solid var(--border-color)', padding: '15px', overflowY: 'auto', background: 'var(--background-secondary-color)', color: 'var(--text-color)' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2em' }}>AI Assistant</h3>

            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>AI Model:</label>
                <select value={defaultConfig.model} onChange={(e) => updateDefaultConfig({ model: e.target.value })} style={{ width: '100%', padding: '8px', background: 'var(--background-color)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-color)' }}>
                    {availableModels.map(model => (
                        <option key={model} value={model}>{model}</option>
                    ))}
                </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Task:</label>
                <select value={aiTask} onChange={(e) => setAiTask(e.target.value as AITaskType)} style={{ width: '100%', padding: '8px', background: 'var(--background-color)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-color)' }}>
                    <option value="summarize">Summarize Document</option>
                    <option value="rewrite">Rewrite Selection</option>
                    <option value="generate">Generate Content</option>
                    <option value="proofread">Proofread Document</option>
                    <option value="translate">Translate</option>
                    <option value="qa">Q&A</option>
                </select>
            </div>

            {aiTask === 'generate' && (
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Prompt:</label>
                    <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g., 'Write a paragraph about the benefits of modular software design.'"
                        rows={3}
                        style={{ width: '100%', padding: '8px', background: 'var(--background-color)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-color)' }}
                    />
                </div>
            )}

            <button
                onClick={handleAITask}
                disabled={isGenerating || !document}
                style={{ width: '100%', padding: '10px 15px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1em' }}
            >
                {isGenerating ? 'Processing...' : `Run AI ${aiTask === 'generate' ? 'Generation' : 'Task'}`}
            </button>

            {aiOutput && (
                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1em' }}>AI Output:</h4>
                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: 'var(--background-color)', padding: '10px', borderRadius: '4px', fontSize: '0.9em', color: 'var(--text-color)' }}>
                        {aiOutput}
                    </pre>
                </div>
            )}
        </div>
    );
};
export const NotificationCenter: React.FC = () => {
    const { notifications, markNotificationAsRead, unreadCount } = useContext(NotificationContext);
    const [isOpen, setIsOpen] = useState(false);

    if (notifications.length === 0 && !isOpen) return null;

    return (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 900 }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    fontSize: '1.2em',
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    position: 'relative',
                }}
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7em', fontWeight: 'bold' }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{ position: 'absolute', bottom: '60px', right: 0, width: '350px', maxHeight: '400px', overflowY: 'auto', background: 'var(--background-color)', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', padding: '15px', color: 'var(--text-color)' }}>
                    <h4 style={{ margin: '0 0 15px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Notifications</h4>
                    {notifications.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary-color)' }}>No notifications.</p>
                    ) : (
                        <ul>
                            {notifications.map(n => (
                                <li key={n.id} style={{ marginBottom: '10px', padding: '10px', background: n.read ? 'var(--background-secondary-color)' : 'var(--accent-color-light)', borderRadius: '5px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <strong style={{ color: n.read ? 'var(--text-secondary-color)' : 'var(--text-color)' }}>{n.type.toUpperCase()}</strong>
                                        {!n.read && (
                                            <button onClick={() => markNotificationAsRead(n.id)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.8em' }}>Mark Read</button>
                                        )}
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.9em' }}>{n.message}</p>
                                    <span style={{ fontSize: '0.7em', color: 'var(--text-secondary-color)' }}>{new Date(n.timestamp).toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};
export const GlobalSearchPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]); // Results could be documents, blocks, comments, etc.
    const [isLoading, setIsLoading] = useState(false);
    const { document } = useContext(DocumentContext);

    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery) {
            setResults([]);
            return;
        }
        setIsLoading(true);
        // Simulate a global search API call
        await new Promise(resolve => setTimeout(resolve, 300));
        setResults([
            { id: 'res-1', type: 'document', title: 'Found in current doc', snippet: `The document contains "${searchQuery}"...` },
            { id: 'res-2', type: 'block', title: 'Matching block content', snippet: `Block-3: image content with "${searchQuery}" keyword` },
        ]);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
                e.preventDefault();
                setIsOpen(true);
            } else if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    useEffect(() => {
        const handler = setTimeout(() => {
            performSearch(query);
        }, 200);
        return () => clearTimeout(handler);
    }, [query, performSearch]);

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh' }}>
            <div style={{ background: 'var(--background-color)', color: 'var(--text-color)', borderRadius: '8px', width: '800px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                <input
                    type="text"
                    placeholder="Search across all documents, content, and comments..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                    style={{ width: '100%', padding: '15px', border: 'none', borderBottom: '1px solid var(--border-color)', outline: 'none', background: 'var(--background-color)', color: 'var(--text-color)', fontSize: '1.1em' }}
                />
                <div style={{ padding: '15px' }}>
                    {isLoading ? (
                        <p>Searching...</p>
                    ) : results.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {results.map(res => (
                                <li key={res.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                                    <strong>{res.title}</strong> ({res.type})
                                    <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: 'var(--text-secondary-color)' }}>{res.snippet}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: 'var(--text-secondary-color)' }}>Type to search.</p>
                    )}
                </div>
                <button onClick={() => setIsOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer', color: 'var(--text-secondary-color)' }}>&times;</button>
            </div>
        </div>
    );
};
export const SettingsPanel: React.FC = () => {
    const { user, updatePreferences } = useContext(AuthContext);
    const { themeMode, setThemeMode } = useContext(ThemeContext);
    const { defaultConfig, updateDefaultConfig } = useContext(AIServiceContext);

    if (!user) return <p>Please log in to manage settings.</p>;

    const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTheme = e.target.value as ThemeMode;
        setThemeMode(newTheme);
        updatePreferences({ theme: newTheme });
    };

    const handleAISettingChange = (key: keyof AIServiceConfig, value: any) => {
        updateDefaultConfig({ [key]: value });
    };

    return (
        <div style={{ padding: '20px', background: 'var(--background-secondary-color)', color: 'var(--text-color)', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', maxWidth: '600px', margin: '20px auto' }}>
            <h2 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>User Settings</h2>

            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.1em', marginBottom: '10px' }}>General</h3>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                    Theme:
                    <select value={themeMode} onChange={handleThemeChange} style={{ marginLeft: '10px', padding: '5px', background: 'var(--background-color)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-color)' }}>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="sepia">Sepia</option>
                        <option value="high-contrast">High Contrast</option>
                    </select>
                </label>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                    Language:
                    <select value={user.preferences.language} onChange={(e) => updatePreferences({ language: e.target.value })} style={{ marginLeft: '10px', padding: '5px', background: 'var(--background-color)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-color)' }}>
                        <option value="en-US">English (US)</option>
                        <option value="es-ES">Español (España)</option>
                        <option value="fr-FR">Français (France)</option>
                    </select>
                </label>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.1em', marginBottom: '10px' }}>AI Assistant</h3>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                    Default AI Model:
                    <select value={defaultConfig.model} onChange={(e) => handleAISettingChange('model', e.target.value)} style={{ marginLeft: '10px', padding: '5px', background: 'var(--background-color)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-color)' }}>
                        <option value="gemini-pro">Gemini Pro</option>
                        <option value="gpt-4">GPT-4</option>
                        <option value="claude-3">Claude 3</option>
                    </select>
                </label>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                    Temperature (creativity):
                    <input type="range" min="0" max="1" step="0.1" value={defaultConfig.temperature} onChange={(e) => handleAISettingChange('temperature', parseFloat(e.target.value))} style={{ marginLeft: '10px', width: '200px' }} />
                    <span> {defaultConfig.temperature}</span>
                </label>
                <label style={{ display: 'block', marginBottom: '8px' }}>
                    Max Tokens:
                    <input type="number" min="100" max="2000" step="100" value={defaultConfig.maxTokens} onChange={(e) => handleAISettingChange('maxTokens', parseInt(e.target.value))} style={{ marginLeft: '10px', padding: '5px', background: 'var(--background-color)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-color)' }} />
                </label>
            </div>

            {/* More settings sections: Accessibility, Notifications, Integrations, etc. */}

            <button style={{ padding: '10px 20px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Save All Settings
            </button>
        </div>
    );
};
export const HeaderBar: React.FC = () => {
    const { user, logout } = useContext(AuthContext);
    const { document, saveDocument, isLoading: docLoading } = useContext(DocumentContext);
    const { unreadCount } = useContext(NotificationContext);
    const { themeMode, setThemeMode } = useContext(ThemeContext);

    return (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--background-color-header)', color: 'var(--text-color)', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h1 style={{ margin: 0, fontSize: '1.5em', fontWeight: 'normal' }}>Google Docs Universe</h1>
                {document && <span style={{ marginLeft: '20px', fontSize: '1.1em', fontWeight: 'bold' }}>{document.title}</span>}
                {docLoading && <span style={{ marginLeft: '10px', fontSize: '0.9em', color: 'var(--text-secondary-color)' }}>Loading...</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button onClick={() => console.log('Open new document dialog')} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer' }}>+ New Doc</button>
                {document && (
                    <button onClick={() => document && saveDocument(document)} style={{ background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer' }}>Save</button>
                )}
                <button onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')} style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '1.2em' }}>
                    {themeMode === 'light' ? '🌙' : '☀️'}
                </button>
                <span style={{ position: 'relative' }}>
                    <button onClick={() => console.log('Open Notifications')} style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer', fontSize: '1.2em' }}>🔔</button>
                    {unreadCount > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7em', color: 'white' }}>{unreadCount}</span>}
                </span>
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={user.avatarUrl || 'https://www.gravatar.com/avatar/?d=mp'} alt="User Avatar" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                        <span>{user.name}</span>
                        <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}>Logout</button>
                    </div>
                ) : (
                    <button onClick={() => console.log('Open login dialog')} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer' }}>Login</button>
                )}
            </div>
        </header>
    );
};

// --- MAIN APPLICATION WRAPPER COMPONENT: DocsApp ---
export const DocsApp: React.FC = () => {
    // This is the orchestration layer for the entire application.
    // It manages the layout, routes (conceptual for this file), and top-level state.
    const [currentDocId, setCurrentDocId] = useState<string>('doc-456'); // Default document for demonstration
    const { user, isLoading: authLoading } = useContext(AuthContext);

    if (authLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '2em', color: 'var(--text-color)' }}>Loading User...</div>;
    }

    if (!user) {
        // In a real app, this would be a full login screen or a "Guest Mode" entry
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--background-color)', color: 'var(--text-color)' }}>
                <h2>Welcome to Google Docs Universe</h2>
                <p>Please log in to continue or explore as a guest.</p>
                <button onClick={() => AuthService.login({})} style={{ padding: '10px 20px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Login (Demo)</button>
            </div>
        );
    }

    // Main application layout
    return (
        <div className="docs-universe-app" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--base-font-size)',
            '--background-color': themeMode === 'dark' ? '#282c34' : '#ffffff',
            '--background-secondary-color': themeMode === 'dark' ? '#21252b' : '#f5f5f5',
            '--background-color-header': themeMode === 'dark' ? '#1e2227' : '#ffffff',
            '--text-color': themeMode === 'dark' ? '#abb2bf' : '#333333',
            '--text-secondary-color': themeMode === 'dark' ? '#61afef' : '#666666',
            '--primary-color': '#4285f4', // Google Blue
            '--accent-color': '#34a853', // Google Green
            '--accent-color-light': themeMode === 'dark' ? '#3e4451' : '#e0eaff',
            '--border-color': themeMode === 'dark' ? '#3c4048' : '#e0e0e0',
            '--font-family': 'Roboto, Arial, sans-serif',
            '--base-font-size': '16px',
        } as React.CSSProperties}> {/* Applying CSS variables for theme */}
            <HeaderBar />
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Left Sidebar for Navigation, Templates, Recent Docs (conceptual) */}
                <div style={{ width: '200px', borderRight: '1px solid var(--border-color)', background: 'var(--background-secondary-color)', padding: '15px', overflowY: 'auto' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1em' }}>Navigation</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li style={{ marginBottom: '10px' }}><a href="#" onClick={() => setCurrentDocId('doc-456')} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>My Documents</a></li>
                        <li style={{ marginBottom: '10px' }}><a href="#" onClick={() => console.log('Templates')} style={{ color: 'var(--text-color)', textDecoration: 'none' }}>Templates</a></li>
                        <li style={{ marginBottom: '10px' }}><a href="#" onClick={() => console.log('Shared with me')} style={{ color: 'var(--text-color)', textDecoration: 'none' }}>Shared with me</a></li>
                        <li style={{ marginBottom: '10px' }}><a href="#" onClick={() => console.log('Starred')} style={{ color: 'var(--text-color)', textDecoration: 'none' }}>Starred</a></li>
                        <li style={{ marginBottom: '10px' }}><a href="#" onClick={() => console.log('Recycle Bin')} style={{ color: 'var(--text-color)', textDecoration: 'none' }}>Recycle Bin</a></li>
                        <li style={{ marginBottom: '10px' }}><a href="#" onClick={() => console.log('Asset Library')} style={{ color: 'var(--text-color)', textDecoration: 'none' }}>Asset Library</a></li>
                        <li style={{ marginBottom: '10px' }}><a href="#" onClick={() => console.log('Workspace Analytics')} style={{ color: 'var(--text-color)', textDecoration: 'none' }}>Workspace Analytics</a></li>
                        <li style={{ marginBottom: '10px' }}><a href="#" onClick={() => console.log('Open Settings')} style={{ color: 'var(--text-color)', textDecoration: 'none' }}>Settings</a></li>
                    </ul>
                </div>

                {/* Main Editor Area */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: 'var(--background-color)' }}>
                        {currentDocId ? (
                            <DocumentProvider docId={currentDocId}>
                                <Editor />
                            </DocumentProvider>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary-color)' }}>Select or create a document to begin.</div>
                        )}
                    </div>
                </main>

                {/* Right Sidebar for Collaboration, AI, Plugins */}
                <aside style={{ display: 'flex', flexDirection: 'column', width: '300px', flexShrink: 0, borderLeft: '1px solid var(--border-color)', background: 'var(--background-secondary-color)' }}>
                    <div style={{ borderBottom: '1px solid var(--border-color)', padding: '10px 15px', display: 'flex', gap: '10px' }}>
                        <button style={{ flex: 1, padding: '8px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Collab</button>
                        <button style={{ flex: 1, padding: '8px', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>AI</button>
                        <button style={{ flex: 1, padding: '8px', background: 'var(--text-secondary-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Plugins</button>
                    </div>
                    {/* Conditional rendering of panels based on active tab/state */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <CollaborationPanel />
                        <AISidebar />
                        {/* <PluginPanel /> (conceptual for full UI) */}
                    </div>
                </aside>
            </div>
            <GlobalCommandPalette />
            <NotificationCenter />
            <GlobalSearchPanel />
            {/* <SettingsPanel /> // Would be conditionally rendered, perhaps in a modal or dedicated route */}
        </div>
    );
};

// --- CORE APPLICATION BOOTSTRAP ---
const container = document.getElementById('root');
if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(
        <React.StrictMode>
            <NotificationProvider>
                <AuthProvider>
                    <ThemeProvider>
                        <AIServiceProvider>
                            <PluginProvider>
                                <DocsApp />
                            </PluginProvider>
                        </AIServiceProvider>
                    </ThemeProvider>
                </AuthProvider>
            </NotificationProvider>
        </React.StrictMode>
    );
}

// --- EXPORTED UTILITIES/MODULES (for wider "universe" consumption) ---

// This represents the public API/SDK for interacting with the Docs Universe
export const DocsUniverseSDK = {
    Auth: AuthService,
    Documents: DocumentService,
    Collaboration: CollaborationService,
    AI: AIService,
    Plugins: PluginManagerService,
    Notifications: NotificationService,
    Analytics: AnalyticsService,
    Blockchain: BlockchainService,
    Assets: AssetManagementService,
    Contexts: {
        AuthContext,
        ThemeContext,
        DocumentContext,
        AIServiceContext,
        PluginContext,
        NotificationContext,
    },
    Components: {
        DocsApp,
        GlobalCommandPalette,
        CollaborationPanel,
        AISidebar,
        NotificationCenter,
        GlobalSearchPanel,
        SettingsPanel,
        HeaderBar,
        // Editor will eventually be an export from its own file
    },
    Types: {
        UserRole, DocumentStatus, DocumentVisibility, ThemeMode, LanguageCode, NotificationType, AITaskType, ContentBlockType,
        UserProfile, UserPreferences, Comment, DocumentPermission, VersionHistoryEntry, ContentBlock, Annotation, RealtimeCursor,
        Document, Notification, PluginManifest, PluginInstance, AIServiceConfig, ExportOption, AnalyticsEvent, BlockId, ChangeOperation
    }
};

// Additional specific exports, as required by the instruction "Any new top-level functions, classes, or variables you create MUST be exported."
export { AuthService, DocumentService, CollaborationService, AIService, PluginManagerService, NotificationService, AnalyticsService, BlockchainService, AssetManagementService };
export { AuthContext, ThemeContext, DocumentContext, AIServiceContext, PluginContext, NotificationContext };
export { AuthProvider, ThemeProvider, DocumentProvider, AIServiceProvider, PluginProvider, NotificationProvider };
