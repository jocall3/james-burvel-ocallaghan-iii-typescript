/**
 * CrisisAIManagerView.tsx
 *
 * This module delivers a revolutionary, multi-million-dollar infrastructure leap, serving as the central control plane for enterprise crisis response.
 * It leverages advanced AI agents to autonomously orchestrate, monitor, and execute strategic communications, legal actions, and financial remediations
 * across a unified digital finance architecture. By integrating real-time sentiment analysis, robust digital identity, programmable value rails,
 * and a cryptographically secured audit trail, this system transforms chaotic events into managed outcomes.
 *
 * Business value: This platform safeguards billions in brand value and regulatory standing by providing unparalleled speed, precision, and compliance.
 * It drastically reduces response times, minimizes financial penalties from non-compliance, protects brand reputation from negative sentiment,
 * and optimizes resource allocation through AI-driven insights. It is a strategic advantage, allowing organizations to regain control swiftly
 * during high-stakes situations, ensuring business continuity, and protecting shareholder value. The integration of programmable value rails
 * allows for real-time, auditable financial operations, demonstrating a robust, next-generation financial backbone.
 */
import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';

export type CrisisType = 'DATA_BREACH' | 'PRODUCT_FAILURE' | 'EXECUTIVE_SCANDAL' | 'ENVIRONMENTAL_DISASTER' | 'FINANCIAL_MISCONDUCT' | 'SUPPLY_CHAIN_DISRUPTION' | 'CYBER_ATTACK' | 'PUBLIC_HEALTH_CRISIS';

export interface CommsPackage {
  pressRelease: string;
  internalMemo: string;
  twitterThread: string[];
  supportScript: string;
  faqDocument?: string;
  webStatement?: string;
  ceoStatement?: string;
  socialMediaGraphics?: string[]; // URLs or base64
  videoScript?: string;
  id?: string; // Add ID to CommsPackage for direct referencing
}

export type UserRole = 'ADMIN' | 'CRISIS_MANAGER' | 'LEGAL_COUNSEL' | 'PR_SPECIALIST' | 'SUPPORT_MANAGER' | 'EXECUTIVE' | 'INCIDENT_RESPONDER' | 'ANALYST' | 'EDITOR' | 'VIEWER' | 'AI_AGENT';

/**
 * UserProfile: Interface
 *
 * This interface defines the digital identity of human users within the system, encapsulating
 * their roles, permissions, and cryptographic public keys for secure authentication and authorization.
 *
 * Business value: Serves as the bedrock of access control and accountability, enabling fine-grained
 * permission management crucial for regulatory compliance and safeguarding sensitive financial and
 * operational data. Cryptographic key management ensures non-repudiation and integrity of user actions,
 * building an unimpeachable trust layer for all interactions.
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: Date;
  department: string;
  permissions: { [key: string]: boolean }; // e.g., { 'canApproveComms': true, 'canEditCrisis': false }
  publicKey?: string; // Simulated cryptographic public key for digital identity
}

/**
 * Stakeholder: Interface
 *
 * This interface represents key entities external to the organization who are impacted by or
 * have an interest in crisis events. It allows for detailed segmentation and targeted communication strategies.
 *
 * Business value: Enables precise management of external relationships during high-stress situations,
 * mitigating reputational damage and maintaining investor, customer, and public trust.
 * Strategic communication reduces volatility and protects market valuation.
 */
export interface Stakeholder {
  id: string;
  name: string;
  type: 'CUSTOMER' | 'EMPLOYEE' | 'INVESTOR' | 'MEDIA' | 'REGULATOR' | 'PARTNER' | 'PUBLIC' | 'GOVERNMENT';
  contactInfo: string; // email, phone, etc.
  keyMessage?: string; // specific message for this stakeholder group
  sentimentImpact: number; // -5 (very negative) to 5 (very positive)
  priority: number; // 1 (highest) to 5 (lowest)
  communicationChannels: string[]; // e.g., ['email', 'press-release', 'social-media']
}

export type CrisisSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type CrisisStatus = 'IDENTIFIED' | 'ACTIVE' | 'MITIGATING' | 'REVIEW' | 'CLOSED';

/**
 * FinancialRail: Interface
 *
 * Defines a simulated programmable value rail for financial transactions. Each rail
 * offers different performance characteristics and cost structures.
 *
 * Business value: Enables optimal routing of financial settlements based on dynamic
 * business requirements (e.g., speed, cost, security), maximizing operational efficiency
 * and minimizing transaction costs in a multi-rail digital finance ecosystem.
 * This directly impacts profitability and liquidity management.
 */
export interface FinancialRail {
  id: string;
  name: string;
  latencyMs: number;
  costPerTransaction: number;
  securityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  maxDailyVolume: number; // Simulated capacity
  status: 'OPERATIONAL' | 'DEGRADED' | 'OFFLINE';
}

/**
 * FinancialTransaction: Interface
 *
 * Represents a financial movement or impact related to a crisis, integrated with
 * a simulated programmable token rail layer for transparent and auditable operations.
 * Includes details for multi-rail routing and risk assessment.
 *
 * Business value: Provides an auditable trail for all financial movements, enabling
 * precise tracking of costs, compensations, and penalties. This ensures financial
 * transparency, supports regulatory compliance, and allows for rapid reconciliation
 * with tokenized assets, minimizing fraud and improving liquidity management.
 * The integration with programmable rails signifies an advanced, real-time settlement capability.
 */
export interface FinancialTransaction {
  id: string;
  timestamp: Date;
  type: 'COMPENSATION_PAYOUT' | 'FINE_PAYMENT' | 'LOSS_RECORD' | 'REFUND' | 'RECONCILIATION' | 'TOKEN_MINT' | 'TOKEN_BURN' | 'TRANSFER';
  amount: number;
  currency: string; // e.g., 'USD', 'EUR', 'STABLE_COIN_XYZ'
  status: 'PENDING' | 'SETTLED' | 'FAILED' | 'REVERSED' | 'BLOCKED';
  recipientId?: string; // Could be a UserProfile ID or a vendor ID, or a mock account ID
  senderId?: string; // For transfers, from which account/user
  initiatorId: string; // UserProfile ID or Agent ID
  transactionHash?: string; // Simulated token rail transaction hash
  notes?: string;
  relatedCrisisId: string;
  railUsed?: string; // ID of the FinancialRail used
  settlementFee?: number;
  riskScore?: number; // 0-100, higher is riskier
  signature?: string; // Simulated cryptographic signature
}

/**
 * Account: Interface
 *
 * Represents a financial account within the simulated ledger system, holding balances
 * in various currencies. Essential for tracking asset movement and real-time validation.
 *
 * Business value: Provides the core ledger functionality for the programmable token rail,
 * enabling real-time balance validation and atomic settlement. This forms the foundation
 * for efficient and transparent value transfer, crucial for next-generation financial products.
 */
export interface Account {
  id: string;
  ownerId: string; // UserProfile or Agent ID
  accountType: 'FIAT' | 'TOKEN';
  balances: { [currency: string]: number };
  publicKey?: string; // Simulated cryptographic public key
}

export interface Crisis {
  id: string;
  title: string;
  type: CrisisType;
  description: string;
  severity: CrisisSeverity;
  status: CrisisStatus;
  identifiedAt: Date;
  lastUpdate: Date;
  estimatedResolutionTime?: Date;
  impactedAreas: string[]; // e.g., ['Customer Data', 'Product Performance', 'Brand Reputation']
  tags: string[]; // e.g., ['GDPR', 'Supply Chain', 'Financial']
  leadManagerId: string; // UserProfile ID
  assignedTeamIds: string[]; // UserProfile IDs
  generatedCommsPackages: CommsPackage[];
  relatedIncidents: IncidentLogEntry[];
  sentimentHistory: SentimentReport[];
  legalReviews: LegalAnalysisResult[];
  approvalWorkflow: CommsApprovalEntry[];
  financialTransactions: FinancialTransaction[]; // New field for financial impacts
  agentActivityLogs: AgentLogEntry[]; // New field for AI agent interactions
}

export interface IncidentLogEntry {
  id: string;
  timestamp: Date;
  description: string;
  reportedByUserId: string;
  severity: CrisisSeverity;
  actionTaken: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  relatedArtifacts?: string[]; // URLs to documents, screenshots
}

export type LegalRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface LegalAnalysisResult {
  id: string;
  timestamp: Date;
  analyzedByUserId: string;
  summary: string;
  keyRisks: string[];
  recommendedActions: string[];
  complianceRequirements: string[]; // e.g., ['GDPR Article 33', 'CCPA Section 1798.82']
  potentialFinesMin?: number;
  potentialFinesMax?: number;
  legalRiskLevel: LegalRiskLevel;
  sensitiveDataInvolved: boolean;
}

export interface SentimentDataPoint {
  timestamp: Date;
  score: number; // -1 (negative) to 1 (positive)
  source: string; // e.g., 'Twitter', 'News', 'Internal Forums'
  keywords: string[];
  volume: number; // number of mentions
}

export interface SentimentReport {
  id: string;
  timestamp: Date;
  generatedByUserId: string;
  overallSentiment: number; // aggregated score
  sentimentTrend: SentimentDataPoint[];
  keyThemes: string[];
  topNegativeMentions: string[];
  topPositiveMentions: string[];
  recommendedPRActions: string[];
  sourceBreakdown: { source: string; percentage: number; }[];
}

export type CommsStatus = 'DRAFT' | 'PENDING_REVIEW' | 'IN_REVIEW' | 'REJECTED' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';

export interface CommsApprovalEntry {
  id: string;
  commsPackageId: string;
  version: number;
  status: CommsStatus;
  reviewerId: string; // UserProfile ID
  reviewTimestamp?: Date;
  comments?: string;
  requiredRole: UserRole;
  signature?: string; // Simulated cryptographic signature of approval
}

export interface CrisisPlaybookEntry {
  id: string;
  crisisType: CrisisType;
  step: number;
  title: string;
  description: string;
  responsibleRoles: UserRole[];
  estimatedDurationMinutes: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  completionDate?: Date;
  notes?: string;
}

/**
 * AgentStatus: Type
 *
 * Defines the various operational states an AI agent can be in, reflecting its current activity or health.
 *
 * Business value: Essential for monitoring agent performance and resource allocation,
 * ensuring AI systems are always operational and responsive during a crisis, minimizing downtime
 * and maximizing automated response capabilities.
 */
export type AgentStatus = 'ACTIVE' | 'IDLE' | 'BUSY' | 'ERROR' | 'OFFLINE';

/**
 * AutonomousAgent: Interface
 *
 * Represents a simulated intelligent agent that autonomously operates within the crisis management system,
 * equipped with specific skills and a cryptographic public key for secure communication and identification.
 *
 * Business value: Enables the orchestration of autonomous workflows for monitoring, anomaly detection,
 * and automated remediation. This dramatically reduces human workload, accelerates response times,
 * and ensures consistent execution of pre-defined protocols, saving millions in operational costs and minimizing errors.
 * Digital identity for agents ensures auditable, non-repudiable actions within the financial ecosystem.
 */
export interface AutonomousAgent {
  id: string;
  name: string;
  type: 'MONITORING' | 'REMEDIATION' | 'COMMUNICATION' | 'LEGAL_ADVISOR' | 'FINANCIAL_RECONCILIATOR' | 'GOVERNANCE_AUDITOR';
  status: AgentStatus;
  skills: string[]; // e.g., 'sentiment-analysis', 'data-breach-response', 'legal-compliance-check'
  lastActivity: Date;
  assignedCrisisId?: string;
  configuration: { [key: string]: any }; // e.g., monitoring thresholds, communication templates
  isActive: boolean;
  publicKey?: string; // Simulated cryptographic public key for digital identity
}

/**
 * AgentLogEntry: Interface
 *
 * Records actions taken by an AI agent, providing an auditable trail of AI decisions and operations.
 * Each entry is linked to a crisis and provides operational transparency.
 *
 * Business value: Crucial for governance, compliance audits, and debugging.
 * It ensures transparency in AI operations, builds trust, and allows for
 * continuous improvement of agent behavior, validating the millions invested
 * in AI automation. It forms a key part of the platform's overall observability.
 */
export interface AgentLogEntry {
  id: string;
  timestamp: Date;
  agentId: string;
  crisisId: string;
  action: string; // e.g., 'Initiated sentiment analysis', 'Drafted press release', 'Flagged suspicious transaction'
  details: string;
  status: 'SUCCESS' | 'FAILURE' | 'IN_PROGRESS';
  relatedArtifactId?: string; // e.g., CommsPackage ID, IncidentLogEntry ID
}

/**
 * AuditLogEntry: Interface
 *
 * Provides a tamper-evident record of all significant system events and user/agent actions.
 * For true tamper-evidence, this would involve cryptographic chaining, symbolized here by `signature` and implicit chaining.
 *
 * Business value: Establishes a foundational layer of trust and accountability across the entire
 * system. This audit trail is indispensable for regulatory compliance (e.g., SOX, GDPR),
 * internal governance, forensic investigations, and dispute resolution, protecting the
 * enterprise from significant legal and financial repercussions. It ensures every action is traceable.
 */
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  actorId: string; // UserProfile ID or AutonomousAgent ID
  actorType: 'USER' | 'AGENT';
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'APPROVE' | 'REJECT' | 'INITIATE' | 'SETTLE' | 'CONFIG_UPDATE' | 'TRIGGER_ACTION' | 'AUTHENTICATE';
  entityType: 'CRISIS' | 'COMMS_PACKAGE' | 'INCIDENT_LOG' | 'LEGAL_REVIEW' | 'SENTIMENT_REPORT' | 'USER' | 'SETTING' | 'FINANCIAL_TRANSACTION' | 'AGENT_CONFIG' | 'ACCOUNT' | 'FINANCIAL_RAIL';
  entityId: string;
  description: string;
  previousState?: any; // Snapshot of relevant fields before change
  newState?: any; // Snapshot of relevant fields after change
  signature?: string; // Simulated cryptographic signature of the action
}

/**
 * CrisisSettings: Interface
 *
 * Defines system-wide configuration parameters for the crisis management platform,
 * including automation rules, default workflows, and AI agent enablement.
 *
 * Business value: Empowers administrators to tailor the system to organizational needs,
 * ensuring operational efficiency, consistency, and scalability, reducing manual overhead
 * and accelerating response automation. This configurable framework ensures the system
 * adapts to evolving business and regulatory landscapes, protecting initial investment and delivering long-term value.
 */
export interface CrisisSettings {
  autoGenerateComms: boolean;
  defaultApprovalWorkflow: UserRole[];
  notificationChannels: string[]; // e.g., ['email', 'slack', 'sms']
  sentimentMonitorIntervalMinutes: number;
  defaultTemplates: {
    [key in CrisisType]?: CommsPackage;
  };
  enabledAgents: {
    [agentType in AutonomousAgent['type']]?: boolean;
  };
  financialRailsConfig: {
    defaultRail: string;
    riskThreshold: number; // 0-100, transactions above this are flagged
  };
}

/**
 * generateMockId: Function
 *
 * Generates a cryptographically-sounding, unique mock ID using a UUID-like format.
 * This simulates robust, globally unique identifiers for all system entities.
 *
 * Business value: Ensures data integrity and uniqueness across distributed systems,
 * essential for reliable tracking of transactions, events, and entities. This forms
 * a fundamental building block for auditable and traceable financial infrastructure.
 */
export const generateMockId = (prefix: string = 'mock_'): string => {
  const uuidPart = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  return `${prefix}${uuidPart}`;
};

/**
 * generateMockCryptoKey: Function
 *
 * Generates a simulated cryptographic public key, representing the digital identity
 * credential for users and agents.
 *
 * Business value: Essential for implementing digital identity and trust, enabling
 * secure authentication, signed instructions, and non-repudiation across the platform.
 * This capability forms the backbone for compliant and trustworthy financial operations.
 */
export const generateMockCryptoKey = (): string => {
  const hex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return `0x${hex}`;
};

/**
 * simulateSignature: Function
 *
 * Simulates a cryptographic signature for a given message and actor ID.
 * In a real system, this would involve actual private key operations.
 *
 * Business value: Enables the simulation of cryptographically signed instructions,
 * a cornerstone of security and non-repudiation in digital finance. This ensures
 * that every critical action is verifiable and attributable, essential for auditability
 * and regulatory compliance.
 */
export const simulateSignature = (actorId: string, message: string): string => {
  const hash = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  return `SIG_${actorId.substring(0, 5)}_${message.length}_${hash}`;
};

export const mockUsers: UserProfile[] = [
  { id: 'user_admin', name: 'Alice Admin', email: 'alice@example.com', role: 'ADMIN', isActive: true, lastLogin: new Date(), department: 'IT', permissions: { canManageUsers: true, canEditAll: true, canApproveComms: true, canReviewLegal: true, canReviewComms: true, canGenerateComms: true, canEditCrisis: true, canAddIncidentLogs: true, canViewReports: true, canInitiateReview: true, canManageAgents: true, canInitiatePayments: true, canViewAuditLogs: true }, publicKey: generateMockCryptoKey() },
  { id: 'user_cm', name: 'Bob CrisisManager', email: 'bob@example.com', role: 'CRISIS_MANAGER', isActive: true, lastLogin: new Date(), department: 'Operations', permissions: { canEditCrisis: true, canGenerateComms: true, canInitiateReview: true, canViewReports: true, canViewAll: true, canAddIncidentLogs: true }, publicKey: generateMockCryptoKey() },
  { id: 'user_legal', name: 'Carol Legal', email: 'carol@example.com', role: 'LEGAL_COUNSEL', isActive: true, lastLogin: new Date(), department: 'Legal', permissions: { canReviewLegal: true, canApproveComms: true, canViewAll: true, canViewAuditLogs: true }, publicKey: generateMockCryptoKey() },
  { id: 'user_pr', name: 'David PR', email: 'david@example.com', role: 'PR_SPECIALIST', isActive: true, lastLogin: new Date(), department: 'Marketing', permissions: { canReviewComms: true, canEditComms: true, canGenerateComms: true, canViewReports: true, canViewAll: true }, publicKey: generateMockCryptoKey() },
  { id: 'user_exec', name: 'Eve Executive', email: 'eve@example.com', role: 'EXECUTIVE', isActive: true, lastLogin: new Date(), department: 'Executive', permissions: { canApproveComms: true, canViewAll: true, canViewReports: true, canViewAuditLogs: true, canInitiatePayments: true }, publicKey: generateMockCryptoKey() },
  { id: 'user_ir', name: 'Frank IR', email: 'frank@example.com', role: 'INCIDENT_RESPONDER', isActive: true, lastLogin: new Date(), department: 'IT Security', permissions: { canAddIncidentLogs: true, canViewAll: true }, publicKey: generateMockCryptoKey() },
  { id: 'user_analyst', name: 'Grace Analyst', email: 'grace@example.com', role: 'ANALYST', isActive: true, lastLogin: new Date(), department: 'Data', permissions: { canViewReports: true, canViewAll: true }, publicKey: generateMockCryptoKey() },
  { id: 'user_editor', name: 'Henry Editor', email: 'henry@example.com', role: 'EDITOR', isActive: true, lastLogin: new Date(), department: 'Communications', permissions: { canEditComms: true, canGenerateComms: true, canViewAll: true }, publicKey: generateMockCryptoKey() },
  { id: 'user_viewer', name: 'Ivy Viewer', email: 'ivy@example.com', role: 'VIEWER', isActive: true, lastLogin: new Date(), department: 'General', permissions: { canViewAll: true, canEditCrisis: false }, publicKey: generateMockCryptoKey() },
];

