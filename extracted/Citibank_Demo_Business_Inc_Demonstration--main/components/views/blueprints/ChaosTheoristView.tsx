/**
 * This module defines the foundational architecture for the Chaos Theorist View,
 * a critical component within a commercial-grade financial infrastructure. It establishes
 * the core data models, intelligent automation interfaces, and real-time operational
 * constructs required for modeling complex financial and systemic environments, identifying
 * strategic leverage points, and executing automated interventions.
 *
 * Business Value: This file is the intellectual bedrock that transforms reactive
 * operations into a proactive, intelligent, and scalable management paradigm. By precisely
 * defining System Definitions, Leverage Points, Simulation Runs, Digital Identities,
 * Agentic Orchestration, and Programmable Token Rails, it empowers enterprises to
 * not only predict but actively influence high-stakes financial and operational outcomes.
 * This infrastructure delivers multi-million dollar value by:
 * 1.  **Risk Mitigation & Predictive Governance:** Autonomously identifying, forecasting,
 *     and mitigating systemic risks, ensuring compliance, and maintaining operational integrity
 *     in volatile markets.
 * 2.  **Strategic Optimization & Programmable Value:** Optimizing resource allocation,
 *     intervention strategies, and real-time settlement processes for maximum ROI,
 *     unlocking new revenue streams through intelligent, programmable value rails.
 * 3.  **Enhanced Operational Intelligence:** Providing a unified framework for intelligent
 *     agents to observe, decide, and act across the entire financial ecosystem, reducing
 *     manual overhead and increasing decision velocity.
 * 4.  **Absolute Security & Auditability:** Establishing cryptographic integrity for
 *     digital identities, transactions, and audit trails, building an unassailable
 *     foundation of trust and transparency essential for global financial leadership.
 * This module is a blueprint for the next generation of financial control systems,
 * driving unprecedented foresight, efficiency, and resilience.
 */

import React, { useState, useEffect, useCallback, useReducer, createContext, useContext } from 'react';

// --- Global Type Definitions and Interfaces (START) ---

/**
 * Represents a unique string identifier for a chaotic system.
 */
export type SystemIdentifier = string;
/**
 * Represents a unique string identifier for a user.
 */
export type UserIdentifier = string;
/**
 * Represents an ISO 8601 formatted string for date and time.
 */
export type Timestamp = string;
/**
 * Represents a unique identifier for a simulation scenario.
 */
export type ScenarioIdentifier = string;
/**
 * Represents a unique identifier for a specific simulation execution.
 */
export type SimulationRunIdentifier = string;
/**
 * Represents a string indicating the version of a mathematical model used.
 */
export type ModelVersion = string;
/**
 * Represents a unique identifier for an AI agent.
 */
export type AgentIdentifier = string;
/**
 * Represents a unique identifier for a financial transaction.
 */
export type TransactionIdentifier = string;
/**
 * Represents a unique identifier for a type of token.
 */
export type TokenIdentifier = string;
/**
 * Represents a unique identifier for an account on the token rail.
 */
export type AccountIdentifier = string;
/**
 * Represents a unique identifier for a digital identity.
 */
export type DigitalIdentityIdentifier = string;
/**
 * Represents a cryptographic public key string.
 */
export type PublicKey = string;
/**
 * Represents a cryptographic private key string (mocked for simulation).
 */
export type PrivateKey = string;

/**
 * Defines a single point of leverage within a chaotic system, representing an actionable
 * intervention opportunity. This comprehensive structure facilitates precise evaluation
 * of potential impacts, costs, risks, and strategic alignment, crucial for informed
 * decision-making in high-stakes environments.
 *
 * Business Value: This interface directly supports intelligent automation by providing
 * a standardized schema for AI agents to propose and evaluate strategic interventions.
 * It enables rapid assessment of complex scenarios, optimizing resource allocation
 * and accelerating response times to emergent risks or opportunities, thereby
 * safeguarding and growing enterprise value.
 */
export interface LeveragePoint {
  /** A unique identifier for this leverage point. */
  id: string;
  /** A clear, actionable description of the intervention. */
  action: string;
  /** Estimated monetary cost of implementing the action. */
  cost: string;
  /** The probability (0-1) of achieving the desired outcome. */
  outcomeProbability: number;
  /** The estimated time frame from implementation to observable impact. */
  timeToImpact: string;
  /** A more detailed qualitative description of the action and its mechanism. */
  description: string;
  /** Potential positive secondary effects beyond the primary goal. */
  positiveSideEffects: string[];
  /** Potential negative unintended consequences. */
  negativeSideEffects: string[];
  /** The estimated magnitude of the desired impact (e.g., "5% increase"). */
  impactMagnitude: string;
  /** A confidence score (0-1) in the accuracy of the prediction for this leverage point. */
  predictionConfidence: number;
  /** The estimated effort required to implement the action (e.g., "Low", "Medium", "High", "Very High"). */
  implementationEffort: 'Low' | 'Medium' | 'High' | 'Very High';
  /** Indicates if the action is easily reversible if unintended consequences occur. */
  reversibility: 'High' | 'Medium' | 'Low' | 'Irreversible';
  /** Associated risks, categorized (e.g., financial, ecological, social). */
  risks: { category: string; severity: 'Low' | 'Medium' | 'High'; description: string }[];
  /** A list of necessary resources for implementation. */
  requiredResources: string[];
  /** Key stakeholders who would be affected or need to be involved. */
  stakeholders: { name: string; role: string; influence: 'Low' | 'Medium' | 'High' }[];
  /** Historical success rate of similar interventions, if available. */
  historicalSuccessRate?: number;
  /** Last updated timestamp for this leverage point analysis. */
  lastUpdated: Timestamp;
  /** The AI agent responsible for identifying or proposing this leverage point. */
  proposedByAgentId?: AgentIdentifier;
  /** Link to a specific skill or capability of an agent needed to execute this leverage point. */
  requiredSkill?: string;
  /** Estimated impact on key performance indicators (KPIs), e.g., 'ROI: 15%'. */
  estimatedKpiImpact?: string[];
  /** Required policy or governance check to approve this leverage point. */
  requiredPolicy?: string;
}

/**
 * Defines a parameter within a chaotic system, including its properties and ranges.
 * These parameters are the manipulable variables that define the system's state
 * and respond to interventions.
 *
 * Business Value: Parameter definitions are fundamental for constructing robust
 * simulation models and enabling granular control by AI agents. By structuring
 * system variables with validation and security levels, this interface ensures
 * that simulations are accurate and real-world interventions are governed by
 * policy, minimizing risks and maximizing the predictability of financial outcomes.
 */
export interface SystemParameter {
  /** Unique identifier for the parameter. */
  id: string;
  /** Display name of the parameter. */
  name: string;
  /** A brief description of what the parameter represents. */
  description: string;
  /** The current value of the parameter. */
  currentValue: number | string | boolean;
  /** The unit of measurement for the parameter (e.g., "Celsius", "ppm", "%). */
  unit: string;
  /** The minimum plausible value for the parameter. */
  minValue: number;
  /** The maximum plausible value for the parameter. */
  maxValue: number;
  /** Step size for UI controls or simulation increments. */
  step: number;
  /** Indicates if this parameter is a potential leverage point. */
  isLeverageCandidate: boolean;
  /** Data type of the parameter (e.g., 'number', 'boolean', 'enum'). */
  dataType: 'number' | 'boolean' | 'string' | 'enum';
  /** If dataType is 'enum', possible string values. */
  enumValues?: string[];
  /** A list of parameter dependencies. */
  dependencies?: { parameterId: string; type: 'influences' | 'is-influenced-by' }[];
  /** Security level required to modify this parameter (e.g., 'low', 'medium', 'high'). */
  securityLevel: 'low' | 'medium' | 'high';
  /** Reference to the policy governing changes to this parameter. */
  governancePolicyId?: string;
}

/**
 * Represents an observable metric or output from the chaotic system.
 * Metrics provide the empirical data points against which simulations are validated
 * and real-world performance is measured.
 *
 * Business Value: System metrics are vital for real-time observability and anomaly
 * detection, enabling the platform to monitor critical financial indicators and
 * operational health. Structured with historical data, targets, and alert thresholds,
 * this interface empowers AI agents to autonomously identify deviations, trigger
 * alerts, and initiate remediation, directly contributing to system stability and
 * proactive risk management.
 */
export interface SystemMetric {
  /** Unique identifier for the metric. */
  id: string;
  /** Display name of the metric. */
  name: string;
  /** A brief description of the metric. */
  description: string;
  /** The current observed value of the metric. */
  currentValue: number | string | boolean;
  /** The unit of measurement for the metric. */
  unit: string;
  /** The desired target range or value for this metric. */
  target?: { min?: number; max?: number; value?: number; unit: string };
  /** A history of values for this metric over time. */
  history: { timestamp: Timestamp; value: number | string | boolean }[];
  /** Thresholds for alerts (e.g., warning, critical). */
  alertThresholds?: {
    warning?: { operator: '>' | '<' | '=' | '!='; value: number | string };
    critical?: { operator: '>' | '<' | '=' | '!='; value: number | string };
  };
  /** Indicates if this metric is derived or directly observed. */
  isDerived: boolean;
  /** Formula or method for derivation if `isDerived` is true. */
  derivationMethod?: string;
  /** Associated data quality score (0-1). */
  dataQualityScore: number;
  /** The frequency at which this metric is updated/observed. */
  observationFrequency: string;
}

/**
 * Defines a specific feedback loop within the chaotic system. Feedback loops
 * illustrate the interdependencies and dynamic behavior that characterize
 * complex systems.
 *
 * Business Value: Understanding and mapping feedback loops is critical for
 * robust system design and effective intervention. This interface allows for
 * explicit modeling of amplifying and dampening effects, providing AI agents
 * with the necessary context to predict emergent behaviors and design
 * interventions that precisely target desired systemic shifts, ultimately
 * leading to more stable and predictable financial outcomes.
 */
export interface FeedbackLoop {
  /** Unique identifier for the feedback loop. */
  id: string;
  /** Name of the feedback loop. */
  name: string;
  /** A description of the loop's mechanism. */
  description: string;
  /** Type of feedback: 'positive' (amplifying) or 'negative' (dampening). */
  type: 'positive' | 'negative';
  /** Source parameter/metric influencing the loop. */
  sourceId: string;
  /** Target parameter/metric influenced by the loop. */
  targetId: string;
  /** Strength of the feedback loop (e.g., a multiplier or impact factor). */
  strength: number;
  /** Delay in impact propagation for this loop (e.g., "1 week", "3 months"). */
  delay: string;
  /** Confidence score in the existence and strength of this feedback loop. */
  confidence: number;
  /** Is this loop dynamically changing? */
  isDynamic: boolean;
}

/**
 * Represents a complete definition of a chaotic system, encapsulating its
 * parameters, metrics, and feedback loops. This robust model serves as the
 * digital twin for high-value financial or operational ecosystems.
 *
 * Business Value: This core interface provides the blueprint for creating
 * and managing digital twins of complex financial realities. By consolidating
 * all system aspects into a single, versioned, and auditable definition,
 * it enables advanced simulation, scenario planning, and agentic control,
 * offering unparalleled foresight and command over the emergent behavior
 * of interconnected digital finance rails. This directly supports strategic
 * decision-making and ensures system resilience.
 */
export interface ChaoticSystemDefinition {
  /** Unique identifier for this system definition. */
  id: SystemIdentifier;
  /** User-defined name for the system (e.g., "Central Valley Rainfall System"). */
  name: string;
  /** A detailed description of the system and its boundaries. */
  description: string;
  /** Date and time when the system definition was created. */
  createdAt: Timestamp;
  /** Date and time when the system definition was last modified. */
  lastModified: Timestamp;
  /** Identifier of the user who owns/created this system definition. */
  ownerId: UserIdentifier;
  /** A list of parameters that define the state and behavior of the system. */
  parameters: SystemParameter[];
  /** A list of observable metrics derived from the system. */
  metrics: SystemMetric[];
  /** A list of identified feedback loops within the system. */
  feedbackLoops: FeedbackLoop[];
  /** Current status of the system (e.g., 'Active', 'Archived', 'Draft'). */
  status: 'Active' | 'Archived' | 'Draft' | 'Under Review' | 'Retired';
  /** Versioning of the system definition schema. */
  schemaVersion: string;
  /** Tags for categorization or search. */
  tags: string[];
  /** Geographical or contextual scope of the system. */
  scope: string;
  /** External data sources used for this system (e.g., weather APIs, economic indicators). */
  externalDataSources: { name: string; url: string; lastSync: Timestamp; status: 'active' | 'inactive' | 'error' }[];
  /** Access control settings for this system. */
  accessControl: {
    public: boolean;
    sharedWithUsers: UserIdentifier[];
    sharedWithGroups: string[];
    rbacPolicyId?: string; // Reference to a global RBAC policy
  };
  /** Reference to the mathematical model used for simulation. */
  simulationModelRef: string;
  /** Model version used. */
  modelVersion: ModelVersion;
  /** An array of agent IDs currently monitoring or managing this system. */
  monitoringAgents: AgentIdentifier[];
  /** Configuration for real-time monitoring of this system. */
  monitoringConfig: {
    intervalSeconds: number;
    alertOnAnomaly: boolean;
    anomalyDetectionModel: string;
  };
  /** Security classification for the data within this system (e.g., 'public', 'confidential', 'restricted'). */
  securityClassification: 'public' | 'confidential' | 'restricted';
  /** Compliance standards relevant to this system (e.g., 'GDPR', 'PCI-DSS', 'SOC2'). */
  complianceStandards: string[];
  /** A unique hash representing the current state of the system definition for integrity checks. */
  contentHash: string;
}

/**
 * Represents a single simulation run of a chaotic system. This captures the
 * initial conditions, applied interventions, and the resulting time-series
 * data, providing critical insights into system behavior under various scenarios.
 *
 * Business Value: Simulation runs are pivotal for de-risking strategic decisions
 * and optimizing interventions. By enabling "what-if" analysis with traceable
 * inputs and outputs, this interface directly supports predictive analytics
 * and allows for rigorous testing of agentic strategies before real-world deployment.
 * This capability translates into millions in avoided losses and optimized gains
 * for enterprises navigating complex financial landscapes.
 */
