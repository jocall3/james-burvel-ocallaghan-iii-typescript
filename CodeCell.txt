// google/notebook/components/CodeCell.tsx
// An Incantation. A single, executable block of code within the scholar's scroll.

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Cell, OutputType, ExecutionStatus, CellId, CodeCellState, CodeCellMeta, CellMode } from '../types';
import { KernelService } from '../services/KernelService';
import { AnalyticsService } from '../services/AnalyticsService';
import { CollaborationService } from '../services/CollaborationService';
import { StorageService } from '../services/StorageService';
import { AIService } from '../services/AIService';
import { EnvironmentService } from '../services/EnvironmentService';
import { PluginService } from '../services/PluginService';
import { NotificationService } from '../services/NotificationService';
import { SecurityService } from '../services/SecurityService';
import { ResourceMonitorService } from '../services/ResourceMonitorService';
import { DataExplorerService } from '../services/DataExplorerService';
import { VersionControlService } from '../services/VersionControlService';
import { DebuggerService } from '../services/DebuggerService';

// --- Reimagined Core Types and Enums (if not already in '../types') ---
// Assuming these are added to ../types or defined here for completeness if they don't exist
// and would be used throughout the expanded ecosystem.
export enum OutputContentType {
    TEXT = 'text/plain',
    HTML = 'text/html',
    MARKDOWN = 'text/markdown',
    SVG = 'image/svg+xml',
    PNG = 'image/png',
    JPG = 'image/jpeg',
    JSON = 'application/json',
    JAVASCRIPT = 'application/javascript',
    GEOJSON = 'application/geo+json',
    PLOTLY = 'application/vnd.plotly.v1+json',
    TABLE = 'application/vnd.google.notebook.table+json',
    WIDGET_V1 = 'application/vnd.jupyter.widget-view+json',
    ERROR = 'application/vnd.google.notebook.error+json',
}

export interface CellOutput {
    id: string;
    type: OutputContentType;
    data: string | object;
    metadata?: Record<string, any>;
    timestamp: number;
    error?: {
        name: string;
        message: string;
        stack: string[];
    };
    mimeBundles?: { [key: string]: string | object }; // For rich outputs
}

export interface ExecutionResult {
    output: CellOutput[];
    status: ExecutionStatus;
    executionTimeMs: number;
    kernelInfo?: {
        name: string;
        version: string;
        language: string;
    };
    environmentInfo?: {
        name: string;
        version: string;
        resources: { cpu: number; memory: number; gpu: number };
    };
    errorDetails?: {
        name: string;
        message: string;
        traceback: string[];
        suggestion?: string; // AI-powered suggestion
    };
}

// --- Extended CodeCellProps ---
interface CodeCellProps {
    cell: Cell; // The core cell data
    onCellChange: (cellId: CellId, newContent: string) => void;
    onCellExecute: (cellId: CellId, result: ExecutionResult) => void;
    onCellMetaChange: (cellId: CellId, newMeta: Partial<CodeCellMeta>) => void;
    isActive: boolean;
    isFocused: boolean;
    onFocus: (cellId: CellId) => void;
    onBlur: (cellId: CellId) => void;
    readOnly?: boolean;
    availableKernels: { id: string; name: string; language: string }[];
    currentKernelId: string;
    onKernelChange: (kernelId: string) => void;
    notebookId: string;
    userId: string;
    pluginManager: PluginService;
}

// --- Utility Components & Functions (exported for potential reuse) ---

