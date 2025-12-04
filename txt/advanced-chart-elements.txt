import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
    ReferenceLine,
    ReferenceDot,
    ReferenceArea,
    XAxis,
    YAxis
} from 'recharts'; // Potentially use Recharts components if data-bound
import {
    ChartAnnotation,
    ChartEventMarker,
    GlobalChartOptions,
    BaseChartConfig,
    DataPoint,
    ChartSeriesDataKey
} from '../DashboardChart'; // Assuming relative import path is correct
import Card from '../Card'; // Assuming Card is a shared component

// --- Utility Functions for Coordinate Transformation ---
// These functions are conceptual. In a real-world scenario, you would need access
// to Recharts' internal scale functions (e.g., from an exposed ChartState or a custom HOC).
// For this exercise, we simulate them by taking chart dimensions and axis domains.

interface ChartCoordinateSystem {
    chartX: number; // Top-left X of the actual plotting area (after margins)
    chartY: number; // Top-left Y of the actual plotting area (after margins)
    chartWidth: number; // Width of the plotting area
    chartHeight: number; // Height of the plotting area
    xDomain: (string | number | Date)[]; // e.g., ['2023-01-01', '2023-01-31'] or [0, 100]
    yDomain: (string | number)[];   // e.g., [0, 1000]
    xAxisType: 'category' | 'number' | 'time';
    yAxisType: 'category' | 'number' | 'time';
}

/**
 * Converts a data value to a pixel coordinate on the X-axis.
 * This is a highly simplified mock. A real implementation would use D3 scales.
 */
const dataToPixelX = (
    value: any,
    coords: ChartCoordinateSystem,
    data: DataPoint[], // Needed for 'category' type to find index
    dataKey?: string // Needed for 'category' type
): number | undefined => {
    if (!coords || !coords.chartWidth || !coords.xDomain || coords.xDomain.length < 2) return undefined;

    const [minDomain, maxDomain] = coords.xDomain.map(d => coords.xAxisType === 'time' ? new Date(d).getTime() : d) as [number, number];

    if (coords.xAxisType === 'number' || coords.xAxisType === 'time') {
        const val = coords.xAxisType === 'time' ? new Date(value).getTime() : value;
        return coords.chartX + coords.chartWidth * ((val - minDomain) / (maxDomain - minDomain));
    } else if (coords.xAxisType === 'category' && dataKey) {
        // For category, assume equal spacing
        const categories = Array.from(new Set(data.map(d => d[dataKey])));
        const index = categories.indexOf(value);
        if (index === -1) return undefined;
        const step = coords.chartWidth / categories.length;
        // Position at the center of the category band
        return coords.chartX + index * step + step / 2;
    }
    return undefined;
};

/**
 * Converts a data value to a pixel coordinate on the Y-axis.
 * This is a highly simplified mock. A real implementation would use D3 scales.
 */
const dataToPixelY = (
    value: any,
    coords: ChartCoordinateSystem,
    data: DataPoint[], // Needed for 'category' type to find index
    dataKey?: string // Needed for 'category' type
): number | undefined => {
    if (!coords || !coords.chartHeight || !coords.yDomain || coords.yDomain.length < 2) return undefined;

    const [minDomain, maxDomain] = coords.yDomain as [number, number]; // Y-axis usually numeric

    if (coords.yAxisType === 'number' || coords.yAxisType === 'time') { // Y-axis time is rare but possible
        const val = coords.yAxisType === 'time' ? new Date(value).getTime() : value;
        // Invert Y-axis for SVG (0 at top)
        return coords.chartY + coords.chartHeight - (coords.chartHeight * ((val - minDomain) / (maxDomain - minDomain)));
    } else if (coords.yAxisType === 'category' && dataKey) {
        const categories = Array.from(new Set(data.map(d => d[dataKey])));
        const index = categories.indexOf(value);
        if (index === -1) return undefined;
        const step = coords.chartHeight / categories.length;
        // Invert Y-axis, position at center of category band
        return coords.chartY + coords.chartHeight - (index * step + step / 2);
    }
    return undefined;
};

// --- Interfaces for internal state of drawing hook ---
interface CurrentDrawingState {
    type: ChartAnnotation['type'];
    points: { x: number; y: number; dataX?: any; dataY?: any }[];
    text?: string;
}