export interface SimulationRun {
  /** Unique identifier for this simulation run. */
  id: SimulationRunIdentifier;
  /** Identifier of the chaotic system definition used for this run. */
  systemId: SystemIdentifier;
  /** Identifier of the user or agent who initiated the simulation. */
  initiatedBy: UserIdentifier | AgentIdentifier;
  /** Identifier of the scenario this simulation run belongs to. */
  scenarioId?: ScenarioIdentifier;
  /** The timestamp when the simulation started. */
  startTime: Timestamp;
  /** The timestamp when the simulation ended. */
  endTime?: Timestamp;
  /** The duration of the simulation in milliseconds. */
  durationMs?: number;
  /** Current status of the simulation (e.g., 'Pending', 'Running', 'Completed', 'Failed', 'Cancelled'). */
  status: 'Pending' | 'Running' | 'Completed' | 'Failed' | 'Cancelled';
  /** The initial state of all system parameters at the start of the simulation. */
  initialState: { parameterId: string; value: number | string | boolean }[];
  /** A list of leverage points applied during this simulation run. */
  appliedLeveragePoints: {
    leveragePointId: string;
    applicationTime: Timestamp;
    agentId?: AgentIdentifier;
    status: 'planned' | 'executed' | 'failed';
  }[];
  /** Key outcomes or summary results of the simulation. */
  results: {
    overallImpact: string;
    riskAssessment: { category: string; severity: 'Low' | 'Medium' | 'High'; description: string }[];
    achievedGoals: string[];
    unintendedConsequences: string[];
  };
  /** Time-series data for selected metrics during the simulation. */
  metricsHistory: { metricId: string; data: { timestamp: Timestamp; value: number | string | boolean }[] }[];
  /** Time-series data for selected parameters during the simulation. */
  parametersHistory: { parameterId: string; data: { timestamp: Timestamp; value: number | string | boolean }[] }[];
  /** A log of significant events that occurred during the simulation (e.g., alert triggers, state changes). */
  events: { timestamp: Timestamp; type: string; description: string; data?: any }[];
  /** The version of the underlying mathematical model used for this specific run. */
  modelVersion: ModelVersion;
  /** Details about computational resources consumed by the simulation. */
  computeResourcesUsed?: {
    cpuTimeSeconds?: number;
    memoryGB?: number;
    gpuTimeSeconds?: number;
    cloudProvider?: string;
    instanceType?: string;
  };
  /** Estimated or actual cost of running the simulation. */
  cost?: { amount: number; currency: string };
  /** A cryptographic hash or link to an immutable audit trail for this simulation run. */
  auditTrailHash?: string;
  /** Additional notes or observations about the simulation run. */
  notes?: string;
  /** Tags for categorization and search. */
  tags: string[];
  /** Link to detailed output logs for the simulation. */
  outputLogUrl?: string;
}

/**
 * Represents a digital identity within the financial ecosystem, underpinning
 * secure and auditable interactions. This identity can belong to a human user,
 * an AI agent, or a smart contract.
 *
 * Business Value: Digital identities are the foundation of trust and compliance.
 * By securely linking cryptographic keys, roles, and organizational affiliations,
 * this interface ensures that all actions within the system are attributable,
 * authenticated, and authorized, preventing fraud and enabling robust regulatory
 * oversight. It is critical for maintaining absolute security and transparency
 * in high-value financial operations.
 */
export interface DigitalIdentity {
  /** Unique identifier for the digital identity. */
  id: DigitalIdentityIdentifier;
  /** Display name for the identity (e.g., "John Doe", "QuantBot-v3", "AssetTokenizer-Contract"). */
  name: string;
  /** Type of entity represented: 'user', 'agent', 'contract', 'organization'. */
  type: 'user' | 'agent' | 'contract' | 'organization';
  /** The public key associated with this identity for cryptographic verification. */
  publicKey: PublicKey;
  /** Optional: associated private key (for simulation/testing, never store in production). */
  privateKeyMock?: PrivateKey;
  /** Status of the identity (e.g., 'active', 'suspended', 'revoked'). */
  status: 'active' | 'suspended' | 'revoked';
  /** Roles assigned to this identity, dictating permissions (e.g., "Admin", "Trader", "Auditor", "Strategist"). */
  roles: string[];
  /** Organization or department this identity belongs to. */
  organizationId?: string;
  /** Timestamp of identity creation. */
  createdAt: Timestamp;
  /** Timestamp of last update to identity details. */
  lastUpdated: Timestamp;
  /** Verifiable credentials associated with this identity (e.g., KYC/AML compliance, certifications). */
  verifiableCredentials: { type: string; issuer: string; issuanceDate: Timestamp; expirationDate?: Timestamp; hash: string }[];
  /** Contact information (e.g., email, secure messaging endpoint). */
  contactInfo?: { email?: string; secureEndpoint?: string };
  /** Optional: Link to agent profile if `type` is 'agent'. */
  agentProfileId?: AgentIdentifier;
}

/**
 * Defines a specific skill or capability possessed by an AI agent.
 *
 * Business Value: Granular skill definitions enable precise agent orchestration
 * and delegation. By clearly outlining an agent's capabilities, this interface
 * facilitates automated task assignment, validates agent readiness for specific
 * interventions, and supports the development of highly specialized, autonomous
 * financial agents, thereby increasing operational efficiency and reducing human error.
 */
export interface AgentSkill {
  /** Unique identifier for the skill. */
  id: string;
  /** Name of the skill (e.g., "MarketSentimentAnalysis", "RiskArbitrage", "SmartContractDeployment"). */
  name: string;
  /** A detailed description of what the skill entails and its domain. */
  description: string;
  /** The expertise level required/demonstrated for this skill (e.g., 'beginner', 'intermediate', 'advanced', 'expert'). */
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  /** Specific tools or APIs this skill requires/integrates with. */
  requiredTools: string[];
  /** Formal verification status (e.g., 'verified', 'pending', 'unverified'). */
  verificationStatus: 'verified' | 'pending' | 'unverified';
  /** Last time the skill was evaluated or updated. */
  lastEvaluated: Timestamp;
}

/**
 * Represents the profile of an autonomous AI agent within the Chaos Theorist View.
 *
 * Business Value: Agent profiles are central to the operational intelligence layer.
 * They define the autonomous entities that interact with the financial ecosystem,
 * enabling dynamic allocation of resources, intelligent decision-making, and
 * real-time execution of strategies. By detailing an agent's goals, skills,
 * and operational parameters, this interface ensures controlled, auditable,
 * and highly effective autonomous interventions, directly driving strategic
 * objectives and maximizing return on automation.
 */
export interface AgentProfile {
  /** Unique identifier for the AI agent. */
  id: AgentIdentifier;
  /** Display name of the agent. */
  name: string;
  /** A detailed description of the agent's purpose and functionality. */
  description: string;
  /** The digital identity associated with this agent for authentication and authorization. */
  digitalIdentityId: DigitalIdentityIdentifier;
  /** Status of the agent (e.g., 'active', 'paused', 'offline', 'learning'). */
  status: 'active' | 'paused' | 'offline' | 'learning';
  /** Date and time when the agent was deployed. */
  deployedAt: Timestamp;
  /** Last active timestamp. */
  lastActive: Timestamp;
  /** The primary objective or goal of the agent. */
  primaryObjective: string;
  /** A list of skills the agent possesses. */
  skills: AgentSkill[];
  /** Configuration parameters specific to the agent's operation (e.g., risk tolerance, budget limits). */
  configuration: {
    riskTolerance: 'low' | 'medium' | 'high';
    maxBudget?: { amount: number; currency: string };
    operationalHours?: string; // e.g., "24/7", "Mon-Fri 9-5"
    accessScope: SystemIdentifier[]; // Systems the agent is authorized to interact with
  };
  /** Performance metrics for the agent (e.g., success rate, efficiency). */
  performanceMetrics: {
    successRate: number;
    averageExecutionTimeMs: number;
    errorRate: number;
    lastReported: Timestamp;
  };
  /** Reference to the underlying AI model or algorithms powering the agent. */
  aiModelRef: string;
  /** Version of the AI model. */
  modelSoftwareVersion: string;
  /** Audit trail of agent's decisions and actions. */
  auditLog: { timestamp: Timestamp; action: string; context: any }[];
  /** List of users or agents authorized to manage this agent. */
  managers: UserIdentifier[];
  /** Cost associated with running this agent. */
  operationalCost?: { amount: number; currency: string; frequency: 'hourly' | 'daily' | 'monthly' };
  /** Tags for categorization or search. */
  tags: string[];
}

/**
 * Defines a programmable token used on a token rail, including its properties
 * and behavior. This underpins the "Programmable Token Rails" concept.
 *
 * Business Value: Token definitions are fundamental to enabling next-generation
 * programmable finance. By explicitly defining assets, their rules, and
 * fungibility, this interface allows for the creation of sophisticated digital
 * financial instruments and automated value transfer mechanisms. This supports
 * innovation in financial product development, streamlines settlement, and
 * facilitates new business models built on secure, traceable, and programmable
 * digital assets, driving significant enterprise growth and efficiency.
 */
export interface TokenDefinition {
  /** Unique identifier for the token type. */
  id: TokenIdentifier;
  /** Display name of the token (e.g., "USD Stablecoin", "CarbonCreditToken"). */
  name: string;
  /** A brief description of the token and its purpose. */
  description: string;
  /** Symbol for the token (e.g., "USDC", "CCT"). */
  symbol: string;
  /** Type of token: 'fungible', 'non-fungible', 'hybrid'. */
  type: 'fungible' | 'non-fungible' | 'hybrid';
  /** The total supply of the token (if fungible) or maximum number of unique tokens (if non-fungible). */
  totalSupply?: number | 'unlimited';
  /** The number of decimal places for fungible tokens. */
  decimals?: number;
  /** The underlying asset or value backing this token (e.g., "USD", "Gold", "RealEstate"). */
  underlyingAsset: string;
  /** The blockchain or distributed ledger technology used for this token. */
  blockchainPlatform: string;
  /** Smart contract address for the token on the blockchain. */
  contractAddress: string;
  /** URL to the token's whitepaper or detailed specification. */
  whitepaperUrl?: string;
  /** Rules governing the token's transfer, minting, burning, and other operations. */
  programmableRules: string[]; // e.g., "transferable only to KYC'd accounts", "auto-burn on expiry"
  /** Compliance standards applicable to this token (e.g., AML, CFT). */
  complianceStandards: string[];
  /** Date of token creation/deployment. */
  createdAt: Timestamp;
  /** Status of the token (e.g., 'active', 'retired', 'pending'). */
  status: 'active' | 'retired' | 'pending';
  /** Audit trail or hash of the immutable token definition. */
  auditTrailHash: string;
  /** List of agents authorized to interact with this token contract (e.g., mint, burn, transfer). */
  authorizedAgents: AgentIdentifier[];
}

/**
 * Represents a transaction on a programmable token rail.
 *
 * Business Value: Token rail transactions are the immutable record of value
 * transfer and state change in a programmable financial system. This interface
 * ensures cryptographic integrity, traceability, and auditability for every
 * financial action, crucial for regulatory compliance and dispute resolution.
 * By standardizing transaction data, it facilitates real-time reconciliation,
 * automated settlement, and comprehensive financial reporting, thereby reducing
 * operational costs and enhancing trust in digital financial operations.
 */
export interface TokenRailTransaction {
  /** Unique identifier for the transaction. */
  id: TransactionIdentifier;
  /** Identifier of the token involved in the transaction. */
  tokenId: TokenIdentifier;
  /** Type of transaction (e.g., 'transfer', 'mint', 'burn', 'swap', 'stake'). */
  type: 'transfer' | 'mint' | 'burn' | 'swap' | 'stake' | 'loan' | 'collateralize';
  /** Timestamp of the transaction. */
  timestamp: Timestamp;
  /** Source digital identity/account for the transaction. */
  senderId: DigitalIdentityIdentifier | AccountIdentifier;
  /** Destination digital identity/account for the transaction. */
  receiverId: DigitalIdentityIdentifier | AccountIdentifier;
  /** The amount of token transferred or involved. */
  amount: number;
  /** The unit or symbol of the token. */
  tokenSymbol: string;
  /** Status of the transaction (e.g., 'pending', 'confirmed', 'failed', 'reverted'). */
  status: 'pending' | 'confirmed' | 'failed' | 'reverted';
  /** Hash of the transaction on the underlying blockchain/DLT. */
  transactionHash: string;
  /** Block number or height on the blockchain where the transaction was recorded. */
  blockNumber?: number;
  /** Fees associated with the transaction. */
  fees?: { amount: number; currency: string; type: string }[];
  /** Optional: Reference to a smart contract execution if applicable. */
  contractExecutionId?: string;
  /** Contextual data for the transaction (e.g., purpose, associated invoice ID). */
  context?: {
    purpose?: string;
    invoiceId?: string;
    relatedTransactionId?: TransactionIdentifier;
  };
  /** Digital signature from the sender for authentication. */
  senderSignature: string;
  /** Any verifiable proofs associated with the transaction (e.g., zero-knowledge proofs). */
  verifiableProofs?: { type: string; proofData: string }[];
  /** Reference to the policy that governed this transaction. */
  governancePolicyId?: string;
}

/**
 * Defines a scenario for a simulation, encompassing initial conditions and planned
 * sequences of leverage points. Scenarios allow for systematic testing of hypotheses
 * and strategic planning.
 *
 * Business Value: Scenarios are critical for strategic foresight and risk management.
 * By encapsulating specific "what-if" situations and intervention plans, this
 * interface allows enterprises to explore potential futures, anticipate market
 * shifts, and pre-emptively develop response strategies, thereby significantly
 * reducing decision-making uncertainty and enabling proactive governance. This
 * leads to more resilient business operations and competitive advantage.
 */
