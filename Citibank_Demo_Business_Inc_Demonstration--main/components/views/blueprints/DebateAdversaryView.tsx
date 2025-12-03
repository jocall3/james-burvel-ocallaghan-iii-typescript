/**
 * This module defines the core data models and interfaces essential for the Debate Adversary View within the Agentic AI platform.
 * It underpins the entire intelligent argumentation system, providing a robust, auditable, and extensible foundation
 * for AI-driven financial decision-making simulations and advanced educational applications.
 * Business impact: These meticulously designed data schemas provide the backbone for high-value features such as personalized AI coaching,
 * real-time fallacy detection, sentiment analysis, and argument strength scoring. By formalizing these data contracts,
 * the system ensures robust data integrity, enables advanced analytics for continuous AI improvement, and facilitates the
 * development of scalable, auditable, and monetizable AI-powered services. They directly support features that enhance user engagement,
 * improve critical thinking skills, and unlock premium subscription tiers, driving significant revenue growth and intellectual property value.
 * This represents a revolutionary, multi-million-dollar infrastructure leap, enabling digital finance innovation through trusted AI interactions.
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// --- Data Models and Interfaces (Expanded) ---

/**
 * Represents a single turn in the debate, enriched with comprehensive metadata for robust analytics,
 * compliance, and agentic interaction tracking, ensuring full auditability and cryptographic integrity.
 * Business value: Each turn captures a granular snapshot of the debate's progression, allowing for
 * deep post-hoc analysis, AI model refinement, and auditability. The inclusion of fallacies,
 * argument scores, AI metadata, and cryptographic signatures provides high-fidelity data points for
 * performance metrics, personalized user feedback, and precise cost attribution, optimizing resource
 * utilization and user value while guaranteeing non-repudiation.
 */
export interface DebateTurn {
  id: string; // Unique ID for the turn, critical for idempotency and transaction tracking.
  debateId: string; // ID of the parent debate session.
  turnNumber: number; // Sequential number of the turn within the debate.
  speaker: 'USER' | 'AI'; // Identifies the participant of this turn.
  text: string; // The textual content of the argument.
  timestamp: number; // Unix timestamp of when the turn was recorded, crucial for real-time analytics and chronological auditing.
  fallaciesDetected: FallacyDetectionResult[]; // Array of detected fallacies, providing actionable insights for user improvement.
  argumentStrengthScore?: number; // AI's assessment of argument strength (0-100), key for performance evaluation and AI training.
  counterArgumentSuggestions?: string[]; // AI's suggestions for user, enhancing user experience and guiding better argumentation.
  sentimentScore?: { positive: number; neutral: number; negative: number }; // AI's sentiment analysis, valuable for understanding debate tone and emotional intelligence.
  citedSources?: { url: string; title: string }[]; // Mock cited sources, demonstrating adherence to factual basis and research.
  userFeedback?: { rating: number; comment: string }; // User feedback on AI turn, vital for continuous AI learning and feature prioritization.
  aiResponseMetadata?: AIResponseMetadata; // Additional AI response metadata, offering transparency into AI processing and costs.
  voiceClipUrl?: string; // URL to an AI-generated voice response clip, enabling multimodal interaction and accessibility.
  turnSignature: string; // Cryptographic signature of the turn content, ensuring non-repudiation and data integrity for audit logs.
  speakerIdentitySignature?: string; // Cryptographic signature from the speaker's digital identity, ensuring origin and non-repudiation.
  associatedTransactionIds?: string[]; // List of transaction IDs if this turn involved micro-payments or token expenditure (e.g., for compute).
  concurrencyControlHash: string; // Hash of the previous turn's state, vital for idempotent processing and preventing race conditions.
  remediationStatus?: RemediationActionStatus[]; // Status of any remediation actions triggered by this turn.
}

/**
 * Detailed information about a detected fallacy, providing an actionable pedagogical tool and auditable agent attribution.
 * Business value: This granular data on logical fallacies empowers users to refine their argumentation skills,
 * directly enhancing the platform's educational value. It provides specific, evidence-based feedback,
 * which is a cornerstone for user retention and subscription upgrades to advanced coaching features,
 * with clear attribution to the detecting agent.
 */
export interface FallacyDetectionResult {
  fallacyType: string; // e.g., 'Anecdotal Fallacy', 'Ad Hominem', categorized for analytics.
  description: string; // Brief description of the fallacy instance, aiding user understanding.
  confidence: number; // Confidence score (0-1) of the detection, critical for system reliability and trust.
  excerpt: string; // The specific part of the text that exhibits the fallacy, providing direct evidence.
  correctionSuggestion?: string; // How to rephrase to avoid the fallacy, offering immediate, practical guidance.
  detectionAgentId?: string; // Identifier of the agent responsible for detecting this fallacy, for audit and performance.
}

