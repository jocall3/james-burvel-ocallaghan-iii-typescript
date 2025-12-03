/**
 * This module implements the Ethical Governor View, a pivotal component within a revolutionary, multi-million dollar financial infrastructure platform.
 * It provides real-time oversight and dynamic management of intelligent automation, digital identity, programmable value rails, and real-time settlement systems.
 *
 * Business impact: This view acts as the central command for AI governance, ensuring immutable compliance with ethical principles and stringent regulatory mandates.
 * It enables rapid detection and autonomous remediation of biased, non-compliant, or high-risk AI and agentic actions, significantly reducing systemic operational risk,
 * preventing catastrophic reputational damage, and safeguarding integral consumer and institutional trust. By establishing auditable transparency and human-in-the-loop
 * oversight into AI and agent decision-making across complex financial workflows, it lays the foundation for robust, ethical AI deployment. This empowers the organization
 * to confidently leverage advanced AI for generating unprecedented revenue streams and achieving unparalleled operational efficiencies, all while maintaining absolute
 * regulatory integrity and proactively preventing multi-billion dollar penalties. Its configurable policy engine, agent communication layers, and human-in-the-loop
 * workflows ensure adaptive, intelligent governance, which is critical for navigating dynamic global financial markets and evolving ethical standards in digital finance.
 *
 * Long-term business value: Positions the platform as the secure, transparent, and intelligent backbone for the next phase of global digital finance,
 * attracting institutional adoption and facilitating the creation of new financial products and services that demand uncompromised ethical and regulatory compliance.
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

/**
 * Defines the structure for an AI-generated action request, which is subject to ethical governance.
 * Business impact: Standardizes the input format for all automated actions requiring oversight,
 * ensuring consistency, auditability, and clear context for governance decisions across the platform.
 * This is vital for transparent operations in critical financial infrastructure.
 */
export interface ActionRequest {
  id: string;
  timestamp: Date;
  sourceAI: string;
  action: string;
  subjectId: string;
  subjectType: 'USER' | 'CONTENT' | 'SYSTEM' | 'DEVICE' | 'TRANSACTION';
  payload: Record<string, any>;
  rationale: string;
  context: Record<string, any>;
  riskScore: number;
  transactionDetails?: { // Enhanced for integration with token rails and payment infrastructure
    type: 'PAYMENT' | 'TOKEN_TRANSFER' | 'LOAN_DISBURSEMENT' | 'LIQUIDITY_PROVISION';
    transactionId: string;
    amount: number;
    currency: string;
    targetAccount?: string;
    sourceAccount?: string;
    rail?: string; // e.g., 'rail_fast', 'rail_batch', 'settlement_network_A'
    metadata?: Record<string, any>; // Additional details for programmable value
  };
}

/**
 * Encapsulates the Ethical Governor's decision and rationale regarding an ActionRequest.
 * Business impact: Provides a clear, auditable record of governance outcomes, demonstrating
 * regulatory compliance and the platform's commitment to ethical AI operation. This transparency
 * is critical for building trust with regulators and partners.
 */
export interface GovernanceResponse {
  decision: 'APPROVE' | 'VETO' | 'FLAG_FOR_REVIEW' | 'APPROVE_WITH_WARNING';
  governorVersion: string;
  reason?: string;
  violatesPrinciple?: string[];
  vetoDetails?: {
    policyId: string;
    policyName: string;
    thresholdValue?: number | string;
    actualValue?: number | string;
  };
  suggestedRemediation?: string[];
  reviewRequired?: boolean;
  humanReviewerId?: string;
  reviewOutcome?: 'APPROVED' | 'OVERRIDDEN' | 'MODIFIED' | 'REJECTED_REMEDIATION';
  reviewNotes?: string;
  reviewTimestamp?: Date;
  appliedRemediationIds?: string[]; // Tracks executed remediations
}

/**
 * Represents a comprehensive log entry of an AI action request combined with its governance response and current status.
 * Business impact: Serves as the primary auditable artifact for AI actions, providing end-to-end traceability
 * from initiation to resolution. This record is invaluable for post-incident analysis, compliance reporting,
 * and demonstrating ethical diligence in autonomous operations.
 */
export type GovernedActionLogEntry = ActionRequest & {
  response?: GovernanceResponse;
  status: 'PENDING' | 'GOVERNED' | 'HUMAN_REVIEW' | 'COMPLETED' | 'REMEDIATED';
};

/**
 * Defines a core ethical principle guiding AI behavior and policy creation.
 * Business impact: Formalizes the ethical foundation of the platform, enabling a robust
 * and auditable framework for moral and regulatory compliance. It ensures AI systems operate
 * within defined values, protecting brand reputation and fostering public trust.
 */
export interface EthicalPrinciple {
  id: string;
  name: string;
  description: string;
  guidance: string[];
  category: 'SOCIAL' | 'TECHNICAL' | 'LEGAL' | 'HUMAN_CENTERED' | 'FINANCIAL_INTEGRITY'; // Added FINANCIAL_INTEGRITY
  priority: number;
  keywords: string[];
  isActive: boolean;
  version: number;
  lastUpdated: Date;
}

/**
 * Specifies an ethical policy rule that the Governor applies to AI actions.
 * Business impact: Directly translates ethical principles into actionable, automated governance
 * logic, enabling real-time enforcement and significantly reducing manual oversight. This ensures
 * scalable, consistent compliance and reduces operational risk in complex AI-driven financial processes.
 */
export interface EthicalPolicyRule {
  id: string;
  name: string;
  description: string;
  principleId: string;
  sourceAIModels: string[];
  actionTypes: string[];
  conditionType: 'CONTEXT_MATCH' | 'PAYLOAD_EVAL' | 'RISK_THRESHOLD' | 'EXTERNAL_DATA_CHECK' | 'TRANSACTION_RULE' | 'AGENT_BEHAVIOR_PATTERN'; // Added TRANSACTION_RULE, AGENT_BEHAVIOR_PATTERN
  condition: Record<string, any>; // JSON structure defining the evaluation criteria
  evaluationScript?: string; // Optional script for complex condition evaluation
  decisionEffect: 'VETO' | 'FLAG_FOR_REVIEW' | 'APPROVE_WITH_WARNING';
  violationSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  suggestedRemediationTemplate?: string[];
  isActive: boolean;
  version: number;
  lastUpdated: Date;
  creationDate: Date;
  enforcementThreshold?: number; // Numeric threshold for condition evaluation
}

/**
 * Describes a registered AI model or intelligent agent operating within the platform.
 * Business impact: Provides a comprehensive inventory and risk profile of all AI components,
 * facilitating transparent governance, lifecycle management, and accountability. This is essential
 * for managing the expanding ecosystem of AI agents in a regulated financial environment.
 */
export interface AIModelProfile {
  id: string;
  name: string;
  description: string;
  developerTeam: string;
  deploymentEnvironment: string;
  dataSources: string[];
  inputFeatures: string[];
  outputActions: string[];
  ethicalRiskCategory: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
  governorIntegrationStatus: 'INTEGRATED' | 'PENDING' | 'DISABLED';
  lastUpdated: Date;
  registeredDate: Date;
  contactPerson: string;
  agentCapabilities?: string[]; // Capabilities if this model is part of an agentic system
  agentId?: string; // Link to an agent ID if applicable, indicating autonomous operation
}

/**
 * Represents an immutable, cryptographically-chained log entry for all significant system events.
 * Business impact: Forms the foundation of the platform's tamper-evident audit trail,
 * guaranteeing data integrity and providing irrefutable proof of all actions and decisions.
 * This satisfies stringent regulatory requirements and builds unparalleled trust in system operations.
 */
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  eventType: 'GOVERNANCE_DECISION' | 'POLICY_UPDATE' | 'AI_MODEL_REGISTER' | 'HUMAN_REVIEW_ACTION' | 'SYSTEM_ALERT' | 'IDENTITY_ACCESS_CHANGE' | 'REMEDIATION_EXECUTION' | 'AGENT_ACTIVITY'; // Added event types
  entityId: string;
  entityType: 'ACTION_REQUEST' | 'POLICY_RULE' | 'AI_MODEL' | 'HUMAN_REVIEW' | 'GOVERNOR_SYSTEM' | 'USER_IDENTITY' | 'REMEDIATION' | 'AGENT_ACTIVITY_LOG'; // Added entity types
  details: Record<string, any>;
  userId?: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  immutableHash?: string; // For tamper-evident logging, cryptographically chaining entries
  previousHash?: string; // Hash of the preceding log entry for integrity chain
}

/**
 * Defines a task assigned to a human reviewer, typically triggered by a flagged AI action.
 * Business impact: Enables critical human-in-the-loop oversight, allowing experts to resolve
 * complex ethical dilemmas or policy violations that AI cannot fully handle. This balances
 * automation with human judgment, reducing risk and improving decision quality.
 */
export interface HumanReviewTask {
  id: string;
  actionRequestId: string;
  status: 'PENDING' | 'IN_REVIEW' | 'COMPLETED' | 'ESCALATED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  assignedTo?: string; // User ID of the reviewer
  reviewDeadline: Date;
  reviewType: 'VETO_OVERRIDE' | 'FLAGGED_ACTION' | 'POLICY_VIOLATION_REVIEW' | 'COMPLAINT_RESOLUTION' | 'RISK_MITIGATION'; // Added RISK_MITIGATION
  contextSummary: string;
  decisionOptions: string[]; // Options presented to the reviewer
  reviewerNotes?: string;
  reviewTimestamp?: Date;
  resolution?: 'APPROVED' | 'OVERRIDDEN' | 'MODIFIED' | 'REJECTED_REMEDIATION';
  resolvedBy?: string; // User ID of the resolver
  suggestedRemediationId?: string; // Link to a proposed remediation action
}

/**
 * Describes a proposed or executed action to correct or mitigate the impact of an AI decision or system anomaly.
 * Business impact: Provides a structured mechanism for corrective actions, enabling rapid response to ethical
 * violations or operational issues. This minimizes potential financial losses, reputational damage, and
 * ensures continuous improvement of AI governance.
 */
export interface RemediationAction {
  id: string;
  actionRequestId: string; // The original action request to which this remediation applies
  status: 'PENDING' | 'SUGGESTED' | 'EXECUTED' | 'FAILED' | 'REVIEWED';
  type: 'MODIFY_AI_INPUT' | 'REJECT_ACTION' | 'REQUEST_MORE_INFO' | 'HUMAN_OVERRIDE' | 'RETRAIN_MODEL' | 'PAUSE_AI_AGENT' | 'REVERSE_TRANSACTION' | 'ADJUST_CREDIT_LIMIT' | 'NOTIFY_REGULATOR' | 'APPLY_COMPLIANCE_HOLD'; // Added agent/financial/compliance actions
  description: string;
  proposedBy: 'GOVERNOR' | 'HUMAN' | 'AGENT';
  proposedByAgentId?: string; // If proposed by an autonomous agent
  agentIdToAffect?: string; // If the remediation targets a specific agent
  executionDetails?: Record<string, any>; // Details about the actual execution process
  executionPayload?: Record<string, any>; // The specific data or commands used for execution
  executionTimestamp?: Date;
  feedback?: string; // Feedback on remediation effectiveness
  triggeredByPolicyId?: string;
  executionLog?: AuditLogEntry[]; // Log of remediation execution steps
}

/**
 * Represents a comprehensive report detailing compliance status over a specified period.
 * Business impact: Facilitates regulatory reporting and internal accountability, providing
 * a clear, data-driven overview of the platform's adherence to ethical principles and policies.
 * This is crucial for maintaining licenses, avoiding fines, and demonstrating robust governance.
 */
export interface ComplianceReport {
  id: string;
  reportName: string;
  generationDate: Date;
  startDate: Date;
  endDate: Date;
  status: 'GENERATED' | 'DRAFT' | 'ARCHIVED';
  metrics: {
    totalRequests: number;
    vetoedRequests: number;
    humanReviewedRequests: number;
    principlesViolated: Record<string, number>;
    topViolatingModels: Record<string, number>;
    averageReviewTimeMs: number;
    vetoOverrideRate: number;
    transactionalActionsFlagged?: number; // For payments integration
    transactionalActionsVetoed?: number; // For payments integration
    successfulRemediations?: number; // Count of successfully executed remediations
  };
  summary: string;
  filePath?: string; // Simulated path for report storage
  createdBy: string;
}

/**
 * Captures feedback or complaints submitted by users regarding AI-driven actions or system behavior.
 * Business impact: Provides a direct channel for user input, enabling the system to detect and
 * address issues that might not be caught by automated governance. This enhances user trust,
 * improves system fairness, and offers valuable data for continuous improvement and dispute resolution.
 */
export interface UserFeedback {
  id: string;
  timestamp: Date;
  userId: string;
  actionRequestId: string;
  feedbackType: 'COMPLAINT' | 'SUGGESTION' | 'INQUIRY' | 'PRAISE' | 'DISPUTE_TRANSACTION'; // Added DISPUTE_TRANSACTION
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  contactEmail?: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  resolutionNotes?: string;
  resolvedBy?: string;
}

/**
 * Defines an alert for detected anomalies in AI behavior, system performance, or policy adherence.
 * Business impact: Enables proactive identification and response to potential risks, security threats,
 * or operational drifts within the AI ecosystem. This minimizes the window for adverse events,
 * protecting financial assets and maintaining system integrity.
 */
export interface AnomalyAlert {
  id: string;
  timestamp: Date;
  type: 'UNEXPECTED_VETO_RATE' | 'MODEL_BEHAVIOR_DRIFT' | 'POLICY_CIRCUMVENTION' | 'HIGH_RISK_ACCUMULATION' | 'UNUSUAL_TRANSACTION_PATTERN' | 'AGENT_GOVERNANCE_BREACH' | 'IDENTITY_COMPROMISE_ATTEMPT'; // Added types
  severity: 'CRITICAL' | 'WARNING';
  description: string;
  detectedBy: 'GOVERNOR' | 'EXTERNAL_MONITORING' | 'AGENT_MONITOR'; // Added AGENT_MONITOR
  relatedEntityId?: string;
  relatedEntityType?: 'AI_MODEL' | 'POLICY_RULE' | 'AGENT' | 'TRANSACTION' | 'USER_IDENTITY'; // Added AGENT, TRANSACTION, USER_IDENTITY
  status: 'ACTIVE' | 'RESOLVED' | 'INVESTIGATING';
  resolutionNotes?: string;
}

/**
 * Provides a snapshot of the health and operational status of a specific system component.
 * Business impact: Offers real-time observability into the platform's operational state,
 * enabling rapid identification of bottlenecks, failures, or performance degradation.
 * This ensures high availability and reliable operation of critical financial services.
 */
export interface SystemStatus {
  id: string;
  timestamp: Date;
  component: string;
  health: 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE';
  message: string;
  metrics?: Record<string, any>;
}

/**
 * Records a historical version of an ethical policy rule, including changes and the policy snapshot.
 * Business impact: Guarantees full auditability of policy evolution, providing immutable proof
 * of governance changes over time. This is critical for regulatory compliance, historical analysis,
 * and demonstrating transparency in policy management.
 */
export interface PolicyVersionHistory {
  id: string;
  policyId: string;
  version: number;
  timestamp: Date;
  changes: string;
  changedBy: string;
  policySnapshot: EthicalPolicyRule;
}

/**
 * Represents a digital identity within the system, crucial for secure authentication, authorization, and role-based access control (RBAC).
 * Business impact: This foundational component underpins the security and compliance of the entire platform, enabling granular access management
 * for human users, automated agents, and services. It provides a trusted framework for all interactions, reducing unauthorized access risks
 * and facilitating clear accountability in high-stakes financial operations.
 */
export interface UserIdentity {
  id: string;
  name: string;
  role: 'ADMIN' | 'ETHICS_REVIEWER' | 'AI_DEVELOPER' | 'COMPLIANCE_OFFICER' | 'AUDITOR' | 'SYSTEM';
  publicKey?: string; // Simulated for digital identity, for cryptographically signed interactions.
  lastLogin?: Date;
  isActive: boolean;
  securityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; // New: security level for identity
  associatedAgentId?: string; // New: If this identity is primarily for an agent
}

/**
 * Represents a log entry for an action or event initiated by an autonomous agent within the financial infrastructure.
 * Business impact: Provides granular visibility into the autonomous operations of intelligent agents, enabling auditability,
 * performance monitoring, and compliance verification for automated financial processes. This builds trust in agentic systems,
 * crucial for their expanded adoption in high-value operations.
 */
export interface AgentActivityLogEntry {
  id: string;
  timestamp: Date;
  agentId: string;
  agentName: string;
  eventType: 'OBSERVE' | 'DECIDE' | 'EXECUTE' | 'COMMUNICATE' | 'REMEDIATE' | 'REPORT';
  details: Record<string, any>;
  targetEntityId?: string;
  targetEntityType?: 'ACTION_REQUEST' | 'POLICY_RULE' | 'TRANSACTION' | 'USER_IDENTITY' | 'SYSTEM_COMPONENT';
  governanceDecisionId?: string; // Link to a specific governor decision if applicable
  status: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'BLOCKED';
  outcome?: string;
  immutableHash?: string; // For tamper-evident logging of agent activity
}

/**
 * Defines the structure for a key-value pair used in displaying system metrics.
 * Business impact: Standardizes the representation of operational statistics, enabling consistent
 * monitoring and visualization of platform performance crucial for maintaining SLAs and optimizing resource allocation.
 */
export interface MetricItem {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: 'green' | 'red' | 'yellow' | 'blue';
}

// --- MOCK DATA GENERATORS ---
let idCounter = 0;
const generateId = (prefix: string = 'id') => `${prefix}-${idCounter++}-${Date.now().toString().slice(-5)}`;

const mockAIModels: AIModelProfile[] = [
  {
    id: 'ai-loan-1', name: 'LoanApprovalModel', description: 'Approves or denies personal loan applications.',
    developerTeam: 'Fintech Innovations', deploymentEnvironment: 'production', dataSources: ['credit_bureaus', 'applicant_data'],
    inputFeatures: ['credit_score', 'income', 'debt_to_income_ratio', 'employment_status', 'demographic_zip_code'],
    outputActions: ['APPROVE_LOAN', 'DENY_LOAN', 'ADJUST_LOAN_TERMS'], ethicalRiskCategory: 'HIGH', governorIntegrationStatus: 'INTEGRATED',
    lastUpdated: new Date(), registeredDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), contactPerson: 'alice@example.com',
    agentCapabilities: ['assess_credit_risk', 'determine_loan_eligibility'], agentId: 'agent-loan-processor'
  },
  {
    id: 'ai-content-2', name: 'ContentModerationBot', description: 'Flags inappropriate user-generated content.',
    developerTeam: 'SocialGuard', deploymentEnvironment: 'production', dataSources: ['user_posts', 'community_guidelines'],
    inputFeatures: ['text_content', 'image_metadata', 'user_reputation'], outputActions: ['FLAG_CONTENT', 'REMOVE_CONTENT', 'WARN_USER'],
    ethicalRiskCategory: 'MEDIUM', governorIntegrationStatus: 'INTEGRATED', lastUpdated: new Date(),
    registeredDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), contactPerson: 'bob@example.com',
    agentCapabilities: ['monitor_content', 'apply_guidelines'], agentId: 'agent-content-mod'
  },
  {
    id: 'ai-recom-3', name: 'ProductRecommendationEngine', description: 'Recommends products to users based on browsing history.',
    developerTeam: 'E-commerce Growth', deploymentEnvironment: 'production', dataSources: ['browsing_history', 'purchase_data'],
    inputFeatures: ['user_id', 'product_category', 'view_history', 'purchase_history'], outputActions: ['RECOMMEND_PRODUCT'],
    ethicalRiskCategory: 'LOW', governorIntegrationStatus: 'INTEGRATED', lastUpdated: new Date(),
    registeredDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), contactPerson: 'charlie@example.com'
  },
  {
    id: 'ai-recruitment-4', name: 'TalentScoutAI', description: 'Assists HR in filtering job applications.',
    developerTeam: 'HR Tech', deploymentEnvironment: 'production', dataSources: ['resumes', 'job_descriptions', 'performance_data'],
    inputFeatures: ['education_level', 'experience_years', 'keywords_matched', 'previous_roles'], outputActions: ['SHORTLIST_CANDIDATE', 'REJECT_CANDIDATE'],
    ethicalRiskCategory: 'HIGH', governorIntegrationStatus: 'INTEGRATED', lastUpdated: new Date(),
    registeredDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000), contactPerson: 'diana@example.com',
    agentCapabilities: ['screen_candidates', 'match_skills'], agentId: 'agent-hr-scout'
  },
  {
    id: 'ai-medical-5', name: 'DiagnosticAssistant', description: 'Provides preliminary diagnostic suggestions to medical professionals.',
    developerTeam: 'Health AI', deploymentEnvironment: 'production', dataSources: ['patient_records', 'medical_literature', 'imaging_data'],
    inputFeatures: ['symptoms', 'medical_history', 'test_results'], outputActions: ['SUGGEST_DIAGNOSIS', 'RECOMMEND_TESTS'],
    ethicalRiskCategory: 'CRITICAL', governorIntegrationStatus: 'PENDING', lastUpdated: new Date(),
    registeredDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), contactPerson: 'eve@example.com',
    agentCapabilities: ['analyze_medical_data', 'propose_diagnoses'], agentId: 'agent-med-diag'
  },
  {
    id: 'ai-payment-6', name: 'FraudDetectionAgent', description: 'Monitors real-time transactions for suspicious activity.',
    developerTeam: 'Financial Security', deploymentEnvironment: 'production', dataSources: ['transaction_history', 'user_behavior', 'blacklists'],
    inputFeatures: ['amount', 'currency', 'recipient', 'sender', 'location', 'timestamp', 'transaction_type'], outputActions: ['FLAG_TRANSACTION', 'BLOCK_TRANSACTION', 'REQUEST_MFA'],
    ethicalRiskCategory: 'HIGH', governorIntegrationStatus: 'INTEGRATED', lastUpdated: new Date(),
    registeredDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000), contactPerson: 'frank@example.com',
    agentCapabilities: ['monitor_payments', 'risk_score_transactions', 'enforce_rules'], agentId: 'agent-fraud'
  },
];