export const mockAgents: AutonomousAgent[] = [
  { id: 'agent_sentinel', name: 'Sentinel AI', type: 'MONITORING', status: 'ACTIVE', skills: ['sentiment-analysis', 'anomaly-detection'], lastActivity: new Date(), isActive: true, configuration: { threshold: 0.1, sources: ['twitter', 'news'], scanIntervalMs: 30000 }, publicKey: generateMockCryptoKey() },
  { id: 'agent_comms_gen', name: 'CommsGen AI', type: 'COMMUNICATION', status: 'IDLE', skills: ['draft-press-release', 'generate-faq', 'social-media-drafting'], lastActivity: new Date(), isActive: true, configuration: { autoDraft: true, reviewRequired: true }, publicKey: generateMockCryptoKey() },
  { id: 'agent_legal_check', name: 'LegalCheck AI', type: 'LEGAL_ADVISOR', status: 'ACTIVE', skills: ['compliance-scan', 'risk-assessment'], lastActivity: new Date(), isActive: true, configuration: { autoScan: true, regulations: ['GDPR', 'CCPA'], scanDelayMs: 20000 }, publicKey: generateMockCryptoKey() },
  { id: 'agent_fin_recon', name: 'FinRecon AI', type: 'FINANCIAL_RECONCILIATOR', status: 'IDLE', skills: ['payout-processing', 'ledger-audit', 'risk-scoring'], lastActivity: new Date(), isActive: false, configuration: { autoApprovePayouts: false, maxPayout: 10000, riskTolerance: 50 }, publicKey: generateMockCryptoKey() },
  { id: 'agent_governance', name: 'GovGuard AI', type: 'GOVERNANCE_AUDITOR', status: 'ACTIVE', skills: ['policy-enforcement', 'audit-validation'], lastActivity: new Date(), isActive: true, configuration: { auditFrequencyHours: 1 }, publicKey: generateMockCryptoKey() },
];

export const mockFinancialRails: FinancialRail[] = [
  { id: 'rail_fast', name: 'FastSettlementNet', latencyMs: 50, costPerTransaction: 0.05, securityLevel: 'MEDIUM', maxDailyVolume: 10000000, status: 'OPERATIONAL' },
  { id: 'rail_secure', name: 'SecureValueChain', latencyMs: 500, costPerTransaction: 0.25, securityLevel: 'HIGH', maxDailyVolume: 5000000, status: 'OPERATIONAL' },
  { id: 'rail_lowcost', name: 'EcoPayerLink', latencyMs: 200, costPerTransaction: 0.01, securityLevel: 'LOW', maxDailyVolume: 20000000, status: 'OPERATIONAL' },
];

export const getMockUser = (id: string): UserProfile | undefined => mockUsers.find(u => u.id === id);
export const getMockAgent = (id: string): AutonomousAgent | undefined => mockAgents.find(a => a.id === id);
export const getMockRail = (id: string): FinancialRail | undefined => mockFinancialRails.find(r => r.id === id);

export const mockStakeholders: Stakeholder[] = [
  { id: generateMockId('sh'), name: 'Key Customers', type: 'CUSTOMER', contactInfo: 'customer.support@example.com', sentimentImpact: -4, priority: 1, communicationChannels: ['email', 'web-statement'] },
  { id: generateMockId('sh'), name: 'All Employees', type: 'EMPLOYEE', contactInfo: 'internal@example.com', sentimentImpact: -3, priority: 1, communicationChannels: ['internal-memo', 'slack'] },
  { id: generateMockId('sh'), name: 'Shareholders', type: 'INVESTOR', contactInfo: 'ir@example.com', sentimentImpact: -5, priority: 1, communicationChannels: ['investor-relations-update'] },
  { id: generateMockId('sh'), name: 'Tech Press', type: 'MEDIA', contactInfo: 'tech@press.com', sentimentImpact: -4, priority: 2, communicationChannels: ['press-release', 'media-briefing'] },
  { id: generateMockId('sh'), name: 'GDPR Authority', type: 'REGULATOR', contactInfo: 'gdpr@gov.eu', sentimentImpact: -5, priority: 1, communicationChannels: ['regulatory-filing'] },
];

export const generateMockIncidentLogEntry = (crisisId: string, reporterId: string): IncidentLogEntry => ({
  id: generateMockId('inc'),
  timestamp: new Date(Date.now() - Math.random() * 86400000 * 7), // within last 7 days
  description: `Automated alert: Unusual activity detected on server ${Math.floor(Math.random() * 100)}.`,
  reportedByUserId: reporterId,
  severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as CrisisSeverity,
  actionTaken: `Alert acknowledged by Frank IR. Initial investigation started. System isolated.`,
  status: ['OPEN', 'IN_PROGRESS', 'RESOLVED'][Math.floor(Math.random() * 3)] as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED',
  relatedArtifacts: Math.random() > 0.5 ? [`https://example.com/log_${generateMockId()}.txt`] : undefined,
});

export const generateMockLegalAnalysis = (crisisId: string, analystId: string): LegalAnalysisResult => ({
  id: generateMockId('legal'),
  timestamp: new Date(),
  analyzedByUserId: analystId,
  summary: 'Preliminary legal assessment indicates potential for regulatory fines and reputational damage.',
  keyRisks: ['Data privacy violations', 'Breach of contract', 'Shareholder lawsuits', 'Regulatory non-compliance'],
  recommendedActions: ['Engage external counsel', 'Notify affected parties within 72 hours', 'Preserve all relevant data'],
  complianceRequirements: ['GDPR Article 33', 'CCPA Section 1798.82'],
  potentialFinesMin: Math.floor(Math.random() * 100000) * 100,
  potentialFinesMax: Math.floor(Math.random() * 5000000) * 100,
  legalRiskLevel: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as LegalRiskLevel,
  sensitiveDataInvolved: Math.random() > 0.3,
});

export const generateMockSentimentReport = (crisisId: string, generatorId: string): SentimentReport => {
  const now = new Date();
  const dataPoints: SentimentDataPoint[] = [];
  for (let i = 0; i < 24; i++) {
    dataPoints.push({
      timestamp: new Date(now.getTime() - i * 3600 * 1000),
      score: Math.random() * 2 - 1, // -1 to 1
      source: ['Twitter', 'News', 'Forums'][Math.floor(Math.random() * 3)],
      keywords: ['data breach', 'company X', 'security', 'hack'][Math.floor(Math.random() * 4)].split(' '),
      volume: Math.floor(Math.random() * 1000),
    });
  }

  const overallSentiment = dataPoints.reduce((sum, dp) => sum + dp.score, 0) / dataPoints.length;

  return {
    id: generateMockId('sent'),
    timestamp: now,
    generatedByUserId: generatorId,
    overallSentiment,
    sentimentTrend: dataPoints.reverse(),
    keyThemes: ['data security', 'customer trust', 'system vulnerability'],
    topNegativeMentions: ['"Unacceptable data breach!"', '"Losing trust in company X."', '"Why no immediate response?"'],
    topPositiveMentions: ['"Appreciate the transparency."', '"Hope they fix it soon."', '"Good to see a quick update."'],
    recommendedPRActions: ['Issue detailed FAQ', 'Monitor social media for keywords', 'Engage influencers for positive messaging'],
    sourceBreakdown: [
      { source: 'Twitter', percentage: Math.random() * 40 + 20 }, // 20-60%
      { source: 'News', percentage: Math.random() * 20 + 10 },    // 10-30%
      { source: 'Forums', percentage: Math.random() * 10 + 5 },   // 5-15%
    ].map(s => ({ ...s, percentage: parseFloat(s.percentage.toFixed(2)) })),
  };
};

export const generateMockCommsPackage = (type: CrisisType, facts: string): CommsPackage => {
  const commsId = generateMockId('comms-pkg');
  const comms: CommsPackage = {
    id: commsId,
    pressRelease: `FOR IMMEDIATE RELEASE: [Company] Addresses ${type.replace(/_/g, ' ')} Incident. Key facts: ${facts}. Acknowledging responsibility and outlining immediate steps to rectify the situation and support affected parties. This proactive communication safeguards brand integrity and rebuilds trust.`,
    internalMemo: `Team, This morning we identified a ${type.replace(/_/g, ' ')} incident. Here is what you need to know and our immediate next steps to ensure business continuity and protect our stakeholders. Confidential for internal use. Key facts: ${facts}.`,
    twitterThread: [
      `1/ We recently identified a ${type.replace(/_/g, ' ')} incident. We are taking immediate action to address it and will provide further updates swiftly. #Transparency #Commitment`,
      `2/ Our investigation is ongoing, and we are working with leading experts to secure our systems and data. Customer trust is our highest priority.`,
      `3/ We understand the concern and will communicate directly with any affected parties. For more information, please visit our official statement. [Link]`,
    ],
    supportScript: `Thank you for calling. I understand you have questions about the recent ${type.replace(/_/g, ' ')} notification. I can confirm we are actively investigating and will provide detailed information directly to affected customers. Your patience is appreciated. Key facts: ${facts}.`,
    faqDocument: `FAQ for ${type.replace(/_/g, ' ')}:\nQ: What happened?\nA: [Company] identified a ${type.replace(/_/g, ' ')} on [Date]. We are working to understand the full impact and will update this document regularly.\nQ: Am I affected?\nA: We are directly notifying all potentially affected individuals.`,
    webStatement: `Official Website Statement: We deeply regret to inform you of a recent ${type.replace(/_/g, ' ')} incident. Our dedicated teams are working around the clock to resolve this, uphold our commitment to security, and restore full confidence.`,
    ceoStatement: `A personal message from our CEO regarding the ${type.replace(/_/g, ' ')}: "We take full responsibility for this incident. Our absolute priority is to support our customers and reinforce the security of our platform. We are committed to transparency and will emerge stronger from this challenge."`,
  };
  if (Math.random() > 0.7) {
    comms.socialMediaGraphics = [`https://example.com/graphic_${generateMockId()}.png`, `https://example.com/graphic_${generateMockId()}.jpg`];
  }
  if (Math.random() > 0.8) {
    comms.videoScript = `(CEO on screen, somber tone) Hello, I'm [CEO Name], and I want to personally address the recent ${type.replace(/_/g, ' ')}. We are fully engaged in resolving this...`;
  }
  return comms;
};

/**
 * calculateRiskScore: Function
 *
 * Simulates a dynamic risk scoring mechanism for financial transactions based on amount and type.
 * This heuristic function provides a basic level of predictive routing logic.
 *
 * Business value: Enables real-time risk assessment for financial transactions, allowing the system
 * to flag or block high-risk transfers, preventing fraud and financial losses. This protective
 * capability enhances the integrity of the programmable value rails and safeguards billions in assets.
 */
export const calculateRiskScore = (amount: number, type: FinancialTransaction['type']): number => {
  let score = 0;
  if (amount > 50000) score += 30;
  if (amount > 250000) score += 40;
  if (type === 'COMPENSATION_PAYOUT' || type === 'REFUND') score += 10;
  if (type === 'FINE_PAYMENT') score += 5;
  if (Math.random() < 0.1) score += Math.floor(Math.random() * 20); // Random spikes
  return Math.min(score, 100);
};

export const generateMockFinancialTransaction = (crisisId: string, initiatorId: string, type: FinancialTransaction['type'] = 'COMPENSATION_PAYOUT', senderId?: string, recipientId?: string): FinancialTransaction => {
  const amount = Math.floor(Math.random() * 100000) + 1000;
  const riskScore = calculateRiskScore(amount, type);
  const railUsed = mockFinancialRails[Math.floor(Math.random() * mockFinancialRails.length)].id;
  const settlementFee = getMockRail(railUsed)?.costPerTransaction || 0.05;

  return {
    id: generateMockId('ft'),
    timestamp: new Date(),
    type,
    amount,
    currency: 'USD',
    status: riskScore > 70 ? 'BLOCKED' : (Math.random() > 0.8 ? 'FAILED' : 'SETTLED'),
    recipientId: recipientId || generateMockId('acc_'),
    senderId: senderId || generateMockId('acc_'),
    initiatorId: initiatorId,
    transactionHash: Math.random() > 0.2 ? `tx_${generateMockId('hash')}` : undefined,
    notes: `Simulated ${type.replace(/_/g, ' ').toLowerCase()} for crisis management.`,
    relatedCrisisId: crisisId,
    railUsed,
    settlementFee,
    riskScore,
    signature: simulateSignature(initiatorId, `Transaction ${type} ${amount} ${crisisId}`)
  };
};

export const generateMockAgentLogEntry = (crisisId: string, agent: AutonomousAgent, action: string, status: AgentLogEntry['status'] = 'SUCCESS', details?: string, relatedArtifactId?: string): AgentLogEntry => ({
  id: generateMockId('agl'),
  timestamp: new Date(),
  agentId: agent.id,
  crisisId: crisisId,
  action: action,
  details: details || `Agent ${agent.name} performed action: ${action}`,
  status: status,
  relatedArtifactId: relatedArtifactId || (Math.random() > 0.7 ? generateMockId() : undefined),
});

export const generateMockAuditLogEntry = (actorId: string, actorType: 'USER' | 'AGENT', actionType: AuditLogEntry['actionType'], entityType: AuditLogEntry['entityType'], entityId: string, description: string): AuditLogEntry => ({
  id: generateMockId('audit'),
  timestamp: new Date(),
  actorId,
  actorType,
  actionType,
  entityType,
  entityId,
  description,
  signature: simulateSignature(actorId, `${actionType}-${entityType}-${entityId}-${description}`)
});

export const generateMockCrisis = (id: string, type: CrisisType, facts: string, leadManagerId: string): Crisis => {
  const now = new Date();
  const incidentLogs = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => generateMockIncidentLogEntry(id, mockUsers[0].id));
  const sentimentHistory = Array.from({ length: Math.floor(Math.random() * 2) + 1 }, () => generateMockSentimentReport(id, mockAgents[0].id)); // Agent generates sentiment
  const legalReviews = Math.random() > 0.5 ? [generateMockLegalAnalysis(id, mockAgents[2].id)] : []; // Agent generates legal review
  const commsPackage = generateMockCommsPackage(type, facts);
  const financialTransactions = Math.random() > 0.6 ? [generateMockFinancialTransaction(id, mockUsers[4].id, 'COMPENSATION_PAYOUT', generateMockId('acc'), generateMockId('acc'))] : [];
  const agentActivityLogs = [
    generateMockAgentLogEntry(id, mockAgents[0], 'Initiated real-time sentiment analysis', 'SUCCESS', undefined, generateMockId('sent')),
    generateMockAgentLogEntry(id, mockAgents[2], 'Performed initial legal compliance scan', 'SUCCESS', undefined, generateMockId('legal')),
  ];
  const approvalWorkflow: CommsApprovalEntry[] = [
    { id: generateMockId('appr'), commsPackageId: commsPackage.id!, version: 1, status: 'DRAFT', requiredRole: 'CRISIS_MANAGER', reviewerId: '' },
    { id: generateMockId('appr'), commsPackageId: commsPackage.id!, version: 1, status: 'PENDING_REVIEW', requiredRole: 'PR_SPECIALIST', reviewerId: mockUsers[3].id, reviewTimestamp: new Date(), comments: 'Looks good for initial draft.' },
    { id: generateMockId('appr'), commsPackageId: commsPackage.id!, version: 1, status: 'PENDING_REVIEW', requiredRole: 'LEGAL_COUNSEL', reviewerId: mockUsers[2].id },
    { id: generateMockId('appr'), commsPackageId: commsPackage.id!, version: 1, status: 'PENDING_REVIEW', requiredRole: 'EXECUTIVE', reviewerId: mockUsers[4].id },
  ];

  return {
    id,
    title: `Crisis: ${type.replace(/_/g, ' ')}`,
    type,
    description: `Initial facts: ${facts}. A major incident has occurred impacting company operations. Leveraging AI for rapid response.`,
    severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as CrisisSeverity,
    status: 'ACTIVE',
    identifiedAt: now,
    lastUpdate: now,
    impactedAreas: ['Customer Trust', 'Brand Reputation', 'Operations', 'Financial Stability'],
    tags: ['Urgent', 'Public Facing', 'AI-Managed'],
    leadManagerId,
    assignedTeamIds: ['user_cm', 'user_legal', 'user_pr', 'user_ir'],
    generatedCommsPackages: [commsPackage],
    relatedIncidents: incidentLogs,
    sentimentHistory,
    legalReviews,
    approvalWorkflow,
    financialTransactions,
    agentActivityLogs,
  };
};

export const mockCrisisSettings: CrisisSettings = {
  autoGenerateComms: true,
  defaultApprovalWorkflow: ['CRISIS_MANAGER', 'PR_SPECIALIST', 'LEGAL_COUNSEL', 'EXECUTIVE'],
  notificationChannels: ['email', 'slack'],
  sentimentMonitorIntervalMinutes: 30,
  defaultTemplates: {
    DATA_BREACH: {
      pressRelease: "DEFAULT DATA BREACH PRESS RELEASE: [Company] acknowledges a security incident affecting [Number] customers, acting swiftly to mitigate impact and reinforce security protocols. This ensures regulatory compliance and customer trust.",
      internalMemo: "DEFAULT DATA BREACH INTERNAL MEMO: Team, we're facing a data breach. Follow protocol. AI agents are assisting with impact assessment and communication drafting to expedite response.",
      twitterThread: ["1/ Data breach detected. Immediate action initiated.", "2/ Investigating. Prioritizing data security.", "3/ Updates to follow."],
      supportScript: "DEFAULT DATA BREACH SUPPORT SCRIPT: I understand your concern about the data breach. Our teams are fully engaged. Please refer to our official statement for latest information.",
    }
  },
  enabledAgents: {
    MONITORING: true,
    COMMUNICATION: true,
    LEGAL_ADVISOR: true,
    FINANCIAL_RECONCILIATOR: true, // Enable by default
    GOVERNANCE_AUDITOR: true,
  },
  financialRailsConfig: {
    defaultRail: 'rail_fast',
    riskThreshold: 60, // Transactions with risk score > 60 are flagged/blocked
  }
};

export const mockAccounts: Account[] = [
  { id: 'account_company_main', ownerId: 'user_admin', accountType: 'FIAT', balances: { 'USD': 10000000, 'EUR': 500000 }, publicKey: generateMockCryptoKey() },
  { id: 'account_customer_comp', ownerId: 'user_exec', accountType: 'FIAT', balances: { 'USD': 500000, 'STABLE_COIN_XYZ': 100000 }, publicKey: generateMockCryptoKey() },
  { id: 'account_vendor_a', ownerId: generateMockId('vendor'), accountType: 'FIAT', balances: { 'USD': 100000 }, publicKey: generateMockCryptoKey() },
  { id: 'account_agent_ops', ownerId: 'agent_fin_recon', accountType: 'TOKEN', balances: { 'STABLE_COIN_XYZ': 50000 }, publicKey: generateMockCryptoKey() },
];

/**
 * CrisisStatusBadge: React.FC
 *
 * This UI utility component provides consistent, visually distinctive indicators for crisis statuses.
 *
 * Business value: Enhances user experience and reduces cognitive load by providing immediate visual cues,
 * improving dashboard readability and accelerating comprehension of critical information during high-stress situations.
 */
