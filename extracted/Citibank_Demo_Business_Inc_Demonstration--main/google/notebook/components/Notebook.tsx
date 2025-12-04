```typescript
// google/notebook/components/Notebook.tsx
// The Scroll Itself. A container for a sequence of thoughts, experiments, and conclusions.

import React, { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import { Cell, CellType } from '../types'; // Original imports MUST NOT change
import CodeCell from './CodeCell'; // Original imports MUST NOT change

// --- Begin Expanded Universe ---

// --- 1. Expanded Types and Interfaces ---

// Extending the existing CellType for new cell capabilities
export enum ExpandedCellType {
    Code = 'code',
    Markdown = 'markdown',
    Data = 'data', // For displaying dataframes, tables
    Visualization = 'visualization', // For charts, graphs
    AIChat = 'ai_chat', // For interactive AI conversations
    SQL = 'sql', // For SQL queries against linked databases
    Drawing = 'drawing', // For collaborative whiteboarding
    Form = 'form', // For interactive user input forms
    WebComponent = 'web_component', // For embedding custom interactive web components
    FileBrowser = 'file_browser', // For embedding a file browser
    Terminal = 'terminal', // For an embedded terminal
    Embed = 'embed', // For embedding external content (YouTube, Figma, etc.)
    Timeline = 'timeline', // For project timelines or historical data
    Map = 'map', // For geographical data visualization
    Audio = 'audio', // For audio playback and analysis
    Video = 'video', // For video playback and annotation
    // ... hundreds more potential cell types like SensorData, 3DModel, CAD, CryptoWallet, BlockchainExplorer, QuantumCircuit, MIDI, Game, VR/AR, etc.
}

// Expanding the Cell interface with many new properties, assuming 'content' can be flexible.
// We'll cast existing `Cell` types to this richer interface for internal use.
export interface EnhancedCell extends Cell {
    type: ExpandedCellType; // Override to allow expanded types
    content: any; // Make content flexible to hold various data structures (string, object, array)
    outputs?: any[]; // Array of output data, rich formats (text, html, images, plots, widgets)
    executionCount?: number;
    status?: 'idle' | 'running' | 'error' | 'success' | 'queued';
    language?: string; // For code cells
    metadata?: {
        collapsed?: boolean;
        hideCode?: boolean;
        hideOutput?: boolean;
        readOnly?: boolean;
        tags?: string[];
        kernel?: string; // Specific kernel for this cell
        editorMode?: 'default' | 'vim' | 'emacs';
        fontSize?: number;
        lineNumbers?: boolean;
        wordWrap?: boolean;
        indentation?: number;
        // ... many more metadata options
        [key: string]: any; // Allow arbitrary metadata
    };
    versionHistory?: CellVersion[]; // For per-cell versioning
    comments?: CellComment[]; // For per-cell comments
    collaborators?: { id: string; cursor?: { start: number; end: number; }; }[]; // Users currently interacting with this cell
    inputPrompt?: string; // For AI cells or form cells
    result?: any; // For AI or form cell results
    config?: Record<string, any>; // Configuration specific to the cell type (e.g., chart type, database connection)
    lastModified?: string;
    createdAt?: string;
    author?: string;
    visibility?: 'public' | 'private' | 'restricted' | 'team';
    dependencies?: string[]; // IDs of cells this cell depends on for execution order or data flow
    error?: {
        name: string;
        message: string;
        traceback?: string;
        code?: number;
        helpUrl?: string;
    };
    linkedDatasource?: { type: 'internal' | 'external'; id: string; query?: string; }; // For data/viz cells
    executionTime?: { start: string; end: string; durationMs: number; };
    securityContext?: { userId: string; roles: string[]; }; // For fine-grained access
    resourceUsage?: { cpu: number; memory: number; gpu?: number; }; // Telemetry for execution
    aiAnalysis?: { summary: string; suggestions: string[]; sentiment: string; }; // AI-generated insights for the cell
    isPinned?: boolean;
    priority?: number; // For scheduling executions
}

export interface CellVersion {
    timestamp: string;
    author: string;
    content: any; // Snapshot of cell content
    metadata?: Record<string, any>;
    diff?: any; // Difference from previous version, e.g., git patch format
    message?: string; // Commit message for this version
}

export interface CellComment {
    id: string;
    author: string;
    timestamp: string;
    text: string;
    resolved?: boolean;
    replies?: CellComment[];
    reactions?: { emoji: string; userId: string; }[];
    targetTextRange?: { start: number; end: number; }; // For inline comments on content
}

export interface UserProfile {
    id: string;
    name: string;
    avatarUrl: string;
    status: 'online' | 'offline' | 'typing' | 'away';
    cursorPosition?: { cellId: string; start: number; end: number; }; // For real-time cursor in text cells
    lastActive?: string;
    permissions?: 'viewer' | 'editor' | 'admin';
}

export interface NotebookMetadata {
    id: string;
    title: string;
    description: string;
    author: string;
    createdAt: string;
    lastModified: string;
    tags: string[];
    visibility: 'public' | 'private' | 'restricted' | 'team';
    sharedWith: { userId: string; permissions: 'viewer' | 'editor' | 'admin'; }[]; // User IDs or group IDs
    kernels: KernelInfo[];
    defaultKernelId: string;
    theme: string;
    settings: {
        autoSaveInterval: number; // seconds
        editorFontSize: number;
        enableAISuggestions: boolean;
        layout: 'default' | 'zen' | 'two-column' | 'grid';
        indentation: number;
        lineNumbers: boolean;
        wordWrap: boolean;
        showGutter: boolean;
        terminalTheme: string;
        dataExportFormat: 'csv' | 'json' | 'parquet' | 'xlsx';
        accessibilityMode: boolean;
        highContrast: boolean;
        notificationSound: boolean;
        debugMode: boolean;
        realtimeCollaboration: boolean;
        versionControlIntegration: 'none' | 'git' | 'internal';
        apiKeyManagement: { [service: string]: string }; // Secure storage would be backend
        hotkeys: Record<string, string>; // Customizable hotkeys
        codeFormatter: 'prettier' | 'black' | 'none';
        lintingEnabled: boolean;
        codeCompletionEnabled: boolean;
        dragAndDropEnabled: boolean;
        imageUploadTarget: 'local' | 'cloud';
        // ... many more global settings
        [key: string]: any;
    };
    version?: number; // Notebook version
    historyId?: string; // Link to a global version history system
    plugins?: { [pluginId: string]: { enabled: boolean; config: any; }; }; // Active plugins and their configs
    projectDirectory?: string; // For file browser scope
    cloudProvider?: 'google' | 'aws' | 'azure' | 'local';
    resourceLimits?: { cpu: number; memory: number; gpu: number; runtime: number; }; // For cloud environments
    deploymentTargets?: { id: string; name: string; type: 'web_app' | 'api' | 'data_pipeline'; }[];
    integrations?: { [service: string]: { enabled: boolean; config: any; }; }; // Slack, Jira, GitHub, etc.
}

export interface KernelInfo {
    id: string;
    name: string;
    language: string;
    status: 'idle' | 'busy' | 'restarting' | 'disconnected' | 'starting';
    env?: Record<string, string>;
    version?: string;
    logoUrl?: string;
    capabilities?: string[]; // e.g., 'dataframe', 'plots', 'ai-integration'
    supportedCellTypes?: ExpandedCellType[];
}

export interface Notification {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success' | 'system' | 'collaborator';
    message: string;
    timestamp: string;
    read: boolean;
    action?: { label: string; handler: () => void; };
    source?: string; // e.g., 'kernel', 'autosave', 'Alice'
}

export interface Command {
    id: string;
    label: string;
    icon?: string; // Emoji or path to SVG
    shortcut?: string; // e.g., 'Cmd+S', 'Ctrl+Shift+P'
    handler: (context?: any) => void;
    category?: string;
    visible?: (context?: any) => boolean;
    description?: string;
}

// --- 2. Contexts for Global State and Actions ---

export interface NotebookContextType {
    notebookId: string;
    cells: EnhancedCell[];
    setCells: React.Dispatch<React.SetStateAction<EnhancedCell[]>>;
    activeCellId: string | null;
    setActiveCellId: (id: string | null) => void;
    notebookMetadata: NotebookMetadata;
    setNotebookMetadata: React.Dispatch<React.SetStateAction<NotebookMetadata>>;
    users: UserProfile[]; // Collaborating users
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    executeCell: (cellId: string) => Promise<any>;
    updateCell: (cellId: string, updates: Partial<EnhancedCell>, pushToHistory?: boolean) => void;
    addCell: (type: ExpandedCellType, content: any, index?: number, metadata?: Record<string, any>) => void;
    deleteCell: (cellId: string) => void;
    moveCell: (fromIndex: number, toIndex: number) => void;
    runAllCells: () => Promise<void>;
    undo: () => void;
    redo: () => void;
    commandPaletteOpen: boolean;
    setCommandPaletteOpen: (open: boolean) => void;
    aiAssistantOpen: boolean;
    setAiAssistantOpen: (open: boolean) => void;
    globalSearchTerm: string;
    setGlobalSearchTerm: (term: string) => void;
    saveNotebook: () => Promise<void>;
    loadNotebook: (notebookId: string) => Promise<void>;
    toggleSidebarPanel: (panel: 'outline' | 'variables' | 'files' | 'plugins') => void;
    activeSidebarPanel: 'outline' | 'variables' | 'files' | 'plugins';
    // ... many more actions for advanced features like plugin management, deployments, debugging, etc.
}

export const NotebookContext = createContext<NotebookContextType | undefined>(undefined);

export const useNotebook = () => {
    const context = useContext(NotebookContext);
    if (!context) {
        throw new Error('useNotebook must be used within a NotebookProvider');
    }
    return context;
};

// --- 3. Helper Functions and Utilities ---

export const generateUniqueId = (prefix: string = 'id') => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const debounce = (func: Function, delay: number) => {
    let timeout: NodeJS.Timeout;
    return function (...args: any[]) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

export const applyTheme = (themeName: string) => {
    // In a real app, this would dynamically load CSS or update CSS variables
    document.documentElement.setAttribute('data-theme', themeName);
    document.body.className = `theme-${themeName} bg-gray-900 text-white min-h-screen font-sans`; // Update body classes
    console.log(`Applied theme: ${themeName}`);
};

export const getAvailableKernels = (): KernelInfo[] => {
    // Mocking a backend call to get available kernels
    return [
        { id: 'python-3.10', name: 'Python 3.10', language: 'python', status: 'idle', version: '3.10.6', capabilities: ['dataframe', 'plots', 'ai-integration'], supportedCellTypes: [ExpandedCellType.Code, ExpandedCellType.Data, ExpandedCellType.Visualization] },
        { id: 'javascript-node', name: 'Node.js', language: 'javascript', status: 'idle', version: '18.12.1', capabilities: ['web-component', 'terminal'], supportedCellTypes: [ExpandedCellType.Code, ExpandedCellType.WebComponent, ExpandedCellType.Terminal] },
        { id: 'r-4.2', name: 'R 4.2', language: 'r', status: 'disconnected', version: '4.2.2', capabilities: ['dataframe', 'plots'], supportedCellTypes: [ExpandedCellType.Code, ExpandedCellType.Data, ExpandedCellType.Visualization] },
        { id: 'julia-1.8', name: 'Julia 1.8', language: 'julia', status: 'idle', version: '1.8.5', capabilities: ['quantum'], supportedCellTypes: [ExpandedCellType.Code] },
        { id: 'sql-postgres', name: 'PostgreSQL', language: 'sql', status: 'idle', version: '14.5', capabilities: ['database-query'], supportedCellTypes: [ExpandedCellType.SQL] },
        { id: 'gcp-bigquery', name: 'BigQuery', language: 'sql', status: 'idle', version: '1.0', capabilities: ['cloud-database'], supportedCellTypes: [ExpandedCellType.SQL] },
        { id: 'openai-gpt4', name: 'GPT-4', language: 'ai', status: 'idle', version: '4.0', capabilities: ['text-generation', 'code-generation', 'analysis'], supportedCellTypes: [ExpandedCellType.AIChat] },
    ];
};

export const parseCodeOutputs = (rawOutput: string, language: string): any[] => {
    // Sophisticated parsing logic based on language and output format
    // This would typically involve rich mime types (e.g., application/json, image/png, text/html)
    // For simplicity, we'll return a basic structure
    try {
        if (rawOutput.startsWith('{') && rawOutput.endsWith('}')) {
            const parsed = JSON.parse(rawOutput);
            if (parsed.type === 'dataframe') {
                return [{
                    type: 'execute_result',
                    data: { 'application/json': parsed.data, 'text/plain': `DataFrame (${parsed.data.length} rows, ${Object.keys(parsed.data[0] || {}).length} cols)` },
                    metadata: { type: 'dataframe' }
                }];
            }
        }
        if (rawOutput.startsWith('IMAGE_BASE64:')) {
            return [{ type: 'execute_result', data: { 'image/png': rawOutput.substring('IMAGE_BASE64:'.length) }, metadata: { format: 'png' } }];
        }
        if (rawOutput.startsWith('HTML_OUTPUT:')) {
            return [{ type: 'execute_result', data: { 'text/html': rawOutput.substring('HTML_OUTPUT:'.length) }, metadata: { format: 'html' } }];
        }
        return [{ type: 'stream', name: 'stdout', text: rawOutput }];
    } catch (e: any) {
        return [{ type: 'error', name: 'Parsing Error', message: `Failed to parse output: ${e.message}\nRaw: ${rawOutput}` }];
    }
};

export const getMarkdownHeadings = (markdownContent: string) => {
    const headings: { id: string; text: string; level: number; }[] = [];
    const lines = markdownContent.split('\n');
    lines.forEach((line, index) => {
        const match = line.match(/^(#+)\s(.+)$/);
        if (match) {
            const level = match[1].length;
            const text = match[2];
            headings.push({ id: `heading-${index}-${text.replace(/\s+/g, '-').toLowerCase()}`, text, level });
        }
    });
    return headings;
};

// --- 4. New Cell Components (Many more would exist) ---

interface GeneralCellProps {
    cell: EnhancedCell;
    isEditing: boolean;
    onFocus: () => void;
    onUpdateContent: (newContent: any, pushToHistory?: boolean) => void;
    onExecute?: () => void;
    // ... many more props for cell interactions, e.g., onOutputChange, onToggleVisibility
}

export const MarkdownCell: React.FC<GeneralCellProps> = ({ cell, isEditing, onFocus, onUpdateContent }) => {
    const { id, content, metadata } = cell;
    const { addCell, deleteCell, updateCell } = useNotebook();

    const [isHovered, setIsHovered] = useState(false);
    const [editorContent, setEditorContent] = useState(content);

    useEffect(() => {
        setEditorContent(content);
    }, [content]);

    const handleContentChange = debounce((value: string) => {
        onUpdateContent(value, true); // Push to history
    }, 500);

    return (
        <div
            id={`cell-${id}`}
            className={`relative p-3 rounded-lg border ${isEditing ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-700'} ${isHovered ? 'shadow-lg' : ''}`}
            onClick={onFocus}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isHovered && (
                <CellControls cellId={id} cellType={ExpandedCellType.Markdown} className="absolute top-2 right-2 z-10" />
            )}
            {isEditing ? (
                <textarea
                    className="w-full bg-gray-800 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    value={editorContent}
                    onChange={(e) => {
                        setEditorContent(e.target.value);
                        handleContentChange(e.target.value);
                    }}
                    rows={Math.max(3, editorContent.split('\n').length + 1)}
                    style={{ minHeight: '60px' }} // Minimum height
                />
            ) : (
                <div className="prose prose-invert max-w-none break-words" dangerouslySetInnerHTML={{ __html: window.marked.parse(content || '') }}></div>
            )}
            {cell.comments && cell.comments.length > 0 && <CommentSection comments={cell.comments} cellId={id} />}
        </div>
    );
};
// Assuming 'marked' is globally available or imported via a script tag for this example
declare global {
    interface Window {
        marked: { parse: (markdown: string) => string };
    }
}


