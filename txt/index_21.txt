// google/sheets/index.tsx
// The Abacus Invocation. This summons the Spreadsheet, the grid for calculating the kingdom's wealth.

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import Spreadsheet from './components/Spreadsheet';

// --- Existing code remains untouched ---
const container = document.getElementById('root');
// --- End existing code ---

// --- Core Application Data Models (Interfaces/Types) ---

/**
 * Represents the fundamental unit of data and interaction within a sheet.
 * Expanded with a multitude of properties for rich data types, validation, and styling.
 */
export interface CellData {
    value: any;
    displayValue?: string; // Cached formatted value
    formula?: string;
    dependencies?: Set<string>; // Cell addresses this cell depends on
    dependents?: Set<string>; // Cell addresses that depend on this cell
    type: 'text' | 'number' | 'boolean' | 'date' | 'currency' | 'percent' | 'formula' | 'richText' | 'image' | 'link' | 'json' | 'code' | 'geo' | 'measurement' | 'aiResult' | 'dropdown' | 'checkbox' | 'rating' | 'attachmentList';
    format?: {
        backgroundColor?: string;
        textColor?: string;
        fontSize?: number;
        fontFamily?: string;
        fontWeight?: 'normal' | 'bold';
        fontStyle?: 'normal' | 'italic';
        textDecoration?: 'none' | 'underline' | 'line-through';
        alignment?: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
        wrapText?: boolean;
        numberFormat?: string; // e.g., "$#,##0.00", "YYYY-MM-DD"
        border?: { top?: string; right?: string; bottom?: string; left?: string }; // CSS border string
    };
    validation?: {
        rule: string; // e.g., "IS_NUMBER", "DATE_RANGE(start, end)", "CUSTOM_FORMULA(formula)"
        message?: string;
        alertStyle?: 'stop' | 'warning' | 'info';
        isValid?: boolean;
    };
    comment?: {
        author: string;
        timestamp: number;
        text: string;
        resolved?: boolean;
        replies?: CellComment[];
    };
    note?: string; // Simple note, different from comment
    links?: { url: string; text?: string; type?: 'internal' | 'external' }[];
    attachments?: { id: string; name: string; type: string; url: string; size: number }[];
    metadata?: { [key: string]: any }; // Custom metadata for plugins or AI
    revisionId?: string; // For tracking changes
    source?: { type: 'manual' | 'formula' | 'import' | 'api' | 'ai'; reference?: string };
    securityContext?: {
        readRoles?: string[];
        writeRoles?: string[];
        ownerId?: string;
    };
    interactivity?: {
        isButtonClickable?: boolean; // For buttons within cells
        buttonAction?: string; // Macro name or script path
        dropdownOptions?: { label: string; value: any }[];
        sliderConfig?: { min: number; max: number; step: number };
        ratingConfig?: { max: number; icon: 'star' | 'heart' | 'thumb' };
    };
    changeHistory?: CellChangeRecord[]; // Granular change history for this cell
}

export interface CellComment {
    id: string;
    author: string;
    timestamp: number;
    text: string;
    resolved?: boolean;
}

export interface CellChangeRecord {
    timestamp: number;
    userId: string;
    oldValue: any;
    newValue: any;
    oldFormula?: string;
    newFormula?: string;
    changeType: 'value' | 'formula' | 'format' | 'comment' | 'validation';
}

/**
 * Represents a single row in a sheet, with its own properties.
 */
export interface RowData {
    id: string;
    index: number;
    height: number;
    hidden?: boolean;
    groupLevel?: number; // For outlining/grouping rows
    metadata?: { [key: string]: any };
    securityContext?: { readRoles?: string[]; writeRoles?: string[] };
    styles?: { [key: string]: any }; // Row-level styling overrides
    changeHistory?: RowChangeRecord[];
}

export interface RowChangeRecord {
    timestamp: number;
    userId: string;
    changeType: 'height' | 'visibility' | 'group' | 'style';
    details: any;
}

/**
 * Represents a single column in a sheet.
 */
export interface ColumnData {
    id: string;
    index: number;
    width: number;
    hidden?: boolean;
    groupLevel?: number;
    dataTypeSuggestion?: CellData['type']; // Suggested type for cells in this column
    metadata?: { [key: string]: any };
    securityContext?: { readRoles?: string[]; writeRoles?: string[] };
    styles?: { [key: string]: any }; // Column-level styling overrides
    changeHistory?: ColumnChangeRecord[];
}

export interface ColumnChangeRecord {
    timestamp: number;
    userId: string;
    changeType: 'width' | 'visibility' | 'group' | 'style';
    details: any;
}

/**
 * Represents a single sheet within a workbook.
 */
export interface SheetData {
    id: string;
    name: string;
    index: number;
    cells: { [address: string]: CellData }; // e.g., "A1", "B2"
    rows: { [rowIndex: number]: RowData };
    columns: { [colIndex: number]: ColumnData };
    defaultRowHeight: number;
    defaultColumnWidth: number;
    gridLinesVisible: boolean;
    showHeaders: boolean;
    frozenPanes?: { rows: number; columns: number };
    protected?: boolean; // Sheet protection
    passwordHash?: string; // If password protected
    conditionalFormats?: ConditionalFormatRule[];
    dataValidations?: DataValidationRule[];
    namedRanges?: { [name: string]: string }; // e.g., "SalesData": "Sheet1!A1:C10"
    charts?: ChartConfiguration[];
    pivotTables?: PivotTableConfiguration[];
    filters?: FilterConfiguration[];
    sorts?: SortConfiguration[];
    macros?: { [name: string]: string }; // Macro code (e.g., JavaScript/Python)
    drawingObjects?: DrawingObject[]; // Shapes, text boxes, images
    linkedObjects?: { id: string; type: 'chart' | 'pivotTable' | 'range' | 'external'; sheetId: string; range?: string; externalSource?: string }[];
    eventTriggers?: EventTrigger[]; // For automation
    backgroundWorkerConfig?: BackgroundWorkerConfig; // For complex computations
    timeSeriesDataConfig?: TimeSeriesDataConfig; // For time-series specific analysis
    spatialDataConfig?: SpatialDataConfig; // For geographic data analysis
    securityContext?: { readRoles?: string[]; writeRoles?: string[] };
    lastModified?: number; // Timestamp of last modification
    ownerId?: string; // Owner of the sheet
    changeHistory?: SheetChangeRecord[];
    versionControlEnabled?: boolean; // If sheet-level versioning is active
    aiOptimizations?: {
        smartRecalculationEnabled: boolean;
        dataQualityChecksEnabled: boolean;
        nlpQueryOptimizationEnabled: boolean;
    };
    auditTrailEnabled?: boolean;
    multiDimensionalSchema?: MultiDimensionalSchema; // For OLAP cube features
}

export interface SheetChangeRecord {
    timestamp: number;
    userId: string;
    changeType: 'name' | 'structure' | 'protection' | 'settings';
    details: any;
}

/**
 * Represents an entire workbook, containing multiple sheets and global settings.
 */
export interface WorkbookData {
    id: string;
    name: string;
    sheets: { [sheetId: string]: SheetData };
    activeSheetId: string;
    theme: ThemeConfig;
    settings: WorkbookSettings;
    userPermissions: { [userId: string]: PermissionLevel };
    collaborationSessions?: CollaborationSession[];
    versionHistory?: VersionEntry[];
    plugins?: PluginConfig[];
    dataSources?: DataSourceConfig[];
    scriptEnvironmentConfig?: ScriptEnvironmentConfig;
    customFunctions?: CustomFunctionDefinition[];
    auditLog?: AuditLogEntry[];
    aiModelBindings?: AIModelBinding[];
    localizationConfig?: LocalizationConfig;
    globalMacros?: { [name: string]: string };
    metadata?: { [key: string]: any };
    checksum?: string; // For integrity verification
    creationDate: number;
    lastOpenedDate: number;
    lastSavedDate: number;
    fileFormatVersion: string;
    documentSecurityPolicy?: DocumentSecurityPolicy;
    externalConnections?: ExternalConnection[]; // For linked workbooks, etc.
    customBranding?: CustomBrandingConfig;
    dataGovernancePolicy?: DataGovernancePolicy;
    workspaceId?: string; // For integration into a larger workspace
}

/** Represents a data validation rule. */
export interface DataValidationRule {
    range: string; // e.g., "A1:B10"
    type: 'list' | 'number' | 'date' | 'textLength' | 'customFormula' | 'regex' | 'email' | 'url';
    criteria: any; // e.g., string[] for list, { min: number, max: number } for number
    inputMessage?: string;
    errorMessage?: string;
    errorStyle?: 'stop' | 'warning' | 'info';
    showDropdown?: boolean; // For list validation
}

/** Represents a conditional formatting rule. */
export interface ConditionalFormatRule {
    range: string;
    type: 'highlightCells' | 'dataBar' | 'colorScale' | 'iconSet' | 'customFormula' | 'topBottom' | 'uniqueDuplicate';
    criteria: any; // e.g., { type: 'greaterThan', value: 100 }
    format: CellData['format']; // Styling to apply
    stopIfTrue?: boolean;
    priority: number; // For overlapping rules
}

/** Configuration for a chart. */
export interface ChartConfiguration {
    id: string;
    type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'combo' | 'bubble' | 'radar' | 'gantt' | 'treemap' | 'sunburst' | 'waterfall' | 'boxPlot' | 'candlestick' | 'gauge' | 'funnel' | 'pyramid' | 'chord' | 'sankey' | 'network' | 'geographic' | 'heatMap' | 'wordCloud' | 'dendrogram' | '3DScatter' | 'surface' | 'contour' | 'polar';
    range: string; // Data source range
    title: string;
    series: ChartSeriesConfig[];
    options: any; // Chart library specific options (e.g., Highcharts, D3, ECharts, Plotly)
    position: { x: number; y: number; width: number; height: number }; // Position on the sheet
    linkedDashboardId?: string; // If this chart is part of a dashboard
    interactive?: boolean; // Enable zoom, pan, tooltips
    exportFormats?: ('png' | 'jpeg' | 'svg' | 'pdf')[];
    dataLabelsEnabled?: boolean;
    legendPosition?: 'top' | 'bottom' | 'left' | 'right' | 'none';
}

export interface ChartSeriesConfig {
    name: string;
    dataRange: string;
    type?: ChartConfiguration['type'];
    yAxis?: 'primary' | 'secondary';
    color?: string;
    lineStyle?: 'solid' | 'dashed' | 'dotted';
    markerShape?: 'circle' | 'square' | 'triangle' | 'none';
}

/** Configuration for a pivot table. */
export interface PivotTableConfiguration {
    id: string;
    sourceRange: string;
    rows: PivotField[];
    columns: PivotField[];
    values: PivotValueField[];
    filters: PivotField[];
    reportLayout: 'compact' | 'outline' | 'tabular';
    showGrandTotalsRows: boolean;
    showGrandTotalsColumns: boolean;
    subtotals: 'top' | 'bottom' | 'none';
    position: { cell: string }; // Top-left cell of the pivot table report
    drillThroughEnabled?: boolean; // Allow drilling into source data
    cachingEnabled?: boolean; // Cache pivot data for performance
    slicers?: SlicerConfiguration[]; // Interactive filters for pivot tables
    calculatedFields?: CalculatedFieldDefinition[]; // Custom calculations
}

export interface PivotField {
    name: string;
    sourceColumn: string;
    sortOrder?: 'asc' | 'desc' | 'custom';
    filter?: { type: 'include' | 'exclude'; items: any[] };
    grouping?: 'date' | 'number' | 'text'; // e.g., group dates by month/year
}

export interface PivotValueField extends PivotField {
    calculation: 'sum' | 'count' | 'average' | 'min' | 'max' | 'product' | 'stdDev' | 'variance' | 'countNums' | 'custom' | 'distinctCount';
    format?: string;
    showAs?: 'noCalculation' | 'percentOfGrandTotal' | 'percentOfColumnTotal' | 'percentOfRowTotal' | 'percentOfParentRowTotal' | 'percentOfParentColumnTotal' | 'differenceFrom' | 'percentDifferenceFrom' | 'runningTotalIn' | 'percentRunningTotalIn' | 'rankSmallestToLargest' | 'rankLargestToSmallest' | 'index';
}

export interface SlicerConfiguration {
    id: string;
    field: string; // The pivot field it controls
    position: { x: number; y: number; width: number; height: number };
    style?: 'buttons' | 'checkboxes' | 'list';
    multiSelect?: boolean;
}

export interface CalculatedFieldDefinition {
    name: string;
    formula: string; // Formula using other pivot fields
    format?: string;
}

/** Configuration for data filtering. */
export interface FilterConfiguration {
    range: string;
    criteria: { column: number; type: 'value' | 'condition' | 'topN' | 'dateRange' | 'textFilter'; value: any }[];
    sortOrder?: SortConfiguration;
    applyToHeaders?: boolean;
    filterByColor?: { type: 'fill' | 'font'; color: string }[];
    autoFilterEnabled?: boolean; // If UI filters are active
}

/** Configuration for data sorting. */
export interface SortConfiguration {
    range: string;
    criteria: { column: number; order: 'asc' | 'desc' | 'customList'; customList?: string[] }[];
    headerRowIndex?: number; // If sort includes header
    caseSensitive?: boolean;
}

/** Represents a drawing object on a sheet (shape, image, textbox). */
export interface DrawingObject {
    id: string;
    type: 'rectangle' | 'oval' | 'line' | 'arrow' | 'textbox' | 'image' | 'button' | 'icon' | 'chartEmbedded' | 'formControl' | 'svgPath';
    position: { x: number; y: number; width: number; height: number }; // Absolute position relative to sheet
    properties: any; // e.g., fillColor, strokeColor, text content, image URL, script for buttons
    locked?: boolean; // Prevent movement/resizing
    linkedCell?: string; // E.g., a button linked to a cell value
    action?: string; // Macro name for buttons or script to execute
    hoverText?: string; // Tooltip
}

/** Defines an event trigger for automation. */
export interface EventTrigger {
    id: string;
    type: 'onOpen' | 'onEdit' | 'onChange' | 'onFormSubmit' | 'onTimeDriven' | 'onCellChange' | 'onSelectionChange' | 'onSave' | 'onCollaborationUpdate' | 'onPluginEvent' | 'onExternalDataRefresh';
    scriptName: string; // Name of the macro/script to run
    triggerConfig?: any; // e.g., { range: "A1", newValue: "X" } for onCellChange, { interval: 60000, unit: 'minutes' } for onTimeDriven
    enabled: boolean;
    lastRunTimestamp?: number;
    runCount?: number;
    errorCount?: number;
}

/** Configuration for background workers (e.g., Web Workers for heavy computation). */
export interface BackgroundWorkerConfig {
    enabled: boolean;
    maxWorkers: number;
    workerScripts: { name: string; url: string; capabilities: string[] }[];
    throttling?: number; // ms delay between tasks
    loadBalancingStrategy?: 'roundRobin' | 'leastBusy';
    errorHandlingStrategy?: 'retry' | 'skip' | 'failSheet';
}

/** Configuration for time-series data analysis. */
export interface TimeSeriesDataConfig {
    enabled: boolean;
    timeColumn: string; // Column containing timestamps
    granularity?: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
    forecastModels?: { name: string; type: 'ARIMA' | 'ETS' | 'Prophet' | 'NeuralNet' | 'XGBoost'; config: any }[];
    anomalyDetectionRules?: { name: string; type: 'zScore' | 'IQR' | 'dbscan' | 'IsolationForest'; threshold: number }[];
    linkedCalendarSystem?: string; // e.g., "Gregorian", "FiscalYear"
    seasonalDecompositionEnabled?: boolean;
    missingValueImputation?: 'none' | 'mean' | 'median' | 'linearInterpolation' | 'splineInterpolation';
}

/** Configuration for spatial data analysis (e.g., GeoJSON, lat/lon). */
export interface SpatialDataConfig {
    enabled: boolean;
    latitudeColumn?: string;
    longitudeColumn?: string;
    geoJSONColumn?: string; // For complex geometries
    projectionSystem?: string; // e.g., "EPSG:4326"
    mapVisualizationOptions?: any; // e.g., Mapbox GL JS, Leaflet config, CesiumJS (3D)
    geocodingService?: { url: string; apiKey: string };
    spatialQueryEngines?: { name: string; capabilities: string[] }[]; // e.g., "pointInPolygon", "distanceBuffer"
    heatmapEnabled?: boolean;
    clusteringEnabled?: boolean; // For grouping nearby points
}

