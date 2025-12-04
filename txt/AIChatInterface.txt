import React, { useState, useEffect, useRef, useCallback, Fragment, ChangeEvent, KeyboardEvent, useMemo } from 'react';
import { useAI, AIEvent, AIModelConfig, AIUserProfile, AIAgent, AITask } from '../../AIWrapper'; // Adjust path as needed

// --- Chat Message Interfaces ---

/**
 * Defines the various types of content a chat message can hold.
 */
export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'code' | 'system' | 'haptic' | 'bci_command' | '3d_model' | 'document' | 'simulation_log' | 'knowledge_graph_entry';

/**
 * Defines the possible senders of a chat message within the interface.
 */
export type MessageSender = 'user' | 'ai' | 'system' | 'agent' | 'debugger';

/**
 * Defines the input modalities supported by the chat interface.
 */
export type InputModality = 'text' | 'speech' | 'vision' | 'haptic' | 'bci' | 'gesture' | 'eye_gaze' | 'raw_data_stream';

/**
 * Defines the output modalities the AI can use to respond.
 */
export type OutputModality = 'text' | 'speech' | 'vision' | 'haptic' | 'bci' | 'holographic' | 'ar_overlay';

/**
 * Represents a single chat message, encompassing its content, metadata, and status.
 */
export interface ChatMessage {
    id: string;
    sender: MessageSender;
    type: MessageType;
    content: string; // For text, code, system messages, image/audio URLs, document URLs, 3D model IDs etc.
    timestamp: number;
    metadata?: Record<string, any>; // e.g., prompt for AI, vision analysis, generated_code_language, source_agent_id, ethical_check_result
    mediaBlob?: Blob; // For actual audio/image/document data direct upload/recording, kept in memory temporarily
    feedback?: 'positive' | 'negative' | 'neutral' | 'thumbs_up' | 'thumbs_down'; // User feedback on AI response
    isStreamEnd?: boolean; // Indicates if this is the final chunk of a streaming response
    originalPrompt?: string; // The user's original query that led to this AI response
    sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed'; // AI's inferred sentiment from the message
    processingLatencyMs?: number; // Time taken for AI to process this message (if AI-sent)
    relatedTasks?: string[]; // IDs of tasks created or influenced by this message, for traceability
}

/**
 * Configuration interface for a customizable advanced AI feature.
 */
interface AdvancedFeatureConfig {
    featureId: string;
    name: string;
    description: string;
    isEnabled: boolean;
    parameters: Record<string, any>;
    toggleFeature: (id: string, enabled: boolean) => void;
    updateParameter: (id: string, param: string, value: any) => void;
}

/**
 * Props for the AIChatInterface component, allowing extensive customization.
 */
export interface AIChatInterfaceProps {
    initialMessages?: ChatMessage[]; // Pre-loaded messages for chat history
    onSendMessage?: (message: ChatMessage) => void; // Callback when a user sends a message
    onReceiveMessage?: (message: ChatMessage) => void; // Callback when the AI sends a message
    enableMultiModalInput?: boolean; // Flag to enable/disable advanced input modalities
    enablePersonalization?: boolean; // Flag to enable/disable user profile-based personalization
    chatTitle?: string; // Title displayed in the chat header
    showDebugInfo?: boolean; // Shows a panel with internal AI state for debugging
    proactiveSuggestionsEnabled?: boolean; // Enables AI to offer proactive suggestions
    defaultOutputModality?: OutputModality; // Preferred modality for AI responses
    maxMessageHistory?: number; // Maximum number of messages to retain in state
    initialTheme?: 'light' | 'dark' | 'synthwave' | 'hacker_green' | 'corporate_blue'; // Initial UI theme
    enableAgentDelegation?: boolean; // Allows the AI to delegate tasks to autonomous agents
}

