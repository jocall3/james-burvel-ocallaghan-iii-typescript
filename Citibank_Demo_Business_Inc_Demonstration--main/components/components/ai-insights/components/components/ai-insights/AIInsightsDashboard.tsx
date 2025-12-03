/**
 * AIInsightsDashboard Component
 *
 * This component serves as the central operational hub for managing and interacting with the advanced
 * AI-driven financial intelligence platform. It provides a comprehensive, real-time view into agentic
 * AI activities, token rail performance, digital identity governance, and real-time payment infrastructure.
 *
 * Business Value: This dashboard is a critical asset worth millions, as it empowers enterprises to
 * unlock unprecedented operational velocity and strategic foresight. By consolidating disparate
 * data streams and AI-generated insights into a single pane of glass, it drastically reduces
 * decision-making latency, minimizes operational risks through real-time anomaly detection and
 * automated remediation by AI agents, and optimizes transactional efficiency across token rails.
 * It provides auditable transparency over all financial movements and AI actions, crucial for
 * regulatory compliance and trust. Furthermore, the ability to configure AI preferences and
 * prioritization rules directly translates into strategic competitive advantage, allowing
 * businesses to dynamically adapt to market shifts, identify new revenue streams, and
 * achieve substantial cost arbitrage through intelligent resource allocation and payment routing.
 * This system transforms reactive operations into proactive, intelligent orchestration,
 * ensuring business resilience and continuous growth in a rapidly evolving digital economy.
 */
import React, { useState, useCallback, useMemo, useEffect, Fragment, useRef } from 'react';
import {
    useAIInsightManagement, InsightTypeIconMap, ExtendedAIInsight, AIModel, AIPerformanceMetrics,
    DataSourceConfig, AINotification, InsightPrioritizationRule, Agent, PaymentTransaction,
    TokenTransaction, AuditEvent, UserProfile, TokenLedgerStatus, AgentSkill
} from '../useAIInsightManagement';

/**
 * Provides dynamic styling based on urgency/priority levels for UI elements.
 * This function translates abstract urgency levels into distinct visual cues,
 * ensuring that critical information is immediately discernible to operators.
 * It's a key component in minimizing decision latency and focusing attention
 * on high-impact events, thereby enhancing operational efficiency and risk management.
 */
const getUrgencyClass = (urgency: ExtendedAIInsight['urgency'] | AINotification['priority']) => {
    switch (urgency) {
        case 'critical': return 'bg-red-500 text-white';
        case 'high': return 'bg-orange-500 text-white';
        case 'medium': return 'bg-yellow-400 text-black';
        case 'low': return 'bg-green-400 text-black';
        case 'informational': return 'bg-blue-300 text-black';
        default: return 'bg-gray-300 text-black';
    }
};

/**
 * Provides dynamic styling based on the status of an insight or task.
 * This function visually communicates the lifecycle stage of an operational item,
 * from 'active' to 'resolved' or 'dismissed'. Clear status indicators improve
 * workflow management, reduce cognitive load, and ensure team alignment on
 * the progression of remediation or action plans, driving project velocity.
 */
const getStatusClass = (status: ExtendedAIInsight['status']) => {
    switch (status) {
        case 'active': return 'bg-blue-200 text-blue-800';
        case 'actioned': return 'bg-green-200 text-green-800';
        case 'resolved': return 'bg-emerald-200 text-emerald-800';
        case 'pending review': return 'bg-yellow-200 text-yellow-800';
        case 'dismissed': return 'bg-gray-200 text-gray-800';
        case 'archived': return 'bg-slate-200 text-slate-800';
        case 'reopened': return 'bg-red-200 text-red-800';
        default: return 'bg-gray-100 text-gray-700';
    }
};

/**
 * A reusable modal component for displaying detailed information or forms.
 * This modal streamlines user interaction by providing context-specific overlays,
 * minimizing navigation overhead and maintaining user focus on the primary dashboard.
 * Its responsive design and clear call-to-action buttons enhance usability,
 * which is critical for complex enterprise applications requiring efficient data drill-downs.
 */
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '800px', width: '90%',
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto', position: 'relative'
            }}>
                <h2 style={{ fontSize: '1.8em', marginBottom: '20px', color: '#333' }}>{title}</h2>
                <div style={{ marginBottom: '20px', lineHeight: '1.6' }}>{children}</div>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '15px', right: '15px',
                        backgroundColor: '#eee', border: 'none', borderRadius: '50%',
                        width: '30px', height: '30px', cursor: 'pointer', fontSize: '1.2em',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

/**
 * The main AIInsightsDashboard component provides a unified interface for agentic AI management.
 * It integrates real-time insights, AI querying, historical data analysis, team collaboration,
 * AI model governance, token rail monitoring, and payment infrastructure oversight.
 *
 * This dashboard is a strategic control center, delivering unparalleled operational transparency
 * and control. It enables stakeholders to proactively manage risks, seize opportunities,
 * and optimize financial flows by orchestrating intelligent automation across the entire
 * enterprise. Its comprehensive view translates directly into reduced operational costs,
 * enhanced security through real-time fraud detection, and accelerated time-to-market
 * for new financial products, driving multi-million dollar value through intelligent orchestration.
 */