/** Schema for multi-dimensional data (OLAP Cube). */
export interface MultiDimensionalSchema {
    dimensions: { name: string; columns: string[]; hierarchy?: string[] }[]; // e.g., Time, Geography, Product
    measures: { name: string; column: string; aggregation: 'sum' | 'count' | 'avg' | 'min' | 'max' }[]; // e.g., Sales, Quantity
    cubes?: { name: string; dimensions: string[]; measures: string[] }[];
    linkedDataSourceId?: string;
}

/** Defines a theme for the UI. */
export interface ThemeConfig {
    id: string;
    name: string;
    isDark: boolean;
    colors: {
        primary: string;
        secondary: string;
        background: string;
        surface: string;
        text: string;
        textSecondary: string;
        border: string;
        success: string;
        warning: string;
        error: string;
        info: string;
        selection: string;
        highlight: string;
        gridLine: string;
        headerBg: string;
        headerText: string;
        formulaBarBg: string;
        scrollBarThumb: string;
        scrollBarTrack: string;
        activeTabBg: string;
        inactiveTabBg: string;
        buttonPrimaryBg: string;
        buttonPrimaryText: string;
        buttonSecondaryBg: string;
        buttonSecondaryText: string;
        dialogBg: string;
        dialogText: string;
        inputBg: string;
        inputText: string;
        shadowColor: string;
    };
    fonts: {
        body: string;
        heading: string;
        monospace: string;
        fontSizeBase: string; // e.g., '14px'
    };
    spacing: {
        unit: number; // e.g., 8px
        padding: number;
        margin: number;
        borderRadius: number; // e.g., 4px
    };
    shadows: {
        small: string;
        medium: string;
        large: string;
    };
    transitions: {
        easeOutQuad: string;
        durationBase: string;
    };
    customCss?: string; // For advanced customization
}

/** Global workbook settings. */
export interface WorkbookSettings {
    locale: string; // e.g., "en-US"
    timezone: string; // e.g., "America/New_York"
    currencySymbol: string;
    decimalSeparator: string;
    thousandsSeparator: string;
    dateFormat: string;
    timeFormat: string;
    autoSaveEnabled: boolean;
    autoSaveInterval: number; // in seconds
    undoRedoStackSize: number;
    keyboardShortcutsScheme: string; // e.g., "excel", "googleSheets", "custom"
    defaultChartType: ChartConfiguration['type'];
    defaultPivotLayout: PivotTableConfiguration['reportLayout'];
    dataPrivacyLevel: 'public' | 'private' | 'encrypted' | 'restricted';
    offlineModeEnabled: boolean;
    smartFillEnabled: boolean; // AI-powered auto-completion
    naturalLanguageQueryEnabled: boolean;
    aiAssistantEnabled: boolean;
    realtimeCollaborationEnabled: boolean;
    maxHistorySnapshots: number;
    maxWorkerThreads: number;
    loggingLevel: 'debug' | 'info' | 'warn' | 'error' | 'none';
    accessibilitySettings: {
        highContrastMode: boolean;
        textSize: 'small' | 'medium' | 'large' | 'xlarge';
        screenReaderSupport: boolean;
        colorBlindnessMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
        animationReduction: boolean;
        motionReduction: boolean;
        keyboardNavigationFocusRing: boolean;
    };
    startupSheetId?: string; // Which sheet to open first
    passwordPolicy?: { minLength: number; requiresSymbols: boolean; requiresNumbers: boolean; requiresMixedCase: boolean; lockoutAttempts: number };
    encryptionConfig?: { algorithm: string; keyManagementService?: string };
    defaultFont?: string;
    defaultFontSize?: number;
    developerModeEnabled?: boolean; // For scripting and plugin development
    darkModeAutoSwitch?: 'system' | 'always' | 'never';
    advancedPerformanceMonitoring?: boolean;
    autoCleanupOldVersions?: boolean;
    customScriptsWhitelist?: string[]; // For security
    dataMaskingRules?: DataMaskingRule[]; // For sensitive data display
}

export interface DataMaskingRule {
    id: string;
    range: string; // e.g., "Sheet1!B:B"
    maskType: 'hash' | 'redact' | 'truncate' | 'custom';
    rolesAppliedTo: string[]; // Roles for whom data is masked
    enabled: boolean;
}

/** User permissions within the workbook. */
export type PermissionLevel = 'owner' | 'admin' | 'editor' | 'viewer' | 'commenter' | 'custom';

/** Represents a real-time collaboration session. */
export interface CollaborationSession {
    id: string;
    activeUsers: { userId: string; name: string; cursorPosition: string; selectionRange: string; lastActivity: number; color: string; avatarUrl?: string }[];
    chatMessages: CollaborationChatMessage[];
    sharedViews: { viewId: string; userId: string; range: string; zoom: number; currentSheetId: string }[];
    coEditingLocks?: { cellAddress: string; userId: string; timestamp: number }[]; // For granular cell locks
    presenceUpdatesEnabled?: boolean;
    versionSynchronizationStatus?: 'synced' | 'pending' | 'conflict';
}

export interface CollaborationChatMessage {
    id: string;
    userId: string;
    userName: string;
    timestamp: number;
    text: string;
    replyToId?: string;
    readBy?: string[];
    sentiment?: 'positive' | 'negative' | 'neutral'; // AI-analyzed sentiment
}

/** Represents an entry in the version history. */
export interface VersionEntry {
    id: string;
    timestamp: number;
    userId: string;
    userName: string;
    description: string;
    snapshotKey: string; // Reference to the actual data snapshot
    changeset?: any; // Delta from previous version (OT/CRDT operations)
    isMajorVersion: boolean;
    labels?: string[]; // e.g., "Milestone", "Published", "Backup"
    restorable: boolean;
    diffSummary?: string; // AI-generated summary of changes
}

/** Configuration for a plugin. */
export interface PluginConfig {
    id: string;
    name: string;
    version: string;
    enabled: boolean;
    url: string; // URL to plugin manifest/entry point
    permissions: string[]; // e.g., "read_cells", "write_sheets", "access_external_api"
    settings: { [key: string]: any };
    autostart?: boolean;
    author?: string;
    description?: string;
    iconUrl?: string;
    sandboxMode?: boolean; // If plugin runs in an isolated environment
    dependencies?: string[]; // Other plugins it depends on
    updateAvailable?: string; // New version string if available
}

/** Configuration for a data source (e.g., database, API, file storage). */
export interface DataSourceConfig {
    id: string;
    name: string;
    type: 'csv' | 'json' | 'excel' | 'googleSheets' | 'sqlDatabase' | 'noSqlDatabase' | 'restApi' | 'graphQlApi' | 'awsS3' | 'googleCloudStorage' | 'dropbox' | 'sharepoint' | 'salesforce' | 'custom';
    connectionString: string; // Or API endpoint, or file path pattern
    authentication: 'none' | 'apiKey' | 'oauth2' | 'jwt' | 'basicAuth' | 'serviceAccount' | 'bearerToken' | 'clientCertificate';
    credentials?: { [key: string]: any }; // Stored securely (e.g., encrypted secrets)
    schemaMapping?: { [localColumn: string]: string }; // Mapping to source fields
    refreshInterval?: number; // In seconds, for auto-refreshing data (0 for manual)
    lastRefreshTimestamp?: number;
    cacheEnabled: boolean;
    cachePolicy?: 'always' | 'onDemand' | 'timeBased' | 'staleWhileRevalidate';
    transformationPipeline?: DataTransformationStep[]; // ETL steps
    dataPreview?: any[]; // Cached sample data
    incrementalLoadEnabled?: boolean; // For large datasets
    dataGovernanceTags?: string[]; // e.g., "PII", "Confidential", "Financial"
    connectionStatus?: 'connected' | 'disconnected' | 'error' | 'pending';
    errorDetails?: string;
}

export interface DataTransformationStep {
    type: 'filter' | 'map' | 'aggregate' | 'join' | 'pivot' | 'unpivot' | 'clean' | 'script' | 'enrich' | 'deduplicate' | 'standardize';
    config: any; // Step-specific configuration (e.g., { column: 'Sales', condition: '>100' } for filter)
    enabled: boolean;
    name?: string;
    description?: string;
}

/** Configuration for the scripting environment (e.g., JavaScript, Python). */
export interface ScriptEnvironmentConfig {
    enabled: boolean;
    language: 'javascript' | 'python' | 'lua' | 'webassembly';
    sandboxingEnabled: boolean; // For security
    availableAPIs: string[]; // e.g., "sheets.getRange", "external.fetch", "ui.showToast"
    resourceLimits?: { cpuTime: number; memory: number; networkCalls: number; fileAccess: boolean };
    externalLibraries?: { name: string; url: string; version: string }[];
    debuggingEnabled?: boolean;
    codeEditorTheme?: string;
}

/** Definition of a custom function (UDF). */
export interface CustomFunctionDefinition {
    name: string;
    description: string;
    parameters: { name: string; type: 'number' | 'string' | 'boolean' | 'range' | 'array' | 'date' | 'any'; optional?: boolean; description?: string }[];
    returnType: 'number' | 'string' | 'boolean' | 'array' | 'error' | 'object' | 'any';
    category?: string; // e.g., "Financial", "Text", "Custom"
    exampleUsage?: string;
    sourceCode: string; // JavaScript/Python code (securely sandboxed)
    volatile?: boolean; // If it recalculates on every change
    async?: boolean; // If it's an async function (returns a Promise)
    creatorId?: string;
    creationDate?: number;
}

/** Entry in the audit log. */
export interface AuditLogEntry {
    id: string;
    timestamp: number;
    userId: string;
    action: string; // e.g., "CELL_EDIT", "SHEET_CREATED", "PERMISSION_CHANGED", "FORMULA_RECALCULATED", "DATA_IMPORTED", "PLUGIN_INSTALLED"
    details: { [key: string]: any }; // e.g., { sheetId: "s1", range: "A1", oldValue: "10", newValue: "20" }
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    errorMessage?: string;
    workbookId: string;
    sheetId?: string;
    cellAddress?: string;
    level: 'info' | 'warning' | 'error' | 'security';
}

/** Binding of an AI model to specific data or functionality. */
export interface AIModelBinding {
    id: string;
    name: string;
    modelId: string; // ID of the underlying AI model (e.g., from a global AI service)
    type: 'classification' | 'regression' | 'nlp' | 'vision' | 'forecasting' | 'generative' | 'dataCleaning' | 'recommendation' | 'clustering';
    inputConfig: { sourceType: 'range' | 'sheet' | 'workbook' | 'cell' | 'table'; sourceRef: string | string[]; fields: { name: string; column: string; type: string }[] };
    outputConfig: { destinationType: 'range' | 'cell' | 'comment' | 'insightPanel' | 'newSheet' | 'chart'; destinationRef: string; outputMapping: { modelOutputField: string; sheetField: string }[] };
    trigger: 'manual' | 'onEdit' | 'onTime' | 'onImport';
    lastRunTimestamp?: number;
    status: 'idle' | 'running' | 'completed' | 'failed' | 'training';
    settings?: { [key: string]: any }; // Model-specific parameters (e.g., temperature for generative AI, epochs for training)
    description?: string;
    costPerRun?: number;
    version?: string;
}

/** Localization configuration for the entire application. */
export interface LocalizationConfig {
    defaultLanguage: string; // e.g., 'en'
    supportedLanguages: { code: string; name: string }[];
    translationFiles: { [langCode: string]: string }; // URL to JSON translation file
    autoTranslateEnabled: boolean; // For comments, notes, chat messages
    formatNumber: (value: number, locale?: string, options?: Intl.NumberFormatOptions) => string;
    formatDate: (value: Date, locale?: string, options?: Intl.DateTimeFormatOptions) => string;
}

/** Document-level security policy for advanced access control. */
export interface DocumentSecurityPolicy {
    readOnlyRoles: string[];
    hiddenRanges: { range: string; roles: string[] }[]; // Content is hidden for specified roles
    encryptedRanges: { range: string; encryptionKeyId: string; roles: string[] }[]; // Content is encrypted client-side
    dataLossPreventionRules: DataLossPreventionRule[];
}

export interface DataLossPreventionRule {
    id: string;
    pattern: string; // Regex for sensitive data (e.g., credit card numbers, SSN)
    action: 'warn' | 'block' | 'redact' | 'encrypt';
    appliesTo: 'cells' | 'comments' | 'exports' | 'collaboration';
    enabled: boolean;
}

/** Configuration for external connections (e.g., linked workbooks, embedded objects). */
export interface ExternalConnection {
    id: string;
    type: 'workbook' | 'url' | 'embed' | 'powerBi' | 'tableau';
    source: string; // URL, workbook ID, etc.
    refreshType: 'manual' | 'onOpen' | 'onTime';
    lastRefresh?: number;
    status: 'connected' | 'disconnected' | 'error';
    mapping?: { [localField: string]: string };
}

/** Custom branding options. */
export interface CustomBrandingConfig {
    logoUrl?: string;
    faviconUrl?: string;
    appName?: string;
    customColors?: { primary: string; secondary: string; background: string };
    customFooterText?: string;
}

/** Data governance policy for the workbook. */
export interface DataGovernancePolicy {
    dataRetentionDays?: number; // How long versions/audit logs are kept
    dataClassification?: 'public' | 'internal' | 'confidential' | 'secret';
    ownerApprovalRequiredForExport?: boolean;
    dataComplianceStandards?: ('GDPR' | 'HIPAA' | 'CCPA' | 'SOC2')[];
    auditPolicy?: 'allChanges' | 'majorChangesOnly' | 'securityEventsOnly';
}


// --- Global Application State Contexts ---

/** Context for managing the entire workbook's data and state. */
interface IWorkbookContext {
    workbook: WorkbookData | null;
    activeSheet: SheetData | null;
    currentSheetId: string | null;
    setWorkbook: (workbook: WorkbookData) => void;
    setActiveSheetId: (sheetId: string) => void;
    updateCell: (sheetId: string, address: string, data: Partial<CellData>, silent?: boolean) => Promise<void>;
    updateSheet: (sheetId: string, data: Partial<SheetData>) => Promise<void>;
    addSheet: (name?: string) => Promise<string>;
    deleteSheet: (sheetId: string) => Promise<void>;
    getRangeData: (sheetId: string, range: string) => CellData[][];
    executeFormula: (sheetId: string, address: string, formula: string) => Promise<any>;
    applyConditionalFormat: (sheetId: string, rule: ConditionalFormatRule) => Promise<void>;
    addDrawingObject: (sheetId: string, obj: DrawingObject) => Promise<void>;
    addChart: (sheetId: string, config: ChartConfiguration) => Promise<void>;
    addPivotTable: (sheetId: string, config: PivotTableConfiguration) => Promise<void>;
    applyFilter: (sheetId: string, config: FilterConfiguration) => Promise<void>;
    applySort: (sheetId: string, config: SortConfiguration) => Promise<void>;
    createNamedRange: (sheetId: string, name: string, range: string) => Promise<void>;
    getCellMetadata: (sheetId: string, address: string, key: string) => any;
    setCellMetadata: (sheetId: string, address: string, key: string, value: any) => Promise<void>;
    // ... many more actions for workbook and sheet manipulation
    isLoading: boolean;
    error: Error | null;
}
const WorkbookContext = createContext<IWorkbookContext | undefined>(undefined);
export const useWorkbookContext = () => {
    const context = useContext(WorkbookContext);
    if (!context) {
        throw new Error('useWorkbookContext must be used within a WorkbookProvider');
    }
    return context;
};

