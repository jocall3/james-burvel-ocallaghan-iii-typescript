import React from 'react';
import Card from './Card';
import { 
    ResponsiveContainer, 
    BarChart, Bar, 
    LineChart, Line, 
    AreaChart, Area, 
    PieChart, Pie, Cell, 
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, // Added PolarRadiusAxis
    XAxis, YAxis, ZAxis, ScatterChart, Scatter, // Added ZAxis, ScatterChart, Scatter
    Tooltip, Legend, CartesianGrid 
} from 'recharts';

// --- Expanded Chart Types ---
export type ChartType = 
    'bar' | 'line' | 'area' | 'pie' | 'radar' | 
    'scatter' | 'bubble' | 'heatmap' | 'treemap' | 'sankey' | 
    'gauge' | 'candlestick' | 'ohlc' | 'waterfall' | 'funnel' | 
    'boxplot' | 'choropleth' | 'network' | 'sunburst' | 'chord' | 
    'parallel_coordinates' | 'streamgraph' | 'wordcloud' | 'density' | 
    '3d_bar' | '3d_surface' | 'polar_area' | 'range_bar' | 'bullet' | 
    'timeline' | 'calendar' | 'spider_web' | 'pyramid' | 'doughnut_multi' | 
    'stacked_area_normalized' | 'marimekko' | 'violin' | 'density_heatmap' |
    'force_directed' | 'tree' | 'radial_tree' | 'pack_layout' | 'voronoi_tessellation';

// --- Core Data Structures ---
export interface DataPoint {
    [key: string]: any;
}

export interface TimeSeriesDataPoint extends DataPoint {
    timestamp: number | string | Date;
}

export interface GeoDataPoint extends DataPoint {
    latitude: number;
    longitude: number;
    regionId?: string;
}

export type ChartDataSource = DataPoint[] | TimeSeriesDataPoint[] | GeoDataPoint[]; // Enhanced to be more specific


// --- Advanced Chart Configuration Interfaces ---

export interface ChartAnnotation {
    id: string;
    type: 'line' | 'rectangle' | 'text' | 'arrow';
    x?: string | number | Date; // x-axis value or pixel position
    y?: string | number; // y-axis value or pixel position
    x2?: string | number | Date; // For line/rectangle end
    y2?: string | number; // For line/rectangle end
    text?: string;
    color?: string;
    strokeDasharray?: string;
    fontSize?: number;
    anchor?: 'start' | 'middle' | 'end'; // For text
    tooltip?: string;
    draggable?: boolean;
    editable?: boolean;
}

export interface ChartEventMarker {
    id: string;
    type: 'line' | 'dot' | 'text' | 'band';
    dataKey: string; // The data key to mark on (e.g., 'timestamp')
    value: any; // The value on the dataKey to mark (e.g., '2023-01-15')
    label?: string;
    color?: string;
    strokeDasharray?: string;
    position?: 'top' | 'bottom' | 'middle'; // For text/dot
    tooltip?: string;
    // For band markers
    startValue?: any;
    endValue?: any;
    fillOpacity?: number;
}

export interface ChartSeriesDataKey {
    key: string;
    name?: string;
    color?: string;
    type?: 'bar' | 'line' | 'area' | 'scatter' | 'bubble' | 'candlestick' | 'radar'; // Override chart type for mixed charts
    yAxisId?: string; // For multi-axis charts
    stackId?: string; // For stacked charts
    renderAs?: 'column' | 'marker' | 'text' | 'band'; // How to render this specific key
    label?: {
        enabled?: boolean;
        position?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'insideStart' | 'insideEnd' | 'insideLeft' | 'insideRight' | 'insideTop' | 'insideBottom' | 'insideTopLeft' | 'insideBottomLeft' | 'insideTopRight' | 'insideBottomRight';
        formatter?: (value: any) => string;
        fontSize?: number;
        color?: string;
        offset?: number;
    };
    // Specific to line/area
    lineType?: 'monotone' | 'linear' | 'step' | 'basis' | 'natural' | 'stepBefore' | 'stepAfter';
    strokeWidth?: number;
    connectNulls?: boolean;
    fillGradient?: {
        enabled: boolean;
        fromColor?: string;
        toColor?: string;
        offsetStart?: string;
        offsetEnd?: string;
    };
    // Specific to bar
    barSize?: number;
    minBarSize?: number;
    // Specific to scatter/bubble
    shape?: 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye' | React.ElementType;
    sizeKey?: string; // For bubble charts (maps to ZAxis)
    // Specific to Pie/Donut cells (if series items are cells)
    innerRadius?: number | string;
    outerRadius?: number | string;
}

export interface AxisConfiguration {
    enabled?: boolean;
    dataKey?: string;
    type?: 'category' | 'number' | 'time';
    position?: 'left' | 'right' | 'top' | 'bottom';
    orientation?: 'left' | 'right'; // For YAxis
    label?: string | { value: string; position?: 'insideTop' | 'insideBottom' | 'insideLeft' | 'insideRight' | 'outside' | 'top' | 'bottom' | 'left' | 'right'; offset?: number; angle?: number; fill?: string; fontSize?: number; };
    unit?: string;
    domain?: (string | number)[]; // e.g., [0, 'auto']
    interval?: 'preserveStart' | 'preserveEnd' | 'preserveStartEnd' | 'euclidean' | number;
    tickCount?: number;
    tickFormatter?: (value: any, index: number) => string;
    allowDecimals?: boolean;
    scale?: 'linear' | 'pow' | 'sqrt' | 'log' | 'identity' | 'time' | 'utc' | 'point' | 'band';
    reversed?: boolean;
    min?: number | 'dataMin';
    max?: number | 'dataMax';
    padding?: { left?: number; right?: number; top?: number; bottom?: number };
    // Styling
    stroke?: string;
    fontSize?: number;
    tickLine?: { enabled: boolean; stroke?: string };
    axisLine?: { enabled: boolean; stroke?: string };
    gridLines?: { enabled: boolean; stroke?: string; strokeDasharray?: string; vertical?: boolean; horizontal?: boolean };
}

