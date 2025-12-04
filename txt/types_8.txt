// google/sheets/types.ts
// The Mathematics of the Grid. Defines the structures of the spreadsheet world.

/**
 * Fundamental Grid Components
 */

export interface Sheet {
    id: string;
    name: string;
    index: number;
    rowCount: number;
    columnCount: number;
    hidden?: boolean;
    protectedRanges?: SheetProtection[];
    gridProperties?: GridProperties;
    tabColor?: RGBColor;
    developerMetadata?: DeveloperMetadata[];
}

export interface Workbook {
    id: string;
    title: string;
    sheets: Sheet[];
    namedRanges?: NamedRange[];
    spreadsheetTheme?: SpreadsheetTheme;
    localeSettings?: LocaleSettings;
    creationTime?: string; // ISO 8601 timestamp
    lastUpdateTime?: string; // ISO 8601 timestamp
    ownerId?: string; // User ID
    permissions?: WorkbookPermission[];
    revisions?: RevisionMetadata[];
    externalDataSources?: ExternalDataSource[];
    scripts?: ScriptMetadata[];
    addOns?: AddOnMetadata[];
    eventListeners?: EventListenerConfig[];
    queryEngineConfig?: QueryEngineConfig;
    aiAssistantConfig?: AIAssistantConfig;
}

export interface CellCoordinate {
    sheetId: string;
    rowIndex: number;
    columnIndex: number;
}

export interface Range {
    sheetId: string;
    startRowIndex: number;
    endRowIndex: number;
    startColumnIndex: number;
    endColumnIndex: number;
}

export interface NamedRange extends Range {
    name: string;
    description?: string;
}

export enum Dimension {
    ROWS = 'ROWS',
    COLUMNS = 'COLUMNS',
}

export interface GridProperties {
    rowCount: number;
    columnCount: number;
    frozenRowCount?: number;
    frozenColumnCount?: number;
    hideGridlines?: boolean;
    rowGroupControlDim?: Dimension;
    columnGroupControlDim?: Dimension;
    defaultRowHeight?: number;
    defaultColumnWidth?: number;
}

/**
 * Cell Content and Styling
 */

export interface CellData {
    value?: string | number | boolean | Date | ErrorValue | EmbeddedObjectData | SpatialData | TemporalData | GraphData | SemanticData | CustomDataType;
    formula?: string;
    computedValue?: string | number | boolean | Date; // The *evaluated* result of a formula
    style?: CellStyle;
    richText?: RichTextValue;
    dataValidationRule?: DataValidationRule;
    hyperlink?: string;
    note?: string;
    commentThreadId?: string; // Link to a comment thread
    sparkline?: Sparkline;
    dataSourceId?: string; // For cells linked to external data sources
    error?: FormulaError;
    /** For internal type-checking or complex semantic types beyond simple string/number */
    semanticType?: SemanticDataType;
    /** Raw data, if the cell is part of a larger structured data model (e.g., JSON, XML snippets) */
    rawData?: string;
    /** For AI-generated or inferred content */
    confidenceScore?: number; // 0-1
    /** Link to a specific AI insight or suggestion */
    aiInsightId?: string;
}

export interface CellStyle {
    fontFamily?: string;
    fontSize?: number;
    foregroundColor?: RGBColor;
    backgroundColor?: RGBColor;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    textFormat?: TextFormat; // Further text customization
    borders?: Borders;
    padding?: Padding;
    horizontalAlignment?: HorizontalAlignment;
    verticalAlignment?: VerticalAlignment;
    wrapStrategy?: WrapStrategy;
    textDirection?: TextDirection;
    numberFormat?: NumberFormat;
    dateTimeFormat?: DateTimeFormat;
    textRotation?: TextRotation;
    /** For conditional formatting, if applied directly to the style definition */
    conditionalFormatRuleId?: string;
    /** Data bars, color scales, icon sets applied through conditional formatting */
    fillPattern?: PatternType;
    fillColor?: RGBColor;
    gradientFill?: GradientFill;
    /** Accessibility attributes for screen readers, etc. */
    ariaLabel?: string;
}

export interface RichTextValue {
    runs: RichTextRun[];
}

export interface RichTextRun {
    startIndex: number;
    text: string; // The segment of text
    textFormat?: TextFormat; // Formatting for this specific segment
    hyperlink?: string;
    tooltip?: string; // On hover text
}

export interface TextFormat {
    fontFamily?: string;
    fontSize?: number;
    foregroundColor?: RGBColor;
    backgroundColor?: RGBColor; // Highlighting
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    link?: string;
    scriptStyle?: ScriptStyle;
}

export enum ScriptStyle {
    NONE = 'NONE',
    SUPERSCRIPT = 'SUPERSCRIPT',
    SUBSCRIPT = 'SUBSCRIPT',
}

export interface RGBColor {
    red: number; // 0-1
    green: number; // 0-1
    blue: number; // 0-1
    alpha?: number; // 0-1 (opacity)
}

export interface Borders {
    top?: BorderStyle;
    bottom?: BorderStyle;
    left?: BorderStyle;
    right?: BorderStyle;
}

export interface BorderStyle {
    style: LineStyle;
    width?: number; // In pixels
    color?: RGBColor;
}

export enum LineStyle {
    NONE = 'NONE',
    SOLID = 'SOLID',
    DASHED = 'DASHED',
    DOTTED = 'DOTTED',
    DOUBLE = 'DOUBLE',
    GROOVE = 'GROOVE',
    RIDGE = 'RIDGE',
}

export interface Padding {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
}

export enum HorizontalAlignment {
    LEFT = 'LEFT',
    CENTER = 'CENTER',
    RIGHT = 'RIGHT',
    JUSTIFY = 'JUSTIFY',
}

export enum VerticalAlignment {
    TOP = 'TOP',
    MIDDLE = 'MIDDLE',
    BOTTOM = 'BOTTOM',
}

export enum WrapStrategy {
    OVERFLOW = 'OVERFLOW',
    WRAP = 'WRAP',
    CLIP = 'CLIP',
}

export enum TextDirection {
    LEFT_TO_RIGHT = 'LEFT_TO_RIGHT',
    RIGHT_TO_LEFT = 'RIGHT_TO_LEFT',
    AUTOMATIC = 'AUTOMATIC',
}

export interface TextRotation {
    angle: number; // Degrees, -90 to 90
    vertical?: boolean; // Stack characters vertically
}

export interface NumberFormat {
    type: NumberFormatType;
    pattern?: string; // Custom format pattern (e.g., "#,##0.00")
}

export enum NumberFormatType {
    TEXT = 'TEXT',
    NUMBER = 'NUMBER',
    PERCENT = 'PERCENT',
    CURRENCY = 'CURRENCY',
    DATE = 'DATE',
    TIME = 'TIME',
    DATE_TIME = 'DATE_TIME',
    SCIENTIFIC = 'SCIENTIFIC',
    ACCOUNTING = 'ACCOUNTING',
    FRACTION = 'FRACTION',
    ENGINEERING = 'ENGINEERING',
    CUSTOM = 'CUSTOM',
}

export interface DateTimeFormat {
    type: DateTimeFormatType;
    pattern?: string; // Custom pattern (e.g., "yyyy-MM-dd HH:mm:ss")
    timezone?: string; // e.g., "America/New_York"
}

export enum DateTimeFormatType {
    DATE_SHORT = 'DATE_SHORT', // 12/25/2023
    DATE_MEDIUM = 'DATE_MEDIUM', // Dec 25, 2023
    DATE_LONG = 'DATE_LONG', // December 25, 2023
    TIME_SHORT = 'TIME_SHORT', // 3:30 PM
    TIME_MEDIUM = 'TIME_MEDIUM', // 3:30:15 PM
    TIME_LONG = 'TIME_LONG', // 3:30:15 PM EST
    DATE_TIME_SHORT = 'DATE_TIME_SHORT',
    DATE_TIME_MEDIUM = 'DATE_TIME_MEDIUM',
    DATE_TIME_LONG = 'DATE_TIME_LONG',
    CUSTOM = 'CUSTOM',
}

export interface PatternType {
    type: FillPatternType;
    foregroundColor?: RGBColor;
    backgroundColor?: RGBColor; // For background of pattern
}

export enum FillPatternType {
    NONE = 'NONE',
    SOLID = 'SOLID',
    DARK_GRID = 'DARK_GRID',
    LIGHT_GRID = 'LIGHT_GRID',
    DARK_DOWN = 'DARK_DOWN',
    DARK_UP = 'DARK_UP',
    DARK_GRAY = 'DARK_GRAY',
    GRAY125 = 'GRAY125',
    GRAY0625 = 'GRAY0625',
}

export interface GradientFill {
    type: GradientType;
    points: GradientPoint[];
    angle?: number; // For linear gradient
    centerX?: number; // For radial gradient, 0-1
    centerY?: number; // For radial gradient, 0-1
}

export enum GradientType {
    LINEAR = 'LINEAR',
    RADIAL = 'RADIAL',
}

export interface GradientPoint {
    color: RGBColor;
    position: number; // 0-1
}

export interface ErrorValue {
    type: ErrorType;
    message: string;
    details?: string;
}

export enum ErrorType {
    PARSE_ERROR = 'PARSE_ERROR', // Formula parse error
    VALUE = 'VALUE', // Incorrect argument type
    REF = 'REF', // Invalid cell reference
    DIV_BY_ZERO = 'DIV_BY_ZERO', // Division by zero
    NUM = 'NUM', // Invalid numeric value
    NAME = 'NAME', // Unknown function or named range
    N_A = 'N/A', // Not available
    ERROR = 'ERROR', // General error
    CIRCULAR_REFERENCE = 'CIRCULAR_REFERENCE', // Formula refers to itself
    NULL = 'NULL', // Intersection of empty ranges
    SECURITY = 'SECURITY', // Access denied
    OVERFLOW = 'OVERFLOW', // Result exceeds cell capacity
    DATA_SOURCE_ERROR = 'DATA_SOURCE_ERROR', // Error retrieving data from source
    AI_ERROR = 'AI_ERROR', // Error in AI computation
}

/**
 * Row/Column Properties
 */

export interface RowData {
    index: number;
    height?: number;
    hidden?: boolean;
    groupInfo?: DimensionGroupInfo;
    developerMetadata?: DeveloperMetadata[];
    /** An array of CellData, if the row is explicitly requested with data */
    cells?: CellData[];
}

export interface ColumnData {
    index: number;
    width?: number;
    hidden?: boolean;
    groupInfo?: DimensionGroupInfo;
    developerMetadata?: DeveloperMetadata[];
}

export interface DimensionGroupInfo {
    startIndex: number;
    endIndex: number;
    collapsed: boolean;
    hiddenDimension?: boolean;
    depth: number;
}

/**
 * Data Validation
 */

export interface DataValidationRule {
    condition: DataValidationCondition;
    inputMessage?: string;
    strict?: boolean; // Reject input if invalid
    showCustomText?: boolean; // Show inputMessage on hover, otherwise show error message
    errorMessage?: string; // Custom error message
    // Apply to a specific range (e.g., if multiple rules per sheet)
    range?: Range;
}

export interface DataValidationCondition {
    conditionType: ConditionType;
    values?: ConditionValue[];
    reverse?: boolean; // Negate the condition
    formula?: string; // For custom formula conditions
}

