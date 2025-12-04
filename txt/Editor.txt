// google/docs/components/Editor.tsx
// The Canvas. A clean, focused space where the sovereign's words take form.

import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import Toolbar from './Toolbar'; // Assuming Toolbar is also vastly expanded

// --- Global Contexts for deeply nested features ---
// Exported for potential use by plugins or other components
export const DocumentContext = createContext<DocumentContextType | undefined>(undefined);
export const EditorInteractionContext = createContext<EditorInteractionContextType | undefined>(undefined);
export const AIContext = createContext<AIContextType | undefined>(undefined);
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);
export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);
export const PluginRegistryContext = createContext<PluginRegistryContextType | undefined>(undefined);
export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
export const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);
export const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);
export const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);


// --- Core Data Models (representing a highly structured document) ---

// Base block interface for all content types
export interface DocumentBlock {
    id: string;
    type: string; // e.g., 'text', 'heading', 'image', 'code', 'embed', 'chart', '3d'
    meta?: Record<string, any>; // Generic metadata
    attributes?: Record<string, any>; // Styling, formatting, etc.
}

export interface TextBlock extends DocumentBlock {
    type: 'text' | 'heading' | 'list_item' | 'quote' | 'callout';
    content: string; // The raw text content
    marks?: Mark[]; // e.g., bold, italic, underline, link, highlight
    level?: number; // For headings (h1, h2, h3), list depth
}

export interface Mark {
    type: string; // 'bold', 'italic', 'link', 'highlight', 'code', 'strikethrough', 'superscript', 'subscript'
    attrs?: Record<string, any>; // e.g., { href: 'url' } for link, { color: 'red' } for highlight
    from: number; // Start index in content
    to: number; // End index in content
}

export interface ImageBlock extends DocumentBlock {
    type: 'image';
    src: string;
    alt: string;
    caption?: string;
    width?: number;
    height?: number;
    alignment?: 'left' | 'center' | 'right';
    sizing?: 'inline' | 'full-width' | 'contain';
    filters?: ImageFilter[]; // e.g., grayscale, sepia, blur
    annotations?: Annotation[]; // Image specific annotations
}

export interface ImageFilter {
    type: string; // 'grayscale', 'sepia', 'blur', 'contrast', 'brightness'
    value?: number;
}

export interface VideoBlock extends DocumentBlock {
    type: 'video';
    src: string;
    poster?: string;
    caption?: string;
    autoplay?: boolean;
    loop?: boolean;
    controls?: boolean;
    transcript?: string; // AI-generated or uploaded transcript
    subtitles?: SubtitleTrack[];
    analytics?: VideoAnalytics; // Playback data
}

export interface AudioBlock extends DocumentBlock {
    type: 'audio';
    src: string;
    caption?: string;
    waveformData?: number[]; // Visual representation
    annotations?: Annotation[]; // Audio specific annotations
}

export interface SubtitleTrack {
    lang: string;
    url: string; // VTT file or similar
}

export interface VideoAnalytics {
    playCount: number;
    completionRate: number; // %
    engagementMap: { time: number; viewers: number }[];
}

export interface CodeBlock extends DocumentBlock {
    type: 'code';
    language: string;
    code: string;
    theme?: string; // Editor theme for syntax highlighting
    readOnly?: boolean;
    executeConfig?: CodeExecutionConfig; // For runnable code blocks
    annotations?: Annotation[]; // Code specific comments/review
}

export interface CodeExecutionConfig {
    environment: string; // 'python', 'javascript', 'node', 'browser'
    timeoutMs?: number;
    output?: string; // Last execution output
    error?: string; // Last execution error
}

export interface EmbedBlock extends DocumentBlock {
    type: 'embed';
    url: string; // URL to embed (YouTube, Figma, Google Maps, etc.)
    provider?: string;
    width?: number;
    height?: number;
    sandboxPermissions?: string[]; // iframe sandbox attributes
}

export interface TableBlock extends DocumentBlock {
    type: 'table';
    rows: TableRow[];
    columnHeaders?: boolean;
    rowHeaders?: boolean;
    // Advanced features: sorting, filtering, formulas, data linking
}

export interface TableRow {
    id: string;
    cells: TableCell[];
}

export interface TableCell {
    id: string;
    content: string; // Can be a mini-rich-text field
    colSpan?: number;
    rowSpan?: number;
    style?: Record<string, any>;
    dataType?: 'text' | 'number' | 'date' | 'currency';
    formula?: string; // e.g., "=SUM(A1:A5)"
}

export interface ChartBlock extends DocumentBlock {
    type: 'chart';
    chartType: 'bar' | 'line' | 'pie' | 'scatter';
    data: any; // e.g., { labels: [], datasets: [] }
    options?: any; // Chart.js or similar options
    sourceDataLink?: string; // Link to a spreadsheet or database
    interactive?: boolean;
}

export interface ThreeDModelBlock extends DocumentBlock {
    type: '3d_model';
    src: string; // e.g., GLB, OBJ
    format: string;
    viewerOptions?: any; // Lighting, camera controls, annotations
    annotations?: Annotation[];
}

export interface EquationBlock extends DocumentBlock {
    type: 'equation';
    latex: string;
    displayMode?: boolean; // Inline or block
}

export interface FileBlock extends DocumentBlock {
    type: 'file';
    fileName: string;
    fileSize: number;
    fileType: string;
    url: string;
    previewUrl?: string; // For PDFs, common document types
    embeddable?: boolean; // Can be embedded or just linked
}

export interface TaskBlock extends DocumentBlock {
    type: 'task';
    description: string;
    isComplete: boolean;
    assignedTo?: UserRef;
    dueDate?: string; // ISO date string
    priority?: 'low' | 'medium' | 'high';
    status?: 'todo' | 'in-progress' | 'blocked' | 'done';
    tags?: string[];
    // Linked to a project management system
}

export interface DividerBlock extends DocumentBlock {
    type: 'divider';
    style?: 'solid' | 'dashed' | 'dotted';
    color?: string;
    thickness?: number;
}

export type DocumentContent = DocumentBlock[]; // The core document structure

// --- Collaboration and Annotation ---
export interface Comment {
    id: string;
    author: UserRef;
    content: string;
    timestamp: string; // ISO date string
    blockId?: string; // Optional: specific block comment
    selection?: { startBlockId: string; startIndex: number; endBlockId: string; endIndex: number }; // For inline comments
    replies: Comment[];
    resolved: boolean;
    reactions?: Reaction[];
}

export interface Reaction {
    emoji: string;
    user: UserRef;
    timestamp: string;
}

export interface Annotation {
    id: string;
    author: UserRef;
    type: string; // 'highlight', 'drawing', 'note', 'measurement'
    targetRef: string; // e.g., image region, video timestamp, code line
    content?: string;
    data?: any; // Specific data for the annotation type (e.g., coordinates for drawing)
    timestamp: string;
}

export interface UserRef {
    id: string;
    name: string;
    avatarUrl?: string;
    color?: string; // For presence cursors/highlights
}

export interface UserPresence {
    user: UserRef;
    activeBlockId?: string;
    selection?: { startBlockId: string; startIndex: number; endBlockId: string; endIndex: number };
    cursorPosition?: { blockId: string; offset: number };
    lastActivity: string; // ISO date string
}

export interface Change {
    id: string;
    timestamp: string;
    author: UserRef;
    type: 'insert' | 'delete' | 'update' | 'format';
    details: any; // JSON representation of change
    revertable: boolean;
    diff?: string; // Optional diff representation
}

// --- AI Integration ---
export interface AISuggestion {
    id: string;
    type: 'completion' | 'refinement' | 'summary' | 'translation' | 'grammar' | 'style' | 'code_gen' | 'image_gen';
    originalRange?: { blockId: string; startIndex: number; endIndex: number };
    suggestedContent: string | { blocks: DocumentContent };
    confidence: number;
    status: 'pending' | 'accepted' | 'rejected';
    timestamp: string;
}

export interface AIChatMessage {
    id: string;
    sender: 'user' | 'ai';
    content: string;
    timestamp: string;
    toolsUsed?: string[];
    citations?: AICitation[];
}

export interface AICitation {
    id: string;
    source: string; // e.g., URL, document ID
    text: string; // Snippet from source
    confidence?: number;
}

export interface AIDocumentInsight {
    type: 'sentiment' | 'readability' | 'keyword' | 'entity' | 'question_answer' | 'concept_map';
    data: any;
    timestamp: string;
}

// --- Document State and Editor State ---
export interface DocumentMetadata {
    id: string;
    title: string;
    owner: UserRef;
    createdAt: string;
    updatedAt: string;
    lastAccessedAt: string;
    tags: string[];
    categories: string[];
    version: number;
    permissions: DocumentPermissions;
    language: string;
    customProperties: Record<string, any>; // User-defined metadata
    status: 'draft' | 'published' | 'archived' | 'review';
    templateId?: string;
    linkedProjects?: string[]; // IDs of linked projects
    seoSettings?: SEOSettings;
}

export interface SEOSettings {
    description?: string;
    keywords?: string[];
    canonicalUrl?: string;
    openGraph?: Record<string, string>;
}

export interface DocumentPermissions {
    [userId: string]: 'viewer' | 'commenter' | 'editor' | 'owner';
    publicAccess: 'none' | 'view' | 'comment';
    shareLink?: string;
}

export interface EditorViewState {
    activeBlockId: string | null;
    selection: { startBlockId: string; startIndex: number; endBlockId: string; endIndex: number } | null;
    cursorPosition: { blockId: string; offset: number } | null;
    scrollPosition: number;
    zoomLevel: number;
    activeTool: string; // e.g., 'text_select', 'draw', 'comment'
    isImmersiveMode: boolean;
    isOutlinePanelOpen: boolean;
    isAICompanionOpen: boolean;
    isCollaborationPanelOpen: boolean;
    isVersionHistoryOpen: boolean;
    isPluginPanelOpen?: boolean; // Added for consistency
    isSettingsPanelOpen?: boolean; // Added for consistency
    isTasksPanelOpen?: boolean; // Added for consistency
    currentTheme: string;
    activeModals: string[];
    searchQuery: string;
    findReplaceState: {
        isPanelOpen: boolean;
        query: string;
        replaceWith: string;
        matchCase: boolean;
        wholeWord: boolean;
        results: { blockId: string; offset: number; length: number }[];
        activeIndex: number;
    };
    // ... many more UI state variables
}

// --- Plugin System ---
export interface EditorPlugin {
    id: string;
    name: string;
    description: string;
    version: string;
    icon?: string;
    activate: (api: PluginAPI) => void;
    deactivate?: (api: PluginAPI) => void;
    settingsComponent?: React.FC<PluginSettingsProps>;
    sidebarComponent?: React.FC<PluginSidebarProps>;
    toolbarItems?: ToolbarItemConfig[];
    contextMenuActions?: ContextMenuActionConfig[];
    keyboardShortcuts?: KeyboardShortcutConfig[];
    // Add more extension points
}

export interface PluginAPI {
    getDocument: () => { content: DocumentContent; metadata: DocumentMetadata };
    updateDocument: (changes: any[], source: string) => void; // Apply operations
    getSelection: () => EditorViewState['selection'];
    setSelection: (selection: EditorViewState['selection']) => void;
    insertBlock: (block: DocumentBlock, atIndex?: number) => void;
    deleteBlock: (blockId: string) => void;
    addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
    openModal: (modalId: string, component: React.FC<any>, props?: any) => void;
    registerCommand: (commandId: string, handler: (args?: any) => void) => void;
    // ... many more API methods
}

