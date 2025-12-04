// components/views/platform/DemoBankGISView.tsx
import React, { useState, useEffect, useReducer, useCallback, useMemo, useRef } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

// --- TYPES & INTERFACES ---

export type GeoJSONGeometry = GeoJSONPoint | GeoJSONMultiPoint | GeoJSONLineString | GeoJSONMultiLineString | GeoJSONPolygon | GeoJSONMultiPolygon;
export type GeoJSON = GeoJSONFeature | GeoJSONFeatureCollection | GeoJSONGeometry;
export type LngLat = [number, number]; // [longitude, latitude]

export interface GeoJSONPoint {
    type: 'Point';
    coordinates: LngLat;
}

export interface GeoJSONMultiPoint {
    type: 'MultiPoint';
    coordinates: LngLat[];
}

export interface GeoJSONLineString {
    type: 'LineString';
    coordinates: LngLat[];
}

export interface GeoJSONMultiLineString {
    type: 'MultiLineString';
    coordinates: LngLat[][];
}

export interface GeoJSONPolygon {
    type: 'Polygon';
    coordinates: LngLat[][];
}

export interface GeoJSONMultiPolygon {
    type: 'MultiPolygon';
    coordinates: LngLat[][][];
}

export interface GeoJSONFeature<G = GeoJSONGeometry, P = { [key: string]: any }> {
    type: 'Feature';
    geometry: G;
    properties: P;
    id?: string | number;
}

export interface GeoJSONFeatureCollection<G = GeoJSONGeometry, P = { [key: string]: any }> {
    type: 'FeatureCollection';
    features: Array<GeoJSONFeature<G, P>>;
}

export interface LayerStyle {
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    fillOpacity: number;
    strokeOpacity: number;
    pointRadius?: number;
}

export interface MapLayer {
    id: string;
    name: string;
    data: GeoJSONFeatureCollection;
    isVisible: boolean;
    style: LayerStyle;
    isBaseLayer?: boolean; // Base layers cannot be deleted
}

export interface MapViewState {
    longitude: number;
    latitude: number;
    zoom: number;
}

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    duration?: number;
}

export interface AnalysisResult {
    summary: string;
    data?: GeoJSONFeatureCollection;
    metrics?: Record<string, number | string>;
}

export type AnalysisType = 'proximity' | 'buffer' | 'intersection' | 'data-enrichment';

// --- CONSTANTS ---

export const INITIAL_MAP_VIEW_STATE: MapViewState = {
    longitude: -73.97,
    latitude: 40.78,
    zoom: 12,
};

export const DEFAULT_LAYER_STYLE: Omit<LayerStyle, 'fillColor' | 'strokeColor'> = {
    strokeWidth: 2,
    fillOpacity: 0.5,
    strokeOpacity: 0.8,
    pointRadius: 5,
};

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 22;

export const WORLD_GEOJSON: GeoJSONFeatureCollection = {
  type: "FeatureCollection",
  features: [
    // A simplified world map could be included here. For brevity, it's represented by a single large polygon.
    {
      type: "Feature",
      properties: { name: "World Base Map" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]]
        ]
      }
    }
  ]
};

// --- UTILITY FUNCTIONS ---

/**
 * Generates a simple unique identifier.
 */
export function generateId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generates a random hexadecimal color.
 */
