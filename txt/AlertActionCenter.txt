import React, { useState } from 'react';
import Card from '../../Card'; // Path adjusted to match the project structure

// Importing types defined in TransactionsView.tsx.
// In a larger application, these would ideally be in a shared `types.ts` file,
// but for strict adherence to the seed's definition pattern, we import them directly.
import type { FinancialAlert, AIRecommendation } from '../../TransactionsView';

/**
 * @description A centralized interface for users to review, manage, and act upon all AI-generated
 * financial alerts and proactive recommendations from Plato AI.
 * It presents a tabbed view for alerts and recommendations, allowing users to
 * dismiss, resolve, or act on them.
 *
 * @param {object} props - Component props.
 * @param {FinancialAlert[]} props.alerts - Array of AI-generated financial alerts.
 * @param {AIRecommendation[]} props.recommendations - Array of AI-generated actionable recommendations.
 * @param {(alertId: string, notes?: string) => void} props.onResolveAlert - Callback to resolve an alert.
 * @param {(recId: string) => void} props.onDismissRecommendation - Callback to dismiss a recommendation.
 * @param {(recId: string, actionUrl?: string) => void} props.onActOnRecommendation - Callback to act on a recommendation.
 */
export const AlertActionCenter: React.FC<{
    alerts: FinancialAlert[];
    recommendations: AIRecommendation[];
    onResolveAlert: (alertId: string, notes?: string) => void;
    onDismissRecommendation: (recId: string) => void;
    onActOnRecommendation: (recId: string, actionUrl?: string) => void;
}> = ({ alerts, recommendations, onResolveAlert, onDismissRecommendation, onActOnRecommendation }) => {
    const [activeTab, setActiveTab] = useState<'alerts' | 'recommendations'>('alerts');

    // Helper to determine severity color for alerts
    const getSeverityColor = (severity: FinancialAlert['severity']) => {
        switch (severity) {
            case 'critical': return 'text-red-500';
            case 'high': return 'text-orange-400';
            case 'medium': return 'text-yellow-400';
            case 'low': return 'text-green-400';
            default: return 'text-gray-400';
        }
    };

    // Renders an individual financial alert card
    const renderAlert = (alert: FinancialAlert) => (
        <div key={alert.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
                <h5 className="font-semibold text-white text-md flex items-center gap-2">
                    <span className={getSeverityColor(alert.severity)}>{alert.type.replace(/_/g, ' ').toUpperCase()}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                        alert.severity === 'critical' ? 'bg-red-900' :
                        alert.severity === 'high' ? 'bg-orange-900' :
                        alert.severity === 'medium' ? 'bg-yellow-900' :
                        'bg-green-900'
                    } text-white`}>{alert.severity.toUpperCase()}</span>
                </h5>
                <span className="text-gray-500 text-xs">{new Date(alert.timestamp).toLocaleString()}</span>
            </div>
            <p className="text-gray-300 text-sm">{alert.message}</p>
            {alert.transactionId && (
                <p className="text-gray-400 text-xs">Related Tx ID: <span className="font-mono text-cyan-300">{alert.transactionId.substring(0, 8)}...</span></p>
            )}
            <div className="flex justify-end gap-2 mt-3">
                {!alert.isResolved && (
                    <button
                        onClick={() => onResolveAlert(alert.id, 'Manually resolved by user')}
                        className="bg-green-700 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
                    >
                        Resolve
                    </button>
                )}
                {/* A detail modal could be implemented here for more elaborate alert info */}
                <button
                    onClick={() => { /* Placeholder for showing alert details in a modal */ }}
                    className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
                >
                    Details
                </button>
            </div>
            {alert.isResolved && (
                <p className="text-green-500 text-xs italic mt-2">Resolved: {alert.resolutionNotes || 'No notes'}</p>
            )}
        </div>
    );

    // Renders an individual AI recommendation card
    const renderRecommendation = (rec: AIRecommendation) => (
        <div key={rec.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
                <h5 className="font-semibold text-cyan-300 text-md">{rec.title}</h5>
                <span className="text-gray-500 text-xs">Generated: {new Date(rec.generatedAt).toLocaleDateString()}</span>
            </div>
            <p className="text-gray-400 text-sm">{rec.description}</p>
            {rec.actionableItems && rec.actionableItems.length > 0 && (
                <div className="mt-2">
                    <p className="text-gray-400 text-xs font-medium mb-1">Action Items:</p>
                    <ul className="list-disc list-inside text-gray-500 text-xs space-y-0.5">
                        {rec.actionableItems.map((item, idx) => (
                            <li key={idx}>
                                {item.actionUrl ? (
                                    <a
                                        href={item.actionUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-cyan-400 hover:underline"
                                        onClick={(e) => { e.stopPropagation(); onActOnRecommendation(rec.id, item.actionUrl); }}
                                    >
                                        {item.text}
                                    </a>
                                ) : (
                                    <span onClick={(e) => { e.stopPropagation(); onActOnRecommendation(rec.id); }}>{item.text}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="flex justify-end gap-2 mt-3">
                {!rec.isDismissed && (
                    <button
                        onClick={() => onDismissRecommendation(rec.id)}
                        className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
                    >
                        Dismiss
                    </button>
                )}
                {rec.actionableItems && rec.actionableItems.length > 0 && !rec.isDismissed && (
                    <button
                        onClick={() => onActOnRecommendation(rec.id, rec.actionableItems[0]?.actionUrl)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs px-3 py-1.5 rounded transition-colors"
                    >
                        Act Now
                    </button>
                )}
            </div>
            {rec.isDismissed && (
                <p className="text-gray-500 text-xs italic mt-2">Dismissed.</p>
            )}
        </div>
    );

    return (
        <div className="space-y-6 p-6 bg-gray-900 min-h-screen">
            <h2 className="text-4xl font-extrabold text-white tracking-wider mb-8 drop-shadow-lg">Plato AI: Alert & Action Center</h2>

            <Card title="Your Financial Watchtower" isCollapsible>
                <div className="flex border-b border-gray-700">
                    <button
                        className={`py-3 px-6 text-sm font-medium transition-colors ${activeTab === 'alerts' ? 'bg-gray-700 text-white border-b-2 border-cyan-500' : 'text-gray-400 hover:bg-gray-700/50'}`}
                        onClick={() => setActiveTab('alerts')}
                    >
                        Active Alerts ({alerts.filter(a => !a.isResolved).length})
                    </button>
                    <button
                        className={`py-3 px-6 text-sm font-medium transition-colors ${activeTab === 'recommendations' ? 'bg-gray-700 text-white border-b-2 border-cyan-500' : 'text-gray-400 hover:bg-gray-700/50'}`}
                        onClick={() => setActiveTab('recommendations')}
                    >
                        Proactive Recommendations ({recommendations.filter(r => !r.isDismissed).length})
                    </button>
                </div>

                <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    {activeTab === 'alerts' && (
                        alerts.filter(a => !a.isResolved).length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {alerts.filter(a => !a.isResolved).map(renderAlert)}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center text-sm p-4">No active financial alerts. All clear!</p>
                        )
                    )}

                    {activeTab === 'recommendations' && (
                        recommendations.filter(r => !r.isDismissed).length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {recommendations.filter(r => !r.isDismissed).map(renderRecommendation)}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center text-sm p-4">No new proactive recommendations from Plato AI.</p>
                        )
                    )}
                </div>
                <div className="p-4 border-t border-gray-700 flex justify-end">
                    {/* Placeholder button for navigating to a historical view of alerts/recommendations */}
                    <button className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition duration-200">View History</button>
                </div>
            </Card>
        </div>
    );
};

export default AlertActionCenter;