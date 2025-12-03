/**
 * This module implements the InteractiveAIResponse component, a sophisticated user interface element
 * for presenting AI-generated responses and actionable follow-up prompts. Business value: This component
 * is crucial for human-in-the-loop agentic AI workflows, enhancing user engagement and efficiency.
 * By providing rich, context-aware visual feedback, structured data displays (e.g., transaction summaries,
 * identity verification statuses, agent activity logs, security alerts), and dynamic follow-up actions,
 * it transforms raw AI output into intuitive, actionable intelligence. This reduces cognitive load,
 * accelerates decision-making, and ensures that complex financial operations managed by AI are transparent
 * and controllable by human operators. It directly contributes to operational velocity, mitigates
 * compliance risks through clear audit trails and status updates, and unlocks new revenue streams
 * by enabling rapid adoption of advanced AI-driven financial services.
 */
import React from 'react';
import { AIResponse, FollowUpAction, Intent, NLPService, ConversationManager } from '../VoiceControl'; // Adjust import path as necessary based on file location

// New types for structured data, assumed to be part of an extended AIResponse.
// These interfaces define the shape of rich data that the AI might return,
// allowing the UI to render context-specific information without altering
// the core AIResponse interface imported from VoiceControl.
export interface TransactionSummaryData {
    id: string;
    type: 'payment' | 'transfer' | 'settlement';
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'authorized';
    sourceAccount?: string;
    destinationAccount?: string;
    rail?: string;
    timestamp: string;
    auditLogId?: string;
}

export interface IdentityVerificationData {
    userId: string;
    status: 'verified' | 'pending' | 'failed';
    method: 'biometric' | 'kyc_document' | '2fa';
    timestamp: string;
    reason?: string;
    policy?: string; // e.g., "AML Policy V1.2"
}

export interface AgentActivityLog {
    agentId: string;
    agentName: string;
    task: string;
    status: 'started' | 'running' | 'completed' | 'error' | 'paused';
    timestamp: string;
    details?: string;
    nextSteps?: string[];
    governanceContext?: string; // e.g., "Role-based approval required"
}

export interface SecurityAlertData {
    alertId: string;
    level: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: string;
    actionTaken?: string;
    affectedEntity?: string;
    riskScore?: number;
    mitigationPlan?: string;
}

export interface InteractiveAIResponseStructuredData {
    type: 'transactionSummary' | 'identityVerification' | 'agentActivity' | 'securityAlert';
    data: TransactionSummaryData | IdentityVerificationData | AgentActivityLog | SecurityAlertData;
}

export interface InteractiveAIResponseProps {
    response: AIResponse;
}

/**
 * Renders a compact summary of a financial transaction.
 * Business value: Provides immediate, at-a-glance visibility into critical transaction
 * details, accelerating operational review and reducing the time-to-decision for human
 * operators. This enhances transparency and auditability in token rail operations.
 */
export const TransactionSummaryDisplay: React.FC<{ data: TransactionSummaryData }> = ({ data }) => (
    <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 mt-2 text-sm text-gray-200">
        <h4 className="font-bold text-cyan-400 mb-1">Transaction Summary ({data.status})</h4>
        <p><strong>ID:</strong> {data.id}</p>
        <p><strong>Type:</strong> {data.type.charAt(0).toUpperCase() + data.type.slice(1)}</p>
        <p><strong>Amount:</strong> {data.amount.toFixed(2)} {data.currency}</p>
        {data.sourceAccount && <p><strong>From:</strong> {data.sourceAccount}</p>}
        {data.destinationAccount && <p><strong>To:</strong> {data.destinationAccount}</p>}
        {data.rail && <p><strong>Rail:</strong> {data.rail}</p>}
        <p><strong>Time:</strong> {new Date(data.timestamp).toLocaleString()}</p>
        {data.auditLogId && <p className="text-gray-400 text-xs mt-1">Audit Log: {data.auditLogId}</p>}
    </div>
);

/**
 * Displays the status of an identity verification process.
 * Business value: Crucial for real-time risk management and compliance.
 * Clearly presenting identity status enables rapid authorization or flagging
 * of transactions, directly supporting robust digital identity frameworks
 * and reducing potential fraud vectors.
 */
