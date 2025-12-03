// components/views/platform/TheNexusView.tsx
import React, { useContext, useEffect, useRef, useState, useReducer, useMemo, useCallback } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import type { NexusGraphData, NexusNode, NexusLink } from '../../../types';

declare const d3: any;

// --- CONSTANTS AND CONFIGURATION ---

export const GRAPH_SETTINGS = {
    simulation: {
        chargeStrength: -350,
        linkDistance: 120,
        alphaDecay: 0.02,
        velocityDecay: 0.4,
    },
    zoom: {
        minScale: 0.2,
        maxScale: 8,
    },
    node: {
        minRadius: 8,
        maxRadius: 30,
        strokeWidth: 2,
        hoverStrokeColor: '#00ffff', // Cyan
        selectedStrokeColor: '#f87171', // Red-400
    },
    link: {
        strokeWidth: 2,
        strokeOpacity: 0.6,
        highlightedOpacity: 1.0,
        color: '#999',
    },
    labels: {
        fontSize: '12px',
        fontColor: '#e5e7eb',
        strokeColor: '#111827',
        strokeWidth: '3px',
    },
    animation: {
        duration: 300,
    }
};

// --- TYPES AND INTERFACES ---

export type GraphFilterState = {
    nodeTypes: Set<string>;
    valueRange: [number, number];
    searchTerm: string;
};

export type GraphUIState = {
    selectedNodeId: string | null;
    hoveredNodeId: string | null;
    layoutAlgorithm: 'force' | 'radial' | 'tree';
    isContextMenuOpen: boolean;
    contextMenuPosition: { x: number; y: number };
    contextMenuNodeId: string | null;
};

export type GraphState = {
    filters: GraphFilterState;
    ui: GraphUIState;
};

export type GraphAction =
    | { type: 'TOGGLE_NODE_TYPE_FILTER'; payload: string }
    | { type: 'SET_VALUE_RANGE_FILTER'; payload: [number, number] }
    | { type: 'SET_SEARCH_TERM'; payload: string }
    | { type: 'CLEAR_FILTERS' }
    | { type: 'SELECT_NODE'; payload: string | null }
    | { type: 'HOVER_NODE'; payload: string | null }
    | { type: 'SET_LAYOUT_ALGORITHM'; payload: 'force' | 'radial' | 'tree' }
    | { type: 'OPEN_CONTEXT_MENU'; payload: { nodeId: string; x: number; y: number } }
    | { type: 'CLOSE_CONTEXT_MENU' };

// --- STATE MANAGEMENT (REDUCER) ---

export const initialGraphState: GraphState = {
    filters: {
        nodeTypes: new Set(),
        valueRange: [0, Infinity],
        searchTerm: '',
    },
    ui: {
        selectedNodeId: null,
        hoveredNodeId: null,
        layoutAlgorithm: 'force',
        isContextMenuOpen: false,
        contextMenuPosition: { x: 0, y: 0 },
        contextMenuNodeId: null,
    },
};

export function graphReducer(state: GraphState, action: GraphAction): GraphState {
    switch (action.type) {
        case 'TOGGLE_NODE_TYPE_FILTER': {
            const newTypes = new Set(state.filters.nodeTypes);
            if (newTypes.has(action.payload)) {
                newTypes.delete(action.payload);
            } else {
                newTypes.add(action.payload);
            }
            return { ...state, filters: { ...state.filters, nodeTypes: newTypes } };
        }
        case 'SET_VALUE_RANGE_FILTER':
            return { ...state, filters: { ...state.filters, valueRange: action.payload } };
        case 'SET_SEARCH_TERM':
            return { ...state, filters: { ...state.filters, searchTerm: action.payload } };
        case 'CLEAR_FILTERS':
            return {
                ...state,
                filters: initialGraphState.filters,
            };
        case 'SELECT_NODE':
            // Deselect if the same node is clicked again
            const newSelectedNodeId = state.ui.selectedNodeId === action.payload ? null : action.payload;
            return { ...state, ui: { ...state.ui, selectedNodeId: newSelectedNodeId } };
        case 'HOVER_NODE':
            return { ...state, ui: { ...state.ui, hoveredNodeId: action.payload } };
        case 'SET_LAYOUT_ALGORITHM':
            return { ...state, ui: { ...state.ui, layoutAlgorithm: action.payload } };
        case 'OPEN_CONTEXT_MENU':
            return {
                ...state,
                ui: {
                    ...state.ui,
                    isContextMenuOpen: true,
                    contextMenuPosition: { x: action.payload.x, y: action.payload.y },
                    contextMenuNodeId: action.payload.nodeId,
                },
            };
        case 'CLOSE_CONTEXT_MENU':
            return {
                ...state,
                ui: {
                    ...state.ui,
                    isContextMenuOpen: false,
                    contextMenuNodeId: null,
                },
            };
        default:
            return state;
    }
}

