```tsx
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

/**
 * Defines the core types for data sources, visualizations, AI/ML configurations,
 * and interactive elements within the Money20/20 platform.
 *
 * Business Value: This file establishes the foundational data contracts and component schemas
 * that enable a highly configurable, agentic AI-driven data visualization layer. By standardizing these
 * interfaces, the platform ensures seamless integration of diverse data streams and advanced analytics
 * into actionable visual insights, drastically reducing time-to-insight and empowering real-time
 * decision-making for critical financial operations. It fosters a modular architecture that
 * accelerates development, ensures data integrity, and supports dynamic, adaptive user experiences
 * worth millions in operational efficiency and competitive advantage.
 */

// Re-importing core universe types for clarity and to ensure strict adherence to the seed's definition source
// In a real project, these would likely be imported from a central `types` file.
export type DataSourceType = 'API' | 'Database' | 'RealtimeStream' | 'FileUpload' | 'ExternalService' | 'AI_Generated' | 'BlockchainLedger';
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
    securityContext?: { userId: string; roles: string[]; orgId: string }; // For RBAC
    blockchainConfig?: { ledgerId: string; accountId?: string; transactionType?: string; blockRange?: { start: number; end: number } };
}
export interface DataSourceConfig {
    id: string;
    name: string;
    type: DataSourceType;
    endpoint?: string;
    collection?: string;
    authRequired?: boolean;
    credentialsRef?: string; // Reference to secure credential store
    query?: DataQueryParameters;
    refreshInterval?: number;
    isLive?: boolean;
    version?: string;
    dataRetentionPolicy?: string;
    dataTransformationEngine?: string;
    governancePolicyRef?: string; // Reference to data governance rules
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
    | 'RiskMatrix' | 'SurveyResults' | 'CustomerJourneyMap' | 'BlockchainExplorer' | 'TokenBalanceDisplay';

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
    componentProps?: Record<string, any>; // Props passed to CustomComponent
    exportFormats?: string[];
    accessibilityFeatures?: string[];
    governanceContext?: { dataClassification: string; viewPermissions: string[]; };
}

export type AIModelType = 'Predictive' | 'AnomalyDetection' | 'NLP' | 'Recommendation' | 'Generative' | 'ReinforcementLearning' | 'ComputerVision' | 'Forecasting' | 'Clustering' | 'Classification' | 'FraudDetection';
export type AIScope = 'TileData' | 'GlobalData' | 'UserContext' | 'CrossTile' | 'AgentContext';
export interface AIMLConfig {
    modelId: string;
    modelType: AIModelType;
    inputMapping?: Record<string, string>;
    outputMapping?: Record<string, string>;
    triggerCondition?: 'onLoad' | 'onDataChange' | 'onInterval' | 'onUserInteraction' | 'manual' | 'scheduled' | 'onAnomalyDetected';
    updateInterval?: number;
    explainabilityEnabled?: boolean;
    confidenceThreshold?: number;
    scope?: AIScope;
    version?: string;
    feedbackLoopEnabled?: boolean; // Enables agentic feedback for model improvement
    realtimeInference?: boolean;
    alertOnAnomaly?: boolean;
    alertSeverity?: 'low' | 'medium' | 'high' | 'critical';
    autoCorrectData?: boolean; // AI-driven data remediation
    scenarioGenerationEnabled?: boolean;
    naturalLanguageGenerationEnabled?: boolean;
    decisionMechanism?: 'threshold' | 'fuzzy_logic' | 'rule_engine' | 'agent_deliberation';
    securityContext?: { modelAccessRoles: string[]; dataAccessRoles: string[]; };
}

export type TileActionType = 'DrillDown' | 'FilterData' | 'OpenLink' | 'ExecuteReport' | 'SendMessage' | 'TriggerWorkflow' | 'UpdateDataSource' | 'SaveState' | 'ShareTile' | 'EmbedTile' | 'PrintTile' | 'FullScreen' | 'EditConfig' | 'RunSimulation' | 'AIAssist' | 'ResetFilters' | 'InitiatePayment' | 'ApproveTransaction' | 'RejectTransaction' | 'PerformReconciliation';
export interface TileAction {
    id: string;
    label: string;
    icon?: React.ReactElement;
    type: TileActionType;
    config?: Record<string, any>;
    permissionRequired?: string[]; // RBAC permissions
    isVisibleCondition?: string; // Dynamic visibility based on state
    isDisabledCondition?: string; // Dynamic disablement
    tooltip?: string;
    confirmationRequired?: boolean;
    auditLoggable?: boolean; // Indicate if action should be audited
}

export type TileEventType = 'dataUpdate' | 'selectionChange' | 'actionTriggered' | 'alertTriggered' | 'configChange' | 'userInteraction' | 'drillDown' | 'filterApplied' | 'aiInsightGenerated' | 'commentAdded' | 'paymentInitiated' | 'transactionApproved' | 'reconciliationCompleted' | 'securityAlert';
export interface TileEvent {
    type: TileEventType;
    sourceTileId: string;
    payload: Record<string, any>;
    timestamp: string;
    userId?: string;
    context?: Record<string, any>; // Additional context for agentic processing
    securityMetadata?: { hash: string; signature: string; }; // For tamper-evident logs
}

/**
 * Provides the context API for the Visualizer Engine, enabling each visualization
 * component to interact with its containing tile's data, state, and actions.
 *
 * Business Value: This context is critical for building highly interactive and
 * interconnected dashboards. It allows individual visualization components to trigger
 * actions, update their configuration, log user interactions for audit and analytics,
 * and subscribe to global events. This significantly enhances user experience,
 * facilitates agentic interventions (e.g., AI triggering an action based on insight),
 * and provides the necessary plumbing for real-time collaboration and dynamic data environments.
 * It's the nervous system for responsive, intelligent dashboards.
 */
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
    userPermissions?: string[]; // Current user's roles/permissions
    isEditingConfig?: boolean;
    dataSourceConfig?: DataSourceConfig; // The config for this tile's data
}
export const TileUniverseContext = createContext<TileUniverseContextType | undefined>(undefined);

export const useTileUniverse = () => {
    const context = useContext(TileUniverseContext);
    if (context === undefined) {
        throw new Error('useTileUniverse must be used within a TileUniverseProvider');
    }
    return context;
};

/**
 * Base properties for any visualizer component within the engine.
 * Ensures consistent data flow and interaction capabilities.
 *
 * Business Value: This standardizes the contract for all visual components,
 * ensuring interoperability and maintainability. Components receive normalized
 * data, configuration, AI insights, and functions to interact with the broader
 * dashboard system, facilitating rapid development of new visualizations and
 * seamless integration into the agentic workflow.
 */
interface BaseVisualizerProps {
    visualizationConfig: ChartConfig;
    data: any;
    isLoading?: boolean;
    error?: Error | null;
    aiInsights?: any;
    triggerAction: (actionId: string, payload?: Record<string, any>) => void;
    logUserInteraction: (interactionType: string, details: Record<string, any>) => void;
    dataSourceConfig?: DataSourceConfig;
}

/**
 * A versatile placeholder component for visualizations that are either
 * not fully implemented or require dynamic content.
 *
 * Business Value: This component ensures a graceful fallback for any visualization
 * type, preventing UI breaks and providing informative messages. It accelerates
 * development by allowing rapid prototyping and clear identification of components
 * that need further implementation. Its dynamic interaction features can simulate
 * complex drill-downs, guiding UX design even before backend integrations are complete.
 */
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

/**
 * Visualizer for Line Charts. Displays time-series or trend data.
 *
 * Business Value: Critical for identifying trends, anomalies, and forecasting.
 * In financial contexts, this visualizer directly supports monitoring of asset
 * prices, transaction volumes, and performance metrics over time, enabling rapid
 * assessment of market conditions and operational health.
 */
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

/**
 * Visualizer for Bar Charts. Compares categorical data.
 *
 * Business Value: Essential for comparing key performance indicators across different
 * categories (e.g., payment rails, regions, customer segments). It quickly highlights
 * discrepancies and areas requiring attention, informing resource allocation and strategic decisions.
 */
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

/**
 * Visualizer for Pie Charts. Shows parts of a whole for a single category.
 *
 * Business Value: Provides an immediate understanding of proportion and distribution,
 * such as market share, fraud type breakdown, or portfolio allocation. Useful for high-level
 * oversight and quick comparative analysis.
 */
const PieChartVisualizer: React.FC<BaseVisualizerProps> = ({ visualizationConfig, data, aiInsights }) => (
    <PlaceholderVisualizer
        type="PieChart"
        icon={PieChartIcon}
        title={visualizationConfig.title}
        dataSample={data?.[0]}
        extraMessage="Categorical distribution overview."
    />
);

/**
 * Visualizer for Scatter Plots. Displays relationships between two numerical variables.
 *
 * Business Value: Identifies correlations, clusters, and outliers in complex datasets,
 * crucial for risk analysis, fraud pattern detection, and understanding transactional
 * behavior that might not be obvious in aggregated views.
 */
const ScatterPlotVisualizer: React.FC<BaseVisualizerProps> = ({ visualizationConfig, data, aiInsights }) => (
    <PlaceholderVisualizer
        type="ScatterPlot"
        icon={ScatterPlotIcon}
        title={visualizationConfig.title}
        dataSample={data?.[0]}
        extraMessage="Relationship between two variables."
    />
);

/**
 * Visualizer for Tabular Data (Tables and Data Grids).
 *
 * Business Value: The fundamental component for presenting raw or semi-processed
 * data in a structured, detailed format. Essential for forensic analysis, audit trails,
 * and compliance reporting. The integration of AI insights (e.g., anomalies) directly
 * into the table enhances its value for rapid issue identification.
 */
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

/**
 * Visualizer for Heatmaps. Displays data density or intensity using color gradients.
 *
 * Business Value: Identifies patterns in large datasets, such as peak transaction
 * times, geographical hot spots for activity, or risk concentration. Offers a
 * high-level overview of complex data distributions.
 */
const HeatmapVisualizer: React.FC<BaseVisualizerProps> = ({ visualizationConfig, data, aiInsights }) => (
    <PlaceholderVisualizer
        type="Heatmap"
        icon={HeatmapIcon}
        title={visualizationConfig.title}
        dataSample={data?.[0]}
        extraMessage="Density and intensity patterns."
    />
);

/**
 * Visualizer for Gauge charts. Displays a single metric against a scale.
 *
 * Business Value: Provides an immediate, intuitive read on key metrics like system
 * health, processing latency, or risk scores. Coupled with AI predictions, it gives
 * early warnings and helps operators gauge performance at a glance, vital for real-time payments.
 */
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

/**
 * Visualizer for Map data. Displays geographical information.
 *
 * Business Value: Essential for global payment operations, allowing visualization of
 * transaction origins, destination concentrations, and regional performance. Helps
 * identify geopolitical risks and optimize regional rail routing.
 */
const MapVisualizer: React.FC<BaseVisualizerProps> = ({ visualizationConfig, data, aiInsights }) => (
    <PlaceholderVisualizer
        type="Map"
        icon={MapIcon}
        title={visualizationConfig.title}
        dataSample={data?.[0]}
        extraMessage="Geospatial data representation."
    />
);

/**
 * Visualizer for KPI (Key Performance Indicator) Widgets.
 *
 * Business Value: Offers concise, high-impact displays of critical business metrics.
 * Integrating AI-driven predictions and trends directly into KPIs provides forward-looking
 * insights, enabling proactive management and intervention before issues escalate.
 * This directly impacts profitability and risk mitigation.
 */
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

/**
 * Visualizer for Text Reports. Displays formatted text content.
 *
 * Business Value: Ideal for displaying detailed textual analysis, policy documents,
 * or AI-generated narratives summarizing complex data. It provides context and human-readable
 * insights, especially valuable for compliance, reporting, and explaining agentic decisions.
 */
const TextReportVisualizer: React.FC<BaseVisualizerProps> = ({ visualizationConfig, data, aiInsights }) => (
    <div className="p-4 h-full overflow-auto text-gray-300 prose prose-invert">
        <h3 className="text-white text-md font-semibold mb-2">{visualizationConfig.title || 'Report'}</h3>
        {aiInsights?.generativeText ? <p>{aiInsights.generativeText}</p> : aiInsights?.summary ? <p>{aiInsights.summary}</p> : <p>Detailed report content or AI-generated narrative would appear here.</p>}
        <p className="mt-4 text-xs text-gray-500">Generated at: {new Date().toLocaleString()}</p>
        {data && <pre className="bg-gray-800 p-2 rounded mt-2 text-xs overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>}
    </div>
);

/**
 * Visualizer for a Chatbot Interface. Enables natural language interaction with data and AI.
 *
 * Business Value: Transforms raw data into conversational intelligence, allowing users
 * to query, explore, and receive insights using natural language. This democratizes
 * data access, reduces the need for specialized query skills, and enables immediate
 * agentic assistance, significantly boosting productivity and decision-making speed.
 */
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

/**
 * Visualizer for Custom Components. Allows embedding external or bespoke React components.
 *
 * Business Value: Provides unmatched extensibility and flexibility. This enables
 * clients to integrate highly specialized or proprietary visualizations, custom
 * operational controls, or unique domain-specific logic directly into the dashboard,
 * preserving existing investments and creating truly tailored solutions.
 */
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

/**
 * Visualizer for Multi-Metric Cards. Displays several key metrics in a compact format.
 *
 * Business Value: Offers a condensed view of multiple related KPIs, enabling quick
 * monitoring of a dashboard's most critical financial indicators without consuming
 * excessive screen real estate. Ideal for executive summaries and operational control panels.
 */
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

/**
 * Visualizer for Code Blocks. Displays formatted source code or script snippets.
 *
 * Business Value: Supports transparency and debugging for embedded logic, such as
 * data transformation scripts, smart contract code, or AI model definitions. Useful for
 * developers, auditors, and compliance officers needing to review the underlying
 * programmatic components of the platform.
 */
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

/**
 * Visualizer for Blockchain Explorer. Displays blockchain transaction data and ledger state.
 *
 * Business Value: Provides real-time transparency and auditability into token rail operations.
 * Allows users to track transactions, verify token balances, and inspect smart contract
 * interactions, crucial for financial institutions adopting digital assets and blockchain
 * technologies. Enhances trust and facilitates compliance by offering an immutable record view.
 */
const BlockchainExplorerVisualizer: React.FC<BaseVisualizerProps> = ({ visualizationConfig, data, aiInsights, triggerAction }) => (
    <div className="p-4 h-full overflow-auto text-gray-300">
        <h3 className="text-white text-md font-semibold mb-2">{visualizationConfig.title || 'Blockchain Explorer'}</h3>
        <p className="text-gray-400 text-sm mb-2">Ledger ID: <span className="font-mono text-cyan-400">{visualizationConfig.customOptions?.ledgerId || 'simulated-ledger-001'}</span></p>
        {data && data.length > 0 ? (
            <div className="space-y-3">
                {data.slice(0, 5).map((tx: any, index: number) => (
                    <div key={index} className="bg-gray-800 p-3 rounded-md border border-gray-700">
                        <p className="text-white font-semibold flex items-center gap-2 mb-1"><GitCommit className="h-4 w-4 text-purple-400" /> Transaction ID: <span className="font-mono text-xs text-gray-400 truncate">{tx.id || 'N/A'}</span></p>
                        <p className="text-xs text-gray-400">From: <span className="font-mono text-green-400">{tx.fromAccount || 'N/A'}</span></p>
                        <p className="text-xs text-gray-400">To: <span className="font-mono text-red-400">{tx.toAccount || 'N/A'}</span></p>
                        <p className="text-sm text-white mt-1">Amount: <span className="font-bold text-lg text-yellow-300">{tx.amount} {tx.currency || 'USD'}</span></p>
                        <p className="text-xs text-gray-500">Timestamp: {new Date(tx.timestamp).toLocaleString()}</p>
                        {aiInsights?.anomalies?.some((a: any) => a.transactionId === tx.id) && (
                            <div className="mt-2 text-red-300 text-sm flex items-center gap-1">
                                <AlertIcon className="h-4 w-4" /> Fraud Alert!
                            </div>
                        )}
                        {visualizationConfig.drillDownEnabled && (
                            <button
                                className="mt-2 px-3 py-1 bg-cyan-600 text-white rounded-md text-xs hover:bg-cyan-700 transition-colors"
                                onClick={() => triggerAction('view-transaction-details', { transactionId: tx.id })}
                            >
                                View Details
                            </button>
                        )}
                    </div>
                ))}
                {data.length > 5 && (
                    <p className="text-center text-gray-500 italic mt-3">... {data.length - 5} more transactions</p>
                )}
            </div>
        ) : (
            <p className="italic text-gray-500">No blockchain data available. Configure a ledger source.</p>
        )}
    </div>
);

/**
 * Visualizer for Token Balance Display. Shows current token holdings for an account.
 *
 * Business Value: Provides a clear, real-time view of digital asset balances, essential
 * for treasury management, customer account visibility, and operational reconciliation
 * in a tokenized economy. Directly supports financial transparency and liquidity management.
 */
const TokenBalanceDisplayVisualizer: React.FC<BaseVisualizerProps> = ({ visualizationConfig, data, aiInsights }) => {
    const balances = data || []; // Expects data to be an array of { currency: string, amount: number, accountId: string }
    return (
        <div className="p-4 h-full flex flex-col justify-center items-center">
            <DollarSign className="h-10 w-10 text-yellow-400 mb-3" />
            <h3 className="text-white text-md font-semibold mb-2">{visualizationConfig.title || 'Token Balances'}</h3>
            {balances.length > 0 ? (
                <div className="space-y-2 w-full max-w-xs">
                    {balances.map((balance: any, index: number) => (
                        <div key={index} className="flex justify-between items-center bg-gray-800 p-3 rounded-md">
                            <span className="text-gray-300 text-sm">{balance.currency}</span>
                            <span className="text-white text-2xl font-bold">{balance.amount.toLocaleString()}</span>
                        </div>
                    ))}
                    {aiInsights?.riskLevel && (
                        <p className={`mt-2 text-sm text-center ${aiInsights.riskLevel === 'high' ? 'text-red-400' : 'text-green-400'}`}>
                            Risk Level: {aiInsights.riskLevel.toUpperCase()}
                        </p>
                    )}
                </div>
            ) : (
                <p className="italic text-gray-500">No token balance data available.</p>
            )}
        </div>
    );
};


/**
 * Generic visualizer for types not explicitly implemented.
 *
 * Business Value: Acts as a safeguard, ensuring that even unrecognized visualization
 * types gracefully display a message, preventing application crashes and providing
 * clear diagnostic information. It helps maintain the system's robustness and
 * signals areas for future development or integration.
 */
const UnsupportedVisualizer: React.FC<BaseVisualizerProps> = ({ visualizationConfig, data }) => (
    <div className="flex justify-center items-center h-full text-gray-500 flex-col p-4 bg-gray-800 rounded">
        <LayersIcon className="h-10 w-10 mb-2 text-gray-600" />
        <p>Unsupported Visualization Type:</p>
        <p className="font-mono text-cyan-400">{visualizationConfig.type}</p>
        <p className="text-xs mt-2">Data Sample: <pre className="text-gray-600">{JSON.stringify(data?.[0], null, 2)}</pre></p>
    </div>
);

/**
 * Registry mapping VisualizationType to React Component.
 *
 * Business Value: Centralizes the management of all visualization components,
 * making the engine highly modular and extensible. New chart types can be added
 * or existing ones updated without modifying core logic, accelerating feature
 * delivery and ensuring architectural cleanliness for a complex, evolving platform.
 */
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
    BlockchainExplorer: BlockchainExplorerVisualizer,
    TokenBalanceDisplay: TokenBalanceDisplayVisualizer,

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

/**
 * The central engine responsible for rendering specific visualization components
 * based on the provided configuration and data.
 *
 * Business Value: This is the core rendering powerhouse of the dashboard. It dynamically
 * selects and instantiates the correct visualization component based on configuration,
 * handles loading and error states gracefully, and passes all necessary data and
 * interaction functions. This architecture ensures optimal performance, reliability,
 * and flexibility, allowing the platform to visualize any data type with its associated
 * AI insights, making it a pivotal asset for operational intelligence and millions in ROI.
 */
export const VisualizerEngine: React.FC<BaseVisualizerProps> = ({
    visualizationConfig,
    data,
    isLoading,
    error,
    aiInsights,
    triggerAction,
    logUserInteraction,
    dataSourceConfig,
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
                dataSourceConfig={dataSourceConfig}
            />
        </div>
    );
};

/**
 * Utility for advanced data transformations, including derived values and historical context.
 *
 * Business Value: This function provides robust, configurable data preprocessing capabilities
 * crucial for preparing raw data for complex visualizations and AI models. It enables
 * dynamic feature engineering, improving the accuracy of analytics and the relevance
 * of insights, thereby directly contributing to better data-driven decisions and
 * optimized financial operations.
 */
interface RawDataItem {
    id: string;
    value_raw: number;
    category_id: string;
    timestamp_unix: number;
    metadata: Record<string, any>;
    nested_array_data?: number[];
}

export interface ProcessedDataItem {
    uniqueId: string;
    processedValue: number;
    derivedCategory: string;
    formattedDate: string;
    weightedScore: number;
    tags: string[];
    isHighVariance: boolean;
    aggregatedSubValues: number;
    prevValue?: number;
    valueChange?: number;
}

export const applyAdvancedDataTransformations = (
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
        const weightedScore = processedValue * (item.metadata?.importance || 0) * (transformConfig.scoreWeight || 0.1);

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
            processed[i].prevValue = processed[i - 1].processedValue;
            processed[i].valueChange = processed[i].processedValue - processed[i - 1].processedValue;
        }
    }

    return processed;
};

/**
 * Manages complex interaction states for dashboard elements, including undo/redo functionality.
 *
 * Business Value: This hook provides a robust and auditable interaction history for complex
 * dashboard elements, enhancing user experience and supporting forensic analysis.
 * The undo/redo capabilities prevent data loss or misinterpretation from accidental actions,
 * while logging interactions provides valuable insights into user behavior and potential
 * system improvements, ultimately contributing to a more resilient and user-friendly platform.
 */
interface InteractionState {
    activeSegment: string | null;
    selectedItems: Set<string>;
    zoomLevel: number;
    filterExpression: string;
    lastInteractionTimestamp: number;
    undoStack: Array<Partial<InteractionState>>;
    redoStack: Array<Partial<InteractionState>>; // Added for full undo/redo
}

const initialInteractionState: InteractionState = {
    activeSegment: null,
    selectedItems: new Set(),
    zoomLevel: 1.0,
    filterExpression: '',
    lastInteractionTimestamp: Date.now(),
    undoStack: [],
    redoStack: [],
};

export const useComplexInteraction = (tileId: string) => {
    const [state, setState] = useState<InteractionState>(initialInteractionState);

    const recordState = useCallback((newState: Partial<InteractionState>) => {
        setState(prev => {
            const currentSnapshot = { ...prev, undoStack: [], redoStack: [] }; // Don't save stack in snapshot
            const newUndoStack = [...prev.undoStack, currentSnapshot];
            return {
                ...prev,
                ...newState,
                lastInteractionTimestamp: Date.now(),
                undoStack: newUndoStack.slice(-50), // Keep a reasonable history
                redoStack: [], // Clear redo stack on new action
            };
        });
    }, []);

    const setActiveSegment = useCallback((segmentId: string | null) => {
        recordState({ activeSegment: segmentId });
    }, [recordState]);

    const toggleSelectedItem = useCallback((itemId: string) => {
        setState(prev => {
            const newSelectedItems = new Set(prev.selectedItems);
            if (newSelectedItems.has(itemId)) {
                newSelectedItems.delete(itemId);
            } else {
                newSelectedItems.add(itemId);
            }
            recordState({ selectedItems: newSelectedItems });
            return { ...prev, selectedItems: newSelectedItems }; // Update local state immediately for UI responsiveness
        });
    }, [recordState]);

    const applyZoom = useCallback((level: number) => {
        recordState({ zoomLevel: Math.max(0.5, Math.min(5.0, level)) });
    }, [recordState]);

    const updateFilterExpression = useCallback((expression: string) => {
        recordState({ filterExpression: expression });
    }, [recordState]);

    const undo = useCallback(() => {
        setState(prev => {
            if (prev.undoStack.length === 0) return prev;
            const lastState = prev.undoStack[prev.undoStack.length - 1];
            const newUndoStack = prev.undoStack.slice(0, prev.undoStack.length - 1);
            const newRedoStack = [{ ...prev, undoStack: [], redoStack: [] }, ...prev.redoStack];
            return {
                ...lastState,
                undoStack: newUndoStack,
                redoStack: newRedoStack,
            };
        });
    }, []);

    const redo = useCallback(() => {
        setState(prev => {
            if (prev.redoStack.length === 0) return prev;
            const nextState = prev.redoStack[0];
            const newRedoStack = prev.redoStack.slice(1);
            const newUndoStack = [...prev.undoStack, { ...prev, undoStack: [], redoStack: [] }];
            return {
                ...nextState,
                undoStack: newUndoStack,
                redoStack: newRedoStack,
            };
        });
    }, []);

    return {
        state,
        setActiveSegment,
        toggleSelectedItem,
        applyZoom,
        updateFilterExpression,
        undo,
        redo,
        canUndo: state.undoStack.length > 0,
        canRedo: state.redoStack.length > 0,
    };
};

/**
 * Defines a contract for external service calls.
 *
 * Business Value: This interface standardizes how the platform interacts with external
 * data providers and microservices, ensuring secure, consistent, and auditable data
 * fetching. It supports sophisticated caching, request transformation, and error handling,
 * which are paramount for integrating with diverse financial APIs and maintaining
 * high performance and data reliability.
 */
export interface ExternalServiceCall {
    serviceId: string;
    method: string;
    params: Record<string, any>;
    headers?: Record<string, string>;
    cachePolicy?: 'no-cache' | 'standard' | 'aggressive';
    responseTransformer?: string; // Function name or expression for post-processing
    securityContext?: { apiKeyRef?: string; signature?: string; }; // Enhanced security
}

/**
 * Simulates the execution of an external service call with configurable latency and error rates.
 *
 * Business Value: Provides a faithful, configurable simulator for external service integrations.
 * This is invaluable during the Money20/20 build phase as it allows for development and testing
 * of a complete architecture without dependencies on live banking rails or third-party APIs.
 * It ensures that the platform's core logic, error handling, and performance characteristics
 * can be thoroughly validated in a deterministic, isolated environment.
 */
export const executeExternalService = async (call: ExternalServiceCall, abortSignal?: AbortSignal): Promise<any> => {
    console.log(`Executing external service: ${call.serviceId}.${call.method}`);
    // Simulate latency with a random component
    await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 400));

    if (abortSignal?.aborted) {
        throw new Error('External service call aborted.');
    }

    // Simulate different response types based on method or serviceId
    let mockResponseData: any = {};
    let mockStatus = 200;

    if (call.serviceId === 'fraud-detection-api') {
        const score = Math.random();
        mockResponseData = {
            transactionId: call.params.transactionId,
            fraudScore: parseFloat(score.toFixed(4)),
            isFraudulent: score > 0.85,
            detectionRules: score > 0.85 ? ['high_value_transaction', 'unusual_location'] : [],
        };
    } else if (call.serviceId === 'payment-gateway') {
        const success = Math.random() > 0.1; // 90% success rate
        mockResponseData = {
            paymentId: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            status: success ? 'COMPLETED' : 'FAILED',
            amount: call.params.amount,
            currency: call.params.currency,
            message: success ? 'Payment processed successfully.' : 'Payment failed due to simulated issue.',
            errorCode: success ? null : 'SIM_PAY_001',
        };
        mockStatus = success ? 200 : 400;
    } else if (call.serviceId === 'blockchain-ledger') {
        mockResponseData = {
            ledgerId: call.params.ledgerId || 'sim-ledger-1',
            accountBalances: [
                { account: call.params.accountId || 'acc_mock_001', token: 'USD_TOKEN', amount: Math.floor(Math.random() * 100000) / 100 },
                { account: 'acc_mock_002', token: 'EUR_TOKEN', amount: Math.floor(Math.random() * 50000) / 100 },
            ],
            latestBlock: Math.floor(Math.random() * 1000000),
            transactionHistory: Array.from({ length: Math.floor(Math.random() * 5) + 1 }).map((_, i) => ({
                id: `tx-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
                fromAccount: `acc_mock_${Math.floor(Math.random() * 5)}`,
                toAccount: `acc_mock_${Math.floor(Math.random() * 5) + 5}`,
                amount: Math.floor(Math.random() * 1000) / 100,
                currency: 'USD_TOKEN',
                timestamp: Date.now() - (i * 3600 * 1000),
                status: 'CONFIRMED',
            })),
        };
    } else {
        // Generic mock response
        mockResponseData = {
            serviceOutputId: `output-${Date.now()}`,
            result: Math.floor(Math.random() * 10000),
            details: `Response from ${call.serviceId}:${call.method}`,
            queryMirror: call.params,
        };
    }

    const fullMockResponse: any = {
        status: mockStatus,
        data: mockResponseData,
        metadata: {
            timestamp: new Date().toISOString(),
            cached: call.cachePolicy === 'standard' && Math.random() > 0.5,
        },
    };

    if (call.responseTransformer) {
        // In a real system, this would securely execute a pre-defined transformation function
        // For this mock, we just add a note about it and apply a simple transformation.
        fullMockResponse.data.transformed = `Applied transformer: ${call.responseTransformer}`;
        if (typeof fullMockResponse.data.result === 'number') {
            fullMockResponse.data.result = fullMockResponse.data.result * (call.params.factor || 1) + 100;
        }
    }

    if (Math.random() > 0.95 && mockStatus === 200) { // Simulate occasional error, unless already an error state
        throw new Error(`Service ${call.serviceId} failed with a simulated transient error.`);
    }

    if (mockStatus !== 200) {
        throw new Error(`External service responded with status ${mockStatus}: ${JSON.stringify(mockResponseData)}`);
    }

    return fullMockResponse;
};

