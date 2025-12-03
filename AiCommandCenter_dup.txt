// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Type, FunctionDeclaration } from "@google/genai";
import { getInferenceFunction, CommandResponse, FEATURE_TAXONOMY, logError } from '../../services/index';
import { useAppContext } from '../../contexts/GlobalStateContext';
import { CommandLineIcon } from '../icons';
import { LoadingSpinner } from '../shared/index';
import { RAW_FEATURES } from '../../constants';

// --- Aethelgard Core Interface Definitions (Internal to Command Center for expanded capabilities) ---
// These interfaces represent the enhanced capabilities of the Aethelgard system
// and how the Command Center component interprets and interacts with them.

/**
 * Represents structured data for a code block output from Aethelgard.
 */
interface AICodeBlockData {
    language: string;
    code: string;
    description?: string;
}

/**
 * Represents structured data for a chart or visualization output from Aethelgard.
 */
interface AIChartData {
    type: 'bar' | 'line' | 'pie' | 'scatter' | 'table';
    data: Record<string, any>[]; // Array of objects for rows/points
    labels?: string[];
    title?: string;
    xLabel?: string;
    yLabel?: string;
    description?: string;
}

/**
 * Represents structured data for a simulation outcome from Aethelgard's Chronos Engine.
 */
interface AISimulationOutcome {
    id: string;
    scenario: string;
    parameters: Record<string, any>;
    results: Record<string, any>;
    timeline?: { event: string; timestamp: string; details: any }[];
    confidence: number;
    visualizations?: AIChartData[];
    description?: string;
}

/**
 * Represents a proposed hypothesis from Aethelgard.
 */
interface AIHypothesis {
    statement: string;
    justification: string;
    predictedOutcome: string;
    evidenceLinks?: string[]; // URLs or internal knowledge graph references
    confidence: number;
    ethicalImplications?: string;
}

/**
 * Represents a generated experiment design from Aethelgard.
 */
interface AIExperimentDesign {
    name: string;
    objective: string;
    methodology: string;
    parameters: Record<string, any>;
    expectedResults: string;
    risks: string;
    ethicalReviewRequired: boolean;
}

/**
 * Represents the Aethelgard Ethos Layer report for a given response.
 */
interface AethelgardEthosReport {
    ethicalAlignmentScore: number; // 0-100
    biasDetectionStatus: 'none' | 'minor' | 'potential' | 'significant';
    biasExplanation?: string;
    transparencyScore: number; // 0-100, how explainable the reasoning is
    privacyCompliance: 'full' | 'partial' | 'N/A';
    humanOversightRecommended: boolean;
    recommendationReason?: string;
}

/**
 * Extended Aethelgard response types, to be included in `CommandResponse` from `getInferenceFunction`.
 * This extends the basic `CommandResponse` to include rich media and Aethelgard-specific metadata.
 */
interface AethelgardExtendedResponse extends CommandResponse {
    ethosReport?: AethelgardEthosReport;
    sources?: string[]; // URLs, document IDs, knowledge graph nodes
    confidenceScore?: number; // 0-1 (from Lumina Core)
    processingUnitsUsed?: { lumina: number; agora: number; chronos: number }; // For internal tracking/billing
    generatedCode?: AICodeBlockData[];
    generatedCharts?: AIChartData[];
    simulationOutcomes?: AISimulationOutcome[];
    proposedHypotheses?: AIHypothesis[];
    experimentDesigns?: AIExperimentDesign[];
    // Add other generative types as needed, e.g., generatedTextSegments, designConcepts
}

/**
 * Represents a single message in the conversation history.
 */
interface ConversationMessage {
    id: string;
    sender: 'user' | 'ai';
    timestamp: string;
    text?: string;
    functionCalls?: FunctionCallPayload[];
    rawResponse?: string; // Storing raw AI text response
    extendedResponse?: AethelgardExtendedResponse; // For rich content
    feedback?: 'upvote' | 'downvote' | null;
    meta?: {
        ethosReport?: AethelgardEthosReport;
        confidenceScore?: number;
        sources?: string[];
        processingUnits?: { lumina: number; agora: number; chronos: number };
        contextualInsight?: string; // e.g., "Agora Network consulted 3 oracles: Astrophysics, Materials Science, and Bio-Engineering."
    }
}

