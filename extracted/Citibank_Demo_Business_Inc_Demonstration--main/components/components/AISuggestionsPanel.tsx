/**
 * The AISuggestionsPanel component provides a critical human-in-the-loop interface for
 * autonomous AI agents, transforming raw insights into actionable business outcomes.
 * Business value: This panel significantly enhances operational efficiency by surfacing
 * high-confidence, AI-generated recommendations for fraud detection, payment optimization,
 * compliance adherence, and system anomaly resolution. It reduces manual review time by
 * providing contextual information and direct action capabilities, enabling rapid
 * intervention and remediation. This accelerated decision-making process minimizes
 * financial risk, maximizes revenue assurance, and ensures regulatory compliance,
 * ultimately contributing millions to the bottom line through proactive issue resolution
 * and strategic opportunity identification. It acts as the command center where
 * complex agentic outputs are distilled into immediate, value-generating actions for operators.
 */
import React from 'react';
import { useAppContext, AISuggestion, getIcon } from '../../components/Sidebar'; // Adjust path as necessary

interface AISuggestionsPanelProps {
    className?: string;
}

/**
 * Defines an extended AISuggestion interface to support richer data for commercial AI systems.
 * This interface anticipates additional attributes provided by agentic AI modules,
 * enhancing transparency and decision-making for human operators.
 */
export interface ExtendedAISuggestion extends AISuggestion {
    agentId?: string; // Identifier of the AI agent that generated the suggestion
    timestamp: string; // ISO string for when the suggestion was generated
    status: 'pending' | 'accepted' | 'dismissed' | 'resolved'; // Current lifecycle status of the suggestion
    severity: 'low' | 'medium' | 'high' | 'critical'; // Severity level indicating potential impact or urgency
    category: 'fraud' | 'optimization' | 'compliance' | 'performance' | 'security' | 'other'; // Business category of the suggestion
    impactEstimate?: string; // Estimated business impact if the suggestion is acted upon (e.g., "$10k saved", "5% latency reduction")
    actionDetails?: { // Details for handling the action, allowing for more complex workflows
        type: 'automatic' | 'manual-review' | 'human-approval';
        requiresApproval?: boolean; // True if the action needs explicit human approval before execution
        approvalWorkflowId?: string; // Identifier for an associated approval workflow
    };
}