/**
 * React hook for fetching data from an external service, including refresh and error handling.
 *
 * Business Value: Encapsulates the logic for interacting with `executeExternalService`,
 * providing a standardized, reactive pattern for fetching and managing data from external
 * sources. It supports automatic refreshing and robust error handling, ensuring that
 * dashboards remain up-to-date and resilient to API failures, which is paramount for
 * real-time financial monitoring.
 */
export const useExternalDataSource = (config: DataSourceConfig, enabled: boolean = true) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async () => {
        if (!enabled || config.type !== 'ExternalService' && config.type !== 'BlockchainLedger') {
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
                serviceId: config.type === 'BlockchainLedger' ? 'blockchain-ledger' : (config.endpoint || 'mock-external-service'),
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

/**
 * Generic Utility for dynamic icon rendering based on type string.
 *
 * Business Value: Provides a centralized, intelligent mapping from data/visualization
 * types to relevant icons, ensuring a consistent and intuitive user interface. This
 * enhances usability, reduces cognitive load, and maintains brand consistency across
 * a wide range of dashboard components, making the platform more accessible and professional.
 */
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
    BlockchainExplorer: LayersIcon, // Generic blockchain icon
    TokenBalanceDisplay: DollarSign, // Token balance specific icon
    default: BoxIcon, // Fallback icon
};

export const getVisualizationIcon = (type: VisualizationType | string): React.ElementType => {
    return typeToIconMap[type] || typeToIconMap.default;
};

/**
 * Defines the structure for an analytics event.
 *
 * Business Value: This standardized event structure is crucial for comprehensive
 * platform observability and governance. It ensures that every user interaction
 * and system event is captured with rich metadata, enabling detailed audit trails,
 * performance monitoring, and behavioral analytics. This data is invaluable for
 * security, compliance, improving user experience, and optimizing agentic workflows.
 */
export interface AnalyticsEvent {
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
    correlationId?: string; // For linking across systems/agents
    securityContext?: { role: string; accessLevel: string }; // What permissions user had at time of event
}

/**
 * Manages analytics sessions and event logging with batching capabilities.
 *
 * Business Value: Provides a robust, performant mechanism for collecting and transmitting
 * user and system analytics. By implementing batching and debouncing, it minimizes
 * network overhead while ensuring that critical interaction data is captured reliably.
 * This is essential for understanding user behavior, optimizing system performance,
 * and maintaining regulatory compliance through detailed activity logs.
 */
export const useAnalyticsSession = (userId: string, currentTileId: string) => {
    const [sessionId, setSessionId] = useState<string>('');
    const eventQueue = useRef<AnalyticsEvent[]>([]);
    const sequenceCounter = useRef<number>(0);
    const isSending = useRef<boolean>(false);
    const sendTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
            // In a real system, this would be a secure, authenticated POST request
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
            console.log('Analytics events sent successfully.');
        } catch (error) {
            console.error('Failed to send analytics events:', error);
            // Re-add to queue if sending failed for retry, ensuring order is maintained
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
            clientIp: 'mock-ip-127.0.0.1', // Placeholder or real IP from request context
            userAgent: navigator.userAgent, // Real user agent
            correlationId: payload.correlationId,
            securityContext: { role: 'admin', accessLevel: 'full' }, // Mock user security context
        };
        eventQueue.current.push(event);

        if (sendTimeoutRef.current) {
            clearTimeout(sendTimeoutRef.current);
        }
        sendTimeoutRef.current = setTimeout(sendEventsToServer, 1000); // Debounce sending
    }, [userId, currentTileId, sessionId, sendEventsToServer]);

    useEffect(() => {
        const intervalId = setInterval(sendEventsToServer, 5000); // Periodically send any remaining queued events
        return () => {
            clearInterval(intervalId);
            if (sendTimeoutRef.current) {
                clearTimeout(sendTimeoutRef.current);
            }
        };
    }, [sendEventsToServer]);

    return { sessionId, logAnalyticsEvent };
};