interface FunctionCallPayload {
    name: string;
    args: Record<string, any>;
}

// --- Aethelgard Function Declarations for the Generative AI Model ---
// These declarations inform the AI about the advanced capabilities it can invoke.

const functionDeclarations: FunctionDeclaration[] = [
    {
        name: 'navigateTo',
        description: 'Navigates to a specific feature page.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                featureId: {
                    type: Type.STRING,
                    description: 'The ID of the feature to navigate to.',
                    enum: RAW_FEATURES.map(f => f.id)
                },
            },
            required: ['featureId'],
        },
    },
    {
        name: 'runFeatureWithInput',
        description: 'Navigates to a feature and passes initial data to it.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                featureId: {
                    type: Type.STRING,
                    description: 'The ID of the feature to run.',
                    enum: RAW_FEATURES.map(f => f.id)
                },
                props: {
                    type: Type.OBJECT,
                    description: 'An object containing the initial properties for the feature, based on its required inputs. This can include initialCode, initialPrompt, beforeCode, afterCode, logInput, diff, codeInput, jsonInput, or other specific feature inputs.',
                    properties: {
                        initialCode: { type: Type.STRING, description: 'Code to pre-populate in a code editor feature.' },
                        initialPrompt: { type: Type.STRING, description: 'Prompt to pre-populate in a text input feature.' },
                        beforeCode: { type: Type.STRING, description: 'Code for "before" section of a diff feature.' },
                        afterCode: { type: Type.STRING, description: 'Code for "after" section of a diff feature.' },
                        logInput: { type: Type.STRING, description: 'Input for a logging or analytics feature.' },
                        diff: { type: Type.STRING, description: 'Unified diff string for a diff viewer.' },
                        codeInput: { type: Type.STRING, description: 'Generic code input for various features.' },
                        jsonInput: { type: Type.STRING, description: 'JSON string input for data processing features.' },
                        // Aethelgard specific props for more dynamic features
                        dataContext: { type: Type.STRING, description: 'Identifier or query for data context to load into a feature.' },
                        queryDetails: { type: Type.STRING, description: 'Detailed query string for a search or analysis feature.' },
                        modelConfiguration: { type: Type.STRING, description: 'JSON string to configure an analytical model.' },
                        simulationConfig: { type: Type.OBJECT, description: 'Configuration object for a simulation feature.', additionalProperties: true },
                        designConstraints: { type: Type.OBJECT, description: 'Constraints for a generative design feature.', additionalProperties: true },
                    },
                    additionalProperties: true // Allow for arbitrary, feature-specific props
                }
            },
            required: ['featureId', 'props']
        }
    },
    {
        name: 'generateCodeSnippet',
        description: 'Generates a code snippet based on a description or requirements, leveraging Lumina Core for contextual understanding.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                prompt: { type: Type.STRING, description: 'The prompt or description for the code to generate.' },
                language: { type: Type.STRING, description: 'The programming language for the code snippet (e.g., "typescript", "python", "javascript", "rust").' },
                context: { type: Type.STRING, description: 'Additional context or existing code for better generation.' }
            },
            required: ['prompt', 'language']
        }
    },
    {
        name: 'proposeHypothesis',
        description: 'Formulates a scientific or analytical hypothesis based on available knowledge and data, utilizing Lumina Core and Chronos Engine for inference.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                topic: { type: Type.STRING, description: 'The subject area for the hypothesis.' },
                question: { type: Type.STRING, description: 'The specific question the hypothesis aims to answer.' },
                domainHints: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Hints about relevant scientific domains (e.g., "astrophysics", "biology").', enum: ['astrophysics', 'bioinformatics', 'climate_modeling', 'linguistic_analysis', 'materials_science', 'economics'] }
            },
            required: ['topic', 'question']
        }
    },
    {
        name: 'simulateScenario',
        description: 'Runs a dynamic simulation based on specified parameters, leveraging the Chronos Engine for temporal reasoning and predictive synthesis.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                scenarioName: { type: Type.STRING, description: 'A name for the simulation scenario.' },
                modelType: { type: Type.STRING, description: 'The type of model to use (e.g., "climate", "economic", "epidemiological", "ecological").' },
                initialConditions: { type: Type.OBJECT, description: 'JSON object defining the initial state of the simulation.', additionalProperties: true },
                duration: { type: Type.STRING, description: 'The duration of the simulation (e.g., "10 years", "500 steps").' },
                variablesToObserve: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of variables to track and report during the simulation.' }
            },
            required: ['scenarioName', 'modelType', 'initialConditions', 'duration']
        }
    },
    {
        name: 'designExperiment',
        description: 'Designs a detailed experiment to test a given hypothesis or explore a research question, integrating insights from relevant Agora Oracles.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                hypothesis: { type: Type.STRING, description: 'The hypothesis to be tested.' },
                researchQuestion: { type: Type.STRING, description: 'The research question to be explored (alternative to hypothesis).' },
                domain: { type: Type.STRING, description: 'The scientific domain for the experiment (e.g., "biology", "physics", "psychology").' },
                constraints: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Constraints for the experiment (e.g., "budget_limit", "time_limit", "ethical_approval_required").' }
            },
            required: ['domain']
        }
    },
    {
        name: 'performSemanticSearch',
        description: 'Executes a deep semantic search across the Lumina Core knowledge graph and federated Agora Oracles, returning highly relevant and contextualized information.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                query: { type: Type.STRING, description: 'The semantic query to perform.' },
                depth: { type: Type.NUMBER, description: 'The depth of the search in the knowledge graph (e.g., 1 for direct facts, 3 for inferred connections).', minimum: 1, maximum: 5, default: 2 },
                filterDomains: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Optional list of domains to restrict the search to.' }
            },
            required: ['query']
        }
    },
    {
        name: 'explainConcept',
        description: 'Provides a detailed, multi-faceted explanation of a concept, tailored to the user\'s assumed knowledge level, drawing from Lumina Core and its semantic depth.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                concept: { type: Type.STRING, description: 'The concept to explain.' },
                targetAudience: { type: Type.STRING, description: 'The target audience for the explanation (e.g., "beginner", "expert", "layman").', enum: ['beginner', 'intermediate', 'expert', 'layman', 'child'], default: 'intermediate' },
                analogyPreference: { type: Type.BOOLEAN, description: 'Whether to include analogies for better understanding.', default: true }
            },
            required: ['concept']
        }
    },
    {
        name: 'refineAndClarify',
        description: 'Used by the AI to ask the user for clarification or to refine a previous request when the initial prompt is ambiguous or insufficient.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                clarificationQuestion: { type: Type.STRING, description: 'The question posed to the user to gain more clarity.' },
                contextNeeded: { type: Type.STRING, description: 'What specific information or context the AI needs to proceed.' }
            },
            required: ['clarificationQuestion', 'contextNeeded']
        }
    }
];