// --- useChartDrawing Hook ---
interface UseChartDrawingProps {
    onDrawEnd?: (annotation: ChartAnnotation) => void;
    currentAnnotations?: ChartAnnotation[];
    chartCoords: ChartCoordinateSystem | null; // For data-to-pixel conversion
    chartData: DataPoint[]; // For category axis mapping
}

interface UseChartDrawingResult {
    drawingMode: ChartAnnotation['type'] | 'none';
    setDrawingMode: (mode: ChartAnnotation['type'] | 'none') => void;
    currentDrawing: CurrentDrawingState | null;
    handleOverlayMouseDown: (e: React.MouseEvent<SVGGElement>) => void;
    handleOverlayMouseMove: (e: React.MouseEvent<SVGGElement>) => void;
    handleOverlayMouseUp: (e: React.MouseEvent<SVGGElement>) => void;
    handleOverlayMouseLeave: () => void;
    clearDrawing: () => void;
}

export const useChartDrawing = ({ onDrawEnd, chartCoords, chartData }: UseChartDrawingProps): UseChartDrawingResult => {
    const [drawingMode, setDrawingMode] = useState<ChartAnnotation['type'] | 'none'>('none');
    const [currentDrawing, setCurrentDrawing] = useState<CurrentDrawingState | null>(null);
    const isDrawingRef = useRef(false);
    const annotationCounter = useRef(0); // Simple ID generation

    const getMouseSVGCoordinates = useCallback((e: React.MouseEvent<SVGGElement>) => {
        const svg = e.currentTarget;
        const point = svg.ownerSVGElement?.createSVGPoint();
        if (point) {
            point.x = e.clientX;
            point.y = e.clientY;
            const screenToSVGMatrix = svg.ownerSVGElement?.getScreenCTM()?.inverse();
            if (screenToSVGMatrix) {
                const svgPoint = point.matrixTransform(screenToSVGMatrix);
                return { x: svgPoint.x, y: svgPoint.y };
            }
        }
        return { x: e.clientX, y: e.clientY }; // Fallback to client coords if SVG transform fails
    }, []);

    const handleOverlayMouseDown = useCallback((e: React.MouseEvent<SVGGElement>) => {
        if (drawingMode === 'none' || !chartCoords) return;

        isDrawingRef.current = true;
        const { x, y } = getMouseSVGCoordinates(e);

        setCurrentDrawing({
            type: drawingMode,
            points: [{ x, y }],
        });
    }, [drawingMode, getMouseSVGCoordinates, chartCoords]);

    const handleOverlayMouseMove = useCallback((e: React.MouseEvent<SVGGElement>) => {
        if (!isDrawingRef.current || !currentDrawing || !chartCoords) return;

        const { x, y } = getMouseSVGCoordinates(e);
        setCurrentDrawing(prev => {
            if (!prev) return null;
            const newPoints = [...prev.points.slice(0, prev.points.length - 1), { x, y }];
            return { ...prev, points: newPoints };
        });
    }, [currentDrawing, getMouseSVGCoordinates, chartCoords]);

    const handleOverlayMouseUp = useCallback((e: React.MouseEvent<SVGGElement>) => {
        if (!isDrawingRef.current || !currentDrawing || !chartCoords) return;

        isDrawingRef.current = false;
        const { x, y } = getMouseSVGCoordinates(e);

        let finalAnnotation: ChartAnnotation | null = null;

        const currentPoints = [...currentDrawing.points.slice(0, currentDrawing.points.length - 1), { x, y }];

        // Convert pixel coordinates back to data coordinates for storage
        // This is highly conceptual and depends on the specific chart implementation and scale types.
        const convertPointToData = (px: number, py: number) => {
            // Recharts doesn't expose pixelToData easily. This is a simplified reverse.
            // For a real app, this would be a custom implementation or using D3 scales.
            const dataX = (px - chartCoords.chartX) / chartCoords.chartWidth * ((chartCoords.xDomain[1] as number) - (chartCoords.xDomain[0] as number)) + (chartCoords.xDomain[0] as number);
            const dataY = ((chartCoords.chartY + chartCoords.chartHeight - py) / chartCoords.chartHeight) * ((chartCoords.yDomain[1] as number) - (chartCoords.yDomain[0] as number)) + (chartCoords.yDomain[0] as number);
            return { dataX, dataY };
        };

        if (currentDrawing.type === 'line' || currentDrawing.type === 'arrow') {
            if (currentPoints.length >= 2) {
                const p1 = currentPoints[0];
                const p2 = currentPoints[1];
                finalAnnotation = {
                    id: `ann-${annotationCounter.current++}`,
                    type: currentDrawing.type,
                    x: convertPointToData(p1.x, p1.y).dataX,
                    y: convertPointToData(p1.x, p1.y).dataY,
                    x2: convertPointToData(p2.x, p2.y).dataX,
                    y2: convertPointToData(p2.x, p2.y).dataY,
                };
            }
        } else if (currentDrawing.type === 'rectangle') {
            if (currentPoints.length >= 2) {
                const p1 = currentPoints[0];
                const p2 = currentPoints[1];
                finalAnnotation = {
                    id: `ann-${annotationCounter.current++}`,
                    type: 'rectangle',
                    x: convertPointToData(p1.x, p1.y).dataX,
                    y: convertPointToData(p1.x, p1.y).dataY,
                    x2: convertPointToData(p2.x, p2.y).dataX,
                    y2: convertPointToData(p2.x, p2.y).dataY,
                };
            }
        } else if (currentDrawing.type === 'text') {
            // For text, just use the first point as anchor
            if (currentPoints.length >= 1) {
                const p1 = currentPoints[0];
                const textInput = prompt("Enter annotation text:");
                if (textInput) {
                    finalAnnotation = {
                        id: `ann-${annotationCounter.current++}`,
                        type: 'text',
                        x: convertPointToData(p1.x, p1.y).dataX,
                        y: convertPointToData(p1.x, p1.y).dataY,
                        text: textInput,
                    };
                }
            }
        }

        if (finalAnnotation && onDrawEnd) {
            onDrawEnd(finalAnnotation);
        }
        setCurrentDrawing(null);
        setDrawingMode('none'); // Reset drawing mode after completion
    }, [drawingMode, currentDrawing, getMouseSVGCoordinates, onDrawEnd, chartCoords]);

    const handleOverlayMouseLeave = useCallback(() => {
        if (isDrawingRef.current) {
            // If mouse leaves while drawing, cancel the current drawing
            isDrawingRef.current = false;
            setCurrentDrawing(null);
            setDrawingMode('none');
        }
    }, []);

    const clearDrawing = useCallback(() => {
        setCurrentDrawing(null);
        isDrawingRef.current = false;
        setDrawingMode('none');
    }, []);

    useEffect(() => {
        annotationCounter.current = (currentAnnotations?.length || 0);
    }, [currentAnnotations]);

    return {
        drawingMode,
        setDrawingMode,
        currentDrawing,
        handleOverlayMouseDown,
        handleOverlayMouseMove,
        handleOverlayMouseUp,
        handleOverlayMouseLeave,
        clearDrawing,
    };
};