export enum ConditionType {
    NUMBER_BETWEEN = 'NUMBER_BETWEEN',
    NUMBER_NOT_BETWEEN = 'NUMBER_NOT_BETWEEN',
    NUMBER_GREATER_THAN = 'NUMBER_GREATER_THAN',
    NUMBER_GREATER_THAN_OR_EQUAL = 'NUMBER_GREATER_THAN_OR_EQUAL',
    NUMBER_LESS_THAN = 'NUMBER_LESS_THAN',
    NUMBER_LESS_THAN_OR_EQUAL = 'NUMBER_LESS_THAN_OR_EQUAL',
    NUMBER_EQUAL = 'NUMBER_EQUAL',
    NUMBER_NOT_EQUAL = 'NUMBER_NOT_EQUAL',
    DATE_BETWEEN = 'DATE_BETWEEN',
    DATE_NOT_BETWEEN = 'DATE_NOT_BETWEEN',
    DATE_IS_VALID_DATE = 'DATE_IS_VALID_DATE',
    DATE_EQUAL_TO = 'DATE_EQUAL_TO',
    DATE_BEFORE = 'DATE_BEFORE',
    DATE_AFTER = 'DATE_AFTER',
    TEXT_CONTAINS = 'TEXT_CONTAINS',
    TEXT_NOT_CONTAINS = 'TEXT_NOT_CONTAINS',
    TEXT_EQUAL = 'TEXT_EQUAL',
    TEXT_NOT_EQUAL = 'TEXT_NOT_EQUAL',
    TEXT_STARTS_WITH = 'TEXT_STARTS_WITH',
    TEXT_ENDS_WITH = 'TEXT_ENDS_WITH',
    ENUM_IN_LIST = 'ENUM_IN_LIST', // List of explicit values
    ENUM_FROM_RANGE = 'ENUM_FROM_RANGE', // Values from a range
    CUSTOM_FORMULA = 'CUSTOM_FORMULA',
    IS_VALID_EMAIL = 'IS_VALID_EMAIL',
    IS_VALID_URL = 'IS_VALID_URL',
    IS_CHECKBOX = 'IS_CHECKBOX', // Cell is rendered as a checkbox
    IS_RATING_STAR = 'IS_RATING_STAR', // Cell is rendered as a star rating
}

export interface ConditionValue {
    userEnteredValue?: string; // Raw string value
    // Add value interpretation types if needed, e.g., NUMBER, DATE, REFERENCE
}

/**
 * Conditional Formatting
 */

export interface ConditionalFormatRule {
    id: string; // Unique ID for this rule
    ranges: Range[]; // Ranges this rule applies to
    booleanRule?: BooleanRule;
    gradientRule?: GradientRule;
    // Order matters for rule precedence
    index: number;
    enabled?: boolean;
    creatorId?: string;
    creationTime?: string;
    lastModifierId?: string;
    lastModificationTime?: string;
}

export interface BooleanRule {
    condition: DataValidationCondition; // Reusing condition types
    format: CellStyle; // Style to apply if condition is true
}

export interface GradientRule {
    minpoint: InterpolationPoint;
    midpoint?: InterpolationPoint;
    maxpoint: InterpolationPoint;
}

export interface InterpolationPoint {
    type: InterpolationPointType;
    value: string; // The value to interpolate against (e.g., "0", "100", "min", "max")
    color: RGBColor;
}

export enum InterpolationPointType {
    MIN = 'MIN',
    MAX = 'MAX',
    NUMBER = 'NUMBER',
    PERCENT = 'PERCENT',
    PERCENTILE = 'PERCENTILE',
}

/**
 * Embedded Objects (Charts, Drawings, Images)
 */

export enum EmbeddedObjectType {
    CHART = 'CHART',
    IMAGE = 'IMAGE',
    DRAWING = 'DRAWING',
    FORM_CONTROL = 'FORM_CONTROL',
    COMMENT_BOX = 'COMMENT_BOX',
    IFRAME_WIDGET = 'IFRAME_WIDGET',
    VECTOR_GRAPHIC = 'VECTOR_GRAPHIC',
    CUSTOM_WIDGET = 'CUSTOM_WIDGET',
}

export interface EmbeddedObjectData {
    objectId: string;
    objectType: EmbeddedObjectType;
    position: ObjectPosition;
    size: ObjectSize;
    locked?: boolean; // Prevent movement/resizing
    properties?: { [key: string]: any }; // Type-specific properties
    /** Associated with a specific cell, e.g., a mini-chart/sparkline */
    anchoredToCell?: CellCoordinate;
    // For images, drawings, etc.
    sourceUrl?: string;
    altText?: string;
    link?: string;
}

export interface ObjectPosition {
    sheetId: string;
    overlayPosition?: OverlayPosition; // Absolute position over cells
    // For objects anchored *within* a cell (e.g., small image)
    cellPosition?: CellCoordinate;
}

export interface OverlayPosition {
    anchorCell: CellCoordinate;
    offsetXPixels?: number;
    offsetYPixels?: number;
    widthPixels?: number;
    heightPixels?: number;
}

export interface ObjectSize {
    width: number; // Pixels
    height: number; // Pixels
    scaleX?: number;
    scaleY?: number;
    transform?: TransformMatrix;
}

export interface TransformMatrix {
    scaleX: number;
    scaleY: number;
    shearX: number;
    shearY: number;
    translateX: number;
    translateY: number;
}

/**
 * Sparklines (mini-charts within cells)
 */

export interface Sparkline {
    range: Range; // Data range for the sparkline
    options: SparklineOptions;
}

export interface SparklineOptions {
    type: SparklineType;
    color?: RGBColor;
    negativeColor?: RGBColor;
    showAxis?: boolean;
    showFirst?: boolean;
    showLast?: boolean;
    showHigh?: boolean;
    showLow?: boolean;
    showNegative?: boolean;
    lineWidth?: number;
    fillColor?: RGBColor;
    axisColor?: RGBColor;
    min?: number | "auto" | "dataMin";
    max?: number | "auto" | "dataMax";
    rtl?: boolean; // Right-to-left rendering
}

export enum SparklineType {
    LINE = 'LINE',
    COLUMN = 'COLUMN',
    BAR = 'BAR',
    WINLOSS = 'WINLOSS',
}

/**
 * Charts
 */

export interface Chart extends EmbeddedObjectData {
    chartType: ChartType;
    title?: string;
    subtitle?: string;
    dataSourceRange: Range;
    series: ChartSeries[];
    domainAxes?: ChartAxis[];
    valueAxes?: ChartAxis[];
    legend?: ChartLegend;
    options?: ChartOptions;
    // For more complex charts (e.g., combo charts)
    comboCharts?: ComboChartSpec[];
    /** AI suggested chart configurations */
    aiSuggestions?: AISuggestion[];
}

export enum ChartType {
    AREA = 'AREA',
    BAR = 'BAR',
    COLUMN = 'COLUMN',
    LINE = 'LINE',
    PIE = 'PIE',
    SCATTER = 'SCATTER',
    COMBO = 'COMBO',
    GAUGE = 'GAUGE',
    ORG = 'ORG',
    HISTOGRAM = 'HISTOGRAM',
    TREEMAP = 'TREEMAP',
    WATERFALL = 'WATERFALL',
    CANDLESTICK = 'CANDLESTICK',
    GEO = 'GEO',
    RADAR = 'RADAR',
    BOX_PLOT = 'BOX_PLOT',
    BUBBLE = 'BUBBLE',
    SUNBURST = 'SUNBURST',
    SANKEY = 'SANKEY',
    FUNNEL = 'FUNNEL',
    HEATMAP = 'HEATMAP',
    NETWORK = 'NETWORK',
    STREAMGRAPH = 'STREAMGRAPH',
}

export interface ChartSeries {
    seriesRange: Range;
    targetAxis?: AxisPosition;
    color?: RGBColor;
    type?: ChartType; // For combo charts
    curveType?: CurveType;
    pointSize?: number;
    lineWidth?: number;
    label?: string; // Series label
    formatOptions?: SeriesFormatOptions;
    errorBars?: ErrorBarOptions;
    dataLabels?: DataLabelOptions;
}

export enum AxisPosition {
    BOTTOM_AXIS = 'BOTTOM_AXIS',
    LEFT_AXIS = 'LEFT_AXIS',
    RIGHT_AXIS = 'RIGHT_AXIS',
    TOP_AXIS = 'TOP_AXIS',
}

export enum CurveType {
    NONE = 'NONE',
    SMOOTH = 'SMOOTH',
    STEP = 'STEP',
}

export interface SeriesFormatOptions {
    targetAxis?: AxisPosition;
    color?: RGBColor;
    lineWidth?: number;
    pointSize?: number;
    pointShape?: PointShape;
    fillColor?: RGBColor;
    fillOpacity?: number; // 0-1
    dataLabels?: DataLabelOptions;
}

export enum PointShape {
    CIRCLE = 'CIRCLE',
    TRIANGLE = 'TRIANGLE',
    SQUARE = 'SQUARE',
    DIAMOND = 'DIAMOND',
    STAR = 'STAR',
    HEXAGON = 'HEXAGON',
}

export interface ErrorBarOptions {
    type: ErrorBarType;
    value?: number;
    range?: Range; // For custom error bar values
    displayType?: ErrorBarDisplayType;
}

export enum ErrorBarType {
    CONSTANT = 'CONSTANT',
    PERCENTAGE = 'PERCENTAGE',
    STANDARD_DEVIATION = 'STANDARD_DEVIATION',
    STANDARD_ERROR = 'STANDARD_ERROR',
    CUSTOM = 'CUSTOM',
}

export enum ErrorBarDisplayType {
    BOTH = 'BOTH',
    PLUS = 'PLUS',
    MINUS = 'MINUS',
}

export interface DataLabelOptions {
    type: DataLabelType;
    placement?: DataLabelPlacement;
    textFormat?: TextFormat;
    customFormatString?: string; // For formatting label value
    showLeaderLines?: boolean;
}

export enum DataLabelType {
    VALUE = 'VALUE',
    PERCENTAGE = 'PERCENTAGE',
    SERIES_NAME = 'SERIES_NAME',
    CUSTOM = 'CUSTOM',
    NONE = 'NONE',
}

export enum DataLabelPlacement {
    CENTER = 'CENTER',
    LEFT = 'LEFT',
    RIGHT = 'RIGHT',
    ABOVE = 'ABOVE',
    BELOW = 'BELOW',
    OUTSIDE_END = 'OUTSIDE_END',
    INSIDE_END = 'INSIDE_END',
    INSIDE_BASE = 'INSIDE_BASE',
}

export interface ChartAxis {
    position: AxisPosition;
    title?: string;
    titleTextFormat?: TextFormat;
    viewWindowOptions?: ChartViewWindowOptions;
    scaleType?: AxisScaleType;
    min?: number;
    max?: number;
    logBase?: number; // For log scale
    labelsFormat?: NumberFormat | DateTimeFormat;
    gridlineColor?: RGBColor;
    minorGridlineColor?: RGBColor;
    showAxisLine?: boolean;
    showLabels?: boolean;
}

export enum AxisScaleType {
    LINEAR = 'LINEAR',
    LOG = 'LOG',
    PERCENTAGE = 'PERCENTAGE',
    DATE_TIME = 'DATE_TIME',
}

export interface ChartViewWindowOptions {
    viewWindowMode: ViewWindowMode;
    viewWindowMin?: number;
    viewWindowMax?: number;
    viewWindowMinDate?: string; // ISO 8601
    viewWindowMaxDate?: string; // ISO 8601
}

export enum ViewWindowMode {
    DEFAULT = 'DEFAULT',
    EXPLICIT = 'EXPLICIT',
    PRETTY = 'PRETTY', // Automatically determine pretty bounds
}

export interface ChartLegend {
    position: LegendPosition;
    textFormat?: TextFormat;
    alignment?: LegendAlignment;
    maxLines?: number; // For text wrapping
}

export enum LegendPosition {
    BOTTOM_LEGEND = 'BOTTOM_LEGEND',
    LEFT_LEGEND = 'LEFT_LEGEND',
    RIGHT_LEGEND = 'RIGHT_LEGEND',
    TOP_LEGEND = 'TOP_LEGEND',
    NO_LEGEND = 'NO_LEGEND',
    AUTO_POSITION = 'AUTO_POSITION',
}

export enum LegendAlignment {
    START = 'START',
    CENTER = 'CENTER',
    END = 'END',
}

export interface ChartOptions {
    backgroundColor?: RGBColor;
    fontName?: string;
    reverseCategories?: boolean;
    stackedType?: StackedType;
    threeDimensional?: boolean;
    // For specific chart types like PieChartOptions, BarChartOptions etc.
    // This allows for dynamic extension without modifying base interface
    chartSpecificOptions?: { [key: string]: any };
    animation?: ChartAnimation;
    interactivity?: ChartInteractivity;
    chartArea?: ChartAreaOptions;
    tooltip?: TooltipOptions;
}

export enum StackedType {
    NOT_STACKED = 'NOT_STACKED',
    STACKED = 'STACKED',
    PERCENT_STACKED = 'PERCENT_STACKED',
}

