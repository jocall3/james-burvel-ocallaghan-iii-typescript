import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from 'react';
import Card from './Card';
import { NavItem } from '../constants';
import ViewAnalyticsPreview from './analytics/ViewAnalyticsPreview';

// --- New Imports (Conceptual, assuming existence in other parts of the universe) ---
// For richer icons
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
    ChevronUp as ChevronUpIcon
} from 'lucide-react';

// --- Core Universe Types & Interfaces ---

// Data Source Configuration: Expanded to support various data types and real-time/historical access
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
    schemaVersion?: string; // For managing data schema evolution
    transformerPipeline?: string[]; // Chain of data transformation functions (e.g., ETL)
}

export interface DataSourceConfig {
    id: string;
    name: string;
    type: DataSourceType;
    endpoint?: string; // API endpoint or database connection string identifier
    collection?: string; // Database collection/table or stream topic
    authRequired?: boolean;
    credentialsRef?: string; // Reference to secure credentials store
    query?: DataQueryParameters;
    refreshInterval?: number; // In milliseconds for real-time/pull sources
    isLive?: boolean; // Indicates if it's a real-time stream
    version?: string; // Version of the data source config itself
    dataRetentionPolicy?: string; // Policy for raw data
    dataTransformationEngine?: string; // e.g., 'Spark', 'KafkaStreams'
}

// Visualization Configuration: Supports a multitude of chart types, custom components, 3D, VR
export type VisualizationType =
    | 'LineChart'
    | 'BarChart'
    | 'PieChart'
    | 'ScatterPlot'
    | 'Table'
    | 'Heatmap'
    | 'Gauge'
    | 'Map'
    | '3DModelViewer' // Conceptual 3D visualization
    | 'CustomComponent'
    | 'TextReport'
    | 'KPIWidget'
    | 'NetworkGraph'
    | 'SankeyDiagram'
    | 'CandlestickChart'
    | 'RadarChart'
    | 'FunnelChart'
    | 'WaterfallChart'
    | 'SunburstChart'
    | 'Treemap'
    | 'WordCloud'
    | 'MarkdownRenderer'
    | 'CodeBlock'
    | 'InteractiveDiagram'
    | 'MultiMetricCard'
    | 'DataGrid'
    | 'TrendIndicator'
    | 'Timeline'
    | 'GanttChart'
    | 'ForceDirectedGraph'
    | 'GeospatialAnalysis'
    | 'KnowledgeGraph'
    | 'SentimentGauge'
    | 'ProgressMeter'
    | 'AlertList'
    | 'EventLog'
    | 'UserActivityFeed'
    | 'ResourceMonitor'
    | 'RealtimeDashboard'
    | 'AnomalyDetectionVisualizer'
    | 'PredictionForecastChart'
    | 'NLPQueryDisplay'
    | 'ChatBotInterface'
    | 'VRScene' // Conceptual VR integration
    | 'AROverlay' // Conceptual AR integration
    | 'DecisionTreeViewer'
    | 'ScenarioComparison'
    | 'FinancialStatement'
    | 'ProjectTimeline'
    | 'RiskMatrix'
    | 'SurveyResults'
    | 'CustomerJourneyMap';

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
    dataMapping?: Record<string, string>; // Maps raw data fields to chart properties (e.g., { 'x': 'timestamp', 'y': 'value' })
    thresholds?: Array<{ value: number; color: string; label: string; operator: '>' | '<' | '=' | '>=' | '<=' }>;
    animationsEnabled?: boolean;
    customOptions?: Record<string, any>; // For passing specific options to underlying chart libraries
    componentProps?: Record<string, any>; // For 'CustomComponent' type
    exportFormats?: string[]; // e.g., ['PNG', 'CSV', 'PDF']
    accessibilityFeatures?: string[]; // e.g., ['screenReader', 'colorBlindMode']
}

// AI/ML Integration: Advanced models, real-time inference, explainability
export type AIModelType = 'Predictive' | 'AnomalyDetection' | 'NLP' | 'Recommendation' | 'Generative' | 'ReinforcementLearning' | 'ComputerVision' | 'Forecasting' | 'Clustering' | 'Classification';
export type AIScope = 'TileData' | 'GlobalData' | 'UserContext' | 'CrossTile';

export interface AIMLConfig {
    modelId: string; // Identifier for the AI model service
    modelType: AIModelType;
    inputMapping?: Record<string, string>; // Maps tile data fields to model input features
    outputMapping?: Record<string, string>; // Maps model output to displayable fields
    triggerCondition?: 'onLoad' | 'onDataChange' | 'onInterval' | 'onUserInteraction' | 'manual' | 'scheduled';
    updateInterval?: number; // For 'onInterval' trigger
    explainabilityEnabled?: boolean; // SHAP, LIME, etc.
    confidenceThreshold?: number; // For displaying predictions/anomalies
    scope?: AIScope;
    version?: string; // Model version
    feedbackLoopEnabled?: boolean; // For user feedback to improve model
    realtimeInference?: boolean;
    alertOnAnomaly?: boolean;
    alertSeverity?: 'low' | 'medium' | 'high' | 'critical';
    autoCorrectData?: boolean; // AI attempts to correct data anomalies
    scenarioGenerationEnabled?: boolean; // AI can generate what-if scenarios
    naturalLanguageGenerationEnabled?: boolean; // AI can generate text summaries
}

// Interactivity & Actions: What a user can do with the tile
export type TileActionType = 'DrillDown' | 'FilterData' | 'OpenLink' | 'ExecuteReport' | 'SendMessage' | 'TriggerWorkflow' | 'UpdateDataSource' | 'SaveState' | 'ShareTile' | 'EmbedTile' | 'PrintTile' | 'FullScreen' | 'EditConfig' | 'RunSimulation' | 'AIAssist' | 'ResetFilters';

export interface TileAction {
    id: string;
    label: string;
    icon?: React.ReactElement;
    type: TileActionType;
    config?: Record<string, any>; // Specific configuration for the action type (e.g., target URL, report ID)
    permissionRequired?: string[]; // E.g., ['can_drill_down_sales']
    isVisibleCondition?: string; // JS expression or rule ID for dynamic visibility based on data/state
    isDisabledCondition?: string; // JS expression or rule ID for dynamic disable state
    tooltip?: string;
    confirmationRequired?: boolean;
}

// Alerting & Notifications: Real-time alerts based on data or AI insights
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';
export type NotificationChannel = 'Email' | 'Slack' | 'Teams' | 'SMS' | 'InApp' | 'Webhook' | 'PagerDuty';

export interface AlertCondition {
    field: string;
    operator: '>' | '<' | '=' | '>=' | '<=' | '!=' | 'contains' | 'startsWith' | 'endsWith' | 'isNull' | 'isNotNull' | 'in';
    value: string | number | boolean | null | Array<string | number | boolean>;
    comparisonField?: string; // For comparing two fields
    logicalOperator?: 'AND' | 'OR'; // For combining conditions within a single alert config
}

export interface TileAlertConfig {
    id: string;
    name: string;
    description?: string;
    conditions: AlertCondition[]; // Array of conditions, implicitly ANDed by default, or combined with logicalOperator
    severity: AlertSeverity;
    channels: NotificationChannel[];
    recipients?: string[]; // User IDs or group IDs
    debounceTime?: number; // Cooldown period for alerts (ms)
    isEnabled?: boolean;
    messageTemplate?: string; // Custom message for notifications
    triggeredByAIML?: boolean; // Indicates if the alert is primarily AI-driven
    alertAction?: TileAction; // Action to take when alert is triggered
    repeatInterval?: number; // How often to re-alert if condition persists (ms)
    snoozeDuration?: number; // Option to snooze alerts (ms)
}

// Collaboration & Sharing: Multi-user features
export type ShareScope = 'public' | 'private' | 'org' | 'groups' | 'specific_users';
export type CollaborationPermission = 'viewer' | 'editor' | 'owner' | 'contributor' | 'commenter';