// --- UTILITY FUNCTIONS ---

/**
 * Filters the graph data based on the current filter state.
 * @param data The full NexusGraphData.
 * @param filters The current filter state.
 * @returns A new NexusGraphData object containing only the filtered nodes and links.
 */
export function applyGraphFilters(data: NexusGraphData, filters: GraphFilterState): NexusGraphData {
    const { nodeTypes, valueRange, searchTerm } = filters;
    const [minVal, maxVal] = valueRange;
    const lowercasedSearchTerm = searchTerm.toLowerCase();

    const filteredNodes = data.nodes.filter(node => {
        const typeMatch = nodeTypes.size === 0 || nodeTypes.has(node.type);
        const valueMatch = node.value >= minVal && node.value <= maxVal;
        const searchMatch = searchTerm === '' || node.label.toLowerCase().includes(lowercasedSearchTerm);
        return typeMatch && valueMatch && searchMatch;
    });

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

    const filteredLinks = data.links.filter(link => {
        const sourceId = typeof link.source === 'object' ? (link.source as NexusNode).id : link.source;
        const targetId = typeof link.target === 'object' ? (link.target as NexusNode).id : link.target;
        return filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId);
    });

    return { nodes: filteredNodes, links: filteredLinks };
}


/**
 * Retrieves a comprehensive list of all unique node types from the graph data.
 * @param data The NexusGraphData.
 * @returns An array of unique node type strings.
 */
export function getUniqueNodeTypes(data: NexusGraphData | null): string[] {
    if (!data) return [];
    const types = new Set(data.nodes.map(node => node.type));
    return Array.from(types).sort();
}

/**
 * Calculates the min and max value among all nodes in the graph.
 * @param data The NexusGraphData.
 * @returns A tuple [min, max], or [0, 100] if no data.
 */
export function getValueRange(data: NexusGraphData | null): [number, number] {
    if (!data || data.nodes.length === 0) return [0, 100];
    const values = data.nodes.map(n => n.value);
    return [Math.min(...values), Math.max(...values)];
}


// --- CUSTOM HOOKS ---

/**
 * A custom hook to manage the D3 simulation and rendering logic.
 * This encapsulates the complexity of D3, keeping the React component cleaner.
 */
