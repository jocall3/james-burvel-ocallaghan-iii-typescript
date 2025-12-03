// "Let the user command the app with their voice," Gemini proclaimed. "We will give them a constant companion."
import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { View } from '../types'; // Assuming View is an enum like Dashboard, Transactions, Budgets

// --- Global Types and Interfaces for the Voice Universe ---

/**
 * Represents a recognized speech segment, including transcription, confidence, and timestamp.
 */
export interface SpeechSegment {
    id: string;
    transcript: string;
    confidence: number;
    timestamp: number;
    isFinal: boolean;
}

/**
 * Defines a structured intent recognized from user speech.
 * This moves beyond simple direct commands to more abstract actions.
 */
export interface Intent {
    name: string; // e.g., "NavigateView", "QueryFinancialData", "SetReminder"
    entities?: {
        [key: string]: any; // e.g., { view: "Dashboard" }, { amount: 50, category: "Groceries" }
    };
    confidence: number;
    rawUtterance: string;
}

/**
 * Defines a voice command template, allowing for dynamic parameter extraction.
 */
export interface VoiceCommandDefinition {
    id: string;
    patterns: RegExp[]; // Regular expressions to match utterances
    intent: Intent;
    priority?: number; // For resolving ambiguous commands
    requiresContext?: string[]; // e.g., ['FinancialContext']
    permissionLevel?: 'user' | 'admin' | 'guest';
    enabled?: boolean;
    description: string;
}

/**
 * Represents a spoken response from the AI assistant.
 */
export interface AIResponse {
    text: string;
    speechAudio?: Blob; // Pre-generated audio or to be synthesized
    visualFeedback?: 'waveform' | 'text' | 'chart' | 'map' | 'none';
    followUpActions?: FollowUpAction[];
    isProactive?: boolean;
}

/**
 * Defines a potential follow-up action the user can take or the AI can suggest.
 */
export interface FollowUpAction {
    label: string;
    intent: Intent;
    icon?: string; // e.g., 'plus', 'search'
}

/**
 * Represents the current state of the conversation, including history and active entities.
 */
export interface ConversationState {
    id: string;
    history: SpeechSegment[];
    intentsRecognized: Intent[];
    activeContexts: string[]; // e.g., ['FinancialContext', 'BudgetEditing']
    activeEntities: { [key: string]: any }; // Entities extracted from recent turns
    lastInteractionTime: number;
    turns: number;
}

/**
 * User-specific preferences and learned data for voice interaction.
 */
export interface UserVoiceProfile {
    userId: string;
    preferredVoiceId: string;
    wakeWord: string; // e.g., "Gemini", "Assistant"
    customCommands: VoiceCommandDefinition[];
    ignoredPhrases: string[];
    accentSettings: 'standard' | 'regional' | 'custom';
    voiceBiometricsEnabled: boolean;
    learningEnabled: boolean;
    proactiveSuggestionsEnabled: boolean;
    sentimentAnalysisEnabled: boolean;
}

/**
 * Represents an error during voice processing.
 */
export interface VoiceError {
    type: 'recognition' | 'nlp' | 'tts' | 'system' | 'permission';
    message: string;
    code?: string;
    timestamp: number;
}

/**
 * Defines the capabilities and status of an external API integration.
 */
export interface APIIntegrationStatus {
    name: string;
    isEnabled: boolean;
    lastSync?: number;
    error?: string;
    featuresSupported: string[]; // e.g., "FinancialDataQuery", "CalendarEventCreation"
}

// --- Internal Helper Services (simulated/mocked within this file's universe) ---

/**
 * Service for Natural Language Processing (NLP), including intent classification and entity recognition.
 * This would typically involve cloud AI services or sophisticated local models.
 */
export class NLPService {
    private static instance: NLPService;
    private commandDefinitions: VoiceCommandDefinition[] = [];
    private knowledgeGraph: Map<string, any> = new Map(); // Simulated knowledge base

