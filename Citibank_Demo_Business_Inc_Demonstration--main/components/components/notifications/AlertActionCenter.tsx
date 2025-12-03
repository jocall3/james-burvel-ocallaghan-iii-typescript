/**
 * This module implements the Alert and Action Center, a critical command hub for proactive financial intelligence.
 * Business value: This center centralizes AI-driven insights and empowers operators with immediate, auditable actions,
 * significantly reducing response times to financial anomalies, optimizing operational workflows, and mitigating risk exposure.
 * By streamlining the resolution of alerts and the execution of intelligent recommendations, it enables substantial
 * cost savings through fraud prevention, operational efficiency, and automated compliance, while unlocking new revenue
 * opportunities by facilitating rapid, informed decision-decision making within the tokenized economy and real-time
 * payment rails. It provides a human-in-the-loop interface for advanced agentic AI systems, ensuring governance and oversight.
 */
import React, { useState } from 'react';
import Card from '../../Card'; // Path adjusted to match the project structure
import type { FinancialAlert, AIRecommendation } from '../../TransactionsView';

/**
 * A generic, self-contained modal component for displaying content over the main UI.
 * This component is crucial for enhancing user interaction by providing context-sensitive
 * information and confirmation prompts without navigating away from the current view.
 * Business value: Improves user experience and operational efficiency by reducing context switching,
 * enabling quicker decisions and actions, thus accelerating financial anomaly resolution and
 * recommendation implementation.
 */
export const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const maxWidthClass = {
        'sm': 'max-w-sm',
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
    }[size];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className={`bg-gray-800 rounded-lg p-6 w-full shadow-lg border border-gray-700 ${maxWidthClass} transform transition-all duration-300 scale-100`}>
                <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">
                        &times;
                    </button>
                </div>
                <div className="text-gray-300">
                    {children}
                </div>
            </div>
        </div>
    );
};

/**
 * A confirmation dialog component, leveraging the generic Modal, to ensure user intent
 * for critical actions. This component is essential for security and governance, preventing
 * accidental operations on high-value financial data or system configurations.
 * Business value: Enhances security posture by implementing explicit user consent for sensitive
 * actions, reducing the risk of erroneous transactions or unauthorized system changes, thereby
 * safeguarding assets and maintaining regulatory compliance.
 */
export const ConfirmationDialog: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isProcessing?: boolean;
}> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isProcessing = false }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <p className="mb-6">{message}</p>
            <div className="flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded transition-colors disabled:opacity-50"
                    disabled={isProcessing}
                >
                    {cancelText}
                </button>
                <button
                    onClick={onConfirm}
                    className="bg-red-700 hover:bg-red-600 text-white text-sm px-4 py-2 rounded transition-colors disabled:opacity-50"
                    disabled={isProcessing}
                >
                    {isProcessing ? 'Processing...' : confirmText}
                </button>
            </div>
        </Modal>
    );
};

/**
 * Displays detailed information about a specific financial alert, including its type,
 * severity, message, related transactions, and a simulated audit trail.
 * This component supports collecting resolution notes and triggering agentic remediation.
 * Business value: Provides granular visibility into financial anomalies, accelerating root cause
 * analysis and resolution. The integration with simulated agent interaction demonstrates a
 * programmable response mechanism, enabling rapid, automated anomaly remediation and
 * reducing manual intervention costs.
 */