const mockEthicalPrinciples: EthicalPrinciple[] = [
  {
    id: 'ep-fairness', name: 'Fairness and Non-Discrimination', description: 'AI systems should treat all individuals and groups fairly, avoiding unjust or discriminatory outcomes.',
    guidance: ['Avoid bias in data and algorithms', 'Ensure equitable access and outcomes', 'Protect vulnerable groups'], category: 'SOCIAL', priority: 1,
    keywords: ['bias', 'discrimination', 'equity', 'equality'], isActive: true, version: 1, lastUpdated: new Date()
  },
  {
    id: 'ep-transparency', name: 'Transparency and Explainability', description: 'AI systems should be understandable, and their decisions should be explainable to relevant stakeholders.',
    guidance: ['Provide clear rationales for decisions', 'Document model architectures and data sources', 'Make limitations clear'], category: 'TECHNICAL', priority: 2,
    keywords: ['explainability', 'interpretability', 'auditability'], isActive: true, version: 1, lastUpdated: new Date()
  },
  {
    id: 'ep-accountability', name: 'Accountability and Responsibility', description: 'Mechanisms should be in place to ensure accountability for the outcomes of AI systems, with clear lines of responsibility.',
    guidance: ['Define human oversight points', 'Establish clear roles for AI development and deployment', 'Implement robust audit trails'], category: 'LEGAL', priority: 1,
    keywords: ['governance', 'liability', 'oversight'], isActive: true, version: 1, lastUpdated: new Date()
  },
  {
    id: 'ep-safety', name: 'Safety and Reliability', description: 'AI systems should be robust, secure, and operate safely and reliably as intended.',
    guidance: ['Rigorous testing and validation', 'Mitigate risks of unintended harm', 'Implement security measures'], category: 'TECHNICAL', priority: 1,
    keywords: ['robustness', 'security', 'safety', 'reliability'], isActive: true, version: 1, lastUpdated: new Date()
  },
  {
    id: 'ep-privacy', name: 'Privacy and Data Governance', description: 'AI systems should respect privacy and handle data responsibly and securely.',
    guidance: ['Adhere to data protection regulations', 'Implement strong data anonymization/encryption', 'Ensure data minimization'], category: 'LEGAL', priority: 1,
    keywords: ['GDPR', 'data protection', 'anonymization'], isActive: true, version: 1, lastUpdated: new Date()
  },
  {
    id: 'ep-financial-integrity', name: 'Financial Integrity and Fraud Prevention', description: 'AI systems involved in financial transactions must uphold financial integrity, prevent fraud, and ensure transactional security.',
    guidance: ['Detect and prevent fraudulent activities', 'Ensure transactional atomicity and idempotency', 'Comply with AML/CTF regulations'], category: 'FINANCIAL_INTEGRITY', priority: 1,
    keywords: ['fraud', 'AML', 'CTF', 'transactional security'], isActive: true, version: 1, lastUpdated: new Date()
  },
];

const mockEthicalPolicyRules: EthicalPolicyRule[] = [
  {
    id: 'pr-loan-zip-code', name: 'Loan Denial Zip Code Disparity', description: 'Prevents automatic loan denials if the applicant resides in a zip code identified as economically vulnerable, to avoid indirect discrimination.',
    principleId: 'ep-fairness', sourceAIModels: ['LoanApprovalModel'], actionTypes: ['DENY_LOAN'],
    conditionType: 'CONTEXT_MATCH', condition: { field: 'context.demographic.zipCode', operator: 'IN', value: ['90210', '10001', '75001', '30303'] },
    decisionEffect: 'FLAG_FOR_REVIEW', violationSeverity: 'HIGH', suggestedRemediationTemplate: ['Review manually for alternative loan products', 'Require additional human assessment for financial hardship'],
    isActive: true, version: 1, lastUpdated: new Date(), creationDate: new Date(), enforcementThreshold: 0
  },
  {
    id: 'pr-content-hate-speech', name: 'Hate Speech Detection Override', description: 'Automatically vetoes content flagging if AI confidence is below 80% for hate speech, requiring human review for nuance.',
    principleId: 'ep-safety', sourceAIModels: ['ContentModerationBot'], actionTypes: ['FLAG_CONTENT', 'REMOVE_CONTENT'],
    conditionType: 'PAYLOAD_EVAL', condition: { field: 'payload.confidenceScore', operator: '<', value: 0.8, actionField: 'payload.flagType', actionValue: 'HATE_SPEECH' },
    decisionEffect: 'FLAG_FOR_REVIEW', violationSeverity: 'MEDIUM', suggestedRemediationTemplate: ['Escalate to human moderator for contextual review', 'Provide user with appeal options'],
    isActive: true, version: 1, lastUpdated: new Date(), creationDate: new Date(), enforcementThreshold: 0.8
  },
  {
    id: 'pr-loan-risk-threshold', name: 'High Risk Loan Denial Review', description: 'All loan denials where the AI-assessed risk score is above 90 must be reviewed by a human.',
    principleId: 'ep-accountability', sourceAIModels: ['LoanApprovalModel'], actionTypes: ['DENY_LOAN'],
    conditionType: 'RISK_THRESHOLD', condition: { field: 'riskScore', operator: '>', value: 90 },
    decisionEffect: 'FLAG_FOR_REVIEW', violationSeverity: 'HIGH', suggestedRemediationTemplate: ['Human review of all application details', 'Verify rationale with compliance officer'],
    isActive: true, version: 1, lastUpdated: new Date(), creationDate: new Date(), enforcementThreshold: 90
  },
  {
    id: 'pr-recruitment-gender-bias', name: 'Recruitment Gender Bias Check', description: 'Monitor for disproportionate rejection rates of specific genders in initial candidate screening.',
    principleId: 'ep-fairness', sourceAIModels: ['TalentScoutAI'], actionTypes: ['REJECT_CANDIDATE'],
    conditionType: 'EXTERNAL_DATA_CHECK', condition: { api: '/demographic-data', field: 'subjectId', operator: 'CHECK_FOR_DISPROPORTIONATE_IMPACT', demographicField: 'gender' },
    evaluationScript: 'function(action, demographics) { /* complex logic to check for statistical disparity */ return false; }',
    decisionEffect: 'FLAG_FOR_REVIEW', violationSeverity: 'CRITICAL', suggestedRemediationTemplate: ['Review rejected candidate pool for bias', 'Adjust model parameters or training data'],
    isActive: true, version: 1, lastUpdated: new Date(), creationDate: new Date()
  },
  {
    id: 'pr-medical-critical-diagnosis-review', name: 'Critical Diagnosis Human Override', description: 'Any critical diagnosis suggestions by AI must be approved by a human medical professional.',
    principleId: 'ep-safety', sourceAIModels: ['DiagnosticAssistant'], actionTypes: ['SUGGEST_DIAGNOSIS'],
    conditionType: 'PAYLOAD_EVAL', condition: { field: 'payload.diagnosisSeverity', operator: '==', value: 'CRITICAL' },
    decisionEffect: 'FLAG_FOR_REVIEW', violationSeverity: 'CRITICAL', suggestedRemediationTemplate: ['Require human clinician sign-off', 'Escalate to a medical review board'],
    isActive: true, version: 1, lastUpdated: new Date(), creationDate: new Date(), enforcementThreshold: 0
  },
  {
    id: 'pr-transaction-large-value', name: 'Large Value Transaction Review', description: 'Any payment transaction exceeding a defined threshold (e.g., $10,000) must be flagged for human review to ensure compliance and fraud prevention.',
    principleId: 'ep-financial-integrity', sourceAIModels: ['FraudDetectionAgent'], actionTypes: ['INITIATE_PAYMENT', 'TOKEN_TRANSFER', 'BLOCK_TRANSACTION', 'FLAG_TRANSACTION'],
    conditionType: 'TRANSACTION_RULE', condition: { field: 'transactionDetails.amount', operator: '>', value: 10000 },
    decisionEffect: 'FLAG_FOR_REVIEW', violationSeverity: 'HIGH', suggestedRemediationTemplate: ['Verify recipient identity', 'Confirm transaction purpose with sender', 'Hold funds until manual approval'],
    isActive: true, version: 1, lastUpdated: new Date(), creationDate: new Date(), enforcementThreshold: 10000
  },
  {
    id: 'pr-transaction-high-risk-recipient', name: 'High-Risk Recipient Block', description: 'Automatically veto transactions to recipients identified on a high-risk or sanctioned list.',
    principleId: 'ep-financial-integrity', sourceAIModels: ['FraudDetectionAgent'], actionTypes: ['INITIATE_PAYMENT', 'TOKEN_TRANSFER', 'BLOCK_TRANSACTION', 'FLAG_TRANSACTION'],
    conditionType: 'EXTERNAL_DATA_CHECK', condition: { api: '/risk-profile', field: 'transactionDetails.targetAccount', operator: 'IS_HIGH_RISK', value: true },
    evaluationScript: 'function(action, externalData) { return externalData.isSanctioned; }',
    decisionEffect: 'VETO', violationSeverity: 'CRITICAL', suggestedRemediationTemplate: ['Block transaction and report to compliance', 'Flag associated user account for review'],
    isActive: true, version: 1, lastUpdated: new Date(), creationDate: new Date()
  },
  {
    id: 'pr-agent-unauth-action', name: 'Agent Unauthorized Action Alert', description: 'Flags any action attempted by an agent that is outside its registered capabilities.',
    principleId: 'ep-accountability', sourceAIModels: mockAIModels.filter(m => m.agentId).map(m => m.name), actionTypes: ['*'],
    conditionType: 'AGENT_BEHAVIOR_PATTERN', condition: { field: 'context.agentCapabilitiesUsed', operator: 'NOT_IN_REGISTERED_CAPABILITIES', value: true },
    decisionEffect: 'FLAG_FOR_REVIEW', violationSeverity: 'CRITICAL', suggestedRemediationTemplate: ['Pause agent activity', 'Review agent configuration and last instructions'],
    isActive: true, version: 1, lastUpdated: new Date(), creationDate: new Date()
  },
];

const mockUsers: UserIdentity[] = [
  { id: 'user-admin-1', name: 'System Admin', role: 'ADMIN', isActive: true, publicKey: 'mock-pubkey-admin-1', securityLevel: 'CRITICAL' },
  { id: 'user-reviewer-1', name: 'Sarah Connor', role: 'ETHICS_REVIEWER', isActive: true, publicKey: 'mock-pubkey-reviewer-1', securityLevel: 'HIGH' },
  { id: 'user-reviewer-2', name: 'John Doe', role: 'ETHICS_REVIEWER', isActive: true, publicKey: 'mock-pubkey-reviewer-2', securityLevel: 'HIGH' },
  { id: 'user-developer-1', name: 'Jane Smith', role: 'AI_DEVELOPER', isActive: true, publicKey: 'mock-pubkey-developer-1', securityLevel: 'MEDIUM' },
  { id: 'user-compliance-1', name: 'Emily White', role: 'COMPLIANCE_OFFICER', isActive: true, publicKey: 'mock-pubkey-compliance-1', securityLevel: 'HIGH' },
  { id: 'user-auditor-1', name: 'David Lee', role: 'AUDITOR', isActive: true, publicKey: 'mock-pubkey-auditor-1', securityLevel: 'HIGH' },
  { id: 'system-agent-loan', name: 'Loan Processor Agent', role: 'SYSTEM', isActive: true, publicKey: 'mock-pubkey-agent-loan', securityLevel: 'MEDIUM', associatedAgentId: 'agent-loan-processor' },
  { id: 'system-agent-fraud', name: 'Fraud Monitoring Agent', role: 'SYSTEM', isActive: true, publicKey: 'mock-pubkey-agent-fraud', securityLevel: 'CRITICAL', associatedAgentId: 'agent-fraud' },
];

const generateMockActionRequest = (): ActionRequest => {
  const model = mockAIModels[Math.floor(Math.random() * mockAIModels.length)];
  const action = model.outputActions[Math.floor(Math.random() * model.outputActions.length)];
  let subjectType: ActionRequest['subjectType'] = 'USER';
  if (model.name.includes('Content')) subjectType = 'CONTENT';
  if (model.name.includes('FraudDetectionAgent') || action.includes('TRANSACTION') || action.includes('PAYMENT')) subjectType = 'TRANSACTION';

  let rationale = "Default rationale.";
  let payload: Record<string, any> = {};
  let context: Record<string, any> = {};
  let riskScore = Math.floor(Math.random() * 60) + 30; // 30-90
  let transactionDetails: ActionRequest['transactionDetails'] | undefined = undefined;

  // Simulate agent specific context for agent behavior policy
  if (model.agentId && Math.random() < 0.2) { // 20% chance of agent attempting unauthorized action
    const unauthorizedCapability = `unauthorized_skill_${Math.random().toString(36).substring(7)}`;
    context = { ...context, agentCapabilitiesUsed: [...(model.agentCapabilities || []), unauthorizedCapability] };
    rationale += ` Agent attempted unauthorized skill: ${unauthorizedCapability}.`;
  } else if (model.agentId) {
    context = { ...context, agentCapabilitiesUsed: model.agentCapabilities || [] };
  }

  switch (model.id) {
    case 'ai-loan-1':
      const creditScore = Math.floor(Math.random() * 350) + 300; // 300-650
      const income = Math.floor(Math.random() * 100000) + 30000;
      const dti = parseFloat((Math.random() * 0.5 + 0.2).toFixed(2)); // 0.20-0.70
      const zipCodes = ['90210', '10001', '75001', '30303', '60601', '94105'];
      const randomZip = zipCodes[Math.floor(Math.random() * zipCodes.length)];

      payload = { creditScore, income, debtToIncomeRatio: dti };
      context = { ...context, demographic: { zipCode: randomZip } };
      rationale = `Credit score is ${creditScore}, income is $${income}, DTI is ${dti}. Zip: ${randomZip}.`;
      riskScore = creditScore < 600 ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 50) + 30;
      if (action === 'APPROVE_LOAN') {
        transactionDetails = {
          type: 'LOAN_DISBURSEMENT',
          transactionId: generateId('txn'),
          amount: Math.floor(Math.random() * 50000) + 5000,
          currency: 'USD',
          targetAccount: `user-bank-${Math.floor(Math.random() * 1000)}`,
          rail: 'rail_batch',
          metadata: { loanTermMonths: 36, interestRate: 0.05 + Math.random() * 0.1 }
        };
      }
      break;
    case 'ai-content-2':
      const contentConfidence = parseFloat(Math.random().toFixed(2));
      const flagTypes = ['HATE_SPEECH', 'VIOLENCE', 'SPAM', 'ADULT_CONTENT'];
      const randomFlagType = flagTypes[Math.floor(Math.random() * flagTypes.length)];
      payload = { contentText: `User post about ${Math.random() > 0.5 ? 'controversial topic' : 'cat memes'}.`, confidenceScore: contentConfidence, flagType: randomFlagType };
      rationale = `Content flagged as ${randomFlagType} with confidence ${contentConfidence}.`;
      riskScore = contentConfidence < 0.8 ? Math.floor(Math.random() * 30) + 30 : Math.floor(Math.random() * 30) + 70;
      break;
    case 'ai-recruitment-4':
      const educationLevels = ['High School', 'Bachelors', 'Masters', 'PhD'];
      const experienceYears = Math.floor(Math.random() * 15) + 1;
      const randomEducation = educationLevels[Math.floor(Math.random() * educationLevels.length)];
      const candidateGender = Math.random() > 0.5 ? 'male' : 'female';
      payload = { education: randomEducation, experience: experienceYears, candidateGender };
      context = { ...context, demographic: { gender: candidateGender } };
      rationale = `Candidate with ${randomEducation} and ${experienceYears} years experience.`;
      riskScore = experienceYears < 3 ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 50) + 30;
      break;
    case 'ai-medical-5':
      const diagnosisSeverities = ['MILD', 'MODERATE', 'SEVERE', 'CRITICAL'];
      const randomSeverity = diagnosisSeverities[Math.floor(Math.random() * diagnosisSeverities.length)];
      payload = { symptoms: ['fever', 'cough'], diagnosis: 'pneumonia', diagnosisSeverity: randomSeverity, confidence: parseFloat((Math.random() * 0.3 + 0.6).toFixed(2)) };
      rationale = `Suggested diagnosis: pneumonia, severity: ${randomSeverity}.`;
      riskScore = randomSeverity === 'CRITICAL' ? 95 : Math.floor(Math.random() * 30) + 30;
      break;
    case 'ai-payment-6':
      const txAmount = parseFloat((Math.random() * 20000 + 100).toFixed(2)); // $100 - $20100
      const txCurrency = 'USD';
      const txType: 'PAYMENT' | 'TOKEN_TRANSFER' | 'LIQUIDITY_PROVISION' = Math.random() > 0.6 ? 'PAYMENT' : Math.random() > 0.5 ? 'TOKEN_TRANSFER' : 'LIQUIDITY_PROVISION';
      const isHighRiskRecipient = Math.random() < 0.1; // 10% chance
      const targetAccount = isHighRiskRecipient ? 'sanctioned-entity-789' : `user-wallet-${Math.floor(Math.random() * 10000)}`;
      const sourceAccount = `user-wallet-${Math.floor(Math.random() * 10000)}`;
      const rail = Math.random() > 0.7 ? 'rail_fast' : 'rail_batch';

      payload = { ...payload, transactionAmount: txAmount, transactionCurrency: txCurrency, transactionType: txType };
      transactionDetails = {
        type: txType,
        transactionId: generateId('txn'),
        amount: txAmount,
        currency: txCurrency,
        targetAccount: targetAccount,
        sourceAccount: sourceAccount,
        rail: rail,
        metadata: { fee: txAmount * 0.001, purpose: 'goods_purchase' }
      };
      rationale = `Transaction of ${txAmount} ${txCurrency} to ${targetAccount} for ${txType}.`;
      riskScore = txAmount > 10000 || isHighRiskRecipient ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 50) + 30;
      subjectType = 'TRANSACTION';
      break;
  }

  return {
    id: generateId('req'),
    timestamp: new Date(),
    sourceAI: model.name,
    action: action,
    subjectId: `${subjectType.toLowerCase()}-${Math.floor(Math.random() * 10000)}`,
    subjectType: subjectType,
    payload: payload,
    rationale: rationale,
    context: context,
    riskScore: riskScore,
    transactionDetails: transactionDetails,
  };
};