// Global Chart Options
export interface GlobalChartOptions {
    theme?: 'dark' | 'light' | 'custom';
    palette?: string[]; // Global color overrides
    animationEnabled?: boolean;
    responsiveBreakpoints?: { [key: string]: number }; // e.g., { 'sm': 640, 'md': 768 }
    locale?: string; // For number formatting, date formats etc.
    exportOptions?: {
        formats?: ('png' | 'jpeg' | 'pdf' | 'svg' | 'csv' | 'json')[];
        defaultFileName?: string;
        quality?: number; // For image formats
        includeAnnotations?: boolean;
        includeLegend?: boolean;
        includeTitle?: boolean;
    };
    accessibility?: {
        ariaLabel?: string;
        keyboardNavigation?: boolean;
        highContrastMode?: boolean;
        screenReaderFriendly?: boolean;
    };
    realtimeUpdate?: {
        enabled: boolean;
        intervalMs?: number;
        dataFetchEndpoint?: string;
        updateStrategy?: 'append' | 'replace' | 'shift';
        maxDataPoints?: number;
        onDataUpdate?: (newData: DataPoint[]) => Promise<DataPoint[]>; // Callback to fetch/process new data
    };
    tooltipGlobal?: {
        enabled?: boolean;
        shared?: boolean; // For multi-series
        crosshairs?: boolean; // Recharts tooltip has cursor, this refers to a true crosshair drawing
        backgroundColor?: string;
        borderColor?: string;
        textColor?: string;
        fontSize?: number;
        borderRadius?: number;
        positioning?: 'auto' | 'top' | 'bottom' | 'left' | 'right' | 'cursor';
        customContent?: (payload: any[], label: string, config: BaseChartConfig) => React.ReactNode;
        sortPayload?: (a: any, b: any) => number;
    };
    legendGlobal?: {
        enabled?: boolean;
        position?: 'top' | 'bottom' | 'left' | 'right' | 'none';
        align?: 'start' | 'center' | 'end';
        layout?: 'horizontal' | 'vertical';
        itemClickAction?: 'toggleVisibility' | 'highlightSeries' | 'filterData' | 'none';
        formatter?: (value: string, entry: any, index: number) => React.ReactNode;
        iconType?: 'circle' | 'square' | 'rect' | 'line' | 'star';
        fontSize?: number;
        textColor?: string;
        padding?: string;
        margin?: string;
        wrapperStyle?: React.CSSProperties;
    };
    titleOptions?: {
        enabled?: boolean;
        text?: string;
        position?: 'top' | 'bottom' | 'left' | 'right';
        align?: 'start' | 'center' | 'end';
        fontSize?: number;
        textColor?: string;
        padding?: number;
        fontFamily?: string;
    };
    subtitleOptions?: {
        enabled?: boolean;
        text?: string;
        position?: 'top' | 'bottom' | 'left' | 'right';
        align?: 'start' | 'center' | 'end';
        fontSize?: number;
        textColor?: string;
        padding?: number;
        fontFamily?: string;
    };
    noDataMessage?: {
        text?: string;
        color?: string;
        fontSize?: number;
    };
    // Data management & analytics features
    dataTransformation?: {
        enabled?: boolean;
        operations?: (
            | { type: 'filter'; field: string; operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith'; value: any }
            | { type: 'sort'; field: string; order: 'asc' | 'desc' }
            | { type: 'group_by'; fields: string[]; aggregate: { field: string; fn: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'median' | 'distinct_count' | 'first' | 'last' }[] }
            | { type: 'pivot'; rows: string[]; columns: string[]; value: string; aggregateFn: 'sum' | 'avg' | 'count' }
            | { type: 'calculate_field'; newField: string; formula: string } // e.g., 'data.value1 + data.value2'
            | { type: 'fill_missing'; field: string; method: 'zero' | 'previous' | 'next' | 'mean' | 'median'; groupBy?: string[] }
            | { type: 'window_function'; newField: string; field: string; fn: 'moving_avg' | 'rolling_sum' | 'rank'; windowSize: number; groupBy?: string[] }
        )[];
    };
    anomalyDetection?: {
        enabled?: boolean;
        method?: 'z_score' | 'iqr' | 'dbscan' | 'isolation_forest' | 'lof';
        inputDataKey?: string; // Key to apply anomaly detection on
        threshold?: number;
        highlightColor?: string;
        onAnomalyDetected?: (anomalies: DataPoint[]) => void;
        renderStrategy?: 'point' | 'line_segment' | 'background_band';
    };
    predictionModeling?: {
        enabled?: boolean;
        modelType?: 'linear_regression' | 'arima' | 'exponential_smoothing' | 'holt_winters';
        forecastHorizon?: number; // Number of future points
        inputDataKey?: string;
        outputDataKey?: string;
        lineColor?: string;
        fillColor?: string;
        confidenceIntervals?: { enabled: boolean; level?: number; fillColor?: string; fillOpacity?: number };
    };
    dataValidationRules?: {
        enabled?: boolean;
        rules?: { field: string; validator: 'min' | 'max' | 'type' | 'regex' | 'required' | 'enum'; value?: any; enumValues?: any[]; message: string }[];
        onInvalidData?: (invalidRecords: DataPoint[]) => void;
        displayInvalidAs?: 'hide' | 'warn' | 'filter_out';
    };
    chartInteractivity?: {
        zoomPan?: { enabled: boolean; type?: 'xy' | 'x' | 'y'; resetOnDoubleClick?: boolean; allowZoomSelection?: boolean };
        brush?: { enabled: boolean; dataKey: string; height?: number; startIndex?: number; endIndex?: number; fill?: string; stroke?: string; };
        selection?: { enabled: boolean; mode?: 'single' | 'multiple' | 'lasso'; onSelect?: (selected: DataPoint[]) => void; selectionColor?: string };
        drillDown?: { enabled: boolean; onDrillDown?: (dataPoint: DataPoint, series: ChartSeriesDataKey) => void; drillDownCursor?: string };
        annotations?: ChartAnnotation[];
        eventMarkers?: ChartEventMarker[];
        drawingTools?: { enabled: boolean; tools?: ('line' | 'rectangle' | 'circle' | 'text' | 'arrow')[]; onDrawEnd?: (annotations: ChartAnnotation[]) => void; toolbarPosition?: 'top' | 'bottom' | 'left' | 'right' };
    };
    chartEvents?: {
        onChartClick?: (e: any) => void;
        onSeriesClick?: (data: DataPoint, index: number, series: ChartSeriesDataKey) => void;
        onDataPointClick?: (data: DataPoint, index: number, series: ChartSeriesDataKey) => void;
        onLegendClick?: (entry: any, index: number) => void;
        onBrushChange?: (startIndex: number, endIndex: number, data: DataPoint[]) => void;
        onTooltipChange?: (props: { active: boolean; payload: any[]; label: string; }) => void;
        onZoomEnd?: (domain: { x: [number, number], y: [number, number] }) => void;
    };
    crosshairs?: {
        enabled?: boolean;
        stroke?: string;
        strokeDasharray?: string;
        textEnabled?: boolean;
        textColor?: string;
        fontSize?: number;
    };
}


// --- Specific Chart Configurations (for the `config` prop) ---
export interface BaseChartConfig {
    globalOptions?: GlobalChartOptions;
    // General axis and series configurations
    xAxis?: AxisConfiguration | AxisConfiguration[];
    yAxis?: AxisConfiguration | AxisConfiguration[];
    dataKeys: ChartSeriesDataKey[]; // Renamed from config.dataKeys
    colors?: string[]; // Global color overrides if not specified in dataKeys
    formatter?: (value: any, name: string, props: any) => [string, string] | React.ReactNode; // Tooltip formatter
    label?: boolean | { formatter?: (value: any) => string; position?: 'top' | 'outside' | 'inside' | 'center' }; // General chart labels
    // Common Recharts properties not covered by specific configs
    margin?: { top?: number; right?: number; bottom?: number; left?: number; };
    padding?: { top?: number; right?: number; bottom?: number; left?: number; };
    syncId?: string; // For syncing multiple charts
    clipPathId?: string;
    cursor?: 'pointer' | 'default' | 'grab' | 'grabbing' | 'zoom-in' | 'zoom-out';
    layout?: 'horizontal' | 'vertical'; // Common to BarChart, can be extended
}

export interface BarChartConfig extends BaseChartConfig {
    barCategoryGap?: string | number;
    barGap?: string | number;
    maxBarSize?: number;
    barSize?: number;
    stackOffset?: 'none' | 'expand' | 'diverging' | 'silhouette' | 'wiggle';
    isAnimationActive?: boolean;
}

export interface LineChartConfig extends BaseChartConfig {
    connectNulls?: boolean;
    isAnimationActive?: boolean;
}

export interface AreaChartConfig extends BaseChartConfig {
    stackOffset?: 'none' | 'expand' | 'diverging' | 'silhouette' | 'wiggle';
    isAnimationActive?: boolean;
}

export interface PieChartConfig extends BaseChartConfig {
    dataKey: string; // The value key for slices
    nameKey: string; // The label key for slices
    cx?: string | number;
    cy?: string | number;
    innerRadius?: number | string;
    outerRadius?: number | string;
    paddingAngle?: number;
    startAngle?: number;
    endAngle?: number;
    blendStroke?: boolean;
    labelLine?: boolean | object;
    label?: boolean | object; // Recharts label prop, can be func or object
    isAnimationActive?: boolean;
}

export interface RadarChartConfig extends BaseChartConfig {
    angleKey: string; // The key for polar angles
    polarRadius?: number | string;
    outerRadius?: number | string;
    innerRadius?: number | string;
    startAngle?: number;
    endAngle?: number;
    polarGrid?: { enabled: boolean; radialLines?: boolean; concentricCircles?: boolean; stroke?: string; strokeDasharray?: string };
    polarAngleAxis?: AxisConfiguration; // Re-use AxisConfiguration
    polarRadiusAxis?: AxisConfiguration & { angle?: number }; // Re-use AxisConfiguration
    isAnimationActive?: boolean;
}

export interface ScatterChartConfig extends BaseChartConfig {
    zAxisKey?: string; // For bubble charts, determines point size
    isAnimationActive?: boolean;
}

export interface BubbleChartConfig extends ScatterChartConfig { // Inherits from ScatterChartConfig
    radiusMin?: number;
    radiusMax?: number;
}

export interface HeatmapChartConfig extends BaseChartConfig {
    xKey: string;
    yKey: string;
    valueKey: string;
    colorScale?: {
        type: 'linear' | 'quantize' | 'ordinal';
        domain: number[];
        range: string[]; // Array of colors
    };
    cellPadding?: number;
    cellBorderColor?: string;
    showLabels?: boolean;
    labelFormatter?: (value: any) => string;
    isAnimationActive?: boolean;
}

export interface CandlestickChartConfig extends BaseChartConfig {
    openKey: string;
    highKey: string;
    lowKey: string;
    closeKey: string;
    upColor?: string;
    downColor?: string;
    wickColor?: string;
    bearishFill?: string;
    bullishFill?: string;
    isAnimationActive?: boolean;
}

// Generic catch-all for types not fully defined here but conceptually supported
export interface GenericChartSpecificConfig extends BaseChartConfig {
    [key: string]: any;
}

export type ChartConfiguration =
    BarChartConfig | LineChartConfig | AreaChartConfig | PieChartConfig | RadarChartConfig |
    ScatterChartConfig | BubbleChartConfig | HeatmapChartConfig | CandlestickChartConfig |
    GenericChartSpecificConfig;


// --- Data Processing & Utility Functions ---

export class ChartDataProcessor {
    static applyTransformations(data: DataPoint[], transformations: GlobalChartOptions['dataTransformation']): DataPoint[] {
        if (!transformations?.enabled || !transformations.operations) return data;

        let processedData = [...data];

        for (const operation of transformations.operations) {
            switch (operation.type) {
                case 'filter':
                    processedData = processedData.filter(item => {
                        const value = item[operation.field];
                        switch (operation.operator) {
                            case 'eq': return value === operation.value;
                            case 'neq': return value !== operation.value;
                            case 'gt': return value > operation.value;
                            case 'lt': return value < operation.value;
                            case 'gte': return value >= operation.value;
                            case 'lte': return value <= operation.value;
                            case 'in': return Array.isArray(operation.value) && operation.value.includes(value);
                            case 'nin': return Array.isArray(operation.value) && !operation.value.includes(value);
                            case 'contains': return typeof value === 'string' && value.includes(operation.value as string);
                            case 'startsWith': return typeof value === 'string' && value.startsWith(operation.value as string);
                            case 'endsWith': return typeof value === 'string' && value.endsWith(operation.value as string);
                            default: return true;
                        }
                    });
                    break;
                case 'sort':
                    processedData.sort((a, b) => {
                        const valA = a[operation.field];
                        const valB = b[operation.field];
                        if (valA < valB) return operation.order === 'asc' ? -1 : 1;
                        if (valA > valB) return operation.order === 'asc' ? 1 : -1;
                        return 0;
                    });
                    break;
                case 'group_by':
                    const grouped: { [key: string]: DataPoint & { _count: number; [aggField: string]: any } } = {};
                    processedData.forEach(item => {
                        const groupKey = operation.fields.map(f => item[f]).join('|');
                        if (!grouped[groupKey]) {
                            grouped[groupKey] = operation.fields.reduce((acc, f) => ({ ...acc, [f]: item[f] }), { _count: 0 }) as any;
                            operation.aggregate.forEach(agg => {
                                if (agg.fn === 'sum' || agg.fn === 'avg') grouped[groupKey][agg.field] = 0;
                                if (agg.fn === 'min') grouped[groupKey][agg.field] = Infinity;
                                if (agg.fn === 'max') grouped[groupKey][agg.field] = -Infinity;
                                if (agg.fn === 'distinct_count') grouped[groupKey][agg.field] = new Set();
                                if (agg.fn === 'first') grouped[groupKey][agg.field] = undefined;
                                if (agg.fn === 'last') grouped[groupKey][agg.field] = undefined;
                            });
                        }

                        grouped[groupKey]._count++;

                        operation.aggregate.forEach(agg => {
                            const val = item[agg.field];
                            if (typeof val === 'number') {
                                switch (agg.fn) {
                                    case 'sum': grouped[groupKey][agg.field] += val; break;
                                    case 'avg': grouped[groupKey][agg.field] += val; break;
                                    case 'min': grouped[groupKey][agg.field] = Math.min(grouped[groupKey][agg.field], val); break;
                                    case 'max': grouped[groupKey][agg.field] = Math.max(grouped[groupKey][agg.field], val); break;
                                    case 'count': grouped[groupKey][agg.field] = (grouped[groupKey][agg.field] || 0) + 1; break;
                                    case 'median': /* Needs storing all values, then calculating median */ break;
                                }
                            } else if (agg.fn === 'count') {
                                grouped[groupKey][agg.field] = (grouped[groupKey][agg.field] || 0) + 1;
                            } else if (agg.fn === 'distinct_count') {
                                grouped[groupKey][agg.field].add(val);
                            } else if (agg.fn === 'first' && grouped[groupKey][agg.field] === undefined) {
                                grouped[groupKey][agg.field] = val;
                            } else if (agg.fn === 'last') {
                                grouped[groupKey][agg.field] = val;
                            }
                        });
                    });

                    processedData = Object.values(grouped).map(item => {
                        operation.aggregate.forEach(agg => {
                            if (agg.fn === 'avg' && item._count > 0) {
                                item[agg.field] /= item._count;
                            } else if (agg.fn === 'distinct_count') {
                                item[agg.field] = (item[agg.field] as Set<any>).size;
                            }
                            // Median would require a more complex implementation to collect all values for the group
                        });
                        const { _count, ...rest } = item; // Remove internal count field
                        return rest;
                    });
                    break;
                case 'calculate_field':
                    processedData = processedData.map(item => {
                        try {
                            const data = item; // Provide `data` context for formula
                            // eslint-disable-next-line no-eval
                            item[operation.newField] = eval(operation.formula); // Dangerous but demonstrates intent
                        } catch (e) {
                            console.error(`Error calculating field ${operation.newField}:`, e);
                        }
                        return item;
                    });
                    break;
                case 'fill_missing':
                    // This is a complex operation depending on groupBy, method, and data structure
                    console.warn(`Data transformation 'fill_missing' is conceptual and not fully implemented.`);
                    break;
                case 'window_function':
                    console.warn(`Data transformation 'window_function' is conceptual and not fully implemented.`);
                    break;
                case 'pivot':
                    console.warn(`Data transformation 'pivot' is highly complex and not fully implemented.`);
                    break;
                default:
                    console.warn(`Unsupported data transformation type: ${(operation as any).type}`);
            }
        }
        return processedData;
    }