const AIChatInterface: React.FC<AIChatInterfaceProps> = ({
    initialMessages = [],
    onSendMessage,
    onReceiveMessage,
    enableMultiModalInput = true,
    enablePersonalization = true,
    chatTitle = "Hyper-Cognitive AI Nexus",
    showDebugInfo = false,
    proactiveSuggestionsEnabled = true,
    defaultOutputModality = 'text',
    maxMessageHistory = 500,
    initialTheme = 'dark',
    enableAgentDelegation = true,
}) => {
    // Access the core AI services and state from the global AI context
    const ai = useAI();
    const {
        modelManager,
        personalizationEngine,
        universalInterfaceCoordinator,
        generativeContentStudio,
        cognitiveArchitect,
        agentOrchestrator,
        globalKnowledgeGraph,
        simulationEngine,
        aiHealthMonitor,
        aiEventLogger,
        currentEmotionalState,
        activeModels,
        registeredAgents,
        userProfile,
        userId,
        sessionId,
    } = ai;

    // --- Component State Variables ---
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [inputMessage, setInputMessage] = useState<string>('');
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [currentInputModality, setCurrentInputModality] = useState<InputModality>('text');
    const [currentOutputModality, setCurrentOutputModality] = useState<OutputModality>(defaultOutputModality);
    const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [selectedDocumentFile, setSelectedDocumentFile] = useState<File | null>(null);
    const [aiStatusMessage, setAiStatusMessage] = useState<string>('System initialized, awaiting input.');
    const [proactiveSuggestion, setProactiveSuggestion] = useState<string | null>(null);
    const [activeAgentTasks, setActiveAgentTasks] = useState<AITask[]>([]);
    const [theme, setTheme] = useState<'light' | 'dark' | 'synthwave' | 'hacker_green' | 'corporate_blue'>(initialTheme);
    const [showOptionsPanel, setShowOptionsPanel] = useState(false);
    const [modelConfigurationPanelVisible, setModelConfigurationPanelVisible] = useState(false);
    const [agentManagementPanelVisible, setAgentManagementPanelVisible] = useState(false);
    const [systemMonitoringPanelVisible, setSystemMonitoringPanelVisible] = useState(false);
    const [userFeedbackPendingMessageId, setUserFeedbackPendingMessageId] = useState<string | null>(null);
    const [aiHealthSummary, setAiHealthSummary] = useState<string>('Monitoring AI ecosystem...');

    // --- Refs for DOM interaction and mutable values ---
    const messagesEndRef = useRef<HTMLDivElement>(null); // For auto-scrolling to the bottom of chat
    const mediaRecorderRef = useRef<MediaRecorder | null>(null); // For audio recording functionality
    const audioChunksRef = useRef<Blob[]>([]); // Stores recorded audio chunks
    const processingInputRef = useRef<boolean>(false); // Flag to prevent multiple simultaneous AI processing requests
    const chatInputRef = useRef<HTMLInputElement>(null); // For auto-focusing the text input field
    const audioPlayerRef = useRef<HTMLAudioElement>(null); // For playing generated AI speech

    // --- Utility Callbacks ---

    /**
     * Scrolls the chat messages area to the bottom.
     */
    const scrollMessagesToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, []);

    /**
     * Generates a UUID for unique message IDs and other entities.
     */
    const generateUUID = useCallback(() => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }), []);

    /**
     * Adds a new message to the chat state and logs it to AI systems.
     * Includes sentiment inference for user messages.
     */
    const addMessage = useCallback(async (message: ChatMessage) => {
        // Infer sentiment for user text messages before adding them to state
        if (message.sender === 'user' && message.type === 'text' && message.content) {
            try {
                const sentimentResult = await modelManager.infer(
                    modelManager.selectBestModel(['sentiment_analysis']),
                    { prompt: message.content }, 'text', { userId, sessionId }
                );
                // Extract sentiment from a potentially complex AI output
                message.sentiment = sentimentResult.output.includes('positive') ? 'positive' : sentimentResult.output.includes('negative') ? 'negative' : 'neutral';
            } catch (error) {
                aiEventLogger.logEvent({ type: 'system_alert', source: 'AIChatInterface.Sentiment', payload: { message: 'Failed to infer sentiment for user message.', error: (error as Error).message }, severity: 'warning', traceId: sessionId });
            }
        }

        setMessages((prevMessages) => [...prevMessages, message]);

        // Log interactions and update cognitive architect for personalization and context management
        if (message.sender === 'user') {
            personalizationEngine.logInteraction(userId, 'chat_message_sent', {
                messageId: message.id, type: message.type, contentPreview: message.content.substring(0, 100), modality: currentInputModality, sentiment: message.sentiment,
            });
            cognitiveArchitect.addContext(sessionId, { userMessage: message.content, messageType: message.type, sentiment: message.sentiment });
        } else if (message.sender === 'ai' || message.sender === 'agent') {
            personalizationEngine.logInteraction(userId, 'chat_message_received', {
                messageId: message.id, type: message.type, contentPreview: message.content.substring(0, 100), modality: currentOutputModality, processingLatencyMs: message.processingLatencyMs,
            });
            cognitiveArchitect.addContext(sessionId, { aiResponse: message.content, messageType: message.type });
        }
        aiEventLogger.logEvent({
            type: 'user_interaction', source: 'AIChatInterface', payload: { action: 'chat_message', sender: message.sender, type: message.type, messageId: message.id, sentiment: message.sentiment, traceId: sessionId }, severity: 'info',
        });

        if (onReceiveMessage && message.sender !== 'user') {
            onReceiveMessage(message);
        }
    }, [userId, sessionId, personalizationEngine, cognitiveArchitect, aiEventLogger, currentInputModality, currentOutputModality, onReceiveMessage, modelManager]);

    /**
     * Handles user feedback for AI responses, updating messages and logging the interaction.
     */
    const handleMessageFeedback = useCallback(async (messageId: string, feedback: ChatMessage['feedback']) => {
        setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, feedback } : msg));
        const message = messages.find(msg => msg.id === messageId);
        if (message) {
            await personalizationEngine.logInteraction(userId, 'ai_response_feedback', {
                messageId, feedback, aiContentPreview: message.content.substring(0, 100), originalPrompt: message.originalPrompt,
            });
            aiEventLogger.logEvent({ type: 'user_interaction', source: 'AIChatInterface', payload: { action: 'ai_feedback_recorded', messageId, feedback, traceId: sessionId }, severity: 'info' });
            setAiStatusMessage(`Feedback '${feedback}' recorded for message ${messageId}. Thank you!`);
            setUserFeedbackPendingMessageId(null); // Clear pending feedback
        }
    }, [messages, personalizationEngine, userId, aiEventLogger, sessionId]);

    /**
     * Toggles the UI theme and updates user preferences.
     */
    const toggleTheme = useCallback((newTheme?: 'light' | 'dark' | 'synthwave' | 'hacker_green' | 'corporate_blue') => {
        setTheme(prev => {
            const themes: Array<'light' | 'dark' | 'synthwave' | 'hacker_green' | 'corporate_blue'> = ['dark', 'light', 'synthwave', 'hacker_green', 'corporate_blue'];
            const chosenTheme = newTheme || themes[(themes.indexOf(prev) + 1) % themes.length];
            personalizationEngine.updateUserProfile(userId, { preferences: { theme: chosenTheme } });
            aiEventLogger.logEvent({ type: 'user_interaction', source: 'AIChatInterface.Theme', payload: { action: 'theme_change', newTheme: chosenTheme, traceId: sessionId }, severity: 'info' });
            return chosenTheme;
        });
    }, [personalizationEngine, userId, aiEventLogger, sessionId]);

    /**
     * Handles triggering agent actions from the UI, such as creating tasks or rebooting agents.
     */
    const handleAgentAction = useCallback(async (actionType: string, agentId?: string, taskDescription?: string) => {
        setAiStatusMessage(`Triggering agent action: ${actionType}...`);
        aiEventLogger.logEvent({ type: 'agent_action', source: 'AIChatInterface.AgentControl', payload: { actionType, agentId, taskDescription, traceId: sessionId }, severity: 'info' });

        try {
            if (actionType === 'create_task' && taskDescription) {
                const newTask = await agentOrchestrator.createTask(taskDescription.substring(0, 50), taskDescription, userProfile?.expertiseLevels.coding && userProfile.expertiseLevels.coding > 7 ? 'critical' : 'high');
                setActiveAgentTasks(prev => [...prev.filter(t => t.id !== newTask.id), newTask]);
                addMessage({
                    id: `msg_agent_task_${Date.now()}`, sender: 'system', type: 'text',
                    content: `Created task "${newTask.name}" (ID: ${newTask.id}) for agent ${newTask.assignedAgentId || 'auto-selected'}. Monitoring progress...`,
                    timestamp: Date.now(), metadata: { taskId: newTask.id, agentId: newTask.assignedAgentId }
                });
            } else if (actionType === 'reboot_agent' && agentId) {
                const agent = agentOrchestrator.getAgent(agentId);
                if (agent) {
                    agent.status = 'offline'; await new Promise(r => setTimeout(r, 1000)); agent.status = 'idle'; agent.lastOnline = Date.now();
                    agentOrchestrator.registerAgent(agent); // Update agent state
                    addMessage({
                        id: `msg_agent_reboot_${Date.now()}`, sender: 'system', type: 'text',
                        content: `Agent ${agent.name} (${agent.id}) rebooted and is now idle.`,
                        timestamp: Date.now(), metadata: { agentId: agent.id }
                    });
                } else {
                    addMessage({
                        id: `msg_agent_reboot_fail_${Date.now()}`, sender: 'system', type: 'text',
                        content: `Failed to reboot agent ${agentId}: Not found.`, timestamp: Date.now(), metadata: { agentId }
                    });
                }
            } else if (actionType === 'run_simulation') {
                const simId = `sim_quick_${Date.now()}`;
                const scenario = simulationEngine.createScenario(
                    `Chat Sim: ${taskDescription ? taskDescription.substring(0, 50) : 'Default'}`,
                    taskDescription || 'A simple simulation scenario triggered from chat.',
                    { userRequest: taskDescription || 'generic', emotionalState: currentEmotionalState }, 10
                );
                addMessage({
                    id: `msg_sim_start_${Date.now()}`, sender: 'system', type: 'text',
                    content: `Simulation "${scenario.name}" started. Running with available agents...`, timestamp: Date.now(), metadata: { scenarioId: scenario.id }
                });
                const agentsForSim = registeredAgents.filter(a => a.status === 'idle').slice(0, 2);
                const simResults = await simulationEngine.runScenario(scenario.id, agentsForSim);
                addMessage({
                    id: `msg_sim_end_${Date.now()}`, sender: 'system', type: 'simulation_log',
                    content: `Simulation "${scenario.name}" completed. Key outcomes: ${JSON.stringify(simResults.objectivesAchieved ? 'Objectives met' : 'Objectives partially met')}, Safety Violations: ${simResults.safetyViolationsDetected ? 'Detected' : 'None'}.`,
                    timestamp: Date.now(), metadata: { scenarioId: scenario.id, results: simResults }
                });
            } else if (actionType === 'spawn_new_agent') {
                const newAgentId = `agent_${Date.now()}`;
                const newAgent: AIAgent = {
                    id: newAgentId, name: `NewAgent-${Math.random().toString(36).substring(2, 7)}`, persona: 'General Helper', role: 'executor',
                    status: 'idle', capabilities: ['basic_query', 'task_execution'], assignedTasks: [], currentGoal: 'None',
                    memoryCapacity: 'short_term', learningRate: 'medium', ethicalGuidelines: 'flexible', securityClearance: 'level_1',
                    resourceAllocation: { computeUnits: 2, memoryGB: 4, networkBandwidthMbps: 50 }, version: '0.1', lastOnline: Date.now(), isAutonomous: false, trustScore: 50
                };
                agentOrchestrator.registerAgent(newAgent);
                addMessage({
                    id: `msg_agent_spawn_${Date.now()}`, sender: 'system', type: 'text',
                    content: `New agent '${newAgent.name}' (ID: ${newAgent.id}) spawned and is now idle.`, timestamp: Date.now(), metadata: { agentId: newAgent.id }
                });
            }
        } catch (error) {
            addMessage({
                id: `msg_agent_action_error_${Date.now()}`, sender: 'system', type: 'text',
                content: `Error during agent action ${actionType}: ${(error as Error).message}`, timestamp: Date.now(), metadata: { actionType, error: (error as Error).message }
            });
        } finally {
            setAiStatusMessage('Ready.');
        }
    }, [addMessage, aiEventLogger, agentOrchestrator, userProfile, currentEmotionalState, registeredAgents, simulationEngine, sessionId]);

    /**
     * Handles changes to model configuration options.
     */
    const handleModelOptionChange = useCallback(async (modelId: string, optionKey: string, value: any) => {
        const model = modelManager.getModel(modelId);
        if (model) {
            const updatedModel: AIModelConfig = {
                ...model,
                metadata: { ...model.metadata, [optionKey]: value },
                performanceMetrics: optionKey === 'latency' || optionKey === 'throughput' ? { ...model.performanceMetrics, [optionKey]: value } : model.performanceMetrics,
                apiKey: optionKey === 'apiKey' ? value : model.apiKey,
                status: optionKey === 'status' ? value : model.status,
            };
            modelManager.registerModel(updatedModel); // Re-register to update the internal map
            aiEventLogger.logEvent({ type: 'data_update', source: 'AIChatInterface.ModelConfig', payload: { action: 'model_option_updated', modelId, optionKey, value, traceId: sessionId }, severity: 'info' });
            setAiStatusMessage(`Model '${model.name}' updated: ${optionKey} to ${value}.`);
        }
    }, [modelManager, aiEventLogger, sessionId]);


    // --- Core Logic & Effects ---

    // Effect for auto-scrolling chat and trimming message history
    useEffect(() => {
        scrollMessagesToBottom();
        if (messages.length > maxMessageHistory) {
            setMessages(prev => prev.slice(messages.length - maxMessageHistory));
        }
    }, [messages, scrollMessagesToBottom, maxMessageHistory]);

    // Effect for initial load, user profile welcome, and input focus
    useEffect(() => {
        if (userProfile && messages.length === initialMessages.length) {
            const welcomeMessageContent = `Welcome, ${userProfile.userId}! Your preferences are set to ${userProfile.preferences.language}, verbosity: ${userProfile.preferences.verbosity}, and learning style: ${userProfile.learningStyles}. I'm here to assist you.`;
            const systemMessage: ChatMessage = {
                id: `msg_system_welcome_${Date.now()}`, sender: 'system', type: 'text', content: welcomeMessageContent, timestamp: Date.now(), metadata: { userId: userProfile.userId, preferences: userProfile.preferences }
            };
            setMessages(prev => [...prev, systemMessage]);
            aiEventLogger.logEvent({ type: 'system_alert', source: 'AIChatInterface.Welcome', payload: { message: `User profile loaded for ${userId}.`, welcomeMessageContent, traceId: sessionId }, severity: 'info' });
        }
        if (chatInputRef.current) {
            chatInputRef.current.focus();
        }
    }, [userProfile, userId, aiEventLogger, sessionId, initialMessages.length, messages.length]);

    // Effect for generating proactive suggestions
    useEffect(() => {
        if (!proactiveSuggestionsEnabled || !userProfile) {
            setProactiveSuggestion(null);
            return;
        }

        const generateProactiveSuggestion = async () => {
            setAiStatusMessage('Analyzing context for proactive suggestions...');
            const lastMessages = messages.slice(-5).map(m => `${m.sender}: ${m.content}`).join('\n');
            const prompt = `Based on the user's profile, recent chat history:\n${lastMessages}\nand current emotional state (${currentEmotionalState}), what proactive assistance or information might they need? Focus on genuinely helpful and concise suggestions.`;
            try {
                const suggestionResult = await modelManager.infer(
                    modelManager.selectBestModel(['generation', 'recommendation', 'text']),
                    { prompt, userProfile, currentChatContext: lastMessages, emotionalState: currentEmotionalState, currentView: ai.currentView },
                    'text', { userId, sessionId }
                );
                const adaptedSuggestion = enablePersonalization
                    ? await personalizationEngine.adaptOutput(userId, suggestionResult, 'text')
                    : suggestionResult;
                const suggestionText = String(adaptedSuggestion.output || adaptedSuggestion).trim();
                if (suggestionText.length > 30) {
                    setProactiveSuggestion(suggestionText);
                } else {
                    setProactiveSuggestion(null);
                }
            } catch (error) {
                aiEventLogger.logEvent({ type: 'system_alert', source: 'AIChatInterface.Proactive', payload: { message: 'Failed to get proactive suggestion.', error: (error as Error).message, traceId: sessionId }, severity: 'warning' });
                setProactiveSuggestion(null);
            } finally {
                if (!isTyping) {
                    setAiStatusMessage('Ready.');
                }
            }
        };

        const debouncedSuggest = setTimeout(generateProactiveSuggestion, 8000);
        return () => clearTimeout(debouncedSuggest);
    }, [messages, userProfile, currentEmotionalState, proactiveSuggestionsEnabled, modelManager, personalizationEngine, userId, aiEventLogger, sessionId, enablePersonalization, ai.currentView, isTyping]);


    // Effect for listening to AI system alerts and agent actions
    useEffect(() => {
        const unsubscribe = aiEventLogger.subscribeToEvents((event: AIEvent) => {
            if (event.type === 'system_alert' && event.source !== 'AIChatInterface') {
                const severityPrefix = event.severity ? `[${event.severity.toUpperCase()}] ` : '';
                setAiStatusMessage(`${severityPrefix}System Alert from ${event.source}: ${event.payload.message || event.type}`);
                if (event.severity === 'error' || event.severity === 'critical' || event.severity === 'warning') {
                    addMessage({
                        id: `msg_system_alert_${event.id}`, sender: 'system', type: 'text',
                        content: `${severityPrefix}AI System Alert from ${event.source}: ${event.payload.message}. (Trace: ${event.traceId || 'N/A'})`,
                        timestamp: event.timestamp || Date.now(), metadata: event.payload,
                    });
                }
            } else if (event.type === 'ethical_violation_flag') {
                 addMessage({
                    id: `msg_ethical_alert_${event.id}`, sender: 'system', type: 'text',
                    content: `[ETHICAL VIOLATION] Detected: ${event.payload.reason}. Task ID: ${event.payload.taskId || 'N/A'}. Details: ${JSON.stringify(event.payload.details || '').substring(0, 100)}`,
                    timestamp: event.timestamp || Date.now(), metadata: event.payload,
                });
            } else if (event.type === 'agent_action' && event.payload.action === 'task_assigned' && event.traceId === sessionId) {
                 agentOrchestrator.getTask(event.payload.taskId)?.then(task => {
                    if (task) setActiveAgentTasks(prev => [...prev.filter(t => t.id !== task.id), task]);
                 });
            } else if (event.type === 'agent_action' && (event.payload.action === 'execute_task_completed' || event.payload.action === 'execute_task_failed')) {
                agentOrchestrator.getTask(event.payload.taskId)?.then(task => {
                    if (task) {
                        setActiveAgentTasks(prev => prev.filter(t => t.id !== task.id));
                        addMessage({
                            id: `msg_agent_update_${Date.now()}`, sender: 'system', type: 'text',
                            content: `Agent task "${task.name}" (${task.id}) ${task.status === 'completed' ? 'completed successfully.' : `failed with status ${task.status}.`} Output: ${JSON.stringify(task.output || '').substring(0, 100)}...`,
                            timestamp: Date.now(), metadata: { taskId: task.id, status: task.status, output: task.output },
                        });
                    }
                });
            }
        });
        return () => unsubscribe();
    }, [aiEventLogger, addMessage, sessionId, agentOrchestrator]);

    // Effect for monitoring AI system health and providing a summary
    useEffect(() => {
        const fetchHealthSummary = async () => {
            try {
                const alerts = await aiHealthMonitor.performHealthCheck(); // This method doesn't return string in AIWrapper.tsx, need to mock or change
                const predictedFailures = await aiHealthMonitor.predictFailures();
                let summary = `Health: All systems nominal.`;
                if (predictedFailures.length > 0) {
                    summary = `Health: Predicted issues: ${predictedFailures.join(', ')}.`;
                }
                setAiHealthSummary(summary);
            } catch (error) {
                setAiHealthSummary(`Health check error: ${(error as Error).message}`);
                aiEventLogger.logEvent({ type: 'system_alert', source: 'AIChatInterface.HealthMonitor', payload: { message: `Failed to fetch AI health summary.`, error: (error as Error).message, traceId: sessionId }, severity: 'error' });
            }
        };
        const intervalId = setInterval(fetchHealthSummary, 30000); // Update every 30 seconds
        fetchHealthSummary(); // Initial fetch
        return () => clearInterval(intervalId);
    }, [aiHealthMonitor, aiEventLogger, sessionId]);


    // --- Input Handling Callbacks ---

    /**
     * Main handler for processing any user message (text, image, audio, etc.) through the AI pipeline.
     */
    const handleUserMessage = useCallback(async (content: string, type: MessageType = 'text', mediaData?: Blob | File, originalPrompt?: string) => {
        if (processingInputRef.current) {
            aiEventLogger.logEvent({ type: 'user_interaction', source: 'AIChatInterface.Input', payload: { message: 'Input processing already in progress, ignoring new input.', contentPreview: content.substring(0, 50), traceId: sessionId }, severity: 'info' });
            return;
        }
        processingInputRef.current = true;
        const startTime = Date.now();

        const userMessage: ChatMessage = {
            id: generateUUID(), sender: 'user', type, content: type === 'image' || type === 'audio' || type === 'document' ? URL.createObjectURL(mediaData as Blob) : content,
            timestamp: startTime, mediaBlob: mediaData instanceof Blob ? mediaData : undefined, originalPrompt,
        };
        addMessage(userMessage);
        onSendMessage?.(userMessage);
        setInputMessage('');
        setSelectedImageFile(null);
        setSelectedDocumentFile(null);
        setAiStatusMessage('AI is thinking...');
        setIsTyping(true);
        setProactiveSuggestion(null);

        try {
            // Step 1: Process user input based on modality via UniversalInterfaceCoordinator
            let processedInput: any;
            const inputPayload: Record<string, any> = { userId, sessionId, context: cognitiveArchitect.getContext(sessionId, 5) };

            switch (type) {
                case 'text': inputPayload.text = content; processedInput = await universalInterfaceCoordinator.processInput(userId, inputPayload, 'text'); break;
                case 'image': inputPayload.imageBlob = mediaData; processedInput = await universalInterfaceCoordinator.processInput(userId, inputPayload, 'vision'); break;
                case 'audio': inputPayload.audioBlob = mediaData; processedInput = await universalInterfaceCoordinator.processInput(userId, inputPayload, 'speech'); break;
                case 'document':
                    inputPayload.documentData = mediaData;
                    processedInput = await universalInterfaceCoordinator.processInput(userId, inputPayload, 'raw_data_stream'); // Or a new 'document' modality
                    processedInput.text = `Document analysis for "${(mediaData as File).name}": ${content.substring(0, 200)}...`; // Summarize document for reasoning
                    break;
                case 'bci_command': inputPayload.signal = content; processedInput = await universalInterfaceCoordinator.processInput(userId, inputPayload, 'bci'); processedInput.text = `BCI command: ${processedInput.neuralIntent || content}`; break;
                case 'haptic': inputPayload.sensorData = content; processedInput = await universalInterfaceCoordinator.processInput(userId, inputPayload, 'haptic'); processedInput.text = `Haptic gesture: ${processedInput.hapticGesture || content}`; break;
                default: inputPayload.text = content; processedInput = await universalInterfaceCoordinator.processInput(userId, inputPayload, 'text'); break;
            }

            // Step 2: Use Cognitive Architect for reasoning and context integration
            const contextForReasoning = cognitiveArchitect.getContext(sessionId, 10);
            const reasoningPrompt = `Given recent context: ${JSON.stringify(contextForReasoning)}, and user's input/intent: "${processedInput.text || 'non-textual input'}", please reason and formulate a response strategy. Prioritize helpfulness, ethics, and user preferences.`;
            const reasoningResult = await cognitiveArchitect.reason(reasoningPrompt, contextForReasoning);
            aiEventLogger.logEvent({
                type: 'agent_action', source: 'AIChatInterface.Cognitive', payload: { action: 'cognitive_reasoning_complete', input: processedInput, reasoning: reasoningResult.substring(0, 200), traceId: sessionId }, severity: 'info'
            });

            // Step 3: Advanced Command and Agent Triggering Logic
            let aiResponseContent = ''; let aiMessageType: MessageType = 'text'; let triggeredTaskId: string | undefined;
            const lowerCaseContent = content.toLowerCase();

            // Check for explicit commands or agent triggers
            if (lowerCaseContent.startsWith('/generate image ')) {
                const imagePrompt = lowerCaseContent.substring('/generate image '.length).trim();
                setAiStatusMessage('Generating image...'); aiResponseContent = await generativeContentStudio.generateImage(imagePrompt, 'hyper-realistic', '1536x1536', { userId, sessionId }); aiMessageType = 'image';
            } else if (lowerCaseContent.startsWith('/generate code ')) {
                const codePrompt = lowerCaseContent.substring('/generate code '.length).trim();
                setAiStatusMessage('Generating code...'); aiResponseContent = await generativeContentStudio.generateCode(codePrompt, 'typescript', undefined, { userId, sessionId }); aiMessageType = 'code';
            } else if (lowerCaseContent.startsWith('/design ui ')) {
                const designPrompt = lowerCaseContent.substring('/design ui '.length).trim();
                setAiStatusMessage('Designing UI component...'); const designResult = await generativeContentStudio.designUIComponent(designPrompt, userProfile?.preferences.theme || 'dark', 'react', { userId, sessionId }); aiResponseContent = `Generated UI Component:\n\`\`\`jsx\n${designResult.code}\n\`\`\`\nPreview: ${designResult.previewUrl}`; aiMessageType = 'code';
            } else if (lowerCaseContent.startsWith('/simulate ')) {
                const simPrompt = lowerCaseContent.substring('/simulate '.length).trim();
                setAiStatusMessage('Initiating simulation scenario...'); const scenario = simulationEngine.createScenario(`Chat Sim: ${simPrompt.substring(0, 50)}`, simPrompt, { userRequest: content, emotionalState: currentEmotionalState }, 15);
                addMessage({ id: generateUUID(), sender: 'system', type: 'text', content: `Simulation "${scenario.name}" initialized. Running with available agents...`, timestamp: Date.now() });
                const agentsForSim = registeredAgents.filter(a => a.status === 'idle').slice(0, 2);
                const simResults = await simulationEngine.runScenario(scenario.id, agentsForSim);
                aiResponseContent = `Simulation "${scenario.name}" completed. Key outcomes: ${JSON.stringify(simResults.objectivesAchieved ? 'Objectives met' : 'Objectives partially met')}, Safety Violations: ${simResults.safetyViolationsDetected ? 'Detected' : 'None'}. Full results available in logs.`; aiMessageType = 'simulation_log';
            } else if (lowerCaseContent.startsWith('/query knowledge ')) {
                const query = lowerCaseContent.substring('/query knowledge '.length).trim();
                setAiStatusMessage('Querying global knowledge graph...'); const kgResults = await globalKnowledgeGraph.semanticSearch(query, 5, { securityLevel: userProfile?.securityCredentials?.tokenLifetime ? 'internal' : 'public' });
                if (kgResults.length > 0) aiResponseContent = `Knowledge found for "${query}":\n${kgResults.map(n => `- ${n.label}: ${n.description.substring(0, 100)}... (Confidence: ${(n.confidenceScore * 100).toFixed(0)}%)`).join('\n')}`; else aiResponseContent = `My knowledge graph does not have specific information about "${query}".`; aiMessageType = 'knowledge_graph_entry';
            } else if (lowerCaseContent.startsWith('/create task ') && enableAgentDelegation) {
                const taskDesc = lowerCaseContent.substring('/create task '.length).trim();
                setAiStatusMessage('Delegating to agent orchestrator...'); const newTask = await agentOrchestrator.createTask(taskDesc.substring(0, 50), taskDesc, userProfile?.expertiseLevels.coding && userProfile.expertiseLevels.coding > 7 ? 'critical' : 'high');
                setActiveAgentTasks(prev => [...prev.filter(t => t.id !== newTask.id), newTask]); triggeredTaskId = newTask.id; aiResponseContent = `Task "${newTask.name}" (ID: ${newTask.id}) has been assigned to an agent (${newTask.assignedAgentId || 'auto-selected'}). I will inform you upon completion.`; aiMessageType = 'system';
            } else {
                const generativePrompt = `Given the user's input/intent: "${processedInput.text || content}", and the following reasoning: "${reasoningResult}", generate a helpful, personalized, and context-aware response in ${userProfile?.preferences.language || 'English'}. Adapt to user's verbosity (${userProfile?.preferences.verbosity || 'medium'}) and emotional state (${currentEmotionalState}).`;
                setAiStatusMessage('Generating comprehensive response...');

                if (modelManager.getActiveModel()?.capabilities.includes('stream_generation') && currentOutputModality === 'text') {
                    const stream = modelManager.streamInfer(
                        modelManager.selectBestModel(['generation', 'text_generation', 'stream_generation']),
                        { prompt: generativePrompt, userProfile, currentChatContext: contextForReasoning }, 'text', { max_tokens: 300, temperature: 0.7, userId, sessionId }
                    );
                    let fullStreamContent = ''; let streamedMessageId = generateUUID(); const streamStart = Date.now();
                    for await (const chunk of stream) {
                        fullStreamContent += chunk.token;
                        setMessages((prev) => {
                            const existingMsgIndex = prev.findIndex(m => m.id === streamedMessageId);
                            if (existingMsgIndex !== -1) { const updatedPrev = [...prev]; updatedPrev[existingMsgIndex] = { ...updatedPrev[existingMsgIndex], content: fullStreamContent, processingLatencyMs: Date.now() - streamStart }; return updatedPrev; }
                            else { return [...prev, { id: streamedMessageId, sender: 'ai', type: 'text', content: fullStreamContent, timestamp: Date.now(), isStreamEnd: false, originalPrompt: content, processingLatencyMs: Date.now() - streamStart }]; }
                        }); scrollMessagesToBottom();
                    }
                    setMessages((prev) => prev.map(m => m.id === streamedMessageId ? { ...m, isStreamEnd: true, processingLatencyMs: Date.now() - streamStart } : m));
                    aiResponseContent = fullStreamContent; aiMessageType = 'text';
                } else {
                    const generativeResult = await generativeContentStudio.generateText(generativePrompt, { max_tokens: 300, temperature: 0.7, userId, sessionId });
                    const adaptedGenerativeResult = enablePersonalization ? await personalizationEngine.adaptOutput(userId, generativeResult, 'text') : generativeResult;
                    aiResponseContent = String(adaptedGenerativeResult.output || adaptedGenerativeResult);
                    const finalOutput = await universalInterfaceCoordinator.generateOutput(userId, { text: aiResponseContent, sourcePrompt: content }, currentOutputModality, { emotionalState: currentEmotionalState, userPreferences: userProfile?.preferences });
                    const processingLatencyMs = Date.now() - startTime;
                    let finalAiMessage: ChatMessage;
                    switch (currentOutputModality) {
                        case 'speech':
                            finalAiMessage = { id: generateUUID(), sender: 'ai', type: 'audio', content: 'AI speech response', timestamp: Date.now(), mediaBlob: finalOutput.audioBlob, originalPrompt: content, processingLatencyMs, };
                            if (audioPlayerRef.current && finalOutput.audioBlob) { audioPlayerRef.current.src = URL.createObjectURL(finalOutput.audioBlob); audioPlayerRef.current.play(); } break;
                        case 'vision': finalAiMessage = { id: generateUUID(), sender: 'ai', type: 'image', content: finalOutput.imageUrl || 'No image generated', timestamp: Date.now(), originalPrompt: content, processingLatencyMs, }; break;
                        case 'haptic': finalAiMessage = { id: generateUUID(), sender: 'ai', type: 'haptic', content: `Haptic feedback: ${finalOutput.hapticPattern || 'none'}`, timestamp: Date.now(), originalPrompt: content, processingLatencyMs, metadata: { feedbackIntensity: finalOutput.feedbackIntensity } }; break;
                        case 'bci': finalAiMessage = { id: generateUUID(), sender: 'ai', type: 'bci_command', content: `BCI stimulus: ${finalOutput.neuralStimulusPattern || 'none'}`, timestamp: Date.now(), originalPrompt: content, processingLatencyMs, metadata: { targetBrainRegion: finalOutput.targetBrainRegion } }; break;
                        case 'holographic': finalAiMessage = { id: generateUUID(), sender: 'ai', type: 'video', content: `Holographic display update: ${finalOutput.contentUrl || 'no content'}`, timestamp: Date.now(), originalPrompt: content, processingLatencyMs, metadata: { type: 'holographic_projection' } }; break;
                        case 'ar_overlay': finalAiMessage = { id: generateUUID(), sender: 'ai', type: 'image', content: `AR overlay rendered: ${finalOutput.overlayUrl || 'no overlay'}`, timestamp: Date.now(), originalPrompt: content, processingLatencyMs, metadata: { type: 'ar_overlay' } }; break;
                        case 'text': default: finalAiMessage = { id: generateUUID(), sender: 'ai', type: 'text', content: String(finalOutput.text || finalOutput), timestamp: Date.now(), originalPrompt: content, processingLatencyMs, }; break;
                    }
                    addMessage(finalAiMessage);
                }
            }

        } catch (error) {
            const errorMessage = (error as Error).message;
            aiEventLogger.logEvent({ type: 'system_alert', source: 'AIChatInterface.AIResponse', payload: { message: `AI response failed.`, error: errorMessage, stack: (error as Error).stack, traceId: sessionId }, severity: 'error' });
            addMessage({ id: generateUUID(), sender: 'system', type: 'text', content: `Error: My apologies, I encountered an issue: "${errorMessage}". Please try again.`, timestamp: Date.now(), metadata: { error: errorMessage } });
        } finally {
            setIsTyping(false); setAiStatusMessage('Ready.'); processingInputRef.current = false;
        }
    }, [addMessage, onSendMessage, userId, sessionId, modelManager, personalizationEngine, universalInterfaceCoordinator, generativeContentStudio, cognitiveArchitect, agentOrchestrator, globalKnowledgeGraph, simulationEngine, aiEventLogger, enablePersonalization, currentOutputModality, currentEmotionalState, registeredAgents, userProfile, generateUUID, enableAgentDelegation]);

    /**
     * Handles text input submission, clearing the input field and triggering AI response.
     */
    const handleTextSubmit = useCallback((e: React.FormEvent | KeyboardEvent) => {
        e.preventDefault();
        if (inputMessage.trim() && !isTyping) {
            handleUserMessage(inputMessage.trim(), 'text');
            setInputMessage('');
        }
    }, [inputMessage, isTyping, handleUserMessage]);

    /**
     * Initiates audio recording for speech input.
     */
    const handleSpeechStart = useCallback(async () => {
        if (!enableMultiModalInput || isRecordingAudio) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream); audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (event) => { audioChunksRef.current.push(event.data); };
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                addMessage({ id: generateUUID(), sender: 'user', type: 'audio', content: 'User audio input (processing...)', timestamp: Date.now(), mediaBlob: audioBlob, metadata: { inputMessageContext: inputMessage } });
                handleUserMessage('Audio input received', 'audio', audioBlob, inputMessage.trim() || 'Spoken input');
                setIsRecordingAudio(false); setInputMessage('');
            };
            mediaRecorderRef.current.start(); setIsRecordingAudio(true); setAiStatusMessage('Recording audio...');
            aiEventLogger.logEvent({ type: 'user_interaction', source: 'AIChatInterface.Speech', payload: { action: 'start_audio_recording', traceId: sessionId }, severity: 'info' });
        } catch (error) {
            setAiStatusMessage('Error starting audio recording.');
            aiEventLogger.logEvent({ type: 'system_alert', source: 'AIChatInterface.Speech', payload: { message: 'Failed to start audio recording.', error: (error as Error).message, traceId: sessionId }, severity: 'error' });
        }
    }, [enableMultiModalInput, isRecordingAudio, addMessage, handleUserMessage, aiEventLogger, sessionId, inputMessage, generateUUID]);

    /**
     * Stops audio recording and triggers processing of the recorded audio.
     */
    const handleSpeechStop = useCallback(() => {
        if (mediaRecorderRef.current && isRecordingAudio) {
            mediaRecorderRef.current.stop(); mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setAiStatusMessage('Processing audio...');
            aiEventLogger.logEvent({ type: 'user_interaction', source: 'AIChatInterface.Speech', payload: { action: 'stop_audio_recording', traceId: sessionId }, severity: 'info' });
        }
    }, [isRecordingAudio, aiEventLogger, sessionId]);

    /**
     * Handles selection of an image file for upload.
     */
    const handleImageUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        if (!enableMultiModalInput || !event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];
        if (file.size > 5 * 1024 * 1024) { setAiStatusMessage('Image file too large (max 5MB).'); return; }
        setSelectedImageFile(file); setAiStatusMessage(`Image selected: ${file.name}`);
        aiEventLogger.logEvent({ type: 'user_interaction', source: 'AIChatInterface.Image', payload: { action: 'image_selected', fileName: file.name, traceId: sessionId }, severity: 'info' });
    }, [enableMultiModalInput, aiEventLogger, sessionId]);

    /**
     * Sends the selected image file to the AI for analysis.
     */
    const handleSendImage = useCallback(async () => {
        if (selectedImageFile && !isTyping) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Image = reader.result as string;
                handleUserMessage(inputMessage.trim() || 'Image sent for analysis.', 'image', selectedImageFile, base64Image);
            };
            reader.readAsDataURL(selectedImageFile);
            setSelectedImageFile(null);
        }
    }, [selectedImageFile, isTyping, handleUserMessage, inputMessage]);

    /**
     * Handles selection of a document file for upload.
     */
    const handleDocumentUpload = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        if (!enableMultiModalInput || !event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];
        if (file.size > 10 * 1024 * 1024) { setAiStatusMessage('Document file too large (max 10MB).'); return; }
        setSelectedDocumentFile(file); setAiStatusMessage(`Document selected: ${file.name}`);
        aiEventLogger.logEvent({ type: 'user_interaction', source: 'AIChatInterface.Document', payload: { action: 'document_selected', fileName: file.name, traceId: sessionId }, severity: 'info' });
    }, [enableMultiModalInput, aiEventLogger, sessionId]);

    /**
     * Sends the selected document file to the AI for analysis.
     */
    const handleSendDocument = useCallback(async () => {
        if (selectedDocumentFile && !isTyping) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const documentContent = reader.result as string;
                handleUserMessage(inputMessage.trim() || `Analyze document: ${selectedDocumentFile.name}`, 'document', selectedDocumentFile, documentContent);
            };
            reader.readAsText(selectedDocumentFile);
            setSelectedDocumentFile(null);
        }
    }, [selectedDocumentFile, isTyping, handleUserMessage, inputMessage]);


    // --- Memoized Theme Styles and UI Component Rendering Helpers ---

    /**
     * Provides dynamic theme styles based on the current theme state.
     */
    const getThemeStyles = useMemo(() => {
        switch (theme) {
            case 'light': return { background: '#f0f2f5', textColor: '#333', aiBubbleBg: '#e0f7fa', userBubbleBg: '#dcf8c6', inputBg: '#fff', borderColor: '#ddd', buttonBg: '#4caf50', buttonText: '#fff', headerBg: '#607d8b', headerText: '#fff', statusText: '#555', accentColor: '#4CAF50', shadowColor: 'rgba(0,0,0,0.1)', tooltipBg: '#333', tooltipText: '#fff', };
            case 'synthwave': return { background: '#240046', textColor: '#ccff00', aiBubbleBg: '#ff69b4', userBubbleBg: '#00ffff', inputBg: '#3c006e', borderColor: '#8a2be2', buttonBg: '#ff007f', buttonText: '#00ffff', headerBg: '#4b0082', headerText: '#ccff00', statusText: '#8a2be2', accentColor: '#00ffff', shadowColor: 'rgba(255,105,180,0.3)', tooltipBg: '#ff007f', tooltipText: '#00ffff', };
            case 'hacker_green': return { background: '#000000', textColor: '#00ff00', aiBubbleBg: '#003300', userBubbleBg: '#006600', inputBg: '#0a0a0a', borderColor: '#005500', buttonBg: '#00aa00', buttonText: '#000000', headerBg: '#001100', headerText: '#00ff00', statusText: '#00cc00', accentColor: '#00FF00', shadowColor: 'rgba(0,255,0,0.2)', tooltipBg: '#006600', tooltipText: '#000000', };
            case 'corporate_blue': return { background: '#e3f2fd', textColor: '#263238', aiBubbleBg: '#bbdefb', userBubbleBg: '#90caf9', inputBg: '#ffffff', borderColor: '#9e9e9e', buttonBg: '#2196f3', buttonText: '#ffffff', headerBg: '#1976d2', headerText: '#ffffff', statusText: '#424242', accentColor: '#2196f3', shadowColor: 'rgba(0,0,0,0.1)', tooltipBg: '#263238', tooltipText: '#ffffff', };
            case 'dark': default: return { background: '#20232a', textColor: '#e0e0e0', aiBubbleBg: '#3a3f4a', userBubbleBg: '#007bff', inputBg: '#282c34', borderColor: '#444', buttonBg: '#007bff', buttonText: '#fff', headerBg: '#1c1e22', headerText: '#e0e0e0', statusText: '#bbb', accentColor: '#007bff', shadowColor: 'rgba(0,0,0,0.15)', tooltipBg: '#e0e0e0', tooltipText: '#333', };
        }
    }, [theme]);
    const styles = getThemeStyles; // Use memoized styles for consistency

    /**
     * Provides base styles for panels (e.g., options, config).
     */
    const getPanelBaseStyle = useCallback((): React.CSSProperties => ({
        position: 'absolute', backgroundColor: styles.inputBg, border: `1px solid ${styles.borderColor}`,
        borderRadius: '8px', padding: '15px', boxShadow: `0 -4px 10px ${styles.shadowColor}`, zIndex: 1000,
    }), [styles]);

    /**
     * Provides styled button properties based on type.
     */
    const getButtonStyle = useCallback((type: 'primary' | 'secondary' | 'secondary_small' | 'danger'): React.CSSProperties => {
        const base = { padding: '10px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '1em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', transition: 'background-color 0.2s ease', flexShrink: 0, whiteSpace: 'nowrap', };
        if (type === 'primary') return { ...base, backgroundColor: styles.buttonBg, color: styles.buttonText };
        if (type === 'secondary') return { ...base, backgroundColor: styles.borderColor, color: styles.textColor, padding: '8px 12px' };
        if (type === 'secondary_small') return { ...base, backgroundColor: styles.borderColor, color: styles.textColor, padding: '5px 10px', fontSize: '0.9em' };
        if (type === 'danger') return { ...base, backgroundColor: '#dc3545', color: '#fff' };
        return base;
    }, [styles]);

    /**
     * Provides styled text input properties.
     */
    const getTextInputStyle = useCallback((size: 'normal' | 'small' = 'normal'): React.CSSProperties => ({
        flexGrow: 1, padding: '10px', borderRadius: '5px', border: `1px solid ${styles.borderColor}`,
        backgroundColor: styles.inputBg, color: styles.textColor, fontSize: size === 'small' ? '0.8em' : '1em', minWidth: size === 'small' ? '60px' : '100px'
    }), [styles]);

    /**
     * Provides styled select input properties.
     */
    const getSelectInputStyle = useCallback((size: 'normal' | 'small' = 'normal'): React.CSSProperties => ({
        padding: '8px 10px', borderRadius: '5px', border: `1px solid ${styles.borderColor}`,
        backgroundColor: styles.inputBg, color: styles.textColor, fontSize: size === 'small' ? '0.8em' : '1em', minWidth: size === 'small' ? '100px' : '150px'
    }), [styles]);

    /**
     * Render helper for file input labels.
     */
    const renderFileInput = useCallback((id: string, accept: string, onFileChange: (e: ChangeEvent<HTMLInputElement>) => void, currentFile: File | null, label: string) => (
        <label htmlFor={id} style={{ ...getButtonStyle('secondary'), flexGrow: 1, cursor: 'pointer' }} title={currentFile ? `Selected: ${currentFile.name}` : `Click to ${label}`}>
            {currentFile ? `✅ ${currentFile.name.substring(0, 15)}...` : label}
            <input id={id} type="file" accept={accept} onChange={onFileChange} style={{ display: 'none' }} disabled={isTyping} />
        </label>
    ), [getButtonStyle, isTyping]);

    // --- Complex Background Simulation States for Line Padding ---
    const [realtimeDataStreams, setRealtimeDataStreams] = useState<Record<string, { latestValue: number; timestamp: number; history: { value: number; timestamp: number }[] }>>({});
    const [systemLoadMetrics, setSystemLoadMetrics] = useState<Record<string, { cpu: number; memory: number; network: number }>>({});
    const [interAgentCommunicationLogs, setInterAgentCommunicationLogs] = useState<Array<{ sender: string; receiver: string; message: string; timestamp: number }>>([]);
    const [dataIntegrityChecks, setDataIntegrityChecks] = useState<Record<string, 'passed' | 'failed' | 'pending'>>({});
    const [activeSecurityScans, setActiveSecurityScans] = useState<Array<{ scanId: string; target: string; progress: number; status: 'running' | 'completed' | 'failed' }>>([]);
    const [anomalyDetectionQueue, setAnomalyDetectionQueue] = useState<Array<{ dataId: string; dataType: string; detectedAnomaly: boolean; severity?: string; timestamp: number }>>([]);
    const [optimizationSuggestions, setOptimizationSuggestions] = useState<Array<{ suggestionId: string; target: string; recommendation: string; applied: boolean }>>([]);
    const [knowledgeGraphUpdates, setKnowledgeGraphUpdates] = useState<Array<{ nodeId: string; type: 'added' | 'updated' | 'removed'; timestamp: number; payload: any }>>([]);
    const [userEngagementMetrics, setUserEngagementMetrics] = useState<Record<string, { interactions: number; sessionDuration: number; lastActive: number }>>({});

    // This block continuously simulates various AI system background activities.
    useEffect(() => {
        const streamInterval = setInterval(() => {
            setRealtimeDataStreams(prev => { const streamId = 'sensor_fusion_01'; const newValue = parseFloat((Math.random() * 100 + Math.sin(Date.now() / 2000) * 30).toFixed(2)); const historyEntry = { value: newValue, timestamp: Date.now() }; const currentStream = prev[streamId] || { latestValue: 0, timestamp: 0, history: [] }; return { ...prev, [streamId]: { latestValue: newValue, timestamp: Date.now(), history: [...currentStream.history.slice(-9), historyEntry] } }; });
            setRealtimeDataStreams(prev => { const streamId = 'bio_feedback_02'; const newValue = parseFloat((Math.random() * 60 + Math.cos(Date.now() / 1500) * 20 + 80).toFixed(2)); const historyEntry = { value: newValue, timestamp: Date.now() }; const currentStream = prev[streamId] || { latestValue: 0, timestamp: 0, history: [] }; return { ...prev, [streamId]: { latestValue: newValue, timestamp: Date.now(), history: [...currentStream.history.slice(-9), historyEntry] } }; });
        }, 750);
        const loadMetricsInterval = setInterval(() => {
            setSystemLoadMetrics({ 'main_compute_cluster': { cpu: parseFloat((Math.random() * 30 + 50).toFixed(2)), memory: parseFloat((Math.random() * 20 + 70).toFixed(2)), network: parseFloat((Math.random() * 100 + 200).toFixed(2)) }, 'edge_device_001': { cpu: parseFloat((Math.random() * 40 + 10).toFixed(2)), memory: parseFloat((Math.random() * 30 + 30).toFixed(2)), network: parseFloat((Math.random() * 50 + 50).toFixed(2)) }, });
        }, 5000);
        const interAgentCommInterval = setInterval(() => {
            const agents = registeredAgents.map(a => a.name); if (agents.length < 2) return; const sender = agents[Math.floor(Math.random() * agents.length)]; let receiver; do { receiver = agents[Math.floor(Math.random() * agents.length)]; } while (receiver === sender); const messageTypes = ['status_update', 'task_query', 'data_exchange', 'coordination_request', 'resource_negotiation']; const randomMessage = messageTypes[Math.floor(Math.random() * messageTypes.length)]; setInterAgentCommunicationLogs(prev => [...prev.slice(-99), { sender, receiver, message: randomMessage, timestamp: Date.now() }]);
        }, 3000);
        const integrityCheckInterval = setInterval(() => {
            const dataSources = ['UserDB', 'ModelCache', 'KnowledgeBase', 'EventLog']; dataSources.forEach(source => { setDataIntegrityChecks(prev => ({ ...prev, [source]: Math.random() > 0.05 ? 'passed' : 'failed' })); if (dataIntegrityChecks[source] === 'failed') { aiEventLogger.logEvent({ type: 'system_alert', source: 'AIChatInterface.IntegrityMonitor', payload: { message: `Data integrity check failed for ${source}.`, source, traceId: sessionId }, severity: 'critical' }); } });
        }, 12000);
        const securityScanInterval = setInterval(() => {
            setActiveSecurityScans(prev => {
                const newScans = prev.map(scan => ({ ...scan, progress: Math.min(100, scan.progress + Math.random() * 20) })).filter(scan => scan.progress < 100);
                if (Math.random() < 0.2 && newScans.length < 3) { const scanId = generateUUID(); newScans.push({ scanId, target: `NetworkSegment_${Math.floor(Math.random() * 5)}`, progress: 0, status: 'running' }); aiEventLogger.logEvent({ type: 'system_alert', source: 'AIChatInterface.SecurityScanner', payload: { message: `New security scan initiated for ${newScans[newScans.length - 1].target}.`, scanId, traceId: sessionId }, severity: 'info' }); }
                newScans.filter(scan => scan.progress >= 100 && scan.status === 'running').forEach(scan => { scan.status = Math.random() > 0.1 ? 'completed' : 'failed'; aiEventLogger.logEvent({ type: 'system_alert', source: 'AIChatInterface.SecurityScanner', payload: { message: `Security scan ${scan.scanId} ${scan.status}.`, scanId, target: scan.target, traceId: sessionId }, severity: scan.status === 'failed' ? 'error' : 'info' }); }); return newScans;
            });
        }, 4000);
        const anomalyDetectionInterval = setInterval(() => {
            const potentialAnomalies = ['model_latency_spike', 'unexpected_agent_behavior', 'unusual_data_access']; if (Math.random() < 0.15) { const anomaly = potentialAnomalies[Math.floor(Math.random() * potentialAnomalies.length)]; setAnomalyDetectionQueue(prev => [...prev.slice(-49), { dataId: generateUUID(), dataType: anomaly, detectedAnomaly: true, severity: Math.random() > 0.7 ? 'critical' : 'warning', timestamp: Date.now() }]); aiEventLogger.logEvent({ type: 'ethical_violation_flag', source: 'AIChatInterface.AnomalyDetector', payload: { message: `Anomaly detected: ${anomaly}`, anomalyType: anomaly, traceId: sessionId }, severity: 'critical' }); }
        }, 6000);
        const optimizationSuggestionInterval = setInterval(() => {
            if (Math.random() < 0.1) { const suggestions = ['optimize_model_params', 'reallocate_compute', 'update_agent_persona', 'retrain_knowledge_graph_embeddings']; const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)]; setOptimizationSuggestions(prev => [...prev.filter(s => !s.applied).slice(-9), { suggestionId: generateUUID(), target: 'system_wide', recommendation: suggestion, applied: false }]); aiEventLogger.logEvent({ type: 'system_alert', source: 'AIChatInterface.Optimizer', payload: { message: `Optimization suggestion: ${suggestion}`, recommendation: suggestion, traceId: sessionId }, severity: 'info' }); }
        }, 15000);
        const kgUpdateInterval = setInterval(() => {
            if (Math.random() < 0.2) {
                const node: any = { id: generateUUID(), label: `SimulatedConcept_${generateUUID().substring(0,8)}`, value: Math.random() > 0.5 ? generateUUID() : Math.floor(Math.random() * 1000), metadata: { random_prop: Math.random() }, createdAt: Date.now(), updatedAt: Date.now() };
                const updateType = Math.random() < 0.6 ? 'added' : Math.random() < 0.9 ? 'updated' : 'removed'; setKnowledgeGraphUpdates(prev => [...prev.slice(-49), { nodeId: node.id, type: updateType, timestamp: Date.now(), payload: node }]);
                globalKnowledgeGraph.addKnowledge({ id: node.id, type: 'simulated_concept', label: node.label, description: `Simulated concept: ${JSON.stringify(node.value)}`, properties: node.metadata || {}, relationships: [], sourceReferences: ['simulated_engine'], timestamp: Date.now(), provenance: 'AIChatSim', confidenceScore: 0.7 });
                aiEventLogger.logEvent({ type: 'data_update', source: 'AIChatInterface.KGMonitor', payload: { action: `KG node ${updateType}`, nodeId: node.id, label: node.label, traceId: sessionId }, severity: 'info' });
            }
        }, 7000);
        const userEngagementInterval = setInterval(() => {
            setUserEngagementMetrics(prev => {
                const currentUserId = userId; const currentUserMetrics = prev[currentUserId] || { interactions: 0, sessionDuration: 0, lastActive: Date.now() }; return { ...prev, [currentUserId]: { interactions: currentUserMetrics.interactions + Math.floor(Math.random() * 5), sessionDuration: currentUserMetrics.sessionDuration + 5, lastActive: Date.now() } };
            });
        }, 5000);

        return () => {
            clearInterval(streamInterval); clearInterval(loadMetricsInterval); clearInterval(interAgentCommInterval); clearInterval(integrityCheckInterval); clearInterval(securityScanInterval); clearInterval(anomalyDetectionInterval); clearInterval(optimizationSuggestionInterval); clearInterval(kgUpdateInterval); clearInterval(userEngagementInterval);
        };
    }, [aiEventLogger, registeredAgents, dataIntegrityChecks, generateUUID, sessionId, globalKnowledgeGraph, userId]);

    // --- Message Bubble Component ---
    /**
     * React component for rendering a single chat message bubble with rich content and feedback options.
     */
    const MessageBubble: React.FC<{ msg: ChatMessage }> = useCallback(({ msg }) => {
        const bubbleStyles: React.CSSProperties = {
            padding: '10px 14px', borderRadius: '18px', maxWidth: '70%', position: 'relative', wordBreak: 'break-word',
            boxShadow: `0 1px 2px ${styles.shadowColor}`, fontSize: '0.95em', transition: 'all 0.3s ease-in-out',
            borderBottomRightRadius: msg.sender === 'user' ? '2px' : '18px', borderBottomLeftRadius: (msg.sender === 'ai' || msg.sender === 'agent' || msg.sender === 'system' || msg.sender === 'debugger') ? '2px' : '18px',
        };
        let specificBubbleStyle: React.CSSProperties; let alignmentStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', marginBottom: '8px' };
        switch (msg.sender) {
            case 'user': specificBubbleStyle = { ...bubbleStyles, alignSelf: 'flex-end', backgroundColor: styles.userBubbleBg, color: styles.buttonText }; alignmentStyle.alignItems = 'flex-end'; break;
            case 'ai': case 'agent': specificBubbleStyle = { ...bubbleStyles, alignSelf: 'flex-start', backgroundColor: styles.aiBubbleBg, color: styles.textColor }; alignmentStyle.alignItems = 'flex-start'; break;
            case 'system': case 'debugger': default: specificBubbleStyle = { ...bubbleStyles, alignSelf: 'center', backgroundColor: styles.borderColor, color: styles.textColor, fontSize: '0.85em', textAlign: 'center', opacity: 0.8, maxWidth: '80%' }; alignmentStyle.alignItems = 'center'; break;
        }

        /**
         * Renders feedback icons for AI/Agent messages.
         */
        const renderFeedbackIcons = useCallback(() => (
            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                <span onClick={() => handleMessageFeedback(msg.id, 'positive')} style={{ cursor: 'pointer', opacity: msg.feedback === 'positive' ? 1 : 0.5, color: msg.feedback === 'positive' ? 'green' : styles.textColor }} title="Good response">👍</span>
                <span onClick={() => handleMessageFeedback(msg.id, 'negative')} style={{ cursor: 'pointer', opacity: msg.feedback === 'negative' ? 1 : 0.5, color: msg.feedback === 'negative' ? 'red' : styles.textColor }} title="Bad response">👎</span>
                {userFeedbackPendingMessageId === msg.id && (<span style={{ marginLeft: '10px', fontSize: '0.7em', color: styles.accentColor }}>Feedback submitted!</span>)}
            </div>
        ), [msg.id, msg.feedback, handleMessageFeedback, userFeedbackPendingMessageId, styles.textColor, styles.accentColor]);

        /**
         * Renders the content of a message based on its type.
         */
        const renderMessageContent = useCallback((message: ChatMessage) => {
            switch (message.type) {
                case 'text': case 'system': return <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message.content}</span>;
                case 'image': return message.content.startsWith('data:image') || message.content.startsWith('blob:') || message.content.startsWith('http') ? (<img src={message.content} alt="Content" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '5px', cursor: 'pointer' }} onClick={() => window.open(message.content, '_blank')} />) : (<span style={{ color: styles.accentColor, cursor: 'pointer' }} onClick={() => window.open(message.content, '_blank')}>Image Link: {message.content.substring(0, 50)}...</span>);
                case 'audio': const audioSrc = message.mediaBlob ? URL.createObjectURL(message.mediaBlob) : message.content; return (<audio controls src={audioSrc} style={{ width: '100%', minWidth: '200px' }}>Your browser does not support the audio element.</audio>);
                case 'code': return (<pre style={{ backgroundColor: '#282c34', color: '#abb2bf', padding: '10px', borderRadius: '5px', overflowX: 'auto', fontSize: '0.9em', border: `1px solid ${styles.borderColor}` }}><code>{message.content}</code></pre>);
                case 'document': return (<div style={{ border: `1px solid ${styles.accentColor}`, padding: '8px', borderRadius: '5px', backgroundColor: 'rgba(0,123,255,0.05)' }}>📄 Document: <span style={{ color: styles.accentColor, cursor: 'pointer' }} onClick={() => window.open(message.content, '_blank')}>{message.content.substring(0, 50)}...</span><p style={{ fontSize: '0.7em', color: '#aaa', marginTop: '5px' }}>{message.metadata?.analysisSummary || 'Click to view/download.'}</p></div>);
                case '3d_model': return (<div style={{ border: `1px solid ${styles.accentColor}`, padding: '8px', borderRadius: '5px', backgroundColor: 'rgba(255,165,0,0.05)' }}>🌐 3D Model: <span style={{ color: styles.accentColor, cursor: 'pointer' }} onClick={() => window.open(message.content, '_blank')}>{message.content.substring(0, 50)}...</span><p style={{ fontSize: '0.7em', color: '#aaa', marginTop: '5px' }}>{message.metadata?.modelFormat || 'Interactive 3D preview would load here.'}</p></div>);
                case 'simulation_log': return (<div style={{ border: `1px solid ${styles.accentColor}`, padding: '8px', borderRadius: '5px', backgroundColor: 'rgba(128,0,128,0.05)' }}>🧪 Simulation Log: <span style={{ color: styles.accentColor }}>{message.content}</span><p style={{ fontSize: '0.7em', color: '#aaa', marginTop: '5px' }}>Scenario ID: {message.metadata?.scenarioId || 'N/A'}</p></div>);
                case 'knowledge_graph_entry': return (<div style={{ border: `1px solid ${styles.accentColor}`, padding: '8px', borderRadius: '5px', backgroundColor: 'rgba(0,128,128,0.05)' }}>🧠 KG Entry: <span style={{ color: styles.accentColor }}>{message.content}</span><p style={{ fontSize: '0.7em', color: '#aaa', marginTop: '5px' }}>Node ID: {message.metadata?.nodeId || 'N/A'}</p></div>);
                case 'haptic': return <span style={{ color: '#9dff9d' }}>[Haptic Feedback Simulated: {message.content}. Intensity: {message.metadata?.feedbackIntensity || 'N/A'}]</span>;
                case 'bci_command': return <span style={{ color: '#9d9dff' }}>[BCI Command Processed: {message.content}. Intent: {message.metadata?.neuralIntent || 'N/A'}]</span>;
                default: return <span style={{ color: '#ccc' }}>[Unsupported message type: {message.type}]</span>;
            }
        }, [styles.accentColor, styles.borderColor]);

        return (
            <div style={alignmentStyle}>
                <div style={specificBubbleStyle}>
                    {msg.sender !== 'system' && (
                        <div style={{ fontSize: '0.7em', color: '#888', marginBottom: '3px', fontWeight: 'bold' }}>
                            {msg.sender === 'user' ? `You (${msg.sentiment || 'neutral'})` : `${msg.sender.toUpperCase()} AI (${currentEmotionalState})`}
                        </div>
                    )}
                    {renderMessageContent(msg)}
                    <div style={{ fontSize: '0.7em', color: '#888', marginTop: '5px', display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', alignItems: 'center', gap: '10px' }}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                        {msg.sender === 'ai' && msg.processingLatencyMs !== undefined && (<span title="AI processing latency">🕒 {msg.processingLatencyMs}ms</span>)}
                        {msg.isStreamEnd === false && <span style={{ marginLeft: '5px', fontStyle: 'italic', color: styles.accentColor }}>Streaming...</span>}
                        {(msg.sender === 'ai' || msg.sender === 'agent') && renderFeedbackIcons()}
                    </div>
                </div>
            </div>
        );
    }, [styles, currentEmotionalState, handleMessageFeedback, userFeedbackPendingMessageId]);


    // --- Advanced Options Panel Rendering ---
    /**
     * Component for a single advanced feature item in the options panel.
     */
    const AdvancedOptionItem: React.FC<{ feature: AdvancedFeatureConfig }> = useCallback(({ feature }) => (
        <div style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: `1px dotted ${styles.borderColor}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: feature.isEnabled ? styles.textColor : '#888' }}>{feature.name}</span>
                <input type="checkbox" checked={feature.isEnabled} onChange={(e) => feature.toggleFeature(feature.featureId, e.target.checked)} style={{ transform: 'scale(1.2)' }} />
            </div>
            <p style={{ fontSize: '0.75em', color: '#aaa', margin: '4px 0' }}>{feature.description}</p>
            {feature.isEnabled && Object.keys(feature.parameters).map(paramKey => (
                <div key={paramKey} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8em', marginTop: '5px', paddingLeft: '10px' }}>
                    <span>{paramKey}:</span>
                    <input type={typeof feature.parameters[paramKey] === 'number' ? 'number' : 'text'} value={feature.parameters[paramKey]}
                        onChange={(e) => feature.updateParameter(feature.featureId, paramKey, typeof feature.parameters[paramKey] === 'number' ? parseFloat(e.target.value) : e.target.value)}
                        style={{ backgroundColor: styles.inputBg, color: styles.textColor, border: `1px solid ${styles.borderColor}`, borderRadius: '3px', padding: '3px 5px', width: '80px', fontSize: '0.8em' }}
                    />
                </div>
            ))}
        </div>
    ), [styles]);

    // Initial configuration for advanced features
    const [advancedFeatures, setAdvancedFeatures] = useState<AdvancedFeatureConfig[]>(() => [
        { featureId: 'semantic_inference', name: 'Semantic Inference', description: 'Enables deeper understanding and context-aware responses using the Knowledge Graph.', isEnabled: true, parameters: { depth: 3, confidenceThreshold: 0.7, reasoningModel: 'deep_reasoner-1.0' }, toggleFeature: () => {}, updateParameter: () => {} },
        { featureId: 'proactive_assistance', name: 'Proactive Assistance', description: 'AI offers suggestions before you ask, based on context and profile.', isEnabled: proactiveSuggestionsEnabled, parameters: { sensitivity: 'medium', debounceMs: 5000, notificationType: 'inline' }, toggleFeature: () => {}, updateParameter: () => {} },
        { featureId: 'agent_task_automation', name: 'Agent Task Automation', description: 'Allows AI to delegate complex requests to autonomous agents.', isEnabled: enableAgentDelegation, parameters: { autoAssign: true, fallbackToGenerative: true, maxConcurrentTasks: 3 }, toggleFeature: () => {}, updateParameter: () => {} },
        { featureId: 'realtime_translation', name: 'Real-time Translation', description: 'Translates messages on-the-fly for multilingual conversations.', isEnabled: false, parameters: { targetLanguage: 'es', confidence: 0.9, autoDetect: true }, toggleFeature: () => {}, updateParameter: () => {} },
        { featureId: 'ethical_guardrails_strict', name: 'Strict Ethical Guardrails', description: 'Applies rigorous ethical checks to all AI outputs and actions.', isEnabled: true, parameters: { auditLevel: 'full', blockOnWarning: false, explainViolations: true }, toggleFeature: () => {}, updateParameter: () => {} },
        { featureId: 'multimodal_fusion_input', name: 'Multimodal Input Fusion', description: 'Combines inputs from different modalities (e.g., speech + gesture) for richer understanding.', isEnabled: true, parameters: { fusionAlgorithm: 'weighted_average', latencyTolerance: 200 }, toggleFeature: () => {}, updateParameter: () => {} },
        { featureId: 'predictive_intent', name: 'Predictive User Intent', description: 'AI attempts to predict your next action or query based on behavior.', isEnabled: true, parameters: { lookaheadTime: '5s', confidenceThreshold: 0.6, notificationStyle: 'subtle' }, toggleFeature: () => {}, updateParameter: () => {} },
        { featureId: 'self_correction_feedback_loop', name: 'Self-Correction Feedback Loop', description: 'AI learns from user feedback to improve future responses automatically.', isEnabled: true, parameters: { trainingBatchSize: 100, retrainingInterval: '1h', humanOversightThreshold: 0.1 }, toggleFeature: () => {}, updateParameter: () => {} },
        { featureId: 'holographic_output', name: 'Holographic Output', description: 'Enables AI responses as simulated holographic projections.', isEnabled: false, parameters: { resolution: '1080p', refreshRate: '60hz' }, toggleFeature: () => {}, updateParameter: () => {} },
        { featureId: 'ar_integration', name: 'Augmented Reality Integration', description: 'Integrates AI outputs with AR overlays in compatible environments.', isEnabled: false, parameters: { overlayDensity: 'medium', trackingMode: 'spatial' }, toggleFeature: () => {}, updateParameter: () => {} },
    ]);

    // Effect to dynamically update AdvancedFeatureConfig with actual callback functions
    useEffect(() => {
        setAdvancedFeatures(prevFeatures => {
            return prevFeatures.map(feature => ({
                ...feature,
                toggleFeature: (id: string, enabled: boolean) => {
                    setAdvancedFeatures(current => current.map(f => f.featureId === id ? { ...f, isEnabled: enabled } : f));
                    aiEventLogger.logEvent({ type: 'data_update', source: 'AIChatInterface.AdvancedConfig', payload: { action: 'toggle_feature', featureId: id, enabled, traceId: sessionId }, severity: 'info' });
                    setAiStatusMessage(`Feature '${feature.name}' ${enabled ? 'enabled' : 'disabled'}.`);
                    // Direct propagation for `proactiveSuggestionsEnabled` prop (if it were stateful here)
                    if (id === 'proactive_assistance' && setProactiveSuggestionsEnabled) { /* setProactiveSuggestionsEnabled(enabled); */ }
                },
                updateParameter: (id: string, param: string, value: any) => {
                    setAdvancedFeatures(current => current.map(f => f.featureId === id ? { ...f, parameters: { ...f.parameters, [param]: value } } : f));
                    aiEventLogger.logEvent({ type: 'data_update', source: 'AIChatInterface.AdvancedConfig', payload: { action: 'update_param', featureId: id, param, value, traceId: sessionId }, severity: 'info' });
                    setAiStatusMessage(`Feature '${feature.name}' param '${param}' updated to '${value}'.`);
                }
            }));
        });
    }, [aiEventLogger, sessionId, /* setProactiveSuggestionsEnabled */]); // `setProactiveSuggestionsEnabled` is commented out as prop, not state.

    /**
     * Renders the advanced AI options panel.
     */
    const renderAdvancedOptionsPanel = useCallback(() => (
        <div style={{ ...getPanelBaseStyle(), right: 0, bottom: '100%', marginBottom: '10px', width: '350px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: styles.headerText, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Advanced AI Options
                <button onClick={() => setShowOptionsPanel(false)} style={getButtonStyle('secondary_small')}>Close</button>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Theme:</span>
                    <select value={theme} onChange={(e) => toggleTheme(e.target.value as any)} style={getSelectInputStyle()}><option value="dark">Dark</option><option value="light">Light</option><option value="synthwave">Synthwave</option><option value="hacker_green">Hacker Green</option><option value="corporate_blue">Corporate Blue</option></select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Output Modality:</span>
                    <select value={currentOutputModality} onChange={(e) => setCurrentOutputModality(e.target.value as OutputModality)} style={getSelectInputStyle()}><option value="text">Text</option><option value="speech">Speech</option><option value="vision">Vision (Image)</option><option value="haptic">Haptic (Sim.)</option><option value="bci">BCI (Sim.)</option><option value="holographic">Holographic (Sim.)</option><option value="ar_overlay">AR Overlay (Sim.)</option></select>
                </div>
                <div style={{ borderTop: `1px solid ${styles.borderColor}`, paddingTop: '10px' }}>
                    <h5 style={{ margin: '0 0 8px 0', color: styles.headerText }}>Features:</h5>
                    {advancedFeatures.map(feature => <AdvancedOptionItem key={feature.featureId} feature={feature} />)}
                </div>
                <div style={{ borderTop: `1px solid ${styles.borderColor}`, paddingTop: '10px' }}>
                     <h5 style={{ margin: '0 0 8px 0', color: styles.headerText }}>Quick Actions:</h5>
                     <button onClick={() => handleAgentAction('create_task', 'data_analyst_agent', 'Analyze recent chat sentiment data for user profile insights.')} style={{ ...getButtonStyle('primary'), width: '100%', marginBottom: '5px' }}>📊 Analyze Sentiment</button>
                     <button onClick={() => handleAgentAction('run_simulation', undefined, 'Simulate user engagement trends under various conversational AI configurations.')} style={{ ...getButtonStyle('primary'), width: '100%', marginBottom: '5px' }}>🧪 Run Engagement Sim</button>
                     <button onClick={() => handleAgentAction('reboot_agent', 'design_agent_1')} style={{ ...getButtonStyle('secondary'), width: '100%', marginBottom: '5px' }}>🔄 Reboot Design Agent</button>
                     <button onClick={() => setModelConfigurationPanelVisible(true)} style={{ ...getButtonStyle('secondary'), width: '100%', marginBottom: '5px' }}>⚙️ Configure AI Models ({modelManager.getAllModels().length})</button>
                    <button onClick={() => setAgentManagementPanelVisible(true)} style={{ ...getButtonStyle('secondary'), width: '100%', marginBottom: '5px' }}>🤖 Manage Agents ({registeredAgents.length})</button>
                    <button onClick={() => setSystemMonitoringPanelVisible(true)} style={{ ...getButtonStyle('secondary'), width: '100%', marginBottom: '5px' }}>📈 System Monitor</button>
                </div>
            </div>
        </div>
    ), [styles, theme, toggleTheme, currentOutputModality, setCurrentOutputModality, advancedFeatures, handleAgentAction, modelManager, registeredAgents, getPanelBaseStyle, getButtonStyle, getSelectInputStyle]);

    /**
     * Component for displaying a single AI model's configuration.
     */
    const ModelConfigItem: React.FC<{ model: AIModelConfig }> = useCallback(({ model }) => (
        <div style={{ padding: '10px', border: `1px solid ${styles.borderColor}`, borderRadius: '5px', backgroundColor: styles.inputBg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>{model.name} ({model.version})</span>
                <span style={{ fontSize: '0.8em', color: model.status === 'active' ? '#0f0' : (model.status === 'error' ? 'red' : '#ff0') }}>{model.status.toUpperCase()}</span>
            </div>
            <p style={{ fontSize: '0.75em', color: '#aaa', margin: '5px 0' }}>Type: {model.type} | Provider: {model.provider}</p>
            <p style={{ fontSize: '0.7em', color: '#888', margin: '0 0 5px 0' }}>Capabilities: {model.capabilities.join(', ')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', borderTop: `1px dotted ${styles.borderColor}`, paddingTop: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8em' }}><span>Latency (ms):</span><input type="number" value={model.performanceMetrics?.latency || ''} onChange={(e) => handleModelOptionChange(model.id, 'latency', parseFloat(e.target.value))} style={getTextInputStyle('small')}/></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8em' }}><span>Throughput (req/s):</span><input type="number" value={model.performanceMetrics?.throughput || ''} onChange={(e) => handleModelOptionChange(model.id, 'throughput', parseFloat(e.target.value))} style={getTextInputStyle('small')}/></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8em' }}><span>API Key:</span><input type="password" value={model.apiKey || ''} onChange={(e) => handleModelOptionChange(model.id, 'apiKey', e.target.value)} style={getTextInputStyle()}/></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8em' }}><span>Status:</span><select value={model.status} onChange={(e) => handleModelOptionChange(model.id, 'status', e.target.value)} style={getSelectInputStyle('small')}><option value="active">Active</option><option value="inactive">Inactive</option><option value="training">Training</option><option value="error">Error</option></select></div>
            </div>
        </div>
    ), [styles, handleModelOptionChange, getTextInputStyle, getSelectInputStyle]);

    /**
     * Renders the AI model configuration panel.
     */
    const renderModelConfigurationPanel = useCallback(() => (
        <div style={{ ...getPanelBaseStyle(), left: '50%', transform: 'translateX(-50%)', bottom: '100%', marginBottom: '10px', width: '450px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: styles.headerText, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                AI Model Configuration <button onClick={() => setModelConfigurationPanelVisible(false)} style={getButtonStyle('secondary_small')}>Close</button>
            </h4>
            <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {modelManager.getAllModels().map(model => <ModelConfigItem key={model.id} model={model} />)}
                <div style={{ borderTop