export interface ChartAnimation {
    duration?: number; // Milliseconds
    easing?: string; // e.g., 'linear', 'inAndOut'
    startup?: boolean;
}

export interface ChartInteractivity {
    enableZoom?: boolean;
    enablePan?: boolean;
    selectionMode?: SelectionMode;
    eventHandlers?: { [key: string]: string }; // Map event names to script function names
}

export enum SelectionMode {
    SINGLE = 'SINGLE',
    MULTIPLE = 'MULTIPLE',
    NONE = 'NONE',
}

export interface ChartAreaOptions {
    left?: number | string; // Pixels or percentage
    top?: number | string;
    width?: number | string;
    height?: number | string;
    backgroundColor?: RGBColor;
    borderColor?: RGBColor;
    borderWidth?: number;
}

export interface TooltipOptions {
    trigger?: TooltipTrigger;
    textStyle?: TextFormat;
    showColorCode?: boolean;
    isHtml?: boolean;
    ignoredColumns?: number[]; // Columns to hide from tooltip
}

export enum TooltipTrigger {
    FOCUS = 'FOCUS',
    NONE = 'NONE',
    SELECTION = 'SELECTION',
}

export interface ComboChartSpec {
    type: ComboChartType;
    series: ChartSeries[];
    targetAxis?: AxisPosition;
}

export enum ComboChartType {
    COLUMN = 'COLUMN',
    LINE = 'LINE',
    AREA = 'AREA',
    STEPPED_AREA = 'STEPPED_AREA',
    BAR = 'BAR',
}

/**
 * Pivot Tables
 */

export interface PivotTable extends EmbeddedObjectData {
    source: Range | ExternalDataSource;
    rows: PivotGroup[];
    columns: PivotGroup[];
    values: PivotValue[];
    filters: PivotFilter[];
    valueLayout?: PivotValueLayout;
    showTotals?: boolean;
    showSubtotals?: boolean;
    showGrandTotals?: boolean;
    sortOrder?: PivotSortOrder;
    /** If linked to an AI model for dynamic pivot generation */
    aiModelId?: string;
}

export interface PivotGroup {
    sourceColumnOffset: number; // 0-indexed column in source range
    showTotals?: boolean;
    sortOrder?: SortOrder;
    valueBucket?: PivotGroupBucket;
    // For date/time grouping
    dateGroupRule?: DateGroupRule;
    // For numerical grouping
    valueGroupRule?: ValueGroupRule;
    // For custom formula grouping
    formula?: string;
    label?: string; // Custom label for this group
    collapsed?: boolean;
    /** If values are explicitly filtered from the group */
    manualGroupFilter?: string[]; // List of values to include/exclude
}

export interface PivotGroupBucket {
    type: PivotGroupBucketType;
    arg1?: string;
    arg2?: string;
}

export enum PivotGroupBucketType {
    DATE_YEAR = 'DATE_YEAR',
    DATE_MONTH = 'DATE_MONTH',
    DATE_QUARTER = 'DATE_QUARTER',
    DATE_DAY_OF_WEEK = 'DATE_DAY_OF_WEEK',
    DATE_HOUR = 'DATE_HOUR',
    NUMERIC_HISTOGRAM = 'NUMERIC_HISTOGRAM', // arg1 = bucket size, arg2 = min
    NUMERIC_RANGE = 'NUMERIC_RANGE', // arg1 = min, arg2 = max for a single bucket
    TEXT_PREFIX = 'TEXT_PREFIX', // arg1 = prefix length
    TEXT_LENGTH = 'TEXT_LENGTH', // arg1 = min length, arg2 = max length
    CUSTOM_FORMULA = 'CUSTOM_FORMULA',
}

export interface DateGroupRule {
    type: DateGroupRuleType;
}

export enum DateGroupRuleType {
    NONE = 'NONE',
    SECOND = 'SECOND',
    MINUTE = 'MINUTE',
    HOUR = 'HOUR',
    DAY_OF_WEEK = 'DAY_OF_WEEK',
    DAY_OF_MONTH = 'DAY_OF_MONTH',
    DAY_OF_YEAR = 'DAY_OF_YEAR',
    WEEK = 'WEEK',
    ISO_WEEK = 'ISO_WEEK',
    MONTH = 'MONTH',
    QUARTER = 'QUARTER',
    YEAR = 'YEAR',
}

export interface ValueGroupRule {
    interval?: number; // For numeric grouping (e.g., group by 10s)
    min?: number;
    max?: number;
}

export interface PivotValue {
    sourceColumnOffset: number; // 0-indexed column
    summarizeFunction: PivotSummarizeFunction;
    name?: string; // Custom name for the aggregated value
    formula?: string; // For custom calculated fields
    outputFormat?: NumberFormat | DateTimeFormat;
    showAs?: PivotValueShowAs;
    baseItem?: PivotItemReference; // For % of total, diff from, etc.
}

export enum PivotSummarizeFunction {
    SUM = 'SUM',
    COUNT = 'COUNT',
    COUNTA = 'COUNTA',
    COUNTUNIQUE = 'COUNTUNIQUE',
    AVERAGE = 'AVERAGE',
    MAX = 'MAX',
    MIN = 'MIN',
    MEDIAN = 'MEDIAN',
    PRODUCT = 'PRODUCT',
    STDEV = 'STDEV',
    STDEVP = 'STDEVP',
    VAR = 'VAR',
    VARP = 'VARP',
    CUSTOM = 'CUSTOM', // Use with formula field
    RUNNING_SUM = 'RUNNING_SUM',
}

export enum PivotValueShowAs {
    DEFAULT = 'DEFAULT',
    PERCENT_OF_ROW = 'PERCENT_OF_ROW',
    PERCENT_OF_COLUMN = 'PERCENT_OF_COLUMN',
    PERCENT_OF_GRAND_TOTAL = 'PERCENT_OF_GRAND_TOTAL',
    DIFFERENCE_FROM = 'DIFFERENCE_FROM',
    PERCENT_DIFFERENCE_FROM = 'PERCENT_DIFFERENCE_FROM',
    RANK_ASCENDING = 'RANK_ASCENDING',
    RANK_DESCENDING = 'RANK_DESCENDING',
}

export interface PivotItemReference {
    type: PivotItemReferenceType;
    value?: string; // Specific item value
    offset?: number; // Relative offset (e.g., -1 for previous item)
}

export enum PivotItemReferenceType {
    PREVIOUS = 'PREVIOUS',
    NEXT = 'NEXT',
    FIRST = 'FIRST',
    LAST = 'LAST',
    SPECIFIC_VALUE = 'SPECIFIC_VALUE',
}

export interface PivotFilter {
    sourceColumnOffset: number;
    condition: DataValidationCondition; // Reusing condition types for filtering
}

export enum PivotValueLayout {
    COLUMNS = 'COLUMNS',
    ROWS = 'ROWS',
}

export enum PivotSortOrder {
    A_TO_Z = 'A_TO_Z',
    Z_TO_A = 'Z_TO_A',
    CUSTOM = 'CUSTOM', // Based on manual order
    VALUE_ASC = 'VALUE_ASC', // Sort by a specific pivot value
    VALUE_DESC = 'VALUE_DESC',
}

/**
 * Sorting and Filtering
 */

export interface SortRangeRequest {
    range: Range;
    sortSpecs: SortSpec[];
}

export interface SortSpec {
    dimensionIndex: number; // 0-indexed column or row index
    sortOrder: SortOrder;
    dataSourceColumnReference?: DataSourceColumnReference; // For data source sort
    sortByValue?: PivotValue; // For pivot table sorting based on a value
}

export enum SortOrder {
    ASCENDING = 'ASCENDING',
    DESCENDING = 'DESCENDING',
}

export interface FilterView {
    id: string;
    title: string;
    range: Range;
    criteria?: { [columnIndex: number]: FilterCriteria };
    sortSpecs?: SortSpec[];
    columnFilterSummaries?: ColumnFilterSummary[];
    hiddenColumns?: number[];
    hiddenRows?: number[];
    /** Creator and timestamps for audit */
    creatorId?: string;
    creationTime?: string;
    lastModifierId?: string;
    lastModificationTime?: string;
}

export interface FilterCriteria {
    hiddenValues?: string[]; // Values to hide
    condition?: DataValidationCondition; // Condition to filter by
    visibleValues?: string[]; // Values to explicitly show (overrides hiddenValues)
}

export interface ColumnFilterSummary {
    columnIndex: number;
    criteria: FilterCriteria;
    filterApplied: boolean;
}

/**
 * Collaboration and History
 */

export interface User {
    id: string;
    emailAddress: string;
    displayName?: string;
    photoUrl?: string;
    /** For real-time collaboration presence */
    cursorPosition?: CellCoordinate;
    lastActiveTime?: string;
    status?: UserStatus;
}

export enum UserStatus {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
    IDLE = 'IDLE',
    DO_NOT_DISTURB = 'DO_NOT_DISTURB',
}

export interface WorkbookPermission {
    userId?: string;
    groupId?: string;
    role: PermissionRole;
    inheritedFrom?: string; // e.g., folder permission ID
    inherited?: boolean;
    expiresAt?: string;
}

export enum PermissionRole {
    OWNER = 'OWNER',
    EDITOR = 'EDITOR',
    VIEWER = 'VIEWER',
    COMMENTER = 'COMMENTER',
    ADMIN = 'ADMIN',
    NONE = 'NONE', // Explicitly deny access
}

export interface SheetProtection {
    id: string;
    range: Range;
    description?: string;
    editors?: EditorRestriction;
    warningOnly?: boolean; // If true, only show warning instead of blocking
    protected?: boolean; // If false, the protection is inactive
    lockFormulas?: boolean; // Disallow changes to formulas only
    lockDataEntry?: boolean; // Disallow changing non-formula cells
    ignoreEmptyCells?: boolean;
}

export interface EditorRestriction {
    users?: string[]; // User IDs allowed to edit
    groups?: string[]; // Group IDs allowed to edit
    anyone?: boolean; // If true, anyone can edit (except specified users/groups)
}

export interface CommentThread {
    id: string;
    range: Range;
    resolved?: boolean;
    replies: Comment[];
    creatorId?: string;
    creationTime?: string;
    lastUpdateTime?: string;
}

export interface Comment {
    id: string;
    authorId: string;
    content: RichTextValue;
    creationTime: string; // ISO 8601
    lastUpdateTime: string;
    deleted?: boolean;
    mentions?: MentionedUser[]; // Users mentioned in the comment
    reactions?: CommentReaction[];
    // For AI-generated comments
    aiGenerated?: boolean;
    aiSource?: AIInsightType;
}

export interface MentionedUser {
    userId: string;
    startIndex: number; // In the content RichTextValue
    endIndex: number;
}

export interface CommentReaction {
    emoji: string;
    reactorIds: string[]; // List of user IDs who reacted with this emoji
}

export interface RevisionMetadata {
    revisionId: string;
    modifiedTime: string; // ISO 8601
    modifierId: string;
    majorChange?: boolean;
    // For AI-assisted revisions
    aiGeneratedChange?: boolean;
    summary?: string; // AI-generated summary of changes
}

export interface RealtimePresence {
    userId: string;
    sheetId: string;
    selectionRanges: Range[];
    activeCell?: CellCoordinate;
    // For future: cursor position within cell, formula bar activity
    activityStatus?: UserActivityStatus;
}

export enum UserActivityStatus {
    EDITING = 'EDITING',
    VIEWING = 'VIEWING',
    IDLE = 'IDLE',
    TYPING = 'TYPING',
    NAVIGATING = 'NAVIGATING',
}

/**
 * Advanced Data Types and Features
 */

