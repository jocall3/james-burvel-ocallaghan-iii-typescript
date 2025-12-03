/**
 * This module implements the comprehensive dashboard for monitoring and managing the intricate balance of system resources and user cognitive load. It serves as the central control panel for the Money20/20 "build phase" architecture, integrating real-time insights from agentic AI systems, token rails, digital identity services, and real-time payments infrastructure.
 * Business Value: This view is worth millions by providing a unified, real-time operational picture that prevents system bottlenecks, optimizes user experience, and ensures the continuous, high-performance flow of value. It enables proactive problem resolution, reduces operational costs through intelligent automation, safeguards revenue by maintaining transaction throughput, and enhances regulatory compliance through transparent monitoring. The adaptive cognitive load balancing ensures optimal feature engagement, leading to higher user retention and satisfaction, directly impacting profitability and market leadership.
 */
import React, { useState, useEffect } from 'react';

/**
 * Defines the structure for a single cognitive load metric snapshot.
 * This metric provides immediate insight into the user's interaction burden,
 * a critical factor for maintaining user engagement and preventing fatigue.
 * Business Value: Direct impact on user experience and retention by quantifying
 * and allowing for the mitigation of feature complexity, leading to sustained
 * platform usage and higher conversion rates.
 */
interface CognitiveMetric {
  /** The ISO string timestamp of when the metric was recorded. */
  timestamp: string;
  /** The average cognitive load, ranging from 0.0 (minimal) to 1.0 (maximal). */
  avgCognitiveLoad: number; // 0.0 to 1.0
  /** A list of feature names currently being throttled due to high load. */
  activeThrottles: string[]; // Feature names being throttled
}

/**
 * Categorizes features for granular management and policy application.
 * This categorization enables targeted load balancing and resource allocation,
 * optimizing performance across diverse functional areas.
 * Business Value: Allows for strategic resource allocation, ensuring high-priority
 * or revenue-generating features maintain performance even under stress,
 * directly protecting critical business operations.
 */
export enum FeatureCategory {
  Analytics = 'Analytics',
  Collaboration = 'Collaboration',
  DataEntry = 'Data Entry',
  Reporting = 'Reporting',
  Admin = 'Administration',
  Communication = 'Communication',
  Utility = 'Utility',
  Search = 'Search',
  Configuration = 'Configuration',
  Automation = 'Automation',
  Integrations = 'Integrations',
  Notifications = 'Notifications',
  UserManagement = 'User Management',
  PerformanceMonitoring = 'Performance Monitoring',
  Security = 'Security',
  DevelopmentTools = 'Development Tools',
  MachineLearning = 'Machine Learning',
  VirtualReality = 'Virtual Reality',
  AugmentedReality = 'Augmented Reality',
  Simulation = 'Simulation',
  AgentAI = 'Agent AI', // New category for AI agents
  TokenRails = 'Token Rails', // New category for Token Rails
  Payments = 'Payments', // New category for Payments Infrastructure
  Identity = 'Digital Identity', // New category for Digital Identity
  Orchestration = 'Orchestration', // New category for System Orchestration
}

/**
 * Defines various sophisticated strategies for applying throttling.
 * These strategies allow for adaptive, intelligent, and business-value-driven
 * load management, moving beyond simple static limits.
 * Business Value: Enables dynamic optimization of system resources and user experience,
 * minimizing disruption during peak loads and maximizing throughput, thereby
 * directly contributing to operational efficiency and user satisfaction.
 */
export enum ThrottlingStrategy {
  StaticThreshold = 'Static Threshold',
  DynamicAdaptive = 'Dynamic Adaptive',
  PredictiveML = 'Predictive ML',
  UserSegmentSpecific = 'User Segment Specific',
  TimeBased = 'Time-Based',
  CapacityBased = 'Capacity-Based',
  PriorityBased = 'Priority-Based',
  FeatureDependency = 'Feature Dependency',
  RevenueImpact = 'Revenue Impact',
  ComplianceDriven = 'Compliance-Driven',
  AgentDriven = 'Agent Driven', // New strategy: agents make throttling decisions
}

/**
 * Levels of alert severity, enabling rapid prioritization and response
 * to operational anomalies and potential system degradation.
 * Business Value: Critical for operational resilience, allowing teams to quickly
 * focus on high-impact issues, minimize downtime, and prevent service disruptions,
 * safeguarding revenue and brand reputation.
 */
export enum AlertSeverity {
  Info = 'Info',
  Warning = 'Warning',
  Critical = 'Critical',
  Emergency = 'Emergency',
}

/**
 * Represents different user segments that might have distinct
 * cognitive load profiles or throttling needs. Tailoring experiences to segments
 * enhances personalization and targeted resource management.
 * Business Value: Optimizes resource allocation based on user value or behavior,
 * ensuring VIP users receive premium service, new users are guided, and
 * specific business objectives tied to user groups are met.
 */
export enum UserSegment {
  NewUser = 'New User',
  ExperiencedUser = 'Experienced User',
  PowerUser = 'Power User',
  Admin = 'Admin',
  Guest = 'Guest',
  Developer = 'Developer',
  Analyst = 'Analyst',
  Manager = 'Manager',
  Executive = 'Executive',
  ExternalPartner = 'External Partner',
  InternalSupport = 'Internal Support',
}

/**
 * Detailed definition of a feature within the application, providing
 * metadata essential for intelligent load balancing, impact assessment, and governance.
 * Business Value: Facilitates granular control over individual system components,
 * enabling precise performance tuning, cost optimization, and strategic decision-making
 * regarding feature development and rollout, ultimately enhancing product-market fit.
 */
export interface FeatureDefinition {
  /** Unique identifier for the feature. */
  id: string;
  /** Display name of the feature. */
  name: string;
  /** A brief explanation of the feature. */
  description: string;
  /** Categorization of the feature, aiding in policy application. */
  category: FeatureCategory;
  /** Estimated cognitive load impact of the feature (0.0 to 1.0, higher means more demanding). */
  cognitiveWeight: number; // 0.0 - 1.0, higher means more demanding
  /** Default load threshold above which this feature *might* be throttled. */
  baseThrottleThreshold: number; // e.g., 0.7
  /** Whether the feature is currently enabled in the system. */
  isActive: boolean;
  /** Other features this one depends on (for complex throttling). */
  dependencies: string[]; // IDs of other features it depends on
  /** Metrics that quantify the business impact if this feature is throttled (e.g., 'conversion_rate', 'time_on_page'). */
  impactMetrics: { name: string; value: number }[];
  /** Estimated time for user's cognitive load to recover after using this feature (in seconds). */
  recoveryTimeEstimate: number; // in seconds
  /** Timestamp of the last definition update. */
  lastUpdated: string;
  /** Team responsible for the feature. */
  ownerTeam: string;
  /** How the feature is rolled out (e.g., 'all_users', 'beta_testers', 'segment_specific'). */
  rolloutStrategy: 'all_users' | 'beta_testers' | 'segment_specific';
}

/**
 * Defines a specific policy for throttling features. These policies
 * are the algorithmic backbone of the load balancer, dictating when and how
 * system resources are managed to prevent overload.
 * Business Value: The core mechanism for ensuring system stability and performance
 * under varying load conditions, directly preventing outages, managing operational costs
 * by deferring non-critical workloads, and maintaining service quality for high-value operations.
 */
export interface ThrottlingPolicy {
  /** Unique identifier for the policy. */
  id: string;
  /** Name of the policy. */
  name: string;
  /** Explanation of the policy. */
  description: string;
  /** The algorithm or method used for throttling. */
  strategy: ThrottlingStrategy;
  /** Features to which this policy applies. */
  targetFeatureIds: string[];
  /** Which user segments this policy applies to. */
  userSegments: UserSegment[];
  /** Configuration for thresholds (e.g., dynamic range, static value). */
  thresholdConfig: {
    minLoad?: number; // For dynamic strategies
    maxLoad?: number; // For dynamic strategies
    staticLoadThreshold?: number; // For static strategies
    durationThreshold?: number; // How long load must be high (seconds)
    cooldownPeriod?: number; // How long to wait after de-throttling (seconds)
  };
  /** Rules for when this policy becomes active (e.g., "system_cpu_gt_80", "time_of_day_between_9_17"). */
  activationConditions: string[]; // e.g., "system_cpu_gt_80", "time_of_day_between_9_17"
  /** Rules for when this policy stops. */
  deactivationConditions: string[]; // e.g., "system_cpu_lt_60"
  /** Order of application if multiple policies could apply (lower number means higher priority). */
  priority: number; // Lower number means higher priority
  /** Indicates if the policy is currently active. */
  isActive: boolean;
  /** User who last modified the policy. */
  lastModifiedBy: string;
  /** Timestamp of last modification. */
  lastModifiedDate: string;
  /** Metrics used to evaluate the policy's effectiveness (e.g., 'reduced_load_avg', 'user_retention_rate'). */
  efficacyMetrics: { name: string; targetValue: number }[];
  /** Optional A/B test group identifier for policy evaluation. */
  A_BTestGroup?: string;
}

/**
 * Defines rules for generating system alerts, acting as the sentinel
 * for operational health and performance boundaries.
 * Business Value: Minimizes mean-time-to-resolution (MTTR) for critical issues,
 * preventing minor incidents from escalating into major outages, thus protecting
 * revenue streams and preserving service availability.
 */
export interface AlertDefinition {
  /** Unique identifier for the alert definition. */
  id: string;
  /** Name of the alert. */
  name: string;
  /** What the alert signifies. */
  description: string;
  /** How critical the alert is. */
  severity: AlertSeverity;
  /** Logic for triggering the alert (e.g., "avgCognitiveLoad > 0.9 for 5 minutes"). */
  condition: string;
  /** Features related to this alert. */
  targetFeatures: string[];
  /** User segments affected by this alert. */
  targetUserSegments: UserSegment[];
  /** How to notify (e.g., "email", "slack", "pagerduty"). */
  notificationChannels: string[];
  /** Whether the alert rule is active. */
  isActive: boolean;
  /** How long to wait before re-triggering the same alert (seconds). */
  debouncePeriod: number;
  /** Condition for automatic resolution. */
  autoResolveCondition: string;
  /** ID of an escalation policy to follow if the alert is not resolved promptly. */
  escalationPolicyId?: string; // ID of an escalation policy
}

/**
 * Represents an active or resolved alert, providing a historical
 * and current view of operational incidents.
 * Business Value: Offers traceability and accountability for operational events,
 * aiding in post-incident analysis and continuous improvement processes,
 * which contributes to long-term system stability and trust.
 */
export interface AlertInstance {
  /** Unique identifier for this specific alert instance. */
  id: string;
  /** The ID of the AlertDefinition that triggered this instance. */
  definitionId: string;
  /** When the alert was triggered. */
  timestamp: string;
  /** When the alert was resolved (if applicable). */
  resolvedTimestamp?: string;
  /** Current status ('active', 'resolved', 'acknowledged'). */
  status: 'active' | 'resolved' | 'acknowledged';
  /** The value that caused the alert to trigger. */
  triggeredValue: string;
  /** Additional data relevant to the alert (e.g., affected users, system state). */
  context: Record<string, any>;
  /** User or team assigned to handle the alert. */
  assignedTo?: string;
  /** Historical notes or actions taken on this alert. */
  notes: string[];
}

/**
 * Represents various system health metrics that can influence or be influenced
 * by cognitive load and throttling. This provides a holistic view of underlying infrastructure.
 * Business Value: Ensures the foundational stability of the entire platform,
 * preventing cascading failures and providing the necessary infrastructure context
 * for optimizing high-level business logic, protecting performance and scalability.
 */
export interface SystemHealthMetric {
  /** When the metric was recorded. */
  timestamp: string;
  /** CPU utilization percentage (0-100%). */
  cpuUsage: number; // 0-100%
  /** Memory utilization percentage (0-100%). */
  memoryUsage: number; // 0-100%
  /** Average network latency in milliseconds. */
  networkLatency: number; // ms
  /** Number of active database connections. */
  databaseConnections: number;
  /** Application error rate (errors per minute). */
  errorRate: number; // errors per minute
  /** Depth of message queues, indicating processing backlog. */
  queueDepth: number;
  /** Number of currently active users. */
  activeUsers: number;
  /** Number of running background tasks. */
  backgroundTasks: number;
  /** Disk I/O operations per second. */
  diskIO: number; // ops/sec
  /** Rate of API calls per second. */
  apiCallRate: number; // calls/sec
}

/**
 * Logs specific user interactions, crucial for correlating user behavior
 * with observed cognitive load and feature engagement.
 * Business Value: Provides empirical data for UX/UI improvements and feature prioritization,
 * leading to a more intuitive and efficient user experience, which translates to
 * increased feature adoption and user satisfaction.
 */
export interface UserInteractionLog {
  /** Time of interaction. */
  timestamp: string;
  /** ID of the user. */
  userId: string;
  /** ID of the feature interacted with. */
  featureId: string;
  /** Type of interaction (e.g., 'click', 'input', 'view'). */
  interactionType: string;
  /** Duration of interaction (milliseconds). */
  duration: number; // milliseconds
  /** Estimated impact of this specific interaction on cognitive load. */
  cognitiveImpactEstimate: number;
  /** Other relevant metrics at the time of interaction. */
  relatedMetrics: { metric: string; value: number }[];
}

/**
 * Aggregated historical cognitive load data for reporting and analysis.
 * This historical perspective is vital for identifying trends, optimizing policies,
 * and capacity planning.
 * Business Value: Enables long-term strategic planning, resource forecasting,
 * and validates the effectiveness of load balancing policies, ensuring continuous
 * improvement in system performance and user experience, driving sustained growth.
 */
export interface HistoricalCognitiveData {
  /** Start of the aggregation period. */
  timestamp: string;
  /** Average cognitive load during the period. */
  avgLoad: number;
  /** Maximum cognitive load during the period. */
  maxLoad: number;
  /** Minimum cognitive load during the period. */
  minLoad: number;
  /** Map of feature ID to total duration it was throttled in this period (seconds). */
  activeThrottleDurations: Record<string, number>; // featureId -> seconds
  /** Cognitive load metrics broken down by user segment. */
  userSegmentBreakdown: Record<UserSegment, { avgLoad: number; userCount: number }>;
  /** Estimated contribution of each feature to the overall load. */
  featureContribution: Record<string, number>; // featureId -> estimated load contribution
}

/**
 * Forecasted cognitive load based on historical data and current trends,
 * leveraging machine learning for proactive decision-making.
 * Business Value: Transforms operations from reactive to proactive, allowing for
 * pre-emptive resource scaling and policy adjustments, thereby preventing incidents
 * before they occur and maintaining service levels even during predictable peak demand.
 */
export interface PredictiveForecast {
  /** The time for which the forecast is made. */
  timestamp: string;
  /** Predicted average cognitive load. */
  forecastedLoad: number;
  /** Upper and lower bounds of the prediction. */
  confidenceInterval: [number, number]; // [lower, upper]
  /** Factors identified as strongly influencing the forecast. */
  influencingFactors: Record<string, number>; // factor -> influence score
  /** Proactive throttling suggestions based on the forecast. */
  recommendedActions: { featureId: string; action: 'throttle' | 'ease'; rationale: string }[];
}

/**
 * Status of the adaptive feedback loop for optimizing throttling policies.
 * This loop embodies the intelligent, self-optimizing nature of the load balancer.
 * Business Value: Automates the continuous improvement of load balancing strategies,
 * ensuring the system is always learning and adapting to new patterns, leading to
 * maximized efficiency and resilience with minimal human intervention, reducing operational costs.
 */
export interface FeedbackLoopStatus {
  /** When the feedback loop last evaluated policies. */
  lastEvaluationTimestamp: string;
  /** IDs of policies evaluated. */
  policiesEvaluated: string[];
  /** Suggested changes to policies based on evaluation. */
  proposedAdjustments: Record<string, string>; // policyId -> suggested change
  /** Overall score for current policies (0.0 - 1.0). */
  efficacyScore: number;
  /** When the next evaluation is scheduled. */
  nextEvaluationDue: string;
  /** A message indicating the current status or goal of the feedback loop. */
  statusMessage: string; // e.g., "Optimizing for user retention"
  /** The primary optimization goal (e.g., "minimize_avg_load", "maximize_feature_usage"). */
  optimizationGoal: string; // e.g., "minimize_avg_load", "maximize_feature_usage"
}

/**
 * Represents a user's profile with cognitive load relevant attributes.
 * This information helps in segment-specific load management and personalized experiences.
 * Business Value: Enables highly personalized and optimized user experiences,
 * increasing user satisfaction and feature adoption, and allows for differentiated
 * service levels based on user segment or historical behavior.
 */
export interface UserProfile {
  /** Unique user ID. */
  userId: string;
  /** The user's assigned segment. */
  segment: UserSegment;
  /** Percentage of onboarding completed. */
  onboardingCompletion: number;
  /** How engaged the user is. */
  engagementScore: number;
  /** A brief history of cognitive load for this user. */
  recentCognitiveLoadHistory: CognitiveMetric[];
  /** User's preferred language. */
  preferredLanguage: string;
  /** User-specific throttling overrides (e.g., "never throttle feature X"). */
  customThrottlePreferences: Record<string, 'throttle' | 'ease' | 'default'>;
  /** Current account status ('active', 'inactive', 'suspended'). */
  accountStatus: 'active' | 'inactive' | 'suspended';
  /** Timestamp of the user's last activity. */
  lastActivity: string;
  /** Public cryptographic key for this user's digital identity. */
  publicKey?: string;
  /** A cryptographic signature to verify the integrity of the profile. */
  profileSignature?: string;
}

/**
 * Configuration for external system integrations, facilitating
 * alerts, metrics, and data flow to external operational tools.
 * Business Value: Ensures seamless interoperability with existing enterprise systems
 * and monitoring tools, enabling a unified operational view, reducing manual effort,
 * and accelerating incident response through automated notifications.
 */
export interface IntegrationConfig {
  /** Integration ID. */
  id: string;
  /** Integration name. */
  name: string;
  /** Type of integration (e.g., 'slack', 'datadog', 'jira'). */
  type: 'slack' | 'datadog' | 'jira' | 'email' | 'custom_webhook';
  /** Connection status. */
  status: 'connected' | 'disconnected' | 'error';
  /** Specific settings for the integration (e.g., webhook URL, API keys). */
  settings: Record<string, string>;
  /** Timestamp of last successful test. */
  lastTested?: string;
}

/**
 * Categorizes AI agents by their primary function within the ecosystem.
 * This segmentation helps in assigning roles, policies, and monitoring specific agent groups.
 * Business Value: Streamlines the management and governance of diverse AI agents,
 * ensuring they operate within their designated scopes and contribute effectively
 * to system objectives, optimizing AI resource utilization and effectiveness.
 */
export enum AgentCategory {
  Monitoring = 'Monitoring',
  Remediation = 'Remediation',
  Reconciliation = 'Reconciliation',
  Orchestration = 'Orchestration',
  FraudDetection = 'Fraud Detection',
  Compliance = 'Compliance',
  Reporting = 'Reporting',
  DataAnalysis = 'Data Analysis',
  CustomerSupport = 'Customer Support',
  Security = 'Security',
}

/**
 * Defines the specific capabilities or skills an AI agent possesses.
 * This granular definition allows for precise task assignment and skill-based routing.
 * Business Value: Enables the efficient deployment and utilization of AI agents
 * by matching tasks to specialized skills, accelerating automation, and increasing
 * the accuracy and reliability of automated processes across the platform.
 */
export enum AgentSkill {
  AnomalyDetection = 'Anomaly Detection',
  SystemDiagnosis = 'System Diagnosis',
  PolicyEnforcement = 'Policy Enforcement',
  TransactionProcessing = 'Transaction Processing',
  LedgerUpdate = 'Ledger Update',
  IdentityVerification = 'Identity Verification',
  RiskAssessment = 'Risk Assessment',
  Communication = 'Communication',
  DataAggregation = 'Data Aggregation',
  SmartContractExecution = 'Smart Contract Execution',
  ErrorHandling = 'Error Handling',
  ResourceAllocation = 'Resource Allocation',
  SentimentAnalysis = 'Sentiment Analysis',
  KeyManagement = 'Key Management', // New skill for identity agents
}

/**
 * Defines an autonomous AI agent within the system, including its
 * purpose, capabilities, and operational parameters. Agents are key to the
 * Money20/20 build phase architecture, enabling autonomous, intelligent operations.
 * Business Value: Establishes a programmable, scalable workforce of intelligent
 * agents that automate complex workflows, significantly reducing manual operational
 * overhead, improving response times, and enabling new levels of system resilience and agility.
 */
export interface AgentDefinition {
  /** Unique identifier for the agent. */
  id: string;
  /** Display name of the agent. */
  name: string;
  /** A brief explanation of the agent's primary function. */
  description: string;
  /** Primary category of the agent. */
  category: AgentCategory;
  /** List of skills the agent possesses. */
  skills: AgentSkill[];
  /** Current status of the agent ('active', 'idle', 'suspended', 'error'). */
  status: 'active' | 'idle' | 'suspended' | 'error';
  /** Configuration settings specific to the agent's operation. */
  configuration: Record<string, any>;
  /** Load threshold for the agent (e.g., maximum concurrent tasks). */
  operationalLoadThreshold: number;
  /** Timestamp of the last definition update. */
  lastUpdated: string;
  /** Owner team responsible for the agent. */
  ownerTeam: string;
  /** Role-based access control (RBAC) role assigned to the agent. */
  rbacRole: string;
  /** Public cryptographic key for the agent's digital identity. */
  publicKey?: string;
}

/**
 * Real-time operational health and performance metrics for an individual AI agent.
 * Monitoring these metrics ensures agents perform optimally and identifies potential issues.
 * Business Value: Guarantees the continuous, efficient operation of AI agents,
 * proactively identifying and resolving performance bottlenecks or failures,
 * thereby maximizing the ROI from agentic automation and safeguarding automated processes.
 */
export interface AgentHealthMetric {
  /** Timestamp of when the metric was recorded. */
  timestamp: string;
  /** ID of the agent this metric pertains to. */
  agentId: string;
  /** Current CPU usage percentage of the agent process. */
  cpuUsage: number;
  /** Current memory usage percentage of the agent process. */
  memoryUsage: number;
  /** Number of tasks currently being processed by the agent. */
  activeTasks: number;
  /** Rate of tasks processed per minute. */
  taskThroughput: number;
  /** Error rate of tasks processed by the agent. */
  errorRate: number;
  /** Average latency for task completion by the agent (in ms). */
  avgTaskLatency: number;
  /** A general health score (0.0 to 1.0, 1.0 being perfect). */
  healthScore: number;
}

/**
 * Defines distinct types of token rails, such as fast settlement
 * or batch processing, reflecting different operational characteristics and costs.
 * Business Value: Supports multi-rail orchestration, enabling businesses to choose
 * the most cost-effective and performance-appropriate rail for each transaction,
 * optimizing financial operations and reducing transaction costs.
 */
export enum TokenRailType {
  Fast = 'Fast Rail',
  Batch = 'Batch Rail',
  HighValue = 'High Value Rail',
  Compliance = 'Compliance Rail',
}

/**
 * Describes the lifecycle status of a token transaction.
 * This provides crucial visibility into the state of value movements.
 * Business Value: Offers real-time transparency and auditability for all token movements,
 * essential for financial reconciliation, fraud detection, and maintaining
 * stakeholder trust in the integrity of the ledger.
 */