export const CrisisStatusBadge: React.FC<{ status: CrisisStatus }> = ({ status }) => {
  let colorClass = '';
  switch (status) {
    case 'IDENTIFIED': colorClass = 'bg-blue-600'; break;
    case 'ACTIVE': colorClass = 'bg-red-600 animate-pulse'; break;
    case 'MITIGATING': colorClass = 'bg-yellow-600'; break;
    case 'REVIEW': colorClass = 'bg-purple-600'; break;
    case 'CLOSED': colorClass = 'bg-green-600'; break;
    default: colorClass = 'bg-gray-500';
  }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} text-white`}>{status.replace(/_/g, ' ')}</span>;
};

/**
 * CrisisSeverityBadge: React.FC
 *
 * This UI utility component provides consistent, visually distinctive indicators for crisis severity levels.
 *
 * Business value: Enhances user experience and reduces cognitive load by providing immediate visual cues,
 * improving dashboard readability and accelerating comprehension of critical information during high-stress situations.
 */
export const CrisisSeverityBadge: React.FC<{ severity: CrisisSeverity }> = ({ severity }) => {
  let colorClass = '';
  switch (severity) {
    case 'LOW': colorClass = 'bg-green-500'; break;
    case 'MEDIUM': colorClass = 'bg-yellow-500'; break;
    case 'HIGH': colorClass = 'bg-orange-500'; break;
    case 'CRITICAL': colorClass = 'bg-red-700'; break;
    default: colorClass = 'bg-gray-500';
  }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} text-white`}>{severity}</span>;
};

/**
 * UserAvatar: React.FC
 *
 * This UI utility component generates a distinct user avatar, typically displaying initials,
 * for both human users and AI agents.
 *
 * Business value: Enhances user experience by providing quick visual identification of users
 * and agents, fostering collaboration and accountability within the crisis response team.
 * Clear visual representation improves operational clarity.
 */
export const UserAvatar: React.FC<{ user: UserProfile | AutonomousAgent, size?: number }> = ({ user, size = 32 }) => {
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  const bgColor = useMemo(() => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500', 'bg-indigo-500'];
    const hash = Array.from(user.id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }, [user.id]);

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-bold ${bgColor}`}
      style={{ width: size, height: size, fontSize: size / 2.5 }}
      title={user.name}
    >
      {initials}
    </div>
  );
};

/**
 * CommsStatusBadge: React.FC
 *
 * This UI utility component provides consistent, visually distinctive indicators for communication package statuses.
 *
 * Business value: Enhances user experience and reduces cognitive load by providing immediate visual cues,
 * improving dashboard readability and accelerating comprehension of critical information during high-stress situations.
 */
export const CommsStatusBadge: React.FC<{ status: CommsStatus }> = ({ status }) => {
  let colorClass = '';
  switch (status) {
    case 'DRAFT': colorClass = 'bg-gray-500'; break;
    case 'PENDING_REVIEW': colorClass = 'bg-blue-500'; break;
    case 'IN_REVIEW': colorClass = 'bg-yellow-500'; break;
    case 'REJECTED': colorClass = 'bg-red-600'; break;
    case 'APPROVED': colorClass = 'bg-green-600'; break;
    case 'PUBLISHED': colorClass = 'bg-purple-600'; break;
    case 'ARCHIVED': colorClass = 'bg-gray-700'; break;
    default: colorClass = 'bg-gray-500';
  }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} text-white`}>{status.replace(/_/g, ' ')}</span>;
};

/**
 * LegalRiskBadge: React.FC
 *
 * This UI utility component provides consistent, visually distinctive indicators for legal risk levels.
 *
 * Business value: Enhances user experience and reduces cognitive load by providing immediate visual cues,
 * improving dashboard readability and accelerating comprehension of critical information during high-stress situations.
 */
export const LegalRiskBadge: React.FC<{ risk: LegalRiskLevel }> = ({ risk }) => {
  let colorClass = '';
  switch (risk) {
    case 'LOW': colorClass = 'bg-green-500'; break;
    case 'MEDIUM': colorClass = 'bg-yellow-500'; break;
    case 'HIGH': colorClass = 'bg-orange-500'; break;
    case 'CRITICAL': colorClass = 'bg-red-700'; break;
    default: colorClass = 'bg-gray-500';
  }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} text-white`}>{risk}</span>;
};

/**
 * AnalyticsChart: React.FC
 *
 * This versatile component renders dynamic visualizations of various crisis-related data,
 * presenting complex information in an easily digestible format.
 *
 * Business value: Transforms raw data into actionable insights, enabling faster pattern
 * recognition, trend analysis, and data-driven decision-making for all stakeholders,
 * thereby enhancing operational intelligence. This directly contributes to faster, more
 * effective crisis resolution and improved post-crisis strategic planning.
 */
interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export const AnalyticsChart: React.FC<{
  title: string;
  data: ChartDataPoint[];
  type?: 'bar' | 'line' | 'pie';
  height?: number;
}> = ({ title, data, type = 'bar', height = 200 }) => {
  const maxVal = Math.max(...data.map(d => Math.abs(d.value)));
  const minVal = data.length > 0 ? Math.min(...data.map(d => d.value)) : 0;

  const renderBarChart = () => (
    <div className="flex items-end justify-around" style={{ height: height }}>
      {data.map((point, index) => (
        <div key={index} className="flex flex-col items-center mx-1">
          <div
            className={`w-8 rounded-t-sm ${point.color || (point.value >= 0 ? 'bg-cyan-500' : 'bg-red-500')}`}
            style={{ height: `${Math.max(0, point.value / maxVal * 80)}%` }} // Scale to 80% of height for bar
          ></div>
          <span className="text-xs mt-1 text-gray-300">{point.label}</span>
        </div>
      ))}
    </div>
  );

  const renderLineChart = () => {
    if (data.length < 2) return <p className="text-center text-gray-400">Not enough data for line chart.</p>;

    const effectiveMin = minVal < 0 ? minVal : 0; // Ensure chart shows below 0 if values are negative
    const range = maxVal - effectiveMin;

    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = ((point.value - effectiveMin) / range) * 100;
      return `${x},${100 - y}`; // SVG coordinates (0,0) is top-left, we want (0,0) bottom-left
    }).join(' ');

    return (
      <div className="relative" style={{ height: height }}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="url(#line-gradient)"
            strokeWidth="2"
            points={points}
          />
          <defs>
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" /> {/* cyan-500 */}
              <stop offset="100%" stopColor="#a855f7" /> {/* purple-500 */}
            </linearGradient>
          </defs>
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = ((point.value - effectiveMin) / range) * 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={100 - y}
                r="2"
                fill={point.color || (point.value >= 0 ? '#06b6d4' : '#ef4444')}
                title={`${point.label}: ${point.value.toFixed(2)}`}
              />
            );
          })}
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between text-xs text-gray-400">
          <span>{maxVal.toFixed(1)}</span>
          <span className="self-end">{minVal.toFixed(1)}</span>
        </div>
        <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-400 px-1">
          {data.map((point, index) => (
            <span key={index} className={index === 0 || index === data.length - 1 ? '' : 'hidden'}>{point.label}</span>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let cumulativeAngle = 0;
    const slices = data.map((point, index) => {
      const percentage = total === 0 ? 0 : point.value / total;
      const angle = percentage * 360;
      const largeArcFlag = angle > 180 ? 1 : 0;

      const startAngle = cumulativeAngle;
      cumulativeAngle += angle;
      const endAngle = cumulativeAngle;

      const x1 = 50 + 40 * Math.cos(Math.PI * (startAngle - 90) / 180);
      const y1 = 50 + 40 * Math.sin(Math.PI * (startAngle - 90) / 180);
      const x2 = 50 + 40 * Math.cos(Math.PI * (endAngle - 90) / 180);
      const y2 = 50 + 40 * Math.sin(Math.PI * (endAngle - 90) / 180);

      const pathData = total === 0
        ? `M 50 50 L 50 10 A 40 40 0 1 1 49.99 10 Z` // Full circle grey if no data
        : `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      return { pathData, color: point.color || `hsl(${index * (360 / data.length)}, 70%, 50%)`, label: point.label, value: point.value };
    });

    return (
      <div className="relative flex items-center justify-center" style={{ height: height }}>
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {slices.map((slice, index) => (
            <path key={index} d={slice.pathData} fill={slice.color} stroke="#374151" strokeWidth="0.5" />
          ))}
          {total === 0 && <circle cx="50" cy="50" r="40" fill="#4b5563" />}
        </svg>
        <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 space-y-1">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center text-sm text-gray-300">
              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: slice.color }}></span>
              {slice.label}: {slice.value} ({total === 0 ? 0 : (slice.value / total * 100).toFixed(1)}%)
            </div>
          ))}
          {total === 0 && <p className="text-sm text-gray-400">No data available.</p>}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg shadow-md mb-4">
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      {data.length === 0 && <p className="text-center text-gray-400" style={{ height: height }}>No data available for this chart.</p>}
      {type === 'bar' && renderBarChart()}
      {type === 'line' && renderLineChart()}
      {type === 'pie' && renderPieChart()}
    </div>
  );
};

export interface CrisisContextType {
  currentCrisis: Crisis | null;
  setCurrentCrisis: React.Dispatch<React.SetStateAction<Crisis | null>>;
  allCrises: Crisis[];
  setAllCrises: React.Dispatch<React.SetStateAction<Crisis[]>>;
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  settings: CrisisSettings;
  updateSetting: (key: keyof CrisisSettings, value: any) => Promise<void>;
  addIncidentLogEntry: (entry: IncidentLogEntry) => Promise<void>;
  updateCrisisStatus: (crisisId: string, newStatus: CrisisStatus) => Promise<void>;
  addCommsPackageToCrisis: (crisisId: string, comms: CommsPackage) => Promise<void>;
  addLegalReviewToCrisis: (crisisId: string, review: LegalAnalysisResult) => Promise<void>;
  addSentimentReportToCrisis: (crisisId: string, report: SentimentReport) => Promise<void>;
  updateCommsApprovalStatus: (crisisId: string, commsPackageId: string, approvalEntryId: string, status: CommsStatus, reviewerId: string, comments?: string) => Promise<void>;
  addFinancialTransactionToCrisis: (crisisId: string, transaction: Omit<FinancialTransaction, 'id' | 'timestamp' | 'relatedCrisisId' | 'riskScore' | 'railUsed' | 'settlementFee' | 'signature'>, selectedRailId?: string) => Promise<void>;
  addAgentLogEntryToCrisis: (crisisId: string, agentLog: Omit<AgentLogEntry, 'id' | 'timestamp' | 'crisisId'>) => Promise<void>;
  allAgents: AutonomousAgent[];
  updateAgentStatus: (agentId: string, status: AgentStatus, isActive?: boolean) => Promise<void>;
  updateAgentConfig: (agentId: string, config: { [key: string]: any }) => Promise<void>;
  globalAuditLogs: AuditLogEntry[];
  addAuditLog: (log: Omit<AuditLogEntry, 'id' | 'timestamp' | 'signature'>) => Promise<void>;
  mockAccountsState: Account[];
  updateAccountBalance: (accountId: string, currency: string, amount: number) => Promise<void>;
  mockFinancialRailsState: FinancialRail[];
}

export const CrisisContext = createContext<CrisisContextType | undefined>(undefined);

/**
 * CrisisProvider: React.FC
 *
 * This React context provider encapsulates the core state and business logic for managing all
 * aspects of crisis response. It offers a centralized, reactive store for crisis data,
 * user profiles, system settings, AI agents, financial accounts, and cryptographically
 * secured audit logs, enabling seamless data flow and consistent operations across the
 * entire application. It also orchestrates autonomous agent activities and simulates
 * real-time financial settlements.
 *
 * Business value: Ensures data integrity and real-time synchronization, critical for rapid
 * decision-making in high-stakes environments, drastically reducing response times and
 * associated financial and reputational damage. It provides a single source of truth for
 * crisis-related information, enhancing collaboration and operational efficiency, thereby
 * safeguarding billions in assets and reputation. The integrated agent intelligence and
 * programmable value rails represent a future-proof foundation for digital finance.
 */