export function getRandomHexColor(): string {
    return `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
}

/**
 * Calculates the bounding box of a GeoJSON object.
 * @param geojson The GeoJSON object.
 * @returns [[minLng, minLat], [maxLng, maxLat]]
 */
export function calculateGeoJSONBounds(geojson: GeoJSON): [[number, number], [number, number]] {
    let minLng = 180, minLat = 90, maxLng = -180, maxLat = -90;

    const processCoords = (coords: any[]) => {
        if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
            const [lng, lat] = coords;
            if (lng < minLng) minLng = lng;
            if (lat < minLat) minLat = lat;
            if (lng > maxLng) maxLng = lng;
            if (lat > maxLat) maxLat = lat;
        } else {
            coords.forEach(processCoords);
        }
    };

    if (geojson.type === 'FeatureCollection') {
        geojson.features.forEach(feature => processCoords(feature.geometry.coordinates));
    } else if (geojson.type === 'Feature') {
        processCoords(geojson.geometry.coordinates);
    } else {
        processCoords((geojson as GeoJSONGeometry).coordinates);
    }
    
    if (minLng > maxLng) return [[-180, -90],[180, 90]]; // Return world if no coords

    return [[minLng, minLat], [maxLng, maxLat]];
}


/**
 * Simple Mercator projection.
 * @param lng Longitude
 * @param lat Latitude
 * @returns [x, y] pixel coordinates
 */
export function project(lng: number, lat: number): [number, number] {
    const R = 6378137; // Earth radius in meters
    const x = R * lng * Math.PI / 180;
    const y = R * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
    return [x, y];
}

/**
* Converts pixel coordinates to geographical coordinates at a given zoom level.
* This is a simplified un-projection and assumes a certain map setup.
* @param x The x-coordinate on the map canvas.
* @param y The y-coordinate on the map canvas.
* @param mapWidth The width of the map canvas.
* @param mapHeight The height of the map canvas.
* @param viewState The current map view state.
* @returns [longitude, latitude]
*/
export function unproject(x: number, y: number, mapWidth: number, mapHeight: number, viewState: MapViewState): [number, number] {
   const TILE_SIZE = 512;
   const scale = Math.pow(2, viewState.zoom);
   const worldSize = TILE_SIZE * scale;

   const centerPixelsX = worldSize / 2 + viewState.longitude * (worldSize / 360);
   const centerPixelsY = worldSize / 2 - Math.log(Math.tan(Math.PI / 4 + viewState.latitude * Math.PI / 180 / 2)) * (worldSize / (2 * Math.PI));

   const clickPixelsX = centerPixelsX - mapWidth / 2 + x;
   const clickPixelsY = centerPixelsY - mapHeight / 2 + y;

   const lng = (clickPixelsX - worldSize / 2) / (worldSize / 360);
   const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * clickPixelsY / worldSize)));
   const lat = latRad * 180 / Math.PI;

   return [lng, lat];
}


/**
 * Fits the map view to a given bounding box.
 * @param bounds The bounding box [[minLng, minLat], [maxLng, maxLat]]
 * @param mapDimensions The dimensions of the map {width, height}
 * @returns A new MapViewState
 */
export function fitBounds(bounds: [[number, number], [number, number]], mapDimensions: { width: number, height: number }): MapViewState {
    const [[minLng, minLat], [maxLng, maxLat]] = bounds;
    const longitude = (minLng + maxLng) / 2;
    const latitude = (minLat + maxLat) / 2;

    const lngDiff = Math.abs(maxLng - minLng);
    const latDiff = Math.abs(maxLat - minLat);

    if (lngDiff === 0 && latDiff === 0) {
        return { longitude, latitude, zoom: 15 };
    }
    
    const zoomLng = Math.log2(360 * mapDimensions.width / (lngDiff * 256)) - 1;
    const zoomLat = Math.log2(180 * mapDimensions.height / (latDiff * 256)) - 1;
    
    const zoom = Math.min(zoomLng, zoomLat, MAX_ZOOM);

    return { longitude, latitude, zoom };
}

// --- AI SERVICE ABSTRACTION ---
export class GISAIService {
    private ai: GoogleGenAI;
    private static geojsonSchema = {
        type: Type.OBJECT,
        properties: {
            type: { type: Type.STRING, enum: ["FeatureCollection"] },
            features: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ["Feature"] },
                        properties: { type: Type.OBJECT },
                        geometry: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, enum: ["Point", "LineString", "Polygon", "MultiPoint", "MultiLineString", "MultiPolygon"] },
                                coordinates: { type: Type.ARRAY }
                            },
                            required: ["type", "coordinates"]
                        }
                    },
                    required: ["type", "geometry", "properties"]
                }
            }
        },
        required: ["type", "features"]
    };

    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error("Google GenAI API key is required.");
        }
        this.ai = new GoogleGenAI({ apiKey });
    }

    public async generateGeoJSON(prompt: string): Promise<GeoJSONFeatureCollection> {
        const fullPrompt = `Generate a GeoJSON FeatureCollection for the following request: "${prompt}". 
        Ensure the coordinates are accurate and the geometry type is appropriate. 
        For polygons, provide a sufficient number of points to define the shape clearly. 
        Always return a FeatureCollection, even if it contains only one feature.
        Add a 'name' property based on the prompt.`;
        
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: { responseMimeType: "application/json", responseSchema: GISAIService.geojsonSchema }
        });
        
        const parsed = JSON.parse(response.text);
        if (parsed.type !== 'FeatureCollection') {
            throw new Error("AI did not return a valid FeatureCollection.");
        }
        return parsed as GeoJSONFeatureCollection;
    }

    public async performSpatialAnalysis(analysisType: AnalysisType, prompt: string, contextLayers: MapLayer[]): Promise<AnalysisResult> {
        const contextGeoJSON = contextLayers.map(l => ({ name: l.name, data: l.data }));
        const fullPrompt = `Perform a GIS spatial analysis.
        Analysis Type: ${analysisType}
        User Request: "${prompt}"
        
        Context Layers:
        ${JSON.stringify(contextGeoJSON, null, 2)}
        
        Based on the user request and context layers, provide a summary of your findings. 
        If applicable, generate a new GeoJSON FeatureCollection representing the result of the analysis (e.g., buffer zones, intersection points).
        Also, provide key metrics if relevant (e.g., count of features, total area).
        
        Respond in the following JSON format:
        {
          "summary": "A detailed text summary of the analysis results.",
          "data": { /* A GeoJSON FeatureCollection, or null if not applicable */ },
          "metrics": { "key1": "value1", "key2": 123 }
        }
        `;

        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: { responseMimeType: "application/json" }
        });

        return JSON.parse(response.text) as AnalysisResult;
    }
}


// --- CUSTOM HOOKS ---

export function useNotifications(timeout: number = 5000) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((type: NotificationType, message: string) => {
        const id = generateId();
        setNotifications(prev => [...prev, { id, type, message }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, timeout);
    }, [timeout]);

    const dismissNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return { notifications, addNotification, dismissNotification };
}

type LayerAction =
    | { type: 'ADD_LAYER'; payload: Omit<MapLayer, 'id'> }
    | { type: 'REMOVE_LAYER'; payload: { id: string } }
    | { type: 'UPDATE_LAYER'; payload: { id: string; updates: Partial<MapLayer> } }
    | { type: 'REORDER_LAYERS'; payload: { startIndex: number; endIndex: number } };

function layersReducer(state: MapLayer[], action: LayerAction): MapLayer[] {
    switch (action.type) {
        case 'ADD_LAYER':
            const newLayer: MapLayer = { ...action.payload, id: generateId() };
            return [newLayer, ...state];
        case 'REMOVE_LAYER':
            return state.filter(layer => layer.id !== action.payload.id && !layer.isBaseLayer);
        case 'UPDATE_LAYER':
            return state.map(layer =>
                layer.id === action.payload.id ? { ...layer, ...action.payload.updates } : layer
            );
        case 'REORDER_LAYERS':
            const result = Array.from(state);
            const [removed] = result.splice(action.payload.startIndex, 1);
            result.splice(action.payload.endIndex, 0, removed);
            return result;
        default:
            return state;
    }
}

export function useLayersManager(initialLayers: MapLayer[] = []) {
    const [layers, dispatch] = useReducer(layersReducer, initialLayers);
    const [selectedFeature, setSelectedFeature] = useState<{ layerId: string; featureId: string | number } | null>(null);

    const addLayer = (layerData: Omit<MapLayer, 'id'>) => dispatch({ type: 'ADD_LAYER', payload: layerData });
    const removeLayer = (id: string) => dispatch({ type: 'REMOVE_LAYER', payload: { id } });
    const updateLayer = (id: string, updates: Partial<MapLayer>) => dispatch({ type: 'UPDATE_LAYER', payload: { id, updates } });
    const reorderLayers = (startIndex: number, endIndex: number) => dispatch({ type: 'REORDER_LAYERS', payload: { startIndex, endIndex } });

    const getFeatureById = useCallback((layerId: string, featureId: string | number) => {
        const layer = layers.find(l => l.id === layerId);
        return layer?.data.features.find(f => f.id === featureId);
    }, [layers]);

    const selectedFeatureData = useMemo(() => {
        if (!selectedFeature) return null;
        const feature = getFeatureById(selectedFeature.layerId, selectedFeature.featureId);
        const layer = layers.find(l => l.id === selectedFeature.layerId);
        if (!feature || !layer) return null;
        return { feature, layer };
    }, [selectedFeature, getFeatureById, layers]);
    
    return {
        layers,
        addLayer,
        removeLayer,
        updateLayer,
        reorderLayers,
        selectedFeature: selectedFeatureData,
        setSelectedFeature,
    };
}


// --- UI SUB-COMPONENTS ---

export const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 24 }) => (
    <svg 
        className="animate-spin text-white" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
        style={{ width: size, height: size }}
    >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const NotificationToast: React.FC<{ notification: Notification; onDismiss: (id: string) => void }> = ({ notification, onDismiss }) => {
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500',
    };
    return (
        <div className={`flex items-center justify-between p-4 mb-4 text-white rounded-lg shadow-lg ${colors[notification.type]}`}>
            <p>{notification.message}</p>
            <button onClick={() => onDismiss(notification.id)} className="ml-4 font-bold">X</button>
        </div>
    );
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

export const IconButton: React.FC<{ onClick: () => void; icon: React.ReactNode; label: string; active?: boolean }> = ({ onClick, icon, label, active = false }) => (
    <button
        onClick={onClick}
        aria-label={label}
        className={`p-3 rounded-lg ${active ? 'bg-cyan-600' : 'bg-gray-700'} hover:bg-cyan-700 transition-colors`}
        title={label}
    >
        {icon}
    </button>
);

// A simple GeoJSON to SVG Path converter
function geojsonToSvgPath(
  feature: GeoJSONFeature,
  projection: (lng: number, lat: number) => [number, number],
  style: LayerStyle
): React.ReactNode {
  const { geometry, id } = feature;
  
  const renderPath = (coords: number[][], pathType: string) => {
    const projected = coords.map(c => projection(c[0], c[1]));
    const d = projected.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
    return <path key={generateId()} d={d + (pathType === 'Polygon' ? 'Z' : '')} />;
  };

  switch (geometry.type) {
    case 'Point':
      const [px, py] = projection(geometry.coordinates[0], geometry.coordinates[1]);
      return <circle key={id} cx={px} cy={py} r={style.pointRadius || 5} />;
    case 'LineString':
      return renderPath(geometry.coordinates, 'LineString');
    case 'Polygon':
      return geometry.coordinates.map(ring => renderPath(ring, 'Polygon'));
    case 'MultiLineString':
      return geometry.coordinates.map(line => renderPath(line, 'LineString'));
    case 'MultiPolygon':
      return geometry.coordinates.flat().map(ring => renderPath(ring, 'Polygon'));
    default:
      return null;
  }
}

export const MapView: React.FC<{
    layers: MapLayer[];
    viewState: MapViewState;
    onViewStateChange: (newViewState: MapViewState) => void;
    onFeatureClick: (layerId: string, featureId: string | number) => void;
    selectedFeatureId: string | number | null;
}> = ({ layers, viewState, onViewStateChange, onFeatureClick, selectedFeatureId }) => {
    const mapRef = useRef<SVGSVGElement>(null);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState<{ x: number, y: number } | null>(null);

    const { width, height } = useMemo(() => {
        if (mapRef.current) {
            const rect = mapRef.current.getBoundingClientRect();
            return { width: rect.width, height: rect.height };
        }
        return { width: 800, height: 600 };
    }, [mapRef.current]);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, viewState.zoom - e.deltaY * 0.01));
        onViewStateChange({ ...viewState, zoom: newZoom });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsPanning(true);
        setPanStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isPanning || !panStart) return;
        const dx = e.clientX - panStart.x;
        const dy = e.clientY - panStart.y;
        setPanStart({ x: e.clientX, y: e.clientY });

        const TILE_SIZE = 512;
        const scale = Math.pow(2, viewState.zoom);
        const worldSize = TILE_SIZE * scale;
        
        const dLng = dx * 360 / worldSize;
        const dLat = dy * 360 / worldSize; // This is a simplification, should be Mercator-aware
        
        onViewStateChange({
            ...viewState,
            longitude: viewState.longitude - dLng,
            latitude: viewState.latitude + dLat,
        });
    };

    const handleMouseUp = () => {
        setIsPanning(false);
        setPanStart(null);
    };
    
    const scale = Math.pow(2, viewState.zoom);
    const [centerX, centerY] = project(viewState.longitude, viewState.latitude);
    const transform = `translate(${width/2}, ${height/2}) scale(${scale}) translate(${-centerX}, ${-centerY})`;

    return (
        <div className="w-full h-full bg-gray-900 cursor-grab" onMouseLeave={handleMouseUp}>
            <svg
                ref={mapRef}
                width="100%"
                height="100%"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className={isPanning ? 'cursor-grabbing' : 'cursor-grab'}
            >
                <g transform={transform}>
                    {layers.slice().reverse().filter(l => l.isVisible).map(layer => (
                        <g key={layer.id} id={layer.id}>
                            {layer.data.features.map(feature => {
                                const isSelected = feature.id === selectedFeatureId;
                                const style = { 
                                    ...layer.style, 
                                    strokeWidth: isSelected ? layer.style.strokeWidth * 2 : layer.style.strokeWidth,
                                    strokeColor: isSelected ? '#00FFFF' : layer.style.strokeColor,
                                };
                                return (
                                    <g
                                        key={feature.id}
                                        fill={style.fillColor}
                                        stroke={style.strokeColor}
                                        strokeWidth={style.strokeWidth / scale}
                                        fillOpacity={style.fillOpacity}
                                        strokeOpacity={style.strokeOpacity}
                                        onClick={() => feature.id && onFeatureClick(layer.id, feature.id)}
                                        className="cursor-pointer hover:opacity-80"
                                    >
                                        {geojsonToSvgPath(feature, project, style)}
                                    </g>
                                );
                            })}
                        </g>
                    ))}
                </g>
            </svg>
        </div>
    );
};

export const Sidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-96 h-full bg-gray-800/70 backdrop-blur-sm shadow-lg flex flex-col p-4 space-y-4 overflow-y-auto">
        {children}
    </div>
);

export const AIGeneratorPanel: React.FC<{ onGenerate: (prompt: string) => Promise<void>, isGenerating: boolean }> = ({ onGenerate, isGenerating }) => {
    const [prompt, setPrompt] = useState("a polygon for Central Park in New York City");
    const examples = [
        "all major airports in California as points",
        "a line string for the route of the Mississippi River",
        "a multipolygon of the islands of Hawaii",
        "a polygon for the city limits of Paris, France"
    ];

    const handleGenerateClick = () => {
        onGenerate(prompt);
    };

    return (
        <Card title="AI GeoJSON Generator">
            <p className="text-gray-400 mb-4 text-sm">Describe a location or shape, and our AI will generate a GeoJSON layer.</p>
            <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="w-full h-24 bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="e.g., A point for the Eiffel Tower"
            />
            <div className="text-xs text-gray-500 mt-2">Examples:</div>
            <div className="flex flex-wrap gap-1 mt-1">
                {examples.map(ex => (
                    <button key={ex} onClick={() => setPrompt(ex)} className="text-xs bg-gray-600 px-2 py-1 rounded hover:bg-gray-500 transition">
                        {ex.substring(0, 30)}...
                    </button>
                ))}
            </div>
            <button onClick={handleGenerateClick} disabled={isGenerating} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors flex items-center justify-center space-x-2">
                {isGenerating ? <><LoadingSpinner size={20} /><span>Generating...</span></> : 'Generate GeoJSON Layer'}
            </button>
        </Card>
    );
};

export const LayerManagerPanel: React.FC<{
    layers: MapLayer[];
    onLayerUpdate: (id: string, updates: Partial<MapLayer>) => void;
    onLayerDelete: (id: string) => void;
}> = ({ layers, onLayerUpdate, onLayerDelete }) => {
    const [editingLayerId, setEditingLayerId] = useState<string | null>(null);

    return (
        <Card title="Layer Manager">
            <ul className="space-y-2">
                {layers.map(layer => (
                    <li key={layer.id} className="bg-gray-700/50 p-3 rounded">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={layer.isVisible}
                                    onChange={e => onLayerUpdate(layer.id, { isVisible: e.target.checked })}
                                    className="form-checkbox h-5 w-5 bg-gray-800 border-gray-600 text-cyan-600 focus:ring-cyan-500"
                                />
                                {editingLayerId === layer.id ? (
                                    <input
                                        type="text"
                                        value={layer.name}
                                        onBlur={() => setEditingLayerId(null)}
                                        onChange={e => onLayerUpdate(layer.id, { name: e.target.value })}
                                        className="bg-gray-900 text-white p-1 rounded"
                                        autoFocus
                                    />
                                ) : (
                                    <span onDoubleClick={() => setEditingLayerId(layer.id)} className="text-white">{layer.name}</span>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <input 
                                    type="color" 
                                    value={layer.style.fillColor}
                                    onChange={e => onLayerUpdate(layer.id, { style: { ...layer.style, fillColor: e.target.value }})}
                                    className="w-6 h-6 rounded border-none bg-transparent"
                                />
                                {!layer.isBaseLayer && (
                                    <button onClick={() => onLayerDelete(layer.id)} className="text-red-500 hover:text-red-400">
                                        &times;
                                    </button>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

export const PropertyInspectorPanel: React.FC<{
    selectedFeature: { feature: GeoJSONFeature, layer: MapLayer } | null;
}> = ({ selectedFeature }) => {
    if (!selectedFeature) {
        return (
            <Card title="Property Inspector">
                <p className="text-gray-400">Click a feature on the map to see its properties.</p>
            </Card>
        );
    }
    
    const { feature, layer } = selectedFeature;

    return (
        <Card title={`Properties: ${feature.properties?.name || `Feature ${feature.id}`}`}>
            <div className="text-sm space-y-2 text-gray-300 font-mono">
                <p><strong>Layer:</strong> {layer.name}</p>
                <p><strong>Feature ID:</strong> {feature.id}</p>
                <p><strong>Geometry:</strong> {feature.geometry.type}</p>
                <h4 className="font-bold pt-2 border-t border-gray-700">Attributes</h4>
                <div className="max-h-48 overflow-auto bg-gray-900/50 p-2 rounded">
                    {Object.entries(feature.properties).map(([key, value]) => (
                        <div key={key}>
                            <strong>{key}:</strong> {JSON.stringify(value)}
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export const SpatialAnalysisPanel: React.FC<{
    layers: MapLayer[];
    onAnalysis: (type: AnalysisType, prompt: string, layerIds: string[]) => Promise<void>;
    isAnalyzing: boolean;
}> = ({ layers, onAnalysis, isAnalyzing }) => {
    const [prompt, setPrompt] = useState("Find features from 'Layer A' within 1km of features in 'Layer B'");
    const [analysisType, setAnalysisType] = useState<AnalysisType>('proximity');
    const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);
    
    const handleLayerToggle = (id: string) => {
        setSelectedLayerIds(prev => prev.includes(id) ? prev.filter(lId => lId !== id) : [...prev, id]);
    };
    
    return (
        <Card title="AI Spatial Analysis">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Analysis Type</label>
                    <select
                        value={analysisType}
                        onChange={(e) => setAnalysisType(e.target.value as AnalysisType)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
                    >
                        <option value="proximity">Proximity Analysis</option>
                        <option value="buffer">Buffer Generation</option>
                        <option value="intersection">Intersection Analysis</option>
                        <option value="data-enrichment">Data Enrichment</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Describe Analysis</label>
                    <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        rows={3}
                        className="w-full mt-1 bg-gray-700/50 p-2 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Context Layers</label>
                    <div className="mt-2 space-y-1 max-h-32 overflow-auto">
                        {layers.filter(l => !l.isBaseLayer).map(layer => (
                             <label key={layer.id} className="flex items-center space-x-2 text-sm text-gray-200">
                                <input
                                    type="checkbox"
                                    checked={selectedLayerIds.includes(layer.id)}
                                    onChange={() => handleLayerToggle(layer.id)}
                                    className="form-checkbox h-4 w-4 bg-gray-800 border-gray-600 text-cyan-600 focus:ring-cyan-500"
                                />
                                <span>{layer.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <button
                    onClick={() => onAnalysis(analysisType, prompt, selectedLayerIds)}
                    disabled={isAnalyzing || selectedLayerIds.length === 0}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                >
                    {isAnalyzing ? <><LoadingSpinner size={20} /><span>Analyzing...</span></> : 'Run Analysis'}
                </button>
            </div>
        </Card>
    );
};


const DemoBankGISView: React.FC = () => {
    // Retain original states for backward compatibility idea, though they are now part of a larger system.
    const [prompt, setPrompt] = useState("a polygon for Central Park in New York City");
    const [generatedGeoJson, setGeneratedGeoJson] = useState<any>(null); // Kept for potential direct display if needed
    
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const { notifications, addNotification, dismissNotification } = useNotifications();
    
    const initialLayers: MapLayer[] = [{
        id: 'base-world-map',
        name: 'World Base Map',
        data: WORLD_GEOJSON,
        isVisible: true,
        style: {
            fillColor: '#334155', // slate-700
            strokeColor: '#64748b', // slate-500
            strokeWidth: 0.5,
            fillOpacity: 1,
            strokeOpacity: 1,
        },
        isBaseLayer: true,
    }];
    
    const { layers, addLayer, removeLayer, updateLayer, selectedFeature, setSelectedFeature } = useLayersManager(initialLayers);
    const [viewState, setViewState] = useState<MapViewState>(INITIAL_MAP_VIEW_STATE);
    const [activeTab, setActiveTab] = useState<'generate' | 'layers' | 'inspect' | 'analyze'>('generate');

    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const aiService = useMemo(() => {
        const apiKey = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;
        if (!apiKey) {
            console.error("API_KEY environment variable not set!");
            addNotification('error', 'API Key not configured. AI features are disabled.');
            return null;
        }
        return new GISAIService(apiKey);
    }, [addNotification]);

    const handleGenerate = async (generationPrompt: string) => {
        if (!aiService) return;
        setIsLoading(true);
        try {
            const geojson = await aiService.generateGeoJSON(generationPrompt);
            setGeneratedGeoJson(geojson); // Also update legacy state

            // Ensure all features have a unique ID for selection
            geojson.features.forEach(f => f.id = f.id || generateId());

            const color = getRandomHexColor();
            addLayer({
                name: geojson.features[0]?.properties?.name || generationPrompt.substring(0, 30),
                data: geojson,
                isVisible: true,
                style: { ...DEFAULT_LAYER_STYLE, fillColor: color, strokeColor: '#FFFFFF' }
            });

            addNotification('success', 'Successfully generated GeoJSON layer.');

            // Fit map to new layer
            const mapElement = document.querySelector('.w-full.h-full.bg-gray-900'); // hacky way to get dimensions
            if (mapElement) {
                const { width, height } = mapElement.getBoundingClientRect();
                const bounds = calculateGeoJSONBounds(geojson);
                setViewState(fitBounds(bounds, { width, height }));
            }
        } catch (error) {
            console.error(error);
            addNotification('error', `Failed to generate GeoJSON: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAnalysis = async (type: AnalysisType, prompt: string, layerIds: string[]) => {
        if (!aiService) return;
        setIsAnalyzing(true);
        try {
            const contextLayers = layers.filter(l => layerIds.includes(l.id));
            const result = await aiService.performSpatialAnalysis(type, prompt, contextLayers);
            setAnalysisResult(result);
            setIsModalOpen(true);
            addNotification('success', 'Analysis completed successfully.');

            if (result.data && result.data.features.length > 0) {
                 result.data.features.forEach(f => f.id = f.id || generateId());
                 const color = getRandomHexColor();
                 addLayer({
                    name: `Analysis: ${prompt.substring(0, 20)}`,
                    data: result.data,
                    isVisible: true,
                    style: { ...DEFAULT_LAYER_STYLE, fillColor: color, strokeColor: '#FFFFFF' },
                 });
            }
        } catch (error) {
            console.error(error);
            addNotification('error', `Analysis failed: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFeatureClick = (layerId: string, featureId: string | number) => {
        setSelectedFeature({ layerId, featureId });
        setActiveTab('inspect');
    };

    const tabContent = () => {
        switch(activeTab) {
            case 'generate':
                return <AIGeneratorPanel onGenerate={handleGenerate} isGenerating={isLoading} />;
            case 'layers':
                return <LayerManagerPanel layers={layers} onLayerUpdate={updateLayer} onLayerDelete={removeLayer} />;
            case 'inspect':
                return <PropertyInspectorPanel selectedFeature={selectedFeature} />;
            case 'analyze':
                return <SpatialAnalysisPanel layers={layers} onAnalysis={handleAnalysis} isAnalyzing={isAnalyzing} />;
            default:
                return null;
        }
    };

    const iconForTab = (tab: string) => {
        switch (tab) {
            case 'generate': return <>🧠</>;
            case 'layers': return <>📚</>;
            case 'inspect': return <>🔍</>;
            case 'analyze': return <>🔬</>;
            default: return null;
        }
    };

    return (
        <div className="h-screen w-full flex flex-col bg-gray-900 text-white">
            <header className="bg-gray-800/50 backdrop-blur-sm p-4 text-center z-10 shadow-md">
                <h1 className="text-2xl font-bold tracking-wider">Demo Bank Advanced GIS Platform</h1>
            </header>
            <div className="flex flex-grow h-[calc(100vh-68px)] relative">
                <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
                   {['generate', 'layers', 'inspect', 'analyze'].map(tab => (
                       <IconButton
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            label={tab.charAt(0).toUpperCase() + tab.slice(1)}
                            icon={iconForTab(tab)}
                            active={activeTab === tab}
                       />
                   ))}
                </div>

                <div className={`absolute top-0 left-16 z-10 h-full transition-transform transform ${activeTab ? 'translate-x-0' : '-translate-x-full'}`}>
                   <Sidebar>
                     {tabContent()}
                   </Sidebar>
                </div>
                
                <main className="flex-grow h-full">
                    <MapView 
                        layers={layers}
                        viewState={viewState}
                        onViewStateChange={setViewState}
                        onFeatureClick={handleFeatureClick}
                        selectedFeatureId={selectedFeature?.feature.id || null}
                    />
                </main>
            </div>
            
            <div className="fixed top-20 right-4 z-50 w-80">
                {notifications.map(n => (
                    <NotificationToast key={n.id} notification={n} onDismiss={dismissNotification} />
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Analysis Result">
                <div className="space-y-4 text-gray-300">
                    <h4 className="font-bold text-lg text-white">Summary</h4>
                    <p>{analysisResult?.summary}</p>
                    {analysisResult?.metrics && (
                        <>
                           <h4 className="font-bold text-lg text-white pt-4 border-t border-gray-700">Metrics</h4>
                           <pre className="text-xs font-mono bg-gray-900/50 p-4 rounded">
                               {JSON.stringify(analysisResult.metrics, null, 2)}
                           </pre>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default DemoBankGISView;