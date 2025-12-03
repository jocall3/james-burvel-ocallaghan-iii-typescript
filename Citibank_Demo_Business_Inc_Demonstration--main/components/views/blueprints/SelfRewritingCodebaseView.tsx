/**
 * This module orchestrates a revolutionary self-rewriting codebase view, serving as the control center for a commercial-grade digital financial infrastructure.
 * Business impact: It provides real-time observability, intelligent automation, and programmable control over the entire financial ecosystem,
 * drastically reducing operational costs, accelerating innovation cycles, and ensuring unparalleled security and compliance.
 * How it generates long-term business value: By offering a unified, auditable, and dynamically adaptive platform, it empowers financial institutions
 * to deploy next-generation products, automate complex regulatory workflows, and achieve real-time global settlement, positioning them at the forefront
 * of the digital finance evolution and securing multi-million dollar advantages in market agility and operational efficiency.
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

/**
 * Represents a goal that the self-rewriting codebase aims to achieve.
 * Business impact: Centralizes strategic development initiatives, linking them directly to quantifiable business outcomes and automated delivery.
 * How it generates long-term business value: Ensures alignment of AI development efforts with enterprise objectives, driving efficient resource allocation and measurable progress.
 */
export interface Goal {
  id: string;
  text: string;
  status: 'PENDING' | 'PASSING' | 'FAILING' | 'BLOCKED' | 'IN_PROGRESS' | 'REVIEW_NEEDED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dependencies: string[]; // IDs of goals this goal depends on
  category: 'FEATURE' | 'PERFORMANCE' | 'SECURITY' | 'MAINTENANCE' | 'BUGFIX' | 'GOVERNANCE' | 'COST';
  assignedAgent?: string; // Which AI agent or human is working on it
  progressPercentage?: number;
  lastUpdated?: string;
  eta?: string; // Estimated time of arrival
  relatedTickets?: string[]; // IDs of related external tickets/issues
  metricImpact?: MetricImpact[]; // How this goal affects specific metrics
  policyContext?: string[]; // IDs of policies relevant to this goal
}

/**
 * Represents a specific task derived from a goal, performed by an AI agent.
 * Business impact: Provides granular visibility into AI agent activities, ensuring accountability and traceability of autonomous operations.
 * How it generates long-term business value: Facilitates auditing, performance optimization, and continuous improvement of the AI-driven development pipeline.
 */
export interface AIProcessTask {
  id: string;
  goalId: string;
  description: string;
  type: 'CODE_GEN' | 'CODE_REF_FACTOR' | 'TEST_GEN' | 'TEST_EXEC' | 'DEPLOY' | 'MONITOR' | 'SECURITY_SCAN' | 'COST_OPT' | 'DOCUMENTATION' | 'AGENT_COMM' | 'SETTLEMENT' | 'IDENTITY_MGMT' | 'POLICY_ENFORCE';
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED';
  startedAt?: string;
  completedAt?: string;
  logs: LogEntry[];
  estimatedDurationMs: number;
  actualDurationMs?: number;
  output?: string;
  artifacts?: { type: 'FILE_CHANGE' | 'REPORT' | 'METRIC_UPDATE' | 'TOKEN_TXN', content: any }[];
  agentId?: string; // The ID of the agent performing this task
}

/**
 * Represents a file within the simulated codebase.
 * Business impact: Offers a comprehensive, version-controlled view of the digital asset base, critical for change management and integrity.
 * How it generates long-term business value: Enables rapid iteration and secure evolution of the financial platform's software components.
 */
export interface CodeFile {
  id: string;
  path: string;
  name: string;
  content: string;
  language: 'typescript' | 'javascript' | 'python' | 'java' | 'go' | 'rust' | 'shell' | 'yaml' | 'json' | 'markdown' | 'solidity' | 'golang' | 'kotlin';
  lastModified: string;
  version: number;
  linesOfCode: number;
  module?: string; // e.g., 'components/views/blueprints'
  isNew?: boolean;
  isDeleted?: boolean;
  hash: string; // Cryptographic hash of content for integrity
}

/**
 * Represents a change made by the AI to a code file.
 * Business impact: Formalizes the code modification process, integrating human oversight into autonomous development.
 * How it generates long-term business value: Mitigates risks associated with AI-generated code by enforcing review, ensuring quality and compliance.
 */
export interface CodeChange {
  id: string;
  taskId: string; // The AI task that produced this change
  fileId: string; // The file being changed
  filePath: string;
  oldContent: string;
  newContent: string;
  diff: string; // Unified diff format
  timestamp: string;
  approved: boolean;
  reviewer?: string; // Human or another AI agent
  reviewComments?: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'APPLIED';
  integrityHash: string; // Hash of the new content + metadata for tamper evidence
}

/**
 * Represents a commit in the simulated VCS.
 * Business impact: Provides an immutable, auditable history of all code changes, crucial for regulatory compliance and incident forensics.
 * How it generates long-term business value: Guarantees transparency and accountability throughout the software development lifecycle.
 */
export interface CodeCommit {
  id: string;
  message: string;
  author: 'AI_AGENT' | 'HUMAN';
  timestamp: string;
  changes: CodeChange[]; // IDs of CodeChange objects
  parentCommitId?: string;
  branch: string;
  signature: string; // Cryptographic signature of the commit contents
}

/**
 * Represents a test result.
 * Business impact: Automates quality assurance, providing immediate feedback on code correctness and performance.
 * How it generates long-term business value: Accelerates deployment cycles by ensuring reliability and reducing manual testing overhead.
 */
export interface TestResult {
  id: string;
  name: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  durationMs: number;
  suite: string;
  errorMessage?: string;
  stackTrace?: string;
  timestamp: string;
  relatedFileId?: string; // ID of the file the test covers
  integrityHash: string; // Hash of test results for non-repudiation
}

/**
 * Represents a metric value over time.
 * Business impact: Provides critical insights into system performance, security posture, and resource utilization for proactive management.
 * How it generates long-term business value: Enables data-driven optimization, predictive anomaly detection, and ensures SLA adherence, directly impacting uptime and user experience.
 */
export interface Metric {
  id: string;
  name: string;
  category: 'PERFORMANCE' | 'RESOURCE_UTILIZATION' | 'AVAILABILITY' | 'SECURITY' | 'COST' | 'COMPLIANCE' | 'TRANSACTION_VOLUME';
  unit: string; // e.g., 'ms', '%', '$', 'count'
  value: number;
  timestamp: string;
  threshold?: number; // Optional threshold for alerting
  isAlert?: boolean;
  alertDetails?: string;
}

/**
 * Describes how a goal is expected to impact a specific metric.
 * Business impact: Quantifies the expected return on investment for development goals, aligning technical work with business KPIs.
 * How it generates long-term business value: Facilitates strategic planning and ensures that AI-driven development directly contributes to improving key operational and financial indicators.
 */
export interface MetricImpact {
  metricId: string; // Which metric is affected
  expectedChange: 'INCREASE' | 'DECREASE' | 'STABLE';
  targetValue?: number; // What is the target value for this metric
  actualValue?: number; // What is the actual value after the goal is achieved
}

/**
 * Represents a log entry from an AI agent or system.
 * Business impact: Provides an auditable trail of all system activities, essential for debugging, compliance, and post-incident analysis.
 * How it generates long-term business value: Ensures operational transparency and strengthens the reliability of the autonomous infrastructure.
 */
export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'AUDIT';
  message: string;
  source: string; // e.g., 'AI_AGENT_CODE_GEN', 'TEST_RUNNER', 'DEPLOYMENT_SERVICE'
  context?: Record<string, any>;
  signature?: string; // Cryptographic signature of the log entry
}

/**
 * Configuration for an AI agent, defining its operational parameters and behavioral heuristics.
 * Business impact: Allows granular control over autonomous agent behavior, adapting to evolving business priorities and regulatory landscapes.
 * How it generates long-term business value: Optimizes AI performance for specific tasks, balancing innovation, risk, and cost-efficiency.
 */
export interface AIAgentConfig {
  agentId: string;
  name: string;
  model: string; // e.g., 'GPT-4o', 'Claude 3.5 Sonnet'
  creativity: number; // 0-10, how adventurous the code generation is
  refactoringStrategy: 'OPTIMIZE_PERFORMANCE' | 'IMPROVE_READABILITY' | 'REDUCE_COMPLEXITY' | 'SECURITY_HARDENING';
  testCoverageTarget: number; // 0-100%
  costOptimizationBudget: number; // Max daily spend for cloud resources
  securityVulnerabilityThreshold: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  deploymentStrategy: 'AUTOMATIC' | 'MANUAL_APPROVAL' | 'GOVERNED_ROLLOUT';
  enabledFeatures: string[];
  maxParallelTasks: number;
  remediationStrategy: 'AUTOMATIC_RETRY' | 'ESCALATE_TO_ORCHESTRATOR' | 'HUMAN_INTERVENTION';
  governanceComplianceLevel: 'MINIMAL' | 'STANDARD' | 'STRICT';
}

/**
 * User feedback on AI-generated code or behavior.
 * Business impact: Closes the feedback loop between human operators and autonomous systems, enabling continuous learning and refinement.
 * How it generates long-term business value: Improves the accuracy and relevance of AI output, leading to higher quality software and greater user satisfaction.
 */
export interface UserFeedback {
  id: string;
  goalId?: string;
  changeId?: string;
  comment: string;
  rating: 1 | 2 | 3 | 4 | 5; // 1-5 stars
  timestamp: string;
  type: 'CODE_REVIEW' | 'PERFORMANCE_FEEDBACK' | 'BUG_REPORT' | 'GENERAL' | 'SECURITY_OBSERVATION';
  userId?: string; // Digital Identity ID of the user providing feedback
}

/**
 * Deployment status, tracking the lifecycle of code releases across environments.
 * Business impact: Provides real-time visibility into the deployment pipeline, ensuring controlled and efficient software delivery.
 * How it generates long-term business value: Minimizes downtime and deployment risks, contributing to system availability and reliability.
 */
export interface DeploymentStatus {
  id: string;
  environment: 'DEV' | 'STAGING' | 'PRODUCTION';
  status: 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED' | 'ROLLBACK' | 'CANCELED';
  version: string; // Version identifier, e.g., commit hash
  startedAt: string;
  completedAt?: string;
  logs: LogEntry[];
  deployedServices: string[];
  durationMs?: number;
  triggeredByAgent?: string;
  integrityCheckPassed: boolean; // Confirms artifacts integrity before/after deployment
}

/**
 * Security scan finding, identifying potential vulnerabilities.
 * Business impact: Proactively detects and mitigates security risks, protecting sensitive financial data and operations.
 * How it generates long-term business value: Reduces the attack surface, prevents costly breaches, and maintains trust in the financial platform.
 */
export interface SecurityFinding {
  id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: string; // e.g., 'XSS', 'SQL_INJECTION', 'HARDCODED_CREDENTIALS', 'CRYPTOGRAPHIC_WEAKNESS'
  filePath: string;
  lineNumber: number;
  description: string;
  recommendation: string;
  status: 'OPEN' | 'FIXED' | 'FALSE_POSITIVE' | 'MITIGATED' | 'ACCEPTED_RISK';
  discoveredByTask?: string; // ID of the AI task that found it
  fixedByTask?: string; // ID of the AI task that fixed it
  timestamp: string;
  cveId?: string; // Common Vulnerabilities and Exposures ID
  policyViolation?: string; // ID of policy violated
}

/**
 * Cost analysis report, detailing infrastructure spend and optimization opportunities.
 * Business impact: Provides transparent financial oversight of cloud resources, identifying areas for significant cost reduction.
 * How it generates long-term business value: Maximizes profitability by optimizing operational expenditures and improving resource efficiency.
 */
export interface CostReport {
  id: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  timestamp: string;
  totalCost: number;
  estimatedSavings: number;
  breakdown: {
    service: string;
    cost: number;
    optimizationOpportunity: number;
    relatedMetricId?: string; // e.g., CPU Utilization
  }[];
  recommendations: string[];
  relatedTasks?: string[]; // Tasks that address these costs
  budgetExceeded: boolean;
}

/**
 * Knowledge Graph Node, representing an entity in the codebase or system.
 * Business impact: Creates an intelligent, navigable map of the entire financial infrastructure, enhancing understanding and decision-making.
 * How it generates long-term business value: Accelerates development, simplifies onboarding, and supports complex system analysis by providing context-rich relationships.
 */
export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'FILE' | 'FUNCTION' | 'CLASS' | 'VARIABLE' | 'CONCEPT' | 'REQUIREMENT' | 'GOAL' | 'AGENT' | 'TOKEN_ASSET' | 'ACCOUNT' | 'IDENTITY' | 'POLICY' | 'TRANSACTION' | 'RAIL';
  data?: any; // Reference to CodeFile, Goal, etc.
  properties?: Record<string, any>;
}

/**
 * Knowledge Graph Edge, representing a relationship between entities.
 * Business impact: Connects disparate components and concepts within the financial platform, revealing dependencies and causal links.
 * How it generates long-term business value: Facilitates impact analysis, risk assessment, and system-wide optimization by visualizing complex interconnections.
 */
export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  type: 'CALLS' | 'USES' | 'DEPENDS_ON' | 'IMPLEMENTS' | 'DEFINES' | 'RELATED_TO' | 'OWNS' | 'ISSUES' | 'SETTLES_VIA' | 'AUTHENTICATES' | 'AUTHORIZES' | 'ENFORCES';
  properties?: Record<string, any>;
}

/**
 * Represents an autonomous agent within the financial infrastructure.
 * Business impact: Enables intelligent automation of complex financial processes, from code generation to real-time settlement monitoring.
 * How it generates long-term business value: Drives operational efficiency, reduces human error, and creates scalable, adaptive financial services.
 */
export interface Agent {
  id: string;
  name: string;
  status: 'ACTIVE' | 'IDLE' | 'SUSPENDED' | 'ERROR';
  skills: AgentSkill[];
  currentTask?: AIProcessTask['id'];
  lastActive: string;
  identityId: string; // Digital Identity ID
  role: 'DEVELOPER' | 'QA' | 'SECURITY' | 'OPS' | 'FINANCIAL_ENGINE' | 'COMPLIANCE';
  healthScore: number; // 0-100
  configuration: AIAgentConfig; // Reference to its configuration
}

/**
 * Represents a specific capability or skill possessed by an autonomous agent.
 * Business impact: Defines the operational scope and intelligence of individual agents, allowing for specialized roles in the financial ecosystem.
 * How it generates long-term business value: Ensures agents can perform specific, high-value tasks such as anomaly detection, code remediation, or policy enforcement with precision.
 */
export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  type: 'MONITORING' | 'REMEDIATION' | 'GOVERNANCE' | 'CODE_GENERATION' | 'TESTING' | 'DEPLOYMENT' | 'SETTLEMENT' | 'IDENTITY_MANAGEMENT' | 'RISK_ASSESSMENT';
  level: number; // 1-5, mastery level
  isActive: boolean;
}

/**
 * Represents a message exchanged between autonomous agents.
 * Business impact: Facilitates secure, auditable, and reliable communication between intelligent agents, coordinating complex workflows.
 * How it generates long-term business value: Enables decentralized intelligence, allowing agents to collaborate autonomously and achieve system-wide objectives efficiently.
 */
export interface AgentMessage {
  id: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
  type: 'TASK_ASSIGNMENT' | 'STATUS_UPDATE' | 'ALERT' | 'REQUEST_FOR_INFO' | 'ACTION_COMMAND' | 'POLICY_VIOLATION_REPORT';
  content: Record<string, any>;
  signature: string; // Cryptographic signature for authenticity
  nonce: string; // For replay protection
  sequenceNum: number; // For message ordering
}

/**
 * Represents an entry in the agent orchestration log.
 * Business impact: Provides a tamper-evident record of all agent interactions and decisions, crucial for compliance and post-mortem analysis.
 * How it generates long-term business value: Enhances accountability and transparency of autonomous operations, building trust in AI-driven financial processes.
 */
export interface AgentOrchestrationLog {
  id: string;
  timestamp: string;
  agentId: string;
  action: string;
  context: Record<string, any>;
  eventId: string; // Correlates to a specific event or message
  integrityHash: string; // Hash of previous log + current entry
}

/**
 * Represents a fungible digital asset or token on the programmable value rails.
 * Business impact: Defines the core units of value transacted on the platform, enabling flexible and secure digital asset management.
 * How it generates long-term business value: Facilitates the creation of new financial products, simplifies cross-border payments, and enhances liquidity.
 */
export interface TokenAsset {
  id: string;
  symbol: string; // e.g., 'USD_C', 'GOLD_T'
  name: string;
  totalSupply: number;
  decimals: number;
  issuerId: string; // Digital Identity ID of the issuer
  mintable: boolean;
  burnable: boolean;
  metadata: Record<string, any>; // e.g., 'collateralType', 'complianceJurisdiction'
  creationTimestamp: string;
  integrityHash: string; // Hash of token definition
}

/**
 * Represents an account holding token assets.
 * Business impact: Provides a secure and auditable ledger for digital asset ownership and balances.
 * How it generates long-term business value: Forms the foundation for all financial transactions, ensuring accurate and tamper-evident record-keeping.
 */
export interface TokenAccount {
  id: string;
  ownerId: string; // Digital Identity ID
  assetId: string; // TokenAsset ID
  balance: number;
  reservedBalance: number; // For pending transactions
  status: 'ACTIVE' | 'FROZEN' | 'BLOCKED';
  creationTimestamp: string;
  lastUpdateTimestamp: string;
  publicKey: string; // Public key associated with this account for verification
}

/**
 * Represents a transaction involving token movement or state change.
 * Business impact: Captures all value transfers and ledger updates, providing an immutable record of financial activity.
 * How it generates long-term business value: Ensures transactional integrity, enables real-time settlement, and supports comprehensive auditing.
 */
export interface TokenTransaction {
  id: string;
  type: 'MINT' | 'BURN' | 'TRANSFER' | 'SETTLEMENT';
  senderAccountId?: string;
  receiverAccountId?: string;
  assetId: string;
  amount: number;
  timestamp: string;
  status: 'PENDING' | 'COMMITTED' | 'FAILED' | 'REVERTED';
  signature: string; // Signature from sender or authorized entity
  nonce: string; // To prevent replay attacks
  parentTxnId?: string; // For chained transactions
  settlementRailId?: string; // Which rail was used for settlement
  integrityHash: string; // Hash of transaction data for integrity
  meta?: Record<string, any>; // Additional transaction context, e.g., payment reference
}

/**
 * Represents a settlement rail, specifying its capabilities and metrics.
 * Business impact: Defines the available pathways for value transfer, allowing for optimized routing based on business needs.
 * How it generates long-term business value: Provides flexibility in choosing cost-effective, high-speed, or secure settlement channels, enhancing operational agility.
 */
export interface SettlementRail {
  id: string;
  name: string;
  type: 'FAST' | 'SECURE' | 'LOW_COST' | 'CROSS_BORDER';
  latencyMs: number; // Average latency
  costPerTxn: number;
  securityRating: number; // 0-100
  capacityPerSecond: number;
  isActive: boolean;
  supportedAssets: string[]; // TokenAsset IDs
}

/**
 * Defines a policy for routing token transactions across different settlement rails.
 * Business impact: Automates decision-making for optimal transaction routing, minimizing costs and maximizing efficiency.
 * How it generates long-term business value: Ensures best-in-class performance for settlement operations by adaptively choosing the most suitable rail.
 */
export interface RoutingPolicy {
  id: string;
  name: string;
  criteria: string; // e.g., "amount > 10000 && latency < 200ms"
  preferredRailIds: string[]; // Ordered list of preferred rail IDs
  fallbackRailId: string;
  isActive: boolean;
  priority: number; // Higher value means higher priority for this policy
  lastUpdated: string;
}

/**
 * Represents a digital identity for users, services, or agents.
 * Business impact: Establishes a foundational trust layer across the entire financial infrastructure, enabling secure and compliant interactions.
 * How it generates long-term business value: Simplifies authentication, streamlines authorization, and ensures non-repudiation for all digital entities, reducing fraud and regulatory burden.
 */
export interface DigitalIdentity {
  id: string;
  entityType: 'PERSON' | 'ORGANIZATION' | 'SERVICE' | 'AI_AGENT';
  name: string;
  publicKey: string; // Primary cryptographic public key
  status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  verificationLevel: 'L1' | 'L2' | 'L3'; // L1: Basic, L2: KYC, L3: AML+Biometric
  associatedAccounts: string[]; // TokenAccount IDs, etc.
  creationDate: string;
  lastUpdated: string;
  integrityHash: string; // Hash of identity details
}

/**
 * Represents a cryptographic key pair managed by the digital identity system.
 * Business impact: Underpins all secure communications and transaction signing, guaranteeing data confidentiality and integrity.
 * How it generates long-term business value: Provides the cryptographic primitives necessary for strong authentication and tamper-evident operations, critical for financial security.
 */
export interface CryptographicKey {
  id: string;
  identityId: string;
  publicKey: string;
  privateKeyReference: string; // Reference to securely stored private key (never exposed directly)
  keyType: 'SIGNING' | 'ENCRYPTION';
  algorithm: 'RSA' | 'ECC';
  createdAt: string;
  expiresAt?: string;
  isPrimary: boolean;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

/**
 * Defines a policy for authorizing actions based on identity, role, and context.
 * Business impact: Enforces granular access control across all system functions and data, ensuring compliance and preventing unauthorized operations.
 * How it generates long-term business value: Protects sensitive financial data and operational integrity by strictly controlling who can do what, under which conditions.
 */
export interface AuthorizationPolicy {
  id: string;
  name: string;
  description: string;
  targetResource: string; // e.g., 'TokenAccount:transfer', 'Agent:configure'
  allowRoles: string[]; // Roles that are allowed
  denyRoles?: string[]; // Roles that are explicitly denied
  conditions?: string; // e.g., "time_of_day < 22:00 && IP_range == 'internal'"
  isActive: boolean;
  version: number;
  lastUpdated: string;
}

/**
 * Represents an immutable log entry for every access and authorization event.
 * Business impact: Creates a tamper-evident audit trail of all security-critical actions, vital for regulatory reporting and forensic investigations.
 * How it generates long-term business value: Provides irrefutable proof of access and authorization, fulfilling stringent compliance requirements and enhancing operational transparency.
 */
export interface AccessLogEntry {
  id: string;
  timestamp: string;
  identityId: string;
  action: string; // e.g., 'login', 'token_transfer', 'agent_config_update'
  resourceId: string; // ID of the resource accessed
  status: 'SUCCESS' | 'FAILURE' | 'DENIED';
  policyId?: string; // ID of the policy that governed the access
  ipAddress?: string;
  integrityHash: string; // Hash of previous log + current entry
  signature: string; // Signature of the log entry by the system
}

/**
 * Represents a request to process a payment.
 * Business impact: Initiates the value transfer process, providing a structured input for the real-time settlement engine.
 * How it generates long-term business value: Streamlines payment initiation, enabling efficient and error-free transaction processing.
 */
export interface PaymentRequest {
  id: string;
  payerIdentityId: string;
  payeeIdentityId: string;
  assetId: string;
  amount: number;
  timestamp: string;
  status: 'INITIATED' | 'PENDING_VALIDATION' | 'APPROVED' | 'REJECTED' | 'SETTLED';
  referenceId: string;
  requestedRailType?: SettlementRail['type']; // Preferred rail type
  signature: string; // Signed by payer's identity
  nonce: string; // For replay protection
}

/**
 * Represents the confirmation of a successful settlement transaction.
 * Business impact: Provides definitive proof of value transfer, ensuring finality and reducing reconciliation efforts.
 * How it generates long-term business value: Accelerates liquidity, reduces counterparty risk, and provides immediate transactional certainty.
 */
export interface SettlementConfirmation {
  id: string;
  paymentRequestId: string;
  tokenTransactionId: string; // Reference to the actual token transaction
  settlementRailId: string; // Which rail was used
  settlementTimestamp: string;
  status: 'COMPLETED' | 'FAILED' | 'REVERTED';
  amountSettled: number;
  feesCharged: number;
  integrityHash: string; // Hash of confirmation data
  signature: string; // Signed by settlement engine
}

/**
 * Represents a real-time risk assessment for a payment or transaction.
 * Business impact: Proactively identifies and flags high-risk transactions, preventing fraud and financial crime.
 * How it generates long-term business value: Protects the platform and its users from illicit activities, enhancing security and maintaining regulatory compliance.
 */
export interface RiskAssessment {
  id: string;
  targetId: string; // e.g., PaymentRequest ID
  targetType: 'PAYMENT_REQUEST' | 'TOKEN_TRANSFER' | 'IDENTITY_ACTIVITY';
  score: number; // 0-100, higher is riskier
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  findings: string[]; // e.g., 'Unusual sender location', 'Large amount for new account'
  recommendation: 'ALLOW' | 'FLAG_FOR_REVIEW' | 'BLOCK';
  timestamp: string;
  decisionByAgentId?: string;
  policyId?: string; // Policy that triggered the assessment
  integrityHash: string;
}

/**
 * Represents a governance policy that defines rules and expected behaviors for the system.
 * Business impact: Codifies regulatory requirements and business rules, automating compliance and operational integrity.
 * How it generates long-term business value: Ensures the financial platform operates within legal and ethical boundaries, minimizing regulatory fines and reputational damage.
 */
export interface Policy {
  id: string;
  name: string;
  description: string;
  category: 'COMPLIANCE' | 'SECURITY' | 'OPERATIONAL' | 'FINANCIAL';
  ruleSet: string[]; // e.g., ["Transaction amount > $10k requires L3 identity", "No code deployments on weekends"]
  enforcementAction: 'ALERT' | 'BLOCK' | 'REQUIRE_APPROVAL' | 'AUTO_REMEDIATE';
  isActive: boolean;
  version: number;
  lastUpdated: string;
  auditedByAgentId?: string;
}

/**
 * Represents an immutable audit log entry for system-level events and policy enforcement.
 * Business impact: Creates a cryptographically secured, tamper-evident record of all critical system activities and compliance events.
 * How it generates long-term business value: Provides undeniable proof of operations, satisfies stringent regulatory audit requirements, and enhances forensic capabilities.
 */
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: 'TRANSACTION' | 'CONFIGURATION_CHANGE' | 'POLICY_VIOLATION' | 'AGENT_DECISION' | 'IDENTITY_EVENT' | 'DEPLOYMENT';
  entityId: string; // ID of the entity involved (e.g., TokenTxn ID, Goal ID)
  details: Record<string, any>;
  originatorId?: string; // Digital Identity ID or Agent ID
  integrityChainHash: string; // Hash of the previous log entry + current content
  signature: string; // Signature of this log entry by the system
}