export function useD3Graph(
    svgRef: React.RefObject<SVGSVGElement>,
    data: NexusGraphData,
    state: GraphState,
    dispatch: React.Dispatch<GraphAction>
) {
    const simulationRef = useRef<any>();

    useEffect(() => {
        if (!svgRef.current || !data) return;

        const svg = d3.select(svgRef.current);
        const parent = svg.node().parentElement;
        const width = parent?.clientWidth || 800;
        const height = 600;

        svg.attr('viewBox', [-width / 2, -height / 2, width, height]);

        // --- SIMULATION SETUP ---
        if (!simulationRef.current) {
            simulationRef.current = d3.forceSimulation()
                .force("link", d3.forceLink().id((d: any) => d.id))
                .force("charge", d3.forceManyBody())
                .force("center", d3.forceCenter(0, 0));
        }
        const simulation = simulationRef.current;
        
        // Update simulation parameters
        simulation
            .force("charge")
            .strength(GRAPH_SETTINGS.simulation.chargeStrength);
            
        simulation
            .force("link")
            .links(data.links)
            .distance(GRAPH_SETTINGS.simulation.linkDistance);

        // --- SVG ELEMENT GROUPS ---
        const g = svg.selectAll("g.graph-container").data([null]);
        const gEnter = g.enter().append("g").attr("class", "graph-container");
        gEnter.append("g").attr("class", "links-group");
        gEnter.append("g").attr("class", "nodes-group");

        const linkGroup = svg.select("g.links-group");
        const nodeGroup = svg.select("g.nodes-group");

        // Add arrowheads for directed links
        svg.append('defs').selectAll('marker')
            .data(['arrow'])
            .enter()
            .append('marker')
            .attr('id', String)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', (d: any) => 25) // Adjust based on node radius
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', GRAPH_SETTINGS.link.color);


        // --- LINKS ---
        const link = linkGroup
            .selectAll("line")
            .data(data.links, (d: any) => `${d.source.id}-${d.target.id}`);

        link.exit().remove();
        
        const linkEnter = link.enter()
            .append("line")
            .attr("stroke", GRAPH_SETTINGS.link.color)
            .attr("stroke-opacity", 0)
            .attr("stroke-width", GRAPH_SETTINGS.link.strokeWidth)
            .attr('marker-end', 'url(#arrow)');

        const linkUpdate = linkEnter.merge(link);
        
        linkUpdate.transition().duration(GRAPH_SETTINGS.animation.duration)
            .attr("stroke-opacity", GRAPH_SETTINGS.link.strokeOpacity);
        

        // --- NODES ---
        const node = nodeGroup
            .selectAll("g.node")
            .data(data.nodes, (d: any) => d.id);
            
        node.exit().transition().duration(GRAPH_SETTINGS.animation.duration).attr("transform", "scale(0)").remove();
        
        const nodeEnter = node.enter()
            .append("g")
            .attr("class", "node cursor-pointer")
            .call(drag(simulation))
            .on("click", (event: any, d: any) => {
                dispatch({ type: 'SELECT_NODE', payload: d.id });
                event.stopPropagation();
            })
            .on("mouseover", (event: any, d: any) => dispatch({ type: 'HOVER_NODE', payload: d.id }))
            .on("mouseout", () => dispatch({ type: 'HOVER_NODE', payload: null }))
            .on("contextmenu", (event: any, d: any) => {
                event.preventDefault();
                dispatch({ type: 'OPEN_CONTEXT_MENU', payload: { nodeId: d.id, x: event.clientX, y: event.clientY } });
            });

        nodeEnter.append("circle")
            .attr("r", (d: any) => d.value)
            .attr("fill", (d: any) => d.color)
            .attr("stroke", "#fff")
            .attr("stroke-width", GRAPH_SETTINGS.node.strokeWidth);
            
        nodeEnter.append("text")
            .attr("x", (d: any) => d.value + 5)
            .attr("y", "0.31em")
            .text((d: any) => d.label)
            .attr("fill", GRAPH_SETTINGS.labels.fontColor)
            .attr("font-size", GRAPH_SETTINGS.labels.fontSize)
            .attr("paint-order", "stroke")
            .attr("stroke", GRAPH_SETTINGS.labels.strokeColor)
            .attr("stroke-width", GRAPH_SETTINGS.labels.strokeWidth);
            
        const nodeUpdate = nodeEnter.merge(node);
        
        nodeUpdate.select('circle')
            .transition().duration(GRAPH_SETTINGS.animation.duration)
            .attr("r", (d: any) => d.value)
            .attr("fill", (d: any) => d.color);

        // --- INTERACTIVITY HIGHLIGHTING ---
        const { hoveredNodeId, selectedNodeId } = state.ui;
        const adjacentNodeIds = new Set();
        if (hoveredNodeId || selectedNodeId) {
            const focusNodeId = hoveredNodeId || selectedNodeId;
            data.links.forEach(l => {
                const sourceId = typeof l.source === 'object' ? (l.source as NexusNode).id : l.source;
                const targetId = typeof l.target === 'object' ? (l.target as NexusNode).id : l.target;
                if (sourceId === focusNodeId) adjacentNodeIds.add(targetId);
                if (targetId === focusNodeId) adjacentNodeIds.add(sourceId);
            });
        }
        
        nodeUpdate.attr("opacity", d => (hoveredNodeId || selectedNodeId) ? (d.id === (hoveredNodeId || selectedNodeId) || adjacentNodeIds.has(d.id) ? 1 : 0.2) : 1);
        linkUpdate.attr("stroke-opacity", d => {
            const sourceId = typeof d.source === 'object' ? (d.source as NexusNode).id : d.source;
            const targetId = typeof d.target === 'object' ? (d.target as NexusNode).id : d.target;
            const focusNodeId = hoveredNodeId || selectedNodeId;
            return focusNodeId ? (sourceId === focusNodeId || targetId === focusNodeId ? GRAPH_SETTINGS.link.highlightedOpacity : 0.1) : GRAPH_SETTINGS.link.strokeOpacity;
        });
        nodeUpdate.select('circle')
            .attr("stroke", d => d.id === selectedNodeId ? GRAPH_SETTINGS.node.selectedStrokeColor : (d.id === hoveredNodeId ? GRAPH_SETTINGS.node.hoverStrokeColor : "#fff"));
        

        // --- SIMULATION TICK & UPDATE ---
        simulation.nodes(data.nodes).on("tick", ticked);

        function ticked() {
            linkUpdate
                .attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);

            nodeUpdate.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
        }
        
        // --- DRAG LOGIC ---
        function drag(simulation: any) {
            function dragstarted(event: any, d: any) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }
            function dragged(event: any, d: any) {
                d.fx = event.x;
                d.fy = event.y;
            }
            function dragended(event: any, d: any) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }
            return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
        }

        // --- ZOOM/PAN LOGIC ---
        const zoom = d3.zoom()
            .scaleExtent([GRAPH_SETTINGS.zoom.minScale, GRAPH_SETTINGS.zoom.maxScale])
            .on("zoom", (event: any) => {
                svg.select("g.graph-container").attr("transform", event.transform);
            });

        svg.call(zoom as any);

        simulation.alpha(1).restart();
        
        return () => {
            simulation.stop();
        };

    }, [data, state.ui.hoveredNodeId, state.ui.selectedNodeId, dispatch, svgRef]);
}