export const DataCell: React.FC<GeneralCellProps> = ({ cell, isEditing, onFocus, onUpdateContent }) => {
    const { id, content, metadata } = cell;
    const [isHovered, setIsHovered] = useState(false);
    // content would be an object like { data: [[]], columns: [] } or a reference to a dataset
    const displayData = content?.data || [];
    const columns = content?.columns || [];

    const { addCell, deleteCell } = useNotebook();

    // In a real app, a DataTableViewer component would be used for advanced features
    return (
        <div
            id={`cell-${id}`}
            className={`relative p-3 rounded-lg border ${isEditing ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-700'} ${isHovered ? 'shadow-lg' : ''}`}
            onClick={onFocus}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isHovered && <CellControls cellId={id} cellType={ExpandedCellType.Data} className="absolute top-2 right-2 z-10" />}
            <h3 className="font-semibold mb-2 flex items-center">
                <span className="mr-2">📊</span> Data Table <span className="text-gray-400 text-sm ml-2">({displayData.length} rows, {columns.length} columns)</span>
            </h3>
            <div className="overflow-x-auto bg-gray-800 rounded-md p-2 max-h-80">
                <table className="min-w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-700 sticky top-0">
                        <tr>
                            {columns.map((col: string, idx: number) => (
                                <th key={idx} scope="col" className="px-6 py-3">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {displayData.slice(0, 50).map((row: any[], rowIndex: number) => ( // Show first 50 rows for preview
                            <tr key={rowIndex} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700">
                                {row.map((val: any, colIndex: number) => (
                                    <td key={colIndex} className="px-6 py-4">{String(val).substring(0, 100)}</td>
                                ))}
                            </tr>
                        ))}
                        {displayData.length > 50 && (
                            <tr className="bg-gray-800 border-b border-gray-700">
                                <td colSpan={columns.length} className="px-6 py-4 text-center italic">... {displayData.length - 50} more rows (data truncated for display)</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="mt-2 flex justify-end space-x-2">
                <button className="text-blue-400 text-xs hover:underline">View Full Dataset</button>
                <button className="text-blue-400 text-xs hover:underline">Export CSV</button>
                <button className="text-blue-400 text-xs hover:underline">Profile Data</button>
            </div>
            {cell.comments && cell.comments.length > 0 && <CommentSection comments={cell.comments} cellId={id} />}
        </div>
    );
};

export const VisualizationCell: React.FC<GeneralCellProps> = ({ cell, isEditing, onFocus, onUpdateContent }) => {
    const { id, content, metadata } = cell;
    const [isHovered, setIsHovered] = useState(false);
    const chartRef = useRef<HTMLDivElement>(null);
    const { addCell, deleteCell } = useNotebook();

    useEffect(() => {
        if (chartRef.current && content?.chartSpec) {
            // In a real app, this would use a library like Vega-Lite, Chart.js, D3.js
            // For now, we'll simulate a dynamic visualization.
            chartRef.current.innerHTML = `<div class="bg-gray-800 p-4 rounded-md h-64 flex flex-col items-center justify-center text-gray-400 text-center">
                <p class="text-lg font-bold mb-2">${content.chartSpec.title || 'Untitled Chart'}</p>
                <p><strong>Chart Type:</strong> ${content.chartSpec.type || 'Unknown'}</p>
                <p><strong>Data Source:</strong> ${content.chartSpec.dataSource || 'Internal Cell Data'}</p>
                <p class="mt-3"><em>(Interactive Visualization Placeholder - Click to edit spec)</em></p>
                <div class="mt-3 flex space-x-2">
                    <button class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded">Download Image</button>
                    <button class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded">Download Data</button>
                </div>
            </div>`;
            // E.g., embedVegalite(chartRef.current, content.chartSpec, { actions: true });
        }
    }, [content]);

    return (
        <div
            id={`cell-${id}`}
            className={`relative p-3 rounded-lg border ${isEditing ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-700'} ${isHovered ? 'shadow-lg' : ''}`}
            onClick={onFocus}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isHovered && <CellControls cellId={id} cellType={ExpandedCellType.Visualization} className="absolute top-2 right-2 z-10" />}
            <h3 className="font-semibold mb-2">📈 Data Visualization</h3>
            {isEditing ? (
                <textarea
                    className="w-full bg-gray-800 text-white p-2 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={JSON.stringify(content.chartSpec || {}, null, 2)}
                    onChange={(e) => {
                        try {
                            onUpdateContent({ ...content, chartSpec: JSON.parse(e.target.value) }, true);
                        } catch (err) {
                            console.error('Invalid JSON for chart spec:', err);
                        }
                    }}
                    rows={10}
                    style={{ minHeight: '200px' }}
                />
            ) : (
                <div ref={chartRef} className="min-h-[200px]">
                    {/* Chart will be rendered here */}
                </div>
            )}
            {cell.comments && cell.comments.length > 0 && <CommentSection comments={cell.comments} cellId={id} />}
        </div>
    );
};

export const AIChatCell: React.FC<GeneralCellProps> = ({ cell, isEditing, onFocus, onUpdateContent, onExecute }) => {
    const { id, content, outputs, status, metadata } = cell;
    const [isHovered, setIsHovered] = useState(false);
    const [input, setInput] = useState(content?.prompt || '');
    const { executeCell } = useNotebook();

    useEffect(() => {
        setInput(content?.prompt || '');
    }, [content?.prompt]);

    const handleExecute = () => {
        onUpdateContent({ prompt: input }, true); // Save the prompt to content before executing
        onExecute?.(); // Trigger AI processing
    };

    return (
        <div
            id={`cell-${id}`}
            className={`relative p-3 rounded-lg border ${isEditing ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-700'} ${isHovered ? 'shadow-lg' : ''}`}
            onClick={onFocus}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isHovered && <CellControls cellId={id} cellType={ExpandedCellType.AIChat} className="absolute top-2 right-2 z-10" />}
            <h3 className="font-semibold mb-2 flex items-center">
                <span className="mr-2">🤖</span> AI Assistant Chat
                <CellStatusIndicator status={status} executionCount={cell.executionCount} />
                <select className="ml-auto bg-gray-700 text-white text-sm p-1 rounded">
                    {getAvailableKernels().filter(k => k.language === 'ai').map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                </select>
            </h3>
            <div className="flex flex-col space-y-2 mb-2 max-h-64 overflow-y-auto bg-gray-900 p-2 rounded-md">
                {(outputs || []).map((output: any, index: number) => (
                    <div key={index} className={`p-2 rounded-lg max-w-[80%] ${output.role === 'user' ? 'bg-blue-900 self-end' : 'bg-green-900 self-start'}`}>
                        <strong className="capitalize">{output.role}:</strong> {output.text}
                    </div>
                ))}
            </div>
            <textarea
                className="w-full bg-gray-800 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 resize-none"
                placeholder="Ask the AI a question or give a command (e.g., 'Generate code to plot data', 'Summarize this notebook')..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={Math.max(2, input.split('\n').length)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleExecute();
                    }
                }}
            />
            <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm disabled:opacity-50"
                onClick={handleExecute}
                disabled={status === 'running'}
            >
                {status === 'running' ? 'Thinking...' : 'Send to AI'}
            </button>
            {cell.comments && cell.comments.length > 0 && <CommentSection comments={cell.comments} cellId={id} />}
        </div>
    );
};

export const SQLCell: React.FC<GeneralCellProps> = ({ cell, isEditing, onFocus, onUpdateContent, onExecute }) => {
    const { id, content, outputs, status, metadata } = cell;
    const [isHovered, setIsHovered] = useState(false);
    const [query, setQuery] = useState(content?.query || 'SELECT * FROM my_table;');
    const { executeCell } = useNotebook();

    useEffect(() => {
        setQuery(content?.query || '');
    }, [content?.query]);

    const handleExecute = () => {
        onUpdateContent({ query: query }, true);
        onExecute?.();
    };

    return (
        <div
            id={`cell-${id}`}
            className={`relative p-3 rounded-lg border ${isEditing ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-700'} ${isHovered ? 'shadow-lg' : ''}`}
            onClick={onFocus}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isHovered && <CellControls cellId={id} cellType={ExpandedCellType.SQL} className="absolute top-2 right-2 z-10" />}
            <h3 className="font-semibold mb-2 flex items-center">
                <span className="mr-2">🗄️</span> SQL Query
                <CellStatusIndicator status={status} executionCount={cell.executionCount} />
                <select className="ml-auto bg-gray-700 text-white text-sm p-1 rounded">
                    <option>PostgreSQL</option>
                    <option>MySQL</option>
                    <option>SQLite</option>
                    <option>BigQuery (GCP)</option>
                    <option>Snowflake</option>
                </select>
                <button className="ml-2 text-blue-400 text-xs hover:underline">Manage Connections</button>
            </h3>
            <textarea
                className="w-full bg-gray-800 text-white p-2 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 resize-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={Math.max(5, query.split('\n').length)}
            />
            <button
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded text-sm disabled:opacity-50"
                onClick={handleExecute}
                disabled={status === 'running'}
            >
                {status === 'running' ? 'Executing...' : 'Run Query'}
            </button>
            {cell.outputs && cell.outputs.length > 0 && <CellOutputDisplay outputs={outputs} />}
            {cell.comments && cell.comments.length > 0 && <CommentSection comments={cell.comments} cellId={id} />}
        </div>
    );
};

