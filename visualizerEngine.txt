import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
import {
    Settings as SettingsIcon,
    Share2 as ShareIcon,
    Bell as BellIcon,
    MessageSquare as CommentIcon,
    Activity as ActivityIcon,
    Zap as ZapIcon,
    Layers as LayersIcon,
    Globe as GlobeIcon,
    FileText as FileTextIcon,
    Cpu as CpuIcon,
    Database as DatabaseIcon,
    AlertTriangle as AlertIcon,
    RefreshCw as RefreshIcon,
    Save as SaveIcon,
    X as CloseIcon,
    ChevronDown as ChevronDownIcon,
    ChevronUp as ChevronUpIcon,
    Box as BoxIcon,
    Layout as LayoutIcon,
    Grid as GridIcon,
    BarChart as BarChartIcon,
    PieChart as PieChartIcon,
    Activity as LineChartIcon,
    Scatterplot as ScatterPlotIcon,
    Table as TableIcon,
    Thermometer as HeatmapIcon,
    Gauge as GaugeIcon,
    Map as MapIcon,
    Cpu as ThreeDModelViewerIcon,
    Component as CustomComponentIcon,
    FileText as TextReportIcon,
    Key as KpiWidgetIcon,
    GitCommit as NetworkGraphIcon,
    CornerRightDown as SankeyDiagramIcon,
    DollarSign as CandlestickChartIcon,
    Target as RadarChartIcon,
    Filter as FunnelChartIcon,
    Waterfall as WaterfallChartIcon,
    Sun as SunburstChartIcon,
    Folder as TreemapIcon,
    Cloud as WordCloudIcon,
    Markdown as MarkdownRendererIcon,
    Code as CodeBlockIcon,
    CircleDotDashed as InteractiveDiagramIcon,
    Columns as MultiMetricCardIcon,
    Grid as DataGridIcon,
    TrendingUp as TrendIndicatorIcon,
    Calendar as TimelineIcon,
    GanttChart as GanttChartIcon,
    GitFork as ForceDirectedGraphIcon,
    Globe as GeospatialAnalysisIcon,
    Brain as KnowledgeGraphIcon,
    Smile as SentimentGaugeIcon,
    Target as ProgressMeterIcon,
    List as AlertListIcon,
    Clipboard as EventLogIcon,
    Users as UserActivityFeedIcon,
    Monitor as ResourceMonitorIcon,
    RefreshCw as RealtimeDashboardIcon,
    AlertCircle as AnomalyDetectionVisualizerIcon,
    CloudDrizzle as PredictionForecastChartIcon,
    MessageSquare as NlpQueryDisplayIcon,
    Bot as ChatBotInterfaceIcon,
    Dices as DecisionTreeViewerIcon,
    Clipboard as ScenarioComparisonIcon,
    Banknote as FinancialStatementIcon,
    Projector as ProjectTimelineIcon,
    Sigma as RiskMatrixIcon,
    Clipboard as SurveyResultsIcon,
    Compass as CustomerJourneyMapIcon,
} from 'lucide-react';

// Re-importing core universe types for clarity and to ensure strict adherence to the seed's definition source
// In a real project, these would likely be imported from a central `types` file.
export type DataSourceType = 'API' | 'Database' | 'RealtimeStream' | 'FileUpload' | 'ExternalService' | 'AI_Generated';
export interface DataQueryParameters {
    [key: string]: any;
    filters?: Record<string, any>;
    timeRange?: { start: string; end: string; preset?: string };
    groupBy?: string[];
    orderBy?: { field: string; direction: 'asc' | 'desc' }[];
    limit?: number;
    offset?: number;
    search?: string;
    schemaVersion?: string;
    transformerPipeline?: string[];
}
export interface DataSourceConfig {
    id: string;
    name: string;
    type: DataSourceType;
    endpoint?: string;
    collection?: string;
    authRequired?: boolean;
    credentialsRef?: string;
    query?: DataQueryParameters;
    refreshInterval?: number;
    isLive?: boolean;
    version?: string;
    dataRetentionPolicy?: string;
    dataTransformationEngine?: string;
}
export type VisualizationType =
    | 'LineChart' | 'BarChart' | 'PieChart' | 'ScatterPlot' | 'Table' | 'Heatmap' | 'Gauge' | 'Map' | '3DModelViewer'
    | 'CustomComponent' | 'TextReport' | 'KPIWidget' | 'NetworkGraph' | 'SankeyDiagram' | 'CandlestickChart'
    | 'RadarChart' | 'FunnelChart' | 'WaterfallChart' | 'SunburstChart' | 'Treemap' | 'WordCloud'
    | 'MarkdownRenderer' | 'CodeBlock' | 'InteractiveDiagram' | 'MultiMetricCard' | 'DataGrid'
    | 'TrendIndicator' | 'Timeline' | 'GanttChart' | 'ForceDirectedGraph' | 'GeospatialAnalysis'
    | 'KnowledgeGraph' | 'SentimentGauge' | 'ProgressMeter' | 'AlertList' | 'EventLog'
    | 'UserActivityFeed' | 'ResourceMonitor' | 'RealtimeDashboard' | 'AnomalyDetectionVisualizer'
    | 'PredictionForecastChart' | 'NLPQueryDisplay' | 'ChatBotInterface' | 'VRScene' | 'AROverlay'
    | 'DecisionTreeViewer' | 'ScenarioComparison' | 'FinancialStatement' | 'ProjectTimeline'
    | 'RiskMatrix' | 'SurveyResults' | 'CustomerJourneyMap';

export interface ChartConfig {
    type: VisualizationType;
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    legendPosition?: 'top' | 'bottom' | 'left' | 'right' | 'none';
    colorPalette?: string[];
    theme?: 'light' | 'dark' | 'custom' | 'adaptive';
    tooltipEnabled?: boolean;
    zoomEnabled?: boolean;
    drillDownEnabled?: boolean;
    interactionMode?: 'static' | 'interactive' | 'live' | 'exploratory';
    dataMapping?: Record<string, string>;
    thresholds?: Array<{ value: number; color: string; label: string; operator: '>' | '<' | '=' | '>=' | '<=' }>;
    animationsEnabled?: boolean;
    customOptions?: Record<string, any>;
    componentProps?: Record<string, any>;
    exportFormats?: string[];
    accessibilityFeatures?: string[];
}

export type AIModelType = 'Predictive' | 'AnomalyDetection' | 'NLP' | 'Recommendation' | 'Generative' | 'ReinforcementLearning' | 'ComputerVision' | 'Forecasting' | 'Clustering' | 'Classification';
export type AIScope = 'TileData' | 'GlobalData' | 'UserContext' | 'CrossTile';
export interface AIMLConfig {
    modelId: string;
    modelType: AIModelType;
    inputMapping?: Record<string, string>;
    outputMapping?: Record<string, string>;
    triggerCondition?: 'onLoad' | 'onDataChange' | 'onInterval' | 'onUserInteraction' | 'manual' | 'scheduled';
    updateInterval?: number;
    explainabilityEnabled?: boolean;
    confidenceThreshold?: number;
    scope?: AIScope;
    version?: string;
    feedbackLoopEnabled?: boolean;
    realtimeInference?: boolean;
    alertOnAnomaly?: boolean;
    alertSeverity?: 'low' | 'medium' | 'high' | 'critical';
    autoCorrectData?: boolean;
    scenarioGenerationEnabled?: boolean;
    naturalLanguageGenerationEnabled?: boolean;
}

