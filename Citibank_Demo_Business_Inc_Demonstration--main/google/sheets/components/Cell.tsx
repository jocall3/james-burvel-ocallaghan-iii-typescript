// google/sheets/components/Cell.tsx
// The Atom of Calculation. A single point in the grid, holding a value or a formula.

import React, { useState, useEffect, useRef, useCallback, useContext, useMemo } from 'react';

// New Interfaces and Types for an expanded Cell universe
export type CellDataType = 'text' | 'number' | 'date' | 'boolean' | 'formula' | 'richtext' | 'image' | 'video' | 'audio' | 'chart' | 'json' | 'link' | 'code' | 'ai_prompt' | 'geolocation' | 'currency' | 'percentage' | 'array' | 'object' | 'task';
export type CellValueDisplayMode = 'value' | 'formula' | 'raw' | 'preview' | 'code' | 'image_only';
export type CellValidationRule = {
    id: string;
    type: 'range' | 'list' | 'regex' | 'custom_formula' | 'api_lookup' | 'unique';
    value: string | string[] | { min?: number | string; max?: number | string; sourceRange?: string };
    errorMessage: string;
    strict?: boolean; // If strict, prevents invalid input or shows strong warning
    applyToRange?: string; // e.g., "A1:A10" - applies this rule to a range based on this cell's context
};
export type CellFormat = {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold' | 'lighter' | 'bolder' | number;
    fontStyle?: 'normal' | 'italic';
    textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
    color?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    wordWrap?: 'break-word' | 'normal' | 'break-all';
    overflow?: 'hidden' | 'visible' | 'scroll';
    textOrientation?: 'horizontal' | 'vertical-rl' | 'vertical-lr';
    rotation?: number; // degrees
    border?: {
        top?: string; // e.g., "1px solid #ccc"
        right?: string;
        bottom?: string;
        left?: string;
        all?: string; // Shorthand
    };
    numberFormat?: string; // e.g., "0.00", "$#,##0.00", "YYYY-MM-DD HH:MM:SS", "0%"
    padding?: string; // e.g., "4px 8px"
    textIndent?: string;
    direction?: 'ltr' | 'rtl';
};
export type CellConditionalFormattingRule = {
    id: string;
    condition: string; // A formula or a simple value comparison string (e.g., ">100", "is empty", "=AND(A1>0, B1<10)")
    format: CellFormat;
    priority: number; // Lower number = higher priority
    stopIfTrue?: boolean;
    range?: string; // If this rule applies to a specific range (e.g., B2:D10)
};
export type CellComment = {
    id: string;
    author: string;
    timestamp: Date;
    content: string;
    threadId?: string; // For comment threads
    resolved?: boolean;
    replies?: CellComment[]; // Nested replies
};
export type CellHistoryEntry = {
    timestamp: Date;
    userId: string;
    action: 'edit' | 'formula_change' | 'format_change' | 'comment_add' | 'comment_resolve' | 'data_type_change' | 'revert' | 'ai_generation';
    details: string; // e.g., "Changed value from 'old' to 'new'", "Updated format: bold"
    oldValue?: any;
    newValue?: any;
    cellLocation?: { row: number; col: number; sheetId: string }; // In case history is viewed globally
};
export type CellReference = {
    sheetId: string;
    row: number;
    col: number;
    range?: boolean; // If this reference represents a range
};
export type CellLink = {
    url: string;
    text?: string; // Display text for the link
    type: 'web' | 'cell_ref' | 'file' | 'email';
    target?: CellReference | string; // For cell references or file paths, email address
    openInNewTab?: boolean;
};
export type CellSparklineConfig = {
    type: 'line' | 'bar' | 'area' | 'winloss' | 'bullet';
    dataRange: string; // e.g., "A1:A5" relative to cell or "Sheet2!B1:B5"
    color?: string;
    negColor?: string;
    chartRangeMin?: number | 'auto';
    chartRangeMax?: number | 'auto';
    axisColor?: string;
    lineWidth?: number;
    showMarkers?: boolean;
};
export type CellChartConfig = {
    id: string;
    type: 'bar' | 'line' | 'pie' | 'scatter' | 'bubble' | 'radar' | 'doughnut' | 'polarArea';
    dataRange: string; // Source data for the chart
    title?: string;
    options?: Record<string, any>; // Chart library specific options (e.g., Chart.js options)
    width?: string; // e.g., "100%", "200px"
    height?: string;
    embeddedInCell?: boolean; // If the chart is fully rendered within the cell bounds
    interactive?: boolean;
    dataLabels?: 'show' | 'hide';
};
export type CellDataSourceConfig = {
    id: string; // Unique ID for the data source
    name: string;
    type: 'api' | 'sql' | 'nosql' | 'csv_url' | 'json_url' | 'graphql' | 'websocket';
    config: Record<string, any>; // API key, endpoint, database connection string, headers etc.
    query?: string; // SQL query, API path, GraphQL query, JSONPath expression
    authentication?: 'none' | 'api_key' | 'oauth2' | 'bearer_token';
    refreshIntervalMs?: number; // For live data sources
    lastRefresh?: Date;
    status?: 'active' | 'inactive' | 'error';
    schema?: Record<string, any>; // Discovered schema of the data
};
export type CellTaskConfig = {
    id: string;
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'on_hold' | 'canceled';
    dueDate?: Date;
    startDate?: Date;
    assigneeId?: string; // User ID
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    description?: string;
    tags?: string[];
    progress?: number; // 0-100
    subtasks?: CellTaskConfig[]; // Hierarchical tasks
    attachments?: { fileName: string; url: string; mimeType: string }[];
    dependencies?: { taskId: string; type: 'precedes' | 'follows' }[];
    comments?: CellComment[]; // Task-specific comments
};
export type CellAIPrompt = {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    model?: string; // e.g., 'gpt-4', 'gemini-pro'
    temperature?: number; // 0-1
    maxTokens?: number;
    parameters?: Record<string, any>; // Model specific parameters
    toolCalls?: { id: string; function: { name: string; arguments: string } }[];
    toolOutputs?: { toolCallId: string; output: string }[];
};
export type CellGeoLocation = {
    latitude: number;
    longitude: number;
    altitude?: number;
    address?: string; // Reverse geocoded address
    timestamp?: Date;
    accuracy?: number; // meters
    mapUrl?: string; // Link to an interactive map
};
export type CellSemanticTag = {
    id: string;
    name: string;
    color?: string;
    description?: string;
    ontologyRef?: string; // Link to a knowledge graph ontology
};


// Global Contexts (simulated for architectural understanding)
// In a real app, these would be in separate files and imported.
// For this exercise, they are defined here to show interaction scope.

interface GlobalSheetContextType {
    getSheetData: (sheetId: string) => Record<string, any>; // Returns full sheet data for advanced operations
    getCellValue: (row: number, col: number, sheetId?: string) => any;
    getCellFormula: (row: number, col: number, sheetId?: string) => string | undefined;
    updateCell: (sheetId: string, row: number, col: number, data: Partial<CellData>, commitHistory?: boolean) => void;
    registerCellDependency: (dependentCell: {row: number, col: number, sheetId: string}, sourceCell: {row: number, col: number, sheetId: string}) => void;
    unregisterCellDependency: (dependentCell: {row: number, col: number, sheetId: string}, sourceCell: {row: number, col: number, sheetId: string}) => void;
    recalculateDependencies: (row: number, col: number, sheetId: string) => void;
    getActiveUserIds: () => string[];
    getUserPresence: (userId: string) => { cursorPosition: { row: number, col: number } | null; editingCell: { row: number, col: number } | null; activeSheetId: string; };
    addCellComment: (sheetId: string, row: number, col: number, comment: CellComment) => void;
    getDataSourceConfig: (id: string) => CellDataSourceConfig | undefined;
    executeScript: (script: string, language: string, context: Record<string, any>) => Promise<any>;
    requestAICompletion: (prompt: CellAIPrompt[], options?: {model?: string}) => Promise<string>;
    triggerGlobalRecalculation: () => void;
    registerNamedRange: (name: string, range: string, sheetId: string) => void;
    resolveNamedRange: (name: string, sheetId: string) => string | undefined;
    getCurrentUserId: () => string;
    showNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
    openDialog: (dialogType: 'dataValidation' | 'conditionalFormatting' | 'cellHistory' | 'insertChart' | 'insertMedia' | 'cellAccessControl', cell: {row: number, col: number, sheetId: string}) => void;
    performUndo: () => void;
    performRedo: () => void;
    getCellDataRange: (startRow: number, startCol: number, endRow: number, endCol: number, sheetId: string) => any[][]; // For chart data, etc.
    onCellFocus?: (row: number, col: number, sheetId: string) => void; // Parent grid handles focus
}
export const GlobalSheetContext = React.createContext<GlobalSheetContextType | undefined>(undefined);

interface FormulaBarContextType {
    setFormula: (formula: string) => void;
    getFormula: () => string;
    focusFormulaBar: () => void;
    isActive: boolean; // Is the formula bar currently active for ANY cell?
    suggestCompletion: (input: string, cursor: number) => Promise<string[]>;
    insertFunction: (funcName: string, args: string[]) => void;
    registerInputRef: (ref: HTMLInputElement | HTMLTextAreaElement | null) => void;
}
export const FormulaBarContext = React.createContext<FormulaBarContextType | undefined>(undefined);

interface ThemeContextType {
    getCellTheme: (row: number, col: number, sheetId: string, cellType?: CellDataType) => CellFormat;
    getGlobalTheme: () => Record<string, any>;
    isDarkMode: boolean;
}
export const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

interface PluginManagerContextType {
    getCustomCellRenderer: (type: CellDataType) => React.FC<CellProps & { value: any; cellData: CellData; isEditing: boolean }> | undefined;
    getCustomCellEditor: (type: CellDataType) => React.FC<{ value: any; onChange: (val: any) => void; onBlur: () => void; autoFocus?: boolean; cellData: CellData }> | undefined;
    getCustomFormulaFunctions: () => Record<string, Function>;
    getAICustomModels: () => string[];
    getToolDefinitions: () => Record<string, any>; // For AI function calling
}
export const PluginManagerContext = React.createContext<PluginManagerContextType | undefined>(undefined);