export interface CollaborationConfig {
    enabled?: boolean;
    sharedWith?: Array<{ userId: string; permission: CollaborationPermission; email?: string }>;
    shareScope?: ShareScope;
    allowComments?: boolean;
    allowRealtimeCoEditing?: boolean; // For tile configurations
    versionControlEnabled?: boolean; // Track changes to tile config
    approvalWorkflowEnabled?: boolean; // For publishing tile changes
    chatIntegrationEnabled?: boolean;
    annotationToolsEnabled?: boolean;
    livePresenceEnabled?: boolean; // Show who else is viewing/editing
}

// Performance & Caching
export type CacheStrategy = 'none' | 'memory' | 'localStorage' | 'server' | 'indexedDB';

export interface PerformanceConfig {
    cacheStrategy?: CacheStrategy;
    cacheDuration?: number; // In minutes, for 'server' or 'localStorage'
    lazyLoadContent?: boolean; // Load content only when visible
    priority?: number; // For resource allocation (e.g., real-time streams)
    dataCompressionEnabled?: boolean;
    preFetchData?: boolean; // Pre-fetch data for drill-downs or related tiles
    realtimeSubscriptionMode?: 'pull' | 'push' | 'hybrid';
    resourceThrottlingEnabled?: boolean; // Reduce refresh rate if resources are low
    offlineModeEnabled?: boolean;
}

// Security & Governance
export type AccessPolicyType = 'role-based' | 'attribute-based' | 'permission-based' | 'context-aware';

export interface TileAccessPolicy {
    type: AccessPolicyType;
    roles?: string[]; // Required roles
    permissions?: string[]; // Required specific permissions (e.g., 'dashboard:tile:view:sales')
    attributeRules?: Array<{ attribute: string; operator: string; value: string | string[] }>; // e.g., 'department = Sales'
    restrictedFields?: string[]; // Fields within the data source that should be masked/hidden
    dataAnonymizationEnabled?: boolean;
    auditLogEnabled?: boolean;
    encryptionAtRest?: boolean;
    encryptionInTransit?: boolean;
    dataMaskingRules?: Array<{ field: string; rule: 'hash' | 'redact' | 'partial' }>;
}

// Eventing & Inter-Tile Communication
export type TileEventType = 'dataUpdate' | 'selectionChange' | 'actionTriggered' | 'alertTriggered' | 'configChange' | 'userInteraction' | 'drillDown' | 'filterApplied' | 'aiInsightGenerated' | 'commentAdded';

export interface TileEvent {
    type: TileEventType;
    sourceTileId: string;
    payload: Record<string, any>;
    timestamp: string;
    userId?: string;
    context?: Record<string, any>; // Additional context for the event
}

export interface EventSubscription {
    sourceTileId: string | 'any'; // Listen to events from a specific tile or all tiles
    eventType: TileEventType | 'all';
    actionOnEvent: TileAction; // What to do when the event occurs
    condition?: string; // JS expression to filter events (e.g., 'payload.value > 100')
}

// Dynamic UI Customization (themes, layout, responsive behavior)
export type LayoutType = 'grid' | 'flex' | 'absolute' | 'responsive';
export type ResponsiveBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface UIDesignConfig {
    themePreset?: 'system' | 'light' | 'dark' | 'corporate' | 'neonwave' | 'minimalist' | 'high_contrast';
    customStyling?: string; // CSS or Tailwind classes
    layoutType?: LayoutType;
    responsiveConfig?: Record<ResponsiveBreakpoint, { width?: string | number; height?: string | number; display?: 'block' | 'none' | 'flex' }>;
    fontFamily?: string;
    headerVisibility?: 'always' | 'hover' | 'never' | 'auto';
    footerVisibility?: 'always' | 'hover' | 'never' | 'auto';
    borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    backgroundColor?: string;
    borderColor?: string;
    shadowEffect?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    draggable?: boolean;
    resizable?: boolean;
    hideOnConditions?: string; // JS expression for hiding the tile
    componentOverrides?: Record<string, string>; // For swapping out default sub-components
    iconSet?: 'lucide' | 'material' | 'custom';
    hoverEffectsEnabled?: boolean;
}

// Master Tile Configuration (the "universe" of a tile)
export interface TileConfiguration extends NavItem { // Extends NavItem to inherit id, label, icon
    version: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastModifiedBy: string;
    description?: string;
    tags?: string[];
    category?: string;
    status: 'draft' | 'published' | 'archived' | 'pending_approval' | 'deprecated';
    ownerId: string;
    organizationId?: string;

    dataSources: DataSourceConfig[];
    visualization: ChartConfig;
    aiMlConfig?: AIMLConfig;
    actions?: TileAction[];
    alerts?: TileAlertConfig[];
    collaboration?: CollaborationConfig;
    performance?: PerformanceConfig;
    accessPolicy?: TileAccessPolicy;
    eventSubscriptions?: EventSubscription[];
    uiDesign?: UIDesignConfig;

    // Advanced features
    semanticLayerConfig?: { // For understanding the meaning of data
        ontologyId: string;
        mappingRules?: Record<string, string>; // Maps data fields to ontology concepts
        naturalLanguageQueryEnabled?: boolean;
        glossaryTerms?: string[];
    };
    integrationConfig?: { // For connecting with external systems
        serviceId: string;
        parameters?: Record<string, any>;
        callbackUrl?: string;
        syncFrequency?: string; // e.g., 'hourly', 'daily'
        biDirectionalSync?: boolean;
    };
    simulationConfig?: { // For "what-if" analysis
        enabled: boolean;
        scenarioTemplates?: string[];
        simulationModelId?: string;
        inputParameters?: Record<string, any>;
        outputMetrics?: string[];
        comparisonEnabled?: boolean;
    };
    historyTracking?: { // For data and config versioning
        dataRetentionPolicy?: string; // e.g., '1 year', '3 months'
        configRetentionPolicy?: string;
        dataVersionControlEnabled?: boolean;
        snapshotFrequency?: string; // e.g., 'daily', 'weekly'
    };
    costOptimizationConfig?: { // For cloud resource management
        estimatedUsageCost?: number;
        costCenterId?: string;
        resourceAllocationPriority?: 'low' | 'medium' | 'high';
        autoScaleResources?: boolean;
    };
    complianceConfig?: { // GDPR, HIPAA, SOX, etc.
        regionSpecificRules?: string[];
        dataPrivacyLevel?: 'public' | 'restricted' | 'confidential' | 'highly_sensitive';
        retentionPolicyId?: string;
        auditLoggingLevel?: 'minimal' | 'detailed' | 'verbose';
    };
    auditTrail?: Array<{ // Log of all significant changes to the tile config
        timestamp: string;
        userId: string;
        action: string; // e.g., 'created', 'updated', 'published', 'data_refreshed'
        details?: Record<string, any>;
        versionBefore?: string;
        versionAfter?: string;
    }>;
    featureFlags?: Record<string, boolean>; // Runtime feature toggles
    customMetadata?: Record<string, any>; // Any other arbitrary metadata
}

// --- New Components, Hooks, and Utilities for the "Universe" ---

// Context for providing tile-specific data and actions down the tree
export interface TileUniverseContextType {
    tileConfig: TileConfiguration;
    currentData: any; // The processed data currently displayed
    isLoading: boolean;
    error: Error | null;
    triggerAction: (actionId: string, payload?: Record<string, any>) => void;
    updateTileConfig: (newConfig: Partial<TileConfiguration>) => void;
    logUserInteraction: (interactionType: string, details: Record<string, any>) => void;
    emitTileEvent: (eventType: TileEventType, payload: Record<string, any>) => void;
    subscribeToExternalEvents: (eventType: TileEventType, callback: (event: TileEvent) => void) => () => void;
    aiInsights?: any; // AI generated insights
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

// Hook for fetching and processing data based on DataSourceConfig
export const useTileData = (dataSources: DataSourceConfig[], performanceConfig?: PerformanceConfig) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const dataFetchAbortController = useRef<AbortController | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        if (dataFetchAbortController.current) {
            dataFetchAbortController.current.abort();
        }
        dataFetchAbortController.current = new AbortController();
        const signal = dataFetchAbortController.current.signal;