// Fancy Syntax Highlighter & Editor (Monaco Editor might be integrated here in a real app)
export const CodeEditor: React.FC<{
    value: string;
    onChange: (newValue: string) => void;
    language: string;
    readOnly?: boolean;
    onExecute?: () => void;
    onCtrlEnter?: () => void;
    autoCompleteSuggestions?: string[];
    lintingErrors?: { line: number; message: string }[];
    theme?: string; // 'dark', 'light', 'custom'
    minimap?: boolean;
    lineNumbers?: boolean;
    folding?: boolean;
    collaborationCursors?: { userId: string; position: number; color: string }[];
}> = ({ value, onChange, language, readOnly, onExecute, onCtrlEnter, autoCompleteSuggestions, lintingErrors, theme = 'dark', minimap = false, lineNumbers = true, folding = true, collaborationCursors = [] }) => {
    const editorRef = useRef<HTMLTextAreaElement>(null); // For simplicity, still using textarea. In reality, this would be a sophisticated editor.

    useEffect(() => {
        // Mock integration for a real editor like Monaco or CodeMirror
        if (editorRef.current) {
            // Simulate editor setup
            console.log(`Setting up advanced editor for language: ${language}, theme: ${theme}`);
            // In a real scenario:
            // - Initialize Monaco Editor or CodeMirror
            // - Apply syntax highlighting, linting, autocompletion
            // - Handle collaboration cursors
        }
    }, [language, theme]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && e.shiftKey && onExecute) {
            e.preventDefault();
            onExecute();
        }
        if (e.key === 'Enter' && e.ctrlKey && onCtrlEnter) {
            e.preventDefault();
            onCtrlEnter();
        }
    }, [onExecute, onCtrlEnter]);

    return (
        <div className="relative group">
            <textarea
                ref={editorRef}
                value={value}
                onChange={e => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`w-full bg-gray-950 font-mono text-sm p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                rows={Math.max(3, value.split('\n').length + 1)} // Dynamic rows
                placeholder={`Enter ${language} code...`}
                readOnly={readOnly}
                aria-label="Code editor"
                data-language={language}
                data-theme={theme}
            />
            {lintingErrors && lintingErrors.length > 0 && (
                <div className="absolute bottom-1 right-1 text-red-400 text-xs px-2 py-1 bg-red-900 rounded-md animate-pulse">
                    {lintingErrors.length} linting error(s)
                </div>
            )}
            {/* Collaboration cursors could be rendered here over the textarea */}
            {collaborationCursors.map(cursor => (
                <div key={cursor.userId} className="absolute pointer-events-none" style={{
                    left: `${cursor.position * 8}px`, // Rough estimate based on font width
                    top: '10px', // Placeholder
                    backgroundColor: cursor.color,
                    width: '2px',
                    height: '1em',
                    opacity: 0.7
                }} title={`User: ${cursor.userId}`}></div>
            ))}
        </div>
    );
};

// Rich Output Renderer
export const RichOutputRenderer: React.FC<{ outputs: CellOutput[] }> = ({ outputs }) => {
    return (
        <div className="output-container p-3 bg-gray-900/50 rounded-b-lg overflow-auto max-h-96">
            {outputs.map((output, index) => (
                <div key={`${output.id}-${index}`} className="output-block mb-2 last:mb-0 border-b border-gray-800 pb-2">
                    {output.error ? (
                        <div className="text-red-400 font-mono text-xs whitespace-pre-wrap">
                            <strong className="text-red-500">{output.error.name}:</strong> {output.error.message}
                            <pre className="mt-1 text-red-300">{output.error.stack.join('\n')}</pre>
                        </div>
                    ) : (
                        (() => {
                            switch (output.type) {
                                case OutputContentType.TEXT:
                                    return <pre className="text-sm text-gray-200 whitespace-pre-wrap">{String(output.data)}</pre>;
                                case OutputContentType.HTML:
                                    return <div className="text-sm text-gray-200" dangerouslySetInnerHTML={{ __html: String(output.data) }} />;
                                case OutputContentType.MARKDOWN:
                                    // In a real app, use a Markdown renderer like 'react-markdown'
                                    return <div className="prose prose-invert text-sm" dangerouslySetInnerHTML={{ __html: String(output.data) }} />;
                                case OutputContentType.SVG:
                                    return <div className="svg-output" dangerouslySetInnerHTML={{ __html: String(output.data) }} />;
                                case OutputContentType.PNG:
                                case OutputContentType.JPG:
                                    return <img src={`data:${output.type};base64,${String(output.data)}`} alt="cell output" className="max-w-full h-auto" />;
                                case OutputContentType.JSON:
                                    return <pre className="text-sm text-green-300">{JSON.stringify(output.data, null, 2)}</pre>;
                                case OutputContentType.TABLE:
                                    const tableData = output.data as { headers: string[]; rows: (string | number)[][] };
                                    return (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-700">
                                                <thead className="bg-gray-800">
                                                    <tr>
                                                        {tableData.headers.map((h, i) => <th key={i} className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>)}
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-gray-900 divide-y divide-gray-800">
                                                    {tableData.rows.map((row, rowIndex) => (
                                                        <tr key={rowIndex}>
                                                            {row.map((cellVal, cellIndex) => <td key={cellIndex} className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{String(cellVal)}</td>)}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                case OutputContentType.PLOTLY:
                                    // Requires a Plotly.js React component
                                    return <PlotlyChart data={output.data} />; // Placeholder
                                case OutputContentType.WIDGET_V1:
                                    // Render interactive Jupyter widgets
                                    return <JupyterWidgetRenderer widgetData={output.data} />; // Placeholder
                                case OutputContentType.JAVASCRIPT:
                                    // Execute JS in a sandboxed iframe or a specific context
                                    return <SandboxedJSOutput jsCode={String(output.data)} />; // Placeholder
                                default:
                                    return <pre className="text-sm text-gray-500">[Unsupported output type: {output.type}]</pre>;
                            }
                        })()
                    )}
                </div>
            ))}
        </div>
    );
};

// Placeholder for Plotly Chart component
export const PlotlyChart: React.FC<{ data: any }> = ({ data }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        // In a real app, integrate Plotly.js here
        if (chartRef.current && (window as any).Plotly) {
            console.log('Rendering Plotly chart...');
            // (window as any).Plotly.newPlot(chartRef.current, data.data, data.layout);
        }
    }, [data]);
    return <div ref={chartRef} className="w-full h-96 bg-gray-950 flex items-center justify-center text-gray-500">
        Plotly Chart Placeholder (data: {JSON.stringify(data).substring(0, 100)}...)
    </div>;
};

// Placeholder for Jupyter Widget Renderer
export const JupyterWidgetRenderer: React.FC<{ widgetData: any }> = ({ widgetData }) => {
    // This would involve loading the widget manager and rendering the specific widget model
    return (
        <div className="w-full min-h-[100px] bg-gray-950 border border-dashed border-gray-700 flex items-center justify-center text-gray-500">
            Jupyter Widget Placeholder (model: {widgetData.model_id})
        </div>
    );
};

// Placeholder for Sandboxed JS Output
export const SandboxedJSOutput: React.FC<{ jsCode: string }> = ({ jsCode }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    useEffect(() => {
        if (iframeRef.current) {
            const iframe = iframeRef.current;
            // Create a Blob URL to execute script safely
            const blob = new Blob([
                '<!DOCTYPE html><html><body><script>',
                'try {',
                jsCode,
                '} catch (e) { console.error("Error in sandboxed JS:", e); document.body.innerText = "Error: " + e.message; }',
                '</script></body></html>'
            ], { type: 'text/html' });
            iframe.src = URL.createObjectURL(blob);
        }
    }, [jsCode]);
    return <iframe ref={iframeRef} sandbox="allow-scripts allow-forms" className="w-full h-48 border-none bg-gray-950" title="Sandboxed JS Output"></iframe>;
};


// Resource Monitor Display
export const ResourceMonitor: React.FC<{ cellId: CellId }> = ({ cellId }) => {
    const [resources, setResources] = useState({ cpu: 0, memory: 0, gpu: 0 });

    useEffect(() => {
        const interval = setInterval(async () => {
            const currentResources = await ResourceMonitorService.getCellResources(cellId);
            setResources(currentResources);
        }, 2000); // Poll every 2 seconds
        return () => clearInterval(interval);
    }, [cellId]);

    return (
        <div className="flex items-center space-x-4 text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
            <span>CPU: {resources.cpu.toFixed(1)}%</span>
            <span>Mem: {(resources.memory / 1024).toFixed(1)} MB</span>
            {resources.gpu > 0 && <span>GPU: {resources.gpu.toFixed(1)}%</span>}
            <span className="ml-2 text-cyan-400 animate-pulse">Live</span>
        </div>
    );
};

// Collaboration Status Indicator
export const CollaborationStatus: React.FC<{ users: { id: string; name: string; avatar: string; color: string }[] }> = ({ users }) => {
    if (users.length === 0) return null;
    return (
        <div className="flex items-center -space-x-2">
            {users.map(user => (
                <img key={user.id} src={user.avatar} alt={user.name}
                    className="w-6 h-6 rounded-full border-2 border-gray-700"
                    style={{ borderColor: user.color }}
                    title={user.name} />
            ))}
            {users.length > 0 && <span className="ml-3 text-xs text-gray-400">Collaborating</span>}
        </div>
    );
};

// AI Assistant Panel for Code Cells
export const AIAssistantPanel: React.FC<{
    cellId: CellId;
    code: string;
    onInsertCode: (newCode: string) => void;
}> = ({ cellId, code, onInsertCode }) => {
    const [query, setQuery] = useState('');
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [isThinking, setIsThinking] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<'generate' | 'explain' | 'optimize' | 'debug'>('generate');

    useEffect(() => {
        // Simulate real-time suggestions based on code content
        const timeout = setTimeout(async () => {
            if (code.length > 10 && activeTab === 'generate') {
                const suggestions = await AIService.getRealtimeCodeSuggestions(code);
                setAiSuggestions(suggestions);
            } else {
                setAiSuggestions([]);
            }
        }, 1500);
        return () => clearTimeout(timeout);
    }, [code, activeTab]);


    const handleAiAction = async (action: 'generate' | 'explain' | 'optimize' | 'debug', customQuery?: string) => {
        setIsThinking(true);
        setAiResponse(null);
        try {
            let response: string | { code: string; explanation: string; diff: string; };
            switch (action) {
                case 'generate':
                    response = await AIService.generateCode(code, customQuery || query);
                    break;
                case 'explain':
                    response = await AIService.explainCode(code);
                    break;
                case 'optimize':
                    response = await AIService.optimizeCode(code);
                    break;
                case 'debug':
                    response = await AIService.debugCode(code);
                    break;
                default:
                    response = 'Unsupported AI action.';
            }
            if (typeof response === 'string') {
                setAiResponse(response);
            } else {
                setAiResponse(response.explanation || response.code); // Display explanation or code
                if (action === 'optimize' || action === 'debug') {
                    // Offer to apply changes
                    console.log('AI generated diff:', response.diff);
                    // A more advanced UI would show a diff viewer here
                }
            }
        } catch (error) {
            setAiResponse(`Error from AI: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsThinking(false);
            setQuery('');
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg mt-4 border border-gray-700">
            <div className="flex space-x-2 border-b border-gray-700 pb-2 mb-3">
                <button onClick={() => setActiveTab('generate')} className={`px-3 py-1 rounded text-sm ${activeTab === 'generate' ? 'bg-cyan-600' : 'bg-gray-700'}`}>Generate Code</button>
                <button onClick={() => setActiveTab('explain')} className={`px-3 py-1 rounded text-sm ${activeTab === 'explain' ? 'bg-cyan-600' : 'bg-gray-700'}`}>Explain Code</button>
                <button onClick={() => setActiveTab('optimize')} className={`px-3 py-1 rounded text-sm ${activeTab === 'optimize' ? 'bg-cyan-600' : 'bg-gray-700'}`}>Optimize Code</button>
                <button onClick={() => setActiveTab('debug')} className={`px-3 py-1 rounded text-sm ${activeTab === 'debug' ? 'bg-cyan-600' : 'bg-gray-700'}`}>Debug Code</button>
            </div>

            {activeTab === 'generate' && (
                <>
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Describe what you want to generate (e.g., 'plot a histogram of data')"
                        className="w-full bg-gray-900 rounded p-2 text-sm mb-2"
                        onKeyDown={e => { if (e.key === 'Enter') handleAiAction('generate'); }}
                    />
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handleAiAction('generate')}
                            disabled={isThinking || query.trim() === ''}
                            className="px-4 py-2 bg-purple-600 rounded text-sm disabled:opacity-50"
                        >
                            {isThinking ? 'Generating...' : 'Generate Code'}
                        </button>
                        {aiSuggestions.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {aiSuggestions.map((s, i) => (
                                    <button key={i} className="px-2 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600" onClick={() => onInsertCode(s)}>
                                        Suggest: {s.substring(0, 30)}...
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'explain' && (
                <button onClick={() => handleAiAction('explain')} disabled={isThinking} className="px-4 py-2 bg-purple-600 rounded text-sm disabled:opacity-50">
                    {isThinking ? 'Explaining...' : 'Explain Code'}
                </button>
            )}

            {activeTab === 'optimize' && (
                <button onClick={() => handleAiAction('optimize')} disabled={isThinking} className="px-4 py-2 bg-purple-600 rounded text-sm disabled:opacity-50">
                    {isThinking ? 'Optimizing...' : 'Optimize Code'}
                </button>
            )}

            {activeTab === 'debug' && (
                <button onClick={() => handleAiAction('debug')} disabled={isThinking} className="px-4 py-2 bg-purple-600 rounded text-sm disabled:opacity-50">
                    {isThinking ? 'Debugging...' : 'Debug Code'}
                </button>
            )}


            {aiResponse && (
                <div className="mt-4 p-3 bg-gray-900 rounded text-sm whitespace-pre-wrap">
                    <h4 className="font-semibold text-purple-300 mb-2">AI Response:</h4>
                    {aiResponse}
                    {(activeTab === 'generate' || activeTab === 'optimize' || activeTab === 'debug') && (
                        <button
                            onClick={() => onInsertCode(aiResponse)}
                            className="mt-3 px-3 py-1 bg-purple-700 rounded text-xs hover:bg-purple-600"
                        >
                            Apply to Cell
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};


// Version Control and History Viewer
export const CellHistoryViewer: React.FC<{ cellId: CellId; currentContent: string; onRestore: (content: string) => void }> = ({ cellId, currentContent, onRestore }) => {
    const [history, setHistory] = useState<{ timestamp: number; content: string; author: string }[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        if (showHistory) {
            VersionControlService.getCellHistory(cellId).then(setHistory);
        }
    }, [cellId, showHistory]);

    return (
        <div className="mt-2 text-xs text-gray-400">
            <button onClick={() => setShowHistory(!showHistory)} className="hover:text-cyan-400">
                {showHistory ? 'Hide History' : 'View History'}
            </button>
            {showHistory && (
                <div className="bg-gray-900 rounded p-3 mt-2 max-h-60 overflow-y-auto">
                    {history.length === 0 ? (
                        <p>No history for this cell yet.</p>
                    ) : (
                        history.map((rev, index) => (
                            <div key={index} className="mb-2 p-2 border border-gray-700 rounded">
                                <p className="font-semibold text-cyan-400">Revision {history.length - index}</p>
                                <p className="text-gray-500 text-xs">{new Date(rev.timestamp).toLocaleString()} by {rev.author}</p>
                                <pre className="text-gray-300 text-xs bg-gray-800 p-1 rounded mt-1 overflow-x-auto">{rev.content.substring(0, 200)}...</pre>
                                <button onClick={() => onRestore(rev.content)} className="mt-1 px-2 py-0.5 bg-yellow-600 rounded hover:bg-yellow-500">Restore</button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

// Plugin UI Extension Point
export const PluginUIExtension: React.FC<{
    cellId: CellId;
    pluginManager: PluginService;
    extensionPoint: string; // e.g., 'codeCellToolbar', 'codeCellOutputArea'
    context: any; // Data available to plugins
}> = ({ cellId, pluginManager, extensionPoint, context }) => {
    const plugins = useMemo(() => pluginManager.getPluginsForExtensionPoint(extensionPoint), [pluginManager, extensionPoint]);

    return (
        <>
            {plugins.map(plugin => (
                <div key={plugin.id} className="plugin-extension-point">
                    {plugin.renderUI ? plugin.renderUI({ cellId, ...context }) : null}
                </div>
            ))}
        </>
    );
};

// Cell Metadata Editor
export const CellMetadataEditor: React.FC<{
    cellId: CellId;
    metadata: CodeCellMeta;
    onMetadataChange: (newMeta: Partial<CodeCellMeta>) => void;
}> = ({ cellId, metadata, onMetadataChange }) => {
    const [showEditor, setShowEditor] = useState(false);
    const [tempMeta, setTempMeta] = useState<Partial<CodeCellMeta>>(metadata);

    useEffect(() => {
        setTempMeta(metadata);
    }, [metadata]);

    const handleChange = (key: keyof CodeCellMeta, value: any) => {
        setTempMeta(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        onMetadataChange(tempMeta);
        setShowEditor(false);
    };

    return (
        <div className="text-xs mt-2">
            <button onClick={() => setShowEditor(!showEditor)} className="hover:text-cyan-400">
                {showEditor ? 'Hide Metadata' : 'Edit Metadata'}
            </button>
            {showEditor && (
                <div className="bg-gray-900 rounded p-3 mt-2">
                    <div className="mb-2">
                        <label className="block text-gray-400 mb-1">Tags (comma-separated):</label>
                        <input
                            type="text"
                            value={tempMeta.tags?.join(', ') || ''}
                            onChange={(e) => handleChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                            className="w-full bg-gray-800 rounded p-1 text-sm"
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block text-gray-400 mb-1">Run on Startup:</label>
                        <input
                            type="checkbox"
                            checked={tempMeta.runOnStartup || false}
                            onChange={(e) => handleChange('runOnStartup', e.target.checked)}
                            className="ml-2"
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block text-gray-400 mb-1">Cache Output:</label>
                        <input
                            type="checkbox"
                            checked={tempMeta.cacheOutput || false}
                            onChange={(e) => handleChange('cacheOutput', e.target.checked)}
                            className="ml-2"
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block text-gray-400 mb-1">Execution Priority:</label>
                        <input
                            type="number"
                            value={tempMeta.priority || 0}
                            onChange={(e) => handleChange('priority', parseInt(e.target.value) || 0)}
                            className="w-full bg-gray-800 rounded p-1 text-sm"
                        />
                    </div>
                    <button onClick={handleSave} className="mt-3 px-3 py-1 bg-green-600 rounded text-xs hover:bg-green-500">Save Metadata</button>
                </div>
            )}
        </div>
    );
};

// Environment Selector for the cell
export const CellEnvironmentSelector: React.FC<{
    currentEnvId: string;
    availableEnvs: { id: string; name: string }[];
    onEnvChange: (envId: string) => void;
}> = ({ currentEnvId, availableEnvs, onEnvChange }) => {
    return (
        <div className="text-xs text-gray-400 flex items-center space-x-2">
            <label htmlFor="cell-env-select" className="sr-only">Select Environment</label>
            <span className="text-xs">Env:</span>
            <select
                id="cell-env-select"
                value={currentEnvId}
                onChange={(e) => onEnvChange(e.target.value)}
                className="bg-gray-700 rounded px-2 py-1 text-white text-xs"
            >
                {availableEnvs.map(env => (
                    <option key={env.id} value={env.id}>{env.name}</option>
                ))}
            </select>
        </div>
    );
};

// Debugger Controls (simplified)
export const DebuggerControls: React.FC<{
    cellId: CellId;
    onDebugStart: () => void;
    onStepOver: () => void;
    onContinue: () => void;
    onStop: () => void;
    isDebugging: boolean;
    isPaused: boolean;
}> = ({ cellId, onDebugStart, onStepOver, onContinue, onStop, isDebugging, isPaused }) => {
    return (
        <div className="flex space-x-2">
            {!isDebugging && (
                <button onClick={onDebugStart} className="px-3 py-1 bg-indigo-600 rounded text-xs hover:bg-indigo-500">
                    Debug
                </button>
            )}
            {isDebugging && (
                <>
                    <button onClick={onStop} className="px-3 py-1 bg-red-600 rounded text-xs hover:bg-red-500">
                        Stop
                    </button>
                    {isPaused ? (
                        <button onClick={onContinue} className="px-3 py-1 bg-green-600 rounded text-xs hover:bg-green-500">
                            Continue
                        </button>
                    ) : (
                        <button onClick={onStepOver} className="px-3 py-1 bg-yellow-600 rounded text-xs hover:bg-yellow-500" disabled={!isDebugging}>
                            Step Over
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

// --- Main CodeCell Component (heavily expanded) ---
const CodeCell: React.FC<CodeCellProps> = ({
    cell,
    onCellChange,
    onCellExecute,
    onCellMetaChange,
    isActive,
    isFocused,
    onFocus,
    onBlur,
    readOnly,
    availableKernels,
    currentKernelId,
    onKernelChange,
    notebookId,
    userId,
    pluginManager,
}) => {
    const cellId = cell.id;
    const [code, setCode] = useState(cell.content);
    const [cellOutputs, setCellOutputs] = useState<CellOutput[]>([]);
    const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>(ExecutionStatus.IDLE);
    const [executionTime, setExecutionTime] = useState<number | null>(null);
    const [kernelDisplayName, setKernelDisplayName] = useState<string>('Python 3'); // Default or derived from currentKernelId
    const [collaborationUsers, setCollaborationUsers] = useState<{ id: string; name: string; avatar: string; color: string }[]>([]);
    const [lintingErrors, setLintingErrors] = useState<{ line: number; message: string }[]>([]);
    const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<string[]>([]);
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [cellMeta, setCellMeta] = useState<CodeCellMeta>(cell.metadata || {});
    const [currentCellEnvironment, setCurrentCellEnvironment] = useState<string>(cell.environmentId || 'default-env');
    const [availableCellEnvironments, setAvailableCellEnvironments] = useState<{ id: string; name: string }[]>([]);
    const [isDebugging, setIsDebugging] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [debuggerState, setDebuggerState] = useState<any>(null); // More detailed debugger state

    // Refs for editor and cell div for focus management
    const cellRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<HTMLTextAreaElement>(null); // Still using textarea for mock CodeEditor

    // Debounce code changes to avoid excessive calls to parent and linting
    const debouncedSetCode = useCallback((newCode: string) => {
        setCode(newCode);
        onCellChange(cellId, newCode); // Update parent immediately for UI, but other services might be debounced
    }, [cellId, onCellChange]);

    const handleCodeChange = useCallback((newCode: string) => {
        debouncedSetCode(newCode);
        // Trigger linting and autocomplete dynamically
        EnvironmentService.lintCode(newCode, currentKernelId).then(setLintingErrors);
        AIService.getAutoCompleteSuggestions(newCode, currentKernelId).then(setAutoCompleteSuggestions);
    }, [debouncedSetCode, currentKernelId]);

    // Initialize/Update Cell State from props
    useEffect(() => {
        setCode(cell.content);
        setCellOutputs(cell.outputs || []);
        setExecutionStatus(cell.status || ExecutionStatus.IDLE);
        setExecutionTime(cell.executionTime || null);
        setCellMeta(cell.metadata || {});
        setCurrentCellEnvironment(cell.environmentId || 'default-env');
    }, [cell]);

    // Load available environments for the cell
    useEffect(() => {
        EnvironmentService.getAvailableEnvironments(notebookId, currentKernelId).then(setAvailableCellEnvironments);
    }, [notebookId, currentKernelId]);

    // Collaboration and Real-time Updates
    useEffect(() => {
        const unsubscribe = CollaborationService.subscribeToCell(cellId, (update) => {
            if (update.type === 'content_change' && update.userId !== userId) {
                // Apply collaborative changes if not from current user
                // This would be more complex with a real editor, involving patching
                setCode(update.newContent);
            }
            if (update.type === 'cursor_move' && update.userId !== userId) {
                // Update collaborationCursors for CodeEditor
            }
            if (update.type === 'user_active') {
                setCollaborationUsers(prev => {
                    if (!prev.find(u => u.id === update.userId)) {
                        return [...prev, { id: update.userId, name: update.userName, avatar: update.userAvatar, color: update.userColor }];
                    }
                    return prev;
                });
            }
            if (update.type === 'user_inactive') {
                setCollaborationUsers(prev => prev.filter(u => u.id !== update.userId));
            }
        });

        // Inform others about presence
        CollaborationService.sendPresence(cellId, userId, 'active');

        return () => {
            CollaborationService.sendPresence(cellId, userId, 'inactive');
            unsubscribe();
        };
    }, [cellId, userId]);


    // Focus management
    const handleFocus = useCallback(() => {
        onFocus(cellId);
        AnalyticsService.trackEvent('cell_focus', { cellId, userId });
    }, [cellId, onFocus, userId]);

    const handleBlur = useCallback(() => {
        onBlur(cellId);
        // Save cell content on blur, potentially debounced
        StorageService.saveCellContent(notebookId, cellId, code);
        AnalyticsService.trackEvent('cell_blur', { cellId, userId });
    }, [cellId, onBlur, notebookId, code, userId]);

    const handleExecute = async () => {
        if (executionStatus === ExecutionStatus.RUNNING) {
            NotificationService.warn('Cell is already executing.');
            return;
        }

        AnalyticsService.trackEvent('cell_execute_start', { cellId, userId, kernelId: currentKernelId });
        setExecutionStatus(ExecutionStatus.RUNNING);
        setCellOutputs([]);
        setExecutionTime(null);
        NotificationService.info(`Executing cell ${cellId}...`);

        try {
            // Apply security scan before execution
            const securityCheck = await SecurityService.scanCodeForVulnerabilities(code);
            if (securityCheck.hasVulnerabilities) {
                NotificationService.error(`Security Warning: ${securityCheck.warning}`);
                setExecutionStatus(ExecutionStatus.FAILED);
                setCellOutputs([{
                    id: `output-sec-${Date.now()}`,
                    type: OutputContentType.ERROR,
                    data: { name: 'SecurityWarning', message: securityCheck.warning, stack: [] },
                    timestamp: Date.now(),
                }]);
                return;
            }

            const startTime = performance.now();
            const result: ExecutionResult = await KernelService.execute(
                code,
                currentKernelId,
                notebookId,
                cellId,
                currentCellEnvironment,
                cellMeta.priority
            );
            const endTime = performance.now();
            const timeTaken = endTime - startTime;

            setCellOutputs(result.output);
            setExecutionStatus(result.status);
            setExecutionTime(timeTaken);

            if (result.status === ExecutionStatus.SUCCESS) {
                NotificationService.success(`Cell ${cellId} executed successfully in ${timeTaken.toFixed(2)}ms.`);
            } else {
                NotificationService.error(`Cell ${cellId} failed: ${result.errorDetails?.message || 'Unknown error'}`);
            }

            // Trigger post-execution plugins
            pluginManager.triggerHook('onCellExecuted', { cellId, result, code });

            onCellExecute(cellId, result); // Propagate result up
            AnalyticsService.trackEvent('cell_execute_end', { cellId, userId, status: result.status, executionTime: timeTaken });

            // Store output if caching is enabled
            if (cellMeta.cacheOutput) {
                StorageService.cacheCellOutput(notebookId, cellId, result.output);
            }

        } catch (error) {
            console.error('Execution error:', error);
            setExecutionStatus(ExecutionStatus.FAILED);
            setCellOutputs([{
                id: `output-err-${Date.now()}`,
                type: OutputContentType.ERROR,
                data: { name: 'ExecutionError', message: error instanceof Error ? error.message : String(error), stack: [] },
                timestamp: Date.now(),
                error: { name: 'ExecutionError', message: error instanceof Error ? error.message : String(error), stack: [] }
            }]);
            NotificationService.error(`Critical error executing cell ${cellId}: ${error instanceof Error ? error.message : String(error)}`);
            AnalyticsService.trackEvent('cell_execute_error', { cellId, userId, errorMessage: error instanceof Error ? error.message : String(error) });
        }
    };

    const handleKernelChange = useCallback((newKernelId: string) => {
        onKernelChange(newKernelId);
        setKernelDisplayName(availableKernels.find(k => k.id === newKernelId)?.name || 'Unknown');
        NotificationService.info(`Kernel for cell ${cellId} changed to ${newKernelId}.`);
        AnalyticsService.trackEvent('cell_kernel_change', { cellId, userId, newKernelId });
    }, [onKernelChange, availableKernels, cellId, userId]);

    const handleRestoreCode = useCallback((restoredCode: string) => {
        setCode(restoredCode);
        onCellChange(cellId, restoredCode);
        NotificationService.info('Code restored from history.');
        AnalyticsService.trackEvent('cell_code_restore', { cellId, userId });
    }, [cellId, onCellChange, userId]);

    const handleCellMetaChange = useCallback((newMeta: Partial<CodeCellMeta>) => {
        setCellMeta(prev => ({ ...prev, ...newMeta }));
        onCellMetaChange(cellId, newMeta);
        NotificationService.info('Cell metadata updated.');
        AnalyticsService.trackEvent('cell_meta_update', { cellId, userId, newMeta });
    }, [cellId, onCellMetaChange, userId]);

    const handleInsertAICode = useCallback((aiCode: string) => {
        setCode(prev => prev + '\n' + aiCode);
        onCellChange(cellId, prev => prev + '\n' + aiCode); // Propagate
        NotificationService.info('AI-generated code inserted.');
        AnalyticsService.trackEvent('cell_ai_code_insert', { cellId, userId });
    }, [cellId, onCellChange, userId]);

    // Debugger actions
    const handleDebugStart = useCallback(async () => {
        setIsDebugging(true);
        setIsPaused(true); // Start paused at the first line typically
        NotificationService.info('Debugger started. Waiting for first breakpoint or step.');
        const initialState = await DebugberService.startDebugger(cellId, code, currentKernelId);
        setDebuggerState(initialState);
        AnalyticsService.trackEvent('debugger_start', { cellId, userId });
    }, [cellId, code, currentKernelId, userId]);

    const handleStepOver = useCallback(async () => {
        if (!isDebugging) return;
        NotificationService.info('Stepping over...');
        const newState = await DebuggerService.stepOver(cellId);
        setDebuggerState(newState);
        setIsPaused(newState.isPaused);
        if (!newState.isPaused) setIsDebugging(false); // If debug session ends
        AnalyticsService.trackEvent('debugger_step_over', { cellId, userId });
    }, [cellId, isDebugging, userId]);

    const handleContinue = useCallback(async () => {
        if (!isDebugging) return;
        NotificationService.info('Continuing execution...');
        setIsPaused(false);
        const newState = await DebuggerService.continueExecution(cellId);
        setDebuggerState(newState);
        setIsDebugging(newState.isDebugging); // Update overall debugging state
        setIsPaused(newState.isPaused); // Should be false if continuing
        if (!newState.isDebugging) NotificationService.info('Debugger finished.');
        AnalyticsService.trackEvent('debugger_continue', { cellId, userId });
    }, [cellId, isDebugging, userId]);

    const handleStopDebugger = useCallback(async () => {
        if (!isDebugging) return;
        NotificationService.info('Debugger stopped.');
        await DebuggerService.stopDebugger(cellId);
        setIsDebugging(false);
        setIsPaused(false);
        setDebuggerState(null);
        AnalyticsService.trackEvent('debugger_stop', { cellId, userId });
    }, [cellId, isDebugging, userId]);

    // Render logic for debugger UI (variables, call stack etc.)
    const renderDebuggerUI = () => {
        if (!isDebugging) return null;
        return (
            <div className="bg-gray-800 p-3 rounded-lg mt-4 border border-indigo-700">
                <h4 className="text-indigo-400 font-semibold mb-2">Debugger State</h4>
                <div className="flex space-x-4">
                    <div className="w-1/2">
                        <h5 className="text-gray-300 font-medium mb-1">Variables:</h5>
                        <pre className="bg-gray-900 p-2 rounded text-xs text-green-300 overflow-x-auto max-h-40">
                            {debuggerState?.variables ? JSON.stringify(debuggerState.variables, null, 2) : 'No variables'}
                        </pre>
                    </div>
                    <div className="w-1/2">
                        <h5 className="text-gray-300 font-medium mb-1">Call Stack:</h5>
                        <pre className="bg-gray-900 p-2 rounded text-xs text-orange-300 overflow-x-auto max-h-40">
                            {debuggerState?.callStack ? JSON.stringify(debuggerState.callStack, null, 2) : 'No call stack'}
                        </pre>
                    </div>
                </div>
                {debuggerState?.currentLine && (
                    <p className="mt-2 text-sm text-indigo-300">
                        Current Line: <span className="font-mono bg-indigo-900 px-2 py-0.5 rounded">{debuggerState.currentLine}</span>
                    </p>
                )}
            </div>
        );
    };

    const currentKernel = useMemo(() => availableKernels.find(k => k.id === currentKernelId), [availableKernels, currentKernelId]);

    const cellClasses = `
        relative bg-gray-800 rounded-xl shadow-lg border-2
        ${isActive ? 'border-cyan-500 ring-4 ring-cyan-500/30' : 'border-gray-700'}
        ${isFocused ? 'z-10' : 'z-0'}
        mb-6 transition-all duration-200 ease-in-out
        hover:border-cyan-600 hover:shadow-xl
    `;

    return (
        <div
            ref={cellRef}
            className={cellClasses}
            onFocus={handleFocus}
            onBlur={handleBlur}
            tabIndex={0}
            data-cell-id={cellId}
            data-cell-type="code"
        >
            {/* Cell Header with controls */}
            <div className="p-3 flex items-center justify-between border-b border-gray-700 bg-gray-850 rounded-t-xl">
                <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-500 font-mono select-none">[{cell.executionCount || '-'}]</span>
                    <select
                        value={currentKernelId}
                        onChange={(e) => handleKernelChange(e.target.value)}
                        className="bg-gray-700 rounded px-2 py-1 text-white text-xs hover:bg-gray-600 focus:outline-none"
                        title="Select Kernel"
                    >
                        {availableKernels.map(k => (
                            <option key={k.id} value={k.id}>{k.name} ({k.language})</option>
                        ))}
                    </select>
                    <CellEnvironmentSelector
                        currentEnvId={currentCellEnvironment}
                        availableEnvs={availableCellEnvironments}
                        onEnvChange={(envId) => {
                            setCurrentCellEnvironment(envId);
                            onCellMetaChange(cellId, { environmentId: envId });
                        }}
                    />
                    <CollaborationStatus users={collaborationUsers} />
                    <ResourceMonitor cellId={cellId} />
                </div>
                <div className="flex items-center space-x-2">
                    <DebuggerControls
                        cellId={cellId}
                        onDebugStart={handleDebugStart}
                        onStepOver={handleStepOver}
                        onContinue={handleContinue}
                        onStop={handleStopDebugger}
                        isDebugging={isDebugging}
                        isPaused={isPaused}
                    />
                    <button
                        onClick={() => setShowAIAssistant(!showAIAssistant)}
                        className={`px-3 py-1 text-xs rounded ${showAIAssistant ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                        title="AI Assistant"
                    >
                        <i className="fas fa-magic mr-1"></i> AI
                    </button>
                    <button onClick={handleExecute} disabled={executionStatus === ExecutionStatus.RUNNING || readOnly} className={`text-xs px-3 py-1 rounded transition-colors duration-200 ${executionStatus === ExecutionStatus.RUNNING ? 'bg-cyan-800 animate-pulse cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500'}`}>
                        {executionStatus === ExecutionStatus.RUNNING ? (
                            <>
                                <i className="fas fa-spinner fa-spin mr-1"></i> Executing...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-play mr-1"></i> Run
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => NotificationService.info(`Options for cell ${cellId}`)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
                        title="Cell Options"
                    >
                        <i className="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>

            {/* Code Editor Area */}
            <div className="p-3">
                <CodeEditor
                    value={code}
                    onChange={handleCodeChange}
                    language={currentKernel?.language || 'python'} // Dynamic language based on kernel
                    readOnly={readOnly || isDebugging}
                    onExecute={handleExecute}
                    onCtrlEnter={handleExecute} // Example of custom keybind
                    autoCompleteSuggestions={autoCompleteSuggestions}
                    lintingErrors={lintingErrors}
                    collaborationCursors={[]} // Placeholder for actual collaboration cursors
                />
            </div>

            {/* AI Assistant Panel */}
            {showAIAssistant && (
                <AIAssistantPanel
                    cellId={cellId}
                    code={code}
                    onInsertCode={handleInsertAICode}
                />
            )}

            {/* Debugger UI */}
            {renderDebuggerUI()}


            {/* Cell Footer - Metadata, History, Plugins */}
            <div className="p-3 border-t border-gray-700 bg-gray-850 rounded-b-xl flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center space-x-4">
                    {executionStatus !== ExecutionStatus.IDLE && (
                        <span className={`font-semibold ${executionStatus === ExecutionStatus.SUCCESS ? 'text-green-400' : 'text-red-400'}`}>
                            {executionStatus === ExecutionStatus.RUNNING ? 'Running' : executionStatus}
                        </span>
                    )}
                    {executionTime !== null && (
                        <span>Duration: {executionTime.toFixed(2)} ms</span>
                    )}
                    {cellMeta.tags && cellMeta.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {cellMeta.tags.map(tag => (
                                <span key={tag} className="bg-blue-700 px-2 py-0.5 rounded-full text-blue-100 text-xs">#{tag}</span>
                            ))}
                        </div>
                    )}
                    {cellMeta.runOnStartup && <span className="bg-orange-700 px-2 py-0.5 rounded-full text-orange-100 text-xs">AutoRun</span>}
                    {cellMeta.cacheOutput && <span className="bg-teal-700 px-2 py-0.5 rounded-full text-teal-100 text-xs">Cached</span>}
                </div>
                <div className="flex items-center space-x-4">
                    <CellHistoryViewer cellId={cellId} currentContent={code} onRestore={handleRestoreCode} />
                    <CellMetadataEditor cellId={cellId} metadata={cellMeta} onMetadataChange={handleCellMetaChange} />
                    {/* Plugin Extensions for footer */}
                    <PluginUIExtension
                        cellId={cellId}
                        pluginManager={pluginManager}
                        extensionPoint="codeCellFooter"
                        context={{ cell, code, outputs: cellOutputs, status: executionStatus }}
                    />
                </div>
            </div>

            {/* Output Area */}
            {cellOutputs.length > 0 && (
                <div className="border-t border-gray-700">
                    <RichOutputRenderer outputs={cellOutputs} />
                </div>
            )}
            {executionStatus === ExecutionStatus.RUNNING && (
                <div className="p-3 border-t border-gray-700 bg-gray-900/50 flex items-center justify-center text-cyan-400">
                    <i className="fas fa-spinner fa-spin mr-2"></i> Kernel is busy...
                </div>
            )}
        </div>
    );
};

export default CodeCell;

// --- Mock Service Implementations (in a real app, these would be separate files) ---

// Mock Kernel Service
class MockKernelService implements Partial<typeof KernelService> {
    private static instance: MockKernelService;
    private constructor() {}
    public static getInstance(): MockKernelService {
        if (!MockKernelService.instance) {
            MockKernelService.instance = new MockKernelService();
        }
        return MockKernelService.instance;
    }

    private kernels = {
        'py-3.10': { name: 'Python 3.10', language: 'python', version: '3.10.8' },
        'r-4.2': { name: 'R 4.2', language: 'r', version: '4.2.1' },
        'node-18': { name: 'Node.js 18', language: 'javascript', version: '18.12.0' },
        'julia-1.8': { name: 'Julia 1.8', language: 'julia', version: '1.8.5' },
    };

    async execute(
        code: string,
        kernelId: string = 'py-3.10',
        notebookId: string = 'mock-notebook',
        cellId: CellId = 'mock-cell',
        environmentId: string = 'default-env',
        priority: number = 0
    ): Promise<ExecutionResult> {
        console.log(`Mock Kernel: Executing code for cell ${cellId} with kernel ${kernelId} in env ${environmentId} (priority: ${priority})`);
        return new Promise(resolve => {
            const delay = Math.random() * 2000 + 500; // 0.5 to 2.5 seconds
            setTimeout(() => {
                const kernelInfo = this.kernels[kernelId as keyof typeof this.kernels] || this.kernels['py-3.10'];
                let output: CellOutput[];
                let status: ExecutionStatus = ExecutionStatus.SUCCESS;
                let errorDetails = undefined;

                if (code.includes('raise Exception') || code.includes('error')) {
                    status = ExecutionStatus.FAILED;
                    errorDetails = {
                        name: 'MockError',
                        message: 'Simulated execution error!',
                        traceback: ['Line 1: raise Exception', 'Line 2: Crash'],
                        suggestion: 'Check your syntax, or try simplifying the code.',
                    };
                    output = [{
                        id: `out-${Date.now()}`,
                        type: OutputContentType.ERROR,
                        data: JSON.stringify(errorDetails),
                        timestamp: Date.now(),
                        error: { name: errorDetails.name, message: errorDetails.message, stack: errorDetails.traceback }
                    }];
                } else if (code.includes('import matplotlib')) {
                    output = [{
                        id: `out-${Date.now()}`,
                        type: OutputContentType.PNG,
                        data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', // tiny red dot base64
                        metadata: { width: 100, height: 100 },
                        timestamp: Date.now(),
                    }, {
                        id: `out-text-${Date.now()}`,
                        type: OutputContentType.TEXT,
                        data: 'Plot generated successfully.',
                        timestamp: Date.now(),
                    }];
                } else if (code.includes('print("hello")')) {
                    output = [{
                        id: `out-${Date.now()}`,
                        type: OutputContentType.TEXT,
                        data: 'hello\n',
                        timestamp: Date.now(),
                    }];
                } else if (code.includes('display_html')) {
                    output = [{
                        id: `out-${Date.now()}`,
                        type: OutputContentType.HTML,
                        data: '<h1>Hello from HTML!</h1><p>This is <strong>rich</strong> output.</p>',
                        timestamp: Date.now(),
                    }];
                } else if (code.includes('display_json')) {
                    output = [{
                        id: `out-${Date.now()}`,
                        type: OutputContentType.JSON,
                        data: { key: 'value', number: 123, list: [1, 2, 3] },
                        timestamp: Date.now(),
                    }];
                } else if (code.includes('dataframe')) {
                    output = [{
                        id: `out-${Date.now()}`,
                        type: OutputContentType.TABLE,
                        data: {
                            headers: ['Name', 'Age', 'City'],
                            rows: [['Alice', 30, 'New York'], ['Bob', 24, 'London']]
                        },
                        timestamp: Date.now(),
                    }];
                } else if (code.includes('import plotly')) {
                    output = [{
                        id: `out-${Date.now()}`,
                        type: OutputContentType.PLOTLY,
                        data: {
                            data: [{ y: [1, 2, 3] }],
                            layout: { title: 'Mock Plotly Chart' }
                        },
                        timestamp: Date.now(),
                    }];
                } else if (code.includes('create_widget')) {
                    output = [{
                        id: `out-${Date.now()}`,
                        type: OutputContentType.WIDGET_V1,
                        data: {
                            model_id: 'mock_widget_123',
                            version_major: 2,
                            version_minor: 0,
                            // More complex widget state here
                        },
                        timestamp: Date.now(),
                    }];
                }
                else {
                    output = [{
                        id: `out-${Date.now()}`,
                        type: OutputContentType.TEXT,
                        data: `Executed successfully with ${kernelInfo.name} in ${kernelInfo.language} (Env: ${environmentId}). Output: ${code.length} chars.`,
                        timestamp: Date.now(),
                    }];
                }

                resolve({
                    output,
                    status,
                    executionTimeMs: delay,
                    kernelInfo,
                    environmentInfo: {
                        name: environmentId,
                        version: '1.0',
                        resources: { cpu: Math.random() * 50, memory: Math.random() * 512, gpu: Math.random() * 10 }
                    },
                    errorDetails
                });
            }, delay);
        });
    }
}
// Replace KernelService with the mock one for local dev/testing
(KernelService as any) = MockKernelService.getInstance();


// Mock Analytics Service
class MockAnalyticsService {
    static trackEvent(eventName: string, properties: Record<string, any>) {
        console.log(`[Analytics] Event: ${eventName}`, properties);
    }
}
(AnalyticsService as any) = MockAnalyticsService;

// Mock Collaboration Service
class MockCollaborationService {
    private static cellSubscribers: Record<string, ((update: any) => void)[]> = {};
    private static userCursors: Record<string, { userId: string; position: number; color: string }[]> = {};

    static subscribeToCell(cellId: CellId, callback: (update: any) => void) {
        if (!this.cellSubscribers[cellId]) {
            this.cellSubscribers[cellId] = [];
        }
        this.cellSubscribers[cellId].push(callback);
        console.log(`[Collab] User subscribed to cell ${cellId}`);
        // Simulate some initial users
        setTimeout(() => {
            callback({ type: 'user_active', userId: 'user-alpha', userName: 'Alpha', userAvatar: 'https://i.pravatar.cc/150?img=1', userColor: '#ff00ff' });
            if (Math.random() > 0.5) {
                callback({ type: 'user_active', userId: 'user-beta', userName: 'Beta', userAvatar: 'https://i.pravatar.cc/150?img=2', userColor: '#00ffff' });
            }
        }, 1000);
        return () => {
            this.cellSubscribers[cellId] = this.cellSubscribers[cellId].filter(cb => cb !== callback);
            console.log(`[Collab] User unsubscribed from cell ${cellId}`);
        };
    }

    static sendPresence(cellId: CellId, userId: string, status: 'active' | 'inactive') {
        console.log(`[Collab] User ${userId} is ${status} in cell ${cellId}`);
        // In a real system, this would broadcast to other users
    }

    static sendCodeChange(cellId: CellId, userId: string, newContent: string) {
        console.log(`[Collab] User ${userId} sent code change for cell ${cellId}`);
        this.cellSubscribers[cellId]?.forEach(cb => cb({ type: 'content_change', userId, newContent }));
    }

    static sendCursorMove(cellId: CellId, userId: string, position: number) {
        if (!this.userCursors[cellId]) this.userCursors[cellId] = [];
        const existing = this.userCursors[cellId].findIndex(c => c.userId === userId);
        const userColor = userId === 'user-alpha' ? '#ff00ff' : '#00ffff'; // Mock colors
        if (existing > -1) {
            this.userCursors[cellId][existing].position = position;
        } else {
            this.userCursors[cellId].push({ userId, position, color: userColor });
        }
        this.cellSubscribers[cellId]?.forEach(cb => cb({ type: 'cursor_move', userId, position, color: userColor }));
    }

    static getCellUsers(cellId: CellId): { id: string; name: string; avatar: string; color: string }[] {
        // This would query active users from a backend
        return [
            { id: 'user-alpha', name: 'Alpha Dev', avatar: 'https://i.pravatar.cc/150?img=1', color: '#ff00ff' },
            { id: 'user-beta', name: 'Beta Tester', avatar: 'https://i.pravatar.cc/150?img=2', color: '#00ffff' },
        ];
    }
}
(CollaborationService as any) = MockCollaborationService;

// Mock Storage Service
class MockStorageService {
    static async saveCellContent(notebookId: string, cellId: CellId, content: string): Promise<void> {
        console.log(`[Storage] Saved content for cell ${cellId} in notebook ${notebookId}: ${content.substring(0, 50)}...`);
        // Simulate network delay
        await new Promise(res => setTimeout(res, 100));
    }
    static async cacheCellOutput(notebookId: string, cellId: CellId, outputs: CellOutput[]): Promise<void> {
        console.log(`[Storage] Cached ${outputs.length} outputs for cell ${cellId} in notebook ${notebookId}.`);
        await new Promise(res => setTimeout(res, 50));
    }
}
(StorageService as any) = MockStorageService;

// Mock AI Service
class MockAIService {
    static async generateCode(context: string, prompt: string): Promise<string> {
        console.log(`[AI] Generating code for context: ${context.substring(0, 50)}..., prompt: ${prompt}`);
        await new Promise(res => setTimeout(res, 1500 + Math.random() * 1000));
        if (prompt.includes('plot')) {
            return `# Python code to plot a histogram\nimport matplotlib.pyplot as plt\nimport numpy as np\ndata = np.random.randn(100)\nplt.hist(data, bins=10)\nplt.title("${prompt}")\nplt.show()`;
        }
        if (prompt.includes('dataframe')) {
            return `import pandas as pd\ndf = pd.DataFrame({'col1': [1, 2], 'col2': [3, 4]})\nprint(df.head())`;
        }
        return `print("AI generated: ${prompt} based on ${context.substring(0, 20)}...")`;
    }

    static async explainCode(code: string): Promise<string> {
        console.log(`[AI] Explaining code: ${code.substring(0, 50)}...`);
        await new Promise(res => setTimeout(res, 1000 + Math.random() * 500));
        return `This code block is a basic ${code.includes('import') ? 'import statement' : 'print statement'}. It demonstrates fundamental ${code.includes('python') ? 'Python' : 'programming'} concepts.`;
    }

    static async optimizeCode(code: string): Promise<{ code: string; explanation: string; diff: string; }> {
        console.log(`[AI] Optimizing code: ${code.substring(0, 50)}...`);
        await new Promise(res => setTimeout(res, 1500 + Math.random() * 1000));
        const optimizedCode = code.replace(/for i in range\(len\(arr\)\):\s*val = arr\[i\]/, 'for val in arr:');
        const diff = `--- original\n+++ optimized\n- ${code}\n+ ${optimizedCode}`;
        return {
            code: optimizedCode,
            explanation: `Optimized the loop iteration for better readability and performance.`,
            diff: diff,
        };
    }

    static async debugCode(code: string): Promise<{ code: string; explanation: string; diff: string; }> {
        console.log(`[AI] Debugging code: ${code.substring(0, 50)}...`);
        await new Promise(res => setTimeout(res, 2000 + Math.random() * 1000));
        if (code.includes('error')) {
            const fixedCode = code.replace('raise Exception("error")', 'print("Error handled gracefully")');
            const diff = `--- original\n+++ fixed\n- ${code}\n+ ${fixedCode}`;
            return {
                code: fixedCode,
                explanation: `Detected and fixed a potential exception by adding a print statement instead of raising an error.`,
                diff: diff,
            };
        }
        return {
            code: code,
            explanation: `No immediate issues detected. The code appears to be syntactically correct.`,
            diff: '',
        };
    }

    static async getRealtimeCodeSuggestions(code: string): Promise<string[]> {
        console.log(`[AI] Getting realtime suggestions for: ${code.substring(0, 30)}...`);
        await new Promise(res => setTimeout(res, 300));
        if (code.includes('plot')) {
            return ['import matplotlib.pyplot as plt', 'plt.figure()', 'plt.show()'];
        }
        if (code.includes('data')) {
            return ['import pandas as pd', 'data.head()', 'data.describe()'];
        }
        return ['# Suggestion 1', 'another_suggestion()'];
    }

    static async getAutoCompleteSuggestions(code: string, kernelId: string): Promise<{ line: number; message: string }[]> {
        console.log(`[AI] Getting auto-complete suggestions for: ${code.substring(0, 30)}...`);
        await new Promise(res => setTimeout(res, 200));
        if (code.endsWith('pd.')) {
            return ['DataFrame', 'read_csv', 'Series'];
        }
        return ['my_variable', 'my_function()', 'another_option'];
    }
}
(AIService as any) = MockAIService;

// Mock Environment Service
class MockEnvironmentService {
    static async getAvailableEnvironments(notebookId: string, kernelId: string): Promise<{ id: string; name: string }[]> {
        console.log(`[Env] Getting environments for notebook ${notebookId}, kernel ${kernelId}`);
        await new Promise(res => setTimeout(res, 100));
        return [
            { id: 'default-env', name: 'Default Python Env' },
            { id: 'data-science-2023', name: 'Data Science (Py 3.9)' },
            { id: 'ml-gpu-tf', name: 'ML GPU (TensorFlow)' },
        ];
    }
    static async lintCode(code: string, kernelId: string): Promise<{ line: number; message: string }[]> {
        console.log(`[Env] Linting code for kernel ${kernelId}: ${code.substring(0, 30)}...`);
        await new Promise(res => setTimeout(res, 500));
        if (code.includes('  ')) { // Simple mock linter
            return [{ line: 1, message: 'Trailing whitespace detected.' }];
        }
        return [];
    }
}
(EnvironmentService as any) = MockEnvironmentService;


// Mock Plugin Service
interface Plugin {
    id: string;
    name: string;
    extensionPoints: string[]; // e.g., 'codeCellToolbar', 'codeCellOutputArea', 'onCellExecuted'
    renderUI?: (context: any) => React.ReactNode;
    onHook?: (hookName: string, context: any) => void;
}

class MockPluginService {
    private plugins: Plugin[] = [];

    constructor() {
        // Register some mock plugins
        this.registerPlugin({
            id: 'example-output-transform',
            name: 'Output Transformer',
            extensionPoints: ['codeCellOutputArea'],
            renderUI: ({ cellId, outputs }) => {
                if (outputs.length > 0 && outputs[0].type === OutputContentType.TEXT) {
                    return (
                        <div className="bg-blue-900/30 text-blue-300 text-xs p-2 rounded-md mt-2">
                            Plugin processed output: {String(outputs[0].data).toUpperCase()}
                        </div>
                    );
                }
                return null;
            },
        });
        this.registerPlugin({
            id: 'ml-experiment-tracker',
            name: 'ML Experiment Tracker',
            extensionPoints: ['codeCellFooter', 'onCellExecuted'],
            renderUI: ({ cellId, status }) => (
                <span className="bg-fuchsia-700 px-2 py-0.5 rounded-full text-fuchsia-100 text-xs">
                    <i className="fas fa-flask mr-1"></i> {status === ExecutionStatus.SUCCESS ? 'ML Run Logged' : 'ML Tracking'}
                </span>
            ),
            onHook: (hookName, context) => {
                if (hookName === 'onCellExecuted' && context.result.status === ExecutionStatus.SUCCESS) {
                    console.log(`[Plugin: ML Tracker] Cell ${context.cellId} executed. Logging experiment.`);
                }
            },
        });
        this.registerPlugin({
            id: 'data-profiler',
            name: 'Data Profiler',
            extensionPoints: ['codeCellToolbar'],
            renderUI: ({ cellId, code }) => (
                <button
                    onClick={() => NotificationService.info(`Profiling data from cell ${cellId}...`)}
                    className="px-2 py-1 bg-yellow-600 rounded text-xs hover:bg-yellow-500"
                >
                    <i className="fas fa-chart-bar mr-1"></i> Profile Data
                </button>
            ),
        });
    }

    registerPlugin(plugin: Plugin) {
        this.plugins.push(plugin);
        console.log(`[PluginService] Registered plugin: ${plugin.name}`);
    }

    getPluginsForExtensionPoint(extensionPoint: string): Plugin[] {
        return this.plugins.filter(p => p.extensionPoints.includes(extensionPoint));
    }

    triggerHook(hookName: string, context: any) {
        this.plugins.forEach(plugin => {
            if (plugin.extensionPoints.includes(hookName) && plugin.onHook) {
                plugin.onHook(hookName, context);
            }
        });
    }
}
(PluginService as any) = new MockPluginService(); // Instantiate the mock service

// Mock Notification Service
class MockNotificationService {
    static info(message: string) { console.log(`[INFO] ${message}`); }
    static warn(message: string) { console.warn(`[WARN] ${message}`); }
    static error(message: string) { console.error(`[ERROR] ${message}`); }
    static success(message: string) { console.log(`[SUCCESS] ${message}`); }
}
(NotificationService as any) = MockNotificationService;

// Mock Security Service
class MockSecurityService {
    static async scanCodeForVulnerabilities(code: string): Promise<{ hasVulnerabilities: boolean; warning?: string }> {
        console.log(`[Security] Scanning code for vulnerabilities: ${code.substring(0, 50)}...`);
        await new Promise(res => setTimeout(res, 300));
        if (code.includes('os.system') || code.includes('subprocess.run')) {
            return { hasVulnerabilities: true, warning: 'Potential command injection vulnerability detected (os.system or subprocess.run). Review carefully.' };
        }
        if (code.includes('eval(')) {
            return { hasVulnerabilities: true, warning: 'Use of eval() detected. This can be a security risk. Consider safer alternatives.' };
        }
        return { hasVulnerabilities: false };
    }
}
(SecurityService as any) = MockSecurityService;

// Mock Resource Monitor Service
class MockResourceMonitorService {
    private static cellResources: Record<CellId, { cpu: number; memory: number; gpu: number }> = {};

    static async getCellResources(cellId: CellId): Promise<{ cpu: number; memory: number; gpu: number }> {
        if (!this.cellResources[cellId]) {
            this.cellResources[cellId] = { cpu: 0, memory: 0, gpu: 0 };
        }
        // Simulate fluctuating resource usage
        this.cellResources[cellId].cpu = Math.max(0, this.cellResources[cellId].cpu + (Math.random() - 0.5) * 5);
        this.cellResources[cellId].memory = Math.max(0, this.cellResources[cellId].memory + (Math.random() - 0.5) * 50);
        this.cellResources[cellId].gpu = Math.max(0, this.cellResources[cellId].gpu + (Math.random() - 0.5) * 2);
        this.cellResources[cellId].cpu = Math.min(100, this.cellResources[cellId].cpu);
        this.cellResources[cellId].memory = Math.min(2048, this.cellResources[cellId].memory);
        this.cellResources[cellId].gpu = Math.min(100, this.cellResources[cellId].gpu);
        await new Promise(res => setTimeout(res, 50)); // Simulate async fetch
        return { ...this.cellResources[cellId] };
    }
}
(ResourceMonitorService as any) = MockResourceMonitorService;

// Mock Data Explorer Service (example: for in-cell data visualization/profiling)
class MockDataExplorerService {
    static async profileData(cellId: CellId, dataVarName: string): Promise<any> {
        console.log(`[DataExplorer] Profiling data variable '${dataVarName}' from cell ${cellId}`);
        await new Promise(res => setTimeout(res, 800));
        return {
            summary: `Profile for '${dataVarName}': 1000 rows, 5 columns. Mean: 0.5, Std: 0.2.`,
            distribution: { /* chart data */ },
        };
    }
}
(DataExplorerService as any) = MockDataExplorerService;

// Mock Version Control Service
class MockVersionControlService {
    private static cellRevisions: Record<CellId, { timestamp: number; content: string; author: string }[]> = {};

    static async saveCellRevision(cellId: CellId, content: string, userId: string, userName: string): Promise<void> {
        if (!this.cellRevisions[cellId]) {
            this.cellRevisions[cellId] = [];
        }
        this.cellRevisions[cellId].unshift({ timestamp: Date.now(), content, author: userName }); // Add to front
        // Keep only last 10 revisions for simplicity
        if (this.cellRevisions[cellId].length > 10) {
            this.cellRevisions[cellId].pop();
        }
        console.log(`[VersionControl] Saved revision for cell ${cellId}. Total: ${this.cellRevisions[cellId].length}`);
        await new Promise(res => setTimeout(res, 50));
    }

    static async getCellHistory(cellId: CellId): Promise<{ timestamp: number; content: string; author: string }[]> {
        console.log(`[VersionControl] Fetching history for cell ${cellId}`);
        await new Promise(res => setTimeout(res, 200));
        return this.cellRevisions[cellId] || [
            { timestamp: Date.now() - 3600000, content: 'print("Initial code") # Old version', author: 'System' },
            { timestamp: Date.now() - 1800000, content: 'print("Updated code with feature X") # Mid version', author: 'Alice' },
        ];
    }
}
(VersionControlService as any) = MockVersionControlService;

// Mock Debugger Service
class MockDebuggerService {
    private static debugSessions: Record<CellId, { codeLines: string[]; currentLine: number; isPaused: boolean; variables: Record<string, any>; callStack: string[] }> = {};

    static async startDebugger(cellId: CellId, code: string, kernelId: string): Promise<any> {
        console.log(`[Debugger] Starting debug session for cell ${cellId} with kernel ${kernelId}`);
        await new Promise(res => setTimeout(res, 500));
        const codeLines = code.split('\n');
        this.debugSessions[cellId] = {
            codeLines,
            currentLine: 1,
            isPaused: true,
            variables: { 'a': 10, 'b': 'hello' },
            callStack: ['<module>'],
        };
        return { ...this.debugSessions[cellId], isDebugging: true };
    }

    static async stepOver(cellId: CellId): Promise<any> {
        await new Promise(res => setTimeout(res, 300));
        const session = this.debugSessions[cellId];
        if (!session) return { isDebugging: false, isPaused: false };

        session.currentLine++;
        if (session.currentLine > session.codeLines.length) {
            delete this.debugSessions[cellId];
            return { isDebugging: false, isPaused: false }; // Debug session ended
        }
        // Simulate variable changes
        session.variables[`var_${session.currentLine}`] = Math.random();
        return { ...session, isDebugging: true, isPaused: true };
    }

    static async continueExecution(cellId: CellId): Promise<any> {
        await new Promise(res => setTimeout(res, 800));
        const session = this.debugSessions[cellId];
        if (!session) return { isDebugging: false, isPaused: false };

        delete this.debugSessions[cellId]; // Simulate execution until end
        return { isDebugging: false, isPaused: false };
    }

    static async stopDebugger(cellId: CellId): Promise<void> {
        await new Promise(res => setTimeout(res, 100));
        delete this.debugSessions[cellId];
        console.log(`[Debugger] Stopped debug session for cell ${cellId}`);
    }
}
(DebuggerService as any) = MockDebuggerService;