/** Context for managing user preferences and UI settings. */
interface IUserSettingsContext {
    theme: ThemeConfig;
    workbookSettings: WorkbookSettings;
    updateTheme: (theme: Partial<ThemeConfig>) => void;
    updateWorkbookSettings: (settings: Partial<WorkbookSettings>) => void;
    currentUserId: string;
    currentUserRoles: string[];
    isOffline: boolean;
    toggleOfflineMode: () => void;
    isDeveloperMode: boolean;
    toggleDeveloperMode: () => void;
    localization: LocalizationConfig;
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
    formatDate: (value: Date, options?: Intl.DateTimeFormatOptions) => string;
}
const UserSettingsContext = createContext<IUserSettingsContext | undefined>(undefined);
export const useUserSettings = () => {
    const context = useContext(UserSettingsContext);
    if (!context) {
        throw new Error('useUserSettings must be used within a UserSettingsProvider');
    }
    return context;
};

/** Context for collaboration features. */
interface ICollaborationContext {
    collaborationSession: CollaborationSession | null;
    sendChatMessage: (message: string) => void;
    sendCursorUpdate: (position: string) => void;
    sendSelectionUpdate: (range: string) => void;
    acquireCellLock: (sheetId: string, cellAddress: string) => Promise<boolean>;
    releaseCellLock: (sheetId: string, cellAddress: string) => Promise<void>;
    connectedUsers: CollaborationSession['activeUsers'];
    isCoEditingActive: boolean;
    inviteUser: (email: string, permission: PermissionLevel) => Promise<void>;
    shareView: (range: string) => Promise<void>;
}
const CollaborationContext = createContext<ICollaborationContext | undefined>(undefined);
export const useCollaboration = () => {
    const context = useContext(CollaborationContext);
    if (!context) {
        throw new Error('useCollaboration must be used within a CollaborationProvider');
    }
    return context;
};

/** Context for AI capabilities. */
interface IAIContext {
    aiSuggestions: AISuggestion[];
    generateFormulaSuggestion: (input: string, contextRange?: string) => Promise<string[]>;
    analyzeDataForInsights: (range: string) => Promise<DataInsight[]>;
    performNLQ: (query: string) => Promise<any>; // Natural Language Query
    applyAIModel: (bindingId: string, data: any) => Promise<any>;
    isLoadingAI: boolean;
    aiError: Error | null;
    dismissSuggestion: (id: string) => void;
    getAvailableAIModels: () => Promise<AIModelInfo[]>;
    trainAIModel: (modelId: string, trainingData: any) => Promise<boolean>;
    getAIModelBinding: (bindingId: string) => AIModelBinding | undefined;
}
const AIContext = createContext<IAIContext | undefined>(undefined);
export const useAI = () => {
    const context = useContext(AIContext);
    if (!context) {
        throw new Error('useAI must be used within an AIProvider');
    }
    return context;
};

export interface AISuggestion {
    id: string;
    type: 'formula' | 'dataCleaning' | 'chart' | 'pivotTable' | 'insight' | 'automation' | 'security' | 'nlpQuery' | 'customFunction';
    description: string;
    actionLabel: string;
    actionPayload: any;
    severity?: 'low' | 'medium' | 'high';
    confidence?: number; // 0-1
    targetRange?: string; // Cell or range suggestion applies to
}

export interface DataInsight {
    id: string;
    type: 'trend' | 'anomaly' | 'correlation' | 'summary' | 'prediction' | 'categorization' | 'outlier';
    title: string;
    description: string;
    visualizationData?: any; // Data to render a mini-chart or component
    suggestedAction?: AISuggestion;
    sourceRange: string;
    confidenceScore?: number;
    generatedTimestamp: number;
}

export interface AIModelInfo {
    id: string;
    name: string;
    description: string;
    inputSchema: any;
    outputSchema: any;
    costPerUse?: number;
    trainingDataMetadata?: any;
    isFineTunable: boolean;
    supportedLanguages?: string[];
    version?: string;
    lastUpdated?: number;
}

/** Context for managing data sources and data integration. */
interface IDataIntegrationContext {
    dataSources: DataSourceConfig[];
    fetchDataSourceData: (sourceId: string, query?: string) => Promise<any[]>;
    addDataSource: (config: DataSourceConfig) => Promise<void>;
    updateDataSource: (id: string, config: Partial<DataSourceConfig>) => Promise<void>;
    deleteDataSource: (id: string) => Promise<void>;
    transformData: (data: any[], pipeline: DataTransformationStep[]) => Promise<any[]>;
    testConnection: (sourceId: string) => Promise<boolean>;
    isLoadingData: boolean;
    refreshAllDataSources: () => Promise<void>;
    getDataSource: (id: string) => DataSourceConfig | undefined;
    extractSchemaFromData: (data: any[]) => any; // Infers schema
}
const DataIntegrationContext = createContext<IDataIntegrationContext | undefined>(undefined);
export const useDataIntegration = () => {
    const context = useContext(DataIntegrationContext);
    if (!context) {
        throw new Error('useDataIntegration must be used within a DataIntegrationProvider');
    }
    return context;
};


// --- Core Application Services (Classes/Functions, exported) ---

/**
 * Service for managing complex formula calculations, parsing, and dependency tracking.
 * Includes support for array formulas, custom functions, and asynchronous functions.
 */
export class FormulaEngineService {
    private workbookData: WorkbookData | null = null;
    private customFunctions: { [name: string]: CustomFunctionDefinition } = {};
    private formulaCache: Map<string, { value: any; dependencies: Set<string>; timestamp: number }> = new Map();
    private dependencyGraph: Map<string, Set<string>> = new Map(); // cell -> dependents
    private isCalculating: boolean = false;
    private recalculationQueue: Set<string> = new Set();
    private debounceRecalculate: Function;

    constructor() {
        this.initializeBuiltInFunctions();
        this.debounceRecalculate = this.debounce(this._recalculateAffectedCellsBatch.bind(this), 100);
    }

    private initializeBuiltInFunctions() {
        // Add thousands of built-in functions: MATH, STATS, TEXT, DATE, LOGICAL, FINANCIAL, WEB, GEO, AI, etc.
        // Example:
        this.addCustomFunction({
            name: 'SUM', description: 'Calculates the sum of a range of numbers.',
            parameters: [{ name: 'range', type: 'range' }], returnType: 'number',
            sourceCode: '(range) => range.flat().filter(n => typeof n === "number").reduce((a, b) => a + b, 0)'
        });
        this.addCustomFunction({
            name: 'NETWORKDAYS', description: 'Calculates the number of whole working days between two dates.',
            parameters: [{ name: 'startDate', type: 'date' }, { name: 'endDate', type: 'date' }], returnType: 'number',
            sourceCode: `(start, end) => { /* Complex date logic considering holidays/weekends */ return Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) - (2 * Math.floor((end.getDay() - start.getDay() + 5) / 7)) ); }`
        });
        // This list represents a small fraction of the 1000+ potential functions:
        // Math & Trig: ABS, ACOS, ACOSH, ASIN, ASINH, ATAN, ATAN2, ATANH, CEILING, COS, COSH, DEGREES, EVEN, EXP, FACT, FLOOR, INT, LN, LOG, LOG10, MOD, ODD, PI, POWER, RADIANS, RAND, RANDBETWEEN, ROUND, ROUNDDOWN, ROUNDUP, SIGN, SIN, SINH, SQRT, SUM, SUMIF, SUMIFS, SUMPRODUCT, SUMSQ, TAN, TANH, TRUNC, GCD, LCM, MROUND, SUBTOTAL, AGGREGATE, MDETERM, MINVERSE, MMULT
        // Statistical: AVERAGE, AVERAGEIF, AVERAGEIFS, COUNT, COUNTA, COUNTBLANK, COUNTIF, COUNTIFS, MAX, MAXA, MEDIAN, MIN, MINA, MODE.SNGL, MODE.MULT, LARGE, SMALL, PERCENTILE.INC, PERCENTILE.EXC, QUARTILE.INC, QUARTILE.EXC, STDEV.S, STDEV.P, VAR.S, VAR.P, CORREL, COVAR, FORECAST.LINEAR, FORECAST.ETS, INTERCEPT, SLOPE, RSQ, PEARSON, SKEW, KURT, Z.TEST, T.TEST, CHISQ.TEST, F.TEST, ANOVA, GEOMEAN, HARMEAN, TRIMMEAN, RANK.EQ, RANK.AVG
        // Text: ASC, CHAR, CLEAN, CODE, CONCAT, CONCATENATE, EXACT, FIND, FIXED, LEFT, LEN, LOWER, MID, NUMBERVALUE, PROPER, REPLACE, REPT, RIGHT, SEARCH, SUBSTITUTE, T, TEXT, TEXTJOIN, TRIM, UNICHAR, UNICODE, UPPER, VALUE, REGEXMATCH, REGEXEXTRACT, REGEXREPLACE
        // Date & Time: DATE, DATEDIF, DATEVALUE, DAY, DAYS, DAYS360, EDATE, EOMONTH, HOUR, ISOWEEKNUM, MINUTE, MONTH, NETWORKDAYS.INTL, NOW, SECOND, TIME, TIMEVALUE, TODAY, WEEKDAY, WEEKNUM, WORKDAY, WORKDAY.INTL, YEAR, YEARFRAC, JISHIN, CHINESEDATE, GREGORIAN
        // Logical: AND, FALSE, IF, IFERROR, IFNA, IFS, NOT, OR, SWITCH, TRUE, XOR, ISBLANK, ISERR, ISERROR, ISFORMULA, ISLOGICAL, ISNA, ISNONTEXT, ISNUMBER, ISREF, ISTEXT
        // Lookup & Reference: ADDRESS, AREAS, CHOOSE, COLUMN, COLUMNS, FORMULATEXT, GETPIVOTDATA, HLOOKUP, HYPERLINK, INDEX, INDIRECT, LOOKUP, MATCH, OFFSET, ROW, ROWS, RTD, TRANSPOSE, VLOOKUP, XLOOKUP, XMATCH, FILTER, SORT, SORTBY, UNIQUE, SEQUENCE, RANDARRAY
        // Financial: ACCRINT, AMORDEGRC, AMORLINC, COUPDAYBS, COUPDAYS, COUPDAYSNC, COUPNCD, COUPLV, CUMIPMT, CUMPRINC, DB, DDB, DISC, DOLLARDE, DOLLARFR, DURATION, EFFECT, FV, FVSCHEDULE, INTRATE, IPMT, IRR, ISPMT, MDURATION, MIRR, NPER, NPV, ODDFPRICE, ODDFYIELD, PMT, PPMT, PRICE, PRICEDISC, PRICEMAT, PV, RATE, RECEIVED, SLN, SYD, TBILLEQ, TBILLPRICE, TBILLYIELD, VDB, XIRR, XNPV, YIELD, YIELDDISC, YIELDMAT
        // Web: ENCODEURL, GOOGLEFINANCE, IMAGE, IMPORTDATA, IMPORTFEED, IMPORTHTML, IMPORTJSON, IMPORTXML, SPARKLINE, WEBSERVICE
        // Engineering: BIN2DEC, BIN2HEX, BIN2OCT, BITAND, BITLSHIFT, BITOR, BITRSHIFT, BITXOR, CONVERT, DEC2BIN, DEC2HEX, DEC2OCT, DELTA, ERF, ERFC, GESTEP, HEX2BIN, HEX2DEC, HEX2OCT, IMABS, IMAGINARY, IMARGUMENT, IMCONJUGATE, IMCOS, IMCOT, IMCSC, IMDIV, IMEXP, IMLN, IMLOG10, IMLOG2, IMPOWER, IMPRODUCT, IMREAL, IMSEC, IMSIN, IMSQRT, IMSUB, IMSUM, OCT2BIN, OCT2DEC, OCT2HEX, BESSEL.J, BESSEL.K, BESSEL.Y, BESSEL.I
        // AI Functions: AI.PREDICT, AI.GENERATE, AI.ANALYZE, AI.CLASSIFY, AI.EXTRACT, AI.SUMMARIZE, AI.TRANSLATE, AI.EMBED, AI.SENTIMENT, AI.CATEGORIZE, AI.IMAGE_DESCRIBE, AI.VISION_OCR, AI.NLP_ANSWER, AI.TRANSFORM_TEXT
        // Geo-Spatial Functions: GEO.LAT, GEO.LON, GEO.DISTANCE, GEO.LOOKUP, GEO.COUNTRY, GEO.CITY, GEO.ZIPCODE, GEO.IS_IN_POLYGON, GEO.NEAREST_POINT
        // Measurement Units: UNIT.CONVERT, UNIT.ADD, UNIT.SUBTRACT, UNIT.MULTIPLY, UNIT.DIVIDE (e.g., UNIT.CONVERT("10m", "ft"))
        // Array Manipulation: FLATTEN, UNIQUE, NEST, UNNEST, GROUPBY, PIVOT, CUBE
        // Custom UDF functions registered by users/plugins
    }

