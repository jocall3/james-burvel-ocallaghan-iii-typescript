import React, { createContext, useContext, useEffect, useCallback, useState, useRef } from 'react';
import {
    View, // Assuming View enum is available from a common types file or VoiceControl.tsx
    VoiceCommandDefinition,
    Intent,
    AIResponse,
    SpeechSegment,
    ConversationState,
    NLPService,
    ConversationManager,
    UserProfileService,
    APIIntegrationOrchestrator,
    ProactiveSuggestionEngine,
    useVoiceControl, // To leverage the main VoiceControlProvider's functions
    TextToSpeechService, // For direct speaking from this context if needed
} from '../VoiceControl'; // Adjust path as necessary if VoiceControl.tsx is moved

// Define the interface for the Financial Voice Control Context
export interface FinancialVoiceControlContextType {
    /**
     * Indicates whether the financial context is currently active within the application.
     * When true, financial-specific voice commands and proactive suggestions are prioritized.
     */
    isActive: boolean;
    /**
     * Allows components to programmatically trigger financial-related intents.
     * The intent will be processed by the underlying voice control system, leveraging the active financial context.
     * @param intent A partial Intent object describing the financial action to take.
     * @returns A Promise that resolves when the command has been processed.
     */
    triggerFinancialIntent: (intent: Partial<Intent>) => Promise<void>;
    /**
     * A utility function to make the AI speak a financial-related statement.
     * This might use specific voice settings or nuances for financial feedback.
     * @param text The text for the AI to speak.
     * @returns A Promise that resolves when the speaking is complete.
     */
    speakFinancialStatement: (text: string) => Promise<void>;
    /**
     * A method to explicitly request a financial-specific proactive suggestion.
     * Useful for UI elements that might want to hint at next actions.
     * @returns A promise resolving to an AIResponse if a suggestion is found, otherwise null.
     */
    getFinancialSuggestion: () => Promise<AIResponse | null>;
}

// Create the context
export const FinancialVoiceControlContext = createContext<FinancialVoiceControlContextType | undefined>(undefined);

/**
 * Custom hook to consume the Financial Voice Control Context.
 * Throws an error if used outside of a FinancialVoiceControlProvider.
 * @returns The FinancialVoiceControlContextType object.
 */
export const useFinancialVoiceControl = () => {
    const context = useContext(FinancialVoiceControlContext);
    if (context === undefined) {
        throw new Error('useFinancialVoiceControl must be used within a FinancialVoiceControlProvider');
    }
    return context;
};

/**
 * Provides a React context specifically for financial-related voice interactions.
 * This provider enhances the global voice control system by activating the 'FinancialContext',
 * adding specific financial commands, and potentially influencing proactive suggestions
 * when its child components are active.
 */