export interface ToolbarItemConfig {
    id: string;
    icon: React.ReactNode;
    label: string;
    action: string | (() => void); // Command ID or direct function
    type: 'button' | 'dropdown' | 'toggle';
    group?: string;
    shortcut?: string;
}

export interface ContextMenuActionConfig {
    id: string;
    label: string;
    action: string | (() => void);
    icon?: React.ReactNode;
    condition?: (selection: EditorViewState['selection'], document: DocumentContent) => boolean;
}

export interface KeyboardShortcutConfig {
    key: string; // e.g., 'Mod+B', 'Ctrl+S'
    action: string | (() => void);
    description: string;
}


// --- Context Types (for the providers) ---
export interface DocumentContextType {
    documentContent: DocumentContent;
    documentMetadata: DocumentMetadata;
    updateBlock: (blockId: string, updates: Partial<DocumentBlock>) => void;
    insertBlock: (block: DocumentBlock, index: number) => void;
    deleteBlock: (blockId: string) => void;
    applyTransaction: (changes: Change[]) => void; // For complex, multi-block operations
    // ... many more document manipulation methods
}

export interface EditorInteractionContextType {
    viewState: EditorViewState;
    setViewState: React.Dispatch<React.SetStateAction<EditorViewState>>;
    setSelection: (selection: EditorViewState['selection']) => void;
    setCursorPosition: (position: EditorViewState['cursorPosition']) => void;
    focusBlock: (blockId: string, offset?: number) => void;
    openSidebarPanel: (panel: 'outline' | 'ai' | 'collaboration' | 'versions' | 'plugins' | 'settings' | 'tasks') => void;
    closeSidebarPanel: () => void;
    executeCommand: (commandId: string, args?: any) => void;
    registerCommand: (commandId: string, handler: (args?: any) => void) => void;
    triggerContextMenu: (event: React.MouseEvent, items: ContextMenuActionConfig[], selection?: EditorViewState['selection']) => void;
    // ... many more UI interaction methods
}

export interface AIContextType {
    aiPanelOpen: boolean;
    aiChatHistory: AIChatMessage[];
    aiSuggestions: AISuggestion[];
    aiInsights: AIDocumentInsight[];
    sendAIChatMessage: (message: string) => Promise<void>;
    requestAISuggestion: (type: AISuggestion['type'], options?: any) => Promise<AISuggestion>;
    applyAISuggestion: (suggestionId: string) => void;
    rejectAISuggestion: (suggestionId: string) => void;
    generateContent: (prompt: string, options?: any) => Promise<TextBlock[]>;
    summarizeContent: (range?: { blocks: string[] }) => Promise<string>;
    translateContent: (range?: { blocks: string[] }, targetLang?: string) => Promise<string>;
    // ... many more AI capabilities
}

export interface ThemeConfig {
    id: string;
    name: string;
    colors: Record<string, string>; // primary, secondary, text, background, accent, etc.
    fonts: Record<string, string>; // serif, sans-serif, monospace
    typography: Record<string, any>; // h1, p, code styles
    dark: boolean;
}

export interface ThemeContextType {
    currentTheme: ThemeConfig;
    availableThemes: ThemeConfig[];
    setTheme: (themeId: string) => void;
    toggleDarkMode: () => void;
    customizeTheme: (updates: Partial<ThemeConfig>) => void;
}

export interface CollaborationContextType {
    onlineUsers: UserPresence[];
    comments: Comment[];
    pendingChanges: Change[];
    trackChangesEnabled: boolean;
    addComment: (comment: Omit<Comment, 'id' | 'timestamp' | 'author' | 'replies' | 'resolved'>) => void;
    replyToComment: (commentId: string, replyContent: string) => void;
    resolveCommentThread: (commentId: string) => void;
    sendPresenceUpdate: (update: Partial<UserPresence>) => void;
    enableTrackChanges: (enabled: boolean) => void;
    acceptChange: (changeId: string) => void;
    rejectChange: (changeId: string) => void;
    // ... real-time cursors, selections, activity feed
}

export interface SettingsType {
    userId: string;
    interfaceLanguage: string;
    defaultFont: string;
    autoSave: boolean;
    offlineMode: boolean;
    keyboardShortcuts: Record<string, KeyboardShortcutConfig>;
    privacySettings: {
        telemetry: boolean;
        contentScanning: boolean;
        aiAssistanceOptIn: boolean;
    };
    accessibility: AccessibilitySettingsType;
    exportDefaults: Record<string, any>; // e.g., default PDF settings
    // ... many more user-specific settings
}

export interface SettingsContextType {
    settings: SettingsType;
    updateSetting: (key: keyof SettingsType, value: any) => void;
    resetSettings: () => void;
    // ... manage document-specific settings, user profiles
}

export interface PluginRegistryType {
    plugins: EditorPlugin[];
    activePlugins: string[];
    registerPlugin: (plugin: EditorPlugin) => void;
    activatePlugin: (pluginId: string) => void;
    deactivatePlugin: (pluginId: string) => void;
    getPluginAPI: () => PluginAPI;
}

export interface PluginRegistryContextType {
    registry: PluginRegistryType;
    loadPlugins: () => void;
    togglePlugin: (pluginId: string, enable: boolean) => void;
    getPluginSettingsComponent: (pluginId: string) => React.FC<PluginSettingsProps> | undefined;
    getPluginSidebarComponent: (pluginId: string) => React.FC<PluginSidebarProps> | undefined;
    getPluginToolbarItems: () => ToolbarItemConfig[];
}

export interface PluginSettingsProps {
    pluginId: string;
    settings: Record<string, any>;
    onUpdateSettings: (newSettings: Record<string, any>) => void;
}

export interface PluginSidebarProps {
    pluginId: string;
    documentContent: DocumentContent;
    editorApi: PluginAPI;
}

export interface Notification {
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'system';
    timestamp: string;
    duration?: number; // ms, 0 for persistent
    action?: { label: string; callback: () => void };
}

export interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    // ...toast management
}

export interface AccessibilitySettingsType {
    fontSize: number;
    highContrastMode: boolean;
    dyslexiaFriendlyFont: boolean;
    screenReaderSupport: boolean;
    keyboardNavigationEnhancements: boolean;
    reducedMotion: boolean;
    voiceControlEnabled: boolean;
    autoAltTextEnabled: boolean; // AI-generated alt text for images
    hapticFeedbackEnabled: boolean; // For touch devices
}

export interface AccessibilityContextType {
    accessibilitySettings: AccessibilitySettingsType;
    updateAccessibilitySetting: (key: keyof AccessibilitySettingsType, value: any) => void;
    // ... live region announcements, ARIA helpers
}

export interface LocalizationConfig {
    locale: string; // e.g., 'en-US', 'fr-FR'
    messages: Record<string, string>; // Key-value pairs for translations
    rtl: boolean; // Right-to-left language support
}

export interface LocalizationContextType {
    currentLocale: string;
    supportedLocales: { code: string; name: string }[];
    setLocale: (localeCode: string) => void;
    t: (key: string, variables?: Record<string, string | number>) => string; // Translation function
    // ... locale-aware date/number formatting
}

export interface WorkflowTask {
    id: string;
    name: string;
    description?: string;
    status: 'pending' | 'in-progress' | 'completed' | 'blocked';
    assignees: UserRef[];
    dueDate?: string;
    priority: 'low' | 'medium' | 'high';
    linkedDocumentIds: string[];
    // ...integrations with project management
}

export interface WorkflowContextType {
    linkedWorkflows: WorkflowTask[];
    addWorkflowTask: (task: Omit<WorkflowTask, 'id'>) => Promise<WorkflowTask>;
    updateWorkflowTask: (taskId: string, updates: Partial<WorkflowTask>) => Promise<WorkflowTask>;
    // ... automated triggers, approvals, integrations
}


// --- Utility Functions / API Simulators (would be external services) ---

// Simulates API calls for document operations
export const ApiService = {
    fetchDocument: async (docId: string): Promise<{ content: DocumentContent; metadata: DocumentMetadata }> => {
        // Mock data for initial load
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            content: [
                {
                    id: 'block1',
                    type: 'heading',
                    content: 'The Chronicles of the Sovereign Editor',
                    level: 1,
                    attributes: { color: 'text-blue-600' }
                } as TextBlock,
                {
                    id: 'block2',
                    type: 'text',
                    content: 'This document represents the culmination of a decade of unparalleled innovation and the collective wisdom of thousands of expert minds. It is a living canvas, meticulously crafted to transform the very essence of digital creation.',
                    marks: [
                        { type: 'bold', from: 83, to: 106 },
                        { type: 'italic', from: 0, to: 18 }
                    ],
                    attributes: { 'text-align': 'justify' }
                } as TextBlock,
                {
                    id: 'block3',
                    type: 'image',
                    src: 'https://picsum.photos/800/400?random=1',
                    alt: 'A conceptual image representing an infinite canvas',
                    caption: 'Figure 1: The boundless digital realm.',
                    width: 800,
                    height: 400,
                    alignment: 'center'
                } as ImageBlock,
                {
                    id: 'block4',
                    type: 'text',
                    content: 'Every pixel, every line of code, every feature is designed to empower, to inspire, and to expand the boundaries of possibility. Welcome to a new universe of thought and expression. ' +
                             'This is not merely an editor; it is an ecosystem, a sentient companion, and a launchpad for ideas.',
                    attributes: { 'font-style': 'italic' }
                } as TextBlock,
                {
                    id: 'block5',
                    type: 'code',
                    language: 'typescript',
                    code: `export function activateAICompanion() {\n  console.log('AI Companion activated!');\n  // Extensive AI initialization logic here\n}`,
                    theme: 'dark'
                } as CodeBlock,
                {
                    id: 'block6',
                    type: 'list_item',
                    content: 'Multi-modal content integration: images, videos, 3D models, interactive charts, code.',
                    level: 1,
                    marks: [{ type: 'bold', from: 0, to: 28 }]
                } as TextBlock,
                {
                    id: 'block7',
                    type: 'list_item',
                    content: 'Real-time collaborative editing with granular presence and activity tracking.',
                    level: 1
                } as TextBlock,
                {
                    id: 'block8',
                    type: 'list_item',
                    content: 'Advanced AI assistant for content generation, summarization, and semantic analysis.',
                    level: 1
                } as TextBlock,
                {
                    id: 'block9',
                    type: 'list_item',
                    content: 'Extensible plugin architecture with a rich API and marketplace.',
                    level: 1
                } as TextBlock,
                {
                    id: 'block10',
                    type: 'divider',
                    style: 'dashed',
                    color: '#60A5FA',
                    thickness: 2
                } as DividerBlock,
                {
                    id: 'block11',
                    type: 'task',
                    description: 'Review initial draft of Editor.tsx expansion',
                    isComplete: false,
                    assignedTo: { id: 'dev123', name: 'AI Programmer' },
                    dueDate: '2023-12-31',
                    priority: 'high',
                    status: 'in-progress',
                    tags: ['development', 'feature']
                } as TaskBlock,
                {
                    id: 'block12',
                    type: 'heading',
                    content: 'Future Expansions',
                    level: 2
                } as TextBlock,
                 {
                    id: 'block13',
                    type: 'text',
                    content: 'The journey to perfection is unending. We envision spatial computing integrations, brain-computer interface (BCI) compatibility, and direct neural network interfacing for truly instantaneous thought-to-document creation.',
                    marks: [{ type: 'highlight', from: 28, to: 53, attrs: { color: '#FCD34D' } }]
                } as TextBlock,
                {
                    id: 'block14',
                    type: '3d_model',
                    src: '/assets/holographic_interface.glb', // Hypothetical local asset
                    format: 'glb',
                    viewerOptions: { autoRotate: true, showControls: true }
                } as ThreeDModelBlock,
            ],
            metadata: {
                id: docId,
                title: 'Sovereign Editor Blueprint',
                owner: { id: 'ai-core', name: 'Google AI' },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastAccessedAt: new Date().toISOString(),
                tags: ['ai', 'future-tech', 'docs', 'editor', 'universal'],
                categories: ['productivity', 'collaboration', 'artificial intelligence'],
                version: 1,
                permissions: { 'ai-core': 'owner', publicAccess: 'none' },
                language: 'en-US',
                customProperties: { projectCode: 'SE-ALPHA-001', department: 'Advanced Research' },
                status: 'draft',
                seoSettings: {
                    description: 'A revolutionary document editor showcasing a decade of advanced AI and collaboration features.',
                    keywords: ['AI editor', 'next-gen docs', 'collaborative writing', 'universal editor']
                }
            }
        };
    },
    saveDocument: async (docId: string, content: DocumentContent, metadata: DocumentMetadata) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`Document ${docId} saved successfully!`);
        // Simulate version increment, update lastUpdatedAt
        metadata.version++;
        metadata.updatedAt = new Date().toISOString();
        return { success: true, metadata };
    },
    getAIResponse: async (prompt: string, context: DocumentContent) => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const exampleResponses = [
            'Based on your context, the next logical step would be to elaborate on the "AI-driven features" section, perhaps with examples of real-world impact.',
            'Consider refining the introduction to emphasize the "universe of creation" aspect more strongly.',
            'The current tone is highly aspirational. Would you like to add a section on the technical roadmap to ground these visions?',
            'Here is a generated paragraph about quantum computing integration: "Future versions will integrate quantum computing capabilities for ultra-fast large-scale content analysis and predictive modeling, enabling unprecedented insights into complex datasets within the document itself."',
            'For the code block, consider adding a comment explaining the `activateAICompanion` function\'s purpose in more detail.',
            'Let\'s summarize the document: "This blueprint outlines a hyper-advanced document editor, envisioned as a universal ecosystem for creation. It integrates multi-modal content, real-time collaboration, sophisticated AI, and an extensible plugin architecture, with future plans for spatial and neural interfaces."`'
        ];
        return exampleResponses[Math.floor(Math.random() * exampleResponses.length)];
    },
    // ... many more API calls for search, plugins, users, auth, etc.
};