export enum SemanticDataType {
    NONE = 'NONE',
    PERSON = 'PERSON',
    PLACE = 'PLACE',
    ORGANIZATION = 'ORGANIZATION',
    PRODUCT = 'PRODUCT',
    EVENT = 'EVENT',
    EMAIL = 'EMAIL',
    URL = 'URL',
    CURRENCY = 'CURRENCY',
    STOCK_SYMBOL = 'STOCK_SYMBOL',
    GEOGRAPHIC_COORDINATE = 'GEOGRAPHIC_COORDINATE',
    DATE = 'DATE',
    TIME = 'TIME',
    PHONE_NUMBER = 'PHONE_NUMBER',
    QUANTITY = 'QUANTITY',
    MEASUREMENT = 'MEASUREMENT',
    COLOR = 'COLOR',
    UNIT = 'UNIT',
    CUSTOM_ENUM = 'CUSTOM_ENUM',
    // Advanced/AI-inferred types
    ENTITY = 'ENTITY', // Generic named entity
    SENTIMENT_SCORE = 'SENTIMENT_SCORE',
    KNOWLEDGE_GRAPH_ENTITY = 'KNOWLEDGE_GRAPH_ENTITY',
    IMAGE_LABEL = 'IMAGE_LABEL', // For cells containing image references
    DOCUMENT_REFERENCE = 'DOCUMENT_REFERENCE', // For cells linking to external documents
}

export interface CustomCellDataType {
    typeName: string; // e.g., "MyCustomObject"
    fields: { [key: string]: CellData }; // Structured fields within the cell
    displayField?: string; // Which field to display by default
    iconUrl?: string;
    // For rendering custom UI within a cell
    customRendererId?: string;
    // For data-aware actions
    actions?: CustomCellAction[];
}

export interface CustomCellAction {
    label: string;
    actionId: string; // Identifier for script to handle
    iconUrl?: string;
    parameters?: { [key: string]: any }; // Default parameters for the action
    permissionLevel?: PermissionRole; // Action requires specific role
}

export interface SpatialData {
    type: SpatialDataType;
    coordinates?: number[]; // [lat, lon], [x, y, z], etc.
    geoJson?: GeoJson;
    address?: string; // Human-readable address
    locationName?: string;
    countryCode?: string;
    region?: string;
    // For advanced geospatial calculations
    altitude?: number;
    precision?: number;
    unit?: UnitType;
}

export enum SpatialDataType {
    POINT = 'POINT',
    LINE = 'LINE',
    POLYGON = 'POLYGON',
    MULTIPOINT = 'MULTIPOINT',
    MULTILINE = 'MULTILINE',
    MULTIPOLYGON = 'MULTIPOLYGON',
    GEOMETRY_COLLECTION = 'GEOMETRY_COLLECTION',
    ADDRESS = 'ADDRESS',
    COUNTRY = 'COUNTRY',
    REGION = 'REGION',
    CITY = 'CITY',
}

export interface GeoJson {
    type: string;
    coordinates: any;
    properties?: { [key: string]: any };
}

export interface TemporalData {
    type: TemporalDataType;
    start?: string; // ISO 8601
    end?: string; // ISO 8601
    duration?: string; // ISO 8601 Duration format (e.g., "PT1H30M")
    // For repeating events
    recurrenceRule?: string; // iCalendar RRULE format
    timezone?: string;
    label?: string; // Event or period name
}

export enum TemporalDataType {
    INSTANT = 'INSTANT',
    INTERVAL = 'INTERVAL',
    DURATION = 'DURATION',
    EVENT = 'EVENT',
    RECURRING_EVENT = 'RECURRING_EVENT',
}

export interface GraphData {
    type: GraphDataType;
    nodes?: GraphNode[];
    edges?: GraphEdge[];
    graphId?: string; // Reference to a larger graph structure
    sourceNodeId?: string; // If cell represents a specific node/edge
    targetNodeId?: string;
    // For visualizing graph data in-cell
    previewUrl?: string;
}

export enum GraphDataType {
    NODE = 'NODE',
    EDGE = 'EDGE',
    SUBGRAPH = 'SUBGRAPH',
    PATH = 'PATH',
    KNOWLEDGE_GRAPH_LINK = 'KNOWLEDGE_GRAPH_LINK',
}

export interface GraphNode {
    id: string;
    label?: string;
    properties?: { [key: string]: any };
    color?: RGBColor;
    size?: number;
    iconUrl?: string;
    linkedCell?: CellCoordinate;
    // For spatial graph layouts
    x?: number;
    y?: number;
}

export interface GraphEdge {
    id: string;
    source: string; // Node ID
    target: string; // Node ID
    label?: string;
    properties?: { [key: string]: any };
    weight?: number;
    color?: RGBColor;
    style?: LineStyle;
    linkedCell?: CellCoordinate;
}

/**
 * Developer Metadata
 */

export interface DeveloperMetadata {
    metadataId: string;
    metadataKey?: string;
    metadataValue?: string;
    visibility: DeveloperMetadataVisibility;
    location?: DeveloperMetadataLocation;
    /** For versioning or specific app-related data */
    appId?: string;
    timestamp?: string;
}

export enum DeveloperMetadataVisibility {
    PROJECT = 'PROJECT', // Visible to the containing project
    DOCUMENT = 'DOCUMENT', // Visible within the document
    ROW = 'ROW',
    COLUMN = 'COLUMN',
    SHEET = 'SHEET',
    RANGE = 'RANGE',
    USER_PRIVATE = 'USER_PRIVATE', // Only visible to the creator
    APP_PRIVATE = 'APP_PRIVATE', // Only visible to the creating app
}

export interface DeveloperMetadataLocation {
    spreadsheet?: boolean; // Applies to the entire spreadsheet
    sheetId?: string;
    dimensionRange?: DimensionRange;
    range?: Range;
}

export interface DimensionRange {
    dimension: Dimension;
    startIndex: number;
    endIndex: number;
}

/**
 * Theming and Localization
 */

export interface SpreadsheetTheme {
    id: string;
    name: string;
    colors: ThemeColor[];
    fonts: ThemeFont[];
    defaultBorders?: BorderStyle;
    defaultCellPadding?: Padding;
    // Global chart defaults
    defaultChartOptions?: ChartOptions;
    // Custom CSS for web rendering
    customCss?: string;
    previewImageUrl?: string;
}

export interface ThemeColor {
    key: ThemeColorType;
    color: RGBColor;
}

export enum ThemeColorType {
    TEXT = 'TEXT',
    BACKGROUND = 'BACKGROUND',
    ACCENT1 = 'ACCENT1',
    ACCENT2 = 'ACCENT2',
    ACCENT3 = 'ACCENT3',
    ACCENT4 = 'ACCENT4',
    ACCENT5 = 'ACCENT5',
    ACCENT6 = 'ACCENT6',
    HYPERLINK = 'HYPERLINK',
    FOLLOWED_HYPERLINK = 'FOLLOWED_HYPERLINK',
    // Chart specific
    CHART_SERIES_1 = 'CHART_SERIES_1',
    CHART_SERIES_2 = 'CHART_SERIES_2',
    CHART_SERIES_3 = 'CHART_SERIES_3',
    CHART_SERIES_4 = 'CHART_SERIES_4',
    CHART_SERIES_5 = 'CHART_SERIES_5',
    CHART_SERIES_6 = 'CHART_SERIES_6',
    CHART_SERIES_7 = 'CHART_SERIES_7',
    CHART_SERIES_8 = 'CHART_SERIES_8',
    // UI specific
    HEADER_BACKGROUND = 'HEADER_BACKGROUND',
    HEADER_TEXT = 'HEADER_TEXT',
    GRIDLINE = 'GRIDLINE',
    SELECTED_RANGE = 'SELECTED_RANGE',
    HIGHLIGHTED_CELL = 'HIGHLIGHTED_CELL',
    ERROR_HIGHLIGHT = 'ERROR_HIGHLIGHT',
}

export interface ThemeFont {
    key: ThemeFontType;
    fontFamily: string;
}

export enum ThemeFontType {
    BODY = 'BODY',
    HEADING = 'HEADING',
    DISPLAY = 'DISPLAY',
    MONOSPACE = 'MONOSPACE',
}

export interface LocaleSettings {
    locale: string; // e.g., "en-US", "fr-FR"
    timezone: string; // e.g., "America/New_York"
    numberFormat?: NumberFormat; // Default number format
    currencyCode?: string; // e.g., "USD"
    firstDayOfWeek?: DayOfWeek;
    // For date/time parsing
    dateInputFormat?: string[]; // e.g., ["MM/dd/yyyy", "M/D/YY"]
    timeInputFormat?: string[];
    // Calendar settings
    calendarSystem?: CalendarSystem;
}

export enum DayOfWeek {
    SUNDAY = 'SUNDAY',
    MONDAY = 'MONDAY',
    TUESDAY = 'TUESDAY',
    WEDNESDAY = 'WEDNESDAY',
    THURSDAY = 'THURSDAY',
    FRIDAY = 'FRIDAY',
    SATURDAY = 'SATURDAY',
}

export enum CalendarSystem {
    GREGORIAN = 'GREGORIAN',
    JAPANESE = 'JAPANESE',
    CHINESE = 'CHINESE',
    ISLAMIC = 'ISLAMIC',
    HEBREW = 'HEBREW',
    INDIAN = 'INDIAN',
    PERSIAN = 'PERSIAN',
}

/**
 * External Data & Integrations
 */

export interface ExternalDataSource {
    id: string;
    name: string;
    type: DataSourceType;
    connectionConfig: ConnectionConfig;
    lastRefreshTime?: string;
    refreshSchedule?: RefreshSchedule;
    status?: DataSourceStatus;
    // Defines what columns are available and their types
    schema?: DataSourceSchema;
    // For data that can be written back
    writebackConfig?: DataWritebackConfig;
}

export enum DataSourceType {
    DATABASE = 'DATABASE', // SQL, NoSQL
    API = 'API', // REST, GraphQL
    CLOUD_STORAGE = 'CLOUD_STORAGE', // GCS, S3, Dropbox
    WEB_SCRAPE = 'WEB_SCRAPE',
    CSV_FILE = 'CSV_FILE',
    JSON_FILE = 'JSON_FILE',
    ANALYTICS_PLATFORM = 'ANALYTICS_PLATFORM', // Google Analytics, Salesforce
    BLOCKCHAIN_LEDGER = 'BLOCKCHAIN_LEDGER',
    REALTIME_STREAM = 'REALTIME_STREAM', // Kafka, Pub/Sub
    KNOWLEDGE_GRAPH = 'KNOWLEDGE_GRAPH',
}

export interface ConnectionConfig {
    url?: string; // For APIs, databases
    authentication?: AuthenticationConfig;
    query?: string; // SQL query, API path, GraphQL query, etc.
    headers?: { [key: string]: string };
    body?: string;
    pollingIntervalSeconds?: number; // For real-time streams
    // Custom properties for specific data sources
    customProperties?: { [key: string]: any };
}

export interface AuthenticationConfig {
    type: AuthenticationType;
    apiKey?: string;
    oAuthClientId?: string;
    oAuthScopes?: string[];
    jwtToken?: string;
    bearerToken?: string;
    // For future: biometric, hardware key auth
}

export enum AuthenticationType {
    NONE = 'NONE',
    API_KEY = 'API_KEY',
    OAUTH2 = 'OAUTH2',
    BEARER_TOKEN = 'BEARER_TOKEN',
    JWT = 'JWT',
    BASIC_AUTH = 'BASIC_AUTH',
    SESSION_TOKEN = 'SESSION_TOKEN',
}

export interface RefreshSchedule {
    frequency: RefreshFrequency;
    atTime?: string; // "HH:mm"
    onDaysOfWeek?: DayOfWeek[];
    nextRefreshTime?: string;
}

export enum RefreshFrequency {
    MANUAL = 'MANUAL',
    HOURLY = 'HOURLY',
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    ON_OPEN = 'ON_OPEN',
    ON_CHANGE = 'ON_CHANGE',
}

export enum DataSourceStatus {
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED',
    ERROR = 'ERROR',
    CONNECTING = 'CONNECTING',
    REFRESHING = 'REFRESHING',
    AUTHENTICATION_REQUIRED = 'AUTHENTICATION_REQUIRED',
    INVALID_QUERY = 'INVALID_QUERY',
}

export interface DataSourceSchema {
    columns: DataSourceColumn[];
    primaryKeys?: DataSourceColumnReference[];
    relationships?: DataSourceRelationship[];
}