        try {
            const allData = await Promise.all(
                dataSources.map(async (source) => {
                    console.log(`Fetching data from: ${source.endpoint || source.collection} of type ${source.type}`);

                    if (source.type === 'RealtimeStream') {
                        // Conceptual: subscribe to a real-time stream service
                        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate stream init
                        return { id: source.id, timestamp: Date.now(), value: Math.random() * 100, streamType: source.collection, label: `Live Stream ${source.id}` };
                    } else if (source.type === 'API' || source.type === 'Database' || source.type === 'ExternalService') {
                        const mockResponse = {
                            id: source.id,
                            timestamp: Date.now(),
                            value: Math.floor(Math.random() * 1000),
                            label: source.name,
                            details: `Data from ${source.endpoint || source.collection}`,
                            historicalData: Array.from({ length: 30 }, (_, i) => ({
                                date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                value: Math.floor(Math.random() * 500) + 100 * (i / 30) // Simulate some trend
                            })),
                            multiSeries: [
                                { name: 'Series A', data: Array.from({ length: 30 }, (_, i) => Math.floor(Math.random() * 200) + 50) },
                                { name: 'Series B', data: Array.from({ length: 30 }, (_, i) => Math.floor(Math.random() * 150) + 100) },
                            ]
                        };
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
                        if (signal.aborted) {
                            throw new Error('Data fetch aborted');
                        }
                        return mockResponse;
                    }
                    return null;
                })
            );
            setData(allData.filter(Boolean));
        } catch (err) {
            if (!signal.aborted) {
                setError(err as Error);
                console.error('Error fetching tile data:', err);
            }
        } finally {
            if (!signal.aborted) {
                setIsLoading(false);
            }
        }
    }, [dataSources, performanceConfig]);

    useEffect(() => {
        fetchData();
        const refreshInterval = performanceConfig?.realtimeSubscriptionMode === 'pull' && dataSources.some(ds => ds.refreshInterval)
            ? Math.min(...dataSources.map(ds => ds.refreshInterval || Infinity))
            : null;

        let intervalId: NodeJS.Timeout | undefined;
        if (refreshInterval && refreshInterval !== Infinity) {
            intervalId = setInterval(fetchData, refreshInterval);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
            if (dataFetchAbortController.current) {
                dataFetchAbortController.current.abort();
            }
        };
    }, [fetchData, performanceConfig]);

    return { data, isLoading, error, refetch: fetchData };
};

// Hook for AI/ML insights
export const useAIInsights = (data: any, aiMlConfig?: AIMLConfig) => {
    const [insights, setInsights] = useState<any>(null);
    const [isAILoading, setIsAILoading] = useState(false);
    const [aiError, setAIError] = useState<Error | null>(null);

    useEffect(() => {
        if (!aiMlConfig || !data || data.length === 0) {
            setInsights(null);
            return;
        }

        const runAIModel = async () => {
            setIsAILoading(true);
            setAIError(null);
            try {
                console.log(`Running AI model: ${aiMlConfig.modelId} (Type: ${aiMlConfig.modelType})`);
                await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI model inference
                const mockOutput = {
                    predictions: data.map((d: any) => ({
                        id: d.id,
                        predictedValue: d.value * (1 + (Math.random() - 0.5) * 0.2), // +/- 10%
                        confidence: Math.random() * 0.2 + 0.8 // 80-100% confidence
                    })),
                    anomalies: Math.random() > 0.8 ? [{ id: data[0]?.id, type: 'spike', severity: 'high', threshold: 800, detectedAt: new Date().toISOString() }] : [],
                    sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
                    summary: `AI generated summary for ${data.length} data points. Predicted future trend is generally ${Math.random() > 0.5 ? 'upward' : 'downward'}. ${aiMlConfig.explainabilityEnabled ? 'Key factors contributing to this trend include recent market shifts.' : ''}`,
                    recommendations: Math.random() > 0.7 ? ['Optimize resource allocation', 'Investigate data source integrity'] : [],
                    generativeText: `Based on the provided ${data.length} data points, the system identifies a ${Math.random() > 0.5 ? 'robust' : 'moderated'} performance. The primary driver appears to be related to the '${data[0]?.label || 'unlabeled'}' metric.`
                };
                setInsights(mockOutput);
            } catch (err) {
                setAIError(err as Error);
                console.error('Error running AI model:', err);
            } finally {
                setIsAILoading(false);
            }
        };

        // Trigger condition logic (simplified)
        if (aiMlConfig.triggerCondition === 'onLoad' || aiMlConfig.triggerCondition === 'onDataChange') {
            runAIModel();
        } else if (aiMlConfig.triggerCondition === 'onInterval' && aiMlConfig.updateInterval) {
            const intervalId = setInterval(runAIModel, aiMlConfig.updateInterval);
            return () => clearInterval(intervalId);
        }
        // Additional trigger conditions like 'scheduled' or 'onUserInteraction' would be handled elsewhere.
    }, [data, aiMlConfig]);

    return { insights, isAILoading, aiError };
};