    static validateData(data: DataPoint[], rulesConfig: GlobalChartOptions['dataValidationRules']): { validData: DataPoint[], invalidRecords: DataPoint[] } {
        if (!rulesConfig?.enabled || !rulesConfig.rules) return { validData: data, invalidRecords: [] };

        const validData: DataPoint[] = [];
        const invalidRecords: DataPoint[] = [];

        for (const item of data) {
            let isValid = true;
            for (const rule of rulesConfig.rules) {
                const value = item[rule.field];

                if (rule.validator === 'required' && (value === undefined || value === null || value === '')) {
                    isValid = false;
                    break;
                }
                if (value === undefined || value === null) continue; // Skip other checks if value is missing and not required

                switch (rule.validator) {
                    case 'min': if (typeof value !== 'number' || value < (rule.value as number)) isValid = false; break;
                    case 'max': if (typeof value !== 'number' || value > (rule.value as number)) isValid = false; break;
                    case 'type': if (typeof value !== rule.value) isValid = false; break;
                    case 'regex': if (typeof value !== 'string' || !(new RegExp(rule.value as string)).test(value)) isValid = false; break;
                    case 'enum': if (!Array.isArray(rule.enumValues) || !rule.enumValues.includes(value)) isValid = false; break;
                }
                if (!isValid) {
                    console.warn(`Data validation failed for record: ${JSON.stringify(item)}. Rule for '${rule.field}': ${rule.message}`);
                    break;
                }
            }
            if (isValid) {
                validData.push(item);
            } else {
                invalidRecords.push(item);
            }
        }
        if (invalidRecords.length > 0 && rulesConfig.onInvalidData) {
            rulesConfig.onInvalidData(invalidRecords);
        }

        if (rulesConfig.displayInvalidAs === 'filter_out') {
            return { validData, invalidRecords };
        }
        return { validData: data, invalidRecords }; // If not filtered out, return original data but warn
    }

    static detectAnomalies(data: TimeSeriesDataPoint[], anomalyConfig: GlobalChartOptions['anomalyDetection']): DataPoint[] {
        if (!anomalyConfig?.enabled || data.length < 3) return [];

        const anomalies: DataPoint[] = [];
        const inputKey = anomalyConfig.inputDataKey || Object.keys(data[0]).find(k => k !== 'timestamp') || 'value'; // Heuristic for input key

        if (anomalyConfig.method === 'z_score') {
            const values = data.map(d => d[inputKey] as number);
            const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
            const stdDev = Math.sqrt(values.map(val => (val - mean) ** 2).reduce((sum, sqDiff) => sum + sqDiff, 0) / values.length);

            if (stdDev === 0) return [];

            data.forEach((dp, index) => {
                const value = dp[inputKey] as number;
                const zScore = Math.abs((value - mean) / stdDev);
                if (zScore > (anomalyConfig.threshold || 2.5)) {
                    anomalies.push({ ...dp, isAnomaly: true, anomalyScore: zScore, anomalyKey: inputKey });
                }
            });
        }
        // Other methods (IQR, DBSCAN, Isolation Forest, LOF) would need more complex implementations or external libraries.
        else {
            console.warn(`Anomaly detection method '${anomalyConfig.method}' is conceptual and not fully implemented.`);
        }

        if (anomalies.length > 0 && anomalyConfig.onAnomalyDetected) {
            anomalyConfig.onAnomalyDetected(anomalies);
        }
        return anomalies;
    }