export const AlertDetailModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    alert: FinancialAlert | null;
    onResolve: (alertId: string, notes: string) => void;
}> = ({ isOpen, onClose, alert, onResolve }) => {
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [isResolving, setIsResolving] = useState(false);

    const handleResolve = async () => {
        if (alert && !isResolving) {
            setIsResolving(true);
            // Simulate agent processing time
            await new Promise(resolve => setTimeout(resolve, 1500));
            onResolve(alert.id, resolutionNotes || 'Resolved via Alert Detail Modal');
            setIsResolving(false);
            onClose();
            setResolutionNotes('');
        }
    };

    if (!alert) return null;

    const getSeverityColor = (severity: FinancialAlert['severity']) => {
        switch (severity) {
            case 'critical': return 'text-red-500';
            case 'high': return 'text-orange-400';
            case 'medium': return 'text-yellow-400';
            case 'low': return 'text-green-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Alert Details: ${alert.type.replace(/_/g, ' ').toUpperCase()}`} size="lg">
            <div className="space-y-4 text-sm">
                <p><strong>Severity:</strong> <span className={`${getSeverityColor(alert.severity)} font-semibold`}>{alert.severity.toUpperCase()}</span></p>
                <p><strong>Timestamp:</strong> {new Date(alert.timestamp).toLocaleString()}</p>
                <p><strong>Message:</strong> {alert.message}</p>
                {alert.transactionId && (
                    <p><strong>Related Transaction ID:</strong> <span className="font-mono text-cyan-300 cursor-pointer hover:underline" onClick={() => console.log('Navigate to transaction details for:', alert.transactionId)}>{alert.transactionId}</span></p>
                )}
                {/* Simulated Audit Trail / Agent Interaction */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                    <h4 className="font-semibold text-white mb-2">Simulated AI/Agent Audit Trail</h4>
                    <ul className="space-y-2 text-xs text-gray-400">
                        <li><span className="font-mono text-gray-500">[{new Date(alert.timestamp).toLocaleTimeString()}]</span> AI Anomaly Detection initiated analysis.</li>
                        <li><span className="font-mono text-gray-500">[{new Date(alert.timestamp + 60000).toLocaleTimeString()}]</span> Governance agent `GuardRail-001` flagged transaction `...{alert.transactionId?.substring(alert.transactionId.length - 8)}` for review.</li>
                        {alert.isResolved && (
                            <>
                                <li><span className="font-mono text-gray-500">[{new Date(alert.timestamp + 120000).toLocaleTimeString()}]</span> Resolution initiated by user.</li>
                                <li><span className="font-mono text-gray-500">[{new Date(alert.timestamp + 150000).toLocaleTimeString()}]</span> Audit log entry created for resolution.</li>
                            </>
                        )}
                        <li><span className="font-mono text-gray-500">[{new Date().toLocaleTimeString()}]</span> Current status: {alert.isResolved ? `Resolved (${alert.resolutionNotes})` : 'Active'}</li>
                    </ul>
                </div>

                {!alert.isResolved && (
                    <div className="border-t border-gray-700 pt-4 mt-4">
                        <label htmlFor="resolutionNotes" className="block text-white text-sm font-medium mb-2">Resolution Notes</label>
                        <textarea
                            id="resolutionNotes"
                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                            rows={3}
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            placeholder="Add notes about how this alert was resolved..."
                            disabled={isResolving}
                        ></textarea>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleResolve}
                                className="bg-green-700 hover:bg-green-600 text-white text-sm px-4 py-2 rounded transition-colors disabled:opacity-50"
                                disabled={isResolving}
                            >
                                {isResolving ? 'Resolving...' : 'Mark as Resolved'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

/**
 * A modal component for displaying a historical view of resolved alerts and dismissed recommendations.
 * This provides transparency and an audit trail for past actions, allowing users to review
 * how anomalies were addressed and which proactive measures were considered.
 * Business value: Enhances accountability and provides valuable data for post-mortems and
 * process improvement. It supports compliance requirements by maintaining a clear record
 * of all financial intelligence activities, demonstrating robust governance.
 */
export const HistoryViewModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    resolvedAlerts: FinancialAlert[];
    dismissedRecommendations: AIRecommendation[];
}> = ({ isOpen, onClose, resolvedAlerts, dismissedRecommendations }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Historical Actions Log" size="xl">
            <div className="space-y-6">
                <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Resolved Alerts</h4>
                    {resolvedAlerts.length > 0 ? (
                        <div className="max-h-60 overflow-y-auto pr-2 space-y-3">
                            {resolvedAlerts.map(alert => (
                                <div key={alert.id} className="bg-gray-700 p-3 rounded text-sm border border-gray-600">
                                    <p className="flex justify-between items-center text-gray-200">
                                        <span className="font-medium">{alert.type.replace(/_/g, ' ')} ({alert.severity.toUpperCase()})</span>
                                        <span className="text-gray-400 text-xs">{new Date(alert.timestamp).toLocaleString()}</span>
                                    </p>
                                    <p className="text-gray-400 text-xs mt-1">Resolution: {alert.resolutionNotes || 'No notes provided'}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No resolved alerts in history.</p>
                    )}
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Dismissed Recommendations</h4>
                    {dismissedRecommendations.length > 0 ? (
                        <div className="max-h-60 overflow-y-auto pr-2 space-y-3">
                            {dismissedRecommendations.map(rec => (
                                <div key={rec.id} className="bg-gray-700 p-3 rounded text-sm border border-gray-600">
                                    <p className="flex justify-between items-center text-gray-200">
                                        <span className="font-medium">{rec.title}</span>
                                        <span className="text-gray-400 text-xs">{new Date(rec.generatedAt).toLocaleDateString()}</span>
                                    </p>
                                    <p className="text-gray-400 text-xs mt-1">{rec.description}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No dismissed recommendations in history.</p>
                    )}
                </div>
            </div>
            <div className="flex justify-end mt-6">
                <button
                    onClick={onClose}
                    className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded transition-colors"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
};


/**
 * @description A centralized interface for users to review, manage, and act upon all AI-generated
 * financial alerts and proactive recommendations from the Plato AI agentic system.
 * It presents a tabbed view for alerts and recommendations, allowing operators to
 * dismiss, resolve, or act on them, with enhanced detail views and confirmation flows.
 * Business value: This center provides a single pane of glass for real-time financial intelligence,
 * enabling immediate response to emergent issues and proactive optimization opportunities.
 * Its interactive design accelerates decision-making, ensuring that the human operator
 * remains in control while leveraging advanced AI capabilities for unprecedented efficiency
 * and risk management across token rails and payment infrastructure.
 */
export const AlertActionCenter: React.FC<{
    alerts: FinancialAlert[];
    recommendations: AIRecommendation[];
    onResolveAlert: (alertId: string, notes?: string) => void;
    onDismissRecommendation: (recId: string) => void;
    onActOnRecommendation: (recId: string, actionUrl?: string) => void;
}> = ({ alerts, recommendations, onResolveAlert, onDismissRecommendation, onActOnRecommendation }) => {
    const [activeTab, setActiveTab] = useState<'alerts' | 'recommendations'>('alerts');
    const [isAlertDetailModalOpen, setIsAlertDetailModalOpen] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState<FinancialAlert | null>(null);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
    const [confirmTitle, setConfirmTitle] = useState('');
    const [confirmMessage, setConfirmMessage] = useState('');
    const [isProcessingAction, setIsProcessingAction] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    const activeAlerts = alerts.filter(a => !a.isResolved);
    const resolvedAlerts = alerts.filter(a => a.isResolved);
    const activeRecommendations = recommendations.filter(r => !r.isDismissed);
    const dismissedRecommendations = recommendations.filter(r => r.isDismissed);

    const handleResolveAlert = (alertId: string, notes?: string) => {
        setIsProcessingAction(true);
        // Simulate agent processing
        setTimeout(() => {
            onResolveAlert(alertId, notes);
            setIsProcessingAction(false);
            setIsConfirmDialogOpen(false);
            setSelectedAlert(null);
        }, 1000);
    };

    const handleDismissRecommendation = (recId: string) => {
        setIsProcessingAction(true);
        // Simulate agent processing
        setTimeout(() => {
            onDismissRecommendation(recId);
            setIsProcessingAction(false);
            setIsConfirmDialogOpen(false);
        }, 1000);
    };

    const handleActOnRecommendation = (recId: string, actionUrl?: string) => {
        setIsProcessingAction(true);
        // Simulate agent processing
        setTimeout(() => {
            onActOnRecommendation(recId, actionUrl);
            setIsProcessingAction(false);
            setIsConfirmDialogOpen(false);
            if (actionUrl) {
                window.open(actionUrl, '_blank');
            }
        }, 1000);
    };

    const triggerConfirmDialog = (action: () => void, title: string, message: string) => {
        setConfirmAction(() => action);
        setConfirmTitle(title);
        setConfirmMessage(message);
        setIsConfirmDialogOpen(true);
    };

    const getSeverityColor = (severity: FinancialAlert['severity']) => {
        switch (severity) {
            case 'critical': return 'text-red-500';
            case 'high': return 'text-orange-400';
            case 'medium': return 'text-yellow-400';
            case 'low': return 'text-green-400';
            default: return 'text-gray-400';
        }
    };

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
                        onClick={() => triggerConfirmDialog(
                            () => handleResolveAlert(alert.id, 'Manually resolved by user from action center'),
                            'Confirm Alert Resolution',
                            `Are you sure you want to resolve the alert: "${alert.message}"? This action will be logged.`
                        )}
                        className="bg-green-700 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
                    >
                        Resolve
                    </button>
                )}
                <button
                    onClick={() => { setSelectedAlert(alert); setIsAlertDetailModalOpen(true); }}
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
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            triggerConfirmDialog(
                                                () => handleActOnRecommendation(rec.id, item.actionUrl),
                                                'Confirm Recommendation Action',
                                                `You are about to act on recommendation: "${rec.title}" by navigating to an external link. Confirm?`
                                            );
                                        }}
                                    >
                                        {item.text}
                                    </a>
                                ) : (
                                    <span onClick={(e) => {
                                        e.stopPropagation();
                                        triggerConfirmDialog(
                                            () => handleActOnRecommendation(rec.id),
                                            'Confirm Recommendation Action',
                                            `You are about to act on recommendation: "${rec.title}". Confirm?`
                                        );
                                    }}>{item.text}</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="flex justify-end gap-2 mt-3">
                {!rec.isDismissed && (
                    <button
                        onClick={() => triggerConfirmDialog(
                            () => handleDismissRecommendation(rec.id),
                            'Confirm Recommendation Dismissal',
                            `Are you sure you want to dismiss the recommendation: "${rec.title}"? This action will be logged.`
                        )}
                        className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
                    >
                        Dismiss
                    </button>
                )}
                {rec.actionableItems && rec.actionableItems.length > 0 && !rec.isDismissed && (
                    <button
                        onClick={() => triggerConfirmDialog(
                            () => handleActOnRecommendation(rec.id, rec.actionableItems[0]?.actionUrl),
                            'Confirm Recommendation Action',
                            `Are you sure you want to act on recommendation: "${rec.title}"? This action may trigger agentic workflows.`
                        )}
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
                        Active Alerts ({activeAlerts.length})
                    </button>
                    <button
                        className={`py-3 px-6 text-sm font-medium transition-colors ${activeTab === 'recommendations' ? 'bg-gray-700 text-white border-b-2 border-cyan-500' : 'text-gray-400 hover:bg-gray-700/50'}`}
                        onClick={() => setActiveTab('recommendations')}
                    >
                        Proactive Recommendations ({activeRecommendations.length})
                    </button>
                </div>

                <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    {activeTab === 'alerts' && (
                        activeAlerts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activeAlerts.map(renderAlert)}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center text-sm p-4">No active financial alerts. All clear!</p>
                        )
                    )}

                    {activeTab === 'recommendations' && (
                        activeRecommendations.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activeRecommendations.map(renderRecommendation)}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center text-sm p-4">No new proactive recommendations from Plato AI.</p>
                        )
                    )}
                </div>
                <div className="p-4 border-t border-gray-700 flex justify-end">
                    <button
                        onClick={() => setIsHistoryModalOpen(true)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                    >
                        View History
                    </button>
                </div>
            </Card>

            <AlertDetailModal
                isOpen={isAlertDetailModalOpen}
                onClose={() => setIsAlertDetailModalOpen(false)}
                alert={selectedAlert}
                onResolve={handleResolveAlert}
            />

            <ConfirmationDialog
                isOpen={isConfirmDialogOpen}
                onClose={() => setIsConfirmDialogOpen(false)}
                onConfirm={() => { confirmAction?.(); }}
                title={confirmTitle}
                message={confirmMessage}
                isProcessing={isProcessingAction}
            />

            <HistoryViewModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                resolvedAlerts={resolvedAlerts}
                dismissedRecommendations={dismissedRecommendations}
            />
        </div>
    );
};

export default AlertActionCenter;