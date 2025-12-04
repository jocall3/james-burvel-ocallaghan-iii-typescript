// components/AIInsights.tsx
import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';

//region Core Components & Utilities

// Urgency Indicator (existing)
const UrgencyIndicator: React.FC<{ urgency: 'low' | 'medium' | 'high' | 'critical' | 'informational' }> = ({ urgency }) => {
    const colors = {
        informational: 'bg-blue-500',
        low: 'bg-cyan-500',
        medium: 'bg-yellow-500',
        high: 'bg-red-500',
        critical: 'bg-purple-600 animate-pulse', // Added critical and animation
    };
    return <div className={`w-2.5 h-2.5 rounded-full ${colors[urgency]}`} title={`Urgency: ${urgency}`}></div>;
};

// Insight Type Icon Map (new)
const InsightTypeIconMap: { [key: string]: string } = {
    'general': '💡',
    'predictive': '🔮',
    'actionable': '🚀',
    'correlation': '🔗',
    'anomaly': '🚨',
    'sentiment': '😊',
    'geospatial': '🗺️',
    'multimedia': '🖼️',
    'risk': '⚠️',
    'opportunity': '✨',
    'efficiency': '⚙️',
    'compliance': '⚖️',
    'market': '📈',
    'customer': '👤',
    'security': '🛡️',
    'ethical': '⚖️',
    'resource': '📦',
    'sustainability': '🌱',
    'trend': '📊',
    'forecasting': '🗓️',
    'optimization': '🎯',
    'recommendation': '👍',
};

// Utility for generating unique IDs (new)
export const generateUniqueId = (): string => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Expanded Insight Data Structure (conceptual, assumes DataContext provides this)
export interface ExtendedAIInsight {
    id: string;
    title: string;
    description: string;
    urgency: 'low' | 'medium' | 'high' | 'critical' | 'informational';
    type: 'general' | 'predictive' | 'actionable' | 'correlation' | 'anomaly' | 'sentiment' | 'geospatial' | 'multimedia' | 'risk' | 'opportunity' | 'efficiency' | 'compliance' | 'market' | 'customer' | 'security' | 'ethical' | 'resource' | 'sustainability' | 'trend' | 'forecasting' | 'optimization' | 'recommendation';
    timestamp: string; // ISO string
    source: string; // e.g., 'Sales Data', 'Marketing Analytics', 'IoT Sensors'
    dataPoints?: any[]; // Raw data points supporting the insight
    metrics?: { [key: string]: any }; // Key metrics related to the insight
    relatedEntities?: { type: string; id: string; name: string }[];
    recommendedActions?: { id: string; description: string; priority: 'low' | 'medium' | 'high'; status: 'pending' | 'in-progress' | 'completed' | 'deferred' }[];
    predictions?: { target: string; value: number; confidence: number; trend: 'up' | 'down' | 'stable' }[];
    visualizations?: { type: 'chart' | 'map' | 'graph'; data: any; options?: any }[];
    explanation?: string; // Explainable AI (XAI)
    feedback?: { rating: number; comment: string; timestamp: string }[];
    modelVersion?: string;
    ethicalConsiderations?: { aspect: string; score: number; details: string }[]; // Ethical AI
    tags?: string[];
    status?: 'active' | 'archived' | 'dismissed' | 'resolved';
    impactScore?: number; // Calculated impact
}

//endregion

//region Advanced Insight Rendering Components

