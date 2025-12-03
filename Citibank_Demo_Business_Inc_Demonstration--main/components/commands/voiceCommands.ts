/**
 * This module defines the foundational Natural Language Processing (NLP) command dictionary,
 * enabling a sophisticated voice interface for the Money20/20 platform. It serves as the primary
 * gateway for users and authorized agents to interact with critical financial infrastructure,
 * including real-time payments, token rail operations, digital identity management, and
 * autonomous AI agent orchestration.
 *
 * Business value: This comprehensive and extensible command set dramatically enhances
 * operational efficiency, reduces friction in complex financial workflows, and accelerates
 * decision-making by allowing intuitive, voice-driven control over high-value transactions
 * and system governance. It unlocks new levels of productivity, reduces operational costs,
 * and provides a significant competitive advantage through hands-free, intelligent interaction
 * with enterprise financial systems. The precision in intent recognition and entity extraction
 * ensures accuracy in critical financial operations, safeguarding assets and streamlining
 * compliance and audit processes.
 */
import { View } from '../../types';
import { VoiceCommandDefinition } from '../VoiceControl';

const defaultVoiceCommands: VoiceCommandDefinition[] = [
    {
        id: 'navigate_dashboard',
        patterns: [/^(show|go to|take me to) my (dashboard|home|overview)$/i, /^dashboard$/i],
        intent: { name: 'NavigateView', entities: { view: View.Dashboard }, confidence: 1.0, rawUtterance: '' },
        description: 'Navigates to the user dashboard.',
        priority: 10
    },
    {
        id: 'navigate_transactions',
        patterns: [/^(show|view|find) my (recent )?(transactions|payments|spending)$/i, /^transactions$/i],
        intent: { name: 'NavigateView', entities: { view: View.Transactions }, confidence: 1.0, rawUtterance: '' },
        description: 'Displays the transaction history.',
        priority: 10
    },
    {
        id: 'navigate_budgets',
        patterns: [/^(show|view|manage) my budgets?$/i, /^budgets$/i],
        intent: { name: 'NavigateView', entities: { view: View.Budgets }, confidence: 1.0, rawUtterance: '' },
        description: 'Opens the budget management section.',
        priority: 10
    },
    {
        id: 'create_budget',
        patterns: [/^create a new budget for (.+?) (of|at|around) \$?(\d+(\.\d{1,2})?)$/i],
        intent: { name: 'CreateBudget', entities: { category: '$1', amount: '$3' }, confidence: 0.9, rawUtterance: '' },
        description: 'Creates a new budget for a specified category and amount.',
        requiresContext: ['FinancialContext'],
        priority: 15
    },
    {
        id: 'query_balance',
        patterns: [/^(what's|how much is) my (current )?(balance|money|funds)?$/i],
        intent: { name: 'QueryFinancialData', entities: { type: 'balance' }, confidence: 1.0, rawUtterance: '' },
        description: 'Queries the user\'s current account balance.',
        requiresContext: ['FinancialContext'],
        priority: 12
    },
    {
        id: 'set_reminder',
        patterns: [/^(set|create) a reminder to (.+?) (on|at|for) (today|tomorrow|.+?)( at (\d{1,2}(:\d{2})?( ?am|pm)?))?$/i],
        intent: { name: 'SetReminder', entities: { task: '$2', date: '$4', time: '$6' }, confidence: 0.95, rawUtterance: '' },
        description: 'Sets a new reminder with a task, date, and optional time.',
        requiresContext: ['ProductivityContext'],
        priority: 15
    },
    {
        id: 'find_restaurants',
        patterns: [/^(find|show me|where is) restaurants? (near|in|around) (.+?)$/i],
        intent: { name: 'SearchLocalBusinesses', entities: { type: 'restaurant', location: '$3' }, confidence: 0.85, rawUtterance: '' },
        description: 'Searches for restaurants in a specific location.',
        requiresContext: ['LocationContext'],
        priority: 8
    },
    {
        id: 'toggle_lights',
        patterns: [/^(turn|switch) (on|off) the (lights?|lamp|(\w+) light)$/i],
        intent: { name: 'SmartHomeControl', entities: { action: '$1', device: '$3' }, confidence: 0.9, rawUtterance: '' },
        description: 'Controls smart home lighting.',
        requiresContext: ['SmartHomeContext'],
        priority: 14
    },
    {
        id: 'log_meal',
        patterns: [/^(log|record) a meal of (.+?)( with (\d+) calories?)?$/i],
        intent: { name: 'LogHealthData', entities: { type: 'meal', description: '$2', calories: '$4' }, confidence: 0.88, rawUtterance: '' },
        description: 'Logs a meal entry into health tracking.',
        requiresContext: ['HealthTrackingContext'],
        priority: 13
    },
    {
        id: 'start_meditation',
        patterns: [/^(start|begin) (a )?(meditation|mindfulness) session (for (\d+) minutes?)?$/i],
        intent: { name: 'StartWellnessSession', entities: { type: 'meditation', duration: '$5' }, confidence: 0.92, rawUtterance: '' },
        description: 'Initiates a guided meditation session.',
        requiresContext: ['WellnessContext'],
        priority: 13
    },
    {
        id: 'summarize_email',
        patterns: [/^(summarize|read) my latest (email|message) from (.+?)$/i],
        intent: { name: 'SummarizeCommunication', entities: { type: 'email', sender: '$3' }, confidence: 0.9, rawUtterance: '' },
        description: 'Summarizes a recent email from a specified sender.',
        requiresContext: ['CommunicationContext'],
        priority: 16
    },
    {
        id: 'suggest_recipe',
        patterns: [/^(suggest|give me) a recipe (for (.+?))? (with (.+?))?$/i],
        intent: { name: 'RecipeSuggestion', entities: { dish: '$3', ingredients: '$6' }, confidence: 0.8, rawUtterance: '' },
        description: 'Suggests recipes based on criteria.',
        requiresContext: ['CulinaryContext'],
        priority: 9
    },
    {
        id: 'schedule_meeting',
        patterns: [/^(schedule|arrange) a meeting with (.+?) (on|for) (today|tomorrow|.+?)( at (\d{1,2}(:\d{2})?( ?am|pm)?))?$/i],
        intent: { name: 'ScheduleMeeting', entities: { participants: '$2', date: '$4', time: '$6' }, confidence: 0.95, rawUtterance: '' },
        description: 'Schedules a meeting with specified participants, date, and time.',
        requiresContext: ['CalendarContext', 'CommunicationContext'],
        priority: 17
    },
    {
        id: 'play_music',
        patterns: [/^(play|listen to) (some )?(music|a song|(.+?)) (by (.+?))?$/i],
        intent: { name: 'PlayMedia', entities: { type: 'music', item: '$4', artist: '$6' }, confidence: 0.85, rawUtterance: '' },
        description: 'Plays music, a specific song or by an artist.',
        requiresContext: ['MediaContext'],
        priority: 11
    },
    {
        id: 'open_app',
        patterns: [/^(open|launch) (.+?) (app)?$/i],
        intent: { name: 'OpenApplication', entities: { appName: '$2' }, confidence: 0.9, rawUtterance: '' },
        description: 'Opens a specified application within the ecosystem.',
        priority: 7
    },
    {
        id: 'create_design',
        patterns: [/^(create|design) a (.+?) (image|graphic|logo) (with (.+?))?$/i],
        intent: { name: 'CreativeDesign', entities: { type: '$2', description: '$5' }, confidence: 0.8, rawUtterance: '' },
        description: 'Generates a creative design or image based on description.',
        requiresContext: ['CreativeStudioContext'],
        priority: 12
    },
    {
        id: 'post_social',
        patterns: [/^(post|share) (.+?) (to|on) (facebook|twitter|instagram|social media)$/i],
        intent: { name: 'PostToSocialMedia', entities: { content: '$2', platform: '$4' }, confidence: 0.85, rawUtterance: '' },
        description: 'Posts content to a specified social media platform.',
        requiresContext: ['SocialContext'],
        priority: 10
    },
    {
        id: 'get_weather',
        patterns: [/^(what's the )?(weather|temperature) (like )?(in|for) (.+?) (today|tomorrow|on (.+?))?$/i],
        intent: { name: 'QueryWeatherData', entities: { location: '$5', date: '$6' }, confidence: 0.9, rawUtterance: '' },
        description: 'Retrieves weather information for a location and date.',
        requiresContext: ['InformationContext'],
        priority: 9
    },
    {
        id: 'call_contact',
        patterns: [/^(call|dial) (.+?)$/i],
        intent: { name: 'InitiateCall', entities: { contact: '$2' }, confidence: 0.95, rawUtterance: '' },
        description: 'Initiates a call to a specified contact.',
        requiresContext: ['CommunicationContext'],
        priority: 15
    },
    {
        id: 'send_message',
        patterns: [/^(send )?(a )?(message|text) to (.+?) (saying (.+?))?$/i],
        intent: { name: 'SendMessage', entities: { recipient: '$4', message: '$6' }, confidence: 0.95, rawUtterance: '' },
        description: 'Sends a message to a specified contact.',
        requiresContext: ['CommunicationContext'],
        priority: 15
    },
    {
        id: 'check_stock_price',
        patterns: [/^(what's the )?(stock price|value) for (.+?)( stock)?$/i],
        intent: { name: 'QueryFinancialData', entities: { type: 'stock_price', symbol: '$3' }, confidence: 0.9, rawUtterance: '' },
        description: 'Checks the current stock price for a given company.',
        requiresContext: ['FinancialContext'],
        priority: 12
    },
    {
        id: 'translate_text',
        patterns: [/^(translate) "(.+?)" (to|into) (.+?)$/i],
        intent: { name: 'TranslateText', entities: { text: '$2', targetLanguage: '$4' }, confidence: 0.92, rawUtterance: '' },
        description: 'Translates text into another language.',
        requiresContext: ['LocalizationContext'],
        priority: 11
    },
    {
        id: 'tell_joke',
        patterns: [/^(tell me|say) (a )?(joke|something funny)$/i],
        intent: { name: 'TellJoke', confidence: 0.8, rawUtterance: '' },
        description: 'Tells a joke.',
        priority: 5
    },
    {
        id: 'whats_my_schedule',
        patterns: [/^(what's|show me) my schedule (for )?(today|tomorrow|this week|on (.+?))?$/i],
        intent: { name: 'QueryCalendar', entities: { period: '$3' }, confidence: 0.9, rawUtterance: '' },
        description: 'Retrieves user\'s schedule for a specified period.',
        requiresContext: ['CalendarContext'],
        priority: 12
    },
    {
        id: 'find_document',
        patterns: [/^(find|locate|open) (a )?(document|file|report) named "(.+?)"$/i],
        intent: { name: 'SearchDocument', entities: { query: '$4' }, confidence: 0.85, rawUtterance: '' },
        description: 'Finds and opens a document by name.',
        requiresContext: ['ProductivityContext'],
        priority: 10
    },
    {
        id: 'start_timer',
        patterns: [/^(start|set) a timer for (\d+) (minutes?|seconds?|hours?)$/i],
        intent: { name: 'StartTimer', entities: { duration: '$2', unit: '$3' }, confidence: 0.95, rawUtterance: '' },
        description: 'Starts a timer for a specified duration.',
        priority: 10
    },
    {
        id: 'convert_units',
        patterns: [/^(convert) (\d+(\.\d+)?) (.+?) to (.+?)$/i],
        intent: { name: 'ConvertUnits', entities: { value: '$2', fromUnit: '$4', toUnit: '$5' }, confidence: 0.9, rawUtterance: '' },
        description: 'Converts a value from one unit to another.',
        priority: 9
    },
    {
        id: 'define_word',
        patterns: [/^(define) (.+?)$/i],
        intent: { name: 'DefineWord', entities: { word: '$2' }, confidence: 0.9, rawUtterance: '' },
        description: 'Provides the definition of a word.',
        priority: 8
    },
    {
        id: 'who_is',
        patterns: [/^(who is|tell me about) (.+?)$/i],
        intent: { name: 'QueryInformation', entities: { query: '$2' }, confidence: 0.85, rawUtterance: '' },
        description: 'Provides information about a person or entity.',
        requiresContext: ['InformationContext'],
        priority: 8
    },
    // --- New commands reflecting Money20/20 build phase architecture ---
    {
        id: 'initiate_payment',
        patterns: [
            /^(send|pay|transfer) \$?(\d+(\.\d{1,2})?) (to|for) (.+?)( for (.+?))?$/i,
            /^(make a payment) of \$?(\d+(\.\d{1,2})?) (to|for) (.+?)( for (.+?))?$/i
        ],
        intent: { name: 'InitiatePayment', entities: { amount: '$2', recipient: '$5', reason: '$7' }, confidence: 0.98, rawUtterance: '' },
        description: 'Initiates a real-time payment to a specified recipient with an amount and optional reason.',
        requiresContext: ['FinancialContext', 'PaymentsContext'],
        priority: 20
    },
    {
        id: 'request_payment',
        patterns: [
            /^(request|ask for) \$?(\d+(\.\d{1,2})?) (from) (.+?)( for (.+?))?$/i,
        ],
        intent: { name: 'RequestPayment', entities: { amount: '$2', sender: '$5', reason: '$7' }, confidence: 0.95, rawUtterance: '' },
        description: 'Requests a payment from a specified sender with an amount and optional reason.',
        requiresContext: ['FinancialContext', 'PaymentsContext'],
        priority: 18
    },
    {
        id: 'review_pending_payments',
        patterns: [/^(show|view|review) (my )?(pending|unapproved) payments?$/i],
        intent: { name: 'QueryPayments', entities: { status: 'pending' }, confidence: 0.9, rawUtterance: '' },
        description: 'Displays a list of payments awaiting approval.',
        requiresContext: ['FinancialContext', 'PaymentsContext'],
        priority: 16
    },
    {
        id: 'approve_payment',
        patterns: [/^(approve) (payment|transaction) (id|number)? (\w+)$/i],
        intent: { name: 'ApprovePayment', entities: { transactionId: '$4' }, confidence: 0.98, rawUtterance: '' },
        description: 'Approves a specific pending payment by its ID.',
        requiresContext: ['FinancialContext', 'PaymentsContext', 'AuthorizationContext'],
        priority: 25
    },
    {
        id: 'reject_payment',
        patterns: [/^(reject|deny) (payment|transaction) (id|number)? (\w+)$/i],
        intent: { name: 'RejectPayment', entities: { transactionId: '$4' }, confidence: 0.98, rawUtterance: '' },
        description: 'Rejects a specific pending payment by its ID.',
        requiresContext: ['FinancialContext', 'PaymentsContext', 'AuthorizationContext'],
        priority: 25
    },
    {
        id: 'query_payment_status',
        patterns: [/^(what's the status of|check status for) (payment|transaction) (id|number)? (\w+)$/i],
        intent: { name: 'QueryPaymentStatus', entities: { transactionId: '$4' }, confidence: 0.9, rawUtterance: '' },
        description: 'Queries the current status of a payment using its ID.',
        requiresContext: ['FinancialContext', 'PaymentsContext'],
        priority: 15
    },
    {
        id: 'query_token_balance',
        patterns: [/^(what's|how much is) my (.+?) (token )?balance$/i, /^token balance for (.+?)$/i],
        intent: { name: 'QueryTokenData', entities: { tokenSymbol: '$2', type: 'balance' }, confidence: 0.95, rawUtterance: '' },
        description: 'Retrieves the current balance for a specified token type.',
        requiresContext: ['FinancialContext', 'TokenRailsContext'],
        priority: 18
    },
    {
        id: 'transfer_tokens',
        patterns: [/^(transfer|send) (\d+(\.\d{1,2})?) (.+?) tokens? (to|wallet) (.+?)$/i],
        intent: { name: 'TransferTokens', entities: { amount: '$2', tokenSymbol: '$4', recipientAddress: '$6' }, confidence: 0.97, rawUtterance: '' },
        description: 'Initiates a transfer of a specified amount of tokens to a given wallet address.',
        requiresContext: ['FinancialContext', 'TokenRailsContext', 'AuthorizationContext'],
        priority: 22
    },
    {
        id: 'query_rail_status',
        patterns: [/^(what is the status of|how is) the (.+?) rail$/i],
        intent: { name: 'QueryRailStatus', entities: { railName: '$2' }, confidence: 0.9, rawUtterance: '' },
        description: 'Checks the operational status and latency of a specific token rail.',
        requiresContext: ['ObservabilityContext', 'TokenRailsContext'],
        priority: 14
    },
    {
        id: 'assign_agent_task',
        patterns: [/^(agent )?(.+?), (monitor|start monitoring) (.+?)$/i, /^(assign) (.+?) (to monitor|to detect) (.+?)$/i],
        intent: { name: 'AssignAgentTask', entities: { agentId: '$2', task: '$4' }, confidence: 0.95, rawUtterance: '' },
        description: 'Assigns a specific monitoring or action task to an autonomous agent.',
        requiresContext: ['AgenticAIContext', 'GovernanceContext'],
        priority: 20
    },
    {
        id: 'query_agent_status',
        patterns: [/^(what is|show me) (agent )?(.+?)('s )?(status|doing|activity)?$/i],
        intent: { name: 'QueryAgentStatus', entities: { agentId: '$3' }, confidence: 0.9, rawUtterance: '' },
        description: 'Retrieves the current operational status and active tasks of a specific agent.',
        requiresContext: ['AgenticAIContext', 'ObservabilityContext'],
        priority: 15
    },
    {
        id: 'review_agent_logs',
        patterns: [/^(show me|review) (agent )?(.+?)('s )?(logs|audit trail|recent activity)$/i],
        intent: { name: 'ReviewAgentLogs', entities: { agentId: '$3' }, confidence: 0.92, rawUtterance: '' },
        description: 'Displays the audit logs and recent actions performed by an autonomous agent.',
        requiresContext: ['AgenticAIContext', 'GovernanceContext', 'AuditContext'],
        priority: 17
    },
    {
        id: 'verify_identity',
        patterns: [/^(verify|confirm) (my )?identity$/i, /^(initiate) identity verification$/i],
        intent: { name: 'VerifyIdentity', confidence: 0.98, rawUtterance: '' },
        description: 'Initiates a digital identity verification process.',
        requiresContext: ['IdentityContext', 'SecurityContext'],
        priority: 20
    },
    {
        id: 'view_access_logs',
        patterns: [/^(show me|view) my (access|security) logs?$/i],
        intent: { name: 'QueryAuditLogs', entities: { type: 'access' }, confidence: 0.9, rawUtterance: '' },
        description: 'Displays the user\'s personal access and security logs.',
        requiresContext: ['IdentityContext', 'SecurityContext', 'AuditContext'],
        priority: 15
    },
    {
        id: 'manage_rbac',
        patterns: [/^(manage) (user )?roles (for )?(.+?)$/i],
        intent: { name: 'ManageRBAC', entities: { targetUser: '$4' }, confidence: 0.95, rawUtterance: '' },
        description: 'Navigates to the Role-Based Access Control (RBAC) management interface for a specified user.',
        requiresContext: ['IdentityContext', 'SecurityContext', 'GovernanceContext'],
        priority: 19
    },
    {
        id: 'generate_audit_report',
        patterns: [/^(generate|create) (an )?audit report (for (.+?))?$/i],
        intent: { name: 'GenerateReport', entities: { type: 'audit', period: '$4' }, confidence: 0.95, rawUtterance: '' },
        description: 'Generates a comprehensive audit report for a specified period or domain.',
        requiresContext: ['GovernanceContext', 'AuditContext'],
        priority: 20
    },
    {
        id: 'query_system_health',
        patterns: [/^(what is|report on) (the )?system health (status)?$/i],
        intent: { name: 'QuerySystemHealth', confidence: 0.9, rawUtterance: '' },
        description: 'Retrieves a summary of the overall system\'s operational health and performance metrics.',
        requiresContext: ['ObservabilityContext'],
        priority: 14
    },
    {
        id: 'configure_fraud_rules',
        patterns: [/^(configure|update) fraud rules (for (.+?))?$/i],
        intent: { name: 'ConfigureFraudRules', entities: { scope: '$3' }, confidence: 0.92, rawUtterance: '' },
        description: 'Opens the interface for configuring or updating real-time fraud detection rules.',
        requiresContext: ['SecurityContext', 'GovernanceContext', 'PaymentsContext'],
        priority: 21
    },
    {
        id: 'simulate_transaction',
        patterns: [/^(simulate) a (payment|token transfer) of \$?(\d+(\.\d{1,2})?) (.+?) (to|for) (.+?)$/i],
        intent: { name: 'SimulateTransaction', entities: { type: '$2', amount: '$3', currencyOrToken: '$5', recipient: '$7' }, confidence: 0.95, rawUtterance: '' },
        description: 'Initiates a simulated transaction (payment or token transfer) for testing and validation.',
        requiresContext: ['DeveloperContext', 'TestingContext', 'FinancialContext'],
        priority: 18
    }
];

export default defaultVoiceCommands;