export const RealtimeService = {
    connect: (docId: string, userId: string, onMessage: (msg: any) => void) => {
        console.log(`[RealtimeService] Connecting to document ${docId} for user ${userId}`);
        // Simulate WebSocket connection and messages
        const interval = setInterval(() => {
            const now = new Date().toISOString();
            // Simulate presence updates
            if (Math.random() < 0.7) {
                const users = ['userA', 'userB', 'userC', 'userD'];
                const randomUser = users[Math.floor(Math.random() * users.length)];
                if (randomUser !== userId) { // Don't send presence for self in this mock
                    onMessage({
                        type: 'presence',
                        payload: {
                            user: { id: randomUser, name: `User ${randomUser.toUpperCase()}`, avatarUrl: `https://i.pravatar.cc/30?u=${randomUser}` },
                            activeBlockId: `block${Math.floor(Math.random() * 14) + 1}`,
                            lastActivity: now
                        } as UserPresence
                    });
                }
            }

            // Simulate a comment
            if (Math.random() < 0.1) {
                const comment: Comment = {
                    id: `comment-${Date.now()}`,
                    author: { id: 'mock-user', name: 'Mock Collaborator' },
                    content: 'Great point! Have you considered adding a specific example here?',
                    timestamp: now,
                    blockId: `block${Math.floor(Math.random() * 14) + 1}`,
                    replies: [],
                    resolved: false
                };
                onMessage({ type: 'comment', payload: comment });
            }

            // Simulate a document update (simplified for mock)
            if (Math.random() < 0.05) {
                onMessage({
                    type: 'document_update',
                    payload: {
                        change: {
                            id: `change-${Date.now()}`,
                            timestamp: now,
                            author: { id: 'mock-user', name: 'System AutoSave' },
                            type: 'update',
                            details: 'Minor auto-correction', // In a real system, this would be an OT operation
                            revertable: true
                        } as Change
                    }
                });
            }

        }, 3000); // Every 3 seconds
        return () => {
            clearInterval(interval);
            console.log(`[RealtimeService] Disconnected from document ${docId}`);
        };
    },
    send: (docId: string, message: any) => {
        console.log(`[RealtimeService] Sending message for ${docId}:`, message);
        // In a real system, this would send to WebSocket server
    }
};

// --- Custom Hooks ---

export const useDocumentManagement = (docId: string) => {
    const [documentContent, setDocumentContent] = useState<DocumentContent>([]);
    const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [unsavedChanges, setUnsavedChanges] = useState(false);

    useEffect(() => {
        const loadDocument = async () => {
            try {
                setIsLoading(true);
                const data = await ApiService.fetchDocument(docId);
                setDocumentContent(data.content);
                setDocumentMetadata(data.metadata);
                setIsLoading(false);
            } catch (err) {
                setError('Failed to load document.');
                setIsLoading(false);
                console.error(err);
            }
        };
        loadDocument();
    }, [docId]);

    // Debounced autosave
    const saveDocument = useCallback(async () => {
        if (!documentContent || !documentMetadata || !unsavedChanges) return;
        try {
            console.log('Autosaving document...');
            const updatedMeta = await ApiService.saveDocument(documentMetadata.id, documentContent, documentMetadata);
            setDocumentMetadata(updatedMeta.metadata);
            setUnsavedChanges(false);
            console.log('Document saved successfully.');
        } catch (err) {
            console.error('Autosave failed:', err);
            // Potentially show a notification
        }
    }, [documentContent, documentMetadata, unsavedChanges]);

    useEffect(() => {
        // Debounce saving every 5 seconds after a change
        if (unsavedChanges) {
            const handler = setTimeout(saveDocument, 5000);
            return () => clearTimeout(handler);
        }
    }, [unsavedChanges, saveDocument]);


    const updateBlock = useCallback((blockId: string, updates: Partial<DocumentBlock>) => {
        setDocumentContent(prevContent => {
            const newContent = prevContent.map(block =>
                block.id === blockId ? { ...block, ...updates } : block
            );
            return newContent;
        });
        setUnsavedChanges(true);
    }, []);

    const insertBlock = useCallback((block: DocumentBlock, index: number) => {
        setDocumentContent(prevContent => {
            const newContent = [...prevContent];
            newContent.splice(index, 0, block);
            return newContent;
        });
        setUnsavedChanges(true);
    }, []);

    const deleteBlock = useCallback((blockId: string) => {
        setDocumentContent(prevContent => prevContent.filter(block => block.id !== blockId));
        setUnsavedChanges(true);
    }, []);

    // Placeholder for complex transactions (e.g., OT operations)
    const applyTransaction = useCallback((changes: Change[]) => {
        // In a real system, this would apply operational transformations
        console.log("Applying transaction:", changes);
        setUnsavedChanges(true);
    }, []);


    return {
        documentContent,
        documentMetadata,
        isLoading,
        error,
        unsavedChanges,
        updateBlock,
        insertBlock,
        deleteBlock,
        applyTransaction,
        setDocumentMetadata // Allow updates to metadata from settings panels etc.
    };
};

export const useEditorViewState = () => {
    const [viewState, setViewState] = useState<EditorViewState>({
        activeBlockId: null,
        selection: null,
        cursorPosition: null,
        scrollPosition: 0,
        zoomLevel: 1,
        activeTool: 'text_select',
        isImmersiveMode: false,
        isOutlinePanelOpen: false,
        isAICompanionOpen: false,
        isCollaborationPanelOpen: false,
        isVersionHistoryOpen: false,
        isPluginPanelOpen: false,
        isSettingsPanelOpen: false,
        isTasksPanelOpen: false,
        currentTheme: 'default-dark',
        activeModals: [],
        searchQuery: '',
        findReplaceState: {
            isPanelOpen: false,
            query: '',
            replaceWith: '',
            matchCase: false,
            wholeWord: false,
            results: [],
            activeIndex: -1
        },
    });

    const setSelection = useCallback((selection: EditorViewState['selection']) => {
        setViewState(prev => ({ ...prev, selection }));
    }, []);

    const setCursorPosition = useCallback((cursorPosition: EditorViewState['cursorPosition']) => {
        setViewState(prev => ({ ...prev, cursorPosition }));
    }, []);

    const focusBlock = useCallback((blockId: string, offset?: number) => {
        setViewState(prev => ({ ...prev, activeBlockId: blockId, cursorPosition: { blockId, offset: offset || 0 } }));
        // In a real editor, this would trigger scrolling to the block.
    }, []);

    const openSidebarPanel = useCallback((panel: 'outline' | 'ai' | 'collaboration' | 'versions' | 'plugins' | 'settings' | 'tasks') => {
        setViewState(prev => ({
            ...prev,
            isOutlinePanelOpen: panel === 'outline',
            isAICompanionOpen: panel === 'ai',
            isCollaborationPanelOpen: panel === 'collaboration',
            isVersionHistoryOpen: panel === 'versions',
            isPluginPanelOpen: panel === 'plugins', // Added for consistency
            isSettingsPanelOpen: panel === 'settings', // Added for consistency
            isTasksPanelOpen: panel === 'tasks', // Added for consistency
            // ... more panels
        }));
    }, []);

    const closeSidebarPanel = useCallback(() => {
        setViewState(prev => ({
            ...prev,
            isOutlinePanelOpen: false,
            isAICompanionOpen: false,
            isCollaborationPanelOpen: false,
            isVersionHistoryOpen: false,
            isPluginPanelOpen: false,
            isSettingsPanelOpen: false,
            isTasksPanelOpen: false,
        }));
    }, []);

    // Command palette / shortcut system
    const commands = useRef<Record<string, (args?: any) => void>>({});

    const registerCommand = useCallback((commandId: string, handler: (args?: any) => void) => {
        commands.current[commandId] = handler;
    }, []);

    const executeCommand = useCallback((commandId: string, args?: any) => {
        const handler = commands.current[commandId];
        if (handler) {
            console.log(`Executing command: ${commandId}`);
            handler(args);
        } else {
            console.warn(`Command "${commandId}" not found.`);
        }
    }, []);

    const triggerContextMenu = useCallback((event: React.MouseEvent, items: ContextMenuActionConfig[], selection?: EditorViewState['selection']) => {
        event.preventDefault(); // Prevent native context menu
        // In a real app, this would show a custom context menu component
        console.log("Context menu triggered:", items, "at", event.clientX, event.clientY, "for selection:", selection);
        // This would typically update viewState to show a ContextMenu component
        executeCommand('editor:show-context-menu', { event, items, selection });
    }, [executeCommand]);

    useEffect(() => {
        // Register some default commands
        registerCommand('editor:toggle-immersive-mode', () => setViewState(prev => ({ ...prev, isImmersiveMode: !prev.isImmersiveMode })));
        registerCommand('editor:open-ai-companion', () => openSidebarPanel('ai'));
        registerCommand('editor:save-document', () => executeCommand('document:save')); // Link to document save logic
        registerCommand('editor:copy', () => document.execCommand('copy')); // Fallback to native copy
        registerCommand('editor:paste', () => document.execCommand('paste')); // Fallback to native paste
        registerCommand('editor:cut', () => document.execCommand('cut')); // Fallback to native cut
        registerCommand('editor:undo', () => document.execCommand('undo'));
        registerCommand('editor:redo', () => document.execCommand('redo'));

        // Keyboard shortcut listener (simplified)
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && viewState.activeModals.length > 0) {
                executeCommand('modal:close-last');
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') { // Command Palette
                e.preventDefault();
                executeCommand('editor:open-command-palette');
            }
            // Add more shortcut handlers mapping to executeCommand
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [registerCommand, executeCommand, openSidebarPanel, viewState.activeModals]);


    return {
        viewState,
        setViewState,
        setSelection,
        setCursorPosition,
        focusBlock,
        openSidebarPanel,
        closeSidebarPanel,
        executeCommand,
        registerCommand,
        triggerContextMenu
    };
};