    private debounce(func: Function, delay: number) {
        let timeout: ReturnType<typeof setTimeout>;
        return function(this: any, ...args: any[]) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    setWorkbookData(data: WorkbookData) {
        this.workbookData = data;
        // Rebuild dependency graph and clear cache on workbook change
        this.dependencyGraph.clear();
        this.formulaCache.clear();
        this.rebuildDependencyGraph();
    }

    addCustomFunction(func: CustomFunctionDefinition) {
        if (this.customFunctions[func.name.toUpperCase()]) {
            console.warn(`Custom function ${func.name} already exists. Overwriting.`);
        }
        this.customFunctions[func.name.toUpperCase()] = func;
    }

    removeCustomFunction(name: string) {
        delete this.customFunctions[name.toUpperCase()];
    }

    /**
     * Parses a formula, identifies cell dependencies, and evaluates it.
     * @param sheetId
     * @param address
     * @param formula
     * @returns The calculated value and any errors.
     */
    async evaluateFormula(sheetId: string, address: string, formula: string): Promise<any> {
        if (!this.workbookData) {
            return { value: '#REF!', error: new Error('Workbook data not loaded.') };
        }

        const cacheKey = `${sheetId}!${address}`;
        // In a real application, a robust change propagation algorithm (e.g., dirty bit, topological sort) would manage cache invalidation.
        // For this example, we'll re-evaluate if not explicitly marked as fresh or if value is missing from cache.
        if (this.formulaCache.has(cacheKey) && this.formulaCache.get(cacheKey)?.timestamp > (this.workbookData.sheets[sheetId]?.lastModified || 0)) {
             // Basic heuristic: if sheet hasn't been modified since last cache, use cached value
            return this.formulaCache.get(cacheKey);
        }

        // 1. Parse formula to AST (Abstract Syntax Tree)
        const { ast, dependencies: parsedDependencies } = FormulaParser.parse(formula, { sheetId, address });
        const dependencies = new Set<string>(parsedDependencies);

        // Update dependencies in the graph (simplified: this would be more granular and efficient)
        this.dependencyGraph.set(cacheKey, dependencies);
        dependencies.forEach(dep => {
            let dependentsOfDep = this.dependencyGraph.get(dep);
            if (!dependentsOfDep) {
                dependentsOfDep = new Set();
                this.dependencyGraph.set(dep, dependentsOfDep);
            }
            dependentsOfDep.add(cacheKey);
        });

        // 3. Evaluate the AST, fetching values for dependencies
        const evaluateNode = async (node: any): Promise<any> => {
            switch (node.type) {
                case 'NUMBER': return node.value;
                case 'STRING': return node.value;
                case 'BOOLEAN': return node.value;
                case 'CELL_REFERENCE':
                    const refSheetId = node.sheetId || sheetId;
                    const refAddress = node.address;
                    const refCellKey = `${refSheetId}!${refAddress}`;
                    const refCellData = this.workbookData?.sheets[refSheetId]?.cells[refAddress];

                    if (refCellData?.formula) {
                        const cached = this.formulaCache.get(refCellKey);
                        if (cached) return cached.value;
                        // Recursively evaluate dependent formula
                        const res = await this.evaluateFormula(refSheetId, refAddress, refCellData.formula);
                        return res.value;
                    }
                    return refCellData?.value ?? '#N/A'; // Or custom error for empty/missing cells
                case 'RANGE_REFERENCE': // Handle A1:B2 ranges
                    const rangeValues: any[][] = [];
                    // This is highly simplified: would need to parse the range (e.g., "A1:B2")
                    // and iterate through all cells in that range to get their values.
                    // For now, return a placeholder or just the top-left cell if it exists.
                    const [startCell, endCell] = node.range.split(':');
                    const startCol = startCell.match(/[A-Z]+/)[0];
                    const startRow = parseInt(startCell.match(/[0-9]+/)[0]);
                    const endCol = endCell.match(/[A-Z]+/)[0];
                    const endRow = parseInt(endCell.match(/[0-9]+/)[0]);

                    // Example: fetching just one cell for illustration
                    const firstCellData = this.workbookData?.sheets[sheetId]?.cells[startCell];
                    if (firstCellData) {
                        rangeValues.push([firstCellData.value]);
                    }
                    return rangeValues; // Returns a 2D array of values
                case 'FUNCTION_CALL':
                    const funcDef = this.customFunctions[node.name.toUpperCase()];
                    if (!funcDef) return '#NAME?'; // Function not found

                    const args = await Promise.all(node.args.map(evaluateNode));

                    try {
                        // Secure execution in a sandboxed environment for user-defined functions
                        // In a production app, use a Web Worker or a more robust sandbox.
                        const funcResult = (new Function(...funcDef.parameters.map(p => p.name), `return (${funcDef.sourceCode})(...arguments);`)) (...args);
                        if (funcDef.async && funcResult instanceof Promise) {
                            return await funcResult; // Handle async UDFs
                        }
                        return funcResult;
                    } catch (e: any) {
                        console.error(`Error in function ${node.name}:`, e);
                        return `#ERROR! ${e.message}`;
                    }
                case 'BINARY_OPERATOR':
                    const left = await evaluateNode(node.left);
                    const right = await evaluateNode(node.right);
                    switch (node.operator) {
                        case '+': return (typeof left === 'number' && typeof right === 'number') ? left + right : '#VALUE!';
                        case '-': return (typeof left === 'number' && typeof right === 'number') ? left - right : '#VALUE!';
                        case '*': return (typeof left === 'number' && typeof right === 'number') ? left * right : '#VALUE!';
                        case '/': return (typeof left === 'number' && typeof right === 'number') ? (right !== 0 ? left / right : '#DIV/0!') : '#VALUE!';
                        case '=': return left === right;
                        case '>': return left > right;
                        case '<': return left < right;
                        case '>=': return left >= right;
                        case '<=': return left <= right;
                        case '<>': return left !== right;
                        case '&': return String(left) + String(right); // Concatenation
                        // ... more operators
                        default: return '#ERROR!';
                    }
                // ... handle array formulas, error types, etc.
                default: return '#ERROR!';
            }
        };

        try {
            const value = await evaluateNode(ast);
            this.formulaCache.set(cacheKey, { value, dependencies, timestamp: Date.now() });
            return { value, error: null };
        } catch (e: any) {
            console.error(`Formula evaluation error for ${formula} in ${sheetId}!${address}:`, e);
            this.formulaCache.set(cacheKey, { value: '#ERROR!', dependencies, timestamp: Date.now() });
            return { value: '#ERROR!', error: e };
        }
    }

    /**
     * Rebuilds the entire dependency graph for the workbook.
     * This is an expensive operation and should ideally be incremental.
     */
    private rebuildDependencyGraph() {
        if (!this.workbookData) return;
        console.log("Rebuilding formula dependency graph...");
        this.dependencyGraph.clear();
        this.formulaCache.clear();

        for (const sheetId in this.workbookData.sheets) {
            const sheet = this.workbookData.sheets[sheetId];
            for (const address in sheet.cells) {
                const cell = sheet.cells[address];
                if (cell.formula) {
                    const { dependencies: parsedDependencies } = FormulaParser.parse(cell.formula, { sheetId, address });
                    const cellKey = `${sheetId}!${address}`;
                    this.dependencyGraph.set(cellKey, new Set(parsedDependencies)); // Dependencies of 'cellKey'

                    parsedDependencies.forEach(depKey => {
                        // Dependents of 'depKey'
                        let dependentsOfDep = this.dependencyGraph.get(depKey);
                        if (!dependentsOfDep) {
                            dependentsOfDep = new Set();
                            this.dependencyGraph.set(depKey, dependentsOfDep);
                        }
                        dependentsOfDep.add(cellKey);
                    });
                }
            }
        }
        console.log("Dependency graph rebuilt.");
    }

    /**
     * Queues cells for recalculation. Uses a debounce mechanism to avoid excessive recalculations.
     * @param sheetId
     * @param changedCells
     */
    queueRecalculation(sheetId: string, changedCells: string[]): void {
        changedCells.forEach(addr => this.recalculationQueue.add(`${sheetId}!${addr}`));
        this.debounceRecalculate();
    }

    /**
     * Performs a batch recalculation of all affected cells.
     * This method is debounced by `queueRecalculation`.
     */
    private async _recalculateAffectedCellsBatch(): Promise<void> {
        if (this.isCalculating || this.recalculationQueue.size === 0) return;

        this.isCalculating = true;
        const initialChangedCells = new Set(this.recalculationQueue);
        this.recalculationQueue.clear(); // Clear the queue for the next batch

        if (!this.workbookData) {
            this.isCalculating = false;
            return;
        }

        const cellsToRecalculate = new Set<string>();
        const queue: string[] = Array.from(initialChangedCells);
        const visited = new Set<string>();

        // Build the full set of affected cells using BFS on the dependency graph
        let head = 0;
        while (head < queue.length) {
            const currentCell = queue[head++];
            if (visited.has(currentCell)) continue;
            visited.add(currentCell);

            cellsToRecalculate.add(currentCell);

            const dependents = this.dependencyGraph.get(currentCell);
            if (dependents) {
                for (const dep of dependents) {
                    if (!visited.has(dep)) {
                        queue.push(dep);
                    }
                }
            }
        }

        // Topological sort of affected cells to ensure correct order of recalculation
        const sortedCells = this.topologicalSort(Array.from(cellsToRecalculate));

        console.log(`Recalculating ${sortedCells.length} cells...`);
        for (const cellAddress of sortedCells) {
            const [sId, addr] = cellAddress.split('!');
            const cell = this.workbookData.sheets[sId]?.cells[addr];
            if (cell?.formula) {
                // Invalidate cache for this cell before evaluation
                this.formulaCache.delete(cellAddress);
                const { value, error } = await this.evaluateFormula(sId, addr, cell.formula);
                if (value !== cell.value) {
                    // Update the workbook data with the new value (not handled directly in this service)
                    // This change should trigger a UI update and potentially notify collaboration service
                    // For now, we just log and assume the context provider will pick it up.
                    console.log(`Recalculated ${cellAddress}: ${value} (was ${cell.value})`);
                    // Here, a callback to the WorkbookProvider's `updateCell` would be made,
                    // but with a `silent` flag to prevent re-triggering this recalculation loop.
                    // e.g., this.onCellRecalculated(sId, addr, { value, formula: cell.formula });
                }
            }
        }
        console.log(`Batch recalculation complete.`);
        this.isCalculating = false;
    }

    /**
     * Performs a topological sort on a subset of cells to ensure calculation order.
     * This is a simplified Kahn's algorithm or DFS for a DAG.
     * @param cells A list of cell addresses to sort.
     * @returns Sorted list of cell addresses.
     */
    private topologicalSort(cells: string[]): string[] {
        const sorted: string[] = [];
        const visited: Set<string> = new Set();
        const recursionStack: Set<string> = new Set(); // To detect cycles

        const dfs = (cellAddress: string) => {
            visited.add(cellAddress);
            recursionStack.add(cellAddress);

            const dependencies = this.dependencyGraph.get(cellAddress);
            if (dependencies) {
                for (const dep of dependencies) {
                    if (recursionStack.has(dep)) {
                        // Cycle detected! Handle gracefully, e.g., mark cells as error.
                        console.error(`Circular dependency detected: ${cellAddress} -> ${dep}`);
                        // In a real app, this would lead to a #CIRCREF! error.
                        return false;
                    }
                    if (!visited.has(dep)) {
                        if (!dfs(dep)) return false; // Propagate cycle detection
                    }
                }
            }
            recursionStack.delete(cellAddress);
            sorted.push(cellAddress);
            return true;
        };

        // Filter `cells` to only include those that are actually *in* the graph and need sorting.
        const relevantCells = cells.filter(cell => this.dependencyGraph.has(cell));

        for (const cell of relevantCells) {
            if (!visited.has(cell)) {
                if (!dfs(cell)) {
                    // Stop sorting if a cycle is found
                    return [];
                }
            }
        }
        return sorted.reverse(); // Reverse to get dependencies calculated before dependents
    }

    // ... additional methods for formula auditing, error checking, array formula management, etc.
    // getFormulaErrors(sheetId: string, address: string): FormulaError[] { ... }
    // registerVolatilityFunction(functionName: string): void { ... } // Functions that always recalculate
    // getDependencies(sheetId: string, address: string): string[] { ... }
    // getDependents(sheetId: string, address: string): string[] { ... }
}

/**
 * Utility for parsing formulas into an AST.
 * (Highly simplified placeholder)
 */
export class FormulaParser {
    static parse(formula: string, context: { sheetId: string; address: string }): { ast: any; dependencies: string[] } {
        // In a real application, this would be a full-fledged parser (lexer, tokenizer, AST builder).
        // It would handle complex nested functions, range unions/intersections, error types, etc.
        // For demonstration, we'll return a very basic AST structure.
        const dependencies: string[] = [];

        if (formula.startsWith('=')) {
            const content = formula.substring(1).trim();
            // Basic regex to find cell references like A1, BZ345, or SheetName!A1
            const refRegex = /((?:'[^']+'!)?[A-Z]{1,3}[0-9]{1,7}(?::[A-Z]{1,3}[0-9]{1,7})?)/g;
            let match;
            while ((match = refRegex.exec(content)) !== null) {
                const fullRef = match[1];
                let [sheetPart, cellPart] = fullRef.includes('!') ? fullRef.split('!') : [context.sheetId, fullRef];
                sheetPart = sheetPart.replace(/'/g, ''); // Remove quotes from sheet name
                // If it's a range like A1:B2, we still just add A1 and B2 as dependencies for now
                if (cellPart.includes(':')) {
                    const [start, end] = cellPart.split(':');
                    dependencies.push(`${sheetPart}!${start}`);
                    dependencies.push(`${sheetPart}!${end}`); // Simplistic: mark start/end of range as dependencies
                } else {
                    dependencies.push(`${sheetPart}!${cellPart}`);
                }
            }

            // Very simplistic formula parsing for AST:
            // This is nowhere near a real parser but demonstrates the structure.
            if (content.match(/^[A-Z]+[0-9]+$/)) { // Direct cell reference like "=A1"
                return { ast: { type: 'CELL_REFERENCE', sheetId: context.sheetId, address: content }, dependencies };
            }
            if (content.match(/^[A-Z_][A-Z0-9_]*\(/i)) { // Function call like "=SUM(A1:B10)"
                const funcNameMatch = content.match(/^([A-Z_][A-Z0-9_]*)\((.*)\)$/i);
                if (funcNameMatch) {
                    const funcName = funcNameMatch[1];
                    const argsString = funcNameMatch[2];
                    // Very simplistic argument parsing (needs robust handling of nested formulas, strings, commas)
                    const args = argsString.split(',').map(arg => {
                        const trimmedArg = arg.trim();
                        if (trimmedArg.match(/^[A-Z]+[0-9]+$/)) {
                            return { type: 'CELL_REFERENCE', sheetId: context.sheetId, address: trimmedArg };
                        } else if (trimmedArg.match(/^[A-Z]+[0-9]+:[A-Z]+[0-9]+$/)) {
                            return { type: 'RANGE_REFERENCE', sheetId: context.sheetId, range: trimmedArg };
                        }
                        else if (!isNaN(Number(trimmedArg))) {
                            return { type: 'NUMBER', value: parseFloat(trimmedArg) };
                        } else if (trimmedArg.startsWith('"') && trimmedArg.endsWith('"')) {
                            return { type: 'STRING', value: trimmedArg.slice(1, -1) };
                        }
                        return { type: 'UNKNOWN', value: trimmedArg }; // Fallback
                    });
                    return { ast: { type: 'FUNCTION_CALL', name: funcName, args: args }, dependencies };
                }
            }
            // Basic binary operation (e.g., =A1+B1 or =10+20)
            const operatorMatch = content.match(/^(.+?)([+\-*/=<>&])(.+)$/);
            if (operatorMatch) {
                const [, leftStr, operator, rightStr] = operatorMatch;
                const leftAst = FormulaParser.parse(leftStr, context).ast;
                const rightAst = FormulaParser.parse(rightStr, context).ast;
                return {
                    ast: { type: 'BINARY_OPERATOR', operator, left: leftAst, right: rightAst },
                    dependencies
                };
            }
            // Literal values or unparsed complex expressions
            if (!isNaN(Number(content))) return { ast: { type: 'NUMBER', value: parseFloat(content) }, dependencies };
            if (content.startsWith('"') && content.endsWith('"')) return { ast: { type: 'STRING', value: content.slice(1, -1) }, dependencies };
            if (content.toUpperCase() === 'TRUE' || content.toUpperCase() === 'FALSE') return { ast: { type: 'BOOLEAN', value: content.toUpperCase() === 'TRUE' }, dependencies };

            return { ast: { type: 'ERROR', value: `#PARSE! - Cannot parse: ${content}` }, dependencies };
        }
        return { ast: { type: 'STRING', value: formula }, dependencies: [] }; // Treat non-formula as string
    }
}


/**
 * Service for data storage, retrieval, and persistence.
 * Abstracts away the underlying storage mechanism (local, cloud, database).
 */
export class PersistenceService {
    private dbName = 'AbacusSheetsDB';
    private dbVersion = 2; // Increment version for schema changes
    private indexedDB: IDBDatabase | null = null;
    private readonly storageAdapter: 'indexedDB' | 'localStorage' | 'cloud' | 'hybrid'; // Configurable
    private cloudSyncEndpoint: string = '/api/sync/workbook';
    private offlineQueue: { action: string; payload: any; timestamp: number }[] = [];
    private syncIntervalId: ReturnType<typeof setInterval> | null = null;
    private isSyncing: boolean = false;
    private userId: string = 'anonymous'; // Current user ID for audit/ownership

    constructor(adapter: 'indexedDB' | 'cloud' | 'hybrid' = 'indexedDB', userId: string = 'anonymous') {
        this.storageAdapter = adapter;
        this.userId = userId;
        if (this.storageAdapter === 'indexedDB' || this.storageAdapter === 'hybrid') {
            this.initIndexedDB();
        }
        this.startSyncScheduler();
    }

    setUserId(userId: string) {
        this.userId = userId;
    }

    private async initIndexedDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) {
                console.warn("IndexedDB not supported, persisting to memory only.");
                reject(new Error("IndexedDB not supported"));
                return;
            }

            if (this.indexedDB) { // Already initialized
                resolve();
                return;
            }

            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error("IndexedDB error:", (event.target as any).error);
                reject((event.target as any).error);
            };

            request.onsuccess = (event) => {
                this.indexedDB = (event.target as any).result;
                console.log("IndexedDB initialized successfully.");
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as any).result;
                if (!db.objectStoreNames.contains('workbooks')) {
                    db.createObjectStore('workbooks', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('offlineQueue')) {
                    const queueStore = db.createObjectStore('offlineQueue', { keyPath: 'timestamp', autoIncrement: true });
                    queueStore.createIndex('workbookId', 'payload.workbookId', { unique: false });
                }
                if (!db.objectStoreNames.contains('userSettings')) {
                    db.createObjectStore('userSettings', { keyPath: 'userId' });
                }
                // Add more stores for plugins, custom functions, etc.
                console.log(`IndexedDB upgraded to version ${this.dbVersion}.`);
            };
        });
    }

    private getObjectStore(storeName: string, mode: IDBTransactionMode): IDBObjectStore {
        if (!this.indexedDB) throw new Error("IndexedDB not initialized.");
        const transaction = this.indexedDB.transaction(storeName, mode);
        return transaction.objectStore(storeName);
    }

    private startSyncScheduler() {
        if (this.syncIntervalId) clearInterval(this.syncIntervalId);
        this.syncIntervalId = setInterval(() => {
            if (!this.isSyncing && (this.storageAdapter === 'cloud' || this.storageAdapter === 'hybrid') && navigator.onLine) {
                this.syncOfflineQueue();
            }
        }, 15000); // Attempt sync every 15 seconds when online
    }

    async saveWorkbook(workbook: WorkbookData, remoteOnly: boolean = false): Promise<void> {
        console.log(`Saving workbook ${workbook.id}, remoteOnly: ${remoteOnly}, adapter: ${this.storageAdapter}`);
        const currentTimestamp = Date.now();
        workbook.lastSavedDate = currentTimestamp;

        if (!remoteOnly && (this.storageAdapter === 'indexedDB' || this.storageAdapter === 'hybrid')) {
            try {
                await this.initIndexedDB();
                await new Promise<void>((resolve, reject) => {
                    const request = this.getObjectStore('workbooks', 'readwrite').put(workbook);
                    request.onsuccess = () => resolve();
                    request.onerror = (event) => reject((event.target as any).error);
                });
            } catch (error) {
                console.error("Failed to save workbook to IndexedDB:", error);
                // Even if local save fails, attempt cloud sync if configured
            }
        }

        if (this.storageAdapter === 'cloud' || this.storageAdapter === 'hybrid') {
            await this.enqueueOfflineAction('saveWorkbook', { workbook, userId: this.userId });
            if (navigator.onLine) {
                this.syncOfflineQueue(); // Attempt immediate sync if online
            }
        }
    }

    async loadWorkbook(workbookId: string): Promise<WorkbookData | null> {
        console.log(`Loading workbook ${workbookId} using ${this.storageAdapter}`);
        let workbook: WorkbookData | null = null;

        if (this.storageAdapter === 'cloud' || this.storageAdapter === 'hybrid') {
            if (navigator.onLine) {
                workbook = await this.fetchFromCloud(workbookId);
                if (workbook) {
                    // Update local cache if cloud version is newer
                    if (this.storageAdapter === 'hybrid' || this.storageAdapter === 'indexedDB') {
                        const localWorkbook = await this.loadWorkbookFromIndexedDB(workbookId);
                        if (!localWorkbook || workbook.lastSavedDate > (localWorkbook.lastSavedDate || 0)) {
                            console.log(`Cloud version of ${workbookId} is newer, updating local copy.`);
                            await this.saveWorkbook(workbook, true); // Save to local without re-enqueueing for cloud
                        }
                    }
                    return workbook;
                }
            } else {
                console.warn(`Offline, cannot load workbook ${workbookId} from cloud.`);
            }
        }

        if (this.storageAdapter === 'indexedDB' || this.storageAdapter === 'hybrid') {
            workbook = await this.loadWorkbookFromIndexedDB(workbookId);
        }

        return workbook;
    }

    private async loadWorkbookFromIndexedDB(workbookId: string): Promise<WorkbookData | null> {
        try {
            await this.initIndexedDB();
            return new Promise((resolve, reject) => {
                const request = this.getObjectStore('workbooks', 'readonly').get(workbookId);
                request.onsuccess = (event) => resolve((event.target as any).result || null);
                request.onerror = (event) => reject((event.target as any).error);
            });
        } catch (error) {
            console.error("Failed to load workbook from IndexedDB:", error);
            return null;
        }
    }

    async deleteWorkbook(workbookId: string): Promise<void> {
        console.log(`Deleting workbook ${workbookId} using ${this.storageAdapter}`);
        if (this.storageAdapter === 'indexedDB' || this.storageAdapter === 'hybrid') {
            await this.initIndexedDB();
            await new Promise<void>((resolve, reject) => {
                const request = this.getObjectStore('workbooks', 'readwrite').delete(workbookId);
                request.onsuccess = () => resolve();
                request.onerror = (event) => reject((event.target as any).error);
            });
        }
        if (this.storageAdapter === 'cloud' || this.storageAdapter === 'hybrid') {
            await this.enqueueOfflineAction('deleteWorkbook', { workbookId, userId: this.userId });
            if (navigator.onLine) this.syncOfflineQueue();
        }
    }

    async enqueueOfflineAction(action: string, payload: any): Promise<void> {
        if (this.storageAdapter === 'indexedDB' || this.storageAdapter === 'hybrid') {
            await this.initIndexedDB();
            const entry = { action, payload, timestamp: Date.now() };
            return new Promise((resolve, reject) => {
                const request = this.getObjectStore('offlineQueue', 'readwrite').add(entry);
                request.onsuccess = () => {
                    this.offlineQueue.push(entry); // Keep in memory for immediate access
                    resolve();
                };
                request.onerror = (event) => reject((event.target as any).error);
            });
        }
        // For pure cloud/memory, just add to memory queue
        this.offlineQueue.push({ action, payload, timestamp: Date.now() });
    }

    async syncOfflineQueue(): Promise<void> {
        if (this.isSyncing || !navigator.onLine) {
            console.log('Skipping sync: already syncing or offline.');
            return;
        }

        this.isSyncing = true;
        try {
            if (this.storageAdapter === 'indexedDB' || this.storageAdapter === 'hybrid') {
                await this.initIndexedDB();
                const storedQueue = await new Promise<any[]>((resolve, reject) => {
                    const request = this.getObjectStore('offlineQueue', 'readonly').getAll();
                    request.onsuccess = (event) => resolve((event.target as any).result);
                    request.onerror = (event) => reject((event.target as any).error);
                });
                this.offlineQueue = storedQueue || [];
            }
        } catch (error) {
            console.error("Failed to load offline queue from IndexedDB:", error);
        }

        if (this.offlineQueue.length === 0) {
            console.log("Offline queue is empty, no sync needed.");
            this.isSyncing = false;
            return;
        }

        console.log(`Syncing ${this.offlineQueue.length} offline actions to cloud...`);
        // Batch and send to cloud
        try {
            const response = await fetch(`${this.cloudSyncEndpoint}/batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ actions: this.offlineQueue, userId: this.userId })
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(`Cloud sync failed: ${response.status} - ${errorData.message}`);
            }
            console.log("Offline queue synced successfully.");
            this.offlineQueue = []; // Clear local queue in memory
            if (this.storageAdapter === 'indexedDB' || this.storageAdapter === 'hybrid') {
                // Clear IndexedDB queue
                await new Promise<void>((resolve, reject) => {
                    const request = this.getObjectStore('offlineQueue', 'readwrite').clear();
                    request.onsuccess = () => resolve();
                    request.onerror = (event) => reject((event.target as any).error);
                });
            }
        } catch (error) {
            console.error("Error during offline sync:", error);
            // Implement retry logic, partial success handling, conflict resolution
        } finally {
            this.isSyncing = false;
        }
    }

    // Placeholder for cloud interaction methods
    private async fetchFromCloud(workbookId: string): Promise<WorkbookData | null> {
        console.log(`[Cloud Sync] Fetching workbook ${workbookId} from cloud.`);
        try {
            const response = await fetch(`${this.cloudSyncEndpoint}/${workbookId}`, {
                headers: { 'Authorization': `Bearer ${/* get auth token */''}` }
            });
            if (response.ok) {
                return await response.json();
            } else if (response.status === 404) {
                return null;
            } else {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(`Failed to fetch workbook from cloud: ${response.status} - ${errorData.message}`);
            }
        } catch (error) {
            console.error(`Error fetching workbook ${workbookId} from cloud:`, error);
            return null;
        }
    }

    // ... methods for versioning, snapshot management, data backups, user settings persistence
    async saveUserSettings(userId: string, settings: any): Promise<void> {
        if (this.storageAdapter === 'indexedDB' || this.storageAdapter === 'hybrid') {
            await this.initIndexedDB();
            return new Promise((resolve, reject) => {
                const request = this.getObjectStore('userSettings', 'readwrite').put({ userId, settings });
                request.onsuccess = () => resolve();
                request.onerror = (event) => reject((event.target as any).error);
            });
        }
        // Cloud sync for user settings would also be here
    }

    async loadUserSettings(userId: string): Promise<any | null> {
        if (this.storageAdapter === 'indexedDB' || this.storageAdapter === 'hybrid') {
            await this.initIndexedDB();
            return new Promise((resolve, reject) => {
                const request = this.getObjectStore('userSettings', 'readonly').get(userId);
                request.onsuccess = (event) => resolve((event.target as any).result?.settings || null);
                request.onerror = (event) => reject((event.target as any).error);
            });
        }
        return null; // Fallback
    }
}

/**
 * Service for managing user authentication and authorization.
 */
export class SecurityService {
    private currentUser: { id: string; name: string; email: string; roles: string[] } | null = null;
    private permissionsCache: Map<string, PermissionLevel> = new Map(); // WorkbookId -> PermissionLevel
    private apiEndpoint = '/api/auth';
    private persistenceService: PersistenceService;

    constructor(persistenceService: PersistenceService) {
        this.persistenceService = persistenceService;
        this.loadCurrentUserFromSession();
    }

    private async loadCurrentUserFromSession() {
        // In a real app, check localStorage, session storage, or make a quick API call
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            this.persistenceService.setUserId(this.currentUser!.id);
        } else {
            // Simulate guest user if not logged in
            this.currentUser = { id: 'guest-' + Math.random().toString(36).substring(2, 9), name: 'Guest User', email: '', roles: ['viewer'] };
            this.persistenceService.setUserId(this.currentUser!.id);
        }
        console.log('Current user loaded:', this.currentUser);
    }

    async login(username: string, password: string): Promise<boolean> {
        console.log(`Attempting login for ${username}...`);
        try {
            const response = await fetch(`${this.apiEndpoint}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!response.ok) throw new Error('Login failed.');
            const userData = await response.json();
            this.currentUser = { id: userData.id, name: userData.name, email: userData.email, roles: userData.roles };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.persistenceService.setUserId(this.currentUser.id);
            this.permissionsCache.clear(); // Clear permissions cache on login
            console.log('User logged in:', this.currentUser);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }

    async logout(): Promise<void> {
        console.log('User logged out.');
        this.currentUser = { id: 'guest-' + Math.random().toString(36).substring(2, 9), name: 'Guest User', email: '', roles: ['viewer'] };
        localStorage.removeItem('currentUser');
        this.persistenceService.setUserId(this.currentUser.id);
        this.permissionsCache.clear();
        await fetch(`${this.apiEndpoint}/logout`, { method: 'POST' }); // Invalidate server session
    }

    getCurrentUser(): { id: string; name: string; email: string; roles: string[] } | null {
        return this.currentUser;
    }

    async getWorkbookPermission(workbookId: string): Promise<PermissionLevel> {
        if (this.permissionsCache.has(workbookId)) {
            return this.permissionsCache.get(workbookId)!;
        }
        try {
            const response = await fetch(`${this.apiEndpoint}/workbook/${workbookId}/permission?userId=${this.currentUser?.id}`, {
                headers: { 'Authorization': `Bearer ${/* get auth token */''}` }
            });
            if (!response.ok) throw new Error('Failed to fetch permissions.');
            const { permissionLevel } = await response.json();
            this.permissionsCache.set(workbookId, permissionLevel);
            return permissionLevel;
        } catch (error) {
            console.error('Error fetching workbook permissions:', error);
            // Default to viewer if fetching fails
            this.permissionsCache.set(workbookId, 'viewer');
            return 'viewer';
        }
    }

    async updateWorkbookPermissions(workbookId: string, userId: string, level: PermissionLevel): Promise<void> {
        if (!this.canAccess('workbook', workbookId, 'admin')) {
            throw new Error('Unauthorized to change permissions.');
        }
        console.log(`Updating permissions for user ${userId} on workbook ${workbookId} to ${level}.`);
        try {
            const response = await fetch(`${this.apiEndpoint}/workbook/${workbookId}/permission`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${/* get auth token */''}` },
                body: JSON.stringify({ userId, permissionLevel: level })
            });
            if (!response.ok) throw new Error('Failed to update permissions.');
            this.permissionsCache.delete(workbookId); // Invalidate cache
            this.logSecurityEvent('PERMISSION_CHANGED', { workbookId, targetUserId: userId, newLevel: level });
        } catch (error) {
            console.error('Error updating workbook permissions:', error);
            throw error;
        }
    }

    canAccess(resource: 'workbook' | 'sheet' | 'cell' | 'feature', id: string, requiredLevel: PermissionLevel, userId?: string): boolean {
        const actingUser = this.currentUser;
        if (!actingUser) return false;

        const levelOrder = ['viewer', 'commenter', 'editor', 'admin', 'owner'];
        const currentUserEffectiveLevel = this.permissionsCache.get(id) || 'viewer'; // Fallback

        // Owner/Admin can do anything
        if (actingUser.roles.includes('global_admin')) return true;

        if (levelOrder.indexOf(currentUserEffectiveLevel) >= levelOrder.indexOf(requiredLevel)) {
            // Further checks can be added here, e.g., for specific cell/range permissions or DLP rules.
            return true;
        }
        this.logSecurityEvent('ACCESS_DENIED', { resource, id, requiredLevel, userId: actingUser.id, currentLevel: currentUserEffectiveLevel });
        return false;
    }

    // ... methods for encryption, auditing, data residency, GDPR compliance
    async encryptData(data: string, keyId: string, workbookId: string): Promise<string> {
        if (!this.canAccess('workbook', workbookId, 'editor')) throw new Error('Unauthorized to encrypt data.');
        // Simulate encryption with a key management service (KMS)
        const response = await fetch(`${this.apiEndpoint}/encrypt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${/* get auth token */''}` },
            body: JSON.stringify({ data, keyId, workbookId })
        });
        if (!response.ok) throw new Error('Encryption failed.');
        const result = await response.json();
        this.logSecurityEvent('DATA_ENCRYPTED', { workbookId, keyId });
        return result.encryptedData;
    }

    async decryptData(encryptedData: string, keyId: string, workbookId: string): Promise<string> {
        if (!this.canAccess('workbook', workbookId, 'viewer')) throw new Error('Unauthorized to decrypt data.');
        const response = await fetch(`${this.apiEndpoint}/decrypt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${/* get auth token */''}` },
            body: JSON.stringify({ encryptedData, keyId, workbookId })
        });
        if (!response.ok) throw new Error('Decryption failed.');
        const result = await response.json();
        this.logSecurityEvent('DATA_DECRYPTED', { workbookId, keyId });
        return result.decryptedData;
    }

    logSecurityEvent(eventType: string, details: any): void {
        console.log(`[SECURITY EVENT] ${eventType}:`, details, `by user ${this.currentUser?.id || 'anonymous'}`);
        // Send to an audit log service via PersistenceService
        this.persistenceService.enqueueOfflineAction('auditLog', { level: 'security', userId: this.currentUser?.id, action: eventType, details });
    }

    async checkDLPPolicy(workbook: WorkbookData, change: any): Promise<'allow' | 'warn' | 'block'> {
        const policy = workbook.settings.dataLossPreventionRules;
        if (!policy || policy.length === 0) return 'allow';

        // Simplified check: iterate through rules and apply
        for (const rule of policy) {
            if (rule.enabled && rule.appliesTo === 'cells' && change.newValue && typeof change.newValue === 'string') {
                const regex = new RegExp(rule.pattern, 'i');
                if (regex.test(change.newValue)) {
                    this.logSecurityEvent('DLP_TRIGGERED', { ruleId: rule.id, cell: change.address, detectedValue: change.newValue });
                    if (rule.action === 'block') return 'block';
                    if (rule.action === 'warn') return 'warn';
                }
            }
        }
        return 'allow';
    }
}

/**
 * Service for real-time collaboration.
 * Uses WebSockets or similar for persistent connection.
 */
export class CollaborationService {
    private socket: WebSocket | null = null;
    private workbookId: string | null = null;
    private userId: string = 'anonymous';
    private userName: string = 'Anonymous User';
    private activeSession: CollaborationSession | null = null;
    private onUpdateCallback: ((session: CollaborationSession) => void) | null = null;
    private onCellChangeCallback: ((sheetId: string, address: string, data: Partial<CellData>, userId: string) => void) | null = null;
    private pendingOperations: any[] = []; // For operational transformation (OT) or CRDTs
    private readonly endpoint: string;
    private reconnectionAttempts: number = 0;
    private maxReconnectionAttempts: number = 5;
    private reconnectionDelayMs: number = 2000; // 2 seconds

    constructor(endpoint: string = 'ws://localhost:8080/collaboration') {
        this.endpoint = endpoint;
    }

    connect(workbookId: string, userId: string, userName: string, onUpdate: (session: CollaborationSession) => void, onCellChange: (sheetId: string, address: string, data: Partial<CellData>, userId: string) => void) {
        this.workbookId = workbookId;
        this.userId = userId;
        this.userName = userName;
        this.onUpdateCallback = onUpdate;
        this.onCellChangeCallback = onCellChange;

        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            this.socket.close();
        }

        this.initializeWebSocket();
    }

    private initializeWebSocket() {
        console.log(`Attempting to connect collaboration socket for ${this.workbookId} as ${this.userName}...`);
        this.socket = new WebSocket(`${this.endpoint}?workbookId=${this.workbookId}&userId=${this.userId}&userName=${this.userName}`);

        this.socket.onopen = () => {
            console.log('Collaboration socket connected.');
            this.reconnectionAttempts = 0;
            this.send({ type: 'JOIN_WORKBOOK', payload: { workbookId: this.workbookId, userId: this.userId, userName: this.userName } });
            this.processPendingOperations();
        };

        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
        };

        this.socket.onclose = (event) => {
            console.log(`Collaboration socket disconnected: Code=${event.code}, Reason=${event.reason}`);
            this.activeSession = null;
            if (event.code !== 1000 && this.reconnectionAttempts < this.maxReconnectionAttempts) { // 1000 is normal closure
                this.reconnectionAttempts++;
                console.log(`Attempting to reconnect in ${this.reconnectionDelayMs / 1000}s (Attempt ${this.reconnectionAttempts}/${this.maxReconnectionAttempts})...`);
                setTimeout(() => this.initializeWebSocket(), this.reconnectionDelayMs);
            } else if (this.reconnectionAttempts >= this.maxReconnectionAttempts) {
                console.error('Max reconnection attempts reached. Collaboration is offline.');
            }
        };

        this.socket.onerror = (error) => {
            console.error('Collaboration socket error:', error);
            this.socket?.close(); // Force close to trigger onclose and reconnection logic
        };
    }

    disconnect() {
        if (this.socket) {
            this.socket.close(1000, 'User initiated disconnect.');
        }
        if (this.syncIntervalId) clearInterval(this.syncIntervalId); // Stop sync scheduler too
    }

    private handleMessage(message: any) {
        switch (message.type) {
            case 'SESSION_UPDATE':
                this.activeSession = message.payload as CollaborationSession;
                this.onUpdateCallback?.(this.activeSession);
                break;
            case 'CELL_CHANGE':
                // Apply change (potentially using OT/CRDT logic)
                this.onCellChangeCallback?.(message.payload.sheetId, message.payload.address, message.payload.data, message.payload.userId);
                break;
            case 'CURSOR_UPDATE':
            case 'SELECTION_UPDATE':
                if (this.activeSession) {
                    const user = this.activeSession.activeUsers.find(u => u.userId === message.payload.userId);
                    if (user) {
                        if (message.type === 'CURSOR_UPDATE') user.cursorPosition = message.payload.position;
                        if (message.type === 'SELECTION_UPDATE') user.selectionRange = message.payload.range;
                        user.lastActivity = Date.now();
                        this.onUpdateCallback?.({ ...this.activeSession }); // Trigger update
                    }
                }
                break;
            case 'CHAT_MESSAGE':
                if (this.activeSession) {
                    this.activeSession.chatMessages.push(message.payload);
                    this.onUpdateCallback?.({ ...this.activeSession });
                }
                break;
            case 'LOCK_ACQUIRED':
                console.log(`Cell ${message.payload.cellAddress} locked by ${message.payload.userId}`);
                // Update activeSession.coEditingLocks
                if (this.activeSession) {
                    this.activeSession.coEditingLocks = [...(this.activeSession.coEditingLocks || []), { cellAddress: message.payload.cellAddress, userId: message.payload.userId, timestamp: Date.now() }];
                    this.onUpdateCallback?.({ ...this.activeSession });
                }
                break;
            case 'LOCK_RELEASED':
                console.log(`Cell ${message.payload.cellAddress} unlocked by ${message.payload.userId}`);
                if (this.activeSession?.coEditingLocks) {
                    this.activeSession.coEditingLocks = this.activeSession.coEditingLocks.filter(lock => lock.cellAddress !== message.payload.cellAddress);
                    this.onUpdateCallback?.({ ...this.activeSession });
                }
                break;
            case 'ERROR':
                console.error('Collaboration error:', message.payload.message);
                break;
            default:
                console.warn('Unknown collaboration message type:', message.type);
        }
    }

    send(message: any) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.warn('Collaboration socket not open, queuing message:', message);
            this.pendingOperations.push(message);
            // In a real app, queue this to PersistenceService for offline sync
            // A smarter OT/CRDT library would handle local application and remote syncing seamlessly.
        }
    }

    private processPendingOperations() {
        while (this.pendingOperations.length > 0 && this.socket?.readyState === WebSocket.OPEN) {
            const op = this.pendingOperations.shift();
            if (op) {
                this.socket.send(JSON.stringify(op));
            }
        }
    }

    sendCellChange(sheetId: string, address: string, data: Partial<CellData>) {
        this.send({ type: 'CELL_CHANGE', payload: { sheetId, address, data, userId: this.userId } });
    }

    sendCursorUpdate(position: string) {
        this.send({ type: 'CURSOR_UPDATE', payload: { userId: this.userId, position } });
    }

    sendSelectionUpdate(range: string) {
        this.send({ type: 'SELECTION_UPDATE', payload: { userId: this.userId, range } });
    }

    sendChatMessage(text: string) {
        const message: CollaborationChatMessage = {
            id: crypto.randomUUID(),
            userId: this.userId,
            userName: this.userName,
            timestamp: Date.now(),
            text
        };
        this.send({ type: 'CHAT_MESSAGE', payload: message });
    }

    requestCellLock(sheetId: string, cellAddress: string): Promise<boolean> {
        return new Promise(resolve => {
            if (this.activeSession?.coEditingLocks?.some(l => l.cellAddress === cellAddress && l.userId !== this.userId)) {
                console.warn(`Cell ${cellAddress} is already locked by another user.`);
                resolve(false);
                return;
            }
            this.send({ type: 'REQUEST_LOCK', payload: { sheetId, cellAddress, userId: this.userId } });
            // In a real system, the server would respond with LOCK_ACQUIRED or LOCK_FAILED
            // For this example, we'll simulate success for now.
            resolve(true);
        });
    }

    releaseCellLock(sheetId: string, cellAddress: string): Promise<void> {
        this.send({ type: 'RELEASE_LOCK', payload: { sheetId, cellAddress, userId: this.userId } });
        return Promise.resolve();
    }

    async inviteUser(email: string, permission: PermissionLevel): Promise<void> {
        if (!this.workbookId) throw new Error("No workbook active for invitation.");
        console.log(`Inviting ${email} to workbook ${this.workbookId} with ${permission} permission.`);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`Invitation sent to ${email}.`);
        this.send({ type: 'INVITE_USER', payload: { workbookId: this.workbookId, invitedEmail: email, permission, inviterId: this.userId } });
    }

    async shareView(range: string): Promise<void> {
        if (!this.workbookId || !this.activeSession) throw new Error("No active collaboration session to share view.");
        const viewId = crypto.randomUUID();
        const newSharedView = { viewId, userId: this.userId, range, zoom: 1, currentSheetId: this.activeSession.activeUsers.find(u => u.userId === this.userId)?.lastActivity || '' }; // Placeholder for currentSheetId
        this.send({ type: 'SHARE_VIEW', payload: { workbookId: this.workbookId, sharedView: newSharedView } });
        console.log(`View shared: ${range}`);
    }

    getActiveSession(): CollaborationSession | null {
        return this.activeSession;
    }

    // ... methods for version merging, conflict resolution (OT/CRDT specific)
}

/**
 * Service for AI/ML capabilities, interacting with various models.
 */
export class AIInferenceService {
    private endpoint = '/api/ai';
    private availableModels: AIModelInfo[] = [];

    constructor() {
        this.fetchAvailableModels();
    }

    private async fetchAvailableModels(): Promise<void> {
        try {
            const response = await fetch(`${this.endpoint}/models`);
            if (response.ok) {
                this.availableModels = await response.json();
                console.log('Available AI Models:', this.availableModels);
            }
        } catch (error) {
            console.error('Failed to fetch AI models:', error);
        }
    }

    getAvailableAIModels(): AIModelInfo[] {
        return this.availableModels;
    }

    getAIModelBinding(bindingId: string, workbook: WorkbookData): AIModelBinding | undefined {
        return workbook.aiModelBindings?.find(b => b.id === bindingId);
    }

    /**
     * Generates formula suggestions based on input data or natural language.
     * @param contextData A sample of the data or a natural language query.
     * @param contextRange Optional: The range context (e.g., for relative formula suggestions).
     */
    async generateFormulaSuggestion(contextData: string | any[], contextRange?: string): Promise<string[]> {
        console.log('Requesting AI formula suggestion...', contextData);
        try {
            const response = await fetch(`${this.endpoint}/suggest-formula`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context: contextData, range: contextRange })
            });
            if (!response.ok) throw new Error(`AI service error: ${response.statusText}`);
            const data = await response.json();
            return data.suggestions; // e.g., ["=SUM(A1:A10)", "=AVERAGE(A1:A10)"]
        } catch (error) {
            console.error('Error generating formula suggestion:', error);
            return [];
        }
    }

    /**
     * Analyzes a given data range for insights, trends, anomalies, etc.
     */
    async analyzeDataForInsights(rangeData: any[], options?: { workbookId: string; sheetId: string; range: string }): Promise<DataInsight[]> {
        console.log('Requesting AI data insights...', rangeData);
        try {
            const response = await fetch(`${this.endpoint}/analyze-data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: rangeData, context: options })
            });
            if (!response.ok) throw new Error(`AI service error: ${response.statusText}`);
            const data = await response.json();
            return data.insights.map((insight: any) => ({ ...insight, generatedTimestamp: Date.now() }));
        } catch (error) {
            console.error('Error analyzing data for insights:', error);
            return [];
        }
    }

    /**
     * Performs Natural Language Query (NLQ) against spreadsheet data.
     * @param query Natural language question (e.g., "What is the total sales for Q1?").
     * @param workbookContextData Contextual data from the workbook (e.g., sheet names, named ranges).
     */
    async performNaturalLanguageQuery(query: string, workbookContextData: any): Promise<any> {
        console.log(`Performing NLQ: "${query}"`);
        try {
            const response = await fetch(`${this.endpoint}/nlq`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, context: workbookContextData })
            });
            if (!response.ok) throw new Error(`AI service error: ${response.statusText}`);
            const data = await response.json();
            return data; // Could be a value, a range, a suggested chart, a generated formula
        } catch (error) {
            console.error('Error performing NLQ:', error);
            return { error: 'Failed to process natural language query.' };
        }
    }

    /**
     * Applies a specific AI model binding to input data and returns the results.
     */
    async applyAIModel(binding: AIModelBinding, inputData: any): Promise<any> {
        console.log(`Applying AI model ${binding.modelId} (binding ${binding.id})...`);
        try {
            const response = await fetch(`${this.endpoint}/apply-model/${binding.modelId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inputConfig: binding.inputConfig, inputData, settings: binding.settings })
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(`AI model application failed: ${response.status} - ${errorData.message}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error applying AI model ${binding.modelId}:`, error);
            throw error;
        }
    }

    /**
     * Initiates training or fine-tuning of an AI model.
     * @param modelId The ID of the model to train.
     * @param trainingData The data used for training.
     * @param config Training configuration.
     */
    async trainAIModel(modelId: string, trainingData: any, config: any = {}): Promise<boolean> {
        console.log(`Initiating training for AI model ${modelId}...`);
        try {
            const response = await fetch(`${this.endpoint}/train-model/${modelId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trainingData, config })
            });
            if (!response.ok) throw new Error(`AI model training failed: ${response.statusText}`);
            console.log(`AI model ${modelId} training initiated successfully.`);
            return true;
        } catch (error) {
            console.error(`Error initiating AI model training for ${modelId}:`, error);
            return false;
        }
    }
    // ... methods for model management, ethical AI guidelines, prompt engineering, cost management
}

