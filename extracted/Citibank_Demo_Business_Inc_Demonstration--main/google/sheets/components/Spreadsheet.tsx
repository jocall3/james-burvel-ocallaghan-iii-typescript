// google/sheets/components/Spreadsheet.tsx
// The Grid of Calculation. The sovereign's ledger, rendered as a universe of cells.

import React, { useState, useEffect, useRef, useCallback, useContext, createContext } from 'react';
import Cell from './Cell'; // Assuming Cell is greatly enhanced to handle rich data and interactions

// --- Constants, Enums, and Types for the Spreadsheet Universe ---

// Core Grid Dimensions - Now dynamic and part of sheet state
export const DEFAULT_COLS = 26; // A-Z
export const DEFAULT_ROWS = 100;

// Cell Types
export enum CellContentType {
    VALUE = 'value',
    FORMULA = 'formula',
    ERROR = 'error',
    IMAGE = 'image',
    CHART = 'chart',
    SPARKLINES = 'sparklines',
    CUSTOM_WIDGET = 'custom_widget',
}

// Data Types within a cell
export enum CellDataType {
    NUMBER = 'number',
    TEXT = 'text',
    BOOLEAN = 'boolean',
    DATE = 'date',
    DATETIME = 'datetime',
    CURRENCY = 'currency',
    PERCENTAGE = 'percentage',
    ARRAY = 'array',
    OBJECT = 'object', // For richer embedded data
    GEOSPATIAL = 'geospatial',
    MEDIA_REFERENCE = 'media_reference',
    CUSTOM = 'custom',
}

// Cell Formatting
export interface CellStyle {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold' | 'lighter' | 'bolder' | number;
    fontStyle?: 'normal' | 'italic';
    textDecoration?: 'none' | 'underline' | 'line-through';
    color?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    wrapText?: boolean;
    numberFormat?: string; // e.g., "0.00", "$#,##0.00", "YYYY-MM-DD"
    borderColor?: string;
    borderStyle?: string;
    borderWidth?: string;
    padding?: string;
    textRotation?: number; // degrees
    indent?: number; // pixels
    conditionalFormattingRules?: ConditionalFormattingRule[];
    // Future expansion: text direction (RTL/LTR), custom background patterns/images
}

// Conditional Formatting
export enum ConditionalFormatType {
    HIGHLIGHT_CELLS = 'highlight_cells',
    DATA_BARS = 'data_bars',
    COLOR_SCALES = 'color_scales',
    ICON_SETS = 'icon_sets',
    CUSTOM_FORMULA = 'custom_formula',
}

export interface ConditionalFormattingRule {
    id: string;
    type: ConditionalFormatType;
    range: CellRange;
    criteria: any; // e.g., { condition: 'greaterThan', value: 100 }, { condition: 'textContains', value: 'error' }
    format: CellStyle; // Styles to apply if criteria met
    stopIfTrue?: boolean;
    priority?: number; // For overlapping rules
}

// Data Validation Rules
export enum ValidationRuleType {
    NUMBER_RANGE = 'number_range',
    DATE_RANGE = 'date_range',
    LIST_OF_ITEMS = 'list_of_items',
    TEXT_CONTAINS = 'text_contains',
    CUSTOM_FORMULA = 'custom_formula',
    REGEX = 'regex',
    UNIQUE = 'unique',
    IS_EMAIL = 'is_email',
    IS_URL = 'is_url',
}

export interface DataValidationRule {
    type: ValidationRuleType;
    criteria: any; // e.g., { min: 0, max: 100 }, { items: ['Red', 'Green'] }
    errorMessage?: string;
    showDropdown?: boolean; // For list of items
    allowInvalid?: boolean; // Warn vs. Reject
    helpText?: string;
}

// Cell Comments
export interface CellComment {
    id: string;
    author: string;
    timestamp: Date;
    content: string;
    resolved?: boolean;
    replies?: CellComment[];
}

// Hyperlinks
export interface CellHyperlink {
    url: string;
    text?: string;
    target?: '_blank' | '_self';
}

// Cell Data Model
export interface SpreadsheetCell {
    id: string; // Unique ID for the cell (e.g., A1, B2)
    value: any; // The calculated or raw value
    formula?: string; // Original formula string if applicable (e.g., "=SUM(A1:A5)")
    rawInput?: string; // What the user typed, before parsing (could be value or formula)
    type: CellContentType;
    dataType: CellDataType;
    style?: CellStyle;
    validation?: DataValidationRule;
    comments?: CellComment[];
    dependencies?: string[]; // Cell IDs this cell depends on for recalculation
    dependents?: string[]; // Cell IDs that depend on this cell
    error?: { type: string; message: string; }; // e.g., #DIV/0!, #REF!, #NAME?
    history?: ChangeLogEntry[]; // Mini-history for this cell
    mergedWith?: { start: CellCoordinates; end: CellCoordinates; }; // If this cell is part of a merged range
    hyperlink?: CellHyperlink;
    sparkline?: { type: 'line' | 'bar' | 'winloss'; dataRange: CellRange; options?: any; };
    embeddedObject?: { type: 'chart' | 'image' | 'drawing' | 'widget'; objectId: string; };
    security?: { locked: boolean; hiddenFormula: boolean; }; // Cell-level protection
}

// Coordinate System
export interface CellCoordinates {
    row: number;
    col: number;
}

// Range Selection
export interface CellRange {
    start: CellCoordinates;
    end: CellCoordinates;
    sheetId: string;
}

// Named Ranges
export interface NamedRange {
    name: string;
    range: CellRange;
    description?: string;
    scope?: 'workbook' | 'sheet'; // Workbook-level or sheet-level
}

// Filtering and Sorting
export enum FilterConditionType {
    VALUE = 'value',
    TEXT_CONTAINS = 'text_contains',
    NUMBER_GREATER_THAN = 'number_greater_than',
    DATE_AFTER = 'date_after',
    COLOR_FILTER = 'color_filter',
    CUSTOM_FORMULA = 'custom_formula',
}

export interface FilterCriteria {
    col: number;
    condition: FilterConditionType;
    value: any;
    enabled: boolean;
    showOnly?: any[]; // For explicit value lists
}

export interface SortOrder {
    col: number;
    direction: 'asc' | 'desc';
    priority: number; // For multi-column sort
}

// Charting
export enum ChartType {
    BAR = 'bar',
    LINE = 'line',
    PIE = 'pie',
    SCATTER = 'scatter',
    AREA = 'area',
    RADAR = 'radar',
    BUBBLE = 'bubble',
    CANDLESTICK = 'candlestick',
    GAUGE = 'gauge',
    TREEMAP = 'treemap',
    SUNBURST = 'sunburst',
}

export interface ChartDefinition {
    id: string;
    name: string;
    type: ChartType;
    range: CellRange; // Data source
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    series?: Array<{ name: string; dataCol: number; }>;
    options?: any; // Chart library specific options (e.g., colors, legends)
    position: { row: number; col: number; width: number; height: number; }; // Position and size on the sheet (in cells)
    sourceSheetId: string; // The sheet where the data range lives
}

// Drawings and Shapes
export enum DrawingType {
    SHAPE = 'shape',
    IMAGE = 'image',
    TEXT_BOX = 'text_box',
    CONNECTOR = 'connector',
}

export interface DrawingObject {
    id: string;
    type: DrawingType;
    position: { start: CellCoordinates; end: CellCoordinates; offsetX: number; offsetY: number; width: number; height: number; }; // Anchor to cells, plus pixel offsets
    properties: any; // e.g., shape type, image URL, text content, fill color, stroke
}

// Row/Column Metadata
export interface RowMetadata {
    height?: number; // In pixels
    hidden?: boolean;
    groupLevel?: number; // For outlining/grouping rows
}

export interface ColMetadata {
    width?: number; // In pixels
    hidden?: boolean;
    groupLevel?: number; // For outlining/grouping columns
}


// Sheet Protection
export interface SheetProtection {
    lockedRanges: CellRange[];
    exceptRanges?: CellRange[]; // Ranges within lockedRanges that are editable
    editors?: string[]; // User IDs allowed to edit protected ranges
    warnOnly?: boolean; // Show warning instead of preventing edit
    description?: string;
}

// Sheet Data Model
export interface Sheet {
    id: string;
    name: string;
    data: { [key: string]: SpreadsheetCell }; // Map of 'A1' -> SpreadsheetCell
    dimensions: { rows: number; cols: number };
    mergedCells: CellRange[]; // List of merged cell ranges
    rowMetadata: { [rowIndex: number]: RowMetadata }; // Map of row index to metadata
    colMetadata: { [colIndex: number]: ColMetadata }; // Map of col index to metadata
    filters: FilterCriteria[];
    sortOrders: SortOrder[];
    charts: ChartDefinition[];
    drawings: DrawingObject[];
    protection?: SheetProtection;
    freezePanes?: { row: number; col: number; };
    printSettings?: any; // e.g., print area, headers/footers, page breaks
    gridlineVisibility?: boolean;
    displayFormulas?: boolean; // Show formulas instead of values
    // Future expansion: sheet events (onOpen, onChange), custom properties
}

// Workbook Data Model
export interface Workbook {
    id: string;
    name: string;
    sheets: Sheet[];
    activeSheetId: string;
    namedRanges: NamedRange[];
    scriptProject?: ScriptProject; // For macros/Apps Script-like functionality
    customFunctions?: ScriptFunction[]; // Workbook-level custom functions
    collaborators: UserPresence[];
    workbookSettings: WorkbookSettings;
    dataSources?: DataSource[]; // External data connections
    pivotTableDefinitions?: PivotTableDefinition[];
    auditLog?: ChangeLogEntry[]; // Comprehensive workbook-level change log
    themes?: { id: string; name: string; colors: any; fonts: any; }[]; // Custom themes
}

export interface WorkbookSettings {
    locale?: string;
    timezone?: string;
    calculationMode?: 'auto' | 'manual' | 'on_change';
    securityPolicy?: { scriptExecution: 'allow' | 'warn' | 'deny'; externalAccess: 'allow' | 'warn' | 'deny'; };
    dataLossPreventionEnabled?: boolean;
    defaultStyles?: CellStyle;
    offlineModeEnabled?: boolean;
    lastAccessedBy?: string;
    lastModified?: Date;
    // Future expansion: auto-save interval, data encryption settings
}

// Collaboration and Versioning
export enum ChangeType {
    CELL_EDIT = 'cell_edit',
    RANGE_FORMAT = 'range_format',
    SHEET_ADD = 'sheet_add',
    SHEET_DELETE = 'sheet_delete',
    ROW_INSERT = 'row_insert',
    ROW_DELETE = 'row_delete',
    COLUMN_INSERT = 'column_insert',
    COLUMN_DELETE = 'column_delete',
    CHART_ADD = 'chart_add',
    DRAWING_ADD = 'drawing_add',
    SCRIPT_MODIFY = 'script_modify',
    PERMISSIONS_CHANGE = 'permissions_change',
    MERGE_CELLS = 'merge_cells',
    UNMERGE_CELLS = 'unmerge_cells',
    // ... many more granular change types
}

export interface ChangeLogEntry {
    id: string;
    type: ChangeType;
    userId: string;
    userName: string;
    timestamp: Date;
    details: any; // e.g., { cellId: 'A1', oldValue: '10', newValue: '20' }
    sheetId: string;
    workbookVersion?: string; // Snapshot ID
}

export interface UserPresence {
    userId: string;
    userName: string;
    color: string; // For cursor/selection highlighting
    activeSheetId: string;
    selection: CellRange | null;
    activeCell: CellCoordinates | null;
    status?: 'editing' | 'viewing' | 'offline' | 'presenting';
    lastActivity: Date;
}

// Scripting/Macros
export enum ScriptLanguage {
    JAVASCRIPT = 'javascript',
    PYTHON = 'python',
    TYPESCRIPT = 'typescript',
    WEB_ASSEMBLY = 'wasm',
}

export interface ScriptFunction {
    name: string;
    code: string;
    description?: string;
    parameters?: { name: string; type: string; }[];
    triggers?: { type: 'onOpen' | 'onEdit' | 'timeDriven' | 'onFormSubmit'; config: any; }[];
    permissions?: string[]; // e.g., 'access_external_apis'
}

export interface ScriptProject {
    id: string;
    name: string;
    language: ScriptLanguage;
    scripts: ScriptFunction[];
    libraries?: { name: string; version: string; }[]; // external libraries/modules
    permissions?: any; // e.g., access to external services, file system
    executionLogs?: { timestamp: Date; level: 'info' | 'warn' | 'error'; message: string; }[];
}

// AI Integration
export enum AITask {
    ANALYZE_DATA = 'analyze_data',
    GENERATE_FORMULA = 'generate_formula',
    CLEAN_DATA = 'clean_data',
    SUMMARIZE_RANGE = 'summarize_range',
    TRANSLATE_TEXT = 'translate_text',
    PREDICT_TRENDS = 'predict_trends',
    CREATE_CHART = 'create_chart',
    ANSWER_QUESTIONS = 'answer_questions',
    DATA_TRANSFORMATION = 'data_transformation',
    GENERATE_REPORT = 'generate_report',
}

export interface AIInteraction {
    id: string;
    task: AITask;
    input: any; // e.g., CellRange, natural language query, data table
    output: any; // Result from AI (e.g., proposed formula, cleaned data preview, chart definition)
    timestamp: Date;
    userId: string;
    status: 'pending' | 'completed' | 'failed' | 'requires_confirmation';
    feedback?: 'positive' | 'negative' | 'neutral';
}

// Data Sources and Queries
export enum DataSourceType {
    GOOGLE_SHEETS = 'google_sheets',
    BIGQUERY = 'bigquery',
    CLOUD_SQL = 'cloud_sql',
    EXTERNAL_API = 'external_api',
    CSV_UPLOAD = 'csv_upload',
    // Future expansion: Salesforce, SAP, HubSpot, etc.
}

export interface DataSource {
    id: string;
    name: string;
    type: DataSourceType;
    connectionConfig: any; // Credentials, API keys, project IDs
    lastSync?: Date;
    syncFrequency?: string; // e.g., 'hourly', 'daily'
}

export enum QueryType {
    SQL = 'sql',
    API = 'api',
    SHEET_RANGE = 'sheet_range',
    // Future expansion: MDX, GraphQL
}

export interface DataQuery {
    id: string;
    name: string;
    dataSourceId: string;
    queryType: QueryType;
    queryString: string; // e.g., "SELECT * FROM my_table WHERE date > '2023-01-01'"
    destinationRange: CellRange; // Where results are placed
    lastRun?: Date;
    autoRefresh?: boolean;
}

// Pivot Tables
export interface PivotTableField {
    sourceCol: number;
    name: string;
    type: 'row' | 'column' | 'value' | 'filter';
    aggregation?: 'SUM' | 'COUNT' | 'AVERAGE' | 'MIN' | 'MAX';
    // Future expansion: custom aggregation formulas, grouping
}

export interface PivotTableDefinition {
    id: string;
    name: string;
    sourceRange: CellRange;
    destinationSheetId: string;
    destinationStart: CellCoordinates;
    fields: PivotTableField[];
    options?: any; // e.g., show grand totals, report layout
}

// --- Spreadsheet Context and State Management ---

export interface SpreadsheetState {
    workbook: Workbook;
    selectedCells: CellRange | null;
    activeCell: CellCoordinates | null; // Cell currently focused/being edited
    clipboard: { type: 'cut' | 'copy'; data: { [key: string]: SpreadsheetCell }; range: CellRange } | null;
    formulaBarValue: string; // The value displayed in the formula bar
    isEditing: boolean; // True if a cell is currently in edit mode
    undoStack: ChangeLogEntry[][]; // Stack of changes, each element is a batch of changes
    redoStack: ChangeLogEntry[][];
    dialogOpen: { type: string; props: any } | null;
    sidebarOpen: boolean;
    sidebarContent: 'comments' | 'history' | 'data_analysis' | 'plugins' | 'ai_assistant' | 'named_ranges' | 'data_sources' | 'script_editor' | null;
    activeRibbonTab: 'home' | 'insert' | 'data' | 'formulas' | 'view' | 'automation' | 'collaborate' | 'ai' | 'file';
    notifications: { id: string; message: string; type: 'info' | 'warning' | 'error' | 'success'; duration?: number; }[];
    zoomLevel: number; // e.g., 1.0 for 100%
    findReplace?: { isOpen: boolean; findText: string; replaceText: string; matchCase: boolean; wholeWord: boolean; };
    statusMessage?: { text: string; type: 'info' | 'warning' | 'error' | 'success'; };
    // UI states for specific tools like Conditional Formatting Manager, Data Validation Editor
    conditionalFormattingManagerOpen?: boolean;
    currentUserId: string; // ID of the currently logged-in user
    currentUserName: string; // Name of the currently logged-in user
}