export enum TokenTransactionStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Failed = 'Failed',
  Reversed = 'Reversed',
  Blocked = 'Blocked',
  Expired = 'Expired',
}

/**
 * Real-time operational metrics for a specific token rail,
 * indicating its throughput, latency, and overall health.
 * Business Value: Provides critical observability into the performance of financial
 * rails, enabling dynamic load balancing and routing decisions to ensure optimal
 * transaction speed and reliability, directly impacting real-time payment guarantees.
 */
export interface TokenRailMetrics {
  /** Timestamp of when the metric was recorded. */
  timestamp: string;
  /** ID of the token rail. */
  railId: string;
  /** Type of the token rail. */
  railType: TokenRailType;
  /** Current transaction throughput rate (transactions per second). */
  tps: number;
  /** Average latency for transactions on this rail (in ms). */
  avgLatency: number;
  /** Current error rate for transactions on this rail. */
  errorRate: number;
  /** Depth of the transaction queue for this rail. */
  queueDepth: number;
  /** Current operational status ('operational', 'degraded', 'offline'). */
  status: 'operational' | 'degraded' | 'offline';
  /** Total value transacted through this rail in the last period. */
  totalValueTransacted: number;
}

/**
 * Represents a snapshot of a token account's balance and recent activity.
 * This is a fundamental component of the token rail layer for auditing and reconciliation.
 * Business Value: Provides an immutable, auditable record of token balances,
 * enabling precise financial reporting, real-time liquidity management, and
 * robust fraud prevention capabilities within the token rail ecosystem.
 */
export interface TokenAccountSnapshot {
  /** Unique identifier for the account. */
  accountId: string;
  /** Current balance of tokens in the account. */
  balance: number;
  /** ISO string of the last transaction timestamp. */
  lastTransactionTimestamp: string;
  /** Total number of transactions processed for this account. */
  transactionCount: number;
  /** List of recent transactions (simplified for snapshot). */
  recentTransactions: { txId: string; amount: number; status: TokenTransactionStatus }[];
}

/**
 * Provides the overall operational status and key metrics of the
 * real-time payments infrastructure. This offers a high-level health check.
 * Business Value: Ensures the seamless operation of critical payment workflows,
 * minimizes potential revenue loss from payment processing issues, and allows
 * for immediate intervention to maintain payment availability and speed.
 */
export interface PaymentEngineStatus {
  /** Timestamp of the status update. */
  timestamp: string;
  /** Overall operational status ('online', 'partially_degraded', 'offline'). */
  overallStatus: 'online' | 'partially_degraded' | 'offline';
  /** Current payment request throughput (requests per second). */
  requestsPerSecond: number;
  /** Average processing latency for payment requests (in ms). */
  avgProcessingLatency: number;
  /** Rate of failed payment requests. */
  failureRate: number;
  /** Number of transactions currently in flight. */
  inFlightTransactions: number;
  /** Number of transactions flagged for review by fraud detection. */
  flaggedTransactions: number;
  /** Breakdown of status by individual payment rails. */
  railStatuses: Record<string, 'operational' | 'degraded' | 'offline'>;
}

/**
 * Detailed metrics for individual payment requests or aggregated payment flows,
 * essential for performance analysis and identifying bottlenecks.
 * Business Value: Facilitates granular performance analysis of the payment system,
 * enabling optimization of routing, cost reduction, and continuous improvement
 * of the payment user experience, directly impacting financial throughput.
 */
export interface PaymentRequestMetric {
  /** Timestamp of the metric recording. */
  timestamp: string;
  /** Unique ID of the payment request (or an aggregation ID). */
  requestId: string;
  /** Source of the payment. */
  source: string;
  /** Destination of the payment. */
  destination: string;
  /** Amount of the payment. */
  amount: number;
  /** Currency of the payment. */
  currency: string;
  /** Chosen token rail for the payment. */
  chosenRail: TokenRailType;
  /** Processing time of the payment (in ms). */
  processingTime: number;
  /** Final status of the payment. */
  status: TokenTransactionStatus;
  /** Risk score assigned by the fraud detection module. */
  riskScore: number;
  /** Reason for any payment flags or blocks. */
  fraudReason?: string;
}

/**
 * Provides the operational status and key performance indicators for
 * the digital identity and security services. This ensures robust authentication
 * and authorization.
 * Business Value: Upholds the security and integrity of the entire platform by
 * ensuring identity services are robust and available, preventing unauthorized
 * access, and protecting sensitive data and financial transactions.
 */
export interface IdentityServiceStatus {
  /** Timestamp of the status update. */
  timestamp: string;
  /** Overall status ('operational', 'degraded', 'offline'). */
  overallStatus: 'operational' | 'degraded' | 'offline';
  /** Number of authentication requests per second. */
  authRequestsPerSecond: number;
  /** Average latency for authentication requests (in ms). */
  avgAuthLatency: number;
  /** Rate of failed authentication attempts. */
  failedAuthRate: number;
  /** Number of authorization checks per second. */
  authzChecksPerSecond: number;
  /** Number of active user sessions. */
  activeSessions: number;
  /** Status of cryptographic key management ('healthy', 'warning', 'critical'). */
  keyManagementStatus: 'healthy' | 'warning' | 'critical';
  /** A list of recent security incidents or anomalies detected. */
  securityIncidents: string[];
}

/**
 * Defines categories of authentication and authorization events,
 * crucial for audit logging and security monitoring.
 * Business Value: Provides granular logging for security events, enabling
 * sophisticated threat detection, forensic analysis, and compliance reporting,
 * strengthening the overall security posture and reducing financial risk.
 */
export enum AuthEventType {
  LoginSuccess = 'Login Success',
  LoginFailure = 'Login Failure',
  Logout = 'Logout',
  PasswordChange = 'Password Change',
  SessionStart = 'Session Start',
  SessionEnd = 'Session End',
  AccessGranted = 'Access Granted',
  AccessDenied = 'Access Denied',
  KeyGeneration = 'Key Generation',
  KeyRotation = 'Key Rotation',
  MFAAttempt = 'MFA Attempt',
  MFAChallenge = 'MFA Challenge',
  MFAFailure = 'MFA Failure',
}

/**
 * Represents a single entry in the authentication and authorization audit log.
 * This log is tamper-evident and crucial for security and compliance.
 * Business Value: Forms the bedrock of forensic capabilities and regulatory compliance,
 * ensuring that every access decision and identity event is recorded, immutable,
 * and verifiable, thereby meeting stringent security and audit requirements.
 */
export interface AuthLogEntry {
  /** Unique ID for the log entry. */
  id: string;
  /** Timestamp of the event. */
  timestamp: string;
  /** Type of authentication/authorization event. */
  eventType: AuthEventType;
  /** ID of the user or agent involved. */
  entityId: string;
  /** Source IP address of the request. */
  ipAddress: string;
  /** Outcome of the event (e.g., 'success', 'failure', 'denied'). */
  outcome: 'success' | 'failure' | 'denied' | 'info';
  /** Detailed message about the event. */
  message: string;
  /** Relevant context for the event (e.g., feature accessed, reason for denial). */
  context: Record<string, any>;
  /** Hash of the previous log entry, ensuring tamper-evidence. */
  previousHash: string;
  /** Hash of this log entry for integrity verification. */
  entryHash: string;
}

/**
 * Defines a process for escalating alerts to different teams or channels
 * based on severity and time, ensuring critical issues are always addressed.
 * Business Value: Guarantees that high-priority incidents receive prompt attention
 * from the correct personnel, minimizing service disruption and potential financial loss
 * by orchestrating a rapid and effective incident response.
 */
export interface EscalationPolicy {
  /** Unique identifier for the escalation policy. */
  id: string;
  /** Name of the policy. */
  name: string;
  /** Description of the policy's purpose. */
  description: string;
  /** List of escalation steps, each with a delay and target. */
  steps: {
    delaySeconds: number; // Delay before this step is activated
    targetType: 'channel' | 'team' | 'user'; // Type of target
    targetIdentifier: string; // e.g., 'slack_channel_ops', 'on_call_team_1', 'user_john_doe'
    notificationMessage: string; // Custom message for this step
  }[];
  /** Whether the policy is currently active. */
  isActive: boolean;
  /** Last modification timestamp. */
  lastModifiedDate: string;
  /** User who last modified the policy. */
  lastModifiedBy: string;
}

// Utility Functions ---------------------------------------------------------------------------------------------------

/**
 * Generates a simple, universally unique identifier (UUIDv4).
 * This function is critical for ensuring unique IDs across all system entities,
 * from features and policies to transactions and agents, enabling robust data
 * management and preventing collision issues.
 * Business Value: Provides foundational uniqueness for all data entities,
 * which is essential for database integrity, distributed system coordination,
 * and reliable audit trails.
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Generates a simple, non-cryptographic hash for data integrity simulation.
 * This function is used to create a chained hash for audit logs, demonstrating
 * tamper-evidence within the mock system.
 * Business Value: Provides a foundational layer for simulating data integrity
 * and immutability, critical for audit trails and compliance in financial systems,
 * even without external cryptographic libraries.
 */
export const simpleDeterministicHash = (data: string, previousHash: string = 'genesis'): string => {
  // For simulation, we combine data and previous hash to create a "chained" fingerprint.
  // In a real system, this would be a robust cryptographic hash (e.g., SHA-256).
  const combinedData = data + previousHash + 'salt_for_deterministic_seed'; // Add a fixed salt for deterministic behavior in mock
  let hash = 0;
  for (let i = 0; i < combinedData.length; i++) {
    const char = combinedData.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  // Convert hash to a hex string for a more "hash-like" appearance, and prepend a fixed prefix.
  return `mockhash-${(hash >>> 0).toString(16).padStart(8, '0')}-${generateUUID().split('-')[0]}`; // Blend with UUID segment for uniqueness
};


/**
 * Calculates the average of an array of numbers. This utility is used
 * across various metrics calculations to derive meaningful insights from raw data.
 * Business Value: Provides a fundamental statistical aggregation, enabling
 * quick summaries of performance and load data, which is vital for dashboard
 * visualizations and automated decision-making.
 */
export const calculateAverage = (data: number[]): number => {
  if (data.length === 0) return 0;
  return data.reduce((sum, val) => sum + val, 0) / data.length;
};

/**
 * Returns a Tailwind CSS class for visual indication of load levels.
 * This function provides immediate visual cues for system health, aiding rapid
 * interpretation of dashboard data.
 * Business Value: Enhances observability by providing intuitive visual indicators
 * of system health, allowing operators to quickly identify problem areas and
 * prioritize intervention, thereby reducing response times.
 */
export const getLoadColorClass = (load: number): string => {
  if (load > 0.85) return 'text-red-500';
  if (load > 0.7) return 'text-orange-400';
  if (load > 0.5) return 'text-yellow-300';
  return 'text-green-400';
};

/**
 * Simulates throttling a feature and logging the event. In a production
 * environment, this would trigger a sophisticated backend mechanism to reduce
 * resource allocation or limit access to the specified feature.
 * Business Value: Acts as a critical control mechanism for load balancing,
 * allowing the system to gracefully degrade non-essential services during peak
 * demand, protecting core functionality and ensuring overall system stability,
 * safeguarding revenue and critical operations.
 */
export const throttleFeature = (featureId: string, reason: string, affectedSegments: UserSegment[]): void => {
  console.log(`[ACTION] Throttling feature '${featureId}' due to: ${reason}. Affected segments: ${affectedSegments.join(', ')}`);
};

/**
 * Simulates easing a throttled feature. In a production environment,
 * this would signal the backend to restore full functionality or increased
 * resource allocation to the feature.
 * Business Value: Restores full feature functionality when load conditions improve,
 * ensuring users consistently receive the best possible experience and maximizing
 * the utility of all platform features as resources become available.
 */
export const easeFeatureThrottle = (featureId: string, reason: string): void => {
  console.log(`[ACTION] Easing throttle on feature '${featureId}' due to: ${reason}.`);
};

/**
 * Formats a duration in seconds into a human-readable string (e.g., 60s, 1.5m, 2.3h).
 * This enhances the readability of time-based metrics and logs.
 * Business Value: Improves the clarity and accessibility of time-related data for operators
 * and analysts, facilitating quicker understanding of durations and trends without manual conversion.
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds.toFixed(0)}s`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${minutes.toFixed(1)}m`;
  const hours = minutes / 60;
  return `${hours.toFixed(1)}h`;
};

/**
 * A highly simplified mock API for simulating backend calls. This function
 * is crucial for rapid frontend development and testing without requiring a live backend.
 * In a real commercial-grade implementation, this would be replaced by actual API clients
 * interacting with robust, authenticated microservices.
 * Business Value: Accelerates development cycles and simplifies testing, enabling
 * rapid iteration and validation of UI components and data flows against simulated
 * real-world scenarios, thereby reducing time-to-market for new features and capabilities.
 */
export const mockBackendAPI = async (endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let result: any;
      switch (endpoint) {
        case 'features':
          if (method === 'GET') {
            result = mockFeatures;
          } else if (method === 'POST' && data) {
            const newFeature = { ...data, id: generateUUID(), lastUpdated: new Date().toISOString() };
            mockFeatures.push(newFeature);
            result = newFeature;
          } else if (method === 'PUT' && data && data.id) {
            const index = mockFeatures.findIndex(f => f.id === data.id);
            if (index !== -1) {
              mockFeatures[index] = { ...mockFeatures[index], ...data, lastUpdated: new Date().toISOString() };
              result = mockFeatures[index];
            } else {
              reject(new Error('Feature not found'));
              return;
            }
          } else if (method === 'DELETE' && data && data.id) {
            const initialLength = mockFeatures.length;
            mockFeatures = mockFeatures.filter(f => f.id !== data.id);
            if (mockFeatures.length === initialLength) {
              reject(new Error('Feature not found for deletion'));
              return;
            }
            result = { success: true, id: data.id };
          }
          break;
        case 'policies':
          if (method === 'GET') {
            result = mockThrottlingPolicies;
          } else if (method === 'POST' && data) {
            const newPolicy = { ...data, id: generateUUID(), lastModifiedDate: new Date().toISOString() };
            mockThrottlingPolicies.push(newPolicy);
            result = newPolicy;
          } else if (method === 'PUT' && data && data.id) {
            const index = mockThrottlingPolicies.findIndex(p => p.id === data.id);
            if (index !== -1) {
              mockThrottlingPolicies[index] = { ...mockThrottlingPolicies[index], ...data, lastModifiedDate: new Date().toISOString() };
              result = mockThrottlingPolicies[index];
            } else {
              reject(new Error('Policy not found'));
              return;
            }
          } else if (method === 'DELETE' && data && data.id) {
            const initialLength = mockThrottlingPolicies.length;
            mockThrottlingPolicies = mockThrottlingPolicies.filter(p => p.id !== data.id);
            if (mockThrottlingPolicies.length === initialLength) {
              reject(new Error('Policy not found for deletion'));
              return;
            }
            result = { success: true, id: data.id };
          }
          break;
        case 'alerts/definitions':
          if (method === 'GET') {
            result = mockAlertDefinitions;
          } else if (method === 'POST' && data) {
            const newAlertDef = { ...data, id: generateUUID() };
            mockAlertDefinitions.push(newAlertDef);
            result = newAlertDef;
          } else if (method === 'PUT' && data && data.id) {
            const index = mockAlertDefinitions.findIndex(a => a.id === data.id);
            if (index !== -1) {
              mockAlertDefinitions[index] = { ...mockAlertDefinitions[index], ...data };
              result = mockAlertDefinitions[index];
            } else {
              reject(new Error('Alert Definition not found'));
              return;
            }
          } else if (method === 'DELETE' && data && data.id) {
            const initialLength = mockAlertDefinitions.length;
            mockAlertDefinitions = mockAlertDefinitions.filter(d => d.id !== data.id);
            if (mockAlertDefinitions.length === initialLength) {
              reject(new Error('Alert Definition not found for deletion'));
              return;
            }
            result = { success: true, id: data.id };
          }
          break;
        case 'alerts/instances':
          if (method === 'GET') {
            result = mockAlertInstances;
          } else if (method === 'PUT' && data && data.id) {
            const index = mockAlertInstances.findIndex(a => a.id === data.id);
            if (index !== -1) {
              mockAlertInstances[index] = { ...mockAlertInstances[index], ...data };
              result = mockAlertInstances[index];
            } else {
              reject(new Error('Alert Instance not found'));
              return;
            }
          }
          break;
        case 'alerts/escalation_policies':
          if (method === 'GET') {
            result = mockEscalationPolicies;
          } else if (method === 'POST' && data) {
            const newPolicy = { ...data, id: generateUUID(), lastModifiedDate: new Date().toISOString() };
            mockEscalationPolicies.push(newPolicy);
            result = newPolicy;
          } else if (method === 'PUT' && data && data.id) {
            const index = mockEscalationPolicies.findIndex(p => p.id === data.id);
            if (index !== -1) {
              mockEscalationPolicies[index] = { ...mockEscalationPolicies[index], ...data, lastModifiedDate: new Date().toISOString() };
              result = mockEscalationPolicies[index];
            } else {
              reject(new Error('Escalation Policy not found'));
              return;
            }
          } else if (method === 'DELETE' && data && data.id) {
            const initialLength = mockEscalationPolicies.length;
            mockEscalationPolicies = mockEscalationPolicies.filter(p => p.id !== data.id);
            if (mockEscalationPolicies.length === initialLength) {
              reject(new Error('Escalation Policy not found for deletion'));
              return;
            }
            result = { success: true, id: data.id };
          }
          break;
        case 'users':
          if (method === 'GET') {
            result = mockUserProfiles;
          } else if (method === 'PUT' && data && data.id) { // Example for updating user keys
            const index = mockUserProfiles.findIndex(u => u.userId === data.userId);
            if (index !== -1) {
              mockUserProfiles[index] = { ...mockUserProfiles[index], ...data };
              result = mockUserProfiles[index];
            } else {
              reject(new Error('User profile not found'));
              return;
            }
          }
          break;
        case 'integrations':
          if (method === 'GET') {
            result = mockIntegrationConfigs;
          } else if (method === 'POST' && data) {
            const newIntegration = { ...data, id: generateUUID(), status: 'disconnected' };
            mockIntegrationConfigs.push(newIntegration);
            result = newIntegration;
          } else if (method === 'PUT' && data && data.id) {
            const index = mockIntegrationConfigs.findIndex(i => i.id === data.id);
            if (index !== -1) {
              mockIntegrationConfigs[index] = { ...mockIntegrationConfigs[index], ...data };
              result = mockIntegrationConfigs[index];
            } else {
              reject(new Error('Integration config not found'));
              return;
            }
          } else if (method === 'DELETE' && data && data.id) {
            const initialLength = mockIntegrationConfigs.length;
            mockIntegrationConfigs = mockIntegrationConfigs.filter(i => i.id !== data.id);
            if (mockIntegrationConfigs.length === initialLength) {
              reject(new Error('Integration config not found for deletion'));
              return;
            }
            result = { success: true, id: data.id };
          }
          break;
        case 'system_health':
          result = mockSystemHealthMetrics;
          break;
        case 'historical_data':
          result = mockHistoricalCognitiveData;
          break;
        case 'forecast':
          result = mockPredictiveForecast;
          break;
        case 'feedback_loop':
          result = mockFeedbackLoopStatus;
          break;
        case 'agents':
          if (method === 'GET') {
            result = mockAgentDefinitions;
          } else if (method === 'POST' && data) {
            const newAgent = { ...data, id: generateUUID(), lastUpdated: new Date().toISOString() };
            mockAgentDefinitions.push(newAgent);
            result = newAgent;
          } else if (method === 'PUT' && data && data.id) {
            const index = mockAgentDefinitions.findIndex(a => a.id === data.id);
            if (index !== -1) {
              mockAgentDefinitions[index] = { ...mockAgentDefinitions[index], ...data, lastUpdated: new Date().toISOString() };
              result = mockAgentDefinitions[index];
            } else {
              reject(new Error('Agent not found'));
              return;
            }
          } else if (method === 'DELETE' && data && data.id) {
            const initialLength = mockAgentDefinitions.length;
            mockAgentDefinitions = mockAgentDefinitions.filter(a => a.id !== data.id);
            if (mockAgentDefinitions.length === initialLength) {
              reject(new Error('Agent not found for deletion'));
              return;
            }
            result = { success: true, id: data.id };
          }
          break;
        case 'agents/health':
          result = mockAgentHealthMetrics;
          break;
        case 'token_rails':
          result = mockTokenRailMetrics;
          break;
        case 'token_accounts':
          result = mockTokenAccountSnapshots;
          break;
        case 'payments/engine_status':
          result = mockPaymentEngineStatus;
          break;
        case 'payments/requests':
          if (method === 'GET') {
            result = mockPaymentRequestMetrics;
          } else if (method === 'POST' && data) {
            const newPayment = {
              ...data,
              requestId: `pay_req_${generateUUID().substring(0, 8)}`,
              timestamp: new Date().toISOString(),
              processingTime: Math.random() * 200 + 50,
              status: Math.random() > 0.9 ? TokenTransactionStatus.Failed : TokenTransactionStatus.Confirmed,
              riskScore: Math.random() * 0.1
            };
            mockPaymentRequestMetrics.push(newPayment);
            result = newPayment;
          }
          break;
        case 'identity/status':
          result = mockIdentityServiceStatus;
          break;
        case 'identity/auth_logs':
          if (method === 'GET') {
            result = mockAuthLogEntries;
          } else if (method === 'POST' && data) {
            const previousLog = mockAuthLogEntries.length > 0 ? mockAuthLogEntries[mockAuthLogEntries.length - 1] : null;
            const previousHash = previousLog ? previousLog.entryHash : 'genesis_block_hash';
            const logContent = JSON.stringify({ eventType: data.eventType, entityId: data.entityId, outcome: data.outcome, message: data.message, context: data.context });
            const entryHash = simpleDeterministicHash(logContent, previousHash);

            const newLog = {
              ...data,
              id: generateUUID(),
              timestamp: new Date().toISOString(),
              previousHash: previousHash,
              entryHash: entryHash,
            };
            mockAuthLogEntries.push(newLog);
            result = newLog;
          }
          break;
        default:
          reject(new Error(`Mock API endpoint not found or not supported: ${endpoint}`));
          return;
      }
      resolve(result);
    }, 500); // Simulate network latency
  });
};

// Mock Data -----------------------------------------------------------------------------------------------------------