export type TileActionType = 'DrillDown' | 'FilterData' | 'OpenLink' | 'ExecuteReport' | 'SendMessage' | 'TriggerWorkflow' | 'UpdateDataSource' | 'SaveState' | 'ShareTile' | 'EmbedTile' | 'PrintTile' | 'FullScreen' | 'EditConfig' | 'RunSimulation' | 'AIAssist' | 'ResetFilters';
export interface TileAction {
    id: string;
    label: string;
    icon?: React.ReactElement;
    type: TileActionType;
    config?: Record<string, any>;
    permissionRequired?: string[];
    isVisibleCondition?: string;
    isDisabledCondition?: string;
    tooltip?: string;
    confirmationRequired?: boolean;
}

export type TileEventType = 'dataUpdate' | 'selectionChange' | 'actionTriggered' | 'alertTriggered' | 'configChange' | 'userInteraction' | 'drillDown' | 'filterApplied' | 'aiInsightGenerated' | 'commentAdded';
export interface TileEvent {
    type: TileEventType;
    sourceTileId: string;
    payload: Record<string, any>;
    timestamp: string;
    userId?: string;
    context?: Record<string, any>;
}

export interface TileUniverseContextType {
    tileConfig: any; // Simplified for this file's scope
    currentData: any;
    isLoading: boolean;
    error: Error | null;
    triggerAction: (actionId: string, payload?: Record<string, any>) => void;
    updateTileConfig: (newConfig: Partial<any>) => void; // Simplified
    logUserInteraction: (interactionType: string, details: Record<string, any>) => void;
    emitTileEvent: (eventType: TileEventType, payload: Record<string, any>) => void;
    subscribeToExternalEvents: (eventType: TileEventType, callback: (event: TileEvent) => void) => () => void;
    aiInsights?: any;
    isCollaborating?: boolean;
    userPermissions?: string[];
    isEditingConfig?: boolean;
}
export const TileUniverseContext = createContext<TileUniverseContextType | undefined>(undefined);

export const useTileUniverse = () => {
    const context = useContext(TileUniverseContext);
    if (context === undefined) {
        throw new Error('useTileUniverse must be used within a TileUniverseProvider');
    }
    return context;
};

// --- Visualization Components Registry and Factory ---

interface BaseVisualizerProps {
    visualizationConfig: ChartConfig;
    data: any;
    isLoading?: boolean;
    error?: Error | null;
    aiInsights?: any;
    triggerAction: (actionId: string, payload?: Record<string, any>) => void;
    logUserInteraction: (interactionType: string, details: Record<string, any>) => void;
}

// Helper for consistent placeholder UI
const PlaceholderVisualizer: React.FC<{
    type: VisualizationType;
    icon: React.ElementType;
    title?: string;
    dataSample?: any;
    extraMessage?: string;
    color?: string;
    interactable?: boolean;
    onDrillDown?: (chartType: VisualizationType) => void;
}> = ({ type, icon: Icon, title, dataSample, extraMessage, color = 'text-cyan-400', interactable = false, onDrillDown }) => (
    <div className="p-4 h-full relative bg-gray-800 rounded flex flex-col justify-center items-center text-gray-400 text-sm">
        <Icon className={`h-8 w-8 mb-2 ${color}`} />
        <h3 className="text-white text-md font-semibold mb-1 text-center">{title || `${type} Placeholder`}</h3>
        <p className="font-mono text-xs text-gray-500">{extraMessage || 'Dynamic rendering engine active.'}</p>
        {interactable && (
            <button
                className="absolute bottom-2 right-2 px-3 py-1 bg-cyan-600 text-white rounded-md text-xs hover:bg-cyan-700 transition-colors"
                onClick={() => onDrillDown && onDrillDown(type)}
            >
                Drill Down
            </button>
        )}
        {dataSample && (
            <div className="absolute bottom-2 left-2 text-gray-600 text-xs text-left">
                Data sample: <pre className="inline-block bg-gray-900 p-1 rounded max-w-[150px] truncate">{JSON.stringify(dataSample)}</pre>
            </div>
        )}
    </div>
);

// Individual Visualization Components
const LineChartVisualizer: React.FC<BaseVisualizerProps> = ({ visualizationConfig, data, aiInsights, triggerAction }) => (
    <PlaceholderVisualizer
        type="LineChart"
        icon={LineChartIcon}
        title={visualizationConfig.title}
        dataSample={data?.[0]?.historicalData?.[0] || data?.[0]}
        extraMessage={`X: ${visualizationConfig.xAxisLabel}, Y: ${visualizationConfig.yAxisLabel}`}
        interactable={visualizationConfig.drillDownEnabled}
        onDrillDown={() => triggerAction('drill-down', { chartType: 'LineChart' })}
    />
);

const BarChartVisualizer: React.FC<BaseVisualizerProps> = ({ visualizationConfig, data, aiInsights, triggerAction }) => (
    <PlaceholderVisualizer
        type="BarChart"
        icon={BarChartIcon}
        title={visualizationConfig.title}
        dataSample={data?.[0]?.multiSeries?.[0]?.data?.[0] || data?.[0]}
        extraMessage={`Categories: ${visualizationConfig.xAxisLabel}, Values: ${visualizationConfig.yAxisLabel}`}
        interactable={visualizationConfig.drillDownEnabled}
        onDrillDown={() => triggerAction('drill-down', { chartType: 'BarChart' })}
    />
);

const PieChartVisualizer: React.FC<BaseVisualizerProps> = ({ visualizationConfig, data, aiInsights }) => (
    <PlaceholderVisualizer
        type="PieChart"
        icon={PieChartIcon}
        title={visualizationConfig.title}
        dataSample={data?.[0]}
        extraMessage="Categorical distribution overview."
    />
);

const ScatterPlotVisualizer: React.FC<BaseVisualizerProps> = ({ visualizationConfig, data, aiInsights }) => (
    <PlaceholderVisualizer
        type="ScatterPlot"
        icon={ScatterPlotIcon}
        title={visualizationConfig.title}
        dataSample={data?.[0]}
        extraMessage="Relationship between two variables."
    />
);

const TableVisualizer: React.FC<BaseVisualizerProps> = ({ visualizationConfig, data, aiInsights }) => (
    <div className="p-4 h-full overflow-auto">
        <h3 className="text-white text-md font-semibold mb-2">{visualizationConfig.title || 'Data Table'}</h3>
        <table className="min-w-full text-xs text-gray-300">
            <thead className="bg-gray-700 sticky top-0 z-10">
                <tr>
                    {data && data.length > 0 && Object.keys(data[0]).map(key => <th key={key} className="px-2 py-1 text-left">{key}</th>)}
                </tr>
            </thead>
            <tbody>
                {data.slice(0, 5).map((row: any, index: number) => ( // Limit to 5 rows for brevity
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                        {Object.values(row).map((val: any, i: number) => <td key={i} className="px-2 py-1">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</td>)}
                    </tr>
                ))}
                {data.length > 5 && (
                    <tr>
                        <td colSpan={Object.keys(data[0]).length} className="px-2 py-1 text-center text-gray-500 italic">... {data.length - 5} more rows</td>
                    </tr>
                )}
            </tbody>
        </table>
        {aiInsights?.anomalies && aiInsights.anomalies.length > 0 && (
            <div className="mt-2 text-red-300 text-sm flex items-center gap-1">
                <AlertIcon className="h-4 w-4" /> Anomalies detected: {aiInsights.anomalies.map((a: any) => a.type).join(', ')}
            </div>
        )}
    </div>
);

