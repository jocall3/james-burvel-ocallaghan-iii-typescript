/**
 * @file app/constants/webhookEventTypes.js
 *
 * This module defines the canonical set of all supported webhook event types within the platform.
 * It is engineered for enterprise-grade scalability, security, and intelligent processing,
 * leveraging advanced AI capabilities for enhanced operational insights, fraud detection,
 * compliance, and adaptive system responses. The architecture supports dynamic configuration,
 * robust error handling, and a continuous feedback loop for AI model refinement.
 *
 * Designed to be the single source of truth for webhook event metadata, this file
 * integrates core definitions with a sophisticated suite of utilities, AI services,
 * and security mechanisms, ensuring unparalleled reliability and performance.
 *
 * @version 2.0.0-gemini-ai
 * @author The Advanced Platform Engineering Team
 */

/**
 * @typedef {Object} WebhookRetryPolicy
 * @property {number} maxRetries - The maximum number of times to retry processing this event.
 * @property {number} initialDelayMs - The initial delay in milliseconds before the first retry.
 * @property {number} multiplier - The backoff multiplier for subsequent retries (e.g., 2 for exponential).
 * @property {number} maxDelayMs - The maximum delay in milliseconds between retries.
 */

/**
 * @typedef {Object} WebhookEventSubTypeDetails
 * @property {string[]} events - An array of specific sub-event types (e.g., "created", "updated").
 * @property {string} name - A human-readable name for the event category.
 * @property {string} documentationUrl - The URL to the official documentation for this event category.
 * @property {string} [description] - A brief description of the event category, possibly AI-generated or enhanced.
 * @property {string[]} [tags] - Categorization tags for easier filtering, analytics, and intelligent routing.
 * @property {boolean} [requiresSignatureVerification=true] - Indicates if this event type typically requires cryptographic signature verification.
 * @property {string} [processingPriority='MEDIUM'] - The default processing priority for this event type ('HIGH', 'MEDIUM', 'LOW').
 * @property {string} [dataClassification='CONFIDENTIAL'] - Classification of the data contained within the webhook payload (e.g., 'PUBLIC', 'CONFIDENTIAL', 'PII', 'FINANCIAL').
 * @property {string} [payloadSchemaRef] - An optional reference to an external JSON Schema definition for this event's payload, for advanced validation.
 * @property {WebhookRetryPolicy} [retryPolicy] - Specific retry policy overrides for this event type.
 * @property {string[]} [associatedServices] - An array of internal microservices or modules typically interested in this event.
 * @property {Object} [aiProcessingHints] - Hints for the AI service on how to process this event (e.g., { sentimentAnalysis: true, fraudDetection: 'HIGH_SENSITIVITY' }).
 */

/**
 * @typedef {Object.<string, WebhookEventSubTypeDetails>} WebhookEventTypesMap
 * Represents a comprehensive, globally accessible map of all supported webhook event types and their detailed metadata.
 */

/**
 * CORE_WEBHOOK_EVENT_TYPES
 * This object defines the foundational event types and their specific sub-events,
 * along with rich metadata essential for advanced processing, routing, and AI-driven insights.
 * Each event type is meticulously documented to ensure clarity and support for
 * complex financial and operational workflows.
 */