export let mockFeatures: FeatureDefinition[] = [
  {
    id: 'feat_adv_analytics', name: 'Advanced Analytics', description: 'Provides deep dive data analysis tools.', category: FeatureCategory.Analytics, cognitiveWeight: 0.9, baseThrottleThreshold: 0.8, isActive: true, dependencies: [], impactMetrics: [{ name: 'decision_quality', value: 0.8 }], recoveryTimeEstimate: 300, lastUpdated: '2023-01-15T10:00:00Z', ownerTeam: 'Data Science', rolloutStrategy: 'all_users'
  },
  {
    id: 'feat_realtime_collaboration', name: 'Realtime Collaboration', description: 'Enables live document editing and chat.', category: FeatureCategory.Collaboration, cognitiveWeight: 0.8, baseThrottleThreshold: 0.75, isActive: true, dependencies: [], impactMetrics: [{ name: 'team_productivity', value: 0.9 }], recoveryTimeEstimate: 240, lastUpdated: '2023-01-16T11:00:00Z', ownerTeam: 'Productivity Suite', rolloutStrategy: 'all_users'
  },
  {
    id: 'feat_task_management', name: 'Task Management', description: 'Organize and track tasks for projects.', category: FeatureCategory.Utility, cognitiveWeight: 0.5, baseThrottleThreshold: 0.6, isActive: true, dependencies: [], impactMetrics: [{ name: 'project_completion_rate', value: 0.7 }], recoveryTimeEstimate: 120, lastUpdated: '2023-01-17T09:30:00Z', ownerTeam: 'Core Platform', rolloutStrategy: 'all_users'
  },
  {
    id: 'feat_reporting_dashboard', name: 'Custom Reporting Dashboard', description: 'Create and view personalized reports.', category: FeatureCategory.Reporting, cognitiveWeight: 0.7, baseThrottleThreshold: 0.7, isActive: true, dependencies: ['feat_adv_analytics'], impactMetrics: [{ name: 'data_insight_speed', value: 0.85 }], recoveryTimeEstimate: 180, lastUpdated: '2023-01-18T14:00:00Z', ownerTeam: 'Data Science', rolloutStrategy: 'all_users'
  },
  {
    id: 'feat_data_import', name: 'Data Import Wizard', description: 'Guided process for importing external data.', category: FeatureCategory.DataEntry, cognitiveWeight: 0.6, baseThrottleThreshold: 0.65, isActive: true, dependencies: [], impactMetrics: [{ name: 'data_onboarding_speed', value: 0.9 }], recoveryTimeEstimate: 90, lastUpdated: '2023-01-19T10:00:00Z', ownerTeam: 'Integrations', rolloutStrategy: 'all_users'
  },
  {
    id: 'feat_user_settings', name: 'User Profile Settings', description: 'Manage personal user information and preferences.', category: FeatureCategory.Admin, cognitiveWeight: 0.3, baseThrottleThreshold: 0.5, isActive: true, dependencies: [], impactMetrics: [{ name: 'user_satisfaction', value: 0.95 }], recoveryTimeEstimate: 60, lastUpdated: '2023-01-20T08:00:00Z', ownerTeam: 'Core Platform', rolloutStrategy: 'all_users'
  },
  {
    id: 'feat_ai_assistant', name: 'AI Assistant', description: 'Provides intelligent suggestions and automation.', category: FeatureCategory.Automation, cognitiveWeight: 0.95, baseThrottleThreshold: 0.88, isActive: true, dependencies: [], impactMetrics: [{ name: 'user_efficiency', value: 0.92 }], recoveryTimeEstimate: 360, lastUpdated: '2023-01-21T16:00:00Z', ownerTeam: 'AI Research', rolloutStrategy: 'beta_testers'
  },
  {
    id: 'feat_realtime_notifications', name: 'Realtime Notifications', description: 'Instant alerts for critical events.', category: FeatureCategory.Notifications, cognitiveWeight: 0.4, baseThrottleThreshold: 0.6, isActive: true, dependencies: [], impactMetrics: [{ name: 'response_time', value: 0.8 }], recoveryTimeEstimate: 30, lastUpdated: '2023-01-22T09:00:00Z', ownerTeam: 'Notifications', rolloutStrategy: 'all_users'
  },
  {
    id: 'feat_search', name: 'Global Search', description: 'Search across all application data and features.', category: FeatureCategory.Search, cognitiveWeight: 0.55, baseThrottleThreshold: 0.6, isActive: true, dependencies: [], impactMetrics: [{ name: 'information_retrieval_speed', value: 0.88 }], recoveryTimeEstimate: 75, lastUpdated: '2023-01-23T11:00:00Z', ownerTeam: 'Core Platform', rolloutStrategy: 'all_users'
  },
  {
    id: 'feat_virtual_workspaces', name: 'Virtual Workspaces', description: 'Create isolated environments for specific projects.', category: FeatureCategory.Collaboration, cognitiveWeight: 0.85, baseThrottleThreshold: 0.82, isActive: true, dependencies: ['feat_realtime_collaboration'], impactMetrics: [{ name: 'team_focus', value: 0.91 }], recoveryTimeEstimate: 320, lastUpdated: '2023-01-24T13:00:00Z', ownerTeam: 'Productivity Suite', rolloutStrategy: 'all_users'
  },
  {
    id: 'feat_agent_orchestration', name: 'Agent Orchestration Console', description: 'Monitor and control AI agent workflows.', category: FeatureCategory.AgentAI, cognitiveWeight: 0.7, baseThrottleThreshold: 0.75, isActive: true, dependencies: [], impactMetrics: [{ name: 'agent_operational_efficiency', value: 0.95 }], recoveryTimeEstimate: 180, lastUpdated: '2023-03-01T09:00:00Z', ownerTeam: 'AI Platform', rolloutStrategy: 'all_users'
  },
  {
    id: 'feat_token_rail_monitor', name: 'Token Rail Monitor', description: 'Observe real-time performance of token rails.', category: FeatureCategory.TokenRails, cognitiveWeight: 0.6, baseThrottleThreshold: 0.7, isActive: true, dependencies: [], impactMetrics: [{ name: 'financial_transaction_speed', value: 0.99 }], recoveryTimeEstimate: 120, lastUpdated: '2023-03-01T10:00:00Z', ownerTeam: 'Fintech Core', rolloutStrategy: 'all_users'
  },
  {
    id: 'feat_payment_routing', name: 'Payment Routing Dashboard', description: 'Manage and visualize real-time payment routing.', category: FeatureCategory.Payments, cognitiveWeight: 0.8, baseThrottleThreshold: 0.85, isActive: true, dependencies: ['feat_token_rail_monitor'], impactMetrics: [{ name: 'payment_settlement_rate', value: 0.98 }], recoveryTimeEstimate: 240, lastUpdated: '2023-03-01T11:00:00Z', ownerTeam: 'Payments Engine', rolloutStrategy: 'all_users'
  },
  {
    id: 'feat_identity_security', name: 'Identity & Security Controls', description: 'Configure digital identity and access policies.', category: FeatureCategory.Identity, cognitiveWeight: 0.9, baseThrottleThreshold: 0.9, isActive: true, dependencies: [], impactMetrics: [{ name: 'security_incident_reduction', value: 0.99 }], recoveryTimeEstimate: 300, lastUpdated: '2023-03-01T12:00:00Z', ownerTeam: 'Security Team', rolloutStrategy: 'all_users'
  },
];

export let mockThrottlingPolicies: ThrottlingPolicy[] = [
  {
    id: 'policy_high_load_general', name: 'High Load General Throttling', description: 'Activates when overall cognitive load is very high, impacting high-weight features.', strategy: ThrottlingStrategy.DynamicAdaptive, targetFeatureIds: ['feat_adv_analytics', 'feat_realtime_collaboration', 'feat_ai_assistant', 'feat_virtual_workspaces'], userSegments: [UserSegment.ExperiencedUser, UserSegment.Manager], thresholdConfig: { minLoad: 0.85, maxLoad: 0.95, durationThreshold: 60, cooldownPeriod: 300 }, activationConditions: ['avgCognitiveLoad_gt_0.85_for_60s'], deactivationConditions: ['avgCognitiveLoad_lt_0.75_for_120s'], priority: 1, isActive: true, lastModifiedBy: 'admin', lastModifiedDate: '2023-02-01T09:00:00Z', efficacyMetrics: [{ name: 'reduced_avg_load', targetValue: 0.1 }]
  },
  {
    id: 'policy_analytics_peak_hours', name: 'Analytics Peak Hours Throttling', description: 'Reduces analytics performance during peak business hours for non-priority users.', strategy: ThrottlingStrategy.TimeBased, targetFeatureIds: ['feat_adv_analytics', 'feat_reporting_dashboard'], userSegments: [UserSegment.NewUser, UserSegment.Guest], thresholdConfig: { staticLoadThreshold: 0.7 }, activationConditions: ['time_of_day_between_09_00_17_00_local', 'system_cpu_gt_70'], deactivationConditions: ['time_of_day_outside_09_00_17_00_local', 'system_cpu_lt_60'], priority: 2, isActive: true, lastModifiedBy: 'sys_ops', lastModifiedDate: '2023-02-05T14:30:00Z', efficacyMetrics: [{ name: 'core_feature_uptime', targetValue: 0.999 }]
  },
  {
    id: 'policy_new_user_protection', name: 'New User Load Protection', description: 'Prevents new users from being exposed to extremely high cognitive load features.', strategy: ThrottlingStrategy.UserSegmentSpecific, targetFeatureIds: ['feat_adv_analytics', 'feat_ai_assistant'], userSegments: [UserSegment.NewUser], thresholdConfig: { staticLoadThreshold: 0.7 }, activationConditions: ['user_segment_is_new_user', 'avgCognitiveLoad_gt_0.7'], deactivationConditions: ['user_segment_is_not_new_user', 'avgCognitiveLoad_lt_0.6'], priority: 0, isActive: true, lastModifiedBy: 'product_mgr', lastModifiedDate: '2023-02-10T10:00:00Z', efficacyMetrics: [{ name: 'new_user_retention', targetValue: 0.75 }]
  },
  {
    id: 'policy_dev_environment', name: 'Development Environment Throttling', description: 'More aggressive throttling in dev environments to simulate production load.', strategy: ThrottlingStrategy.StaticThreshold, targetFeatureIds: mockFeatures.map(f => f.id), userSegments: [UserSegment.Developer], thresholdConfig: { staticLoadThreshold: 0.6, durationThreshold: 10, cooldownPeriod: 60 }, activationConditions: ['environment_is_development'], deactivationConditions: ['environment_is_production'], priority: 99, isActive: true, lastModifiedBy: 'dev_ops', lastModifiedDate: '2023-02-12T15:00:00Z', efficacyMetrics: []
  },
  {
    id: 'policy_agent_overload', name: 'Agent Overload Protection', description: 'Throttles agent orchestration features if core agents are overloaded.', strategy: ThrottlingStrategy.AgentDriven, targetFeatureIds: ['feat_agent_orchestration'], userSegments: [], thresholdConfig: { staticLoadThreshold: 0.8, durationThreshold: 30 }, activationConditions: ['agent_health_score_lt_0.6', 'agent_active_tasks_gt_500'], deactivationConditions: ['agent_health_score_gt_0.7'], priority: 5, isActive: true, lastModifiedBy: 'ai_ops', lastModifiedDate: '2023-03-05T10:00:00Z', efficacyMetrics: [{ name: 'agent_stability', targetValue: 0.9 }]
  },
  {
    id: 'policy_payment_rail_stress', name: 'Payment Rail Stress Throttling', description: 'Prioritizes critical payment rails during high system stress.', strategy: ThrottlingStrategy.CapacityBased, targetFeatureIds: ['feat_payment_routing'], userSegments: [], thresholdConfig: { staticLoadThreshold: 0.9, durationThreshold: 60 }, activationConditions: ['token_rail_latency_gt_200ms', 'payment_engine_failure_rate_gt_0.05'], deactivationConditions: ['token_rail_latency_lt_100ms', 'payment_engine_failure_rate_lt_0.01'], priority: 0, isActive: true, lastModifiedBy: 'fin_ops', lastModifiedDate: '2023-03-05T11:00:00Z', efficacyMetrics: [{ name: 'critical_payment_success_rate', targetValue: 0.999 }]
  },
];

export let mockAlertDefinitions: AlertDefinition[] = [
  {
    id: 'alert_critical_load', name: 'Critical Cognitive Load', description: 'Total average cognitive load exceeds critical threshold.', severity: AlertSeverity.Critical, condition: 'avgCognitiveLoad > 0.9 for 120s', targetFeatures: [], targetUserSegments: [], notificationChannels: ['email', 'slack', 'pagerduty'], isActive: true, debouncePeriod: 300, autoResolveCondition: 'avgCognitiveLoad < 0.8 for 300s', escalationPolicyId: 'esc_policy_tier1'
  },
  {
    id: 'alert_throttle_failure', name: 'Throttling Mechanism Failure', description: 'Throttling policies are active but load remains high.', severity: AlertSeverity.Emergency, condition: 'policiesActive_true AND avgCognitiveLoad > 0.95 for 60s', targetFeatures: [], targetUserSegments: [], notificationChannels: ['email', 'slack', 'pagerduty'], isActive: true, debouncePeriod: 180, autoResolveCondition: 'avgCognitiveLoad < 0.8 AND policiesActive_false_or_effective', escalationPolicyId: 'esc_policy_tier2'
  },
  {
    id: 'alert_feature_load_spike', name: 'Feature Specific Load Spike', description: 'A single feature is causing disproportionate cognitive load.', severity: AlertSeverity.Warning, condition: 'feature_adv_analytics_cognitiveContribution > 0.3 for 300s', targetFeatures: ['feat_adv_analytics'], targetUserSegments: [], notificationChannels: ['email', 'slack'], isActive: true, debouncePeriod: 600, autoResolveCondition: 'feature_adv_analytics_cognitiveContribution < 0.2', escalationPolicyId: 'esc_policy_tier1'
  },
  {
    id: 'alert_user_segment_distress', name: 'New User Segment Distress', description: 'New users experiencing sustained high cognitive load.', severity: AlertSeverity.Warning, condition: 'userSegment_NewUser_avgCognitiveLoad > 0.8 for 300s', targetFeatures: [], targetUserSegments: [UserSegment.NewUser], notificationChannels: ['email', 'slack'], isActive: true, debouncePeriod: 600, autoResolveCondition: 'userSegment_NewUser_avgCognitiveLoad < 0.7'
  },
  {
    id: 'alert_agent_critical_health', name: 'Agent Critical Health', description: 'An AI agent\'s health score dropped below critical levels.', severity: AlertSeverity.Critical, condition: 'agent_health_score_lt_0.5 for 60s AND agent_active_tasks_gt_0', targetFeatures: ['feat_agent_orchestration'], targetUserSegments: [], notificationChannels: ['email', 'slack', 'pagerduty'], isActive: true, debouncePeriod: 300, autoResolveCondition: 'agent_health_score_gt_0.7', escalationPolicyId: 'esc_policy_tier1'
  },
  {
    id: 'alert_token_rail_degraded', name: 'Token Rail Degraded Performance', description: 'A critical token rail is experiencing high latency or errors.', severity: AlertSeverity.Emergency, condition: 'token_rail_avgLatency_gt_150ms OR token_rail_errorRate_gt_0.02', targetFeatures: ['feat_token_rail_monitor', 'feat_payment_routing'], targetUserSegments: [], notificationChannels: ['email', 'slack', 'pagerduty'], isActive: true, debouncePeriod: 180, autoResolveCondition: 'token_rail_avgLatency_lt_80ms AND token_rail_errorRate_lt_0.005', escalationPolicyId: 'esc_policy_tier2'
  },
  {
    id: 'alert_auth_failure_spike', name: 'Authentication Failure Spike', description: 'Significant increase in failed login attempts, potential attack.', severity: AlertSeverity.Critical, condition: 'identity_failedAuthRate_gt_0.1 for 30s', targetFeatures: ['feat_identity_security'], targetUserSegments: [], notificationChannels: ['email', 'slack', 'pagerduty'], isActive: true, debouncePeriod: 60, autoResolveCondition: 'identity_failedAuthRate_lt_0.01', escalationPolicyId: 'esc_policy_tier2'
  },
];

export let mockAlertInstances: AlertInstance[] = [
  {
    id: 'alert_inst_001', definitionId: 'alert_critical_load', timestamp: '2023-03-01T10:00:00Z', status: 'active', triggeredValue: '0.92', context: { currentLoad: 0.92, activeThrottles: ['AdvancedAnalytics'] }, assignedTo: 'on-call-dev', notes: ['Investigating infrastructure capacity.']
  },
  {
    id: 'alert_inst_002', definitionId: 'alert_feature_load_spike', timestamp: '2023-03-01T09:30:00Z', resolvedTimestamp: '2023-03-01T09:45:00Z', status: 'resolved', triggeredValue: '0.35', context: { feature: 'feat_adv_analytics', affectedUsers: 15 }, assignedTo: 'data-science-team', notes: ['Identified large query, optimized.', 'Resolved automatically.']
  },
  {
    id: 'alert_inst_003', definitionId: 'alert_user_segment_distress', timestamp: '2023-03-02T11:15:00Z', status: 'acknowledged', triggeredValue: '0.81', context: { segment: 'New User', userCount: 200 }, assignedTo: 'product-team', notes: ['Monitoring impact of recent UI change.']
  },
  {
    id: 'alert_inst_004', definitionId: 'alert_token_rail_degraded', timestamp: '2023-03-05T14:00:00Z', status: 'active', triggeredValue: '180ms latency', context: { railId: 'rail_fast', tps: 1200, errorRate: 0.03 }, assignedTo: 'fin-ops', notes: ['Investigating upstream connectivity.']
  },
];

export let mockEscalationPolicies: EscalationPolicy[] = [
  {
    id: 'esc_policy_tier1', name: 'Tier 1 Critical Incident Escalation', description: 'Immediate notification to on-call, then engineering lead.',
    steps: [
      { delaySeconds: 0, targetType: 'team', targetIdentifier: 'on_call_dev', notificationMessage: 'Critical Alert: {ALERT_NAME} - {ALERT_DESCRIPTION}' },
      { delaySeconds: 300, targetType: 'user', targetIdentifier: 'engineering_lead_johndoe', notificationMessage: 'Escalation: {ALERT_NAME} unresolved after 5 minutes. Details: {ALERT_URL}' },
    ],
    isActive: true, lastModifiedDate: '2023-03-01T09:00:00Z', lastModifiedBy: 'admin'
  },
  {
    id: 'esc_policy_tier2', name: 'Tier 2 Financial Incident Escalation', description: 'Immediate to fin-ops, then financial director.',
    steps: [
      { delaySeconds: 0, targetType: 'team', targetIdentifier: 'fin_ops_team', notificationMessage: 'EMERGENCY: Financial system alert: {ALERT_NAME} - {ALERT_DESCRIPTION}' },
      { delaySeconds: 180, targetType: 'user', targetIdentifier: 'financial_director_janedoe', notificationMessage: 'URGENT ESCALATION: Financial critical alert {ALERT_NAME} unresolved.' },
    ],
    isActive: true, lastModifiedDate: '2023-03-01T09:15:00Z', lastModifiedBy: 'admin'
  }
];

export const mockSystemHealthMetrics: SystemHealthMetric[] = Array.from({ length: 20 }).map((_, i) => ({
  timestamp: new Date(Date.now() - (19 - i) * 5 * 1000).toISOString(),
  cpuUsage: Math.random() * 30 + 50, // 50-80%
  memoryUsage: Math.random() * 20 + 60, // 60-80%
  networkLatency: Math.random() * 50 + 20, // 20-70ms
  databaseConnections: Math.floor(Math.random() * 100 + 100), // 100-200
  errorRate: Math.random() * 0.5, // 0-0.5 errors/min
  queueDepth: Math.floor(Math.random() * 200),
  activeUsers: Math.floor(Math.random() * 1000 + 500),
  backgroundTasks: Math.floor(Math.random() * 50 + 10),
  diskIO: Math.floor(Math.random() * 500 + 200),
  apiCallRate: Math.floor(Math.random() * 1000 + 500),
}));

export let mockUserProfiles: UserProfile[] = Array.from({ length: 50 }).map((_, i) => ({
  userId: `user_${i + 1}`,
  segment: i % 3 === 0 ? UserSegment.NewUser : i % 5 === 0 ? UserSegment.Admin : UserSegment.ExperiencedUser,
  onboardingCompletion: i < 10 ? Math.floor(Math.random() * 90) : 100,
  engagementScore: Math.random(),
  recentCognitiveLoadHistory: [], // Populated dynamically or via another mock source
  preferredLanguage: i % 2 === 0 ? 'en-US' : 'es-ES',
  customThrottlePreferences: i % 7 === 0 ? { 'feat_adv_analytics': 'ease' } : {},
  accountStatus: i % 10 === 0 ? 'suspended' : 'active',
  lastActivity: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
  publicKey: `mock_user_pubkey_${i + 1}`,
  profileSignature: `mock_user_sig_${i + 1}`,
}));

export let mockIntegrationConfigs: IntegrationConfig[] = [
  { id: 'int_slack', name: 'Slack Notifications', type: 'slack', status: 'connected', settings: { webhookUrl: 'https://hooks.slack.com/services/mock/mock' }, lastTested: '2023-03-01T08:00:00Z' },
  { id: 'int_pagerduty', name: 'PagerDuty On-Call', type: 'custom_webhook', status: 'connected', settings: { serviceKey: 'mock_key_pd' }, lastTested: '2023-03-01T08:05:00Z' },
  { id: 'int_datadog', name: 'Datadog Metrics', type: 'datadog', status: 'disconnected', settings: { apiKey: 'mock_key_dd' } },
  { id: 'int_email', name: 'Email Alerts', type: 'email', status: 'connected', settings: { smtpHost: 'smtp.mock.com', sender: 'alerts@mock.com' }, lastTested: '2023-03-01T08:10:00Z' },
  { id: 'int_jira', name: 'Jira Incident Management', type: 'jira', status: 'connected', settings: { projectKey: 'PROJ', issueType: 'Task' }, lastTested: '2023-03-01T08:15:00Z' },
];

export const mockHistoricalCognitiveData: HistoricalCognitiveData[] = Array.from({ length: 30 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const avgLoad = Math.random() * 0.4 + 0.4; // 0.4 - 0.8
  return {
    timestamp: date.toISOString(),
    avgLoad: avgLoad,
    maxLoad: Math.min(avgLoad + Math.random() * 0.1, 1.0),
    minLoad: Math.max(avgLoad - Math.random() * 0.1, 0.0),
    activeThrottleDurations: {
      'feat_adv_analytics': avgLoad > 0.7 ? Math.floor(Math.random() * 3600) : 0,
      'feat_realtime_collaboration': avgLoad > 0.75 ? Math.floor(Math.random() * 2400) : 0,
    },
    userSegmentBreakdown: {
      [UserSegment.NewUser]: { avgLoad: Math.random() * 0.2 + avgLoad, userCount: Math.floor(Math.random() * 100) },
      [UserSegment.ExperiencedUser]: { avgLoad: Math.random() * 0.1 + avgLoad, userCount: Math.floor(Math.random() * 500) },
      [UserSegment.Admin]: { avgLoad: Math.random() * 0.05 + avgLoad, userCount: Math.floor(Math.random() * 50) },
      [UserSegment.PowerUser]: { avgLoad: Math.random() * 0.15 + avgLoad, userCount: Math.floor(Math.random() * 150) },
      [UserSegment.Guest]: { avgLoad: Math.random() * 0.1 + avgLoad, userCount: Math.floor(Math.random() * 20) },
      [UserSegment.Developer]: { avgLoad: Math.random() * 0.1 + avgLoad, userCount: Math.floor(Math.random() * 30) },
      [UserSegment.Analyst]: { avgLoad: Math.random() * 0.1 + avgLoad, userCount: Math.floor(Math.random() * 80) },
      [UserSegment.Manager]: { avgLoad: Math.random() * 0.1 + avgLoad, userCount: Math.floor(Math.random() * 70) },
      [UserSegment.Executive]: { avgLoad: Math.random() * 0.1 + avgLoad, userCount: Math.floor(Math.random() * 10) },
      [UserSegment.ExternalPartner]: { avgLoad: Math.random() * 0.1 + avgLoad, userCount: Math.floor(Math.random() * 25) },
      [UserSegment.InternalSupport]: { avgLoad: Math.random() * 0.1 + avgLoad, userCount: Math.floor(Math.random() * 40) },
    },
    featureContribution: {
      'feat_adv_analytics': avgLoad * 0.3,
      'feat_realtime_collaboration': avgLoad * 0.25,
      'feat_task_management': avgLoad * 0.1,
      'feat_reporting_dashboard': avgLoad * 0.15,
      'feat_ai_assistant': avgLoad * 0.2,
      'feat_agent_orchestration': avgLoad * 0.05,
      'feat_token_rail_monitor': avgLoad * 0.03,
      'feat_payment_routing': avgLoad * 0.07,
    },
  };
});