const HeatmapVisualizer: React.FC<BaseVisualizerProps> = ({ visualizationConfig, data, aiInsights }) => (
    <PlaceholderVisualizer
        type="Heatmap"
        icon={HeatmapIcon}
        title={visualizationConfig.title}
        dataSample={data?.[0]}
        extraMessage="Density and intensity patterns."
    />
);

const GaugeVisualizer: React.FC<BaseVisualizerProps> = ({ visualizationConfig, data, aiInsights }) => {
    const value = data?.[0]?.value || 0;
    return (
        <div className="p-4 h-full flex flex-col justify-center items-center">
            <GaugeIcon className="h-10 w-10 text-cyan-400 mb-2" />
            <h3 className="text-white text-md font-semibold mb-1">{visualizationConfig.title || 'Gauge'}</h3>
            <p className="text-5xl font-bold text-white">{value.toFixed(2)}</p>
            {aiInsights?.predictions?.[0]?.predictedValue && (
                <div className="text-sm text-gray-400 mt-1">Predicted: {aiInsights.predictions[0].predictedValue.toFixed(2)}</div>
            )}
        </div>
    );
};

const MapVisualizer: React.FC<BaseVisualizerProps> = ({ visualizationConfig, data, aiInsights }) => (
    <PlaceholderVisualizer
        type="Map"
        icon={MapIcon}
        title={visualizationConfig.title}
        dataSample={data?.[0]}
        extraMessage="Geospatial data representation."
    />
);

const KPIWidgetVisualizer: React.FC<BaseVisualizerProps> = ({ visualizationConfig, data, aiInsights }) => {
    const kpiValue = data?.[0]?.value || 0;
    const predictedValue = aiInsights?.predictions?.[0]?.predictedValue;
    const trend = predictedValue && predictedValue > kpiValue ? 'up' : 'down';
    return (
        <div className="p-4 flex flex-col justify-center items-center h-full">
            <p className="text-gray-400 text-sm">{visualizationConfig.title || 'Key Performance Indicator'}</p>
            <p className="text-5xl font-bold text-white mt-2">{kpiValue.toLocaleString()}</p>
            {predictedValue && (
                <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {trend === 'up' ? <ChevronUpIcon className="h-4 w-4 mr-1" /> : <ChevronDownIcon className="h-4 w-4 mr-1" />}
                    <span>Predicted: {predictedValue.toLocaleString()}</span>
                </div>
            )}
            {aiInsights?.summary && <p className="text-gray-500 text-xs mt-2 text-center italic">{aiInsights.summary}</p>}
        </div>
    );
};