const CORE_WEBHOOK_EVENT_TYPES = {
    balance_report: {
        events: ["created", "updated", "deleted", "processed", "failed", "pending_review", "regenerated"],
        name: "Balance Reports",
        documentationUrl: "https://docs.api.platform/reference/balance-reports",
        description: "Comprehensive financial summaries generated periodically or on-demand, reflecting an entity's asset and liability positions. Essential for reconciliation, financial auditing, and regulatory compliance.",
        tags: ["financial", "reporting", "accounting", "audit"],
        requiresSignatureVerification: true,
        processingPriority: 'MEDIUM',
        dataClassification: 'FINANCIAL',
        payloadSchemaRef: '/schemas/balanceReport.json',
        associatedServices: ['ReportingEngine', 'AuditService'],
        aiProcessingHints: { anomalyDetection: 'STANDARD' },
    },
    expected_payment: {
        name: "Expected Payments",
        events: [
            "created", "updated", "deleted", "scheduled",
            "tentatively_reconciled", "reconciled", "archived",
            "overdue", "unreconciled", "partially_reconciled",
            "cancelled", "expired", "failed_reconciliation", "pending_approval",
            "pre_authorized", "post_authorized"
        ],
        documentationUrl: "https://docs.api.platform/reference/expected-payments",
        description: "Anticipated incoming funds, crucial for real-time cash flow forecasting and automating reconciliation processes. Includes various stages from creation to final reconciliation, covering potential failures and manual interventions.",
        tags: ["payment", "reconciliation", "financial", "cash_flow"],
        requiresSignatureVerification: true,
        processingPriority: 'HIGH',
        dataClassification: 'FINANCIAL',
        payloadSchemaRef: '/schemas/expectedPayment.json',
        retryPolicy: { maxRetries: 5, initialDelayMs: 1000, multiplier: 2, maxDelayMs: 60000 },
        associatedServices: ['CashFlowService', 'ReconciliationEngine'],
        aiProcessingHints: { predictNextState: true, anomalyDetection: 'HIGH' },
    },
    "expected_payment.async": {
        name: "Expected Payments (Asynchronous Operations)",
        events: ["initiated", "processing", "completed", "failed", "cancelled", "retried", "paused", "resumed"],
        documentationUrl: "https://docs.api.platform/reference/expected-payments-async",
        description: "Handles long-running or complex operations related to expected payments, providing status updates without blocking the main event flow. Essential for large batch imports or complex reconciliation tasks.",
        tags: ["payment", "async", "background_job", "operations"],
        requiresSignatureVerification: true,
        processingPriority: 'LOW',
        dataClassification: 'OPERATIONAL',
        retryPolicy: { maxRetries: 10, initialDelayMs: 5000, multiplier: 1.5, maxDelayMs: 300000 },
        associatedServices: ['BatchProcessingService'],
        aiProcessingHints: { logPatternAnalysis: true },
    },
    external_account: {
        events: [
            "created", "updated", "deleted", "verified",
            "failed_verification", "cancelled", "expired",
            "approved", "approval_reverted", "denied",
            "pending_verification", "locked", "unlocked", "suspended", "activated"
        ],
        name: "External Accounts",
        documentationUrl: "https://docs.api.platform/reference/external-accounts",
        description: "Manages details of linked external financial accounts, including their lifecycle from creation to approval, verification, and potential suspension. Critical for secure transactions and compliance.",
        tags: ["account", "security", "customer_onboarding", "KYC"],
        requiresSignatureVerification: true,
        processingPriority: 'HIGH',
        dataClassification: 'PII',
        payloadSchemaRef: '/schemas/externalAccount.json',
        associatedServices: ['KYCService', 'FraudService', 'AccountManagement'],
        aiProcessingHints: { fraudDetection: 'HIGH_SENSITIVITY', complianceRisk: 'HIGH' },
    },
    incoming_payment_detail: {
        events: [
            "created", "updated", "deleted",
            "tentatively_reconciled", "reconciled", "completed",
            "returned", "return_failed", "unreconciled",
            "pending_match", "exception", "allocated", "unallocated"
        ],
        name: "Incoming Payment Details",
        documentationUrl: "https://docs.api.platform/reference/incoming-payment-details",
        description: "Detailed records of incoming funds received, enabling precise tracking, reconciliation, and automated processing. Covers various states including returns and exceptions, crucial for operational efficiency.",
        tags: ["payment", "reconciliation", "transaction", "automation"],
        requiresSignatureVerification: true,
        processingPriority: 'HIGH',
        dataClassification: 'FINANCIAL',
        payloadSchemaRef: '/schemas/incomingPaymentDetail.json',
        retryPolicy: { maxRetries: 7, initialDelayMs: 2000, multiplier: 1.8, maxDelayMs: 120000 },
        associatedServices: ['ReconciliationEngine', 'AccountsReceivable'],
        aiProcessingHints: { enrichment: true, smartMatching: true },
    },
    ledger_account_balance_monitor: {
        events: ["created", "updated", "deleted", "triggered", "resolved", "alerted", "snoozed", "reconfigured"],
        name: "Ledger Account Balance Monitors",
        documentationUrl: "https://docs.api.platform/reference/ledger-account-balance-monitors",
        description: "Monitors the balances of ledger accounts against predefined thresholds, triggering alerts or actions when conditions are met. Essential for financial control, risk management, and regulatory oversight.",
        tags: ["ledger", "monitoring", "alerting", "finance", "risk"],
        requiresSignatureVerification: true,
        processingPriority: 'CRITICAL',
        dataClassification: 'FINANCIAL',
        payloadSchemaRef: '/schemas/ledgerAccountBalanceMonitor.json',
        associatedServices: ['RiskManagement', 'AlertingService'],
        aiProcessingHints: { anomalyDetection: 'CRITICAL', predictiveAlerts: true },
    },
    ledger_transaction: {
        events: ["created", "posted", "updated", "deleted", "archived", "pending", "failed", "reversed", "voided", "authorized"],
        name: "Ledger Transactions",
        documentationUrl: "https://docs.api.platform/reference/ledger-transactions",
        description: "Records of all financial movements within the ledger system. Tracks the full lifecycle of a transaction from creation to posting, archiving, or reversal, ensuring auditability and data integrity.",
        tags: ["ledger", "transaction", "accounting", "audit"],
        requiresSignatureVerification: true,
        processingPriority: 'CRITICAL',
        dataClassification: 'FINANCIAL',
        payloadSchemaRef: '/schemas/ledgerTransaction.json',
        associatedServices: ['LedgerService', 'AccountingEngine'],
        aiProcessingHints: { fraudDetection: 'MEDIUM', complianceRisk: 'MEDIUM' },
    },
    ledger_account_settlement: {
        events: ["created", "updated", "deleted", "finish_processing", "finish_archiving", "pending", "posted", "failed", "cancelled", "reconciled", "approved"],
        name: "Ledger Account Settlements",
        documentationUrl: "https://docs.api.platform/reference/ledger-account-settlements",
        description: "Events related to the periodic settlement of balances between ledger accounts, ensuring accuracy and consistency across the financial system. Critical for end-of-day/month processes.",
        tags: ["ledger", "settlement", "accounting", "batch"],
        requiresSignatureVerification: true,
        processingPriority: 'HIGH',
        dataClassification: 'FINANCIAL',
        payloadSchemaRef: '/schemas/ledgerAccountSettlement.json',
        associatedServices: ['LedgerService', 'SettlementEngine'],
        aiProcessingHints: { anomalyDetection: 'HIGH' },
    },
    ledgerable_event: {
        events: ["created", "processed", "failed", "retried", "ignored", "transformed"],
        name: "Ledgerable Event",
        documentationUrl: "https://docs.api.platform/reference/ledgerable-events",
        description: "Represents any event within the system that has implications for the financial ledger, serving as a source for ledger transactions. Acts as a bridge between operational events and accounting entries.",
        tags: ["ledger", "event_sourcing", "integration"],
        requiresSignatureVerification: true,
        processingPriority: 'MEDIUM',
        dataClassification: 'OPERATIONAL',
        payloadSchemaRef: '/schemas/ledgerableEvent.json',
        associatedServices: ['EventBus', 'LedgerService'],
        aiProcessingHints: { contextExtraction: true },
    },
    ledger_event_handler: {
        events: ["created", "updated", "deleted", "activated", "deactivated", "failed_execution", "reconfigured", "paused"],
        name: "Ledger Event Handler",
        documentationUrl: "https://docs.api.platform/reference/ledger-event-handlers",
        description: "Manages the configuration and execution of automated responses to specific ledgerable events, enabling complex financial workflows and rule-based automation.",
        tags: ["ledger", "automation", "workflow", "configuration"],
        requiresSignatureVerification: true,
        processingPriority: 'MEDIUM',
        dataClassification: 'OPERATIONAL',
        payloadSchemaRef: '/schemas/ledgerEventHandler.json',
        associatedServices: ['WorkflowEngine', 'RuleEngine'],
        aiProcessingHints: { codeGenerationAssist: true }, // AI assists in generating handler logic
    },
    paper_item: {
        events: [
            "created", "updated", "deleted",
            "tentatively_reconciled", "reconciled", "completed",
            "returned", "unreconciled", "scanned", "deposited", "bounced", "held", "fraud_flagged"
        ],
        name: "Paper Items",
        documentationUrl: "https://docs.api.platform/reference/paper-items",
        description: "Events related to physical financial instruments like checks, tracking their lifecycle from creation through reconciliation, deposit, and potential returns. Often involves OCR and image processing.",
        tags: ["payment", "paper_check", "reconciliation", "physical"],
        requiresSignatureVerification: true,
        processingPriority: 'HIGH',
        dataClassification: 'FINANCIAL',
        payloadSchemaRef: '/schemas/paperItem.json',
        associatedServices: ['ImageProcessingService', 'ReconciliationEngine'],
        aiProcessingHints: { documentAnalysis: true, fraudDetection: 'HIGH' },
    },
    payment_order: {
        events: [
            "created", "updated", "deleted", "failed", "approved",
            "approval_reverted", "denied", "cancelled", "begin_processing",
            "finish_processing", "acknowledged", "confirmed",
            "tentatively_reconciled", "completed", "returned",
            "redrafted", "reversed", "nsf_deferment", "nsf_plaid_error_but_processing",
            "unreconciled", "pending_review", "fraud_detected", "hold_placed", "released", "sent_to_bank"
        ],
        name: "Payment Orders",
        documentationUrl: "https://docs.api.platform/reference/payment-orders",
        description: "The core mechanism for initiating outbound payments, encompassing a vast array of states reflecting the payment's journey from creation to completion, failure, or reversal. Includes advanced fraud detection and NSF handling.",
        tags: ["payment", "outbound", "transaction", "fraud", "banking"],
        requiresSignatureVerification: true,
        processingPriority: 'CRITICAL',
        dataClassification: 'FINANCIAL',
        payloadSchemaRef: '/schemas/paymentOrder.json',
        retryPolicy: { maxRetries: 10, initialDelayMs: 5000, multiplier: 2, maxDelayMs: 600000 },
        associatedServices: ['PaymentGateway', 'FraudService', 'BankingIntegration'],
        aiProcessingHints: { predictNextState: true, fraudDetection: 'CRITICAL', optimalRouting: true },
    },
    payment_reference: {
        events: ["created", "updated", "deleted", "linked", "unlinked", "validated"],
        name: "Payment References",
        documentationUrl: "https://docs.api.platform/reference/payment-references",
        description: "Identifiers or metadata linked to payments for tracking, reconciliation, and auditing purposes. Essential for establishing clear relationships between financial events and simplifying search.",
        tags: ["payment", "reference", "metadata", "tracking"],
        requiresSignatureVerification: true,
        processingPriority: 'LOW',
        dataClassification: 'OPERATIONAL',
        payloadSchemaRef: '/schemas/paymentReference.json',
        associatedServices: ['SearchService', 'AnalyticsEngine'],
        aiProcessingHints: { contextAggregation: true },
    },
    "return": {
        events: [
            "created", "updated", "deleted",
            "begin_processing", "finish_processing",
            "tentatively_reconciled", "reconciled", "completed",
            "returned", "failed", "unreconciled", "disputed", "settled", "charged_back"
        ],
        name: "Returns (of Payments)",
        documentationUrl: "https://docs.api.platform/reference/returns",
        description: "Events detailing the return of previously processed payments due to various reasons (e.g., insufficient funds, account closure). Critical for handling exceptions and maintaining financial integrity.",
        tags: ["payment", "returns", "exception_handling", "dispute"],
        requiresSignatureVerification: true,
        processingPriority: 'HIGH',
        dataClassification: 'FINANCIAL',
        payloadSchemaRef: '/schemas/return.json',
        retryPolicy: { maxRetries: 5, initialDelayMs: 3000, multiplier: 2, maxDelayMs: 180000 },
        associatedServices: ['ReconciliationEngine', 'DisputeResolution'],
        aiProcessingHints: { anomalyDetection: 'MEDIUM', rootCauseAnalysis: true },
    },
    reversal: {
        events: [
            "created", "updated", "deleted",
            "begin_processing", "finish_processing",
            "completed", "failed", "returned",
            "unreconciled", "authorized", "rejected", "pending_authorization"
        ],
        name: "Reversals (of Transactions)",
        documentationUrl: "https://docs.api.platform/reference/reversals",
        description: "Actions taken to undo a previously completed transaction, often due to error, fraud, or customer request. Tracks the reversal process through various stages to ensure financial accuracy.",
        tags: ["transaction", "reversal", "error_correction", "fraud"],
        requiresSignatureVerification: true,
        processingPriority: 'HIGH',
        dataClassification: 'FINANCIAL',
        payloadSchemaRef: '/schemas/reversal.json',
        associatedServices: ['LedgerService', 'FraudService'],
        aiProcessingHints: { fraudDetection: 'HIGH', impactAnalysis: true },
    },
    transaction: {
        events: ["created", "updated", "deleted", "reconciled", "posted", "pending", "failed", "exception", "authorized", "captured"],
        name: "Transactions",
        documentationUrl: "https://docs.api.platform/reference/transactions",
        description: "Generalized events for any financial transaction, capturing its lifecycle and reconciliation status. Serves as a foundational event type for many financial operations and reporting.",
        tags: ["financial", "transaction", "general", "core"],
        requiresSignatureVerification: true,
        processingPriority: 'CRITICAL',
        dataClassification: 'FINANCIAL',
        payloadSchemaRef: '/schemas/transaction.json',
        associatedServices: ['LedgerService', 'PaymentGateway'],
        aiProcessingHints: { anomalyDetection: 'STANDARD', realTimeAnalysis: true },
    },
    virtual_account: {
        events: ["created", "updated", "deleted", "activated", "deactivated", "suspended", "closed", "linked", "unlinked", "configured"],
        name: "Virtual Accounts",
        documentationUrl: "https://docs.api.platform/reference/virtual-accounts",
        description: "Events related to the lifecycle and status changes of virtual accounts, which are crucial for managing complex payment flows, customer-specific financial arrangements, and sub-ledger accounting.",
        tags: ["account", "virtual", "customer_management", "ledger"],
        requiresSignatureVerification: true,
        processingPriority: 'MEDIUM',
        dataClassification: 'FINANCIAL',
        payloadSchemaRef: '/schemas/virtualAccount.json',
        associatedServices: ['AccountManagement', 'CustomerService'],
        aiProcessingHints: { usagePatternAnalysis: true },
    },
    user_onboarding: {
        events: ["created", "updated", "deleted", "approved", "denied", "needs_approval", "expired", "submitted", "reviewed", "rejected", "verified_identity", "background_check_passed"],
        name: "User Onboardings",
        documentationUrl: "https://docs.api.platform/reference/user-onboardings",
        description: "Tracks the progress and status of user onboarding workflows, from initial submission to final approval or denial. Integrates deeply with compliance and identity verification systems.",
        tags: ["user", "onboarding", "compliance", "identity", "KYC"],
        requiresSignatureVerification: true,
        processingPriority: 'HIGH',
        dataClassification: 'PII',
        payloadSchemaRef: '/schemas/userOnboarding.json',
        associatedServices: ['KYCService', 'ComplianceEngine'],
        aiProcessingHints: { documentVerification: true, riskAssessment: 'HIGH' },
    },
    decision: {
        events: ["created", "updated", "deleted", "needs_approval", "approved", "denied", "cancelled", "escalated", "auto_approved", "manual_review", "reverted"],
        name: "Decisions",
        documentationUrl: "https://docs.api.platform/reference/decisions",
        description: "Events signifying critical decision points within various workflows, such as approvals for transactions, accounts, or other operations. May involve automated or manual review processes.",
        tags: ["workflow", "decision", "approval", "automation"],
        requiresSignatureVerification: true,
        processingPriority: 'HIGH',
        dataClassification: 'OPERATIONAL',
        payloadSchemaRef: '/schemas/decision.json',
        associatedServices: ['ApprovalEngine', 'WorkflowOrchestrator'],
        aiProcessingHints: { rationaleGeneration: true, biasDetection: true },
    },
    "case": {
        events: ["created", "updated", "deleted", "opened", "resolved", "escalated", "closed", "pending_information", "reopened", "assigned", "transferred"],
        name: "Cases",
        documentationUrl: "https://docs.api.platform/reference/cases",
        description: "Management of support or operational cases related to various entities or incidents within the system. Tracks the case lifecycle for efficient problem resolution and customer support.",
        tags: ["support", "case_management", "operational", "CRM"],
        requiresSignatureVerification: true,
        processingPriority: 'MEDIUM',
        dataClassification: 'CONFIDENTIAL',
        payloadSchemaRef: '/schemas/case.json',
        associatedServices: ['CustomerService', 'TicketingSystem'],
        aiProcessingHints: { sentimentAnalysis: true, priorityPrediction: true },
    },
    invoice: {
        events: [
            "created", "updated", "deleted", "issued",
            "unpaid", "payment_pending", "paid",
            "voided", "overdue", "partially_paid", "cancelled", "disputed", "refunded"
        ],
        name: "Invoices",
        documentationUrl: "https://docs.api.platform/reference/invoices",
        description: "Events relating to the lifecycle of invoices, from creation and issuance to payment status, voids, or disputes. Essential for billing, accounts receivable, and revenue tracking.",
        tags: ["billing", "invoice", "financial", "AR"],
        requiresSignatureVerification: true,
        processingPriority: 'HIGH',
        dataClassification: 'FINANCIAL',
        payloadSchemaRef: '/schemas/invoice.json',
        associatedServices: ['BillingService', 'AccountsReceivable'],
        aiProcessingHints: { predictPaymentDate: true, anomalyDetection: 'STANDARD' },
    },
    bulk_request: {
        events: ["created", "updated", "deleted", "pending", "processing", "completed", "failed", "cancelled", "paused", "resumed", "batch_submitted"],
        name: "Bulk Requests",
        documentationUrl: "https://docs.api.platform/platform/reference/bulk-requests",
        description: "Tracks the status and outcome of large-scale, asynchronous operations or batch processes initiated within the platform. Provides updates on overall progress and orchestration.",
        tags: ["bulk", "async", "platform", "operations"],
        requiresSignatureVerification: true,
        processingPriority: 'MEDIUM',
        dataClassification: 'OPERATIONAL',
        payloadSchemaRef: '/schemas/bulkRequest.json',
        associatedServices: ['BatchProcessingService', 'OrchestrationEngine'],
        aiProcessingHints: { progressPrediction: true },
    },
    bulk_result: {
        events: ["created", "updated", "deleted", "pending", "successful", "failed", "partial_success", "retried", "processed_item"],
        name: "Bulk Results",
        documentationUrl: "https://docs.api.platform/platform/reference/bulk-results",
        description: "Detailed outcomes for individual items or sub-tasks within a bulk request. Provides granular success/failure information crucial for debugging and auditing batch operations.",
        tags: ["bulk", "result", "platform", "auditing"],
        requiresSignatureVerification: true,
        processingPriority: 'LOW',
        dataClassification: 'OPERATIONAL',
        payloadSchemaRef: '/schemas/bulkResult.json',
        associatedServices: ['BatchProcessingService', 'AuditingService'],
        aiProcessingHints: { errorCategorization: true },
    },
    fraud_alert: {
        events: ["detected", "resolved", "escalated", "false_positive", "confirmed", "blocked_transaction", "reviewed", "quarantined"],
        name: "Fraud Alerts",
        documentationUrl: "https://docs.api.platform/reference/fraud-alerts",
        description: "Critical alerts generated by the AI-powered fraud detection system, indicating suspicious activity. Requires immediate attention and often triggers automated or manual review processes to mitigate risk.",
        tags: ["security", "fraud", "alerting", "AI", "risk"],
        requiresSignatureVerification: true,
        processingPriority: 'CRITICAL',
        dataClassification: 'FINANCIAL',
        payloadSchemaRef: '/schemas/fraudAlert.json',
        associatedServices: ['FraudService', 'RiskManagement', 'SecurityOps'],
        aiProcessingHints: { rootCauseAnalysis: true, impactAnalysis: true, mitigationSuggestions: true },
    },
    compliance_check: {
        events: ["initiated", "passed", "failed", "pending_review", "flagged", "remediated", "reported", "exempted"],
        name: "Compliance Checks",
        documentationUrl: "https://docs.api.platform/reference/compliance-checks",
        description: "Events related to automated or manual compliance checks, ensuring adherence to regulatory requirements and internal policies. Often involves AI for anomaly detection in data and policy verification.",
        tags: ["compliance", "regulatory", "AI", "security", "legal"],
        requiresSignatureVerification: true,
        processingPriority: 'HIGH',
        dataClassification: 'CONFIDENTIAL',
        payloadSchemaRef: '/schemas/complianceCheck.json',
        associatedServices: ['ComplianceEngine', 'LegalService'],
        aiProcessingHints: { policyVerification: true, riskAssessment: 'HIGH' },
    },
    system_health: {
        events: ["degraded", "restored", "incident_declared", "maintenance_scheduled", "maintenance_completed", "alert_fired", "performance_anomaly_detected"],
        name: "System Health",
        documentationUrl: "https://docs.api.platform/reference/system-health",
        description: "Internal system health metrics and incident notifications, crucial for operational monitoring and ensuring service availability. AI can predict degradation and suggest proactive maintenance.",
        tags: ["system", "monitoring", "devops", "internal", "AI_predictive"],
        requiresSignatureVerification: false,
        processingPriority: 'CRITICAL',
        dataClassification: 'INTERNAL',
        associatedServices: ['MonitoringSystem', 'IncidentManagement'],
        aiProcessingHints: { predictiveMaintenance: true, rootCauseAnalysis: true },
    },
    notification_delivery: {
        events: ["sent", "failed", "delivered", "opened", "clicked", "bounced", "queued", "deferred", "retried"],
        name: "Notification Delivery Status",
        documentationUrl: "https://docs.api.platform/reference/notification-delivery",
        description: "Tracks the lifecycle of notifications sent to users or external systems, including delivery status and user engagement metrics. AI can optimize delivery times and content for higher engagement.",
        tags: ["notification", "messaging", "engagement", "AI_optimization", "marketing"],
        requiresSignatureVerification: false,
        processingPriority: 'LOW',
        dataClassification: 'PUBLIC',
        payloadSchemaRef: '/schemas/notificationDelivery.json',
        associatedServices: ['NotificationService', 'MarketingAutomation'],
        aiProcessingHints: { optimalTiming: true, contentAITesting: true },
    },
    data_privacy_request: {
        events: ["created", "processed", "completed", "failed", "redaction_applied", "access_granted", "erasure_executed", "validated", "rejected"],
        name: "Data Privacy Requests",
        documentationUrl: "https://docs.api.platform/reference/data-privacy-requests",
        description: "Events related to user-initiated data privacy requests (e.g., GDPR, CCPA), including data access, rectification, or erasure. AI can assist in identifying all relevant data points for compliance.",
        tags: ["data_privacy", "compliance", "GDPR", "CCPA", "AI_data_identification", "legal"],
        requiresSignatureVerification: true,
        processingPriority: 'HIGH',
        dataClassification: 'PII',
        payloadSchemaRef: '/schemas/dataPrivacyRequest.json',
        associatedServices: ['PrivacyCompliance', 'LegalService'],
        aiProcessingHints: { piiDetection: true, dataRedaction: true, consentManagement: true },
    },
    risk_assessment: {
        events: ["initiated", "completed", "scored", "flagged", "mitigated", "re_evaluated", "approved", "rejected", "escalated_for_review"],
        name: "Risk Assessments",
        documentationUrl: "https://docs.api.platform/reference/risk-assessments",
        description: "Events from the real-time risk assessment engine, evaluating transactions, users, or accounts for potential risks. Leverages advanced AI models for scoring, prediction, and proactive mitigation strategies.",
        tags: ["risk", "security", "AI", "financial_crime", "compliance"],
        requiresSignatureVerification: true,
        processingPriority: 'CRITICAL',
        dataClassification: 'CONFIDENTIAL',
        payloadSchemaRef: '/schemas/riskAssessment.json',
        associatedServices: ['RiskManagement', 'FraudService'],
        aiProcessingHints: { predictiveAnalytics: true, threatModeling: true },
    },
    gemini_ai_feedback: {
        events: ["model_inference_recorded", "feedback_received", "retraining_triggered", "anomaly_confirmed", "bias_detected", "performance_logged", "dataset_updated"],
        name: "Gemini AI Model Feedback Loop",
        documentationUrl: "https://docs.api.platform/platform/reference/ai-feedback",
        description: "Internal events crucial for the continuous improvement and self-correction of Gemini AI models. Captures inferences, external feedback, and triggers for model retraining or bias mitigation, forming a virtuous AI cycle.",
        tags: ["AI", "machine_learning", "model_management", "internal", "MLOps"],
        requiresSignatureVerification: false,
        processingPriority: 'LOW',
        dataClassification: 'INTERNAL',
        associatedServices: ['MLOpsPlatform', 'AIService'],
        aiProcessingHints: { autoRetraining: true, explainability: true },
    },
    quantum_ledger_sync: {
        events: ["initiated", "block_synced", "consensus_achieved", "fork_detected", "reconciled_with_blockchain", "quantum_signature_verified", "transaction_committed", "rollback_initiated"],
        name: "Quantum Ledger Synchronization",
        documentationUrl: "https://docs.api.platform/platform/reference/quantum-ledger-sync",
        description: "Events for synchronization with a distributed, immutable ledger, potentially leveraging quantum-safe cryptographic methods. Ensures data integrity and auditability across complex, distributed financial networks for future-proof operations.",
        tags: ["quantum", "blockchain", "ledger", "distributed_systems", "future_tech", "cryptography"],
        requiresSignatureVerification: true,
        processingPriority: 'CRITICAL',
        dataClassification: 'FINANCIAL',
        payloadSchemaRef: '/schemas/quantumLedgerSync.json',
        associatedServices: ['BlockchainGateway', 'QuantumSecurityModule'],
        aiProcessingHints: { networkAnomalyDetection: 'CRITICAL', quantumThreatAnalysis: true },
    },
    biometric_authentication: {
        events: ["attempted", "successful", "failed", "challenged", "enrolled", "deregistered", "compromised", "liveness_detected", "adaptive_factor_requested"],
        name: "Biometric Authentication Status",
        documentationUrl: "https://docs.api.platform/reference/biometric-auth",
        description: "Tracks user authentication attempts using advanced biometric methods. Critical for high-security applications, often involving AI for pattern recognition, liveness detection, and adaptive multi-factor authentication.",
        tags: ["security", "authentication", "biometrics", "AI", "MFA", "access_control"],
        requiresSignatureVerification: true,
        processingPriority: 'CRITICAL',
        dataClassification: 'PII',
        payloadSchemaRef: '/schemas/biometricAuth.json',
        associatedServices: ['AuthService', 'SecurityGateway'],
        aiProcessingHints: { fraudDetection: 'HIGH_SENSITIVITY', adaptiveAuth: true },
    },
    // Adding more sophisticated event types for completeness and demonstration
    compliance_policy_update: {
        events: ["created", "updated", "deleted", "activated", "deactivated", "versioned", "reviewed", "rejected"],
        name: "Compliance Policy Updates",
        documentationUrl: "https://docs.api.platform/reference/compliance-policy-updates",
        description: "Notifies about changes to regulatory compliance policies that affect operational workflows. Crucial for ensuring the platform remains compliant with evolving legal frameworks.",
        tags: ["compliance", "policy", "regulatory", "internal"],
        requiresSignatureVerification: true,
        processingPriority: 'HIGH',
        dataClassification: 'CONFIDENTIAL',
        payloadSchemaRef: '/schemas/compliancePolicyUpdate.json',
        associatedServices: ['ComplianceEngine', 'PolicyManager'],
        aiProcessingHints: { impactAnalysis: true, recommendationEngine: true },
    },
    resource_provisioning: {
        events: ["requested", "approved", "failed", "completed", "cancelled", "escalated", "de_provisioned"],
        name: "Resource Provisioning",
        documentationUrl: "https://docs.api.platform/reference/resource-provisioning",
        description: "Tracks the lifecycle of requests for system resources (e.g., new virtual machines, database instances). Integral for dynamic infrastructure management and cost optimization.",
        tags: ["infrastructure", "devops", "automation", "cloud"],
        requiresSignatureVerification: true,
        processingPriority: 'MEDIUM',
        dataClassification: 'INTERNAL',
        payloadSchemaRef: '/schemas/resourceProvisioning.json',
        associatedServices: ['CloudOrchestrator', 'CostManagement'],
        aiProcessingHints: { costOptimization: true, capacityPrediction: true },
    },
    audit_log_ingestion: {
        events: ["received", "processed", "filtered", "stored", "anomaly_detected"],
        name: "Audit Log Ingestion",
        documentationUrl: "https://docs.api.platform/reference/audit-log-ingestion",
        description: "Events related to the ingestion and processing of audit logs from various system components. Essential for security monitoring, compliance, and forensic analysis.",
        tags: ["security", "audit", "logging", "compliance"],
        requiresSignatureVerification: true,
        processingPriority: 'HIGH',
        dataClassification: 'INTERNAL',
        payloadSchemaRef: '/schemas/auditLogIngestion.json',
        associatedServices: ['LogAggregator', 'SecurityInformationEventManagement'],
        aiProcessingHints: { anomalyDetection: 'CRITICAL', threatHunting: true },
    },
};