export interface DataSourceColumn {
    id: string; // Unique ID for column
    name: string; // Display name
    dataType: DataSourceColumnDataType;
    isNullable?: boolean;
    defaultValue?: string | number | boolean;
    // For sensitive data
    sensitivityLevel?: DataSensitivityLevel;
    encryptionRequired?: boolean;
    description?: string; // For documentation
    metadata?: DeveloperMetadata[]; // Column-specific metadata
}

export enum DataSourceColumnDataType {
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN',
    DATE = 'DATE',
    DATETIME = 'DATETIME',
    TIMESTAMP = 'TIMESTAMP',
    CURRENCY = 'CURRENCY',
    PERCENT = 'PERCENT',
    JSON_BLOB = 'JSON_BLOB',
    XML_BLOB = 'XML_BLOB',
    BINARY = 'BINARY',
    GEOMETRY = 'GEOMETRY',
    ARRAY_STRING = 'ARRAY_STRING',
    ARRAY_NUMBER = 'ARRAY_NUMBER',
    ARRAY_BOOLEAN = 'ARRAY_BOOLEAN',
    OBJECT = 'OBJECT', // For nested JSON/document data
    IP_ADDRESS = 'IP_ADDRESS',
    EMAIL_ADDRESS = 'EMAIL_ADDRESS',
    URL = 'URL',
}

export enum DataSensitivityLevel {
    PUBLIC = 'PUBLIC',
    INTERNAL = 'INTERNAL',
    CONFIDENTIAL = 'CONFIDENTIAL',
    RESTRICTED = 'RESTRICTED',
    TOP_SECRET = 'TOP_SECRET',
}

export interface DataSourceColumnReference {
    dataSourceId: string;
    columnId: string;
}

export interface DataSourceRelationship {
    fromColumn: DataSourceColumnReference;
    toColumn: DataSourceColumnReference;
    type: RelationshipType;
    // For advanced relational databases
    onDelete?: ReferentialAction;
    onUpdate?: ReferentialAction;
}

export enum RelationshipType {
    ONE_TO_ONE = 'ONE_TO_ONE',
    ONE_TO_MANY = 'ONE_TO_MANY',
    MANY_TO_ONE = 'MANY_TO_ONE',
    MANY_TO_MANY = 'MANY_TO_MANY',
}

export enum ReferentialAction {
    CASCADE = 'CASCADE',
    SET_NULL = 'SET_NULL',
    RESTRICT = 'RESTRICT',
    NO_ACTION = 'NO_ACTION',
}

export interface DataWritebackConfig {
    writebackType: DataWritebackType;
    targetTable?: string;
    primaryKeyColumns?: DataSourceColumnReference[];
    mapping?: { [sheetColumnIndex: number]: DataSourceColumnReference }; // Map sheet columns to data source columns
    onConflict?: WritebackConflictStrategy;
    preWriteValidationScriptId?: string; // Script to validate data before write
    postWriteActionScriptId?: string; // Script to run after successful write
}

export enum DataWritebackType {
    INSERT = 'INSERT',
    UPDATE = 'UPDATE',
    UPSERT = 'UPSERT',
    DELETE = 'DELETE',
}

export enum WritebackConflictStrategy {
    REPLACE_EXISTING = 'REPLACE_EXISTING',
    KEEP_EXISTING = 'KEEP_EXISTING',
    ERROR = 'ERROR',
    MERGE = 'MERGE',
}

export interface WebhookConfig {
    id: string;
    url: string;
    events: SheetEventType[];
    secret?: string; // For signature validation
    headers?: { [key: string]: string };
    payloadTemplate?: string; // Custom payload template
    isActive?: boolean;
    lastTriggered?: string;
    failureCount?: number;
    creatorId?: string;
}

/**
 * Scripting and Automation
 */

export interface ScriptMetadata {
    scriptId: string;
    name: string;
    description?: string;
    codeHash?: string; // Hash of the script code for versioning
    triggers?: ScriptTrigger[];
    customFunctions?: CustomFunctionDefinition[];
    macros?: MacroDefinition[];
    enabled?: boolean;
    creationTime?: string;
    lastUpdateTime?: string;
    authorId?: string;
    permissions?: ScriptPermission[];
    // For AI-generated scripts
    aiGenerated?: boolean;
    aiSource?: AIInsightType;
}

export interface ScriptPermission {
    userId?: string;
    groupId?: string;
    role: ScriptRole;
}

export enum ScriptRole {
    OWNER = 'OWNER',
    EDITOR = 'EDITOR',
    RUNNER = 'RUNNER', // Can only execute, not modify
}

export interface ScriptTrigger {
    id: string;
    type: TriggerType;
    handlerFunctionName: string;
    enabled?: boolean;
    // Specific trigger configurations
    sheetId?: string; // For ON_CHANGE, ON_EDIT, etc.
    range?: Range; // For specific range changes
    timeBasedConfig?: TimeBasedTriggerConfig;
    formSubmitConfig?: FormSubmitTriggerConfig;
    dataSourceEventConfig?: DataSourceEventTriggerConfig;
    webhookEventConfig?: WebhookEventTriggerConfig;
}

export enum TriggerType {
    ON_OPEN = 'ON_OPEN',
    ON_EDIT = 'ON_EDIT',
    ON_CHANGE = 'ON_CHANGE',
    ON_FORM_SUBMIT = 'ON_FORM_SUBMIT',
    ON_TIME_DRIVEN = 'ON_TIME_DRIVEN',
    ON_DATA_SOURCE_UPDATE = 'ON_DATA_SOURCE_UPDATE',
    ON_WEBHOOK = 'ON_WEBHOOK',
    ON_ADDON_EVENT = 'ON_ADDON_EVENT',
    ON_CELL_ACTION = 'ON_CELL_ACTION', // Custom cell actions
    ON_AI_RECOMMENDATION_ACCEPT = 'ON_AI_RECOMMENDATION_ACCEPT',
}

export interface TimeBasedTriggerConfig {
    frequency: TimeTriggerFrequency;
    minuteInterval?: number;
    hourInterval?: number;
    atHour?: number;
    onDayOfWeek?: DayOfWeek;
    onDayOfMonth?: number;
}

export enum TimeTriggerFrequency {
    HOURLY = 'HOURLY',
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
}

export interface FormSubmitTriggerConfig {
    formId: string;
    linkedSheetId: string;
}

export interface DataSourceEventTriggerConfig {
    dataSourceId: string;
    eventType: DataSourceEventType;
}

export enum DataSourceEventType {
    ON_REFRESH = 'ON_REFRESH',
    ON_ERROR = 'ON_ERROR',
    ON_SCHEMA_CHANGE = 'ON_SCHEMA_CHANGE',
    ON_WRITEBACK_SUCCESS = 'ON_WRITEBACK_SUCCESS',
    ON_WRITEBACK_ERROR = 'ON_WRITEBACK_ERROR',
}

export interface WebhookEventTriggerConfig {
    webhookId: string;
    eventType: WebhookEventType;
}

export enum WebhookEventType {
    ON_RECEIVE = 'ON_RECEIVE',
    ON_ERROR = 'ON_ERROR',
}

export interface CustomFunctionDefinition {
    functionName: string;
    description?: string;
    parameters: FunctionParameter[];
    returnType: FunctionReturnType;
    example?: string;
    volatile?: boolean; // If true, recalculates often
    category?: string; // e.g., "Financial", "Text"
    accessControl?: {
        enabledFor?: string[]; // User IDs or group IDs
    };
    scriptId?: string; // Link to the script that implements it
}

export interface FunctionParameter {
    name: string;
    type: FunctionParameterType;
    description?: string;
    optional?: boolean;
    defaultValue?: string;
    repeated?: boolean; // e.g., fn(arg1, arg2...)
}

export enum FunctionParameterType {
    ANY = 'ANY',
    NUMBER = 'NUMBER',
    STRING = 'STRING',
    BOOLEAN = 'BOOLEAN',
    RANGE = 'RANGE',
    DATE = 'DATE',
    TIME = 'TIME',
    DATETIME = 'DATETIME',
    ARRAY = 'ARRAY', // Array of any
    OBJECT = 'OBJECT', // Structured data
    ERROR = 'ERROR',
    FORMULA = 'FORMULA', // Literal formula string
}

export enum FunctionReturnType {
    ANY = 'ANY',
    NUMBER = 'NUMBER',
    STRING = 'STRING',
    BOOLEAN = 'BOOLEAN',
    DATE = 'DATE',
    TIME = 'TIME',
    DATETIME = 'DATETIME',
    ARRAY = 'ARRAY',
    OBJECT = 'OBJECT',
    ERROR = 'ERROR',
    VOID = 'VOID', // For side-effect only functions
}

export interface MacroDefinition {
    macroId: string;
    name: string;
    functionName: string; // The script function to call
    keyboardShortcut?: string; // e.g., "Ctrl+Alt+Shift+1"
    description?: string;
    editorId?: string;
    creationTime?: string;
}

export interface AddOnMetadata {
    addOnId: string;
    name: string;
    description?: string;
    publisherId?: string;
    installTime?: string;
    enabled?: boolean;
    scopeAccess?: string[]; // OAuth scopes requested
    permissions?: AddOnPermission[];
    // For UI extensions like custom menus, sidebars
    menuItems?: AddOnMenuItem[];
    sidebars?: AddOnSidebar[];
    modalDialogs?: AddOnModalDialog[];
    // For integrations with other services
    integratedServices?: IntegratedService[];
    // Versioning and updates
    version?: string;
    autoUpdateEnabled?: boolean;
}

export interface AddOnPermission {
    userId?: string;
    groupId?: string;
    role: AddOnRole;
}

export enum AddOnRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
    VIEWER = 'VIEWER',
}

export interface AddOnMenuItem {
    caption: string;
    functionName: string; // Script function to execute
    iconUrl?: string;
    children?: AddOnMenuItem[]; // Nested menus
    accessControl?: { enabledFor?: string[] };
}

export interface AddOnSidebar {
    id: string;
    title: string;
    htmlContentUrl?: string; // URL to an HTML file for the sidebar UI
    scriptFunctionName?: string; // Function to render dynamic content
    visibleByDefault?: boolean;
    widthPixels?: number;
    // Context-aware sidebars
    contextTriggers?: TriggerType[];
}

export interface AddOnModalDialog {
    id: string;
    title: string;
    htmlContentUrl?: string;
    scriptFunctionName?: string;
    widthPixels?: number;
    heightPixels?: number;
    resizable?: boolean;
    movable?: boolean;
}

export interface IntegratedService {
    serviceId: string;
    serviceName: string;
    authType: AuthenticationType;
    scopesNeeded: string[];
    configured?: boolean;
    connectionStatus?: ServiceConnectionStatus;
}

export enum ServiceConnectionStatus {
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED',
    AUTH_REQUIRED = 'AUTH_REQUIRED',
    ERROR = 'ERROR',
}

/**
 * Events, Notifications, and Activity Stream
 */

export interface SheetEvent {
    id: string;
    type: SheetEventType;
    timestamp: string; // ISO 8601
    userId: string;
    workbookId: string;
    sheetId?: string;
    range?: Range;
    details?: { [key: string]: any }; // Event-specific details
    // For AI-triggered events
    aiTriggered?: boolean;
    aiInsightId?: string;
}