// --- ChartAnnotationsOverlay Component ---
interface ChartAnnotationsOverlayProps {
    annotations: ChartAnnotation[];
    currentDrawing: CurrentDrawingState | null;
    drawingMode: ChartAnnotation['type'] | 'none';
    handleOverlayMouseDown: (e: React.MouseEvent<SVGGElement>) => void;
    handleOverlayMouseMove: (e: React.MouseEvent<SVGGElement>) => void;
    handleOverlayMouseUp: (e: React.MouseEvent<SVGGElement>) => void;
    handleOverlayMouseLeave: () => void;
    chartCoords: ChartCoordinateSystem | null; // For data-to-pixel conversion
    chartData: DataPoint[]; // For category axis mapping
    globalOptions?: GlobalChartOptions;
}

export const ChartAnnotationsOverlay: React.FC<ChartAnnotationsOverlayProps> = ({
    annotations,
    currentDrawing,
    drawingMode,
    handleOverlayMouseDown,
    handleOverlayMouseMove,
    handleOverlayMouseUp,
    handleOverlayMouseLeave,
    chartCoords,
    chartData,
    globalOptions
}) => {

    const renderSingleAnnotation = useCallback((ann: ChartAnnotation, isTemporary: boolean = false) => {
        if (!chartCoords) return null;

        const style: React.CSSProperties = {
            stroke: ann.color || (isTemporary ? '#fef08a' : '#00bfa5'),
            fill: 'none',
            strokeWidth: 2,
            strokeDasharray: ann.strokeDasharray || undefined,
            pointerEvents: 'none' // Don't block chart interactions
        };
        const fillColor = ann.color || (isTemporary ? '#fef08a' : '#00bfa5');


        // Attempt to convert data coords to pixel coords for rendering
        const getPixelCoords = (dataX: any, dataY: any) => {
            const px = dataToPixelX(dataX, chartCoords, chartData, 'timestamp'); // Assuming 'timestamp' or relevant dataKey for x-axis
            const py = dataToPixelY(dataY, chartCoords, chartData);
            return { px, py };
        };

        switch (ann.type) {
            case 'line':
            case 'arrow':
                const p1 = getPixelCoords(ann.x, ann.y);
                const p2 = getPixelCoords(ann.x2, ann.y2);
                if (p1.px === undefined || p1.py === undefined || p2.px === undefined || p2.py === undefined) return null;
                return (
                    <line
                        key={ann.id}
                        x1={p1.px} y1={p1.py} x2={p2.px} y2={p2.py}
                        style={style}
                        markerEnd={ann.type === 'arrow' ? "url(#annotationArrowhead)" : undefined}
                    />
                );
            case 'rectangle':
                const r1 = getPixelCoords(ann.x, ann.y);
                const r2 = getPixelCoords(ann.x2, ann.y2);
                if (r1.px === undefined || r1.py === undefined || r2.px === undefined || r2.py === undefined) return null;
                const rectX = Math.min(r1.px, r2.px);
                const rectY = Math.min(r1.py, r2.py);
                const rectWidth = Math.abs(r2.px - r1.px);
                const rectHeight = Math.abs(r2.py - r1.py);
                return (
                    <rect
                        key={ann.id}
                        x={rectX} y={rectY} width={rectWidth} height={rectHeight}
                        style={{ ...style, fill: fillColor, fillOpacity: 0.1 }}
                    />
                );
            case 'text':
                const t1 = getPixelCoords(ann.x, ann.y);
                 if (t1.px === undefined || t1.py === undefined) return null;
                return (
                    <text
                        key={ann.id}
                        x={t1.px} y={t1.py}
                        fill={fillColor}
                        fontSize={ann.fontSize || 12}
                        textAnchor={ann.anchor || 'middle'}
                        alignmentBaseline="middle"
                        style={{ pointerEvents: 'none' }}
                    >
                        {ann.text}
                    </text>
                );
            default:
                return null;
        }
    }, [chartCoords, chartData]);

    const renderCurrentDrawing = () => {
        if (!currentDrawing || !chartCoords) return null;

        const style: React.CSSProperties = {
            stroke: '#fef08a', // Temporary color
            fill: 'none',
            strokeWidth: 2,
            strokeDasharray: '5 5',
            pointerEvents: 'none'
        };

        const currentPoints = currentDrawing.points;
        const p1 = currentPoints[0];
        const p2 = currentPoints.length > 1 ? currentPoints[currentPoints.length - 1] : p1;

        switch (currentDrawing.type) {
            case 'line':
            case 'arrow':
                return <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} style={style} markerEnd={currentDrawing.type === 'arrow' ? "url(#annotationArrowhead)" : undefined} />;
            case 'rectangle':
                const rectX = Math.min(p1.x, p2.x);
                const rectY = Math.min(p1.y, p2.y);
                const rectWidth = Math.abs(p2.x - p1.x);
                const rectHeight = Math.abs(p2.y - p1.y);
                return <rect x={rectX} y={rectY} width={rectWidth} height={rectHeight} style={{ ...style, fill: '#fef08a', fillOpacity: 0.1 }} />;
            case 'text':
                // For text, just show a temporary marker at the first point
                return <circle cx={p1.x} cy={p1.y} r={5} fill="#fef08a" style={{ pointerEvents: 'none' }} />;
            default:
                return null;
        }
    };

    if (!chartCoords) return null;

    return (
        <g
            className="chart-annotations-overlay"
            onMouseDown={handleOverlayMouseDown}
            onMouseMove={handleOverlayMouseMove}
            onMouseUp={handleOverlayMouseUp}
            onMouseLeave={handleOverlayMouseLeave}
            style={{
                cursor: drawingMode !== 'none' ? 'crosshair' : 'default',
                pointerEvents: drawingMode !== 'none' ? 'all' : 'none', // Only capture events if drawing
            }}
        >
            {/* Define arrowhead marker once */}
            <defs>
                <marker id="annotationArrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto" fill={globalOptions?.chartInteractivity?.annotations?.[0]?.color || '#00bfa5'}>
                    <polygon points="0 0, 10 3.5, 0 7" />
                </marker>
            </defs>

            {/* Render existing annotations */}
            {annotations.map(ann => renderSingleAnnotation(ann))}

            {/* Render the annotation currently being drawn */}
            {currentDrawing && renderCurrentDrawing()}

            {/* A transparent rectangle to capture mouse events over the entire chart area */}
            <rect
                x={chartCoords.chartX}
                y={chartCoords.chartY}
                width={chartCoords.chartWidth}
                height={chartCoords.chartHeight}
                fill="transparent"
                style={{ pointerEvents: drawingMode !== 'none' ? 'all' : 'none' }} // Only capture events if drawing
            />
        </g>
    );
};