// InsightDetailCard: Provides an expandable view for an insight with more data
export const InsightDetailCard: React.FC<{ insight: ExtendedAIInsight }> = ({ insight }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { dismissInsight, markInsightAsActioned } = useContext(DataContext)!;

    const handleDismiss = useCallback(() => {
        dismissInsight(insight.id);
    }, [insight.id, dismissInsight]);

    const handleActioned = useCallback((actionId: string) => {
        markInsightAsActioned(insight.id, actionId);
    }, [insight.id, markInsightAsActioned]);

    return (
        <div className="bg-gray-700 p-4 rounded-lg shadow-lg border border-gray-600 hover:border-blue-500 transition-all duration-200">
            <div className="flex items-start justify-between gap-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-start gap-3 flex-grow">
                    <UrgencyIndicator urgency={insight.urgency} />
                    <span className="text-xl">{InsightTypeIconMap[insight.type] || '❓'}</span>
                    <div>
                        <p className="font-semibold text-white text-lg">{insight.title}</p>
                        <p className="text-sm text-gray-300">{insight.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                            <span>Source: {insight.source}</span>
                            <span>| Generated: {new Date(insight.timestamp).toLocaleString()}</span>
                            {insight.modelVersion && <span>| Model: {insight.modelVersion}</span>}
                            {insight.status && <span className={`capitalize px-2 py-0.5 rounded-full text-white text-xs ${insight.status === 'active' ? 'bg-green-600' : 'bg-gray-500'}`}>{insight.status}</span>}
                        </div>
                    </div>
                </div>
                <div className="flex-shrink-0 text-gray-400">
                    <button className="ml-2 focus:outline-none" onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}>
                        {isExpanded ? '▲' : '▼'}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-600 space-y-3">
                    {insight.explanation && (
                        <div>
                            <h4 className="font-medium text-blue-300">Why this insight? (XAI)</h4>
                            <p className="text-sm text-gray-300">{insight.explanation}</p>
                        </div>
                    )}

                    {insight.metrics && Object.keys(insight.metrics).length > 0 && (
                        <div>
                            <h4 className="font-medium text-blue-300">Key Metrics</h4>
                            <ul className="list-disc list-inside text-sm text-gray-300">
                                {Object.entries(insight.metrics).map(([key, value]) => (
                                    <li key={key}><strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {insight.predictions && insight.predictions.length > 0 && (
                        <div>
                            <h4 className="font-medium text-blue-300">Predictions</h4>
                            <ul className="space-y-1">
                                {insight.predictions.map((p, i) => (
                                    <li key={i} className="bg-gray-800 p-2 rounded text-sm text-gray-300">
                                        Predicting <strong>{p.target}</strong>: {p.value.toFixed(2)} ({p.confidence * 100}% confidence, trend: {p.trend})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {insight.recommendedActions && insight.recommendedActions.length > 0 && (
                        <div>
                            <h4 className="font-medium text-blue-300">Recommended Actions</h4>
                            <ul className="space-y-2">
                                {insight.recommendedActions.map(action => (
                                    <li key={action.id} className="flex items-center justify-between bg-gray-800 p-2 rounded text-sm text-gray-300">
                                        <span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs text-white ${action.priority === 'high' ? 'bg-red-700' : action.priority === 'medium' ? 'bg-yellow-700' : 'bg-blue-700'}`}>
                                                {action.priority.toUpperCase()}
                                            </span>
                                            <span className="ml-2">{action.description}</span>
                                        </span>
                                        <span className={`capitalize px-2 py-0.5 rounded-full text-white text-xs ${action.status === 'completed' ? 'bg-green-600' : action.status === 'in-progress' ? 'bg-yellow-600' : 'bg-gray-500'}`}>
                                            {action.status}
                                        </span>
                                        {action.status === 'pending' && (
                                            <button
                                                className="ml-2 px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-xs text-white"
                                                onClick={() => handleActioned(action.id)}
                                            >
                                                Mark as Actioned
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {insight.visualizations && insight.visualizations.length > 0 && (
                        <div>
                            <h4 className="font-medium text-blue-300">Visualizations</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                {insight.visualizations.map((vis, i) => (
                                    <div key={i} className="bg-gray-800 p-3 rounded h-48 flex items-center justify-center text-gray-400 text-sm">
                                        {/* Placeholder for complex visualization rendering */}
                                        <p>Dynamic {vis.type} visualization goes here (Data: {JSON.stringify(vis.data).substring(0, 50)}...)</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {insight.ethicalConsiderations && insight.ethicalConsiderations.length > 0 && (
                        <div>
                            <h4 className="font-medium text-blue-300">Ethical AI Review</h4>
                            <ul className="space-y-1">
                                {insight.ethicalConsiderations.map((ec, i) => (
                                    <li key={i} className="bg-gray-800 p-2 rounded text-sm text-gray-300">
                                        <strong>{ec.aspect}</strong>: Score {ec.score.toFixed(1)}/10. {ec.details}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {insight.feedback && insight.feedback.length > 0 && (
                        <div>
                            <h4 className="font-medium text-blue-300">User Feedback</h4>
                            <ul className="space-y-1">
                                {insight.feedback.map((f, i) => (
                                    <li key={i} className="bg-gray-800 p-2 rounded text-sm text-gray-300">
                                        <span className="text-yellow-400">{f.rating} ★</span>: "{f.comment}" (on {new Date(f.timestamp).toLocaleDateString()})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md text-sm transition-colors"
                            onClick={handleDismiss}
                        >
                            Dismiss Insight
                        </button>
                        {/* More action buttons can be added here, e.g., "Share", "Follow Up", "Integrate into Workflow" */}
                    </div>
                </div>
            )}
        </div>
    );
};

// InsightFeedbackModule: Allows users to provide feedback on an insight
export const InsightFeedbackModule: React.FC<{ insightId: string; onFeedbackSubmit: (insightId: string, rating: number, comment: string) => void }> = ({ insightId, onFeedbackSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = useCallback(() => {
        if (rating > 0) {
            onFeedbackSubmit(insightId, rating, comment);
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 3000); // Reset submitted state
            setRating(0);
            setComment('');
        }
    }, [insightId, rating, comment, onFeedbackSubmit]);

    return (
        <div className="bg-gray-800 p-4 rounded-lg mt-3">
            <h5 className="text-white font-medium mb-2">Provide Feedback</h5>
            <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`text-2xl cursor-pointer ${star <= rating ? 'text-yellow-400' : 'text-gray-500'}`}
                        onClick={() => setRating(star)}
                    >
                        ★
                    </span>
                ))}
            </div>
            <textarea
                className="w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Optional: Share your thoughts on this insight..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
            />
            <button
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={rating === 0}
            >
                Submit Feedback
            </button>
            {submitted && <span className="ml-3 text-green-400 text-sm">Feedback submitted! Thank you.</span>}
        </div>
    );
};

// InsightQueryInterface: Allows users to ask questions about insights or data
export const InsightQueryInterface: React.FC<{ onQuerySubmit: (query: string) => void; isLoading: boolean; queryResults: string[] }> = ({ onQuerySubmit, isLoading, queryResults }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onQuerySubmit(query);
            setQuery('');
        }
    }, [query, onQuerySubmit]);

    return (
        <Card title="Query AI for Insights" className="mt-6 bg-gray-800 border border-gray-700">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    className="flex-grow p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ask a question about your data or insights..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || !query.trim()}
                >
                    {isLoading ? 'Thinking...' : 'Query'}
                </button>
            </form>
            {isLoading && <div className="mt-3 text-center text-blue-400">Processing your query...</div>}
            {queryResults.length > 0 && (
                <div className="mt-4 p-3 bg-gray-700 rounded-md border border-gray-600">
                    <h5 className="text-white font-medium mb-2">AI Response:</h5>
                    <ul className="space-y-2">
                        {queryResults.map((result, index) => (
                            <li key={index} className="text-sm text-gray-300">
                                <span className="text-blue-400">»</span> {result}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Card>
    );
};

// AI Insights Preferences Manager (new)
export const AIInsightsPreferenceManager: React.FC<{
    currentPreferences: {
        insightTypes: string[];
        urgencyThreshold: string;
        dataSources: string[];
        realtimeUpdates: boolean;
        explanationLevel: 'none' | 'basic' | 'detailed';
        modelSelection: string;
    };
    onSavePreferences: (prefs: any) => void;
    availableInsightTypes: string[];
    availableDataSources: string[];
    availableModels: { id: string; name: string; version: string; description: string }[];
}> = ({ currentPreferences, onSavePreferences, availableInsightTypes, availableDataSources, availableModels }) => {
    const [prefs, setPrefs] = useState(currentPreferences);

    useEffect(() => {
        setPrefs(currentPreferences);
    }, [currentPreferences]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        if (name === 'insightTypes' || name === 'dataSources') {
            const valArray = Array.from((e.target as HTMLSelectElement).options)
                .filter(option => option.selected)
                .map(option => option.value);
            setPrefs(prev => ({ ...prev, [name]: valArray }));
        } else {
            setPrefs(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    }, []);

    const handleSave = useCallback(() => {
        onSavePreferences(prefs);
    }, [prefs, onSavePreferences]);

    return (
        <Card title="AI Insights Preferences" className="mt-6 bg-gray-800 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div>
                    <label htmlFor="insightTypes" className="block text-sm font-medium text-white mb-1">Preferred Insight Types</label>
                    <select
                        multiple
                        id="insightTypes"
                        name="insightTypes"
                        value={prefs.insightTypes}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500 h-32"
                    >
                        {availableInsightTypes.map(type => (
                            <option key={type} value={type} className="capitalize">{type.replace(/([A-Z])/g, ' $1')}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="dataSources" className="block text-sm font-medium text-white mb-1">Included Data Sources</label>
                    <select
                        multiple
                        id="dataSources"
                        name="dataSources"
                        value={prefs.dataSources}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500 h-32"
                    >
                        {availableDataSources.map(source => (
                            <option key={source} value={source}>{source}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="urgencyThreshold" className="block text-sm font-medium text-white mb-1">Minimum Urgency Threshold</label>
                    <select
                        id="urgencyThreshold"
                        name="urgencyThreshold"
                        value={prefs.urgencyThreshold}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="informational">Informational</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="explanationLevel" className="block text-sm font-medium text-white mb-1">Explanation Level (XAI)</label>
                    <select
                        id="explanationLevel"
                        name="explanationLevel"
                        value={prefs.explanationLevel}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="none">None</option>
                        <option value="basic">Basic</option>
                        <option value="detailed">Detailed</option>
                    </select>
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="realtimeUpdates"
                        name="realtimeUpdates"
                        checked={prefs.realtimeUpdates}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="realtimeUpdates" className="ml-2 block text-sm text-white">Enable Real-time Updates</label>
                </div>
                <div>
                    <label htmlFor="modelSelection" className="block text-sm font-medium text-white mb-1">AI Model Version</label>
                    <select
                        id="modelSelection"
                        name="modelSelection"
                        value={prefs.modelSelection}
                        onChange={handleChange}
                        className="w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {availableModels.map(model => (
                            <option key={model.id} value={model.id}>{model.name} (v{model.version})</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">
                        <span className="font-semibold">{availableModels.find(m => m.id === prefs.modelSelection)?.name || 'N/A'} (v{availableModels.find(m => m.id === prefs.modelSelection)?.version || 'N/A'}):</span>
                        {availableModels.find(m => m.id === prefs.modelSelection)?.description || 'No description available.'}
                    </p>
                </div>
            </div>
            <button
                className="mt-6 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
                onClick={handleSave}
            >
                Save Preferences
            </button>
        </Card>
    );
};

// AI System Health and Performance Monitor (new)
export const AIPerformanceDashboard: React.FC<{
    aiSystemStatus: 'operational' | 'degraded' | 'offline';
    lastHeartbeat: string;
    insightGenerationRate: number; // Insights per minute
    averageResponseTime: number; // ms
    dataProcessingVolume: number; // GB/hour
    modelAccuracyHistory: { timestamp: string; accuracy: number }[];
    resourceUtilization: { cpu: number; memory: number; gpu?: number }; // %
}> = ({ aiSystemStatus, lastHeartbeat, insightGenerationRate, averageResponseTime, dataProcessingVolume, modelAccuracyHistory, resourceUtilization }) => {
    const statusColor = useMemo(() => {
        switch (aiSystemStatus) {
            case 'operational': return 'bg-green-500';
            case 'degraded': return 'bg-yellow-500';
            case 'offline': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    }, [aiSystemStatus]);

    const latestAccuracy = useMemo(() => modelAccuracyHistory[modelAccuracyHistory.length - 1]?.accuracy || 0, [modelAccuracyHistory]);

    return (
        <Card title="AI System Performance" className="mt-6 bg-gray-800 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-300 text-sm">
                <div className="p-3 bg-gray-700 rounded-md">
                    <p className="font-medium text-white">System Status:</p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
                        <span className="capitalize">{aiSystemStatus}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Last Heartbeat: {new Date(lastHeartbeat).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-700 rounded-md">
                    <p className="font-medium text-white">Insight Generation Rate:</p>
                    <p className="text-xl mt-1">{insightGenerationRate.toFixed(1)} <span className="text-gray-400 text-sm">insights/min</span></p>
                </div>
                <div className="p-3 bg-gray-700 rounded-md">
                    <p className="font-medium text-white">Avg. Response Time:</p>
                    <p className="text-xl mt-1">{averageResponseTime.toFixed(0)} <span className="text-gray-400 text-sm">ms</span></p>
                </div>
                <div className="p-3 bg-gray-700 rounded-md">
                    <p className="font-medium text-white">Data Processing Volume:</p>
                    <p className="text-xl mt-1">{dataProcessingVolume.toFixed(2)} <span className="text-gray-400 text-sm">GB/hour</span></p>
                </div>
                <div className="p-3 bg-gray-700 rounded-md">
                    <p className="font-medium text-white">Model Accuracy:</p>
                    <p className="text-xl mt-1">{latestAccuracy.toFixed(2)}%</p>
                    <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                        <div className="h-2 rounded-full bg-purple-500" style={{ width: `${latestAccuracy}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Trend analysis available...</p>
                </div>
                <div className="p-3 bg-gray-700 rounded-md">
                    <p className="font-medium text-white">Resource Utilization:</p>
                    <p className="mt-1">CPU: {resourceUtilization.cpu.toFixed(1)}%</p>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                        <div className="h-2 rounded-full bg-red-500" style={{ width: `${resourceUtilization.cpu}%` }}></div>
                    </div>
                    <p className="mt-1">Memory: {resourceUtilization.memory.toFixed(1)}%</p>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: `${resourceUtilization.memory}%` }}></div>
                    </div>
                    {resourceUtilization.gpu && (
                        <>
                            <p className="mt-1">GPU: {resourceUtilization.gpu.toFixed(1)}%</p>
                            <div className="w-full bg-gray-600 rounded-full h-2">
                                <div className="h-2 rounded-full bg-green-500" style={{ width: `${resourceUtilization.gpu}%` }}></div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Real-time telemetry streams into the Quantum AI Observability Platform. Anomalies automatically alert designated teams.</p>
        </Card>
    );
};

// HistoricalInsightArchive: For searching and reviewing past insights
export const HistoricalInsightArchive: React.FC<{
    historicalInsights: ExtendedAIInsight[];
    onSearch: (query: string, filters: any) => void;
    isLoading: boolean;
    totalResults: number;
}> = ({ historicalInsights, onSearch, isLoading, totalResults }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ type: 'all', urgency: 'all', status: 'all', startDate: '', endDate: '' });

    const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchTerm, filters);
    }, [searchTerm, filters, onSearch]);

    return (
        <Card title="Historical Insight Archive" className="mt-6 bg-gray-800 border border-gray-700">
            <form onSubmit={handleSearch} className="mb-4 space-y-3">
                <input
                    type="text"
                    className="w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search insight titles, descriptions, or explanations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={isLoading}
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-300">
                    <div>
                        <label className="block mb-1">Type:</label>
                        <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full p-2 bg-gray-700 rounded-md border border-gray-600">
                            <option value="all">All</option>
                            {Object.keys(InsightTypeIconMap).map(type => (
                                <option key={type} value={type} className="capitalize">{type.replace(/([A-Z])/g, ' $1')}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1">Urgency:</label>
                        <select name="urgency" value={filters.urgency} onChange={handleFilterChange} className="w-full p-2 bg-gray-700 rounded-md border border-gray-600">
                            <option value="all">All</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                            <option value="informational">Informational</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1">Status:</label>
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full p-2 bg-gray-700 rounded-md border border-gray-600">
                            <option value="all">All</option>
                            <option value="active">Active</option>
                            <option value="resolved">Resolved</option>
                            <option value="dismissed">Dismissed</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1">Date Range:</label>
                        <div className="flex gap-1">
                            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-1/2 p-2 bg-gray-700 rounded-md border border-gray-600" />
                            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-1/2 p-2 bg-gray-700 rounded-md border border-gray-600" />
                        </div>
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                >
                    {isLoading ? 'Searching...' : `Search Archive (${totalResults} results)`}
                </button>
            </form>

            {isLoading ? (
                <div className="text-center text-gray-400 py-8">Accessing the Chronos Insight Vault...</div>
            ) : (
                <ul className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {historicalInsights.length === 0 ? (
                        <li className="text-center text-gray-400">No historical insights found matching your criteria.</li>
                    ) : (
                        historicalInsights.map(insight => (
                            <InsightDetailCard key={insight.id} insight={insight} />
                        ))
                    )}
                </ul>
            )}
        </Card>
    );
};

// Insight Timeline: Visualize insights over time
export const InsightTimeline: React.FC<{ insights: ExtendedAIInsight[] }> = ({ insights }) => {
    const sortedInsights = useMemo(() =>
        [...insights].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
        [insights]
    );

    if (sortedInsights.length === 0) {
        return <Card title="Insight Timeline" className="mt-6 bg-gray-800 border border-gray-700"><div className="text-center text-gray-400 py-4">No insights to display on the timeline.</div></Card>;
    }

    return (
        <Card title="Insight Timeline (Temporal View)" className="mt-6 bg-gray-800 border border-gray-700">
            <div className="relative border-l-2 border-blue-500 pl-6 pb-6 pt-2">
                {sortedInsights.map((insight, index) => (
                    <div key={insight.id} className="mb-8 relative">
                        <div className="absolute -left-3.5 -top-1.5 w-7 h-7 bg-blue-700 rounded-full flex items-center justify-center text-white text-sm border-2 border-blue-500">
                            {InsightTypeIconMap[insight.type] || '❓'}
                        </div>
                        <div className="ml-0 p-3 bg-gray-700 rounded-lg shadow-md border border-gray-600">
                            <p className="text-xs text-gray-400 mb-1">{new Date(insight.timestamp).toLocaleString()}</p>
                            <p className="font-semibold text-white">{insight.title}</p>
                            <p className="text-sm text-gray-300">{insight.description}</p>
                            <div className="mt-2 flex items-center gap-2">
                                <UrgencyIndicator urgency={insight.urgency} />
                                <span className={`capitalize text-xs px-2 py-0.5 rounded-full ${insight.status === 'active' ? 'bg-green-600' : 'bg-gray-500'}`}>{insight.status}</span>
                                <span className="text-xs text-blue-400">{insight.source}</span>
                            </div>
                            {insight.recommendedActions && insight.recommendedActions.length > 0 && (
                                <div className="mt-2 text-xs text-gray-400 italic">
                                    {insight.recommendedActions.length} action{insight.recommendedActions.length > 1 ? 's' : ''} recommended.
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">Powered by Chronos Temporal Analysis Engine.</p>
        </Card>
    );
};

// AI Collaboration Hub: Share and annotate insights
export const CollaborativeAnnotationModule: React.FC<{
    insights: ExtendedAIInsight[];
    users: { id: string; name: string; avatar: string }[];
    onAddComment: (insightId: string, userId: string, comment: string) => void;
    onAssignInsight: (insightId: string, userId: string) => void;
}> = ({ insights, users, onAddComment, onAssignInsight }) => {
    const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);
    const [newComment, setNewComment] = useState('');
    const [assignedUserId, setAssignedUserId] = useState<string>('');
    const currentUser = { id: 'user-123', name: 'You (AI Lead)', avatar: 'https://i.pravatar.cc/30?img=6' }; // Mock current user

    const selectedInsight = useMemo(() => insights.find(i => i.id === selectedInsightId), [insights, selectedInsightId]);

    const handleAddComment = useCallback(() => {
        if (selectedInsightId && newComment.trim()) {
            onAddComment(selectedInsightId, currentUser.id, newComment.trim());
            setNewComment('');
        }
    }, [selectedInsightId, newComment, onAddComment, currentUser.id]);

    const handleAssign = useCallback(() => {
        if (selectedInsightId && assignedUserId) {
            onAssignInsight(selectedInsightId, assignedUserId);
        }
    }, [selectedInsightId, assignedUserId, onAssignInsight]);

    return (
        <Card title="AI Collaboration Hub" className="mt-6 bg-gray-800 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 border-r border-gray-700 pr-4">
                    <h5 className="text-white font-medium mb-3">Insights for Review</h5>
                    <ul className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {insights.map(insight => (
                            <li
                                key={insight.id}
                                className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedInsightId === insight.id ? 'bg-blue-800 border border-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                                onClick={() => setSelectedInsightId(insight.id)}
                            >
                                <div className="flex items-center gap-2">
                                    <UrgencyIndicator urgency={insight.urgency} />
                                    <span className="font-semibold text-white text-sm">{insight.title}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Source: {insight.source} | {new Date(insight.timestamp).toLocaleDateString()}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="md:col-span-2">
                    {selectedInsight ? (
                        <div>
                            <h5 className="text-white font-medium text-lg mb-2">{selectedInsight.title}</h5>
                            <p className="text-sm text-gray-300 mb-4">{selectedInsight.description}</p>

                            <div className="mb-6">
                                <h6 className="text-blue-300 text-sm font-medium mb-2">Assignments</h6>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={assignedUserId}
                                        onChange={(e) => setAssignedUserId(e.target.value)}
                                        className="p-2 bg-gray-700 text-white rounded-md border border-gray-600 text-sm flex-grow"
                                    >
                                        <option value="">Assign to...</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>{user.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleAssign}
                                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm disabled:opacity-50"
                                        disabled={!assignedUserId}
                                    >
                                        Assign
                                    </button>
                                </div>
                                {selectedInsight.relatedEntities?.filter(e => e.type === 'user').map(assigned => (
                                    <p key={assigned.id} className="text-xs text-gray-400 mt-1">Assigned to: {assigned.name}</p>
                                ))}
                            </div>

                            <h6 className="text-blue-300 text-sm font-medium mb-2">Discussion Thread</h6>
                            <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar bg-gray-700 p-3 rounded-md mb-4 space-y-3">
                                {selectedInsight.feedback?.filter(f => f.comment && f.comment !== '')
                                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                    .map((f, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <img src={`https://i.pravatar.cc/30?img=${i + 1}`} alt="User Avatar" className="w-8 h-8 rounded-full" />
                                            <div>
                                                <p className="font-semibold text-white text-sm">{users.find(u => u.id === 'user-123')?.name || 'Anonymous'}</p> {/* Mock user mapping */}
                                                <p className="text-xs text-gray-400">{f.comment}</p>
                                                <p className="text-xxs text-gray-500 mt-1">{new Date(f.timestamp).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    )) || <p className="text-center text-gray-400">No comments yet. Start the discussion!</p>}
                            </div>

                            <div className="flex gap-2">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="flex-grow p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    placeholder="Add a comment..."
                                    rows={2}
                                />
                                <button
                                    onClick={handleAddComment}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm self-end disabled:opacity-50"
                                    disabled={!newComment.trim()}
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 py-10">Select an insight to view collaboration details.</div>
                    )}
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Nexus Collaboration Engine streamlines multi-expert insight analysis and workflow integration.</p>
        </Card>
    );
};


//endregion

//region Main AIInsights Component (Expanded)
const AIInsights: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) return <div>Loading AI Context...</div>;

    const {
        aiInsights, isInsightsLoading, generateDashboardInsights,
        // Expanded context capabilities (conceptual, assume DataContext handles these)
        dismissInsight, markInsightAsActioned, provideInsightFeedback,
        submitAIQuery, aiQueryResults, isQueryingAI,
        aiPreferences, updateAIPreferences,
        aiSystemStatus, aiPerformanceMetrics,
        fetchHistoricalInsights, historicalInsights, isHistoricalInsightsLoading, historicalInsightTotal,
        addInsightComment, assignInsight,
        availableInsightTypes, availableDataSources, availableAIModels,
    } = context;

    const [activeTab, setActiveTab] = useState<'current' | 'preferences' | 'performance' | 'archive' | 'timeline' | 'collaborate'>('current');
    const [mockAiQueryResults, setMockAiQueryResults] = useState<string[]>([]);
    const [isMockQuerying, setIsMockQuerying] = useState(false);
    const [mockHistoricalInsights, setMockHistoricalInsights] = useState<ExtendedAIInsight[]>([]);
    const [mockHistoricalTotal, setMockHistoricalTotal] = useState(0);
    const [isMockHistoricalLoading, setIsMockHistoricalLoading] = useState(false);

    // Mock functions for features not fully implemented in DataContext
    const mockSubmitAIQuery = useCallback((query: string) => {
        setIsMockQuerying(true);
        setMockAiQueryResults([]);
        setTimeout(() => {
            const mockResponse = `Based on your query "${query}", the AI suggests: Key trends indicate a 15% growth in Q3. Consider reallocating resources to high-performing regions.`;
            setMockAiQueryResults([mockResponse]);
            setIsMockQuerying(false);
        }, 2000);
    }, []);

    const mockFetchHistoricalInsights = useCallback((query: string, filters: any) => {
        setIsMockHistoricalLoading(true);
        setMockHistoricalInsights([]);
        setTimeout(() => {
            const filtered = aiInsights.filter(insight => {
                const matchesSearch = !query || insight.title.toLowerCase().includes(query.toLowerCase()) || insight.description.toLowerCase().includes(query.toLowerCase()) || (insight.explanation?.toLowerCase().includes(query.toLowerCase()));
                const matchesType = filters.type === 'all' || insight.type === filters.type;
                const matchesUrgency = filters.urgency === 'all' || insight.urgency === filters.urgency;
                const matchesStatus = filters.status === 'all' || insight.status === filters.status;
                const insightDate = new Date(insight.timestamp).getTime();
                const startDate = filters.startDate ? new Date(filters.startDate).getTime() : 0;
                const endDate = filters.endDate ? new Date(filters.endDate).getTime() : Infinity;
                const matchesDate = insightDate >= startDate && insightDate <= endDate;
                return matchesSearch && matchesType && matchesUrgency && matchesStatus && matchesDate;
            });
            setMockHistoricalInsights(filtered);
            setMockHistoricalTotal(filtered.length);
            setIsMockHistoricalLoading(false);
        }, 1500);
    }, [aiInsights]);


    const mockUpdateAIPreferences = useCallback((newPrefs: any) => {
        console.log("Saving new AI preferences:", newPrefs);
        // In a real app, this would call DataContext.updateAIPreferences
        // For now, we'll just log and assume success.
        alert('AI Preferences updated successfully! (Mock)');
    }, []);

    const mockProvideInsightFeedback = useCallback((insightId: string, rating: number, comment: string) => {
        console.log(`Feedback for ${insightId}: Rating=${rating}, Comment="${comment}"`);
        // In a real app, this would call DataContext.provideInsightFeedback
        // For now, it just logs.
    }, []);

    const mockAddInsightComment = useCallback((insightId: string, userId: string, comment: string) => {
        console.log(`User ${userId} commented on ${insightId}: "${comment}"`);
        // Mocking the addition to an insight's feedback array
        // In a real app, DataContext.addInsightComment would handle this,
        // causing a re-render of aiInsights and thus this component.
    }, []);

    const mockAssignInsight = useCallback((insightId: string, userId: string) => {
        console.log(`Insight ${insightId} assigned to user ${userId}`);
        // Similar to addInsightComment, this would update aiInsights in DataContext
    }, []);


    // Initial insight generation on component mount
    useEffect(() => {
        if (aiInsights.length === 0 && !isInsightsLoading) {
            generateDashboardInsights();
        }
    }, [aiInsights.length, isInsightsLoading, generateDashboardInsights]);

    // Mock data for AI Performance Dashboard
    const mockAiPerformanceMetrics = useMemo(() => ({
        lastHeartbeat: new Date().toISOString(),
        insightGenerationRate: 15.3,
        averageResponseTime: 120,
        dataProcessingVolume: 5.8,
        modelAccuracyHistory: [
            { timestamp: new Date(Date.now() - 3600000).toISOString(), accuracy: 88.5 },
            { timestamp: new Date(Date.now() - 1800000).toISOString(), accuracy: 89.1 },
            { timestamp: new Date().toISOString(), accuracy: 90.2 },
        ],
        resourceUtilization: { cpu: 75.2, memory: 45.1, gpu: 88.9 },
    }), []);

    // Mock available models and users for Collaboration Hub
    const mockAvailableAIModels = useMemo(() => [
        { id: 'quantum-v3.2', name: 'Quantum Core', version: '3.2', description: 'Advanced general intelligence model with enhanced predictive capabilities.' },
        { id: 'symphony-v1.1', name: 'Symphony-XAI', version: '1.1', description: 'Specialized model for explainable AI, providing detailed reasoning for insights.' },
        { id: 'chronos-v2.0', name: 'Chronos-Temporal', version: '2.0', description: 'Optimized for real-time anomaly detection and temporal forecasting.' },
    ], []);

    const mockCollaborationUsers = useMemo(() => [
        { id: 'user-123', name: 'You (AI Lead)', avatar: 'https://i.pravatar.cc/30?img=6' },
        { id: 'user-456', name: 'Dr. Evelyn Reed (Data Scientist)', avatar: 'https://i.pravatar.cc/30?img=12' },
        { id: 'user-789', name: 'Mr. Alex Chen (Operations Manager)', avatar: 'https://i.pravatar.cc/30?img=22' },
        { id: 'user-101', name: 'Ms. Sarah Miller (Marketing Analyst)', avatar: 'https://i.pravatar.cc/30?img=34' },
    ], []);

    const mockAvailableInsightTypes = useMemo(() => Object.keys(InsightTypeIconMap), []);
    const mockAvailableDataSources = useMemo(() => ['Sales Data', 'Marketing Analytics', 'Customer Support Logs', 'IoT Sensor Data', 'Financial Reports', 'Social Media Feeds'], []);
    const mockAIPreferences = useMemo(() => ({
        insightTypes: ['predictive', 'actionable', 'anomaly'],
        urgencyThreshold: 'medium',
        dataSources: ['Sales Data', 'Marketing Analytics'],
        realtimeUpdates: true,
        explanationLevel: 'detailed',
        modelSelection: 'quantum-v3.2',
    }), []);


    return (
        <div className="p-6 bg-gray-900 min-h-screen text-gray-100">
            <h1 className="text-4xl font-bold mb-8 text-blue-400">Quantum AI Insights Core</h1>
            <p className="text-lg text-gray-300 mb-8">
                The nerve center of your data universe. Quantum AI constantly monitors, analyzes, and predicts, surfacing critical intelligence and actionable recommendations to drive unparalleled efficiency and innovation. This dashboard represents a decade of evolutionary upgrades, incorporating multi-modal AI, XAI, ethical review, and collaborative intelligence.
            </p>

            {/* Navigation Tabs */}
            <div className="mb-6 border-b border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('current')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'current' ? 'border-blue-500 text-blue-300' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'}`}
                    >
                        Current Insights
                    </button>
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'timeline' ? 'border-blue-500 text-blue-300' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'}`}
                    >
                        Timeline View
                    </button>
                    <button
                        onClick={() => setActiveTab('archive')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'archive' ? 'border-blue-500 text-blue-300' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'}`}
                    >
                        Archive
                    </button>
                    <button
                        onClick={() => setActiveTab('collaborate')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'collaborate' ? 'border-blue-500 text-blue-300' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'}`}
                    >
                        Collaboration Hub
                    </button>
                    <button
                        onClick={() => setActiveTab('preferences')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'preferences' ? 'border-blue-500 text-blue-300' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'}`}
                    >
                        Preferences
                    </button>
                    <button
                        onClick={() => setActiveTab('performance')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'performance' ? 'border-blue-500 text-blue-300' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-200'}`}
                    >
                        AI Performance
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === 'current' && (
                    <>
                        <Card title="Current AI Insights" className="bg-gray-800 border border-gray-700">
                            {isInsightsLoading ? (
                                <div className="text-center text-gray-400 py-8">Quantum is analyzing your data in real-time. Please stand by for intelligence drop...</div>
                            ) : (
                                <ul className="space-y-4">
                                    {aiInsights.length === 0 ? (
                                        <li className="text-center text-gray-400 py-4">No active insights at the moment. All systems nominal.</li>
                                    ) : (
                                        aiInsights.map((insight: ExtendedAIInsight) => (
                                            <div key={insight.id}>
                                                <InsightDetailCard insight={insight} />
                                                <InsightFeedbackModule
                                                    insightId={insight.id}
                                                    onFeedbackSubmit={provideInsightFeedback || mockProvideInsightFeedback}
                                                />
                                            </div>
                                        ))
                                    )}
                                </ul>
                            )}
                        </Card>
                        <InsightQueryInterface
                            onQuerySubmit={submitAIQuery || mockSubmitAIQuery}
                            isLoading={isQueryingAI || isMockQuerying}
                            queryResults={aiQueryResults || mockAiQueryResults}
                        />
                    </>
                )}

                {activeTab === 'timeline' && (
                    <InsightTimeline insights={aiInsights as ExtendedAIInsight[]} />
                )}

                {activeTab === 'archive' && (
                    <HistoricalInsightArchive
                        historicalInsights={historicalInsights || mockHistoricalInsights}
                        onSearch={fetchHistoricalInsights || mockFetchHistoricalInsights}
                        isLoading={isHistoricalInsightsLoading || isMockHistoricalLoading}
                        totalResults={historicalInsightTotal || mockHistoricalTotal}
                    />
                )}

                {activeTab === 'collaborate' && (
                    <CollaborativeAnnotationModule
                        insights={aiInsights as ExtendedAIInsight[]}
                        users={mockCollaborationUsers}
                        onAddComment={addInsightComment || mockAddInsightComment}
                        onAssignInsight={assignInsight || mockAssignInsight}
                    />
                )}

                {activeTab === 'preferences' && (
                    <AIInsightsPreferenceManager
                        currentPreferences={aiPreferences || mockAIPreferences}
                        onSavePreferences={updateAIPreferences || mockUpdateAIPreferences}
                        availableInsightTypes={availableInsightTypes || mockAvailableInsightTypes}
                        availableDataSources={availableDataSources || mockAvailableDataSources}
                        availableModels={availableAIModels || mockAvailableAIModels}
                    />
                )}

                {activeTab === 'performance' && (
                    <AIPerformanceDashboard
                        aiSystemStatus={aiSystemStatus || 'operational'} // Mock if not in context
                        lastHeartbeat={aiPerformanceMetrics?.lastHeartbeat || mockAiPerformanceMetrics.lastHeartbeat}
                        insightGenerationRate={aiPerformanceMetrics?.insightGenerationRate || mockAiPerformanceMetrics.insightGenerationRate}
                        averageResponseTime={aiPerformanceMetrics?.averageResponseTime || mockAiPerformanceMetrics.averageResponseTime}
                        dataProcessingVolume={aiPerformanceMetrics?.dataProcessingVolume || mockAiPerformanceMetrics.dataProcessingVolume}
                        modelAccuracyHistory={aiPerformanceMetrics?.modelAccuracyHistory || mockAiPerformanceMetrics.modelAccuracyHistory}
                        resourceUtilization={aiPerformanceMetrics?.resourceUtilization || mockAiPerformanceMetrics.resourceUtilization}
                    />
                )}
            </div>
        </div>
    );
};

export default AIInsights;
//endregion