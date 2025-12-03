This module provides advanced interactive charting elements for data visualization, enabling users to augment financial dashboards with custom annotations and event markers. This functionality delivers immense business value by allowing analysts to highlight critical trends, document insights directly on charts, and mark significant events for future reference. It transforms passive data consumption into an active analytical experience, improving decision-making velocity, fostering collaborative intelligence, and ensuring that crucial context is preserved with data — a capability worth millions in operational efficiency and strategic foresight for enterprise clients.

The core system comprises a robust drawing hook and overlay components that abstract complex coordinate transformations and SVG rendering, providing a seamless user experience. By integrating dynamic annotation capabilities and real-time event markers, the platform enhances its utility for financial analysis, fraud detection, and performance monitoring, significantly boosting the analytical power and user engagement of any data-intensive application.

```tsx
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

// --- Utility Functions for Scale Simulation ---
// These functions simulate D3-like scales to map data values to pixel coordinates
// and vice-versa, crucial for rendering and interpreting chart annotations and markers
// without relying on external D3 libraries. This self-contained implementation ensures
// robust coordinate system transformations, a core capability for interactive charts.

/**
 * Creates a linear scale function to map a continuous data domain to a pixel range.
 * This scale is essential for accurately positioning chart elements like lines,
 * rectangles, and text annotations based on numerical data values.
 * @param domain - The [min, max] data values for the scale.
 * @param range - The [min, max] pixel values for the scale.
 * @returns An object containing `scale` (data to pixel) and `invert` (pixel to data) functions.
 */
export const createLinearScale = (domain: [number, number], range: [number, number]) => {
    const [domainMin, domainMax] = domain;
    const [rangeMin, rangeMax] = range;

    const scale = (value: number) => {
        if (domainMax === domainMin) return rangeMin + (rangeMax - rangeMin) / 2; // Centered if domain is flat
        return rangeMin + ((value - domainMin) / (domainMax - domainMin)) * (rangeMax - rangeMin);
    };

    const invert = (pixel: number) => {
        if (rangeMax === rangeMin) return domainMin;
        return domainMin + ((pixel - rangeMin) / (rangeMax - rangeMin)) * (domainMax - domainMin);
    };

    return { scale, invert };
};

/**
 * Creates a time scale function to map date/time data to a pixel range,
 * handling conversions between various date formats and timestamps. This is vital
 * for time-series charts, allowing precise placement of event markers and
 * annotations along the temporal axis.
 * @param domain - The [start, end] date/time values (as Date objects or parseable strings).
 * @param range - The [min, max] pixel values for the scale.
 * @returns An object containing `scale` (data to pixel) and `invert` (pixel to data) functions.
 */
export const createTimeScale = (domain: [Date | string | number, Date | string | number], range: [number, number]) => {
    const domainMinMs = new Date(domain[0]).getTime();
    const domainMaxMs = new Date(domain[1]).getTime();
    const [rangeMin, rangeMax] = range;

    const scale = (value: Date | string | number) => {
        const valueMs = new Date(value).getTime();
        if (domainMaxMs === domainMinMs) return rangeMin + (rangeMax - rangeMin) / 2; // Centered if domain is flat
        return rangeMin + ((valueMs - domainMinMs) / (domainMaxMs - domainMinMs)) * (rangeMax - rangeMin);
    };

    const invert = (pixel: number) => {
        if (rangeMax === rangeMin) return new Date(domainMinMs);
        const invertedMs = domainMinMs + ((pixel - rangeMin) / (rangeMax - rangeMin)) * (domainMaxMs - domainMinMs);
        return new Date(invertedMs);
    };

    return { scale, invert };
};

/**
 * Creates a category scale for discrete data, distributing categories evenly across a pixel range.
 * This ensures proper alignment of elements with categorical axes, such as bar charts
 * or grouped data, providing clear visual separation and accurate annotation placement.
 * @param categories - An array of unique category values.
 * @param range - The [min, max] pixel values for the scale.
 * @param paddingInner - Relative padding between category bands (0-1).
 * @param paddingOuter - Relative padding at the ends of the range (0-1).
 * @returns An object containing `scale` (data to pixel) and `invert` (pixel to data) functions.
 */
export const createCategoryScale = (categories: any[], range: [number, number], paddingInner: number = 0.1, paddingOuter: number = 0.2) => {
    const [rangeMin, rangeMax] = range;
    const availableRange = rangeMax - rangeMin;
    const totalBandCount = categories.length;
    
    // Calculate effective bandwidth and step, ensuring stable distribution
    const bandWidthRatio = 1 - paddingInner;
    const paddingRatio = paddingInner / (categories.length > 1 ? categories.length - 1 : 1);
    
    // Simplified calculation for band and step
    const step = availableRange / (totalBandCount + paddingOuter * 2 + (totalBandCount > 1 ? paddingInner * (totalBandCount - 1) : 0));
    const bandwidth = step * (1 - paddingInner);
    const offset = step * paddingOuter;

    const scale = (value: any) => {
        const index = categories.indexOf(value);
        if (index === -1) return undefined;
        return rangeMin + offset + index * step + bandwidth / 2; // Position at the center of the band
    };

    const invert = (pixel: number) => {
        if (categories.length === 0) return undefined;
        const relativePixel = pixel - (rangeMin + offset);
        const index = Math.floor(relativePixel / step);
        if (index >= 0 && index < categories.length && relativePixel >= index * step && relativePixel < (index * step + bandwidth)) {
            return categories[index];
        }
        return undefined;
    };

    return { scale, invert };
};

/**
 * Interface defining the complete coordinate system of a chart's plotting area.
 * This abstraction is critical for decoupling annotation and marker logic from
 * specific charting libraries, allowing flexible integration and precise positioning
 * of interactive elements. It includes not only dimensions but also simulated
 * scale functions for robust data-to-pixel and pixel-to-data conversions,
 * which are essential for commercial-grade interactive charting.
 */
export interface ChartCoordinateSystem {
    chartX: number; // Top-left X of the actual plotting area (after margins)
    chartY: number; // Top-left Y of the actual plotting area (after margins)
    chartWidth: number; // Width of the plotting area
    chartHeight: number; // Height of the plotting area
    xDomain: (string | number | Date)[]; // e.g., ['2023-01-01', '2023-01-31'] or [0, 100]
    yDomain: (string | number)[];   // e.g., [0, 1000]
    xAxisType: 'category' | 'number' | 'time';
    yAxisType: 'category' | 'number' | 'time';
    xDataKey?: string; // Optional data key for x-axis, especially for category type
    yDataKey?: string; // Optional data key for y-axis, especially for category type
    // Scale functions provided by the parent chart for accurate conversions
    xScaleFn: (value: any) => number | undefined;
    yScaleFn: (value: any) => number | undefined;
    pixelToDataXFn: (pixel: number) => any;
    pixelToDataYFn: (pixel: number) => any;
}

/**
 * Converts a data value to a pixel coordinate on the X-axis using the provided chart's scale function.
 * This utility ensures that advanced chart elements are precisely rendered according to the
 * underlying data, enabling accurate visual analysis.
 */
const dataToPixelX = (
    value: any,
    coords: ChartCoordinateSystem,
): number | undefined => {
    if (!coords || !coords.xScaleFn) return undefined;
    return coords.xScaleFn(value);
};

/**
 * Converts a data value to a pixel coordinate on the Y-axis using the provided chart's scale function.
 * This is fundamental for positioning elements vertically, crucial for all chart types
 * including financial and scientific visualizations.
 */
const dataToPixelY = (
    value: any,
    coords: ChartCoordinateSystem,
): number | undefined => {
    if (!coords || !coords.yScaleFn) return undefined;
    // Y-axis usually inverts: higher data value = lower pixel value in SVG
    return coords.yScaleFn(value);
};

// --- Annotation Audit Log (Simulated) ---
/**
 * A simulated audit logging mechanism for chart annotations. In a production environment,
 * this would integrate with a secure, tamper-evident audit trail system (e.g., using chained hashes)
 * to record all creation, modification, and deletion events for governance, compliance,
 * and security purposes. This ensures accountability and traceability for all analytical insights
 * captured directly on the charts.
 */
export const AnnotationAuditLogger = {
    log: (action: 'create' | 'update' | 'delete', annotation: ChartAnnotation, userId: string = 'system') => {
        const timestamp = new Date().toISOString();
        // For a commercial system, this would write to a persistent, secure log.
        // E.g., a database table, a distributed ledger, or a file with cryptographic hashing.
        console.log(`[AUDIT] Annotation ${action}: ID=${annotation.id}, Type=${annotation.type}, User=${userId}, Timestamp=${timestamp}`);
        // In a real system, you might encrypt log data or send it to a dedicated logging service.
    },
};

// --- Chart Annotation Text Editor (Simulated UI) ---
/**
 * A conceptual component for an on-chart text editor. In a full commercial application,
 * this would be a sophisticated overlay UI allowing rich text editing, styling,
 * and precise positioning, replacing the simple `prompt()` call for a superior user experience.
 * For this simulation, it provides a functional placeholder that can be extended.
 */
interface ChartAnnotationTextEditorProps {
    x: number;
    y: number;
    initialText?: string;
    onSave: (text: string) => void;
    onCancel: () => void;
}

export const ChartAnnotationTextEditor: React.FC<ChartAnnotationTextEditorProps> = ({ x, y, initialText = '', onSave, onCancel }) => {
    const [text, setText] = useState(initialText);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSave(text);
        }
        if (e.key === 'Escape') {
            onCancel();
        }
    }, [text, onSave, onCancel]);

    return (
        <foreignObject x={x - 100} y={y - 30} width="200" height="80">
            <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'rgba(30, 41, 59, 0.9)', // slate-800 equivalent
                    borderRadius: '4px',
                    padding: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    color: 'white'
                }}
            >
                <textarea
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{
                        flexGrow: 1,
                        border: '1px solid #64748b', // slate-500
                        borderRadius: '2px',
                        padding: '4px',
                        backgroundColor: '#1f2937', // gray-800
                        color: 'white',
                        resize: 'none',
                        fontSize: '12px'
                    }}
                    placeholder="Enter annotation text..."
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', gap: '4px' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '4px 8px',
                            borderRadius: '2px',
                            backgroundColor: '#ef4444', // red-500
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(text)}
                        style={{
                            padding: '4px 8px',
                            borderRadius: '2px',
                            backgroundColor: '#22c55e', // green-500
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </foreignObject>
    );
};


// --- Interfaces for internal state of drawing hook ---
interface CurrentDrawingState {
    type: ChartAnnotation['type'];
    points: { x: number; y: number; dataX?: any; dataY?: any }[];
    text?: string;
}

/**
 * A powerful React hook that provides a comprehensive interface for interactive
 * chart drawing and annotation management. This hook underpins the dynamic
 * analytical capabilities of the dashboard, allowing users to draw lines, rectangles,
 * and text directly on the chart. Its integration with `ChartCoordinateSystem`
 * ensures accurate data-to-pixel mapping, making it a cornerstone for enabling
 * rich, user-driven data exploration and insight capture. This enhances user engagement
 * and the intrinsic value of the chart by making it a tool for active analysis, not just display.
 */
interface UseChartDrawingProps {
    onDrawEnd?: (annotation: ChartAnnotation) => void;
    onAnnotationChange?: (annotation: ChartAnnotation) => void;
    onAnnotationDelete?: (id: string) => void;
    initialAnnotations?: ChartAnnotation[]; // For loading existing annotations
    chartCoords: ChartCoordinateSystem | null; // For data-to-pixel conversion
    chartData: DataPoint[]; // For category axis mapping
    userId?: string; // Current authenticated user ID for auditing
}

/**
 * Result interface for the `useChartDrawing` hook, exposing states and handlers
 * necessary for rendering drawing tools and managing annotations.
 */
interface UseChartDrawingResult {
    drawingMode: ChartAnnotation['type'] | 'none';
    setDrawingMode: (mode: ChartAnnotation['type'] | 'none') => void;
    currentDrawing: CurrentDrawingState | null;
    handleOverlayMouseDown: (e: React.MouseEvent<SVGGElement>) => void;
    handleOverlayMouseMove: (e: React.MouseEvent<SVGGElement>) => void;
    handleOverlayMouseUp: (e: React.MouseEvent<SVGGElement>) => void;
    handleOverlayMouseLeave: () => void;
    clearDrawing: () => void;
    selectedAnnotationId: string | null;
    setSelectedAnnotationId: (id: string | null) => void;
    activeTextEditor: { x: number; y: number; text: string; id: string } | null;
    clearActiveTextEditor: () => void;
    handleTextEditorSave: (text: string) => void;
    handleDeleteSelectedAnnotation: () => void;
    annotations: ChartAnnotation[]; // Managed internally
}

export const useChartDrawing = ({ onDrawEnd, onAnnotationChange, onAnnotationDelete, initialAnnotations, chartCoords, userId = 'anonymous' }: UseChartDrawingProps): UseChartDrawingResult => {
    const [drawingMode, setDrawingMode] = useState<ChartAnnotation['type'] | 'none'>('none');
    const [currentDrawing, setCurrentDrawing] = useState<CurrentDrawingState | null>(null);
    const [annotations, setAnnotations] = useState<ChartAnnotation[]>(initialAnnotations || []);
    const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
    const [activeTextEditor, setActiveTextEditor] = useState<{ x: number; y: number; text: string; id: string } | null>(null);

    const isDrawingRef = useRef(false);
    const annotationCounter = useRef(0); // Simple ID generation

    useEffect(() => {
        setAnnotations(initialAnnotations || []);
        // Reset counter to ensure unique IDs even after loading initial annotations
        annotationCounter.current = (initialAnnotations?.length || 0) + 1;
    }, [initialAnnotations]);

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
        // Fallback to client coords if SVG transform fails, less accurate but prevents crashes
        return { x: e.clientX, y: e.clientY };
    }, []);

    const handleOverlayMouseDown = useCallback((e: React.MouseEvent<SVGGElement>) => {
        if (!chartCoords) return;

        // Clear selection if clicking outside an annotation
        if (!e.target || !(e.target as SVGElement).closest('.chart-annotation-element')) {
            setSelectedAnnotationId(null);
        }

        if (drawingMode === 'none') return;

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

        // Leverage the chartCoords scale functions for robust pixel-to-data conversion
        const convertPointToData = (px: number, py: number) => {
            const dataX = chartCoords.pixelToDataXFn(px);
            const dataY = chartCoords.pixelToDataYFn(py);
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
                    createdBy: userId,
                    createdAt: new Date().toISOString(),
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
                    createdBy: userId,
                    createdAt: new Date().toISOString(),
                };
            }
        } else if (currentDrawing.type === 'text') {
            if (currentPoints.length >= 1) {
                const p1 = currentPoints[0];
                const id = `ann-${annotationCounter.current++}`;
                setActiveTextEditor({
                    x: p1.x, y: p1.y, text: '', id
                });
                // Temporarily store a partial annotation for the editor to complete
                finalAnnotation = {
                    id: id,
                    type: 'text',
                    x: convertPointToData(p1.x, p1.y).dataX,
                    y: convertPointToData(p1.x, p1.y).dataY,
                    text: '', // Text will be added by editor
                    createdBy: userId,
                    createdAt: new Date().toISOString(),
                };
            }
        }

        if (finalAnnotation) {
            if (finalAnnotation.type !== 'text' || activeTextEditor) { // Only add non-text or if text editor is active
                setAnnotations(prev => [...prev, finalAnnotation!]);
                AnnotationAuditLogger.log('create', finalAnnotation!, userId);
                if (onDrawEnd) {
                    onDrawEnd(finalAnnotation);
                }
            }
        }
        setCurrentDrawing(null);
        setDrawingMode('none'); // Reset drawing mode after completion
    }, [drawingMode, currentDrawing, getMouseSVGCoordinates, onDrawEnd, chartCoords, userId, activeTextEditor]);

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
        setActiveTextEditor(null);
    }, []);

    const clearActiveTextEditor = useCallback(() => {
        setActiveTextEditor(null);
        // If text was canceled, remove the placeholder annotation
        setAnnotations(prev => prev.filter(ann => ann.id !== activeTextEditor?.id));
    }, [activeTextEditor]);

    const handleTextEditorSave = useCallback((text: string) => {
        if (!activeTextEditor || !chartCoords) return;

        setAnnotations(prev => {
            const updated = prev.map(ann =>
                ann.id === activeTextEditor.id
                    ? { ...ann, text, lastModifiedBy: userId, lastModifiedAt: new Date().toISOString() }
                    : ann
            );
            const savedAnn = updated.find(ann => ann.id === activeTextEditor.id);
            if (savedAnn) {
                AnnotationAuditLogger.log('update', savedAnn, userId);
                if (onAnnotationChange) {
                    onAnnotationChange(savedAnn);
                }
            }
            return updated;
        });
        setActiveTextEditor(null);
    }, [activeTextEditor, onAnnotationChange, chartCoords, userId]);

    const handleDeleteSelectedAnnotation = useCallback(() => {
        if (!selectedAnnotationId) return;
        const annotationToDelete = annotations.find(ann => ann.id === selectedAnnotationId);
        if (annotationToDelete) {
            setAnnotations(prev => prev.filter(ann => ann.id !== selectedAnnotationId));
            AnnotationAuditLogger.log('delete', annotationToDelete, userId);
            if (onAnnotationDelete) {
                onAnnotationDelete(selectedAnnotationId);
            }
            setSelectedAnnotationId(null);
        }
    }, [selectedAnnotationId, annotations, onAnnotationDelete, userId]);

    return {
        drawingMode,
        setDrawingMode,
        currentDrawing,
        handleOverlayMouseDown,
        handleOverlayMouseMove,
        handleOverlayMouseUp,
        handleOverlayMouseLeave,
        clearDrawing,
        selectedAnnotationId,
        setSelectedAnnotationId,
        activeTextEditor,
        clearActiveTextEditor,
        handleTextEditorSave,
        handleDeleteSelectedAnnotation,
        annotations,
    };
};

// --- ChartAnnotationsOverlay Component ---
/**
 * A sophisticated SVG overlay component responsible for rendering both persistent
 * and actively drawn annotations on a chart. This component is crucial for enabling
 * visual communication and analysis directly within the data presentation layer.
 * It intelligently uses the chart's coordinate system to translate data points
 * into pixel-perfect SVG elements, making the chart an interactive canvas for
 * financial insights and operational highlights. Its robust rendering capabilities
 * ensure high performance even with numerous complex annotations.
 */
interface ChartAnnotationsOverlayProps {
    annotations: ChartAnnotation[];
    currentDrawing: CurrentDrawingState | null;
    drawingMode: ChartAnnotation['type'] | 'none';
    handleOverlayMouseDown: (e: React.MouseEvent<SVGGElement>) => void;
    handleOverlayMouseMove: (e: React.MouseEvent<SVGGElement>) => void;
    handleOverlayMouseUp: (e: React.MouseEvent<SVGGElement>) => void;
    handleOverlayMouseLeave: () => void;
    chartCoords: ChartCoordinateSystem | null; // For data-to-pixel conversion
    globalOptions?: GlobalChartOptions;
    selectedAnnotationId: string | null;
    setSelectedAnnotationId: (id: string | null) => void;
    activeTextEditor: { x: number; y: number; text: string; id: string } | null;
    onTextEditorSave: (text: string) => void;
    onTextEditorCancel: () => void;
    onDeleteSelected: () => void;
}

export const ChartAnnotationsOverlay: React.FC<ChartAnnotationsOverlayProps> = React.memo(({
    annotations,
    currentDrawing,
    drawingMode,
    handleOverlayMouseDown,
    handleOverlayMouseMove,
    handleOverlayMouseUp,
    handleOverlayMouseLeave,
    chartCoords,
    globalOptions,
    selectedAnnotationId,
    setSelectedAnnotationId,
    activeTextEditor,
    onTextEditorSave,
    onTextEditorCancel,
    onDeleteSelected
}) => {

    const renderSingleAnnotation = useCallback((ann: ChartAnnotation, isTemporary: boolean = false) => {
        if (!chartCoords) return null;

        const isSelected = selectedAnnotationId === ann.id;

        const style: React.CSSProperties = {
            stroke: ann.color || (isTemporary ? '#fef08a' : '#00bfa5'),
            fill: 'none',
            strokeWidth: isSelected ? 3 : 2,
            strokeDasharray: ann.strokeDasharray || undefined,
            pointerEvents: 'bounding-box' // Allow selection
        };
        const fillColor = ann.color || (isTemporary ? '#fef08a' : '#00bfa5');

        // Attempt to convert data coords to pixel coords for rendering
        const getPixelCoords = (dataX: any, dataY: any) => {
            const px = dataToPixelX(dataX, chartCoords);
            const py = dataToPixelY(dataY, chartCoords);
            return { px, py };
        };

        const handleClick = (e: React.MouseEvent) => {
            e.stopPropagation(); // Prevent overlay's mouseDown from clearing selection
            setSelectedAnnotationId(ann.id);
        };

        switch (ann.type) {
            case 'line':
            case 'arrow':
                const p1 = getPixelCoords(ann.x, ann.y);
                const p2 = getPixelCoords(ann.x2, ann.y2);
                if (p1.px === undefined || p1.py === undefined || p2.px === undefined || p2.py === undefined) return null;
                return (
                    <g key={ann.id} className="chart-annotation-element" onClick={handleClick}>
                        <line
                            x1={p1.px} y1={p1.py} x2={p2.px} y2={p2.py}
                            style={style}
                            markerEnd={ann.type === 'arrow' ? "url(#annotationArrowhead)" : undefined}
                        />
                        {isSelected && <rect
                            x={Math.min(p1.px, p2.px) - 5}
                            y={Math.min(p1.py, p2.py) - 5}
                            width={Math.abs(p2.px - p1.px) + 10}
                            height={Math.abs(p2.py - p1.py) + 10}
                            fill="none"
                            stroke="#00bfa5"
                            strokeWidth="1"
                            strokeDasharray="2 2"
                            pointerEvents="none"
                        />}
                    </g>
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
                    <g key={ann.id} className="chart-annotation-element" onClick={handleClick}>
                        <rect
                            x={rectX} y={rectY} width={rectWidth} height={rectHeight}
                            style={{ ...style, fill: fillColor, fillOpacity: 0.1 }}
                        />
                        {isSelected && <rect
                            x={rectX - 5} y={rectY - 5} width={rectWidth + 10} height={rectHeight + 10}
                            fill="none"
                            stroke="#00bfa5"
                            strokeWidth="1"
                            strokeDasharray="2 2"
                            pointerEvents="none"
                        />}
                    </g>
                );
            case 'text':
                const t1 = getPixelCoords(ann.x, ann.y);
                 if (t1.px === undefined || t1.py === undefined) return null;
                return (
                    <g key={ann.id} className="chart-annotation-element" onClick={handleClick}>
                        <text
                            x={t1.px} y={t1.py}
                            fill={fillColor}
                            fontSize={ann.fontSize || 12}
                            textAnchor={ann.anchor || 'middle'}
                            alignmentBaseline="middle"
                            style={{ pointerEvents: 'none' }}
                        >
                            {ann.text}
                        </text>
                        {isSelected && <circle
                            cx={t1.px} cy={t1.py} r={7}
                            fill="none"
                            stroke="#00bfa5"
                            strokeWidth="1"
                            strokeDasharray="2 2"
                            pointerEvents="none"
                        />}
                    </g>
                );
            default:
                return null;
        }
    }, [chartCoords, selectedAnnotationId, setSelectedAnnotationId]);

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
                pointerEvents: drawingMode !== 'none' ? 'all' : 'auto', // Capture events if drawing or interacting with existing
            }}
        >
            {/* Define arrowhead marker once for all arrows */}
            <defs>
                <marker id="annotationArrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto" fill={globalOptions?.chartInteractivity?.annotations?.[0]?.color || '#00bfa5'}>
                    <polygon points="0 0, 10 3.5, 0 7" />
                </marker>
            </defs>

            {/* Render existing annotations */}
            {annotations.map(ann => renderSingleAnnotation(ann))}

            {/* Render the annotation currently being drawn */}
            {currentDrawing && renderCurrentDrawing()}

            {/* Text editor for new or existing text annotations */}
            {activeTextEditor && (
                <ChartAnnotationTextEditor
                    x={activeTextEditor.x}
                    y={activeTextEditor.y}
                    initialText={activeTextEditor.text}
                    onSave={onTextEditorSave}
                    onCancel={onTextEditorCancel}
                />
            )}

            {/* Action buttons for selected annotations */}
            {selectedAnnotationId && (
                <foreignObject
                    x={chartCoords.chartX + 10}
                    y={chartCoords.chartY + 10}
                    width="100"
                    height="40"
                    style={{ pointerEvents: 'auto' }} // Ensure foreignObject captures events
                >
                    <div xmlns="http://www.w3.org/1999/xhtml" className="flex gap-2 p-1 bg-gray-800 rounded shadow-md text-sm">
                        <button
                            onClick={onDeleteSelected}
                            title="Delete Annotation"
                            className="p-1 rounded bg-red-600 hover:bg-red-500 text-white"
                        >
                            <span role="img" aria-label="Delete">🗑️</span>
                        </button>
                        {/* Future: Add Edit/Move/Resize buttons here */}
                    </div>
                </foreignObject>
            )}

            {/* A transparent rectangle to capture mouse events over the entire chart area
                This rect ensures mouse events are captured even if not directly over an annotation,
                especially important when drawing or when drawingMode is 'none' but we need to
                clear selection on click. */}
            <rect
                x={chartCoords.chartX}
                y={chartCoords.chartY}
                width={chartCoords.chartWidth}
                height={chartCoords.chartHeight}
                fill="transparent"
                style={{ pointerEvents: drawingMode !== 'none' || selectedAnnotationId ? 'all' : 'auto' }}
            />
        </g>
    );
});

// --- ChartEventMarkersOverlay Component ---
/**
 * This component provides a dedicated SVG overlay for rendering critical event markers
 * on a chart. Event markers are invaluable for highlighting significant occurrences
 * (e.g., market crashes, product launches, system anomalies, payment failures) within
 * a time series or categorical data context. By rendering these dynamically, the system
 * offers immediate visual cues that enhance observability, facilitate root cause analysis,
 * and provide crucial context for financial operations and agentic AI monitoring. This capability
 * significantly reduces the time-to-insight for operational teams.
 */
interface ChartEventMarkersOverlayProps {
    eventMarkers: ChartEventMarker[];
    chartCoords: ChartCoordinateSystem | null;
    globalOptions?: GlobalChartOptions;
    dataKeys: ChartSeriesDataKey[];
    xAxisConfig?: BaseChartConfig['xAxis'];
    yAxisConfig?: BaseChartConfig['yAxis'];
}

export const ChartEventMarkersOverlay: React.FC<ChartEventMarkersOverlayProps> = React.memo(({
    eventMarkers,
    chartCoords,
    globalOptions,
    dataKeys,
    xAxisConfig,
    yAxisConfig
}) => {
    if (!eventMarkers.length || !chartCoords) return null;

    // Determine the x-axis dataKey if not explicitly provided for the marker
    // This logic infers the primary data key from the chart configuration
    const defaultXDataKey = dataKeys.find(dk => dk.type !== 'pie')?.key || (chartCoords.xDataKey || 'timestamp'); // Fallback to a common key

    const primaryXAxisType = Array.isArray(xAxisConfig) ? xAxisConfig[0]?.type : xAxisConfig?.type;

    return (
        <g className="chart-event-markers-overlay" style={{ pointerEvents: 'none' }}>
            {eventMarkers.map(marker => {
                const markerXDataKey = marker.dataKey || defaultXDataKey;
                if (!markerXDataKey) return null;

                // Use the robust dataToPixelX function from chartCoords
                const pixelX = dataToPixelX(marker.value, chartCoords);
                
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
                        // For a dot marker, position it visually within the chart, e.g., in the middle
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
                         // Text label positioned near the line/dot, with robust positioning
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
                                {marker.label || String(marker.value)}
                            </text>
                        );
                    case 'band':
                        if (marker.startValue === undefined || marker.endValue === undefined) return null;
                        const startPixelX = dataToPixelX(marker.startValue, chartCoords);
                        const endPixelX = dataToPixelX(marker.endValue, chartCoords);
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
});

// --- ChartDrawingToolbar Component ---
/**
 * A highly functional and intuitive toolbar component designed to provide users
 * with quick access to various chart annotation tools. This user interface element
 * significantly enhances the interactivity of dashboards, empowering analysts
 * and operators to mark up charts with critical observations. Its configurable
 * nature and clean design promote high usability, making advanced analytical
 * features readily accessible and contributing directly to improved operational
 * agility and decision-making speed, which translates to millions in value from
 * faster, more informed responses to dynamic market conditions or system events.
 */
interface ChartDrawingToolbarProps {
    onSelectTool: (tool: ChartAnnotation['type'] | 'none') => void;
    activeTool: ChartAnnotation['type'] | 'none';
    globalOptions?: GlobalChartOptions;
    onClearAllAnnotations: () => void;
    onDeleteSelectedAnnotation: () => void;
    hasSelectedAnnotation: boolean;
}

export const ChartDrawingToolbar: React.FC<ChartDrawingToolbarProps> = React.memo(({ onSelectTool, activeTool, globalOptions, onClearAllAnnotations, onDeleteSelectedAnnotation, hasSelectedAnnotation }) => {
    // Only render toolbar if drawing tools are enabled in global options
    if (!globalOptions?.chartInteractivity?.drawingTools?.enabled) return null;

    const tools: { type: ChartAnnotation['type'], icon: string, label: string }[] = [
        { type: 'line', icon: 'â”', label: 'Line' }, // Line symbol
        { type: 'rectangle', icon: 'â–„', label: 'Rectangle' }, // Rectangle symbol
        { type: 'text', icon: 'A', label: 'Text' },
        { type: 'arrow', icon: 'â†’', label: 'Arrow' }, // Arrow symbol
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
                    âœ• {/* Multiplication X */}
                </button>
            )}
            {/* Action buttons for general annotation management */}
            {(hasSelectedAnnotation) && (
                <button
                    onClick={onDeleteSelectedAnnotation}
                    title="Delete Selected Annotation"
                    className="p-2 rounded text-sm transition-colors bg-red-600 hover:bg-red-500 text-white ml-2"
                >
                    <span role="img" aria-label="Delete Selected">🗑️</span>
                </button>
            )}
            {/* The "Clear All" button should be available regardless of activeTool */}
            <button
                onClick={onClearAllAnnotations}
                title="Clear All Annotations"
                className="p-2 rounded text-sm transition-colors bg-gray-700 hover:bg-gray-600 text-gray-300 ml-2"
            >
                <span role="img" aria-label="Clear All">âš‘</span>
            </button>
        </div>
    );
});

// Re-export ChartCoordinateSystem for completeness if DashboardChart needs to build it.
export type { ChartCoordinateSystem };

```