/**
 * Defines an access control rule for a specific role and resource.
 * Business impact: Enforces precise permissions, ensuring that only authorized roles can perform specific actions on critical resources.
 * How it generates long-term business value: Safeguards sensitive system components and data, preventing unauthorized modifications and access, which is paramount for financial infrastructure.
 */
export interface RoleBasedAccessControl {
  id: string;
  role: string; // e.g., 'Admin', 'Financial Analyst', 'Agent_Developer'
  resource: string; // e.g., 'AgentConfig', 'TokenAccount', 'Policy'
  action: 'READ' | 'WRITE' | 'EXECUTE' | 'APPROVE' | 'ALL';
  isAllowed: boolean;
  lastUpdated: string;
  policyId?: string; // Reference to a related AuthorizationPolicy
}

/**
 * Represents a stored secret, always encrypted at rest.
 * Business impact: Protects sensitive credentials and API keys, crucial for maintaining security boundaries and operational integrity.
 * How it generates long-term business value: Prevents unauthorized access to external systems and internal privileged operations, safeguarding the entire platform.
 */
export interface EncryptedSecret {
  id: string;
  name: string;
  encryptedValue: string; // The encrypted representation
  keyId: string; // Reference to the encryption key used
  lastRotation: string;
  accessedBy: string[]; // Digital Identity IDs or Agent IDs that accessed it
}

/**
 * Represents a cryptographic nonce for preventing replay attacks.
 * Business impact: Ensures that each transaction or message is unique and processed only once, fundamental for financial security.
 * How it generates long-term business value: Prevents double-spending and unauthorized re-execution of instructions, maintaining the integrity of all value transfers.
 */
export interface Nonce {
  value: string;
  usedAt: string;
  validUntil: string;
  originatorId: string; // Identity or agent that generated/used it
}

/**
 * Represents the state and actions of an AI Agent.
 * Business impact: Provides a centralized entity for managing an agent's operational parameters, skills, and current activities, crucial for intelligent automation.
 * How it generates long-term business value: Enables dynamic adaptation of agent behavior, ensuring high performance, security, and compliance across diverse tasks.
 */
export interface AgentEntity {
  id: string;
  name: string;
  status: 'IDLE' | 'ACTIVE' | 'ERROR' | 'SUSPENDED';
  role: 'DEVELOPER' | 'QA' | 'SECURITY' | 'OPS' | 'FINANCIAL_ENGINE' | 'COMPLIANCE' | 'ORCHESTRATOR';
  currentGoalId?: string;
  currentTaskId?: string;
  skills: AgentSkill[];
  healthScore: number;
  lastHeartbeat: string;
  identityId: string;
}

/**
 * Defines a skill an agent possesses, detailing its type and proficiency.
 * Business impact: Granularly defines the capabilities of each autonomous agent, enabling highly specialized and efficient task execution.
 * How it generates long-term business value: Optimizes agent performance by matching skills to tasks, reducing errors and increasing throughput for complex financial operations.
 */
export interface AgentSkill {
  name: string;
  type: 'MONITORING' | 'REMEDIATION' | 'GOVERNANCE' | 'CODE_GENERATION' | 'TESTING' | 'DEPLOYMENT' | 'SETTLEMENT_ROUTING' | 'RISK_ASSESSMENT' | 'IDENTITY_MANAGEMENT';
  proficiency: number; // 0-100
  isActive: boolean;
}

/**
 * Interface representing the state of the internal agent messaging system.
 * Business impact: Facilitates secure, reliable, and auditable communication between autonomous agents, enabling collaborative intelligence.
 * How it generates long-term business value: Ensures efficient coordination of complex, multi-agent workflows, critical for real-time financial operations.
 */
export interface InternalMessagingSystem {
  queue: AgentMessage[];
  processedMessages: AgentMessage[];
  messageCount: number;
  lastSequenceNumber: number;
  status: 'OPERATIONAL' | 'DEGRADED';
}

/**
 * Represents a transaction processed by the Real-Time Settlement Engine.
 * Business impact: Encapsulates the entire lifecycle of a financial transaction, from request to final confirmation, ensuring atomic and idempotent processing.
 * How it generates long-term business value: Guarantees transactional integrity, provides immediate settlement certainty, and supports comprehensive audit trails for regulatory compliance.
 */
export interface SettlementTransaction {
  id: string;
  paymentRequestId: string;
  status: 'PENDING_VALIDATION' | 'VALIDATED' | 'ROUTING' | 'SETTLING' | 'COMPLETED' | 'FAILED' | 'REVERTED';
  payerId: string;
  payeeId: string;
  assetId: string;
  amount: number;
  timestamp: string;
  settlementRailUsed?: string;
  riskScore?: number;
  auditTrail: AuditLogEntry[];
  nonce: string;
  signature: string;
  routingDecisionLogic: string; // The policy/logic used for routing
  reconciliationStatus: 'PENDING' | 'COMPLETED';
}

// --- Utility Functions (Simulations and Data Generation) ---
/**
 * Generates a unique identifier string.
 * Business impact: Ensures referential integrity across all system components, vital for data management and auditing.
 * How it generates long-term business value: Supports scalability by providing unique keys for distributed systems and preventing ID collisions.
 */
export const generateUniqueId = (): string => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

/**
 * Formats a Date object into an ISO string.
 * Business impact: Standardizes timestamp formats across the entire financial infrastructure, crucial for accurate logging and compliance.
 * How it generates long-term business value: Facilitates time-series analysis, cross-system auditing, and ensures chronological integrity of events.
 */
export const formatTimestamp = (date: Date): string => date.toISOString();

/**
 * Selects a random element from an array.
 * Business impact: Introduces controlled variability into simulations, allowing for robust testing of system responses under diverse conditions.
 * How it generates long-term business value: Enhances the realism and comprehensiveness of testing, leading to more resilient production systems.
 */
export const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Generates a random string of a specified length.
 * Business impact: Creates diverse mock data for testing and simulation, ensuring flexibility in data representation.
 * How it generates long-term business value: Supports the generation of synthetic data for privacy-preserving development and testing scenarios.
 */
export const generateRandomString = (length: number): string => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

/**
 * Generates a cryptographic hash for given content. (Simplified for simulation).
 * Business impact: Ensures data integrity and tamper-evidence for critical financial records and code artifacts.
 * How it generates long-term business value: Provides a foundational security primitive for non-repudiation and trust in the system's data.
 */
export const generateMockHash = (content: string): string => {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `h_${Math.abs(hash).toString(16)}`;
};

/**
 * Generates a cryptographic signature (mock implementation).
 * Business impact: Authenticates the origin and integrity of messages and transactions, preventing unauthorized modifications.
 * How it generates long-term business value: Establishes a chain of trust for all system interactions, crucial for security and regulatory compliance.
 */
export const generateMockSignature = (data: string, signerId: string): string => {
  return `sig_${generateMockHash(`${data}-${signerId}-${Date.now()}`)}`;
};

/**
 * Generates a nonce for replay protection (mock implementation).
 * Business impact: Ensures that each transaction or instruction is processed only once, fundamental for financial security.
 * How it generates long-term business value: Prevents duplicate execution of critical operations, enhancing the reliability and security of the financial platform.
 */
export const generateMockNonce = (): string => generateUniqueId();

/**
 * Generates a mock log entry.
 * Business impact: Provides simulated operational telemetry, critical for monitoring autonomous agent behavior and system health.
 * How it generates long-term business value: Supports rapid iteration on monitoring and alerting strategies, ensuring robust observability of the financial infrastructure.
 */
export const generateMockLogEntry = (source: string, level?: LogEntry['level'], message?: string): LogEntry => {
  const msg = message || `[${source}] ${generateRandomString(50)}`;
  return {
    id: generateUniqueId(),
    timestamp: formatTimestamp(new Date()),
    level: level || pickRandom(['INFO', 'WARN', 'ERROR', 'DEBUG', 'AUDIT']),
    message: msg,
    source,
    context: {
      requestId: generateUniqueId(),
      operation: pickRandom(['read', 'write', 'delete', 'update', 'settle', 'authenticate']),
    },
    signature: generateMockSignature(msg, source),
  };
};

/**
 * Generates a mock code file.
 * Business impact: Creates synthetic code assets for simulating development activities and codebase evolution.
 * How it generates long-term business value: Facilitates stress testing of the AI's code generation and refactoring capabilities, ensuring robustness.
 */
export const generateMockCodeFile = (path: string, content: string = generateRandomString(500)): CodeFile => ({
  id: generateUniqueId(),
  path,
  name: path.split('/').pop() || '',
  content,
  language: pickRandom(['typescript', 'javascript', 'python', 'java', 'go', 'rust', 'shell', 'yaml', 'json', 'markdown', 'solidity']),
  lastModified: formatTimestamp(new Date()),
  version: 1,
  linesOfCode: content.split('\n').length,
  hash: generateMockHash(content),
});

/**
 * Generates a mock code change.
 * Business impact: Simulates code modifications for review and approval workflows, essential for controlled software evolution.
 * How it generates long-term business value: Enables the testing of human-AI collaboration in the development process, ensuring quality and compliance of AI-generated code.
 */
export const generateMockCodeChange = (taskId: string, file: CodeFile): CodeChange => {
  const oldContent = file.content;
  const newContent = `${oldContent}\n// Added by AI: ${generateRandomString(30)} - ${generateUniqueId()}`;
  const diff = `--- a/${file.path}\n+++ b/${file.path}\n@@ -1,3 +1,4 @@\n ${oldContent.split('\n').slice(0, 2).join('\n')}\n+${newContent.split('\n').pop()}\n`;
  return {
    id: generateUniqueId(),
    taskId,
    fileId: file.id,
    filePath: file.path,
    oldContent,
    newContent,
    diff,
    timestamp: formatTimestamp(new Date()),
    approved: false,
    status: 'PENDING_REVIEW',
    integrityHash: generateMockHash(newContent + diff + taskId),
  };
};

/**
 * Generates a mock test result.
 * Business impact: Simulates automated testing outcomes, providing immediate feedback on the quality and correctness of code changes.
 * How it generates long-term business value: Drives rapid iteration and ensures high code quality by integrating simulated testing into the development pipeline.
 */
export const generateMockTestResult = (fileId: string, status?: 'PASSED' | 'FAILED' | 'SKIPPED'): TestResult => {
  const currentStatus = status || pickRandom(['PASSED', 'FAILED', 'SKIPPED']);
  const errorMessage = currentStatus === 'FAILED' ? `Assertion failed: expected X got Y at ${generateRandomString(15)}` : undefined;
  return {
    id: generateUniqueId(),
    name: `test_${fileId.substring(0, 5)}_${generateRandomString(10).replace(/ /g, '_')}`,
    status: currentStatus,
    durationMs: Math.floor(Math.random() * 500) + 10,
    suite: pickRandom(['unit', 'integration', 'e2e', 'security']),
    errorMessage,
    timestamp: formatTimestamp(new Date()),
    relatedFileId: fileId,
    integrityHash: generateMockHash(`${currentStatus}-${fileId}-${errorMessage || ''}`),
  };
};

/**
 * Generates a mock metric.
 * Business impact: Simulates system performance and operational metrics, providing a dynamic view of platform health.
 * How it generates long-term business value: Enables proactive monitoring and adaptive optimization strategies, ensuring stable and efficient financial operations.
 */
export const generateMockMetric = (name: string, category: Metric['category'], unit: string, threshold?: number): Metric => ({
  id: generateUniqueId(),
  name,
  category,
  unit,
  value: parseFloat((Math.random() * 100).toFixed(2)),
  timestamp: formatTimestamp(new Date()),
  threshold
});

/**
 * Generates a mock security finding.
 * Business impact: Simulates the detection of potential vulnerabilities, vital for assessing the AI's security hardening capabilities.
 * How it generates long-term business value: Supports the development and testing of automated security remediation, reducing overall platform risk.
 */