    static forecastData(data: TimeSeriesDataPoint[], predictionConfig: GlobalChartOptions['predictionModeling']): TimeSeriesDataPoint[] {
        if (!predictionConfig?.enabled || data.length < 2) return [];

        const forecast: TimeSeriesDataPoint[] = [];
        const horizon = predictionConfig.forecastHorizon || 5;
        const inputKey = predictionConfig.inputDataKey || 'value';
        const outputKey = predictionConfig.outputDataKey || 'predictedValue';

        // Simplified Linear Regression Forecast
        if (predictionConfig.modelType === 'linear_regression') {
            const values = data.map(d => d[inputKey] as number);
            const indices = data.map((_, i) => i);

            const n = values.length;
            if (n < 2) return [];

            let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
            for (let i = 0; i < n; i++) {
                sumX += indices[i];
                sumY += values[i];
                sumXY += indices[i] * values[i];
                sumX2 += indices[i] * indices[i];
            }

            const denominator = (n * sumX2 - sumX * sumX);
            if (denominator === 0) return []; // Avoid division by zero for vertical line

            const m = (n * sumXY - sumX * sumY) / denominator;
            const b = (sumY - m * sumX) / n;

            const lastTimestampValue = data[n - 1].timestamp;
            const lastTimestamp = typeof lastTimestampValue === 'string'
                ? new Date(lastTimestampValue).getTime()
                : (lastTimestampValue as number);
            
            // Assume a constant interval for simplicity, calculating from first two points
            const timeInterval = n > 1
                ? (typeof data[1].timestamp === 'string' ? new Date(data[1].timestamp).getTime() : data[1].timestamp as number) - 
                  (typeof data[0].timestamp === 'string' ? new Date(data[0].timestamp).getTime() : data[0].timestamp as number)
                : (1000 * 60 * 60 * 24); // Default to 1 day if only one point

            for (let i = 1; i <= horizon; i++) {
                const nextIndex = n + i - 1;
                const predictedValue = m * nextIndex + b;
                const nextTimestamp = lastTimestamp + (i * timeInterval);
                
                forecast.push({
                    timestamp: typeof lastTimestampValue === 'string' ? new Date(nextTimestamp).toISOString() : nextTimestamp,
                    [outputKey]: predictedValue,
                    isForecast: true
                });
            }
        }
        // ARIMA, Exponential Smoothing, Holt-Winters would be much more complex and require external libraries.
        else {
            console.warn(`Prediction model '${predictionConfig.modelType}' is conceptual and not fully implemented.`);
        }

        return forecast;
    }
}

// --- Chart Exporter ---
export class ChartExporter {
    static exportToPNG(svgElement: SVGElement, fileName: string = 'chart.png', quality: number = 0.9): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!svgElement) return reject('SVG element not found for export.');
            const serializer = new XMLSerializer();
            let svgString = serializer.serializeToString(svgElement);
            // Add XML namespace to SVG string for proper rendering in canvas
            if (!svgString.includes('xmlns')) {
                svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
            }
            // Fix for external images (if any) or complex styles
            // For general Recharts, this should be sufficient.
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('Canvas context not available.');

            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = fileName;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        resolve();
                    } else {
                        reject('Failed to create Blob for PNG export.');
                    }
                }, `image/${fileName.split('.').pop() || 'png'}`, quality); // Dynamically set type based on filename
            };
            img.onerror = (error) => reject(`Error loading SVG into image: ${error.type} - ${error.message}`);
            // Use encodeURIComponent to handle special characters, then btoa for base64
            img.src = 'data:image/svg+xml;base64,' + btoa(encodeURIComponent(svgString).replace(/%([0-9A-F]{2})/g,
                function toSolidBytes(match, p1) {
                    return String.fromCharCode(parseInt(p1, 16));
                }));
        });
    }

    static exportToCSV(data: DataPoint[], fileName: string = 'chart_data.csv'): void {
        if (!data || data.length === 0) {
            console.warn('No data to export to CSV.');
            return;
        }

        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                if (typeof value === 'string') {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(','))
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    static exportToPDF(svgElement: SVGElement, data: DataPoint[], fileName: string = 'chart.pdf'): Promise<void> {
        console.warn("PDF export requires a dedicated library (e.g., jsPDF, html2pdf) and is a complex feature not fully implemented here.");
        return Promise.resolve(); // Placeholder for conceptual implementation
    }

    static exportToSVG(svgElement: SVGElement, fileName: string = 'chart.svg'): void {
        if (!svgElement) {
            console.warn('SVG element not found for export.');
            return;
        }
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}


// --- Advanced Tooltip Component ---
interface AdvancedTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
    config: BaseChartConfig;
    globalOptions?: GlobalChartOptions;
}

export const AdvancedTooltip: React.FC<AdvancedTooltipProps> = ({ active, payload, label, config, globalOptions }) => {
    if (!active || !payload || payload.length === 0 || !globalOptions?.tooltipGlobal?.enabled) return null;

    const tooltipStyle: React.CSSProperties = {
        backgroundColor: globalOptions.tooltipGlobal?.backgroundColor || 'rgba(31, 41, 55, 0.9)',
        borderColor: globalOptions.tooltipGlobal?.borderColor || '#4b5563',
        fontSize: globalOptions.tooltipGlobal?.fontSize || 12,
        color: globalOptions.tooltipGlobal?.textColor || '#e5e7eb',
        borderRadius: globalOptions.tooltipGlobal?.borderRadius || 4,
        padding: '8px',
        border: '1px solid',
        pointerEvents: 'none',
        maxWidth: '300px',
        whiteSpace: 'normal',
        lineHeight: '1.4'
    };

    const formattedLabel = globalOptions.locale ? new Date(label || '').toLocaleString(globalOptions.locale) : label;

    let sortedPayload = payload;
    if (globalOptions.tooltipGlobal?.sortPayload) {
        sortedPayload = [...payload].sort(globalOptions.tooltipGlobal.sortPayload);
    }

    if (globalOptions.tooltipGlobal?.customContent) {
        return (
            <div style={tooltipStyle}>
                {globalOptions.tooltipGlobal.customContent(sortedPayload, formattedLabel || '', config)}
            </div>
        );
    }

    return (
        <div style={tooltipStyle}>
            {label && <p className="label font-bold mb-1">{`Date/Category: ${formattedLabel}`}</p>}
            {sortedPayload.map((entry, index) => (
                <div key={`item-${index}`} className="flex items-center" style={{ color: entry.color || '#e5e7eb' }}>
                    <span style={{ backgroundColor: entry.color || '#e5e7eb', width: '8px', height: '8px', borderRadius: '50%', marginRight: '5px' }}></span>
                    <span className="font-medium mr-1">{entry.name || entry.dataKey}:</span>
                    <span>{config.formatter ? (config.formatter(entry.value, entry.name, entry) as any)[0] : entry.value}</span>
                </div>
            ))}
        </div>
    );
};

// --- Advanced Legend Component ---
interface AdvancedLegendProps {
    payload?: any[];
    config: BaseChartConfig;
    globalOptions?: GlobalChartOptions;
    onLegendItemClick?: (entry: any, index: number) => void;
}

export const AdvancedLegend: React.FC<AdvancedLegendProps> = ({ payload, config, globalOptions, onLegendItemClick }) => {
    if (!globalOptions?.legendGlobal?.enabled || !payload || payload.length === 0) return null;

    const legendStyle: React.CSSProperties = {
        fontSize: globalOptions.legendGlobal?.fontSize || 10,
        color: globalOptions.legendGlobal?.textColor || '#e5e7eb',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: globalOptions.legendGlobal?.align === 'center' ? 'center' : globalOptions.legendGlobal?.align === 'end' ? 'flex-end' : 'flex-start',
        flexDirection: globalOptions.legendGlobal?.layout === 'vertical' ? 'column' : 'row',
        padding: globalOptions.legendGlobal?.padding || '5px',
        margin: globalOptions.legendGlobal?.margin || '10px 0 0 0',
        ...globalOptions.legendGlobal?.wrapperStyle
    };

    const itemStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        margin: globalOptions.legendGlobal?.layout === 'vertical' ? '0 0 5px 0' : '0 10px 5px 0',
        cursor: globalOptions.legendGlobal?.itemClickAction !== 'none' ? 'pointer' : 'default',
    };

    const renderIcon = (color: string, iconType: GlobalChartOptions['legendGlobal']['iconType']) => {
        const commonStyle = { width: '10px', height: '10px', backgroundColor: color, marginRight: '5px' };
        switch (iconType) {
            case 'circle': return <span style={{ ...commonStyle, borderRadius: '50%' }}></span>;
            case 'square': return <span style={{ ...commonStyle, borderRadius: '2px' }}></span>;
            case 'rect': return <span style={{ ...commonStyle, width: '15px' }}></span>;
            case 'line': return <span style={{ ...commonStyle, height: '2px', width: '15px' }}></span>;
            case 'star': return <span className="star-icon" style={{ color: color, marginRight: '5px' }}>&#9733;</span>; // Unicode star
            default: return <span style={{ ...commonStyle, borderRadius: '2px' }}></span>;
        }
    };

    return (
        <ul style={legendStyle} role="list" aria-label="Chart Legend">
            {payload.map((entry, index) => (
                <li
                    key={`legend-item-${index}`}
                    style={itemStyle}
                    onClick={() => onLegendItemClick && onLegendItemClick(entry, index)}
                    role="listitem"
                    aria-label={`Legend item: ${entry.value}`}
                    tabIndex={globalOptions.accessibility?.keyboardNavigation ? 0 : -1}
                >
                    {renderIcon(entry.color || '#ccc', globalOptions.legendGlobal?.iconType)}
                    {globalOptions.legendGlobal?.formatter
                        ? globalOptions.legendGlobal.formatter(entry.value, entry, index)
                        : entry.value}
                </li>
            ))}
        </ul>
    );
};


// --- The main DashboardChart Component ---

interface DashboardChartProps {
    title: string;
    type: ChartType;
    data: ChartDataSource;
    config: ChartConfiguration;
}