/**
 * Interface for AI response metadata, capturing performance, resource consumption, governance, and cryptographic details.
 * Business value: This metadata provides full transparency and accountability for AI operations, critical for
 * commercial-grade financial infrastructure. It enables precise cost attribution, performance optimization,
 * and comprehensive compliance auditing, demonstrating commercial viability and responsible AI deployment. This is crucial for managing
 * token rail expenditures, ensuring efficient, governed agentic AI workflows, and providing cryptographic proof of origin.
 */
export interface AIResponseMetadata {
  modelUsed: string; // e.g., 'DebateBot-v3.2', 'LogicEngine-v1.0', for tracking model evolution and performance.
  processingTimeMs: number; // Latency of AI response generation, a key performance indicator (KPI).
  tokensUsed: number; // Number of tokens consumed, directly linking to token rail costs and resource management.
  costEstimateUSD: number; // Estimated financial cost of the AI interaction, vital for billing and budgeting.
  debugInfo?: string; // For advanced debugging and internal diagnostics, critical for system reliability.
  securityScanResults?: SecurityScanResult[]; // Results from content security scans (e.g., for bias, toxicity).
  governancePolicyApplied?: string; // Identifier of the governance policy or rule set that guided the AI's response.
  agentSignature?: string; // Cryptographic signature from the AI agent, ensuring response integrity and non-repudiation.
  idempotencyKey: string; // Unique key for the AI processing request, ensuring atomic, repeatable operations.
}

/**
 * Represents an AI persona with its specific characteristics, debate strategy, and underlying agent identity.
 * Business value: AI personas are foundational for differentiated user experiences and tiered service offerings.
 * They allow for specialized AI capabilities, enabling customized coaching, role-playing, and domain-specific
 * expertise. The strategic design of personas directly influences user engagement, premium feature adoption,
 * and the platform's reputation for diverse and intelligent AI interactions. Each persona is an identity within
 * the agentic system, with traceable resource consumption and adherence to governance.
 */
export interface AIPersona {
  id: string; // Unique identifier for the AI persona.
  agentId: string; // Links this persona to an underlying Agentic AI System agent, critical for system integration.
  name: string;
  description: string;
  coreBeliefs: string[]; // Influences the AI's stance and arguments, providing thematic consistency.
  debateStrategy: 'logical' | 'emotional' | 'sarcastic' | 'academic' | 'persuasive'; // Defines the AI's interaction style, enhancing user choice.
  knowledgeDomains: string[]; // e.g., 'Physics', 'Philosophy', 'Economics', for specialized expertise.
  speechStyle: string; // e.g., 'formal', 'colloquial', 'pedantic', for diverse user preferences.
  avatarUrl: string;
  premiumFeature: boolean; // Indicates if persona is premium, driving subscription revenue.
  lastUsed: number; // Unix timestamp of last use, informing persona popularity and lifecycle management.
  creationDate: number; // Unix timestamp of creation, for tracking and governance.
  performanceMetrics?: { winRate: number; avgFallaciesDetected: number }; // Simulated performance, for AI improvement and user selection.
  customizableOptions?: {
    tone: 'friendly' | 'neutral' | 'assertive';
    verbosity: 'concise' | 'balanced' | 'verbose';
  };
  specialAbilities?: string[]; // e.g., 'Deep Logic', 'Emotional Appeals', 'Historical Context', highlighting unique selling points.
  resourceAllocationAccount: string; // Identifier for the internal ledger account associated with this persona for resource tracking and billing.
  identityPublicKey?: string; // Public key for the AI persona's digital identity, enabling verifiable actions.
  governancePolicies?: string[]; // Array of governance policy IDs applicable to this persona.
}

/**
 * Represents a user profile, consolidating digital identity, settings, and debate history summaries,
 * serving as the central hub for personalized, secure, and financially integrated user experiences.
 * Business value: This comprehensive user profile is central to personalized experiences, secure authentication,
 * and value-added service delivery within the digital finance ecosystem. By linking to a digital identity and
 * tracking subscription tiers and token wallets, it enables robust RBAC, facilitates targeted marketing,
 * and underpins the platform's monetization strategy, securing user data and enhancing long-term customer relationships.
 */
export interface UserProfile {
  userId: string;
  identityId: string; // Links to the user's secure Digital Identity within the platform, crucial for authentication and authorization.
  username: string;
  email: string;
  profilePictureUrl: string;
  settings: UserSettings;
  debateStats: DebateStats;
  favoritePersonas: string[]; // Array of persona IDs, enabling quick access and personalization.
  achievements: string[]; // e.g., 'First Debate Win', 'Master Logician', driving gamification and engagement.
  subscriptionTier: 'free' | 'premium' | 'enterprise'; // Monetization hook, defining access to features and pricing.
  lastActivity: number;
  joinedDate: number;
  linkedWallets?: string[]; // Array of wallet addresses linked to the user's account for token rail interactions.
  verifiableClaims?: IdentityClaim[]; // Digital identity claims associated with the user.
  publicKey?: string; // User's primary public key for signing transactions and interactions.
  accessControlList?: string[]; // Reference to specific access control policies applied to this user.
}

