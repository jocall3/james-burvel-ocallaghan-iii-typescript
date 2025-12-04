import React from 'react';
import { AIResponse, FollowUpAction, Intent, NLPService, ConversationManager } from '../VoiceControl'; // Adjust import path as necessary based on file location

interface InteractiveAIResponseProps {
    response: AIResponse;
}

const InteractiveAIResponse: React.FC<InteractiveAIResponseProps> = ({ response }) => {
    const nlpService = NLPService.getInstance();
    const conversationManager = ConversationManager.getInstance();

    const handleFollowUpAction = (actionIntent: Intent, actionLabel: string) => {
        // The seed's VoiceFeedbackDisplay uses action.label for processSpeech.
        // It's more robust to use the explicit intent if available, but
        // for consistency with the seed's example, we pass the label.
        // A more advanced implementation might pass the full intent object directly.
        nlpService.processSpeech(actionLabel, conversationManager.getCurrentState());
    };

    return (
        <div className={`p-2 rounded-lg ${response.isProactive ? 'bg-indigo-700/50' : 'bg-gray-700/50'} border border-gray-600 transition-all duration-300 ease-out animate-fade-in`}>
            <p className="text-gray-300 font-semibold mb-1">
                {response.isProactive ? 'Suggestion:' : 'AI Response:'}
            </p>
            <p className="text-white text-base leading-relaxed">
                {response.text}
            </p>

            {response.followUpActions && response.followUpActions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-600">
                    {response.followUpActions.map((action, index) => (
                        <button
                            key={index}
                            className="px-3 py-1 bg-cyan-600 text-white text-xs rounded-full hover:bg-cyan-500 transition-colors shadow-sm"
                            onClick={() => handleFollowUpAction(action.intent, action.label)}
                        >
                            {action.icon && <span className="mr-1">{action.icon}</span>}{action.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Visual Feedback Elements */}
            {response.visualFeedback === 'waveform' && (
                <div className="mt-3 h-4 w-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse-wave-short"></div>
            )}
            {response.visualFeedback === 'chart' && (
                <div className="mt-3 h-16 w-full bg-gray-600 rounded-lg flex items-end overflow-hidden p-2">
                    <div className="h-4/5 w-1/4 bg-blue-400 mx-1 rounded-sm animate-grow-bar" style={{ animationDelay: '0s' }}></div>
                    <div className="h-3/5 w-1/4 bg-green-400 mx-1 rounded-sm animate-grow-bar" style={{ animationDelay: '0.1s' }}></div>
                    <div className="h-2/5 w-1/4 bg-purple-400 mx-1 rounded-sm animate-grow-bar" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-1/5 w-1/4 bg-red-400 mx-1 rounded-sm animate-grow-bar" style={{ animationDelay: '0.3s' }}></div>
                </div>
            )}
            {response.visualFeedback === 'map' && (
                <div className="mt-3 h-16 w-full bg-blue-800 rounded-lg flex items-center justify-center text-xs text-white">
                    📍 Showing results on map...
                </div>
            )}
            {/* 'text' and 'none' visual feedbacks are handled by the main text display */}

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }

                @keyframes pulse-wave-short {
                    0%, 100% { transform: scaleX(0.8); opacity: 0.8; }
                    50% { transform: scaleX(1.0); opacity: 1; }
                }
                .animate-pulse-wave-short { animation: pulse-wave-short 1.2s ease-in-out infinite; }

                @keyframes grow-bar {
                    0% { transform: scaleY(0); opacity: 0; }
                    100% { transform: scaleY(1); opacity: 1; }
                }
                .animate-grow-bar { animation: grow-bar 0.4s ease-out forwards; transform-origin: bottom; }
            `}</style>
        </div>
    );
};

export default InteractiveAIResponse;