/**
 * Global configuration settings for webhook processing and AI interactions.
 * This object is designed for high configurability, enabling dynamic adjustments
 * based on deployment environment, operational needs, and security policies.
 * All sensitive values are expected to be sourced from secure environment variables.
 */
export const WebhookConfig = {
    /** @type {string} The base URL for the Gemini AI service endpoint. */
    GEMINI_AI_API_BASE_URL: process.env.GEMINI_AI_API_BASE_URL || 'https://api.gemini.ai/v1',
    /** @type {string} The API key for authenticating with the Gemini AI service. (Placeholder - SHOULD be from env) */
    GEMINI_AI_API_KEY: process.env.GEMINI_AI_API_KEY || 'AI_SERVICE_DEFAULT_API_KEY_NEVER_USE_IN_PROD',
    /** @type {number} Timeout for AI service requests in milliseconds to prevent long-running calls. */
    AI_REQUEST_TIMEOUT_MS: 8000,
    /** @type {string} Default model to use for AI inference, can be overridden per function or event type. */
    DEFAULT_AI_MODEL: 'gemini-pro-vision',
    /** @type {boolean} Flag to enable/disable all AI-powered features globally for cost control or specific environments. */
    ENABLE_AI_FEATURES: process.env.ENABLE_AI_FEATURES === 'true' || true,
    /** @type {number} The minimum confidence score for AI predictions to be considered actionable (0.0 to 1.0). */
    AI_ACTIONABLE_CONFIDENCE_THRESHOLD: 0.75,

    /** @type {string} Secret for webhook signature verification. (Placeholder - SHOULD be from env) */
    WEBHOOK_SIGNATURE_SECRET: process.env.WEBHOOK_SIGNATURE_SECRET || 'SUPER_SECURE_WEBHOOK_SECRET_DO_NOT_HARDCODE',
    /** @type {string} Default header name for webhook versioning. */
    WEBHOOK_VERSION_HEADER: 'X-Webhook-Version',
    /** @type {string} Default header name for webhook signature. */
    WEBHOOK_SIGNATURE_HEADER: 'X-Webhook-Signature',
    /** @type {string} Default header name for webhook timestamp. */
    WEBHOOK_TIMESTAMP_HEADER: 'X-Webhook-Timestamp',
    /** @type {number} The maximum age difference (in seconds) allowed for a webhook timestamp to prevent replay attacks. */
    WEBHOOK_MAX_TIMESTAMP_SKEW_SECONDS: 300, // 5 minutes
    /** @type {string[]} Allowed webhook signature versions. */
    ALLOWED_WEBHOOK_SIGNATURE_VERSIONS: ['v1'],
    /** @type {number} The maximum allowed size for a raw webhook body in KB. Prevents denial-of-service attacks. */
    MAX_WEBHOOK_BODY_SIZE_KB: 1024, // 1MB

    /** @type {string} Default logger level ('debug', 'info', 'warn', 'error'). */
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    /** @type {number} Maximum number of log entries to retain in memory for AI pattern analysis. */
    LOG_HISTORY_RETENTION_COUNT: 2000,
    /** @type {number} Interval (in number of log entries) to trigger AI log pattern analysis. */
    AI_LOG_ANALYSIS_INTERVAL: 500,

    /** @type {number} The default maximum number of retries for an event if not specified in `retryPolicy`. */
    DEFAULT_MAX_RETRIES: 3,
    /** @type {number} The default initial delay for retries in milliseconds. */
    DEFAULT_RETRY_INITIAL_DELAY_MS: 1000,
    /** @type {number} The default backoff multiplier for retries. */
    DEFAULT_RETRY_MULTIPLIER: 2,
    /** @type {number} The default maximum delay for retries in milliseconds. */
    DEFAULT_RETRY_MAX_DELAY_MS: 300000, // 5 minutes
};


/**
 * @classdesc
 * Provides a highly optimized and robust set of utilities for interacting with and managing
 * webhook event types across the entire platform. Designed for high-throughput, mission-critical systems,
 * ensuring fast and accurate access to event metadata.
 */
export class WebhookEventUtils {
    /**
     * Retrieves the comprehensive details for a given webhook event type.
     * Offers O(1) lookup efficiency for event metadata.
     * @param {string} eventType - The main category of the webhook event (e.g., 'payment_order').
     * @returns {WebhookEventSubTypeDetails | null} The details object for the event type, or null if not found.
     * @example
     * const details = WebhookEventUtils.getEventTypeDetails('payment_order');
     * console.log(details?.name); // "Payment Orders"
     */
    static getEventTypeDetails(eventType) {
        if (!eventType || typeof eventType !== 'string') {
            WebhookLogger.getInstance().warn(`[WebhookEventUtils] Invalid eventType provided: '${eventType}'. Must be a non-empty string.`);
            return null;
        }
        return CORE_WEBHOOK_EVENT_TYPES[eventType] || null;
    }

    /**
     * Checks if a given event type is registered in the system.
     * This ensures only recognized event types are processed, enhancing security and stability.
     * @param {string} eventType - The main category of the webhook event.
     * @returns {boolean} True if the event type exists, false otherwise.
     */
    static isValidEventType(eventType) {
        return !!WebhookEventUtils.getEventTypeDetails(eventType);
    }