export const generateMockSecurityFinding = (filePath: string): SecurityFinding => ({
  id: generateUniqueId(),
  severity: pickRandom(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  type: pickRandom(['XSS', 'SQL_INJECTION', 'HARDCODED_CREDENTIALS', 'INSECURE_DEPENDENCY', 'MISSING_AUTH', 'CRYPTOGRAPHIC_WEAKNESS']),
  filePath,
  lineNumber: Math.floor(Math.random() * 100) + 1,
  description: `Potential security vulnerability: ${generateRandomString(50)}`,
  recommendation: `Apply patch, sanitize input, use environment variables: ${generateRandomString(40)}`,
  status: pickRandom(['OPEN', 'FIXED']),
  timestamp: formatTimestamp(new Date()),
});

/**
 * Generates a mock cost report.
 * Business impact: Simulates financial reporting for cloud infrastructure, enabling cost-aware development and optimization.
 * How it generates long-term business value: Provides critical data for financial planning and resource management, directly impacting profitability.
 */
export const generateMockCostReport = (): CostReport => ({
  id: generateUniqueId(),
  period: 'DAILY',
  timestamp: formatTimestamp(new Date()),
  totalCost: parseFloat((Math.random() * 1000).toFixed(2)),
  estimatedSavings: parseFloat((Math.random() * 200).toFixed(2)),
  breakdown: [
    { service: 'AWS EC2', cost: parseFloat((Math.random() * 300).toFixed(2)), optimizationOpportunity: parseFloat((Math.random() * 50).toFixed(2)) },
    { service: 'AWS Lambda', cost: parseFloat((Math.random() * 150).toFixed(2)), optimizationOpportunity: parseFloat((Math.random() * 30).toFixed(2)) },
    { service: 'AWS S3', cost: parseFloat((Math.random() * 50).toFixed(2)), optimizationOpportunity: parseFloat((Math.random() * 10).toFixed(2)) },
    { service: 'Azure DB', cost: parseFloat((Math.random() * 200).toFixed(2)), optimizationOpportunity: parseFloat((Math.random() * 40).toFixed(2)) },
  ],
  recommendations: Array(3).fill(0).map(() => generateRandomString(80)),
  budgetExceeded: Math.random() < 0.2, // 20% chance of exceeding budget
});

/**
 * Generates a mock AgentSkill.
 * Business impact: Provides a simulated capability profile for autonomous agents, allowing for dynamic task allocation.
 * How it generates long-term business value: Enables the orchestration layer to intelligently assign tasks to agents best suited for them, optimizing performance.
 */
export const generateMockAgentSkill = (type: AgentSkill['type']): AgentSkill => ({
  name: `${type} Mastery`,
  type,
  proficiency: Math.floor(Math.random() * 100),
  isActive: true,
});

/**
 * Generates a mock DigitalIdentity.
 * Business impact: Creates synthetic identities for testing authentication and authorization workflows, crucial for security.
 * How it generates long-term business value: Facilitates robust testing of access control mechanisms and identity verification processes, bolstering platform security.
 */
export const generateMockDigitalIdentity = (entityType: DigitalIdentity['entityType'], name: string, publicKey?: string): DigitalIdentity => {
  const pk = publicKey || `PK_${generateUniqueId()}`;
  const details = {
    id: generateUniqueId(),
    entityType,
    name,
    publicKey: pk,
    status: 'ACTIVE',
    verificationLevel: pickRandom(['L1', 'L2', 'L3']),
    associatedAccounts: [],
    creationDate: formatTimestamp(new Date()),
    lastUpdated: formatTimestamp(new Date()),
    integrityHash: generateMockHash(`${pk}-${name}-${entityType}`),
  };
  return details;
};

/**
 * Generates a mock Agent.
 * Business impact: Creates simulated autonomous entities for testing agentic intelligence and orchestration.
 * How it generates long-term business value: Provides a sandbox for developing and refining AI agent behavior, crucial for automating complex financial operations.
 */
export const generateMockAgent = (id: string, name: string, identityId: string, role: Agent['role'], config: AIAgentConfig): Agent => ({
  id,
  name,
  status: 'IDLE',
  skills: [
    generateMockAgentSkill('MONITORING'),
    generateMockAgentSkill('REMEDIATION'),
    generateMockAgentSkill('CODE_GENERATION'),
    generateMockAgentSkill('TESTING'),
    generateMockAgentSkill('DEPLOYMENT'),
    generateMockAgentSkill('GOVERNANCE'),
    generateMockAgentSkill('SETTLEMENT_ROUTING'),
    generateMockAgentSkill('RISK_ASSESSMENT'),
    generateMockAgentSkill('IDENTITY_MANAGEMENT'),
  ],
  lastActive: formatTimestamp(new Date()),
  identityId,
  role,
  healthScore: Math.floor(Math.random() * 100),
  configuration: config,
});

/**
 * Generates a mock AgentMessage.
 * Business impact: Simulates inter-agent communication, vital for testing coordination logic and secure messaging.
 * How it generates long-term business value: Supports the development of robust, fault-tolerant internal communication protocols for autonomous systems.
 */
export const generateMockAgentMessage = (senderId: string, receiverId: string, type: AgentMessage['type'], content: Record<string, any>, sequenceNum: number): AgentMessage => {
  const msgContent = JSON.stringify(content);
  return {
    id: generateUniqueId(),
    senderId,
    receiverId,
    timestamp: formatTimestamp(new Date()),
    type,
    content,
    signature: generateMockSignature(msgContent, senderId),
    nonce: generateMockNonce(),
    sequenceNum,
  };
};

/**
 * Generates a mock AgentOrchestrationLog.
 * Business impact: Provides simulated records of agent activity, essential for auditing and understanding autonomous decision-making.
 * How it generates long-term business value: Facilitates transparency in AI operations and supports post-incident analysis for continuous improvement.
 */
export const generateMockAgentOrchestrationLog = (agentId: string, action: string, context: Record<string, any>, eventId: string, prevHash: string): AgentOrchestrationLog => {
  const details = {
    id: generateUniqueId(),
    timestamp: formatTimestamp(new Date()),
    agentId,
    action,
    context,
    eventId,
    integrityHash: generateMockHash(`${prevHash}-${agentId}-${action}-${JSON.stringify(context)}-${eventId}`),
  };
  return details;
};

/**
 * Generates a mock TokenAsset.
 * Business impact: Creates synthetic digital assets for testing the programmable token rail layer.
 * How it generates long-term business value: Enables comprehensive testing of token issuance, transfer, and lifecycle management in a controlled environment.
 */
export const generateMockTokenAsset = (symbol: string, issuerId: string): TokenAsset => {
  const content = `${symbol}-asset-definition-${issuerId}`;
  return {
    id: generateUniqueId(),
    symbol,
    name: `${symbol} Token`,
    totalSupply: 1_000_000_000,
    decimals: 6,
    issuerId,
    mintable: true,
    burnable: true,
    metadata: {
      description: `A mock programmable ${symbol} token.`,
      complianceRegion: 'GLOBAL',
    },
    creationTimestamp: formatTimestamp(new Date()),
    integrityHash: generateMockHash(content),
  };
};

/**
 * Generates a mock TokenAccount.
 * Business impact: Creates simulated accounts for holding digital assets, fundamental for testing transaction flows.
 * How it generates long-term business value: Supports the development and verification of secure and auditable account management within the financial platform.
 */
export const generateMockTokenAccount = (ownerId: string, assetId: string, initialBalance: number = 0): TokenAccount => {
  const pk = `ACC_PK_${generateUniqueId()}`;
  return {
    id: generateUniqueId(),
    ownerId,
    assetId,
    balance: initialBalance,
    reservedBalance: 0,
    status: 'ACTIVE',
    creationTimestamp: formatTimestamp(new Date()),
    lastUpdateTimestamp: formatTimestamp(new Date()),
    publicKey: pk,
  };
};

/**
 * Generates a mock TokenTransaction.
 * Business impact: Simulates value transfers on the programmable ledger, critical for testing settlement and routing logic.
 * How it generates long-term business value: Enables validation of atomic, idempotent transaction processing, ensuring financial integrity.
 */
export const generateMockTokenTransaction = (
  type: TokenTransaction['type'],
  assetId: string,
  amount: number,
  senderAccountId?: string,
  receiverAccountId?: string,
  meta?: Record<string, any>
): TokenTransaction => {
  const dataToSign = JSON.stringify({ type, assetId, amount, senderAccountId, receiverAccountId, meta });
  const senderOrSystem = senderAccountId || 'SYSTEM_MINT_BURN';
  return {
    id: generateUniqueId(),
    type,
    senderAccountId,
    receiverAccountId,
    assetId,
    amount,
    timestamp: formatTimestamp(new Date()),
    status: 'PENDING',
    signature: generateMockSignature(dataToSign, senderOrSystem),
    nonce: generateMockNonce(),
    integrityHash: generateMockHash(dataToSign + generateMockNonce()),
    meta,
  };
};

/**
 * Generates a mock SettlementRail.
 * Business impact: Creates synthetic settlement pathways for testing optimal routing strategies.
 * How it generates long-term business value: Facilitates the comparison and selection of different settlement mechanisms based on performance, cost, and security metrics.
 */
export const generateMockSettlementRail = (name: string, type: SettlementRail['type'], latency: number, cost: number, security: number, capacity: number, supportedAssets: string[]): SettlementRail => ({
  id: generateUniqueId(),
  name,
  type,
  latencyMs: latency,
  costPerTxn: cost,
  securityRating: security,
  capacityPerSecond: capacity,
  isActive: true,
  supportedAssets,
});

/**
 * Generates a mock RoutingPolicy.
 * Business impact: Creates simulated rules for directing transactions, enabling dynamic optimization of settlement pathways.
 * How it generates long-term business value: Supports the development of adaptive routing logic, maximizing efficiency and minimizing transaction costs in real-time.
 */
export const generateMockRoutingPolicy = (name: string, criteria: string, preferredRailIds: string[], fallbackRailId: string): RoutingPolicy => ({
  id: generateUniqueId(),
  name,
  criteria,
  preferredRailIds,
  fallbackRailId,
  isActive: true,
  priority: Math.floor(Math.random() * 10),
  lastUpdated: formatTimestamp(new Date()),
});

/**
 * Generates a mock PaymentRequest.
 * Business impact: Simulates payment initiation for testing the real-time settlement engine.
 * How it generates long-term business value: Enables comprehensive validation of the payment processing pipeline, from request to final settlement.
 */
export const generateMockPaymentRequest = (payerId: string, payeeId: string, assetId: string, amount: number, requestedRail?: SettlementRail['type']): PaymentRequest => {
  const dataToSign = JSON.stringify({ payerId, payeeId, assetId, amount });
  return {
    id: generateUniqueId(),
    payerIdentityId: payerId,
    payeeIdentityId: payeeId,
    assetId,
    amount,
    timestamp: formatTimestamp(new Date()),
    status: 'INITIATED',
    referenceId: generateUniqueId(),
    requestedRailType: requestedRail,
    signature: generateMockSignature(dataToSign, payerId),
    nonce: generateMockNonce(),
  };
};

/**
 * Generates a mock SettlementConfirmation.
 * Business impact: Simulates the final confirmation of a value transfer, crucial for reconciliation and financial reporting.
 * How it generates long-term business value: Provides immediate and verifiable proof of settlement, reducing operational overhead and increasing trust.
 */
export const generateMockSettlementConfirmation = (paymentRequestId: string, tokenTransactionId: string, settlementRailId: string, amountSettled: number): SettlementConfirmation => {
  const dataToHash = JSON.stringify({ paymentRequestId, tokenTransactionId, settlementRailId, amountSettled });
  return {
    id: generateUniqueId(),
    paymentRequestId,
    tokenTransactionId,
    settlementRailId,
    settlementTimestamp: formatTimestamp(new Date()),
    status: 'COMPLETED',
    amountSettled,
    feesCharged: parseFloat((amountSettled * 0.001).toFixed(4)), // 0.1% fee
    integrityHash: generateMockHash(dataToHash),
    signature: generateMockSignature(dataToHash, 'SETTLEMENT_ENGINE'),
  };
};

/**
 * Generates a mock RiskAssessment.
 * Business impact: Simulates real-time fraud detection and risk scoring, enabling proactive security measures.
 * How it generates long-term business value: Strengthens the financial platform's defense against illicit activities, protecting assets and maintaining regulatory compliance.
 */
export const generateMockRiskAssessment = (targetId: string, targetType: RiskAssessment['targetType'], policyId?: string): RiskAssessment => {
  const score = Math.floor(Math.random() * 100);
  const severity = score > 80 ? 'CRITICAL' : score > 60 ? 'HIGH' : score > 30 ? 'MEDIUM' : 'LOW';
  const recommendation = severity === 'CRITICAL' ? 'BLOCK' : severity === 'HIGH' ? 'FLAG_FOR_REVIEW' : 'ALLOW';
  const findings = [];
  if (score > 50) findings.push(pickRandom(['Unusual transaction pattern', 'High value transfer from new account', 'Geo-location mismatch']));
  if (score > 70) findings.push(pickRandom(['Potential money laundering flag', 'Sanctions list hit (mock)']));

  const dataToHash = JSON.stringify({ targetId, targetType, score, severity, recommendation, findings, policyId });

  return {
    id: generateUniqueId(),
    targetId,
    targetType,
    score,
    severity,
    findings,
    recommendation,
    timestamp: formatTimestamp(new Date()),
    decisionByAgentId: 'AgentRiskEngine',
    policyId,
    integrityHash: generateMockHash(dataToHash),
  };
};

/**
 * Generates a mock Policy.
 * Business impact: Creates synthetic governance rules for testing policy enforcement and compliance automation.
 * How it generates long-term business value: Supports the development of robust regulatory frameworks and automated compliance checks, reducing manual oversight.
 */
export const generateMockPolicy = (name: string, category: Policy['category'], rules: string[], enforcement: Policy['enforcementAction']): Policy => ({
  id: generateUniqueId(),
  name,
  description: `Policy for ${name}`,
  category,
  ruleSet: rules,
  enforcementAction: enforcement,
  isActive: true,
  version: 1,
  lastUpdated: formatTimestamp(new Date()),
});

/**
 * Generates a mock AuditLogEntry.
 * Business impact: Creates simulated immutable audit records, critical for demonstrating transparency and compliance.
 * How it generates long-term business value: Provides verifiable evidence of system behavior, essential for regulatory reporting and forensic analysis.
 */
export const generateMockAuditLogEntry = (eventType: AuditLogEntry['eventType'], entityId: string, details: Record<string, any>, originatorId: string, prevChainHash: string): AuditLogEntry => {
  const content = JSON.stringify({ eventType, entityId, details, originatorId });
  const newHash = generateMockHash(`${prevChainHash}-${content}`);
  return {
    id: generateUniqueId(),
    timestamp: formatTimestamp(new Date()),
    eventType,
    entityId,
    details,
    originatorId,
    integrityChainHash: newHash,
    signature: generateMockSignature(content, 'AUDIT_SYSTEM'),
  };
};

/**
 * Generates a mock RoleBasedAccessControl entry.
 * Business impact: Simulates access permissions, allowing for testing of authorization systems.
 * How it generates long-term business value: Supports the development of fine-grained access control, protecting sensitive functions and data within the financial platform.
 */
export const generateMockRoleBasedAccessControl = (role: string, resource: string, action: RoleBasedAccessControl['action'], isAllowed: boolean): RoleBasedAccessControl => ({
  id: generateUniqueId(),
  role,
  resource,
  action,
  isAllowed,
  lastUpdated: formatTimestamp(new Date()),
});

/**
 * Generates a mock SettlementTransaction.
 * Business impact: Creates simulated end-to-end settlement transactions, crucial for testing the payments engine.
 * How it generates long-term business value: Supports comprehensive validation of real-time value movement, ensuring atomic and idempotent processing across rails.
 */
export const generateMockSettlementTransaction = (
  paymentRequestId: string,
  payerId: string,
  payeeId: string,
  assetId: string,
  amount: number
): SettlementTransaction => {
  const nonce = generateMockNonce();
  const dataToSign = JSON.stringify({ paymentRequestId, payerId, payeeId, assetId, amount, nonce });
  return {
    id: generateUniqueId(),
    paymentRequestId,
    status: 'PENDING_VALIDATION',
    payerId,
    payeeId,
    assetId,
    amount,
    timestamp: formatTimestamp(new Date()),
    auditTrail: [],
    nonce,
    signature: generateMockSignature(dataToSign, 'SETTLEMENT_ENGINE'),
    routingDecisionLogic: '', // Will be filled during simulation
    reconciliationStatus: 'PENDING',
  };
};

// --- Core Data Initializers ---
const initialFiles: CodeFile[] = [
  generateMockCodeFile('src/api/auth.ts', `/**\n * Manages user authentication. Business impact: Secures access to critical financial services, preventing unauthorized transactions. Long-term value: Foundation for trusted digital interactions.\n */\nimport { DigitalIdentity } from './types';\nexport function login(identity: DigitalIdentity) { /* ... */ }\nexport function verifySignature(data: string, signature: string, publicKey: string) { /* ... */ }`),
  generateMockCodeFile('src/components/UserDashboard.tsx', `/**\n * Displays user-specific financial data. Business impact: Provides transparent access to user accounts, enhancing client satisfaction. Long-term value: Key interface for programmable finance interactions.\n */\nimport React from 'react';\nconst Dashboard = () => <p>User Dashboard for {user.name}</p>;\nexport default Dashboard;`),
  generateMockCodeFile('src/services/tokenService.ts', `/**\n * Manages programmable token operations. Business impact: Orchestrates issuance, transfer, and burning of digital assets. Long-term value: Core engine for digital value creation and movement.\n */\nexport async function transferTokens(from: string, to: string, amount: number, assetId: string) { return "tx_id"; }`),
  generateMockCodeFile('tests/api/auth.test.ts', `/**\n * Unit tests for authentication APIs. Business impact: Ensures the integrity and security of user access controls. Long-term value: Reduces attack vectors and maintains platform trust.\n */\nimport { login } from '../../src/api/auth';\ndescribe('login', () => { it('should authenticate successfully', () => expect(true).toBe(true)); });`),
  generateMockCodeFile('src/governance/policyEngine.ts', `/**\n * Implements policy enforcement for financial operations. Business impact: Automates regulatory compliance and risk mitigation. Long-term value: Prevents violations and ensures auditable governance.\n */\nexport function enforcePolicy(policyId: string, transaction: any) { return { compliant: true }; }`),
  generateMockCodeFile('src/settlement/engine.ts', `/**\n * Real-time settlement engine for digital value transfers. Business impact: Processes transactions with atomic finality in milliseconds. Long-term value: Accelerates liquidity and reduces counterparty risk.\n */\nexport async function settleTransaction(tx: any) { return "settled_ok"; }`),
];

const initialMetrics: Metric[] = [
  generateMockMetric('API Latency p95', 'PERFORMANCE', 'ms', 50),
  generateMockMetric('CPU Utilization Avg', 'RESOURCE_UTILIZATION', '%', 70),
  generateMockMetric('Memory Usage Avg', 'RESOURCE_UTILIZATION', '%', 80),
  generateMockMetric('Error Rate', 'AVAILABILITY', '%', 1),
  generateMockMetric('Security Score', 'SECURITY', 'score', 90),
  generateMockMetric('Daily Infrastructure Cost', 'COST', '$', 100),
  generateMockMetric('Transaction Volume per Second', 'TRANSACTION_VOLUME', 'tx/s', 1000),
  generateMockMetric('Compliance Policy Violations', 'COMPLIANCE', 'count', 0),
];

// Initial AI Agent Configuration (shared config for multiple agents potentially)
const initialAiConfig: AIAgentConfig = {
  agentId: 'AgentAlpha', // Orchestrator might have a different ID
  name: 'AutoDev AI',
  model: 'GPT-4o',
  creativity: 5,
  refactoringStrategy: 'OPTIMIZE_PERFORMANCE',
  testCoverageTarget: 90,
  costOptimizationBudget: 500,
  securityVulnerabilityThreshold: 'HIGH',
  deploymentStrategy: 'MANUAL_APPROVAL',
  enabledFeatures: ['CODE_GEN', 'TEST_GEN', 'METRIC_MONITORING', 'POLICY_ENFORCEMENT', 'RISK_ASSESSMENT'],
  maxParallelTasks: 3,
  remediationStrategy: 'ESCALATE_TO_ORCHESTRATOR',
  governanceComplianceLevel: 'STRICT',
};

// Initial Digital Identities
const initialDigitalIdentities: DigitalIdentity[] = [
  generateMockDigitalIdentity('AI_AGENT', 'AgentAlpha_ID', 'PK_AgentAlpha'),
  generateMockDigitalIdentity('AI_AGENT', 'AgentBeta_ID', 'PK_AgentBeta'),
  generateMockDigitalIdentity('PERSON', 'Alice_Investor', 'PK_Alice'),
  generateMockDigitalIdentity('ORGANIZATION', 'GlobalBank_Ops', 'PK_GlobalBank'),
  generateMockDigitalIdentity('SERVICE', 'SettlementEngine_SVC', 'PK_SettlementEngine'),
];

// Initial Agents
const initialAgents: AgentEntity[] = [
  generateMockAgent('AgentAlpha', 'CodeGen-Master', initialDigitalIdentities[0].id, 'DEVELOPER', { ...initialAiConfig, agentId: 'AgentAlpha', name: 'CodeGen-Master' }),
  generateMockAgent('AgentBeta', 'Security-Guard', initialDigitalIdentities[1].id, 'SECURITY', { ...initialAiConfig, agentId: 'AgentBeta', name: 'Security-Guard', securityVulnerabilityThreshold: 'CRITICAL', refactoringStrategy: 'SECURITY_HARDENING' }),
  generateMockAgent('AgentGamma', 'Cost-Optimizer', initialDigitalIdentities[0].id, 'OPS', { ...initialAiConfig, agentId: 'AgentGamma', name: 'Cost-Optimizer', costOptimizationBudget: 300 }),
  generateMockAgent('AgentDelta', 'Settlement-Orchestrator', initialDigitalIdentities[4].id, 'FINANCIAL_ENGINE', { ...initialAiConfig, agentId: 'AgentDelta', name: 'Settlement-Orchestrator', deploymentStrategy: 'AUTOMATIC' }),
];

// Initial Token Assets
const initialTokenAssets: TokenAsset[] = [
  generateMockTokenAsset('USD_C', initialDigitalIdentities[3].id), // GlobalBank issues USD_C
  generateMockTokenAsset('EUR_X', initialDigitalIdentities[3].id),
];

// Initial Settlement Rails
const initialSettlementRails: SettlementRail[] = [
  generateMockSettlementRail('FastRail', 'FAST', 10, 0.0001, 85, 5000, [initialTokenAssets[0].id, initialTokenAssets[1].id]),
  generateMockSettlementRail('SecureRail', 'SECURE', 100, 0.001, 99, 1000, [initialTokenAssets[0].id]),
  generateMockSettlementRail('LowCostRail', 'LOW_COST', 200, 0.00005, 70, 2000, [initialTokenAssets[0].id]),
];

// Initial Routing Policies
const initialRoutingPolicies: RoutingPolicy[] = [
  generateMockRoutingPolicy('HighValueFast', 'amount > 1000 && latencyMs < 50', [initialSettlementRails[0].id, initialSettlementRails[1].id], initialSettlementRails[1].id),
  generateMockRoutingPolicy('DefaultLowCost', 'true', [initialSettlementRails[2].id, initialSettlementRails[0].id], initialSettlementRails[0].id),
];

// Initial Policies
const initialPolicies: Policy[] = [
  generateMockPolicy('AML_CTF_Threshold', 'COMPLIANCE', ["Transaction amount > $10000 requires L3 identity", "Daily cumulative transfers > $50000 requires review"], 'FLAG_FOR_REVIEW'),
  generateMockPolicy('Critical_Vulnerability_Fix_SLA', 'SECURITY', ["Critical security finding must be fixed within 24 hours"], 'AUTO_REMEDIATE'),
  generateMockPolicy('Code_Review_Mandatory', 'OPERATIONAL', ["All AI-generated code changes require human approval"], 'REQUIRE_APPROVAL'),
];

// --- React Components for AI-Driven Development Environment ---

/**
 * Renders a single goal with expanded details.
 * Business impact: Provides a transparent view of progress against strategic development objectives, facilitating stakeholder communication.
 * How it generates long-term business value: Ensures that AI development aligns with business priorities and provides clear visibility into value delivery.
 */
export const GoalDetailsCard: React.FC<{ goal: Goal; onUpdateStatus: (id: string, status: Goal['status']) => void }> = ({ goal, onUpdateStatus }) => (
  <div className="bg-gray-700 p-4 rounded-lg shadow-md mb-3 border border-gray-600">
    <div className="flex justify-between items-start mb-2">
      <h4 className="text-xl font-semibold text-cyan-300">{goal.text}</h4>
      <span className={`px-3 py-1 text-sm rounded-full ${
        goal.status === 'PASSING' ? 'bg-green-600' :
        goal.status === 'FAILING' ? 'bg-red-600' :
        goal.status === 'IN_PROGRESS' ? 'bg-blue-600' :
        goal.status === 'REVIEW_NEEDED' ? 'bg-yellow-600' :
        'bg-gray-500'
      } text-white`}>{goal.status}</span>
    </div>
    <div className="text-sm text-gray-300 grid grid-cols-2 gap-2 mb-3">
      <p><strong>Priority:</strong> <span className={`font-medium ${
        goal.priority === 'CRITICAL' ? 'text-red-400' :
        goal.priority === 'HIGH' ? 'text-orange-400' :
        goal.priority === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
      }`}>{goal.priority}</span></p>
      <p><strong>Category:</strong> {goal.category}</p>
      <p><strong>Agent:</strong> {goal.assignedAgent || 'Unassigned'}</p>
      <p><strong>Progress:</strong> {goal.progressPercentage ? `${goal.progressPercentage.toFixed(0)}%` : 'N/A'}</p>
      <p><strong>Last Updated:</strong> {goal.lastUpdated ? new Date(goal.lastUpdated).toLocaleString() : 'N/A'}</p>
      <p><strong>ETA:</strong> {goal.eta || 'N/A'}</p>
    </div>
    {goal.dependencies.length > 0 && (
      <p className="text-sm text-gray-400 mb-2"><strong>Dependencies:</strong> {goal.dependencies.join(', ')}</p>
    )}
    {goal.metricImpact && goal.metricImpact.length > 0 && (
      <div className="mb-2">
        <p className="text-sm text-gray-400 font-semibold">Metric Impact:</p>
        <ul className="list-disc list-inside text-xs text-gray-400 ml-2">
          {goal.metricImpact.map((mi, idx) => (
            <li key={idx}>{mi.metricId}: Expected {mi.expectedChange}, Target: {mi.targetValue || 'N/A'}</li>
          ))}
        </ul>
      </div>
    )}
    <div className="flex gap-2 mt-3">
      <button
        onClick={() => onUpdateStatus(goal.id, 'IN_PROGRESS')}
        className="px-3 py-1 text-sm bg-blue-700 hover:bg-blue-800 rounded transition-colors"
        disabled={goal.status === 'IN_PROGRESS'}
      >
        Start
      </button>
      <button
        onClick={() => onUpdateStatus(goal.id, 'REVIEW_NEEDED')}
        className="px-3 py-1 text-sm bg-yellow-700 hover:bg-yellow-800 rounded transition-colors"
        disabled={goal.status === 'REVIEW_NEEDED' || goal.status === 'PENDING'}
      >
        Needs Review
      </button>
      <button
        onClick={() => onUpdateStatus(goal.id, 'PASSING')}
        className="px-3 py-1 text-sm bg-green-700 hover:bg-green-800 rounded transition-colors"
        disabled={goal.status === 'PASSING'}
      >
        Mark Complete
      </button>
    </div>
  </div>
);

/**
 * Displays a list of AI process tasks.
 * Business impact: Provides granular visibility into AI agent activities, ensuring accountability and traceability of autonomous operations.
 * How it generates long-term business value: Facilitates auditing, performance optimization, and continuous improvement of the AI-driven development pipeline.
 */
export const AIProcessTaskViewer: React.FC<{ tasks: AIProcessTask[] }> = ({ tasks }) => (
  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-96 overflow-y-auto">
    <h3 className="text-lg font-semibold mb-3 text-cyan-400">AI Task Queue / History</h3>
    {tasks.length === 0 ? (
      <p className="text-gray-400">No AI tasks in progress or recently completed.</p>
    ) : (
      <ul className="space-y-3">
        {tasks.map(task => (
          <li key={task.id} className="bg-gray-700 p-3 rounded-md shadow-sm border border-gray-600">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-white">{task.description}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                task.status === 'COMPLETED' ? 'bg-green-500' :
                task.status === 'FAILED' ? 'bg-red-500' :
                task.status === 'RUNNING' ? 'bg-blue-500 animate-pulse' :
                'bg-gray-500'
              }`}>{task.status}</span>
            </div>
            <p className="text-xs text-gray-400">Type: <span className="font-mono">{task.type}</span> | Goal: {task.goalId.substring(0, 8)} | Agent: {task.agentId || 'N/A'}</p>
            {task.startedAt && <p className="text-xs text-gray-500">Started: {new Date(task.startedAt).toLocaleTimeString()}</p>}
            {task.completedAt && <p className="text-xs text-gray-500">Completed: {new Date(task.completedAt).toLocaleTimeString()}</p>}
            {task.output && (
              <details className="text-xs text-gray-300 mt-2">
                <summary className="cursor-pointer text-blue-300 hover:text-blue-200">View Output</summary>
                <pre className="bg-gray-900 p-2 rounded mt-1 overflow-x-auto text-gray-100 whitespace-pre-wrap">{task.output}</pre>
              </details>
            )}
            {task.logs.length > 0 && (
              <details className="text-xs text-gray-300 mt-2">
                <summary className="cursor-pointer text-blue-300 hover:text-blue-200">View Logs ({task.logs.length})</summary>
                <div className="bg-gray-900 p-2 rounded mt-1 overflow-x-auto h-24 whitespace-pre-wrap text-gray-100">
                  {task.logs.map((log, idx) => (
                    <p key={idx} className={`font-mono text-[10px] ${log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARN' ? 'text-yellow-400' : log.level === 'AUDIT' ? 'text-purple-400' : 'text-gray-300'}`}>
                      [{new Date(log.timestamp).toLocaleTimeString()}] [{log.level}] {log.message}
                    </p>
                  ))}
                </div>
              </details>
            )}
          </li>
        ))}
      </ul>
    )}
  </div>
);

/**
 * A viewer for simulated code files, supporting content display and diff.
 * Business impact: Provides transparency into the evolving codebase, allowing human operators to inspect AI-generated code.
 * How it generates long-term business value: Ensures quality control and facilitates secure integration of autonomous code changes into the financial platform.
 */