/**
 * Service for managing plugins and extensions.
 */
export class PluginManagerService {
    private plugins: { [id: string]: { config: PluginConfig; instance: any } } = {};
    private pluginRegistryUrl: string = '/api/plugins/registry';
    private onPluginEventHandlers: Map<string, Function[]> = new Map(); // EventType -> [Handlers]
    private customFunctionService: FormulaEngineService; // Reference to the formula engine

    constructor(formulaEngineService: FormulaEngineService) {
        this.customFunctionService = formulaEngineService;
        this.loadInitialPlugins();
    }

    private async loadInitialPlugins() {
        console.log("Loading initial plugins...");
        const savedPlugins = JSON.parse(localStorage.getItem('enabledPlugins') || '[]'); // Example persistence
        for (const pluginId of savedPlugins) {
            // In a real app, fetch config from backend or manifest URL
            const exampleConfig: PluginConfig = {
                id: pluginId, name: `Example Plugin ${pluginId}`, version: '1.0.0', enabled: true,
                url: `/plugins/${pluginId}/index.js`, permissions: ['read_cells'], settings: {}, description: 'A sample plugin.'
            };
            // Example of a specific plugin logic
            if (pluginId === 'chartingEnhancer') {
                exampleConfig.url = '/plugins/chartingEnhancer/index.js';
                exampleConfig.permissions.push('create_charts');
                exampleConfig.description = 'Enhances charting capabilities with new types and interactivity.';
            } else if (pluginId === 'dataCleaner') {
                exampleConfig.url = '/plugins/dataCleaner/index.js';
                exampleConfig.permissions.push('read_cells', 'write_cells');
                exampleConfig.description = 'Provides advanced data cleaning and transformation tools.';
            }

            if (exampleConfig) {
                await this.loadPlugin(exampleConfig);
            }
        }
    }