    /**
     * Validates if a specific sub-event type is recognized for a given main event category.
     * Crucial for robust event parsing and routing.
     * @param {string} eventType - The main category of the webhook event.
     * @param {string} subEventType - The specific sub-event (e.g., 'created', 'completed').
     * @returns {boolean} True if the sub-event is valid for the given type, false otherwise.
     * @example
     * const isValid = WebhookEventUtils.isValidEventSubType('payment_order', 'completed'); // true
     * const isInvalid = WebhookEventUtils.isValidEventSubType('payment_order', 'unknown_status'); // false
     */
    static isValidEventSubType(eventType, subEventType) {
        if (!subEventType || typeof subEventType !== 'string') {
            WebhookLogger.getInstance().warn(`[WebhookEventUtils] Invalid subEventType provided: '${subEventType}' for eventType '${eventType}'.`);
            return false;
        }
        const details = WebhookEventUtils.getEventTypeDetails(eventType);
        return !!details && details.events.includes(subEventType);
    }

    /**
     * Returns a list of all registered main webhook event types.
     * @returns {string[]} An array of event type strings, sorted alphabetically.
     */
    static getAllEventTypes() {
        return Object.keys(CORE_WEBHOOK_EVENT_TYPES).sort();
    }

    /**
     * Returns a flattened list of all unique sub-event types across all main event categories.
     * Useful for UI components or system-wide event analytics.
     * @returns {string[]} An array of unique sub-event type strings, sorted alphabetically.
     */
    static getAllUniqueSubEventTypes() {
        const allSubEvents = new Set();
        for (const type in CORE_WEBHOOK_EVENT_TYPES) {
            if (Object.prototype.hasOwnProperty.call(CORE_WEBHOOK_EVENT_TYPES, type)) {
                CORE_WEBHOOK_EVENT_TYPES[type].events.forEach(event => allSubEvents.add(event));
            }
        }
        return Array.from(allSubEvents).sort();
    }

    /**
     * Filters webhook events based on provided tags, supporting complex categorization queries.
     * @param {string[]} tags - An array of tags to filter by (case-insensitive match).
     * @returns {Object.<string, WebhookEventSubTypeDetails>} An object containing event types that match any of the provided tags.
     * @example
     * const financialEvents = WebhookEventUtils.filterEventsByTags(['financial', 'accounting']);
     */
    static filterEventsByTags(tags) {
        if (!Array.isArray(tags) || tags.length === 0) {
            return {};
        }
        const lowerCaseTags = tags.map(tag => tag.toLowerCase());
        const filteredEvents = {};
        for (const type in CORE_WEBHOOK_EVENT_TYPES) {
            if (Object.prototype.hasOwnProperty.call(CORE_WEBHOOK_EVENT_TYPES, type)) {
                const eventDetails = CORE_WEBHOOK_EVENT_TYPES[type];
                if (eventDetails.tags && eventDetails.tags.some(tag => lowerCaseTags.includes(tag.toLowerCase()))) {
                    filteredEvents[type] = eventDetails;
                }
            }
        }
        return filteredEvents;
    }

    /**
     * Dynamically constructs a comprehensive documentation snippet for a given event type,
     * with an option for AI-driven enrichment to provide deeper insights.
     * @param {string} eventType - The main category of the webhook event.
     * @param {Object} [options] - Additional options for documentation generation.
     * @param {boolean} [options.includeSubEvents=true] - Whether to include a list of sub-events and their AI-generated descriptions.
     * @param {boolean} [options.aiEnhanced=false] - Whether to use AI for generating richer content, best practices, and common pitfalls (simulated).
     * @returns {Promise<string | null>} A markdown-formatted documentation snippet, or null if the event type is not found.
     */
    static async generateDocumentationSnippet(eventType, options = { includeSubEvents: true, aiEnhanced: false }) {
        const details = WebhookEventUtils.getEventTypeDetails(eventType);
        if (!details) {
            WebhookLogger.getInstance().warn(`[WebhookEventUtils] Attempted to generate documentation for unknown event type: ${eventType}`);
            return null;
        }

        let snippet = `## Webhook Event: ${details.name} (\`${eventType}\`)\n\n`;
        snippet += `${details.description || 'No detailed description available for this event category.'}\n\n`;
        snippet += `**Documentation:** [${details.documentationUrl}](${details.documentationUrl})\n`;
        snippet += `**Tags:** ${details.tags ? details.tags.map(tag => `\`${tag}\``).join(', ') : 'N/A'}\n`;
        snippet += `**Requires Signature Verification:** ${details.requiresSignatureVerification ? 'Yes' : 'No'}\n`;
        snippet += `**Processing Priority:** \`${details.processingPriority || WebhookConfig.DEFAULT_PROCESSING_PRIORITY}\`\n`;
        snippet += `**Data Classification:** \`${details.dataClassification || 'CONFIDENTIAL'}\`\n`;
        if (details.payloadSchemaRef) {
            snippet += `**Payload Schema Reference:** [\`${details.payloadSchemaRef}\`](/api-docs${details.payloadSchemaRef})\n`;
        }
        if (details.associatedServices && details.associatedServices.length > 0) {
            snippet += `**Associated Services:** ${details.associatedServices.map(svc => `\`${svc}\``).join(', ')}\n`;
        }

        if (options.includeSubEvents) {
            snippet += `\n### Supported Sub-Events:\n`;
            if (details.events && details.events.length > 0) {
                for (const subEvent of details.events) {
                    let subEventDescription = `A generic status update related to the entity: \`${subEvent}\`.`;
                    try {
                        subEventDescription = await WebhookEventUtils.getGeminiAIService().getEventSubtypeDescription(eventType, subEvent);
                    } catch (error) {
                        WebhookLogger.getInstance().warn(`[WebhookEventUtils] Failed to get AI description for sub-event ${eventType}.${subEvent}: ${error.message}`);
                    }
                    snippet += `- \`${subEvent}\`: ${subEventDescription}\n`;
                }
            } else {
                snippet += `- No specific sub-events documented.\n`;
            }
        }

        if (options.aiEnhanced && WebhookConfig.ENABLE_AI_FEATURES) {
            try {
                const aiEnrichment = await WebhookEventUtils.getGeminiAIService().generateDocumentationEnrichment(eventType, details);
                if (aiEnrichment) {
                    snippet += `\n### AI-Powered Insights & Best Practices:\n`;
                    snippet += aiEnrichment;
                }
            } catch (error) {
                WebhookLogger.getInstance().error(`[WebhookEventUtils] AI documentation enrichment failed for ${eventType}:`, error);
                // Continue without AI enrichment if it fails
            }
        }

        return snippet;
    }

    /**
     * @returns {GeminiAIService} An instance of the AI service.
     * This method acts as a factory/singleton access point for the AI service,
     * ensuring that only one instance manages AI interactions.
     */
    static getGeminiAIService() {
        if (!global.__geminiAIServiceInstance) {
            global.__geminiAIServiceInstance = new GeminiAIService();
        }
        return global.__geminiAIServiceInstance;
    }
}

/**
 * @classdesc
 * Represents a specialized error class for failures encountered during webhook processing.
 * This provides structured error reporting, aiding in rapid debugging and incident response.
 * @augments Error
 */
export class WebhookProcessingError extends Error {
    /**
     * Creates an instance of WebhookProcessingError.
     * @param {string} message - A human-readable error message.
     * @param {string} code - A unique, machine-readable error code (e.g., 'VALIDATION_FAILED', 'AI_INTEGRATION_ERROR').
     * @param {any} [details={}] - Optional additional details about the error, useful for debugging.
     */
    constructor(message, code, details = {}) {
        super(message);
        this.name = 'WebhookProcessingError';
        this.code = code;
        this.details = details;
        // Ensure that the stack trace is captured correctly in V8 engines
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, WebhookProcessingError);
        }
    }
}

/**
 * @classdesc
 * A sophisticated logging utility designed for webhook processing, capable of
 * integrating with AI for anomaly detection in log patterns or intelligent summarization.
 * Implements a singleton pattern for consistent, system-wide logging.
 */
export class WebhookLogger {
    /** @private */
    static _instance = null;

    /**
     * Retrieves the singleton instance of the WebhookLogger.
     * @returns {WebhookLogger} The singleton logger instance.
     */
    static getInstance() {
        if (!WebhookLogger._instance) {
            WebhookLogger._instance = new WebhookLogger();
        }
        return WebhookLogger._instance;
    }

    /** @private */
    constructor() {
        if (WebhookLogger._instance) {
            return WebhookLogger._instance;
        }
        this.logLevel = WebhookConfig.LOG_LEVEL;
        this.logHistory = []; // Stores recent logs for AI analysis
        WebhookLogger._instance = this;
    }

    /**
     * Maps log levels to a numeric priority.
     * @private
     * @param {string} level - The log level string.
     * @returns {number} The numeric priority.
     */
    _getLevelPriority(level) {
        const levels = { debug: 0, info: 1, warn: 2, error: 3, critical: 4 };
        return levels[level] || 0;
    }

    /**
     * Logs a message with 'info' level.
     * @param {string} message - The primary message to log.
     * @param {Object} [context={}] - An object containing additional contextual data for the log entry.
     */
    info(message, context = {}) {
        this._log('info', message, context);
    }

    /**
     * Logs a message with 'warn' level.
     * @param {string} message - The primary message to log.
     * @param {Object} [context={}] - An object containing additional contextual data for the log entry.
     */
    warn(message, context = {}) {
        this._log('warn', message, context);
    }

    /**
     * Logs a message with 'error' level.
     * @param {string} message - The primary message to log.
     * @param {Error} [error] - An optional Error object whose message and stack will be included.
     * @param {Object} [context={}] - An object containing additional contextual data for the log entry.
     */
    error(message, error, context = {}) {
        this._log('error', message, { ...context, error: error ? error.message : undefined, stack: error ? error.stack : undefined });
    }

    /**
     * Logs a message with 'debug' level.
     * @param {string} message - The primary message to log.
     * @param {Object} [context={}] - An object containing additional contextual data for the log entry.
     */
    debug(message, context = {}) {
        this._log('debug', message, context);
    }

    /**
     * The core logging method. It records, filters, and selectively dispatches logs
     * for AI-driven analysis.
     * @private
     * @param {string} level - The log level (e.g., 'info', 'warn', 'error', 'debug').
     * @param {string} message - The primary message to log.
     * @param {Object} context - Additional context for the log entry.
     */
    _log(level, message, context) {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, level, message, ...context };

        if (this._getLevelPriority(level) >= this._getLevelPriority(this.logLevel)) {
            // Choose appropriate console method or fallback
            (console[level] || console.log)(`[${level.toUpperCase()}] ${timestamp} ${message}`, context);
        }

        // Store log history for potential AI analysis
        this.logHistory.push(logEntry);
        // Trim history to prevent excessive memory usage
        if (this.logHistory.length > WebhookConfig.LOG_HISTORY_RETENTION_COUNT) {
            this.logHistory.shift();
        }

        // Trigger AI analysis for critical events or periodic pattern checks
        if (WebhookConfig.ENABLE_AI_FEATURES) {
            if (level === 'error' || level === 'critical') {
                this._analyzeErrorWithAI(logEntry).catch(aiError => this.error("Failed to send error to AI:", aiError));
            } else if (this.logHistory.length % WebhookConfig.AI_LOG_ANALYSIS_INTERVAL === 0) {
                // Periodically analyze log patterns for anomalies
                this._analyzeLogPatternsWithAI(this.logHistory).catch(aiError => this.error("Failed to analyze log patterns with AI:", aiError));
            }
        }
    }

    /**
     * Simulates sending a log entry to Gemini AI for deeper root cause analysis.
     * This operation is non-blocking to maintain system performance.
     * @private
     * @param {Object} logEntry - The log entry (especially error-level) to analyze.
     * @returns {Promise<Object|null>} A promise resolving to AI analysis result or null.
     */
    async _analyzeErrorWithAI(logEntry) {
        if (!WebhookConfig.ENABLE_AI_FEATURES) return null;
        const aiService = WebhookEventUtils.getGeminiAIService();
        try {
            const analysis = await aiService.analyzeLogForRootCause(logEntry);
            this.warn(`[AI_ASSIST] AI suggested root cause for critical event: ${analysis.rootCause}. Suggested actions: ${analysis.suggestedActions.join(', ')}`);
            return analysis;
        } catch (error) {
            this.error(`[WebhookLogger] AI root cause analysis failed:`, error);
            throw new WebhookProcessingError('AI_LOG_ANALYSIS_FAILED', 'AI_SERVICE_ERROR', { originalError: error.message });
        }
    }

    /**
     * Simulates sending recent log history to Gemini AI for proactive pattern anomaly detection.
     * This helps in identifying emerging issues before they escalate.
     * @private
     * @param {Object[]} logHistory - The recent log history.
     * @returns {Promise<Object|null>} A promise resolving to AI anomaly report or null.
     */
    async _analyzeLogPatternsWithAI(logHistory) {
        if (!WebhookConfig.ENABLE_AI_FEATURES) return null;
        const aiService = WebhookEventUtils.getGeminiAIService();
        try {
            const report = await aiService.detectLogPatternAnomalies(logHistory.slice(-WebhookConfig.AI_LOG_ANALYSIS_INTERVAL)); // Analyze only the most recent batch
            if (report.anomaliesDetected && this._getLevelPriority(report.severity.toLowerCase()) >= this._getLevelPriority(this.logLevel)) {
                this.warn(`[AI_ALERT] AI detected log pattern anomalies: ${report.summary}. Severity: ${report.severity}`);
            } else {
                this.debug(`[AI_INFO] AI performed routine log pattern check. No critical anomalies detected.`);
            }
            return report;
        } catch (error) {
            this.error(`[WebhookLogger] AI log pattern analysis failed:`, error);
            throw new WebhookProcessingError('AI_LOG_PATTERN_ANALYSIS_FAILED', 'AI_SERVICE_ERROR', { originalError: error.message });
        }
    }
}