export const DrawingCell: React.FC<GeneralCellProps> = ({ cell, isEditing, onFocus, onUpdateContent }) => {
    const { id, content, metadata } = cell;
    const [isHovered, setIsHovered] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { updateCell, addNotification } = useNotebook();
    const [drawingColor, setDrawingColor] = useState('#ffffff');
    const [strokeWidth, setStrokeWidth] = useState(2);

    // Simplified drawing logic
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Scale canvas for high-DPI displays
        const scale = window.devicePixelRatio;
        canvas.width = canvas.offsetWidth * scale;
        canvas.height = canvas.offsetHeight * scale;
        ctx.scale(scale, scale);

        // Load existing drawing data if any
        if (content?.drawingData) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0, canvas.offsetWidth, canvas.offsetHeight); // Scale image to fit
            img.src = content.drawingData;
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear if no data
        }

        let isDrawing = false;
        const getMousePos = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: (e.clientX - rect.left) / scale,
                y: (e.clientY - rect.top) / scale
            };
        };

        const startDrawing = (e: MouseEvent) => {
            isDrawing = true;
            const pos = getMousePos(e);
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.strokeStyle = drawingColor;
            ctx.lineWidth = strokeWidth;
        };

        const draw = (e: MouseEvent) => {
            if (!isDrawing) return;
            const pos = getMousePos(e);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        };

        const stopDrawing = () => {
            isDrawing = false;
            // Save drawing state (e.g., to base64) for real-time sync
            if (canvas) {
                onUpdateContent({ drawingData: canvas.toDataURL() }, false); // Don't push to history on every stroke
                addNotification({type: 'info', message: `Drawing updated in cell ${id}`});
            }
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing); // Stop drawing if mouse leaves canvas

        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseout', stopDrawing);
        };
    }, [content, onUpdateContent, drawingColor, strokeWidth, addNotification]); // Depend on content to load initial state

    const handleClearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                onUpdateContent({ drawingData: '' }, true); // Clear content and push to history
                addNotification({type: 'info', message: `Drawing cleared in cell ${id}`});
            }
        }
    };

    return (
        <div
            id={`cell-${id}`}
            className={`relative p-3 rounded-lg border ${isEditing ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-700'} ${isHovered ? 'shadow-lg' : ''}`}
            onClick={onFocus}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isHovered && <CellControls cellId={id} cellType={ExpandedCellType.Drawing} className="absolute top-2 right-2 z-10" />}
            <h3 className="font-semibold mb-2 flex items-center">
                <span className="mr-2">🎨</span> Collaborative Whiteboard
                <div className="ml-auto flex items-center space-x-2 text-sm">
                    <label htmlFor="drawing-color" className="text-gray-400">Color:</label>
                    <input type="color" id="drawing-color" value={drawingColor} onChange={(e) => setDrawingColor(e.target.value)} className="h-6 w-6 rounded cursor-pointer" />
                    <label htmlFor="stroke-width" className="text-gray-400">Width:</label>
                    <input type="range" id="stroke-width" min="1" max="10" value={strokeWidth} onChange={(e) => setStrokeWidth(parseInt(e.target.value))} className="w-20 cursor-pointer" />
                    <button onClick={handleClearCanvas} className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded">Clear</button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded">Export PNG</button>
                </div>
            </h3>
            <div className="relative bg-gray-800 rounded-md">
                <canvas
                    ref={canvasRef}
                    width={800} // Fixed base width for example, scaled by CSS/JS
                    height={400} // Fixed base height for example, scaled by CSS/JS
                    className="w-full h-[400px] border border-gray-600 bg-gray-900 cursor-crosshair"
                ></canvas>
                {/* Overlay for showing other collaborators' cursors/drawings */}
                {cell.collaborators?.map(collab => (
                    collab.cursor && (
                        <div key={collab.id}
                            className="absolute bg-blue-500 rounded-full w-2 h-2 pointer-events-none"
                            style={{ left: collab.cursor.start, top: collab.cursor.end, transform: 'translate(-50%, -50%)' }}
                            title={useNotebook().users.find(u => u.id === collab.id)?.name || collab.id}
                        ></div>
                    )
                ))}
            </div>
            {cell.comments && cell.comments.length > 0 && <CommentSection comments={cell.comments} cellId={id} />}
        </div>
    );
};