// --- SUB-COMPONENTS ---

/**
 * A panel containing controls to filter and manipulate the graph view.
 */
export const GraphControls: React.FC<{
    state: GraphState;
    dispatch: React.Dispatch<GraphAction>;
    uniqueNodeTypes: string[];
    fullValueRange: [number, number];
}> = ({ state, dispatch, uniqueNodeTypes, fullValueRange }) => {
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value });
    };

    const handleNodeTypeToggle = (type: string) => {
        dispatch({ type: 'TOGGLE_NODE_TYPE_FILTER', payload: type });
    };

    return (
        <div className="w-72 flex-shrink-0 bg-gray-900 p-4 rounded-lg border border-gray-700 space-y-6">
            <h3 className="text-xl font-semibold text-white">Graph Controls</h3>

            {/* Search */}
            <div>
                <label htmlFor="search-node" className="block text-sm font-medium text-gray-300 mb-1">Search Node</label>
                <input
                    id="search-node"
                    type="text"
                    value={state.filters.searchTerm}
                    onChange={handleSearchChange}
                    placeholder="e.g., 'Amazon'"
                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                />
            </div>
            
            {/* Node Type Filter */}
            <div>
                <h4 className="text-md font-medium text-gray-300 mb-2">Node Types</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {uniqueNodeTypes.map(type => (
                        <div key={type} className="flex items-center">
                            <input
                                id={`filter-type-${type}`}
                                type="checkbox"
                                checked={state.filters.nodeTypes.has(type)}
                                onChange={() => handleNodeTypeToggle(type)}
                                className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-500 focus:ring-cyan-600"
                            />
                            <label htmlFor={`filter-type-${type}`} className="ml-3 text-sm text-gray-400 capitalize">{type}</label>
                        </div>
                    ))}
                </div>
            </div>

            {/* TODO: Add Value Range Slider */}

            {/* Layout Algorithm */}
            <div>
                 <h4 className="text-md font-medium text-gray-300 mb-2">Layout</h4>
                 <select 
                    value={state.ui.layoutAlgorithm} 
                    onChange={(e) => dispatch({ type: 'SET_LAYOUT_ALGORITHM', payload: e.target.value as any })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                 >
                     <option value="force">Force Directed</option>
                     <option value="radial">Radial</option>
                     <option value="tree">Tree</option>
                 </select>
            </div>


            {/* Actions */}
            <button
                onClick={() => dispatch({ type: 'CLEAR_FILTERS' })}
                className="w-full px-4 py-2 bg-red-800/50 text-red-200 rounded-md hover:bg-red-700/50 transition-colors"
            >
                Reset Filters
            </button>
        </div>
    );
};