export const mockPredictiveForecast: PredictiveForecast[] = Array.from({ length: 7 }).map((_, i) => {
  const date = new Date();
  date.setHours(date.getHours() + i * 4);
  const forecastedLoad = Math.random() * 0.3 + 0.5; // 0.5 - 0.8
  return {
    timestamp: date.toISOString(),
    forecastedLoad: forecastedLoad,
    confidenceInterval: [Math.max(0.0, forecastedLoad - 0.1), Math.min(1.0, forecastedLoad + 0.1)],
    influencingFactors: {
      'peak_hours_probability': Math.random(),
      'large_query_expected': Math.random() > 0.7 ? 1 : 0,
      'marketing_campaign_effect': Math.random() > 0.8 ? 0.5 : 0,
      'scheduled_agent_run': Math.random() > 0.6 ? 0.2 : 0,
      'expected_payment_volume': Math.random() * 0.3,
    },
    recommendedActions: forecastedLoad > 0.75 ? [{ featureId: 'feat_adv_analytics', action: 'throttle', rationale: 'Proactive reduction for forecasted peak.' }] : [],
  };
});

export const mockFeedbackLoopStatus: FeedbackLoopStatus = {
  lastEvaluationTimestamp: new Date().toISOString(),
  policiesEvaluated: mockThrottlingPolicies.map(p => p.id),
  proposedAdjustments: {
    'policy_high_load_general': 'Adjust minLoad threshold to 0.88 for 1 hour due to sustained higher baseline.',
    'policy_analytics_peak_hours': 'Extend peak hours by 30 minutes due to observed late-afternoon surge.'
  },
  efficacyScore: 0.85,
  nextEvaluationDue: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  statusMessage: 'Optimizing for balanced performance and user satisfaction, with active monitoring of agent load.',
  optimizationGoal: 'balance_load_and_usage',
};

export let mockAgentDefinitions: AgentDefinition[] = [
  {
    id: 'agent_fraud_detector', name: 'Fraud Detection Agent', description: 'Monitors transactions for suspicious patterns.', category: AgentCategory.FraudDetection,
    skills: [AgentSkill.AnomalyDetection, AgentSkill.RiskAssessment, AgentSkill.Communication], status: 'active',
    configuration: { model_version: '2.1', sensitivity: 0.8 }, operationalLoadThreshold: 100, lastUpdated: '2023-03-01T13:00:00Z', ownerTeam: 'Security AI', rbacRole: 'fraud_analyst_agent', publicKey: 'mock_agent_fraud_pubkey'
  },
  {
    id: 'agent_settlement_orch', name: 'Settlement Orchestration Agent', description: 'Manages multi-rail transaction settlement.', category: AgentCategory.Orchestration,
    skills: [AgentSkill.TransactionProcessing, AgentSkill.SmartContractExecution, AgentSkill.ErrorHandling], status: 'active',
    configuration: { primary_rail: 'rail_fast', fallback_rail: 'rail_batch' }, operationalLoadThreshold: 500, lastUpdated: '2023-03-01T14:00:00Z', ownerTeam: 'Payments Core', rbacRole: 'payment_orchestrator_agent', publicKey: 'mock_agent_settlement_pubkey'
  },
  {
    id: 'agent_reconciliation', name: 'Ledger Reconciliation Agent', description: 'Periodically verifies ledger consistency.', category: AgentCategory.Reconciliation,
    skills: [AgentSkill.LedgerUpdate, AgentSkill.DataAggregation, AgentSkill.Reporting], status: 'idle',
    configuration: { schedule: 'daily_0200_utc', scope: 'all_accounts' }, operationalLoadThreshold: 50, lastUpdated: '2023-03-01T15:00:00Z', ownerTeam: 'Accounting Tech', rbacRole: 'finance_auditor_agent', publicKey: 'mock_agent_reconciliation_pubkey'
  },
  {
    id: 'agent_system_monitor', name: 'System Monitoring Agent', description: 'Monitors overall system health and triggers alerts.', category: AgentCategory.Monitoring,
    skills: [AgentSkill.AnomalyDetection, AgentSkill.SystemDiagnosis, AgentSkill.PolicyEnforcement], status: 'active',
    configuration: { metrics_interval: 15 }, operationalLoadThreshold: 200, lastUpdated: '2023-03-01T16:00:00Z', ownerTeam: 'DevOps', rbacRole: 'ops_monitor_agent', publicKey: 'mock_agent_monitor_pubkey'
  },
  {
    id: 'agent_key_manager', name: 'Key Management Agent', description: 'Manages cryptographic keys for identities and services.', category: AgentCategory.Security,
    skills: [AgentSkill.KeyManagement, AgentSkill.IdentityVerification, AgentSkill.PolicyEnforcement], status: 'active',
    configuration: { rotation_policy: 'quarterly' }, operationalLoadThreshold: 50, lastUpdated: '2023-03-10T10:00:00Z', ownerTeam: 'Security AI', rbacRole: 'key_manager_agent', publicKey: 'mock_agent_key_manager_pubkey'
  },
];

export const mockAgentHealthMetrics: AgentHealthMetric[] = Array.from({ length: 5 }).map((_, i) => ({
  timestamp: new Date().toISOString(),
  agentId: mockAgentDefinitions[i].id,
  cpuUsage: Math.random() * 20 + 10,
  memoryUsage: Math.random() * 15 + 20,
  activeTasks: Math.floor(Math.random() * 50),
  taskThroughput: Math.floor(Math.random() * 100),
  errorRate: Math.random() * 0.01,
  avgTaskLatency: Math.random() * 50 + 20,
  healthScore: Math.random() * 0.2 + 0.7, // 0.7-0.9
}));

export const mockTokenRailMetrics: TokenRailMetrics[] = Array.from({ length: 3 }).map((_, i) => {
  const railTypes = [TokenRailType.Fast, TokenRailType.Batch, TokenRailType.HighValue];
  const statuses = ['operational', 'degraded', 'offline'] as const;
  return {
    timestamp: new Date().toISOString(),
    railId: `rail_${railTypes[i].replace(/\s/g, '_').toLowerCase()}`,
    railType: railTypes[i],
    tps: Math.floor(Math.random() * 1000 + 500),
    avgLatency: Math.random() * 100 + 50,
    errorRate: Math.random() * 0.005,
    queueDepth: Math.floor(Math.random() * 200),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    totalValueTransacted: Math.random() * 10000000 + 500000,
  };
});

export const mockTokenAccountSnapshots: TokenAccountSnapshot[] = Array.from({ length: 5 }).map((_, i) => ({
  accountId: `acc_${generateUUID().substring(0, 8)}`,
  balance: Math.random() * 1000000,
  lastTransactionTimestamp: new Date(Date.now() - Math.random() * 3600 * 1000).toISOString(),
  transactionCount: Math.floor(Math.random() * 1000),
  recentTransactions: [
    { txId: `tx_${generateUUID().substring(0, 8)}`, amount: Math.random() * 1000, status: TokenTransactionStatus.Confirmed },
    { txId: `tx_${generateUUID().substring(0, 8)}`, amount: Math.random() * 500, status: TokenTransactionStatus.Pending },
  ],
}));

export const mockPaymentEngineStatus: PaymentEngineStatus = {
  timestamp: new Date().toISOString(),
  overallStatus: 'online',
  requestsPerSecond: Math.floor(Math.random() * 2000 + 1000),
  avgProcessingLatency: Math.random() * 80 + 20,
  failureRate: Math.random() * 0.002,
  inFlightTransactions: Math.floor(Math.random() * 500),
  flaggedTransactions: Math.floor(Math.random() * 10),
  railStatuses: {
    'rail_fast': 'operational',
    'rail_batch': 'degraded',
    'rail_high_value': 'operational',
  },
};

export let mockPaymentRequestMetrics: PaymentRequestMetric[] = Array.from({ length: 20 }).map((_, i) => {
  const rails = [TokenRailType.Fast, TokenRailType.Batch, TokenRailType.HighValue];
  const statuses = [TokenTransactionStatus.Confirmed, TokenTransactionStatus.Failed, TokenTransactionStatus.Pending];
  return {
    timestamp: new Date(Date.now() - (19 - i) * 1000).toISOString(),
    requestId: `pay_req_${generateUUID().substring(0, 8)}`,
    source: `user_${Math.floor(Math.random() * 50) + 1}`,
    destination: `merchant_${Math.floor(Math.random() * 10) + 1}`,
    amount: Math.random() * 10000,
    currency: 'USD',
    chosenRail: rails[Math.floor(Math.random() * rails.length)],
    processingTime: Math.random() * 200 + 50,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    riskScore: Math.random() * 0.1,
    fraudReason: Math.random() > 0.95 ? 'High velocity transaction' : undefined,
  };
});

export const mockIdentityServiceStatus: IdentityServiceStatus = {
  timestamp: new Date().toISOString(),
  overallStatus: 'operational',
  authRequestsPerSecond: Math.floor(Math.random() * 500 + 200),
  avgAuthLatency: Math.random() * 30 + 10,
  failedAuthRate: Math.random() * 0.001,
  authzChecksPerSecond: Math.floor(Math.random() * 800 + 300),
  activeSessions: Math.floor(Math.random() * 10000 + 5000),
  keyManagementStatus: 'healthy',
  securityIncidents: [],
};

// Initial setup for mockAuthLogEntries to have proper hash chaining
export let mockAuthLogEntries: AuthLogEntry[] = [];
(() => {
  let previousHash = 'genesis_block_hash';
  for (let i = 0; i < 20; i++) {
    const eventTypes = Object.values(AuthEventType);
    const outcomes = ['success', 'failure', 'denied', 'info'];
    const entityId = i % 2 === 0 ? `user_${Math.floor(Math.random() * 50) + 1}` : `agent_${Math.floor(Math.random() * 5) + 1}`;
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    const logEntry: Partial<AuthLogEntry> = {
      id: `auth_log_${i + 1}`,
      timestamp: new Date(Date.now() - (19 - i) * 10 * 1000).toISOString(),
      eventType: eventType,
      entityId: entityId,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      outcome: outcome,
      message: `${entityId} ${eventType} - ${outcome}`,
      context: {
        feature: Math.random() > 0.5 ? 'feat_identity_security' : 'feat_adv_analytics',
        details: `Attempt from ${`192.168.1.${Math.floor(Math.random() * 255)}`}`
      },
    };
    const logContent = JSON.stringify({ eventType: logEntry.eventType, entityId: logEntry.entityId, outcome: logEntry.outcome, message: logEntry.message, context: logEntry.context });
    const entryHash = simpleDeterministicHash(logContent, previousHash);

    mockAuthLogEntries.push({ ...logEntry as AuthLogEntry, previousHash, entryHash });
    previousHash = entryHash; // Chain the hash
  }
})();


// Data Hooks (simulating data fetching and state management) ---------------------------------------------------------

/**
 * Hook to manage and fetch feature definitions. This centralizes
 * the logic for interacting with the feature registry, ensuring consistency
 * across the application.
 * Business Value: Provides a single source of truth for feature metadata,
 * crucial for dynamic UI rendering, policy application, and maintaining a
 * synchronized understanding of system capabilities across engineering teams.
 */