export const useAICompanion = (documentContent: DocumentContent) => {
    const [aiPanelOpen, setAiPanelOpen] = useState(false);
    const [aiChatHistory, setAiChatHistory] = useState<AIChatMessage[]>([]);
    const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
    const [aiInsights, setAiInsights] = useState<AIDocumentInsight[]>([]);
    const editorInteraction = useContext(EditorInteractionContext);
    const documentContext = useContext(DocumentContext);
    const notificationContext = useContext(NotificationContext);

    const sendAIChatMessage = useCallback(async (message: string) => {
        const userMessage: AIChatMessage = { id: `msg-${Date.now()}-user`, sender: 'user', content: message, timestamp: new Date().toISOString() };
        setAiChatHistory(prev => [...prev, userMessage]);

        notificationContext?.addNotification({ message: 'AI is processing your request...', type: 'info', duration: 3000 });

        try {
            // Context-aware AI: send relevant parts of the document
            const aiResponseContent = await ApiService.getAIResponse(message, documentContent);
            const aiMessage: AIChatMessage = { id: `msg-${Date.now()}-ai`, sender: 'ai', content: aiResponseContent, timestamp: new Date().toISOString() };
            setAiChatHistory(prev => [...prev, aiMessage]);
            notificationContext?.addNotification({ message: 'AI response received!', type: 'success' });
        } catch (error) {
            console.error('AI chat failed:', error);
            notificationContext?.addNotification({ message: 'AI chat failed. Please try again.', type: 'error', duration: 5000 });
            setAiChatHistory(prev => [...prev, { id: `msg-${Date.now()}-error`, sender: 'ai', content: 'An error occurred while fetching AI response.', timestamp: new Date().toISOString() }]);
        }
    }, [documentContent, notificationContext]);

    const requestAISuggestion = useCallback(async (type: AISuggestion['type'], options?: any) => {
        // This would be a more complex AI call
        const suggestion: AISuggestion = {
            id: `suggestion-${Date.now()}`,
            type: type,
            suggestedContent: `[AI generated ${type} content based on ${JSON.stringify(options)}]`,
            confidence: 0.9,
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        setAiSuggestions(prev => [...prev, suggestion]);
        notificationContext?.addNotification({ message: `AI ${type} suggestion generated.`, type: 'info' });
        return suggestion;
    }, [notificationContext]);

    const applyAISuggestion = useCallback((suggestionId: string) => {
        setAiSuggestions(prev =>
            prev.map(s => (s.id === suggestionId ? { ...s, status: 'accepted' } : s))
        );
        // Here, integrate the suggestedContent into the actual documentContent
        const suggestion = aiSuggestions.find(s => s.id === suggestionId);
        if (suggestion && documentContext) {
            // Example: replace a block or insert new blocks
            // This would need more sophisticated logic based on suggestion.type and originalRange
            notificationContext?.addNotification({ message: 'AI suggestion applied!', type: 'success' });
        }
    }, [aiSuggestions, documentContext, notificationContext]);

    const rejectAISuggestion = useCallback((suggestionId: string) => {
        setAiSuggestions(prev =>
            prev.map(s => (s.id === suggestionId ? { ...s, status: 'rejected' } : s))
        );
        notificationContext?.addNotification({ message: 'AI suggestion rejected.', type: 'info' });
    }, [notificationContext]);

    const generateContent = useCallback(async (prompt: string, options?: any) => {
        notificationContext?.addNotification({ message: 'Generating content with AI...', type: 'info', duration: 3000 });
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI generation time
        const newBlock: TextBlock = {
            id: `block-${Date.now()}`,
            type: 'text',
            content: `[AI GENERATED] A new paragraph based on the prompt: "${prompt}". This content is contextually aware and refined by advanced large language models. ${options?.style ? `(Style: ${options.style})` : ''}`,
            marks: [{ type: 'highlight', from: 0, to: 13, attrs: { color: '#BFDBFE' } }]
        };
        notificationContext?.addNotification({ message: 'Content generated!', type: 'success' });
        return [newBlock]; // Return an array of blocks
    }, [notificationContext]);


    useEffect(() => {
        if (editorInteraction) {
            editorInteraction.registerCommand('ai:open-companion', () => setAiPanelOpen(true));
            editorInteraction.registerCommand('ai:close-companion', () => setAiPanelOpen(false));
            editorInteraction.registerCommand('ai:toggle-companion', () => setAiPanelOpen(prev => !prev));
            editorInteraction.registerCommand('ai:generate-block', async (prompt: string) => {
                const generatedBlocks = await generateContent(prompt);
                if (documentContext) {
                    documentContext.insertBlock(generatedBlocks[0], documentContent.length); // Add at the end
                    notificationContext?.addNotification({ message: 'AI-generated block added to document.', type: 'success' });
                }
            });
            editorInteraction.registerCommand('ai:summarize-document', async () => {
                const summary = await ApiService.getAIResponse('Summarize this document', documentContent); // Re-use general AI API for mock
                notificationContext?.addNotification({
                    message: `Document Summary (AI): ${summary.substring(0, 100)}...`,
                    type: 'info',
                    duration: 10000
                });
                setAiChatHistory(prev => [...prev, { id: `msg-${Date.now()}-summary`, sender: 'ai', content: `Document Summary: ${summary}`, timestamp: new Date().toISOString() }]);
            });
        }
    }, [editorInteraction, documentContent, documentContext, notificationContext, generateContent]);


    return {
        aiPanelOpen,
        setAiPanelOpen,
        aiChatHistory,
        aiSuggestions,
        aiInsights,
        sendAIChatMessage,
        requestAISuggestion,
        applyAISuggestion,
        rejectAISuggestion,
        generateContent,
        summarizeContent: useCallback(async () => {}, []), // Placeholder
        translateContent: useCallback(async () => {}, []), // Placeholder
    };
};

export const useCollaboration = (docId: string, currentUser: UserRef) => {
    const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [pendingChanges, setPendingChanges] = useState<Change[]>([]);
    const [trackChangesEnabled, setTrackChangesEnabled] = useState(false);
    const realtimeServiceRef = useRef<{ send: (msg: any) => void } | null>(null);

    useEffect(() => {
        const cleanup = RealtimeService.connect(docId, currentUser.id, (message) => {
            switch (message.type) {
                case 'presence':
                    setOnlineUsers(prev => {
                        const existingIndex = prev.findIndex(u => u.user.id === message.payload.user.id);
                        if (existingIndex > -1) {
                            return prev.map((u, i) => i === existingIndex ? message.payload : u);
                        }
                        return [...prev, message.payload];
                    });
                    break;
                case 'comment':
                    setComments(prev => [...prev, message.payload]);
                    break;
                case 'document_update':
                    setPendingChanges(prev => [...prev, message.payload.change]);
                    // In a real OT system, this would trigger document update
                    break;
                // ... more message types for real-time sync
            }
        });

        // Mock sending initial presence
        realtimeServiceRef.current = {
            send: (msg) => {
                // This would be the actual WebSocket send method
                console.log('RealtimeService.send (mock):', msg);
            }
        };
        realtimeServiceRef.current.send({ type: 'presence_initial', payload: currentUser });


        return () => {
            cleanup();
            realtimeServiceRef.current = null;
        };
    }, [docId, currentUser]);

    // Update own presence periodically
    useEffect(() => {
        const interval = setInterval(() => {
            if (realtimeServiceRef.current) {
                realtimeServiceRef.current.send({
                    type: 'presence',
                    payload: {
                        user: currentUser,
                        lastActivity: new Date().toISOString(),
                        // activeBlockId, selection, cursorPosition could be added here
                    } as UserPresence
                });
            }
        }, 10000); // Every 10 seconds
        return () => clearInterval(interval);
    }, [currentUser]);


    const addComment = useCallback((comment: Omit<Comment, 'id' | 'timestamp' | 'author' | 'replies' | 'resolved'>) => {
        const newComment: Comment = {
            ...comment,
            id: `comment-${Date.now()}`,
            author: currentUser,
            timestamp: new Date().toISOString(),
            replies: [],
            resolved: false
        };
        setComments(prev => [...prev, newComment]);
        realtimeServiceRef.current?.send({ type: 'comment', payload: newComment });
    }, [currentUser]);

    const replyToComment = useCallback((commentId: string, replyContent: string) => {
        setComments(prev => prev.map(c => c.id === commentId ? {
            ...c,
            replies: [...c.replies, {
                id: `reply-${Date.now()}`,
                author: currentUser,
                content: replyContent,
                timestamp: new Date().toISOString(),
                replies: [],
                resolved: false // Replies are part of the parent comment, don't have separate resolved state
            }]
        } : c));
        // Realtime update would also be sent here
    }, [currentUser]);


    const resolveCommentThread = useCallback((commentId: string) => {
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, resolved: true } : c));
        realtimeServiceRef.current?.send({ type: 'comment_resolve', payload: { commentId } });
    }, []);

    const sendPresenceUpdate = useCallback((update: Partial<UserPresence>) => {
        realtimeServiceRef.current?.send({ type: 'presence', payload: { ...update, user: currentUser } });
    }, [currentUser]);

    const enableTrackChanges = useCallback((enabled: boolean) => {
        setTrackChangesEnabled(enabled);
        // Inform backend/other collaborators
    }, []);

    const acceptChange = useCallback((changeId: string) => {
        setPendingChanges(prev => prev.filter(c => c.id !== changeId));
        // Apply change to document, notify others
    }, []);

    const rejectChange = useCallback((changeId: string) => {
        setPendingChanges(prev => prev.filter(c => c.id !== changeId));
        // Discard change, notify others
    }, []);


    return {
        onlineUsers,
        comments,
        pendingChanges,
        trackChangesEnabled,
        addComment,
        replyToComment,
        resolveCommentThread,
        sendPresenceUpdate,
        enableTrackChanges,
        acceptChange,
        rejectChange
    };
};