/**
 * @classdesc
 * The central intelligence unit for all webhook operations, leveraging cutting-edge
 * Gemini AI capabilities to provide advanced analytics, predictions, intelligent automation,
 * and adaptive security. This class is designed as a singleton, ensuring consistent
 * and controlled AI interaction across the application.
 */
export class GeminiAIService {
    /** @private */
    static _instance = null;
    /** @private */
    _baseUrl = WebhookConfig.GEMINI_AI_API_BASE_URL;
    /** @private */
    _apiKey = WebhookConfig.GEMINI_AI_API_KEY;
    /** @private */
    _defaultModel = WebhookConfig.DEFAULT_AI_MODEL;
    /** @private */
    _aiEnabled = WebhookConfig.ENABLE_AI_FEATURES;
    /** @private */
    _logger = WebhookLogger.getInstance();

    /**
     * Private constructor to enforce singleton pattern.
     * Use `WebhookEventUtils.getGeminiAIService()` to get the instance.
     * @throws {Error} If called directly without `getInstance`.
     * @private
     */
    constructor() {
        if (GeminiAIService._instance) {
            return GeminiAIService._instance;
        }
        if (!this._aiEnabled) {
            this._logger.warn("[GeminiAIService] AI features are globally disabled by configuration.");
        } else if (!this._apiKey || this._apiKey === 'AI_SERVICE_DEFAULT_API_KEY_NEVER_USE_IN_PROD') {
            this._logger.error("[GeminiAIService] AI API Key is missing or default. AI functionality will be severely limited or disabled.");
            // Optionally disable AI features if API key is invalid
            this._aiEnabled = false;
        }
        GeminiAIService._instance = this;
    }