export const CodebaseExplorer: React.FC<{
  files: CodeFile[];
  codeChanges: CodeChange[];
  selectedFileId: string | null;
  onSelectFile: (fileId: string | null) => void;
}> = ({ files, codeChanges, selectedFileId, onSelectFile }) => {
  const fileTree = useMemo(() => {
    const tree: Record<string, any> = {};
    files.forEach(file => {
      const parts = file.path.split('/');
      let current = tree;
      parts.forEach((part, i) => {
        if (!current[part]) {
          current[part] = { _isDir: i < parts.length - 1, _files: [], _path: parts.slice(0, i + 1).join('/'), _id: file.id };
        }
        current = current[part];
      });
      current._files.push(file); // Store file object directly on the leaf node
      current._id = file.id; // Also store the file ID on the leaf node
    });
    return tree;
  }, [files]);

  const renderTree = (node: any, path: string = '') => {
    return Object.keys(node).sort().map(key => {
      if (key.startsWith('_')) return null;

      const currentPath = path ? `${path}/${key}` : key;
      const item = node[key];
      const isDir = item._isDir;
      const fileId = item._id; // The ID of the file if this is a leaf node

      const hasPendingChanges = codeChanges.some(change => change.fileId === fileId && change.status === 'PENDING_REVIEW');
      const textColor = hasPendingChanges ? 'text-yellow-400' : (selectedFileId === fileId ? 'text-cyan-400' : 'text-gray-200');

      return (
        <div key={currentPath} className="ml-4">
          <div
            className={`cursor-pointer hover:text-blue-300 flex items-center ${textColor}`}
            onClick={() => isDir ? null : onSelectFile(fileId)}
          >
            {isDir ? (
              <span className="mr-1">📁 </span>
            ) : (
              <span className="mr-1">📄</span>
            )}
            {key} {hasPendingChanges && <span className="ml-2 text-xs text-yellow-500">(Pending Review)</span>}
          </div>
          {isDir && renderTree(item, currentPath)}
        </div>
      );
    });
  };

  const selectedFile = useMemo(() => files.find(f => f.id === selectedFileId), [files, selectedFileId]);
  const filePendingChanges = useMemo(() => codeChanges.filter(c => c.fileId === selectedFileId && c.status === 'PENDING_REVIEW'), [codeChanges, selectedFileId]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col h-[700px]">
      <h3 className="text-lg font-semibold mb-3 text-cyan-400">Codebase Explorer</h3>
      <div className="flex flex-grow overflow-hidden">
        <div className="w-1/3 bg-gray-900 p-2 rounded-md overflow-y-auto border border-gray-700 mr-2">
          {renderTree(fileTree)}
        </div>
        <div className="w-2/3 bg-gray-900 p-2 rounded-md overflow-y-auto border border-gray-700">
          {selectedFile ? (
            <>
              <h4 className="font-mono text-sm text-blue-300 mb-2">{selectedFile.path} (v{selectedFile.version})</h4>
              {filePendingChanges.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-md">
                  <h5 className="text-yellow-400 font-semibold mb-2">Pending Changes ({filePendingChanges.length})</h5>
                  {filePendingChanges.map(change => (
                    <details key={change.id} className="mb-2 text-sm text-yellow-200">
                      <summary className="cursor-pointer hover:text-yellow-100">Change by task {change.taskId.substring(0, 8)}</summary>
                      <pre className="bg-gray-950 p-2 rounded mt-1 text-xs text-gray-100 overflow-x-auto whitespace-pre-wrap">{change.diff}</pre>
                    </details>
                  ))}
                </div>
              )}
              <pre className="text-xs text-gray-100 bg-gray-950 p-2 rounded overflow-x-auto whitespace-pre-wrap h-full">
                {selectedFile.content}
              </pre>
            </>
          ) : (
            <p className="text-gray-400">Select a file to view its content.</p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Displays a dashboard of key metrics with alert indicators.
 * Business impact: Provides critical insights into system performance, security posture, and resource utilization for proactive management.
 * How it generates long-term business value: Enables data-driven optimization, predictive anomaly detection, and ensures SLA adherence, directly impacting uptime and user experience.
 */
export const MetricsDashboard: React.FC<{ metrics: Metric[] }> = ({ metrics }) => (
  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-96 overflow-y-auto">
    <h3 className="text-lg font-semibold mb-3 text-cyan-400">System Metrics Dashboard</h3>
    <div className="grid grid-cols-2 gap-4">
      {metrics.map(metric => (
        <div key={metric.id} className={`p-4 rounded-md shadow-sm border ${
          metric.isAlert ? 'bg-red-900 border-red-700' : 'bg-gray-700 border-gray-600'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-white font-medium">{metric.name}</h4>
            {metric.isAlert && (
              <span className="px-2 py-0.5 text-xs bg-red-600 text-white rounded-full animate-pulse">ALERT</span>
            )}
          </div>
          <p className="text-2xl font-bold text-blue-300">{metric.value.toFixed(2)} {metric.unit}</p>
          <p className="text-sm text-gray-400">Category: {metric.category}</p>
          {metric.threshold && (
            <p className="text-xs text-gray-500">Threshold: {metric.threshold.toFixed(2)} {metric.unit}</p>
          )}
          <p className="text-xs text-gray-500">Last updated: {new Date(metric.timestamp).toLocaleTimeString()}</p>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Displays the status of deployment pipelines.
 * Business impact: Provides real-time visibility into the deployment pipeline, ensuring controlled and efficient software delivery.
 * How it generates long-term business value: Minimizes downtime and deployment risks, contributing to system availability and reliability.
 */
export const DeploymentPipelineStatusViewer: React.FC<{ deployments: DeploymentStatus[] }> = ({ deployments }) => (
  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-96 overflow-y-auto">
    <h3 className="text-lg font-semibold mb-3 text-cyan-400">Deployment Pipelines</h3>
    {deployments.length === 0 ? (
      <p className="text-gray-400">No deployments have occurred yet.</p>
    ) : (
      <ul className="space-y-3">
        {deployments.map(dep => (
          <li key={dep.id} className={`p-3 rounded-md shadow-sm border ${
            dep.status === 'SUCCESS' ? 'bg-green-900 bg-opacity-30 border-green-700' :
            dep.status === 'FAILED' ? 'bg-red-900 bg-opacity-30 border-red-700' :
            dep.status === 'IN_PROGRESS' ? 'bg-blue-900 bg-opacity-30 border-blue-700 animate-pulse' :
            'bg-gray-700 border-gray-600'
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-white">Version: {dep.version.substring(0, 8)}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                dep.status === 'SUCCESS' ? 'bg-green-500' :
                dep.status === 'FAILED' ? 'bg-red-500' :
                dep.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                'bg-gray-500'
              }`}>{dep.status}</span>
            </div>
            <p className="text-xs text-gray-400">Environment: {dep.environment}</p>
            <p className="text-xs text-gray-500">Started: {new Date(dep.startedAt).toLocaleString()}</p>
            {dep.completedAt && <p className="text-xs text-gray-500">Completed: {new Date(dep.completedAt).toLocaleString()} ({((new Date(dep.completedAt).getTime() - new Date(dep.startedAt).getTime()) / 1000).toFixed(1)}s)</p>}
            {dep.integrityCheckPassed ? (<p className="text-xs text-green-400">Integrity Check: PASSED</p>) : (<p className="text-xs text-red-400">Integrity Check: FAILED</p>)}
            {dep.logs.length > 0 && (
              <details className="text-xs text-gray-300 mt-2">
                <summary className="cursor-pointer text-blue-300 hover:text-blue-200">Deployment Logs ({dep.logs.length})</summary>
                <div className="bg-gray-900 p-2 rounded mt-1 overflow-x-auto h-24 whitespace-pre-wrap text-gray-100">
                  {dep.logs.map((log, idx) => (
                    <p key={idx} className={`font-mono text-[10px] ${log.level === 'ERROR' ? 'text-red-400' : log.level === 'WARN' ? 'text-yellow-400' : 'text-gray-300'}`}>
                      [{new Date(log.timestamp).toLocaleTimeString()}] [{log.level}] {log.message}
                    </p>
                  ))}
                </div>
              </details>
            )}
          </li>
        ))}
      </ul>
    )}
  </div>
);

/**
 * Displays security scan findings.
 * Business impact: Proactively detects and mitigates security risks, protecting sensitive financial data and operations.
 * How it generates long-term business value: Reduces the attack surface, prevents costly breaches, and maintains trust in the financial platform.
 */
export const SecurityScanResultsViewer: React.FC<{ findings: SecurityFinding[]; onUpdateFindingStatus: (id: string, status: SecurityFinding['status']) => void }> = ({ findings, onUpdateFindingStatus }) => (
  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-96 overflow-y-auto">
    <h3 className="text-lg font-semibold mb-3 text-cyan-400">Security Scan Results</h3>
    {findings.length === 0 ? (
      <p className="text-gray-400">No security findings.</p>
    ) : (
      <ul className="space-y-3">
        {findings.map(finding => (
          <li key={finding.id} className={`p-3 rounded-md shadow-sm border ${
            finding.status === 'OPEN' ? (
              finding.severity === 'CRITICAL' ? 'bg-red-900 border-red-700' :
              finding.severity === 'HIGH' ? 'bg-orange-900 border-orange-700' :
              'bg-yellow-900 border-yellow-700'
            ) : 'bg-green-900 bg-opacity-30 border-green-700'
          }`}>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-white">{finding.type}</span>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                finding.severity === 'CRITICAL' ? 'bg-red-600' :
                finding.severity === 'HIGH' ? 'bg-orange-600' :
                finding.severity === 'MEDIUM' ? 'bg-yellow-600' :
                'bg-green-600'
              }`}>{finding.severity}</span>
            </div>
            <p className="text-xs text-gray-400">File: <span className="font-mono">{finding.filePath}:{finding.lineNumber}</span></p>
            <p className="text-xs text-gray-300">{finding.description}</p>
            <p className="text-xs text-gray-500 mt-1">Status: {finding.status}</p>
            {finding.status === 'OPEN' && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => onUpdateFindingStatus(finding.id, 'FIXED')}
                  className="px-3 py-1 text-sm bg-green-700 hover:bg-green-800 rounded transition-colors"
                >
                  Mark Fixed
                </button>
                <button
                  onClick={() => onUpdateFindingStatus(finding.id, 'FALSE_POSITIVE')}
                  className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 rounded transition-colors"
                >
                  False Positive
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    )}
  </div>
);

/**
 * Displays cost analysis and optimization recommendations.
 * Business impact: Provides transparent financial oversight of cloud resources, identifying areas for significant cost reduction.
 * How it generates long-term business value: Maximizes profitability by optimizing operational expenditures and improving resource efficiency.
 */
export const CostAnalysisViewer: React.FC<{ reports: CostReport[] }> = ({ reports }) => (
  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-96 overflow-y-auto">
    <h3 className="text-lg font-semibold mb-3 text-cyan-400">Cost Analysis & Optimization</h3>
    {reports.length === 0 ? (
      <p className="text-gray-400">No cost reports available.</p>
    ) : (
      <div className="space-y-4">
        {reports.map(report => (
          <div key={report.id} className="p-3 bg-gray-700 rounded-md shadow-sm border border-gray-600">
            <h4 className="font-medium text-white mb-2">Report for {report.period} - {new Date(report.timestamp).toLocaleDateString()}</h4>
            <p className="text-lg font-bold text-green-400">Total Cost: ${report.totalCost.toFixed(2)}</p>
            <p className="text-md text-blue-300">Estimated Savings: ${report.estimatedSavings.toFixed(2)}</p>
            {report.budgetExceeded && <p className="text-red-400 text-sm mt-1">⚠️ Budget Exceeded!</p>}
            <details className="mt-2 text-sm text-gray-300">
              <summary className="cursor-pointer text-blue-300 hover:text-blue-200">Cost Breakdown</summary>
              <ul className="list-disc list-inside mt-1 text-gray-400">
                {report.breakdown.map((item, idx) => (
                  <li key={idx}>{item.service}: ${item.cost.toFixed(2)} (Opportunity: ${item.optimizationOpportunity.toFixed(2)})</li>
                ))}
              </ul>
            </details>
            <details className="mt-2 text-sm text-gray-300">
              <summary className="cursor-pointer text-blue-300 hover:text-blue-200">Recommendations</summary>
              <ul className="list-disc list-inside mt-1 text-gray-400">
                {report.recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
              </ul>
            </details>
          </div>
        ))}
      </div>
    )}
  </div>
);

/**
 * Allows configuration of AI agent parameters.
 * Business impact: Enables granular control over autonomous agent behavior, adapting to evolving business priorities and regulatory landscapes.
 * How it generates long-term business value: Optimizes AI performance for specific tasks, balancing innovation, risk, and cost-efficiency.
 */
export const AIAgentConfigurator: React.FC<{ config: AIAgentConfig; onUpdateConfig: (newConfig: AIAgentConfig) => void }> = ({ config, onUpdateConfig }) => {
  const [currentConfig, setCurrentConfig] = useState<AIAgentConfig>(config);

  useEffect(() => {
    setCurrentConfig(config);
  }, [config]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setCurrentConfig(prev => {
      let newValue: any = value;
      if (type === 'number') newValue = parseFloat(value);
      if (type === 'checkbox') newValue = checked;
      if (name === 'enabledFeatures') {
        const feature = value;
        newValue = prev.enabledFeatures.includes(feature)
          ? prev.enabledFeatures.filter(f => f !== feature)
          : [...prev.enabledFeatures, feature];
      }
      return { ...prev, [name]: newValue };
    });
  }, []);

  const handleSave = useCallback(() => {
    onUpdateConfig(currentConfig);
  }, [currentConfig, onUpdateConfig]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-96 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-3 text-cyan-400">AI Agent Configuration: {config.name}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm mb-1">Model:</label>
          <input type="text" name="model" value={currentConfig.model} onChange={handleChange}
                 className="w-full p-2 bg-gray-700 border border-gray-600 rounded" />
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-1">Creativity (0-10):</label>
          <input type="range" name="creativity" min="0" max="10" step="0.5" value={currentConfig.creativity} onChange={handleChange}
                 className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg" />
          <span className="text-xs text-gray-400">{currentConfig.creativity}</span>
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-1">Refactoring Strategy:</label>
          <select name="refactoringStrategy" value={currentConfig.refactoringStrategy} onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded">
            <option value="OPTIMIZE_PERFORMANCE">Optimize Performance</option>
            <option value="IMPROVE_READABILITY">Improve Readability</option>
            <option value="REDUCE_COMPLEXITY">Reduce Complexity</option>
            <option value="SECURITY_HARDENING">Security Hardening</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-1">Test Coverage Target (%):</label>
          <input type="number" name="testCoverageTarget" value={currentConfig.testCoverageTarget} onChange={handleChange}
                 className="w-full p-2 bg-gray-700 border border-gray-600 rounded" min="0" max="100" />
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-1">Cost Optimization Budget ($/day):</label>
          <input type="number" name="costOptimizationBudget" value={currentConfig.costOptimizationBudget} onChange={handleChange}
                 className="w-full p-2 bg-gray-700 border border-gray-600 rounded" min="0" />
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-1">Security Vulnerability Threshold:</label>
          <select name="securityVulnerabilityThreshold" value={currentConfig.securityVulnerabilityThreshold} onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded">
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-1">Deployment Strategy:</label>
          <select name="deploymentStrategy" value={currentConfig.deploymentStrategy} onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded">
            <option value="AUTOMATIC">Automatic</option>
            <option value="MANUAL_APPROVAL">Manual Approval</option>
            <option value="GOVERNED_ROLLOUT">Governed Rollout</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-1">Max Parallel Tasks:</label>
          <input type="number" name="maxParallelTasks" value={currentConfig.maxParallelTasks} onChange={handleChange}
                 className="w-full p-2 bg-gray-700 border border-gray-600 rounded" min="1" />
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-1">Remediation Strategy:</label>
          <select name="remediationStrategy" value={currentConfig.remediationStrategy} onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded">
            <option value="AUTOMATIC_RETRY">Automatic Retry</option>
            <option value="ESCALATE_TO_ORCHESTRATOR">Escalate to Orchestrator</option>
            <option value="HUMAN_INTERVENTION">Human Intervention</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-300 text-sm mb-1">Governance Compliance Level:</label>
          <select name="governanceComplianceLevel" value={currentConfig.governanceComplianceLevel} onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded">
            <option value="MINIMAL">Minimal</option>
            <option value="STANDARD">Standard</option>
            <option value="STRICT">Strict</option>
          </select>
        </div>

        <button onClick={handleSave} className="mt-4 p-2 bg-green-600 rounded hover:bg-green-700 transition-colors w-full">Save Configuration</button>
      </div>
    </div>
  );
};

/**
 * Displays recent user feedback and allows submitting new feedback.
 * Business impact: Closes the feedback loop between human operators and autonomous systems, enabling continuous learning and refinement.
 * How it generates long-term business value: Improves the accuracy and relevance of AI output, leading to higher quality software and greater user satisfaction.
 */
export const UserFeedbackPanel: React.FC<{ feedbackItems: UserFeedback[]; onSubmitFeedback: (feedback: Omit<UserFeedback, 'id' | 'timestamp'>) => void }> = ({ feedbackItems, onSubmitFeedback }) => {
  const [newFeedbackText, setNewFeedbackText] = useState('');
  const [newFeedbackRating, setNewFeedbackRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [newFeedbackType, setNewFeedbackType] = useState<UserFeedback['type']>('GENERAL');

  const handleSubmit = useCallback(() => {
    if (!newFeedbackText.trim()) return;
    onSubmitFeedback({
      comment: newFeedbackText,
      rating: newFeedbackRating,
      type: newFeedbackType,
    });
    setNewFeedbackText('');
    setNewFeedbackRating(5);
    setNewFeedbackType('GENERAL');
  }, [newFeedbackText, newFeedbackRating, newFeedbackType, onSubmitFeedback]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-96 overflow-y-auto flex flex-col">
      <h3 className="text-lg font-semibold mb-3 text-cyan-400">User Feedback</h3>

      <div className="mb-4 p-3 bg-gray-700 rounded-md border border-gray-600 flex-shrink-0">
        <h4 className="text-md font-semibold text-white mb-2">Submit New Feedback</h4>
        <textarea
          value={newFeedbackText}
          onChange={e => setNewFeedbackText(e.target.value)}
          placeholder="What do you think about the AI's recent changes or system behavior?"
          className="w-full p-2 bg-gray-600 rounded mb-2 text-white"
          rows={3}
        ></textarea>
        <div className="flex items-center gap-4 mb-2">
          <div>
            <label className="text-gray-300 text-sm mr-2">Rating:</label>
            <select value={newFeedbackRating} onChange={e => setNewFeedbackRating(parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                    className="p-1 bg-gray-600 rounded text-white">
              {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} Star</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-300 text-sm mr-2">Type:</label>
            <select value={newFeedbackType} onChange={e => setNewFeedbackType(e.target.value as UserFeedback['type'])}
                    className="p-1 bg-gray-600 rounded text-white">
              <option value="GENERAL">General</option>
              <option value="CODE_REVIEW">Code Review</option>
              <option value="PERFORMANCE_FEEDBACK">Performance</option>
              <option value="BUG_REPORT">Bug Report</option>
              <option value="SECURITY_OBSERVATION">Security Observation</option>
            </select>
          </div>
        </div>
        <button onClick={handleSubmit} className="p-2 bg-cyan-600 rounded hover:bg-cyan-700 transition-colors w-full">Submit Feedback</button>
      </div>

      <div className="flex-grow overflow-y-auto">
        {feedbackItems.length === 0 ? (
          <p className="text-gray-400">No feedback submitted yet.</p>
        ) : (
          <ul className="space-y-3">
            {feedbackItems.map(feedback => (
              <li key={feedback.id} className="p-3 bg-gray-700 rounded-md shadow-sm border border-gray-600">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-white">{feedback.type}</span>
                  <span className="text-sm text-yellow-400">{'⭐'.repeat(feedback.rating)}</span>
                </div>
                <p className="text-sm text-gray-300">{feedback.comment}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {feedback.goalId && `Goal: ${feedback.goalId.substring(0, 8)} - `}
                  {new Date(feedback.timestamp).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/**
 * A detailed view for code changes, including approval workflow.
 * Business impact: Formalizes the code modification process, integrating human oversight into autonomous development.
 * How it generates long-term business value: Mitigates risks associated with AI-generated code by enforcing review, ensuring quality and compliance.
 */
export const CodeReviewPanel: React.FC<{
  changes: CodeChange[];
  onApproveChange: (changeId: string) => void;
  onRejectChange: (changeId: string, reason: string) => void;
}> = ({ changes, onApproveChange, onRejectChange }) => {
  const [rejectReason, setRejectReason] = useState<string>('');
  const [selectedChangeId, setSelectedChangeId] = useState<string | null>(null);

  const pendingChanges = useMemo(() => changes.filter(c => c.status === 'PENDING_REVIEW'), [changes]);
  const reviewedChanges = useMemo(() => changes.filter(c => c.status !== 'PENDING_REVIEW'), [changes]);

  const selectedChange = useMemo(() => changes.find(c => c.id === selectedChangeId), [changes, selectedChangeId]);

  const handleReject = useCallback(() => {
    if (selectedChangeId && rejectReason.trim()) {
      onRejectChange(selectedChangeId, rejectReason);
      setSelectedChangeId(null);
      setRejectReason('');
    }
  }, [selectedChangeId, rejectReason, onRejectChange]);

  const handleApprove = useCallback(() => {
    if (selectedChangeId) {
      onApproveChange(selectedChangeId);
      setSelectedChangeId(null);
    }
  }, [selectedChangeId, onApproveChange]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-[700px] flex flex-col">
      <h3 className="text-lg font-semibold mb-3 text-cyan-400">Code Review & Approval</h3>
      <div className="flex flex-grow overflow-hidden">
        <div className="w-1/3 bg-gray-900 p-2 rounded-md overflow-y-auto border border-gray-700 mr-2">
          <h4 className="font-semibold text-yellow-400 mb-2">Pending ({pendingChanges.length})</h4>
          <ul className="space-y-2 mb-4">
            {pendingChanges.map(change => (
              <li key={change.id} className={`p-2 rounded-md cursor-pointer ${selectedChangeId === change.id ? 'bg-cyan-800' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => setSelectedChangeId(change.id)}>
                <p className="text-sm font-medium text-white">{change.filePath.split('/').pop()}</p>
                <p className="text-xs text-gray-400">By Task: {change.taskId.substring(0, 8)} - {new Date(change.timestamp).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
          <h4 className="font-semibold text-gray-400 mb-2">Reviewed ({reviewedChanges.length})</h4>
          <ul className="space-y-2">
            {reviewedChanges.map(change => (
              <li key={change.id} className={`p-2 rounded-md cursor-pointer ${selectedChangeId === change.id ? 'bg-cyan-800' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => setSelectedChangeId(change.id)}>
                <p className="text-sm font-medium text-white">{change.filePath.split('/').pop()}</p>
                <p className="text-xs text-gray-400">Status: <span className={change.status === 'APPROVED' ? 'text-green-400' : 'text-red-400'}>{change.status}</span></p>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-2/3 bg-gray-900 p-2 rounded-md overflow-y-auto border border-gray-700">
          {selectedChange ? (
            <>
              <h4 className="font-mono text-sm text-blue-300 mb-2">{selectedChange.filePath}</h4>
              <p className="text-xs text-gray-400 mb-2">Status: <span className={selectedChange.status === 'APPROVED' ? 'text-green-400' : selectedChange.status === 'REJECTED' ? 'text-red-400' : 'text-yellow-400'}>{selectedChange.status}</span></p>
              {selectedChange.reviewComments && <p className="text-sm text-red-300 italic mb-2">Reviewer comments: {selectedChange.reviewComments}</p>}
              <pre className="text-xs text-gray-100 bg-gray-950 p-2 rounded overflow-x-auto whitespace-pre-wrap h-[calc(100%-120px)]">
                {selectedChange.diff}
              </pre>
              {selectedChange.status === 'PENDING_REVIEW' && (
                <div className="mt-4 flex flex-col gap-2">
                  <button onClick={handleApprove} className="p-2 bg-green-600 rounded hover:bg-green-700 transition-colors">Approve Changes</button>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection (required for rejection)"
                    className="w-full p-2 bg-gray-700 rounded text-white"
                  />
                  <button onClick={handleReject} disabled={!rejectReason.trim()} className="p-2 bg-red-600 rounded hover:bg-red-700 transition-colors disabled:opacity-50">Reject Changes</button>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-400">Select a change to review its diff.</p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Visualizes the AI's internal knowledge graph (simplified).
 * Business impact: Creates an intelligent, navigable map of the entire financial infrastructure, enhancing understanding and decision-making.
 * How it generates long-term business value: Accelerates development, simplifies onboarding, and supports complex system analysis by providing context-rich relationships.
 */
export const KnowledgeGraphViewer: React.FC<{ nodes: KnowledgeNode[]; edges: KnowledgeEdge[] }> = ({ nodes, edges }) => {
  const [showNodes, setShowNodes] = useState(true);

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-96 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-3 text-cyan-400">AI Knowledge Graph (Simplified)</h3>
      <div className="flex gap-2 mb-3">
        <button onClick={() => setShowNodes(true)} className={`px-3 py-1 rounded ${showNodes ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 transition-colors`}>Nodes</button>
        <button onClick={() => setShowNodes(false)} className={`px-3 py-1 rounded ${!showNodes ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700 transition-colors`}>Edges</button>
      </div>

      {showNodes ? (
        <details open className="text-gray-300">
          <summary className="cursor-pointer text-blue-300 hover:text-blue-200 text-md font-semibold">Nodes ({nodes.length})</summary>
          <ul className="list-disc list-inside ml-4 mt-2 text-sm text-gray-400">
            {nodes.map(node => (
              <li key={node.id}><span className="font-bold text-white">{node.label}</span> (<span className="text-cyan-300">{node.type}</span>)</li>
            ))}
          </ul>
        </details>
      ) : (
        <details open className="text-gray-300">
          <summary className="cursor-pointer text-blue-300 hover:text-blue-200 text-md font-semibold">Edges ({edges.length})</summary>
          <ul className="list-disc list-inside ml-4 mt-2 text-sm text-gray-400">
            {edges.map(edge => (
              <li key={edge.id}><span className="font-bold text-white">{edge.source.substring(0, 8)}</span> --<span className="text-orange-300">{edge.type}</span>--> <span className="font-bold text-white">{edge.target.substring(0, 8)}</span></li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
};

/**
 * Displays active agents, their statuses, and recent activities.
 * Business impact: Provides a real-time overview of the agentic intelligence layer, enabling monitoring of autonomous operations.
 * How it generates long-term business value: Ensures operational transparency and facilitates proactive management of the AI workforce, reducing risks.
 */
export const AgentOrchestratorView: React.FC<{
  agents: AgentEntity[];
  messages: AgentMessage[];
  orchestrationLogs: AgentOrchestrationLog[];
}> = ({ agents, messages, orchestrationLogs }) => (
  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-96 overflow-y-auto">
    <h3 className="text-lg font-semibold mb-3 text-cyan-400">Agent Orchestration Monitor</h3>
    <details className="mb-4 text-gray-300" open>
      <summary className="cursor-pointer text-blue-300 hover:text-blue-200 text-md font-semibold">Active Agents ({agents.length})</summary>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {agents.map(agent => (
          <div key={agent.id} className="p-2 bg-gray-700 rounded-md text-xs border border-gray-600">
            <p className="font-medium text-white">{agent.name} (<span className="text-cyan-300">{agent.role}</span>)</p>
            <p className={`text-[10px] ${agent.status === 'ACTIVE' ? 'text-green-400' : agent.status === 'ERROR' ? 'text-red-400' : 'text-gray-400'}`}>Status: {agent.status}</p>
            <p className="text-[10px] text-gray-500">Task: {agent.currentTaskId ? agent.currentTaskId.substring(0, 8) : 'None'}</p>
            <p className="text-[10px] text-gray-500">Health: {agent.healthScore}%</p>
          </div>
        ))}
      </div>
    </details>

    <details className="mb-4 text-gray-300">
      <summary className="cursor-pointer text-blue-300 hover:text-blue-200 text-md font-semibold">Agent Communications ({messages.length})</summary>
      <div className="mt-2 h-40 overflow-y-auto bg-gray-900 p-2 rounded-md border border-gray-700">
        {messages.length === 0 ? <p className="text-gray-400 text-sm">No recent messages.</p> :
          messages.slice(-5).reverse().map(msg => (
            <p key={msg.id} className="text-[10px] font-mono text-gray-300">
              [{new Date(msg.timestamp).toLocaleTimeString()}] {msg.senderId.substring(0, 8)} -> {msg.receiverId.substring(0, 8)} ({msg.type}): {JSON.stringify(msg.content).substring(0, 50)}...
            </p>
          ))}
      </div>
    </details>

    <details className="text-gray-300">
      <summary className="cursor-pointer text-blue-300 hover:text-blue-200 text-md font-semibold">Orchestration Logs ({orchestrationLogs.length})</summary>
      <div className="mt-2 h-40 overflow-y-auto bg-gray-900 p-2 rounded-md border border-gray-700">
        {orchestrationLogs.length === 0 ? <p className="text-gray-400 text-sm">No orchestration logs.</p> :
          orchestrationLogs.slice(-5).reverse().map(log => (
            <p key={log.id} className="text-[10px] font-mono text-gray-300">
              [{new Date(log.timestamp).toLocaleTimeString()}] {log.agentId.substring(0, 8)}: {log.action}
            </p>
          ))}
      </div>
    </details>
  </div>
);

/**
 * Displays token assets, accounts, and recent transactions on the programmable value rail.
 * Business impact: Provides real-time visibility and control over digital assets and their movement within the financial platform.
 * How it generates long-term business value: Enhances trust, transparency, and operational efficiency for all programmable value operations, fostering new financial products.
 */
export const ProgrammableTokenRailViewer: React.FC<{
  tokenAssets: TokenAsset[];
  tokenAccounts: TokenAccount[];
  tokenTransactions: TokenTransaction[];
  settlementRails: SettlementRail[];
  routingPolicies: RoutingPolicy[];
  onMintBurnTransfer: (type: 'MINT' | 'BURN' | 'TRANSFER', assetId: string, amount: number, from?: string, to?: string) => void;
}> = ({ tokenAssets, tokenAccounts, tokenTransactions, settlementRails, routingPolicies, onMintBurnTransfer }) => {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(tokenAssets[0]?.id || null);
  const [mintAmount, setMintAmount] = useState(0);
  const [burnAmount, setBurnAmount] = useState(0);
  const [transferAmount, setTransferAmount] = useState(0);
  const [transferFrom, setTransferFrom] = useState<string | null>(tokenAccounts[0]?.id || null);
  const [transferTo, setTransferTo] = useState<string | null>(tokenAccounts[1]?.id || null);

  const currentAsset = useMemo(() => tokenAssets.find(a => a.id === selectedAsset), [tokenAssets, selectedAsset]);
  const accountsForAsset = useMemo(() => tokenAccounts.filter(acc => acc.assetId === selectedAsset), [tokenAccounts, selectedAsset]);

  const handleMint = useCallback(() => {
    if (currentAsset && mintAmount > 0) {
      onMintBurnTransfer('MINT', currentAsset.id, mintAmount, undefined, accountsForAsset[0]?.id);
      setMintAmount(0);
    }
  }, [currentAsset, mintAmount, accountsForAsset, onMintBurnTransfer]);

  const handleBurn = useCallback(() => {
    if (currentAsset && burnAmount > 0 && accountsForAsset[0]) {
      onMintBurnTransfer('BURN', currentAsset.id, burnAmount, accountsForAsset[0].id);
      setBurnAmount(0);
    }
  }, [currentAsset, burnAmount, accountsForAsset, onMintBurnTransfer]);

  const handleTransfer = useCallback(() => {
    if (currentAsset && transferAmount > 0 && transferFrom && transferTo) {
      onMintBurnTransfer('TRANSFER', currentAsset.id, transferAmount, transferFrom, transferTo);
      setTransferAmount(0);
    }
  }, [currentAsset, transferAmount, transferFrom, transferTo, onMintBurnTransfer]);


  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-[700px] overflow-y-auto">
      <h3 className="text-lg font-semibold mb-3 text-cyan-400">Programmable Token Rail</h3>

      <div className="mb-4">
        <label htmlFor="asset-select" className="block text-gray-300 text-sm mb-1">Select Asset:</label>
        <select id="asset-select" value={selectedAsset || ''} onChange={e => setSelectedAsset(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white">
          {tokenAssets.map(asset => <option key={asset.id} value={asset.id}>{asset.symbol} ({asset.name})</option>)}
        </select>
      </div>

      {currentAsset && (
        <details open className="mb-4 text-gray-300 p-3 bg-gray-700 rounded-md border border-gray-600">
          <summary className="cursor-pointer text-blue-300 hover:text-blue-200 text-md font-semibold">Asset Details: {currentAsset.symbol}</summary>
          <p className="text-sm text-gray-400">Issuer: {currentAsset.issuerId.substring(0, 8)}</p>
          <p className="text-sm text-gray-400">Total Supply: {currentAsset.totalSupply}</p>
          <p className="text-sm text-gray-400">Mintable: {currentAsset.mintable ? 'Yes' : 'No'}, Burnable: {currentAsset.burnable ? 'Yes' : 'No'}</p>
        </details>
      )}

      <details open className="mb-4 text-gray-300 p-3 bg-gray-700 rounded-md border border-gray-600">
        <summary className="cursor-pointer text-blue-300 hover:text-blue-200 text-md font-semibold">Accounts ({accountsForAsset.length})</summary>
        <div className="mt-2 space-y-2">
          {accountsForAsset.map(account => (
            <div key={account.id} className="p-2 bg-gray-600 rounded-md text-xs">
              <p className="font-medium text-white">Account: {account.id.substring(0, 8)}</p>
              <p className="text-gray-400">Owner: {account.ownerId.substring(0, 8)}</p>
              <p className="text-lg font-bold text-green-300">Balance: {account.balance.toFixed(currentAsset?.decimals || 0)} {currentAsset?.symbol}</p>
            </div>
          ))}
        </div>
      </details>

      {currentAsset && (
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-700 rounded-md border border-gray-600">
          <div>
            <h4 className="font-semibold text-white mb-2">Mint Tokens</h4>
            <input type="number" value={mintAmount} onChange={e => setMintAmount(parseFloat(e.target.value))} min="0" className="w-full p-2 bg-gray-600 rounded mb-2 text-white" />
            <button onClick={handleMint} disabled={!currentAsset.mintable || mintAmount <= 0} className="w-full p-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50">Mint {currentAsset.symbol}</button>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Burn Tokens</h4>
            <input type="number" value={burnAmount} onChange={e => setBurnAmount(parseFloat(e.target.value))} min="0" className="w-full p-2 bg-gray-600 rounded mb-2 text-white" />
            <button onClick={handleBurn} disabled={!currentAsset.burnable || burnAmount <= 0} className="w-full p-2 bg-red-600 rounded hover:bg-red-700 disabled:opacity-50">Burn {currentAsset.symbol}</button>
          </div>
          <div className="col-span-2">
            <h4 className="font-semibold text-white mb-2">Transfer Tokens</h4>
            <input type="number" value={transferAmount} onChange={e => setTransferAmount(parseFloat(e.target.value))} min="0" className="w-full p-2 bg-gray-600 rounded mb-2 text-white" />
            <div className="flex gap-2 mb-2">
              <select value={transferFrom || ''} onChange={e => setTransferFrom(e.target.value)} className="flex-grow p-2 bg-gray-600 rounded text-white">
                {accountsForAsset.map(acc => <option key={acc.id} value={acc.id}>From: {acc.id.substring(0, 8)} ({acc.balance.toFixed(0)})</option>)}
              </select>
              <span className="text-gray-400 text-lg">→</span>
              <select value={transferTo || ''} onChange={e => setTransferTo(e.target.value)} className="flex-grow p-2 bg-gray-600 rounded text-white">
                {accountsForAsset.filter(acc => acc.id !== transferFrom).map(acc => <option key={acc.id} value={acc.id}>To: {acc.id.substring(0, 8)}</option>)}
              </select>
            </div>
            <button onClick={handleTransfer} disabled={transferAmount <= 0 || !transferFrom || !transferTo} className="w-full p-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50">Transfer {currentAsset.symbol}</button>
          </div>
        </div>
      )}

      <details className="mb-4 text-gray-300">
        <summary className="cursor-pointer text-blue-300 hover:text-blue-200 text-md font-semibold">Recent Transactions ({tokenTransactions.length})</summary>
        <div className="mt-2 h-40 overflow-y-auto bg-gray-900 p-2 rounded-md border border-gray-700">
          {tokenTransactions.length === 0 ? <p className="text-gray-400 text-sm">No recent transactions.</p> :
            tokenTransactions.slice(-5).reverse().map(tx => (
              <div key={tx.id} className="p-2 bg-gray-600 rounded-md text-xs mb-1">
                <p className="font-medium text-white">{tx.type} {tx.amount.toFixed(currentAsset?.decimals || 0)} {currentAsset?.symbol}</p>
                <p className="text-gray-400">From: {tx.senderAccountId?.substring(0, 8) || 'N/A'} To: {tx.receiverAccountId?.substring(0, 8) || 'N/A'}</p>
                <p className={`text-[10px] ${tx.status === 'COMMITTED' ? 'text-green-400' : 'text-yellow-400'}`}>Status: {tx.status}</p>
              </div>
            ))}
        </div>
      </details>

      <details className="mb-4 text-gray-300">
        <summary className="cursor-pointer text-blue-300 hover:text-blue-200 text-md font-semibold">Settlement Rails ({settlementRails.length})</summary>
        <div className="mt-2 space-y-2">
          {settlementRails.map(rail => (
            <div key={rail.id} className="p-2 bg-gray-600 rounded-md text-xs">
              <p className="font-medium text-white">{rail.name} ({rail.type})</p>
              <p className="text-gray-400">Latency: {rail.latencyMs}ms | Cost: ${rail.costPerTxn.toFixed(5)} | Security: {rail.securityRating}/100</p>
            </div>
          ))}
        </div>
      </details>

      <details className="mb-4 text-gray-300">
        <summary className="cursor-pointer text-blue-300 hover:text-blue-200 text-md font-semibold">Routing Policies ({routingPolicies.length})</summary>
        <div className="mt-2 space-y-2">
          {routingPolicies.map(policy => (
            <div key={policy.id} className="p-2 bg-gray-600 rounded-md text-xs">
              <p className="font-medium text-white">{policy.name} (Priority: {policy.priority})</p>
              <p className="text-gray-400">Criteria: {policy.criteria}</p>
              <p className="text-gray-400">Preferred Rails: {policy.preferredRailIds.map(id => id.substring(0, 8)).join(', ')}</p>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};

/**
 * Manages and displays digital identities, keys, and authorization records.
 * Business impact: Establishes a foundational trust layer across the entire financial infrastructure, enabling secure and compliant interactions.
 * How it generates long-term business value: Simplifies authentication, streamlines authorization, and ensures non-repudiation for all digital entities, reducing fraud and regulatory burden.
 */
export const DigitalIdentityManager: React.FC<{
  identities: DigitalIdentity[];
  accessLogs: AccessLogEntry[];
  authorizationPolicies: AuthorizationPolicy[];
  onAuthorizeAction: (identityId: string, action: string, resource: string) => boolean;
}> = ({ identities, accessLogs, authorizationPolicies, onAuthorizeAction }) => {
  const [selectedIdentityId, setSelectedIdentityId] = useState<string | null>(identities[0]?.id || null);
  const selectedIdentity = useMemo(() => identities.find(id => id.id === selectedIdentityId), [identities, selectedIdentityId]);

  const mockTestAuthorization = useCallback(() => {
    if (!selectedIdentity) return;
    const action = 'token_transfer';
    const resource = 'TokenAccount:ACC123';
    const allowed = onAuthorizeAction(selectedIdentity.id, action, resource);
    alert(`Authorization test for ${selectedIdentity.name} to ${action} on ${resource}: ${allowed ? 'ALLOWED' : 'DENIED'}`);
  }, [selectedIdentity, onAuthorizeAction]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-[700px] overflow-y-auto">
      <h3 className="text-lg font-semibold mb-3 text-cyan-400">Digital Identity & Trust</h3>

      <div className="mb-4">
        <label htmlFor="identity-select" className="block text-gray-300 text-sm mb-1">Select Identity:</label>
        <select id="identity-select" value={selectedIdentityId || ''} onChange={e => setSelectedIdentityId(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white">
          {identities.map(id => <option key={id.id} value={id.id}>{id.name} ({id.entityType})</option>)}
        </select>
      </div>

      {selectedIdentity && (
        <details open className="mb-4 text-gray-300 p-3 bg-gray-700 rounded-md border border-gray-600">
          <summary className="cursor-pointer text-blue-300 hover:text-blue-200 text-md font-semibold">Identity Details: {selectedIdentity.name}</summary>
          <p className="text-sm text-gray-400">Type: {selectedIdentity.entityType}</p>
          <p className="text-sm text-gray-400">Status: {selectedIdentity.status}</p>
          <p className="text-sm text-gray-400">Verification Level: {selectedIdentity.verificationLevel}</p>
          <p className="text-sm text-gray-400 truncate">Public Key: {selectedIdentity.publicKey}</p>
          <button onClick={mockTestAuthorization} className="mt-2 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded transition-colors">Test Authorization</button>
        </details>
      )}

      <details className="mb-4 text-gray-300">
        <summary className="cursor-pointer text-blue-300 hover:text-blue-200 text-md font-semibold">Authorization Policies ({authorizationPolicies.length})</summary>
        <div className="mt-2 space-y-2 h-40 overflow-y-auto bg-gray-900 p-2 rounded-md border border-gray-700">
          {authorizationPolicies.map(policy => (
            <div key={policy.id} className="p-2 bg-gray-600 rounded-md text-xs">
              <p className="font-medium text-white">{policy.name} ({policy.targetResource})</p>
              <p className="text-gray-400">Allowed Roles: {policy.allowRoles.join(', ')}</p>
            </div>
          ))}
        </div>
      </details>

      <details className="mb-4 text-gray-300">
        <summary className="cursor-pointer text-blue-300 hover:text-blue-200 text-md font-semibold">Access Logs ({accessLogs.length})</summary>
        <div className="mt-2 space-y-2 h-60 overflow-y-auto bg-gray-900 p-2 rounded-md border border-gray-700">
          {accessLogs.slice(-10).reverse().map(log => (
            <div key={log.id} className="p-2 bg-gray-600 rounded-md text-xs">
              <p className="font-medium text-white">{new Date(log.timestamp).toLocaleTimeString()}: {log.identityId?.substring(0, 8)} - {log.action} on {log.resourceId.substring(0, 8)} ({log.status})</p>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};

/**
 * Visualizes payment requests, settlement confirmations, and risk scores.
 * Business impact: Provides real-time oversight of the payment processing pipeline, ensuring fast, secure, and compliant value movement.
 * How it generates long-term business value: Accelerates transaction finality, reduces fraud, and enhances operational reliability for financial transfers.
 */
export const RealTimeSettlementMonitor: React.FC<{
  paymentRequests: PaymentRequest[];
  settlementTransactions: SettlementTransaction[];
  settlementConfirmations: SettlementConfirmation[];
  riskAssessments: RiskAssessment[];
  onInitiatePayment: (payerId: string, payeeId: string, assetId: string, amount: number) => void;
}> = ({ paymentRequests, settlementTransactions, settlementConfirmations, riskAssessments, onInitiatePayment }) => {
  const [payer, setPayer] = useState('');
  const [payee, setPayee] = useState('');
  const [asset, setAsset] = useState('');
  const [amount, setAmount] = useState(0);

  const handlePaymentInitiation = useCallback(() => {
    if (payer && payee && asset && amount > 0) {
      onInitiatePayment(payer, payee, asset, amount);
      setPayer(''); setPayee(''); setAsset(''); setAmount(0);
    }
  }, [payer, payee, asset, amount, onInitiatePayment]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-[700px] overflow-y-auto">
      <h3 className="text-lg font-semibold mb-3 text-cyan-400">Real-Time Settlement Engine</h3>

      <div className="mb-4 p-3 bg-gray-700 rounded-md border border-gray-600">
        <h4 className="font-semibold text-white mb-2">Initiate New Payment</h4>
        <input type="text" placeholder="Payer Identity ID" value={payer} onChange={e => setPayer(e.target.value)} className="w-full p-2 bg-gray-600 rounded mb-2 text-white" />
        <input type="text" placeholder="Payee Identity ID" value={payee} onChange={e => setPayee(e.target.value)} className="w-full p-2 bg-gray-600 rounded mb-2 text-white" />
        <input type="text" placeholder="Asset ID (e.g., USD_C)" value={asset} onChange={e => setAsset(e.target.value)} className="w-full p-2 bg-gray-600 rounded mb-2 text-white" />
        <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} min="0" className="w-full p-2 bg-gray-600 rounded mb-2 text-white" />
        <button onClick={handlePaymentInitiation} disabled={!payer || !payee || !asset || amount <= 0} className="w-full p-2 bg-cyan-600 rounded hover:bg-cyan-700 disabled:opacity-50">Request Payment</button>
      </div>

      <details open className="mb-4 text-gray-300">
        <summary className="cursor-pointer text-blue-300 hover:text-blue-200 text-md font-semibold">Payment Requests ({paymentRequests.length})</summary>
        <div className="mt-2 space-y-2 h-40 overflow-y-auto bg-gray-900 p-2 rounded-md border border-gray-700">
          {paymentRequests.slice(-5).reverse().map(req => (
            <div key={req.id} className="p-2 bg-gray-600 rounded-md text-xs">
              <p className="font-medium text-white">{req.payerIdentityId.substring(0, 8)} → {req.payeeIdentityId.substring(0, 8)}: {req.amount} {req.assetId}</p>
              <p className={`text-[10px] ${req.status === 'SETTLED' ? 'text-green-400' : 'text-yellow-400'}`}>Status: {req.status}</p>
            </div>
          ))}
        </div>
      </details>

      <details open className="mb-4 text-gray-300">
        <summary className="cursor-pointer text-blue-300 hover:text-blue-200 text-md font-semibold">Settlement Transactions ({settlementTransactions.length})</summary>
        <div className="mt-2 space-y-2 h-40 overflow-y-auto bg-gray-900 p-2 rounded-md border border-gray-700">
          {settlementTransactions.slice(-5).reverse().map(tx => (
            <div key={tx.id} className="p-2 bg-gray-600 rounded-md text-xs">
              <p className="font-medium text-white">{tx.payerId.substring(0, 8)} → {tx.payeeId.substring(0, 8)}: {tx.amount} {tx.assetId}</p>
              <p className={`text-[10px] ${tx.status === 'COMPLETED' ? 'text-green-400' : 'text-yellow-400'}`}>Status: {tx.status}</p>
              <p className="text-[10px] text-gray-500">Rail: {tx.settlementRailUsed?.substring(0, 8) || 'N/A'}</p>
            </div>
          ))}
        </div>
      </details>

      <details open className="mb-4 text-gray-300">
        <summary className="cursor-pointer text-blue-300 hover:text-blue-200 text-md font-semibold">Risk Assessments ({riskAssessments.length})</summary>
        <div className="mt-2 space-y-2 h-40 overflow-y-auto bg-gray-900 p-2 rounded-md border border-gray-700">
          {riskAssessments.slice(-5).reverse().map(risk => (
            <div key={risk.id} className="p-2 bg-gray-600 rounded-md text-xs">
              <p className="font-medium text-white">Target: {risk.targetId.substring(0, 8)} ({risk.targetType})</p>
              <p className={`text-[10px] ${risk.severity === 'CRITICAL' ? 'text-red-400' : risk.severity === 'HIGH' ? 'text-orange-400' : 'text-yellow-400'}`}>
                Score: {risk.score} ({risk.severity}) - {risk.recommendation}
              </p>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};

/**
 * Displays governance policies, access controls, and immutable audit logs.
 * Business impact: Provides comprehensive oversight of compliance and operational integrity across the entire financial infrastructure.
 * How it generates long-term business value: Ensures adherence to regulatory frameworks, mitigates operational risks, and builds trust through transparent, auditable processes.
 */
export const GovernancePanel: React.FC<{
  policies: Policy[];
  auditLogs: AuditLogEntry[];
  accessControls: RoleBasedAccessControl[];
}> = ({ policies, auditLogs, accessControls }) => (
  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-[700px] overflow-y-auto">
    <h3 className="text-lg font-semibold mb-3 text-cyan-400">Governance, Observability, and Integrity</h3>

    <details open className="mb-4 text-gray-300">
      <summary className="cursor-pointer text-blue-300 hover:text-blue-200 text-md font-semibold">Policies ({policies.length})</summary>
      <div className="mt-2 space-y-2 h-40 overflow-y-auto bg-gray-900 p-2 rounded-md border border-gray-700">
        {policies.map(policy => (
          <div key={policy.id} className="p-2 bg-gray-600 rounded-md text-xs">
            <p className="font-medium text-white">{policy.name} ({policy.category})</p>
            <p className="text-gray-400">Rules: {policy.ruleSet.join('; ')}</p>
            <p className="text-gray-400">Enforcement: {policy.enforcementAction}</p>
          </div>
        ))}
      </div>
    </details>

    <details open className="mb-4 text-gray-300">
      <summary className="cursor-pointer text-blue-300 hover:text-blue-200 text-md font-semibold">Access Control ({accessControls.length})</summary>
      <div className="mt-2 space-y-2 h-40 overflow-y-auto bg-gray-900 p-2 rounded-md border border-gray-700">
        {accessControls.map(ac => (
          <div key={ac.id} className="p-2 bg-gray-600 rounded-md text-xs">
            <p className="font-medium text-white">Role: {ac.role} - Resource: {ac.resource}</p>
            <p className="text-gray-400">Action: {ac.action} - Allowed: {ac.isAllowed ? 'Yes' : 'No'}</p>
          </div>
        ))}
      </div>
    </details>

    <details open className="mb-4 text-gray-300">
      <summary className="cursor-pointer text-blue-300 hover:text-blue-200 text-md font-semibold">Immutable Audit Logs ({auditLogs.length})</summary>
      <div className="mt-2 space-y-2 h-60 overflow-y-auto bg-gray-900 p-2 rounded-md border border-gray-700">
        {auditLogs.slice(-10).reverse().map(log => (
          <div key={log.id} className="p-2 bg-gray-600 rounded-md text-xs">
            <p className="font-medium text-white">[{new Date(log.timestamp).toLocaleTimeString()}] [{log.eventType}] - {log.originatorId?.substring(0, 8)}</p>
            <p className="text-gray-400">Entity: {log.entityId?.substring(0, 8)} - {JSON.stringify(log.details).substring(0, 50)}...</p>
            <p className="text-[10px] text-gray-500 truncate">Chain Hash: {log.integrityChainHash}</p>
          </div>
        ))}
      </div>
    </details>
  </div>
);

/**
 * A custom hook to simulate Agentic Intelligence Layer operations.
 * Business impact: Orchestrates autonomous agents to observe, decide, and act across the financial infrastructure, driving intelligent automation.
 * How it generates long-term business value: Automates complex workflows, reduces operational costs, and ensures proactive system management.
 */
export const useAgentOrchestrator = (
  initialAgents: AgentEntity[],
  initialTasks: AIProcessTask[],
  initialMetrics: Metric[],
  goals: Goal[],
  updateGoalStatus: (id: string, status: Goal['status']) => void,
  addAiTask: (task: AIProcessTask) => void,
  updateAiTask: (taskId: string, updates: Partial<AIProcessTask>) => void,
  addLogEntry: (log: LogEntry) => void,
  onCodeChangeGenerated: (task: AIProcessTask, file: CodeFile) => CodeChange,
  onCodebaseFileCreated: (file: CodeFile) => void,
  onSecurityFinding: (finding: SecurityFinding) => void,
  aiConfig: AIAgentConfig,
  currentAuditLogHash: string
) => {
  const [agents, setAgents] = useState<AgentEntity[]>(initialAgents);
  const [aiTasks, setAiTasks] = useState<AIProcessTask[]>(initialTasks);
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [orchestrationLogs, setOrchestrationLogs] = useState<AgentOrchestrationLog[]>([]);
  const latestAuditLogHash = useRef(currentAuditLogHash);

  useEffect(() => {
    latestAuditLogHash.current = currentAuditLogHash;
  }, [currentAuditLogHash]);

  const addOrchestrationLog = useCallback((agentId: string, action: string, context: Record<string, any>, eventId: string) => {
    setOrchestrationLogs(prev => {
      const prevHash = prev.length > 0 ? prev[prev.length - 1].integrityHash : '';
      const newLog = generateMockAgentOrchestrationLog(agentId, action, context, eventId, prevHash);
      addLogEntry(generateMockLogEntry('AgentOrchestrator', 'AUDIT', `Orchestrator log: ${action} by ${agentId}`));
      return [...prev, newLog];
    });
  }, [addLogEntry]);

  const sendMessage = useCallback((senderId: string, receiverId: string, type: AgentMessage['type'], content: Record<string, any>) => {
    setAgentMessages(prev => {
      const sequenceNum = prev.filter(m => m.senderId === senderId).length + 1;
      const message = generateMockAgentMessage(senderId, receiverId, type, content, sequenceNum);
      addOrchestrationLog(senderId, `Sent message to ${receiverId} (${type})`, content, message.id);
      return [...prev, message];
    });
  }, [addOrchestrationLog]);

  const processAgentTask = useCallback(async (agent: AgentEntity, task: AIProcessTask) => {
    addOrchestrationLog(agent.id, `Starting task: ${task.description}`, { taskId: task.id, goalId: task.goalId }, task.id);
    updateAiTask(task.id, { status: 'RUNNING', startedAt: formatTimestamp(new Date()), agentId: agent.id });
    setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'ACTIVE', currentTaskId: task.id } : a));

    await new Promise(resolve => setTimeout(resolve, task.estimatedDurationMs));

    let output = '';
    let status: AIProcessTask['status'] = 'COMPLETED';
    let artifacts: AIProcessTask['artifacts'] = [];
    let logs: LogEntry[] = [generateMockLogEntry(agent.name, 'INFO', `Task ${task.type} for goal ${task.goalId} completed.`)];

    // Simulate task-specific logic
    switch (task.type) {
      case 'CODE_GEN':
      case 'CODE_REF_FACTOR': {
        const goal = goals.find(g => g.id === task.goalId);
        if (goal) {
          const newFile = generateMockCodeFile(`src/features/${goal.id}/${task.type}_${generateUniqueId().substring(0, 5)}.ts`, `// AI-${task.type} code for goal: ${goal.text}\nconst improvedFunction = () => {};`);
          onCodebaseFileCreated(newFile);
          const newChange = onCodeChangeGenerated({ ...task, status: 'COMPLETED' }, newFile);
          artifacts.push({ type: 'FILE_CHANGE', content: newChange });
          output = `Code generated/refactored: ${newFile.path}. Pending review.`;
          updateGoalStatus(goal.id, 'REVIEW_NEEDED');
        }
        break;
      }
      case 'TEST_GEN': {
        const goal = goals.find(g => g.id === task.goalId);
        if (goal) {
          const newTestFile = generateMockCodeFile(`tests/features/${goal.id}/${task.type}_${generateUniqueId().substring(0, 5)}.test.ts`, `// AI-generated test for goal: ${goal.text}\ndescribe('new feature', () => { it('should pass', () => expect(true).toBe(true)); });`);
          onCodebaseFileCreated(newTestFile);
          const newTestChange = onCodeChangeGenerated({ ...task, status: 'COMPLETED' }, newTestFile);
          artifacts.push({ type: 'FILE_CHANGE', content: newTestChange });
          output = `Tests generated for goal: ${goal.text}. Pending review.`;
        }
        break;
      }
      case 'SECURITY_SCAN': {
        const fileCount = Math.floor(Math.random() * 3);
        for (let i = 0; i < fileCount; i++) {
          const mockFile = generateMockCodeFile(`src/random/file_${generateUniqueId()}.ts`);
          const finding = generateMockSecurityFinding(mockFile.path);
          onSecurityFinding(finding);
        }
        output = `Security scan completed. Found ${fileCount} potential issues.`;
        break;
      }
      case 'MONITOR': {
        // Agents could observe metrics and report
        const criticalMetrics = initialMetrics.filter(m => m.isAlert);
        if (criticalMetrics.length > 0) {
          output = `Monitoring detected ${criticalMetrics.length} alerts. Initiating remediation skills.`;
          sendMessage(agent.id, 'AgentOrchestrator', 'ALERT', { metrics: criticalMetrics.map(m => m.id) });
          setAgents(prev => prev.map(a =>
            a.id === agent.id ? { ...a, healthScore: Math.max(0, a.healthScore - 10) } : a // Health might degrade due to issues
          ));
        } else {
          output = 'System running smoothly, no critical alerts detected.';
          setAgents(prev => prev.map(a =>
            a.id === agent.id ? { ...a, healthScore: Math.min(100, a.healthScore + 5) } : a // Health might improve
          ));
        }
        break;
      }
      case 'SETTLEMENT': {
        output = `Agent ${agent.id} performed a settlement task.`;
        break;
      }
      case 'IDENTITY_MGMT': {
        output = `Agent ${agent.id} managed identities.`;
        break;
      }
      case 'POLICY_ENFORCE': {
        output = `Agent ${agent.id} enforced policies.`;
        break;
      }
      case 'BUGFIX': {
        output = `Agent ${agent.id} applied a bugfix.`;
        updateGoalStatus(task.goalId, 'REVIEW_NEEDED'); // After bugfix, needs review
        break;
      }
      // Add other task types here
    }

    updateAiTask(task.id, {
      status,
      completedAt: formatTimestamp(new Date()),
      output,
      artifacts: [...(task.artifacts || []), ...artifacts],
      logs: [...task.logs, ...logs],
      actualDurationMs: Date.now() - new Date(task.startedAt!).getTime(),
    });
    setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'IDLE', currentTaskId: undefined } : a));
    addOrchestrationLog(agent.id, `Completed task: ${task.description}`, { taskId: task.id, outcome: status }, task.id);
  }, [addOrchestrationLog, updateAiTask, goals, updateGoalStatus, onCodeChangeGenerated, onCodebaseFileCreated, onSecurityFinding, addLogEntry, sendMessage]);


  // Orchestrator loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Check for pending goals without assigned tasks
      goals.filter(g => g.status === 'PENDING' || g.status === 'BLOCKED' || g.status === 'FAILING').forEach(goal => {
        const existingTasks = aiTasks.filter(t => t.goalId === goal.id && (t.status === 'QUEUED' || t.status === 'RUNNING'));
        if (existingTasks.length === 0) {
          // Assign a new task for a pending goal
          let taskType: AIProcessTask['type'] = 'CODE_GEN';
          let description = `Initiating code generation for goal: ${goal.text}`;

          if (goal.status === 'FAILING') {
            taskType = 'BUGFIX';
            description = `Analyzing failure for goal: ${goal.text}`;
          } else if (goal.category === 'SECURITY') {
            taskType = 'SECURITY_SCAN';
            description = `Performing security analysis for goal: ${goal.text}`;
          } else if (goal.category === 'COST') {
            taskType = 'COST_OPT';
            description = `Running cost optimization for goal: ${goal.text}`;
          } else if (goal.category === 'GOVERNANCE') {
            taskType = 'POLICY_ENFORCE';
            description = `Enforcing governance for goal: ${goal.text}`;
          }

          const availableAgent = agents.find(a => a.status === 'IDLE');
          if (availableAgent) {
            const newTask: AIProcessTask = {
              id: generateUniqueId(),
              goalId: goal.id,
              description,
              type: taskType,
              status: 'QUEUED',
              logs: [generateMockLogEntry('Orchestrator', 'INFO', `Task created for goal ${goal.id}`)],
              estimatedDurationMs: 5000 + Math.random() * 10000,
              agentId: availableAgent.id,
            };
            addAiTask(newTask);
            updateGoalStatus(goal.id, 'IN_PROGRESS');
            sendMessage('Orchestrator', availableAgent.id, 'TASK_ASSIGNMENT', { taskId: newTask.id, goalId: goal.id });
            addOrchestrationLog('Orchestrator', `Assigned task ${newTask.id} to ${availableAgent.id}`, { goalId: goal.id }, newTask.id);
          } else {
             // console.log("No idle agents to assign tasks.");
          }
        }
      });

      // Distribute queued tasks to idle agents
      const queuedTasks = aiTasks.filter(t => t.status === 'QUEUED');
      queuedTasks.forEach(task => {
        const assignedAgent = agents.find(a => a.id === task.agentId && a.status === 'IDLE');
        if (assignedAgent) {
          processAgentTask(assignedAgent, task);
        }
      });

      // Simulate agents self-monitoring and reporting
      agents.filter(a => a.skills.some(s => s.type === 'MONITORING' && s.isActive) && a.status === 'IDLE' && Math.random() < 0.3).forEach(agent => {
        const monitorTask: AIProcessTask = {
          id: generateUniqueId(),
          goalId: 'SYSTEM_HEALTH',
          description: `Agent ${agent.name} performing system health check.`,
          type: 'MONITOR',
          status: 'QUEUED',
          logs: [generateMockLogEntry(agent.name, 'INFO', `Initiating self-monitoring.`)],
          estimatedDurationMs: 2000 + Math.random() * 3000,
          agentId: agent.id,
        };
        addAiTask(monitorTask);
        sendMessage(agent.id, 'Orchestrator', 'STATUS_UPDATE', { message: 'Initiating self-monitoring task' });
      });

      // Basic processing of agent messages
      // This would be more complex with actual message queues
      setAgentMessages(prevMessages => {
        prevMessages.forEach(msg => {
          if (msg.receiverId === 'Orchestrator') {
            // Process orchestrator-bound messages
            if (msg.type === 'ALERT') {
              addLogEntry(generateMockLogEntry('Orchestrator', 'WARN', `Received ALERT from ${msg.senderId}: ${JSON.stringify(msg.content)}`));
              // Orchestrator could then assign remediation tasks
              addOrchestrationLog('Orchestrator', `Processed alert from ${msg.senderId}`, msg.content, msg.id);
            }
          }
        });
        return prevMessages.filter(msg => Date.now() - new Date(msg.timestamp).getTime() < 60000); // Keep messages for 1 min
      });

    }, 5000); // Orchestrator ticks every 5 seconds

    return () => clearInterval(interval);
  }, [agents, aiTasks, goals, addAiTask, updateAiTask, processAgentTask, updateGoalStatus, sendMessage, addLogEntry, addOrchestrationLog]);

  return { agents, aiTasks, agentMessages, orchestrationLogs, setAiTasks, setAgents, sendMessage };
};

/**
 * A custom hook to simulate Programmable Token Rail layer operations.
 * Business impact: Provides a simulated environment for managing digital assets, accounts, and atomic settlements.
 * How it generates long-term business value: Enables robust testing of programmable finance capabilities, ensuring integrity and efficiency of value transfers.
 */
export const useTokenRailSimulator = (
  initialAssets: TokenAsset[],
  initialAccounts: TokenAccount[],
  initialRails: SettlementRail[],
  initialPolicies: RoutingPolicy[],
  addAiTask: (task: AIProcessTask) => void,
  updateAiTask: (taskId: string, updates: Partial<AIProcessTask>) => void,
  addAuditLog: (log: AuditLogEntry) => void,
  currentAuditLogHash: string,
  digitalIdentities: DigitalIdentity[]
) => {
  const [tokenAssets, setTokenAssets] = useState<TokenAsset[]>(initialAssets);
  const [tokenAccounts, setTokenAccounts] = useState<TokenAccount[]>(initialAccounts);
  const [tokenTransactions, setTokenTransactions] = useState<TokenTransaction[]>([]);
  const [settlementRails] = useState<SettlementRail[]>(initialRails);
  const [routingPolicies] = useState<RoutingPolicy[]>(initialPolicies);
  const latestAuditLogHash = useRef(currentAuditLogHash);

  useEffect(() => {
    latestAuditLogHash.current = currentAuditLogHash;
  }, [currentAuditLogHash]);

  // Simulate creation of accounts for new identities
  useEffect(() => {
    digitalIdentities.forEach(identity => {
      tokenAssets.forEach(asset => {
        const existingAccount = tokenAccounts.find(acc => acc.ownerId === identity.id && acc.assetId === asset.id);
        if (!existingAccount) {
          setTokenAccounts(prev => [...prev, generateMockTokenAccount(identity.id, asset.id, 1000)]); // Give new accounts some initial balance
          addAuditLog(generateMockAuditLogEntry('IDENTITY_EVENT', identity.id, { action: 'Account_Created', assetId: asset.id }, identity.id, latestAuditLogHash.current));
        }
      });
    });
  }, [digitalIdentities, tokenAssets, tokenAccounts, addAuditLog]);


  const routeTransaction = useCallback((tx: TokenTransaction): SettlementRail | undefined => {
    // Simple heuristic routing: prioritize fast, then secure, then low cost
    // A real system would evaluate 'criteria' string from RoutingPolicy
    const suitableRails = settlementRails.filter(rail =>
      rail.isActive && rail.supportedAssets.includes(tx.assetId)
    );

    // Apply routing policies
    for (const policy of routingPolicies.sort((a, b) => b.priority - a.priority)) {
      // For simulation, we'll simplify policy criteria evaluation
      if (tx.amount > 1000 && policy.name.includes('HighValueFast')) {
        return suitableRails.find(r => r.id === policy.preferredRailIds[0]);
      }
      if (policy.name.includes('DefaultLowCost')) {
        return suitableRails.find(r => r.id === policy.preferredRailIds[0]);
      }
    }

    // Fallback to fastest available if no policy matches
    return suitableRails.sort((a, b) => a.latencyMs - b.latencyMs)[0];
  }, [settlementRails, routingPolicies]);

  const processTokenTransaction = useCallback(async (transaction: TokenTransaction) => {
    addAiTask({
      id: generateUniqueId(),
      goalId: 'TOKEN_RAIL',
      description: `Processing token transaction: ${transaction.id.substring(0, 8)}`,
      type: 'SETTLEMENT',
      status: 'RUNNING',
      startedAt: formatTimestamp(new Date()),
      logs: [generateMockLogEntry('TokenRail', 'INFO', `Initiating transaction ${transaction.id.substring(0, 8)}`)],
      estimatedDurationMs: 1000,
    });

    setTokenTransactions(prev => [...prev, { ...transaction, status: 'PENDING' }]);
    addAuditLog(generateMockAuditLogEntry('TRANSACTION', transaction.id, { type: transaction.type, status: 'PENDING' }, transaction.senderAccountId || 'System', latestAuditLogHash.current));

    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate validation

    const senderAccount = transaction.senderAccountId ? tokenAccounts.find(acc => acc.id === transaction.senderAccountId) : null;
    const receiverAccount = transaction.receiverAccountId ? tokenAccounts.find(acc => acc.id === transaction.receiverAccountId) : null;
    const asset = tokenAssets.find(a => a.id === transaction.assetId);

    if (!asset) {
      updateAiTask(transaction.id, { status: 'FAILED', output: 'Invalid asset.' });
      setTokenTransactions(prev => prev.map(tx => tx.id === transaction.id ? { ...tx, status: 'FAILED' } : tx));
      addAuditLog(generateMockAuditLogEntry('TRANSACTION', transaction.id, { type: transaction.type, status: 'FAILED', reason: 'Invalid Asset' }, transaction.senderAccountId || 'System', latestAuditLogHash.current));
      return;
    }

    let success = true;
    let failureReason = '';

    setTokenAccounts(prev => prev.map(acc => {
        if (acc.id === senderAccount?.id && transaction.type === 'TRANSFER' && acc.balance < transaction.amount) {
            success = false;
            failureReason = 'Insufficient funds';
            return acc;
        }
        return acc;
    }));

    if (!success) {
      updateAiTask(transaction.id, { status: 'FAILED', output: `Transaction failed: ${failureReason}` });
      setTokenTransactions(prev => prev.map(tx => tx.id === transaction.id ? { ...tx, status: 'FAILED' } : tx));
      addAuditLog(generateMockAuditLogEntry('TRANSACTION', transaction.id, { type: transaction.type, status: 'FAILED', reason: failureReason }, transaction.senderAccountId || 'System', latestAuditLogHash.current));
      return;
    }

    // Determine settlement rail
    const selectedRail = routeTransaction(transaction);
    if (!selectedRail) {
      updateAiTask(transaction.id, { status: 'FAILED', output: 'No suitable settlement rail found.' });
      setTokenTransactions(prev => prev.map(tx => tx.id === transaction.id ? { ...tx, status: 'FAILED' } : tx));
      addAuditLog(generateMockAuditLogEntry('TRANSACTION', transaction.id, { type: transaction.type, status: 'FAILED', reason: 'No Rail' }, transaction.senderAccountId || 'System', latestAuditLogHash.current));
      return;
    }

    await new Promise(resolve => setTimeout(resolve, selectedRail.latencyMs)); // Simulate settlement time

    setTokenAccounts(prev => prev.map(acc => {
      if (transaction.type === 'MINT' && acc.id === receiverAccount?.id) {
        return { ...acc, balance: acc.balance + transaction.amount, lastUpdateTimestamp: formatTimestamp(new Date()) };
      }
      if (transaction.type === 'BURN' && acc.id === senderAccount?.id) {
        return { ...acc, balance: acc.balance - transaction.amount, lastUpdateTimestamp: formatTimestamp(new Date()) };
      }
      if (transaction.type === 'TRANSFER') {
        if (acc.id === senderAccount?.id) {
          return { ...acc, balance: acc.balance - transaction.amount, lastUpdateTimestamp: formatTimestamp(new Date()) };
        }
        if (acc.id === receiverAccount?.id) {
          return { ...acc, balance: acc.balance + transaction.amount, lastUpdateTimestamp: formatTimestamp(new Date()) };
        }
      }
      return acc;
    }));

    setTokenTransactions(prev => prev.map(tx =>
      tx.id === transaction.id ? { ...tx, status: 'COMMITTED', settlementRailId: selectedRail.id } : tx
    ));
    updateAiTask(transaction.id, {
      status: 'COMPLETED',
      completedAt: formatTimestamp(new Date()),
      output: `Transaction ${transaction.id.substring(0, 8)} committed via ${selectedRail.name}.`,
      artifacts: [{ type: 'TOKEN_TXN', content: { txId: transaction.id, rail: selectedRail.id } }],
    });
    addAuditLog(generateMockAuditLogEntry('TRANSACTION', transaction.id, { type: transaction.type, status: 'COMMITTED', rail: selectedRail.name }, transaction.senderAccountId || 'System', latestAuditLogHash.current));


  }, [addAiTask, tokenAccounts, tokenAssets, updateAiTask, settlementRails, routingPolicies, addAuditLog]);

  const handleMintBurnTransfer = useCallback((type: 'MINT' | 'BURN' | 'TRANSFER', assetId: string, amount: number, fromAccountId?: string, toAccountId?: string) => {
    const transaction = generateMockTokenTransaction(type, assetId, amount, fromAccountId, toAccountId);
    processTokenTransaction(transaction);
  }, [processTokenTransaction]);

  return {
    tokenAssets,
    tokenAccounts,
    tokenTransactions,
    settlementRails,
    routingPolicies,
    handleMintBurnTransfer,
  };
};

/**
 * A custom hook to simulate Digital Identity and Trust layer operations.
 * Business impact: Provides a simulated environment for managing digital identities, cryptographic keys, and authorization policies.
 * How it generates long-term business value: Enables robust testing of authentication and authorization workflows, strengthening the platform's security foundation.
 */
export const useDigitalIdentitySimulator = (
  initialIdentities: DigitalIdentity[],
  initialPolicies: AuthorizationPolicy[],
  addAuditLog: (log: AuditLogEntry) => void,
  addAccessLog: (log: AccessLogEntry) => void,
  currentAuditLogHash: string,
  currentAccessLogHash: string
) => {
  const [digitalIdentities, setDigitalIdentities] = useState<DigitalIdentity[]>(initialIdentities);
  const [authorizationPolicies, setAuthorizationPolicies] = useState<AuthorizationPolicy[]>(initialPolicies);
  const [accessLogs, setAccessLogs] = useState<AccessLogEntry[]>([]);
  const latestAuditLogHash = useRef(currentAuditLogHash);
  const latestAccessLogHash = useRef(currentAccessLogHash);

  useEffect(() => {
    latestAuditLogHash.current = currentAuditLogHash;
  }, [currentAuditLogHash]);

  useEffect(() => {
    latestAccessLogHash.current = currentAccessLogHash;
  }, [currentAccessLogHash]);

  const addAccessLogEntry = useCallback((identityId: string, action: string, resourceId: string, status: AccessLogEntry['status'], policyId?: string) => {
    setAccessLogs(prev => {
      const prevHash = prev.length > 0 ? prev[prev.length - 1].integrityHash : '';
      const newLog = {
        id: generateUniqueId(),
        timestamp: formatTimestamp(new Date()),
        identityId,
        action,
        resourceId,
        status,
        policyId,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`, // Mock IP
        integrityHash: generateMockHash(`${prevHash}-${identityId}-${action}-${resourceId}-${status}-${policyId}`),
        signature: generateMockSignature(`${identityId}-${action}`, 'IDENTITY_SERVICE'),
      };
      addAuditLog(generateMockAuditLogEntry('IDENTITY_EVENT', identityId, { action: 'AccessLog', status: newLog.status }, identityId, latestAuditLogHash.current));
      return [...prev, newLog];
    });
  }, [addAuditLog]);

  const authenticate = useCallback((identityId: string, signature: string, data: string): boolean => {
    const identity = digitalIdentities.find(id => id.id === identityId);
    if (!identity) {
      addAccessLogEntry(identityId, 'authenticate', `ID:${identityId}`, 'FAILURE');
      return false;
    }
    // In a real system, verify signature against identity.publicKey
    // For simulation, we'll assume a valid signature if identity exists.
    const isValidSignature = signature.startsWith('sig_') && data.length > 10; // Basic mock check

    if (isValidSignature && identity.status === 'ACTIVE') {
      addAccessLogEntry(identityId, 'authenticate', `ID:${identityId}`, 'SUCCESS');
      return true;
    } else {
      addAccessLogEntry(identityId, 'authenticate', `ID:${identityId}`, 'FAILURE');
      return false;
    }
  }, [digitalIdentities, addAccessLogEntry]);

  const authorize = useCallback((identityId: string, action: string, resource: string): boolean => {
    const identity = digitalIdentities.find(id => id.id === identityId);
    if (!identity) {
      addAccessLogEntry(identityId, action, resource, 'DENIED', 'N/A: Identity not found');
      return false;
    }

    let isAuthorized = false;
    let policyMatched: AuthorizationPolicy | undefined;

    // Simplified RBAC logic based on identity type and a mock role system
    const effectiveRoles = [identity.entityType, `ROLE_${identity.entityType}`];
    if (identity.entityType === 'AI_AGENT' && identityId.includes('AgentAlpha')) {
      effectiveRoles.push('DEVELOPER');
    }
    if (identity.entityType === 'PERSON' && identity.name.includes('Alice')) {
      effectiveRoles.push('INVESTOR');
    }

    for (const policy of authorizationPolicies) {
      if (!policy.isActive) continue;
      if (resource.startsWith(policy.targetResource) && policy.allowRoles.some(role => effectiveRoles.includes(role))) {
        // More complex condition evaluation would go here
        // e.g., eval(policy.conditions)
        isAuthorized = true;
        policyMatched = policy;
        break;
      }
    }

    if (isAuthorized) {
      addAccessLogEntry(identityId, action, resource, 'SUCCESS', policyMatched?.id);
      return true;
    } else {
      addAccessLogEntry(identityId, action, resource, 'DENIED', policyMatched?.id || 'NO_MATCH');
      return false;
    }
  }, [digitalIdentities, authorizationPolicies, addAccessLogEntry]);

  return {
    digitalIdentities,
    authorizationPolicies,
    accessLogs,
    authenticate,
    authorize,
  };
};

/**
 * A custom hook to simulate the Real-Time Settlement and Payments Engine operations.
 * Business impact: Processes payment requests, performs real-time balance validation, and routes transactions for optimal efficiency.
 * How it generates long-term business value: Guarantees rapid, secure, and idempotent value transfers, crucial for high-volume financial platforms.
 */
export const usePaymentEngineSimulator = (
  digitalIdentities: DigitalIdentity[],
  tokenAccounts: TokenAccount[],
  processTokenTransaction: (tx: TokenTransaction) => Promise<void>,
  addAuditLog: (log: AuditLogEntry) => void,
  currentAuditLogHash: string,
  addRiskAssessment: (assessment: RiskAssessment) => void,
  settlementRails: SettlementRail[],
  routingPolicies: RoutingPolicy[],
) => {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [settlementTransactions, setSettlementTransactions] = useState<SettlementTransaction[]>([]);
  const [settlementConfirmations, setSettlementConfirmations] = useState<SettlementConfirmation[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const latestAuditLogHash = useRef(currentAuditLogHash);

  useEffect(() => {
    latestAuditLogHash.current = currentAuditLogHash;
  }, [currentAuditLogHash]);

  const addRisk = useCallback((assessment: RiskAssessment) => {
    setRiskAssessments(prev => [...prev, assessment]);
    addRiskAssessment(assessment); // Call the parent state update
    addAuditLog(generateMockAuditLogEntry('RISK_ASSESSMENT', assessment.targetId, { score: assessment.score, severity: assessment.severity }, assessment.decisionByAgentId || 'System', latestAuditLogHash.current));
  }, [addAuditLog, addRiskAssessment]);

  const routeSettlement = useCallback((amount: number, assetId: string): SettlementRail | undefined => {
    // Advanced predictive routing logic (simplified heuristic)
    // Here, we could use historical data (mocked) to prefer rails
    // For now, we'll use a weighted random choice or policy-based
    const availableRails = settlementRails.filter(rail => rail.isActive && rail.supportedAssets.includes(assetId));
    if (availableRails.length === 0) return undefined;

    // Apply routing policies
    for (const policy of routingPolicies.sort((a, b) => b.priority - a.priority)) {
      // Simplified: If amount is high, prefer secure/fast. Otherwise, prefer low cost.
      if (amount > 5000 && policy.criteria.includes('amount > 1000')) {
        const preferred = availableRails.find(r => r.id === policy.preferredRailIds[0]);
        if (preferred) return preferred;
      }
      if (policy.criteria === 'true' && policy.name.includes('DefaultLowCost')) {
        const defaultRail = availableRails.find(r => r.id === policy.preferredRailIds[0]);
        if (defaultRail) return defaultRail;
      }
    }

    // Fallback: choose randomly or by highest security
    return pickRandom(availableRails);
  }, [settlementRails, routingPolicies]);

  const initiatePayment = useCallback(async (payerId: string, payeeId: string, assetId: string, amount: number) => {
    const paymentRequest = generateMockPaymentRequest(payerId, payeeId, assetId, amount);
    setPaymentRequests(prev => [...prev, { ...paymentRequest, status: 'PENDING_VALIDATION' }]);
    addAuditLog(generateMockAuditLogEntry('PAYMENT_REQUEST', paymentRequest.id, { payer: payerId, payee: payeeId, amount }, payerId, latestAuditLogHash.current));

    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate initial validation

    // 1. Digital Identity Validation
    const payerIdentity = digitalIdentities.find(id => id.id === payerId);
    const payeeIdentity = digitalIdentities.find(id => id.id === payeeId);
    if (!payerIdentity || !payeeIdentity || payerIdentity.status !== 'ACTIVE' || payeeIdentity.status !== 'ACTIVE') {
      setPaymentRequests(prev => prev.map(req => req.id === paymentRequest.id ? { ...req, status: 'REJECTED' } : req));
      addAuditLog(generateMockAuditLogEntry('PAYMENT_REQUEST', paymentRequest.id, { status: 'REJECTED', reason: 'Invalid Identity' }, payerId, latestAuditLogHash.current));
      return;
    }

    // 2. Balance Validation
    const payerAccount = tokenAccounts.find(acc => acc.ownerId === payerId && acc.assetId === assetId);
    if (!payerAccount || payerAccount.balance < amount) {
      setPaymentRequests(prev => prev.map(req => req.id === paymentRequest.id ? { ...req, status: 'REJECTED' } : req));
      addAuditLog(generateMockAuditLogEntry('PAYMENT_REQUEST', paymentRequest.id, { status: 'REJECTED', reason: 'Insufficient Funds' }, payerId, latestAuditLogHash.current));
      return;
    }

    // 3. Risk Scoring
    const risk = generateMockRiskAssessment(paymentRequest.id, 'PAYMENT_REQUEST');
    addRisk(risk);

    if (risk.recommendation === 'BLOCK') {
      setPaymentRequests(prev => prev.map(req => req.id === paymentRequest.id ? { ...req, status: 'REJECTED' } : req));
      addAuditLog(generateMockAuditLogEntry('PAYMENT_REQUEST', paymentRequest.id, { status: 'REJECTED', reason: 'High Risk' }, payerId, latestAuditLogHash.current));
      return;
    }

    // 4. Routing Decision
    const selectedRail = routeSettlement(amount, assetId);
    if (!selectedRail) {
      setPaymentRequests(prev => prev.map(req => req.id === paymentRequest.id ? { ...req, status: 'REJECTED' } : req));
      addAuditLog(generateMockAuditLogEntry('PAYMENT_REQUEST', paymentRequest.id, { status: 'REJECTED', reason: 'No Settlement Rail' }, payerId, latestAuditLogHash.current));
      return;
    }

    setPaymentRequests(prev => prev.map(req => req.id === paymentRequest.id ? { ...req, status: 'APPROVED' } : req));

    // 5. Initiate Settlement Transaction on Token Rail
    const settlementTx = generateMockSettlementTransaction(paymentRequest.id, payerId, payeeId, assetId, amount);
    setSettlementTransactions(prev => [...prev, { ...settlementTx, status: 'ROUTING', settlementRailUsed: selectedRail.id }]);
    addAuditLog(generateMockAuditLogEntry('SETTLEMENT_TXN', settlementTx.id, { status: 'ROUTING', rail: selectedRail.id }, 'SETTLEMENT_ENGINE', latestAuditLogHash.current));

    // Simulate token rail processing
    const tokenTransferTx = generateMockTokenTransaction('TRANSFER', assetId, amount, payerAccount.id, tokenAccounts.find(acc => acc.ownerId === payeeId && acc.assetId === assetId)?.id);
    await processTokenTransaction(tokenTransferTx);

    // After token transaction, update settlement transaction status
    const tokenTx = tokenTransferTx; // assume this is the token transaction that just completed
    if (tokenTx.status === 'COMMITTED') {
      setSettlementTransactions(prev => prev.map(tx => tx.id === settlementTx.id ? { ...tx, status: 'COMPLETED' } : tx));
      const confirmation = generateMockSettlementConfirmation(paymentRequest.id, tokenTx.id, selectedRail.id, amount);
      setSettlementConfirmations(prev => [...prev, confirmation]);
      setPaymentRequests(prev => prev.map(req => req.id === paymentRequest.id ? { ...req, status: 'SETTLED' } : req));
      addAuditLog(generateMockAuditLogEntry('SETTLEMENT_TXN', settlementTx.id, { status: 'COMPLETED', confirmationId: confirmation.id }, 'SETTLEMENT_ENGINE', latestAuditLogHash.current));

    } else {
      setSettlementTransactions(prev => prev.map(tx => tx.id === settlementTx.id ? { ...tx, status: 'FAILED' } : tx));
      setPaymentRequests(prev => prev.map(req => req.id === paymentRequest.id ? { ...req, status: 'REJECTED' } : req));
      addAuditLog(generateMockAuditLogEntry('SETTLEMENT_TXN', settlementTx.id, { status: 'FAILED', reason: 'Token transfer failed' }, 'SETTLEMENT_ENGINE', latestAuditLogHash.current));
    }

  }, [digitalIdentities, tokenAccounts, processTokenTransaction, addAuditLog, addRisk, routeSettlement, settlementRails, routingPolicies]);

  return {
    paymentRequests,
    settlementTransactions,
    settlementConfirmations,
    riskAssessments,
    initiatePayment,
  };
};

/**
 * A custom hook to simulate Governance, Observability, and Integrity layer operations.
 * Business impact: Enforces policies, maintains immutable audit logs, and controls access, ensuring the financial platform's compliance and security.
 * How it generates long-term business value: Minimizes regulatory and operational risks, builds trust through transparency, and provides verifiable accountability for all system actions.
 */
export const useGovernanceSimulator = (
  initialPolicies: Policy[],
  initialAccessControls: RoleBasedAccessControl[]
) => {
  const [policies, setPolicies] = useState<Policy[]>(initialPolicies);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [accessControls, setAccessControls] = useState<RoleBasedAccessControl[]>(initialAccessControls);
  const auditLogRef = useRef<AuditLogEntry[]>([]);

  // Update ref whenever auditLogs changes
  useEffect(() => {
    auditLogRef.current = auditLogs;
  }, [auditLogs]);

  const addAuditLog = useCallback((newLog: AuditLogEntry) => {
    setAuditLogs(prev => {
      // Ensure cryptographic chain is maintained
      const prevHash = prev.length > 0 ? prev[prev.length - 1].integrityChainHash : 'GENESIS_HASH';
      const chainedLog = { ...newLog, integrityChainHash: generateMockHash(`${prevHash}-${JSON.stringify(newLog.details)}-${newLog.originatorId}`) };
      return [...prev, chainedLog];
    });
  }, []);

  const enforcePolicy = useCallback((policyId: string, context: Record<string, any>): 'ALLOW' | 'FLAG_FOR_REVIEW' | 'BLOCK' | 'AUTO_REMEDIATE' => {
    const policy = policies.find(p => p.id === policyId);
    if (!policy || !policy.isActive) return 'ALLOW';

    let violationDetected = false;
    for (const rule of policy.ruleSet) {
      // Very simplified rule evaluation for simulation
      if (rule.includes("Transaction amount > $10000") && (context.amount || 0) > 10000) {
        violationDetected = true;
        break;
      }
      if (rule.includes("Critical security finding") && (context.severity === 'CRITICAL')) {
        violationDetected = true;
        break;
      }
    }

    if (violationDetected) {
      addAuditLog(generateMockAuditLogEntry('POLICY_VIOLATION', policyId, { context, outcome: policy.enforcementAction }, 'POLICY_ENGINE', auditLogs[auditLogs.length - 1]?.integrityChainHash || 'GENESIS_HASH'));
      return policy.enforcementAction;
    }
    return 'ALLOW';
  }, [policies, addAuditLog, auditLogs]); // Dependency on auditLogs to get latest hash

  const checkAccess = useCallback((role: string, resource: string, action: RoleBasedAccessControl['action']): boolean => {
    return accessControls.some(ac =>
      ac.isAllowed && ac.role === role && ac.resource === resource && (ac.action === action || ac.action === 'ALL')
    );
  }, [accessControls]);

  const getLatestAuditLogChainHash = useCallback(() => {
    return auditLogRef.current.length > 0 ? auditLogRef.current[auditLogRef.current.length - 1].integrityChainHash : 'GENESIS_HASH';
  }, []);

  return {
    policies,
    auditLogs,
    accessControls,
    addAuditLog,
    enforcePolicy,
    checkAccess,
    getLatestAuditLogChainHash,
  };
};


/**
 * A comprehensive view of the entire self-rewriting codebase system.
 * Business impact: Serves as the operational hub for the next-generation financial infrastructure, offering real-time intelligence and control.
 * How it generates long-term business value: Unifies AI-driven development with core financial operations, enabling unprecedented agility, security, and scalability for enterprise clients.
 */
const SelfRewritingCodebaseView: React.FC = () => {
  // --- Global State Management ---
  const [goals, setGoals] = useState<Goal[]>([
    { id: "g1", text: "API response time should be under 50ms p95.", status: 'PASSING', priority: 'CRITICAL', dependencies: [], category: 'PERFORMANCE', lastUpdated: formatTimestamp(new Date()) },
    { id: "g2", text: "Implement OAuth2 login for user authentication.", status: 'PENDING', priority: 'HIGH', dependencies: [], category: 'FEATURE', assignedAgent: 'AgentAlpha', progressPercentage: 0, eta: '2 days' },
    { id: "g3", text: "Refactor data access layer to use ORM.", status: 'IN_PROGRESS', priority: 'MEDIUM', dependencies: [], category: 'MAINTENANCE', assignedAgent: 'AgentBeta', progressPercentage: 40, lastUpdated: formatTimestamp(new Date(Date.now() - 3600000)) },
    { id: "g4", text: "Fix critical security vulnerability in user registration.", status: 'BLOCKED', priority: 'CRITICAL', dependencies: ['g2'], category: 'SECURITY', assignedAgent: 'AgentAlpha', progressPercentage: 0, eta: '5 days' },
    { id: "g5", text: "Reduce cloud infrastructure costs by 15%.", status: 'PENDING', priority: 'HIGH', dependencies: [], category: 'COST', assignedAgent: 'AgentGamma', progressPercentage: 0, eta: '7 days' },
    { id: "g6", text: "Ensure all token transactions adhere to AML policy.", status: 'PENDING', priority: 'CRITICAL', dependencies: [], category: 'GOVERNANCE', assignedAgent: 'AgentDelta', progressPercentage: 0, eta: '3 days', policyContext: [initialPolicies[0].id] },
  ]);
  const [newGoalText, setNewGoalText] = useState('');
  const [isEvolving, setIsEvolving] = useState(false);
  const [evolvingGoalId, setEvolvingGoalId] = useState<string | null>(null);

  const [aiTasks, setAiTasks] = useState<AIProcessTask[]>([]);
  const [codebaseFiles, setCodebaseFiles] = useState<CodeFile[]>(initialFiles);
  const [metrics, setMetrics] = useState<Metric[]>(initialMetrics);
  const [deployments, setDeployments] = useState<DeploymentStatus[]>([]);
  const [securityFindings, setSecurityFindings] = useState<SecurityFinding[]>([]);
  const [costReports, setCostReports] = useState<CostReport[]>([]);
  const [aiConfig, setAiConfig] = useState<AIAgentConfig>(initialAiConfig);
  const [userFeedback, setUserFeedback] = useState<UserFeedback[]>([]);
  const [codeChanges, setCodeChanges] = useState<CodeChange[]>([]);
  const [selectedFileForExplorer, setSelectedFileForExplorer] = useState<string | null>(initialFiles[0]?.id || null);

  const [knowledgeNodes, setKnowledgeNodes] = useState<KnowledgeNode[]>([]);
  const [knowledgeEdges, setKnowledgeEdges] = useState<KnowledgeEdge[]>([]);

  // --- New System States ---
  const [digitalIdentities, setDigitalIdentities] = useState<DigitalIdentity[]>(initialDigitalIdentities);
  const [allRiskAssessments, setAllRiskAssessments] = useState<RiskAssessment[]>([]);
  const [accessLogHistory, setAccessLogHistory] = useState<AccessLogEntry[]>([]);
  const currentAccessLogChainHash = useMemo(() => accessLogHistory.length > 0 ? accessLogHistory[accessLogHistory.length - 1].integrityHash : 'GENESIS_ACCESS_LOG', [accessLogHistory]);

  const addAccessLog = useCallback((log: AccessLogEntry) => {
    setAccessLogHistory(prev => [...prev, log]);
  }, []);

  const addRiskAssessment = useCallback((assessment: RiskAssessment) => {
    setAllRiskAssessments(prev => [...prev, assessment]);
  }, []);

  const mockApiDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

  // --- Governance Hook ---
  const {
    policies,
    auditLogs,
    accessControls,
    addAuditLog,
    enforcePolicy,
    checkAccess,
    getLatestAuditLogChainHash,
  } = useGovernanceSimulator(initialPolicies, [
    generateMockRoleBasedAccessControl('DEVELOPER', 'CodeFile', 'WRITE', true),
    generateMockRoleBasedAccessControl('AI_AGENT', 'CodeChange', 'READ', true),
    generateMockRoleBasedAccessControl('AI_AGENT', 'AIProcessTask', 'WRITE', true),
    generateMockRoleBasedAccessControl('HUMAN', 'CodeChange', 'APPROVE', true),
    generateMockRoleBasedAccessControl('FINANCIAL_ENGINE', 'TokenTransaction', 'EXECUTE', true),
    generateMockRoleBasedAccessControl('INVESTOR', 'TokenAccount', 'READ', true),
  ]);
  const currentAuditLogChainHash = useMemo(() => getLatestAuditLogChainHash(), [getLatestAuditLogChainHash]);

  // --- Digital Identity Hook ---
  const {
    digitalIdentities: identitiesFromHook,
    authorizationPolicies,
    accessLogs: identityAccessLogs,
    authenticate,
    authorize,
  } = useDigitalIdentitySimulator(initialDigitalIdentities, initialRoutingPolicies.map(p => ({
    id: generateUniqueId(),
    name: `Auth Policy for ${p.name}`,
    description: `Authorizes actions related to ${p.name}`,
    targetResource: `TokenAccount:transfer`,
    allowRoles: ['AI_AGENT', 'PERSON', 'ORGANIZATION'],
    isActive: true,
    version: 1,
    lastUpdated: formatTimestamp(new Date()),
  })), addAuditLog, addAccessLog, currentAuditLogChainHash, currentAccessLogChainHash);

  useEffect(() => {
    setDigitalIdentities(identitiesFromHook);
    setAccessLogHistory(identityAccessLogs);
  }, [identitiesFromHook, identityAccessLogs]);

  // --- Token Rail Hook ---
  const {
    tokenAssets,
    tokenAccounts,
    tokenTransactions,
    settlementRails,
    routingPolicies,
    handleMintBurnTransfer,
  } = useTokenRailSimulator(initialTokenAssets, initialDigitalIdentities.map(id => generateMockTokenAccount(id.id, initialTokenAssets[0].id, 10000)), initialSettlementRails, initialRoutingPolicies,
    (task) => setAiTasks(prev => [...prev, task]),
    (id, updates) => setAiTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t)),
    addAuditLog, currentAuditLogChainHash, digitalIdentities
  );

  // --- Payment Engine Hook ---
  const {
    paymentRequests,
    settlementTransactions,
    settlementConfirmations,
    riskAssessments,
    initiatePayment,
  } = usePaymentEngineSimulator(
    digitalIdentities,
    tokenAccounts,
    (tx) => new Promise(resolve => { // Wrap processTokenTransaction for async hook usage
      handleMintBurnTransfer(tx.type, tx.assetId, tx.amount, tx.senderAccountId, tx.receiverAccountId);
      setTimeout(resolve, 1000); // Simulate completion time
    }),
    addAuditLog, currentAuditLogChainHash,
    addRiskAssessment,
    settlementRails, routingPolicies
  );

  // --- AI Orchestrator Hook ---
  const {
    agents,
    aiTasks: orchestratedAiTasks,
    agentMessages,
    orchestrationLogs,
    setAiTasks: setAiTasksFromOrchestrator,
    setAgents,
    sendMessage,
  } = useAgentOrchestrator(
    initialAgents,
    aiTasks, // Pass global aiTasks for orchestrator to manage
    metrics, goals,
    useCallback((id, status) => setGoals(prev => prev.map(g => g.id === id ? { ...g, status, lastUpdated: formatTimestamp(new Date()) } : g)), []),
    useCallback((task) => setAiTasks(prev => [...prev, task]), []),
    useCallback((taskId, updates) => setAiTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t)), []),
    useCallback((log) => setAiTasks(prev => prev.map(t => t.id === log.context?.taskId ? { ...t, logs: [...t.logs, log] } : t)), []), // Add to existing task logs
    useCallback((task, file) => {
      const newChange = generateMockCodeChange(task.id, file);
      setCodeChanges(prev => [...prev, newChange]);
      return newChange;
    }, []),
    useCallback((file) => setCodebaseFiles(prev => [...prev, file]), []),
    useCallback((finding) => setSecurityFindings(prev => [...prev, finding]), []),
    aiConfig,
    currentAuditLogChainHash
  );

  // Sync AI Tasks from orchestrator back to global state
  useEffect(() => {
    setAiTasks(orchestratedAiTasks);
  }, [orchestratedAiTasks]);


  // --- Core Logic & Event Handlers ---

  const handleAddGoal = useCallback(async () => {
    if (!newGoalText) return;

    const newGoalObj: Goal = {
      id: generateUniqueId(),
      text: newGoalText,
      status: 'PENDING',
      priority: pickRandom(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
      dependencies: [],
      category: pickRandom(['FEATURE', 'PERFORMANCE', 'SECURITY', 'MAINTENANCE', 'BUGFIX', 'GOVERNANCE', 'COST']),
      assignedAgent: pickRandom(agents.map(a => a.id)),
      progressPercentage: 0,
      lastUpdated: formatTimestamp(new Date()),
      eta: pickRandom(['1 day', '2 days', '1 week', '2 weeks']),
    };

    setGoals(prev => [...prev, newGoalObj]);
    setNewGoalText('');
    setIsEvolving(true);
    setEvolvingGoalId(newGoalObj.id);

    addAuditLog(generateMockAuditLogEntry('CONFIGURATION_CHANGE', newGoalObj.id, { action: 'Goal_Added', goal: newGoalObj.text }, 'HUMAN', currentAuditLogChainHash));

    // The orchestrator hook will pick up this new 'PENDING' goal and assign tasks
    // No direct task creation here, orchestrator takes over.

    await mockApiDelay(1000); // Simulate UI update time
    setIsEvolving(false);
    setEvolvingGoalId(null);
  }, [newGoalText, agents, addAuditLog, currentAuditLogChainHash]);

  const handleUpdateGoalStatus = useCallback((id: string, status: Goal['status']) => {
    setGoals(prev => {
      const updatedGoals = prev.map(g => g.id === id ? { ...g, status, lastUpdated: formatTimestamp(new Date()) } : g);
      addAuditLog(generateMockAuditLogEntry('CONFIGURATION_CHANGE', id, { action: 'Goal_Status_Update', newStatus: status }, 'HUMAN', currentAuditLogChainHash));
      return updatedGoals;
    });
  }, [addAuditLog, currentAuditLogChainHash]);

  const handleUpdateFindingStatus = useCallback((id: string, status: SecurityFinding['status']) => {
    setSecurityFindings(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    addAuditLog(generateMockAuditLogEntry('SECURITY_EVENT', id, { action: 'Finding_Status_Update', newStatus: status }, 'HUMAN', currentAuditLogChainHash));
  }, [addAuditLog, currentAuditLogChainHash]);

  const handleUpdateAiConfig = useCallback((newConfig: AIAgentConfig) => {
    setAiConfig(newConfig);
    // Simulate AI reacting to config change
    setAiTasks(prev => [...prev, {
      id: generateUniqueId(),
      goalId: 'SYSTEM',
      description: `AI configuration updated by user. Applying new parameters for ${newConfig.name}.`,
      type: 'MONITOR',
      status: 'COMPLETED',
      startedAt: formatTimestamp(new Date()),
      completedAt: formatTimestamp(new Date(Date.now() + 500)),
      logs: [generateMockLogEntry('AI_CONFIG_SERVICE', 'INFO')],
      estimatedDurationMs: 500,
    }]);
    addAuditLog(generateMockAuditLogEntry('CONFIGURATION_CHANGE', newConfig.agentId, { action: 'Agent_Config_Update', config: newConfig }, 'HUMAN', currentAuditLogChainHash));
  }, [addAuditLog, currentAuditLogChainHash]);

  const handleSubmitUserFeedback = useCallback((feedback: Omit<UserFeedback, 'id' | 'timestamp'>) => {
    const newFeedback = { ...feedback, id: generateUniqueId(), timestamp: formatTimestamp(new Date()), userId: digitalIdentities[0]?.id || 'ANONYMOUS' };
    setUserFeedback(prev => [...prev, newFeedback]);
    // Simulate AI processing feedback
    setAiTasks(prev => [...prev, {
      id: generateUniqueId(),
      goalId: newFeedback.goalId || 'N/A',
      description: `Processing user feedback (Rating: ${newFeedback.rating}/5, Type: ${newFeedback.type})`,
      type: 'DOCUMENTATION', // Or an 'ADAPTATION' type
      status: 'RUNNING',
      startedAt: formatTimestamp(new Date()),
      logs: [generateMockLogEntry('AI_FEEDBACK_PROCESSOR', 'INFO')],
      estimatedDurationMs: 2000,
      agentId: 'AgentAlpha',
    }]);
    setTimeout(() => {
      setAiTasks(prev => prev.map(task =>
        task.description.includes('Processing user feedback') && task.status === 'RUNNING'
          ? { ...task, status: 'COMPLETED', completedAt: formatTimestamp(new Date()) } : task
      ));
    }, 2000);
    addAuditLog(generateMockAuditLogEntry('USER_INTERACTION', newFeedback.id, { action: 'Feedback_Submitted', type: newFeedback.type, rating: newFeedback.rating }, newFeedback.userId, currentAuditLogChainHash));
  }, [addAuditLog, currentAuditLogChainHash, digitalIdentities]);

  const handleApproveChange = useCallback(async (changeId: string) => {
    setCodeChanges(prev => prev.map(c => c.id === changeId ? { ...c, status: 'APPROVED', approved: true, reviewer: 'HUMAN', timestamp: formatTimestamp(new Date()) } : c));
    
    // Find the change and associated goal
    const approvedChange = codeChanges.find(c => c.id === changeId);
    if (!approvedChange) return;

    const relatedTask = aiTasks.find(t => t.id === approvedChange.taskId);
    const relatedGoalId = relatedTask?.goalId;

    if (relatedGoalId) {
      setGoals(prev => prev.map(g => g.id === relatedGoalId ? { ...g, progressPercentage: (g.progressPercentage || 0) + 20, lastUpdated: formatTimestamp(new Date()) } : g));
      addAuditLog(generateMockAuditLogEntry('CODE_CHANGE', changeId, { action: 'Change_Approved', goalId: relatedGoalId }, 'HUMAN', currentAuditLogChainHash));

      // Simulate applying changes and running tests
      const applyTaskId = generateUniqueId();
      setAiTasks(prev => [...prev, {
        id: applyTaskId,
        goalId: relatedGoalId,
        description: `Applying approved code changes for goal ${relatedGoalId.substring(0, 8)}`,
        type: 'CODE_REF_FACTOR', // Can be 'DEPLOY' or 'CODE_APPLY'
        status: 'RUNNING',
        startedAt: formatTimestamp(new Date()),
        logs: [generateMockLogEntry('VCS_INTEGRATION', 'INFO')],
        estimatedDurationMs: 2000,
        agentId: pickRandom(agents.map(a => a.id)),
      }]);
      await mockApiDelay(2000);

      // Update codebaseFiles with the approved change
      setCodebaseFiles(prev => prev.map(file =>
        file.id === approvedChange.fileId ? { ...file, content: approvedChange.newContent, version: file.version + 1, lastModified: formatTimestamp(new Date()), hash: generateMockHash(approvedChange.newContent) } : file
      ));
      setCodeChanges(prev => prev.map(c => c.id === changeId ? { ...c, status: 'APPLIED', timestamp: formatTimestamp(new Date()) } : c));

      setAiTasks(prev => prev.map(task =>
        task.id === applyTaskId ? { ...task, status: 'COMPLETED', completedAt: formatTimestamp(new Date()) } : task
      ));

      const testRunTaskId = generateUniqueId();
      setAiTasks(prev => [...prev, {
        id: testRunTaskId,
        goalId: relatedGoalId,
        description: `Running tests after applying changes for goal ${relatedGoalId.substring(0, 8)}`,
        type: 'TEST_EXEC',
        status: 'RUNNING',
        startedAt: formatTimestamp(new Date()),
        logs: [generateMockLogEntry('TEST_RUNNER', 'INFO')],
        estimatedDurationMs: 4000,
        agentId: pickRandom(agents.map(a => a.id)),
      }]);
      await mockApiDelay(4000);

      const testResults = [generateMockTestResult(approvedChange.fileId, pickRandom(['PASSED', 'PASSED', 'FAILED']))];
      // Here you'd update goal status based on test results
      const allTestsPassed = testResults.every(tr => tr.status === 'PASSED');

      setAiTasks(prev => prev.map(task =>
        task.id === testRunTaskId ? {
          ...task,
          status: 'COMPLETED',
          completedAt: formatTimestamp(new Date()),
          output: `Tests completed. Status: ${allTestsPassed ? 'PASSED' : 'FAILED'}`,
          artifacts: [{ type: 'REPORT', content: testResults }]
        } : task
      ));

      if (allTestsPassed) {
        setGoals(prev => prev.map(g => g.id === relatedGoalId ? { ...g, status: 'PASSING', progressPercentage: 100, lastUpdated: formatTimestamp(new Date()) } : g));

        // Simulate deployment
        let deploymentApprovalNeeded = false;
        if (aiConfig.deploymentStrategy === 'MANUAL_APPROVAL' || aiConfig.deploymentStrategy === 'GOVERNED_ROLLOUT') {
          deploymentApprovalNeeded = true;
          const policyOutcome = enforcePolicy(initialPolicies[2].id, { action: 'DEPLOY', environment: 'PRODUCTION' }); // Example policy
          if (policyOutcome === 'BLOCK') {
            deploymentApprovalNeeded = true; // Still needs approval, or even blocked
          }
        }

        if (aiConfig.deploymentStrategy === 'AUTOMATIC' || !deploymentApprovalNeeded) {
          const deployTaskId = generateUniqueId();
          setAiTasks(prev => [...prev, {
            id: deployTaskId,
            goalId: relatedGoalId,
            description: `Automatic deployment to PRODUCTION for goal ${relatedGoalId.substring(0, 8)}`,
            type: 'DEPLOY',
            status: 'RUNNING',
            startedAt: formatTimestamp(new Date()),
            logs: [generateMockLogEntry('DEPLOYMENT_SERVICE', 'INFO')],
            estimatedDurationMs: 8000,
            agentId: pickRandom(agents.filter(a => a.role === 'OPS').map(a => a.id)),
          }]);
          setDeployments(prev => [...prev, {
            id: generateUniqueId(),
            environment: 'PRODUCTION',
            status: 'IN_PROGRESS',
            version: approvedChange.id,
            startedAt: formatTimestamp(new Date()),
            logs: [],
            deployedServices: ['frontend', 'backend'],
            integrityCheckPassed: true,
          }]);
          addAuditLog(generateMockAuditLogEntry('DEPLOYMENT', approvedChange.id, { status: 'IN_PROGRESS', environment: 'PRODUCTION' }, 'DEPLOYMENT_SERVICE', currentAuditLogChainHash));
          await mockApiDelay(8000);
          setDeployments(prev => prev.map(d => d.version === approvedChange.id ? { ...d, status: 'SUCCESS', completedAt: formatTimestamp(new Date()) } : d));
          setAiTasks(prev => prev.map(task =>
            task.id === deployTaskId ? { ...task, status: 'COMPLETED', completedAt: formatTimestamp(new Date()), output: 'Deployment successful!' } : task
          ));
          addAuditLog(generateMockAuditLogEntry('DEPLOYMENT', approvedChange.id, { status: 'SUCCESS', environment: 'PRODUCTION' }, 'DEPLOYMENT_SERVICE', currentAuditLogChainHash));

        } else {
          setGoals(prev => prev.map(g => g.id === relatedGoalId ? { ...g, status: 'REVIEW_NEEDED', progressPercentage: 90, lastUpdated: formatTimestamp(new Date()) } : g));
          setAiTasks(prev => [...prev, {
            id: generateUniqueId(),
            goalId: relatedGoalId,
            description: `Manual deployment approval required for goal ${relatedGoalId.substring(0, 8)}.`,
            type: 'DEPLOY',
            status: 'PAUSED',
            startedAt: formatTimestamp(new Date()),
            logs: [generateMockLogEntry('DEPLOYMENT_SERVICE', 'WARN', 'Manual approval pending.')],
            estimatedDurationMs: 0,
            agentId: pickRandom(agents.filter(a => a.role === 'OPS').map(a => a.id)),
          }]);
          addAuditLog(generateMockAuditLogEntry('DEPLOYMENT', relatedGoalId, { status: 'PAUSED', reason: 'Manual Approval' }, 'DEPLOYMENT_SERVICE', currentAuditLogChainHash));
        }

      } else {
        setGoals(prev => prev.map(g => g.id === relatedGoalId ? { ...g, status: 'FAILING', progressPercentage: 75, lastUpdated: formatTimestamp(new Date()) } : g));
        setAiTasks(prev => [...prev, {
          id: generateUniqueId(),
          goalId: relatedGoalId,
          description: `Tests failed for goal ${relatedGoalId.substring(0, 8)}. AI initiating debugging and refactoring.`,
          type: 'BUGFIX',
          status: 'RUNNING',
          startedAt: formatTimestamp(new Date()),
          logs: [generateMockLogEntry('AI_DEBUGGER', 'ERROR', 'Tests failed!')],
          estimatedDurationMs: 15000,
          agentId: pickRandom(agents.map(a => a.id)),
        }]);
        addAuditLog(generateMockAuditLogEntry('CODE_QUALITY', relatedGoalId, { status: 'TESTS_FAILED' }, 'TEST_RUNNER', currentAuditLogChainHash));
      }
    }

  }, [codeChanges, aiTasks, aiConfig.deploymentStrategy, agents, addAuditLog, enforcePolicy, currentAuditLogChainHash]);

  const handleRejectChange = useCallback((changeId: string, reason: string) => {
    setCodeChanges(prev => prev.map(c => c.id === changeId ? { ...c, status: 'REJECTED', approved: false, reviewer: 'HUMAN', reviewComments: reason, timestamp: formatTimestamp(new Date()) } : c));
    
    const rejectedChange = codeChanges.find(c => c.id === changeId);
    if (!rejectedChange) return;

    const relatedTask = aiTasks.find(t => t.id === rejectedChange.taskId);
    const relatedGoalId = relatedTask?.goalId;

    if (relatedGoalId) {
      setGoals(prev => prev.map(g => g.id === relatedGoalId ? { ...g, status: 'IN_PROGRESS', progressPercentage: (g.progressPercentage || 0) - 10, lastUpdated: formatTimestamp(new Date()) } : g));
      setAiTasks(prev => [...prev, {
        id: generateUniqueId(),
        goalId: relatedGoalId,
        description: `Code change rejected for goal ${relatedGoalId.substring(0, 8)}. AI initiating refactoring based on feedback.`,
        type: 'CODE_REF_FACTOR',
        status: 'RUNNING',
        startedAt: formatTimestamp(new Date()),
        logs: [generateMockLogEntry('AI_AGENT_REFACTOR', 'INFO', `Reason: ${reason}`)],
        estimatedDurationMs: 10000,
        agentId: pickRandom(agents.map(a => a.id)),
      }]);
      addAuditLog(generateMockAuditLogEntry('CODE_CHANGE', changeId, { action: 'Change_Rejected', goalId: relatedGoalId, reason }, 'HUMAN', currentAuditLogChainHash));
    }
  }, [codeChanges, aiTasks, agents, addAuditLog, currentAuditLogChainHash]);

  // --- Knowledge Graph Population ---
  useEffect(() => {
    const nodes: KnowledgeNode[] = [];
    const edges: KnowledgeEdge[] = [];
    const nodeMap = new Map<string, string>(); // path/id -> node_id

    // Files
    codebaseFiles.forEach(file => {
      const nodeId = generateUniqueId();
      nodes.push({ id: nodeId, label: file.name, type: 'FILE', data: file.id, properties: { path: file.path, language: file.language } });
      nodeMap.set(`file-${file.id}`, nodeId);
    });

    // Goals
    goals.forEach(goal => {
      const nodeId = generateUniqueId();
      nodes.push({ id: nodeId, label: goal.text.substring(0, 30) + '...', type: 'GOAL', data: goal.id, properties: { status: goal.status, category: goal.category } });
      nodeMap.set(`goal-${goal.id}`, nodeId);

      goal.dependencies.forEach(depId => {
        const depNodeId = nodeMap.get(`goal-${depId}`);
        if (depNodeId) {
          edges.push({ id: generateUniqueId(), source: nodeId, target: depNodeId, type: 'DEPENDS_ON' });
        }
      });
    });

    // AI Tasks
    aiTasks.forEach(task => {
        const nodeId = generateUniqueId();
        nodes.push({id: nodeId, label: task.description.substring(0,30) + '...', type: 'REQUIREMENT', properties: { type: task.type, status: task.status }});
        nodeMap.set(`task-${task.id}`, nodeId);
        
        const goalNodeId = nodeMap.get(`goal-${task.goalId}`);
        if(goalNodeId) {
            edges.push({id: generateUniqueId(), source: nodeId, target: goalNodeId, type: 'RELATED_TO'});
        }
        if (task.agentId) {
            const agentNodeId = nodeMap.get(`agent-${task.agentId}`);
            if (agentNodeId) {
                edges.push({id: generateUniqueId(), source: nodeId, target: agentNodeId, type: 'PERFORMED_BY'});
            }
        }
        task.artifacts?.forEach(artifact => {
            if (artifact.type === 'FILE_CHANGE' && artifact.content.fileId) {
                const fileNodeId = nodeMap.get(`file-${artifact.content.fileId}`);
                if (fileNodeId) {
                    edges.push({id: generateUniqueId(), source: nodeId, target: fileNodeId, type: 'MODIFIES'});
                }
            }
        });
    });

    // Agents
    agents.forEach(agent => {
      const nodeId = generateUniqueId();
      nodes.push({ id: nodeId, label: agent.name, type: 'AGENT', data: agent.id, properties: { role: agent.role, status: agent.status } });
      nodeMap.set(`agent-${agent.id}`, nodeId);

      const identityNodeId = digitalIdentities.find(id => id.id === agent.identityId);
      if (identityNodeId) {
        edges.push({ id: generateUniqueId(), source: nodeId, target: identityNodeId.id, type: 'HAS_IDENTITY' });
      }
    });

    // Digital Identities
    digitalIdentities.forEach(identity => {
      const nodeId = generateUniqueId();
      nodes.push({ id: nodeId, label: identity.name, type: 'IDENTITY', data: identity.id, properties: { entityType: identity.entityType, verificationLevel: identity.verificationLevel } });
      nodeMap.set(identity.id, nodeId);
    });

    // Token Assets
    tokenAssets.forEach(asset => {
      const nodeId = generateUniqueId();
      nodes.push({ id: nodeId, label: asset.symbol, type: 'TOKEN_ASSET', data: asset.id, properties: { issuer: asset.issuerId } });
      nodeMap.set(`asset-${asset.id}`, nodeId);

      const issuerNodeId = nodeMap.get(asset.issuerId);
      if (issuerNodeId) {
        edges.push({ id: generateUniqueId(), source: issuerNodeId, target: nodeId, type: 'ISSUES' });
      }
    });

    // Token Accounts
    tokenAccounts.forEach(account => {
      const nodeId = generateUniqueId();
      nodes.push({ id: nodeId, label: `${account.ownerId.substring(0,5)}:${account.assetId.substring(0,5)}`, type: 'ACCOUNT', data: account.id, properties: { balance: account.balance } });
      nodeMap.set(`account-${account.id}`, nodeId);

      const ownerNodeId = nodeMap.get(account.ownerId);
      const assetNodeId = nodeMap.get(`asset-${account.assetId}`);
      if (ownerNodeId) {
        edges.push({ id: generateUniqueId(), source: ownerNodeId, target: nodeId, type: 'OWNS_ACCOUNT' });
      }
      if (assetNodeId) {
        edges.push({ id: generateUniqueId(), source: nodeId, target: assetNodeId, type: 'HOLDS_ASSET' });
      }
    });

    // Token Transactions
    tokenTransactions.forEach(tx => {
      const nodeId = generateUniqueId();
      nodes.push({ id: nodeId, label: `${tx.type} ${tx.amount} ${tx.assetId.substring(0,3)}`, type: 'TRANSACTION', data: tx.id, properties: { status: tx.status } });
      nodeMap.set(`transaction-${tx.id}`, nodeId);

      if (tx.senderAccountId) {
        const senderNodeId = nodeMap.get(`account-${tx.senderAccountId}`);
        if (senderNodeId) edges.push({ id: generateUniqueId(), source: senderNodeId, target: nodeId, type: 'SENDER_IN_TX' });
      }
      if (tx.receiverAccountId) {
        const receiverNodeId = nodeMap.get(`account-${tx.receiverAccountId}`);
        if (receiverNodeId) edges.push({ id: generateUniqueId(), source: nodeId, target: receiverNodeId, type: 'RECEIVER_IN_TX' });
      }
      if (tx.settlementRailId) {
        const railNodeId = nodeMap.get(`rail-${tx.settlementRailId}`);
        if (railNodeId) edges.push({ id: generateUniqueId(), source: nodeId, target: railNodeId, type: 'SETTLES_VIA' });
      }
    });

    // Settlement Rails
    settlementRails.forEach(rail => {
      const nodeId = generateUniqueId();
      nodes.push({ id: nodeId, label: rail.name, type: 'RAIL', data: rail.id, properties: { type: rail.type, latency: rail.latencyMs } });
      nodeMap.set(`rail-${rail.id}`, nodeId);
    });

    // Routing Policies
    routingPolicies.forEach(policy => {
      const nodeId = generateUniqueId();
      nodes.push({ id: nodeId, label: policy.name, type: 'POLICY', data: policy.id, properties: { criteria: policy.criteria } });
      nodeMap.set(`routing-policy-${policy.id}`, nodeId);

      policy.preferredRailIds.forEach(railId => {
        const railNodeId = nodeMap.get(`rail-${railId}`);
        if (railNodeId) edges.push({ id: generateUniqueId(), source: nodeId, target: railNodeId, type: 'PREFERS_RAIL' });
      });
    });

    // Governance Policies
    policies.forEach(policy => {
      const nodeId = generateUniqueId();
      nodes.push({ id: nodeId, label: policy.name, type: 'POLICY', data: policy.id, properties: { category: policy.category, enforcement: policy.enforcementAction } });
      nodeMap.set(`governance-policy-${policy.id}`, nodeId);
    });

    // Authorization Policies
    authorizationPolicies.forEach(policy => {
      const nodeId = generateUniqueId();
      nodes.push({ id: nodeId, label: policy.name, type: 'POLICY', data: policy.id, properties: { targetResource: policy.targetResource } });
      nodeMap.set(`auth-policy-${policy.id}`, nodeId);
    });


    // Add some random cross-references for more complexity if the graph is sparse
    if (nodes.length > 5 && edges.length < 20) {
      for (let i = 0; i < 5; i++) {
        const sourceNode = pickRandom(nodes);
        const targetNode = pickRandom(nodes.filter(n => n.id !== sourceNode.id));
        if (sourceNode && targetNode) {
          edges.push({ id: generateUniqueId(), source: sourceNode.id, target: targetNode.id, type: pickRandom(['RELATED_TO', 'USES', 'IMPACTS', 'CONTROLS']) });
        }
      }
    }

    setKnowledgeNodes(nodes);
    setKnowledgeEdges(edges);
  }, [codebaseFiles, goals, aiTasks, agents, digitalIdentities, tokenAssets, tokenAccounts, tokenTransactions, settlementRails, routingPolicies, policies, authorizationPolicies]);


  // --- Metric & Finding Simulation Effects ---
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prevMetrics => prevMetrics.map(metric => {
        let newValue = metric.value + (Math.random() - 0.5) * 5; // Random fluctuation
        if (metric.category === 'TRANSACTION_VOLUME') {
          newValue = Math.max(500, Math.min(2000, newValue)); // Keep within a sensible range for TPS
        } else {
          newValue = Math.max(0, Math.min(100, newValue)); // Keep within 0-100 range for most metrics
        }

        let isAlert = false;
        let alertDetails: string | undefined = undefined;
        if (metric.threshold !== undefined) {
          if (metric.category === 'PERFORMANCE' || metric.category === 'AVAILABILITY' || metric.category === 'RESOURCE_UTILIZATION' || metric.category === 'COST') {
            isAlert = newValue > metric.threshold;
            if (isAlert) alertDetails = `${metric.name} exceeded threshold: ${newValue.toFixed(2)} ${metric.unit} > ${metric.threshold.toFixed(2)} ${metric.unit}`;
          } else if (metric.category === 'SECURITY' || metric.category === 'COMPLIANCE') {
            isAlert = newValue < metric.threshold; // Lower score is worse for security/compliance
            if (isAlert) alertDetails = `${metric.name} dropped below threshold: ${newValue.toFixed(2)} ${metric.unit} < ${metric.threshold.toFixed(2)} ${metric.unit}`;
          }
        }

        // Simulate fixing a security finding for goal g4
        const g4Goal = goals.find(g => g.id === 'g4');
        if (g4Goal && g4Goal.status === 'IN_PROGRESS' && metric.name === 'Security Score') {
          newValue = Math.min(100, metric.value + Math.random() * 2); // Improve security score
          isAlert = newValue < (metric.threshold || 90);
        }

        // Simulate compliance violations for g6
        const g6Goal = goals.find(g => g.id === 'g6');
        if (g6Goal && g6Goal.status === 'IN_PROGRESS' && metric.name === 'Compliance Policy Violations') {
          if (Math.random() < 0.2) { // 20% chance of a mock violation
             newValue = Math.min(10, newValue + 1);
             isAlert = newValue > 0;
             alertDetails = `New compliance violation detected for goal ${g6Goal.id}`;
          } else {
            newValue = Math.max(0, newValue - 0.5); // Reduce if not actively violating
          }
        }


        return {
          ...metric,
          value: parseFloat(newValue.toFixed(2)),
          timestamp: formatTimestamp(new Date()),
          isAlert: isAlert,
          alertDetails: alertDetails,
        };
      }));

      // Randomly generate new security findings
      if (Math.random() < 0.1) { // 10% chance every 5 seconds
        const randomFile = pickRandom(codebaseFiles);
        if (randomFile) {
          const finding = generateMockSecurityFinding(randomFile.path);
          setSecurityFindings(prev => [...prev, finding]);
          addAuditLog(generateMockAuditLogEntry('SECURITY_EVENT', finding.id, { action: 'Finding_Discovered', severity: finding.severity }, 'SECURITY_SCANNER', currentAuditLogChainHash));
        }
      }

      // Randomly generate new cost report
      if (Math.random() < 0.05) { // 5% chance every 5 seconds
        const report = generateMockCostReport();
        setCostReports(prev => [...prev, report]);
        addAuditLog(generateMockAuditLogEntry('RESOURCE_UTILIZATION', report.id, { action: 'Cost_Report_Generated', totalCost: report.totalCost }, 'COST_OPTIMIZER', currentAuditLogChainHash));
      }

      // Simulate a random payment request from Alice
      if (Math.random() < 0.2 && digitalIdentities.length >= 2 && tokenAssets.length >= 1) {
        const alice = digitalIdentities.find(id => id.name === 'Alice_Investor');
        const bob = digitalIdentities.find(id => id.name === 'GlobalBank_Ops');
        const usd_c = tokenAssets.find(asset => asset.symbol === 'USD_C');
        if (alice && bob && usd_c) {
          initiatePayment(alice.id, bob.id, usd_c.id, parseFloat((Math.random() * 5000 + 10).toFixed(2)));
        }
      }

    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [codebaseFiles, goals, addAuditLog, currentAuditLogChainHash, digitalIdentities, tokenAssets, initiatePayment]);

  const [activeTab, setActiveTab] = useState('Goals');

  // --- UI Structure ---
  return (
    <div className="bg-gray-900 text-white min-h-screen p-8 font-sans">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-cyan-400">Autonomous Financial Infrastructure Dashboard</h1>

      {/* Top Section: Goal Input & Evolving Status */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-8 border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">Add New Development Goal</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newGoalText}
            onChange={e => setNewGoalText(e.target.value)}
            placeholder="Describe a new feature, improvement, or compliance requirement..."
            className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            disabled={isEvolving}
          />
          <button
            onClick={handleAddGoal}
            disabled={isEvolving || !newGoalText.trim()}
            className="px-6 py-3 bg-cyan-600 rounded-lg font-semibold hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isEvolving ? `Evolving for ${evolvingGoalId?.substring(0,5)}...` : 'Add Goal & Auto-Evolve'}
          </button>
        </div>
        {isEvolving && (
          <p className="mt-4 text-blue-300 animate-pulse text-lg">
            <span className="mr-2">🚀</span> New goal accepted. AI agents are coordinating: analyzing requirements, generating code, creating tests, refactoring, enforcing policies...
          </p>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex space-x-2 border-b border-gray-700">
        {['Goals', 'Codebase & Review', 'Metrics & Ops', 'Agents & Messaging', 'Token Rail', 'Identity & Trust', 'Payments & Risk', 'Governance'].map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab ? 'bg-gray-700 text-white border-b-2 border-cyan-500' : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Dashboard Layout - Content based on activeTab */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {activeTab === 'Goals' && (
          <>
            <div className="space-y-6">
              <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 h-[700px] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4 text-white">Development Goals</h2>
                <div className="space-y-4">
                  {goals.length === 0 ? (
                    <p className="text-gray-400">No goals defined yet. Add one above!</p>
                  ) : (
                    goals.map(g => (
                      <GoalDetailsCard key={g.id} goal={g} onUpdateStatus={handleUpdateGoalStatus} />
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <AIProcessTaskViewer tasks={aiTasks} />
              <UserFeedbackPanel feedbackItems={userFeedback} onSubmitFeedback={handleSubmitUserFeedback} />
              <AIAgentConfigurator config={aiConfig} onUpdateConfig={handleUpdateAiConfig} />
            </div>
          </>
        )}

        {activeTab === 'Codebase & Review' && (
          <>
            <CodebaseExplorer
              files={codebaseFiles}
              codeChanges={codeChanges}
              selectedFileId={selectedFileForExplorer}
              onSelectFile={setSelectedFileForExplorer}
            />
            <CodeReviewPanel
              changes={codeChanges}
              onApproveChange={handleApproveChange}
              onRejectChange={handleRejectChange}
            />
          </>
        )}

        {activeTab === 'Metrics & Ops' && (
          <>
            <div className="space-y-6">
              <MetricsDashboard metrics={metrics} />
              <CostAnalysisViewer reports={costReports} />
            </div>
            <div className="space-y-6">
              <SecurityScanResultsViewer findings={securityFindings} onUpdateFindingStatus={handleUpdateFindingStatus} />
              <DeploymentPipelineStatusViewer deployments={deployments} />
            </div>
          </>
        )}

        {activeTab === 'Agents & Messaging' && (
          <div className="xl:col-span-2">
            <AgentOrchestratorView agents={agents} messages={agentMessages} orchestrationLogs={orchestrationLogs} />
          </div>
        )}

        {activeTab === 'Token Rail' && (
          <div className="xl:col-span-2">
            <ProgrammableTokenRailViewer
              tokenAssets={tokenAssets}
              tokenAccounts={tokenAccounts}
              tokenTransactions={tokenTransactions}
              settlementRails={settlementRails}
              routingPolicies={routingPolicies}
              onMintBurnTransfer={handleMintBurnTransfer}
            />
          </div>
        )}

        {activeTab === 'Identity & Trust' && (
          <div className="xl:col-span-2">
            <DigitalIdentityManager
              identities={digitalIdentities}
              accessLogs={accessLogHistory}
              authorizationPolicies={authorizationPolicies}
              onAuthorizeAction={authorize}
            />
          </div>
        )}

        {activeTab === 'Payments & Risk' && (
          <div className="xl:col-span-2">
            <RealTimeSettlementMonitor
              paymentRequests={paymentRequests}
              settlementTransactions={settlementTransactions}
              settlementConfirmations={settlementConfirmations}
              riskAssessments={allRiskAssessments}
              onInitiatePayment={initiatePayment}
            />
          </div>
        )}

        {activeTab === 'Governance' && (
          <div className="xl:col-span-2">
            <GovernancePanel
              policies={policies}
              auditLogs={auditLogs}
              accessControls={accessControls}
            />
          </div>
        )}
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 text-center text-gray-500 text-sm">
        <h2 className="text-xl font-bold mb-4 text-cyan-300">System Knowledge Graph Overview</h2>
        <KnowledgeGraphViewer nodes={knowledgeNodes} edges={knowledgeEdges} />
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 text-center text-gray-500 text-sm mt-8">
        <p>This is a simulated, self-evolving financial infrastructure. All operations are mock and for demonstration purposes.</p>
        <p className="mt-2">Built with React and a vision for AI-native financial development. © 2024</p>
      </div>
    </div>
  );
};

export default SelfRewritingCodebaseView;