export interface SimulationScenario {
  /** Unique identifier for this scenario. */
  id: ScenarioIdentifier;
  /** Name of the scenario (e.g., "Market Downturn Response", "Supply Chain Disruption"). */
  name: string;
  /** A detailed description of the scenario, its assumptions, and objectives. */
  description: string;
  /** The system definition that this scenario applies to. */
  systemId: SystemIdentifier;
  /** User or agent who created the scenario. */
  createdBy: UserIdentifier | AgentIdentifier;
  /** Timestamp of scenario creation. */
  createdAt: Timestamp;
  /** Last modification timestamp. */
  lastModified: Timestamp;
  /** Initial conditions/parameter values for this scenario. */
  initialConditions: { parameterId: string; value: number | string | boolean }[];
  /** A sequence of leverage points planned to be applied during the simulation. */
  plannedInterventions: {
    leveragePointId: string;
    timing: 'at_start' | 'after_delay' | 'on_condition'; // 'at_start', 'after_delay', 'on_condition'
    delaySeconds?: number; // if 'after_delay'
    conditionExpression?: string; // if 'on_condition', e.g., "metric_X < 0.5"
    agentId?: AgentIdentifier; // Agent responsible for applying this intervention
  }[];
  /** Expected outcomes or goals of the scenario. */
  expectedOutcomes: string[];
  /** Key metrics to monitor during the scenario's simulation runs. */
  keyMetricsToMonitor: string[];
  /** Status of the scenario (e.g., 'draft', 'active', 'archived'). */
  status: 'draft' | 'active' | 'archived';
  /** Tags for categorization. */
  tags: string[];
  /** History of simulation runs executed under this scenario. */
  simulationRuns: SimulationRunIdentifier[];
  /** The version of the system definition schema used by this scenario. */
  systemSchemaVersion: string;
}

/**
 * Represents a scheduled task or automated workflow orchestrated by an agent.
 *
 * Business Value: Agentic orchestration transforms strategic insights into
 * automated actions. This interface provides a structured way to define,
 * schedule, and monitor complex multi-agent workflows, ensuring that
 * interventions are executed precisely and efficiently. It maximizes the
 * impact of AI, reduces operational friction, and enables the enterprise to
 * respond to dynamic financial conditions with unprecedented agility and scale.
 */
export interface AgentTask {
  /** Unique identifier for the task. */
  id: string;
  /** Name of the task (e.g., "Dynamic Hedging Operation", "Liquidity Rebalancing"). */
  name: string;
  /** A detailed description of the task's objectives and scope. */
  description: string;
  /** The agent responsible for executing this task. */
  executorAgentId: AgentIdentifier;
  /** Status of the task (e.g., 'pending', 'running', 'completed', 'failed', 'paused'). */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  /** The system or part of the system this task is designed to impact. */
  targetSystemId: SystemIdentifier;
  /** A list of leverage points or actions to be executed as part of this task. */
  actions: {
    leveragePointId?: string; // If targeting a predefined leverage point
    customAction?: string; // If a custom action not directly mapped to a leverage point
    parameters?: { [key: string]: any }; // Parameters for the custom action
    order: number; // Order of execution if multiple actions
    status: 'scheduled' | 'executing' | 'completed' | 'failed';
    executedAt?: Timestamp;
    result?: string;
  }[];
  /** Schedule for the task (e.g., 'once', 'recurring', 'on_event'). */
  schedule: {
    type: 'once' | 'recurring' | 'on_event';
    startTime?: Timestamp; // For 'once' or first run of 'recurring'
    cronExpression?: string; // For 'recurring' (e.g., "0 0 * * *")
    eventTrigger?: string; // For 'on_event' (e.g., "system_metric_X_breaches_threshold")
  };
  /** Timestamp when the task was created. */
  createdAt: Timestamp;
  /** Last updated timestamp for task status or definition. */
  lastUpdated: Timestamp;
  /** User or agent who initiated/defined the task. */
  initiatedBy: UserIdentifier | AgentIdentifier;
  /** Audit trail of task executions. */
  executionHistory: { timestamp: Timestamp; status: string; log: string }[];
  /** Associated risks with executing this task. */
  risks?: { category: string; severity: 'Low' | 'Medium' | 'High'; description: string }[];
  /** Required approvals or governance checks for task execution. */
  requiredApprovals?: { approverId: UserIdentifier; status: 'pending' | 'approved' | 'rejected' }[];
  /** Predicted impact of the task. */
  predictedImpact?: string;
  /** Actual impact observed after task execution. */
  actualImpact?: string;
}

// --- Global Type Definitions and Interfaces (END) ---

// --- Chaos Theorist View Components (START) ---

/**
 * Defines the props for the ChaosTheoristView component.
 * This component acts as the main container for all sub-components and orchestrates
 * the data flow and state management for the entire application.
 *
 * Business Value: The ChaosTheoristView props define the core parameters that
 * drive the entire intelligent financial control panel. By specifying access levels,
 * available systems, and user context, this interface ensures that the application
 * is initialized with the correct security posture and operational scope,
 * critical for multi-tenant and highly regulated financial environments.
 */
export interface ChaosTheoristViewProps {
  /** The identifier of the currently authenticated user. */
  currentUser: UserIdentifier;
  /** An array of system identifiers that the current user has access to. */
  accessibleSystems: SystemIdentifier[];
  /** Initial system to load, if any. */
  initialSystemId?: SystemIdentifier;
  /** Callback for when an intervention is successfully proposed or executed. */
  onInterventionSuccess?: (interventionId: string, systemId: SystemIdentifier) => void;
  /** Callback for critical errors within the view. */
  onError?: (error: Error) => void;
  /** Configuration for external service integrations (e.g., API endpoints). */
  serviceConfig: {
    systemApiUrl: string;
    simulationApiUrl: string;
    agentApiUrl: string;
    tokenRailApiUrl: string;
    identityApiUrl: string;
  };
}

// --- State Management for Chaos Theorist View ---

/**
 * Represents the overall state of the Chaos Theorist View application.
 * This state is managed by a reducer to ensure predictable updates across
 * complex interactions within the financial infrastructure.
 *
 * Business Value: The application state acts as the single source of truth
 * for the Chaos Theorist View. Its structured nature, encompassing active
 * systems, simulations, and agent tasks, ensures data consistency and facilitates
 * complex interactions. This robust state model is crucial for building a
 * reliable, scalable, and responsive financial control platform, enabling
 * real-time decision support and automated intervention.
 */
export interface AppState {
  /** Currently selected chaotic system for detailed analysis. */
  selectedSystemId: SystemIdentifier | null;
  /** All chaotic systems the user has access to. */
  systems: ChaoticSystemDefinition[];
  /** Currently active simulation runs. */
  activeSimulations: SimulationRun[];
  /** All defined simulation scenarios. */
  scenarios: SimulationScenario[];
  /** All registered AI agent profiles. */
  agents: AgentProfile[];
  /** All active agent tasks/orchestrations. */
  agentTasks: AgentTask[];
  /** All defined token types. */
  tokenDefinitions: TokenDefinition[];
  /** All digital identities. */
  digitalIdentities: DigitalIdentity[];
  /** UI loading states for different parts of the application. */
  isLoading: {
    systems: boolean;
    simulations: boolean;
    agents: boolean;
    tokenRails: boolean;
    identities: boolean;
  };
  /** Any global error messages to display. */
  globalError: string | null;
  /** User preferences or settings specific to the view. */
  userPreferences: {
    darkMode: boolean;
    refreshIntervalSeconds: number;
    notificationSettings: {
      criticalAlerts: boolean;
      simulationUpdates: boolean;
    };
  };
}

/**
 * Defines the actions that can be dispatched to modify the `AppState`.
 * These actions represent user interactions or system events that trigger
 * state transitions.
 *
 * Business Value: Action definitions provide a clear, standardized API for
 * interacting with the application's core logic. By enforcing a strict structure
 * for state changes, this interface ensures that all modifications are traceable,
 * predictable, and auditable, which is paramount in a regulated financial
 * environment. It facilitates the development of robust, maintainable, and
 * secure features.
 */
export type AppAction =
  | { type: 'SET_SELECTED_SYSTEM'; payload: SystemIdentifier | null }
  | { type: 'SET_SYSTEMS'; payload: ChaoticSystemDefinition[] }
  | { type: 'ADD_SYSTEM'; payload: ChaoticSystemDefinition }
  | { type: 'UPDATE_SYSTEM'; payload: ChaoticSystemDefinition }
  | { type: 'DELETE_SYSTEM'; payload: SystemIdentifier }
  | { type: 'SET_ACTIVE_SIMULATIONS'; payload: SimulationRun[] }
  | { type: 'ADD_SIMULATION_RUN'; payload: SimulationRun }
  | { type: 'UPDATE_SIMULATION_RUN'; payload: SimulationRun }
  | { type: 'SET_SCENARIOS'; payload: SimulationScenario[] }
  | { type: 'ADD_SCENARIO'; payload: SimulationScenario }
  | { type: 'UPDATE_SCENARIO'; payload: SimulationScenario }
  | { type: 'DELETE_SCENARIO'; payload: ScenarioIdentifier }
  | { type: 'SET_AGENTS'; payload: AgentProfile[] }
  | { type: 'ADD_AGENT'; payload: AgentProfile }
  | { type: 'UPDATE_AGENT'; payload: AgentProfile }
  | { type: 'SET_AGENT_TASKS'; payload: AgentTask[] }
  | { type: 'ADD_AGENT_TASK'; payload: AgentTask }
  | { type: 'UPDATE_AGENT_TASK'; payload: AgentTask }
  | { type: 'SET_TOKEN_DEFINITIONS'; payload: TokenDefinition[] }
  | { type: 'ADD_TOKEN_DEFINITION'; payload: TokenDefinition }
  | { type: 'UPDATE_TOKEN_DEFINITION'; payload: TokenDefinition }
  | { type: 'SET_DIGITAL_IDENTITIES'; payload: DigitalIdentity[] }
  | { type: 'ADD_DIGITAL_IDENTITY'; payload: DigitalIdentity }
  | { type: 'UPDATE_DIGITAL_IDENTITY'; payload: DigitalIdentity }
  | { type: 'SET_LOADING'; payload: { key: keyof AppState['isLoading']; value: boolean } }
  | { type: 'SET_GLOBAL_ERROR'; payload: string | null }
  | { type: 'SET_USER_PREFERENCE'; payload: { key: keyof AppState['userPreferences']; value: any } }; // Generic for nested preferences

/**
 * Initial state for the Chaos Theorist View application.
 *
 * Business Value: A well-defined initial state ensures that the application
 * starts in a predictable and consistent manner, preventing unexpected behaviors
 * and simplifying debugging. It establishes the baseline for all subsequent
 * operations, contributing to the overall stability and reliability of the
 * financial control system.
 */
export const initialAppState: AppState = {
  selectedSystemId: null,
  systems: [],
  activeSimulations: [],
  scenarios: [],
  agents: [],
  agentTasks: [],
  tokenDefinitions: [],
  digitalIdentities: [],
  isLoading: {
    systems: false,
    simulations: false,
    agents: false,
    tokenRails: false,
    identities: false,
  },
  globalError: null,
  userPreferences: {
    darkMode: false,
    refreshIntervalSeconds: 60,
    notificationSettings: {
      criticalAlerts: true,
      simulationUpdates: true,
    },
  },
};

/**
 * Reducer function for managing the application state of the Chaos Theorist View.
 * It handles state transitions based on dispatched actions, ensuring immutable updates.
 *
 * Business Value: The reducer provides a robust and predictable mechanism for
 * managing complex application state in a financial context. By centralizing
 * state logic and enforcing immutability, it minimizes the risk of data corruption,
 * facilitates comprehensive auditing of state changes, and ensures the reliability
 * and integrity of the entire system, which is paramount for high-stakes financial
 * operations.
 */
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SELECTED_SYSTEM':
      return { ...state, selectedSystemId: action.payload };
    case 'SET_SYSTEMS':
      return { ...state, systems: action.payload };
    case 'ADD_SYSTEM':
      return { ...state, systems: [...state.systems, action.payload] };
    case 'UPDATE_SYSTEM':
      return {
        ...state,
        systems: state.systems.map((sys) =>
          sys.id === action.payload.id ? action.payload : sys
        ),
      };
    case 'DELETE_SYSTEM':
      return {
        ...state,
        systems: state.systems.filter((sys) => sys.id !== action.payload),
      };
    case 'SET_ACTIVE_SIMULATIONS':
      return { ...state, activeSimulations: action.payload };
    case 'ADD_SIMULATION_RUN':
      return { ...state, activeSimulations: [...state.activeSimulations, action.payload] };
    case 'UPDATE_SIMULATION_RUN':
      return {
        ...state,
        activeSimulations: state.activeSimulations.map((sim) =>
          sim.id === action.payload.id ? action.payload : sim
        ),
      };
    case 'SET_SCENARIOS':
      return { ...state, scenarios: action.payload };
    case 'ADD_SCENARIO':
      return { ...state, scenarios: [...state.scenarios, action.payload] };
    case 'UPDATE_SCENARIO':
      return {
        ...state,
        scenarios: state.scenarios.map((scenario) =>
          scenario.id === action.payload.id ? action.payload : scenario
        ),
      };
    case 'DELETE_SCENARIO':
      return {
        ...state,
        scenarios: state.scenarios.filter((scenario) => scenario.id !== action.payload),
      };
    case 'SET_AGENTS':
      return { ...state, agents: action.payload };
    case 'ADD_AGENT':
      return { ...state, agents: [...state.agents, action.payload] };
    case 'UPDATE_AGENT':
      return {
        ...state,
        agents: state.agents.map((agent) =>
          agent.id === action.payload.id ? action.payload : agent
        ),
      };
    case 'SET_AGENT_TASKS':
      return { ...state, agentTasks: action.payload };
    case 'ADD_AGENT_TASK':
      return { ...state, agentTasks: [...state.agentTasks, action.payload] };
    case 'UPDATE_AGENT_TASK':
      return {
        ...state,
        agentTasks: state.agentTasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case 'SET_TOKEN_DEFINITIONS':
      return { ...state, tokenDefinitions: action.payload };
    case 'ADD_TOKEN_DEFINITION':
      return { ...state, tokenDefinitions: [...state.tokenDefinitions, action.payload] };
    case 'UPDATE_TOKEN_DEFINITION':
      return {
        ...state,
        tokenDefinitions: state.tokenDefinitions.map((token) =>
          token.id === action.payload.id ? action.payload : token
        ),
      };
    case 'SET_DIGITAL_IDENTITIES':
      return { ...state, digitalIdentities: action.payload };
    case 'ADD_DIGITAL_IDENTITY':
      return { ...state, digitalIdentities: [...state.digitalIdentities, action.payload] };
    case 'UPDATE_DIGITAL_IDENTITY':
      return {
        ...state,
        digitalIdentities: state.digitalIdentities.map((identity) =>
          identity.id === action.payload.id ? action.payload : identity
        ),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: { ...state.isLoading, [action.payload.key]: action.payload.value } };
    case 'SET_GLOBAL_ERROR':
      return { ...state, globalError: action.payload };
    case 'SET_USER_PREFERENCE':
      // This allows updating top-level preferences or specific nested ones if the key implies it
      // For deeper nested updates, a more complex payload or action type might be needed.
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          [action.payload.key]: action.payload.value,
        },
      };
    default:
      return state;
  }
}