// --- ChartEventMarkersOverlay Component ---
interface ChartEventMarkersOverlayProps {
    eventMarkers: ChartEventMarker[];
    chartCoords: ChartCoordinateSystem | null;
    chartData: DataPoint[];
    globalOptions?: GlobalChartOptions;
    dataKeys: ChartSeriesDataKey[];
    xAxisConfig?: BaseChartConfig['xAxis'];
    yAxisConfig?: BaseChartConfig['yAxis'];
}

export const ChartEventMarkersOverlay: React.FC<ChartEventMarkersOverlayProps> = ({
    eventMarkers,
    chartCoords,
    chartData,
    globalOptions,
    dataKeys,
    xAxisConfig,
    yAxisConfig
}) => {
    if (!eventMarkers.length || !chartCoords) return null;

    // Determine the x-axis dataKey if not explicitly provided for the marker
    const defaultXDataKey = dataKeys.find(dk => dk.type !== 'pie')?.key || (chartData.length > 0 ? Object.keys(chartData[0])[0] : undefined);
    const primaryXAxisType = Array.isArray(xAxisConfig) ? xAxisConfig[0]?.type : xAxisConfig?.type;

    return (
        <g className="chart-event-markers-overlay" style={{ pointerEvents: 'none' }}>
            {eventMarkers.map(marker => {
                const markerXDataKey = marker.dataKey || defaultXDataKey;
                if (!markerXDataKey) return null;

                const markerValue = marker.value;
                
                // For cartesian charts, use Recharts ReferenceLine/ReferenceDot
                // Note: These need to be rendered within the actual Recharts Chart component, not a separate G element.
                // This overlay here is for conceptual custom SVG drawing, or if ReferenceLine is not flexible enough.
                // We'll simulate them using raw SVG for this external component.

                // A proper integration would involve passing a `ReferenceLine` component or similar
                // that gets data-bound correctly by Recharts.
                // For an external SVG overlay, we need pixel coordinates:
                const pixelX = dataToPixelX(markerValue, chartCoords, chartData, markerXDataKey);
                
                // Event markers on X axis typically. If Y-axis marker, need a y-value.
                // For simplicity, assume vertical lines based on `marker.value` for `marker.dataKey` on X-axis.
                if (pixelX === undefined) return null;

                const commonStyle = {
                    stroke: marker.color || '#ff4d4f',
                    strokeWidth: 2,
                    strokeDasharray: marker.strokeDasharray || '5 5'
                };

                switch (marker.type) {
                    case 'line':
                        return (
                            <line
                                key={marker.id}
                                x1={pixelX} y1={chartCoords.chartY}
                                x2={pixelX} y2={chartCoords.chartY + chartCoords.chartHeight}
                                style={commonStyle}
                            />
                        );
                    case 'dot':
                        // For a dot, we need a Y-value. Let's assume it's at the middle or needs a specific data point.
                        // This is a simplification, a real dot marker might point to a specific data value.
                        const dotY = chartCoords.chartY + chartCoords.chartHeight / 2;
                        return (
                            <circle
                                key={marker.id}
                                cx={pixelX} cy={dotY} r={5}
                                fill={marker.color || '#ff4d4f'}
                                style={{ stroke: commonStyle.stroke, strokeWidth: 1 }}
                            />
                        );
                    case 'text':
                         // Text label positioned near the line/dot
                        const textX = pixelX;
                        const textY = chartCoords.chartY + (marker.position === 'top' ? 10 : chartCoords.chartHeight - 10);
                        return (
                            <text
                                key={marker.id}
                                x={textX} y={textY}
                                fill={marker.color || '#ff4d4f'}
                                fontSize={12}
                                textAnchor="middle"
                                alignmentBaseline="middle"
                            >
                                {marker.label || marker.value}
                            </text>
                        );
                    case 'band':
                        if (marker.startValue === undefined || marker.endValue === undefined) return null;
                        const startPixelX = dataToPixelX(marker.startValue, chartCoords, chartData, markerXDataKey);
                        const endPixelX = dataToPixelX(marker.endValue, chartCoords, chartData, markerXDataKey);
                        if (startPixelX === undefined || endPixelX === undefined) return null;

                        const bandX = Math.min(startPixelX, endPixelX);
                        const bandWidth = Math.abs(endPixelX - startPixelX);
                        return (
                            <rect
                                key={marker.id}
                                x={bandX} y={chartCoords.chartY}
                                width={bandWidth} height={chartCoords.chartHeight}
                                fill={marker.color || '#ff4d4f'}
                                fillOpacity={marker.fillOpacity || 0.1}
                                style={{ stroke: 'none' }}
                            />
                        );
                    default:
                        return null;
                }
            })}
        </g>
    );
};

