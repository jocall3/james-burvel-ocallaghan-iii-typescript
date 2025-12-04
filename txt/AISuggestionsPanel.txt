import React from 'react';
import { useAppContext, AISuggestion, getIcon } from '../../components/Sidebar'; // Adjust path as necessary

interface AISuggestionsPanelProps {
    className?: string;
}

const AISuggestionsPanel: React.FC<AISuggestionsPanelProps> = ({ className }) => {
    const { aiSuggestions, trackEvent } = useAppContext();

    if (!aiSuggestions || aiSuggestions.length === 0) {
        return (
            <div className={`p-4 text-center text-gray-500 dark:text-gray-400 ${className}`}>
                No new AI suggestions at this time.
            </div>
        );
    }

    const handleSuggestionClick = (suggestion: AISuggestion) => {
        trackEvent('ai_suggestion_clicked', {
            suggestionId: suggestion.id,
            suggestionType: suggestion.type,
            suggestionLabel: suggestion.label,
        });
        suggestion.action();
    };

    return (
        <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 ${className}`}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                {getIcon('sparkles', 'h-6 w-6 mr-2 text-purple-500')}
                AI Insights & Suggestions
            </h2>
            <div className="space-y-4">
                {aiSuggestions.map((suggestion) => (
                    <div
                        key={suggestion.id}
                        className="flex items-start bg-gray-50 dark:bg-gray-700 p-4 rounded-md shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow duration-200 ease-in-out"
                    >
                        <div className="flex-shrink-0 mr-3 text-purple-600 dark:text-purple-400">
                            {suggestion.icon || getIcon('lightbulb', 'h-5 w-5')}
                        </div>
                        <div className="flex-grow">
                            <p className="font-medium text-gray-900 dark:text-white text-md">
                                {suggestion.label}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {suggestion.context}
                                <span className="ml-2 text-xs font-semibold text-purple-700 dark:text-purple-300">
                                    ({(suggestion.confidence * 100).toFixed(0)}% Confidence)
                                </span>
                            </p>
                        </div>
                        <button
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="flex-shrink-0 ml-4 px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                            aria-label={`Take action on ${suggestion.label}`}
                        >
                            {suggestion.type === 'action' ? 'Act Now' : 'View Details'}
                        </button>
                    </div>
                ))}
            </div>
            <div className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
                Powered by Quantum Analytics Engine v3.0
            </div>
        </div>
    );
};

export default AISuggestionsPanel;