// Core Cell Data Structure (what a cell "holds" beyond just value)
export interface CellData {
    value: any; // The raw data, e.g., '123', 'Hello', Date object, {lat, lon}
    displayValue: string; // The formatted string for display, e.g., "$123.00", "Jan 1, 2023"
    formula?: string; // If it's a formula cell (e.g., "=SUM(A1:B1)")
    dataType: CellDataType;
    format: CellFormat; // Explicit format for this cell
    conditionalFormats?: CellConditionalFormattingRule[]; // Rules applied to this cell (can be inherited)
    validationRules?: CellValidationRule[]; // Data validation rules for this cell
    comments?: CellComment[];
    history?: CellHistoryEntry[]; // Micro-history for this cell (full history might be global)
    metadata?: Record<string, any>; // e.g., units, semantic tags, source info, language for code cells
    links?: CellLink[]; // Embedded links or references
    attachments?: { id: string; type: 'file' | 'url'; url: string; fileName?: string; mimeType?: string; thumbnail?: string }[];
    sparklineConfig?: CellSparklineConfig;
    chartConfig?: CellChartConfig;
    dataSourceConfigId?: string; // ID referencing a global data source config (for live data)
    tasks?: CellTaskConfig[]; // Project management features
    aiPrompt?: CellAIPrompt[]; // If cell holds an AI chat history or prompt
    semanticTags?: CellSemanticTag[]; // e.g., [{id: "price", name: "Price"}]
    accessControl?: {
        readOnlyUsers?: string[]; // user IDs or roles
        editableByUsers?: string[];
        ownerId?: string; // User ID
        shareable?: boolean;
    };
    derivedFrom?: CellReference[]; // For lineage tracking (which cells contributed to this value)
    customProperties?: Record<string, any>; // For plugin-specific data that doesn't fit other types
    units?: string; // e.g., "USD", "kg", "m/s"
    error?: string; // Runtime error from formula or data source
    locked?: boolean; // Prevents manual editing (can be unlocked with permissions)
    mergedWith?: { startRow: number; startCol: number; endRow: number; endCol: number; sheetId: string }; // If cell is part of a merged range
}

// Cell Props - Expanded
interface CellProps {
    row: number;
    col: number;
    sheetId: string; // The ID of the sheet this cell belongs to
    initialData?: CellData; // Pre-populate cell data
    onCellChange?: (sheetId: string, row: number, col: number, data: Partial<CellData>) => void;
    onCellFocus?: (row: number, col: number, sheetId: string) => void;
    onCellBlur?: (row: number, col: number, sheetId: string) => void;
    isActiveCell?: boolean; // Is this the currently selected cell?
    isCollaborating?: boolean; // Is someone else editing this cell? (broader indicator)
    collaborationCursors?: { userId: string; color: string; offset: number; textSelection?: { start: number; end: number } }[]; // For rich text cursors or selection highlights
    readOnly?: boolean; // Cell-level read-only (from grid props)
    className?: string; // For additional styling from parent grid
    currentSheetName?: string; // For formula bar context and display
}


// --- Helper Components & Hooks for a Universe-Scale Cell ---

// Represents an error boundary for formula evaluation, etc.
export const CellErrorBoundary: React.FC<React.PropsWithChildren<{ message: string }>> = ({ children, message }) => {
    const [hasError, setHasError] = useState(false);
    useEffect(() => { setHasError(false); }, [children]); // Reset error on content change

    // NOTE: This isn't a true React Error Boundary without a class component.
    // For a functional component, this is a conceptual placeholder for UI handling.
    // In a real app, a proper ErrorBoundary class would wrap rendering logic.
    // For functional components, React 16+ has `getDerivedStateFromError` and `componentDidCatch`
    // which are only available in class components. This acts as a visual error message.
    const handleError = useCallback((error: Error, info?: React.ErrorInfo) => {
        console.error("Cell error:", error, info);
        setHasError(true);
    }, []);

    // A more robust error boundary would actually use a class component or a library.
    // This is a simplified visual indicator.
    if (hasError) {
        return <div className="cell-error bg-red-800 text-white p-1 text-xs overflow-hidden truncate" title={message}>Error: {message}</div>;
    }
    return <>{children}</>;
};
export { CellErrorBoundary }; // Export for consistency

// A conceptual rich text editor, replacing a simple input for 'richtext' type
export const CellRichTextEditor: React.FC<{ value: string; onChange: (newValue: string) => void; onBlur: () => void; autoFocus?: boolean }> = ({ value, onChange, onBlur, autoFocus }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (autoFocus && editorRef.current) {
            editorRef.current.focus();
            // Place cursor at the end
            const range = document.createRange();
            const sel = window.getSelection();
            if (sel && editorRef.current.lastChild) {
                range.setStartAfter(editorRef.current.lastChild);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    }, [autoFocus]);

    // This would integrate a full-fledged rich text editor library (e.g., Quill, Slate, Tiptap)
    return (
        <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={e => onChange(e.currentTarget.innerHTML)}
            onBlur={onBlur}
            dangerouslySetInnerHTML={{ __html: value }}
            className="w-full h-full bg-gray-600 outline-none p-1 overflow-auto resize-none"
            style={{ minHeight: '1.5em' }} // Allow text to expand vertically
            role="textbox"
            aria-multiline="true"
        />
    );
};
export { CellRichTextEditor };

// A conceptual dropdown editor for data validation lists
export const CellDropdownEditor: React.FC<{ value: string; options: string[]; onChange: (newValue: string) => void; onBlur: () => void; autoFocus?: boolean }> = ({ value, options, onChange, onBlur, autoFocus }) => {
    const selectRef = useRef<HTMLSelectElement>(null);
    useEffect(() => {
        if (autoFocus && selectRef.current) {
            selectRef.current.focus();
        }
    }, [autoFocus]);
    return (
        <select
            ref={selectRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            onBlur={onBlur}
            autoFocus={autoFocus}
            className="w-full h-full bg-gray-600 outline-none p-1 cursor-pointer text-white"
            aria-label="Cell dropdown editor"
        >
            <option value="" disabled>Select...</option>
            {options.map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
            ))}
        </select>
    );
};
export { CellDropdownEditor };


// A conceptual date/time editor
export const CellDateEditor: React.FC<{ value: string; onChange: (newValue: string) => void; onBlur: () => void; autoFocus?: boolean; dataType: CellDataType }> = ({ value, onChange, onBlur, autoFocus, dataType }) => {
    const inputType = useMemo(() => {
        if (dataType === 'date') return 'date';
        // For 'number' type that *might* represent time or datetime, e.g., 44927.5 for Excel serial
        // A more robust system would distinguish between time and datetime explicitly in dataType.
        // For now, assume if value looks like date+time string, it's datetime-local.
        if (dataType === 'text' && value.includes('T') && value.includes(':')) return 'datetime-local';
        if (dataType === 'text' && value.includes(':')) return 'time';
        return 'datetime-local'; // Default to datetime-local for 'number' or unknown date/time
    }, [dataType, value]);

    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    // Handle date formatting for display in the input, assumes value is ISO string or compatible
    const formattedValue = useMemo(() => {
        try {
            if (!value) return '';
            const date = new Date(value);
            if (isNaN(date.getTime())) return ''; // Not a valid date string

            switch (inputType) {
                case 'date': return date.toISOString().split('T')[0];
                case 'time': return date.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
                case 'datetime-local': return date.toISOString().substring(0, 16); // YYYY-MM-DDTHH:MM
                default: return value;
            }
        } catch {
            return ''; // Fallback in case of parsing error
        }
    }, [value, inputType]);

    return (
        <input
            ref={inputRef}
            type={inputType}
            value={formattedValue}
            onChange={e => onChange(e.target.value)}
            onBlur={onBlur}
            autoFocus={autoFocus}
            className="w-full h-full bg-gray-600 outline-none p-1 text-white"
            aria-label={`Cell ${inputType} editor`}
        />
    );
};
export { CellDateEditor };


// Renderer for embedded media (images, videos, audio)
export const CellMediaRenderer: React.FC<{ url: string; type: 'image' | 'video' | 'audio'; alt?: string; className?: string }> = ({ url, type, alt, className }) => {
    if (!url) return null;
    const commonClass = `max-w-full max-h-full object-contain ${className || ''}`;
    switch (type) {
        case 'image':
            return <img src={url} alt={alt || "Cell Image"} className={commonClass} loading="lazy" />;
        case 'video':
            return <video src={url} controls loop muted className={commonClass} />;
        case 'audio':
            return <audio src={url} controls className="w-full h-6" />;
        default:
            return <span className="text-red-400">Unsupported media type</span>;
    }
};
export { CellMediaRenderer };

// Renderer for in-cell charts (sparklines, mini-charts)
export const CellChartRenderer: React.FC<{ config: CellChartConfig | CellSparklineConfig; row: number; col: number; getCellDataRange: (startRow: number, startCol: number, endRow: number, endCol: number, sheetId: string) => any[][]; sheetId: string }> = ({ config, row, col, getCellDataRange, sheetId }) => {
    // This would involve a charting library like Chart.js, Recharts, D3
    // For this exercise, we'll render a simple text representation and mock data fetching.
    const chartData = useMemo(() => {
        if (!config.dataRange) return [];
        // In a real scenario, `dataRange` would be parsed (e.g., "A1:C5" or "R[1]C[2]")
        // and `getCellDataRange` would retrieve the actual values.
        // For this mock, we'll return some arbitrary data.
        const mockData = Array.from({ length: 5 }, (_, i) => Math.sin(i / 2) * 100 + 100);
        return mockData; // Example: [100, 147, 184, 198, 184]
    }, [config.dataRange, getCellDataRange, sheetId]);

    const chartTitle = 'title' in config ? config.title : config.type;

    return (
        <div className="flex flex-col items-center justify-center w-full h-full text-xs text-blue-300 bg-gray-700 rounded overflow-hidden p-1">
            <span className="font-semibold text-center">{chartTitle}</span>
            <span className="text-gray-400 text-xxs">[{config.type} from {config.dataRange}]</span>
            {/* This is where a real chart library would render */}
            <div className="w-full h-full flex-grow flex items-center justify-center text-green-400">
                {chartData.join(', ')} {/* Mock data display */}
            </div>
        </div>
    );
};
export { CellChartRenderer };

// A conceptual code editor for 'code' type cells
export const CellCodeEditor: React.FC<{ value: string; language: string; onChange: (newValue: string) => void; onBlur: () => void; autoFocus?: boolean; onExecute: (code: string, lang: string, context: Record<string, any>) => Promise<any>; row: number; col: number; sheetId: string }> = ({ value, language, onChange, onBlur, autoFocus, onExecute, row, col, sheetId }) => {
    const editorRef = useRef<HTMLTextAreaElement>(null);
    const globalSheetContext = useContext(GlobalSheetContext);

    useEffect(() => {
        if (autoFocus && editorRef.current) {
            editorRef.current.focus();
        }
    }, [autoFocus]);

    const handleExecute = useCallback(async () => {
        if (!globalSheetContext) return;
        try {
            const result = await onExecute(value, language, {
                sheetId, row, col,
                getCellValue: globalSheetContext.getCellValue,
                updateCell: globalSheetContext.updateCell,
                showNotification: globalSheetContext.showNotification
            });
            globalSheetContext.showNotification(`Script executed. Result: ${JSON.stringify(result)}`, 'success');
            // Optionally, update cell with result or log it
        } catch (err: any) {
            globalSheetContext.showNotification(`Script execution failed: ${err.message}`, 'error');
            console.error("Code execution error:", err);
        }
    }, [value, language, onExecute, globalSheetContext, sheetId, row, col]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.shiftKey) { // Shift+Enter to execute
            e.preventDefault();
            handleExecute();
        }
        // Allow normal newline behavior for Enter
    }, [handleExecute]);

    return (
        <textarea
            ref={editorRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            onBlur={onBlur}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
            spellCheck="false"
            className="w-full h-full bg-gray-800 text-green-300 font-mono text-xs outline-none p-1 resize-none"
            placeholder={`Enter ${language} code (Shift+Enter to execute)`}
            aria-label={`Code editor for ${language}`}
        />
    );
};
export { CellCodeEditor };