const knowledgeBase = FEATURE_TAXONOMY.map(f => `- ${f.name} (${f.id}): ${f.description} Inputs: ${f.inputs}`).join('\n');

// --- Helper Components for Rich Aethelgard UI Responses ---
// These are defined within the file due to the 'no new imports' constraint.

const MessageBubble: React.FC<{ sender: 'user' | 'ai'; children: React.ReactNode }> = ({ sender, children }) => (
    <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-3xl p-3 rounded-lg shadow-md ${sender === 'user' ? 'bg-primary-light text-white' : 'bg-surface text-text-primary border border-border'}`}>
            {children}
        </div>
    </div>
);

const CodeBlockDisplay: React.FC<{ data: AICodeBlockData }> = ({ data }) => (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-md p-4 my-2 font-mono text-sm shadow-inner">
        {data.description && <p className="text-gray-300 mb-2 italic">{data.description}</p>}
        <div className="flex justify-between items-center mb-2 text-gray-400">
            <span>Language: {data.language}</span>
            <button className="text-sm hover:text-primary-light transition-colors" onClick={() => navigator.clipboard.writeText(data.code)}>Copy</button>
        </div>
        <pre className="whitespace-pre-wrap break-words overflow-x-auto p-2 bg-gray-700/50 rounded-sm">
            <code>{data.code}</code>
        </pre>
    </div>
);

// A very basic Chart placeholder, as we cannot import charting libraries
const BasicChartDisplay: React.FC<{ data: AIChartData }> = ({ data }) => (
    <div className="bg-surface/50 border border-border rounded-md p-4 my-2">
        {data.title && <h3 className="font-semibold text-lg mb-2">{data.title}</h3>}
        {data.description && <p className="text-text-secondary text-sm mb-2">{data.description}</p>}
        <div className="bg-gray-200 dark:bg-gray-700 h-48 flex items-center justify-center text-text-secondary rounded-sm italic">
            {`[Placeholder for a ${data.type} chart visualizing data. Unable to render without dedicated charting library.]`}
            <pre className="text-xs max-h-32 overflow-auto p-2 bg-gray-700/30 rounded-md mt-2">
                {JSON.stringify(data.data, null, 2)}
            </pre>
        </div>
        <p className="text-xs text-text-secondary mt-2">Data points: {data.data.length}</p>
    </div>
);

const SimulationOutcomeDisplay: React.FC<{ data: AISimulationOutcome }> = ({ data }) => (
    <div className="bg-surface-hover/70 border border-border rounded-md p-4 my-2">
        <h3 className="font-semibold text-lg text-primary-light">Simulation: {data.scenario}</h3>
        {data.description && <p className="text-text-secondary text-sm mb-2">{data.description}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-2">
            <div><strong>Model:</strong> <span className="text-text-primary">{data.parameters?.modelType || 'N/A'}</span></div>
            <div><strong>Confidence:</strong> <span className="text-text-primary">{Math.round(data.confidence * 100)}%</span></div>
        </div>
        <h4 className="font-medium mt-3 mb-1 text-text-primary">Key Results:</h4>
        <pre className="bg-surface-light p-2 rounded-md text-xs overflow-x-auto text-text-secondary">
            {JSON.stringify(data.results, null, 2)}
        </pre>
        {data.timeline && data.timeline.length > 0 && (
            <>
                <h4 className="font-medium mt-3 mb-1 text-text-primary">Timeline:</h4>
                <ul className="list-disc list-inside text-sm text-text-secondary max-h-40 overflow-y-auto bg-surface-light p-2 rounded-md">
                    {data.timeline.map((item, i) => (
                        <li key={i} className="mb-1">
                            <strong>{item.timestamp}:</strong> {item.event} <span className="text-xs italic">{JSON.stringify(item.details)}</span>
                        </li>
                    ))}
                </ul>
            </>
        )}
        {data.visualizations && data.visualizations.map((chart, i) => (
            <BasicChartDisplay key={`sim-chart-${i}`} data={chart} />
        ))}
    </div>
);

const HypothesisDisplay: React.FC<{ data: AIHypothesis }> = ({ data }) => (
    <div className="bg-surface-hover/70 border border-border rounded-md p-4 my-2">
        <h3 className="font-semibold text-lg text-primary-light">Proposed Hypothesis:</h3>
        <p className="mb-2 text-text-primary">{data.statement}</p>
        <p className="text-sm text-text-secondary"><strong>Justification:</strong> {data.justification}</p>
        <p className="text-sm text-text-secondary"><strong>Predicted Outcome:</strong> {data.predictedOutcome}</p>
        <p className="text-sm text-text-secondary"><strong>Confidence:</strong> {Math.round(data.confidence * 100)}%</p>
        {data.ethicalImplications && <p className="text-xs text-red-400 mt-2"><strong>Ethical Note:</strong> {data.ethicalImplications}</p>}
        {data.evidenceLinks && data.evidenceLinks.length > 0 && (
            <div className="mt-2 text-xs text-text-secondary">
                <strong>Evidence:</strong>
                <ul className="list-disc list-inside">
                    {data.evidenceLinks.map((link, i) => <li key={i}>{link}</li>)}
                </ul>
            </div>
        )}
    </div>
);

const ExperimentDesignDisplay: React.FC<{ data: AIExperimentDesign }> = ({ data }) => (
    <div className="bg-surface-hover/70 border border-border rounded-md p-4 my-2">
        <h3 className="font-semibold text-lg text-primary-light">Experiment Design: {data.name}</h3>
        <p className="mb-2 text-text-primary"><strong>Objective:</strong> {data.objective}</p>
        <p className="text-sm text-text-secondary"><strong>Methodology:</strong> {data.methodology}</p>
        <h4 className="font-medium mt-2 text-text-primary">Parameters:</h4>
        <pre className="bg-surface-light p-2 rounded-md text-xs overflow-x-auto text-text-secondary">
            {JSON.stringify(data.parameters, null, 2)}
        </pre>
        <p className="text-sm text-text-secondary mt-2"><strong>Expected Results:</strong> {data.expectedResults}</p>
        <p className="text-sm text-text-secondary"><strong>Risks:</strong> {data.risks}</p>
        <p className={`text-xs mt-2 ${data.ethicalReviewRequired ? 'text-red-400' : 'text-green-400'}`}>
            <strong>Ethical Review:</strong> {data.ethicalReviewRequired ? 'REQUIRED' : 'Not explicitly required, but always recommended.'}
        </p>
    </div>
);

const EthosReportDisplay: React.FC<{ report: AethelgardEthosReport }> = ({ report }) => (
    <div className="bg-gradient-to-r from-teal-900/30 to-blue-900/30 border border-teal-700/50 rounded-md p-3 my-2 text-xs text-teal-200">
        <strong className="text-teal-100">Aethelgard Ethos Layer Report:</strong>
        <ul className="list-disc list-inside mt-1">
            <li>Ethical Alignment: <span className="font-semibold">{report.ethicalAlignmentScore}%</span></li>
            <li>Bias Detection: <span className="font-semibold">{report.biasDetectionStatus}</span> {report.biasExplanation && `(${report.biasExplanation})`}</li>
            <li>Transparency: <span className="font-semibold">{report.transparencyScore}%</span></li>
            <li>Privacy Compliance: <span className="font-semibold">{report.privacyCompliance}</span></li>
            {report.humanOversightRecommended && <li className="text-yellow-300">Human Oversight Recommended: <span className="font-semibold">{report.recommendationReason || 'For further review.'}</span></li>}
        </ul>
    </div>
);

const AethelgardMetaDataDisplay: React.FC<{ message: ConversationMessage }> = ({ message }) => {
    if (!message.meta && !message.extendedResponse?.sources && !message.extendedResponse?.confidenceScore) return null;

    const meta = message.meta || {};
    const extended = message.extendedResponse || {};

    return (
        <div className="mt-2 text-xs text-text-secondary bg-surface-dark p-2 rounded-md border border-border">
            {extended.confidenceScore && <p>Confidence: <span className="text-primary-light font-semibold">{Math.round(extended.confidenceScore * 100)}%</span></p>}
            {extended.sources && extended.sources.length > 0 && (
                <div className="mt-1">
                    <p className="font-semibold">Sources:</p>
                    <ul className="list-disc list-inside ml-2 max-h-20 overflow-y-auto">
                        {extended.sources.map((src, i) => <li key={i}>{src}</li>)}
                    </ul>
                </div>
            )}
            {meta.contextualInsight && <p className="mt-1 italic">{meta.contextualInsight}</p>}
            {meta.processingUnits && (
                <p className="mt-1">
                    <span className="font-semibold">Processing:</span> Lumina: {meta.processingUnits.lumina}, Agora: {meta.processingUnits.agora}, Chronos: {meta.processingUnits.chronos}
                </p>
            )}
            {extended.ethosReport && <EthosReportDisplay report={extended.ethosReport} />}
        </div>
    );
};

const FeedbackControls: React.FC<{ messageId: string; currentFeedback: 'upvote' | 'downvote' | null; onFeedback: (id: string, feedback: 'upvote' | 'downvote' | null) => void }> = ({ messageId, currentFeedback, onFeedback }) => (
    <div className="flex justify-end gap-2 mt-2 text-text-secondary">
        <button
            onClick={() => onFeedback(messageId, currentFeedback === 'upvote' ? null : 'upvote')}
            className={`p-1 rounded-full ${currentFeedback === 'upvote' ? 'bg-green-600 text-white' : 'hover:bg-surface-light'}`}
            title="Upvote response"
        >
            👍
        </button>
        <button
            onClick={() => onFeedback(messageId, currentFeedback === 'downvote' ? null : 'downvote')}
            className={`p-1 rounded-full ${currentFeedback === 'downvote' ? 'bg-red-600 text-white' : 'hover:bg-surface-light'}`}
            title="Downvote response"
        >
            👎
        </button>
    </div>
);

// --- Main AiCommandCenter Component ---

const ExamplePromptButton: React.FC<{ text: string, onClick: (text: string) => void }> = ({ text, onClick }) => (
    <button
        onClick={() => onClick(text)}
        className="px-3 py-1.5 bg-surface/80 border border-border rounded-full text-xs text-text-secondary hover:bg-surface-hover transition-colors"
    >
        {text}
    </button>
)

export const AiCommandCenter: React.FC<{ voiceCommand?: string }> = ({ voiceCommand }) => {
    const { dispatch } = useAppContext();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
    const conversationEndRef = useRef<HTMLDivElement>(null);

    const addMessage = useCallback((message: ConversationMessage) => {
        setConversationHistory((prev) => [...prev, message]);
    }, []);

    const updateMessageFeedback = useCallback((id: string, feedback: 'upvote' | 'downvote' | null) => {
        setConversationHistory((prev) =>
            prev.map((msg) => (msg.id === id ? { ...msg, feedback } : msg))
        );
        // In a real system, send this feedback to a backend service for model refinement
        // console.log(`Feedback for message ${id}: ${feedback}`);
        // assume logAethelgardFeedbackService(id, feedback);
    }, []);

    const handleCommand = useCallback(async (commandToRun: string) => {
        if (!commandToRun.trim()) return;

        setIsLoading(true);
        const userMessageId = `user-${Date.now()}`;
        addMessage({
            id: userMessageId,
            sender: 'user',
            timestamp: new Date().toISOString(),
            text: commandToRun,
        });
        setPrompt(''); // Clear input immediately after sending

        try {
            // Simulate Aethelgard's enhanced getInferenceFunction
            // In a real scenario, this would involve a sophisticated backend call
            const response: AethelgardExtendedResponse = await getInferenceFunction(
                commandToRun,
                functionDeclarations,
                knowledgeBase
            ) as AethelgardExtendedResponse; // Cast to extended type

            const aiMessageId = `ai-${Date.now()}`;
            const aiResponseMessage: ConversationMessage = {
                id: aiMessageId,
                sender: 'ai',
                timestamp: new Date().toISOString(),
                extendedResponse: response,
                meta: {
                    ethosReport: response.ethosReport,
                    confidenceScore: response.confidenceScore,
                    sources: response.sources,
                    processingUnits: response.processingUnitsUsed,
                    contextualInsight: response.text?.includes("Agora") ? "Agora Network engaged for multi-domain synthesis." :
                                       response.text?.includes("Lumina") ? "Lumina Core consulted for semantic depth." :
                                       response.text?.includes("Chronos") ? "Chronos Engine initiated for temporal reasoning." : undefined,
                }
            };

            let responseText = response.text || '';
            const functionCallsHandled: FunctionCallPayload[] = [];

            if (response.functionCalls && response.functionCalls.length > 0) {
                for (const call of response.functionCalls) {
                    const { name, args } = call;
                    functionCallsHandled.push({ name, args });

                    if (name === 'navigateTo') {
                        dispatch({ type: 'LAUNCH_FEATURE', payload: { featureId: args.featureId } });
                        responseText += `\nUnderstood! Navigating to: "${args.featureId}".`;
                    } else if (name === 'runFeatureWithInput') {
                        dispatch({ type: 'LAUNCH_FEATURE', payload: { featureId: args.featureId, props: args.props } });
                        responseText += `\nUnderstood! Launching feature "${args.featureId}" with specific inputs.`;
                    } else if (name === 'generateCodeSnippet') {
                        // Assuming getInferenceFunction will also return generatedCode in the response
                        if (response.generatedCode && response.generatedCode.length > 0) {
                            aiResponseMessage.generatedCode = response.generatedCode;
                            responseText += `\nGenerated code snippet in ${args.language}.`;
                        } else {
                            responseText += `\nAttempted to generate code for ${args.language}, but no code was returned.`;
                        }
                    } else if (name === 'proposeHypothesis') {
                        if (response.proposedHypotheses && response.proposedHypotheses.length > 0) {
                            aiResponseMessage.proposedHypotheses = response.proposedHypotheses;
                            responseText += `\nProposed a hypothesis on "${args.topic}".`;
                        } else {
                             responseText += `\nAttempted to propose hypothesis on "${args.topic}", but no hypothesis was returned.`;
                        }
                    } else if (name === 'simulateScenario') {
                        if (response.simulationOutcomes && response.simulationOutcomes.length > 0) {
                            aiResponseMessage.simulationOutcomes = response.simulationOutcomes;
                            responseText += `\nInitiated simulation for scenario "${args.scenarioName}".`;
                        } else {
                            responseText += `\nAttempted to simulate scenario "${args.scenarioName}", but no simulation outcome was returned.`;
                        }
                    } else if (name === 'designExperiment') {
                        if (response.experimentDesigns && response.experimentDesigns.length > 0) {
                            aiResponseMessage.experimentDesigns = response.experimentDesigns;
                            responseText += `\nDesigned an experiment in the "${args.domain}" domain.`;
                        } else {
                            responseText += `\nAttempted to design experiment in "${args.domain}", but no design was returned.`;
                        }
                    } else if (name === 'performSemanticSearch') {
                        // The text response from AI would contain the search results summary
                        responseText += `\nPerformed a deep semantic search for "${args.query}".`;
                    } else if (name === 'explainConcept') {
                        responseText += `\nProviding explanation for "${args.concept}" for a ${args.targetAudience} audience.`;
                    } else if (name === 'refineAndClarify') {
                         responseText = `AI needs more clarity: "${args.clarificationQuestion}". Context needed: "${args.contextNeeded}". Please provide more information.`;
                    }
                    else {
                        responseText += `\nUnknown command: ${name}`;
                    }
                }
            }

            aiResponseMessage.text = responseText; // Update text for display
            aiResponseMessage.functionCalls = functionCallsHandled; // Store function calls for history

            addMessage(aiResponseMessage);

        } catch (err) {
            logError(err as Error, { prompt: commandToRun });
            const aiMessageId = `ai-${Date.now()}`;
            addMessage({
                id: aiMessageId,
                sender: 'ai',
                timestamp: new Date().toISOString(),
                text: err instanceof Error ? `Error: ${err.message}` : 'An unknown error occurred.',
            });
        } finally {
            setIsLoading(false);
        }
    }, [dispatch, addMessage]);

    useEffect(() => {
        if (voiceCommand) {
            setPrompt(voiceCommand);
            handleCommand(voiceCommand);
        }
    }, [voiceCommand, handleCommand]);

    useEffect(() => {
        // Scroll to the bottom of the conversation history
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversationHistory]);


    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleCommand(prompt);
        }
    };

    const handleExampleClick = (text: string) => {
        setPrompt(text);
        handleCommand(text);
    }

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight flex items-center justify-center">
                    <CommandLineIcon />
                    <span className="ml-3">Aethelgard AI Command Center</span>
                </h1>
                <p className="mt-2 text-lg text-text-secondary">Your collaborative intelligence partner. What vision will we sculpt today?</p>
            </header>

            <div className="flex-grow overflow-y-auto px-2 pb-4">
                <div className="max-w-3xl w-full mx-auto">
                    {conversationHistory.map((message) => (
                        <MessageBubble key={message.id} sender={message.sender}>
                            {message.sender === 'user' ? (
                                <p className="whitespace-pre-wrap">{message.text}</p>
                            ) : (
                                <>
                                    {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
                                    {message.extendedResponse?.generatedCode?.map((code, i) => (
                                        <CodeBlockDisplay key={`code-${message.id}-${i}`} data={code} />
                                    ))}
                                    {message.extendedResponse?.generatedCharts?.map((chart, i) => (
                                        <BasicChartDisplay key={`chart-${message.id}-${i}`} data={chart} />
                                    ))}
                                    {message.extendedResponse?.simulationOutcomes?.map((sim, i) => (
                                        <SimulationOutcomeDisplay key={`sim-${message.id}-${i}`} data={sim} />
                                    ))}
                                    {message.extendedResponse?.proposedHypotheses?.map((hypo, i) => (
                                        <HypothesisDisplay key={`hypo-${message.id}-${i}`} data={hypo} />
                                    ))}
                                    {message.extendedResponse?.experimentDesigns?.map((exp, i) => (
                                        <ExperimentDesignDisplay key={`exp-${message.id}-${i}`} data={exp} />
                                    ))}
                                    <AethelgardMetaDataDisplay message={message} />
                                    <FeedbackControls
                                        messageId={message.id}
                                        currentFeedback={message.feedback}
                                        onFeedback={updateMessageFeedback}
                                    />
                                </>
                            )}
                        </MessageBubble>
                    ))}
                    <div ref={conversationEndRef} />
                </div>
            </div>

            <div className="flex flex-col justify-end max-w-3xl w-full mx-auto pt-4">
                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        placeholder='Ask Aethelgard: "Generate a Rust snippet for a binary tree traversal" or "Simulate climate impact of a new renewable energy policy over 50 years"'
                        className="w-full p-4 pr-28 rounded-lg bg-surface/80 border border-border focus:ring-2 focus:ring-primary focus:outline-none resize-none shadow-sm min-h-[4rem]"
                        rows={3}
                    />
                    <button
                        onClick={() => handleCommand(prompt)}
                        disabled={isLoading || !prompt.trim()}
                        className="btn-primary absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Send'}
                    </button>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                    <ExamplePromptButton text="Open Theme Designer" onClick={handleExampleClick} />
                    <ExamplePromptButton text="Generate a commit for a bug fix" onClick={handleExampleClick} />
                    <ExamplePromptButton text="Create a regex for email validation" onClick={handleExampleClick} />
                    <ExamplePromptButton text="Hypothesize on quantum entanglement applications" onClick={handleExampleClick} />
                    <ExamplePromptButton text="Explain blockchain to a 10-year-old" onClick={handleExampleClick} />
                    <ExamplePromptButton text="Design an experiment for drug efficacy" onClick={handleExampleClick} />
                    <ExamplePromptButton text="Search for sustainable material innovations" onClick={handleExampleClick} />
                </div>
                <p className="text-xs text-text-secondary text-center mt-2">Press Enter to send, Shift+Enter for new line.</p>
            </div>
        </div>
    );
};