const AISuggestionsPanel: React.FC<AISuggestionsPanelProps> = ({ className }) => {
    // useAppContext is expected to provide a robust set of AI suggestions,
    // and functions to interact with their lifecycle (e.g., dismiss, resolve, approve).
    const { aiSuggestions: rawSuggestions, trackEvent, dismissAISuggestion, resolveAISuggestion } = useAppContext();

    // Cast and enrich rawSuggestions to ExtendedAISuggestion for type safety and default values.
    // In a production environment, `useAppContext` would directly return `ExtendedAISuggestion[]`.
    const aiSuggestions: ExtendedAISuggestion[] = (rawSuggestions as ExtendedAISuggestion[] || []).map(s => ({
        ...s,
        timestamp: s.timestamp || new Date().toISOString(),
        status: s.status || 'pending',
        severity: s.severity || 'medium',
        category: s.category || 'other',
    }));

    // Filter suggestions based on their lifecycle status for organized display.
    const pendingSuggestions = aiSuggestions.filter(s => s.status === 'pending');
    const resolvedOrDismissedSuggestions = aiSuggestions.filter(s => s.status !== 'pending');

    /**
     * Handles the click event for taking action on a suggestion.
     * Initiates event tracking and simulates a more complex action workflow,
     * including error handling and updating the suggestion's status.
     * @param suggestion The AI suggestion to act upon.
     */
    const handleSuggestionClick = (suggestion: ExtendedAISuggestion) => {
        trackEvent('ai_suggestion_action_initiated', {
            suggestionId: suggestion.id,
            suggestionType: suggestion.type,
            suggestionLabel: suggestion.label,
            agentId: suggestion.agentId,
            category: suggestion.category,
            severity: suggestion.severity,
            statusBeforeAction: suggestion.status,
            actionTrigger: 'click',
        });
        
        try {
            // Execute the original action callback provided by the AI agent.
            // This could trigger an agent workflow, dispatch an event, or open a specific view.
            suggestion.action(); 
            if (resolveAISuggestion) {
                // Assuming `resolveAISuggestion` updates the global state within `useAppContext`.
                resolveAISuggestion(suggestion.id);
            }
            trackEvent('ai_suggestion_action_successful', {
                suggestionId: suggestion.id,
                suggestionLabel: suggestion.label,
            });
        } catch (error) {
            console.error(`Error executing AI suggestion action for ${suggestion.id}:`, error);
            trackEvent('ai_suggestion_action_failed', {
                suggestionId: suggestion.id,
                suggestionLabel: suggestion.label,
                error: error instanceof Error ? error.message : String(error),
            });
            // In a commercial-grade application, this would trigger a user notification
            // and potentially an internal alert for system operators.
        }
    };

    /**
     * Handles dismissing a suggestion, marking it as no longer requiring immediate attention.
     * @param suggestion The AI suggestion to dismiss.
     */
    const handleDismiss = (suggestion: ExtendedAISuggestion) => {
        trackEvent('ai_suggestion_dismissed', {
            suggestionId: suggestion.id,
            suggestionType: suggestion.type,
            suggestionLabel: suggestion.label,
            agentId: suggestion.agentId,
            category: suggestion.category,
        });
        if (dismissAISuggestion) {
            // Assuming `dismissAISuggestion` updates the global state within `useAppContext`.
            dismissAISuggestion(suggestion.id);
        }
    };

    /**
     * Determines the appropriate text color based on the suggestion's severity.
     * @param severity The severity level of the suggestion.
     * @returns Tailwind CSS class for text color.
     */
    const getSeverityColor = (severity: ExtendedAISuggestion['severity']) => {
        switch (severity) {
            case 'critical': return 'text-red-600 dark:text-red-400';
            case 'high': return 'text-orange-600 dark:text-orange-400';
            case 'medium': return 'text-yellow-600 dark:text-yellow-400';
            case 'low': return 'text-green-600 dark:text-green-400';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    };

    /**
     * Selects an appropriate icon based on the suggestion's category for better visual identification.
     * @param category The business category of the suggestion.
     * @returns React element representing the icon.
     */
    const getCategoryIcon = (category: ExtendedAISuggestion['category']) => {
        switch (category) {
            case 'fraud': return getIcon('shield-exclamation', 'h-5 w-5');
            case 'optimization': return getIcon('chart-bar', 'h-5 w-5');
            case 'compliance': return getIcon('clipboard-check', 'h-5 w-5');
            case 'performance': return getIcon('bolt', 'h-5 w-5');
            case 'security': return getIcon('lock-closed', 'h-5 w-5');
            default: return getIcon('lightbulb', 'h-5 w-5');
        }
    };

    if (pendingSuggestions.length === 0 && resolvedOrDismissedSuggestions.length === 0) {
        return (
            <div className={`p-4 text-center text-gray-500 dark:text-gray-400 ${className}`}>
                No new AI insights or past suggestions to display at this time.
            </div>
        );
    }

    return (
        <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 ${className}`}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                {getIcon('sparkles', 'h-6 w-6 mr-2 text-purple-500')}
                AI Insights & Actionable Suggestions
            </h2>

            {pendingSuggestions.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                        Pending Actions ({pendingSuggestions.length})
                    </h3>
                    <div className="space-y-4">
                        {pendingSuggestions.map((suggestion) => (
                            <div
                                key={suggestion.id}
                                className="flex flex-col sm:flex-row items-start sm:items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-md shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow duration-200 ease-in-out"
                            >
                                <div className="flex-shrink-0 mr-3 text-purple-600 dark:text-purple-400">
                                    {suggestion.icon || getCategoryIcon(suggestion.category)}
                                </div>
                                <div className="flex-grow">
                                    <p className="font-medium text-gray-900 dark:text-white text-md">
                                        {suggestion.label}
                                        <span className={`ml-2 text-xs font-semibold ${getSeverityColor(suggestion.severity)}`}>
                                            ({suggestion.severity.toUpperCase()})
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                        {suggestion.context}
                                        <span className="ml-2 text-xs font-semibold text-purple-700 dark:text-purple-300">
                                            ({(suggestion.confidence * 100).toFixed(0)}% Confidence)
                                        </span>
                                        {suggestion.agentId && (
                                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                                (Agent: {suggestion.agentId})
                                            </span>
                                        )}
                                        {suggestion.impactEstimate && (
                                            <span className="ml-2 text-xs text-blue-700 dark:text-blue-400">
                                                (Impact: {suggestion.impactEstimate})
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Suggested on: {new Date(suggestion.timestamp).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex-shrink-0 mt-3 sm:mt-0 sm:ml-4 flex space-x-2">
                                    <button
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                                        aria-label={`Take action on ${suggestion.label}`}
                                    >
                                        {suggestion.actionDetails?.requiresApproval ? 'Review & Approve' : (suggestion.type === 'action' ? 'Act Now' : 'View Details')}
                                    </button>
                                    <button
                                        onClick={() => handleDismiss(suggestion)}
                                        className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                                        aria-label={`Dismiss ${suggestion.label}`}
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {resolvedOrDismissedSuggestions.length > 0 && (
                <div>
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3 mt-6">
                        Past Suggestions ({resolvedOrDismissedSuggestions.length})
                    </h3>
                    <div className="space-y-3">
                        {resolvedOrDismissedSuggestions.map((suggestion) => (
                            <div
                                key={suggestion.id}
                                className={`flex items-start bg-gray-100 dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600 opacity-75 ${suggestion.status === 'dismissed' ? 'italic' : ''}`}
                            >
                                <div className="flex-shrink-0 mr-3 text-gray-500 dark:text-gray-400">
                                    {suggestion.icon || getCategoryIcon(suggestion.category)}
                                </div>
                                <div className="flex-grow">
                                    <p className="font-medium text-gray-700 dark:text-gray-300 text-md">
                                        {suggestion.label}
                                        <span className={`ml-2 text-xs font-semibold ${getSeverityColor(suggestion.severity)}`}>
                                            ({suggestion.severity.toUpperCase()})
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {suggestion.context}
                                        <span className="ml-2 text-xs font-semibold text-gray-600 dark:text-gray-500">
                                            ({(suggestion.confidence * 100).toFixed(0)}% Confidence)
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Status: <span className="font-semibold capitalize">{suggestion.status}</span> on {new Date(suggestion.timestamp).toLocaleString()}
                                        {suggestion.agentId && (
                                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                                (Agent: {suggestion.agentId})
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
                Powered by Money20/20 Agentic Intelligence Engine v1.0
            </div>
        </div>
    );
};

export default AISuggestionsPanel;