export const useFeatureDefinitions = () => {
  const [features, setFeatures] = useState<FeatureDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const data: FeatureDefinition[] = await mockBackendAPI('features', 'GET');
      setFeatures(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch features.');
    } finally {
      setLoading(false);
    }
  };

  const addFeature = async (feature: Partial<FeatureDefinition>) => {
    try {
      const newFeature: FeatureDefinition = {
        id: generateUUID(),
        name: feature.name || 'New Feature',
        description: feature.description || '',
        category: feature.category || FeatureCategory.Utility,
        cognitiveWeight: feature.cognitiveWeight || 0.5,
        baseThrottleThreshold: feature.baseThrottleThreshold || 0.6,
        isActive: feature.isActive !== undefined ? feature.isActive : true,
        dependencies: feature.dependencies || [],
        impactMetrics: feature.impactMetrics || [],
        recoveryTimeEstimate: feature.recoveryTimeEstimate || 60,
        lastUpdated: new Date().toISOString(),
        ownerTeam: feature.ownerTeam || 'Unknown',
        rolloutStrategy: feature.rolloutStrategy || 'all_users',
      };
      const addedFeature: FeatureDefinition = await mockBackendAPI('features', 'POST', newFeature);
      setFeatures(prev => [...prev, addedFeature]);
      return addedFeature;
    } catch (err: any) {
      setError(err.message || 'Failed to add feature.');
      throw err;
    }
  };

  const updateFeature = async (feature: FeatureDefinition) => {
    try {
      const updatedFeature: FeatureDefinition = await mockBackendAPI('features', 'PUT', feature);
      setFeatures(prev => prev.map(f => f.id === updatedFeature.id ? updatedFeature : f));
      return updatedFeature;
    } catch (err: any) {
      setError(err.message || 'Failed to update feature.');
      throw err;
    }
  };

  const deleteFeature = async (featureId: string) => {
    try {
      await mockBackendAPI('features', 'DELETE', { id: featureId });
      setFeatures(prev => prev.filter(f => f.id !== featureId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete feature.');
      throw err;
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  return { features, loading, error, fetchFeatures, addFeature, updateFeature, deleteFeature };
};

/**
 * Hook to manage and fetch throttling policies. This abstraction
 * ensures that policy management is robust and scalable, supporting the dynamic
 * nature of operational load.
 * Business Value: Centralizes the management of system resilience policies,
 * providing the tools to dynamically adapt to varying load conditions, prevent
 * outages, and optimize resource utilization, thereby directly impacting system
 * uptime and cost efficiency.
 */
export const useThrottlingPolicies = () => {
  const [policies, setPolicies] = useState<ThrottlingPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const data: ThrottlingPolicy[] = await mockBackendAPI('policies', 'GET');
      setPolicies(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch policies.');
    } finally {
      setLoading(false);
    }
  };

  const addPolicy = async (policy: Partial<ThrottlingPolicy>) => {
    try {
      const newPolicy: ThrottlingPolicy = {
        id: generateUUID(),
        name: policy.name || 'New Policy',
        description: policy.description || '',
        strategy: policy.strategy || ThrottlingStrategy.StaticThreshold,
        targetFeatureIds: policy.targetFeatureIds || [],
        userSegments: policy.userSegments || [],
        thresholdConfig: policy.thresholdConfig || {},
        activationConditions: policy.activationConditions || [],
        deactivationConditions: policy.deactivationConditions || [],
        priority: policy.priority || 10,
        isActive: policy.isActive !== undefined ? policy.isActive : true,
        lastModifiedBy: 'admin',
        lastModifiedDate: new Date().toISOString(),
        efficacyMetrics: policy.efficacyMetrics || [],
      };
      const addedPolicy: ThrottlingPolicy = await mockBackendAPI('policies', 'POST', newPolicy);
      setPolicies(prev => [...prev, addedPolicy]);
      return addedPolicy;
    } catch (err: any) {
      setError(err.message || 'Failed to add policy.');
      throw err;
    }
  };

  const updatePolicy = async (policy: ThrottlingPolicy) => {
    try {
      const updatedPolicy: ThrottlingPolicy = await mockBackendAPI('policies', 'PUT', policy);
      setPolicies(prev => prev.map(p => p.id === updatedPolicy.id ? updatedPolicy : p));
      return updatedPolicy;
    } catch (err: any) {
      setError(err.message || 'Failed to update policy.');
      throw err;
    }
  };

  const deletePolicy = async (policyId: string) => {
    try {
      await mockBackendAPI('policies', 'DELETE', { id: policyId });
      setPolicies(prev => prev.filter(p => p.id !== policyId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete policy.');
      throw err;
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return { policies, loading, error, fetchPolicies, addPolicy, updatePolicy, deletePolicy };
};

/**
 * Hook to manage and fetch alert definitions and instances. This ensures
 * that operational alerts are consistently retrieved and managed throughout the UI.
 * Business Value: Provides a robust framework for real-time incident awareness and
 * management, accelerating response times to critical system events and minimizing
 * the impact of operational disruptions on business continuity and revenue.
 */
export const useAlerts = () => {
  const [definitions, setDefinitions] = useState<AlertDefinition[]>([]);
  const [instances, setInstances] = useState<AlertInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDefinitions = async () => {
    setLoading(true);
    try {
      const data: AlertDefinition[] = await mockBackendAPI('alerts/definitions', 'GET');
      setDefinitions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch alert definitions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstances = async () => {
    setLoading(true);
    try {
      const data: AlertInstance[] = await mockBackendAPI('alerts/instances', 'GET');
      setInstances(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch alert instances.');
    } finally {
      setLoading(false);
    }
  };

  const createDefinition = async (def: Partial<AlertDefinition>) => {
    try {
      const newDef: AlertDefinition = {
        id: generateUUID(),
        name: def.name || 'New Alert',
        description: def.description || '',
        severity: def.severity || AlertSeverity.Warning,
        condition: def.condition || 'avgCognitiveLoad > 0.8',
        targetFeatures: def.targetFeatures || [],
        targetUserSegments: def.targetUserSegments || [],
        notificationChannels: def.notificationChannels || ['email'],
        isActive: def.isActive !== undefined ? def.isActive : true,
        debouncePeriod: def.debouncePeriod || 300,
        autoResolveCondition: def.autoResolveCondition || 'avgCognitiveLoad < 0.7',
      };
      const addedDef: AlertDefinition = await mockBackendAPI('alerts/definitions', 'POST', newDef);
      setDefinitions(prev => [...prev, addedDef]);
      return addedDef;
    } catch (err: any) {
      setError(err.message || 'Failed to create alert definition.');
      throw err;
    }
  };

  const updateDefinition = async (def: AlertDefinition) => {
    try {
      const updatedDef: AlertDefinition = await mockBackendAPI('alerts/definitions', 'PUT', def);
      setDefinitions(prev => prev.map(d => d.id === updatedDef.id ? updatedDef : d));
      return updatedDef;
    } catch (err: any) {
      setError(err.message || 'Failed to update alert definition.');
      throw err;
    }
  };

  const deleteDefinition = async (definitionId: string) => {
    try {
      await mockBackendAPI('alerts/definitions', 'DELETE', { id: definitionId });
      setDefinitions(prev => prev.filter(d => d.id !== definitionId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete alert definition.');
      throw err;
    }
  };

  const updateInstance = async (instance: AlertInstance) => {
    try {
      const updatedInstance: AlertInstance = await mockBackendAPI('alerts/instances', 'PUT', instance);
      setInstances(prev => prev.map(i => i.id === updatedInstance.id ? updatedInstance : i));
      return updatedInstance;
    } catch (err: any) {
      setError(err.message || 'Failed to update alert instance.');
      throw err;
    }
  };

  useEffect(() => {
    fetchDefinitions();
    fetchInstances();
  }, []);

  return { definitions, instances, loading, error, fetchDefinitions, fetchInstances, createDefinition, updateDefinition, deleteDefinition, updateInstance };
};

/**
 * Hook to manage and fetch alert escalation policies. This provides
 * the necessary data for configuring how critical incidents are handled.
 * Business Value: Orchestrates a highly reliable incident response workflow,
 * ensuring that no critical alert goes unaddressed and that the right personnel
 * are engaged at the right time, minimizing MTTR and preserving operational integrity.
 */
export const useEscalationPolicies = () => {
  const [policies, setPolicies] = useState<EscalationPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const data: EscalationPolicy[] = await mockBackendAPI('alerts/escalation_policies', 'GET');
      setPolicies(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch escalation policies.');
    } finally {
      setLoading(false);
    }
  };

  const addPolicy = async (policy: Partial<EscalationPolicy>) => {
    try {
      const newPolicy: EscalationPolicy = {
        id: generateUUID(),
        name: policy.name || 'New Escalation Policy',
        description: policy.description || '',
        steps: policy.steps || [],
        isActive: policy.isActive !== undefined ? policy.isActive : true,
        lastModifiedBy: 'admin',
        lastModifiedDate: new Date().toISOString(),
      };
      const addedPolicy: EscalationPolicy = await mockBackendAPI('alerts/escalation_policies', 'POST', newPolicy);
      setPolicies(prev => [...prev, addedPolicy]);
      return addedPolicy;
    } catch (err: any) {
      setError(err.message || 'Failed to add escalation policy.');
      throw err;
    }
  };

  const updatePolicy = async (policy: EscalationPolicy) => {
    try {
      const updatedPolicy: EscalationPolicy = await mockBackendAPI('alerts/escalation_policies', 'PUT', policy);
      setPolicies(prev => prev.map(p => p.id === updatedPolicy.id ? updatedPolicy : p));
      return updatedPolicy;
    } catch (err: any) {
      setError(err.message || 'Failed to update escalation policy.');
      throw err;
    }
  };

  const deletePolicy = async (policyId: string) => {
    try {
      await mockBackendAPI('alerts/escalation_policies', 'DELETE', { id: policyId });
      setPolicies(prev => prev.filter(p => p.id !== policyId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete escalation policy.');
      throw err;
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return { policies, loading, error, fetchPolicies, addPolicy, updatePolicy, deletePolicy };
};


/**
 * Hook to fetch real-time and historical system health metrics.
 * This provides continuous visibility into the foundational infrastructure.
 * Business Value: Acts as the pulse of the underlying system, enabling predictive
 * maintenance, resource capacity planning, and proactive issue resolution,
 * all contributing to maximized uptime and efficient resource utilization.
 */
export const useSystemHealth = () => {
  const [currentMetrics, setCurrentMetrics] = useState<SystemHealthMetric | null>(null);
  const [history, setHistory] = useState<SystemHealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    mockBackendAPI('system_health', 'GET').then((data: SystemHealthMetric[]) => {
      setHistory(data);
      if (data.length > 0) {
        setCurrentMetrics(data[data.length - 1]);
      }
      setLoading(false);
    }).catch(err => {
      setError(err.message || 'Failed to fetch system health data.');
      setLoading(false);
    });

    const interval = setInterval(() => {
      const newMetric: SystemHealthMetric = {
        timestamp: new Date().toISOString(),
        cpuUsage: Math.random() * 20 + 70, // Fluctuating high
        memoryUsage: Math.random() * 10 + 80,
        networkLatency: Math.random() * 30 + 10,
        databaseConnections: Math.floor(Math.random() * 50 + 150),
        errorRate: Math.random() * 0.8,
        queueDepth: Math.floor(Math.random() * 300),
        activeUsers: Math.floor(Math.random() * 1000 + 700),
        backgroundTasks: Math.floor(Math.random() * 20 + 30),
        diskIO: Math.floor(Math.random() * 300 + 400),
        apiCallRate: Math.floor(Math.random() * 800 + 1200),
      };
      setCurrentMetrics(newMetric);
      setHistory(prev => [...prev.slice(-19), newMetric]); // Keep last 20
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return { currentMetrics, history, loading, error };
};

/**
 * Hook to manage and fetch user profiles. This data informs
 * user-segment-specific load balancing and experience personalization.
 * Business Value: Provides the underlying data for segmenting and tailoring
 * user experiences, leading to higher engagement, better retention, and the
 * ability to offer differentiated services to high-value customer groups.
 */
export const useUserProfiles = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data: UserProfile[] = await mockBackendAPI('users', 'GET');
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user profiles.');
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (profile: UserProfile) => {
    try {
      const updatedProfile: UserProfile = await mockBackendAPI('users', 'PUT', profile);
      setUsers(prev => prev.map(u => u.userId === updatedProfile.userId ? updatedProfile : u));
      return updatedProfile;
    } catch (err: any) {
      setError(err.message || 'Failed to update user profile.');
      throw err;
    }
  };

  // Simulate key generation for a user profile
  const generateUserKeyPair = async (userId: string) => {
    const user = users.find(u => u.userId === userId);
    if (!user) {
      throw new Error('User not found for key generation.');
    }
    // In a real system, this would securely generate an asymmetric key pair
    const newPublicKey = `mock_user_pubkey_${generateUUID().substring(0, 8)}`;
    const newSignature = `mock_user_signature_${generateUUID().substring(0, 8)}`; // Simulate signing the profile
    const updatedUser = { ...user, publicKey: newPublicKey, profileSignature: newSignature };
    return updateUserProfile(updatedUser);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, fetchUsers, updateUserProfile, generateUserKeyPair };
};

/**
 * Hook to fetch historical cognitive load data. This aggregate view
 * is crucial for trend analysis and long-term performance optimization.
 * Business Value: Enables data-driven strategic decisions, capacity planning,
 * and validation of load balancing policy effectiveness over time,
 * ensuring continuous system improvement and optimized resource allocation.
 */
export const useHistoricalData = () => {
  const [history, setHistory] = useState<HistoricalCognitiveData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const data: HistoricalCognitiveData[] = await mockBackendAPI('historical_data', 'GET');
      setHistory(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch historical data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalData();
  }, []);

  return { history, loading, error, fetchHistoricalData };
};

/**
 * Hook to fetch and manage predictive load forecasts. This empowers
 * proactive decision-making and pre-emptive resource adjustments.
 * Business Value: Shifts operational management from reactive to predictive,
 * enabling proactive resource scaling and policy adjustments, thereby preventing
 * incidents before they impact users and ensuring continuous optimal performance.
 */
export const usePredictiveAnalytics = () => {
  const [forecast, setForecast] = useState<PredictiveForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const data: PredictiveForecast[] = await mockBackendAPI('forecast', 'GET');
      setForecast(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch forecast data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  return { forecast, loading, error, fetchForecast };
};

/**
 * Hook to fetch and manage feedback loop status. This provides
 * transparency into the system's self-optimization capabilities.
 * Business Value: Automates the continuous improvement of load balancing strategies,
 * ensuring the system always adapts to new patterns, leading to maximized efficiency
 * and resilience with minimal human intervention, reducing operational costs.
 */
export const useFeedbackLoop = () => {
  const [status, setStatus] = useState<FeedbackLoopStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data: FeedbackLoopStatus = await mockBackendAPI('feedback_loop', 'GET');
      setStatus(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch feedback loop status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return { status, loading, error, fetchStatus };
};

/**
 * Hook to manage and fetch integration configurations. This centralizes
 * the setup and monitoring of external system connections.
 * Business Value: Ensures seamless interoperability with existing enterprise systems
 * and monitoring tools, enabling a unified operational view, reducing manual effort,
 * and accelerating incident response through automated notifications, protecting investments.
 */
export const useIntegrationConfigs = () => {
  const [configs, setConfigs] = useState<IntegrationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const data: IntegrationConfig[] = await mockBackendAPI('integrations', 'GET');
      setConfigs(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch integration configs.');
    } finally {
      setLoading(false);
    }
  };

  const addConfig = async (config: Partial<IntegrationConfig>) => {
    try {
      const newConfig: IntegrationConfig = {
        id: generateUUID(),
        name: config.name || 'New Integration',
        type: config.type || 'custom_webhook',
        status: 'disconnected',
        settings: config.settings || {},
        lastTested: undefined,
      };
      const addedConfig: IntegrationConfig = await mockBackendAPI('integrations', 'POST', newConfig);
      setConfigs(prev => [...prev, addedConfig]);
      return addedConfig;
    } catch (err: any) {
      setError(err.message || 'Failed to add integration config.');
      throw err;
    }
  };

  const updateConfig = async (config: IntegrationConfig) => {
    try {
      const updatedConfig: IntegrationConfig = await mockBackendAPI('integrations', 'PUT', config);
      setConfigs(prev => prev.map(c => c.id === updatedConfig.id ? updatedConfig : c));
      return updatedConfig;
    } catch (err: any) {
      setError(err.message || 'Failed to update integration config.');
      throw err;
    }
  };

  const deleteConfig = async (configId: string) => {
    try {
      await mockBackendAPI('integrations', 'DELETE', { id: configId });
      setConfigs(prev => prev.filter(c => c.id !== configId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete integration config.');
      throw err;
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  return { configs, loading, error, fetchConfigs, addConfig, updateConfig, deleteConfig };
};

/**
 * Hook to manage and fetch AI agent definitions and their health metrics.
 * This provides continuous oversight of the autonomous workforce.
 * Business Value: Ensures the health and optimal performance of agentic AI systems,
 * which are foundational for automated workflows. Proactive monitoring prevents
 * operational drift and ensures agents reliably execute critical business functions,
 * maximizing ROI on AI investments.
 */
export const useAgents = () => {
  const [definitions, setDefinitions] = useState<AgentDefinition[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<AgentHealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDefinitions = async () => {
    setLoading(true);
    try {
      const data: AgentDefinition[] = await mockBackendAPI('agents', 'GET');
      setDefinitions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch agent definitions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthMetrics = async () => {
    setLoading(true);
    try {
      const data: AgentHealthMetric[] = await mockBackendAPI('agents/health', 'GET');
      setHealthMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch agent health metrics.');
    } finally {
      setLoading(false);
    }
  };

  const addAgent = async (agent: Partial<AgentDefinition>) => {
    try {
      const newAgent: AgentDefinition = {
        id: generateUUID(),
        name: agent.name || 'New Agent',
        description: agent.description || '',
        category: agent.category || AgentCategory.Monitoring,
        skills: agent.skills || [],
        status: agent.status || 'idle',
        configuration: agent.configuration || {},
        operationalLoadThreshold: agent.operationalLoadThreshold || 100,
        lastUpdated: new Date().toISOString(),
        ownerTeam: agent.ownerTeam || 'Unknown',
        rbacRole: agent.rbacRole || 'default_agent_role',
        publicKey: `mock_agent_pubkey_${generateUUID().substring(0,8)}`, // Simulate key generation
      };
      const addedAgent: AgentDefinition = await mockBackendAPI('agents', 'POST', newAgent);
      setDefinitions(prev => [...prev, addedAgent]);
      return addedAgent;
    } catch (err: any) {
      setError(err.message || 'Failed to add agent.');
      throw err;
    }
  };

  const updateAgent = async (agent: AgentDefinition) => {
    try {
      const updatedAgent: AgentDefinition = await mockBackendAPI('agents', 'PUT', agent);
      setDefinitions(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
      return updatedAgent;
    } catch (err: any) {
      setError(err.message || 'Failed to update agent.');
      throw err;
    }
  };

  const deleteAgent = async (agentId: string) => {
    try {
      await mockBackendAPI('agents', 'DELETE', { id: agentId });
      setDefinitions(prev => prev.filter(a => a.id !== agentId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete agent.');
      throw err;
    }
  };

  useEffect(() => {
    fetchDefinitions();
    fetchHealthMetrics();

    // Simulate real-time health updates
    const interval = setInterval(fetchHealthMetrics, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return { definitions, healthMetrics, loading, error, fetchDefinitions, fetchHealthMetrics, addAgent, updateAgent, deleteAgent };
};

/**
 * Hook to manage and fetch token rail metrics and account snapshots.
 * This provides crucial insight into the performance and state of the digital ledger.
 * Business Value: Offers real-time financial observability into the token rail layer,
 * ensuring transaction integrity, liquidity monitoring, and efficient routing,
 * which are paramount for modern real-time payment systems and financial stability.
 */
export const useTokenRails = () => {
  const [metrics, setMetrics] = useState<TokenRailMetrics[]>([]);
  const [accounts, setAccounts] = useState<TokenAccountSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data: TokenRailMetrics[] = await mockBackendAPI('token_rails', 'GET');
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch token rail metrics.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const data: TokenAccountSnapshot[] = await mockBackendAPI('token_accounts', 'GET');
      setAccounts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch token accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchAccounts();

    const interval = setInterval(fetchMetrics, 5000); // Update metrics every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return { metrics, accounts, loading, error, fetchMetrics, fetchAccounts };
};

/**
 * Hook to manage and fetch payment engine status and request metrics.
 * This provides the operational view for the real-time payments infrastructure.
 * Business Value: Critical for monitoring the health and performance of the
 * real-time payments engine, enabling rapid fraud detection, transaction reconciliation,
 * and ensuring high availability and low latency for all financial transfers,
 * thereby securing and maximizing transaction revenue.
 */
export const usePayments = () => {
  const [engineStatus, setEngineStatus] = useState<PaymentEngineStatus | null>(null);
  const [requestMetrics, setRequestMetrics] = useState<PaymentRequestMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEngineStatus = async () => {
    setLoading(true);
    try {
      const data: PaymentEngineStatus = await mockBackendAPI('payments/engine_status', 'GET');
      setEngineStatus(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payment engine status.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestMetrics = async () => {
    setLoading(true);
    try {
      const data: PaymentRequestMetric[] = await mockBackendAPI('payments/requests', 'GET');
      setRequestMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payment request metrics.');
    } finally {
      setLoading(false);
    }
  };

  const createPaymentRequest = async (request: Partial<PaymentRequestMetric>) => {
    try {
      const newPayment: PaymentRequestMetric = {
        requestId: generateUUID(),
        timestamp: new Date().toISOString(),
        source: request.source || 'simulated_sender',
        destination: request.destination || 'simulated_receiver',
        amount: request.amount || 0,
        currency: request.currency || 'USD',
        chosenRail: request.chosenRail || TokenRailType.Fast,
        processingTime: Math.random() * 200 + 50, // Simulated
        status: Math.random() > 0.95 ? TokenTransactionStatus.Failed : TokenTransactionStatus.Confirmed, // Simulated
        riskScore: Math.random() * 0.1, // Simulated
        fraudReason: Math.random() > 0.98 ? 'Suspicious pattern' : undefined, // Simulated
        ...request,
      };
      const addedPayment: PaymentRequestMetric = await mockBackendAPI('payments/requests', 'POST', newPayment);
      setRequestMetrics(prev => [...prev, addedPayment]);
      return addedPayment;
    } catch (err: any) {
      setError(err.message || 'Failed to create payment request.');
      throw err;
    }
  };


  useEffect(() => {
    fetchEngineStatus();
    fetchRequestMetrics();

    const engineInterval = setInterval(fetchEngineStatus, 5000);
    const requestInterval = setInterval(fetchRequestMetrics, 5000);
    return () => {
      clearInterval(engineInterval);
      clearInterval(requestInterval);
    };
  }, []);

  return { engineStatus, requestMetrics, loading, error, fetchEngineStatus, fetchRequestMetrics, createPaymentRequest };
};

/**
 * Hook to manage and fetch identity service status and authentication logs.
 * This provides a critical security and audit trail for user and agent access.
 * Business Value: Establishes a robust security observability layer for digital identity,
 * critical for preventing fraud, detecting unauthorized access, and ensuring compliance
 * with data privacy and security regulations, thereby protecting the platform and its users.
 */
export const useIdentity = () => {
  const [serviceStatus, setServiceStatus] = useState<IdentityServiceStatus | null>(null);
  const [authLogs, setAuthLogs] = useState<AuthLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServiceStatus = async () => {
    setLoading(true);
    try {
      const data: IdentityServiceStatus = await mockBackendAPI('identity/status', 'GET');
      setServiceStatus(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch identity service status.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthLogs = async () => {
    setLoading(true);
    try {
      const data: AuthLogEntry[] = await mockBackendAPI('identity/auth_logs', 'GET');
      setAuthLogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch authentication logs.');
    } finally {
      setLoading(false);
    }
  };

  const addAuthLogEntry = async (entry: Partial<AuthLogEntry>) => {
    try {
      const newLogEntry: AuthLogEntry = {
        id: generateUUID(),
        timestamp: new Date().toISOString(),
        eventType: entry.eventType || AuthEventType.LoginSuccess,
        entityId: entry.entityId || 'unknown',
        ipAddress: entry.ipAddress || '0.0.0.0',
        outcome: entry.outcome || 'info',
        message: entry.message || '',
        context: entry.context || {},
        previousHash: 'placeholder', // Will be filled by mockBackendAPI
        entryHash: 'placeholder', // Will be filled by mockBackendAPI
      };
      const addedLog: AuthLogEntry = await mockBackendAPI('identity/auth_logs', 'POST', newLogEntry);
      setAuthLogs(prev => [...prev, addedLog]);
      return addedLog;
    } catch (err: any) {
      setError(err.message || 'Failed to add auth log entry.');
      throw err;
    }
  };

  useEffect(() => {
    fetchServiceStatus();
    fetchAuthLogs();

    const statusInterval = setInterval(fetchServiceStatus, 10000);
    const logsInterval = setInterval(fetchAuthLogs, 5000);
    return () => {
      clearInterval(statusInterval);
      clearInterval(logsInterval);
    };
  }, []);

  return { serviceStatus, authLogs, loading, error, fetchServiceStatus, fetchAuthLogs, addAuthLogEntry };
};

// UI Components (Sub-views) -------------------------------------------------------------------------------------------

/**
 * A visual gauge component for displaying current cognitive load.
 * This provides an immediate, intuitive understanding of the user experience burden.
 * Business Value: Offers a quick, at-a-glance performance indicator critical for
 * operational teams and stakeholders to assess user experience health, enabling
 * rapid intervention to prevent user frustration and maintain engagement.
 */
export const CognitiveLoadGauge: React.FC<{ load: number }> = ({ load }) => {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (load * circumference);
  const loadColor = getLoadColorClass(load).replace('text-', '');

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          className="text-gray-700"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        <circle
          className={`transition-all duration-500 ease-in-out ${loadColor}`}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
          transform="rotate(-90 50 50)"
        />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          className={`text-xl font-bold ${getLoadColorClass(load)}`}
        >
          {(load * 100).toFixed(1)}%
        </text>
      </svg>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-12 text-center text-gray-400 text-sm">
        Avg. Load
      </div>
    </div>
  );
};

/**
 * Displays the status of individual features, including their cognitive weight
 * and current throttling status. This provides detailed insight into feature-level performance.
 * Business Value: Enables granular monitoring and management of each feature's operational
 * status, allowing product and engineering teams to understand how individual components
 * contribute to overall system load and user experience, facilitating targeted optimization.
 */
export const FeatureStatusCard: React.FC<{ feature: FeatureDefinition; isThrottled: boolean }> = ({ feature, isThrottled }) => {
  const loadColor = getLoadColorClass(feature.cognitiveWeight);
  return (
    <div className={`bg-gray-700 p-4 rounded-lg shadow-md flex flex-col justify-between ${isThrottled ? 'border border-orange-500' : ''}`}>
      <div>
        <h3 className="text-lg font-semibold text-white">{feature.name}</h3>
        <p className="text-sm text-gray-400 mb-2">{feature.description}</p>
        <div className="flex items-center text-sm">
          <span className="text-gray-300">Cognitive Weight: </span>
          <span className={`ml-2 font-bold ${loadColor}`}>{feature.cognitiveWeight.toFixed(2)}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="text-gray-300">Base Threshold: </span>
          <span className="ml-2 text-blue-300">{feature.baseThrottleThreshold.toFixed(2)}</span>
        </div>
      </div>
      <div className="mt-3">
        {isThrottled ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-600 text-white">
            <span className="mr-1 animate-pulse">•</span> Throttled
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-700 text-green-100">
            Active
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Displays a table of all defined throttling policies. This interface
 * allows operators to review and manage the rules governing system load.
 * Business Value: Provides a transparent and manageable interface for load balancing
 * policies, enabling administrators to quickly audit, modify, and create new policies,
 * ensuring agile response to changing operational demands and strategic priorities.
 */
export const ThrottlingPoliciesTable: React.FC<{ policies: ThrottlingPolicy[]; onEditPolicy: (policy: ThrottlingPolicy) => void; onDeletePolicy: (policyId: string) => void }> = ({ policies, onEditPolicy, onDeletePolicy }) => {
  if (policies.length === 0) {
    return <p className="text-gray-400">No throttling policies defined.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900/50">
          <tr>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Strategy</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Target Features</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User Segments</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Priority</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {policies.map(policy => (
            <tr key={policy.id} className="hover:bg-gray-700">
              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-white">{policy.name}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{policy.strategy}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{policy.targetFeatureIds.map(id => mockFeatures.find(f => f.id === id)?.name || id).join(', ')}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{policy.userSegments.join(', ') || 'All'}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{policy.priority}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${policy.isActive ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}>
                  {policy.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEditPolicy(policy)}
                  className="text-indigo-400 hover:text-indigo-600 ml-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeletePolicy(policy.id)}
                  className="text-red-400 hover:text-red-600 ml-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Displays a list of active and recent alert instances. This view
 * is critical for incident monitoring and management.
 * Business Value: Consolidates all operational warnings and critical alerts into a
 * single, actionable view, empowering rapid incident response, reducing downtime,
 * and minimizing financial and reputational damage.
 */
export const AlertsList: React.FC<{ alerts: AlertInstance[]; definitions: AlertDefinition[]; onAcknowledge: (alert: AlertInstance) => void; onResolve: (alert: AlertInstance) => void }> = ({ alerts, definitions, onAcknowledge, onResolve }) => {
  if (alerts.length === 0) {
    return <p className="text-gray-400">No active or recent alerts.</p>;
  }

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.Critical: return 'bg-red-800 text-red-100';
      case AlertSeverity.Emergency: return 'bg-purple-800 text-purple-100';
      case AlertSeverity.Warning: return 'bg-yellow-600 text-yellow-100';
      case AlertSeverity.Info: return 'bg-blue-600 text-blue-100';
      default: return 'bg-gray-600 text-gray-100';
    }
  };

  const sortedAlerts = [...alerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-4">
      {sortedAlerts.map(alert => {
        const definition = definitions.find(def => def.id === alert.definitionId);
        return (
          <div key={alert.id} className={`bg-gray-700 p-4 rounded-lg shadow-md border-l-4 ${alert.status === 'active' ? 'border-red-500' : alert.status === 'acknowledged' ? 'border-yellow-500' : 'border-green-500'}`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold text-white">{definition?.name || 'Unknown Alert'}</h3>
                <p className="text-sm text-gray-400">{definition?.description || alert.context.message || 'No description available.'}</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(definition?.severity || AlertSeverity.Info)}`}>
                  {definition?.severity || 'Info'}
                </span>
                <p className="text-xs text-gray-500 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-gray-300">Status: <span className={`font-semibold ${alert.status === 'active' ? 'text-red-400' : alert.status === 'acknowledged' ? 'text-yellow-400' : 'text-green-400'}`}>{alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}</span></span>
              <div className="space-x-2">
                {alert.status === 'active' && (
                  <>
                    <button
                      onClick={() => onAcknowledge(alert)}
                      className="text-blue-400 hover:text-blue-600 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={() => onResolve(alert)}
                      className="text-green-400 hover:text-green-600 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Resolve
                    </button>
                  </>
                )}
                {alert.status === 'acknowledged' && (
                  <button
                    onClick={() => onResolve(alert)}
                    className="text-green-400 hover:text-green-600 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Displays key system health metrics in a concise card format.
 * This provides an immediate overview of the underlying infrastructure's status.
 * Business Value: Delivers a high-level, actionable summary of core system health,
 * enabling operations teams and executives to quickly ascertain the stability
 * of the entire platform and identify areas requiring immediate attention,
 * protecting service uptime and user trust.
 */
export const SystemHealthSummaryCard: React.FC<{ metrics: SystemHealthMetric | null }> = ({ metrics }) => {
  if (!metrics) {
    return <div className="bg-gray-700 p-4 rounded-lg text-center text-gray-400">Loading system health...</div>;
  }

  const getMetricColor = (value: number, threshold: number, reverse: boolean = false) => {
    if (reverse) return value < threshold ? 'text-green-400' : value < threshold * 1.2 ? 'text-yellow-400' : 'text-red-400';
    return value > threshold ? 'text-red-400' : value > threshold * 0.8 ? 'text-yellow-400' : 'text-green-400';
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">System Health Summary</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">CPU:</span>
          <span className={`font-semibold ${getMetricColor(metrics.cpuUsage, 85)}`}>{metrics.cpuUsage.toFixed(1)}%</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">Memory:</span>
          <span className={`font-semibold ${getMetricColor(metrics.memoryUsage, 80)}`}>{metrics.memoryUsage.toFixed(1)}%</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">Latency:</span>
          <span className={`font-semibold ${getMetricColor(metrics.networkLatency, 100)}`}>{metrics.networkLatency.toFixed(1)}ms</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">Errors:</span>
          <span className={`font-semibold ${getMetricColor(metrics.errorRate, 1, true)}`}>{metrics.errorRate.toFixed(2)}/min</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">Active Users:</span>
          <span className="font-semibold text-blue-400">{metrics.activeUsers}</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">API Rate:</span>
          <span className="font-semibold text-blue-400">{metrics.apiCallRate.toFixed(0)}/s</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-4 text-right">Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}</p>
    </div>
  );
};

/**
 * Represents a single data point for a chart, used by mock chart components.
 * This simple structure allows for flexible visualization of various metrics.
 * Business Value: Provides a standardized, digestible format for data visualization,
 * enabling quick interpretation of trends and patterns across different operational
 * datasets for informed decision-making.
 */
interface DataPoint {
  /** The label for the data point (e.g., timestamp, category name). */
  name: string;
  /** The numeric value of the data point. */
  value: number;
  [key: string]: any; // Allow for additional properties like 'avgLoad', 'maxLoad'
}

/**
 * A highly simplified mock line chart component for visualizing trends over time.
 * In a real application, this would use a robust charting library like Recharts or Chart.js
 * to provide interactive and high-fidelity data visualization.
 * Business Value: Offers essential trend analysis capabilities, allowing operational teams
 * to visualize performance metrics over time, identify anomalies, and understand system
 * behavior patterns without the overhead of external charting library dependencies.
 */
export const MockLineChart: React.FC<{ data: DataPoint[]; dataKeys: string[]; title: string; xAxisLabel: string; yAxisLabel: string }> = ({ data, dataKeys, title, xAxisLabel, yAxisLabel }) => {
  if (!data || data.length === 0) {
    return <div className="bg-gray-800 p-4 rounded-lg text-center text-gray-400">No data for {title}.</div>;
  }

  const allValues = data.flatMap(d => dataKeys.map(key => d[key]));
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);

  const scaleY = (val: number) => {
    if (maxValue === minValue) return 50;
    return 100 - ((val - minValue) / (maxValue - minValue)) * 100;
  };

  const scaleX = (index: number) => (index / (data.length - 1)) * 100;

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <div className="relative h-64 w-full">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute w-full h-full">
          <text x="0" y="5" className="text-xs fill-gray-400">{maxValue.toFixed(2)}</text>
          <text x="0" y="95" className="text-xs fill-gray-400">{minValue.toFixed(2)}</text>

          {dataKeys.map((key, kIdx) => (
            <polyline
              key={key}
              fill="none"
              stroke={colors[kIdx % colors.length]}
              strokeWidth="2"
              points={data.map((d, i) => `${scaleX(i)},${scaleY(d[key])}`).join(' ')}
            />
          ))}
          {dataKeys.map((key, kIdx) => (
            data.map((d, i) => (
              <circle
                key={`${key}-${i}`}
                cx={scaleX(i)}
                cy={scaleY(d[key])}
                r="1"
                fill={colors[kIdx % colors.length]}
              />
            ))
          ))}
        </svg>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>{xAxisLabel} (Start)</span>
        <span>{xAxisLabel} (End)</span>
      </div>
      <div className="flex justify-center mt-4">
        {dataKeys.map((key, kIdx) => (
          <div key={key} className="flex items-center mr-4">
            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[kIdx % colors.length] }}></span>
            <span className="text-sm text-gray-300">{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * A highly simplified mock bar chart component for comparing discrete values.
 * Similar to the line chart, a real application would use a dedicated charting library.
 * Business Value: Provides immediate comparative analysis of discrete data points,
 * such as feature contributions or agent performance, aiding quick identification
 * of top performers or critical bottlenecks without external dependencies.
 */
export const MockBarChart: React.FC<{ data: DataPoint[]; dataKey: string; title: string; xAxisLabel: string; yAxisLabel: string }> = ({ data, dataKey, title, xAxisLabel, yAxisLabel }) => {
  if (!data || data.length === 0) {
    return <div className="bg-gray-800 p-4 rounded-lg text-center text-gray-400">No data for {title}.</div>;
  }

  const values = data.map(d => d[dataKey]);
  const maxValue = Math.max(...values, 0); // Ensure max is at least 0
  const barWidth = 80 / data.length; // Max 80% width to leave space

  const scaleY = (val: number) => {
    if (maxValue === 0) return 0;
    return (val / maxValue) * 100;
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <div className="relative h-64 w-full flex items-end pt-4">
        {data.map((d, i) => (
          <div
            key={d.name}
            className="flex-grow h-full flex flex-col justify-end items-center mx-1"
            style={{ width: `${barWidth}%` }}
          >
            <div
              className={`bg-blue-500 w-3/4 rounded-t-sm transition-all duration-500 ease-out`}
              style={{ height: `${scaleY(d[dataKey])}%` }}
            ></div>
            <span className="text-xs text-gray-400 mt-1">{d.name.substring(0, Math.min(d.name.length, 5))}...</span>
            <span className="text-xs text-gray-300">{d[dataKey].toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>{xAxisLabel}</span>
        <span>{yAxisLabel}</span>
      </div>
    </div>
  );
};

/**
 * Displays the next forecasted cognitive load and recommended actions,
 * empowering proactive operational adjustments.
 * Business Value: Provides actionable intelligence for proactive resource management,
 * enabling pre-emptive throttling or scaling to avoid anticipated load spikes,
 * thereby preventing service disruptions and optimizing infrastructure costs.
 */
export const PredictiveForecastCard: React.FC<{ forecast: PredictiveForecast | null }> = ({ forecast }) => {
  if (!forecast) {
    return <div className="bg-gray-700 p-4 rounded-lg text-center text-gray-400">No forecast available.</div>;
  }

  const loadColor = getLoadColorClass(forecast.forecastedLoad);

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">Predictive Load Forecast</h3>
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-gray-400 text-sm">Forecasted Load ({new Date(forecast.timestamp).toLocaleTimeString()}):</p>
          <p className={`text-3xl font-bold ${loadColor}`}>{(forecast.forecastedLoad * 100).toFixed(1)}%</p>
          <p className="text-sm text-gray-500">Confidence: {(forecast.confidenceInterval[0] * 100).toFixed(0)}% - {(forecast.confidenceInterval[1] * 100).toFixed(0)}%</p>
        </div>
        <div className="text-right">
          {forecast.recommendedActions.length > 0 ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-600 text-red-100">
              <span className="mr-1 animate-pulse">•</span> Action Recommended
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-700 text-green-100">
              No Immediate Action
            </span>
          )}
        </div>
      </div>
      {forecast.recommendedActions.length > 0 && (
        <div className="mt-4 border-t border-gray-600 pt-4">
          <p className="text-lg font-semibold text-red-300 mb-2">Recommended Actions:</p>
          <ul className="list-disc list-inside text-gray-300">
            {forecast.recommendedActions.map((action, index) => (
              <li key={index}>
                <span className="font-medium text-white">{action.action === 'throttle' ? 'Throttle' : 'Ease'} "{mockFeatures.find(f => f.id === action.featureId)?.name || action.featureId}"</span>: {action.rationale}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-4 border-t border-gray-600 pt-4">
        <p className="text-sm font-semibold text-gray-300 mb-2">Key Influencing Factors:</p>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
          {Object.entries(forecast.influencingFactors).map(([factor, value]) => (
            <div key={factor}>
              <span className="font-medium">{factor}:</span> <span className={`${value > 0.5 ? 'text-orange-300' : 'text-gray-400'}`}>{value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * A form for editing or adding FeatureDefinition. This administrative
 * interface allows for comprehensive management of application features.
 * Business Value: Streamlines feature lifecycle management, enabling product and
 * engineering teams to define, configure, and update application features with
 * precision, ensuring that operational parameters align with business objectives
 * and user experience goals.
 */
export const FeatureEditorForm: React.FC<{ feature?: FeatureDefinition; onSave: (feature: FeatureDefinition) => void; onCancel: () => void }> = ({ feature, onSave, onCancel }) => {
  const [formData, setFormData] = useState<FeatureDefinition>(
    feature || {
      id: generateUUID(), name: '', description: '', category: FeatureCategory.Utility, cognitiveWeight: 0.5,
      baseThrottleThreshold: 0.7, isActive: true, dependencies: [], impactMetrics: [], recoveryTimeEstimate: 60,
      lastUpdated: new Date().toISOString(), ownerTeam: '', rolloutStrategy: 'all_users'
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, options } = e.target;
    const value = Array.from(options).filter(option => option.selected).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, lastUpdated: new Date().toISOString() });
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl max-w-2xl mx-auto my-4">
      <h2 className="text-2xl font-bold text-white mb-6">{feature ? 'Edit Feature' : 'Add New Feature'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">Feature Name</label>
          <input
            type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
          <textarea
            id="description" name="description" value={formData.description} onChange={handleChange} rows={3}
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
          <select
            id="category" name="category" value={formData.category} onChange={handleChange} required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {Object.values(FeatureCategory).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="cognitiveWeight" className="block text-sm font-medium text-gray-300">Cognitive Weight (0.0-1.0)</label>
            <input
              type="number" id="cognitiveWeight" name="cognitiveWeight" value={formData.cognitiveWeight} onChange={handleChange}
              min="0" max="1" step="0.01" required
              className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="baseThrottleThreshold" className="block text-sm font-medium text-gray-300">Base Throttle Threshold (0.0-1.0)</label>
            <input
              type="number" id="baseThrottleThreshold" name="baseThrottleThreshold" value={formData.baseThrottleThreshold} onChange={handleChange}
              min="0" max="1" step="0.01" required
              className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <label htmlFor="recoveryTimeEstimate" className="block text-sm font-medium text-gray-300">Recovery Time Estimate (seconds)</label>
          <input
            type="number" id="recoveryTimeEstimate" name="recoveryTimeEstimate" value={formData.recoveryTimeEstimate} onChange={handleChange}
            min="0" required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="ownerTeam" className="block text-sm font-medium text-gray-300">Owner Team</label>
          <input
            type="text" id="ownerTeam" name="ownerTeam" value={formData.ownerTeam} onChange={handleChange} required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="rolloutStrategy" className="block text-sm font-medium text-gray-300">Rollout Strategy</label>
          <select
            id="rolloutStrategy" name="rolloutStrategy" value={formData.rolloutStrategy} onChange={handleChange} required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all_users">All Users</option>
            <option value="beta_testers">Beta Testers</option>
            <option value="segment_specific">Segment Specific</option>
          </select>
        </div>
        <div className="flex items-center">
          <input
            id="isActive" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleCheckboxChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-300">Is Active</label>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button" onClick={onCancel}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Feature
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * A form for editing or adding ThrottlingPolicy. This powerful interface
 * enables administrators to fine-tune the system's dynamic load management rules.
 * Business Value: Empowers administrators to precisely configure and deploy
 * load balancing policies, directly influencing system performance, user experience,
 * and operational costs, ensuring agility in response to evolving business needs.
 */
export const PolicyEditorForm: React.FC<{ policy?: ThrottlingPolicy; allFeatures: FeatureDefinition[]; onSave: (policy: ThrottlingPolicy) => void; onCancel: () => void }> = ({ policy, allFeatures, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ThrottlingPolicy>(
    policy || {
      id: generateUUID(), name: '', description: '', strategy: ThrottlingStrategy.StaticThreshold,
      targetFeatureIds: [], userSegments: [], thresholdConfig: { staticLoadThreshold: 0.7 },
      activationConditions: [], deactivationConditions: [], priority: 10, isActive: true,
      lastModifiedBy: 'admin', lastModifiedDate: new Date().toISOString(), efficacyMetrics: []
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, options } = e.target;
    const value = Array.from(options).filter(option => option.selected).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      [name]: value as UserSegment[] | string[], // Type assertion for multi-selects
    }));
  };

  const handleThresholdConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      thresholdConfig: {
        ...prev.thresholdConfig,
        [name]: type === 'number' ? parseFloat(value) : value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, lastModifiedDate: new Date().toISOString() });
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl max-w-2xl mx-auto my-4">
      <h2 className="text-2xl font-bold text-white mb-6">{policy ? 'Edit Throttling Policy' : 'Add New Throttling Policy'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">Policy Name</label>
          <input
            type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
          <textarea
            id="description" name="description" value={formData.description} onChange={handleChange} rows={3}
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="strategy" className="block text-sm font-medium text-gray-300">Strategy</label>
          <select
            id="strategy" name="strategy" value={formData.strategy} onChange={handleChange} required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {Object.values(ThrottlingStrategy).map(strat => (
              <option key={strat} value={strat}>{strat}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="targetFeatureIds" className="block text-sm font-medium text-gray-300">Target Features</label>
          <select
            id="targetFeatureIds" name="targetFeatureIds" multiple value={formData.targetFeatureIds} onChange={handleMultiSelectChange}
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-32"
          >
            {allFeatures.map(feat => (
              <option key={feat.id} value={feat.id}>{feat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="userSegments" className="block text-sm font-medium text-gray-300">Target User Segments</label>
          <select
            id="userSegments" name="userSegments" multiple value={formData.userSegments} onChange={handleMultiSelectChange}
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-32"
          >
            {Object.values(UserSegment).map(segment => (
              <option key={segment} value={segment}>{segment}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-300">Priority (lower is higher)</label>
            <input
              type="number" id="priority" name="priority" value={formData.priority} onChange={handleChange}
              min="0" required
              className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="staticLoadThreshold" className="block text-sm font-medium text-gray-300">Static Load Threshold</label>
            <input
              type="number" id="staticLoadThreshold" name="staticLoadThreshold" value={formData.thresholdConfig.staticLoadThreshold || ''} onChange={handleThresholdConfigChange}
              min="0" max="1" step="0.01"
              className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="flex items-center">
          <input
            id="isActive" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleCheckboxChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-300">Is Active</label>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button" onClick={onCancel}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Policy
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * Displays a table of all configured integrations, offering a centralized
 * view for managing external system connections.
 * Business Value: Provides transparent oversight and management of all critical
 * third-party integrations, ensuring seamless data flow, reducing configuration errors,
 * and maintaining the integrity of the integrated ecosystem, protecting business operations.
 */
export const IntegrationConfigTable: React.FC<{ configs: IntegrationConfig[]; onEditConfig: (config: IntegrationConfig) => void; onDeleteConfig: (configId: string) => void }> = ({ configs, onEditConfig, onDeleteConfig }) => {
  if (configs.length === 0) {
    return <p className="text-gray-400">No integrations configured.</p>;
  }

  const getStatusColor = (status: IntegrationConfig['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-700 text-green-100';
      case 'disconnected': return 'bg-red-700 text-red-100';
      case 'error': return 'bg-orange-700 text-orange-100';
      default: return 'bg-gray-600 text-gray-100';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900/50">
          <tr>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Tested</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {configs.map(config => (
            <tr key={config.id} className="hover:bg-gray-700">
              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-white">{config.name}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{config.type}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(config.status)}`}>
                  {config.status.charAt(0).toUpperCase() + config.status.slice(1)}
                </span>
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{config.lastTested ? new Date(config.lastTested).toLocaleString() : 'N/A'}</td>
              <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEditConfig(config)}
                  className="text-indigo-400 hover:text-indigo-600 ml-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteConfig(config.id)}
                  className="text-red-400 hover:text-red-600 ml-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Displays cognitive load distribution across user segments. This visualization
 * highlights how different user groups are impacted by system load.
 * Business Value: Provides critical insights for user experience optimization and targeted
 * resource allocation, enabling product teams to ensure high-value user segments receive
 * optimal performance and drive tailored engagement strategies for various user groups.
 */
export const UserSegmentDistribution: React.FC<{ historicalData: HistoricalCognitiveData[] }> = ({ historicalData }) => {
  if (historicalData.length === 0) {
    return <p className="text-gray-400">No historical user segment data available.</p>;
  }

  const latestData = historicalData[historicalData.length - 1];
  const segmentDataPoints: DataPoint[] = Object.entries(latestData.userSegmentBreakdown).map(([segment, metrics]) => ({
    name: segment,
    value: metrics.avgLoad,
    userCount: metrics.userCount,
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">User Segment Load Distribution</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {segmentDataPoints.map(dp => (
          <div key={dp.name} className="bg-gray-800 p-3 rounded-md flex flex-col justify-between">
            <h4 className="font-semibold text-white">{dp.name}</h4>
            <p className={`text-2xl font-bold ${getLoadColorClass(dp.value)}`}>{(dp.value * 100).toFixed(1)}%</p>
            <p className="text-sm text-gray-400">{dp.userCount} users</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Displays the status of the adaptive feedback loop, highlighting
 * its optimization goals and proposed adjustments.
 * Business Value: Offers transparency into the system's autonomous self-optimization
 * capabilities, assuring stakeholders that the platform is continually learning
 * and adapting to improve efficiency, resilience, and user experience, thereby
 * delivering sustained value and reducing operational overhead.
 */
export const FeedbackLoopStatusCard: React.FC<{ status: FeedbackLoopStatus | null }> = ({ status }) => {
  if (!status) {
    return <div className="bg-gray-700 p-4 rounded-lg text-center text-gray-400">Loading feedback loop status...</div>;
  }

  const efficacyColor = getLoadColorClass(status.efficacyScore).replace('text-', '');

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">Adaptive Feedback Loop</h3>
      <div className="mb-4">
        <p className="text-gray-400">Status Message:</p>
        <p className="text-lg text-white font-medium">{status.statusMessage}</p>
      </div>
      <div className="flex justify-between items-center mb-4 border-t border-gray-600 pt-4">
        <div>
          <p className="text-gray-400 text-sm">Last Evaluation:</p>
          <p className="text-white">{new Date(status.lastEvaluationTimestamp).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Next Evaluation:</p>
          <p className="text-white">{new Date(status.nextEvaluationDue).toLocaleString()}</p>
        </div>
      </div>
      <div className="mb-4 border-t border-gray-600 pt-4">
        <p className="text-gray-400 text-sm">Current Efficacy Score:</p>
        <div className="flex items-center">
          <span className={`text-4xl font-bold mr-2 ${efficacyColor}`}>{(status.efficacyScore * 100).toFixed(1)}</span>
          <span className={`text-xl ${efficacyColor}`}>%</span>
        </div>
        <p className="text-sm text-gray-500">Optimization Goal: {status.optimizationGoal.replace(/_/g, ' ')}</p>
      </div>
      {Object.keys(status.proposedAdjustments).length > 0 && (
        <div className="mt-4 border-t border-gray-600 pt-4">
          <p className="text-lg font-semibold text-blue-300 mb-2">Proposed Adjustments:</p>
          <ul className="list-disc list-inside text-gray-300">
            {Object.entries(status.proposedAdjustments).map(([policyId, adjustment]) => (
              <li key={policyId}>
                <span className="font-medium text-white">Policy "{mockThrottlingPolicies.find(p => p.id === policyId)?.name || policyId}":</span> {adjustment}
              </li>
            ))}
          </ul>
        </div>
      )}
      <button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Review & Apply Optimizations
      </button>
    </div>
  );
};

/**
 * Displays a table of all defined AI agents and their current health metrics.
 * This provides essential oversight for the autonomous workforce.
 * Business Value: Ensures the operational integrity and accountability of every AI agent,
 * allowing for proactive management of the automated workforce, minimizing errors,
 * and maximizing the efficiency of agentic workflows.
 */
export const AgentStatusTable: React.FC<{ agents: AgentDefinition[]; healthMetrics: AgentHealthMetric[]; onEditAgent: (agent: AgentDefinition) => void; onDeleteAgent: (agentId: string) => void }> = ({ agents, healthMetrics, onEditAgent, onDeleteAgent }) => {
  if (agents.length === 0) {
    return <p className="text-gray-400">No AI agents defined.</p>;
  }

  const getAgentHealth = (agentId: string) => healthMetrics.find(m => m.agentId === agentId);

  const getHealthColor = (score: number | undefined) => {
    if (score === undefined) return 'text-gray-400';
    if (score > 0.8) return 'text-green-400';
    if (score > 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900/50">
          <tr>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Health Score</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Active Tasks</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {agents.map(agent => {
            const health = getAgentHealth(agent.id);
            return (
              <tr key={agent.id} className="hover:bg-gray-700">
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-white">{agent.name}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{agent.category}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${agent.status === 'active' ? 'bg-green-700 text-green-100' : agent.status === 'error' ? 'bg-red-700 text-red-100' : 'bg-yellow-600 text-yellow-100'}`}>
                    {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                  </span>
                </td>
                <td className={`px-3 py-2 whitespace-nowrap text-sm font-bold ${getHealthColor(health?.healthScore)}`}>
                  {health ? (health.healthScore * 100).toFixed(1) + '%' : 'N/A'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{health?.activeTasks || 0}</td>
                <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEditAgent(agent)}
                    className="text-indigo-400 hover:text-indigo-600 ml-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteAgent(agent.id)}
                    className="text-red-400 hover:text-red-600 ml-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Displays the real-time operational status and key metrics for a token rail.
 * This provides immediate insight into the health of specific financial rails.
 * Business Value: Ensures granular, real-time observability over each token rail,
 * facilitating proactive load management and routing decisions to maintain optimal
 * transaction speed, reliability, and security across all digital value movements.
 */
export const TokenRailStatusCard: React.FC<{ metric: TokenRailMetrics }> = ({ metric }) => {
  const getStatusColor = (status: TokenRailMetrics['status']) => {
    switch (status) {
      case 'operational': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-white mb-2">{metric.railType} ({metric.railId})</h3>
      <p className={`text-sm font-medium ${getStatusColor(metric.status)} mb-2`}>Status: {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}</p>
      <div className="text-sm text-gray-300 space-y-1">
        <p>TPS: <span className="font-semibold text-blue-300">{metric.tps}</span></p>
        <p>Avg Latency: <span className="font-semibold">{metric.avgLatency.toFixed(1)}ms</span></p>
        <p>Error Rate: <span className="font-semibold">{(metric.errorRate * 100).toFixed(2)}%</span></p>
        <p>Queue Depth: <span className="font-semibold">{metric.queueDepth}</span></p>
        <p>Value Transacted: <span className="font-semibold text-indigo-300">${metric.totalValueTransacted.toLocaleString()}</span></p>
      </div>
      <p className="text-xs text-gray-500 mt-3 text-right">Last updated: {new Date(metric.timestamp).toLocaleTimeString()}</p>
    </div>
  );
};

/**
 * Displays a high-level overview of the payment engine's status,
 * acting as a central health monitor for financial transactions.
 * Business Value: Provides a critical, high-level overview of the entire payment
 * processing system, enabling executive decision-makers and operations teams
 * to quickly assess financial transaction health and respond to any systemic issues,
 * protecting core revenue streams.
 */
export const PaymentEngineOverviewCard: React.FC<{ status: PaymentEngineStatus | null }> = ({ status }) => {
  if (!status) {
    return <div className="bg-gray-700 p-4 rounded-lg text-center text-gray-400">Loading payment engine status...</div>;
  }

  const getOverallStatusColor = (s: PaymentEngineStatus['overallStatus']) => {
    switch (s) {
      case 'online': return 'text-green-400';
      case 'partially_degraded': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">Payment Engine Overview</h3>
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-gray-400 text-sm">Overall Status:</p>
          <p className={`text-2xl font-bold ${getOverallStatusColor(status.overallStatus)}`}>{status.overallStatus.replace(/_/g, ' ').toUpperCase()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Requests/Sec: <span className="text-white font-semibold">{status.requestsPerSecond}</span></p>
          <p className="text-sm text-gray-400">Avg Latency: <span className="text-white font-semibold">{status.avgProcessingLatency.toFixed(1)}ms</span></p>
          <p className="text-sm text-gray-400">Failure Rate: <span className="text-red-400 font-semibold">{(status.failureRate * 100).toFixed(2)}%</span></p>
        </div>
      </div>
      <div className="mt-4 border-t border-gray-600 pt-4">
        <p className="text-sm font-semibold text-gray-300 mb-2">Key Metrics:</p>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
          <div><span className="font-medium">In-Flight TXNs:</span> <span className="text-white">{status.inFlightTransactions}</span></div>
          <div><span className="font-medium">Flagged TXNs:</span> <span className="text-orange-300">{status.flaggedTransactions}</span></div>
          {Object.entries(status.railStatuses).map(([railId, railStatus]) => (
            <div key={railId}>
              <span className="font-medium">{railId}:</span> <span className={`${getOverallStatusColor(railStatus)}`}>{railStatus}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-4 text-right">Last updated: {new Date(status.timestamp).toLocaleTimeString()}</p>
    </div>
  );
};

/**
 * Displays a stream of authentication and authorization log entries.
 * This provides a critical security audit trail.
 * Business Value: Serves as a tamper-evident record of all identity-related events,
 * crucial for forensic analysis, audit compliance, and real-time security monitoring,
 * protecting against unauthorized access and demonstrating regulatory adherence.
 */
export const AuthLogViewer: React.FC<{ logs: AuthLogEntry[] }> = ({ logs }) => {
  if (logs.length === 0) {
    return <p className="text-gray-400">No authentication logs available.</p>;
  }

  const getOutcomeColor = (outcome: AuthLogEntry['outcome']) => {
    switch (outcome) {
      case 'success': return 'text-green-400';
      case 'failure': return 'text-red-400';
      case 'denied': return 'text-orange-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="overflow-x-auto max-h-96">
      <table className="w-full text-left">
        <thead className="bg-gray-900/70 sticky top-0">
          <tr>
            <th className="p-3">Time</th>
            <th className="p-3">Event Type</th>
            <th className="p-3">Entity ID</th>
            <th className="p-3">IP Address</th>
            <th className="p-3">Outcome</th>
            <th className="p-3">Message</th>
            <th className="p-3">Hash</th>
          </tr>
        </thead>
        <tbody>
          {sortedLogs.slice(0, 20).map(log => (
            <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-700">
              <td className="p-3 font-mono text-xs text-gray-300">{new Date(log.timestamp).toLocaleTimeString()}</td>
              <td className="p-3 text-sm text-white">{log.eventType}</td>
              <td className="p-3 text-sm text-gray-300">{log.entityId}</td>
              <td className="p-3 text-sm text-gray-400">{log.ipAddress}</td>
              <td className={`p-3 text-sm font-semibold ${getOutcomeColor(log.outcome)}`}>
                {log.outcome.charAt(0).toUpperCase() + log.outcome.slice(1)}
              </td>
              <td className="p-3 text-sm text-gray-300">{log.message}</td>
              <td className="p-3 text-sm font-mono text-gray-500">{log.entryHash.substring(0, 10)}...</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Form for editing or adding AgentDefinition.
 * This form centralizes the configuration and lifecycle management for individual AI agents.
 * Business Value: Empowers administrators to precisely define and manage AI agents,
 * ensuring they are configured to meet specific business objectives, operate securely,
 * and integrate seamlessly into automated workflows.
 */
export const AgentEditorForm: React.FC<{ agent?: AgentDefinition; onSave: (agent: AgentDefinition) => void; onCancel: () => void }> = ({ agent, onSave, onCancel }) => {
  const [formData, setFormData] = useState<AgentDefinition>(
    agent || {
      id: generateUUID(), name: '', description: '', category: AgentCategory.Monitoring,
      skills: [], status: 'idle', configuration: {}, operationalLoadThreshold: 100,
      lastUpdated: new Date().toISOString(), ownerTeam: '', rbacRole: '', publicKey: `mock_agent_pubkey_${generateUUID().substring(0,8)}`
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, options } = e.target;
    const value = Array.from(options).filter(option => option.selected).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      [name]: value as AgentSkill[],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, lastUpdated: new Date().toISOString() });
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl max-w-2xl mx-auto my-4">
      <h2 className="text-2xl font-bold text-white mb-6">{agent ? 'Edit AI Agent' : 'Add New AI Agent'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="agentName" className="block text-sm font-medium text-gray-300">Agent Name</label>
          <input
            type="text" id="agentName" name="name" value={formData.name} onChange={handleChange} required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="agentDescription" className="block text-sm font-medium text-gray-300">Description</label>
          <textarea
            id="agentDescription" name="description" value={formData.description} onChange={handleChange} rows={2}
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="agentCategory" className="block text-sm font-medium text-gray-300">Category</label>
          <select
            id="agentCategory" name="category" value={formData.category} onChange={handleChange} required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {Object.values(AgentCategory).map(cat => (<option key={cat} value={cat}>{cat}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="agentSkills" className="block text-sm font-medium text-gray-300">Skills (Multi-select)</label>
          <select
            id="agentSkills" name="skills" multiple
            value={formData.skills} onChange={handleMultiSelectChange}
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-32"
          >
            {Object.values(AgentSkill).map(skill => (<option key={skill} value={skill}>{skill}</option>))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="agentStatus" className="block text-sm font-medium text-gray-300">Status</label>
            <select
              id="agentStatus" name="status" value={formData.status} onChange={handleChange} required
              className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {['active', 'idle', 'suspended', 'error'].map(status => (<option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="operationalLoadThreshold" className="block text-sm font-medium text-gray-300">Operational Load Threshold</label>
            <input
              type="number" id="operationalLoadThreshold" name="operationalLoadThreshold" value={formData.operationalLoadThreshold} onChange={handleChange} required
              className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <label htmlFor="ownerTeam" className="block text-sm font-medium text-gray-300">Owner Team</label>
          <input
            type="text" id="ownerTeam" name="ownerTeam" value={formData.ownerTeam} onChange={handleChange} required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="rbacRole" className="block text-sm font-medium text-gray-300">RBAC Role</label>
          <input
            type="text" id="rbacRole" name="rbacRole" value={formData.rbacRole} onChange={handleChange} required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button" onClick={onCancel}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Agent
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * Form for editing or adding IntegrationConfig.
 * This component provides a robust interface for configuring and managing external system integrations.
 * Business Value: Streamlines the process of integrating with critical external services,
 * reducing manual configuration errors and ensuring consistent connectivity across the platform,
 * thereby enhancing operational efficiency and reliability.
 */
export const IntegrationConfigEditorForm: React.FC<{ config?: IntegrationConfig; onSave: (config: IntegrationConfig) => void; onCancel: () => void }> = ({ config, onSave, onCancel }) => {
  const [formData, setFormData] = useState<IntegrationConfig>(
    config || {
      id: generateUUID(), name: '', type: 'custom_webhook', status: 'disconnected', settings: {}
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'type') {
      setFormData(prev => ({ ...prev, [name]: value as IntegrationConfig['type'], settings: {} })); // Reset settings on type change
    } else if (name.startsWith('settings.')) {
      const settingKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        settings: { ...prev.settings, [settingKey]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl max-w-lg mx-auto my-4">
      <h2 className="text-2xl font-bold text-white mb-6">
        {config ? 'Edit Integration' : 'Add New Integration'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="integrationName" className="block text-sm font-medium text-gray-300">Integration Name</label>
          <input
            type="text" id="integrationName" name="name" value={formData.name} onChange={handleChange} required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="integrationType" className="block text-sm font-medium text-gray-300">Type</label>
          <select
            id="integrationType" name="type" value={formData.type} onChange={handleChange} required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="slack">Slack</option>
            <option value="datadog">Datadog</option>
            <option value="jira">Jira</option>
            <option value="email">Email</option>
            <option value="custom_webhook">Custom Webhook</option>
          </select>
        </div>
        {formData.type === 'slack' && (
          <div>
            <label htmlFor="settings.webhookUrl" className="block text-sm font-medium text-gray-300">Webhook URL</label>
            <input
              type="url" id="settings.webhookUrl" name="settings.webhookUrl" value={formData.settings.webhookUrl || ''} onChange={handleChange}
              className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        )}
        {formData.type === 'datadog' && (
          <div>
            <label htmlFor="settings.apiKey" className="block text-sm font-medium text-gray-300">API Key</label>
            <input
              type="text" id="settings.apiKey" name="settings.apiKey" value={formData.settings.apiKey || ''} onChange={handleChange}
              className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        )}
        {formData.type === 'email' && (
          <>
            <div>
              <label htmlFor="settings.smtpHost" className="block text-sm font-medium text-gray-300">SMTP Host</label>
              <input
                type="text" id="settings.smtpHost" name="settings.smtpHost" value={formData.settings.smtpHost || ''} onChange={handleChange}
                className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="settings.sender" className="block text-sm font-medium text-gray-300">Sender Email</label>
              <input
                type="email" id="settings.sender" name="settings.sender" value={formData.settings.sender || ''} onChange={handleChange}
                className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </>
        )}
        {formData.type === 'jira' && (
          <>
            <div>
              <label htmlFor="settings.projectKey" className="block text-sm font-medium text-gray-300">Jira Project Key</label>
              <input
                type="text" id="settings.projectKey" name="settings.projectKey" value={formData.settings.projectKey || ''} onChange={handleChange}
                className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="settings.issueType" className="block text-sm font-medium text-gray-300">Jira Issue Type</label>
              <input
                type="text" id="settings.issueType" name="settings.issueType" value={formData.settings.issueType || ''} onChange={handleChange}
                className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </>
        )}
        {formData.type === 'custom_webhook' && (
          <div>
            <label htmlFor="settings.serviceKey" className="block text-sm font-medium text-gray-300">Service Key/Endpoint</label>
            <input
              type="text" id="settings.serviceKey" name="settings.serviceKey" value={formData.settings.serviceKey || ''} onChange={handleChange}
              className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        )}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button" onClick={onCancel}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Integration
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * Displays a table of token accounts and their current balances.
 * This component offers transparent visibility into the digital ledger's state.
 * Business Value: Provides an essential overview of liquidity and asset distribution
 * within the token rail system, critical for financial reporting, risk management,
 * and ensuring the transparency and auditability of all digital assets.
 */
export const TokenAccountsTable: React.FC<{ accounts: TokenAccountSnapshot[] }> = ({ accounts }) => {
  if (accounts.length === 0) {
    return <p className="text-gray-400">No token accounts available.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900/50">
          <tr>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Account ID</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Balance</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Transaction</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Txn Count</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {accounts.map(account => (
            <tr key={account.accountId} className="hover:bg-gray-700">
              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-white">{account.accountId}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-green-300">${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{new Date(account.lastTransactionTimestamp).toLocaleString()}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{account.transactionCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Displays a table of recent payment requests.
 * This provides detailed insights into the flow and status of individual payment transactions.
 * Business Value: Offers granular traceability for payment operations, enabling rapid
 * issue diagnosis, reconciliation, and fraud investigation, thereby enhancing trust
 * and operational efficiency in real-time payment processing.
 */
export const PaymentRequestsTable: React.FC<{ requests: PaymentRequestMetric[] }> = ({ requests }) => {
  if (requests.length === 0) {
    return <p className="text-gray-400">No payment requests available.</p>;
  }

  const getStatusColor = (status: TokenTransactionStatus) => {
    switch (status) {
      case TokenTransactionStatus.Confirmed: return 'text-green-400';
      case TokenTransactionStatus.Failed: return 'text-red-400';
      case TokenTransactionStatus.Blocked: return 'text-orange-400';
      case TokenTransactionStatus.Pending: return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const sortedRequests = [...requests].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="overflow-x-auto max-h-96">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900/70 sticky top-0">
          <tr>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Request ID</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rail</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Risk Score</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Processing Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {sortedRequests.slice(0, 20).map(req => (
            <tr key={req.requestId} className="hover:bg-gray-700">
              <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-300">{new Date(req.timestamp).toLocaleTimeString()}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-white">{req.requestId}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-green-300">{req.amount.toLocaleString('en-US', { style: 'currency', currency: req.currency })}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{req.chosenRail}</td>
              <td className={`px-3 py-2 whitespace-nowrap text-sm font-semibold ${getStatusColor(req.status)}`}>
                {req.status} {req.fraudReason && <span className="text-red-500 text-xs">({req.fraudReason})</span>}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-yellow-300">{(req.riskScore * 100).toFixed(1)}%</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{req.processingTime.toFixed(0)}ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Form for editing or adding AlertDefinition.
 * This component provides a streamlined interface for defining and managing alert rules.
 * Business Value: Enables real-time customization of incident detection, ensuring that
 * operational alerts are tailored to critical thresholds and business priorities,
 * thereby minimizing false positives and accelerating response to genuine threats.
 */
export const AlertDefinitionEditorForm: React.FC<{ definition?: AlertDefinition; onSave: (def: AlertDefinition) => void; onCancel: () => void; allFeatures: FeatureDefinition[] }> = ({ definition, onSave, onCancel, allFeatures }) => {
  const [formData, setFormData] = useState<AlertDefinition>(
    definition || {
      id: generateUUID(), name: '', description: '', severity: AlertSeverity.Warning, condition: '',
      targetFeatures: [], targetUserSegments: [], notificationChannels: ['email'], isActive: true,
      debouncePeriod: 300, autoResolveCondition: '',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, options } = e.target;
    const value = Array.from(options).filter(option => option.selected).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl max-w-2xl mx-auto my-4">
      <h2 className="text-2xl font-bold text-white mb-6">{definition ? 'Edit Alert Definition' : 'Add New Alert Definition'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">Alert Name</label>
          <input
            type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
          <textarea
            id="description" name="description" value={formData.description} onChange={handleChange} rows={2}
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="severity" className="block text-sm font-medium text-gray-300">Severity</label>
          <select
            id="severity" name="severity" value={formData.severity} onChange={handleChange} required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {Object.values(AlertSeverity).map(s => (<option key={s} value={s}>{s}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-300">Condition (e.g., 'avgCognitiveLoad > 0.9 for 120s')</label>
          <input
            type="text" id="condition" name="condition" value={formData.condition} onChange={handleChange} required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="autoResolveCondition" className="block text-sm font-medium text-gray-300">Auto Resolve Condition</label>
          <input
            type="text" id="autoResolveCondition" name="autoResolveCondition" value={formData.autoResolveCondition} onChange={handleChange}
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="targetFeatures" className="block text-sm font-medium text-gray-300">Target Features (Multi-select)</label>
          <select
            id="targetFeatures" name="targetFeatures" multiple value={formData.targetFeatures} onChange={handleMultiSelectChange}
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-32"
          >
            {allFeatures.map(feat => (<option key={feat.id} value={feat.id}>{feat.name}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="notificationChannels" className="block text-sm font-medium text-gray-300">Notification Channels (Multi-select)</label>
          <select
            id="notificationChannels" name="notificationChannels" multiple value={formData.notificationChannels} onChange={handleMultiSelectChange}
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-24"
          >
            {['email', 'slack', 'pagerduty', 'custom_webhook'].map(channel => (<option key={channel} value={channel}>{channel}</option>))}
          </select>
        </div>
        <div className="flex items-center">
          <input
            id="isActive" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleCheckboxChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-300">Is Active</label>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button" onClick={onCancel}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Definition
          </button>
        </div>
      </form>
    </div>
  );
};


/**
 * Form for editing or adding EscalationPolicy.
 * This component provides a robust interface for defining and managing critical incident escalation workflows.
 * Business Value: Ensures that critical alerts are escalated according to predefined rules,
 * minimizing mean-time-to-resolution (MTTR) and protecting core business operations from prolonged disruption,
 * thereby safeguarding revenue and brand reputation.
 */
export const EscalationPolicyEditorForm: React.FC<{ policy?: EscalationPolicy; onSave: (policy: EscalationPolicy) => void; onCancel: () => void }> = ({ policy, onSave, onCancel }) => {
  const [formData, setFormData] = useState<EscalationPolicy>(
    policy || {
      id: generateUUID(), name: '', description: '', steps: [], isActive: true,
      lastModifiedBy: 'admin', lastModifiedDate: new Date().toISOString(),
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleStepChange = (index: number, field: string, value: any) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData(prev => ({ ...prev, steps: newSteps }));
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { delaySeconds: 0, targetType: 'channel', targetIdentifier: '', notificationMessage: '' }]
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, lastModifiedDate: new Date().toISOString() });
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl max-w-2xl mx-auto my-4">
      <h2 className="text-2xl font-bold text-white mb-6">{policy ? 'Edit Escalation Policy' : 'Add New Escalation Policy'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">Policy Name</label>
          <input
            type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
          <textarea
            id="description" name="description" value={formData.description} onChange={handleChange} rows={2}
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="border-t border-gray-600 pt-4">
          <h3 className="text-lg font-bold text-gray-300 mb-4">Escalation Steps</h3>
          {formData.steps.map((step, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-md mb-3 space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-md font-semibold text-white">Step {index + 1}</h4>
                <button type="button" onClick={() => removeStep(index)} className="text-red-400 hover:text-red-600 text-sm">Remove</button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Delay (seconds)</label>
                <input
                  type="number" value={step.delaySeconds} onChange={(e) => handleStepChange(index, 'delaySeconds', parseInt(e.target.value))}
                  className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm text-white sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Target Type</label>
                <select
                  value={step.targetType} onChange={(e) => handleStepChange(index, 'targetType', e.target.value as 'channel' | 'team' | 'user')}
                  className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm text-white sm:text-sm"
                >
                  <option value="channel">Channel</option>
                  <option value="team">Team</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Target Identifier</label>
                <input
                  type="text" value={step.targetIdentifier} onChange={(e) => handleStepChange(index, 'targetIdentifier', e.target.value)}
                  className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm text-white sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Notification Message</label>
                <textarea
                  value={step.notificationMessage} onChange={(e) => handleStepChange(index, 'notificationMessage', e.target.value)} rows={1}
                  className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm text-white sm:text-sm"
                />
              </div>
            </div>
          ))}
          <button type="button" onClick={addStep} className="mt-2 text-indigo-400 hover:text-indigo-600">
            + Add Escalation Step
          </button>
        </div>

        <div className="flex items-center mt-4">
          <input
            id="isActive" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleCheckboxChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-300">Is Active</label>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button" onClick={onCancel}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Policy
          </button>
        </div>
      </form>
    </div>
  );
};


/**
 * Displays a table of all defined alert definitions.
 * This table enables administrators to review, edit, and create new alert rules,
 * ensuring the system's operational health is continuously monitored with precision.
 * Business Value: Provides central oversight for the platform's anomaly detection
 * and incident management strategy, directly impacting uptime, reducing critical
 * response times, and ensuring compliance with operational SLAs.
 */
export const AlertDefinitionsTable: React.FC<{ definitions: AlertDefinition[]; onEditDefinition: (def: AlertDefinition) => void; onDeleteDefinition: (defId: string) => void }> = ({ definitions, onEditDefinition, onDeleteDefinition }) => {
  if (definitions.length === 0) {
    return <p className="text-gray-400">No alert definitions defined.</p>;
  }

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.Critical: return 'text-red-400';
      case AlertSeverity.Emergency: return 'text-purple-400';
      case AlertSeverity.Warning: return 'text-yellow-400';
      case AlertSeverity.Info: return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900/50">
          <tr>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Severity</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Condition</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {definitions.map(def => (
            <tr key={def.id} className="hover:bg-gray-700">
              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-white">{def.name}</td>
              <td className={`px-3 py-2 whitespace-nowrap text-sm font-semibold ${getSeverityColor(def.severity)}`}>{def.severity}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{def.condition}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${def.isActive ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}>
                  {def.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEditDefinition(def)}
                  className="text-indigo-400 hover:text-indigo-600 ml-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteDefinition(def.id)}
                  className="text-red-400 hover:text-red-600 ml-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


/**
 * Displays a table of all defined escalation policies.
 * This component offers a comprehensive overview and management interface for critical incident response plans.
 * Business Value: Provides transparent governance over crisis management, ensuring that
 * every critical incident follows a predefined escalation path to minimize disruption
 * and protect the platform's continuity and financial stability.
 */
export const EscalationPoliciesTable: React.FC<{ policies: EscalationPolicy[]; onEditPolicy: (policy: EscalationPolicy) => void; onDeletePolicy: (policyId: string) => void }> = ({ policies, onEditPolicy, onDeletePolicy }) => {
  if (policies.length === 0) {
    return <p className="text-gray-400">No escalation policies defined.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900/50">
          <tr>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Steps</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {policies.map(policy => (
            <tr key={policy.id} className="hover:bg-gray-700">
              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-white">{policy.name}</td>
              <td className="px-3 py-2 text-sm text-gray-300 truncate max-w-xs">{policy.description}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{policy.steps.length} steps</td>
              <td className="px-3 py-2 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${policy.isActive ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}>
                  {policy.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEditPolicy(policy)}
                  className="text-indigo-400 hover:text-indigo-600 ml-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeletePolicy(policy.id)}
                  className="text-red-400 hover:text-red-600 ml-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


/**
 * Displays a detailed table of user profiles.
 * This table provides a centralized view for managing user data, segments, and identity attributes.
 * Business Value: Facilitates granular control over user management, supporting segment-specific
 * personalization, compliance with data regulations, and targeted marketing efforts,
 * thereby increasing user lifetime value and platform adoption.
 */
export const UserProfileTable: React.FC<{ users: UserProfile[]; onGenerateKeyPair: (userId: string) => void }> = ({ users, onGenerateKeyPair }) => {
  if (users.length === 0) {
    return <p className="text-gray-400">No user profiles available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900/50">
          <tr>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User ID</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Segment</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Engagement</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Public Key</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {users.map(user => (
            <tr key={user.userId} className="hover:bg-gray-700">
              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-white">{user.userId}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{user.segment}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-blue-300">{(user.engagementScore * 100).toFixed(0)}%</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{user.accountStatus}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm font-mono text-gray-500">{user.publicKey ? `${user.publicKey.substring(0, 15)}...` : 'N/A'}</td>
              <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onGenerateKeyPair(user.userId)}
                  className="text-green-400 hover:text-green-600 ml-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Generate Key
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


// Main View Component -------------------------------------------------------------------------------------------------

/**
 * The main dashboard for monitoring and managing cognitive and operational load balancing.
 * This component integrates various sub-components and hooks to provide a comprehensive view
 * of real-time metrics, historical data, feature management, throttling policies, alerts,
 * system health, predictive analytics, and specialized insights into agentic AI, token rails,
 * real-time payments, and digital identity infrastructure.
 * Business Value: This consolidated view is the command center for operational excellence.
 * It provides a holistic, commercial-grade interface for managing the entire Money20/20
 * build phase architecture, translating complex data into actionable insights that drive
 * performance, security, and profitability. By enabling proactive management of both
 * user experience and core financial infrastructure, it ensures uninterrupted service,
 * optimized resource utilization, and enhanced regulatory compliance, directly
 * contributing to multi-million dollar operational savings and new revenue opportunities.
 */
const CognitiveLoadBalancerView: React.FC = () => {
  // Original state for real-time metrics
  const [metrics, setMetrics] = useState<CognitiveMetric[]>([]);

  // State for managing editing modals
  const [showFeatureEditor, setShowFeatureEditor] = useState(false);
  const [editingFeature, setEditingFeature] = useState<FeatureDefinition | undefined>(undefined);
  const [showPolicyEditor, setShowPolicyEditor] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<ThrottlingPolicy | undefined>(undefined);
  const [showIntegrationEditor, setShowIntegrationEditor] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<IntegrationConfig | undefined>(undefined);
  const [showAgentEditor, setShowAgentEditor] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentDefinition | undefined>(undefined);
  const [showAlertDefinitionEditor, setShowAlertDefinitionEditor] = useState(false);
  const [editingAlertDefinition, setEditingAlertDefinition] = useState<AlertDefinition | undefined>(undefined);
  const [showEscalationPolicyEditor, setShowEscalationPolicyEditor] = useState(false);
  const [editingEscalationPolicy, setEditingEscalationPolicy] = useState<EscalationPolicy | undefined>(undefined);


  // Custom hooks for data management
  const { features, loading: featuresLoading, error: featuresError, fetchFeatures, addFeature, updateFeature, deleteFeature } = useFeatureDefinitions();
  const { policies, loading: policiesLoading, error: policiesError, fetchPolicies, addPolicy, updatePolicy, deletePolicy } = useThrottlingPolicies();
  const { definitions: alertDefs, instances: alertInstances, loading: alertsLoading, error: alertsError, fetchInstances: fetchAlertInstances, updateInstance: updateAlertInstance, createDefinition: createAlertDefinition, updateDefinition: updateAlertDefinition, deleteDefinition: deleteAlertDefinition } = useAlerts();
  const { policies: escalationPolicies, loading: escalationPoliciesLoading, error: escalationPoliciesError, fetchPolicies: fetchEscalationPolicies, addPolicy: addEscalationPolicy, updatePolicy: updateEscalationPolicy, deletePolicy: deleteEscalationPolicy } = useEscalationPolicies();
  const { currentMetrics: systemHealth, history: systemHealthHistory, loading: systemHealthLoading, error: systemHealthError } = useSystemHealth();
  const { users, loading: usersLoading, error: usersError, generateUserKeyPair } = useUserProfiles();
  const { history: historicalCognitiveData, loading: historicalLoading, error: historicalError } = useHistoricalData();
  const { forecast: predictiveForecasts, loading: forecastLoading, error: forecastError } = usePredictiveAnalytics();
  const { status: feedbackLoopStatus, loading: feedbackLoading, error: feedbackError } = useFeedbackLoop();
  const { configs: integrationConfigs, loading: integrationLoading, error: integrationError, addConfig, updateConfig, deleteConfig } = useIntegrationConfigs();
  const { definitions: agentDefs, healthMetrics: agentHealth, loading: agentsLoading, error: agentsError, addAgent, updateAgent, deleteAgent } = useAgents();
  const { metrics: tokenRailMetrics, accounts: tokenAccounts, loading: tokenRailsLoading, error: tokenRailsError } = useTokenRails();
  const { engineStatus: paymentEngineStatus, requestMetrics: paymentRequestMetrics, loading: paymentsLoading, error: paymentsError, createPaymentRequest } = usePayments();
  const { serviceStatus: identityServiceStatus, authLogs: authLogs, loading: identityLoading, error: identityError, addAuthLogEntry } = useIdentity();


  // MOCK WEBSOCKET for real-time cognitive metrics
  useEffect(() => {
    const interval = setInterval(() => {
      const load = Math.random() * 0.4 + 0.5; // High load scenario
      const throttles: string[] = [];
      const currentTimestamp = new Date().toISOString();

      const currentFeatures = features; // Use the latest features from the hook
      const currentPolicies = policies; // Use the latest policies from the hook

      // Simulate throttling based on policies and current load
      const activePolicies = currentPolicies.filter(p => p.isActive);
      activePolicies.forEach(policy => {
        const featureNames = policy.targetFeatureIds.map(fid => currentFeatures.find(f => f.id === fid)?.name || fid);
        if (load > (policy.thresholdConfig.staticLoadThreshold || 0.75)) {
          featureNames.forEach(fn => {
            if (!throttles.includes(fn)) {
              throttles.push(fn);
              throttleFeature(currentFeatures.find(f => f.name === fn)?.id || fn, `Policy '${policy.name}'`, policy.userSegments);
            }
          });
        } else if (throttles.some(t => featureNames.includes(t))) {
          featureNames.forEach(fn => {
            if (throttles.includes(fn) && load < (policy.thresholdConfig.staticLoadThreshold || 0.75) - 0.1) {
              easeFeatureThrottle(currentFeatures.find(f => f.name === fn)?.id || fn, `Load dropped below policy '${policy.name}' threshold.`);
            }
          });
        }
      });

      const newMetric: CognitiveMetric = {
        timestamp: currentTimestamp,
        avgCognitiveLoad: load,
        activeThrottles: [...new Set(throttles)], // Unique throttled features
      };
      setMetrics(prev => [newMetric, ...prev.slice(0, 9)]);
    }, 2000);
    return () => clearInterval(interval);
  }, [features, policies]); // Depend on features and policies to react to changes


  // Handlers for UI actions
  const handleEditFeature = (feature: FeatureDefinition) => {
    setEditingFeature(feature);
    setShowFeatureEditor(true);
  };

  const handleSaveFeature = async (feature: FeatureDefinition) => {
    if (feature.id && features.some(f => f.id === feature.id)) {
      await updateFeature(feature);
    } else {
      await addFeature(feature);
    }
    setShowFeatureEditor(false);
    setEditingFeature(undefined);
  };

  const handleEditPolicy = (policy: ThrottlingPolicy) => {
    setEditingPolicy(policy);
    setShowPolicyEditor(true);
  };

  const handleSavePolicy = async (policy: ThrottlingPolicy) => {
    if (policy.id && policies.some(p => p.id === policy.id)) {
      await updatePolicy(policy);
    } else {
      await addPolicy(policy);
    }
    setShowPolicyEditor(false);
    setEditingPolicy(undefined);
  };

  const handleEditAgent = (agent: AgentDefinition) => {
    setEditingAgent(agent);
    setShowAgentEditor(true);
  };

  const handleSaveAgent = async (agent: AgentDefinition) => {
    if (agent.id && agentDefs.some(a => a.id === agent.id)) {
      await updateAgent(agent);
    } else {
      await addAgent(agent);
    }
    setShowAgentEditor(false);
    setEditingAgent(undefined);
  };

  const handleAcknowledgeAlert = (alert: AlertInstance) => {
    const updatedAlert = { ...alert, status: 'acknowledged', notes: [...alert.notes, `Acknowledged by UI at ${new Date().toISOString()}`] };
    updateAlertInstance(updatedAlert);
  };

  const handleResolveAlert = (alert: AlertInstance) => {
    const updatedAlert = { ...alert, status: 'resolved', resolvedTimestamp: new Date().toISOString(), notes: [...alert.notes, `Resolved by UI at ${new Date().toISOString()}`] };
    updateAlertInstance(updatedAlert);
  };

  const handleEditAlertDefinition = (def: AlertDefinition) => {
    setEditingAlertDefinition(def);
    setShowAlertDefinitionEditor(true);
  };

  const handleSaveAlertDefinition = async (def: AlertDefinition) => {
    if (def.id && alertDefs.some(d => d.id === def.id)) {
      await updateAlertDefinition(def);
    } else {
      await createAlertDefinition(def);
    }
    setShowAlertDefinitionEditor(false);
    setEditingAlertDefinition(undefined);
  };

  const handleEditEscalationPolicy = (policy: EscalationPolicy) => {
    setEditingEscalationPolicy(policy);
    setShowEscalationPolicyEditor(true);
  };

  const handleSaveEscalationPolicy = async (policy: EscalationPolicy) => {
    if (policy.id && escalationPolicies.some(p => p.id === policy.id)) {
      await updateEscalationPolicy(policy);
    } else {
      await addEscalationPolicy(policy);
    }
    setShowEscalationPolicyEditor(false);
    setEditingEscalationPolicy(undefined);
  };

  const handleEditIntegration = (config: IntegrationConfig) => {
    setEditingIntegration(config);
    setShowIntegrationEditor(true);
  };

  const handleSaveIntegration = async (config: IntegrationConfig) => {
    if (config.id && integrationConfigs.some(c => c.id === config.id)) {
      await updateConfig(config);
    } else {
      await addConfig(config);
    }
    setShowIntegrationEditor(false);
    setEditingIntegration(undefined);
  };

  const handleTriggerTestPayment = async () => {
    try {
      const newPayment = await createPaymentRequest({
        source: `user_${Math.floor(Math.random() * 50) + 1}`,
        destination: `merchant_${Math.floor(Math.random() * 10) + 1}`,
        amount: Math.random() * 5000 + 100,
        currency: 'USD',
        chosenRail: Math.random() > 0.5 ? TokenRailType.Fast : TokenRailType.Batch,
      });
      addAuthLogEntry({
        eventType: AuthEventType.TransactionProcessing,
        entityId: newPayment.source,
        ipAddress: 'simulated-ip',
        outcome: 'info',
        message: `Simulated payment request initiated: ${newPayment.requestId}`,
        context: { amount: newPayment.amount, currency: newPayment.currency, rail: newPayment.chosenRail }
      });
      alert(`Simulated payment request ${newPayment.requestId} sent! Status: ${newPayment.status}`);
    } catch (err: any) {
      alert(`Failed to send simulated payment: ${err.message}`);
    }
  };


  // Derived state for dashboard
  const currentAvgLoad = metrics.length > 0 ? metrics[0].avgCognitiveLoad : 0;
  const currentThrottledFeatures = metrics.length > 0 ? metrics[0].activeThrottles : [];

  const historicalLoadDataForChart: DataPoint[] = historicalCognitiveData.slice(-15).map(data => ({
    name: new Date(data.timestamp).toLocaleDateString(),
    'Avg. Load': data.avgLoad,
    'Max Load': data.maxLoad,
  }));

  const systemCpuDataForChart: DataPoint[] = systemHealthHistory.slice(-15).map(data => ({
    name: new Date(data.timestamp).toLocaleTimeString(),
    'CPU Usage': data.cpuUsage,
    'Memory Usage': data.memoryUsage,
  }));

  const forecastedLoadDataForChart: DataPoint[] = predictiveForecasts.map(f => ({
    name: new Date(f.timestamp).toLocaleTimeString(),
    'Forecasted Load': f.forecastedLoad,
    'Upper Bound': f.confidenceInterval[1],
    'Lower Bound': f.confidenceInterval[0],
  }));

  const featureContributionDataForChart: DataPoint[] = historicalCognitiveData.length > 0
    ? Object.entries(historicalCognitiveData[historicalCognitiveData.length - 1].featureContribution).map(([featureId, contribution]) => ({
      name: features.find(f => f.id === featureId)?.name || featureId,
      value: contribution,
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value)
    : [];

  const paymentTPSChartData: DataPoint[] = paymentRequestMetrics.slice(-20).map(m => ({
    name: new Date(m.timestamp).toLocaleTimeString(),
    'Amount': m.amount,
    'Processing Time': m.processingTime,
  }));

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">
        Cognitive & Operational Load Balancer Dashboard
      </h1>
      <p className="mb-8 text-gray-400 text-center text-lg">
        Unified real-time monitoring and adaptive management across user experience, agentic AI, token rails, digital identity, and real-time payments infrastructure.
      </p>

      {/* Overview Section */}
      <section className="mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="bg-gray-900/50 p-6 rounded-lg shadow-xl flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold mb-4 text-blue-300">Current Average Load</h2>
          <CognitiveLoadGauge load={currentAvgLoad} />
          <p className="mt-4 text-sm text-gray-400">Adaptive throttling in progress based on load.</p>
        </div>

        <div className="bg-gray-900/50 p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-blue-300">Active Throttles</h2>
          {currentThrottledFeatures.length > 0 ? (
            <ul className="list-disc list-inside text-lg text-orange-300 space-y-2">
              {currentThrottledFeatures.map((featureName, index) => (
                                <li key={index}>{features.find(f => f.id === featureName)?.name || featureName}</li>
              ))}
            </ul>
          ) : (
            <p className="text-lg text-green-300">No features currently throttled.</p>
          )}
        </div>

        <SystemHealthSummaryCard metrics={systemHealth} />
        <PaymentEngineOverviewCard status={paymentEngineStatus} />
      </section>

      {/* Feature Management */}
      <section className="mb-10 p-6 bg-gray-900/50 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-300">Feature Management</h2>
          <button
            onClick={() => { setEditingFeature(undefined); setShowFeatureEditor(true); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-md text-sm font-medium"
          >
            Add New Feature
          </button>
        </div>
        {featuresLoading ? (
          <p className="text-gray-400">Loading features...</p>
        ) : featuresError ? (
          <p className="text-red-400">Error: {featuresError}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(feature => (
              <FeatureStatusCard
                key={feature.id}
                feature={feature}
                isThrottled={currentThrottledFeatures.includes(feature.name)}
              />
            ))}
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => { setShowFeatureEditor(true); }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md shadow-md text-sm font-medium mr-2"
          >
            Manage Features
          </button>
        </div>
      </section>

      {/* Throttling Policy Management */}
      <section className="mb-10 p-6 bg-gray-900/50 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-300">Throttling Policy Management</h2>
          <button
            onClick={() => { setEditingPolicy(undefined); setShowPolicyEditor(true); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-md text-sm font-medium"
          >
            Add New Policy
          </button>
        </div>
        {policiesLoading ? (
          <p className="text-gray-400">Loading policies...</p>
        ) : policiesError ? (
          <p className="text-red-400">Error: {policiesError}</p>
        ) : (
          <ThrottlingPoliciesTable
            policies={policies}
            onEditPolicy={handleEditPolicy}
            onDeletePolicy={deletePolicy}
          />
        )}
      </section>

      {/* Alerts & Escalation Management */}
      <section className="mb-10 p-6 bg-gray-900/50 rounded-lg shadow-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-blue-300">Active & Recent Alerts</h2>
        </div>
        {alertsLoading ? (
          <p className="text-gray-400">Loading alerts...</p>
        ) : alertsError ? (
          <p className="text-red-400">Error: {alertsError}</p>
        ) : (
          <AlertsList
            alerts={alertInstances}
            definitions={alertDefs}
            onAcknowledge={handleAcknowledgeAlert}
            onResolve={handleResolveAlert}
          />
        )}

        <div className="flex justify-between items-center mt-8 mb-6">
          <h2 className="text-2xl font-bold text-blue-300">Alert Definitions</h2>
          <button
            onClick={() => { setEditingAlertDefinition(undefined); setShowAlertDefinitionEditor(true); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-md text-sm font-medium"
          >
            Add New Alert Definition
          </button>
        </div>
        {alertsLoading ? (
          <p className="text-gray-400">Loading alert definitions...</p>
        ) : alertsError ? (
          <p className="text-red-400">Error: {alertsError}</p>
        ) : (
          <AlertDefinitionsTable
            definitions={alertDefs}
            onEditDefinition={handleEditAlertDefinition}
            onDeleteDefinition={deleteAlertDefinition}
          />
        )}

        <div className="flex justify-between items-center mt-8 mb-6">
          <h2 className="text-2xl font-bold text-blue-300">Escalation Policies</h2>
          <button
            onClick={() => { setEditingEscalationPolicy(undefined); setShowEscalationPolicyEditor(true); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-md text-sm font-medium"
          >
            Add New Escalation Policy
          </button>
        </div>
        {escalationPoliciesLoading ? (
          <p className="text-gray-400">Loading escalation policies...</p>
        ) : escalationPoliciesError ? (
          <p className="text-red-400">Error: {escalationPoliciesError}</p>
        ) : (
          <EscalationPoliciesTable
            policies={escalationPolicies}
            onEditPolicy={handleEditEscalationPolicy}
            onDeletePolicy={deleteEscalationPolicy}
          />
        )}
      </section>

      {/* System Health & Performance */}
      <section className="mb-10 p-6 bg-gray-900/50 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-blue-300 mb-6">System Health & Performance</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MockLineChart
            data={historicalLoadDataForChart}
            dataKeys={['Avg. Load', 'Max Load']}
            title="Historical Cognitive Load"
            xAxisLabel="Date"
            yAxisLabel="Load %"
          />
          <MockLineChart
            data={systemCpuDataForChart}
            dataKeys={['CPU Usage', 'Memory Usage']}
            title="System Resource Utilization"
            xAxisLabel="Time"
            yAxisLabel="Usage %"
          />
          <MockBarChart
            data={featureContributionDataForChart}
            dataKey="value"
            title="Feature Load Contribution (Latest)"
            xAxisLabel="Feature"
            yAxisLabel="Contribution"
          />
          <UserSegmentDistribution historicalData={historicalCognitiveData} />
        </div>
      </section>

      {/* Predictive Analytics & Feedback Loop */}
      <section className="mb-10 p-6 bg-gray-900/50 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-blue-300 mb-6">Predictive Analytics & Adaptive Control</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PredictiveForecastCard forecast={predictiveForecasts.length > 0 ? predictiveForecasts[0] : null} />
          <MockLineChart
            data={forecastedLoadDataForChart}
            dataKeys={['Forecasted Load', 'Upper Bound', 'Lower Bound']}
            title="Cognitive Load Forecast"
            xAxisLabel="Time (Next 24h)"
            yAxisLabel="Load %"
          />
          <div className="lg:col-span-2">
            <FeedbackLoopStatusCard status={feedbackLoopStatus} />
          </div>
        </div>
      </section>

      {/* AI Agent Management */}
      <section className="mb-10 p-6 bg-gray-900/50 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-300">AI Agent Management</h2>
          <button
            onClick={() => { setEditingAgent(undefined); setShowAgentEditor(true); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-md text-sm font-medium"
          >
            Add New Agent
          </button>
        </div>
        {agentsLoading ? (
          <p className="text-gray-400">Loading AI agents...</p>
        ) : agentsError ? (
          <p className="text-red-400">Error: {agentsError}</p>
        ) : (
          <AgentStatusTable
            agents={agentDefs}
            healthMetrics={agentHealth}
            onEditAgent={handleEditAgent}
            onDeleteAgent={deleteAgent}
          />
        )}
      </section>

      {/* Token Rails & Real-time Payments Infrastructure */}
      <section className="mb-10 p-6 bg-gray-900/50 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-blue-300 mb-6">Token Rails & Real-time Payments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {tokenRailsLoading ? (
            <p className="text-gray-400">Loading token rail metrics...</p>
          ) : tokenRailsError ? (
            <p className="text-red-400">Error: {tokenRailsError}</p>
          ) : (
            tokenRailMetrics.map(metric => (
              <TokenRailStatusCard key={metric.railId} metric={metric} />
            ))
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-300 mb-4">Recent Payment Requests</h3>
        {paymentsLoading ? (
          <p className="text-gray-400">Loading payment requests...</p>
        ) : paymentsError ? (
          <p className="text-red-400">Error: {paymentsError}</p>
        ) : (
          <PaymentRequestsTable requests={paymentRequestMetrics} />
        )}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleTriggerTestPayment}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow-md text-sm font-medium"
          >
            Simulate New Payment
          </button>
        </div>
        <h3 className="text-xl font-bold text-gray-300 mb-4 mt-8">Token Account Snapshots</h3>
        {tokenRailsLoading ? (
          <p className="text-gray-400">Loading token accounts...</p>
        ) : tokenRailsError ? (
          <p className="text-red-400">Error: {tokenRailsError}</p>
        ) : (
          <TokenAccountsTable accounts={tokenAccounts} />
        )}
      </section>

      {/* Digital Identity & Security Services */}
      <section className="mb-10 p-6 bg-gray-900/50 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-blue-300 mb-6">Digital Identity & Security Services</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Identity Service Status</h3>
            {identityLoading ? (
              <p className="text-gray-400">Loading identity status...</p>
            ) : identityError ? (
              <p className="text-red-400">Error: {identityError}</p>
            ) : identityServiceStatus ? (
              <>
                <p className="text-gray-400">Overall Status: <span className={`font-semibold ${identityServiceStatus.overallStatus === 'operational' ? 'text-green-400' : 'text-red-400'}`}>{identityServiceStatus.overallStatus.replace(/_/g, ' ').toUpperCase()}</span></p>
                <p className="text-gray-400">Auth Requests/Sec: <span className="text-white font-semibold">{identityServiceStatus.authRequestsPerSecond}</span></p>
                <p className="text-gray-400">Avg Auth Latency: <span className="text-white font-semibold">{identityServiceStatus.avgAuthLatency.toFixed(1)}ms</span></p>
                <p className="text-gray-400">Failed Auth Rate: <span className="text-red-400 font-semibold">{(identityServiceStatus.failedAuthRate * 100).toFixed(2)}%</span></p>
                <p className="text-gray-400">Active Sessions: <span className="text-white font-semibold">{identityServiceStatus.activeSessions}</span></p>
                <p className="text-gray-400">Key Management: <span className={`font-semibold ${identityServiceStatus.keyManagementStatus === 'healthy' ? 'text-green-400' : 'text-red-400'}`}>{identityServiceStatus.keyManagementStatus}</span></p>
                <p className="text-xs text-gray-500 mt-4 text-right">Last updated: {new Date(identityServiceStatus.timestamp).toLocaleTimeString()}</p>
              </>
            ) : <p className="text-gray-400">No identity service status available.</p>}
          </div>
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Audit & Authentication Logs</h3>
            {identityLoading ? (
              <p className="text-gray-400">Loading auth logs...</p>
            ) : identityError ? (
              <p className="text-red-400">Error: {identityError}</p>
            ) : (
              <AuthLogViewer logs={authLogs} />
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => addAuthLogEntry({ eventType: AuthEventType.LoginSuccess, entityId: `user_${Math.floor(Math.random() * 50) + 1}`, outcome: 'success', message: 'Simulated successful login' })}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-md text-sm font-medium mr-2"
              >
                Simulate Login Success
              </button>
              <button
                onClick={() => addAuthLogEntry({ eventType: AuthEventType.LoginFailure, entityId: `user_${Math.floor(Math.random() * 50) + 1}`, outcome: 'failure', message: 'Simulated failed login attempt', context: { reason: 'bad_password' } })}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-md text-sm font-medium"
              >
                Simulate Login Failure
              </button>
            </div>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-300 mb-4 mt-8">User Profiles & Digital Identity Keys</h3>
        {usersLoading ? (
          <p className="text-gray-400">Loading user profiles...</p>
        ) : usersError ? (
          <p className="text-red-400">Error: {usersError}</p>
        ) : (
          <UserProfileTable users={users} onGenerateKeyPair={generateUserKeyPair} />
        )}
      </section>

      {/* Integration Configuration */}
      <section className="mb-10 p-6 bg-gray-900/50 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-300">Integration Configuration</h2>
          <button
            onClick={() => { setEditingIntegration(undefined); setShowIntegrationEditor(true); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-md text-sm font-medium"
          >
            Add New Integration
          </button>
        </div>
        {integrationLoading ? (
          <p className="text-gray-400">Loading integrations...</p>
        ) : integrationError ? (
          <p className="text-red-400">Error: {integrationError}</p>
        ) : (
          <IntegrationConfigTable
            configs={integrationConfigs}
            onEditConfig={handleEditIntegration}
            onDeleteConfig={deleteConfig}
          />
        )}
      </section>


      {/* Modals for editing */}
      {showFeatureEditor && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <FeatureEditorForm
            feature={editingFeature}
            onSave={handleSaveFeature}
            onCancel={() => { setShowFeatureEditor(false); setEditingFeature(undefined); }}
          />
        </div>
      )}
      {showPolicyEditor && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <PolicyEditorForm
            policy={editingPolicy}
            allFeatures={features}
            onSave={handleSavePolicy}
            onCancel={() => { setShowPolicyEditor(false); setEditingPolicy(undefined); }}
          />
        </div>
      )}
      {showAgentEditor && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <AgentEditorForm
            agent={editingAgent}
            onSave={handleSaveAgent}
            onCancel={() => { setShowAgentEditor(false); setEditingAgent(undefined); }}
          />
        </div>
      )}
      {showAlertDefinitionEditor && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <AlertDefinitionEditorForm
            definition={editingAlertDefinition}
            allFeatures={features}
            onSave={handleSaveAlertDefinition}
            onCancel={() => { setShowAlertDefinitionEditor(false); setEditingAlertDefinition(undefined); }}
          />
        </div>
      )}
      {showEscalationPolicyEditor && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <EscalationPolicyEditorForm
            policy={editingEscalationPolicy}
            onSave={handleSaveEscalationPolicy}
            onCancel={() => { setShowEscalationPolicyEditor(false); setEditingEscalationPolicy(undefined); }}
          />
        </div>
      )}
      {showIntegrationEditor && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <IntegrationConfigEditorForm
            config={editingIntegration}
            onSave={handleSaveIntegration}
            onCancel={() => { setShowIntegrationEditor(false); setEditingIntegration(undefined); }}
          />
        </div>
      )}
    </div>
  );
};

export default CognitiveLoadBalancerView;