// --- ChartDrawingToolbar Component ---
interface ChartDrawingToolbarProps {
    onSelectTool: (tool: ChartAnnotation['type'] | 'none') => void;
    activeTool: ChartAnnotation['type'] | 'none';
    globalOptions?: GlobalChartOptions;
}

export const ChartDrawingToolbar: React.FC<ChartDrawingToolbarProps> = ({ onSelectTool, activeTool, globalOptions }) => {
    if (!globalOptions?.chartInteractivity?.drawingTools?.enabled) return null;

    const tools: { type: ChartAnnotation['type'], icon: string, label: string }[] = [
        { type: 'line', icon: '╱', label: 'Line' },
        { type: 'rectangle', icon: '▭', label: 'Rectangle' },
        { type: 'text', icon: 'A', label: 'Text' },
        { type: 'arrow', icon: '🠖', label: 'Arrow' },
    ];

    return (
        <div
            className="flex gap-1 p-1 bg-gray-800 rounded shadow-md absolute z-10"
            style={{
                top: globalOptions.chartInteractivity.drawingTools?.toolbarPosition === 'top' ? '8px' : 'auto',
                bottom: globalOptions.chartInteractivity.drawingTools?.toolbarPosition === 'bottom' ? '8px' : 'auto',
                left: globalOptions.chartInteractivity.drawingTools?.toolbarPosition === 'left' ? '8px' : '50%',
                right: globalOptions.chartInteractivity.drawingTools?.toolbarPosition === 'right' ? '8px' : 'auto',
                transform: (globalOptions.chartInteractivity.drawingTools?.toolbarPosition === 'left' || globalOptions.chartInteractivity.drawingTools?.toolbarPosition === 'right') ? 'translateY(-50%)' : 'translateX(-50%)',
            }}
            role="toolbar"
            aria-label="Chart Drawing Tools"
        >
            {tools.filter(tool => globalOptions.chartInteractivity?.drawingTools?.tools?.includes(tool.type)).map((tool) => (
                <button
                    key={tool.type}
                    onClick={() => onSelectTool(tool.type)}
                    className={`p-2 rounded text-sm transition-colors ${
                        activeTool === tool.type ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                    title={`Draw ${tool.label}`}
                    aria-pressed={activeTool === tool.type}
                >
                    {tool.icon}
                </button>
            ))}
            {activeTool !== 'none' && (
                 <button
                    onClick={() => onSelectTool('none')}
                    className="p-2 rounded text-sm transition-colors bg-red-600 hover:bg-red-500 text-white ml-2"
                    title="Stop Drawing"
                    aria-label="Stop Drawing"
                >
                    ✕
                </button>
            )}
        </div>
    );
};

// Re-export ChartCoordinateSystem for completeness if DashboardChart needs to build it.
export type { ChartCoordinateSystem };