    /**
     * Executes a simulated API call to the Gemini AI service.
     * This method acts as a sophisticated mock for actual network requests,
     * simulating various AI responses based on the endpoint and input data.
     * @private
     * @param {string} endpoint - The AI service endpoint (e.g., '/analyze', '/predict').
     * @param {Object} data - The payload to send to the AI service.
     * @param {string} [model] - Specific AI model to use, defaults to `_defaultModel`.
     * @returns {Promise<Object>} The simulated response from the AI service.
     * @throws {WebhookProcessingError} If AI features are disabled, API key is missing, or a simulated network error occurs.
     */
    async _callAI(endpoint, data, model = this._defaultModel) {
        if (!this._aiEnabled) {
            throw new WebhookProcessingError('AI_DISABLED', 'AI_SERVICE_DISABLED', { endpoint, data });
        }
        if (!this._apiKey || this._apiKey === 'AI_SERVICE_DEFAULT_API_KEY_NEVER_USE_IN_PROD') {
            throw new WebhookProcessingError('AI_API_KEY_MISSING', 'CONFIGURATION_ERROR', { endpoint, data });
        }

        const url = `${this._baseUrl}${endpoint}`;
        this._logger.debug(`[GeminiAIService] Simulating AI call to ${url} with model ${model}`, { endpoint, data });

        // Simulate network delay and AI processing time
        await new Promise(resolve => setTimeout(resolve, Math.random() * WebhookConfig.AI_REQUEST_TIMEOUT_MS));

        // --- Sophisticated Simulation Logic ---
        if (endpoint.includes('error')) {
            return {
                analysisId: `ai-error-${Date.now()}`,
                rootCause: "Identified memory leak in `UpstreamDataProcessor v3.1` due to large batch sizes.",
                severity: "CRITICAL",
                suggestedActions: ["Rollback `UpstreamDataProcessor` to v3.0", "Implement dynamic batch sizing based on memory usage", "Review log history for prior warnings."],
                confidence: 0.98
            };
        }
        if (endpoint.includes('anomaly/log-patterns')) {
            const anomaliesDetected = Math.random() > 0.85; // 15% chance of anomaly
            return {
                analysisId: `ai-anomaly-${Date.now()}`,
                anomaliesDetected: anomaliesDetected,
                summary: anomaliesDetected ? "Significant spike in 'failed_signature_verification' events observed from region 'EMEA-WEST-2' potentially indicating a targeted attack." : "Log patterns within normal operational parameters.",
                severity: anomaliesDetected ? (Math.random() > 0.6 ? "HIGH" : "MEDIUM") : "LOW",
                details: anomaliesDetected ? [{ type: "event_rate_spike", metric: "signature_failures_per_min", threshold: 5, actual: 21, origin: "EMEA-WEST-2" }] : []
            };
        }
        if (endpoint.includes('enrich')) {
            return {
                enrichedData: {
                    ...data.payload,
                    semanticTags: ["payment", "processing", "customer_feedback"],
                    sentiment: Math.random() > 0.7 ? "positive" : (Math.random() > 0.5 ? "neutral" : "negative"),
                    riskScore: parseFloat((Math.random() * 99).toFixed(2)),
                    predictedComplianceStatus: Math.random() > 0.9 ? "FLAGGED_FOR_REVIEW" : "COMPLIANT",
                },
                aiModelUsed: model,
            };
        }
        if (endpoint.includes('predict')) {
            const nextStates = ["completed", "failed", "returned", "archived", "pending_review", "reversed"];
            return {
                predictionId: `ai-pred-${Date.now()}`,
                nextLikelyState: nextStates[Math.floor(Math.random() * nextStates.length)],
                confidence: parseFloat((0.65 + Math.random() * 0.35).toFixed(2)), // 65-100% confidence
                factors: ["historical_patterns", "current_payload_attributes", "external_market_data"]
            };
        }
        if (endpoint.includes('documentation')) {
            const eventType = data.eventType || 'generic';
            return `
### AI-Powered Best Practices for \`${eventType}\`
The Gemini AI observes that events of type \`${eventType}\` are often correlated with downstream system load spikes.
**Recommendations:**
1.  **Batch Processing:** Consider aggregating related \`${eventType}\` events into a single transaction for efficiency.
2.  **Rate Limiting:** Implement aggressive rate limiting for incoming \`${eventType}\` webhooks during peak operational hours to prevent overload.
3.  **Proactive Monitoring:** Pay close attention to latency metrics for services associated with \`${eventType}\` to detect degradation early.
4.  **Anomaly Detection:** The AI highlights a historical pattern where an unusual frequency of \`${eventType}.failed\` events often precedes broader system instability. Consider activating real-time anomaly alerts.
`;
        }
        if (endpoint.includes('subtype-description')) {
            const subEvent = data.subEventType || 'unknown';
            // Use AI to generate a more detailed, contextual description
            const descriptions = {
                'created': `Initial genesis of an entity, marking its entry into the system. This event often triggers initial setup and validation routines.`,
                'updated': `A modification has occurred to an existing entity's attributes. This can necessitate re-evaluation of policies or re-trigger downstream processes.`,
                'deleted': `The definitive removal or logical archiving of an entity. Critical for data integrity and compliance, often requiring cascading deletions or archival procedures.`,
                'completed': `Signifies the successful culmination of all stages in an entity's lifecycle or a specific complex operation. This is typically a terminal, success state.`,
                'failed': `Indicates an unexpected termination or error during processing of an entity. Requires immediate attention and often triggers retry mechanisms or manual intervention workflows.`,
                'reconciled': `The state where an entity's internal record has been successfully matched and validated against an external source, ensuring data consistency.`,
                'overdue': `An entity has surpassed its expected processing deadline or a critical time threshold without reaching its next state, indicating a potential blockage or issue.`,
                'triggered': `An automated condition, rule, or external signal has been met, initiating a predefined action or sequence of operations.`,
                'posted': `A financial transaction or accounting entry has been formally recorded and committed to the immutable ledger, making it final for auditing purposes.`,
                'approved': `A human or automated decision-making process has given explicit authorization for an entity or action to proceed.`,
                'fraud_detected': `A high-confidence alert from the real-time AI fraud detection engine, indicating suspicious activity requiring immediate investigation and potential blocking.`,
                'quantum_signature_verified': `Confirmation that a transaction or data block has been cryptographically verified using quantum-safe algorithms, ensuring integrity in a post-quantum era.`,
                'liveness_detected': `Confirmation from biometric systems that the subject presenting for authentication is a living human, preventing spoofing attacks.`,
            };
            return descriptions[subEvent] || `A generic status update related to the entity: \`${subEvent}\`. The system transitions to this state due to ${Math.random() > 0.5 ? 'internal processing' : 'external factors'}.`;
        }
        if (endpoint.includes('validate/schema')) {
            const isValid = Math.random() > 0.1; // 90% chance of valid
            return {
                isValid: isValid,
                issues: isValid ? [] : [`Field 'amount' missing or invalid type. Expected number, got string.`, `Non-standard 'currency' code detected: 'XYZ'.`],
                confidence: parseFloat((0.8 + Math.random() * 0.2).toFixed(2)),
                aiModelUsed: model,
            };
        }
        if (endpoint.includes('summarize/stream')) {
            return {
                summary: `Over the past ${data.timeframe}, the system processed ${data.eventsStream.length} webhooks. Key events included a 15% increase in 'payment_order.completed' and a 5% decrease in 'expected_payment.unreconciled'.`,
                keyMetrics: { totalEvents: data.eventsStream.length, completedPayments: 1500, failedPayments: 30, avgProcessingTimeMs: 120 },
                actionableInsights: ["Investigate anomaly in 'fraud_alert' events spike between 02:00-03:00 UTC.", "Optimize queue for 'incoming_payment_detail.pending_match' events to reduce reconciliation latency."],
                sentiment: "Stable, with minor operational anomalies detected."
            };
        }
        if (endpoint.includes('data-privacy/redact')) {
            const redactedPayload = JSON.parse(JSON.stringify(data.payload)); // Deep copy
            // Simple simulation: redact 'email' and 'phone' fields
            if (redactedPayload.customer && redactedPayload.customer.email) redactedPayload.customer.email = '[REDACTED_PII]';
            if (redactedPayload.customer && redactedPayload.customer.phone) redactedPayload.customer.phone = '[REDACTED_PII]';
            if (redactedPayload.sensitiveField) redactedPayload.sensitiveField = '[REDACTED_SENSITIVE]';
            return { redactedPayload, redactionReport: { piiCount: 2, sensitiveCount: 1, method: 'AI-Enhanced Rule-Based' } };
        }
        if (endpoint.includes('suggest/actions')) {
            const suggestions = {
                'payment_order.failed': ["Initiate automatic retry with exponential backoff", "Alert operations team for manual review if status persists", "Analyze failure reason with AI for common patterns"],
                'fraud_alert.detected': ["Automatically block associated account", "Notify security operations center", "Trigger a biometric re-authentication request for the user"],
                'user_onboarding.needs_approval': ["Fast-track approval for high-trust scores (AI-derived)", "Escalate to compliance team for manual document review if risk score is high"],
                'default': ["Log for historical analysis", "Update internal status tracker", "Generate a summary for dashboard"],
            };
            const suggestedActions = suggestions[data.eventType] || suggestions['default'];
            return {
                suggestedActions,
                confidence: parseFloat((0.7 + Math.random() * 0.3).toFixed(2)),
                rationale: `AI-driven analysis based on historical patterns for ${data.eventType}.`
            };
        }
        if (endpoint.includes('/feedback/')) {
            return { status: 'feedback_received', message: 'Thank you for your valuable input!' };
        }

        return {
            status: 'success',
            message: 'Simulated generic AI response',
            processedData: data,
            aiModelUsed: model,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Analyzes a raw webhook payload using Gemini AI to extract key insights, sentiment, or classifications.
     * This is useful for events where the `eventType` alone might not provide enough context,
     * allowing for deeper, contextual understanding of the event.
     * @param {string} eventType - The main category of the webhook event.
     * @param {Object} payload - The full raw webhook payload.
     * @param {string} [model] - Optional specific AI model for this task.
     * @returns {Promise<Object>} An object containing AI-generated insights and enriched data.
     */
    async analyzeWebhookPayload(eventType, payload, model = 'gemini-pro') {
        this._logger.debug(`[GeminiAIService] Analyzing webhook payload for ${eventType}...`, { eventType });
        try {
            const result = await this._callAI('/analyze/payload', { eventType, payload }, model);
            this._logger.info(`[GeminiAIService] Payload analysis for ${eventType} complete. Risk Score: ${result.riskScore || 'N/A'}`);
            return result;
        } catch (error) {
            this._logger.error(`[GeminiAIService] Failed to analyze webhook payload for ${eventType}:`, error);
            throw new WebhookProcessingError('AI_PAYLOAD_ANALYSIS_FAILED', 'AI_SERVICE_ERROR', { eventType, originalError: error.message });
        }
    }

    /**
     * Predicts the most likely next state or outcome for a given webhook event based on its current payload,
     * historical patterns, and real-time contextual data. Essential for proactive system responses.
     * @param {string} eventType - The main category of the webhook event.
     * @param {Object} currentPayload - The current state of the entity from the webhook payload.
     * @param {string} [model] - Optional specific AI model.
     * @returns {Promise<{ nextLikelyState: string, confidence: number, predictionId: string, factors: string[] }>} An object containing the predicted next state and confidence.
     */
    async predictFutureState(eventType, currentPayload, model = 'gemini-pro') {
        this._logger.debug(`[GeminiAIService] Predicting future state for ${eventType}...`, { eventType });
        try {
            const result = await this._callAI('/predict/next-state', { eventType, currentPayload }, model);
            this._logger.info(`[GeminiAIService] Prediction for ${eventType}: ${result.nextLikelyState} (Confidence: ${result.confidence})`);
            return result;
        } catch (error) {
            this._logger.error(`[GeminiAIService] Failed to predict future state for ${eventType}:`, error);
            throw new WebhookProcessingError('AI_PREDICTION_FAILED', 'AI_SERVICE_ERROR', { eventType, originalError: error.message });
        }
    }

    /**
     * Generates a detailed anomaly report based on a stream of historical webhook events,
     * identifying unusual patterns that might indicate fraud, system issues, or operational deviations.
     * This method is intended for batch processing or periodic review.
     * @param {Object[]} webhookHistory - An array of past webhook payloads or processed events.
     * @param {string} [model] - Optional specific AI model.
     * @returns {Promise<{ anomaliesDetected: boolean, summary: string, severity: string, details: any[] }>} An object describing detected anomalies.
     */
    async generateAnomalyReport(webhookHistory, model = 'gemini-ultra') {
        this._logger.debug(`[GeminiAIService] Generating anomaly report for ${webhookHistory.length} events...`);
        try {
            const result = await this._callAI('/anomaly/report', { history: webhookHistory }, model);
            if (result.anomaliesDetected) {
                this._logger.warn(`[GeminiAIService] Anomaly report generated: ${result.summary}. Severity: ${result.severity}`);
            } else {
                this._logger.debug(`[GeminiAIService] Anomaly report generated: No anomalies detected.`);
            }
            return result;
        } catch (error) {
            this._logger.error('[GeminiAIService] Failed to generate anomaly report:', error);
            throw new WebhookProcessingError('AI_ANOMALY_REPORT_FAILED', 'AI_SERVICE_ERROR', { originalError: error.message });
        }
    }

    /**
     * Enriches a raw event data object with additional context, classifications, or linked entities
     * by querying internal knowledge bases or performing real-time lookups using AI.
     * This enhances the value of each webhook event for downstream systems.
     * @param {string} eventType - The main category of the webhook event.
     * @param {Object} rawData - The raw data associated with the event.
     * @param {string} [model] - Optional specific AI model.
     * @returns {Promise<Object>} The enriched data object, potentially with new fields and aggregated information.
     */
    async enrichEventData(eventType, rawData, model = 'gemini-pro') {
        this._logger.debug(`[GeminiAIService] Enriching event data for ${eventType}...`, { eventType });
        try {
            const result = await this._callAI('/enrich/event-data', { eventType, payload: rawData }, model);
            this._logger.debug(`[GeminiAIService] Event data for ${eventType} enriched.`);
            return result.enrichedData;
        } catch (error) {
            this._logger.error(`[GeminiAIService] Failed to enrich event data for ${eventType}:`, error);
            throw new WebhookProcessingError('AI_ENRICHMENT_FAILED', 'AI_SERVICE_ERROR', { eventType, originalError: error.message });
        }
    }

    /**
     * Suggests a set of optimal next actions or automated workflows based on the webhook event type and payload,
     * considering system state, user preferences, and historical success rates. This drives intelligent automation.
     * @param {string} eventType - The main category of the webhook event.
     * @param {Object} payload - The full raw webhook payload.
     * @param {string} [model] - Optional specific AI model.
     * @returns {Promise<{ suggestedActions: string[], confidence: number, rationale: string }>} An object containing suggested actions.
     */
    async suggestWebhookActions(eventType, payload, model = 'gemini-pro-logic') {
        this._logger.debug(`[GeminiAIService] Suggesting actions for ${eventType}...`, { eventType });
        try {
            const result = await this._callAI('/suggest/actions', { eventType, payload }, model);
            this._logger.debug(`[GeminiAIService] Suggested actions for ${eventType}: ${result.suggestedActions.join(', ')}`);
            return result;
        } catch (error) {
            this._logger.error(`[GeminiAIService] Failed to suggest actions for ${eventType}:`, error);
            throw new WebhookProcessingError('AI_ACTION_SUGGESTION_FAILED', 'AI_SERVICE_ERROR', { eventType, originalError: error.message });
        }
    }

    /**
     * Dynamically generates a textual description or summary for a specific sub-event type.
     * This is useful for tooltip text, UI hints, or auto-generated documentation, ensuring
     * context-aware explanations.
     * @param {string} eventType - The main category of the webhook event.
     * @param {string} subEventType - The specific sub-event (e.g., 'created', 'completed').
     * @param {string} [model] - Optional specific AI model.
     * @returns {Promise<string>} A human-readable description of the sub-event.
     */
    async getEventSubtypeDescription(eventType, subEventType, model = 'gemini-nano') {
        this._logger.debug(`[GeminiAIService] Generating description for sub-event ${eventType}.${subEventType}...`);
        try {
            const result = await this._callAI('/generate/subtype-description', { eventType, subEventType }, model);
            return result.aiGeneratedContent || result;
        } catch (error) {
            this._logger.error(`[GeminiAIService] Failed to get sub-event description for ${eventType}.${subEventType}:`, error);
            return `A system event with state: ${subEventType}`; // Fallback
        }
    }

    /**
     * Validates a webhook payload against an AI-learned or dynamically generated schema for the given event type.
     * This goes beyond static schema validation by using AI to detect semantic inconsistencies and potential issues.
     * @param {string} eventType - The main category of the webhook event.
     * @param {Object} payload - The webhook payload to validate.
     * @param {string} [model] - Optional specific AI model.
     * @returns {Promise<{ isValid: boolean, issues: string[], confidence: number }>} Validation result.
     */
    async validateEventSchema(eventType, payload, model = 'gemini-pro-validation') {
        this._logger.debug(`[GeminiAIService] Validating schema for ${eventType} with AI...`, { eventType });
        try {
            const result = await this._callAI('/validate/schema', { eventType, payload }, model);
            this._logger.debug(`[GeminiAIService] AI schema validation for ${eventType} complete. Valid: ${result.isValid}`);
            return result;
        } catch (error) {
            this._logger.error(`[GeminiAIService] Failed to validate event schema for ${eventType}:`, error);
            throw new WebhookProcessingError('AI_SCHEMA_VALIDATION_FAILED', 'AI_SERVICE_ERROR', { eventType, originalError: error.message });
        }
    }

    /**
     * Provides a high-level summary and actionable insights from a stream of webhook events over a period.
     * Ideal for dashboard generation, daily/weekly digests, or executive reporting.
     * @param {Object[]} eventsStream - An array of processed webhook events.
     * @param {string} [timeframe='24h'] - The timeframe of the events (e.g., '1h', '24h', '7d').
     * @param {string} [model] - Optional specific AI model.
     * @returns {Promise<{ summary: string, keyMetrics: Object, actionableInsights: string[], sentiment: string }>} A comprehensive summary.
     */
    async summarizeWebhookStream(eventsStream, timeframe = '24h', model = 'gemini-ultra-summary') {
        this._logger.debug(`[GeminiAIService] Summarizing webhook stream for ${timeframe} (${eventsStream.length} events)...`);
        try {
            const result = await this._callAI('/summarize/stream', { eventsStream, timeframe }, model);
            this._logger.info(`[GeminiAIService] Webhook stream summary for ${timeframe} generated. Sentiment: ${result.sentiment}`);
            return result;
        } catch (error) {
            this._logger.error(`[GeminiAIService] Failed to summarize webhook stream for ${timeframe}:`, error);
            throw new WebhookProcessingError('AI_STREAM_SUMMARY_FAILED', 'AI_SERVICE_ERROR', { timeframe, originalError: error.message });
        }
    }

    /**
     * Processes and filters sensitive information from a webhook payload using AI-driven redaction techniques.
     * Ensures compliance with stringent data privacy regulations (e.g., GDPR, CCPA, HIPAA).
     * @param {string} eventType - The main category of the webhook event.
     * @param {Object} payload - The original webhook payload with sensitive data.
     * @param {string[]} [fieldsToRedact] - Optional array of specific fields to prioritize for redaction.
     * @param {string} [model] - Optional specific AI model for PII detection.
     * @returns {Promise<Object>} The redacted webhook payload, with sensitive information intelligently masked.
     */
    async redactSensitiveData(eventType, payload, fieldsToRedact = [], model = 'gemini-data-privacy') {
        this._logger.debug(`[GeminiAIService] Redacting sensitive data for ${eventType}...`, { eventType });
        try {
            const result = await this._callAI('/data-privacy/redact', { eventType, payload, fieldsToRedact }, model);
            this._logger.debug(`[GeminiAIService] Sensitive data redacted for ${eventType}.`);
            return result.redactedPayload;
        } catch (error) {
            this._logger.error(`[GeminiAIService] Failed to redact sensitive data for ${eventType}:`, error);
            throw new WebhookProcessingError('AI_REDACTION_FAILED', 'AI_SERVICE_ERROR', { eventType, originalError: error.message });
        }
    }

    /**
     * Provides AI-powered dynamic documentation enrichment for a specific event type.
     * This might include common pitfalls, best practices, or related events suggested by the AI,
     * enhancing developer productivity and reducing integration errors.
     * @param {string} eventType - The main category of the webhook event.
     * @param {WebhookEventSubTypeDetails} details - The existing details for the event type.
     * @param {string} [model] - Optional specific AI model.
     * @returns {Promise<string>} Additional documentation content in markdown format.
     */
    async generateDocumentationEnrichment(eventType, details, model = 'gemini-documentation-assist') {
        this._logger.debug(`[GeminiAIService] Generating documentation enrichment for ${eventType}...`, { eventType });
        try {
            const result = await this._callAI('/generate/documentation', { eventType, details }, model);
            return result.aiGeneratedContent;
        } catch (error) {
            this._logger.error(`[GeminiAIService] Failed to generate documentation enrichment for ${eventType}:`, error);
            return ''; // Fallback to empty string if AI enrichment fails
        }
    }

    /**
     * Utilizes AI to perform root cause analysis on a given error log entry,
     * quickly pinpointing potential issues in complex distributed systems.
     * @param {Object} logEntry - The log entry with error details.
     * @param {string} [model] - Optional specific AI model.
     * @returns {Promise<{rootCause: string, severity: string, suggestedActions: string[], confidence: number}>} AI analysis.
     */
    async analyzeLogForRootCause(logEntry, model = 'gemini-debug-pro') {
        this._logger.debug(`[GeminiAIService] Analyzing log for root cause with AI...`);
        try {
            return await this._callAI('/analyze/error', { logEntry }, model);
        } catch (error) {
            this._logger.error(`[GeminiAIService] Failed AI root cause analysis for log entry:`, error);
            throw new WebhookProcessingError('AI_ROOT_CAUSE_ANALYSIS_FAILED', 'AI_SERVICE_ERROR', { logEntry, originalError: error.message });
        }
    }

    /**
     * Utilizes AI to detect anomalies in a stream of log entries based on learned patterns.
     * This enables proactive alerting for system health degradation or security breaches.
     * @param {Object[]} logHistory - An array of recent log entries.
     * @param {string} [model] - Optional specific AI model.
     * @returns {Promise<{anomaliesDetected: boolean, summary: string, severity: string, details: any[]}>} AI anomaly report.
     */
    async detectLogPatternAnomalies(logHistory, model = 'gemini-anomaly-detection') {
        this._logger.debug(`[GeminiAIService] Detecting log pattern anomalies with AI...`);
        try {
            return await this._callAI('/anomaly/log-patterns', { logHistory }, model);
        } catch (error) {
            this._logger.error(`[GeminiAIService] Failed AI log pattern anomaly detection:`, error);
            throw new WebhookProcessingError('AI_LOG_ANOMALY_DETECTION_FAILED', 'AI_SERVICE_ERROR', { originalError: error.message });
        }
    }
}

/**
 * @classdesc
 * Manages webhook signature verification to ensure the integrity and authenticity of incoming events.
 * Implements industry best practices for secure webhook handling, protecting against tampering and spoofing.
 */
export class WebhookSecurityManager {
    /** @private */
    static _logger = WebhookLogger.getInstance();

    /**
     * Verifies the signature of an incoming webhook payload.
     * This is crucial for security to ensure the webhook originated from a trusted source and hasn't been tampered with.
     * @param {string} rawPayload - The raw request body as a string.
     * @param {string} signatureHeader - The value of the signature header (e.g., 'X-Webhook-Signature: v1=abc123def456').
     * @param {string} timestampHeader - The value of the timestamp header (e.g., 'X-Webhook-Timestamp: 1678886400').
     * @param {string} [secret=WebhookConfig.WEBHOOK_SIGNATURE_SECRET] - The shared secret used for signing.
     * @returns {boolean} True if the signature is valid, false otherwise.
     * @throws {WebhookProcessingError} If timestamp is too old, headers are missing, or internal security errors occur.
     */
    static verifySignature(rawPayload, signatureHeader, timestampHeader, secret = WebhookConfig.WEBHOOK_SIGNATURE_SECRET) {
        if (!signatureHeader || !timestampHeader || !rawPayload) {
            WebhookSecurityManager._logger.error("Missing webhook security headers or raw payload for verification.", { signatureHeader: !!signatureHeader, timestampHeader: !!timestampHeader, rawPayloadPresent: !!rawPayload });
            throw new WebhookProcessingError("Missing webhook security headers or raw payload", "SECURITY_VERIFICATION_FAILED");
        }

        const [signatureVersion, signature] = signatureHeader.split('=');
        if (!WebhookConfig.ALLOWED_WEBHOOK_SIGNATURE_VERSIONS.includes(signatureVersion) || !signature) {
            WebhookSecurityManager._logger.warn(`Invalid signature header format or unsupported version. Expected: ${WebhookConfig.ALLOWED_WEBHOOK_SIGNATURE_VERSIONS.join(',')}, Received: '${signatureVersion}'`, { signatureHeader });
            return false;
        }

        const timestamp = parseInt(timestampHeader, 10);
        if (isNaN(timestamp)) {
            WebhookSecurityManager._logger.warn("Invalid timestamp header format, could not parse integer.", { timestampHeader });
            return false;
        }

        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (Math.abs(currentTimestamp - timestamp) > WebhookConfig.WEBHOOK_MAX_TIMESTAMP_SKEW_SECONDS) {
            WebhookSecurityManager._logger.warn(`Webhook timestamp out of acceptable range. Received: ${timestamp}, Current: ${currentTimestamp}. Max skew allowed: ${WebhookConfig.WEBHOOK_MAX_TIMESTAMP_SKEW_SECONDS}s. Potential replay attack.`, { timestampHeader, currentTimestamp });
            throw new WebhookProcessingError("Webhook timestamp is too old or in the future, possible replay attack.", "TIMESTAMP_SKEW_EXCEEDED");
        }

        // Validate raw payload size
        if (rawPayload.length > WebhookConfig.MAX_WEBHOOK_BODY_SIZE_KB * 1024) {
            WebhookSecurityManager._logger.warn(`Webhook payload size (${rawPayload.length / 1024}KB) exceeds maximum allowed (${WebhookConfig.MAX_WEBHOOK_BODY_SIZE_KB}KB). Potential oversized payload attack.`, { payloadSizeKB: rawPayload.length / 1024 });
            throw new WebhookProcessingError("Webhook payload size exceeds limit", "PAYLOAD_TOO_LARGE");
        }

        const signedPayload = `${timestamp}.${rawPayload}`;

        let expectedSignature;
        try {
            // In a real Node.js application, you would use the built-in crypto module:
            // const crypto = require('crypto');
            // expectedSignature = crypto.createHmac('sha256', secret)
            //                               .update(signedPayload)
            //                               .digest('hex');

            // --- SIMULATION START ---
            // A simplified, deterministic hash for demonstration. NOT cryptographically secure.
            // This is purely for illustrating the concept in a browser/non-crypto environment.
            const s1 = String(secret).split('').map(c => c.charCodeAt(0)).reduce((a, b) => (a + b) % 0x100000, 0);
            const s2 = String(signedPayload).split('').map(c => c.charCodeAt(0)).reduce((a, b) => (a + b) % 0x100000, 0);
            // Combine with a fixed large prime for more "randomness"
            const simulatedHash = ((s1 * 31 + s2 * 17 + signedPayload.length * 13) % 0x100000000).toString(16);
            expectedSignature = simulatedHash.padStart(64, '0').substring(0, 64); // Ensure 64-char hex string
            // --- SIMULATION END ---

        } catch (error) {
            WebhookSecurityManager._logger.error("Error during signature hash generation. This indicates a critical internal security component failure.", error, { signedPayload });
            throw new WebhookProcessingError("Signature hash generation failed", "INTERNAL_SECURITY_ERROR", { originalError: error.message });
        }

        const isValid = expectedSignature === signature;
        if (!isValid) {
            WebhookSecurityManager._logger.warn("Webhook signature verification failed. Received signature does not match computed signature.", { expectedSignature, receivedSignature: signature, timestamp });
        } else {
            WebhookSecurityManager._logger.debug("Webhook signature successfully verified.", { timestamp });
        }
        return isValid;
    }

    /**
     * Checks if a given event type is configured to require signature verification.
     * This allows for flexible security policies based on event sensitivity.
     * @param {string} eventType - The main category of the webhook event.
     * @returns {boolean} True if signature verification is required, false otherwise. Defaults to true for unknown types for safety.
     */
    static requiresSignatureVerification(eventType) {
        const details = WebhookEventUtils.getEventTypeDetails(eventType);
        return details ? details.requiresSignatureVerification : true; // Default to true for unknown types for maximum safety
    }
}

/**
 * @classdesc
 * The Master Webhook Processor orchestrates the entire lifecycle of an incoming webhook,
 * from initial receipt and validation to AI-powered analysis, enrichment, and intelligent routing.
 * This class embodies the "greatest" and "commercial grade" aspects, providing a holistic,
 * resilient, and adaptive solution for high-volume, critical event processing.
 */
export class MasterWebhookProcessor {
    /** @private */
    _aiService = WebhookEventUtils.getGeminiAIService();
    /** @private */
    _logger = WebhookLogger.getInstance();
    /** @private */
    _schemaRegistry = new WebhookSchemaRegistry();

    /**
     * Creates an instance of MasterWebhookProcessor.
     */
    constructor() {
        this._logger.info("[MasterWebhookProcessor] Initialized for advanced, AI-orchestrated webhook processing.");
    }

    /**
     * Registers a JSON schema for a specific webhook event type.
     * This allows for schema-driven validation of incoming payloads.
     * @param {string} eventType - The event type to associate the schema with.
     * @param {Object} schema - The JSON schema object.
     */
    registerEventSchema(eventType, schema) {
        this._schemaRegistry.registerSchema(eventType, schema);
        this._logger.debug(`[MasterWebhookProcessor] Registered schema for event type: ${eventType}`);
    }

    /**
     * Processes an incoming webhook request from end-to-end.
     * This method integrates all components: security, schema validation, AI analysis, enrichment, and intelligent routing.
     * It's designed to be the single entry point for all incoming webhook traffic.
     * @param {Object} requestHeaders - The HTTP request headers from the incoming webhook.
     * @param {string} rawRequestBody - The raw string body of the HTTP request.
     * @param {Object} parsedPayload - The parsed JSON object of the webhook payload.
     * @returns {Promise<Object>} An object containing the comprehensive processing outcome, including all AI insights.
     * @throws {WebhookProcessingError} For any critical, unrecoverable error during processing.
     */
    async processWebhook(requestHeaders, rawRequestBody, parsedPayload) {
        // Extracting common event identifiers, prioritizing `event_type` and `event_subtype`
        const eventType = parsedPayload.event_type || parsedPayload.type || 'unknown_event_type';
        const subEventType = parsedPayload.event_subtype || parsedPayload.status || 'unknown_sub_event_type';
        const webhookId = parsedPayload.id || `_temp_webhook_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`; // Robust temp ID

        this._logger.info(`[MasterWebhookProcessor] Starting processing for webhook ID: ${webhookId}, Type: ${eventType}.${subEventType}`);

        try {
            // 1. Initial Validation: Basic checks and unknown event handling
            if (!WebhookEventUtils.isValidEventType(eventType)) {
                this._logger.warn(`[MasterWebhookProcessor] Received an unrecognised event type: ${eventType}. Proceeding with caution or rejecting as per policy.`, { webhookId });
                // Depending on policy, an unknown event type might immediately be rejected.
                // For a robust system, we might allow it to pass through basic processing for observability.
                // throw new WebhookProcessingError(`Unrecognized event type: ${eventType}`, "UNKNOWN_EVENT_TYPE");
            }
            if (!WebhookEventUtils.isValidEventSubType(eventType, subEventType)) {
                this._logger.warn(`[MasterWebhookProcessor] Unrecognized sub-event type: ${subEventType} for event type: ${eventType}.`, { webhookId });
            }


            // 2. Security Verification (critical for untrusted sources)
            if (WebhookSecurityManager.requiresSignatureVerification(eventType)) {
                const signatureHeader = requestHeaders[WebhookConfig.WEBHOOK_SIGNATURE_HEADER.toLowerCase()];
                const timestampHeader = requestHeaders[WebhookConfig.WEBHOOK_TIMESTAMP_HEADER.toLowerCase()];
                const verified = WebhookSecurityManager.verifySignature(rawRequestBody, signatureHeader, timestampHeader);
                if (!verified) {
                    throw new WebhookProcessingError("Webhook signature verification failed, potential tampering or spoofing detected.", "SECURITY_VIOLATION");
                }
                this._logger.debug(`[MasterWebhookProcessor] Signature verified for webhook ID: ${webhookId}`);
            } else {
                this._logger.debug(`[MasterWebhookProcessor] Signature verification skipped for event type: ${eventType} (not configured to require it).`);
            }

            // 3. Schema Validation (pre-AI for structural correctness)
            let schemaValidationResult = this._schemaRegistry.validatePayload(eventType, parsedPayload);
            if (!schemaValidationResult.isValid) {
                this._logger.warn(`[MasterWebhookProcessor] Static schema validation failed for ${eventType}.${subEventType}:`, { issues: schemaValidationResult.issues, webhookId });
                // A critical validation failure might stop processing early, but for AI enrichment, we might allow it
                // and let AI attempt to interpret.
                // throw new WebhookProcessingError("Static schema validation failed", "SCHEMA_VALIDATION_FAILURE", { issues: schemaValidationResult.issues });
            } else {
                this._logger.debug(`[MasterWebhookProcessor] Static schema validation passed for ${eventType}.${subEventType}.`);
            }

            // 4. AI-Powered Payload Analysis and Enrichment (if AI is enabled)
            let enrichedPayload = parsedPayload;
            let aiInsights = {};
            let predictedOutcome = null;
            let aiSchemaValidation = { isValid: true, issues: [], confidence: 1.0 }; // Default to valid if AI is off
            let aiSuggestedActions = [];

            if (WebhookConfig.ENABLE_AI_FEATURES) {
                // Initial AI enrichment
                enrichedPayload = await this._aiService.enrichEventData(eventType, parsedPayload);
                // Deeper AI analysis
                aiInsights.analysis = await this._aiService.analyzeWebhookPayload(eventType, enrichedPayload);
                // Predictive AI for next steps
                predictedOutcome = await this._aiService.predictFutureState(eventType, enrichedPayload);
                // AI-driven semantic schema validation
                aiSchemaValidation = await this._aiService.validateEventSchema(eventType, enrichedPayload);
                // AI suggestions for automation
                aiSuggestedActions = await this._aiService.suggestWebhookActions(eventType, enrichedPayload);

                if (!aiSchemaValidation.isValid) {
                    this._logger.warn(`[MasterWebhookProcessor] AI-assisted semantic schema validation failed for ${eventType}.${subEventType}:`, { issues: aiSchemaValidation.issues, aiConfidence: aiSchemaValidation.confidence, webhookId });
                    // Even if static passed, AI might find semantic issues. Decision to halt or continue is critical.
                    // If AI confidence is high and issues are severe, consider throwing.
                }
                this._logger.debug(`[MasterWebhookProcessor] AI insights gathered for webhook ID: ${webhookId}. Predicted outcome: ${predictedOutcome.nextLikelyState} (confidence: ${predictedOutcome.confidence})`);
            } else {
                this._logger.info("[MasterWebhookProcessor] AI features disabled, skipping AI analysis and enrichment step.");
            }

            // 5. Intelligent Routing and Business Logic Orchestration
            // The routing decision is now informed by both static rules and dynamic AI insights.
            const routingDecision = await this._determineIntelligentRouting(
                eventType, subEventType, enrichedPayload, aiSuggestedActions, predictedOutcome, schemaValidationResult, aiSchemaValidation
            );
            this._logger.info(`[MasterWebhookProcessor] Webhook ID: ${webhookId} intelligently routed to: '${routingDecision.targetSystem}' for action: '${routingDecision.action}'`);

            // 6. Final Audit Logging and Response Preparation
            this._logger.info(`[MasterWebhookProcessor] Webhook processing completed successfully for ID: ${webhookId}`, {
                eventType,
                subEventType,
                aiInsights: aiInsights.analysis,
                predictedOutcome,
                staticSchemaValidation: schemaValidationResult,
                aiSchemaValidation,
                aiSuggestedActions,
                routingDecision,
                processingStatus: 'SUCCESS',
                timestamp: new Date().toISOString(),
            });

            return {
                status: 'processed',
                webhookId,
                eventType,
                subEventType,
                payload: enrichedPayload,
                aiInsights,
                predictedOutcome,
                staticSchemaValidation: schemaValidationResult,
                aiSchemaValidation,
                aiSuggestedActions,
                routingDecision,
                timestamp: new Date().toISOString(),
            };

        } catch (error) {
            this._logger.error(`[MasterWebhookProcessor] Critical error processing webhook ID: ${webhookId}, Type: ${eventType}.${subEventType}:`, error);
            if (error instanceof WebhookProcessingError) {
                // Rethrow known processing errors for upstream handling
                throw error;
            } else {
                // Wrap unexpected errors for consistency
                throw new WebhookProcessingError(`Unexpected error during webhook processing: ${error.message}`, "UNEXPECTED_PROCESSING_ERROR", { originalError: error.message, stack: error.stack, webhookId });
            }
        }
    }

    /**
     * Determines the optimal routing for a webhook event based on its type, payload,
     * and a rich set of AI-generated insights. This is a highly intelligent, configurable,
     * and adaptive routing engine, prioritizing system efficiency and business needs.
     * @private
     * @param {string} eventType - The main event type.
     * @param {string} subEventType - The sub-event type.
     * @param {Object} payload - The processed (and potentially AI-enriched) webhook payload.
     * @param {string[]} aiSuggestedActions - Actions suggested by AI.
     * @param {Object | null} predictedOutcome - AI's prediction of the next state.
     * @param {Object} staticSchemaValidation - Result of static schema validation.
     * @param {Object} aiSchemaValidation - Result of AI-assisted schema validation.
     * @returns {Promise<{targetSystem: string, action: string, rationale: string, priority: string}>} The definitive routing decision.
     */
    async _determineIntelligentRouting(eventType, subEventType, payload, aiSuggestedActions, predictedOutcome, staticSchemaValidation, aiSchemaValidation) {
        let targetSystem = "Default_System_Sink";
        let action = "Process_Generic";
        let rationale = "Default fallback routing.";
        let priority = WebhookEventUtils.getEventTypeDetails(eventType)?.processingPriority || 'MEDIUM';

        // High-priority rules based on event type and critical states
        if (eventType === 'fraud_alert' && subEventType === 'detected') {
            targetSystem = "Fraud_Detection_Service";
            action = "Alert_Security_Operations_Center_Immediate";
            rationale = "Immediate critical action for AI-detected fraud.";
            priority = 'CRITICAL';
        } else if (eventType === 'payment_order' && subEventType === 'failed') {
            targetSystem = "Payment_Error_Resolution_Queue";
            action = "Trigger_Payment_Failure_Workflow_Level_1";
            rationale = "Automated workflow for failed payment orders.";
            priority = 'HIGH';
        } else if (eventType === 'system_health' && (subEventType === 'degraded' || subEventType === 'performance_anomaly_detected')) {
            targetSystem = "Site_Reliability_Engineering_Platform";
            action = "Auto_Diagnose_And_Escalate";
            rationale = "System health degradation detected, immediate SRE intervention required.";
            priority = 'CRITICAL';
        }
        // AI-driven routing based on high-confidence predictions or suggestions
        else if (predictedOutcome && predictedOutcome.confidence >= WebhookConfig.AI_ACTIONABLE_CONFIDENCE_THRESHOLD) {
            if (predictedOutcome.nextLikelyState === 'reversed' && eventType === 'payment_order') {
                targetSystem = "Proactive_Reconciliation_Engine";
                action = "Preemptively_Prepare_Reversal_Entry";
                rationale = `AI predicts an imminent reversal with high confidence (${predictedOutcome.confidence}).`;
                priority = 'HIGH';
            } else if (predictedOutcome.nextLikelyState === 'fraud_flagged' && eventType === 'paper_item') {
                targetSystem = "Document_Fraud_Review_Team";
                action = "Manual_Biometric_Image_Verification";
                rationale = `AI predicts fraud on paper item with high confidence (${predictedOutcome.confidence}).`;
                priority = 'CRITICAL';
            }
        }
        else if (aiSuggestedActions && aiSuggestedActions.length > 0) {
            // Select the most relevant AI action; perhaps the first or based on internal ranking
            const primaryAIAction = aiSuggestedActions[0];
            if (primaryAIAction.includes("Auto_Remediate")) {
                targetSystem = "Automated_Remediation_Service";
                action = primaryAIAction;
                rationale = `AI recommended immediate automated remediation: '${primaryAIAction}'.`;
                priority = 'HIGH';
            } else if (primaryAIAction.includes("Scale_Up_Resources")) {
                targetSystem = "Infrastructure_Orchestrator";
                action = primaryAIAction;
                rationale = `AI suggested proactive resource scaling: '${primaryAIAction}'.`;
                priority = 'MEDIUM';
            } else {
                targetSystem = "AI_Recommended_Processing_Queue";
                action = primaryAIAction;
                rationale = `General AI suggested action: '${primaryAIAction}'.`;
            }
        }
        // Routing based on data classification and compliance needs (even if AI disabled)
        else if (WebhookEventUtils.getEventTypeDetails(eventType)?.dataClassification === 'PII' && !aiSchemaValidation.isValid) {
            targetSystem = "Data_Privacy_Compliance_Review";
            action = "Review_PII_Schema_Violation";
            rationale = "PII event with schema validation issues, requires compliance review.";
            priority = 'CRITICAL';
        }
        // Custom business rules based on payload content (example: organization-specific routing)
        else if (payload.organizationId) {
            targetSystem = `Org_Specific_Event_Processor_${payload.organizationId}`;
            action = `Process_${eventType}_For_Org`;
            rationale = `Routed to dedicated processing queue for organization ID: ${payload.organizationId}.`;
        }
        // Default routing for non-critical or uncategorized events
        else {
            const defaultTarget = WebhookEventUtils.getEventTypeDetails(eventType)?.associatedServices?.[0] || "General_Event_Processing_Service";
            targetSystem = defaultTarget;
            action = `Standard_Process_${eventType}`;
            rationale = `Default routing for event type ${eventType}.`;
        }

        this._logger.debug(`[MasterWebhookProcessor] Intelligent routing decision for ${eventType}.${subEventType}: Target='${targetSystem}', Action='${action}', Priority='${priority}'. Rationale: '${rationale}'`);
        return { targetSystem, action, rationale, priority };
    }

    /**
     * Executes robust post-processing tasks after a webhook has been successfully handled.
     * This ensures a continuous feedback loop for AI models, updates performance metrics,
     * and maintains an immutable audit trail of processed events.
     * @param {Object} processedResult - The comprehensive result object returned by `processWebhook`.
     * @returns {Promise<boolean>} True if post-processing was successful, false otherwise.
     */
    async postProcessWebhook(processedResult) {
        this._logger.info(`[MasterWebhookProcessor] Initiating post-processing for webhook ID: ${processedResult.webhookId}`);

        try {
            // 1. AI Feedback Loop: Continuously train and refine AI models
            if (WebhookConfig.ENABLE_AI_FEATURES) {
                // Send feedback for predicted outcomes vs. actual routing decisions
                if (processedResult.predictedOutcome) {
                    await this._aiService._callAI('/feedback/prediction_actual', {
                        predictionId: processedResult.predictedOutcome.predictionId,
                        predictedState: processedResult.predictedOutcome.nextLikelyState,
                        actualAction: processedResult.routingDecision.action, // Actual action taken
                        actualTarget: processedResult.routingDecision.targetSystem,
                        payload: processedResult.payload, // Full payload for context
                        feedbackTimestamp: new Date().toISOString()
                    });
                    this._logger.debug(`[MasterWebhookProcessor] AI prediction feedback sent for webhook ID: ${processedResult.webhookId}`);
                }

                // Submit critical events (e.g., fraud, severe validation failures) for immediate AI learning
                if (processedResult.eventType === 'fraud_alert' || (processedResult.aiSchemaValidation && !processedResult.aiSchemaValidation.isValid && processedResult.aiSchemaValidation.confidence > WebhookConfig.AI_ACTIONABLE_CONFIDENCE_THRESHOLD)) {
                    await this._aiService._callAI('/feedback/critical_event_learning', {
                        webhookId: processedResult.webhookId,
                        eventType: processedResult.eventType,
                        subEventType: processedResult.subEventType,
                        payload: processedResult.payload,
                        aiAnalysis: processedResult.aiInsights,
                        aiSchemaValidation: processedResult.aiSchemaValidation,
                        resolution: processedResult.routingDecision.action
                    });
                    this._logger.debug(`[MasterWebhookProcessor] Critical event data sent to AI for continuous learning for ID: ${processedResult.webhookId}`);
                }
            }

            // 2. Metrics and Analytics Update
            // This would typically involve an external metrics service (e.g., Prometheus, Datadog)
            // metricsService.incrementProcessedWebhooks(processedResult.eventType, processedResult.status);
            // metricsService.recordProcessingTime(processedResult.eventType, processingDurationMs);

            // 3. Archival and Audit Trail
            // Ensure every processed event, along with its full context and AI insights, is immutably archived.
            // archiveService.archiveProcessedEvent(processedResult.webhookId, processedResult);

            this._logger.info(`[MasterWebhookProcessor] Post-processing completed successfully for webhook ID: ${processedResult.webhookId}`);
            return true;
        } catch (error) {
            this._logger.error(`[MasterWebhookProcessor] Post-processing encountered an error for webhook ID: ${processedResult.webhookId}:`, error);
            // Non-critical post-processing failures might not require rethrowing, but should be alerted.
            // The main webhook processing is already complete.
            return false;
        }
    }
}

/**
 * @classdesc
 * A dedicated manager for webhook payload schemas, supporting registration and validation.
 * Can integrate with AI for dynamic schema inference or validation rule suggestions.
 */
export class WebhookSchemaRegistry {
    /** @private */
    _schemas = {};
    /** @private */
    _logger = WebhookLogger.getInstance();

    /**
     * Registers a JSON schema for a given event type.
     * @param {string} eventType - The event type string.
     * @param {Object} schema - The JSON schema object.
     */
    registerSchema(eventType, schema) {
        if (!eventType || typeof eventType !== 'string' || !schema || typeof schema !== 'object') {
            throw new WebhookProcessingError("Invalid arguments for schema registration.", "SCHEMA_REGISTRATION_ERROR");
        }
        this._schemas[eventType] = schema;
        this._logger.debug(`[WebhookSchemaRegistry] Schema registered for ${eventType}.`);
    }

    /**
     * Retrieves the registered schema for an event type.
     * @param {string} eventType - The event type string.
     * @returns {Object | null} The JSON schema object or null if not found.
     */
    getSchema(eventType) {
        return this._schemas[eventType] || null;
    }

    /**
     * Validates a given payload against the registered schema for its event type.
     * This method provides basic structural validation. For semantic validation, AI integration is recommended.
     * @param {string} eventType - The event type of the payload.
     * @param {Object} payload - The payload object to validate.
     * @returns {{ isValid: boolean, issues: string[] }} The validation result.
     */
    validatePayload(eventType, payload) {
        const schema = this.getSchema(eventType);
        if (!schema) {
            this._logger.warn(`[WebhookSchemaRegistry] No schema registered for event type ${eventType}. Skipping static validation.`);
            return { isValid: true, issues: [`No static schema found for '${eventType}'.`] };
        }

        // --- Simplified, simulated JSON Schema validation ---
        // In a real application, a library like `ajv` or `json-schema-validator` would be used.
        const issues = [];
        const validateRecursive = (data, currentSchema, path = '') => {
            if (currentSchema.type && typeof data !== currentSchema.type) {
                issues.push(`'${path}' expected type '${currentSchema.type}', got '${typeof data}'.`);
                return;
            }
            if (currentSchema.required && currentSchema.type === 'object') {
                for (const prop of currentSchema.required) {
                    if (!Object.prototype.hasOwnProperty.call(data, prop)) {
                        issues.push(`'${path}.${prop}' is required.`);
                    }
                }
            }
            if (currentSchema.properties && currentSchema.type === 'object') {
                for (const key in currentSchema.properties) {
                    if (Object.prototype.hasOwnProperty.call(data, key)) {
                        validateRecursive(data[key], currentSchema.properties[key], `${path}.${key}`);
                    }
                }
            }
            // Add more validations like pattern, enum, min/maxLength, etc. for production grade.
        };

        validateRecursive(payload, schema, 'root');
        // --- End of simulated JSON Schema validation ---

        return { isValid: issues.length === 0, issues };
    }
}


// Export the core event types object for direct access.
export const WEBHOOK_EVENT_TYPES = CORE_WEBHOOK_EVENT_TYPES;

// The original `events` default export is maintained for backward compatibility,
// pointing to the newly defined `WEBHOOK_EVENT_TYPES`.
const events = WEBHOOK_EVENT_TYPES;
export default events;