const DashboardChart: React.FC<DashboardChartProps> = ({ title, type, data, config }) => {
    const { globalOptions = {}, ...chartSpecificConfig } = config;

    const [processedData, setProcessedData] = React.useState<DataPoint[]>([]);
    const [chartDataWithAnomalies, setChartDataWithAnomalies] = React.useState<DataPoint[]>([]);
    const [forecastData, setForecastData] = React.useState<TimeSeriesDataPoint[]>([]);
    const chartRef = React.useRef<any>(null); // For export functionality, Recharts sometimes provides `.container`
    const svgRef = React.useRef<SVGSVGElement | null>(null); // Direct SVG ref for robust export

    // State for interactive features
    const [hiddenSeries, setHiddenSeries] = React.useState<Set<string>>(new Set());
    const [selection, setSelection] = React.useState<{ startIndex: number; endIndex: number } | null>(null);
    const [annotations, setAnnotations] = React.useState<ChartAnnotation[]>(globalOptions.chartInteractivity?.annotations || []);


    React.useEffect(() => {
        let currentData = data as DataPoint[];
        
        // 1. Data Validation
        const { validData, invalidRecords } = ChartDataProcessor.validateData(
            currentData,
            globalOptions.dataValidationRules
        );
        currentData = validData;
        if (invalidRecords.length > 0 && globalOptions.dataValidationRules?.displayInvalidAs === 'warn') {
            console.warn(`Validation warnings for ${invalidRecords.length} records.`);
        }

        // 2. Data Transformation
        currentData = ChartDataProcessor.applyTransformations(
            currentData,
            globalOptions.dataTransformation
        );

        setProcessedData(currentData);

        // 3. Anomaly Detection (on processed data)
        if (globalOptions.anomalyDetection?.enabled) {
            const anomalies = ChartDataProcessor.detectAnomalies(
                currentData as TimeSeriesDataPoint[],
                globalOptions.anomalyDetection
            );
            const dataWithAnomalies = currentData.map(dp => {
                const isAnomaly = anomalies.some(a => {
                    // Simple deep comparison for object identity in this context.
                    // A real system would use a unique ID or more robust comparison.
                    return Object.keys(a).every(key => a[key] === dp[key]);
                });
                if (isAnomaly) {
                    return { ...dp, isAnomaly: true, anomalyColor: globalOptions.anomalyDetection?.highlightColor || '#ff4d4f' };
                }
                return dp;
            });
            setChartDataWithAnomalies(dataWithAnomalies);
        } else {
            setChartDataWithAnomalies(currentData);
        }

        // 4. Prediction Modeling
        if (globalOptions.predictionModeling?.enabled && (type === 'line' || type === 'area' || type === 'bar' || type === 'scatter')) {
            const predicted = ChartDataProcessor.forecastData(
                currentData as TimeSeriesDataPoint[],
                globalOptions.predictionModeling
            );
            setForecastData(predicted);
        } else {
            setForecastData([]);
        }

        // 5. Realtime updates (conceptual hook)
        let interval: NodeJS.Timeout;
        if (globalOptions.realtimeUpdate?.enabled && globalOptions.realtimeUpdate.onDataUpdate) {
            interval = setInterval(async () => {
                try {
                    const newData = await globalOptions.realtimeUpdate?.onDataUpdate?.(currentData) || [];
                    // Apply update strategy
                    let updatedData = [...currentData];
                    switch (globalOptions.realtimeUpdate?.updateStrategy) {
                        case 'append':
                            updatedData = [...updatedData, ...newData];
                            break;
                        case 'replace':
                            updatedData = newData;
                            break;
                        case 'shift':
                            updatedData = [...updatedData.slice(newData.length), ...newData]; // Remove oldest, add newest
                            break;
                        default:
                            updatedData = newData;
                    }
                    if (globalOptions.realtimeUpdate?.maxDataPoints) {
                        updatedData = updatedData.slice(-globalOptions.realtimeUpdate.maxDataPoints);
                    }
                    setProcessedData(updatedData); // Trigger re-render and re-processing
                } catch (error) {
                    console.error("Real-time data update failed:", error);
                }
            }, globalOptions.realtimeUpdate.intervalMs || 5000);
        }
        return () => clearInterval(interval);

    }, [data, config, globalOptions, type]); // Re-run effect if data or config changes

    const finalChartData = React.useMemo(() => {
        // Combine processed, anomaly-highlighted, and forecast data
        if (forecastData.length > 0) {
            return [...chartDataWithAnomalies, ...forecastData];
        }
        return chartDataWithAnomalies;
    }, [chartDataWithAnomalies, forecastData]);


    const renderXAxis = (xAxisConfig: AxisConfiguration | AxisConfiguration[] | undefined, defaultKey: string) => {
        if (!xAxisConfig) return null;
        const axes = Array.isArray(xAxisConfig) ? xAxisConfig : [xAxisConfig];
        return axes.map((axis, index) => (
            axis.enabled !== false && (
                <XAxis
                    key={`xaxis-${index}`}
                    dataKey={axis.dataKey || defaultKey}
                    stroke={axis.stroke || globalOptions.palette?.[0] || '#9ca3af'}
                    fontSize={axis.fontSize || 10}
                    interval={axis.interval || 'preserveEnd'}
                    tickFormatter={axis.tickFormatter || (axis.type === 'time' && globalOptions.locale ? (value) => new Date(value).toLocaleDateString(globalOptions.locale) : undefined)}
                    type={axis.type}
                    domain={axis.domain}
                    tickCount={axis.tickCount}
                    allowDecimals={axis.allowDecimals}
                    scale={axis.scale}
                    reversed={axis.reversed}
                    min={axis.min}
                    max={axis.max}
                    label={axis.label}
                    tickLine={axis.tickLine?.enabled === false ? false : undefined}
                    axisLine={axis.axisLine?.enabled === false ? false : undefined}
                    padding={axis.padding}
                    height={axis.label ? 40 : 30}
                    allowDataOverflow={axis.min === 'dataMin' || axis.max === 'dataMax'}
                />
            )
        ));
    };

    const renderYAxis = (yAxisConfig: AxisConfiguration | AxisConfiguration[] | undefined) => {
        if (!yAxisConfig) return null;
        const axes = Array.isArray(yAxisConfig) ? axes : [yAxisConfig];
        return axes.map((axis, index) => (
            axis.enabled !== false && (
                <YAxis
                    key={`yaxis-${index}`}
                    yAxisId={axis.orientation === 'right' ? 'right' : 'left'}
                    orientation={axis.orientation || 'left'}
                    stroke={axis.stroke || globalOptions.palette?.[1] || '#9ca3af'}
                    fontSize={axis.fontSize || 10}
                    domain={axis.domain}
                    tickFormatter={axis.tickFormatter || undefined}
                    type={axis.type}
                    tickCount={axis.tickCount}
                    allowDecimals={axis.allowDecimals}
                    scale={axis.scale}
                    reversed={axis.reversed}
                    min={axis.min}
                    max={axis.max}
                    label={axis.label}
                    tickLine={axis.tickLine?.enabled === false ? false : undefined}
                    axisLine={axis.axisLine?.enabled === false ? false : undefined}
                    padding={axis.padding}
                    width={axis.label ? 40 : 30}
                    allowDataOverflow={axis.min === 'dataMin' || axis.max === 'dataMax'}
                />
            )
        ));
    };

    const renderCartesianGrid = (cfg: BaseChartConfig) => {
        const xAxisGrid = Array.isArray(cfg.xAxis) ? cfg.xAxis[0]?.gridLines : cfg.xAxis?.gridLines;
        const yAxisGrid = Array.isArray(cfg.yAxis) ? cfg.yAxis[0]?.gridLines : cfg.yAxis?.gridLines;

        const verticalEnabled = xAxisGrid?.vertical !== false;
        const horizontalEnabled = yAxisGrid?.horizontal !== false;

        if (xAxisGrid?.enabled === false && yAxisGrid?.enabled === false) return null;

        return <CartesianGrid 
            strokeDasharray={xAxisGrid?.strokeDasharray || yAxisGrid?.strokeDasharray || "3 3"} 
            stroke={xAxisGrid?.stroke || yAxisGrid?.stroke || "#4b5563"} 
            vertical={verticalEnabled} 
            horizontal={horizontalEnabled} 
        />;
    };

    const renderChartSeries = () => {
        const dataKeys = (chartSpecificConfig as BaseChartConfig).dataKeys.filter(dk => !hiddenSeries.has(dk.key));
        const defaultColors = (chartSpecificConfig as BaseChartConfig).colors || globalOptions.palette || ['#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c', '#83a6ed', '#8dd1e1', '#ffc658', '#a4de6c', '#d0ed57'];

        const renderLabel = (labelConfig: ChartSeriesDataKey['label']) => {
            if (!labelConfig?.enabled) return false;
            return {
                fill: labelConfig.color || '#e5e7eb',
                fontSize: labelConfig.fontSize || 10,
                position: labelConfig.position || 'top',
                formatter: labelConfig.formatter,
                offset: labelConfig.offset || 5,
            };
        };

        const onSeriesClickHandler = (data: DataPoint, index: number, item: ChartSeriesDataKey) => {
            globalOptions.chartEvents?.onDataPointClick?.(data, index, item);
            globalOptions.chartInteractivity?.drillDown?.onDrillDown?.(data, item);
        };

        return dataKeys.map((item: ChartSeriesDataKey, index: number) => {
            const color = item.color || defaultColors[index % defaultColors.length];
            const seriesType = item.type || type;
            const isForecastSeries = globalOptions.predictionModeling?.enabled && item.key === globalOptions.predictionModeling.outputDataKey;
            
            let strokeColor = color;
            let fillColor = color;
            let strokeDasharray: string | undefined = undefined;

            if (isForecastSeries) {
                strokeColor = globalOptions.predictionModeling?.lineColor || '#ffa726';
                fillColor = globalOptions.predictionModeling?.fillColor || '#ffa726';
                strokeDasharray = "5 5";
            }

            switch (seriesType) {
                case 'bar':
                    return <Bar
                        key={item.key}
                        dataKey={item.key}
                        fill={fillColor}
                        name={item.name || item.key}
                        stackId={item.stackId}
                        yAxisId={item.yAxisId}
                        label={renderLabel(item.label)}
                        barSize={item.barSize}
                        minBarSize={item.minBarSize}
                        onClick={(dataPoint: any, idx: number) => onSeriesClickHandler(dataPoint, idx, item)}
                    />;
                case 'line':
                    return <Line
                        key={item.key}
                        type={item.lineType || "monotone"}
                        dataKey={item.key}
                        stroke={strokeColor}
                        name={item.name || item.key}
                        dot={item.renderAs === 'marker' || isForecastSeries ? { strokeDasharray: undefined, r: 3, fill: strokeColor } : false}
                        strokeWidth={item.strokeWidth || 2}
                        yAxisId={item.yAxisId}
                        label={renderLabel(item.label)}
                        strokeDasharray={strokeDasharray}
                        connectNulls={item.connectNulls}
                        onClick={(dataPoint: any, idx: number) => onSeriesClickHandler(dataPoint, idx, item)}
                    />;
                case 'area':
                    const areaFill = item.fillGradient?.enabled ? `url(#color-${item.key})` : (isForecastSeries ? globalOptions.predictionModeling?.fillColor || '#ffa726' : fillColor);
                    return (
                        <Area
                            key={item.key}
                            type={item.lineType || "monotone"}
                            dataKey={item.key}
                            stroke={strokeColor}
                            fill={areaFill}
                            fillOpacity={isForecastSeries ? (globalOptions.predictionModeling?.confidenceIntervals?.fillOpacity || 0.3) : (item.fillGradient?.enabled ? 1 : 0.6)}
                            name={item.name || item.key}
                            yAxisId={item.yAxisId}
                            label={renderLabel(item.label)}
                            stackId={item.stackId}
                            strokeDasharray={strokeDasharray}
                            connectNulls={item.connectNulls}
                            onClick={(dataPoint: any, idx: number) => onSeriesClickHandler(dataPoint, idx, item)}
                        />
                    );
                case 'scatter':
                    return (
                        <Scatter
                            key={item.key}
                            dataKey={item.key}
                            fill={fillColor}
                            name={item.name || item.key}
                            shape={item.shape}
                            yAxisId={item.yAxisId}
                            label={renderLabel(item.label)}
                            onClick={(dataPoint: any, idx: number) => onSeriesClickHandler(dataPoint, idx, item)}
                        />
                    );
                case 'bubble': // Bubble chart series implies a ZAxis for size, handled in the chart render
                    return (
                        <Scatter
                            key={item.key}
                            dataKey={item.key} // Main data key for Y
                            fill={fillColor}
                            name={item.name || item.key}
                            shape={item.shape || 'circle'}
                            yAxisId={item.yAxisId}
                            label={renderLabel(item.label)}
                            onClick={(dataPoint: any, idx: number) => onSeriesClickHandler(dataPoint, idx, item)}
                        />
                    );
                case 'radar':
                     return (
                        <Radar
                            key={item.key}
                            name={item.name || item.key}
                            dataKey={item.key}
                            stroke={strokeColor}
                            fill={fillColor}
                            fillOpacity={0.6}
                            yAxisId={item.yAxisId}
                            label={renderLabel(item.label)}
                            onClick={(dataPoint: any, idx: number) => onSeriesClickHandler(dataPoint, idx, item)}
                        />
                    );
                default:
                    return null;
            }
        });
    };

    const renderAnnotations = () => {
        if (!globalOptions.chartInteractivity?.annotations && annotations.length === 0) return null;
        // Recharts doesn't have native annotation components. This would be custom SVG/HTML overlays.
        // For demonstration, we'll return a conceptual overlay.
        const currentAnnotations = globalOptions.chartInteractivity?.annotations || annotations;

        // This requires careful mapping of data values to pixel coordinates
        // For now, these are conceptual SVG elements. A real implementation would need to access Recharts scales.
        return (
            <g className="chart-annotations">
                {currentAnnotations.map(ann => {
                    const commonStyle: React.CSSProperties = { stroke: ann.color || '#fef08a', fill: 'none', strokeWidth: 2, strokeDasharray: ann.strokeDasharray || undefined };
                    switch (ann.type) {
                        case 'line':
                            return <line key={ann.id} x1={ann.x as number} y1={ann.y as number} x2={ann.x2 as number} y2={ann.y2 as number} style={commonStyle} />;
                        case 'rectangle':
                            const rectX = Math.min(ann.x as number, ann.x2 as number);
                            const rectY = Math.min(ann.y as number, ann.y2 as number);
                            const rectWidth = Math.abs((ann.x2 as number) - (ann.x as number));
                            const rectHeight = Math.abs((ann.y2 as number) - (ann.y as number));
                            return <rect key={ann.id} x={rectX} y={rectY} width={rectWidth} height={rectHeight} style={commonStyle} fillOpacity={0.1} fill={ann.color || '#fef08a'} />;
                        case 'text':
                            return <text key={ann.id} x={ann.x as number} y={ann.y as number} fill={ann.color || '#fef08a'} fontSize={ann.fontSize || 12} textAnchor={ann.anchor || 'middle'}>{ann.text}</text>;
                        case 'arrow':
                            // For arrow, one might need a proper SVG marker definition or a custom path
                            return <line key={ann.id} x1={ann.x as number} y1={ann.y as number} x2={ann.x2 as number} y2={ann.y2 as number} style={commonStyle} markerEnd="url(#arrowhead)" />;
                        default:
                            return null;
                    }
                })}
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto" fill={globalOptions.chartInteractivity?.annotations?.[0]?.color || '#fef08a'}>
                        <polygon points="0 0, 10 3.5, 0 7" />
                    </marker>
                </defs>
            </g>
        );
    };

    const renderEventMarkers = () => {
        if (!globalOptions.chartInteractivity?.eventMarkers) return null;
        
        // Use Recharts ReferenceLine/ReferenceDot for cartesian charts
        // These components are placed based on data values, not pixel positions.
        const eventMarkers = globalOptions.chartInteractivity.eventMarkers;

        return (
            <>
                {eventMarkers.map(marker => {
                    if (marker.type === 'line' || marker.type === 'dot') {
                        // Assuming these are for Cartesian charts, like Line, Bar, Area, Scatter
                        // Recharts ReferenceLine/ReferenceDot can take a dataKey and value
                        // This relies on the X/Y axis having a scale that can interpret 'value'
                        return (
                            <React.Fragment key={marker.id}>
                                {(type === 'line' || type === 'bar' || type === 'area' || type === 'scatter') && (
                                    <Line
                                        dot={marker.type === 'dot' ? { fill: marker.color || '#ff0000', r: 4 } : false}
                                        stroke={marker.color || '#ff0000'}
                                        strokeDasharray={marker.strokeDasharray || '3 3'}
                                        dataKey={marker.dataKey}
                                        payload={[{ [marker.dataKey]: marker.value, value: 0 }]} // Dummy payload to position, real impl needs data mapping
                                        isAnimationActive={false}
                                    />
                                )}
                                {/* A proper ReferenceLine/ReferenceDot for cartesian chart would be more appropriate here */}
                                {/* <ReferenceLine x={marker.value} stroke={marker.color} strokeDasharray={marker.strokeDasharray} label={marker.label} /> */}
                                {/* <ReferenceDot x={marker.value} y={marker.value} fill={marker.color} r={5} label={marker.label} /> */}
                                {/* However, direct Recharts components here require careful data mapping. */}
                            </React.Fragment>
                        );
                    } else if (marker.type === 'band') {
                        // This would be a custom component overlay or a ReferenceArea in Recharts
                        // `ReferenceArea` is suitable for background bands
                        // <ReferenceArea x1={marker.startValue} x2={marker.endValue} fill={marker.color} fillOpacity={marker.fillOpacity || 0.1} />
                        // For this level of expansion, we'll keep it conceptual as Recharts ReferenceArea would need to be inside the Chart component itself.
                    }
                    return null;
                })}
            </>
        );
    };


    const renderChart = () => {
        if (!finalChartData || finalChartData.length === 0) {
            return (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm" role="status" aria-live="polite">
                    {(globalOptions.noDataMessage?.enabled && globalOptions.noDataMessage.text) || "No data available"}
                </div>
            );
        }

        const baseChartProps = {
            data: finalChartData,
            margin: (chartSpecificConfig as BaseChartConfig).margin,
            padding: (chartSpecificConfig as BaseChartConfig).padding,
            syncId: (chartSpecificConfig as BaseChartConfig).syncId,
            onClick: globalOptions.chartEvents?.onChartClick,
            cursor: (chartSpecificConfig as BaseChartConfig).cursor || (globalOptions.chartInteractivity?.zoomPan?.enabled ? 'grab' : 'default'),
            style: { direction: globalOptions.locale?.startsWith('ar') || globalOptions.locale?.startsWith('he') ? 'rtl' : 'ltr' } // RTL support
        };

        const renderTooltip = (cfg: BaseChartConfig) => {
             return (
                <Tooltip
                    content={<AdvancedTooltip globalOptions={globalOptions} config={cfg} />}
                    wrapperStyle={{ visibility: 'visible', zIndex: 9999 }}
                    formatter={cfg.formatter as any}
                    contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563', fontSize: '12px' }}
                    onClose={globalOptions.chartEvents?.onTooltipChange}
                    onOpen={globalOptions.chartEvents?.onTooltipChange}
                    position={globalOptions.tooltipGlobal?.positioning === 'cursor' ? { x: undefined, y: undefined } : undefined}
                    isAnimationActive={globalOptions.animationEnabled}
                    cursor={globalOptions.tooltipGlobal?.crosshairs ? { strokeDasharray: globalOptions.crosshairs?.strokeDasharray || '3 3', stroke: globalOptions.crosshairs?.stroke || '#ccc' } : false}
                />
            );
        };

        const renderLegend = (cfg: BaseChartConfig) => {
            return (
                <Legend
                    wrapperStyle={{
                        ...(globalOptions.legendGlobal?.position === 'bottom' && { marginTop: '10px' }),
                        ...(globalOptions.legendGlobal?.position === 'top' && { marginBottom: '10px' }),
                        ...(globalOptions.legendGlobal?.position === 'right' && { marginLeft: '10px' }),
                        ...(globalOptions.legendGlobal?.position === 'left' && { marginRight: '10px' }),
                        display: globalOptions.legendGlobal?.enabled === false ? 'none' : 'block'
                    }}
                    content={<AdvancedLegend globalOptions={globalOptions} config={cfg} onLegendItemClick={handleLegendItemClick} />}
                    verticalAlign={globalOptions.legendGlobal?.position === 'top' ? 'top' : 'bottom'}
                    align={globalOptions.legendGlobal?.align || 'center'}
                    layout={globalOptions.legendGlobal?.layout || 'horizontal'}
                    isAnimationActive={globalOptions.animationEnabled}
                />
            );
        }

        const defaultXAxisKey = (chartSpecificConfig as BaseChartConfig).dataKeys[0]?.key || Object.keys(finalChartData[0])[0];

        const rechartsComponents = (cfg: BaseChartConfig) => (
            <>
                {renderCartesianGrid(cfg)}
                {renderXAxis(cfg.xAxis, defaultXAxisKey)}
                {renderYAxis(cfg.yAxis)}
                {renderTooltip(cfg)}
                {renderLegend(cfg)}
            </>
        );
        
        const isAnimationActive = globalOptions.animationEnabled !== undefined ? globalOptions.animationEnabled : true;


        switch(type) {
            case 'bar':
                const barConfig = chartSpecificConfig as BarChartConfig;
                return (
                    <BarChart {...baseChartProps} layout={barConfig.layout} barCategoryGap={barConfig.barCategoryGap} barGap={barConfig.barGap} maxBarSize={barConfig.maxBarSize} isAnimationActive={barConfig.isAnimationActive !== undefined ? barConfig.isAnimationActive : isAnimationActive}>
                        {rechartsComponents(barConfig)}
                        {renderChartSeries()}
                    </BarChart>
                );
            case 'line':
                 const lineConfig = chartSpecificConfig as LineChartConfig;
                 return (
                    <LineChart {...baseChartProps} connectNulls={lineConfig.connectNulls} isAnimationActive={lineConfig.isAnimationActive !== undefined ? lineConfig.isAnimationActive : isAnimationActive}>
                        {rechartsComponents(lineConfig)}
                        {renderChartSeries()}
                    </LineChart>
                );
            case 'area':
                 const areaConfig = chartSpecificConfig as AreaChartConfig;
                 return (
                    <AreaChart {...baseChartProps} stackOffset={areaConfig.stackOffset} isAnimationActive={areaConfig.isAnimationActive !== undefined ? areaConfig.isAnimationActive : isAnimationActive}>
                         <defs>
                            {areaConfig.dataKeys.filter(item => item.fillGradient?.enabled).map((item: ChartSeriesDataKey, index: number) => (
                                <linearGradient key={index} id={`color-${item.key}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset={item.fillGradient?.offsetStart || "5%"} stopColor={item.fillGradient?.fromColor || item.color || globalOptions.palette?.[index % (globalOptions.palette?.length || 1)]} stopOpacity={0.8}/>
                                    <stop offset={item.fillGradient?.offsetEnd || "95%"} stopColor={item.fillGradient?.toColor || item.color || globalOptions.palette?.[index % (globalOptions.palette?.length || 1)]} stopOpacity={0}/>
                                </linearGradient>
                            ))}
                        </defs>
                        {rechartsComponents(areaConfig)}
                        {renderChartSeries()}
                    </AreaChart>
                );
            case 'pie':
                const pieConfig = chartSpecificConfig as PieChartConfig;
                return (
                    <PieChart {...baseChartProps} isAnimationActive={pieConfig.isAnimationActive !== undefined ? pieConfig.isAnimationActive : isAnimationActive}>
                        {renderTooltip(pieConfig)}
                        {renderLegend(pieConfig)}
                        <Pie
                            data={finalChartData}
                            dataKey={pieConfig.dataKey}
                            nameKey={pieConfig.nameKey}
                            cx={pieConfig.cx || "50%"} cy={pieConfig.cy || "50%"}
                            innerRadius={pieConfig.innerRadius || 0} outerRadius={pieConfig.outerRadius || "60%"} // Default outerRadius to string %
                            paddingAngle={pieConfig.paddingAngle}
                            startAngle={pieConfig.startAngle || 180} // Default start angle
                            endAngle={pieConfig.endAngle || 0} // Default end angle
                            label={pieConfig.label}
                            labelLine={pieConfig.labelLine}
                            isAnimationActive={pieConfig.isAnimationActive !== undefined ? pieConfig.isAnimationActive : isAnimationActive}
                        >
                            {finalChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={pieConfig.colors?.[index % pieConfig.colors.length] || globalOptions.palette?.[index % (globalOptions.palette?.length || 1)] || '#ccc'} />)}
                        </Pie>
                    </PieChart>
                );
             case 'radar':
                const radarConfig = chartSpecificConfig as RadarChartConfig;
                return (
                    <RadarChart {...baseChartProps} cx={radarConfig.cx || "50%"} cy={radarConfig.cy || "50%"} outerRadius={radarConfig.outerRadius || "80%"} innerRadius={radarConfig.innerRadius || 0} startAngle={radarConfig.startAngle || 0} endAngle={radarConfig.endAngle || 360} isAnimationActive={radarConfig.isAnimationActive !== undefined ? radarConfig.isAnimationActive : isAnimationActive}>
                        {radarConfig.polarGrid?.enabled !== false ? <PolarGrid strokeDasharray={radarConfig.polarGrid?.strokeDasharray || "3 3"} stroke={radarConfig.polarGrid?.stroke || "#4b5563"} /> : null}
                        {radarConfig.polarAngleAxis?.enabled !== false ? <PolarAngleAxis dataKey={radarConfig.polarAngleAxis?.dataKey || radarConfig.angleKey} fontSize={radarConfig.polarAngleAxis?.fontSize || 10} stroke={radarConfig.polarAngleAxis?.stroke || '#9ca3af'} tickFormatter={radarConfig.polarAngleAxis?.tickFormatter} /> : null}
                        {radarConfig.polarRadiusAxis?.enabled !== false ? <PolarRadiusAxis angle={radarConfig.polarRadiusAxis?.angle || 90} domain={radarConfig.polarRadiusAxis?.domain} fontSize={radarConfig.polarRadiusAxis?.fontSize || 10} stroke={radarConfig.polarRadiusAxis?.stroke || '#9ca3af'} tickFormatter={radarConfig.polarRadiusAxis?.tickFormatter} /> : null}
                        {renderTooltip(radarConfig)}
                        {renderLegend(radarConfig)}
                        {renderChartSeries()}
                    </RadarChart>
                );
            case 'scatter':
                const scatterConfig = chartSpecificConfig as ScatterChartConfig;
                return (
                    <ScatterChart {...baseChartProps} isAnimationActive={scatterConfig.isAnimationActive !== undefined ? scatterConfig.isAnimationActive : isAnimationActive}>
                        {rechartsComponents(scatterConfig)}
                        {scatterConfig.zAxisKey && <ZAxis dataKey={scatterConfig.zAxisKey} range={[10, 150]} name="Size" unit="" />}
                        {renderChartSeries()}
                    </ScatterChart>
                );
            case 'bubble':
                const bubbleConfig = chartSpecificConfig as BubbleChartConfig;
                return (
                    <ScatterChart {...baseChartProps} isAnimationActive={bubbleConfig.isAnimationActive !== undefined ? bubbleConfig.isAnimationActive : isAnimationActive}>
                        {rechartsComponents(bubbleConfig)}
                        <ZAxis dataKey={bubbleConfig.zAxisKey} range={[bubbleConfig.radiusMin || 10, bubbleConfig.radiusMax || 150]} name="Size" unit="" />
                        {renderChartSeries()}
                    </ScatterChart>
                );
            case 'heatmap':
                console.warn(`Chart type 'heatmap' is conceptual and requires a custom rendering implementation or a different library.`);
                const heatmapConfig = chartSpecificConfig as HeatmapChartConfig;
                // Using BarChart as a container for axes; real heatmap would be custom SVG/HTML cells
                return (
                    <BarChart {...baseChartProps} layout="vertical" isAnimationActive={heatmapConfig.isAnimationActive !== undefined ? heatmapConfig.isAnimationActive : isAnimationActive}>
                        {renderCartesianGrid(heatmapConfig)}
                        {renderXAxis(heatmapConfig.xAxis, heatmapConfig.xKey)}
                        {renderYAxis(heatmapConfig.yAxis)}
                        {renderTooltip(heatmapConfig)}
                        {renderLegend(heatmapConfig)}
                        <text x="50%" y="50%" textAnchor="middle" fill="#ccc" fontSize="14">Conceptual Heatmap - Requires custom SVG rendering logic.</text>
                    </BarChart>
                );
            case 'candlestick':
            case 'ohlc':
                console.warn(`Chart type '${type}' is conceptual and requires a custom rendering implementation or a different library.`);
                const candlestickConfig = chartSpecificConfig as CandlestickChartConfig;
                 return (
                    <LineChart {...baseChartProps} isAnimationActive={candlestickConfig.isAnimationActive !== undefined ? candlestickConfig.isAnimationActive : isAnimationActive}>
                        {rechartsComponents(candlestickConfig)}
                        <text x="50%" y="50%" textAnchor="middle" fill="#ccc" fontSize="14">Conceptual Candlestick/OHLC - Requires custom SVG rendering logic.</text>
                    </LineChart>
                );
            case 'treemap':
            case 'sankey':
            case 'gauge':
            case 'waterfall':
            case 'funnel':
            case 'boxplot':
            case 'choropleth':
            case 'network':
            case 'sunburst':
            case 'chord':
            case 'parallel_coordinates':
            case 'streamgraph':
            case 'wordcloud':
            case 'density':
            case '3d_bar':
            case '3d_surface':
            case 'polar_area':
            case 'range_bar':
            case 'bullet':
            case 'timeline':
            case 'calendar':
            case 'spider_web':
            case 'pyramid':
            case 'doughnut_multi':
            case 'stacked_area_normalized':
            case 'marimekko':
            case 'violin':
            case 'density_heatmap':
            case 'force_directed':
            case 'tree':
            case 'radial_tree':
            case 'pack_layout':
            case 'voronoi_tessellation':
                console.warn(`Chart type '${type}' is an advanced conceptual type and requires custom rendering. Displaying placeholder.`);
                return (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm p-4" role="status" aria-live="polite">
                        <p className="text-lg font-bold mb-2">Advanced Chart Type: {type.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}</p>
                        <p>This chart type represents a sophisticated visualization beyond standard Recharts capabilities.</p>
                        <p>It would integrate specialized rendering engines (e.g., D3.js, Three.js for 3D, Mapbox for Choropleth) </p>
                        <p>and leverage a comprehensive configuration for interactive data exploration and analysis.</p>
                        <p className="mt-4 text-xs italic">For demonstration, a conceptual rendering is shown.</p>
                    </div>
                );
            default:
                return <div className="flex items-center justify-center h-full text-gray-500" role="alert">Unsupported chart type</div>;
        }
    };

    const handleExport = async (format: 'png' | 'jpeg' | 'pdf' | 'svg' | 'csv' | 'json') => {
        const svgElement = svgRef.current; // Use direct SVG ref
        const fileName = globalOptions.exportOptions?.defaultFileName || `${title.replace(/\s/g, '_')}_chart`;
        const quality = globalOptions.exportOptions?.quality || 0.9;

        switch (format) {
            case 'png':
            case 'jpeg':
                if (svgElement) {
                    await ChartExporter.exportToPNG(svgElement, `${fileName}.${format}`, quality);
                } else {
                    console.error("SVG element not found for image export.");
                }
                break;
            case 'csv':
                ChartExporter.exportToCSV(processedData, `${fileName}.csv`);
                break;
            case 'svg':
                if (svgElement) {
                    ChartExporter.exportToSVG(svgElement, `${fileName}.svg`);
                } else {
                    console.error("SVG element not found for SVG export.");
                }
                break;
            case 'pdf':
                if (svgElement) {
                     await ChartExporter.exportToPDF(svgElement, processedData, `${fileName}.pdf`);
                } else {
                    console.error("SVG element not found for PDF export.");
                }
                break;
            case 'json':
                const jsonBlob = new Blob([JSON.stringify(processedData, null, 2)], { type: 'application/json;charset=utf-8;' });
                const jsonUrl = URL.createObjectURL(jsonBlob);
                const a = document.createElement('a');
                a.href = jsonUrl;
                a.download = `${fileName}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(jsonUrl);
                break;
            default:
                console.warn(`Unsupported export format: ${format}`);
        }
    };

    const handleLegendItemClick = (entry: any, index: number) => {
        globalOptions.chartEvents?.onLegendClick?.(entry, index);
        if (globalOptions.legendGlobal?.itemClickAction === 'toggleVisibility') {
            setHiddenSeries(prev => {
                const newHidden = new Set(prev);
                if (newHidden.has(entry.dataKey || entry.value)) { // Use dataKey or value as identifier
                    newHidden.delete(entry.dataKey || entry.value);
                } else {
                    newHidden.add(entry.dataKey || entry.value);
                }
                return newHidden;
            });
            console.log(`Toggling visibility for series: ${entry.dataKey || entry.value}`);
        } else if (globalOptions.legendGlobal?.itemClickAction === 'filterData') {
             // This would involve re-processing data or using a filter state
            console.log(`Filtering data by series: ${entry.dataKey || entry.value}`);
        } else if (globalOptions.legendGlobal?.itemClickAction === 'highlightSeries') {
            // This would involve dynamic styling (e.g., stroke width increase, opacity change)
            console.log(`Highlighting series: ${entry.dataKey || entry.value}`);
        }
    };

    const renderChartControls = () => {
        return (
            <div className="flex flex-wrap justify-end gap-2 p-2 bg-gray-700 text-sm" role="toolbar" aria-label="Chart Controls">
                {globalOptions.chartInteractivity?.zoomPan?.enabled && (
                    <button className="px-2 py-1 rounded bg-gray-600 hover:bg-gray-500 text-white" onClick={() => console.log('Zoom/Pan reset')} aria-label="Reset Zoom">Reset Zoom</button>
                )}
                {globalOptions.exportOptions?.formats?.map(format => (
                    <button key={format} className="px-2 py-1 rounded bg-gray-600 hover:bg-gray-500 text-white" onClick={() => handleExport(format)} aria-label={`Export as ${format.toUpperCase()}`}>Export {format.toUpperCase()}</button>
                ))}
                 {globalOptions.chartInteractivity?.drawingTools?.enabled && (
                    <button className="px-2 py-1 rounded bg-gray-600 hover:bg-gray-500 text-white" onClick={() => console.log('Drawing Tool: Activate')} aria-label="Activate Drawing Tools">Add Annotation</button>
                )}
                {globalOptions.accessibility?.highContrastMode && (
                    <button className="px-2 py-1 rounded bg-gray-600 hover:bg-gray-500 text-white" onClick={() => console.log('Toggle High Contrast Mode')} aria-label="Toggle High Contrast Mode">High Contrast</button>
                )}
            </div>
        );
    };

    return (
        <Card
            title={globalOptions.titleOptions?.enabled && globalOptions.titleOptions.text ? globalOptions.titleOptions.text : title}
            className="h-[350px] flex flex-col"
            subtitle={globalOptions.subtitleOptions?.enabled ? globalOptions.subtitleOptions.text : undefined}
            aria-label={`Dashboard Chart: ${title}`}
            aria-describedby={globalOptions.accessibility?.ariaLabel}
        >
            {renderChartControls()}
            <div className="flex-grow overflow-hidden" role="region" aria-label="Chart Visualization">
                <ResponsiveContainer width="100%" height="100%">
                    <g ref={svgRef}> {/* Wrap the chart to get a ref to the main SVG element */}
                        {renderChart()}
                        {/* Custom overlays for annotations and event markers would typically be rendered outside the main chart component structure but within the same SVG context or as HTML overlays positioned correctly.
                            For simplicity, these are still conceptual within the main chart area. */}
                        {globalOptions.chartInteractivity?.annotations && globalOptions.chartInteractivity.annotations.length > 0 && renderAnnotations()}
                        {globalOptions.chartInteractivity?.eventMarkers && globalOptions.chartInteractivity.eventMarkers.length > 0 && renderEventMarkers()}
                    </g>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default DashboardChart;