// Actions for state reduction
export enum ActionType {
    SET_WORKBOOK = 'SET_WORKBOOK',
    UPDATE_CELL = 'UPDATE_CELL',
    UPDATE_CELL_RANGE = 'UPDATE_CELL_RANGE',
    SET_ACTIVE_CELL = 'SET_ACTIVE_CELL',
    SET_SELECTED_CELLS = 'SET_SELECTED_CELLS',
    SET_FORMULA_BAR_VALUE = 'SET_FORMULA_BAR_VALUE',
    SET_EDITING_MODE = 'SET_EDITING_MODE',
    ADD_CHANGE_TO_HISTORY = 'ADD_CHANGE_TO_HISTORY',
    UNDO = 'UNDO',
    REDO = 'REDO',
    ADD_SHEET = 'ADD_SHEET',
    SET_ACTIVE_SHEET = 'SET_ACTIVE_SHEET',
    UPDATE_SHEET_DIMENSIONS = 'UPDATE_SHEET_DIMENSIONS',
    ADD_COLLABORATOR = 'ADD_COLLABORATOR',
    UPDATE_COLLABORATOR_PRESENCE = 'UPDATE_COLLABORATOR_PRESENCE',
    OPEN_DIALOG = 'OPEN_DIALOG',
    CLOSE_DIALOG = 'CLOSE_DIALOG',
    TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR',
    SET_SIDEBAR_CONTENT = 'SET_SIDEBAR_CONTENT',
    SET_ACTIVE_RIBBON_TAB = 'SET_ACTIVE_RIBBON_TAB',
    ADD_NOTIFICATION = 'ADD_NOTIFICATION',
    REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION',
    APPLY_CELL_STYLE = 'APPLY_CELL_STYLE',
    SET_DATA_VALIDATION = 'SET_DATA_VALIDATION',
    ADD_COMMENT = 'ADD_COMMENT',
    UPDATE_NAMED_RANGE = 'UPDATE_NAMED_RANGE',
    ADD_CHART = 'ADD_CHART',
    APPLY_FILTER = 'APPLY_FILTER',
    APPLY_SORT = 'APPLY_SORT',
    MERGE_CELLS = 'MERGE_CELLS',
    UNMERGE_CELLS = 'UNMERGE_CELLS',
    SET_ZOOM_LEVEL = 'SET_ZOOM_LEVEL',
    UPDATE_ROW_METADATA = 'UPDATE_ROW_METADATA',
    UPDATE_COL_METADATA = 'UPDATE_COL_METADATA',
    INSERT_ROW = 'INSERT_ROW',
    DELETE_ROW = 'DELETE_ROW',
    INSERT_COLUMN = 'INSERT_COLUMN',
    DELETE_COLUMN = 'DELETE_COLUMN',
    TOGGLE_GRIDLINES = 'TOGGLE_GRIDLINES',
    ADD_CONDITIONAL_FORMATTING = 'ADD_CONDITIONAL_FORMATTING',
    REMOVE_CONDITIONAL_FORMATTING = 'REMOVE_CONDITIONAL_FORMATTING',
    SET_CLIPBOARD = 'SET_CLIPBOARD',
    APPLY_PASTE = 'APPLY_PASTE',
    OPEN_FIND_REPLACE = 'OPEN_FIND_REPLACE',
    CLOSE_FIND_REPLACE = 'CLOSE_FIND_REPLACE',
    UPDATE_FIND_REPLACE_SETTINGS = 'UPDATE_FIND_REPLACE_SETTINGS',
    UPDATE_STATUS_MESSAGE = 'UPDATE_STATUS_MESSAGE',
    ADD_DATA_SOURCE = 'ADD_DATA_SOURCE',
    UPDATE_DATA_QUERY = 'UPDATE_DATA_QUERY',
    ADD_PIVOT_TABLE = 'ADD_PIVOT_TABLE',
    ADD_SCRIPT_FUNCTION = 'ADD_SCRIPT_FUNCTION',
    UPDATE_WORKBOOK_SETTINGS = 'UPDATE_WORKBOOK_SETTINGS',
    ADD_DRAWING_OBJECT = 'ADD_DRAWING_OBJECT',
    // ... many more actions for every feature
}

type SpreadsheetAction =
    | { type: ActionType.SET_WORKBOOK; payload: Workbook }
    | { type: ActionType.UPDATE_CELL; payload: { sheetId: string; coords: CellCoordinates; data: Partial<SpreadsheetCell>; userId: string; userName: string; } }
    | { type: ActionType.UPDATE_CELL_RANGE; payload: { sheetId: string; range: CellRange; data: Partial<SpreadsheetCell>; userId: string; userName: string; } }
    | { type: ActionType.SET_ACTIVE_CELL; payload: CellCoordinates | null }
    | { type: ActionType.SET_SELECTED_CELLS; payload: CellRange | null }
    | { type: ActionType.SET_FORMULA_BAR_VALUE; payload: string }
    | { type: ActionType.SET_EDITING_MODE; payload: boolean }
    | { type: ActionType.ADD_CHANGE_TO_HISTORY; payload: ChangeLogEntry[] }
    | { type: ActionType.UNDO }
    | { type: ActionType.REDO }
    | { type: ActionType.ADD_SHEET; payload: Sheet }
    | { type: ActionType.SET_ACTIVE_SHEET; payload: string }
    | { type: ActionType.UPDATE_SHEET_DIMENSIONS; payload: { sheetId: string; rows?: number; cols?: number } }
    | { type: ActionType.ADD_COLLABORATOR; payload: UserPresence }
    | { type: ActionType.UPDATE_COLLABORATOR_PRESENCE; payload: { userId: string; presence: Partial<UserPresence> } }
    | { type: ActionType.OPEN_DIALOG; payload: { type: string; props: any } }
    | { type: ActionType.CLOSE_DIALOG }
    | { type: ActionType.TOGGLE_SIDEBAR; payload?: SpreadsheetState['sidebarContent'] }
    | { type: ActionType.SET_SIDEBAR_CONTENT; payload: SpreadsheetState['sidebarContent'] }
    | { type: ActionType.SET_ACTIVE_RIBBON_TAB; payload: SpreadsheetState['activeRibbonTab'] }
    | { type: ActionType.ADD_NOTIFICATION; payload: SpreadsheetState['notifications'][0] }
    | { type: ActionType.REMOVE_NOTIFICATION; payload: string }
    | { type: ActionType.APPLY_CELL_STYLE; payload: { sheetId: string; range: CellRange; style: Partial<CellStyle>; userId: string; userName: string; } }
    | { type: ActionType.SET_DATA_VALIDATION; payload: { sheetId: string; range: CellRange; validation: DataValidationRule | null; userId: string; userName: string; } }
    | { type: ActionType.ADD_COMMENT; payload: { sheetId: string; cellId: string; comment: CellComment; userId: string; userName: string; } }
    | { type: ActionType.UPDATE_NAMED_RANGE; payload: NamedRange }
    | { type: ActionType.ADD_CHART; payload: { sheetId: string; chart: ChartDefinition; userId: string; userName: string; } }
    | { type: ActionType.APPLY_FILTER; payload: { sheetId: string; filter: FilterCriteria; userId: string; userName: string; } }
    | { type: ActionType.APPLY_SORT; payload: { sheetId: string; sortOrders: SortOrder[]; userId: string; userName: string; } }
    | { type: ActionType.MERGE_CELLS; payload: { sheetId: string; range: CellRange; userId: string; userName: string; } }
    | { type: ActionType.UNMERGE_CELLS; payload: { sheetId: string; range: CellRange; userId: string; userName: string; } }
    | { type: ActionType.SET_ZOOM_LEVEL; payload: number }
    | { type: ActionType.UPDATE_ROW_METADATA; payload: { sheetId: string; rowIndex: number; metadata: Partial<RowMetadata> } }
    | { type: ActionType.UPDATE_COL_METADATA; payload: { sheetId: string; colIndex: number; metadata: Partial<ColMetadata> } }
    | { type: ActionType.INSERT_ROW; payload: { sheetId: string; atIndex: number; count: number; userId: string; userName: string; } }
    | { type: ActionType.DELETE_ROW; payload: { sheetId: string; atIndex: number; count: number; userId: string; userName: string; } }
    | { type: ActionType.INSERT_COLUMN; payload: { sheetId: string; atIndex: number; count: number; userId: string; userName: string; } }
    | { type: ActionType.DELETE_COLUMN; payload: { sheetId: string; atIndex: number; count: number; userId: string; userName: string; } }
    | { type: ActionType.TOGGLE_GRIDLINES; payload: { sheetId: string; visibility: boolean } }
    | { type: ActionType.ADD_CONDITIONAL_FORMATTING; payload: { sheetId: string; rule: ConditionalFormattingRule; userId: string; userName: string; } }
    | { type: ActionType.REMOVE_CONDITIONAL_FORMATTING; payload: { sheetId: string; ruleId: string; userId: string; userName: string; } }
    | { type: ActionType.SET_CLIPBOARD; payload: SpreadsheetState['clipboard'] }
    | { type: ActionType.APPLY_PASTE; payload: { targetCoords: CellCoordinates; userId: string; userName: string; } }
    | { type: ActionType.OPEN_FIND_REPLACE }
    | { type: ActionType.CLOSE_FIND_REPLACE }
    | { type: ActionType.UPDATE_FIND_REPLACE_SETTINGS; payload: Partial<SpreadsheetState['findReplace']> }
    | { type: ActionType.UPDATE_STATUS_MESSAGE; payload: SpreadsheetState['statusMessage'] | null }
    | { type: ActionType.ADD_DATA_SOURCE; payload: DataSource }
    | { type: ActionType.UPDATE_DATA_QUERY; payload: DataQuery }
    | { type: ActionType.ADD_PIVOT_TABLE; payload: PivotTableDefinition }
    | { type: ActionType.ADD_SCRIPT_FUNCTION; payload: { workbookId: string; func: ScriptFunction; userId: string; userName: string; } }
    | { type: ActionType.UPDATE_WORKBOOK_SETTINGS; payload: Partial<WorkbookSettings> }
    | { type: ActionType.ADD_DRAWING_OBJECT; payload: { sheetId: string; drawing: DrawingObject; userId: string; userName: string; } }
    // ... extend with more actions

interface SpreadsheetContextType {
    state: SpreadsheetState;
    dispatch: React.Dispatch<SpreadsheetAction>;
    getCurrentCellData: (coords: CellCoordinates) => SpreadsheetCell | undefined;
    getCurrentSheet: () => Sheet | undefined;
    getCellId: (coords: CellCoordinates) => string;
    // Add more utility functions that depend on context state
}

const SpreadsheetContext = createContext<SpreadsheetContextType | undefined>(undefined);

// Helper for cell ID conversion
const getCellId = (coords: CellCoordinates) => `${String.fromCharCode(65 + coords.col)}${coords.row + 1}`;
const getCoordsFromCellId = (cellId: string): CellCoordinates => {
    const colMatch = cellId.match(/[A-Z]+/);
    const rowMatch = cellId.match(/\d+/);
    if (!colMatch || !rowMatch) throw new Error(`Invalid cell ID: ${cellId}`);
    const col = colMatch[0].split('').reduce((sum, char, index) => sum * 26 + (char.charCodeAt(0) - 64), 0) - 1;
    const row = parseInt(rowMatch[0], 10) - 1;
    return { row, col };
};