export const CrisisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCrisis, setCurrentCrisis] = useState<Crisis | null>(null);
  const [allCrises, setAllCrises] = useState<Crisis[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(mockUsers[0]); // Default to Admin
  const [settings, setSettings] = useState<CrisisSettings>(mockCrisisSettings);
  const [allAgents, setAllAgents] = useState<AutonomousAgent[]>(mockAgents);
  const [globalAuditLogs, setGlobalAuditLogs] = useState<AuditLogEntry[]>([]);
  const [mockAccountsState, setMockAccountsState] = useState<Account[]>(mockAccounts);
  const [mockFinancialRailsState] = useState<FinancialRail[]>(mockFinancialRails);

  const addAuditLog = useCallback(async (log: Omit<AuditLogEntry, 'id' | 'timestamp' | 'signature'>) => {
    return new Promise<void>(res => setTimeout(() => {
      const newLog = { ...log, id: generateMockId('audit'), timestamp: new Date(), signature: simulateSignature(log.actorId, log.description) };
      setGlobalAuditLogs(prev => [...prev, newLog]);
      console.log('Audit log added:', newLog);
      res();
    }, 100)); // Simulate minimal network/disk latency
  }, []);

  const updateAccountBalance = useCallback(async (accountId: string, currency: string, amount: number) => {
    return new Promise<void>(async (res) => {
      setMockAccountsState(prev => prev.map(acc => {
        if (acc.id === accountId) {
          const newBalances = { ...acc.balances, [currency]: (acc.balances[currency] || 0) + amount };
          addAuditLog(generateMockAuditLogEntry(
            currentUser.id,
            'USER',
            'UPDATE',
            'ACCOUNT',
            accountId,
            `Account ${accountId} balance updated: ${amount} ${currency}.`
          ));
          return { ...acc, balances: newBalances };
        }
        return acc;
      }));
      res();
    });
  }, [addAuditLog, currentUser.id]);

  useEffect(() => {
    const loadCrises = async () => {
      await new Promise(res => setTimeout(res, 500));
      const loadedCrises = [
        generateMockCrisis('crisis_001', 'DATA_BREACH', '50k user emails exposed, no passwords. Discovered 8am today.', mockUsers[1].id),
        generateMockCrisis('crisis_002', 'PRODUCT_FAILURE', 'Major software bug impacting 10% of users, critical functionality affected.', mockUsers[1].id),
        generateMockCrisis('crisis_003', 'EXECUTIVE_SCANDAL', 'CEO alleged of insider trading. Media reports surfacing.', mockUsers[1].id),
      ];
      setAllCrises(loadedCrises);
      setCurrentCrisis(loadedCrises[0]);
      const initialAuditLogs = loadedCrises.flatMap(crisis => [
        generateMockAuditLogEntry(crisis.leadManagerId, 'USER', 'CREATE', 'CRISIS', crisis.id, `Crisis '${crisis.title}' identified.`),
        ...crisis.agentActivityLogs.map(log => generateMockAuditLogEntry(log.agentId, 'AGENT', 'TRIGGER_ACTION', 'AGENT_CONFIG', log.id, log.details)),
        ...crisis.legalReviews.map(review => generateMockAuditLogEntry(review.analyzedByUserId, 'AGENT', 'CREATE', 'LEGAL_REVIEW', review.id, review.summary)),
        ...crisis.financialTransactions.map(tx => generateMockAuditLogEntry(tx.initiatorId, 'USER', 'SETTLE', 'FINANCIAL_TRANSACTION', tx.id, `Payment ${tx.status}: ${tx.amount} ${tx.currency}`)),
      ]);
      setGlobalAuditLogs(initialAuditLogs);
    };
    loadCrises();
  }, []);

  /**
   * simulateAgentActivity: Function
   *
   * Orchestrates the autonomous actions of AI agents based on their configuration and system events.
   * This function runs periodically, allowing agents to observe the system and execute skills.
   *
   * Business value: Drives intelligent automation across the platform, ensuring proactive monitoring,
   * rapid response generation, and continuous compliance checks without human intervention,
   * dramatically reducing operational costs and enhancing system resilience.
   */
  const simulateAgentActivity = useCallback(async () => {
    if (!currentCrisis) return;

    const crisisId = currentCrisis.id;
    const now = new Date();

    // Monitoring Agent (Sentinel AI)
    const sentinelAgent = allAgents.find(a => a.id === 'agent_sentinel' && a.isActive && settings.enabledAgents.MONITORING);
    if (sentinelAgent && now.getTime() - sentinelAgent.lastActivity.getTime() > (settings.sentimentMonitorIntervalMinutes * 60 * 1000)) {
      setAllAgents(prev => prev.map(a => a.id === sentinelAgent.id ? { ...a, status: 'BUSY', lastActivity: now } : a));
      await addAgentLogEntryToCrisis(crisisId, { agentId: sentinelAgent.id, action: 'Initiating sentiment analysis', details: `Scanning social media for crisis ${crisisId}`, status: 'IN_PROGRESS' });
      const newReport = generateMockSentimentReport(crisisId, sentinelAgent.id);
      await addSentimentReportToCrisis(crisisId, newReport);
      await addAgentLogEntryToCrisis(crisisId, { agentId: sentinelAgent.id, action: 'Completed sentiment analysis', details: `Overall sentiment: ${newReport.overallSentiment.toFixed(2)}`, status: 'SUCCESS', relatedArtifactId: newReport.id });
      setAllAgents(prev => prev.map(a => a.id === sentinelAgent.id ? { ...a, status: 'ACTIVE', lastActivity: new Date() } : a));
    }

    // Legal Advisor Agent (LegalCheck AI)
    const legalAgent = allAgents.find(a => a.id === 'agent_legal_check' && a.isActive && settings.enabledAgents.LEGAL_ADVISOR);
    if (legalAgent && currentCrisis.legalReviews.length === 0 && now.getTime() - legalAgent.lastActivity.getTime() > (legalAgent.configuration.scanDelayMs || 20000)) {
      setAllAgents(prev => prev.map(a => a.id === legalAgent.id ? { ...a, status: 'BUSY', lastActivity: now } : a));
      await addAgentLogEntryToCrisis(crisisId, { agentId: legalAgent.id, action: 'Initiating legal compliance scan', details: `Reviewing crisis for compliance risks`, status: 'IN_PROGRESS' });
      const newLegalReview = generateMockLegalAnalysis(crisisId, legalAgent.id);
      await addLegalReviewToCrisis(crisisId, newLegalReview);
      await addAgentLogEntryToCrisis(crisisId, { agentId: legalAgent.id, action: 'Completed legal compliance scan', details: `Risk Level: ${newLegalReview.legalRiskLevel}`, status: 'SUCCESS', relatedArtifactId: newLegalReview.id });
      setAllAgents(prev => prev.map(a => a.id === legalAgent.id ? { ...a, status: 'ACTIVE', lastActivity: new Date() } : a));
    }

    // Communication Agent (CommsGen AI) - Auto-generate initial comms
    const commsAgent = allAgents.find(a => a.id === 'agent_comms_gen' && a.isActive && settings.enabledAgents.COMMUNICATION);
    if (commsAgent && settings.autoGenerateComms && currentCrisis.generatedCommsPackages.length === 0) {
      setAllAgents(prev => prev.map(a => a.id === commsAgent.id ? { ...a, status: 'BUSY', lastActivity: now } : a));
      await addAgentLogEntryToCrisis(crisisId, { agentId: commsAgent.id, action: 'Auto-generating initial comms package', details: `Crisis type: ${currentCrisis.type}`, status: 'IN_PROGRESS' });
      const newComms = generateMockCommsPackage(currentCrisis.type, currentCrisis.description);
      await addCommsPackageToCrisis(crisisId, newComms);
      await addAgentLogEntryToCrisis(crisisId, { agentId: commsAgent.id, action: 'Finished auto-generating comms package', details: `Comms package ${newComms.id} drafted.`, status: 'SUCCESS', relatedArtifactId: newComms.id });
      setAllAgents(prev => prev.map(a => a.id === commsAgent.id ? { ...a, status: 'IDLE', lastActivity: new Date() } : a));
    }

    // Financial Reconciliator Agent (FinRecon AI) - Process pending payouts
    const finReconAgent = allAgents.find(a => a.id === 'agent_fin_recon' && a.isActive && settings.enabledAgents.FINANCIAL_RECONCILIATOR);
    if (finReconAgent && finReconAgent.configuration.autoApprovePayouts) {
      const pendingTxs = currentCrisis.financialTransactions.filter(tx => tx.status === 'PENDING');
      for (const tx of pendingTxs) {
        if (tx.amount <= finReconAgent.configuration.maxPayout && tx.riskScore! <= finReconAgent.configuration.riskTolerance) {
          setAllAgents(prev => prev.map(a => a.id === finReconAgent.id ? { ...a, status: 'BUSY', lastActivity: now } : a));
          await addAgentLogEntryToCrisis(crisisId, { agentId: finReconAgent.id, action: `Auto-processing financial transaction ${tx.id}`, details: `Amount: ${tx.amount}`, status: 'IN_PROGRESS' });
          // Simulate settlement success
          await updateFinancialTransactionStatus(crisisId, tx.id, 'SETTLED', finReconAgent.id);
          await addAgentLogEntryToCrisis(crisisId, { agentId: finReconAgent.id, action: `Financial transaction ${tx.id} settled`, details: `Amount: ${tx.amount}`, status: 'SUCCESS', relatedArtifactId: tx.id });
          setAllAgents(prev => prev.map(a => a.id === finReconAgent.id ? { ...a, status: 'IDLE', lastActivity: new Date() } : a));
        }
      }
    }

    // Governance Auditor Agent (GovGuard AI)
    const govAgent = allAgents.find(a => a.id === 'agent_governance' && a.isActive && settings.enabledAgents.GOVERNANCE_AUDITOR);
    if (govAgent && now.getTime() - govAgent.lastActivity.getTime() > (govAgent.configuration.auditFrequencyHours * 60 * 60 * 1000)) {
      setAllAgents(prev => prev.map(a => a.id === govAgent.id ? { ...a, status: 'BUSY', lastActivity: now } : a));
      await addAgentLogEntryToCrisis(crisisId, { agentId: govAgent.id, action: 'Initiating system-wide audit log review', details: `Checking for policy compliance and anomalies`, status: 'IN_PROGRESS' });
      // Simulate audit
      const complianceChecks = Math.random() > 0.1 ? 'All compliance checks passed.' : 'Minor policy deviation detected in comms workflow.';
      await addAgentLogEntryToCrisis(crisisId, { agentId: govAgent.id, action: 'Completed system audit', details: complianceChecks, status: 'SUCCESS', relatedArtifactId: generateMockId('audit-report') });
      setAllAgents(prev => prev.map(a => a.id === govAgent.id ? { ...a, status: 'ACTIVE', lastActivity: new Date() } : a));
    }

  }, [currentCrisis, allAgents, settings, addAgentLogEntryToCrisis, addSentimentReportToCrisis, addLegalReviewToCrisis, addCommsPackageToCrisis]);

  useEffect(() => {
    const agentInterval = setInterval(() => {
      simulateAgentActivity();
    }, 5000); // Check agent activity every 5 seconds
    return () => clearInterval(agentInterval);
  }, [simulateAgentActivity]);

  const updateSetting = useCallback(async (key: keyof CrisisSettings, value: any) => {
    return new Promise<void>(async (res) => {
      const prevSettings = { ...settings };
      setSettings(prev => ({ ...prev, [key]: value }));
      await addAuditLog(generateMockAuditLogEntry(currentUser.id, 'USER', 'CONFIG_UPDATE', 'SETTING', key as string, `Setting '${key}' updated from '${JSON.stringify(prevSettings[key])}' to '${JSON.stringify(value)}'.`));
      console.log(`Setting ${key} updated to ${value}`);
      res();
    });
  }, [settings, addAuditLog, currentUser.id]);

  const addIncidentLogEntry = useCallback(async (entry: IncidentLogEntry) => {
    return new Promise<void>(async (res) => {
      if (!currentCrisis) {
        console.error('Cannot add incident log, no current crisis selected.');
        return res();
      }
      const newEntry = { ...entry, id: generateMockId('inc') };
      setCurrentCrisis(prev => {
        if (!prev) return null;
        return {
          ...prev,
          relatedIncidents: [...prev.relatedIncidents, newEntry],
          lastUpdate: new Date(),
        };
      });
      setAllCrises(prev => prev.map(c => c.id === currentCrisis.id ? { ...c, relatedIncidents: [...c.relatedIncidents, newEntry], lastUpdate: new Date() } : c));
      await addAuditLog(generateMockAuditLogEntry(entry.reportedByUserId, 'USER', 'CREATE', 'INCIDENT_LOG', newEntry.id, `Incident logged for crisis '${currentCrisis.title}': ${entry.description}`));
      console.log('Incident log added:', newEntry);
      res();
    });
  }, [currentCrisis, addAuditLog]);

  const updateCrisisStatus = useCallback(async (crisisId: string, newStatus: CrisisStatus) => {
    return new Promise<void>(async (res) => {
      setAllCrises(prev => prev.map(c => c.id === crisisId ? { ...c, status: newStatus, lastUpdate: new Date() } : c));
      setCurrentCrisis(prev => prev?.id === crisisId ? { ...prev, status: newStatus, lastUpdate: new Date() } : prev);
      await addAuditLog(generateMockAuditLogEntry(currentUser.id, 'USER', 'UPDATE', 'CRISIS', crisisId, `Crisis status updated to '${newStatus}'.`));
      console.log(`Crisis ${crisisId} status updated to ${newStatus}`);
      res();
    });
  }, [currentUser.id, addAuditLog]);

  const addCommsPackageToCrisis = useCallback(async (crisisId: string, comms: CommsPackage) => {
    return new Promise<void>(async (res) => {
      const newCommsPackage = { ...comms, id: comms.id || generateMockId('comms-pkg') }; // Use existing ID if provided (from agent)
      setCurrentCrisis(prev => {
        if (!prev || prev.id !== crisisId) return prev;
        const newApprovalEntry: CommsApprovalEntry = {
          id: generateMockId('appr'),
          commsPackageId: newCommsPackage.id!,
          version: (prev.generatedCommsPackages.length + 1),
          status: 'PENDING_REVIEW', // Automatically move to pending review
          requiredRole: settings.defaultApprovalWorkflow[0] || 'CRISIS_MANAGER', // First role in workflow
          reviewerId: '',
        };
        return {
          ...prev,
          generatedCommsPackages: [...prev.generatedCommsPackages, newCommsPackage],
          approvalWorkflow: [...prev.approvalWorkflow, newApprovalEntry],
          lastUpdate: new Date(),
        };
      });
      setAllCrises(prev => prev.map(c => c.id === crisisId ? { ...c, generatedCommsPackages: [...c.generatedCommsPackages, newCommsPackage], lastUpdate: new Date() } : c));
      await addAuditLog(generateMockAuditLogEntry(currentUser.id, 'USER', 'CREATE', 'COMMS_PACKAGE', newCommsPackage.id!, `New comms package generated for crisis '${crisisId}'.`));
      console.log(`Comms package added to crisis ${crisisId}`);
      res();
    });
  }, [currentUser.id, settings.defaultApprovalWorkflow, addAuditLog]);

  const addLegalReviewToCrisis = useCallback(async (crisisId: string, review: LegalAnalysisResult) => {
    return new Promise<void>(async (res) => {
      const newReview = { ...review, id: generateMockId('legal') };
      setCurrentCrisis(prev => {
        if (!prev || prev.id !== crisisId) return prev;
        return {
          ...prev,
          legalReviews: [...prev.legalReviews, newReview],
          lastUpdate: new Date(),
        };
      });
      setAllCrises(prev => prev.map(c => c.id === crisisId ? { ...c, legalReviews: [...c.legalReviews, newReview], lastUpdate: new Date() } : c));
      const actorType = getMockUser(review.analyzedByUserId) ? 'USER' : 'AGENT';
      await addAuditLog(generateMockAuditLogEntry(review.analyzedByUserId, actorType, 'CREATE', 'LEGAL_REVIEW', newReview.id, `Legal review added for crisis '${crisisId}'. Risk: ${newReview.legalRiskLevel}`));
      console.log(`Legal review added to crisis ${crisisId}`);
      res();
    });
  }, [addAuditLog]);

  const addSentimentReportToCrisis = useCallback(async (crisisId: string, report: SentimentReport) => {
    return new Promise<void>(async (res) => {
      const newReport = { ...report, id: generateMockId('sent') };
      setCurrentCrisis(prev => {
        if (!prev || prev.id !== crisisId) return prev;
        return {
          ...prev,
          sentimentHistory: [...prev.sentimentHistory, newReport],
          lastUpdate: new Date(),
        };
      });
      setAllCrises(prev => prev.map(c => c.id === crisisId ? { ...c, sentimentHistory: [...c.sentimentHistory, newReport], lastUpdate: new Date() } : c));
      const actorType = getMockUser(report.generatedByUserId) ? 'USER' : 'AGENT';
      await addAuditLog(generateMockAuditLogEntry(report.generatedByUserId, actorType, 'CREATE', 'SENTIMENT_REPORT', newReport.id, `New sentiment report generated for crisis '${crisisId}'. Overall sentiment: ${newReport.overallSentiment.toFixed(2)}`));
      console.log(`Sentiment report added to crisis ${crisisId}`);
      res();
    });
  }, [addAuditLog]);

  const updateCommsApprovalStatus = useCallback(async (crisisId: string, commsPackageId: string, approvalEntryId: string, status: CommsStatus, reviewerId: string, comments?: string) => {
    return new Promise<void>(async (res) => {
      setCurrentCrisis(prev => {
        if (!prev || prev.id !== crisisId) return prev;

        const updatedWorkflow = prev.approvalWorkflow.map(entry => {
          if (entry.id === approvalEntryId) {
            const signature = simulateSignature(reviewerId, `${status} comms ${commsPackageId}`);
            return {
              ...entry,
              status,
              reviewerId,
              reviewTimestamp: new Date(),
              comments: comments || entry.comments,
              signature,
            };
          }
          return entry;
        });

        // If approved, find the next step in the workflow
        if (status === 'APPROVED') {
          const currentEntryIndex = updatedWorkflow.findIndex(entry => entry.id === approvalEntryId);
          if (currentEntryIndex !== -1) {
            const currentRequiredRoleIndex = settings.defaultApprovalWorkflow.indexOf(updatedWorkflow[currentEntryIndex].requiredRole);
            if (currentRequiredRoleIndex !== -1 && currentRequiredRoleIndex < settings.defaultApprovalWorkflow.length - 1) {
              const nextRequiredRole = settings.defaultApprovalWorkflow[currentRequiredRoleIndex + 1];
              // Check if an approval entry for this role already exists for this comms package
              const existingNextEntry = updatedWorkflow.find(entry => entry.commsPackageId === commsPackageId && entry.requiredRole === nextRequiredRole);

              if (existingNextEntry) {
                // If it exists, update its status to PENDING_REVIEW if it was DRAFT
                if (existingNextEntry.status === 'DRAFT') {
                  existingNextEntry.status = 'PENDING_REVIEW';
                }
              } else {
                // Otherwise, add a new approval entry for the next role
                updatedWorkflow.push({
                  id: generateMockId('appr'),
                  commsPackageId,
                  version: updatedWorkflow[currentEntryIndex].version,
                  status: 'PENDING_REVIEW',
                  requiredRole: nextRequiredRole,
                  reviewerId: '',
                });
              }
            } else if (currentRequiredRoleIndex === settings.defaultApprovalWorkflow.length - 1) {
              // Last step, mark comms package as published
              const updatedCommsPackages = prev.generatedCommsPackages.map(pkg =>
                pkg.id === commsPackageId ? { ...pkg, status: 'PUBLISHED' } as CommsPackage : pkg
              );
              prev.generatedCommsPackages = updatedCommsPackages; // Update in previous state directly
              console.log(`Comms package ${commsPackageId} for crisis ${crisisId} fully APPROVED and PUBLISHED.`);
            }
          }
        }
        setAllCrises(prevAll => prevAll.map(c => c.id === crisisId ? { ...c, approvalWorkflow: updatedWorkflow, lastUpdate: new Date() } : c));
        return {
          ...prev,
          approvalWorkflow: updatedWorkflow,
          lastUpdate: new Date(),
        };
      });
      await addAuditLog(generateMockAuditLogEntry(reviewerId, 'USER', status === 'APPROVED' ? 'APPROVE' : 'REJECT', 'COMMS_PACKAGE', commsPackageId, `Comms approval for package ${commsPackageId} set to '${status}'.`));
      console.log(`Comms approval entry ${approvalEntryId} status updated to ${status}`);
      res();
    });
  }, [settings.defaultApprovalWorkflow, addAuditLog]);

  const updateFinancialTransactionStatus = useCallback(async (crisisId: string, transactionId: string, newStatus: FinancialTransaction['status'], actorId: string) => {
    return new Promise<void>(async (res) => {
      setAllCrises(prevCrises => prevCrises.map(crisis => {
        if (crisis.id === crisisId) {
          const updatedTransactions = crisis.financialTransactions.map(tx => {
            if (tx.id === transactionId) {
              const actorType = getMockUser(actorId) ? 'USER' : 'AGENT';
              addAuditLog(generateMockAuditLogEntry(actorId, actorType, 'UPDATE', 'FINANCIAL_TRANSACTION', transactionId, `Transaction ${transactionId} status updated to '${newStatus}'.`));
              return { ...tx, status: newStatus, signature: simulateSignature(actorId, `Update Tx ${transactionId} to ${newStatus}`) };
            }
            return tx;
          });
          return { ...crisis, financialTransactions: updatedTransactions, lastUpdate: new Date() };
        }
        return crisis;
      }));
      setCurrentCrisis(prevCurrent => {
        if (prevCurrent?.id === crisisId) {
          const updatedTransactions = prevCurrent.financialTransactions.map(tx =>
            tx.id === transactionId ? { ...tx, status: newStatus, signature: simulateSignature(actorId, `Update Tx ${transactionId} to ${newStatus}`) } : tx
          );
          return { ...prevCurrent, financialTransactions: updatedTransactions, lastUpdate: new Date() };
        }
        return prevCurrent;
      });
      res();
    });
  }, [addAuditLog]);

  const addFinancialTransactionToCrisis = useCallback(async (crisisId: string, transaction: Omit<FinancialTransaction, 'id' | 'timestamp' | 'relatedCrisisId' | 'riskScore' | 'railUsed' | 'settlementFee' | 'signature'>, selectedRailId?: string) => {
    return new Promise<void>(async (res) => {
      const riskScore = calculateRiskScore(transaction.amount, transaction.type);
      const railToUse = getMockRail(selectedRailId || settings.financialRailsConfig.defaultRail);

      if (!railToUse) {
        console.error('Invalid financial rail selected.');
        await addAuditLog(generateMockAuditLogEntry(transaction.initiatorId, 'USER', 'INITIATE', 'FINANCIAL_TRANSACTION', generateMockId('ft_temp'), `Failed to initiate transaction: Invalid rail.`));
        return res();
      }

      const initialStatus: FinancialTransaction['status'] = riskScore > settings.financialRailsConfig.riskThreshold ? 'BLOCKED' : 'PENDING';

      const newTransaction: FinancialTransaction = {
        ...transaction,
        id: generateMockId('ft'),
        timestamp: new Date(),
        relatedCrisisId: crisisId,
        riskScore,
        railUsed: railToUse.id,
        settlementFee: railToUse.costPerTransaction,
        status: initialStatus,
        signature: simulateSignature(transaction.initiatorId, `Initiate Tx ${transaction.type} ${transaction.amount} on ${railToUse.name}`)
      };

      // Simulate balance validation
      const senderAccount = mockAccountsState.find(acc => acc.ownerId === newTransaction.senderId);
      if (newTransaction.senderId && senderAccount && (senderAccount.balances[newTransaction.currency] || 0) < newTransaction.amount && newTransaction.type !== 'LOSS_RECORD') {
        newTransaction.status = 'FAILED';
        newTransaction.notes = `Failed: Insufficient funds in sender account ${senderAccount.id}.`;
        await addAuditLog(generateMockAuditLogEntry(newTransaction.initiatorId, 'USER', 'SETTLE', 'FINANCIAL_TRANSACTION', newTransaction.id, `Financial transaction FAILED (Insufficient funds): ${newTransaction.amount} ${newTransaction.currency}.`));
      } else {
        // Deduct from sender if it's not a 'TOKEN_MINT' or 'LOSS_RECORD'
        if (newTransaction.senderId && newTransaction.type !== 'TOKEN_MINT' && newTransaction.type !== 'LOSS_RECORD') {
          await updateAccountBalance(newTransaction.senderId, newTransaction.currency, -newTransaction.amount);
        }
        // Add to recipient if it's not 'TOKEN_BURN' or 'LOSS_RECORD'
        if (newTransaction.recipientId && newTransaction.type !== 'TOKEN_BURN' && newTransaction.type !== 'LOSS_RECORD') {
          await updateAccountBalance(newTransaction.recipientId, newTransaction.currency, newTransaction.amount);
        }
      }

      setCurrentCrisis(prev => {
        if (!prev || prev.id !== crisisId) return prev;
        return {
          ...prev,
          financialTransactions: [...prev.financialTransactions, newTransaction],
          lastUpdate: new Date(),
        };
      });
      setAllCrises(prev => prev.map(c => c.id === crisisId ? { ...c, financialTransactions: [...c.financialTransactions, newTransaction], lastUpdate: new Date() } : c));
      await addAuditLog(generateMockAuditLogEntry(newTransaction.initiatorId, 'USER', 'INITIATE', 'FINANCIAL_TRANSACTION', newTransaction.id, `Initiated financial transaction (${newTransaction.type}): ${newTransaction.amount} ${newTransaction.currency}. Status: ${newTransaction.status}. Rail: ${railToUse.name}. Risk: ${newTransaction.riskScore}`));
      console.log(`Financial transaction added to crisis ${crisisId}:`, newTransaction);
      res();
    });
  }, [addAuditLog, settings.financialRailsConfig, mockAccountsState, updateAccountBalance]);

  const addAgentLogEntryToCrisis = useCallback(async (crisisId: string, agentLog: Omit<AgentLogEntry, 'id' | 'timestamp' | 'crisisId'>) => {
    return new Promise<void>(async (res) => {
      const newAgentLog: AgentLogEntry = {
        ...agentLog,
        id: generateMockId('agl'),
        timestamp: new Date(),
        crisisId: crisisId,
      };
      setCurrentCrisis(prev => {
        if (!prev || prev.id !== crisisId) return prev;
        return {
          ...prev,
          agentActivityLogs: [...prev.agentActivityLogs, newAgentLog],
          lastUpdate: new Date(),
        };
      });
      setAllCrises(prev => prev.map(c => c.id === crisisId ? { ...c, agentActivityLogs: [...c.agentActivityLogs, newAgentLog], lastUpdate: new Date() } : c));
      await addAuditLog(generateMockAuditLogEntry(newAgentLog.agentId, 'AGENT', 'TRIGGER_ACTION', 'AGENT_CONFIG', newAgentLog.id, `Agent ${newAgentLog.agentId} activity: ${newAgentLog.action}. Status: ${newAgentLog.status}`));
      console.log(`Agent log added to crisis ${crisisId}:`, newAgentLog);
      res();
    });
  }, [addAuditLog]);

  const updateAgentStatus = useCallback(async (agentId: string, status: AgentStatus, isActive?: boolean) => {
    return new Promise<void>(async (res) => {
      setAllAgents(prev => prev.map(agent => agent.id === agentId ? { ...agent, status, isActive: isActive ?? agent.isActive, lastActivity: new Date() } : agent));
      await addAuditLog(generateMockAuditLogEntry(currentUser.id, 'USER', 'UPDATE', 'AGENT_CONFIG', agentId, `Agent ${agentId} status updated to '${status}'. IsActive: ${isActive}`));
      console.log(`Agent ${agentId} status updated to ${status}`);
      res();
    });
  }, [currentUser.id, addAuditLog]);

  const updateAgentConfig = useCallback(async (agentId: string, config: { [key: string]: any }) => {
    return new Promise<void>(async (res) => {
      setAllAgents(prev => prev.map(agent => agent.id === agentId ? { ...agent, configuration: config, lastActivity: new Date() } : agent));
      await addAuditLog(generateMockAuditLogEntry(currentUser.id, 'USER', 'CONFIG_UPDATE', 'AGENT_CONFIG', agentId, `Agent ${agentId} configuration updated.`));
      console.log(`Agent ${agentId} config updated:`, config);
      res();
    });
  }, [currentUser.id, addAuditLog]);

  const value = useMemo(() => ({
    currentCrisis,
    setCurrentCrisis,
    allCrises,
    setAllCrises,
    currentUser,
    setCurrentUser,
    settings,
    updateSetting,
    addIncidentLogEntry,
    updateCrisisStatus,
    addCommsPackageToCrisis,
    addLegalReviewToCrisis,
    addSentimentReportToCrisis,
    updateCommsApprovalStatus,
    addFinancialTransactionToCrisis,
    addAgentLogEntryToCrisis,
    allAgents,
    updateAgentStatus,
    updateAgentConfig,
    globalAuditLogs,
    addAuditLog,
    mockAccountsState,
    updateAccountBalance,
    mockFinancialRailsState,
  }), [
    currentCrisis, allCrises, currentUser, settings, updateSetting, addIncidentLogEntry,
    updateCrisisStatus, addCommsPackageToCrisis, addLegalReviewToCrisis, addSentimentReportToCrisis,
    updateCommsApprovalStatus, addFinancialTransactionToCrisis, addAgentLogEntryToCrisis,
    allAgents, updateAgentStatus, updateAgentConfig, globalAuditLogs, addAuditLog,
    mockAccountsState, updateAccountBalance, mockFinancialRailsState
  ]);

  return <CrisisContext.Provider value={value}>{children}</CrisisContext.Provider>;
};