/**
 * A detailed information panel for the selected node.
 */
export const NodeDetailPanel: React.FC<{
    node: NexusNode | null;
    links: NexusLink[];
    allNodes: NexusNode[];
    onClose: () => void;
    onSelectNeighbor: (nodeId: string) => void;
}> = ({ node, links, allNodes, onClose, onSelectNeighbor }) => {
    if (!node) return null;

    const connectedLinks = links.filter(l => {
        const sourceId = typeof l.source === 'object' ? (l.source as NexusNode).id : l.source;
        const targetId = typeof l.target === 'object' ? (l.target as NexusNode).id : l.target;
        return sourceId === node.id || targetId === node.id;
    });

    return (
        <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-md p-4 rounded-lg border border-gray-700 max-w-sm text-sm w-full shadow-2xl z-20">
            <div className="flex justify-between items-center mb-3">
                 <h4 className="font-bold text-lg text-cyan-300 flex items-center">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: node.color }}></span>
                    {node.label}
                </h4>
                <button onClick={onClose} className="text-gray-500 hover:text-white">&times;</button>
            </div>
           
            <div className="space-y-2 text-gray-300">
                <p><span className="font-semibold text-gray-400">Type:</span> <span className="capitalize">{node.type}</span></p>
                <p><span className="font-semibold text-gray-400">Value:</span> {node.value.toFixed(2)}</p>
                {/* Add more node properties here if they exist */}
            </div>
            
            <hr className="my-3 border-gray-700" />
            
            <h5 className="text-gray-300 font-semibold mb-2">Connections ({connectedLinks.length}):</h5>
            <ul className="list-none space-y-2 max-h-60 overflow-y-auto pr-2">
                {connectedLinks.map(l => {
                    const sourceId = typeof l.source === 'object' ? (l.source as NexusNode).id : l.source;
                    const otherNodeId = sourceId === node.id ? (typeof l.target === 'object' ? (l.target as NexusNode).id : l.target) : sourceId;
                    const otherNode = allNodes.find(n => n.id === otherNodeId);
                    if (!otherNode) return null;

                    return (
                        <li 
                            key={`${sourceId}-${typeof l.target === 'object' ? (l.target as NexusNode).id : l.target}`}
                            className="p-2 bg-gray-800/50 rounded-md hover:bg-gray-700/50 cursor-pointer transition-colors"
                            onClick={() => onSelectNeighbor(otherNode.id)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: otherNode.color }}></span>
                                    <span className="text-gray-200">{otherNode.label}</span>
                                </div>
                                <span className="text-xs text-gray-500 italic">{l.relationship}</span>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
}

/**
 * A context menu for performing actions on a node.
 */
export const NodeContextMenu: React.FC<{
    state: GraphUIState;
    dispatch: React.Dispatch<GraphAction>;
    onIsolate: (nodeId: string) => void;
}> = ({ state, dispatch, onIsolate }) => {
    useEffect(() => {
        const handleClickOutside = () => dispatch({ type: 'CLOSE_CONTEXT_MENU' });
        if (state.isContextMenuOpen) {
            window.addEventListener('click', handleClickOutside);
        }
        return () => window.removeEventListener('click', handleClickOutside);
    }, [state.isContextMenuOpen, dispatch]);

    if (!state.isContextMenuOpen || !state.contextMenuNodeId) return null;

    return (
        <div 
            className="absolute z-50 bg-gray-800 border border-gray-600 rounded-md shadow-lg text-white text-sm py-2"
            style={{ top: state.contextMenuPosition.y, left: state.contextMenuPosition.x }}
            onClick={(e) => e.stopPropagation()}
        >
            <ul className="list-none m-0 p-0">
                <li 
                    className="px-4 py-2 hover:bg-cyan-600/50 cursor-pointer"
                    onClick={() => {
                        dispatch({ type: 'SELECT_NODE', payload: state.contextMenuNodeId });
                        dispatch({ type: 'CLOSE_CONTEXT_MENU' });
                    }}
                >
                    Select Node
                </li>
                 <li className="px-4 py-2 hover:bg-cyan-600/50 cursor-pointer" onClick={() => {
                     // Placeholder for a real action
                     alert(`Centering on node ${state.contextMenuNodeId}`);
                     dispatch({ type: 'CLOSE_CONTEXT_MENU' });
                 }}>Center View</li>
                 <li className="px-4 py-2 hover:bg-cyan-600/50 cursor-pointer" onClick={() => {
                     // Placeholder for another real action
                     alert(`Finding path from node ${state.contextMenuNodeId}`);
                     dispatch({ type: 'CLOSE_CONTEXT_MENU' });
                 }}>Find Path...</li>
                 <hr className="border-gray-600 my-1" />
                 <li className="px-4 py-2 hover:bg-red-600/50 cursor-pointer" onClick={() => {
                     // Placeholder for a destructive action
                     alert(`Hiding node ${state.contextMenuNodeId}`);
                     dispatch({ type: 'CLOSE_CONTEXT_MENU' });
                 }}>Hide Node</li>
            </ul>
        </div>
    );
};


/**
 * The main NexusGraph component.
 */
const NexusGraph: React.FC<{ 
    data: NexusGraphData; 
    state: GraphState;
    dispatch: React.Dispatch<GraphAction>;
}> = ({ data, state, dispatch }) => {
    const ref = useRef<SVGSVGElement>(null);
    useD3Graph(ref, data, state, dispatch);

    return (
        <div className="relative h-[700px] bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
            <svg ref={ref} width="100%" height="100%"></svg>
        </div>
    );
};

// --- MAIN VIEW COMPONENT ---

const TheNexusView: React.FC = () => {
    const context = useContext(DataContext);
    const [fullGraphData, setFullGraphData] = useState<NexusGraphData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [state, dispatch] = useReducer(graphReducer, initialGraphState);

    useEffect(() => {
        if (context) {
            // Simulate fetching and processing data
            setTimeout(() => {
                const data = context.getNexusData();
                setFullGraphData(data);
                setIsLoading(false);
            }, 1000);
        }
    }, [context]);

    const filteredGraphData = useMemo(() => {
        if (!fullGraphData) return { nodes: [], links: [] };
        return applyGraphFilters(fullGraphData, state.filters);
    }, [fullGraphData, state.filters]);

    const uniqueNodeTypes = useMemo(() => getUniqueNodeTypes(fullGraphData), [fullGraphData]);
    const fullValueRange = useMemo(() => getValueRange(fullGraphData), [fullGraphData]);

    const selectedNode = useMemo(() => {
        if (!state.ui.selectedNodeId || !fullGraphData) return null;
        return fullGraphData.nodes.find(n => n.id === state.ui.selectedNodeId) || null;
    }, [state.ui.selectedNodeId, fullGraphData]);

    const handleSelectNeighbor = useCallback((nodeId: string) => {
        dispatch({ type: 'SELECT_NODE', payload: nodeId });
    }, []);

    const handleCloseDetails = useCallback(() => {
        dispatch({ type: 'SELECT_NODE', payload: null });
    }, []);

    if (!context) {
        return <div>Loading context...</div>;
    }

    if (isLoading) {
        return <Card title="The Nexus" isLoading={true}><></></Card>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">The Nexus</h2>
            <Card 
                title="Map of Emergent Relationships" 
                subtitle="This is an interactive, living visualization of the connections between your financial activities."
            >
                <div className="flex flex-col lg:flex-row gap-6 mt-4">
                    <GraphControls 
                        state={state} 
                        dispatch={dispatch} 
                        uniqueNodeTypes={uniqueNodeTypes}
                        fullValueRange={fullValueRange}
                    />
                    <div className="flex-grow relative min-w-0">
                        {filteredGraphData ? (
                            <NexusGraph 
                                data={filteredGraphData} 
                                state={state}
                                dispatch={dispatch}
                            />
                        ) : <div>No data to display.</div>}
                        <NodeDetailPanel 
                            node={selectedNode}
                            links={fullGraphData?.links || []}
                            allNodes={fullGraphData?.nodes || []}
                            onClose={handleCloseDetails}
                            onSelectNeighbor={handleSelectNeighbor}
                        />
                         <NodeContextMenu state={state.ui} dispatch={dispatch} onIsolate={() => {}} />
                    </div>
                </div>
            </Card>
        </div>
    );
};


export default TheNexusView;