export enum SheetEventType {
    WORKBOOK_OPEN = 'WORKBOOK_OPEN',
    WORKBOOK_SAVE = 'WORKBOOK_SAVE',
    WORKBOOK_CLOSE = 'WORKBOOK_CLOSE',
    WORKBOOK_SHARE = 'WORKBOOK_SHARE',
    WORKBOOK_UNSHARE = 'WORKBOOK_UNSHARE',
    WORKBOOK_PERMISSION_CHANGE = 'WORKBOOK_PERMISSION_CHANGE',
    SHEET_ADD = 'SHEET_ADD',
    SHEET_DELETE = 'SHEET_DELETE',
    SHEET_RENAME = 'SHEET_RENAME',
    SHEET_MOVE = 'SHEET_MOVE',
    SHEET_HIDE = 'SHEET_HIDE',
    SHEET_UNHIDE = 'SHEET_UNHIDE',
    CELL_EDIT = 'CELL_EDIT',
    CELL_INSERT_ROW = 'CELL_INSERT_ROW',
    CELL_DELETE_ROW = 'CELL_DELETE_ROW',
    CELL_INSERT_COLUMN = 'CELL_INSERT_COLUMN',
    CELL_DELETE_COLUMN = 'CELL_DELETE_COLUMN',
    CELL_MERGE = 'CELL_MERGE',
    CELL_UNMERGE = 'CELL_UNMERGE',
    CELL_PASTE = 'CELL_PASTE',
    CELL_CUT = 'CELL_CUT',
    CELL_COPY = 'CELL_COPY',
    CELL_FORMAT_CHANGE = 'CELL_FORMAT_CHANGE',
    DATA_VALIDATION_CHANGE = 'DATA_VALIDATION_CHANGE',
    CONDITIONAL_FORMAT_CHANGE = 'CONDITIONAL_FORMAT_CHANGE',
    CHART_ADD = 'CHART_ADD',
    CHART_UPDATE = 'CHART_UPDATE',
    CHART_DELETE = 'CHART_DELETE',
    PIVOT_TABLE_ADD = 'PIVOT_TABLE_ADD',
    PIVOT_TABLE_UPDATE = 'PIVOT_TABLE_UPDATE',
    PIVOT_TABLE_DELETE = 'PIVOT_TABLE_DELETE',
    COMMENT_ADD = 'COMMENT_ADD',
    COMMENT_UPDATE = 'COMMENT_UPDATE',
    COMMENT_DELETE = 'COMMENT_DELETE',
    COMMENT_RESOLVE = 'COMMENT_RESOLVE',
    DATA_REFRESH = 'DATA_REFRESH',
    SCRIPT_RUN = 'SCRIPT_RUN',
    MACRO_RUN = 'MACRO_RUN',
    ADDON_ACTION = 'ADDON_ACTION',
    AI_ASSISTANT_INVOKED = 'AI_ASSISTANT_INVOKED',
    AI_INSIGHT_GENERATED = 'AI_INSIGHT_GENERATED',
    AI_RECOMMENDATION_ACCEPTED = 'AI_RECOMMENDATION_ACCEPTED',
    AI_RECOMMENDATION_REJECTED = 'AI_RECOMMENDATION_REJECTED',
    REALTIME_PRESENCE_CHANGE = 'REALTIME_PRESENCE_CHANGE',
    EXTERNAL_DATA_WRITEBACK = 'EXTERNAL_DATA_WRITEBACK',
    UNDO = 'UNDO',
    REDO = 'REDO',
}

export interface EventListenerConfig {
    id: string;
    eventType: SheetEventType | TriggerType; // Can listen to general events or specific triggers
    scriptFunctionId?: string; // The script function to call
    webhookConfigId?: string; // The webhook to trigger
    notificationConfigId?: string; // The notification to send
    filter?: EventFilter;
    enabled?: boolean;
    creatorId?: string;
}

export interface EventFilter {
    sheetIds?: string[];
    ranges?: Range[];
    userIds?: string[];
    minChangeSize?: number; // e.g., only trigger if > N cells changed
    formulaChangeOnly?: boolean;
    dataValueChangeOnly?: boolean;
    styleChangeOnly?: boolean;
    // For AI-related events
    aiInsightType?: AIInsightType;
}

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    message: RichTextValue;
    targetUrl?: string; // Link to the relevant part of the spreadsheet
    read?: boolean;
    timestamp: string; // ISO 8601
    sourceEventId?: string;
    // For push notifications, email, in-app
    deliveryMethod?: NotificationDeliveryMethod;
    priority?: NotificationPriority;
    actions?: NotificationAction[]; // e.g., "Reply", "Dismiss"
}

export enum NotificationType {
    MENTION = 'MENTION',
    COMMENT_REPLY = 'COMMENT_REPLY',
    SHARE_UPDATE = 'SHARE_UPDATE',
    PERMISSION_CHANGE = 'PERMISSION_CHANGE',
    DATA_REFRESH_COMPLETE = 'DATA_REFRESH_COMPLETE',
    DATA_REFRESH_ERROR = 'DATA_REFRESH_ERROR',
    SCRIPT_FAILURE = 'SCRIPT_FAILURE',
    AI_INSIGHT = 'AI_INSIGHT',
    AI_WARNING = 'AI_WARNING',
    VERSION_UPDATE = 'VERSION_UPDATE',
    APPROVE_REQUEST = 'APPROVE_REQUEST', // For approval workflows
    TASK_ASSIGNMENT = 'TASK_ASSIGNMENT',
    REMINDER = 'REMINDER',
}

export enum NotificationDeliveryMethod {
    IN_APP = 'IN_APP',
    EMAIL = 'EMAIL',
    PUSH_NOTIFICATION = 'PUSH_NOTIFICATION',
    SMS = 'SMS',
    CHAT_APP = 'CHAT_APP', // e.g., Slack, Teams
}

export enum NotificationPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

export interface NotificationAction {
    label: string;
    actionId: string; // Identifier for client-side or script action
    url?: string; // For simple links
    method?: "POST" | "GET"; // For API calls
    payload?: { [key: string]: any };
}

/**
 * AI / Machine Learning Features
 */

export interface AIAssistantConfig {
    enabled?: boolean;
    modelId?: string; // Which AI model to use
    privacySettings?: AIPrivacySettings;
    capabilities?: AICapability[];
    defaultPersonality?: AIPersonality;
    feedbackHistoryEnabled?: boolean;
    // For fine-tuning with specific workbook data
    fineTuneDatasetRange?: Range;
    fineTuneStatus?: AIFineTuneStatus;
}

export enum AIFineTuneStatus {
    NONE = 'NONE',
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
}

export enum AICapability {
    FORMULA_GENERATION = 'FORMULA_GENERATION',
    DATA_CLEANING = 'DATA_CLEANING',
    INSIGHT_GENERATION = 'INSIGHT_GENERATION',
    CHART_RECOMMENDATION = 'CHART_RECOMMENDATION',
    QUERY_GENERATION = 'QUERY_GENERATION',
    NATURAL_LANGUAGE_QUERY = 'NATURAL_LANGUAGE_QUERY',
    PREDICTIVE_MODELING = 'PREDICTIVE_MODELING',
    TEXT_SUMMARIZATION = 'TEXT_SUMMARIZATION',
    LANGUAGE_TRANSLATION = 'LANGUAGE_TRANSLATION',
    ENTITY_EXTRACTION = 'ENTITY_EXTRACTION',
    DATA_TRANSFORMATION = 'DATA_TRANSFORMATION',
    SECURITY_ANOMALY_DETECTION = 'SECURITY_ANOMALY_DETECTION',
    WORKFLOW_AUTOMATION = 'WORKFLOW_AUTOMATION',
    CODE_GENERATION = 'CODE_GENERATION', // e.g. Apps Script
    DATA_IMPUTATION = 'DATA_IMPUTATION', // Filling missing values
    DATA_SYNTHESIS = 'DATA_SYNTHESIS', // Generating synthetic data
}

export interface AIPrivacySettings {
    dataSharingEnabled?: boolean; // Share workbook data with AI service
    anonymizeData?: boolean;
    optOutOfLearning?: boolean;
    encryptionEnabled?: boolean;
}

export enum AIPersonality {
    NEUTRAL = 'NEUTRAL',
    FORMAL = 'FORMAL',
    FRIENDLY = 'FRIENDLY',
    CRITICAL = 'CRITICAL',
    INNOVATIVE = 'INNOVATIVE',
    HELPFUL = 'HELPFUL',
}

export interface AIInsight {
    id: string;
    type: AIInsightType;
    description: RichTextValue;
    targetRanges?: Range[];
    confidence?: number; // 0-1
    severity?: InsightSeverity;
    recommendations?: AIRecommendation[];
    generatedTime: string;
    acknowledged?: boolean;
    sentiment?: SentimentAnalysis;
    sourceUserId?: string; // If triggered by a user action
    // For more complex, multi-modal insights (e.g., combining text, image analysis)
    associatedMediaUrl?: string[];
    // For tracing how the AI arrived at the insight
    reasoningTrace?: string;
    modelVersion?: string;
}

export enum AIInsightType {
    DATA_ANOMALY = 'DATA_ANOMALY',
    TREND_DETECTION = 'TREND_DETECTION',
    OUTLIER_DETECTION = 'OUTLIER_DETECTION',
    CORRELATION_ANALYSIS = 'CORRELATION_ANALYSIS',
    PREDICTIVE_FORECAST = 'PREDICTIVE_FORECAST',
    DATA_CLEANING_SUGGESTION = 'DATA_CLEANING_SUGGESTION',
    MISSING_DATA_IMPUTATION = 'MISSING_DATA_IMPUTATION',
    CHART_SUGGESTION = 'CHART_SUGGESTION',
    FORMULA_SUGGESTION = 'FORMULA_SUGGESTION',
    NATURAL_LANGUAGE_SUMMARY = 'NATURAL_LANGUAGE_SUMMARY',
    SECURITY_VULNERABILITY = 'SECURITY_VULNERABILITY',
    PERFORMANCE_OPTIMIZATION = 'PERFORMANCE_OPTIMIZATION',
    WORKFLOW_AUTOMATION_SUGGESTION = 'WORKFLOW_AUTOMATION_SUGGESTION',
    ENTITY_RECOGNITION = 'ENTITY_RECOGNITION',
    GEOSPATIAL_PATTERN = 'GEOSPATIAL_PATTERN',
    TEXT_CLASSIFICATION = 'TEXT_CLASSIFICATION',
    RISK_ASSESSMENT = 'RISK_ASSESSMENT',
    SENTIMENT_ANALYSIS = 'SENTIMENT_ANALYSIS',
    SIMILAR_DOCUMENT_FINDER = 'SIMILAR_DOCUMENT_FINDER',
}

export enum InsightSeverity {
    INFO = 'INFO',
    WARNING = 'WARNING',
    CRITICAL = 'CRITICAL',
    SUGGESTION = 'SUGGESTION',
}

export interface SentimentAnalysis {
    score: number; // e.g., -1 to 1
    magnitude: number;
    dominantEmotion?: string;
    keywords?: string[];
}

export interface AIRecommendation {
    id: string;
    description: RichTextValue;
    actionType: AIRecommendationActionType;
    actionDetails?: { [key: string]: any };
    costEstimate?: string; // e.g., "Low", "$0.05" for cloud operations
    difficulty?: RecommendationDifficulty;
    estimatedTime?: string; // e.g., "2m"
    // For chainable recommendations
    prerequisiteRecommendationId?: string;
    outcomePredictor?: AIOperationOutcome;
}

export enum AIRecommendationActionType {
    APPLY_DATA_CLEANUP = 'APPLY_DATA_CLEANUP',
    INSERT_FORMULA = 'INSERT_FORMULA',
    CREATE_CHART = 'CREATE_CHART',
    APPLY_CONDITIONAL_FORMAT = 'APPLY_CONDITIONAL_FORMAT',
    CREATE_PIVOT_TABLE = 'CREATE_PIVOT_TABLE',
    ADD_DATA_VALIDATION = 'ADD_DATA_VALIDATION',
    ADD_COMMENT = 'ADD_COMMENT',
    UPDATE_CELL_STYLE = 'UPDATE_CELL_STYLE',
    GENERATE_SUMMARY = 'GENERATE_SUMMARY',
    CONNECT_DATA_SOURCE = 'CONNECT_DATA_SOURCE',
    CREATE_SCRIPT = 'CREATE_SCRIPT',
    TRANSLATE_RANGE = 'TRANSLATE_RANGE',
    IMPUTE_MISSING_VALUES = 'IMPUTE_MISSING_VALUES',
    HIGHLIGHT_ANOMALIES = 'HIGHLIGHT_ANOMALIES',
    SUGGEST_PERMISSION_CHANGE = 'SUGGEST_PERMISSION_CHANGE',
    OPTIMIZE_CALCULATION = 'OPTIMIZE_CALCULATION',
    ADD_TO_KNOWLEDGE_GRAPH = 'ADD_TO_KNOWLEDGE_GRAPH',
}

export enum RecommendationDifficulty {
    EASY = 'EASY',
    MEDIUM = 'MEDIUM',
    HARD = 'HARD',
    EXPERT = 'EXPERT',
}