/**
 * User-specific settings for the application, enabling a tailored, optimized, and financially transparent experience.
 * Business value: Granular user settings enhance user satisfaction and control, leading to higher
 * engagement and reduced churn. Customization options like voice output, AI assistance levels,
 * and theme preferences cater to diverse user needs, making the platform accessible and desirable
 * for a broader audience while providing transparency on financial implications.
 */
export interface UserSettings {
  defaultAIPersonaId: string;
  enableVoiceInput: boolean;
  enableVoiceOutput: boolean;
  autoSaveDebates: boolean;
  notificationPreferences: {
    newFallacyType: boolean;
    debateSummary: boolean;
    aiInsight: boolean;
  };
  theme: 'dark' | 'light';
  language: 'en' | 'es' | 'fr';
  textSize: 'small' | 'medium' | 'large';
  fallacyDetectionLevel: 'low' | 'medium' | 'high';
  argumentStrengthAnalysis: boolean;
  counterArgumentAssistance: boolean;
  aiResponseDelay: 'instant' | 'short' | 'medium' | 'long'; // Simulated delay for perceived realism or learning pace.
  showAIThinkingProcess: boolean; // For debugging/learning, enhancing transparency and user education.
  enablePaymentNotifications: boolean; // For token rail transactions, crucial for financial transparency.
  defaultCurrencyPreference?: string; // Preferred currency for displaying cost estimates.
  privacySettings?: {
    dataSharingConsent: boolean;
    anonymizeDebateData: boolean;
  };
}

/**
 * Aggregated statistics for a user's debates, providing deep insights into performance, engagement, and financial impact.
 * Business value: Comprehensive debate statistics offer users valuable self-improvement data and
 * foster a sense of progress. For the business, these metrics are crucial for identifying popular
 * features, evaluating AI effectiveness, and driving marketing initiatives based on user achievements
 * and engagement trends. They contribute directly to product stickiness, premium feature justification,
 * and financial reporting on token consumption and revenue.
 */
export interface DebateStats {
  totalDebates: number;
  wins: number;
  losses: number;
  draws: number;
  avgFallaciesPerDebate: number;
  mostCommonFallacyDetected: string | null;
  longestDebateTurns: number;
  totalDebateTimeSeconds: number;
  favoriteTopics: string[];
  aiPersonaUsage: { [personaId: string]: number }; // Count of debates with each persona, informing persona development.
  fallaciesCommitted: { [fallacyType: string]: number }; // Count of fallacies user committed, a direct measure of learning.
  fallaciesDetectedInAI: { [fallacyType: string]: number }; // Count of fallacies detected in AI, for AI performance monitoring.
  averageUserArgumentLength: number;
  averageAIArgumentLength: number;
  lastDebateSummary?: DebateSummary;
  totalTokensSpent?: number; // Total tokens spent across all debates, linking to token rail consumption.
  totalCostIncurredUSD?: number; // Total estimated cost, for user billing and system cost analysis.
  netTokenGainLoss?: number; // Financial impact of debates if tokens are earned/spent for outcomes.
  remediationActionsTakenCount?: { [actionType: string]: number }; // Count of automated remediation actions applied.
}

/**
 * Defines a suggested debate topic, curated to enhance user engagement and learning, potentially generated by agents.
 * Business value: Curated and categorized topics drive exploration and engagement, ensuring a dynamic
 * and fresh experience for users. Difficulty levels and keywords allow for tailored content
 * recommendations, improving user retention and providing clear pathways for skill development,
 * which can be tied to premium content subscriptions. AI-generated topics enhance scalability and personalization.
 */
export interface SuggestedTopic {
  id: string;
  title: string;
  category: string; // e.g., 'Science', 'Politics', 'Ethics', 'Everyday', for discoverability.
  difficulty: 'easy' | 'medium' | 'hard'; // Tailors challenges to user skill levels.
  description: string;
  keywords: string[]; // For search and recommendation engines.
  popularityScore: number;
  lastSuggested: number;
  governanceReviewed?: boolean; // Flag indicating if the topic has been reviewed for compliance.
  suggestedByAgentId?: string; // Identifier of the agent that suggested or curated this topic.
}

/**
 * Debate session configuration, dictating the parameters of an individual debate, with robust security and identity requirements.
 * Business value: Configurable debate parameters allow users to customize their learning environment,
 * from challenging AI difficulty to specific assistance levels. This flexibility enhances the
 * platform's utility for diverse educational and recreational purposes, contributing to user satisfaction
 * and the perceived value of premium control features, while ensuring identity and idempotency for session integrity.
 */