// Component for displaying and interacting with cell comments
export const CellCommentBubble: React.FC<{ comments: CellComment[]; onAddComment: (comment: CellComment) => void; onResolveComment: (commentId: string) => void; currentUserId: string; cellLocation: {row: number, col: number, sheetId: string} }> = ({ comments, onAddComment, onResolveComment, currentUserId, cellLocation }) => {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const commentPanelRef = useRef<HTMLDivElement>(null);

    const activeComments = comments.filter(c => !c.resolved);
    const hasComments = activeComments.length > 0;

    const handleAdd = useCallback(() => {
        if (newComment.trim()) {
            const newComm: CellComment = {
                id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                author: currentUserId,
                timestamp: new Date(),
                content: newComment,
                resolved: false,
            };
            onAddComment(newComm);
            setNewComment('');
        }
    }, [newComment, onAddComment, currentUserId]);

    const handleResolve = useCallback((commentId: string) => {
        onResolveComment(commentId);
    }, [onResolveComment]);

    // Close comments when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (commentPanelRef.current && !commentPanelRef.current.contains(event.target as Node)) {
                setShowComments(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!hasComments && !showComments) return null;

    return (
        <div className="absolute top-0 right-0 p-0.5 z-10" ref={commentPanelRef}>
            <button
                onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
                className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${hasComments ? 'bg-red-500 text-white' : 'bg-gray-400 text-gray-800'}`}
                title={`${hasComments ? activeComments.length : 'No'} comments`}
                aria-label={`${hasComments ? activeComments.length : 'No'} comments. Click to ${showComments ? 'hide' : 'show'}.`}
            >
                {hasComments ? activeComments.length : '💬'}
            </button>
            {showComments && (
                <div className="absolute right-0 mt-1 w-64 bg-gray-900 border border-gray-700 rounded shadow-lg p-2 text-white text-xs z-20"
                     role="dialog" aria-modal="false" aria-labelledby="comment-dialog-title">
                    <h4 id="comment-dialog-title" className="font-bold mb-1 border-b border-gray-700 pb-1">Comments for R{cellLocation.row+1}C{cellLocation.col+1}</h4>
                    <div className="max-h-40 overflow-y-auto mb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                        {comments.length === 0 ? (
                            <p className="text-gray-400">No comments yet.</p>
                        ) : (
                            comments.map(comment => (
                                <div key={comment.id} className={`mb-2 p-1 rounded ${comment.resolved ? 'bg-gray-700 text-gray-500 line-through' : 'bg-gray-800'}`}>
                                    <p className="font-semibold text-blue-300">{comment.author} <span className="text-gray-500 text-xs ml-1">{new Date(comment.timestamp).toLocaleString()}</span></p>
                                    <p>{comment.content}</p>
                                    {!comment.resolved && (
                                        <button
                                            onClick={() => handleResolve(comment.id)}
                                            className="text-green-400 hover:underline text-xxs mt-0.5"
                                            aria-label={`Resolve comment by ${comment.author}`}
                                        >
                                            Resolve
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    <textarea
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full p-1 bg-gray-700 border border-gray-600 rounded mb-1 text-white text-xs resize-y min-h-[40px]"
                        aria-label="New comment input"
                        onKeyDown={(e) => { if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); handleAdd(); }}}
                    />
                    <button onClick={handleAdd} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-0.5 rounded text-xs" aria-label="Add comment">Add Comment</button>
                </div>
            )}
        </div>
    );
};
export { CellCommentBubble };


// A conceptual AI prompt editor for 'ai_prompt' type cells
export const CellAIPromptEditor: React.FC<{ value: CellAIPrompt[]; onChange: (newValue: CellAIPrompt[]) => void; onBlur: () => void; autoFocus?: boolean; requestAICompletion: (prompts: CellAIPrompt[], options?: {model?: string}) => Promise<string>; currentUserId: string; sheetId: string; row: number; col: number; }> = ({ value, onChange, onBlur, autoFocus, requestAICompletion, currentUserId, sheetId, row, col }) => {
    const editorRef = useRef<HTMLTextAreaElement>(null);
    const [currentPrompt, setCurrentPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const globalSheetContext = useContext(GlobalSheetContext);
    const pluginManagerContext = useContext(PluginManagerContext);

    useEffect(() => {
        if (autoFocus && editorRef.current) {
            editorRef.current.focus();
        }
        // Initialize currentPrompt from the last user prompt in value
        const lastUserPrompt = value.filter(p => p.role === 'user').pop();
        if (lastUserPrompt) {
            setCurrentPrompt(lastUserPrompt.content);
        }
    }, [autoFocus, value]);

    const handleSendPrompt = useCallback(async () => {
        if (!currentPrompt.trim()) return;

        const updatedPrompts = [...value, { role: 'user', content: currentPrompt }];
        onChange(updatedPrompts); // Update cell with user prompt
        setIsLoading(true);
        setCurrentPrompt(''); // Clear input

        try {
            const toolDefinitions = pluginManagerContext?.getToolDefinitions() || {};
            // In a real scenario, `requestAICompletion` would handle tool invocation based on definitions.
            const response = await requestAICompletion(updatedPrompts, { model: 'gpt-4' }); // Example model
            onChange([...updatedPrompts, { role: 'assistant', content: response }]); // Update with AI response
        } catch (error) {
            console.error("AI completion error:", error);
            globalSheetContext?.showNotification(`AI request failed: ${error instanceof Error ? error.message : String(error)}`, 'error');
            onChange([...updatedPrompts, { role: 'assistant', content: `Error: ${error instanceof Error ? error.message : String(error)}` }]);
        } finally {
            setIsLoading(false);
        }
    }, [currentPrompt, value, onChange, requestAICompletion, globalSheetContext, pluginManagerContext]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { // Enter to send prompt, Shift+Enter for new line
            e.preventDefault();
            handleSendPrompt();
        }
    }, [handleSendPrompt]);

    return (
        <div className="w-full h-full flex flex-col bg-gray-800 text-white text-xs p-1">
            <div className="flex-grow overflow-y-auto mb-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
                 role="log" aria-live="polite" aria-atomic="false">
                {value.map((msg, idx) => (
                    <div key={idx} className={`mb-1 ${msg.role === 'user' ? 'text-blue-300' : 'text-green-300'}`}>
                        <strong>{msg.role}:</strong> {msg.content}
                    </div>
                ))}
                {isLoading && <div className="text-gray-400 animate-pulse">AI is thinking...</div>}
            </div>
            <textarea
                ref={editorRef}
                value={currentPrompt}
                onChange={e => setCurrentPrompt(e.target.value)}
                onBlur={onBlur} // Propagate blur, might need custom handling for chat UIs
                onKeyDown={handleKeyDown}
                autoFocus={autoFocus}
                placeholder="Chat with AI... (Enter to send, Shift+Enter for newline)"
                className="w-full flex-shrink-0 p-1 bg-gray-700 border border-gray-600 rounded text-white resize-y min-h-[40px] max-h-[100px]"
                aria-label="AI chat input"
                disabled={isLoading}
            />
        </div>
    );
};
export { CellAIPromptEditor };


// Custom hook for formula evaluation with caching and dependency tracking
export const useCellFormulaEvaluation = (
    sheetId: string,
    row: number,
    col: number,
    formula: string | undefined,
    globalSheetContext: GlobalSheetContextType | undefined,
    pluginManagerContext: PluginManagerContextType | undefined,
    currentSheetName: string | undefined
) => {
    const [evaluatedValue, setEvaluatedValue] = useState<any>(null);
    const [evaluationError, setEvaluationError] = useState<string | null>(null);
    const formulaRef = useRef(formula);
    formulaRef.current = formula; // Keep ref updated

    // A unique ID for the cell to use in dependency tracking
    const cellId = useMemo(() => `${sheetId}_R${row}_C${col}`, [sheetId, row, col]);

    const evaluateFormula = useCallback(async () => {
        if (!formula || !globalSheetContext) {
            setEvaluatedValue(undefined);
            setEvaluationError(null);
            return;
        }

        try {
            // In a real system, this would involve a sophisticated parser, AST, and function registry.
            // It would parse `formula`, resolve references (A1, B2, Sheet2!A1),
            // call functions (SUM, IF, VLOOKUP), and potentially interact with external services.
            // For extreme scale, this would be a WebAssembly module or a serverless function.

            // Dependencies must be tracked by the formula engine itself.
            // For this mock, we'll manually register some.
            // A real system would return a list of parsed dependencies.
            // globalSheetContext.unregisterCellDependency(row, col, -1, -1); // Placeholder to clear old, complex.

            const customFunctions = pluginManagerContext?.getCustomFormulaFunctions() || {};
            const context = {
                cell: (rOffset: number, cOffset: number, targetSheetId?: string) => globalSheetContext.getCellValue(row + rOffset, col + cOffset, targetSheetId || sheetId),
                ref: (cellRefString: string) => {
                    // Parses A1, B2, Sheet2!A1, etc.
                    const match = cellRefString.match(/(?:(?:'([^']+)'|([A-Za-z0-9_]+))!)?([A-Z]+)(\d+)/);
                    if (match) {
                        const targetSheet = match[1] || match[2] || sheetId;
                        const colStr = match[3];
                        const targetCol = colStr.split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 'A'.charCodeAt(0) + 1), 0) - 1;
                        const targetRow = parseInt(match[4], 10) - 1;
                        globalSheetContext.registerCellDependency({row, col, sheetId}, {row: targetRow, col: targetCol, sheetId: targetSheet});
                        return globalSheetContext.getCellValue(targetRow, targetCol, targetSheet);
                    }
                    // Handle named ranges
                    const namedRange = globalSheetContext.resolveNamedRange(cellRefString, sheetId);
                    if (namedRange) {
                        // Recursively call ref with the resolved range
                        // A proper formula engine would handle range references vs single cell
                        return context.ref(namedRange.split(':')[0]); // Just take first cell for simplicity
                    }
                    return undefined;
                },
                named: (name: string) => {
                    const resolvedRange = globalSheetContext.resolveNamedRange(name, sheetId);
                    if (resolvedRange) {
                        // Logic to return value(s) from a named range.
                        // For a single cell named range, return its value. For a range, return an array/matrix.
                        // Simplified: just return the value of the top-left cell of the resolved range.
                        const [startCellRef] = resolvedRange.split(':');
                        return context.ref(startCellRef);
                    }
                    return null;
                },
                API_CALL: async (dataSourceId: string, query?: string, headers?: Record<string, string>) => {
                    globalSheetContext.showNotification(`Fetching data from ${dataSourceId}...`, 'info');
                    const dsConfig = globalSheetContext.getDataSourceConfig(dataSourceId);
                    if (!dsConfig) throw new Error(`Data source ${dataSourceId} not found.`);
                    // Simulate API call based on dsConfig and query
                    await new Promise(res => setTimeout(res, 800)); // Simulate network delay
                    if (dataSourceId === 'stocks_api' && query === 'GOOG') return { price: Math.floor(Math.random() * 1000) + 1000, timestamp: new Date() };
                    return { data: `API_RESULT_${dataSourceId}_${Math.random().toFixed(2)}`, queryExecuted: query };
                },
                JS_SCRIPT: async (script: string, ...scriptArgs: any[]) => {
                    return globalSheetContext.executeScript(script, 'javascript', { ...scriptArgs, sheetId, row, col, currentSheetName, getCellValue: globalSheetContext.getCellValue, updateCell: globalSheetContext.updateCell });
                },
                AI_GENERATE_TEXT: async (promptText: string, options?: Record<string, any>) => {
                    globalSheetContext.showNotification(`AI generating text...`, 'info');
                    const aiPrompt: CellAIPrompt = { role: 'user', content: promptText, ...options };
                    return globalSheetContext.requestAICompletion([aiPrompt]);
                },
                SUM: (...args: any[]) => args.reduce((acc, val) => acc + (typeof val === 'number' ? val : 0), 0),
                AVERAGE: (...args: any[]) => {
                    const numbers = args.filter(val => typeof val === 'number');
                    return numbers.length ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
                },
                IF: (condition: boolean, trueValue: any, falseValue: any) => condition ? trueValue : falseValue,
                ...customFunctions // Add user-defined functions from plugins
            };

            const formulaToEval = formula.startsWith('=') ? formula.substring(1) : formula;
            let result: any;

            // Simplified expression evaluation. A robust parser would build an AST.
            // Using a Function constructor for dynamic evaluation (caution: security implications in real apps with untrusted input).
            // For a production app, use a safe sandboxed expression evaluator.
            const evaluateExpression = (expr: string, localContext: Record<string, any>) => {
                // Wrap expression in a `with` statement for easy access to context variables
                // And explicitly bind common functions to localContext
                const boundContext = {
                    ...localContext,
                    SUM: context.SUM,
                    AVERAGE: context.AVERAGE,
                    IF: context.IF,
                    AI_GENERATE_TEXT: context.AI_GENERATE_TEXT,
                    API_CALL: context.API_CALL,
                    JS_SCRIPT: context.JS_SCRIPT,
                    cell: context.cell,
                    ref: context.ref,
                    named: context.named,
                    // Bind other built-in/custom functions
                };
                const fn = new Function('context', `with(context) { return (${expr}); }`);
                return fn(boundContext);
            };

            // Detect and handle function calls or simple expressions
            if (formulaToEval.match(/^[A-Z_]+\(/)) { // Looks like a function call
                // This is a very basic regex. A full parser would extract function name and arguments
                const funcNameMatch = formulaToEval.match(/^([A-Z_]+)\((.*)\)$/);
                if (funcNameMatch) {
                    const funcName = funcNameMatch[1];
                    const argsString = funcNameMatch[2];
                    // This is naive parsing. Real formula engines handle nested functions, commas in strings, etc.
                    const args = argsString.split(/,(?![^()]*\))(?![^{}]*})/).map(s => s.trim()); // Split by comma not in parens
                    const evaluatedArgs = await Promise.all(args.map(async arg => {
                        // Recursively evaluate each argument if it's an expression or reference
                        try {
                             // Attempt to evaluate argument as a sub-expression or reference
                             // This is where real complexity is: is "A1" a string or a cell reference?
                             // We'll treat numeric literals as numbers, string literals as strings, and others as expressions.
                            if (arg.match(/^-?\d+(\.\d+)?$/)) return parseFloat(arg); // Number literal
                            if (arg.match(/^["'].*["']$/)) return arg.substring(1, arg.length - 1); // String literal
                            // Try to evaluate as expression
                            return await Promise.resolve(evaluateExpression(arg, context));
                        } catch {
                            return arg; // If it can't be evaluated, treat as literal string or unresolved ref.
                        }
                    }));

                    const func = (context as any)[funcName] || customFunctions[funcName];
                    if (typeof func === 'function') {
                        result = await Promise.resolve(func(...evaluatedArgs));
                    } else {
                        throw new Error(`Unknown function: ${funcName}`);
                    }
                } else {
                    result = await Promise.resolve(evaluateExpression(formulaToEval, context));
                }
            } else {
                result = await Promise.resolve(evaluateExpression(formulaToEval, context));
            }

            setEvaluatedValue(result);
            setEvaluationError(null);

            // Register new dependencies (this would also come from the parser)
            // Example: if formula was =A1+B1, then (row,col) depends on A1 and B1.
            // For now, these are mock.
            // globalSheetContext.registerCellDependency({row, col, sheetId}, {row, col: col - 1, sheetId});
            // globalSheetContext.registerCellDependency({row, col, sheetId}, {row: row - 1, col, sheetId});

        } catch (err: any) {
            console.error(`Formula evaluation error for ${sheetId}:${row},${col}:`, err);
            setEvaluatedValue(null);
            setEvaluationError(`ERROR: ${err.message || 'Invalid formula'}`);
            globalSheetContext?.showNotification(`Formula Error R${row+1}C${col+1}: ${err.message}`, 'error');
        }
    }, [sheetId, row, col, formula, globalSheetContext, pluginManagerContext, currentSheetName, cellId]);

    useEffect(() => {
        const timer = setTimeout(() => { // Debounce evaluation for complex formulas
            evaluateFormula();
        }, 100); // Small debounce
        return () => clearTimeout(timer);
    }, [evaluateFormula, formula]); // Re-evaluate if formula string changes

    // Re-evaluate if dependencies change (triggered by globalSheetContext.recalculateDependencies)
    // This part requires a more advanced observer pattern or reactive system in the global context.
    // For now, `triggerGlobalRecalculation` will indirectly cause re-evaluation for all cells.

    return { evaluatedValue, evaluationError, recalculate: evaluateFormula };
};
export { useCellFormulaEvaluation };

// Custom hook for cell validation
export const useCellValidation = (
    value: any,
    dataType: CellDataType,
    validationRules: CellValidationRule[] | undefined,
    globalSheetContext: GlobalSheetContextType | undefined,
    cellLocation: {row: number, col: number, sheetId: string}
) => {
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const {row, col, sheetId} = cellLocation;

    useEffect(() => {
        if (!validationRules || validationRules.length === 0) {
            setValidationErrors([]);
            return;
        }

        const errors: string[] = [];
        const currentValue = typeof value === 'string' ? value.trim() : value; // Trim strings for validation

        validationRules.forEach(async rule => { // Rules can be async (e.g., API lookup)
            let isValid = true;
            let ruleErrorMessage = rule.errorMessage;

            try {
                switch (rule.type) {
                    case 'range':
                        const { min, max } = rule.value as { min?: number | string; max?: number | string };
                        if (dataType === 'number' && typeof currentValue === 'number') {
                            if ((min !== undefined && currentValue < (min as number)) || (max !== undefined && currentValue > (max as number))) {
                                isValid = false;
                            }
                        } else if (dataType === 'date' && (currentValue instanceof Date || typeof currentValue === 'string')) {
                            const dateValue = new Date(currentValue);
                            if (isNaN(dateValue.getTime())) { isValid = false; break; } // Invalid date format
                            if ((min && dateValue < new Date(min as string)) || (max && dateValue > new Date(max as string))) {
                                isValid = false;
                            }
                        }
                        break;
                    case 'list':
                        const list = rule.value as string[];
                        if (!list.includes(String(currentValue))) { // Convert to string for comparison
                            isValid = false;
                            ruleErrorMessage = rule.errorMessage || `Value must be one of: ${list.join(', ')}`;
                        }
                        break;
                    case 'regex':
                        const regex = new RegExp(rule.value as string);
                        if (!regex.test(String(currentValue))) {
                            isValid = false;
                        }
                        break;
                    case 'custom_formula':
                        // This would need a simplified formula evaluator returning a boolean
                        // For demonstration, mock it.
                        // Example: rule.value = "LEN(A1)>5"
                        if (globalSheetContext) {
                            // This would ideally use a formula engine, for now a basic eval.
                            // Assume rule.value is a JS expression that can be evaluated in context
                            const formulaResult = await globalSheetContext.executeScript(`return (${rule.value});`, 'javascript', { cellValue: currentValue, row, col, sheetId, getCellValue: globalSheetContext.getCellValue });
                            if (!formulaResult) isValid = false;
                        } else {
                            isValid = true; // Cannot validate without context
                        }
                        break;
                    case 'api_lookup':
                        if (globalSheetContext && rule.value && typeof rule.value === 'string') {
                            const apiResponse = await globalSheetContext.executeScript(`return API_CALL("${rule.value}", "${currentValue}");`, 'javascript', { currentValue });
                            if (!apiResponse || apiResponse.status === 'invalid') isValid = false;
                        }
                        break;
                    case 'unique':
                        if (globalSheetContext && rule.value && typeof rule.value === 'string') {
                            const targetRange = globalSheetContext.resolveNamedRange(rule.value, sheetId) || rule.value;
                            if (targetRange) {
                                // Assuming targetRange is something like "A1:A10"
                                const [startCellRef, endCellRef] = targetRange.split(':');
                                // Need to parse range into startRow/Col, endRow/Col
                                // This is highly simplified and would require full range parsing and data fetching
                                // For now, assume a mock check.
                                const mockDataInColumn = ['apple', 'banana', 'orange', 'apple']; // Example data
                                const count = mockDataInColumn.filter(val => val === currentValue).length;
                                if (count > 1) isValid = false; // Mock unique check
                            }
                        }
                        break;
                    default:
                        isValid = true;
                }
            } catch (e: any) {
                console.error(`Validation rule error for cell R${row+1}C${col+1} rule ${rule.id}:`, e);
                isValid = false; // Treat error in rule evaluation as validation failure
                ruleErrorMessage = `Validation internal error: ${e.message}`;
            }

            if (!isValid) {
                errors.push(ruleErrorMessage);
            }
        });
        setValidationErrors(errors);
    }, [value, dataType, validationRules, globalSheetContext, row, col, sheetId]);

    return { validationErrors, isValid: validationErrors.length === 0 };
};
export { useCellValidation };


// Custom hook for dynamic cell styling, including conditional formatting
export const useCellStyles = (
    row: number,
    col: number,
    sheetId: string,
    baseFormat: CellFormat,
    conditionalFormats: CellConditionalFormattingRule[] | undefined,
    currentValue: any,
    globalSheetContext: GlobalSheetContextType | undefined,
    themeContext: ThemeContextType | undefined,
    formula: string | undefined
) => {
    const defaultTheme = themeContext?.getCellTheme(row, col, sheetId) || {};
    const effectiveFormat = useMemo(() => {
        let mergedFormat: CellFormat = { ...defaultTheme, ...baseFormat };

        if (conditionalFormats && globalSheetContext) {
            const sortedRules = [...conditionalFormats].sort((a, b) => a.priority - b.priority);

            for (const rule of sortedRules) {
                let conditionMet = false;
                try {
                    // This would involve a full formula evaluator for conditions, potentially recursive.
                    // For now, simple value checks or a basic script execution
                    // The rule.condition can be a formula string (e.g., "=A1>100")
                    const conditionResult = globalSheetContext.executeScript(`return (${rule.condition});`, 'javascript', { cellValue: currentValue, row, col, sheetId, getCellValue: globalSheetContext.getCellValue, formula });
                    conditionMet = !!conditionResult; // Treat truthy results as condition met

                    // More specific simple rules can be parsed directly:
                    if (rule.condition.startsWith('>') && typeof currentValue === 'number') {
                        conditionMet = currentValue > parseFloat(rule.condition.substring(1));
                    } else if (rule.condition.startsWith('<') && typeof currentValue === 'number') {
                        conditionMet = currentValue < parseFloat(rule.condition.substring(1));
                    } else if (rule.condition === 'is empty' && (currentValue === null || currentValue === undefined || currentValue === '' || (typeof currentValue === 'string' && currentValue.trim() === ''))) {
                        conditionMet = true;
                    } else if (rule.condition === 'is not empty' && !(currentValue === null || currentValue === undefined || currentValue === '' || (typeof currentValue === 'string' && currentValue.trim() === ''))) {
                        conditionMet = true;
                    } else if (rule.condition.toLowerCase() === '=true' && currentValue === true) {
                        conditionMet = true;
                    } else if (rule.condition.toLowerCase() === '=false' && currentValue === false) {
                        conditionMet = true;
                    } else if (rule.condition.startsWith('=')) { // Direct comparison like "=Foo"
                        const targetValue = rule.condition.substring(1);
                        conditionMet = String(currentValue) === targetValue;
                    }
                    // This would need a full expression parser to properly handle formulas like "=AND(A1>0, B1<10)"

                } catch (e) {
                    console.warn(`Error evaluating conditional format for cell (${row},${col}) rule ${rule.id}:`, e);
                    conditionMet = false;
                }

                if (conditionMet) {
                    mergedFormat = { ...mergedFormat, ...rule.format };
                    if (rule.stopIfTrue) break;
                }
            }
        }
        return mergedFormat;
    }, [row, col, sheetId, baseFormat, conditionalFormats, currentValue, formula, defaultTheme, globalSheetContext]);

    // Convert CellFormat to CSS-in-JS style object
    const styleObject = useMemo(() => {
        const style: React.CSSProperties = {
            fontFamily: effectiveFormat.fontFamily,
            fontSize: effectiveFormat.fontSize ? `${effectiveFormat.fontSize}px` : undefined,
            fontWeight: effectiveFormat.fontWeight,
            fontStyle: effectiveFormat.fontStyle,
            textDecoration: effectiveFormat.textDecoration,
            color: effectiveFormat.color,
            backgroundColor: effectiveFormat.backgroundColor,
            textAlign: effectiveFormat.textAlign,
            verticalAlign: effectiveFormat.verticalAlign,
            wordWrap: effectiveFormat.wordWrap,
            padding: effectiveFormat.padding,
            textIndent: effectiveFormat.textIndent,
            direction: effectiveFormat.direction,
            // Border conversion (simplified)
            borderTop: effectiveFormat.border?.top || effectiveFormat.border?.all,
            borderRight: effectiveFormat.border?.right || effectiveFormat.border?.all,
            borderBottom: effectiveFormat.border?.bottom || effectiveFormat.border?.all,
            borderLeft: effectiveFormat.border?.left || effectiveFormat.border?.all,
            overflow: effectiveFormat.overflow,
            transform: effectiveFormat.rotation ? `rotate(${effectiveFormat.rotation}deg)` : undefined,
            // Note: text-orientation and writing-mode are complex CSS properties and
            // might need specific handling or be applied via class names.
        };
        // Remove undefined values
        Object.keys(style).forEach(key => style[key as keyof React.CSSProperties] === undefined && delete style[key as keyof React.CSSProperties]);
        return style;
    }, [effectiveFormat]);

    return { styleObject, effectiveFormat };
};
export { useCellStyles };

// Custom hook for advanced keyboard interactions and context menu
export const useCellInteractions = (
    row: number, col: number, sheetId: string,
    isEditing: boolean, setIsEditing: (e: boolean) => void,
    onCellFocus: (row: number, col: number, sheetId: string) => void,
    onCellBlur: (row: number, col: number, sheetId: string) => void,
    readOnly: boolean,
    cellData: CellData,
    globalSheetContext: GlobalSheetContextType | undefined,
    formulaBarContext: FormulaBarContextType | undefined,
    currentSheetName: string | undefined
) => {
    const cellRef = useRef<HTMLDivElement>(null);
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const handleCellClick = useCallback((e: React.MouseEvent) => {
        if (!isEditing && !readOnly) {
            setIsEditing(true);
            onCellFocus(row, col, sheetId);
            formulaBarContext?.registerInputRef(e.target as HTMLInputElement); // Register input to formula bar
        }
        setShowContextMenu(false); // Close context menu on normal click
    }, [isEditing, setIsEditing, onCellFocus, row, col, sheetId, readOnly, formulaBarContext]);

    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        if (!readOnly) {
            setIsEditing(true); // Ensure editing on double click
            onCellFocus(row, col, sheetId);
            formulaBarContext?.registerInputRef(e.target as HTMLInputElement);
            e.stopPropagation();
        }
    }, [setIsEditing, onCellFocus, row, col, sheetId, readOnly, formulaBarContext]);

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenuPosition({ x: e.clientX, y: e.clientY });
        setShowContextMenu(true);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        // If an editor is active, let it handle the keydowns.
        // This hook specifically handles grid navigation and actions when the CELL is focused but NOT in edit mode.
        if (isEditing) return;

        const navigate = (deltaRow: number, deltaCol: number) => {
            onCellFocus(row + deltaRow, col + deltaCol, sheetId);
            // setIsEditing(false); // Stop editing previous cell if it was
        };

        switch (e.key) {
            case 'ArrowUp': e.preventDefault(); navigate(-1, 0); break;
            case 'ArrowDown': e.preventDefault(); navigate(1, 0); break;
            case 'ArrowLeft': e.preventDefault(); navigate(0, -1); break;
            case 'ArrowRight': e.preventDefault(); navigate(0, 1); break;
            case 'Enter': e.preventDefault(); if (!readOnly) { setIsEditing(true); onCellFocus(row, col, sheetId); } break;
            case 'F2': e.preventDefault(); if (!readOnly) { setIsEditing(true); onCellFocus(row, col, sheetId); } break; // Edit mode
            case 'Escape': e.preventDefault(); onCellBlur(row, col, sheetId); break; // De-focus or cancel selection
            case 'Delete':
            case 'Backspace':
                e.preventDefault();
                if (!readOnly) {
                    globalSheetContext?.updateCell(sheetId, row, col, { value: '', formula: undefined, dataType: 'text' }, true);
                    globalSheetContext?.showNotification(`Cell R${row+1}C${col+1} cleared.`, 'info');
                }
                break;
            // Ctrl+Z/Y/C/V/X for global undo/redo/clipboard operations would typically be
            // handled at the Sheet/Grid component level, not individual cells.
            case 'z': if (e.ctrlKey) { e.preventDefault(); globalSheetContext?.performUndo(); } break;
            case 'y': if (e.ctrlKey) { e.preventDefault(); globalSheetContext?.performRedo(); } break;
            case 'c': if (e.ctrlKey) { e.preventDefault(); /* globalSheetContext?.copySelection(); */ } break;
            case 'v': if (e.ctrlKey) { e.preventDefault(); /* globalSheetContext?.pasteSelection(); */ } break;
            case 'x': if (e.ctrlKey) { e.preventDefault(); /* globalSheetContext?.cutSelection(); */ } break;
            case ' ': if (e.ctrlKey) { e.preventDefault(); /* Toggle checkbox/dropdown */ } break; // Example of a custom hotkey
        }
    }, [isEditing, row, col, sheetId, readOnly, onCellFocus, onCellBlur, setIsEditing, globalSheetContext]);


    useEffect(() => {
        const cellElement = cellRef.current;
        if (cellElement) {
            cellElement.addEventListener('contextmenu', handleContextMenu as any);
        }
        return () => {
            if (cellElement) {
                cellElement.removeEventListener('contextmenu', handleContextMenu as any);
            }
        };
    }, [handleContextMenu]);

    const handleContextMenuAction = useCallback((action: string) => {
        console.log(`Cell (${row},${col}) Context Menu Action: ${action}`);
        setShowContextMenu(false);
        // Dispatch actions to global sheet context or trigger local state changes
        switch (action) {
            case 'copy': /* globalSheetContext?.copyCell(row, col, sheetId); */ break;
            case 'cut': /* globalSheetContext?.cutCell(row, col, sheetId); */ break;
            case 'paste': /* globalSheetContext?.pasteToCell(row, col, sheetId); */ break;
            case 'insert_row_above': globalSheetContext?.showNotification(`Insert row above R${row+1}`, 'info'); /* globalSheetContext?.insertRow(row, sheetId); */ break;
            case 'delete_row': globalSheetContext?.showNotification(`Delete row R${row+1}`, 'info'); /* globalSheetContext?.deleteRow(row, sheetId); */ break;
            case 'add_comment': globalSheetContext?.openDialog('cellHistory', {row, col, sheetId}); break; // Redirect to history/comments dialog
            case 'clear_format': globalSheetContext?.updateCell(sheetId, row, col, { format: {} }, true); break;
            case 'data_validation': globalSheetContext?.openDialog('dataValidation', {row, col, sheetId}); break;
            case 'conditional_formatting': globalSheetContext?.openDialog('conditionalFormatting', {row, col, sheetId}); break;
            case 'view_history': globalSheetContext?.openDialog('cellHistory', {row, col, sheetId}); break;
            case 'insert_chart': globalSheetContext?.openDialog('insertChart', {row, col, sheetId}); break;
            case 'insert_media': globalSheetContext?.openDialog('insertMedia', {row, col, sheetId}); break;
            case 'cell_access_control': globalSheetContext?.openDialog('cellAccessControl', {row, col, sheetId}); break;
            case 'extract_data_ai':
                globalSheetContext?.showNotification(`AI extracting data from R${row+1}C${col+1}...`, 'info');
                globalSheetContext?.requestAICompletion([{ role: 'user', content: `Extract key information (JSON format) from content: ${cellData.value || cellData.displayValue}. Include semantic tags.` }]).then(res => {
                    globalSheetContext?.showNotification('AI extraction complete.', 'success');
                    console.log('AI Extraction:', res);
                }).catch(err => globalSheetContext.showNotification(`AI Extraction Failed: ${err.message}`, 'error'));
                break;
            case 'analyze_data_ai':
                globalSheetContext?.showNotification(`AI analyzing data from R${row+1}C${col+1}...`, 'info');
                globalSheetContext?.requestAICompletion([{ role: 'user', content: `Analyze the data in cell R${row+1}C${col+1} of sheet ${currentSheetName} and its surroundings. Current value: ${cellData.value}. Provide insights.` }]).then(res => {
                    globalSheetContext?.showNotification('AI analysis complete.', 'success');
                    console.log('AI Analysis:', res);
                }).catch(err => globalSheetContext.showNotification(`AI Analysis Failed: ${err.message}`, 'error'));
                break;
            case 'generate_summary_ai':
                globalSheetContext?.showNotification(`AI generating summary...`, 'info');
                globalSheetContext?.requestAICompletion([{ role: 'user', content: `Summarize the content of cell R${row+1}C${col+1} (${cellData.value}) concisely.` }]).then(res => {
                    globalSheetContext?.showNotification('AI summary complete.', 'success');
                    console.log('AI Summary:', res);
                }).catch(err => globalSheetContext.showNotification(`AI Summary Failed: ${err.message}`, 'error'));
                break;
            case 'translate_ai':
                globalSheetContext?.showNotification(`AI translating...`, 'info');
                globalSheetContext?.requestAICompletion([{ role: 'user', content: `Translate "${cellData.value}" to French.` }]).then(res => {
                    globalSheetContext?.showNotification('AI translation complete.', 'success');
                    globalSheetContext?.updateCell(sheetId, row, col, { value: res, dataType: 'text' }, true);
                }).catch(err => globalSheetContext.showNotification(`AI Translation Failed: ${err.message}`, 'error'));
                break;
            // ... many more actions
        }
    }, [row, col, sheetId, cellData, globalSheetContext, currentSheetName]);

    // Context menu component (defined within the hook to capture state/callbacks)
    const ContextMenu: React.FC<{ x: number; y: number; onClose: () => void; onAction: (action: string) => void }> = ({ x, y, onClose, onAction }) => {
        const menuRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                    onClose();
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, [onClose]);

        const menuItems = [
            { label: 'Copy', action: 'copy', hotkey: 'Ctrl+C' },
            { label: 'Cut', action: 'cut', hotkey: 'Ctrl+X' },
            { label: 'Paste', action: 'paste', hotkey: 'Ctrl+V' },
            { type: 'divider' },
            { label: 'Insert Row Above', action: 'insert_row_above' },
            { label: 'Delete Row', action: 'delete_row' },
            { type: 'divider' },
            { label: 'Add Comment', action: 'add_comment' },
            { label: 'Clear Formatting', action: 'clear_format' },
            { label: 'Data Validation...', action: 'data_validation' },
            { label: 'Conditional Formatting...', action: 'conditional_formatting' },
            { label: 'Cell Access Control...', action: 'cell_access_control' },
            { type: 'divider' },
            { label: 'View History', action: 'view_history' },
            {
                label: 'AI Actions',
                submenu: [
                    { label: 'Extract Key Data', action: 'extract_data_ai' },
                    { label: 'Analyze Cell Content', action: 'analyze_data_ai' },
                    { label: 'Generate Summary', action: 'generate_summary_ai' },
                    { label: 'Translate (to French)', action: 'translate_ai' },
                    { label: 'Correct Grammar', action: 'correct_grammar_ai' },
                    { label: 'Suggest Formulas', action: 'suggest_formulas_ai' },
                ]
            },
            {
                label: 'Insert',
                submenu: [
                    { label: 'Chart...', action: 'insert_chart' },
                    { label: 'Image...', action: 'insert_media' },
                    { label: 'Video...', action: 'insert_media_video' },
                    { label: 'Link...', action: 'insert_link' },
                    { label: 'Task...', action: 'insert_task' },
                    { label: 'Named Range...', action: 'insert_named_range' },
                ]
            }
            // ... and more options for charts, media, etc.
        ];

        const renderMenuItem = (item: any, depth: number = 0) => {
            if (item.type === 'divider') {
                return <div key={`divider-${depth}-${item.label || Math.random()}`} className="border-t border-gray-700 my-1" />;
            }
            if (item.submenu) {
                return (
                    <div key={item.label} className="relative group">
                        <div className="py-1 px-2 hover:bg-blue-600 flex justify-between items-center cursor-pointer">
                            {item.label} <span className="text-gray-400">►</span>
                        </div>
                        <div className="absolute left-full top-0 ml-1 hidden group-hover:block bg-gray-900 border border-gray-700 rounded shadow-lg w-48 text-white text-xs z-30">
                            {item.submenu.map(subItem => renderMenuItem(subItem, depth + 1))}
                        </div>
                    </div>
                );
            }
            return (
                <div
                    key={item.label}
                    className="py-1 px-2 hover:bg-blue-600 cursor-pointer flex justify-between items-center"
                    onClick={() => onAction(item.action)}
                >
                    <span>{item.label}</span>
                    {item.hotkey && <span className="text-gray-500 text-xxs ml-2">{item.hotkey}</span>}
                </div>
            );
        };

        return (
            <div
                ref={menuRef}
                className="fixed bg-gray-900 border border-gray-700 rounded shadow-lg z-50 text-white text-xs w-48 py-1"
                style={{ top: y, left: x }}
                role="menu"
                aria-orientation="vertical"
            >
                {menuItems.map(item => renderMenuItem(item))}
            </div>
        );
    };


    return {
        cellRef,
        handleCellClick,
        handleDoubleClick,
        handleKeyDown,
        showContextMenu,
        contextMenuPosition,
        handleContextMenuAction,
        ContextMenu,
        closeContextMenu: () => setShowContextMenu(false),
    };
};
export { useCellInteractions };


// Custom hook for real-time collaboration indicators
export const useCellCollaboration = (
    row: number, col: number,
    sheetId: string,
    isActiveCell: boolean | undefined,
    globalSheetContext: GlobalSheetContextType | undefined
) => {
    const [collaborationInfo, setCollaborationInfo] = useState<{ editing: boolean; users: { id: string; color: string; presence: ReturnType<GlobalSheetContextType['getUserPresence']> }[] }>({ editing: false, users: [] });

    useEffect(() => {
        if (!globalSheetContext) return;

        const updateCollaboration = () => {
            const allUserIds = globalSheetContext.getActiveUserIds();
            const editingUsers: { id: string; color: string; presence: ReturnType<GlobalSheetContextType['getUserPresence']> }[] = [];
            let isEditingByOthers = false;

            allUserIds.forEach(userId => {
                const presence = globalSheetContext.getUserPresence(userId);
                if (presence.activeSheetId === sheetId && presence.editingCell?.row === row && presence.editingCell?.col === col) {
                    if (userId !== globalSheetContext.getCurrentUserId()) { // Exclude self if present
                        isEditingByOthers = true;
                    }
                    // Assign a consistent, unique color for the user based on their ID
                    const hash = Array.from(userId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    const userColor = `hsl(${hash % 360}, 70%, 50%)`;
                    editingUsers.push({ id: userId, color: userColor, presence });
                }
            });
            setCollaborationInfo({
                editing: isEditingByOthers,
                users: editingUsers,
            });
        };

        // In a real app, this would subscribe to a websocket or collaborative editing service
        // and update when other users interact with this specific cell.
        // For demonstration, we'll mock periodic updates or rely on global context triggers.
        const interval = setInterval(updateCollaboration, 1000); // Poll for collaboration status
        updateCollaboration(); // Initial check

        return () => clearInterval(interval);
    }, [row, col, sheetId, globalSheetContext, isActiveCell]);

    return collaborationInfo;
};
export { useCellCollaboration };


// The main Cell Component - significantly expanded
const Cell: React.FC<CellProps> = ({
    row,
    col,
    sheetId,
    initialData,
    onCellChange,
    onCellFocus,
    onCellBlur,
    isActiveCell = false,
    isCollaborating: parentIsCollaborating = false, // From parent grid, indicates if *any* collaboration is happening
    collaborationCursors, // Specific cursors for this cell
    readOnly: propReadOnly = false,
    className,
    currentSheetName,
}) => {
    // --- Contexts ---
    const globalSheetContext = useContext(GlobalSheetContext);
    const formulaBarContext = useContext(FormulaBarContext);
    const themeContext = useContext(ThemeContext);
    const pluginManagerContext = useContext(PluginManagerContext);

    // --- State Management ---
    const [cellData, setCellData] = useState<CellData>(initialData || {
        value: '',
        displayValue: '',
        dataType: 'text',
        format: {},
        comments: [],
        history: [],
    });
    const [isEditing, setIsEditing] = useState(false);
    const [localEditValue, setLocalEditValue] = useState<string>(''); // Value currently in editor
    const [currentFormula, setCurrentFormula] = useState<string | undefined>(cellData.formula);
    const [lastRecalculatedValue, setLastRecalculatedValue] = useState<any>(cellData.value); // Value after formula/data source evaluation

    const effectiveReadOnly = propReadOnly || cellData.locked || (cellData.accessControl?.readOnlyUsers?.includes(globalSheetContext?.getCurrentUserId() || '')) || (cellData.accessControl?.ownerId && cellData.accessControl.ownerId !== globalSheetContext?.getCurrentUserId());

    // --- Hooks for enhanced functionality ---
    const { evaluatedValue, evaluationError, recalculate: recalculateFormula } = useCellFormulaEvaluation(
        sheetId, row, col, currentFormula, globalSheetContext, pluginManagerContext, currentSheetName
    );
    const { validationErrors, isValid } = useCellValidation(
        currentFormula ? evaluatedValue : cellData.value, cellData.dataType, cellData.validationRules, globalSheetContext, {row, col, sheetId}
    );
    const { styleObject, effectiveFormat } = useCellStyles(
        row, col, sheetId, cellData.format, cellData.conditionalFormats, cellData.value, globalSheetContext, themeContext, currentFormula
    );
    const {
        cellRef,
        handleCellClick,
        handleDoubleClick,
        handleKeyDown,
        showContextMenu,
        contextMenuPosition,
        handleContextMenuAction,
        ContextMenu,
        closeContextMenu,
    } = useCellInteractions(
        row, col, sheetId, isEditing, setIsEditing,
        onCellFocus || ((r, c, s) => {}), onCellBlur || ((r, c, s) => {}),
        effectiveReadOnly, cellData, globalSheetContext, formulaBarContext, currentSheetName
    );
    const collaborationInfo = useCellCollaboration(
        row, col, sheetId, isActiveCell, globalSheetContext
    );

    // --- Effects and Callbacks ---

    // Sync `cellData` with `initialData` changes when props update
    useEffect(() => {
        if (initialData) {
            // Only update if the initialData object itself has changed (shallow compare)
            // or if a key deep within it that we care about has changed.
            // A more robust check might involve deep equality or a specific 'version' prop.
            if (JSON.stringify(initialData) !== JSON.stringify(cellData)) {
                setCellData(initialData);
                setLastRecalculatedValue(initialData.value);
                setCurrentFormula(initialData.formula);
                setLocalEditValue(initialData.formula || initialData.value?.toString() || ''); // Re-sync editor value
            }
        }
    }, [initialData, cellData]); // Include cellData for comparison

    // Update global formula bar when editing starts or formula/value changes
    useEffect(() => {
        if (isEditing && formulaBarContext) {
            formulaBarContext.setFormula(currentFormula || cellData.value?.toString() || '');
            formulaBarContext.registerInputRef(cellRef.current?.querySelector('input, textarea') as HTMLInputElement || null); // Register internal editor ref
        } else if (formulaBarContext && formulaBarContext.isActive) {
            // If formula bar is active but THIS cell is not editing, update formula bar to show THIS cell's value/formula
            // This happens when selecting a cell without entering edit mode.
            formulaBarContext.setFormula(currentFormula || cellData.value?.toString() || '');
        }
    }, [isEditing, currentFormula, cellData.value, formulaBarContext, cellRef]);


    const handleEditorChange = useCallback((newValue: string) => {
        setLocalEditValue(newValue);
        if (newValue.startsWith('=')) {
            setCurrentFormula(newValue);
            setCellData(prev => ({ ...prev, formula: newValue, dataType: 'formula', error: undefined }));
        } else {
            setCurrentFormula(undefined);
            setCellData(prev => ({ ...prev, formula: undefined, dataType: prev.dataType === 'formula' ? 'text' : prev.dataType, error: undefined }));
        }
        formulaBarContext?.setFormula(newValue); // Keep formula bar synced
    }, [formulaBarContext]);

    // This is called when an edit is finalized (blur, enter, etc.)
    const commitChanges = useCallback((newValue: any, newDataType?: CellDataType, commitAsFormula?: boolean) => {
        const finalFormula = commitAsFormula ? currentFormula : undefined;
        let finalValue = newValue;
        let finalDisplayValue = newValue?.toString() || '';
        let finalDataType: CellDataType = newDataType || cellData.dataType;
        let finalError = evaluationError;

        if (finalFormula) {
            finalValue = evaluatedValue; // Use evaluated result if it's a formula
            finalDisplayValue = evaluationError || (evaluatedValue?.toString() ?? '');
            finalDataType = 'formula';
            finalError = evaluationError;
        } else {
            // Attempt to infer data type if not explicitly set
            if (!newDataType) {
                if (typeof newValue === 'number' || (!isNaN(parseFloat(newValue)) && isFinite(parseFloat(newValue)) && String(newValue) === String(parseFloat(newValue)))) {
                    finalDataType = 'number';
                } else if (newValue === 'TRUE' || newValue === 'FALSE' || typeof newValue === 'boolean') {
                    finalDataType = 'boolean';
                } else if (newValue instanceof Date || (!isNaN(new Date(newValue).getTime()) && /^\d{4}-\d{2}-\d{2}/.test(newValue))) { // Basic ISO date check
                    finalDataType = 'date';
                } else {
                    finalDataType = 'text';
                }
            }
            finalError = undefined; // Clear error if not a formula
        }

        const updatedCellData: Partial<CellData> = {
            value: finalValue,
            displayValue: finalDisplayValue,
            formula: finalFormula,
            dataType: finalDataType,
            error: finalError,
            // Keep existing format, comments etc. by merging, not overwriting
        };

        setCellData(prev => ({ ...prev, ...updatedCellData }));
        onCellChange?.(sheetId, row, col, updatedCellData);
        globalSheetContext?.updateCell(sheetId, row, col, updatedCellData, true); // Commit to global state with history
        globalSheetContext?.recalculateDependencies(row, col, sheetId); // Trigger dependents to recalculate

    }, [currentFormula, evaluatedValue, evaluationError, onCellChange, row, col, sheetId, globalSheetContext, cellData.dataType]);


    const handleEditorBlur = useCallback(() => {
        setIsEditing(false);
        closeContextMenu();
        onCellBlur?.(row, col, sheetId);
        formulaBarContext?.registerInputRef(null); // Unregister formula bar input

        // Commit the edited value or formula from localEditValue
        commitChanges(localEditValue, undefined, localEditValue.startsWith('='));

        // Clear local edit value after commit (optional, depends on UX)
        // setLocalEditValue('');
    }, [setIsEditing, onCellBlur, row, col, sheetId, localEditValue, commitChanges, closeContextMenu, formulaBarContext]);


    // Effect to update local edit value when editing starts or cellData changes externally
    useEffect(() => {
        if (isEditing) {
            const editorInitialValue = currentFormula || cellData.value?.toString() || '';
            setLocalEditValue(editorInitialValue);
            formulaBarContext?.setFormula(editorInitialValue);
        }
    }, [isEditing, currentFormula, cellData.value, formulaBarContext]);

    // When formula evaluation results change, update display and commit
    useEffect(() => {
        if (currentFormula !== undefined) { // Only for formula cells
            if (evaluatedValue !== lastRecalculatedValue || evaluationError !== cellData.error) {
                setLastRecalculatedValue(evaluatedValue);
                // The `commitChanges` function already handles if it's a formula, so no need to pass `commitAsFormula: true` explicitly here, as `currentFormula` is set.
                commitChanges(evaluatedValue, 'formula');
            }
        }
    }, [evaluatedValue, evaluationError, currentFormula, lastRecalculatedValue, commitChanges, cellData.error]);


    const displayValue = useMemo(() => {
        // If actively editing, show the raw input being typed
        if (isEditing) {
            return localEditValue;
        }
        // If there's an evaluation error, show it
        if (evaluationError) {
            return evaluationError;
        }
        // If it's a formula, show its evaluated value
        if (currentFormula) {
            return evaluatedValue?.toString() ?? '';
        }
        // Otherwise, show the pre-formatted displayValue or raw value
        return cellData.displayValue || cellData.value?.toString() || '';
    }, [isEditing, currentFormula, cellData.displayValue, cellData.value, evaluatedValue, evaluationError, localEditValue]);


    const renderEditor = useCallback(() => {
        if (effectiveReadOnly) {
            return (
                <div className="w-full h-full p-1 bg-gray-700 text-gray-300 flex items-center justify-center text-xs">
                    <span className="italic">Read Only</span>
                </div>
            );
        }

        // Custom plugin editor
        const CustomEditor = pluginManagerContext?.getCustomCellEditor(cellData.dataType);
        if (CustomEditor) {
            return (
                <CustomEditor
                    value={localEditValue}
                    onChange={handleEditorChange}
                    onBlur={handleEditorBlur}
                    autoFocus
                    cellData={cellData}
                />
            );
        }

        if (cellData.dataType === 'text' && cellData.validationRules?.some(rule => rule.type === 'list') && !currentFormula) {
            const listRule = cellData.validationRules.find(rule => rule.type === 'list');
            if (listRule) {
                return (
                    <CellDropdownEditor
                        value={localEditValue}
                        options={listRule.value as string[]}
                        onChange={handleEditorChange}
                        onBlur={handleEditorBlur}
                        autoFocus
                    />
                );
            }
        }

        if (cellData.dataType === 'date' || (cellData.dataType === 'number' && typeof cellData.value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(cellData.value))) { // Basic check for date-like string
            return (
                <CellDateEditor
                    value={localEditValue}
                    onChange={handleEditorChange}
                    onBlur={handleEditorBlur}
                    autoFocus
                    dataType={cellData.dataType}
                />
            );
        }

        if (cellData.dataType === 'richtext') {
            return (
                <CellRichTextEditor
                    value={localEditValue}
                    onChange={handleEditorChange}
                    onBlur={handleEditorBlur}
                    autoFocus
                />
            );
        }

        if (cellData.dataType === 'code' && globalSheetContext) {
            return (
                <CellCodeEditor
                    value={localEditValue}
                    language={cellData.metadata?.language || 'javascript'} // Assume metadata holds language
                    onChange={handleEditorChange}
                    onBlur={handleEditorBlur}
                    autoFocus
                    onExecute={globalSheetContext.executeScript}
                    row={row} col={col} sheetId={sheetId}
                />
            );
        }

        if (cellData.dataType === 'ai_prompt' && globalSheetContext) {
            return (
                <CellAIPromptEditor
                    value={cellData.aiPrompt || []}
                    onChange={(prompts) => {
                        setCellData(prev => ({ ...prev, aiPrompt: prompts }));
                        onCellChange?.(sheetId, row, col, { aiPrompt: prompts });
                    }}
                    onBlur={handleEditorBlur}
                    autoFocus
                    requestAICompletion={globalSheetContext.requestAICompletion}
                    currentUserId={globalSheetContext.getCurrentUserId()}
                    sheetId={sheetId} row={row} col={col}
                />
            );
        }
        if (cellData.dataType === 'task') {
            // A more complex task editor would be a dedicated component
            return (
                <input
                    type="text"
                    value={localEditValue}
                    onChange={e => handleEditorChange(e.target.value)}
                    onBlur={handleEditorBlur}
                    autoFocus
                    className="w-full h-full bg-gray-600 outline-none p-1 text-white placeholder-gray-400"
                    placeholder="Task name..."
                />
            );
        }

        // Default text input for 'text', 'number', 'currency', 'percentage', 'formula' (raw input)
        return (
            <input
                type="text"
                value={localEditValue}
                onChange={e => handleEditorChange(e.target.value)}
                onBlur={handleEditorBlur}
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleEditorBlur(); // Commit on Enter
                        if (globalSheetContext?.onCellFocus) { // Move down on Enter
                            globalSheetContext.onCellFocus(row + 1, col, sheetId);
                        }
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        setIsEditing(false); // Cancel edit
                        setLocalEditValue(currentFormula || cellData.value?.toString() || ''); // Revert to original
                        onCellBlur?.(row, col, sheetId);
                    } else if (e.key === 'Tab') { // Tab for horizontal navigation
                         e.preventDefault();
                         handleEditorBlur();
                         if (globalSheetContext?.onCellFocus) {
                             globalSheetContext.onCellFocus(row, col + (e.shiftKey ? -1 : 1), sheetId);
                         }
                    }
                    handleKeyDown(e); // Allow parent handling for navigation
                }}
                className="w-full h-full bg-gray-600 outline-none p-1 text-white placeholder-gray-400"
                style={styleObject} // Apply basic styles to input
                placeholder={currentFormula ? "Formula..." : "Value..."}
                aria-label="Cell editor"
            />
        );
    }, [effectiveReadOnly, cellData, localEditValue, currentFormula, handleEditorChange, handleEditorBlur, globalSheetContext, sheetId, row, col, onCellBlur, handleKeyDown, styleObject, pluginManagerContext]);


    const renderDisplayContent = useCallback(() => {
        // Custom plugin renderer
        const CustomRenderer = pluginManagerContext?.getCustomCellRenderer(cellData.dataType);
        if (CustomRenderer) {
            return <CustomRenderer row={row} col={col} sheetId={sheetId} value={cellData.value} cellData={cellData} isEditing={isEditing} />;
        }

        // Specific data type renderers
        if (cellData.dataType === 'image' && cellData.attachments?.[0]?.url) {
            return <CellMediaRenderer url={cellData.attachments[0].url} type="image" alt={cellData.metadata?.altText || cellData.value?.toString()} />;
        }
        if (cellData.dataType === 'video' && cellData.attachments?.[0]?.url) {
            return <CellMediaRenderer url={cellData.attachments[0].url} type="video" />;
        }
        if (cellData.dataType === 'audio' && cellData.attachments?.[0]?.url) {
            return <CellMediaRenderer url={cellData.attachments[0].url} type="audio" />;
        }
        if (cellData.dataType === 'chart' && cellData.chartConfig && globalSheetContext) {
            return <CellChartRenderer config={cellData.chartConfig} row={row} col={col} sheetId={sheetId} getCellDataRange={globalSheetContext.getCellDataRange} />;
        }
        if (cellData.dataType === 'code') {
            return (
                <div className="w-full h-full overflow-hidden text-xs font-mono text-green-300 whitespace-pre-wrap p-1 group-hover:overflow-visible">
                    <span className="text-gray-400">Code ({cellData.metadata?.language || 'js'}): </span>
                    {cellData.value?.toString().substring(0, 50)}{cellData.value?.toString().length > 50 ? '...' : ''}
                    {cellData.error && <span className="text-red-500 block">! {cellData.error}</span>}
                </div>
            );
        }
        if (cellData.dataType === 'ai_prompt' && cellData.aiPrompt) {
            const lastAssistantResponse = cellData.aiPrompt.filter(p => p.role === 'assistant').pop();
            const lastUserPrompt = cellData.aiPrompt.filter(p => p.role === 'user').pop();
            return (
                <div className="w-full h-full overflow-hidden text-xs text-blue-300 whitespace-pre-wrap p-1 group-hover:overflow-visible">
                    <span className="text-gray-400">AI Chat: </span>
                    {lastAssistantResponse?.content ? lastAssistantResponse.content.substring(0, 50) + '...' : (lastUserPrompt?.content || "Initiate AI chat...")}
                    {cellData.error && <span className="text-red-500 block">! {cellData.error}</span>}
                </div>
            );
        }
        if (cellData.dataType === 'richtext') {
            return <div className="w-full h-full overflow-hidden whitespace-pre-wrap p-1" dangerouslySetInnerHTML={{ __html: displayValue }} />;
        }
        if (cellData.dataType === 'task' && cellData.tasks && cellData.tasks.length > 0) {
            const primaryTask = cellData.tasks[0];
            return (
                <div className="w-full h-full overflow-hidden text-xs text-yellow-300 whitespace-nowrap p-1">
                    <span className="text-gray-400">Task: </span>
                    <span className={`font-semibold ${primaryTask.status === 'completed' ? 'line-through text-green-400' : ''}`}>
                        {primaryTask.name}
                    </span>
                    {primaryTask.dueDate && <span className="ml-1 text-gray-500"> (Due: {primaryTask.dueDate.toLocaleDateString()})</span>}
                </div>
            );
        }
        if (cellData.dataType === 'geolocation' && cellData.value) {
            const geo: CellGeoLocation = cellData.value;
            return (
                <div className="w-full h-full overflow-hidden text-xs text-purple-300 whitespace-nowrap p-1">
                    📍 {geo.address || `Lat: ${geo.latitude.toFixed(2)}, Lon: ${geo.longitude.toFixed(2)}`}
                    {geo.mapUrl && <a href={geo.mapUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-400 hover:underline">Map</a>}
                </div>
            );
        }
        if (cellData.links && cellData.links.length > 0) {
            const primaryLink = cellData.links[0];
            return (
                <a href={primaryLink.url} target={primaryLink.openInNewTab ? "_blank" : "_self"} rel="noopener noreferrer"
                   className="w-full h-full overflow-hidden text-xs text-blue-400 hover:underline flex items-center p-1">
                    🔗 {primaryLink.text || primaryLink.url}
                </a>
            );
        }

        // Default display for other types (number, boolean, text, etc.)
        return (
            <span className="w-full h-full overflow-hidden whitespace-pre-wrap p-1">
                {displayValue}
            </span>
        );

    }, [cellData, displayValue, row, col, sheetId, globalSheetContext, isEditing, evaluationError, pluginManagerContext]);

    const cellClassNames = useMemo(() => {
        let classes = `relative flex items-center ${effectiveFormat.verticalAlign === 'top' ? 'items-start' : (effectiveFormat.verticalAlign === 'bottom' ? 'items-end' : 'items-center')}
                       ${effectiveFormat.textAlign === 'left' ? 'justify-start' : (effectiveFormat.textAlign === 'right' ? 'justify-end' : 'justify-center')}
                       w-24 h-6 p-1 truncate overflow-hidden cursor-default transition-colors duration-100 group`; // Added 'group' for hover effects

        if (isActiveCell) {
            classes += ' ring-2 ring-blue-500 z-10'; // Highlight active cell
        }
        if (isEditing) {
            classes += ' bg-gray-600 z-20'; // Editing state
        } else {
            classes += ' bg-gray-800 hover:bg-gray-700'; // Default non-editing state
        }
        if (currentFormula && !isEditing) {
            classes += ' italic text-blue-300'; // Formula indicator
        }
        if (!isValid) {
            classes += ' border-l-4 border-red-500'; // Validation error indicator
        }
        if (collaborationInfo.editing) {
            classes += ' border-r-4 border-purple-500'; // Collaboration indicator by others
        }
        if (cellData.comments && cellData.comments.length > 0) {
            classes += ' has-comments'; // Custom class for styling comment icon
        }
        if (effectiveReadOnly) {
            classes += ' cursor-not-allowed bg-gray-700 text-gray-400';
        }
        if (cellData.error) {
            classes += ' border-b-2 border-orange-500'; // Runtime error indicator
        }
        if (className) {
            classes += ` ${className}`;
        }
        return classes;
    }, [isActiveCell, isEditing, currentFormula, isValid, collaborationInfo.editing, cellData.comments, effectiveReadOnly, className, effectiveFormat, cellData.error]);

    const cellLocation = useMemo(() => ({ row, col, sheetId }), [row, col, sheetId]);

    return (
        <CellErrorBoundary message={evaluationError || cellData.error || "Rendering failed"}>
            <div
                ref={cellRef}
                onClick={handleCellClick}
                onDoubleClick={handleDoubleClick}
                onKeyDown={isActiveCell ? handleKeyDown : undefined} // Only active cell gets global keydowns for navigation
                tabIndex={isActiveCell ? 0 : -1} // Make active cell tabbable
                className={cellClassNames}
                style={styleObject}
                role="gridcell"
                aria-rowindex={row + 1}
                aria-colindex={col + 1}
                aria-label={`Cell R${row + 1}C${col + 1}`}
                aria-readonly={effectiveReadOnly}
                aria-invalid={!isValid || !!evaluationError || !!cellData.error}
                title={!isValid ? `Validation Error: ${validationErrors.join(', ')}` : (evaluationError || cellData.error || displayValue)}
            >
                {isEditing ? (
                    renderEditor()
                ) : (
                    <>
                        {renderDisplayContent()}
                        {/* Error Indicator (Validation or Formula) */}
                        {(!isValid || !!evaluationError || !!cellData.error) && !isEditing && (
                            <div className="absolute bottom-0 right-0 w-2 h-2 bg-red-500 rounded-full z-10"
                                 title={validationErrors.join('\n') || evaluationError || cellData.error}></div>
                        )}
                        {/* Collaboration Cursors & Selections */}
                        {collaborationCursors && collaborationCursors.map(cursor => (
                            <div
                                key={cursor.userId}
                                className="absolute top-0 left-0 w-0.5 h-full z-20 animate-pulse"
                                style={{ backgroundColor: cursor.color, left: `${cursor.offset * 0.5}em` }} // Mock cursor position
                                title={`${cursor.userId} is here`}
                            >
                                {cursor.textSelection && (
                                    <div className="absolute h-full opacity-30" style={{ left: `${cursor.textSelection.start * 0.5}em`, width: `${(cursor.textSelection.end - cursor.textSelection.start) * 0.5}em`, backgroundColor: cursor.color }} />
                                )}
                            </div>
                        ))}
                        {/* Collaboration Border/Indicator */}
                        {collaborationInfo.editing && (
                            <div className="absolute inset-0 border-2 border-dashed border-purple-500 animate-pulse" title={`Editing by: ${collaborationInfo.users.map(u => u.id).join(', ')}`} />
                        )}
                         {/* Semantic Tags Indicator (e.g., small icon or colored dot) */}
                         {cellData.semanticTags && cellData.semanticTags.length > 0 && (
                            <div className="absolute bottom-0 left-0 w-2 h-2 bg-blue-500 rounded-full z-10"
                                 title={`Semantic Tags: ${cellData.semanticTags.map(tag => tag.name).join(', ')}`}></div>
                        )}
                    </>
                )}

                {/* Comment Bubble */}
                {globalSheetContext && (cellData.comments?.length > 0 || isEditing) && (
                    <CellCommentBubble
                        comments={cellData.comments || []}
                        onAddComment={(comment) => {
                            const updatedComments = [...(cellData.comments || []), comment];
                            setCellData(prev => ({ ...prev, comments: updatedComments }));
                            globalSheetContext.addCellComment(sheetId, row, col, comment);
                            onCellChange?.(sheetId, row, col, { comments: updatedComments });
                        }}
                        onResolveComment={(commentId) => {
                            const updatedComments = (cellData.comments || []).map(c => c.id === commentId ? { ...c, resolved: true } : c);
                            setCellData(prev => ({ ...prev, comments: updatedComments }));
                            onCellChange?.(sheetId, row, col, { comments: updatedComments });
                            // globalSheetContext?.resolveCellComment(sheetId, row, col, commentId); // Not implemented in context
                        }}
                        currentUserId={globalSheetContext.getCurrentUserId()}
                        cellLocation={cellLocation}
                    />
                )}

                {/* Context Menu */}
                {showContextMenu && (
                    <ContextMenu
                        x={contextMenuPosition.x}
                        y={contextMenuPosition.y}
                        onClose={closeContextMenu}
                        onAction={handleContextMenuAction}
                    />
                )}
            </div>
        </CellErrorBoundary>
    );
};

export default Cell;