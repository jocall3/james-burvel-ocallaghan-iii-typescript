```typescript
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
    AgentManager, // For orchestrating agent interactions
    TransactionProcessor, // For simulating financial transactions
    DigitalIdentityService, // For identity verification and security
    LedgerService, // For token rail simulation
    PaymentRailService, // For payment routing and settlement
    AuditLogger, // For logging auditable events
    SecurityService, // For cryptographic operations and access control
} from '../VoiceControl'; // Adjust path as necessary if VoiceControl.tsx is moved

/**
 * Interface for the Financial Voice Control Context, providing advanced voice interaction capabilities
 * tailored for financial operations. This context enables users to interact with financial systems
 * using natural language, supporting agentic workflows, secure transactions, and proactive insights.
 *
 * Business Value: This context is a foundational component for transforming how users manage their finances.
 * It enables instant, intuitive access to financial services through voice, dramatically reducing friction
 * for high-value operations like fund transfers, bill payments, and budget management. By integrating
 * agentic AI, token rails, and digital identity, it provides a secure, efficient, and intelligent interface
 * that drives user engagement, automates complex financial tasks, and opens new pathways for service delivery
 * and revenue generation in a highly competitive market. It streamlines operations, enhances security through
 * multi-factor verification, and delivers a superior user experience, positioning the platform as a leader
 * in intelligent financial management.
 */
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
    triggerFinancialIntent: (intent: Partial<Intent>) => Promise<AIResponse>;
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
    /**
     * Initiates a secure financial transaction guided by the voice AI.
     * This method orchestrates the interaction with PaymentRailService and LedgerService,
     * incorporating digital identity verification and audit logging.
     * @param transactionDetails Details of the financial transaction to be processed.
     * @param requiresVerification Specifies if explicit identity verification is needed.
     * @returns A Promise resolving to an AIResponse indicating transaction status.
     */
    initiateSecureTransaction: (transactionDetails: FinancialTransactionDetails, requiresVerification?: boolean) => Promise<AIResponse>;
    /**
     * Triggers a specific financial agent to perform an action.
     * This allows direct interaction with the agentic AI layer for complex financial workflows.
     * @param agentId The identifier of the agent to trigger.
     * @param actionPayload The payload of the action for the agent to process.
     * @returns A Promise resolving to the agent's response.
     */
    triggerFinancialAgentAction: (agentId: string, actionPayload: Record<string, any>) => Promise<any>;
    /**
     * Retrieves the current balance for a specified account using the LedgerService.
     * @param accountId The identifier of the account.
     * @returns A Promise resolving to the account balance.
     */
    getAccountBalance: (accountId: string) => Promise<number>;
    /**
     * Provides access to the security context for financial operations,
     * including digital signature and verification capabilities.
     */
    securityContext: SecurityService;
}

/**
 * Represents the details of a financial transaction.
 * This structure ensures all necessary information is captured for secure and atomic settlement.
 */
export interface FinancialTransactionDetails {
    transactionId: string;
    senderAccountId: string;
    receiverAccountId: string;
    amount: number;
    currency: string;
    description: string;
    metadata?: Record<string, any>;
    idempotencyKey?: string;
    signingKeyId?: string; // Key ID for signing the transaction
}

// Create the context
export const FinancialVoiceControlContext = createContext<FinancialVoiceControlContextType | undefined>(undefined);

/**
 * Custom hook to consume the Financial Voice Control Context.
 * Throws an error if used outside of a FinancialVoiceControlProvider.
 *
 * Business Value: This hook simplifies access to a suite of advanced financial AI capabilities,
 * accelerating development of financial applications. It ensures consistent and secure interaction
 * patterns, reducing integration costs and time-to-market for new voice-enabled financial products.
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
 * when its child components are active. It integrates deeply with agentic AI, token rails,
 * digital identity, and real-time payments infrastructure to offer a comprehensive,
 * commercial-grade financial voice interface.
 *
 * Business Value: This provider encapsulates the complex orchestration of AI, identity, and payment
 * systems into a single, high-value component. It ensures secure, auditable, and intelligent financial
 * interactions, enabling the platform to offer cutting-edge voice banking and payment solutions.
 * By abstracting underlying complexities, it empowers developers to rapidly build feature-rich,
 * compliant financial applications that leverage the full power of agentic AI for automated financial
 * management, fraud detection, and personalized customer experiences, driving competitive advantage
 * and new revenue streams.
 */
export const FinancialVoiceControlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { processCommand, speak } = useVoiceControl(); // Get core voice functions from the main provider
    const conversationManager = useRef(ConversationManager.getInstance());
    const nlpService = useRef(NLPService.getInstance());
    const userProfileService = useRef(UserProfileService.getInstance());
    const ttsService = useRef(TextToSpeechService.getInstance());
    const apiOrchestrator = useRef(APIIntegrationOrchestrator.getInstance()); // To check feature support for new intents
    const proactiveSuggestionEngine = useRef(ProactiveSuggestionEngine.getInstance());
    const agentManager = useRef(AgentManager.getInstance()); // For AI agent orchestration
    const transactionProcessor = useRef(TransactionProcessor.getInstance()); // For simulating financial transactions
    const digitalIdentityService = useRef(DigitalIdentityService.getInstance()); // For identity verification
    const ledgerService = useRef(LedgerService.getInstance()); // For token rail simulation
    const paymentRailService = useRef(PaymentRailService.getInstance()); // For payment routing and settlement
    const auditLogger = useRef(AuditLogger.getInstance()); // For logging auditable events
    const securityService = useRef(SecurityService.getInstance()); // For cryptographic operations and access control

    const FINANCIAL_CONTEXT_NAME = 'FinancialContext';
    const [isActive, setIsActive] = useState(false);

    const financialCommands: VoiceCommandDefinition[] = [
        {
            id: 'transfer_funds',
            patterns: [/^(transfer|move) \$?(\d+(\.\d{1,2})?) (from|out of) (.+?) (to|into) (.+?)$/i],
            intent: { name: 'TransferFunds', entities: { amount: '$2', fromAccount: '$5', toAccount: '$7' }, confidence: 0.95, rawUtterance: '' },
            description: 'Transfers money between specified accounts (e.g., "transfer $100 from checking to savings"). This command leverages secure token rails and identity verification.',
            requiresContext: [FINANCIAL_CONTEXT_NAME],
            priority: 18,
            enabled: true,
            permissionLevel: 'user'
        },
        {
            id: 'view_spending_by_category',
            patterns: [/^(show me|view|what's) my spending for (.+?)( in|for)? (this month|last month|today|this week|last week|this year|last year)?$/i],
            intent: { name: 'ViewSpendingByCategory', entities: { category: '$2', period: '$4' }, confidence: 0.90, rawUtterance: '' },
            description: 'Displays spending details for a given category and period (e.g., "show my spending for groceries last month"). Data retrieval is secure and role-based.',
            requiresContext: [FINANCIAL_CONTEXT_NAME],
            priority: 16,
            enabled: true
        },
        {
            id: 'pay_bill',
            patterns: [/^(pay|make a payment on) my (.+?) bill (of|for) \$?(\d+(\.\d{1,2})?)( due on (.+?))?$/i],
            intent: { name: 'PayBill', entities: { billName: '$2', amount: '$4', dueDate: '$7' }, confidence: 0.93, rawUtterance: '' },
            description: 'Pays a specified bill (e.g., "pay my electricity bill for $75"). Payments are processed via secure rails with idempotency guarantees.',
            requiresContext: [FINANCIAL_CONTEXT_NAME],
            priority: 17,
            enabled: true
        },
        {
            id: 'add_expense',
            patterns: [/^(add|log) an? (expense|spending) (of|for) \$?(\d+(\.\d{1,2})?) for (.+?)$/i],
            intent: { name: 'AddExpense', entities: { amount: '$4', description: '$6' }, confidence: 0.88, rawUtterance: '' },
            description: 'Adds a new expense entry (e.g., "add an expense of $20 for coffee"). This is logged and available for financial analytics.',
            requiresContext: [FINANCIAL_CONTEXT_NAME],
            priority: 15,
            enabled: true
        },
        {
            id: 'check_balance',
            patterns: [/^(what's|show me|check) my balance( for)? (.+?)?$/i],
            intent: { name: 'CheckBalance', entities: { accountName: '$3' }, confidence: 0.92, rawUtterance: '' },
            description: 'Checks the balance for a specified account (e.g., "check my checking account balance" or "what\'s my balance").',
            requiresContext: [FINANCIAL_CONTEXT_NAME],
            priority: 16,
            enabled: true
        },
        {
            id: 'create_budget',
            patterns: [/^(create|set up|make) a new budget for (.+?) (of|for) \$?(\d+(\.\d{1,2})?)( per (month|week|year))?$/i],
            intent: { name: 'CreateBudget', entities: { category: '$2', amount: '$4', period: '$7' }, confidence: 0.90, rawUtterance: '' },
            description: 'Creates a new budget for a category with a specified amount and period (e.g., "create a new budget for groceries of $500 per month").',
            requiresContext: [FINANCIAL_CONTEXT_NAME],
            priority: 14,
            enabled: true
        }
    ];

    const registerFinancialIntentHandlers = useCallback(() => {
        apiOrchestrator.current.addIntentHandler('TransferFunds', async (intent: Intent, setActiveView: (view: View) => void) => {
            const userId = userProfileService.current.getUserProfile().userId; // Get current user ID
            if (!userId || !securityService.current.hasPermission(userId, 'financial:transfer')) {
                auditLogger.current.log('AUTH_DENIED', { userId, intent: intent.name, reason: 'Insufficient permissions for TransferFunds' });
                return { text: "You do not have permission to transfer funds. Please verify your identity or roles.", visualFeedback: 'text' };
            }

            if (!apiOrchestrator.current.isFeatureSupported('ProcessTransaction')) {
                return { text: "Funds transfer is not enabled. Please check your financial service integrations.", visualFeedback: 'text' };
            }
            const { amount, fromAccount, toAccount } = intent.entities || {};
            if (!amount || !fromAccount || !toAccount) {
                return { text: "I need the amount, source, and destination accounts to transfer funds.", visualFeedback: 'text' };
            }

            const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const idempotencyKey = `${userId}-${transactionId}`;
            const signingKeyId = userProfileService.current.getUserProfile().signingKeyId || 'default-user-key'; // Assumed user has a signing key

            try {
                // Simulate identity verification for high-value transactions or sensitive operations
                const verificationNeeded = parseFloat(amount) > 1000 || Math.random() < 0.2; // Example logic
                if (verificationNeeded) {
                    const verified = await digitalIdentityService.current.verifyIdentity(userId, 'high_value_transaction_challenge');
                    if (!verified) {
                        auditLogger.current.log('IDENTITY_FAILED', { userId, intent: intent.name, transactionId, reason: 'Identity verification failed' });
                        return { text: "Identity verification failed. Please try again.", visualFeedback: 'text' };
                    }
                }

                auditLogger.current.log('TRANSACTION_INITIATED', { userId, transactionId, intent: intent.name, amount, fromAccount, toAccount });

                const txResponse = await paymentRailService.current.initiatePayment({
                    transactionId,
                    senderAccountId: fromAccount,
                    receiverAccountId: toAccount,
                    amount: parseFloat(amount),
                    currency: 'USD', // Hardcoded for simulation
                    description: `Voice-initiated transfer from ${fromAccount} to ${toAccount}`,
                    idempotencyKey,
                    signingKeyId,
                    metadata: { voiceIntent: intent.name }
                }, 'rail_fast'); // Route via 'rail_fast' for transfers

                if (txResponse.status === 'SETTLED' || txResponse.status === 'PENDING') {
                    auditLogger.current.log('TRANSACTION_SUCCESS', { userId, transactionId, paymentRailResponse: txResponse });
                    return {
                        text: `Transfer of $${amount} from ${fromAccount} to ${toAccount} has been ${txResponse.status === 'SETTLED' ? 'completed' : 'initiated'}. Transaction ID: ${transactionId}.`,
                        visualFeedback: 'text',
                        followUpActions: [{ label: 'View Transactions', intent: { name: 'NavigateView', entities: { view: View.Transactions }, confidence: 1.0, rawUtterance: 'view transactions' } }]
                    };
                } else {
                    auditLogger.current.log('TRANSACTION_FAILED', { userId, transactionId, paymentRailResponse: txResponse });
                    return { text: `Failed to process transfer: ${txResponse.errorMessage || 'Unknown error'}. Please try again later.`, visualFeedback: 'text' };
                }
            } catch (error: any) {
                auditLogger.current.log('TRANSACTION_ERROR', { userId, transactionId, intent: intent.name, error: error.message });
                console.error("Error processing TransferFunds:", error);
                return { text: `An error occurred during the transfer: ${error.message}. Please contact support.`, visualFeedback: 'text' };
            }
        });

        apiOrchestrator.current.addIntentHandler('ViewSpendingByCategory', async (intent: Intent, setActiveView: (view: View) => void) => {
            const userId = userProfileService.current.getUserProfile().userId;
            if (!userId || !securityService.current.hasPermission(userId, 'financial:view_spending')) {
                auditLogger.current.log('AUTH_DENIED', { userId, intent: intent.name, reason: 'Insufficient permissions for ViewSpendingByCategory' });
                return { text: "You do not have permission to view spending reports.", visualFeedback: 'text' };
            }

            if (!apiOrchestrator.current.isFeatureSupported('FinancialDataQuery')) {
                return { text: "Financial data query is not enabled. Please check your financial service integrations.", visualFeedback: 'text' };
            }
            const { category, period } = intent.entities || {};
            // Simulate data retrieval from LedgerService
            const spendingAmount = ledgerService.current.getAccountBalance('user-spending-account') * (Math.random() * 0.1 + 0.05); // Mock data based on a base balance
            auditLogger.current.log('DATA_QUERY', { userId, intent: intent.name, category, period, result: spendingAmount });

            return {
                text: `Your spending for ${category || 'all categories'} ${period || 'this month'} is approximately $${spendingAmount.toFixed(2)}. Would you like to see a detailed report?`,
                visualFeedback: 'chart',
                followUpActions: [{ label: 'Detailed Report', intent: { name: 'QueryFinancialData', entities: { type: 'detailed_spending', category, period }, confidence: 1.0, rawUtterance: 'show detailed report' } }]
            };
        });

        apiOrchestrator.current.addIntentHandler('PayBill', async (intent: Intent, setActiveView: (view: View) => void) => {
            const userId = userProfileService.current.getUserProfile().userId;
            if (!userId || !securityService.current.hasPermission(userId, 'financial:pay_bill')) {
                auditLogger.current.log('AUTH_DENIED', { userId, intent: intent.name, reason: 'Insufficient permissions for PayBill' });
                return { text: "You do not have permission to pay bills. Please verify your identity or roles.", visualFeedback: 'text' };
            }

            if (!apiOrchestrator.current.isFeatureSupported('ProcessTransaction')) {
                return { text: "Bill payment functionality is not enabled. Please configure your financial services.", visualFeedback: 'text' };
            }
            const { billName, amount, dueDate } = intent.entities || {};
            if (!billName || !amount) {
                return { text: "I need the bill name and amount to process payment.", visualFeedback: 'text' };
            }

            const transactionId = `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const idempotencyKey = `${userId}-${transactionId}`;
            const signingKeyId = userProfileService.current.getUserProfile().signingKeyId || 'default-user-key';

            try {
                auditLogger.current.log('BILL_PAYMENT_INITIATED', { userId, transactionId, billName, amount, dueDate });

                // Use the agent manager for more complex bill payment orchestration, e.g., fetching bill details,
                // determining best payment rail, scheduling.
                const agentResponse = await agentManager.current.triggerAgent('PaymentOrchestrationAgent', {
                    action: 'processBillPayment',
                    payload: {
                        transactionId,
                        senderAccountId: 'user-checking', // Example sender account
                        receiverAccountId: billName.replace(/\s/g, '-').toLowerCase() + '-vendor', // Mock vendor account
                        amount: parseFloat(amount),
                        currency: 'USD',
                        description: `Payment for ${billName} bill`,
                        dueDate,
                        idempotencyKey,
                        signingKeyId,
                        priority: 'normal' // Agent can decide rail based on priority
                    }
                });

                if (agentResponse?.status === 'SUCCESS' || agentResponse?.status === 'SCHEDULED') {
                    auditLogger.current.log('BILL_PAYMENT_SUCCESS', { userId, transactionId, agentResponse });
                    return {
                        text: `Payment of $${amount} for your ${billName} bill has been successfully ${agentResponse.status === 'SUCCESS' ? 'processed' : 'scheduled'}.`,
                        visualFeedback: 'text'
                    };
                } else {
                    auditLogger.current.log('BILL_PAYMENT_FAILED', { userId, transactionId, agentResponse, reason: agentResponse?.message || 'Agent processing failed' });
                    return { text: `Failed to schedule payment for ${billName}: ${agentResponse?.message || 'Unknown error'}. Please try again.`, visualFeedback: 'text' };
                }
            } catch (error: any) {
                auditLogger.current.log('BILL_PAYMENT_ERROR', { userId, transactionId, error: error.message });
                console.error("Error processing PayBill:", error);
                return { text: `An error occurred while paying the bill: ${error.message}. Please contact support.`, visualFeedback: 'text' };
            }
        });

        apiOrchestrator.current.addIntentHandler('AddExpense', async (intent: Intent, setActiveView: (view: View) => void) => {
            const userId = userProfileService.current.getUserProfile().userId;
            if (!userId || !securityService.current.hasPermission(userId, 'financial:add_expense')) {
                auditLogger.current.log('AUTH_DENIED', { userId, intent: intent.name, reason: 'Insufficient permissions for AddExpense' });
                return { text: "You do not have permission to add expenses.", visualFeedback: 'text' };
            }

            if (!apiOrchestrator.current.isFeatureSupported('LogFinancialData')) { // Assuming a more appropriate feature flag now
                return { text: "Expense logging is not enabled. Please check your financial service integrations.", visualFeedback: 'text' };
            }
            const { amount, description } = intent.entities || {};
            if (!amount || !description) {
                return { text: "Please specify the amount and a brief description for the expense.", visualFeedback: 'text' };
            }
            const expenseId = `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            ledgerService.current.recordTransaction({
                transactionId: expenseId,
                senderAccountId: 'user-spending', // This could be a virtual account for tracking expenses
                receiverAccountId: 'expense-category:' + description.split(' ')[0].toLowerCase(), // Categorize by first word
                amount: parseFloat(amount),
                currency: 'USD',
                description: description,
                timestamp: Date.now(),
                type: 'EXPENSE',
                metadata: { userId, voiceIntent: intent.name }
            });
            auditLogger.current.log('EXPENSE_ADDED', { userId, expenseId, amount, description });

            return {
                text: `Successfully logged an expense of $${amount} for "${description}".`,
                visualFeedback: 'text'
            };
        });

        apiOrchestrator.current.addIntentHandler('CheckBalance', async (intent: Intent, setActiveView: (view: View) => void) => {
            const userId = userProfileService.current.getUserProfile().userId;
            if (!userId || !securityService.current.hasPermission(userId, 'financial:view_balance')) {
                auditLogger.current.log('AUTH_DENIED', { userId, intent: intent.name, reason: 'Insufficient permissions for CheckBalance' });
                return { text: "You do not have permission to check balances.", visualFeedback: 'text' };
            }

            const { accountName } = intent.entities || {};
            const userAccounts = userProfileService.current.getUserProfile().accounts || ['checking', 'savings']; // Mock user accounts

            let targetAccount = 'primary-account'; // Default to a primary account
            if (accountName) {
                const matchedAccount = userAccounts.find(acc => accountName.toLowerCase().includes(acc.toLowerCase()));
                if (matchedAccount) {
                    targetAccount = matchedAccount;
                } else {
                    return { text: `I couldn't find an account named "${accountName}". I can check your primary accounts like checking or savings.`, visualFeedback: 'text' };
                }
            }

            try {
                const balance = await ledgerService.current.getAccountBalance(targetAccount);
                auditLogger.current.log('BALANCE_CHECKED', { userId, account: targetAccount, balance });
                return {
                    text: `Your ${targetAccount} balance is $${balance.toFixed(2)}.`,
                    visualFeedback: 'text'
                };
            } catch (error: any) {
                auditLogger.current.log('BALANCE_CHECK_FAILED', { userId, account: targetAccount, error: error.message });
                console.error(`Error checking balance for ${targetAccount}:`, error);
                return { text: `I encountered an error while retrieving the balance for ${targetAccount}. Please try again later.`, visualFeedback: 'text' };
            }
        });

        apiOrchestrator.current.addIntentHandler('CreateBudget', async (intent: Intent, setActiveView: (view: View) => void) => {
            const userId = userProfileService.current.getUserProfile().userId;
            if (!userId || !securityService.current.hasPermission(userId, 'financial:manage_budget')) {
                auditLogger.current.log('AUTH_DENIED', { userId, intent: intent.name, reason: 'Insufficient permissions for CreateBudget' });
                return { text: "You do not have permission to create budgets.", visualFeedback: 'text' };
            }

            const { category, amount, period } = intent.entities || {};
            if (!category || !amount) {
                return { text: "I need a category and an amount to create a budget.", visualFeedback: 'text' };
            }

            // Simulate creating a budget entry (e.g., in a BudgetingService or user profile)
            console.log(`FinancialService: Creating budget for ${category}: $${amount} per ${period || 'month'}.`);
            auditLogger.current.log('BUDGET_CREATED', { userId, category, amount, period });

            return {
                text: `I've created a budget for ${category} of $${amount} per ${period || 'month'}.`,
                visualFeedback: 'text'
            };
        });

        console.log('FinancialVoiceContext: Registered enhanced financial intent handlers with API Orchestrator.');
    }, [apiOrchestrator, userProfileService, digitalIdentityService, ledgerService, paymentRailService, auditLogger, securityService, agentManager]);

    const unregisterFinancialIntentHandlers = useCallback(() => {
        apiOrchestrator.current.removeIntentHandler('TransferFunds');
        apiOrchestrator.current.removeIntentHandler('ViewSpendingByCategory');
        apiOrchestrator.current.removeIntentHandler('PayBill');
        apiOrchestrator.current.removeIntentHandler('AddExpense');
        apiOrchestrator.current.removeIntentHandler('CheckBalance');
        apiOrchestrator.current.removeIntentHandler('CreateBudget');
        console.log('FinancialVoiceContext: Unregistered financial intent handlers.');
    }, [apiOrchestrator]);

    useEffect(() => {
        conversationManager.current.updateContext([FINANCIAL_CONTEXT_NAME], 'add');
        setIsActive(true);

        financialCommands.forEach(cmd => {
            if (!nlpService.current.commandDefinitions.some(existingCmd => existingCmd.id === cmd.id)) {
                nlpService.current.addCommandDefinition(cmd);
            }
        });
        console.log(`FinancialVoiceContext: Activated "${FINANCIAL_CONTEXT_NAME}" and added specific commands.`);

        registerFinancialIntentHandlers();

        return () => {
            conversationManager.current.updateContext([FINANCIAL_CONTEXT_NAME], 'remove');
            setIsActive(false);
            financialCommands.forEach(cmd => nlpService.current.removeCommandDefinition(cmd.id));
            unregisterFinancialIntentHandlers();
            console.log(`FinancialVoiceContext: Deactivated "${FINANCIAL_CONTEXT_NAME}" and removed specific commands/handlers.`);
        };
    }, [financialCommands, conversationManager, nlpService, registerFinancialIntentHandlers, unregisterFinancialIntentHandlers]);

    const triggerFinancialIntent = useCallback(async (intent: Partial<Intent>): Promise<AIResponse> => {
        const currentProfile = userProfileService.current.getUserProfile();
        const fullIntent: Intent = {
            rawUtterance: intent.rawUtterance || intent.name || 'unspecified financial command',
            confidence: intent.confidence || 1.0,
            entities: { ...conversationManager.current.getCurrentState().activeEntities, ...intent.entities },
            name: intent.name || 'UnknownFinancialIntent'
        };

        // For programmatic triggers, directly call the orchestrator's executeIntent
        // This bypasses NLP re-processing and ensures the specific intent is handled.
        try {
            const response = await apiOrchestrator.current.executeIntent(fullIntent, (view) => console.log(`Navigating to view: ${view}`));
            auditLogger.current.log('INTENT_PROGRAMMATIC_TRIGGER', { userId: currentProfile.userId, intent: fullIntent.name, response });
            return response;
        } catch (error: any) {
            auditLogger.current.log('INTENT_PROGRAMMATIC_FAILED', { userId: currentProfile.userId, intent: fullIntent.name, error: error.message });
            console.error(`Error triggering financial intent ${fullIntent.name}:`, error);
            return {
                text: `An error occurred while processing your financial request: ${error.message}.`,
                visualFeedback: 'error',
                isProactive: false
            };
        }
    }, [apiOrchestrator, userProfileService, auditLogger]);

    const speakFinancialStatement = useCallback(async (text: string) => {
        const currentProfile = userProfileService.current.getUserProfile();
        await speak(text, { voiceId: currentProfile.preferredVoiceId });
        auditLogger.current.log('AI_SPEAK', { userId: currentProfile.userId, text, context: FINANCIAL_CONTEXT_NAME });
    }, [speak, userProfileService, auditLogger]);

    const getFinancialSuggestion = useCallback(async (): Promise<AIResponse | null> => {
        const userProfile = userProfileService.current.getUserProfile();
        if (!userProfile.proactiveSuggestionsEnabled) return null;

        const currentState = conversationManager.current.getCurrentState();
        const lastIntent = currentState.intentsRecognized[currentState.intentsRecognized.length - 1];

        if (currentState.activeContexts.includes(FINANCIAL_CONTEXT_NAME)) {
            if (lastIntent?.name === 'CheckBalance' && lastIntent.entities?.accountName) {
                // Agentic AI can analyze balance and suggest actions
                const agentSuggestion = await agentManager.current.triggerAgent('FinancialAdvisorAgent', {
                    action: 'suggestBalanceOptimization',
                    payload: { userId: userProfile.userId, account: lastIntent.entities.accountName, currentBalance: await ledgerService.current.getAccountBalance(lastIntent.entities.accountName) }
                });
                if (agentSuggestion?.suggestion) {
                    auditLogger.current.log('PROACTIVE_SUGGESTION', { userId: userProfile.userId, type: 'Agent', suggestion: agentSuggestion.suggestion });
                    return {
                        text: agentSuggestion.suggestion,
                        visualFeedback: 'text',
                        isProactive: true,
                        followUpActions: agentSuggestion.followUpActions || []
                    };
                }
            }

            if (lastIntent?.name === 'ViewSpendingByCategory' && lastIntent.entities?.category === 'Groceries' && Math.random() > 0.6) {
                auditLogger.current.log('PROACTIVE_SUGGESTION', { userId: userProfile.userId, type: 'Rule-based', reason: 'Grocery list planning' });
                return {
                    text: "You recently reviewed your grocery spending. Would you like to plan your grocery list for the week?",
                    visualFeedback: 'text',
                    isProactive: true,
                    followUpActions: [{ label: 'Plan Grocery List', intent: { name: 'SetReminder', entities: { task: 'plan grocery list', date: 'tomorrow' }, confidence: 1.0, rawUtterance: 'plan grocery list tomorrow' } }]
                };
            }
            if (currentState.lastInteractionTime < Date.now() - (5 * 60 * 1000) && currentState.turns > 2 && Math.random() > 0.8) {
                auditLogger.current.log('PROACTIVE_SUGGESTION', { userId: userProfile.userId, type: 'Rule-based', reason: 'General financial activity' });
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

        return proactiveSuggestionEngine.current.getProactiveSuggestion();
    }, [userProfileService, conversationManager, proactiveSuggestionEngine, agentManager, ledgerService, auditLogger]);

    const initiateSecureTransaction = useCallback(async (transactionDetails: FinancialTransactionDetails, requiresVerification: boolean = true): Promise<AIResponse> => {
        const userId = userProfileService.current.getUserProfile().userId;
        if (!userId || !securityService.current.hasPermission(userId, 'financial:initiate_transaction')) {
            auditLogger.current.log('AUTH_DENIED', { userId, intent: 'initiateSecureTransaction', reason: 'Insufficient permissions' });
            return { text: "You do not have permission to initiate secure transactions.", visualFeedback: 'error' };
        }

        try {
            const { transactionId, senderAccountId, receiverAccountId, amount, currency, description, idempotencyKey, signingKeyId } = transactionDetails;

            if (requiresVerification) {
                const verified = await digitalIdentityService.current.verifyIdentity(userId, 'secure_transaction_challenge');
                if (!verified) {
                    auditLogger.current.log('IDENTITY_FAILED', { userId, transactionId, reason: 'Identity verification failed for secure transaction' });
                    return { text: "Identity verification failed for this transaction. Please confirm your identity.", visualFeedback: 'error' };
                }
            }

            auditLogger.current.log('SECURE_TXN_INITIATED', { userId, transactionId, amount, senderAccountId, receiverAccountId, description });

            const txResponse = await paymentRailService.current.initiatePayment(transactionDetails, 'rail_smart'); // Use 'rail_smart' for intelligent routing

            if (txResponse.status === 'SETTLED' || txResponse.status === 'PENDING') {
                auditLogger.current.log('SECURE_TXN_SUCCESS', { userId, transactionId, paymentRailResponse: txResponse });
                return {
                    text: `Your secure transaction of $${amount} from ${senderAccountId} to ${receiverAccountId} has been ${txResponse.status === 'SETTLED' ? 'completed' : 'initiated'}. Transaction ID: ${transactionId}.`,
                    visualFeedback: 'success',
                    followUpActions: [{ label: 'View Transactions', intent: { name: 'NavigateView', entities: { view: View.Transactions }, confidence: 1.0, rawUtterance: 'view transactions' } }]
                };
            } else {
                auditLogger.current.log('SECURE_TXN_FAILED', { userId, transactionId, paymentRailResponse: txResponse });
                return { text: `Failed to process secure transaction: ${txResponse.errorMessage || 'Unknown error'}. Please try again later.`, visualFeedback: 'error' };
            }
        } catch (error: any) {
            auditLogger.current.log('SECURE_TXN_ERROR', { userId, transactionId: transactionDetails.transactionId, error: error.message });
            console.error("Error initiating secure transaction:", error);
            return { text: `An error occurred during the secure transaction: ${error.message}. Please contact support.`, visualFeedback: 'error' };
        }
    }, [userProfileService, digitalIdentityService, paymentRailService, auditLogger, securityService]);

    const triggerFinancialAgentAction = useCallback(async (agentId: string, actionPayload: Record<string, any>): Promise<any> => {
        const userId = userProfileService.current.getUserProfile().userId;
        if (!userId || !securityService.current.hasPermission(userId, `agent:${agentId}:execute`)) {
            auditLogger.current.log('AUTH_DENIED', { userId, agentId, action: 'triggerFinancialAgentAction', reason: 'Insufficient permissions' });
            throw new Error(`Permission denied to trigger agent ${agentId}`);
        }
        auditLogger.current.log('AGENT_ACTION_TRIGGERED', { userId, agentId, actionPayload });
        return agentManager.current.triggerAgent(agentId, actionPayload);
    }, [agentManager, userProfileService, auditLogger, securityService]);

    const getAccountBalance = useCallback(async (accountId: string): Promise<number> => {
        const userId = userProfileService.current.getUserProfile().userId;
        if (!userId || !securityService.current.hasPermission(userId, 'financial:view_balance')) {
            auditLogger.current.log('AUTH_DENIED', { userId, accountId, action: 'getAccountBalance', reason: 'Insufficient permissions' });
            throw new Error(`Permission denied to view balance for account ${accountId}`);
        }
        auditLogger.current.log('ACCOUNT_BALANCE_REQUEST', { userId, accountId });
        return ledgerService.current.getAccountBalance(accountId);
    }, [ledgerService, userProfileService, auditLogger, securityService]);

    const contextValue: FinancialVoiceControlContextType = {
        isActive,
        triggerFinancialIntent,
        speakFinancialStatement,
        getFinancialSuggestion,
        initiateSecureTransaction,
        triggerFinancialAgentAction,
        getAccountBalance,
        securityContext: securityService.current,
    };

    return (
        <FinancialVoiceControlContext.Provider value={contextValue}>
            {children}
        </FinancialVoiceControlContext.Provider>
    );
};

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

// Augments the singleton instance of APIIntegrationOrchestrator with dynamic intent handling.
// This ensures that financial-specific intent handlers registered by this context can be
// executed by the core AI system. This approach provides a flexible, modular way to extend
// the AI's capabilities without modifying the core VoiceControl.tsx file directly.
//
// Business Value: This dynamic extension mechanism provides critical architectural flexibility,
// allowing for the rapid introduction of new financial products and services without altering
// the core voice control engine. It enables continuous innovation, supports phased rollouts,
// and significantly reduces the maintenance burden, thereby enhancing time-to-market for
// high-value features.
if (!(APIIntegrationOrchestrator.prototype as any).dynamicIntentHandlers) {
    (APIIntegrationOrchestrator.prototype as any).dynamicIntentHandlers = new Map();

    const originalExecuteIntent = APIIntegrationOrchestrator.prototype.executeIntent;
    APIIntegrationOrchestrator.prototype.executeIntent = async function (this: APIIntegrationOrchestrator, intent: Intent, setActiveView: (view: View) => void): Promise<AIResponse> {
        if ((this as any).dynamicIntentHandlers.has(intent.name)) {
            console.log(`APIIntegrationOrchestrator: Executing dynamic handler for intent: ${intent.name}`);
            return (this as any).dynamicIntentHandlers.get(intent.name)!(intent, setActiveView);
        }
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
```