export const FormCell: React.FC<GeneralCellProps> = ({ cell, isEditing, onFocus, onUpdateContent, onExecute }) => {
    const { id, content, outputs, status, metadata } = cell;
    const [isHovered, setIsHovered] = useState(false);
    const [formData, setFormData] = useState(content?.formData || {});
    const { executeCell } = useNotebook();

    useEffect(() => {
        setFormData(content?.formData || {});
    }, [content?.formData]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        onUpdateContent({ ...content, formData: formData }, true);
        onExecute?.(); // Trigger backend processing of form data
    };

    return (
        <div
            id={`cell-${id}`}
            className={`relative p-3 rounded-lg border ${isEditing ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-700'} ${isHovered ? 'shadow-lg' : ''}`}
            onClick={onFocus}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isHovered && <CellControls cellId={id} cellType={ExpandedCellType.Form} className="absolute top-2 right-2 z-10" />}
            <h3 className="font-semibold mb-2 flex items-center">
                <span className="mr-2">📝</span> Interactive Form
                <CellStatusIndicator status={status} executionCount={cell.executionCount} />
                <button className="ml-auto text-blue-400 text-xs hover:underline">Edit Form Fields</button>
            </h3>
            <div className="space-y-3 p-2 bg-gray-800 rounded-md">
                {(content?.formFields || []).map((field: any) => (
                    <div key={field.name} className="flex flex-col">
                        <label htmlFor={field.name} className="text-gray-300 text-sm mb-1">{field.label} {field.required && <span className="text-red-400">*</span>}</label>
                        {field.type === 'text' && (
                            <input
                                type="text"
                                id={field.name}
                                className="bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData[field.name] || ''}
                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                disabled={status === 'running'}
                                placeholder={field.placeholder || ''}
                            />
                        )}
                        {field.type === 'number' && (
                            <input
                                type="number"
                                id={field.name}
                                className="bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData[field.name] || ''}
                                onChange={(e) => handleInputChange(field.name, parseFloat(e.target.value))}
                                disabled={status === 'running'}
                                min={field.min} max={field.max} step={field.step || 1}
                            />
                        )}
                        {field.type === 'select' && (
                            <select
                                id={field.name}
                                className="bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData[field.name] || ''}
                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                disabled={status === 'running'}
                            >
                                <option value="" disabled>{field.placeholder || 'Select an option'}</option>
                                {field.options.map((option: string) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        )}
                        {field.type === 'checkbox' && (
                            <div className="flex items-center mt-1">
                                <input
                                    type="checkbox"
                                    id={field.name}
                                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                    checked={formData[field.name] || false}
                                    onChange={(e) => handleInputChange(field.name, e.target.checked)}
                                    disabled={status === 'running'}
                                />
                                <label htmlFor={field.name} className="ml-2 text-gray-300">{field.checkboxLabel || field.label}</label>
                            </div>
                        )}
                        {field.type === 'textarea' && (
                            <textarea
                                id={field.name}
                                className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                                value={formData[field.name] || ''}
                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                rows={field.rows || 3}
                                disabled={status === 'running'}
                                placeholder={field.placeholder || ''}
                            />
                        )}
                        {/* Add more field types like date, range, file upload, radio buttons, etc. */}
                    </div>
                ))}
            </div>
            <button
                className="mt-3 bg-teal-600 hover:bg-teal-700 text-white font-bold py-1 px-3 rounded text-sm disabled:opacity-50"
                onClick={handleSubmit}
                disabled={status === 'running'}
            >
                {status === 'running' ? 'Submitting...' : 'Submit Form'}
            </button>
            {cell.outputs && cell.outputs.length > 0 && <CellOutputDisplay outputs={outputs} />}
            {cell.comments && cell.comments.length > 0 && <CommentSection comments={cell.comments} cellId={id} />}
        </div>
    );
};

// ... Many more cell types like WebComponentCell, FileBrowserCell, TerminalCell, EmbedCell, TimelineCell, MapCell, AudioCell, VideoCell

// --- 5. Supporting UI Components ---

export const CellControls: React.FC<{ cellId: string; cellType: ExpandedCellType; className?: string; position?: 'left' | 'right' }> = ({ cellId, cellType, className, position = 'right' }) => {
    const { addCell, deleteCell, moveCell, executeCell, updateCell, setActiveCellId } = useNotebook();
    const [showAddOptions, setShowAddOptions] = useState(false);
    const addOptionsRef = useRef<HTMLDivElement>(null);

    const handleAddCell = (type: ExpandedCellType) => {
        const currentCellIndex = useNotebook().cells.findIndex(c => c.id === cellId);
        addCell(type, '', currentCellIndex + 1);
        setShowAddOptions(false);
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this cell?')) {
            deleteCell(cellId);
        }
        setShowAddOptions(false);
    };

    const handleRun = () => {
        executeCell(cellId);
        setShowAddOptions(false);
    };

    const handleMoveUp = () => {
        const currentCellIndex = useNotebook().cells.findIndex(c => c.id === cellId);
        if (currentCellIndex > 0) moveCell(currentCellIndex, currentCellIndex - 1);
        setShowAddOptions(false);
    };

    const handleMoveDown = () => {
        const currentCellIndex = useNotebook().cells.findIndex(c => c.id === cellId);
        if (currentCellIndex < (useNotebook().cells.length - 1)) moveCell(currentCellIndex, currentCellIndex + 1);
        setShowAddOptions(false);
    };

    const handleDuplicate = () => {
        const currentCellIndex = useNotebook().cells.findIndex(c => c.id === cellId);
        const cellToDuplicate = useNotebook().cells[currentCellIndex];
        // Create a deep copy and add it
        addCell(cellToDuplicate.type, JSON.parse(JSON.stringify(cellToDuplicate.content)), currentCellIndex + 1, JSON.parse(JSON.stringify(cellToDuplicate.metadata)));
        setShowAddOptions(false);
    };

    const handleToggleCollapse = () => {
        const currentCell = useNotebook().cells.find(c => c.id === cellId);
        if (currentCell) {
            updateCell(cellId, { metadata: { ...currentCell.metadata, collapsed: !currentCell.metadata?.collapsed } }, true);
        }
    };

    const handleAddComment = () => {
        const commentText = prompt('Add your comment:');
        if (commentText) {
            const newComment: CellComment = {
                id: generateUniqueId('comment'),
                author: useNotebook().notebookMetadata.author,
                timestamp: new Date().toISOString(),
                text: commentText,
            };
            const currentCell = useNotebook().cells.find(c => c.id === cellId);
            updateCell(cellId, { comments: [...(currentCell?.comments || []), newComment] }, true);
        }
    };

    // Close add options when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (addOptionsRef.current && !addOptionsRef.current.contains(event.target as Node)) {
                setShowAddOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    return (
        <div className={`flex items-center space-x-1 p-1 bg-gray-800 rounded-md shadow-md ${className} ${position === 'right' ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className="relative" ref={addOptionsRef}>
                <button title="Add Cell" onClick={() => setShowAddOptions(!showAddOptions)} className="text-gray-400 hover:text-blue-400 px-1 py-0.5">➕</button>
                {showAddOptions && (
                    <div className="absolute bg-gray-700 text-white rounded-md shadow-lg p-2 z-20"
                        style={position === 'right' ? { right: '0', top: '30px' } : { left: '0', top: '30px' }}>
                        <p className="text-xs text-gray-400 mb-1">Add Cell Below:</p>
                        <div className="max-h-60 overflow-y-auto">
                            {Object.values(ExpandedCellType).map(type => (
                                <button key={type} onClick={() => handleAddCell(type)} className="block w-full text-left px-2 py-1 hover:bg-gray-600 rounded text-sm">
                                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <button title="Move Up" onClick={handleMoveUp} className="text-gray-400 hover:text-blue-400 px-1 py-0.5">⬆️</button>
            <button title="Move Down" onClick={handleMoveDown} className="text-gray-400 hover:text-blue-400 px-1 py-0.5">⬇️</button>
            {/* Only show run for executable cells */}
            {['code', 'ai_chat', 'sql', 'form'].includes(cellType) && (
                <button title="Run Cell" onClick={handleRun} className="text-gray-400 hover:text-green-400 px-1 py-0.5">▶️</button>
            )}
            <button title="Duplicate Cell" onClick={handleDuplicate} className="text-gray-400 hover:text-orange-400 px-1 py-0.5">📄</button>
            <button title="Delete Cell" onClick={handleDelete} className="text-gray-400 hover:text-red-400 px-1 py-0.5">🗑️</button>
            <button title="Toggle Collapse" onClick={handleToggleCollapse} className="text-gray-400 hover:text-yellow-400 px-1 py-0.5">↔️</button>
            <button title="Add Comment" onClick={handleAddComment} className="text-gray-400 hover:text-purple-400 px-1 py-0.5">💬</button>
            {/* Add more controls: share, version history, export, security settings, etc. */}
        </div>
    );
};

export const CellStatusIndicator: React.FC<{ status?: EnhancedCell['status']; executionCount?: number; executionTime?: EnhancedCell['executionTime']; }> = ({ status, executionCount, executionTime }) => {
    let indicatorClass = '';
    let text = '';
    if (status === 'running') { indicatorClass = 'bg-blue-500 animate-pulse'; text = 'Running'; }
    else if (status === 'queued') { indicatorClass = 'bg-yellow-500'; text = 'Queued'; }
    else if (status === 'success') { indicatorClass = 'bg-green-500'; text = 'Completed'; }
    else if (status === 'error') { indicatorClass = 'bg-red-500'; text = 'Error'; }
    else { indicatorClass = 'bg-gray-500'; text = 'Idle'; }

    const duration = executionTime?.durationMs ? ` (${executionTime.durationMs / 1000}s)` : '';

    return (
        <span className="ml-2 flex items-center text-xs text-gray-400">
            <span className={`w-2 h-2 rounded-full mr-1 ${indicatorClass}`}></span>
            {text} {executionCount ? `(#${executionCount})` : ''} {duration}
        </span>
    );
};

export const CellOutputDisplay: React.FC<{ outputs?: any[] }> = ({ outputs }) => {
    if (!outputs || outputs.length === 0) return null;

    return (
        <div className="mt-3 p-3 bg-gray-800 rounded-lg border-l-4 border-gray-600 max-h-96 overflow-y-auto">
            <h4 className="text-sm font-semibold mb-2 text-gray-300">Outputs:</h4>
            {outputs.map((output, index) => (
                <div key={index} className="mb-2 last:mb-0 text-sm">
                    {output.type === 'stream' && output.name === 'stdout' && (
                        <pre className="text-gray-200 whitespace-pre-wrap">{output.text}</pre>
                    )}
                    {output.type === 'stream' && output.name === 'stderr' && (
                        <pre className="text-red-300 whitespace-pre-wrap">{output.text}</pre>
                    )}
                    {output.type === 'execute_result' && output.data && output.data['text/plain'] && (
                        <pre className="text-green-300 whitespace-pre-wrap">{output.data['text/plain']}</pre>
                    )}
                    {output.type === 'execute_result' && output.data && output.data['text/html'] && (
                        <div dangerouslySetInnerHTML={{ __html: output.data['text/html'] }} className="bg-gray-700 p-2 rounded"></div>
                    )}
                    {output.type === 'execute_result' && output.data && output.data['image/png'] && (
                        <img src={`data:image/png;base64,${output.data['image/png']}`} alt="Output" className="max-w-full h-auto rounded" />
                    )}
                    {output.type === 'execute_result' && output.data && output.data['application/json'] && (
                         <pre className="text-blue-300 whitespace-pre-wrap">{JSON.stringify(output.data['application/json'], null, 2)}</pre>
                    )}
                    {output.type === 'error' && (
                        <pre className="text-red-400 whitespace-pre-wrap">{output.name}: {output.message}{output.traceback ? `\n${output.traceback}` : ''}</pre>
                    )}
                    {/* Add more output types (e.g., plot, table, widget, audio) */}
                </div>
            ))}
        </div>
    );
};

export const CommentSection: React.FC<{ comments: CellComment[]; cellId: string }> = ({ comments, cellId }) => {
    const { notebookMetadata, updateCell } = useNotebook();
    const [newCommentText, setNewCommentText] = useState('');

    const addReply = (parentId: string, text: string) => {
        const newReply: CellComment = {
            id: generateUniqueId('reply'),
            author: notebookMetadata.author,
            timestamp: new Date().toISOString(),
            text: text,
        };
        const updatedComments = comments.map(comment =>
            comment.id === parentId
                ? { ...comment, replies: [...(comment.replies || []), newReply] }
                : comment
        );
        updateCell(cellId, { comments: updatedComments }, true);
    };

    const addTopLevelComment = () => {
        if (newCommentText.trim()) {
            const newComment: CellComment = {
                id: generateUniqueId('comment'),
                author: notebookMetadata.author,
                timestamp: new Date().toISOString(),
                text: newCommentText.trim(),
            };
            updateCell(cellId, { comments: [...comments, newComment] }, true);
            setNewCommentText('');
        }
    };

    return (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg border-l-4 border-purple-600">
            <h4 className="text-sm font-semibold mb-3 text-gray-300 flex items-center">
                <span className="mr-2">💬</span> Comments ({comments.length})
                <button className="ml-auto text-blue-400 text-xs hover:underline" onClick={addTopLevelComment}>+ Add Comment</button>
            </h4>
            <div className="space-y-3 max-h-48 overflow-y-auto">
                {comments.length === 0 && (
                    <div className="text-gray-500 text-sm italic">No comments yet.</div>
                )}
                {comments.map(comment => (
                    <CommentDisplay key={comment.id} comment={comment} onReply={addReply} currentUserId={notebookMetadata.author} />
                ))}
            </div>
             <div className="mt-3 pt-3 border-t border-gray-700 flex">
                <input
                    type="text"
                    placeholder="Add a new comment..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="flex-grow bg-gray-700 text-white p-2 rounded-l-md focus:outline-none text-sm"
                    onKeyDown={(e) => { if (e.key === 'Enter') addTopLevelComment(); }}
                />
                <button
                    onClick={addTopLevelComment}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-r-md text-sm"
                >
                    Post
                </button>
            </div>
        </div>
    );
};

export const CommentDisplay: React.FC<{ comment: CellComment; onReply: (parentId: string, text: string) => void; currentUserId: string }> = ({ comment, onReply, currentUserId }) => {
    const [replyText, setReplyText] = useState('');
    const [showReplyInput, setShowReplyInput] = useState(false);

    const handlePostReply = () => {
        if (replyText.trim()) {
            onReply(comment.id, replyText.trim());
            setReplyText('');
            setShowReplyInput(false);
        }
    };

    return (
        <div className={`p-2 rounded-md ${comment.author === currentUserId ? 'bg-blue-900' : 'bg-gray-700'}`}>
            <div className="flex items-center text-xs text-gray-400 mb-1">
                <strong>{comment.author}</strong>
                <span className="ml-2 text-gray-500">{new Date(comment.timestamp).toLocaleString()}</span>
                {comment.resolved && <span className="ml-2 text-green-400">✅ Resolved</span>}
                <button className="ml-auto text-blue-400 hover:underline" onClick={() => setShowReplyInput(!showReplyInput)}>Reply</button>
            </div>
            <p className="text-gray-200 text-sm">{comment.text}</p>
            {comment.replies && comment.replies.length > 0 && (
                <div className="ml-4 mt-2 space-y-2 border-l border-gray-600 pl-3">
                    {comment.replies.map(reply => (
                        <CommentDisplay key={reply.id} comment={reply} onReply={onReply} currentUserId={currentUserId} />
                    ))}
                </div>
            )}
            {showReplyInput && (
                <div className="mt-2 flex">
                    <input
                        type="text"
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-grow bg-gray-800 text-white p-1 rounded-l-md text-xs focus:outline-none"
                        onKeyDown={(e) => { if (e.key === 'Enter') handlePostReply(); }}
                    />
                    <button
                        onClick={handlePostReply}
                        className="bg-green-600 hover:bg-green-700 text-white p-1 rounded-r-md text-xs"
                    >
                        Post Reply
                    </button>
                </div>
            )}
        </div>
    );
};


export const NotebookToolbar: React.FC = () => {
    const {
        saveNotebook, loadNotebook, addCell, runAllCells, undo, redo,
        commandPaletteOpen, setCommandPaletteOpen, aiAssistantOpen, setAiAssistantOpen,
        notebookMetadata, setNotebookMetadata,
        globalSearchTerm, setGlobalSearchTerm,
        cells, toggleSidebarPanel, activeSidebarPanel,
    } = useNotebook();

    const [newCellType, setNewCellType] = useState<ExpandedCellType>(ExpandedCellType.Code);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [notebookVersionsOpen, setNotebookVersionsOpen] = useState(false);
    const [deployModalOpen, setDeployModalOpen] = useState(false);

    const handleExport = (format: string) => {
        alert(`Exporting notebook in ${format} format... (Simulated)`);
        // In a real app, this would trigger a backend export service
    };

    const handleShare = (config: any) => {
        console.log('Sharing config:', config);
        alert('Notebook shared successfully! (Simulated)');
        setShareModalOpen(false);
    };

    const handleSettingsUpdate = (newSettings: Record<string, any>) => {
        setNotebookMetadata(prev => ({ ...prev, settings: { ...prev.settings, ...newSettings } }));
        applyTheme(newSettings.theme || notebookMetadata.theme);
        alert('Notebook settings updated! (Simulated)');
        setSettingsModalOpen(false);
    };

    const handleDeployment = (config: any) => {
        console.log('Deploying notebook with config:', config);
        alert('Notebook deployment initiated! (Simulated)');
        setDeployModalOpen(false);
    };

    return (
        <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700 sticky top-0 z-30 shadow-lg">
            <div className="flex items-center space-x-3">
                <h2 className="text-lg font-bold text-white cursor-pointer hover:text-blue-400" onClick={() => alert('Navigate to Workspace')}>
                    {notebookMetadata.title}
                </h2>
                <span className="text-gray-400 text-sm">v{notebookMetadata.version?.toFixed(1) || '1.0'}</span>
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded flex items-center"
                    onClick={() => addCell(newCellType, '')}
                    title="Add New Cell"
                >
                    ➕ Add <span className="hidden md:inline ml-1">{newCellType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <select
                        className="ml-1 bg-blue-700 text-white rounded outline-none cursor-pointer"
                        value={newCellType}
                        onChange={(e) => setNewCellType(e.target.value as ExpandedCellType)}
                        onClick={(e) => e.stopPropagation()} // Prevent parent button click
                    >
                        {Object.values(ExpandedCellType).map(type => (
                            <option key={type} value={type}>
                                {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </option>
                        ))}
                    </select>
                </button>
                <button onClick={runAllCells} className="p-2 rounded hover:bg-gray-700 text-green-400" title="Run All Cells">▶️</button>
                <button onClick={undo} className="p-2 rounded hover:bg-gray-700 text-gray-400" title="Undo">↩️</button>
                <button onClick={redo} className="p-2 rounded hover:bg-gray-700 text-gray-400" title="Redo">↪️</button>
                <button onClick={saveNotebook} className="p-2 rounded hover:bg-gray-700 text-orange-400" title="Save Notebook">💾</button>
                <input
                    type="text"
                    placeholder="Search notebook content..."
                    className="p-1.5 rounded bg-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40 md:w-64"
                    value={globalSearchTerm}
                    onChange={(e) => setGlobalSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex items-center space-x-3">
                <button onClick={() => setAiAssistantOpen(true)} className="p-2 rounded hover:bg-gray-700 text-purple-400" title="AI Assistant">🤖</button>
                <button onClick={() => setCommandPaletteOpen(true)} className="p-2 rounded hover:bg-gray-700 text-yellow-400" title="Command Palette">⌘K</button>
                <button onClick={() => setNotebookVersionsOpen(true)} className="p-2 rounded hover:bg-gray-700 text-cyan-400" title="Version History">🕰️</button>
                <button onClick={() => setShareModalOpen(true)} className="p-2 rounded hover:bg-gray-700 text-teal-400" title="Share">🔗</button>
                <button onClick={() => setDeployModalOpen(true)} className="p-2 rounded hover:bg-gray-700 text-red-400" title="Deploy Notebook">🚀</button>
                <button onClick={() => setSettingsModalOpen(true)} className="p-2 rounded hover:bg-gray-700 text-gray-400" title="Settings">⚙️</button>
                <div className="flex -space-x-2 overflow-hidden">
                    {useNotebook().users.slice(0, 3).map(user => (
                        <img key={user.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-gray-900" src={user.avatarUrl} alt={user.name} title={user.name} />
                    ))}
                    {useNotebook().users.length > 3 && <span className="h-8 w-8 rounded-full ring-2 ring-gray-900 bg-gray-700 flex items-center justify-center text-xs text-gray-300">+{useNotebook().users.length - 3}</span>}
                    {useNotebook().users.length === 0 && <span className="text-sm text-gray-500">No active collaborators</span>}
                </div>
            </div>

            {shareModalOpen && <ShareModal onClose={() => setShareModalOpen(false)} onShare={handleShare} notebookId={notebookMetadata.id} />}
            {settingsModalOpen && <SettingsModal onClose={() => setSettingsModalOpen(false)} currentSettings={notebookMetadata.settings} onSave={handleSettingsUpdate} />}
            {notebookVersionsOpen && <VersionHistoryPanel onClose={() => setNotebookVersionsOpen(false)} notebookId={notebookMetadata.id} />}
            {deployModalOpen && <DeployModal onClose={() => setDeployModalOpen(false)} onDeploy={handleDeployment} notebookMetadata={notebookMetadata} />}
        </div>
    );
};

export const NotebookSidebar: React.FC = () => {
    const { cells, activeCellId, setActiveCellId, notebookMetadata, users, activeSidebarPanel, toggleSidebarPanel } = useNotebook();

    const getOutline = useCallback(() => {
        const headings: { id: string; text: string; level: number; }[] = [];
        cells.forEach(cell => {
            if (cell.type === ExpandedCellType.Markdown) {
                const markdownContent = cell.content as string;
                getMarkdownHeadings(markdownContent).forEach((heading, index) => {
                    headings.push({ id: `${cell.id}-${heading.id}`, text: heading.text, level: heading.level });
                });
            }
        });
        return headings;
    }, [cells]);

    return (
        <div className="w-80 bg-gray-800 text-white flex-shrink-0 border-r border-gray-700 overflow-y-auto flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <h3 className="font-bold text-lg mb-2">Workspace</h3>
                <div className="flex space-x-1 border border-gray-600 rounded-md p-0.5 text-sm">
                    <button
                        className={`flex-1 py-1 rounded-sm ${activeSidebarPanel === 'outline' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                        onClick={() => toggleSidebarPanel('outline')}
                    >
                        Outline
                    </button>
                    <button
                        className={`flex-1 py-1 rounded-sm ${activeSidebarPanel === 'variables' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                        onClick={() => toggleSidebarPanel('variables')}
                    >
                        Vars
                    </button>
                    <button
                        className={`flex-1 py-1 rounded-sm ${activeSidebarPanel === 'files' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                        onClick={() => toggleSidebarPanel('files')}
                    >
                        Files
                    </button>
                    <button
                        className={`flex-1 py-1 rounded-sm ${activeSidebarPanel === 'plugins' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                        onClick={() => toggleSidebarPanel('plugins')}
                    >
                        Plugins
                    </button>
                </div>
            </div>
            <div className="p-4 flex-grow overflow-y-auto">
                {activeSidebarPanel === 'outline' && (
                    <div>
                        <h4 className="font-semibold mb-2 text-gray-300">Notebook Outline</h4>
                        {getOutline().length === 0 && <p className="text-gray-500 text-sm italic">No markdown headings found.</p>}
                        <ul className="space-y-1 text-sm">
                            {getOutline().map((heading, index) => (
                                <li key={index} className={`cursor-pointer hover:text-blue-400 ${heading.id.startsWith(activeCellId || '') ? 'font-bold text-blue-500' : ''}`}
                                    style={{ marginLeft: `${(heading.level - 1) * 10}px` }}
                                    onClick={() => {
                                        const cellId = heading.id.split('-').slice(0, 2).join('-'); // Extract cell ID from heading ID
                                        setActiveCellId(cellId);
                                        document.getElementById(`cell-${cellId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                >
                                    {heading.text}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {activeSidebarPanel === 'variables' && (
                    <div>
                        <h4 className="font-semibold mb-2 text-gray-300">Kernel Variables ({notebookMetadata.defaultKernelId})</h4>
                        <div className="text-sm space-y-1">
                            <p><code>my_dataframe</code>: DataFrame (100x5)</p>
                            <p><code>user_count</code>: int (1250)</p>
                            <p><code>model_accuracy</code>: float (0.92)</p>
                            {/* In a real app, this would be fetched from the active kernel via a Kernel API */}
                            <p className="text-gray-500 italic mt-3">Connect to kernel to see live variables.</p>
                            <button className="text-blue-400 text-xs hover:underline mt-2">Refresh Variables</button>
                            <div className="mt-2 flex space-x-2">
                                <button className="bg-gray-700 hover:bg-gray-600 text-xs px-2 py-1 rounded">Watch Var</button>
                                <button className="bg-gray-700 hover:bg-gray-600 text-xs px-2 py-1 rounded">Debug</button>
                            </div>
                        </div>
                    </div>
                )}
                {activeSidebarPanel === 'files' && (
                    <div>
                        <h4 className="font-semibold mb-2 text-gray-300">Project Files</h4>
                        <ul className="text-sm space-y-1">
                            <li className="flex items-center hover:text-blue-400 cursor-pointer">📂 <span className="ml-1">data/</span></li>
                            <li className="ml-4 hover:text-blue-400 cursor-pointer">📄 users.csv</li>
                            <li className="ml-4 hover:text-blue-400 cursor-pointer">📄 sales.json</li>
                            <li className="flex items-center hover:text-blue-400 cursor-pointer">📂 <span className="ml-1">src/</span></li>
                            <li className="ml-4 hover:text-blue-400 cursor-pointer">📄 helper_functions.py</li>
                            <li className="ml-4 hover:text-blue-400 cursor-pointer">📄 models.js</li>
                            <li className="flex items-center hover:text-blue-400 cursor-pointer">📄 <span className="ml-1">README.md</span></li>
                            <li className="flex items-center hover:text-blue-400 cursor-pointer">📄 <span className="ml-1">requirements.txt</span></li>
                            {/* Add file upload, create new file, delete file, rename file actions */}
                        </ul>
                        <div className="mt-3 space-x-2">
                            <button className="bg-gray-700 hover:bg-gray-600 text-xs px-2 py-1 rounded">Upload</button>
                            <button className="bg-gray-700 hover:bg-gray-600 text-xs px-2 py-1 rounded">New File</button>
                            <button className="bg-gray-700 hover:bg-gray-600 text-xs px-2 py-1 rounded">Refresh</button>
                        </div>
                        <div className="mt-3 text-xs text-gray-500">Synced with {notebookMetadata.settings.versionControlIntegration === 'git' ? 'Git' : 'Cloud Storage'}</div>
                    </div>
                )}
                {activeSidebarPanel === 'plugins' && (
                    <div>
                        <h4 className="font-semibold mb-2 text-gray-300">Active Plugins</h4>
                        <ul className="text-sm space-y-1">
                            {Object.entries(notebookMetadata.plugins || {}).map(([id, { enabled }]) => (
                                <li key={id} className="flex items-center justify-between">
                                    <span>{id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                    <span className={enabled ? 'text-green-400' : 'text-red-400'}>{enabled ? '✅' : '❌'}</span>
                                </li>
                            ))}
                            {Object.keys(notebookMetadata.plugins || {}).length === 0 && <p className="text-gray-500 italic">No plugins enabled.</p>}
                        </ul>
                        <button className="mt-3 bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1 rounded">Manage Plugins</button>
                        <button className="ml-2 mt-3 bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1 rounded">Discover Plugins</button>
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-gray-700 mt-auto">
                <h4 className="font-semibold mb-2 text-gray-300">Active Collaborators ({users.length})</h4>
                <div className="flex flex-wrap gap-2">
                    {users.map(user => (
                        <div key={user.id} className="flex items-center text-xs text-gray-400">
                            <img src={user.avatarUrl} alt={user.name} className="h-5 w-5 rounded-full mr-1" />
                            {user.name} <span className={`w-2 h-2 rounded-full ml-1 ${user.status === 'online' ? 'bg-green-500' : user.status === 'typing' ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'}`}></span>
                            {user.status === 'typing' && <span className="ml-1 text-blue-300 italic">...</span>}
                        </div>
                    ))}
                    {users.length === 0 && <span className="text-gray-500 italic text-sm">No one else here.</span>}
                </div>
                <button className="mt-3 bg-gray-700 hover:bg-gray-600 text-xs px-2 py-1 rounded">Invite to Collaborate</button>
            </div>
        </div>
    );
};

export const StatusBar: React.FC = () => {
    const { notebookMetadata, notifications, users } = useNotebook();
    const activeKernel = notebookMetadata.kernels.find(k => k.id === notebookMetadata.defaultKernelId);

    const [isOnline, setIsOnline] = useState(true); // Simulate online status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const unreadNotifications = notifications.filter(n => !n.read).length;

    return (
        <div className="flex items-center justify-between p-2 bg-gray-800 border-t border-gray-700 text-sm text-gray-400 fixed bottom-0 left-0 right-0 z-30 shadow-lg">
            <div className="flex items-center space-x-4">
                <span className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-1 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {isOnline ? 'Online' : 'Offline'}
                </span>
                <button className="flex items-center hover:text-white" title={`Kernel Status: ${activeKernel?.name}`}>
                    <span className={`w-2 h-2 rounded-full mr-1 ${activeKernel?.status === 'idle' ? 'bg-green-500' : activeKernel?.status === 'busy' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'}`}></span>
                    Kernel: {activeKernel?.name || 'No Kernel'} ({activeKernel?.status || 'Disconnected'})
                </button>
                <span>Last Saved: {new Date(notebookMetadata.lastModified).toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-4">
                <button className="relative p-1 hover:text-white" title="Notifications">
                    🔔
                    {unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                            {unreadNotifications}
                        </span>
                    )}
                </button>
                <button className="hover:text-white" title="Security & Permissions">
                    🔒 {notebookMetadata.visibility === 'private' ? 'Private' : (notebookMetadata.visibility === 'public' ? 'Public' : 'Restricted')}
                </button>
                <button className="hover:text-white" title="Help & Support">
                    ❓ Help
                </button>
                <span>Google Universal Notebook v2.0.0-beta.999</span>
            </div>
        </div>
    );
};

export const CommandPalette: React.FC = () => {
    const { commandPaletteOpen, setCommandPaletteOpen, addCell, runAllCells, undo, redo, saveNotebook, executeCell, cells, setActiveCellId } = useNotebook();
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const commands: Command[] = [
        { id: 'add_code_cell', label: 'Add Code Cell', icon: '📝', handler: () => addCell(ExpandedCellType.Code, { code: '', language: 'python' }), category: 'Cells' },
        { id: 'add_markdown_cell', label: 'Add Markdown Cell', icon: '📄', handler: () => addCell(ExpandedCellType.Markdown, ''), category: 'Cells' },
        { id: 'add_data_cell', label: 'Add Data Cell', icon: '📊', handler: () => addCell(ExpandedCellType.Data, { data: [], columns: [] }), category: 'Cells' },
        { id: 'add_ai_chat_cell', label: 'Add AI Chat Cell', icon: '🤖', handler: () => addCell(ExpandedCellType.AIChat, { prompt: '' }), category: 'Cells' },
        { id: 'add_sql_cell', label: 'Add SQL Cell', icon: '🗄️', handler: () => addCell(ExpandedCellType.SQL, { query: 'SELECT * FROM my_table;' }), category: 'Cells' },
        { id: 'add_drawing_cell', label: 'Add Drawing Cell', icon: '🎨', handler: () => addCell(ExpandedCellType.Drawing, { drawingData: '' }), category: 'Cells' },
        { id: 'add_form_cell', label: 'Add Form Cell', icon: '📝', handler: () => addCell(ExpandedCellType.Form, { formFields: [] }), category: 'Cells' },
        { id: 'run_all', label: 'Run All Cells', icon: '▶️', handler: runAllCells, category: 'Notebook' },
        { id: 'save_notebook', label: 'Save Notebook', icon: '💾', handler: saveNotebook, category: 'Notebook' },
        { id: 'undo', label: 'Undo Last Action', icon: '↩️', handler: undo, category: 'History' },
        { id: 'redo', label: 'Redo Last Action', icon: '↪️', handler: redo, category: 'History' },
        { id: 'toggle_ai_assistant', label: 'Toggle AI Assistant', icon: '🤖', handler: () => useNotebook().setAiAssistantOpen(prev => !prev), category: 'AI' },
        { id: 'open_settings', label: 'Open Settings', icon: '⚙️', handler: () => alert('Opening settings...'), category: 'Settings' }, // Would open the SettingsModal
        { id: 'open_share', label: 'Open Share Dialog', icon: '🔗', handler: () => alert('Opening share dialog...'), category: 'Collaboration' }, // Would open the ShareModal
        { id: 'open_version_history', label: 'Open Version History', icon: '🕰️', handler: () => alert('Opening version history...'), category: 'History' }, // Would open the VersionHistoryPanel
        { id: 'export_notebook_html', label: 'Export Notebook as HTML', icon: '🌐', handler: () => alert('Exporting to HTML...'), category: 'Export' },
        { id: 'export_notebook_pdf', label: 'Export Notebook as PDF', icon: '📄', handler: () => alert('Exporting to PDF...'), category: 'Export' },
        { id: 'show_keyboard_shortcuts', label: 'Show Keyboard Shortcuts', icon: '⌨️', handler: () => alert('Showing keyboard shortcuts...'), category: 'Help' },
        { id: 'switch_theme_dark', label: 'Switch to Dark Theme', icon: '🌙', handler: () => applyTheme('dark'), category: 'Settings' },
        { id: 'switch_theme_light', label: 'Switch to Light Theme', icon: '☀️', handler: () => applyTheme('light'), category: 'Settings' },
        ...cells.flatMap(cell => ([
            {
                id: `run_cell_${cell.id}`,
                label: `Run Cell: ${cell.id.substring(0, 8)} (${cell.type})`,
                icon: '▶️',
                handler: () => executeCell(cell.id),
                category: 'Cell Actions',
                visible: () => ['code', 'ai_chat', 'sql', 'form'].includes(cell.type),
            },
            {
                id: `focus_cell_${cell.id}`,
                label: `Focus Cell: ${cell.id.substring(0, 8)} (${cell.type})`,
                icon: '🎯',
                handler: () => setActiveCellId(cell.id),
                category: 'Cell Navigation',
            },
            {
                id: `delete_cell_${cell.id}`,
                label: `Delete Cell: ${cell.id.substring(0, 8)} (${cell.type})`,
                icon: '🗑️',
                handler: () => useNotebook().deleteCell(cell.id),
                category: 'Cell Actions',
            },
            {
                id: `copy_cell_${cell.id}`,
                label: `Copy Cell: ${cell.id.substring(0, 8)} (${cell.type})`,
                icon: '📋',
                handler: () => {
                    const cellToDuplicate = useNotebook().cells.find(c => c.id === cell.id);
                    if (cellToDuplicate) {
                        navigator.clipboard.writeText(JSON.stringify(cellToDuplicate, null, 2));
                        useNotebook().addNotification({ type: 'info', message: `Cell ${cell.id.substring(0, 8)} copied to clipboard.` });
                    }
                },
                category: 'Cell Actions',
            },
            // Add thousands more commands for every possible action for each cell
        ])),
    ];

    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(searchTerm.toLowerCase()) && (cmd.visible ? cmd.visible() : true)
    ).slice(0, 50); // Limit results for performance

    useEffect(() => {
        if (commandPaletteOpen) {
            inputRef.current?.focus();
            setSearchTerm('');
        }
    }, [commandPaletteOpen]);

    if (!commandPaletteOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-start pt-20 z-[9999]" onClick={() => setCommandPaletteOpen(false)}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type a command or search..."
                    className="w-full p-4 bg-gray-700 rounded-t-lg text-white text-lg border-b border-gray-600 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') setCommandPaletteOpen(false);
                        // Add logic for selecting with arrow keys and enter
                    }}
                />
                <div className="max-h-96 overflow-y-auto p-2">
                    {filteredCommands.length === 0 ? (
                        <p className="p-4 text-gray-400 italic">No commands found.</p>
                    ) : (
                        <ul className="space-y-1">
                            {filteredCommands.map(cmd => (
                                <li key={cmd.id}>
                                    <button
                                        className="flex items-center w-full px-3 py-2 rounded-md hover:bg-blue-700 text-white text-left text-sm"
                                        onClick={() => { cmd.handler(); setCommandPaletteOpen(false); }}
                                    >
                                        <span className="mr-2 text-lg">{cmd.icon}</span>
                                        {cmd.label}
                                        {cmd.category && <span className="ml-auto text-gray-400 text-xs">({cmd.category})</span>}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export const AIAssistantPanel: React.FC = () => {
    const { aiAssistantOpen, setAiAssistantOpen, addCell, executeCell, activeCellId, cells, addNotification } = useNotebook();
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
    const [input, setInput] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const handleSendMessage = async () => {
        if (input.trim() === '') return;
        const userMessage = { role: 'user' as const, text: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Simulate AI response/action
        // In a real app, this would be an API call to a sophisticated AI service
        let aiResponseText = '';
        const lowerInput = input.toLowerCase();

        if (lowerInput.includes('create code cell')) {
            addCell(ExpandedCellType.Code, { code: 'print("AI generated code!")', language: 'python' }, undefined, { aiGenerated: true });
            aiResponseText = 'Created a new Python code cell with a basic print statement.';
        } else if (lowerInput.includes('explain this cell')) {
            const currentCell = cells.find(c => c.id === activeCellId);
            if (currentCell) {
                aiResponseText = `This is a ${currentCell.type} cell. Its content is: "${JSON.stringify(currentCell.content).substring(0, 100)}...". It was last modified by ${currentCell.author || 'you'}.`;
            } else {
                aiResponseText = 'No cell is currently active. Please select a cell to explain.';
            }
        } else if (lowerInput.includes('debug')) {
            if (activeCellId) {
                aiResponseText = `Initiating debugging session for cell ${activeCellId}. This would typically highlight errors and suggest fixes. (This is a simulation)`;
                addNotification({type: 'info', message: `AI triggered debug for cell ${activeCellId}.`});
            } else {
                aiResponseText = 'Please select a cell to debug.';
            }
        } else if (lowerInput.includes('generate documentation')) {
             if (activeCellId) {
                aiResponseText = `Generating documentation for cell ${activeCellId}. A new markdown cell with AI-generated docs has been added.`;
                addCell(ExpandedCellType.Markdown, `## AI-Generated Documentation for Cell ${activeCellId.substring(0, 8)}\n\nThis documentation was automatically generated by the AI assistant based on the content and purpose of this cell. It covers its inputs, outputs, and overall function.`, undefined, { aiGenerated: true });
            } else {
                aiResponseText = 'Please select a cell to generate documentation for.';
            }
        } else if (lowerInput.includes('optimize cell')) {
             if (activeCellId && cells.find(c => c.id === activeCellId)?.type === ExpandedCellType.Code) {
                aiResponseText = `Optimizing code in cell ${activeCellId}. Suggestions for performance, readability, or best practices would appear as comments or a new cell.`;
                addNotification({type: 'success', message: `AI-driven optimization complete for cell ${activeCellId}.`});
            } else {
                aiResponseText = 'Please select a code cell to optimize.';
            }
        } else {
            aiResponseText = `I received your message: "${userMessage.text}". How can I assist further? Try "create code cell", "explain this cell", "debug cell", "generate documentation", or "optimize cell".`;
        }

        const aiMessage = { role: 'ai' as const, text: aiResponseText };
        setMessages(prev => [...prev, aiMessage]);
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    if (!aiAssistantOpen) return null;

    return (
        <div className="fixed right-0 top-0 h-full w-96 bg-gray-800 border-l border-gray-700 shadow-xl flex flex-col z-40">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-xl font-bold text-white">🤖 AI Assistant</h3>
                <button onClick={() => setAiAssistantOpen(false)} className="text-gray-400 hover:text-white text-lg">✖️</button>
            </div>
            <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.length === 0 && (
                    <p className="text-gray-500 italic text-center">How can I help you today? Ask me to generate code, explain cells, debug, or optimize!</p>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-gray-700 flex items-center">
                <textarea
                    className="flex-grow bg-gray-700 text-white p-2 rounded-l-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ask AI a question or give a command..."
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                />
                <button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-r-md">
                    Send
                </button>
            </div>
        </div>
    );
};

export const ShareModal: React.FC<{ onClose: () => void; onShare: (config: any) => void; notebookId: string }> = ({ onClose, onShare, notebookId }) => {
    const [visibility, setVisibility] = useState<'public' | 'private' | 'restricted' | 'team'>('private');
    const [sharedUsers, setSharedUsers] = useState<{ userId: string; permissions: 'viewer' | 'editor' | 'admin'; }[]>([]);
    const [newUserInput, setNewUserInput] = useState('');
    const [newPermissions, setNewPermissions] = useState<'viewer' | 'editor' | 'admin'>('viewer');
    const [linkCopied, setLinkCopied] = useState(false);

    const handleAddUser = () => {
        if (newUserInput.trim() && !sharedUsers.some(u => u.userId === newUserInput.trim())) {
            setSharedUsers(prev => [...prev, { userId: newUserInput.trim(), permissions: newPermissions }]);
            setNewUserInput('');
        }
    };

    const handleUpdateUserPermissions = (userId: string, permissions: 'viewer' | 'editor' | 'admin') => {
        setSharedUsers(prev => prev.map(u => u.userId === userId ? { ...u, permissions } : u));
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/notebook/${notebookId}/share?mode=${visibility}`);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-[10000]" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md p-6 text-white" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">Share Notebook</h3>
                <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-bold mb-2">Visibility</label>
                    <select
                        className="w-full bg-gray-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value as 'public' | 'private' | 'restricted' | 'team')}
                    >
                        <option value="private">Private (Only you and specified users)</option>
                        <option value="restricted">Restricted (Anyone with link, read-only)</option>
                        <option value="public">Public (Anyone can view)</option>
                        <option value="team">Team (Only members of your team can view/edit)</option>
                    </select>
                </div>
                {(visibility === 'private' || visibility === 'team') && (
                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-bold mb-2">Share with specific users/teams</label>
                        <div className="flex mb-2">
                            <input
                                type="text"
                                className="flex-grow bg-gray-700 p-2 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter user email or ID, or Team ID"
                                value={newUserInput}
                                onChange={(e) => setNewUserInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddUser(); }}
                            />
                            <select value={newPermissions} onChange={(e) => setNewPermissions(e.target.value as any)} className="bg-gray-700 p-2 border-l border-gray-600 text-sm">
                                <option value="viewer">Viewer</option>
                                <option value="editor">Editor</option>
                                <option value="admin">Admin</option>
                            </select>
                            <button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700 p-2 rounded-r">Add</button>
                        </div>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                            {sharedUsers.map(user => (
                                <div key={user.userId} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                                    <span>{user.userId}</span>
                                    <select value={user.permissions} onChange={(e) => handleUpdateUserPermissions(user.userId, e.target.value as any)} className="bg-gray-600 text-white text-xs p-1 rounded mr-2">
                                        <option value="viewer">Viewer</option>
                                        <option value="editor">Editor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <button onClick={() => setSharedUsers(prev => prev.filter(u => u.userId !== user.userId))} className="text-red-400 hover:text-red-300 ml-2">Remove</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {(visibility === 'public' || visibility === 'restricted') && (
                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-bold mb-2">Shareable Link</label>
                        <div className="flex">
                            <input
                                type="text"
                                readOnly
                                value={`${window.location.origin}/notebook/${notebookId}/${visibility === 'public' ? 'view' : 'share'}`}
                                className="flex-grow bg-gray-700 p-2 rounded-l text-sm border border-gray-600"
                            />
                            <button onClick={handleCopyLink} className="bg-green-600 hover:bg-green-700 p-2 rounded-r text-sm">
                                {linkCopied ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded">Cancel</button>
                    <button onClick={() => onShare({ visibility, sharedWith: sharedUsers })} className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded">Apply Changes</button>
                </div>
            </div>
        </div>
    );
};

export const SettingsModal: React.FC<{ onClose: () => void; currentSettings: Record<string, any>; onSave: (settings: Record<string, any>) => void }> = ({ onClose, currentSettings, onSave }) => {
    const [settings, setSettings] = useState(currentSettings);

    const handleChange = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const themes = ['dark', 'light', 'solarized-dark', 'one-dark', 'dracula', 'gruvbox', 'monokai']; // Example themes

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-[10000]" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md p-6 text-white max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">Notebook Settings</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2">Theme</label>
                        <select
                            className="w-full bg-gray-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={settings.theme || 'dark'}
                            onChange={(e) => handleChange('theme', e.target.value)}
                        >
                            {themes.map(theme => (
                                <option key={theme} value={theme}>{theme.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2">Default Kernel</label>
                        <select
                            className="w-full bg-gray-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={settings.defaultKernelId || 'python-3.10'}
                            onChange={(e) => handleChange('defaultKernelId', e.target.value)}
                        >
                            {getAvailableKernels().map(kernel => (
                                <option key={kernel.id} value={kernel.id}>{kernel.name} ({kernel.language})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2">Auto-save interval (seconds)</label>
                        <input
                            type="number"
                            className="w-full bg-gray-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={settings.autoSaveInterval || 30}
                            onChange={(e) => handleChange('autoSaveInterval', parseInt(e.target.value))}
                            min="10"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2">Editor Font Size</label>
                        <input
                            type="number"
                            className="w-full bg-gray-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={settings.editorFontSize || 14}
                            onChange={(e) => handleChange('editorFontSize', parseInt(e.target.value))}
                            min="8" max="24"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-gray-300 text-sm font-bold">Enable AI Suggestions</label>
                        <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                            checked={settings.enableAISuggestions || false}
                            onChange={(e) => handleChange('enableAISuggestions', e.target.checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-gray-300 text-sm font-bold">Real-time Collaboration</label>
                        <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                            checked={settings.realtimeCollaboration || false}
                            onChange={(e) => handleChange('realtimeCollaboration', e.target.checked)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2">Version Control Integration</label>
                        <select
                            className="w-full bg-gray-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={settings.versionControlIntegration || 'internal'}
                            onChange={(e) => handleChange('versionControlIntegration', e.target.value)}
                        >
                            <option value="none">None</option>
                            <option value="internal">Internal Versioning</option>
                            <option value="git">Git (GitHub/GitLab)</option>
                        </select>
                    </div>
                    {/* Add more settings: keybindings, linting, code formatter, notifications, accessibility, export defaults, etc. */}
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded">Cancel</button>
                    <button onClick={() => onSave(settings)} className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded">Save Settings</button>
                </div>
            </div>
        </div>
    );
};

export const VersionHistoryPanel: React.FC<{ onClose: () => void; notebookId: string }> = ({ onClose, notebookId }) => {
    // Mock data for notebook versions
    const mockVersions = [
        { id: 'v1.0', timestamp: '2023-10-26T10:00:00Z', author: 'Alice', message: 'Initial commit' },
        { id: 'v1.1', timestamp: '2023-10-26T11:30:00Z', author: 'Bob', message: 'Added data visualization' },
        { id: 'v1.2', timestamp: '2023-10-27T09:15:00Z', author: 'Alice', message: 'Refactored code cell 3, added comments' },
        { id: 'v1.3', timestamp: '2023-10-27T14:45:00Z', author: 'AI Assistant', message: 'Optimized SQL query in cell 5' },
        { id: 'v1.4', timestamp: '2023-10-28T16:20:00Z', author: 'Bob', message: 'Fixed bug in data processing, added form cell' },
        { id: 'v1.5', timestamp: '2023-10-28T17:05:00Z', author: 'Alice', message: 'Minor text edits in markdown cells' },
        { id: 'v1.6', timestamp: '2023-10-28T18:30:00Z', author: 'System', message: 'Auto-saved changes' },
        { id: 'v1.7', timestamp: '2023-10-29T09:00:00Z', author: 'You', message: 'Introduced Drawing cell' },
    ];
    const [selectedVersionId, setSelectedVersionId] = useState<string | null>(mockVersions[mockVersions.length - 1]?.id || null);
    const [compareVersionId, setCompareVersionId] = useState<string | null>(null);

    const handleRestoreVersion = (versionId: string) => {
        if (window.confirm(`Are you sure you want to restore to version ${versionId}? This will overwrite current changes.`)) {
            alert(`Restoring to version ${versionId}... (In a real app, this would fetch and load the old notebook state)`);
            onClose();
        }
    };

    const selectedVersion = mockVersions.find(v => v.id === selectedVersionId);
    const compareVersion = mockVersions.find(v => v.id === compareVersionId);

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-start pt-20 z-[10000]" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl flex flex-col h-[80vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">🕰️ Notebook Version History</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-lg">✖️</button>
                </div>
                <div className="flex-grow flex overflow-hidden">
                    <div className="w-1/3 p-4 border-r border-gray-700 overflow-y-auto">
                        <h4 className="font-semibold mb-3 text-gray-300">Versions for "{notebookId}"</h4>
                        <ul className="space-y-2 text-sm">
                            {mockVersions.slice().reverse().map(version => ( // Show latest first
                                <li key={version.id}
                                    className={`p-3 rounded-md cursor-pointer ${selectedVersionId === version.id ? 'bg-blue-700' : 'hover:bg-gray-700 bg-gray-900'} ${compareVersionId === version.id ? 'ring-2 ring-yellow-500' : ''}`}
                                    onClick={() => setSelectedVersionId(version.id)}
                                >
                                    <div className="font-bold">{version.id} - {version.message}</div>
                                    <div className="text-xs text-gray-400">
                                        by {version.author} on {new Date(version.timestamp).toLocaleString()}
                                    </div>
                                    {selectedVersionId === version.id && (
                                        <div className="mt-2 flex space-x-2">
                                            <button onClick={() => handleRestoreVersion(version.id)} className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded">Restore</button>
                                            <button onClick={() => setCompareVersionId(compareVersionId === version.id ? null : version.id)} className={`text-white text-xs px-2 py-1 rounded ${compareVersionId === version.id ? 'bg-yellow-600' : 'bg-purple-600 hover:bg-purple-700'}`}>
                                                {compareVersionId === version.id ? 'Comparing' : 'Compare'}
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="w-2/3 p-4 overflow-y-auto">
                        <h4 className="font-semibold mb-3 text-gray-300">
                            Version Preview
                            {selectedVersion && <span className="ml-2">(Selected: {selectedVersion.id})</span>}
                            {compareVersion && <span className="ml-2">(Comparing with: {compareVersion.id})</span>}
                        </h4>
                        <div className="bg-gray-900 p-3 rounded-md min-h-[200px]">
                            {selectedVersion ? (
                                <div className="text-sm text-gray-300">
                                    <p className="mb-2">
                                        <strong>{selectedVersion.id}</strong> by {selectedVersion.author} on {new Date(selectedVersion.timestamp).toLocaleString()}<br/>
                                        <em>"{selectedVersion.message}"</em>
                                    </p>
                                    <pre className="text-xs text-gray-400 whitespace-pre-wrap max-h-64 overflow-y-auto border border-gray-700 p-2 rounded">
                                        {/* Simulate diff or full content preview */}
                                        {compareVersion ? (
                                            `--- Diff between ${compareVersion.id} and ${selectedVersion.id} ---\n\n` +
                                            `- Old code line from ${compareVersion.id}\n` +
                                            `+ New code line from ${selectedVersion.id}\n` +
                                            `# Updated Markdown Title v${selectedVersion.id.split('v')[1]}`
                                        ) : (
                                            `# Notebook Snapshot (${selectedVersion.id})\n\n` +
                                            `This is a simulated preview of the notebook state at version **${selectedVersion.id}**.\n\n` +
                                            `\`\`\`python\nprint("Code for ${selectedVersion.id}")\n\`\`\`\n\n` +
                                            `## Analysis from ${selectedVersion.id}\n\n` +
                                            `*   Feature A\n*   Feature B`
                                        )}
                                    </pre>
                                    <button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded">View Full Diff</button>
                                    <button className="ml-2 mt-3 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded">Delete Version (Admin)</button>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic text-center py-10">Select a version to see its details or compare.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const DeployModal: React.FC<{ onClose: () => void; onDeploy: (config: any) => void; notebookMetadata: NotebookMetadata }> = ({ onClose, onDeploy, notebookMetadata }) => {
    const [deploymentType, setDeploymentType] = useState<'web_app' | 'api' | 'data_pipeline' | 'microservice'>('web_app');
    const [targetEnvironment, setTargetEnvironment] = useState<'staging' | 'production' | 'dev'>('staging');
    const [resourceConfig, setResourceConfig] = useState<{ cpu: number; memory: number; gpu: number; } | null>(null);
    const [endpointPath, setEndpointPath] = useState('/api/notebook-inference');
    const [isLoading, setIsLoading] = useState(false);

    const handleDeploy = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            onDeploy({ deploymentType, targetEnvironment, resourceConfig, endpointPath });
            setIsLoading(false);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-[10000]" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md p-6 text-white max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">🚀 Deploy Notebook</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2">Deployment Type</label>
                        <select
                            className="w-full bg-gray-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={deploymentType}
                            onChange={(e) => setDeploymentType(e.target.value as any)}
                        >
                            <option value="web_app">Web Application (Interactive Dashboard)</option>
                            <option value="api">REST API Endpoint (Inference/Execution)</option>
                            <option value="data_pipeline">Data Pipeline (Scheduled Execution)</option>
                            <option value="microservice">Microservice (Containerized)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2">Target Environment</label>
                        <select
                            className="w-full bg-gray-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={targetEnvironment}
                            onChange={(e) => setTargetEnvironment(e.target.value as any)}
                        >
                            <option value="dev">Development</option>
                            <option value="staging">Staging</option>
                            <option value="production">Production</option>
                        </select>
                    </div>
                    {deploymentType === 'api' && (
                        <div>
                            <label className="block text-gray-300 text-sm font-bold mb-2">API Endpoint Path</label>
                            <input
                                type="text"
                                className="w-full bg-gray-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={endpointPath}
                                onChange={(e) => setEndpointPath(e.target.value)}
                                placeholder="/api/your-notebook-name"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2">Resource Configuration (Optional)</label>
                        <div className="flex space-x-2">
                            <input type="number" placeholder="CPU Cores" className="w-1/3 bg-gray-700 p-2 rounded" min="0.1" step="0.1" value={resourceConfig?.cpu || ''} onChange={(e) => setResourceConfig(prev => ({ ...prev, cpu: parseFloat(e.target.value) }))} />
                            <input type="number" placeholder="Memory (GB)" className="w-1/3 bg-gray-700 p-2 rounded" min="0.1" step="0.1" value={resourceConfig?.memory || ''} onChange={(e) => setResourceConfig(prev => ({ ...prev, memory: parseFloat(e.target.value) }))} />
                            <input type="number" placeholder="GPU Units" className="w-1/3 bg-gray-700 p-2 rounded" min="0" step="1" value={resourceConfig?.gpu || ''} onChange={(e) => setResourceConfig(prev => ({ ...prev, gpu: parseFloat(e.target.value) }))} />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Leave blank for auto-scaling based on usage.</p>
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2">Integration</label>
                        <select className="w-full bg-gray-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Google Cloud Run</option>
                            <option>AWS Lambda</option>
                            <option>Azure Container Apps</option>
                            <option>Kubernetes Cluster</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded" disabled={isLoading}>Cancel</button>
                    <button onClick={handleDeploy} className="bg-green-600 hover:bg-green-700 py-2 px-4 rounded flex items-center" disabled={isLoading}>
                        {isLoading && <span className="animate-spin mr-2">🔄</span>}
                        {isLoading ? 'Deploying...' : 'Deploy Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- 6. Main Notebook Component (Expanded) ---

export const Notebook: React.FC = () => {
    // Initial cells (casted to EnhancedCell for internal state management)
    const [cells, setCells] = useState<EnhancedCell[]>([
        { id: generateUniqueId('cell'), type: ExpandedCellType.Code, content: { code: 'print("Hello, Universal Notebook!")', language: 'python' }, status: 'idle', executionCount: 0, metadata: { lineNumbers: true }, comments: [], author: 'System' },
        { id: generateUniqueId('cell'), type: ExpandedCellType.Markdown, content: '# My Cosmic Analysis\n\nThis notebook demonstrates a multi-faceted approach to interactive computing.\n\n## Section 1: Data Exploration', metadata: {}, comments: [], author: 'AI Expert Programmer' },
        { id: generateUniqueId('cell'), type: ExpandedCellType.Data, content: { data: [['apple', 10, 'fruit'], ['banana', 20, 'fruit'], ['orange', 15, 'fruit'], ['carrot', 25, 'vegetable']], columns: ['Item', 'Quantity', 'Category'] }, metadata: {}, comments: [], author: 'Alice' },
        { id: generateUniqueId('cell'), type: ExpandedCellType.Visualization, content: { chartSpec: { type: 'bar', dataSource: 'cell-data-1', x: 'Item', y: 'Quantity', title: 'Fruit & Veggie Stock' } }, metadata: {}, comments: [], author: 'Bob' },
        { id: generateUniqueId('cell'), type: ExpandedCellType.AIChat, content: { prompt: 'Summarize the above data and suggest a new visualization type based on the categories. Also, write a Python code snippet to filter only fruits.' }, outputs: [], status: 'idle', executionCount: 0, metadata: {}, comments: [], author: 'You' },
        { id: generateUniqueId('cell'), type: ExpandedCellType.SQL, content: { query: 'SELECT Category, SUM(Quantity) AS TotalQuantity FROM inventory GROUP BY Category ORDER BY TotalQuantity DESC;' }, outputs: [], status: 'idle', executionCount: 0, metadata: {}, comments: [], author: 'Alice' },
        { id: generateUniqueId('cell'), type: ExpandedCellType.Drawing, content: { drawingData: '' }, metadata: {}, comments: [], author: 'Bob' },
        { id: generateUniqueId('cell'), type: ExpandedCellType.Form, content: { formFields: [{ name: 'name', label: 'Your Name', type: 'text', required: true }, { name: 'email', label: 'Your Email', type: 'text' }, { name: 'feedback', label: 'Feedback', type: 'textarea', rows: 3 }, { name: 'rating', label: 'Rating (1-5)', type: 'number', min: 1, max: 5 }], formData: {} }, status: 'idle', outputs: [], executionCount: 0, metadata: {}, comments: [], author: 'System' },
    ]);

    const [notebookMetadata, setNotebookMetadata] = useState<NotebookMetadata>({
        id: generateUniqueId('notebook'),
        title: 'Universal Quantum Notebook',
        description: 'A cutting-edge platform for cross-dimensional computation, data analysis, and collaboration across the entire codebase and beyond.',
        author: 'AI Expert Programmer',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        tags: ['universe', 'ai', 'data science', 'collaboration', 'quantum', 'google'],
        visibility: 'private',
        sharedWith: [{ userId: 'alice@example.com', permissions: 'editor' }, { userId: 'bob@example.com', permissions: 'viewer' }],
        kernels: getAvailableKernels(),
        defaultKernelId: 'python-3.10',
        theme: 'dark',
        settings: {
            autoSaveInterval: 30,
            editorFontSize: 14,
            enableAISuggestions: true,
            layout: 'default',
            indentation: 4,
            lineNumbers: true,
            wordWrap: true,
            showGutter: true,
            terminalTheme: 'dracula',
            dataExportFormat: 'csv',
            accessibilityMode: false,
            highContrast: false,
            notificationSound: true,
            debugMode: false,
            realtimeCollaboration: true,
            versionControlIntegration: 'internal',
            apiKeyManagement: { // secure storage not shown here, just placeholders
                openai: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                googlecloud: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                github: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            },
            hotkeys: {}, // default hotkeys
            codeFormatter: 'prettier',
            lintingEnabled: true,
            codeCompletionEnabled: true,
            dragAndDropEnabled: true,
            imageUploadTarget: 'cloud',
        },
        plugins: {
            'code-linter': { enabled: true, config: { language: { python: 'pylint', javascript: 'eslint' } } },
            'git-sync': { enabled: true, config: { repository: 'https://github.com/google/universal-notebook', branch: 'main' } },
            'data-profiler': { enabled: true, config: { maxRows: 10000 } },
            'accessibility-checker': { enabled: true, config: {} },
            'theme-editor': { enabled: true, config: {} },
            'vs-code-keybindings': { enabled: false, config: {} },
        },
        projectDirectory: '/universal-notebook-project',
        cloudProvider: 'google',
        resourceLimits: { cpu: 2, memory: 4, gpu: 0, runtime: 3600 }, // in hours
        deploymentTargets: [{ id: 'prod-api', name: 'Production API', type: 'api' }],
        integrations: {
            slack: { enabled: true, config: { channel: '#notebook-alerts' } },
            jira: { enabled: false, config: {} },
            github: { enabled: true, config: { repo: 'google/universal-notebook' } },
        }
    });

    const [activeCellId, setActiveCellId] = useState<string | null>(cells[0]?.id || null);
    const [history, setHistory] = useState<EnhancedCell[][]>([cells]);
    const [historyPointer, setHistoryPointer] = useState(0);
    const [users, setUsers] = useState<UserProfile[]>([
        { id: 'user-2', name: 'Alice', avatarUrl: 'https://via.placeholder.com/24/FF00FF/FFFFFF?text=A', status: 'online', permissions: 'editor' },
        { id: 'user-3', name: 'Bob', avatarUrl: 'https://via.placeholder.com/24/00FFFF/FFFFFF?text=B', status: 'typing', permissions: 'viewer' },
        { id: 'user-1', name: 'You', avatarUrl: 'https://via.placeholder.com/24/FFD700/000000?text=Y', status: 'online', permissions: 'admin' },
    ]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
    const [globalSearchTerm, setGlobalSearchTerm] = useState('');
    const [activeSidebarPanel, setActiveSidebarPanel] = useState<'outline' | 'variables' | 'files' | 'plugins'>('outline');


    useEffect(() => {
        // Initialize theme based on metadata
        applyTheme(notebookMetadata.settings.theme);

        // Simulate real-time collaboration (e.g., via WebSockets)
        const ws = new WebSocket('ws://localhost:8080/notebook-collab'); // Placeholder for a real WebSocket
        ws.onopen = () => console.log('WebSocket connected for collaboration');
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'cell-update') {
                setCells(prevCells => prevCells.map(cell =>
                    cell.id === data.cellId ? { ...cell, ...data.updates, lastModified: new Date().toISOString() } : cell
                ));
            } else if (data.type === 'user-presence') {
                setUsers(prevUsers => {
                    const existing = prevUsers.find(u => u.id === data.user.id);
                    if (existing) return prevUsers.map(u => u.id === data.user.id ? data.user : u);
                    return [...prevUsers, data.user];
                });
            } else if (data.type === 'notification') {
                addNotification(data.notification);
            }
        };
        ws.onclose = () => console.log('WebSocket disconnected');
        ws.onerror = (error) => console.error('WebSocket error:', error);

        // Auto-save mechanism
        const autoSaveInterval = setInterval(() => {
            saveNotebook();
        }, (notebookMetadata.settings.autoSaveInterval || 30) * 1000); // Default 30 seconds

        return () => {
            ws.close();
            clearInterval(autoSaveInterval);
        };
    }, [notebookMetadata.settings.theme, notebookMetadata.settings.autoSaveInterval, notebookMetadata.settings.realtimeCollaboration]);


    // Undo/Redo mechanism
    useEffect(() => {
        // Only push to history if there's a meaningful change (more sophisticated diff could be used)
        if (JSON.stringify(history[historyPointer]) !== JSON.stringify(cells)) {
            // Check if current state is already at the end of history
            const newHistory = history.slice(0, historyPointer + 1);
            setHistory([...newHistory, cells]);
            setHistoryPointer(newHistory.length);
        }
    }, [cells]); // eslint-disable-line react-hooks/exhaustive-deps


    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: Notification = {
            id: generateUniqueId('notification'),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification,
        };
        setNotifications(prev => [...prev, newNotification]);
        // Play sound if enabled
        if (notebookMetadata.settings.notificationSound) {
            new Audio('/assets/notification.mp3').play().catch(e => console.error("Could not play notification sound", e));
        }
    }, [notebookMetadata.settings.notificationSound]);

    const executeCell = useCallback(async (cellId: string) => {
        const startTime = new Date().toISOString();
        setCells(prevCells => prevCells.map(cell =>
            cell.id === cellId ? { ...cell, status: 'running', executionCount: (cell.executionCount || 0) + 1, outputs: [], executionTime: { start: startTime, end: '', durationMs: 0 } } : cell
        ));
        addNotification({ type: 'info', message: `Executing cell ${cellId.substring(0, 8)}...`, source: 'Kernel' });

        const cellToExecute = cells.find(c => c.id === cellId);
        if (!cellToExecute) return;

        try {
            // Simulate API call to a kernel/AI backend
            let outputContent: any[] = [];
            let newStatus: EnhancedCell['status'] = 'success';

            const executionDelay = 1500 + Math.random() * 2000; // Simulate async work
            await new Promise(resolve => setTimeout(resolve, executionDelay));

            if (cellToExecute.type === ExpandedCellType.Code) {
                const code = (cellToExecute.content as { code: string; language: string }).code;
                const language = (cellToExecute.content as { code: string; language: string }).language;
                console.log(`Executing ${language} code for cell ${cellId}: ${code}`);
                // In a real app: call to kernel API
                if (code.includes('error')) {
                    newStatus = 'error';
                    outputContent = [{ type: 'error', name: 'RuntimeError', message: 'Simulated runtime error in code!', traceback: 'at <anonymous>:1:1' }];
                    addNotification({ type: 'error', message: `Cell ${cellId.substring(0, 8)} failed to execute.`, source: 'Kernel' });
                } else {
                    const simulatedOutput = `Output from ${language} for cell ${cellId.substring(0, 8)}:\n${code.toUpperCase()}`;
                    outputContent = parseCodeOutputs(simulatedOutput, language);
                    addNotification({ type: 'success', message: `Cell ${cellId.substring(0, 8)} executed successfully.`, source: 'Kernel' });
                }
            } else if (cellToExecute.type === ExpandedCellType.AIChat) {
                const prompt = cellToExecute.content.prompt as string;
                console.log(`Sending prompt to AI for cell ${cellId}: ${prompt}`);
                const aiResponse = `AI response to "${prompt.substring(0, 50)}...": Based on my analysis, you should consider a 'line chart' for time-series data. Here's a Python code snippet: \`\`\`python\nimport matplotlib.pyplot as plt\nplt.plot([1,2,3])\nplt.show()\n\`\`\``;
                outputContent = [...(cellToExecute.outputs || []), { role: 'user', text: prompt }, { role: 'ai', text: aiResponse }];
                addNotification({ type: 'success', message: `AI response received for cell ${cellId.substring(0, 8)}.`, source: 'AI Assistant' });
            } else if (cellToExecute.type === ExpandedCellType.SQL) {
                const query = cellToExecute.content.query as string;
                console.log(`Executing SQL query for cell ${cellId}: ${query}`);
                const mockSqlData = [
                    { id: 1, name: 'Alice', age: 30, city: 'NY' },
                    { id: 2, name: 'Bob', age: 24, city: 'LA' },
                    { id: 3, name: 'Charlie', age: 35, city: 'Chicago' }
                ];
                outputContent = [{ type: 'execute_result', data: { 'application/json': mockSqlData, 'text/plain': JSON.stringify(mockSqlData, null, 2) } }];
                addNotification({ type: 'success', message: `SQL query for cell ${cellId.substring(0, 8)} completed.`, source: 'Kernel' });
            } else if (cellToExecute.type === ExpandedCellType.Form) {
                const formData = cellToExecute.content.formData as Record<string, any>;
                console.log(`Processing form data for cell ${cellId}:`, formData);
                const resultText = `Form submitted successfully! Received: ${JSON.stringify(formData, null, 2)}`;
                outputContent = [{ type: 'stream', name: 'stdout', text: resultText }];
                addNotification({ type: 'success', message: `Form cell ${cellId.substring(0, 8)} submitted.`, source: 'System' });
            }
             else {
                outputContent = [{ type: 'stream', name: 'stderr', text: `Cell type ${cellToExecute.type} is not directly executable.` }];
                newStatus = 'error';
                addNotification({ type: 'error', message: `Cell ${cellId.substring(0, 8)} is not executable.`, source: 'System' });
            }

            const endTime = new Date().toISOString();
            const durationMs = new Date(endTime).getTime() - new Date(startTime).getTime();

            setCells(prevCells => prevCells.map(cell =>
                cell.id === cellId ? { ...cell, status: newStatus, outputs: outputContent, lastModified: endTime, executionTime: { start: startTime, end: endTime, durationMs: durationMs } } : cell
            ));
        } catch (error: any) {
            console.error('Cell execution error:', error);
            const endTime = new Date().toISOString();
            const durationMs = new Date(endTime).getTime() - new Date(startTime).getTime();
            setCells(prevCells => prevCells.map(cell =>
                cell.id === cellId ? { ...cell, status: 'error', outputs: [...(cell.outputs || []), { type: 'error', name: 'ExecutionError', message: error.message, traceback: error.stack }], lastModified: endTime, executionTime: { start: startTime, end: endTime, durationMs: durationMs } } : cell
            ));
            addNotification({ type: 'error', message: `Cell ${cellId.substring(0, 8)} execution failed: ${error.message}`, source: 'Kernel' });
        }
    }, [cells, addNotification, notebookMetadata.settings.notificationSound]);

    const updateCell = useCallback((cellId: string, updates: Partial<EnhancedCell>, pushToHistory: boolean = false) => {
        setCells(prevCells => prevCells.map(cell =>
            cell.id === cellId ? { ...cell, ...updates, lastModified: new Date().toISOString() } : cell
        ));
        // Simulate sending update to collaborators
        // if (notebookMetadata.settings.realtimeCollaboration) {
        //     ws.send(JSON.stringify({ type: 'cell-update', notebookId: notebookMetadata.id, cellId, updates }));
        // }
    }, [notebookMetadata.id, notebookMetadata.settings.realtimeCollaboration]);

    const addCell = useCallback((type: ExpandedCellType, content: any, index?: number, metadata?: Record<string, any>) => {
        const newCell: EnhancedCell = {
            id: generateUniqueId('cell'),
            type,
            content: content || (type === ExpandedCellType.Code ? { code: '', language: notebookMetadata.defaultKernelId.split('-')[0] } : (type === ExpandedCellType.Markdown ? '' : {})),
            metadata: metadata || {},
            outputs: [],
            executionCount: 0,
            status: 'idle',
            comments: [],
            createdAt: new Date().toISOString(),
            author: notebookMetadata.author,
            visibility: notebookMetadata.visibility,
        };
        setCells(prevCells => {
            const newCells = [...prevCells];
            if (index !== undefined && index >= 0 && index <= newCells.length) {
                newCells.splice(index, 0, newCell);
            } else {
                newCells.push(newCell);
            }
            return newCells;
        });
        setActiveCellId(newCell.id);
        addNotification({ type: 'info', message: `New ${type.replace(/_/g