export const IdentityVerificationStatusDisplay: React.FC<{ data: IdentityVerificationData }> = ({ data }) => (
    <div className={`p-3 rounded-lg border mt-2 text-sm ${data.status === 'verified' ? 'bg-green-800/50 border-green-700' : data.status === 'pending' ? 'bg-yellow-800/50 border-yellow-700' : 'bg-red-800/50 border-red-700'} text-gray-200`}>
        <h4 className="font-bold text-lg mb-1">Identity Verification</h4>
        <p className="text-base">User ID: <span className="font-mono">{data.userId}</span></p>
        <p>Status: <span className="font-semibold">{data.status.toUpperCase()}</span></p>
        <p>Method: {data.method}</p>
        <p>Time: {new Date(data.timestamp).toLocaleString()}</p>
        {data.reason && <p className="text-gray-300 mt-1">Reason: {data.reason}</p>}
        {data.policy && <p className="text-gray-400 text-xs mt-1">Policy: {data.policy}</p>}
    </div>
);

/**
 * Presents a log of an agent's activity and current status.
 * Business value: Enhances observability into agentic AI workflows, allowing operators
 * to monitor autonomous task execution, identify bottlenecks, and intervene if necessary.
 * This transparency builds trust, facilitates governance, and ensures agents operate
 * within defined parameters, thereby maximizing operational efficiency and control.
 */
export const AgentActivityDisplay: React.FC<{ data: AgentActivityLog }> = ({ data }) => (
    <div className="bg-blue-900/50 p-3 rounded-lg border border-blue-800 mt-2 text-sm text-gray-200">
        <h4 className="font-bold text-blue-300 mb-1">Agent Activity: {data.agentName}</h4>
        <p>Task: <span className="font-semibold">{data.task}</span></p>
        <p>Status: <span className={`font-semibold ${data.status === 'completed' ? 'text-green-400' : data.status === 'error' ? 'text-red-400' : 'text-blue-400'}`}>{data.status.toUpperCase()}</span></p>
        <p>Time: {new Date(data.timestamp).toLocaleString()}</p>
        {data.details && <p className="text-gray-300 mt-1">Details: {data.details}</p>}
        {data.nextSteps && data.nextSteps.length > 0 && (
            <div className="mt-2">
                <p className="font-semibold">Next Steps:</p>
                <ul className="list-disc list-inside ml-2 text-xs text-gray-400">
                    {data.nextSteps.map((step, i) => <li key={i}>{step}</li>)}
                </ul>
            </div>
        )}
        {data.governanceContext && <p className="text-gray-400 text-xs mt-1">Governance: {data.governanceContext}</p>}
    </div>
);

/**
 * Displays critical security alerts generated by the system.
 * Business value: Provides immediate awareness of potential security incidents
 * or anomalous activities, empowering rapid response and mitigation. This component
 * is vital for maintaining the integrity and security of the financial infrastructure,
 * protecting against fraud, and ensuring compliance with regulatory mandates.
 */
export const SecurityAlertDisplay: React.FC<{ data: SecurityAlertData }> = ({ data }) => (
    <div className={`p-3 rounded-lg border mt-2 text-sm ${data.level === 'critical' ? 'bg-red-900/50 border-red-700' : data.level === 'warning' ? 'bg-orange-800/50 border-orange-700' : 'bg-gray-800/50 border-gray-700'} text-gray-200`}>
        <h4 className={`font-bold text-lg mb-1 ${data.level === 'critical' ? 'text-red-400' : data.level === 'warning' ? 'text-orange-400' : 'text-gray-400'}`}>Security Alert ({data.level.toUpperCase()})</h4>
        <p>ID: <span className="font-mono">{data.alertId}</span></p>
        <p>Message: {data.message}</p>
        <p>Time: {new Date(data.timestamp).toLocaleString()}</p>
        {data.affectedEntity && <p>Affected: {data.affectedEntity}</p>}
        {data.riskScore !== undefined && <p>Risk Score: {data.riskScore}</p>}
        {data.actionTaken && <p className="text-gray-300 mt-1">Action: {data.actionTaken}</p>}
        {data.mitigationPlan && <p className="text-gray-400 text-xs mt-1">Mitigation: {data.mitigationPlan}</p>}
    </div>
);

/**
 * Provides a visual indicator that the AI system is actively processing a request.
 * Business value: Enhances user experience by providing clear feedback during AI computation,
 * managing expectations, and reducing perceived latency. This small but critical detail
 * improves system usability and reinforces a sense of responsiveness for complex agentic operations.
 */
export const AIProcessingIndicator: React.FC = () => (
    <div className="mt-3 flex items-center justify-center space-x-2 p-2 bg-gray-800 rounded-lg">
        <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <span className="text-gray-400 text-xs ml-2">AI is processing...</span>
    </div>
);