export interface DebateConfig {
  topic: string;
  aiPersonaId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimitPerTurnSeconds: number | null; // Null for no limit, providing flexibility.
  fallacyHighlighting: boolean;
  aiAssistanceLevel: 'none' | 'basic' | 'advanced'; // For counter-arg, strength analysis, a key premium feature lever.
  voiceOutputEnabled: boolean;
  voiceInputEnabled: boolean;
  maxTurns?: number | null; // Null for no max turns, allows for open-ended debates.
  challengeLevel?: 'beginner' | 'intermediate' | 'expert'; // More granular challenge.
  idempotencyKey: string; // Unique key to ensure only one debate session is created per request.
  requiredIdentityClaims?: { type: string; minVerificationLevel?: VerificationLevel }[]; // Specifies identity claims needed to start debate.
}

/**
 * Summary of a completed debate, providing comprehensive post-debate analysis, including financial and governance links.
 * Business value: Debate summaries provide invaluable educational feedback and performance tracking.
 * Key insights, outcome analysis, and sentiment trends empower users to learn and improve,
 * while detailed fallacy counts offer clear pathways for skill development. This feature
 * is critical for demonstrating the platform's efficacy and justifying its premium offerings,
 * directly linking to financial settlements and governance reports.
 */
export interface DebateSummary {
  debateId: string;
  topic: string;
  aiPersonaName: string;
  userFallacies: { fallacyType: string; count: number }[];
  aiFallacies: { fallacyType: string; count: number }[];
  totalTurns: number;
  durationSeconds: number;
  outcome: 'user_win' | 'ai_win' | 'draw' | 'undecided' | 'abandoned'; // Explicit outcomes for better analytics.
  keyInsights: string[];
  userSentimentTrend?: number[]; // Over time, for emotional intelligence analysis.
  aiSentimentTrend?: number[]; // Over time, for AI performance and emotional strategy.
  performanceRating?: number; // 1-5 stars, user rating of the debate experience.
  totalTokensConsumed?: number; // Total tokens consumed for this debate, direct cost link.
  finalCostUSD?: number; // Final estimated cost for the debate session.
  auditLogSummary?: string[]; // Summary of key events from the audit log.
  settlementTransactionId?: string; // ID of the transaction that settles any financial outcome of the debate.
  governanceReportLink?: string; // URL or ID to a detailed governance compliance report for this debate.
}

/**
 * Represents a verifiable claim about a user's digital identity, for enhanced RBAC, personalized services, and compliance.
 * Business value: This interface facilitates secure, privacy-preserving identity verification, enabling
 * advanced RBAC and compliance features essential for financial services. It underpins trusted interactions
 * and allows the platform to offer services tailored to verified user attributes, opening doors for enterprise
 * solutions and secure B2B integrations, building a robust trust framework.
 */
export type VerificationLevel = 'self-attested' | 'basic-verified' | 'third-party-verified' | 'KYC-compliant';

export interface IdentityClaim {
  type: string; // e.g., 'emailVerified', 'ageVerified', 'premiumSubscriber', 'kycStatus'
  value: string | boolean | number;
  issuer: string; // Entity that issued the claim.
  issuedAt: number; // Timestamp of issuance.
  expiresAt?: number; // Optional expiration timestamp.
  signature: string; // Cryptographic signature verifying the claim's authenticity.
  verificationLevel?: VerificationLevel; // Level of verification applied to this claim.
  claimHash: string; // Cryptographic hash of the claim data, ensuring tamper-evidence.
}

/**
 * Represents the operational status of an Agentic AI system agent, providing real-time observability and resource metrics.
 * Business value: Real-time agent status is vital for operational visibility, resource management,
 * and proactive issue resolution within a commercial-grade system. Monitoring agent health, load,
 * and last activity ensures system reliability and efficient allocation of compute resources, directly
 * impacting service quality and uptime, while also tracking compliance and resource consumption for billing.
 */
export interface AgentStatus {
  agentId: string;
  name: string;
  status: 'online' | 'offline' | 'busy' | 'recovering' | 'error';
  lastHeartbeat: number; // Unix timestamp of last reported activity.
  currentTask?: string; // Description of the agent's current task.
  healthScore: number; // 0-100, aggregate health metric.
  loadAverage: number; // e.g., CPU load.
  memoryUsageMB: number;
  errorCountLastHour: number;
  metricsEndpoint?: string; // URL for detailed metrics.
  governanceViolationsCount?: number; // Count of governance policies violated by the agent.
  resourceConsumptionRates?: { [resourceType: string]: number }; // Rates of resource consumption (e.g., CPU_GHz, network_MBps).
}