export const AIInsightsDashboard = () => {
    const {
        aiInsights, isInsightsLoading, generateDashboardInsights, dismissInsight, markInsightAsActioned,
        updateInsightStatus, addInsightAttachment,
        queryInput, setQueryInput, queryResults, isQuerying, submitAIQuery, clearQueryResults,
        preferences, handlePreferenceChange, handleSavePreferences, resetPreferences,
        availableInsightTypes, availableDataSources, availableAIModels,
        provideInsightFeedback,
        aiSystemStatus, aiPerformanceMetrics, getAIModelDetails, checkSystemHealth,
        historicalSearchTerm, setHistoricalSearchTerm, historicalFilters, setHistoricalFilters, handleHistoricalFilterChange,
        handleHistoricalSearch, historicalSearchResults, isHistoricalLoading, historicalTotalResults,
        historicalCurrentPage, setHistoricalCurrentPage, historicalPageSize, setHistoricalPageSize,
        historicalSortBy, historicalSortOrder, handleHistoricalSortChange,
        selectedCollaborationInsightId, setSelectedCollaborationInsightId, newCommentText, setNewCommentText,
        assignedUserForCollaboration, setAssignedUserForCollaboration, assignActionToUser, setAssignActionToUser,
        collaborationUsers, handleAddComment, handleAssignInsight, assignActionToUserInInsight,
        prioritizationRules, addPrioritizationRule, updatePrioritizationRule, deletePrioritizationRule,
        recalculateAllInsightPriorities,
        selectedAIModelForDetails, setSelectedAIModelForDetails, isModelTesting, deployAIModel,
        compareAIModels, modelComparisonResults,
        notifications, unreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead, dismissNotification,
        dataSourcesConfig, isDataSourceLoading, fetchDataSourceStatus, updateDataSourceConfiguration, triggerManualSync,
        // --- New additions for Money20/20 build phase architecture ---
        agents, getAgentDetails, triggerAgentAction, setAgentStatus,
        payments, getPaymentDetails, simulatePaymentRequest,
        tokenLedgerStatus, tokenTransactions, simulateTokenTransfer,
        auditEvents, currentUser, isSimulationMode,
        assignAgentSkill, removeAgentSkill,
    } = useAIInsightManagement();

    const [activeTab, setActiveTab] = useState('insights');
    const [isInsightDetailsModalOpen, setIsInsightDetailsModalOpen] = useState(false);
    const [selectedInsightForDisplay, setSelectedInsightForDisplay] = useState<ExtendedAIInsight | null>(null);
    const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
    const [isSystemHealthModalOpen, setIsSystemHealthModalOpen] = useState(false);
    const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false);
    const [isModelDetailsModalOpen, setIsModelDetailsModalOpen] = useState(false);
    const [isDataSourceConfigModalOpen, setIsDataSourceConfigModalOpen] = useState(false);
    const [selectedDataSourceConfig, setSelectedDataSourceConfig] = useState<DataSourceConfig | null>(null);
    const [newRuleForm, setNewRuleForm] = useState<Partial<Omit<InsightPrioritizationRule, 'id' | 'lastModified'>>>({
        name: '', isActive: true, boostFactor: 1.2, criteria: {}
    });
    const [feedbackInput, setFeedbackInput] = useState({ rating: 5, comment: '' });
    // --- New states for Agentic AI, Token Rail, Payments, Identity tabs ---
    const [isAgentDetailsModalOpen, setIsAgentDetailsModalOpen] = useState(false);
    const [selectedAgentForDisplay, setSelectedAgentForDisplay] = useState<Agent | null>(null);
    const [isPaymentDetailsModalOpen, setIsPaymentDetailsModalOpen] = useState(false);
    const [selectedPaymentForDisplay, setSelectedPaymentForDisplay] = useState<PaymentTransaction | null>(null);
    const [newTokenTransferForm, setNewTokenTransferForm] = useState({ fromAccountId: '', toAccountId: '', amount: 0, token: 'USD_TOKEN', rail: 'rail_fast' });
    const [newPaymentRequestForm, setNewPaymentRequestForm] = useState({ amount: 0, currency: 'USD', recipient: '', description: '' });
    const [newSkillInput, setNewSkillInput] = useState('');
    const [selectedAgentForSkillManagement, setSelectedAgentForSkillManagement] = useState<Agent['id'] | null>(null);


    const openInsightDetails = useCallback((insight: ExtendedAIInsight) => {
        setSelectedInsightForDisplay(insight);
        setIsInsightDetailsModalOpen(true);
    }, []);

    const closeInsightDetails = useCallback(() => {
        setSelectedInsightForDisplay(null);
        setIsInsightDetailsModalOpen(false);
        setSelectedCollaborationInsightId(null);
    }, []);

    const handleSubmitFeedback = useCallback((insightId: string) => {
        // Use current user for feedback if available, otherwise default to a known user for simulation
        const userId = currentUser ? currentUser.id : (collaborationUsers.length > 0 ? collaborationUsers[0].id : 'simulated-user-1');
        const userName = currentUser ? currentUser.name : (collaborationUsers.length > 0 ? collaborationUsers[0].name : 'Simulated User');
        provideInsightFeedback(insightId, feedbackInput.rating, feedbackInput.comment, userId, userName);
        setFeedbackInput({ rating: 5, comment: '' });
        alert('Feedback submitted!');
    }, [provideInsightFeedback, feedbackInput, collaborationUsers, currentUser]);

    const handleSaveNewRule = useCallback(() => {
        if (newRuleForm.name && newRuleForm.boostFactor) {
            addPrioritizationRule(newRuleForm as Omit<InsightPrioritizationRule, 'id' | 'lastModified'>);
            setNewRuleForm({ name: '', isActive: true, boostFactor: 1.2, criteria: {} });
            setIsAddRuleModalOpen(false);
            alert('New prioritization rule added!');
        } else {
            alert('Rule name and boost factor are required.');
        }
    }, [newRuleForm, addPrioritizationRule]);

    const handleSaveDataSourceConfig = useCallback(async () => {
        if (selectedDataSourceConfig) {
            await updateDataSourceConfiguration(selectedDataSourceConfig.id, selectedDataSourceConfig);
            setIsDataSourceConfigModalOpen(false);
            alert('Data source configuration updated!');
        }
    }, [selectedDataSourceConfig, updateDataSourceConfiguration]);

    const handleMarkRecommendedActionComplete = useCallback((insightId: string, actionId: string) => {
        markInsightAsActioned(insightId, actionId);
        alert('Action marked as completed!');
        if (selectedInsightForDisplay?.id === insightId) {
            setSelectedInsightForDisplay(prev => prev ? {
                ...prev,
                recommendedActions: prev.recommendedActions?.map(action =>
                    action.id === actionId ? { ...action, status: 'completed' } : action
                )
            } : null);
        }
    }, [markInsightAsActioned, selectedInsightForDisplay]);

    // --- New handlers for Money20/20 features ---
    const openAgentDetails = useCallback((agent: Agent) => {
        setSelectedAgentForDisplay(agent);
        setIsAgentDetailsModalOpen(true);
    }, []);

    const closeAgentDetails = useCallback(() => {
        setSelectedAgentForDisplay(null);
        setIsAgentDetailsModalOpen(false);
        setSelectedAgentForSkillManagement(null);
        setNewSkillInput('');
    }, []);

    const handleTriggerAgentAction = useCallback(async (agentId: string, actionType: string, payload: any) => {
        try {
            await triggerAgentAction(agentId, actionType, payload);
            alert(`Action '${actionType}' triggered for agent ${agentId}.`);
        } catch (error) {
            alert(`Failed to trigger action: ${error.message}`);
        }
    }, [triggerAgentAction]);

    const handleSetAgentStatus = useCallback(async (agentId: string, status: 'active' | 'idle' | 'suspended') => {
        try {
            await setAgentStatus(agentId, status);
            alert(`Agent ${agentId} status updated to ${status}.`);
        } catch (error) {
            alert(`Failed to update agent status: ${error.message}`);
        }
    }, [setAgentStatus]);

    const openPaymentDetails = useCallback((payment: PaymentTransaction) => {
        setSelectedPaymentForDisplay(payment);
        setIsPaymentDetailsModalOpen(true);
    }, []);

    const closePaymentDetails = useCallback(() => {
        setSelectedPaymentForDisplay(null);
        setIsPaymentDetailsModalOpen(false);
    }, []);

    const handleSimulateTokenTransfer = useCallback(async () => {
        if (!newTokenTransferForm.fromAccountId || !newTokenTransferForm.toAccountId || newTokenTransferForm.amount <= 0) {
            alert('Please fill all token transfer fields correctly.');
            return;
        }
        try {
            await simulateTokenTransfer(
                newTokenTransferForm.fromAccountId,
                newTokenTransferForm.toAccountId,
                newTokenTransferForm.amount,
                newTokenTransferForm.token,
                newTokenTransferForm.rail
            );
            alert('Token transfer simulation initiated!');
            setNewTokenTransferForm({ fromAccountId: '', toAccountId: '', amount: 0, token: 'USD_TOKEN', rail: 'rail_fast' });
        } catch (error) {
            alert(`Token transfer failed: ${error.message}`);
        }
    }, [newTokenTransferForm, simulateTokenTransfer]);

    const handleSimulatePaymentRequest = useCallback(async () => {
        if (!newPaymentRequestForm.recipient || newPaymentRequestForm.amount <= 0) {
            alert('Please fill all payment request fields correctly.');
            return;
        }
        try {
            await simulatePaymentRequest(
                newPaymentRequestForm.amount,
                newPaymentRequestForm.currency,
                newPaymentRequestForm.recipient,
                newPaymentRequestForm.description
            );
            alert('Payment request simulation initiated!');
            setNewPaymentRequestForm({ amount: 0, currency: 'USD', recipient: '', description: '' });
        } catch (error) {
            alert(`Payment request failed: ${error.message}`);
        }
    }, [newPaymentRequestForm, simulatePaymentRequest]);

    const handleAssignAgentSkill = useCallback(async (agentId: string) => {
        if (!newSkillInput.trim()) {
            alert("Skill name cannot be empty.");
            return;
        }
        try {
            await assignAgentSkill(agentId, { id: Date.now().toString(), name: newSkillInput, description: `Dynamic skill: ${newSkillInput}` });
            alert(`Skill '${newSkillInput}' assigned to agent ${agentId}.`);
            setNewSkillInput('');
            setSelectedAgentForDisplay(prev => prev ? {
                ...prev,
                skills: [...(prev.skills || []), { id: Date.now().toString(), name: newSkillInput, description: `Dynamic skill: ${newSkillInput}` }]
            } : null);
        } catch (error) {
            alert(`Failed to assign skill: ${error.message}`);
        }
    }, [assignAgentSkill, newSkillInput]);

    const handleRemoveAgentSkill = useCallback(async (agentId: string, skillId: string) => {
        try {
            await removeAgentSkill(agentId, skillId);
            alert(`Skill removed from agent ${agentId}.`);
            setSelectedAgentForDisplay(prev => prev ? {
                ...prev,
                skills: prev.skills?.filter(skill => skill.id !== skillId)
            } : null);
        } catch (error) {
            alert(`Failed to remove skill: ${error.message}`);
        }
    }, [removeAgentSkill]);


    /**
     * Renders a single insight card. This component provides a concise, at-a-glance summary
     * of an AI-generated insight, highlighting its urgency and status. The efficient presentation
     * minimizes cognitive load for operators, allowing for rapid assessment and prioritization
     * of critical business intelligence. This design directly supports agile decision-making.
     */
    const InsightCard = ({ insight }: { insight: ExtendedAIInsight }) => (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col" style={{ minHeight: '280px' }}>
            <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getUrgencyClass(insight.urgency)}`}>
                    {insight.urgency.toUpperCase()}
                </span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(insight.status || 'active')}`}>
                    {insight.status ? insight.status.replace('-', ' ').toUpperCase() : 'ACTIVE'}
                </span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">
                {InsightTypeIconMap[insight.type]} {insight.title}
            </h3>
            <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">
                {insight.description}
            </p>
            <div className="mt-auto flex justify-between items-center text-xs text-gray-500">
                <span>{new Date(insight.timestamp).toLocaleDateString()}</span>
                <button
                    onClick={() => openInsightDetails(insight)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                    View Details
                </button>
            </div>
        </div>
    );

    /**
     * Renders a single notification item, displaying the message, priority, and timestamp.
     * This component ensures timely delivery of critical alerts, enabling rapid response
     * to system events or emerging insights. The clear visual cues for read/unread status
     * and immediate action buttons (read, dismiss, go to link) optimize user workflow
     * and prevent information overload, central to operational excellence.
     */
    const NotificationItem = ({ notification }: { notification: AINotification }) => (
        <div className={`bg-white rounded-lg shadow p-4 mb-3 flex items-start ${!notification.isRead ? 'border-l-4 border-blue-500' : 'border-l-4 border-gray-200'}`}>
            <div className="flex-grow">
                <p className="font-semibold text-gray-800">{notification.message}</p>
                <p className="text-sm text-gray-500 mt-1">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${getUrgencyClass(notification.priority)} mr-2`}>
                        {notification.priority.toUpperCase()}
                    </span>
                    {new Date(notification.timestamp).toLocaleString()}
                </p>
            </div>
            <div className="flex items-center space-x-2 ml-4">
                {!notification.isRead && (
                    <button
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        title="Mark as Read"
                    >
                        Read
                    </button>
                )}
                <button
                    onClick={() => dismissNotification(notification.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                    title="Dismiss Notification"
                >
                    Dismiss
                </button>
                {notification.link && (
                    <a href={notification.link} className="text-gray-600 hover:text-gray-900 text-sm font-medium" title="Go to Insight">
                        Go
                    </a>
                )}
            </div>
        </div>
    );

    /**
     * Renders a card displaying an individual AI Agent's status and key details.
     * This component is crucial for overseeing the agentic AI system, allowing operators
     * to quickly assess the health, activity, and assigned roles of autonomous agents.
     * Real-time visibility into agent performance ensures proactive management of automated workflows,
     * directly supporting system resilience and the efficient execution of high-value tasks like
     * anomaly detection and reconciliation.
     */
    const AgentCard = ({ agent }: { agent: Agent }) => (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col" style={{ minHeight: '220px' }}>
            <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">{agent.name}</h3>
            <p className="text-sm text-gray-600 mb-2 flex-grow">{agent.description}</p>
            <div className="flex justify-between items-center text-sm mb-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${agent.status === 'active' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                    {agent.status.toUpperCase()}
                </span>
                <span className="text-gray-500">Last Active: {new Date(agent.lastActive).toLocaleDateString()}</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Roles: {agent.roles.join(', ')}</p>
            <div className="mt-auto flex justify-end space-x-3">
                <button
                    onClick={() => openAgentDetails(agent)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
                >
                    Details
                </button>
                <button
                    onClick={() => handleSetAgentStatus(agent.id, agent.status === 'active' ? 'suspended' : 'active')}
                    className={`px-4 py-2 rounded-md text-white text-sm font-medium ${agent.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                >
                    {agent.status === 'active' ? 'Suspend' : 'Activate'}
                </button>
            </div>
        </div>
    );

    /**
     * Renders a card displaying a payment transaction, highlighting its status and routing.
     * This component provides critical visibility into the real-time payments infrastructure,
     * allowing operators to monitor transaction progression, identify bottlenecks, and verify
     * routing decisions. This transparency ensures high confidence in settlement guarantees
     * and supports rapid intervention in case of issues, enhancing the reliability and
     * performance of the entire payments engine.
     */
    const PaymentCard = ({ payment }: { payment: PaymentTransaction }) => (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col" style={{ minHeight: '180px' }}>
            <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">Payment: {payment.id.substring(0, 8)}...</h3>
            <p className="text-sm text-gray-600 mb-2">Amount: <span className="font-semibold">{payment.amount} {payment.currency}</span></p>
            <p className="text-sm text-gray-600 mb-2">Recipient: <span className="font-semibold">{payment.recipient}</span></p>
            <div className="flex justify-between items-center text-sm mb-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${payment.status === 'settled' ? 'bg-green-200 text-green-800' : payment.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'}`}>
                    {payment.status.toUpperCase()}
                </span>
                <span className="text-gray-500">Rail: {payment.railUsed}</span>
            </div>
            {payment.fraudScore && payment.fraudScore > 0.5 && (
                <p className="text-xs text-red-600 mt-1 font-semibold">Fraud Risk: HIGH ({payment.fraudScore.toFixed(2)})</p>
            )}
            <div className="mt-auto flex justify-end">
                <button
                    onClick={() => openPaymentDetails(payment)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
                >
                    Details
                </button>
            </div>
        </div>
    );

    /**
     * Renders a single token transaction item for the ledger view.
     * This component offers a real-time, auditable display of value movement across token rails,
     * showcasing the transparency and integrity of the stablecoin-style ledger. Each item provides
     * immediate context on sender, receiver, amount, and the rail used, which is vital for
     * reconciliation, compliance, and understanding the flow of capital in the system.
     */
    const TokenTransactionItem = ({ tx }: { tx: TokenTransaction }) => (
        <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200 mb-3">
            <p className="text-sm font-semibold text-gray-800">
                {tx.type.toUpperCase()}: <span className="font-normal text-blue-700">{tx.transactionId.substring(0, 10)}...</span>
            </p>
            {tx.fromAccountId && <p className="text-xs text-gray-600 mt-1">From: {tx.fromAccountId.substring(0, 15)}...</p>}
            {tx.toAccountId && <p className="text-xs text-gray-600">To: {tx.toAccountId.substring(0, 15)}...</p>}
            <p className="text-sm text-gray-700 mt-1">
                Amount: <span className="font-bold">{tx.amount} {tx.token}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
                Rail: {tx.rail} | Timestamp: {new Date(tx.timestamp).toLocaleString()}
            </p>
            {tx.status === 'failed' && (
                <p className="text-xs text-red-600 mt-1 font-semibold">Status: Failed - {tx.errorMessage}</p>
            )}
            {tx.signature && <p className="text-xs text-gray-500 truncate mt-1">Signature: {tx.signature}</p>}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-8">
            <header className="text-center mb-12">
                <h1 className="text-5xl font-extrabold text-blue-700 leading-tight mb-4">
                    AI-Driven Financial Intelligence Dashboard
                </h1>
                <p className="text-lg text-gray-700 max-w-4xl mx-auto mb-6">
                    This dashboard is your command center for intelligent operations, bridging agentic AI with robust financial infrastructure. Gain real-time insights, manage autonomous agents, oversee tokenized transactions, and ensure digital identity security. It's built to accelerate decision-making, mitigate risk, and unlock new revenue streams in a composable, secure financial ecosystem.
                </p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={() => setIsPreferencesModalOpen(true)}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors duration-200 shadow-md"
                    >
                        Configure AI Preferences
                    </button>
                    <button
                        onClick={() => setIsSystemHealthModalOpen(true)}
                        className="bg-teal-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-teal-700 transition-colors duration-200 shadow-md"
                    >
                        Monitor System Health
                    </button>
                    {isSimulationMode && (
                        <span className="bg-orange-500 text-white px-4 py-2 rounded-lg text-lg font-semibold flex items-center">
                            SIMULATION MODE ACTIVE
                        </span>
                    )}
                </div>
            </header>

            <nav className="mb-8 bg-white p-3 rounded-lg shadow-sm flex flex-wrap justify-center space-x-2 sm:space-x-4">
                {['insights', 'query', 'historical', 'collaboration', 'prioritization', 'models', 'notifications', 'data-sources', 'operations'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 rounded-md text-lg font-medium transition-colors duration-200 ${
                            activeTab === tab
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                        }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                        {tab === 'notifications' && unreadNotificationCount > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                                {unreadNotificationCount}
                            </span>
                        )}
                    </button>
                ))}
            </nav>

            <div className="dashboard-content bg-white p-8 rounded-lg shadow-xl">

                {activeTab === 'insights' && (
                    <section className="section-dashboard-summary">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
                            Actionable Insights: Your Strategic Advantage
                        </h2>
                        <p className="text-md text-gray-700 max-w-3xl mx-auto mb-8 text-center">
                            Our AI proactively analyzes vast datasets to deliver timely, context-rich insights. This intelligence helps you identify emerging trends, mitigate risks before they escalate, and uncover hidden opportunities, ensuring your strategy is always informed and agile.
                        </p>
                        <div className="text-center mb-8">
                            <button
                                onClick={generateDashboardInsights}
                                disabled={isInsightsLoading}
                                className="bg-gradient-to-r from-green-500 to-green-700 text-white px-8 py-4 rounded-full text-xl font-bold hover:from-green-600 hover:to-green-800 transition-all duration-300 shadow-lg transform hover:scale-105"
                            >
                                {isInsightsLoading ? "Generating Insights..." : "Generate Fresh Insights"}
                            </button>
                        </div>

                        {isInsightsLoading && <p className="text-center text-blue-600 text-lg mt-4">AI is processing data for new insights...</p>}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {aiInsights.length > 0 ? (
                                aiInsights.map(insight => <InsightCard key={insight.id} insight={insight} />)
                            ) : (
                                !isInsightsLoading && (
                                    <p className="col-span-full text-center text-gray-600 text-lg py-10">
                                        No active insights. Generate new ones to refresh your perspective.
                                    </p>
                                )
                            )}
                        </div>
                    </section>
                )}

                {activeTab === 'query' && (
                    <section className="section-ai-query">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
                            Dynamic AI Query: On-Demand Strategic Answers
                        </h2>
                        <p className="text-md text-gray-700 max-w-3xl mx-auto mb-8 text-center">
                            Engage directly with our AI to explore specific scenarios, validate hypotheses, or delve deeper into complex business questions. This interactive capability provides immediate, intelligent responses, empowering agile decision-making and fostering data-driven curiosity.
                        </p>
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <input
                                type="text"
                                value={queryInput}
                                onChange={(e) => setQueryInput(e.target.value)}
                                placeholder="e.g., 'What's the predicted impact of recent supply chain disruptions on Q2 profits?'"
                                className="flex-grow p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg"
                                disabled={isQuerying}
                            />
                            <button
                                onClick={() => submitAIQuery(queryInput)}
                                disabled={isQuerying || !queryInput.trim()}
                                className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md"
                            >
                                {isQuerying ? "AI Processing..." : "Get AI Answer"}
                            </button>
                            <button
                                onClick={clearQueryResults}
                                className="bg-gray-400 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-gray-500 transition-colors duration-200 shadow-md"
                            >
                                Clear Results
                            </button>
                        </div>
                        {isQuerying && <p className="text-center text-blue-600 text-lg mt-4">AI is formulating its response. Please wait.</p>}
                        {queryResults.length > 0 && (
                            <div className="bg-gray-100 p-6 rounded-lg shadow-inner mt-6">
                                <h3 className="text-2xl font-semibold text-gray-700 mb-4">AI Response:</h3>
                                {queryResults.map((result, index) => (
                                    <p key={index} className="text-gray-800 mb-3 leading-relaxed border-l-4 border-blue-400 pl-4 py-2">
                                        {result}
                                    </p>
                                ))}
                                <p className="text-sm text-gray-500 italic mt-6">
                                    (AI responses provide strategic guidance and should be complemented by human expertise.)
                                </p>
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'historical' && (
                    <section className="section-historical-archive">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
                            Historical Insights: Learning from Past Operations
                        </h2>
                        <p className="text-md text-gray-700 max-w-3xl mx-auto mb-8 text-center">
                            Access a comprehensive archive of past AI insights and their resolutions. This historical context is invaluable for trend analysis, root cause identification, and refining future strategic initiatives, ensuring continuous organizational learning and improvement.
                        </p>
                        <div className="bg-gray-100 p-6 rounded-lg shadow-sm mb-8">
                            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Search & Filter Historical Records:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Search by keyword, title, tag..."
                                    value={historicalSearchTerm}
                                    onChange={(e) => setHistoricalSearchTerm(e.target.value)}
                                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                                <select
                                    name="type"
                                    value={historicalFilters.type}
                                    onChange={handleHistoricalFilterChange}
                                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Types</option>
                                    {availableInsightTypes.map(type => (
                                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                    ))}
                                </select>
                                <select
                                    name="urgency"
                                    value={historicalFilters.urgency}
                                    onChange={handleHistoricalFilterChange}
                                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Urgencies</option>
                                    {['critical', 'high', 'medium', 'low', 'informational'].map(urgency => (
                                        <option key={urgency} value={urgency}>{urgency.charAt(0).toUpperCase() + urgency.slice(1)}</option>
                                    ))}
                                </select>
                                <select
                                    name="status"
                                    value={historicalFilters.status}
                                    onChange={handleHistoricalFilterChange}
                                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Statuses</option>
                                    {['active', 'actioned', 'resolved', 'dismissed', 'archived', 'pending review'].map(status => (
                                        <option key={status} value={status}>{status.replace('-', ' ').charAt(0).toUpperCase() + status.replace('-', ' ').slice(1)}</option>
                                    ))}
                                </select>
                                <label className="flex items-center space-x-2">
                                    <span>From:</span>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={historicalFilters.startDate}
                                        onChange={handleHistoricalFilterChange}
                                        className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full"
                                    />
                                </label>
                                <label className="flex items-center space-x-2">
                                    <span>To:</span>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={historicalFilters.endDate}
                                        onChange={handleHistoricalFilterChange}
                                        className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full"
                                    />
                                </label>
                                <select
                                    name="sortBy"
                                    value={historicalSortBy}
                                    onChange={(e) => handleHistoricalSortChange(e.target.value, historicalSortOrder)}
                                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="timestamp">Sort by Date</option>
                                    <option value="urgency">Sort by Urgency</option>
                                    <option value="impactScore">Sort by Impact</option>
                                    <option value="priorityScore">Sort by Priority</option>
                                </select>
                                <select
                                    name="sortOrder"
                                    value={historicalSortOrder}
                                    onChange={(e) => handleHistoricalSortChange(historicalSortBy, e.target.value as 'asc' | 'desc')}
                                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="desc">Descending</option>
                                    <option value="asc">Ascending</option>
                                </select>
                            </div>
                        </div>

                        {isHistoricalLoading && <p className="text-center text-blue-600 text-lg mt-4">Retrieving historical insights...</p>}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                            {historicalSearchResults.length > 0 ? (
                                historicalSearchResults.map(insight => <InsightCard key={insight.id} insight={insight} />)
                            ) : (
                                !isHistoricalLoading && (
                                    <p className="col-span-full text-center text-gray-600 text-lg py-10">
                                        No historical insights match your criteria. Adjust filters or generate new insights.
                                    </p>
                                )
                            )}
                        </div>
                        {historicalTotalResults > historicalPageSize && (
                            <div className="flex justify-center mt-8 space-x-4">
                                <button
                                    onClick={() => setHistoricalCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={historicalCurrentPage === 1}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                                >
                                    Previous
                                </button>
                                <span className="flex items-center text-lg">
                                    Page {historicalCurrentPage} of {Math.ceil(historicalTotalResults / historicalPageSize)}
                                </span>
                                <button
                                    onClick={() => setHistoricalCurrentPage(prev => Math.min(Math.ceil(historicalTotalResults / historicalPageSize), prev + 1))}
                                    disabled={historicalCurrentPage === Math.ceil(historicalTotalResults / historicalPageSize)}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                                >
                                    Next
                                </button>
                                <select
                                    value={historicalPageSize}
                                    onChange={(e) => setHistoricalPageSize(Number(e.target.value))}
                                    className="p-2 border border-gray-300 rounded-md"
                                >
                                    <option value={5}>5 per page</option>
                                    <option value={10}>10 per page</option>
                                    <option value={20}>20 per page</option>
                                </select>
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'collaboration' && (
                    <section className="section-collaboration-hub">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
                            Collaboration Hub: Human-AI Synergy
                        </h2>
                        <p className="text-md text-gray-700 max-w-3xl mx-auto mb-8 text-center">
                            Foster a collaborative environment where human expertise and AI insights converge. Discuss, delegate, and track actions on critical insights, ensuring rapid and effective problem-solving across your organization. This seamless integration accelerates operational response and ensures accountability.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
                                <h3 className="text-2xl font-semibold text-gray-700 mb-4">Insights for Discussion:</h3>
                                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                    {aiInsights.length > 0 ? (
                                        aiInsights.map(insight => (
                                            <div
                                                key={insight.id}
                                                onClick={() => setSelectedCollaborationInsightId(insight.id)}
                                                className={`p-4 border rounded-md cursor-pointer hover:bg-gray-200 transition-colors ${selectedCollaborationInsightId === insight.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}
                                            >
                                                <h4 className="font-semibold text-lg text-gray-800">{insight.title}</h4>
                                                <p className="text-sm text-gray-600">{insight.description.substring(0, 100)}...</p>
                                                {insight.assignedTo && insight.assignedTo.length > 0 && (
                                                    <p className="text-xs text-blue-700 mt-2">
                                                        Assigned to: {insight.assignedTo.map(a => a.name).join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-600">No insights available for collaboration.</p>
                                    )}
                                </div>
                            </div>

                            {selectedCollaborationInsightId && (
                                <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
                                    <h3 className="text-2xl font-semibold text-gray-700 mb-4">Discussion & Actions for "{aiInsights.find(i => i.id === selectedCollaborationInsightId)?.title || 'Selected Insight'}"</h3>
                                    <div className="max-h-96 overflow-y-auto pr-2 mb-4">
                                        {(aiInsights.find(i => i.id === selectedCollaborationInsightId)?.comments || []).length > 0 ? (
                                            aiInsights.find(i => i.id === selectedCollaborationInsightId)?.comments?.map(comment => (
                                                <div key={comment.id} className="mb-3 p-3 bg-white rounded-md border border-gray-200">
                                                    <p className="text-sm font-semibold text-blue-700">{comment.userName} <span className="text-gray-500 font-normal text-xs ml-2">{new Date(comment.timestamp).toLocaleString()}</span></p>
                                                    <p className="text-gray-800 mt-1">{comment.text}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-600">No comments yet. Start a discussion!</p>
                                        )}
                                    </div>
                                    <div className="mb-4">
                                        <textarea
                                            value={newCommentText}
                                            onChange={(e) => setNewCommentText(e.target.value)}
                                            placeholder="Add a comment or question..."
                                            rows={3}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base"
                                        ></textarea>
                                        <button
                                            onClick={handleAddComment}
                                            disabled={!newCommentText.trim()}
                                            className="mt-2 bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 shadow-sm"
                                        >
                                            Post Comment
                                        </button>
                                    </div>

                                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                                        <h4 className="font-semibold text-blue-800 mb-2">Assign Insight to Team:</h4>
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <select
                                                value={assignedUserForCollaboration}
                                                onChange={(e) => setAssignedUserForCollaboration(e.target.value)}
                                                className="p-2 border border-blue-300 rounded-md flex-grow"
                                            >
                                                <option value="">Select Team Member</option>
                                                {collaborationUsers.map(user => (
                                                    <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={handleAssignInsight}
                                                disabled={!assignedUserForCollaboration}
                                                className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                                            >
                                                Assign Insight
                                            </button>
                                        </div>
                                    </div>

                                    {(selectedInsightForDisplay?.recommendedActions && selectedInsightForDisplay.recommendedActions.filter(a => a.status !== 'completed').length > 0) && (
                                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                            <h4 className="font-semibold text-yellow-800 mb-2">Assign Recommended Actions:</h4>
                                            {selectedInsightForDisplay.recommendedActions?.filter(a => a.status !== 'completed').map(action => (
                                                <div key={action.id} className="flex flex-wrap items-center gap-2 mb-3 p-2 bg-white rounded-md shadow-sm">
                                                    <span className="font-medium flex-grow">{action.description}</span>
                                                    <select
                                                        value={assignActionToUser?.actionId === action.id ? assignActionToUser.userId : ''}
                                                        onChange={(e) => setAssignActionToUser({ actionId: action.id, userId: e.target.value })}
                                                        className="p-2 border border-gray-300 rounded-md"
                                                    >
                                                        <option value="">Assign To...</option>
                                                        {collaborationUsers.map(user => (
                                                            <option key={user.id} value={user.id}>{user.name}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => assignActionToUserInInsight(selectedCollaborationInsightId, action.id, assignActionToUser?.userId || '')}
                                                        disabled={assignActionToUser?.actionId !== action.id || !assignActionToUser.userId}
                                                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200 text-sm"
                                                    >
                                                        Assign
                                                    </button>
                                                    <button
                                                        onClick={() => handleMarkRecommendedActionComplete(selectedCollaborationInsightId, action.id)}
                                                        className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors duration-200 text-sm"
                                                    >
                                                        Mark Done!
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {activeTab === 'prioritization' && (
                    <section className="section-prioritization-engine">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
                            AI Prioritization Engine: Aligning AI with Business Goals
                        </h2>
                        <p className="text-md text-gray-700 max-w-3xl mx-auto mb-8 text-center">
                            Customize how our AI prioritizes insights to align perfectly with your strategic objectives. Define rules to amplify critical risks or high-impact opportunities, ensuring that your team's focus is always on what drives maximum business value.
                        </p>
                        <div className="flex justify-center mb-8 space-x-4">
                            <button
                                onClick={() => setIsAddRuleModalOpen(true)}
                                className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md"
                            >
                                Add New Prioritization Rule
                            </button>
                            <button
                                onClick={recalculateAllInsightPriorities}
                                className="bg-purple-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-purple-700 transition-colors duration-200 shadow-md"
                            >
                                Recalculate All Priorities
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {prioritizationRules.length > 0 ? (
                                prioritizationRules.map(rule => (
                                    <div key={rule.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{rule.name}</h3>
                                        <p className="text-sm text-gray-600 mb-3">Boost Factor: <span className="font-semibold">{rule.boostFactor}x</span></p>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Status: <span className={`font-semibold ${rule.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                                {rule.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </p>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Criteria: {Object.entries(rule.criteria).map(([key, val]) =>
                                                val && `${key}: ${(Array.isArray(val) ? val.join(', ') : val)}`
                                            ).filter(Boolean).join('; ')}
                                        </p>
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => updatePrioritizationRule(rule.id, { isActive: !rule.isActive })}
                                                className={`px-4 py-2 rounded-md text-white text-sm font-medium ${rule.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                                            >
                                                {rule.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => deletePrioritizationRule(rule.id)}
                                                className="px-4 py-2 rounded-md bg-gray-400 text-white text-sm font-medium hover:bg-gray-500"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="col-span-full text-center text-gray-600 text-lg py-10">
                                    No custom prioritization rules set. Define rules to shape your AI's focus.
                                </p>
                            )}
                        </div>
                    </section>
                )}

                {activeTab === 'models' && (
                    <section className="section-ai-model-management">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
                            AI Model Governance: Transparency and Control
                        </h2>
                        <p className="text-md text-gray-700 max-w-3xl mx-auto mb-8 text-center">
                            Oversee the performance and lifecycle of your AI models. This section provides a transparent view into model status, performance metrics, and deployment options, ensuring that your AI infrastructure is robust, optimized, and aligned with enterprise standards.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {availableAIModels.map(model => (
                                <div key={model.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{model.name} <span className="text-sm font-normal text-gray-500">v{model.version}</span></h3>
                                    <p className="text-sm text-gray-600 mb-3 flex-grow">{model.description}</p>
                                    <div className="flex justify-between items-center text-sm mb-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${model.status === 'active' ? 'bg-green-200 text-green-800' : model.status === 'training' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'}`}>
                                            {model.status.toUpperCase()}
                                        </span>
                                        <span className="text-gray-500">Updated: {new Date(model.lastUpdated).toLocaleDateString()}</span>
                                    </div>
                                    <div className="mt-auto flex justify-end space-x-3">
                                        <button
                                            onClick={() => { setSelectedAIModelForDetails(model.id); setIsModelDetailsModalOpen(true); }}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
                                        >
                                            Details
                                        </button>
                                        <button
                                            onClick={() => deployAIModel(model.id)}
                                            disabled={isModelTesting || model.status === 'active'}
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 text-sm disabled:opacity-50"
                                        >
                                            {isModelTesting && selectedAIModelForDetails === model.id ? 'Deploying...' : 'Deploy'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gray-100 p-6 rounded-lg shadow-sm mt-8">
                            <h3 className="text-2xl font-semibold text-gray-700 mb-4">AI Model Comparison: Optimize Performance</h3>
                            <p className="text-md text-gray-700 mb-4">
                                Evaluate and compare the performance of different AI models to inform strategic deployment decisions. This allows for evidence-based selection of the most effective algorithms for specific tasks, maximizing insight accuracy and system efficiency.
                            </p>
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <select
                                    multiple
                                    value={modelComparisonResults.map(r => r.modelId)} // Display selected options
                                    onChange={(e) => {
                                        const selectedOptions = Array.from(e.target.options).filter(opt => opt.selected).map(opt => opt.value);
                                        compareAIModels(selectedOptions);
                                    }}
                                    className="p-3 border border-gray-300 rounded-md shadow-sm text-base h-32 flex-grow"
                                >
                                    <option disabled>Select models to compare</option>
                                    {availableAIModels.map(model => (
                                        <option key={model.id} value={model.id}>{model.name} v{model.version}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => compareAIModels(modelComparisonResults.map(r => r.modelId))} // Re-run with current selection
                                    disabled={isModelTesting || modelComparisonResults.length < 2}
                                    className="bg-orange-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-orange-700 transition-colors duration-200 shadow-md disabled:opacity-50"
                                >
                                    {isModelTesting ? 'Comparing Models...' : 'Run Comparison'}
                                </button>
                            </div>
                            {isModelTesting && <p className="text-center text-orange-600 text-lg mt-4">Models are being evaluated for performance.</p>}
                            {modelComparisonResults.length > 0 && (
                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {modelComparisonResults.map(result => (
                                        <div key={result.modelId} className="bg-white p-4 rounded-md shadow-sm border border-orange-200">
                                            <h4 className="font-bold text-orange-800 text-lg mb-2">
                                                {availableAIModels.find(m => m.id === result.modelId)?.name || 'Unknown Model'}
                                            </h4>
                                            <p className="text-gray-700 text-sm">Insights Generated: <span className="font-semibold">{result.insightsGenerated.toLocaleString()}</span></p>
                                            <p className="text-gray-700 text-sm">Average Accuracy: <span className="font-semibold">{(result.avgAccuracy * 100).toFixed(2)}%</span></p>
                                            <p className="text-sm text-gray-500 italic mt-2">
                                                (Performance metrics indicate model effectiveness.)
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {activeTab === 'notifications' && (
                    <section className="section-notifications">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
                            Notification Center: Timely Alerts for Critical Events
                        </h2>
                        <p className="text-md text-gray-700 max-w-3xl mx-auto mb-8 text-center">
                            Receive personalized, real-time notifications on critical insights, system alerts, and operational changes. This ensures you are always informed and can respond swiftly to situations requiring your attention, minimizing delays and maximizing operational responsiveness.
                        </p>
                        <div className="flex justify-center mb-8 space-x-4">
                            <button
                                onClick={markAllNotificationsAsRead}
                                disabled={unreadNotificationCount === 0}
                                className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:opacity-50"
                            >
                                Mark All as Read
                            </button>
                        </div>
                        <div className="max-w-3xl mx-auto">
                            {notifications.length > 0 ? (
                                notifications.map(notification => (
                                    <NotificationItem key={notification.id} notification={notification} />
                                ))
                            ) : (
                                <p className="text-center text-gray-600 text-lg py-10">
                                    No new notifications.
                                </p>
                            )}
                        </div>
                    </section>
                )}

                {activeTab === 'data-sources' && (
                    <section className="section-data-sources">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
                            Data Source Management: Fueling Intelligent Operations
                        </h2>
                        <p className="text-md text-gray-700 max-w-3xl mx-auto mb-8 text-center">
                            Ensure the integrity and real-time flow of data to your AI systems. This section allows for configuration, monitoring, and manual synchronization of data sources, guaranteeing that your AI always operates on the most current and accurate information.
                        </p>
                        {isDataSourceLoading && <p className="text-center text-blue-600 text-lg mb-4">Checking data source connections...</p>}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dataSourcesConfig.map(ds => (
                                <div key={ds.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{ds.name}</h3>
                                    <p className="text-sm text-gray-600 mb-3 flex-grow">{ds.description}</p>
                                    <div className="flex justify-between items-center text-sm mb-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${ds.status === 'connected' ? 'bg-green-200 text-green-800' : ds.status === 'error' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                            {ds.status.toUpperCase()}
                                        </span>
                                        <span className="text-gray-500">Last Sync: {ds.lastSync === 'N/A' ? ds.lastSync : new Date(ds.lastSync).toLocaleString()}</span>
                                    </div>
                                    <div className="mt-auto flex justify-end space-x-3">
                                        <button
                                            onClick={() => fetchDataSourceStatus(ds.id)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
                                        >
                                            Check Status
                                        </button>
                                        <button
                                            onClick={() => { setSelectedDataSourceConfig(ds); setIsDataSourceConfigModalOpen(true); }}
                                            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200 text-sm"
                                        >
                                            Configure
                                        </button>
                                        <button
                                            onClick={() => triggerManualSync(ds.id)}
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 text-sm"
                                        >
                                            Manual Sync
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* New Tab: Operations - Agentic AI, Token Rails, Payments, Identity & Audit */}
                {activeTab === 'operations' && (
                    <section className="section-operations-hub">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
                            Financial Operations Hub: Agentic AI, Token Rails & Payments
                        </h2>
                        <p className="text-md text-gray-700 max-w-4xl mx-auto mb-8 text-center">
                            This comprehensive module provides real-time oversight and control over the core financial infrastructure. Manage autonomous AI agents, monitor token rail transactions, track payment flows, and ensure digital identity integrity. This granular control is vital for achieving transactional guarantees, regulatory compliance, and maximizing the efficiency of your digital value movements.
                        </p>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Sub-section: Agent Management */}
                            <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
                                <h3 className="text-2xl font-semibold text-gray-700 mb-4">Autonomous AI Agent Management</h3>
                                <p className="text-md text-gray-600 mb-6">
                                    Monitor and manage your fleet of AI agents. View their status, assigned roles, and activate/deactivate them to orchestrate autonomous workflows for monitoring, anomaly detection, and remediation across your financial systems.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {agents.length > 0 ? (
                                        agents.map(agent => <AgentCard key={agent.id} agent={agent} />)
                                    ) : (
                                        <p className="col-span-full text-gray-600">No active AI agents found.</p>
                                    )}
                                </div>
                            </div>

                            {/* Sub-section: Token Rail Monitoring */}
                            <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
                                <h3 className="text-2xl font-semibold text-gray-700 mb-4">Token Rail & Ledger Monitoring</h3>
                                <p className="text-md text-gray-600 mb-4">
                                    Gain real-time visibility into your tokenized asset ledger and transaction rails. Monitor token balances, track mint/burn operations, and observe multi-rail settlement activity for transparency and auditability.
                                </p>
                                <div className="mb-6 p-4 bg-blue-50 rounded-md border border-blue-200">
                                    <h4 className="font-bold text-blue-800 text-lg mb-2">Ledger Overview:</h4>
                                    <p className="text-gray-700 text-sm">Total Tokens in Circulation: <span className="font-semibold">{tokenLedgerStatus.totalTokens.toLocaleString()} USD_TOKEN</span></p>
                                    <p className="text-gray-700 text-sm">Last Block ID: <span className="font-mono text-xs">{tokenLedgerStatus.lastBlockId.substring(0, 20)}...</span></p>
                                </div>

                                <h4 className="font-bold text-gray-700 text-xl mb-3">Recent Token Transactions:</h4>
                                <div className="max-h-80 overflow-y-auto pr-2">
                                    {tokenTransactions.length > 0 ? (
                                        [...tokenTransactions].reverse().map(tx => <TokenTransactionItem key={tx.transactionId} tx={tx} />)
                                    ) : (
                                        <p className="text-gray-600">No recent token transactions.</p>
                                    )}
                                </div>

                                {isSimulationMode && (
                                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <h4 className="font-semibold text-yellow-800 mb-3">Simulate Token Transfer:</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                            <input
                                                type="text" placeholder="From Account ID (e.g., 'account-alpha')" value={newTokenTransferForm.fromAccountId}
                                                onChange={(e) => setNewTokenTransferForm(prev => ({ ...prev, fromAccountId: e.target.value }))}
                                                className="p-2 border rounded-md"
                                            />
                                            <input
                                                type="text" placeholder="To Account ID (e.g., 'account-beta')" value={newTokenTransferForm.toAccountId}
                                                onChange={(e) => setNewTokenTransferForm(prev => ({ ...prev, toAccountId: e.target.value }))}
                                                className="p-2 border rounded-md"
                                            />
                                            <input
                                                type="number" placeholder="Amount" value={newTokenTransferForm.amount || ''}
                                                onChange={(e) => setNewTokenTransferForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                                                min="0.01" step="0.01" className="p-2 border rounded-md"
                                            />
                                            <select
                                                value={newTokenTransferForm.token}
                                                onChange={(e) => setNewTokenTransferForm(prev => ({ ...prev, token: e.target.value }))}
                                                className="p-2 border rounded-md"
                                            >
                                                <option value="USD_TOKEN">USD_TOKEN</option>
                                                {/* Add other simulated tokens here */}
                                            </select>
                                            <select
                                                value={newTokenTransferForm.rail}
                                                onChange={(e) => setNewTokenTransferForm(prev => ({ ...prev, rail: e.target.value }))}
                                                className="p-2 border rounded-md"
                                            >
                                                <option value="rail_fast">Rail Fast</option>
                                                <option value="rail_batch">Rail Batch</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={handleSimulateTokenTransfer}
                                            className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 shadow-sm w-full"
                                        >
                                            Simulate Token Transfer
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Sub-section: Real-time Payments Infrastructure */}
                            <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
                                <h3 className="text-2xl font-semibold text-gray-700 mb-4">Real-time Payments Infrastructure</h3>
                                <p className="text-md text-gray-600 mb-6">
                                    Monitor the flow of real-time payments through the system. Track settlement status, observe predictive routing decisions, and identify transactions flagged by the risk and fraud detection module. This ensures high throughput and secure value exchange.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {payments.length > 0 ? (
                                        payments.map(payment => <PaymentCard key={payment.id} payment={payment} />)
                                    ) : (
                                        <p className="col-span-full text-gray-600">No recent payment transactions.</p>
                                    )}
                                </div>
                                {isSimulationMode && (
                                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <h4 className="font-semibold text-yellow-800 mb-3">Simulate Payment Request:</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                            <input
                                                type="number" placeholder="Amount" value={newPaymentRequestForm.amount || ''}
                                                onChange={(e) => setNewPaymentRequestForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                                                min="0.01" step="0.01" className="p-2 border rounded-md"
                                            />
                                            <input
                                                type="text" placeholder="Currency (e.g., 'USD')" value={newPaymentRequestForm.currency}
                                                onChange={(e) => setNewPaymentRequestForm(prev => ({ ...prev, currency: e.target.value }))}
                                                className="p-2 border rounded-md"
                                            />
                                            <input
                                                type="text" placeholder="Recipient ID" value={newPaymentRequestForm.recipient}
                                                onChange={(e) => setNewPaymentRequestForm(prev => ({ ...prev, recipient: e.target.value }))}
                                                className="p-2 border rounded-md"
                                            />
                                            <input
                                                type="text" placeholder="Description (Optional)" value={newPaymentRequestForm.description}
                                                onChange={(e) => setNewPaymentRequestForm(prev => ({ ...prev, description: e.target.value }))}
                                                className="p-2 border rounded-md"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSimulatePaymentRequest}
                                            className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 shadow-sm w-full"
                                        >
                                            Simulate Payment Request
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Sub-section: Digital Identity & Audit Logs */}
                            <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
                                <h3 className="text-2xl font-semibold text-gray-700 mb-4">Digital Identity & Audit Governance</h3>
                                <p className="text-md text-gray-600 mb-6">
                                    Review key digital identity details for the current user and access tamper-evident audit logs. This ensures robust role-based access control (RBAC) and maintain an immutable record of all critical system events for compliance and security.
                                </p>
                                <div className="mb-6 p-4 bg-blue-50 rounded-md border border-blue-200">
                                    <h4 className="font-bold text-blue-800 text-lg mb-2">Current User Profile:</h4>
                                    {currentUser ? (
                                        <div>
                                            <p className="text-gray-700 text-sm">Name: <span className="font-semibold">{currentUser.name}</span></p>
                                            <p className="text-gray-700 text-sm">User ID: <span className="font-semibold">{currentUser.id}</span></p>
                                            <p className="text-gray-700 text-sm">Roles: <span className="font-semibold">{currentUser.roles.join(', ')}</span></p>
                                            <p className="text-gray-700 text-sm truncate">Public Key: <span className="font-mono text-xs">{currentUser.publicKey}</span></p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-600">No user profile loaded.</p>
                                    )}
                                </div>

                                <h4 className="font-bold text-gray-700 text-xl mb-3">Recent Audit Events:</h4>
                                <div className="max-h-80 overflow-y-auto pr-2">
                                    {auditEvents.length > 0 ? (
                                        [...auditEvents].reverse().map(event => (
                                            <div key={event.id} className="bg-white p-3 rounded-md shadow-sm border border-gray-200 mb-2">
                                                <p className="text-sm font-semibold text-gray-800">{event.action}</p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    User: {event.userId} | Target: {event.targetId} | Timestamp: {new Date(event.timestamp).toLocaleString()}
                                                </p>
                                                {event.details && <p className="text-xs text-gray-500 mt-1">Details: {JSON.stringify(event.details).substring(0, 100)}...</p>}
                                                <p className="text-xs text-gray-500 mt-1 truncate">Hash: {event.eventHash}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-600">No recent audit events.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {/* Modals */}

            {/* Insight Details Modal */}
            <Modal isOpen={isInsightDetailsModalOpen} onClose={closeInsightDetails} title={`Insight Details: ${selectedInsightForDisplay?.title || 'Loading...'}`}>
                {selectedInsightForDisplay ? (
                    <div className="space-y-4">
                        <p className="text-xl font-bold text-blue-700">{selectedInsightForDisplay.title}</p>
                        <p className="text-gray-700 leading-relaxed">{selectedInsightForDisplay.description}</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className={`px-3 py-1 rounded-full text-white ${getUrgencyClass(selectedInsightForDisplay.urgency)}`}>
                                Urgency: {selectedInsightForDisplay.urgency.toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-white ${getStatusClass(selectedInsightForDisplay.status || 'active')}`}>
                                Status: {(selectedInsightForDisplay.status || 'active').replace('-', ' ').toUpperCase()}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-800">
                                Type: {selectedInsightForDisplay.type.charAt(0).toUpperCase() + selectedInsightForDisplay.type.slice(1)}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-800">
                                Source: {selectedInsightForDisplay.source}
                            </span>
                        </div>
                        {selectedInsightForDisplay.explanation && (
                            <div>
                                <h3 className="text-lg font-semibold mt-4 mb-2 text-blue-800">AI Explanation:</h3>
                                <p className="bg-blue-50 p-3 rounded-md border border-blue-200 leading-relaxed">{selectedInsightForDisplay.explanation}</p>
                                <p className="text-xs italic text-gray-500 mt-2">
                                    (Explainable AI provides transparency into decision-making.)
                                </p>
                            </div>
                        )}
                        {selectedInsightForDisplay.recommendedActions && selectedInsightForDisplay.recommendedActions.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mt-4 mb-2 text-green-800">Recommended Actions:</h3>
                                <ul className="list-disc list-inside space-y-2">
                                    {selectedInsightForDisplay.recommendedActions.map(action => (
                                        <li key={action.id} className={`p-2 rounded-md ${action.status === 'completed' ? 'bg-green-100 line-through text-gray-500' : 'bg-white border border-gray-200'}`}>
                                            {action.description}
                                            {action.assignedTo && <span className="ml-2 text-blue-700"> (Assigned to: {collaborationUsers.find(u => u.id === action.assignedTo)?.name || action.assignedTo})</span>}
                                            {action.status !== 'completed' && (
                                                <button
                                                    onClick={() => handleMarkRecommendedActionComplete(selectedInsightForDisplay.id, action.id)}
                                                    className="ml-3 px-3 py-1 bg-emerald-500 text-white rounded-md text-xs hover:bg-emerald-600 transition-colors"
                                                >
                                                    Mark Done
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-xs italic text-gray-500 mt-2">
                                    (AI-driven actions streamline operational response.)
                                </p>
                            </div>
                        )}
                         {selectedInsightForDisplay.comments && selectedInsightForDisplay.comments.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">Discussion & Collaboration:</h3>
                                <div className="max-h-60 overflow-y-auto bg-gray-50 p-3 rounded-md border border-gray-200">
                                {selectedInsightForDisplay.comments.map(comment => (
                                    <div key={comment.id} className="mb-2 p-2 bg-white rounded-md border border-gray-100">
                                        <p className="text-sm font-semibold text-blue-700">{comment.userName} <span className="text-gray-500 font-normal text-xs ml-2">{new Date(comment.timestamp).toLocaleString()}</span></p>
                                        <p className="text-gray-800 mt-1">{comment.text}</p>
                                    </div>
                                ))}
                                </div>
                                <p className="text-xs italic text-gray-500 mt-2">
                                    (Leverage collective intelligence for better outcomes.)
                                </p>
                            </div>
                        )}

                        <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">Provide Feedback:</h3>
                            <div className="flex items-center space-x-3 mb-3">
                                <label className="text-gray-700 font-medium">Rating:</label>
                                <select
                                    value={feedbackInput.rating}
                                    onChange={(e) => setFeedbackInput(prev => ({ ...prev, rating: Number(e.target.value) }))}
                                    className="p-2 border border-gray-300 rounded-md"
                                >
                                    {[1, 2, 3, 4, 5].map(rating => <option key={rating} value={rating}>{rating} Star{rating > 1 ? 's' : ''}</option>)}
                                </select>
                            </div>
                            <textarea
                                value={feedbackInput.comment}
                                onChange={(e) => setFeedbackInput(prev => ({ ...prev, comment: e.target.value }))}
                                placeholder="Share your thoughts on this insight..."
                                rows={4}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base"
                            ></textarea>
                            <button
                                onClick={() => handleSubmitFeedback(selectedInsightForDisplay.id)}
                                disabled={!feedbackInput.comment.trim()}
                                className="mt-3 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                            >
                                Submit Feedback
                            </button>
                            <p className="text-xs italic text-gray-500 mt-2">
                                (Your feedback directly contributes to AI model refinement.)
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-600">Loading insight details...</p>
                )}
            </Modal>

            {/* AI Preferences Modal */}
            <Modal isOpen={isPreferencesModalOpen} onClose={() => setIsPreferencesModalOpen(false)} title="AI Preferences: Customize Your Intelligence">
                <p className="text-md text-gray-700 mb-6 leading-relaxed">
                    Personalize your AI experience. Adjust settings to tailor insight delivery, notification preferences, and AI model selection, ensuring the system operates in perfect harmony with your individual workflow and strategic priorities. This granular control maximizes the utility of AI for every user.
                </p>
                <div className="space-y-6">
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Favorite Insight Types:</label>
                        <select
                            name="insightTypes"
                            multiple
                            value={preferences.insightTypes}
                            onChange={handlePreferenceChange}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm h-48 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {availableInsightTypes.map(type => (
                                <option key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)} ({InsightTypeIconMap[type]})
                                </option>
                            ))}
                        </select>
                        <p className="text-sm text-gray-500 mt-2">
                            (Prioritize the types of insights most relevant to your role and objectives.)
                        </p>
                    </div>

                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Urgency Threshold:</label>
                        <select
                            name="urgencyThreshold"
                            value={preferences.urgencyThreshold}
                            onChange={handlePreferenceChange}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            {['informational', 'low', 'medium', 'high', 'critical'].map(urgency => (
                                <option key={urgency} value={urgency}>{urgency.charAt(0).toUpperCase() + urgency.slice(1)}</option>
                            ))}
                        </select>
                        <p className="text-sm text-gray-500 mt-2">
                            (Define the minimum urgency level for insights requiring your attention.)
                        </p>
                    </div>

                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Preferred AI Model:</label>
                        <select
                            name="modelSelection"
                            value={preferences.modelSelection}
                            onChange={handlePreferenceChange}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            {availableAIModels.map(model => (
                                <option key={model.id} value={model.id}>
                                    {model.name} v{model.version} ({model.status.charAt(0).toUpperCase() + model.status.slice(1)})
                                </option>
                            ))}
                        </select>
                        <p className="text-sm text-gray-500 mt-2">
                            (Select the AI model that best fits your performance and interpretability needs.)
                        </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                        <h3 className="text-xl font-bold text-blue-800 mb-3">Notification Settings:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="notificationSettings.email"
                                    checked={preferences.notificationSettings.email}
                                    onChange={handlePreferenceChange}
                                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                />
                                <span className="text-gray-700">Email Notifications</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="notificationSettings.push"
                                    checked={preferences.notificationSettings.push}
                                    onChange={handlePreferenceChange}
                                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                />
                                <span className="text-gray-700">Push Notifications</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="notificationSettings.sms"
                                    checked={preferences.notificationSettings.sms}
                                    onChange={handlePreferenceChange}
                                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                />
                                <span className="text-gray-700">SMS Alerts</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <span className="text-gray-700">Notification Threshold:</span>
                                <select
                                    name="notificationSettings.threshold"
                                    value={preferences.notificationSettings.threshold}
                                    onChange={handlePreferenceChange}
                                    className="p-2 border border-gray-300 rounded-md shadow-sm"
                                >
                                    <option value="all">All Insights</option>
                                    <option value="medium">Medium +</option>
                                    <option value="high">High +</option>
                                    <option value="critical">Critical Only</option>
                                </select>
                            </label>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            (Tailor notification frequency to prevent information overload.)
                        </p>
                    </div>

                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Refresh Interval (Minutes):</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                name="refreshIntervalMinutes"
                                value={preferences.refreshIntervalMinutes}
                                onChange={handlePreferenceChange}
                                min="1"
                                className="w-24 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                            <span className="text-gray-700">Minutes</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            (Set how frequently the dashboard automatically updates with new insights.)
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                    <button
                        onClick={resetPreferences}
                        className="bg-gray-400 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-gray-500 transition-colors duration-200 shadow-md"
                    >
                        Reset to Defaults
                    </button>
                    <button
                        onClick={handleSavePreferences}
                        className="bg-green-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors duration-200 shadow-md"
                    >
                        Save Preferences
                    </button>
                </div>
            </Modal>

            {/* AI System Health Modal */}
            <Modal isOpen={isSystemHealthModalOpen} onClose={() => setIsSystemHealthModalOpen(false)} title="AI System Health & Performance">
                <p className="text-md text-gray-700 mb-6 leading-relaxed">
                    Monitor the operational status and performance metrics of the entire AI system. This comprehensive overview ensures the continuous health, reliability, and efficiency of your AI infrastructure, critical for sustaining high-value insight generation and autonomous operations.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                        <h3 className="font-bold text-blue-800 text-lg mb-2">Overall Status: <span className="text-green-600">{aiSystemStatus.toUpperCase()}</span></h3>
                        <p className="text-gray-700 text-sm">Last Heartbeat: {new Date(aiPerformanceMetrics.lastHeartbeat).toLocaleString()}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
                        <h3 className="font-bold text-purple-800 text-lg mb-2">Insight Generation Rate:</h3>
                        <p className="text-gray-700 text-sm">{aiPerformanceMetrics.insightGenerationRate.toFixed(1)} Insights/minute</p>
                    </div>
                    <div className="bg-teal-50 p-4 rounded-md border border-teal-200">
                        <h3 className="font-bold text-teal-800 text-lg mb-2">Average Response Time:</h3>
                        <p className="text-gray-700 text-sm">{aiPerformanceMetrics.averageResponseTime.toFixed(0)} ms</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                        <h3 className="font-bold text-yellow-800 text-lg mb-2">Data Processing Volume:</h3>
                        <p className="text-gray-700 text-sm">{aiPerformanceMetrics.dataProcessingVolume.toFixed(2)} GB/hour</p>
                    </div>
                </div>
                <div className="bg-gray-100 p-4 rounded-md border border-gray-200 mb-6">
                    <h3 className="font-bold text-gray-800 text-lg mb-2">Resource Utilization:</h3>
                    <p className="text-gray-700 text-sm">CPU: {aiPerformanceMetrics.resourceUtilization.cpu.toFixed(1)}%</p>
                    <p className="text-gray-700 text-sm">Memory: {aiPerformanceMetrics.resourceUtilization.memory.toFixed(1)}%</p>
                    {aiPerformanceMetrics.resourceUtilization.gpu && (
                        <p className="text-gray-700 text-sm">GPU: {aiPerformanceMetrics.resourceUtilization.gpu.toFixed(1)}%</p>
                    )}
                </div>
                <button
                    onClick={checkSystemHealth}
                    className="bg-green-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors duration-200 shadow-md"
                >
                    Run Health Check
                </button>
                <p className="text-xs italic text-gray-500 mt-4">
                    (Regular health checks ensure optimal AI system performance.)
                </p>
            </Modal>

            {/* Add Prioritization Rule Modal */}
            <Modal isOpen={isAddRuleModalOpen} onClose={() => setIsAddRuleModalOpen(false)} title="Create New Prioritization Rule">
                <p className="text-md text-gray-700 mb-6 leading-relaxed">
                    Define new rules to customize how insights are prioritized. By setting specific criteria and boost factors, you can ensure the AI system consistently highlights the information most crucial to your business objectives, optimizing strategic focus.
                </p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-1">Rule Name:</label>
                        <input
                            type="text"
                            value={newRuleForm.name || ''}
                            onChange={(e) => setNewRuleForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., 'Boost Critical Financial Risks'"
                            className="w-full p-3 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-1">Boost Factor (e.g., 1.5 for 50% more priority):</label>
                        <input
                            type="number"
                            step="0.1"
                            value={newRuleForm.boostFactor || 1.2}
                            onChange={(e) => setNewRuleForm(prev => ({ ...prev, boostFactor: Number(e.target.value) }))}
                            className="w-full p-3 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-1">Criteria:</label>
                        <p className="text-sm text-gray-500 mb-2">(Select conditions to trigger this priority boost.)</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-md font-medium text-gray-600 mb-1">Insight Types:</label>
                                <select
                                    multiple
                                    value={newRuleForm.criteria?.type || []}
                                    onChange={(e) => setNewRuleForm(prev => ({ ...prev, criteria: { ...prev.criteria, type: Array.from(e.target.options).filter(o => o.selected).map(o => o.value) } }))}
                                    className="w-full p-2 border border-gray-300 rounded-md h-24"
                                >
                                    {availableInsightTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-md font-medium text-gray-600 mb-1">Urgencies:</label>
                                <select
                                    multiple
                                    value={newRuleForm.criteria?.urgency || []}
                                    onChange={(e) => setNewRuleForm(prev => ({ ...prev, criteria: { ...prev.criteria, urgency: Array.from(e.target.options).filter(o => o.selected).map(o => o.value) as any } }))}
                                    className="w-full p-2 border border-gray-300 rounded-md h-24"
                                >
                                    {['critical', 'high', 'medium', 'low', 'informational'].map(urgency => <option key={urgency} value={urgency}>{urgency}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-md font-medium text-gray-600 mb-1">Minimum Impact Score:</label>
                                <input
                                    type="number"
                                    value={newRuleForm.criteria?.minImpactScore || ''}
                                    onChange={(e) => setNewRuleForm(prev => ({ ...prev, criteria: { ...prev.criteria, minImpactScore: Number(e.target.value) } }))}
                                    placeholder="e.g., 75"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-4">
                    <button
                        onClick={() => setIsAddRuleModalOpen(false)}
                        className="bg-gray-400 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-gray-500 transition-colors duration-200 shadow-md"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveNewRule}
                        className="bg-green-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors duration-200 shadow-md"
                    >
                        Save New Rule
                    </button>
                </div>
            </Modal>

            {/* AI Model Details Modal */}
            <Modal isOpen={isModelDetailsModalOpen} onClose={() => setIsModelDetailsModalOpen(false)} title={`AI Model Details: ${getAIModelDetails(selectedAIModelForDetails || '')?.name || 'Unknown Model'}`}>
                {selectedAIModelForDetails ? (() => {
                    const model = getAIModelDetails(selectedAIModelForDetails);
                    if (!model) return <p className="text-gray-600">Model details not found.</p>;

                    return (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-blue-700">{model.name} <span className="text-sm font-normal text-gray-500">v{model.version}</span></h3>
                            <p className="text-gray-700 leading-relaxed">{model.description}</p>
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className={`px-3 py-1 rounded-full text-white ${model.status === 'active' ? 'bg-green-500' : model.status === 'training' ? 'bg-yellow-500' : 'bg-gray-500'}`}>
                                    Status: {model.status.toUpperCase()}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-800">
                                    Deployment Date: {new Date(model.deploymentDate).toLocaleDateString()}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-800">
                                    Last Updated: {new Date(model.lastUpdated).toLocaleDateString()}
                                </span>
                            </div>
                            {model.performanceMetrics && (
                                <div className="p-4 bg-purple-50 rounded-md border border-purple-200">
                                    <h4 className="font-semibold text-purple-800 text-lg mb-2">Performance Metrics:</h4>
                                    <p className="text-gray-700 text-sm">Accuracy: <span className="font-semibold">{(model.performanceMetrics.accuracy * 100).toFixed(2)}%</span></p>
                                    <p className="text-gray-700 text-sm">Precision: <span className="font-semibold">{(model.performanceMetrics.precision * 100).toFixed(2)}%</span></p>
                                    <p className="text-gray-700 text-sm">Recall: <span className="font-semibold">{(model.performanceMetrics.recall * 100).toFixed(2)}%</span></p>
                                    <p className="text-gray-700 text-sm">F1 Score: <span className="font-semibold">{(model.performanceMetrics.f1_score * 100).toFixed(2)}%</span></p>
                                    <p className="text-xs italic text-gray-500 mt-2">
                                        (These metrics are key indicators of model effectiveness.)
                                    </p>
                                </div>
                            )}
                            {model.trainingDataInfo && (
                                <div className="p-4 bg-teal-50 rounded-md border border-teal-200">
                                    <h4 className="font-semibold text-teal-800 text-lg mb-2">Training Data Info:</h4>
                                    <p className="text-gray-700 text-sm">Size: <span className="font-semibold">{model.trainingDataInfo.sizeGB} GB</span></p>
                                    <p className="text-gray-700 text-sm">Last Refresh: <span className="font-semibold">{new Date(model.trainingDataInfo.lastRefresh).toLocaleDateString()}</span></p>
                                    <p className="text-gray-700 text-sm">Bias Detected: <span className={`font-semibold ${model.trainingDataInfo.biasDetected ? 'text-red-600' : 'text-green-600'}`}>{model.trainingDataInfo.biasDetected ? 'Yes (Managed)' : 'No'}</span></p>
                                    <p className="text-xs italic text-gray-500 mt-2">
                                        (Training data quality and bias detection are critical for fair and accurate AI.)
                                    </p>
                                </div>
                            )}
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => deployAIModel(model.id)}
                                    disabled={model.status === 'active' || isModelTesting}
                                    className="bg-green-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors duration-200 shadow-md disabled:opacity-50"
                                >
                                    {isModelTesting && selectedAIModelForDetails === model.id ? 'Deploying...' : 'Deploy Model'}
                                </button>
                            </div>
                        </div>
                    );
                })() : <p className="text-center text-gray-600">Selecting model for details...</p>}
            </Modal>

            {/* Data Source Configuration Modal */}
            <Modal isOpen={isDataSourceConfigModalOpen} onClose={() => setIsDataSourceConfigModalOpen(false)} title={`Configure Data Source: ${selectedDataSourceConfig?.name || 'Unknown Source'}`}>
                {selectedDataSourceConfig ? (
                    <div className="space-y-4">
                        <p className="text-gray-700 leading-relaxed text-md mb-4">
                            Fine-tune the connection and behavior of your data sources. Optimized and reliably connected data streams are the lifeblood of our AI, ensuring accurate, timely, and impactful insights for strategic decision-making.
                        </p>
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-1">Data Source Name:</label>
                            <input
                                type="text"
                                value={selectedDataSourceConfig.name}
                                onChange={(e) => setSelectedDataSourceConfig(prev => prev ? { ...prev, name: e.target.value } : null)}
                                className="w-full p-3 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-1">Description:</label>
                            <textarea
                                value={selectedDataSourceConfig.description}
                                onChange={(e) => setSelectedDataSourceConfig(prev => prev ? { ...prev, description: e.target.value } : null)}
                                rows={3}
                                className="w-full p-3 border border-gray-300 rounded-md"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-1">Refresh Interval (Minutes):</label>
                            <input
                                type="number"
                                value={selectedDataSourceConfig.refreshIntervalMinutes}
                                onChange={(e) => setSelectedDataSourceConfig(prev => prev ? { ...prev, refreshIntervalMinutes: Number(e.target.value) } : null)}
                                min="1"
                                className="w-full p-3 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-1">Type:</label>
                            <span className="p-3 bg-gray-100 rounded-md block text-gray-800">{selectedDataSourceConfig.type.toUpperCase()} (Read-only for security)</span>
                        </div>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                onClick={() => setIsDataSourceConfigModalOpen(false)}
                                className="bg-gray-400 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-gray-500 transition-colors duration-200 shadow-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveDataSourceConfig}
                                className="bg-green-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors duration-200 shadow-md"
                            >
                                Save Configuration
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-600">Loading data source configuration...</p>
                )}
            </Modal>

            {/* Agent Details Modal - New for Money20/20 */}
            <Modal isOpen={isAgentDetailsModalOpen} onClose={closeAgentDetails} title={`AI Agent Details: ${selectedAgentForDisplay?.name || 'Unknown Agent'}`}>
                {selectedAgentForDisplay ? (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-blue-700">{selectedAgentForDisplay.name}</h3>
                        <p className="text-gray-700 leading-relaxed">{selectedAgentForDisplay.description}</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className={`px-3 py-1 rounded-full text-white ${selectedAgentForDisplay.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}>
                                Status: {selectedAgentForDisplay.status.toUpperCase()}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-800">
                                Last Active: {new Date(selectedAgentForDisplay.lastActive).toLocaleString()}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-800">
                                Type: {selectedAgentForDisplay.type}
                            </span>
                        </div>
                        <p className="text-sm text-gray-700">Roles: <span className="font-semibold">{selectedAgentForDisplay.roles.join(', ')}</span></p>
                        <p className="text-sm text-gray-700 truncate">Public Key: <span className="font-mono text-xs">{selectedAgentForDisplay.publicKey}</span></p>

                        <div className="p-4 bg-purple-50 rounded-md border border-purple-200">
                            <h4 className="font-semibold text-purple-800 text-lg mb-2">Assigned Skills:</h4>
                            {selectedAgentForDisplay.skills && selectedAgentForDisplay.skills.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1">
                                    {selectedAgentForDisplay.skills.map(skill => (
                                        <li key={skill.id} className="text-gray-700 text-sm flex justify-between items-center">
                                            <span>{skill.name}: {skill.description}</span>
                                            <button
                                                onClick={() => handleRemoveAgentSkill(selectedAgentForDisplay.id, skill.id)}
                                                className="ml-3 px-2 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600 transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-600 text-sm">No skills assigned to this agent.</p>
                            )}
                            <div className="mt-4 flex space-x-2">
                                <input
                                    type="text"
                                    placeholder="Add new skill name (e.g., 'Fraud Detection')"
                                    value={newSkillInput}
                                    onChange={(e) => setNewSkillInput(e.target.value)}
                                    className="flex-grow p-2 border rounded-md"
                                />
                                <button
                                    onClick={() => handleAssignAgentSkill(selectedAgentForDisplay.id)}
                                    disabled={!newSkillInput.trim()}
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                                >
                                    Add Skill
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-teal-50 rounded-md border border-teal-200">
                            <h4 className="font-semibold text-teal-800 text-lg mb-2">Agent Actions:</h4>
                            <div className="flex flex-col space-y-2">
                                <button
                                    onClick={() => handleTriggerAgentAction(selectedAgentForDisplay.id, 'reconcileLedger', { details: 'manual trigger' })}
                                    className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors duration-200"
                                >
                                    Trigger Ledger Reconciliation
                                </button>
                                <button
                                    onClick={() => handleTriggerAgentAction(selectedAgentForDisplay.id, 'reviewAnomaly', { anomalyId: 'sample-anomaly-123' })}
                                    className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors duration-200"
                                >
                                    Trigger Anomaly Review
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => handleSetAgentStatus(selectedAgentForDisplay.id, selectedAgentForDisplay.status === 'active' ? 'suspended' : 'active')}
                                className={`px-6 py-3 rounded-md text-lg font-semibold transition-colors duration-200 shadow-md ${selectedAgentForDisplay.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                {selectedAgentForDisplay.status === 'active' ? 'Suspend Agent' : 'Activate Agent'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-600">Loading agent details...</p>
                )}
            </Modal>

            {/* Payment Details Modal - New for Money20/20 */}
            <Modal isOpen={isPaymentDetailsModalOpen} onClose={closePaymentDetails} title={`Payment Details: ${selectedPaymentForDisplay?.id.substring(0, 10)}...`}>
                {selectedPaymentForDisplay ? (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-blue-700">Transaction ID: {selectedPaymentForDisplay.id}</h3>
                        <p className="text-gray-700 leading-relaxed">Description: {selectedPaymentForDisplay.description || 'N/A'}</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className={`px-3 py-1 rounded-full text-white ${selectedPaymentForDisplay.status === 'settled' ? 'bg-green-500' : selectedPaymentForDisplay.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                                Status: {selectedPaymentForDisplay.status.toUpperCase()}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-800">
                                Amount: {selectedPaymentForDisplay.amount} {selectedPaymentForDisplay.currency}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-800">
                                Rail Used: {selectedPaymentForDisplay.railUsed}
                            </span>
                        </div>
                        <p className="text-sm text-gray-700">Sender: <span className="font-semibold">{selectedPaymentForDisplay.sender}</span></p>
                        <p className="text-sm text-gray-700">Recipient: <span className="font-semibold">{selectedPaymentForDisplay.recipient}</span></p>
                        <p className="text-sm text-gray-700">Timestamp: <span className="font-semibold">{new Date(selectedPaymentForDisplay.timestamp).toLocaleString()}</span></p>

                        {selectedPaymentForDisplay.fraudScore && (
                            <div className={`p-4 rounded-md border ${selectedPaymentForDisplay.fraudScore > 0.5 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                <h4 className="font-semibold text-lg mb-2">Risk & Fraud Analysis:</h4>
                                <p className="text-gray-700 text-sm">Fraud Score: <span className="font-semibold">{selectedPaymentForDisplay.fraudScore.toFixed(2)}</span></p>
                                {selectedPaymentForDisplay.fraudReasons && selectedPaymentForDisplay.fraudReasons.length > 0 && (
                                    <p className="text-gray-700 text-sm">Reasons: {selectedPaymentForDisplay.fraudReasons.join(', ')}</p>
                                )}
                                <p className="text-xs italic text-gray-500 mt-2">
                                    (Real-time fraud detection enhances security and reduces financial loss.)
                                </p>
                            </div>
                        )}
                         {selectedPaymentForDisplay.routingDecision && (
                            <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                                <h4 className="font-semibold text-lg mb-2 text-blue-800">Routing Decision:</h4>
                                <p className="text-gray-700 text-sm">Chosen Rail: <span className="font-semibold">{selectedPaymentForDisplay.routingDecision.chosenRail}</span></p>
                                <p className="text-gray-700 text-sm">Predictive Latency: <span className="font-semibold">{selectedPaymentForDisplay.routingDecision.predictedLatencyMs} ms</span></p>
                                <p className="text-gray-700 text-sm">Cost Estimate: <span className="font-semibold">{selectedPaymentForDisplay.routingDecision.costEstimate}</span></p>
                                <p className="text-xs italic text-gray-500 mt-2">
                                    (AI-powered predictive routing optimizes for speed and cost.)
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-center text-gray-600">Loading payment details...</p>
                )}
            </Modal>
        </div>
    );
};

export default AIInsightsDashboard;