const InteractiveAIResponse: React.FC<InteractiveAIResponseProps> = ({ response }) => {
    const nlpService = NLPService.getInstance();
    const conversationManager = ConversationManager.getInstance();

    const handleFollowUpAction = (actionIntent: Intent, actionLabel: string) => {
        /**
         * Orchestrates the user's interaction by relaying chosen follow-up actions
         * back to the NLP service. This ensures the conversational flow remains aligned
         * with user intent and AI guidance, acting as a critical bridge between human decision
         * and agentic execution. It enables dynamic, multi-turn interactions that are
         * essential for complex financial workflows.
         */
        nlpService.processSpeech(actionLabel, conversationManager.getCurrentState());
    };

    // Safely cast response to any to access potentially extended properties that
    // might be added by the agentic AI system at runtime, without modifying the
    // imported AIResponse interface. This provides flexibility for evolving AI output.
    const extendedResponse = response as any;

    return (
        <div className={`p-2 rounded-lg ${extendedResponse.isProactive ? 'bg-indigo-700/50' : 'bg-gray-700/50'} border border-gray-600 transition-all duration-300 ease-out animate-fade-in`}>
            {extendedResponse.isProcessing && <AIProcessingIndicator />}
            
            <p className="text-gray-300 font-semibold mb-1">
                {extendedResponse.isProactive ? 'Suggestion:' : 'AI Response:'}
            </p>
            <p className="text-white text-base leading-relaxed">
                {extendedResponse.text}
            </p>

            {/* Structured Data Display Section: Renders detailed business-critical information */}
            {extendedResponse.structuredData && (
                <div className="mt-3">
                    {extendedResponse.structuredData.type === 'transactionSummary' && (
                        <TransactionSummaryDisplay data={extendedResponse.structuredData.data as TransactionSummaryData} />
                    )}
                    {extendedResponse.structuredData.type === 'identityVerification' && (
                        <IdentityVerificationStatusDisplay data={extendedResponse.structuredData.data as IdentityVerificationData} />
                    )}
                    {extendedResponse.structuredData.type === 'agentActivity' && (
                        <AgentActivityDisplay data={extendedResponse.structuredData.data as AgentActivityLog} />
                    )}
                    {extendedResponse.structuredData.type === 'securityAlert' && (
                        <SecurityAlertDisplay data={extendedResponse.structuredData.data as SecurityAlertData} />
                    )}
                </div>
            )}

            {extendedResponse.followUpActions && extendedResponse.followUpActions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-600">
                    {extendedResponse.followUpActions.map((action, index) => (
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

            {/* Dynamic Visual Feedback Elements: Provide immediate, non-verbal cues to the user */}
            {extendedResponse.visualFeedback === 'waveform' && (
                <div className="mt-3 h-4 w-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse-wave-short"></div>
            )}
            {extendedResponse.visualFeedback === 'chart' && (
                <div className="mt-3 h-16 w-full bg-gray-600 rounded-lg flex items-end overflow-hidden p-2">
                    <div className="h-4/5 w-1/4 bg-blue-400 mx-1 rounded-sm animate-grow-bar" style={{ animationDelay: '0s' }}></div>
                    <div className="h-3/5 w-1/4 bg-green-400 mx-1 rounded-sm animate-grow-bar" style={{ animationDelay: '0.1s' }}></div>
                    <div className="h-2/5 w-1/4 bg-purple-400 mx-1 rounded-sm animate-grow-bar" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-1/5 w-1/4 bg-red-400 mx-1 rounded-sm animate-grow-bar" style={{ animationDelay: '0.3s' }}></div>
                </div>
            )}
            {extendedResponse.visualFeedback === 'map' && (
                <div className="mt-3 h-16 w-full bg-blue-800 rounded-lg flex items-center justify-center text-xs text-white">
                    <span role="img" aria-label="map-pin" className="mr-2">📍</span> Showing results on map...
                </div>
            )}
            {extendedResponse.visualFeedback === 'success' && (
                <div className="mt-3 h-8 w-full bg-green-600 rounded-full flex items-center justify-center text-white text-sm animate-pulse-once">
                    <span role="img" aria-label="check" className="mr-2">✅</span> Action Completed!
                </div>
            )}
            {/* 'text' and 'none' visual feedbacks are inherently handled by the main text display */}

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

                @keyframes bounce {
                    0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
                    50% { transform: translateY(0); animation-timing-function: cubic-bezier(0,0,0.2,1); }
                }
                .animate-bounce { animation: bounce 1s infinite; }

                @keyframes pulse-once {
                    0% { transform: scale(0.9); opacity: 0.7; }
                    50% { transform: scale(1.02); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-pulse-once { animation: pulse-once 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default InteractiveAIResponse;