export interface AIOperationOutcome {
    predictedImpact?: string; // e.g., "Improved data quality by 15%"
    predictedRisks?: string[];
    rollbackPossible?: boolean;
}

export interface DataCleaningSuggestion extends AIInsight {
    cleaningActions: DataCleaningAction[];
}

export interface DataCleaningAction {
    type: DataCleaningActionType;
    range: Range;
    details?: { [key: string]: any }; // e.g., "valueToReplace": "N/A", "replaceWith": ""
    previewData?: { original: CellData; preview: CellData }[];
    affectedCellCount?: number;
    impactScore?: number; // How much this action improves data quality
}

export enum DataCleaningActionType {
    REMOVE_DUPLICATES = 'REMOVE_DUPLICATES',
    TRIM_WHITESPACE = 'TRIM_WHITESPACE',
    CHANGE_TEXT_CASE = 'CHANGE_TEXT_CASE',
    FIX_DATE_FORMATS = 'FIX_DATE_FORMATS',
    FIX_NUMBER_FORMATS = 'FIX_NUMBER_FORMATS',
    REMOVE_EMPTY_ROWS = 'REMOVE_EMPTY_ROWS',
    REMOVE_EMPTY_COLUMNS = 'REMOVE_EMPTY_COLUMNS',
    REPLACE_INVALID_CHARS = 'REPLACE_INVALID_CHARS',
    FILL_MISSING_VALUES = 'FILL_MISSING_VALUES',
    SPLIT_COLUMNS = 'SPLIT_COLUMNS',
    MERGE_COLUMNS = 'MERGE_COLUMNS',
    CONVERT_DATA_TYPE = 'CONVERT_DATA_TYPE',
    STANDARDIZE_UNITS = 'STANDARDIZE_UNITS',
    NORMALIZE_TEXT = 'NORMALIZE_TEXT',
}

export interface PredictiveModelConfig {
    id: string;
    name: string;
    modelType: PredictiveModelType;
    trainingDataRange: Range;
    targetColumn: number; // Index of the column to predict
    featureColumns: number[]; // Indices of columns used as features
    hyperparameters?: { [key: string]: any };
    status?: ModelStatus;
    evaluationMetrics?: ModelEvaluationMetrics;
    predictionOutputRange?: Range;
    autoRetrainSchedule?: RefreshSchedule;
    // For integrating with external ML platforms
    externalModelId?: string;
    externalService?: ExternalMLService;
}

export enum PredictiveModelType {
    LINEAR_REGRESSION = 'LINEAR_REGRESSION',
    LOGISTIC_REGRESSION = 'LOGISTIC_REGRESSION',
    DECISION_TREE = 'DECISION_TREE',
    RANDOM_FOREST = 'RANDOM_FOREST',
    GRADIENT_BOOSTING = 'GRADIENT_BOOSTING',
    NEURAL_NETWORK = 'NEURAL_NETWORK',
    K_MEANS = 'K_MEANS', // For clustering
    TIME_SERIES_FORECAST = 'TIME_SERIES_FORECAST',
    SENTIMENT_CLASSIFICATION = 'SENTIMENT_CLASSIFICATION',
    NATURAL_LANGUAGE_GENERATION = 'NATURAL_LANGUAGE_GENERATION',
    CUSTOM_EXTERNAL = 'CUSTOM_EXTERNAL',
}

export enum ModelStatus {
    UNTRAINED = 'UNTRAINED',
    TRAINING = 'TRAINING',
    TRAINED = 'TRAINED',
    FAILED = 'FAILED',
    DEPRECATED = 'DEPRECATED',
}

export interface ModelEvaluationMetrics {
    rSquared?: number;
    meanAbsoluteError?: number;
    rootMeanSquaredError?: number;
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    // For time series
    mape?: number;
    // For clustering
    silhouetteScore?: number;
    // Custom metrics
    customMetrics?: { [key: string]: number };
}

export interface ExternalMLService {
    providerName: string; // e.g., "Google AI Platform", "AWS SageMaker"
    endpointUrl: string;
    authentication: AuthenticationConfig;
    modelVersion?: string;
}

/**
 * Query Engine and Data Federation
 */

export interface QueryEngineConfig {
    defaultLanguage?: QueryLanguage;
    enabled?: boolean;
    federatedSources?: FederatedSource[];
    // For optimizing query performance
    cachingStrategy?: QueryCachingStrategy;
    queryHistoryRetentionDays?: number;
    enableQueryOptimizer?: boolean;
}

export enum QueryLanguage {
    SHEETS_QUERY_LANGUAGE = 'SHEETS_QUERY_LANGUAGE', // e.g., Google Visualization Query Language
    SQL = 'SQL',
    DAX = 'DAX',
    MDX = 'MDX',
    GRAPHQL = 'GRAPHQL',
    NATURAL_LANGUAGE = 'NATURAL_LANGUAGE',
    CUSTOM = 'CUSTOM',
}

export interface FederatedSource {
    sourceId: string; // Can be a Workbook ID, Sheet ID, or ExternalDataSource ID
    alias?: string; // How it's referenced in queries
    schemaMapping?: FederatedSchemaMapping[]; // How source columns map to a unified schema
    queryPermissions?: WorkbookPermission[]; // Who can query this source via federation
}

export interface FederatedSchemaMapping {
    sourceColumn: DataSourceColumnReference | CellCoordinate;
    federatedColumnName: string;
    federatedColumnType: DataSourceColumnDataType;
    // For complex transformations during federation
    transformationFormula?: string;
}

export enum QueryCachingStrategy {
    NONE = 'NONE',
    ROW_LEVEL = 'ROW_LEVEL',
    TABLE_LEVEL = 'TABLE_LEVEL',
    CELL_LEVEL = 'CELL_LEVEL',
    INTELLIGENT = 'INTELLIGENT', // AI-driven caching
}

export interface QueryJob {
    jobId: string;
    queryText: string;
    status: QueryJobStatus;
    startTime: string;
    endTime?: string;
    errorMessage?: string;
    resultRange?: Range; // Where the results are written
    rowCount?: number;
    columnCount?: number;
    // For AI-assisted queries
    aiGeneratedQuery?: boolean;
    queryExplanation?: string; // Natural language explanation of the query
    costEstimate?: string; // For queries against paid external sources
    auditLogId?: string;
}

export enum QueryJobStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
    QUEUED = 'QUEUED',
}

/**
 * UI/UX and Accessibility
 */

export interface UserPreferences {
    userId: string;
    themeId?: string;
    defaultLocale?: string;
    defaultTimezone?: string;
    accessibilitySettings?: AccessibilitySettings;
    defaultChartType?: ChartType;
    defaultNumberFormat?: NumberFormat;
    defaultFontSize?: number;
    defaultFontFamily?: string;
    // For power users
    advancedFormulaBarEnabled?: boolean;
    keyboardShortcutsMap?: { [key: string]: string }; // Custom shortcut mappings
    aiAssistantVisibility?: UIVisibility;
    notificationPreferences?: NotificationPreferences;
    // For collaboration UI
    showPresenceCursors?: boolean;
    showChangeHighlights?: boolean;
}

export interface AccessibilitySettings {
    screenReaderModeEnabled?: boolean;
    highContrastModeEnabled?: boolean;
    fontSizeAdjustment?: number; // Relative adjustment
    colorBlindnessMode?: ColorBlindnessMode;
    keyboardNavigationEnabled?: boolean;
    speechToTextEnabled?: boolean;
    textToSpeechEnabled?: boolean;
    // For complex layouts
    semanticMarkupEnabled?: boolean;
}

export enum ColorBlindnessMode {
    NONE = 'NONE',
    PROTANOMALY = 'PROTANOMALY',
    DEUTERANOMALY = 'DEUTERANOMALY',
    TRITANOMALY = 'TRITANOMALY',
}

export enum UIVisibility {
    VISIBLE = 'VISIBLE',
    HIDDEN = 'HIDDEN',
    COLLAPSED = 'COLLAPSED',
    AUTO = 'AUTO',
}

export interface NotificationPreferences {
    emailNotificationsEnabled?: boolean;
    pushNotificationsEnabled?: boolean;
    inAppNotificationsEnabled?: boolean;
    smsNotificationsEnabled?: boolean;
    // Granular control by event type
    notificationFilters?: { [eventType: string]: boolean };
}

export interface SpreadsheetApp {
    workbook: Workbook;
    // Active UI state
    activeSheetId?: string;
    selectedRanges?: Range[];
    activeCell?: CellCoordinate;
    uiState?: UIState;
    // User context
    currentUser: User;
    // Environment
    isOffline?: boolean;
    // History/Undo Stack (typically transient client-side)
    undoStackSize?: number;
    redoStackSize?: number;
    // Global AI assistant context
    aiAssistantSessionId?: string;
    aiAssistantInputPrompt?: string; // Current user input to AI
    aiAssistantResponses?: AIAssistantResponse[]; // History of AI responses in session
}

export interface UIState {
    showFormulaBar?: boolean;
    showGridlines?: boolean;
    showHiddenRows?: boolean;
    showHiddenColumns?: boolean;
    zoomLevel?: number; // e.g., 1.0 for 100%
    activeFilterViewId?: string;
    sidebarOpen?: boolean;
    activeSidebarId?: string;
    activeModalDialogId?: string;
    // For collaborative UI
    followUserId?: string; // Following another user's view
    conflictResolutionMode?: ConflictResolutionMode;
}

export enum ConflictResolutionMode {
    NONE = 'NONE',
    MANUAL = 'MANUAL',
    LAST_WRITE_WINS = 'LAST_WRITE_WINS',
    FIRST_WRITE_WINS = 'FIRST_WRITE_WINS',
    MERGE_AUTOMATIC = 'MERGE_AUTOMATIC',
    AI_RESOLVE = 'AI_RESOLVE',
}

export interface AIAssistantResponse {
    id: string;
    timestamp: string;
    content: RichTextValue | EmbeddedObjectData[]; // Can be text, chart, etc.
    recommendations?: AIRecommendation[];
    followUpSuggestions?: AISuggestion[]; // For chat-like interaction
    responseFormat?: AIResponseFormat;
    // For conversational AI
    conversationTurnId?: string;
    confidenceScore?: number;
    executionTimeMs?: number;
}

export interface AISuggestion {
    text: string;
    actionType?: AIRecommendationActionType; // Optional, can be just a prompt
    actionDetails?: { [key: string]: any };
}

export enum AIResponseFormat {
    TEXT = 'TEXT',
    TABLE = 'TABLE',
    CHART = 'CHART',
    FORMULA = 'FORMULA',
    CODE = 'CODE',
    SUMMARY = 'SUMMARY',
    IMAGE = 'IMAGE',
    JSON = 'JSON',
    NATURAL_LANGUAGE = 'NATURAL_LANGUAGE',
}

export interface UnitType {
    name: string; // e.g., "meter", "kilogram", "USD"
    symbol?: string; // e.g., "m", "kg", "$"
    category?: UnitCategory; // e.g., "Length", "Mass", "Currency"
    conversionFactor?: { [targetUnit: string]: number }; // For internal unit conversion
    baseUnit?: string; // e.g., "meter" is base for "kilometer"
}

export enum UnitCategory {
    LENGTH = 'LENGTH',
    AREA = 'AREA',
    VOLUME = 'VOLUME',
    MASS = 'MASS',
    TIME = 'TIME',
    TEMPERATURE = 'TEMPERATURE',
    CURRENCY = 'CURRENCY',
    DATA_STORAGE = 'DATA_STORAGE',
    SPEED = 'SPEED',
    ACCELERATION = 'ACCELERATION',
    FORCE = 'FORCE',
    ENERGY = 'ENERGY',
    POWER = 'POWER',
    FREQUENCY = 'FREQUENCY',
    ANGLE = 'ANGLE',
    CUSTOM = 'CUSTOM',
}

export interface FormulaParseTree {
    type: FormulaNodeType;
    value?: string | number | boolean;
    children?: FormulaParseTree[];
    range?: Range; // For references
    functionName?: string;
    error?: FormulaError;
    // For advanced debugging
    intermediateResult?: any;
    executionOrder?: number;
}