export const FinancialVoiceControlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { processCommand, speak } = useVoiceControl(); // Get core voice functions from the main provider
    const conversationManager = useRef(ConversationManager.getInstance());
    const nlpService = useRef(NLPService.getInstance());
    const userProfileService = useRef(UserProfileService.getInstance());
    const ttsService = useRef(TextToSpeechService.getInstance());
    const apiOrchestrator = useRef(APIIntegrationOrchestrator.getInstance()); // To check feature support for new intents
    const proactiveSuggestionEngine = useRef(ProactiveSuggestionEngine.getInstance());

    const FINANCIAL_CONTEXT_NAME = 'FinancialContext';
    const [isActive, setIsActive] = useState(false);

    // Define financial-specific commands that are active only within this context
    const financialCommands: VoiceCommandDefinition[] = [
        {
            id: 'transfer_funds',
            patterns: [/^(transfer|move) \$?(\d+(\.\d{1,2})?) (from|out of) (.+?) (to|into) (.+?)$/i],
            intent: { name: 'TransferFunds', entities: { amount: '$2', fromAccount: '$5', toAccount: '$7' }, confidence: 0.95, rawUtterance: '' },
            description: 'Transfers money between specified accounts (e.g., "transfer $100 from checking to savings").',
            requiresContext: [FINANCIAL_CONTEXT_NAME],
            priority: 18,
            enabled: true,
            permissionLevel: 'user' // Example of permission
        },
        {
            id: 'view_spending_by_category',
            patterns: [/^(show me|view|what's) my spending for (.+?)( in|for)? (this month|last month|today|this week|last week|this year|last year)?$/i],
            intent: { name: 'ViewSpendingByCategory', entities: { category: '$2', period: '$4' }, confidence: 0.90, rawUtterance: '' },
            description: 'Displays spending details for a given category and period (e.g., "show my spending for groceries last month").',
            requiresContext: [FINANCIAL_CONTEXT_NAME],
            priority: 16,
            enabled: true
        },
        {
            id: 'pay_bill',
            patterns: [/^(pay|make a payment on) my (.+?) bill (of|for) \$?(\d+(\.\d{1,2})?)( due on (.+?))?$/i],
            intent: { name: 'PayBill', entities: { billName: '$2', amount: '$4', dueDate: '$7' }, confidence: 0.93, rawUtterance: '' },
            description: 'Pays a specified bill (e.g., "pay my electricity bill for $75").',
            requiresContext: [FINANCIAL_CONTEXT_NAME],
            priority: 17,
            enabled: true
        },
        {
            id: 'add_expense',
            patterns: [/^(add|log) an? (expense|spending) (of|for) \$?(\d+(\.\d{1,2})?) for (.+?)$/i],
            intent: { name: 'AddExpense', entities: { amount: '$4', description: '$6' }, confidence: 0.88, rawUtterance: '' },
            description: 'Adds a new expense entry (e.g., "add an expense of $20 for coffee").',
            requiresContext: [FINANCIAL_CONTEXT_NAME],
            priority: 15,
            enabled: true
        }
    ];

    /**
     * Manages adding/removing financial-specific intent handlers to the APIIntegrationOrchestrator.
     * In a production environment, APIIntegrationOrchestrator would likely use a more robust
     * plugin system or a centralized intent router. For this blueprint, we're extending it directly.
     * This setup is a mock extension to demonstrate the intent handling flow.
     */
    const registerFinancialIntentHandlers = useCallback(() => {
        // Mock handler for 'TransferFunds'
        apiOrchestrator.current.addIntentHandler('TransferFunds', async (intent: Intent) => {
            if (!apiOrchestrator.current.isFeatureSupported('ProcessTransaction')) {
                return { text: "Funds transfer is not enabled. Please check your financial service integrations.", visualFeedback: 'text' };
            }
            const { amount, fromAccount, toAccount } = intent.entities || {};
            if (!amount || !fromAccount || !toAccount) {
                return { text: "I need the amount, source, and destination accounts to transfer funds.", visualFeedback: 'text' };
            }
            // Simulate API call
            console.log(`FinancialService: Transferring $${amount} from ${fromAccount} to ${toAccount}.`);
            return {
                text: `Transfer of $${amount} from ${fromAccount} to ${toAccount} has been initiated.`,
                visualFeedback: 'text',
                followUpActions: [{ label: 'View Transactions', intent: { name: 'NavigateView', entities: { view: View.Transactions }, confidence: 1.0, rawUtterance: 'view transactions' } }]
            };
        });

        // Mock handler for 'ViewSpendingByCategory'
        apiOrchestrator.current.addIntentHandler('ViewSpendingByCategory', async (intent: Intent) => {
            if (!apiOrchestrator.current.isFeatureSupported('FinancialDataQuery')) {
                return { text: "Financial data query is not enabled. Please check your financial service integrations.", visualFeedback: 'text' };
            }
            const { category, period } = intent.entities || {};
            // Simulate data retrieval
            const spendingAmount = Math.floor(Math.random() * 500) + 50; // Mock data
            return {
                text: `Your spending for ${category || 'all categories'} ${period || 'this month'} is approximately $${spendingAmount}. Would you like to see a detailed report?`,
                visualFeedback: 'chart',
                followUpActions: [{ label: 'Detailed Report', intent: { name: 'QueryFinancialData', entities: { type: 'detailed_spending', category, period }, confidence: 1.0, rawUtterance: 'show detailed report' } }]
            };
        });

        // Mock handler for 'PayBill'
        apiOrchestrator.current.addIntentHandler('PayBill', async (intent: Intent) => {
            if (!apiOrchestrator.current.isFeatureSupported('ProcessTransaction')) {
                return { text: "Bill payment functionality is not enabled. Please configure your financial services.", visualFeedback: 'text' };
            }
            const { billName, amount, dueDate } = intent.entities || {};
            if (!billName || !amount) {
                return { text: "I need the bill name and amount to process payment.", visualFeedback: 'text' };
            }
            // Simulate bill payment
            console.log(`FinancialService: Paying $${amount} for ${billName} bill. Due: ${dueDate || 'N/A'}.`);
            return {
                text: `Payment of $${amount} for your ${billName} bill has been successfully scheduled.`,
                visualFeedback: 'text'
            };
        });

        // Mock handler for 'AddExpense'
        apiOrchestrator.current.addIntentHandler('AddExpense', async (intent: Intent) => {
            if (!apiOrchestrator.current.isFeatureSupported('LogHealthData')) { // Reusing for now, ideally 'LogFinancialData'
                return { text: "Expense logging is not enabled. Please check your financial service integrations.", visualFeedback: 'text' };
            }
            const { amount, description } = intent.entities || {};
            if (!amount || !description) {
                return { text: "Please specify the amount and a brief description for the expense.", visualFeedback: 'text' };
            }
            // Simulate logging expense
            console.log(`FinancialService: Logging expense: $${amount} for ${description}.`);
            return {
                text: `Successfully logged an expense of $${amount} for "${description}".`,
                visualFeedback: 'text'
            };
        });
        console.log('FinancialVoiceContext: Registered financial intent handlers with API Orchestrator.');
    }, [apiOrchestrator]); // Dependency array to avoid re-creating handlers unnecessarily

    const unregisterFinancialIntentHandlers = useCallback(() => {
        apiOrchestrator.current.removeIntentHandler('TransferFunds');
        apiOrchestrator.current.removeIntentHandler('ViewSpendingByCategory');
        apiOrchestrator.current.removeIntentHandler('PayBill');
        apiOrchestrator.current.removeIntentHandler('AddExpense');
        console.log('FinancialVoiceContext: Unregistered financial intent handlers.');
    }, [apiOrchestrator]);

    // Effect for managing context and command lifecycle
    useEffect(() => {
        // On mount: Activate financial context
        conversationManager.current.updateContext([FINANCIAL_CONTEXT_NAME], 'add');
        setIsActive(true);

        // Add financial-specific commands to the NLP service
        financialCommands.forEach(cmd => {
            // Only add if not already present, to avoid duplicates on re-renders
            if (!nlpService.current.commandDefinitions.some(existingCmd => existingCmd.id === cmd.id)) {
                nlpService.current.addCommandDefinition(cmd);
            }
        });
        console.log(`FinancialVoiceContext: Activated "${FINANCIAL_CONTEXT_NAME}" and added specific commands.`);

        // Register custom intent handlers with the orchestrator
        registerFinancialIntentHandlers();

        // On unmount: Deactivate financial context and clean up commands/handlers
        return () => {
            conversationManager.current.updateContext([FINANCIAL_CONTEXT_NAME], 'remove');
            setIsActive(false);
            financialCommands.forEach(cmd => nlpService.current.removeCommandDefinition(cmd.id));
            unregisterFinancialIntentHandlers();
            console.log(`FinancialVoiceContext: Deactivated "${FINANCIAL_CONTEXT_NAME}" and removed specific commands/handlers.`);
        };
    }, [financialCommands, conversationManager, nlpService, registerFinancialIntentHandlers, unregisterFinancialIntentHandlers]);

    /**
     * Helper function to trigger financial-related intents.
     * It uses the main VoiceControlProvider's `processCommand` internally.
     */
    const triggerFinancialIntent = useCallback(async (intent: Partial<Intent>) => {
        const currentProfile = userProfileService.current.getUserProfile();
        // Construct a full intent object, ensuring it has rawUtterance for processing
        const fullIntent: Intent = {
            rawUtterance: intent.rawUtterance || intent.name || 'unspecified financial command',
            confidence: intent.confidence || 1.0,
            entities: { ...conversationManager.current.getCurrentState().activeEntities, ...intent.entities },
            name: intent.name || 'UnknownFinancialIntent'
        };

        // Pre-pend a 'fake' utterance that would typically trigger the intent,
        // so the `processCommand` (which often re-analyzes text) can work with it.
        // This is a common pattern when programmatically triggering intents that are
        // primarily designed for speech recognition.
        await processCommand(fullIntent.rawUtterance);
    }, [processCommand, userProfileService, conversationManager]);

    /**
     * AI speaks a given text using the user's preferred voice settings.
     */
    const speakFinancialStatement = useCallback(async (text: string) => {
        const currentProfile = userProfileService.current.getUserProfile();
        await speak(text, { voiceId: currentProfile.preferredVoiceId });
    }, [speak, userProfileService]);

    /**
     * Requests a financial-specific proactive suggestion.
     * This extends the existing ProactiveSuggestionEngine to focus on financial aspects.
     */
    const getFinancialSuggestion = useCallback(async (): Promise<AIResponse | null> => {
        const userProfile = userProfileService.current.getUserProfile();
        if (!userProfile.proactiveSuggestionsEnabled) return null;

        const currentState = conversationManager.current.getCurrentState();
        const lastIntent = currentState.intentsRecognized[currentState.intentsRecognized.length - 1];

        // Example: More refined proactive suggestions within the financial context
        if (currentState.activeContexts.includes(FINANCIAL_CONTEXT_NAME)) {
            if (lastIntent?.name === 'QueryFinancialData' && lastIntent.entities?.type === 'balance') {
                return {
                    text: "Your current balance is good. Would you like to review spending for your 'Dining' budget this month?",
                    visualFeedback: 'chart',
                    isProactive: true,
                    followUpActions: [{ label: 'Review Dining Budget', intent: { name: 'ViewSpendingByCategory', entities: { category: 'Dining', period: 'this month' }, confidence: 1.0, rawUtterance: 'show my dining spending this month' } }]
                };
            }
            if (lastIntent?.name === 'ViewSpendingByCategory' && lastIntent.entities?.category === 'Groceries' && Math.random() > 0.6) {
                return {
                    text: "You recently reviewed your grocery spending. Would you like to plan your grocery list for the week?",
                    visualFeedback: 'text',
                    isProactive: true,
                    followUpActions: [{ label: 'Plan Grocery List', intent: { name: 'SetReminder', entities: { task: 'plan grocery list', date: 'tomorrow' }, confidence: 1.0, rawUtterance: 'plan grocery list tomorrow' } }]
                };
            }
            // Generic financial context suggestions
            if (currentState.lastInteractionTime < Date.now() - (5 * 60 * 1000) && currentState.turns > 2 && Math.random() > 0.8) {
                return {
                    text: "You've been active in your financial section. Is there anything specific you need help with, like setting a new budget or tracking an expense?",
                    visualFeedback: 'text',
                    isProactive: true,
                    followUpActions: [
                        { label: 'Set New Budget', intent: { name: 'CreateBudget', confidence: 1.0, rawUtterance: 'create a new budget' } },
                        { label: 'Add Expense', intent: { name: 'AddExpense', confidence: 1.0, rawUtterance: 'add an expense' } }
                    ]
                };
            }
        }

        // Fallback to general proactive suggestions if no financial ones are relevant
        return proactiveSuggestionEngine.current.getProactiveSuggestion();
    }, [userProfileService, conversationManager, proactiveSuggestionEngine]);


    // The value provided by this context
    const contextValue: FinancialVoiceControlContextType = {
        isActive,
        triggerFinancialIntent,
        speakFinancialStatement,
        getFinancialSuggestion,
    };

    return (
        <FinancialVoiceControlContext.Provider value={contextValue}>
            {children}
        </FinancialVoiceControlContext.Provider>
    );
};

// Augment APIIntegrationOrchestrator with add/remove intent handler capabilities
// This is a necessary "patch" assuming APIIntegrationOrchestrator is a singleton in VoiceControl.tsx
// In a larger system, APIIntegrationOrchestrator would likely expose a proper plugin API.
declare module '../VoiceControl' {
    export class APIIntegrationOrchestrator {
        // This map would ideally be initialized in the constructor of APIIntegrationOrchestrator
        // in VoiceControl.tsx to be truly robust.
        private dynamicIntentHandlers: Map<string, (intent: Intent, setActiveView: (view: View) => void) => Promise<AIResponse>>;

        // Add these methods to APIIntegrationOrchestrator in VoiceControl.tsx
        // for this dynamic behavior to work correctly.
        public addIntentHandler(intentName: string, handler: (intent: Intent, setActiveView: (view: View) => void) => Promise<AIResponse>): void;
        public removeIntentHandler(intentName: string): void;
        // The existing executeIntent would also need modification to check dynamicIntentHandlers first.
        // Example:
        // public async executeIntent(intent: Intent, setActiveView: (view: View) => void): Promise<AIResponse> {
        //     if (this.dynamicIntentHandlers?.has(intent.name)) {
        //         return this.dynamicIntentHandlers.get(intent.name)!(intent, setActiveView);
        //     }
        //     // ... existing switch statement logic ...
        // }
    }
}

// Actual implementation of adding dynamic handlers to the singleton instance of APIIntegrationOrchestrator
// This is a workaround since we cannot modify VoiceControl.tsx directly.
// In a proper modular system, APIIntegrationOrchestrator would be designed for extensibility.
if (!(APIIntegrationOrchestrator.prototype as any).dynamicIntentHandlers) {
    (APIIntegrationOrchestrator.prototype as any).dynamicIntentHandlers = new Map();

    const originalExecuteIntent = APIIntegrationOrchestrator.prototype.executeIntent;
    APIIntegrationOrchestrator.prototype.executeIntent = async function (this: APIIntegrationOrchestrator, intent: Intent, setActiveView: (view: View) => void): Promise<AIResponse> {
        // Check dynamic handlers first
        if ((this as any).dynamicIntentHandlers.has(intent.name)) {
            console.log(`APIIntegrationOrchestrator: Executing dynamic handler for intent: ${intent.name}`);
            return (this as any).dynamicIntentHandlers.get(intent.name)!(intent, setActiveView);
        }
        // Fallback to original implementation if no dynamic handler is found
        return originalExecuteIntent.call(this, intent, setActiveView);
    };

    APIIntegrationOrchestrator.prototype.addIntentHandler = function (this: APIIntegrationOrchestrator, intentName: string, handler: (intent: Intent, setActiveView: (view: View) => void) => Promise<AIResponse>): void {
        (this as any).dynamicIntentHandlers.set(intentName, handler);
    };

    APIIntegrationOrchestrator.prototype.removeIntentHandler = function (this: APIIntegrationOrchestrator, intentName: string): void {
        (this as any).dynamicIntentHandlers.delete(intentName);
    };
    console.log("APIIntegrationOrchestrator: Dynamically augmented with intent handler capabilities.");
}