export const usePluginManager = (documentAPI: PluginAPI, editorAPI: EditorInteractionContextType) => {
    const [plugins, setPlugins] = useState<EditorPlugin[]>([]);
    const [activePlugins, setActivePlugins] = useState<string[]>([]); // Array of plugin IDs
    const registryRef = useRef<PluginRegistryType>({
        plugins: [],
        activePlugins: [],
        registerPlugin: () => {}, // Will be set in useEffect
        activatePlugin: () => {},
        deactivatePlugin: () => {},
        getPluginAPI: () => documentAPI // Provide the documentAPI initially
    });

    const registerPlugin = useCallback((plugin: EditorPlugin) => {
        setPlugins(prev => {
            if (!prev.some(p => p.id === plugin.id)) {
                console.log(`Registered plugin: ${plugin.name}`);
                return [...prev, plugin];
            }
            return prev;
        });
    }, []);

    const activatePlugin = useCallback((pluginId: string) => {
        setActivePlugins(prev => {
            if (!prev.includes(pluginId)) {
                const plugin = plugins.find(p => p.id === pluginId);
                if (plugin) {
                    plugin.activate(documentAPI);
                    // Register plugin's toolbar items, commands, etc.
                    plugin.toolbarItems?.forEach(item => editorAPI.registerCommand(item.action as string, () => console.log(`Plugin ${plugin.id} action: ${item.action}`))); // Simplified
                    plugin.keyboardShortcuts?.forEach(shortcut => editorAPI.registerCommand(shortcut.action as string, () => console.log(`Plugin ${plugin.id} shortcut: ${shortcut.action}`))); // Simplified
                    console.log(`Activated plugin: ${plugin.name}`);
                    return [...prev, pluginId];
                }
            }
            return prev;
        });
    }, [plugins, documentAPI, editorAPI]);

    const deactivatePlugin = useCallback((pluginId: string) => {
        setActivePlugins(prev => {
            const newActive = prev.filter(id => id !== pluginId);
            const plugin = plugins.find(p => p.id === pluginId);
            if (plugin) {
                plugin.deactivate?.(documentAPI);
                console.log(`Deactivated plugin: ${plugin.name}`);
            }
            return newActive;
        });
    }, [plugins, documentAPI]);

    // Initialize registryRef and pass it down
    useEffect(() => {
        registryRef.current = {
            plugins,
            activePlugins,
            registerPlugin,
            activatePlugin,
            deactivatePlugin,
            getPluginAPI: () => documentAPI
        };
    }, [plugins, activePlugins, registerPlugin, activatePlugin, deactivatePlugin, documentAPI]);

    const loadPlugins = useCallback(() => {
        // Simulate fetching plugins from a marketplace/config
        const mockPlugins: EditorPlugin[] = [
            {
                id: 'code-formatter',
                name: 'Code Formatter',
                description: 'Automatically formats code blocks.',
                version: '1.0.0',
                icon: 'i-carbon-code',
                activate: (api) => { console.log('Code Formatter Activated'); api.addNotification({ message: 'Code Formatter is active!', type: 'info' }); },
                toolbarItems: [{ id: 'format-code', icon: '⚡', label: 'Format Code', action: 'plugin:code-formatter:format-all', type: 'button' }],
                keyboardShortcuts: [{ key: 'Alt+Shift+F', action: 'plugin:code-formatter:format-all', description: 'Format all code blocks' }]
            },
            {
                id: 'markdown-importer',
                name: 'Markdown Importer',
                description: 'Import Markdown files directly into the editor.',
                version: '1.1.0',
                icon: 'i-carbon-markdown',
                activate: (api) => { console.log('Markdown Importer Activated'); },
                sidebarComponent: () => <div>Markdown Import UI <button onClick={() => console.log('Import MD')}>Import</button></div>
            },
            {
                id: 'semantic-linker',
                name: 'Semantic Linker',
                description: 'Automatically links concepts to a knowledge graph.',
                version: '2.0.0',
                icon: 'i-carbon-flow-stream',
                activate: (api) => { console.log('Semantic Linker Activated'); },
                toolbarItems: [{ id: 'link-concepts', icon: '🔗', label: 'Link Concepts', action: 'plugin:semantic-linker:auto-link', type: 'button' }]
            }
        ];
        mockPlugins.forEach(registerPlugin);
        // Auto-activate some default plugins
        setActivePlugins(mockPlugins.filter(p => p.id === 'code-formatter' || p.id === 'semantic-linker').map(p => p.id));
    }, [registerPlugin]);

    const getPluginSettingsComponent = useCallback((pluginId: string) => {
        return plugins.find(p => p.id === pluginId)?.settingsComponent;
    }, [plugins]);

    const getPluginSidebarComponent = useCallback((pluginId: string) => {
        return plugins.find(p => p.id === pluginId)?.sidebarComponent;
    }, [plugins]);

    const getPluginToolbarItems = useCallback(() => {
        return activePlugins.flatMap(id => plugins.find(p => p.id === id)?.toolbarItems || []);
    }, [activePlugins, plugins]);


    return {
        registry: registryRef.current,
        loadPlugins,
        togglePlugin: (pluginId: string, enable: boolean) => (enable ? activatePlugin(pluginId) : deactivatePlugin(pluginId)),
        getPluginSettingsComponent,
        getPluginSidebarComponent,
        getPluginToolbarItems
    };
};

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
        const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newNotification = { ...notification, id, timestamp: new Date().toISOString() };
        setNotifications(prev => [...prev, newNotification]);

        if (notification.duration !== 0) {
            setTimeout(() => removeNotification(id), notification.duration || 5000);
        }
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return { notifications, addNotification, removeNotification };
};


// --- Components for the expanded Editor ---