    private constructor() {
        // Initialize with default commands
        this.addCommandDefinition({
            id: 'navigate_dashboard',
            patterns: [/^(show|go to|take me to) my (dashboard|home|overview)$/i, /^dashboard$/i],
            intent: { name: 'NavigateView', entities: { view: View.Dashboard }, confidence: 1.0, rawUtterance: '' },
            description: 'Navigates to the user dashboard.',
            priority: 10
        });
        this.addCommandDefinition({
            id: 'navigate_transactions',
            patterns: [/^(show|view|find) my (recent )?(transactions|payments|spending)$/i, /^transactions$/i],
            intent: { name: 'NavigateView', entities: { view: View.Transactions }, confidence: 1.0, rawUtterance: '' },
            description: 'Displays the transaction history.',
            priority: 10
        });
        this.addCommandDefinition({
            id: 'navigate_budgets',
            patterns: [/^(show|view|manage) my budgets?$/i, /^budgets$/i],
            intent: { name: 'NavigateView', entities: { view: View.Budgets }, confidence: 1.0, rawUtterance: '' },
            description: 'Opens the budget management section.',
            priority: 10
        });
        this.addCommandDefinition({
            id: 'create_budget',
            patterns: [/^create a new budget for (.+?) (of|at|around) \$?(\d+(\.\d{1,2})?)$/i],
            intent: { name: 'CreateBudget', entities: { category: '$1', amount: '$3' }, confidence: 0.9, rawUtterance: '' },
            description: 'Creates a new budget for a specified category and amount.',
            requiresContext: ['FinancialContext'],
            priority: 15
        });
        this.addCommandDefinition({
            id: 'query_balance',
            patterns: [/^(what's|how much is) my (current )?(balance|money|funds)?$/i],
            intent: { name: 'QueryFinancialData', entities: { type: 'balance' }, confidence: 1.0, rawUtterance: '' },
            description: 'Queries the user\'s current account balance.',
            requiresContext: ['FinancialContext'],
            priority: 12
        });
        this.addCommandDefinition({
            id: 'set_reminder',
            patterns: [/^(set|create) a reminder to (.+?) (on|at|for) (today|tomorrow|.+?)( at (\d{1,2}(:\d{2})?( ?am|pm)?))?$/i],
            intent: { name: 'SetReminder', entities: { task: '$2', date: '$4', time: '$6' }, confidence: 0.95, rawUtterance: '' },
            description: 'Sets a new reminder with a task, date, and optional time.',
            requiresContext: ['ProductivityContext'],
            priority: 15
        });
        this.addCommandDefinition({
            id: 'find_restaurants',
            patterns: [/^(find|show me|where is) restaurants? (near|in|around) (.+?)$/i],
            intent: { name: 'SearchLocalBusinesses', entities: { type: 'restaurant', location: '$3' }, confidence: 0.85, rawUtterance: '' },
            description: 'Searches for restaurants in a specific location.',
            requiresContext: ['LocationContext'],
            priority: 8
        });
        // More sophisticated commands for smart home, health, creative tools, social, etc.
        this.addCommandDefinition({
            id: 'toggle_lights',
            patterns: [/^(turn|switch) (on|off) the (lights?|lamp|(\w+) light)$/i],
            intent: { name: 'SmartHomeControl', entities: { action: '$1', device: '$3' }, confidence: 0.9, rawUtterance: '' },
            description: 'Controls smart home lighting.',
            requiresContext: ['SmartHomeContext'],
            priority: 14
        });
        this.addCommandDefinition({
            id: 'log_meal',
            patterns: [/^(log|record) a meal of (.+?)( with (\d+) calories?)?$/i],
            intent: { name: 'LogHealthData', entities: { type: 'meal', description: '$2', calories: '$4' }, confidence: 0.88, rawUtterance: '' },
            description: 'Logs a meal entry into health tracking.',
            requiresContext: ['HealthTrackingContext'],
            priority: 13
        });
        this.addCommandDefinition({
            id: 'start_meditation',
            patterns: [/^(start|begin) (a )?(meditation|mindfulness) session (for (\d+) minutes?)?$/i],
            intent: { name: 'StartWellnessSession', entities: { type: 'meditation', duration: '$5' }, confidence: 0.92, rawUtterance: '' },
            description: 'Initiates a guided meditation session.',
            requiresContext: ['WellnessContext'],
            priority: 13
        });
        this.addCommandDefinition({
            id: 'summarize_email',
            patterns: [/^(summarize|read) my latest (email|message) from (.+?)$/i],
            intent: { name: 'SummarizeCommunication', entities: { type: 'email', sender: '$3' }, confidence: 0.9, rawUtterance: '' },
            description: 'Summarizes a recent email from a specified sender.',
            requiresContext: ['CommunicationContext'],
            priority: 16
        });
        this.addCommandDefinition({
            id: 'suggest_recipe',
            patterns: [/^(suggest|give me) a recipe (for (.+?))? (with (.+?))?$/i],
            intent: { name: 'RecipeSuggestion', entities: { dish: '$3', ingredients: '$6' }, confidence: 0.8, rawUtterance: '' },
            description: 'Suggests recipes based on criteria.',
            requiresContext: ['CulinaryContext'],
            priority: 9
        });
        this.addCommandDefinition({
            id: 'schedule_meeting',
            patterns: [/^(schedule|arrange) a meeting with (.+?) (on|for) (today|tomorrow|.+?)( at (\d{1,2}(:\d{2})?( ?am|pm)?))?$/i],
            intent: { name: 'ScheduleMeeting', entities: { participants: '$2', date: '$4', time: '$6' }, confidence: 0.95, rawUtterance: '' },
            description: 'Schedules a meeting with specified participants, date, and time.',
            requiresContext: ['CalendarContext', 'CommunicationContext'],
            priority: 17
        });
        this.addCommandDefinition({
            id: 'play_music',
            patterns: [/^(play|listen to) (some )?(music|a song|(.+?)) (by (.+?))?$/i],
            intent: { name: 'PlayMedia', entities: { type: 'music', item: '$4', artist: '$6' }, confidence: 0.85, rawUtterance: '' },
            description: 'Plays music, a specific song or by an artist.',
            requiresContext: ['MediaContext'],
            priority: 11
        });
        this.addCommandDefinition({
            id: 'open_app',
            patterns: [/^(open|launch) (.+?) (app)?$/i],
            intent: { name: 'OpenApplication', entities: { appName: '$2' }, confidence: 0.9, rawUtterance: '' },
            description: 'Opens a specified application within the ecosystem.',
            priority: 7
        });
        this.addCommandDefinition({
            id: 'create_design',
            patterns: [/^(create|design) a (.+?) (image|graphic|logo) (with (.+?))?$/i],
            intent: { name: 'CreativeDesign', entities: { type: '$2', description: '$5' }, confidence: 0.8, rawUtterance: '' },
            description: 'Generates a creative design or image based on description.',
            requiresContext: ['CreativeStudioContext'],
            priority: 12
        });
        this.addCommandDefinition({
            id: 'post_social',
            patterns: [/^(post|share) (.+?) (to|on) (facebook|twitter|instagram|social media)$/i],
            intent: { name: 'PostToSocialMedia', entities: { content: '$2', platform: '$4' }, confidence: 0.85, rawUtterance: '' },
            description: 'Posts content to a specified social media platform.',
            requiresContext: ['SocialContext'],
            priority: 10
        });
        this.addCommandDefinition({
            id: 'get_weather',
            patterns: [/^(what's the )?(weather|temperature) (like )?(in|for) (.+?) (today|tomorrow|on (.+?))?$/i],
            intent: { name: 'QueryWeatherData', entities: { location: '$5', date: '$6' }, confidence: 0.9, rawUtterance: '' },
            description: 'Retrieves weather information for a location and date.',
            requiresContext: ['InformationContext'],
            priority: 9
        });
        this.addCommandDefinition({
            id: 'call_contact',
            patterns: [/^(call|dial) (.+?)$/i],
            intent: { name: 'InitiateCall', entities: { contact: '$2' }, confidence: 0.95, rawUtterance: '' },
            description: 'Initiates a call to a specified contact.',
            requiresContext: ['CommunicationContext'],
            priority: 15
        });
        this.addCommandDefinition({
            id: 'send_message',
            patterns: [/^(send )?(a )?(message|text) to (.+?) (saying (.+?))?$/i],
            intent: { name: 'SendMessage', entities: { recipient: '$4', message: '$6' }, confidence: 0.95, rawUtterance: '' },
            description: 'Sends a message to a specified contact.',
            requiresContext: ['CommunicationContext'],
            priority: 15
        });
        this.addCommandDefinition({
            id: 'check_stock_price',
            patterns: [/^(what's the )?(stock price|value) for (.+?)( stock)?$/i],
            intent: { name: 'QueryFinancialData', entities: { type: 'stock_price', symbol: '$3' }, confidence: 0.9, rawUtterance: '' },
            description: 'Checks the current stock price for a given company.',
            requiresContext: ['FinancialContext'],
            priority: 12
        });
        this.addCommandDefinition({
            id: 'translate_text',
            patterns: [/^(translate) "(.+?)" (to|into) (.+?)$/i],
            intent: { name: 'TranslateText', entities: { text: '$2', targetLanguage: '$4' }, confidence: 0.92, rawUtterance: '' },
            description: 'Translates text into another language.',
            requiresContext: ['LocalizationContext'],
            priority: 11
        });
        this.addCommandDefinition({
            id: 'tell_joke',
            patterns: [/^(tell me|say) (a )?(joke|something funny)$/i],
            intent: { name: 'TellJoke', confidence: 0.8, rawUtterance: '' },
            description: 'Tells a joke.',
            priority: 5
        });
        this.addCommandDefinition({
            id: 'whats_my_schedule',
            patterns: [/^(what's|show me) my schedule (for )?(today|tomorrow|this week|on (.+?))?$/i],
            intent: { name: 'QueryCalendar', entities: { period: '$3' }, confidence: 0.9, rawUtterance: '' },
            description: 'Retrieves user\'s schedule for a specified period.',
            requiresContext: ['CalendarContext'],
            priority: 12
        });
        this.addCommandDefinition({
            id: 'find_document',
            patterns: [/^(find|locate|open) (a )?(document|file|report) named "(.+?)"$/i],
            intent: { name: 'SearchDocument', entities: { query: '$4' }, confidence: 0.85, rawUtterance: '' },
            description: 'Finds and opens a document by name.',
            requiresContext: ['ProductivityContext'],
            priority: 10
        });
        this.addCommandDefinition({
            id: 'start_timer',
            patterns: [/^(start|set) a timer for (\d+) (minutes?|seconds?|hours?)$/i],
            intent: { name: 'StartTimer', entities: { duration: '$2', unit: '$3' }, confidence: 0.95, rawUtterance: '' },
            description: 'Starts a timer for a specified duration.',
            priority: 10
        });
        this.addCommandDefinition({
            id: 'convert_units',
            patterns: [/^(convert) (\d+(\.\d+)?) (.+?) to (.+?)$/i],
            intent: { name: 'ConvertUnits', entities: { value: '$2', fromUnit: '$4', toUnit: '$5' }, confidence: 0.9, rawUtterance: '' },
            description: 'Converts a value from one unit to another.',
            priority: 9
        });
        this.addCommandDefinition({
            id: 'define_word',
            patterns: [/^(define) (.+?)$/i],
            intent: { name: 'DefineWord', entities: { word: '$2' }, confidence: 0.9, rawUtterance: '' },
            description: 'Provides the definition of a word.',
            priority: 8
        });
        this.addCommandDefinition({
            id: 'who_is',
            patterns: [/^(who is|tell me about) (.+?)$/i],
            intent: { name: 'QueryInformation', entities: { query: '$2' }, confidence: 0.85, rawUtterance: '' },
            description: 'Provides information about a person or entity.',
            requiresContext: ['InformationContext'],
            priority: 8
        });
    }

    public static getInstance(): NLPService {
        if (!NLPService.instance) {
            NLPService.instance = new NLPService();
        }
        return NLPService.instance;
    }

    public addCommandDefinition(command: VoiceCommandDefinition): void {
        this.commandDefinitions.push(command);
        // Sort by priority for better matching
        this.commandDefinitions.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    }

    public updateCommandDefinition(id: string, updates: Partial<VoiceCommandDefinition>): void {
        const index = this.commandDefinitions.findIndex(cmd => cmd.id === id);
        if (index !== -1) {
            this.commandDefinitions[index] = { ...this.commandDefinitions[index], ...updates };
        }
    }

    public removeCommandDefinition(id: string): void {
        this.commandDefinitions = this.commandDefinitions.filter(cmd => cmd.id !== id);
    }

    /**
     * Analyzes speech transcript to determine user intent and extract entities.
     * @param transcript The user's spoken utterance.
     * @param conversationState Current context to aid in resolution.
     * @returns A promise resolving to an Intent or null if no intent is matched.
     */
    public async processSpeech(transcript: string, conversationState: ConversationState): Promise<Intent | null> {
        console.log(`NLPService: Processing transcript "${transcript}" with contexts: ${conversationState.activeContexts.join(', ')}`);

        let bestMatch: { intent: Intent; score: number; cmd: VoiceCommandDefinition } | null = null;

        for (const cmd of this.commandDefinitions) {
            // Check if command is enabled
            if (cmd.enabled === false) continue;

            // Check context requirements
            const contextMet = !cmd.requiresContext || cmd.requiresContext.every(ctx => conversationState.activeContexts.includes(ctx));
            if (!contextMet) continue;

            for (const pattern of cmd.patterns) {
                const match = transcript.match(pattern);
                if (match) {
                    let score = cmd.priority || 5; // Base score from priority

                    // Calculate a simple confidence based on match length relative to transcript
                    score += (match[0].length / transcript.length) * 5;

                    if (!bestMatch || score > bestMatch.score) {
                        const entities: { [key: string]: any } = {};
                        if (cmd.intent.entities) {
                            for (const key in cmd.intent.entities) {
                                const entityValue = cmd.intent.entities[key];
                                if (typeof entityValue === 'string' && entityValue.startsWith('$')) {
                                    const matchIndex = parseInt(entityValue.substring(1), 10);
                                    if (matchIndex < match.length) {
                                        entities[key] = match[matchIndex] ? match[matchIndex].trim() : undefined;
                                    }
                                } else {
                                    entities[key] = entityValue;
                                }
                            }
                        }

                        // Sentiment analysis (mocked)
                        const sentimentScore = this.analyzeSentiment(transcript); // -1 (negative) to 1 (positive)

                        bestMatch = {
                            intent: {
                                ...cmd.intent,
                                entities: { ...entities, _sentiment: sentimentScore }, // Add sentiment as an entity
                                rawUtterance: transcript,
                                confidence: score / 20 // Normalize score for a 0-1 range
                            },
                            score: score,
                            cmd: cmd
                        };
                    }
                }
            }
        }

        if (bestMatch && bestMatch.intent.confidence > 0.3) { // Threshold for matching
            console.log('NLPService: Intent recognized:', bestMatch.intent.name, bestMatch.intent.entities);
            return bestMatch.intent;
        }

        console.log('NLPService: No strong intent matched for:', transcript);
        return null;
    }

    /**
     * Performs a simple sentiment analysis on the transcript.
     * @param transcript The text to analyze.
     * @returns A number between -1 (very negative) and 1 (very positive).
     */
    private analyzeSentiment(transcript: string): number {
        const lowerCaseTranscript = transcript.toLowerCase();
        let score = 0;
        if (lowerCaseTranscript.includes('please') || lowerCaseTranscript.includes('thank you')) score += 0.2;
        if (lowerCaseTranscript.includes('love') || lowerCaseTranscript.includes('great') || lowerCaseTranscript.includes('awesome')) score += 0.5;
        if (lowerCaseTranscript.includes('hate') || lowerCaseTranscript.includes('bad') || lowerCaseTranscript.includes('problem')) score -= 0.5;
        if (lowerCaseTranscript.includes('frustrated') || lowerCaseTranscript.includes('angry')) score -= 0.8;
        return Math.max(-1, Math.min(1, score));
    }

    /**
     * Allows dynamic expansion of the NLP's knowledge graph.
     * @param key Category or topic.
     * @param data Associated data.
     */
    public updateKnowledgeGraph(key: string, data: any): void {
        this.knowledgeGraph.set(key, data);
        console.log(`NLPService: Knowledge graph updated for ${key}`);
    }

    public queryKnowledgeGraph(key: string): any {
        return this.knowledgeGraph.get(key);
    }
}

/**
 * Service for Text-to-Speech (TTS) generation. Supports multiple voices and emotional tones.
 */
export class TextToSpeechService {
    private static instance: TextToSpeechService;
    private synthesis: SpeechSynthesis;
    private voices: SpeechSynthesisVoice[] = [];
    private defaultVoice: SpeechSynthesisVoice | null = null;
    private voiceQueue: SpeechSynthesisUtterance[] = [];
    private isSpeaking: boolean = false;

    private constructor() {
        if (!('speechSynthesis' in window)) {
            console.warn("Text-to-Speech not supported in this browser.");
            return;
        }
        this.synthesis = window.speechSynthesis;
        this.synthesis.onvoiceschanged = () => this.loadVoices();
        this.loadVoices();
    }

    public static getInstance(): TextToSpeechService {
        if (!TextToSpeechService.instance) {
            TextToSpeechService.instance = new TextToSpeechService();
        }
        return TextToSpeechService.instance;
    }

    private loadVoices() {
        this.voices = this.synthesis.getVoices();
        this.defaultVoice = this.voices.find(voice => voice.lang === 'en-US' && voice.name.includes('Google') || voice.default) || this.voices[0];
        console.log(`TTSService: Loaded ${this.voices.length} voices. Default: ${this.defaultVoice?.name}`);
    }

    public getAvailableVoices(): SpeechSynthesisVoice[] {
        return this.voices;
    }

    public async speak(text: string, options?: { voiceId?: string; rate?: number; pitch?: number; volume?: number; onBoundary?: (event: SpeechSynthesisEvent) => void }): Promise<void> {
        if (!this.synthesis) {
            console.warn("TTS not available.");
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = options?.voiceId ? this.voices.find(v => v.voiceURI === options.voiceId) || this.defaultVoice : this.defaultVoice;
            utterance.rate = options?.rate || 1;
            utterance.pitch = options?.pitch || 1;
            utterance.volume = options?.volume || 1;

            utterance.onend = () => {
                console.log(`TTSService: Finished speaking: "${text.substring(0, 50)}..."`);
                this.isSpeaking = false;
                this.processQueue();
                resolve();
            };
            utterance.onerror = (event) => {
                console.error('TTSService: SpeechSynthesisUtterance.onerror', event);
                this.isSpeaking = false;
                this.processQueue();
                reject(new Error(event.error));
            };
            if (options?.onBoundary) {
                utterance.onboundary = options.onBoundary;
            }

            this.voiceQueue.push(utterance);
            if (!this.isSpeaking) {
                this.processQueue();
            }
        });
    }

    private processQueue() {
        if (this.voiceQueue.length > 0 && !this.isSpeaking) {
            const nextUtterance = this.voiceQueue.shift();
            if (nextUtterance) {
                this.isSpeaking = true;
                this.synthesis.speak(nextUtterance);
            }
        }
    }

    public stop(): void {
        if (this.synthesis) {
            this.synthesis.cancel();
            this.isSpeaking = false;
            this.voiceQueue = []; // Clear queue
            console.log("TTSService: Speech stopped and queue cleared.");
        }
    }

    public getIsSpeaking(): boolean {
        return this.isSpeaking || this.synthesis.speaking;
    }
}

/**
 * Manages the ongoing conversation state, contexts, and history.
 * Essential for multi-turn dialogues and contextual understanding.
 */
export class ConversationManager {
    private static instance: ConversationManager;
    private currentState: ConversationState;
    private MAX_HISTORY_LENGTH = 20; // Keep last 20 segments

    private constructor() {
        this.currentState = {
            id: `conv-${Date.now()}`,
            history: [],
            intentsRecognized: [],
            activeContexts: ['General'], // Default context
            activeEntities: {},
            lastInteractionTime: Date.now(),
            turns: 0
        };
    }

    public static getInstance(): ConversationManager {
        if (!ConversationManager.instance) {
            ConversationManager.instance = new ConversationManager();
        }
        return ConversationManager.instance;
    }

    public getCurrentState(): ConversationState {
        return { ...this.currentState };
    }

    public addSpeechSegment(segment: SpeechSegment): void {
        this.currentState.history.push(segment);
        if (this.currentState.history.length > this.MAX_HISTORY_LENGTH) {
            this.currentState.history.shift();
        }
        this.currentState.lastInteractionTime = Date.now();
        this.currentState.turns++;
        console.log('ConversationManager: Speech segment added.');
    }

    public addIntent(intent: Intent): void {
        this.currentState.intentsRecognized.push(intent);
        if (this.currentState.intentsRecognized.length > this.MAX_HISTORY_LENGTH) {
            this.currentState.intentsRecognized.shift();
        }
        this.currentState.activeEntities = { ...this.currentState.activeEntities, ...intent.entities };
        console.log('ConversationManager: Intent added:', intent.name);
    }

    public updateContext(newContexts: string[], mode: 'add' | 'set' | 'remove' = 'add'): void {
        let contexts = new Set(this.currentState.activeContexts);
        if (mode === 'set') {
            contexts = new Set(newContexts);
        } else if (mode === 'add') {
            newContexts.forEach(ctx => contexts.add(ctx));
        } else if (mode === 'remove') {
            newContexts.forEach(ctx => contexts.delete(ctx));
        }
        this.currentState.activeContexts = Array.from(contexts);
        console.log('ConversationManager: Active contexts updated:', this.currentState.activeContexts);
    }

    public resetState(): void {
        this.currentState = {
            id: `conv-${Date.now()}`,
            history: [],
            intentsRecognized: [],
            activeContexts: ['General'],
            activeEntities: {},
            lastInteractionTime: Date.now(),
            turns: 0
        };
        console.log('ConversationManager: Conversation state reset.');
    }
}

/**
 * Manages user-specific voice profiles, learning, and personalization.
 * This would persist data in a backend or local storage.
 */
export class UserProfileService {
    private static instance: UserProfileService;
    private currentUserProfile: UserVoiceProfile;
    private nlpService: NLPService;

    private constructor() {
        this.nlpService = NLPService.getInstance();
        // Load or initialize default profile
        this.currentUserProfile = this.loadUserProfile() || {
            userId: 'default-user',
            preferredVoiceId: '', // Will be set by TTS service
            wakeWord: 'gemini',
            customCommands: [],
            ignoredPhrases: [],
            accentSettings: 'standard',
            voiceBiometricsEnabled: false,
            learningEnabled: true,
            proactiveSuggestionsEnabled: true,
            sentimentAnalysisEnabled: true
        };
        this.applyUserProfileToNLP();
        console.log('UserProfileService: Initialized for user:', this.currentUserProfile.userId);
    }

    public static getInstance(): UserProfileService {
        if (!UserProfileService.instance) {
            UserProfileService.instance = new UserProfileService();
        }
        return UserProfileService.instance;
    }

    private loadUserProfile(): UserVoiceProfile | null {
        try {
            const storedProfile = localStorage.getItem('userVoiceProfile');
            if (storedProfile) {
                return JSON.parse(storedProfile);
            }
        } catch (error) {
            console.error('Failed to load user profile:', error);
        }
        return null;
    }

    private saveUserProfile(): void {
        try {
            localStorage.setItem('userVoiceProfile', JSON.stringify(this.currentUserProfile));
            console.log('UserProfileService: User profile saved.');
        } catch (error) {
            console.error('Failed to save user profile:', error);
        }
    }

    private applyUserProfileToNLP(): void {
        this.currentUserProfile.customCommands.forEach(cmd => this.nlpService.addCommandDefinition(cmd));
        // Potentially update NLP settings based on accent, ignored phrases etc.
    }

    public getUserProfile(): UserVoiceProfile {
        return { ...this.currentUserProfile };
    }

    public updateProfile(updates: Partial<UserVoiceProfile>): void {
        this.currentUserProfile = { ...this.currentUserProfile, ...updates };
        // If wake word changes, notify voice engine
        // If custom commands change, update NLP
        if (updates.customCommands) {
            // Reapply all custom commands to NLP
            updates.customCommands.forEach(cmd => this.nlpService.updateCommandDefinition(cmd.id, cmd));
        }
        this.saveUserProfile();
        console.log('UserProfileService: Profile updated.');
    }

    public addCustomCommand(command: VoiceCommandDefinition): void {
        this.currentUserProfile.customCommands.push(command);
        this.nlpService.addCommandDefinition(command);
        this.saveUserProfile();
        console.log('UserProfileService: Custom command added.');
    }

    public removeCustomCommand(commandId: string): void {
        this.currentUserProfile.customCommands = this.currentUserProfile.customCommands.filter(cmd => cmd.id !== commandId);
        this.nlpService.removeCommandDefinition(commandId);
        this.saveUserProfile();
        console.log('UserProfileService: Custom command removed.');
    }

    /**
     * Simulates learning from user interactions.
     * In a real system, this would involve ML model retraining or data collection.
     */
    public learnFromInteraction(intent: Intent): void {
        if (!this.currentUserProfile.learningEnabled) return;
        // Example: if a user repeatedly uses a phrase for an existing command,
        // add that phrase as a pattern to a custom command or existing one.
        console.log(`UserProfileService: Learning from intent: ${intent.name}, utterance: "${intent.rawUtterance}"`);
        // This is where advanced ML logic would go to refine NLP models based on user behavior.
    }
}

/**
 * Orchestrates external API integrations.
 */
export class APIIntegrationOrchestrator {
    private static instance: APIIntegrationOrchestrator;
    private integrations: Map<string, APIIntegrationStatus> = new Map();

    private constructor() {
        this.initializeDefaultIntegrations();
    }

    public static getInstance(): APIIntegrationOrchestrator {
        if (!APIIntegrationOrchestrator.instance) {
            APIIntegrationOrchestrator.instance = new APIIntegrationOrchestrator();
        }
        return APIIntegrationOrchestrator.instance;
    }

    private initializeDefaultIntegrations() {
        this.integrations.set('FinancialService', {
            name: 'Financial Service',
            isEnabled: true,
            featuresSupported: ['FinancialDataQuery', 'CreateBudget', 'ProcessTransaction']
        });
        this.integrations.set('CalendarService', {
            name: 'Calendar Service',
            isEnabled: true,
            featuresSupported: ['SetReminder', 'ScheduleMeeting', 'QueryCalendar']
        });
        this.integrations.set('SmartHome', {
            name: 'Smart Home Integration',
            isEnabled: false,
            featuresSupported: ['SmartHomeControl']
        });
        this.integrations.set('HealthTracking', {
            name: 'Health Tracking',
            isEnabled: true,
            featuresSupported: ['LogHealthData', 'StartWellnessSession']
        });
        this.integrations.set('CreativeStudio', {
            name: 'Creative Studio',
            isEnabled: true,
            featuresSupported: ['CreativeDesign']
        });
        this.integrations.set('SocialMedia', {
            name: 'Social Media',
            isEnabled: false,
            featuresSupported: ['PostToSocialMedia']
        });
        this.integrations.set('Communication', {
            name: 'Communication Hub',
            isEnabled: true,
            featuresSupported: ['SummarizeCommunication', 'InitiateCall', 'SendMessage']
        });
        this.integrations.set('InformationProvider', {
            name: 'General Information Provider',
            isEnabled: true,
            featuresSupported: ['QueryWeatherData', 'QueryInformation', 'DefineWord']
        });
        this.integrations.set('ProductivitySuite', {
            name: 'Productivity Suite',
            isEnabled: true,
            featuresSupported: ['SearchDocument', 'StartTimer']
        });
        this.integrations.set('MediaPlayback', {
            name: 'Media Playback',
            isEnabled: true,
            featuresSupported: ['PlayMedia']
        });
        this.integrations.set('Localization', {
            name: 'Localization Service',
            isEnabled: true,
            featuresSupported: ['TranslateText']
        });
        console.log('APIIntegrationOrchestrator: Default integrations initialized.');
    }

    public getIntegrationStatus(name: string): APIIntegrationStatus | undefined {
        return this.integrations.get(name);
    }

    public setIntegrationEnabled(name: string, enabled: boolean): void {
        const status = this.integrations.get(name);
        if (status) {
            status.isEnabled = enabled;
            status.lastSync = Date.now();
            console.log(`APIIntegrationOrchestrator: Integration ${name} set to ${enabled ? 'enabled' : 'disabled'}.`);
        } else {
            console.warn(`APIIntegrationOrchestrator: Integration ${name} not found.`);
        }
    }

    public isFeatureSupported(featureName: string): boolean {
        for (const status of this.integrations.values()) {
            if (status.isEnabled && status.featuresSupported.includes(featureName)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Executes an action based on a recognized intent, routing to the appropriate (mocked) service.
     * In a real app, this would involve calling methods on other modules/services.
     * @returns A promise resolving to an AIResponse.
     */
    public async executeIntent(intent: Intent, setActiveView: (view: View) => void): Promise<AIResponse> {
        console.log(`APIIntegrationOrchestrator: Executing intent: ${intent.name}`);

        // Mock different service responses based on intent
        switch (intent.name) {
            case 'NavigateView': {
                const view = intent.entities?.view as View;
                if (Object.values(View).includes(view)) {
                    setActiveView(view);
                    return { text: `Navigating to your ${view}.`, visualFeedback: 'text' };
                }
                return { text: `I cannot navigate to the view: ${view}. Please specify a valid view like dashboard, transactions, or budgets.`, visualFeedback: 'text' };
            }
            case 'QueryFinancialData': {
                if (!this.isFeatureSupported('FinancialDataQuery')) {
                    return { text: "My financial data service is not enabled. Please enable it in settings.", visualFeedback: 'text' };
                }
                const type = intent.entities?.type;
                switch (type) {
                    case 'balance':
                        return { text: "Your current balance is $1,234.56. Would you like to see a breakdown?", visualFeedback: 'chart', followUpActions: [{ label: 'Show breakdown', intent: { name: 'QueryFinancialData', entities: { type: 'balance_breakdown' }, confidence: 1.0, rawUtterance: '' } }] };
                    case 'stock_price':
                        const symbol = intent.entities?.symbol;
                        return { text: `The current stock price for ${symbol} is $150.75.`, visualFeedback: 'text' };
                    default:
                        return { text: "I can query balances and stock prices. What specifically are you looking for?", visualFeedback: 'text' };
                }
            }
            case 'CreateBudget': {
                if (!this.isFeatureSupported('CreateBudget')) {
                    return { text: "Budget creation is not available. Please check your settings.", visualFeedback: 'text' };
                }
                const category = intent.entities?.category || 'Uncategorized';
                const amount = intent.entities?.amount || '0';
                // Imagine interacting with a budget service here
                return { text: `Creating a new budget for ${category} with an amount of $${amount}.`, visualFeedback: 'text' };
            }
            case 'SetReminder': {
                if (!this.isFeatureSupported('SetReminder')) {
                    return { text: "Reminder service is not active. Please enable it.", visualFeedback: 'text' };
                }
                const task = intent.entities?.task;
                const date = intent.entities?.date || 'today';
                const time = intent.entities?.time ? ` at ${intent.entities.time}` : '';
                return { text: `Okay, I've set a reminder to "${task}" for ${date}${time}.`, visualFeedback: 'text' };
            }
            case 'SearchLocalBusinesses': {
                const type = intent.entities?.type || 'businesses';
                const location = intent.entities?.location || 'your current location';
                return { text: `Searching for ${type} near ${location}. Showing results on the map.`, visualFeedback: 'map' };
            }
            case 'SmartHomeControl': {
                if (!this.isFeatureSupported('SmartHomeControl')) {
                    return { text: "Smart home integration is currently disabled. You can enable it in the settings.", visualFeedback: 'text' };
                }
                const action = intent.entities?.action;
                const device = intent.entities?.device;
                return { text: `Okay, ${action} the ${device}.`, visualFeedback: 'waveform' };
            }
            case 'LogHealthData': {
                if (!this.isFeatureSupported('LogHealthData')) {
                    return { text: "Health tracking is not enabled. Please enable it in settings to log data.", visualFeedback: 'text' };
                }
                const type = intent.entities?.type;
                const description = intent.entities?.description;
                const calories = intent.entities?.calories ? ` with ${intent.entities.calories} calories` : '';
                return { text: `Logged your ${type} of "${description}"${calories}.`, visualFeedback: 'text' };
            }
            case 'StartWellnessSession': {
                if (!this.isFeatureSupported('StartWellnessSession')) {
                    return { text: "Wellness features are disabled. Please enable them to start a session.", visualFeedback: 'text' };
                }
                const type = intent.entities?.type;
                const duration = intent.entities?.duration ? ` for ${intent.entities.duration} minutes` : '';
                return { text: `Starting a ${type} session${duration}. Relax and focus.`, visualFeedback: 'waveform' };
            }
            case 'SummarizeCommunication': {
                if (!this.isFeatureSupported('SummarizeCommunication')) {
                    return { text: "Communication summaries are unavailable due to disabled integration.", visualFeedback: 'text' };
                }
                const sender = intent.entities?.sender;
                return { text: `Summarizing the latest email from ${sender}: "Project update from Sarah, meeting postponed to next Tuesday."`, visualFeedback: 'text' };
            }
            case 'RecipeSuggestion': {
                const dish = intent.entities?.dish;
                const ingredients = intent.entities?.ingredients;
                return { text: `How about a classic Spaghetti Carbonara? You'll need eggs, bacon, cheese, and pasta.`, visualFeedback: 'text' };
            }
            case 'ScheduleMeeting': {
                if (!this.isFeatureSupported('ScheduleMeeting')) {
                    return { text: "Calendar integration is needed to schedule meetings. Please enable it.", visualFeedback: 'text' };
                }
                const participants = intent.entities?.participants;
                const date = intent.entities?.date || 'today';
                const time = intent.entities?.time ? ` at ${intent.entities.time}` : '';
                return { text: `Scheduling a meeting with ${participants} on ${date}${time}. I'll send out invites.`, visualFeedback: 'text' };
            }
            case 'PlayMedia': {
                if (!this.isFeatureSupported('PlayMedia')) {
                    return { text: "Media playback is not enabled. Please check your settings.", visualFeedback: 'text' };
                }
                const item = intent.entities?.item || 'music';
                const artist = intent.entities?.artist ? ` by ${intent.entities.artist}` : '';
                return { text: `Now playing "${item}"${artist}.`, visualFeedback: 'waveform' };
            }
            case 'OpenApplication': {
                const appName = intent.entities?.appName;
                return { text: `Opening the ${appName} application.`, visualFeedback: 'text' };
            }
            case 'CreativeDesign': {
                if (!this.isFeatureSupported('CreativeDesign')) {
                    return { text: "Creative studio features are not active. Enable them to use this command.", visualFeedback: 'text' };
                }
                const type = intent.entities?.type || 'graphic';
                const description = intent.entities?.description || 'a simple one';
                return { text: `Generating a ${type} image based on "${description}". Please wait a moment.`, visualFeedback: 'waveform' };
            }
            case 'PostToSocialMedia': {
                if (!this.isFeatureSupported('PostToSocialMedia')) {
                    return { text: "Social media posting is currently disabled. Enable it in settings.", visualFeedback: 'text' };
                }
                const content = intent.entities?.content;
                const platform = intent.entities?.platform;
                return { text: `Posting "${content.substring(0, 30)}..." to ${platform}.`, visualFeedback: 'text' };
            }
            case 'QueryWeatherData': {
                if (!this.isFeatureSupported('QueryWeatherData')) {
                    return { text: "Weather service is not available. Please check integrations.", visualFeedback: 'text' };
                }
                const location = intent.entities?.location || 'your current location';
                const date = intent.entities?.date || 'today';
                return { text: `The weather in ${location} ${date} will be partly cloudy with a high of 75 degrees Fahrenheit.`, visualFeedback: 'text' };
            }
            case 'InitiateCall': {
                if (!this.isFeatureSupported('InitiateCall')) {
                    return { text: "Calling functionality is not active. Enable communication features.", visualFeedback: 'text' };
                }
                const contact = intent.entities?.contact;
                return { text: `Calling ${contact} now.`, visualFeedback: 'text' };
            }
            case 'SendMessage': {
                if (!this.isFeatureSupported('SendMessage')) {
                    return { text: "Messaging functionality is not active. Enable communication features.", visualFeedback: 'text' };
                }
                const recipient = intent.entities?.recipient;
                const message = intent.entities?.message;
                return { text: `Sending message to ${recipient}: "${message}".`, visualFeedback: 'text' };
            }
            case 'CheckStockPrice': {
                if (!this.isFeatureSupported('QueryFinancialData')) {
                    return { text: "Financial data services are required to check stock prices. Please enable.", visualFeedback: 'text' };
                }
                const symbol = intent.entities?.symbol;
                return { text: `The stock price for ${symbol} is currently $150.75, up 1.2% today.`, visualFeedback: 'text' };
            }
            case 'TranslateText': {
                if (!this.isFeatureSupported('TranslateText')) {
                    return { text: "Translation services are not enabled. Please check language settings.", visualFeedback: 'text' };
                }
                const text = intent.entities?.text;
                const targetLanguage = intent.entities?.targetLanguage;
                return { text: `Translating "${text}" to ${targetLanguage}: "Hola mundo" (example).`, visualFeedback: 'text' };
            }
            case 'TellJoke': {
                const jokes = [
                    "Why don't scientists trust atoms? Because they make up everything!",
                    "Did you hear about the mathematician who’s afraid of negative numbers? He’ll stop at nothing to avoid them.",
                    "What do you call a fake noodle? An impasta!"
                ];
                const joke = jokes[Math.floor(Math.random() * jokes.length)];
                return { text: joke, visualFeedback: 'text' };
            }
            case 'QueryCalendar': {
                if (!this.isFeatureSupported('QueryCalendar')) {
                    return { text: "Calendar integration is disabled. Enable it to view your schedule.", visualFeedback: 'text' };
                }
                const period = intent.entities?.period || 'today';
                return { text: `Here's your schedule for ${period}: Meeting with Sarah at 10 AM, Lunch with Mark at 1 PM, Project review at 3 PM.`, visualFeedback: 'text' };
            }
            case 'SearchDocument': {
                if (!this.isFeatureSupported('SearchDocument')) {
                    return { text: "Document search is unavailable. Enable productivity features.", visualFeedback: 'text' };
                }
                const query = intent.entities?.query;
                return { text: `Searching for document "${query}". Found "Q4_Report_2023.pdf". Opening it now.`, visualFeedback: 'text' };
            }
            case 'StartTimer': {
                if (!this.isFeatureSupported('StartTimer')) {
                    return { text: "Timer functionality is not enabled. Please check settings.", visualFeedback: 'text' };
                }
                const duration = intent.entities?.duration;
                const unit = intent.entities?.unit;
                return { text: `Starting a ${duration} ${unit} timer.`, visualFeedback: 'text' };
            }
            case 'ConvertUnits': {
                const value = intent.entities?.value;
                const fromUnit = intent.entities?.fromUnit;
                const toUnit = intent.entities?.toUnit;
                // Mock conversion
                const convertedValue = (parseFloat(value) * 1.60934).toFixed(2); // Example: miles to km
                return { text: `${value} ${fromUnit} is approximately ${convertedValue} ${toUnit}.`, visualFeedback: 'text' };
            }
            case 'DefineWord': {
                if (!this.isFeatureSupported('DefineWord')) {
                    return { text: "Dictionary services are not enabled. Please check information integrations.", visualFeedback: 'text' };
                }
                const word = intent.entities?.word;
                return { text: `Definition of "${word}": (noun) a vocal utterance, a word or phrase, used as a command.`, visualFeedback: 'text' };
            }
            case 'QueryInformation': {
                if (!this.isFeatureSupported('QueryInformation')) {
                    return { text: "Information retrieval services are not enabled. Please check information integrations.", visualFeedback: 'text' };
                }
                const query = intent.entities?.query;
                return { text: `${query} is a pioneering figure in the field of artificial intelligence, known for their groundbreaking work on contextual language models.`, visualFeedback: 'text' };
            }
            // Add more cases for other features
            default:
                return { text: `I understood you wanted to ${intent.name}, but I'm not sure how to perform that action yet. Can you try rephrasing?`, visualFeedback: 'text' };
        }
    }
}

/**
 * Manages the Web Speech API (SpeechRecognition) and wake word detection.
 */
export class VoiceRecognitionEngine {
    private static instance: VoiceRecognitionEngine;
    private recognition: SpeechRecognition | null = null;
    private isListening: boolean = false;
    private wakeWord: string = "gemini"; // Default wake word
    private onSpeechRecognized: ((segment: SpeechSegment) => void) | null = null;
    private onFinalTranscript: ((transcript: string) => void) | null = null;
    private onListeningChange: ((listening: boolean) => void) | null = null;
    private onError: ((error: VoiceError) => void) | null = null;
    private currentPartialTranscript: string = '';
    private autoStopTimeout: ReturnType<typeof setTimeout> | null = null;
    private MAX_SILENCE_DURATION = 3000; // ms

    private constructor() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn("Speech Recognition API not supported in this browser.");
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true; // Keep listening
        this.recognition.interimResults = true; // Get results while speaking
        this.recognition.lang = 'en-US'; // Can be customized by UserProfileService later

        this.recognition.onstart = () => {
            console.log("Recognition started.");
            this.isListening = true;
            this.onListeningChange?.(true);
            this.resetAutoStopTimer();
        };

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
            this.resetAutoStopTimer();
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;
                const confidence = event.results[i][0].confidence;
                const isFinal = event.results[i].isFinal;

                if (isFinal) {
                    finalTranscript += transcript;
                    this.onSpeechRecognized?.({
                        id: `seg-${Date.now()}-${i}`,
                        transcript: transcript,
                        confidence: confidence,
                        timestamp: Date.now(),
                        isFinal: true
                    });
                } else {
                    interimTranscript += transcript;
                    this.onSpeechRecognized?.({
                        id: `seg-${Date.now()}-${i}`,
                        transcript: transcript,
                        confidence: confidence,
                        timestamp: Date.now(),
                        isFinal: false
                    });
                }
            }

            this.currentPartialTranscript = interimTranscript;
            if (finalTranscript) {
                this.onFinalTranscript?.(finalTranscript);
                this.currentPartialTranscript = ''; // Reset after final
            }
        };

        this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error("Recognition error:", event.error, event.message);
            this.isListening = false;
            this.onListeningChange?.(false);
            this.onError?.({
                type: 'recognition',
                message: event.message || event.error,
                code: event.error,
                timestamp: Date.now()
            });
            this.clearAutoStopTimer();
            this.recognition?.stop(); // Ensure it stops after an error
        };

        this.recognition.onend = () => {
            console.log("Recognition ended.");
            // If it ended unexpectedly and not by a manual stop, restart it if continuous
            if (this.isListening) { // Still desired to be listening
                console.log("Recognition unexpectedly ended, restarting...");
                this.startListening(true); // Restart with continuous flag
            } else {
                this.onListeningChange?.(false);
                this.clearAutoStopTimer();
            }
        };
    }

    public static getInstance(): VoiceRecognitionEngine {
        if (!VoiceRecognitionEngine.instance) {
            VoiceRecognitionEngine.instance = new VoiceRecognitionEngine();
        }
        return VoiceRecognitionEngine.instance;
    }

    public setCallbacks(
        onSpeechRecognized: ((segment: SpeechSegment) => void),
        onFinalTranscript: ((transcript: string) => void),
        onListeningChange: ((listening: boolean) => void),
        onError: ((error: VoiceError) => void)
    ): void {
        this.onSpeechRecognized = onSpeechRecognized;
        this.onFinalTranscript = onFinalTranscript;
        this.onListeningChange = onListeningChange;
        this.onError = onError;
    }

    public startListening(manualStart: boolean = false): void {
        if (!this.recognition) {
            this.onError?.({ type: 'system', message: "Speech Recognition not available.", timestamp: Date.now() });
            return;
        }
        if (this.isListening && !manualStart) {
            console.log("Already listening, not restarting.");
            return;
        }

        try {
            this.recognition.start();
            this.isListening = true;
            this.onListeningChange?.(true);
            console.log("VoiceRecognitionEngine: Listening started.");
            this.resetAutoStopTimer();
        } catch (e: any) {
            console.error("Error starting recognition:", e);
            this.isListening = false;
            this.onListeningChange?.(false);
            this.onError?.({ type: 'permission', message: e.message || "Failed to start recognition, check microphone permissions.", timestamp: Date.now() });
        }
    }

    public stopListening(): void {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            this.onListeningChange?.(false);
            console.log("VoiceRecognitionEngine: Listening stopped.");
            this.clearAutoStopTimer();
        }
    }

    public getIsListening(): boolean {
        return this.isListening;
    }

    public setWakeWord(word: string): void {
        this.wakeWord = word.toLowerCase();
        console.log(`VoiceRecognitionEngine: Wake word set to "${this.wakeWord}".`);
        // In a real system, this would configure an always-on hotword detection model.
    }

    private resetAutoStopTimer(): void {
        this.clearAutoStopTimer();
        this.autoStopTimeout = setTimeout(() => {
            if (this.isListening) {
                console.log("Auto-stopping listening due to prolonged silence.");
                this.stopListening();
            }
        }, this.MAX_SILENCE_DURATION);
    }

    private clearAutoStopTimer(): void {
        if (this.autoStopTimeout) {
            clearTimeout(this.autoStopTimeout);
            this.autoStopTimeout = null;
        }
    }
}

/**
 * Provides proactive suggestions based on user context and behavior.
 */
export class ProactiveSuggestionEngine {
    private static instance: ProactiveSuggestionEngine;
    private userProfileService: UserProfileService;
    private conversationManager: ConversationManager;
    private nlpService: NLPService;

    private constructor() {
        this.userProfileService = UserProfileService.getInstance();
        this.conversationManager = ConversationManager.getInstance();
        this.nlpService = NLPService.getInstance();
    }

    public static getInstance(): ProactiveSuggestionEngine {
        if (!ProactiveSuggestionEngine.instance) {
            ProactiveSuggestionEngine.instance = new ProactiveSuggestionEngine();
        }
        return ProactiveSuggestionEngine.instance;
    }

    /**
     * Generates a proactive suggestion based on current state and user profile.
     * @returns A promise resolving to an AIResponse if a suggestion is found, otherwise null.
     */
    public async getProactiveSuggestion(): Promise<AIResponse | null> {
        const userProfile = this.userProfileService.getUserProfile();
        if (!userProfile.proactiveSuggestionsEnabled) return null;

        const currentState = this.conversationManager.getCurrentState();
        const lastIntent = currentState.intentsRecognized[currentState.intentsRecognized.length - 1];

        // Example proactive logic:
        if (lastIntent?.name === 'QueryFinancialData' && lastIntent.entities?.type === 'balance') {
            // Suggest budget review if user just checked balance
            return {
                text: "Your balance is healthy. Would you like to review your monthly budget for 'Groceries'?",
                visualFeedback: 'chart',
                isProactive: true,
                followUpActions: [{ label: 'Review Groceries Budget', intent: { name: 'NavigateView', entities: { view: View.Budgets, category: 'Groceries' }, confidence: 1.0, rawUtterance: '' } }]
            };
        }
        if (currentState.activeContexts.includes('HealthTrackingContext') && currentState.lastInteractionTime < Date.now() - (60 * 60 * 1000) && currentState.turns > 5) {
            // If user has been in health context for a while and actively interacting, suggest a break/meditation
            return {
                text: "You've been very active in health tracking. Would you like to take a short meditation break?",
                visualFeedback: 'waveform',
                isProactive: true,
                followUpActions: [{ label: 'Start Meditation (10 min)', intent: { name: 'StartWellnessSession', entities: { type: 'meditation', duration: 10 }, confidence: 1.0, rawUtterance: '' } }]
            };
        }
        if (currentState.activeContexts.includes('ProductivityContext') && currentState.lastInteractionTime < Date.now() - (3 * 60 * 60 * 1000) && Math.random() > 0.7) { // Random chance after 3 hours
            // Suggest a reminder for common tasks if user has been productive
            return {
                text: "It's been a productive few hours. Do you want to set a reminder for your evening tasks?",
                visualFeedback: 'text',
                isProactive: true,
                followUpActions: [{ label: 'Set Evening Reminder', intent: { name: 'SetReminder', entities: { task: 'evening tasks', date: 'today', time: '19:00' }, confidence: 1.0, rawUtterance: '' } }]
            };
        }

        // More complex logic based on location, time of day, calendar events, habits etc.
        // E.g., "It's almost 5 PM, do you want to start your commute navigation?"
        // E.g., "You have a meeting in 15 minutes. Would you like a summary of the topic?"

        return null;
    }
}

/**
 * Service for handling multi-modal inputs (e.g., voice + touch/gesture).
 * Currently mocked to just process voice but designed for expansion.
 */
export class MultiModalInputProcessor {
    private static instance: MultiModalInputProcessor;

    private constructor() { }

    public static getInstance(): MultiModalInputProcessor {
        if (!MultiModalInputProcessor.instance) {
            MultiModalInputProcessor.instance = new MultiModalInputProcessor();
        }
        return MultiModalInputProcessor.instance;
    }

    public async processInput(voiceInput: SpeechSegment | null, visualInput: any | null): Promise<Intent | null> {
        console.log("MultiModalInputProcessor: Processing input...");
        // In a real system, this would combine information from various input streams
        // e.g., "Select this one" (voice) + user tapping on an item (visualInput)
        if (voiceInput) {
            // For now, just pass the voice input directly to NLP
            return NLPService.getInstance().processSpeech(voiceInput.transcript, ConversationManager.getInstance().getCurrentState());
        }
        return null;
    }
}

/**
 * VoiceControlContext for global access to voice services.
 */
interface VoiceControlContextType {
    isListening: boolean;
    isSpeaking: boolean;
    currentTranscript: string;
    startListening: () => void;
    stopListening: () => void;
    speak: (text: string, options?: { voiceId?: string; rate?: number; pitch?: number; volume?: number; }) => Promise<void>;
    processCommand: (transcript: string) => Promise<void>;
    conversationHistory: SpeechSegment[];
    aiResponses: AIResponse[];
    errors: VoiceError[];
    // Add access to other services if needed, e.g., userProfileService.getUserProfile()
}

export const VoiceControlContext = createContext<VoiceControlContextType | undefined>(undefined);

export const useVoiceControl = () => {
    const context = useContext(VoiceControlContext);
    if (context === undefined) {
        throw new Error('useVoiceControl must be used within a VoiceControlProvider');
    }
    return context;
};

// --- Main Voice Engine & Provider ---

export const VoiceControlProvider: React.FC<{ children: React.ReactNode; setActiveView: (view: View) => void }> = ({ children, setActiveView }) => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [conversationHistory, setConversationHistory] = useState<SpeechSegment[]>([]);
    const [aiResponses, setAiResponses] = useState<AIResponse[]>([]);
    const [errors, setErrors] = useState<VoiceError[]>([]);
    const [debouncedTranscript, setDebouncedTranscript] = useState('');

    const recognitionEngine = useRef(VoiceRecognitionEngine.getInstance());
    const nlpService = useRef(NLPService.getInstance());
    const ttsService = useRef(TextToSpeechService.getInstance());
    const conversationManager = useRef(ConversationManager.getInstance());
    const userProfileService = useRef(UserProfileService.getInstance());
    const apiOrchestrator = useRef(APIIntegrationOrchestrator.getInstance());
    const proactiveSuggestionEngine = useRef(ProactiveSuggestionEngine.getInstance());
    const multiModalInputProcessor = useRef(MultiModalInputProcessor.getInstance());

    // Initialize services and callbacks
    useEffect(() => {
        const engine = recognitionEngine.current;
        const manager = conversationManager.current;
        const profileService = userProfileService.current;
        const tts = ttsService.current;

        const handleSpeechRecognized = (segment: SpeechSegment) => {
            manager.addSpeechSegment(segment);
            setConversationHistory(manager.getCurrentState().history);
            if (!segment.isFinal) {
                setCurrentTranscript(segment.transcript);
            }
        };

        const handleFinalTranscript = async (transcript: string) => {
            console.log("Final Transcript:", transcript);
            setCurrentTranscript(''); // Clear interim
            setDebouncedTranscript(transcript); // Trigger processing via debounce
        };

        const handleListeningChange = (listening: boolean) => {
            setIsListening(listening);
        };

        const handleError = (error: VoiceError) => {
            console.error("Voice Control Error:", error);
            setErrors(prev => [...prev, error]);
            // If it's a recognition error, stop listening to avoid re-errors
            if (error.type === 'recognition' || error.type === 'permission') {
                engine.stopListening();
            }
            // Speak out the error if it's critical or actionable
            if (tts.getIsSpeaking()) tts.stop(); // Stop current speech to report error
            tts.speak(`I encountered an error: ${error.message}.`).then(() => setIsSpeaking(false));
            setIsSpeaking(true);
        };

        engine.setCallbacks(handleSpeechRecognized, handleFinalTranscript, handleListeningChange, handleError);

        // Periodically check for proactive suggestions
        const suggestionInterval = setInterval(async () => {
            const suggestion = await proactiveSuggestionEngine.current.getProactiveSuggestion();
            if (suggestion && !isListening && !isSpeaking) {
                console.log("Proactive suggestion:", suggestion.text);
                setAiResponses(prev => [...prev, suggestion]);
                tts.speak(suggestion.text).then(() => setIsSpeaking(false));
                setIsSpeaking(true);
            }
        }, 30000); // Check every 30 seconds

        // Cleanup
        return () => {
            engine.stopListening();
            tts.stop();
            clearInterval(suggestionInterval);
        };
    }, []);

    // Debounce for processing final transcripts to avoid rapid re-processing
    useEffect(() => {
        const handler = setTimeout(async () => {
            if (debouncedTranscript) {
                await processCommand(debouncedTranscript);
                setDebouncedTranscript(''); // Reset after processing
            }
        }, 200); // Small debounce

        return () => {
            clearTimeout(handler);
        };
    }, [debouncedTranscript]);

    const startListening = useCallback(() => {
        recognitionEngine.current.startListening(true); // Explicit manual start
        // TTS feedback: "Listening..."
        if (ttsService.current.getIsSpeaking()) ttsService.current.stop();
        ttsService.current.speak("Listening...").then(() => setIsSpeaking(false));
        setIsSpeaking(true);
    }, []);

    const stopListening = useCallback(() => {
        recognitionEngine.current.stopListening();
        // TTS feedback: "Okay, I've stopped listening."
        if (ttsService.current.getIsSpeaking()) ttsService.current.stop();
        ttsService.current.speak("Okay, I've stopped listening.").then(() => setIsSpeaking(false));
        setIsSpeaking(true);
    }, []);

    const speak = useCallback(async (text: string, options?: { voiceId?: string; rate?: number; pitch?: number; volume?: number; }) => {
        setIsSpeaking(true);
        await ttsService.current.speak(text, options);
        setIsSpeaking(false);
    }, []);

    const processCommand = useCallback(async (transcript: string) => {
        if (!transcript) return;

        // Immediately stop listening if we're processing a command, to avoid loop
        recognitionEngine.current.stopListening();

        console.log(`Processing command: "${transcript}"`);
        const currentState = conversationManager.current.getCurrentState();

        // Multi-modal input (mocked to just use voice for now)
        const intent = await multiModalInputProcessor.current.processInput({
            id: `final-seg-${Date.now()}`,
            transcript: transcript,
            confidence: 1.0, // Assume final transcript is high confidence
            timestamp: Date.now(),
            isFinal: true
        }, null);

        if (intent) {
            conversationManager.current.addIntent(intent);
            userProfileService.current.learnFromInteraction(intent); // AI learning
            const aiResponse = await apiOrchestrator.current.executeIntent(intent, setActiveView);
            setAiResponses(prev => [...prev, aiResponse]);
            // Speak the response
            if (ttsService.current.getIsSpeaking()) ttsService.current.stop();
            await ttsService.current.speak(aiResponse.text);
            setIsSpeaking(false);
            // Optionally, resume listening after a response if it's a multi-turn dialogue
            // recognitionEngine.current.startListening();
        } else {
            const noMatchResponse: AIResponse = { text: "I'm sorry, I didn't understand that. Could you please rephrase?", visualFeedback: 'text' };
            setAiResponses(prev => [...prev, noMatchResponse]);
            if (ttsService.current.getIsSpeaking()) ttsService.current.stop();
            await ttsService.current.speak(noMatchResponse.text);
            setIsSpeaking(false);
        }
    }, [setActiveView]);

    const contextValue: VoiceControlContextType = {
        isListening,
        isSpeaking,
        currentTranscript,
        startListening,
        stopListening,
        speak,
        processCommand,
        conversationHistory,
        aiResponses,
        errors,
    };

    return (
        <VoiceControlContext.Provider value={contextValue}>
            {children}
        </VoiceControlContext.Provider>
    );
};

// --- UI Components ---

const MicIcon = ({ className, pulsing = false }: { className?: string; pulsing?: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-8 w-8"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

export const VoiceFeedbackDisplay: React.FC = () => {
    const { isListening, currentTranscript, aiResponses, errors } = useVoiceControl();
    const latestResponse = aiResponses[aiResponses.length - 1];
    const latestError = errors[errors.length - 1];
    const displayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (displayRef.current) {
            displayRef.current.scrollTop = displayRef.current.scrollHeight;
        }
    }, [aiResponses, errors, currentTranscript]);

    return (
        <div ref={displayRef} className="fixed bottom-24 right-28 w-80 h-48 bg-gray-900 bg-opacity-80 backdrop-blur-md rounded-xl p-4 shadow-xl z-50 flex flex-col space-y-2 text-sm text-gray-200 overflow-y-auto">
            {isListening && <p className="text-cyan-400 font-bold">Listening: <span className="text-white">{currentTranscript || 'Say something...'}</span></p>}
            {latestResponse && (
                <div className={`p-2 rounded-lg ${latestResponse.isProactive ? 'bg-indigo-700/50' : 'bg-gray-700/50'} border border-gray-600`}>
                    <p className="text-gray-300 font-semibold">{latestResponse.isProactive ? 'Suggestion:' : 'AI Response:'}</p>
                    <p className="text-white">{latestResponse.text}</p>
                    {latestResponse.followUpActions && latestResponse.followUpActions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {latestResponse.followUpActions.map((action, index) => (
                                <button key={index} className="px-3 py-1 bg-cyan-600 text-white text-xs rounded-full hover:bg-cyan-500 transition-colors"
                                    onClick={() => NLPService.getInstance().processSpeech(action.label, ConversationManager.getInstance().getCurrentState())}>
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {latestError && (
                <div className="p-2 rounded-lg bg-red-800/50 border border-red-700">
                    <p className="text-red-300 font-semibold">Error:</p>
                    <p className="text-white">{latestError.message}</p>
                </div>
            )}
            {/* Future expansion: visualizers like waveform, charts, etc. */}
            {latestResponse?.visualFeedback === 'waveform' && isSpeaking && (
                <div className="h-10 w-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse-wave"></div>
            )}
            <style jsx>{`
                @keyframes pulse-wave {
                    0%, 100% { transform: scaleX(0.8); opacity: 0.8; }
                    50% { transform: scaleX(1.1); opacity: 1; }
                }
                .animate-pulse-wave { animation: pulse-wave 1.5s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

export const VoiceModal: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
    const { isListening, currentTranscript, processCommand, conversationHistory, aiResponses, speak } = useVoiceControl();
    const nlpService = NLPService.getInstance();
    const userProfile = UserProfileService.getInstance().getUserProfile();
    const [wakeWordHeard, setWakeWordHeard] = useState(false);
    const [hasAttemptedCommand, setHasAttemptedCommand] = useState(false);

    // Filter commands to show based on user profile or context
    const suggestedCommands = nlpService.commandDefinitions
        .filter(cmd => cmd.enabled !== false && (cmd.priority || 0) > 5) // Show only higher priority, enabled commands
        .slice(0, 6) // Limit for UI display
        .map(cmd => ({ label: cmd.description.split('.')[0] + '.', intent: cmd.intent }));

    useEffect(() => {
        // If wake word is enabled, check for it in the transcript
        if (userProfile.wakeWord && currentTranscript.toLowerCase().includes(userProfile.wakeWord.toLowerCase()) && !wakeWordHeard) {
            setWakeWordHeard(true);
            speak(`Yes, ${userProfile.userId || 'user'}. How may I assist you?`);
        }
    }, [currentTranscript, userProfile.wakeWord, wakeWordHeard, speak, userProfile.userId]);

    const handleCommandClick = (intent: Intent) => {
        processCommand(intent.rawUtterance || intent.name); // Use raw utterance if available, otherwise intent name
        setHasAttemptedCommand(true); // Indicate a command has been issued
        // onClose(); // Potentially close modal after command, or keep open for multi-turn
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in-slow" onClick={onClose}>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-10 max-w-2xl w-full text-center border-2 border-cyan-700 shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="relative w-32 h-32 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center mb-8 animate-pulse-fade">
                    <div className="absolute inset-0 rounded-full bg-cyan-500/30 animate-pulse-slow"></div>
                    <MicIcon className="h-16 w-16 text-cyan-300" />
                </div>
                <h3 className="text-3xl font-extrabold text-white mb-3 tracking-wide">
                    {isListening ? (wakeWordHeard ? "Ready to Assist." : "Listening...") : "Activating Voice Assistant..."}
                </h3>
                <p className="text-gray-300 mt-2 mb-8 text-lg">
                    {currentTranscript ? (
                        <span className="text-cyan-200 animate-fade-in-out">{currentTranscript}</span>
                    ) : (wakeWordHeard ? "What can I do for you?" : `Say "${userProfile.wakeWord}" or click a suggestion.`)}
                </p>

                {aiResponses.length > 0 && (
                    <div className="text-left bg-gray-700/30 p-4 rounded-xl mt-4 max-h-48 overflow-y-auto mb-6 border border-gray-600">
                        {aiResponses.slice(-3).map((res, index) => ( // Show last 3 AI responses
                            <div key={index} className="mb-2 last:mb-0">
                                <p className="text-sm text-indigo-300 font-semibold">{res.isProactive ? 'Proactive:' : 'AI:'}</p>
                                <p className="text-white text-base">{res.text}</p>
                            </div>
                        ))}
                    </div>
                )}

                <h4 className="text-xl font-semibold text-gray-200 mb-4">You can say things like:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suggestedCommands.map(cmd => (
                        <button key={cmd.intent.name} onClick={() => handleCommandClick(cmd.intent)}
                            className="w-full text-left p-4 bg-gray-700/60 hover:bg-gray-600/70 rounded-xl text-cyan-200 transition-all duration-200 shadow-md transform hover:scale-102 flex items-center group">
                            <span className="text-xl mr-3 opacity-70 group-hover:opacity-100 transition-opacity">💡</span>
                            <span className="flex-grow">"{cmd.label}"</span>
                            {/* Optional: Add icon based on intent */}
                        </button>
                    ))}
                    {userProfile.customCommands.slice(0, 2).map(cmd => ( // Show a couple of custom commands
                        <button key={cmd.id} onClick={() => handleCommandClick(cmd.intent)}
                            className="w-full text-left p-4 bg-purple-700/60 hover:bg-purple-600/70 rounded-xl text-purple-200 transition-all duration-200 shadow-md transform hover:scale-102 flex items-center group">
                            <span className="text-xl mr-3 opacity-70 group-hover:opacity-100 transition-opacity">✨</span>
                            <span className="flex-grow">"{cmd.description.split('.')[0] + ' (Custom)'}"</span>
                        </button>
                    ))}
                </div>
            </div>
            <style jsx>{`
                @keyframes fade-in-slow { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in-slow { animation: fade-in-slow 0.5s ease-out forwards; }

                @keyframes scale-in { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scale-in { animation: scale-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

                @keyframes pulse-fade {
                    0% { transform: scale(0.9); opacity: 0.5; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                    100% { transform: scale(0.9); opacity: 0.5; }
                }
                .animate-pulse-fade { animation: pulse-fade 2s ease-in-out infinite; }
                
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 0.3; }
                    50% { transform: scale(1.1); opacity: 0.6; }
                }
                .animate-pulse-slow { animation: pulse-slow 2.5s ease-out infinite; }

                @keyframes fade-in-out {
                    0% { opacity: 0.5; }
                    50% { opacity: 1; }
                    100% { opacity: 0.5; }
                }
                .animate-fade-in-out { animation: fade-in-out 1.5s infinite alternate; }
            `}</style>
        </div>
    );
};

export const PersistentVoiceCompanion: React.FC = () => {
    const { isListening, isSpeaking, startListening, stopListening } = useVoiceControl();
    const [isVisible, setIsVisible] = useState(true); // Always visible for companion
    const { preferredVoiceId, wakeWord } = UserProfileService.getInstance().getUserProfile();

    const getStatusText = () => {
        if (isSpeaking) return "Speaking...";
        if (isListening) return `Listening for "${wakeWord}"...`;
        return "Idle.";
    };

    return (
        <div className="fixed bottom-8 left-8 p-4 bg-gray-800/80 backdrop-blur-md rounded-full shadow-lg flex items-center text-white z-40 transition-all duration-300 transform hover:scale-105">
            <button
                onClick={isListening ? stopListening : startListening}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-red-600 hover:bg-red-500 animate-pulse' : 'bg-cyan-600 hover:bg-cyan-500'}`}
                aria-label={isListening ? "Stop Listening" : "Start Voice Control"}
            >
                <MicIcon className="h-6 w-6" pulsing={isListening} />
            </button>
            <div className="ml-3 mr-2">
                <p className="text-sm font-semibold">{getStatusText()}</p>
                {isSpeaking && <div className="h-2 w-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse-wave"></div>}
            </div>
            {/* Context menu or settings access */}
            <button className="text-gray-400 hover:text-white ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
            </button>
        </div>
    );
};

export const VoiceCustomizationPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const userProfileService = UserProfileService.getInstance();
    const ttsService = TextToSpeechService.getInstance();
    const [profile, setProfile] = useState(userProfileService.getUserProfile());
    const [newCommandText, setNewCommandText] = useState('');
    const [newCommandIntentName, setNewCommandIntentName] = useState('');

    const availableVoices = ttsService.getAvailableVoices();

    const handleProfileChange = (field: keyof UserVoiceProfile, value: any) => {
        setProfile(prev => ({ ...prev, [field]: value }));
        userProfileService.updateProfile({ [field]: value });
    };

    const handleAddCustomCommand = () => {
        if (newCommandText && newCommandIntentName) {
            const newCommand: VoiceCommandDefinition = {
                id: `custom_cmd_${Date.now()}`,
                patterns: [new RegExp(newCommandText, 'i')],
                intent: { name: newCommandIntentName, confidence: 1.0, rawUtterance: newCommandText },
                description: `Custom command: "${newCommandText}" to trigger ${newCommandIntentName}`,
                priority: 20, // High priority for custom commands
            };
            userProfileService.addCustomCommand(newCommand);
            setProfile(userProfileService.getUserProfile()); // Refresh profile
            setNewCommandText('');
            setNewCommandIntentName('');
        }
    };

    const handleTestVoice = (voiceId: string) => {
        ttsService.speak(`Hello, this is what my voice sounds like. My name is ${availableVoices.find(v => v.voiceURI === voiceId)?.name || 'unknown voice'}.`, { voiceId });
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full text-white border border-gray-700 animate-fade-in" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold mb-6">Voice Control Settings</h3>

                {/* Wake Word */}
                <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-bold mb-2">Wake Word</label>
                    <input
                        type="text"
                        value={profile.wakeWord}
                        onChange={(e) => handleProfileChange('wakeWord', e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
                    />
                </div>

                {/* Preferred Voice */}
                <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-bold mb-2">AI Voice</label>
                    <select
                        value={profile.preferredVoiceId}
                        onChange={(e) => { handleProfileChange('preferredVoiceId', e.target.value); handleTestVoice(e.target.value); }}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
                    >
                        <option value="">Default System Voice</option>
                        {availableVoices.map(voice => (
                            <option key={voice.voiceURI} value={voice.voiceURI}>
                                {voice.name} ({voice.lang})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Learning & Proactive Features */}
                <div className="mb-4 flex items-center justify-between">
                    <label className="text-gray-300 text-sm font-bold">Enable AI Learning</label>
                    <input
                        type="checkbox"
                        checked={profile.learningEnabled}
                        onChange={(e) => handleProfileChange('learningEnabled', e.target.checked)}
                        className="form-checkbox h-5 w-5 text-cyan-600 rounded"
                    />
                </div>
                <div className="mb-4 flex items-center justify-between">
                    <label className="text-gray-300 text-sm font-bold">Proactive Suggestions</label>
                    <input
                        type="checkbox"
                        checked={profile.proactiveSuggestionsEnabled}
                        onChange={(e) => handleProfileChange('proactiveSuggestionsEnabled', e.target.checked)}
                        className="form-checkbox h-5 w-5 text-cyan-600 rounded"
                    />
                </div>

                {/* Custom Commands */}
                <div className="mb-6 border-t border-gray-700 pt-4">
                    <h4 className="text-xl font-bold mb-4">Custom Commands</h4>
                    <div className="space-y-2 mb-4">
                        {profile.customCommands.length === 0 && <p className="text-gray-400">No custom commands added yet.</p>}
                        {profile.customCommands.map(cmd => (
                            <div key={cmd.id} className="flex justify-between items-center bg-gray-700/50 p-3 rounded-lg">
                                <span className="text-cyan-200">"{cmd.patterns[0]?.source}" → {cmd.intent.name}</span>
                                <button onClick={() => userProfileService.removeCustomCommand(cmd.id)} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col gap-2">
                        <input
                            type="text"
                            placeholder="e.g., 'send a quick note'"
                            value={newCommandText}
                            onChange={(e) => setNewCommandText(e.target.value)}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 bg-gray-700 border-gray-600"
                        />
                        <input
                            type="text"
                            placeholder="Intent name (e.g., 'SendMessage')"
                            value={newCommandIntentName}
                            onChange={(e) => setNewCommandIntentName(e.target.value)}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 bg-gray-700 border-gray-600"
                        />
                        <button onClick={handleAddCustomCommand} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition-colors">
                            Add Custom Command
                        </button>
                    </div>
                </div>

                {/* Integration Status (Read-only for now) */}
                <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-xl font-bold mb-4">API Integrations</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        {Array.from(APIIntegrationOrchestrator.getInstance().integrations.values()).map(integration => (
                            <div key={integration.name} className="flex items-center justify-between bg-gray-700/50 p-2 rounded-lg">
                                <span className="text-gray-300">{integration.name}</span>
                                <span className={`font-semibold ${integration.isEnabled ? 'text-green-400' : 'text-red-400'}`}>
                                    {integration.isEnabled ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                        ))}
                    </div>
                    <p className="text-gray-400 text-xs mt-4">Manage these integrations in the main app settings for full control.</p>
                </div>


                <button onClick={onClose} className="mt-8 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors w-full">
                    Close Settings
                </button>
            </div>
        </div>
    );
};


const VoiceControl: React.FC<VoiceControlProps> = ({ setActiveView }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { startListening, stopListening, isListening } = useVoiceControl();

    const openVoiceModal = () => {
        setIsModalOpen(true);
        startListening(); // Automatically start listening when modal opens
    };

    const closeVoiceModal = () => {
        setIsModalOpen(false);
        stopListening(); // Stop listening when modal closes
    };

    return (
        <VoiceControlProvider setActiveView={setActiveView}>
            {/* Main Activation Button */}
            <button
                onClick={openVoiceModal}
                className="fixed bottom-8 right-28 w-16 h-16 bg-cyan-600 hover:bg-cyan-500 rounded-full shadow-lg flex items-center justify-center text-white z-40 transition-transform hover:scale-110"
                aria-label="Activate Voice Control"
            >
                <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></div>
                <MicIcon />
            </button>

            {/* Settings Button */}
            <button
                onClick={() => setIsSettingsOpen(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-gray-700 hover:bg-gray-600 rounded-full shadow-lg flex items-center justify-center text-white z-40 transition-transform hover:scale-110"
                aria-label="Voice Control Settings"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>

            {/* Always-on companion (can be toggled in settings) */}
            <PersistentVoiceCompanion />

            {/* Voice Control Modal */}
            {isModalOpen && <VoiceModal onClose={closeVoiceModal} />}

            {/* Customization Panel */}
            {isSettingsOpen && <VoiceCustomizationPanel onClose={() => setIsSettingsOpen(false)} />}

            {/* Persistent Voice Feedback Display */}
            <VoiceFeedbackDisplay />
        </VoiceControlProvider>
    );
};

export default VoiceControl;