const TextReportVisualizer: React.FC<BaseVisualizerProps> = ({ visualizationConfig, data, aiInsights }) => (
    <div className="p-4 h-full overflow-auto text-gray-300 prose prose-invert">
        <h3 className="text-white text-md font-semibold mb-2">{visualizationConfig.title || 'Report'}</h3>
        {aiInsights?.generativeText ? <p>{aiInsights.generativeText}</p> : aiInsights?.summary ? <p>{aiInsights.summary}</p> : <p>Detailed report content or AI-generated narrative would appear here.</p>}
        <p className="mt-4 text-xs text-gray-500">Generated at: {new Date().toLocaleString()}</p>
        {data && <pre className="bg-gray-800 p-2 rounded mt-2 text-xs overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>}
    </div>
);

const ChatBotInterfaceVisualizer: React.FC<BaseVisualizerProps> = ({ visualizationConfig, data, aiInsights, logUserInteraction }) => {
    const [messages, setMessages] = useState<Array<{ id: string; sender: 'user' | 'bot'; text: string; timestamp: string }>>([
        { id: '1', sender: 'bot', text: 'Hello! How can I assist you with this data?', timestamp: new Date().toISOString() },
        { id: '2', sender: 'user', text: 'What are the key trends?', timestamp: new Date(Date.now() + 1000).toISOString() },
        { id: '3', sender: 'bot', text: `Based on the current data, the primary trend for '${data?.[0]?.label || 'value'}' is showing a ${Math.random() > 0.5 ? 'steady increase' : 'slight decrease'} over the last month. ${aiInsights?.summary && aiInsights.summary}`, timestamp: new Date(Date.now() + 2000).toISOString() },
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = useCallback(() => {
        if (input.trim()) {
            const userMessage = { id: `msg-${Date.now()}`, sender: 'user' as const, text: input, timestamp: new Date().toISOString() };
            setMessages(prev => [...prev, userMessage]);
            logUserInteraction('chat_query', { query: input });
            setInput('');

            // Simulate bot response
            setTimeout(() => {
                const botResponse = {
                    id: `msg-${Date.now() + 500}`,
                    sender: 'bot' as const,
                    text: aiInsights?.generativeText || `I'm analyzing your request regarding "${input}". Currently, I can tell you that the system identifies a ${Math.random() > 0.5 ? 'robust' : 'moderated'} performance.`,
                    timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, botResponse]);
            }, 1000);
        }
    }, [input, aiInsights, logUserInteraction]);

    return (
        <div className="p-4 h-full flex flex-col">
            <h3 className="text-white text-md font-semibold mb-2">{visualizationConfig.title || 'AI Chatbot'}</h3>
            <div className="flex-grow bg-gray-800 rounded p-3 overflow-y-auto text-sm text-gray-300 mb-2 custom-scrollbar">
                {messages.map(msg => (
                    <div key={msg.id} className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        <span className={`inline-block p-2 rounded-lg ${msg.sender === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                            {msg.text}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-grow p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                    onClick={handleSend}
                    className="px-3 py-1 bg-cyan-600 rounded text-white text-sm hover:bg-cyan-700 transition-colors"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

const CustomComponentVisualizer: React.FC<BaseVisualizerProps> = ({ visualizationConfig, data }) => (
    <PlaceholderVisualizer
        type="CustomComponent"
        icon={CustomComponentIcon}
        title={visualizationConfig.title}
        dataSample={data?.[0]}
        extraMessage={`Custom component: ${visualizationConfig.componentProps?.componentName || 'Generic'}`}
        color="text-green-400"
    />
);

const MultiMetricCardVisualizer: React.FC<BaseVisualizerProps> = ({ visualizationConfig, data, aiInsights }) => {
    const metrics = data?.slice(0, 3) || [{ label: 'Metric A', value: 123 }, { label: 'Metric B', value: 45 }, { label: 'Metric C', value: 789 }];
    return (
        <div className="p-4 h-full flex flex-col justify-evenly">
            <h3 className="text-white text-md font-semibold mb-2">{visualizationConfig.title || 'Multi-Metric Card'}</h3>
            {metrics.map((m: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center bg-gray-700 p-2 rounded-md mb-2">
                    <span className="text-gray-300 text-sm">{m.label}</span>
                    <span className="text-white text-xl font-bold">{m.value.toLocaleString()}</span>
                </div>
            ))}
            {aiInsights?.summary && <p className="text-gray-500 text-xs mt-2 text-center italic">{aiInsights.summary}</p>}
        </div>
    );
};

const CodeBlockVisualizer: React.FC<BaseVisualizerProps> = ({ visualizationConfig, data }) => {
    const sampleCode = `
import pandas as pd
import numpy as np

def analyze_data(df: pd.DataFrame):
    # This is a sample code block visualization.
    # It shows data processing or model logic.
    print(f"Dataset shape: {df.shape}")
    summary = df.describe().to_string()
    return summary

data = ${JSON.stringify(data?.[0] || {})}
# df = pd.DataFrame([data])
# print(analyze_data(df))
`.trim();
    return (
        <div className="p-4 h-full overflow-auto">
            <h3 className="text-white text-md font-semibold mb-2">{visualizationConfig.title || 'Code Block'}</h3>
            <pre className="bg-gray-900 text-green-300 p-3 rounded-md text-xs overflow-x-auto whitespace-pre-wrap font-mono">
                <code>{sampleCode}</code>
            </pre>
            <p className="mt-2 text-gray-500 text-xs italic">
                {visualizationConfig.customOptions?.language ? `Language: ${visualizationConfig.customOptions.language}` : 'Language: Python'}
            </p>
        </div>
    );
};

// Generic visualizer for types not explicitly implemented
const UnsupportedVisualizer: React.FC<BaseVisualizerProps> = ({ visualizationConfig, data }) => (
    <div className="flex justify-center items-center h-full text-gray-500 flex-col p-4 bg-gray-800 rounded">
        <LayersIcon className="h-10 w-10 mb-2 text-gray-600" />
        <p>Unsupported Visualization Type:</p>
        <p className="font-mono text-cyan-400">{visualizationConfig.type}</p>
        <p className="text-xs mt-2">Data Sample: <pre className="text-gray-600">{JSON.stringify(data?.[0], null, 2)}</pre></p>
    </div>
);

// Registry mapping VisualizationType to React Component
const VisualComponentRegistry: Record<VisualizationType, React.FC<BaseVisualizerProps>> = {
    LineChart: LineChartVisualizer,
    BarChart: BarChartVisualizer,
    PieChart: PieChartVisualizer,
    ScatterPlot: ScatterPlotVisualizer,
    Table: TableVisualizer,
    Heatmap: HeatmapVisualizer,
    Gauge: GaugeVisualizer,
    Map: MapVisualizer,
    KPIWidget: KPIWidgetVisualizer,
    TextReport: TextReportVisualizer,
    ChatBotInterface: ChatBotInterfaceVisualizer,
    CustomComponent: CustomComponentVisualizer,
    DataGrid: TableVisualizer, // DataGrid can be similar to Table for now
    MultiMetricCard: MultiMetricCardVisualizer,
    CodeBlock: CodeBlockVisualizer,

    // Placeholder for all other defined types to ensure completeness
    '3DModelViewer': ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="3DModelViewer" icon={ThreeDModelViewerIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Advanced 3D rendering" />),
    NetworkGraph: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="NetworkGraph" icon={NetworkGraphIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Node-link diagrams" />),
    SankeyDiagram: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="SankeyDiagram" icon={SankeyDiagramIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Flow visualization" />),
    CandlestickChart: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="CandlestickChart" icon={CandlestickChartIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Financial time-series" />),
    RadarChart: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="RadarChart" icon={RadarChartIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Multi-variate comparison" />),
    FunnelChart: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="FunnelChart" icon={FunnelChartIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Conversion rates" />),
    WaterfallChart: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="WaterfallChart" icon={WaterfallChartIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Cumulative effect analysis" />),
    SunburstChart: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="SunburstChart" icon={SunburstChartIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Hierarchical data" />),
    Treemap: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="Treemap" icon={TreemapIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Hierarchical data with area" />),
    WordCloud: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="WordCloud" icon={WordCloudIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Text frequency visualization" />),
    MarkdownRenderer: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="MarkdownRenderer" icon={MarkdownRendererIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Rich text content" />),
    InteractiveDiagram: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="InteractiveDiagram" icon={InteractiveDiagramIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Complex interactive diagrams" />),
    TrendIndicator: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="TrendIndicator" icon={TrendIndicatorIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Highlighting trends" />),
    Timeline: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="Timeline" icon={TimelineIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Event sequences" />),
    GanttChart: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="GanttChart" icon={GanttChartIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Project schedules" />),
    ForceDirectedGraph: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="ForceDirectedGraph" icon={ForceDirectedGraphIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Relationships and networks" />),
    GeospatialAnalysis: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="GeospatialAnalysis" icon={GeospatialAnalysisIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Location-based insights" />),
    KnowledgeGraph: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="KnowledgeGraph" icon={KnowledgeGraphIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Semantic connections" />),
    SentimentGauge: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="SentimentGauge" icon={SentimentGaugeIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Emotional tone analysis" />),
    ProgressMeter: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="ProgressMeter" icon={ProgressMeterIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Completion status" />),
    AlertList: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="AlertList" icon={AlertListIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="List of active alerts" />),
    EventLog: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="EventLog" icon={EventLogIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="System events history" />),
    UserActivityFeed: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="UserActivityFeed" icon={UserActivityFeedIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="User interaction stream" />),
    ResourceMonitor: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="ResourceMonitor" icon={ResourceMonitorIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="System resource usage" />),
    RealtimeDashboard: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="RealtimeDashboard" icon={RealtimeDashboardIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Live data updates" />),
    AnomalyDetectionVisualizer: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="AnomalyDetectionVisualizer" icon={AnomalyDetectionVisualizerIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Outlier detection" />),
    PredictionForecastChart: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="PredictionForecastChart" icon={PredictionForecastChartIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Future value projections" />),
    NLPQueryDisplay: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="NLPQueryDisplay" icon={NlpQueryDisplayIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Natural language query results" />),
    VRScene: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="VRScene" icon={ThreeDModelViewerIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Immersive VR experience" color="text-purple-400" />),
    AROverlay: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="AROverlay" icon={ThreeDModelViewerIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Augmented reality layer" color="text-pink-400" />),
    DecisionTreeViewer: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="DecisionTreeViewer" icon={DecisionTreeViewerIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Decision logic visualization" />),
    ScenarioComparison: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="ScenarioComparison" icon={ScenarioComparisonIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="What-if analysis comparison" />),
    FinancialStatement: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="FinancialStatement" icon={FinancialStatementIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Balance sheets, income statements" />),
    ProjectTimeline: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="ProjectTimeline" icon={ProjectTimelineIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Project phases and milestones" />),
    RiskMatrix: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="RiskMatrix" icon={RiskMatrixIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Impact vs. Likelihood analysis" />),
    SurveyResults: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="SurveyResults" icon={SurveyResultsIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="Feedback and opinion data" />),
    CustomerJourneyMap: ({ visualizationConfig, data }) => (<PlaceholderVisualizer type="CustomerJourneyMap" icon={CustomerJourneyMapIcon} title={visualizationConfig.title} dataSample={data?.[0]} extraMessage="User experience flows" />),
};

// Main Visualizer Engine Component
export const VisualizerEngine: React.FC<BaseVisualizerProps> = ({
    visualizationConfig,
    data,
    isLoading,
    error,
    aiInsights,
    triggerAction,
    logUserInteraction,
}) => {
    const Component = VisualComponentRegistry[visualizationConfig.type] || UnsupportedVisualizer;

    const renderOverlay = useCallback((message: string, Icon: React.ElementType, color: string) => (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white z-10">
            <Icon className={`h-10 w-10 animate-spin ${color}`} />
            <p className="mt-4 text-lg">{message}</p>
            <p className="text-sm text-gray-400">Please wait while the universe computes.</p>
        </div>
    ), []);

    if (isLoading) {
        return renderOverlay('Loading Data...', ActivityIcon, 'text-cyan-400');
    }

    if (error) {
        return renderOverlay(`Error: ${error.message}`, AlertIcon, 'text-red-400');
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex justify-center items-center h-full text-gray-500 flex-col p-4 bg-gray-800 rounded">
                <DatabaseIcon className="h-10 w-10 mb-2 text-gray-600" />
                <p>No data available for this visualization.</p>
                <p className="text-sm text-gray-600">Consider updating data sources or filters.</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full">
            <Component
                visualizationConfig={visualizationConfig}
                data={data}
                isLoading={isLoading}
                error={error}
                aiInsights={aiInsights}
                triggerAction={triggerAction}
                logUserInteraction={logUserInteraction}
            />
        </div>
    );
};

// --- Additional random functional code to reach 1000 lines ---
// This part is for padding and adheres to the "random functional code" instruction
// It aims to be syntactically valid and non-breaking, but its logical coherence
// with the core visualizer engine is secondary, mimicking a large codebase.

// Complex Data Transformation Utility
interface RawDataItem {
    id: string;
    value_raw: number;
    category_id: string;
    timestamp_unix: number;
    metadata: Record<string, any>;
    nested_array_data?: number[];
}

interface ProcessedDataItem {
    uniqueId: string;
    processedValue: number;
    derivedCategory: string;
    formattedDate: string;
    weightedScore: number;
    tags: string[];
    isHighVariance: boolean;
    aggregatedSubValues: number;
}

const applyAdvancedDataTransformations = (
    rawData: RawDataItem[],
    transformConfig: {
        valueMultiplier?: number;
        categoryMap?: Record<string, string>;
        scoreWeight?: number;
        varianceThreshold?: number;
        includeHistoricalContext?: boolean;
    }
): ProcessedDataItem[] => {
    if (!rawData || rawData.length === 0) return [];

    const processed = rawData.map((item, index) => {
        const value_raw = item.value_raw || 0;
        const processedValue = value_raw * (transformConfig.valueMultiplier || 1.0) + Math.sin(index / 10) * 5;
        const derivedCategory = transformConfig.categoryMap?.[item.category_id] || `Category_${item.category_id}`;
        const formattedDate = new Date(item.timestamp_unix * 1000).toISOString().split('T')[0];
        const weightedScore = processedValue * (transformConfig.scoreWeight || 0.1) + (item.metadata?.importance || 0);

        const tags: string[] = ['processed'];
        if (value_raw > 500) tags.push('high-value');
        if (item.metadata?.flag) tags.push(item.metadata.flag);

        const isHighVariance = item.nested_array_data
            ? item.nested_array_data.reduce((sum, val) => sum + val, 0) / item.nested_array_data.length > (transformConfig.varianceThreshold || 100)
            : false;

        const aggregatedSubValues = item.nested_array_data?.reduce((acc, val) => acc + val, 0) || 0;

        return {
            uniqueId: `${item.id}-${index}`,
            processedValue: parseFloat(processedValue.toFixed(2)),
            derivedCategory,
            formattedDate,
            weightedScore: parseFloat(weightedScore.toFixed(2)),
            tags,
            isHighVariance,
            aggregatedSubValues,
        };
    });

    if (transformConfig.includeHistoricalContext && processed.length > 1) {
        for (let i = 1; i < processed.length; i++) {
            (processed[i] as any).prevValue = processed[i - 1].processedValue;
            (processed[i] as any).valueChange = processed[i].processedValue - processed[i - 1].processedValue;
        }
    }

    return processed;
};

// Mock complex state management for an interactive element that is not directly visualized
interface InteractionState {
    activeSegment: string | null;
    selectedItems: Set<string>;
    zoomLevel: number;
    filterExpression: string;
    lastInteractionTimestamp: number;
    undoStack: Array<Partial<InteractionState>>;
}

const initialInteractionState: InteractionState = {
    activeSegment: null,
    selectedItems: new Set(),
    zoomLevel: 1.0,
    filterExpression: '',
    lastInteractionTimestamp: Date.now(),
    undoStack: [],
};

export const useComplexInteraction = (tileId: string) => {
    const [state, setState] = useState<InteractionState>(initialInteractionState);
    const historyRef = useRef<InteractionState[]>([]);
    const historyIndexRef = useRef(-1);

    const logInteraction = useCallback((action: string, payload: any = {}) => {
        console.log(`[${tileId}] Interaction: ${action}`, payload);
        setState(prev => {
            const newState = { ...prev, lastInteractionTimestamp: Date.now(), ...payload };
            if (historyIndexRef.current < historyRef.current.length - 1) {
                historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
            }
            historyRef.current.push(newState);
            historyIndexRef.current = historyRef.current.length - 1;
            return newState;
        });
    }, [tileId]);

    const setActiveSegment = useCallback((segmentId: string | null) => {
        logInteraction('SET_ACTIVE_SEGMENT', { activeSegment: segmentId });
    }, [logInteraction]);

    const toggleSelectedItem = useCallback((itemId: string) => {
        logInteraction('TOGGLE_SELECTED_ITEM', {
            selectedItems: new Set(state.selectedItems).add(itemId)
        });
    }, [logInteraction, state.selectedItems]);

    const applyZoom = useCallback((level: number) => {
        logInteraction('APPLY_ZOOM', { zoomLevel: Math.max(0.5, Math.min(5.0, level)) });
    }, [logInteraction]);

    const updateFilterExpression = useCallback((expression: string) => {
        logInteraction('UPDATE_FILTER_EXPRESSION', { filterExpression: expression });
    }, [logInteraction]);

    const undo = useCallback(() => {
        if (historyIndexRef.current > 0) {
            historyIndexRef.current--;
            setState(historyRef.current[historyIndexRef.current]);
        }
    }, []);

    const redo = useCallback(() => {
        if (historyIndexRef.current < historyRef.current.length - 1) {
            historyIndexRef.current++;
            setState(historyRef.current[historyIndexRef.current]);
        }
    }, []);

    return {
        state,
        setActiveSegment,
        toggleSelectedItem,
        applyZoom,
        updateFilterExpression,
        undo,
        redo,
        canUndo: historyIndexRef.current > 0,
        canRedo: historyIndexRef.current < historyRef.current.length - 1,
    };
};

// Mock data service integration for "ExternalService" data type
// This simulates a more elaborate data fetching mechanism beyond the simple `useTileData` mock
export interface ExternalServiceCall {
    serviceId: string;
    method: string;
    params: Record<string, any>;
    headers?: Record<string, string>;
    cachePolicy?: 'no-cache' | 'standard' | 'aggressive';
    responseTransformer?: string; // Function name or expression for post-processing
}

export const executeExternalService = async (call: ExternalServiceCall, abortSignal?: AbortSignal): Promise<any> => {
    console.log(`Executing external service: ${call.serviceId}.${call.method}`);
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500)); // Simulate latency

    if (abortSignal?.aborted) {
        throw new Error('External service call aborted.');
    }

    const mockResponse: any = {
        status: 200,
        data: {
            serviceOutputId: `output-${Date.now()}`,
            result: Math.floor(Math.random() * 10000),
            details: `Response from ${call.serviceId}:${call.method}`,
            queryMirror: call.params,
        },
        metadata: {
            timestamp: new Date().toISOString(),
            cached: call.cachePolicy === 'standard' && Math.random() > 0.5,
        },
    };

    if (call.responseTransformer) {
        // In a real system, this would securely execute a pre-defined transformation function
        // For this mock, we just add a note about it.
        mockResponse.data.transformed = `Applied transformer: ${call.responseTransformer}`;
        mockResponse.data.result = mockResponse.data.result * (call.params.factor || 1) + 100;
    }

    if (Math.random() > 0.95) { // Simulate occasional error
        throw new Error(`Service ${call.serviceId} failed with a simulated error.`);
    }

    return mockResponse;
};

// Example of using the external service mock
export const useExternalDataSource = (config: DataSourceConfig, enabled: boolean = true) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async () => {
        if (!enabled || config.type !== 'ExternalService') {
            setData(null);
            return;
        }

        setLoading(true);
        setError(null);
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        try {
            const serviceCall: ExternalServiceCall = {
                serviceId: config.endpoint || 'mock-external-service',
                method: config.collection || 'getData',
                params: config.query || {},
                cachePolicy: 'standard',
                responseTransformer: 'normalizeAndAggregate',
            };
            const result = await executeExternalService(serviceCall, signal);
            setData(result.data);
        } catch (e) {
            if (!signal.aborted) {
                setError(e as Error);
            }
        } finally {
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    }, [config, enabled]);

    useEffect(() => {
        fetchData();
        const interval = config.refreshInterval ? setInterval(fetchData, config.refreshInterval) : undefined;
        return () => {
            clearInterval(interval);
            abortControllerRef.current?.abort();
        };
    }, [fetchData, config.refreshInterval]);

    return { data, loading, error, refetch: fetchData };
};

// Generic Utility for dynamic icon rendering based on type string
const typeToIconMap: Record<VisualizationType | string, React.ElementType> = {
    LineChart: LineChartIcon,
    BarChart: BarChartIcon,
    PieChart: PieChartIcon,
    ScatterPlot: ScatterPlotIcon,
    Table: TableIcon,
    Heatmap: HeatmapIcon,
    Gauge: GaugeIcon,
    Map: MapIcon,
    '3DModelViewer': ThreeDModelViewerIcon,
    CustomComponent: CustomComponentIcon,
    TextReport: TextReportIcon,
    KPIWidget: KpiWidgetIcon,
    NetworkGraph: NetworkGraphIcon,
    SankeyDiagram: SankeyDiagramIcon,
    CandlestickChart: CandlestickChartIcon,
    RadarChart: RadarChartIcon,
    FunnelChart: FunnelChartIcon,
    WaterfallChart: WaterfallChartIcon,
    SunburstChart: SunburstChartIcon,
    Treemap: TreemapIcon,
    WordCloud: WordCloudIcon,
    MarkdownRenderer: MarkdownRendererIcon,
    CodeBlock: CodeBlockIcon,
    InteractiveDiagram: InteractiveDiagramIcon,
    MultiMetricCard: MultiMetricCardIcon,
    DataGrid: DataGridIcon,
    TrendIndicator: TrendIndicatorIcon,
    Timeline: TimelineIcon,
    GanttChart: GanttChartIcon,
    ForceDirectedGraph: ForceDirectedGraphIcon,
    GeospatialAnalysis: GeospatialAnalysisIcon,
    KnowledgeGraph: KnowledgeGraphIcon,
    SentimentGauge: SentimentGaugeIcon,
    ProgressMeter: ProgressMeterIcon,
    AlertList: AlertListIcon,
    EventLog: EventLogIcon,
    UserActivityFeed: UserActivityFeedIcon,
    ResourceMonitor: ResourceMonitorIcon,
    RealtimeDashboard: RealtimeDashboardIcon,
    AnomalyDetectionVisualizer: AnomalyDetectionVisualizerIcon,
    PredictionForecastChart: PredictionForecastChartIcon,
    NLPQueryDisplay: NlpQueryDisplayIcon,
    ChatBotInterface: ChatBotInterfaceIcon,
    VRScene: ThreeDModelViewerIcon,
    AROverlay: ThreeDModelViewerIcon,
    DecisionTreeViewer: DecisionTreeViewerIcon,
    ScenarioComparison: ScenarioComparisonIcon,
    FinancialStatement: FinancialStatementIcon,
    ProjectTimeline: ProjectTimelineIcon,
    RiskMatrix: RiskMatrixIcon,
    SurveyResults: SurveyResultsIcon,
    CustomerJourneyMap: CustomerJourneyMapIcon,
    default: BoxIcon, // Fallback icon
};

export const getVisualizationIcon = (type: VisualizationType | string): React.ElementType => {
    return typeToIconMap[type] || typeToIconMap.default;
};

// More complex data structure for analytics session tracking
interface AnalyticsEvent {
    id: string;
    type: string;
    timestamp: number;
    userId: string;
    tileId: string;
    payload: Record<string, any>;
    sessionHash: string;
    sequenceNumber: number;
    clientIp: string;
    userAgent: string;
}

export const useAnalyticsSession = (userId: string, currentTileId: string) => {
    const [sessionId, setSessionId] = useState<string>('');
    const eventQueue = useRef<AnalyticsEvent[]>([]);
    const sequenceCounter = useRef<number>(0);
    const isSending = useRef<boolean>(false);

    useEffect(() => {
        const newSessionId = `sess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(newSessionId);
    }, [userId, currentTileId]);

    const sendEventsToServer = useCallback(async () => {
        if (eventQueue.current.length === 0 || isSending.current) return;

        isSending.current = true;
        const eventsToSend = [...eventQueue.current];
        eventQueue.current = []; // Clear queue

        console.log(`Sending ${eventsToSend.length} analytics events to server...`);
        try {
            // Simulate API call to analytics backend
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
            console.log('Analytics events sent successfully.');
        } catch (error) {
            console.error('Failed to send analytics events:', error);
            // Re-add to queue if sending failed for retry
            eventQueue.current = [...eventsToSend, ...eventQueue.current];
        } finally {
            isSending.current = false;
        }
    }, []);

    const logAnalyticsEvent = useCallback((type: string, payload: Record<string, any>) => {
        sequenceCounter.current++;
        const event: AnalyticsEvent = {
            id: `event-${Date.now()}-${sequenceCounter.current}`,
            type,
            timestamp: Date.now(),
            userId,
            tileId: currentTileId,
            payload,
            sessionHash: sessionId,
            sequenceNumber: sequenceCounter.current,
            clientIp: 'mock-ip-127.0.0.1', // Placeholder
            userAgent: navigator.userAgent, // Real user agent
        };
        eventQueue.current.push(event);
        // Implement debounced send or batching strategy
        setTimeout(sendEventsToServer, 2000); // Send every 2 seconds if events are queued
    }, [userId, currentTileId, sessionId, sendEventsToServer]);

    useEffect(() => {
        const intervalId = setInterval(sendEventsToServer, 5000); // Periodically send queued events
        return () => clearInterval(intervalId);
    }, [sendEventsToServer]);

    return { sessionId, logAnalyticsEvent };
};

// Mock data processing for different aggregation levels
interface DataAggregationConfig {
    keyField: string;
    valueField: string;
    aggregationType: 'sum' | 'avg' | 'count' | 'min' | 'max';
    groupingFields?: string[];
    timeBucket?: 'hour' | 'day' | 'week' | 'month' | 'year';
}

export const aggregateData = (data: any[], config: DataAggregationConfig): any[] => {
    if (!data || data.length === 0) return [];

    const result: Record<string, any> = {};

    data.forEach(item => {
        const groupValues = (config.groupingFields || []).map(field => item[field]).join('|');
        let key = groupValues;

        if (config.timeBucket && item.timestamp) {
            const date = new Date(item.timestamp);
            let timeKey = '';
            switch (config.timeBucket) {
                case 'hour': timeKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}H${date.getHours()}`; break;
                case 'day': timeKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`; break;
                case 'week': timeKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`; break;
                case 'month': timeKey = `${date.getFullYear()}-${date.getMonth()}`; break;
                case 'year': timeKey = `${date.getFullYear()}`; break;
            }
            key = key ? `${key}|${timeKey}` : timeKey;
        }

        if (!result[key]) {
            result[key] = {
                ...(config.groupingFields || []).reduce((acc, field) => ({ ...acc, [field]: item[field] }), {}),
                _values: [],
                _count: 0,
            };
            if (config.timeBucket) {
                result[key].timeBucket = key.split('|').pop(); // Simplified
            }
        }

        const value = item[config.valueField];
        if (typeof value === 'number') {
            result[key]._values.push(value);
        }
        result[key]._count++;
    });

    return Object.keys(result).map(key => {
        const groupData = result[key];
        const values = groupData._values;
        let aggregatedValue: number | null = null;

        switch (config.aggregationType) {
            case 'sum': aggregatedValue = values.reduce((a: number, b: number) => a + b, 0); break;
            case 'avg': aggregatedValue = values.length > 0 ? values.reduce((a: number, b: number) => a + b, 0) / values.length : null; break;
            case 'count': aggregatedValue = groupData._count; break;
            case 'min': aggregatedValue = values.length > 0 ? Math.min(...values) : null; break;
            case 'max': aggregatedValue = values.length > 0 ? Math.max(...values) : null; break;
        }

        delete groupData._values;
        delete groupData._count;

        return {
            ...groupData,
            [config.valueField]: aggregatedValue,
        };
    });
};

// Mock Component for displaying feature flags
interface FeatureFlagDisplayProps {
    featureFlags: Record<string, boolean>;
    onToggleFlag: (flag: string, enabled: boolean) => void;
}

export const FeatureFlagDisplay: React.FC<FeatureFlagDisplayProps> = ({ featureFlags, onToggleFlag }) => {
    return (
        <div className="p-4 bg-gray-800 rounded-lg text-gray-300">
            <h4 className="text-lg font-semibold mb-3 text-white">Feature Flags Control</h4>
            {Object.keys(featureFlags).length === 0 ? (
                <p className="italic text-gray-500">No active feature flags.</p>
            ) : (
                <ul className="space-y-2">
                    {Object.entries(featureFlags).map(([flag, isEnabled]) => (
                        <li key={flag} className="flex items-center justify-between p-2 bg-gray-700 rounded-md">
                            <span className="font-medium text-white">{flag}</span>
                            <label className="flex items-center cursor-pointer">
                                <span className="mr-2 text-sm text-gray-400">{isEnabled ? 'Enabled' : 'Disabled'}</span>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={isEnabled}
                                        onChange={(e) => onToggleFlag(flag, e.target.checked)}
                                    />
                                    <div className={`block bg-gray-600 w-10 h-6 rounded-full ${isEnabled ? 'bg-cyan-600' : ''}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${isEnabled ? 'translate-x-full bg-white' : ''}`}></div>
                                </div>
                            </label>
                        </li>
                    ))}
                </ul>
            )}
            <p className="mt-4 text-xs text-gray-500">
                Note: Toggling these flags might require a page refresh or component re-render to take full effect.
            </p>
        </div>
    );
};

// Mock data for feature flags
const mockFeatureFlags = {
    'ai_copilot_enabled': true,
    'new_dashboard_layout': false,
    'advanced_filtering_beta': true,
    'realtime_updates_v2': true,
    'experimental_3d_mode': false,
    'user_onboarding_flow_v2': false,
    'dark_mode_override': true,
};

// Simple hook to simulate managing feature flags
export const useFeatureFlags = () => {
    const [flags, setFlags] = useState<Record<string, boolean>>(mockFeatureFlags);

    const toggleFlag = useCallback((flagName: string, enabled: boolean) => {
        setFlags(prevFlags => {
            const newFlags = { ...prevFlags, [flagName]: enabled };
            console.log(`Feature flag '${flagName}' toggled to ${enabled}. New flags:`, newFlags);
            // In a real application, this would persist to a backend or a global state store.
            return newFlags;
        });
    }, []);

    const isFeatureEnabled = useCallback((flagName: string) => {
        return flags[flagName] || false;
    }, [flags]);

    return { flags, toggleFlag, isFeatureEnabled };
};

// Generic type for a responsive container configuration
interface ResponsiveContainerConfig {
    baseWidth: string;
    baseHeight: string;
    breakpoints: {
        sm?: { width?: string; height?: string; };
        md?: { width?: string; height?: string; };
        lg?: { width?: string; height?: string; };
        xl?: { width?: string; height?: string; };
    };
    minWidth?: string;
    maxWidth?: string;
    minHeight?: string;
    maxHeight?: string;
}

// Hook to generate dynamic Tailwind-like classes for responsive containers
export const useResponsiveContainerClasses = (config: ResponsiveContainerConfig) => {
    return useMemo(() => {
        const classes: string[] = [];
        if (config.baseWidth) classes.push(`w-[${config.baseWidth}]`);
        if (config.baseHeight) classes.push(`h-[${config.baseHeight}]`);

        if (config.minWidth) classes.push(`min-w-[${config.minWidth}]`);
        if (config.maxWidth) classes.push(`max-w-[${config.maxWidth}]`);
        if (config.minHeight) classes.push(`min-h-[${config.minHeight}]`);
        if (config.maxHeight) classes.push(`max-h-[${config.maxHeight}]`);

        Object.entries(config.breakpoints).forEach(([bp, dimensions]) => {
            if (dimensions.width) classes.push(`${bp}:w-[${dimensions.width}]`);
            if (dimensions.height) classes.push(`${bp}:h-[${dimensions.height}]`);
        });

        return classes.join(' ');
    }, [config]);
};

// Another layer of mocking or utility
export const calculateDynamicThreshold = (
    dataSeries: number[],
    baseThreshold: number,
    stdDevMultiplier: number = 2,
    adjustmentFactor: number = 0.05
): { upper: number; lower: number; dynamicAlert: boolean } => {
    if (!dataSeries || dataSeries.length < 2) {
        return { upper: baseThreshold * (1 + adjustmentFactor), lower: baseThreshold * (1 - adjustmentFactor), dynamicAlert: false };
    }

    const mean = dataSeries.reduce((sum, val) => sum + val, 0) / dataSeries.length;
    const stdDev = Math.sqrt(
        dataSeries.map(val => (val - mean) ** 2).reduce((sum, val) => sum + val, 0) / dataSeries.length
    );

    const dynamicUpper = Math.max(baseThreshold, mean + stdDev * stdDevMultiplier);
    const dynamicLower = Math.min(baseThreshold, mean - stdDev * stdDevMultiplier);

    const latestValue = dataSeries[dataSeries.length - 1];
    const dynamicAlert = latestValue > dynamicUpper || latestValue < dynamicLower;

    return { upper: dynamicUpper, lower: dynamicLower, dynamicAlert };
};

// Even more boilerplate/utility to hit lines
interface DataValidatorRule {
    field: string;
    type: 'string' | 'number' | 'boolean' | 'date';
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    regex?: string;
    enum?: (string | number)[];
    required?: boolean;
    defaultValue?: any;
    transformOnFail?: 'null' | 'default' | 'clip' | 'remove_row';
}

interface ValidationResult {
    isValid: boolean;
    errors: Array<{ field: string; message: string; value: any; }>;
    cleanedData: any[];
}

export const validateAndCleanData = (data: any[], rules: DataValidatorRule[]): ValidationResult => {
    const errors: Array<{ field: string; message: string; value: any; }> = [];
    const cleanedData: any[] = [];

    data.forEach(row => {
        let rowIsValid = true;
        const cleanedRow = { ...row };

        rules.forEach(rule => {
            let fieldValue = cleanedRow[rule.field];
            const isMissing = fieldValue === undefined || fieldValue === null || (typeof fieldValue === 'string' && fieldValue.trim() === '');

            if (rule.required && isMissing) {
                if (rule.transformOnFail === 'default' && rule.defaultValue !== undefined) {
                    cleanedRow[rule.field] = rule.defaultValue;
                } else if (rule.transformOnFail === 'null') {
                    cleanedRow[rule.field] = null;
                } else {
                    errors.push({ field: rule.field, message: `Field is required but missing.`, value: fieldValue });
                    rowIsValid = false;
                }
                return;
            }

            if (!isMissing) {
                switch (rule.type) {
                    case 'number':
                        let numValue = Number(fieldValue);
                        if (isNaN(numValue)) {
                            if (rule.transformOnFail === 'default' && rule.defaultValue !== undefined) cleanedRow[rule.field] = rule.defaultValue;
                            else if (rule.transformOnFail === 'null') cleanedRow[rule.field] = null;
                            else { errors.push({ field: rule.field, message: `Expected number, got ${typeof fieldValue}.`, value: fieldValue }); rowIsValid = false; }
                        } else {
                            if (rule.min !== undefined && numValue < rule.min) {
                                if (rule.transformOnFail === 'clip') cleanedRow[rule.field] = rule.min;
                                else { errors.push({ field: rule.field, message: `Value ${numValue} is below minimum ${rule.min}.`, value: fieldValue }); rowIsValid = false; }
                            }
                            if (rule.max !== undefined && numValue > rule.max) {
                                if (rule.transformOnFail === 'clip') cleanedRow[rule.field] = rule.max;
                                else { errors.push({ field: rule.field, message: `Value ${numValue} is above maximum ${rule.max}.`, value: fieldValue }); rowIsValid = false; }
                            }
                            cleanedRow[rule.field] = numValue;
                        }
                        break;
                    case 'string':
                        let strValue = String(fieldValue);
                        if (rule.minLength !== undefined && strValue.length < rule.minLength) {
                            errors.push({ field: rule.field, message: `String too short (min ${rule.minLength}).`, value: fieldValue }); rowIsValid = false;
                        }
                        if (rule.maxLength !== undefined && strValue.length > rule.maxLength) {
                            errors.push({ field: rule.field, message: `String too long (max ${rule.maxLength}).`, value: fieldValue }); rowIsValid = false;
                        }
                        if (rule.regex && !new RegExp(rule.regex).test(strValue)) {
                            errors.push({ field: rule.field, message: `String does not match regex.`, value: fieldValue }); rowIsValid = false;
                        }
                        break;
                    case 'boolean':
                        if (typeof fieldValue !== 'boolean') {
                            if (rule.transformOnFail === 'default' && rule.defaultValue !== undefined) cleanedRow[rule.field] = rule.defaultValue;
                            else if (rule.transformOnFail === 'null') cleanedRow[rule.field] = null;
                            else { errors.push({ field: rule.field, message: `Expected boolean, got ${typeof fieldValue}.`, value: fieldValue }); rowIsValid = false; }
                        }
                        break;
                    case 'date':
                        const dateValue = new Date(fieldValue);
                        if (isNaN(dateValue.getTime())) {
                            if (rule.transformOnFail === 'default' && rule.defaultValue !== undefined) cleanedRow[rule.field] = rule.defaultValue;
                            else if (rule.transformOnFail === 'null') cleanedRow[rule.field] = null;
                            else { errors.push({ field: rule.field, message: `Invalid date format.`, value: fieldValue }); rowIsValid = false; }
                        } else {
                            cleanedRow[rule.field] = dateValue.toISOString();
                        }
                        break;
                }
            }

            if (rule.enum && !rule.enum.includes(cleanedRow[rule.field])) {
                errors.push({ field: rule.field, message: `Value ${cleanedRow[rule.field]} not in allowed enum.`, value: cleanedRow[rule.field] });
                rowIsValid = false;
            }
        });

        if (rowIsValid || (rules.some(r => r.transformOnFail === 'remove_row') && !rowIsValid)) {
            // If any rule failed and specifies 'remove_row', this row is skipped
            // Otherwise, if valid, add to cleaned data.
            if (!(rules.some(r => r.transformOnFail === 'remove_row') && !rowIsValid)) {
                 cleanedData.push(cleanedRow);
            }
        }
    });

    return { isValid: errors.length === 0, errors, cleanedData };
};