// Component for rendering dynamic visualizations
export const DynamicTileRenderer: React.FC<{
    visualizationConfig: ChartConfig;
    data: any;
    isLoading?: boolean;
    error?: Error | null;
    aiInsights?: any;
    triggerAction: (actionId: string, payload?: Record<string, any>) => void;
    logUserInteraction: (interactionType: string, details: Record<string, any>) => void;
}> = ({ visualizationConfig, data, isLoading, error, aiInsights, triggerAction, logUserInteraction }) => {
    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-full text-gray-400">Loading data...</div>;
        }
        if (error) {
            return <div className="flex justify-center items-center h-full text-red-400">Error: {error.message}</div>;
        }
        if (!data || data.length === 0) {
            return <div className="flex justify-center items-center h-full text-gray-500">No data available.</div>;
        }

        switch (visualizationConfig.type) {
            case 'LineChart':
            case 'BarChart':
            case 'PieChart':
            case 'ScatterPlot':
            case 'Heatmap':
            case 'Gauge':
            case 'Map':
                return (
                    <div className="p-4 h-full relative">
                        <h3 className="text-white text-md font-semibold mb-2">{visualizationConfig.title || 'Chart'}</h3>
                        <div className="h-[calc(100%-30px)] bg-gray-800 rounded flex justify-center items-center text-gray-400 text-sm">
                            <span className="animate-pulse">{`${visualizationConfig.type} Placeholder (Interactive)`}</span>
                            {aiInsights?.predictions && (
                                <div className="absolute top-2 right-2 text-cyan-300 text-xs">AI Predictions: {aiInsights.predictions.length}</div>
                            )}
                            {aiInsights?.anomalies && aiInsights.anomalies.length > 0 && (
                                <div className="absolute top-2 left-2 text-red-300 text-xs flex items-center gap-1">
                                    <AlertIcon className="h-3 w-3" /> Anomalies: {aiInsights.anomalies.length}
                                </div>
                            )}
                            {visualizationConfig.drillDownEnabled && (
                                <button
                                    className="absolute bottom-2 right-2 px-3 py-1 bg-cyan-600 text-white rounded-md text-xs hover:bg-cyan-700 transition-colors"
                                    onClick={() => triggerAction('drill-down', { chartType: visualizationConfig.type })}
                                >
                                    Drill Down
                                </button>
                            )}
                        </div>
                    </div>
                );
            case 'Table':
            case 'DataGrid':
                return (
                    <div className="p-4 h-full overflow-auto">
                        <h3 className="text-white text-md font-semibold mb-2">{visualizationConfig.title || 'Data Table'}</h3>
                        <table className="min-w-full text-xs text-gray-300">
                            <thead className="bg-gray-700 sticky top-0 z-10">
                                <tr>
                                    {data && data.length > 0 && Object.keys(data[0]).map(key => <th key={key} className="px-2 py-1 text-left">{key}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row: any, index: number) => (
                                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        {Object.values(row).map((val: any, i: number) => <td key={i} className="px-2 py-1">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {aiInsights?.anomalies && aiInsights.anomalies.length > 0 && (
                            <div className="mt-2 text-red-300 text-sm flex items-center gap-1">
                                <AlertIcon className="h-4 w-4" /> Anomalies detected: {aiInsights.anomalies.map((a: any) => a.type).join(', ')}
                            </div>
                        )}
                        {aiInsights?.recommendations && aiInsights.recommendations.length > 0 && (
                            <div className="mt-2 text-green-300 text-xs">
                                Recommendations: {aiInsights.recommendations.join('; ')}
                            </div>
                        )}
                    </div>
                );
            case 'KPIWidget':
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
            case 'TextReport':
            case 'MarkdownRenderer':
                return (
                    <div className="p-4 h-full overflow-auto text-gray-300 prose prose-invert">
                        <h3 className="text-white text-md font-semibold mb-2">{visualizationConfig.title || 'Report'}</h3>
                        {aiInsights?.generativeText ? <p>{aiInsights.generativeText}</p> : aiInsights?.summary ? <p>{aiInsights.summary}</p> : <p>Detailed report content or AI-generated narrative would appear here.</p>}
                        <p className="mt-4 text-xs text-gray-500">Generated at: {new Date().toLocaleString()}</p>
                        {data && <pre className="bg-gray-800 p-2 rounded mt-2 text-xs overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>}
                    </div>
                );
            case 'ChatBotInterface':
                return (
                    <div className="p-4 h-full flex flex-col">
                        <h3 className="text-white text-md font-semibold mb-2">{visualizationConfig.title || 'AI Chatbot'}</h3>
                        <div className="flex-grow bg-gray-800 rounded p-3 overflow-y-auto text-sm text-gray-300 mb-2">
                            <p><strong>Bot:</strong> Hello! How can I assist you with this data?</p>
                            <p className="text-right text-cyan-400"><strong>You:</strong> What are the key trends?</p>
                            <p><strong>Bot:</strong> Based on the current data, the primary trend for '{data?.[0]?.label || 'value'}' is showing a {Math.random() > 0.5 ? 'steady increase' : 'slight decrease'} over the last month. {aiInsights?.summary && aiInsights.summary}</p>
                            {aiInsights?.generativeText && <p><strong>Bot:</strong> My detailed analysis indicates: "{aiInsights.generativeText}"</p>}
                        </div>
                        <input
                            type="text"
                            placeholder="Ask a question..."
                            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    console.log('Chat query:', (e.target as HTMLInputElement).value);
                                    logUserInteraction('chat_query', { query: (e.target as HTMLInputElement).value });
                                    (e.target as HTMLInputElement).value = ''; // Clear input
                                }
                            }}
                        />
                    </div>
                );
            case 'CustomComponent':
                // Dynamically load/render a custom React component based on configuration
                // This would typically involve a component registry and lazy loading
                return (
                    <div className="p-4 h-full bg-gray-800 flex flex-col justify-center items-center text-gray-400 text-sm">
                        <ZapIcon className="h-8 w-8 mb-2 text-cyan-400" />
                        <p>Rendering Custom Component:</p>
                        <p className="font-mono text-cyan-400">{visualizationConfig.componentProps?.componentName || 'Unknown'}</p>
                        <p className="text-xs mt-2">Props: <pre className="text-gray-600">{JSON.stringify(visualizationConfig.componentProps, null, 2)}</pre></p>
                        {/* <LazyLoadedCustomComponent {...visualizationConfig.componentProps} data={data} /> */}
                    </div>
                );
            default:
                return (
                    <div className="flex justify-center items-center h-full text-gray-500 flex-col p-4">
                        <LayersIcon className="h-10 w-10 mb-2 text-gray-600" />
                        <p>Unsupported Visualization Type:</p>
                        <p className="font-mono text-cyan-400">{visualizationConfig.type}</p>
                        <p className="text-xs mt-2">Data Sample: <pre className="text-gray-600">{JSON.stringify(data?.[0], null, 2)}</pre></p>
                    </div>
                );
        }
    };

    return <div className="h-full w-full">{renderContent()}</div>;
};