// A simple reducer for complex state
const spreadsheetReducer = (state: SpreadsheetState, action: SpreadsheetAction): SpreadsheetState => {
    const currentSheet = state.workbook.sheets.find(s => s.id === state.workbook.activeSheetId);
    const currentUserId = state.currentUserId;
    const currentUserName = state.currentUserName;

    switch (action.type) {
        case ActionType.SET_WORKBOOK:
            return { ...state, workbook: action.payload };
        case ActionType.UPDATE_CELL: {
            const { sheetId, coords, data, userId, userName } = action.payload;
            const sheet = state.workbook.sheets.find(s => s.id === sheetId);
            if (!sheet) return state;

            const newCellId = getCellId(coords);
            const oldCell = sheet.data[newCellId];
            const newCell = { ...oldCell, ...data, id: newCellId, dataType: data.dataType || (oldCell?.dataType || CellDataType.TEXT), type: data.type || (oldCell?.type || CellContentType.VALUE) };

            const newSheetData = { ...sheet.data, [newCellId]: newCell };
            const updatedSheet: Sheet = { ...sheet, data: newSheetData };
            const updatedSheets = state.workbook.sheets.map(s => s.id === sheetId ? updatedSheet : s);

            const change: ChangeLogEntry = {
                id: `change-${Date.now()}-${Math.random()}`,
                type: ChangeType.CELL_EDIT,
                userId, userName,
                timestamp: new Date(),
                sheetId,
                details: { cellId: newCellId, oldValue: oldCell?.value, newValue: newCell.value, oldFormula: oldCell?.formula, newFormula: newCell.formula, oldRawInput: oldCell?.rawInput, newRawInput: newCell.rawInput }
            };

            return {
                ...state,
                workbook: { ...state.workbook, sheets: updatedSheets },
                undoStack: [...state.undoStack, [change]],
                redoStack: [], // Clear redo stack on new action
            };
        }
        case ActionType.SET_ACTIVE_CELL:
            return { ...state, activeCell: action.payload };
        case ActionType.SET_SELECTED_CELLS:
            return { ...state, selectedCells: action.payload };
        case ActionType.SET_FORMULA_BAR_VALUE:
            return { ...state, formulaBarValue: action.payload };
        case ActionType.SET_EDITING_MODE:
            return { ...state, isEditing: action.payload };
        case ActionType.ADD_CHANGE_TO_HISTORY:
            return {
                ...state,
                undoStack: [...state.undoStack, action.payload],
                redoStack: [],
            };
        case ActionType.UNDO: {
            if (state.undoStack.length === 0) return state;
            const lastChangeBatch = state.undoStack[state.undoStack.length - 1];
            // In a real app, this would involve reversing the changes in lastChangeBatch
            // For now, just moving it to redo stack and updating workbook state as a mock
            const newState = {
                ...state,
                undoStack: state.undoStack.slice(0, -1),
                redoStack: [...state.redoStack, lastChangeBatch],
            };
            // Mock: Revert the last change in the workbook data (highly simplified)
            if (lastChangeBatch[0]?.type === ChangeType.CELL_EDIT) {
                const { sheetId, details } = lastChangeBatch[0];
                const sheet = newState.workbook.sheets.find(s => s.id === sheetId);
                if (sheet) {
                    const newCellData = { ...sheet.data };
                    newCellData[details.cellId] = { ...newCellData[details.cellId], value: details.oldValue, rawInput: details.oldRawInput, formula: details.oldFormula, error: undefined, type: details.oldFormula ? CellContentType.FORMULA : CellContentType.VALUE };
                    const updatedSheet = { ...sheet, data: newCellData };
                    newState.workbook = { ...newState.workbook, sheets: newState.workbook.sheets.map(s => s.id === sheetId ? updatedSheet : s) };
                }
            }
            return newState;
        }
        case ActionType.REDO: {
            if (state.redoStack.length === 0) return state;
            const nextChangeBatch = state.redoStack[state.redoStack.length - 1];
            // In a real app, this would involve re-applying the changes in nextChangeBatch
            const newState = {
                ...state,
                undoStack: [...state.undoStack, nextChangeBatch],
                redoStack: state.redoStack.slice(0, -1),
            };
             // Mock: Apply the next change in the workbook data (highly simplified)
             if (nextChangeBatch[0]?.type === ChangeType.CELL_EDIT) {
                const { sheetId, details } = nextChangeBatch[0];
                const sheet = newState.workbook.sheets.find(s => s.id === sheetId);
                if (sheet) {
                    const newCellData = { ...sheet.data };
                    newCellData[details.cellId] = { ...newCellData[details.cellId], value: details.newValue, rawInput: details.newRawInput, formula: details.newFormula, error: undefined, type: details.newFormula ? CellContentType.FORMULA : CellContentType.VALUE };
                    const updatedSheet = { ...sheet, data: newCellData };
                    newState.workbook = { ...newState.workbook, sheets: newState.workbook.sheets.map(s => s.id === sheetId ? updatedSheet : s) };
                }
            }
            return newState;
        }
        case ActionType.ADD_SHEET: {
            const newWorkbook = { ...state.workbook, sheets: [...state.workbook.sheets, action.payload] };
            return { ...state, workbook: newWorkbook, activeSheetId: action.payload.id };
        }
        case ActionType.SET_ACTIVE_SHEET:
            return { ...state, workbook: { ...state.workbook, activeSheetId: action.payload }, selectedCells: null, activeCell: null };
        case ActionType.UPDATE_SHEET_DIMENSIONS: {
            const { sheetId, rows, cols } = action.payload;
            const updatedSheets = state.workbook.sheets.map(s =>
                s.id === sheetId ? { ...s, dimensions: { rows: rows ?? s.dimensions.rows, cols: cols ?? s.dimensions.cols } } : s
            );
            return { ...state, workbook: { ...state.workbook, sheets: updatedSheets } };
        }
        case ActionType.ADD_COLLABORATOR:
            return { ...state, workbook: { ...state.workbook, collaborators: [...state.workbook.collaborators, action.payload] } };
        case ActionType.UPDATE_COLLABORATOR_PRESENCE: {
            const { userId, presence } = action.payload;
            const updatedCollaborators = state.workbook.collaborators.map(c =>
                c.userId === userId ? { ...c, ...presence } : c
            );
            return { ...state, workbook: { ...state.workbook, collaborators: updatedCollaborators } };
        }
        case ActionType.OPEN_DIALOG:
            return { ...state, dialogOpen: action.payload };
        case ActionType.CLOSE_DIALOG:
            return { ...state, dialogOpen: null };
        case ActionType.TOGGLE_SIDEBAR:
            return { ...state, sidebarOpen: !state.sidebarOpen, sidebarContent: action.payload || (state.sidebarOpen ? null : 'comments') };
        case ActionType.SET_SIDEBAR_CONTENT:
            return { ...state, sidebarContent: action.payload, sidebarOpen: !!action.payload };
        case ActionType.SET_ACTIVE_RIBBON_TAB:
            return { ...state, activeRibbonTab: action.payload };
        case ActionType.ADD_NOTIFICATION:
            return { ...state, notifications: [...state.notifications, action.payload] };
        case ActionType.REMOVE_NOTIFICATION:
            return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
        case ActionType.APPLY_CELL_STYLE: {
            const { sheetId, range, style, userId, userName } = action.payload;
            const sheet = state.workbook.sheets.find(s => s.id === sheetId);
            if (!sheet) return state;

            const updatedSheetData = { ...sheet.data };
            const affectedCellIds: string[] = [];
            for (let r = range.start.row; r <= range.end.row; r++) {
                for (let c = range.start.col; c <= range.end.col; c++) {
                    const id = getCellId({ row: r, col: c });
                    updatedSheetData[id] = { ...updatedSheetData[id], style: { ...updatedSheetData[id]?.style, ...style } };
                    affectedCellIds.push(id);
                }
            }
            const updatedSheet = { ...sheet, data: updatedSheetData };
            const updatedSheets = state.workbook.sheets.map(s => s.id === sheetId ? updatedSheet : s);

            const change: ChangeLogEntry = {
                id: `change-${Date.now()}-${Math.random()}`,
                type: ChangeType.RANGE_FORMAT,
                userId, userName, timestamp: new Date(), sheetId,
                details: { range, style, affectedCellIds }
            };
            return {
                ...state,
                workbook: { ...state.workbook, sheets: updatedSheets },
                undoStack: [...state.undoStack, [change]],
                redoStack: [],
            };
        }
        case ActionType.MERGE_CELLS: {
            const { sheetId, range, userId, userName } = action.payload;
            const sheet = state.workbook.sheets.find(s => s.id === sheetId);
            if (!sheet) return state;

            const startCellId = getCellId(range.start);
            const updatedSheetData = { ...sheet.data };
            for (let r = range.start.row; r <= range.end.row; r++) {
                for (let c = range.start.col; c <= range.end.col; c++) {
                    const id = getCellId({ row: r, col: c });
                    // Mark all cells in range as merged. Only top-left cell will contain content.
                    updatedSheetData[id] = { ...updatedSheetData[id], mergedWith: range };
                    if (id !== startCellId) {
                        // Clear content of non-master cells in the merged range
                        updatedSheetData[id].value = null;
                        updatedSheetData[id].rawInput = '';
                        updatedSheetData[id].formula = undefined;
                    }
                }
            }
            const updatedMergedCells = [...sheet.mergedCells, range];
            const updatedSheet = { ...sheet, data: updatedSheetData, mergedCells: updatedMergedCells };
            const updatedSheets = state.workbook.sheets.map(s => s.id === sheetId ? updatedSheet : s);

            const change: ChangeLogEntry = {
                id: `change-${Date.now()}-${Math.random()}`,
                type: ChangeType.MERGE_CELLS,
                userId, userName, timestamp: new Date(), sheetId,
                details: { range }
            };
            return {
                ...state,
                workbook: { ...state.workbook, sheets: updatedSheets },
                undoStack: [...state.undoStack, [change]],
                redoStack: [],
            };
        }
        case ActionType.UNMERGE_CELLS: {
            const { sheetId, range, userId, userName } = action.payload;
            const sheet = state.workbook.sheets.find(s => s.id === sheetId);
            if (!sheet) return state;

            const updatedSheetData = { ...sheet.data };
            for (let r = range.start.row; r <= range.end.row; r++) {
                for (let c = range.start.col; c <= range.end.col; c++) {
                    const id = getCellId({ row: r, col: c });
                    updatedSheetData[id] = { ...updatedSheetData[id], mergedWith: undefined };
                }
            }
            const updatedMergedCells = sheet.mergedCells.filter(
                mr => !(mr.start.row === range.start.row && mr.start.col === range.start.col &&
                       mr.end.row === range.end.row && mr.end.col === range.end.col &&
                       mr.sheetId === range.sheetId)
            );
            const updatedSheet = { ...sheet, data: updatedSheetData, mergedCells: updatedMergedCells };
            const updatedSheets = state.workbook.sheets.map(s => s.id === sheetId ? updatedSheet : s);

            const change: ChangeLogEntry = {
                id: `change-${Date.now()}-${Math.random()}`,
                type: ChangeType.UNMERGE_CELLS,
                userId, userName, timestamp: new Date(), sheetId,
                details: { range }
            };
            return {
                ...state,
                workbook: { ...state.workbook, sheets: updatedSheets },
                undoStack: [...state.undoStack, [change]],
                redoStack: [],
            };
        }
        case ActionType.SET_ZOOM_LEVEL:
            return { ...state, zoomLevel: action.payload };
        case ActionType.INSERT_ROW: {
            // Simplified: Add new row metadata and shift existing cell data down
            const { sheetId, atIndex, count, userId, userName } = action.payload;
            const sheet = state.workbook.sheets.find(s => s.id === sheetId);
            if (!sheet) return state;

            const newSheetData: { [key: string]: SpreadsheetCell } = {};
            // Shift existing cells below atIndex down
            Object.entries(sheet.data).forEach(([cellId, cell]) => {
                const coords = getCoordsFromCellId(cellId);
                if (coords.row >= atIndex) {
                    newSheetData[getCellId({ row: coords.row + count, col: coords.col })] = { ...cell, id: getCellId({ row: coords.row + count, col: coords.col }) };
                } else {
                    newSheetData[cellId] = cell;
                }
            });

            // Update sheet dimensions and row metadata
            const newDimensions = { ...sheet.dimensions, rows: sheet.dimensions.rows + count };
            const newRowMetadata = { ...sheet.rowMetadata };
            for (let i = sheet.dimensions.rows - 1; i >= atIndex; i--) {
                newRowMetadata[i + count] = newRowMetadata[i];
                delete newRowMetadata[i];
            }
            for (let i = 0; i < count; i++) {
                newRowMetadata[atIndex + i] = { hidden: false, height: 20 }; // Default new row height
            }

            const updatedSheet = { ...sheet, data: newSheetData, dimensions: newDimensions, rowMetadata: newRowMetadata };
            const updatedSheets = state.workbook.sheets.map(s => s.id === sheetId ? updatedSheet : s);

            const change: ChangeLogEntry = {
                id: `change-${Date.now()}-${Math.random()}`,
                type: ChangeType.ROW_INSERT,
                userId, userName, timestamp: new Date(), sheetId,
                details: { atIndex, count }
            };

            return {
                ...state,
                workbook: { ...state.workbook, sheets: updatedSheets },
                undoStack: [...state.undoStack, [change]],
                redoStack: [],
            };
        }
        case ActionType.TOGGLE_GRIDLINES: {
            const { sheetId, visibility } = action.payload;
            const updatedSheets = state.workbook.sheets.map(s =>
                s.id === sheetId ? { ...s, gridlineVisibility: visibility } : s
            );
            return { ...state, workbook: { ...state.workbook, sheets: updatedSheets } };
        }
        case ActionType.SET_CLIPBOARD:
            return { ...state, clipboard: action.payload };
        case ActionType.APPLY_PASTE: {
            const { targetCoords, userId, userName } = action.payload;
            const { clipboard } = state;
            if (!clipboard || !currentSheet) return state;

            const { data: copiedData, range: sourceRange } = clipboard;
            const newSheetData = { ...currentSheet.data };
            const changes: ChangeLogEntry[] = [];

            for (let r = 0; r <= sourceRange.end.row - sourceRange.start.row; r++) {
                for (let c = 0; c <= sourceRange.end.col - sourceRange.start.col; c++) {
                    const sourceCellId = getCellId({ row: sourceRange.start.row + r, col: sourceRange.start.col + c });
                    const targetCellId = getCellId({ row: targetCoords.row + r, col: targetCoords.col + c });
                    const sourceCell = copiedData[sourceCellId];

                    if (sourceCell) {
                        const oldCell = currentSheet.data[targetCellId];
                        const newCell: SpreadsheetCell = { ...sourceCell, id: targetCellId, mergedWith: undefined }; // Reset merged status
                        // For formulas, relative references need to be adjusted. This is a complex step, simplified here.
                        if (newCell.formula) {
                            // Example: Adjust A1 in formula for paste from B2 to D5
                            // needs full formula parsing and AST manipulation.
                            // For now, it's a direct copy, which works for absolute refs or simple values.
                        }
                        newSheetData[targetCellId] = newCell;
                        changes.push({
                            id: `change-${Date.now()}-${Math.random()}`,
                            type: ChangeType.CELL_EDIT,
                            userId, userName,
                            timestamp: new Date(),
                            sheetId: currentSheet.id,
                            details: { cellId: targetCellId, oldValue: oldCell?.value, newValue: newCell.value, oldFormula: oldCell?.formula, newFormula: newCell.formula }
                        });
                    }
                }
            }

            const updatedSheet = { ...currentSheet, data: newSheetData };
            const updatedSheets = state.workbook.sheets.map(s => s.id === currentSheet.id ? updatedSheet : s);
            return {
                ...state,
                workbook: { ...state.workbook, sheets: updatedSheets },
                undoStack: [...state.undoStack, changes],
                redoStack: [],
                statusMessage: { text: `Pasted ${changes.length} cells.`, type: 'success' },
            };
        }
        case ActionType.OPEN_FIND_REPLACE:
            return { ...state, findReplace: { isOpen: true, findText: '', replaceText: '', matchCase: false, wholeWord: false } };
        case ActionType.CLOSE_FIND_REPLACE:
            return { ...state, findReplace: { ...state.findReplace, isOpen: false } as SpreadsheetState['findReplace'] };
        case ActionType.UPDATE_FIND_REPLACE_SETTINGS:
            return { ...state, findReplace: { ...state.findReplace, ...action.payload } as SpreadsheetState['findReplace'] };
        case ActionType.UPDATE_STATUS_MESSAGE:
            return { ...state, statusMessage: action.payload };
        case ActionType.ADD_SCRIPT_FUNCTION: {
            const { workbookId, func, userId, userName } = action.payload;
            const workbook = state.workbook.id === workbookId ? state.workbook : undefined;
            if (!workbook) return state;

            const updatedScriptProject = workbook.scriptProject ? { ...workbook.scriptProject, scripts: [...workbook.scriptProject.scripts, func] } : { id: 'script-1', name: 'New Project', language: ScriptLanguage.JAVASCRIPT, scripts: [func] };
            const updatedWorkbook = { ...workbook, scriptProject: updatedScriptProject };

            const change: ChangeLogEntry = {
                id: `change-${Date.now()}-${Math.random()}`,
                type: ChangeType.SCRIPT_MODIFY,
                userId, userName, timestamp: new Date(), sheetId: 'workbook', // Workbook-level change
                details: { functionName: func.name, action: 'add' }
            };
            return {
                ...state,
                workbook: updatedWorkbook,
                undoStack: [...state.undoStack, [change]],
                redoStack: [],
            };
        }
        case ActionType.UPDATE_WORKBOOK_SETTINGS: {
            const updatedSettings = { ...state.workbook.workbookSettings, ...action.payload };
            return { ...state, workbook: { ...state.workbook, workbookSettings: updatedSettings } };
        }
        // ... extend with more action handlers
        default:
            return state;
    }
};

export const SpreadsheetProvider: React.FC<{ children: React.ReactNode; initialWorkbook: Workbook; userId: string; userName: string; }> = ({ children, initialWorkbook, userId, userName }) => {
    const initialState: SpreadsheetState = {
        workbook: initialWorkbook,
        selectedCells: null,
        activeCell: null,
        clipboard: null,
        formulaBarValue: '',
        isEditing: false,
        undoStack: [],
        redoStack: [],
        dialogOpen: null,
        sidebarOpen: false,
        sidebarContent: null,
        activeRibbonTab: 'home',
        notifications: [],
        zoomLevel: 1.0, // 100%
        findReplace: { isOpen: false, findText: '', replaceText: '', matchCase: false, wholeWord: false },
        currentUserId: userId,
        currentUserName: userName,
    };

    const [state, dispatch] = React.useReducer(spreadsheetReducer, initialState);

    // Effect for collaboration: broadcast changes, receive updates
    useEffect(() => {
        // Mock presence update
        const interval = setInterval(() => {
            dispatch({
                type: ActionType.UPDATE_COLLABORATOR_PRESENCE,
                payload: {
                    userId,
                    presence: {
                        activeSheetId: state.workbook.activeSheetId,
                        activeCell: state.activeCell,
                        selection: state.selectedCells,
                        status: 'editing',
                        lastActivity: new Date(),
                    },
                },
            });
        }, 5000); // Every 5 seconds update presence

        // Imagine WebSocket or similar for real-time collaboration
        // const ws = new WebSocket('wss://spreadsheets.google.com/realtime');
        // ws.onmessage = (event) => {
        //     const remoteAction = JSON.parse(event.data);
        //     dispatch(remoteAction); // Apply remote changes
        // };
        // ws.send(JSON.stringify({ type: 'JOIN_WORKBOOK', workbookId: initialWorkbook.id, userId, userName }));

        return () => clearInterval(interval); // ws.close();
    }, [state.workbook.activeSheetId, state.activeCell, state.selectedCells, userId, userName, initialWorkbook.id]);

    // Cleanup notifications after a duration
    useEffect(() => {
        if (state.notifications.length > 0) {
            const timer = setTimeout(() => {
                const oldestNotification = state.notifications[0];
                if (oldestNotification.duration !== 0) { // 0 duration means permanent
                    dispatch({ type: ActionType.REMOVE_NOTIFICATION, payload: oldestNotification.id });
                }
            }, state.notifications[0].duration || 5000); // Default 5 seconds

            return () => clearTimeout(timer);
        }
    }, [state.notifications, dispatch]);

    // Utility functions to access state easily
    const getCurrentSheet = useCallback(() => {
        return state.workbook.sheets.find(s => s.id === state.workbook.activeSheetId);
    }, [state.workbook.sheets, state.workbook.activeSheetId]);

    const getCurrentCellData = useCallback((coords: CellCoordinates) => {
        const sheet = getCurrentSheet();
        if (!sheet) return undefined;
        const cellId = getCellId(coords);
        return sheet.data[cellId];
    }, [getCurrentSheet]);

    const value = React.useMemo(() => ({
        state,
        dispatch,
        getCurrentCellData,
        getCurrentSheet,
        getCellId, // Expose helper
    }), [state, getCurrentCellData, getCurrentSheet]);

    return <SpreadsheetContext.Provider value={value}>{children}</SpreadsheetContext.Provider>;
};

export const useSpreadsheet = () => {
    const context = useContext(SpreadsheetContext);
    if (context === undefined) {
        throw new Error('useSpreadsheet must be used within a SpreadsheetProvider');
    }
    return context;
};