/**
 * Provides a flexible configuration for data aggregation.
 *
 * Business Value: This configuration enables dynamic aggregation of raw data,
 * transforming granular information into summarized views suitable for higher-level
 * analysis. It supports various aggregation types and time-based grouping,
 * empowering users to extract meaningful patterns and trends from vast datasets,
 * which is fundamental for financial reporting and operational dashboards.
 */
export interface DataAggregationConfig {
    keyField: string;
    valueField: string;
    aggregationType: 'sum' | 'avg' | 'count' | 'min' | 'max';
    groupingFields?: string[];
    timeBucket?: 'hour' | 'day' | 'week' | 'month' | 'year';
    includeEmptyBuckets?: boolean; // For time-series consistency
}

/**
 * Aggregates data based on a provided configuration, supporting various grouping and aggregation types.
 *
 * Business Value: This function is a core data processing utility, vital for transforming
 * raw transactional data into actionable summary statistics. It enables the creation of
 * dashboards that present data at appropriate levels of detail, from individual transactions
 * to aggregated daily volumes or monthly averages. This capability enhances data comprehension
 * and supports strategic decision-making in real-time financial environments.
 */
export const aggregateData = (data: any[], config: DataAggregationConfig): any[] => {
    if (!data || data.length === 0) return [];

    const result: Record<string, any> = {};
    const dateFormatOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric' };

    data.forEach(item => {
        const groupValues = (config.groupingFields || []).map(field => item[field]).join('|');
        let key = groupValues;

        let dateString = '';
        if (config.timeBucket && item.timestamp) {
            const date = new Date(item.timestamp);
            switch (config.timeBucket) {
                case 'hour': dateString = date.toLocaleDateString('en-US', { ...dateFormatOptions, hour: 'numeric' }); break;
                case 'day': dateString = date.toLocaleDateString('en-US', { ...dateFormatOptions, hour: undefined }); break;
                case 'week':
                    const firstDayOfWeek = new Date(date.setDate(date.getDate() - date.getDay())); // Sunday
                    dateString = firstDayOfWeek.toLocaleDateString('en-US', { ...dateFormatOptions, hour: undefined });
                    break;
                case 'month': dateString = date.toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: undefined, hour: undefined }); break;
                case 'year': dateString = date.toLocaleDateString('en-US', { year: 'numeric', month: undefined, day: undefined, hour: undefined }); break;
            }
            key = key ? `${key}|${dateString}` : dateString;
        }

        if (!result[key]) {
            result[key] = {
                ...(config.groupingFields || []).reduce((acc, field) => ({ ...acc, [field]: item[field] }), {}),
                _values: [],
                _count: 0,
            };
            if (config.timeBucket) {
                result[key].timeBucket = dateString;
            }
        }

        const value = item[config.valueField];
        if (typeof value === 'number') {
            result[key]._values.push(value);
        }
        result[key]._count++;
    });

    const aggregatedResult = Object.keys(result).map(key => {
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

    // Handle includeEmptyBuckets for time-series data
    if (config.timeBucket && config.includeEmptyBuckets && data.length > 0) {
        // This part would be more complex to implement fully, requiring iterating through the full time range
        // For now, it's a placeholder for future enhancement.
        console.warn("`includeEmptyBuckets` is enabled but not fully implemented for all timeBucket types.");
    }

    return aggregatedResult;
};

/**
 * Displays and controls application feature flags.
 *
 * Business Value: This component provides a transparent and accessible interface
 * for managing feature flags. It allows administrators and authorized agents to
 * dynamically enable or disable features without code deployments, facilitating
 * A/B testing, phased rollouts, and emergency kill switches. This capability
 * is invaluable for operational agility, risk management, and rapid iteration,
 * saving millions in deployment costs and accelerating market responsiveness.
 */
export interface FeatureFlagDisplayProps {
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
                Changes may be logged for audit and governance purposes.
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
    'payment_initiation_enabled': true, // New flag for payment functionality
    'agent_reconciliation_active': false, // New flag for agentic reconciliation
};

/**
 * React hook to simulate managing feature flags, including persistence and audit.
 *
 * Business Value: Centralizes the logic for managing application features via flags.
 * This hook provides a controlled, auditable mechanism for enabling or disabling
 * functionality, crucial for controlled rollouts, A/B testing, and emergency
 * feature toggling. This agility translates directly into faster innovation cycles,
 * reduced deployment risks, and improved system stability, offering significant
 * competitive advantage.
 */
export const useFeatureFlags = () => {
    // In a real application, these would be fetched from a central feature flag service
    // and potentially synchronized with user/role specific overrides.
    const [flags, setFlags] = useState<Record<string, boolean>>(() => {
        try {
            const storedFlags = localStorage.getItem('appFeatureFlags');
            return storedFlags ? { ...mockFeatureFlags, ...JSON.parse(storedFlags) } : mockFeatureFlags;
        } catch (error) {
            console.error("Failed to parse stored feature flags, using defaults.", error);
            return mockFeatureFlags;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('appFeatureFlags', JSON.stringify(flags));
        } catch (error) {
            console.error("Failed to save feature flags to local storage.", error);
        }
    }, [flags]);

    const toggleFlag = useCallback((flagName: string, enabled: boolean) => {
        setFlags(prevFlags => {
            const newFlags = { ...prevFlags, [flagName]: enabled };
            console.log(`Feature flag '${flagName}' toggled to ${enabled}. New flags:`, newFlags);
            // In a real application, this would also trigger an audit log event
            // and potentially update a backend feature flag service.
            return newFlags;
        });
    }, []);

    const isFeatureEnabled = useCallback((flagName: string) => {
        return flags[flagName] || false;
    }, [flags]);

    return { flags, toggleFlag, isFeatureEnabled };
};

/**
 * Defines a configuration for responsive container styling.
 *
 * Business Value: This configuration enables highly adaptive and performant layouts
 * across diverse devices and screen sizes. By abstracting responsive design into a
 * structured configuration, it simplifies UI development, ensures a consistent user
 * experience, and reduces the engineering effort required to build enterprise-grade
 * dashboards that seamlessly adjust to any operational environment.
 */
export interface ResponsiveContainerConfig {
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

/**
 * Hook to generate dynamic Tailwind-like classes for responsive containers.
 *
 * Business Value: Dynamically generates CSS utility classes for responsive layouts,
 * significantly streamlining the creation of adaptive user interfaces. This enables
 * dashboards to fluidly adjust to different screen sizes, from mobile devices to large
 * monitoring displays, optimizing user experience and ensuring accessibility across
 * all operational contexts. It reduces manual styling effort and enhances maintainability.
 */
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

/**
 * Calculates dynamic thresholds for data series, incorporating statistical adjustments.
 *
 * Business Value: This function provides an intelligent mechanism for establishing
 * dynamic alert thresholds, moving beyond static limits to contextually aware boundaries.
 * By factoring in historical data volatility (standard deviation) and configurable
 * adjustment factors, it significantly reduces false positives and ensures that
 * alerts (e.g., for transaction anomalies) are highly relevant, saving operational
 * costs and improving the effectiveness of agentic monitoring.
 */
export const calculateDynamicThreshold = (
    dataSeries: number[],
    baseThreshold: number,
    stdDevMultiplier: number = 2,
    adjustmentFactor: number = 0.05
): { upper: number; lower: number; dynamicAlert: boolean } => {
    if (!dataSeries || dataSeries.length < 2) {
        // Fallback to a simpler threshold if not enough data for statistical calculation
        const fallbackUpper = baseThreshold * (1 + adjustmentFactor);
        const fallbackLower = baseThreshold * (1 - adjustmentFactor);
        const latestValue = dataSeries?.[dataSeries.length - 1];
        const dynamicAlert = latestValue !== undefined && (latestValue > fallbackUpper || latestValue < fallbackLower);
        return { upper: fallbackUpper, lower: fallbackLower, dynamicAlert };
    }

    const mean = dataSeries.reduce((sum, val) => sum + val, 0) / dataSeries.length;
    const variance = dataSeries.map(val => (val - mean) ** 2).reduce((sum, val) => sum + val, 0) / dataSeries.length;
    const stdDev = Math.sqrt(variance);

    const dynamicUpper = Math.max(baseThreshold, mean + stdDev * stdDevMultiplier);
    const dynamicLower = Math.min(baseThreshold, mean - stdDev * stdDevMultiplier);

    const latestValue = dataSeries[dataSeries.length - 1];
    const dynamicAlert = latestValue > dynamicUpper || latestValue < dynamicLower;

    return { upper: parseFloat(dynamicUpper.toFixed(2)), lower: parseFloat(dynamicLower.toFixed(2)), dynamicAlert };
};

/**
 * Defines a rule for data validation and cleaning.
 *
 * Business Value: These rules are the foundation for data governance and quality.
 * They specify expected data types, ranges, formats, and mandatory fields, ensuring
 * that all incoming data meets the high standards required for financial transactions
 * and regulatory compliance. Robust validation prevents erroneous data from corrupting
 * analytics or operational workflows, saving significant costs associated with data errors.
 */
export interface DataValidatorRule {
    field: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array'; // Expanded types
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    regex?: string;
    enum?: (string | number)[];
    required?: boolean;
    defaultValue?: any;
    transformOnFail?: 'null' | 'default' | 'clip' | 'remove_row' | 'log_only'; // Added 'log_only'
    nestedRules?: DataValidatorRule[]; // For object/array validation
}

/**
 * Result structure for data validation.
 *
 * Business Value: Provides a clear, actionable report on data quality. It details
 * all validation errors and returns a cleaned dataset, enabling systems to either
 * quarantine problematic data or proceed with corrected versions. This is critical
 * for maintaining data integrity in financial systems and supporting reliable reporting.
 */
export interface ValidationResult {
    isValid: boolean;
    errors: Array<{ field: string; message: string; value: any; rowIndex: number }>;
    cleanedData: any[];
}

/**
 * Validates and cleans a dataset based on a set of defined rules.
 *
 * Business Value: This function is a cornerstone for data quality and integrity within
 * the Money20/20 platform. It programmatically enforces data governance policies,
 * ensuring that all data consumed by visualizations and AI agents adheres to strict
 * business rules. By automatically identifying, logging, and optionally transforming
 * or removing invalid data, it prevents bad data from leading to flawed insights,
 * erroneous payments, or regulatory non-compliance, securing millions in operational
 * accuracy and trust.
 */
export const validateAndCleanData = (data: any[], rules: DataValidatorRule[]): ValidationResult => {
    const errors: Array<{ field: string; message: string; value: any; rowIndex: number }> = [];
    const cleanedData: any[] = [];

    data.forEach((row, rowIndex) => {
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
                } else if (rule.transformOnFail !== 'log_only') { // Only log, don't invalidate row for log_only
                    errors.push({ field: rule.field, message: `Field is required but missing.`, value: fieldValue, rowIndex });
                    rowIsValid = false;
                } else {
                    console.warn(`[Validation Log] Row ${rowIndex}, Field ${rule.field}: Required but missing. Value: ${fieldValue}`);
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
                            else if (rule.transformOnFail !== 'log_only') { errors.push({ field: rule.field, message: `Expected number, got ${typeof fieldValue}.`, value: fieldValue, rowIndex }); rowIsValid = false; }
                            else { console.warn(`[Validation Log] Row ${rowIndex}, Field ${rule.field}: Expected number, got ${typeof fieldValue}. Value: ${fieldValue}`); }
                        } else {
                            if (rule.min !== undefined && numValue < rule.min) {
                                if (rule.transformOnFail === 'clip') cleanedRow[rule.field] = rule.min;
                                else if (rule.transformOnFail !== 'log_only') { errors.push({ field: rule.field, message: `Value ${numValue} is below minimum ${rule.min}.`, value: fieldValue, rowIndex }); rowIsValid = false; }
                                else { console.warn(`[Validation Log] Row ${rowIndex}, Field ${rule.field}: Value ${numValue} is below minimum ${rule.min}.`); }
                            }
                            if (rule.max !== undefined && numValue > rule.max) {
                                if (rule.transformOnFail === 'clip') cleanedRow[rule.field] = rule.max;
                                else if (rule.transformOnFail !== 'log_only') { errors.push({ field: rule.field, message: `Value ${numValue} is above maximum ${rule.max}.`, value: fieldValue, rowIndex }); rowIsValid = false; }
                                else { console.warn(`[Validation Log] Row ${rowIndex}, Field ${rule.field}: Value ${numValue} is above maximum ${rule.max}.`); }
                            }
                            cleanedRow[rule.field] = numValue;
                        }
                        break;
                    case 'string':
                        let strValue = String(fieldValue);
                        if (rule.minLength !== undefined && strValue.length < rule.minLength) {
                            if (rule.transformOnFail !== 'log_only') { errors.push({ field: rule.field, message: `String too short (min ${rule.minLength}).`, value: fieldValue, rowIndex }); rowIsValid = false; }
                            else { console.warn(`[Validation Log] Row ${rowIndex}, Field ${rule.field}: String too short (min ${rule.minLength}). Value: ${fieldValue}`); }
                        }
                        if (rule.maxLength !== undefined && strValue.length > rule.maxLength) {
                            if (rule.transformOnFail !== 'log_only') { errors.push({ field: rule.field, message: `String too long (max ${rule.maxLength}).`, value: fieldValue, rowIndex }); rowIsValid = false; }
                            else { console.warn(`[Validation Log] Row ${rowIndex}, Field ${rule.field}: String too long (max ${rule.maxLength}). Value: ${fieldValue}`); }
                        }
                        if (rule.regex && !new RegExp(rule.regex).test(strValue)) {
                            if (rule.transformOnFail !== 'log_only') { errors.push({ field: rule.field, message: `String does not match regex.`, value: fieldValue, rowIndex }); rowIsValid = false; }
                            else { console.warn(`[Validation Log] Row ${rowIndex}, Field ${rule.field}: String does not match regex. Value: ${fieldValue}`); }
                        }
                        cleanedRow[rule.field] = strValue;
                        break;
                    case 'boolean':
                        if (typeof fieldValue !== 'boolean') {
                            if (rule.transformOnFail === 'default' && rule.defaultValue !== undefined) cleanedRow[rule.field] = rule.defaultValue;
                            else if (rule.transformOnFail === 'null') cleanedRow[rule.field] = null;
                            else if (rule.transformOnFail !== 'log_only') { errors.push({ field: rule.field, message: `Expected boolean, got ${typeof fieldValue}.`, value: fieldValue, rowIndex }); rowIsValid = false; }
                            else { console.warn(`[Validation Log] Row ${rowIndex}, Field ${rule.field}: Expected boolean, got ${typeof fieldValue}. Value: ${fieldValue}`); }
                        }
                        break;
                    case 'date':
                        const dateValue = new Date(fieldValue);
                        if (isNaN(dateValue.getTime())) {
                            if (rule.transformOnFail === 'default' && rule.defaultValue !== undefined) cleanedRow[rule.field] = rule.defaultValue;
                            else if (rule.transformOnFail === 'null') cleanedRow[rule.field] = null;
                            else if (rule.transformOnFail !== 'log_only') { errors.push({ field: rule.field, message: `Invalid date format.`, value: fieldValue, rowIndex }); rowIsValid = false; }
                            else { console.warn(`[Validation Log] Row ${rowIndex}, Field ${rule.field}: Invalid date format. Value: ${fieldValue}`); }
                        } else {
                            cleanedRow[rule.field] = dateValue.toISOString();
                        }
                        break;
                    case 'object':
                        if (typeof fieldValue !== 'object' || Array.isArray(fieldValue)) {
                            if (rule.transformOnFail === 'default' && rule.defaultValue !== undefined) cleanedRow[rule.field] = rule.defaultValue;
                            else if (rule.transformOnFail === 'null') cleanedRow[rule.field] = null;
                            else if (rule.transformOnFail !== 'log_only') { errors.push({ field: rule.field, message: `Expected object, got ${typeof fieldValue}.`, value: fieldValue, rowIndex }); rowIsValid = false; }
                            else { console.warn(`[Validation Log] Row ${rowIndex}, Field ${rule.field}: Expected object, got ${typeof fieldValue}. Value: ${fieldValue}`); }
                        } else if (rule.nestedRules && fieldValue) {
                            // Recursively validate nested object
                            const nestedValidation = validateAndCleanData([fieldValue], rule.nestedRules);
                            if (!nestedValidation.isValid) {
                                errors.push(...nestedValidation.errors.map(err => ({ ...err, field: `${rule.field}.${err.field}`, rowIndex })));
                                rowIsValid = false;
                            }
                            cleanedRow[rule.field] = nestedValidation.cleanedData[0];
                        }
                        break;
                    case 'array':
                        if (!Array.isArray(fieldValue)) {
                            if (rule.transformOnFail === 'default' && rule.defaultValue !== undefined) cleanedRow[rule.field] = rule.defaultValue;
                            else if (rule.transformOnFail === 'null') cleanedRow[rule.field] = null;
                            else if (rule.transformOnFail !== 'log_only') { errors.push({ field: rule.field, message: `Expected array, got ${typeof fieldValue}.`, value: fieldValue, rowIndex }); rowIsValid = false; }
                            else { console.warn(`[Validation Log] Row ${rowIndex}, Field ${rule.field}: Expected array, got ${typeof fieldValue}. Value: ${fieldValue}`); }
                        } else if (rule.nestedRules && fieldValue) {
                            // Recursively validate each item in the array
                            const arrayValidation = validateAndCleanData(fieldValue, rule.nestedRules);
                            if (!arrayValidation.isValid) {
                                errors.push(...arrayValidation.errors.map(err => ({ ...err, field: `${rule.field}[${err.rowIndex}].${err.field}`, rowIndex })));
                                rowIsValid = false;
                            }
                            cleanedRow[rule.field] = arrayValidation.cleanedData;
                        }
                        break;
                }
            }

            if (!isMissing && rule.enum && !rule.enum.includes(cleanedRow[rule.field])) {
                if (rule.transformOnFail !== 'log_only') { errors.push({ field: rule.field, message: `Value ${cleanedRow[rule.field]} not in allowed enum.`, value: cleanedRow[rule.field], rowIndex }); rowIsValid = false; }
                else { console.warn(`[Validation Log] Row ${rowIndex}, Field ${rule.field}: Value ${cleanedRow[rule.field]} not in allowed enum.`); }
            }
        });

        const shouldRemoveRow = !rowIsValid && rules.some(r => r.transformOnFail === 'remove_row');

        if (!shouldRemoveRow) {
            cleanedData.push(cleanedRow);
        } else {
            console.warn(`Row ${rowIndex} was removed due to validation failures.`);
        }
    });

    return { isValid: errors.length === 0, errors, cleanedData };
};
```