/**
 * Context for providing the application state and dispatch function to components.
 *
 * Business Value: The ApplicationContext provides a highly efficient and scalable
 * mechanism for dependency injection of global state and actions. In a complex
 * financial application, this pattern significantly simplifies component
 * development, reduces prop-drilling, and ensures that critical data and
 * functionality are consistently available across the entire UI, leading to
 * faster development cycles and reduced maintenance overhead.
 */
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  serviceConfig: ChaosTheoristViewProps['serviceConfig'];
  currentUser: UserIdentifier;
  accessibleSystems: SystemIdentifier[];
  onInterventionSuccess?: (interventionId: string, systemId: SystemIdentifier) => void;
  onError?: (error: Error) => void;
}

export const ApplicationContext = createContext<AppContextType | undefined>(undefined);

/**
 * Custom hook for consuming the ApplicationContext.
 *
 * Business Value: This hook provides a convenient and type-safe way for
 * React components to access the global application state and dispatch
 * actions. It enforces proper context usage, making the codebase more
 * robust and easier to understand, particularly for new developers integrating
 * into a sophisticated financial application environment.
 */
export const useApplication = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplication must be used within an ApplicationProvider');
  }
  return context;
};

/**
 * Provider component for the ApplicationContext. It initializes the state
 * reducer and passes props to the context.
 *
 * Business Value: The ApplicationProvider component is the entry point for
 * global state management, centralizing the setup of the `useReducer` hook
 * and making the entire application's state accessible. This foundational
 * component is essential for large-scale, enterprise-grade applications,
 * ensuring consistent data flow and enabling the development of highly
 * interactive and responsive user interfaces for financial control.
 */