// Component for rendering tile actions (buttons, menus)
export const TileActionsMenu: React.FC<{
    actions: TileAction[];
    onActionTriggered: (actionId: string, payload?: Record<string, any>) => void;
    userPermissions?: string[]; // For permission-based visibility
    currentData?: any; // For data-driven visibility/disability
}> = ({ actions, onActionTriggered, userPermissions = [], currentData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleMenu = useCallback(() => setIsOpen(prev => !prev), []);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClickOutside]);

    const evaluateCondition = useCallback((condition?: string) => {
        if (!condition) return true;
        try {
            // WARNING: In a real app, evaluating arbitrary JS is a security risk.
            // A more robust solution would involve a rule engine or a safe sandboxed environment.
            const dataContext = currentData?.[0] || {}; // Simplified: use first data point
            // Example condition: "dataContext.value > 100" or "userPermissions.includes('admin')"
            // This mock simply checks for explicit "false" or "true" for safety.
            if (condition === 'alwaysFalse') return false;
            if (condition === 'alwaysTrue') return true;
            return true; // Default to true for unknown conditions in mock
        } catch (e) {
            console.warn('Invalid condition expression:', condition, e);
            return false;
        }
    }, [currentData]);

    const visibleAndEnabledActions = useMemo(() => {
        return actions.filter(action => {
            // Check visibility based on permissions and dynamic conditions
            const isPermitted = !action.permissionRequired || action.permissionRequired.some(p => userPermissions.includes(p));
            const isVisible = evaluateCondition(action.isVisibleCondition);
            const isEnabled = !evaluateCondition(action.isDisabledCondition); // Action is enabled if not disabled

            return isPermitted && isVisible && isEnabled;
        });
    }, [actions, userPermissions, currentData, evaluateCondition]); // Include currentData to re-evaluate conditions

    if (visibleAndEnabledActions.length === 0) return null;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={toggleMenu}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                aria-label="More actions"
                title="Tile Actions"
            >
                <SettingsIcon className="h-5 w-5" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-20">
                    <ul className="py-1">
                        {visibleAndEnabledActions.map(action => (
                            <li key={action.id}>
                                <button
                                    onClick={() => {
                                        if (action.confirmationRequired && !window.confirm(`Are you sure you want to "${action.label}"?`)) {
                                            return;
                                        }
                                        onActionTriggered(action.id, action.config);
                                        setIsOpen(false);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-cyan-600 hover:text-white"
                                    title={action.tooltip}
                                >
                                    {action.icon && React.cloneElement(action.icon, { className: 'h-4 w-4 mr-2' })}
                                    {action.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// Component for displaying AI-generated alerts and notifications
export const TileAlertsAndNotifications: React.FC<{
    alertsConfig?: TileAlertConfig[];
    currentData?: any;
    aiInsights?: any;
    onAlertTriggered: (alertId: string, payload?: Record<string, any>) => void;
}> = ({ alertsConfig, currentData, aiInsights, onAlertTriggered }) => {
    const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
    const triggeredAlertsRef = useRef(new Set<string>()); // To prevent re-triggering within debounce

    useEffect(() => {
        if (!alertsConfig || !currentData) {
            setActiveAlerts([]);
            return;
        }

        const newActiveAlerts: any[] = [];
        alertsConfig.forEach(alert => {
            if (alert.isEnabled) {
                let isTriggered = false;
                if (alert.conditions && currentData && currentData.length > 0) {
                    const dataPoint = currentData[0]; // For simplicity, check first data point
                    isTriggered = alert.conditions.every(condition => {
                        const fieldValue = dataPoint[condition.field];
                        if (fieldValue === undefined) return false;

                        switch (condition.operator) {
                            case '>': return fieldValue > (condition.value as number);
                            case '<': return fieldValue < (condition.value as number);
                            case '=': return fieldValue == condition.value;
                            case '>=': return fieldValue >= (condition.value as number);
                            case '<=': return fieldValue <= (condition.value as number);
                            case '!=': return fieldValue != condition.value;
                            case 'contains': return typeof fieldValue === 'string' && typeof condition.value === 'string' && fieldValue.includes(condition.value);
                            case 'startsWith': return typeof fieldValue === 'string' && typeof condition.value === 'string' && fieldValue.startsWith(condition.value);
                            case 'endsWith': return typeof fieldValue === 'string' && typeof condition.value === 'string' && fieldValue.endsWith(condition.value);
                            case 'isNull': return fieldValue === null || fieldValue === undefined;
                            case 'isNotNull': return fieldValue !== null && fieldValue !== undefined;
                            case 'in': return Array.isArray(condition.value) && condition.value.includes(fieldValue);
                            default: return false;
                        }
                    });
                }

                if (alert.triggeredByAIML && aiInsights && aiInsights.anomalies && aiInsights.anomalies.length > 0) {
                    const matchedAnomaly = aiInsights.anomalies.find((a: any) =>
                        a.severity === alert.severity || alert.severity === 'info' // Simplified matching
                    );
                    if (matchedAnomaly) isTriggered = true;
                }

                if (isTriggered) {
                    newActiveAlerts.push({
                        ...alert,
                        triggeredAt: new Date().toISOString(),
                        details: { data: currentData, ai: aiInsights }
                    });

                    // Trigger action if not recently debounced
                    if (!triggeredAlertsRef.current.has(alert.id)) {
                        onAlertTriggered(alert.id, { alertConfig: alert, data: currentData, aiInsights });
                        triggeredAlertsRef.current.add(alert.id);
                        if (alert.debounceTime) {
                            setTimeout(() => triggeredAlertsRef.current.delete(alert.id), alert.debounceTime);
                        }
                    }
                }
            }
        });
        setActiveAlerts(newActiveAlerts);
    }, [alertsConfig, currentData, aiInsights, onAlertTriggered]);

    if (activeAlerts.length === 0) return null;

    return (
        <div className="p-2 border-t border-red-700/50 bg-red-900/20 text-red-300 text-xs flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <AlertIcon className="h-4 w-4 flex-shrink-0" />
            <span className="font-semibold flex-shrink-0">ACTIVE ALERTS ({activeAlerts.length}):</span>
            {activeAlerts.map((alert, index) => (
                <span key={alert.id || index} className="px-2 py-0.5 bg-red-800 rounded-full flex-shrink-0" title={alert.description}>
                    {alert.name} ({alert.severity.toUpperCase()})
                </span>
            ))}
        </div>
    );
};

// Component for collaboration status and controls
export const CollaborationStatusIndicator: React.FC<{
    collaborationConfig?: CollaborationConfig;
    tileId: string;
    onManageSharing: () => void;
}> = ({ collaborationConfig, tileId, onManageSharing }) => {
    const [isShared, setIsShared] = useState(false);

    useEffect(() => {
        if (collaborationConfig?.enabled && collaborationConfig.sharedWith && collaborationConfig.sharedWith.length > 0) {
            setIsShared(true);
        } else {
            setIsShared(false);
        }
    }, [collaborationConfig]);

    if (!collaborationConfig?.enabled) return null;

    return (
        <div className="flex items-center gap-2 text-gray-500 text-xs">
            {isShared ? (
                <span className="flex items-center text-cyan-400" title={`Shared with ${collaborationConfig.sharedWith?.length} users`}>
                    <ShareIcon className="h-4 w-4 mr-1" /> Shared ({collaborationConfig.sharedWith?.length || 0})
                </span>
            ) : (
                <span className="flex items-center" title="Not currently shared">
                    <ShareIcon className="h-4 w-4 mr-1" /> Not Shared
                </span>
            )}
            <button
                onClick={onManageSharing}
                className="px-2 py-0.5 bg-gray-700 rounded-md text-white hover:bg-cyan-600 transition-colors text-xs"
            >
                Manage Sharing
            </button>
        </div>
    );
};

// Component for comments section
export const TileCommentSection: React.FC<{
    tileId: string;
    allowComments?: boolean;
    currentUser?: string; // Realistically from an AuthContext
}> = ({ tileId, allowComments, currentUser = 'AnonUser' }) => {
    if (!allowComments) return null;

    const [comments, setComments] = useState<Array<{ id: string; userId: string; text: string; timestamp: string }>>([]);
    const [newComment, setNewComment] = useState('');
    const commentsEndRef = useRef<HTMLDivElement>(null);

    const addComment = useCallback(() => {
        if (newComment.trim()) {
            const comment = {
                id: `cmt-${Date.now()}`,
                userId: currentUser,
                text: newComment,
                timestamp: new Date().toISOString()
            };
            setComments(prev => [...prev, comment]);
            setNewComment('');
            console.log(`Comment added to tile ${tileId}:`, comment);
            // In a real app, this would dispatch to a backend service and emit a 'commentAdded' event
        }
    }, [newComment, tileId, currentUser]);

    // Simulate fetching comments on mount
    useEffect(() => {
        // fetchCommentsForTile(tileId).then(setComments);
        setComments([
            { id: '1', userId: 'analyst_a', text: 'Looks like a great dashboard! Any plans to add Q3 projections?', timestamp: new Date(Date.now() - 3600000).toISOString() },
            { id: '2', userId: 'manager_b', text: 'Good point, analyst_a. Let\'s discuss in next meeting.', timestamp: new Date(Date.now() - 1800000).toISOString() }
        ]);
    }, [tileId]);

    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    return (
        <div className="p-4 border-t border-gray-700/50 bg-gray-800/50">
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center">
                <CommentIcon className="h-4 w-4 mr-2 text-gray-400" />
                Comments ({comments.length})
            </h4>
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {comments.map(comment => (
                    <div key={comment.id} className="text-xs text-gray-400">
                        <span className="font-semibold text-cyan-400">{comment.userId}</span> at <span className="text-gray-500">{new Date(comment.timestamp).toLocaleTimeString()}</span>:
                        <p className="text-white ml-2 mt-0.5">{comment.text}</p>
                    </div>
                ))}
                <div ref={commentsEndRef} />
            </div>
            <div className="mt-3 flex gap-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-grow p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && addComment()}
                />
                <button
                    onClick={addComment}
                    className="px-3 py-1 bg-cyan-600 rounded text-white text-sm hover:bg-cyan-700 transition-colors"
                >
                    Post
                </button>
            </div>
        </div>
    );
};

// Advanced Sharing Modal
export const AdvancedSharingModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    tileConfig: TileConfiguration;
    onSave: (config: Partial<TileConfiguration>) => void;
}> = ({ isOpen, onClose, tileConfig, onSave }) => {
    const [tempConfig, setTempConfig] = useState<CollaborationConfig>(tileConfig.collaboration || { enabled: true, sharedWith: [] });
    const [newShareEmail, setNewShareEmail] = useState('');
    const [newSharePermission, setNewSharePermission] = useState<CollaborationPermission>('viewer');

    useEffect(() => {
        setTempConfig(tileConfig.collaboration || { enabled: true, sharedWith: [] });
    }, [tileConfig.collaboration, isOpen]);

    const handleAddUser = () => {
        if (newShareEmail && !tempConfig.sharedWith?.some(u => u.email === newShareEmail)) {
            setTempConfig(prev => ({
                ...prev,
                sharedWith: [...(prev.sharedWith || []), { userId: `user-${Date.now()}`, email: newShareEmail, permission: newSharePermission }]
            }));
            setNewShareEmail('');
        }
    };

    const handleRemoveUser = (email: string) => {
        setTempConfig(prev => ({
            ...prev,
            sharedWith: prev.sharedWith?.filter(u => u.email !== email)
        }));
    };

    const handlePermissionChange = (email: string, permission: CollaborationPermission) => {
        setTempConfig(prev => ({
            ...prev,
            sharedWith: prev.sharedWith?.map(u => u.email === email ? { ...u, permission } : u)
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-2xl">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-xl text-white">Share Tile: {tileConfig.label}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <div>
                        <label className="block text-gray-300 text-sm mb-2">Share Link (Read-Only Public Access)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                value={`https://app.universe.com/share/tile/${tileConfig.id}`}
                                className="flex-grow p-2 rounded bg-gray-800 border border-gray-700 text-gray-300 text-sm"
                            />
                            <button className="px-3 py-2 bg-cyan-600 rounded text-white text-sm hover:bg-cyan-700 transition-colors">Copy</button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm mb-2">Share with Specific Users/Groups</label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="email"
                                placeholder="Enter email address"
                                value={newShareEmail}
                                onChange={(e) => setNewShareEmail(e.target.value)}
                                className="flex-grow p-2 rounded bg-gray-800 border border-gray-700 text-white text-sm"
                            />
                            <select
                                value={newSharePermission}
                                onChange={(e) => setNewSharePermission(e.target.value as CollaborationPermission)}
                                className="p-2 rounded bg-gray-800 border border-gray-700 text-white text-sm"
                            >
                                <option value="viewer">Viewer</option>
                                <option value="commenter">Commenter</option>
                                <option value="contributor">Contributor</option>
                                <option value="editor">Editor</option>
                                <option value="owner">Owner</option>
                            </select>
                            <button onClick={handleAddUser} className="px-3 py-2 bg-cyan-600 rounded text-white text-sm hover:bg-cyan-700 transition-colors">Add</button>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded p-3">
                            <h4 className="text-gray-300 text-sm mb-2">Shared With:</h4>
                            {tempConfig.sharedWith && tempConfig.sharedWith.length > 0 ? (
                                <ul className="space-y-2">
                                    {tempConfig.sharedWith.map(user => (
                                        <li key={user.email} className="flex items-center justify-between text-sm text-gray-300">
                                            <span>{user.email || user.userId}</span>
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={user.permission}
                                                    onChange={(e) => handlePermissionChange(user.email || '', e.target.value as CollaborationPermission)}
                                                    className="p-1 rounded bg-gray-700 border border-gray-600 text-white text-xs"
                                                >
                                                    <option value="viewer">Viewer</option>
                                                    <option value="commenter">Commenter</option>
                                                    <option value="contributor">Contributor</option>
                                                    <option value="editor">Editor</option>
                                                    <option value="owner">Owner</option>
                                                </select>
                                                <button onClick={() => handleRemoveUser(user.email || '')} className="text-red-400 hover:text-red-300">
                                                    <XIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 italic">No users or groups added yet.</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm mb-2">Collaboration Settings</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="allowComments"
                                checked={tempConfig.allowComments}
                                onChange={(e) => setTempConfig(prev => ({ ...prev, allowComments: e.target.checked }))}
                                className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded"
                            />
                            <label htmlFor="allowComments" className="text-gray-300">Allow Comments</label>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <input
                                type="checkbox"
                                id="versionControl"
                                checked={tempConfig.versionControlEnabled}
                                onChange={(e) => setTempConfig(prev => ({ ...prev, versionControlEnabled: e.target.checked }))}
                                className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded"
                            />
                            <label htmlFor="versionControl" className="text-gray-300">Enable Version Control</label>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end p-4 border-t border-gray-700 gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded text-white hover:bg-gray-600">Cancel</button>
                    <button onClick={() => { onSave({ collaboration: tempConfig }); onClose(); }} className="px-4 py-2 bg-cyan-600 rounded text-white hover:bg-cyan-700">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

// Main DashboardTile component, now acting as a universe orchestrator
interface DashboardTileProps {
    item: NavItem;
    onClick: () => void;
}

const DashboardTile: React.FC<DashboardTileProps> = ({ item, onClick }) => {
    if (!('id' in item) || !item.id) return null;

    const [tileConfig, setTileConfig] = useState<TileConfiguration | null>(null);
    const [configLoading, setConfigLoading] = useState(true);
    const [configError, setConfigError] = useState<Error | null>(null);
    const [isSharingModalOpen, setIsSharingModalOpen] = useState(false);

    useEffect(() => {
        const fetchTileConfig = async () => {
            setConfigLoading(true);
            setConfigError(null);
            try {
                // Simulate API call to get detailed tile configuration from a global Tile Registry/Service
                await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
                const mockConfig: TileConfiguration = {
                    ...item, // Inherit basic NavItem properties
                    version: '1.2.0',
                    createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 7).toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: 'system_admin',
                    lastModifiedBy: 'user_a',
                    description: `This is an advanced dashboard tile for ${item.label}. It provides real-time insights and predictive analytics, designed by thousands of experts over a decade.`,
                    tags: ['analytics', 'business', 'realtime', item.label.toLowerCase().replace(/\s/g, '_')],
                    category: 'Enterprise Intelligence',
                    status: 'published',
                    ownerId: 'system_owner',
                    organizationId: 'universal_org',
                    dataSources: [
                        {
                            id: `${item.id}-main-data`,
                            name: `${item.label} Primary Source`,
                            type: 'API',
                            endpoint: `/api/data/${item.id}/v2`,
                            collection: `collection_${item.id}`,
                            query: { timeRange: { preset: 'last_30_days' }, groupBy: ['date', 'region'], search: 'active' },
                            refreshInterval: 30000, // Every 30 seconds
                            isLive: true,
                            dataRetentionPolicy: '5 years'
                        },
                        {
                            id: `${item.id}-ai-feedback`,
                            name: `AI Generated for ${item.label}`,
                            type: 'AI_Generated',
                            refreshInterval: 120000, // Every 2 minutes
                            isLive: false,
                        }
                    ],
                    visualization: {
                        type: item.id.includes('sales') ? 'LineChart' : item.id.includes('table') ? 'DataGrid' : item.id.includes('kpi') ? 'KPIWidget' : item.id.includes('chat') ? 'ChatBotInterface' : item.id.includes('map') ? 'Map' : 'BarChart',
                        title: `${item.label} Universal View`,
                        xAxisLabel: 'Time/Category',
                        yAxisLabel: 'Metrics',
                        legendPosition: 'bottom',
                        colorPalette: ['#8884d8', '#82ca9d', '#ffc658', '#E69A8D', '#5F4B8B', '#E5A44B'],
                        zoomEnabled: true,
                        drillDownEnabled: true,
                        interactionMode: 'exploratory',
                        thresholds: [{ value: 950, color: '#ef4444', label: 'Critical Threshold', operator: '>' }],
                        animationsEnabled: true,
                        exportFormats: ['PNG', 'CSV', 'PDF', 'JSON'],
                        accessibilityFeatures: ['screenReader', 'colorBlindMode'],
                    },
                    aiMlConfig: {
                        modelId: `universe-ai-v3-${item.id}`,
                        modelType: 'Predictive',
                        triggerCondition: 'onDataChange',
                        explainabilityEnabled: true,
                        confidenceThreshold: 0.85,
                        scope: 'CrossTile',
                        alertOnAnomaly: true,
                        alertSeverity: 'high',
                        realtimeInference: true,
                        feedbackLoopEnabled: true,
                        naturalLanguageGenerationEnabled: true,
                    },
                    actions: [
                        { id: 'drill-down', label: 'Explore Details', icon: <LayersIcon />, type: 'DrillDown', permissionRequired: ['view:drilldown'], tooltip: 'Dive deeper into the data' },
                        { id: 'export-data', label: 'Export All Data', icon: <SaveIcon />, type: 'ExecuteReport', config: { reportType: 'csv', format: 'xlsx' }, permissionRequired: ['export:data'], confirmationRequired: true },
                        { id: 'open-full-dashboard', label: 'Open Master Module', icon: <GlobeIcon />, type: 'OpenLink', config: { url: `/master-dashboard/${item.id}` }, tooltip: 'Open the full-page module view' },
                        { id: 'send-message', label: 'Notify Team', icon: <MessageSquare as any />, type: 'SendMessage', config: { target: 'team-channel', defaultMessage: `Check out ${item.label} tile for updates.` } },
                        { id: 'refresh-data', label: 'Refresh Data', icon: <RefreshIcon />, type: 'UpdateDataSource', tooltip: 'Manually refresh data sources' },
                        { id: 'run-simulation', label: 'Run Simulation', icon: <CpuIcon />, type: 'RunSimulation', isVisibleCondition: 'alwaysTrue', permissionRequired: ['run:simulation'] },
                        { id: 'ai-assist', label: 'AI Assistant', icon: <ZapIcon />, type: 'AIAssist', tooltip: 'Get AI-powered insights and suggestions' },
                        { id: 'reset-filters', label: 'Reset Filters', icon: <CloseIcon />, type: 'ResetFilters', isDisabledCondition: 'alwaysFalse', tooltip: 'Clear all active filters' }
                    ],
                    alerts: [
                        {
                            id: `alert-${item.id}-critical-event`,
                            name: 'Critical Metric Deviation',
                            conditions: [{ field: 'value', operator: '>', value: 900 }],
                            severity: 'critical',
                            channels: ['InApp', 'Email', 'Slack', 'PagerDuty'],
                            isEnabled: true,
                            triggeredByAIML: true,
                            debounceTime: 600000, // 10 minutes
                            messageTemplate: `Critical alert for ${item.label}! Value of {{value}} exceeded threshold of 900. AI detected {{anomalyType}} anomaly at {{detectedAt}}.`,
                            alertAction: { id: 'trigger-workflow-incident', label: 'Trigger Incident Workflow', type: 'TriggerWorkflow', config: { workflowId: 'incident_response' } }
                        },
                        {
                            id: `alert-${item.id}-warning`,
                            name: 'Warning Threshold Reached',
                            conditions: [{ field: 'value', operator: '>=', value: 750 }, { field: 'value', operator: '<', value: 900 }],
                            severity: 'warning',
                            channels: ['InApp', 'Email'],
                            isEnabled: true,
                            debounceTime: 300000, // 5 minutes
                        }
                    ],
                    collaboration: {
                        enabled: true,
                        sharedWith: [{ userId: 'admin', permission: 'owner', email: 'admin@universe.com' }, { userId: 'guest', permission: 'viewer', email: 'guest@universe.com' }],
                        shareScope: 'specific_users',
                        allowComments: true,
                        allowRealtimeCoEditing: true,
                        versionControlEnabled: true,
                        approvalWorkflowEnabled: true,
                        chatIntegrationEnabled: true,
                        livePresenceEnabled: true,
                    },
                    performance: {
                        cacheStrategy: 'server',
                        cacheDuration: 5, // minutes
                        lazyLoadContent: true,
                        priority: 1, // High priority
                        dataCompressionEnabled: true,
                        preFetchData: true,
                        realtimeSubscriptionMode: 'push', // Use push for real-time
                        offlineModeEnabled: true,
                    },
                    accessPolicy: {
                        type: 'role-based',
                        roles: ['admin', 'analyst', item.id.toLowerCase().includes('finance') ? 'finance_team' : ''],
                        permissions: [`tile:${item.id}:view`, `tile:${item.id}:edit`, `tile:${item.id}:share`, `tile:${item.id}:export`]
                    },
                    uiDesign: {
                        themePreset: 'dark',
                        headerVisibility: item.id.includes('chat') ? 'never' : 'always', // Chatbots usually manage their own header internally
                        borderRadius: 'lg',
                        shadowEffect: 'xl',
                        draggable: true,
                        resizable: true,
                        customStyling: 'border border-cyan-800/20',
                        hoverEffectsEnabled: true,
                    },
                    semanticLayerConfig: { ontologyId: 'business-intelligence-ontology-v2', naturalLanguageQueryEnabled: true, glossaryTerms: ['KPI', 'Revenue', 'Churn Rate'] },
                    integrationConfig: { serviceId: 'workflow-automator', parameters: { system: 'zapier' }, callbackUrl: 'https://webhook.universe.com/callback' },
                    simulationConfig: { enabled: true, scenarioTemplates: ['optimistic', 'pessimistic', 'stress_test'], simulationModelId: 'financial-projection-v1' },
                    historyTracking: { dataRetentionPolicy: '3 years', configRetentionPolicy: '6 months', dataVersionControlEnabled: true, snapshotFrequency: 'daily' },
                    costOptimizationConfig: { estimatedUsageCost: 15.75, costCenterId: 'CC001', resourceAllocationPriority: 'high', autoScaleResources: true },
                    complianceConfig: { regionSpecificRules: ['GDPR', 'CCPA'], dataPrivacyLevel: 'restricted', retentionPolicyId: 'universal_data_policy_v1', auditLoggingLevel: 'detailed' },
                    auditTrail: [
                        { timestamp: new Date(Date.now() - 86400000).toISOString(), userId: 'sys_auto', action: 'created', details: { initialVersion: '1.0.0' } },
                    ],
                    featureFlags: { 'new_chart_types': true, 'ai_copilot': true },
                    customMetadata: { department: 'Data Science', project: 'Universal Dashboard' }
                };
                setTileConfig(mockConfig);
            } catch (err) {
                setConfigError(err as Error);
            } finally {
                setConfigLoading(false);
            }
        };

        fetchTileConfig();
    }, [item]);

    const updateTileConfig = useCallback((newConfig: Partial<TileConfiguration>) => {
        setTileConfig(prev => (prev ? { ...prev, ...newConfig, updatedAt: new Date().toISOString(), lastModifiedBy: 'current_user' } : null));
        // In a real app, this would trigger a backend API call to save the config
        console.log('Tile config updated:', newConfig);
    }, []);

    const triggerAction = useCallback((actionId: string, payload?: Record<string, any>) => {
        console.log(`Action triggered for tile ${item.id}: ${actionId}`, payload);
        switch (actionId) {
            case 'refresh-data':
                refetch();
                break;
            case 'open-full-dashboard':
                if (payload?.url) window.open(payload.url, '_blank');
                break;
            case 'drill-down':
                // Conceptual: navigate to a detailed view or open a modal
                console.log('Initiating drill-down with payload:', payload);
                break;
            case 'run-simulation':
                console.log('Running simulation with parameters:', payload);
                // Trigger a simulation service
                break;
            case 'ai-assist':
                console.log('Activating AI Assistant for context:', payload);
                // Open an AI assistant panel or prompt
                break;
            case 'export-data':
                console.log(`Exporting data to ${payload?.format || 'CSV'}`);
                // Trigger data export service
                break;
            case 'send-message':
                console.log(`Sending message to ${payload?.target || 'default'} channel.`);
                // Trigger messaging service
                break;
            case 'reset-filters':
                console.log('Resetting all active filters for the tile.');
                // Reset data query parameters
                break;
            default:
                console.warn(`Unhandled action ID: ${actionId}`);
        }
        logUserInteraction('tile_action_triggered', { actionId, payload });
        emitTileEvent('actionTriggered', { actionId, payload });
    }, [item.id, refetch]); // Added refetch to dependencies

    const logUserInteraction = useCallback((interactionType: string, details: Record<string, any>) => {
        console.log(`User interaction logged for tile ${item.id}: ${interactionType}`, details);
        // This would send to a global analytics/audit log service
    }, [item.id]);

    const emitTileEvent = useCallback((eventType: TileEventType, payload: Record<string, any>) => {
        console.log(`Tile ${item.id} emitted event: ${eventType}`, payload);
        // This would use a global event bus or WebSocket for inter-tile communication
    }, [item.id]);

    const subscribeToExternalEvents = useCallback((eventType: TileEventType, callback: (event: TileEvent) => void) => {
        console.log(`Tile ${item.id} subscribing to external event: ${eventType}`);
        // This would register with a global event bus or WebSocket client
        const unsubscribe = () => console.log('Unsubscribing from event'); // Mock unsubscribe
        // In a real system, you'd add this callback to a map/list and return a function to remove it.
        return unsubscribe;
    }, [item.id]);

    // Use hooks for data, AI, etc., only if config is loaded
    const { data, isLoading, error, refetch } = useTileData(
        tileConfig?.dataSources || [],
        tileConfig?.performance
    );
    const { insights, isAILoading, aiError } = useAIInsights(data, tileConfig?.aiMlConfig);

    const tileUniverseValue = useMemo(() => ({
        tileConfig: tileConfig!,
        currentData: data,
        isLoading: isLoading || configLoading || isAILoading,
        error: error || configError || aiError,
        triggerAction,
        updateTileConfig,
        logUserInteraction,
        emitTileEvent,
        subscribeToExternalEvents,
        aiInsights: insights,
        userPermissions: ['admin', 'view:drilldown', 'export:data', `tile:${item.id}:view`, `tile:${item.id}:edit`, `tile:${item.id}:share`, 'run:simulation'], // Mock permissions
        isCollaborating: tileConfig?.collaboration?.enabled && tileConfig.collaboration.sharedWith && tileConfig.collaboration.sharedWith.length > 0,
        isEditingConfig: false, // Could be managed by a global state for actual editing mode
    }), [tileConfig, data, isLoading, configLoading, isAILoading, error, configError, aiError, triggerAction, updateTileConfig, logUserInteraction, emitTileEvent, subscribeToExternalEvents, insights, item.id]);

    if (configLoading) {
        return (
            <Card
                variant="interactive"
                padding="none"
                className="h-[600px] flex flex-col group animate-pulse"
            >
                <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-full bg-gray-600"></div>
                        <p className="w-32 h-6 bg-gray-600 rounded"></p>
                    </div>
                    <div className="w-20 h-4 bg-gray-600 rounded"></div>
                </div>
                <div className="flex-grow p-4 flex justify-center items-center text-gray-500">
                    Loading Universal Tile Configuration...
                </div>
            </Card>
        );
    }

    if (configError || !tileConfig) {
        return (
            <Card
                variant="interactive"
                padding="none"
                className="h-[600px] flex flex-col group"
            >
                <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-red-400">
                            <AlertIcon className='h-6 w-6' />
                        </div>
                        <p className="text-lg font-semibold text-white truncate">{item.label}</p>
                    </div>
                </div>
                <div className="flex-grow p-4 flex justify-center items-center text-red-400 flex-col">
                    <p>Failed to load tile configuration.</p>
                    <p className="text-sm text-gray-500">{configError?.message || 'Unknown error.'}</p>
                    <button onClick={() => { /* Implement a retry mechanism or refresh */ }} className="mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600">Retry</button>
                </div>
            </Card>
        );
    }

    const { uiDesign } = tileConfig;
    const headerVisible = uiDesign?.headerVisibility === 'always' || (uiDesign?.headerVisibility === 'hover' && !tileConfig.visualization.type.includes('ChatBotInterface'));

    return (
        <Card
            variant="interactive"
            padding="none"
            className={`h-[600px] flex flex-col group ${uiDesign?.customStyling || ''}`}
            onClick={(e) => {
                // Only trigger if click is on the card itself, not children buttons
                if (e.target === e.currentTarget) {
                    onClick();
                    logUserInteraction('tile_clicked', { tileId: item.id });
                }
            }}
            style={{
                borderRadius: uiDesign?.borderRadius ? {
                    'none': '0px', 'sm': '4px', 'md': '8px', 'lg': '12px', 'xl': '16px', '2xl': '24px', 'full': '9999px'
                }[uiDesign.borderRadius] : undefined,
                backgroundColor: uiDesign?.backgroundColor || undefined,
                borderColor: uiDesign?.borderColor || undefined,
                boxShadow: uiDesign?.shadowEffect ? {
                    'none': 'none', 'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                }[uiDesign.shadowEffect] : undefined,
            }}
        >
            <TileUniverseContext.Provider value={tileUniverseValue}>
                {/* Header - Dynamically visible based on config */}
                {headerVisible && (
                    <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="text-cyan-400">
                                {React.cloneElement(item.icon as React.ReactElement, { className: 'h-6 w-6' })}
                            </div>
                            <p className="text-lg font-semibold text-white truncate">{item.label}</p>
                            {tileConfig.status === 'draft' && <span className="ml-2 px-2 py-1 text-xs bg-yellow-600 rounded-full text-white">Draft</span>}
                            {tileConfig.status === 'pending_approval' && <span className="ml-2 px-2 py-1 text-xs bg-orange-600 rounded-full text-white">Pending Approval</span>}
                            <CollaborationStatusIndicator
                                collaborationConfig={tileConfig.collaboration}
                                tileId={item.id}
                                onManageSharing={() => setIsSharingModalOpen(true)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Live/Realtime Indicator */}
                            {tileConfig.dataSources.some(ds => ds.isLive) && (
                                <span className="relative flex h-3 w-3" title="Real-time data stream active">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                                </span>
                            )}
                            {/* AI Insights Indicator */}
                            {tileConfig.aiMlConfig?.modelId && (
                                <span className="text-gray-500 group-hover:text-cyan-400 transition-colors" title="AI-powered insights active">
                                    <CpuIcon className="h-5 w-5" />
                                </span>
                            )}
                            <TileActionsMenu
                                actions={tileConfig.actions || []}
                                onActionTriggered={triggerAction}
                                userPermissions={tileUniverseValue.userPermissions}
                                currentData={data}
                            />
                            <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">Open Module →</span>
                        </div>
                    </div>
                )}

                {/* Body with Dynamic Content */}
                <div className="flex-grow overflow-hidden relative">
                    <DynamicTileRenderer
                        visualizationConfig={tileConfig.visualization}
                        data={data}
                        isLoading={isLoading || isAILoading}
                        error={error || aiError}
                        aiInsights={insights}
                        triggerAction={triggerAction}
                        logUserInteraction={logUserInteraction}
                    />

                    {/* Overlay for loading/AI processing */}
                    {(isLoading || isAILoading) && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white z-10">
                            <ActivityIcon className="h-10 w-10 animate-spin text-cyan-400" />
                            <p className="mt-4 text-lg">
                                {isAILoading ? 'Processing AI Insights...' : 'Loading Data...'}
                            </p>
                            <p className="text-sm text-gray-400">{isAILoading ? 'Running advanced models and generating predictions' : 'Fetching latest information across universal data networks'}</p>
                        </div>
                    )}
                </div>

                {/* Footer - Alerts and Comments */}
                {tileConfig.alerts && tileConfig.alerts.length > 0 && (
                    <TileAlertsAndNotifications
                        alertsConfig={tileConfig.alerts}
                        currentData={data}
                        aiInsights={insights}
                        onAlertTriggered={(alertId, payload) => {
                            console.log(`Alert "${alertId}" triggered!`, payload);
                            emitTileEvent('alertTriggered', { alertId, payload });
                            if (payload?.alertConfig?.alertAction) {
                                triggerAction(payload.alertConfig.alertAction.id, payload.alertConfig.alertAction.config);
                            }
                        }}
                    />
                )}
                {tileConfig.collaboration?.allowComments && (
                    <TileCommentSection tileId={item.id} allowComments={tileConfig.collaboration.allowComments} currentUser={'current_user_id'} />
                )}
                <AdvancedSharingModal
                    isOpen={isSharingModalOpen}
                    onClose={() => setIsSharingModalOpen(false)}
                    tileConfig={tileConfig}
                    onSave={updateTileConfig}
                />
            </TileUniverseContext.Provider>
        </Card>
    );
};

export default DashboardTile;