const simulateGovernorDecision = (request: ActionRequest, policies: EthicalPolicyRule[]): GovernanceResponse => {
  const applicablePolicies = policies.filter(p =>
    p.isActive &&
    (p.sourceAIModels.includes(request.sourceAI) || p.sourceAIModels.includes('*')) &&
    (p.actionTypes.includes(request.action) || p.actionTypes.includes('*'))
  );

  let decision: GovernanceResponse['decision'] = 'APPROVE';
  let reason: string = 'Compliant with ethical constitution.';
  let violatesPrinciple: string[] = [];
  let vetoDetails: GovernanceResponse['vetoDetails'];
  let suggestedRemediation: string[] = [];
  let reviewRequired = false;

  for (const policy of applicablePolicies) {
    let conditionMet = false;
    let actualValue: number | string | undefined;
    let thresholdValue: number | string | undefined;

    try {
      if (policy.conditionType === 'CONTEXT_MATCH' && request.context) {
        const field = policy.condition.field as string;
        const operator = policy.condition.operator as string;
        const value = policy.condition.value;
        const contextValue = (request.context as any)[field.split('.')[1]];

        if (operator === 'IN' && Array.isArray(value) && contextValue && value.includes(contextValue)) {
          conditionMet = true;
          actualValue = contextValue;
          thresholdValue = value.join(', ');
        }
      } else if (policy.conditionType === 'PAYLOAD_EVAL' && request.payload) {
        const field = policy.condition.field as string;
        const operator = policy.condition.operator as string;
        const value = policy.condition.value;
        const actionField = policy.condition.actionField as string;
        const actionValue = policy.condition.actionValue;
        const payloadValue = (request.payload as any)[field.split('.')[0]];

        if (payloadValue !== undefined && (actionField === undefined || (request.payload as any)[actionField.split('.')[0]] === actionValue)) {
          if (operator === '<' && payloadValue < value) { conditionMet = true; }
          if (operator === '>' && payloadValue > value) { conditionMet = true; }
          if (operator === '==' && payloadValue === value) { conditionMet = true; }
          actualValue = payloadValue;
          thresholdValue = value;
        }
      } else if (policy.conditionType === 'RISK_THRESHOLD') {
        const field = policy.condition.field as string;
        const operator = policy.condition.operator as string;
        const value = policy.condition.value;
        const riskValue = (request as any)[field];

        if (riskValue !== undefined) {
          if (operator === '>' && riskValue > value) { conditionMet = true; }
          if (operator === '<' && riskValue < value) { conditionMet = true; }
          actualValue = riskValue;
          thresholdValue = value;
        }
      } else if (policy.conditionType === 'EXTERNAL_DATA_CHECK' && policy.evaluationScript) {
        // This is a placeholder for a real script execution engine and external data call.
        // For mock, we'll simulate a random outcome for this complex rule.
        const externalData = policy.condition.api === '/risk-profile' && policy.condition.operator === 'IS_HIGH_RISK' && request.transactionDetails?.targetAccount === 'sanctioned-entity-789' ? { isSanctioned: true } : { isSanctioned: false };
        if (policy.condition.operator === 'CHECK_FOR_DISPROPORTIONATE_IMPACT' && Math.random() < 0.3) {
          conditionMet = true;
          actualValue = 'Simulated Disparity';
          thresholdValue = 'No Disparity';
        } else if (policy.condition.operator === 'IS_HIGH_RISK' && externalData.isSanctioned) {
          conditionMet = true;
          actualValue = request.transactionDetails?.targetAccount;
          thresholdValue = 'Not high-risk';
        }
      } else if (policy.conditionType === 'TRANSACTION_RULE' && request.transactionDetails) {
        const field = policy.condition.field as string;
        const operator = policy.condition.operator as string;
        const value = policy.condition.value;

        const path = field.split('.');
        let transactionValue: any = request;
        for (const key of path) {
          if (transactionValue && typeof transactionValue === 'object' && key in transactionValue) {
            transactionValue = transactionValue[key];
          } else {
            transactionValue = undefined;
            break;
          }
        }

        if (transactionValue !== undefined) {
          if (operator === '>' && transactionValue > value) { conditionMet = true; }
          if (operator === '<' && transactionValue < value) { conditionMet = true; }
          if (operator === '==' && transactionValue === value) { conditionMet = true; }
          actualValue = transactionValue;
          thresholdValue = value;
        }
      } else if (policy.conditionType === 'AGENT_BEHAVIOR_PATTERN' && request.context?.agentCapabilitiesUsed && request.sourceAI) {
        const modelProfile = mockAIModels.find(m => m.name === request.sourceAI);
        if (modelProfile?.agentCapabilities) {
          const unauthorizedCapabilities = request.context.agentCapabilitiesUsed.filter((cap: string) => !modelProfile.agentCapabilities?.includes(cap));
          if (unauthorizedCapabilities.length > 0) {
            conditionMet = true;
            actualValue = unauthorizedCapabilities.join(', ');
            thresholdValue = 'No unauthorized capabilities';
          }
        }
      }
    } catch (e) {
      console.error(`Error evaluating policy ${policy.id}:`, e);
      continue;
    }

    if (conditionMet) {
      violatesPrinciple.push(mockEthicalPrinciples.find(p => p.id === policy.principleId)?.name || policy.principleId);
      suggestedRemediation.push(...(policy.suggestedRemediationTemplate || []));

      if (policy.decisionEffect === 'VETO') {
        decision = 'VETO';
        reason = `Policy violation: ${policy.name}. ${policy.description}`;
        vetoDetails = {
          policyId: policy.id,
          policyName: policy.name,
          actualValue: actualValue,
          thresholdValue: thresholdValue,
        };
        reviewRequired = true;
        break; // VETO takes precedence
      } else if (policy.decisionEffect === 'FLAG_FOR_REVIEW') {
        if (decision !== 'VETO') { // Don't override a VETO with a FLAG
          decision = 'FLAG_FOR_REVIEW';
          reason = `Flagged for human review by policy: ${policy.name}. ${policy.description}`;
          reviewRequired = true;
          vetoDetails = {
            policyId: policy.id,
            policyName: policy.name,
            actualValue: actualValue,
            thresholdValue: thresholdValue,
          };
        }
      } else if (policy.decisionEffect === 'APPROVE_WITH_WARNING' && decision === 'APPROVE') {
        decision = 'APPROVE_WITH_WARNING';
        reason = `Approved with warning due to policy: ${policy.name}. ${policy.description}`;
      }
    }
  }

  return {
    governorVersion: '1.0.2',
    decision,
    reason,
    violatesPrinciple: violatesPrinciple.length > 0 ? Array.from(new Set(violatesPrinciple)) : undefined,
    vetoDetails,
    suggestedRemediation: suggestedRemediation.length > 0 ? suggestedRemediation : undefined,
    reviewRequired: reviewRequired,
    humanReviewerId: reviewRequired ? mockUsers.filter(u => u.role === 'ETHICS_REVIEWER')[Math.floor(Math.random() * mockUsers.filter(u => u.role === 'ETHICS_REVIEWER').length)].id : undefined,
  };
};

/**
 * Provides a minimal, simulated SHA-256 hashing utility for tamper-evident audit logs.
 * Business impact: Ensures the cryptographic integrity of audit trails, crucial for
 * regulatory compliance and forensic investigations, without external dependencies.
 */