export const ApplicationProvider: React.FC<React.PropsWithChildren<ChaosTheoristViewProps>> = ({
  children,
  currentUser,
  accessibleSystems,
  serviceConfig,
  onInterventionSuccess,
  onError,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  return (
    <ApplicationContext.Provider
      value={{
        state,
        dispatch,
        serviceConfig,
        currentUser,
        accessibleSystems,
        onInterventionSuccess,
        onError,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

// --- API Service Interfaces ---

/**
 * Defines the contract for interacting with the Systems API.
 *
 * Business Value: API service interfaces are crucial for abstracting backend
 * complexity and ensuring consistency in data access. This contract defines
 * how the frontend interacts with core system definitions, enabling reliable
 * fetching, creation, and modification of financial models. It enhances
 * maintainability and allows for flexible backend changes without impacting
 * the frontend.
 */
interface SystemsApiService {
  getSystems: () => Promise<ChaoticSystemDefinition[]>;
  getSystemById: (id: SystemIdentifier) => Promise<ChaoticSystemDefinition>;
  createSystem: (system: Omit<ChaoticSystemDefinition, 'id' | 'createdAt' | 'lastModified' | 'ownerId' | 'contentHash' | 'monitoringAgents'>) => Promise<ChaoticSystemDefinition>;
  updateSystem: (id: SystemIdentifier, updates: Partial<ChaoticSystemDefinition>) => Promise<ChaoticSystemDefinition>;
  deleteSystem: (id: SystemIdentifier) => Promise<void>;
  identifyLeveragePoints: (systemId: SystemIdentifier) => Promise<LeveragePoint[]>;
  getSystemParameters: (systemId: SystemIdentifier) => Promise<SystemParameter[]>;
  updateSystemParameter: (systemId: SystemIdentifier, parameterId: string, value: number | string | boolean) => Promise<SystemParameter>;
}

/**
 * Defines the contract for interacting with the Simulations API.
 *
 * Business Value: The Simulations API interface enables programmatic control
 * over "what-if" analyses, a cornerstone of predictive governance. It allows
 * for initiating, monitoring, and retrieving results from complex simulations,
 * empowering AI agents and human strategists to test interventions rigorously.
 * This directly translates to de-risked decision-making and optimized strategy.
 */
interface SimulationsApiService {
  getSimulationRuns: (systemId?: SystemIdentifier) => Promise<SimulationRun[]>;
  getSimulationRunById: (id: SimulationRunIdentifier) => Promise<SimulationRun>;
  startSimulationRun: (
    systemId: SystemIdentifier,
    scenarioId: ScenarioIdentifier,
    initiatedBy: UserIdentifier | AgentIdentifier
  ) => Promise<SimulationRun>;
  stopSimulationRun: (id: SimulationRunIdentifier) => Promise<SimulationRun>;
  getScenarios: (systemId?: SystemIdentifier) => Promise<SimulationScenario[]>;
  getScenarioById: (id: ScenarioIdentifier) => Promise<SimulationScenario>;
  createScenario: (scenario: Omit<SimulationScenario, 'id' | 'createdAt' | 'lastModified' | 'createdBy' | 'simulationRuns' | 'systemSchemaVersion'>) => Promise<SimulationScenario>;
  updateScenario: (id: ScenarioIdentifier, updates: Partial<SimulationScenario>) => Promise<SimulationScenario>;
  deleteScenario: (id: ScenarioIdentifier) => Promise<void>;
}

/**
 * Defines the contract for interacting with the Agent and Orchestration API.
 *
 * Business Value: This API interface is the command-and-control center for
 * autonomous agents within the financial infrastructure. It allows for managing
 * agent profiles, orchestrating tasks, and monitoring their performance.
 * This directly supports the execution of intelligent automation strategies,
 * scaling operational capacity, and ensuring auditable, AI-driven interventions.
 */
interface AgentsApiService {
  getAgents: () => Promise<AgentProfile[]>;
  getAgentById: (id: AgentIdentifier) => Promise<AgentProfile>;
  createAgent: (agent: Omit<AgentProfile, 'id' | 'deployedAt' | 'lastActive' | 'performanceMetrics' | 'auditLog'>) => Promise<AgentProfile>;
  updateAgent: (id: AgentIdentifier, updates: Partial<AgentProfile>) => Promise<AgentProfile>;
  deleteAgent: (id: AgentIdentifier) => Promise<void>;
  getAgentTasks: (agentId?: AgentIdentifier) => Promise<AgentTask[]>;
  getAgentTaskById: (id: string) => Promise<AgentTask>;
  createAgentTask: (task: Omit<AgentTask, 'id' | 'createdAt' | 'lastUpdated' | 'executionHistory'>) => Promise<AgentTask>;
  updateAgentTask: (id: string, updates: Partial<AgentTask>) => Promise<AgentTask>;
  executeAgentTask: (id: string) => Promise<AgentTask>; // Triggers immediate execution
  getAgentSkills: () => Promise<AgentSkill[]>;
}

/**
 * Defines the contract for interacting with the Programmable Token Rail API.
 *
 * Business Value: The Token Rail API is the gateway to programmable finance,
 * enabling the management of digital assets and their associated transactions.
 * This interface allows for defining new tokens, tracking their properties,
 * and monitoring all on-chain activity, which is essential for creating,
 * managing, and settling new financial products and services on digital rails.
 */
interface TokenRailApiService {
  getTokenDefinitions: () => Promise<TokenDefinition[]>;
  getTokenDefinitionById: (id: TokenIdentifier) => Promise<TokenDefinition>;
  createTokenDefinition: (token: Omit<TokenDefinition, 'id' | 'createdAt' | 'auditTrailHash'>) => Promise<TokenDefinition>;
  updateTokenDefinition: (id: TokenIdentifier, updates: Partial<TokenDefinition>) => Promise<TokenDefinition>;
  getTokenTransactions: (tokenId?: TokenIdentifier, accountId?: AccountIdentifier) => Promise<TokenRailTransaction[]>;
  getTransactionById: (id: TransactionIdentifier) => Promise<TokenRailTransaction>;
  initiateTransaction: (transaction: Omit<TokenRailTransaction, 'id' | 'timestamp' | 'status' | 'transactionHash' | 'blockNumber' | 'senderSignature'>) => Promise<TokenRailTransaction>;
  // Additional methods for account management, token distribution, etc.
}

/**
 * Defines the contract for interacting with the Digital Identity API.
 *
 * Business Value: The Identity API is foundational for secure and compliant
 * operations. It provides the means to manage digital identities for users,
 * agents, and smart contracts, ensuring all participants in the financial
 * ecosystem are authenticated and authorized. This directly underpins trust,
 * security, and regulatory adherence.
 */
interface IdentityApiService {
  getDigitalIdentities: () => Promise<DigitalIdentity[]>;
  getDigitalIdentityById: (id: DigitalIdentityIdentifier) => Promise<DigitalIdentity>;
  createDigitalIdentity: (identity: Omit<DigitalIdentity, 'id' | 'createdAt' | 'lastUpdated'>) => Promise<DigitalIdentity>;
  updateDigitalIdentity: (id: DigitalIdentityIdentifier, updates: Partial<DigitalIdentity>) => Promise<DigitalIdentity>;
  revokeDigitalIdentity: (id: DigitalIdentityIdentifier) => Promise<void>;
  verifyCredentials: (identityId: DigitalIdentityIdentifier, credentialHash: string) => Promise<boolean>;
}

// --- Implementation of API Services (Mocked for development) ---

/**
 * Base abstract class for API services, providing common utility methods.
 */
abstract class BaseApiService {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  protected async fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  }
}

/**
 * Mock implementation of the Systems API service.
 * In a real application, this would interact with a backend API.
 */
class MockSystemsApiService extends BaseApiService implements SystemsApiService {
  private systems: ChaoticSystemDefinition[] = [];
  private leveragePoints: LeveragePoint[] = [];

  constructor(baseUrl: string, initialSystems: ChaoticSystemDefinition[] = [], initialLeveragePoints: LeveragePoint[] = []) {
    super(baseUrl);
    this.systems = initialSystems;
    this.leveragePoints = initialLeveragePoints;
  }

  async getSystems(): Promise<ChaoticSystemDefinition[]> {
    console.log(`Mock: Fetching all systems from ${this.baseUrl}/systems`);
    return Promise.resolve(this.systems);
  }

  async getSystemById(id: SystemIdentifier): Promise<ChaoticSystemDefinition> {
    console.log(`Mock: Fetching system ${id} from ${this.baseUrl}/systems/${id}`);
    const system = this.systems.find((s) => s.id === id);
    if (!system) throw new Error(`System with ID ${id} not found.`);
    return Promise.resolve(system);
  }

  async createSystem(
    system: Omit<
      ChaoticSystemDefinition,
      'id' | 'createdAt' | 'lastModified' | 'ownerId' | 'contentHash' | 'monitoringAgents'
    >
  ): Promise<ChaoticSystemDefinition> {
    console.log(`Mock: Creating new system at ${this.baseUrl}/systems`, system);
    const newSystem: ChaoticSystemDefinition = {
      ...system,
      id: `sys-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      ownerId: 'mock-user-123', // Mock owner
      contentHash: `hash-${Math.random()}`,
      monitoringAgents: [],
    };
    this.systems.push(newSystem);
    return Promise.resolve(newSystem);
  }

  async updateSystem(id: SystemIdentifier, updates: Partial<ChaoticSystemDefinition>): Promise<ChaoticSystemDefinition> {
    console.log(`Mock: Updating system ${id} at ${this.baseUrl}/systems/${id}`, updates);
    const index = this.systems.findIndex((s) => s.id === id);
    if (index === -1) throw new Error(`System with ID ${id} not found.`);
    this.systems[index] = {
      ...this.systems[index],
      ...updates,
      lastModified: new Date().toISOString(),
    };
    return Promise.resolve(this.systems[index]);
  }

  async deleteSystem(id: SystemIdentifier): Promise<void> {
    console.log(`Mock: Deleting system ${id} at ${this.baseUrl}/systems/${id}`);
    const initialLength = this.systems.length;
    this.systems = this.systems.filter((s) => s.id !== id);
    if (this.systems.length === initialLength) {
      throw new Error(`System with ID ${id} not found.`);
    }
    return Promise.resolve();
  }

  async identifyLeveragePoints(systemId: SystemIdentifier): Promise<LeveragePoint[]> {
    console.log(`Mock: Identifying leverage points for system ${systemId} from ${this.baseUrl}/systems/${systemId}/leverage-points`);
    // Mock logic: return a subset of pre-defined leverage points or generate dynamically
    return Promise.resolve(this.leveragePoints.filter(lp => Math.random() > 0.5)); // Randomly return some
  }

  async getSystemParameters(systemId: SystemIdentifier): Promise<SystemParameter[]> {
    console.log(`Mock: Fetching parameters for system ${systemId}`);
    const system = this.systems.find(s => s.id === systemId);
    if (!system) throw new Error(`System with ID ${systemId} not found.`);
    return Promise.resolve(system.parameters);
  }

  async updateSystemParameter(systemId: SystemIdentifier, parameterId: string, value: number | string | boolean): Promise<SystemParameter> {
    console.log(`Mock: Updating parameter ${parameterId} of system ${systemId} to ${value}`);
    const systemIndex = this.systems.findIndex(s => s.id === systemId);
    if (systemIndex === -1) throw new Error(`System with ID ${systemId} not found.`);

    const paramIndex = this.systems[systemIndex].parameters.findIndex(p => p.id === parameterId);
    if (paramIndex === -1) throw new Error(`Parameter with ID ${parameterId} not found in system ${systemId}.`);

    this.systems[systemIndex].parameters[paramIndex] = {
      ...this.systems[systemIndex].parameters[paramIndex],
      currentValue: value,
    };
    return Promise.resolve(this.systems[systemIndex].parameters[paramIndex]);
  }
}

/**
 * Mock implementation of the Simulations API service.
 */
class MockSimulationsApiService extends BaseApiService implements SimulationsApiService {
  private simulationRuns: SimulationRun[] = [];
  private scenarios: SimulationScenario[] = [];

  constructor(baseUrl: string, initialRuns: SimulationRun[] = [], initialScenarios: SimulationScenario[] = []) {
    super(baseUrl);
    this.simulationRuns = initialRuns;
    this.scenarios = initialScenarios;
  }

  async getSimulationRuns(systemId?: SystemIdentifier): Promise<SimulationRun[]> {
    console.log(`Mock: Fetching simulation runs for system ${systemId || 'all'} from ${this.baseUrl}/simulations`);
    return Promise.resolve(systemId ? this.simulationRuns.filter(run => run.systemId === systemId) : this.simulationRuns);
  }

  async getSimulationRunById(id: SimulationRunIdentifier): Promise<SimulationRun> {
    console.log(`Mock: Fetching simulation run ${id} from ${this.baseUrl}/simulations/${id}`);
    const run = this.simulationRuns.find((r) => r.id === id);
    if (!run) throw new Error(`Simulation run with ID ${id} not found.`);
    return Promise.resolve(run);
  }

  async startSimulationRun(
    systemId: SystemIdentifier,
    scenarioId: ScenarioIdentifier,
    initiatedBy: UserIdentifier | AgentIdentifier
  ): Promise<SimulationRun> {
    console.log(`Mock: Starting simulation for system ${systemId}, scenario ${scenarioId}`);
    const newRun: SimulationRun = {
      id: `sim-${Date.now()}`,
      systemId,
      scenarioId,
      initiatedBy,
      startTime: new Date().toISOString(),
      status: 'Running',
      initialState: [], // Populate from scenario or system
      appliedLeveragePoints: [],
      results: {
        overallImpact: 'N/A',
        riskAssessment: [],
        achievedGoals: [],
        unintendedConsequences: [],
      },
      metricsHistory: [],
      parametersHistory: [],
      events: [{ timestamp: new Date().toISOString(), type: 'start', description: 'Simulation started' }],
      modelVersion: '1.0',
      tags: ['mock', 'auto-generated'],
    };
    this.simulationRuns.push(newRun);

    // Simulate completion after a delay
    setTimeout(() => {
      const updatedRunIndex = this.simulationRuns.findIndex(r => r.id === newRun.id);
      if (updatedRunIndex !== -1) {
        this.simulationRuns[updatedRunIndex] = {
          ...this.simulationRuns[updatedRunIndex],
          status: 'Completed',
          endTime: new Date().toISOString(),
          durationMs: Date.now() - new Date(newRun.startTime).getTime(),
          results: {
            ...this.simulationRuns[updatedRunIndex].results,
            overallImpact: `Simulated impact for ${systemId} in scenario ${scenarioId}`,
          },
          events: [...this.simulationRuns[updatedRunIndex].events!, { timestamp: new Date().toISOString(), type: 'completion', description: 'Simulation completed successfully' }],
        };
        console.log(`Mock: Simulation ${newRun.id} completed.`);
      }
    }, 5000); // Simulate 5 seconds run time

    return Promise.resolve(newRun);
  }

  async stopSimulationRun(id: SimulationRunIdentifier): Promise<SimulationRun> {
    console.log(`Mock: Stopping simulation ${id}`);
    const index = this.simulationRuns.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`Simulation run with ID ${id} not found.`);
    this.simulationRuns[index] = {
      ...this.simulationRuns[index],
      status: 'Cancelled',
      endTime: new Date().toISOString(),
      durationMs: Date.now() - new Date(this.simulationRuns[index].startTime).getTime(),
      events: [...this.simulationRuns[index].events!, { timestamp: new Date().toISOString(), type: 'cancel', description: 'Simulation cancelled by user' }],
    };
    return Promise.resolve(this.simulationRuns[index]);
  }

  async getScenarios(systemId?: SystemIdentifier): Promise<SimulationScenario[]> {
    console.log(`Mock: Fetching scenarios for system ${systemId || 'all'} from ${this.baseUrl}/scenarios`);
    return Promise.resolve(systemId ? this.scenarios.filter(s => s.systemId === systemId) : this.scenarios);
  }

  async getScenarioById(id: ScenarioIdentifier): Promise<SimulationScenario> {
    console.log(`Mock: Fetching scenario ${id} from ${this.baseUrl}/scenarios/${id}`);
    const scenario = this.scenarios.find((s) => s.id === id);
    if (!scenario) throw new Error(`Scenario with ID ${id} not found.`);
    return Promise.resolve(scenario);
  }

  async createScenario(scenario: Omit<SimulationScenario, 'id' | 'createdAt' | 'lastModified' | 'createdBy' | 'simulationRuns' | 'systemSchemaVersion'>): Promise<SimulationScenario> {
    console.log(`Mock: Creating new scenario at ${this.baseUrl}/scenarios`, scenario);
    const newScenario: SimulationScenario = {
      ...scenario,
      id: `scenario-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      createdBy: 'mock-user-123',
      simulationRuns: [],
      systemSchemaVersion: '1.0', // Assume default
    };
    this.scenarios.push(newScenario);
    return Promise.resolve(newScenario);
  }

  async updateScenario(id: ScenarioIdentifier, updates: Partial<SimulationScenario>): Promise<SimulationScenario> {
    console.log(`Mock: Updating scenario ${id} at ${this.baseUrl}/scenarios/${id}`, updates);
    const index = this.scenarios.findIndex((s) => s.id === id);
    if (index === -1) throw new Error(`Scenario with ID ${id} not found.`);
    this.scenarios[index] = {
      ...this.scenarios[index],
      ...updates,
      lastModified: new Date().toISOString(),
    };
    return Promise.resolve(this.scenarios[index]);
  }

  async deleteScenario(id: ScenarioIdentifier): Promise<void> {
    console.log(`Mock: Deleting scenario ${id} at ${this.baseUrl}/scenarios/${id}`);
    const initialLength = this.scenarios.length;
    this.scenarios = this.scenarios.filter((s) => s.id !== id);
    if (this.scenarios.length === initialLength) {
      throw new Error(`Scenario with ID ${id} not found.`);
    }
    return Promise.resolve();
  }
}

/**
 * Mock implementation of the Agents API service.
 */
class MockAgentsApiService extends BaseApiService implements AgentsApiService {
  private agents: AgentProfile[] = [];
  private agentTasks: AgentTask[] = [];
  private agentSkills: AgentSkill[] = [];

  constructor(
    baseUrl: string,
    initialAgents: AgentProfile[] = [],
    initialTasks: AgentTask[] = [],
    initialSkills: AgentSkill[] = []
  ) {
    super(baseUrl);
    this.agents = initialAgents;
    this.agentTasks = initialTasks;
    this.agentSkills = initialSkills;
  }

  async getAgents(): Promise<AgentProfile[]> {
    console.log(`Mock: Fetching all agents from ${this.baseUrl}/agents`);
    return Promise.resolve(this.agents);
  }

  async getAgentById(id: AgentIdentifier): Promise<AgentProfile> {
    console.log(`Mock: Fetching agent ${id} from ${this.baseUrl}/agents/${id}`);
    const agent = this.agents.find((a) => a.id === id);
    if (!agent) throw new Error(`Agent with ID ${id} not found.`);
    return Promise.resolve(agent);
  }

  async createAgent(agent: Omit<AgentProfile, 'id' | 'deployedAt' | 'lastActive' | 'performanceMetrics' | 'auditLog'>): Promise<AgentProfile> {
    console.log(`Mock: Creating new agent at ${this.baseUrl}/agents`, agent);
    const newAgent: AgentProfile = {
      ...agent,
      id: `agent-${Date.now()}`,
      deployedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      performanceMetrics: {
        successRate: 0,
        averageExecutionTimeMs: 0,
        errorRate: 0,
        lastReported: new Date().toISOString(),
      },
      auditLog: [],
    };
    this.agents.push(newAgent);
    return Promise.resolve(newAgent);
  }

  async updateAgent(id: AgentIdentifier, updates: Partial<AgentProfile>): Promise<AgentProfile> {
    console.log(`Mock: Updating agent ${id} at ${this.baseUrl}/agents/${id}`, updates);
    const index = this.agents.findIndex((a) => a.id === id);
    if (index === -1) throw new Error(`Agent with ID ${id} not found.`);
    this.agents[index] = {
      ...this.agents[index],
      ...updates,
      lastActive: new Date().toISOString(),
    };
    return Promise.resolve(this.agents[index]);
  }

  async deleteAgent(id: AgentIdentifier): Promise<void> {
    console.log(`Mock: Deleting agent ${id} at ${this.baseUrl}/agents/${id}`);
    const initialLength = this.agents.length;
    this.agents = this.agents.filter((a) => a.id !== id);
    if (this.agents.length === initialLength) {
      throw new Error(`Agent with ID ${id} not found.`);
    }
    return Promise.resolve();
  }

  async getAgentTasks(agentId?: AgentIdentifier): Promise<AgentTask[]> {
    console.log(`Mock: Fetching agent tasks for agent ${agentId || 'all'} from ${this.baseUrl}/tasks`);
    return Promise.resolve(agentId ? this.agentTasks.filter(task => task.executorAgentId === agentId) : this.agentTasks);
  }

  async getAgentTaskById(id: string): Promise<AgentTask> {
    console.log(`Mock: Fetching agent task ${id} from ${this.baseUrl}/tasks/${id}`);
    const task = this.agentTasks.find((t) => t.id === id);
    if (!task) throw new Error(`Agent task with ID ${id} not found.`);
    return Promise.resolve(task);
  }

  async createAgentTask(task: Omit<AgentTask, 'id' | 'createdAt' | 'lastUpdated' | 'executionHistory'>): Promise<AgentTask> {
    console.log(`Mock: Creating new agent task at ${this.baseUrl}/tasks`, task);
    const newId = `task-${Date.now()}`;
    const newTask: AgentTask = {
      ...task,
      id: newId,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status: 'pending',
      executionHistory: [],
    };
    this.agentTasks.push(newTask);
    return Promise.resolve(newTask);
  }

  async updateAgentTask(id: string, updates: Partial<AgentTask>): Promise<AgentTask> {
    console.log(`Mock: Updating agent task ${id} at ${this.baseUrl}/tasks/${id}`, updates);
    const index = this.agentTasks.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Agent task with ID ${id} not found.`);
    this.agentTasks[index] = {
      ...this.agentTasks[index],
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    return Promise.resolve(this.agentTasks[index]);
  }

  async executeAgentTask(id: string): Promise<AgentTask> {
    console.log(`Mock: Executing agent task ${id}`);
    const index = this.agentTasks.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Agent task with ID ${id} not found.`);

    const task = this.agentTasks[index];
    const updatedTask: AgentTask = {
      ...task,
      status: 'running',
      executionHistory: [
        ...task.executionHistory,
        { timestamp: new Date().toISOString(), status: 'started', log: 'Task execution initiated.' },
      ],
      lastUpdated: new Date().toISOString(),
    };
    this.agentTasks[index] = updatedTask;

    // Simulate task completion
    setTimeout(() => {
      const completionIndex = this.agentTasks.findIndex(t => t.id === id);
      if (completionIndex !== -1) {
        const completedTask = this.agentTasks[completionIndex];
        this.agentTasks[completionIndex] = {
          ...completedTask,
          status: 'completed',
          executionHistory: [
            ...completedTask.executionHistory,
            { timestamp: new Date().toISOString(), status: 'completed', log: 'Task execution finished successfully.' },
          ],
          actualImpact: 'Simulated positive impact.',
          lastUpdated: new Date().toISOString(),
        };
        console.log(`Mock: Agent task ${id} completed.`);
      }
    }, 3000); // Simulate 3 seconds execution

    return Promise.resolve(updatedTask);
  }

  async getAgentSkills(): Promise<AgentSkill[]> {
    console.log(`Mock: Fetching all agent skills from ${this.baseUrl}/skills`);
    return Promise.resolve(this.agentSkills);
  }
}

/**
 * Mock implementation of the Token Rail API service.
 */
class MockTokenRailApiService extends BaseApiService implements TokenRailApiService {
  private tokenDefinitions: TokenDefinition[] = [];
  private tokenTransactions: TokenRailTransaction[] = [];

  constructor(baseUrl: string, initialTokens: TokenDefinition[] = [], initialTransactions: TokenRailTransaction[] = []) {
    super(baseUrl);
    this.tokenDefinitions = initialTokens;
    this.tokenTransactions = initialTransactions;
  }

  async getTokenDefinitions(): Promise<TokenDefinition[]> {
    console.log(`Mock: Fetching all token definitions from ${this.baseUrl}/tokens`);
    return Promise.resolve(this.tokenDefinitions);
  }

  async getTokenDefinitionById(id: TokenIdentifier): Promise<TokenDefinition> {
    console.log(`Mock: Fetching token definition ${id} from ${this.baseUrl}/tokens/${id}`);
    const token = this.tokenDefinitions.find((t) => t.id === id);
    if (!token) throw new Error(`Token definition with ID ${id} not found.`);
    return Promise.resolve(token);
  }

  async createTokenDefinition(token: Omit<TokenDefinition, 'id' | 'createdAt' | 'auditTrailHash'>): Promise<TokenDefinition> {
    console.log(`Mock: Creating new token definition at ${this.baseUrl}/tokens`, token);
    const newId = `token-${Date.now()}`;
    const newDefinition: TokenDefinition = {
      ...token,
      id: newId,
      createdAt: new Date().toISOString(),
      auditTrailHash: `hash-${Math.random()}`,
    };
    this.tokenDefinitions.push(newDefinition);
    return Promise.resolve(newDefinition);
  }

  async updateTokenDefinition(id: TokenIdentifier, updates: Partial<TokenDefinition>): Promise<TokenDefinition> {
    console.log(`Mock: Updating token definition ${id} at ${this.baseUrl}/tokens/${id}`, updates);
    const index = this.tokenDefinitions.findIndex((t) => t.id === id);
    if (index === -1) throw new Error(`Token definition with ID ${id} not found.`);
    this.tokenDefinitions[index] = {
      ...this.tokenDefinitions[index],
      ...updates,
      auditTrailHash: `hash-${Math.random()}`, // Simulate new hash on update
    };
    return Promise.resolve(this.tokenDefinitions[index]);
  }

  async getTokenTransactions(tokenId?: TokenIdentifier, accountId?: AccountIdentifier): Promise<TokenRailTransaction[]> {
    console.log(`Mock: Fetching transactions for token ${tokenId || 'all'} and account ${accountId || 'all'} from ${this.baseUrl}/transactions`);
    let filtered = this.tokenTransactions;
    if (tokenId) {
      filtered = filtered.filter(t => t.tokenId === tokenId);
    }
    if (accountId) {
      filtered = filtered.filter(t => t.senderId === accountId || t.receiverId === accountId);
    }
    return Promise.resolve(filtered);
  }

  async getTransactionById(id: TransactionIdentifier): Promise<TokenRailTransaction> {
    console.log(`Mock: Fetching transaction ${id} from ${this.baseUrl}/transactions/${id}`);
    const transaction = this.tokenTransactions.find((t) => t.id === id);
    if (!transaction) throw new Error(`Transaction with ID ${id} not found.`);
    return Promise.resolve(transaction);
  }

  async initiateTransaction(
    transaction: Omit<TokenRailTransaction, 'id' | 'timestamp' | 'status' | 'transactionHash' | 'blockNumber' | 'senderSignature'>
  ): Promise<TokenRailTransaction> {
    console.log(`Mock: Initiating new transaction at ${this.baseUrl}/transactions`, transaction);
    const newTxId = `tx-${Date.now()}`;
    const newTransaction: TokenRailTransaction = {
      ...transaction,
      id: newTxId,
      timestamp: new Date().toISOString(),
      status: 'pending',
      transactionHash: `mock-tx-hash-${Math.random()}`,
      senderSignature: `mock-sig-${Math.random()}`,
    };
    this.tokenTransactions.push(newTransaction);

    // Simulate confirmation
    setTimeout(() => {
      const index = this.tokenTransactions.findIndex(t => t.id === newTxId);
      if (index !== -1) {
        this.tokenTransactions[index] = {
          ...this.tokenTransactions[index],
          status: 'confirmed',
          blockNumber: Math.floor(Math.random() * 1000000),
        };
        console.log(`Mock: Transaction ${newTxId} confirmed.`);
      }
    }, 2000); // Simulate 2 seconds to confirm

    return Promise.resolve(newTransaction);
  }
}

/**
 * Mock implementation of the Digital Identity API service.
 */
class MockIdentityApiService extends BaseApiService implements IdentityApiService {
  private digitalIdentities: DigitalIdentity[] = [];

  constructor(baseUrl: string, initialIdentities: DigitalIdentity[] = []) {
    super(baseUrl);
    this.digitalIdentities = initialIdentities;
  }

  async getDigitalIdentities(): Promise<DigitalIdentity[]> {
    console.log(`Mock: Fetching all digital identities from ${this.baseUrl}/identities`);
    return Promise.resolve(this.digitalIdentities);
  }

  async getDigitalIdentityById(id: DigitalIdentityIdentifier): Promise<DigitalIdentity> {
    console.log(`Mock: Fetching digital identity ${id} from ${this.baseUrl}/identities/${id}`);
    const identity = this.digitalIdentities.find((i) => i.id === id);
    if (!identity) throw new Error(`Digital Identity with ID ${id} not found.`);
    return Promise.resolve(identity);
  }

  async createDigitalIdentity(identity: Omit<DigitalIdentity, 'id' | 'createdAt' | 'lastUpdated'>): Promise<DigitalIdentity> {
    console.log(`Mock: Creating new digital identity at ${this.baseUrl}/identities`, identity);
    const newId = `did-${Date.now()}`;
    const newIdentity: DigitalIdentity = {
      ...identity,
      id: newId,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    this.digitalIdentities.push(newIdentity);
    return Promise.resolve(newIdentity);
  }

  async updateDigitalIdentity(id: DigitalIdentityIdentifier, updates: Partial<DigitalIdentity>): Promise<DigitalIdentity> {
    console.log(`Mock: Updating digital identity ${id} at ${this.baseUrl}/identities/${id}`, updates);
    const index = this.digitalIdentities.findIndex((i) => i.id === id);
    if (index === -1) throw new Error(`Digital Identity with ID ${id} not found.`);
    this.digitalIdentities[index] = {
      ...this.digitalIdentities[index],
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    return Promise.resolve(this.digitalIdentities[index]);
  }

  async revokeDigitalIdentity(id: DigitalIdentityIdentifier): Promise<void> {
    console.log(`Mock: Revoking digital identity ${id} at ${this.baseUrl}/identities/${id}`);
    const index = this.digitalIdentities.findIndex((i) => i.id === id);
    if (index === -1) throw new Error(`Digital Identity with ID ${id} not found.`);
    this.digitalIdentities[index] = {
      ...this.digitalIdentities[index],
      status: 'revoked',
      lastUpdated: new Date().toISOString(),
    };
    return Promise.resolve();
  }

  async verifyCredentials(identityId: DigitalIdentityIdentifier, credentialHash: string): Promise<boolean> {
    console.log(`Mock: Verifying credentials for identity ${identityId} with hash ${credentialHash}`);
    const identity = this.digitalIdentities.find(i => i.id === identityId);
    if (!identity) return Promise.resolve(false);
    return Promise.resolve(identity.verifiableCredentials.some(vc => vc.hash === credentialHash));
  }
}

// --- API Service Instances (Using Mocks) ---

// Example initial data for mocks
const mockSystemsData: ChaoticSystemDefinition[] = [
  {
    id: 'financial-market-stability-v1',
    name: 'Global Financial Market Stability',
    description: 'A model of interconnected global financial markets, including indices, commodities, and FX.',
    createdAt: '2023-01-15T10:00:00Z',
    lastModified: '2024-03-10T14:30:00Z',
    ownerId: 'sysadmin-001',
    parameters: [
      {
        id: 'interest-rate-g7',
        name: 'G7 Interest Rate',
        description: 'Average interbank interest rate across G7 nations.',
        currentValue: 4.5,
        unit: '%',
        minValue: 0,
        maxValue: 10,
        step: 0.1,
        isLeverageCandidate: true,
        dataType: 'number',
        securityLevel: 'high',
        governancePolicyId: 'policy-monetary-001',
      },
      {
        id: 'commodity-price-volatility',
        name: 'Global Commodity Price Volatility Index',
        description: 'VIX-like index for major commodities (oil, gold, wheat).',
        currentValue: 25.3,
        unit: 'index points',
        minValue: 5,
        maxValue: 100,
        step: 0.5,
        isLeverageCandidate: false,
        dataType: 'number',
        securityLevel: 'medium',
      },
      {
        id: 'trade-tariff-level',
        name: 'Average Global Trade Tariff Level',
        description: 'Weighted average of tariffs on international trade.',
        currentValue: 3.2,
        unit: '%',
        minValue: 0,
        maxValue: 20,
        step: 0.1,
        isLeverageCandidate: true,
        dataType: 'number',
        securityLevel: 'high',
      },
    ],
    metrics: [
      {
        id: 'global-gdp-growth',
        name: 'Global GDP Growth Rate (Quarterly)',
        description: 'Year-over-year percentage change in global GDP.',
        currentValue: 2.8,
        unit: '%',
        target: { min: 2.5, max: 3.5, unit: '%' },
        history: [],
        alertThresholds: { critical: { operator: '<', value: 1.0 } },
        isDerived: true,
        derivationMethod: 'weighted average of national GDPs',
        dataQualityScore: 0.95,
        observationFrequency: 'quarterly',
      },
      {
        id: 'systemic-risk-index',
        name: 'Financial Systemic Risk Index',
        description: 'Composite index indicating the probability of a systemic financial crisis.',
        currentValue: 0.65,
        unit: 'probability',
        target: { max: 0.3, unit: 'probability' },
        history: [],
        alertThresholds: { warning: { operator: '>', value: 0.5 }, critical: { operator: '>', value: 0.8 } },
        isDerived: true,
        derivationMethod: 'proprietary AI model',
        dataQualityScore: 0.88,
        observationFrequency: 'daily',
      },
    ],
    feedbackLoops: [
      {
        id: 'interest-rate-to-gdp',
        name: 'Interest Rate to GDP Growth',
        description: 'Higher interest rates reduce borrowing, slowing economic growth.',
        type: 'negative',
        sourceId: 'interest-rate-g7',
        targetId: 'global-gdp-growth',
        strength: -0.7,
        delay: '6 months',
        confidence: 0.9,
        isDynamic: false,
      },
    ],
    status: 'Active',
    schemaVersion: '1.0',
    tags: ['macroeconomics', 'finance', 'risk'],
    scope: 'Global',
    externalDataSources: [
      { name: 'IMF World Economic Outlook', url: 'https://www.imf.org', lastSync: '2024-03-09T00:00:00Z', status: 'active' },
    ],
    accessControl: {
      public: false,
      sharedWithUsers: [],
      sharedWithGroups: ['financial-analysts', 'risk-management'],
      rbacPolicyId: 'policy-global-finance-read',
    },
    simulationModelRef: 'chaos-model-v2.1',
    modelVersion: '2.1.0',
    monitoringConfig: {
      intervalSeconds: 3600,
      alertOnAnomaly: true,
      anomalyDetectionModel: 'z-score-threshold',
    },
    securityClassification: 'restricted',
    complianceStandards: ['GDPR', 'PCI-DSS'],
    contentHash: 'abc123def456',
    monitoringAgents: [], // Will be populated by agent mocks
  },
  {
    id: 'supply-chain-resilience-v1',
    name: 'Global Supply Chain Resilience',
    description: 'Models critical supply chains, identifying choke points and recovery pathways.',
    createdAt: '2023-05-20T09:00:00Z',
    lastModified: '2024-02-28T11:15:00Z',
    ownerId: 'ops-lead-001',
    parameters: [
      {
        id: 'shipping-capacity',
        name: 'Global Shipping Container Capacity',
        description: 'Percentage of available global shipping container capacity.',
        currentValue: 85,
        unit: '%',
        minValue: 0,
        maxValue: 100,
        step: 1,
        isLeverageCandidate: true,
        dataType: 'number',
        securityLevel: 'medium',
      },
      {
        id: 'port-efficiency',
        name: 'Average Port Turnaround Time',
        description: 'Average time (in days) a container ship spends at port.',
        currentValue: 3.5,
        unit: 'days',
        minValue: 1,
        maxValue: 10,
        step: 0.1,
        isLeverageCandidate: true,
        dataType: 'number',
        securityLevel: 'medium',
      },
    ],
    metrics: [
      {
        id: 'delivery-lead-time',
        name: 'Average Global Delivery Lead Time',
        description: 'Average time from order placement to delivery for key goods.',
        currentValue: 30,
        unit: 'days',
        target: { max: 25, unit: 'days' },
        history: [],
        alertThresholds: { warning: { operator: '>', value: 35 }, critical: { operator: '>', value: 45 } },
        isDerived: true,
        derivationMethod: 'logistics network analytics',
        dataQualityScore: 0.92,
        observationFrequency: 'weekly',
      },
    ],
    feedbackLoops: [],
    status: 'Active',
    schemaVersion: '1.0',
    tags: ['logistics', 'supply chain', 'operations'],
    scope: 'Global',
    externalDataSources: [],
    accessControl: { public: false, sharedWithUsers: [], sharedWithGroups: ['operations', 'logistics'], rbacPolicyId: 'policy-ops-read' },
    simulationModelRef: 'supply-chain-sim-v1.0',
    modelVersion: '1.0.0',
    monitoringConfig: { intervalSeconds: 86400, alertOnAnomaly: true, anomalyDetectionModel: 'kalman-filter' },
    securityClassification: 'confidential',
    complianceStandards: ['ISO 28000'],
    contentHash: 'def789ghi012',
    monitoringAgents: [],
  },
];

const mockLeveragePointsData: LeveragePoint[] = [
  {
    id: 'lp-001',
    action: 'Adjust G7 Interest Rates by -0.5%',
    cost: '$10M (implementation)',
    outcomeProbability: 0.7,
    timeToImpact: '6-9 months',
    description: 'Reduce average G7 central bank interest rates to stimulate borrowing and investment, aiming to boost global GDP growth.',
    positiveSideEffects: ['Increased consumer spending', 'Higher corporate profits'],
    negativeSideEffects: ['Inflationary pressure', 'Currency devaluation risks'],
    impactMagnitude: '0.5% increase in global GDP growth',
    predictionConfidence: 0.85,
    implementationEffort: 'High',
    reversibility: 'Medium',
    risks: [{ category: 'Economic', severity: 'High', description: 'Uncontrolled inflation' }],
    requiredResources: ['Central Bank consensus', 'Economic modeling team'],
    stakeholders: [{ name: 'Central Banks', role: 'Decision Maker', influence: 'High' }],
    lastUpdated: '2024-03-10T15:00:00Z',
    proposedByAgentId: 'agent-quantbot-001',
    requiredSkill: 'MonetaryPolicyExpertise',
    estimatedKpiImpact: ['Global GDP Growth: +0.5%', 'Inflation Rate: +0.2%'],
    requiredPolicy: 'MonetaryPolicyApproval',
  },
  {
    id: 'lp-002',
    action: 'Invest $500M in Port Infrastructure',
    cost: '$500M',
    outcomeProbability: 0.9,
    timeToImpact: '2-3 years',
    description: 'Upgrade port facilities in key global trade hubs to improve cargo handling efficiency and reduce turnaround times.',
    positiveSideEffects: ['Reduced shipping costs', 'Faster goods delivery'],
    negativeSideEffects: ['Temporary disruption during construction', 'Environmental impact concerns'],
    impactMagnitude: '10% reduction in average port turnaround time',
    predictionConfidence: 0.92,
    implementationEffort: 'Very High',
    reversibility: 'Low',
    risks: [{ category: 'Financial', severity: 'Medium', description: 'Budget overruns' }],
    requiredResources: ['Construction firms', 'Local government permits'],
    stakeholders: [{ name: 'Port Authorities', role: 'Operator', influence: 'High' }],
    lastUpdated: '2024-03-09T10:00:00Z',
    proposedByAgentId: 'agent-supplychain-optimus-001',
    requiredSkill: 'InfrastructureProjectManagement',
    estimatedKpiImpact: ['Port Efficiency: +10%', 'Delivery Lead Time: -5 days'],
    requiredPolicy: 'CapitalInvestmentApproval',
  },
];

const mockAgentsData: AgentProfile[] = [
  {
    id: 'agent-quantbot-001',
    name: 'QuantBot Alpha',
    description: 'Specialized in quantitative analysis and macroeconomic modeling for financial markets.',
    digitalIdentityId: 'did-agent-quantbot-001',
    status: 'active',
    deployedAt: '2023-01-20T12:00:00Z',
    lastActive: '2024-03-11T09:00:00Z',
    primaryObjective: 'Identify and analyze macroeconomic leverage points.',
    skills: [
      { id: 'MonetaryPolicyExpertise', name: 'Monetary Policy Analysis', description: 'Analyzes central bank policies and their market impact.', level: 'expert', requiredTools: ['Econometric Models', 'FRED API'], verificationStatus: 'verified', lastEvaluated: '2024-02-01T00:00:00Z' },
      { id: 'RiskModeling', name: 'Systemic Risk Modeling', description: 'Develops and applies models for systemic financial risk.', level: 'advanced', requiredTools: ['VaR Models', 'Stress Testing Frameworks'], verificationStatus: 'verified', lastEvaluated: '2024-02-01T00:00:00Z' },
    ],
    configuration: {
      riskTolerance: 'medium',
      maxBudget: { amount: 1000000, currency: 'USD' },
      operationalHours: '24/7',
      accessScope: ['financial-market-stability-v1'],
    },
    performanceMetrics: {
      successRate: 0.85,
      averageExecutionTimeMs: 1200,
      errorRate: 0.02,
      lastReported: '2024-03-11T08:55:00Z',
    },
    aiModelRef: 'gpt-4-finetuned-quant',
    modelSoftwareVersion: '4.2.1',
    auditLog: [],
    managers: ['sysadmin-001'],
    operationalCost: { amount: 50, currency: 'USD', frequency: 'hourly' },
    tags: ['quant', 'macro', 'financial'],
  },
  {
    id: 'agent-supplychain-optimus-001',
    name: 'SupplyChain Optimus',
    description: 'Optimizes global supply chain logistics and identifies resilience improvements.',
    digitalIdentityId: 'did-agent-supplychain-optimus-001',
    status: 'active',
    deployedAt: '2023-06-15T10:00:00Z',
    lastActive: '2024-03-11T09:10:00Z',
    primaryObjective: 'Enhance supply chain efficiency and robustness.',
    skills: [
      { id: 'LogisticsOptimization', name: 'Logistics Network Optimization', description: 'Optimizes routing, warehousing, and transportation.', level: 'expert', requiredTools: ['OR Tools', 'Geospatial Analytics'], verificationStatus: 'verified', lastEvaluated: '2024-01-15T00:00:00Z' },
      { id: 'InfrastructureProjectManagement', name: 'Infrastructure Project Management', description: 'Evaluates and plans large-scale infrastructure projects.', level: 'advanced', requiredTools: ['BIM Software', 'Project Management Frameworks'], verificationStatus: 'verified', lastEvaluated: '2024-01-15T00:00:00Z' },
    ],
    configuration: {
      riskTolerance: 'low',
      maxBudget: { amount: 500000000, currency: 'USD' },
      operationalHours: '24/7',
      accessScope: ['supply-chain-resilience-v1'],
    },
    performanceMetrics: {
      successRate: 0.95,
      averageExecutionTimeMs: 5000,
      errorRate: 0.01,
      lastReported: '2024-03-11T09:05:00Z',
    },
    aiModelRef: 'deep-reinforcement-learning-scm',
    modelSoftwareVersion: '3.0.0',
    auditLog: [],
    managers: ['ops-lead-001'],
    operationalCost: { amount: 75, currency: 'USD', frequency: 'hourly' },
    tags: ['supply chain', 'logistics', 'optimization'],
  },
];

const mockTokenDefsData: TokenDefinition[] = [
  {
    id: 'usd-stablecoin-v1',
    name: 'Enterprise USD Stablecoin',
    description: 'A stablecoin backed 1:1 by USD held in regulated bank accounts.',
    symbol: 'EUSDC',
    type: 'fungible',
    totalSupply: 'unlimited',
    decimals: 6,
    underlyingAsset: 'USD',
    blockchainPlatform: 'Ethereum (EVM compatible)',
    contractAddress: '0xabc123...',
    whitepaperUrl: 'https://example.com/eusdc-whitepaper.pdf',
    programmableRules: ['KYC/AML verified sender/receiver required', 'Transfer limits based on identity tier'],
    complianceStandards: ['AML', 'CFT', 'NYDFS BitLicense'],
    createdAt: '2023-02-01T00:00:00Z',
    status: 'active',
    auditTrailHash: 'token-hash-1',
    authorizedAgents: ['agent-asset-manager-001'],
  },
  {
    id: 'carbon-credit-nft-v1',
    name: 'Certified Carbon Credit NFT',
    description: 'A non-fungible token representing one ton of verified carbon emission reduction.',
    symbol: 'CCNFT',
    type: 'non-fungible',
    totalSupply: 1000000,
    decimals: 0,
    underlyingAsset: '1 ton CO2e reduction',
    blockchainPlatform: 'Polygon',
    contractAddress: '0xdef456...',
    whitepaperUrl: 'https://example.com/ccnft-whitepaper.pdf',
    programmableRules: ['Only burnable after verified offset', 'Transferable only to whitelisted wallets'],
    complianceStandards: ['Voluntary Carbon Market Standards'],
    createdAt: '2023-08-10T00:00:00Z',
    status: 'active',
    auditTrailHash: 'token-hash-2',
    authorizedAgents: ['agent-esg-tracker-001'],
  },
];

const mockDigitalIdentities: DigitalIdentity[] = [
  {
    id: 'did-user-john-doe',
    name: 'John Doe',
    type: 'user',
    publicKey: 'pk-user-john-doe-abc',
    status: 'active',
    roles: ['Admin', 'Trader'],
    organizationId: 'org-finance-dept',
    createdAt: '2022-01-01T00:00:00Z',
    lastUpdated: '2024-03-11T09:30:00Z',
    verifiableCredentials: [{ type: 'KYC-Level3', issuer: 'Regulatory Body', issuanceDate: '2022-01-05T00:00:00Z', hash: 'kyc-hash-abc' }],
    contactInfo: { email: 'john.doe@example.com' },
  },
  {
    id: 'did-agent-quantbot-001',
    name: 'QuantBot Alpha Identity',
    type: 'agent',
    publicKey: 'pk-agent-quantbot-001-def',
    status: 'active',
    roles: ['AutomatedTrader', 'Analyst'],
    organizationId: 'org-quant-strategies',
    createdAt: '2023-01-20T11:00:00Z',
    lastUpdated: '2024-03-11T09:35:00Z',
    verifiableCredentials: [{ type: 'AI-Certification', issuer: 'Internal Audit', issuanceDate: '2023-01-25T00:00:00Z', hash: 'ai-cert-hash-1' }],
    agentProfileId: 'agent-quantbot-001',
  },
  {
    id: 'did-contract-assettoken',
    name: 'Asset Tokenization Contract',
    type: 'contract',
    publicKey: 'pk-contract-assettoken-ghi',
    status: 'active',
    roles: ['TokenIssuer', 'Custodian'],
    organizationId: 'org-blockchain-services',
    createdAt: '2023-03-01T10:00:00Z',
    lastUpdated: '2024-01-01T00:00:00Z',
    verifiableCredentials: [{ type: 'SmartContractAudit', issuer: 'Security Firm', issuanceDate: '2023-03-05T00:00:00Z', hash: 'contract-audit-hash-1' }],
  },
];


export const systemsApiService = new MockSystemsApiService('http://localhost:3001/api/systems', mockSystemsData, mockLeveragePointsData);
export const simulationsApiService = new MockSimulationsApiService('http://localhost:3001/api/simulations'); // Initialize with empty data for simplicity
export const agentsApiService = new MockAgentsApiService('http://localhost:3001/api/agents', mockAgentsData, [], mockAgentsData[0].skills.concat(mockAgentsData[1].skills));
export const tokenRailApiService = new MockTokenRailApiService('http://localhost:3001/api/token-rail', mockTokenDefsData);
export const identityApiService = new MockIdentityApiService('http://localhost:3001/api/identity', mockDigitalIdentities);

// --- Component Definitions ---

/**
 * A generic loading spinner component.
 */
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
    <p className="ml-4 text-gray-600 dark:text-gray-300">Loading data...</p>
  </div>
);

/**
 * A generic error display component.
 */
const ErrorDisplay: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col justify-center items-center h-full text-red-600 dark:text-red-400">
    <p className="text-lg font-semibold">Error:</p>
    <p className="text-md mt-2 text-center">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);

/**
 * Component to display and manage a single system's parameters.
 */
interface SystemParametersManagerProps {
  system: ChaoticSystemDefinition;
  onParameterUpdate: (systemId: SystemIdentifier, parameterId: string, value: number | string | boolean) => Promise<SystemParameter>;
  isUpdating: boolean;
  onUpdateError: (message: string) => void;
}

const SystemParametersManager: React.FC<SystemParametersManagerProps> = ({
  system,
  onParameterUpdate,
  isUpdating,
  onUpdateError,
}) => {
  const [localParameters, setLocalParameters] = useState<SystemParameter[]>(system.parameters);

  useEffect(() => {
    setLocalParameters(system.parameters);
  }, [system.parameters]);

  const handleChange = useCallback((parameterId: string, value: number | string | boolean) => {
    setLocalParameters((prev) =>
      prev.map((param) => (param.id === parameterId ? { ...param, currentValue: value } : param))
    );
  }, []);

  const handleSave = useCallback(async (parameterId: string, value: number | string | boolean) => {
    try {
      await onParameterUpdate(system.id, parameterId, value);
      // State will be re-fetched and updated via the parent component after successful save
    } catch (error: any) {
      onUpdateError(`Failed to update parameter: ${error.message}`);
      // Revert local change on error
      setLocalParameters(system.parameters);
    }
  }, [system.id, system.parameters, onParameterUpdate, onUpdateError]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">System Parameters</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {localParameters.map((param) => (
          <div key={param.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
            <h4 className="font-medium text-lg text-gray-800 dark:text-gray-100">{param.name} ({param.unit})</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{param.description}</p>
            <div className="flex items-center space-x-2 mt-2">
              {param.dataType === 'number' && (
                <input
                  type="number"
                  value={Number(param.currentValue)}
                  min={param.minValue}
                  max={param.maxValue}
                  step={param.step}
                  onChange={(e) => handleChange(param.id, parseFloat(e.target.value))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  disabled={isUpdating}
                />
              )}
              {param.dataType === 'boolean' && (
                <input
                  type="checkbox"
                  checked={Boolean(param.currentValue)}
                  onChange={(e) => handleChange(param.id, e.target.checked)}
                  className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800"
                  disabled={isUpdating}
                />
              )}
              {param.dataType === 'string' && (
                <input
                  type="text"
                  value={String(param.currentValue)}
                  onChange={(e) => handleChange(param.id, e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  disabled={isUpdating}
                />
              )}
              {param.dataType === 'enum' && param.enumValues && (
                <select
                  value={String(param.currentValue)}
                  onChange={(e) => handleChange(param.id, e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  disabled={isUpdating}
                >
                  {param.enumValues.map((enumVal) => (
                    <option key={enumVal} value={enumVal}>{enumVal}</option>
                  ))}
                </select>
              )}
              <button
                onClick={() => handleSave(param.id, param.currentValue)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                disabled={isUpdating}
              >
                Save
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Security Level: <span className={`font-semibold ${param.securityLevel === 'high' ? 'text-red-500' : param.securityLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>{param.securityLevel}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Component to display a list of identified leverage points for a system.
 */
interface LeveragePointsDisplayProps {
  leveragePoints: LeveragePoint[];
  onProposeIntervention: (lpId: string, systemId: SystemIdentifier) => void;
  isLoading: boolean;
  error: string | null;
}

const LeveragePointsDisplay: React.FC<LeveragePointsDisplayProps> = ({
  leveragePoints,
  onProposeIntervention,
  isLoading,
  error,
}) => {
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;
  if (leveragePoints.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6 text-center text-gray-600 dark:text-gray-300">
        No leverage points identified for this system.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Identified Leverage Points</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {leveragePoints.map((lp) => (
          <div key={lp.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
            <h4 className="font-medium text-lg text-indigo-600 dark:text-indigo-400">{lp.action}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{lp.description}</p>
            <ul className="text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-1">
              <li><strong>Cost:</strong> {lp.cost}</li>
              <li><strong>Probability:</strong> {(lp.outcomeProbability * 100).toFixed(0)}%</li>
              <li><strong>Time to Impact:</strong> {lp.timeToImpact}</li>
              <li><strong>Impact Magnitude:</strong> {lp.impactMagnitude}</li>
              <li><strong>Risks:</strong> {lp.risks.map(r => `${r.category} (${r.severity})`).join(', ')}</li>
            </ul>
            <button
              onClick={() => onProposeIntervention(lp.id, 'current-system-id')} // Placeholder for current system ID
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Propose Intervention
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Main System Detail View component.
 * Displays information about a selected Chaotic System, including parameters and metrics.
 *
 * Business Value: This detailed view provides human operators and AI agents with
 * a comprehensive real-time dashboard for any defined chaotic system. It aggregates
 * critical data, visualizations, and intervention opportunities into a single,
 * actionable interface, enabling precise monitoring, analysis, and control over
 * complex financial and operational realities. This is fundamental for informed
 * strategic decision-making and proactive system management.
 */
interface SystemDetailViewProps {
  systemId: SystemIdentifier;
  currentUser: UserIdentifier;
  onSystemUpdated: (system: ChaoticSystemDefinition) => void;
  onLeveragePointProposed: (lpId: string, systemId: SystemIdentifier) => void;
  onError: (error: Error) => void;
}

const SystemDetailView: React.FC<SystemDetailViewProps> = ({
  systemId,
  currentUser,
  onSystemUpdated,
  onLeveragePointProposed,
  onError,
}) => {
  const [system, setSystem] = useState<ChaoticSystemDefinition | null>(null);
  const [leveragePoints, setLeveragePoints] = useState<LeveragePoint[]>([]);
  const [loadingSystem, setLoadingSystem] = useState(true);
  const [loadingLeveragePoints, setLoadingLeveragePoints] = useState(false);
  const [updatingParameter, setUpdatingParameter] = useState(false);
  const [systemError, setSystemError] = useState<string | null>(null);
  const [leveragePointsError, setLeveragePointsError] = useState<string | null>(null);
  const [parameterUpdateError, setParameterUpdateError] = useState<string | null>(null);

  const fetchSystemData = useCallback(async () => {
    setLoadingSystem(true);
    setSystemError(null);
    try {
      const fetchedSystem = await systemsApiService.getSystemById(systemId);
      setSystem(fetchedSystem);
      onSystemUpdated(fetchedSystem); // Notify parent of system update
    } catch (error: any) {
      setSystemError(`Failed to load system: ${error.message}`);
      onError(error);
    } finally {
      setLoadingSystem(false);
    }
  }, [systemId, onSystemUpdated, onError]);

  const fetchLeveragePoints = useCallback(async () => {
    setLoadingLeveragePoints(true);
    setLeveragePointsError(null);
    try {
      const fetchedLeveragePoints = await systemsApiService.identifyLeveragePoints(systemId);
      setLeveragePoints(fetchedLeveragePoints);
    } catch (error: any) {
      setLeveragePointsError(`Failed to identify leverage points: ${error.message}`);
      onError(error);
    } finally {
      setLoadingLeveragePoints(false);
    }
  }, [systemId, onError]);

  useEffect(() => {
    fetchSystemData();
    fetchLeveragePoints(); // Fetch leverage points when system changes
  }, [fetchSystemData, fetchLeveragePoints]);

  const handleParameterUpdate = useCallback(async (
    sysId: SystemIdentifier,
    paramId: string,
    value: number | string | boolean
  ) => {
    setParameterUpdateError(null);
    setUpdatingParameter(true);
    try {
      const updatedParam = await systemsApiService.updateSystemParameter(sysId, paramId, value);
      // Re-fetch system to get the updated parameter and ensure consistency
      await fetchSystemData();
      return updatedParam;
    } catch (error: any) {
      setParameterUpdateError(error.message);
      onError(error);
      throw error; // Re-throw to allow component to handle local state revert
    } finally {
      setUpdatingParameter(false);
    }
  }, [fetchSystemData, onError]);

  const handleProposeIntervention = useCallback((lpId: string) => {
    if (systemId) {
      onLeveragePointProposed(lpId, systemId);
      // In a real app, this would likely trigger a modal or a task creation flow.
      alert(`Intervention ${lpId} proposed for system ${systemId}.`);
    }
  }, [systemId, onLeveragePointProposed]);

  if (loadingSystem) {
    return <LoadingSpinner />;
  }

  if (systemError) {
    return <ErrorDisplay message={systemError} onRetry={fetchSystemData} />;
  }

  if (!system) {
    return (
      <div className="p-6 text-center text-gray-600 dark:text-gray-300">
        No system selected or data available.
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{system.name}</h2>
        <p className="text-gray-700 dark:text-gray-300">{system.description}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span><strong>ID:</strong> {system.id}</span>
          <span><strong>Status:</strong> <span className={`font-semibold ${system.status === 'Active' ? 'text-green-500' : 'text-yellow-500'}`}>{system.status}</span></span>
          <span><strong>Version:</strong> {system.modelVersion}</span>
          <span><strong>Last Modified:</strong> {new Date(system.lastModified).toLocaleString()}</span>
        </div>
      </div>

      {parameterUpdateError && <ErrorDisplay message={`Parameter update failed: ${parameterUpdateError}`} />}
      <SystemParametersManager
        system={system}
        onParameterUpdate={handleParameterUpdate}
        isUpdating={updatingParameter}
        onUpdateError={setParameterUpdateError}
      />

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">System Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {system.metrics.map((metric) => (
            <div key={metric.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <h4 className="font-medium text-lg text-gray-800 dark:text-gray-100">{metric.name} ({metric.unit})</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{metric.description}</p>
              <div className="mt-2">
                <p><strong>Current Value:</strong> <span className="font-semibold">{metric.currentValue}</span></p>
                {metric.target && (
                  <p><strong>Target:</strong> {metric.target.min !== undefined && metric.target.max !== undefined
                    ? `${metric.target.min} - ${metric.target.max}`
                    : metric.target.value !== undefined
                      ? `${metric.target.value}` : 'N/A'} {metric.target.unit}
                  </p>
                )}
                {metric.alertThresholds && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Alerts: Warning {metric.alertThresholds.warning?.operator} {metric.alertThresholds.warning?.value},
                    Critical {metric.alertThresholds.critical?.operator} {metric.alertThresholds.critical?.value}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <LeveragePointsDisplay
        leveragePoints={leveragePoints}
        onProposeIntervention={handleProposeIntervention}
        isLoading={loadingLeveragePoints}
        error={leveragePointsError}
      />

      {/* Placeholder for Simulation Controls / History */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Simulation Controls</h3>
        <p className="text-gray-700 dark:text-gray-300">
          This section would contain tools to run simulations, view historical runs, and analyze scenarios for {system.name}.
        </p>
        <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
          Run New Simulation
        </button>
        <button className="ml-4 mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
          View Simulation History
        </button>
      </div>

      {/* Placeholder for Agent Orchestration */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Agent Orchestration</h3>
        <p className="text-gray-700 dark:text-gray-300">
          This section would allow for assigning intelligent agents to monitor and manage {system.name}, as well as define automated tasks.
        </p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Assign Agent
        </button>
        <button className="ml-4 mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
          View Agent Tasks
        </button>
      </div>
    </div>
  );
};

/**
 * Sidebar component for navigating between different chaotic systems.
 *
 * Business Value: The system sidebar provides quick, intuitive navigation
 * across the entire portfolio of monitored financial and operational systems.
 * This ease of access is crucial for rapid response in dynamic environments,
 * allowing users to immediately jump to critical system contexts, thereby
 * improving situational awareness and accelerating decision cycles.
 */
interface SystemSidebarProps {
  systems: ChaoticSystemDefinition[];
  selectedSystemId: SystemIdentifier | null;
  onSelectSystem: (id: SystemIdentifier | null) => void;
  isLoading: boolean;
  error: string | null;
}

const SystemSidebar: React.FC<SystemSidebarProps> = ({
  systems,
  selectedSystemId,
  onSelectSystem,
  isLoading,
  error,
}) => {
  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Systems</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <ErrorDisplay message={error} />
      ) : (
        <ul className="space-y-2 flex-grow overflow-y-auto">
          {systems.length === 0 ? (
            <li className="text-gray-600 dark:text-gray-400 text-sm">No systems available.</li>
          ) : (
            systems.map((system) => (
              <li key={system.id}>
                <button
                  onClick={() => onSelectSystem(system.id)}
                  className={`block w-full text-left py-2 px-3 rounded-md transition-colors duration-200
                    ${selectedSystemId === system.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  <span className="font-medium">{system.name}</span>
                  <span className={`ml-2 text-xs ${selectedSystemId === system.id ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>
                    ({system.status})
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => alert('Feature: Add New System')}
          className="w-full py-2 px-3 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors duration-200 text-sm"
        >
          + Add New System
        </button>
      </div>
    </div>
  );
};

/**
 * The main Chaos Theorist View component. This orchestrates all sub-components,
 * fetches initial data, and manages global state.
 *
 * Business Value: This is the primary user interface for interacting with the
 * intelligent financial infrastructure. It integrates complex data models,
 * real-time analytics, and agentic controls into a unified, intuitive experience.
 * By providing a single pane of glass for monitoring, simulating, and intervening
 * in chaotic financial systems, it delivers immense value in risk management,
 * strategic optimization, and empowering proactive enterprise control over
 * emergent financial outcomes.
 */
export const ChaosTheoristView: React.FC<ChaosTheoristViewProps> = (props) => {
  return (
    <ApplicationProvider {...props}>
      <ChaosTheoristViewInternal />
    </ApplicationProvider>
  );
};

// Internal component to consume context
const ChaosTheoristViewInternal: React.FC = () => {
  const { state, dispatch, serviceConfig, currentUser, accessibleSystems, onInterventionSuccess, onError } = useApplication();
  const { selectedSystemId, systems, isLoading, globalError, userPreferences } = state;

  const toggleDarkMode = useCallback(() => {
    dispatch({ type: 'SET_USER_PREFERENCE', payload: { key: 'darkMode', value: !userPreferences.darkMode } });
    document.documentElement.classList.toggle('dark', !userPreferences.darkMode);
  }, [dispatch, userPreferences.darkMode]);

  // Initial data fetching
  useEffect(() => {
    const fetchInitialData = async () => {
      dispatch({ type: 'SET_LOADING', payload: { key: 'systems', value: true } });
      dispatch({ type: 'SET_GLOBAL_ERROR', payload: null });
      try {
        const fetchedSystems = await systemsApiService.getSystems();
        // Filter systems based on accessibleSystems prop
        const userAccessibleSystems = fetchedSystems.filter(sys => accessibleSystems.includes(sys.id));
        dispatch({ type: 'SET_SYSTEMS', payload: userAccessibleSystems });
        if (props.initialSystemId && userAccessibleSystems.some(s => s.id === props.initialSystemId)) {
          dispatch({ type: 'SET_SELECTED_SYSTEM', payload: props.initialSystemId });
        } else if (userAccessibleSystems.length > 0) {
          dispatch({ type: 'SET_SELECTED_SYSTEM', payload: userAccessibleSystems[0].id });
        }
      } catch (error: any) {
        dispatch({ type: 'SET_GLOBAL_ERROR', payload: `Failed to load initial systems: ${error.message}` });
        onError?.(error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { key: 'systems', value: false } });
      }
    };
    fetchInitialData();
  }, [dispatch, accessibleSystems, onError]);

  const handleSelectSystem = useCallback((id: SystemIdentifier | null) => {
    dispatch({ type: 'SET_SELECTED_SYSTEM', payload: id });
  }, [dispatch]);

  const handleSystemUpdated = useCallback((updatedSystem: ChaoticSystemDefinition) => {
    dispatch({ type: 'UPDATE_SYSTEM', payload: updatedSystem });
  }, [dispatch]);

  const handleLeveragePointProposed = useCallback((lpId: string, systemId: SystemIdentifier) => {
    onInterventionSuccess?.(lpId, systemId);
    // Potentially trigger a modal for task creation or confirmation here
  }, [onInterventionSuccess]);

  const handleGlobalError = useCallback((error: Error) => {
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: error.message });
    onError?.(error);
  }, [dispatch, onError]);

  // Apply dark mode preference on mount
  useEffect(() => {
    if (userPreferences.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userPreferences.darkMode]);

  return (
    <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 ${userPreferences.darkMode ? 'dark' : ''}`}>
      <SystemSidebar
        systems={systems}
        selectedSystemId={selectedSystemId}
        onSelectSystem={handleSelectSystem}
        isLoading={isLoading.systems}
        error={globalError}
      />
      <div className="flex-1 overflow-auto">
        <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chaos Theorist View</h1>
          <div className="flex items-center space-x-4">
            <button onClick={toggleDarkMode} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              {userPreferences.darkMode ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h1M3 12H2m8.05-9.14a4.997 4.997 0 00-7.07 7.07A4.997 4.997 0 0014.14 8.05 4.997 4.997 0 008.05 2.86zM7 7l-1 1M17 7l1 1M7 17l-1-1M17 17l1-1"></path></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              )}
            </button>
            <span className="text-gray-700 dark:text-gray-300">Welcome, {currentUser}</span>
            <button
              onClick={() => alert('Logout action')}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="p-4">
          {globalError && <ErrorDisplay message={globalError} onRetry={() => { /* Reload systems */ }} />}
          {isLoading.systems && <LoadingSpinner />}
          {selectedSystemId && !isLoading.systems && (
            <SystemDetailView
              systemId={selectedSystemId}
              currentUser={currentUser}
              onSystemUpdated={handleSystemUpdated}
              onLeveragePointProposed={handleLeveragePointProposed}
              onError={handleGlobalError}
            />
          )}
          {!selectedSystemId && !isLoading.systems && !globalError && (
            <div className="text-center p-8 text-gray-600 dark:text-gray-300">
              Please select a system from the sidebar to begin analysis.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