/**
 * Represents a simplified token transaction for display or logging purposes, with enhanced cryptographic and routing details.
 * Business value: Exposing simplified transaction details enhances transparency for users regarding
 * the "token rails" operations. It allows users to see the micro-transactions tied to their
 * AI interactions, building trust and clarifying usage-based billing models. This is fundamental
 * for a tokenized economy platform and ensures auditable, non-repudiable financial flows.
 */
export interface TokenLedgerEntry {
  transactionId: string;
  timestamp: number;
  sender: string; // e.g., 'user_wallet_XYZ', 'ai_resource_pool_ABC'
  receiver: string; // e.g., 'ai_compute_provider_ABC', 'user_wallet_XYZ'
  amount: number;
  tokenType: string; // e.g., 'USD_C', 'compute_credits'
  status: 'pending' | 'settled' | 'failed' | 'refunded';
  description: string; // e.g., 'AI response cost', 'Premium feature access'
  metadata?: { [key: string]: any }; // Additional context for the transaction.
  signature: string; // Cryptographic signature of the transaction content for integrity and non-repudiation.
  nonce: number; // A unique number used once, preventing replay attacks.
  blockHash?: string; // Hash of the block this transaction is part of, if on a distributed ledger.
  routingDecisionMetadata?: { railUsed: string; cost: number; latencyMs: number; riskScore: number }; // Details on how the payment was routed.
}

/**
 * Defines a security scanning result, crucial for ensuring AI content safety, compliance, and automated remediation.
 * Business value: Automated security and compliance scans protect users from harmful content
 * and safeguard the platform's reputation. This directly supports governance requirements,
 * mitigates legal risks, and builds user trust, allowing for broader commercial adoption in sensitive domains.
 * It also enables proactive agentic remediation workflows.
 */
export interface SecurityScanResult {
  scannerId: string; // e.g., 'ContentModerator-v2', 'BiasDetector-v1'
  timestamp: number;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  category: 'toxicity' | 'bias' | 'PII_leak' | 'hate_speech' | 'misinformation' | 'malicious_code';
  detectedPhrase?: string; // The specific phrase that triggered the alert.
  actionTaken: 'none' | 'flagged' | 'blocked' | 'redacted' | 'remediated';
  details?: string;
  remediationActionId?: string; // Identifier of an automated remediation action taken.
}

/**
 * Represents a simplified audit log entry with tamper-evident properties, forming a cryptographically-chained record.
 * Business value: A robust, tamper-evident audit log is non-negotiable for commercial-grade systems,
 * especially in finance and AI. It provides irrefutable evidence of all system activities,
 * ensuring regulatory compliance, enabling forensic analysis in case of disputes, and providing
 * foundational trust for all stakeholders. This builds confidence in the system's integrity
 * and supports enterprise-level accountability.
 */
export interface AuditLogEntry {
  logId: string;
  timestamp: number;
  actorId: string; // User ID, Agent ID, or System ID.
  actorType: 'USER' | 'AI_AGENT' | 'SYSTEM';
  eventType: string; // e.g., 'DEBATE_STARTED', 'AI_RESPONSE_GENERATED', 'PAYMENT_SETTLED', 'ACCESS_DENIED'.
  resourceId: string; // ID of the resource affected (e.g., debate ID, transaction ID).
  details: { [key: string]: any }; // Specific details about the event.
  prevHash?: string; // Hash of the previous log entry for tamper-evidence (blockchain-like chain).
  entryHash: string; // Cryptographic hash of this log entry, ensuring immutability.
  accessGranted?: boolean; // For authorization events, indicates if access was granted.
  initiatorIpAddress?: string; // IP address of the initiator for security and compliance.
}

/**
 * Represents an internal message exchanged between agents, forming the backbone of the agentic intelligence layer.
 * Business value: This structured messaging protocol enables secure, asynchronous, and auditable communication
 * between intelligent agents, facilitating complex automated workflows in digital finance. It is critical for
 * coordinating tasks like monitoring, anomaly detection, and remediation, ensuring efficient and fault-tolerant
 * autonomous operations. This messaging layer provides the foundation for scalable, interoperable agent services.
 */
export interface AgentMessage {
  messageId: string; // Unique ID for the message, ensuring idempotency.
  senderId: string; // ID of the sending agent.
  receiverId: string; // ID of the receiving agent.
  timestamp: number; // When the message was sent.
  type: string; // e.g., 'OBSERVATION_EVENT', 'REMEDIATION_COMMAND', 'GOVERNANCE_QUERY'.
  payload: { [key: string]: any }; // The actual data being communicated.
  signature: string; // Cryptographic signature of the message content by the sender.
  nonce: number; // For replay protection.
  correlationId?: string; // To link related messages across a conversation.
  expiresAt?: number; // Optional expiration timestamp for time-sensitive messages.
}