export enum FormulaNodeType {
    LITERAL_NUMBER = 'LITERAL_NUMBER',
    LITERAL_STRING = 'LITERAL_STRING',
    LITERAL_BOOLEAN = 'LITERAL_BOOLEAN',
    LITERAL_ERROR = 'LITERAL_ERROR',
    CELL_REFERENCE = 'CELL_REFERENCE',
    RANGE_REFERENCE = 'RANGE_REFERENCE',
    NAMED_RANGE_REFERENCE = 'NAMED_RANGE_REFERENCE',
    FUNCTION_CALL = 'FUNCTION_CALL',
    OPERATOR_ADD = 'OPERATOR_ADD',
    OPERATOR_SUBTRACT = 'OPERATOR_SUBTRACT',
    OPERATOR_MULTIPLY = 'OPERATOR_MULTIPLY',
    OPERATOR_DIVIDE = 'OPERATOR_DIVIDE',
    OPERATOR_POWER = 'OPERATOR_POWER',
    OPERATOR_EQUAL = 'OPERATOR_EQUAL',
    OPERATOR_NOT_EQUAL = 'OPERATOR_NOT_EQUAL',
    OPERATOR_GREATER_THAN = 'OPERATOR_GREATER_THAN',
    OPERATOR_LESS_THAN = 'OPERATOR_LESS_THAN',
    OPERATOR_GREATER_THAN_OR_EQUAL = 'OPERATOR_GREATER_THAN_OR_EQUAL',
    OPERATOR_LESS_THAN_OR_EQUAL = 'OPERATOR_LESS_THAN_OR_EQUAL',
    OPERATOR_CONCATENATE = 'OPERATOR_CONCATENATE',
    ARRAY_LITERAL = 'ARRAY_LITERAL',
    EXPRESSION = 'EXPRESSION',
    EXTERNAL_DATA_REFERENCE = 'EXTERNAL_DATA_REFERENCE',
    SPARKLINE_DEFINITION = 'SPARKLINE_DEFINITION',
    QUERY_CALL = 'QUERY_CALL',
    LAMBDA_FUNCTION = 'LAMBDA_FUNCTION', // For new dynamic array formulas
    LET_EXPRESSION = 'LET_EXPRESSION',
}

// Global Registry of functions
export interface FunctionRegistry {
    functions: { [name: string]: CustomFunctionDefinition };
    categories: FunctionCategory[];
    // For AI-assisted discovery and usage of functions
    aiEmbeddings?: { [functionName: string]: number[] };
}

export interface FunctionCategory {
    name: string;
    description?: string;
    functions?: string[]; // List of function names in this category
}

// For system-level audit and security
export interface AuditLogEntry {
    logId: string;
    timestamp: string;
    userId: string;
    action: AuditActionType;
    workbookId: string;
    sheetId?: string;
    details?: { [key: string]: any };
    ipAddress?: string;
    deviceInfo?: string; // Browser, OS, etc.
    securityEvent?: SecurityEventDetails;
    // For compliance reporting
    complianceTags?: string[];
}

export enum AuditActionType {
    WORKBOOK_CREATE = 'WORKBOOK_CREATE',
    WORKBOOK_DELETE = 'WORKBOOK_DELETE',
    WORKBOOK_ACCESS = 'WORKBOOK_ACCESS',
    WORKBOOK_DOWNLOAD = 'WORKBOOK_DOWNLOAD',
    WORKBOOK_EXPORT = 'WORKBOOK_EXPORT',
    WORKBOOK_SHARE = 'WORKBOOK_SHARE',
    WORKBOOK_UNSHARE = 'WORKBOOK_UNSHARE',
    PERMISSION_CHANGE = 'PERMISSION_CHANGE',
    DATA_EDIT = 'DATA_EDIT',
    DATA_IMPORT = 'DATA_IMPORT',
    DATA_EXPORT = 'DATA_EXPORT',
    DATA_PURGE = 'DATA_PURGE',
    SCRIPT_EXECUTE = 'SCRIPT_EXECUTE',
    SCRIPT_MODIFY = 'SCRIPT_MODIFY',
    API_CALL = 'API_CALL',
    LOGIN_SUCCESS = 'LOGIN_SUCCESS',
    LOGIN_FAILURE = 'LOGIN_FAILURE',
    DATA_SOURCE_CONNECT = 'DATA_SOURCE_CONNECT',
    DATA_SOURCE_WRITEBACK = 'DATA_SOURCE_WRITEBACK',
    AI_ASSISTANT_INTERACTION = 'AI_ASSISTANT_INTERACTION',
    AI_MODEL_TRAIN = 'AI_MODEL_TRAIN',
}

export interface SecurityEventDetails {
    severity: InsightSeverity;
    eventType: SecurityEventType;
    description: string;
    affectedResources?: string[]; // e.g., sheetId, range
    detectionMethod?: string; // e.g., "AI Anomaly Detection", "Rule-based"
    recommendations?: string[];
}

export enum SecurityEventType {
    UNAUTHORIZED_ACCESS_ATTEMPT = 'UNAUTHORIZED_ACCESS_ATTEMPT',
    ANOMALOUS_DATA_MODIFICATION = 'ANOMALOUS_DATA_MODIFICATION',
    DATA_EXFILTRATION_ATTEMPT = 'DATA_EXFILTRATION_ATTEMPT',
    MALICIOUS_SCRIPT_DETECTION = 'MALICIOUS_SCRIPT_DETECTION',
    BRUTE_FORCE_LOGIN = 'BRUTE_FORCE_LOGIN',
    PHISHING_ATTEMPT = 'PHISHING_ATTEMPT',
    DATA_INTEGRITY_COMPROMISE = 'DATA_INTEGRITY_COMPROMISE',
    UNUSUAL_API_ACTIVITY = 'UNUSUAL_API_ACTIVITY',
}

export interface QuantumComputingConfig {
    enabled?: boolean;
    quantumAcceleratorEnabled?: boolean; // Use quantum hardware if available
    qmlModelId?: string; // Link to a quantum machine learning model
    quantumFunctionality?: QuantumFunctionality[];
    // For managing QPU resources
    resourceAllocation?: QuantumResourceAllocation;
    // For privacy-preserving computations
    homomorphicEncryptionEnabled?: boolean;
}

export enum QuantumFunctionality {
    OPTIMIZATION_SOLVER = 'OPTIMIZATION_SOLVER',
    CRYPTOGRAPHIC_PRIMITIVES = 'CRYPTOGRAPHIC_PRIMITIVES',
    SIMULATION = 'SIMULATION',
    MACHINE_LEARNING = 'MACHINE_LEARNING',
    DATA_SEARCH = 'DATA_SEARCH',
}

export interface QuantumResourceAllocation {
    provider?: string; // e.g., "IBM Quantum", "AWS Braket"
    quantumProcessingUnits?: number; // Number of qubits or QPU instances
    budgetLimit?: number; // Cost control
    priorityLevel?: QuantumJobPriority;
}

export enum QuantumJobPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

export interface BlockChainIntegration {
    enabled?: boolean;
    blockchainNetworkId?: string; // e.g., Ethereum, Polygon
    contractAddress?: string; // For smart contract interactions
    walletAddress?: string; // User's wallet
    tokenTrackingEnabled?: boolean; // Track specific tokens in cells
    dataVerificationMethods?: BlockchainVerificationMethod[];
    // For integrating cell data into a blockchain ledger
    onChainDataSyncConfig?: OnChainDataSyncConfig;
}

export enum BlockchainVerificationMethod {
    HASH_VERIFICATION = 'HASH_VERIFICATION',
    SMART_CONTRACT_VERIFICATION = 'SMART_CONTRACT_VERIFICATION',
    LEDGER_AUDIT = 'LEDGER_AUDIT',
}

export interface OnChainDataSyncConfig {
    targetContractMethod?: string; // Method on a smart contract to call
    triggerConditions?: ScriptTrigger[]; // When to sync data to chain
    dataMapping?: { [sheetColumnIndex: number]: string }; // Map sheet columns to contract parameters
    gasLimit?: number;
    transactionFeeAsset?: string;
    auditLogEnabled?: boolean;
}

// And finally, the top-level application structure to encompass all this
export interface SpreadsheetApplication {
    version: string;
    // Current active workbook
    activeWorkbookId?: string;
    workbooks: { [id: string]: Workbook };
    // Global settings across all workbooks for a user
    userPreferences: UserPreferences;
    // Global AI configuration
    globalAIAssistantConfig: AIAssistantConfig;
    // Global function/script registry
    globalFunctionRegistry: FunctionRegistry;
    // Global add-on marketplace and installed add-ons
    addOnMarketplace?: AddOnMetadata[];
    installedAddOns: { [id: string]: AddOnMetadata };
    // Event bus and notification system
    eventQueue?: SheetEvent[]; // Recent system events
    pendingNotifications?: Notification[];
    // Audit and security
    auditLogSettings?: AuditLogSettings;
    // Advanced compute capabilities
    quantumComputingConfig?: QuantumComputingConfig;
    blockchainIntegration?: BlockChainIntegration;
    // Global knowledge graph integration
    knowledgeGraphServiceEndpoint?: string;
    // For federated data access across multiple workbooks/data sources
    federatedDataCatalog?: FederatedDataCatalog;
    // System health and monitoring
    systemHealthStatus?: SystemHealthStatus;
}

export interface AuditLogSettings {
    enabled: boolean;
    retentionDays?: number;
    exportDestination?: ExternalDataSource; // e.g., export logs to a cloud storage bucket
    filteredEvents?: AuditActionType[]; // Only log specific events
    alertOnSecurityEvent?: boolean;
}

export interface FederatedDataCatalog {
    entities: FederatedEntity[];
    relationships: FederatedRelationship[];
    // For query optimization across federated sources
    queryRoutingRules?: QueryRoutingRule[];
}

export interface FederatedEntity {
    id: string;
    name: string;
    description?: string;
    attributes: DataSourceColumn[]; // Unified attributes across sources
    sourceMappings: FederatedSchemaMapping[]; // How this entity maps to underlying data
    // For semantic search/discovery
    tags?: string[];
    keywords?: string[];
}

export interface FederatedRelationship {
    id: string;
    fromEntity: string; // Entity ID
    toEntity: string; // Entity ID
    type: RelationshipType;
    description?: string;
    sourceMappings: FederatedSchemaMapping[]; // How this relationship is derived from sources
}

export interface QueryRoutingRule {
    priority: number;
    condition: QueryCondition; // e.g., if query involves these entities/attributes
    targetSourceIds: string[]; // List of source IDs to route query to
    transformationScriptId?: string; // Script to transform query for target source
}

export interface QueryCondition {
    field: string;
    operator: QueryConditionOperator;
    value: string | number | boolean | string[];
}

export enum QueryConditionOperator {
    EQUALS = 'EQUALS',
    NOT_EQUALS = 'NOT_EQUALS',
    GREATER_THAN = 'GREATER_THAN',
    LESS_THAN = 'LESS_THAN',
    CONTAINS = 'CONTAINS',
    STARTS_WITH = 'STARTS_WITH',
    ENDS_WITH = 'ENDS_WITH',
    IN = 'IN',
    BETWEEN = 'BETWEEN',
    IS_NULL = 'IS_NULL',
    IS_NOT_NULL = 'IS_NOT_NULL',
}

export interface SystemHealthStatus {
    lastChecked: string; // ISO 8601
    overallStatus: ServiceStatus;
    componentStatuses?: { [component: string]: ServiceStatus };
    activeUsersCount?: number;
    openWorkbooksCount?: number;
    apiLatencyMs?: number;
    errorRatePercentage?: number;
    alerts?: SystemAlert[];
}

export enum ServiceStatus {
    OPERATIONAL = 'OPERATIONAL',
    DEGRADED = 'DEGRADED',
    OUTAGE = 'OUTAGE',
    MAINTENANCE = 'MAINTENANCE',
    UNKNOWN = 'UNKNOWN',
}

export interface SystemAlert {
    id: string;
    timestamp: string;
    severity: InsightSeverity;
    message: string;
    component?: string;
    details?: { [key: string]: any };
    acknowledged?: boolean;
    resolved?: boolean;
    alertRuleId?: string;
}