export const sha256 = async (str: string): Promise<string> => {
  const textEncoder = new TextEncoder();
  const data = textEncoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

let lastAuditHash = 'initial_chain_hash_for_tamper_evidence_root_block'; // Seed for the simulated blockchain/tamper-evident log

/**
 * Generates a mock audit log entry with cryptographic chaining for tamper evidence.
 * Business impact: Creates auditable, immutable records of all system events, forming
 * the backbone of compliance and accountability for every operation within the platform.
 */
export const generateMockAuditLog = async (entryType: AuditLogEntry['eventType'], entityId: string, entityType: AuditLogEntry['entityType'], details: Record<string, any>, severity: AuditLogEntry['severity'] = 'INFO', userId?: string): Promise<AuditLogEntry> => {
  const logData = {
    id: generateId('audit'),
    timestamp: new Date(),
    eventType: entryType,
    entityId: entityId,
    entityType: entityType,
    details: details,
    severity: severity,
    userId: userId || mockUsers.find(u => u.role === 'SYSTEM')?.id || 'system-user-default',
    previousHash: lastAuditHash, // Link to previous entry for chaining
  };
  const currentHash = await sha256(JSON.stringify(logData));
  lastAuditHash = currentHash; // Update for next entry
  return { ...logData, immutableHash: currentHash };
};

/**
 * Generates a mock anomaly alert, simulating the detection of unusual system or AI behavior.
 * Business impact: Tests the system's ability to proactively identify and flag risks,
 * ensuring the integrity and security of financial operations by simulating critical alerts.
 */
export const generateMockAnomalyAlert = (): AnomalyAlert => {
  const types: AnomalyAlert['type'][] = ['UNEXPECTED_VETO_RATE', 'MODEL_BEHAVIOR_DRIFT', 'POLICY_CIRCUMVENTION', 'HIGH_RISK_ACCUMULATION', 'UNUSUAL_TRANSACTION_PATTERN', 'AGENT_GOVERNANCE_BREACH', 'IDENTITY_COMPROMISE_ATTEMPT'];
  const type = types[Math.floor(Math.random() * types.length)];
  const severity = Math.random() > 0.7 ? 'CRITICAL' : 'WARNING';
  const model = mockAIModels[Math.floor(Math.random() * mockAIModels.length)];

  let description = '';
  let relatedEntityType: AnomalyAlert['relatedEntityType'] = 'AI_MODEL';
  let relatedEntityId = model.id;

  switch (type) {
    case 'UNEXPECTED_VETO_RATE': description = `Veto rate for ${model.name} is ${Math.floor(Math.random() * 10) + 15}% above baseline.`; break;
    case 'MODEL_BEHAVIOR_DRIFT': description = `Detected behavior drift in ${model.name} related to 'demographic_zip_code' feature.`; break;
    case 'POLICY_CIRCUMVENTION': description = `Possible circumvention of 'pr-loan-zip-code' policy by ${model.name}.`; break;
    case 'HIGH_RISK_ACCUMULATION': description = `Accumulation of high-risk actions by ${model.name} without sufficient human review.`; break;
    case 'UNUSUAL_TRANSACTION_PATTERN':
      description = `Unusual transaction pattern detected from source ${generateId('user')}. Potential fraud.`;
      relatedEntityType = 'TRANSACTION';
      relatedEntityId = generateId('txn');
      break;
    case 'AGENT_GOVERNANCE_BREACH':
      description = `Agent ${model.agentId || model.name} attempted action outside its defined capabilities.`;
      relatedEntityType = 'AGENT';
      relatedEntityId = model.agentId || model.id;
      break;
    case 'IDENTITY_COMPROMISE_ATTEMPT':
      const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      description = `Suspected identity compromise attempt for user ${user.name} (ID: ${user.id}).`;
      relatedEntityType = 'USER_IDENTITY';
      relatedEntityId = user.id;
      break;
  }

  return {
    id: generateId('anomaly'),
    timestamp: new Date(),
    type,
    severity,
    description,
    detectedBy: Math.random() > 0.5 ? 'GOVERNOR' : 'AGENT_MONITOR',
    relatedEntityId: relatedEntityId,
    relatedEntityType: relatedEntityType,
    status: 'ACTIVE',
  };
};

/**
 * Generates mock user feedback or complaints, simulating real-world user interactions.
 * Business impact: Provides test data for the feedback loop, enabling the system to
 * demonstrate its responsiveness to user concerns and its capability for continuous improvement
 * in user experience and ethical fairness.
 */
export const generateMockUserFeedback = (currentRequests: GovernedActionLogEntry[]): UserFeedback => {
  const actionRequests = currentRequests.filter(r => r.response?.decision === 'VETO' || r.response?.reviewRequired || r.subjectType === 'TRANSACTION');
  const relevantRequest = actionRequests.length > 0 ? actionRequests[Math.floor(Math.random() * actionRequests.length)] : null;
  const feedbackTypes: UserFeedback['feedbackType'][] = ['COMPLAINT', 'INQUIRY', 'SUGGESTION', 'DISPUTE_TRANSACTION'];
  const severity: UserFeedback['severity'][] = ['CRITICAL', 'HIGH', 'MEDIUM'];
  const messages = [
    "I was denied a loan unfairly.",
    "Why was my content flagged? It wasn't hate speech.",
    "The AI recommendation was completely irrelevant.",
    "I believe there's a bias in the recruitment system.",
    "Need more transparency about this decision.",
    "My payment was blocked, but it was legitimate!",
    "I want to dispute this token transfer.",
    "The agent executed an action without my explicit consent."
  ];
  return {
    id: generateId('feedback'),
    timestamp: new Date(),
    userId: `enduser-${Math.floor(Math.random() * 5000)}`,
    actionRequestId: relevantRequest ? relevantRequest.id : generateId('req'),
    feedbackType: feedbackTypes[Math.floor(Math.random() * feedbackTypes.length)],
    severity: severity[Math.floor(Math.random() * severity.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    status: 'PENDING',
  };
};

/**
 * Generates a mock agent activity log entry, simulating an autonomous agent's operation.
 * Business impact: Provides transparent, auditable records of intelligent agent behavior,
 * critical for understanding autonomous decision flows, debugging, and ensuring agents
 * operate within their mandated governance context, building trust in agentic systems.
 */
export const generateMockAgentActivityLog = async (agentId: string, agentName: string, relatedEntityId?: string, relatedEntityType?: AgentActivityLogEntry['targetEntityType'], governanceDecisionId?: string): Promise<AgentActivityLogEntry> => {
  const eventTypes: AgentActivityLogEntry['eventType'][] = ['OBSERVE', 'DECIDE', 'EXECUTE', 'COMMUNICATE', 'REMEDIATE', 'REPORT'];
  const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  const details: Record<string, any> = { message: `Agent ${agentName} performed ${eventType} action.` };
  if (eventType === 'EXECUTE' && relatedEntityId) {
    details.action = `Processed ${relatedEntityType || 'unknown'} ${relatedEntityId}`;
  } else if (eventType === 'DECIDE' && governanceDecisionId) {
    details.decisionReference = governanceDecisionId;
  }
  const status: AgentActivityLogEntry['status'] = Math.random() < 0.9 ? 'SUCCESS' : 'FAILURE'; // Simulate occasional failure
  const logEntryData: Omit<AgentActivityLogEntry, 'id' | 'timestamp' | 'immutableHash'> = {
    agentId,
    agentName,
    eventType,
    details,
    targetEntityId: relatedEntityId,
    targetEntityType: relatedEntityType,
    governanceDecisionId: governanceDecisionId,
    status,
    outcome: status === 'SUCCESS' ? 'Operation completed.' : 'Operation failed/blocked.'
  };
  const logDataString = JSON.stringify(logEntryData);
  const hash = await sha256(logDataString);

  return {
    id: generateId('agent-log'),
    timestamp: new Date(),
    ...logEntryData,
    immutableHash: hash,
  };
};

// --- MOCK SERVICE LAYER ---
/**
 * Mock service layer for the Ethical Governor, simulating backend data storage and API interactions.
 * Business impact: Provides a fully functional, self-contained environment for local development
 * and demonstration without external dependencies. This accelerates iteration, reduces integration
 * complexity, and enables rapid prototyping of commercial-grade financial governance features.
 */
export const governanceService = {
  // Data stores
  _requests: new Map<string, GovernedActionLogEntry>(),
  _principles: new Map<string, EthicalPrinciple>(mockEthicalPrinciples.map(p => [p.id, p])),
  _policies: new Map<string, EthicalPolicyRule>(mockEthicalPolicyRules.map(p => [p.id, p])),
  _aiModels: new Map<string, AIModelProfile>(mockAIModels.map(m => [m.id, m])),
  _auditLogs: new Map<string, AuditLogEntry>(),
  _humanReviewTasks: new Map<string, HumanReviewTask>(),
  _remediationActions: new Map<string, RemediationAction>(),
  _complianceReports: new Map<string, ComplianceReport>(),
  _userFeedback: new Map<string, UserFeedback>(),
  _anomalyAlerts: new Map<string, AnomalyAlert>(),
  _systemStatus: new Map<string, SystemStatus>(),
  _policyVersions: new Map<string, PolicyVersionHistory[]>(),
  _users: new Map<string, UserIdentity>(mockUsers.map(u => [u.id, u])),
  _agentActivityLogs: new Map<string, AgentActivityLogEntry>(),

  /**
   * Initializes mock data for the Ethical Governor dashboard.
   * Business impact: Populates the system with realistic, diverse data to demonstrate
   * end-to-end functionality, enabling immediate testing and showcasing of the platform's capabilities.
   */
  initMockData: async () => {
    // Generate some initial requests for display
    for (let i = 0; i < 50; i++) {
      const request = generateMockActionRequest();
      const response = simulateGovernorDecision(request, Array.from(governanceService._policies.values()));
      const logEntry: GovernedActionLogEntry = {
        ...request,
        response,
        status: response.reviewRequired ? 'HUMAN_REVIEW' : 'GOVERNED'
      };
      governanceService._requests.set(logEntry.id, logEntry);

      governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog(
        'GOVERNANCE_DECISION', logEntry.id, 'ACTION_REQUEST',
        { decision: response.decision, reason: response.reason, violatedPrinciples: response.violatesPrinciple },
        response.decision === 'VETO' || response.decision === 'APPROVE_WITH_WARNING' ? 'WARNING' : 'INFO'
      ));

      if (response.reviewRequired) {
        const reviewTask: HumanReviewTask = {
          id: generateId('hr'),
          actionRequestId: logEntry.id,
          status: 'PENDING',
          priority: response.decision === 'VETO' ? 'CRITICAL' : 'HIGH',
          assignedTo: response.humanReviewerId,
          reviewDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          reviewType: response.decision === 'VETO' ? 'VETO_OVERRIDE' : 'FLAGGED_ACTION',
          contextSummary: `Review AI decision for ${logEntry.sourceAI} action '${logEntry.action}' on subject ${logEntry.subjectId}. Reason: ${response.reason}`,
          decisionOptions: ['Approve AI Decision', 'Override AI Decision', 'Request More Info', 'Propose Remediation'],
        };
        governanceService._humanReviewTasks.set(reviewTask.id, reviewTask);
        governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog(
          'HUMAN_REVIEW_ACTION', reviewTask.id, 'HUMAN_REVIEW', { status: 'CREATED', priority: reviewTask.priority }, 'INFO', reviewTask.assignedTo
        ));
      }

      // Simulate agent activity related to the request
      const model = mockAIModels.find(m => m.name === request.sourceAI);
      if (model?.agentId) {
        const agentLog = await generateMockAgentActivityLog(model.agentId, model.name, logEntry.id, 'ACTION_REQUEST', logEntry.id);
        governanceService._agentActivityLogs.set(agentLog.id, agentLog);
        governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog(
          'AGENT_ACTIVITY', agentLog.id, 'AGENT_ACTIVITY_LOG', { eventType: agentLog.eventType, status: agentLog.status }, 'INFO', model.agentId
        ));
      }
    }

    // Add some initial anomaly alerts
    for (let i = 0; i < 5; i++) {
      const alert = generateMockAnomalyAlert();
      governanceService._anomalyAlerts.set(alert.id, alert);
      governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog(
        'SYSTEM_ALERT', alert.id, 'GOVERNOR_SYSTEM', { type: alert.type, severity: alert.severity, description: alert.description }, alert.severity === 'CRITICAL' ? 'ERROR' : 'WARNING'
      ));
    }

    // Add some initial system statuses
    ['PolicyEngine', 'AuditLogger', 'HumanReviewQueue', 'DataIntegrityMonitor', 'TransactionMonitor', 'AgentOrchestrator'].forEach(comp => {
      governanceService._systemStatus.set(comp, {
        id: generateId('sys-stat'),
        timestamp: new Date(),
        component: comp,
        health: 'OPERATIONAL',
        message: 'Running normally.',
      });
    });

    // Initial policy versions
    for (const policy of mockEthicalPolicyRules) {
      governanceService._policyVersions.set(policy.id, [{
        id: generateId('pv'),
        policyId: policy.id,
        version: 1,
        timestamp: policy.creationDate,
        changes: 'Initial version created.',
        changedBy: mockUsers[0].id,
        policySnapshot: policy,
      }]);
    }
  },

  /**
   * Fetches a list of governed AI action requests.
   * Business impact: Provides real-time visibility into the flow of AI-driven actions
   * and their governance outcomes, essential for operational monitoring and compliance.
   */
  fetchGovernedActions: async (limit: number = 100): Promise<GovernedActionLogEntry[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Array.from(governanceService._requests.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  },

  /**
   * Fetches all defined ethical principles.
   * Business impact: Supports the management and transparent communication of the platform's
   * core ethical guidelines, reinforcing trust and facilitating policy creation.
   */
  fetchEthicalPrinciples: async (): Promise<EthicalPrinciple[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Array.from(governanceService._principles.values());
  },
  /**
   * Creates a new ethical principle.
   * Business impact: Allows dynamic adaptation of the platform's ethical framework,
   * enabling responsiveness to evolving standards and business requirements.
   */
  createEthicalPrinciple: async (principle: Omit<EthicalPrinciple, 'id' | 'version' | 'lastUpdated' | 'isActive'>, userId: string = 'system-user'): Promise<EthicalPrinciple> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newPrinciple: EthicalPrinciple = {
      ...principle,
      id: generateId('ep'),
      version: 1,
      lastUpdated: new Date(),
      isActive: true,
    };
    governanceService._principles.set(newPrinciple.id, newPrinciple);
    governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog('POLICY_UPDATE', newPrinciple.id, 'POLICY_RULE', { action: 'CREATED_PRINCIPLE', name: newPrinciple.name }, 'INFO', userId));
    return newPrinciple;
  },
  /**
   * Updates an existing ethical principle.
   * Business impact: Ensures the ethical framework remains current and adaptable,
   * allowing adjustments to guidance and categorization without disrupting ongoing operations.
   */
  updateEthicalPrinciple: async (id: string, updates: Partial<EthicalPrinciple>, userId: string = 'system-user'): Promise<EthicalPrinciple | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const existing = governanceService._principles.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, lastUpdated: new Date() };
    governanceService._principles.set(id, updated);
    governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog('POLICY_UPDATE', updated.id, 'POLICY_RULE', { action: 'UPDATED_PRINCIPLE', name: updated.name, changes: Object.keys(updates) }, 'INFO', userId));
    return updated;
  },

  /**
   * Fetches all defined ethical policy rules.
   * Business impact: Provides a comprehensive list of active governance rules,
   * crucial for transparency, auditability, and understanding the automated decision-making logic.
   */
  fetchEthicalPolicyRules: async (): Promise<EthicalPolicyRule[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Array.from(governanceService._policies.values());
  },
  /**
   * Creates a new ethical policy rule.
   * Business impact: Empowers governance teams to rapidly implement new rules
   * in response to evolving regulatory landscapes or emerging ethical considerations,
   * maintaining agility and compliance.
   */
  createEthicalPolicyRule: async (rule: Omit<EthicalPolicyRule, 'id' | 'version' | 'lastUpdated' | 'creationDate' | 'isActive'>, userId: string = 'system-user'): Promise<EthicalPolicyRule> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newRule: EthicalPolicyRule = {
      ...rule,
      id: generateId('pr'),
      version: 1,
      lastUpdated: new Date(),
      creationDate: new Date(),
      isActive: true,
    };
    governanceService._policies.set(newRule.id, newRule);
    governanceService._policyVersions.set(newRule.id, [{
      id: generateId('pv'),
      policyId: newRule.id,
      version: 1,
      timestamp: newRule.creationDate,
      changes: 'Initial version created.',
      changedBy: userId,
      policySnapshot: newRule,
    }]);
    governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog('POLICY_UPDATE', newRule.id, 'POLICY_RULE', { action: 'CREATED_POLICY', name: newRule.name }, 'INFO', userId));
    return newRule;
  },
  /**
   * Updates an existing ethical policy rule.
   * Business impact: Enables continuous refinement and optimization of governance rules,
   * ensuring that policies remain effective and efficient in preventing undesired AI behavior.
   * Version control ensures auditable changes.
   */
  updateEthicalPolicyRule: async (id: string, updates: Partial<EthicalPolicyRule>, userId: string = 'system-user'): Promise<EthicalPolicyRule | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const existing = governanceService._policies.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates, lastUpdated: new Date(), version: existing.version + 1 };
    governanceService._policies.set(id, updated);
    const policyVersions = governanceService._policyVersions.get(id) || [];
    policyVersions.push({
      id: generateId('pv'),
      policyId: updated.id,
      version: updated.version,
      timestamp: updated.lastUpdated,
      changes: `Updated fields: ${Object.keys(updates).join(', ')}`,
      changedBy: userId,
      policySnapshot: { ...updated },
    });
    governanceService._policyVersions.set(id, policyVersions);
    governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog('POLICY_UPDATE', updated.id, 'POLICY_RULE', { action: 'UPDATED_POLICY', name: updated.name, changes: Object.keys(updates) }, 'INFO', userId));
    return updated;
  },
  /**
   * Fetches the version history for a specific ethical policy rule.
   * Business impact: Provides an immutable, chronological record of all changes to a policy,
   * crucial for forensic analysis, regulatory audits, and understanding policy evolution.
   */
  fetchPolicyVersionHistory: async (policyId: string): Promise<PolicyVersionHistory[]> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return governanceService._policyVersions.get(policyId) || [];
  },

  /**
   * Fetches all registered AI model profiles.
   * Business impact: Offers a centralized registry of all AI assets, enabling transparent
   * management, risk assessment, and integration into the governance framework.
   */
  fetchAIModelProfiles: async (): Promise<AIModelProfile[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Array.from(governanceService._aiModels.values());
  },
  /**
   * Registers a new AI model with the system.
   * Business impact: Ensures that all AI components are formally onboarded into the governance
   * framework from inception, enabling proactive risk management and compliance monitoring.
   */
  registerAIModel: async (model: Omit<AIModelProfile, 'id' | 'lastUpdated' | 'registeredDate' | 'governorIntegrationStatus'>, userId: string = 'system-user'): Promise<AIModelProfile> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newModel: AIModelProfile = {
      ...model,
      id: generateId('ai'),
      lastUpdated: new Date(),
      registeredDate: new Date(),
      governorIntegrationStatus: 'PENDING',
    };
    governanceService._aiModels.set(newModel.id, newModel);
    governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog('AI_MODEL_REGISTER', newModel.id, 'AI_MODEL', { action: 'REGISTERED', name: newModel.name }, 'INFO', userId));
    return newModel;
  },
  /**
   * Updates an existing AI model profile.
   * Business impact: Allows for dynamic updates to model metadata, risk categorization,
   * and integration status, ensuring that governance measures remain aligned with the latest
   * model deployments and lifecycle stages.
   */
  updateAIModelProfile: async (id: string, updates: Partial<AIModelProfile>, userId: string = 'system-user'): Promise<AIModelProfile | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const existing = governanceService._aiModels.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, lastUpdated: new Date() };
    governanceService._aiModels.set(id, updated);
    governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog('AI_MODEL_REGISTER', updated.id, 'AI_MODEL', { action: 'UPDATED_PROFILE', name: updated.name, changes: Object.keys(updates) }, 'INFO', userId));
    return updated;
  },

  /**
   * Fetches a paginated list of all audit log entries.
   * Business impact: Provides a comprehensive, cryptographically secured record of all
   * significant system activities, essential for internal and external audits, forensic analysis,
   * and demonstrating full accountability.
   */
  fetchAuditLogs: async (limit: number = 200): Promise<AuditLogEntry[]> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return Array.from(governanceService._auditLogs.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  },

  /**
   * Fetches human review tasks, optionally filtered by status.
   * Business impact: Manages the workflow for human intervention, ensuring that critical
   * AI decisions requiring human judgment are efficiently routed, tracked, and resolved,
   * maintaining operational continuity and ethical oversight.
   */
  fetchHumanReviewTasks: async (status?: HumanReviewTask['status']): Promise<HumanReviewTask[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Array.from(governanceService._humanReviewTasks.values()).filter(task => !status || task.status === status)
      .sort((a, b) => b.reviewDeadline.getTime() - a.reviewDeadline.getTime());
  },
  /**
   * Updates a human review task with new information or resolution.
   * Business impact: Facilitates the completion of human review processes, updating
   * the status of AI actions based on human expert decisions and ensuring a continuous
   * feedback loop for improving automated governance.
   */
  updateHumanReviewTask: async (id: string, updates: Partial<HumanReviewTask>, userId: string = 'system-user'): Promise<HumanReviewTask | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const existing = governanceService._humanReviewTasks.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, reviewTimestamp: new Date() };
    governanceService._humanReviewTasks.set(id, updated);

    if (updated.actionRequestId && updated.status === 'COMPLETED') {
      const relatedAction = governanceService._requests.get(updated.actionRequestId);
      if (relatedAction) {
        relatedAction.response = {
          ...relatedAction.response!,
          reviewOutcome: updated.resolution,
          reviewNotes: updated.reviewerNotes,
          reviewTimestamp: updated.reviewTimestamp,
          humanReviewerId: updated.resolvedBy || updated.assignedTo,
        };
        relatedAction.status = 'COMPLETED';
        if (updated.resolution === 'OVERRIDDEN') {
          relatedAction.response.decision = 'APPROVE';
          relatedAction.response.reason = `Veto overridden by human reviewer: ${updated.reviewerNotes}`;
        }
        governanceService._requests.set(relatedAction.id, relatedAction);
      }
    }

    governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog('HUMAN_REVIEW_ACTION', updated.id, 'HUMAN_REVIEW', { action: 'UPDATED', status: updated.status, resolution: updated.resolution }, 'INFO', userId));
    return updated;
  },

  /**
   * Fetches all remediation actions.
   * Business impact: Provides oversight of all corrective measures undertaken in response
   * to governance findings or anomalies, ensuring that issues are addressed and resolved systematically.
   */
  fetchRemediationActions: async (): Promise<RemediationAction[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Array.from(governanceService._remediationActions.values());
  },
  /**
   * Creates a new remediation action.
   * Business impact: Enables the initiation of corrective workflows, allowing for rapid
   * and structured responses to identified problems, thereby minimizing negative impacts and
   * ensuring system resilience.
   */
  createRemediationAction: async (action: Omit<RemediationAction, 'id' | 'status'>, userId: string = 'system-user'): Promise<RemediationAction> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newAction: RemediationAction = {
      ...action,
      id: generateId('rem'),
      status: 'PENDING',
    };
    governanceService._remediationActions.set(newAction.id, newAction);
    governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog('GOVERNANCE_DECISION', newAction.id, 'REMEDIATION', { action: 'REMEDIATION_CREATED', type: newAction.type, actionRequestId: newAction.actionRequestId }, 'INFO', userId));
    return newAction;
  },
  /**
   * Updates an existing remediation action.
   * Business impact: Tracks the progress and outcome of remediation efforts, ensuring
   * accountability and providing data on the effectiveness of corrective strategies.
   */
  updateRemediationAction: async (id: string, updates: Partial<RemediationAction>, userId: string = 'system-user'): Promise<RemediationAction | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const existing = governanceService._remediationActions.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, executionTimestamp: updates.status === 'EXECUTED' ? new Date() : existing.executionTimestamp };
    governanceService._remediationActions.set(id, updated);
    governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog('REMEDIATION_EXECUTION', updated.id, 'REMEDIATION', { action: 'REMEDIATION_UPDATED', status: updated.status, type: updated.type }, 'INFO', userId));

    if (updated.status === 'EXECUTED' && updated.actionRequestId) {
      const relatedAction = governanceService._requests.get(updated.actionRequestId);
      if (relatedAction) {
        relatedAction.status = 'REMEDIATED';
        relatedAction.response = {
          ...relatedAction.response!,
          appliedRemediationIds: [...(relatedAction.response?.appliedRemediationIds || []), updated.id]
        };
        governanceService._requests.set(relatedAction.id, relatedAction);
      }
    }
    return updated;
  },

  /**
   * Fetches all generated compliance reports.
   * Business impact: Centralizes access to vital compliance documentation, enabling
   * efficient reporting, historical review, and demonstration of regulatory adherence.
   */
  fetchComplianceReports: async (): Promise<ComplianceReport[]> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    return Array.from(governanceService._complianceReports.values());
  },
  /**
   * Generates a new compliance report for a specified period.
   * Business impact: Automates the creation of comprehensive compliance reports,
   * significantly reducing manual effort and ensuring timely, accurate reporting for
   * internal stakeholders and regulatory bodies.
   */
  generateComplianceReport: async (name: string, startDate: Date, endDate: Date, createdBy: string): Promise<ComplianceReport> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const relevantRequests = Array.from(governanceService._requests.values()).filter(req => req.timestamp >= startDate && req.timestamp <= endDate);

    const metrics = {
      totalRequests: relevantRequests.length,
      vetoedRequests: relevantRequests.filter(req => req.response?.decision === 'VETO').length,
      humanReviewedRequests: relevantRequests.filter(req => req.status === 'HUMAN_REVIEW' || (req.status === 'COMPLETED' && req.response?.reviewRequired)).length,
      principlesViolated: relevantRequests.reduce((acc, req) => {
        if (req.response?.violatesPrinciple) {
          req.response.violatesPrinciple.forEach(p => acc[p] = (acc[p] || 0) + 1);
        }
        return acc;
      }, {} as Record<string, number>),
      topViolatingModels: relevantRequests.reduce((acc, req) => {
        if (req.response?.decision === 'VETO' || req.response?.violatesPrinciple) {
          acc[req.sourceAI] = (acc[req.sourceAI] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      averageReviewTimeMs: relevantRequests
        .filter(req => req.response?.reviewTimestamp && req.response?.reviewRequired)
        .map(req => req.response!.reviewTimestamp!.getTime() - req.timestamp.getTime())
        .reduce((sum, time, _, arr) => sum + time / arr.length, 0),
      vetoOverrideRate: relevantRequests.filter(req => req.response?.reviewOutcome === 'OVERRIDDEN').length / Math.max(1, relevantRequests.filter(req => req.response?.decision === 'VETO').length),
      transactionalActionsFlagged: relevantRequests.filter(req => req.subjectType === 'TRANSACTION' && req.response?.decision === 'FLAG_FOR_REVIEW').length,
      transactionalActionsVetoed: relevantRequests.filter(req => req.subjectType === 'TRANSACTION' && req.response?.decision === 'VETO').length,
      successfulRemediations: Array.from(governanceService._remediationActions.values()).filter(rem => rem.status === 'EXECUTED' && rem.executionTimestamp && rem.executionTimestamp >= startDate && rem.executionTimestamp <= endDate).length,
    };

    const newReport: ComplianceReport = {
      id: generateId('report'),
      reportName: name,
      generationDate: new Date(),
      startDate,
      endDate,
      status: 'GENERATED',
      metrics,
      summary: `Report generated for period ${startDate.toDateString()} to ${endDate.toDateString()}. Total requests: ${metrics.totalRequests}, Vetoed: ${metrics.vetoedRequests}.`,
      createdBy,
    };
    governanceService._complianceReports.set(newReport.id, newReport);
    governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog('SYSTEM_ALERT', newReport.id, 'GOVERNOR_SYSTEM', { action: 'REPORT_GENERATED', name: newReport.reportName }, 'INFO', createdBy));
    return newReport;
  },

  /**
   * Fetches user feedback entries, optionally filtered by status.
   * Business impact: Provides a centralized view of user concerns, enabling rapid
   * response to issues, improving user satisfaction, and capturing valuable insights
   * for system enhancement and ethical alignment.
   */
  fetchUserFeedback: async (status?: UserFeedback['status']): Promise<UserFeedback[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Array.from(governanceService._userFeedback.values()).filter(fb => !status || fb.status === status);
  },
  /**
   * Submits new user feedback to the system.
   * Business impact: Establishes a formal channel for user input, allowing the platform
   * to capture real-world impact and address issues directly, fostering transparency and trust.
   */
  submitUserFeedback: async (feedback: Omit<UserFeedback, 'id' | 'timestamp' | 'status'>): Promise<UserFeedback> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newFeedback: UserFeedback = {
      ...feedback,
      id: generateId('feedback'),
      timestamp: new Date(),
      status: 'PENDING',
    };
    governanceService._userFeedback.set(newFeedback.id, newFeedback);
    governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog('SYSTEM_ALERT', newFeedback.id, 'GOVERNOR_SYSTEM', { action: 'USER_FEEDBACK_SUBMITTED', userId: newFeedback.userId, type: newFeedback.feedbackType }, 'INFO'));
    return newFeedback;
  },
  /**
   * Updates the status or resolution notes for user feedback.
   * Business impact: Manages the lifecycle of user feedback resolution, ensuring that
   * concerns are systematically addressed, documented, and closed, enhancing user trust
   * and demonstrating accountability.
   */
  updateUserFeedback: async (id: string, updates: Partial<UserFeedback>, userId: string = 'system-user'): Promise<UserFeedback | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const existing = governanceService._userFeedback.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    governanceService._userFeedback.set(id, updated);
    governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog('SYSTEM_ALERT', updated.id, 'GOVERNOR_SYSTEM', { action: 'USER_FEEDBACK_UPDATED', status: updated.status }, 'INFO', userId));
    return updated;
  },

  /**
   * Fetches anomaly alerts, optionally filtered by status.
   * Business impact: Provides a critical dashboard for monitoring potential threats
   * or deviations, enabling rapid incident response and safeguarding the platform's
   * operational integrity and security.
   */
  fetchAnomalyAlerts: async (status?: AnomalyAlert['status']): Promise<AnomalyAlert[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Array.from(governanceService._anomalyAlerts.values()).filter(alert => !status || alert.status === status);
  },
  /**
   * Updates an existing anomaly alert.
   * Business impact: Manages the lifecycle of anomaly resolution, ensuring that alerts
   * are investigated, mitigated, and documented, thereby enhancing system resilience
   * and security posture.
   */
  updateAnomalyAlert: async (id: string, updates: Partial<AnomalyAlert>, userId: string = 'system-user'): Promise<AnomalyAlert | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const existing = governanceService._anomalyAlerts.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    governanceService._anomalyAlerts.set(id, updated);
    governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog('SYSTEM_ALERT', updated.id, 'GOVERNOR_SYSTEM', { action: 'ANOMALY_ALERT_UPDATED', status: updated.status }, 'WARNING', userId));
    return updated;
  },

  /**
   * Fetches the current system status for all monitored components.
   * Business impact: Offers real-time observability into the health of critical infrastructure
   * components, enabling proactive maintenance and rapid response to operational issues,
   * minimizing downtime and ensuring service reliability.
   */
  fetchSystemStatus: async (): Promise<SystemStatus[]> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return Array.from(governanceService._systemStatus.values());
  },
  /**
   * Updates the status of a specific system component.
   * Business impact: Allows dynamic updating of component health, reflecting operational changes
   * and ensuring that the system status overview remains accurate for critical decision-making.
   */
  updateSystemStatus: async (component: string, updates: Partial<SystemStatus>, userId: string = 'system-user'): Promise<SystemStatus | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const existing = Array.from(governanceService._systemStatus.values()).find(s => s.component === component);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, timestamp: new Date() };
    governanceService._systemStatus.set(existing.id, updated);
    governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog('SYSTEM_ALERT', updated.id, 'GOVERNOR_SYSTEM', { action: 'SYSTEM_STATUS_UPDATE', component: updated.component, health: updated.health }, updated.health === 'DEGRADED' ? 'WARNING' : updated.health === 'OFFLINE' ? 'ERROR' : 'INFO', userId));
    return updated;
  },

  /**
   * Fetches agent activity logs.
   * Business impact: Provides granular insights into the operations of autonomous agents,
   * enabling performance analysis, compliance verification, and debugging of agentic workflows.
   */
  fetchAgentActivityLogs: async (limit: number = 200): Promise<AgentActivityLogEntry[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Array.from(governanceService._agentActivityLogs.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  },
  /**
   * Creates a new agent activity log entry.
   * Business impact: Ensures every significant action taken by an autonomous agent is
   * immutably recorded, forming an auditable trail for agent behavior and accountability.
   */
  createAgentActivityLog: async (entry: Omit<AgentActivityLogEntry, 'id' | 'timestamp' | 'immutableHash'>, userId?: string): Promise<AgentActivityLogEntry> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const newEntryData: Omit<AgentActivityLogEntry, 'id' | 'timestamp' | 'immutableHash'> = {
      ...entry,
      agentName: entry.agentName || mockAIModels.find(m => m.agentId === entry.agentId)?.name || 'Unknown Agent',
      status: entry.status || 'SUCCESS',
    };
    const logDataString = JSON.stringify({ ...newEntryData, timestamp: new Date(), previousHash: lastAuditHash });
    const hash = await sha256(logDataString);

    const newEntry: AgentActivityLogEntry = {
      id: generateId('agent-log'),
      timestamp: new Date(),
      ...newEntryData,
      immutableHash: hash,
    };
    lastAuditHash = hash; // Update the chain hash
    governanceService._agentActivityLogs.set(newEntry.id, newEntry);
    governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog('AGENT_ACTIVITY', newEntry.id, 'AGENT_ACTIVITY_LOG', { eventType: newEntry.eventType, status: newEntry.status, agentId: newEntry.agentId }, 'INFO', userId || newEntry.agentId));
    return newEntry;
  },
};