// --- Helper Functions (Mock implementations) ---

// Formula Engine - Highly simplified for demonstration
export const parseAndEvaluateFormula = (formula: string, sheetData: { [key: string]: SpreadsheetCell }, currentSheetId: string): { value: any; error?: string; dataType: CellDataType; dependencies: string[] } => {
    // This would be a highly complex AST parser and evaluator, supporting array formulas, named ranges, cross-sheet references etc.
    // For this example, a simple mock
    const dependencies: string[] = [];
    try {
        if (formula.startsWith('=')) {
            const expression = formula.substring(1).toUpperCase();
            // Basic SUM example
            const sumMatch = expression.match(/SUM\(([A-Z]+\d+:[A-Z]+\d+)\)/);
            if (sumMatch && sumMatch[1]) {
                const rangeStr = sumMatch[1]; // e.g., A1:B5
                const [startCellStr, endCellStr] = rangeStr.split(':');
                const startCoords = getCoordsFromCellId(startCellStr);
                const endCoords = getCoordsFromCellId(endCellStr);

                let sum = 0;
                for (let r = startCoords.row; r <= endCoords.row; r++) {
                    for (let c = startCoords.col; c <= endCoords.col; c++) {
                        const cellId = getCellId({ row: r, col: c });
                        dependencies.push(cellId);
                        const cell = sheetData[cellId];
                        if (cell && typeof cell.value === 'number') {
                            sum += cell.value;
                        }
                    }
                }
                return { value: sum, dataType: CellDataType.NUMBER, dependencies };
            }

            // Basic arithmetic
            if (expression.match(/^[0-9A-Z+\-*/(). ]+$/)) {
                // Replace cell references with their values for evaluation
                let evaluableExpression = expression;
                const cellRefRegex = /[A-Z]+\d+/g;
                let match;
                while ((match = cellRefRegex.exec(expression)) !== null) {
                    const refCellId = match[0];
                    dependencies.push(refCellId);
                    const referencedCell = sheetData[refCellId];
                    const cellValue = referencedCell?.value ?? 0; // Default to 0 for missing cells in arithmetic
                    evaluableExpression = evaluableExpression.replace(new RegExp(refCellId, 'g'), cellValue.toString());
                }

                // Warning: eval is dangerous in production. This is for mock purposes.
                const result = eval(evaluableExpression);
                return { value: result, dataType: typeof result === 'number' ? CellDataType.NUMBER : CellDataType.TEXT, dependencies };
            }

            // Simple cell reference
            const cellRefMatch = expression.match(/^[A-Z]+\d+$/);
            if (cellRefMatch) {
                const refCellId = cellRefMatch[0];
                dependencies.push(refCellId);
                const referencedCell = sheetData[refCellId];
                return { value: referencedCell?.value, dataType: referencedCell?.dataType || CellDataType.TEXT, dependencies };
            }

            // Custom Function (mock)
            const customFuncMatch = expression.match(/MYCUSTOMFUNC\((.+?)\)/);
            if (customFuncMatch) {
                const args = customFuncMatch[1].split(',').map(s => s.trim());
                const argValues = args.map(arg => {
                    const refMatch = arg.match(/^[A-Z]+\d+$/);
                    if (refMatch) {
                        dependencies.push(refMatch[0]);
                        return sheetData[refMatch[0]]?.value;
                    }
                    return parseFloat(arg) || arg;
                });
                return { value: `Custom Func Result: ${argValues.join(', ')}`, dataType: CellDataType.TEXT, dependencies };
            }

            return { value: "#NAME?", error: "Unknown formula or syntax error", dataType: CellDataType.ERROR, dependencies };
        }
    } catch (e: any) {
        return { value: "#ERROR!", error: e.message, dataType: CellDataType.ERROR, dependencies };
    }
    return { value: formula, dataType: CellDataType.TEXT, dependencies };
};

// --- UI Components (Represented as functional blocks within Spreadsheet) ---

// Ribbon/Toolbar Component
export const Ribbon: React.FC = () => {
    const { state, dispatch } = useSpreadsheet();
    const { activeRibbonTab, activeCell, selectedCells, workbook, currentUserId, currentUserName } = state;
    const currentSheet = state.workbook.sheets.find(s => s.id === state.workbook.activeSheetId);

    const getTargetRange = (): CellRange => {
        if (selectedCells) return selectedCells;
        if (activeCell) return { start: activeCell, end: activeCell, sheetId: workbook.activeSheetId };
        // Fallback if no selection/active cell (shouldn't happen in normal flow)
        return { start: { row: 0, col: 0 }, end: { row: 0, col: 0 }, sheetId: workbook.activeSheetId };
    };

    const handleCopy = () => {
        if (selectedCells && currentSheet) {
            const copiedData: { [key: string]: SpreadsheetCell } = {};
            for (let r = selectedCells.start.row; r <= selectedCells.end.row; r++) {
                for (let c = selectedCells.start.col; c <= selectedCells.end.col; c++) {
                    const cellId = getCellId({ row: r, col: c });
                    if (currentSheet.data[cellId]) {
                        copiedData[cellId] = currentSheet.data[cellId];
                    }
                }
            }
            dispatch({ type: ActionType.SET_CLIPBOARD, payload: { type: 'copy', data: copiedData, range: selectedCells } });
            dispatch({ type: ActionType.ADD_NOTIFICATION, payload: { id: Date.now().toString(), message: 'Cells copied to clipboard.', type: 'info' } });
        }
    };

    const handlePaste = () => {
        if (state.clipboard && activeCell && currentSheet) {
            dispatch({ type: ActionType.APPLY_PASTE, payload: { targetCoords: activeCell, userId: currentUserId, userName: currentUserName } });
        } else {
            dispatch({ type: ActionType.ADD_NOTIFICATION, payload: { id: Date.now().toString(), message: 'No content to paste or no active cell selected.', type: 'warning' } });
        }
    };

    const handleInsertRow = (atIndex: number, count: number = 1) => {
        if (!currentSheet) return;
        dispatch({ type: ActionType.INSERT_ROW, payload: { sheetId: currentSheet.id, atIndex, count, userId: currentUserId, userName: currentUserName } });
        dispatch({ type: ActionType.ADD_NOTIFICATION, payload: { id: Date.now().toString(), message: `Inserted ${count} row(s) at row ${atIndex + 1}.`, type: 'success' } });
    };

    const renderTabContent = () => {
        switch (activeRibbonTab) {
            case 'file':
                return (
                    <div className="flex items-center space-x-2 p-2 border-t border-gray-700">
                        <RibbonGroup label="Workbook">
                            <RibbonButton label="New" icon="📄" onClick={() => console.log('New Workbook')} />
                            <RibbonButton label="Open" icon="📁" onClick={() => console.log('Open Workbook')} />
                            <RibbonButton label="Save" icon="💾" onClick={() => console.log('Save Workbook')} />
                            <RibbonButton label="Save As" icon="⬇️" onClick={() => console.log('Save As Workbook')} />
                        </RibbonGroup>
                        <RibbonGroup label="Import/Export">
                            <RibbonButton label="Import" icon="⬆️" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'importData', props: {} } })} />
                            <RibbonButton label="Export" icon="⬇️" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'exportData', props: {} } })} />
                            <RibbonButton label="Print" icon="🖨️" onClick={() => console.log('Print')} />
                        </RibbonGroup>
                        <RibbonGroup label="Settings">
                            <RibbonButton label="Workbook Settings" icon="⚙️" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'workbookSettings', props: {} } })} />
                        </RibbonGroup>
                    </div>
                );
            case 'home':
                return (
                    <div className="flex items-center space-x-2 p-2 border-t border-gray-700">
                        <RibbonGroup label="Clipboard">
                            <RibbonButton label="Cut" icon="✂️" onClick={() => console.log('Cut')} />
                            <RibbonButton label="Copy" icon="📄" onClick={handleCopy} />
                            <RibbonButton label="Paste" icon="📋" onClick={handlePaste} />
                        </RibbonGroup>
                        <RibbonGroup label="Font">
                            <RibbonDropdown label="Font" items={['Arial', 'Calibri', 'Times New Roman', 'Roboto', 'Open Sans']} onSelect={(font) => activeCell && dispatch({ type: ActionType.APPLY_CELL_STYLE, payload: { sheetId: workbook.activeSheetId, range: getTargetRange(), style: { fontFamily: font }, userId: currentUserId, userName: currentUserName } })} />
                            <RibbonButton label="B" icon="B" className="font-bold" onClick={() => activeCell && dispatch({ type: ActionType.APPLY_CELL_STYLE, payload: { sheetId: workbook.activeSheetId, range: getTargetRange(), style: { fontWeight: 'bold' }, userId: currentUserId, userName: currentUserName } })} />
                            <RibbonButton label="I" icon="I" className="italic" onClick={() => activeCell && dispatch({ type: ActionType.APPLY_CELL_STYLE, payload: { sheetId: workbook.activeSheetId, range: getTargetRange(), style: { fontStyle: 'italic' }, userId: currentUserId, userName: currentUserName } })} />
                            <RibbonColorPicker label="Fill" onSelect={(color) => activeCell && dispatch({ type: ActionType.APPLY_CELL_STYLE, payload: { sheetId: workbook.activeSheetId, range: getTargetRange(), style: { backgroundColor: color }, userId: currentUserId, userName: currentUserName } })} />
                            <RibbonColorPicker label="Text Color" onSelect={(color) => activeCell && dispatch({ type: ActionType.APPLY_CELL_STYLE, payload: { sheetId: workbook.activeSheetId, range: getTargetRange(), style: { color: color }, userId: currentUserId, userName: currentUserName } })} />
                        </RibbonGroup>
                        <RibbonGroup label="Alignment">
                            <RibbonButton label="Align Left" icon="📏" onClick={() => activeCell && dispatch({ type: ActionType.APPLY_CELL_STYLE, payload: { sheetId: workbook.activeSheetId, range: getTargetRange(), style: { textAlign: 'left' }, userId: currentUserId, userName: currentUserName } })} />
                            <RibbonButton label="Align Center" icon="↔️" onClick={() => activeCell && dispatch({ type: ActionType.APPLY_CELL_STYLE, payload: { sheetId: workbook.activeSheetId, range: getTargetRange(), style: { textAlign: 'center' }, userId: currentUserId, userName: currentUserName } })} />
                            <RibbonButton label="Align Right" icon="➡️" onClick={() => activeCell && dispatch({ type: ActionType.APPLY_CELL_STYLE, payload: { sheetId: workbook.activeSheetId, range: getTargetRange(), style: { textAlign: 'right' }, userId: currentUserId, userName: currentUserName } })} />
                            <RibbonButton label="Merge Cells" icon="↔️" onClick={() => selectedCells && dispatch({ type: ActionType.MERGE_CELLS, payload: { sheetId: workbook.activeSheetId, range: selectedCells, userId: currentUserId, userName: currentUserName }})} />
                            <RibbonButton label="Unmerge Cells" icon="↙️" onClick={() => selectedCells && dispatch({ type: ActionType.UNMERGE_CELLS, payload: { sheetId: workbook.activeSheetId, range: selectedCells, userId: currentUserId, userName: currentUserName }})} />
                            <RibbonButton label="Wrap Text" icon="W" onClick={() => activeCell && dispatch({ type: ActionType.APPLY_CELL_STYLE, payload: { sheetId: workbook.activeSheetId, range: getTargetRange(), style: { wrapText: true }, userId: currentUserId, userName: currentUserName } })} />
                        </RibbonGroup>
                        <RibbonGroup label="Number">
                            <RibbonDropdown label="Format" items={['General', 'Number', 'Currency', 'Date', 'Percentage', 'Scientific']} onSelect={(format) => console.log('Apply number format:', format)} />
                        </RibbonGroup>
                        <RibbonGroup label="Styles">
                            <RibbonButton label="Conditional Formatting" icon="🎨" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'conditionalFormattingManager', props: {} } })} />
                        </RibbonGroup>
                    </div>
                );
            case 'insert':
                return (
                    <div className="flex items-center space-x-2 p-2 border-t border-gray-700">
                        <RibbonGroup label="Cells, Rows, Columns">
                            <RibbonButton label="Insert Row Above" icon="➕R⬆️" onClick={() => activeCell && handleInsertRow(activeCell.row)} />
                            <RibbonButton label="Insert Row Below" icon="➕R⬇️" onClick={() => activeCell && handleInsertRow(activeCell.row + 1)} />
                            <RibbonButton label="Insert Column Left" icon="➕C⬅️" onClick={() => activeCell && dispatch({ type: ActionType.INSERT_COLUMN, payload: { sheetId: workbook.activeSheetId, atIndex: activeCell.col, count: 1, userId: currentUserId, userName: currentUserName } })} />
                            <RibbonButton label="Insert Column Right" icon="➕C➡️" onClick={() => activeCell && dispatch({ type: ActionType.INSERT_COLUMN, payload: { sheetId: workbook.activeSheetId, atIndex: activeCell.col + 1, count: 1, userId: currentUserId, userName: currentUserName } })} />
                            <RibbonButton label="Delete Row" icon="➖R" onClick={() => activeCell && dispatch({ type: ActionType.DELETE_ROW, payload: { sheetId: workbook.activeSheetId, atIndex: activeCell.row, count: 1, userId: currentUserId, userName: currentUserName } })} />
                            <RibbonButton label="Delete Column" icon="➖C" onClick={() => activeCell && dispatch({ type: ActionType.DELETE_COLUMN, payload: { sheetId: workbook.activeSheetId, atIndex: activeCell.col, count: 1, userId: currentUserId, userName: currentUserName } })} />
                        </RibbonGroup>
                        <RibbonGroup label="Charts">
                            <RibbonButton label="Column Chart" icon="📊" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'chartBuilder', props: { chartType: ChartType.BAR } } })} />
                            <RibbonButton label="Line Chart" icon="📈" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'chartBuilder', props: { chartType: ChartType.LINE } } })} />
                            <RibbonButton label="Pie Chart" icon="🥧" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'chartBuilder', props: { chartType: ChartType.PIE } } })} />
                        </RibbonGroup>
                        <RibbonGroup label="Other">
                            <RibbonButton label="Image" icon="🖼️" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'insertImage', props: {} } })} />
                            <RibbonButton label="Drawing" icon="✍️" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'insertDrawing', props: {} } })} />
                            <RibbonButton label="Link" icon="🔗" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'insertHyperlink', props: {} } })} />
                            <RibbonButton label="Sparkline" icon="📈" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'insertSparkline', props: {} } })} />
                        </RibbonGroup>
                    </div>
                );
            case 'data':
                return (
                    <div className="flex items-center space-x-2 p-2 border-t border-gray-700">
                        <RibbonGroup label="Sort & Filter">
                            <RibbonButton label="Sort A-Z" icon="⬇️Z" onClick={() => console.log('Sort A-Z')} />
                            <RibbonButton label="Sort Z-A" icon="⬆️A" onClick={() => console.log('Sort Z-A')} />
                            <RibbonButton label="Filter" icon=" funnel" onClick={() => console.log('Apply Filter')} />
                            <RibbonButton label="Clear Filter" icon="🧽" onClick={() => console.log('Clear Filter')} />
                        </RibbonGroup>
                        <RibbonGroup label="Data Tools">
                            <RibbonButton label="Data Validation" icon="✅" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'dataValidation', props: {} } })} />
                            <RibbonButton label="Remove Duplicates" icon="🧹" onClick={() => console.log('Remove Duplicates')} />
                            <RibbonButton label="Text to Columns" icon="📊" onClick={() => console.log('Text to Columns')} />
                            <RibbonButton label="Flash Fill" icon="⚡" onClick={() => console.log('Flash Fill')} />
                            <RibbonButton label="Goal Seek" icon="🎯" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'goalSeek', props: {} } })} />
                        </RibbonGroup>
                        <RibbonGroup label="Get External Data">
                            <RibbonButton label="From Databases" icon="🗄️" onClick={() => dispatch({ type: ActionType.SET_SIDEBAR_CONTENT, payload: 'data_sources' })} />
                            <RibbonButton label="From API" icon="🌐" onClick={() => dispatch({ type: ActionType.SET_SIDEBAR_CONTENT, payload: 'data_sources' })} />
                            <RibbonButton label="Refresh All" icon="🔄" onClick={() => console.log('Refresh all data sources')} />
                        </RibbonGroup>
                        <RibbonGroup label="Analysis">
                            <RibbonButton label="Pivot Table" icon="🅿️" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'pivotTableBuilder', props: {} } })} />
                            <RibbonButton label="What-If Analysis" icon="❓" onClick={() => console.log('What-If Analysis')} />
                        </RibbonGroup>
                    </div>
                );
            case 'formulas':
                return (
                    <div className="flex items-center space-x-2 p-2 border-t border-gray-700">
                        <RibbonGroup label="Function Library">
                            <RibbonButton label="Sum" icon="Σ" onClick={() => dispatch({ type: ActionType.SET_FORMULA_BAR_VALUE, payload: '=SUM()' })} />
                            <RibbonButton label="Average" icon="AVG" onClick={() => dispatch({ type: ActionType.SET_FORMULA_BAR_VALUE, payload: '=AVERAGE()' })} />
                            <RibbonButton label="More Functions" icon="f(x)" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'functionWizard', props: {} } })} />
                        </RibbonGroup>
                        <RibbonGroup label="Defined Names">
                            <RibbonButton label="Name Manager" icon="🏷️" onClick={() => dispatch({ type: ActionType.SET_SIDEBAR_CONTENT, payload: 'named_ranges' })} />
                            <RibbonButton label="Define Name" icon="➕🏷️" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'defineName', props: {} } })} />
                        </RibbonGroup>
                        <RibbonGroup label="Formula Auditing">
                            <RibbonButton label="Trace Precedents" icon="⬆️" onClick={() => console.log('Trace Precedents')} />
                            <RibbonButton label="Trace Dependents" icon="⬇️" onClick={() => console.log('Trace Dependents')} />
                            <RibbonButton label="Show Formulas" icon="Fx" onClick={() => currentSheet && dispatch({ type: ActionType.TOGGLE_GRIDLINES, payload: { sheetId: currentSheet.id, visibility: !currentSheet.displayFormulas } })} />
                            <RibbonButton label="Error Checking" icon="⚠️" onClick={() => console.log('Error Checking')} />
                        </RibbonGroup>
                        <RibbonGroup label="Calculation">
                            <RibbonButton label="Calculate Now" icon="➗" onClick={() => console.log('Force Calculate')} />
                            <RibbonDropdown label="Calculation Options" items={['Auto', 'Manual', 'On Change']} onSelect={(mode) => dispatch({ type: ActionType.UPDATE_WORKBOOK_SETTINGS, payload: { calculationMode: mode.toLowerCase() as WorkbookSettings['calculationMode'] } })} />
                        </RibbonGroup>
                    </div>
                );
            case 'view':
                return (
                    <div className="flex items-center space-x-2 p-2 border-t border-gray-700">
                        <RibbonGroup label="Show/Hide">
                            <RibbonButton label="Gridlines" icon="▦" onClick={() => currentSheet && dispatch({ type: ActionType.TOGGLE_GRIDLINES, payload: { sheetId: currentSheet.id, visibility: !currentSheet.gridlineVisibility } })} />
                            <RibbonButton label="Formula Bar" icon="☰" onClick={() => console.log('Toggle Formula Bar')} />
                            <RibbonButton label="Headings" icon="🅰️1" onClick={() => console.log('Toggle Headings')} />
                            <RibbonButton label="Comments" icon="💬" onClick={() => dispatch({ type: ActionType.SET_SIDEBAR_CONTENT, payload: 'comments' })} />
                        </RibbonGroup>
                        <RibbonGroup label="Zoom">
                            <RibbonButton label="Zoom In" icon="🔍+" onClick={() => dispatch({ type: ActionType.SET_ZOOM_LEVEL, payload: Math.min(state.zoomLevel + 0.1, 2.0) })} />
                            <RibbonButton label="Zoom Out" icon="🔍-" onClick={() => dispatch({ type: ActionType.SET_ZOOM_LEVEL, payload: Math.max(state.zoomLevel - 0.1, 0.5) })} />
                            <RibbonButton label="100%" icon="1️⃣0️⃣0️⃣" onClick={() => dispatch({ type: ActionType.SET_ZOOM_LEVEL, payload: 1.0 })} />
                        </RibbonGroup>
                        <RibbonGroup label="Window">
                            <RibbonButton label="Freeze Panes" icon="❄️" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'freezePanes', props: {} } })} />
                            <RibbonButton label="New Window" icon="🪟" onClick={() => console.log('Open New Window')} />
                            <RibbonButton label="Arrange All" icon="🗄️" onClick={() => console.log('Arrange Windows')} />
                        </RibbonGroup>
                    </div>
                );
            case 'automation':
                return (
                    <div className="flex items-center space-x-2 p-2 border-t border-gray-700">
                        <RibbonGroup label="Macros">
                            <RibbonButton label="Record Macro" icon="🔴" onClick={() => console.log('Record Macro')} />
                            <RibbonButton label="View Macros" icon="📜" onClick={() => dispatch({ type: ActionType.SET_SIDEBAR_CONTENT, payload: 'script_editor' })} />
                            <RibbonButton label="Run Macro" icon="▶️" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'macroRunner', props: {} } })} />
                        </RibbonGroup>
                        <RibbonGroup label="Scripts">
                            <RibbonButton label="Script Editor" icon="🧑‍💻" onClick={() => dispatch({ type: ActionType.SET_SIDEBAR_CONTENT, payload: 'script_editor' })} />
                            <RibbonButton label="Add-ons" icon="🧩" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'addonsManager', props: {} } })} />
                        </RibbonGroup>
                        <RibbonGroup label="Workflows">
                            <RibbonButton label="Create Workflow" icon="➡️" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'workflowBuilder', props: {} } })} />
                        </RibbonGroup>
                    </div>
                );
            case 'collaborate':
                return (
                    <div className="flex items-center space-x-2 p-2 border-t border-gray-700">
                        <RibbonGroup label="Sharing">
                            <RibbonButton label="Share" icon="👥" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'shareSettings', props: {} } })} />
                            <RibbonButton label="Publish to Web" icon="🌐" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'publishToWeb', props: {} } })} />
                        </RibbonGroup>
                        <RibbonGroup label="Comments">
                            <RibbonButton label="Add Comment" icon="💬+" onClick={() => dispatch({ type: ActionType.SET_SIDEBAR_CONTENT, payload: 'comments' })} />
                            <RibbonButton label="Show Comments" icon="💬" onClick={() => dispatch({ type: ActionType.SET_SIDEBAR_CONTENT, payload: 'comments' })} />
                        </RibbonGroup>
                        <RibbonGroup label="History">
                            <RibbonButton label="Version History" icon="🕰️" onClick={() => dispatch({ type: ActionType.SET_SIDEBAR_CONTENT, payload: 'history' })} />
                            <RibbonButton label="Track Changes" icon="✍️" onClick={() => console.log('Toggle Change Tracking')} />
                        </RibbonGroup>
                    </div>
                );
            case 'ai':
                return (
                    <div className="flex items-center space-x-2 p-2 border-t border-gray-700">
                        <RibbonGroup label="AI Tools">
                            <RibbonButton label="Analyze Data" icon="🧠" onClick={() => dispatch({ type: ActionType.SET_SIDEBAR_CONTENT, payload: 'ai_assistant' })} />
                            <RibbonButton label="Generate Formula" icon="✨Fx" onClick={() => dispatch({ type: ActionType.SET_SIDEBAR_CONTENT, payload: 'ai_assistant' })} />
                            <RibbonButton label="Clean Data" icon="🪄" onClick={() => dispatch({ type: ActionType.SET_SIDEBAR_CONTENT, payload: 'ai_assistant' })} />
                            <RibbonButton label="Summarize" icon="📝" onClick={() => dispatch({ type: ActionType.SET_SIDEBAR_CONTENT, payload: 'ai_assistant' })} />
                            <RibbonButton label="Translate" icon="🗣️" onClick={() => dispatch({ type: ActionType.SET_SIDEBAR_CONTENT, payload: 'ai_assistant' })} />
                        </RibbonGroup>
                        <RibbonGroup label="AI Settings">
                            <RibbonButton label="Settings" icon="⚙️" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'aiSettings', props: {} } })} />
                        </RibbonGroup>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-800 border-b border-gray-700 text-gray-200">
            <div className="flex border-b border-gray-700">
                {['file', 'home', 'insert', 'data', 'formulas', 'view', 'automation', 'collaborate', 'ai'].map(tab => (
                    <button
                        key={tab}
                        className={`px-4 py-2 text-sm uppercase ${activeRibbonTab === tab ? 'bg-gray-700 border-b-2 border-blue-500 text-white' : 'hover:bg-gray-700'}`}
                        onClick={() => dispatch({ type: ActionType.SET_ACTIVE_RIBBON_TAB, payload: tab as SpreadsheetState['activeRibbonTab'] })}
                    >
                        {tab}
                    </button>
                ))}
                <div className="flex-grow flex justify-end items-center pr-4">
                    <button className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded mr-2" onClick={() => dispatch({type: ActionType.UNDO})}>Undo</button>
                    <button className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded" onClick={() => dispatch({type: ActionType.REDO})}>Redo</button>
                    <button className="text-sm ml-4 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded" onClick={() => dispatch({type: ActionType.OPEN_FIND_REPLACE})}>Find/Replace</button>
                </div>
            </div>
            {renderTabContent()}
        </div>
    );
};