// Core rich text editing surface
export const RichTextSurface: React.FC<{
    content: DocumentContent;
    onUpdateBlock: (blockId: string, updates: Partial<DocumentBlock>) => void;
    onInsertBlock: (block: DocumentBlock, index: number) => void;
    onDeleteBlock: (blockId: string) => void;
    onSelectionChange: (selection: EditorViewState['selection']) => void;
    onCursorChange: (position: EditorViewState['cursorPosition']) => void;
    activeBlockId: string | null;
    currentUser: UserRef;
    onlineUsers: UserPresence[];
    comments: Comment[];
    editorInteraction: EditorInteractionContextType;
    trackChangesEnabled: boolean;
}> = ({
    content,
    onUpdateBlock,
    onInsertBlock,
    onDeleteBlock,
    onSelectionChange,
    onCursorChange,
    activeBlockId,
    currentUser,
    onlineUsers,
    comments,
    editorInteraction,
    trackChangesEnabled
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const documentContext = useContext(DocumentContext); // Access full document context

    // Simulate cursor/selection for online users
    const renderPresenceCursors = useCallback(() => {
        return onlineUsers.map(presence => {
            if (presence.user.id === currentUser.id) return null; // Don't show own cursor
            // A more complex implementation would render actual cursors/selections visually
            return (
                <div key={presence.user.id} className="absolute text-xs" style={{ top: 0, left: 0, pointerEvents: 'none', transform: 'translate(10px, 10px)' }}>
                    <span className="bg-blue-500 text-white px-1 py-0.5 rounded-sm">{presence.user.name}</span>
                </div>
            );
        });
    }, [onlineUsers, currentUser]);

    const renderBlock = useCallback((block: DocumentBlock, index: number) => {
        const isActive = activeBlockId === block.id;
        const blockComments = comments.filter(c => c.blockId === block.id && !c.resolved);
        const userPresencesInBlock = onlineUsers.filter(p => p.activeBlockId === block.id && p.user.id !== currentUser.id);

        const BlockWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
            <div
                className={`relative group p-2 rounded-md transition-all duration-150 ${isActive ? 'outline outline-2 outline-blue-500 bg-blue-900/10' : ''} ${trackChangesEnabled ? 'border-l-4 border-l-yellow-600' : ''}`}
                onClick={() => editorInteraction.focusBlock(block.id)}
                onContextMenu={(e) => editorInteraction.triggerContextMenu(e, [
                    { id: 'block:delete', label: 'Delete Block', action: () => onDeleteBlock(block.id) },
                    { id: 'block:add-comment', label: 'Add Comment', action: () => editorInteraction.executeCommand('collaboration:add-comment', { blockId: block.id }) },
                    { id: 'block:ai-refine', label: 'AI Refine', action: () => editorInteraction.executeCommand('ai:refine-block', { blockId: block.id }) },
                    { id: 'block:move-up', label: 'Move Up', action: () => editorInteraction.executeCommand('document:move-block', { blockId: block.id, direction: 'up' }) },
                    { id: 'block:move-down', label: 'Move Down', action: () => editorInteraction.executeCommand('document:move-block', { blockId: block.id, direction: 'down' }) },
                    // ... more block specific actions
                ])}
            >
                {children}
                {blockComments.length > 0 && (
                    <div className="absolute top-0 right-0 m-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer"
                         title={`${blockComments.length} unresolved comments`}
                         onClick={() => editorInteraction.openSidebarPanel('collaboration')}>
                        {blockComments.length}
                    </div>
                )}
                {userPresencesInBlock.length > 0 && (
                     <div className="absolute bottom-0 left-2 flex -space-x-2 overflow-hidden">
                        {userPresencesInBlock.map(p => (
                            <img key={p.user.id} className="inline-block h-6 w-6 rounded-full ring-2 ring-blue-400" src={p.user.avatarUrl || 'https://i.pravatar.cc/30?img=1'} alt={p.user.name} title={p.user.name} />
                        ))}
                    </div>
                )}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col space-y-1 p-1 bg-gray-700 rounded-l-md">
                    <button className="text-gray-300 hover:text-white" onClick={() => onInsertBlock({ id: `new-text-${Date.now()}`, type: 'text', content: '' }, index + 1)} title="Add Text Block">+</button>
                    <button className="text-gray-300 hover:text-white" onClick={() => onInsertBlock({ id: `new-image-${Date.now()}`, type: 'image', src: 'https://picsum.photos/400/200', alt: 'placeholder' }, index + 1)} title="Add Image Block">🖼️</button>
                    <button className="text-gray-300 hover:text-white" onClick={() => onInsertBlock({ id: `new-code-${Date.now()}`, type: 'code', language: 'javascript', code: '// new code' }, index + 1)} title="Add Code Block">{}</button>
                    {/* More block insertion options */}
                </div>
            </div>
        );


        switch (block.type) {
            case 'text':
            case 'heading':
            case 'list_item':
            case 'quote':
            case 'callout':
                const textBlock = block as TextBlock;
                // A true rich text editor would parse marks and render them
                return (
                    <BlockWrapper key={block.id}>
                        <div
                            className={`p-1 outline-none min-h-[1.5em] focus:ring-2 focus:ring-blue-500 ${block.type === 'heading' ? 'font-bold' : ''} ${block.type === 'heading' && textBlock.level === 1 ? 'text-4xl' : ''} ${block.type === 'heading' && textBlock.level === 2 ? 'text-3xl' : ''} ${block.type === 'heading' && textBlock.level === 3 ? 'text-2xl' : ''} ${block.type === 'list_item' ? 'ml-6 list-disc' : ''} ${block.type === 'quote' ? 'border-l-4 border-gray-400 pl-4 italic' : ''} ${block.type === 'callout' ? 'bg-blue-800 p-4 rounded-md' : ''}`}
                            contentEditable={true}
                            dangerouslySetInnerHTML={{ __html: textBlock.content }} // DANGER: In real app, use a proper rich text editor lib, not dangerouslySetInnerHTML with user input
                            onInput={(e) => onUpdateBlock(block.id, { content: e.currentTarget.innerHTML })}
                            onFocus={() => editorInteraction.focusBlock(block.id)}
                        />
                    </BlockWrapper>
                );
            case 'image':
                const imageBlock = block as ImageBlock;
                return (
                    <BlockWrapper key={block.id}>
                        <img src={imageBlock.src} alt={imageBlock.alt} className="max-w-full h-auto" style={{ margin: imageBlock.alignment === 'center' ? '0 auto' : undefined }} />
                        {imageBlock.caption && <p className="text-sm text-gray-400 mt-2 text-center">{imageBlock.caption}</p>}
                        {/* Image annotation tools, resize handles */}
                    </BlockWrapper>
                );
            case 'video':
                const videoBlock = block as VideoBlock;
                return (
                    <BlockWrapper key={block.id}>
                        <video src={videoBlock.src} controls={videoBlock.controls} poster={videoBlock.poster} className="max-w-full h-auto" />
                        {videoBlock.caption && <p className="text-sm text-gray-400 mt-2 text-center">{videoBlock.caption}</p>}
                        {/* Video timeline annotations */}
                    </BlockWrapper>
                );
            case 'code':
                const codeBlock = block as CodeBlock;
                return (
                    <BlockWrapper key={block.id}>
                        <pre className="bg-gray-800 p-4 rounded-md overflow-x-auto">
                            <code className={`language-${codeBlock.language} text-sm`}>{codeBlock.code}</code>
                        </pre>
                        <button className="mt-2 bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-xs" onClick={() => editorInteraction.executeCommand('code:run', { blockId: block.id })}>Run Code</button>
                    </BlockWrapper>
                );
            case 'embed':
                const embedBlock = block as EmbedBlock;
                return (
                    <BlockWrapper key={block.id}>
                        <iframe src={embedBlock.url} width={embedBlock.width || '100%'} height={embedBlock.height || '400px'}
                                sandbox={(embedBlock.sandboxPermissions || ['allow-scripts', 'allow-same-origin']).join(' ')}
                                className="border-0 rounded-md" allowFullScreen></iframe>
                    </BlockWrapper>
                );
            case 'chart':
                const chartBlock = block as ChartBlock;
                return (
                    <BlockWrapper key={block.id}>
                        <div className="bg-gray-800 p-4 rounded-md text-center text-gray-300">
                            {/* Placeholder for actual chart rendering library */}
                            Interactive {chartBlock.chartType} Chart ({chartBlock.sourceDataLink ? `Source: ${chartBlock.sourceDataLink}` : 'Local Data'})
                            <div className="h-64 bg-gray-700 mt-2 rounded"></div>
                        </div>
                    </BlockWrapper>
                );
            case '3d_model':
                const modelBlock = block as ThreeDModelBlock;
                return (
                    <BlockWrapper key={block.id}>
                        <div className="bg-gray-800 p-4 rounded-md text-center text-gray-300">
                            {/* Placeholder for 3D viewer library */}
                            Interactive 3D Model Viewer ({modelBlock.format.toUpperCase()})
                            <div className="h-96 bg-gray-700 mt-2 rounded"></div>
                        </div>
                    </BlockWrapper>
                );
            case 'equation':
                const eqBlock = block as EquationBlock;
                return (
                    <BlockWrapper key={block.id}>
                        <div className={`p-2 text-lg ${eqBlock.displayMode ? 'text-center block' : 'inline-block'}`}>
                            {/* Placeholder for MathJax/KaTeX rendering */}
                            <span className="font-mono text-yellow-300">{eqBlock.latex}</span>
                        </div>
                    </BlockWrapper>
                );
            case 'task':
                const taskBlock = block as TaskBlock;
                return (
                    <BlockWrapper key={block.id}>
                        <div className={`flex items-center space-x-2 p-2 rounded-md ${taskBlock.isComplete ? 'bg-green-900/50' : 'bg-blue-900/50'}`}>
                            <input
                                type="checkbox"
                                checked={taskBlock.isComplete}
                                onChange={(e) => onUpdateBlock(block.id, { isComplete: e.target.checked })}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded"
                            />
                            <span className={`${taskBlock.isComplete ? 'line-through text-gray-500' : 'text-white'}`}>
                                {taskBlock.description}
                            </span>
                            {taskBlock.assignedTo && <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">{taskBlock.assignedTo.name}</span>}
                            {taskBlock.dueDate && <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">🗓️ {taskBlock.dueDate}</span>}
                            <span className={`text-xs px-2 py-1 rounded-full ${taskBlock.priority === 'high' ? 'bg-red-700' : taskBlock.priority === 'medium' ? 'bg-yellow-700' : 'bg-green-700'}`}>{taskBlock.priority}</span>
                        </div>
                    </BlockWrapper>
                );
            case 'divider':
                const dividerBlock = block as DividerBlock;
                return (
                    <BlockWrapper key={block.id}>
                        <hr className={`my-8 border-${dividerBlock.thickness || 1}`} style={{ borderStyle: dividerBlock.style || 'solid', borderColor: dividerBlock.color || 'gray' }} />
                    </BlockWrapper>
                );
            // ... more block types
            default:
                return (
                    <BlockWrapper key={block.id}>
                        <div className="bg-red-900/20 p-4 rounded-md text-red-400">
                            Unknown Block Type: {block.type} (ID: {block.id})
                            <button className="ml-4 text-sm text-red-300 hover:underline" onClick={() => onDeleteBlock(block.id)}>Remove</button>
                        </div>
                    </BlockWrapper>
                );
        }
    }, [activeBlockId, comments, onlineUsers, currentUser, trackChangesEnabled, onUpdateBlock, onDeleteBlock, onInsertBlock, editorInteraction]);


    return (
        <div ref={editorRef} className="document-surface flex-grow p-12 overflow-y-auto relative"
             onKeyUp={() => { /* onSelectionChange logic, onCursorChange logic */ }}
             onMouseUp={() => { /* onSelectionChange logic */ }}
             onContextMenu={(e) => editorInteraction.triggerContextMenu(e, [
                 { id: 'editor:paste', label: 'Paste', action: 'editor:paste' },
                 { id: 'editor:add-text-block', label: 'Add Text Block', action: () => onInsertBlock({ id: `new-block-${Date.now()}`, type: 'text', content: '' }, content.length) },
                 { id: 'editor:ai-generate-idea', label: 'AI Generate Idea', action: () => editorInteraction.executeCommand('ai:generate-block', { prompt: 'a new idea for the document' }) }
             ])}
        >
            {renderPresenceCursors()}
            {content.map(renderBlock)}
            {/* Add an empty placeholder block if document is empty for easy starting */}
            {content.length === 0 && (
                <div className="p-4 text-gray-500 text-center">
                    Start typing or use the '+' button to add your first block.
                    <button className="ml-2 text-blue-400 hover:text-blue-300" onClick={() => onInsertBlock({ id: `new-block-${Date.now()}`, type: 'text', content: 'Begin your creation here...' }, 0)}>Add First Block</button>
                </div>
            )}
            {/* Context Menu, Floating Toolbar, Modals would overlay this */}
        </div>
    );
};

// Sidebar Panels
export const AISidebarPanel: React.FC = () => {
    const { aiChatHistory, sendAIChatMessage, aiSuggestions, applyAISuggestion, rejectAISuggestion, generateContent } = useContext(AIContext) as AIContextType;
    const { documentContent, insertBlock } = useContext(DocumentContext) as DocumentContextType;
    const editorInteraction = useContext(EditorInteractionContext) as EditorInteractionContextType;
    const [prompt, setPrompt] = useState('');

    const handleSendMessage = async () => {
        if (prompt.trim()) {
            await sendAIChatMessage(prompt);
            setPrompt('');
        }
    };

    const handleGenerateBlock = async () => {
        if (prompt.trim()) {
            const generatedBlocks = await generateContent(prompt);
            if (generatedBlocks.length > 0) {
                insertBlock(generatedBlocks[0], documentContent.length); // Insert at end
                editorInteraction.closeSidebarPanel();
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-800 border-l border-gray-700 p-4 text-sm">
            <h2 className="text-lg font-bold mb-4 text-blue-300">AI Companion</h2>
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                {aiChatHistory.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'}`}>
                            {msg.content}
                            {msg.citations && msg.citations.length > 0 && (
                                <div className="text-xs text-gray-400 mt-1">
                                    Citations: {msg.citations.map(c => <a key={c.id} href={c.source} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300">{c.id.substring(0,4)}...</a>)}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {aiSuggestions.filter(s => s.status === 'pending').map(s => (
                    <div key={s.id} className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-700 text-yellow-100">
                        <p className="font-semibold">AI Suggestion ({s.type}):</p>
                        <p className="text-sm my-2">{typeof s.suggestedContent === 'string' ? s.suggestedContent : JSON.stringify(s.suggestedContent).substring(0, 100) + '...'}</p>
                        <div className="flex space-x-2 text-xs">
                            <button onClick={() => applyAISuggestion(s.id)} className="px-2 py-1 bg-green-600 rounded hover:bg-green-700">Apply</button>
                            <button onClick={() => rejectAISuggestion(s.id)} className="px-2 py-1 bg-red-600 rounded hover:bg-red-700">Reject</button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 flex flex-col space-y-2">
                <textarea
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                    placeholder="Ask AI anything about your document..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                />
                <div className="flex space-x-2">
                    <button
                        onClick={handleSendMessage}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                        disabled={!prompt.trim()}
                    >
                        Send to AI
                    </button>
                    <button
                        onClick={handleGenerateBlock}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
                        disabled={!prompt.trim()}
                    >
                        Generate Block
                    </button>
                </div>
            </div>
        </div>
    );
};

export const CollaborationSidebarPanel: React.FC = () => {
    const { onlineUsers, comments, addComment, resolveCommentThread, replyToComment } = useContext(CollaborationContext) as CollaborationContextType;
    const { settings } = useContext(SettingsContext) as SettingsContextType; // Assuming currentUser is available here
    const currentUser = { id: settings.userId, name: 'You' }; // Mock current user from settings
    const [newCommentContent, setNewCommentContent] = useState('');
    const [activeCommentId, setActiveCommentId] = useState<string | null>(null); // For replying

    const handleAddComment = () => {
        if (newCommentContent.trim()) {
            addComment({ content: newCommentContent, blockId: 'block2' }); // Example: associate with a block
            setNewCommentContent('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-800 border-l border-gray-700 p-4 text-sm">
            <h2 className="text-lg font-bold mb-4 text-green-300">Collaboration</h2>
            <div className="mb-4">
                <h3 className="text-md font-semibold mb-2">Online Users ({onlineUsers.length})</h3>
                <div className="flex flex-wrap gap-2">
                    {onlineUsers.map(u => (
                        <div key={u.user.id} className="flex items-center space-x-1 bg-gray-700 px-2 py-1 rounded-full text-xs">
                            <img src={u.user.avatarUrl || 'https://i.pravatar.cc/20?img=1'} alt={u.user.name} className="h-4 w-4 rounded-full" />
                            <span>{u.user.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2">
                <h3 className="text-md font-semibold mb-2">Comments ({comments.filter(c => !c.resolved).length} unresolved)</h3>
                <div className="space-y-4">
                    {comments.filter(c => !c.resolved).map(comment => (
                        <div key={comment.id} className="bg-gray-700 p-3 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <img src={comment.author.avatarUrl || 'https://i.pravatar.cc/20?img=1'} alt={comment.author.name} className="h-5 w-5 rounded-full" />
                                <span className="font-semibold">{comment.author.name}</span>
                                <span className="text-xs text-gray-400">{new Date(comment.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-gray-100 text-sm">{comment.content}</p>
                            {comment.blockId && <p className="text-xs text-blue-300 mt-1">On block: {comment.blockId}</p>}
                            <div className="mt-2 text-xs flex space-x-2">
                                <button onClick={() => resolveCommentThread(comment.id)} className="text-green-400 hover:underline">Resolve</button>
                                <button onClick={() => setActiveCommentId(comment.id)} className="text-blue-400 hover:underline">Reply</button>
                            </div>
                            {comment.replies.length > 0 && (
                                <div className="ml-4 mt-2 space-y-2 border-l border-gray-600 pl-2">
                                    {comment.replies.map(reply => (
                                        <div key={reply.id} className="bg-gray-600 p-2 rounded-lg">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <img src={reply.author.avatarUrl || 'https://i.pravatar.cc/16?img=1'} alt={reply.author.name} className="h-4 w-4 rounded-full" />
                                                <span className="font-semibold">{reply.author.name}</span>
                                                <span className="text-xs text-gray-400">{new Date(reply.timestamp).toLocaleTimeString()}</span>
                                            </div>
                                            <p className="text-gray-200 text-xs">{reply.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {activeCommentId === comment.id && (
                                <div className="mt-2 flex space-x-2">
                                    <input
                                        type="text"
                                        className="flex-grow p-1 rounded bg-gray-600 text-white text-xs"
                                        placeholder="Write a reply..."
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                                replyToComment(comment.id, e.currentTarget.value);
                                                e.currentTarget.value = '';
                                                setActiveCommentId(null);
                                            }
                                        }}
                                    />
                                    <button onClick={() => setActiveCommentId(null)} className="text-red-400 hover:underline">Cancel</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
                <h3 className="text-md font-semibold mb-2">Add New Comment</h3>
                <textarea
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                    placeholder="Your comment..."
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    rows={2}
                />
                <button
                    onClick={handleAddComment}
                    className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                    disabled={!newCommentContent.trim()}
                >
                    Add Comment
                </button>
            </div>
        </div>
    );
};

export const OutlineSidebarPanel: React.FC<{ documentContent: DocumentContent; focusBlock: (blockId: string) => void }> = ({ documentContent, focusBlock }) => {
    const headings = documentContent.filter(block => block.type === 'heading') as TextBlock[];

    return (
        <div className="flex flex-col h-full bg-gray-800 border-l border-gray-700 p-4 text-sm">
            <h2 className="text-lg font-bold mb-4 text-purple-300">Document Outline</h2>
            <nav className="flex-grow overflow-y-auto space-y-2">
                {headings.length === 0 && <p className="text-gray-400">No headings found. Add H1, H2, H3 blocks to create an outline.</p>}
                {headings.map(h => (
                    <a
                        key={h.id}
                        href={`#${h.id}`}
                        onClick={(e) => { e.preventDefault(); focusBlock(h.id); }}
                        className={`block text-gray-300 hover:text-white hover:bg-gray-700 p-1 rounded transition-colors ${h.level === 1 ? 'font-bold text-base' : h.level === 2 ? 'ml-4 text-sm' : 'ml-8 text-xs'}`}
                    >
                        {h.content}
                    </a>
                ))}
            </nav>
        </div>
    );
};

export const VersionHistorySidebarPanel: React.FC = () => {
    const [versions, setVersions] = useState<Change[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching version history
        const fetchVersions = async () => {
            await new Promise(resolve => setTimeout(resolve, 800));
            const mockVersions: Change[] = [
                { id: 'v1', timestamp: '2023-10-26T10:00:00Z', author: { id: 'ai-core', name: 'AI Programmer' }, type: 'insert', details: 'Initial draft', revertable: false },
                { id: 'v2', timestamp: '2023-10-26T10:15:00Z', author: { id: 'ai-core', name: 'AI Programmer' }, type: 'update', details: 'Added image block and AI features', revertable: true },
                { id: 'v3', timestamp: '2023-10-26T10:30:00Z', author: { id: 'coll-user', name: 'Collaborator A' }, type: 'format', details: 'Adjusted heading style', revertable: true },
                { id: 'v4', timestamp: '2023-10-26T10:45:00Z', author: { id: 'system', name: 'Autosave' }, type: 'update', details: 'Minor text edits', revertable: true },
            ];
            setVersions(mockVersions);
            setLoading(false);
        };
        fetchVersions();
    }, []);

    const restoreVersion = (versionId: string) => {
        console.log(`Restoring to version: ${versionId}`);
        // This would trigger a document reload or an operational transformation to revert changes
        // A notification would confirm.
    };

    const compareVersion = (versionId: string) => {
        console.log(`Comparing with version: ${versionId}`);
        // This would open a diff view
    };

    return (
        <div className="flex flex-col h-full bg-gray-800 border-l border-gray-700 p-4 text-sm">
            <h2 className="text-lg font-bold mb-4 text-orange-300">Version History</h2>
            {loading ? (
                <p className="text-gray-400">Loading history...</p>
            ) : (
                <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                    {versions.map(version => (
                        <div key={version.id} className="bg-gray-700 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-gray-100">{version.author.name}</span>
                                <span className="text-xs text-gray-400">{new Date(version.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-gray-200 text-xs truncate">{version.details}</p>
                            {version.revertable && (
                                <div className="mt-2 text-xs flex space-x-2">
                                    <button onClick={() => restoreVersion(version.id)} className="text-blue-400 hover:underline">Restore</button>
                                    <button onClick={() => compareVersion(version.id)} className="text-purple-400 hover:underline">Compare</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <div className="mt-4 pt-4 border-t border-gray-700">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">Create Branch</button>
                <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded mt-2">Merge History</button>
            </div>
        </div>
    );
};

export const PluginSidebarPanel: React.FC = () => {
    const { registry, togglePlugin, getPluginSidebarComponent } = useContext(PluginRegistryContext) as PluginRegistryContextType;
    const { documentContent } = useContext(DocumentContext) as DocumentContextType;
    const editorInteraction = useContext(EditorInteractionContext) as EditorInteractionContextType;

    const availablePlugins = registry.plugins;
    const activePlugins = registry.activePlugins;

    return (
        <div className="flex flex-col h-full bg-gray-800 border-l border-gray-700 p-4 text-sm">
            <h2 className="text-lg font-bold mb-4 text-teal-300">Plugins & Extensions</h2>
            <div className="flex-grow overflow-y-auto pr-2">
                <h3 className="font-semibold mb-2">Installed Plugins ({availablePlugins.length})</h3>
                <div className="space-y-3 mb-6">
                    {availablePlugins.map(plugin => (
                        <div key={plugin.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                            <div>
                                <h4 className="font-semibold text-gray-100">{plugin.name}</h4>
                                <p className="text-xs text-gray-400">{plugin.description}</p>
                            </div>
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={activePlugins.includes(plugin.id)}
                                    onChange={(e) => togglePlugin(plugin.id, e.target.checked)}
                                />
                                <div className="relative w-11 h-6 bg-gray-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    ))}
                </div>

                <h3 className="font-semibold mb-2 mt-4">Active Plugin Panels</h3>
                <div className="space-y-4">
                    {activePlugins.map(pluginId => {
                        const PluginComponent = getPluginSidebarComponent(pluginId);
                        if (PluginComponent) {
                            return (
                                <div key={pluginId} className="bg-gray-700 p-3 rounded-lg">
                                    <h4 className="font-semibold text-gray-100 mb-2">{availablePlugins.find(p => p.id === pluginId)?.name} Panel</h4>
                                    <PluginComponent pluginId={pluginId} documentContent={documentContent} editorApi={registry.getPluginAPI()} />
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">Browse Marketplace</button>
            </div>
        </div>
    );
};

export const NotificationToastContainer: React.FC = () => {
    const { notifications, removeNotification } = useContext(NotificationContext) as NotificationContextType;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 max-w-sm">
            {notifications.map(notif => (
                <div
                    key={notif.id}
                    className={`p-4 rounded-lg shadow-lg flex items-center justify-between animate-fade-in-right ${
                        notif.type === 'info' ? 'bg-blue-600' :
                        notif.type === 'success' ? 'bg-green-600' :
                        notif.type === 'warning' ? 'bg-yellow-600' :
                        notif.type === 'error' ? 'bg-red-600' :
                        'bg-gray-700'
                    } text-white`}
                    role="alert"
                >
                    <div className="flex-grow">
                        <p className="font-semibold">{notif.message}</p>
                        {notif.action && (
                            <button
                                onClick={() => { notif.action?.callback(); removeNotification(notif.id); }}
                                className="text-white underline hover:text-gray-200 text-sm mt-1"
                            >
                                {notif.action.label}
                            </button>
                        )}
                    </div>
                    <button onClick={() => removeNotification(notif.id)} className="ml-4 text-white hover:text-gray-200">
                        &times;
                    </button>
                </div>
            ))}
        </div>
    );
};


// Main Editor Component
const Editor: React.FC = () => {
    // Hardcoded for now, would come from auth context
    const currentUser: UserRef = { id: 'user_ai_dev', name: 'AI Developer', avatarUrl: 'https://i.pravatar.cc/30?u=ai-dev' };
    const docId = 'sovereign-editor-blueprint-v1'; // Example document ID

    // Core Document Management
    const {
        documentContent,
        documentMetadata,
        isLoading,
        error,
        unsavedChanges,
        updateBlock,
        insertBlock,
        deleteBlock,
        applyTransaction,
        setDocumentMetadata
    } = useDocumentManagement(docId);

    // Editor UI State and Interactions
    const {
        viewState,
        setViewState,
        setSelection,
        setCursorPosition,
        focusBlock,
        openSidebarPanel,
        closeSidebarPanel,
        executeCommand,
        registerCommand,
        triggerContextMenu
    } = useEditorViewState();

    // Notification System
    const notificationManager = useNotifications();

    // AI Companion
    const aiCompanion = useAICompanion(documentContent);

    // Collaboration
    const collaboration = useCollaboration(docId, currentUser);

    // Context for Plugin API (simplified here, would be more robust)
    const pluginAPI: PluginAPI = {
        getDocument: () => ({ content: documentContent, metadata: documentMetadata! }),
        updateDocument: (changes, source) => {
            console.log(`Plugin update from ${source}:`, changes);
            // This would translate changes to updateBlock/insertBlock/deleteBlock or apply a transaction
            notificationManager.addNotification({ message: `Plugin (${source}) updated document!`, type: 'info' });
        },
        getSelection: () => viewState.selection,
        setSelection,
        insertBlock: (block, atIndex) => insertBlock(block, atIndex ?? documentContent.length),
        deleteBlock,
        addNotification: notificationManager.addNotification,
        openModal: (modalId, component, props) => executeCommand('editor:open-modal', { modalId, component, props }), // Route through command system
        registerCommand // Allow plugins to register commands
    };

    // Plugin Manager
    const pluginManager = usePluginManager(pluginAPI, {
        setSelection,
        setCursorPosition,
        focusBlock,
        openSidebarPanel,
        closeSidebarPanel,
        executeCommand,
        registerCommand,
        triggerContextMenu,
        viewState,
        setViewState
    });

    useEffect(() => {
        pluginManager.loadPlugins();
        // Register plugin-specific commands from the plugin manager
        pluginManager.registry.plugins.forEach(plugin => {
            plugin.toolbarItems?.forEach(item => {
                if (typeof item.action === 'string') {
                    registerCommand(item.action, () => console.log(`Plugin toolbar action for ${plugin.name}: ${item.action}`));
                }
            });
            plugin.keyboardShortcuts?.forEach(shortcut => {
                if (typeof shortcut.action === 'string') {
                    registerCommand(shortcut.action, () => console.log(`Plugin shortcut action for ${plugin.name}: ${shortcut.action}`));
                }
            });
        });
    }, [pluginManager, registerCommand]);


    // Placeholder for Theme Management (would use useTheme hook)
    const currentTheme: ThemeConfig = {
        id: 'default-dark',
        name: 'Dark Mode',
        colors: {
            primary: '#2D3748', // gray-800
            secondary: '#1A202C', // gray-900
            text: '#E2E8F0', // gray-200
            background: '#111827', // gray-900 in original
            accent: '#3B82F6', // blue-500
        },
        fonts: { serif: 'Georgia, serif', sansSerif: 'Arial, sans-serif', monospace: 'Consolas, monospace' },
        typography: {}, // Detailed styles
        dark: true
    };
    const availableThemes: ThemeConfig[] = [currentTheme];
    const setTheme = useCallback((id: string) => console.log('Setting theme:', id), []);
    const toggleDarkMode = useCallback(() => console.log('Toggling dark mode'), []);
    const customizeTheme = useCallback((updates: Partial<ThemeConfig>) => console.log('Customizing theme:', updates), []);

    // Placeholder for Settings (would use useSettings hook)
    const settings: SettingsType = {
        userId: currentUser.id,
        interfaceLanguage: 'en-US',
        defaultFont: 'Georgia',
        autoSave: true,
        offlineMode: false,
        keyboardShortcuts: {},
        privacySettings: {
            telemetry: true,
            contentScanning: true,
            aiAssistanceOptIn: true
        },
        accessibility: {
            fontSize: 16,
            highContrastMode: false,
            dyslexiaFriendlyFont: false,
            screenReaderSupport: true,
            keyboardNavigationEnhancements: true,
            reducedMotion: false,
            voiceControlEnabled: false,
            autoAltTextEnabled: true,
            hapticFeedbackEnabled: true,
        },
        exportDefaults: {},
    };
    const updateSetting = useCallback((key: keyof SettingsType, value: any) => console.log(`Updating setting ${key} to ${value}`), []);
    const resetSettings = useCallback(() => console.log('Resetting settings'), []);


    // Provide the document and editor contexts to all children
    const documentContextValue: DocumentContextType = {
        documentContent,
        documentMetadata: documentMetadata!,
        updateBlock,
        insertBlock,
        deleteBlock,
        applyTransaction,
    };

    const editorInteractionContextValue: EditorInteractionContextType = {
        viewState,
        setViewState,
        setSelection,
        setCursorPosition,
        focusBlock,
        openSidebarPanel,
        closeSidebarPanel,
        executeCommand,
        registerCommand,
        triggerContextMenu
    };

    const aiContextValue: AIContextType = {
        aiPanelOpen: aiCompanion.aiPanelOpen,
        aiChatHistory: aiCompanion.aiChatHistory,
        aiSuggestions: aiCompanion.aiSuggestions,
        aiInsights: aiCompanion.aiInsights,
        sendAIChatMessage: aiCompanion.sendAIChatMessage,
        requestAISuggestion: aiCompanion.requestAISuggestion,
        applyAISuggestion: aiCompanion.applyAISuggestion,
        rejectAISuggestion: aiCompanion.rejectAISuggestion,
        generateContent: aiCompanion.generateContent,
        summarizeContent: aiCompanion.summarizeContent,
        translateContent: aiCompanion.translateContent,
    };

    const themeContextValue: ThemeContextType = {
        currentTheme,
        availableThemes,
        setTheme,
        toggleDarkMode,
        customizeTheme
    };

    const collaborationContextValue: CollaborationContextType = {
        onlineUsers: collaboration.onlineUsers,
        comments: collaboration.comments,
        pendingChanges: collaboration.pendingChanges,
        trackChangesEnabled: collaboration.trackChangesEnabled,
        addComment: collaboration.addComment,
        replyToComment: collaboration.replyToComment,
        resolveCommentThread: collaboration.resolveCommentThread,
        sendPresenceUpdate: collaboration.sendPresenceUpdate,
        enableTrackChanges: collaboration.enableTrackChanges,
        acceptChange: collaboration.acceptChange,
        rejectChange
    };

    const settingsContextValue: SettingsContextType = {
        settings,
        updateSetting,
        resetSettings
    };

    const pluginRegistryContextValue: PluginRegistryContextType = {
        registry: pluginManager.registry,
        loadPlugins: pluginManager.loadPlugins,
        togglePlugin: pluginManager.togglePlugin,
        getPluginSettingsComponent: pluginManager.getPluginSettingsComponent,
        getPluginSidebarComponent: pluginManager.getPluginSidebarComponent,
        getPluginToolbarItems: pluginManager.getPluginToolbarItems
    };

    const notificationContextValue: NotificationContextType = {
        notifications: notificationManager.notifications,
        addNotification: notificationManager.addNotification,
        removeNotification: notificationManager.removeNotification
    };

    const accessibilityContextValue: AccessibilityContextType = {
        accessibilitySettings: settings.accessibility,
        updateAccessibilitySetting: (key, value) => updateSetting('accessibility', { ...settings.accessibility, [key]: value })
    };

    // Placeholder for LocalizationContextType
    const localizationContextValue: LocalizationContextType = {
        currentLocale: 'en-US',
        supportedLocales: [{ code: 'en-US', name: 'English (US)' }, { code: 'es-ES', name: 'Español (España)' }],
        setLocale: (locale) => console.log('Set locale to', locale),
        t: (key) => key // Simple passthrough for mock
    };

    // Placeholder for WorkflowContextType
    const workflowContextValue: WorkflowContextType = {
        linkedWorkflows: [],
        addWorkflowTask: async (task) => {
             const newTask: WorkflowTask = { ...task, id: `task-${Date.now()}` };
             console.log('Adding workflow task:', newTask);
             return newTask;
        },
        updateWorkflowTask: async (taskId, updates) => {
            console.log(`Updating task ${taskId} with`, updates);
            return { id: taskId, name: 'Mock Task', status: 'pending', assignees: [], priority: 'low', linkedDocumentIds: [], ...updates };
        }
    };


    if (isLoading) {
        return (
            <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
                <p className="text-xl">Loading the universe of creation...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900 text-white min-h-screen flex items-center justify-center">
                <p className="text-xl">Error: {error}</p>
            </div>
        );
    }

    const { isAICompanionOpen, isCollaborationPanelOpen, isOutlinePanelOpen, isVersionHistoryOpen } = viewState;
    const isAnyPanelOpen = isAICompanionOpen || isCollaborationPanelOpen || isOutlinePanelOpen || isVersionHistoryOpen || viewState.isPluginPanelOpen || viewState.isSettingsPanelOpen || viewState.isTasksPanelOpen;


    return (
        <ThemeContext.Provider value={themeContextValue}>
        <SettingsContext.Provider value={settingsContextValue}>
        <DocumentContext.Provider value={documentContextValue}>
        <EditorInteractionContext.Provider value={editorInteractionContextValue}>
        <AIContext.Provider value={aiContextValue}>
        <CollaborationContext.Provider value={collaborationContextValue}>
        <PluginRegistryContext.Provider value={pluginRegistryContextValue}>
        <NotificationContext.Provider value={notificationContextValue}>
        <AccessibilityContext.Provider value={accessibilityContextValue}>
        <LocalizationContext.Provider value={localizationContextValue}>
        <WorkflowContext.Provider value={workflowContextValue}>
            <div className={`bg-gray-900 text-white min-h-screen flex flex-col ${viewState.isImmersiveMode ? 'p-0' : ''}`} style={{ fontFamily: currentTheme.fonts.sansSerif }}>
                <header className={`w-full p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between ${viewState.isImmersiveMode ? 'hidden' : ''}`}>
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-bold">Docs</h1>
                        <span className="text-gray-400">|</span>
                        <h2 className="text-lg text-blue-300">{documentMetadata?.title}</h2>
                        <span className="text-sm text-gray-500">{unsavedChanges ? '(Unsaved Changes)' : '(Saved)'}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        {collaboration.onlineUsers.length > 0 && (
                            <div className="flex items-center space-x-1">
                                <span className="text-gray-400 text-sm">Online:</span>
                                <div className="flex -space-x-2 overflow-hidden">
                                    {collaboration.onlineUsers.map(u => (
                                        <img key={u.user.id} className="inline-block h-6 w-6 rounded-full ring-2 ring-gray-800" src={u.user.avatarUrl || 'https://i.pravatar.cc/30?img=1'} alt={u.user.name} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <button className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm" onClick={() => executeCommand('editor:open-command-palette')}>
                            Command Palette (⌘K)
                        </button>
                        <button className="bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded text-sm" onClick={() => executeCommand('editor:toggle-immersive-mode')}>
                            {viewState.isImmersiveMode ? 'Exit Immersive' : 'Immersive Mode'}
                        </button>
                    </div>
                </header>

                <Toolbar documentMetadata={documentMetadata} editorCommands={editorInteractionContextValue} pluginToolbarItems={pluginManager.getPluginToolbarItems()} />

                <div className="flex flex-grow w-full max-w-screen-2xl mx-auto">
                    <div className={`flex-grow bg-white text-gray-900 flex flex-col ${isAnyPanelOpen ? 'max-w-[calc(100%-300px)]' : 'max-w-full'}`}>
                        <RichTextSurface
                            content={documentContent}
                            onUpdateBlock={updateBlock}
                            onInsertBlock={insertBlock}
                            onDeleteBlock={deleteBlock}
                            onSelectionChange={setSelection}
                            onCursorChange={setCursorPosition}
                            activeBlockId={viewState.activeBlockId}
                            currentUser={currentUser}
                            onlineUsers={collaboration.onlineUsers}
                            comments={collaboration.comments}
                            editorInteraction={editorInteractionContextValue}
                            trackChangesEnabled={collaboration.trackChangesEnabled}
                        />
                    </div>

                    <aside className={`flex-shrink-0 w-80 bg-gray-900 border-l border-gray-700 ${isAnyPanelOpen ? '' : 'hidden'}`}>
                        {isOutlinePanelOpen && <OutlineSidebarPanel documentContent={documentContent} focusBlock={focusBlock} />}
                        {isAICompanionOpen && <AISidebarPanel />}
                        {isCollaborationPanelOpen && <CollaborationSidebarPanel />}
                        {isVersionHistoryOpen && <VersionHistorySidebarPanel />}
                        {viewState.isPluginPanelOpen && <PluginSidebarPanel />}
                        {/* {viewState.isSettingsPanelOpen && <SettingsPanel />} */}
                        {/* {viewState.isTasksPanelOpen && <TaskIntegrationPanel />} */}
                        {/* More sidebar panels */}
                    </aside>
                </div>
                <NotificationToastContainer />
                {/* Modals, Context Menus, Command Palettes would be rendered here */}
            </div>
        </WorkflowContext.Provider>
        </LocalizationContext.Provider>
        </AccessibilityContext.Provider>
        </NotificationContext.Provider>
        </PluginRegistryContext.Provider>
        </CollaborationContext.Provider>
        </AIContext.Provider>
        </EditorInteractionContext.Provider>
        </DocumentContext.Provider>
        </SettingsContext.Provider>
        </ThemeContext.Provider>
    );
};

export default Editor;