    async getAvailablePlugins(): Promise<PluginConfig[]> {
        try {
            const response = await fetch(this.pluginRegistryUrl);
            if (!response.ok) throw new Error(`Failed to fetch plugin registry: ${response.statusText}`);
            return await response.json(); // List of all plugins in the registry
        } catch (error) {
            console.error('Error fetching available plugins:', error);
            return [];
        }
    }

    async loadPlugin(config: PluginConfig): Promise<void> {
        if (this.plugins[config.id]) {
            console.warn(`Plugin ${config.name} already loaded.`);
            return;
        }
        console.log(`Loading plugin: ${config.name} from ${config.url}`);
        try {
            // Dynamically import the plugin's entry point
            // This requires careful security consideration for production.
            // Using Web Workers with sandboxing, or secure iframes is recommended.
            const pluginModule = await import(/* @vite-ignore */ config.url);
            const PluginClass = pluginModule.default; // Assuming default export is the plugin class

            const pluginInstance = new PluginClass({
                id: config.id,
                name: config.name,
                version: config.version,
                settings: config.settings,
                // Provide APIs for the plugin to interact with the spreadsheet
                api: {
                    getCells: (sheetId: string, range: string) => this.getWorkbookContext().getRangeData(sheetId, range),
                    setCells: async (sheetId: string, address: string, value: any) => await this.getWorkbookContext().updateCell(sheetId, address, { value }), // Simplified
                    onEvent: (eventType: string, handler: Function) => this.registerPluginEventHandler(eventType, handler),
                    registerCustomFunction: (def: CustomFunctionDefinition) => this.customFunctionService.addCustomFunction(def),
                    showNotification: (msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => this.emitPluginEvent('showNotification', { message: msg, type }),
                    // Full access to core services could be granted, subject to permissions
                    getWorkbookData: () => this.getWorkbookContext().workbook,
                    getCurrentUser: () => this.getSecurityService().getCurrentUser(),
                    runAIModel: (modelId: string, inputData: any) => this.getAIInferenceService().applyAIModel(this.getAIInferenceService().getAIModelBinding(modelId, this.getWorkbookContext().workbook!)!, inputData),
                    // ... many more APIs for data, UI, AI, collaboration
                }
            });

            await pluginInstance.init?.(this.getWorkbookContext().workbook); // Call an initialization method if exists

            this.plugins[config.id] = { config, instance: pluginInstance };
            config.enabled = true;
            // Update persistence
            const savedPlugins = JSON.parse(localStorage.getItem('enabledPlugins') || '[]');
            if (!savedPlugins.includes(config.id)) {
                localStorage.setItem('enabledPlugins', JSON.stringify([...savedPlugins, config.id]));
            }
            console.log(`Plugin ${config.name} loaded and initialized.`);
            this.emitPluginEvent('pluginLoaded', { pluginId: config.id, name: config.name });
        } catch (error) {
            console.error(`Failed to load plugin ${config.name}:`, error);
            this.emitPluginEvent('pluginLoadError', { pluginId: config.id, name: config.name, error: error.message });
        }
    }

    async unloadPlugin(pluginId: string): Promise<void> {
        const pluginEntry = this.plugins[pluginId];
        if (!pluginEntry) {
            console.warn(`Plugin ${pluginId} not loaded.`);
            return;
        }
        console.log(`Unloading plugin: ${pluginEntry.config.name}`);
        if (pluginEntry.instance.destroy) {
            await pluginEntry.instance.destroy(); // Call cleanup method
        }
        pluginEntry.config.enabled = false;
        delete this.plugins[pluginId];
        // Unregister any custom functions provided by this plugin
        // (Requires tracking which functions came from which plugin)
        // Update persistence
        let savedPlugins = JSON.parse(localStorage.getItem('enabledPlugins') || '[]');
        savedPlugins = savedPlugins.filter((id: string) => id !== pluginId);
        localStorage.setItem('enabledPlugins', JSON.stringify(savedPlugins));
        console.log(`Plugin ${pluginEntry.config.name} unloaded.`);
        this.emitPluginEvent('pluginUnloaded', { pluginId: pluginEntry.config.id, name: pluginEntry.config.name });
    }

    getPluginInstance(pluginId: string): any | undefined {
        return this.plugins[pluginId]?.instance;
    }

    getAllLoadedPlugins(): PluginConfig[] {
        return Object.values(this.plugins).map(p => p.config);
    }

    registerPluginEventHandler(eventType: string, handler: Function) {
        if (!this.onPluginEventHandlers.has(eventType)) {
            this.onPluginEventHandlers.set(eventType, []);
        }
        this.onPluginEventHandlers.get(eventType)?.push(handler);
    }

    emitPluginEvent(eventType: string, payload: any) {
        this.onPluginEventHandlers.get(eventType)?.forEach(handler => {
            try {
                handler(payload);
            } catch (error) {
                console.error(`Error in plugin event handler for ${eventType}:`, error);
            }
        });
    }

    // These would be injected during provider setup, as they depend on React Context
    private _getWorkbookContext: () => IWorkbookContext;
    private _getSecurityService: () => SecurityService;
    private _getAIInferenceService: () => AIInferenceService;

    setServiceGetters(getWbCtx: () => IWorkbookContext, getSecSvc: () => SecurityService, getAISvc: () => AIInferenceService) {
        this._getWorkbookContext = getWbCtx;
        this._getSecurityService = getSecSvc;
        this._getAIInferenceService = getAISvc;
    }

    private getWorkbookContext(): IWorkbookContext {
        if (!this._getWorkbookContext) throw new Error("WorkbookContext getter not set for PluginManager.");
        return this._getWorkbookContext();
    }
    private getSecurityService(): SecurityService {
        if (!this._getSecurityService) throw new Error("SecurityService getter not set for PluginManager.");
        return this._getSecurityService();
    }
    private getAIInferenceService(): AIInferenceService {
        if (!this._getAIInferenceService) throw new Error("AIInferenceService getter not set for PluginManager.");
        return this._getAIInferenceService();
    }

    // ... methods for plugin security, sandboxing, version management, marketplace integration, update management
}


// --- New UI-related Components/Contexts (exported, will wrap Spreadsheet) ---

/**
 * This is the main application provider that orchestrates all services and state.
 * It will hold the primary workbook data and global application state.
 */
export const SpreadsheetUniverseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [workbook, setWorkbookData] = useState<WorkbookData | null>(null);
    const [currentSheetId, setCurrentSheetId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [userSettings, setUserSettings] = useState<WorkbookSettings>(() => ({
        locale: 'en-US', timezone: 'UTC', currencySymbol: '$', decimalSeparator: '.', thousandsSeparator: ',', dateFormat: 'YYYY-MM-DD', timeFormat: 'HH:mm',
        autoSaveEnabled: true, autoSaveInterval: 30, undoRedoStackSize: 100, keyboardShortcutsScheme: 'googleSheets', defaultChartType: 'bar', defaultPivotLayout: 'compact',
        dataPrivacyLevel: 'private', offlineModeEnabled: false, smartFillEnabled: true, naturalLanguageQueryEnabled: true, aiAssistantEnabled: true, realtimeCollaborationEnabled: true,
        maxHistorySnapshots: 50, maxWorkerThreads: navigator.hardwareConcurrency || 4, loggingLevel: 'info', accessibilitySettings: { highContrastMode: false, textSize: 'medium', screenReaderSupport: false, colorBlindnessMode: 'none', animationReduction: false, motionReduction: false, keyboardNavigationFocusRing: true },
        defaultFont: 'Roboto', defaultFontSize: 10, developerModeEnabled: false, darkModeAutoSwitch: 'system', advancedPerformanceMonitoring: false, autoCleanupOldVersions: true, customScriptsWhitelist: [], dataMaskingRules: []
    }));
    const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(() => ({
        id: 'default-light', name: 'Default Light', isDark: false, colors: {
            primary: '#1a73e8', secondary: '#4285f4', background: '#ffffff', surface: '#f8f8f8', text: '#202124', textSecondary: '#5f6368',
            border: '#dadce0', success: '#34a853', warning: '#fbbc04', error: '#ea4335', info: '#4285f4', selection: '#c2e7ff', highlight: '#fef7e0',
            gridLine: '#e0e0e0', headerBg: '#f0f0f0', headerText: '#202124', formulaBarBg: '#fdfdfd', scrollBarThumb: '#c1c1c1', scrollBarTrack: '#f0f0f0',
            activeTabBg: '#ffffff', inactiveTabBg: '#e9e9e9', buttonPrimaryBg: '#1a73e8', buttonPrimaryText: '#ffffff', buttonSecondaryBg: '#f0f0f0', buttonSecondaryText: '#202124',
            dialogBg: '#ffffff', dialogText: '#202124', inputBg: '#ffffff', inputText: '#202124', shadowColor: 'rgba(60,64,67,0.15)'
        }, fonts: { body: 'Roboto, sans-serif', heading: 'Roboto, sans-serif', monospace: 'Fira Mono, monospace', fontSizeBase: '14px' }, spacing: { unit: 8, padding: 12, margin: 16, borderRadius: 4 },
        shadows: { small: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)', medium: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)', large: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)' },
        transitions: { easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', durationBase: '0.2s' }
    }));
    const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; roles: string[] }>({ id: 'guest', name: 'Guest', email: '', roles: ['viewer'] });
    const [collaborationSession, setCollaborationSession] = useState<CollaborationSession | null>(null);
    const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [aiError, setAiError] = useState<Error | null>(null);
    const [dataSources, setDataSources] = useState<DataSourceConfig[]>([]);
    const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'info' | 'success' | 'warning' | 'error'; dismissible: boolean }[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isDeveloperMode, setIsDeveloperMode] = useState(false); // For scripting access etc.

    // Instantiate services
    // Use `useRef` for services that should be singleton and not re-instantiated on every render,
    // but initialized once. Their methods are stable and can be passed around.
    const persistenceServiceRef = useRef(new PersistenceService('hybrid', currentUser.id));
    const securityServiceRef = useRef(new SecurityService(persistenceServiceRef.current));
    const formulaEngineServiceRef = useRef(new FormulaEngineService());
    const collaborationServiceRef = useRef(new CollaborationService());
    const aiInferenceServiceRef = useRef(new AIInferenceService());
    const pluginManagerServiceRef = useRef(new PluginManagerService(formulaEngineServiceRef.current));

    // Inject service getters into PluginManager after all services are instantiated
    useEffect(() => {
        pluginManagerServiceRef.current.setServiceGetters(
            () => workbookContextValue,
            () => securityServiceRef.current,
            () => aiInferenceServiceRef.current
        );
        // Also register for plugin-emitted notifications
        pluginManagerServiceRef.current.registerPluginEventHandler('showNotification', (payload: any) => addNotification(payload.message, payload.type, payload.dismissible));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps


    // Effect to load initial workbook (e.g., from URL or last opened)
    useEffect(() => {
        const loadInitialWorkbook = async () => {
            setIsLoading(true);
            try {
                // Restore current user if available
                const user = securityServiceRef.current.getCurrentUser();
                if (user) {
                    setCurrentUser(user);
                    persistenceServiceRef.current.setUserId(user.id);
                }

                // Load user settings (theme, locale etc.)
                const savedUserSettings = await persistenceServiceRef.current.loadUserSettings(user?.id || 'default');
                if (savedUserSettings) {
                    setUserSettings(prev => ({ ...prev, ...savedUserSettings }));
                    if (savedUserSettings.developerModeEnabled !== undefined) {
                        setIsDeveloperMode(savedUserSettings.developerModeEnabled);
                    }
                }
                const preferredTheme = savedUserSettings?.themeId ? await fetchTheme(savedUserSettings.themeId) : null;
                if (preferredTheme) setCurrentTheme(preferredTheme);


                // Simulate loading a workbook (e.g., from URL parameter or default)
                let loadedWorkbook: WorkbookData | null = await persistenceServiceRef.current.loadWorkbook('default-workbook-id');
                if (!loadedWorkbook) {
                    // Create a brand new workbook if none exists
                    loadedWorkbook = {
                        id: 'default-workbook-id', name: 'New Abacus Workbook',
                        creationDate: Date.now(), lastOpenedDate: Date.now(), lastSavedDate: Date.now(), fileFormatVersion: '1.0',
                        sheets: {
                            'sheet1': {
                                id: 'sheet1', name: 'Sheet1', index: 0, cells: { 'A1': { value: 'Hello Abacus Universe!', type: 'text' } },
                                rows: {}, columns: {}, defaultRowHeight: 20, defaultColumnWidth: 80, gridLinesVisible: true, showHeaders: true,
                                ownerId: user?.id || 'guest', lastModified: Date.now()
                            }
                        },
                        activeSheetId: 'sheet1',
                        theme: preferredTheme || currentTheme, settings: userSettings, userPermissions: { [user?.id || 'guest']: 'owner' }
                    };
                    await persistenceServiceRef.current.saveWorkbook(loadedWorkbook); // Save the new workbook
                }
                setWorkbookData(loadedWorkbook);
                setCurrentSheetId(loadedWorkbook.activeSheetId);
                formulaEngineServiceRef.current.setWorkbookData(loadedWorkbook);
                securityServiceRef.current.getWorkbookPermission(loadedWorkbook.id); // Cache initial permissions
                setDataSources(loadedWorkbook.dataSources || []); // Load workbook-specific data sources
            } catch (err: any) {
                setError(err);
                console.error("Failed to load workbook:", err);
                addNotification(`Failed to load workbook: ${err.message}`, 'error', true);
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialWorkbook();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps (initial load only)

    // Update theme based on accessibility settings
    useEffect(() => {
        const rootStyle = document.documentElement.style;
        Object.entries(currentTheme.colors).forEach(([key, value]) => {
            rootStyle.setProperty(`--${key}`, value);
        });
        Object.entries(currentTheme.fonts).forEach(([key, value]) => {
            rootStyle.setProperty(`--font-${key}`, value);
        });
        rootStyle.setProperty(`--shadow-small`, currentTheme.shadows.small);
        rootStyle.setProperty(`--shadow-medium`, currentTheme.shadows.medium);
        rootStyle.setProperty(`--shadow-large`, currentTheme.shadows.large);
        rootStyle.setProperty(`--border-radius`, `${currentTheme.spacing.borderRadius}px`);

        if (userSettings.accessibilitySettings.highContrastMode) {
            document.body.classList.add('high-contrast-mode');
        } else {
            document.body.classList.remove('high-contrast-mode');
        }
    }, [currentTheme, userSettings.accessibilitySettings.highContrastMode]);

    // Auto-save effect
    useEffect(() => {
        if (!workbook || !userSettings.autoSaveEnabled) return;
        const interval = setInterval(() => {
            console.log('Auto-saving workbook...');
            persistenceServiceRef.current.saveWorkbook(workbook);
            // Also sync offline queue if online
            if (!userSettings.offlineModeEnabled) {
                persistenceServiceRef.current.syncOfflineQueue();
            }
            addNotification('Workbook auto-saved.', 'info', false);
        }, userSettings.autoSaveInterval * 1000);
        return () => clearInterval(interval);
    }, [workbook, userSettings.autoSaveEnabled, userSettings.autoSaveInterval, persistenceServiceRef, userSettings.offlineModeEnabled]);

    // Collaboration setup effect
    useEffect(() => {
        if (workbook && currentUser.id !== 'guest' && userSettings.realtimeCollaborationEnabled) {
            collaborationServiceRef.current.connect(
                workbook.id,
                currentUser.id,
                currentUser.name,
                setCollaborationSession,
                async (sheetId, address, data, userId) => {
                    // Apply incoming collaboration changes
                    setWorkbookData(prevWorkbook => {
                        if (!prevWorkbook) return null;
                        if (!securityServiceRef.current.canAccess('cell', `${sheetId}!${address}`, 'editor', userId)) {
                            console.warn(`Collaboration: User ${userId} tried to write to protected cell ${sheetId}!${address}`);
                            return prevWorkbook;
                        }
                        const newWorkbook = { ...prevWorkbook };
                        const sheet = newWorkbook.sheets[sheetId];
                        if (sheet) {
                            sheet.cells = { ...sheet.cells, [address]: { ...sheet.cells[address], ...data } };
                            // If formula changed by collaboration, queue recalculation
                            if (data.formula || data.value !== undefined) {
                                formulaEngineServiceRef.current.queueRecalculation(sheetId, [address]);
                            }
                            sheet.lastModified = Date.now();
                        }
                        return newWorkbook;
                    });
                    addNotification(`User ${userId} updated ${sheetId}!${address}`, 'info', false);
                }
            );
        } else {
            collaborationServiceRef.current.disconnect();
        }
        return () => collaborationServiceRef.current.disconnect();
    }, [workbook?.id, currentUser.id, currentUser.name, userSettings.realtimeCollaborationEnabled, collaborationServiceRef, formulaEngineServiceRef, securityServiceRef]);

    // Function to add notifications
    const addNotification = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error', dismissible: boolean = true) => {
        setNotifications(prev => [...prev, { id: crypto.randomUUID(), message, type, dismissible }]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.message !== message)), 5000); // Auto-dismiss after 5s
    }, []);

    const dismissNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Fetch theme from a simulated API
    const fetchTheme = async (themeId: string): Promise<ThemeConfig | null> => {
        // Simulate API call to fetch theme data
        console.log(`Fetching theme ${themeId}...`);
        await new Promise(r => setTimeout(r, 200));
        // Return a dummy dark theme for example
        if (themeId === 'dark-theme') {
            return {
                id: 'dark-theme', name: 'Dark Mode', isDark: true, colors: {
                    primary: '#90CAF9', secondary: '#BBDEFB', background: '#121212', surface: '#1E1E1E', text: '#E0E0E0', textSecondary: '#B0B0B0',
                    border: '#424242', success: '#66BB6A', warning: '#FFCA28', error: '#EF5350', info: '#2196F3', selection: '#303F9F', highlight: '#424242',
                    gridLine: '#333333', headerBg: '#2E2E2E', headerText: '#E0E0E0', formulaBarBg: '#282828', scrollBarThumb: '#555555', scrollBarTrack: '#282828',
                    activeTabBg: '#1E1E1E', inactiveTabBg: '#282828', buttonPrimaryBg: '#90CAF9', buttonPrimaryText: '#121212', buttonSecondaryBg: '#424242', buttonSecondaryText: '#E0E0E0',
                    dialogBg: '#1E1E1E', dialogText: '#E0E0E0', inputBg: '#282828', inputText: '#E0E0E0', shadowColor: 'rgba(0,0,0,0.5)'
                }, fonts: currentTheme.fonts, spacing: currentTheme.spacing, shadows: currentTheme.shadows, transitions: currentTheme.transitions
            };
        }
        return null;
    };


    // Workbook Context Implementations
    const workbookContextValue = useMemo<IWorkbookContext>(() => {
        const activeSheet = currentSheetId && workbook?.sheets[currentSheetId] ? workbook.sheets[currentSheetId] : null;

        const updateCell = async (sheetId: string, address: string, data: Partial<CellData>, silent: boolean = false) => {
            if (!workbook) return;
            const currentCell = workbook.sheets[sheetId]?.cells[address];

            // DLP Policy check
            const dlpResult = await securityServiceRef.current.checkDLPPolicy(workbook, { sheetId, address, oldValue: currentCell?.value, newValue: data.value, oldFormula: currentCell?.formula, newFormula: data.formula });
            if (dlpResult === 'block') {
                addNotification(`Data Loss Prevention prevented update to ${address}.`, 'error', true);
                return;
            }
            if (dlpResult === 'warn') {
                addNotification(`Warning: Sensitive data detected in ${address}.`, 'warning', true);
            }

            if (!securityServiceRef.current.canAccess('cell', `${sheetId}!${address}`, 'editor')) {
                addNotification(`Permission denied to edit cell ${address}.`, 'error', true);
                return;
            }

            const newWorkbook = { ...workbook, lastSavedDate: Date.now() };
            const sheet = newWorkbook.sheets[sheetId];
            if (sheet) {
                const newCellData = { ...sheet.cells[address], ...data };

                // Add to cell-level change history
                if (currentCell && (currentCell.value !== newCellData.value || currentCell.formula !== newCellData.formula)) {
                    newCellData.changeHistory = [...(newCellData.changeHistory || []), {
                        timestamp: Date.now(),
                        userId: currentUser.id,
                        oldValue: currentCell.value,
                        newValue: newCellData.value,
                        oldFormula: currentCell.formula,
                        newFormula: newCellData.formula,
                        changeType: newCellData.formula ? 'formula' : 'value'
                    }];
                }

                sheet.cells = { ...sheet.cells, [address]: newCellData };
                sheet.lastModified = Date.now();
                setWorkbookData(newWorkbook);
                persistenceServiceRef.current.saveWorkbook(newWorkbook); // Immediate save/queue

                // Notify collaboration service ONLY if not a silent update (e.g., from collaboration itself)
                if (!silent && userSettings.realtimeCollaborationEnabled) {
                    collaborationServiceRef.current.sendCellChange(sheetId, address, data);
                }
                // Trigger formula recalculation
                if (data.formula !== undefined || data.value !== undefined) {
                    formulaEngineServiceRef.current.queueRecalculation(sheetId, [address]);
                }
                // Log audit event
                persistenceServiceRef.current.enqueueOfflineAction('auditLog', {
                    level: 'info', userId: currentUser.id, action: 'CELL_EDIT',
                    details: { workbookId: workbook.id, sheetId, address, oldValue: currentCell?.value, newValue: newCellData.value, oldFormula: currentCell?.formula, newFormula: newCellData.formula }
                });
            }
        };

        const updateSheet = async (sheetId: string, data: Partial<SheetData>) => {
            if (!workbook) return;
            if (!securityServiceRef.current.canAccess('sheet', sheetId, 'editor')) {
                addNotification(`Permission denied to edit sheet settings.`, 'error', true);
                return;
            }
            const newWorkbook = { ...workbook, lastSavedDate: Date.now() };
            const sheet = newWorkbook.sheets[sheetId];
            if (sheet) {
                newWorkbook.sheets[sheetId] = { ...sheet, ...data, lastModified: Date.now() };
                setWorkbookData(newWorkbook);
                persistenceServiceRef.current.saveWorkbook(newWorkbook);
                persistenceServiceRef.current.enqueueOfflineAction('auditLog', {
                    level: 'info', userId: currentUser.id, action: 'SHEET_UPDATE',
                    details: { workbookId: workbook.id, sheetId, changedProps: Object.keys(data) }
                });
            }
        };

        const addSheet = async (name?: string) => {
            if (!workbook) return '';
            if (!securityServiceRef.current.canAccess('workbook', workbook.id, 'editor')) {
                addNotification(`Permission denied to add new sheets.`, 'error', true);
                return '';
            }
            const newSheetId = `sheet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            const newSheet: SheetData = {
                id: newSheetId, name: name || `Sheet${Object.keys(workbook.sheets).length + 1}`, index: Object.keys(workbook.sheets).length,
                cells: {}, rows: {}, columns: {}, defaultRowHeight: 20, defaultColumnWidth: 80, gridLinesVisible: true, showHeaders: true,
                ownerId: currentUser.id, lastModified: Date.now()
            };
            const newWorkbook = {
                ...workbook,
                sheets: { ...workbook.sheets, [newSheetId]: newSheet },
                activeSheetId: newSheetId,
                lastSavedDate: Date.now()
            };
            setWorkbookData(newWorkbook);
            setCurrentSheetId(newSheetId);
            await persistenceServiceRef.current.saveWorkbook(newWorkbook);
            persistenceServiceRef.current.enqueueOfflineAction('auditLog', {
                level: 'info', userId: currentUser.id, action: 'SHEET_ADDED',
                details: { workbookId: workbook.id, sheetId: newSheetId, sheetName: newSheet.name }
            });
            return newSheetId;
        };

        const deleteSheet = async (sheetId: string) => {
            if (!workbook) return;
            if (!securityServiceRef.current.canAccess('sheet', sheetId, 'editor')) {
                addNotification(`Permission denied to delete sheets.`, 'error', true);
                return;
            }
            const newSheets = { ...workbook.sheets };
            const deletedSheetName = newSheets[sheetId]?.name;
            delete newSheets[sheetId];
            const sheetIds = Object.keys(newSheets).sort((a, b) => newSheets[a].index - newSheets[b].index);
            const newActiveSheetId = sheetIds.length > 0 ? sheetIds[0] : null;

            const newWorkbook = {
                ...workbook,
                sheets: newSheets,
                activeSheetId: newActiveSheetId,
                lastSavedDate: Date.now()
            };
            setWorkbookData(newWorkbook);
            setCurrentSheetId(newActiveSheetId);
            await persistenceServiceRef.current.saveWorkbook(newWorkbook);
            persistenceServiceRef.current.enqueueOfflineAction('auditLog', {
                level: 'info', userId: currentUser.id, action: 'SHEET_DELETED',
                details: { workbookId: workbook.id, sheetId, sheetName: deletedSheetName }
            });
        };

        const getRangeData = (sheetId: string, range: string): CellData[][] => {
            const sheet = workbook?.sheets[sheetId];
            if (!sheet) return [];
            // This would involve complex range parsing (A1:B5, A:A, 1:1) and iteration.
            // For now, return a placeholder or just the top-left cell if it exists.
            const [startCellStr, endCellStr] = range.split(':');
            const result: CellData[][] = [];
            // Highly simplified range iteration
            if (startCellStr && !endCellStr) { // Single cell
                const cell = sheet.cells[startCellStr];
                if (cell) result.push([cell]);
            } else if (startCellStr && endCellStr) { // Simple range A1:B2
                const startColMatch = startCellStr.match(/[A-Z]+/);
                const startRowMatch = startCellStr.match(/[0-9]+/);
                const endColMatch = endCellStr.match(/[A-Z]+/);
                const endRowMatch = endCellStr.match(/[0-9]+/);

                if (startColMatch && startRowMatch && endColMatch && endRowMatch) {
                    const startCol = startColMatch[0];
                    const startRow = parseInt(startRowMatch[0]);
                    const endCol = endColMatch[0];
                    const endRow = parseInt(endRowMatch[0]);

                    // Convert column letters to numbers (A=0, B=1, ...)
                    const colCharToNum = (col: string) => col.split('').reduce((sum, char) => sum * 26 + (char.charCodeAt(0) - 'A'.charCodeAt(0) + 1), 0) -1;
                    const colNumToChar = (num: number) => { let s = ''; while(num >= 0) { s = String.fromCharCode(num % 26 + 'A'.charCodeAt(0)) + s; num = Math.floor(num / 26) - 1; } return s; };

                    const startColNum = colCharToNum(startCol);
                    const endColNum = colCharToNum(endCol);

                    for (let r = startRow; r <= endRow; r++) {
                        const row: CellData[] = [];
                        for (let c = startColNum; c <= endColNum; c++) {
                            const address = `${colNumToChar(c)}${r}`;
                            row.push(sheet.cells[address] || { value: null, type: 'text' });
                        }
                        result.push(row);
                    }
                }
            }
            return result;
        };

        const executeFormula = async (sheetId: string, address: string, formula: string) => {
            const { value, error: formulaError } = await formulaEngineServiceRef.current.evaluateFormula(sheetId, address, formula);
            if (formulaError) {
                console.error(`Formula execution error for ${formula} at ${sheetId}!${address}:`, formulaError);
                addNotification(`Formula error in ${address}: ${formulaError.message}`, 'error', true);
            }
            return value;
        };

        const applyConditionalFormat = async (sheetId: string, rule: ConditionalFormatRule) => {
            if (!workbook) return;
            if (!securityServiceRef.current.canAccess('sheet', sheetId, 'editor')) {
                addNotification(`Permission denied to apply conditional format.`, 'error', true);
                return;
            }
            console.log(`Applying conditional format to ${sheetId} with rule:`, rule);
            const newWorkbook = { ...workbook, lastSavedDate: Date.now() };
            const sheet = newWorkbook.sheets[sheetId];
            if (sheet) {
                sheet.conditionalFormats = [...(sheet.conditionalFormats || []), rule];
                setWorkbookData(newWorkbook);
                await persistenceServiceRef.current.saveWorkbook(newWorkbook);
                addNotification('Conditional format applied.', 'success', false);
            }
        };

        const addDrawingObject = async (sheetId: string, obj: DrawingObject) => {
            if (!workbook) return;
            if (!securityServiceRef.current.canAccess('sheet', sheetId, 'editor')) {
                addNotification(`Permission denied to add drawing object.`, 'error', true);
                return;
            }
            const newWorkbook = { ...workbook, lastSavedDate: Date.now() };
            const sheet = newWorkbook.sheets[sheetId];
            if (sheet) {
                sheet.drawingObjects = [...(sheet.drawingObjects || []), obj];
                setWorkbookData(newWorkbook);
                await persistenceServiceRef.current.saveWorkbook(newWorkbook);
                addNotification('Drawing object added.', 'success', false);
            }
        };

        const addChart = async (sheetId: string, config: ChartConfiguration) => {
            if (!workbook) return;
            if (!securityServiceRef.current.canAccess('sheet', sheetId, 'editor')) {
                addNotification(`Permission denied to add charts.`, 'error', true);
                return;
            }
            const newWorkbook = { ...workbook, lastSavedDate: Date.now() };
            const sheet = newWorkbook.sheets[sheetId];
            if (sheet) {
                sheet.charts = [...(sheet.charts || []), config];
                setWorkbookData(newWorkbook);
                await persistenceServiceRef.current.saveWorkbook(newWorkbook);
                addNotification('Chart added.', 'success', false);
            }
        };

        const addPivotTable = async (sheetId: string, config: PivotTableConfiguration) => {
            if (!workbook) return;
            if (!securityServiceRef.current.canAccess('sheet', sheetId, 'editor')) {
                addNotification(`Permission denied to add pivot tables.`, 'error', true);
                return;
            }
            const newWorkbook = { ...workbook, lastSavedDate: Date.now() };
            const sheet = newWorkbook.sheets[sheetId];
            if (sheet) {
                sheet.pivotTables = [...(sheet.pivotTables || []), config];
                setWorkbookData(newWorkbook);
                await persistenceServiceRef.current.saveWorkbook(newWorkbook);
                addNotification('Pivot table added.', 'success', false);
            }
        };

        const applyFilter = async (sheetId: string, config: FilterConfiguration) => {
            if (!workbook) return;
            if (!securityServiceRef.current.canAccess('sheet', sheetId, 'editor')) {
                addNotification(`Permission denied to apply filters.`, 'error', true);
                return;
            }
            const newWorkbook = { ...workbook, lastSavedDate: Date.now() };
            const sheet = newWorkbook.sheets[sheetId];
            if (sheet) {
                sheet.filters = [...(sheet.filters || []), config];
                setWorkbookData(newWorkbook);
                await persistenceServiceRef.current.saveWorkbook(newWorkbook);
                addNotification('Filter applied.', 'success', false);
            }
        };

        const applySort = async (sheetId: string, config: SortConfiguration) => {
            if (!workbook) return;
            if (!securityServiceRef.current.canAccess('sheet', sheetId, 'editor')) {
                addNotification(`Permission denied to apply sorts.`, 'error', true);
                return;
            }
            const newWorkbook = { ...workbook, lastSavedDate: Date.now() };
            const sheet = newWorkbook.sheets[sheetId];
            if (sheet) {
                sheet.sorts = [...(sheet.sorts || []), config];
                setWorkbookData(newWorkbook);
                await persistenceServiceRef.current.saveWorkbook(newWorkbook);
                addNotification('Sort applied.', 'success', false);
            }
        };

        const createNamedRange = async (sheetId: string, name: string, range: string) => {
            if (!workbook) return;
            if (!securityServiceRef.current.canAccess('sheet', sheetId, 'editor')) {
                addNotification(`Permission denied to create named range.`, 'error', true);
                return;
            }
            const newWorkbook = { ...workbook, lastSavedDate: Date.now() };
            const sheet = newWorkbook.sheets[sheetId];
            if (sheet) {
                sheet.namedRanges = { ...(sheet.namedRanges || {}), [name]: range };
                setWorkbookData(newWorkbook);
                await persistenceServiceRef.current.saveWorkbook(newWorkbook);
                addNotification(`Named range "${name}" created.`, 'success', false);
            }
        };

        const getCellMetadata = (sheetId: string, address: string, key: string): any => {
            const cell = workbook?.sheets[sheetId]?.cells[address];
            return cell?.metadata?.[key];
        };

        const setCellMetadata = async (sheetId: string, address: string, key: string, value: any) => {
            if (!workbook) return;
            if (!securityServiceRef.current.canAccess('cell', `${sheetId}!${address}`, 'editor')) {
                addNotification(`Permission denied to set cell metadata.`, 'error', true);
                return;
            }
            const newWorkbook = { ...workbook };
            const sheet = newWorkbook.sheets[sheetId];
            if (sheet) {
                const cell = sheet.cells[address] || { type: 'text', value: null };
                sheet.cells = { ...sheet.cells, [address]: { ...cell, metadata: { ...cell.metadata, [key]: value } } };
                setWorkbookData(newWorkbook);
                await persistenceServiceRef.current.saveWorkbook(newWorkbook);
            }
        };


        return {
            workbook,
            activeSheet,
            currentSheetId,
            setWorkbook: setWorkbookData,
            setActiveSheetId: setCurrentSheetId,
            updateCell,
            updateSheet,
            addSheet,
            deleteSheet,
            getRangeData,
            executeFormula,
            applyConditionalFormat,
            addDrawingObject,
            addChart,
            addPivotTable,
            applyFilter,
            applySort,
            createNamedRange,
            getCellMetadata,
            setCellMetadata,
            isLoading,
            error,
        };
    }, [workbook, currentSheetId, isLoading, error, persistenceServiceRef, userSettings.realtimeCollaborationEnabled, collaborationServiceRef, formulaEngineServiceRef, currentUser, securityServiceRef, addNotification]);

    // User Settings Context Implementations
    const userSettingsContextValue = useMemo<IUserSettingsContext>(() => {
        const updateTheme = async (theme: Partial<ThemeConfig>) => {
            setCurrentTheme(prev => ({ ...prev, ...theme }));
            // Persist theme to user profile
            await persistenceServiceRef.current.saveUserSettings(