// Helper components for Ribbon
export const RibbonGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="border border-gray-700 rounded p-1 flex flex-col items-center justify-center min-w-[80px] h-[90px]">
        <div className="flex flex-wrap justify-center space-x-1 space-y-1">{children}</div>
        <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
);

export const RibbonButton: React.FC<{ label: string; icon: string; onClick: () => void; className?: string }> = ({ label, icon, onClick, className }) => (
    <button className={`flex flex-col items-center text-xs p-1 hover:bg-gray-600 rounded ${className}`} onClick={onClick}>
        <span className="text-lg">{icon}</span>
        <span>{label}</span>
    </button>
);

export const RibbonDropdown: React.FC<{ label: string; items: string[]; onSelect: (item: string) => void }> = ({ label, items, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button className="flex flex-col items-center text-xs p-1 hover:bg-gray-600 rounded min-w-[50px]" onClick={() => setIsOpen(!isOpen)}>
                <span>{label}</span>
                <span>▼</span>
            </button>
            {isOpen && (
                <div className="absolute z-10 bg-gray-700 border border-gray-600 rounded shadow-lg mt-1 min-w-[120px] max-h-60 overflow-y-auto">
                    {items.map(item => (
                        <button
                            key={item}
                            className="block w-full text-left px-3 py-1 text-sm hover:bg-blue-600"
                            onClick={() => { onSelect(item); setIsOpen(false); }}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const RibbonColorPicker: React.FC<{ label: string; onSelect: (color: string) => void }> = ({ label, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState('#ffffff');
    const colors = ['#ffffff', '#ffcccb', '#ccffcc', '#cceeff', '#ffffcc', '#ffccff', '#cccccc', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#808080', '#800000', '#008000', '#000080', '#808000', '#800080', '#008080'];
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                className="flex flex-col items-center text-xs p-1 hover:bg-gray-600 rounded min-w-[50px]"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="w-4 h-4 rounded border border-gray-500" style={{ backgroundColor: selectedColor }}></div>
                <span>{label}</span>
            </button>
            {isOpen && (
                <div className="absolute z-10 bg-gray-700 border border-gray-600 rounded shadow-lg mt-1 p-2 grid grid-cols-7 gap-1">
                    {colors.map(color => (
                        <div
                            key={color}
                            className="w-5 h-5 rounded cursor-pointer border border-gray-500"
                            style={{ backgroundColor: color }}
                            onClick={() => { setSelectedColor(color); onSelect(color); setIsOpen(false); }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


// Formula Bar Component
export const FormulaBar: React.FC = () => {
    const { state, dispatch, getCurrentCellData, getCurrentSheet, getCellId } = useSpreadsheet();
    const { activeCell, formulaBarValue, isEditing, currentUserId, currentUserName } = state;
    const formulaBarRef = useRef<HTMLInputElement>(null);
    const sheet = getCurrentSheet();

    // Update formula bar when active cell changes
    useEffect(() => {
        if (activeCell && sheet) {
            const cellData = getCurrentCellData(activeCell);
            if (cellData) {
                dispatch({ type: ActionType.SET_FORMULA_BAR_VALUE, payload: cellData.rawInput || cellData.value?.toString() || '' });
            } else {
                dispatch({ type: ActionType.SET_FORMULA_BAR_VALUE, payload: '' });
            }
        } else {
            dispatch({ type: ActionType.SET_FORMULA_BAR_VALUE, payload: '' });
        }
    }, [activeCell, sheet, getCurrentCellData, dispatch]);

    const handleFormulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: ActionType.SET_FORMULA_BAR_VALUE, payload: e.target.value });
    };

    const handleFormulaSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeCell && sheet) {
            const currentCellId = getCellId(activeCell);
            const rawInput = formulaBarValue;

            let cellUpdate: Partial<SpreadsheetCell> = { rawInput };
            if (rawInput.startsWith('=')) {
                const { value, error, dataType, dependencies } = parseAndEvaluateFormula(rawInput, sheet.data, sheet.id);
                cellUpdate = {
                    ...cellUpdate,
                    formula: rawInput,
                    value: value,
                    type: error ? CellContentType.ERROR : CellContentType.FORMULA,
                    dataType: dataType,
                    error: error ? { type: 'FormulaError', message: error } : undefined,
                    dependencies: dependencies
                };
            } else {
                // Attempt to infer data type
                let value: any = rawInput;
                let dataType: CellDataType = CellDataType.TEXT;
                if (!isNaN(Number(rawInput)) && rawInput.trim() !== '') {
                    value = Number(rawInput);
                    dataType = CellDataType.NUMBER;
                } else if (rawInput.toLowerCase() === 'true' || rawInput.toLowerCase() === 'false') {
                    value = rawInput.toLowerCase() === 'true';
                    dataType = CellDataType.BOOLEAN;
                } else if (!isNaN(Date.parse(rawInput))) {
                    value = new Date(rawInput);
                    dataType = CellDataType.DATE;
                }
                cellUpdate = {
                    ...cellUpdate,
                    value: value,
                    type: CellContentType.VALUE,
                    dataType: dataType,
                    formula: undefined,
                    error: undefined,
                    dependencies: [],
                };
            }

            dispatch({
                type: ActionType.UPDATE_CELL,
                payload: { sheetId: sheet.id, coords: activeCell, data: cellUpdate, userId: currentUserId, userName: currentUserName }
            });
            dispatch({ type: ActionType.SET_EDITING_MODE, payload: false });
            // Re-focus grid after editing
            // document.getElementById('spreadsheet-grid')?.focus();
        }
    };

    // Auto-focus formula bar if a cell is being edited via keyboard
    useEffect(() => {
        if (isEditing && formulaBarRef.current) {
            formulaBarRef.current.focus();
        }
    }, [isEditing]);

    return (
        <div className="flex items-center bg-gray-800 border-b border-gray-700 p-2 text-gray-200">
            <span className="font-bold w-12 text-center">
                {activeCell ? getCellId(activeCell) : 'A1'}
            </span>
            <form onSubmit={handleFormulaSubmit} className="flex-grow ml-2">
                <input
                    ref={formulaBarRef}
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white focus:outline-none focus:border-blue-500"
                    value={formulaBarValue}
                    onChange={handleFormulaChange}
                    onFocus={() => dispatch({ type: ActionType.SET_EDITING_MODE, payload: true })}
                    onBlur={(e) => {
                        // Only exit editing mode if blur is not caused by submitting the form (which would handle its own dispatch)
                        // A more robust solution might involve checking relatedTarget
                        if (!e.relatedTarget || e.relatedTarget.tagName !== 'BUTTON') { // Simplified check
                            dispatch({ type: ActionType.SET_EDITING_MODE, payload: false });
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            // Revert to original cell value and exit edit mode
                            if (activeCell && sheet) {
                                const cellData = getCurrentCellData(activeCell);
                                dispatch({ type: ActionType.SET_FORMULA_BAR_VALUE, payload: cellData?.rawInput || cellData?.value?.toString() || '' });
                            }
                            dispatch({ type: ActionType.SET_EDITING_MODE, payload: false });
                            // document.getElementById('spreadsheet-grid')?.focus(); // Re-focus the grid
                            e.stopPropagation(); // Prevent grid from handling escape
                        }
                    }}
                />
            </form>
            <button className="ml-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm" onClick={handleFormulaSubmit}>Enter</button>
        </div>
    );
};

// Sheet Tabs Component
export const SheetTabs: React.FC = () => {
    const { state, dispatch } = useSpreadsheet();
    const { sheets, activeSheetId } = state.workbook;
    const { currentUserId, currentUserName } = state;

    const handleAddSheet = () => {
        const newSheetId = `sheet-${Date.now()}`;
        const newSheetName = `Sheet ${sheets.length + 1}`;
        const newSheet: Sheet = {
            id: newSheetId,
            name: newSheetName,
            data: {},
            dimensions: { rows: DEFAULT_ROWS, cols: DEFAULT_COLS },
            mergedCells: [],
            rowMetadata: {},
            colMetadata: {},
            filters: [],
            sortOrders: [],
            charts: [],
            drawings: [],
            gridlineVisibility: true,
        };
        dispatch({ type: ActionType.ADD_SHEET, payload: newSheet });
        dispatch({ type: ActionType.ADD_NOTIFICATION, payload: { id: Date.now().toString(), message: `Sheet '${newSheetName}' added.`, type: 'success' } });
    };

    const handleDeleteSheet = (sheetId: string) => {
        if (state.workbook.sheets.length <= 1) {
            dispatch({ type: ActionType.ADD_NOTIFICATION, payload: { id: Date.now().toString(), message: 'Cannot delete the last sheet.', type: 'warning' } });
            return;
        }
        if (window.confirm('Are you sure you want to delete this sheet?')) {
            // Simplified deletion logic, a real app would handle re-indexing sheets, updating activeSheetId carefully
            const sheetToDelete = state.workbook.sheets.find(s => s.id === sheetId);
            if (!sheetToDelete) return;
            const updatedSheets = state.workbook.sheets.filter(s => s.id !== sheetId);
            const newActiveSheetId = updatedSheets[0]?.id || '';
            dispatch({ type: ActionType.SET_WORKBOOK, payload: { ...state.workbook, sheets: updatedSheets, activeSheetId: newActiveSheetId } });
            dispatch({ type: ActionType.ADD_NOTIFICATION, payload: { id: Date.now().toString(), message: `Sheet '${sheetToDelete.name}' deleted.`, type: 'info' } });

            const change: ChangeLogEntry = {
                id: `change-${Date.now()}-${Math.random()}`,
                type: ChangeType.SHEET_DELETE,
                userId: currentUserId, userName: currentUserName, timestamp: new Date(), sheetId: sheetToDelete.id,
                details: { sheetName: sheetToDelete.name }
            };
            dispatch({ type: ActionType.ADD_CHANGE_TO_HISTORY, payload: [change] });
        }
    };

    return (
        <div className="flex items-center bg-gray-800 border-t border-gray-700 p-2 text-gray-200 overflow-x-auto min-h-[48px]">
            <div className="flex-grow flex items-center">
                {sheets.map(sheet => (
                    <div key={sheet.id} className="relative group">
                        <button
                            className={`px-4 py-2 mx-1 rounded-t-lg text-sm ${sheet.id === activeSheetId ? 'bg-gray-700 border-blue-500 border-t-2 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}
                            onClick={() => dispatch({ type: ActionType.SET_ACTIVE_SHEET, payload: sheet.id })}
                        >
                            {sheet.name}
                        </button>
                        {sheets.length > 1 && sheet.id !== activeSheetId && ( // Only show delete for inactive sheets and if more than one exists
                            <button
                                className="absolute top-0 right-0 -mt-1 -mr-1 text-xs text-gray-400 hover:text-red-500 bg-gray-800 rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                onClick={() => handleDeleteSheet(sheet.id)}
                                title="Delete Sheet"
                            >
                                &times;
                            </button>
                        )}
                    </div>
                ))}
                <button
                    className="px-3 py-2 mx-1 rounded-lg bg-gray-600 hover:bg-gray-500 text-sm"
                    onClick={handleAddSheet}
                    title="Add New Sheet"
                >
                    ➕
                </button>
            </div>
            <div className="flex-shrink-0 ml-4 text-xs text-gray-400">
                <span>Workbook ID: {state.workbook.id}</span>
            </div>
        </div>
    );
};

// Sidebar Component
export const Sidebar: React.FC = () => {
    const { state, dispatch } = useSpreadsheet();
    const { sidebarOpen, sidebarContent, currentUserId, currentUserName, activeCell, workbook } = state;
    const currentSheet = state.workbook.sheets.find(s => s.id === state.workbook.activeSheetId);
    const cellId = activeCell ? getCellId(activeCell) : '';
    const cellComments = currentSheet?.data[cellId]?.comments || [];

    if (!sidebarOpen) return null;

    const renderContent = () => {
        switch (sidebarContent) {
            case 'comments':
                return (
                    <div className="p-4">
                        <h3 className="text-lg font-bold mb-4">Comments for {cellId}</h3>
                        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {cellComments.length === 0 && <p className="text-gray-400">No comments for this cell.</p>}
                            {cellComments.map((comment, index) => (
                                <div key={comment.id} className="bg-gray-700 p-3 rounded-md">
                                    <p className="text-sm text-gray-300"><strong>{comment.author}</strong> <span className="text-xs text-gray-400 ml-2">{comment.timestamp.toLocaleString()}</span></p>
                                    <p className="text-gray-100 mt-1">{comment.content}</p>
                                    <button className="text-blue-400 text-xs mt-1 hover:underline">Reply</button>
                                    {/* Render replies */}
                                </div>
                            ))}
                            <div className="bg-gray-700 p-3 rounded-md">
                                <p className="text-sm text-gray-300"><strong>{currentUserName}</strong></p>
                                <textarea
                                    className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white"
                                    placeholder="Add a comment..."
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            const newComment: CellComment = {
                                                id: `comment-${Date.now()}-${Math.random()}`,
                                                author: currentUserName,
                                                timestamp: new Date(),
                                                content: (e.target as HTMLTextAreaElement).value,
                                            };
                                            if (activeCell && currentSheet) {
                                                dispatch({ type: ActionType.ADD_COMMENT, payload: { sheetId: currentSheet.id, cellId, comment: newComment, userId: currentUserId, userName: currentUserName } });
                                                (e.target as HTMLTextAreaElement).value = ''; // Clear input
                                            }
                                        }
                                    }}
                                ></textarea>
                                <button className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm" onClick={() => console.log('Post Comment for real')}>Post Comment</button>
                            </div>
                        </div>
                    </div>
                );
            case 'history':
                return (
                    <div className="p-4">
                        <h3 className="text-lg font-bold mb-4">Version History</h3>
                        <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {state.undoStack.slice().reverse().map((batch, index) => (
                                <div key={index} className="bg-gray-700 p-2 rounded-md">
                                    <p className="text-sm text-gray-300">
                                        <strong>{batch[0]?.userName || 'Unknown User'}</strong> {batch[0]?.type.replace(/_/g, ' ').toLowerCase()} at {batch[0]?.timestamp.toLocaleTimeString()}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {batch.length > 1 ? `${batch.length} changes` : batch[0]?.details?.cellId ? `Cell ${batch[0].details.cellId}: "${batch[0].details.oldValue}" to "${batch[0].details.newValue}"` : JSON.stringify(batch[0]?.details)}
                                    </p>
                                    <button className="text-blue-400 text-xs mt-1 hover:underline" onClick={() => console.log('View full details', batch)}>View Details</button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-between">
                            <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">Restore This Version</button>
                            <button className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm">Manage Versions</button>
                        </div>
                    </div>
                );
            case 'data_analysis':
                return (
                    <div className="p-4">
                        <h3 className="text-lg font-bold mb-4">Data Analysis Tools</h3>
                        <div className="space-y-3">
                            <p className="text-gray-300">Select a range to get insights or run analysis.</p>
                            <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded" onClick={() => console.log('Run descriptive stats for', state.selectedCells)}>Run Descriptive Statistics</button>
                            <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded" onClick={() => console.log('Perform Regression Analysis for', state.selectedCells)}>Perform Regression Analysis</button>
                            <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'pivotTableBuilder', props: {} } })}>Create Pivot Table</button>
                            <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'dataCleaner', props: {} } })}>Data Cleaner</button>
                        </div>
                    </div>
                );
            case 'plugins':
                return (
                    <div className="p-4">
                        <h3 className="text-lg font-bold mb-4">Installed Plugins</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-200 max-h-[calc(100vh-200px)] overflow-y-auto">
                            <li><span className="font-bold">Weather API Connector:</span> Fetch live weather data. <button className="ml-2 text-xs text-blue-400 hover:underline">Configure</button></li>
                            <li><span className="font-bold">Google Analytics Importer:</span> Sync GA data. <button className="ml-2 text-xs text-blue-400 hover:underline">Configure</button></li>
                            <li><span className="font-bold">Custom Chart Library:</span> More chart types.</li>
                            <li><span className="font-bold">CRM Integration:</span> Sync customer data.</li>
                            <li><span className="font-bold">Image Recognition:</span> Analyze images in cells.</li>
                        </ul>
                        <button className="mt-4 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'pluginMarketplace', props: {} } })}>Manage Plugins</button>
                    </div>
                );
            case 'ai_assistant':
                return (
                    <div className="p-4">
                        <h3 className="text-lg font-bold mb-4">AI Assistant</h3>
                        <div className="space-y-3">
                            <p className="text-gray-300">How can I help you with your data today?</p>
                            <textarea
                                className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white resize-y min-h-[80px]"
                                placeholder="e.g., 'Summarize column C', 'Predict next quarter sales', 'Clean dates in A1:A10', 'Generate a bar chart for A1:B5'"
                            ></textarea>
                            <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded" onClick={() => console.log('Ask AI')}>Ask AI</button>
                            <div className="mt-4 bg-gray-700 p-3 rounded-md text-sm text-gray-200 max-h-[calc(100vh-450px)] overflow-y-auto">
                                <strong>AI Response:</strong>
                                <p className="mt-1">Based on the selected range (B2:B10), the average value is 123.45. There are 2 outliers detected. Would you like me to remove them?</p>
                                <div className="mt-2 space-x-2">
                                    <button className="text-blue-400 text-xs hover:underline">Yes</button>
                                    <button className="text-blue-400 text-xs hover:underline">No</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'named_ranges':
                return (
                    <div className="p-4">
                        <h3 className="text-lg font-bold mb-4">Named Ranges</h3>
                        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm mb-4" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'defineName', props: {} } })}>+ Add New Range</button>
                        <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
                            {workbook.namedRanges.length === 0 && <p className="text-gray-400">No named ranges defined.</p>}
                            {workbook.namedRanges.map(nr => (
                                <div key={nr.name} className="bg-gray-700 p-3 rounded-md">
                                    <p className="font-bold text-gray-200">{nr.name}</p>
                                    <p className="text-sm text-gray-400">{nr.range.sheetId}!{getCellId(nr.range.start)}:{getCellId(nr.range.end)}</p>
                                    <p className="text-xs text-gray-500">{nr.description}</p>
                                    <div className="mt-2 space-x-2">
                                        <button className="text-blue-400 text-xs hover:underline">Edit</button>
                                        <button className="text-red-400 text-xs hover:underline">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'data_sources':
                return (
                    <div className="p-4">
                        <h3 className="text-lg font-bold mb-4">Data Sources & Queries</h3>
                        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm mb-4" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'connectDataSource', props: {} } })}>+ Connect New Source</button>
                        <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
                            {state.workbook.dataSources?.length === 0 && <p className="text-gray-400">No data sources connected.</p>}
                            {state.workbook.dataSources?.map(ds => (
                                <div key={ds.id} className="bg-gray-700 p-3 rounded-md">
                                    <p className="font-bold text-gray-200">{ds.name} ({ds.type})</p>
                                    <p className="text-sm text-gray-400">Last Sync: {ds.lastSync?.toLocaleString() || 'Never'}</p>
                                    <div className="mt-2 space-x-2">
                                        <button className="text-blue-400 text-xs hover:underline">Manage Queries</button>
                                        <button className="text-blue-400 text-xs hover:underline">Edit Connection</button>
                                        <button className="text-red-400 text-xs hover:underline">Disconnect</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'script_editor':
                return (
                    <div className="p-4">
                        <h3 className="text-lg font-bold mb-4">Script Editor ({workbook.scriptProject?.language || 'JavaScript'})</h3>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-gray-200">Scripts</h4>
                            <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm" onClick={() => dispatch({ type: ActionType.OPEN_DIALOG, payload: { type: 'newScript', props: {} } })}>+ New Script</button>
                        </div>
                        <ul className="space-y-2 text-gray-200 max-h-40 overflow-y-auto border border-gray-600 p-2 rounded">
                            {workbook.scriptProject?.scripts.map(script => (
                                <li key={script.name} className="flex justify-between items-center">
                                    <span className="font-mono">{script.name}()</span>
                                    <div className="space-x-2">
                                        <button className="text-blue-400 text-xs hover:underline" onClick={() => console.log('Edit Script', script.name)}>Edit</button>
                                        <button className="text-green-400 text-xs hover:underline" onClick={() => console.log('Run Script', script.name)}>Run</button>
                                    </div>
                                </li>
                            ))}
                            {(!workbook.scriptProject || workbook.scriptProject.scripts.length === 0) && <li className="text-gray-400">No scripts found.</li>}
                        </ul>
                        <div className="mt-4">
                            <h4 className="font-semibold text-gray-200 mb-2">Editor</h4>
                            <textarea
                                className="w-full h-64 bg-gray-900 border border-gray-600 rounded p-2 font-mono text-green-300 text-sm"
                                defaultValue={workbook.scriptProject?.scripts[0]?.code || '// Write your script here...'}
                                placeholder="function myFunction() { /* your code */ }"
                            ></textarea>
                        </div>
                        <div className="flex justify-end mt-4 space-x-2">
                            <button className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded" onClick={() => console.log('Save Script')}>Save</button>
                            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded" onClick={() => console.log('Execute Script')}>Execute</button>
                        </div>
                    </div>
                );
            default:
                return <p className="p-4 text-gray-400">Select a sidebar content type from the Ribbon.</p>;
        }
    };

    return (
        <div className={`fixed right-0 top-0 h-full bg-gray-800 border-l border-gray-700 w-96 shadow-lg z-50 transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}>
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">
                    {sidebarContent?.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </h2>
                <button className="text-gray-400 hover:text-white text-2xl" onClick={() => dispatch({ type: ActionType.TOGGLE_SIDEBAR, payload: null })}>
                    &times;
                </button>
            </div>
            <div className="overflow-y-auto h-[calc(100vh-64px)]"> {/* Adjust height based on header */}
                {renderContent()}
            </div>
        </div>
    );
};

// Dialogs Manager (for various pop-ups)
export const DialogManager: React.FC = () => {
    const { state, dispatch, getCellId } = useSpreadsheet();
    const { dialogOpen, selectedCells, activeCell, workbook, currentUserId, currentUserName } = state;

    if (!dialogOpen) return null;

    const closeDialog = () => dispatch({ type: ActionType.CLOSE_DIALOG });

    const getTargetRangeString = () => {
        if (selectedCells) return `${selectedCells.sheetId}!${getCellId(selectedCells.start)}:${getCellId(selectedCells.end)}`;
        if (activeCell) return `${workbook.activeSheetId}!${getCellId(activeCell)}`;
        return '';
    };

    const renderDialogContent = () => {
        switch (dialogOpen.type) {
            case 'chartBuilder':
                return (
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-4">Chart Builder ({dialogOpen.props.chartType || 'Custom'})</h3>
                        <label className="block text-sm font-medium mb-1">Data range:</label>
                        <input type="text" className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white my-2" placeholder="e.g., Sheet1!A1:B10" defaultValue={getTargetRangeString()} />
                        <label className="block mt-4 mb-2">Chart Title:</label>
                        <input type="text" className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white" />
                        <label className="block mt-4 mb-2">Chart Type:</label>
                        <select className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white" defaultValue={dialogOpen.props.chartType}>
                            {Object.values(ChartType).map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                        <div className="flex justify-end mt-6 space-x-2">
                            <button className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded" onClick={closeDialog}>Cancel</button>
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded" onClick={() => { console.log('Create Chart with range', getTargetRangeString()); closeDialog(); }}>Create Chart</button>
                        </div>
                    </div>
                );
            case 'dataValidation':
                return (
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-4">Data Validation Rules</h3>
                        <p className="text-gray-300">Apply validation to: <span className="font-bold">{getTargetRangeString()}</span></p>
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">Rule Type:</label>
                            <select className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white">
                                {Object.values(ValidationRuleType).map(type => <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>)}
                            </select>
                            <label className="block text-sm font-medium mt-2 mb-1">Criteria (e.g., Min, Max, List items, Formula):</label>
                            <input type="text" className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white" placeholder="e.g., 0, 100 or 'Red, Green, Blue'" />
                        </div>
                        <div className="flex justify-end mt-6 space-x-2">
                            <button className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded" onClick={closeDialog}>Cancel</button>
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded" onClick={() => { console.log('Apply Data Validation'); closeDialog(); }}>Apply</button>
                        </div>
                    </div>
                );
            case 'macroEditor': // This is now likely handled by Script Editor sidebar
                return (
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-4">Macro Editor - Deprecated</h3>
                        <p className="text-gray-400">Please use the new "Automation" ribbon tab and "Script Editor" sidebar for macro and script management.</p>
                        <div className="flex justify-end mt-4 space-x-2">
                            <button className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded" onClick={closeDialog}>Close</button>
                        </div>
                    </div>
                );
            case 'shareSettings':
                return (
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-4">Share Spreadsheet</h3>
                        <label className="block text-sm font-medium mb-1">Share with people:</label>
                        <input type="email" placeholder="Enter names or email addresses" className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white" />
                        <label className="block text-sm font-medium mt-4 mb-1">Permissions:</label>
                        <select className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white">
                            <option>Can view</option>
                            <option>Can comment</option>
                            <option>Can edit</option>
                            <option>Owner</option>
                        </select>
                        <div className="mt-4 flex items-center">
                            <input type="checkbox" id="linkSharing" className="mr-2" />
                            <label htmlFor="linkSharing" className="text-sm">Anyone with the link can view</label>
                        </div>
                        <div className="flex justify-end mt-6 space-x-2">
                            <button className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded" onClick={closeDialog}>Cancel</button>
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded" onClick={() => { console.log('Share'); closeDialog(); }}>Share</button>
                        </div>
                    </div>
                );
            case 'conditionalFormattingManager':
                return (
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-4">Conditional Formatting Rules</h3>
                        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm mb-4" onClick={() => console.log('Add new rule')}>+ New Rule</button>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            <div className="bg-gray-700 p-3 rounded-md">
                                <p className="font-bold">Highlight values &gt; 100</p>
                                <p className="text-sm text-gray-400">Applies to: {getTargetRangeString()}</p>
                                <div className="mt-2 space-x-2">
                                    <button className="text-blue-400 text-xs hover:underline">Edit</button>
                                    <button className="text-red-400 text-xs hover:underline">Delete</button>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6 space-x-2">
                            <button className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded" onClick={closeDialog}>Close</button>
                        </div>
                    </div>
                );
            case 'workbookSettings':
                return (
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-4">Workbook Settings</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Locale:</label>
                                <input type="text" className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white" defaultValue={state.workbook.workbookSettings.locale} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Timezone:</label>
                                <input type="text" className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white" defaultValue={state.workbook.workbookSettings.timezone} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Calculation Mode:</label>
                                <select className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white" defaultValue={state.workbook.workbookSettings.calculationMode}>
                                    <option value="auto">Automatic</option>
                                    <option value="manual">Manual</option>
                                    <option value="on_change">On Change</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Security Policy:</label>
                                <select className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white" defaultValue={state.workbook.workbookSettings.securityPolicy?.scriptExecution}>
                                    <option value="allow">Allow All Scripts</option>
                                    <option value="warn">Warn Before Running Scripts</option>
                                    <option value="deny">Deny All Scripts</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6 space-x-2">
                            <button className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded" onClick={closeDialog}>Cancel</button>
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded" onClick={() => { console.log('Save Workbook Settings'); closeDialog(); }}>Save</button>
                        </div>
                    </div>
                );
            case 'pivotTableBuilder':
                return (
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-4">Pivot Table Builder</h3>
                        <label className="block text-sm font-medium mb-1">Data Source Range:</label>
                        <input type="text" className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white mb-4" placeholder="e.g., Sheet1!A1:D10" defaultValue={getTargetRangeString()} />

                        <label className="block text-sm font-medium mb-1">Destination:</label>
                        <input type="text" className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white mb-4" placeholder="e.g., New Sheet or Sheet2!A1" />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-gray-200 mb-2">Rows</h4>
                                <div className="bg-gray-700 p-2 rounded min-h-[80px]">Drag fields here</div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-200 mb-2">Columns</h4>
                                <div className="bg-gray-700 p-2 rounded min-h-[80px]">Drag fields here</div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-200 mb-2">Values</h4>
                                <div className="bg-gray-700 p-2 rounded min-h-[80px]">Drag fields here</div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-200 mb-2">Filters</h4>
                                <div className="bg-gray-700 p-2 rounded min-h-[80px]">Drag fields here</div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6 space-x-2">
                            <button className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded" onClick={closeDialog}>Cancel</button>
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded" onClick={() => { console.log('Create Pivot Table'); closeDialog(); }}>Create</button>
                        </div>
                    </div>
                );
            // ... extend with more dialogs (insertImage, insertDrawing, insertHyperlink, insertSparkline, functionWizard, defineName, connectDataSource, newScript, etc.)
            default:
                return <p className="p-6">Unknown dialog type: {dialogOpen.type}</p>;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg text-white">
                {renderDialogContent()}
            </div>
        </div>
    );
};

// Notifications Area
export const Notifications: React.FC = () => {
    const { state, dispatch } = useSpreadsheet();
    const { notifications } = state;

    return (
        <div className="fixed bottom-4 right-4 z-50 space-y-2 w-72">
            {notifications.map(notification => (
                <div
                    key={notification.id}
                    className={`p-3 rounded-md shadow-md flex items-center justify-between text-sm ${
                        notification.type === 'error' ? 'bg-red-700' :
                        notification.type === 'warning' ? 'bg-yellow-600' :
                        notification.type === 'success' ? 'bg-green-600' :
                        'bg-blue-600'
                    } text-white`}
                >
                    <span>{notification.message}</span>
                    <button className="ml-4 text-lg" onClick={() => dispatch({ type: ActionType.REMOVE_NOTIFICATION, payload: notification.id })}>
                        &times;
                    </button>
                </div>
            ))}
        </div>
    );
};

// Find/Replace Component
export const FindReplaceBar: React.FC = () => {
    const { state, dispatch } = useSpreadsheet();
    const { findReplace } = state;

    if (!findReplace?.isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: ActionType.UPDATE_FIND_REPLACE_SETTINGS, payload: { [e.target.name]: e.target.value } });
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: ActionType.UPDATE_FIND_REPLACE_SETTINGS, payload: { [e.target.name]: e.target.checked } });
    };

    const handleFind = () => {
        dispatch({ type: ActionType.UPDATE_STATUS_MESSAGE, payload: { text: `Finding "${findReplace.findText}"...`, type: 'info' } });
        console.log('Perform Find:', findReplace);
    };

    const handleReplace = () => {
        dispatch({ type: ActionType.UPDATE_STATUS_MESSAGE, payload: { text: `Replacing "${findReplace.findText}" with "${findReplace.replaceText}"...`, type: 'info' } });
        console.log('Perform Replace:', findReplace);
    };

    const handleReplaceAll = () => {
        dispatch({ type: ActionType.UPDATE_STATUS_MESSAGE, payload: { text: `Replacing all "${findReplace.findText}" with "${findReplace.replaceText}"...`, type: 'info' } });
        console.log('Perform Replace All:', findReplace);
    };

    return (
        <div className="fixed top-20 right-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 z-50 w-80 text-white">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold">Find & Replace</h4>
                <button className="text-gray-400 hover:text-white text-xl" onClick={() => dispatch({ type: ActionType.CLOSE_FIND_REPLACE })}>&times;</button>
            </div>
            <div className="mb-2">
                <label htmlFor="findText" className="block text-sm text-gray-400">Find:</label>
                <input type="text" id="findText" name="findText" value={findReplace.findText} onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="mb-4">
                <label htmlFor="replaceText" className="block text-sm text-gray-400">Replace with:</label>
                <input type="text" id="replaceText" name="replaceText" value={findReplace.replaceText} onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex items-center mb-4 text-sm space-x-4">
                <div>
                    <input type="checkbox" id="matchCase" name="matchCase" checked={findReplace.matchCase} onChange={handleCheckboxChange} className="mr-2" />
                    <label htmlFor="matchCase">Match case</label>
                </div>
                <div>
                    <input type="checkbox" id="wholeWord" name="wholeWord" checked={findReplace.wholeWord} onChange={handleCheckboxChange} className="mr-2" />
                    <label htmlFor="wholeWord">Whole word</label>
                </div>
            </div>
            <div className="flex justify-end space-x-2">
                <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm" onClick={handleFind}>Find Next</button>
                <button className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm" onClick={handleReplace}>Replace</button>
                <button className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm" onClick={handleReplaceAll}>Replace All</button>
            </div>
        </div>
    );
};


// StatusBar Component
export const StatusBar: React.FC = () => {
    const { state } = useSpreadsheet();
    const currentSheet = state.workbook.sheets.find(s => s.id === state.workbook.activeSheetId);
    const numRows = currentSheet?.dimensions.rows || DEFAULT_ROWS;
    const numCols = currentSheet?.dimensions.cols || DEFAULT_COLS;
    const onlineCollaborators = state.workbook.collaborators.filter(c => c.status !== 'offline' && c.userId !== state.currentUserId);

    return (
        <div className="bg-gray-800 border-t border-gray-700 p-2 text-gray-400 flex justify-between items-center text-xs h-8">
            <div className="flex items-center space-x-4">
                {state.statusMessage && (
                    <span className={`px-2 py-0.5 rounded ${
                        state.statusMessage.type === 'error' ? 'bg-red-700' :
                        state.statusMessage.type === 'warning' ? 'bg-yellow-600' :
                        state.statusMessage.type === 'success' ? 'bg-green-600' :
                        'bg-blue-600'
                    } text-white`}>
                        {state.statusMessage.text}
                    </span>
                )}
                <span>Workbook: {state.workbook.name}</span>
                {onlineCollaborators.length > 0 && (
                    <span className="ml-4">👥 {onlineCollaborators.length} Collaborator(s) Online</span>
                )}
            </div>
            <div className="flex items-center space-x-4">
                <span>Cells: {numRows} Rows x {numCols} Columns</span>
                <span>Zoom: {Math.round(state.zoomLevel * 100)}%</span>
                <button onClick={() => console.log('Show help')} className="text-gray-400 hover:text-white">Help</button>
            </div>
        </div>
    );
};

// CellRenderer and Grid rendering logic. This is where Cell components would be rendered.
// It needs to handle selection, active cell, merged cells, row/column visibility, etc.
export const SpreadsheetGrid: React.FC = () => {
    const { state, dispatch, getCurrentSheet, getCurrentCellData, getCellId } = useSpreadsheet();
    const { activeCell, selectedCells, workbook, isEditing, currentUserId, currentUserName } = state;
    const sheet = getCurrentSheet();
    const gridRef = useRef<HTMLDivElement>(null);

    if (!sheet) return <div className="text-center text-gray-500 p-4">Select a sheet to view its content.</div>;

    const { dimensions, data, mergedCells, rowMetadata, colMetadata, gridlineVisibility } = sheet;

    const handleCellClick = (row: number, col: number) => {
        dispatch({ type: ActionType.SET_ACTIVE_CELL, payload: { row, col } });
        dispatch({ type: ActionType.SET_SELECTED_CELLS, payload: { start: { row, col }, end: { row, col }, sheetId: sheet.id } });
        dispatch({ type: ActionType.SET_EDITING_MODE, payload: false });
    };

    const handleCellDoubleClick = (row: number, col: number) => {
        dispatch({ type: ActionType.SET_ACTIVE_CELL, payload: { row, col } });
        dispatch({ type: ActionType.SET_EDITING_MODE, payload: true });
        // The formula bar will pick up the cell content
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!activeCell || isEditing) return;

        let newRow = activeCell.row;
        let newCol = activeCell.col;
        let shouldUpdate = false;

        switch (e.key) {
            case 'ArrowUp': newRow = Math.max(0, newRow - 1); shouldUpdate = true; break;
            case 'ArrowDown': newRow = Math.min(dimensions.rows - 1, newRow + 1); shouldUpdate = true; break;
            case 'ArrowLeft': newCol = Math.max(0, newCol - 1); shouldUpdate = true; break;
            case 'ArrowRight': newCol = Math.min(dimensions.cols - 1, newCol + 1); shouldUpdate = true; break;
            case 'Enter': // Move down after edit, or enter edit mode
                dispatch({ type: ActionType.SET_EDITING_MODE, payload: true });
                e.preventDefault(); // Prevent default form submission if any
                return;
            case 'Tab': // Move right
                newCol = Math.min(dimensions.cols - 1, newCol + 1);
                shouldUpdate = true;
                e.preventDefault(); // Prevent browser tab behavior
                break;
            case 'Backspace':
            case 'Delete':
                // Clear cell content
                const cellToClear = getCurrentCellData(activeCell);
                if (cellToClear) {
                    dispatch({
                        type: ActionType.UPDATE_CELL,
                        payload: { sheetId: sheet.id, coords: activeCell, data: { value: '', rawInput: '', formula: undefined, type: CellContentType.VALUE, dataType: CellDataType.TEXT, error: undefined }, userId: currentUserId, userName: currentUserName }
                    });
                }
                break;
            case 'c': // Ctrl+C or Cmd+C for copy
                if ((e.ctrlKey || e.metaKey)) {
                    // Logic already in Ribbon for copy, but also need to handle here if not using ribbon
                    console.log('Copy via shortcut');
                    if (selectedCells) {
                        const copiedData: { [key: string]: SpreadsheetCell } = {};
                        for (let r = selectedCells.start.row; r <= selectedCells.end.row; r++) {
                            for (let c = selectedCells.start.col; c <= selectedCells.end.col; c++) {
                                const cellId = getCellId({ row: r, col: c });
                                if (sheet.data[cellId]) {
                                    copiedData[cellId] = sheet.data[cellId];
                                }
                            }
                        }
                        dispatch({ type: ActionType.SET_CLIPBOARD, payload: { type: 'copy', data: copiedData, range: selectedCells } });
                        dispatch({ type: ActionType.ADD_NOTIFICATION, payload: { id: Date.now().toString(), message: 'Cells copied.', type: 'info', duration: 3000 } });
                    }
                    e.preventDefault();
                }
                break;
            case 'v': // Ctrl+V or Cmd+V for paste
                if ((e.ctrlKey || e.metaKey)) {
                    console.log('Paste via shortcut');
                    if (state.clipboard && activeCell) {
                        dispatch({ type: ActionType.APPLY_PASTE, payload: { targetCoords: activeCell, userId: currentUserId, userName: currentUserName } });
                    } else {
                        dispatch({ type: ActionType.ADD_NOTIFICATION, payload: { id: Date.now().toString(), message: 'No content to paste or no active cell selected.', type: 'warning' } });
                    }
                    e.preventDefault();
                }
                break;
            case 'x': // Ctrl+X or Cmd+X for cut
                if ((e.ctrlKey || e.metaKey)) {
                    console.log('Cut via shortcut');
                    if (selectedCells) {
                        const cutData: { [key: string]: SpreadsheetCell } = {};
                        const changes: ChangeLogEntry[] = [];
                        for (let r = selectedCells.start.row; r <= selectedCells.end.row; r++) {
                            for (let c = selectedCells.start.col; c <= selectedCells.end.col; c++) {
                                const cellId = getCellId({ row: r, col: c });
                                if (sheet.data[cellId]) {
                                    cutData[cellId] = sheet.data[cellId];
                                    changes.push({
                                        id: `change-${Date.now()}-${Math.random()}`,
                                        type: ChangeType.CELL_EDIT,
                                        userId: currentUserId, userName: currentUserName,
                                        timestamp: new Date(),
                                        sheetId: sheet.id,
                                        details: { cellId: cellId, oldValue: sheet.data[cellId].value, newValue: '', oldRawInput: sheet.data[cellId].rawInput, newRawInput: '' }
                                    });
                                    dispatch({ type: ActionType.UPDATE_CELL, payload: { sheetId: sheet.id, coords: { row: r, col: c }, data: { value: '', rawInput: '', formula: undefined, type: CellContentType.VALUE, dataType: CellDataType.TEXT, error: undefined }, userId: currentUserId, userName: currentUserName } });
                                }
                            }
                        }
                        dispatch({ type: ActionType.SET_CLIPBOARD, payload: { type: 'cut', data: cutData, range: selectedCells } });
                        dispatch({ type: ActionType.ADD_NOTIFICATION, payload: { id: Date.now().toString(), message: 'Cells cut to clipboard.', type: 'info', duration: 3000 } });
                    }
                    e.preventDefault();
                }
                break;
            case 'z': // Ctrl+Z or Cmd+Z for undo
                if ((e.ctrlKey || e.metaKey)) {
                    dispatch({ type: ActionType.UNDO });
                    dispatch({ type: ActionType.ADD_NOTIFICATION, payload: { id: Date.now().toString(), message: 'Undo.', type: 'info', duration: 2000 } });
                    e.preventDefault();
                }
                break;
            case 'y': // Ctrl+Y or Cmd+Y for redo
                if ((e.ctrlKey || e.metaKey)) {
                    dispatch({ type: ActionType.REDO });
                    dispatch({ type: ActionType.ADD_NOTIFICATION, payload: { id: Date.now().toString(), message: 'Redo.', type: 'info', duration: 2000 } });
                    e.preventDefault();
                }
                break;
            case 'f': // Ctrl+F or Cmd+F for find
                if ((e.ctrlKey || e.metaKey)) {
                    dispatch({ type: ActionType.OPEN_FIND_REPLACE });
                    e.preventDefault();
                }
                break;
            default:
                // If an alphanumeric key is pressed, start editing the cell
                if (e.key.length === 1 && e.key.match(/^[a-zA-Z0-9 =_.,!@#$%^&*()_+={}\[\]|;:'"<>,.?/~`\-]$/)) {
                    dispatch({ type: ActionType.SET_EDITING_MODE, payload: true });
                    dispatch({ type: ActionType.SET_FORMULA_BAR_VALUE, payload: e.key === '=' ? '=' : '' }); // Pre-fill '=' if pressed
                    e.preventDefault(); // Prevent default input into formula bar if it was focused elsewhere
                }
                return;
        }

        if (shouldUpdate) {
            dispatch({ type: ActionType.SET_ACTIVE_CELL, payload: { row: newRow, col: newCol } });
            dispatch({ type: ActionType.SET_SELECTED_CELLS, payload: { start: { row: newRow, col: newCol }, end: { row: newRow, col: newCol }, sheetId: sheet.id } });
            dispatch({ type: ActionType.SET_EDITING_MODE, payload: false });
            e.preventDefault(); // Prevent default scroll behavior
        }
    };

    const isCellSelected = (row: number, col: number): boolean => {
        if (!selectedCells) return false;
        return (
            row >= selectedCells.start.row && row <= selectedCells.end.row &&
            col >= selectedCells.start.col && col <= selectedCells.end.col
        );
    };

    const isCellActive = (row: number, col: number): boolean => {
        return activeCell?.row === row && activeCell?.col === col;
    };

    const getCellClassNames = (row: number, col: number, cellData?: SpreadsheetCell): string => {
        let classes = '';
        if (isCellActive(row, col)) classes += ' ring-2 ring-blue-500 z-20 '; // Active cell highlight
        else if (isCellSelected(row, col)) classes += ' bg-blue-900 bg-opacity-30 '; // Selected range highlight

        if (cellData?.error) classes += ' border-red-500 '; // Error highlight
        if (!gridlineVisibility) classes += ' border-transparent '; // Hide gridlines if configured

        return classes;
    };

    // Calculate dynamic rows/cols based on data or explicit dimensions
    const displayRows = dimensions.rows;
    const displayCols = dimensions.cols;

    // Apply zoom level to the grid container
    const gridStyle = {
        transform: `scale(${state.zoomLevel})`,
        transformOrigin: 'top left',
        width: `${100 / state.zoomLevel}%`,
        height: `${100 / state.zoomLevel}%`,
    };

    return (
        <div className="overflow-auto flex-grow relative" id="spreadsheet-grid-wrapper" style={gridStyle}>
            <div className={`overflow-visible min-w-full min-h-full ${gridlineVisibility ? '' : 'hide-gridlines'}`} id="spreadsheet-grid" tabIndex={0} onKeyDown={handleKeyDown} ref={gridRef}>
                <table className="table-fixed border-collapse">
                    <thead>
                        <tr>
                            <th className="border border-gray-700 w-12 h-6 sticky left-0 top-0 bg-gray-900 z-30"></th>
                            {Array.from({ length: displayCols }).map((_, colIndex) => (
                                !colMetadata[colIndex]?.hidden && (
                                    <th key={colIndex} className="border border-gray-700 w-24 text-center bg-gray-900 sticky top-0 z-20" style={{ width: colMetadata[colIndex]?.width || 96 }}>{String.fromCharCode(65 + colIndex)}</th>
                                )
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: displayRows }).map((_, rowIndex) => (
                            !rowMetadata[rowIndex]?.hidden && (
                                <tr key={rowIndex} style={{ height: rowMetadata[rowIndex]?.height || 24 }}>
                                    <td className="border border-gray-700 text-center text-xs sticky left-0 bg-gray-900 z-20" style={{ height: rowMetadata[rowIndex]?.height || 24 }}>{rowIndex + 1}</td>
                                    {Array.from({ length: displayCols }).map((_, colIndex) => {
                                        if (colMetadata[colIndex]?.hidden) return null;

                                        const cellId = getCellId({ row: rowIndex, col: colIndex });
                                        const cellData = data[cellId];

                                        // Check for merged cells. If this cell is part of a merge but not the top-left, don't render.
                                        if (cellData?.mergedWith) {
                                            if (cellData.mergedWith.start.row !== rowIndex || cellData.mergedWith.start.col !== colIndex) {
                                                return null; // This cell is part of a merge, but not the master cell
                                            }
                                        }

                                        const colSpan = cellData?.mergedWith ? (cellData.mergedWith.end.col - cellData.mergedWith.start.col + 1) : 1;
                                        const rowSpan = cellData?.mergedWith ? (cellData.mergedWith.end.row - cellData.mergedWith.start.row + 1) : 1;

                                        return (
                                            <td
                                                key={colIndex}
                                                className={`border border-gray-700 p-0 relative ${getCellClassNames(rowIndex, colIndex, cellData)}`}
                                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                                onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                                                colSpan={colSpan}
                                                rowSpan={rowSpan}
                                                style={{
                                                    // Apply custom cell styles
                                                    ...cellData?.style,
                                                    // Ensure merged cells have correct dimensions or are hidden
                                                    // In a real app, merging would adjust cell dimensions.
                                                    // For fixed layout, colSpan/rowSpan handle visual merge.
                                                }}
                                            >
                                                <Cell
                                                    row={rowIndex}
                                                    col={colIndex}
                                                    cellData={cellData} // Pass rich cell data
                                                    isActive={isCellActive(rowIndex, colIndex)}
                                                    isSelected={isCellSelected(rowIndex, colIndex)}
                                                    isEditing={isEditing && isCellActive(rowIndex, colIndex)}
                                                    // Assume Cell component takes care of rendering formula, value, error, comments, etc.
                                                    // And also handles its own input if active and not editing via formula bar
                                                />
                                                {/* Render collaborator cursors/selections */}
                                                {workbook.collaborators.map(c => {
                                                    if (c.userId !== currentUserId && c.activeSheetId === sheet.id) {
                                                        // Render active cell cursor
                                                        if (c.activeCell?.row === rowIndex && c.activeCell?.col === colIndex) {
                                                            return (
                                                                <div key={`cursor-${c.userId}`} className="absolute inset-0 border-2 pointer-events-none z-40" style={{ borderColor: c.color }}>
                                                                    <span className="absolute -top-5 left-0 px-1 text-xs text-white rounded-t-sm" style={{ backgroundColor: c.color }}>{c.userName}</span>
                                                                </div>
                                                            );
                                                        }
                                                        // Render selection highlight (simplified, a real impl might render a single div for the whole range)
                                                        if (c.selection &&
                                                            rowIndex >= c.selection.start.row && rowIndex <= c.selection.end.row &&
                                                            colIndex >= c.selection.start.col && colIndex <= c.selection.end.col
                                                        ) {
                                                            return (
                                                                <div key={`selection-${c.userId}-${rowIndex}-${colIndex}`} className="absolute inset-0 opacity-10 pointer-events-none z-30" style={{ backgroundColor: c.color }}></div>
                                                            );
                                                        }
                                                    }
                                                    return null;
                                                })}
                                            </td>
                                        );
                                    })}
                                </tr>
                            )
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// Initial Workbook Data for demonstration
const initialWorkbookData: Workbook = {
    id: 'workbook-1',
    name: 'My Super Spreadsheet',
    sheets: [
        {
            id: 'sheet-1',
            name: 'Sheet 1',
            data: {
                'A1': { id: 'A1', value: 'Hello, Universe!', type: CellContentType.VALUE, dataType: CellDataType.TEXT, rawInput: 'Hello, Universe!' },
                'B1': { id: 'B1', value: 10, type: CellContentType.VALUE, dataType: CellDataType.NUMBER, rawInput: '10' },
                'B2': { id: 'B2', value: 20, type: CellContentType.VALUE, dataType: CellDataType.NUMBER, rawInput: '20' },
                'B3': { id: 'B3', value: '=SUM(B1:B2)', type: CellContentType.FORMULA, dataType: CellDataType.NUMBER, rawInput: '=SUM(B1:B2)', dependencies: ['B1', 'B2'] },
                'A3': { id: 'A3', value: 'Total:', type: CellContentType.VALUE, dataType: CellDataType.TEXT, rawInput: 'Total:' },
                'C1': { id: 'C1', value: 'This is a long text that should wrap.', type: CellContentType.VALUE, dataType: CellDataType.TEXT, rawInput: 'This is a long text that should wrap.', style: { wrapText: true, backgroundColor: '#334155' } },
                'D1': { id: 'D1', value: 'Date:', type: CellContentType.VALUE, dataType: CellDataType.TEXT, rawInput: 'Date:' },
                'E1': { id: 'E1', value: new Date().toLocaleDateString(), type: CellContentType.VALUE, dataType: CellDataType.DATE, rawInput: new Date().toLocaleDateString() },
                'A5': { id: 'A5', value: 'Admin Only', type: CellContentType.VALUE, dataType: CellDataType.TEXT, rawInput: 'Admin Only', style: { backgroundColor: '#be185d' },
                    protection: { lockedRanges: [{ start: { row: 4, col: 0 }, end: { row: 4, col: 5 }, sheetId: 'sheet-1' }], editors: ['admin_user'] } as any
                },
                'F1': { id: 'F1', value: 'Custom Function Demo', type: CellContentType.VALUE, dataType: CellDataType.TEXT, rawInput: 'Custom Function Demo' },
                'G1': { id: 'G1', value: '=MYCUSTOMFUNC(B1,B2)', type: CellContentType.FORMULA, dataType: CellDataType.TEXT, rawInput: '=MYCUSTOMFUNC(B1,B2)' }, // Placeholder for custom func
                'H1': { id: 'H1', value: 'Merged Cells Test', type: CellContentType.VALUE, dataType: CellDataType.TEXT, rawInput: 'Merged Cells Test',
                    mergedWith: {start: {row:0, col:7}, end: {row:0, col:8}, sheetId: 'sheet-1'} // H1:I1 merged
                },
                'I1': { id: 'I1', value: null, type: CellContentType.VALUE, dataType: CellDataType.TEXT, rawInput: '',
                    mergedWith: {start: {row:0, col:7}, end: {row:0, col:8}, sheetId: 'sheet-1'}
                },
                'J1': {id: 'J1', value: 'A very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very very much less', type: CellContentType.VALUE, dataType: CellDataType.TEXT, style: {wrapText: true}}
            },
            dimensions: { rows: DEFAULT_ROWS, cols: DEFAULT_COLS },
            mergedCells: [{start: {row:0, col:7}, end: {row:0, col:8}, sheetId: 'sheet-1'}], // H1:I1
            rowMetadata: {},
            colMetadata: {},
            hiddenRows: [],
            hiddenCols: [],
            filters: [],
            sortOrders: [],
            charts: [],
            drawings: [],
            gridlineVisibility: true,
        },
        {
            id: 'sheet-2',
            name: 'Charts & Data',
            data: {
                'A1': { id: 'A1', value: 'Category', type: CellContentType.VALUE, dataType: CellDataType.TEXT, rawInput: 'Category' },
                'B1': { id: 'B1', value: 'Sales', type: CellContentType.VALUE, dataType: CellDataType.TEXT, rawInput: 'Sales' },
                'A2': { id: 'A2', value: 'Electronics', type: CellContentType.VALUE, dataType: CellDataType.TEXT, rawInput: 'Electronics' },
                'B2': { id: 'B2', value: 1500, type: CellContentType.VALUE, dataType: CellDataType.NUMBER, rawInput: '1500' },
                'A3': { id: 'A3', value: 'Apparel', type: CellContentType.VALUE, dataType: CellDataType.TEXT, rawInput: 'Apparel' },
                'B3': { id: 'B3', value: 800, type: CellContentType.VALUE, dataType: CellDataType.NUMBER, rawInput: '800' },
                'A4': { id: 'A4', value: 'Home Goods', type: CellContentType.VALUE, dataType: CellContentType.TEXT, rawInput: 'Home Goods' },
                'B4': { id: 'B4', value: 1200, type: CellContentType.VALUE, dataType: CellDataType.NUMBER, rawInput: '1200' },
                'D1': { id: 'D1', value: 'This is a sample chart. Use Insert > Chart to add a new one.', type: CellContentType.VALUE, dataType: CellDataType.TEXT, rawInput: 'This is a sample chart. Use Insert > Chart to add a new one.'},
                'D2': {id: 'D2', value: null, type: CellContentType.VALUE, dataType: CellDataType.TEXT, rawInput: '', style: {backgroundColor: '#333'}}, // Placeholder for embedded chart
            },
            dimensions: { rows: DEFAULT_ROWS, cols: DEFAULT_COLS },
            mergedCells: [],
            rowMetadata: {},
            colMetadata: {},
            hiddenRows: [],
            hiddenCols: [],
            filters: [],
            sortOrders: [],
            charts: [
                {
                    id: 'chart-1',
                    name: 'Sales by Category',
                    type: ChartType.BAR,
                    range: { start: { row: 1, col: 0 }, end: { row: 3, col: 1 }, sheetId: 'sheet-2' },
                    title: 'Quarterly Sales',
                    xAxisLabel: 'Category',
                    yAxisLabel: 'Sales ($)',
                    position: { row: 1, col: 3, width: 6, height: 10 }, // Positions a virtual chart
                    sourceSheetId: 'sheet-2'
                }
            ],
            drawings: [],
            gridlineVisibility: true,
        }
    ],
    activeSheetId: 'sheet-1',
    namedRanges: [{ name: 'MyRange', range: { start: { row: 0, col: 0 }, end: { row: 0, col: 1 }, sheetId: 'sheet-1' }, scope: 'sheet' }],
    collaborators: [
        { userId: 'current_user', userName: 'Current User', color: '#4CAF50', activeSheetId: 'sheet-1', activeCell: null, selection: null, status: 'editing', lastActivity: new Date() },
        { userId: 'another_user', userName: 'Collab User', color: '#FFC107', activeSheetId: 'sheet-1', activeCell: { row: 5, col: 2 }, selection: { start: { row: 5, col: 2 }, end: { row: 5, col: 4 }, sheetId: 'sheet-1' }, status: 'editing', lastActivity: new Date() }
    ],
    workbookSettings: {
        locale: 'en-US',
        timezone: 'America/New_York',
        calculationMode: 'auto',
    },
    scriptProject: {
        id: 'script-project-1',
        name: 'Default Project',
        language: ScriptLanguage.JAVASCRIPT,
        scripts: [
            {
                name: 'myFirstMacro',
                code: 'function myFirstMacro() {\n  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();\n  sheet.getRange("A1").setValue("Hello from Macro!");\n}',
                description: 'A simple macro to put text in A1.',
            }
        ],
        libraries: [],
        permissions: {},
        executionLogs: [],
    }
};


const Spreadsheet: React.FC = () => {
    // Mock current user details
    const currentUserId = 'current_user';
    const currentUserName = 'Current User';

    return (
        <SpreadsheetProvider initialWorkbook={initialWorkbookData} userId={currentUserId} userName={currentUserName}>
            <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
                <h1 className="text-xl font-bold p-4 bg-gray-800 border-b border-gray-700">Sheets Ultimate Enterprise Edition</h1>
                <Ribbon />
                <FormulaBar />
                <div className="flex flex-grow overflow-hidden">
                    <SpreadsheetGrid />
                    <Sidebar />
                </div>
                <SheetTabs />
                <StatusBar />
                <DialogManager />
                <Notifications />
                <FindReplaceBar />
            </div>
        </SpreadsheetProvider>
    );
};

export default Spreadsheet;