/**
 * Defines a governance policy that agents and systems must adhere to, enabling automated compliance.
 * Business value: Formalized governance policies are paramount for commercial financial infrastructure,
 * ensuring regulatory compliance, risk management, and ethical AI operations. This module allows for
 * the definition and automated enforcement of rules, providing auditable oversight and
 * mitigating legal and reputational risks. It's a key component for building trust and enabling
 * broad enterprise adoption.
 */
export interface GovernancePolicy {
  policyId: string;
  name: string;
  description: string;
  rules: string[]; // e.g., ["prohibit_toxic_language", "enforce_data_privacy", "require_kyc_for_high_value_tx"]
  category: 'security' | 'compliance' | 'ethics' | 'resource_management';
  version: string;
  effectiveDate: number;
  lastUpdated: number;
  status: 'active' | 'draft' | 'deprecated';
  applicableAgents?: string[]; // IDs of agents to which this policy applies.
}

/**
 * Represents a risk score associated with a transaction or entity, informing real-time routing and decision-making.
 * Business value: Real-time risk scoring is critical for fraud prevention, regulatory compliance (AML/KYC),
 * and dynamic routing in financial systems. This enables the platform to proactively identify and mitigate
 * high-risk transactions, protecting assets and maintaining system integrity. It adds a layer of intelligent
 * automation to payment processing, reducing financial losses and enhancing security.
 */
export interface RiskScore {
  entityId: string; // ID of the transaction, user, or agent being scored.
  entityType: 'transaction' | 'user' | 'agent';
  score: number; // Normalized risk score (e.g., 0-100, 100 being highest risk).
  timestamp: number;
  factors: { [factor: string]: number }; // Detailed breakdown of factors contributing to the score (e.g., 'tx_velocity', 'geo_risk').
  thresholdViolated?: boolean; // True if the score exceeds a predefined risk threshold.
  riskEngineId: string; // Identifier of the risk engine that generated the score.
  recommendedAction: 'none' | 'flag' | 'block' | 'review_manual';
}

/**
 * Details of a remediation action taken by an agent to address an anomaly or violation.
 * Business value: Remediation actions are the operational output of intelligent automation,
 * enabling the platform to autonomously correct errors, enforce policies, and recover from failures.
 * This ensures system resilience, minimizes downtime, and reduces manual intervention, directly
 * impacting operational efficiency, cost savings, and continuous service availability.
 */
export interface RemediationAction {
  actionId: string;
  triggeredById: string; // Agent or system that triggered the action.
  triggeredByType: 'AI_AGENT' | 'SYSTEM' | 'USER';
  timestamp: number;
  eventType: string; // e.g., 'ANOMALY_DETECTED', 'POLICY_VIOLATION'.
  targetResourceId: string; // ID of the resource the action applies to (e.g., DebateTurn, Transaction).
  targetResourceType: string; // Type of the target resource.
  actionType: string; // e.g., 'CONTENT_REDACTION', 'TRANSACTION_HOLD', 'AGENT_RESTART', 'USER_NOTIFY'.
  details: { [key: string]: any }; // Specific parameters of the action.
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'reverted';
  auditLogEntryId?: string; // Link to the audit log entry for this action.
}

/**
 * Represents the status of a remediation action associated with a particular system event or resource.
 * Business value: Tracking the status of remediation actions provides real-time visibility into
 * the platform's ability to self-correct and maintain operational integrity. This transparency
 * is crucial for reporting, compliance, and demonstrating the effectiveness of the agentic intelligence layer.
 */
export interface RemediationActionStatus {
  actionId: string;
  status: 'initiated' | 'executing' | 'completed' | 'failed' | 'reverted';
  completionTimestamp?: number;
  errorDetails?: string;
}

// --- Constants and Global Data Structures (Extensive) ---

/**
 * Comprehensive list of logical fallacies with detailed descriptions, examples, and associated types.
 * This structure simulates a backend database or a large configuration file, providing
 * the core knowledge base for the AI's fallacy detection capabilities.
 * Business value: A well-defined and extensive fallacy database is crucial for the AI's
 * analytical depth, delivering high-quality, educationally rich feedback to users.
 * This intellectual asset enhances the platform's credibility and provides a strong
 * foundation for its unique value proposition in critical thinking and argumentation training.
 */