// Initialize mock data when the service is first accessed
governanceService.initMockData();
const initialRequests = Array.from(governanceService._requests.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

// --- React Components for the Ethical Governor Dashboard ---

/**
 * A reusable Tag component for displaying categorized information.
 * Business impact: Improves UI clarity and information density, making complex data
 * easily digestible and enhancing user experience for rapid decision-making.
 */
export const Tag: React.FC<{ children: React.ReactNode; color?: string; className?: string }> = ({ children, color = 'bg-blue-600', className }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} text-white ${className}`}>
    {children}
  </span>
);

/**
 * A generic Card component for consistent UI layout and information grouping.
 * Business impact: Provides a structured, clean interface for presenting diverse data,
 * enhancing readability and enabling users to quickly locate critical information within the dashboard.
 */
export const Card: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`bg-gray-700 p-4 rounded-lg shadow-md ${className}`}>
    {title && <h3 className="text-lg font-semibold mb-3 text-white">{title}</h3>}
    {children}
  </div>
);

/**
 * A standard Button component with various styling options.
 * Business impact: Ensures consistent and intuitive user interaction across the platform,
 * streamlining workflows and reducing cognitive load for critical actions.
 */
export const Button: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string; variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'info'; disabled?: boolean }> = ({ onClick, children, className, variant = 'primary', disabled = false }) => {
  const baseStyle = "px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";
  let variantStyle = "";
  switch (variant) {
    case 'primary': variantStyle = "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500"; break;
    case 'secondary': variantStyle = "bg-gray-600 hover:bg-gray-500 text-white focus:ring-gray-500"; break;
    case 'danger': variantStyle = "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"; break;
    case 'success': variantStyle = "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500"; break;
    case 'info': variantStyle = "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"; break;
  }
  const disabledStyle = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button onClick={onClick} className={`${baseStyle} ${variantStyle} ${disabledStyle} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

/**
 * A styled InputField component for user data entry.
 * Business impact: Provides a consistent and accessible interface for data input,
 * minimizing errors and improving efficiency in configuring governance rules or managing entities.
 */
export const InputField: React.FC<{ label: string; id: string; type?: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; className?: string; placeholder?: string; textarea?: boolean }> = ({ label, id, type = 'text', value, onChange, className, placeholder, textarea = false }) => (
  <div className={`mb-3 ${className}`}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    {textarea ? (
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        rows={4}
      />
    ) : (
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
    )}
  </div>
);

/**
 * A styled SelectField component for choosing from a list of options.
 * Business impact: Streamlines configuration processes and reduces input errors by
 * providing guided choices, improving user efficiency in managing complex governance settings.
 */
export const SelectField: React.FC<{ label: string; id: string; value: string | string[]; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: { value: string; label: string }[]; className?: string; multiple?: boolean }> = ({ label, id, value, onChange, options, className, multiple = false }) => (
  <div className={`mb-3 ${className}`}>
    <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    <select
      id={id}
      value={value}
      onChange={onChange}
      multiple={multiple}
      className="block w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    >
      {!multiple && <option value="">Select an option</option>}
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

/**
 * A styled CheckboxField component for boolean input.
 * Business impact: Simplifies binary configuration options, enhancing the clarity
 * and ease of use for enabling or disabling features within the governance system.
 */
export const CheckboxField: React.FC<{ label: string; id: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; className?: string }> = ({ label, id, checked, onChange, className }) => (
  <div className={`flex items-center mb-3 ${className}`}>
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 text-indigo-600 border-gray-500 rounded focus:ring-indigo-500 bg-gray-600"
    />
    <label htmlFor={id} className="ml-2 block text-sm text-gray-300">{label}</label>
  </div>
);

/**
 * Displays a table of the most recent governed AI action requests.
 * Business impact: Provides real-time, high-level observability into AI system behavior
 * and the Governor's real-time decisions, enabling immediate identification of compliance issues
 * and critical actions in the financial infrastructure.
 */
export const ActionLogTable: React.FC<{ requests: GovernedActionLogEntry[] }> = ({ requests }) => (
  <Card title="Latest Governed Actions" className="col-span-2">
    <div className="overflow-auto h-[60vh]">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-800/50 sticky top-0 z-10">
          <tr>
            <th className="p-2 border-b border-gray-600">Timestamp</th>
            <th className="p-2 border-b border-gray-600">Source AI</th>
            <th className="p-2 border-b border-gray-600">Action</th>
            <th className="p-2 border-b border-gray-600">Subject</th>
            <th className="p-2 border-b border-gray-600">Transaction Details</th>
            <th className="p-2 border-b border-gray-600">Decision</th>
            <th className="p-2 border-b border-gray-600">Risk Score</th>
            <th className="p-2 border-b border-gray-600">Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id} className={`border-b border-gray-700 ${r.response?.decision === 'VETO' ? 'bg-red-500/10' : r.response?.decision === 'FLAG_FOR_REVIEW' ? 'bg-yellow-500/10' : ''}`}>
              <td className="p-2 text-xs">{new Date(r.timestamp).toLocaleString()}</td>
              <td className="p-2">{r.sourceAI}</td>
              <td className="p-2">{r.action}</td>
              <td className="p-2 font-mono text-xs text-gray-300">{r.subjectId}</td>
              <td className="p-2 text-xs text-gray-300">
                {r.transactionDetails ? `${r.transactionDetails.amount} ${r.transactionDetails.currency} (${r.transactionDetails.type})` : 'N/A'}
                {r.transactionDetails?.rail && <span className="block text-gray-500">Rail: {r.transactionDetails.rail}</span>}
              </td>
              <td className={`p-2 font-bold ${r.response?.decision === 'VETO' ? 'text-red-400' : r.response?.decision === 'FLAG_FOR_REVIEW' ? 'text-yellow-400' : r.response?.decision === 'APPROVE_WITH_WARNING' ? 'text-orange-400' : 'text-green-400'}`}>
                {r.response?.decision}
              </td>
              <td className="p-2 text-xs text-gray-300">{r.riskScore}</td>
              <td className="p-2">
                <Tag color={r.status === 'PENDING' ? 'bg-blue-600' : r.status === 'HUMAN_REVIEW' ? 'bg-yellow-600' : r.status === 'REMEDIATED' ? 'bg-purple-600' : 'bg-green-600'}>{r.status}</Tag>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

/**
 * Provides a real-time overview of the health status of critical system components.
 * Business impact: Enables proactive monitoring of infrastructure stability,
 * quickly identifying degraded services or outages to ensure continuous operation
 * and minimize impact on financial transactions and services.
 */
export const SystemHealthDashboard: React.FC<{ statusEntries: SystemStatus[] }> = ({ statusEntries }) => (
  <Card title="System Health Overview" className="col-span-1">
    <div className="space-y-3 h-[60vh] overflow-y-auto">
      {statusEntries.map(s => (
        <div key={s.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-md">
          <div className="flex-1">
            <h4 className="font-semibold text-white">{s.component}</h4>
            <p className="text-xs text-gray-400">{s.message}</p>
          </div>
          <Tag color={s.health === 'OPERATIONAL' ? 'bg-green-600' : s.health === 'DEGRADED' ? 'bg-yellow-600' : 'bg-red-600'}>
            {s.health}
          </Tag>
        </div>
      ))}
    </div>
  </Card>
);

/**
 * Displays active anomaly alerts, providing immediate visibility into potential risks or incidents.
 * Business impact: Facilitates rapid incident response and risk mitigation by highlighting
 * critical deviations from normal operations, safeguarding financial assets and system integrity.
 */
export const AnomalyAlertsViewer: React.FC<{ alerts: AnomalyAlert[]; onResolve: (id: string) => void }> = ({ alerts, onResolve }) => (
  <Card title="Active Anomaly Alerts" className="col-span-1">
    <div className="space-y-3 h-[60vh] overflow-y-auto">
      {alerts.length === 0 ? (
        <p className="text-gray-400">No active anomaly alerts.</p>
      ) : (
        alerts.map(alert => (
          <div key={alert.id} className={`p-3 rounded-md ${alert.severity === 'CRITICAL' ? 'bg-red-700/30 border border-red-600' : 'bg-yellow-700/30 border border-yellow-600'}`}>
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-white">{alert.type}</h4>
              <Tag color={alert.severity === 'CRITICAL' ? 'bg-red-600' : 'bg-yellow-600'}>{alert.severity}</Tag>
            </div>
            <p className="text-xs text-gray-300 mb-2">{alert.description}</p>
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>{alert.relatedEntityType}: {mockAIModels.find(m => m.id === alert.relatedEntityId)?.name || governanceService._users.get(alert.relatedEntityId || '')?.name || alert.relatedEntityId || 'N/A'}</span>
              <Button onClick={() => onResolve(alert.id)} variant="secondary" className="px-3 py-1 text-xs">Resolve</Button>
            </div>
          </div>
        ))
      )}
    </div>
  </Card>
);

/**
 * Manages the queue and resolution of human review tasks for flagged AI actions.
 * Business impact: Implements a crucial human-in-the-loop governance mechanism,
 * ensuring complex ethical and compliance issues are handled by expert human judgment,
 * mitigating risk and building trust in autonomous systems.
 */
export const HumanReviewDashboard: React.FC<{
  tasks: HumanReviewTask[];
  onUpdateTask: (id: string, updates: Partial<HumanReviewTask>) => void;
  onCreateRemediation: (action: Omit<RemediationAction, 'id' | 'status'>) => Promise<RemediationAction>;
}> = ({ tasks, onUpdateTask, onCreateRemediation }) => {
  const [selectedTask, setSelectedTask] = useState<HumanReviewTask | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [resolution, setResolution] = useState('');
  const [showRemediationForm, setShowRemediationForm] = useState(false);
  const [remediationType, setRemediationType] = useState<RemediationAction['type'] | ''>('');
  const [remediationDescription, setRemediationDescription] = useState('');
  const currentUserId = governanceService._users.get('user-reviewer-1')?.id || 'reviewer-mock';

  useEffect(() => {
    if (selectedTask) {
      setReviewerNotes(selectedTask.reviewerNotes || '');
      setResolution(selectedTask.resolution || '');
      setShowRemediationForm(false);
      setRemediationType('');
      setRemediationDescription('');
    }
  }, [selectedTask]);

  const handleResolve = () => {
    if (selectedTask && resolution) {
      onUpdateTask(selectedTask.id, {
        status: 'COMPLETED',
        resolution: resolution as any,
        reviewerNotes,
        resolvedBy: currentUserId,
      });
      setSelectedTask(null);
    }
  };

  const handleProposeRemediation = async () => {
    if (selectedTask && remediationType && remediationDescription) {
      const relatedActionRequest = governanceService._requests.get(selectedTask.actionRequestId);
      if (!relatedActionRequest) return;

      const newRemediation: Omit<RemediationAction, 'id' | 'status'> = {
        actionRequestId: selectedTask.actionRequestId,
        type: remediationType,
        description: remediationDescription,
        proposedBy: 'HUMAN',
        triggeredByPolicyId: relatedActionRequest.response?.vetoDetails?.policyId,
      };

      const createdRemediation = await onCreateRemediation(newRemediation);
      if (createdRemediation) {
        onUpdateTask(selectedTask.id, {
          suggestedRemediationId: createdRemediation.id,
          reviewerNotes: (selectedTask.reviewerNotes || '') + ` (Remediation proposed: ${createdRemediation.type})`,
          status: 'COMPLETED', // Or 'IN_REVIEW' if remediation requires separate approval
          resolution: 'MODIFIED',
          resolvedBy: currentUserId,
        });
        setSelectedTask(null);
      }
    }
  };

  const getActionRequest = (id: string) => governanceService._requests.get(id);
  const getPolicyRule = (id: string) => governanceService._policies.get(id);
  const getUserName = (id?: string) => id ? governanceService._users.get(id)?.name || id : 'N/A';
  const getAgentName = (id?: string) => id ? mockAIModels.find(m => m.agentId === id)?.name || id : 'N/A';

  const remediationTypeOptions = [
    'MODIFY_AI_INPUT', 'REJECT_ACTION', 'REQUEST_MORE_INFO', 'HUMAN_OVERRIDE', 'RETRAIN_MODEL',
    'PAUSE_AI_AGENT', 'REVERSE_TRANSACTION', 'ADJUST_CREDIT_LIMIT', 'NOTIFY_REGULATOR', 'APPLY_COMPLIANCE_HOLD'
  ].map(type => ({ value: type, label: type.replace(/_/g, ' ') }));

  return (
    <Card title="Human Review Queue" className="col-span-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[60vh] overflow-hidden">
        <div className="overflow-y-auto pr-2">
          {tasks.length === 0 ? (
            <p className="text-gray-400">No pending human review tasks.</p>
          ) : (
            tasks.map(task => {
              const request = getActionRequest(task.actionRequestId);
              return (
                <div
                  key={task.id}
                  className={`p-3 mb-2 rounded-md border cursor-pointer ${selectedTask?.id === task.id ? 'bg-indigo-700/30 border-indigo-600' : 'bg-gray-800 border-gray-700 hover:bg-gray-700/50'}`}
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold text-white">{task.reviewType}</h4>
                    <Tag color={task.priority === 'CRITICAL' ? 'bg-red-600' : task.priority === 'HIGH' ? 'bg-yellow-600' : 'bg-blue-600'}>
                      {task.priority}
                    </Tag>
                  </div>
                  <p className="text-xs text-gray-300">{task.contextSummary}</p>
                  <p className="text-xs text-gray-500 mt-1">Due: {task.reviewDeadline.toLocaleDateString()}</p>
                  {task.assignedTo && <p className="text-xs text-gray-500">Assigned: {getUserName(task.assignedTo)}</p>}
                </div>
              );
            })
          )}
        </div>

        {selectedTask && (
          <div className="p-4 bg-gray-800 rounded-md overflow-y-auto">
            <h3 className="text-xl font-bold mb-3 text-white">Review Task Details: {selectedTask.reviewType}</h3>
            <p className="text-gray-400 text-sm mb-4">{selectedTask.contextSummary}</p>

            <div className="mb-4">
              <h4 className="font-semibold text-white mb-2">Original AI Action:</h4>
              <p className="text-xs text-gray-300"><strong>Source AI:</strong> {getActionRequest(selectedTask.actionRequestId)?.sourceAI}</p>
              {getActionRequest(selectedTask.actionRequestId)?.sourceAI && mockAIModels.find(m => m.name === getActionRequest(selectedTask.actionRequestId)?.sourceAI)?.agentId && (
                <p className="text-xs text-gray-300"><strong>Agent ID:</strong> {getAgentName(mockAIModels.find(m => m.name === getActionRequest(selectedTask.actionRequestId)?.sourceAI)?.agentId)}</p>
              )}
              <p className="text-xs text-gray-300"><strong>Action:</strong> {getActionRequest(selectedTask.actionRequestId)?.action}</p>
              <p className="text-xs text-gray-300"><strong>Subject:</strong> {getActionRequest(selectedTask.actionRequestId)?.subjectId}</p>
              <p className="text-xs text-gray-300"><strong>AI Rationale:</strong> {getActionRequest(selectedTask.actionRequestId)?.rationale}</p>
              {getActionRequest(selectedTask.actionRequestId)?.transactionDetails && (
                <p className="text-xs text-gray-300">
                  <strong>Transaction:</strong> {getActionRequest(selectedTask.actionRequestId)?.transactionDetails?.amount} {getActionRequest(selectedTask.actionRequestId)?.transactionDetails?.currency} ({getActionRequest(selectedTask.actionRequestId)?.transactionDetails?.type}) via {getActionRequest(selectedTask.actionRequestId)?.transactionDetails?.rail}
                </p>
              )}
              {getActionRequest(selectedTask.actionRequestId)?.response && (
                <>
                  <p className="text-xs text-gray-300"><strong>Governor Decision:</strong> <Tag color={getActionRequest(selectedTask.actionRequestId)?.response?.decision === 'VETO' ? 'bg-red-600' : 'bg-yellow-600'}>{getActionRequest(selectedTask.actionRequestId)?.response?.decision}</Tag></p>
                  <p className="text-xs text-gray-300"><strong>Governor Reason:</strong> {getActionRequest(selectedTask.actionRequestId)?.response?.reason}</p>
                  {getActionRequest(selectedTask.actionRequestId)?.response?.violatesPrinciple && (
                    <p className="text-xs text-gray-300"><strong>Violated Principles:</strong> {getActionRequest(selectedTask.actionRequestId)?.response?.violatesPrinciple?.join(', ')}</p>
                  )}
                  {getActionRequest(selectedTask.actionRequestId)?.response?.vetoDetails && (
                    <p className="text-xs text-gray-300"><strong>Triggering Policy:</strong> {getActionRequest(selectedTask.actionRequestId)?.response?.vetoDetails?.policyName} (ID: {getActionRequest(selectedTask.actionRequestId)?.response?.vetoDetails?.policyId})</p>
                  )}
                </>
              )}
            </div>

            <InputField
              id="reviewer-notes"
              label="Reviewer Notes"
              textarea
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              placeholder="Add your review notes here..."
            />
            <SelectField
              id="resolution-decision"
              label="Resolution Decision"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              options={selectedTask.decisionOptions.map(opt => ({ value: opt.toUpperCase().replace(/\s/g, '_'), label: opt }))}
            />
            <Button onClick={handleResolve} variant="success" className="w-full mt-4" disabled={!resolution}>
              Complete Review
            </Button>
            <Button onClick={() => setShowRemediationForm(!showRemediationForm)} variant="info" className="w-full mt-2">
              {showRemediationForm ? 'Hide Remediation Form' : 'Propose Remediation'}
            </Button>
            {showRemediationForm && (
              <div className="mt-4 p-3 border border-gray-600 rounded-md">
                <h4 className="font-semibold text-white mb-2">Propose New Remediation</h4>
                <SelectField
                  id="remediation-type"
                  label="Remediation Type"
                  value={remediationType}
                  onChange={(e) => setRemediationType(e.target.value as RemediationAction['type'])}
                  options={remediationTypeOptions}
                />
                <InputField
                  id="remediation-description"
                  label="Description"
                  textarea
                  value={remediationDescription}
                  onChange={(e) => setRemediationDescription(e.target.value)}
                  placeholder="Detail the proposed remediation action..."
                />
                <Button onClick={handleProposeRemediation} variant="primary" className="w-full mt-2" disabled={!remediationType || !remediationDescription}>
                  Submit Remediation Proposal
                </Button>
              </div>
            )}
            <Button onClick={() => setSelectedTask(null)} variant="secondary" className="w-full mt-2">
              Close
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Manages the definition and lifecycle of ethical principles.
 * Business impact: Provides a controlled environment for maintaining the ethical constitution
 * of the platform, ensuring that all AI governance aligns with foundational values and regulatory mandates.
 */
export const EthicalPrinciplesManager: React.FC<{ principles: EthicalPrinciple[]; onUpdate: (id: string, updates: Partial<EthicalPrinciple>) => void; onCreate: (principle: Omit<EthicalPrinciple, 'id' | 'version' | 'lastUpdated' | 'isActive'>) => void }> = ({ principles, onUpdate, onCreate }) => {
  const [selectedPrinciple, setSelectedPrinciple] = useState<EthicalPrinciple | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formState, setFormState] = useState<Partial<EthicalPrinciple>>({});
  const currentUserId = governanceService._users.get('user-admin-1')?.id || 'admin-mock';

  useEffect(() => {
    if (selectedPrinciple) {
      setFormState(selectedPrinciple);
    } else {
      setFormState({});
    }
  }, [selectedPrinciple]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    if (id === 'guidance' || id === 'keywords') {
      setFormState(prev => ({ ...prev, [id]: value.split(',').map(s => s.trim()).filter(s => s) }));
    } else {
      setFormState(prev => ({ ...prev, [id]: id === 'priority' ? parseInt(value) : value }));
    }
  };

  const handleSavePrinciple = async () => {
    if (isCreating) {
      await onCreate(formState as Omit<EthicalPrinciple, 'id' | 'version' | 'lastUpdated' | 'isActive'>);
      setIsCreating(false);
      setFormState({});
    } else if (selectedPrinciple && formState.id) {
      await onUpdate(selectedPrinciple.id, formState);
      setSelectedPrinciple(prev => ({ ...prev!, ...formState }));
      setIsEditing(false);
    }
  };

  const categoryOptions = ['SOCIAL', 'TECHNICAL', 'LEGAL', 'HUMAN_CENTERED', 'FINANCIAL_INTEGRITY'].map(c => ({ value: c, label: c }));

  return (
    <Card title="Ethical Principles Management" className="col-span-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[60vh] overflow-hidden">
        <div className="overflow-y-auto pr-2">
          <Button onClick={() => { setIsCreating(true); setIsEditing(true); setSelectedPrinciple(null); setFormState({}); }} variant="primary" className="w-full mb-4">
            + Create New Principle
          </Button>
          {principles.map(principle => (
            <div
              key={principle.id}
              className={`p-3 mb-2 rounded-md border cursor-pointer ${selectedPrinciple?.id === principle.id ? 'bg-indigo-700/30 border-indigo-600' : 'bg-gray-800 border-gray-700 hover:bg-gray-700/50'}`}
              onClick={() => { setSelectedPrinciple(principle); setIsEditing(false); setIsCreating(false); }}
            >
              <h4 className="font-semibold text-white">{principle.name}</h4>
              <p className="text-xs text-gray-400 truncate">{principle.description}</p>
              <Tag color={principle.isActive ? 'bg-green-600' : 'bg-red-600'} className="mt-1">{principle.isActive ? 'Active' : 'Inactive'}</Tag>
            </div>
          ))}
        </div>

        {(selectedPrinciple || isCreating) && (
          <div className="p-4 bg-gray-800 rounded-md overflow-y-auto">
            <h3 className="text-xl font-bold mb-3 text-white">{isCreating ? 'Create New Ethical Principle' : `Principle Details: ${selectedPrinciple?.name}`}</h3>
            {(!isEditing && selectedPrinciple) ? (
              <>
                <p className="text-sm text-gray-300 mb-2"><strong>Description:</strong> {selectedPrinciple.description}</p>
                <p className="text-sm text-gray-300 mb-2"><strong>Guidance:</strong> {selectedPrinciple.guidance.join('; ')}</p>
                <p className="text-sm text-gray-300 mb-2"><strong>Category:</strong> {selectedPrinciple.category}</p>
                <p className="text-sm text-gray-300 mb-2"><strong>Priority:</strong> {selectedPrinciple.priority}</p>
                <p className="text-sm text-gray-300 mb-2"><strong>Keywords:</strong> {selectedPrinciple.keywords.join(', ')}</p>
                <p className="text-sm text-gray-300 mb-2"><strong>Status:</strong> <Tag color={selectedPrinciple.isActive ? 'bg-green-600' : 'bg-red-600'}>{selectedPrinciple.isActive ? 'Active' : 'Inactive'}</Tag></p>
                <p className="text-sm text-gray-300 mb-2"><strong>Last Updated:</strong> {new Date(selectedPrinciple.lastUpdated).toLocaleString()}</p>
                <Button onClick={() => setIsEditing(true)} variant="primary" className="w-full mt-4">Edit Principle</Button>
                <Button onClick={() => setSelectedPrinciple(null)} variant="secondary" className="w-full mt-2">Close</Button>
              </>
            ) : (
              <>
                <InputField id="name" label="Name" value={formState.name || ''} onChange={handleFormChange} />
                <InputField id="description" label="Description" textarea value={formState.description || ''} onChange={handleFormChange} />
                <InputField id="guidance" label="Guidance (comma-separated)" textarea value={(formState.guidance || []).join(', ')} onChange={handleFormChange} />
                <SelectField
                  id="category"
                  label="Category"
                  value={formState.category || ''}
                  onChange={handleFormChange}
                  options={categoryOptions}
                />
                <InputField id="priority" label="Priority" type="number" value={formState.priority || 0} onChange={handleFormChange} />
                <InputField id="keywords" label="Keywords (comma-separated)" value={(formState.keywords || []).join(', ')} onChange={handleFormChange} />
                <CheckboxField id="isActive" label="Is Active" checked={formState.isActive ?? true} onChange={(e) => setFormState(prev => ({ ...prev, isActive: e.target.checked }))} />
                <Button onClick={handleSavePrinciple} variant="success" className="w-full mt-4">Save Changes</Button>
                <Button onClick={() => { setIsEditing(false); if (isCreating) setSelectedPrinciple(null); setIsCreating(false); }} variant="secondary" className="w-full mt-2">Cancel</Button>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Provides an interface for defining and managing ethical policy rules that govern AI behavior.
 * Business impact: Enables direct control over autonomous systems by translating ethical principles
 * into executable rules, ensuring compliance, and providing an auditable history of policy evolution.
 */
export const PolicyRuleEditor: React.FC<{
  policies: EthicalPolicyRule[];
  principles: EthicalPrinciple[];
  aiModels: AIModelProfile[];
  onUpdate: (id: string, updates: Partial<EthicalPolicyRule>) => void;
  onCreate: (newRule: Omit<EthicalPolicyRule, 'id' | 'version' | 'lastUpdated' | 'creationDate' | 'isActive'>) => void;
  onViewHistory: (policyId: string) => void;
}> = ({ policies, principles, aiModels, onUpdate, onCreate, onViewHistory }) => {
  const [selectedPolicy, setSelectedPolicy] = useState<EthicalPolicyRule | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formState, setFormState] = useState<Partial<EthicalPolicyRule>>({});
  const currentUserId = governanceService._users.get('user-admin-1')?.id || 'admin-mock';

  useEffect(() => {
    if (selectedPolicy) {
      setFormState(selectedPolicy);
    } else {
      setFormState({});
    }
  }, [selectedPolicy]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    if (id === 'sourceAIModels' || id === 'actionTypes') {
      const options = (e.target as HTMLSelectElement).options;
      const selectedValues: string[] = [];
      for (let i = 0, l = options.length; i < l; i++) {
        if (options[i].selected) {
          selectedValues.push(options[i].value);
        }
      }
      setFormState(prev => ({ ...prev, [id]: selectedValues }));
    } else if (id === 'condition') {
      try {
        setFormState(prev => ({ ...prev, [id]: JSON.parse(value) }));
      } catch (error) {
        setFormState(prev => ({ ...prev, [id]: value }));
      }
    } else if (id === 'enforcementThreshold') {
      setFormState(prev => ({ ...prev, [id]: parseFloat(value) }));
    } else if (id === 'suggestedRemediationTemplate') {
      setFormState(prev => ({ ...prev, [id]: value.split(',').map(s => s.trim()) }));
    }
    else {
      setFormState(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSavePolicy = async () => {
    if (isCreating) {
      await onCreate(formState as Omit<EthicalPolicyRule, 'id' | 'version' | 'lastUpdated' | 'creationDate' | 'isActive'>);
      setIsCreating(false);
      setFormState({});
    } else if (selectedPolicy && formState.id) {
      await onUpdate(selectedPolicy.id, formState);
      setSelectedPolicy(prev => ({ ...prev!, ...formState }));
      setIsEditing(false);
    }
  };

  const modelOptions = aiModels.map(model => ({ value: model.name, label: model.name }));
  const principleOptions = principles.map(p => ({ value: p.id, label: p.name }));
  const decisionEffectOptions = ['VETO', 'FLAG_FOR_REVIEW', 'APPROVE_WITH_WARNING'].map(d => ({ value: d, label: d }));
  const conditionTypeOptions = ['CONTEXT_MATCH', 'PAYLOAD_EVAL', 'RISK_THRESHOLD', 'EXTERNAL_DATA_CHECK', 'TRANSACTION_RULE', 'AGENT_BEHAVIOR_PATTERN'].map(c => ({ value: c, label: c }));
  const violationSeverityOptions = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => ({ value: s, label: s }));

  return (
    <Card title="Ethical Policy Rules Editor" className="col-span-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[70vh] overflow-hidden">
        <div className="md:col-span-1 overflow-y-auto pr-2">
          <Button onClick={() => { setIsCreating(true); setIsEditing(true); setSelectedPolicy(null); setFormState({ isActive: true }); }} variant="primary" className="w-full mb-4">
            + Create New Policy
          </Button>
          {policies.map(policy => (
            <div
              key={policy.id}
              className={`p-3 mb-2 rounded-md border cursor-pointer ${selectedPolicy?.id === policy.id ? 'bg-indigo-700/30 border-indigo-600' : 'bg-gray-800 border-gray-700 hover:bg-gray-700/50'}`}
              onClick={() => { setSelectedPolicy(policy); setIsEditing(false); setIsCreating(false); }}
            >
              <h4 className="font-semibold text-white">{policy.name}</h4>
              <p className="text-xs text-gray-400 truncate">{policy.description}</p>
              <div className="flex justify-between items-center mt-1">
                <Tag color={policy.isActive ? 'bg-green-600' : 'bg-red-600'}>{policy.isActive ? 'Active' : 'Inactive'}</Tag>
                <Tag color="bg-gray-500">v{policy.version}</Tag>
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-2 p-4 bg-gray-800 rounded-md overflow-y-auto">
          {(!selectedPolicy && !isCreating) ? (
            <p className="text-gray-400 text-center py-10">Select a policy to view/edit or create a new one.</p>
          ) : (
            <>
              <h3 className="text-xl font-bold mb-3 text-white">{isCreating ? 'Create New Policy Rule' : `Policy Details: ${selectedPolicy?.name}`}</h3>
              {(!isEditing && selectedPolicy) ? (
                <>
                  <p className="text-sm text-gray-300 mb-2"><strong>Description:</strong> {selectedPolicy.description}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Principle:</strong> {principles.find(p => p.id === selectedPolicy.principleId)?.name}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Applies to Models:</strong> {selectedPolicy.sourceAIModels.join(', ')}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Applies to Actions:</strong> {selectedPolicy.actionTypes.join(', ')}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Condition Type:</strong> {selectedPolicy.conditionType}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Condition:</strong> <pre className="text-xs bg-gray-700 p-2 rounded">{JSON.stringify(selectedPolicy.condition, null, 2)}</pre></p>
                  {selectedPolicy.evaluationScript && <p className="text-sm text-gray-300 mb-2"><strong>Evaluation Script:</strong> <pre className="text-xs bg-gray-700 p-2 rounded max-h-40 overflow-auto">{selectedPolicy.evaluationScript}</pre></p>}
                  <p className="text-sm text-gray-300 mb-2"><strong>Decision Effect:</strong> <Tag color={selectedPolicy.decisionEffect === 'VETO' ? 'bg-red-600' : selectedPolicy.decisionEffect === 'FLAG_FOR_REVIEW' ? 'bg-yellow-600' : 'bg-green-600'}>{selectedPolicy.decisionEffect}</Tag></p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Violation Severity:</strong> <Tag color={selectedPolicy.violationSeverity === 'CRITICAL' ? 'bg-red-600' : selectedPolicy.violationSeverity === 'HIGH' ? 'bg-orange-600' : 'bg-blue-600'}>{selectedPolicy.violationSeverity}</Tag></p>
                  {selectedPolicy.suggestedRemediationTemplate && <p className="text-sm text-gray-300 mb-2"><strong>Suggested Remediation:</strong> {selectedPolicy.suggestedRemediationTemplate.join('; ')}</p>}
                  {selectedPolicy.enforcementThreshold !== undefined && <p className="text-sm text-gray-300 mb-2"><strong>Enforcement Threshold:</strong> {selectedPolicy.enforcementThreshold}</p>}
                  <p className="text-sm text-gray-300 mb-2"><strong>Status:</strong> <Tag color={selectedPolicy.isActive ? 'bg-green-600' : 'bg-red-600'}>{selectedPolicy.isActive ? 'Active' : 'Inactive'}</Tag></p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Version:</strong> {selectedPolicy.version}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Last Updated:</strong> {new Date(selectedPolicy.lastUpdated).toLocaleString()}</p>
                  <Button onClick={() => setIsEditing(true)} variant="primary" className="w-full mt-4">Edit Policy</Button>
                  <Button onClick={() => onViewHistory(selectedPolicy.id)} variant="info" className="w-full mt-2">View History</Button>
                  <Button onClick={() => setSelectedPolicy(null)} variant="secondary" className="w-full mt-2">Close</Button>
                </>
              ) : (
                <>
                  <InputField id="name" label="Policy Name" value={formState.name || ''} onChange={handleFormChange} />
                  <InputField id="description" label="Description" textarea value={formState.description || ''} onChange={handleFormChange} />
                  <SelectField
                    id="principleId"
                    label="Governing Principle"
                    value={formState.principleId || ''}
                    onChange={handleFormChange}
                    options={principleOptions}
                  />
                  <SelectField
                    id="sourceAIModels"
                    label="Applies to AI Models"
                    value={Array.isArray(formState.sourceAIModels) ? formState.sourceAIModels : []}
                    onChange={handleFormChange}
                    options={[...modelOptions, { value: '*', label: 'ALL Models' }]}
                    multiple
                  />
                  <SelectField
                    id="actionTypes"
                    label="Applies to Action Types"
                    value={Array.isArray(formState.actionTypes) ? formState.actionTypes : []}
                    onChange={handleFormChange}
                    options={[...Array.from(new Set(aiModels.flatMap(m => m.outputActions))).map(action => ({ value: action, label: action })), { value: '*', label: 'ALL Actions' }]}
                    multiple
                  />
                  <SelectField
                    id="conditionType"
                    label="Condition Type"
                    value={formState.conditionType || ''}
                    onChange={handleFormChange}
                    options={conditionTypeOptions}
                  />
                  <InputField id="condition" label="Condition (JSON)" textarea value={typeof formState.condition === 'object' ? JSON.stringify(formState.condition || {}, null, 2) : String(formState.condition || '')} onChange={handleFormChange} />
                  <InputField id="evaluationScript" label="Evaluation Script (Optional)" textarea value={formState.evaluationScript || ''} onChange={handleFormChange} />
                  <SelectField
                    id="decisionEffect"
                    label="Decision Effect"
                    value={formState.decisionEffect || ''}
                    onChange={handleFormChange}
                    options={decisionEffectOptions}
                  />
                  <SelectField
                    id="violationSeverity"
                    label="Violation Severity"
                    value={formState.violationSeverity || ''}
                    onChange={handleFormChange}
                    options={violationSeverityOptions}
                  />
                  <InputField id="suggestedRemediationTemplate" label="Suggested Remediation (comma-separated)" textarea value={Array.isArray(formState.suggestedRemediationTemplate) ? formState.suggestedRemediationTemplate.join(', ') : ''} onChange={handleFormChange} />
                  <InputField id="enforcementThreshold" label="Enforcement Threshold (Optional, numeric)" type="number" value={formState.enforcementThreshold || ''} onChange={handleFormChange} />
                  <CheckboxField id="isActive" label="Is Active" checked={formState.isActive ?? true} onChange={(e) => setFormState(prev => ({ ...prev, isActive: e.target.checked }))} />

                  <Button onClick={handleSavePolicy} variant="success" className="w-full mt-4">
                    {isCreating ? 'Create Policy' : 'Save Changes'}
                  </Button>
                  <Button onClick={() => { setIsEditing(false); if (isCreating) setSelectedPolicy(null); setIsCreating(false); }} variant="secondary" className="w-full mt-2">
                    Cancel
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

/**
 * Manages the registration and profiles of all AI models and autonomous agents.
 * Business impact: Centralizes information about all AI assets, enabling comprehensive risk assessment,
 * compliance tracking, and consistent application of governance policies across the entire AI ecosystem.
 */
export const AIModelProfileManager: React.FC<{ models: AIModelProfile[]; onUpdate: (id: string, updates: Partial<AIModelProfile>) => void; onCreate: (newModel: Omit<AIModelProfile, 'id' | 'lastUpdated' | 'registeredDate' | 'governorIntegrationStatus'>) => void }> = ({ models, onUpdate, onCreate }) => {
  const [selectedModel, setSelectedModel] = useState<AIModelProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formState, setFormState] = useState<Partial<AIModelProfile>>({});
  const currentUserId = governanceService._users.get('user-admin-1')?.id || 'admin-mock';

  useEffect(() => {
    if (selectedModel) {
      setFormState(selectedModel);
    } else {
      setFormState({});
    }
  }, [selectedModel]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    if (id === 'dataSources' || id === 'inputFeatures' || id === 'outputActions' || id === 'agentCapabilities') {
      setFormState(prev => ({ ...prev, [id]: value.split(',').map(s => s.trim()).filter(s => s) }));
    } else {
      setFormState(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSaveModel = async () => {
    if (isCreating) {
      await onCreate(formState as Omit<AIModelProfile, 'id' | 'lastUpdated' | 'registeredDate' | 'governorIntegrationStatus'>);
      setIsCreating(false);
      setFormState({});
    } else if (selectedModel && formState.id) {
      await onUpdate(selectedModel.id, formState);
      setSelectedModel(prev => ({ ...prev!, ...formState }));
      setIsEditing(false);
    }
  };

  const riskCategoryOptions = ['HIGH', 'MEDIUM', 'LOW', 'CRITICAL'].map(c => ({ value: c, label: c }));
  const integrationStatusOptions = ['INTEGRATED', 'PENDING', 'DISABLED'].map(s => ({ value: s, label: s }));

  return (
    <Card title="AI Model Profile Manager" className="col-span-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[70vh] overflow-hidden">
        <div className="md:col-span-1 overflow-y-auto pr-2">
          <Button onClick={() => { setIsCreating(true); setIsEditing(true); setSelectedModel(null); setFormState({}); }} variant="primary" className="w-full mb-4">
            + Register New AI Model
          </Button>
          {models.map(model => (
            <div
              key={model.id}
              className={`p-3 mb-2 rounded-md border cursor-pointer ${selectedModel?.id === model.id ? 'bg-indigo-700/30 border-indigo-600' : 'bg-gray-800 border-gray-700 hover:bg-gray-700/50'}`}
              onClick={() => { setSelectedModel(model); setIsEditing(false); setIsCreating(false); }}
            >
              <h4 className="font-semibold text-white">{model.name}</h4>
              <p className="text-xs text-gray-400 truncate">{model.description}</p>
              <Tag color={model.governorIntegrationStatus === 'INTEGRATED' ? 'bg-green-600' : model.governorIntegrationStatus === 'PENDING' ? 'bg-yellow-600' : 'bg-red-600'} className="mt-1">
                {model.governorIntegrationStatus}
              </Tag>
            </div>
          ))}
        </div>

        <div className="md:col-span-2 p-4 bg-gray-800 rounded-md overflow-y-auto">
          {(!selectedModel && !isCreating) ? (
            <p className="text-gray-400 text-center py-10">Select an AI model to view/edit or register a new one.</p>
          ) : (
            <>
              <h3 className="text-xl font-bold mb-3 text-white">{isCreating ? 'Register New AI Model' : `Model Details: ${selectedModel?.name}`}</h3>
              {(!isEditing && selectedModel) ? (
                <>
                  <p className="text-sm text-gray-300 mb-2"><strong>Description:</strong> {selectedModel.description}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Developer Team:</strong> {selectedModel.developerTeam}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Environment:</strong> {selectedModel.deploymentEnvironment}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Data Sources:</strong> {selectedModel.dataSources.join(', ')}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Input Features:</strong> {selectedModel.inputFeatures.join(', ')}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Output Actions:</strong> {selectedModel.outputActions.join(', ')}</p>
                  {selectedModel.agentId && <p className="text-sm text-gray-300 mb-2"><strong>Agent ID:</strong> {selectedModel.agentId}</p>}
                  {selectedModel.agentCapabilities && <p className="text-sm text-gray-300 mb-2"><strong>Agent Capabilities:</strong> {selectedModel.agentCapabilities.join(', ')}</p>}
                  <p className="text-sm text-gray-300 mb-2"><strong>Ethical Risk:</strong> <Tag color={selectedModel.ethicalRiskCategory === 'HIGH' || selectedModel.ethicalRiskCategory === 'CRITICAL' ? 'bg-red-600' : 'bg-yellow-600'}>{selectedModel.ethicalRiskCategory}</Tag></p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Governor Status:</strong> <Tag color={selectedModel.governorIntegrationStatus === 'INTEGRATED' ? 'bg-green-600' : selectedModel.governorIntegrationStatus === 'PENDING' ? 'bg-yellow-600' : 'bg-red-600'}>{selectedModel.governorIntegrationStatus}</Tag></p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Contact:</strong> {selectedModel.contactPerson}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Registered:</strong> {new Date(selectedModel.registeredDate).toLocaleString()}</p>
                  <p className="text-sm text-gray-300 mb-2"><strong>Last Updated:</strong> {new Date(selectedModel.lastUpdated).toLocaleString()}</p>
                  <Button onClick={() => setIsEditing(true)} variant="primary" className="w-full mt-4">Edit Profile</Button>
                  <Button onClick={() => setSelectedModel(null)} variant="secondary" className="w-full mt-2">Close</Button>
                </>
              ) : (
                <>
                  <InputField id="name" label="Model Name" value={formState.name || ''} onChange={handleFormChange} />
                  <InputField id="description" label="Description" textarea value={formState.description || ''} onChange={handleFormChange} />
                  <InputField id="developerTeam" label="Developer Team" value={formState.developerTeam || ''} onChange={handleFormChange} />
                  <InputField id="deploymentEnvironment" label="Deployment Environment" value={formState.deploymentEnvironment || ''} onChange={handleFormChange} />
                  <InputField id="dataSources" label="Data Sources (comma-separated)" value={Array.isArray(formState.dataSources) ? formState.dataSources.join(', ') : ''} onChange={handleFormChange} />
                  <InputField id="inputFeatures" label="Input Features (comma-separated)" value={Array.isArray(formState.inputFeatures) ? formState.inputFeatures.join(', ') : ''} onChange={handleFormChange} />
                  <InputField id="outputActions" label="Output Actions (comma-separated)" value={Array.isArray(formState.outputActions) ? formState.outputActions.join(', ') : ''} onChange={handleFormChange} />
                  <InputField id="agentId" label="Agent ID (Optional)" value={formState.agentId || ''} onChange={handleFormChange} />
                  <InputField id="agentCapabilities" label="Agent Capabilities (comma-separated)" value={Array.isArray(formState.agentCapabilities) ? formState.agentCapabilities.join(', ') : ''} onChange={handleFormChange} />
                  <SelectField
                    id="ethicalRiskCategory"
                    label="Ethical Risk Category"
                    value={formState.ethicalRiskCategory || ''}
                    onChange={handleFormChange}
                    options={riskCategoryOptions}
                  />
                  {!isCreating && (
                    <SelectField
                      id="governorIntegrationStatus"
                      label="Governor Integration Status"
                      value={formState.governorIntegrationStatus || ''}
                      onChange={handleFormChange}
                      options={integrationStatusOptions}
                    />
                  )}
                  <InputField id="contactPerson" label="Contact Person Email" type="email" value={formState.contactPerson || ''} onChange={handleFormChange} />

                  <Button onClick={handleSaveModel} variant="success" className="w-full mt-4">
                    {isCreating ? 'Register Model' : 'Save Changes'}
                  </Button>
                  <Button onClick={() => { setIsEditing(false); if (isCreating) setSelectedModel(null); setIsCreating(false); }} variant="secondary" className="w-full mt-2">
                    Cancel
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

/**
 * Displays a comprehensive, cryptographically-chained audit trail of all system events.
 * Business impact: Provides immutable proof of every action and decision within the platform,
 * satisfying the highest standards for regulatory compliance, internal governance, and forensic analysis.
 */
export const AuditLogViewer: React.FC<{ logs: AuditLogEntry[] }> = ({ logs }) => (
  <Card title="Full Audit Trail" className="col-span-3">
    <div className="overflow-auto h-[70vh]">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-800/50 sticky top-0 z-10">
          <tr>
            <th className="p-2 border-b border-gray-600">Timestamp</th>
            <th className="p-2 border-b border-gray-600">Event Type</th>
            <th className="p-2 border-b border-gray-600">Entity Type</th>
            <th className="p-2 border-b border-gray-600">Entity ID</th>
            <th className="p-2 border-b border-gray-600">Details</th>
            <th className="p-2 border-b border-gray-600">User/Agent</th>
            <th className="p-2 border-b border-gray-600">Severity</th>
            <th className="p-2 border-b border-gray-600">Hash (Tamper-Evident)</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} className={`border-b border-gray-700 ${log.severity === 'ERROR' ? 'bg-red-500/10' : log.severity === 'WARNING' ? 'bg-yellow-500/10' : ''}`}>
              <td className="p-2 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
              <td className="p-2 text-xs">{log.eventType}</td>
              <td className="p-2 text-xs">{log.entityType}</td>
              <td className="p-2 font-mono text-xs text-gray-300">{log.entityId}</td>
              <td className="p-2 text-xs text-gray-400 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">{JSON.stringify(log.details)}</td>
              <td className="p-2 text-xs">{governanceService._users.get(log.userId || '')?.name || log.userId || 'System'}</td>
              <td className="p-2">
                <Tag color={log.severity === 'CRITICAL' || log.severity === 'ERROR' ? 'bg-red-600' : log.severity === 'WARNING' ? 'bg-yellow-600' : 'bg-green-600'}>{log.severity}</Tag>
              </td>
              <td className="p-2 font-mono text-xs text-gray-500 max-w-[80px] overflow-hidden text-ellipsis whitespace-nowrap">{log.immutableHash?.substring(0, 10)}...</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

/**
 * Provides an interface for generating and reviewing compliance reports.
 * Business impact: Automates and centralizes the generation of critical regulatory documents,
 * drastically reducing compliance costs, minimizing human error, and ensuring timely, accurate reporting.
 */
export const ComplianceReportGenerator: React.FC<{ reports: ComplianceReport[]; onGenerate: (name: string, start: Date, end: Date, creator: string) => void }> = ({ reports, onGenerate }) => {
  const [reportName, setReportName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const currentUserId = governanceService._users.get('user-compliance-1')?.id || 'compliance-mock';

  const handleGenerate = () => {
    if (reportName && startDate && endDate) {
      onGenerate(reportName, new Date(startDate), new Date(endDate), currentUserId);
      setReportName('');
      setStartDate('');
      setEndDate('');
    }
  };

  return (
    <Card title="Compliance Reports" className="col-span-2">
      <div className="mb-4 p-4 bg-gray-800 rounded-md">
        <h4 className="font-semibold text-white mb-2">Generate New Report</h4>
        <InputField id="reportName" label="Report Name" value={reportName} onChange={(e) => setReportName(e.target.value)} placeholder="e.g., Q4 Ethical Compliance Report" />
        <InputField id="startDate" label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <InputField id="endDate" label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button onClick={handleGenerate} variant="primary" className="w-full mt-3">Generate Report</Button>
      </div>

      <h4 className="font-semibold text-white mb-2">Generated Reports</h4>
      <div className="overflow-y-auto h-[40vh] pr-2">
        {reports.length === 0 ? (
          <p className="text-gray-400">No reports generated yet.</p>
        ) : (
          reports.map(report => (
            <div key={report.id} className="p-3 mb-2 bg-gray-800 rounded-md border border-gray-700">
              <h5 className="font-semibold text-white">{report.reportName}</h5>
              <p className="text-xs text-gray-400">Period: {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}</p>
              <p className="text-xs text-gray-400">Generated: {new Date(report.generationDate).toLocaleString()}</p>
              <p className="text-xs text-gray-400">Total Requests: {report.metrics.totalRequests}, Vetoed: {report.metrics.vetoedRequests}, Reviewed: {report.metrics.humanReviewedRequests}</p>
              {report.metrics.transactionalActionsFlagged !== undefined && (
                <p className="text-xs text-gray-400">Transactions Flagged: {report.metrics.transactionalActionsFlagged}, Vetoed: {report.metrics.transactionalActionsVetoed}</p>
              )}
              {report.metrics.successfulRemediations !== undefined && (
                <p className="text-xs text-gray-400">Successful Remediations: {report.metrics.successfulRemediations}</p>
              )}
              <Button onClick={() => alert(`Viewing report: ${report.summary}`)} variant="info" className="px-3 py-1 text-xs mt-2">View Summary</Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

/**
 * Displays and manages user feedback and complaints.
 * Business impact: Centralizes critical user insights, enabling swift resolution of issues,
 * continuous improvement of AI systems, and proactive management of user trust and satisfaction.
 */
export const UserFeedbackViewer: React.FC<{ feedback: UserFeedback[]; onResolve: (id: string, notes: string) => void }> = ({ feedback, onResolve }) => {
  const [selectedFeedback, setSelectedFeedback] = useState<UserFeedback | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const currentUserId = governanceService._users.get('user-reviewer-1')?.id || 'reviewer-mock';

  useEffect(() => {
    if (selectedFeedback) {
      setResolutionNotes(selectedFeedback.resolutionNotes || '');
    }
  }, [selectedFeedback]);

  const handleResolve = () => {
    if (selectedFeedback) {
      onResolve(selectedFeedback.id, resolutionNotes);
      setSelectedFeedback(null);
      setResolutionNotes('');
    }
  };

  const getActionRequest = (id: string) => governanceService._requests.get(id);

  return (
    <Card title="User Feedback & Complaints" className="col-span-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[60vh] overflow-hidden">
        <div className="overflow-y-auto pr-2">
          {feedback.length === 0 ? (
            <p className="text-gray-400">No user feedback to display.</p>
          ) : (
            feedback.map(fb => (
              <div
                key={fb.id}
                className={`p-3 mb-2 rounded-md border cursor-pointer ${selectedFeedback?.id === fb.id ? 'bg-indigo-700/30 border-indigo-600' : 'bg-gray-800 border-gray-700 hover:bg-gray-700/50'}`}
                onClick={() => setSelectedFeedback(fb)}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-semibold text-white">{fb.feedbackType} from {fb.userId}</h4>
                  <Tag color={fb.severity === 'CRITICAL' ? 'bg-red-600' : fb.severity === 'HIGH' ? 'bg-yellow-600' : 'bg-blue-600'}>
                    {fb.severity}
                  </Tag>
                </div>
                <p className="text-xs text-gray-300 truncate">{fb.message}</p>
                <p className="text-xs text-gray-500 mt-1">Status: {fb.status}</p>
              </div>
            ))
          )}
        </div>

        {selectedFeedback && (
          <div className="p-4 bg-gray-800 rounded-md overflow-y-auto">
            <h3 className="text-xl font-bold mb-3 text-white">Feedback Details: {selectedFeedback.feedbackType}</h3>
            <p className="text-gray-400 text-sm mb-4"><strong>User:</strong> {selectedFeedback.userId} ({selectedFeedback.contactEmail || 'N/A'})</p>
            <p className="text-gray-400 text-sm mb-4"><strong>Message:</strong> {selectedFeedback.message}</p>
            <p className="text-gray-400 text-sm mb-4"><strong>Related AI Action:</strong> {selectedFeedback.actionRequestId}</p>
            {getActionRequest(selectedFeedback.actionRequestId) && (
              <div className="mb-4 text-xs text-gray-300">
                <p><strong>Source AI:</strong> {getActionRequest(selectedFeedback.actionRequestId)?.sourceAI}</p>
                <p><strong>Action:</strong> {getActionRequest(selectedFeedback.actionRequestId)?.action}</p>
                <p><strong>Subject:</strong> {getActionRequest(selectedFeedback.actionRequestId)?.subjectId}</p>
                <p><strong>AI Rationale:</strong> {getActionRequest(selectedFeedback.actionRequestId)?.rationale}</p>
              </div>
            )}

            <InputField
              id="resolution-notes"
              label="Resolution Notes"
              textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Document the resolution steps taken..."
            />
            <Button onClick={handleResolve} variant="success" className="w-full mt-4" disabled={selectedFeedback.status === 'RESOLVED'}>
              Resolve Feedback
            </Button>
            <Button onClick={() => setSelectedFeedback(null)} variant="secondary" className="w-full mt-2">
              Close
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Displays the version history of a specific ethical policy rule.
 * Business impact: Provides an indispensable audit trail of policy changes,
 * essential for demonstrating compliance, performing root-cause analysis, and
 * ensuring complete transparency in governance evolution.
 */
export const PolicyVersionHistoryViewer: React.FC<{ policyId: string; onClose: () => void }> = ({ policyId, onClose }) => {
  const [history, setHistory] = useState<PolicyVersionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const getPolicyName = (id: string) => governanceService._policies.get(id)?.name || id;
  const getUserName = (id?: string) => id ? governanceService._users.get(id)?.name || id : 'N/A';

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const data = await governanceService.fetchPolicyVersionHistory(policyId);
      setHistory(data);
      setLoading(false);
    };
    fetchHistory();
  }, [policyId]);

  if (loading) return <Card title="Policy History">Loading...</Card>;

  return (
    <Card title={`Version History for Policy: ${getPolicyName(policyId)}`} className="col-span-3">
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {history.length === 0 ? (
          <p className="text-gray-400">No version history available for this policy.</p>
        ) : (
          history.map((version, index) => (
            <div key={version.id} className={`p-3 mb-3 rounded-md ${index === history.length - 1 ? 'bg-indigo-800/50' : 'bg-gray-800'} border border-gray-700`}>
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-semibold text-white">Version {version.version}</h4>
                <Tag color="bg-gray-600">{new Date(version.timestamp).toLocaleString()}</Tag>
              </div>
              <p className="text-xs text-gray-300 mb-1"><strong>Changes:</strong> {version.changes}</p>
              <p className="text-xs text-gray-400 mb-2"><strong>Changed By:</strong> {getUserName(version.changedBy)}</p>
              <div className="text-xs text-gray-500">
                <p><strong>Condition Type:</strong> {version.policySnapshot.conditionType}</p>
                <p><strong>Decision Effect:</strong> {version.policySnapshot.decisionEffect}</p>
                <p><strong>Is Active:</strong> {version.policySnapshot.isActive ? 'Yes' : 'No'}</p>
                <pre className="mt-2 p-2 bg-gray-700 rounded max-h-24 overflow-auto text-white text-xs">
                  {JSON.stringify(version.policySnapshot.condition, null, 2)}
                </pre>
              </div>
            </div>
          ))
        )}
      </div>
      <Button onClick={onClose} variant="secondary" className="w-full mt-4">Close History</Button>
    </Card>
  );
};

/**
 * Manages proposed and executed remediation actions.
 * Business impact: Centralizes the management of corrective measures, ensuring that
 * identified issues are systematically addressed, tracked, and reported, thereby enhancing
 * platform resilience and demonstrating proactive risk management.
 */
export const RemediationActionManagement: React.FC<{
  remediations: RemediationAction[];
  onUpdate: (id: string, updates: Partial<RemediationAction>) => void;
  onExecute: (id: string) => void;
}> = ({ remediations, onUpdate, onExecute }) => {
  const [selectedRemediation, setSelectedRemediation] = useState<RemediationAction | null>(null);
  const currentUserId = governanceService._users.get('user-reviewer-1')?.id || 'reviewer-mock';

  const getActionRequest = (id: string) => governanceService._requests.get(id);
  const getAgentName = (id?: string) => id ? mockAIModels.find(m => m.agentId === id)?.name || id : 'N/A';
  const getPolicyName = (id?: string) => id ? governanceService._policies.get(id)?.name || id : 'N/A';

  return (
    <Card title="Remediation Actions" className="col-span-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[70vh] overflow-hidden">
        <div className="overflow-y-auto pr-2">
          {remediations.length === 0 ? (
            <p className="text-gray-400">No remediation actions to display.</p>
          ) : (
            remediations.map(rem => (
              <div
                key={rem.id}
                className={`p-3 mb-2 rounded-md border cursor-pointer ${selectedRemediation?.id === rem.id ? 'bg-indigo-700/30 border-indigo-600' : 'bg-gray-800 border-gray-700 hover:bg-gray-700/50'}`}
                onClick={() => setSelectedRemediation(rem)}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-semibold text-white">{rem.type.replace(/_/g, ' ')}</h4>
                  <Tag color={rem.status === 'EXECUTED' ? 'bg-green-600' : rem.status === 'FAILED' ? 'bg-red-600' : 'bg-yellow-600'}>
                    {rem.status}
                  </Tag>
                </div>
                <p className="text-xs text-gray-300 truncate">{rem.description}</p>
                <p className="text-xs text-gray-500 mt-1">Proposed by: {rem.proposedBy}{rem.proposedByAgentId ? ` (${getAgentName(rem.proposedByAgentId)})` : ''}</p>
              </div>
            ))
          )}
        </div>

        {selectedRemediation && (
          <div className="p-4 bg-gray-800 rounded-md overflow-y-auto">
            <h3 className="text-xl font-bold mb-3 text-white">Remediation Details: {selectedRemediation.type.replace(/_/g, ' ')}</h3>
            <p className="text-sm text-gray-300 mb-2"><strong>Description:</strong> {selectedRemediation.description}</p>
            <p className="text-sm text-gray-300 mb-2"><strong>Status:</strong> <Tag color={selectedRemediation.status === 'EXECUTED' ? 'bg-green-600' : selectedRemediation.status === 'FAILED' ? 'bg-red-600' : 'bg-yellow-600'}>{selectedRemediation.status}</Tag></p>
            <p className="text-sm text-gray-300 mb-2"><strong>Proposed By:</strong> {selectedRemediation.proposedBy} {selectedRemediation.proposedByAgentId && `(${getAgentName(selectedRemediation.proposedByAgentId)})`}</p>
            {selectedRemediation.agentIdToAffect && <p className="text-sm text-gray-300 mb-2"><strong>Targets Agent:</strong> {getAgentName(selectedRemediation.agentIdToAffect)}</p>}
            {selectedRemediation.actionRequestId && <p className="text-sm text-gray-300 mb-2"><strong>Related Action Request:</strong> {selectedRemediation.actionRequestId}</p>}
            {selectedRemediation.triggeredByPolicyId && <p className="text-sm text-gray-300 mb-2"><strong>Triggered by Policy:</strong> {getPolicyName(selectedRemediation.triggeredByPolicyId)}</p>}
            {selectedRemediation.executionTimestamp && <p className="text-sm text-gray-300 mb-2"><strong>Execution Timestamp:</strong> {new Date(selectedRemediation.executionTimestamp).toLocaleString()}</p>}
            {selectedRemediation.executionDetails && <p className="text-sm text-gray-300 mb-2"><strong>Execution Details:</strong> <pre className="text-xs bg-gray-700 p-2 rounded">{JSON.stringify(selectedRemediation.executionDetails, null, 2)}</pre></p>}
            {selectedRemediation.executionPayload && <p className="text-sm text-gray-300 mb-2"><strong>Execution Payload:</strong> <pre className="text-xs bg-gray-700 p-2 rounded">{JSON.stringify(selectedRemediation.executionPayload, null, 2)}</pre></p>}
            {selectedRemediation.feedback && <p className="text-sm text-gray-300 mb-2"><strong>Feedback:</strong> {selectedRemediation.feedback}</p>}

            {selectedRemediation.status !== 'EXECUTED' && selectedRemediation.status !== 'FAILED' && (
              <Button onClick={() => onExecute(selectedRemediation.id)} variant="success" className="w-full mt-4">
                Execute Remediation
              </Button>
            )}
            <Button onClick={() => setSelectedRemediation(null)} variant="secondary" className="w-full mt-2">
              Close
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Displays a log of all activities performed by autonomous agents within the system.
 * Business impact: Provides granular traceability and auditability of agent behavior,
 * essential for validating autonomous operations, debugging, and ensuring agents
 * adhere to their programmable value rails and governance mandates.
 */
export const AgentActivityLogViewer: React.FC<{ logs: AgentActivityLogEntry[] }> = ({ logs }) => (
  <Card title="Agent Activity Log" className="col-span-3">
    <div className="overflow-auto h-[70vh]">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-800/50 sticky top-0 z-10">
          <tr>
            <th className="p-2 border-b border-gray-600">Timestamp</th>
            <th className="p-2 border-b border-gray-600">Agent Name</th>
            <th className="p-2 border-b border-gray-600">Event Type</th>
            <th className="p-2 border-b border-gray-600">Status</th>
            <th className="p-2 border-b border-gray-600">Target Entity</th>
            <th className="p-2 border-b border-gray-600">Details</th>
            <th className="p-2 border-b border-gray-600">Hash</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} className={`border-b border-gray-700 ${log.status === 'FAILURE' ? 'bg-red-500/10' : ''}`}>
              <td className="p-2 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
              <td className="p-2 text-xs">{log.agentName}</td>
              <td className="p-2 text-xs">{log.eventType}</td>
              <td className="p-2"><Tag color={log.status === 'SUCCESS' ? 'bg-green-600' : log.status === 'FAILURE' ? 'bg-red-600' : 'bg-yellow-600'}>{log.status}</Tag></td>
              <td className="p-2 text-xs text-gray-300">{log.targetEntityType ? `${log.targetEntityType}: ` : ''}{log.targetEntityId || 'N/A'}</td>
              <td className="p-2 text-xs text-gray-400 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">{JSON.stringify(log.details)}</td>
              <td className="p-2 font-mono text-xs text-gray-500 max-w-[80px] overflow-hidden text-ellipsis whitespace-nowrap">{log.immutableHash?.substring(0, 10)}...</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

/**
 * Provides an interface for managing digital identities and role-based access control (RBAC).
 * Business impact: Forms the core of the platform's security and compliance posture,
 * ensuring that all users and agents have appropriate, auditable access levels,
 * crucial for preventing unauthorized actions and maintaining data integrity in financial systems.
 */
export const DigitalIdentityAndRBACManager: React.FC<{ users: UserIdentity[]; onUpdate: (id: string, updates: Partial<UserIdentity>) => void; }> = ({ users, onUpdate }) => {
  const [selectedUser, setSelectedUser] = useState<UserIdentity | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<Partial<UserIdentity>>({});
  const currentAdminId = governanceService._users.get('user-admin-1')?.id || 'admin-mock';

  useEffect(() => {
    if (selectedUser) {
      setFormState(selectedUser);
    } else {
      setFormState({});
    }
  }, [selectedUser]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type, checked } = e.target;
    setFormState(prev => ({ ...prev, [id]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveUser = async () => {
    if (selectedUser && formState.id) {
      await onUpdate(selectedUser.id, formState);
      setSelectedUser(prev => ({ ...prev!, ...formState as UserIdentity }));
      setIsEditing(false);
    }
  };

  const roleOptions = ['ADMIN', 'ETHICS_REVIEWER', 'AI_DEVELOPER', 'COMPLIANCE_OFFICER', 'AUDITOR', 'SYSTEM'].map(r => ({ value: r, label: r }));
  const securityLevelOptions = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(s => ({ value: s, label: s }));

  return (
    <Card title="Digital Identity & RBAC Management" className="col-span-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[70vh] overflow-hidden">
        <div className="md:col-span-1 overflow-y-auto pr-2">
          {users.map(user => (
            <div
              key={user.id}
              className={`p-3 mb-2 rounded-md border cursor-pointer ${selectedUser?.id === user.id ? 'bg-indigo-700/30 border-indigo-600' : 'bg-gray-800 border-gray-700 hover:bg-gray-700/50'}`}
              onClick={() => { setSelectedUser(user); setIsEditing(false); }}
            >
              <h4 className="font-semibold text-white">{user.name}</h4>
              <p className="text-xs text-gray-400 truncate">Role: {user.role}</p>
              <Tag color={user.isActive ? 'bg-green-600' : 'bg-red-600'} className="mt-1">{user.isActive ? 'Active' : 'Inactive'}</Tag>
            </div>
          ))}
        </div>

        {selectedUser && (
          <div className="md:col-span-2 p-4 bg-gray-800 rounded-md overflow-y-auto">
            <h3 className="text-xl font-bold mb-3 text-white">User Details: {selectedUser.name}</h3>
            {(!isEditing) ? (
              <>
                <p className="text-sm text-gray-300 mb-2"><strong>Role:</strong> {selectedUser.role}</p>
                <p className="text-sm text-gray-300 mb-2"><strong>Public Key:</strong> <span className="font-mono text-xs">{selectedUser.publicKey || 'N/A'}</span></p>
                <p className="text-sm text-gray-300 mb-2"><strong>Last Login:</strong> {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'N/A'}</p>
                <p className="text-sm text-gray-300 mb-2"><strong>Status:</strong> <Tag color={selectedUser.isActive ? 'bg-green-600' : 'bg-red-600'}>{selectedUser.isActive ? 'Active' : 'Inactive'}</Tag></p>
                <p className="text-sm text-gray-300 mb-2"><strong>Security Level:</strong> <Tag color={selectedUser.securityLevel === 'CRITICAL' ? 'bg-red-600' : selectedUser.securityLevel === 'HIGH' ? 'bg-orange-600' : 'bg-blue-600'}>{selectedUser.securityLevel}</Tag></p>
                {selectedUser.associatedAgentId && <p className="text-sm text-gray-300 mb-2"><strong>Associated Agent:</strong> {mockAIModels.find(m => m.agentId === selectedUser.associatedAgentId)?.name || selectedUser.associatedAgentId}</p>}
                <Button onClick={() => setIsEditing(true)} variant="primary" className="w-full mt-4">Edit User</Button>
                <Button onClick={() => setSelectedUser(null)} variant="secondary" className="w-full mt-2">Close</Button>
              </>
            ) : (
              <>
                <InputField id="name" label="Name" value={formState.name || ''} onChange={handleFormChange} />
                <SelectField
                  id="role"
                  label="Role"
                  value={formState.role || ''}
                  onChange={handleFormChange}
                  options={roleOptions}
                />
                <InputField id="publicKey" label="Public Key" value={formState.publicKey || ''} onChange={handleFormChange} />
                <SelectField
                  id="securityLevel"
                  label="Security Level"
                  value={formState.securityLevel || ''}
                  onChange={handleFormChange}
                  options={securityLevelOptions}
                />
                <InputField id="associatedAgentId" label="Associated Agent ID (Optional)" value={formState.associatedAgentId || ''} onChange={handleFormChange} />
                <CheckboxField id="isActive" label="Is Active" checked={formState.isActive ?? true} onChange={handleFormChange} />
                <Button onClick={handleSaveUser} variant="success" className="w-full mt-4">Save Changes</Button>
                <Button onClick={() => setIsEditing(false)} variant="secondary" className="w-full mt-2">Cancel</Button>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * The main view component for the Ethical Governor dashboard.
 * Business impact: Provides a single, comprehensive interface for overseeing and managing
 * the ethical, compliant, and secure operation of an advanced financial infrastructure,
 * serving as the central hub for all governance activities and ensuring operational integrity.
 */
const EthicalGovernorView: React.FC = () => {
  const [requests, setRequests] = useState<GovernedActionLogEntry[]>(initialRequests);
  const [ethicalPrinciples, setEthicalPrinciples] = useState<EthicalPrinciple[]>([]);
  const [ethicalPolicies, setEthicalPolicies] = useState<EthicalPolicyRule[]>([]);
  const [aiModels, setAiModels] = useState<AIModelProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [humanReviewTasks, setHumanReviewTasks] = useState<HumanReviewTask[]>([] );
  const [remediationActions, setRemediationActions] = useState<RemediationAction[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [userFeedback, setUserFeedback] = useState<UserFeedback[]>([]);
  const [anomalyAlerts, setAnomalyAlerts] = useState<AnomalyAlert[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [agentActivityLogs, setAgentActivityLogs] = useState<AgentActivityLogEntry[]>([]);
  const [userIdentities, setUserIdentities] = useState<UserIdentity[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'principles' | 'policies' | 'models' | 'review' | 'remediations' | 'audit' | 'agent-activity' | 'identity' | 'reports' | 'feedback' | 'alerts' | 'settings'>('dashboard');
  const [viewingPolicyHistoryFor, setViewingPolicyHistoryFor] = useState<string | null>(null);
  const currentUserId = governanceService._users.get('user-admin-1')?.id || 'admin-mock';

  /**
   * Fetches all necessary data from the mock service to populate the dashboard.
   * Business impact: Ensures the dashboard always reflects the most current state
   * of the governance system, providing up-to-date insights for decision-making.
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setEthicalPrinciples(await governanceService.fetchEthicalPrinciples());
      setEthicalPolicies(await governanceService.fetchEthicalPolicyRules());
      setAiModels(await governanceService.fetchAIModelProfiles());
      setAuditLogs(await governanceService.fetchAuditLogs());
      setHumanReviewTasks(await governanceService.fetchHumanReviewTasks('PENDING'));
      setRemediationActions(await governanceService.fetchRemediationActions());
      setComplianceReports(await governanceService.fetchComplianceReports());
      setUserFeedback(await governanceService.fetchUserFeedback('PENDING'));
      setAnomalyAlerts(await governanceService.fetchAnomalyAlerts('ACTIVE'));
      setSystemStatus(await governanceService.fetchSystemStatus());
      setAgentActivityLogs(await governanceService.fetchAgentActivityLogs());
      setUserIdentities(Array.from(governanceService._users.values()));
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Simulation for continuous AI actions, governor decisions, and agent activity
    const interval = setInterval(async () => {
      try {
        const newRequest: ActionRequest = generateMockActionRequest();
        const currentPolicies = await governanceService.fetchEthicalPolicyRules();
        const response: GovernanceResponse = simulateGovernorDecision(newRequest, currentPolicies);

        const logEntry: GovernedActionLogEntry = {
          ...newRequest,
          response,
          status: response.reviewRequired ? 'HUMAN_REVIEW' : 'GOVERNED'
        };

        governanceService._requests.set(logEntry.id, logEntry);

        governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog(
          'GOVERNANCE_DECISION', logEntry.id, 'ACTION_REQUEST',
          { decision: response.decision, reason: response.reason, violatedPrinciples: response.violatesPrinciple },
          response.decision === 'VETO' || response.decision === 'APPROVE_WITH_WARNING' ? 'WARNING' : 'INFO'
        ));

        if (response.reviewRequired) {
          const reviewTask: HumanReviewTask = {
            id: generateId('hr'),
            actionRequestId: logEntry.id,
            status: 'PENDING',
            priority: response.decision === 'VETO' ? 'CRITICAL' : 'HIGH',
            assignedTo: response.humanReviewerId,
            reviewDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            reviewType: response.decision === 'VETO' ? 'VETO_OVERRIDE' : 'FLAGGED_ACTION',
            contextSummary: `Review AI decision for ${logEntry.sourceAI} action '${logEntry.action}' on subject ${logEntry.subjectId}. Reason: ${response.reason}`,
            decisionOptions: ['Approve AI Decision', 'Override AI Decision', 'Request More Info', 'Propose Remediation'],
          };
          governanceService._humanReviewTasks.set(reviewTask.id, reviewTask);
          governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog(
            'HUMAN_REVIEW_ACTION', reviewTask.id, 'HUMAN_REVIEW', { status: 'CREATED', priority: reviewTask.priority }, 'INFO', reviewTask.assignedTo
          ));
        }

        // Simulate agent activity related to the request
        const model = mockAIModels.find(m => m.name === newRequest.sourceAI);
        if (model?.agentId) {
          const agentLog = await generateMockAgentActivityLog(model.agentId, model.name, logEntry.id, 'ACTION_REQUEST', logEntry.id);
          governanceService.createAgentActivityLog(agentLog); // Use the service method to ensure audit logging
        }

        setRequests(prev => [{ ...logEntry }, ...prev.slice(0, 50)]);
        fetchData(); // Re-fetch other states to keep the UI fresh
      } catch (err) {
        console.error("Error simulating new request or fetching data:", err);
        setError("Error during data simulation.");
      }
    }, 3000);

    // Simulation for anomaly alerts and user feedback
    const anomalyAndFeedbackInterval = setInterval(async () => {
      try {
        if (Math.random() < 0.2) { // 20% chance of a new anomaly alert
          const alert = generateMockAnomalyAlert();
          governanceService._anomalyAlerts.set(alert.id, alert);
          governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog(
            'SYSTEM_ALERT', alert.id, 'GOVERNOR_SYSTEM', { type: alert.type, severity: alert.severity, description: alert.description }, alert.severity === 'CRITICAL' ? 'ERROR' : 'WARNING'
          ));
          setAnomalyAlerts(prev => [alert, ...prev.filter(a => a.status === 'ACTIVE').slice(0, 10)]);
        }
        if (Math.random() < 0.1) { // 10% chance of new user feedback
          const feedback = generateMockUserFeedback(Array.from(governanceService._requests.values()));
          governanceService._userFeedback.set(feedback.id, feedback);
          governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog(
            'SYSTEM_ALERT', feedback.id, 'GOVERNOR_SYSTEM', { action: 'USER_FEEDBACK_SUBMITTED', userId: feedback.userId, type: feedback.feedbackType }, 'INFO'
          ));
          setUserFeedback(prev => [feedback, ...prev.filter(fb => fb.status === 'PENDING').slice(0, 10)]);
        }
        fetchData();
      } catch (err) {
        console.error("Error simulating anomaly or feedback:", err);
        setError("Error during anomaly/feedback simulation.");
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(anomalyAndFeedbackInterval);
    };
  }, [fetchData]);

  /**
   * Handles the creation of a new ethical principle.
   * Business impact: Ensures new principles are correctly integrated and auditable.
   */
  const handleCreatePrinciple = useCallback(async (principle: Omit<EthicalPrinciple, 'id' | 'version' | 'lastUpdated' | 'isActive'>) => {
    const created = await governanceService.createEthicalPrinciple(principle, currentUserId);
    if (created) {
      setEthicalPrinciples(prev => [created, ...prev]);
      fetchData(); // Refresh audit logs
    }
  }, [currentUserId, fetchData]);

  /**
   * Handles the update of an existing ethical principle.
   * Business impact: Ensures changes to ethical principles are correctly applied and auditable.
   */
  const handleUpdatePrinciple = useCallback(async (id: string, updates: Partial<EthicalPrinciple>) => {
    const updated = await governanceService.updateEthicalPrinciple(id, updates, currentUserId);
    if (updated) {
      setEthicalPrinciples(prev => prev.map(p => p.id === id ? updated : p));
      fetchData(); // Refresh audit logs
    }
  }, [currentUserId, fetchData]);

  /**
   * Handles the creation of a new ethical policy rule.
   * Business impact: Enables rapid deployment of new governance rules for AI systems.
   */
  const handleCreatePolicy = useCallback(async (newRule: Omit<EthicalPolicyRule, 'id' | 'version' | 'lastUpdated' | 'creationDate' | 'isActive'>) => {
    const created = await governanceService.createEthicalPolicyRule(newRule, currentUserId);
    if (created) {
      setEthicalPolicies(prev => [created, ...prev]);
      fetchData(); // Refresh audit logs
    }
  }, [currentUserId, fetchData]);

  /**
   * Handles the update of an existing ethical policy rule.
   * Business impact: Allows for agile adaptation of governance policies to evolving requirements.
   */
  const handleUpdatePolicy = useCallback(async (id: string, updates: Partial<EthicalPolicyRule>) => {
    const updated = await governanceService.updateEthicalPolicyRule(id, updates, currentUserId);
    if (updated) {
      setEthicalPolicies(prev => prev.map(p => p.id === id ? updated : p));
      fetchData(); // Refresh audit logs
    }
  }, [currentUserId, fetchData]);

  /**
   * Handles the creation of a new AI model profile.
   * Business impact: Ensures all AI assets are formally registered for governance.
   */
  const handleCreateModel = useCallback(async (newModel: Omit<AIModelProfile, 'id' | 'lastUpdated' | 'registeredDate' | 'governorIntegrationStatus'>) => {
    const created = await governanceService.registerAIModel(newModel, currentUserId);
    if (created) {
      setAiModels(prev => [created, ...prev]);
      fetchData(); // Refresh audit logs
    }
  }, [currentUserId, fetchData]);

  /**
   * Handles the update of an existing AI model profile.
   * Business impact: Maintains accurate risk and governance data for AI models throughout their lifecycle.
   */
  const handleUpdateModel = useCallback(async (id: string, updates: Partial<AIModelProfile>) => {
    const updated = await governanceService.updateAIModelProfile(id, updates, currentUserId);
    if (updated) {
      setAiModels(prev => prev.map(m => m.id === id ? updated : m));
      fetchData(); // Refresh audit logs
    }
  }, [currentUserId, fetchData]);

  /**
   * Handles the update of a human review task.
   * Business impact: Processes human decisions for AI actions, closing the loop on critical governance workflows.
   */
  const handleUpdateHumanReviewTask = useCallback(async (id: string, updates: Partial<HumanReviewTask>) => {
    const updated = await governanceService.updateHumanReviewTask(id, updates, currentUserId);
    if (updated) {
      setHumanReviewTasks(prev => prev.map(task => task.id === id ? updated : task).filter(task => task.status === 'PENDING' || task.status === 'IN_REVIEW'));
      setRequests(prev => prev.map(req => req.id === updated.actionRequestId ? { ...req, status: updated.status === 'COMPLETED' ? 'COMPLETED' : req.status, response: { ...req.response!, reviewOutcome: updated.resolution, reviewNotes: updated.reviewerNotes } } : req));
      fetchData(); // Refresh other data dependent on review outcomes (e.g., audit logs)
    }
  }, [currentUserId, fetchData]);

  /**
   * Handles the creation of a remediation action.
   * Business impact: Provides a structured response mechanism for mitigating AI risks and failures.
   */
  const handleCreateRemediationAction = useCallback(async (action: Omit<RemediationAction, 'id' | 'status'>) => {
    const created = await governanceService.createRemediationAction(action, currentUserId);
    if (created) {
      setRemediationActions(prev => [created, ...prev]);
      fetchData();
    }
    return created;
  }, [currentUserId, fetchData]);

  /**
   * Handles the update of a remediation action.
   * Business impact: Tracks the execution and effectiveness of corrective measures.
   */
  const handleUpdateRemediationAction = useCallback(async (id: string, updates: Partial<RemediationAction>) => {
    const updated = await governanceService.updateRemediationAction(id, updates, currentUserId);
    if (updated) {
      setRemediationActions(prev => prev.map(rem => rem.id === id ? updated : rem));
      fetchData();
    }
  }, [currentUserId, fetchData]);

  /**
   * Handles the execution of a remediation action.
   * Business impact: Simulates the application of corrective measures to address governance issues.
   */
  const handleExecuteRemediationAction = useCallback(async (id: string) => {
    const remediation = remediationActions.find(r => r.id === id);
    if (remediation && remediation.status === 'PENDING') {
      const updated = await governanceService.updateRemediationAction(id, { status: 'EXECUTED', executionDetails: { simulatedExecution: true, initiator: currentUserId } }, currentUserId);
      if (updated) {
        setRemediationActions(prev => prev.map(rem => rem.id === id ? updated : rem));
        fetchData();
      }
    }
  }, [remediationActions, currentUserId, fetchData]);

  /**
   * Handles the generation of a new compliance report.
   * Business impact: Automates and simplifies the creation of essential regulatory reports.
   */
  const handleGenerateComplianceReport = useCallback(async (name: string, startDate: Date, endDate: Date, creator: string) => {
    const report = await governanceService.generateComplianceReport(name, startDate, endDate, creator);
    if (report) {
      setComplianceReports(prev => [report, ...prev]);
      fetchData();
    }
  }, [fetchData]);

  /**
   * Handles the resolution of user feedback.
   * Business impact: Streamlines the process of addressing user concerns, enhancing trust and system quality.
   */
  const handleResolveUserFeedback = useCallback(async (id: string, notes: string) => {
    const updated = await governanceService.updateUserFeedback(id, { status: 'RESOLVED', resolutionNotes: notes, resolvedBy: currentUserId }, currentUserId);
    if (updated) {
      setUserFeedback(prev => prev.map(fb => fb.id === id ? updated : fb).filter(fb => fb.status === 'PENDING'));
      fetchData();
    }
  }, [currentUserId, fetchData]);

  /**
   * Handles the resolution of an anomaly alert.
   * Business impact: Ensures proactive management of system risks and security incidents.
   */
  const handleResolveAnomalyAlert = useCallback(async (id: string) => {
    const updated = await governanceService.updateAnomalyAlert(id, { status: 'RESOLVED', resolutionNotes: 'Manually reviewed and resolved.' }, currentUserId);
    if (updated) {
      setAnomalyAlerts(prev => prev.map(alert => alert.id === id ? updated : alert).filter(alert => alert.status === 'ACTIVE'));
      fetchData();
    }
  }, [currentUserId, fetchData]);

  /**
   * Handles the update of a user identity or RBAC role.
   * Business impact: Manages access control, ensuring appropriate permissions for system users and agents.
   */
  const handleUpdateUserIdentity = useCallback(async (id: string, updates: Partial<UserIdentity>) => {
    const existing = governanceService._users.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    governanceService._users.set(id, updated); // Update the mock service directly
    setUserIdentities(prev => prev.map(user => user.id === id ? updated : user));
    governanceService._auditLogs.set(generateId('audit'), await generateMockAuditLog('IDENTITY_ACCESS_CHANGE', updated.id, 'USER_IDENTITY', { action: 'UPDATED', changes: Object.keys(updates) }, 'INFO', currentUserId));
  }, [currentUserId]);

  const filteredHumanReviewTasks = useMemo(() => humanReviewTasks.filter(task => task.status === 'PENDING' || task.status === 'IN_REVIEW'), [humanReviewTasks]);
  const activeRemediationActions = useMemo(() => remediationActions.filter(rem => rem.status !== 'EXECUTED' && rem.status !== 'FAILED'), [remediationActions]);
  const activeAnomalyAlerts = useMemo(() => anomalyAlerts.filter(alert => alert.status === 'ACTIVE'), [anomalyAlerts]);
  const pendingUserFeedback = useMemo(() => userFeedback.filter(fb => fb.status === 'PENDING'), [userFeedback]);

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center py-10 text-xl text-indigo-400">Loading Ethical Governor Data...</div>;
    }
    if (error) {
      return <div className="text-center py-10 text-xl text-red-500">Error: {error}</div>;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <ActionLogTable requests={requests} />
            <SystemHealthDashboard statusEntries={systemStatus} />
            <AnomalyAlertsViewer alerts={activeAnomalyAlerts} onResolve={handleResolveAnomalyAlert} />
            <HumanReviewDashboard tasks={filteredHumanReviewTasks} onUpdateTask={handleUpdateHumanReviewTask} onCreateRemediation={handleCreateRemediationAction} />
          </div>
        );
      case 'principles':
        return <EthicalPrinciplesManager principles={ethicalPrinciples} onUpdate={handleUpdatePrinciple} onCreate={handleCreatePrinciple} />;
      case 'policies':
        return viewingPolicyHistoryFor ? (
          <PolicyVersionHistoryViewer policyId={viewingPolicyHistoryFor} onClose={() => setViewingPolicyHistoryFor(null)} />
        ) : (
          <PolicyRuleEditor
            policies={ethicalPolicies}
            principles={ethicalPrinciples}
            aiModels={aiModels}
            onUpdate={handleUpdatePolicy}
            onCreate={handleCreatePolicy}
            onViewHistory={setViewingPolicyHistoryFor}
          />
        );
      case 'models':
        return <AIModelProfileManager models={aiModels} onUpdate={handleUpdateModel} onCreate={handleCreateModel} />;
      case 'review':
        return <HumanReviewDashboard tasks={filteredHumanReviewTasks} onUpdateTask={handleUpdateHumanReviewTask} onCreateRemediation={handleCreateRemediationAction} />;
      case 'remediations':
        return <RemediationActionManagement remediations={activeRemediationActions} onUpdate={handleUpdateRemediationAction} onExecute={handleExecuteRemediationAction} />;
      case 'audit':
        return <AuditLogViewer logs={auditLogs} />;
      case 'agent-activity':
        return <AgentActivityLogViewer logs={agentActivityLogs} />;
      case 'identity':
        return <DigitalIdentityAndRBACManager users={userIdentities} onUpdate={handleUpdateUserIdentity} />;
      case 'reports':
        return <ComplianceReportGenerator reports={complianceReports} onGenerate={handleGenerateComplianceReport} />;
      case 'feedback':
        return <UserFeedbackViewer feedback={pendingUserFeedback} onResolve={handleResolveUserFeedback} />;
      case 'alerts':
        return <AnomalyAlertsViewer alerts={activeAnomalyAlerts} onResolve={handleResolveAnomalyAlert} />;
      case 'settings':
        return <Card title="Governor System Settings" className="col-span-3">
          <p className="text-gray-400 mb-4">Centralized configuration and control panel for the Ethical Governor's core parameters, integrations, and operational directives.</p>
          <InputField id="governorVersion" label="Governor Software Version" value="1.0.2-production" onChange={() => {}} disabled />
          <InputField id="lastPolicySync" label="Last Policy Synchronization" value={new Date().toLocaleString()} onChange={() => {}} disabled />
          <div className="mt-4 p-3 bg-gray-800 rounded-md">
            <h4 className="font-semibold text-white mb-2">Operational Context</h4>
            <p className="text-gray-400 text-xs">Current User: {governanceService._users.get(currentUserId)?.name} (Role: {governanceService._users.get(currentUserId)?.role})</p>
            <p className="text-gray-400 text-xs">Security Level: {governanceService._users.get(currentUserId)?.securityLevel}</p>
          </div>
          <div className="mt-4 p-3 bg-gray-800 rounded-md">
            <h4 className="font-semibold text-white mb-2">Integration Adapters</h4>
            <p className="text-gray-400 text-xs">Payment Rail Adapter Status: Operational</p>
            <p className="text-gray-400 text-xs">Digital Identity Provider Status: Operational</p>
            <p className="text-gray-400 text-xs">External Risk Service: Connected</p>
          </div>
          <div className="mt-4 p-3 bg-gray-800 rounded-md">
            <h4 className="font-semibold text-white mb-2">System Integrity Measures</h4>
            <p className="text-gray-400 text-xs">Cryptographic Logging Enabled: Yes</p>
            <p className="text-gray-400 text-xs">Idempotency Checks: Active across all transaction flows</p>
            <p className="text-gray-400 text-xs">Concurrency Controls: Implemented</p>
          </div>
        </Card>;
      default:
        return null;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'principles', label: 'Principles', icon: '⚖️' },
    { id: 'policies', label: 'Policies', icon: '📝' },
    { id: 'models', label: 'AI Models', icon: '🤖' },
    { id: 'review', label: 'Human Review', icon: '🧑‍⚖️', count: filteredHumanReviewTasks.length },
    { id: 'remediations', label: 'Remediations', icon: '🩹', count: activeRemediationActions.length },
    { id: 'audit', label: 'Audit Trail', icon: '📜' },
    { id: 'agent-activity', label: 'Agent Activity', icon: '🧠' },
    { id: 'identity', label: 'Identity & RBAC', icon: '🔑' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'feedback', label: 'User Feedback', icon: '💬', count: pendingUserFeedback.length },
    { id: 'alerts', label: 'Anomaly Alerts', icon: '🚨', count: activeAnomalyAlerts.length },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="w-64 bg-gray-800 p-4 shadow-lg flex flex-col">
        <h1 className="text-3xl font-bold mb-8 text-indigo-400">Ethical Governor</h1>
        <nav className="flex-grow">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (item.id !== 'policies') setViewingPolicyHistoryFor(null);
              }}
              className={`flex items-center w-full px-4 py-2 my-2 rounded-md text-left text-lg font-medium transition-colors duration-200 ${activeTab === item.id ? 'bg-indigo-700 text-white' : 'hover:bg-gray-700 text-gray-300'}`}
            >
              <span className="mr-3 text-xl">{item.icon}</span>
              {item.label}
              {item.count !== undefined && item.count > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{item.count}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-gray-700 text-xs text-gray-500">
          <p>&copy; 2023 Ethical AI Corp.</p>
          <p>Governor Version: 1.0.2</p>
        </div>
      </div>

      <main className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6 capitalize text-white">{activeTab.replace('-', ' ')}</h2>
        {renderContent()}
      </main>
    </div>
  );
};

export default EthicalGovernorView;