/**
 * useCrisisContext: Hook
 *
 * A custom React hook that provides simplified access to the `CrisisContext`, ensuring
 * that components can easily interact with the global crisis management state.
 *
 * Business value: Promotes modularity and reduces boilerplate, accelerating development
 * of new crisis response features and maintaining a clean, scalable codebase, thereby
 * lowering maintenance costs and improving developer velocity.
 */
export const useCrisisContext = () => {
  const context = useContext(CrisisContext);
  if (context === undefined) {
    throw new Error('useCrisisContext must be used within a CrisisProvider');
  }
  return context;
};

/**
 * CrisisOverviewDashboard: React.FC
 *
 * This component provides a high-level, real-time overview of all active and historical crises,
 * offering critical insights into their status, severity, and key metrics.
 *
 * Business value: Enables executive leadership and crisis managers to gain immediate situational
 * awareness, prioritize resources effectively, and make informed strategic decisions to mitigate
 * impact on brand, customers, and financial stability, ultimately safeguarding billions in value.
 */
export const CrisisOverviewDashboard: React.FC = () => {
  const { currentCrisis, allCrises, currentUser, updateCrisisStatus, setCurrentCrisis } = useCrisisContext();
  const [filterStatus, setFilterStatus] = useState<CrisisStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCrises = useMemo(() => {
    let crises = allCrises;
    if (filterStatus !== 'ALL') {
      crises = crises.filter(c => c.status === filterStatus);
    }
    if (searchTerm) {
      crises = crises.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return crises;
  }, [allCrises, filterStatus, searchTerm]);

  const stats = useMemo(() => {
    const active = allCrises.filter(c => c.status === 'ACTIVE').length;
    const critical = allCrises.filter(c => c.severity === 'CRITICAL' && c.status !== 'CLOSED').length;
    const closed = allCrises.filter(c => c.status === 'CLOSED').length;
    const total = allCrises.length;
    return { active, critical, closed, total };
  }, [allCrises]);

  if (!currentUser) return <p className="text-red-400">Authentication required. Please log in.</p>;

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
      <h2 className="text-3xl font-bold mb-4 flex items-center">
        Crisis Management Dashboard
        {currentCrisis && (
          <span className="ml-4 text-xl text-gray-400">
            - Current: {currentCrisis.title}
            <CrisisSeverityBadge severity={currentCrisis.severity} />
          </span>
        )}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-gray-300">Total Crises</p>
          <p className="text-4xl font-bold text-cyan-400">{stats.total}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-gray-300">Active Crises</p>
          <p className="text-4xl font-bold text-red-400">{stats.active}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-gray-300">Critical Alerts</p>
          <p className="text-4xl font-bold text-orange-400">{stats.critical}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-gray-300">Closed Crises</p>
          <p className="text-4xl font-bold text-green-400">{stats.closed}</p>
        </div>
      </div>

      <div className="mb-4 flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search crises..."
          className="p-2 bg-gray-600 rounded flex-grow"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as CrisisStatus | 'ALL')}
          className="p-2 bg-gray-600 rounded"
        >
          <option value="ALL">All Statuses</option>
          {Object.values(CrisisStatus).map(status => (
            <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
          ))}
        </select>
        {currentUser.permissions.canEditCrisis && (
          <button className="p-2 bg-purple-600 hover:bg-purple-700 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Crisis
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-600">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Severity</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Update</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Lead</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredCrises.map(crisis => (
              <tr key={crisis.id} className={currentCrisis?.id === crisis.id ? 'bg-gray-800' : ''}>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-white">{crisis.title}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{crisis.type.replace(/_/g, ' ')}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <CrisisSeverityBadge severity={crisis.severity} />
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <CrisisStatusBadge status={crisis.status} />
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{crisis.lastUpdate.toLocaleString()}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  {getMockUser(crisis.leadManagerId) ? <UserAvatar user={getMockUser(crisis.leadManagerId)!} size={24} /> : 'N/A'}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => { setCurrentCrisis(crisis); }}
                    className="text-cyan-500 hover:text-cyan-700 mr-2"
                  >
                    View
                  </button>
                  {(currentUser.permissions.canEditCrisis || currentUser.role === 'CRISIS_MANAGER') && crisis.status !== 'CLOSED' && (
                    <button
                      onClick={() => updateCrisisStatus(crisis.id, 'CLOSED')}
                      className="text-green-500 hover:text-green-700"
                    >
                      Close
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3">Recent Incident Alerts</h3>
        <ul className="space-y-3">
          {currentCrisis?.relatedIncidents.slice(0, 5).map(incident => (
            <li key={incident.id} className="bg-gray-800 p-3 rounded-lg flex items-center space-x-3">
              <span className="text-sm font-semibold text-red-400">[NEW ALERT]</span>
              <span className="text-gray-300 text-sm">{incident.timestamp.toLocaleString()}</span>
              <p className="text-white flex-grow">{incident.description}</p>
              <CrisisSeverityBadge severity={incident.severity} />
            </li>
          ))}
          {!currentCrisis?.relatedIncidents.length && <p className="text-gray-400">No recent incidents for this crisis.</p>}
        </ul>
      </div>
    </div>
  );
};

/**
 * IncidentLogManager: React.FC
 *
 * This module facilitates the detailed logging and tracking of all incidents related to a crisis,
 * from initial detection to resolution. It provides a structured interface for incident responders
 * to record events, actions taken, and link relevant artifacts.
 *
 * Business value: Ensures comprehensive data capture for forensic analysis, regulatory compliance,
 * and post-crisis learning, improving future preparedness and significantly reducing legal and
 * operational risks. This component enhances accountability and traceability of all actions taken
 * during an incident, vital for demonstrating diligence to regulators and stakeholders.
 */
export const IncidentLogManager: React.FC = () => {
  const { currentCrisis, addIncidentLogEntry, currentUser } = useCrisisContext();
  const [newLogDescription, setNewLogDescription] = useState('');
  const [newLogSeverity, setNewLogSeverity] = useState<CrisisSeverity>('MEDIUM');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddLog = async () => {
    if (!currentCrisis || !newLogDescription) return;
    if (!currentUser.permissions.canAddIncidentLogs) {
      alert('Access denied: You do not have permission to add incident logs. Contact your administrator.');
      return;
    }
    setIsAdding(true);
    const newEntry: IncidentLogEntry = {
      id: generateMockId('inc'),
      timestamp: new Date(),
      description: newLogDescription,
      reportedByUserId: currentUser.id,
      severity: newLogSeverity,
      actionTaken: 'No immediate action logged.',
      status: 'OPEN',
    };
    await addIncidentLogEntry(newEntry);
    setNewLogDescription('');
    setIsAdding(false);
  };

  if (!currentCrisis) return <p className="text-gray-400">Select a crisis to manage incidents.</p>;

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
      <h2 className="text-2xl font-bold mb-4">Incident Log for {currentCrisis.title}</h2>

      {(currentUser.permissions.canAddIncidentLogs) && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Add New Incident Log Entry</h3>
          <textarea
            value={newLogDescription}
            onChange={e => setNewLogDescription(e.target.value)}
            placeholder="Describe the incident (e.g., 'Server outage in EU-central region impacting 10% of users')."
            rows={3}
            className="w-full p-2 mb-3 bg-gray-600 rounded text-white resize-y"
          />
          <div className="flex items-center space-x-3 mb-3">
            <label htmlFor="log-severity" className="text-gray-300">Severity:</label>
            <select
              id="log-severity"
              value={newLogSeverity}
              onChange={e => setNewLogSeverity(e.target.value as CrisisSeverity)}
              className="p-2 bg-gray-600 rounded"
            >
              {Object.values(CrisisSeverity).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={handleAddLog}
              disabled={isAdding || !newLogDescription}
              className="ml-auto p-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50"
            >
              {isAdding ? 'Adding...' : 'Add Log Entry'}
            </button>
          </div>
        </div>
      )}

      {currentCrisis.relatedIncidents.length === 0 ? (
        <p className="text-gray-400">No incident logs recorded for this crisis yet.</p>
      ) : (
        <div className="space-y-4">
          {currentCrisis.relatedIncidents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map(log => (
            <div key={log.id} className="bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">{log.timestamp.toLocaleString()}</span>
                <div className="flex items-center space-x-2">
                  <CrisisSeverityBadge severity={log.severity} />
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    log.status === 'OPEN' ? 'bg-red-500' : log.status === 'IN_PROGRESS' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}>{log.status.replace(/_/g, ' ')}</span>
                </div>
              </div>
              <p className="text-white text-md mb-2">{log.description}</p>
              <p className="text-gray-400 text-sm">Action Taken: {log.actionTaken}</p>
              <div className="flex items-center mt-2 text-xs text-gray-500">
                Reported by: {getMockUser(log.reportedByUserId)?.name || 'Unknown'}
                {log.relatedArtifacts && log.relatedArtifacts.length > 0 && (
                  <span className="ml-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {log.relatedArtifacts.length} Artifacts
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * StakeholderCommunicationManager: React.FC
 *
 * This component manages targeted communication strategies for diverse stakeholder groups during a crisis.
 * It allows for the identification, segmentation, and customized messaging to customers, employees,
 * investors, and regulators.
 *
 * Business value: Safeguards brand reputation and maintains trust by ensuring timely, accurate,
 * and relevant communications, preventing panic, reducing negative sentiment, and minimizing
 * long-term damage. By tailoring messages to specific audiences, it enhances the effectiveness
 * of crisis response and protects key relationships, thereby preserving market value.
 */
export const StakeholderCommunicationManager: React.FC = () => {
  const { currentCrisis, currentUser } = useCrisisContext();
  const [filterType, setFilterType] = useState<'ALL' | Stakeholder['type']>('ALL');

  const filteredStakeholders = useMemo(() => {
    if (filterType === 'ALL') {
      return mockStakeholders;
    }
    return mockStakeholders.filter(s => s.type === filterType);
  }, [filterType]);

  if (!currentCrisis) return <p className="text-gray-400">Select a crisis to manage stakeholder communications.</p>;
  if (!currentUser.permissions.canViewAll) return <p className="text-red-400">Access denied: You do not have permission to view stakeholder communications.</p>;


  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
      <h2 className="text-2xl font-bold mb-4">Stakeholder Communication for {currentCrisis.title}</h2>

      <div className="mb-4 flex items-center space-x-3">
        <label htmlFor="stakeholder-type" className="text-gray-300">Filter by Type:</label>
        <select
          id="stakeholder-type"
          value={filterType}
          onChange={e => setFilterType(e.target.value as 'ALL' | Stakeholder['type'])}
          className="p-2 bg-gray-600 rounded"
        >
          <option value="ALL">All Types</option>
          {Object.values(mockStakeholders.reduce((acc, s) => ({ ...acc, [s.type]: s.type }), {} as { [key: string]: Stakeholder['type'] })).map(type => (
            <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
          ))}
        </select>
        {(currentUser.permissions.canEditCrisis || currentUser.role === 'PR_SPECIALIST') && (
          <button className="ml-auto p-2 bg-cyan-600 hover:bg-cyan-700 rounded">Add New Stakeholder</button>
        )}
      </div>

      <div className="space-y-4">
        {filteredStakeholders.map(stakeholder => (
          <div key={stakeholder.id} className="bg-gray-800 p-4 rounded-lg shadow flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-white">{stakeholder.name} ({stakeholder.type.replace(/_/g, ' ')})</h3>
              <p className="text-gray-300">Contact: {stakeholder.contactInfo}</p>
              {stakeholder.keyMessage && <p className="text-gray-400 mt-2 italic">"{stakeholder.keyMessage}"</p>}
              <div className="mt-2 text-sm text-gray-500">
                Channels: {stakeholder.communicationChannels.join(', ')}
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold ${stakeholder.sentimentImpact < 0 ? 'text-red-400' : 'text-green-400'}`}>
                Sentiment Impact: {stakeholder.sentimentImpact > 0 ? '+' : ''}{stakeholder.sentimentImpact}
              </p>
              <p className="text-gray-400">Priority: {stakeholder.priority}</p>
              {(currentUser.permissions.canEditComms || currentUser.role === 'PR_SPECIALIST') && (
                <button className="mt-2 text-sm text-cyan-500 hover:text-cyan-700">Customize Comms</button>
              )}
            </div>
          </div>
        ))}
        {filteredStakeholders.length === 0 && <p className="text-gray-400">No stakeholders found for selected filter.</p>}
      </div>
    </div>
  );
};

/**
 * LegalReviewDashboard: React.FC
 *
 * This dashboard provides a centralized view and management interface for all legal analyses
 * pertaining to ongoing crises. It tracks potential risks, compliance requirements,
 * recommended actions, and estimated financial liabilities.
 *
 * Business value: Proactively identifies and mitigates legal exposure, ensuring adherence
 * to complex regulatory frameworks (e.g., GDPR, CCPA) and significantly reducing the risk
 * of costly fines, litigation, and sanctions. It provides legal teams with the tools to
 * manage and document compliance effectively, safeguarding the company's financial health
 * and reputation.
 */
export const LegalReviewDashboard: React.FC = () => {
  const { currentCrisis, addLegalReviewToCrisis, currentUser } = useCrisisContext();
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [newReviewSummary, setNewReviewSummary] = useState('');
  const [newReviewRisks, setNewReviewRisks] = useState(''); // Comma separated
  const [newReviewActions, setNewReviewActions] = useState(''); // Comma separated
  const [newReviewCompliance, setNewReviewCompliance] = useState(''); // Comma separated
  const [newReviewRiskLevel, setNewReviewRiskLevel] = useState<LegalRiskLevel>('MEDIUM');
  const [newSensitiveDataInvolved, setNewSensitiveDataInvolved] = useState(false);


  const handleAddReview = async () => {
    if (!currentCrisis || !newReviewSummary) return;
    if (!currentUser.permissions.canReviewLegal) {
      alert('Access denied: You do not have permission to add legal reviews. Contact your administrator.');
      return;
    }
    setIsAddingReview(true);
    const mockReview = generateMockLegalAnalysis(currentCrisis.id, currentUser.id);
    const newReview: LegalAnalysisResult = {
      ...mockReview,
      summary: newReviewSummary,
      keyRisks: newReviewRisks.split(',').map(s => s.trim()).filter(Boolean),
      recommendedActions: newReviewActions.split(',').map(s => s.trim()).filter(Boolean),
      complianceRequirements: newReviewCompliance.split(',').map(s => s.trim()).filter(Boolean),
      legalRiskLevel: newReviewRiskLevel,
      sensitiveDataInvolved: newSensitiveDataInvolved,
      analyzedByUserId: currentUser.id,
    };
    await addLegalReviewToCrisis(newReview);
    setNewReviewSummary('');
    setNewReviewRisks('');
    setNewReviewActions('');
    setNewReviewCompliance('');
    setNewReviewRiskLevel('MEDIUM');
    setNewSensitiveDataInvolved(false);
    setIsAddingReview(false);
  };

  if (!currentCrisis) return <p className="text-gray-400">Select a crisis to view legal reviews.</p>;
  if (!currentUser.permissions.canViewAll) return <p className="text-red-400">Access denied: You do not have permission to view legal reviews.</p>;


  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
      <h2 className="text-2xl font-bold mb-4">Legal Review for {currentCrisis.title}</h2>

      {(currentUser.permissions.canReviewLegal) && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Add New Legal Analysis</h3>
          <textarea
            value={newReviewSummary}
            onChange={e => setNewReviewSummary(e.target.value)}
            placeholder="Summarize the legal analysis..."
            rows={3}
            className="w-full p-2 mb-3 bg-gray-600 rounded text-white resize-y"
          />
          <input
            type="text"
            value={newReviewRisks}
            onChange={e => setNewReviewRisks(e.target.value)}
            placeholder="Key risks (comma-separated, e.g., 'GDPR fines, reputational damage')"
            className="w-full p-2 mb-3 bg-gray-600 rounded text-white"
          />
          <input
            type="text"
            value={newReviewActions}
            onChange={e => setNewReviewActions(e.target.value)}
            placeholder="Recommended actions (comma-separated, e.g., 'Engage external counsel')"
            className="w-full p-2 mb-3 bg-gray-600 rounded text-white"
          />
          <input
            type="text"
            value={newReviewCompliance}
            onChange={e => setNewReviewCompliance(e.target.value)}
            placeholder="Compliance requirements (comma-separated, e.g., 'GDPR Article 33')"
            className="w-full p-2 mb-3 bg-gray-600 rounded text-white"
          />
          <div className="flex items-center space-x-4 mb-3">
            <label htmlFor="legal-risk-level" className="text-gray-300">Risk Level:</label>
            <select
              id="legal-risk-level"
              value={newReviewRiskLevel}
              onChange={e => setNewReviewRiskLevel(e.target.value as LegalRiskLevel)}
              className="p-2 bg-gray-600 rounded"
            >
              {Object.values(LegalRiskLevel).map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <label className="inline-flex items-center text-gray-300 ml-auto">
              <input
                type="checkbox"
                checked={newSensitiveDataInvolved}
                onChange={e => setNewSensitiveDataInvolved(e.target.checked)}
                className="form-checkbox h-5 w-5 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500"
              />
              <span className="ml-2">Sensitive Data Involved</span>
            </label>
          </div>
          <button
            onClick={handleAddReview}
            disabled={isAddingReview || !newReviewSummary}
            className="w-full p-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50"
          >
            {isAddingReview ? 'Adding...' : 'Add Legal Review'}
          </button>
        </div>
      )}

      {currentCrisis.legalReviews.length === 0 ? (
        <p className="text-gray-400">No legal reviews available for this crisis yet.</p>
      ) : (
        <div className="space-y-4">
          {currentCrisis.legalReviews.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map(review => (
            <div key={review.id} className="bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">{review.timestamp.toLocaleString()}</span>
                <div className="flex items-center space-x-2">
                  <LegalRiskBadge risk={review.legalRiskLevel} />
                  {review.sensitiveDataInvolved && (
                    <span className="text-red-400 text-xs font-semibold">Sensitive Data Involved</span>
                  )}
                </div>
              </div>
              <p className="text-white text-md font-semibold mb-1">{review.summary}</p>
              {review.keyRisks.length > 0 && (
                <p className="text-gray-400 text-sm mb-1">
                  <span className="font-semibold">Key Risks:</span> {review.keyRisks.join(', ')}
                </p>
              )}
              {review.recommendedActions.length > 0 && (
                <p className="text-gray-400 text-sm mb-1">
                  <span className="font-semibold">Recommended Actions:</span> {review.recommendedActions.join(', ')}
                </p>
              )}
              {review.complianceRequirements.length > 0 && (
                <p className="text-gray-400 text-sm mb-1">
                  <span className="font-semibold">Compliance:</span> {review.complianceRequirements.join(', ')}
                </p>
              )}
              {review.potentialFinesMin && review.potentialFinesMax && (
                <p className="text-gray-400 text-sm">
                  <span className="font-semibold">Potential Fines:</span> ${review.potentialFinesMin.toLocaleString()} - ${review.potentialFinesMax.toLocaleString()}
                </p>
              )}
              <div className="flex items-center mt-2 text-xs text-gray-500">
                Analyzed by: {getMockUser(review.analyzedByUserId)?.name || getMockAgent(review.analyzedByUserId)?.name || 'Unknown'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * SentimentMonitoringDashboard: React.FC
 *
 * This component offers real-time monitoring and analysis of public and internal sentiment
 * surrounding a crisis, tracking trends, key themes, and mentions across various channels.
 *
 * Business value: Provides invaluable intelligence for public relations and marketing teams
 * to craft effective messaging, counteract misinformation, and protect brand perception,
 * directly impacting market valuation and customer loyalty. Real-time insights allow for
 * agile communication adjustments, preventing cascading negative effects and preserving
 * stakeholder trust.
 */
export const SentimentMonitoringDashboard: React.FC = () => {
  const { currentCrisis, addSentimentReportToCrisis, currentUser, settings, allAgents, addAgentLogEntryToCrisis } = useCrisisContext();
  const [isGeneratingSentiment, setIsGeneratingSentiment] = useState(false);

  const handleGenerateReport = async () => {
    if (!currentCrisis) return;
    if (!currentUser.permissions.canViewReports) {
      alert('Access denied: You do not have permission to generate sentiment reports. Contact your administrator.');
      return;
    }
    setIsGeneratingSentiment(true);
    const sentinelAgent = allAgents.find(a => a.id === 'agent_sentinel'); // Assume 'agent_sentinel' is the sentiment AI
    const generatorId = (sentinelAgent?.isActive && settings.enabledAgents.MONITORING) ? sentinelAgent.id : currentUser.id;
    const generatorType = (sentinelAgent?.isActive && settings.enabledAgents.MONITORING) ? 'AI_AGENT' : 'USER';

    if (generatorType === 'AI_AGENT' && sentinelAgent) {
      await addAgentLogEntryToCrisis(currentCrisis.id, {
        agentId: sentinelAgent.id,
        action: 'Initiated real-time sentiment analysis',
        details: `Scanning social media and news for crisis ${currentCrisis.id}`,
        status: 'IN_PROGRESS'
      });
    }

    const newReport = generateMockSentimentReport(currentCrisis.id, generatorId);
    await addSentimentReportToCrisis(newReport);

    if (generatorType === 'AI_AGENT' && sentinelAgent) {
      await addAgentLogEntryToCrisis(currentCrisis.id, {
        agentId: sentinelAgent.id,
        action: 'Completed sentiment analysis',
        details: `Overall sentiment: ${newReport.overallSentiment.toFixed(2)}`,
        status: 'SUCCESS',
        relatedArtifactId: newReport.id
      });
    }
    setIsGeneratingSentiment(false);
  };

  if (!currentCrisis) return <p className="text-gray-400">Select a crisis to view sentiment reports.</p>;
  if (!currentUser.permissions.canViewReports) return <p className="text-red-400">Access denied: You do not have permission to view sentiment reports.</p>;

  const latestReport = currentCrisis.sentimentHistory.length > 0
    ? currentCrisis.sentimentHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
    : null;

  const sentimentChartData = latestReport?.sentimentTrend
    .slice(0, 12) // Last 12 hours/data points
    .reverse()
    .map(dp => ({
      label: new Date(dp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: dp.score,
      color: dp.score >= 0.1 ? 'bg-green-500' : dp.score <= -0.1 ? 'bg-red-500' : 'bg-gray-500',
    })) || [];

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
      <h2 className="text-2xl font-bold mb-4">Sentiment Monitoring for {currentCrisis.title}</h2>

      {(currentUser.permissions.canViewReports) && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-1">Generate New Sentiment Report</h3>
            <p className="text-gray-400 text-sm">Last updated {latestReport?.timestamp.toLocaleString() || 'N/A'}</p>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={isGeneratingSentiment}
            className="p-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
          >
            {isGeneratingSentiment ? 'Analyzing...' : `Analyze Real-time Data (every ${settings.sentimentMonitorIntervalMinutes} min)`}
          </button>
        </div>
      )}

      {latestReport ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-gray-300">Overall Sentiment</p>
              <p className={`text-5xl font-bold ${latestReport.overallSentiment > 0.1 ? 'text-green-400' : latestReport.overallSentiment < -0.1 ? 'text-red-400' : 'text-gray-400'}`}>
                {latestReport.overallSentiment.toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-gray-300">Total Mentions (24h)</p>
              <p className="text-4xl font-bold text-cyan-400">
                {latestReport.sentimentTrend.reduce((sum, dp) => sum + dp.volume, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-gray-300">Key Themes</p>
              <p className="text-xl font-bold text-white">{latestReport.keyThemes.join(', ')}</p>
            </div>
          </div>

          <AnalyticsChart title="Sentiment Trend (Past 12 data points)" data={sentimentChartData} type="line" height={250} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">Top Negative Mentions</h3>
              <ul className="space-y-2 bg-gray-800 p-4 rounded-lg">
                {latestReport.topNegativeMentions.map((mention, i) => (
                  <li key={i} className="text-red-300 text-sm">"{mention}"</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Top Positive Mentions</h3>
              <ul className="space-y-2 bg-gray-800 p-4 rounded-lg">
                {latestReport.topPositiveMentions.map((mention, i) => (
                  <li key={i} className="text-green-300 text-sm">"{mention}"</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-3">Recommended PR Actions</h3>
            <ul className="space-y-2 list-disc list-inside bg-gray-800 p-4 rounded-lg">
              {latestReport.recommendedPRActions.map((action, i) => (
                <li key={i} className="text-gray-300 text-sm">{action}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="text-gray-400">No sentiment reports generated for this crisis yet. Automated agents may generate one soon.</p>
      )}
    </div>
  );
};

/**
 * CommsApprovalWorkflowPanel: React.FC
 *
 * This panel streamlines the critical, multi-stage approval process for all crisis communications,
 * ensuring that every message is reviewed and sanctioned by relevant stakeholders (e.g., legal, PR,
 * executive) before dissemination. Approvals are cryptographically signed to ensure non-repudiation.
 *
 * Business value: Enforces strict governance and compliance, preventing premature or inaccurate
 * communications that could exacerbate a crisis, leading to significant financial losses or
 * regulatory penalties. It provides an auditable, controlled environment for communication
 * sign-off, protecting brand reputation and legal standing.
 */
export const CommsApprovalWorkflowPanel: React.FC = () => {
  const { currentCrisis, currentUser, updateCommsApprovalStatus, settings } = useCrisisContext();

  if (!currentCrisis) return <p className="text-gray-400">Select a crisis to view comms approval workflow.</p>;
  if (!currentUser.permissions.canViewAll) return <p className="text-red-400">Access denied: You do not have permission to view comms approval workflow.</p>;

  const commsPackages = currentCrisis.generatedCommsPackages;

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
      <h2 className="text-2xl font-bold mb-4">Comms Approval Workflow for {currentCrisis.title}</h2>

      {commsPackages.length === 0 ? (
        <p className="text-gray-400">No communication packages generated yet for this crisis. Automated agents may draft one.</p>
      ) : (
        <div className="space-y-6">
          {commsPackages.map((commsPackage, pkgIndex) => (
            <div key={commsPackage.id} className="bg-gray-800 p-5 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3 text-cyan-400">Comms Package #{pkgIndex + 1} (ID: {commsPackage.id})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900 p-3 rounded-md">
                  <h4 className="font-medium text-gray-300 mb-1">Press Release</h4>
                  <pre className="text-sm text-gray-400 whitespace-pre-wrap max-h-40 overflow-y-auto">{commsPackage.pressRelease}</pre>
                </div>
                <div className="bg-gray-900 p-3 rounded-md">
                  <h4 className="font-medium text-gray-300 mb-1">Twitter Thread (Snippet)</h4>
                  <pre className="text-sm text-gray-400 whitespace-pre-wrap max-h-40 overflow-y-auto">{commsPackage.twitterThread[0]}...</pre>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Approval Steps:</h4>
                <div className="space-y-3">
                  {settings.defaultApprovalWorkflow.map((requiredRole, roleIndex) => {
                    const entryForRole = currentCrisis.approvalWorkflow
                      .filter(entry => entry.commsPackageId === commsPackage.id && entry.requiredRole === requiredRole)
                      .sort((a,b) => (a.reviewTimestamp?.getTime() || 0) - (b.reviewTimestamp?.getTime() || 0)) // Take the latest one if multiple for a role
                      .pop(); // Get the last entry for this role (most recent attempt)

                    const previousRoleApproved = roleIndex === 0 || currentCrisis.approvalWorkflow.some(e =>
                      e.commsPackageId === commsPackage.id && e.requiredRole === settings.defaultApprovalWorkflow[roleIndex - 1] && e.status === 'APPROVED'
                    );

                    const currentStatus = entryForRole?.status || 'DRAFT';
                    const reviewer = entryForRole?.reviewerId ? getMockUser(entryForRole.reviewerId) : null;
                    const canApprove = (currentUser.permissions.canApproveComms || currentUser.role === requiredRole) && currentStatus === 'PENDING_REVIEW' && previousRoleApproved;

                    return (
                      <div key={requiredRole} className={`flex items-center space-x-3 p-3 bg-gray-900 rounded-md ${!previousRoleApproved && roleIndex > 0 ? 'opacity-50 grayscale' : ''}`}>
                        <CommsStatusBadge status={currentStatus} />
                        <span className="text-gray-300 flex-grow">
                          {requiredRole.replace(/_/g, ' ')} Review ({reviewer?.name || 'Awaiting review'})
                        </span>
                        {currentStatus === 'PENDING_REVIEW' && canApprove && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateCommsApprovalStatus(currentCrisis.id, commsPackage.id!, entryForRole?.id || generateMockId('temp-appr'), 'APPROVED', currentUser.id)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm disabled:opacity-50"
                              disabled={!canApprove}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateCommsApprovalStatus(currentCrisis.id, commsPackage.id!, entryForRole?.id || generateMockId('temp-appr'), 'REJECTED', currentUser.id, 'Changes required.')}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm disabled:opacity-50"
                              disabled={!canApprove}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {(currentStatus === 'APPROVED' || currentStatus === 'REJECTED') && (
                          <span className="text-xs text-gray-500">
                            {currentStatus} by {reviewer?.name} at {entryForRole?.reviewTimestamp?.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * FinancialImpactAndPayoutManager: React.FC
 *
 * This component manages the tracking of financial impacts and the initiation of simulated payouts
 * or transactions related to a crisis. It provides an interface to record losses, compensation events,
 * and interact with the simulated token rail for settlement, including multi-rail routing and risk scoring.
 * Displays real-time account balances and transaction history.
 *
 * Business value: Centralizes financial operations related to crisis management, ensuring all costs
 * and compensations are accurately recorded and reconciled. By simulating token rail interactions,
 * it demonstrates the ability to execute real-time, auditable payments, reducing financial overhead
 * and enhancing transparency for regulatory and internal stakeholders. This capability is crucial
 * for managing large-scale compensation programs and demonstrating fiscal responsibility,
 * while predictive routing optimizes for cost, latency, and security.
 */
export const FinancialImpactAndPayoutManager: React.FC = () => {
  const { currentCrisis, addFinancialTransactionToCrisis, currentUser, mockAccountsState, mockFinancialRailsState, settings } = useCrisisContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [transactionType, setTransactionType] = useState<FinancialTransaction['type']>('COMPENSATION_PAYOUT');
  const [recipientId, setRecipientId] = useState('');
  const [senderId, setSenderId] = useState(''); // New field for sender
  const [notes, setNotes] = useState('');
  const [selectedRail, setSelectedRail] = useState(settings.financialRailsConfig.defaultRail);

  const handleInitiatePayout = async () => {
    if (!currentCrisis || !amount || isNaN(parseFloat(amount))) return;
    if (!currentUser.permissions.canInitiatePayments) {
      alert('Access denied: You do not have permission to initiate financial transactions. Contact your administrator.');
      return;
    }

    setIsProcessing(true);
    try {
      const transaction: Omit<FinancialTransaction, 'id' | 'timestamp' | 'relatedCrisisId' | 'riskScore' | 'railUsed' | 'settlementFee' | 'signature'> = {
        type: transactionType,
        amount: parseFloat(amount),
        currency: currency,
        status: 'PENDING',
        recipientId: recipientId || undefined,
        senderId: senderId || undefined,
        initiatorId: currentUser.id,
        notes: notes || `Payout initiated for crisis ${currentCrisis.title}`,
      };
      await addFinancialTransactionToCrisis(currentCrisis.id, transaction, selectedRail);
      setAmount('');
      setRecipientId('');
      setSenderId('');
      setNotes('');
      alert('Transaction initiated. Check logs for settlement status and audit trail.');
    } catch (error) {
      alert('Failed to initiate transaction.');
      console.error('Financial transaction error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!currentCrisis) return <p className="text-gray-400">Select a crisis to manage financial impacts.</p>;
  if (!currentUser.permissions.canViewAll) return <p className="text-red-400">Access denied: You do not have permission to view financial impacts.</p>;

  const sortedTransactions = [...currentCrisis.financialTransactions].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const companyMainAccount = mockAccountsState.find(acc => acc.id === 'account_company_main');

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
      <h2 className="text-2xl font-bold mb-4">Financial Impact & Payouts for {currentCrisis.title}</h2>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-300">Company Main Account</h3>
          <p className="text-2xl font-bold text-cyan-400">{companyMainAccount?.balances['USD']?.toLocaleString() || 'N/A'} USD</p>
          <p className="text-sm text-gray-500">Other: {companyMainAccount?.balances['EUR']?.toLocaleString() || 'N/A'} EUR</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-300">Customer Compensation Pool</h3>
          <p className="text-2xl font-bold text-green-400">{mockAccountsState.find(a => a.id === 'account_customer_comp')?.balances['USD']?.toLocaleString() || 'N/A'} USD</p>
          <p className="text-sm text-gray-500">Tokenized: {mockAccountsState.find(a => a.id === 'account_customer_comp')?.balances['STABLE_COIN_XYZ']?.toLocaleString() || 'N/A'} SCZ</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-300">Total Recorded Loss</h3>
          <p className="text-2xl font-bold text-red-400">${currentCrisis.financialTransactions.filter(tx => tx.type === 'LOSS_RECORD').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}</p>
        </div>
      </div>

      {currentUser.permissions.canInitiatePayments && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Initiate New Financial Transaction (Programmable Rail)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Amount (e.g., 1000.00)"
              className="w-full p-2 bg-gray-600 rounded text-white"
            />
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full p-2 bg-gray-600 rounded"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="STABLE_COIN_XYZ">STABLE_COIN_XYZ (Token)</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              value={senderId}
              onChange={e => setSenderId(e.target.value)}
              placeholder="Sender ID/Account (e.g., account_company_main)"
              className="w-full p-2 bg-gray-600 rounded text-white"
            />
            <input
              type="text"
              value={recipientId}
              onChange={e => setRecipientId(e.target.value)}
              placeholder="Recipient ID/Account (e.g., customer_123 or account_customer_comp)"
              className="w-full p-2 bg-gray-600 rounded text-white"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <select
              value={transactionType}
              onChange={e => setTransactionType(e.target.value as FinancialTransaction['type'])}
              className="w-full p-2 bg-gray-600 rounded"
            >
              <option value="COMPENSATION_PAYOUT">Compensation Payout</option>
              <option value="FINE_PAYMENT">Fine Payment</option>
              <option value="LOSS_RECORD">Record Loss</option>
              <option value="REFUND">Refund</option>
              <option value="RECONCILIATION">Reconciliation</option>
              <option value="TOKEN_MINT">Token Mint</option>
              <option value="TOKEN_BURN">Token Burn</option>
              <option value="TRANSFER">Transfer</option>
            </select>
            <select
              value={selectedRail}
              onChange={e => setSelectedRail(e.target.value)}
              className="w-full p-2 bg-gray-600 rounded"
            >
              {mockFinancialRailsState.map(rail => (
                <option key={rail.id} value={rail.id}>{rail.name} (Latency: {rail.latencyMs}ms, Cost: {rail.costPerTransaction} {currency})</option>
              ))}
            </select>
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notes for this transaction (optional)"
            rows={2}
            className="w-full p-2 mb-3 bg-gray-600 rounded text-white resize-y"
          />
          <button
            onClick={handleInitiatePayout}
            disabled={isProcessing || !amount || (!recipientId && transactionType !== 'TOKEN_BURN') || (!senderId && transactionType !== 'TOKEN_MINT' && transactionType !== 'LOSS_RECORD')}
            className="w-full p-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Initiate Transaction'}
          </button>
        </div>
      )}

      {currentCrisis.financialTransactions.length === 0 ? (
        <p className="text-gray-400">No financial transactions recorded for this crisis yet.</p>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-3">Transaction History</h3>
          {sortedTransactions.map(tx => (
            <div key={tx.id} className="bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">{tx.timestamp.toLocaleString()}</span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    tx.status === 'SETTLED' ? 'bg-green-500' : tx.status === 'PENDING' ? 'bg-blue-500' : tx.status === 'BLOCKED' ? 'bg-orange-500' : 'bg-red-500'
                  }`}>{tx.status}</span>
                  <span className="text-sm text-gray-400">Type: {tx.type.replace(/_/g, ' ')}</span>
                  {tx.riskScore !== undefined && <span className={`px-2 py-1 text-xs font-medium rounded-full ${tx.riskScore > settings.financialRailsConfig.riskThreshold ? 'bg-red-700' : 'bg-gray-600'}`}>Risk: {tx.riskScore}</span>}
                </div>
              </div>
              <p className="text-white text-lg font-semibold mb-1">
                {tx.amount.toLocaleString()} {tx.currency}
              </p>
              {(tx.senderId || tx.recipientId) && <p className="text-gray-400 text-sm">
                {tx.senderId ? `From: ${tx.senderId}` : ''} {tx.senderId && tx.recipientId ? ' | ' : ''} {tx.recipientId ? `To: ${tx.recipientId}` : ''}
              </p>}
              {tx.notes && <p className="text-gray-500 text-sm italic mt-1">Notes: {tx.notes}</p>}
              {tx.railUsed && <p className="text-gray-500 text-xs mt-1">Rail: {getMockRail(tx.railUsed)?.name || tx.railUsed} (Fee: {tx.settlementFee?.toFixed(2) || 'N/A'} {tx.currency})</p>}
              {tx.transactionHash && (
                <p className="text-gray-500 text-xs mt-1">Transaction Hash: <span className="font-mono text-cyan-400">{tx.transactionHash}</span></p>
              )}
              {tx.signature && (
                <p className="text-gray-500 text-xs mt-1">Signature: <span className="font-mono text-gray-400 truncate">{tx.signature}</span></p>
              )}
              <div className="flex items-center mt-2 text-xs text-gray-500">
                Initiated by: {getMockUser(tx.initiatorId)?.name || getMockAgent(tx.initiatorId)?.name || 'Unknown'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * AgentActivityMonitor: React.FC
 *
 * This component provides a real-time view of AI agent activity and logs within the context
 * of a specific crisis. It displays actions taken by agents, their status, and details,
 * offering comprehensive oversight of the Agentic Intelligence Layer.
 *
 * Business value: Offers critical transparency into AI operations, enabling human oversight
 * and validation of autonomous decisions during a crisis. This fosters trust in AI systems,
 * assists in auditing automated responses, and allows for rapid intervention if an agent
 * misbehaves or requires adjustment, protecting the enterprise from unintended AI actions
 * and demonstrating intelligent automation capabilities to stakeholders.
 */
export const AgentActivityMonitor: React.FC = () => {
  const { currentCrisis, currentUser } = useCrisisContext();

  if (!currentCrisis) return <p className="text-gray-400">Select a crisis to view agent activity.</p>;
  if (!currentUser.permissions.canViewAll && currentUser.role !== 'ANALYST') return <p className="text-red-400">Access denied: You do not have permission to view agent activity logs.</p>;

  const sortedAgentLogs = [...currentCrisis.agentActivityLogs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
      <h2 className="text-2xl font-bold mb-4">AI Agent Activity for {currentCrisis.title}</h2>

      {currentCrisis.agentActivityLogs.length === 0 ? (
        <p className="text-gray-400">No AI agent activity logs recorded for this crisis yet. Agents may initiate actions based on system events.</p>
      ) : (
        <div className="space-y-4">
          {sortedAgentLogs.map(log => {
            const agent = getMockAgent(log.agentId);
            return (
              <div key={log.id} className="bg-gray-800 p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">{log.timestamp.toLocaleString()}</span>
                  <div className="flex items-center space-x-2">
                    {agent && <UserAvatar user={agent} size={24} />}
                    <span className="text-sm font-semibold text-white">{agent?.name || log.agentId}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      log.status === 'SUCCESS' ? 'bg-green-500' : log.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-red-500'
                    }`}>{log.status}</span>
                  </div>
                </div>
                <p className="text-white text-md mb-2">{log.action}</p>
                <p className="text-gray-400 text-sm">Details: {log.details}</p>
                {log.relatedArtifactId && (
                  <p className="text-gray-500 text-xs mt-1">Related Artifact: <span className="font-mono text-cyan-400">{log.relatedArtifactId}</span></p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * GlobalAuditLogViewer: React.FC
 *
 * This component provides a comprehensive, centralized viewer for all significant
 * audit log entries across the entire crisis management system. It tracks actions
 * by both human users and autonomous AI agents, including system changes, approvals,
 * and data modifications. Each entry is cryptographically signed for tamper-evidence.
 *
 * Business value: Establishes a foundational layer of trust and accountability across the entire
 * system. This tamper-evident audit trail is indispensable for regulatory compliance (e.g., SOX, GDPR),
 * internal governance, forensic investigations, and dispute resolution, protecting the
 * enterprise from significant legal and financial repercussions and demonstrating robust
 * operational controls, a hallmark of next-generation financial infrastructure.
 */
export const GlobalAuditLogViewer: React.FC = () => {
  const { globalAuditLogs, currentUser } = useCrisisContext();
  const [filterActorType, setFilterActorType] = useState<'ALL' | AuditLogEntry['actorType']>('ALL');
  const [filterEntityType, setFilterEntityType] = useState<'ALL' | AuditLogEntry['entityType']>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = useMemo(() => {
    let logs = globalAuditLogs;
    if (filterActorType !== 'ALL') {
      logs = logs.filter(log => log.actorType === filterActorType);
    }
    if (filterEntityType !== 'ALL') {
      logs = logs.filter(log => log.entityType === filterEntityType);
    }
    if (searchTerm) {
      logs = logs.filter(log =>
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.signature && log.signature.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [globalAuditLogs, filterActorType, filterEntityType, searchTerm]);

  if (!currentUser.permissions.canViewAuditLogs) {
    return (
      <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
        <h2 className="text-2xl font-bold mb-4">Global Audit Log</h2>
        <p className="text-red-400">Access denied: You do not have permission to view audit logs. Contact your administrator.</p>
      </div>
    );
  }

  const allEntityTypes = useMemo(() => {
    const types = new Set<AuditLogEntry['entityType']>();
    globalAuditLogs.forEach(log => types.add(log.entityType));
    return Array.from(types).sort();
  }, [globalAuditLogs]);

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
      <h2 className="text-2xl font-bold mb-4">Global Audit Log</h2>

      <div className="mb-4 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search logs by description, ID, actor, or signature..."
          className="p-2 bg-gray-600 rounded flex-grow min-w-[200px]"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          value={filterActorType}
          onChange={e => setFilterActorType(e.target.value as 'ALL' | AuditLogEntry['actorType'])}
          className="p-2 bg-gray-600 rounded min-w-[120px]"
        >
          <option value="ALL">All Actors</option>
          <option value="USER">User</option>
          <option value="AGENT">AI Agent</option>
        </select>
        <select
          value={filterEntityType}
          onChange={e => setFilterEntityType(e.target.value as 'ALL' | AuditLogEntry['entityType'])}
          className="p-2 bg-gray-600 rounded min-w-[150px]"
        >
          <option value="ALL">All Entities</option>
          {allEntityTypes.map(type => (
            <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {filteredLogs.length === 0 ? (
        <p className="text-gray-400">No audit logs found matching criteria.</p>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map(log => (
            <div key={log.id} className="bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">{log.timestamp.toLocaleString()}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-600 text-white">{log.actorType}</span>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-cyan-600 text-white">{log.actionType}</span>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-600 text-white">{log.entityType.replace(/_/g, ' ')}</span>
                </div>
              </div>
              <p className="text-white text-md mb-1">{log.description}</p>
              <p className="text-gray-400 text-sm">Actor: {getMockUser(log.actorId)?.name || getMockAgent(log.actorId)?.name || log.actorId}</p>
              <p className="text-gray-400 text-sm">Entity ID: <span className="font-mono text-cyan-400">{log.entityId}</span></p>
              {log.signature && <p className="text-gray-500 text-xs mt-1">Signature: <span className="font-mono text-gray-400 break-all">{log.signature}</span></p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


/**
 * ReportingAndAnalyticsModule: React.FC
 *
 * This module delivers comprehensive analytics and reporting capabilities, summarizing crisis
 * patterns, response effectiveness, and key performance indicators. It transforms raw operational
 * data into actionable business intelligence.
 *
 * Business value: Facilitates continuous improvement in crisis preparedness and response,
 * identifies systemic vulnerabilities, and provides auditable metrics for demonstrating
 * compliance and operational excellence to boards and regulators. This drives strategic
 * decision-making and justifies investments in crisis management infrastructure.
 */
export const ReportingAndAnalyticsModule: React.FC = () => {
  const { allCrises, currentCrisis, currentUser } = useCrisisContext();

  const crisisTypeData = useMemo(() => {
    const counts = allCrises.reduce((acc, crisis) => {
      acc[crisis.type] = (acc[crisis.type] || 0) + 1;
      return acc;
    }, {} as { [key in CrisisType]?: number });

    return Object.entries(counts).map(([type, value]) => ({
      label: type.replace(/_/g, ' '),
      value: value!,
      color: ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-cyan-500'][Math.floor(Math.random() * 6)]
    }));
  }, [allCrises]);

  const crisisSeverityData = useMemo(() => {
    const counts = allCrises.reduce((acc, crisis) => {
      acc[crisis.severity] = (acc[crisis.severity] || 0) + 1;
      return acc;
    }, {} as { [key in CrisisSeverity]?: number });

    return Object.entries(counts).map(([severity, value]) => ({
      label: severity,
      value: value!,
      color: { 'LOW': 'bg-green-500', 'MEDIUM': 'bg-yellow-500', 'HIGH': 'bg-orange-500', 'CRITICAL': 'bg-red-700' }[severity as CrisisSeverity]
    }));
  }, [allCrises]);

  const commsPublishedData = useMemo(() => {
    const dailyCounts: { [date: string]: number } = {};
    allCrises.forEach(crisis => {
      crisis.approvalWorkflow.forEach(entry => {
        if (entry.status === 'APPROVED' && entry.reviewTimestamp) { // Simplified to APPROVED for published count
          const dateKey = new Date(entry.reviewTimestamp).toISOString().split('T')[0];
          dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
        }
      });
    });

    return Object.entries(dailyCounts).sort(([dateA], [dateB]) => dateA.localeCompare(dateB)).map(([date, value]) => ({
      label: new Date(date).toLocaleDateString(),
      value: value,
    }));
  }, [allCrises]);

  if (!currentUser.permissions.canViewReports) {
    return (
      <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
        <h2 className="text-2xl font-bold mb-4">Reporting and Analytics</h2>
        <p className="text-red-400">Access denied: You do not have permission to view reports and analytics. Contact your administrator.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
      <h2 className="text-2xl font-bold mb-4">Reporting and Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalyticsChart title="Crises by Type" data={crisisTypeData} type="pie" height={300} />
        <AnalyticsChart title="Crises by Severity" data={crisisSeverityData} type="bar" height={300} />
      </div>

      <div className="mt-6">
        <AnalyticsChart title="Communication Packages Approved Over Time" data={commsPublishedData} type="line" height={300} />
      </div>

      {currentCrisis && (
        <div className="mt-8 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Current Crisis ({currentCrisis.title}) Performance</h3>
          <p className="text-gray-300">
            Time from Identification to Active: {(new Date(currentCrisis.lastUpdate).getTime() - currentCrisis.identifiedAt.getTime()) / (1000 * 60 * 60)} hours.
          </p>
          <p className="text-gray-300">
            Number of Legal Reviews: {currentCrisis.legalReviews.length}
          </p>
          <p className="text-gray-300">
            Average Sentiment Score: {currentCrisis.sentimentHistory.length > 0 ? (currentCrisis.sentimentHistory.reduce((sum, s) => sum + s.overallSentiment, 0) / currentCrisis.sentimentHistory.length).toFixed(2) : 'N/A'}
          </p>
          <p className="text-gray-300">
            Total Financial Impact: ${currentCrisis.financialTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * SystemSettingsPanel: React.FC
 *
 * This component offers a robust configuration interface for core crisis management parameters,
 * including automation rules, default workflows, notification channels, communication templates,
 * AI agent enablement, and financial rail configuration.
 *
 * Business value: Empowers administrators to tailor the system to organizational needs, ensuring
 * operational efficiency, consistency, and scalability, reducing manual overhead and accelerating
 * response automation. This configurable framework ensures the system adapts to evolving business
 * and regulatory landscapes, protecting initial investment and delivering long-term value.
 */
export const SystemSettingsPanel: React.FC = () => {
  const { settings, updateSetting, currentUser, allAgents, updateAgentStatus, updateAgentConfig, mockFinancialRailsState } = useCrisisContext();

  if (!currentUser.permissions.canEditAll && currentUser.role !== 'ADMIN') {
    return (
      <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
        <h2 className="text-2xl font-bold mb-4">System Settings</h2>
        <p className="text-red-400">Access denied: You do not have permission to view or modify system settings. Contact your administrator.</p>
      </div>
    );
  }

  const handleWorkflowChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value as UserRole);
    updateSetting('defaultApprovalWorkflow', selectedOptions);
  };

  const handleAgentToggle = (agentId: string, isActive: boolean) => {
    updateAgentStatus(agentId, isActive ? 'IDLE' : 'OFFLINE', isActive);
  };

  const handleAgentConfigChange = (agentId: string, key: string, value: any) => {
    const agent = allAgents.find(a => a.id === agentId);
    if (agent) {
      const parsedValue = typeof agent.configuration[key] === 'number' ? parseFloat(value) : value;
      updateAgentConfig(agentId, { ...agent.configuration, [key]: parsedValue });
    }
  };

  const handleFinancialRailsConfigChange = (key: keyof CrisisSettings['financialRailsConfig'], value: any) => {
    updateSetting('financialRailsConfig', { ...settings.financialRailsConfig, [key]: value });
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
      <h2 className="text-2xl font-bold mb-4">System Settings</h2>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <label htmlFor="autoGenerateComms" className="text-lg text-gray-300">Auto-Generate Initial Comms</label>
          <input
            type="checkbox"
            id="autoGenerateComms"
            checked={settings.autoGenerateComms}
            onChange={e => updateSetting('autoGenerateComms', e.target.checked)}
            className="form-checkbox h-5 w-5 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500"
          />
        </div>

        <div className="p-3 bg-gray-800 rounded-lg">
          <label htmlFor="sentimentMonitorInterval" className="block text-lg text-gray-300 mb-2">Sentiment Monitor Interval (minutes)</label>
          <input
            type="number"
            id="sentimentMonitorInterval"
            value={settings.sentimentMonitorIntervalMinutes}
            onChange={e => updateSetting('sentimentMonitorIntervalMinutes', parseInt(e.target.value) || 0)}
            min="5"
            max="1440"
            className="w-full p-2 bg-gray-600 rounded text-white"
          />
        </div>

        <div className="p-3 bg-gray-800 rounded-lg">
          <label htmlFor="defaultApprovalWorkflow" className="block text-lg text-gray-300 mb-2">Default Comms Approval Workflow</label>
          <select
            id="defaultApprovalWorkflow"
            multiple
            value={settings.defaultApprovalWorkflow}
            onChange={handleWorkflowChange}
            className="w-full p-2 bg-gray-600 rounded text-white min-h-[150px]"
            size={5}
          >
            {Object.values(UserRole).filter(role => role !== 'AI_AGENT').map(role => (
              <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <p className="text-sm text-gray-400 mt-2">Select roles in the order they should approve communications.</p>
        </div>

        <div className="p-3 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Notification Channels</h3>
          <div className="flex flex-wrap gap-4">
            {['email', 'slack', 'sms', 'teams'].map(channel => (
              <label key={channel} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notificationChannels.includes(channel)}
                  onChange={e => {
                    const newChannels = e.target.checked
                      ? [...settings.notificationChannels, channel]
                      : settings.notificationChannels.filter(c => c !== channel);
                    updateSetting('notificationChannels', newChannels);
                  }}
                  className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500"
                />
                <span className="ml-2 text-gray-300">{channel.charAt(0).toUpperCase() + channel.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-3 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Default Comms Templates</h3>
          <p className="text-gray-400 mb-4">Customize boilerplate for specific crisis types.</p>
          {Object.values(CrisisType).map(type => (
            <div key={type} className="mb-4">
              <h4 className="font-semibold text-gray-200">{type.replace(/_/g, ' ')} Template</h4>
              <textarea
                value={settings.defaultTemplates[type]?.pressRelease || ''}
                onChange={e => updateSetting('defaultTemplates', { ...settings.defaultTemplates, [type]: { ...settings.defaultTemplates[type], pressRelease: e.target.value } })}
                placeholder={`Default Press Release for ${type.replace(/_/g, ' ')}...`}
                rows={2}
                className="w-full p-2 mt-1 bg-gray-600 rounded text-white resize-y"
              />
            </div>
          ))}
        </div>

        <div className="p-3 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Financial Rails Configuration</h3>
          <div className="mb-3">
            <label htmlFor="defaultFinancialRail" className="block text-lg text-gray-300 mb-2">Default Settlement Rail</label>
            <select
              id="defaultFinancialRail"
              value={settings.financialRailsConfig.defaultRail}
              onChange={e => handleFinancialRailsConfigChange('defaultRail', e.target.value)}
              className="w-full p-2 bg-gray-600 rounded text-white"
            >
              {mockFinancialRailsState.map(rail => (
                <option key={rail.id} value={rail.id}>{rail.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="financialRiskThreshold" className="block text-lg text-gray-300 mb-2">Transaction Risk Threshold (0-100)</label>
            <input
              type="number"
              id="financialRiskThreshold"
              value={settings.financialRailsConfig.riskThreshold}
              onChange={e => handleFinancialRailsConfigChange('riskThreshold', parseInt(e.target.value) || 0)}
              min="0"
              max="100"
              className="w-full p-2 bg-gray-600 rounded text-white"
            />
            <p className="text-sm text-gray-400 mt-1">Transactions with a risk score above this threshold will be flagged or blocked.</p>
          </div>
        </div>

        {currentUser.permissions.canManageAgents && (
          <div className="p-3 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Autonomous AI Agent Configuration</h3>
            <p className="text-gray-400 mb-4">Manage and configure AI agents for automated crisis response and governance.</p>
            <div className="space-y-4">
              {allAgents.map(agent => (
                <div key={agent.id} className="p-3 bg-gray-900 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <input
                      type="checkbox"
                      checked={agent.isActive}
                      onChange={e => handleAgentToggle(agent.id, e.target.checked)}
                      className="form-checkbox h-5 w-5 text-cyan-600 bg-gray-700 border-gray-500 rounded focus:ring-cyan-500 mr-3"
                    />
                    <span className="text-lg text-gray-300 font-semibold">{agent.name} ({agent.type.replace(/_/g, ' ')})</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400 ml-8 sm:ml-0">
                    <span className={`px-2 py-1 rounded-full ${agent.status === 'ACTIVE' ? 'bg-green-600' : agent.status === 'IDLE' ? 'bg-blue-600' : agent.status === 'BUSY' ? 'bg-yellow-600' : 'bg-red-600'} text-white`}>{agent.status}</span>
                    <span className="text-gray-500">Last Activity: {agent.lastActivity.toLocaleString()}</span>
                  </div>
                  <div className="w-full sm:w-auto mt-3 sm:mt-0">
                    {Object.entries(agent.configuration).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-end text-sm mt-1">
                        <label className="text-gray-400 mr-2">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</label>
                        {typeof value === 'boolean' ? (
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={e => handleAgentConfigChange(agent.id, key, e.target.checked)}
                            className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-500 rounded focus:ring-cyan-500"
                          />
                        ) : typeof value === 'number' ? (
                          <input
                            type="number"
                            value={value}
                            onChange={e => handleAgentConfigChange(agent.id, key, parseFloat(e.target.value))}
                            className="p-1 w-24 bg-gray-700 rounded text-white"
                          />
                        ) : (
                          <input
                            type="text"
                            value={value}
                            onChange={e => handleAgentConfigChange(agent.id, key, e.target.value)}
                            className="p-1 w-32 bg-gray-700 rounded text-white"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * UserManagementPanel: React.FC
 *
 * This panel provides a secure and centralized interface for administering user accounts,
 * roles, and permissions within the crisis management system, forming a key component of the
 * Digital Identity and Trust Layer.
 *
 * Business value: Ensures granular control over access to sensitive information and critical
 * functions, enforcing strict security protocols and compliance with internal and external
 * governance requirements, safeguarding proprietary data and operational integrity.
 * Streamlined user management reduces administrative overhead and enhances system security,
 * directly protecting enterprise assets and reputation.
 */
export const UserManagementPanel: React.FC = () => {
  const { currentUser, setCurrentUser, addAuditLog } = useCrisisContext();
  const [users, setUsers] = useState<UserProfile[]>(mockUsers);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const handleSaveUser = (updatedUser: UserProfile) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (updatedUser.id === currentUser.id) {
      setCurrentUser(updatedUser); // Update current user if self-editing
    }
    addAuditLog(generateMockAuditLogEntry(currentUser.id, 'USER', 'UPDATE', 'USER', updatedUser.id, `User '${updatedUser.name}' profile updated.`));
    setEditingUser(null);
    console.log('User saved:', updatedUser);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      addAuditLog(generateMockAuditLogEntry(currentUser.id, 'USER', 'DELETE', 'USER', userId, `User with ID '${userId}' deleted.`));
      console.log('User deleted:', userId);
    }
  };

  const handleAddUser = (newUser: Omit<UserProfile, 'id' | 'lastLogin'>) => {
    const userWithId: UserProfile = {
      ...newUser,
      id: generateMockId('user'),
      lastLogin: new Date(),
      publicKey: generateMockCryptoKey(), // Assign a public key for digital identity
    };
    setUsers(prev => [...prev, userWithId]);
    addAuditLog(generateMockAuditLogEntry(currentUser.id, 'USER', 'CREATE', 'USER', userWithId.id, `New user '${userWithId.name}' created with role '${userWithId.role}'.`));
    setShowAddUserModal(false);
    console.log('User added:', userWithId);
  };

  if (!currentUser.permissions.canManageUsers) {
    return (
      <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
        <h2 className="text-2xl font-bold mb-4">User Management</h2>
        <p className="text-red-400">Access denied: You do not have permission to manage users. Contact your administrator.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAddUserModal(true)}
          className="p-2 bg-purple-600 hover:bg-purple-700 rounded"
        >
          Add New User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-600">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Login</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-white">{user.name}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{user.role.replace(/_/g, ' ')}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{user.lastLogin.toLocaleString()}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => setEditingUser(user)} className="text-cyan-500 hover:text-cyan-700 mr-2">Edit</button>
                  {user.id !== currentUser.id && ( // Prevent deleting self
                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700">Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onSave={handleSaveUser}
          onClose={() => setEditingUser(null)}
        />
      )}
      {showAddUserModal && (
        <AddUserModal
          onAdd={handleAddUser}
          onClose={() => setShowAddUserModal(false)}
        />
      )}
    </div>
  );
};

/**
 * EditUserModal: React.FC
 *
 * This modal component provides a streamlined interface for modifying existing user profiles,
 * including their name, email, role, department, activity status, and granular permissions.
 *
 * Business value: Simplifies user lifecycle management, reduces administrative burden, and
 * enhances system security by ensuring accurate and appropriate access controls are maintained
 * consistently. This minimizes human error in permission assignment, a critical factor for
 * compliance and data protection.
 */
export const EditUserModal: React.FC<{ user: UserProfile; onSave: (user: UserProfile) => void; onClose: () => void }> = ({ user, onSave, onClose }) => {
  const [editedUser, setEditedUser] = useState(user);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePermissionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setEditedUser(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [name]: checked,
      },
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-lg">
        <h3 className="text-2xl font-bold mb-4">Edit User: {user.name}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Name</label>
            <input type="text" name="name" value={editedUser.name} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Email</label>
            <input type="email" name="email" value={editedUser.email} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Role</label>
            <select name="role" value={editedUser.role} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white">
              {Object.values(UserRole).filter(role => role !== 'AI_AGENT').map(role => ( // Exclude AI_AGENT role for human users
                <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Department</label>
            <input type="text" name="department" value={editedUser.department} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white" />
          </div>
          <div className="flex items-center">
            <input type="checkbox" name="isActive" checked={editedUser.isActive} onChange={handleChange} className="form-checkbox h-5 w-5 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500" />
            <label className="ml-2 text-gray-300">Active</label>
          </div>
          <div className="border-t border-gray-700 pt-3">
            <h4 className="text-lg font-semibold text-gray-300 mb-2">Permissions</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(user.permissions).map(perm => (
                <label key={perm} className="inline-flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    name={perm}
                    checked={editedUser.permissions[perm] || false}
                    onChange={handlePermissionsChange}
                    className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500"
                  />
                  <span className="ml-2 text-sm">{perm.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white">Cancel</button>
          <button onClick={() => onSave(editedUser)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

/**
 * AddUserModal: React.FC
 *
 * This modal component provides a streamlined interface for creating new user profiles,
 * allowing assignment of name, email, department, activity status, and an initial role
 * with default permissions. It also assigns a cryptographic public key for digital identity.
 *
 * Business value: Simplifies user lifecycle management, reduces administrative burden,
 * and enhances system security by ensuring accurate and appropriate access controls
 * are maintained consistently. This minimizes human error in permission assignment,
 * a critical factor for compliance and data protection.
 */
export const AddUserModal: React.FC<{ onAdd: (user: Omit<UserProfile, 'id' | 'lastLogin'>) => void; onClose: () => void }> = ({ onAdd, onClose }) => {
  const [newUser, setNewUser] = useState<Omit<UserProfile, 'id' | 'lastLogin'>>({
    name: '',
    email: '',
    role: 'VIEWER',
    isActive: true,
    department: '',
    permissions: {
      canViewAll: true, canEditCrisis: false, canGenerateComms: false, canReviewLegal: false,
      canReviewComms: false, canApproveComms: false, canAddIncidentLogs: false,
      canViewReports: false, canManageUsers: false, canEditAll: false, canInitiateReview: false,
      canManageAgents: false, canInitiatePayments: false, canViewAuditLogs: false,
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePermissionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNewUser(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [name]: checked,
      },
    }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value as UserRole;
    let defaultPermissions: UserProfile['permissions'] = {
      canViewAll: true, canEditCrisis: false, canGenerateComms: false, canReviewLegal: false,
      canReviewComms: false, canApproveComms: false, canAddIncidentLogs: false,
      canViewReports: false, canManageUsers: false, canEditAll: false, canInitiateReview: false,
      canManageAgents: false, canInitiatePayments: false, canViewAuditLogs: false,
    };

    switch (selectedRole) {
      case 'ADMIN':
        defaultPermissions = { ...defaultPermissions, canEditAll: true, canManageUsers: true, canApproveComms: true, canReviewLegal: true, canReviewComms: true, canGenerateComms: true, canEditCrisis: true, canAddIncidentLogs: true, canViewReports: true, canInitiateReview: true, canManageAgents: true, canInitiatePayments: true, canViewAuditLogs: true };
        break;
      case 'CRISIS_MANAGER':
        defaultPermissions = { ...defaultPermissions, canEditCrisis: true, canGenerateComms: true, canInitiateReview: true, canViewReports: true, canViewAll: true, canAddIncidentLogs: true };
        break;
      case 'LEGAL_COUNSEL':
        defaultPermissions = { ...defaultPermissions, canReviewLegal: true, canApproveComms: true, canViewAll: true, canViewAuditLogs: true };
        break;
      case 'PR_SPECIALIST':
        defaultPermissions = { ...defaultPermissions, canReviewComms: true, canGenerateComms: true, canViewReports: true, canViewAll: true };
        break;
      case 'SUPPORT_MANAGER':
        defaultPermissions = { ...defaultPermissions, canViewAll: true, canAddIncidentLogs: true };
        break;
      case 'EXECUTIVE':
        defaultPermissions = { ...defaultPermissions, canApproveComms: true, canViewAll: true, canViewReports: true, canViewAuditLogs: true, canInitiatePayments: true };
        break;
      case 'INCIDENT_RESPONDER':
        defaultPermissions = { ...defaultPermissions, canAddIncidentLogs: true, canViewAll: true };
        break;
      case 'ANALYST':
        defaultPermissions = { ...defaultPermissions, canViewReports: true, canViewAll: true };
        break;
      case 'EDITOR':
        defaultPermissions = { ...defaultPermissions, canGenerateComms: true, canReviewComms: true, canViewAll: true };
        break;
      case 'VIEWER':
      defaultPermissions = { ...defaultPermissions, canViewAll: true };
      break;
    }
    setNewUser(prev => ({ ...prev, role: selectedRole, permissions: defaultPermissions }));
  };

  const isDisabled = !newUser.name || !newUser.email || !newUser.department;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-lg">
        <h3 className="text-2xl font-bold mb-4">Add New User</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Name</label>
            <input type="text" name="name" value={newUser.name} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Email</label>
            <input type="email" name="email" value={newUser.email} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Role</label>
            <select name="role" value={newUser.role} onChange={handleRoleChange} className="w-full p-2 bg-gray-700 rounded text-white">
              {Object.values(UserRole).filter(role => role !== 'AI_AGENT').map(role => (
                <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Department</label>
            <input type="text" name="department" value={newUser.department} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white" />
          </div>
          <div className="flex items-center">
            <input type="checkbox" name="isActive" checked={newUser.isActive} onChange={handleChange} className="form-checkbox h-5 w-5 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500" />
            <label className="ml-2 text-gray-300">Active</label>
          </div>
          <div className="border-t border-gray-700 pt-3">
            <h4 className="text-lg font-semibold text-gray-300 mb-2">Permissions</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(newUser.permissions).map(perm => (
                <label key={perm} className="inline-flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    name={perm}
                    checked={newUser.permissions[perm] || false}
                    onChange={handlePermissionsChange}
                    className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500"
                  />
                  <span className="ml-2 text-sm">{perm.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white">Cancel</button>
          <button onClick={() => onAdd(newUser)} disabled={isDisabled} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white disabled:opacity-50">Add User</button>
        </div>
      </div>
    </div>
  );
};

/**
 * CrisisAIManagerView: React.FC
 *
 * This is the main view component for the Crisis AI Management System, serving as the
 * orchestrator for all child components and interactions. It provides the top-level
 * navigation, crisis selection, and core AI-driven communication generation capabilities.
 *
 * Business value: This unified interface is the command center for all crisis response
 * operations, streamlining workflows and enabling rapid, informed decision-making. By
 * integrating AI capabilities, it reduces human error, accelerates critical tasks like
 * communication drafting and sentiment analysis, and ensures consistent application
 * of best practices, safeguarding brand reputation and significantly mitigating
 * financial and legal risks.
 */
const CrisisAIManagerView: React.FC = () => {
  const { currentCrisis, setCurrentCrisis, allCrises, currentUser, addCommsPackageToCrisis, settings, addAgentLogEntryToCrisis, allAgents } = useCrisisContext();

  const [crisisType, setCrisisType] = useState<CrisisType>(currentCrisis?.type || 'DATA_BREACH');
  const [facts, setFacts] = useState(currentCrisis?.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const [commsResult, setCommsResult] = useState<CommsPackage | null>(null);
  const [activeTab, setActiveTab] = useState<'comms' | 'dashboard' | 'incidents' | 'stakeholders' | 'legal' | 'sentiment' | 'workflow' | 'financial' | 'agent-activity' | 'reports' | 'settings' | 'users' | 'audit'>('dashboard');

  useEffect(() => {
    if (currentCrisis) {
      setCrisisType(currentCrisis.type);
      setFacts(currentCrisis.description);
      if (currentCrisis.generatedCommsPackages.length > 0) {
        setCommsResult(currentCrisis.generatedCommsPackages[currentCrisis.generatedCommsPackages.length - 1]);
      } else {
        setCommsResult(null);
      }
    } else {
      setCrisisType('DATA_BREACH');
      setFacts('');
      setCommsResult(null);
    }
  }, [currentCrisis]);

  const handleGenerateComms = async () => {
    if (!currentCrisis) {
      alert('Please select or create a crisis first.');
      return;
    }
    if (!currentUser.permissions.canGenerateComms) {
      alert('Access denied: You do not have permission to generate communications. Contact your administrator.');
      return;
    }
    setIsLoading(true);
    setCommsResult(null);

    const commsGenAgent = allAgents.find(a => a.id === 'agent_comms_gen'); // Assume 'agent_comms_gen' is the comms AI
    const generatorId = (commsGenAgent?.isActive && settings.enabledAgents.COMMUNICATION) ? commsGenAgent.id : currentUser.id;
    const generatorType = (commsGenAgent?.isActive && settings.enabledAgents.COMMUNICATION) ? 'AI_AGENT' : 'USER';

    if (generatorType === 'AI_AGENT' && commsGenAgent) {
      await addAgentLogEntryToCrisis(currentCrisis.id, {
        agentId: commsGenAgent.id,
        action: 'Initiated comms package generation',
        details: `Drafting for crisis type: ${crisisType}`,
        status: 'IN_PROGRESS'
      });
    }

    const response: CommsPackage = await new Promise(res => setTimeout(() => res(generateMockCommsPackage(crisisType, facts)), 2000));
    setCommsResult(response);
    await addCommsPackageToCrisis(currentCrisis.id, response);

    if (generatorType === 'AI_AGENT' && commsGenAgent) {
      await addAgentLogEntryToCrisis(currentCrisis.id, {
        agentId: commsGenAgent.id,
        action: 'Completed comms package generation',
        details: `Generated press release and twitter thread.`,
        status: 'SUCCESS',
        relatedArtifactId: response.id // Assuming addCommsPackageToCrisis returns the ID
      });
    }
    setIsLoading(false);
  };

  const handleSaveCrisisDetails = async () => {
    if (!currentCrisis) return;
    if (!currentUser.permissions.canEditCrisis) {
      alert('Access denied: You do not have permission to edit crisis details. Contact your administrator.');
      return;
    }
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 1000));
    setCurrentCrisis(prev => prev ? { ...prev, type: crisisType, description: facts, lastUpdate: new Date() } : null);
    setIsLoading(false);
    alert('Crisis details updated!');
  };

  // Initial user selection logic moved outside CrisisProvider to avoid rendering issues
  // with useContext before provider is ready. This is a common pattern for initial auth/user setup.
  if (!currentUser.id) {
    return (
      <div className="bg-gray-800 text-white p-6 rounded-lg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Select User Role</h1>
          <select
            value={''}
            onChange={e => setCurrentUser(mockUsers.find(u => u.id === e.target.value)!)} // Access setCurrentUser directly from context (this is within CrisisProvider now)
            className="w-full max-w-xs p-2 mb-4 bg-gray-700 rounded"
          >
            <option value="" disabled>Select a user...</option>
            {mockUsers.map(user => (
              <option key={user.id} value={user.id}>{user.name} ({user.role.replace(/_/g, ' ')})</option>
            ))}
          </select>
          <p>Please select a user to proceed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold">Crisis AI Management System</h1>
        <div className="flex items-center space-x-3">
          <span className="text-gray-400">Logged in as:</span>
          <UserAvatar user={currentUser} />
          <span className="font-semibold">{currentUser.name} ({currentUser.role.replace(/_/g, ' ')})</span>
        </div>
      </div>

      <div className="flex mb-6 space-x-2">
        <select
          value={currentCrisis?.id || ''}
          onChange={e => setCurrentCrisis(allCrises.find(c => c.id === e.target.value) || null)}
          className="p-2 bg-gray-700 rounded text-white flex-grow"
        >
          <option value="">Select or Create Crisis</option>
          {allCrises.map(crisis => (
            <option key={crisis.id} value={crisis.id}>
              {crisis.title} - {crisis.status.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        {currentUser.permissions.canEditCrisis && (
          <button className="p-2 bg-teal-600 hover:bg-teal-700 rounded">New Crisis</button>
        )}
      </div>

      <div className="flex mb-6 border-b border-gray-700 overflow-x-auto">
        {['dashboard', 'comms', 'incidents', 'stakeholders', 'legal', 'sentiment', 'workflow', 'financial', 'agent-activity', 'reports', 'settings', 'users', 'audit'].map(tab => (
          <button
            key={tab}
            className={`py-2 px-4 whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="flex-grow">
        {activeTab === 'dashboard' && <CrisisOverviewDashboard />}

        {activeTab === 'comms' && (
          <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
            <h2 className="text-2xl font-bold mb-4">Crisis AI Communications Manager</h2>
            {currentUser.permissions.canGenerateComms ? (
              <>
                <select value={crisisType} onChange={e => setCrisisType(e.target.value as CrisisType)} className="w-full p-2 mb-4 bg-gray-600 rounded">
                  {Object.values(CrisisType).map(type => (
                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                <textarea
                  value={facts}
                  onChange={e => setFacts(e.target.value)}
                  placeholder="Enter key facts (e.g., '50k user emails exposed, no passwords. Discovered 8am today.')"
                  rows={4}
                  className="w-full p-2 mb-4 bg-gray-600 rounded text-white resize-y"
                />
                <div className="flex space-x-4 mb-4">
                  <button onClick={handleGenerateComms} disabled={isLoading || !currentCrisis} className="flex-grow p-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50">
                    {isLoading ? 'Generating...' : 'Generate Unified Comms Package'}
                  </button>
                  <button onClick={handleSaveCrisisDetails} disabled={isLoading || !currentCrisis} className="flex-grow p-2 bg-yellow-600 hover:bg-yellow-700 rounded disabled:opacity-50">
                    {isLoading ? 'Saving...' : 'Save Crisis Details'}
                  </button>
                </div>

                {isLoading && <p className="mt-4 text-cyan-300">Analyzing legal precedent and sentiment... drafting response...</p>}
                {commsResult && (
                  <div className="mt-6 border-t border-gray-600 pt-4">
                    <h3 className="text-xl font-semibold mb-3">Latest Generated Communications Package</h3>
                    {Object.entries(commsResult).map(([key, value]) => (
                      <div key={key} className="mb-4">
                        <h4 className="text-lg font-semibold mb-1 text-gray-300">{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</h4>
                        <div className="bg-gray-800 p-4 rounded-lg shadow-inner">
                          {Array.isArray(value) ? value.map((v, i) => <pre key={i} className="whitespace-pre-wrap text-sm text-gray-200 mb-1">{v}</pre>) : <pre className="whitespace-pre-wrap text-sm text-gray-200">{value as string}</pre>}
                        </div>
                      </div>
                    ))}
                    <button className="w-full p-2 mt-4 bg-purple-600 hover:bg-purple-700 rounded" onClick={() => setActiveTab('workflow')}>Proceed to Approval Workflow</button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-red-400">Access denied: You do not have permission to generate communications.</p>
            )}
          </div>
        )}

        {activeTab === 'incidents' && <IncidentLogManager />}
        {activeTab === 'stakeholders' && <StakeholderCommunicationManager />}
        {activeTab === 'legal' && <LegalReviewDashboard />}
        {activeTab === 'sentiment' && <SentimentMonitoringDashboard />}
        {activeTab === 'workflow' && <CommsApprovalWorkflowPanel />}
        {activeTab === 'financial' && <FinancialImpactAndPayoutManager />}
        {activeTab === 'agent-activity' && <AgentActivityMonitor />}
        {activeTab === 'reports' && <ReportingAndAnalyticsModule />}
        {activeTab === 'settings' && <SystemSettingsPanel />}
        {activeTab === 'users' && <UserManagementPanel />}
        {activeTab === 'audit' && <GlobalAuditLogViewer />}
      </div>
    </div>
  );
};

export default CrisisAIManagerView;