export const FALLACY_DEFINITIONS: { [key: string]: { name: string; description: string; example: string; types: string[] } } = {
  'Ad Hominem': {
    name: 'Ad Hominem',
    description: 'Attacking the person making the argument, rather than the argument itself. This undermines the credibility of the argument by shifting focus to the arguer.',
    example: "You can't trust anything she says about climate change; she's just a disgruntled former oil executive.",
    types: ['Abusive Ad Hominem', 'Circumstantial Ad Hominem', 'Tu Quoque']
  },
  'Straw Man': {
    name: 'Straw Man',
    description: 'Misrepresenting someone\'s argument to make it easier to attack. This distorts the original argument, making the rebuttal irrelevant to the actual claim.',
    example: 'Opponent: "We should relax alcohol laws." Me: "No, any society with unlimited access to intoxicants loses its work ethic and succumbs to hedonism."',
    types: ['Exaggeration', 'Simplification', 'Distortion']
  },
  'Appeal to Authority': {
    name: 'Appeal to Authority',
    description: 'Insisting that a claim is true simply because a valid authority or expert on the issue said it was true, without any other supporting evidence. This presumes infallibility or universal expertise.',
    example: 'My doctor said that all vaccines are harmful, so they must be.',
    types: ['False Authority', 'Irrelevant Authority', 'Appeal to Unqualified Authority']
  },
  'Bandwagon Fallacy': {
    name: 'Bandwagon Fallacy',
    description: 'Claiming that something is true or good because many people believe it is. This relies on popularity rather than evidence or logical reasoning.',
    example: 'Everyone is buying this new cryptocurrency, so it must be a good investment.',
    types: []
  },
  'Slippery Slope': {
    name: 'Slippery Slope',
    description: 'Asserting that a relatively small first step will inevitably lead to a chain of related (and often negative) events. This overstates potential consequences without sufficient causal links.',
    example: 'If we allow children to choose their bedtime, soon they\'ll be making all the rules and our household will descend into anarchy.',
    types: []
  },
  'Hasty Generalization': {
    name: 'Hasty Generalization',
    description: 'Making a broad claim based on a small or unrepresentative sample of observations. This leads to unsupported conclusions due to insufficient evidence.',
    example: 'My grandfather smoked a pack a day and lived to be 90, so smoking isn\'t bad for you.',
    types: ['Anecdotal Evidence']
  },
  'False Cause': {
    name: 'False Cause',
    description: 'Assuming that because two things happened in sequence, the first caused the second. This fallacy confuses correlation with causation.',
    example: 'Since the new mayor took office, the crime rate has decreased. Clearly, the mayor is responsible for the decrease in crime.',
    types: ['Post Hoc Ergo Propter Hoc', 'Cum Hoc Ergo Propter Hoc']
  },
  'Appeal to Emotion': {
    name: 'Appeal to Emotion',
    description: 'Manipulating an emotional response in place of a valid or compelling argument. This bypasses logic by engaging sentiment.',
    example: 'Please don\'t give me a parking ticket, officer. I\'ve had a really terrible day, and this will just make it worse.',
    types: ['Appeal to Pity', 'Appeal to Fear', 'Appeal to Anger']
  },
  'Red Herring': {
    name: 'Red Herring',
    description: 'Diverting attention from the main issue by introducing an irrelevant topic. This shifts the debate away from the central argument.',
    example: 'When asked about rising crime rates, the politician replied, "What about the need to protect our children\'s education?"',
    types: []
  },
  'Begging the Question': {
    name: 'Begging the Question',
    description: 'An argument\'s premise assumes the truth of its conclusion. This creates a circular argument that offers no independent proof.',
    example: 'God exists because the Bible says so, and the Bible is true because it\'s the word of God.',
    types: ['Circular Reasoning']
  },
  'Fallacy of Composition': {
    name: 'Fallacy of Composition',
    description: 'Assuming that what is true for the parts is true for the whole. This incorrectly aggregates properties from individuals to a collective.',
    example: 'Each player on the team is excellent, so the team itself must be excellent.',
    types: []
  },
  'Fallacy of Division': {
    name: 'Fallacy of Division',
    description: 'Assuming that what is true for the whole is true for its parts. This incorrectly disaggregates properties from a collective to individuals.',
    example: 'The company is highly successful, so every employee must be highly successful.',
    types: []
  },
  'Appeal to Ignorance': {
    name: 'Appeal to Ignorance',
    description: 'Asserting that a claim is true because it has not been proven false, or false because it has not been proven true. Lack of evidence is not evidence of absence.',
    example: 'Since no one has proven that ghosts don\'t exist, they must be real.',
    types: []
  },
  'False Dilemma/Dichotomy': {
    name: 'False Dilemma/Dichotomy',
    description: 'Presenting only two options or sides when there are actually more. This oversimplifies complex issues and limits reasonable choices.',
    example: 'You\'re either with us or against us.',
    types: ['Black-or-White Fallacy']
  },
  'No True Scotsman': {
    name: 'No True Scotsman',
    description: 'An attempt to protect a generalized statement from counterexamples by shifting the definition of the terms in question. It arbitrarily excludes exceptions.',
    example: 'All programmers are introverts. "But John is a programmer and very extroverted." "Well, then John isn\'t a *true* programmer."',
    types: []
  },
  'Tu Quoque': {
    name: 'Tu Quoque',
    description: 'Avoiding engaging with criticism by turning it back on the accuser. This distracts from the argument\'s validity by pointing out hypocrisy.',
    example: 'You say I shouldn\'t drink so much, but you drink even more than I do!',
    types: ['Whataboutism']
  },
  'Burden of Proof': {
    name: 'Burden of Proof',
    description: 'Shifting the responsibility of proving a point from the person making the claim to someone else. The person making the extraordinary claim usually bears the burden.',
    example: 'I believe in telepathy, prove me wrong.',
    types: []
  },
  'Genetic Fallacy': {
    name: 'Genetic Fallacy',
    description: 'Judging something good or bad on the basis of where it comes from, or from whom it comes. This disregards current context or merit.',
    example: 'That theory about economics is flawed; it came from a country that used to be communist.',
    types: []
  },
  'Appeal to Nature': {
    name: 'Appeal to Nature',
    description: 'Arguing that something is good because it is "natural," or bad because it is "unnatural." This assumes naturalness inherently equates to goodness or safety.',
    example: 'Herbal remedies are better for you because they are natural.',
    types: []
  },
  'Equivocation': {
    name: 'Equivocation',
    description: 'Using an ambiguous term in more than one sense within the same argument, thereby making the argument misleading. This exploits wordplay to create false coherence.',
    example: 'All men are mortal. My car is a man-made machine. Therefore, my car is mortal.', // Here, "man" is used ambiguously.
    types: ['Semantic Ambiguity']
  },
};

/**
 * Defines a set of available AI agent types, representing fundamental agentic capabilities within the financial infrastructure.
 * Business value: These fundamental agent types represent the building blocks of the Agentic AI System.
 * They enable the platform to deploy specialized AI functions dynamically, supporting tasks like
 * real-time monitoring, financial reconciliation, and automated remediation. This modularity ensures
 * scalability, efficient resource allocation, and the rapid deployment of new AI-driven services,
 * forming a critical component of the platform's long-term competitive advantage. Each agent type
 * has defined permissions and governance mandates for enterprise control.
 */
export const AGENT_TYPES = {
  'DebateMaster': {
    description: 'Specializes in logical argumentation, fallacy detection, and strategic counter-arguments.',
    skills: ['natural_language_understanding', 'argument_analysis', 'fallacy_detection', 'knowledge_retrieval', 'argument_generation'],
    category: 'Conversational AI',
    requiredPermissions: ['read:user_profile', 'write:debate_turn', 'read:governance_policies'],
    supportedGovernancePolicies: ['content_moderation_v1', 'data_privacy_v2']
  },
  'FinancialReconciler': {
    description: 'Monitors token rail transactions for discrepancies, identifies anomalies, and proposes reconciliation steps.',
    skills: ['transaction_monitoring', 'anomaly_detection', 'ledger_reconciliation', 'rule_engine_execution', 'audit_logging'],
    category: 'Financial Operations',
    requiredPermissions: ['read:token_ledger', 'write:remediation_action', 'write:audit_log'],
    supportedGovernancePolicies: ['financial_compliance_v3', 'fraud_detection_v1']
  },
  'IdentityVerifier': {
    description: 'Handles digital identity verification requests, validates claims, and manages keypairs.',
    skills: ['digital_signature_verification', 'keypair_management', 'rbac_policy_enforcement', 'secure_storage_access'],
    category: 'Security & Identity',
    requiredPermissions: ['read:identity_claims', 'write:identity_claims', 'manage:public_keys'],
    supportedGovernancePolicies: ['kyc_aml_policy_v2', 'data_privacy_v2']
  },
  'PaymentRouter': {
    description: 'Routes payment instructions across multiple token rails based on policy, cost, and latency metrics.',
    skills: ['payment_orchestration', 'predictive_routing', 'risk_scoring', 'transaction_settlement'],
    category: 'Payments Infrastructure',
    requiredPermissions: ['read:payment_requests', 'write:token_ledger_entry', 'read:risk_scores'],
    supportedGovernancePolicies: ['settlement_policy_v1', 'fee_optimization_v1']
  },
  'SentimentAnalyst': {
    description: 'Analyzes textual input for emotional tone and sentiment, providing insights for user interaction.',
    skills: ['sentiment_analysis', 'emotion_detection', 'natural_language_processing'],
    category: 'Analytics',
    requiredPermissions: ['read:debate_turn_text'],
    supportedGovernancePolicies: ['data_privacy_v2', 'content_moderation_v1']
  },
  'GovernanceEnforcer': {
    description: 'Monitors system activities for policy violations and triggers remediation actions.',
    skills: ['policy_monitoring', 'event_logging_analysis', 'remediation_triggering', 'audit_reporting'],
    category: 'Governance & Compliance',
    requiredPermissions: ['read:audit_log', 'read:governance_policies', 'write:remediation_action'],
    supportedGovernancePolicies: ['all'] // Applies to all governance policies.
  }
};